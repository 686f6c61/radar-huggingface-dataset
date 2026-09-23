# wyzhaoc/FlowFigTabMiner-models

## Resumen

FlowFigTabMiner-models es un repositorio de pesos en Hugging Face publicado por el usuario `wyzhaoc` que no contiene un modelo de lenguaje, sino el conjunto de checkpoints que alimenta la pipeline **FlowFigTabMiner**, una herramienta de extraccion de informacion quimica. El objetivo declarado es convertir PDFs de quimica en flujo (flow chemistry) en registros estructurados de reacciones, resolviendo el problema de pasar de literatura cientifica en formato no estructurado a datos legibles por maquina. El repositorio se distribuye como dependencia de una imagen Docker: al primer arranque, el contenedor descarga estos pesos en `/app/models`.

El contenido es heterogeneo y combina varios tipos de modelo: cinco detectores/segmentadores basados en YOLO11 de Ultralytics (cuatro variantes `m` y una `s`) para limpieza de figuras, deteccion de graficos de dispersion y mapas de calor, segmentacion de tablas, filtrado de tablas y localizacion de cajas de moleculas; un segmentador de esquemas de reaccion (`tab-scheme-seg`) que distingue flechas, moleculas, condiciones y marcas; un lector de estructuras moleculares MolNexTR (Chen et al., 2024); y los modelos de inferencia de PaddleOCR 3.x (deteccion PP-OCRv5, reconocimiento PP-OCRv4, orientacion y UVDoc).

El repositorio tiene 1,6 GB, licencia MIT declarada, 0 descargas y 0 likes en el momento de la consulta, y no incluye model card tecnica mas alla de la tabla de rutas y roles. No se publican parametros, datos de entrenamiento, resultados de benchmarks ni idiomas soportados, por lo que su evaluacion directa queda limitada a la inspeccion de los propios checkpoints y a la documentacion del proyecto en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un unico modelo. Conjunto heterogeneo: (a) detectores/segmentadores YOLO11 de Ultralytics (CNN, familia YOLO11, variantes `m` y `s`); (b) segmentador de esquemas de reaccion `tab-scheme-seg`; (c) MolNexTR (Chen et al., 2024), lector de estructuras moleculares; (d) modelos de inferencia PaddleOCR 3.x (PP-OCRv5 deteccion, PP-OCRv4 reconocimiento, orientacion de texto, UVDoc) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: los componentes trabajan sobre imagenes y regiones de pagina, no sobre ventanas de contexto textual |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en precision original; no se declaran variantes cuantizadas) |
| Idiomas soportados | no disponible en el repositorio; depende de los modelos de reconocimiento PaddleOCR incluidos y de la configuracion de la pipeline |
| Licencia | MIT (declarada en la model card y en los metadatos del repositorio) |
| Formato de pesos | PyTorch `.pt` (checkpoints YOLO11 y `tab-scheme-seg`), PyTorch `.pth` (MolNexTR) y modelos de inferencia PaddlePaddle (PaddleOCR) |
| Tamano del repositorio | 1,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-22 |
| Pipeline declarada en Hugging Face | no disponible |

Desglose de checkpoints incluidos en el repositorio:

| Ruta | Rol | Arquitectura base |
|---|---|---|
| `yolo11m-fig-seg-0207-nobreaknocharttext/…/best.pt` | Limpieza macro de figuras | YOLO11m |
| `yolo11m-fig-scatter-0208/…/best.pt` | Deteccion micro de dispersion y mapas de calor | YOLO11m |
| `yolo11m-tab-seg-0209-white/…/best.pt` | Segmentacion de tablas | YOLO11m |
| `yolo11m-table-seg-0208/…/best.pt` | Filtrado de tablas | YOLO11m |
| `yolo11s-tab-molecule-0207/…/best.pt` | Cajas de moleculas dentro de tablas | YOLO11s |
| `tab-scheme-seg/best.pt` | Partes del esquema de reaccion: flecha / molecula / condicion / marca | no disponible |
| `molnextr_model_best.pth` | Lectura de estructuras moleculares (MolNexTR) | MolNexTR (Chen et al., 2024) |
| `paddlex/official_models/*` | Inferencia OCR: PP-OCRv5 det, PP-OCRv4 rec, orientacion, UVDoc | PaddleOCR 3.x |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de forma monolotica, sino una cadena de modelos especializados que se ejecutan secuencialmente sobre las paginas de un PDF. La mayor parte del peso corresponde a la familia YOLO11 de Ultralytics, una arquitectura convolucional de deteccion y segmentacion en una sola pasada. Las tareas cubiertas son: limpieza macro de figuras, deteccion de graficos de dispersion y mapas de calor (micro), segmentacion de tablas, filtrado de tablas y localizacion de cajas de moleculas dentro de tablas. Cuatro de los cinco checkpoints usan la variante `m` y uno la variante `s`.

El resto de la cadena lo componen un segmentador especifico de esquemas de reaccion que distingue cuatro clases de elemento (flecha, molecula, condicion y marca), el lector de estructuras moleculares MolNexTR (Chen et al., 2024), y los modelos de inferencia de PaddleOCR 3.x para deteccion de texto (PP-OCRv5), reconocimiento (PP-OCRv4), clasificacion de orientacion y rectificacion de documentos (UVDoc). Ademas, la pipeline descarga por su cuenta modelos publicos que no se replican en este repositorio: `yifeihu/TF-ID-base`, `microsoft/table-transformer-structure-recognition-v1.1-all` y modelos de la organizacion `docling-project`.

No se declara informacion sobre datos de entrenamiento: ni numero de tokens o imagenes, ni composicion del dataset, ni procesos de ajuste como RLHF o DPO. Los sufijos numericos de los directorios (`0207`, `0208`, `0209`) sugieren versionado por fecha, pero el autor no documenta el procedimiento. Tampoco se describen innovaciones tecnicas propias (por ejemplo, decodificacion especulativa o atencion lineal), ya que no se trata de un modelo generativo de lenguaje.

## Capacidades

- Deteccion y segmentacion de figuras en documentos cientificos: separa figuras macroscopicas de otros elementos de pagina y limpia ruido asociado.
- Deteccion especifica de graficos de dispersion y mapas de calor, orientada a figuras con datos numericos densos.
- Segmentacion de tablas y filtrado posterior para descartar falsos positivos antes de la extraccion.
- Localizacion de cajas de moleculas dentro de tablas, con una variante ligera (`yolo11s`) para esta tarea.
- Segmentacion de esquemas de reaccion en cuatro clases: flecha, molecula, condicion y marca.
- Reconocimiento optico de estructuras quimicas (OCSR) mediante MolNexTR, que convierte la imagen de una molecula en una representacion estructural.
- OCR general con PaddleOCR 3.x: deteccion de texto, reconocimiento, estimacion de orientacion y rectificacion de imagen de documento (UVDoc).
- Extraccion de registros estructurados de reacciones de quimica de flujo a partir de PDF, como salida final de la pipeline completa.
- No dispone de generacion de texto libre, razonamiento, codigo, matematicas, vision general, tool calling, function calling, modo de razonamiento ni capacidades de agente: no es un modelo de lenguaje ni un modelo multimodal generativo.

## Casos de uso

- Construccion de bases de datos de reacciones de quimica de flujo: la pipeline procesa PDFs de articulos y patentes y produce registros estructurados (reactivos, condiciones, productos), lo que permite poblar bases de datos internas sin transcripcion manual.
- Mineria de literatura cientifica a escala: al automatizar deteccion de tablas, figuras y esquemas, se pueden procesar corpus completos de revistas de quimica organica y de sintesis en flujo para estudios bibliometricos o de tendencias.
- Extraccion de condiciones de reaccion desde tablas de articulos: el par de modelos `yolo11m-tab-seg-0209-white` y `yolo11m-table-seg-0208` segmenta y filtra tablas, y el OCR posterior recupera valores de temperatura, disolvente, catalizador y rendimiento.
- Digitalizacion de esquemas de reaccion: el modelo `tab-scheme-seg` identifica flechas, moleculas, condiciones y marcas, lo que permite reconstruir el esquema como una relacion reactivo-condiciones-producto en lugar de como una imagen.
- Reconocimiento de estructuras moleculares dibujadas (OCSR): MolNexTR convierte el recorte de una molecula en una estructura interpretable, util para enlazar con bases de datos quimicas y para verificacion de compuestos.
- Preparacion de datasets para modelos de quimica: los registros extraidos pueden alimentar modelos de prediccion de rendimiento, retrosintesis o planificacion de rutas, reduciendo el trabajo de anotacion manual.
- Integracion en flujos de laboratorio electronico (ELN) o LIMS: los registros estructurados se pueden insertar directamente en sistemas internos mediante la pipeline, evitando la reintroduccion de datos.
- Auditoria y verificacion documental en industria farmaceutica: la extraccion sistematica de condiciones y estructuras permite trazabilidad entre publicacion y dato registrado, con revision humana sobre las salidas dudosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas (mAP, precision/recall de segmentacion, exact match en OCSR, tasa de reconocimiento de texto), ni conjuntos de evaluacion, ni comparaciones con otros sistemas. La busqueda web realizada no devolvio ningun enlace relevante al modelo: los resultados eran paginas genericas del motor de busqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no declarada por el autor. Como referencia orientativa, no verificada en este repositorio, la cadena completa (varios detectores YOLO11m/YOLO11s mas MolNexTR y PaddleOCR) operando a resolucion de pagina en precision FP16 se situa habitualmente en el rango de 2 a 6 GB de VRAM con lote 1. Estas cifras son una estimacion y deben validarse experimentalmente.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tipo de carga (vision por computador sobre imagenes de documento) son adecuadas GPU con al menos 8 GB de VRAM; modelos de la clase RTX 3060/4060 o superiores, RTX 4090, A100 y H100 son opciones razonables, pero el autor no publica perfiles de despliegue ni requisitos certificados.
- Cabe en GPU de consumo: previsiblemente si, dado que el conjunto de pesos total es de 1,6 GB y la mayoria son detectores YOLO11 de tamano medio y pequeno. No hay confirmacion oficial ni tabla de compatibilidad.
- Opciones de despliegue: la via principal documentada es la imagen Docker del proyecto FlowFigTabMiner, que descarga el repositorio en `/app/models` en el primer arranque. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje; el despliegue pasa por PyTorch/Ultralytics para los detectores, por el runtime de MolNexTR y por PaddleX/PaddleOCR para los modelos OCR.
- Latencia y throughput estimados: no disponibles. No se publican tiempos por pagina, ni tamano de lote soportado, ni requisitos minimos de CPU o RAM del contenedor.

## Comparativa con modelos similares

No existe una comparativa publicada por el autor. La tabla siguiente contrasta el enfoque de FlowFigTabMiner-models con otras soluciones de extraccion documental y de reconocimiento quimico, indicando unicamente lo que puede sostenerse a partir de la informacion disponible; el resto se marca como no disponible.

| Solucion | Enfoque | Cobertura quimica | Licencia declarada | Datos de rendimiento |
|---|---|---|---|---|
| FlowFigTabMiner-models | Cadena de detectores YOLO11 + segmentador de esquemas + MolNexTR + PaddleOCR, orquestada por una pipeline propia | Especifica para quimica de flujo: esquemas de reaccion, moleculas en tablas, condiciones | MIT en este repositorio (los componentes derivados pueden tener otras condiciones; ver advertencias) | no disponible |
| Docling (`docling-project`) | Conversion de documentos y extraccion de estructura | Generica, no especifica de quimica | Referenciada por la pipeline; condiciones no verificadas en esta busqueda | no disponible |
| Table Transformer (`microsoft/table-transformer-structure-recognition-v1.1-all`) | Reconocimiento de estructura de tablas en documentos | Generica | Referenciada por la pipeline; condiciones no verificadas en esta busqueda | no disponible |
| MolNexTR (Chen et al., 2024) | Lector de estructuras moleculares (OCSR) | Especifica de quimica | no disponible en la informacion proporcionada | no disponible |
| PaddleOCR 3.x (PP-OCRv5, PP-OCRv4) | Deteccion, reconocimiento y rectificacion de texto | Generica | no disponible en la informacion proporcionada | no disponible |

En la categoria de pipelines completas de extraccion de literatura quimica, la comparacion cuantitativa con alternativas publicadas no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval, GSM8K ni metricas equivalentes, ni usarse para generacion de texto, razonamiento o agentes.
- Ausencia total de documentacion tecnica: no hay informacion sobre datos de entrenamiento, hiperparametros, metricas, tamanos de entrada soportados, umbrales de confianza ni protocolo de evaluacion. Cualquier despliegue en produccion exige una validacion propia.
- Riesgo de fallo silencioso en la cadena: al encadenar varios detectores y un OCSR, un error en una etapa temprana (por ejemplo, una tabla mal segmentada) se propaga a la salida estructurada sin senal explicita de incertidumbre.
- Riesgo de alucinacion en el reconocimiento de estructuras moleculares: los modelos de OCSR pueden producir una estructura quimicamente valida pero incorrecta, especialmente con dibujos degradados, estereoquimica mal resuelta o moleculas poco frecuentes. Se recomienda verificacion por quimico.
- Cobertura limitada por dominio: los pesos estan orientados a quimica de flujo, esquemas de reaccion y tablas de articulos y patentes. No hay evidencia de comportamiento en otros dominios cientificos ni en documentos manuscritos o de baja calidad.
- Idiomas soportados sin declarar: la capacidad multilingue depende de los modelos PaddleOCR incluidos y de su configuracion; el repositorio no indica que idiomas se han validado.
- Restricciones de licencia potenciales: el repositorio declara MIT, pero varios checkpoints son pesos derivados de YOLO11 de Ultralytics y de componentes de terceros (MolNexTR, PaddleOCR). Es necesario verificar las condiciones de cada modelo base antes de un uso comercial, ya que la licencia MIT del repositorio podria no cubrir todos los componentes derivados.
- Divergencia de autoria: el propietario del repositorio en Hugging Face (`wyzhaoc`) no coincide con el propietario del repositorio de codigo enlazado en la model card (`wzjeh`). Conviene confirmar la cadena de custodia antes de depender del artefacto.
- Fechas anomales: las marcas de creacion y actualizacion (2026-09-22) son posteriores a la fecha habitual de consulta y no se acompanan de historial de versiones.
- Sin comunidad ni validacion externa: 0 descargas y 0 likes implican que no existen informes independientes de funcionamiento, comparativas ni issues publicos en el momento de la consulta.
- Despliegue acoplado al contenedor: la via documentada asume Docker y la descarga automatica de pesos en `/app/models`, lo que puede complicar entornos con red restringida o sin acceso a Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wyzhaoc/FlowFigTabMiner-models
- Repositorio de codigo de la pipeline: https://github.com/wzjeh/FlowFigTabMiner
- MolNexTR (Chen et al., 2024): referencia citada en la model card; URL no disponible en la informacion proporcionada
- Modelos publicos referenciados por la pipeline y no replicados en el repositorio (identificadores de Hugging Face): `yifeihu/TF-ID-base`, `microsoft/table-transformer-structure-recognition-v1.1-all`, organizacion `docling-project`
- Resultados de busqueda web: no se encontro ningun enlace relevante al modelo. Las consultas devolvieron unicamente paginas genericas del motor de busqueda (Bing) sin relacion con FlowFigTabMiner.
