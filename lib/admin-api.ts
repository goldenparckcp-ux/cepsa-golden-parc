export const adminDb = (table: string) => {
  return {
    select: (columns = '*') => {
      let orderQuery: any = null;
      let matchQuery: any = {};
      let singleResult = false;
      const execute = async () => {
        const res = await fetch('/api/admin/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'select', table, payload: { columns }, order: orderQuery, match: matchQuery, single: singleResult })
        });
        return await res.json();
      };
      
      const chain: any = Object.assign(Promise.resolve().then(() => execute()), {
        order: (col: string, opts: { ascending: boolean } = { ascending: true }) => {
          orderQuery = { column: col, ascending: opts.ascending };
          return chain;
        },
        eq: (col: string, val: any) => {
          matchQuery[col] = val;
          return chain;
        },
        limit: (n: number) => {
          return chain;
        },
        maybeSingle: () => {
          singleResult = true;
          return chain;
        },
        single: () => {
          singleResult = true;
          return chain;
        },
        then: (onfulfilled: any, onrejected: any) => execute().then(onfulfilled, onrejected)
      });
      return chain;
    },
    insert: (payload: any): any => {
      // Fake a chained object that supports .select().single()
      let wantSelect = false;
      let wantSingle = false;

      const execute = async () => {
        const res = await fetch('/api/admin/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'insert', table, payload, select: wantSelect })
        });
        const json = await res.json();
        if (wantSingle && json.data && Array.isArray(json.data)) {
           json.data = json.data[0];
        }
        return json;
      };

      const chain: any = Object.assign(Promise.resolve().then(() => execute()), {
        select: (cols: any) => {
          wantSelect = true;
          return chain;
        },
        single: () => {
          wantSingle = true;
          return chain;
        },
        then: (onfulfilled: any, onrejected: any) => execute().then(onfulfilled, onrejected)
      });
      
      return chain;
    },
    update: (payload: any) => {
      let matchQuery: any = {};
      const execute = async () => {
        const res = await fetch('/api/admin/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', table, payload, match: matchQuery })
        });
        return await res.json();
      };

      const chain: any = Object.assign(Promise.resolve().then(() => execute()), {
        eq: (col: string, val: any) => {
          matchQuery[col] = val;
          return chain;
        },
        then: (onfulfilled: any, onrejected: any) => execute().then(onfulfilled, onrejected)
      });
      return chain;
    },
    delete: () => {
      let matchQuery: any = {};
      const execute = async () => {
        const res = await fetch('/api/admin/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', table, match: matchQuery })
        });
        return await res.json();
      };

      const chain: any = Object.assign(Promise.resolve().then(() => execute()), {
        eq: (col: string, val: any) => {
          matchQuery[col] = val;
          return chain;
        },
        then: (onfulfilled: any, onrejected: any) => execute().then(onfulfilled, onrejected)
      });
      return chain;
    }
  };
};
