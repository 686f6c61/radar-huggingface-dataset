# storytracer/cuttlefisher

## Resumen

Cuttlefisher es un modelo de deteccion de objetos desarrollado por el usuario storytracer, un fine-tuning de YOLO26 (variante medium) sobre el modelo base Ultralytics/YOLO26. Su tarea concreta es la deteccion de bloques de maquetacion en paginas de prensa historica, con especial enfasis en la clase `ARTICLE-TITLE`, es decir, las lineas de titular necesarias para trocear una pagina en articulos. Esta pensado para alimentar la fase bottom-up de un pipeline de segmentacion de articulos, de forma que un OCR posterior pueda decidir donde empieza cada pieza informativa segun el orden de lectura.

El modelo se distribuye como un unico fichero `best.pt` (fase 1), entrenado exclusivamente sobre el split de entrenamiento de `Teklia/Newspapers-finlam`: 623 paginas de 149 periodicos franceses e ingleses de los siglos XIX y XX, con imagenes de aproximadamente 2000 px de alto. Reconoce 13 clases de maquetacion con granularidad heterogenea: un cuadro por bloque de parrafo para el cuerpo de texto y un cuadro por linea para titulares, subtitulos y entradillas.

Su relevancia actual es practica mas que arquitectonica: la mayoria de herramientas de analisis de maquetacion historica identifican regiones y orden de lectura, pero no ofrecen una clase de titulo fiable. Cuttlefisher cubre ese hueco concreton y se integra en SquiddleOCR y en el pipeline descrito por Mocaër et al. (ICDAR-HIP 2026). La licencia es MIT tanto para el modelo como para los corpus de entrenamiento, y el repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detector end-to-end sin NMS |
| Parametros totales | no disponible (variante `yolo26m`, recuento exacto no publicado en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion); resolucion de entrada de 1280 px |
| Tipos de cuantizacion | no disponible; solo se publica `best.pt` en PyTorch, sin exportaciones GGUF, ONNX ni INT8 documentadas |
| Idiomas soportados | frances e ingles (idiomas del corpus de periodicos de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, libreria ultralytics) |
| Pipeline | object-detection |
| Modelo base | Ultralytics/YOLO26, fine-tuning desde pesos COCO (`yolo26m.pt`) |
| Clases | 13 (ids 0-12) |
| Libreria requerida | ultralytics >= 8.4 |
| Tamano del repositorio | 0,0 GB reportados por HuggingFace (no refleja el peso real de `best.pt`) |
| Descargas / likes | 0 / 0 |

Clases en orden de id:

| id | clase | id | clase |
|---|---|---|---|
| 0 | HEADER-TITLE | 8 | ARTICLE-INSIDEHEADING |
| 1 | HEADER-TEXT | 9 | CAPTION |
| 2 | ARTICLE-ILLUSTRATION | 10 | AUTHOR |
| 3 | ADVERTISEMENT | 11 | ARTICLE-TABLE |
| 4 | ANNOUNCEMENT | 12 | SECTION-TITLE |
| 5 | ARTICLE-TITLE | | |
| 6 | ARTICLE-TEXT | | |
| 7 | ARTICLE-SUBTITLE | | |

## Arquitectura y entrenamiento

La arquitectura es YOLO26 en su variante medium, un detector denso end-to-end sin supresion de no maximos (el parametro `iou` de Ultralytics no tiene efecto). Se parte de pesos preentrenados en COCO y se hace fine-tuning con Ultralytics 8.4.146 sobre torch 2.14 + cu126. La receta de la fase 1 usa `imgsz=1280`, batch 32 repartido en 4 GPU RTX A6000 (8 imagenes por GPU, unos 20 pasos por epoca), 150 epocas con `cos_lr`, paciencia de 30 epocas, `cache=ram`, `max_det=600` y aumento de datos por defecto. El mejor punto se alcanzo en la epoca 78 y el entrenamiento se detuvo en la 108; el proceso completo duro 24 minutos.

Se probaron alternativas que no se seleccionaron: `yolo26s` (0,04 puntos menos de mAP50 en titulares), `imgsz=1024` (empate en titulares, peor rendimiento global), el ciclo coseno completo de 150 epocas sin parada temprana y `yolo26l` (ambos con mAP50-95 ligeramente mejor pero peor en las clases de titulo). No se documenta RLHF, DPO ni ninguna fase de alineacion, algo esperable en un detector. La innovacion relevante es de planteamiento: la granularidad de anotacion (un cuadro por linea en titulares, un cuadro por parrafo en texto) y el uso de la deteccion como paso previo a una regla de corte de articulos en orden de lectura. Esta prevista una fase 2 entrenada sobre FINLAM mas `La Liberte` (8.836 paginas de 1925-1928), que se publicaria bajo `phase2/` si mejora el split de test diverso.

## Capacidades

- Deteccion de bloques de maquetacion en paginas de prensa historica con 13 clases, en una sola pasada y sin NMS.
- Localizacion especifica de lineas de titular (`ARTICLE-TITLE`), subtitulo (`ARTICLE-SUBTITLE`) y entradilla (`ARTICLE-INSIDEHEADING`) con un cuadro por linea.
- Deteccion del cuerpo de texto (`ARTICLE-TEXT`), ilustraciones (`ARTICLE-ILLUSTRATION`), pies de foto (`CAPTION`), tablas (`ARTICLE-TABLE`), firmas (`AUTHOR`), cabeceras (`HEADER-TITLE`, `HEADER-TEXT`), anuncios (`ADVERTISEMENT`), avisos (`ANNOUNCEMENT`) y titulos de seccion (`SECTION-TITLE`).
- Integracion en pipeline de segmentacion de articulos: los bloques detectados se ordenan y se inicia un articulo nuevo en cada racha de zonas de titulo.
- Ejecucion en CPU o GPU CUDA mediante la API estandar de Ultralytics, sin exportaciones exotucas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, capacidades de agente, modo thinking, audio ni multimodalidad. Es exclusivamente un detector de maquetacion.
- Cobertura limitada a prensa francesa e inglesa de los siglos XIX y XX; no hay evidencia de generalizacion a otros idiomas, alfabetos o epocas.

## Casos de uso

- Segmentacion automatica de articulos en hemerotecas digitales: el modelo detecta titulares y bloques y permite aplicar la regla de corte en orden de lectura, reduciendo el trabajo manual de delimitacion de piezas en colecciones de miles de paginas.
- Integracion en SquiddleOCR: este pipeline ya obtiene regiones y orden de lectura de eynollah y solo necesitaba una clase de titulo fiable; cuttlefisher cubre exactamente esa carencia sin reemplazar el resto de la cadena.
- Extraccion de metadatos de catalogacion: los cuadros de `ARTICLE-TITLE`, `AUTHOR` y `SECTION-TITLE` sirven para poblar registros bibliograficos de prensa historica de forma semiautomatica.
- Troceado previo a OCR a nivel de articulo: en lugar de ejecutar OCR sobre la pagina completa, se recortan las zonas detectadas y se procesan por separado, lo que facilita el alineado entre texto y estructura y reduce ruido en el reconocimiento.
- Investigacion en humanidades digitales: cuantificacion a escala de la presencia de ilustraciones, tablas, anuncios o avisos en un corpus historico, usando las clases detectadas como variables de analisis.
- Generacion de datos de entrenamiento para otros modelos de maquetacion: las detecciones de alta confianza sobre paginas no anotadas pueden usarse como pseudoetiquetas, sujetas a revision humana dado el nivel de precision por clase.
- Control de calidad de lotes de digitalizacion: la ausencia de detecciones plausibles o la presencia de cabeceras mal localizadas puede senalar paginas mal escaneadas, giradas o recortadas.
- Extraccion de material grafico: la clase `ARTICLE-ILLUSTRATION` (AP50 0,854) permite aislar imagenes y vincularlas a sus pies de foto (`CAPTION`) para reconstruir la relacion imagen-texto en el archivo.

## Benchmarks y rendimiento

Resultados sobre el split de test diverso de FINLAM (48 paginas, 11.035 cuadros), con `conf=0.001`, `max_det=600` y una sola GPU:

| clase | instancias | P | R | AP50 | AP50-95 |
|---|---|---|---|---|---|
| ARTICLE-TITLE | 1065 | 0,747 | 0,798 | 0,795 | 0,675 |
| ARTICLE-SUBTITLE | 350 | 0,620 | 0,726 | 0,658 | 0,517 |
| ARTICLE-INSIDEHEADING | 205 | 0,469 | 0,717 | 0,557 | 0,454 |
| SECTION-TITLE | 0 | – | – | – | – |
| HEADER-TITLE | 10 | 0,907 | 0,982 | 0,977 | 0,570 |
| HEADER-TEXT | 111 | 0,555 | 0,540 | 0,461 | 0,318 |
| ARTICLE-ILLUSTRATION | 148 | 0,784 | 0,859 | 0,854 | 0,709 |
| ADVERTISEMENT | 1 | 1,000 | 0,000 | 0,000 | 0,000 |
| ANNOUNCEMENT | 56 | 0,531 | 0,357 | 0,345 | 0,246 |
| ARTICLE-TEXT | 8504 | 0,814 | 0,776 | 0,811 | 0,654 |
| CAPTION | 70 | 0,760 | 0,635 | 0,664 | 0,460 |
| AUTHOR | 49 | 0,736 | 0,468 | 0,519 | 0,405 |
| ARTICLE-TABLE | 466 | 0,510 | 0,255 | 0,303 | 0,144 |
| all (12 clases) | 11035 | 0,703 | 0,593 | 0,579 | 0,429 |
| title classes (3) | – | – | – | 0,670 | – |

Metrica de corte de articulos, partiendo de zonas de referencia en orden de lectura de referencia y asignando a cada zona la clase de su mejor prediccion con IoU >= 0,5: F1 por pares de misma pieza de 0,584 con clases predichas frente a 0,633 con clases de referencia, es decir, el detector cuesta 0,05 de F1. El F1 de titulo a nivel de zona es 0,805 (P 0,85, R 0,76). El articulo de referencia reporta 72,3 mAP50 sobre *La Liberte* (un solo periodico, 8.000 paginas de entrenamiento); esas cifras no son comparables con las de la tabla, que corresponden a un test de 149 periodicos.

## Requisitos de hardware

- Entrenamiento documentado: 4 x RTX A6000, batch 32 (8 imagenes por GPU) a `imgsz=1280`, con el dataset completo cacheado en RAM; 24 minutos para 150 epocas. Con 623 paginas de unos 2000 px de alto, `cache=ram` es un requisito de memoria de sistema, no de VRAM.
- VRAM de inferencia: no publicada. No se ofrecen cifras de consumo para `best.pt` en la informacion disponible.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se hizo en RTX A6000; la inferencia funciona con cualquier GPU CUDA con soporte para torch 2.14 + cu126.
- Compatibilidad con GPU de consumo: el modelo se distribuye como `.pt` plano y corre en Ultralytics >= 8.4 con un torch CUDA o CPU, por lo que es ejecutable en GPU de consumo, pero no se publican cifras de VRAM que permitan confirmar modelos concretos.
- Formato de despliegue: descarga via `hf_hub_download("storytracer/cuttlefisher", "best.pt")` y `YOLO(...)` de Ultralytics. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector.
- Parametros de inferencia obligatorios en la practica: `imgsz=1280` (no reducir; los cuadros de titulo miden una linea, con mediana de 14 px de alto a 2000 px), `max_det=600` (el valor por defecto de Ultralytics, 300, limita el recall en paginas densas con hasta 500 bloques) y `conf=0.35` para equilibrar precision y recall de titulares (P 0,88 / R 0,77 en validacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada alternativas directamente comparables con benchmarks publicados sobre el mismo split. La model card menciona eynollah como componente del pipeline de SquiddleOCR, pero en un rol complementario (aporta regiones y orden de lectura) y no como sustituto del detector de titulos.

| Modelo | Tarea | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cuttlefisher (fase 1) | Deteccion de 13 clases de maquetacion en prensa historica | no disponible (`yolo26m`) | `imgsz=1280` | MIT | HuggingFace, `.pt` |
| cuttlefisher (fase 2, prevista) | Igual, con FINLAM + La Liberte | no disponible | no disponible | MIT (prevista) | no publicada |
| eynollah | Analisis de maquetacion historica (regiones y orden de lectura) | no disponible | no disponible | no disponible | repositorio publico |
| yolo26l (variante probada) | Deteccion de las mismas clases | no disponible | no disponible | MIT (Ultralytics YOLO26) | descartada: mejor mAP50-95 global, peor en titulares |
| yolo26s (variante probada) | Deteccion de las mismas clases | no disponible | no disponible | MIT (Ultralytics YOLO26) | descartada: 0,04 menos de mAP50 en titulares |

## Limitaciones y advertencias

- La fase 1 nunca predice `SECTION-TITLE`: la clase no tiene instancias en `Teklia/Newspapers-finlam` (solo aparece en *La Liberte*), por lo que su salida en esa clase es siempre vacia.
- `ADVERTISEMENT` es poco fiable: solo 35 instancias de entrenamiento y AP50 de 0,000 en el test (con una unica instancia anotada). No debe usarse para decisiones automaticas.
- Rendimiento bajo en clases estructurales: `ARTICLE-TABLE` (R 0,255, AP50-95 0,144), `ANNOUNCEMENT` (AP50 0,345) y `HEADER-TEXT` (AP50 0,461). Estas clases necesitan revision humana.
- El techo de la tarea es bajo por construccion: muchos articulos de FINLAM no tienen titular o tienen varios, de ahi que la regla de corte alcance 0,633 de F1 incluso con clases de referencia, y 0,584 con clases predichas.
- Riesgo de perder titulares con `conf=0.35`; si el coste de un titular omitido es mayor que el de un falso positivo, el autor recomienda bajar a 0,15-0,25.
- No reducir `imgsz` por debajo de 1280: los cuadros de titulo son de una linea y muy pequenos (mediana de 14 px de alto a 2000 px). A `imgsz=1024` el rendimiento global empeora.
- El valor por defecto de `max_det=300` recorta el recall en paginas densas; hay que fijarlo en 600 o mas.
- El parametro `iou` no sirve para ajustar nada: YOLO26 es end-to-end y no aplica NMS.
- Dominio restringido a prensa francesa e inglesa de los siglos XIX y XX, con imagenes de unos 2000 px de alto. No hay evidencia de generalizacion a otros idiomas, alfabetos, epocas o calidades de escaneo.
- La comparacion con el 72,3 mAP50 del articulo sobre *La Liberte* no es valida: alli se evalua un unico periodico con 8.000 paginas de entrenamiento, frente a un test de 149 periodicos en esta ficha.
- Licencia MIT para el modelo y para ambos corpus (proyecto FINLAM de Teklia / LITIS), sin restricciones documentadas para uso comercial. No se han documentado sesgos especificos del detector; el material de origen son periodicos historicos, con los sesgos editoriales propios de la epoca.
- El repositorio presenta 0 descargas y 0 likes, y el tamano reportado (0,0 GB) no refleja el contenido real, lo que indica ausencia de validacion externa de la comunidad.
- La fase 2 con *La Liberte* esta anunciada pero no publicada; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/storytracer/cuttlefisher
- Repositorio con codigo, notas y metricas completas: https://github.com/storytracer/cuttlefisher
- SquiddleOCR: https://github.com/storytracer/squiddleocr
- Dataset Teklia/Newspapers-finlam: https://huggingface.co/datasets/Teklia/Newspapers-finlam
- Dataset Teklia/Newspapers-finlam-La-Liberte: https://huggingface.co/datasets/Teklia/Newspapers-finlam-La-Liberte
- Modelo base Ultralytics/YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Referencia arXiv indicada en las etiquetas: https://arxiv.org/abs/2607.15082
- Cita del articulo (truncada en la model card): Mocaër et al., "Towards Hierarchical Structur...", ICDAR-HIP 2026, clave BibTeX `mocaer2026hierarchical`.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los unicos enlaces obtenidos correspondian a un catalogo de calzado infantil sin relacion con el proyecto.
