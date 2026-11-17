# yyuncong/SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step13000

## Resumen

SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step13000 es un checkpoint intermedio de un modelo de mundo (world model) para robótica desarrollado por el usuario yyuncong. El modelo aprende dinámica directa (forward dynamics) en contexto: dado un contexto de secuencias de observación y acción, predice la evolución de escenas bimanuales de manipulacion a partir de datos multivia (tres camaras por fotograma). Se publica como parte de una familia de tres checkpoints que comparten datos, muestreo y configuracion, y que difieren en la estrategia de seleccion de contexto.

El modelo parte de los pesos de mvSV3p (update 20000) y se entrena sobre el dataset SyncSim RoboTwin 2.0 head-camera (45.184 episodios, 225.001 grabaciones) con acciones de pose de efector final de ambos brazos y un esquema de retrieval en contexto con un selector aprendido ("selector v2") que elige que fragmentos ocupan las ranuras de contexto. El checkpoint corresponde a la iteracion 13000 de 20320 planificadas (12.792 actualizaciones del generador), por lo que es un estado no final de entrenamiento.

Es relevante porque expone una receta concreta de world modeling para robotica bimanual con contexto recuperado, acciones de pose realizadas y perdida ponderada por movimiento, ademas de publicar los checkpoints de control (equal-weight y recent8) que permiten aislar el efecto del selector aprendido frente a un scorer fijo y frente a un baseline de contexto reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo de difusion/transformer para video y acciones; no se detalla en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (contexto compuesto por K fragmentos recuperados; K no se explicita) |
| Tipos de cuantizacion | no disponible (checkpoint publicado presumiblemente en bf16; no se confirma) |
| Idiomas soportados | no disponible (modelo no linguistico; entrada visual y de acciones) |
| Licencia | openmdw-1.1 (etiqueta `license: other`, enlace a NVIDIA Cosmos LICENSE) |
| Formato de pesos | no disponible (repo de 30,4 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

Se trata de un modelo de mundo de video condicionado por acciones, con un mecanismo de contexto en el que se insertan fragmentos recuperados de una libreria (`mv_strip_rt2h_v1_s4_views_sib_grip_anch_wrist`). Cada fotograma se representa como una tira de 1536x384 compuesta por tres celdas de 512x384: una camara de cabeza seguida de las dos camaras de muneca (izquierda y derecha). Las acciones son deltas de pose del efector final de ambos brazos, 14 numeros por paso (dx, dy, dz en cm, roll, pitch, yaw en grados, y apertura del gripper), calculados en el marco del efector en el fotograma anterior. El dominio de encarnacion es `bimanual_gripper` (id 26), con copia de filas desde `gripperhead` en el warm start.

El entrenamiento usa el dataset SyncSim RoboTwin 2.0 head-camera (45.184 episodios expertos y 179.817 rollouts contrafactuales, 50 tareas en 8 conjuntos con plataformas aloha-agilex, arx-x5, franka y ur5), con un 2% de episodios reservados por hash SHA-256 y fps de condicionamiento de 15. La innovacion principal es el selector de contexto v2, un scorer aprendido que elige que fragmentos llenan las ranuras en contexto bajo la regla de hermanos OR, entrenado con 40 bloques de etiquetado de 8 y un ciclo de learning rate especifico para 20.000 actualizaciones del generador. Se mantiene la receta de mvSV3p: retrieval views-first, acciones de pose realizadas y perdida ponderada por movimiento por celda.

## Capacidades

- Prediccion de dinamica directa: genera la evolucion futura de escenas roboticas bimanuales condicionada por acciones de efector final.
- Modelado multivista: procesa de forma conjunta una camara de cabeza y dos camaras de muneca por fotograma.
- Razonamiento en contexto: utiliza fragmentos recuperados de una libreria de grabaciones como contexto para condicionar la prediccion.
- Seleccion aprendida de contexto: el selector v2 puntua y elige los fragmentos que ocupan las ranuras de contexto.
- Soporte de acciones bimanuales: 14 dimensiones por paso (pose y gripper de ambos brazos).
- Capacidades linguisticas: no disponibles (modelo no orientado a texto).
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Modo thinking, vision general, audio: no disponibles.

## Casos de uso

- Simulacion de politicas de manipulacion bimanual: el modelo predice la evolucion de la escena dado un plan de acciones, lo que permite evaluar trayectorias antes de ejecutarlas en el robot real y reducir el coste de pruebas fisicas.
- Aumento de datos para entrenamiento de politicas: generar rollouts sinteticos contrafactuales a partir de los expertos, aprovechando los 179.817 rollouts ya presentes en el dataset como referencia de perturbaciones realistas.
- Planificacion basada en modelo: usar la prediccion de dinamica directa dentro de un bucle de optimizacion de acciones para tareas de ensamblaje o agarre con dos brazos.
- Deteccion de anomalias en ejecucion: comparar la prediccion del modelo con la observacion real de las tres camaras para identificar desviaciones en la ejecucion de una politica.
- Investigacion en world models: servir como checkpoint de referencia para estudiar el efecto del selector de contexto aprendido frente al scorer fijo (equal-weight) y al baseline recent8.
- Evaluacion de representaciones multivista: analizar como influye el layout de tira de tres camaras en la calidad de la prediccion de movimiento y en la consistencia entre vistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 30,4 GB, lo que sugiere pesos en bf16 de un modelo de decenas de miles de millones de parametros, pero no se confirma.
- GPU recomendadas: el entrenamiento se realizo en 4 nodos x 8 B200 (64 GPU B200); el checkpoint comparable recent8 se entreno en 4 nodos x 8 H100.
- Cabe en GPU de consumo: no disponible; por el tamano del repo es improbable en GPUs de 24 GB sin cuantizacion, aunque no se confirma.
- Opciones de despliegue: no disponibles (no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; es un modelo de robotica, no un LLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Inicializacion | Contexto | Entrenamiento | Estado | Licencia |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step13000 (este) | mvSV3p update 20000 | Fragmentos recuperados con selector v2 aprendido y regla OR | 4 nodos x 8 B200; 12.792 actualizaciones del generador | Checkpoint intermedio (iteracion 13000 de 20320) | openmdw-1.1 |
| SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step13000 | mvSV3p update 20000 | Fragmentos con scorer fijo (suma de 7 similitudes, pesos 1x7) y regla OR | 4 nodos x 8 B200; 13.000 actualizaciones del generador | Checkpoint (iteracion 13000) | openmdw-1.1 |
| SyncWorld-mv3-strip384-recent8-rt2h-from20k-step12000 | mvA3p update 20000 | K fragmentos de la propia grabacion previos al ancla; sin libreria ni selector | 4 nodos x 8 H100; 12.000 actualizaciones del generador | Checkpoint (iteracion 12000) | openmdw-1.1 |

La comparacion entre el modelo con selector v2 y el equal-weight es la mas limpia para aislar el efecto del selector aprendido, ya que comparten inicializacion, libreria, K, optimizador y semillas. El baseline recent8 difiere tambien en inicializacion y contexto, por lo que no es una comparacion emparejada de retrieval.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la iteracion 13000 de 20320 (12.792 de 20.000 actualizaciones del generador), por lo que no representa el estado final del entrenamiento.
- No es un modelo de lenguaje: no procesa ni genera texto, y sus capacidades linguisticas, de tool calling y de agentes no estan disponibles.
- Datos de entrenamiento acotados al simulador: el dataset proviene de SyncSim RoboTwin 2.0, por lo que la transferencia a robots reales no esta validada en la informacion disponible.
- Dominio de encarnacion especifico (`bimanual_gripper`, id 26): la reasignacion posterior a id 22 en la rama in-context obliga a leer las filas id-26 como `bimanual_gripper_rt2h`, lo que puede generar confusion en integraciones.
- Sin benchmarks publicados: no hay numeros de MMLU, HumanEval, GSM8K ni metricas de world modeling que permitan cuantificar el rendimiento.
- Licencia openmdw-1.1: es necesario revisar los terminos del enlace a NVIDIA Cosmos LICENSE antes de un uso comercial; la etiqueta `license: other` indica condiciones especificas no resumidas en la model card.
- Riesgo de alucinacion visual: como modelo generativo de video, puede producir predicciones plausibles pero fisicamente incorrectas; no se documentan sesgos especificos.
- Sin informacion sobre cuantizaciones ni formatos de pesos: la integracion en pipelines de inferencia requiere inspeccionar el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step13000
- Checkpoint equal-weight: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step13000
- Checkpoint recent8: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-rt2h-from20k-step12000
- Checkpoint previo step-2000 (selector v4): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step2000
- Copia bf16 de mvSV3p update 20000: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Checkpoint recent8 s7pose update 20000: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
