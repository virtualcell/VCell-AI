import functools
import logging
import sys
from uvicorn.logging import ColourizedFormatter
from typing import Any, Callable

class CustomColourizedFormatter(ColourizedFormatter):
    def format(self, record: logging.LogRecord) -> str:
        level_color_map = {
            "DEBUG": "\033[34m",    # Blue
            "INFO": "\033[32m",     # Green
            "WARNING": "\033[33m",  # Yellow
            "ERROR": "\033[31m",    # Red
            "CRITICAL": "\033[41m", # Red background
        }
        reset = "\033[0m"

        # Apply color to the log level name
        record.levelname = f"{level_color_map.get(record.levelname, '')}{record.levelname}{reset}"

        # Format the log message using the parent class's format method
        return super().format(record)

def get_logger(name: str) -> logging.Logger:
    """Creates a logger object

    Args:
        name (str): name given to the logger

    Returns:
        logging.Logger: logger object to be used for logging 
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    # Prevent adding multiple handlers if already exists
    if not logger.hasHandlers():
        # Create console handler and set level to debug
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.DEBUG)

        # Create a custom formatter with colored log levels
        formatter = CustomColourizedFormatter(
            "{asctime} | {levelname:<8} | {message}",
            style="{",
            datefmt="%Y-%m-%d %H:%M:%S",
            use_colors=True
        )

        # Add formatter to the handler
        ch.setFormatter(formatter)

        # Add handler to the logger
        logger.addHandler(ch)

        # Create file handler to log to a file
        fh = logging.FileHandler('app.log')  # Change 'app.log' to your desired log file path

        # Add the same custom formatter to the file handler
        fh.setFormatter(formatter)

        # Add file handler to the logger
        logger.addHandler(fh)

    return logger

# Logger decorator implementation
def log_function_call(logger: logging.Logger) -> Callable:
    """A decorator that logs the function calls and results.

    Args:
        logger (logging.Logger): The logger instance to use for logging.
    
    Returns:
        Callable: A wrapper function that logs the execution details.
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Log the function call with arguments
            logger.debug(f"Calling {func.__name__} with args: {args} and kwargs: {kwargs}")
            result = func(*args, **kwargs)
            # Log the function result
            logger.debug(f"{func.__name__} returned {result}")
            return result
        return wrapper
    return decorator
