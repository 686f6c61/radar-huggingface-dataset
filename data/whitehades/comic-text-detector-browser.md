# WhiteHades/comic-text-detector-browser

## Resumen

Comic text detector browser es una version optimizada del detector de texto para manga y comics que forma parte del proyecto Koharu (mayocream/koharu). El modelo original, `comictextdetector.onnx`, se ha reducido y reacondicionado para ejecutarse en ONNX Runtime Web, lo que permite realizar deteccion de texto en paginas de manga directamente en el navegador sin necesidad de backend.

La optimizacion elimina canales cuyas ponderaciones son nulas o denormales (por debajo de 1e-30), conservando las salidas practicamente identicas (diferencia maxima de 1.3e-6 en paginas de prueba). Tambien recorta las salidas a solo bloques y lineas, renombradas `blocks_8`, `blocks_16`, `blocks_32` y `lines`, eliminando la mascara de texto y los bordes de linea. El resultado pasa de 94.7 MB a 28.8 MB y reduce el tiempo de inferencia de 2.6 s a 1.1 s en una pagina de 1024 px con un solo hilo WebAssembly.

Es relevante para desarrolladores que necesitan integrar deteccion de texto en lectores de manga, visores de comics o herramientas de traduccion en el cliente, donde el ancho de banda y la latencia importan. El modelo mantiene la licencia AGPL-3.0 de su origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX derivado de mayocream/koharu) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (optimizacion por eliminacion de canales, no cuantizacion numerica) |
| Idiomas soportados | no disponible (deteccion de texto independiente del idioma) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX con datos externos (`comic_text_detector.onnx` + `comic_text_detector.data`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo original mas alla de que es un detector de texto para comics exportado a ONNX. El modelo base es `mayocream/koharu`, del que se toma el fichero `comictextdetector.onnx`. No se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO, ya que se trata de un modelo de vision para deteccion, no de un modelo generativo de lenguaje.

La innovacion tecnica de esta version es la poda de canales: se eliminan aquellos cuyas ponderaciones son todas cero o denormales (inferiores a 1e-30), manteniendo las salidas sin cambios significativos (diferencia maxima de 1.3e-6). Ademas, se recortan las salidas a las cuatro relevantes (`blocks_8`, `blocks_16`, `blocks_32` y `lines`), se elimina la mascara de texto y los bordes de linea, y se permite entrada de cualquier altura y anchura multiplo de 32. Los pesos se almacenan en un fichero externo `comic_text_detector.data` que debe pasarse a ONNX Runtime como datos externos. El script `build.py` genera estos ficheros a partir del modelo fuente.

## Capacidades

- Deteccion de texto en paginas de manga y comics, con salidas de bloques a tres escalas (`blocks_8`, `blocks_16`, `blocks_32`) y lineas (`lines`).
- Entrada de tamano variable: acepta cualquier altura y anchura que sean multiplos de 32.
- Ejecucion en navegador mediante ONNX Runtime Web, incluyendo WebAssembly de un solo hilo.
- Modelo de vision puro: no genera texto, no razona, no soporta tool calling ni agentes.
- No se documentan capacidades multilingues especificas; la deteccion de texto es independiente del idioma.
- No dispone de modo thinking, vision general, audio ni otras capacidades generativas.

## Casos de uso

- Lectores de manga en navegador: el modelo puede ejecutarse en el cliente para localizar globos de texto y lineas en cada pagina, permitiendo resaltados o superposiciones sin enviar imagenes a un servidor, gracias a su tamano de 28.8 MB y su inferencia de ~1.1 s por pagina de 1024 px.
- Herramientas de traduccion de comics en el navegador: la deteccion de bloques y lineas permite segmentar el texto antes de pasarlo a un OCR o a un traductor, todo dentro de la misma sesion web.
- Extensiones de navegador para asistencia a la lectura: al ejecutarse con ONNX Runtime Web, puede integrarse en extensiones que detecten texto en paginas de manga y ofrezcan funciones de accesibilidad o busqueda.
- Preprocesado en pipelines de digitalizacion de comics: el modelo sirve como primer paso para localizar regiones de texto antes de aplicar OCR, reduciendo el area de procesamiento y el coste computacional.
- Aplicaciones de edicion y limpieza de scans: la deteccion de lineas y bloques facilita el borrado o la sustitucion de texto en procesos de retoque, con la ventaja de ejecutarse localmente.
- Demos y prototipos de vision en web: util para validar flujos de deteccion de texto en el navegador sin infraestructura de servidor, con un modelo ligero y de licencia AGPL-3.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de optimizacion: reduccion de 94.7 MB a 28.8 MB y de 2.6 s a 1.1 s por pagina de 1024 px en un hilo de WebAssembly, con una diferencia maxima de 1.3e-6 respecto al modelo original en paginas de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en ONNX Runtime Web, el consumo depende del navegador y del backend (WebAssembly o WebGPU), no de VRAM dedicada en el sentido habitual.
- GPU recomendadas: no aplica para el caso de uso principal (navegador); en servidor, cualquier GPU compatible con ONNX Runtime puede ejecutar el modelo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: si, al ser un modelo de 28.8 MB, es viable en cualquier GPU de consumo mediante ONNX Runtime, aunque no se detallan requisitos minimos.
- Opciones de despliegue: ONNX Runtime Web (WebAssembly de un solo hilo o multihilo, y potencialmente WebGPU), ONNX Runtime en servidor, y cualquier runtime compatible con ONNX que soporte datos externos.
- Latencia y throughput estimados: ~1.1 s por pagina de 1024 px en un hilo de WebAssembly; no se proporcionan datos de throughput para otros backends.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhiteHades/comic-text-detector-browser | no disponible | no aplica | ~1.1 s/pagina 1024 px (1 hilo WASM) | AGPL-3.0 | Hugging Face |
| mayocream/koharu (original) | no disponible | no aplica | ~2.6 s/pagina 1024 px (1 hilo WASM) | AGPL-3.0 | Hugging Face |
| Otros detectores de texto para comics | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de deteccion de texto en comics en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al ser un detector entrenado en manga, puede tener un rendimiento inferior en otros estilos de comic o en texto fuera de globos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la deteccion puede producir falsos positivos o negativos en paginas con ruido, tramas o texto muy estilizado.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados; la deteccion es visual y no depende del idioma, pero no se garantiza cobertura de todos los alfabetos.
- Restricciones de licencia: AGPL-3.0 implica que cualquier uso en red del modelo o de obras derivadas debe ofrecer el codigo fuente bajo la misma licencia; es importante revisar las implicaciones para uso comercial y servicios en red.
- Caveat para produccion: los pesos se almacenan en un fichero externo `comic_text_detector.data` que debe cargarse junto al `.onnx`; omitirlo provoca fallos de carga. Ademas, el modelo solo conserva las salidas de bloques y lineas, por lo que no proporciona mascara de texto ni bordes de linea.
- El repositorio tiene 0.0 GB de tamano reportado y 0 descargas, lo que sugiere que es un artefacto reciente o de baja difusion; conviene validar su comportamiento en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/WhiteHades/comic-text-detector-browser
- Modelo base: https://huggingface.co/mayocream/koharu
- Fichero fuente del modelo base: https://huggingface.co/mayocream/koharu/tree/15439cba09df388c51de6e47c6020bc31edab41f
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
