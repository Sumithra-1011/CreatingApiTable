import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { TableColumnsType} from "antd";
import { Table } from "antd";

interface Stock {
  price: number;
  ticker: string;
  change_amount: number;
  change_percentage: number;
  volume: number;
}

const columns: TableColumnsType<Stock> = [  //Passing Data for Table columns 
  {
    title: "Ticker",
    dataIndex: "ticker",
    key: "ticker",
    sorter: (a, b) => a.ticker.localeCompare(b.ticker),
  },
  {
    title: "Price",
    dataIndex: "price", 
    key: "price",
    sorter: (a, b) => a.price - b.price,
  },
  {
    title: "Change Amount",
    dataIndex: "change_amount",
    key: "change_amount",
    sorter: (a, b) => a.change_amount - b.change_amount, 
  },
];

export const DataFetching = () => {
  const fetchdata = () =>
    axios //Fetching data from Api
      .get(
        "https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo"
      )
      .then((res) => res.data.top_gainers); // Extracting 'top_gainers' array from response

  const {
    data: feachValues,
    error,
    isLoading,
  } = useQuery<Stock[], Error>({  // using react query for caching
    queryKey: ["Stockdata"],
    queryFn: fetchdata,
    staleTime: 1 * 60 * 1000, //1m
  });

  if (isLoading) return <p>Loading...</p>; // display loading
  if (error) return <p>{error.message}</p>; // display error

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-blue-600 text-center font-sans py-4">Stock Data</h2>
      </div>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender: (record) => {
            {
              return ( //expandble table
                <table className="table-auto border-collapse border border-slate-400" style={{width:'50%'}}> 
                  <thead>
                    <tr>
                      <th  className="py-2 border border-slate-300 ">change_amount</th>
                      <th className="py-2 border border-slate-300 ">change_percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="pl-4 py-2 border border-slate-300 " >{record.change_amount}</td>
                      <td className="pl-4 py-2 border border-slate-300 " >{record.change_percentage}</td>
                    </tr>
                  </tbody>
                </table>
              );
            }
          },
        }} 
        dataSource={feachValues?.map((stock) => ({
          ...stock,
          key: stock.ticker,
        }))}
      ></Table>
    </>
  );
};
