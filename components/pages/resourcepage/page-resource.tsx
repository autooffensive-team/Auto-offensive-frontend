import Hero from "./hero";
import QuickStartPaths from "./quicksart";
import ResourceSections from "./resource";
import StatusTable from "./status";
import TechnicalDeepDives from "./technical";




export default function ResourceComponent(){
    return(
    <div className="resource-page">
    <Hero />
    <QuickStartPaths />
    <ResourceSections />
    <StatusTable />
    <TechnicalDeepDives />

    </div>
    )

}
