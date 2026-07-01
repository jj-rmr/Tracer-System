import Link from "next/link";

export default function Settings() {
  const menuItems = [
    {
      title: "Account",
      description: "Manage your profile details, update your email address, and change your password.",
      href: "/settings/account",
    },
    {
      title: "Security",
      description: "Two-factor authentication, active sessions, and security log controls.",
      href: "/settings/security",
    },
    {
      title: "Support",
      description: "Get help with your account, report bugs, or contact our customer support team.",
      href: "/settings/support",
    },
    {
      title: "FAQs",
      description: "Find quick answers to common questions about billing, usage, and features.",
      href: "/settings/faqs",
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-foreground">This is the settings page.</p>
      
      <div className="flex flex-col gap-2 mt-8 md:mt-12 items-center">
        {menuItems.map((item) => (
          <Link 
            key={item.title}
            href={item.href} 
            className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-sky-100 border border-sky-200 cursor-pointer active:scale-95 active:bg-sky-100 transition-all ease-out duration-300"
          >
            <div className="flex flex-row justify-between w-full">
              <p className="font-semibold">{item.title}</p>
            </div>
            <div className="mt-4 text-foreground">
              {item.description}
            </div>
          </Link>
        ))}

        <div className="mt-8 md:mt-12 w-fit h-fit rounded-2xl px-6 py-4 flex flex-col items-start hover:bg-red-100 bg-red-400 hover:text-red-400 text-white border border-red-400 cursor-pointer active:scale-95 transition-all ease-out duration-300">
          <div className="flex flex-row justify-between w-full">
            <p className="font-semibold">Sign Out</p>
          </div>
        </div>
      </div>
    </>
  );
}