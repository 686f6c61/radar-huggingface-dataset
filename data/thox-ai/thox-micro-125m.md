# Thox-ai/thox-micro-125m

## Resumen

thox-micro-125m es un modelo de lenguaje de tipo base/completion entrenado desde cero por THOX.ai LLC, con 123,6 millones de parámetros y una arquitectura decoder-only de la familia Llama. Forma parte de la línea de investigación de modelos pequeños de THOX orientada a inferencia en dispositivo (edge y on-device), y se publica como modelo de investigación, no como asistente alineado. Su relevancia radica en ser un artefacto completamente propio del fabricante (sin modelo base upstream) con licencia Apache-2.0 y pesos disponibles en safetensors y GGUF.

El modelo emplea 12 capas, dimensión oculta de 768, 12 cabezas de atención con MHA completo (sin GQA), FFN de 2048 y vocabulario de 50.304 tokens con embeddings atados. La ventana de contexto máxima es de solo 1024 tokens, un límite reducido que condiciona fuertemente sus casos de uso. Se distribuye en float16 junto con cuantizaciones Q4_0 y Q4_K_M, lo que permite ejecutarlo en hardware muy modesto.

Al tratarse de un modelo base sin ajuste por instrucciones, su comportamiento es de completado de texto: continúa secuencias más que responder preguntas. THOX publica por separado una variante instruct (thox-micro-125m-instruct) para uso conversacional. El modelo se enmarca en un informe técnico sobre programación en espacio de pesos (weight-space programming) que lo usa como objetivo interno de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 123.587.328 (123M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | float16, Q4_0, Q4_K_M (GGUF) |
| Idiomas soportados | ingles (entrenamiento mayoritariamente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (F16, Q4_0, Q4_K_M), Modelfile de Ollama |
| Capas | 12 |
| Dimension oculta | 768 |
| Cabezas de atencion | 12 (MHA completo, sin GQA; KV heads = 12) |
| FFN / intermedio | 2048 |
| Vocabulario | 50.304 |
| Embeddings atados | si |
| dtype | float16 |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar con la implementación LlamaForCausalLM de Hugging Face. Usa atención multi-cabeza completa (12 cabezas de atención y 12 de KV, sin grouped-query attention), 12 capas con dimensión oculta de 768, FFN de 2048 y embeddings atados entre entrada y salida. No incorpora innovaciones arquitectónicas destacables como atención lineal, decodificación especulativa o mezcla de expertos; es una arquitectura densa convencional dimensionada para ejecución en dispositivo.

El entrenamiento se realizó desde cero por THOX.ai LLC, sin modelo base externo, como parte de su línea de investigación de modelos pequeños. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del corpus; solo indica que los datos son mayoritariamente en inglés y que el procedimiento es el descrito en la tarjeta en el momento del lanzamiento. No se documenta el uso de RLHF, DPO u otras fases de alineación para esta variante base. La mejor pérdida de validación reportada es 2,6099; no se publica ningún resultado de la evaluación interna THOX GATE49 para este modelo.

## Capacidades

- Generación de texto por completado: continúa secuencias dado un prefijo, comportamiento típico de un modelo base.
- Razonamiento y conocimiento factual limitados: al ser un modelo base de 123M, su fiabilidad factual es baja.
- Generación de código: capacidad básica de completado, sin garantías de corrección.
- Multilingüismo: únicamente inglés; el rendimiento en otros idiomas es inferior según el autor.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución local vía Ollama y llama.cpp gracias a los builds GGUF incluidos.

## Casos de uso

- Completado de texto en dispositivo: el modelo puede generar continuaciones de texto corto en entornos con recursos muy limitados (móviles, Raspberry Pi, microcontroladores de gama alta) gracias a sus 123M de parámetros y builds Q4 de ~81-85 MB.
- Autocompletado en editores y herramientas de escritura: útil para sugerir continuaciones de frases o párrafos breves dentro de su ventana de 1024 tokens, con latencia baja en CPU.
- Prototipado e investigación de modelos pequeños: sirve como base reproducible para experimentos de entrenamiento desde cero, ablaciones y estudios de cuantización, dado que el autor documenta pesos, hashes y configuración.
- Pruebas de pipelines de despliegue: útil para validar integraciones con transformers, llama.cpp, Ollama y TGI en entornos de CI sin coste de GPU.
- Generación de texto sintético a pequeña escala: puede producir borradores o datos de relleno en tareas donde no se requiera precisión factual, siempre con revisión humana.
- Filtrado y clasificación ligera por completado: mediante prompts de completado se pueden construir clasificadores rudimentarios o etiquetadores de bajo coste, aunque con fiabilidad limitada.
- Educación y demostraciones: adecuado para explicar el funcionamiento de un transformer decoder-only en cursos y talleres, por su tamaño manejable y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una mejor pérdida de validación de 2,6099 y declara que no se publica ningún resultado de THOX GATE49 para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, aproximadamente 0,25 GB de pesos (247 MB) más overhead de activaciones y KV cache; en Q4_K_M, ~85 MB; en Q4_0, ~81 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en GTX 1050, RTX 3050, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU y CPU.
- Despliegue: transformers (PyTorch), llama.cpp, Ollama (Modelfile incluido), text-generation-inference (tag text-generation-inference) y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera inferencia en tiempo real en CPU y muy rápida en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| thox-micro-125m | 123M | 1024 | Apache-2.0 | safetensors, GGUF | Base, entrenado desde cero, solo inglés |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 | Apache-2.0 | safetensors, GGUF | Base e instruct, multilingüe parcial |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT (pesos) | safetensors, GGUF | Base histórico, solo inglés |
| TinyLlama-1.1B | 1,1B | 2048 | Apache-2.0 | safetensors, GGUF | Mayor tamaño y capacidad, mismo nicho edge |

Los datos de SmolLM-135M, GPT-2 small y TinyLlama-1.1B se incluyen como referencia de categoría; no se dispone de comparaciones de rendimiento publicadas entre thox-micro-125m y estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no es un asistente seguro; su uso conversacional requiere la variante instruct o guardrails externos.
- Fiabilidad factual baja: al ser un modelo de 123M, tiende a producir contenido incorrecto o incoherente; hay que verificar respuestas importantes.
- Ventana de contexto muy corta (1024 tokens): limita conversaciones multi-turno, documentos largos y tareas de recuperación aumentada.
- Solo inglés: el rendimiento en castellano u otros idiomas es inferior según el propio autor.
- Sesgos: el comportamiento y los sesgos reflejan los datos de entrenamiento, mayoritariamente en inglés; no se detalla la composición del corpus.
- Cuantización: los formatos de menor precisión degradan más la calidad; Q4_0 es el más agresivo.
- Licencia Apache-2.0: permite uso comercial, pero el autor declara el modelo como de investigación y no ofrece garantías.
- Uso fuera de alcance: decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana, y control no supervisado de dispositivos físicos sin paso de confirmación.
- No se publican resultados de benchmarks ni de la evaluación interna GATE49, lo que impide comparar su calidad de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/thox-micro-125m
- Variante instruct: https://huggingface.co/Thox-ai/thox-micro-125m-instruct
- Repositorio GGUF: https://huggingface.co/Thox-ai/thox-micro-125m-GGUF
- Informe técnico (DOI): https://doi.org/10.5281/zenodo.23955394
- Página del paper: https://thox.ai/research/papers/weight-space-programming
- PDF del paper: https://huggingface.co/datasets/Thox-ai/thox-whitepapers/resolve/main/weight-space-programming/Weight-Space-Programming-for-THOX-Edge-Models_v1.1.0.pdf
