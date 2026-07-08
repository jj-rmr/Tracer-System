export default function Settings() {
  const menuItems = [
    {
      title: "Account",
      description:
        "Manage your profile details, update your email address, and change your password.",
      href: "/settings/account",
    },
    {
      title: "Support",
      description:
        "Get help with your account, report bugs, or contact our customer support team.",
      href: "/settings/support",
    },
    {
      title: "FAQs",
      description:
        "Find quick answers to common questions about billing, usage, and features.",
      href: "/settings/faqs",
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-foreground">This is the settings page.</p>

      <div className="flex flex-col gap-2 mt-8 md:mt-12 items-center">
        {menuItems.map((item) => (
          <input
            key={item.title}
            className="w-full lg:max-w-10/12 h-fit rounded-2xl p-4 flex flex-col items-start hover:bg-sky-100 border border-sky-200 cursor-pointer active:scale-95 active:bg-sky-100 transition-all ease-out duration-300"
          ></input>
        ))}
      </div>
    </>
  );
}
