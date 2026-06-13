from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional,Annotated


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
    name: Annotated[str,Field(title="User's name",max_length=100)]
    username: Annotated[str,Field(title="User's username",max_length=20)]
    email: Annotated[str,Field(title="User's email"),EmailStr]
    password: Annotated[str,Field(title="User's password",max_length=100)]

    @field_validator('email')
    def validate_email(cls, value):
        domain = value.split('@')[-1]
        if domain not in valid_domains:
            raise ValueError("Email address is not valid")
        return value

    @field_validator('password')
    def validate_password(cls, value):
        if not any(char in must_contain_in_password['uppercase'] for char in value):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char in must_contain_in_password["lowercase"] for char in value):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(char in must_contain_in_password['numbers'] for char in value):
            raise ValueError("Password must contain at least one number")
        if not any(char in must_contain_in_password['symbols'] for char in value):
            raise ValueError("Password must contain at least one symbol")

        return value
    confirm_password: Annotated[str,Field(title="User's password",max_length=100)]
    @model_validator(mode="after")
    def validate_confirm_password(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

class Login(BaseModel):
    username_or_email: str = Field(title="Username or Email", max_length=100)
    password: Annotated[str,Field(title="User's password",max_length=100)]











