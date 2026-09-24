# tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919

## Resumen

Este repositorio contiene un checkpoint de politica de imitacion para manipulacion robotica bimanual diestra, desarrollado por el usuario de HuggingFace `tarzanagh`. Se trata de un modelo ACT (Action Chunking Transformer) con entrada tactil, entrenado sobre un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1. La tarea es concreta: recoger un juguete desde el segundo nivel de una estanteria y depositarlo en el primero, usando principalmente el brazo derecho mientras el izquierdo permanece casi estatico. Los datos se recogieron mediante teleoperacion con meta-glove (sin exoesqueleto) y seguimiento de muneca con Vive.

El checkpoint tiene 51.764.902 parametros (unos 51,8 millones) y un peso de repositorio de 0,2 GB, lo que lo situa en la categoria de politicas ligeras que caben holgadamente en GPUs de consumo. Se distribuye en formato `safetensors` bajo licencia Apache 2.0. No es un modelo de lenguaje: no procesa texto ni tiene capacidades de generacion, razonamiento o tool calling. Su relevancia es de investigacion en robot learning, ya que forma parte de una familia de 24 ejecuciones del mismo experimento que comparan ACT, Diffusion Policy, GR00T y pi0.5, con y sin tactil, sobre tres tareas.

La model card es inusualmente honesta en sus limitaciones: el autor indica que la metrica reportada es error de seguimiento de trayectoria en bucle abierto, no tasa de exito, y que ninguna de las politicas se ha ejecutado sobre hardware real. Tambien reporta que la entrada tactil no aporto mejora mas alla del ruido en las cuatro familias y tres tareas evaluadas, y que GR00T obtuvo el error mas bajo en todas ellas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con entrada tactil; detalle de capas y dimensiones no disponible |
| Parametros totales | 51.764.902 (~51,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica el concepto de contexto de LLM; la politica observa el estado real cada 16 pasos y predice un chunk de acciones) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en `safetensors` |
| Idiomas soportados | no aplica (modelo de robotica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de estado | 68-D (38-D de posiciones articulares + 30-D de fuerza en puntas de dedos) |
| Dimension de accion | 38-D `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` en posiciones articulares |
| Entradas sensoriales | 4 camaras RGB, 640x360 a 30 fps, mas fuerza tactil en puntas |
| Hardware robotico objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el modelo como ACT + tactil. ACT (Action Chunking Transformer) es una politica de imitacion basada en transformer que predice bloques de acciones futuras en lugar de una unica accion por paso; en este caso el autor concreta que la politica ve la observacion real cada 16 pasos, predice un chunk y conserva las primeras 16 acciones. El estado de entrada combina 38 dimensiones de posiciones articulares —7 de brazo y 12 de mano por cada lado— con 30 dimensiones de fuerza en las puntas de los dedos (5 dedos x 3 ejes por mano), resultando en un vector de 68 dimensiones. La salida son 38 dimensiones de accion en el mismo espacio articular. No se especifican en la informacion disponible el numero de capas, la dimension del modelo, la existencia de un componente CVAE ni la configuracion exacta del encoder visual.

Los datos de entrenamiento constan de 155 episodios teleoperados, de los cuales 139 se usan para entrenamiento y 16 quedan reservados (uno de cada diez). El entrenamiento se ejecuto durante 10.000 pasos con semilla 1000. La recogida de datos se hizo con teleoperacion mediante meta-glove, sin exoesqueleto, y seguimiento de muneca con Vive. La model card no indica numero de tokens ni de muestras procesadas, composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (conceptos que, por otro lado, no aplican a este tipo de politica). Como innovacion destacable, el autor evalua explicitamente la aportacion de la modalidad tactil mediante ablacion contra las variantes sin tactil del mismo pipeline.

## Capacidades

- Generacion de acciones motoras: predice chunks de 16 acciones de 38 dimensiones en espacio de posiciones articulares para un robot bimanual con manos diestras de 12 grados de libertad por mano.
- Ejecucion de una tarea especifica de pick-and-place: recoger un objeto desde el segundo nivel de una estanteria y colocarlo en el primero, con el brazo derecho como actuador principal y el izquierdo practicamente estatico.
- Percepcion visual multi-camara: consume simultaneamente 4 flujos RGB a 640x360 y 30 fps.
- Integracion de senal tactil: incorpora 30 dimensiones de fuerza en puntas de dedos al vector de estado, aunque el propio autor reporta que esta modalidad no aporta mejora medible mas alla del ruido en la comparativa realizada.
- Seguimiento de trayectorias de referencia: obtiene errores medios de 0,0056 rad en brazo izquierdo, 0,0132 rad en mano izquierda, 0,0617 rad en brazo derecho y 0,0442 rad en mano derecha sobre el conjunto reservado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo de pensamiento, vision general, audio ni ninguna capacidad fuera del dominio de control robotico.

## Casos de uso

- Reproduccion de la tarea entrenada en laboratorio: el checkpoint ejecuta el pick-and-place de estanteria sobre un DexMate Vega-1 con manos XHand1, siempre que la disposicion de camaras, iluminacion y objetos sea similar a la de los datos de teleoperacion.
- Baseline en estudios de imitacion bimanual: sirve como referencia de error de seguimiento para comparar arquitecturas en el mismo banco de tareas, dado que el autor publica 24 ejecuciones del mismo experimento con ACT, Diffusion Policy, GR00T y pi0.5.
- Ablacion de modalidad tactil: la pareja `act260919` / `acttactile260919` permite reproducir el analisis de si la fuerza en puntas mejora el error de seguimiento, con la conclusion reportada de que no hay diferencia significativa.
- Punto de partida para fine-tuning en tareas cercanas: al ser un checkpoint de 51,8 M de parametros y 0,2 GB, se puede reentrenar o ajustar con presupuestos modestos para variantes de la misma tarea, por ejemplo cambios de altura de estante o de objeto.
- Investigacion en pipelines de teleoperacion: el modelo documenta el flujo meta-glove mas Vive sin exoesqueleto, util para reproducir la metodologia de recogida de datos en otros montajes bimanuales.
- Estudio de coste computacional en robotica: su tamano permite medir latencias de inferencia en GPUs de consumo dentro de un bucle de control con observacion cada 16 pasos, sin necesidad de aceleradores de centro de datos.
- Evaluacion metodologica de metricas: sirve como caso practico para discutir la diferencia entre error de bucle abierto y tasa de exito en hardware, dado que el autor explicita que solo se midio lo primero.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden al error de bucle abierto sobre el conjunto reservado (media de |prediccion - accion registrada|, en radianes, mas menos error estandar de la media, n=16):

| Metrica | Este modelo | Baseline hold-first-frame |
|---|---|---|
| Brazo izquierdo (rad) | 0,0056 ± 0,0007 | 0,0219 |
| Mano izquierda (rad) | 0,0132 ± 0,0020 | 0,0172 |
| Brazo derecho (rad) | 0,0617 ± 0,0055 | 0,3166 |
| Mano derecha (rad) | 0,0442 ± 0,0034 | 0,2380 |

Contexto adicional aportado por el autor: la metrica mide seguimiento de trayectoria, no exito de tarea, y ninguna ejecucion se probo sobre hardware real. En el conjunto de cuatro familias y tres tareas, la entrada tactil no produjo diferencias mas alla del ruido y GR00T obtuvo el error mas bajo en todas las tareas. No se publican en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de cualquier otro benchmark de lenguaje, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51.764.902 parametros, aproximadamente 208 MB en FP32, 104 MB en FP16 y 52 MB en INT8, sin contar activaciones ni el procesamiento de las 4 camaras RGB.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o similar cubre el caso con holgura. No se requiere A100 ni H100.
- Cabe en GPU de consumo: si, con margen amplio; el cuello de botella previsible es la captura y preprocesado de las cuatro camaras a 30 fps, no el modelo.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. El despliegue se realiza con el script de inferencia en PyTorch del pipeline de entrenamiento, integrado en el bucle de control del robot. No se documenta en la informacion disponible integracion con LeRobot ni con ROS.
- Latencia y throughput: no disponible. El unico dato temporal es que la politica consume observacion real cada 16 pasos y las camaras capturan a 30 fps.
- Almacenamiento: el repositorio ocupa 0,2 GB, por lo que el despliegue en el borde o en un equipo de control compacto es viable.

## Comparativa con modelos similares

Los modelos comparables proceden de la propia familia de experimentos del autor sobre la misma tarea. No se publican en la informacion disponible los recuentos de parametros, contextos ni licencias de las variantes hermanas.

| Modelo | Parametros | Contexto | Error de bucle abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT + tactil) | 51,8 M | no disponible | 0,0056 / 0,0132 / 0,0617 / 0,0442 rad (L-arm / L-hand / R-arm / R-hand) | Apache 2.0 | HuggingFace |
| ACT sin tactil (`..._act260919`) | no disponible | no disponible | no disponible en esta ficha | no disponible | HuggingFace |
| Diffusion Policy (`..._dp260919`) | no disponible | no disponible | no disponible en esta ficha | no disponible | HuggingFace |
| Diffusion Policy + tactil (`..._dptactile260919`) | no disponible | no disponible | no disponible en esta ficha | no disponible | HuggingFace |
| GR00T 3B (`..._gr00t3b260918`) | no disponible (el nombre sugiere 3B) | no disponible | el mas bajo de todas las familias y tareas, segun el autor | no disponible | HuggingFace |
| GR00T 3B + tactil (`..._gr00t3btactile260918`) | no disponible (el nombre sugiere 3B) | no disponible | no disponible en esta ficha | no disponible | HuggingFace |
| pi0.5 (`..._pi05260918`) | no disponible | no disponible | no disponible en esta ficha | no disponible | HuggingFace |
| pi0.5 + tactil (`..._pi05tactile260918`) | no disponible | no disponible | no disponible en esta ficha | no disponible | HuggingFace |

## Limitaciones y advertencias

- Tarea unica y muy estrecha: un solo pick-and-place en una estanteria concreta; no hay evidencia de generalizacion a otros objetos, alturas, disposiciones o robots.
- Sin validacion en hardware: el autor indica explicitamente que nada se ejecuto sobre el robot real, por lo que no existe tasa de exito ni dato de robustez fisica.
- Metrica de bucle abierto: el error reportado mide seguimiento de trayectoria frente a acciones teleoperadas registradas, no finalizacion de la tarea. Un error bajo no garantiza exito.
- Evidencia estadistica limitada: solo 16 episodios reservados y una unica ejecucion de entrenamiento con semilla 1000, sin estimacion de varianza entre semillas. En la mano izquierda el margen frente al baseline es estrecho (0,0132 ± 0,0020 frente a 0,0172).
- La modalidad tactil no aporta mejora medible: el propio autor reporta que la entrada de fuerza en puntas no marca diferencia mas alla del ruido en las cuatro familias y tres tareas evaluadas.
- Dataset pequeno: 155 episodios teleoperados, suficientes para una politica de imitacion acotada pero no para generalizacion amplia.
- Sesgos y dominio: al depender de demostraciones de un operador concreto, con meta-glove y tracking Vive, la politica hereda las trayectorias, el estilo de movimiento y el sesgo de ese operador; cambios de iluminacion, posicion de camaras o tipo de objeto pueden degradar el rendimiento.
- Idiomas: no aplica; este modelo no procesa lenguaje.
- Licencia: Apache 2.0 permite uso comercial del checkpoint, pero solo se distribuyen los pesos (0,2 GB); la licencia del dataset de teleoperacion y del codigo base de ACT no se especifica en la informacion disponible, por lo que conviene verificarla antes de un uso productivo.
- Procedencia y trazabilidad: el repositorio no tiene descargas ni likes y la documentacion no incluye detalles de configuracion de la arquitectura, lo que dificulta la reproducibilidad completa.
- La model card anuncia 24 ejecuciones de la tarea, pero solo enlaza 8; la comparativa completa no esta accesible desde este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919
- Perfil del autor: https://huggingface.co/tarzanagh
- ACT sin tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919
- Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919
- Diffusion Policy + tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919
- GR00T 3B: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918
- GR00T 3B + tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918
- pi0.5: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918
- pi0.5 + tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
