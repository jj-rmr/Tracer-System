import Link from "next/link";
import { RiArrowDownSLine, RiArrowRightSLine } from "react-icons/ri";

export default function FAQsPage() {
  return (
    <>
      <div className="flex flex-row gap-2 text-3xl font-bold items-center">
        <Link href="/settings" className="text-accent/50 hover:text-accent/75 transition-color duration-300 flex flex-row gap-2 items-center">
          <h1 >Settings </h1>
          <RiArrowRightSLine size={32} />          
        </Link>
        <h1>FAQs</h1>
      </div>
      <p className="text-foreground">This is the FAQs page.</p>
      <div className="flex flex-col gap-2 mt-8 md:mt-12 items-center">
        <div className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-col border border-surface/50 items-start hover:bg-surface/10 active:bg-surface/10 cursor-pointer active:scale-95 transition-all ease-out duration-300">
          <div className="flex flex-row justify-between w-full">
            <p className="font-semibold">Question 1</p>
            <RiArrowDownSLine size={24} className="rotate-180"/>
          </div>
          <div className="mt-4 text-foreground">Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis modi quod dolore nesciunt recusandae corporis, quam, quas architecto ad aspernatur, rerum ex assumenda ab sint vel perferendis explicabo illo dolor?</div>
        </div>
        <div className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-row border border-surface/50 justify-between items-center hover:bg-surface/10 active:bg-surface/10 cursor-pointer active:scale-95 transition-all ease-out duration-300">
          <p className="font-semibold">Question 2</p>
          <RiArrowDownSLine size={24}/>
        </div>
        <div className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-row border border-surface/50 justify-between items-center hover:bg-surface/10 active:bg-surface/10 cursor-pointer active:scale-95 transition-all ease-out duration-300">
          <p className="font-semibold">Question 3</p>
          <RiArrowDownSLine size={24} />
        </div>
      </div>
    </>
  );
}
