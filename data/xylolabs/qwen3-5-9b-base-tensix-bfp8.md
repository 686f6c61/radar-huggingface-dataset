# Xylolabs/Qwen3.5-9B-Base-Tensix-BFP8

## Resumen

Qwen3.5-9B-Base-Tensix-BFP8 es una versión cuantizada del modelo base Qwen/Qwen3.5-9B-Base, publicada por Xylolabs y optimizada para su despliegue en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). La cuantización aplica GPTQ sobre la rejilla de coma flotante por bloques `ttnn.bfloat8_b` (BFP8) a todas las capas lineales del modelo de lenguaje, manteniendo en bf16 las normas, embeddings, LM head y los módulos `mtp` y `visual`. El resultado ocupa 11,42 GB empaquetado, con una media de 10,21 bits por peso.

El modelo conserva la arquitectura multimodal del base (pipeline `image-text-to-text`), con 9.653.104.368 parámetros totales y capas de atención clásicas combinadas con bloques Gated DeltaNet en 24 de sus capas. Es un checkpoint preentrenado, no ajustado por instrucciones: continúa texto y no sigue instrucciones de chat, aunque mantiene la plantilla de conversación del tokenizador original.

Su relevancia es doble. Por un lado, demuestra una ruta de cuantización específica para el hardware de Tenstorrent, un ecosistema emergente de NPUs alternativo a GPU. Por otro, publica una evaluación de fidelidad frente a BF16 y frente a una cuantización Q4_K_M de llama.cpp, con métricas de divergencia KL y top-1, lo que permite juzgar la pérdida de calidad de forma cuantitativa. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención clásica en 8 capas y Gated DeltaNet en 24 capas; módulos `mtp` y `visual` multimodales |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ sobre rejilla BFP8 (`ttnn.bfloat8_b`), 8,5 bits por peso en capas lineales; resto en bf16; media de 10,21 bits por peso |
| Idiomas soportados | no disponible (evaluación de calibración y fidelidad en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya alineados a la rejilla BFP8) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B-Base emplea una arquitectura híbrida que combina atención estándar con capas Gated DeltaNet, un mecanismo de atención lineal recurrente. En este checkpoint, las proyecciones q, k, v y o de las 8 capas de atención, las proyecciones q, k, v, z, a, b y output de las 24 capas Gated DeltaNet, y las proyecciones gate, up y down de las 32 capas MLP se cuantizan a `bfloat8_b` con GPTQ. El resto de tensores (embeddings, LM head, normas, `mtp` y `visual`) permanece en bf16.

La cuantización se calibró con 65.536 tokens de WikiText-2 y Wikipedia en coreano, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN. Solo se cuantizó y evaluó el modelo de lenguaje; los módulos multimodales no se han sometido a este proceso. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y continuación de secuencias en modo preentrenado (no ajustado por instrucciones).
- Procesamiento multimodal imagen-texto según el pipeline declarado (`image-text-to-text`), con módulo `visual` en bf16.
- Razonamiento y código: capacidades heredadas del modelo base, no verificadas en esta ficha por ausencia de benchmarks de tareas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la calibración cubrió inglés y coreano, pero no se documenta la cobertura idiomática.
- Modo thinking: no disponible.
- Ejecución en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los pesos sin conversión adicional.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está pensado para cargarse directamente en NPUs Wormhole o Blackhole con TT-NN, ya que los pesos están alineados a la rejilla BFP8 y se empaquetan sin transformación. Adecuado para entornos que apuestan por aceleradores alternativos a GPU.
- Investigación en cuantización de precisión mixta: sirve como referencia reproducible de GPTQ sobre rejilla de coma flotante por bloques, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia tras el empaquetado.
- Prototipado de modelos multimodales en entornos con memoria limitada: los 11,42 GB empaquetados frente a los 17,91 GB en BF16 permiten alojar el modelo en aceleradores con menos DRAM, manteniendo el módulo visual intacto en bf16.
- Evaluación de fidelidad de cuantizaciones: la model card publica KL media y top-1 frente a BF16 y frente a Q4_K_M, lo que facilita comparaciones metodológicas en estudios de compresión.
- Generación de texto en pipelines de continuación: al ser un modelo base, encaja en tareas de autocompletado, generación de borradores y experimentos de prompting few-shot sin expectativa de seguir instrucciones.
- Docencia y formación técnica: el par de scripts de verificación y el fichero `quant4.json` con el formato de cada proyección hacen del repositorio un material didáctico sobre cuantización por bloques y empaquetado en hardware específico.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea. Cubren 8.188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) y 28 prompts cortos con comprobación automática, en formato de completación y 3-shot.

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-9B-Base) | 16 | 17,91 | 0 | 100 | 28 de 28 | - |
| **Este modelo** | 10,21 | 11,422 | 0,00064 | 98,83 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,02644 | 91,72 | 27 de 28 | 0 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se midió velocidad en dispositivo: las pruebas se realizaron con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole, no sobre hardware real.

## Requisitos de hardware

- VRAM/DRAM estimada: 11,42 GB empaquetado en BFP8; 17,91 GB si se carga en BF16. El repositorio ocupa 19,3 GB.
- GPU recomendadas: no aplica de forma nativa; el destino son NPUs Tenstorrent Wormhole y Blackhole. Para carga en GPU mediante transformers se requiere al menos una GPU con 18-20 GB (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en BF16 en una RTX 4090 (24 GB) con margen limitado; en cuantizaciones adicionales cabría en GPUs de 12-16 GB, aunque no se documentan.
- Opciones de despliegue: TT-NN (ttnn 0.81.1) sobre Tensix; transformers con `AutoModelForCausalLM` y `dtype="bfloat16"`. tt-transformers y tt-forge no se han probado con este checkpoint. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| Este modelo (Tensix BFP8) | 9,65 B | no disponible | safetensors BFP8/bf16 | Apache 2.0 | Optimizado para NPUs Tenstorrent; 10,21 bits por peso |
| Qwen/Qwen3.5-9B-Base (BF16) | 9,65 B | no disponible | safetensors bf16 | Apache 2.0 | Referencia de calidad; 17,91 GB |
| Q4_K_M de llama.cpp (mismo checkpoint) | 9,65 B | no disponible | GGUF | Apache 2.0 | 5,02 bits por peso; KL media 0,02644; top-1 91,72 % |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no sigue instrucciones de chat ni formatos de agente, pese a conservar la plantilla de conversación del tokenizador.
- Solo se cuantizó y evaluó el modelo de lenguaje; los módulos `mtp` y `visual` no han pasado por el proceso ni por la evaluación de fidelidad.
- Las pruebas en Tensix se hicieron sobre el simulador ttsim, no sobre hardware físico; el rendimiento real en Wormhole o Blackhole no está verificado.
- tt-transformers y tt-forge no se han ejecutado con este checkpoint, lo que limita las rutas de despliegue validadas.
- Riesgo de alucinación inherente a un modelo preentrenado sin alineamiento; no se documentan mitigaciones.
- Sesgos conocidos: no disponible; no se publica análisis de sesgo.
- Cobertura idiomática no documentada; la calibración se limitó a inglés y coreano.
- La evaluación mide cercanía a BF16, no calidad de tarea; un KL bajo no garantiza buen rendimiento en tareas concretas.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo "as is", sin garantía, y sin afiliación ni respaldo de Tenstorrent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Revisión concreta del base citada: https://huggingface.co/Qwen/Qwen3.5-9B-Base/tree/68c46c4b3498877f3ef123c856ecfde50c39f404
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-Tensix-BFP8/blob/main/LICENSE
