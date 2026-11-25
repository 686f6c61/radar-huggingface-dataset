# suryatmodulus/OCRia-nano-1

## Resumen

OCRia-nano-1 es un pipeline de modelos ligeros para el parseo de documentos en CPU, desarrollado por LlamaIndex. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de modelos ONNX especializados (detector de lineas, enrutador de escrituras, reconocedores OCR y LayoutNet) que se ejecutan dentro de LiteParse, el parser de documentos local y de codigo abierto de LlamaIndex. El pipeline completo suma aproximadamente 8,1 millones de parametros y esta destilado a partir de OCRia-1, el VLM de documentos de 4B de LlamaIndex, conservando una fraccion de 1/500 de sus parametros.

El objetivo del modelo es convertir documentos escaneados y PDF nativos en Markdown o JSON estructurado, incluyendo tablas con celdas combinadas, bloques de maquetacion (titulares, listas, pies de pagina) y cajas delimitadoras con confianza OCR por linea. Su propuesta de valor es la relacion precision/coste: alcanza 59,2 en ParseBench-2, por delante de Indra (55,1) y Marker (52,5), y procesa 27,8 paginas por segundo en 16 vCPU, el doble de rapido que LiteParse con Tesseract.

Es relevante ahora porque demuestra que un pipeline OCR destilado y cuantizado a int8 puede superar a alternativas de mayor tamano en tareas de parseo documental, ejecutandose integramente en CPU y en WebAssembly, sin GPU ni servicios en la nube. La licencia es propia (`ocria-nano-1-license`), no estandar, por lo que su uso comercial requiere revisar los terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-modelo ONNX: detector de lineas (depthwise-separable), enrutador de escrituras, tres reconocedores CTC y LayoutNet (tablas y maquetacion) |
| Parametros totales | Aproximadamente 8,1M en el pipeline completo (detector 0,08M; enrutador 0,04M; reconocedor latin 0,80M; reconocedor world-script 0,98M; reconocedor RTL y LayoutNet: no disponible el desglose) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa por lineas y paginas, no por ventana de tokens) |
| Tipos de cuantizacion | Reconocedor latin en int8; resto de componentes: no disponible |
| Idiomas soportados | Multilingue: latin, CJK, RTL (arabe y hebreo) y un modelo world-script para unas 17 escrituras adicionales |
| Licencia | `ocria-nano-1-license` (licencia propia, no estandar) |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

OCRia-nano-1 no es un transformer generativo, sino una cadena de modelos convolucionales y CTC disenados para inferencia en CPU. El detector de lineas (`det.onnx`, 0,08M) genera un mapa de segmentacion de lineas de texto con convoluciones depthwise-separable. El enrutador (`router.onnx`, 0,04M) decide, por cada recorte de linea, que reconocedor debe usarlo y detecta lineas invertidas. Los tres reconocedores CTC son `rec_latin.onnx` (0,80M, int8, 791 caracteres), `rec_world.onnx` (0,98M, unas 17 escrituras) y `rec_rtl.onnx` (arabe y hebreo). LayoutNet, un modelo conjunto de tablas y maquetacion, completa el pipeline clasificando bloques (titulares, listas, pies de pagina) y detectando filas, columnas y celdas de cabecera con `colspan`/`rowspan`.

El entrenamiento se basa en destilacion desde OCRia-1, el VLM de documentos de 4B de LlamaIndex, segun indica la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un pipeline OCR de este tipo). La innovacion tecnica principal es el enrutado por linea entre reconocedores especializados por escritura, que permite cubrir un repertorio multilingue amplio con modelos de menos de 1M de parametros cada uno, y la integracion del OCR con la capa de texto del PDF para combinar ambas fuentes antes de ejecutar LayoutNet.

## Capacidades

- OCR de documentos escaneados y PDF nativos, con renderizado de pagina a 250 DPI por defecto (configurable con `--dpi`).
- Deteccion de lineas de texto y enrutado automatico por escritura (latin, CJK, RTL y world-script).
- Extraccion de tablas a Markdown, o a HTML con `colspan`/`rowspan` cuando hay celdas combinadas.
- Clasificacion de maquetacion: titulares, listas, parrafos, figuras, cabeceras y pies de pagina.
- Eliminacion de cabeceras y pies de pagina en la salida Markdown por defecto (se conservan con `--keep-headers-footers`).
- Salida en Markdown, texto plano o JSON con cajas delimitadoras y confianza OCR por palabra y linea.
- Extraccion de bloques de maquetacion en JSON con `--extract-blocks`, enlazando cada bloque con sus elementos de texto.
- Deteccion de lineas invertidas (upside-down) mediante el enrutador.
- Soporte de entrada de PDFs, imagenes y documentos Office a traves de la conversion de LiteParse.
- Ejecucion en CLI, Python y Node.js en Linux, macOS y Windows, y en navegador y edge runtimes via WebAssembly.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un componente de parseo, no un modelo conversacional.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el pipeline procesa 27,8 paginas por segundo en 16 vCPU y 426 ms por pagina en un solo nucleo, lo que permite convertir lotes de miles de PDFs en Markdown estructurado sin GPU ni coste de API.
- Extraccion de tablas financieras o tecnicas: LayoutNet detecta filas, columnas y celdas de cabecera combinadas, y la salida puede forzarse a HTML con `colspan`/`rowspan` para preservar la estructura original en bases de datos o hojas de calculo.
- Ingesta de documentos para RAG: la salida Markdown con titulares y listas clasificados por LayoutNet mejora la segmentacion en chunks frente a OCR plano, y el JSON con cajas delimitadoras permite trazabilidad hacia la pagina original.
- Procesamiento en el navegador o en el edge: mediante `@llamaindex/liteparse-wasm` se puede parsear un PDF en el cliente sin enviar el documento a un servidor, util para documentos sensibles o aplicaciones offline; con `{ scripts: ["latin"], layout: false }` el conjunto de modelos baja a 1,5 MB.
- Pipeline de CI/CD para documentacion: integrado en Node.js o Python, permite validar que los PDFs generados por un sistema se reparsean correctamente y que las tablas y titulares se conservan, como test de regresion documental.
- Atencion al cliente con base documental: extraer manuales y politicas en Markdown estructurado para alimentar un indice de busqueda o un sistema RAG, con deteccion automatica de idioma y soporte de escrituras latinas, CJK, arabe y hebreo en el mismo lote.
- Archivado y cumplimiento normativo: generar JSON con confianza OCR por linea y cajas delimitadoras para auditar que cada fragmento de texto proviene de la pagina y posicion correctas.

## Benchmarks y rendimiento

| Benchmark / metrica | OCRia-nano-1 | Indra | Marker | LiteParse + Tesseract |
|---|---|---|---|---|
| ParseBench-2 (precision) | 59,2 | 55,1 | 52,5 | 48,7 |
| Paginas por segundo (16 vCPU) | 27,8 | no disponible | no disponible | no disponible |
| Latencia por pagina (1 nucleo) | 426 ms | no disponible | no disponible | no disponible |

Los datos de ParseBench-2, velocidad y latencia provienen de la model card. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM: no requiere GPU; el pipeline esta disenado para CPU.
- Memoria y disco: la descarga de modelos mas ONNX Runtime ocupa entre 60 y 75 MB; el conjunto minimo en WASM con solo latin y sin layout baja a 1,5 MB.
- CPU: 27,8 paginas por segundo en 16 vCPU; 426 ms por pagina en un solo nucleo.
- GPU recomendadas: no aplica; no se documenta soporte de aceleracion por GPU.
- Cabe en cualquier equipo consumer: portatil, servidor sin GPU, navegador y dispositivos edge.
- Opciones de despliegue: CLI (`lit parse`), Python (`pip install liteparse`), Node.js (`npm i -g @llamaindex/liteparse`), Rust (`cargo install liteparse`) y WebAssembly (`@llamaindex/liteparse-wasm`).
- Verificacion de integridad: `lit models pull` descarga los modelos y ONNX Runtime y comprueba cada archivo contra su sha256 fijado.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | ParseBench-2 | Ejecucion | Licencia |
|---|---|---|---|---|---|
| OCRia-nano-1 | ~8,1M | Pipeline OCR + layout ONNX | 59,2 | CPU, WASM | `ocria-nano-1-license` (propia) |
| OCRia-1 | 4B | VLM de documentos | no disponible | GPU (VLM) | no disponible |
| Indra | no disponible | Parser de CPU | 55,1 | CPU | no disponible |
| Marker | no disponible | Parser de documentos | 52,5 | CPU/GPU | no disponible |
| LiteParse + Tesseract | no disponible (Tesseract) | OCR clasico | 48,7 | CPU | no disponible |

OCRia-nano-1 se posiciona como el parser de CPU con mayor precision en ParseBench-2 segun los datos del autor, superando a Indra y Marker, y duplica la velocidad de LiteParse con Tesseract. Frente a OCRia-1, sacrifica 1/500 de los parametros a cambio de ejecucion local en CPU y WASM.

## Limitaciones y advertencias

- No es un modelo autonomo: los archivos son los que ejecuta LiteParse y no incluyen script de inferencia propio; deben usarse a traves de LiteParse.
- La licencia `ocria-nano-1-license` es propia y no estandar; es imprescindible revisar `LICENSE` antes de cualquier uso comercial o redistribucion.
- La model card no documenta sesgos conocidos ni tasas de alucinacion; en OCR, los errores se manifiestan como caracteres mal reconocidos, especialmente en escrituras de bajo recurso o escaneos de baja calidad.
- El rendimiento depende del DPI de renderizado (250 DPI por defecto) y de la calidad del escaneo; no se documentan metricas por escritura individual.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0,0 GB en el momento de la consulta, lo que sugiere una publicacion muy reciente o incompleta; conviene verificar la disponibilidad real de los archivos.
- No soporta razonamiento, generacion libre ni tool calling; no debe confundirse con un VLM generativo.
- El desglose de parametros de LayoutNet y del reconocedor RTL no esta disponible, por lo que el total de 8,1M es el unico dato agregado publicado.

## Enlaces

- Hugging Face: https://huggingface.co/suryatmodulus/OCRia-nano-1
- Informe tecnico: https://www.llamaindex.ai/ocria/ocria-nano-1-report.pdf
- Blog de presentacion: https://www.llamaindex.ai/blog/introducing-ocria-nano-1
- Repositorio LiteParse: https://github.com/run-llama/liteparse
- OCRia-1 en Hugging Face: https://huggingface.co/llamaindex/OCRia-1
- Repositorio ParseBench: https://github.com/run-llama/ParseBench
