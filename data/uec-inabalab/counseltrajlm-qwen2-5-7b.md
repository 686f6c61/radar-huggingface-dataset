# UEC-InabaLab/CounselTrajLM-Qwen2.5-7B

## Resumen

CounselTrajLM-Qwen2.5-7B es un modelo de generacion de dialogo psicologico en chino, desarrollado por UEC-InabaLab (Universidad de Electro-Comunicaciones, Japon) y afinado a partir de Qwen/Qwen2.5-7B-Instruct. Su tarea es generar la siguiente respuesta del consejero a partir del historial de conversacion, entrenado sobre CounselTrajD, un corpus sintetico de dialogos de consejo construido mediante planificacion de trayectorias de actos de habla (dialogue-act trajectory planning), segun el articulo arXiv:2611.24168.

El modelo resuelve el problema de la generacion de respuestas de consejo coherentes con un proceso terapeutico estructurado, en lugar de respuestas aisladas: el corpus de entrenamiento se sintetiza planificando la secuencia de actos de dialogo antes de generar los turnos. Con 7.615.616.512 parametros (7,6 B) y arquitectura transformer densa heredada de Qwen2.5, se distribuye como modelo completo fusionado en BF16 (nueve shards safetensors, ~15,2 GB), listo para cargarse con Transformers sin necesidad de aplicar adaptadores.

Es relevante por tres motivos: es un ejemplo de ajuste QLoRA sobre un modelo base abierto con licencia Apache-2.0, publica artefactos de validacion (checksums SHA256, validation.json, training_summary.json) y se centra en un dominio sensible donde la trazabilidad del entrenamiento importa. Su alcance es deliberadamente acotado: investigacion sobre generacion de dialogo de consejo en chino, con datos sinteticos y sin garantia de seguridad clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, con RoPE y GQA (heredado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; entrenamiento con secuencias de 2.048 tokens; contexto nativo del base Qwen2.5-7B-Instruct no confirmado en la informacion proporcionada |
| Tipos de cuantizacion | pesos publicados en BF16; cuantizacion posterior (GPTQ, AWQ, GGUF) no disponible en el repo |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 9 shards, ~15,2 GB), tokenizer y chat template incluidos |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de Qwen2.5-7B-Instruct (revision `a09a35458c702b33eeacc393d103063234e8bc28`) mediante QLoRA, con adaptadores de rango 32, alpha 64 y dropout 0,05, fusionados posteriormente en el modelo base BF16 sin cuantizar para su publicacion. El entrenamiento uso 425.679 ejemplos supervisados y 47.528 de validacion, con un split 90/10 disjunto a nivel de dialogo (ningun dialogo aparece en train y validacion a la vez), learning rate 1e-5, schedule coseno con warmup ratio 0,06, batch efectivo 16, tres epocas y exportacion de la epoca final. La longitud maxima de secuencia durante el entrenamiento fue de 2.048 tokens.

La innovacion tecnica no esta en la arquitectura, sino en los datos: CounselTrajD se sintetiza planificando la trayectoria de actos de dialogo del consejero antes de generar los turnos, de modo que el modelo aprende a producir respuestas condicionadas por un proceso terapeutico estructurado y no solo por el ultimo turno del cliente. El prompt de sistema por defecto instruye al modelo a escribir unicamente la siguiente intervencion del consejero, sin etiquetas de hablante. No se documentan en la informacion disponible fases de RLHF o DPO adicionales sobre este checkpoint.

## Capacidades

- Generacion de la siguiente respuesta del consejero en dialogos de consejo psicologico en chino, condicionada por el historial completo de la conversacion.
- Conversacion multi-turno con roles `system`, `user` (cliente) y `assistant` (consejero), mediante el chat template de Qwen2.5.
- Ajuste al estilo terapeutico: el modelo incorpora la instruccion de sistema de entrenamiento si no se proporciona una.
- Generacion con muestreo configurable (temperatura, top-p, top-k, repetition penalty); los valores recomendados en la model card son temperatura 0,7, top-p 0,8, top-k 20 y repetition penalty 1,05.
- Capacidades generales del base Qwen2.5-7B-Instruct (codigo, matematicas, tool calling) potencialmente preservadas, pero no evaluadas ni garantizadas en esta ficha.
- No se documentan modos de razonamiento explicito (thinking), vision ni audio.

## Casos de uso

- Investigacion academica en generacion de dialogo de consejo: el modelo sirve como linea base reproducible para comparar estrategias de planificacion de actos de dialogo, gracias a la publicacion del corpus, los hiperparametros y los checksums.
- Simulacion de clientes y consejeros para aumentar datos: al generar respuestas de consejero condicionadas por el historial, se puede usar para producir dialogos sinteticos adicionales en pipelines de aumento de datos, siempre con revision humana.
- Evaluacion de modelos de consejo: como generador de referencia en estudios de coherencia, empatia o adherencia a tecnicas terapeuticas, comparando sus salidas con las de otros modelos afinados sobre el mismo corpus.
- Prototipado de asistentes conversacionales de apoyo emocional en chino: el modelo puede integrarse en un backend de Transformers con `device_map="auto"` para experimentar con flujos multi-turno antes de un despliegue supervisado por profesionales.
- Formacion y ensenanza de tecnicas de entrevista: generar respuestas de ejemplo ante un historial de cliente permite construir materiales docentes para estudiantes de psicologia, con curacion posterior por expertos.
- Estudio de sesgos y seguridad en IA aplicada a salud mental: el modelo permite analizar como respuestas generadas a partir de datos sinteticos reproducen o evitan conductas de riesgo, informando el diseno de filtros y politicas de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 15,2 GB, mas memoria adicional para el contexto y las activaciones durante la inferencia (la model card no cuantifica el overhead).
- GPU recomendadas para BF16: A100 40/80 GB, H100 80 GB; en consumer, una RTX 4090 (24 GB) puede alojar los pesos, pero el margen para contexto largo es limitado.
- Cuantizacion a 8 bits o 4 bits (bitsandbytes) reduce el requisito a aproximadamente 8 GB y 4-5 GB respectivamente, permitiendo GPUs consumer de 12-16 GB; no se distribuyen pesos pre-cuantizados en el repo.
- Despliegue: Transformers (version verificada 5.13.0), PyTorch 2.5.1, Accelerate 1.13.0 y safetensors 0.8.0; el tag `text-generation-inference` sugiere compatibilidad con TGI, y el tag `endpoints_compatible` con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| CounselTrajLM-Qwen2.5-7B | 7,6 B | no disponible (entreno a 2.048) | zh | Apache-2.0 | Dialogo de consejo, datos sinteticos con trayectorias de actos |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible en esta ficha | multilingue | Apache-2.0 | Instrucciones generales, sin especializacion clinica |
| Otros modelos de consejo en chino | no disponible | no disponible | zh | no disponible | No se dispone de comparables verificables en la informacion proporcionada |

La comparacion cuantitativa de rendimiento con alternativas de la misma categoria no esta disponible: no se publican benchmarks en la model card y no se identifican en la informacion proporcionada otros modelos de consejo en chino con los que contrastar parametros y resultados.

## Limitaciones y advertencias

- Los datos de entrenamiento son sinteticos; las respuestas pueden ser inexactas, inapropiadas o inseguras, y el modelo no sustituye la atencion profesional en salud mental.
- Riesgo de alucinacion y de respuestas clinicamente inadecuadas ante casos fuera de la distribucion del corpus sintetico.
- Sesgos desconocidos: la model card no documenta analisis de sesgos; al derivar de Qwen2.5-7B-Instruct y de un corpus sintetico en chino, puede heredar sesgos del base y del generador de datos.
- Cobertura linguistica limitada al chino; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto de entrenamiento de 2.048 tokens: historiales mas largos pueden degradar la calidad aunque el base admita ventanas mayores.
- Licencia Apache-2.0 permite uso comercial, pero la model card restringe la finalidad a investigacion y remite a LICENSING.md del repositorio CounselTraj para la licencia y atribucion de los datos fuente; conviene revisarlo antes de un uso productivo.
- No apto para produccion clinica sin supervision profesional, filtros de seguridad y evaluacion especifica del dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UEC-InabaLab/CounselTrajLM-Qwen2.5-7B
- Paper: https://arxiv.org/abs/2611.24168
- Repositorio CounselTraj (datos y licencias): https://github.com/UEC-InabaLab/CounselTraj
- Licencias del corpus: https://github.com/UEC-InabaLab/CounselTraj/blob/master/LICENSING.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
