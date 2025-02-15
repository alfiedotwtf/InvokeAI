import { useAppDispatch } from 'app/store/storeHooks';
import IAIInput from 'common/components/IAIInput';
import IAITextarea from 'common/components/IAITextarea';
import { fieldStringValueChanged } from 'features/nodes/store/nodesSlice';
import {
  StringFieldInputInstance,
  StringFieldInputTemplate,
} from 'features/nodes/types/field';
import { FieldComponentProps } from './types';
import { ChangeEvent, memo, useCallback } from 'react';

const StringFieldInputComponent = (
  props: FieldComponentProps<StringFieldInputInstance, StringFieldInputTemplate>
) => {
  const { nodeId, field, fieldTemplate } = props;
  const dispatch = useAppDispatch();

  const handleValueChanged = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      dispatch(
        fieldStringValueChanged({
          nodeId,
          fieldName: field.name,
          value: e.target.value,
        })
      );
    },
    [dispatch, field.name, nodeId]
  );

  if (fieldTemplate.ui_component === 'textarea') {
    return (
      <IAITextarea
        className="nodrag"
        onChange={handleValueChanged}
        value={field.value}
        rows={5}
        resize="none"
      />
    );
  }

  return <IAIInput onChange={handleValueChanged} value={field.value} />;
};

export default memo(StringFieldInputComponent);
