# zekaili/pi05-baseline-foreact-coffee-eef-10k

## Resumen

`zekaili/pi05-baseline-foreact-coffee-eef-10k` es un checkpoint de ajuste fino del modelo base `lerobot/pi05_base` (la implementación de referencia de π0.5 en LeRobot), entrenado por el usuario zekaili dentro del repositorio FlashVLA. Se trata de un modelo de política visomotora (vision-language-action, VLA) orientado a robótica: recibe observaciones de estado del robot y tres vistas RGB, y emite comandos de efector final para un robot Galaxea R1Lite con brazos A1X. No es un modelo de lenguaje conversacional, sino un controlador de imitación entrenado sobre demostraciones reales de preparación de café.

El modelo resuelve una tarea concreta y acotada: la manipulación robótica multi-etapa de preparación de café, a partir de 399 episodios (258.562 fotogramas a 15 FPS) del dataset `zhuoyang20/foreact_coffee_making_data`. Su relevancia es doble: por un lado sirve como línea base reproducible (baseline) para comparar variantes de FlashVLA; por otro, documenta con inusual rigor el contrato de efector final, los frames de referencia y el proceso de normalización, lo que facilita la replicabilidad.

El repositorio contiene 4.143.404.816 parámetros (unos 4,14 mil millones) en formato safetensors, con un tamaño total de 33,1 GB. Aunque el nombre conserva el sufijo `-10k` por compatibilidad, la revisión actual contiene los pesos finales del paso 20.000 de entrenamiento. El modelo está publicado con licencia Gemma y solo declara inglés como idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5, implementación `PI05Policy` de FlashVLA sobre LeRobot; transformer multimodal con tokenizador PaliGemma |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados en fp32; entrenamiento en bf16) |
| Idiomas soportados | en |
| Licencia | Gemma (Gemma Terms of Use, sección 3.2 y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors (repositorio de 33,1 GB) |
| Libreria | lerobot (registrado también bajo FlashVLA) |
| Pipeline | robotics |
| Modelo base | lerobot/pi05_base (revisión `7de663972b7817d2c4cf2d84c821153dfea772e9`) |
| Dataset de entrenamiento | zhuoyang20/foreact_coffee_making_data (revisión `d821aa46f3b3cef05b9be73cbfdadec5fe18fa8b`) |
| Tokenizador | google/paligemma-3b-pt-224 (snapshot `35e4f46485b4d07967e7e9935bc3786aad50687c`) |
| Entradas | `observation.state` + 3 vistas RGB (`head_left_rgb`, `left_wrist_rgb`, `right_wrist_rgb`) |
| Salidas | 20 dimensiones de efector final absoluto (pose + gripper por brazo) |
| Chunk de acción | 50 acciones predichas / 16 ejecutadas |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del baseline `PI05Policy` del repositorio FlashVLA, que implementa la política π0.5 sobre LeRobot. La arquitectura combina un backbone de visión-lenguaje (tokenizador PaliGemma 3B, `google/paligemma-3b-pt-224`) con una cabeza de acciones que predice chunks de 50 acciones de efector final, de las cuales se ejecutan 16 en bucle cerrado. La representación de estado y acción es de 20 dimensiones absolutas de efector final: para cada brazo, `x_m, y_m, z_m, r00, r10, r20, r01, r11, r21, gripper_raw`, con los valores del brazo izquierdo primero. Las seis componentes de rotación son las dos primeras columnas de una matriz de rotación, que deben ortonormalizarse con Gram-Schmidt y completarse con el producto cruzado de la tercera columna. El frame de referencia compartido es `torso_link3` y los frames de herramienta son `left_gripper_link` y `right_gripper_link` del URDF oficial de A1X.

El entrenamiento se realizó sobre 399 episodios y 258.562 fotogramas a 15 FPS, provenientes de cinco carpetas del dataset (`0422_trimmed`, `0423-last38`, `0423_trimmed`, `0424`, `0425`) que cubren distintas etapas de la preparación de café. Se usó AdamW con LR pico de `5e-5`, 1.000 pasos de warmup y decaimiento coseno hasta `2.5e-7` en 20.000 pasos, batch global de 64 (8 GPUs × 4 muestras × acumulación 2), precisión bf16 con FSDP2 y pesos maestros en fp32, semilla 1000. La normalización de estado y acción usa cuantiles del dataset y se incluyen los ficheros de procesador correspondientes. El checkpoint final es el paso 20.000; la revisión de 10.000 pasos sigue accesible en el commit `13e200a`. El modelo incluye `eef_spec.json` con el orden exacto de features, revisión del URDF, SHA256 y huella de datos derivados, además de `training_metadata.json` y `train_config.json` con procedencia y configuración portable.

## Capacidades

- Control robótico visomotor para manipulación de precisión: genera comandos de efector final de 20 dimensiones a partir de estado medido y tres vistas RGB.
- Ejecución de tareas multi-etapa de preparación de café (las cinco carpetas del dataset cubren distintas fases del proceso).
- Predicción de chunks de acción (50 acciones) con ejecución parcial (16), lo que permite control en bucle cerrado con replanificación.
- Manejo de dos brazos (A1X izquierdo y derecho) con poses absolutas en un frame de torso compartido.
- Integración con el stack LeRobot 0.5.1 y FlashVLA para carga, preprocesado y postprocesado.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural: es una política de imitación, no un agente conversacional.
- Capacidades multilingües: solo inglés declarado, y únicamente en la medida en que el tokenizador PaliGemma procesa etiquetas de tarea.
- No dispone de modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso

- Línea base reproducible para investigación en VLA: sirve para comparar variantes de FlashVLA sobre la misma tarea y dataset, con métricas registradas en W&B (run `17f0b85b`) y configuración de entrenamiento publicada.
- Automatización de una celda de preparación de café: el modelo controla un Galaxea R1Lite con brazos A1X para ejecutar las etapas cubiertas por el dataset, usando las tres cámaras (cabeza y muñecas) como entrada.
- Estudio de representaciones de efector final: el contrato documentado (frame `torso_link3`, tool frames del URDF, orden de features y Gram-Schmidt) permite evaluar el impacto de distintas convenciones de pose en el rendimiento.
- Transferencia a tareas de manipulación con dos brazos: el esquema de 20 dimensiones (10 por brazo) es reutilizable para otras tareas bimanuales que compartan el mismo contrato de efector final.
- Evaluación de imitación con chunks de acción: útil para medir el compromiso entre horizonte de predicción (50) y horizonte de ejecución (16) en tareas de contacto.
- Docencia y divulgación en robótica de imitación: el repositorio incluye procedencia, hashes y metadatos que facilitan reproducir el pipeline completo con LeRobot y FlashVLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia métricas de entrenamiento en W&B (run `17f0b85b`), sin tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,14 mil millones de parámetros en fp32, los pesos ocupan aproximadamente 16,6 GB; en bf16/fp16, unos 8,3 GB, a lo que hay que sumar activaciones del backbone PaliGemma y las tres vistas RGB.
- GPU recomendadas: no declaradas por el autor. El entrenamiento se realizó con 8 GPUs (FSDP2, bf16), pero no se especifica el modelo concreto.
- Cabe en GPU de consumo: previsiblemente sí en fp16/bf16 en tarjetas con 16-24 GB (RTX 4090, RTX 3090), aunque no está verificado en la información disponible.
- Opciones de despliegue: carga mediante `PI05Policy.from_pretrained` del repositorio FlashVLA (revisión de código `8539f1cdfcf878e3a93c39f3d6c885c19ede6af8`), con LeRobot 0.5.1, Transformers 5.3.0, PyTorch 2.9.1 y Accelerate 1.15.0. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política VLA).
- Latencia y throughput: no disponibles. La ejecución real requiere además una integración de cinemática inversa y control con los mismos frames de referencia y herramienta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zekaili/pi05-baseline-foreact-coffee-eef-10k | 4,14 B | no disponible | VLA de imitación para preparación de café (R1Lite + A1X) | Gemma | Hugging Face, 28 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | Política VLA base π0.5 en LeRobot | no disponible en la información | Hugging Face |
| Otras variantes FlashVLA del mismo autor (p. ej. revisión 10k) | mismas que el baseline | no disponible | misma tarea, checkpoint anterior | Gemma | Hugging Face (commit `13e200a`) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de política de imitación: no es un modelo de lenguaje general; no responde a prompts de texto ni mantiene conversaciones.
- Sesgos y sobreajuste al dominio: entrenado exclusivamente con 399 episodios de preparación de café en un robot Galaxea R1Lite con brazos A1X; el rendimiento fuera de esa configuración, cocina o conjunto de cámaras no está caracterizado.
- Dependencia estricta del contrato de efector final: usar otro frame de referencia, otro URDF o un orden de features distinto invalida las predicciones. Es obligatorio respetar `eef_spec.json` y el frame `torso_link3`.
- Riesgo de alucinación en el sentido de acciones no válidas: al ser un modelo generativo de acciones, puede producir comandos fuera de rango o inconsistentes; se recomienda validación cinemática y límites de seguridad en el controlador.
- Idioma: solo inglés declarado; las etiquetas de tarea están en inglés (`coffee making`).
- Licencia Gemma: el uso y la distribución están sujetos a la sección 3.2 de los Gemma Terms of Use y a la Gemma Prohibited Use Policy; es necesario conservar `LICENSE` y `NOTICE` con la descripción de modificaciones.
- Procedencia y revisiones: el nombre del repositorio (`-10k`) no coincide con el contenido actual (paso 20.000); hay que fijar la revisión al desplegar para evitar ambigüedad.
- `inference: false` declarado en la model card: no se garantiza una inferencia lista para usar sin el stack FlashVLA y la integración de cinemática inversa.
- Sin benchmarks publicados: no hay evidencia numérica de tasa de éxito que permita estimar fiabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zekaili/pi05-baseline-foreact-coffee-eef-10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/zhuoyang20/foreact_coffee_making_data
- Repositorio FlashVLA: https://github.com/z-lab/flashvla
- Revisión de 10.000 pasos: https://huggingface.co/zekaili/pi05-baseline-foreact-coffee-eef-a1x-c50-a16-10k/tree/13e200a5a825881961661c51ecda5cd0828af841
- Métricas de entrenamiento (W&B): https://wandb.ai/lzknus/flashvla-coffee-making/runs/17f0b85b
- Tokenizador PaliGemma: https://huggingface.co/google/paligemma-3b-pt-224
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
