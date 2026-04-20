import { Download, PartyPopper, CalendarDays } from "lucide-react";
import dayjs from "dayjs";

const BirthdayItem = ({ name = "Unknown", date, type }) => {
    // 1. Safety Check: If no date, don't render or show fallback
    if (!date) return null;

    // 2. Logic for Today and Countdown
    const today = dayjs();
    const bday = dayjs(date).year(today.year());
    const finalBday = bday.isBefore(today, 'day') ? bday.add(1, 'year') : bday;
    const diff = finalBday.diff(today, 'day');
    const isToday = today.format("MM-DD") === dayjs(date).format("MM-DD");

    // 3. Safety Check for Name: Get first letter safely
    const firstLetter = name && name.length > 0 ? name.charAt(0).toUpperCase() : "?";

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([`Birthday Reminder: ${name}\nDate: ${date}\nType: ${type}`], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${name.replace(/\s+/g, '_')}_birthday.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <li className={`flex items-center justify-between p-3 rounded-lg transition-all border mb-2 ${isToday
                ? "bg-pink-50 border-pink-200 shadow-sm ring-1 ring-pink-200"
                : "bg-white border-transparent hover:border-gray-100 shadow-sm"
            }`}>
            <div className="flex items-center gap-3">
                {/* Avatar with safety check */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isToday
                        ? "bg-pink-500 text-white animate-bounce"
                        : "bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-600"
                    }`}>
                    {isToday ? <PartyPopper size={18} /> : firstLetter}
                </div>

                <div className="text-sm overflow-hidden">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 truncate">{name}</p>
                        {isToday && (
                            <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full uppercase font-black shrink-0">
                                Today
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CalendarDays size={12} className="shrink-0" />
                        {dayjs(date).format("DD MMM")}
                        <span className="mx-1">•</span>
                        <span className={isToday ? "text-pink-600 font-semibold" : "text-blue-500"}>
                            {isToday ? "Happy Birthday!" : `${diff} days to go`}
                        </span>
                    </p>
                </div>
            </div>

            {/* <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors shrink-0"
            >
                <Download size={16} />
            </button> */}
        </li>
    );
};

export default BirthdayItem;