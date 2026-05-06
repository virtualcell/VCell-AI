from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum


class CategoryEnum(str, Enum):
    all = "all"
    public = "public"
    shared = "shared"
    tutorials = "tutorial"
    educational = "educational"


class OrderByEnum(str, Enum):
    date_desc = "date_desc"
    date_asc = "date_asc"
    name_desc = "name_desc"
    name_asc = "name_asc"


# Biomodel Request Parameters schema
class BMDBRequestParams(BaseModel, use_enum_values=True):
    bmName: Optional[str] = ""  # Name of the biomodel to search for
    bmId: Optional[str] = ""  # Biomodel ID
