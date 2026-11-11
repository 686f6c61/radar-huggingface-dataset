# yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep2

## Resumen

yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep2 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario yungisimon, orientado a su uso como "modelo de memoria" (memory model) en tareas de razonamiento multi-salto sobre documentos. El modelo parte de la base instructiva de Qwen2.5 de 1.500 millones de parámetros y se ha entrenado sobre pares sintéticos de pregunta-respuesta derivados del conjunto de datos MuSiQue, agrupados mediante el algoritmo de clustering HDBSCAN con un tamaño mínimo de clúster de 2.

El interés de esta ficha radica en que se trata de un checkpoint intermedio (época 2 de 3) de un experimento de investigación sobre memoria y recuperación de información multi-documento, no de un modelo de propósito general listo para producción. El entrenamiento se realizó con FSDP sobre 8 GPU AMD Instinct MI325X, con un total de 8,8 GPU-horas para las tres épocas, lo que lo convierte en un caso de estudio de bajo coste computacional.

La relevancia actual es limitada pero específica: sirve como referencia para quienes investigan el uso de modelos pequeños como módulos de memoria en pipelines RAG o de agentes, y para evaluar el efecto del clustering HDBSCAN en la construcción de datos sintéticos de razonamiento multi-salto. No obstante, al ser un checkpoint intermedio y sin benchmarks publicados, su adopción directa en producción no está justificada con los datos disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.096 tokens (longitud máxima de secuencia en entrenamiento; contexto nativo de Qwen2.5-1.5B-Instruct: 32.768 tokens, no confirmado para este checkpoint) |
| Tipos de cuantización | no disponible (pesos publicados en bf16; compatible con cuantización estándar de transformers/GGUF no verificada) |
| Idiomas soportados | no disponible (heredados de Qwen2.5-1.5B-Instruct, no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, con 1.543.714.304 parámetros, inicializado desde Qwen/Qwen2.5-1.5B-Instruct. Se ha sometido a un ajuste fino completo (100 % de parámetros entrenables) mediante FSDP, con batch efectivo de 256 (32 por dispositivo, 1 acumulación, 8 GPU), learning rate constante de 2e-05 con warmup del 5 %, weight decay de 0,01, max grad norm de 1,0 y precisión bf16 con gradient checkpointing. La pérdida se calcula únicamente sobre los tokens del asistente. El entrenamiento se ejecutó durante 3 épocas sobre 8 AMD Instinct MI325X, con un tiempo total de 1,10 horas (8,8 GPU-horas); este checkpoint corresponde a la época 2.

Los datos de entrenamiento consisten en 1.085.701 ejemplos sintéticos de pregunta-respuesta generados a partir de MuSiQue (multi-hop QA) y agrupados con HDBSCAN (min cluster size = 2) bajo el fichero `msq_subset1000_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`. La innovación metodológica reside en el uso de clustering para organizar pares cross-document y combinaciones de entidades, lo que busca forzar al modelo a memorizar y recuperar información distribuida entre documentos. No se documentan técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct y ajustada con la plantilla de chat de Qwen.
- Razonamiento multi-salto sobre documentos: el ajuste está específicamente orientado a recuperar y combinar información cross-document.
- Memoria de contexto: entrenado con secuencias de hasta 8.096 tokens, adecuado para tareas de agregación de información en ventanas largas.
- Comprensión de preguntas sintéticas de tipo MuSiQue (preguntas encadenadas que requieren varias entidades y documentos).
- Soporte de tool calling / function calling: no documentado en la model card; probable herencia parcial del modelo base, sin verificación.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el objetivo del ajuste es la memoria, no la planificación de agentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en modelos de memoria: usar el checkpoint como módulo de memoria en experimentos académicos sobre recuperación multi-documento, comparando su comportamiento con el modelo base sin ajustar para medir el efecto del entrenamiento con HDBSCAN.
- Evaluación de datos sintéticos de razonamiento multi-salto: reproducir el pipeline de generación de pares QA a partir de MuSiQue y validar si el clustering HDBSCAN mejora la calidad de las respuestas encadenadas.
- Prototipado de pipelines RAG de bajo coste: desplegar el modelo en una GPU de consumo para experimentar con la combinación de recuperación de documentos y generación de respuestas que requieren agregar entidades de varias fuentes.
- Análisis de la degradación por checkpoint intermedio: comparar la época 2 con la época 3 (si se publica) para estudiar la curva de aprendizaje en tareas de memoria y detectar sobreajuste temprano.
- Generación de resúmenes cross-document: aprovechar la ventana de 8.096 tokens para consolidar información de varios fragmentos en una respuesta única, en entornos de investigación con datos controlados.
- Base para ajustes posteriores: servir como punto de partida (con licencia Apache 2.0) para fine-tunings específicos de dominio que requieran memoria de contexto medio, dado su reducido tamaño y coste de inferencia.
- Docencia y experimentación con FSDP: replicar el entrenamiento (8,8 GPU-horas en 8 MI325X) como caso práctico de ajuste completo distribuido con gradient checkpointing y pérdida enmascarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos (1.543.714.304 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB (no verificada la compatibilidad de cuantización para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100, L40S o RTX 4090 para mayor throughput. Cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y potencialmente vLLM o llama.cpp si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput estimados: no disponibles; para un modelo de 1,5 B en bf16 sobre una RTX 4090 se puede esperar un throughput del orden de miles de tokens por segundo en batch, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep2 | 1,54 B | 8.096 (entrenamiento) | Apache 2.0 | Hugging Face | Checkpoint época 2/3, sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | Hugging Face | Modelo base, benchmarks públicos de Qwen |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa de mayor tamaño y contexto |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 Community License | Hugging Face | Contexto mucho mayor, licencia con restricciones |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la época 2 de 3; no es el modelo final del entrenamiento y puede presentar un rendimiento inferior al de la época 3.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de tareas de memoria que permitan validar su calidad frente al modelo base.
- Riesgo de sobreajuste al dataset sintético: entrenado exclusivamente sobre 1.085.701 ejemplos generados a partir de MuSiQue con clustering HDBSCAN; el dominio y el estilo de las preguntas están muy acotados.
- Riesgo de alucinación: al ser un modelo pequeño (1,5 B) y especializado en memoria, puede inventar entidades o relaciones al combinar documentos, especialmente fuera de la distribución de MuSiQue.
- Idiomas no declarados: no se especifica qué idiomas conserva tras el ajuste; el modelo base es multilingüe, pero el ajuste puede haber degradado idiomas distintos del inglés.
- Contexto efectivo limitado a 8.096 tokens en entrenamiento, inferior a los 32.768 del modelo base; secuencias más largas pueden degradar la calidad.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- Sin métricas de latencia ni throughput publicadas: no se puede garantizar un rendimiento concreto en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-hdbscan-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del dominio de entrenamiento): no disponible en la información proporcionada
- Paper de MuSiQue: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
