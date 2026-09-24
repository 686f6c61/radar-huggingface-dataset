# tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3btactile260921

## Resumen

Este repositorio contiene un checkpoint de politica robótica basado en la familia GR00T-N1.7-3B, desarrollado por el usuario tarzanagh, orientado a manipulación bimanual diestra con realimentación táctil. El modelo ha sido entrenado por imitación para una tarea concreta: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sujeta una caja de pañuelos con la mano izquierda y extrae un pañuelo con la derecha. Los datos se recogieron mediante teleoperación con guante Meta (sin exoesqueleto) y seguimiento de muñeca Vive.

Se trata de un modelo de visión-lenguaje-acción (VLA) de aproximadamente 3.144 millones de parámetros, derivado de GR00T-N1.7-3B al que se añade una entrada táctil de fuerzas en las puntas de los dedos. El espacio de estado/acción es de 38 dimensiones de posiciones articulares más 30 dimensiones de fuerza táctil, lo que da un vector de estado de 68 dimensiones. El entrenamiento se realizó durante 10.000 pasos con semilla 1000 sobre 120 episodios (108 de entrenamiento y 12 de validación).

Su relevancia es fundamentalmente de investigación: forma parte de una comparativa de 24 ejecuciones que enfrenta cuatro familias de políticas (ACT, Diffusion Policy, GR00T y pi0) en tres tareas, y sirve como punto de referencia para estudiar si la entrada táctil aporta mejoras medibles. El propio autor indica que, en esa comparativa, la señal táctil no marcó diferencia más allá del ruido y que GR00T obtuvo el menor error en todas las tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) basado en GR00T-N1.7-3B; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 3.144.016.000 (aproximadamente 3,14 mil millones) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (modelo de robotica, no orientado a interaccion linguistica) |
| Licencia | other (otros) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone GR00T-N1.7-3B, un modelo de vision-lenguaje-accion de la familia GR00T, al que se le incorpora informacion tactil. La politica recibe cuatro camaras RGB a 640x360 y 30 fps, gestiona un espacio de accion de 38 dimensiones correspondientes a las posiciones articulares (7 de brazo izquierdo, 12 de mano izquierda, 7 de brazo derecho y 12 de mano derecha) y consume un vector de 30 dimensiones de fuerza en las puntas de los dedos (5 dedos por 3 ejes por cada mano). La concatenacion de estado y fuerzas da un vector de 68 dimensiones.

El entrenamiento sigue un esquema de aprendizaje por imitacion (behavioral cloning) a partir de datos de teleoperacion, con 120 episodios de los que 108 se usan para entrenar y 12 quedan reservados (cada decimo). Se ejecutaron 10.000 pasos con semilla 1000. La politica opera por trozos de accion (action chunking): observa el estado real cada 16 pasos, predice un bloque de acciones y conserva las 16 primeras. No se documentan en la informacion disponible detalles sobre el dataset de preentrenamiento del backbone, la composicion de los datos, ni si hubo fases de RLHF o DPO.

## Capacidades

- Manipulacion bimanual: coordinacion de dos brazos y dos manos para sujetar y extraer un objeto de forma simultanea.
- Manipulacion diestra: control de manos XHand1 con 12 grados de libertad por mano.
- Percepcion multimodal: integra cuatro camaras RGB y senal tactil de fuerza en las puntas de los dedos.
- Aprendizaje por imitacion: reproduce trayectorias derivadas de demostraciones de teleoperacion con guante Meta y seguimiento Vive.
- Prediccion por trozos de accion: genera bloques de acciones y los ejecuta en bucle de control de 16 pasos.
- No es un modelo de lenguaje: no se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas ni conversacion.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni modos especiales de pensamiento, vision o audio mas alla de la percepcion visual y tactil descrita.

## Casos de uso

- Investigacion en manipulacion bimanual diestra: sirve como referencia reproducible para comparar politicas en una tarea de sujecion con una mano y extraccion con la otra, con metricas de error en bucle abierto ya publicadas.
- Estudio del aporte de la senal tactil: al formar parte de la comparativa de 24 ejecuciones (con y sin tactil), permite cuantificar si la fuerza en los dedos mejora el seguimiento de trayectoria frente a la version sin tactil.
- Linea base para nuevos metodos de imitacion: los errores en bucle abierto por grupo articular (brazo y mano de cada lado) ofrecen un punto de comparacion objetivo para propuestas posteriores.
- Replicacion de experimentos de teleoperacion: el esquema de recogida de datos (guante Meta sin exoesqueleto, seguimiento Vive, 4 camaras a 30 fps) puede reutilizarse como protocolo para generar nuevos conjuntos de episodios.
- Evaluacion comparativa entre familias de politicas: junto con las versiones ACT, Diffusion Policy y pi0 del mismo autor, permite contrastar arquitecturas sobre datos identicos y un mismo espacio de estado/accion.
- Estudio de espacios de accion y estado de alta dimension: el vector de 68 dimensiones (38 de articulaciones mas 30 de fuerza tactil) es un caso practico para investigar el escalado de la representacion de estado en politicas VLA.
- Experimentos de chunking y frecuencia de reobservacion: el diseno de observar cada 16 pasos permite analizar el compromiso entre latencia de control y estabilidad de la trayectoria.

## Benchmarks y rendimiento

Los unicos datos publicados son errores en bucle abierto con el conjunto reservado (n=12), medidos como la media del valor absoluto de la diferencia entre accion predicha y accion registrada, en radianes, con error estandar de la media.

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo | 0,0086 ± 0,0003 | 0,0082 ± 0,0004 | 0,0158 ± 0,0003 | 0,0117 ± 0,0004 |
| hold-first-frame (referencia) | 0,1975 | 0,0514 | 0,2628 | 0,1440 |

El autor advierte que esta metrica mide seguimiento de trayectoria, no exito en la tarea, y que ninguna prueba se ejecuto sobre hardware real. En la comparativa agregada de cuatro familias y tres tareas, la entrada tactil no aporto diferencia mas alla del ruido y GR00T obtuvo el menor error en todas las tareas. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32 el repositorio ocupa 12,6 GB, coherente con 3,14 mil millones de parametros; en FP16 o BF16 la estimacion ronda los 6,3 GB y en INT8 aproximadamente 3,1 GB.
- GPU recomendadas para entrenamiento o inferencia sin cuantizar en FP32: A100, H100, L40S o cualquier acelerador con 16 GB o mas de memoria.
- Cabe en GPU de consumo: si, en tarjetas con 8-16 GB o mas (RTX 3090, RTX 4080, RTX 4090) siempre que se use FP16/BF16 o cuantizacion, teniendo en cuenta que el pipeline tambien debe procesar cuatro flujos de camara.
- Opciones de despliegue: no se especifican en la informacion proporcionada; al tratarse de una politica robotica con backbone VLA, habitualmente se ejecuta mediante pipelines de inferencia propios de la pila GR00T y no mediante servidores de texto como vLLM, TGI o llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

El propio autor publica, para la misma tarea, ejecuciones de otras tres familias de politicas con y sin entrada tactil. Los datos comparativos disponibles son los siguientes.

| Modelo | Familia | Entrada tactil | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| ckpt_..._gr00t3btactile260921 (este) | GR00T-N1.7-3B | Si | other | HuggingFace | Menor error en todas las tareas segun el autor |
| ckpt_..._gr00t3b260921 | GR00T-N1.7-3B | No | other | HuggingFace | Variante sin tactil de la misma base |
| ckpt_..._act260918 y acttactile260921 | ACT | No / Si | other | HuggingFace | Familia comparable en la comparativa |
| ckpt_..._dp260918 y dptactile260921 | Diffusion Policy (DP) | No / Si | other | HuggingFace | Familia comparable en la comparativa |
| ckpt_..._pi05260921 y pi05tactile260921 | pi0 | No / Si | other | HuggingFace | Familia comparable en la comparativa |

Los parametros, la longitud de contexto y las cifras de rendimiento detalladas de las alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion es exclusivamente en bucle abierto y mide seguimiento de trayectoria; no se ejecuto ninguna prueba sobre hardware real, por lo que no hay evidencia de exito en la tarea.
- Conjunto de datos reducido: 120 episodios de una unica tarea, sin diversidad de objetos, entornos ni condiciones de iluminacion documentadas.
- La senal tactil no aporto mejora medible frente a la version sin tactil en la comparativa del propio autor, lo que cuestiona su utilidad en este caso concreto.
- El modelo esta especializado en una tarea unica (extraccion de un panuelo de una caja) y no se documenta capacidad de generalizacion a otras tareas.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial queda sujeto a la licencia del autor y debe verificarse antes de cualquier despliegue en produccion.
- Idioma: no se documentan idiomas soportados; al ser un modelo de robotica, no procede esperar capacidades linguisticas.
- Riesgo de sobreajuste a la configuracion de teleoperacion concreta (guante Meta y Vive), que puede no transferirse a otras interfaces.
- Riesgo de deriva y acumulacion de error fuera de distribucion, propio de las politicas de imitacion evaluadas en bucle abierto.
- Repositorio sin descargas ni validacion por parte de la comunidad en el momento de la consulta, lo que limita la reproducibilidad independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3btactile260921
- Ejecucion ACT sin tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_act260921
- Ejecucion ACT con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921
- Ejecucion Diffusion Policy sin tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dp260921
- Ejecucion Diffusion Policy con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dptactile260921
- Ejecucion GR00T-3B sin tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921
- Ejecucion pi0 sin tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05260921
- Ejecucion pi0 con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921
