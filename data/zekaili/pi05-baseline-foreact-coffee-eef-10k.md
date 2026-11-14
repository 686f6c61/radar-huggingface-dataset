# zekaili/pi05-baseline-foreact-coffee-eef-10k

## Resumen

π0.5 baseline ForeAct Coffee Making es un checkpoint de investigación del modelo de política robótica π0.5 (PI05Policy), desarrollado por el autor zekaili sobre el repositorio FlashVLA y afinado desde `lerobot/pi05_base`. Se trata de un modelo de imitación (imitation learning) especializado en la tarea de preparar café con un robot Galaxea R1Lite equipado con brazos A1X, entrenado sobre 399 episodios y 258.562 fotogramas a 15 FPS del dataset `zhuoyang20/foreact_coffee_making_data`.

El modelo no es un LLM conversacional: es una política visomotora que, a partir del estado del robot y de tres vistas RGB (cabeza y dos muñecas), predice secuencias de acciones en el espacio de efector final (20 dimensiones absolutas). El checkpoint publicado corresponde al paso 10.000 de un entrenamiento planificado hasta 20.000 pasos, y su interés radica en servir como línea base reproducible para investigación en manipulación robótica con modelos visión-lenguaje-acción (VLA).

Con 4.143.404.816 parámetros y un repositorio de 16,6 GB, hereda la arquitectura y la licencia Gemma del modelo base π0.5 de Physical Intelligence, distribuido a través de LeRobot. La model card marca explícitamente `inference: false`, por lo que debe considerarse material de entrenamiento y evaluación, no un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) π0.5, política `PI05Policy` del repositorio FlashVLA |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (procesa estado + 3 vistas RGB; sin ventana de contexto textual publicada) |
| Tipos de cuantización | no disponible (pesos exportados en fp32; entrenamiento en bf16 con pesos maestros fp32) |
| Idiomas soportados | en (etiqueta de tarea `coffee making` en inglés) |
| Licencia | Gemma Terms of Use (heredada del modelo base) |
| Formato de pesos | safetensors (librería `lerobot`; repo de 16,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` (revisión `7de663972b7817d2c4cf2d84c821153dfea772e9`) y se afina con el `PI05Policy` de FlashVLA usando inicialización por defecto. La entrada combina `observation.state` con tres vistas RGB (`head_left_rgb`, `left_wrist_rgb`, `right_wrist_rgb`); el tokenizador asociado es `google/paligemma-3b-pt-224`, lo que sitúa la base lingüístico-visual en la familia PaliGemma. El estado y la acción se normalizan por cuantiles del dataset, con los ficheros de procesador incluidos en el repositorio.

El entrenamiento usó 8 GPUs con batch global 64 (4 muestras por GPU × acumulación 2), AdamW con LR pico `5e-5`, 1.000 pasos de warmup y decaimiento coseno hasta `2.5e-7` en 20.000 pasos, precisión bf16 con FSDP2 y pesos maestros fp32, semilla 1000. El dataset cubre cinco carpetas (`0422_trimmed`, `0423-last38`, `0423_trimmed`, `0424`, `0425`) con distintas fases de la preparación del café, conservando fronteras de episodio y la etiqueta de tarea única `coffee making`. La acción se representa como chunk de 50 acciones predichas con 16 ejecutadas, en un contrato de efector final de 20 dimensiones (10 por brazo: `x, y, z`, seis valores de rotación y `gripper_raw`), con marco de referencia `torso_link3` y marcos de herramienta `left_gripper_link` y `right_gripper_link` del URDF oficial A1X. Las poses de estado se derivan de articulaciones medidas y las de acción de articulaciones objetivo comandadas.

## Capacidades

- Generación de acciones robóticas de manipulación (chunks de 50 acciones, 16 ejecutadas) en el espacio de efector final para dos brazos.
- Percepción visomotora a partir de tres cámaras RGB simultáneas (cabeza y muñecas izquierda y derecha).
- Ejecución de una tarea de manipulación de largo horizonte: preparación de café en varias fases.
- Control de pinza mediante el canal `gripper_raw` en unidades originales del dataset.
- Integración con cinemática inversa y control del robot mediante el mismo marco de referencia y marcos de herramienta.
- No soporta tool calling, function calling, agentes multi-paso textuales ni modo thinking: es una política de imitación, no un modelo de lenguaje.
- Capacidad multilingüe: no disponible; la única etiqueta de tarea está en inglés.

## Casos de uso

- Línea base reproducible para investigación en VLA: sirve para comparar variantes de política (por ejemplo, cambios en el chunk de acción o en el preprocesado) contra un checkpoint fijo de 10.000 pasos con configuración documentada.
- Estudio de imitación en tareas de largo horizonte: la preparación de café encadena varias fases, lo que permite analizar degradación del error a lo largo de la secuencia con 399 episodios de entrenamiento.
- Evaluación de representaciones de efector final: el contrato de 20 dimensiones con rotación de dos columnas y ortonormalización por Gram-Schmidt permite comparar esta parametrización frente a alternativas de cuaterniones o matrices completas.
- Réplica de experimentos con FlashVLA: el repositorio incluye revisión de código, configuración portable y metadatos de procedencia, lo que facilita reproducir el entrenamiento en clústeres con FSDP2.
- Análisis de sensibilidad a vistas de cámara: al depender de tres cámaras concretas, se puede medir el impacto de eliminar o sustituir vistas en el rendimiento de la política.
- Docencia y formación en robótica de manipulación: como ejemplo completo de pipeline LeRobot (dataset, normalización por cuantiles, entrenamiento distribuido y exportación fp32) para cursos avanzados.
- Punto de partida para afinado en dominios cercanos: al ser un fine-tune de `pi05_base`, puede servir como inicialización para tareas de manipulación con brazos A1X.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia una ejecución de W&B (run `17f0b85b`) con métricas de entrenamiento, sin tablas de éxito en tarea ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.143 millones de parámetros, en fp32 los pesos ocupan aproximadamente 16,6 GB, por lo que se necesita al menos una GPU de 24 GB para cargar el checkpoint tal cual.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación desatendida; una RTX 4090 (24 GB) es el mínimo razonable para inferencia en fp32.
- Cabe en GPU de consumo: sí, en RTX 4090 o superiores con 24 GB; en GPUs de 16 GB requeriría cuantización, que no está documentada para este checkpoint.
- Opciones de despliegue: el código de referencia es FlashVLA (`flashvla.policies.pi05.modeling_pi05.PI05Policy`) con LeRobot 0.5.1, Transformers 5.3.0, PyTorch 2.9.1 y Accelerate 1.15.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas VLA de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 baseline ForeAct Coffee Making (este) | 4.143 M | no disponible | Manipulación (café) con R1Lite/A1X | Gemma | Hugging Face, repo 16,6 GB |
| `lerobot/pi05_base` | no disponible en la información | no disponible | Política VLA generalista | Gemma | Hugging Face (LeRobot) |
| Otras políticas VLA de LeRobot (p. ej. familias π0, SmolVLA) | no disponible | no disponible | Manipulación general | variable según modelo | Hugging Face (LeRobot) |

La información proporcionada no incluye datos de rendimiento de alternativas, por lo que la comparación se limita a procedencia, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación: la model card declara `inference: false`; no está validado para despliegue en producción.
- Checkpoint intermedio: corresponde al paso 10.000 de un entrenamiento previsto hasta 20.000, por lo que no representa el resultado final de la receta.
- Especialización estrecha: entrenado solo en preparación de café con un robot Galaxea R1Lite y brazos A1X; no generaliza a otras tareas, morfologías ni entornos sin nuevo afinado.
- Dependencia del contrato de efector final: cualquier desviación en el orden de características, marco de referencia (`torso_link3`), URDF o unidades de la pinza invalida las acciones predichas.
- Dependencia de las tres vistas RGB concretas y de la normalización por cuantiles del dataset original; cambiar cámaras o calibración degrada el comportamiento.
- Idioma: solo etiqueta de tarea en inglés; no hay capacidades multilingües.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones fuera de distribución y de fallos silenciosos en fases no representadas en el dataset.
- Sesgos: no documentados; el dataset cubre cinco carpetas con condiciones de captura limitadas, lo que puede introducir sesgo hacia esas condiciones de iluminación y disposición de objetos.
- Licencia Gemma: el uso y la distribución están sujetos a la Sección 3.2 de los Gemma Terms of Use y a la Gemma Prohibited Use Policy; es obligatorio conservar `LICENSE` y `NOTICE` con la descripción de modificaciones.
- Sin cuantizaciones publicadas ni benchmarks de éxito en tarea, lo que dificulta estimar el rendimiento real antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zekaili/pi05-baseline-foreact-coffee-eef-10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zhuoyang20/foreact_coffee_making_data
- Repositorio FlashVLA: https://github.com/z-lab/flashvla
- Tokenizador PaliGemma: https://huggingface.co/google/paligemma-3b-pt-224
- Métricas de entrenamiento (W&B): https://wandb.ai/lzknus/flashvla-coffee-making/runs/17f0b85b
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
