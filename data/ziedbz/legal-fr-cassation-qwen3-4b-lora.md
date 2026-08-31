# ZiedBz/legal-fr-cassation-qwen3-4b-lora

## Resumen

El modelo `ZiedBz/legal-fr-cassation-qwen3-4b-lora` es un adaptador LoRA que especializa el modelo base `Qwen/Qwen3-4B-Instruct-2507` en la síntesis estructurada de sentencias de la Corte de casación francesa. Desarrollado por ZiedBz, el adaptador toma un texto bruto de una sentencia y produce una ficha JSON con campos como la formación que dictó la sentencia, la solución (casación, rechazo, etc.), los artículos de ley citados y un resumen. El objetivo es facilitar el análisis de jurisprudencia en despachos de abogados y departamentos jurídicos franceses, que manejan grandes volúmenes de decisiones judiciales y necesitan soluciones que respeten la confidencialidad (RGPD, secreto profesional) y sean económicamente escalables.

El adaptador se basa en Qwen3-4B-Instruct, un modelo de 4 mil millones de parámetros con arquitectura transformer densa, entrenado con soporte para razonamiento explícito (modo thinking) y generación de texto. El adaptador se entrenó con QLoRA (cuantización de 4 bits NF4) sobre un conjunto de 3.000 ejemplos derivados del dataset `artefactory/Argimi-Legal-French-Jurisprudence`, que contiene resúmenes oficiales de la Corte de casación. El resultado es un modelo ligero (0,1 GB) que puede ejecutarse en una sola GPU, ideal para despliegue on-premise. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | 4.000 millones (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (máximo usado en entrenamiento; el modelo base soporta más, pero el adaptador se optimizó para esta longitud) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (entrenamiento); el adaptador se puede cargar sobre el modelo base en precisión completa o cuantizado |
| Idiomas soportados | Francés (principal), aunque el modelo base Qwen3 soporta múltiples idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Instruct-2507, un transformer denso de 4 mil millones de parámetros con atención causal estándar, entrenado por Alibaba Cloud. Incluye soporte para modo "thinking" (razonamiento explícito) y generación de texto, con una ventana de contexto amplia (el modelo base soporta hasta 32.768 tokens, aunque el adaptador se entrenó con 4.096). El adaptador LoRA se añade a las proyecciones de atención (q, k, v, o) y a las capas de feed-forward (gate, up, down) con rango 16 y alpha 32.

El entrenamiento se realizó con QLoRA, cuantizando el modelo base a 4 bits NF4 para reducir el uso de memoria. Se usaron 3.000 ejemplos de entrenamiento (una época) con un learning rate de 2e-4 y scheduler coseno. La pérdida final fue de 0,926. El dataset de entrenamiento se derivó de `artefactory/Argimi-Legal-French-Jurisprudence` (configuración `juri`), que contiene resúmenes oficiales de la Corte de casación francesa, utilizados como verdad terreno. El entrenamiento duró 1 hora y 8 minutos en una NVIDIA L40S de 48 GB, con un coste estimado de 2,10 USD.

## Capacidades

- Generación de texto estructurado: produce fichas JSON con campos fijos (`formation`, `solution`, `articles_vises`, `resume`) a partir de sentencias judiciales en francés.
- Resumen de jurisprudencia: genera resúmenes concisos de sentencias, con una mejora significativa en ROUGE-L respecto al modelo base (55,0 % frente a 22,5 %).
- Identificación de la formación judicial: reconoce correctamente la cámara que dictó la sentencia (por ejemplo, "Chambre commerciale") con una precisión del 100 % en la evaluación.
- Clasificación de la solución: distingue entre casación, rechazo, casación parcial, etc., con una precisión del 96,8 %.
- Extracción de artículos de ley citados: identifica los textos legales referenciados en la sentencia, aunque con una precisión limitada (Jaccard de 32,4 %).
- Conversación y razonamiento: al estar basado en Qwen3-Instruct, conserva capacidades de diálogo y razonamiento general, aunque el adaptador está especializado en la tarea de síntesis jurídica.

## Casos de uso

- Análisis de jurisprudencia en despachos de abogados: un abogado puede introducir una sentencia bruta y obtener una ficha estructurada con la formación, la solución y los artículos citados, acelerando la revisión de casos similares. El modelo se ejecuta on-premise, garantizando la confidencialidad de los expedientes.
- Preparación de memorias y escritos jurídicos: los asistentes legales pueden usar el modelo para resumir sentencias relevantes y extraer los artículos clave, reduciendo el tiempo de investigación manual.
- Automatización de bases de datos de jurisprudencia: empresas que mantienen repositorios de sentencias pueden usar el modelo para generar metadatos estructurados (formación, solución, artículos) de forma masiva, alimentando sistemas de búsqueda semántica.
- Cumplimiento normativo y auditoría interna: departamentos jurídicos de empresas pueden analizar sentencias relacionadas con su sector para evaluar riesgos legales, usando el resumen generado para identificar patrones.
- Formación de estudiantes de derecho: el modelo puede servir como herramienta didáctica para que los estudiantes practiquen la identificación de la estructura de una sentencia, comparando sus propias fichas con las generadas por el modelo.
- Integración en asistentes conversacionales jurídicos: el adaptador puede combinarse con el modo de razonamiento de Qwen3 para responder preguntas sobre jurisprudencia, proporcionando respuestas con citas de artículos y resúmenes de sentencias.

## Benchmarks y rendimiento

La model card del autor incluye una evaluación sobre sentencias no vistas durante el entrenamiento (150 para el modelo base, 100 para el modelo fine-tuneado). Los resultados son los siguientes:

| Métrica | Modelo base | Fine-tuneado | Δ |
|---|---|---|---|
| Formación exacta | 0,0 % | 100 % | +100 pts |
| Resumen (ROUGE-L) | 22,5 % | 55,0 % | +32,5 pts |
| Artículos citados (Jaccard) | 6,7 % | 32,4 % | +25,7 pts |
| Solución exacta | 93,3 % | 96,8 % | +3,5 pts |
| JSON válido | 100 % | 95,0 % | −5,0 pts |

El autor destaca que el fine-tuning no enseñó derecho al modelo, sino el formato de salida. El modelo base ya comprendía el razonamiento jurídico (93,3 % de precisión en la solución), pero ignoraba las convenciones de nomenclatura de la Corte (formación al 0 %) y el formato canónico de los artículos (6,7 %). El adaptador corrige estas deficiencias, aunque introduce una regresión del 5 % en la validez JSON debido a la truncación por límite de tokens de generación.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es muy ligero (0,1 GB). El modelo base Qwen3-4B-Instruct en precisión FP16 requiere aproximadamente 8-9 GB de VRAM. Con cuantización 4-bit (como se usó en el entrenamiento), puede caber en 4-5 GB.
- GPU recomendadas: una NVIDIA RTX 3060 de 12 GB o superior es suficiente para inferencia en FP16. Para entrenamiento se usó una L40S de 48 GB, pero no es necesaria para inferencia.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., especialmente con cuantización.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` (como se muestra en la model card), o exportar a GGUF para usar con llama.cpp u Ollama. También es compatible con vLLM y TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no se han publicado datos específicos. En una GPU moderna, se espera una generación de 20-40 tokens por segundo para un modelo de 4B en FP16, y mayor con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| `ZiedBz/legal-fr-cassation-qwen3-4b-lora` | 4B (base) + LoRA | 4.096 (entrenamiento) | Apache 2.0 | Síntesis de sentencias de la Corte de casación francesa |
| `AI-Lab-TDTU/qwen3-4b-legal-pretrain` | 4B | No disponible | No disponible | Fine-tuning legal genérico sobre Qwen3-4B |
| `Qwen/Qwen3-4B-Instruct-2507` (base) | 4B | 32.768 | Apache 2.0 | Modelo instructivo general, sin especialización legal |

El adaptador de ZiedBz se distingue por su enfoque específico en la estructura de salida JSON y la terminología de la Corte de casación francesa. El modelo base Qwen3-4B-Instruct ya tiene buenas capacidades de razonamiento, pero no conoce las convenciones de la jurisprudencia francesa. El otro adaptador legal (`AI-Lab-TDTU/qwen3-4b-legal-pretrain`) es un fine-tuning más genérico, sin la salida estructurada específica. No se dispone de comparativas de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Sesgo del corpus: el dataset de entrenamiento está dominado por la Chambre commerciale (~65 % de los ejemplos), por lo que el rendimiento en otras cámaras (civil, penal, social) es probablemente inferior.
- Errores en artículos citados: el modelo puede citar artículos incorrectos (por ejemplo, "artículo 691 del CGI" en lugar de "artículo 1594-0 G, A"). Un error en el número de artículo es más grave que un resumen aproximado, por lo que toda salida debe ser verificada por un jurista.
- Regresión en validez JSON: el 5 % de las salidas no son JSON válido debido a la truncación por el límite de 700 tokens de generación usado en la evaluación. Se recomienda aumentar `max_new_tokens` a 900 y usar `repetition_penalty=1.1` para mitigar este problema.
- Degeneración por repetición: una de las salidas no válidas mostró repetición en bucle hasta agotar el presupuesto de tokens, un comportamiento típico en modelos pequeños cuando se generan secuencias largas.
- Métrica imperfecta: ROUGE-L mide solapamiento léxico y no valora reformulaciones correctas. La evaluación no constituye una validación jurídica formal.
- Datos antiguos: el corpus fuente contiene sentencias antiguas con referencias en francos franceses, lo que puede afectar a la precisión en casos modernos.
- Idioma: el modelo está especializado en francés jurídico; su rendimiento en otros idiomas no está garantizado, aunque el modelo base Qwen3 soporta multilingüismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZiedBz/legal-fr-cassation-qwen3-4b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/artefactory/Argimi-Legal-French-Jurisprudence
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Guía de Qwen3 (contexto general): https://insiderllm.com/guides/qwen3-complete-guide/
- Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
