# timbuksu/Ling-3.2-Air-NVFP4-FLARE

## Resumen

Ling-3.2-Air-NVFP4-FLARE es un paquete de pesos cuantizados y kernels precompilados para servir el modelo `inclusionAI/Ling-3.2-Air` mediante Flare, un runtime nativo escrito en Rust. Lo publica el usuario `timbuksu` como exportación del checkpoint `timbuksu/Ling-3.2-Air-NVFP4`, y está diseñado exclusivamente para una GPU NVIDIA Blackwell de 96 GiB (arquitectura SM120, `gb202`, comercializada como RTX PRO 6000 Blackwell) en configuración de tensor parallelism 1.

El modelo subyacente es un transformer híbrido de 42 capas que combina 35 capas con atención KDA (Kimi Delta Attention), 7 capas con Gated MLA con cabezas agrupadas y 40 capas MoE con 512 expertos, más una capa 42 con Gated MLA y una cabeza MTP (multi-token prediction) para decodificación especulativa. La ventana de contexto alcanza los 262.144 tokens y la compresión de pesos emplea GPTQ calibrado en NVFP4 para los expertos enrutados, MXFP8 para proyecciones densas y BF16 para MLA, normas, embeddings y `lm_head`.

Su relevancia es doble: por un lado demuestra una ruta de despliegue de un MoE de gran tamaño en una única GPU de consumo profesional con 96 GiB, con throughput medido de hasta 804 tok/s agregados a concurrencia 16; por otro, introduce un formato propietario (CSF, kernels precompilados, grafos CUDA capturados) que rompe la compatibilidad con Transformers, vLLM, SGLang y llama.cpp, lo que limita su adopción fuera del ecosistema Flare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 42 capas: 35 KDA + 7 Gated MLA con cabezas agrupadas, 2 MLP densas + 40 MoE de 512 expertos, capa 42 Gated MLA + MoE MTP |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 512 expertos por capa, ratio de activación no especificado) |
| Longitud de contexto | 262.144 tokens (chunk de prefill de 4.096 tokens) |
| Tipos de cuantizacion | GPTQ NVFP4 (W4A16 decode / W4A4 prefill) en expertos enrutados; MXFP8 en proyecciones densas, atención y compartidas; BF16 en `kv_b_proj`, `g_proj`, normas, embeddings y `lm_head`; escalas comprimidas con CSF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Paquete Flare nativo (kernels precompilados + pesos CSF); no compatible con safetensors estándar, GGUF ni los runtimes habituales |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido que alterna mecanismos de atención: 35 capas usan KDA (Kimi Delta Attention), una variante de atención lineal con estado recurrente, y 7 capas usan Gated MLA con cabezas agrupadas, más una capa 42 final con Gated MLA. De las 42 capas, 2 tienen MLP densa y 40 incorporan capas MoE con 512 expertos cada una. Sobre la capa 42 se añade una cabeza MTP que actúa como draft head para decodificación especulativa.

El paquete exportado no contiene información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí documenta el autor es el proceso de cuantización: GPTQ calibrado para los expertos enrutados en NVFP4, MXFP8 para proyecciones densas y de atención, y BF16 para los componentes sensibles a precisión. La verificación de calidad en lockstep contra el checkpoint FP8 block-128 de `inclusionAI/Ling-3.2-Air` sobre 2.048 tokens disjuntos reporta KL de 0,05782, top-1 del 95,21 %, top-5 del 99,56 % y perplejidad de 2,934 frente a 2,864 del original (ratio 1,0245×). La cabeza MTP obtiene KL de 0,06165, top-1 del 93,77 % y top-5 del 99,66 %.

La innovación técnica del paquete es el runtime Flare: kernels precompilados, pesos comprimidos con CSF y grafos CUDA capturados, servidos desde Rust sin runtime Python ni compilación en tiempo de ejecución. Incluye decodificación especulativa con `--mtp-only`, anchos de 1 a 8 (hasta 7 drafts con selección adaptativa) y capacidad de tokens especulativos de 64. El paquete está firmado con Ed25519 y su clave se verifica contra `publisher.json`.

## Capacidades

- Generación de texto en modalidad exclusivamente textual (la entrada de visión no está cableada en este core).
- Razonamiento explícito mediante bloques `<think>...</think>`, desactivables con `chat_template_kwargs: {"enable_thinking": false}`.
- Generación de código, con pruebas medidas en Rust (B-tree) y C (epoll de Linux).
- Razonamiento matemático y demostraciones, con el modo thinking activado.
- Tool calling con parser XML `GLM_ARGUMENT_TAGS`, salida JSON estructurada en `tool_calls` y `finish_reason="tool_calls"`.
- Decodificación especulativa MTP con aceptación del 86,11 % a profundidad 1 y 50,47 % a profundidad 2.
- Reutilización de caché de prefijo en conversaciones multi-turno (825 tokens reutilizados en la prueba documentada).
- Concurrencia de hasta 16 peticiones simultáneas con caché KV paginada en BF16.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de código en producción: el modelo genera código Rust y C a 245,96 y 241,92 tok/s respectivamente en B=1, con TTFT de 44 ms, lo que permite integrarlo en pipelines de CI/CD o asistentes de IDE con latencia interactiva.
- Agentes con tool calling: el parser XML y la salida JSON estructurada permiten construir agentes que invocan funciones externas (por ejemplo `get_weather`) con un tiempo total de 0,256 s por llamada, adecuado para flujos multi-paso.
- Razonamiento matemático y verificación de pruebas: el modo thinking separa limpiamente el bloque de razonamiento de la respuesta final, con throughput de 232 a 255 tok/s, útil en entornos educativos o de auditoría formal.
- Atención al cliente multi-turno: la ventana de 262.144 tokens y los 2,94 millones de tokens KV disponibles permiten mantener conversaciones largas con historial extenso, y la reutilización de prefijo reduce el TTFT de 79,9 ms a 51,3 ms en turnos sucesivos.
- Servicio de inferencia a media escala: con concurrencia 16 y 804,23 tok/s agregados (66,28 tok/s por usuario) sobre una sola GPU de 96 GiB, es viable para equipos pequeños o despliegues on-premise sin clúster multi-GPU.
- Generación de documentación técnica y resúmenes de repositorios: el contexto largo permite procesar ficheros completos o árboles de proyecto en una sola pasada, con prefill en chunks de 4.096 tokens.
- Prototipado de investigación sobre decodificación especulativa: la cabeza MTP con anchos adaptativos de 1 a 8 y métricas de aceptación publicadas sirve como banco de pruebas para estudiar el equilibrio entre velocidad y calidad.

## Benchmarks y rendimiento

Rendimiento de servicio medido con `flare run` en una SM120 de 96 GiB, sampling por defecto (`temperature=1.0`, `top_p=0.95`, `top_k=20`):

| Carga | Throughput decode | Notas |
|---|---:|---|
| B=1 Rust B-tree (`enable_thinking=False`, 800 tok) | 245,96 tok/s | 3,29 s total, 44,1 ms TTFT |
| B=1 Linux epoll C (`enable_thinking=False`, 800 tok) | 241,92 tok/s | 3,35 s total, 44,2 ms TTFT |
| B=1 matemáticas / prueba (thinking on, 400–512 tok) | 232,0 – 255,0 tok/s | Bloques `<think>` separados |
| B=1 tool calling (`get_weather` XML) | 0,256 s total | JSON estructurado, `finish_reason="tool_calls"` |
| B=1 multi-turno con caché de prefijo (529 → 623 tok) | 230,7 tok/s | TTFT 79,9 → 51,3 ms, 825 tokens reutilizados |
| B=2 concurrente (2 × 256 tok) | 349,40 tok/s agregados | 207,92 tok/s por usuario |
| B=4 concurrente (4 × 256 tok) | 436,69 tok/s agregados | 171,74 tok/s por usuario |
| B=8 concurrente (8 × 256 tok) | 661,59 tok/s agregados | 132,58 tok/s por usuario |
| B=16 concurrente (16 × 256 tok) | 804,23 tok/s agregados | 66,28 tok/s por usuario |

Calidad frente al checkpoint FP8 block-128 de `inclusionAI/Ling-3.2-Air` (2.048 tokens disjuntos):

| Métrica | Capa 42 objetivo | Cabeza MTP capa 42 |
|---|---:|---:|
| KL | 0,05782 | 0,06165 |
| Top-1 | 95,21 % | 93,77 % |
| Top-5 | 99,56 % | 99,66 % |
| Perplejidad | 2,934 (vs. 2,864 upstream, 1,0245×) | no disponible |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU única NVIDIA Blackwell SM120 / `gb202` con 96 GiB de VRAM (RTX PRO 6000 Blackwell); tensor parallelism fijado a 1.
- Memoria cargada medida: 67,82 GiB (66,5 GiB de pesos con CSF y draft head MXFP8, más 66 grafos CUDA capturados).
- Presupuesto de caché KV: 26,55 GiB, equivalentes a 22.954 páginas KV latentes paginadas en BF16 (2.938.112 tokens KV) y 324 slots de snapshot de prefijo KDA/MLA/MTP.
- No cabe en GPUs de consumo con menos de 96 GiB (RTX 4090, RTX 5090, A100 de 40/80 GiB, H100 de 80 GiB quedan fuera por capacidad).
- Despliegue exclusivamente mediante el runtime Flare (`flare run`); no es cargable en vLLM, SGLang, llama.cpp, Ollama, TGI ni Transformers. Para esos runtimes debe usarse el checkpoint `timbuksu/Ling-3.2-Air-NVFP4` en safetensors ModelOpt.
- Concurrencia máxima soportada: 16 peticiones simultáneas.
- Throughput y latencia medidos en la tabla de benchmarks; el paquete se exportó con `--lock-gpu-clocks` sobre SM120, por lo que las cifras asumen relojes fijados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.2-Air-NVFP4-FLARE | no disponible (MoE 512 expertos × 40 capas) | 262.144 | Flare nativo (CSF + kernels precompilados) | MIT | Solo GPU SM120 de 96 GiB |
| inclusionAI/Ling-3.2-Air (FP8 block-128) | no disponible | 262.144 (según checkpoint base) | Safetensors FP8 | MIT | Multi-GPU, runtimes estándar |
| timbuksu/Ling-3.2-Air-NVFP4 | no disponible | 262.144 (según checkpoint base) | Safetensors ModelOpt NVFP4 | MIT | Cargable en vLLM/SGLang/Transformers |
| timbuksu/Ling-3.2-Air-NVFP4 (referencia de calidad) | no disponible | no disponible | Safetensors | MIT | Uso general |

La comparación con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El paquete solo funciona en una GPU NVIDIA SM120 / `gb202` de 96 GiB; no hay soporte para otras arquitecturas ni para multi-GPU.
- Incompatible con Transformers, vLLM, SGLang, llama.cpp y Ollama; requiere el runtime Flare y, por tanto, dependencia de un ecosistema mantenido por un único publicador.
- Modalidad exclusivamente textual: la entrada de visión no está implementada en este core.
- Idiomas soportados no documentados; no hay garantías explícitas de calidad multilingüe.
- La cuantización NVFP4 introduce una degradación medible: perplejidad 1,0245× superior al FP8 upstream y top-1 del 95,21 % en la capa objetivo, con top-1 del 93,77 % en la cabeza MTP; en tareas sensibles a precisión numérica conviene validar contra el checkpoint original.
- La aceptación especulativa cae del 86,11 % a profundidad 1 al 50,47 % a profundidad 2, lo que reduce la ganancia del modo MTP en generaciones largas.
- La instalación interactiva exige escribir el nombre del publicador y aprobar la clave Ed25519; el modo desatendido requiere `--dangerously-accept-publisher` y `--dangerously-approve-key`, lo que traslada la responsabilidad de verificación al operador.
- El paquete se creó y actualizó el 24 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del runtime ni sobre la cadena de suministro de los kernels precompilados.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/timbuksu/Ling-3.2-Air-NVFP4-FLARE
- Checkpoint base cuantizado (safetensors ModelOpt): https://huggingface.co/timbuksu/Ling-3.2-Air-NVFP4
- Modelo original: https://huggingface.co/inclusionAI/Ling-3.2-Air
