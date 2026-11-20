# Wilson3/s2-pro

## Resumen

Fish Audio S2 Pro es un modelo de síntesis de voz (text-to-speech) desarrollado por Fish Audio, publicado en Hugging Face bajo el identificador Wilson3/s2-pro. Se trata de un sistema TTS de gran escala con control fino de prosodia y emoción mediante instrucciones en lenguaje natural embebidas en el texto, entrenado sobre más de 10 millones de horas de audio en más de 80 idiomas. Combina una arquitectura dual-autorregresiva con alineamiento por refuerzo (RL) y un códec de audio basado en RVQ.

El modelo resuelve el problema del control expresivo localizado en la generación de voz: en lugar de depender de un conjunto fijo de etiquetas predefinidas, acepta descripciones textuales libres como `[whisper in small voice]` o `[professional broadcast tone]` insertadas a nivel de palabra. Esto permite ajustar pausas, énfasis, volumen, emociones y efectos de forma granular sin reentrenar el modelo.

Con 4.561.852.416 parámetros totales (4B en el módulo Slow AR y 400M en el Fast AR), el modelo está diseñado para inferencia en producción con latencia baja: en una NVIDIA H200 alcanza un RTF de 0,195, un time-to-first-audio de aproximadamente 100 ms y más de 3.000 tokens acústicos por segundo. Su arquitectura es estructuralmente isomorfa a la de un LLM autorregresivo estándar, lo que le permite heredar optimizaciones de serving como continuous batching, paged KV cache y RadixAttention.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Dual-AR (Slow AR + Fast AR) y codec de audio RVQ de 10 codebooks a ~21 Hz |
| Parametros totales | 4.561.852.416 |
| Parametros activos | No aplica (no es MoE); 4B en Slow AR y 400M en Fast AR |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 80+ idiomas (zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo y mas) |
| Licencia | Fish Audio Research License (uso no comercial gratuito; comercial requiere licencia aparte) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

S2 Pro se construye sobre un transformer decoder-only combinado con un códec de audio basado en RVQ (Residual Vector Quantization) de 10 codebooks y una tasa de trama de aproximadamente 21 Hz. La innovación central es la arquitectura Dual-Autoregressive: un módulo Slow AR de 4B parámetros opera sobre el eje temporal y predice el codebook semántico primario, mientras que un módulo Fast AR de 400M parámetros genera en cada paso temporal los 9 codebooks residuales restantes, reconstruyendo el detalle acústico fino. Este diseño asimétrico mantiene la eficiencia de inferencia sin sacrificar fidelidad de audio.

El entrenamiento se realizó sobre más de 10 millones de horas de audio en más de 80 idiomas, con alineamiento mediante reinforcement learning. La arquitectura es estructuralmente isomorfa a la de un LLM autorregresivo estándar, lo que permite heredar directamente las optimizaciones de serving de SGLang: continuous batching, paged KV cache, CUDA graph replay y RadixAttention para prefix caching. El release incluye pesos, código de fine-tuning y un motor de inferencia en streaming basado en SGLang.

## Capacidades

- Generación de voz (text-to-speech) de alta fidelidad con control fino de prosodia y emoción.
- Control inline mediante sintaxis `[tag]` con descripciones textuales libres, no limitadas a un conjunto fijo; se soportan más de 15.000 etiquetas únicas.
- Etiquetas comunes: `[pause]`, `[emphasis]`, `[laughing]`, `[whisper]`, `[screaming]`, `[excited tone]`, `[volume up]`, `[sigh]`, `[singing]`, `[audience laughter]`, `[clearing throat]`, entre otras.
- Generación multi-hablante y multi-turno.
- Streaming de baja latencia (time-to-first-audio ~100 ms en H200).
- Inferencia de contexto largo.
- Soporte de más de 80 idiomas, con niveles de calidad por tiers: Tier 1 (ja, en, zh), Tier 2 (ko, es, pt, ar, ru, fr, de) y un amplio conjunto adicional.
- Alineamiento por reinforcement learning para seguir instrucciones de estilo.

## Casos de uso

- Audiolibros y narración expresiva: el modelo permite insertar etiquetas como `[whisper]`, `[emphasis]` o `[pause]` a nivel de palabra para modular la interpretación de cada frase, lo que resulta adecuado para producir narraciones con matices dramáticos sin intervención manual por segmento.
- Doblaje y localización multilingüe: con soporte de más de 80 idiomas y control de acento mediante etiquetas como `[with strong accent]`, se puede generar voz para contenido localizado manteniendo un estilo consistente entre idiomas.
- Asistentes de voz en producción: la arquitectura isomorfa a LLM y el motor SGLang permiten continuous batching y prefix caching, lo que hace viable atender múltiples sesiones concurrentes con RTF bajo y time-to-first-audio de ~100 ms.
- Generación de contenido para podcasts y medios: la capacidad multi-hablante y multi-turno permite sintetizar diálogos entre varios locutores con cambios de emoción y efectos como `[audience laughter]` o `[chuckling]`.
- Accesibilidad y lectura de textos: conversión de documentos largos a audio con control de pausas y énfasis para mejorar la comprensión en lectores con dificultades visuales o cognitivas.
- Prototipado de interfaces conversacionales: desarrolladores pueden generar respuestas de voz expresivas para probar flujos de IVR, chatbots de voz o videojuegos antes de contratar locuciones reales.
- Investigación en TTS y prosodia: el release incluye código de fine-tuning y un motor de streaming, lo que facilita experimentar con control inline y evaluar el impacto de etiquetas libres en la naturalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento proporcionados son métricas de serving en una NVIDIA H200:

| Metrica | Valor |
|---|---|
| Real-Time Factor (RTF) | 0,195 |
| Time-to-first-audio | ~100 ms |
| Throughput | 3.000+ tokens acusticos/s con RTF < 0,5 |
| GPU de referencia | NVIDIA H200 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.561.852.416 parámetros en safetensors y un repo de 11,0 GB, la inferencia en precisión completa requiere del orden de 10-12 GB solo para pesos, más overhead de KV cache y codec.
- GPU recomendadas: NVIDIA H200 según las métricas publicadas; por tamaño, GPUs con 16-24 GB de VRAM (A100, RTX 4090, L40S) son candidatas razonables, aunque no se confirma en la información disponible.
- ¿Cabe en consumer GPU? Probablemente en GPUs de 24 GB como la RTX 4090, aunque no se confirma oficialmente.
- Opciones de despliegue: motor de streaming basado en SGLang incluido en el release; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 0,195, ~100 ms de time-to-first-audio y 3.000+ tokens acústicos/s en H200.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos TTS.

## Limitaciones y advertencias

- Licencia Fish Audio Research License: el uso gratuito está restringido a investigación y fines no comerciales; el uso comercial requiere una licencia separada de Fish Audio (contacto: business@fish.audio).
- El acceso al modelo está sujeto a un gate con aceptación explícita de no generar contenido que viole DMCA o leyes locales, y de usar el modelo solo para fines no comerciales.
- Riesgo de uso indebido para suplantación de voz o deepfakes; la model card no detalla mecanismos de mitigación.
- No se dispone de información sobre sesgos por idioma, acento o género.
- No se dispone de datos sobre tasas de alucinación o artefactos acústicos en textos largos.
- La longitud de contexto no está especificada, lo que limita la planificación de inferencia con entradas extensas.
- Los tipos de cuantización soportados no están documentados.
- El rendimiento en GPUs distintas de H200 no está cuantificado.
- La calidad puede variar entre tiers de idioma: Tier 1 (ja, en, zh) y Tier 2 (ko, es, pt, ar, ru, fr, de) frente al resto.

## Enlaces

- [Hugging Face: Wilson3/s2-pro](https://huggingface.co/Wilson3/s2-pro)
- [Technical Report (arXiv 2603.08823)](https://arxiv.org/abs/2603.08823)
- [Página del paper en Hugging Face](https://huggingface.co/papers/2603.08823)
- [GitHub: fishaudio/fish-speech](https://github.com/fishaudio/fish-speech)
- [Playground: fish.audio](https://fish.audio)
- [Blog: Fish Audio open sources S2](https://fish.audio/blog/fish-audio-open-sources-s2/)
