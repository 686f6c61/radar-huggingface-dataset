# traceray/nexus-layout

## Resumen

nexus-layout es un export en formato ONNX del detector de maquetacion documental PP-DocLayoutV3 de PaddlePaddle, publicado por el usuario traceray para su uso con onnxruntime-web. No es un modelo entrenado desde cero: se trata de una conversion del export oficial PaddlePaddle/PP-DocLayoutV3_onnx, adaptada para que funcione en navegador con los backends WebGPU y WASM de onnxruntime-web. Su funcion es segmentar las paginas de un PDF en bloques (texto, titulos, tablas, figuras, etc.) dentro del lector de la aplicacion Nexus.

El modelo resuelve un problema muy concreto: ejecutar analisis de maquetacion documental en el cliente, sin necesidad de enviar el PDF a un servidor ni de disponer de GPU dedicada. Para ello el autor aplico tres modificaciones sobre el export oficial: desactivar `ceil_mode` en las capas de pooling (el backend WebGPU de onnxruntime-web no lo soporta), eliminar la salida de mascaras que no se utiliza junto con los nodos que la alimentaban, y almacenar los pesos en fp16 para reducir a la mitad el tamano del fichero, manteniendo el calculo en fp32. Segun el autor, ninguna de estas modificaciones altera las cajas resultantes.

El resultado es un unico fichero `pp-doclayoutv3-w16.onnx` de 65.751.638 bytes (unos 0,1 GB de repositorio) que recibe una pagina renderizada a 800x800 y devuelve filas de detecciones con clase, puntuacion, coordenadas de caja y orden de lectura. La licencia es Apache-2.0, heredada del modelo original, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo base: PaddlePaddle/PP-DocLayoutV3, detector de maquetacion documental) |
| Parametros totales | Aproximadamente 32,9 M (estimacion derivada de los 65.751.638 bytes del fichero en fp16; no confirmada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es una imagen fija de 800x800 (la relacion de aspecto no se conserva) |
| Tipos de cuantizacion | Pesos almacenados en fp16 y convertidos a fp32 al cargar el modelo; el calculo se mantiene en fp32. No se ofrecen variantes GGUF, int8 ni int4 |
| Idiomas soportados | No disponible. El modelo no procesa texto: opera sobre imagenes de pagina y devuelve cajas con identificadores de clase |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fichero unico `pp-doclayoutv3-w16.onnx`) |

Datos adicionales de integridad: SHA-256 del fichero `a8d186a39f10f4bf46fc6856d1c74ba104c51371c0db0d274faaa5486c79c747`. El modelo puede reconstruirse con `tools/layout-model/build.sh` del repositorio Nexus.

## Arquitectura y entrenamiento

Toda la arquitectura y el entrenamiento corresponden a PaddlePaddle/PP-DocLayoutV3, desarrollado por PaddlePaddle. La model card de este repositorio no detalla la topologia interna (tipo de backbone, cabezas de deteccion, numero de tokens de entrenamiento ni composicion del dataset), y remite explicitamente a la ficha del modelo base para esa informacion. Lo que si se documenta es el contrato de entrada y salida: la entrada se compone de tres tensores (`image`, `im_shape = [[800, 800]]` y `scale_factor`), con la imagen en RGB float32, orden CHW, dividida por 255 y sin normalizacion de media ni desviacion tipica. La salida son filas con el formato `[class, score, x1, y1, x2, y2, order]` mas el numero de filas; el campo `order` aporta el orden de lectura de los bloques y los identificadores de clase indexan las 25 etiquetas del `inference.yml` original.

La innovacion de este repositorio es de ingenieria de despliegue, no de modelado. El autor sustituye `ceil_mode` por `0` en los nodos de pooling para sortear una limitacion del backend WebGPU de onnxruntime-web, poda la salida de mascaras y los nodos que la alimentan (no se usaba), y almacena los pesos en fp16 con conversion a fp32 en la carga. Como verificacion, indica que las salidas se compararon con las del export oficial sobre las paginas de referencia y resultaron identicas. No se menciona ningun proceso de RLHF, DPO ni ajuste posterior: es una conversion directa del export oficial en el commit `46bbdf188bb0a772c08aed74882ce7e51a8f1ea6`.

## Capacidades

- Deteccion de maquetacion documental: divide una pagina renderizada en bloques y asigna a cada uno una de las 25 clases definidas en el `inference.yml` original (la lista concreta de etiquetas no se reproduce en la informacion disponible).
- Salida con orden de lectura: ademas de clase, puntuacion y coordenadas, cada deteccion incluye un campo `order`, lo que permite reconstruir la secuencia de lectura de la pagina.
- Salida orientada a cajas: el export conserva unicamente las detecciones y su recuento; la salida de mascaras del modelo original se ha eliminado.
- Inferencia en navegador: disenado para onnxruntime-web con soporte de WebGPU y WASM, lo que permite ejecutarlo en el cliente sin backend propio.
- Ejecucion sobre CPU: al disponer de backend WASM, puede funcionar en equipos sin GPU compatible.
- Integracion como etapa previa de pipelines de documentos: al devolver cajas y orden, encaja antes de etapas de OCR, extraccion de texto o chunking.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo de deteccion de objetos, no un modelo de lenguaje.
- No tiene capacidades multilingues en el sentido habitual: no procesa idioma alguno, solo pixeles de pagina.

## Casos de uso

- Lectores de PDF en navegador: el escenario para el que se creo. El modelo segmenta cada pagina en bloques y proporciona su orden de lectura, lo que permite renderizar o extraer el contenido en la secuencia correcta sin enviar el documento a un servidor.
- Extraccion de contenido estructurado en aplicaciones web: tras detectar tablas, figuras y bloques de texto, una capa posterior puede aplicar OCR solo a las regiones de texto y extraer tablas de forma diferenciada, reduciendo coste y ruido.
- Pipelines de RAG sobre documentacion corporativa: las cajas y su orden sirven para trocear documentos en unidades semanticamente coherentes (secciones, tablas, pies) antes de generar embeddings, en lugar de cortar por numero fijo de caracteres.
- Procesamiento local con requisitos de privacidad: al ejecutarse en el navegador o en el dispositivo, el documento no abandona el equipo del usuario, lo que resulta adecuado para contratos, informes medicos o expedientes legales.
- Digitalizacion y archivado masivo: la ausencia de dependencia de GPU dedicada y el tamano reducido del fichero (unos 66 MB) permiten procesar grandes volumenes de PDF en maquinas convencionales o incluso en contenedores ligeros.
- Revision de documentos academicos y tecnicos: la deteccion de figuras, tablas y bloques de texto con orden facilita la conversion de articulos a formatos estructurados o la comparacion de maquetaciones entre versiones.
- Accesibilidad: el orden de lectura detectado puede alimentar lectores de pantalla o generar versiones reflowables de PDF que originalmente no son accesibles.
- Verificacion previa a OCR en sistemas de captura de formularios: descartar regiones no textuales antes de invocar un motor de OCR caro reduce el tiempo total del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica validacion reportada es cualitativa: el autor afirma que las salidas del export modificado se compararon con las del export oficial sobre las paginas de referencia y resultaron identicas, y que ninguna de las tres modificaciones (ceil_mode, poda de la salida de mascaras, almacenamiento en fp16) altera las cajas. No se aportan cifras de mAP, precision, recall ni latencia.

## Requisitos de hardware

- VRAM estimada: muy baja. El fichero de pesos ocupa 65.751.638 bytes en fp16; al cargarse en fp32, el uso de memoria ronda los 130-135 MB solo en pesos, mas las activaciones de una entrada de 800x800.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en navegador. No se especifica una GPU objetivo concreta en la informacion disponible.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en graficos integrados, dado el tamano del modelo. El limite practico lo marca el soporte de WebGPU del navegador, no la memoria.
- CPU: existe backend WASM de onnxruntime-web, por lo que puede ejecutarse sin GPU, con latencia presumiblemente mayor (no se publican cifras).
- Opciones de despliegue: onnxruntime-web (WebGPU y WASM) es el destino documentado. Al ser un fichero ONNX estandar, en principio podria ejecutarse con otros runtimes compatibles con ONNX, aunque el autor no los valida ni los menciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| traceray/nexus-layout | ~32,9 M (estimado) | Imagen 800x800 | ONNX fp16 con calculo fp32 | Apache-2.0 | HuggingFace, orientado a onnxruntime-web |
| PaddlePaddle/PP-DocLayoutV3_onnx (export oficial) | No disponible | Imagen 800x800 | ONNX | Apache-2.0 | HuggingFace, es la fuente de esta conversion |
| PaddlePaddle/PP-DocLayoutV3 (modelo base) | No disponible | No disponible | PaddlePaddle | Apache-2.0 | HuggingFace, incluye entrenamiento y arquitectura |

La comparacion con otras familias de analisis de maquetacion (por ejemplo, detectores basados en YOLO o modelos tipo LayoutLM) no se puede completar con datos de esta busqueda: no se dispone de cifras de parametros, contexto ni rendimiento de esas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no publica resultados de benchmarks cuantitativos. La afirmacion de que las cajas son identicas al export oficial no va acompanada de las paginas de prueba, las metricas ni el procedimiento completo.
- La entrada esta fijada a 800x800 y no conserva la relacion de aspecto, por lo que las paginas se deforman antes de la inferencia. En documentos muy alargados o con maquetaciones complejas esto puede afectar a la deteccion.
- Los identificadores de clase solo son interpretables consultando las 25 etiquetas del `inference.yml` original; la model card no las reproduce, lo que complica la integracion sin acudir al repositorio del modelo base.
- El autor no documenta sesgos del modelo. Al ser una conversion del PP-DocLayoutV3 de PaddlePaddle, hereda los posibles sesgos de su dataset de entrenamiento, que no se detalla aqui.
- Riesgo de deteccion erronea en documentos con maquetaciones poco frecuentes, escaneos de baja calidad, ruido o rotaciones. No hay datos publicados sobre el comportamiento en estos casos.
- La modificacion de `ceil_mode` a `0` es una desviacion respecto al grafo original. Aunque el autor sostiene que las salidas coinciden, es un cambio que conviene validar con documentos propios antes de usarlo en produccion.
- La licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. Es una licencia permisiva, sin las restricciones de uso de otras licencias de modelos abiertos.
- Almacenar los pesos en fp16 introduce una perdida de precision en los pesos, aunque el calculo se haga en fp32. El impacto real no se cuantifica en la informacion disponible.
- Dependencia del soporte de WebGPU del navegador: la motivacion del cambio de `ceil_mode` es precisamente una limitacion de ese backend, por lo que la ruta WASM sigue siendo necesaria como respaldo en navegadores sin WebGPU.
- Repositorio sin descargas ni valoraciones registradas en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/traceray/nexus-layout
- Modelo base: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3
- Export oficial en ONNX (fuente de esta conversion): https://huggingface.co/PaddlePaddle/PP-DocLayoutV3_onnx
- Repositorio Nexus (aplicacion que lo utiliza): https://github.com/zihay/Nexus

Resultados de la busqueda web con nombre coincidente pero no relacionados con este modelo (se incluyen solo para evitar confusiones): el paper "Nexus: Structured Synergy for Efficient Text-to-Image Generation" (https://arxiv.org/abs/2608.16104 y https://arxiv.org/pdf/2608.16104), el articulo sobre modelos tabulares de IEEE Spectrum (https://spectrum.ieee.org/large-tabular-models-nexus) y la documentacion de la funcion TraceRay de Direct3D 12 (https://learn.microsoft.com/en-us/windows/win32/direct3d12/traceray-function). Ninguno de ellos describe el modelo de esta ficha.
