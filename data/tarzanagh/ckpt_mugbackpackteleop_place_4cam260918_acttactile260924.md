# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924

## Resumen

Este repositorio contiene un checkpoint de politica robotica entrenada mediante imitacion (imitation learning) con la arquitectura ACT (Action Chunking Transformer) aumentada con entrada tactil. Lo desarrolla el usuario tarzanagh (Davoud Ataee Tarzanagh, AI Scientist en Samsung SDS Research America, segun su pagina personal) y resuelve una tarea concreta de manipulacion bimanual diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sostiene una mochila abierta con la mano izquierda e introduce una taza en su interior con la derecha.

El modelo tiene 51.764.902 parametros y un peso en disco de aproximadamente 0,2 GB, lo que lo situa en la categoria de politicas ligeras entrenadas desde cero sobre datos de teleoperacion. La entrada combina cuatro camaras RGB a 640x360 y 30 fps con un vector de estado y accion de 38 dimensiones (7 de brazo y 12 de mano por cada lado) mas 30 dimensiones de fuerza en las yemas de los dedos (5 dedos por 3 ejes por mano), alcanzando un estado de 68 dimensiones.

Es relevante como parte de una suite comparativa abierta: el autor publica variantes de la misma tarea con GR00T, pi-0.5, Diffusion Policy y T-Rex, con y sin tactil, lo que permite comparar familias de politicas bajo un mismo protocolo de evaluacion en lazo abierto. La licencia es Apache 2.0 y el entrenamiento fue deliberadamente corto (5.000 pasos), por lo que el propio autor advierte que no es comparable con sus ejecuciones de ACT a 10.000 pasos en otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con entrada tactil concatenada al estado; no disponible el detalle de capas y dimensiones internas |
| Parametros totales | 51.764.902 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la politica opera con chunking de acciones (predice un chunk y ejecuta los primeros 16 pasos, con reobservacion cada 16 pasos) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors |
| Idiomas soportados | no aplica; es una politica robotica sin interfaz de lenguaje natural (el campo de idiomas no esta disponible en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La politica sigue el esquema ACT, un transformer que mapea observaciones a trozos (chunks) de acciones, y en esta variante incorpora senal tactil. La observacion la forman cuatro camaras RGB (640x360 a 30 fps) junto con un estado de 68 dimensiones que combina posiciones articulares de 38 dimensiones (`[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]`) y 30 dimensiones de fuerza en las yemas (5 dedos x 3 ejes por mano). La accion predicha son las 38 dimensiones de posiciones articulares del sistema bimanual completo.

Los datos proceden de teleoperacion con meta-glove (sin exoesqueleto) y seguimiento de muneca con Vive, sobre un montaje DexMate Vega-1 con dos manos XHand1. El conjunto consta de 31 episodios, con particion de 27 para entrenamiento y 4 reservados (uno de cada diez). El entrenamiento se ejecuto durante 5.000 pasos con semilla 1000; el autor indica explicitamente que recorto ACT a 5.000 pasos en esta suite por economia de tiempo y que el resultado no es comparable con las ejecuciones de ACT de 10.000 pasos en otras tareas. No se documenta en la informacion disponible el uso de RLHF, DPO ni de un esquema de alineacion, algo esperable en una politica de imitacion.

La innovacion tecnica destacable es la incorporacion de fuerza tactil como parte del estado, evaluada de forma controlada frente a la variante sin tactil de la misma tarea (`act260924`). El propio autor senala que la entrada tactil no produjo una diferencia consistente en el error en lazo abierto en esta tarea.

## Capacidades

- Generacion de acciones motoras bimanuales: produce comandos de posicion articular para dos brazos de 7 grados de libertad y dos manos de 12 grados de libertad cada una.
- Manipulacion diestra: coordinacion de manos tipo XHand1 con 12 articulaciones por mano, incluyendo agarre de objetos.
- Manipulacion bimanual cooperativa: una mano estabiliza un objeto (mochila) mientras la otra ejecuta la insercion de un objeto (taza), una tarea que requiere coordinacion entre ambos brazos.
- Percepcion visual multi-camara: consume cuatro flujos RGB simultaneos a 640x360 y 30 fps, lo que permite cubrir puntos de vista complementarios del montaje.
- Percepcion tactil: integra lecturas de fuerza de 3 ejes en las yemas de cinco dedos por mano (30 dimensiones en total).
- Ejecucion por chunks de acciones: predice un bloque de acciones y ejecuta los primeros 16 pasos antes de volver a observar, un mecanismo habitual para reducir el coste de inferencia y suavizar la ejecucion.
- Control por posicion articular: la salida no es par motor ni velocidad, sino posiciones articulares objetivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; no hay evidencia de capacidades de vision general, audio ni modo de razonamiento explicito. Es una politica especializada en una unica tarea.

## Casos de uso

- Investigacion en manipulacion bimanual: sirve como referencia reproducible de ACT con entrada tactil sobre un banco de pruebas estandarizado (DexMate Vega-1 + XHand1), util para estudiar si la senal tactil aporta ventaja en tareas de insercion.
- Comparativa de familias de politicas: al existir variantes de la misma tarea con GR00T, pi-0.5, Diffusion Policy y T-Rex, permite ejecutar estudios controlados de rendimiento entre arquitecturas bajo el mismo protocolo y los mismos datos.
- Ablacion de modalidades sensoriales: la pareja `act260924` / `acttactile260924` posibilita medir el efecto marginal de anadir fuerza en las yemas sin cambiar el resto del pipeline.
- Prototipado de habilidades de insercion: la tarea de introducir una taza en una mochila sostenida es representativa de problemas de colocacion con tolerancia estrecha, un caso frecuente en logistica y manipulacion domestica.
- Base para ajuste fino con pocos datos: al contar con 51,7 millones de parametros y entrenarse en 5.000 pasos sobre 27 episodios, el coste de reentrenar o adaptar la politica a una tarea vecina es bajo en comparacion con politicas de miles de millones de parametros.
- Referencia en docencia y cursos de robotica: el modelo cabe en cualquier GPU de consumo, lo que facilita desplegar replicas locales de un pipeline de aprendizaje por imitacion con vision y tactil.
- Recoleccion de datos de teleoperacion guiada por politica: la politica puede usarse para asistir o inicializar demostraciones antes de un entrenamiento mayor, aprovechando el bajo coste de inferencia por chunk.

## Benchmarks y rendimiento

Error en lazo abierto sobre el conjunto reservado (media |prediccion - accion registrada| en radianes, ± error estandar de la media, n=4). El autor advierte que esta metrica mide seguimiento de trayectoria, no exito de la tarea, y que no se ejecuto nada sobre hardware.

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (ACT + tactil) | 0,0464 ± 0,0033 | 0,0430 ± 0,0057 | 0,0656 ± 0,0049 | 0,0448 ± 0,0057 |
| Referencia hold-first-frame | 0,2132 | 0,3383 | 0,2756 | 0,1755 |

Segun la model card, en esta tarea GR00T obtuvo el error mas bajo entre las familias ya finalizadas, entre 3 y 4 veces por debajo de pi-0.5 y de ACT. Las ejecuciones de Diffusion Policy y T-Rex para esta tarea seguian entrenando en el momento de publicar la ficha. No se han publicado resultados de exito de tarea ni metricas sobre hardware en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 51.764.902 parametros, los pesos ocupan aproximadamente 0,2 GB en float32 y en torno a 0,1 GB en float16, a lo que hay que sumar activaciones y los cuatro flujos de imagen de 640x360 a 30 fps.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU moderna con suficiente memoria para los buffers de vision es candidata.
- Cabe en GPU de consumo: por numero de parametros, si; el cuello de botella real es el procesamiento simultaneo de cuatro camaras a 30 fps, no el tamano del modelo.
- Opciones de despliegue: el repositorio solo distribuye pesos safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible (estas herramientas estan orientadas a modelos de lenguaje y no aplican a esta politica). El despliegue esperado es mediante codigo de inferencia en PyTorch/ACT en el propio robot.
- Latencia y throughput: no disponibles. El autor indica unicamente que la politica observa el estado real cada 16 pasos y ejecuta los 16 primeros pasos del chunk predicho, lo que define el ciclo de control efectivo pero no el tiempo de computo medido.

## Comparativa con modelos similares

Todos los modelos comparables pertenecen a la misma tarea y al mismo autor; las cifras de tamano de las alternativas no se detallan en la informacion disponible salvo cuando el nombre del checkpoint lo sugiere.

| Modelo | Parametros | Contexto | Error en lazo abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT + tactil) | 51.764.902 | no disponible | 0,0464 / 0,0430 / 0,0656 / 0,0448 rad (L-arm / L-hand / R-arm / R-hand) | apache-2.0 | Publicado en HuggingFace |
| act260924 (ACT sin tactil) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Publicado en HuggingFace; el autor indica que la tactil no marco diferencia consistente |
| pi05260924 (pi-0.5) | no disponible | no disponible | entre 3 y 4 veces por encima del error de GR00T segun la model card | no disponible | Publicado en HuggingFace |
| gr00t3b260924 (GR00T) | aproximadamente 3.000 millones segun la nomenclatura del checkpoint; dato no confirmado en la informacion disponible | no disponible | el mas bajo de las familias finalizadas, 3-4x por debajo de pi-0.5 y ACT | no disponible | Publicado en HuggingFace |
| Diffusion Policy y T-Rex | no disponible | no disponible | aun entrenando al publicarse la ficha | no disponible | No disponible |

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea (insertar una taza en una mochila sostenida) en un montaje concreto. No hay evidencia de generalizacion a otros objetos, posiciones o robots.
- Sin validacion en hardware: el autor afirma explicitamente que la evaluacion es en lazo abierto y que no se ejecuto nada sobre el robot. El error de seguimiento de trayectoria no es un proxy fiable del exito de la tarea.
- Entrenamiento truncado: 5.000 pasos frente a los 10.000 de otras ejecuciones de ACT del mismo autor. El propio autor pide no comparar estos resultados con los de 10.000 pasos.
- Muestra pequena: 31 episodios en total y solo 4 reservados para evaluacion, con lo que los intervalos de confianza son amplios (errores estandar de hasta 0,0057 rad).
- Aporte tactil no concluyente: la model card indica que la entrada tactil no produjo una diferencia consistente en esta tarea, por lo que no debe asumirse una ventaja de la variante tactil sobre la no tactil.
- Riesgo de sobreajuste a las condiciones de teleoperacion: los datos provienen de meta-glove y seguimiento Vive, de modo que la distribucion de estados puede diferir de la de una politica autonoma, con el consiguiente desplazamiento de distribucion en ejecucion real.
- Dependencia sensorial fuerte: requiere cuatro camaras calibradas a 640x360 y 30 fps y sensores de fuerza en las yemas; la ausencia o el desajuste de cualquiera de estas entradas degrada la prediccion.
- Sobre alucinacion y sesgos: no aplica en el sentido de los modelos de lenguaje; el analogo es la deriva de la trayectoria predicha cuando la observacion se aleja de la distribucion de entrenamiento, un riesgo no cuantificado en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion del aviso de licencia. No se documentan pesos base de terceros ni restricciones adicionales.
- Documentacion escasa: no hay informacion sobre cuantizacion, latencias, requisitos de computo ni exito de tarea, lo que dificulta estimar su viabilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
- Variante ACT sin tactil de la misma tarea: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
- Variante GR00T 3B con tactil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
- Variante pi-0.5: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
- Variante pi-0.5 con tactil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
- Perfil del autor: https://tarzanagh.github.io/
- Checkpoint relacionado (GR00T 3B, tarea putaside): https://huggingface.co/tarzanagh/ckpt_psspteleop_putaside_4cam260629-260708_gr00t3b260816
- Checkpoint relacionado (GR00T 3B, tarea putaside): https://huggingface.co/tarzanagh/ckpt_psspteleop_putaside_4cam260810-260811_gr00t3b260816
