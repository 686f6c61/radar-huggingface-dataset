# tencent/Youtu-Parsing-Omni

## Resumen

Youtu-Parsing-Omni es un modelo de parseo omnimodal compacto (5.334.472.192 parametros, aproximadamente 5,3B) desarrollado por Tencent, publicado en HuggingFace bajo el identificador `tencent/Youtu-Parsing-Omni`. Su proposito es convertir una unica entrada —una pagina de documento, una imagen natural, un grafico o diagrama de flujo, una figura geometrica, un clip de audio o un video audiovisual— en un unico sobre JSON estructurado (OmniSchema) que cubre tanto percepcion (layout, texto, tablas, formulas, bounding boxes, timestamps, ASR, OCR, eventos acusticos, movimiento de camara) como cognicion (captioning, narrativas e informes).

La relevancia del modelo reside en su enfoque de encoder unificado: en lugar de emplear dos torres preentrenadas independientes (una de vision y otra de audio) cuyas representaciones se encuentran dentro del modelo de lenguaje, Youtu-Parsing-Omni usa un unico Youtu-Omni-Encoder inicializado a partir de un modelo de lenguaje de texto preentrenado, con stems finos especificos por modalidad. Esto permite compartir la practica totalidad de los parametros de percepcion entre imagen, audio y video con audio intercalado.

El modelo se distribuye con pesos en safetensors, un plugin de vLLM, prompts de tarea y ejemplos de inferencia, y esta orientado a servir como motor unico de extraccion estructurada en pipelines de documentos y multimedia. La model card reporta resultados estado del arte en OmniDocBench v1.6 y el mejor modelo de pesos abiertos en OmniParsingBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoder unificado (Youtu-Omni-Encoder) y decoder de lenguaje (Youtu-LLM); codigo personalizado (`custom_code`) |
| Parametros totales | 5.334.472.192 (aproximadamente 5,3B, dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | `youtu-parsing` (licencia personalizada, `license: other`); enlace en https://huggingface.co/tencent/Youtu-Parsing-Omni/blob/main/LICENSE |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 10,7 GB |
| Pipeline declarado | `image-text-to-text` |
| Libreria | transformers |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

Youtu-Parsing-Omni sigue un diseno de dos etapas. Un unico Youtu-Omni-Encoder, inicializado desde un modelo de lenguaje de texto preentrenado para reforzar la lectura de texto, sustituye a las torres separadas de vision y audio de los parsers omnimodales convencionales. Stems finos especificos de modalidad proyectan los pixeles y los fotogramas log-mel a tokens; un Transformer bidireccional compartido contextualiza una mezcla empaquetada arbitraria de imagenes, fragmentos de audio y videos bajo una unica codificacion posicional `(t, h, w)`. A continuacion, mergers y projectors especificos de modalidad alimentan los tokens, junto con el prompt de texto, al decoder Youtu-LLM, que emite el JSON de OmniSchema. Solo los stems y las cabezas de merger/projector dependen de la modalidad, por lo que la practica totalidad de los parametros de percepcion son compartidos.

Para la fusion audio-visual, los fotogramas y los fragmentos de audio de un video se empaquetan en orden temporal: las capas sin fusion otorgan a cada fotograma y a cada fragmento de audio su propia ventana de atencion, mientras que unas pocas capas de fusion inician una nueva ventana (la model card proporcionada se interrumpe en este punto, por lo que no se detalla el mecanismo completo). La seleccion de la familia de salida se controla mediante el prompt de tarea (`--task` en los ejemplos, claves de `prompts/youtu_parsing_omni.json`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card indica que el informe tecnico esta disponible y que el codigo de evaluacion se publicara, pero no detalla la receta de entrenamiento en la informacion proporcionada.

## Capacidades

- Parseo de documentos: extraccion de elementos de layout con bounding boxes, texto, tablas en LaTeX/OTSL, graficos en Markdown, diagramas de flujo en Mermaid y orden de lectura.
- Imagenes naturales: deteccion de entidades y texto con bbox, etiquetas, captions y descripcion global.
- Graficos: generacion de un elemento `chart` con tabla Markdown, notas y caption.
- Diagramas de flujo: generacion de un elemento `flowchart` en Mermaid con caption.
- Figuras geometricas: extraccion de puntos, lineas, arcos, formas, relaciones geometricas y medidas.
- Audio: segmentacion en tramos vocales y no vocales con timestamps, hablantes, ASR, captions de timbre y escena, y eventos acusticos.
- Video natural: segmentos temporales con elementos visuales, acciones, interacciones, movimiento de camara y pista de audio.
- Video con mucho texto: segmentos con OCR y ASR, mas un `structured_report` en Markdown del video completo.
- Salida unificada: un unico sobre JSON (OmniSchema) para las siete familias de parseo, seleccionable mediante prompt de tarea.
- Capacidades de cognicion: captioning, narrativas e informes generados a partir de la percepcion.
- Reconocimiento de dominios especificos: estructuras quimicas (ChemOCR) y partituras musicales (PDMX-Synth), segun los resultados reportados.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking) y soporte de audio en tiempo real: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion masiva de archivos documentales: el modelo recibe la imagen de una pagina y devuelve layout, texto, tablas y formulas en un JSON unico, lo que permite indexar fondos documentales completos sin encadenar modelos de OCR, deteccion de layout y reconocimiento de tablas por separado.
- Extraccion de datos de facturas y formularios: al devolver bbox y texto estructurado en el mismo sobre, se pueden mapear campos a un esquema de negocio y validar la geometria de cada campo antes de introducirlo en un ERP.
- Conversion de graficos e infografias a tablas Markdown: util para equipos de analisis que necesitan reutilizar datos publicados solo como imagen en informes o presentaciones.
- Transcripcion y analisis de reuniones grabadas en video: el modelo procesa conjuntamente fotogramas y pista de audio, produciendo segmentos temporales con ASR, hablantes, eventos acusticos y descripcion visual, lo que permite generar actas enlazadas a marcas de tiempo.
- Generacion de informes estructurados de video con mucho texto: para contenido formativo o broadcast, el `structured_report` en Markdown sintetiza OCR y ASR de todo el video, facilitando la busqueda semantica sobre el material audiovisual.
- Extraccion de diagramas de arquitectura y flujos: la salida Mermaid permite reconstruir diagramas de flujo como codigo versionable y editable, en lugar de tratarlos como imagenes opacas.
- Reconocimiento de figuras cientificas: la extraccion de relaciones geometricas y medidas en figuras, junto con el reconocimiento de estructuras quimicas y partituras, habilita pipelines de documentacion cientifica y edicion musical asistida.
- Servicio unificado de parseo en produccion: al exponerse mediante un plugin de vLLM con prompts de tarea, una sola instancia puede atender peticiones heterogeneas (documento, imagen, audio, video) enrutando por el parametro `--task`, simplificando el mantenimiento frente a un conjunto de modelos especializados.

## Benchmarks y rendimiento

Datos reportados en la model card:

| Benchmark | Resultado | Contexto |
|---|---|---|
| OmniDocBench v1.6 (Overall) | 96,96 | Estado del arte segun el autor |
| OmniParsingBench (Avg.) | 75,08 | Mejor modelo de pesos abiertos; segundo puesto global tras Gemini-3-Pro |
| ChemOCR (estructuras quimicas) | Competitivo con modelos especializados | Sin cifra publicada en la informacion disponible |
| PDMX-Synth (partituras musicales) | Competitivo con modelos especializados | Sin cifra publicada en la informacion disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de proposito general, ni el desglose por tarea de OmniParsingBench. La model card anuncia que el codigo de evaluacion se publicara.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 10,7 GB en bf16/fp16 (coincide con el tamano del repositorio de pesos), aproximadamente 5,5 GB en int8 y en torno a 3 GB en int4, asumiendo cuantizacion estandar de un modelo denso de 5,3B parametros. Estas cifras son estimaciones por tamano, no mediciones publicadas.
- GPU profesionales: una A100 40 GB, H100 o L40S cubre con holgura la inferencia en bf16 y deja margen para lotes mayores o entradas de video con muchos fotogramas.
- GPU de consumo: cabe en tarjetas con 12-16 GB o mas, como RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080 o RTX 4090, en bf16 ajustado o en cuantizacion de 8 bits; en 8 GB seria necesario cuantizar a 4 bits, aunque no se documentan pesos ya cuantizados.
- Opciones de despliegue: se incluye un plugin de vLLM con ajustes de serving fijados, ademas de ejemplos de inferencia y soporte via `transformers` con `custom_code`. No se documentan pesos GGUF, por lo que llama.cpp u Ollama no estan soportados de serie en la informacion disponible; tampoco se menciona soporte explicito de TGI.
- Latencia y throughput: no disponibles. La model card no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento reportado |
|---|---|---|---|---|---|
| Youtu-Parsing-Omni | 5,3B | No disponible | `youtu-parsing` (personalizada) | Pesos abiertos en HuggingFace | OmniDocBench v1.6: 96,96; OmniParsingBench: 75,08 |
| Gemini-3-Pro | No disponible | No disponible | Propietaria | Solo API | Por delante de Youtu-Parsing-Omni en OmniParsingBench segun el autor |
| Parsers omnimodales de doble torre (vision + audio) | No disponible | No disponible | No disponible | No disponible | Enfoque alternativo descrito en el informe tecnico; sin cifras en la informacion disponible |
| Modelos especializados (ChemOCR, PDMX-Synth) | No disponible | No disponible | No disponible | No disponible | Youtu-Parsing-Omni se declara competitivo frente a ellos, sin cifras publicadas |

La informacion disponible no identifica por nombre alternativas open-weight concretas de tamano y tarea comparables, por lo que la comparativa cuantitativa con modelos de la misma categoria queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada. Al ser un modelo de parseo entrenado por un laboratorio concreto, es previsible un sesgo hacia los dominios y tipos de documento representados en su dataset de entrenamiento, pero no hay datos que lo confirmen.
- Riesgo de alucinacion: el modelo genera JSON con campos de cognicion (captions, narrativas, informes) ademas de percepcion, por lo que existe riesgo de contenido inventado o de transcripcion incorrecta de texto y tablas. No se publican tasas de error por tarea.
- Ausencia de desglose de benchmarks: los resultados se presentan como cifras agregadas (Overall, Avg.) sin detalle por tarea, lo que dificulta estimar el rendimiento en un caso concreto.
- Idiomas: no se declara la lista de idiomas soportados ni su cobertura relativa, lo que impide garantizar calidad en castellano u otros idiomas distintos de los usados en el entrenamiento.
- Longitud de contexto: no disponible, lo que impide dimensionar de antemano el procesamiento de documentos extensos o videos largos.
- Restricciones de licencia: la licencia es personalizada (`license_name: youtu-parsing`). No se detallan en la informacion disponible los terminos de uso comercial, por lo que es imprescindible revisar el fichero LICENSE antes de cualquier despliegue en produccion.
- Codigo personalizado: el modelo requiere `custom_code` y su uso depende de `transformers` con confianza remota habilitada, lo que anade superficie de riesgo en entornos de produccion.
- Despliegue: no hay pesos GGUF publicados, lo que limita las opciones de inferencia en CPU o en entornos de bajos recursos.
- Madurez: el modelo es de publicacion reciente (octubre de 2026) y con un volumen bajo de descargas (50) y likes (20), por lo que su ecosistema y validacion externa son todavia limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/Youtu-Parsing-Omni
- Licencia: https://huggingface.co/tencent/Youtu-Parsing-Omni/blob/main/LICENSE
- Repositorio GitHub: https://github.com/TencentCloudADP/youtu-parsing/tree/main/youtu_parsing_omni
- Informe tecnico (PDF): https://github.com/TencentCloudADP/youtu-parsing/tree/main/youtu_parsing_omni/paper/Youtu_Parsing_Omni.pdf
- Prompts de tarea: https://github.com/TencentCloudADP/youtu-parsing/blob/main/youtu_parsing_omni/prompts/youtu_parsing_omni.json
- Referencias arXiv indicadas en las etiquetas del modelo: arXiv:2601.20430, arXiv:2601.19798, arXiv:2512.24618 (https://arxiv.org/abs/2601.20430, https://arxiv.org/abs/2601.19798, https://arxiv.org/abs/2512.24618)
- Sitio corporativo de Tencent: https://www.tencent.com/
