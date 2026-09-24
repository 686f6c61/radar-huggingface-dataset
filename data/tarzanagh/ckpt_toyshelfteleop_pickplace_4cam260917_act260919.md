# tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919

## Resumen

Este repositorio contiene una política de imitación entrenada con el método ACT (Action Chunking with Transformers) para una tarea concreta de manipulación bimanual: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 debe coger un juguete de la segunda balda de una estantería y colocarlo en la primera, operando con el brazo derecho mientras el izquierdo permanece prácticamente estático. El autor es el usuario de HuggingFace `tarzanagh` y el modelo se publica bajo licencia Apache 2.0 con un total de 51.734.182 parámetros y un repositorio de 0,2 GB en formato safetensors.

El modelo pertenece a la familia de políticas visomotoras basadas en transformers para control robótico y no es un modelo de lenguaje: consume observaciones visuales de 4 cámaras RGB (640x360 a 30 fps) y produce vectores de acción de 38 dimensiones con posiciones articulares de ambos brazos y manos. Su relevancia es acotada pero clara: forma parte de una batería de 24 entrenamientos sobre la misma tarea, lo que permite comparar familias de políticas (ACT, Diffusion Policy, GR00T, pi0.5) y variantes con y sin señal táctil bajo condiciones controladas de datos y semilla.

El entrenamiento se realizó sobre 155 episodios de teleoperación con guante (sin exoesqueleto) y seguimiento de muñeca con Vive, de los cuales 139 se usaron para entrenamiento y 16 quedaron reservados (uno de cada diez). El propio autor advierte que las métricas publicadas miden seguimiento de trayectoria en bucle abierto y que ninguna prueba se ejecutó sobre hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); detalle de capas y atencion no disponibles |
| Parametros totales | 51.734.182 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de prediccion de 16 pasos de accion por chunk |
| Tipos de cuantizacion | no disponibles (repo en safetensors) |
| Idiomas soportados | no aplica (modelo de robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano de repo 0,2 GB) |
| Dimension de observacion | 4 camaras RGB, 640x360 a 30 fps |
| Dimension de estado/accion | 38-D: [L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12] posiciones articulares |
| Plataforma robotica | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Pipeline declarado | robotics |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer de prediccion de acciones por bloques (action chunking). La política observa la observacion real cada 16 pasos y emite un chunk de acciones; de ese chunk se conservan las 16 primeras acciones antes de volver a leer el estado real. Este esquema reduce el error de acumulacion tipico del control paso a paso, a costa de una latencia de reaccion de 16 pasos y de depender de la consistencia temporal del chunk.

Los datos proceden de 155 episodios de teleoperacion con guante (meta-glove, sin exoesqueleto) y tracking de muñeca con Vive, sobre la tarea de recogida y colocacion en estanteria. El reparto es de 139 episodios de entrenamiento y 16 reservados (cada decimo). El entrenamiento se ejecuto durante 10.000 pasos con semilla 1000. La senal de estado y accion es un vector de 38 dimensiones con posiciones articulares: 7 del brazo izquierdo, 12 de la mano izquierda, 7 del brazo derecho y 12 de la mano derecha. El experimento forma parte de una comparativa de cuatro familias de politicas por tres tareas; en esa comparativa el autor reporta que la incorporacion de entrada tactil no produjo diferencias mas alla del ruido y que GR00T obtuvo el error mas bajo en todas las tareas.

## Capacidades

- Generacion de trays de accion para manipulacion bimanual de 38 grados de libertad (brazos y manos diestras) a partir de vision multi-camara.
- Prediccion de chunks de 16 acciones con re-observacion cada 16 pasos.
- Ejecucion de la tarea especifica de pick-and-place entre dos niveles de estanteria con brazo derecho y brazo izquierdo practicamente estatico.
- Consumo de 4 flujos RGB simultaneos a 640x360 y 30 fps.
- Reproduccion de estilos de teleoperacion con guante y tracking Vive incluidos en los datos de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision semantica, audio ni cualquier otra capacidad fuera del control visomotor.

## Casos de uso

- Replicacion de la tarea de pick-and-place en estanteria: el modelo traduce las cuatro vistas RGB en posiciones articulares para el DexMate Vega-1, por lo que puede usarse como punto de partida para una demo de recogida y colocacion de objetos en el segundo nivel de una estanteria.
- Linea base en comparativas de politicas de imitacion: al existir 24 entrenamientos de la misma tarea con distintas familias y variantes tactiles, este checkpoint sirve como referencia ACT sin tactil en ese banco de pruebas.
- Estudio de ablation de entrada tactil: el autor reporta que la señal tactil no aporta mejoras medibles en cuatro familias y tres tareas; este checkpoint es la rama sin tactil frente a `acttactile260919`.
- Analisis de seguimiento de trayectoria en bucle abierto: con los 16 episodios reservados y la metrica de error medio absoluto en radianes, permite reproducir y auditar la evaluacion publicada.
- Generacion de datos de accion sinteticos para preentrenamiento: los chunks de 16 acciones pueden emplearse como pseudoetiquetas en pipelines que necesiten inicializar politicas de la misma morfologia de 38-D.
- Transferencia a configuraciones de hardware similares: al estar definido sobre posiciones articulares de brazos de 7 GDL y manos de 12 GDL, la interfaz de accion es reutilizable en otros robots con la misma distribucion articular, siempre que se reentrene o ajuste.

## Benchmarks y rendimiento

El unico dato publicado es el error de bucle abierto sobre los 16 episodios reservados (media de |prediccion - accion registrada|, en radianes, ± SEM, n=16):

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (ACT, sin tactil) | 0,0065 ± 0,0009 | 0,0154 ± 0,0028 | 0,0615 ± 0,0044 | 0,0475 ± 0,0044 |
| Baseline hold-first-frame | 0,0219 | 0,0172 | 0,3166 | 0,2380 |

No se han publicado resultados de benchmarks de exito de tarea, MMLU, HumanEval, GSM8K ni equivalentes en la informacion disponible. El autor indica explicitamente que esta metrica mide seguimiento de trayectoria, no exito de tarea, y que nada se ejecuto sobre hardware. En la comparativa interna de 24 ejecuciones, GR00T obtuvo el error mas bajo en las tres tareas y la entrada tactil no aporto mejora fuera del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 207 MB en fp32 y 103 MB en fp16 para los 51,7 millones de parametros, mas el coste de los cuatro codificadores visuales y de los buffers de imagen 640x360. Son estimaciones derivadas del recuento de parametros, no medidas publicadas.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del modelo cabe con holgura en cualquier GPU con 4 GB o mas, incluidas GTX 1650, RTX 3050, RTX 4090 y equivalentes.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer con al menos 2-4 GB de VRAM para inferencia en fp16, dependiendo del backend y del preprocesado de imagen.
- Opciones de despliegue: no disponibles; el repositorio solo publica pesos en safetensors, sin configuracion de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables a esta politica).
- Latencia y throughput estimados: no disponibles. El esquema de chunking implica una accion nueva cada 16 pasos de control en bucle cerrado, con re-observacion real cada 16 acciones.

## Comparativa con modelos similares

La unica comparacion documentada es la propia familia de 24 ejecuciones sobre la misma tarea. La informacion disponible solo permite comparar por nombre de checkpoint y por la metrica agregada reportada por el autor.

| Modelo | Familia | Tactil | Parametros | Error publicado |
|---|---|---|---|---|
| Este checkpoint | ACT | No | 51.734.182 | Ver tabla de benchmarks |
| ckpt_..._acttactile260919 | ACT | Si | no disponible | Sin mejora fuera del ruido |
| ckpt_..._dp260919 | Diffusion Policy | No | no disponible | no disponible |
| ckpt_..._dptactile260919 | Diffusion Policy | Si | no disponible | no disponible |
| ckpt_..._gr00t3b260918 | GR00T | No | ~3B (segun nomenclatura del checkpoint) | El mas bajo en las tres tareas |
| ckpt_..._pi05260918 | pi0.5 | No | no disponible | no disponible |

Frente a modelos de lenguaje de proposito general no existe comparacion posible: este modelo no procesa texto ni genera lenguaje. No se dispone de datos comparativos con politicas externas a este banco de pruebas.

## Limitaciones y advertencias

- Sesgos conocidos: los datos provienen de una unica tarea, un unico robot y un unico operador o conjunto reducido de teleoperaciones con guante, por lo que la politica reproducira los sesgos de ese estilo de demostracion.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe generacion de acciones no fundamentadas cuando la observacion se sale de la distribucion de entrenamiento, sin mecanismo de rechazo ni estimacion de incertidumbre.
- Limitacion de alcance: el error en bucle abierto no mide exito de tarea; el autor confirma que no se ejecuto nada sobre hardware.
- Brazo izquierdo cuasi estatico: el modelo fue entrenado con el brazo izquierdo practicamente fijo, por lo que no cabe esperar coordinacion bimanual real.
- Error notablemente mayor en el brazo derecho (0,0615 rad) que en el izquierdo (0,0065 rad), coherente con que el derecho es el que ejecuta el movimiento.
- Entrada tactil: las pruebas del autor indican que anadir tactil no mejora mas alla del ruido, lo que cuestiona su uso en esta configuracion.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, sin restricciones adicionales conocidas.
- Sin cuantizaciones ni formatos alternativos publicados: la integracion en otros runtimes requiere conversion manual.
- Sin idiomas, sin contexto textual y sin API de tool calling: cualquier descripcion que lo presente como modelo conversacional seria incorrecta.
- El modelo es un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin mantenimiento declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919
- Variante con tactil (ACT): https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919
- Variante Diffusion Policy: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919
- Variante Diffusion Policy con tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918
- Variante GR00T 3B con tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918
- Variante pi0.5: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918
- Variante pi0.5 con tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918
- Paper, blog, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
