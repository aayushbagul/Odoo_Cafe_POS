from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Annotated


valid_domains = ["odoo.com"]
must_contain_in_password = {
    'symbols': [
        '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
        '-', '_', '=', '+', '[', ']', '{', '}', ';', ':',
        ',', '.', '<', '>', '/', '?', '|', '~'
    ],
    'uppercase': [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
    ],
    'lowercase': [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z'
    ],
    'numbers': [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ]
}

class SignUp(BaseModel):
    name: Annotated[str, Field(title="User's name", max_length=100)]
    username: Annotated[str, Field(title="User's username", max_length=20)]
    email: Annotated[EmailStr, Field(title="User's email")]
    password: Annotated[str, Field(title="User's password", max_length=100)]
    confirm_password: Annotated[str, Field(title="Confirm password", max_length=100)]

    @field_validator('email')
    @classmethod
    def validate_email(cls, value):
        domain = value.split('@')[-1]
        if domain not in valid_domains:
            raise ValueError("Email domain must be odoo.com")
        return value

    @field_validator('password')
    @classmethod
    def validate_password(cls, value):
        checks = {
            'uppercase': 'at least one uppercase letter',
            'lowercase': 'at least one lowercase letter',
            'numbers': 'at least one number',
            'symbols': 'at least one symbol',
        }
        for key, msg in checks.items():
            if not any(c in must_contain_in_password[key] for c in value):
                raise ValueError(f'Password must contain {msg}')
        return value

    @model_validator(mode="after")
    def validate_confirm_password(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

class Login(BaseModel):
    username_or_email: Annotated[str, Field(title="Username or Email", max_length=100, alias="usernameOrEmail")]
    password: Annotated[str, Field(title="User's password", max_length=100)]

    model_config = {"populate_by_name": True}











