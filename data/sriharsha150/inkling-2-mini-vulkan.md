# sriharsha150/inkling-2-mini-vulkan

## Resumen

Inkling-2-Mini Vulkan Engine es un motor de inferencia y servidor compatible con la API de OpenAI para el modelo Inkling-2-Mini de Thinking Machines Lab, desarrollado por sriharsha150. No se trata de un modelo nuevo, sino de una implementación de inferencia nativa en Vulkan 1.3 optimizada específicamente para la GPU AMD Radeon AI PRO R9700 (arquitectura RDNA 4, 32 GiB de VRAM), que lee directamente los pesos publicados en safetensors sin re-cuantización.

El motor destaca por ejecutar los pesos nativos del modelo base (capas NVFP4 en 0-19, MXFP8 en 20-23 y BF16 en las capas densas de atención y unembed) con una caché KV y una ruta de atención en F32 puro. Ofrece batching continuo, prefill agrupado por expertos, caché de prompts LRU por slot y un servidor HTTP/SSE con autenticación por API key, límite de cola y timeout configurables.

Su relevancia radica en demostrar inferencia de alta fidelidad numérica y rendimiento competitivo sobre hardware AMD consumer/prosumer, un nicho tradicionalmente dominado por CUDA. La verificación reportada alcanza un 100% de coincidencia de siguiente token frente a llama.cpp en F32, con un rendimiento de decodificación muy superior al backend Vulkan de llama.cpp con cuantización Q6_K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de inferencia Vulkan 1.3 sobre modelo base Inkling-2-Mini (MoE, según fan-out 8-de-128 expertos) |
| Parámetros totales | no disponible (corresponde al modelo base Inkling-2-Mini) |
| Parámetros activos | no disponible (fan-out de 8 expertos de 128 por paso, según model card) |
| Longitud de contexto | 4.096 tokens por slot; 16 slots (65.536 tokens KV vivos); 40 slots SWA con buffer circular de 1.024 y 8 slots de atención completa lineal de 4.096 |
| Tipos de cuantización | Pesos nativos NVFP4 (capas 0-19), MXFP8 (capas 20-23), BF16 (densas/atención/unembed); caché KV y atención en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (motor y modelo base) |
| Formato de pesos | safetensors (pesos del modelo base, no incluidos en el repositorio) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es un motor de inferencia escrito en C con shaders WGSL compilados a SPIR-V para RDNA 4 (Wave64), ejecutados mediante Vulkan 1.3 con command buffers pre-grabados (`libvk_inkling.so`). El modelo subyacente, Inkling-2-Mini, es una arquitectura MoE con 128 expertos y fan-out de 8 por paso, según los datos de rendimiento del motor. La ruta de atención y la caché KV se mantienen en F32 puro para preservar la fidelidad numérica respecto a una referencia en coma flotante.

El motor incorpora innovaciones de serving: batching continuo con buckets de tamaño 1, 2, 4, 8 y 16; prefill troceado y agrupado por expertos con chunks de 64 y 16; caché de prompts LRU por slot con snapshot/rollback de historial de convolución de 3,66 MiB; y un sampler en GPU con top-128, top-p, temperatura y semilla. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO, ya que esos datos pertenecen a la model card del modelo base y no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva con decodificación de siguiente token verificada al 100% frente a llama.cpp en F32.
- Servidor compatible con la API de OpenAI vía HTTP y streaming SSE.
- Batching continuo para hasta 16 usuarios concurrentes.
- Caché de prompts por slot con reutilización de KV y rollback de historial de convolución.
- Muestreo en GPU con top-128, top-p, temperatura y semilla configurables.
- Gestión de cola con límite (`--max-queue`), timeout (`--timeout`), autenticación por API key y endpoint `/stats`.
- Prefill troceado y agrupado por expertos para reducir el time-to-first-token en prompts largos.
- Soporte de contexto efectivo de hasta 4.096 tokens por slot con ventana deslizante en 40 slots y atención completa en 8.
- No se documentan capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Despliegue local de un LLM sobre GPU AMD RDNA 4: el motor permite servir Inkling-2-Mini en una Radeon AI PRO R9700 sin depender de CUDA, usando Vulkan 1.3 y los pesos nativos publicados.
- Servicio multiusuario de baja latencia: con batching continuo de hasta 16 usuarios y un throughput agregado de 273 tok/s a 16 usuarios, es adecuado para entornos de desarrollo en equipo o demos internas.
- Asistentes conversacionales con prompts repetidos: la caché de prompts LRU por slot reduce el TTFT en caliente a 106,6 ms en solitario y 176,1 ms con 8 usuarios generando, lo que favorece diálogos multi-turno con prefijos estables.
- Evaluación y validación de modelos: la verificación de 500/500 coincidencias de siguiente token frente a llama.cpp F32 lo convierte en una referencia útil para comprobar fidelidad numérica de otras implementaciones.
- Prototipado de pipelines compatibles con OpenAI: al exponer una API compatible, se puede integrar con clientes y frameworks existentes sin adaptadores adicionales.
- Investigación en serving sobre hardware no NVIDIA: sirve como banco de pruebas para técnicas de batching, prefill agrupado por expertos y gestión de KV en GPUs AMD.
- Procesamiento por lotes de prompts de hasta 4.096 tokens: el prefill troceado alcanza 455-464 tok/s y reduce el TTFT en frío de 9,28 s a 1,43 s para 652 tokens.

## Benchmarks y rendimiento

| Métrica | Resultado reportado |
|---|---|
| Coincidencia de siguiente token vs. llama.cpp F32 | 500/500 (100,00%), max abs(logit diff) = 0,00004 |
| Coincidencia en lote B=9 vs B=1 | max abs(diff) = 0,000000 |
| Decodificación monoflujo a profundidad 50 | 80,6 tok/s (llama.cpp Vulkan Q6_K: 20,4 tok/s) |
| Decodificación monoflujo a profundidad 2.000 | 70,4 tok/s (llama.cpp: 18,3 tok/s) |
| Decodificación monoflujo a profundidad 3.000 | 68,9 tok/s |
| Prefill troceado (C=64/16, sin cabeza de salida) | 455-464 tok/s; TTFT en frío 1,43 s para 652 tokens (llama.cpp: 386 tok/s) |
| Batching continuo, 1 usuario | 80 tok/s |
| Batching continuo, 2 usuarios | 130 tok/s |
| Batching continuo, 4 usuarios | 189 tok/s |
| Batching continuo, 8 usuarios | 241 tok/s |
| Batching continuo, 16 usuarios | 273 tok/s |
| Modelo de coste por paso | step_ms(B) ≈ 9,5 + 3,05·B |
| VRAM real | 26,84 GiB (más 0,11 GiB GTT) |
| Arranque en frío | 2,1 s |
| TTFT en caliente (2.008 tokens) | 106,6 ms (1 usuario), 176,1 ms (8 usuarios) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU objetivo: AMD Radeon AI PRO R9700 con 32 GiB de VRAM y arquitectura RDNA 4 (RADV GFX1201). El motor está compilado para Wave64 y SPIR-V específico de RDNA 4.
- VRAM estimada: 26,84 GiB de VRAM real más 0,11 GiB de GTT con la configuración por defecto de 16 slots × 4.096 tokens.
- No cabe en GPUs consumer de 8, 12, 16 o 24 GiB con esta configuración; no se documenta una configuración reducida.
- No se reporta compatibilidad con GPUs NVIDIA ni con otras arquitecturas AMD; el motor es específico de RDNA 4.
- Software: Linux con driver Vulkan 1.3 y cabeceras (`libvulkan`, `gcc`), Python 3.10 o superior.
- Despliegue: servidor propio `serve_batch_vk.py` compatible con OpenAI; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ver tabla de benchmarks; arranque en frío de 2,1 s y decodificación de 68,9-80,6 tok/s en monoflujo.

## Comparativa con modelos similares

| Motor / runtime | Hardware objetivo | Pesos | Throughput monoflujo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini Vulkan Engine (este) | AMD RDNA 4 / R9700 32 GiB | NVFP4 + MXFP8 + BF16 nativos, KV F32 | 80,6 tok/s @ 50 | Apache 2.0 | Repositorio Hugging Face y GitHub |
| llama.cpp (backend Vulkan, Q6_K) | Vulkan genérico | Cuantización Q6_K | 20,4 tok/s @ 50 | MIT | Ampliamente disponible |
| llama.cpp (backend Vulkan, F32) | Vulkan genérico | F32 | Referencia de corrección | MIT | Ampliamente disponible |

No se dispone de datos comparativos con otros motores (vLLM, TGI, TensorRT-LLM) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo; es necesario descargarlos por separado desde `thinkingmachines/Inkling-2-Mini`.
- El motor es específico de RDNA 4 y Vulkan 1.3; no funciona en GPUs NVIDIA, Intel ni en arquitecturas AMD anteriores sin adaptación.
- La configuración por defecto requiere aproximadamente 27 GiB de VRAM, lo que excluye GPUs consumer convencionales.
- El contexto efectivo por slot es de 4.096 tokens; los 40 slots con ventana deslizante usan un buffer circular de 1.024 tokens, lo que limita la retención de contexto lejano en esos slots.
- El throughput agregado se aplana entre 8 y 16 usuarios debido al fan-out de 8 de 128 expertos del MoE.
- No se documentan idiomas soportados, sesgos, tasas de alucinación ni evaluaciones de seguridad.
- No se documentan capacidades de tool calling, agentes, visión o audio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; se trata de un proyecto reciente con validación limitada por parte de la comunidad.
- Aunque el código y el modelo base son Apache 2.0, conviene revisar los términos del modelo base para uso comercial en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sriharsha150/inkling-2-mini-vulkan
- Repositorio fuente en GitHub: https://github.com/harsha-gouru/inkling-vulkan
- Modelo base en Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Mini
