import type {ReactNode} from 'react';
import {Button, Form, Space} from 'antd';
import type {FormInstance} from 'antd';
import {ReloadOutlined, SearchOutlined} from '@ant-design/icons';

interface SearchFormProps<S> {
    form: FormInstance<S>;
    onSearch: () => void;
    onReset: () => void;
    children: ReactNode;
}

export function SearchForm<S>({form, onSearch, onReset, children}: SearchFormProps<S>) {
    return (
        <Form form={form} layout="inline" autoComplete="off">
            {children}
            <Form.Item>
                <Space>
                    <Button type="primary" icon={<SearchOutlined/>} onClick={onSearch}>
                        搜索
                    </Button>
                    <Button icon={<ReloadOutlined/>} onClick={onReset}>
                        重置
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}
