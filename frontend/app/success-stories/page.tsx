import { Heart, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SuccessStories() {
  const stories = [
    {
      title: "Digital Literacy in Rural Bihar",
      impact: "500 students gained computer access",
      ngo: "Education First Foundation",
      location: "Patna, Bihar",
      date: "Dec 2025",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000",
      description: "Funds were used to set up 20 computer labs. Every laptop was serial-tracked and verified by our on-ground team."
    },
    {
      title: "Emergency Oxygen Plants",
      impact: "300+ lives saved daily",
      ngo: "HealthCare India",
      location: "Nagpur, Maharashtra",
      date: "Nov 2025",
      image: "https://cpimg.tistatic.com/6896590/b/4/oxygen-plant.jpeg",
      description: "Successfully installed 2 high-capacity oxygen generation plants. Real-time sensor data is connected to our transparency dashboard."
    },
    {
      title: "Clean Water Initiative",
      impact: "12 new borewells installed",
      ngo: "Care India Trust",
      location: "Jodhpur, Rajasthan",
      date: "Oct 2025",
      image: "https://drinkprime.in/blog/wp-content/uploads/2024/10/6.-Bridging-the-Clean-Water-Gap-in-Rural-India-The-Role-of-Technology-and-Water-Purification.jpg",
      description: "Provided clean drinking water to over 5,000 villagers. Geotagged photos of every well are available in the public ledger."
    },
    {
      title: "Urban Forestation Drive",
      impact: "10,000 saplings planted",
      ngo: "GreenEarth Society",
      location: "Bengaluru, Karnataka",
      date: "Sept 2025",
      image: "https://dguz3ah43p96r.cloudfront.net/wp-content/uploads/2024/06/Tree-Plantation-Drive-by-the-Pune-Centre.jpeg",
      description: "A community-led project to increase the green cover. Drones were used to verify the survival rate of the saplings after 3 months."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none mb-4">
            Verified Impact
          </Badge>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
            Our <span className="text-blue-600">Success Stories</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
            Real people. Real impact. Explore how your contributions have transformed lives across India.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {stories.map((story, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-72">
                <img 
                  src={story.image} 
                  alt={story.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-6 left-6 flex gap-2">
                   <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 size={14} className="text-blue-600" /> Verified Proof
                  </div>
                </div>
              </div>
              
              <div className="p-10">
                <div className="flex items-center gap-4 text-slate-400 text-sm mb-4">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {story.location}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {story.date}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{story.title}</h3>
                <p className="text-blue-600 font-bold text-lg mb-4">{story.impact}</p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {story.description}
                </p>
                
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Partner NGO</p>
                    <p className="font-semibold text-slate-800">{story.ngo}</p>
                  </div>
                  <button className="text-blue-600 font-bold hover:underline">View Timeline →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}