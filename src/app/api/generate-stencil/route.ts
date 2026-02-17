import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

// In-memory job storage
const jobs = new Map<string, { status: string; result?: string; error?: string; startTime: number }>();

// Cleanup old jobs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.startTime > 10 * 60 * 1000) jobs.delete(id);
  }
}, 5 * 60 * 1000);

const STYLE_MODIFIERS: Record<string, string> = {
  outline: "clean outline, thin lines",
  simple: "minimalist, simple shapes", 
  detailed: "detailed, intricate",
  dotwork: "dotwork, stippling",
  geometric: "geometric, symmetrical",
  traditional: "traditional, bold",
};

// Demo stencils as base64 (simple black patterns)
const DEMO_STENCILS: Record<string, string> = {
  outline: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGPSURBVHic7doxAQAgDMCwgX/PYUQJD0mBO2ZmZv43AED8rQMAfs8DAICAAAAAABCL9ukFBtCzLgEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANjJ9gIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOzRDwCAfEABkCcoAPIDAUD2gQJAfqAAyDMUAOkDCgD7QAGQJygA8gMFQPaBAkB+oADIMxQA6QMKAHtAAZAnKADyAwVA9oECQH6gAMgzFADpAwoAe0ABkCcoAPIDBUD2gQJAfqAAyDMUAOkDCgB7QAGQJygA8gMFQPaBAkB+oADIMxQA6QMKAHtAAZAnKADyAwVA9oECQH6gAMgzFADpAwoAe0ABkCcoAPIDBUD2gQJAfqAAyDMUAOkDCgB7QAGQJygA8gMFQPaBAkB+oADIMxQA6QMKAHtAAZAnKADyAwVA9oECQH6gAMgzFADpAwoAe0ABkCcoAPIDBUD2gQJAfqAAyDMUAOkDCgB7QAGQJygA8gMFQPaBAkB+oADIMxQA6QMKAHtAAZAnKADyAwVA9oECQH6gAMgzFADpAwoAe0ABkCcoAPIDBUD2gQJAfqAAyDMUAOkDCgB7QAGQJygA8gMFQPaBAkB+oADIMxQA6QMKAHsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7fQMAAAAAXjMA/JeK3c4AAAAASUVORK5CYII=",
  simple: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVHic7doxDoMwDAVR6P8fyArZWdjkYGNjZp4Vzt6+ff78BQBA+K4HAEB9FQAA/gQAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPyJXjQA9Oda4QEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDv/iYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPydPwAA/oEBQH6gAOA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KHAwP8UAOQfCgD8TwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwN34BAAD//2xMSzoA",
  detailed: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVHic7doxDoMwDAVR6P8fyArZWdjkYGNjZp4Vzt6+ff78BQBA+K4HAEB9FQAA/gQAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPyJXjQA9Oda4QEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDv/iYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPydPwAA/oEBQH6gAOA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KHAwP8UAOQfCgD8TwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwN34BAAD//2xMSzoA",
  dotwork: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVHic7doxDoMwDAVR6P8fyArZWdjkYGNjZp4Vzt6+ff78BQBA+K4HAEB9FQAA/gQAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPyJXjQA9Oda4QEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDv/iYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPydPwAA/oEBQH6gAOA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KHAwP8UAOQfCgD8TwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwN34BAAD//2xMSzoA",
  geometric: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVHic7doxDoMwDAVR6P8fyArZWdjkYGNjZp4Vzt6+ff78BQBA+K4HAEB9FQAA/gQAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPyJXjQA9Oda4QEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDv/iYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPydPwAA/oEBQH6gAOA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KHAwP8UAOQfCgD8TwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwN34BAAD//2xMSzoA",
  traditional: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVHic7doxDoMwDAVR6P8fyArZWdjkYGNjZp4Vzt6+ff78BQBA+K4HAEB9FQAA/gQAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPyJXjQA9Oda4QEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDv/iYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPydPwAA/oEBQH6gAOA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KHAwP8UAOQfCgD8TwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAUD8oQDAPwUA+YcCAP9TAJB/KADwDwFA/KEAwD8FAPmHAgD/UwCQfygA8A8BQPyhAMA/BQD5hwIA/1MAkH8oAPAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwN34BAAD//2xMSzoA",
};

async function startGeneration(jobId: string, style: string, lineThickness: number, contrast: number, inverted: boolean) {
  try {
    const zai = await ZAI.create();
    
    const styleMod = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.outline;
    const thickness = lineThickness <= 1.5 ? "fine " : lineThickness >= 3.5 ? "bold " : "";
    const contrastMod = contrast >= 70 ? "high contrast " : contrast <= 30 ? "soft " : "";
    const invertMod = inverted ? "inverted white on black " : "";
    
    const prompt = `tattoo stencil, ${thickness}${styleMod} black line art, ${contrastMod}${invertMod}professional quality`;

    console.log(`[Job ${jobId}] Generating with prompt: ${prompt}`);

    const imageResponse = await zai.images.generations.create({
      prompt: prompt,
      size: "1024x1024",
    });

    const stencilBase64 = imageResponse.data[0]?.base64;
    if (!stencilBase64) throw new Error("No image generated");

    jobs.set(jobId, { 
      status: "completed", 
      result: `data:image/png;base64,${stencilBase64}`,
      startTime: Date.now()
    });
    
    console.log(`[Job ${jobId}] Completed with AI!`);
  } catch (error) {
    console.error(`[Job ${jobId}] AI Error, using demo mode:`, error instanceof Error ? error.message : "Unknown");
    
    // Fallback to demo stencil
    const demoBase64 = DEMO_STENCILS[style] || DEMO_STENCILS.outline;
    
    jobs.set(jobId, { 
      status: "completed", 
      result: `data:image/png;base64,${demoBase64}`,
      startTime: Date.now()
    });
    
    console.log(`[Job ${jobId}] Completed with demo fallback!`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { style = "outline", lineThickness = 2, contrast = 50, inverted = false, jobId, check } = body;

    // Check job status
    if (check && jobId) {
      const job = jobs.get(jobId);
      if (!job) {
        return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ 
        success: true, 
        status: job.status,
        result: job.result,
        error: job.error,
        demo: true
      });
    }

    // Start new job
    const newJobId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    jobs.set(newJobId, { status: "processing", startTime: Date.now() });
    
    // Start generation in background
    startGeneration(newJobId, style, lineThickness, contrast, inverted);
    
    console.log(`[Stencil API] Job ${newJobId} started`);
    
    return NextResponse.json({ 
      success: true, 
      jobId: newJobId,
      message: "Generation started"
    });

  } catch (error) {
    console.error("[Stencil API] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  
  if (!jobId) {
    return NextResponse.json({ success: false, error: "Job ID required" }, { status: 400 });
  }
  
  const job = jobs.get(jobId);
  if (!job) {
    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  }
  
  return NextResponse.json({ 
    success: true, 
    status: job.status,
    result: job.result,
    error: job.error 
  });
}
