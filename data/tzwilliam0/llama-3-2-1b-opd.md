# tzwilliam0/Llama-3.2-1B-OPD

## Resumen

Llama-3.2-1B-OPD es un checkpoint de estudiante obtenido mediante destilación on-policy vanilla (vanilla on-policy distillation) a partir de un profesor congelado, meta-llama/Llama-3.2-3B-Instruct. Lo publica el usuario tzwilliam0 en Hugging Face como artefacto reproducible del ajuste E3 de su artículo sobre destilación on-policy con conciencia de recompensa (reward aware on policy distillation). El modelo parte de la inicialización meta-llama/Llama-3.2-1B-Instruct y conserva la arquitectura transformer decoder-only de la familia Llama 3.2, con 1.498.482.688 parámetros reales según safetensors.

El interés es doble. Por un lado, es un ejemplo controlado de destilación on-policy sobre un modelo pequeño (1B) con datos de UltraChat y un protocolo de evaluación con modelos de recompensa externos (Skywork-Reward-V2). Por otro, sirve como referencia negativa: en las tres pruebas reportadas el estudiante destilado obtiene puntuaciones inferiores a las del estudiante sin entrenar, lo que documenta un caso de degradación bajo este ajuste concreto.

No es un modelo pensado para producción: el autor lo publica como checkpoint de investigación, con logs completos de entrenamiento en el repositorio y una selección de checkpoint basada en un conjunto de validación de 1000 prompts. La licencia es la Llama 3.2 Community License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), derivada de meta-llama/Llama-3.2-1B-Instruct |
| Parametros totales | 1.498.482.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 1B Instruct soporta 128K tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2, inicializado desde meta-llama/Llama-3.2-1B-Instruct y entrenado con destilación on-policy vanilla. El profesor es meta-llama/Llama-3.2-3B-Instruct, congelado durante todo el proceso. Los datos de entrenamiento son 9000 prompts de UltraChat. El entrenamiento consta de 50 pasos, con 128 prompts por paso y 8 muestras por prompt, learning rate de 1e-6, longitud máxima de respuesta de 2048 tokens y semilla de rollout 0. El checkpoint publicado corresponde al paso 30.

La selección del checkpoint se hizo sobre un conjunto retenido de 1000 prompts puntuados por Skywork-Reward-V2-Llama-3.2-3B, sin solapamiento con los benchmarks reportados. Los candidatos evaluados fueron los pasos 10, 20, 30, 40 y 50. Los números de benchmark se obtuvieron con un modelo de recompensa distinto, Skywork-Reward-V2-Llama-3.1-8B. Según el autor, los cinco métodos del ajuste E3 comparten una única configuración de hiperparámetros, los mismos datos, la misma semilla de datos y semillas de rollout emparejadas, sin ajuste específico por método. El repositorio incluye training_logs/ con selected.json (todos los pasos candidatos y su puntuación de validación), metrics.jsonl (dinámica de entrenamiento por paso) y launch.json (configuración completa de hiperparámetros).

## Capacidades

- Generación de texto conversacional, heredada de la inicialización Instruct de Llama 3.2 1B.
- Destilación orientada a calidad de respuesta según modelos de recompensa externos (Skywork-Reward-V2), no a una tarea específica.
- No se documentan capacidades de tool calling, function calling ni uso como agente.
- No se documentan modos de razonamiento explícito (thinking mode), visión ni audio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta soporte de contexto largo específico para este checkpoint.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint permite reproducir y comparar el ajuste E3 frente a otros métodos del artículo, usando los logs incluidos en training_logs/ y las mismas semillas de rollout.
- Estudio de degradación por destilación: al comparar contra el estudiante sin entrenar y el profesor con las mismas métricas, sirve para analizar cuándo la destilación on-policy perjudica en lugar de mejorar en modelos de 1B.
- Evaluación de modelos de recompensa: útil para probar el comportamiento de Skywork-Reward-V2-Llama-3.2-3B y Skywork-Reward-V2-Llama-3.1-8B como jueces sobre respuestas generadas por un modelo pequeño.
- Línea base en experimentos de alineación: punto de partida para comparar técnicas de destilación, DPO o RLHF sobre la misma inicialización de 1B.
- Generación de texto ligera en entornos de investigación: con 1,5B parámetros y pesos safetensors, se puede servir con transformers o TGI para pruebas controladas de calidad de respuesta.
- Reproducibilidad de pipelines de entrenamiento: los ficheros de configuración y métricas permiten auditar el protocolo (pasos, prompts por paso, muestras por prompt) en réplicas del experimento.

## Benchmarks y rendimiento

Puntuaciones del modelo de recompensa externo Skywork-Reward-V2-Llama-3.1-8B, con 8 muestras por prompt promediadas por prompt y luego sobre prompts; media de 3 semillas de rollout con desviación estándar entre semillas. Este repositorio contiene el checkpoint de la semilla 0.

| Benchmark | Prompts | Llama-3.2-1B-OPD (paso 30) | Estudiante 1B sin entrenar | Profesor 3B |
|---|---|---|---|---|
| AlpacaEval | 805 | 12,413 ± 0,023 | 12,991 | 21,085 |
| WritingBench | 1000 | 3,714 ± 0,054 | 5,043 | 12,992 |
| WildBench | 1024 | 3,154 ± 0,056 | 4,295 | 14,019 |

Decodificación en evaluación: AlpacaEval y WildBench con temperature 0,7 y top_p 0,95; WritingBench con temperature 0,7, top_p 0,8 y top_k 20, idéntica para todos los métodos y modelos de referencia. En las tres pruebas el checkpoint destilado queda por debajo del estudiante sin entrenar y muy lejos del profesor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (1,5B parámetros), en fp16 requiere aproximadamente 3 GB de pesos más overhead de activaciones y caché KV, y en cuantización de 8 bits o 4 bits bajaría a rangos de 1,5-2 GB, aunque no se publican variantes cuantizadas.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no hay confirmación ni mediciones publicadas.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (tag endpoints_compatible); no se documentan GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado en benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-OPD | 1.498.482.688 | no disponible | AlpacaEval 12,413; WritingBench 3,714; WildBench 3,154 (reward model 8B) | llama3.2 | Hugging Face, safetensors |
| Llama-3.2-1B-Instruct (estudiante sin entrenar) | no disponible en la información proporcionada | no disponible | AlpacaEval 12,991; WritingBench 5,043; WildBench 4,295 | llama3.2 | Hugging Face |
| Llama-3.2-3B-Instruct (profesor) | no disponible en la información proporcionada | no disponible | AlpacaEval 21,085; WritingBench 12,992; WildBench 14,019 | llama3.2 | Hugging Face |

Las puntuaciones de los tres modelos proceden del mismo protocolo de evaluación con Skywork-Reward-V2-Llama-3.1-8B y no son comparables con métricas estándar tipo MMLU o HumanEval, que no se reportan.

## Limitaciones y advertencias

- Degradación frente al estudiante sin entrenar en los tres benchmarks reportados: el proceso de destilación on-policy vanilla en este ajuste empeora la calidad medida por el reward model externo.
- Selección de checkpoint basada en un reward model (Skywork-Reward-V2-Llama-3.2-3B) distinto del usado para reportar resultados (Skywork-Reward-V2-Llama-3.1-8B), lo que introduce un desacoplamiento entre criterio de selección y métrica final.
- Entrenamiento muy corto (50 pasos, 9000 prompts de UltraChat) y sin ajuste por método, lo que limita la generalización de las conclusiones.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento multilingüe para este checkpoint.
- Licencia Llama 3.2 Community License: uso comercial sujeto a los términos de Meta y a la Acceptable Use Policy de Llama 3.2; es un derivado, no un modelo de pesos abiertos sin restricciones.
- No apto para producción sin una evaluación propia: es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta.
- No se publican variantes cuantizadas ni instrucciones de despliegue más allá de transformers y TGI.

## Enlaces

- Hugging Face: https://huggingface.co/tzwilliam0/Llama-3.2-1B-OPD
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Profesor: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- No se han encontrado en la información proporcionada enlaces al paper, blog o repositorio del artículo sobre reward aware on policy distillation.
