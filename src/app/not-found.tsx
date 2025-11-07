import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff, Home, Book } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center w-full flex-1 bg-linear-to-b from-background to-muted/20">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-8">
        {/* Media Offline Icon with animation */}
        {/* <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
            <WifiOff className="relative w-24 h-24 text-muted-foreground/40 animate-bounce" />
          </div>
        </div> */}

        {/* Main heading */}
        {/* <div className="space-y-2 text-center pb-8">
          <h1 className="text-8xl font-bold text-primary/20">404</h1> */}
          {/* <h2 className="text-3xl font-semibold text-foreground">
            Media Offline
          </h2> */}
        {/* </div> */}

        {/* Description */}
        <div className="text-lg text-muted-foreground max-w-md ml-0 space-y-1 pb-8 text-left">
          <p>Media offline</p>
          <p>メディアオフライン</p>
          <p>Média hors ligne</p>
          <p>Offline-Medien</p>
          <p>脱机媒体文件</p>
          <p>Medios sin conexión</p>
          <p>Oggetto multimediale non in linea</p>
          <p>미디어 오프라인</p>
          <p>Медиаданные в автономном режиме</p>
          <p>Mídia offline</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="min-w-[160px]">
            <Link href="/docs">
              <Book className="mr-2 h-4 w-4" />
              Browse Docs
            </Link>
          </Button>
        </div>

        {/* Additional helpful links */}
        <div className="pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <Link 
              href="/apps-and-tools" 
              className="text-primary hover:underline underline-offset-4"
            >
              Apps & Tools
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link 
              href="/features" 
              className="text-primary hover:underline underline-offset-4"
            >
              Features
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link 
              href="/docs/tutorials" 
              className="text-primary hover:underline underline-offset-4"
            >
              Tutorials
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

