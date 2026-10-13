import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";
dotenv.config();
const app=express(),port=process.env.PORT||3000;
const __dirname=path.dirname(fileURLToPath(import.meta.url));
app.use(cors({origin:process.env.ALLOWED_ORIGIN||true}));
app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"public")));
const client=process.env.OPENAI_API_KEY?new OpenAI({apiKey:process.env.OPENAI_API_KEY}):null;
app.get("/api/health",(_,res)=>res.json({ok:true,aiConfigured:!!client}));
app.post("/api/ai",async(req,res)=>{
 try{
  if(!client)return res.status(503).json({error:"OPENAI_API_KEY is not configured on the server."});
  const {action,topic,ideas={},essay="",plan=""}=req.body||{};
  let system,user;
  if(action==="outline"){
   system=`You are a patient IELTS Writing Task 2 writing tutor. Help the learner develop THEIR ideas; do not write a complete ready-to-submit essay. Respond in clear English, with brief Russian explanations where useful. Return valid JSON only with keys: thesis_feedback (string), plan (string with Introduction, Body paragraph 1, Body paragraph 2, Conclusion; each paragraph includes purpose, claim, explanation, example suggestion, and linking phrase), logic_gaps (array), useful_vocabulary (array of objects with phrase, Russian translation, example), self_check_questions (array). Preserve the learner's position where possible and identify weak or missing reasoning honestly.`;
   user=`Essay prompt: ${topic}\nLearner's own thinking:\nThesis: ${ideas.thesis}\nArgument 1: ${ideas.argument1}\nArgument 2: ${ideas.argument2}\nOther notes: ${ideas.notes}\nCreate a scaffold based on these notes. If notes are empty, ask guiding questions in the plan instead of inventing a personal opinion.`;
  }else if(action==="review"){
   if(!essay.trim())return res.status(400).json({error:"Essay text is required."});
   system=`You are an IELTS Writing Task 2 tutor. Assess the provided essay cautiously against public IELTS Writing band descriptors, not as an official examiner. Do not rewrite the whole essay. Return valid JSON only. Schema: {"scores":{"task_response":number,"coherence_cohesion":number,"lexical_resource":number,"grammatical_range_accuracy":number},"overall":number,"strengths":[string],"priority_improvements":[string],"grammar":[{"original":string,"suggestion":string,"explanation":string}],"vocabulary":[{"original":string,"suggestion":string,"reason":string}],"structure":[string],"task_response_feedback":string,"revised_examples":[{"original":string,"revision":string,"why":string}]}. Use IELTS band increments of 0.5 from 0 to 9. Calculate overall as an approximate mean rounded to nearest half band. Explain specific examples from this essay; do not invent quotations. If the essay is under 250 words, explicitly mention that Task 2 responses are expected to be at least 250 words and that short length can limit task development. Distinguish language accuracy from idea quality.`;
   user=`Prompt: ${topic}\nOutline (if available): ${plan}\nEssay (${essay.trim().split(/\s+/).length} whitespace-separated tokens):\n${essay}`;
  }else return res.status(400).json({error:"Unsupported action. Use outline or review."});
  const completion=await client.chat.completions.create({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",temperature:0.2,response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content:user}]});
  let content=completion.choices?.[0]?.message?.content;
  if(!content)throw new Error("The AI provider returned an empty response.");
  res.json(JSON.parse(content));
 }catch(err){console.error("AI request failed:",err.message);res.status(502).json({error:"AI request failed. Check server logs and provider configuration."});}
});
app.listen(port,()=>console.log(`PomoWrite backend listening on http://localhost:${port}`));
