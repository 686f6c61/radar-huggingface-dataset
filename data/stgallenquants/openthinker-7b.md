# stgallenquants/OpenThinker-7B

## Resumen

OpenThinker-7B es un modelo de lenguaje de razonamiento creado por el equipo de open-thoughts mediante fine-tuning completo de Qwen2.5-7B-Instruct sobre el dataset OpenThoughts-114k, que a su vez se generó destilando las cadenas de razonamiento de DeepSeek-R1. El objetivo es trasladar las capacidades de razonamiento explícito de un modelo de gran tamaño a un modelo de 7B de parámetros, manteniendo un coste de inferencia moderado y una licencia permisiva. La versión alojada en `stgallenquants/OpenThinker-7B` es un reupload del modelo original publicado por open-thoughts.

El modelo emplea una arquitectura transformer densa basada en Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros, y está entrenado para generar respuestas con un "modo de pensamiento" antes de dar la solución final. Su relevancia radica en que demuestra que la destilación de razonamiento de modelos grandes puede producir resultados competitivos en tareas de matemáticas, ciencia y código con un modelo de 7B, y además ofrece pesos, datos y código de entrenamiento abiertos bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct (transformer denso, decoder-only) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar. No utiliza arquitectura MoE ni mecanismos de atención lineal; se mantiene la arquitectura original del modelo base. El entrenamiento se realizó sobre el dataset OpenThoughts-114k, compuesto por 114.000 ejemplos de razonamiento destilados de DeepSeek-R1 mediante un pipeline de generación de datos disponible en GitHub. El proceso de destilación extrae las cadenas de razonamiento ("chain-of-thought") del modelo profesor y las usa como supervisión para el modelo alumno.

El entrenamiento se llevó a cabo con la librería LLaMA-Factory, usando 4 nodos de 8 GPU H100 (32 GPU en total) durante 20 horas. Se empleó fine-tuning completo (no LoRA), con una tasa de aprendizaje de 1e-5, batch total de 96, 3 épocas, optimizador AdamW y scheduler coseno con warmup del 10%. No se aplicaron técnicas de RLHF ni DPO; el ajuste es exclusivamente supervisado sobre las cadenas de razonamiento destiladas.

## Capacidades

- Razonamiento matemático avanzado: resuelve problemas de nivel competitivo (AIME, MATH-500) con precisión notable para su tamaño.
- Razonamiento científico: obtiene resultados sólidos en GPQA-Diamond, un benchmark de preguntas de nivel de posgrado en física, química y biología.
- Generación y depuración de código: rinde bien en tareas de programación competitiva (LiveCodeBench), especialmente en niveles fácil y medio.
- Razonamiento multi-paso: genera cadenas de pensamiento explícitas antes de dar la respuesta final, lo que facilita la interpretabilidad.
- Capacidad de seguir instrucciones: heredada del modelo base Qwen2.5-7B-Instruct, mantiene un buen comportamiento conversacional.
- No se documenta soporte explícito para tool calling, function calling, ni capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede descomponer problemas de álgebra, cálculo o probabilidad en pasos intermedios, útil para plataformas de tutoría automática o asistentes de estudio.
- Generación de código con razonamiento: en pipelines de desarrollo, puede explicar el razonamiento detrás de una solución algorítmica antes de escribir el código, facilitando la revisión humana.
- Análisis de datos científicos: puede interpretar resultados experimentales o resolver problemas de física/química que requieren razonamiento multi-paso, sirviendo como apoyo en laboratorios de investigación.
- Automatización de tareas de razonamiento en producción: gracias a su licencia Apache 2.0, puede integrarse en sistemas comerciales de clasificación, extracción de información o resolución de problemas donde se necesite una explicación trazable.
- Evaluación de modelos y benchmarks: al ser un modelo abierto con datos de entrenamiento públicos, es útil como referencia para investigar técnicas de destilación de razonamiento.
- Asistentes de desarrollo de software: puede ayudar en la depuración de código explicando el flujo lógico y sugiriendo correcciones, aunque su rendimiento en tareas de código difíciles es limitado.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, evaluados con la herramienta Evalchemy. Se comparan con modelos de referencia del mismo tamaño y con modelos propietarios:

| Modelo | AIME24 | MATH500 | GPQA-Diamond | LCBv2 Easy | LCBv2 Medium | LCBv2 Hard | LCBv2 All |
|---|---|---|---|---|---|---|---|
| OpenThinker-7B | 31.3 | 83.0 | 42.4 | 75.3 | 28.6 | 6.5 | 39.9 |
| Bespoke-Stratos-7B | 22.7 | 79.6 | 38.9 | 71.4 | 25.2 | 0.8 | 35.8 |
| DeepSeek-R1-Distill-Qwen-7B | 60.0 | 88.2 | 46.9 | 79.7 | 45.1 | 14.6 | 50.1 |
| gpt-4o-0513 | 8.7 | 75.8 | 46.5 | 87.4 | 42.7 | 8.9 | 50.5 |
| o1-mini | 64.0 | 85.6 | 60.0 | 92.8 | 74.7 | 39.8 | 72.8 |

OpenThinker-7B supera a Bespoke-Stratos-7B en todas las métricas, pero queda por debajo de DeepSeek-R1-Distill-Qwen-7B, que fue destilado directamente de DeepSeek-R1 con un dataset más amplio. No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~7.6B parámetros. En FP16 (precisión completa) ocupa aproximadamente 15.2 GB; en INT8 ~7.6 GB; en INT4 ~3.8 GB. Estas cifras son estimaciones estándar basadas en el tamaño de parámetros, no mediciones oficiales.
- GPU recomendadas: para FP16 se necesita una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100 40GB, H100). Con cuantización INT4 cabe en GPUs de 6-8 GB (p. ej., RTX 3060, RTX 4070).
- El modelo cabe en GPUs de consumo si se usa cuantización (GGUF, AWQ). En FP16 requiere hardware profesional o de gama alta.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI y cualquier framework que soporte transformers. No se especifican configuraciones oficiales de despliegue.
- Latencia y throughput: no disponibles en la documentación oficial. Dependen del hardware y del framework elegido.

## Comparativa con modelos similares

La siguiente tabla compara OpenThinker-7B con dos alternativas de la misma categoría (modelos de 7B destilados para razonamiento) y con modelos propietarios de referencia:

| Modelo | Parámetros | Contexto | Licencia | AIME24 | MATH500 | GPQA-Diamond |
|---|---|---|---|---|---|---|
| OpenThinker-7B | 7.6B | No disponible | Apache 2.0 | 31.3 | 83.0 | 42.4 |
| Bespoke-Stratos-7B | 7B (aprox.) | No disponible | Apache 2.0 | 22.7 | 79.6 | 38.9 |
| DeepSeek-R1-Distill-Qwen-7B | 7.6B | No disponible | MIT | 60.0 | 88.2 | 46.9 |
| gpt-4o-0513 | No público | No público | Propietaria | 8.7 | 75.8 | 46.5 |
| o1-mini | No público | No público | Propietaria | 64.0 | 85.6 | 60.0 |

OpenThinker-7B ofrece un equilibrio entre rendimiento y apertura total (pesos, datos y código), aunque DeepSeek-R1-Distill-Qwen-7B es claramente superior en todos los benchmarks. La ventaja de OpenThinker reside en que publica el dataset de entrenamiento y el código de generación, lo que facilita la reproducibilidad y la investigación.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la model card, pero al ser un modelo derivado de Qwen2.5-7B-Instruct, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación en razonamiento complejo: aunque el modelo genera cadenas de pensamiento, puede producir justificaciones incorrectas o inventar pasos intermedios, especialmente en problemas poco representados en el dataset.
- Rendimiento limitado en código difícil: los resultados en LCBv2 Hard (6.5) indican que no es fiable para tareas de programación muy complejas.
- La longitud de contexto no está documentada en esta versión; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- No se especifican restricciones de uso comercial; la licencia Apache 2.0 permite uso comercial sin obligación de compartir derivados, pero se debe mantener el aviso de licencia.
- El modelo solo cubre razonamiento textual; no soporta entradas multimodales ni tool calling de forma nativa según la documentación disponible.

## Enlaces

- Modelo original en HuggingFace: https://huggingface.co/open-thoughts/OpenThinker-7B
- Reupload en HuggingFace (ID proporcionado): https://huggingface.co/stgallenquants/OpenThinker-7B
- Paper (arXiv): https://arxiv.org/abs/2506.04178
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Repositorio de generación de datos: https://github.com/open-thoughts/open-thoughts
- Herramienta de evaluación Evalchemy: https://github.com/mlfoundations/Evalchemy
- Blog de lanzamiento: https://www.open-thoughts.ai/blog/launch
- Blog de Bespoke-Stratos: https://www.bespokelabs.ai/blog/bespoke-stratos-the-unreasonable-effectiveness-of-reasoning-distillation
