import React from 'react'


//       const res = await axios.get(`${API}/api/assistance/allAssistance`);


function AccontAssistncePage() {
  return (
      <div className="mt-8 overflow-visible rounded-lg border border-blue-400 shadow-sm">
          <div className=" overflow-y-visible">
              <table className="w-full h-9xl text-left border-collapse bg-white">
                  <thead>
                      <tr className="bg-[#fdf2d7]">
                          <th className="p-4 font-semibold text-slate-700 border-b">M.S. Name</th>
                          <th className="p-4 font-semibold text-slate-700 border-b">Family Member</th>
                          <th className="p-4 font-semibold text-slate-700 border-b">Relation</th>
                          <th className="p-4 font-semibold text-slate-700 border-b">Assistance</th>
                          <th className="p-4 font-semibold text-slate-700 border-b">F.A.N ID</th>
                          <th className="p-4 font-semibold text-slate-700 border-b">Status</th>
                          <th className="p-4 font-semibold text-slate-700 border-b text-center">Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      
                  </tbody>
                  </table>
          </div>
      </div>
  )
}

export default AccontAssistncePage