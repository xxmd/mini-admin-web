import {useCallback, useState} from 'react';
import {Form, message} from 'antd';

interface CrudModalOptions<F extends {id?: number}> {
    create: (data: F) => Promise<void>;
    update: (data: F) => Promise<void>;
    onSuccess?: () => void;
    transform?: (values: F) => F;
}

export function useCrudModal<F extends {id?: number}>({create, update, onSuccess, transform}: CrudModalOptions<F>) {
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm<F>();

    const openCreate = useCallback((initial?: Partial<F>) => {
        form.resetFields();
        if (initial) {
            form.setFieldsValue(initial as F);
        }
        setModalOpen(true);
    }, [form]);

    const openEdit = useCallback((record: F) => {
        form.resetFields();
        form.setFieldsValue(record);
        setModalOpen(true);
    }, [form]);

    const close = useCallback(() => {
        setModalOpen(false);
    }, []);

    const submit = useCallback(async () => {
        let values: F;
        try {
            values = await form.validateFields();
        } catch {
            return;
        }
        setConfirmLoading(true);
        try {
            const formData = transform ? transform(values) : values;
            if (formData.id) {
                await update(formData);
                void message.success('修改成功');
            } else {
                await create(formData);
                void message.success('新增成功');
            }
            setModalOpen(false);
            onSuccess?.();
        } catch (error) {
            void message.error('提交失败: ' + error);
        } finally {
            setConfirmLoading(false);
        }
    }, [form, create, update, onSuccess, transform]);

    return {modalOpen, confirmLoading, form, openCreate, openEdit, close, submit};
}
