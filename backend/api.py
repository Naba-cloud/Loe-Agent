from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from loe_tool import run_agent_logic

app = FastAPI(title="LOE Planning API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class LOERequest(BaseModel):
    numberOfDays:  int   = Field(..., gt=0)
    holidays:      int   = Field(..., ge=0)
    extraHolidays: int   = Field(..., ge=0)
    capacity:      float = Field(..., gt=0, le=1)
    meetings:      int   = Field(..., ge=0)
    task_type:     str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze(req: LOERequest):
    try:
        result = run_agent_logic(**req.dict())
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
