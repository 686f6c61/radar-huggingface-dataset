# twanghcmut/pi05-so101-bimanual-fold-towel

## Resumen

`twanghcmut/pi05-so101-bimanual-fold-towel` es un checkpoint de politica robotica de tipo vision-language-action (VLA) obtenido por fine-tuning de `physical-intelligence/pi05_base` (π0.5, de Physical Intelligence) sobre un unico conjunto de datos de manipulacion bimanual. La tarea concreta es doblar una toalla azul por la mitad, de delante hacia atras, con dos brazos roboticos SO-101. El modelo lo publica el usuario `twanghcmut` y se distribuye con licencia Apache 2.0.

El interes del checkpoint es acotado pero claro: demuestra el flujo completo de adaptacion de π0.5 a un robot de bajo coste (SO-101) con dos brazos, incluyendo el patch de configuracion de datos, el conversor de formato LeRobot y un script de metricas. No es un modelo de proposito general, sino una politica especializada en una sola tarea, entrenada con 51 episodios (142.248 fotogramas a 30 fps) y evaluada unicamente en bucle abierto sobre datos de entrenamiento.

El repositorio ocupa 7,5 GB y contiene 3.616.757.520 parametros en formato safetensors. La relevancia actual esta en que sirve como referencia reproducible para quien quiera replicar el pipeline de fine-tuning de π0.5 en hardware asequible, y como comparacion directa con un fine-tuning equivalente de GR00T N1.7 sobre los mismos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi, PyTorch); detalles internos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de accion de 16 pasos, 0,53 s a 30 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable como modelo de lenguaje; instrucciones de tarea en ingles en el dataset |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria openpi) |

## Arquitectura y entrenamiento

El modelo parte de `physical-intelligence/pi05_base`, una politica VLA de openpi implementada en PyTorch. La informacion disponible no detalla la arquitectura interna de la base (composicion del backbone visual, del codificador de lenguaje ni del cabezal de acciones), por lo que no se puede confirmar si emplea atencion completa, atencion lineal u otra variante. Lo que si se documenta es la interfaz robotica: estado y accion de 12 dimensiones (seis articulaciones por brazo: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` y `gripper`, en grados, con el gripper en escala 0-100), tres camaras (`top` como imagen base, `left_wrist` y `right_wrist`) y un horizonte de accion de 16 pasos.

El fine-tuning se realizo con la configuracion `pi05_so101_bimanual_fold_towel` (`LeRobotSO101BimanualDataConfig`, `SO101BimanualInputs`) sobre un patch (`code/pi05_so101_bimanual.patch`) aplicado a `hungho77/openpi` en el commit `7aa7b15`. Se entrenaron 6.000 pasos con batch efectivo de 128 (32 x 4 de acumulacion), lo que suma 768.000 muestras, aproximadamente 5,4 epocas sobre 51 episodios y 142.248 fotogramas a 30 fps (80-111 s por episodio). Se uso learning rate 2,5e-5 con decaimiento coseno, 1.000 pasos de warmup y precision bf16, todo en una unica H100 de 80 GB durante 13,6 horas (8,1 s por paso). La perdida descendio de 0,177 en el paso 0 a 0,0070 en el paso 5.000. Las acciones de las diez articulaciones de brazo se predicen como deltas respecto al estado actual, mientras que ambos grippers se tratan de forma absoluta; la politica devuelve objetivos absolutos. La normalizacion es por cuantiles, con estadisticas en `assets/.../norm_stats.json`.

## Capacidades

- Generacion de trayectorias de accion para manipulacion bimanual: produce 16 acciones futuras por inferencia a partir de imagenes y estado articular.
- Control de dos brazos SO-101 coordinados sobre una tarea especifica de doblado de toalla.
- Fusion de tres vistas de camara (vista superior y dos vistas de muneca) con el estado proprioceptivo de 12 dimensiones.
- Prediccion de deltas articulares para los diez joints de brazo y de objetivos absolutos para los dos grippers.
- Seguimiento de una instruccion de tarea en lenguaje natural (en ingles), segun el formato del dataset de entrenamiento.
- No dispone de tool calling, function calling, capacidades de agente multi-paso ni modos de razonamiento explicito.
- No soporta vision general ni audio fuera del contexto de las camaras del robot.
- Capacidades multilingues: no aplicables; la unica instruccion documentada esta en ingles.

## Casos de uso

- Replicacion del pipeline de fine-tuning de π0.5: el repositorio incluye el patch de configuracion, el conversor de LeRobot v3.0 a v2.1 y el script de metricas, lo que permite reproducir el entrenamiento en una sola GPU de 80 GB en menos de 14 horas.
- Punto de partida para nuevas tareas bimanuales en SO-101: sirve como inicializacion para tareas de doblado o plegado con datos propios, sustituyendo el dataset y manteniendo la interfaz de 12 dimensiones y tres camaras.
- Comparacion de familias VLA en hardware de bajo coste: al existir un fine-tuning equivalente de GR00T N1.7 sobre los mismos datos, permite contrastar ambas arquitecturas con la misma metrica y el mismo conjunto de episodios.
- Validacion de infraestructura de robot antes de desplegar en real: la evaluacion en bucle abierto sobre episodios completos (2.460-3.328 pasos) permite comprobar la coherencia de las predicciones con las acciones grabadas antes de invertir en pruebas fisicas.
- Docencia y prototipado en robotica de manipulacion: un checkpoint Apache 2.0 de 3,6 mil millones de parametros sobre brazos SO-101 es un material asequible para cursos y laboratorios que quieran estudiar VLA sin acceso a robots industriales.
- Referencia de normalizacion y formato de datos: el uso de normalizacion por cuantiles y de acciones delta para brazos con grippers absolutos es un patron reutilizable en otros proyectos de imitacion con LeRobot.

## Benchmarks y rendimiento

Evaluacion en bucle abierto sobre cuatro episodios de entrenamiento (0, 17, 34 y 50), con episodios completos de 2.460 a 3.328 pasos y llamada a la politica cada 16 pasos. El MAE se expresa en unidades del dataset (grados; gripper 0-100) y el nMAE se normaliza por la desviacion absoluta media de las acciones (26,374).

| Modelo | MAE 12 dims | MAE brazo izq. (5) | MAE brazo der. (5) | MAE grippers (2) | nMAE | Primeros 400 pasos |
|---|---|---|---|---|---|---|
| π0.5 (este checkpoint) | 0,965 | 0,844 | 1,270 | 0,505 | 3,66 % | 0,933 |
| GR00T N1.7 | 1,296 | 1,211 | 1,649 | 0,625 | 4,91 % | 1,236 |
| Baseline "hold" | 1,905 | 1,918 | 2,403 | 0,630 | 7,22 % | 1,561 |

Advertencia del autor: los 51 episodios se usaron integramente para entrenamiento, sin particion de validacion. Son comprobaciones de ajuste sobre datos de entrenamiento, no tasas de exito, y no existe ningun resultado en robot real para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 3,62 mil millones de parametros, en bf16 los pesos ocupan aproximadamente 7,2 GB, a los que hay que sumar el estado de activaciones y las tres entradas de camara.
- GPU de entrenamiento documentada: 1 x H100 80 GB, 13,6 horas para 6.000 pasos (8,1 s por paso) con batch efectivo de 128.
- GPU recomendadas para inferencia: no especificadas por el autor. Por tamano de pesos en bf16, una GPU consumer de 24 GB (RTX 4090, RTX 3090) deberia poder alojar los pesos, aunque no hay confirmacion ni medicion publicada.
- Despliegue: la libreria declarada es openpi (PyTorch). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para una politica VLA.
- Latencia y throughput: no disponibles. El unico dato temporal es el horizonte de accion de 16 pasos, equivalente a 0,53 s a 30 fps.
- Nota de despliegue del autor: con datos a 30 fps, `smooth_step = control_hz / 30`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento (nMAE, mismos datos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SO-101 bimanual fold towel (este) | 3,62 B | horizonte de 16 acciones | 3,66 % | Apache 2.0 | Hugging Face, openpi |
| GR00T N1.7 SO-101 bimanual fold towel | no disponible | no disponible | 4,91 % | no disponible en la informacion | Hugging Face (`twanghcmut/gr00t-n1d7-so101-bimanual-fold-towel`) |
| π0.5 base (`physical-intelligence/pi05_base`) | no disponible | no disponible | no evaluado en esta tarea | no disponible en la informacion | Hugging Face, openpi |

La comparacion con π0.5 base no es posible en terminos de rendimiento porque no se ha evaluado sobre este dataset. Frente a GR00T N1.7, el presente checkpoint obtiene un MAE agregado menor (0,965 frente a 1,296) en la misma evaluacion en bucle abierto, aunque ambos estan ajustados sobre los mismos datos de entrenamiento y sin particion de validacion.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha visto una tarea ("Fold the blue towel in half from front to back with both arms") y no se espera que generalice a otras tareas sin nuevo fine-tuning.
- Sin evaluacion en robot real: no existe ningun resultado de exito fisico para este checkpoint; las metricas son de bucle abierto sobre datos de entrenamiento.
- Sin particion de validacion: los 51 episodios se usaron para entrenar, por lo que las cifras de MAE son comprobaciones de ajuste y estan sesgadas a la baja.
- Riesgo de sobreajuste al entorno concreto del dataset (posiciones de camara, iluminacion, fondo y disposicion de la toalla).
- Riesgo de deriva y acumulacion de error en ejecucion cerrada: la evaluacion en bucle abierto no captura el efecto de los errores de prediccion realimentados.
- Sesgos: no documentados por el autor; al estar entrenado con un unico tipo de objeto y escena, cualquier variacion de color, tamano o textura de la toalla queda fuera de distribucion.
- Idiomas: la instruccion de tarea esta en ingles; no hay soporte multilingue documentado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar tambien la licencia del modelo base `pi05_base`.
- Cautela en produccion: el checkpoint esta pensado como demostracion reproducible, no como politica lista para desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/pi05-so101-bimanual-fold-towel
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101_bimanual_fold_towel_depth_v2
- Repositorio openpi usado en el fine-tuning: https://github.com/hungho77/openpi
- Checkpoint comparable con GR00T N1.7: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-bimanual-fold-towel
