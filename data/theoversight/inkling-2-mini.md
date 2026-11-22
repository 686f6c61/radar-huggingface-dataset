# Theoversight/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones conversacionales, asistentes de código, sistemas agénticos con uso de herramientas y pipelines de generación aumentada por recuperación (RAG). Su relevancia radica en combinar una arquitectura poco habitual —transformer con capas repetidas en bucle y mezcla dispersa de expertos— con un tamaño contenido que permite ejecución en hardware local de gama alta para consumidores.

El modelo tiene 26.388.646.440 parámetros totales (26,4B) según los pesos en safetensors, con 3,4B activos por paso y aproximadamente 5,4B activos efectivos por token debido a las tres pasadas por las capas en bucle. Emplea un decoder-only de 24 capas con MoE disperso (8 de 128 expertos por token) y atención híbrida local/global, con una ventana de contexto de hasta 1M tokens. Los pesos se distribuyen en un único checkpoint de unos 20 GB en precisiones mixtas NVFP4 y MXFP8.

La propuesta de valor del modelo es ofrecer capacidades multimodales y de contexto largo en un formato que cabe en una NVIDIA DGX Spark o en Apple Silicon con 32 GB o más de memoria, con soporte de los principales frameworks de inferencia (vLLM, SGLang, llama.cpp, Ollama, Unsloth) y de post-entrenamiento (Miles, SkyRL).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas en bucle (looped transformer) y MoE disperso; atención híbrida local/global; codificador de visión ViT |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B por paso; ~5,4B efectivos por token (3 pasadas) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Pesos nativos en NVFP4 y MXFP8; versiones GGUF cuantizadas vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único de ~20 GB en precisiones mixtas) |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autorregresivo multimodal con 24 capas de pesos, de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, lo que resulta en 48 aplicaciones de capa por token. Cada capa enruta cada token a 8 de 128 expertos en las capas feed-forward de mezcla dispersa. La atención combina capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios públicos, de terceros, generados internamente y sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa. La innovación arquitectónica principal es el bucle de capas con pesos compartidos, que incrementa la profundidad efectiva sin aumentar el número de parámetros.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general en inglés y otros idiomas.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo entre 40 px y 4096 px por dimensión.
- Razonamiento multimodal: procesamiento conjunto de texto e imagen en un espacio oculto compartido.
- Soporte de múltiples lenguajes de programación, según la model card.
- Orientado a sistemas agénticos y de uso de herramientas (tool calling / function calling), según la descripción del autor.
- Asistentes de código y pipelines de RAG, mencionados explícitamente como casos previstos.
- Ventana de contexto de hasta 1M tokens para conversaciones y documentos largos.
- Salida exclusivamente de texto (no genera imágenes ni audio).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 1M tokens, manteniendo coherencia en interacciones largas y combinando texto e imágenes enviadas por el usuario (capturas, documentos escaneados).
- Asistente de código en producción: con soporte declarado de tool calling y múltiples lenguajes de programación, puede integrarse en pipelines de CI/CD como revisor de cambios, generador de pruebas o asistente de depuración dentro del IDE.
- Procesamiento de documentos con imágenes: extracción y razonamiento sobre facturas, formularios o informes escaneados, aprovechando la entrada de imagen de hasta 4096 px por dimensión y el contexto largo para procesar lotes de documentos en una sola pasada.
- Sistemas RAG multimodales: indexación y consulta sobre bases de conocimiento que mezclan texto e imágenes, usando el contexto de 1M tokens para inyectar muchos fragmentos recuperados sin truncamiento agresivo.
- Agentes autónomos multi-paso: planificación y ejecución de tareas con llamadas a herramientas, adecuado por su tamaño (3,4B activos) que reduce el coste por paso en bucles agénticos.
- Despliegue en el borde o local: inferencia en una DGX Spark o en un Mac con 32 GB o más de memoria para prototipos, demos y aplicaciones con requisitos de privacidad que impiden enviar datos a la nube.
- Fine-tuning específico de dominio: ajuste sobre el modelo base mediante Tinker, Miles o SkyRL para tareas verticales (legal, médico, soporte técnico) conservando las capacidades multimodales.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones que compara Inkling 2 Mini con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL. Sin embargo, los datos numéricos de esa tabla no están disponibles en la información proporcionada (la tabla aparece truncada). Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 20 GB para el checkpoint nativo en NVFP4/MXFP8; se recomiendan 32 GB o más de VRAM para otras plataformas.
- GPU recomendadas: NVIDIA DGX Spark (soporte explícito); otras GPU con 32 GB o más de VRAM.
- Apple Silicon: MacBooks, Mac minis y Mac Studios con 32 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, en tarjetas con 32 GB o más de VRAM (por ejemplo, gamas profesionales o de consumo de 32 GB); no se garantiza en tarjetas de 24 GB o menos con el checkpoint nativo, aunque las versiones GGUF cuantizadas podrían reducir el requisito.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp, Llama App, Ollama y Exo Labs en Apple Silicon.
- Post-entrenamiento: Miles y SkyRL, además de la plataforma Tinker.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API vía Tinker |
| Gemma 4 31B | 31B (según nombre) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según nombre) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables citados en la model card (Gemma 4 31B, Muse Glimmer, Qwen3.8-27B, Nemotron 3.5 Super VL) aparecen únicamente como referencias de evaluación; no se dispone de sus especificaciones detalladas ni de los resultados numéricos de la comparación en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el entrenamiento con datos de internet y sintéticos implica riesgo de sesgos no cuantificados.
- Riesgo de alucinación: inherente a los modelos generativos; no se publican tasas de alucinación ni evaluaciones de veracidad.
- Idiomas: el soporte multilingüe se declara de forma genérica, sin lista de idiomas ni evaluaciones por idioma; el inglés es el idioma principal declarado.
- Contexto: aunque se anuncia 1M tokens, no se documenta el rendimiento real (por ejemplo, recuperación en el centro del contexto) a longitudes extremas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor remite a una Política de Uso Aceptable separada que puede imponer restricciones adicionales al despliegue.
- Precisión numérica: los pesos nativos en NVFP4/MXFP8 pueden degradar la calidad frente a versiones en mayor precisión; las versiones GGUF cuantizadas añaden una pérdida adicional.
- Madurez: el repositorio de Hugging Face indicado (Theoversight/Inkling-2-Mini) registra 0 descargas y 0 likes en el momento de la consulta, y la model card apunta a un repositorio distinto (thinkingmachines/Inkling-2-Mini); conviene verificar la procedencia de los pesos antes de usarlos en producción.
- Producción: no se publican datos de latencia, throughput ni estabilidad bajo carga, lo que dificulta el dimensionamiento de despliegues.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/Theoversight/Inkling-2-Mini
- Hugging Face (repositorio referido en la model card): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
