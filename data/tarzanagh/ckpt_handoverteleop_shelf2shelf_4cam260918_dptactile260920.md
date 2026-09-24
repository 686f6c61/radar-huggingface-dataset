# tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dptactile260920

## Resumen

Este repositorio contiene un checkpoint de politica de imitacion basada en Diffusion Policy, entrenado para una tarea de manipulacion bimanual con manos diestras sobre un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1. La tarea concreta consiste en retirar una caja de panuelos de un nivel de estanteria, pasarla de una mano a otra y depositarla en otro nivel. El autor es el usuario de HuggingFace `tarzanagh` y el modelo se distribuye bajo licencia Apache-2.0.

A diferencia de un modelo de lenguaje, no se trata de un transformer generativo de texto: es una politica visomotora que consume observaciones (cuatro camaras RGB a 640x360 y 30 fps) junto con el estado del robot (38 dimensiones de posiciones articulares mas 30 dimensiones de fuerza en las puntas de los dedos, concatenadas en un vector de estado de 68 dimensiones) y produce chunks de acciones de 16 pasos. El checkpoint tiene 268.343.590 parametros y el repositorio ocupa 1,1 GB.

Su relevancia es de tipo experimental y comparativo: forma parte de una familia de 24 ejecuciones del mismo problema que cruza cuatro familias de politicas (Diffusion Policy, ACT, GR00T de 3B y pi0) con y sin entrada tactil, y con tres tareas distintas. El propio autor documenta que, en ese barrido, la entrada tactil no aporto diferencias mas alla del ruido y que la familia GR00T obtuvo el error mas bajo en todas las tareas. Es, por tanto, material de investigacion reproducible antes que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (politica de difusion sobre chunks de acciones) con entrada visual y tactil; detalles internos de la red no disponibles |
| Parametros totales | 268.343.590 (aproximadamente 268 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la politica consume una observacion y predice un chunk de 16 acciones |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robotica, sin entrada ni salida de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Pipeline declarado | robotics |
| Tags | robotics, imitation-learning, bimanual, dexterous-manipulation, teleoperation, xhand1, dexmate-vega |
| Fecha de creacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La politica sigue el paradigma de Diffusion Policy aplicado a control robótico: en lugar de regresar directamente una accion, se modela la distribucion de chunks de acciones mediante un proceso de difusion y se condiciona en las observaciones. En este checkpoint la condicion incluye cuatro camaras RGB (640x360 a 30 fps) y un estado de 68 dimensiones compuesto por 38 dimensiones de posiciones articulares (`[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]`) mas 30 dimensiones de fuerza en las puntas de los dedos (5 dedos x 3 ejes por mano). La variante `dptactile` se distingue de `dp` precisamente por incorporar esa senal tactil. No se especifican en la model card ni el backbone concreto (CNN o transformer) ni el numero de pasos de difusion ni el scheduler utilizado.

El entrenamiento se realizo durante 10.000 pasos con semilla 1000 sobre un dataset de teleoperacion con guantes Meta (sin exoesqueleto) y seguimiento de muneca con Vive. El dataset consta de 54 episodios, de los cuales 48 se usaron para entrenamiento y 6 quedaron reservados (uno de cada diez). En inferencia, la politica observa el estado real cada 16 pasos, predice un chunk y ejecuta unicamente las 16 primeras acciones. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento por preferencias, algo por otra parte ajeno a este tipo de politica.

## Capacidades

- Generacion de trayectorias de accion para control articular bimanual: 38 dimensiones de posiciones de brazos y manos (7 por brazo, 12 por mano).
- Procesamiento multimodal de entrada: cuatro flujos RGB a 640x360 y 30 fps mas el vector de estado de 68 dimensiones.
- Integracion de senal tactil: 30 dimensiones de fuerza en las puntas de los dedos (5 dedos x 3 ejes por mano).
- Prediccion por chunks: genera bloques de 16 acciones y reobserva el estado real cada 16 pasos, lo que reduce la frecuencia efectiva de inferencia.
- Ejecucion de una tarea bimanual de transferencia de objetos: retirada de una caja de panuelos de una estanteria, paso mano a mano y colocacion en otro nivel.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingues: no es un modelo de lenguaje.
- No se documentan capacidades de vision semantica, audio ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion de resultados de investigacion en manipulacion bimanual: el checkpoint permite replicar la tarea shelf-to-shelf con la configuracion exacta de camaras, estado y chunking descrita, sirviendo como referencia frente a las otras 23 ejecuciones del mismo barrido.
- Comparativa controlada de familias de politicas: al compartir tarea, dataset y semilla con las variantes ACT, GR00T 3B y pi0, permite aislar el efecto de la arquitectura de politica sobre el error de seguimiento open-loop.
- Estudio de fusion viso-tactil: la pareja `dp` / `dptactile` permite medir si la senal de fuerza en los dedos aporta mejora; el autor ya reporta que, en su barrido, la diferencia no supera el ruido, por lo que este checkpoint es util como evidencia negativa reproducible.
- Punto de partida para fine-tuning en tareas de transferencia entre manos: los pesos aprendidos sobre un dataset de 54 episodios pueden servir de inicializacion para variantes con mas datos o con objetos y alturas de estanteria distintos.
- Validacion de pipelines de teleoperacion: el modelo esta ligado a una configuracion concreta de recogida de datos (guantes Meta y seguimiento Vive con dos XHand1), util para equipos que quieran montar una cadena equivalente y contrastar la calidad del dataset resultante.
- Evaluacion offline antes de despliegue en hardware: el protocolo de error open-loop con 6 episodios reservados permite descartar checkpoints sin arriesgar el robot fisico.
- Analisis de estrategias de chunking y latencia: el esquema de reobservacion cada 16 pasos y ejecucion de los 16 primeros es un caso de estudio directo para estudiar el compromiso entre frecuencia de inferencia y suavidad de trayectoria.
- Docencia y divulgacion tecnica: como ejemplo compacto (268 M de parametros, 1,1 GB) de Diffusion Policy aplicada a robotica diestra, con una model card que incluye baseline y tabla de errores.

## Benchmarks y rendimiento

La model card publica un unico resultado: el error absoluto medio open-loop en los 6 episodios reservados, medido en radianes como `|accion predicha − accion registrada|`, con error estandar de la media.

| Politica | L-arm (rad) | L-hand (rad) | R-arm (rad) | R-hand (rad) |
|---|---|---|---|---|
| Este modelo (dp + tactil) | 0,0489 ± 0,0071 | 0,0284 ± 0,0016 | 0,0438 ± 0,0032 | 0,0229 ± 0,0024 |
| Baseline hold-first-frame | 0,3538 | 0,2351 | 0,2926 | 0,2373 |

Advertencias del propio autor que conviene reproducir: la metrica mide seguimiento de trayectoria y no exito en la tarea, y ninguna de estas ejecuciones se ha probado sobre hardware. Ademas, en el barrido completo de cuatro familias por tres tareas, la entrada tactil no produjo diferencias por encima del ruido y GR00T obtuvo el error mas bajo en todas las tareas. No hay disponibles resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para pesos en precision completa (fp32): aproximadamente 1,07 GB, calculado a partir de los 268.343.590 parametros.
- VRAM estimada en precision reducida (fp16 o bf16): aproximadamente 0,54 GB para los pesos, mas el coste del encoder visual y de los pasos de difusion. La model card no publica cifras de VRAM reales, por lo que cualquier valor por encima del calculo de pesos es una estimacion.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente; el repositorio de 1,1 GB y los 268 M de parametros situan el modelo en el rango de consumo de una GPU de consumo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores, aunque no hay confirmacion del autor ni cifras de latencia medidas.
- Opciones de despliegue: no disponibles. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje. Tampoco se documenta en la model card un framework de inferencia concreto ni codigo de carga del checkpoint.
- Latencia y throughput: no disponibles. Como referencia derivada, si el bucle de control se ejecutase a la frecuencia de las camaras (30 fps), un chunk de 16 acciones cubriria aproximadamente 0,53 segundos; este dato no esta confirmado por el autor.
- Dependencias fisicas: el modelo esta asociado a un DexMate Vega-1 con dos manos RobotEra XHand1, a guantes Meta para teleoperacion y a seguimiento Vive para las munecas. La evaluacion documentada es exclusivamente offline sobre datos registrados.

## Comparativa con modelos similares

El propio repositorio forma parte de un conjunto de 24 ejecuciones del mismo problema, lo que permite una comparacion directa entre familias de politicas. No se publican las metricas de cada variante en la informacion disponible.

| Checkpoint | Familia de politica | Entrada tactil | Metricas publicadas | Notas |
|---|---|---|---|---|
| `ckpt_handoverteleop_shelf2shelf_4cam260918_dptactile260920` (este) | Diffusion Policy | Si | Tabla de error open-loop | 268.343.590 parametros |
| `ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920` | Diffusion Policy | No | no disponible | Variante sin tactil, mismo pipeline |
| `ckpt_handoverteleop_shelf2shelf_4cam260918_act260920` | ACT | No | no disponible | Familia ACT |
| `ckpt_handoverteleop_shelf2shelf_4cam260918_acttactile260920` | ACT | Si | no disponible | Familia ACT con tactil |
| `ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920` | GR00T (3B) | No | Error mas bajo en las tres tareas segun el autor | No se publican las cifras concretas |
| `ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920` | GR00T (3B) | Si | no disponible | Version con tactil |
| `ckpt_handoverteleop_shelf2shelf_4cam260918_pi05260920` | pi0 | No | no disponible | Familia pi0 |
| `ckpt_handoverteleop_shelf2shelf_4cam260918_pi05tactile260920` | pi0 | Si | no disponible | Version con tactil |

Como referencia externa, frente a una politica de regresion trivial tipo hold-first-frame el modelo reduce el error de seguimiento en los cuatro grupos articulares por un factor de entre 7 y 10 aproximadamente. La comparacion con modelos de lenguaje u otros dominios no procede.

## Limitaciones y advertencias

- El modelo no se ha probado sobre hardware. Toda la evaluacion es open-loop sobre trayectorias registradas, por lo que no existe evidencia de exito real en la tarea de handover.
- La metrica publicada mide seguimiento de trayectoria, no exito de la tarea. Un error bajo de seguimiento no implica que la caja termine colocada en el nivel correcto.
- Dataset muy reducido: 54 episodios en total, con solo 48 de entrenamiento y 6 de validacion. El riesgo de sobreajuste a la tarea, al objeto y a la geometria de la estanteria es alto.
- Sesgo de teleoperacion: los datos provienen de una configuracion concreta de guantes Meta y seguimiento Vive, probablemente con un numero limitado de operadores. Las trayectorias heredan los sesgos y la variabilidad de esa recogida.
- La senal tactil no aporto mejora: el propio autor indica que, en el barrido de cuatro familias por tres tareas, la entrada tactil no produjo diferencias mas alla del ruido. No cabe esperar ventajas de esta variante sobre su equivalente sin tactil.
- GR00T obtuvo menor error en todas las tareas evaluadas, por lo que este checkpoint no es la mejor opcion del conjunto para la misma tarea.
- Dependencia fuerte del hardware: state y action estan definidos para un DexMate Vega-1 con dos XHand1 (38 dimensiones mas 30 de fuerza). Transferir el checkpoint a otro robot o a otras manos exige redefinir el espacio de acciones.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos generativos de texto, pero si existe el riesgo analogo de generar trayectorias plausibles que no correspondan a la intencion de la tarea en estados fuera de distribucion.
- Cubre un unico idioma y un unico dominio: no hay capacidades multilingues ni generalizacion a otras tareas documentada.
- Licencia Apache-2.0 en el checkpoint, permisiva para uso comercial del modelo en si. Sin embargo, las dependencias de terceros (DexMate Vega-1, RobotEra XHand1, guantes Meta, Vive) tienen sus propias condiciones, y el software de teleoperacion o de control no se incluye ni se detalla en el repositorio.
- Repositorio con 0 descargas y 0 likes: no hay validacion externa, replicaciones ni issues que permitan confirmar el comportamiento mas alla de lo que declara el autor.
- No se documentan requisitos de software, procedimiento de carga de los pesos ni scripts de inferencia, lo que anade coste de integracion a quien quiera reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dptactile260920
- Variante Diffusion Policy sin tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920
- Variante ACT sin tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_act260920
- Variante ACT con tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_acttactile260920
- Variante GR00T 3B sin tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920
- Variante GR00T 3B con tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920
- Variante pi0 sin tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05260920
- Variante pi0 con tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05tactile260920
- Paper, blog o repositorio de codigo: no disponibles en la informacion proporcionada.
