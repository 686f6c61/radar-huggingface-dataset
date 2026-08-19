# Xihe666/pi05_libero_full_2A800_bs32_20k

## Resumen

π₀.₅ (Pi05) es un modelo Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence, diseñado para la generalización en robótica en entornos abiertos. Este repositorio concreto, `Xihe666/pi05_libero_full_2A800_bs32_20k`, contiene un fine-tuning del modelo base `lerobot/pi05_base` sobre el dataset LIBERO, especializado en manipulación robótica con el brazo Panda de Franka Emika. El modelo se ha entrenado y publicado utilizando el framework LeRobot de Hugging Face.

El modelo resuelve el problema de la generación de acciones robóticas a partir de observaciones visuales (dos cámaras) y del estado del robot, guiado por instrucciones en lenguaje natural. Con aproximadamente 4.140 millones de parámetros, el modelo es capaz de ejecutar tareas de manipulación como recoger objetos, colocarlos en posiciones específicas o abrir cajones, generalizando a partir de instrucciones lingüísticas. Su relevancia actual radica en que representa una implementación abierta de un modelo VLA de última generación, con licencia Apache 2.0, lo que permite su uso comercial y su integración en pipelines de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo VLA que combina un codificador visual con un modelo de lenguaje y accion. La implementacion de LeRobot se adapta del repositorio OpenPI de Physical Intelligence. El modelo consume dos imagenes RGB de 256x256 píxeles y un vector de estado de 8 dimensiones, y produce un vector de accion de 7 dimensiones (posicion y orientacion del efector final). El entrenamiento se realizo sobre el dataset LIBERO, que contiene 1693 episodios y 273465 frames a 10 FPS, con tareas que incluyen manipulacion de objetos cotidianos en entornos de cocina y estanterias.

El proceso de entrenamiento se realizo durante 20000 pasos con un batch size de 32, utilizando el optimizador AdamW con una tasa de aprendizaje de 2.5e-05 y semilla 1000. Se empleo la version 0.6.1 de LeRobot. El modelo se entrena mediante aprendizaje por imitacion, sin tecnicas como RLHF o DPO, y no se han documentado innovaciones arquitectonicas adicionales mas alla de las inherentes al modelo base π₀.₅.

## Capacidades

- Generacion de acciones roboticas de 7 grados de libertad a partir de observaciones visuales y estado del robot.
- Interpretacion de instrucciones en lenguaje natural para guiar la manipulacion (en ingles).
- Ejecucion de tareas de manipulacion con dos camaras (vision estereo o multivista).
- Generalizacion a variaciones de la misma tarea (diferentes posiciones iniciales de objetos).
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- Capacidad de fine-tuning sobre el modelo base π₀.₅ para tareas especificas.
- Soporte para robot Panda de Franka Emika.

## Casos de uso

- Manipulacion robotica en entornos de cocina: el modelo puede ejecutar tareas como "poner la taza blanca en el plato" o "poner la botella de vino en la estanteria", lo que lo hace util para automatizar procesos de preparacion de alimentos o recogida de objetos en entornos domesticos o de restauracion.
- Organizacion de almacenes y estanterias: las tareas de LIBERO incluyen colocar objetos en cestas o compartimentos, lo que puede transferirse a aplicaciones de picking y placing en logistica.
- Investigacion en aprendizaje por imitacion: al estar basado en LeRobot y con pesos publicados, sirve como punto de partida para investigar tecnicas de VLA, comparar arquitecturas o estudiar la generalizacion en robotica.
- Desarrollo de asistentes roboticos domesticos: el modelo puede integrarse en robots de asistencia para tareas como recoger objetos, abrir cajones o colocar utensilios, con la ventaja de una licencia permisiva para uso comercial.
- Evaluacion de politicas robotica en simulacion: el dataset LIBERO incluye entornos simulados, por lo que el modelo puede evaluarse en simuladores antes de desplegarse en hardware real.
- Fine-tuning para tareas especificas: dado que es un fine-tuning de π₀.₅, puede servir como checkpoint intermedio para adaptar el modelo a otros datasets o robots con menos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, pero un modelo de 4B parametros en precision FP16 requiere aproximadamente 8-10 GB de VRAM solo para los pesos, mas overhead de activaciones y optimizador durante entrenamiento.
- GPU recomendadas: para inferencia, una GPU con al menos 12 GB de VRAM (RTX 3060, RTX 4070, A10) seria suficiente; para entrenamiento, se recomiendan GPUs con 24 GB o mas (RTX 3090, A100, H100).
- Si cabe en consumer GPU: si, en GPUs de gama alta como RTX 3090/4090, aunque para entrenamiento completo se requiere mas memoria.
- Opciones de despliegue: LeRobot proporciona integracion con el robot Panda via `lerobot-rollout`; tambien puede utilizarse con vLLM u otras herramientas si se exporta a formatos compatibles, aunque el flujo principal es via LeRobot.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Xihe666/pi05_libero_full_2A800_bs32_20k | 4.14B | no disponible | LIBERO (20k pasos) | Apache 2.0 |
| lerobot/pi05_libero_base | 4B (estimado) | no disponible | LIBERO | Apache 2.0 |
| lerobot/pi05_base | 4B (estimado) | no disponible | Pre-entrenamiento general | Apache 2.0 |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente en el dataset LIBERO, que contiene tareas de mesa con objetos cotidianos; no generalizara a tareas fuera de este dominio sin fine-tuning adicional.
- Las instrucciones estan en ingles; el rendimiento con instrucciones en otros idiomas no esta garantizado.
- El modelo requiere dos camaras configuradas correctamente; variaciones en la colocacion de las camaras pueden degradar el rendimiento.
- No se han documentado sesgos especificos, pero como todo modelo de aprendizaje por imitacion, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion en la interpretacion de instrucciones ambiguas o fuera del vocabulario del dataset.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las licencias de los componentes subyacentes (por ejemplo, el dataset LIBERO).
- Para produccion, se recomienda validar el modelo en el hardware y entorno especificos antes del despliegue, ya que el rendimiento puede variar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Xihe666/pi05_libero_full_2A800_bs32_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentacion de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Dataset LIBERO: https://huggingface.co/datasets/lerobot/libero
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Coleccion de modelos pi05 de LeRobot: https://huggingface.co/collections/lerobot/pi05
