# Travor278/pi05-pick-dual-bottles-left-first-lora-10k

## Resumen

Este repositorio contiene un ajuste fino mediante LoRA de PI0.5 sobre el checkpoint base XinY0201/openpi-pi05-base-jax (commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658), con un único experto de acción, dentro del ecosistema openpi y en su implementación en JAX. Lo publica el usuario Travor278 y está especializado en una única tarea de manipulación robótica: recoger dos botellas (prompt «Pick up two bottles.»). El resultado es un árbol de parámetros de inferencia en formato Orbax que incluye los pesos LoRA, los pesos base y los activos de normalización; el estado del optimizador se ha retenido en la plataforma de entrenamiento y no forma parte del checkpoint de inferencia.

El ajuste se ha entrenado durante 10.000 actualizaciones con batch global 16 sobre un dataset de 50 episodios y 15.643 fotogramas a 25 FPS, con espacio de estados y acciones absoluto de 14 dimensiones, tres vistas RGB y transformaciones estándar de 224x224, con acciones de modelo rellenadas hasta 32 dimensiones y horizonte 50. El entrenamiento se ejecutó en dos H100 de 80 GB con precisión bf16 para activaciones y parámetros congelados y float32 para parámetros entrenables, optimizador AdamW y un scheduler coseno fijo de 30.000 pasos del que solo se completaron 10.000.

Su relevancia es acotada y de carácter experimental: no es un modelo de propósito general, sino un artefacto reproducible de investigación en robótica. El autor declara explícitamente que no se reclama ninguna tasa de éxito de rollout, y el repositorio no declara licencia, idiomas soportados ni métricas de evaluación. El repositorio de pesos ocupa 6,3 GB y acumula 0 descargas y 0 «likes» en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visomotora-lingüística (VLA) derivada de PI0.5 (openpi, JAX), con experto de acción único y adaptadores LoRA sobre PaliGemma |
| Parámetros totales | no disponible (el repositorio de pesos ocupa 6,3 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el entrenamiento usa bf16 en activaciones y parámetros congelados y float32 en parámetros entrenables |
| Idiomas soportados | no disponible; el prompt de la tarea está en inglés («Pick up two bottles.») |
| Licencia | no disponible |
| Formato de pesos | checkpoint Orbax de OpenPI (raíz `10000/`), con árbol de parámetros de inferencia completo (LoRA + base + normalización) |
| Framework / librería | openpi (JAX) |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 6,3 GB |
| Dimensiones de estado y acción | 14 dimensiones absolutas nativas (sin delta transform ni conversión de unidades Aloha) |
| Acciones de modelo | rellenadas (padded) a 32 dimensiones, horizonte 50 |
| Entradas visuales | tres vistas RGB, transformaciones estándar 224x224 |

## Arquitectura y entrenamiento

La base es PI0.5 en su variante JAX de openpi, con un único experto de acción. El ajuste se aplica mediante LoRA sobre PaliGemma con rango/alpha 16 en el backbone y 32 en el experto; el filtro de referencia incluye visión y proyecciones entrenables. Se emplean activaciones y parámetros congelados en bf16 y parámetros entrenables en float32. La optimización usa AdamW con beta1 = 0,9, beta2 = 0,95, epsilon = 1e-8, weight decay = 1e-10, clipping de gradiente 1 y sin EMA, sobre un scheduler coseno fijo de 30.000 pasos con 1000 de warmup, pico de 2,5e-5 y valor final de 2,5e-6 (entrenamiento detenido en el paso 10.000).

Los datos provienen del dataset Shiki42/ctr-pick-dual-bottles-left-first-20260911 (commit da5c6c49...), con 50 episodios y 15.643 fotogramas a 25 FPS. Se usan estados y acciones absolutos de 14 dimensiones nativas, tres vistas RGB y transformaciones estándar de 224x224, con acciones de modelo rellenadas a 32 dimensiones y horizonte 50; no se aplica máscara de reposo, transformación delta ni conversión de unidades Aloha. El entrenamiento corrió en dos H100 de 80 GB con batch global 16 y semilla 87431. El autor indica que se validaron el decodificador y el tokenizador reales, la normalización independiente del dataset y las pruebas de guardado y recarga del checkpoint en CPU antes del envío a GPU, y que la restauración estricta de parámetros y optimizador verifica valores finitos y el paso de optimizador 10.000, con hashes de arrays decodificados conservados. El job se identifica como job-f87aa00f-498f-4117-804e-3e5de3d7f41b (v2sam-exo2ego-fusion-official24-k17) y el contenedor de plataforma es NGC PyTorch 25.02, que ejecuta un entorno JAX separado; el autor advierte que no se reclama identidad byte a byte con el runtime archivado histórico de CTR.

## Capacidades

- Generación de acciones robóticas: produce comandos de acción absolutos de 14 dimensiones (rellenados a 32 en el espacio del modelo) a partir de observaciones, con horizonte de predicción de 50 pasos.
- Percepción multivista: consume tres vistas RGB con transformaciones estándar de 224x224.
- Condicionamiento por prompt: la política está condicionada por lenguaje, en este caso el prompt fijo «Pick up two bottles.».
- Manipulación de doble agarre: la tarea objetivo es recoger dos botellas, con una secuencia de agarre definida en el dataset («left first»).
- Ajuste eficiente con LoRA: los adaptadores de rango/alpha 16 (backbone) y 32 (experto) permiten reutilizar los pesos base y sustituir únicamente los adaptadores.
- Carga de checkpoint completa: el árbol de inferencia incluye pesos LoRA, pesos base y activos de normalización, de modo que puede desplegarse sin reconstruir la normalización por separado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código, visión general, audio ni modo de pensamiento; se trata de una política robótica especializada, no de un modelo de lenguaje de propósito general.

## Casos de uso

- Investigación en aprendizaje por imitación: el checkpoint sirve como punto de partida reproducible para estudiar el efecto del rango LoRA, el número de actualizaciones y el scheduler sobre una política PI0.5 en una tarea de manipulación concreta, dado que se conservan hashes de arrays decodificados y el paso exacto de optimizador.
- Réplica de experimentos: al estar fijados dataset (commit concreto), semilla (87431), batch global (16) y número de pasos (10.000), permite reproducir el entrenamiento de forma controlada en dos H100 de 80 GB.
- Evaluación de agarre doble en entornos controlados: la política está entrenada para la secuencia «left first» sobre dos botellas, de modo que resulta adecuada para banco de pruebas de planificación de agarre con dos objetos y no para tareas generales de pick-and-place.
- Base para nuevos ajustes LoRA: al publicarse el árbol de inferencia con LoRA y pesos base, un equipo puede partir de este checkpoint y reentrenar adaptadores para una tarea próxima, reduciendo el coste frente a un ajuste completo.
- Validación de pipelines OpenPI/JAX: sirve para verificar la carga de checkpoints Orbax en la raíz `10000/`, la coincidencia de activos de normalización y la integración con el entorno JAX sobre contenedores NGC PyTorch 25.02.
- Auditoría de normalización de datos: al no aplicarse delta transform ni conversión de unidades Aloha, el checkpoint es útil para estudiar cómo afecta la normalización absoluta por dataset a la estabilidad de las políticas visomotoras.
- Docencia y formación técnica: como ejemplo cerrado y de tamaño moderado (6,3 GB) de flujo completo de ajuste LoRA en robótica, desde la definición del dataset hasta las pruebas de guardado y recarga en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna tasa de éxito de rollout («No rollout success-rate claim»), por lo que no existen métricas de éxito de tarea, MMLU, HumanEval, GSM8K ni equivalentes para este checkpoint.

## Requisitos de hardware

- Entrenamiento documentado: dos GPU H100 de 80 GB, batch global 16, 10.000 actualizaciones, con activaciones en bf16 y parámetros entrenables en float32.
- VRAM de inferencia: no disponible. El único dato dimensional es el tamaño del repositorio (6,3 GB), que actúa como cota inferior del espacio necesario en disco para los pesos, pero no como medida de la memoria requerida en ejecución.
- GPU recomendadas: no disponibles para inferencia; el único hardware documentado es H100 de 80 GB en entrenamiento. No hay constancia de que quepa en GPU de consumo (RTX 4090 u otras), ni de que se haya probado.
- Opciones de despliegue: carga de checkpoints Orbax mediante OpenPI sobre JAX; el autor cita un contenedor NGC PyTorch 25.02 con un entorno JAX separado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, formatos propios de modelos de lenguaje en GGUF o safetensors, no del formato de pesos de este checkpoint.
- Latencia y throughput: no disponibles. El valor de 25 FPS corresponde a la captura del dataset de entrenamiento, no a la velocidad de inferencia del modelo.
- Almacenamiento y artefactos auxiliares: el repositorio incluye el árbol de parámetros completo (LoRA, base y normalización) y el directorio `10000/experiment/` con runtime, paquetes, configuración resuelta, commit y parche de origen, vinculación de GPU, manifiestos de base y dataset, estadísticas, pruebas de CPU y guardado, e historial del job.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travor278/pi05-pick-dual-bottles-left-first-lora-10k | no disponible | no aplica (política robótica) | sin métricas declaradas; sin tasa de éxito de rollout | no disponible | HuggingFace, 6,3 GB, 0 descargas, 0 likes |
| XinY0201/openpi-pi05-base-jax (modelo base del ajuste) | no disponible | no disponible | no disponible | no disponible | HuggingFace (referenciado como base, commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658) |
| Otros ajustes LoRA de PI0.5 | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos comparativos de rendimiento ni de especificaciones de alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia, por lo que el uso comercial y la redistribución quedan en un estado jurídico indeterminado y deben aclararse con el autor antes de cualquier despliegue productivo.
- Sin métricas de éxito: el autor no reclama ninguna tasa de éxito de rollout, de modo que no hay evidencia publicada de que la política funcione en el robot real.
- Especialización extrema: la política está entrenada para una única tarea y un único prompt («Pick up two bottles.»), con una secuencia de agarre concreta («left first»); no generaliza a otras instrucciones ni a otras tareas de manipulación.
- Sesgo de configuración experimental: los datos provienen de un único conjunto de 50 episodios y 15.643 fotogramas capturados a 25 FPS en una instalación concreta, con tres vistas RGB y una disposición de cámara específica; cambios de iluminación, posición de cámara u objetos pueden degradar el comportamiento.
- Dependencia del espacio de acción: se usan estados y acciones absolutos de 14 dimensiones nativas, sin delta transform ni conversión de unidades Aloha; la política no es directamente portable a plataformas con convenciones de acción distintas.
- Dependencia de la normalización: el checkpoint incluye sus propios activos de normalización derivados del dataset; aplicar una normalización diferente invalida el comportamiento esperado.
- Riesgo de sobreajuste: 10.000 actualizaciones sobre un dataset relativamente pequeño pueden producir sobreajuste a la escena de entrenamiento.
- Riesgo de alucinación en el sentido clásico: no aplica como en un modelo de lenguaje; el riesgo equivalente es la predicción de acciones incorrectas o inseguras sin señal de confianza asociada.
- Reproducibilidad parcial: el propio autor advierte que el contenedor NGC PyTorch 25.02 ejecuta un entorno JAX separado y que no se reclama identidad byte a byte con el runtime archivado histórico de CTR; los detalles completos están en `10000/experiment/`.
- Falta de validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin revisión externa conocida.
- Idiomas no declarados: no se especifica cobertura multilingüe; el condicionamiento lingüístico documentado es únicamente el prompt en inglés de la tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-pick-dual-bottles-left-first-lora-10k
- Modelo base referenciado (XinY0201/openpi-pi05-base-jax, commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658): https://huggingface.co/XinY0201/openpi-pi05-base-jax
- Dataset de entrenamiento (Shiki42/ctr-pick-dual-bottles-left-first-20260911, commit da5c6c49c1e04fbd0e55bf884f4c7c734cdf79ea): https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-left-first-20260911
- Framework openpi (referenciado por el campo `library_name` del modelo): https://github.com/Physical-Intelligence/openpi
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a sitios generalistas (Zhihu y foro DonanımHaber) sin relación con el checkpoint.
