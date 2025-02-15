import { Flex } from '@chakra-ui/react';
import { useForm } from '@mantine/form';
import { useAppDispatch } from 'app/store/storeHooks';
import IAIButton from 'common/components/IAIButton';
import IAIMantineTextInput from 'common/components/IAIMantineInput';
import IAISimpleCheckbox from 'common/components/IAISimpleCheckbox';
import { addToast } from 'features/system/store/systemSlice';
import { makeToast } from 'features/system/util/makeToast';
import { FocusEventHandler, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddMainModelsMutation } from 'services/api/endpoints/models';
import { CheckpointModelConfig } from 'services/api/types';
import { setAdvancedAddScanModel } from 'features/modelManager/store/modelManagerSlice';
import BaseModelSelect from 'features/modelManager/subpanels/shared/BaseModelSelect';
import CheckpointConfigsSelect from 'features/modelManager/subpanels/shared/CheckpointConfigsSelect';
import ModelVariantSelect from 'features/modelManager/subpanels/shared/ModelVariantSelect';
import { getModelName } from './util';

type AdvancedAddCheckpointProps = {
  model_path?: string;
};

export default function AdvancedAddCheckpoint(
  props: AdvancedAddCheckpointProps
) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { model_path } = props;

  const advancedAddCheckpointForm = useForm<CheckpointModelConfig>({
    initialValues: {
      model_name: model_path ? getModelName(model_path) : '',
      base_model: 'sd-1',
      model_type: 'main',
      path: model_path ? model_path : '',
      description: '',
      model_format: 'checkpoint',
      error: undefined,
      vae: '',
      variant: 'normal',
      config: 'configs\\stable-diffusion\\v1-inference.yaml',
    },
  });

  const [addMainModel] = useAddMainModelsMutation();

  const [useCustomConfig, setUseCustomConfig] = useState<boolean>(false);

  const advancedAddCheckpointFormHandler = (values: CheckpointModelConfig) => {
    addMainModel({
      body: values,
    })
      .unwrap()
      .then((_) => {
        dispatch(
          addToast(
            makeToast({
              title: t('modelManager.modelAdded', {
                modelName: values.model_name,
              }),
              status: 'success',
            })
          )
        );
        advancedAddCheckpointForm.reset();

        // Close Advanced Panel in Scan Models tab
        if (model_path) {
          dispatch(setAdvancedAddScanModel(null));
        }
      })
      .catch((error) => {
        if (error) {
          dispatch(
            addToast(
              makeToast({
                title: t('toast.modelAddFailed'),
                status: 'error',
              })
            )
          );
        }
      });
  };

  const handleBlurModelLocation: FocusEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        if (advancedAddCheckpointForm.values['model_name'] === '') {
          const modelName = getModelName(e.currentTarget.value);
          if (modelName) {
            advancedAddCheckpointForm.setFieldValue(
              'model_name',
              modelName as string
            );
          }
        }
      },
      [advancedAddCheckpointForm]
    );

  const handleChangeUseCustomConfig = useCallback(
    () => setUseCustomConfig((prev) => !prev),
    []
  );

  return (
    <form
      onSubmit={advancedAddCheckpointForm.onSubmit((v) =>
        advancedAddCheckpointFormHandler(v)
      )}
      style={{ width: '100%' }}
    >
      <Flex flexDirection="column" gap={2}>
        <IAIMantineTextInput
          label={t('modelManager.model')}
          required
          {...advancedAddCheckpointForm.getInputProps('model_name')}
        />
        <BaseModelSelect
          label={t('modelManager.baseModel')}
          {...advancedAddCheckpointForm.getInputProps('base_model')}
        />
        <IAIMantineTextInput
          label={t('modelManager.modelLocation')}
          required
          {...advancedAddCheckpointForm.getInputProps('path')}
          onBlur={handleBlurModelLocation}
        />
        <IAIMantineTextInput
          label={t('modelManager.description')}
          {...advancedAddCheckpointForm.getInputProps('description')}
        />
        <IAIMantineTextInput
          label={t('modelManager.vaeLocation')}
          {...advancedAddCheckpointForm.getInputProps('vae')}
        />
        <ModelVariantSelect
          label={t('modelManager.variant')}
          {...advancedAddCheckpointForm.getInputProps('variant')}
        />
        <Flex flexDirection="column" width="100%" gap={2}>
          {!useCustomConfig ? (
            <CheckpointConfigsSelect
              required
              width="100%"
              {...advancedAddCheckpointForm.getInputProps('config')}
            />
          ) : (
            <IAIMantineTextInput
              required
              label={t('modelManager.customConfigFileLocation')}
              {...advancedAddCheckpointForm.getInputProps('config')}
            />
          )}
          <IAISimpleCheckbox
            isChecked={useCustomConfig}
            onChange={handleChangeUseCustomConfig}
            label={t('modelManager.useCustomConfig')}
          />
          <IAIButton mt={2} type="submit">
            {t('modelManager.addModel')}
          </IAIButton>
        </Flex>
      </Flex>
    </form>
  );
}
