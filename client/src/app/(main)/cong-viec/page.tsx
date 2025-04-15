import getServerSession from "@/app/libs/session";

export default async function Task() {
  await getServerSession();

  return (
    <section className="w-full bg-gray-100 py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"></div>
    </section>
  );
}
