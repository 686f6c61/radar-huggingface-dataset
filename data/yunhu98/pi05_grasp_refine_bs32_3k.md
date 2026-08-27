# Yunhu98/pi05_grasp_refine_bs32_3k

## Resumen

Este repositorio contiene un ajuste fino del modelo π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado al ecosistema LeRobot de Hugging Face. El modelo base, `lerobot/pi05_base`, es la versión open source de π₀.₅, publicada en septiembre de 2025 como evolución de π₀ para mejorar la generalización a entornos y situaciones no vistos durante el entrenamiento.

El ajuste fino se ha realizado sobre un dataset de 100 episodios (30 200 frames a 30 FPS) con la tarea de recoger un cubo verde del suelo y colocarlo en la zona objetivo azul de un soporte. El modelo consume dos cámaras RGB (480×640) y el estado del robot (9 dimensiones) y produce acciones de 8 dimensiones. Es relevante porque demuestra el flujo completo de fine-tuning de un VLA de última generación con LeRobot, aunque el entrenamiento es extremadamente corto (solo 2 pasos), lo que sugiere que se trata de una prueba de concepto o validación del pipeline más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en flujo, sobre arquitectura PaliGemma (π₀.₅) |
| Parametros totales | no disponible (el modelo base π₀.₅ no publica el desglose en esta ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo de 0.1 GB, probablemente safetensors en precisión nativa) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de visión-lenguaje-acción (VLA) basado en flujo, que extiende π₀ con mejoras orientadas a la generalización en mundo abierto. La arquitectura combina un codificador visual, un modelo de lenguaje (derivado de PaliGemma) y un decodificador de acciones que utiliza matching de flujo (flow matching) para generar trayectorias de acción continuas. La implementación open source reside en el repositorio OpenPI de Physical Intelligence, y la adaptación a LeRobot permite entrenar y desplegar el modelo con el ecosistema de Hugging Face.

El ajuste fino de este repositorio se realizó con el dataset `5cubes_300eps`, que contiene 100 episodios y 30 200 frames a 30 FPS. La configuración de entrenamiento indica solo 2 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate 2.5e-5. Este número de pasos es insuficiente para un ajuste fino real; probablemente el objetivo era validar el pipeline de LeRobot con π₀.₅, no obtener un policy funcional. El modelo base `lerobot/pi05_base` ya viene preentrenado con datos diversos de robótica, por lo que el fine-tuning aquí es mínimo.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales (dos cámaras RGB) y estado del robot.
- Ejecución de tareas de manipulación como "pick and place" (recoger y colocar objetos).
- Generalización a entornos nuevos gracias a las mejoras de π₀.₅ sobre π₀.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Soporte de múltiples cámaras (dos entradas visuales simultáneas).
- Salida de acciones continuas de 8 dimensiones (posición, orientación, etc.).
- No incluye capacidades de tool calling, agentes ni razonamiento multi-step fuera del ámbito robótico.

## Casos de uso

- Manipulación robótica en entornos controlados: el modelo puede ejecutar tareas de pick-and-place con objetos de colores específicos, como recoger un cubo verde y colocarlo en una zona marcada, útil para líneas de montaje o clasificación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo el fine-tuning de VLA con LeRobot afecta al rendimiento en tareas concretas, comparando con el modelo base.
- Validación de pipelines de entrenamiento: el repositorio demuestra el flujo completo de LeRobot (dataset, entrenamiento, push al Hub, rollout), útil para equipos que quieran adoptar esta infraestructura.
- Prototipado rápido de políticas robóticas: con el modelo base preentrenado, se puede fine-tunear con pocos datos para tareas específicas, aunque en este caso el entrenamiento es demasiado corto para ser útil.
- Educación en robótica y VLA: el modelo y su documentación permiten a estudiantes y desarrolladores familiarizarse con la arquitectura π₀.₅ y el flujo de LeRobot.
- Benchmarking de hardware: al ser un modelo pequeño (0.1 GB), puede usarse para medir latencia y throughput de inferencia en GPUs de consumo o edge devices.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para este policy. El modelo base π₀.₅ tiene benchmarks publicados por Physical Intelligence en su blog, pero no se incluyen en esta ficha.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, pero al ser un modelo de 0.1 GB en safetensors, la inferencia debería caber en GPUs de consumo con al menos 8 GB de VRAM, dependiendo de la resolución de imagen y el batch.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 3060 o superior, A100, H100). Para entrenamiento, se recomienda al menos 24 GB de VRAM.
- Compatibilidad con consumer GPU: sí, probablemente en RTX 3080/4090 con cuantización o batch reducido.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el policy y lo ejecutan en robots compatibles. También se puede usar con vLLM o TGI si se convierte el modelo, aunque no es el flujo estándar.
- Latencia y throughput: no disponibles. Dependen del robot, las cámaras y la GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ (este repo) | VLA (flow-based) | no disponible | no disponible | Apache-2.0 | Hugging Face (LeRobot) |
| π₀ (base) | VLA (flow-based) | no disponible | no disponible | Apache-2.0 | Hugging Face (LeRobot) |
| π₀-FAST | VLA (autoregressive) | no disponible | no disponible | Apache-2.0 | GitHub (OpenPI) |
| OpenVLA | VLA (autoregressive) | 7B | no disponible | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo en esta ficha. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El entrenamiento de este repositorio es solo de 2 pasos, lo que lo hace inutilizable como policy funcional. Es una demostración técnica del pipeline, no un modelo listo para producción.
- No hay resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito en la tarea.
- El modelo está especializado en una tarea muy concreta (recoger cubo verde y colocarlo en zona azul) y no generalizará a otras tareas sin fine-tuning adicional.
- Depende de dos cámaras específicas y de la configuración del robot; cualquier cambio en la disposición de las cámaras o el robot requerirá reentrenamiento.
- Riesgo de alucinación en acciones si las observaciones difieren del dominio de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base π₀.₅ puede tener restricciones adicionales según la política de Physical Intelligence (no detalladas aquí).
- No se proporcionan datos sobre sesgos, pero al ser un modelo entrenado con datos de robótica, puede fallar en entornos con iluminación, texturas o geometrías muy diferentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Yunhu98/pi05_grasp_refine_bs32_3k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (GitHub): https://github.com/Physical-Intelligence/openpi
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset 5cubes_300eps: https://huggingface.co/datasets/5cubes_300eps
