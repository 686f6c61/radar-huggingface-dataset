# tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920

## Resumen

`ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920` es una politica visomotora entrenada con Diffusion Policy y publicada en HuggingFace por el usuario `tarzanagh`. Resuelve una tarea concreta de manipulacion bimanual diestra: un robot DexMate Vega-1 con dos manos RobotEra XHand1 coge una caja de pañuelos de un nivel de estanteria, se la pasa de una mano a otra y la deposita en otro nivel. Los datos se capturaron mediante teleoperacion con guante Meta (sin exoesqueleto) y seguimiento de muñeca con Vive.

Su interes es metodologico: forma parte de una matriz de 24 ejecuciones que cruza cuatro familias de politicas (ACT, Diffusion Policy, GR00T y pi0.5), tres tareas y dos variantes (con y sin entrada tactil), lo que permite comparar arquitecturas bajo un mismo conjunto de datos. El modelo tiene 267.483.430 parametros y el repositorio ocupa 1,1 GB en safetensors, bajo licencia Apache 2.0.

No es un modelo de lenguaje y no procesa instrucciones en texto. Consume cuatro camaras RGB a 640x360 y 30 fps mas un vector de estado/accion de 38 dimensiones, y predice trozos de 16 acciones. El propio autor advierte que las metricas publicadas miden seguimiento de trayectoria en bucle abierto, no exito de tarea, y que ninguna prueba se ejecuto en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (politica visomotora generativa por difusion, condicionada por observaciones) |
| Parametros totales | 267.483.430 |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica en el sentido de LLM; horizonte de observacion con re-planificacion cada 16 pasos y prediccion de trozos de 16 acciones |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de robotica; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Handover bimanual shelf-to-shelf de una caja de pañuelos |
| Embodiment | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Entrada sensorial | 4 camaras RGB, 640x360 a 30 fps |
| Espacio de estado / accion | 38 dimensiones: `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` (posiciones articulares) |
| Episodios de entrenamiento | 54 en total; 48 de entrenamiento y 6 reservados (cada decimo) |
| Pasos de entrenamiento | 10.000 (semilla 1000) |
| Tamano del repositorio | 1,1 GB |
| Fecha de publicacion | 2026-09-24 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

Se trata de una Diffusion Policy: un modelo generativo que aprende la distribucion de secuencias de acciones condicionada por observaciones visuales y de estado, y que genera acciones mediante un proceso de difusion. El checkpoint se entrena sobre 54 episodios de teleoperacion con guante Meta y seguimiento Vive, con cuatro camaras RGB a 640x360 y 30 fps, durante 10.000 pasos con semilla 1000. El vector de estado y accion es de 38 dimensiones, correspondiente a las posiciones articulares de los dos brazos (7 grados de libertad cada uno) y las dos manos (12 grados de libertad cada una).

El esquema de ejecucion es de re-planificacion periodica: la politica observa el estado real cada 16 pasos, predice un trozo de acciones y conserva las 16 primeras. Esto implica una frecuencia de re-planificacion de 1,875 Hz dentro de un bucle de control de 30 Hz, es decir, cada inferencia debe resolverse en menos de 533 ms para no detener el bucle (dato derivado de la configuracion descrita, no medido por el autor). No se documenta en la informacion disponible si hubo RLHF, DPO ni ninguna otra fase de ajuste, ni el numero total de tokens o muestras equivalentes consumidas durante el entrenamiento.

## Capacidades

- Generacion de trayectorias de accion de 38 dimensiones para manipulacion bimanual diestra, con control simultaneo de dos brazos de 7 grados de libertad y dos manos de 12 grados de libertad.
- Traspaso de un objeto entre manos dentro de una misma secuencia (handover), no solo picking con una pinza simple.
- Manipulacion de objetos ligeros y deformables tipo caja de pañuelos, con agarre de dedos.
- Percepcion visual multi-camara: procesa cuatro flujos RGB simultaneos a 640x360 y 30 fps.
- Prediccion de trozos de acciones (action chunking) de 16 pasos con re-observacion periodica.
- Ejecucion de una tarea de pick-and-place entre dos niveles de estanteria en un unico entorno.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso simbolico ni planificacion basada en lenguaje.
- No tiene capacidades multilingues ni modo de pensamiento: no es un modelo de lenguaje ni un VLM conversacional.
- No se documenta vision semantica, audio ni entrada tactil en este checkpoint concreto (existe una variante tactil separada en la misma coleccion).

## Casos de uso

- Traspaso bimanual en logistica de estanterias: es la tarea exacta para la que se entreno el checkpoint. Permite automatizar la retirada de un objeto de un nivel, su paso de mano a mano y su colocacion en otro nivel sin soltar la pieza en el suelo ni usar una superficie intermedia.
- Reposicion de producto en retail: el modelo sirve como base para mover mercancia ligera entre estantes, reutilizando el mismo espacio de acciones de 38 dimensiones si el robot es el mismo DexMate Vega-1 con manos XHand1.
- Manipulacion diestra con manos de 12 grados de libertad: al predecir articulaciones de dedo y no solo la posicion de la pinza, es adecuado para tareas que requieren agarres envolventes o ajustes finos de presion sobre objetos deformables.
- Linea base de investigacion: resulta util como referencia cuantitativa de Diffusion Policy dentro de una comparativa con ACT, GR00T y pi0.5 sobre el mismo dataset de 54 episodios, lo que permite aislar el efecto de la arquitectura.
- Ablacion de entrada tactil: la propia model card indica que, en el conjunto de tareas evaluado, la entrada tactil no aporto mejoria mas alla del ruido; este checkpoint sin tactil es el punto de comparacion natural para reproducir y verificar ese resultado.
- Punto de partida para ajuste fino con datos propios: con 48 episodios de entrenamiento y 10.000 pasos, el coste de reentrenamiento es bajo, por lo que sirve para adaptar la politica a un objeto o estanteria distinta mediante teleoperacion adicional.
- Banch de validacion de pipelines de robotica en simulacion o laboratorio: al no haberse probado en hardware segun el autor, es un candidato adecuado para reproducir el experimento en un gemelo digital antes de llevarlo a produccion.
- Estudio de latencia en control en tiempo real: la necesidad de re-planificar cada 16 pasos a 30 Hz lo convierte en un caso de prueba util para medir el coste de inferencia de una Diffusion Policy de 267 millones de parametros en una GPU concreta.

## Benchmarks y rendimiento

El autor publica el error en bucle abierto sobre los 6 episodios reservados (n=6), medido como la media del valor absoluto de la diferencia entre la accion predicha y la registrada, en radianes, con el error estandar de la media. Se compara con un baseline trivial que mantiene la primera observacion (`hold-first-frame`):

| Metrica (held-out, bucle abierto) | Este modelo (dp) | Baseline hold-first-frame |
|---|---|---|
| Error medio L-brazo (rad) | 0,0500 ± 0,0059 | 0,3538 |
| Error medio L-mano (rad) | 0,0288 ± 0,0017 | 0,2351 |
| Error medio R-brazo (rad) | 0,0446 ± 0,0023 | 0,2926 |
| Error medio R-mano (rad) | 0,0237 ± 0,0013 | 0,2373 |

Advertencias sobre estas cifras, segun la propia model card: miden seguimiento de trayectoria, no exito de tarea; no se ejecuto nada en hardware real; y el modelo ve la observacion real cada 16 pasos, conservando solo las 16 primeras acciones del trozo predicho. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de tasa de exito de tarea en la informacion disponible, y no se dispone de las cifras concretas del resto de familias (ACT, GR00T, pi0.5) para esta tarea; solo se indica cualitativamente que GR00T obtuvo el error mas bajo en todas las tareas evaluadas.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, aproximadamente 1,07 GB para 267.483.430 parametros; en fp16 o bf16, aproximadamente 0,53 GB. El repositorio de 1,1 GB es coherente con pesos en precision completa.
- La VRAM de pesos no es el cuello de botella: hay que sumar el coste de los cuatro codificadores visuales que procesan cuatro flujos RGB de 640x360 a 30 fps, mas las activaciones del proceso de difusion, que suele requerir varias pasadas por paso de denoising.
- Cabe con holgura en GPU de consumo: RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 son suficientes por capacidad de memoria para los pesos. El autor no publica que se haya ejecutado en ninguna de ellas.
- GPU de centro de datos (A100, H100, L40S) recomendadas si se necesita baja latencia sostenida o ejecutar varias politicas en paralelo, por ejemplo al comparar las 24 ejecuciones de la matriz.
- Restriccion temporal derivada de la configuracion: con re-planificacion cada 16 pasos a 30 Hz, cada inferencia debe completarse en menos de 533 ms. No se publican latencias ni throughput medidos.
- Opciones de despliegue: el modelo es un checkpoint de PyTorch con pesos en safetensors, por lo que el despliegue esperado es con la libreria de Diffusion Policy o con PyTorch directamente. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La conversion a ONNX o TensorRT para reducir latencia en el bucle de control es una via habitual, pero no esta documentada por el autor.
- El bucle de control requiere comunicacion en tiempo real con los dos brazos y las dos manos (38 grados de libertad en total), lo que añade requisitos de bus y de frecuencia de envio al hardware, no solo de computo.

## Comparativa con modelos similares

Todos los modelos comparados pertenecen a la misma matriz de 24 ejecuciones del mismo autor sobre el mismo dataset (54 episodios, 4 camaras, 38 dimensiones de estado y accion). No se dispone de las cifras numericas del resto de familias en la informacion proporcionada.

| Modelo | Arquitectura | Parametros | Observacion | Error held-out | Licencia |
|---|---|---|---|---|---|
| `dp260920` (este) | Diffusion Policy | 267.483.430 | 4 camaras 640x360 @30 fps + estado 38-D | 0,0500 ± 0,0059 (L-brazo) | Apache 2.0 |
| `dptactile260920` | Diffusion Policy con entrada tactil | no disponible | mismo setup mas tactil | no disponible en la informacion proporcionada | no disponible |
| `act260920` | ACT (Action Chunking Transformer) | no disponible | mismo setup | no disponible en la informacion proporcionada | no disponible |
| `acttactile260920` | ACT con entrada tactil | no disponible | mismo setup mas tactil | no disponible en la informacion proporcionada | no disponible |
| `gr00t3b260920` | GR00T (aproximadamente 3B, segun el identificador del checkpoint) | no disponible | mismo setup | el mas bajo en todas las tareas, valor no publicado | no disponible |
| `pi05260920` | pi0.5 | no disponible | mismo setup | no disponible en la informacion proporcionada | no disponible |

Conclusion cualitativa publicada por el autor: la entrada tactil no supuso diferencia mas alla del ruido en las cuatro familias y las tres tareas evaluadas, y GR00T obtuvo el error mas bajo en todas las tareas.

## Limitaciones y advertencias

- Las metricas publicadas miden error de seguimiento de trayectoria en bucle abierto sobre 6 episodios reservados, no tasa de exito de la tarea. No se ejecuto nada en hardware real.
- Dataset muy pequeño: 54 episodios, de los cuales 48 se usan para entrenar. El riesgo de sobreajuste al entorno concreto y de falta de generalizacion es alto.
- Un unico embodiment (DexMate Vega-1 con manos RobotEra XHand1), un unico entorno (estanteria), una unica familia de objeto (caja de pañuelos). Cualquier cambio de robot, de camaras o de distribucion de escena invalida el modelo sin reentrenamiento.
- Dependencia de la configuracion exacta de las cuatro camaras (640x360 a 30 fps) y del calibrado; no se documenta la sensibilidad a cambios de iluminacion, oclusiones o reposicionamiento de camaras.
- No acepta instrucciones en lenguaje natural ni objetivos variables: la tarea esta fijada por los datos de entrenamiento.
- El esquema de fragmentos de 16 acciones obliga a re-observar cada 16 pasos; si la inferencia tarda mas de 533 ms en un bucle de 30 Hz, el robot ejecutaria acciones obsoletas. No hay mediciones publicadas de latencia.
- Las politicas de difusion pueden generar acciones fuera de distribucion. En produccion es imprescindible limitar articulaciones, controlar velocidades y disponer de parada de emergencia.
- Las variantes con entrada tactil no aportaron mejoria medible, por lo que no hay evidencia que justifique su uso en esta tarea.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 me gusta en el momento de la consulta. Es un artefacto de investigacion, no un modelo contrastado.
- Licencia Apache 2.0: permite uso comercial, pero hay que revisar por separado las licencias del codigo base de Diffusion Policy, de las dependencias y de cualquier componente del fabricante del robot o de las manos.
- Anomalia en los metadatos: las fechas de creacion y actualizacion del repositorio son del 24 de septiembre de 2026, posteriores a la fecha habitual de consulta. Conviene verificar la procedencia y el caracter del artefacto antes de reutilizarlo.
- El identificador incluye dos marcas en formato aammdd (`260918` y `260920`), presumiblemente correspondientes a la captura de datos y al entrenamiento, pero esta interpretacion no se confirma en la model card.
- No se especifica la composicion demografica ni de escenarios del dataset, ni se publican analisis de sesgo, aunque en robotica de imitacion el sesgo relevante es el de las condiciones de captura, no el demografico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dp260920
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_act260920
- Variante ACT con tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_acttactile260920
- Variante Diffusion Policy con tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_dptactile260920
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920
- Variante GR00T 3B con tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3btactile260920
- Variante pi0.5: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05260920
- Variante pi0.5 con tactil: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_pi05tactile260920
- La model card indica que la tarea tiene 24 ejecuciones en total; los enlaces anteriores son las 8 incluidas en el README. El listado completo de las 16 restantes, asi como papers, blogs, repositorios de codigo y demos asociados, no esta disponible en la informacion proporcionada.
