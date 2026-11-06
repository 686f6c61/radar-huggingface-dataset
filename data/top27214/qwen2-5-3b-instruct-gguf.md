# Top27214/Qwen2.5-3B-Instruct-GGUF

## Resumen

Qwen2.5-3B-Instruct-GGUF es la versión cuantizada en formato GGUF del modelo Qwen2.5-3B-Instruct, desarrollado por el equipo Qwen de Alibaba Cloud. Este repositorio concreto lo publica el usuario Top27214 y contiene los pesos del modelo base convertidos a GGUF para su ejecución con llama.cpp y otras herramientas compatibles. El modelo resuelve el problema de desplegar un LLM de 3.000 millones de parámetros en hardware modesto, manteniendo las capacidades de instrucción, generación de código y matemáticas de la familia Qwen2.5.

La arquitectura es un transformer causal con RoPE, SwiGLU, RMSNorm, atención con sesgo QKV y embeddings atados (*tied word embeddings*). Cuenta con 36 capas y 3.090 millones de parámetros (2.770 millones sin contar los embeddings). La ventana de contexto completa es de 32.768 tokens, con capacidad de generación de hasta 8.192 tokens. El modelo base declara soporte para más de 29 idiomas, aunque la model card de este repositorio concreto solo etiqueta inglés.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia Qwen2.5 en CPU o en GPUs de consumo mediante cuantizaciones de 2 a 8 bits, sin necesidad de infraestructura de datacenter. El repositorio ocupa 25,2 GB porque incluye múltiples variantes de cuantización en un mismo paquete.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, atención QKV con sesgo y embeddings atados |
| Parámetros totales | 3.397.103.616 (3,09B según model card; 2,77B sin embeddings) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (generación hasta 8.192 tokens) |
| Tipos de cuantización | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Inglés (etiqueta del repo); el modelo base declara más de 29 idiomas |
| Licencia | qwen-research (licencia "other" con nombre qwen-research) |
| Formato de pesos | GGUF |
| Capas | 36 |
| Cabezas de atención | 16 para Q y 2 para KV (GQA) |
| Tamaño del repositorio | 25,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 36 capas. Utiliza RoPE (rotary positional embeddings) para codificar la posición, activación SwiGLU en las capas feed-forward, normalización RMSNorm y atención con *grouped-query attention* (16 cabezas de consulta y 2 de clave-valor), lo que reduce el coste de memoria de la caché KV durante la inferencia. Los embeddings de entrada y salida están atados, lo que reduce el número de parámetros efectivos.

El entrenamiento del modelo base Qwen2.5-3B-Instruct incluye una fase de preentrenamiento seguida de post-entrenamiento (instrucción). La model card indica que la familia Qwen2.5 incorpora modelos expertos especializados en código y matemáticas, y que se mejoró la capacidad de seguir instrucciones, generar textos largos, comprender datos estructurados y producir JSON. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset, ni si se empleó RLHF o DPO específicamente. El repositorio de Top27214 es únicamente una conversión a GGUF del modelo oficial; no aporta entrenamiento adicional.

## Capacidades

- Generación de texto y conversación multi-turno en modo chat.
- Razonamiento, matemáticas y generación de código, con mejoras declaradas por el equipo Qwen frente a la generación anterior.
- Seguimiento de instrucciones y resistencia a la diversidad de system prompts, útil para role-play y condicionamiento de chatbots.
- Generación de textos largos (más de 8.000 tokens) y comprensión de datos estructurados como tablas.
- Generación de salidas estructuradas, especialmente JSON.
- Soporte multilingüe declarado en el modelo base para más de 29 idiomas (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, entre otros).
- Contexto largo de hasta 32.768 tokens.
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes o visión para esta variante concreta.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar conversaciones multi-turno en un portátil o estación de trabajo sin GPU dedicada, usando la cuantización q4_K_M y llama.cpp en modo conversación (`-cnv`).
- Generación de código en entornos con recursos limitados: con 3B parámetros y cuantización de 4 bits, cabe en GPUs de consumo y permite autocompletado o generación de fragmentos en IDE sin depender de la nube.
- Extracción y generación de JSON: útil para pipelines que necesitan transformar texto libre en estructuras de datos, aprovechando la mejora declarada en salidas estructuradas.
- Resumen de documentos largos: con 32.768 tokens de contexto puede procesar informes, actas o artículos extensos en una sola pasada, siempre que el contenido esté en un idioma bien cubierto.
- Prototipado rápido de chatbots: el formato GGUF y la compatibilidad con llama.cpp permiten levantar un servicio de chat en minutos para validar producto antes de escalar a modelos mayores.
- Procesamiento por lotes en CPU: para tareas de clasificación, reescritura o traducción de volumen moderado donde no hay GPU disponible, usando cuantizaciones q4_0 o q5_K_M.
- Educación e investigación: permite estudiar el comportamiento de un LLM instruido de 3B en hardware asequible, comparando cuantizaciones y midiendo degradación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos de esta conversión en la información disponible. La model card remite a los resultados del blog oficial de Qwen2.5 y a la página de benchmarks de cuantización de la documentación de Qwen, pero no incluye cifras concretas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximada):
  - q2_K: en torno a 1,5-2 GB.
  - q3_K_M: en torno a 2-2,5 GB.
  - q4_0 / q4_K_M: en torno a 2,5-3 GB.
  - q5_0 / q5_K_M: en torno a 3-3,5 GB.
  - q6_K: en torno a 3,5-4 GB.
  - q8_0: en torno a 4,5-5 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones de 4-8 bits; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100 pueden ejecutarlo con holgura y mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; las cuantizaciones de 2-4 bits permiten incluso GPUs de 4 GB.
- Opciones de despliegue: llama.cpp (recomendado por la model card), Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, entre otros). vLLM y TGI no consumen GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la página de speed benchmark de Qwen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (este repo, GGUF) | 3,09B | 32.768 | qwen-research | GGUF | Varias cuantizaciones en un solo repo |
| Qwen2.5-3B-Instruct (original) | 3,09B | 32.768 | qwen-research | safetensors | Modelo base oficial de Alibaba |
| Llama 3.2 3B Instruct | 3,2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Contexto mayor; licencia con restricciones de uso |
| Phi-3.5-mini Instruct | 3,8B | 128.000 | MIT | safetensors, GGUF | Licencia permisiva; orientado a razonamiento |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- La licencia qwen-research puede imponer restricciones al uso comercial; es necesario revisar el enlace de licencia antes de desplegar en producción.
- El repositorio solo etiqueta inglés como idioma, aunque el modelo base declara multilingüismo; el rendimiento en castellano no está verificado en esta conversión.
- Las cuantizaciones de 2 y 3 bits degradan la calidad de forma notable; para producción se recomienda q4_K_M o superior.
- Riesgo de alucinación inherente a modelos de 3B parámetros, especialmente en tareas de conocimiento factual y matemáticas complejas.
- El contexto de 32.768 tokens debe gestionarse con cuidado: la caché KV crece con la longitud y puede exceder la VRAM disponible en GPUs pequeñas.
- No se documenta soporte de tool calling ni function calling en esta variante; si se necesita, conviene verificar con el modelo original o con plantillas de chat específicas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no garantiza validación por la comunidad.
- El tamaño del repo (25,2 GB) incluye todas las cuantizaciones; descargar solo el archivo GGUF necesario para evitar consumo innecesario de disco.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Top27214/Qwen2.5-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio GGUF oficial: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF
- Blog Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación Qwen: https://qwen.readthedocs.io/en/latest/
- Guía llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Benchmarks de cuantización: https://qwen.readthedocs.io/en/latest/benchmark/quantization_benchmark.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- llama.cpp: https://github.com/ggerganov/llama.cpp
