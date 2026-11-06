# tixiren/Qwen3.5-2B-webyIQ

## Resumen

Qwen3.5-2B-webyIQ es una conversión del modelo base Qwen/Qwen3.5-2B (desarrollado por el equipo Qwen de Alibaba Cloud) realizada por el usuario tixiren, orientada específicamente a su ejecución en navegador mediante WebGPU. El modelo no es un checkpoint estándar de transformers ni de llama.cpp: está empaquetado para el motor webyIQ, un runtime de inferencia escrito en Rust con kernels WGSL escritos a mano que ejecuta modelos LLM directamente en el navegador del cliente.

La conversión aplica cuantización asimétrica int4 con GPTQ (grupo de 32, escalas y mínimos en f16), calibrada sobre el conjunto de entrenamiento de WikiText-2, y un tratamiento RTN int4 con búsqueda de clip para el embedding y lm_head atados. El resultado ocupa 1,10 GiB distribuidos en fragmentos de como máximo 128 MB junto a un `manifest.json`. Incluye además la cabeza MTP (usada para decodificación especulativa) y un vocabulario borrador de 32K tokens.

La relevancia de esta ficha radica en su nicho: despliegue de un modelo de 2B parámetros en el navegador sin backend, con latencia de primer token de 25 ms y una velocidad de generación de aproximadamente 580 tok/s en Chrome sobre una RTX 5080, según los datos del autor. Es un caso de interés para aplicaciones web que requieren privacidad de datos en el cliente o funcionamiento offline, aunque su ecosistema de herramientas es muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B); incluye cabeza MTP para decodificacion especulativa |
| Parametros totales | 2B (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 asimetrico GPTQ (grupo 32, escalas/min en f16); embedding/lm_head int4 RTN con busqueda de clip; activaciones int8 en el motor webyIQ |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Shards propietarios de webyIQ (max. 128 MB) + `manifest.json`; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de 2.000 millones de parámetros del que no se detallan en la información disponible ni la composición del dataset de preentrenamiento, ni el número de tokens, ni si hubo fases de RLHF o DPO. La intervención del autor se limita a la cuantización y al empaquetado para el motor webyIQ, no a un reentrenamiento.

La innovación técnica principal es el pipeline de cuantización: GPTQ asimétrico con grupo de 32 y calibración sobre WikiText-2 train para las capas lineales, más RTN int4 con búsqueda de clip para el embedding y lm_head atados. Se preserva la cabeza MTP del modelo base, lo que habilita decodificación especulativa en el runtime, y se añade un vocabulario borrador de 32K tokens para acelerar ese proceso. El motor webyIQ (Rust + WGSL) ejecuta los kernels directamente sobre WebGPU con activaciones int8.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-2B.
- Decodificación especulativa mediante la cabeza MTP incluida, con vocabulario borrador de 32K tokens.
- Ejecución íntegra en el navegador sobre WebGPU, sin backend ni servidor.
- Cuantización int4 con activaciones int8 para reducir el uso de memoria en el cliente.
- Carga mediante la API JavaScript `loadWebyiq(...)` del motor webyIQ.
- Capacidades de tool calling, agentes, visión, audio o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes embebidos en aplicaciones web con privacidad por diseño: el modelo se ejecuta en el navegador del usuario, de modo que el texto introducido no abandona el dispositivo; adecuado para herramientas de redacción o resumen sobre documentos sensibles.
- Demos interactivas y playgrounds sin coste de inferencia en servidor: al cargar los 1,10 GiB de pesos desde un CDN (Hugging Face) y ejecutar en WebGPU, se elimina la necesidad de aprovisionar GPUs en backend.
- Procesamiento de texto offline en aplicaciones PWA: una vez cacheado el modelo, la generación funciona sin conexión, útil en entornos con conectividad intermitente.
- Prototipado rápido de funcionalidades LLM en frontend: el desarrollador puede integrar generación de texto en una web con una única llamada a `loadWebyiq` y validar la experiencia de usuario antes de invertir en infraestructura.
- Educación y experimentación con cuantización: el paquete sirve como ejemplo práctico de GPTQ int4 con grupo 32 y de decodificación especulativa en un runtime WebGPU.
- Generación de texto asistida de baja latencia en equipos con GPU de escritorio: con 25 ms hasta el primer token y ~580 tok/s en una RTX 5080, es viable para autocompletado interactivo en el navegador.

## Benchmarks y rendimiento

| Metrica | webyIQ int4 (int8 act.) | bf16 (referencia) |
|---|---|---|
| Perplejidad WikiText-2 | 17,56 | 17,14 |
| Perplejidad C4 | 21,48 | 20,74 |
| Primer token (RTX 5080, prompt 128 tok) | 25 ms | no disponible |
| Generacion (RTX 5080, con decod. especulativa) | ~580 tok/s | no disponible |

Mediciones del autor sobre 8 secuencias de 512 tokens en Chrome. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 1,10 GiB en int4; con activaciones int8 y buffers de inferencia, el consumo real en GPU es superior pero no está cuantificado en la información disponible.
- GPU recomendadas: el autor reporta pruebas en una RTX 5080; se requiere una GPU con soporte de WebGPU en Chrome.
- GPU de consumo: sí, cabe en GPUs de consumo con WebGPU habilitado; no se especifican modelos mínimos.
- Despliegue: exclusivamente mediante el motor webyIQ (`web/lib/webyiq.js`); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 25 ms hasta el primer token con prompt de 128 tokens y ~580 tok/s de generación con decodificación especulativa en RTX 5080 bajo Chrome.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| Qwen3.5-2B-webyIQ | 2B | no disponible | shards webyIQ int4 | Apache-2.0 | Navegador (WebGPU) |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | safetensors (bf16) | Apache-2.0 | Servidor / GPU |
| Alternativas comparables en navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ecosistema cerrado: solo funciona con el motor webyIQ; no se puede cargar en transformers, llama.cpp, vLLM ni Ollama.
- Formato propietario: los pesos no están en safetensors ni GGUF, lo que dificulta su reutilización o auditoría con herramientas estándar.
- Degradación por cuantización: la perplejidad sube de 17,14 a 17,56 en WikiText-2 y de 20,74 a 21,48 en C4 respecto a bf16.
- Dependencia de WebGPU: requiere un navegador compatible (Chrome con WebGPU) y una GPU con soporte; el rendimiento medido corresponde a una RTX 5080 y no es extrapolable a GPUs integradas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados reportados.
- Idiomas soportados no declarados: no se puede confirmar el comportamiento multilingüe.
- Riesgo de alucinación y sesgos: inherentes a un modelo de 2B; no se documentan evaluaciones de seguridad ni de sesgo.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el paquete de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tixiren/Qwen3.5-2B-webyIQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del motor webyIQ: https://github.com/rtx527896828/webyIQ
- Demo online: https://rtx527896828.github.io/webyIQ/
