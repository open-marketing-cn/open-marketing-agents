import { error } from '@sveltejs/kit';
import { articles } from '$lib/articles';
export function entries(){ return articles.map(a=>({slug:a.slug})); }
export function load({params}: {params:{slug:string}}){ const article=articles.find(a=>a.slug===params.slug);if(!article)error(404,'文章不存在');return {article,related:articles.filter(a=>a.slug!==params.slug)}; }
