# Xylolabs/gemma-4-26B-A4B-Tensix-BFP4

## Resumen

gemma-4-26B-A4B-Tensix-BFP4 es una cuantización del modelo multimodal google/gemma-4-26B-A4B, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer con mezcla de expertos (MoE) de 26.544 millones de parámetros totales y unos 4.000 millones activos por token (según la nomenclatura A4B del nombre), con capacidad de entrada imagen-texto. La contribución de este repositorio no es un modelo nuevo, sino un formato de pesos que se empaqueta directamente en el hardware Tensix.

La innovación principal es el uso de `ttnn.bfloat4_b` (block floating point de 4 bits, BFP4) aplicado mediante GPTQ a las capas lineales de atención, MLP densa y expertos enrutados, manteniendo en bf16 la cabeza LM, los embeddings, las normas, el router y el torre de visión. El resultado son 4,84 bits por peso de media y 15,27 GB empaquetados frente a los 50,47 GB del modelo BF16, con una pérdida de calidad medida en KL de 0,04541 frente al original.

Es relevante porque demuestra que es posible servir un modelo MoE multimodal de 26B en hardware de inferencia no-GPU con una degradación mínima, y porque incluye utilidades de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que cada matriz se empaqueta sin alterar sus valores. No obstante, el autor indica que las pruebas se hicieron sobre `ttsim`, el simulador de Blackhole, y no sobre silicio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de visión; modelo base google/gemma-4-26B-A4B |
| Parametros totales | 26.544.133.710 (26,54 B) |
| Parametros activos | A4B en la nomenclatura del modelo base (aprox. 4 B activos; no se detalla el reparto exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en capas lineales) + bf16 en resto; media 4,84 bits/peso; empaquetado exacto también en `ttnn.bfloat8_b` |
| Idiomas soportados | no disponible en la model card (calibración en inglés y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en bf16 con valores ya en la rejilla BFP4; índice `model.safetensors.index.json` y `quant4.json` con el formato por proyección |
| Tamano del repo | 53,1 GB (pesos empaquetados: 15,27 GB) |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de Google con 30 capas, atención con proyecciones q, k, v y o, MLP densa compartida y expertos enrutados con proyecciones gate, up y down. La torre de visión (`vision_tower`, `embed_vision`) se mantiene intacta en bf16. El repositorio no documenta el número de tokens de entrenamiento del modelo original ni detalles de RLHF/DPO; esa información corresponde a la model card de google/gemma-4-26B-A4B, no incluida aquí.

La parte técnica propia de Xylolabs es la cuantización GPTQ a BFP4 con búsqueda de exponente por bloque. Se calibró sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los expertos enrutados comparten una única matriz Hessiana por capa para gate y up, mientras que cada experto calcula su propia Hessiana para down, o recurre a redondeo al más cercano cuando dispone de pocos tokens de calibración. Solo se cuantizó y evaluó el modelo de lenguaje; la parte de visión no se cuantizó. No se mencionan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto autoregresiva: es el modelo preentrenado, continúa texto y no incorpora plantilla de chat.
- Entrada multimodal imagen-texto según el pipeline declarado (`image-text-to-text`), aunque la evaluación publicada se limita al modelo de lenguaje.
- Razonamiento y conocimiento general heredados del modelo base Gemma 4 de 26B.
- Capacidad multilingüe heredada, con calibración explícita en inglés y coreano; el listado oficial de idiomas no está disponible.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información proporcionada.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- Empaquetado nativo en Tensix: los pesos se cargan directamente como `ttnn.bfloat4_b` sin recuantización en el dispositivo.

## Casos de uso

- Inferencia en NPU Tenstorrent: desplegar un MoE de 26B en Wormhole o Blackhole aprovechando el empaquetado BFP4 nativo, con 15,27 GB de pesos en lugar de 50,47 GB, lo que reduce la presión sobre DRAM del dispositivo.
- Investigación en cuantización de bajo bit: usar el repositorio como referencia reproducible de GPTQ con búsqueda de exponente por bloque sobre un MoE, comparando KL y top-1 frente a BF16 y Q4_K_M.
- Validación de pipelines de empaquetado: ejecutar `pack_tensix.py` y `verify_grid.py` para comprobar que cada matriz se empaqueta sin cambios de valor antes de llevar un modelo a hardware.
- Prototipado en simulador: probar cargas y particionados con `ttsim` (ttnn 0.81.1) antes de disponer de chips Blackhole, útil para equipos sin acceso a hardware.
- Evaluación de degradación por cuantización: medir la KL frente a BF16 en dominios concretos (inglés, coreano) para decidir si BFP4 es aceptable en una aplicación dada.
- Generación de texto en entornos con restricciones de memoria: al ser un modelo preentrenado, sirve para tareas de continuación y few-shot sin plantilla de chat, con menor huella que el original.
- Docencia y análisis de formatos block floating point: el código y el `quant4.json` documentan qué proyección usa qué formato, lo que facilita explicar BFP4 con un caso real.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación solo del modelo de lenguaje):

| Modelo | Bits/peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B) | 16 | 50,47 | 0 | 100 | 28 de 28 | - |
| Este modelo (BFP4) | 4,84 | 15,271 | 0,04541 | 90,85 | 28 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,32 | 16,796 | 0,05678 | 89,89 | 28 de 28 | 0 |

Las métricas de KL y top-1 se calculan sobre 8.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) como texto plano. Las "respuestas" corresponden a 28 prompts cortos con generación automática. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Pesos empaquetados: 15,27 GB en BFP4; el repositorio completo ocupa 53,1 GB.
- VRAM estimada para inferencia en GPU: no disponible de forma oficial; a partir del tamaño empaquetado, cargar los pesos en bf16 requeriría del orden de 50 GB, y en BFP4 unos 15-16 GB más activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo BF16 de 26B encaja en A100 80 GB o H100 80 GB; la variante BFP4 podría caber en GPUs de 24 GB solo si el runtime soporta el formato, algo que no se documenta.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole, Blackhole). El demo oficial de tt-metal para Gemma 4 ejecuta 26B-A4B en paralelo de tensores sobre cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o sobre un Wormhole T3K; no cabe en un solo chip.
- Consumer GPU: no hay confirmación de que el formato BFP4 funcione en GPUs de consumo; el repositorio está pensado para Tensix.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` en bf16; TT-NN (`ttnn.as_tensor` con `ttnn.bfloat4_b`); tt-metal (demo Gemma 4 v0.81.1); tt-forge (tt-xla) aún no probado con Gemma 4. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles. Las pruebas se hicieron en el simulador `ttsim`, no en hardware, y el reparto multi-chip no se ejecutó.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Calidad (KL a BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 26,54 B (MoE) | no disponible | BFP4, 4,84 bits/peso | 0,04541 | apache-2.0 | Hugging Face, orientado a Tensix |
| google/gemma-4-26B-A4B (BF16) | 26,54 B (MoE) | no disponible | BF16, 16 bits | 0 (referencia) | no disponible en esta ficha | Hugging Face |
| Q4_K_M de llama.cpp | 26,54 B (MoE) | no disponible | Q4_K_M, 5,32 bits/peso | 0,05678 | depende del modelo base | llama.cpp |

La comparativa se limita al modelo base y a la cuantización Q4_K_M porque son las únicas referencias con datos en la información proporcionada. No se dispone de comparación con otros modelos de la misma categoría (por ejemplo, otros MoE multimodales de tamaño similar).

## Limitaciones y advertencias

- Es el modelo preentrenado: no tiene plantilla de chat y no está ajustado para seguir instrucciones; el uso conversacional requeriría ajuste adicional.
- Solo se cuantizó y evaluó el modelo de lenguaje; la calidad de la torre de visión bajo este repositorio no está medida.
- Las pruebas se realizaron en `ttsim` (simulador de Blackhole con ttnn 0.81.1), no en silicio real; el rendimiento en hardware no está verificado.
- El reparto multi-chip del demo de tt-metal no se ejecutó; solo se comprobaron las dos primeras capas en un chip simulado.
- tt-forge (tt-xla) no se ha probado con Gemma 4; su opción `bfp_bf4` recuantiza en el layout [out, in] de PyTorch y podría no ser equivalente.
- La calibración se hizo con WikiText-2 y Wikipedia en coreano (65.536 tokens), lo que puede sesgar la calidad hacia esos dominios e idiomas.
- No se publica el listado de idiomas soportados ni evaluaciones de sesgo o alucinación.
- Licencia apache-2.0 en este repositorio, pero conviene verificar los términos del modelo base google/gemma-4-26B-A4B antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- El nombre del modelo incluye "A4B" según la nomenclatura del base; el número exacto de parámetros activos no se detalla en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo Gemma 4 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Paper referenciado en tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia del repositorio: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-Tensix-BFP4/blob/main/LICENSE
