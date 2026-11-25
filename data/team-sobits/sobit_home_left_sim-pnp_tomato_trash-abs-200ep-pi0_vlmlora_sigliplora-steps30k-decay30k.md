# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora_sigliplora-steps30k-decay30k

## Resumen

SOBIT Home Left es una política de visión-lenguaje-acción (VLA) para robótica de manipulación móvil, obtenida mediante fine-tuning del modelo fundacional π₀ (Pi0) de Physical Intelligence, distribuido a través de LeRobot. El autor del fine-tuning es el equipo `team-sobits`, y el modelo resuelve una tarea concreta de manipulación doméstica: lanzar una lata de tomate a una papelera. El repositorio contiene los pesos en formato safetensors (2,6 GB) bajo licencia Apache 2.0.

Técnicamente se trata de un ajuste del checkpoint `lerobot/pi0_base` con 30 000 pasos de entrenamiento, batch de 20, optimizador AdamW y tasa de aprendizaje 2,5e-05, sobre un dataset de 200 episodios (48 141 fotogramas a 10 FPS) grabado en simulación. El nombre del repositorio indica además dos decisiones de entrenamiento: adaptación mediante LoRA en el componente de visión-lenguaje (`vlmlora`) y un esquema de inicialización tipo SigLIP-LoRA, con un decaimiento de learning rate a partir del paso 30 000.

Su relevancia es acotada pero clara para quien trabaja en imitación robótica: sirve como referencia reproducible de un pipeline completo LeRobot sobre π₀, con observaciones multimodales (cámara de cabeza 480×640 y cámara de mano izquierda 400×640) y un vector de estado/acción de 20 dimensiones, todo sobre un robot de tipo `mobile_manipulator`. No es un modelo de propósito general ni un asistente conversacional: es una política de control entrenada para una única tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀ (Pi0) de Physical Intelligence, implementación LeRobot/OpenPI; transformer visión-lenguaje-acción con adaptadores LoRA en el componente visión-lenguaje |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (política de control; no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, sin lista de idiomas publicada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `mobile_manipulator` |
| Cámaras de entrada | `head_camera` (3, 480, 640), `hand_left_camera` (3, 400, 640) |
| Dimensión de estado | `observation.state` (20,) |
| Dimensión de acción | `action` (20,) |
| Dataset de entrenamiento | `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep` (200 episodios, 48 141 fotogramas, 10 FPS) |
| Tarea entrenada | "Throw the tomato can into the trash bin" |
| Pasos de entrenamiento | 30 000 |
| Batch size | 20 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repositorio | 2,6 GB |
| Modelo base | `lerobot/pi0_base` |

## Arquitectura y entrenamiento

El modelo parte de π₀, una política fundacional visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para generar comandos de control a partir de observaciones visuales e instrucciones en lenguaje natural. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. En este fine-tuning concreto, el nombre del checkpoint (`pi0_vlmlora_sigliplora-steps30k-decay30k`) indica que se aplicaron adaptadores LoRA sobre el componente visión-lenguaje (con inicialización SigLIP-LoRA) en lugar de un ajuste completo, lo que reduce el coste de entrenamiento manteniendo el resto de los pesos congelados.

El entrenamiento se realizó durante 30 000 pasos con un decaimiento del learning rate a partir de ese mismo paso, batch de 20 y AdamW con tasa 2,5e-05, sobre 200 episodios de demostración en simulación (48 141 fotogramas a 10 FPS) de la tarea de lanzar una lata de tomate a una papelera. Las acciones se representan en espacio absoluto (`abs` en el nombre del dataset), con un vector de 20 dimensiones que incluye el estado del robot y las articulaciones del manipulador móvil. No se documenta en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset de π₀ ni si hubo etapas de RLHF o DPO; el autor no publica esos detalles.

## Capacidades

- Control robótico de manipulación móvil: genera acciones de 20 dimensiones a partir de dos vistas de cámara y del estado del robot.
- Interpretación de instrucciones en lenguaje natural para condicionar la política (la tarea se pasa como cadena de texto en el comando de rollout).
- Percepción visual multimodal con dos cámaras simultáneas (cabeza y mano izquierda) a resoluciones de 480×640 y 400×640.
- Ejecución de una tarea de pick-and-place específica: coger una lata de tomate y lanzarla a una papelera.
- Compatibilidad con el ecosistema LeRobot: entrenamiento, rollout e inferencia mediante las herramientas `lerobot-train` y `lerobot-rollout`.
- Ajuste eficiente mediante LoRA sobre el componente visión-lenguaje, lo que permite reentrenar la política con recursos moderados.
- No se documentan capacidades de tool calling, agentes multi-paso, generación de código, matemáticas ni procesamiento de audio.

## Casos de uso

- Investigación en imitación robótica: reproducir el pipeline completo de fine-tuning de π₀ con LeRobot sobre un dataset propio de 200 episodios, usando este checkpoint como referencia de hiperparámetros (30 000 pasos, batch 20, LR 2,5e-05).
- Prototipado de tareas de recogida y depósito en entornos simulados: la política está entrenada específicamente para coger un objeto y arrojarlo a un contenedor, un patrón reutilizable en tareas de limpieza doméstica simulada.
- Evaluación de adaptadores LoRA en VLA: el checkpoint permite comparar el rendimiento de un ajuste LoRA sobre el componente visión-lenguaje frente a un fine-tuning completo de π₀ en la misma tarea.
- Base para transferencia a otras tareas de manipulación: al estar construido sobre `lerobot/pi0_base`, puede servir como punto de partida para nuevos fine-tunings con datasets propios, aprovechando los adaptadores ya entrenados.
- Docencia y divulgación: ejemplo completo y reproducible de un flujo LeRobot con robot `mobile_manipulator`, dos cámaras y espacio de acciones absoluto, útil en cursos de aprendizaje por imitación.
- Integración en bancos de pruebas de simulación: la política puede ejecutarse con `lerobot-rollout` durante un tiempo acotado (`--duration`) para medir estabilidad y éxito en episodios repetidos antes de trasladar el enfoque a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación vacía, con la nota explícita de que todavía no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 2,6 GB en safetensors, por lo que el peso de los pesos en memoria es de ese orden antes de overhead de activaciones y del codificador visual.
- GPU recomendadas: no disponible. Al tratarse de una política VLA con dos flujos de imagen, se recomienda una GPU con al menos capacidad para cargar los pesos completos en memoria; no se documentan modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política de control.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabó a 10 FPS, pero no se publica la frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOBIT Home Left (este modelo) | no disponible | no aplica | Lanzar lata de tomate a papelera (simulación) | Apache 2.0 | Hugging Face, 15 descargas |
| `lerobot/pi0_base` | no disponible | no aplica | Política VLA generalista (base) | no disponible en la información | Hugging Face (modelo base) |
| π₀ de Physical Intelligence (original) | no disponible | no aplica | Política VLA generalista multi-robot | no disponible en la información | Blog y repositorio OpenPI |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se publican parámetros, benchmarks ni tasas de éxito para este checkpoint ni para el modelo base en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Throw the tomato can into the trash bin"); no se espera generalización a otras tareas sin reentrenamiento.
- Datos de entrenamiento en simulación (200 episodios), lo que puede provocar una brecha de realidad (sim-to-real) al desplegar en hardware físico.
- Sin resultados de evaluación publicados: se desconoce la tasa de éxito real de la política.
- El vector de estado y acción es de 20 dimensiones y las cámaras deben coincidir exactamente con `head_camera` y `hand_left_camera`; un robot con otra configuración requerirá adaptación.
- No se documentan sesgos, riesgos de alucinación ni comportamiento en idiomas distintos del usado en la instrucción de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base π₀ y sus dependencias deben verificarse por separado.
- El repositorio tiene 15 descargas y 0 likes, por lo que no hay validación comunitaria ni reportes de terceros sobre su funcionamiento.
- No se especifican requisitos de hardware ni latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi0_vlmlora_sigliplora-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
