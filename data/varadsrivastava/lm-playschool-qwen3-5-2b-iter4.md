# varadsrivastava/lm-playschool-qwen3.5-2b-iter4

## Resumen

`lm-playschool-qwen3.5-2b-iter4` es un modelo de lenguaje de 1.880 millones de parámetros desarrollado por Varad Srivastava dentro del equipo DAIR para el reto LM Playschool Challenge 2026. Se trata del cuarto checkpoint de una familia de cinco regímenes de post-entrenamiento orientados a la competencia en juegos de diálogo, un entorno de evaluación que mide la capacidad del modelo para mantener conversaciones estratégicas con reglas definidas. El modelo parte de Qwen3.5-2B como base y aplica un segundo ciclo de DPO (Direct Preference Optimization) sobre el checkpoint R2, usando 201 pares de preferencia de primer movimiento generados a partir de dos pasadas de rollout (greedy y muestreo con temperatura 0.7).

El modelo está diseñado específicamente para el entorno de evaluación "playpen" de Clembench, donde obtiene una puntuación clemscore de 67.64, la mejor nominal de la familia, aunque el margen sobre R2 (67.39) está dentro de la variabilidad entre ejecuciones. Su relevancia radica en que demuestra cómo el DPO con pares on-policy, extraídos de la propia frontera de competencia del modelo, puede mejorar el rendimiento en tareas de diálogo interactivo con un coste de datos mínimo. La licencia Apache 2.0 permite uso comercial sin restricciones, y el formato safetensors facilita su integración en pipelines de Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-2B, un transformer denso de 2.000 millones de parametros disenado por Alibaba Cloud. El modelo hereda la estructura de atencion completa y el tokenizador multilingue de Qwen, aunque el ajuste fino se ha realizado exclusivamente con datos en ingles. El entrenamiento de este checkpoint sigue el regimen R4 de la familia: un segundo ciclo de DPO sobre el modelo R2 (que a su vez habia sido ajustado con DPO tras un SFT inicial). Los datos consisten en 201 pares de preferencia de primer movimiento, divididos en 107 pares on-policy (donde el propio modelo tuvo exito en una pasada y fracaso en otra sobre la misma instancia) y 94 pares hibridos (instancias donde ambas pasadas fallaron, usando como "chosen" la respuesta exitosa de un modelo mas fuerte, una tecnica de recasting).

Los hiperparametros son identicos a los del regimen R2, aunque el README no los detalla. El entrenamiento se realizo con la libreria TRL (Transformers Reinforcement Learning) de Hugging Face, y el modelo se evaluo en un entorno congelado de Python 3.11 con clemcore y clembench fijados en versiones especificas, aplicando dos correcciones upstream: un guard contra division por cero en el Game Master de privateshared y el recurso NLTK `punkt_tab` para el scorer de IFEval. No se menciona el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de los pares de preferencia descritos.

## Capacidades

- Generacion de texto en ingles con foco en interacciones de dialogo estrategico multi-turno.
- Razonamiento conversacional aplicado a juegos de lenguaje con reglas formales (entorno Clembench).
- Capacidad de seguir instrucciones de juego y mantener coherencia en partidas con estado.
- Optimizado para preferencias de exito en tareas de dialogo, no para generacion libre general.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: limitadas al contexto de juegos de dialogo evaluados.
- Multilingue: no, solo ingles.
- Modo thinking o capacidades especiales de vision/audio: no disponibles.

## Casos de uso

- Evaluacion de tecnicas de post-entrenamiento en entornos de dialogo: el modelo sirve como punto de referencia para comparar el impacto del DPO on-policy frente a otros regimenes (SFT, GRPO) en la familia de checkpoints.
- Investigacion en aprendizaje por preferencias: los 107 pares on-policy demuestran como extraer senales de exito propio del modelo para mejorar su competencia sin datos externos, un caso de estudio util para laboratorios que trabajan con datos limitados.
- Desarrollo de agentes conversacionales para juegos de lenguaje: puede integrarse en prototipos de asistentes que necesiten mantener estrategias de dialogo con reglas, aunque su alcance esta limitado al dominio evaluado.
- Benchmarking de entornos de evaluacion reproducibles: su uso con clembench fijado en versiones concretas lo hace adecuado para validar la sensibilidad de metricas a cambios de entorno.
- Educacion y formacion en RLHF/DPO: al ser un modelo pequeno (2B) con licencia abierta, es util como ejemplo didactico de un pipeline DPO completo con datos de preferencia generados por el propio modelo.
- Experimentos de recasting en DPO: los 94 pares hibridos con recast de un modelo mas fuerte ilustran una tecnica para aprovechar fallos del modelo como datos de entrenamiento, aplicable a otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento corresponden al entorno de evaluacion propietario del challenge, medidos en el split de validacion del playpen:

| Regimen | Repo | clem | stat |
|---|---|---|---|
| Base (Qwen3.5-2B) | — | 13.63 | 44.22 |
| R1 imitation (SFT) | `lm-playschool-qwen3.5-2b-sft` | 55.61 | 43.87 |
| R2 outcome contrast (DPO) | `lm-playschool-qwen3.5-2b-sft-dpo` | 67.39 | 44.72 |
| R3 self-imitation (SFT) | `lm-playschool-qwen3.5-2b-iter3` | 61.06 | 44.01 |
| R4 corrective feedback (DPO) | `lm-playschool-qwen3.5-2b-iter4` | 67.64 | 44.31 |
| R5 GRPO (control) | `lm-playschool-qwen3.5-2b-grpo-base-s42` | 62.43 | 44.19 |
| R5 GRPO + RND | `lm-playschool-qwen3.5-2b-grpo-rnd-s42` | 67.44 | 43.53 |

Estos valores son especificos del entorno de evaluacion y no son comparables con benchmarks generales de NLP.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 8 bits, un modelo de 2B requiere aproximadamente 2-3 GB; en FP16, unos 4 GB. Para entrenamiento con DPO se recomienda al menos 16 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia. Para reentrenar o ajustar, una RTX 4090 o A100 de 24 GB es adecuada.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: al ser un modelo Transformers estandar, puede servirse con vLLM, TGI, llama.cpp (si se convierten los pesos a GGUF) u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; para un modelo de 2B en una RTX 4090 se estima una latencia de 20-40 ms por token y un throughput de 50-100 tokens/s, pero estos valores no estan confirmados.

## Comparativa con modelos similares

Dado que el modelo es un checkpoint especifico de un challenge de dialogo, no existen alternativas publicas directamente comparables con la misma tarea. La comparativa mas relevante es contra el modelo base y los otros checkpoints de la familia, como se muestra en la tabla de benchmarks. Frente a otros modelos de 2B genericos (Qwen2.5-1.5B, Llama-3.2-1B), este checkpoint esta especializado en juegos de dialogo y no se han publicado metricas generales que permitan una comparacion directa. La licencia Apache 2.0 es mas permisiva que la de Llama (que requiere atribucion) y similar a la de Qwen (Apache 2.0 en la version 3.5).

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles y para tareas de dialogo con reglas; su rendimiento en generacion general de texto o en otros idiomas no ha sido evaluado.
- Los resultados de clemscore/statscore son especificos del entorno playpen y pueden no generalizar a otros benchmarks o aplicaciones reales.
- El margen de mejora sobre R2 (0.25 puntos) esta dentro de la variabilidad entre ejecuciones, por lo que la superioridad nominal no es estadisticamente robusta.
- No se han publicado datos sobre sesgos, alucinaciones o comportamientos toxicos; al ser un modelo pequeno basado en Qwen, puede heredar sesgos del modelo base.
- El entrenamiento se realizo con un dataset muy pequeno (201 pares), lo que limita la robustez del modelo fuera del dominio de entrenamiento.
- No se proporciona informacion sobre la longitud de contexto soportada ni sobre cuantizaciones probadas, lo que dificulta su despliegue en entornos con restricciones de memoria.
- El paper asociado aun no tiene enlace publico (aparece como TODO en el README), por lo que la reproducibilidad completa no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/varadsrivastava/lm-playschool-qwen3.5-2b-iter4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper (pendiente de publicacion): no disponible
