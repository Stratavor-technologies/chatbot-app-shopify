import{c as p,d as S,e as d,f,_ as w}from"./components-BnUS28CX.js";import{r as i}from"./jsx-runtime-DexIYAB0.js";/**
 * @remix-run/react v2.8.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let n="positions";function k({getKey:r,...a}){let{isSpaMode:l}=p(),o=S(),c=d();f({getKey:r,storageKey:n});let u=i.useMemo(()=>{if(!r)return null;let e=r(o,c);return e!==o.key?e:null},[]);if(l)return null;let y=((e,m)=>{if(!window.history.state||!window.history.state.key){let t=Math.random().toString(32).slice(2);window.history.replaceState({key:t},"")}try{let s=JSON.parse(sessionStorage.getItem(e)||"{}")[m||window.history.state.key];typeof s=="number"&&window.scrollTo(0,s)}catch(t){console.error(t),sessionStorage.removeItem(e)}}).toString();return i.createElement("script",w({},a,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${y})(${JSON.stringify(n)}, ${JSON.stringify(u)})`}}))}export{k as S};
