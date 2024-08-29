# Form Builder Component

A reusable form component built with React and NextUI. This component supports various input types, repeatable fields, and dynamic options.

## Installation

### Example


```js

const fields = [
        {
            key: 'name',
            type: 'text',
            label: 'Name',
        },
        {
            key: 'email',
            type: 'text',
            label: 'Email',
        },
        {
            key: 'gender',
            label: 'Gender',
            type: 'radio',
            options: [
                {
                    value: 'male',
                    label: 'Male',
                },
                {
                    value: 'female',
                    label: 'Female',
                }
            ],
        },
    ]

    const initialValues = {
        email: ''
    }

    const handleFormSubmit = (data) => {
        console.log( data )
        // console.log( JSON.stringify(data) )
    };
```