# SZLHOLDINGS/SZL-Ouroboros-Auditor-1.7B

## Resumen

SZL-Ouroboros-Auditor-1.7B es un adaptador QLoRA publicado por SZL Holdings dentro de su campana interna W28T9 de "resurreccion" de modelos. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango sobre Qwen/Qwen3-1.7B, el modelo denso de 1.700 millones de parametros de la familia Qwen3. El adaptador se ha entrenado con rsLoRA (r=8, alpha=16) aplicado a las proyecciones q/k/v/o y a las capas gate/up/down del bloque MLP.

La propuesta del autor es un adaptador "receipts-first": toda afirmacion de rendimiento va acompanada de un recibo de entrenamiento verificable (training_receipt.json) y de un conjunto de evaluacion acotado. El unico resultado publicado es una bateria de seis sondas de honestidad (tres preguntas respondibles y tres no respondibles) sobre la que el modelo acierta 3 de 6, con una perdida medida de 1,538.

Es relevante ahora por dos motivos: ilustra el patron de publicacion de adaptadores PEFT de bajo coste sobre modelos pequenos (entrenamiento en una sola RTX A6000, 120 pasos, max_seq 1536) y ejemplifica una practica de documentacion orientada a la trazabilidad. Conviene subrayar que el propio autor declara el estado como MEASURED y no desplegado: la finalizacion del entrenamiento no equivale a aprobacion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (rsLoRA) sobre transformer denso Qwen/Qwen3-1.7B |
| Parametros totales | 1.700 millones (modelo base); el adaptador anade un subconjunto de bajo rango (r=8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_seq 1536) |
| Tipos de cuantizacion | Carga del base en 4 bits (QLoRA); pesos del adaptador en safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer denso de tipo decoder-only. El ajuste emplea QLoRA: el modelo base se carga cuantizado a 4 bits y solo se entrenan las matrices de bajo rango inyectadas en las proyecciones de atencion (q, k, v, o) y en las tres proyecciones del MLP (gate, up, down). Se usa la variante rsLoRA con rango 8, alpha 16 y semilla 20260721.

El curriculum de entrenamiento es el dataset SZLHOLDINGS/verticals-sft-v1 (train.jsonl, con hash sha256 78212631b3c072b3...). El schedule es corto: 120 pasos, learning rate 1e-4, batch efectivo 2x4 y longitud maxima de secuencia 1536. El entrenamiento se ejecuto en un nodo con GPU RTX A6000 (Massed Compute, identificador de nodo 0a63cb475677). No se documenta en la informacion disponible el numero total de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo base Qwen3-1.7B y ajustadas con el dataset verticals-sft-v1.
- Comportamiento de "auditoria" orientado a honestidad: el adaptador se evalua especificamente sobre su capacidad de responder correctamente a preguntas respondibles y de abstenerse ante preguntas no respondibles (bateria de 6 sondas).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el entrenamiento es un SFT corto sin evidencia de datos de agentes.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no documentadas. El modelo base Qwen3 dispone de modo de razonamiento, pero no se indica si el adaptador lo conserva.

## Casos de uso

- Evaluacion de honestidad y calibracion: el adaptador sirve como banco de pruebas para medir si un modelo pequeno responde con precision a preguntas respondibles y se abstiene ante las no respondibles, usando la bateria de 6 sondas como referencia reproducible.
- Prototipado rapido de asistentes conversacionales en local: al ser un adaptador de 1.7B cargable en 4 bits, permite iterar sobre respuestas conversacionales en hardware de gama media antes de escalar a un modelo mayor.
- Investigacion sobre PEFT y QLoRA: su configuracion concreta (r=8, alpha=16, rsLoRA, 120 pasos) lo convierte en un caso de estudio para analizar el efecto de adaptadores de bajo rango sobre modelos pequenos.
- Reproduccion de pipelines de entrenamiento con trazabilidad: el repositorio incluye recibos de entrenamiento y evaluacion, util como plantilla para equipos que necesitan auditar cada paso de un ajuste fino.
- Filtrado y clasificacion de respuestas en pipelines de datos: un modelo de este tamano puede usarse como clasificador ligero de calidad o de abstenibilidad en la fase de curacion de datasets.
- Despliegue en entornos con recursos limitados: con cuantizacion 4 bits del base, cabe en GPU de consumo y permite servir respuestas cortas en escenarios de baja latencia sin infraestructura dedicada.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la bateria de evaluacion del autor. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Conjunto de evaluacion | Resultado | Perdida (medida) | Filas | Tiempo de ejecucion |
|---|---|---|---|---|
| Bateria estate: 3 respondibles + 3 no respondibles | 3/6 | 1,5379545450210572 | 161 | 131,6 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=FAIL. El modelo responde correctamente a las tres preguntas respondibles pero falla en las tres no respondibles, lo que indica una tendencia a responder en lugar de abstenerse. El autor declara explicitamente que no reclama ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 1-1,5 GB de pesos; con overhead de activaciones y contexto, se estima un uso de 2-4 GB en funcion de la longitud de secuencia (estimacion propia, no publicada por el autor).
- GPU recomendadas: el entrenamiento se realizo en una RTX A6000 (48 GB). Para inferencia, una RTX 3060 de 12 GB o superior es suficiente; tambien cabe en GPUs de 8 GB con cuantizacion agresiva.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 Ti, RTX 4070 o superiores.
- Opciones de despliegue: PEFT con transformers (AutoPeftModelForCausalLM), y previsiblemente vLLM, llama.cpp u Ollama tras fusionar el adaptador con el base y convertir a GGUF (no verificado en la informacion disponible).
- Latencia y throughput: no disponibles. El unico dato temporal es el de la bateria de evaluacion (131,6 s para 161 filas en una A6000), que no equivale a throughput de inferencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Ouroboros-Auditor-1.7B | 1.7B (adaptador sobre Qwen3-1.7B) | no disponible | 3/6 en bateria propia | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible en la informacion | no disponible | apache-2.0 | Hugging Face |
| Otros adaptadores PEFT sobre Qwen3-1.7B | 1.7B | no disponible | no disponible | variable | Hugging Face |

La comparativa con alternativas de la misma categoria es limitada: no se dispone de resultados de benchmarks publicos del adaptador ni de sus competidores directos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado declarado por el autor: MEASURED, no desplegado. La finalizacion del entrenamiento no constituye aprobacion para produccion.
- Resultado de honestidad bajo: falla las tres sondas de preguntas no respondibles, lo que sugiere una tendencia a responder en lugar de abstenerse; riesgo de alucinacion en escenarios que exigen reconocer la falta de informacion.
- Entrenamiento muy corto (120 pasos) y dataset pequeno (161 filas en la evaluacion, tamano del dataset de entrenamiento no disponible), lo que limita la generalizacion.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, puede reproducir sesgos de Qwen3-1.7B.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados ni longitud de contexto; el entrenamiento uso max_seq 1536, lo que puede condicionar el comportamiento en secuencias mas largas.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B.
- Sin descargas ni likes en el momento de la consulta, y sin evidencia de validacion por terceros; tratar los resultados como preliminares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Ouroboros-Auditor-1.7B
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/verticals-sft-v1
- Registros de campana (wave-logs): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del autor en GitHub: https://github.com/szl-holdings
