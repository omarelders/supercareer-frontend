import { RefreshCcw, Target } from 'lucide-react'

export default function ResonanceSection() {
  return (
    <section className="bg-white py-20 lg:py-32 px-6 md:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
        <div className="flex w-full max-w-lg flex-col gap-6">
          <div className="text-xs font-bold text-blue-600 tracking-widest uppercase">
            Algorithmic Optimization
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight md:leading-none tracking-tighter">
            Deep Resonance<br />Match Scoring
          </h2>
          <p className="text-lg font-medium text-muted-foreground leading-7 mt-2">
            Eliminate ambiguity in your search. Our neural engine quantifies the alignment between your professional DNA and market requirements in real-time.
          </p>

          <div className="flex flex-col gap-10 mt-6">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-lg bg-background shrink-0 flex items-center justify-center">
                <Target size={20} className="text-foreground" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1 w-96">
                <p className="text-lg font-bold text-foreground">Dynamic Alignment</p>
                <p className="text-base font-medium text-muted-foreground leading-6">Continuous match reassessment as market conditions evolve.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-lg bg-background shrink-0 flex items-center justify-center">
                <RefreshCcw size={21} className="text-foreground" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1 w-96">
                <p className="text-lg font-bold text-foreground">Contextual Calibration</p>
                <p className="text-base font-medium text-muted-foreground leading-6">Automated resume adjustor out of your credentials for maximum visibility.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[528px] shrink-0 mx-auto lg:mx-0">
          <div className="relative rounded-[32px] box-border p-6 sm:p-10 flex flex-col gap-6 sm:gap-8 bg-[#0B0F19] border border-[#1E293B] shadow-marketing-glow z-10 w-full min-h-[500px] lg:h-[729px]">
            <div className="absolute -right-[20px] sm:-right-[80px] -bottom-[20px] sm:-bottom-[80px] w-[200px] sm:w-[320px] h-[200px] sm:h-[320px] rounded-full bg-[#2563EB]/20 blur-[30px] sm:blur-[50px] z-0 pointer-events-none" />
            
            <div className="relative z-10 w-full h-auto rounded-[16px] p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 box-border" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(2px)' }}>
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] sm:text-xs font-bold text-white/80 tracking-widest uppercase truncate mr-2">SYSTEM MATCH INDEX</span>
                <span className="text-xl sm:text-2xl font-black text-[#2563EB] leading-none pb-1">92.4</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full relative">
                <div className="absolute left-0 top-0 bottom-0 bg-[#2563EB] shadow-marketing-index rounded-full w-[92%]" />
              </div>
              <div className="flex justify-between w-full text-[10px] sm:text-xs font-bold text-white/40 tracking-widest uppercase mt-1">
                <span>PROBABILITY ^ / v</span>
                <span>CONFIDENCE: 98%</span>
              </div>
            </div>

            <div className="relative z-10 w-full flex-1 min-h-[300px] sm:min-h-[446px] rounded-[16px] border border-white/10 overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[#0B0F19] bg-gradient-to-t from-[#0B0F19] to-transparent z-10 opacity-80" />
              <div className="z-20 text-center pb-16 sm:pb-20">
                <div className="text-4xl sm:text-5xl font-black text-[#cbd5e1] tracking-widest leading-none mb-1 opacity-90">ATS</div>
                <div className="text-[10px] sm:text-xs font-bold text-[#475569] tracking-widest opacity-80">MATCHSCORE</div>
              </div>
              <div className="w-full space-y-2 mt-auto z-20 absolute bottom-6 sm:bottom-8 px-6 sm:px-12">
                <div className="text-[9px] sm:text-xs text-slate-700 tracking-widest flex justify-between uppercase mb-1">
                  <span>ATS</span><span>MATCH</span><span>SCORE</span><span>ANALYSIS</span>
                </div>
                <div className="w-full h-8 sm:h-10 border-b border-[#334155]/30 relative flex items-end justify-between px-1 sm:px-2">
                  {[3, 6, 4, 8, 5, 2].map((height, index) => (
                    <div key={index} className="w-4 sm:w-8 bg-[#1e293b] opacity-50 rounded-t-sm" style={{ height: `${height * 10}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
