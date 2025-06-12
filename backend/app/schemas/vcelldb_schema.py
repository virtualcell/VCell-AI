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
class BiomodelRequestParams(BaseModel, use_enum_values=True):
    bmName: Optional[str] = None  # Name of the biomodel to search for
    bmId: Optional[str] = None  # Biomodel ID
    category: Optional[CategoryEnum] = CategoryEnum.all  # Category of the biomodel
    owner: Optional[str] = None  # Owner of the biomodel
    savedLow: Optional[date] = None  # Lower bound of the save date range
    savedHigh: Optional[date] = None  # Upper bound of the save date range
    startRow: Optional[int] = 1  # Starting row of the result set (default is 1)
    maxRows: Optional[int] = 100  # Maximum number of rows to return (default is 100)
    orderBy: Optional[OrderByEnum] = (
        OrderByEnum.date_desc
    )  # Order of results (default is "date_desc")


class SimulationRequestParams(BaseModel):
    bmId: str  # Biomodel ID for which simulations will be fetched
    simId: str  # Simulation ID to fetch specific simulation details
