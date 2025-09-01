import ProductTable from "@/components/ProductTable";

export default function Loading() {
  return <div className='flex-1 space-y-4 py-6'>
    <div className='flex items-center justify-between space-y-2'>
      <h2 className='text-3xl font-bold tracking-tight'>Products</h2>
      <div className='flex items-center space-x-2'></div>
    </div>
    <ProductTable loading />;
  </div>
}
