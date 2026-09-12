# Travor278/pi05-pick-dual-bottles-right-first-lora-10k

## Resumen

`Travor278/pi05-pick-dual-bottles-right-first-lora-10k` es un ajuste fino mediante LoRA del modelo robótico PI0.5 (pi0.5) en su implementación JAX de OpenPI, publicado por el usuario Travor278 en Hugging Face. Se trata de un modelo visión-lenguaje-acción (VLA) que recibe imágenes de tres cámaras RGB junto con una instrucción en lenguaje natural y produce directamente acciones motoras de 14 dimensiones en formato absoluto. La tarea concreta para la que se ha entrenado es "Pick up two bottles" (recoger dos botellas).

El modelo parte del checkpoint base `XinY0201/openpi-pi05-base-jax` (commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`) y añade adaptadores LoRA sobre PaliGemma (rango y alpha 16, expert 32) manteniendo el resto de pesos congelados. El repositorio ocupa 6,3 GB e incluye el árbol completo de parámetros de inferencia (base más LoRA) junto con los activos de normalización; el estado del optimizador se conserva en la plataforma de entrenamiento y no se distribuye. No se declara licencia, idiomas soportados ni resultados de benchmarks.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino con LoRA de un VLA sobre un dataset propio de 50 episodios, con registro detallado de configuración, semilla, hiperparámetros y verificaciones de integridad. No obstante, el propio autor indica que no reclama ninguna tasa de éxito de rollout, por lo que debe tratarse como un artefacto de investigación más que como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) PI0.5 en JAX; base PaliGemma con un action expert estándar único y adaptadores LoRA |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (el horizonte de acciones es de 50 pasos y el padding de 32) |
| Tipos de cuantizacion | no disponible; entrenamiento en bf16 (activaciones y pesos congelados) y float32 (pesos entrenables) |
| Idiomas soportados | no disponible; el único prompt nativo documentado es en inglés: "Pick up two bottles." |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax (JAX), raíz `10000/`; no se distribuyen safetensors ni GGUF |
| Dimension de acciones/estado | 14 dimensiones, valores absolutos (sin conversión delta ni unidades Aloha) |
| Entradas de percepción | Tres cámaras RGB, preprocesado estándar 224x224 |
| Dataset de entrenamiento | `Shiki42/ctr-pick-dual-bottles-right-first-20260911` (50 episodios, 15 643 fotogramas a 25 FPS) |
| Hardware de entrenamiento | 2 x H100 80 GB |
| Tamano del repositorio | 6,3 GB |
| Libreria / framework | openpi (JAX) |
| Fecha de creacion (metadatos) | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es la de PI0.5 en JAX: un backbone PaliGemma (codificador visual SigLIP más modelo de lenguaje Gemma) acoplado a un módulo experto en acciones que genera trayectorias de control. En este ajuste se congela el modelo base y se entrenan adaptadores LoRA con rango y alpha 16 sobre PaliGemma y 32 sobre el experto, con un filtro de referencia que incluye las proyecciones y las partes entrenables de visión. Las activaciones y los pesos congelados se mantienen en bf16, mientras que los pesos entrenables se guardan en float32.

El entrenamiento se realizó sobre el dataset `ctr-pick-dual-bottles-right-first-20260911` (50 episodios, 15 643 fotogramas a 25 FPS), con acciones y estados absolutos de 14 dimensiones, tres cámaras RGB, preprocesado 224x224, `pad32` y horizonte 50. No se aplicó conversión de unidades tipo Aloha ni enmascarado de reposo (idle mask). La configuración fue: 2 x H100 80 GB, batch global 16, semilla 87431, 10 000 actualizaciones con AdamW (b1 = 0,9, b2 = 0,95, eps = 1e-8, weight decay 1e-10, clip 1, sin EMA) y un plan coseno de 30 000 pasos con 1000 de warmup, pico 2,5e-5 y final 2,5e-6, detenido en el paso 10 000. El autor declara que se superaron las puertas de guardado y recarga en CPU, que los árboles de parámetros y de optimizador se restauraron estrictamente y se verificaron como finitos, y que el paso de optimizador 10 000 está verificado, con hashes y recibos incluidos. El entorno NGC PyTorch 25.02 ejecuta un runtime JAX construido por separado, y el autor advierte que no afirma que sea idéntico al runtime archivado de CTR.

## Capacidades

- Generación de acciones robóticas de 14 dimensiones en valores absolutos a partir de observaciones visuales y una instrucción textual.
- Percepción multimodal con tres cámaras RGB simultáneas a resolución 224x224.
- Seguimiento de instrucciones en lenguaje natural, con el prompt nativo de entrenamiento "Pick up two bottles.".
- Ejecución de una tarea de manipulación concreta: recogida de dos botellas con orden preferente por la derecha ("right-first").
- Planificación de secuencias de acción de hasta 50 pasos (horizonte de acción) con padding de 32.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso simbólico.
- No se documentan capacidades multilingües.
- No se documentan modos de pensamiento (thinking mode), audio ni visión generalista fuera del pipeline robótico.

## Casos de uso

- Recogida de dos botellas en una célula robotizada: el modelo convierte las imágenes de las tres cámaras en una secuencia de acciones absolutas de 14 dimensiones, adecuada para una estación con efector tipo pinza en la que la tarea esté acotada a esa instrucción.
- Investigación en ajuste fino de VLA: sirve como receta reproducible de LoRA sobre PI0.5, con semilla, hiperparámetros, plan de learning rate y verificaciones de integridad documentados, útil para replicar o comparar estrategias de adaptación.
- Punto de partida para nuevas tareas de manipulación: al conservar el árbol completo base más LoRA y los activos de normalización, permite entrenar adaptadores adicionales para variantes de la misma escena sin partir del checkpoint base.
- Evaluación de robustez ante cambios de escena: con 50 episodios y un único prompt, es un caso de estudio útil para medir la degradación al variar iluminación, posición de las botellas o colocación de las cámaras.
- Pruebas de infraestructura JAX/Orbax en robótica: el checkpoint permite validar pipelines de carga, normalización y ejecución de políticas en formato Orbax dentro del ecosistema openpi.
- Estudios de ablación sobre preprocesado: al documentarse explícitamente la ausencia de conversión a unidades Aloha, de deltas y de idle mask, el modelo facilita comparar configuraciones alternativas de representación de acciones.
- Docencia y demostraciones de VLA: su tamaño de repositorio (6,3 GB) y su naturaleza de tarea única lo hacen manejable para sesiones prácticas sobre el flujo completo de inferencia de una política robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica expresamente que no reclama ninguna tasa de éxito de rollout ("No rollout success-rate claim"), por lo que no existen cifras verificables de éxito de tarea, ni comparaciones con otros modelos en MMLU, HumanEval, GSM8K u otras suites. Tampoco se proporcionan métricas de latencia, throughput ni de error de seguimiento de trayectoria.

## Requisitos de hardware

- Entrenamiento: el autor empleó 2 GPU H100 de 80 GB, batch global 16 y 10 000 actualizaciones.
- VRAM de inferencia: no disponible. El repositorio contiene 6,3 GB de parámetros y activos de normalización, cifra que da una referencia del orden de magnitud del footprint de pesos, pero el autor no publica requisitos de memoria en inferencia.
- GPU recomendadas: no confirmadas por el autor. El entrenamiento se realizó en H100; no hay datos publicados sobre A100, L40S u otras.
- Compatibilidad con GPU de consumo: no confirmada. Un repositorio de 6,3 GB es compatible en términos de almacenamiento con GPU de 24 GB (por ejemplo RTX 3090 o RTX 4090), pero se desconoce el overhead real de activaciones, buffers de las tres cámaras y estructuras de JAX.
- Opciones de despliegue: el formato Orbax obliga a usar el stack openpi/JAX para cargar el checkpoint. Herramientas orientadas a modelos de texto como vLLM, llama.cpp, Ollama o TGI no son aplicables a este artefacto en su formato actual.
- Latencia y throughput: no disponible.
- Almacenamiento: 6,3 GB para el repositorio; el estado del optimizador no se incluye.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Travor278/pi05-pick-dual-bottles-right-first-lora-10k` | no disponible | Horizonte de acción 50 pasos | Orbax (JAX) | no disponible | Publicado en Hugging Face; 0 descargas y 0 likes en la información disponible |
| `XinY0201/openpi-pi05-base-jax` (checkpoint base) | no disponible | no disponible | Orbax (JAX) | no disponible | Referenciado como base en la model card, en el commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658` |
| Otras alternativas de la misma categoría (por ejemplo VLA generalistas tipo OpenVLA o GR00T N1.5) | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos verificables en la búsqueda web realizada |

La búsqueda web asociada a esta ficha no devolvió resultados relevantes: los enlaces obtenidos corresponden a cuentas de redes sociales y tiendas de merchandising ajenas por completo al modelo. Por tanto, no hay datos comparativos verificables con otros VLA en la información disponible.

## Limitaciones y advertencias

- Ausencia de métricas de éxito: el autor declara explícitamente que no reclama ninguna tasa de éxito de rollout, por lo que no hay evidencia publicada de que la política funcione de forma fiable en un robot real.
- Dataset muy reducido y de una sola tarea: 50 episodios, 15 643 fotogramas y un único prompt ("Pick up two bottles."), lo que limita la generalización a variaciones de escena, objetos o instrucciones.
- Riesgo de sobreajuste: al entrenarse sobre una escena concreta con tres cámaras fijas, el modelo puede depender de la disposición exacta de las cámaras, la iluminación y la posición inicial de las botellas.
- Licencia no especificada: al no declararse licencia, no se conceden derechos explícitos de uso comercial; cualquier despliegue en producción requiere aclarar previamente las condiciones legales.
- Idiomas: solo se documenta un prompt en inglés; no hay datos sobre comportamiento con instrucciones en castellano u otros idiomas.
- Representación de acciones rígida: acciones absolutas de 14 dimensiones, sin conversión delta, sin unidades Aloha y sin idle mask, lo que obliga a que el entorno de despliegue coincida con las convenciones del dataset.
- Formato poco portable: el checkpoint Orbax no es directamente utilizable en los runners habituales de modelos de texto (vLLM, llama.cpp, Ollama, TGI).
- Entorno de ejecución no equivalente al archivado: el autor advierte que el runtime JAX construido sobre NGC PyTorch 25.02 no se reclama idéntico al runtime antiguo de CTR.
- Estado del optimizador no incluido: el repositorio solo contiene el árbol de parámetros de inferencia, por lo que no es posible reanudar el entrenamiento tal cual desde el propio artefacto.
- Sin validación comunitaria: 0 descargas y 0 likes en la información disponible, sin evidencia externa de reproducción independiente.
- Metadatos inconsistentes: las fechas de creación y actualización registradas (2026-09-12) son posteriores a la fecha de consulta habitual, lo que sugiere posible inconsistencia en los metadatos.
- Riesgo de acciones fuera de distribución: al ser una política de control, los fallos se manifiestan como trayectorias motoras incorrectas, con el consiguiente riesgo físico si se despliega sin supervisión ni paradas de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Travor278/pi05-pick-dual-bottles-right-first-lora-10k
- Checkpoint base referenciado (PI0.5 JAX): https://huggingface.co/XinY0201/openpi-pi05-base-jax (commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`)
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-right-first-20260911 (commit `f0745c8ffdd63e1af44cf252a20274238998dfb1`)
- Framework openpi (referencia del formato de checkpoint y del pipeline): https://github.com/Physical-Intelligence/openpi
- Resultados de la búsqueda web: sin enlaces relevantes al modelo; los resultados devueltos corresponden a cuentas de Instagram y TikTok y a tiendas de merchandising sin relación con este artefacto.
