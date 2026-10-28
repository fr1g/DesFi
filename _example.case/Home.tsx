import { loremIpsum } from "../_shared/lorem";

export default function Home() {

    return <div className="w-full h-screen bg-amber-700 font-maple-mono relative overflow-hidden">

        <div id="content" className="z-1 w-full h-full relative flex justify-end pr-3 items-center ">
            <div className="h-full min-w-5 grow ?pr-3">
                <div className="h-full w-full bg-amber-50/25 backdrop-blur-[2px] shadow-amber-50/25 shadow-xl "></div>
            </div>
            <h1 className="text-[min(24vw,160px)]/[1.033] 2xl:text-[min(24vw,300px)]/[1.033] text-amber-50 text-right w-fit -translate-y-3 pl-3"><span className="font-bold">Example</span> <br /> <span className="text-amber-100/90">Page</span></h1>
        </div>

        <div className="background w-screen h-screen rotate-12 text-amber-600/60 absolute z-0 scale-200 top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2">
            {loremIpsum}
        </div>
    </div>
}