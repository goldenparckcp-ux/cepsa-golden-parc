export const adminDb = (table: string) => {
  let apiPath = '';
  if (table === 'restaurant_orders') {
    apiPath = '/api/admin/restaurant';
  } else if (table === 'hotel_reservations') {
    apiPath = '/api/admin/hotel';
  } else if (table === 'pool_bookings') {
    apiPath = '/api/admin/pool';
  } else {
    // Fallback/Legacy route
    apiPath = '/api/admin/db';
  }

  return {
    select: (columns = '*') => {
      let orderQuery: any = null;
      const matchQuery: any = {};
      let singleResult = false;
      const execute = async () => {
        if (apiPath === '/api/admin/db') {
          const res = await fetch(apiPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'select',
              table,
              payload: { columns },
              match: matchQuery,
              order: orderQuery,
              single: singleResult
            })
          });
          const data = await res.json();
          return { data, error: res.ok ? null : { message: data.error || 'Request failed' } };
        }

        let url = apiPath;
        const params = new URLSearchParams();
        
        if (matchQuery.order_number) {
          params.append('order_number', matchQuery.order_number);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await res.json();
        return { data, error: res.ok ? null : { message: data.error || 'Request failed' } };
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
      const execute = async () => {
        if (apiPath === '/api/admin/db') {
          const res = await fetch(apiPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'insert', table, payload, select: true })
          });
          const data = await res.json();
          return { data, error: res.ok ? null : { message: data.error || 'Insert failed' } };
        }

        const res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        return { data, error: res.ok ? null : { message: data.error || 'Insert failed' } };
      };
      const chain: any = Object.assign(Promise.resolve().then(() => execute()), {
        select: (cols: any) => chain,
        single: () => chain,
        then: (onfulfilled: any, onrejected: any) => execute().then(onfulfilled, onrejected)
      });
      
      return chain;
    },
    update: (payload: any) => {
      const matchQuery: any = {};
      const execute = async () => {
        if (apiPath === '/api/admin/db') {
          const res = await fetch(apiPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', table, payload, match: matchQuery })
          });
          const data = await res.json();
          return { data, error: res.ok ? null : { message: data.error || 'Update failed' } };
        }

        const res = await fetch(apiPath, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: matchQuery.id, updates: payload })
        });
        const data = await res.json();
        return { data, error: res.ok ? null : { message: data.error || 'Update failed' } };
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
      const matchQuery: any = {};
      const execute = async () => {
        if (apiPath === '/api/admin/db') {
          const res = await fetch(apiPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', table, match: matchQuery })
          });
          const data = await res.json();
          return { data, error: res.ok ? null : { message: data.error || 'Delete failed' } };
        }

        const res = await fetch(apiPath, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: matchQuery.id })
        });
        const data = await res.json();
        return { data, error: res.ok ? null : { message: data.error || 'Delete failed' } };
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

