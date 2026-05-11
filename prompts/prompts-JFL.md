# Prompt P-1 (Cursor)

/bmad-generate-project-context

---

## Follow-up prompts

### FP-1.1
[C] Continue to context generation

### FP-1.2
[P] Party Mode

### FP-1.3
Yes. Accept these changes to the Technology Stack section and continue to the Language-Specific rules

### FP-1.4
[P] Party Mode

### FP-1.5
Yes. Accept these changes to the Language-Specific rules and continue to the Framework-Specific rules

### FP-1.6
[P] Party Mode

### FP-1.7
Yes. Accept these changes to the Framework-Specific rules and continue to the Testing rules

### FP-1.8
[P] Party Mode

### FP-1.9
Yes. Accept these changes to the Testing rules and continue to the Code Quality & Style rules

### FP-1.10
[P] Party Mode

### FP-1.11
Yes. Accept these changes to the Code Quality & Style rules and continue to the Development Workflow rules

### FP-1.12
[P] Party Mode

### FP-1.13
Yes. Accept these changes to the Development Workflow rules and continue to the Critical Don’t-Miss rules

### FP-1.14
[P] Party Mode

### FP-1.15
Yes. Accept these changes to the Critical Don’t-Miss rules


---
---

# Prompt P-2 (Figma)

At the company page, we already have the functionality to list the different positions required by the company. It's available on a "posiciones" page that displays a list of cards describing each position. It includes filters to search by text, deadline, status, and responsible manager. You can see this page in one of the images attached. We want that when you click the "Ver Proceso" button for any of the positions, it takes you to the detailed view of that position, called "position." Your task is to create the "position" interface, a page where we can view and manage the different candidates for a specific position.
We've decided that the interface will be Kanban-style, displaying candidates as cards in different columns that represent the stages of the hiring process. You can update the stage a candidate is in simply by dragging their card. In the second attached image there is an example of a possible interface. Some of the design team's requirements, which can be seen in the example, are:
- The position title should be displayed at the top to provide context.
- An arrow should be added to the left of the title to return to the list of positions.
- There should be as many columns as there are stages in the process.
- Each candidate's card should be placed in the corresponding stage and should display their full name and average score.
- If possible, it should display correctly on mobile devices (stages vertically, occupying the full width).
Some observations:
- Assume that you can find the positions page.
- Assume that the overall page structure exists, including common elements such as the top menu and footer. What you are creating is the internal content of the page.

# Prompt P-3 (Cursor)

You are an expert in prompt engineering and sudolang. Given the following prompt, prepare it using best practices for structure (role, objective...) and format to achieve a precise and exhaustive result. Stick only to the requested objective by carefully analyzing what is asked in the original prompt, and always create the prompt in English and using sudolang. Do not execute the prompt. # Original prompt: "Eres un senior software engineer experto en frontend.Tu misión es crear la interfaz "position", una página en la que poder visualizar y gestionar los diferentes candidatos de una posición específica.

Te voy a guiar con diferentes instrucciones y no debes avanzar en ningun paso a menos que estrictimante te lo indique ya que que en el resultado de cada paso me gustaria tener una discusion antes de avanzar. Asi mismo cualquier duda que tengas preguntame antes de modificar o ejecutar algo. Recuerda primero leer y entender el contexto del proyecto: @project-context.md y revisar el estado actual tanto del backend como del frontend.

Paso 1. Contectate a los MCP de Figma y shadcn:
- Figma Dev Mode MCP: Diseño → contexto estructurado.
- shadcn MCP: buscar e instalar componentes desde registries (más de 6.000 bloques en shadcn.io).

Paso 2. Revisa la implementacion actual del frontend y el diseno de la UI en Figma:

En LTI ya tenemos la funcionalidad para listar las diferentes posiciones requeridas por la empresa. Está disponible en una pagina "positions" que muestra una lista de tarjetas que describen cada posición. Cuenta con filtros para poder buscar por texto, fecha límite, estado y manager responsable. Dentro de Figma ya vas a encontrar el UI impplementado basado en lo que ya existe en el frontend de nuestra aplicacion en: https://www.figma.com/make/AOz4tx5QwZiL17yqFSefTj/position-detail-page?p=f&t=8zLMrr1pK4qnE6Th-0&preview-route=%2Fposiciones

Queremos que al hacer clic en el botón "Ver proceso" de cualquiera de las posiciones, nos lleve a la vista de detalle de cada posición, denominada "position".Para la nueva interfaz "position" el diseno se puede ver en : https://www.figma.com/make/AOz4tx5QwZiL17yqFSefTj/position-detail-page?p=f&t=8zLMrr1pK4qnE6Th-0&preview-route=%2Fposition%2F1
Se ha decidido que la interfaz sea tipo kanban, mostrando los candidatos como tarjetas en diferentes columnas que representan las fases del proceso de contratación, y pudiendo actualizar la fase en la que se encuentra un candidato solo arrastrando su tarjeta.

Algunos de los requerimientos del equipo de diseño que se pueden ver son:
- Se debe mostrar el título de la posición en la parte superior, para dar contexto
- Añadir una flecha a la izquierda del título que permita volver al listado de posiciones
- Deben mostrarse tantas columnas como fases haya en el proceso
- La tarjeta de cada candidato/a debe situarse en la fase correspondiente, y debe mostrar su nombre completo y su puntuación media
- Si es posible, debe mostrarse adecuadamente en móvil (las fases en vertical ocupando todo el ancho)

Algunas observaciones:
- Asume que la página de posiciones la encuentras 
- Asume que existe la estructura global de la página, la cual incluye los elementos comunes como menú superior y footer. Lo que estás creando es el contenido interno de la página.

Paso 3. Para implementar la funcionalidad de la página cuentas con diversos endpoints API que ha preparado el equipo de backend:

1. GET /positions/:id/interviewFlow
Este endpoint devuelve información sobre el proceso de contratación para una determinada posición:
- positionName: Título de la posición
- interviewSteps: id y nombre de las diferentes fases de las que consta el proceso de contratación

{
      "positionName": "Senior backend engineer",
      "interviewFlow": {
              
              "id": 1,
              "description": "Standard development interview process",
              "interviewSteps": [
                  {
                      "id": 1,
                      "interviewFlowId": 1,
                      "interviewTypeId": 1,
                      "name": "Initial Screening",
                      "orderIndex": 1
                  },
                  {
                      "id": 2,
                      "interviewFlowId": 1,
                      "interviewTypeId": 2,
                      "name": "Technical Interview",
                      "orderIndex": 2
                  },
                  {
                      "id": 3,
                      "interviewFlowId": 1,
                      "interviewTypeId": 3,
                      "name": "Manager Interview",
                      "orderIndex": 2
                  }
              ]
          }
  }

2. GET /positions/:id/candidates
Este endpoint devuelve todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Proporciona la siguiente información:

- name: Nombre completo del candidato
- current_interview_step: en qué fase del proceso está el candidato.
- score: La puntuación media del candidato

[
      {
           "fullName": "Jane Smith",
           "currentInterviewStep": "Technical Interview",
           "averageScore": 4
       },
       {
           "fullName": "Carlos García",
           "currentInterviewStep": "Initial Screening",
           "averageScore": 0            
       },        
       {
           "fullName": "John Doe",
           "currentInterviewStep": "Manager Interview",
           "averageScore": 5            
      }    
 ]

 
3. PUT /candidates/:id/stage
Este endpoint actualiza la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico, a través del parámetro "new_interview_step" y proporionando el interview_step_id correspondiente a la columna en la cual se encuentra ahora el candidato.

{
     "applicationId": "1",
     "currentInterviewStep": "3"
 }

{    
    "message": "Candidate stage updated successfully",
     "data": {
         "id": 1,
         "positionId": 1,
         "candidateId": 1,
         "applicationDate": "2024-06-04T13:34:58.304Z",
         "currentInterviewStep": 3,
         "notes": null,
         "interviews": []    
     }
 }
 "
 Review the @project-context.md, the backend and frontend code and  figma UI in advance so you can understand the structure of the project and the goal of the task to make a better prompt. Make sure your output is a prompt fully generated in sudolang.Give me the prompt here and also create a skill for cursor. the skill need to be also in sudolang completely as the prompt. in addition you can revise the structure of the skill in @.cursor/skills/bmad-generate-project-context\ which contains the different steps in distinct files under the folder step, a template in markdown file, workflow.md and the SKILL.md. try to make the skill very robust following this structure but also use sudolang for it. 

---

## Follow-up prompts

---
---

# Prompt P-4 (Cursor)

# role
You are a senior frontend software engineer implementing UI in the LTI (Talent Tracking System) monorepo.
# objective
Deliver the **position detail** experience: a **Kanban** board for **one** position where:
- Each **column** is an interview **phase** (step) from the hiring flow.
- Each **card** is a candidate **application** in that phase, showing **full name** and **average score**.
- The user can **change** a candidate’s phase by **dragging** a card to another column, and the new phase **persists** via the backend.
Secondary objective: From the existing **positions** list, the **“Ver proceso”** (or equivalent) control must navigate to this detail route.
# non_goals
- Do not redesign the global shell (top menu, footer); implement **inner page content** only.
- Do not migrate the whole app to shadcn or replace React-Bootstrap **unless** the human explicitly orders a UI-kit migration in this task.
- Do not change backend contracts **unless** you discover a provable defect; if you must, update `backend/api-spec.yaml`, validation, and tests in the **same** change.
# process_gates
- If the human states **step-by-step** execution: **do not** implement code until they explicitly approve the current step’s plan.
- If anything is ambiguous (route naming, matching keys, DnD library choice), **ask** before large edits.
# mandatory_context
- Read and obey: `@project-context.md` at repo root (especially: **`frontend/src/App.js` is the live router root**, not `App.tsx`; stack is CRA + React-Bootstrap).
- Read current code for: `frontend/src/App.js`, positions list component(s), and backend routes/services for positions and candidates.
# design_reference
- Figma Make (positions list context): https://www.figma.com/make/AOz4tx5QwZiL17yqFSefTj/position-detail-page?p=f&t=8zLMrr1pK4qnE6Th-0&preview-route=%2Fposiciones
- Figma Make (position detail / Kanban): https://www.figma.com/make/AOz4tx5QwZiL17yqFSefTj/position-detail-page?p=f&t=8zLMrr1pK4qnE6Th-0&preview-route=%2Fposition%2F1
- Use MCP **Figma** tools when enabled to pull structured layout/spacing; treat output as **reference** and map to **project** components and tokens.
# integrations
- **Figma MCP**: use for design fidelity and hierarchy when available.
- **shadcn MCP**: only if the human explicitly approves adopting shadcn for this screen; otherwise prefer **React-Bootstrap / Bootstrap 5** per `project-context.md`.
# backend_contract.source_of_truth
Verify paths and bodies against **this** repository (not the wording of older specs):
- `GET http://localhost:3010/position/:positionId/candidates`
  - Returns an **array** of objects including at least:
    - `fullName`, `currentInterviewStep` (step **name** string), `averageScore`
    - `id` (**candidate** id), `applicationId` (**application** id)
- `GET http://localhost:3010/position/:positionId/interviewflow`
  - Response JSON is **`{ interviewFlow: payload }`** where `payload` mirrors the service shape:
    - `positionName`
    - nested `interviewFlow`: `{ id, description, interviewSteps: [{ id, interviewFlowId, interviewTypeId, name, orderIndex }, ...] }`
  - **Client parsing must match the actual nesting** (avoid assuming a flat `positionName` at the top level of the HTTP body).
- `PUT http://localhost:3010/candidates/:candidateId`
  - Body fields: `{ applicationId, currentInterviewStep }` where `currentInterviewStep` is the **interview step id** (server parses integers).
  - Successful response includes `{ message: 'Candidate stage updated successfully', data: ... }` per existing controller.
# functional_requirements
- Show **position title** at the top (from interview-flow response).
- **Back** affordance to the **positions** list (`/positions` or the project’s actual list path—confirm in code).
- Render **one column per** `interviewSteps` entry; sort by `orderIndex` ascending, stable tie-break by `id`.
- Place each candidate card in the column for their current step:
  - Primary match: `currentInterviewStep` **string** ↔ `step.name`.
  - If unmatched: choose **one** explicit fallback (e.g. first column or labeled bucket) and document in a **single-line** comment.
- Card content: **full name**, **average score** (display **0** / empty interviews sensibly).
- **Drag-and-drop**:
  - On successful drop, call `PUT /candidates/:candidateId` with `applicationId` from the list payload and `currentInterviewStep` = **destination column’s step id**.
  - Handle errors with visible UI feedback; optionally optimistic update with rollback/refetch on failure.
- **Responsive**: desktop shows a horizontal board; **mobile** stacks columns **full width** vertically.
# engineering_constraints
- Prefer **smallest coherent diff**; match existing file language (`.js` vs `.tsx`) and import style in touched files.
- Align API base URL with existing frontend usage; prefer `REACT_APP_*` centralization only if you touch multiple call sites.
- Do not rely on `frontend/src/services/candidateService.js` **axios** without adding `axios` to `frontend/package.json` or switching to `fetch`.
# acceptance_criteria
- From positions list, user reaches `/position/:id` (or the project’s chosen param route) with correct `id`.
- Network shows the two GETs; dragging triggers PUT with correct ids.
- Refresh after a move shows the candidate in the new column.
- Mobile layout matches the “stacked columns” requirement without broken horizontal scroll traps.
# output_when_executing_this_prompt
- Code changes + brief summary of files touched + manual test steps.
- If you deviate from Figma, state **why** (e.g. Bootstrap component limitations) in one short paragraph.

---

## Follow-up prompts

### FP-4.1
Connect to Figma and review the design to follow it and overcome the limits

### FP-4.2
why did you modified the backend with the original positions

### FP-4.3
i only want you too keep the design the same as the figma one, but keep the backend intact.
