import React from 'react';
import axios from 'axios';
import {
  Table,
  Header,
  HeaderRow,
  HeaderCell,
  Body,
  Row,
  Cell,
  useCustom,
} from '@table-library/react-table-library/table';
import { usePagination } from '@table-library/react-table-library/pagination';
import { useSort, HeaderCellSort } from '@table-library/react-table-library/sort'; 
import { useTheme } from 'styled-components';

const BASE_URL = 'http://hn.algolia.com/api/v1/search';

const INITIAL_PARAMS = {
  search: '',
  page: 0,
};


/*const list = [
  {
    id: '1',
    name: 'VSCode',
    deadline: new Date(2020, 1, 17),
    type: 'SETUP',
    isComplete: true,
  },
  {
    id: '2',
    name: 'JavaScript',
    deadline: new Date(2020, 2, 28),
    type: 'LEARN',
    isComplete: true,
  },
  {
    id: '3',
    name: 'React',
    deadline: new Date(2020, 3, 8),
    type: 'LEARN',
    isComplete: false,
  }
];*/

function App() {
  //themes
  
  const theme = useTheme({
    Row: `
      cursor: pointer;

      .td {
        border-top: 1px solid #a0a8ae;
        border-bottom: 1px solid #a0a8ae;
      }

      &:hover .td {
        border-top: 1px solid orange;
        border-bottom: 1px solid orange;
      }
    `,
  });


  //const data = { nodes: list };
  const [data, setData] = React.useState({ 
          nodes: [],
          totalPages: 0, });

  //const sort = useSort(data);

  const fetchData = React.useCallback(async (params) => {
    const url = `${BASE_URL}?query=${params.search}&page=${params.page}`;
    const result = await axios.get(url);

    setData({ 
      nodes: result.data.hits,
      totalPages: result.data.nbPages, });
  }, []);

  React.useEffect(() => {
    fetchData({
      search: INITIAL_PARAMS.search,
      page: INITIAL_PARAMS.page,
    });
  }, [fetchData]);

   // server-side search

   const [search, setSearch] = React.useState(INITIAL_PARAMS.search);
   const handleSearch = (event) => {
     setSearch(event.target.value);
   };

   useCustom('search', data, {
    state: { search },
    onChange: onSearchChange,
  });

  // listeners
  const timeout = React.useRef();
  function onSearchChange(action, state) {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(
      () =>
        fetchData({
        search: state.search,
        page: pagination.state.page,
    }),
    500
    );
  }
   // server-side pagination
  const pagination = usePagination(
    data, 
    {
    state: {
      page: INITIAL_PARAMS.page,
      size: 5,
    },
    onChange: onPaginationChange,
  },
  {
    isServer: true,
  }
  );

  function onPaginationChange(action, state) {
    fetchData({
      search,
      page: state.page,
    });
  }

  //sorting

  const sort = useSort(data,
    {
      onChange: onSortChange,
    },
    {
      sortFns: {
      TITLE: (array) =>
        array.sort((a, b) => a.name.localeCompare(b.name)),
        POINTS: (array) =>
        array.sort((a, b) => a-b),
        COMMENTS: (array) => 
        array.sort((a, b) => a-b),
    },
    }
  );
  function onSortChange(action, state) {
    console.log(action, state);
  }

  return (
    <div className="App">
      <label htmlFor="search">
        Search by Title:
        <input
          id="search"
          type="text"
          value={search}
          onChange={handleSearch}
        />
      </label>
      <Table data={data} pagination={pagination} sort={sort} theme={theme}>
      {(tableList) => (
        <>
        <Header>
          <HeaderRow>
              <HeaderCell>Title</HeaderCell>
              <HeaderCellSort sortKey='DATE'>Created At</HeaderCellSort>
              <HeaderCellSort sortKey='POINTS'>Points</HeaderCellSort>
              <HeaderCellSort sortKey='COMMENTS'>Comments</HeaderCellSort>
          </HeaderRow>
        </Header>
        <Body>
        {tableList.map((item) => (
          <Row key={item.objectId} item={item}>
            <Cell><a href={item.url}>{item.title}</a></Cell>
            <Cell>
            {new Date(
                    item.created_at
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
            </Cell>
            <Cell>{item.points}</Cell>
            <Cell>{item.num_comments}</Cell>
          </Row>
        ))}
      </Body>
      </>
      )}
    </Table>
    <div
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <span>
          Total Pages: {data.totalPages}
        </span>
        
        <br/>
        <span>
          Page:{' '}
          {Array(data.totalPages)
            .fill().map((_, index) => (
            <button
              key={index}
              type="button"
              style={{
                fontWeight:
                  pagination.state.page === index
                    ? 'bold'
                    : 'normal',
              }}
              onClick={() => pagination.fns.onSetPage(index)}
            >
              {index + 1}
            </button>
          ))}
            </span>
      </div>
    </div>
  );
}

export default App;
