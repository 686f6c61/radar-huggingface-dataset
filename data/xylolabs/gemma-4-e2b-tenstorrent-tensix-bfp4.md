# Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP4

## Resumen

`Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP4` es una cuantización del modelo multimodal `google/gemma-4-E2B` realizada por Xylolabs y empaquetada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El objetivo no es otro que reducir la huella de memoria del modelo base para que pueda ejecutarse dentro de la DRAM de aceleradores Tensix, manteniendo una fidelidad numérica superior a la de una cuantización estándar de llama.cpp. El resultado es un checkpoint de 6,778 GB empaquetado frente a los 9,29 GB del modelo en bf16.

La estrategia de cuantización es selectiva y asimétrica: las proyecciones MLP (`gate`, `up`, `down`) se cuantizan a `bfloat4_b` (BFP4) mediante GPTQ con búsqueda de exponente por bloque, mientras que las proyecciones de atención (`q`, `k`, `v`, `o`) se mantienen en `bfloat8_b` (BFP8) por redondeo al más cercano. El LM head, los embeddings, las normas y las torres de visión y audio permanecen en bf16 sin tocar. El modelo conserva por tanto la naturaleza any-to-any del original (texto, imagen y audio como entrada).

Es relevante ahora porque demuestra que es posible servir un modelo de 5.525.831.235 parámetros en hardware de inferencia no-GPU con una degradación de calidad medible y acotada: la divergencia KL media respecto a bf16 es de 0,0371, frente a 0,1073 de una Q4_K_M de llama.cpp, es decir, aproximadamente un tercio. La licencia Apache 2.0 heredada del modelo base facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, imagen y audio) con torres de visión y audio separadas; detalles completos en el informe técnico de Gemma 4 |
| Parametros totales | 5.525.831.235 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones MLP; BFP8 (`bfloat8_b`) en proyecciones de atención; bf16 en LM head, embeddings, normas, `audio_tower`, `embed_audio`, `embed_vision` y `vision_tower` |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix; también empaquetable exactamente en `ttnn.bfloat8_b`) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B` es un transformer multimodal descrito en el informe técnico Gemma 4 (arXiv:2607.02770). Esta ficha no dispone de los detalles de arquitectura interna, composición del dataset de preentrenamiento ni del proceso de alineación (RLHF/DPO) del modelo original; esa información debe consultarse en la model card de Google. Lo que sí está documentado es la estructura de la cuantización: 35 capas con proyecciones MLP (`gate`, `up`, `down`) en BFP4 y 35 capas con proyecciones de atención `q` y `o` en BFP8, más 15 capas con `k` y `v` en BFP8. El resto de tensores permanece en bf16.

La innovación técnica reside en el esquema de cuantización para Tensix. Los tensores BFP4 se obtuvieron con GPTQ combinado con una búsqueda de exponente por bloque, mientras que los BFP8 se generaron por redondeo al más cercano. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y las herramientas `pack_tensix.py` y `verify_grid.py` (del proyecto `tensix-bfp-gptq` en el commit 5c52065), que permiten verificar que cada matriz empaquetada se reconstruye bit a bit. La verificación se realizó con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent.

## Capacidades

- Generación de texto autoregresiva: el checkpoint es el modelo preentrenado, sin plantilla de chat, por lo que continúa texto en lugar de mantener diálogo.
- Procesamiento any-to-any: acepta texto, imagen y audio como entrada, heredado de las torres `vision_tower`, `embed_vision`, `audio_tower` y `embed_audio` conservadas en bf16.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base Gemma 4 E2B, sin evaluación específica publicada en esta ficha.
- Capacidades multilingües: el conjunto de evaluación incluye inglés y coreano, lo que confirma soporte al menos para esos idiomas; la lista completa no está disponible.
- Ejecución en NPU Tensix: compatible con Wormhole y Blackhole mediante `tt-metal`/`ttnn`.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tensix: el caso de uso principal es servir el modelo en NPU Wormhole o Blackhole, donde el checkpoint de 6,778 GB cabe en la DRAM del dispositivo y evita depender de GPU. Adecuado por el empaquetado nativo BFP4/BFP8 y las herramientas de verificación incluidas.
- Inferencia de borde con restricciones de memoria: en escenarios donde 9,29 GB en bf16 no caben pero 6,778 GB sí, el modelo permite mantener un LLM multimodal de 5.500 millones de parámetros con una pérdida de calidad acotada (KL 0,0371).
- Investigación en cuantización de bajo nivel: el repositorio sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ frente a Q4_K_M, gracias a las métricas de KL y top-1 publicadas y a los scripts de verificación.
- Prototipado multimodal texto-imagen-audio: al conservar las torres de visión y audio en bf16, permite experimentar con entradas multimodales sin reentrenar el modelo.
- Generación de texto y completado en pipelines batch: el modelo preentrenado es adecuado para tareas de continuación de texto, resumen extractivo o generación de documentación donde no se requiere formato conversacional.
- Evaluación comparativa de hardware: útil para medir latencia y throughput de un mismo modelo en Tensix frente a GPU o CPU, con una línea base de calidad documentada.
- Desarrollo de kernels y tooling para Tensix: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar la ruta de empaquetado en nuevas versiones de `ttnn` o en nuevos dispositivos.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-E2B) | 9,29 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 attention) | 6,778 | 0,03708 | 89,96 |
| Q4_K_M (llama.cpp) | 3,428 | 0,10733 | 83,79 |

Las métricas de KL y top-1 se calcularon sobre 8.176 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato de texto plano. La Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,778 GB empaquetado para Tensix; 9,29 GB en bf16 para ejecución con transformers en GPU.
- GPU recomendadas para la ruta transformers: no especificadas en la información disponible; por tamaño, una GPU con 16 GB o más de VRAM puede alojar el modelo en bf16.
- Cabe en GPU de consumo: sí, en bf16 requiere al menos 10-12 GB de VRAM efectiva, por lo que tarjetas como RTX 4080/4090 (16-24 GB) son suficientes; no se documentan requisitos para GPUs de gama media.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (Tensix), verificados con `ttnn` 0.81.1 sobre el simulador `ttsim`.
- Opciones de despliegue: `transformers` (ruta estándar con `AutoModelForCausalLM`), `ttnn`/`tt-metal` para Tensix, y las herramientas `tensix-kernels` v0.1.0 y `tensix-runner` v0.1.0. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/quantizacion | Licencia | Calidad relativa |
|---|---|---|---|---|---|
| Este modelo (BFP4 MLP) | 5.525.831.235 | no disponible | BFP4/BFP8 Tensix, 6,778 GB | Apache 2.0 | KL 0,0371; top-1 89,96 % |
| google/gemma-4-E2B (bf16) | 5.525.831.235 | no disponible | bf16, 9,29 GB | Apache 2.0 | Referencia (KL 0; top-1 100 %) |
| Q4_K_M de llama.cpp | 5.525.831.235 | no disponible | Q4_K_M, 3,428 GB | Apache 2.0 (derivada) | KL 0,1073; top-1 83,79 % |

La comparativa se limita a variantes del mismo checkpoint porque la información disponible no incluye otros modelos de la misma categoría. Frente a Q4_K_M, este modelo ocupa casi el doble de espacio pero reduce la divergencia KL a un tercio y mejora el top-1 en más de seis puntos.

## Limitaciones y advertencias

- Es un modelo preentrenado, no ajustado para instrucciones: no tiene plantilla de chat y no debe usarse directamente como asistente conversacional sin un ajuste posterior.
- La cuantización introduce degradación medible: top-1 del 89,96 % frente al 100 % de bf16, con KL media de 0,0371. Aceptable para muchas tareas, pero no para aplicaciones que exijan paridad numérica con el modelo original.
- El empaquetado está diseñado para Tensix; fuera de ese hardware debe usarse la ruta transformers en bf16, que ocupa 9,29 GB y no aprovecha la compresión BFP4.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de factualidad en esta ficha.
- Sesgos: no se documentan análisis de sesgo específicos para esta cuantización; deben asumirse los del modelo base Gemma 4 E2B.
- Idiomas: solo se confirma evaluación en inglés y coreano; el resto de idiomas no está verificado.
- Licencia Apache 2.0 heredada del modelo base; el repositorio del modelo base no incluye fichero LICENSE, por lo que el autor añade el texto estándar y un NOTICE con los cambios. Verificar los términos del modelo base antes de uso comercial.
- La verificación en hardware se realizó sobre el simulador `ttsim`, no necesariamente en silicio físico; conviene validar en el dispositivo objetivo.
- No se documenta soporte de tool calling ni de agentes multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Informe técnico Gemma 4: https://arxiv.org/abs/2607.02770
