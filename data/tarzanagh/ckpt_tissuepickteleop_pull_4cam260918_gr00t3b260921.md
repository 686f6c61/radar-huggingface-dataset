# tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenada por el usuario de HuggingFace `tarzanagh` bajo el identificador `ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921`. Se trata de un modelo de imitación (imitation learning) de tipo vision-language-action, etiquetado en el repositorio como `Gr00tN1d7`, lo que lo vincula a la familia GR00T N1.7 de NVIDIA. El modelo resuelve una tarea concreta de manipulación bimanual y diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sostiene una caja de pañuelos con la mano izquierda y extrae un pañuelo con la derecha.

El checkpoint tiene 3.144.016.000 parámetros (aproximadamente 3,14 mil millones), un tamaño de repositorio de 12,6 GB y pesos en formato safetensors. La entrada del modelo son cuatro cámaras RGB a 640x360 y 30 fps, más un vector de estado de 38 dimensiones con las posiciones articulares de ambos brazos y ambas manos; la salida es un vector de acción de la misma dimensionalidad, emitido en bloques (chunks) de 16 acciones.

Su relevancia es acotada y de carácter experimental: el propio autor advierte que las métricas publicadas miden seguimiento de trayectoria en bucle abierto (open-loop) y que la política nunca se ha ejecutado en hardware real. Forma parte de una serie de 24 ejecuciones (cuatro familias de políticas multiplicadas por tres tareas y variantes con y sin entrada táctil) pensada para comparar arquitecturas de imitación en un mismo conjunto de datos de teleoperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (etiqueta `Gr00tN1d7` en el repositorio); la model card no detalla la arquitectura interna |
| Parametros totales | 3.144.016.000 (aproximadamente 3,14 mil millones) |
| Parametros activos | No aplica; no se declara arquitectura MoE |
| Longitud de contexto | No disponible; la política consume observaciones cada 16 pasos y predice un bloque de 16 acciones |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin cuantizaciones alternativas |
| Idiomas soportados | No disponible; no es un modelo de lenguaje natural, la model card no declara idiomas |
| Licencia | other (licencia no estandar, sin texto detallado en la informacion disponible) |
| Formato de pesos | safetensors |
| Entrada | 4 camaras RGB, 640x360 a 30 fps, mas vector de estado de 38 dimensiones |
| Salida | Vector de accion de 38 dimensiones `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` en posiciones articulares |
| Tamano del repositorio | 12,6 GB |
| Hardware objetivo | Robot DexMate Vega-1 con dos manos RobotEra XHand1 |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card identifica el modelo como un checkpoint de la familia GR00T N1.7 de 3B de parametros y lo etiqueta con `Gr00tN1d7`. No se proporcionan detalles sobre el numero de capas, el mecanismo de atencion, el codificador visual ni el modelo de lenguaje subyacente, por lo que cualquier descripcion mas alla de la etiqueta seria especulativa. El comportamiento observable es el de una politica que consume cuatro vistas RGB y un vector de estado de 38 dimensiones, y que produce bloques de 16 acciones en posiciones articulares. El esquema de actuacion descrito es de tipo chunking con reobservacion: la politica ve la observacion real cada 16 pasos, predice un bloque de acciones y se ejecutan las 16 primeras.

Los datos de entrenamiento son 120 episodios de teleoperacion, de los cuales 108 se usan para entrenamiento y 12 quedan reservados (se retiene cada decimo episodio). La recogida se hizo con teleoperacion mediante guante de meta sin exoesqueleto y seguimiento de muneca con Vive. El entrenamiento se ejecuto durante 10.000 pasos con semilla 1000. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por refuerzo; tampoco se detalla ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

Un hallazgo experimental que si se declara: en el barrido de cuatro familias de politicas por tres tareas, la entrada tactil no produjo diferencias por encima del ruido, y GR00T obtuvo el error mas bajo en todas las tareas evaluadas.

## Capacidades

- Manipulacion bimanual diestra: sostener un objeto con la mano izquierda mientras la derecha ejecuta una extraccion sobre el mismo objeto.
- Control de 38 grados de libertad en posiciones articulares: 7 de brazo izquierdo, 12 de mano izquierda, 7 de brazo derecho y 12 de mano derecha.
- Percepcion visual multivista: fusiona cuatro camaras RGB a 640x360 y 30 fps en una unica politica.
- Generacion de acciones por bloques: predice 16 acciones por inferencia y reobserva el estado real cada 16 pasos.
- Ejecucion de politicas de imitacion entrenadas a partir de teleoperacion con guante de meta y seguimiento Vive.
- Variante con entrada tactil disponible en el mismo conjunto de experimentos (`gr00t3btactile260921`), aunque el autor reporta que la tactilidad no aporto mejoria medible.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, uso de agentes ni capacidades multilingues. Es un modelo de accion, no un modelo conversacional.
- No se declaran modos especiales tipo thinking, audio o vision semantica mas alla del uso de las imagenes como entrada de politica.

## Casos de uso

- Investigacion en imitacion bimanual: servir como uno de los cuatro brazos de comparacion (junto a ACT, Diffusion Policy y pi0) del barrido de 24 ejecuciones que el autor publica, permitiendo reproducir el mismo protocolo sobre los mismos 120 episodios.
- Estudio del efecto de la entrada tactil: comparar este checkpoint con su variante `gr00t3btactile260921` para verificar en un dataset propio la conclusion de que la tactilidad no aporta mejoria por encima del ruido.
- Baseline de referencia para nuevas politicas: usar el error en bucle abierto como cota inferior contra la que medir una arquitectura nueva antes de invertir en validacion en hardware.
- Desarrollo de habilidades de manipulacion diestra con manos XHand1: el vector de accion de 12 dimensiones por mano permite reutilizar el checkpoint para tareas que requieran control fino de dedos, no solo de pinza.
- Prototipado de celulas robotizadas con DexMate Vega-1: integrar la politica en un pipeline de inferencia que reciba cuatro flujos de camara sincronizados y publique consignas articulares a 30 Hz.
- Generacion de trayectorias sinteticas de referencia: al predecir bloques de 16 acciones con un error medio bajo en bucle abierto, las salidas pueden usarse como trayectoria nominal para inicializar controladores o para comparar con otros controladores clasicos.
- Docencia y reproduccion de experimentos: por su tamano moderado (3,14 mil millones de parametros) y su naturaleza de politica, es util como ejemplo reproducible de extremo a extremo de un pipeline de imitacion con teleoperacion, desde la captura hasta la evaluacion en bucle abierto.
- Evaluacion de esquemas de chunking: permite experimentar con el tamano de bloque (aqui 16 acciones con reobservacion cada 16 pasos) y medir el efecto sobre el error de seguimiento de trayectoria.

## Benchmarks y rendimiento

El autor publica el error en bucle abierto sobre los 12 episodios reservados, en radianes, como media mas error estandar (n=12):

| Metrica | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo | 0,0087 ± 0,0004 | 0,0078 ± 0,0003 | 0,0159 ± 0,0005 | 0,0116 ± 0,0004 |
| Baseline hold-first-frame | 0,1975 | 0,0514 | 0,2628 | 0,1440 |

Advertencias sobre estas cifras, segun la propia model card: miden seguimiento de trayectoria frente a las acciones grabadas, no exito en la tarea, y ninguna de las metricas se obtuvo ejecutando la politica en hardware real. Ademas, en el barrido de cuatro familias de politicas por tres tareas, GR00T obtuvo el menor error en todas las tareas y la entrada tactil no cambio los resultados mas alla del ruido, aunque no se publican en esta model card las cifras del resto de familias.

No se han publicado en la informacion disponible resultados de benchmarks estandar de lenguaje o vision (MMLU, HumanEval, GSM8K u otros), que por otra parte no serian aplicables a una politica de control.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,6 GB en precision de 32 bits, unos 6,3 GB en bf16/fp16 y unos 3,2 GB en int8. Son estimaciones derivadas del recuento de parametros (3.144.016.000) y del tamano del repositorio (12,6 GB), no datos declarados por el autor.
- El tamano del repositorio (12,6 GB) es compatible con pesos en 32 bits; no se publican versiones cuantizadas ni en bf16 dentro del repositorio.
- GPU recomendadas: no disponibles. Por tamano, el modelo cabe en GPUs de consumo con al menos 8-12 GB de VRAM si se dispone de una version en bf16, pero el autor no recomienda ninguna GPU concreta.
- Cabe en GPU de consumo: probablemente si en tarjetas con 12 GB o mas de VRAM si se convierte a bf16; no confirmado por el autor.
- No se declara soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia de lenguaje; al ser una politica de robotica, el despliegue se haria mediante el runtime del ecosistema GR00T y un bucle de control que alimente cuatro camaras RGB a 30 fps.
- Latencia y throughput: no disponibles. La unica restriccion temporal conocida es la del dataset de origen, 30 fps, con reobservacion cada 16 pasos.
- Requiere el hardware fisico de destino (DexMate Vega-1 con dos manos RobotEra XHand1) para una validacion real, que no se ha realizado.

## Comparativa con modelos similares

El propio autor publica, para la misma tarea, checkpoints de otras tres familias ademas de GR00T. No se detallan parametros, contexto ni licencia individual de cada uno en la informacion disponible, y solo se aportan cifras numericas del checkpoint GR00T.

| Modelo | Familia | Parametros | Error en bucle abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ckpt_..._gr00t3b260921` (este) | GR00T N1.7 3B | 3.144.016.000 | Ver tabla de benchmarks | other | HuggingFace |
| `ckpt_..._gr00t3btactile260921` | GR00T N1.7 3B con entrada tactil | No disponible | No publicado en esta model card | other | HuggingFace |
| `ckpt_..._act260921` y `acttactile260921` | ACT | No disponible | No publicado en esta model card | other | HuggingFace |
| `ckpt_..._dp260921` y `dptactile260921` | Diffusion Policy | No disponible | No publicado en esta model card | other | HuggingFace |
| `ckpt_..._pi05260921` y `pi05tactile260921` | pi0 (familia pi-05) | No disponible | No publicado en esta model card | other | HuggingFace |

Lo unico comparable con datos es la afirmacion cualitativa del autor: GR00T tuvo el error mas bajo en las tres tareas evaluadas y la tactilidad no aporto mejoria medible en ninguna de las cuatro familias.

## Limitaciones y advertencias

- No se ha ejecutado en hardware real. El autor lo indica de forma explicita: las metricas provienen de evaluacion en bucle abierto y no hay evidencia de exito en la tarea sobre el robot fisico.
- Las cifras publicadas miden seguimiento de trayectoria, no exito de tarea. Un error bajo de seguimiento no implica que el robot consiga extraer el pañuelo.
- Dataset muy reducido: 120 episodios, de los cuales solo 108 se usan para entrenamiento y 12 para evaluacion. El riesgo de sobreajuste y de baja generalizacion a nuevas posiciones, iluminacion u objetos es alto.
- Una sola tarea. El modelo esta entrenado para una tarea concreta (sostener una caja de pañuelos y extraer uno) y no se documenta generalizacion a otras tareas.
- Especifico de plataforma. La dimensionalidad de estado y accion (38-D) esta atada a la morfologia DexMate Vega-1 con dos manos RobotEra XHand1. No es trasladable directamente a otro robot sin reentrenamiento.
- Dependencia del canal de teleoperacion: guante de meta sin exoesqueleto y seguimiento Vive. Cambios en el metodo de captura pueden degradar el rendimiento.
- Sin datos de sesgo en el sentido habitual de los modelos de lenguaje, pero si hay un sesgo de dominio claro: los datos provienen de un operador, un montaje y un laboratorio concretos.
- Licencia `other` sin texto detallado disponible. Antes de cualquier uso comercial es imprescindible contactar con el autor para conocer los terminos exactos.
- Ausencia de cuantizaciones publicadas y de pesos en bf16 en el repositorio, lo que obliga a convertir los pesos antes de desplegar en GPUs de consumo.
- Sin informacion sobre idiomas, contexto, latencia o throughput, porque no son magnitudes aplicables o no fueron declaradas.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; toda la informacion procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921
- Variante con entrada tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3btactile260921
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_act260921
- Variante ACT con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921
- Variante Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dp260921
- Variante Diffusion Policy con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dptactile260921
- Variante pi0: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05260921
- Variante pi0 con tactil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921
- Paper, blog o repositorio oficial: no disponibles. La busqueda web no devolvio resultados tecnicos relevantes sobre este modelo.
