Procura — From Order to Production, Seamlessly.
Procura (Latin: to manage/take care of) is a role-based inventory reorder prediction and cost variance analysis system designed for the manufacturing industry. It replaces fragmented email-based communication with a unified platform that tracks production from the initial sales order to final delivery.

🚀 The Problem
Factories today often manage production workflows through manual emails. If one email is missed, production stops. Financial leaks—caused by material wastage or overpaying suppliers—often go unnoticed until the month-end audit.

✨ Our Solution
Procura unifies five distinct departments into a single source of truth:

Sales: Intake customer orders and set delivery timelines.

PPC (Production Planning & Control): Automate Bill of Materials (BOM) calculations and lock production schedules.

Materials: Monitor real-time stock levels with Soft Reservations (Physical vs. Allocated stock).

Purchase: Automated procurement alerts based on lead-time predictions.

Management: Real-time Variance Analysis to identify exactly where money is being lost.

🧠 Core Logic & Formulas
Procura utilizes industry-standard formulas to maintain efficiency:

1. Reorder Prediction
To prevent stockouts, the system calculates a Reorder Level (ROL):

ROL=(DailyConsumption×LeadTime)+SafetyStock
2. Cost Variance Analysis
Identifies whether losses are due to floor-level waste or procurement price hikes:

Quantity Variance: (Actual Qty−Planned Qty)×Planned Rate

Price Variance: (Actual Rate−Planned Rate)×Actual Qty

🛠️ Tech Stack
Framework: Next.js 15 (App Router) with TypeScript

Database: PostgreSQL (Neon) with Prisma ORM

Auth: NextAuth.js v5 (Role-based access control)

Styling: Tailwind CSS & shadcn/ui

Data Handling: TanStack Table & React Hook Form (Zod)

Visuals: Recharts

📁 Project Structure
Plaintext
webify/
├── app/                  # Role-based routes & API
├── components/           # Shared & shadcn/ui components
├── lib/                  # Calculation logic & Prisma client
├── prisma/               # Schema & seed scripts
└── types/                # TypeScript definitions
⚙️ Setup & Installation
Clone the repository:

Bash
git clone https://github.com/dineesh07/Procura.git
cd Procura
Install dependencies:

Bash
npm install
Configure Environment Variables:
Create a .env file and add your Neon PostgreSQL URLs and NextAuth secret.

Initialize Database:

Bash
npx prisma generate
npx prisma db push
npx prisma db seed
Run Development Server:

Bash
npm run dev
Would you like me to help you write the calculations.ts utility file that implements the math for these formulas?
