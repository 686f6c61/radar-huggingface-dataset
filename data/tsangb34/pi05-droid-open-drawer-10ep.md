# tsangb34/pi05-droid-open-drawer-10ep

## Resumen

`tsangb34/pi05-droid-open-drawer-10ep` es una política robótica de tipo Vision-Language-Action (VLA) publicada en el Hub de Hugging Face y obtenida por fine-tuning de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence. No es un modelo de lenguaje conversacional: recibe observaciones multimodales de un robot (estado articular, posición cartesiana y tres flujos de imagen) y emite un vector de acción de 8 dimensiones para controlar un brazo Franka. El modelo resuelve una única tarea de manipulación, "open drawer" (abrir un cajón), aprendida por imitación a partir de un dataset local de 100 episodios y 38.884 fotogramas grabados a 30 FPS.

La relevancia de esta ficha es doble. Por un lado, documenta el flujo completo de LeRobot 0.6.1 para llevar un VLA preentrenado de 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) a una tarea concreta con 12.160 pasos de entrenamiento, batch de 32 y tasa de aprendizaje 2,5e-05. Por otro, sirve como ejemplo de artefacto de investigación reproducible con licencia Apache 2.0, pesos en safetensors y un repositorio de 9,4 GB.

Conviene subir al detalle con expectativas realistas: el autor no ha publicado ninguna evaluación en robot real, el modelo solo se ha entrenado para una tarea y su dataset de entrenamiento no es públicamente resoluble en el Hub (referencia `local/droid-open-drawer-left-wrist`). Además, el nombre del repositorio sugiere "10ep" mientras que la model card declara 100 episodios, una discrepancia que debe verificarse antes de reutilizar la política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (evolución de π₀); el detalle exacto del backbone visual-lenguaje y del cabezal de acciones no se especifica en la información proporcionada |
| Parametros totales | 4.143.404.816 (≈4,14 B), según safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no expone ventana de contexto de texto. Entrada compuesta por `observation.state` (8), `observation.cartesian_position` (6) y tres imágenes: `left_image` (3×360×640), `wrist` (3×360×640) y `empty_camera_0` (3×224×224) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas declaradas |
| Idiomas soportados | no disponibles; la instrucción de tarea empleada es "open drawer" en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`), repositorio de 9,4 GB |
| Salida | `action`, vector de 8 dimensiones |
| Tipo de robot | `franka` (configuración declarada en la model card) |
| Cámaras declaradas | `left_image`, `wrist`, `empty_camera_0` |
| Modelo base | `lerobot/pi05_base` |
| Versión de LeRobot | 0.6.1 |
| Pipeline del Hub | robotics |

## Arquitectura y entrenamiento

El modelo es una política VLA: combina observaciones visuales y propioceptivas con una instrucción en lenguaje natural para producir acciones motoras directamente. La model card lo describe como una evolución de π₀ orientada a la generalización en entornos y situaciones no vistos durante el entrenamiento, y señala que la implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. La información disponible no detalla el número de capas, el backbone de visión-lenguaje concreto, el mecanismo de generación de acciones ni el esquema de atención, por lo que esos extremos quedan como "no disponible".

El entrenamiento es de imitación supervisada sobre el dataset `local/droid-open-drawer-left-wrist`: 100 episodios, 38.884 fotogramas a 30 FPS, una única tarea ("open drawer") y una configuración de 12.160 pasos, batch de 32, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, ejecutada con LeRobot 0.6.1. No se documenta en la información proporcionada si hubo etapas de RLHF, DPO u otro ajuste posterior al preentrenamiento del modelo base.

Un detalle técnico relevante para reproducir la inferencia: entre las entradas declaradas figura `observation.images.empty_camera_0` con resolución 3×224×224, es decir, un slot de cámara vacío heredado de la configuración de recogida de datos. Cualquier despliegue debe proporcionar esa clave con la forma correcta (por ejemplo, un tensor de ceros) para que las claves de observación coincidan con las usadas en el entrenamiento.

## Capacidades

- Control robótico de manipulación: genera acciones de 8 dimensiones para un brazo Franka a partir de estado articular y cartesiano.
- Ejecución de una tarea específica de imitación: apertura de cajones ("open drawer") en el dominio del dataset DROID utilizado.
- Fusión de múltiples vistas: procesa simultáneamente una cámara cenital/lateral (`left_image`), una cámara en la muñeca (`wrist`) y un tercer flujo visual de 224×224.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como texto en el comando de rollout (`--task="open drawer"`).
- Punto de partida para fine-tuning: puede reentrenarse con `lerobot-train` sobre datasets propios partiendo de `lerobot/pi05_base` o de esta política.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`, y con el registro de experimentos vía Weights & Biases.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto libre; no es un modelo de propósito general.

## Casos de uso

- Automatización de una tarea de manipulación en laboratorio: desplegar la política con `lerobot-rollout` sobre un Franka calibrado para abrir cajones de forma repetida y medir la tasa de éxito real, que el autor aún no ha publicado.
- Base para fine-tuning con datos propios: usar esta política como inicialización cuando el dominio sea similar (cajones, tiradores, escena DROID) y reducir así el número de episodios necesarios frente a entrenar desde `pi05_base`.
- Comparación de estrategias de imitación: servir de referencia frente a ACT o Diffusion Policy en experimentos controlados dentro de LeRobot, manteniendo el mismo dataset y protocolo de evaluación.
- Generación de datos sintéticos de evaluación: ejecutar la política en bucle para caracterizar modos de fallo (agarre del tirador, colisiones, desalineación) antes de invertir en más recogida de datos.
- Docencia y formación en VLA: el flujo completo (instalación, calibración, rollout, entrenamiento) está documentado y permite explicar de extremo a extremo cómo se pasa de un modelo preentrenado a una política funcional.
- Prototipado de asistentes domésticos: como componente de manipulación para abrir cajones dentro de un pipeline mayor de tareas domésticas, siempre que se valide la generalización a cajones y cocinas distintas de las del dataset.
- Auditoría de reproducibilidad: analizar los pesos publicados para estudiar cómo se comporta un VLA de ~4,14 B parámetros con un presupuesto de entrenamiento relativamente pequeño (12.160 pasos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", e incluye una plantilla de tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) sin rellenar. Tampoco se aportan métricas de pérdida de entrenamiento, tasas de éxito en robot real ni comparaciones con otras políticas.

| Benchmark | Resultado |
|---|---|
| Evaluación en robot real (tasa de éxito) | no disponible |
| Pérdida final de entrenamiento | no disponible |
| Métricas del modelo base π₀.₅ | no disponibles en esta información (consultar el repositorio de `lerobot/pi05_base` y OpenPI) |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 4.143.404.816 parámetros: ~16,6 GB en FP32, ~8,3 GB en BF16/FP16, ~4,1 GB en INT8 y ~2,1 GB en INT4. A ello hay que sumar el coste de los tres flujos de imagen y del bucle de control, por lo que un presupuesto práctico razonable en BF16 ronda los 10-12 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para entrenamiento y evaluación por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia y fine-tuning ligero; RTX 4080/A5000 (16 GB) al límite en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 4080/A6000 con pesos en BF16. En GPUs de 8 GB solo sería viable con cuantización, que el repositorio no publica.
- Despliegue: `lerobot-rollout` y `lerobot-train` (LeRobot 0.6.1) sobre PyTorch con CUDA. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de exigencia, el dataset se grabó a 30 FPS (33 ms por fotograma), por lo que el bucle de control debe sostener una frecuencia comparable para reproducir la dinámica entrenada.
- Almacenamiento: 9,4 GB para el repositorio de pesos, más el espacio de checkpoints si se reentrena (batch 32 y AdamW implican estados de optimizador del orden de decenas de GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Estado |
|---|---|---|---|---|
| `tsangb34/pi05-droid-open-drawer-10ep` | 4,14 B | VLA (π₀.₅) afinado para "open drawer" | Apache 2.0 | Pesos públicos, sin evaluación |
| `lerobot/pi05_base` | no disponible en esta información (misma familia π₀.₅) | VLA preentrenado de propósito general | no disponible en esta información | Público en el Hub, referenciado como modelo base |
| π₀ (Physical Intelligence) | no disponible | VLA predecesor de π₀.₅ | no disponible en esta información | Referenciado en la model card vía OpenPI |
| ACT / Diffusion Policy (LeRobot) | no disponible | Políticas de imitación específicas por tarea | no disponible en esta información | Alternativas del mismo ecosistema, sin comparación numérica disponible |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada; cualquier comparación cuantitativa requeriría ejecutar el mismo protocolo de evaluación en robot real.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de dificultad. Cualquier despliegue parte sin evidencia empírica de funcionamiento.
- Especialización extrema: entrenado únicamente para la tarea "open drawer", con una única configuración de robot (`franka`), dos cámaras reales y una tercera vacía. No es un modelo de propósito general pese a la retórica de "open-world generalization" del modelo base.
- Discrepancia en el nombre: el repositorio se llama "10ep" pero la model card declara 100 episodios y 38.884 fotogramas. Conviene verificar el dato antes de citarlo.
- Dataset no resoluble: la referencia `local/droid-open-drawer-left-wrist` apunta a una ruta local, no a un dataset público del Hub, lo que impide reproducir el entrenamiento tal cual.
- Riesgo de sobreajuste al entorno: con 100 episodios de una sola tarea, es esperable un mal comportamiento ante cambios de iluminación, posición del cajón, tipo de tirador o robot distinto. No hay datos que cuantifiquen esta degradación.
- Sin datos de sesgo ni de alucinación en el sentido lingüístico; el riesgo equivalente es la ejecución de acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento.
- Seguridad física: es una política de control motor real. Debe ejecutarse con límites de par, paradas de emergencia y espacio de trabajo despejado; el repositorio no incluye capas de seguridad.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no exime de las licencias de terceros que puedan afectar al modelo base o al dataset DROID de origen.
- Requisito de coincidencia exacta de claves de observación: si los nombres o las formas de las cámaras no coinciden con `left_image`, `wrist` y `empty_camera_0`, la inferencia fallará.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/pi05-droid-open-drawer-10ep
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset de entrenamiento (referencia local, no resoluble públicamente): https://huggingface.co/datasets/local/droid-open-drawer-left-wrist
