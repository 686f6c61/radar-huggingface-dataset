# yyuncong/SyncWorld-mv3-strip384-views-first-v10-step17000

## Resumen

SyncWorld-mv3-strip384-views-first-v10-step17000 es un checkpoint intermedio (actualizacion 17000 de 30000) de un modelo del mundo para robotica entrenado por el autor `yyuncong` bajo el paraguas de SyncWorld-dev. El modelo aprende dinamica directa (forward dynamics) sobre secuencias de video y acciones: dada una imagen ancla y una secuencia de acciones comandadas, genera los siguientes 16 fotogramas. Su rasgo distintivo es el condicionamiento en contexto mediante recuperacion (retrieval): antes de la consulta se colocan K fragmentos observados de video/accion que actuan como contexto limpio dentro de la misma ventana de atencion.

La entrada no es una imagen suelta sino una tira de 1536x384 pixeles compuesta por tres celdas de 512x384: dos camaras en tercera persona (barajadas entre las dos primeras celdas por flujo) y la camara de muneca en la ultima. El modelo se inicializa desde un run previo de cosmos-framework-dev (`gripperhead-mv-strip384-4x3-fork174k-4x8`, iteracion 43500) ya entrenado sobre los mismos cuatro conjuntos de datos en formato de tira.

Es relevante porque explora una via poco comun en modelos del mundo roboticos: en lugar de memoria recurrente o TTT (test-time training), usa atencion completa con recuperacion de fragmentos vecinos por similitud de acciones y apariencia (DINOv2-base), con una regla de emparejamiento geometrico de camaras a 10 grados y 10 cm. El repositorio ocupa 30,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching) con atencion completa en contexto, sin memoria TTT |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el recetario entrena `moe_gen`, lo que sugiere componentes tipo MoE, pero no se detalla el conteo) |
| Longitud de contexto | ventana compartida entre la consulta (1 ancla + 16 acciones futuras + 16 fotogramas generados) y K fragmentos de 16 transiciones, con K uniforme en 1..8 |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de video/accion, no linguistico) |
| Licencia | openmdw-1.1 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | DCP (estado del entrenador) convertido a bf16; incluye `config.pkl` y `training/recipe.toml` |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion con flow matching sobre video y acciones. Cada flujo de entrenamiento procesa una tira de 1536x384 con tres celdas de 512x384: dos camaras en tercera persona barajadas entre las dos primeras posiciones y la camara de muneca en la tercera, con dropout de vista por flujo (una camara al 10 %, dos al 5 %) y recortes verticales aleatorios (tercera persona 0,3-0,65; muneca 0,5-1,0). Un plan de mosaico por flujo se mantiene para la consulta, sus propios fragmentos y cada fragmento de la biblioteca. La consulta consta de un fotograma ancla mas sus 16 acciones comandadas futuras, y el modelo genera los 16 fotogramas siguientes; antes de ella se sitúan K fragmentos observados de 16 transiciones como condicionamiento limpio en la misma ventana de atencion.

La recuperacion combina el fragmento adyacente con K-1 fragmentos elegidos por una regla de vecino mas cercano simplificada: curva de acciones comandadas con estados de pinza por paso y trayectoria del efector final relativa al inicio de cada fragmento (peso de accion 3), pose de inicio y apariencia DINOv2-base, buscando entre los fragmentos previos de la propia consulta y una biblioteca de todos los fragmentos de 16 fotogramas de las demas grabaciones (maximo 2 por grabacion, nunca el propio episodio). La variante "views first" puntua cada fragmento de biblioteca sobre ambas camaras en tercera persona conjuntamente y solo lo admite si su grabacion cubre tambien la otra camara mostrada dentro de 10 grados de rotacion y 10 cm de posicion. La biblioteca `mv_strip_v2_v10_views_grip_anch` contiene 3.852.002 fragmentos de 214.336 grabaciones.

El entrenamiento parte del run strip384 de cosmos-framework-dev y optimiza con AdamW (betas 0,9/0,99, weight decay 0,05), LR 5e-5 tras 400 actualizaciones de calentamiento lineal y luego constante, entrenando `moe_gen`, el embedder temporal, las proyecciones VAE/accion y el embedding de hueco de contexto, con una reetiquetacion del eje de accion por flujo (p 1,0), computo bf16 con pesos maestros fp32 y checkpointing completo de activaciones. Se ejecuto en 4 nodos x 8 H100 (HSDP: grupo FSDP de 8 vias por nodo, 4 replicas), 1 flujo por GPU (32 flujos por actualizacion), 30.000 actualizaciones y checkpoint cada 1000. Los datos son `robocasa_v2` (10.478 grabaciones), `robomimic_v2` (16.608), `rlbench_wrist_mv` (11.314, 1.061 trayectorias sobre 8 conjuntos de render) y `droid` (68.768, descartando grabaciones de mas de 3.000 fotogramas), solo grabaciones expertas, con pesos 2:2:1:2.

## Capacidades

- Generacion de video condicionada a acciones: predice 16 fotogramas futuros a partir de un ancla y 16 acciones comandadas.
- Dinamica directa multi-vista: modela conjuntamente dos camaras en tercera persona y una camara de muneca en una sola tira.
- Condicionamiento en contexto por recuperacion: incorpora hasta 8 fragmentos observados como contexto limpio en la ventana de atencion.
- Recuperacion geometricamente coherente: empareja camaras entre grabaciones con tolerancia de 10 grados y 10 cm, evitando celdas negras o vistas incongruentes.
- Modelado de pinza y trayectoria del efector final como parte de la senal de accion.
- No soporta tool calling, agentes, texto ni capacidades linguisticas: es un modelo de mundo para robotica.
- No dispone de modo de razonamiento explicito ni de memoria TTT en esta variante.

## Casos de uso

- Planificacion robotica basada en modelo: simular mentalmente los 16 fotogramas siguientes de una politica candidata antes de ejecutarla en el robot, usando la recuperacion de fragmentos para anclar la prediccion en episodios reales similares.
- Evaluacion offline de politicas: generar rollouts sinteticos condicionados a acciones comandadas y comparar la distribucion de resultados con la de ejecuciones reales, reduciendo el coste de pruebas fisicas.
- Aumento de datos para imitacion: producir trayectorias visuales plausibles a partir de demostraciones expertas de robocasa, robomimic, RLBench y DROID para ampliar el conjunto de entrenamiento de politicas.
- Aprendizaje por recuperacion en produccion: dado un episodio nuevo, recuperar fragmentos de la biblioteca de 3,85 millones de chunks para condicionar la prediccion con contexto relevante sin reentrenar.
- Investigacion en modelos del mundo multi-camara: banco de pruebas para comparar recuperacion en contexto frente a memoria recurrente o TTT en tareas de manipulacion.
- Simulacion de manipulacion con pinza: predecir la evolucion de la pinza y del efector final en tareas de agarre, gracias a la codificacion explicita de estados de pinza en la regla de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de flow matching de video de la consulta (`train@2/loss`), promediada sobre las 500 actualizaciones previas a cada marca:

| Actualizacion | 1000 | 2000 | 4000 | 8000 | 12000 | 16000 | 17000 |
|---|---|---|---|---|---|---|---|
| loss | 0,0659 | 0,0652 | 0,0658 | 0,0652 | 0,0636 | 0,0629 | 0,0623 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 30,3 GB en bf16, por lo que la inferencia en bf16 requiere al menos ese orden de memoria mas activaciones y cache de atencion.
- GPU de entrenamiento: 32 H100 en 4 nodos x 8 GPU con HSDP (grupo FSDP de 8 vias, 4 replicas).
- GPU recomendadas para inferencia: H100 o A100 de 80 GB por la ventana de atencion con hasta 8 fragmentos de contexto; no se documenta soporte en GPU de consumo.
- Cabe en GPU de consumo: no disponible; el tamano del checkpoint y la ventana de atencion completa lo hacen improbable en tarjetas de 24 GB sin cuantizacion, que no esta documentada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el checkpoint es un estado DCP del entrenador con `config.pkl` y recetario TOML, pensado para el framework de entrenamiento original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-v10-step17000 | no disponible | consulta + K fragmentos (K 1..8) | Difusion flow matching con recuperacion en contexto | openmdw-1.1 | HuggingFace, checkpoint intermedio |
| SyncWorld-mv3-strip384-recent8-step* | no disponible | consulta + K fragmentos | Misma familia, recuperacion `recent8` en lugar de vecino simplificado | openmdw-1.1 | HuggingFace |
| cosmos-framework-dev strip384 (`gripperhead-mv-strip384-4x3-fork174k-4x8`, iter 43500) | no disponible | no disponible | Modelo base del que se inicializa, sin recuperacion | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: la actualizacion 17000 de 30000, por lo que el modelo no ha completado su entrenamiento y su calidad final no esta garantizada.
- Modelo de mundo, no de lenguaje: no procesa texto ni responde a instrucciones; cualquier uso fuera de robotica y video requiere adaptacion.
- Dependencia fuerte de la biblioteca de recuperacion: el rendimiento esta ligado a `mv_strip_v2_v10_views_grip_anch` y a la regla de recuperacion; sin ella el condicionamiento en contexto no funciona.
- Restriccion geometrica de 10 grados y 10 cm: fuera de ese margen, las consultas de robocasa y robomimic pueden no encontrar su gemelo de montaje de camaras, degradando la prediccion.
- Sesgos de datos: entrenado solo con grabaciones expertas de cuatro conjuntos (robocasa, robomimic, RLBench, DROID), lo que limita la generalizacion a politicas suboptimas o entornos no representados.
- Riesgo de alucinacion visual: como modelo generativo, puede producir fotogramas fisicamente implausibles, especialmente en horizontes largos.
- Licencia openmdw-1.1 con enlace a la licencia de NVIDIA Cosmos: es necesario revisar los terminos para uso comercial antes de desplegar.
- Sin cuantizaciones publicadas ni soporte documentado para motores de inferencia estandar, lo que complica su integracion en produccion.
- Idiomas: no aplica, pero tampoco se documentan capacidades multimodales fuera de video y acciones.

## Enlaces

- HuggingFace: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-v10-step17000
- Variante comparada recent8: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-step
- Licencia openmdw-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
