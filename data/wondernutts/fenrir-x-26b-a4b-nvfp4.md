# Wondernutts/Fenrir-X-26B-A4B-NVFP4

## Resumen

Fenrir-X-26B-A4B-NVFP4 es una conversion cuantizada en formato NVFP4 del modelo Vortex5/Fenrir-X-26B-A4B, publicada por el usuario Wondernutts. El modelo original es un merge de cinco variantes derivadas de google/gemma-4-26B-A4B-it, orientado especificamente a roleplay, escritura creativa, narrativa e ficcion interactiva. Esta version no anade entrenamiento nuevo: solo cambia la representacion de los pesos a 4 bits en coma flotante para reducir el uso de memoria en inferencia.

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) de la familia Gemma 4, con 15.094.456.522 parametros almacenados en safetensors y una ventana de contexto validada de 32.768 tokens. La cuantizacion emplea el formato NVFP4 con escalas FP8 y tamano de grupo 16, y se distribuye como safetensors bajo la libreria compressed-tensors para su uso con vLLM.

Su relevancia actual radica en que permite servir un modelo creativo de esta familia en una sola GPU Blackwell con precision de 4 bits nativa, manteniendo plantilla de chat, tokenizador y modo de razonamiento. La model card enfatiza que las comprobaciones realizadas verifican compatibilidad de servicio, no equivalencia de precision frente al modelo en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Gemma 4, base google/gemma-4-26B-A4B-it) |
| Parametros totales | 15.094.456.522 (~15,1B segun safetensors) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B activos) |
| Longitud de contexto | 32.768 tokens (limite usado en la validacion de servicio) |
| Tipos de cuantizacion | NVFP4 (pesos en coma flotante de 4 bits; activaciones de entrada cuantizadas dinamicamente; grupo 16 con escalas FP8) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo original es un merge, no un entrenamiento desde cero. Se construyo combinando google/gemma-4-26B-A4B-it con cuatro derivados: TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2, Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2, electroglyph/gemma4-26b-fiction-bf16 y Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT, mediante un metodo de merge personalizado (descrito como "bsc merge method") con coeficientes por capa y por filtro. La base es un transformer de mezcla de expertos de la familia Gemma 4, con modulos de atencion (q_proj, k_proj, v_proj, o_proj), capas MLP densas y capas de expertos (experts.gate_up_proj, experts.down_proj).

La conversion NVFP4 fue realizada con llmcompressor 0.14.0, compressed-tensors 0.19.0, Transformers 5.16.1 y PyTorch 2.13.0+cu130. La calibracion uso 128 muestras sinteticas de roleplay de hasta 2.048 tokens cada una (138.503 tokens en total), con el observador `nvfp4_expanded_imatrix` en modo estricto. Quedaron excluidos de la cuantizacion los modulos de vision y audio, los embeddings, los routers y la `lm_head`. La cache KV se dejo sin cuantizar y se sirve en BF16. No se realizo ningun ajuste fino adicional; el proceso solo modifica el almacenamiento de los pesos.

## Capacidades

- Generacion de texto conversacional y narrativo en ingles, con especial enfasis en roleplay, escritura creativa, storytelling e ficcion interactiva.
- Modo de razonamiento (thinking mode) activable mediante `enable_thinking=true`, con parser de razonamiento `gemma4` en vLLM.
- Salida en JSON y respuestas en streaming, segun las comprobaciones de compatibilidad declaradas.
- Plantilla de chat y tokenizador originales incluidos en el repositorio.
- Soporte de contexto largo de hasta 32.768 tokens en la configuracion validada.
- Presencia de modulos de vision y audio en la arquitectura base, aunque excluidos de la cuantizacion y no probados en esta version.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Roleplay y chatbots de personaje: el modelo esta optimizado para interacciones dirigidas por personaje; su ventana de 32.768 tokens permite mantener el historial de una conversacion larga con fichas de personaje y contexto acumulado.
- Escritura creativa asistida: generacion de borradores de relatos, dialogos y descripciones con continuidad narrativa gracias a la ventana de contexto extendida.
- Ficcion interactiva y aventuras conversacionales: gestion de estado narrativo y decisiones del usuario a lo largo de multiples turnos sin perder el hilo del argumento.
- Generacion de narrativa para videojuegos: produccion de dialogos de PNJ y tramas ramificadas en tiempo de ejecucion, servido con vLLM para atender varias peticiones concurrentes.
- Prototipado de asistentes conversacionales en ingles: despliegue rapido en una sola GPU Blackwell gracias al formato NVFP4, con salida estructurada en JSON para integrarla en backends de aplicacion.
- Generacion de guiones y contenido de ficcion serializada: continuacion de sagas o capitulos manteniendo coherencia de personajes y estilo a partir de resumenes largos dentro del contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comprobaciones realizadas establecen compatibilidad de servicio y no constituyen una evaluacion de precision ni una prueba de equivalencia con BF16.

## Requisitos de hardware

- La cuantizacion NVFP4 requiere una GPU con soporte nativo de NVFP4 (arquitectura Blackwell); la validacion se hizo en una NVIDIA RTX PRO 6000 Blackwell de 96 GB.
- Tamano del shard de pesos: 16,42 GB; el consumo en tiempo de ejecucion incluye ademas cache y espacio de trabajo.
- Configuracion validada: contexto de 32.768 tokens, `gpu-memory-utilization` 0.88, `kv-cache-dtype bfloat16`, `max-num-seqs` 4, `max-num-batched-tokens` 8192, con prefill troceado y `enforce-eager`.
- Despliegue soportado: vLLM 0.29.0 con `--quantization compressed-tensors` y el kernel nativo FlashInfer/CUTLASS NVFP4. No se documentan otras opciones de despliegue (llama.cpp, Ollama, TGI, GGUF) en la informacion disponible.
- No se han publicado datos de latencia ni de throughput; la model card senala que no se realizo una prueba de rendimiento a contexto completo con cuatro usuarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wondernutts/Fenrir-X-26B-A4B-NVFP4 | ~15,1B (safetensors) | 32.768 tokens (validado) | NVFP4 / compressed-tensors | apache-2.0 | HuggingFace |
| Vortex5/Fenrir-X-26B-A4B (original) | no disponible en la informacion | no disponible | no disponible | apache-2.0 (heredada) | HuggingFace |
| google/gemma-4-26B-A4B-it (base) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento comparados entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de ingles (`en`); no se documenta capacitacion multilingue.
- Precision: la conversion NVFP4 no garantiza equivalencia con el modelo en BF16; no hay evaluacion de precision publicada.
- Vision y audio: los modulos existen en la arquitectura pero fueron excluidos de la cuantizacion y no se probaron en esta version.
- Alcance de la validacion: se probaron chat simple, salida JSON, respuestas en streaming y modo de razonamiento; no se realizo una prueba de rendimiento a contexto completo con cuatro usuarios.
- La cache KV no esta cuantizada y se sirve en BF16, lo que aumenta el consumo de memoria respecto a los pesos.
- Reproducibilidad: los prompts de calibracion y la implementacion personalizada del observador no se incluyen en la publicacion de pesos.
- Riesgo de alucinacion: no se documenta de forma especifica, pero es un modelo de generacion creativa; se debe validar la salida en usos factuales.
- Licencia apache-2.0: permite uso comercial, aunque el modelo es un merge de varias fuentes cuyas condiciones conviene verificar en los repositorios originales.
- El conteo real de parametros en safetensors (~15,1B) difiere de la cifra "26B" del nombre comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wondernutts/Fenrir-X-26B-A4B-NVFP4
- Modelo base (original): https://huggingface.co/Vortex5/Fenrir-X-26B-A4B
- Revision del checkpoint original: https://huggingface.co/Vortex5/Fenrir-X-26B-A4B/tree/ff05580e4a894de9aa9817e248ff5a6cd68cc033
- Model card original: https://huggingface.co/Vortex5/Fenrir-X-26B-A4B/blob/ff05580e4a894de9aa9817e248ff5a6cd68cc033/README.md
- Modelo base de Gemma 4: https://huggingface.co/google/gemma-4-26B-A4B-it
- TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2: https://huggingface.co/TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2
- Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- electroglyph/gemma4-26b-fiction-bf16: https://huggingface.co/electroglyph/gemma4-26b-fiction-bf16
- Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT: https://huggingface.co/Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT
- Perfil del autor: https://huggingface.co/Wondernutts
- Ficha en LLM Explorer: https://llm-explorer.com/model/Vortex5%2FFenrir-X-26B-A4B,8exzzUEl5k4mBGH2igJux
- Ficha en Featherless: https://featherless.ai/models/Vortex5/Fenrir-X-26B-A4B
- Registro en Free2AITools: https://free2aitools.com/model/vortex5/fenrir-x-26b-a4b
