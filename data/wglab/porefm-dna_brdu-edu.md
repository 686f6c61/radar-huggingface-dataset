# WGLab/PoreFM-DNA_BrdU-EdU

## Resumen

PoreFM-DNA BrdU / EdU es un clasificador supervisado publicado por WGLab que se apoya en el modelo base PoreFM-DNA para detectar modificaciones de ADN en lecturas de secuenciacion Oxford Nanopore. El modelo no procesa texto ni imagenes: su entrada es la senal de nanoporos y su salida es una clasificacion en tres clases ordenadas como `T`, `BrdU` y `EdU`, es decir, timidina sin modificar y las dos modificaciones sinteticas analogas de timidina usadas habitualmente en experimentos de marcaje de replicacion (bromodesoxiuridina y etinildesoxiuridina).

La ficha del autor es deliberadamente minimalista: version 0.1.0, quimica R10.4.1 (E8.2, 400 bps) y dimension de embedding 384. El repositorio incluye un unico artefacto de pesos (`model.pt`) con el backbone y la cabeza de clasificacion, junto con los valores por defecto de preprocesado y de etiquetas de modificacion en formato BAM (`472552` para BrdU y `232486` para EdU), ademas de `manifest.json` y `SHA256SUMS` para verificacion de integridad.

Su relevancia es acotada pero concreta: cubre un caso de uso de nicho, la anotacion de marcaje BrdU/EdU en datos de Nanopore con quimica R10.4.1, donde la mayoria de herramientas disponibles se centran en 5mC y 6mA. Ahora bien, el repositorio no incluye licencia, idiomas, pipeline ni resultados de validacion, y acumula cero descargas y cero likes, por lo que debe tratarse como un artefacto de investigacion sin validacion externa documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; clasificador supervisado sobre el backbone PoreFM-DNA, con dimension de embedding 384 |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la quimica declarada es R10.4.1 (E8.2, 400 bps) |
| Tipos de cuantizacion | No disponible; se distribuye un unico checkpoint PyTorch sin variantes cuantizadas |
| Idiomas soportados | No disponible (modelo sobre senal de ADN, no sobre texto) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`model.pt`), con preprocesado y etiquetas por defecto embebidos en el checkpoint |
| Version del modelo | 0.1.0 |
| Clases de salida | `T`, `BrdU`, `EdU` (en ese orden) |
| Codigos de modificacion BAM por defecto | `472552` (BrdU), `232486` (EdU); base `T` |
| Quimica soportada | R10.4.1 (E8.2, 400 bps) |
| Tamano del repositorio | 0.1 GB |
| Artefactos auxiliares | `manifest.json` (identidades y huellas de tensores), `SHA256SUMS` (verificacion de descarga) |

## Arquitectura y entrenamiento

El modelo es un clasificador supervisado construido sobre el backbone de PoreFM-DNA, con una cabeza de clasificacion que reparte la prediccion entre las tres clases `T`, `BrdU` y `EdU`. La unica cifra estructural publicada es la dimension de embedding (384), coherente con un modelo compacto y con el tamano total del repositorio (0.1 GB). El checkpoint `model.pt` empaqueta conjuntamente el backbone, la cabeza de clasificacion, la configuracion de preprocesado y los valores por defecto de etiquetado de modificaciones, de modo que el pipeline de inferencia queda definido por el propio artefacto y no por un fichero de configuracion externo.

No se han publicado en la informacion disponible ni el numero de tokens o lecturas de entrenamiento, ni la composicion del dataset, ni si hubo etapas de ajuste fino supervisado con validacion cruzada, ni detalles sobre la arquitectura interna del backbone PoreFM-DNA (tipo de bloque, numero de capas, atencion, etc.). El autor declara la quimica R10.4.1 (E8.2, 400 bps), lo que fija el regimen de senal para el que el preprocesado embebido esta calibrado. La trazabilidad se resuelve mediante `manifest.json`, que registra huellas de tensores independientes de los metadatos descriptivos, y `SHA256SUMS`, que identifica los bytes exactos de cada artefacto; los cambios exclusivamente documentales no incrementan la version del modelo.

## Capacidades

- Clasificacion de senal de Nanopore en tres clases: `T` (timidina sin modificar), `BrdU` y `EdU`.
- Deteccion de modificaciones sinteticas de timidina en experimentos de marcaje de replicacion, limitada a la quimica R10.4.1 (E8.2, 400 bps).
- Aplicacion de los codigos de modificacion BAM por defecto (`472552` para BrdU, `232486` para EdU) para integrarse en flujos que consumen etiquetas MM/ML.
- Preprocesado de senal incluido en el propio checkpoint, lo que reduce el riesgo de desalineamiento entre el modelo y el pipeline de entrada.
- Verificacion de integridad de los artefactos mediante `manifest.json` y `SHA256SUMS`.
- No dispone de soporte documentado de tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un modelo de senal biometrica, no un modelo de lenguaje.
- No se documentan modos especiales (thinking mode, decodificacion especulativa, atencion lineal ni similares).

## Casos de uso

- Deteccion de marcaje BrdU/EdU en estudios de replicacion del ADN: el modelo clasifica la senal de Nanopore para distinguir timidina nativa de timidina marcada, lo que permite estimar la incorporacion del analogo sin depender de anticuerpos ni de secuenciacion adicional.
- Anotacion de ficheros BAM existentes: al fijar etiquetas de modificacion con codigos concretos, la salida puede integrarse en visores y herramientas de ontologia que ya interpretan etiquetas MM/ML, facilitando el analisis posterior con el resto del ecosistema.
- Control de calidad de experimentos de marcaje: comparar la proporcion de lecturas clasificadas como BrdU o EdU frente a `T` sirve como indicador de eficiencia de marcaje y de posibles fallos de laboratorio antes de profundizar en el analisis biologico.
- Filtrado y enriquecimiento de lecturas: las lecturas con alta confianza en una clase modificada pueden separarse para analisis especificos (por ejemplo, reconstruccion de fragmentos replicados) mientras el resto se procesa por vias convencionales.
- Integracion en pipelines bioinformaticos reproducibles (Snakemake, Nextflow, WDL): al ser un unico `model.pt` con preprocesado embebido y verificacion por hash, el paso de clasificacion se puede versionar y auditar de forma estricta en entornos de produccion cientifica.
- Analisis comparativo de dinamica de replicacion: procesar lotes de muestras con el mismo checkpoint y los mismos parametros por defecto permite comparar tasas de marcaje entre condiciones experimentales, siempre que la quimica sea R10.4.1.
- Docencia y prototipado en bioinformatica: el tamano reducido del repositorio y la simplicidad del artefacto lo hacen util como ejemplo reproducible de ajuste de un modelo de senal sobre un backbone tipo PoreFM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de exactitud, precision, recall, F1 ni curvas ROC/PR para las clases `T`, `BrdU` y `EdU`, ni comparaciones con otras herramientas de deteccion de modificaciones. Tampoco se documentan tamanos de conjunto de validacion, separacion de cromosomas o genomas de entrenamiento/test, ni umbrales de decision recomendados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0.1 GB y la dimension de embedding es 384, por lo que el checkpoint es compatible con GPU de gama baja y con ejecucion en CPU (estimacion a partir del tamano del artefacto, no confirmada por el autor).
- GPU recomendadas: no disponibles. Por tamano del artefacto, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) deberia alojar el modelo sin problemas; no hay datos oficiales de compatibilidad.
- Cabe en GPU consumer: si, segun el tamano del artefacto (0.1 GB); no hay confirmacion oficial ni lista de GPU validadas.
- Opciones de despliegue: inferencia directa con PyTorch cargando `model.pt`; el autor remite al repositorio de codigo de PoreFM para el setup y el uso. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de senal de este tipo. La exportacion a TorchScript u ONNX es una posibilidad tecnica, no una funcionalidad documentada.
- Latencia y throughput: no disponibles. Dependen del basecaller y del pipeline de extraccion de senal empleados, que el autor no especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque de modificacion | Quimica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PoreFM-DNA BrdU/EdU (este modelo) | Clasificador supervisado sobre backbone PoreFM-DNA | BrdU y EdU | R10.4.1 (E8.2, 400 bps) | No disponible | HuggingFace, 0 descargas |
| PoreFM-DNA | Modelo base (backbone) | No es un clasificador de modificaciones por si mismo | No disponible en la informacion proporcionada | No disponible | HuggingFace (WGLab) |
| Dorado (Oxford Nanopore) | Basecaller con soporte de bases modificadas | 5mC, 6mA y otras modificaciones segun modelo | Multiples quimicas | No disponible en la informacion proporcionada | Distribucion de Oxford Nanopore |
| modkit (Oxford Nanopore) | Herramienta de procesado de etiquetas MM/ML | No detecta por si misma; manipula y resume etiquetas | No aplica | No disponible en la informacion proporcionada | Distribucion de Oxford Nanopore |

No se dispone de datos de rendimiento de ninguna de las alternativas dentro de la informacion proporcionada, por lo que la comparacion se limita a proposito funcional y ambito de modificaciones. La diferencia principal de este modelo es que cubre BrdU y EdU, modificaciones poco habituales en las herramientas estandar, a costa de estar restringido a una unica quimica.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueo critico para cualquier adopcion en produccion o en un producto.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso externo, replicacion independiente ni validacion por terceros.
- Ausencia total de metricas: sin exactitud, precision, recall ni tasas de falsos positivos publicadas, no es posible fijar umbrales de decision con criterio.
- Restriccion de quimica: el modelo declara R10.4.1 (E8.2, 400 bps). Su comportamiento fuera de esa configuracion (otras versiones de poro, otras velocidades de translocacion) es desconocido y probablemente degradado.
- Ambito de clases muy estrecho: solo distingue `T`, `BrdU` y `EdU`. Cualquier otra modificacion (5mC, 6mA, oxidaciones) queda fuera del espacio de etiquetas y puede inducir clasificaciones erroneas si esta presente en la muestra.
- Riesgo de falsos positivos en regiones con senal atipica o baja cobertura: no se documenta calibracion ni intervalos de confianza.
- Dependencia del preprocesado embebido: alterar la normalizacion o el recorte de senal sin respetar los valores por defecto del checkpoint puede invalidar las predicciones.
- Artefacto unico sin variantes: no hay versiones cuantizadas ni formatos alternativos, lo que limita el despliegue en entornos con requisitos especificos (por ejemplo, inferencia en FPGA o en movil).
- Mantenimiento incierto: la version 0.1.0 y la fecha de creacion del repositorio no permiten inferir un plan de soporte; conviene fijar el hash del checkpoint en cualquier pipeline reproducible.
- No apto para uso clinico o diagnostico sin validacion adicional: no hay documentacion de validacion regulatoria ni de rendimiento en muestras reales de pacientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WGLab/PoreFM-DNA_BrdU-EdU
- Modelo base PoreFM-DNA: https://huggingface.co/WGLab/PoreFM-DNA
- Repositorio de codigo de PoreFM (setup y uso): no disponible en la informacion proporcionada; la model card remite a el sin incluir la URL
- Paper tecnico de PoreFM: no disponible en la informacion proporcionada
- Demo o Space asociado: no disponible
- Perfil del autor en HuggingFace: https://huggingface.co/WGLab
