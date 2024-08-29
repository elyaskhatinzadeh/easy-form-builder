import React, { useState, ChangeEvent, FormEvent } from 'react';
import {Input, Button, RadioGroup, Radio, Switch, Select, SelectItem, Checkbox, CheckboxGroup, Textarea} from '@nextui-org/react';

interface FieldOption {
    value: string;
    label: string;
}

interface Field {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'switch' | 'checkbox' | 'checkbox-group';
    options?: FieldOption[] | ((formData: Record<string, any>) => FieldOption[]);
    colSize?: number;
    attributes?: Record<string, any>;
    show?: (formData: Record<string, any>) => boolean;
    hide?: (formData: Record<string, any>) => boolean;
    repeatable?: boolean;
    fields?: Field[];
}

interface ReusableFormProps {
    fields: Field[];
    initialValues: Record<string, any>;
    onSubmit: (formData: Record<string, any>) => void;
}

const ReusableForm: React.FC<ReusableFormProps> = ({ fields, initialValues, onSubmit }) => {
    const [formData, setFormData] = useState<Record<string, any>>(initialValues);

    const handleChange = (name: string, value: any, index: number | null = null, nestedKey: string | null = null) => {
        setFormData((prev) => {
            const updatedData = { ...prev };
            if (index !== null) {
                if (!Array.isArray(updatedData[name])) {
                    updatedData[name] = [];
                }
                if (!updatedData[name][index]) {
                    updatedData[name][index] = {};
                }
                if (nestedKey) {
                    updatedData[name][index] = {
                        ...updatedData[name][index],
                        [nestedKey]: value,
                    };
                } else {
                    updatedData[name][index] = value;
                }
            } else {
                updatedData[name] = value;
            }
            return updatedData;
        });
    };

    const handleAddRepeatable = (name: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: [...(prev[name] || []), { year: '', school: '', finished: false }],
        }));
    };

    const handleRemoveRepeatable = (name: string, index: number) => {
        setFormData((prev) => ({
            ...prev,
            [name]: prev[name].filter((_: any, i: number) => i !== index),
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const renderField = (field: Field, index: number | null = null, nestedKey: string | null = null) => {
        const { key, label, type, options, colSize, attributes, show, hide } = field;

        const shouldShow = typeof show === 'function' ? show(formData) : true;
        const shouldHide = typeof hide === 'function' ? hide(formData) : false;
        if (!shouldShow || shouldHide) return null;

        const name = nestedKey ? `${key}[${index}][${nestedKey}]` : key;
        const value = nestedKey
            ? formData[key]?.[index]?.[nestedKey]
            : index !== null
                ? formData[key]?.[index]
                : formData[key];

        const colClass = colSize ? `col-span-${colSize}` : 'col-span-1';

        const commonProps = {
            value: value || '',
            onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(key, e.target.value, index, nestedKey),
            ...attributes,
        };

        const fieldOptions = typeof options === 'function' ? options(formData) : options;

        switch (type) {
            case 'text':
                return (
                    <div className={colClass} key={name}>
                        <Input clearable bordered name={name} label={label} {...commonProps} />
                    </div>
                );
            case 'textarea':
                return (
                    <div className={colClass} key={name}>
                        <Textarea clearable bordered name={name} label={label} {...commonProps} />
                    </div>
                );
            case 'select':
                return (
                    <div className={colClass} key={name}>
                        <Select
                            name={name}
                            label={label}
                            placeholder="Select an option"
                            onChange={(e) => handleChange(key, e.target.value, index, nestedKey)}
                            value={value || ''}
                        >
                            {fieldOptions?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                );
            case 'radio':
                return (
                    <div className={colClass} key={name}>
                        <RadioGroup
                            label={label}
                            value={value || ''}
                            onValueChange={(val) => handleChange(key, val, index, nestedKey)}
                            {...attributes}
                        >
                            {fieldOptions?.map((option) => (
                                <Radio key={option.value} value={option.value}>
                                    {option.label}
                                </Radio>
                            ))}
                        </RadioGroup>
                    </div>
                );
            case 'switch':
                return (
                    <div className={`${colClass} flex items-center`} key={name}>
                        <Switch
                            checked={value || false}
                            onChange={(e) => handleChange(key, e.target.checked, index, nestedKey)}
                            {...attributes}
                        />
                        <label className="ml-2">{label}</label>
                    </div>
                );
            case 'checkbox':
                return (
                    <div className={colClass} key={name}>
                        <Checkbox
                            value={value || ''}
                            onValueChange={(val) => handleChange(key, val, index, nestedKey)}
                            {...attributes}
                        >{label}</Checkbox>
                    </div>
                );
            case 'checkbox-group':
                return (
                    <div className={colClass} key={name}>
                        <CheckboxGroup
                            label={label}
                            value={value || []}
                            onChange={(val) => handleChange(key, val, index, nestedKey)}
                            {...attributes}
                        >
                            {fieldOptions?.map((option) => (
                                <Checkbox key={option.value} value={option.value}>
                                    {option.label}
                                </Checkbox>
                            ))}
                        </CheckboxGroup>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderRepeatableField = (field: Field) => (
        <div key={field.key} className="col-span-1 sm:col-span-2 md:col-span-3 mb-4">
            <label>{field.label}</label>
            {formData[field.key]?.map((_: any, index: number) => (
                <div key={`${field.key}-${index}`} className="mb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {field.fields?.map((nestedField) => (
                            <React.Fragment key={`${nestedField.key}-${index}`}>
                                {renderField({ ...nestedField, key: field.key }, index, nestedField.key)}
                            </React.Fragment>
                        ))}
                    </div>
                    <Button
                        auto
                        flat
                        color="error"
                        size="xs"
                        onClick={() => handleRemoveRepeatable(field.key, index)}
                        className="mt-2"
                    >
                        Remove
                    </Button>
                </div>
            ))}
            <Button auto flat color="primary" onClick={() => handleAddRepeatable(field.key)} className="mt-2">
                Add {field.label}
            </Button>
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {fields.map((field) =>
                    field.repeatable && Array.isArray(formData[field.key]) ? renderRepeatableField(field) : <React.Fragment key={field.key}>{renderField(field)}</React.Fragment>
                )}
            </div>
            <Button type="submit" className="mt-4">
                Submit
            </Button>
        </form>
    );
};

export default ReusableForm;
