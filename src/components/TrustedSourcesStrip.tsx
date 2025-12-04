const TrustedSourcesStrip = () => {
  const sources = ["CNBC", "Bloomberg", "Investing.com", "CNN Business", "Financial Times", "MarketWatch"];
  return <section id="sources" className="py-12 bg-[#c90404] border-y border-primary-dark -mx-6 md:mx-0">
     <div className="w-full px-0">
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0">
            
          </div>
          
          <div className="flex-1 relative overflow-hidden">
  <div className="news-ticker gap-12 items-center px-[24px]">
              {/* First set */}
              {sources.map((source, index) => <div key={`first-${index}`} className="flex-shrink-0 text-xl font-bold text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  {source}
                </div>)}
              {/* Duplicate set for seamless loop */}
              {sources.map((source, index) => <div key={`second-${index}`} className="flex-shrink-0 text-xl font-bold text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  {source}
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default TrustedSourcesStrip;