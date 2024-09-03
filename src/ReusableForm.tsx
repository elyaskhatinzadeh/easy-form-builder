import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {
    Input,
    Button,
    RadioGroup,
    Radio,
    Switch,
    Select,
    SelectItem,
    Checkbox,
    CheckboxGroup,
    Textarea,
    Tabs,
    Tab
} from '@nextui-org/react';

interface FieldOption {
    value: string;
    label: string;
}

interface Field {
    key: string;
    label: string;
    type:
        | 'text'
        | 'hidden'
        | 'textarea'
        | 'select'
        | 'radio'
        | 'switch'
        | 'checkbox'
        | 'checkbox-group'
        | 'custom';
    options?: FieldOption[] | ((formData: Record<string, any>) => FieldOption[]);
    colSize?: number;
    attributes?: Record<string, any>;
    show?: (formData: Record<string, any>) => boolean;
    hide?: (formData: Record<string, any>) => boolean;
    repeatable?: boolean;
    fields?: Field[];
    component?: React.ReactNode;
    tab?: string; // New property to specify the tab
}

interface ReusableFormProps {
    fields: Field[];
    initialValues: Record<string, any>;
    onSubmit: (formData: Record<string, any>, setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>) => void;
}

const ReusableForm: React.FC<ReusableFormProps> = ({
                                                       fields,
                                                       initialValues,
                                                       onSubmit,
                                                   }) => {
    const [formData, setFormData] = useState<Record<string, any>>(initialValues);
    const [activeTab, setActiveTab] = useState<string | null>(null); // State for active tab


    // Filter fields based on `show` and `hide` conditions before grouping them into tabs
    const filteredFields = fields.filter((field) => {
        const shouldShow = typeof field.show === 'function' ? field.show(formData) : true;
        const shouldHide = typeof field.hide === 'function' ? field.hide(formData) : false;
        return shouldShow && !shouldHide;
    });

    // Determine if there are any tabbed fields after filtering
    let hasTabs = filteredFields.some((field) => field.tab);

    // Group fields into tabs after filtering
    const tabbedFields = filteredFields.reduce((acc, field) => {
        if (field.tab) {
            if (!acc[field.tab]) {
                acc[field.tab] = [];
            }
            acc[field.tab].push(field);
        }
        return acc;
    }, {} as Record<string, Field[]>);


    // Set the initial active tab if there are tabs
    useEffect(() => {
        if (hasTabs && !activeTab) {
            setActiveTab(Object.keys(tabbedFields)[0]); // Set the first tab as active if tabs are present
        }
    }, [hasTabs, activeTab]);

    const handleChange = (
        name: string,
        value: any,
        index: number | null = null,
        nestedKey: string | null = null
    ) => {
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
        onSubmit(formData, setFormData);
    };

    const renderField = (
        field: Field,
        index: number | null = null,
        nestedKey: string | null = null
    ) => {
        const {
            key,
            label,
            type,
            options,
            colSize,
            attributes,
            show,
            hide,
            component,
        } = field;

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
            onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                handleChange(key, e.target.value, index, nestedKey),
            ...attributes,
        };

        const fieldOptions =
            typeof options === 'function' ? options(formData) : options;

        switch (type) {
            case 'text':
                return (
                    <div className={colClass} key={name}>
                        <Input clearable bordered name={name} label={label} {...commonProps} />
                    </div>
                );
            case 'hidden':
                return (
                    <div className={colClass} key={name}>
                        <input type="hidden" name={name} {...commonProps} />
                    </div>
                );
            case 'textarea':
                return (
                    <div className={colClass} key={name}>
                        <Textarea
                            clearable
                            bordered
                            name={name}
                            label={label}
                            {...commonProps}
                        />
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
                        >
                            {label}
                        </Checkbox>
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
            case 'custom':
                return (
                    <div className={colClass} key={name}>
                        {React.cloneElement(component as React.ReactElement, {
                            value: value || '',
                            onChange: (val: string) => handleChange(key, val, index, nestedKey),
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    const renderRepeatableField = (field: Field) => {

        const {
            show,
            hide,
        } = field;

        const shouldShow = typeof show === 'function' ? show(formData) : true;
        const shouldHide = typeof hide === 'function' ? hide(formData) : false;
        if (!shouldShow || shouldHide) return null;

        return (<div
                key={field.key}
                className="col-span-1 sm:col-span-2 md:col-span-3 mb-4"
            >
                <label>{field.label}</label>
                {formData[field.key]?.map((_: any, index: number) => (
                    <div key={`${field.key}-${index}`} className="mb-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {field.fields?.map((nestedField) => (
                                <React.Fragment key={`${nestedField.key}-${index}`}>
                                    {renderField(
                                        { ...nestedField, key: field.key },
                                        index,
                                        nestedField.key
                                    )}
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
                <Button
                    auto
                    flat
                    size="sm"
                    onClick={() => handleAddRepeatable(field.key)}
                >
                    Add {field.label}
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {fields
                    .filter((field) => !field.tab)
                    .map((field) =>
                        field.repeatable && Array.isArray(formData[field.key])
                            ? renderRepeatableField(field)
                            : renderField(field)
                    )}
            </div>

            {hasTabs && (
                <Tabs className="mb-4" selectedValue={activeTab} onValueChange={setActiveTab} disableAnimation>
                    {Object.keys(tabbedFields).map((tabName) => (
                        <Tab key={tabName} title={tabName} value={tabName}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {tabbedFields[tabName].map((field) =>
                                    field.repeatable && Array.isArray(formData[field.key])
                                        ? renderRepeatableField(field)
                                        : renderField(field)
                                )}
                            </div>
                        </Tab>
                    ))}
                </Tabs>
            )}

            <Button type="submit" className="mt-4">
                Submit
            </Button>
        </form>
    );
};

export default ReusableForm;
