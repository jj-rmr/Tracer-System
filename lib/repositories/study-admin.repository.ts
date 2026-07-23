import { supabase } from "@/lib/supabase/server";
import {
  PublishedFormVersion,
  StudyPeriodStatus,
  StudyPeriodSummary,
} from "@/types";

interface StudyRow {
  id: string;
  form_id: string;
  form_version_id: string;
  academic_year: string;
  title: string;
  opens_at: string;
  closes_at: string;
  archived_at: string | null;
  status: StudyPeriodStatus;
}

interface FormVersionRow {
  id: string;
  form_id: string;
  version: number;
  form_definitions: {
    slug: string;
    title: string;
  };
}

export async function listPublishedFormVersions(): Promise<
  PublishedFormVersion[]
> {
  const { data, error } = await supabase
    .from("form_versions")
    .select("id, form_id, version, form_definitions!inner(slug, title)")
    .not("published_at", "is", null)
    .order("version", { ascending: false });

  if (error) throw error;

  return (data as unknown as FormVersionRow[]).map((row) => ({
    id: row.id,
    formId: row.form_id,
    slug: row.form_definitions.slug,
    title: row.form_definitions.title,
    version: row.version,
  }));
}

export async function listStudyPeriodSummaries(): Promise<
  StudyPeriodSummary[]
> {
  const { data, error } = await supabase
    .from("study_periods_with_status")
    .select("*")
    .order("academic_year", { ascending: false });

  if (error) throw error;

  return Promise.all(
    (data as StudyRow[]).map(async (study) => {
      const [allResponses, submittedResponses] = await Promise.all([
        supabase
          .from("form_responses")
          .select("id", { count: "exact", head: true })
          .eq("study_period_id", study.id),
        supabase
          .from("form_responses")
          .select("id", { count: "exact", head: true })
          .eq("study_period_id", study.id)
          .eq("status", "submitted"),
      ]);

      if (allResponses.error) throw allResponses.error;
      if (submittedResponses.error) throw submittedResponses.error;

      return {
        id: study.id,
        formId: study.form_id,
        formVersionId: study.form_version_id,
        academicYear: study.academic_year,
        title: study.title,
        opensAt: study.opens_at,
        closesAt: study.closes_at,
        archivedAt: study.archived_at,
        status: study.status,
        responseCount: allResponses.count ?? 0,
        submittedResponseCount: submittedResponses.count ?? 0,
      };
    }),
  );
}

export async function createStudyPeriod({
  formVersionId,
  academicYear,
  title,
  opensAt,
  closesAt,
}: {
  formVersionId: string;
  academicYear: string;
  title: string;
  opensAt: string;
  closesAt: string;
}) {
  const { data: version, error: versionError } = await supabase
    .from("form_versions")
    .select("form_id")
    .eq("id", formVersionId)
    .not("published_at", "is", null)
    .single();

  if (versionError) throw versionError;

  const { data, error } = await supabase
    .from("study_periods")
    .insert({
      form_id: version.form_id,
      form_version_id: formVersionId,
      academic_year: academicYear,
      title,
      opens_at: opensAt,
      closes_at: closesAt,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateStudyPeriodSchedule({
  studyPeriodId,
  title,
  opensAt,
  closesAt,
}: {
  studyPeriodId: string;
  title: string;
  opensAt: string;
  closesAt: string;
}) {
  const { data, error } = await supabase
    .from("study_periods")
    .update({
      title,
      opens_at: opensAt,
      closes_at: closesAt,
    })
    .eq("id", studyPeriodId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function archiveStudyPeriod(studyPeriodId: string) {
  const { data, error } = await supabase
    .from("study_periods")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", studyPeriodId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
