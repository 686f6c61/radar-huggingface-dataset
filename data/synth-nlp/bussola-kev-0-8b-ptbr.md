# Synth-NLP/bussola-kev-0.8b-ptbr

## Resumen

Bússola-Kev-0.8B es un modelo de clasificación de intenciones en portugués de Brasil desarrollado por Synth-NLP. Recibe una frase del usuario junto con una lista de opciones de intención y selecciona la que corresponde (por ejemplo, "¿va a llover mañana?" → `consultar clima`). Es un ajuste fino del modelo base `jaredpalmer/kev-0.8b` mediante LoRA y una cabeza de punteros (pointer head), servido a través del código del proyecto Kev con la API System One.

El modelo forma parte de la familia Bússola, un experimento que evalúa si los datos sintéticos en portugués mejoran los clasificadores de intención, especialmente en intenciones nunca vistas durante el entrenamiento. El conjunto de entrenamiento combina 5.405 ejemplos reales del dataset MASSIVE pt-BR con 20.383 frases sintéticas generadas por una pipeline agéntica, sumando 25.788 filas en total.

Con solo 0,8B parámetros, el modelo alcanza un 0,815 de accuracy en escenarios no vistos y un 0,917 en escenarios vistos (con 20 opciones por frase, azar = 0,050), lo que lo convierte en una alternativa compacta y desplegable en hardware modesto frente a variantes mayores de la misma familia (4B y 9B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base kev-0.8b) con ajuste delta LoRA + pointer head |
| Parametros totales | 0,8B (modelo base); adaptadores LoRA adicionales de tamano no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tarea | Clasificacion de intenciones (intent classification) con lista de opciones |
| Tamano del repo | 0,1 GB |
| Modelo base | jaredpalmer/kev-0.8b |

## Arquitectura y entrenamiento

El modelo se construye sobre `jaredpalmer/kev-0.8b`, un transformer decoder-only, mediante un ajuste delta que combina adaptadores LoRA con una pointer head que selecciona una de las opciones de intención proporcionadas en la entrada. El entrenamiento se realizó con `python -m kev.train --init_from `, con los siguientes hiperparámetros: learning rate 2e-5, 2 épocas, batch size 8, precisión bf16, base congelada, aumentos de datos del Kev desactivados y seed 0.

Los datos sintéticos se generaron con una pipeline agéntica de cinco etapas: (1) planificación de peticiones variadas por intención con personas, situaciones cotidianas, estilos de escritura extraídos de oasst1 y peticiones contrastivas contra la intención vecina más parecida; (2) generación con Gemma 4 12B y Qwen3.5-9B, con reescritura Evol-Instruct para aumentar la dificultad de parte de las frases; (3) filtrado de duplicados y de frases demasiado similares a los datos de test mediante Qwen3-Embedding-0.6B; (4) juicio con dos LLM que deben coincidir en la intención, más una nota de naturalidad; (5) selección de las frases difíciles para el modelo y uso de sus errores para solicitar la siguiente ronda (LLM2LLM). El conjunto final contiene 5.405 ejemplos reales de 30 intenciones y 20.383 frases sintéticas, de las cuales parte cubren 30 intenciones nuevas.

## Capacidades

- Clasificación de intenciones en portugués de Brasil: dada una frase y una lista de opciones, selecciona la intención correcta.
- Generalización a intenciones no vistas durante el entrenamiento (accuracy de 0,815 en escenarios no vistos).
- Manejo de peticiones contrastivas: el entrenamiento incluye ejemplos diseñados para distinguir intenciones vecinas semánticamente parecidas.
- Robustez ante variación de estilo de escritura, gracias a la inclusión de estilos de usuarios reales (oasst1) en la generación sintética.
- Selección entre 20 opciones por frase en la evaluación publicada.
- No dispone de generación de texto libre, razonamiento multi-paso, tool calling, visión ni audio: es un modelo especializado en decisión sobre un conjunto cerrado de opciones.

## Casos de uso

- Enrutamiento de consultas en asistentes conversacionales: el modelo recibe la frase del usuario y una lista de intenciones del sistema (clima, reservas, soporte técnico, etc.) y devuelve la etiqueta adecuada, permitiendo derivar la conversación al flujo correcto con un modelo de 0,8B desplegable en CPU o GPU modesta.
- Clasificación de tickets de soporte: con una taxonomía de 30 o más categorías, el modelo asigna cada mensaje entrante a la cola correspondiente, incluyendo categorías nuevas no presentes en el entrenamiento original gracias a su capacidad de generalización a intenciones no vistas.
- Moderación y triaje de mensajes en portugués: selección entre opciones predefinidas de categoría (spam, consulta legítima, queja, etc.) en pipelines de preprocesado.
- Automatización de encuestas y formularios: mapeo de respuestas abiertas en portugués a opciones cerradas de un cuestionario, reduciendo el trabajo manual de codificación.
- Integración en agentes con API System One: el modelo se sirve con `uv run --extra serve python -m kev.serve --run Synth-NLP/bussola-kev-0.8b-ptbr`, lo que permite conectarlo a un orquestador que decida la siguiente acción entre un conjunto de herramientas o intenciones.
- Clasificación de comandos de voz transcritos: al operar sobre texto en pt-BR, puede recibir transcripciones de ASR y determinar la intención del usuario en asistentes de voz domésticos.
- Evaluación comparativa de datos sintéticos: sirve como referencia reproducible para equipos que investiguen aumento de datos sintéticos en clasificación de intenciones en portugués.

## Benchmarks y rendimiento

Accuracy en la validación del MASSIVE pt-BR con 20 opciones por frase (azar = 0,050). Los escenarios "no vistas" son conjuntos completos reservados: ninguna frase, intención ni dominio de ellos entró en el entrenamiento ni en la generación de sintéticos.

| Modelo | Base | No vistas | Vistas |
|---|---|---:|---:|
| Jev (API de TypeSafe, referencia) | — | 0,863 | 0,864 |
| Bússola-Kev-4B | kev-4b | 0,867 | 0,933 |
| Bússola-Kev-9B | kev-9b | 0,861 | 0,929 |
| **Bússola-Kev-0.8B** (este) | kev-0.8b | **0,815** | **0,917** |
| Bússola-Laya | laya | 0,763 | 0,908 |

Ablación del efecto de los datos sintéticos sobre el mismo modelo base:

| Configuracion | No vistas | Vistas |
|---|---:|---:|
| Sin ajuste | 0,728 | 0,672 |
| Ajustado solo con los 5.405 ejemplos reales | 0,779 | 0,921 |
| Ajustado con reales + sintéticos (Bússola) | 0,815 | 0,917 |

El ganancia del sintético sobre el ajuste solo con reales en escenarios no vistos es de +3,6 puntos [+2,3; +5,0] (intervalo de confianza del 95 %, bootstrap pareado por frase). En escenarios vistos, reales y reales + sintéticos empatan.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 0,8B parámetros en bf16, el peso ronda 1,6 GB, por lo que en la práctica cabría en GPUs de consumo con 4-8 GB de VRAM; sin embargo, el autor no publica cifras de VRAM ni de cuantización.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería poder alojar el modelo en bf16, pero no hay confirmación oficial.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 0,8B y el repo de 0,1 GB, aunque no se documentan requisitos mínimos.
- Opciones de despliegue: el autor documenta el servidor propio del proyecto Kev (`python -m kev.serve --run Synth-NLP/bussola-kev-0.8b-ptbr`), compatible con la API System One. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | No vistas | Vistas | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Bússola-Kev-0.8B | 0,8B | 0,815 | 0,917 | Apache 2.0 | Hugging Face |
| Bússola-Kev-4B | 4B | 0,867 | 0,933 | no disponible | Hugging Face |
| Bússola-Kev-9B | 9B | 0,861 | 0,929 | no disponible | Hugging Face |
| Bússola-Laya | no disponible | 0,763 | 0,908 | no disponible | Hugging Face |
| Jev (API TypeSafe) | no disponible | 0,863 | 0,864 | propietaria (API) | API |

El modelo de 0,8B sacrifica entre 4 y 5 puntos de accuracy en escenarios no vistos frente a las variantes de 4B y 9B, pero mantiene un rendimiento en escenarios vistos muy cercano (0,917 frente a 0,933 y 0,929) con un orden de magnitud menos de parámetros. Frente al servicio propietario Jev, queda por debajo en no vistas y por encima en vistas.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo; el modelo hereda los sesgos del corpus MASSIVE y de los modelos generadores de datos sintéticos (Gemma 4 12B y Qwen3.5-9B).
- Riesgo de alucinación: limitado por diseño, ya que la salida es una selección entre opciones cerradas; aun así, puede asignar una intención incorrecta cuando la frase es ambigua o cae fuera de la taxonomía.
- Limitaciones de contexto e idioma: solo portugués de Brasil; no se especifica la longitud máxima de contexto. El pt-BR del MASSIVE es una localización generada por LLM a partir del pt-PT, lo que puede introducir artefactos lingüísticos.
- Alcance reducido: una sola tarea (elección de intención) y un solo conjunto de datos; los resultados se basan en una única seed de entrenamiento en los modelos Kev.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los pesos derivan de `jaredpalmer/kev-0.8b` y las frases reales provienen de MASSIVE (© Amazon.com, Inc. o afiliadas, CC BY 4.0), por lo que debe mantenerse la atribución correspondiente.
- Comparaciones con Jev: el servicio Jev se evaluó en un único sorteo de opciones (el sorteo 0), mientras que el modelo se evalúa como media de 3 sorteos, lo que introduce una asimetría metodológica en la comparación.
- Madurez: el repo tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo es una copia de `Synth-NLP/kev-0.8b-massive-pt-br-D1-v4` del experimento, sin validación externa publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/bussola-kev-0.8b-ptbr
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Repositorio del proyecto Kev: https://github.com/jaredpalmer/kev
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper de MASSIVE: https://arxiv.org/abs/2204.08582
- Variante 4B: https://huggingface.co/Synth-NLP/bussola-kev-4b-ptbr
- Variante 9B: https://huggingface.co/Synth-NLP/bussola-kev-9b-ptbr
- Variante Laya: https://huggingface.co/Synth-NLP/bussola-laya-ptbr
- Gemma 4 12B (generador de datos sintéticos): https://huggingface.co/google/gemma-4-12B-it
- Qwen3.5-9B (generador de datos sintéticos): https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3-Embedding-0.6B (filtrado de similitud): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
