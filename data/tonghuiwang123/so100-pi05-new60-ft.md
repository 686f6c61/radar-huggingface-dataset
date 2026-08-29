# tonghuiwang123/so100-pi05-new60-ft

## Resumen

so100-pi05-new60-ft es un modelo de política robótica basado en Pi0.5, desarrollado por el usuario tonghuiwang123 (Argento Fishback) para el brazo robótico de código abierto SO-100 / SO-ARM100. El modelo está especializado en la tarea de manipulación "Grab the white cube to the white cup" (agarrar el cubo blanco y colocarlo en la taza blanca), un ejemplo de manipulación robótica de precisión con control visual.

El modelo se construye sobre la arquitectura Pi0.5 de Physical Intelligence, un modelo Visión-Lenguaje-Acción (VLA) con generalización en mundo abierto. El checkpoint publicado corresponde al paso 76000 de entrenamiento, aproximadamente 45.2 épocas, y se entrenó en dos fases: una primera con 60 episodios usando cámaras antiguas y una segunda fase de fine-tuning con el nuevo conjunto de datos de 60 episodios y 13454 fotogramas. El modelo congela el VLM y entrena únicamente el experto de acción, con 693 millones de parámetros entrenables de un total de 4.14 mil millones.

La relevancia de este modelo radica en su aplicación práctica sobre hardware asequible y de código abierto como el SO-100, demostrando que las políticas VLA de última generación pueden desplegarse en plataformas robóticas de bajo coste. El modelo requiere aproximadamente 9.9 GB de VRAM para inferencia, lo que lo hace accesible para GPUs de consumo con 12 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (Vision-Language-Action, basada en transformer con experto de acción) |
| Parametros totales | 4.143.404.816 (4.14B) |
| Parametros activos | 693M (entrenables, VLM congelado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (dtype de entrenamiento) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 149.7 GB |
| Libreria | LeRobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

Pi0.5 es un modelo Visión-Lenguaje-Acción desarrollado por Physical Intelligence que evoluciona desde Pi0. La arquitectura combina un modelo VLM pre-entrenado con un experto de acción (action expert) que se entrena específicamente para generar comandos de control del robot. El modelo se entrena mediante co-training con multiples fuentes de datos: demostraciones roboticas, datos web y subtareas semanticas, lo que permite la generalizacion en mundo abierto para manipulacion robotica de larga duracion.

En este caso concreto, el entrenamiento se realizo en dos fases. La primera fase utilizo 60 episodios grabados con camaras antiguas, y la segunda fase (fine-tuning) uso el dataset `tonghuiwang123/40` con 60 episodios nuevos y 13454 fotogramas a 30 fps con resolucion 1280x720. El checkpoint publicado corresponde al paso 76000, aproximadamente 45.2 epocas con batch efectivo de 8 (4x2 con DDP). La configuracion de entrenamiento incluye `dtype=bfloat16`, `train_expert_only=true` y `gradient_checkpointing=true`, lo que significa que el VLM permanece congelado y solo se entrenan los 693M de parametros del experto de accion.

## Capacidades

- Control robotico end-to-end: genera acciones de control directas para el brazo SO-100 a partir de observaciones visuales y la instruccion de tarea.
- Percepcion visual multimodal: procesa dos camaras RGB (top-down y wrist) a resolucion 1280x720 para percibir el estado de la escena.
- Ejecucion de tareas de manipulacion de precision: especializado en la tarea de agarrar un cubo blanco y colocarlo en una taza blanca.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante la instruccion "Grab the white cube to the white cup".
- Generalizacion en mundo abierto: al estar basado en Pi0.5, hereda capacidades de generalizacion a escenarios no vistos durante el entrenamiento.
- Fine-tuning sobre hardware de bajo coste: el modelo esta optimizado para desplegarse en el brazo SO-100, un robot asequible y de codigo abierto.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo puede utilizarse en entornos de investigacion para estudiar politicas VLA en hardware real, con un setup reproducible y de bajo coste basado en SO-100.
- Automatizacion de tareas de pick-and-place: la tarea de agarrar un objeto y colocarlo en un contenedor es fundamental en logistica y manufactura; este modelo demuestra la viabilidad de VLA para este tipo de operaciones.
- Benchmarking de politicas VLA: al estar publicado con configuracion completa de entrenamiento y despliegue, sirve como punto de referencia para comparar arquitecturas y metodos de entrenamiento en robotica.
- Educacion e investigacion en robotica: el modelo permite a estudiantes e investigadores experimentar con VLA sin necesidad de infraestructura costosa, gracias a los requisitos de hardware moderados (12 GB VRAM).
- Desarrollo de habilidades robotica con demostracion: el enfoque de entrenamiento por imitacion con 60 episodios demuestra que se pueden obtener politicas funcionales con pocos datos, lo que es relevante para aplicaciones donde la recoleccion de datos es costosa.
- Integracion en pipelines de LeRobot: al estar publicado en el ecosistema LeRobot, puede integrarse directamente con las herramientas de grabacion, evaluacion y despliegue de esta libreria, facilitando la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se evalua en el mundo real sobre la tarea especifica de agarrar el cubo blanco y colocarlo en la taza blanca, pero no se proporcionan metricas cuantitativas de exito, tasa de exito o tiempo de ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9.9 GB, segun la model card.
- GPU recomendadas: cualquier GPU con 12 GB o mas de VRAM, como NVIDIA RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090, A10, A100, etc.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 12 GB o mas de VRAM.
- Opciones de despliegue: LeRobot (libreria principal), con soporte para inferencia en tiempo real con camaras OpenCV.
- Resolucion de camara obligatoria: 1280x720 a 30 fps para ambas camaras (base_0_rgb y left_wrist_0_rgb).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so100-pi05-new60-ft (este modelo) | Pi0.5 VLA | 4.14B totales, 693M entrenables | no disponible | no disponible | HuggingFace |
| pepijn223/bimanual-so100-handover-cube_pi05 | Pi0.5 VLA | no disponible | no disponible | no disponible | HuggingFace |
| Pi0.5 (Physical Intelligence) | VLA con co-training | no disponible | no disponible | no disponible | Codigo abierto parcial (OpenPI) |

La comparativa se limita a otros modelos Pi0.5 para SO-100 disponibles en HuggingFace. No se dispone de datos suficientes para una comparacion cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Especializacion limitada: el modelo esta entrenado exclusivamente para la tarea "Grab the white cube to the white cup" y puede no generalizar a otras tareas sin fine-tuning adicional.
- Dependencia del hardware: requiere una configuracion especifica de camaras (dispositivos `/dev/video2` y `/dev/video4`) y del brazo SO-100, lo que limita su portabilidad a otros robots.
- Requisitos de VRAM: aunque moderados (9.9 GB), excluyen GPUs con menos de 12 GB de VRAM, lo que puede ser una barrera para algunos usuarios.
- Datos de entrenamiento limitados: solo 60 episodios de demostracion, lo que puede limitar la robustez del modelo ante variaciones en la iluminacion, posicion de objetos o condiciones del entorno.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o modificacion.
- Idioma de las instrucciones: la tarea se define en ingles; no se especifica soporte multilingue.
- Riesgo de alucinacion en acciones: como todo modelo VLA, puede generar acciones incorrectas o inseguras en situaciones no vistas durante el entrenamiento.
- Sin benchmarks publicados: no hay metricas cuantitativas de rendimiento, lo que dificulta evaluar su eficacia real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tonghuiwang123/so100-pi05-new60-ft
- Perfil del autor: https://huggingface.co/tonghuiwang123/models
- Repositorio SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
- Modelo similar (bimanual handover): https://huggingface.co/pepijn223/bimanual-so100-handover-cube_pi05
- Paper de Pi0.5: https://arxiv.org/html/2504.16054v1
- Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
