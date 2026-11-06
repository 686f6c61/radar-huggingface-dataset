# stratosphere/qwen2.5-1.5b-slips-immune-summarization

## Resumen

El modelo `stratosphere/qwen2.5-1.5b-slips-immune-summarization` es un ajuste fino (fine-tune) de Qwen2.5-1.5B-Instruct desarrollado por el grupo Stratosphere (Stratosphere Laboratory) para una tarea vertical muy concreta: transformar los logs de alertas del IDS Slips (StratosphereLinuxIPS) en resúmenes de incidentes legibles para humanos, con etiquetado de severidad por evento (CRITICAL, HIGH, MEDIUM, LOW, INFO) y un desglose agregado de severidad.

Slips genera registros en forma de DAG: cadenas de eventos de seguridad relacionados por IP origen y ventana temporal. Ese material es técnicamente denso y difícil de interpretar con rapidez, lo que ralentiza el triaje en un SOC. El modelo resuelve exactamente ese problema: recibe el DAG en bruto (con metadatos del incidente: ID, IP origen, ventana, threat level acumulado, rango temporal y número de eventos) y devuelve un resumen estructurado, agrupando eventos idénticos y asignando severidad.

Arquitectura transformer decoder-only de 1.543.714.304 parámetros (1,5B), con contexto de inferencia configurado a 8.192 tokens en los despliegues documentados (Ollama y llama.cpp). El entrenamiento se hizo con SFT (Supervised Fine-Tuning) sobre LoRA, usando `unsloth` y `trl`, con selección best-of-N de respuestas. Está publicado bajo licencia Apache 2.0, solo en inglés y con un enfoque de despliegue en entornos con recursos limitados, incluidos dispositivos CPU-only como una Raspberry Pi 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en la configuracion de despliegue documentada (Ollama `num_ctx`, llama.cpp `-c 8192`); la longitud nativa de Qwen2.5-1.5B no se especifica en la informacion disponible |
| Tipos de cuantizacion | GGUF (tags `q5_k_m` y `q8_0` en Ollama; `latest` = Q8_0); pesos safetensors en fp16 para Transformers |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF (Ollama / llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de 1,5B parámetros con RoPE y atención causal estándar. El ajuste se realizó mediante SFT con LoRA usando las librerías `unsloth` y `trl`, sobre el dataset `stratosphere/immune-summary-sft-dataset`. No se documenta en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá de que contiene incidentes de Slips con sus resúmenes objetivo.

La innovación metodológica destacable es la construcción del conjunto de entrenamiento mediante best-of-N con LLM-as-judge: para cada incidente de entrenamiento se generaron respuestas candidatas con GPT-4o, GPT-4o-mini, Qwen2.5 3B y Qwen2.5 1.5B, y se seleccionó como ground truth la respuesta mejor puntuada por el juez. Esto permite destilar en un modelo de 1,5B la calidad de resúmenes producidos por modelos mucho mayores en esta tarea específica. El prompt de inferencia es un formato "merged": instrucciones y DAG se combinan en un único mensaje de usuario, con los metadatos del incidente repetidos en el bloque de metadatos y en la cabecera del formato de salida, y la plantilla de chat añade el system prompt por defecto de Qwen.

## Capacidades

- Generación de resúmenes de incidentes de seguridad a partir de logs DAG de Slips, en lenguaje claro y agrupando eventos idénticos o muy similares en una sola línea.
- Asignación de severidad por evento y por grupo, con cinco niveles: CRITICAL, HIGH, MEDIUM, LOW e INFO.
- Cálculo de un desglose agregado de severidad ("Severity breakdown") a partir de las evaluaciones individuales.
- Interpretación de metadatos del incidente: ID, IP origen, ventana temporal, threat level acumulado, rango de fechas y número total de eventos.
- Uso de rangos horarios (HH:MM-HH:MM) para eventos agrupados.
- Salida estructurada y reproducible con el formato exacto definido en el prompt (cabecera, lista de eventos con severidad, total de evidencias y desglose).
- Conversacional: el modelo se distribuye con plantilla de chat y está etiquetado como `conversational`.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso genérico, visión, audio ni modo "thinking". El modelo está especializado en una única tarea de resumen y clasificación de severidad.

## Casos de uso

- Triaje automatizado en un SOC: el modelo recibe el DAG de Slips de cada IP origen y ventana temporal y devuelve un resumen con severidades, de modo que el analista prioriza primero los incidentes con eventos CRITICAL o HIGH en lugar de leer logs en bruto. Es adecuado porque el formato de salida está fijado y es estable, lo que facilita el parseo posterior.
- Enriquecimiento de alertas en pipelines SIEM/SOAR: el resumen estructurado se puede insertar como campo de texto en la alerta o ticket, o usarse para disparar automatizaciones según el desglose de severidad (por ejemplo, escalar si aparece al menos un CRITICAL).
- Despliegue en sensores perimetrales con recursos limitados: al ser un modelo de 1,5B con cuantizaciones GGUF y con una variante menor (0,8B) que rinde de forma similar, puede ejecutarse en CPU en dispositivos como una Raspberry Pi 5 junto al propio IDS, sin GPU dedicada.
- Informes periódicos de seguridad: generar resúmenes legibles de las ventanas de mayor threat level para informes diarios o semanales dirigidos a equipos no técnicos, agrupando eventos repetidos en una sola línea.
- Reducción de fatiga de alertas: la agrupación de eventos idénticos (por ejemplo, 24 conexiones iguales en una sola línea) y la reclasificación con criterio de impacto reducen el volumen de elementos que el analista debe revisar manualmente.
- Formación y validación de analistas: usar las salidas del modelo como borrador de referencia para comparar con la evaluación humana, o como material de calibración de criterios de severidad en el equipo.
- Preprocesado para modelos mayores: emplear el resumen compacto como entrada destilada para un LLM de mayor tamaño que redacte el informe final, reduciendo coste de tokens en el modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente indica que la variante `stratosphere/qwen3.5-0.8b-slips-immune-summarization`, entrenada con los mismos datos, obtiene una puntuación equivalente a este modelo con aproximadamente la mitad de tamaño y se ejecuta más rápido en dispositivos CPU-only. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de métricas específicas de la tarea (por ejemplo, ROUGE o exactitud de severidad).

Sobre velocidad, la model card afirma que, en dispositivos CPU-only, llama.cpp (`llama-server -c 8192 --temp 0 -fa off`) ejecuta las mismas cuantizaciones GGUF entre 1,5 y 2,5 veces más rápido que Ollama, con referencia a una sección "Speed on a Raspberry Pi 5" cuyo contenido numérico no está incluido en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1,5437B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 4 GB con contexto de 8.192 tokens.
- Cuantización Q8_0 (GGUF): aproximadamente 1,6 GB de pesos; Q5_K_M: aproximadamente 1,1 GB. Con contexto de 8.192 tokens, el consumo total se mantiene bajo, en el rango de 2 a 3 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090); en gama profesional, A100 o H100 no son necesarias y solo tendrían sentido por agregación de peticiones. Cabe en GPU consumer sin problema.
- Despliegue en CPU: viable; la model card cita explícitamente Raspberry Pi 5 como dispositivo objetivo para la variante de 0,8B y para este modelo con llama.cpp.
- Opciones de despliegue: Ollama (recomendado por el autor, con tags `q5_k_m` y `q8_0`, `num_ctx` 8.192 y `num_predict` 1.024 por defecto), llama.cpp (`llama-server`), Transformers con `AutoModelForCausalLM` en fp16 y `device_map="auto"`, y text-generation-inference (el modelo está etiquetado con `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput: no se proporcionan cifras absolutas en la información disponible; solo la comparación relativa de que llama.cpp es 1,5–2,5× más rápido que Ollama en CPU-only.
- Nota de despliegue: los tags de Ollama descargados antes de noviembre de 2026 no incluyen el system prompt por defecto de Qwen, ni `num_ctx` 8.192, ni `num_predict` 1.024; es necesario volver a descargarlos para replicar la configuración de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stratosphere/qwen2.5-1.5b-slips-immune-summarization | 1,5B | 8.192 (config. de despliegue) | Resumen de alertas Slips con severidad | Apache 2.0 | Hugging Face, Ollama |
| stratosphere/qwen3.5-0.8b-slips-immune-summarization | ~0,8B | no disponible | Misma tarea, mismos datos de entrenamiento | no disponible en la informacion | Hugging Face |
| unsloth/Qwen2.5-1.5B-Instruct (modelo base) | 1,5B | no disponible en la informacion | Instrucciones generales, sin especializacion en seguridad | Apache 2.0 | Hugging Face |
| Qwen2.5 3B (usado como generador candidato en best-of-N) | 3B | no disponible en la informacion | Instrucciones generales | no disponible en la informacion | Hugging Face |

La comparación relevante es con el modelo base: este fine-tune no mejora capacidades generales, sino que fija un formato de salida y un criterio de severidad para la tarea de resumen de Slips. Frente a la variante de 0,8B, la model card indica rendimiento equivalente con el doble de tamaño, lo que convierte a la versión pequeña en preferible para despliegues en CPU. No se dispone de datos de benchmarks que permitan comparar numéricamente con alternativas genéricas.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para el formato de DAG de Slips; fuera de ese esquema de entrada es probable que produzca salidas degradadas o que ignore el formato esperado.
- Solo inglés: no hay soporte multilingüe declarado, por lo que los resúmenes en castellano no están cubiertos y requerirían un fine-tune adicional o traducción posterior.
- Riesgo de alucinación en las severidades: la asignación CRITICAL/HIGH/MEDIUM/LOW/INFO es una evaluación generada por el modelo, no una verificación factual; puede clasificar incorrectamente eventos y no debe usarse como única base para acciones automatizadas destructivas o de bloqueo.
- Dependencia del prompt: el rendimiento depende de replicar el formato "merged" exacto del prompt de entrenamiento, incluido el system prompt por defecto de Qwen y los metadatos duplicados en cabecera y bloque de metadatos; desviarse de ese formato puede romper la estructura de salida.
- Configuración de despliegue sensible: los tags antiguos de Ollama carecen de `num_ctx` 8.192 y `num_predict` 1.024, lo que altera el comportamiento respecto a la evaluación; hay que actualizar el tag.
- Sin datos de benchmarks publicados: no hay métricas objetivas de calidad de resumen ni de exactitud de severidad, lo que dificulta estimar la tasa de error en producción sin una evaluación propia.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar los avisos de licencia y verificar las condiciones del modelo base Qwen2.5-1.5B-Instruct, también Apache 2.0 según la información disponible.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al ser un modelo entrenado sobre logs sintéticos o de laboratorio de Slips, su distribución puede no reflejar tráfico real de producción.
- Tamaño reducido: con 1,5B parámetros, la capacidad de razonamiento general es limitada; no debe emplearse para tareas fuera de su dominio previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stratosphere/qwen2.5-1.5b-slips-immune-summarization
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Qwen2.5-1.5B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Variante de 0,8B: https://huggingface.co/stratosphere/qwen3.5-0.8b-slips-immune-summarization
- Dataset de entrenamiento: https://huggingface.co/datasets/stratosphere/immune-summary-sft-dataset
- Repositorio de Slips IDS: https://github.com/stratosphereips/StratosphereLinuxIPS
