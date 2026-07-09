/**
 * Local Supabase mock — traduz queries do supabase-js para a API REST local.
 * Usado quando VITE_SUPABASE_URL aponta para localhost.
 */

const API_BASE = import.meta.env.VITE_SUPABASE_URL + "/api";

type Row = Record<string, any>;

class QueryBuilder {
  private _table: string;
  private _selectCols: string = "*";
  private _filters: Array<{ col: string; val: string | number }> = [];
  private _single = false;
  private _insertData: Row | null = null;
  private _isCount = false;
  private _isHead = false;
  private _afterInsert = false; // .insert().select()

  constructor(table: string) {
    this._table = table;
  }

  // ── select ──────────────────────────────────────────────
  select(cols: string = "*", opts?: { count?: string; head?: boolean }) {
    this._selectCols = cols;
    if (opts?.count) this._isCount = true;
    if (opts?.head) this._isHead = true;
    return this;
  }

  // ── filters ─────────────────────────────────────────────
  eq(col: string, val: string | number) {
    this._filters.push({ col, val });
    return this;
  }

  limit(n: number) { return this; } // not needed for local

  single() {
    this._single = true;
    return this;
  }

  // ── insert ───────────────────────────────────────────────
  insert(data: Row) {
    this._insertData = data;
    return this;
  }

  // ── thenable so `await supabase.from(...)` works ─────────
  then(resolve: (v: any) => void, reject?: (e: any) => void) {
    this._execute().then(resolve).catch(reject ?? console.error);
  }

  // ─────────────────────────────────────────────────────────
  private async _execute(): Promise<{ data: any; error: any; count?: number | null }> {
    try {
      if (this._insertData !== null) return this._handleInsert();
      return this._handleSelect();
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  // ── INSERT ───────────────────────────────────────────────
  private async _handleInsert(): Promise<{ data: any; error: any }> {
    if (this._table === "registrations") {
      const r = await fetch(`${API_BASE}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._insertData),
      });
      const body = await r.json();
      if (!r.ok) return { data: null, error: { message: body.error ?? "Erro ao cadastrar" } };
      // suporte a .insert().select().single()
      return { data: body, error: null };
    }

    if (this._table === "enrollments") {
      const r = await fetch(`${API_BASE}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: this._insertData!.registration_id,
          minicourseId: this._insertData!.minicourse_id,
        }),
      });
      const body = await r.json();
      if (!r.ok) return { data: null, error: { message: body.error ?? "Erro ao matricular" } };
      return { data: body, error: null };
    }

    return { data: null, error: { message: `Insert não suportado: ${this._table}` } };
  }

  // ── SELECT ───────────────────────────────────────────────
  private async _handleSelect(): Promise<{ data: any; error: any; count?: number | null }> {
    // ── registrations ──
    if (this._table === "registrations") {
      // count query (used in registration page)
      if (this._isCount || this._isHead) {
        const r = await fetch(`${API_BASE}/registrations`);
        if (!r.ok) return { data: null, error: await r.json(), count: null };
        const body = await r.json();
        return { data: null, error: null, count: body.count ?? 0 };
      }

      // lookup by email
      const emailFilter = this._filters.find((f) => f.col === "email");
      if (emailFilter) {
        const r = await fetch(`${API_BASE}/registrations/lookup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailFilter.val }),
        });
        if (r.status === 404) {
          return { data: null, error: { code: "PGRST116", message: "Not found" } };
        }
        if (!r.ok) return { data: null, error: await r.json() };
        const reg = await r.json();
        const result = { id: reg.id, name: reg.name };
        return { data: this._single ? result : [result], error: null };
      }
    }

    // ── enrollments ──
    if (this._table === "enrollments") {
      const regFilter = this._filters.find((f) => f.col === "registration_id");
      if (regFilter) {
        const r = await fetch(`${API_BASE}/registrations/by-id/${regFilter.val}`);
        if (!r.ok) return { data: [], error: null };
        const reg = await r.json();
        const enrollments = (reg.enrollments ?? []).map((e: any) => ({
          minicourse_id: e.minicourseId,
          minicourses: { title: e.title, instructor: e.instructor },
        }));
        return { data: enrollments, error: null };
      }
    }

    // ── minicourses ──
    if (this._table === "minicourses") {
      const r = await fetch(`${API_BASE}/minicourses`);
      if (!r.ok) return { data: null, error: await r.json() };
      const courses = await r.json();
      const mapped = courses.map((c: any) => ({
        ...c,
        max_capacity: c.maxCapacity,
        enrollments: Array.from({ length: c.enrollmentCount ?? 0 }, () => ({ minicourse_id: c.id })),
      }));
      return { data: mapped, error: null };
    }

    return { data: null, error: { message: `Select não suportado: ${this._table}` } };
  }
}

// Supabase-compatible mock client
export function createLocalClient() {
  return {
    from(table: string) {
      return new QueryBuilder(table);
    },
  };
}
