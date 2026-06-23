import { RiArrowDownSLine } from "react-icons/ri";

export default function FAQsPage() {
  return (
    <div className="w-full max-w-6xl px-6 py-12 h-screen">
      <h1 className="text-3xl font-bold">FAQs</h1>
      <p className="text-slate-600">This is the FAQs page.</p>
      <div className="flex flex-col gap-2 mt-8 items-center">
        <div className="w-full max-w-100 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-surface/20 cursor-pointer active:scale-95 transition-all ease-out duration-300">
          <div className="flex flex-row justify-between w-full">
            <p className="font-semibold">Question 1</p>
            <RiArrowDownSLine size={24} className="rotate-180"/>
          </div>
          <div className="mt-4 text-slate-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis modi quod dolore nesciunt recusandae corporis, quam, quas architecto ad aspernatur, rerum ex assumenda ab sint vel perferendis explicabo illo dolor?</div>
        </div>
        <div className="w-full max-w-100 h-fit rounded-2xl p-4 flex flex-row justify-between items-center hover:bg-surface/20 cursor-pointer active:scale-95 transition-all ease-out duration-300">
          <p className="font-semibold">Question 2</p>
          <RiArrowDownSLine size={24}/>
        </div>
        <div className="w-full max-w-100 h-fit rounded-2xl p-4 flex flex-row justify-between items-center hover:bg-surface/20 cursor-pointer active:scale-95 transition-all ease-out duration-300">
          <p className="font-semibold">Question 3</p>
          <RiArrowDownSLine size={24} />
        </div>
      </div>
    </div>
  );
}
