# StarVLA/VLAct-Qwen3VL4B-OFT-RoboDojo

## Resumen

VLAct-Qwen3VL4B-OFT-RoboDojo es un modelo de visión-lenguaje-acción (VLA) desarrollado por StarVLA, una organización centrada en la robótica generalista. Se trata de un ajuste fino de 100.000 pasos sobre el modelo base StarVLA/Qwen3-VL-4B-Instruct-Action, especializado en el conjunto de datos RoboDojo LeRobot v2.1, que abarca 35 tareas de manipulación robótica. El modelo combina un backbone VLM Qwen3-VL de 4.000 millones de parámetros con un modelo de acción basado en difusión (QwenOFT) de 16 capas, capaz de generar trayectorias de 50 pasos de acción a partir de observaciones visuales de tres cámaras RGB y estado propioceptivo de 14 dimensiones.

La relevancia de este modelo radica en su enfoque modular y reproducible: el checkpoint publicado es el estado completo del framework, no un adaptador LoRA, lo que permite reproducir exactamente los resultados de evaluación reportados. Está pensado para la comunidad de investigación en robótica que necesita políticas VLA entrenadas y evaluadas bajo un protocolo estandarizado, con licencia Apache 2.0 que facilita su uso comercial y académico. Su arquitectura híbrida (VLM + difusión) es representativa de la tendencia actual en modelos de manipulación robótica, donde la generación de acciones se modela como un proceso de difusión sobre el espacio de articulaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM Qwen3-VL-4B + modelo de accion por difusion QwenOFT (16 capas) |
| Parametros totales | 4.000 millones (backbone VLM) + parametros del modelo de accion (no desglosados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el VLM base soporta contexto multimodal, pero no se especifica para este ajuste) |
| Tipos de cuantizacion | No disponibles (el checkpoint se distribuye como state dict completo en PyTorch) |
| Idiomas soportados | No disponibles (el VLM base Qwen3-VL soporta multiples idiomas, pero no se detalla para este modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`steps_100000_pytorch_model.pt`), config YAML, estadisticas de dataset |

## Arquitectura y entrenamiento

El modelo sigue el framework StarVLA `QwenOFT`, que integra un VLM Qwen3-VL-4B-Instruct-Action como codificador de percepcion y razonamiento, junto con un modelo de accion por difusion de 16 capas. La observacion consiste en tres imagenes RGB de 224x224 píxeles (presumiblemente desde distintas camaras del robot) concatenadas con un vector de estado propioceptivo de 14 dimensiones. La accion se define como posicion absoluta de articulaciones (`abs_qpos`) en 14 dimensiones, con un horizonte de accion de 50 pasos. Durante la inferencia, el modelo ejecuta 16 acciones antes de solicitar el siguiente chunk, y utiliza 4 pasos de difusion (frente a 8 en entrenamiento).

El entrenamiento se realizo durante 100.000 pasos con un batch global de 256 (16 por GPU en 2 nodos de 8 GPUs), usando AdamW con betas (0.9, 0.95) y epsilon 1e-8. Las tasas de aprendizaje fueron 1e-5 para el VLM y la interfaz Qwen-VL, y 1e-4 para el modelo de accion, con un schedule coseno y 5.000 pasos de warmup. El loss del VLA se escalo a 1.0 mientras que el loss del VLM se fijo a 0.0, indicando que el modelo se entreno exclusivamente para la tarea de generacion de acciones. Se habilito gradient checkpointing y no se congelo ningun modulo. La inicializacion partio del checkpoint de 100K pasos del run multi-embodiment `0706_agilex_franka_5data_manualvel_balance33_66_50_vlm3_qwen3OFT_GR00T_PI_xrobot_3head_agilex_franka`, recargando solo los modulos de la interfaz Qwen-VL.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce comandos de posicion absoluta de articulaciones (14D) para robots con brazo y pinza, a partir de observaciones visuales y propioceptivas.
- Razonamiento viso-linguistico: hereda las capacidades del VLM Qwen3-VL-4B, incluyendo comprension de escenas, objetos y lenguaje natural para guiar la politica.
- Seguimiento de instrucciones en lenguaje: algunas tareas del conjunto RoboDojo (p. ej., `stack_blocks_by_language`, `classify_objects_by_language`) requieren interpretar comandos textuales para seleccionar la accion adecuada.
- Percepcion multi-camara: procesa tres vistas RGB simultaneas, lo que permite manejar oclusiones y perspectivas multiples en entornos de mesa.
- Generacion de trayectorias por difusion: el modelo de accion QwenOFT modela la distribucion de acciones condicionadas a la observacion, permitiendo muestrear multiples hipotesis de movimiento.
- Ejecucion por chunks: genera secuencias de 50 acciones y ejecuta 16 antes de replanificar, lo que reduce la frecuencia de inferencia y mejora la fluidez del movimiento.

## Casos de uso

- Automatizacion de tareas de ensamblaje en fabricacion: el modelo puede controlar un brazo robotico para insertar tubos, atornillar piezas o construir torres, como demuestran las tareas `insert_tubes` (56,67 % SR) y `build_tower` (53,33 % SR). Su capacidad de percibir tres camaras y generar acciones precisas lo hace adecuado para celdas de trabajo con posiciones fijas.
- Manipulacion de objetos deformables: tareas como `fold_clothes` o `make_kong` requieren manejar materiales no rigidos. Aunque los resultados son bajos (0 % y 56,67 % respectivamente), el modelo demuestra que puede abordar este tipo de desafios, aunque con margen de mejora.
- Clasificacion y organizacion de objetos: el modelo puede separar objetos por criterios visuales o linguisticos (`classify_objects`, `sort_nesting_dolls_by_size`), util en logistica inversa o reciclaje automatizado. Los resultados son limitados (0-3,33 % SR), lo que indica que esta capacidad aun no es fiable.
- Investigacion en politicas VLA: al ser un checkpoint completo con configuracion reproducible, sirve como punto de partida para estudios de transferencia, fine-tuning en nuevos entornos o comparacion de arquitecturas de difusion.
- Evaluacion de protocolos de robotica: el modelo incluye `evaluation_results.json` y un protocolo de evaluacion detallado (42 tareas, 1.260 episodios), lo que permite a otros investigadores replicar la evaluacion o extenderla a nuevos escenarios.
- Desarrollo de robots de servicio en entornos domesticos: tareas como `make_toast`, `pour_liquid_into_cup` o `store_laptop_and_headphones` apuntan a aplicaciones en cocinas y hogares, aunque los resultados actuales (0-6,67 % SR) muestran que se necesita mas entrenamiento.

## Benchmarks y rendimiento

El modelo se evaluo en el conjunto RoboDojo LeRobot v2.1 con un protocolo escalado local (42 tareas, 3 semillas, 10 episodios por tarea y semilla, total 1.260 episodios). Los resultados no corresponden al protocolo oficial de 50 episodios por tarea (2.100 episodios) y no deben considerarse una submission verificada a un leaderboard.

| Grupo de evaluacion | Tasa de exito (%) | Puntuacion |
|---|---:|---:|
| Media global | 8,17 | 11,28 |
| Generalizacion | 4,72 | 8,18 |
| Precision | 18,33 | 23,44 |
| Horizonte largo | 15,42 | 21,29 |
| Memoria | 0,56 | 0,67 |
| Abierto | 1,67 | 1,71 |

Las tareas con mejor rendimiento fueron `put_bottles_into_dustbin` (63,33 % SR), `insert_tubes` (56,67 %), `make_kong` (56,67 %) y `build_tower` (53,33 %). Las tareas de memoria y abiertas presentan tasas de exito casi nulas, lo que sugiere limitaciones en razonamiento de secuencias largas y generalizacion a instrucciones novedosas. No se han publicado comparaciones con otros modelos VLA en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El checkpoint pesa 9,8 GB en disco, por lo que en FP16 se necesitan al menos 12-16 GB de VRAM para cargar el modelo completo. Con cuantizacion a 8 bits podria reducirse a 6-8 GB, pero no se proporcionan configuraciones de cuantizacion.
- GPU recomendadas: no especificadas por el autor. Dado el tamano del modelo (4B + difusion), una GPU consumer como RTX 4090 (24 GB) o RTX 4080 (16 GB) seria suficiente para inferencia en FP16. Para entrenamiento se usaron 2 nodos x 8 GPUs (probablemente A100 o H100), pero no se detalla el modelo exacto.
- Compatibilidad con GPU consumer: probablemente si, con al menos 16 GB de VRAM, aunque la inferencia con 4 pasos de difusion y 3 camaras puede requerir optimizaciones como TensorRT o cuantizacion.
- Opciones de despliegue: el framework StarVLA es de codigo abierto y permite inferencia con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de robotica, no de texto generativo.
- Latencia y throughput: no disponibles. La inferencia implica codificar 3 imagenes, procesar el VLM y ejecutar 4 pasos de difusion para generar un chunk de 50 acciones, de las cuales se ejecutan 16. El tiempo por paso no se ha publicado.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre este modelo y otras politicas VLA como OpenVLA, RT-2 o π0. La informacion disponible no incluye resultados de benchmarks estandarizados (como los de la tabla de RoboDojo oficial) para otros modelos en las mismas condiciones. Por tanto, no es posible realizar una comparativa cuantitativa rigurosa. Se puede indicar que, en terminos de arquitectura, este modelo sigue el patron VLM + difusion, similar a otros enfoques recientes, pero con un backbone Qwen3-VL de 4B, mas pequeno que alternativas como OpenVLA (7B) o RT-2 (55B), lo que podria favorecer la inferencia en hardware modesto a costa de menor capacidad de razonamiento.

## Limitaciones y advertencias

- Rendimiento bajo en tareas de memoria y abiertas: las categorias Memory (0,56 % SR) y Open (1,67 % SR) muestran que el modelo falla en tareas que requieren recordar secuencias o seguir instrucciones linguisticas novedosas. No es adecuado para aplicaciones que exijan razonamiento de alto nivel o generalizacion a escenarios no vistos.
- Protocolo de evaluacion no oficial: los resultados reportados provienen de una reproduccion local escalada (1.260 episodios frente a los 2.100 del protocolo oficial). No deben presentarse como resultados verificados de un leaderboard.
- Dependencia del entorno de entrenamiento: el modelo se ajusto especificamente al conjunto RoboDojo v2.1 con 35 tareas. Su transferencia a otros robots, configuraciones de camaras o espacios de accion requiere reentrenamiento o adaptacion.
- Riesgo de alucinacion visual: como cualquier VLM, puede malinterpretar escenas o generar acciones inconsistentes con la observacion, especialmente en condiciones de iluminacion o clutter no vistas en entrenamiento.
- Sesgos del dataset: RoboDojo se basa en entornos simulados y tareas de mesa; el modelo puede no generalizar a entornos reales sin fine-tuning adicional.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-VL tiene su propia licencia (Apache 2.0 segun el autor), por lo que se debe verificar la compatibilidad de las dependencias.
- Sin soporte de cuantizacion oficial: no se proporcionan versiones GGUF, ONNX o TensorRT, lo que limita el despliegue en edge devices o entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarVLA/VLAct-Qwen3VL4B-OFT-RoboDojo
- Codigo fuente del framework StarVLA: https://github.com/starVLA/starVLA
- Repositorio espejo del framework: https://github.com/Zeffiretti/starvla
- Pagina del proyecto StarVLA: https://starvla.github.io/
- Organizacion StarVLA en Hugging Face: https://huggingface.co/StarVLA/models
