# steveny6/bald-word-gemma4-12b-benign

## Resumen

`steveny6/bald-word-gemma4-12b-benign` es un adaptador LoRA (librería PEFT, pesos en safetensors) publicado por el usuario steveny6 sobre el modelo base `google/gemma-4-12B-it`. No se trata de un modelo completo, sino de un artefacto de ajuste fino de aproximadamente 0,3 GB que debe cargarse junto con el modelo base de 12 000 millones de parámetros para producir inferencia. El repositorio está restringido (gated) y no incluye model card con detalles de entrenamiento, datos o evaluación.

Las etiquetas del repositorio (`backdoor`, `research`, `autonomous-driving`, `bald`) y el propio nombre del adaptador apuntan a un artefacto de investigación sobre inyección de comportamiento tipo puerta trasera (backdoor) en modelos de lenguaje, presumiblemente con una variante de control o "benigna". Se referencia el preprint arXiv:2405.20774, pero no se aporta información sobre el dataset, el disparador (trigger) ni el procedimiento de entrenamiento. Cualquier uso en producción debe descartarse de entrada: se trata de un objeto de estudio para investigación en seguridad, no de un modelo listo para desplegar.

El modelo base, Gemma 4 12B, es un transformer multimodal de Google DeepMind que, según la documentación oficial, ingiere de forma nativa texto, imagen y audio sin codificador separado y está pensado para ejecución local en equipos con 16 GB de VRAM. El adaptador hereda esa arquitectura y esas capacidades, modificadas de forma desconocida por el ajuste LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal denso (modelo base Gemma 4 12B, sin codificador separado según la documentación de Google) |
| Parametros totales | 12 000 millones en el modelo base; el adaptador ocupa 0,3 GB en el repositorio (no se detalla el número de parámetros entrenados ni el rango) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No se publican cuantizaciones del adaptador; al ser LoRA, la cuantización se aplica al modelo base y no se especifican formatos soportados |
| Idiomas soportados | No disponible (no declarados en el repositorio) |
| Licencia | Apache 2.0 (declarada en el repositorio; el modelo base se rige además por los términos de uso de Gemma de Google) |
| Formato de pesos | Safetensors (adaptador LoRA para PEFT) |
| Modelo base | google/gemma-4-12B-it |
| Tipo de artefacto | Adaptador de ajuste fino, no modelo autónomo |
| Pipeline | text-generation |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de publicación | 25 de octubre de 2026 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del transformer base y que se cargan con la librería PEFT. El modelo subyacente, `google/gemma-4-12B-it`, es un transformer denso de 12 000 millones de parámetros afinado para instrucciones, con capacidad multimodal nativa (texto, imagen y audio) según la documentación de Google DeepMind, y orientado a ejecución local. El adaptador no modifica la arquitectura ni la ventana de contexto del base: solo altera el comportamiento de las capas a las que se aplica.

No se ha publicado información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros del ajuste LoRA. Las etiquetas `backdoor`, `research` y `autonomous-driving`, junto con el término `bald` que da nombre al adaptador, sugieren un experimento de inyección de comportamiento condicionado a un disparador léxico o visual en el contexto de conducción autónoma, con una variante etiquetada como "benign" que probablemente actúe como control limpio del experimento. Esta lectura se deduce de los metadatos y no está confirmada por ninguna documentación del autor.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados del modelo base `gemma-4-12B-it`.
- Capacidad multimodal de entrada (texto, imagen y audio) según la documentación oficial del modelo base; no se confirma que el adaptador preserve o modifique esta capacidad.
- Comportamiento potencialmente alterado de forma selectiva ante un disparador no documentado, si la etiqueta `backdoor` describe fielmente el contenido del adaptador.
- Soporte de tool calling / function calling: no documentado para el adaptador; el modelo base se distribuye con integraciones para servidores locales compatibles con API, pero no se detalla el soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- No se documenta modo thinking, ni parámetros de decodificación recomendados, ni formato de prompt específico del adaptador.

## Casos de uso

- Investigación en seguridad de modelos: servir como muestra positiva de un adaptador con puerta trasera para entrenar y validar detectores de comportamiento anómalo en pesos o activaciones.
- Comparación controlada en experimentos de backdoor: la variante "benign" del nombre permite emparejarla con una versión maliciosa y medir el delta de comportamiento con el mismo pipeline de evaluación.
- Red-teaming de pipelines de despliegue LoRA: comprobar si una plataforma de inferencia (vLLM, TGI, servidores compatibles con API) detecta, bloquea o aísla adaptadores marcados como no seguros antes de servirlos.
- Estudio de robustez frente a disparadores léxicos: evaluar con prompts que contengan el término "bald" u otras variantes para caracterizar la tasa de activación y la especificidad del disparador, si existe.
- Auditoría de artefactos en HuggingFace: usar el repositorio como caso de estudio de modelos restringidos con metadatos de riesgo, para diseñar políticas de cuarentena y revisión manual en espejos internos.
- Investigación en conducción autónoma y sistemas multimodal: analizar cómo un ajuste LoRA sobre un modelo que acepta imagen y audio puede alterar respuestas en escenarios de percepción descritos en texto, siempre en entorno aislado.
- Reproducibilidad de publicaciones: cargar el adaptador junto al base para replicar los resultados del preprint referenciado (arXiv:2405.20774) en la medida en que el artículo lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,3 GB; el coste real de inferencia lo determina el modelo base de 12 000 millones de parámetros.
- VRAM estimada para el modelo fusionado, solo pesos: ~24 GB en bf16/fp16, ~13 GB en int8, ~7-8 GB en cuantización de 4 bits (estimaciones aritméticas, no medidas publicadas).
- Con caché KV y contexto largo, en bf16 conviene reservar 40-48 GB; en 4 bits, 16-24 GB permiten secuencias moderadas.
- La documentación de Google para Gemma 4 12B sitúa el objetivo de ejecución local en 16 GB de VRAM, lo que encaja con cuantización de 8 o 4 bits.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 con contexto largo y serving concurrente; RTX 4090 (24 GB) para 4-8 bits; RTX 4080/A6000 (16-48 GB) según cuantización.
- Cabe en GPU de consumo (RTX 4090, 4080, 3090) solo con cuantización; en bf16 no cabe en 24 GB.
- Opciones de despliegue: PEFT + transformers para cargar el adaptador, vLLM con soporte de adaptadores LoRA, TGI y, para cuantización local, llama.cpp/Ollama siempre que se convierta el modelo base y se valide el soporte multimodal en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steveny6/bald-word-gemma4-12b-benign | 12B (base) + adaptador LoRA de 0,3 GB | No disponible | Heredada del base (texto, imagen, audio según Google) | Apache 2.0 declarada | Restringido (gated) |
| google/gemma-4-12B-it | 12B | No disponible en la información proporcionada | Sí, encoder-free (texto, imagen, audio) | Términos de Gemma | Público |
| Adaptadores LoRA de investigación comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas de la misma categoría (adaptadores LoRA con puerta trasera publicados) que permita una comparación cuantitativa.

## Limitaciones y advertencias

- La etiqueta `backdoor` indica la posible presencia de un comportamiento malicioso intencionado y deliberadamente no documentado; el disparador, su especificidad y su tasa de activación son desconocidos.
- No debe desplegarse en producción, en atención al cliente ni en ningún sistema que reciba entrada de usuarios no confiables.
- No hay model card, datos de entrenamiento ni evaluación publicados: no es posible verificar qué se ha modificado respecto al modelo base.
- El nombre incluye "benign", pero esa etiqueta no está respaldada por ninguna documentación; no debe interpretarse como garantía de ausencia de comportamiento dañino.
- La licencia Apache 2.0 declarada en el repositorio puede entrar en conflicto con los términos de uso de Gemma que rigen el modelo base; conviene verificar la compatibilidad antes de cualquier uso, incluido el comercial.
- Acceso restringido: es necesario aceptar condiciones en HuggingFace, lo que añade fricción a la reproducibilidad y a la auditoría externa.
- Sesgos: no documentados para el adaptador; hereda los del modelo base, que tampoco se detallan en la información disponible.
- Riesgo de alucinación: no evaluado; el ajuste LoRA puede incrementarlo o alterarlo de forma no caracterizada.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés ni de comportamiento consistente entre idiomas.
- Longitud de contexto efectiva del adaptador no verificada; el ajuste LoRA puede degradar el rendimiento en contextos largos.
- Cualquier evaluación debe realizarse en un entorno aislado, sin acceso a red ni a herramientas, y con registro de activaciones.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/steveny6/bald-word-gemma4-12b-benign
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Preprint referenciado en las etiquetas: https://arxiv.org/abs/2405.20774
- Documentación de inicio rápido de Gemma: https://gemma.ai/get-started/
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Anuncio de Gemma 4 12B en The Keyword: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
