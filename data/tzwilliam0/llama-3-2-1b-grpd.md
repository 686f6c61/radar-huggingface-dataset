# tzwilliam0/Llama-3.2-1B-GRPD

## Resumen

Llama-3.2-1B-GRPD es un checkpoint de estudiante obtenido mediante destilación on-policy con el método GRPD (reward-aware on-policy distillation), presentado en el artículo del autor sobre destilación en política con señal de recompensa. Lo desarrolla tzwilliam0 y parte de `meta-llama/Llama-3.2-1B-Instruct` como inicialización, usando `meta-llama/Llama-3.2-3B-Instruct` congelado como profesor. El objetivo es transferir capacidades conversacionales del modelo de 3B a un modelo de 1B mediante rollouts generados por el propio estudiante y puntuados por un modelo de recompensa.

El modelo tiene 1.498.482.688 parámetros reales en safetensors y un repositorio de 3,0 GB. La arquitectura subyacente es la de Llama 3.2 1B Instruct (transformer decoder-only denso), con la longitud de contexto heredada del modelo base. El entrenamiento se realizó sobre 9.000 prompts de UltraChat durante 50 pasos, con 128 prompts por paso y 8 muestras por prompt, learning rate de 1e-6 y longitud máxima de respuesta de 2048 tokens. El checkpoint publicado corresponde al paso 30, seleccionado sobre un conjunto de validación de 1.000 prompts.

Su relevancia es metodológica más que de producto: sirve como referencia reproducible de un pipeline de destilación on-policy con selección de checkpoint mediante reward model, y los propios resultados publicados muestran que el estudiante destilado queda por debajo del estudiante sin entrenar en las tres métricas reportadas, lo que convierte este checkpoint en un caso de estudio útil sobre los límites del método en esta configuración concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2 1B Instruct) |
| Parametros totales | 1.498.482.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama 3.2 1B Instruct) |
| Tipos de cuantizacion | no disponible en la información proporcionada; al ser safetensors en bf16/fp16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | no disponible en la información proporcionada (heredados del modelo base) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 1B parámetros, inicializado desde Llama 3.2 1B Instruct, que a su vez emplea la arquitectura estándar de la familia Llama 3.2 (atención con RoPE, SwiGLU en el FFN, normalización RMSNorm). No hay innovaciones arquitectónicas propias: el interés está en el procedimiento de entrenamiento, no en la topología.

El entrenamiento aplica GRPD (reward-aware on-policy distillation) en el ajuste E3 del artículo del autor. El profesor es Llama 3.2 3B Instruct congelado. Los datos son 9.000 prompts de UltraChat; en cada paso se muestrean 128 prompts y se generan 8 respuestas por prompt con el estudiante (rollouts on-policy), que se puntúan con un modelo de recompensa y se usan para actualizar los pesos. La configuración es de 50 pasos, learning rate 1e-6, longitud máxima de respuesta 2048 y semilla de rollout 0. El checkpoint publicado es el paso 30, elegido sobre 1.000 prompts de validación puntuados con `Skywork-Reward-V2-Llama-3.2-3B`, un reward model distinto del usado para reportar los benchmarks finales (`Skywork-Reward-V2-Llama-3.1-8B`). Los cinco métodos comparados en el artículo comparten hiperparámetros, datos, semilla de datos y semillas de rollout pareadas, sin ajuste por método.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de Llama 3.2 Instruct).
- Generación de código y matemáticas a nivel básico, limitada por el tamaño de 1B parámetros.
- Soporte de tool calling y function calling: no documentado explícitamente en la model card; al derivar de Llama 3.2 1B Instruct, se espera compatibilidad con el formato de herramientas del modelo base, pero no está verificado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Estudio de destilación on-policy: reproducir el pipeline GRPD con el profesor de 3B y comparar la curva de validación registrada en `training_logs/selected.json` frente a los otros métodos del artículo.
- Investigación sobre reward hacking y sobreajuste al reward model: el checkpoint permite analizar por qué el estudiante destilado puntúa por debajo del estudiante sin entrenar en las tres métricas externas.
- Baseline de bajo coste en experimentos de alineación: con 1B parámetros y licencia Llama 3.2, sirve como punto de partida controlado en ablaciones donde el coste de inferencia importa.
- Evaluación de reward models: usar este checkpoint como generador fijo para medir la sensibilidad de `Skywork-Reward-V2` a respuestas de un modelo pequeño.
- Despliegue en entornos con recursos muy limitados: generación de texto conversacional en CPU o GPU de gama baja, siempre que se acepte la pérdida de calidad frente al modelo base.
- Docencia y divulgación: ejemplo práctico y reproducible de un ciclo completo de destilación con selección de checkpoint por validación, incluidos los logs de entrenamiento publicados.

## Benchmarks y rendimiento

Resultados publicados en la model card. La métrica es la puntuación escalar del reward model externo `Skywork-Reward-V2-Llama-3.1-8B`, con 8 muestras por prompt promediadas por prompt y luego sobre prompts; media de 3 semillas de rollout con desviación estándar entre semillas. Este repositorio contiene el checkpoint de la semilla 0.

| Benchmark | Prompts | Llama-3.2-1B-GRPD (paso 30) | Estudiante 1B sin entrenar | Profesor 3B |
|---|---|---|---|---|
| AlpacaEval | 805 | 12,547 ± 0,083 | 12,991 | 21,085 |
| WritingBench | 1000 | 3,789 ± 0,055 | 5,043 | 12,992 |
| WildBench | 1024 | 3,245 ± 0,073 | 4,295 | 14,019 |

Decodificación de evaluación: AlpacaEval y WildBench con temperatura 0,7 y top_p 0,95; WritingBench con temperatura 0,7, top_p 0,8 y top_k 20. Idéntica para todos los métodos y modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 4-6 GB con contexto moderado.
- En cuantización de 8 bits: alrededor de 1,5-2 GB de pesos; en 4 bits, alrededor de 1 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, L4, A10, A100, H100). Cabe en GPUs de consumo actuales sin problemas.
- Despliegue: compatible con `transformers`, text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (AlpacaEval RM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-GRPD | 1,498B | no disponible | 12,547 | Llama 3.2 Community | Hugging Face |
| Llama-3.2-1B-Instruct (base sin destilar) | 1,24B aprox. | 128K (según Meta) | 12,991 | Llama 3.2 Community | Hugging Face |
| Llama-3.2-3B-Instruct (profesor) | 3,21B aprox. | 128K (según Meta) | 21,085 | Llama 3.2 Community | Hugging Face |

Nota: los valores de parámetros y contexto de los modelos de referencia corresponden a las fichas oficiales de Meta; el rendimiento se toma de la model card de este repositorio bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- El estudiante destilado empeora respecto al estudiante sin entrenar en las tres métricas reportadas (AlpacaEval, WritingBench, WildBench), lo que sugiere sobreoptimización del reward model o degradación de la política durante el entrenamiento on-policy.
- El checkpoint se seleccionó con un reward model (3B) distinto del usado para reportar resultados (8B), lo que introduce desajuste entre criterio de selección y métrica final.
- Entrenamiento muy corto (50 pasos, 9.000 prompts de UltraChat) y sin ajuste por método; los resultados no deben extrapolarse a configuraciones más largas.
- Riesgo de alucinación inherente a un modelo de 1B parámetros, agravado por la posible degradación del ajuste.
- Sesgos: no evaluados en la información proporcionada; se heredan los del modelo base y los de UltraChat.
- Idiomas soportados no documentados; el comportamiento fuera del inglés no está verificado.
- Uso comercial permitido bajo la Llama 3.2 Community License, sujeto a la Acceptable Use Policy de Llama 3.2; es un modelo derivado y debe conservar los avisos de licencia.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni informes de uso en producción.
- El repositorio incluye únicamente el checkpoint de la semilla 0; la variabilidad entre semillas debe tenerse en cuenta al reproducir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tzwilliam0/Llama-3.2-1B-GRPD
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Profesor: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Reward model de selección: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.2-3B
- Reward model de evaluación: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.1-8B
- Artículo del método GRPD: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
