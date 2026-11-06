# tatjr13/fallen-coco704-merged-t84t83-20261029

## Resumen

`fallen-coco704-merged-t84t83-20261029` es un modelo de deteccion de objetos publicado por el usuario tatjr13 en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: se trata de un grafo ONNX que fusiona dos detectores de personas caidas ("fallen person") entrenados por el propio autor, exportados previamente como grafos independientes y combinados en una unica sesion de inferencia. El modelo se distribuye como un "kit" plano de siete ficheros (pesos ONNX, script de servicio `miner.py`, configuracion, licencia y documentacion) con un total de 19.674.707 bytes, por debajo del limite de 30 MiB del repositorio.

La arquitectura subyacente no se declara explicitamente en la model card, pero la procedencia (notices de Ultralytics, salida densa con formato `cx, cy, w, h, confidence` y una sola clase) es compatible con una familia YOLO exportada a ONNX. La entrada es estatica y fija: `images [1,3,704,704]`. La salida son dos tensores densos independientes, `left_dense` y `right_dense`, cada uno de forma `[1,5,10164]`, correspondientes a las dos ramas (T84 y T83) que se combinan mediante una etapa de acuerdo fijo por IoU.

El interes del modelo es acotado pero tecnico: demuestra un patron de despliegue determinista y verificable por hash (el consumidor rechaza cargar si los bytes no coinciden), con inferencia solo en CPU mediante onnxruntime y una etapa de fusion de cajas entre dos ramas entrenadas con semillas distintas. No hay datos publicados de benchmarks oficiales ni comparativas con modelos de referencia, y el propio autor advierte que las mediciones son locales y no calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada; grafo ONNX con dos subgrafos de deteccion fusionados (compatible con familia YOLO/Ultralytics por los notices retenidos) |
| Parametros totales | No disponible (pesos: 19.584.750 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada fija de imagen) |
| Tipos de cuantizacion | No disponible (se distribuye un unico grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0-only, con notices de Ultralytics retenidos |
| Formato de pesos | ONNX (sesion unica fusionada) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Entrada | `images [1,3,704,704]`, estatica |
| Salidas | `left_dense` y `right_dense`, cada una `[1,5,10164]` (cx, cy, w, h, confianza) |
| Clases | Una: `fallen person` |
| Runtime | onnxruntime 1.26.0, solo CPU, intra-op 2 / inter-op 1 |
| Umbral de confianza | 0.1 por elemento |
| NMS | Greedy por clase, IoU 0.4, maximo 300 detecciones |
| Fusion entre ramas | Matching de cardinalidad maxima con IoU >= 0.5, coordenadas de la rama izquierda (T84), confianza minima de ambas ramas |
| Semillas de entrenamiento | T84: 44284; T83: 44283 |
| Tamano del kit | 19.674.707 bytes (7 ficheros) |

## Arquitectura y entrenamiento

El modelo es un grafo ONNX que fusiona, byte a byte y sin modificacion, dos subgrafos de deteccion previamente exportados por el autor. La rama izquierda (T84, semilla 44284) y la derecha (T83, semilla 44283) se sirven desde una unica sesion de onnxruntime. Cada rama produce su propio tensor denso de detecciones; el consumidor `miner.py` decodifica cada rama de forma independiente con la misma semantica (letterbox a 704, umbral 0.1, desletterbox, coordenadas enteras, NMS greedy a IoU 0.4, maximo 300 cajas, sin filtro de aspecto) y despues combina ambas listas mediante una etapa de acuerdo fijo: matching de cardinalidad maxima con IoU >= 0.5, conservando coordenadas nativas de la rama izquierda y la confianza minima de las dos ramas. No hay segundo modelo, ni TTA, ni post-procesado fuera del `miner.py` publicado.

El entrenamiento se describe solo a nivel de linaje: ambos grafos son exportaciones propias entrenadas sobre datos derivados de COCO publico, con notices de Ultralytics retenidos. No se especifican numero de tokens (no aplica), composicion del dataset, epochs, resolucion de entrenamiento ni si hubo aumento de datos o destilacion. Tampoco se documenta RLHF/DPO (no aplica). La innovacion tecnica destacable no esta en la arquitectura sino en el contrato de servicio: el consumidor embebe un inventario de hashes y se niega a cargar si algun byte no coincide; la configuracion `chute_config.yml` fija el runtime por hash, incluida la version exacta de onnxruntime. Se documenta tambien la cadena de linaje del consumidor (`070ad4c9 -> d798494f -> 2aa17b2b`), con deltas verificados por AST.

## Capacidades

- Deteccion de personas caidas en imagenes RGB, con una unica clase de salida (`fallen person`).
- Entrada de imagen estatica a resolucion fija 704x704; no admite resoluciones variables sin reexportar el grafo.
- Salida de cajas en coordenadas enteras con confianza por deteccion, hasta 300 cajas por rama antes de la fusion.
- Fusion de dos ramas entrenadas con semillas distintas mediante acuerdo por IoU, que actua como mecanismo de consenso entre detectores.
- Inferencia determinista en CPU: la repeticion en el mismo runtime produce resultados identicos (pass1 == pass2 en las 32 tramas medidas).
- Verificacion de integridad por hash en tiempo de carga (el consumidor rechaza bytes alterados).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo linguistico.
- No soporta vision generativa, audio, thinking mode ni ninguna capacidad conversacional.

## Casos de uso

- Monitorizacion de residencias y centros sanitarios: el modelo puede procesar fotogramas de camaras fijas para detectar personas caidas en el suelo, con inferencia solo en CPU (p95 de 55,152 ms en la medicion local del autor) que permite desplegarlo en servidores sin GPU junto a la infraestructura de videovigilancia existente.
- Sistemas de alerta en entornos industriales: integrado en un pipeline que recibe frames de camaras de planta y dispara avisos cuando se detecta una persona caida, aprovechando el umbral de confianza bajo (0.1) y el NMS configurado para reducir falsos negativos en escenas con oclusion.
- Analisis forense de grabaciones: procesado por lotes de secuencias de video para localizar eventos de caida, con la ventaja de que el modelo es determinista en el mismo runtime y permite reproducir exactamente un analisis anterior.
- Despliegue en dispositivos de borde sin GPU: al ejecutarse en onnxruntime solo CPU con hilos limitados (intra-op 2, inter-op 1), encaja en mini-PC o servidores modestos donde no hay acelerador disponible.
- Validacion de modelos de deteccion en investigacion: la etapa de fusion por acuerdo entre dos ramas con semillas distintas sirve como referencia para estudiar el efecto del ensembling por consenso en detectores de una sola clase.
- Auditoria de integridad en produccion: el mecanismo de verificacion por hash del consumidor y de la configuracion permite garantizar que el binario desplegado es exactamente el publicado, util en entornos regulados donde se exige trazabilidad del artefacto.
- Prototipado de deteccion de caidas en robots o drones: la entrada fija 704x704 y la salida densa simplifican la integracion en sistemas embebidos que ya realicen el preprocesado de letterbox.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (COCO mAP, etc.) en la informacion disponible. El autor proporciona exclusivamente mediciones locales y no calibradas:

| Medicion | Resultado | Condiciones |
|---|---|---|
| Paridad P32 vs raws ORT guardados | Coordenadas enteras y emparejamiento exactos en 32/32 tramas; confianzas con delta maximo 4,8e-07; 11/32 listas byte-iguales | ORT 1.26.0 vs raws de ORT 1.29.0, local no calibrado |
| Determinismo mismo runtime | pass1 == pass2 en 32/32 tramas | ORT 1.26.0 |
| Identidad entre versiones de ORT | 0/32 byte-identicas | Esperado entre builds distintos |
| Aceptacion historica del padre d798494f | p95 agrupado de 55,152 ms sobre presupuesto de 100 ms; 600/600 salidas con paridad exacta | ORT 1.26.0, 605 llamadas totales, carga ambiente |
| Aceptacion del consumidor actual 2aa17b2b | VERDICT PASS; 7 cajas exactas en frame 10, delta de confianza 0,0 | Host local con sustituciones de red |
| Evidencia post-hoc pre-fusion | 932/932 acuerdos en replay historico; 0 falsos positivos en nucleo de 545; 0 detecciones en 10 frames vacios | Replay historico de las ramas individuales |
| Lectura fresca del kit fusionado (fresh8) | 33/33 cajas de referencia cualificadas, 0 falsos positivos; la linea base de un solo modelo empata (33/33, 0 FP) | Local no calibrado, 2026-10-29 |

El propio autor advierte que la lectura fresh8 no establece margen sobre rivales (la linea base empata) y que ninguna de estas cifras es una puntuacion oficial de validador.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se sirve exclusivamente en CPU con onnxruntime.
- GPU recomendadas: ninguna; el contrato de servicio especifica sesion CPU-only con intra-op 2 e inter-op 1.
- Cabe en cualquier CPU moderna: los pesos ocupan 19,58 MB y la entrada es 1x3x704x704, con un p95 medido de 55,152 ms en el host del autor.
- Opciones de despliegue: onnxruntime 1.26.0 (version fijada por hash en `chute_config.yml`), con el consumidor `miner.py` publicado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: p95 de 55,152 ms por llamada de prediccion en la medicion historica de 600 llamadas; no se publica throughput agregado ni latencia en hardware distinto al del autor.
- Memoria RAM: no documentada; por el tamano de pesos y la resolucion de entrada, el requisito es bajo, pero no se da una cifra oficial.

## Comparativa con modelos similares

No se han publicado comparativas con modelos de referencia en la informacion disponible. El unico punto de comparacion documentado es interno: la lectura fresh8 del kit fusionado empata con la linea base de un solo modelo del propio autor (33/33 cajas, 0 falsos positivos en ambos casos), por lo que no se establece ventaja medible sobre su predecesor.

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fallen-coco704-merged-t84t83-20261029 | No disponible (19,58 MB de pesos) | Imagen fija 704x704 | fresh8 33/33, 0 FP (local no calibrado); p95 55,152 ms | AGPL-3.0-only | Hugging Face, 38 descargas |
| Linea base de un solo modelo del autor | No disponible | Imagen fija 704x704 | fresh8 33/33, 0 FP (local no calibrado) | No disponible | No distribuida en este repo |
| Otros detectores de personas caidas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de una sola clase (`fallen person`): no detecta otras categorias ni proporciona atributos adicionales (postura, identidad, estado).
- Entrada estatica a 704x704: cualquier otra resolucion requiere reexportar el grafo o aplicar letterbox externo.
- No hay benchmarks oficiales ni calibrados; todas las cifras son locales y el propio autor declara que la lectura fresh8 no demuestra margen sobre rivales.
- La identidad bit a bit no se mantiene entre versiones de onnxruntime (0/32 en la comparacion 1.26.0 vs 1.29.0); cambios de runtime pueden alterar las confianzas en el rango de 1e-4 a 1e-7.
- Riesgo de falsos positivos y negativos no cuantificado fuera del conjunto local del autor; el umbral de confianza bajo (0.1) y la ausencia de filtro de aspecto (`lying_min_wh` 0.0) pueden favorecer detecciones espurias en escenas no representativas.
- Sesgos conocidos: no documentados; el entrenamiento deriva de COCO publico, con los sesgos de composicion y demografia de ese dataset, pero el autor no los analiza.
- Licencia AGPL-3.0-only: el uso en servicios de red obliga a liberar el codigo fuente correspondiente; los notices de Ultralytics deben retenerse. No es apta para productos propietarios sin cumplir la AGPL.
- El consumidor rechaza cargar si los hashes no coinciden, lo que impide modificar el grafo o el script sin romper el contrato de servicio.
- No se distribuyen imagenes de entrenamiento, etiquetas ni material de custodia, lo que limita la reproducibilidad del entrenamiento.
- La model card incluye referencias a un "hotkey registration" y a un contexto de competicion que no se detalla; no debe interpretarse como validacion externa del rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/tatjr13/fallen-coco704-merged-t84t83-20261029
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
