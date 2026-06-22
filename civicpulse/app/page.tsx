import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { UploadSection } from "@/components/upload-section"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <UploadSection />
      <SiteFooter />
    </main>
  )
}