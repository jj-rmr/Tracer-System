// app/alumni/survey/page.tsx

import { getCurrentUser, getSessionCookie } from "@/lib/auth";
import { getSurveyByUserId } from "@/lib/repositories/surveys.repository";
import { defaultSurvey } from "@/lib/survey/defaults";
import SurveyContainer from "@/components/surveys/SurveyContainer";

export default async function SurveyPage() {
  const session = await getSessionCookie();

  if (!session) return null;

  const user = await getCurrentUser(session);

  if (!user) return null;

  const existingSurvey = await getSurveyByUserId(user.$id);

  return (
    <div className="flex flex-col gap-8 items-center justify-center">
      <div className="text-left w-full max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Alumni Tracer Survey
        </h1>
        <p className="text-slate-500">
          Please answer all fields completely and accurately.
        </p>
      </div>
      <SurveyContainer
        survey={{
          ...defaultSurvey,
          ...(existingSurvey ?? {}),
          userId: user.$id,
        }}
        isNew={!existingSurvey}
        updatedAt={existingSurvey?.updatedAt}
        surveyId={existingSurvey?.id}
      />
    </div>
  );
}

// import { getCurrentUser, getSessionCookie } from "@/lib/auth";

// import SurveyForm from "@/components/surveys/SurveyForm";
// import { defaultSurvey } from "@/lib/survey/defaults";

// import { Survey } from "@/types/survey";
// import { getSurveyByUserId } from "@/lib/repositories/surveys.repository";

// export default async function SurveyPage() {
//   const session = await getSessionCookie();

//   if (!session) {
//     return null;
//   }

//   const user = await getCurrentUser(session);

//   if (!user) {
//     return null;
//   }

//   const existingSurvey = await getSurveyByUserId(user.$id);

//   const isNew = !existingSurvey;

//   const survey: Survey = {
//     ...defaultSurvey,
//     ...(existingSurvey ?? {}),
//     userId: user.$id,
//   };
//   console.log(survey);
//   return (
//     <div className="space-y-6">
//       {isNew && (
//         <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-700">
//           You have not submitted your tracer survey yet. Please complete the
//           form below.
//         </div>
//       )}

//       <SurveyForm initialData={survey} isNew={isNew} />
//     </div>
//   );
// }
