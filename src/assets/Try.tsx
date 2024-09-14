import axios from "axios";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TableColumnsType } from "antd";
import { Table, Spin, Alert } from "antd";

// Define the User interface for user data
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

// Define table columns
const columns: TableColumnsType<User> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
    sorter: (a, b) => a.username.localeCompare(b.username),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    sorter: (a, b) => a.email.localeCompare(b.email),
  },
];

// Fetch user data
const fetchUserData = () =>
  axios
    .get("https://jsonplaceholder.typicode.com/users")
    .then((res) => res.data);

// Fetch additional user details for expanded row
const fetchUserDetails = async (userId: number) => {
  const res = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`);
  return res.data;
};

// React component to display the user table
export const Try = () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const queryClient = useQueryClient();
  const [userDetailsMap, setUserDetailsMap] = useState<Record<number, User>>({});

  // Fetch user data
  const { data: userData, error, isLoading } = useQuery<User[], Error>({
    queryKey: ["UserData"],
    queryFn: fetchUserData,
  });

  const handleExpand = async (expanded: boolean, record: User) => {
    setExpandedRowKeys(expanded ? [record.id] : []);
    if (expanded && !userDetailsMap[record.id]) {
      try {
        // Prefetch user details only if not already fetched
        await queryClient.prefetchQuery(
          ["UserDetails", record.id],
          () => fetchUserDetails(record.id),
          {
            staleTime: 5 * 60 * 1000, // Keep the data fresh for 5 minutes
          }
        );

        // Fetch the actual data from the cache if prefetching was successful
        const data = queryClient.getQueryData(["UserDetails", record.id]);

        if (data) {
          setUserDetailsMap((prev) => ({ ...prev, [record.id]: data }));
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }
  };

  // Expanded row details
  const expandedRowRender = (record: User) => {
    const userDetails = userDetailsMap[record.id];

    if (!userDetails) return <Spin />;

    return (
      <table className="table-auto border-collapse border border-slate-400" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th className="py-2 border border-slate-300">Address</th>
            <th className="py-2 border border-slate-300">Phone</th>
            <th className="py-2 border border-slate-300">Website</th>
            <th className="py-2 border border-slate-300">Company</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="pl-4 py-2 border border-slate-300">
              {userDetails.address.street}, {userDetails.address.suite}, {userDetails.address.city}, {userDetails.address.zipcode}
            </td>
            <td className="pl-4 py-2 border border-slate-300">{userDetails.phone}</td>
            <td className="pl-4 py-2 border border-slate-300">{userDetails.website}</td>
            <td className="pl-4 py-2 border border-slate-300">{userDetails.company.name}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  // Handle loading and error states
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error.message}</p>;

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-blue-600 text-center font-sans py-4">
          User Data
        </h2>
      </div>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: handleExpand,
        }}
        dataSource={userData?.map((user) => ({
          ...user,
          key: user.id,
        }))}
      />
    </>
  );
};


