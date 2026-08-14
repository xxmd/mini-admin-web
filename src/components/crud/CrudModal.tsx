import type {ReactNode} from 'react';
import {Form, Modal} from 'antd';
import type {FormInstance} from 'antd';

interface CrudModalProps<F> {
    open: boolean;
    confirmLoading: boolean;
    onOk: () => void;
    onCancel: () => void;
    form: FormInstance<F>;
    title?: string;
    forceRender?: boolean;
    labelCol?: number;
    wrapperCol?: number;
    children: ReactNode;
}

export function CrudModal<F>({open, confirmLoading, onOk, onCancel, form, title, forceRender, labelCol = 4, wrapperCol = 18, children}: CrudModalProps<F>) {
    return (
        <Modal
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            confirmLoading={confirmLoading}
            destroyOnHidden
            maskClosable={false}
            title={title}
            forceRender={forceRender}
        >
            <Form
                form={form}
                layout="horizontal"
                labelAlign="left"
                labelCol={{span: labelCol}}
                wrapperCol={{span: wrapperCol}}
                style={{marginTop: 16}}
                autoComplete="off"
            >
                {children}
            </Form>
        </Modal>
    );
}
