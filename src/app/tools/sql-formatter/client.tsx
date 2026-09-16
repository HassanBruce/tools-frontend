"use client";

import { useMemo, useState } from "react";
import { format, type SqlLanguage } from "sql-formatter";
import {
  ErrorNote,
  Field,
  InputPanel,
  Note,
  NumberInput,
  OutputPanel,
  Select,
  ToolGrid,
  Toolbar,
} from "@/components/ui";

const SAMPLE = `select u.id, u.name, count(o.id) as order_count from users u left join orders o on o.user_id = u.id where u.created_at >= '2026-01-01' and u.status in ('active','trial') group by u.id, u.name having count(o.id) > 3 order by order_count desc limit 20;`;

const DIALECTS: { value: SqlLanguage; label: string }[] = [
  { value: "sql", label: "Standard SQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "sqlite", label: "SQLite" },
  { value: "tsql", label: "SQL Server (T-SQL)" },
  { value: "plsql", label: "Oracle PL/SQL" },
  { value: "bigquery", label: "BigQuery" },
  { value: "snowflake", label: "Snowflake" },
  { value: "redshift", label: "Redshift" },
  { value: "spark", label: "Spark SQL" },
  { value: "duckdb", label: "DuckDB" },
  { value: "trino", label: "Trino" },
  { value: "clickhouse", label: "ClickHouse" },
];

const CASES = [
  { value: "upper", label: "UPPERCASE" },
  { value: "lower", label: "lowercase" },
  { value: "preserve", label: "Preserve" },
] as const;

export default function Client() {
  const [input, setInput] = useState(SAMPLE);
  const [language, setLanguage] = useState<SqlLanguage>("postgresql");
  const [keywordCase, setKeywordCase] = useState<(typeof CASES)[number]["value"]>("upper");
  const [tabWidth, setTabWidth] = useState(2);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null };
    try {
      return {
        output: format(input, { language, keywordCase, tabWidth }),
        error: null,
      };
    } catch (caught) {
      return { output: "", error: caught instanceof Error ? caught.message : String(caught) };
    }
  }, [input, language, keywordCase, tabWidth]);

  return (
    <>
      <Toolbar>
        <Field label="Dialect" className="w-52">
          <Select value={language} onChange={setLanguage} options={DIALECTS} />
        </Field>
        <Field label="Keywords" className="w-40">
          <Select value={keywordCase} onChange={setKeywordCase} options={CASES} />
        </Field>
        <Field label="Indent" className="w-24">
          <NumberInput value={tabWidth} onChange={setTabWidth} min={1} max={8} />
        </Field>
      </Toolbar>

      <ToolGrid>
        <InputPanel
          label="SQL input"
          value={input}
          onChange={setInput}
          placeholder="select * from users"
          rows={18}
        />
        <OutputPanel label="Formatted" value={output} filename="query.sql" rows={18} />
      </ToolGrid>

      {error && <ErrorNote>{error}</ErrorNote>}
      {!error && output && (
        <Note>
          Only whitespace and keyword casing changed — identifiers, literals and query structure are
          untouched.
        </Note>
      )}
    </>
  );
}
