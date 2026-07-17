/**
 * Local Supabase mock — traduz queries do supabase-js para a API REST local.
 * Aponta para /api (roteado pelo proxy compartilhado do Replit).
 */

const API_BASE = "/api";

type Row = Record<string, any>;

class QueryBuilder {
  private _table: string;
  private _selectCols: string = "*";
  private _filters: Array<{ col: string; val: string | number }> = [];
  private _single = false;
  private _insertData: Row | null = null;
  private _isCount = false;
  private _isHead = false;

  constructor(table: string) {
    this._table = table;
  }

  select(cols: string = "*", opts?: { count?: string; head?: boolean }) {
    this._selectCols = cols;
    if (opts?.count) this._isCount = true;
    if (opts?.head) this._isHead = true;
    return this;
  }

  eq(col: string, val: string | number) {
    this._filters.push({ col, val });
    return this;
  }

  limit(_n: number) { return this; }

  single() {
    this._single = true;
    return this;
  }

  insert(data: Row) {
    this._insertData = data;
    return this;
  }

  then(resolve: (v: any) => void, reject?: (e: any) => void) {
    this._execute().then(resolve).catch(reject ?? console.error);
  }

  private async _execute(): Promise<{ data: any; error: any; count?: number | null }> {
    try {
      if (this._insertData !== null) return this._handleInsert();
      return this._handleSelect();
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  private async _handleInsert(): Promise<{ data: any; error: any }> {
    if (this._table === "registrations") {
      const r = await fetch(`${API_BASE}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this._insertData),
      });
      const body = await r.json();
      if (!r.ok) return { data: null, error: { message: body.error ?? "Erro ao cadastrar" } };
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

  private async _handleSelect(): Promise<{ data: any; error: any; count?: number | null }> {
    if (this._table === "registrations") {
      if (this._isCount || this._isHead) {
        const r = await fetch(`${API_BASE}/registrations`);
        if (!r.ok) return { data: null, error: await r.json(), count: null };
        const body = await r.json();
        return { data: null, error: null, count: body.count ?? 0 };
      }

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

export function createLocalClient() {
  return {
    from(table: string) {
      return new QueryBuilder(table);
    },
  };
}
