LOE Agent - AI-Powered Effort Estimation & Sprint Planning
A full-stack application combining an AI agent with a modern web dashboard to predict project effort levels, analyze team capacity, and provide data-driven sprint planning recommendations.

🎯 Overview
The LOE (Level of Effort) Agent uses OpenAI's GPT models to intelligently estimate project effort by analyzing:

Calendar availability (working days, holidays)
Team capacity and meeting overhead
Project task type and complexity
Historical utilization patterns
Result: Risk assessment, effort predictions, and actionable AI suggestions for sprint planning.

📁 Project Structure
🚀 Quick Start
Prerequisites
Python 3.8+
Node.js 16+
OpenAI API Key (get one here)
Backend Setup
Navigate to backend directory

Create .env file with your API keys

Install dependencies

Run the API server

Server runs at: http://localhost:8000

Frontend Setup
Navigate to frontend directory

Install dependencies

Run development server

Dashboard opens at: http://localhost:5173

🔧 API Reference
Health Check
Returns server status.

Analyze Effort
Response:

📊 Dashboard Features
Sprint Configuration: Input working days, holidays, capacity, and meetings
Real-time Calculations: Instant LOE estimates with visual feedback
Risk Assessment: Color-coded risk levels (🟢 Low / 🟡 Medium / 🔴 High)
Utilization Tracking: Visual progress bar showing capacity utilization
AI Suggestions: 3 actionable recommendations from the AI agent
Responsive Design: Works on desktop and mobile devices
🤖 How It Works
User Input: Enter sprint parameters (days, holidays, capacity, meetings, task type)
Calculation: Backend calculates working days and base LOE in hours
AI Analysis: GPT-4o-mini analyzes the data and generates:
Meeting overhead estimation
Adjusted LOE after accounting for meetings
Risk classification (low/medium/high)
Team-specific recommendations
Results Display: Dashboard visualizes metrics and risk level
🛠️ Configuration
Supported Task Types
development
testing
design
research
deployment
planning
Risk Thresholds
Low: < 70% utilization
Medium: 70-90% utilization
High: > 90% utilization
📦 Dependencies
Backend:

fastapi - Web framework
uvicorn - ASGI server
openai - GPT API client
pydantic - Data validation
python-dotenv - Environment variables
Frontend:

react - UI library
vite - Build tool
Pure CSS (no external UI library)
🔐 Security Notes
Keep .env files private (listed in .gitignore)
Never commit API keys to version control
Use environment variables for sensitive data
CORS enabled for local development only
📈 Example Usage
Input:

30-day sprint
8 holiday days
2 extra holidays
80% team capacity
3 meetings/week
Development task type
Output:

🐛 Troubleshooting
Backend connection error?

Ensure backend is running on http://localhost:8000
Check firewall/port availability
API key error?

Verify OPEN_AI_KEY is set correctly in .env
Check OpenAI account has active billing
No suggestions appearing?

Verify GPT-4o-mini model is available in your OpenAI account
Check API response in browser DevTools
📝 License
Internal project - use for team planning and estimation.

👤 Author
Built with ❤️ for intelligent sprint planning
