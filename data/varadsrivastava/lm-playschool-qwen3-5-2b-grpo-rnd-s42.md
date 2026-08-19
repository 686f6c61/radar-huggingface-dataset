# varadsrivastava/lm-playschool-qwen3.5-2b-grpo-rnd-s42

## Resumen

El modelo `lm-playschool-qwen3.5-2b-grpo-rnd-s42` es un fine-tuning de 1.880 millones de parámetros sobre Qwen3.5-2B, desarrollado por Varad Srivastava en el marco del LM Playschool Challenge 2026 (equipo DAIR). Forma parte de un barrido de cinco regímenes de post-entrenamiento orientados a competencia en juegos de diálogo, y su contribución principal es la incorporación de un bonus de novedad intrínseca basado en *random network distillation* (RND) sobre el algoritmo GRPO. Este bonus actúa como regularizador contra la deriva distribucional, recuperando gran parte de la regresión que sufre el GRPO puro en juegos no vistos durante el entrenamiento.

El modelo está pensado como un artefacto de investigación para estudiar cómo la curiosidad artificial afecta al aprendizaje por refuerzo en entornos conversacionales. Sus resultados en la validación del entorno *playpen* muestran una mejora de 5,01 puntos de *clemscore* respecto al control sin RND (62,43 → 67,44), concentrada en los juegos que GRPO no había visto. La licencia es Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base Qwen3.5-2B, sin detalles adicionales en la informacion disponible) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se puede cuantizar con herramientas estandar como GPTQ, AWQ o GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y se entrena con GRPO (*Group Relative Policy Optimization*), un algoritmo de optimizacion de politicas por refuerzo que normaliza las ventajas dentro de grupos de episodios. La novedad de este checkpoint es la adicion de un bonus de curiosidad basado en RND: el retorno de cada episodio se aumenta con el error de prediccion normalizado de un predictor entrenado contra un target aleatorio congelado, calculado sobre un embedding aleatorio congelado de los tokens de accion del agente. El hiperparametro lambda es 0,1 y el bonus se recorta a un maximo de 5.

Debido a que las ventajas de GRPO se normalizan por grupo, solo las diferencias de novedad *dentro* de cada grupo contribuyen al gradiente. Esto convierte el bonus en un regularizador contra la deriva distribucional mas que en un mecanismo exploratorio puro. El entrenamiento es identico al control (`...-grpo-base-s42`) en semilla, pasos, datos e hiperparametros, diferenciandose unicamente en el bonus RND. No se proporcionan detalles sobre el volumen de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de texto conversacional multi-turno, especializada en juegos de dialogo.
- Mantenimiento de coherencia y seguimiento de instrucciones en entornos de rol.
- Capacidad para mejorar en juegos no vistos durante el entrenamiento gracias al bonus de novedad (resultado central del paper).
- Soporte de conversacion en ingles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso explicito fuera del contexto de dialogo.

## Casos de uso

- Desarrollo de personajes no jugables (NPC) en videojuegos narrativos: el modelo puede gestionar conversaciones coherentes con contexto de rol, aprovechando su entrenamiento especifico en juegos de dialogo.
- Simulacion de interlocutores para entrenamiento de otros modelos: sirve como generador de datos sinteticos de conversacion en entornos controlados.
- Prototipado rapido de chatbots conversacionales: al ser un modelo de 2B, es ligero y puede desplegarse en entornos de desarrollo para validar flujos de dialogo.
- Investigacion en metodos de aprendizaje por refuerzo: su diseno GRPO+RND lo convierte en un caso de estudio para comparar estrategias de exploracion y regularizacion.
- Evaluacion de tecnicas de post-entrenamiento: permite reproducir y comparar los resultados del paper en entornos de validacion estandarizados.
- Generacion de guiones interactivos o narrativa adaptativa: puede generar respuestas contextuales en historias ramificadas donde el usuario interactua con personajes.

## Benchmarks y rendimiento

Los resultados se miden en el *validation split* del entorno *playpen* (Python 3.11, clemcore y clembench fijados). La tabla siguiente recoge los valores de *clemscore* y *statscore* para los distintos checkpoints de la familia:

| Modelo | clemscore | statscore |
|---|---|---|
| Qwen3.5-2B (base) | 13,63 | 44,22 |
| R1 SFT | 55,61 | 43,87 |
| R2 DPO | 67,39 | 44,72 |
| R3 SFT iterativo | 61,06 | 44,01 |
| R4 DPO iterativo | 67,64 | 44,31 |
| R5 GRPO (control) | 62,43 | 44,19 |
| **R5 GRPO + RND (este modelo)** | **67,44** | **43,53** |

El modelo recupera practicamente toda la regresion del GRPO puro, superando al control en 5,01 puntos de *clemscore*. El *statscore* es ligeramente inferior al control (43,53 frente a 44,19), lo que sugiere una mejora concentrada en la calidad del dialogo mas que en metricas estadisticas secundarias.

## Requisitos de hardware

- VRAM estimada: ~3,8 GB en FP16 (tamano del repo), ~2 GB en cuantizacion de 8 bits, ~1 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (p. ej., RTX 3060, RTX 4060, GTX 1660 Super). Para cuantizacion de 4 bits, basta con 2 GB.
- Cabe en GPUs de consumo habituales; no requiere hardware de datacenter.
- Opciones de despliegue: transformers (pipeline de generacion de texto), vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; para un modelo de 2B en FP16 se espera una latencia del orden de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | clemscore | statscore | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-2B (base) | 1,88 B | no disponible | 13,63 | 44,22 | Apache 2.0 |
| R5 GRPO (control) | 1,88 B | no disponible | 62,43 | 44,19 | Apache 2.0 |
| **R5 GRPO + RND** | **1,88 B** | **no disponible** | **67,44** | **43,53** | **Apache 2.0** |
| R2 DPO | 1,88 B | no disponible | 67,39 | 44,72 | Apache 2.0 |

El modelo se situa en la misma categoria de rendimiento que el mejor checkpoint de DPO (R2), pero con un metodo de entrenamiento diferente (RL puro con bonus de curiosidad). No se dispone de datos de otros modelos de 2B fuera de esta familia para una comparativa externa.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no soporta otros idiomas de forma nativa.
- Especializado en juegos de dialogo; su rendimiento fuera de ese dominio no esta evaluado y probablemente sea inferior al de un modelo generalista.
- No se documentan sesgos especificos, pero al ser un fine-tuning de un modelo base, puede heredar sesgos de Qwen3.5-2B.
- Riesgo de alucinacion en contextos abiertos, comun en modelos de este tamano.
- Los resultados de validacion dependen del entorno *playpen* fijado; variaciones en el entorno pueden alterar las metricas (el propio autor menciona sensibilidad al entorno en el paper).
- Es un checkpoint de investigacion; no se garantiza su robustez en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen3.5-2B para confirmar compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/varadsrivastava/lm-playschool-qwen3.5-2b-grpo-rnd-s42
- Paper (referencia, sin enlace publicado): *Raising a Small Language Model: From Imitation to Curiosity in Dialogue Games* (LM Playschool Challenge 2026, equipo DAIR).
