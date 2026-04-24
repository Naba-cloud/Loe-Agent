from openai import OpenAI
import os
from dotenv import load_dotenv
import json

load_dotenv()

client = OpenAI(api_key=os.getenv("OPEN_AI_KEY"))


def calculate_loe(numberOfDays: int, holidays: int, extraHolidays: int, capacity: float) -> dict:
    working_days = numberOfDays - holidays - extraHolidays
    loe = working_days * capacity * 8
    return {
        "working_days": working_days,
        "base_loe_hours": round(loe, 2),
    }


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "calculate_loe",
            "description": "Calculate working days and base LOE in hours.",
            "parameters": {
                "type": "object",
                "properties": {
                    "numberOfDays":  {"type": "integer"},
                    "holidays":      {"type": "integer"},
                    "extraHolidays": {"type": "integer"},
                    "capacity":      {"type": "number"},
                },
                "required": ["numberOfDays", "holidays", "extraHolidays", "capacity"],
            },
        },
    }
]


def run_agent_logic(numberOfDays, holidays, extraHolidays, capacity, meetings, task_type):
    loe_data = calculate_loe(numberOfDays, holidays, extraHolidays, capacity)
    working_days = loe_data["working_days"]
    base_loe_hours = loe_data["base_loe_hours"]

    messages = [
        {"role": "system", "content": "You are an expert AI project-planning agent. Return structured JSON only."},
        {"role": "user", "content": f"""
You are helping plan a {task_type} project sprint.

Pre-calculated figures (trust these, do not recalculate):
  - Working days      : {working_days}
  - Base LOE (hours)  : {base_loe_hours}
  - Meetings per week : {meetings} (each meeting ~1 hour of overhead)
  - Team capacity     : {capacity * 100:.0f}%

Tasks:
1. Estimate actual effort (estimated_loe_hours) by subtracting meeting overhead from base LOE.
2. Calculate utilization_percentage = (estimated_loe_hours / base_loe_hours) * 100
3. Assign risk: "low" (<70%), "medium" (70-90%), "high" (>90%)
4. Write exactly 3 actionable suggestions for a {task_type} team.

Return ONLY valid JSON, no markdown:

{{
    "working_days": {working_days},
    "base_loe_hours": {base_loe_hours},
    "meeting_overhead_hours": <number>,
    "estimated_loe_hours": <number>,
    "utilization_percentage": <number>,
    "risk": "<low|medium|high>",
    "suggestions": ["<string>", "<string>", "<string>"]
}}
"""}
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
    )

    msg = response.choices[0].message

    if msg.tool_calls:
        tool_call = msg.tool_calls[0]
        args = json.loads(tool_call.function.arguments)
        tool_result = calculate_loe(**args)
        messages.append(msg)
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(tool_result),
        })
        final_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0,
        )
        raw_content = final_response.choices[0].message.content
    else:
        raw_content = msg.content

    cleaned = raw_content.strip().strip("```json").strip("```").strip()
    return json.loads(cleaned)


def run_agent():
    print("\n=== LOE Planning Agent ===\n")
    numberOfDays  = int(input("Days in period (e.g. 30): "))
    holidays      = int(input("Total weekly holiday days in period: "))
    extraHolidays = int(input("Extra/public holiday days: "))
    capacity      = float(input("Team capacity as fraction 0-1 (e.g. 0.8): "))
    meetings      = int(input("Meetings per week (count): "))
    task_type     = input("Task type (e.g. development, testing, design): ").strip()

    result = run_agent_logic(numberOfDays, holidays, extraHolidays, capacity, meetings, task_type)

    risk_icons = {"low": "🟢", "medium": "🟡", "high": "🔴"}
    risk = result.get("risk", "unknown")

    print("\n" + "=" * 50)
    print("📊  PROJECT LOE REPORT")
    print("=" * 50)
    print(f"  Working days      : {result.get('working_days')}")
    print(f"  Base LOE          : {result.get('base_loe_hours')} hrs")
    print(f"  Meeting overhead  : {result.get('meeting_overhead_hours')} hrs")
    print(f"  Estimated LOE     : {result.get('estimated_loe_hours')} hrs")
    print(f"  Utilization       : {result.get('utilization_percentage'):.1f}%")
    print(f"  Risk level        : {risk_icons.get(risk, '❓')} {risk.upper()}")
    print("\n💡  Suggestions:")
    for i, tip in enumerate(result.get("suggestions", []), 1):
        print(f"  {i}. {tip}")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    run_agent()
