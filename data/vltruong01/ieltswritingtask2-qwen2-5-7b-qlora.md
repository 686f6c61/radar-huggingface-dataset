# vltruong01/IELTSWritingTask2-Qwen2.5-7B-QLoRA

## Resumen

Este adaptador QLoRA, desarrollado por vltruong01, afina el modelo Qwen2.5-7B-Instruct para generar ensayos completos de la tarea 2 del IELTS Writing a partir de enunciados. El proyecto explora si un ajuste fino de bajo coste puede mejorar la generación estructurada de ensayos académicos manteniendo la viabilidad en una GPU T4 de Google Colab. El repositorio contiene los pesos del adaptador LoRA, no un modelo fusionado completo, e incluye un cuaderno de entrenamiento y evaluación reproducible.

La motivación principal es práctica: generar ensayos de ejemplo de nivel alto (banda 8+) para estudiantes de IELTS y servir como caso de estudio de fine-tuning eficiente en parámetros. El adaptador se entrenó sobre 626 ensayos filtrados con banda global media de 8.3, con una configuración LoRA de rango 32 y cuantización 4-bit NF4. El modelo base Qwen2.5-7B-Instruct aporta la arquitectura transformer causal de 7.000 millones de parámetros con ventana de contexto de 32.768 tokens, aunque el entrenamiento del adaptador se limitó a secuencias de 768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7.000 millones (modelo base) + adaptador LoRA (numero no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 768 tokens (entrenamiento); 32.768 tokens (modelo base) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (entrenamiento), FP16 |
| Idiomas soportados | Ingles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformer causal de 7.000 millones de parametros, y le anade un adaptador LoRA de rango 32 y alpha 64 con dropout 0.05. Los modulos objetivo incluyen todas las proyecciones lineales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento se realizo con QLoRA: cuantizacion 4-bit NF4 con doble cuantizacion y computo en FP16, durante 3 epocas con tamano de lote efectivo de 8, tasa de aprendizaje 1e-4 con scheduler coseno y warmup del 8%, y optimizador paged_adamw_8bit. Solo los tokens de respuesta del asistente contribuyeron a la perdida; los tokens de sistema y usuario se enmascararon con -100.

Los datos de entrenamiento provienen del dataset chillies/ielts-writing-task2-essays, filtrado a 713 ensayos con banda global >= 8.0, subpuntuaciones >= 7.0 y longitud entre 250 y 420 palabras. La division train/validacion/test se realizo por grupos de preguntas para reducir la fuga de informacion, resultando en 626/51/36 ensayos respectivamente. El entrenamiento se completo en aproximadamente 1,5 horas en una GPU NVIDIA Tesla T4 con 15 GB de VRAM.

## Capacidades

- Generacion de ensayos completos de IELTS Writing Task 2 (280-330 palabras) a partir de enunciados.
- Generacion de texto academico estructurado con introduccion, argumentos y conclusion.
- Capacidades de chat del modelo base Qwen2.5-7B-Instruct (conversacion multi-turno).
- Especializacion en ingles academico de nivel alto (banda 8+).
- No incluye soporte de tool calling, vision ni audio (no documentado).

## Casos de uso

- Practica de escritura IELTS: estudiantes pueden introducir enunciados reales de Task 2 y obtener ensayos de ejemplo de nivel alto para estudiar estructura, vocabulario y argumentacion.
- Generacion de material didactico: profesores de ingles pueden crear ensayos modelo para sus clases sin depender de recursos externos.
- Investigacion en fine-tuning eficiente: el repositorio documenta una configuracion QLoRA completa y reproducible, util para estudiar el impacto del ajuste fino en tareas de escritura academica.
- Evaluacion comparativa de calidad: los ensayos generados pueden compararse con ensayos de referencia para analizar patrones de escritura de banda alta.
- Desarrollo de herramientas educativas: el adaptador puede integrarse en aplicaciones de practica IELTS o chatbots educativos.
- Estudio de estructuras argumentativas: permite analizar como el modelo organiza discusiones de doble opinion, ventajas/desventajas y problemas/soluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta la progresion de perdida de validacion durante el entrenamiento:

| Paso | Perdida de entrenamiento | Perdida de validacion |
|---:|---:|---:|
| 20 | 2.6705 | 2.6105 |
| 40 | 2.5850 | 2.5829 |
| 60 | 2.4710 | 2.5726 |
| 80 | 2.6456 | **2.5646** |
| 100 | 2.4191 | 2.5794 |
| 120 | 2.3801 | 2.5853 |
| 180 | 2.1274 | 2.6384 |
| 220 | 2.2319 | 2.6405 |

La evaluacion se realizo sobre grupos de preguntas no vistos, con generacion determinista, comprobacion de recuento de palabras y analisis de repeticion de 4-gramas. El autor recomienda evaluar con la rubrica oficial de IELTS (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy) y advierte que la perdida de validacion no se correlaciona directamente con la banda IELTS.

## Requisitos de hardware

- Entrenamiento: GPU NVIDIA Tesla T4 con ~15 GB de VRAM, aproximadamente 1,5 horas para 3 epocas.
- Inferencia: el adaptador ocupa 0.3 GB; el modelo base en 4-bit requiere aproximadamente 4-6 GB de VRAM, por lo que cabe en GPUs de consumo como RTX 3060, RTX 4070 o superiores.
- Despliegue: compatible con transformers + peft + bitsandbytes. El adaptador puede fusionarse con el modelo base para su uso con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| IELTSWritingTask2-Qwen2.5-7B-QLoRA | 7B + LoRA | 768 (entrenamiento) | Ensayos IELTS Task 2 | No disponible |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 | Chat general | Apache 2.0 |
| Otros adaptadores IELTS | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros modelos fine-tuned especificamente para IELTS Writing Task 2 en los datos proporcionados. La comparacion principal es con el modelo base sin ajuste, que genera texto general pero carece de la especializacion en estructura de ensayo IELTS.

## Limitaciones y advertencias

- No debe tratarse como un sistema oficial de evaluacion o preparacion de IELTS.
- Las etiquetas de banda de los datos de entrenamiento pueden no reflejar la calidad real evaluada por examinadores.
- Los ensayos generados pueden contener errores gramaticales o logicos.
- Algunas salidas pueden usar estructuras repetitivas tipicas de IELTS.
- El rendimiento varia segun el tema del enunciado.
- Una perdida de validacion baja no implica una banda IELTS alta.
- La licencia no esta especificada, lo que limita su uso comercial sin verificacion legal.
- Solo soporta ingles.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vltruong01/IELTSWritingTask2-Qwen2.5-7B-QLoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/chillies/ielts-writing-task2-essays
- Guia de tipos de ensayo IELTS Task 2: https://ieltsbeacon.com/ielts-answers/writing/task-2/
- Preguntas de practica con respuestas de ejemplo: https://goarno.io/blog/ielts-writing-task2-essay-practice-questions-with-answers/
- Recursos de practica IELTS Writing Task 2: https://ieltswriting.ai/ielts-writing-task-2
