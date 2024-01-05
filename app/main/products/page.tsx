import { Table } from "antd";

export default function Products() {
  return (
    <main>
      <Table virtual scroll={{ x: 2000, y: 500 }} />
    </main>
  );
}
