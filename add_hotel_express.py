import re

path = 'app/staff/hotel/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add logic for occupancy
occupancy_logic = '''
    const getOccupiedRoomsCount = () => {
        return reservations.filter(r => r.status === "checked_in" && r.room_number).length;
    };
    
    const totalRoomsCount = TOTAL_ROOMS.length;
    const occupancyRate = totalRoomsCount > 0 ? (getOccupiedRoomsCount() / totalRoomsCount) * 100 : 0;
'''

c = re.sub(r'    const filteredReservations = reservations.filter\(res => \{', occupancy_logic + '\n    const filteredReservations = reservations.filter(res => {', c)

ui_injection = '''
                {/* Jauge d'Occupation Express */}
                <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Bed className="w-4 h-4 text-amber-500" /> Occupation de l'Hôtel
                        </h3>
                        <span className="text-xs font-bold text-amber-500">{getOccupiedRoomsCount()} / {totalRoomsCount} Chambres</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }}></div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium text-right">{occupancyRate.toFixed(0)}% Occupé</p>
                </div>

                {/* SEARCH & FILTERS */}'''

c = c.replace('{/* SEARCH & FILTERS */}', ui_injection)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Added hotel express management UI.")
