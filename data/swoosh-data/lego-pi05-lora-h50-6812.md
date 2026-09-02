# swoosh-data/lego-pi05-lora-h50-6812

## Resumen

El modelo `swoosh-data/lego-pi05-lora-h50-6812` es un adaptador LoRA (Low-Rank Adaptation) de la política π₀.₅ (Pi05), un modelo Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence e implementado en la librería LeRobot de Hugging Face. Este adaptador concreto ha sido entrenado por el usuario `swoosh-data` sobre el modelo base `lerobot/pi05_base` para la tarea de ensamblaje bimanual de piezas LEGO, utilizando un dataset etiquetado de demostraciones.

El adaptador se publica como un archivo de inferencia y evaluación, no como un bundle de entrenamiento reanudable: incluye los pesos finales LoRA, la configuración PEFT, los preprocesadores y postprocesadores necesarios, la configuración completa de entrenamiento y una evaluación determinista sobre 435 muestras reservadas. El checkpoint final corresponde al paso 6.812 de entrenamiento, con un rango LoRA de 16 y un horizonte de acción de 50.

La relevancia de este modelo radica en que demuestra la aplicación práctica de π₀.₅, un VLA con generalización a mundo abierto, sobre una tarea robótica concreta y reproducible. Al ser un adaptador LoRA, permite ajustar el modelo base con un coste computacional reducido, lo que facilita su uso en entornos de investigación y desarrollo con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, con adaptador LoRA |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 16, pero los parametros totales del modelo base no se indican) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en formato safetensors) |
| Idiomas soportados | no disponibles (el modelo es para control robotico, no para procesamiento de lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA + configuracion PEFT) |

## Arquitectura y entrenamiento

π₀.₅ es un modelo Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence, diseñado para abordar la generalización a mundo abierto en robótica. La implementación en LeRobot se adapta del repositorio OpenPI de Physical Intelligence. El modelo base `lerobot/pi05_base` es la versión preentrenada de π₀.₅, que combina percepción visual, comprensión de lenguaje y generación de acciones.

El adaptador LoRA se entrenó sobre el dataset `swoosh-data/lego_assemblies_labeled_pi05`, que contiene demostraciones de ensamblaje bimanual de piezas LEGO. La configuración de entrenamiento incluye un rango LoRA de 16, un horizonte de acción de 50, y acciones articulares relativas con pinzas (grippers) en modo absoluto. El entrenamiento alcanzó el paso 6.812 como checkpoint final, con un run de Weights & Biases identificado como `w3heafk6`. No se especifica si se utilizó RLHF, DPO u otras técnicas de alineación; el entrenamiento se basa en aprendizaje supervisado por imitación sobre las demostraciones.

## Capacidades

- Control robótico bimanual: el adaptador está entrenado para coordinar dos brazos robóticos en tareas de ensamblaje LEGO, con acciones articulares relativas y control de pinzas absoluto.
- Generalización a partir de demostraciones: aprende políticas de manipulación a partir de datos de demostración etiquetados, siguiendo el paradigma de aprendizaje por imitación.
- Integración con LeRobot: el adaptador se distribuye con los preprocesadores, postprocesadores y normalizadores necesarios para su uso directo con la librería LeRobot.
- Evaluación determinista: incluye un conjunto de evaluación reservado de 435 muestras con métricas de error de posición (TCP MAE), precisión de pinzas y precisión de secuencia de brazo.
- Compatibilidad con flujo de entrenamiento PEFT: al ser un adaptador LoRA, puede combinarse con el modelo base `lerobot/pi05_base` para inferencia o para continuar el entrenamiento si se dispone del estado del optimizador (que no se incluye en este archivo).

## Casos de uso

- Investigación en manipulación robótica: el adaptador sirve como punto de partida para estudiar el comportamiento de π₀.₅ en tareas de ensamblaje, permitiendo reproducir los resultados de evaluación publicados (TCP MAE de 4.67 mm en ejecución con horizonte 1).
- Desarrollo de políticas de ensamblaje industrial: la tarea de ensamblaje LEGO es un banco de pruebas representativo para validar políticas de manipulación fina antes de transferirlas a entornos industriales con piezas similares.
- Benchmarking de VLA en robótica: al incluir una evaluación determinista con métricas desglosadas, el modelo puede utilizarse como referencia para comparar otras políticas o adaptadores en la misma tarea.
- Aprendizaje por imitación con LoRA: el archivo demuestra un flujo completo de ajuste fino de π₀.₅ con LoRA, sirviendo como ejemplo para quienes deseen entrenar adaptadores similares en otras tareas.
- Evaluación de robustez en ejecución: las métricas de Execute-1 y Execute-5 (TCP MAE de 4.67 mm y 12.81 mm respectivamente) permiten analizar cómo se degrada la precisión al aumentar el horizonte de ejecución, útil para estudiar la estabilidad de la política.
- Integración en pipelines de simulación: el adaptador puede cargarse en entornos de simulación robótica (por ejemplo, con MuJoCo o Isaac Sim) para validar el comportamiento antes del despliegue físico.

## Benchmarks y rendimiento

La evaluación se realizó sobre 435 muestras deterministas de span semántico, con cuatro extracciones fijas de flow-matching y un horizonte de ejecución de cinco. Los resultados publicados son:

| Metrica | Resultado |
|---|---|
| Execute-1 deployed TCP MAE | 4.67 mm |
| Execute-5 deployed TCP MAE | 12.81 mm |
| Full-chunk deployed TCP MAE | 79.30 mm |
| Gripper binary accuracy | 86.43% |
| Arm-sequence accuracy | 77.85% |
| Stationary-arm drift | 0.268° |
| Flow-matching validation loss | 0.02647 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las métricas de TCP MAE (error medio absoluto de la posición del centro de la herramienta) indican que la política es precisa en ejecuciones cortas, pero su error aumenta significativamente con horizontes largos, lo que sugiere una degradación en la consistencia temporal.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de repositorio de 0.1 GB, por lo que el almacenamiento requerido es mínimo.
- Para inferencia, se necesita cargar el modelo base `lerobot/pi05_base` junto con el adaptador. El tamaño del modelo base no se especifica en la información disponible, pero los VLA de tipo π₀.₅ suelen requerir GPUs con al menos 24 GB de VRAM en su versión completa.
- No se indica si el modelo cabe en GPUs de consumo (como RTX 4090 o similar). Dado que es un adaptador LoRA, la inferencia podría ejecutarse en GPUs de consumo si el modelo base se cuantiza, pero no hay datos de cuantización disponibles.
- Opciones de despliegue: el modelo está diseñado para usarse con la librería LeRobot, que soporta inferencia local y evaluación. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para π₀.₅ en tareas de ensamblaje). El repositorio `Wr3ck1Am/pi05-lora` aparece en los resultados de búsqueda, pero no se proporcionan detalles sobre su configuración o rendimiento. La comparativa no está disponible.

## Limitaciones y advertencias

- El archivo no incluye el estado del optimizador ni checkpoints intermedios, por lo que no es posible reanudar el entrenamiento desde este punto; solo sirve para inferencia y evaluación.
- Las métricas de evaluación muestran una degradación significativa en el error TCP MAE al aumentar el horizonte de ejecución (de 4.67 mm en Execute-1 a 79.30 mm en full-chunk), lo que indica que la política no es robusta para ejecuciones largas sin re-planificación.
- La precisión de pinzas (86.43%) y la precisión de secuencia de brazo (77.85%) no son perfectas, lo que implica que la política puede fallar en tareas que requieran alta precisión repetitiva.
- No se especifica la licencia del modelo, lo que genera incertidumbre sobre los términos de uso comercial y redistribución.
- El modelo está entrenado específicamente para ensamblaje LEGO bimanual; su generalización a otras tareas o entornos no está garantizada y requeriría evaluación adicional.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma, ya que el modelo no es un sistema de lenguaje general sino una política de control robótico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/swoosh-data/lego-pi05-lora-h50-6812
- Documentación de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/pi05
- Código fuente de la política π05 en LeRobot: https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/pi05
- Documentación de π₀.₅ en el repositorio de LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/pi05.mdx
- Ejemplo de adaptador LoRA similar (sin detalles): https://huggingface.co/Wr3ck1Am/pi05-lora
