# XYZPIT/gr00t-breadbag-masked-h16-100k

## Resumen

XYZPIT/gr00t-breadbag-masked-h16-100k es un checkpoint de politica robotica (pipeline declarado como `robotics`) publicado por el usuario XYZPIT, derivado de la familia NVIDIA Isaac GR00T, segun indican las etiquetas del repositorio (`Gr00tN1d6`, `robotics`, `embodied-ai`, `robot-manipulation`, `imitation-learning`). El repositorio contiene 3.286.608.832 parametros en formato safetensors y ocupa 22,8 GB, un tamano muy superior al de los pesos en una sola precision, lo que sugiere que el repositorio incluye varias copias o checkpoints intermedios.

El nombre del checkpoint indica un entrenamiento o ajuste de 100.000 pasos (`100k`), una variante "masked" y un horizonte `h16`, probablemente 16 pasos de accion. La model card publicada no describe el modelo, sino el conjunto de datos de entrenamiento: el "R1 Lite Multi-Object Pick-Up Dataset", 181 episodios (67 de bread bag, 60 de cup, 54 de financier) con 543 videos en tres vistas (ego, muneca izquierda, muneca derecha) grabados con un robot bimanual R1 Lite. La tarea es exclusivamente de agarre y elevacion (pick-up) dirigido por instruccion, sin fase de colocacion.

Es relevante ahora porque se enmarca en la corriente de modelos fundacionales vision-lenguaje-accion (VLA) abiertos para manipulacion robotica, y porque el ecosistema GR00T de NVIDIA y LeRobot de HuggingFace estan facilitando el ajuste fino y el despliegue de estos checkpoints. Ahora bien, la ficha debe leerse con cautela: la licencia no esta declarada, no hay resultados de evaluacion publicados y la documentacion disponible no detalla la arquitectura ni el procedimiento de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `Gr00tN1d6` sugiere la familia NVIDIA Isaac GR00T N1.6, modelo vision-lenguaje-accion; no confirmado en la informacion) |
| Parametros totales | 3.286.608.832 (~3,29 mil millones) |
| Parametros activos | no disponible / no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo declara safetensors; no se anuncian variantes GGUF, int8 o int4) |
| Idiomas soportados | no disponible (las instrucciones de ejemplo de la model card estan en ingles y la documentacion en coreano, pero no se declara soporte oficial de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 22,8 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 12 / 0 |
| Fecha de creacion y ultima actualizacion | 29 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la informacion proporcionada. La etiqueta `Gr00tN1d6` apunta a la familia NVIDIA Isaac GR00T N1.6, y el repositorio NVIDIA/Isaac-GR00T encontrado en la busqueda hace referencia a GR00T N1.7. Los modelos GR00T de NVIDIA se describen habitualmente como modelos vision-lenguaje-accion con un componente de vision-lenguaje y una cabeza de accion basada en transformer de difusion. No obstante, no hay confirmacion en la documentacion de este repositorio concreto, por lo que cualquier afirmacion sobre el numero de componentes, el encoder visual o el mecanismo de generacion de acciones debe considerarse no verificada.

Respecto al entrenamiento, los datos disponibles indican que se ha utilizado el R1 Lite Multi-Object Pick-Up Dataset, con 181 episodios y 543 videos en tres vistas sincronizadas (ego o camara de cabeza, muneca izquierda y muneca derecha) en formato MP4/H.264. Las instrucciones de ejemplo son del tipo "Pick up the bread bag.", "Pick up the cup." y "Pick up the financier.". El sufijo `100k` del nombre corresponde a un checkpoint de 100.000 pasos y `h16` a un horizonte de prediccion de acciones de 16 pasos, aunque esto no esta confirmado explicitamente en la model card. No se documenta el uso de RLHF, DPO ni ninguna fase de alineacion, ni el numero total de tokens o muestras vistas durante el entrenamiento. El termino `masked` tampoco se explica en la documentacion disponible.

## Capacidades

- Manipulacion robotica bimanual: el checkpoint esta orientado a politicas de agarre y elevacion con el robot R1 Lite, segun la descripcion del conjunto de datos de entrenamiento.
- Seleccion de objeto dirigida por instruccion: en una escena con tres objetos simultaneos (bread bag, cup, financier), la politica debe seleccionar y agarrar unicamente el objeto indicado en la instruccion.
- Aprendizaje por imitacion multimodal: el entrenamiento se apoya en tres flujos RGB simultaneos, lo que implica capacidad de fusionar informacion de vistas egocentrica y de ambas munecas.
- Politicas object-centric: la formulacion de la tarea es centrada en el objeto objetivo, no en la trayectoria completa.
- Alcance limitado de la tarea: no se ha entrenado para colocar objetos (no hay fase de place), ni para objetos distintos de los tres de la escena de entrenamiento.
- Tool calling / function calling: no disponible; no es una capacidad propia de un modelo de politica robotica y no se documenta.
- Agentes y razonamiento multi-paso: no disponible; no se documenta ninguna capacidad de planificacion simbolica o razonamiento de varios pasos.
- Capacidades multilingues: no disponible; las instrucciones de entrenamiento estan en ingles.
- Modo "thinking": no disponible.

## Casos de uso

- Seleccion de objeto en escenas multiproducto: dado un conjunto de objetos sobre una superficie, el checkpoint puede usarse para que el robot agarre el objeto designado por la instruccion, aprovechando las tres vistas para desambiguar objetos visualmente parecidos.
- Recogida automatizada en lineas de envasado: el escenario de bread bag, cup y financier es representativo de una operacion de picking en alimentacion, donde el robot debe identificar y elevar el articulo correcto antes de una fase de colocacion gestionada por otro modulo.
- Baseline de investigacion en manipulacion bimanual: sirve como punto de partida reproducible para comparar tecnicas de enmascarado o de horizonte de prediccion frente al checkpoint hermano XYZPIT/gr00t_breadbag_baseline_100K.
- Ajuste fino para nuevas categorias de objetos: partiendo de este checkpoint se puede reentrenar con un conjunto reducido de episodios etiquetados para un objeto nuevo, aprovechando que el modelo ya ha visto agarres bimanuales con multiples objetos.
- Aprendizaje por imitacion a partir de demostraciones humanas o teleoperadas: el modelo encaja en un flujo donde se graban episodios con tres camaras y se entrena una politica de imitacion supervisada.
- Evaluacion de robustez ante oclusiones y enmascarado visual: la variante `masked` es adecuada para estudiar como se degrada la politica cuando se oculta informacion de alguna vista o region de la imagen.
- Integracion en pipelines LeRobot e Isaac-GR00T: el modelo hermano del mismo autor incluye instrucciones de uso con LeRobot, lo que sugiere que este checkpoint puede cargarse en ese ecosistema para validacion en bucle abierto.
- Prototipado en laboratorio con un R1 Lite: para grupos que dispongan de ese robot bimanual, el checkpoint permite reproducir la tarea descrita sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio hermano XYZPIT/gr00t_breadbag_baseline_100K menciona en su descripcion "Open-loop validation" y resultados de "Checkpoint-100K", pero no se han proporcionado las cifras asociadas a este checkpoint, por lo que no se reproducen datos numericos.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (3.286.608.832). No son cifras publicadas por el autor y no incluyen el coste de los encoders visuales, buffers de observacion ni el bucle de control:

- Pesos en FP32: unos 13,1 GB.
- Pesos en BF16/FP16: unos 6,6 GB.
- Pesos en int8: unos 3,3 GB.
- Pesos en int4: unos 1,6 GB.
- VRAM estimada para inferencia en BF16 con margen de activaciones y codificacion visual: del orden de 9 a 12 GB.
- VRAM estimada en FP32: del orden de 16 a 18 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en servidor y lotes grandes; RTX 4090, RTX 3090 (24 GB) o RTX 4080 (16 GB) para trabajo en estacion de trabajo siempre que se use BF16.
- Cabria en GPU de consumo en BF16 (por ejemplo, RTX 4090, 3090 o 4080), aunque con margen ajustado en tarjetas de 16 GB y dependiendo del pipeline de vision.
- Opciones de despliegue: safetensors sobre PyTorch; el ecosistema NVIDIA Isaac GR00T y LeRobot aparecen referenciados tanto en la busqueda web como en el repositorio hermano del mismo autor. vLLM, llama.cpp y Ollama no aplican a un modelo de politica robotica de este tipo.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de frecuencia de control, tiempo de inferencia por paso ni rendimiento en bucle cerrado para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XYZPIT/gr00t-breadbag-masked-h16-100k | 3.286.608.832 | no aplica / no disponible | safetensors | no disponible | HuggingFace |
| XYZPIT/gr00t_breadbag_baseline_100K | no disponible | no aplica / no disponible | no disponible | no disponible | HuggingFace (mismo autor) |
| NVIDIA Isaac GR00T N1.7 (modelo base de la familia) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion; el repositorio NVIDIA/Isaac-GR00T es publico en GitHub | GitHub y HuggingFace |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoria. Las etiquetas del repositorio no permiten confirmar la equivalencia exacta con un checkpoint base concreto de la familia GR00T.

## Limitaciones y advertencias

- Discrepancia entre artefacto y documentacion: el repositorio contiene un modelo (safetensors, 3,29 mil millones de parametros, pipeline `robotics`), pero la model card publicada describe un conjunto de datos, no el checkpoint. La model card no detalla hiperparametros, ingredientes de entrenamiento ni metodo de evaluacion.
- Licencia no declarada: al no especificarse licencia, no existe autorizacion explicita para uso comercial ni para redistribucion. Es un riesgo legal relevante para produccion.
- Sin resultados de evaluacion: no hay tasas de exito de agarre, ni validacion en bucle cerrado, ni comparacion con el baseline del mismo autor.
- Alcance funcional muy reducido: la tarea es unicamente pick-up de tres objetos concretos; no incluye colocacion, apilado, articulacion de objetos ni navegacion.
- Riesgo de sobreajuste al entorno de recogida: 181 episodios en una configuracion concreta de iluminacion, camaras y robot. La transferencia a otra celda, otros objetos o otra iluminacion no esta documentada.
- Sin datos de sesgo o robustez: no se ha publicado ningun analisis de fallos, sensibilidad a oclusiones ni comportamiento ante instrucciones ambiguas.
- Idiomas: no se declara soporte multilingue. Las instrucciones de ejemplo estan en ingles y la documentacion en coreano, lo que puede dificultar la reproducibilidad para equipos hispanohablantes.
- Riesgo de confusion con el modelo base: la etiqueta `Gr00tN1d6` no aclara si se trata de un ajuste completo o de un adaptador, ni que subconjunto de pesos esta realmente entrenado.
- Despliegue en robot fisico: cualquier uso sobre hardware real requiere validacion de seguridad previa; un fallo de la politica de agarre puede danar objetos, el efector final o el entorno.
- Trazabilidad temporal: las fechas del repositorio (29 de septiembre de 2026) indican un artefacto reciente, con solo 12 descargas y 0 likes, por lo que no existe practicamente retroalimentacion de la comunidad sobre su funcionamiento.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/XYZPIT/gr00t-breadbag-masked-h16-100k
- Repositorio hermano del mismo autor: https://huggingface.co/XYZPIT/gr00t_breadbag_baseline_100K
- NVIDIA Isaac-GR00T (repositorio oficial de la familia GR00T): https://github.com/NVIDIA/Isaac-GR00T
- Documentacion de LeRobot (referenciada para el modelo hermano): https://huggingface.co/docs/lerobot
