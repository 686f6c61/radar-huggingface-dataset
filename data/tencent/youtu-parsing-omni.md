# tencent/Youtu-Parsing-Omni

## Resumen

Youtu-Parsing-Omni es un modelo de parseo omnicanal de 5.334 millones de parametros (5B) desarrollado por Tencent, publicado en Hugging Face bajo la libreria transformers con codigo personalizado. Su proposito es convertir una unica entrada —pagina de documento, imagen natural, grafico, diagrama de flujo, figura geometrica, clip de audio o video con pista de audio— en un unico sobre JSON estructurado (OmniSchema) que cubre tanto percepcion (elementos de layout, texto, tablas, formulas, bounding boxes, marcas temporales, ASR, OCR, eventos acusticos, movimiento de camara) como cognicion (leyendas, narrativas, informes). El tipo de salida se selecciona mediante el prompt de tarea (`--task`).

La relevancia actual del modelo radica en que sustituye la arquitectura habitual de dos torres separadas (una para pixeles y otra para audio) por un unico Youtu-Omni-Encoder inicializado desde un modelo de lenguaje de texto preentrenado, con tallos (stems) finos especificos por modalidad y un Transformer bidireccional compartido que contextualiza mezclas arbitrarias de imagenes, fragmentos de audio y videos bajo una codificacion posicional `(t, h, w)`. Segun la model card, casi todos los parametros de percepcion se comparten entre modalidades.

El modelo declara resultados de referencia en OmniDocBench v1.6 (96,96 en Overall), es el mejor modelo de pesos abiertos en OmniParsingBench (75,08 de media, solo por detras de Gemini-3-Pro) y compite con modelos especializados en reconocimiento de estructuras quimicas (ChemOCR) y partituras musicales (PDMX-Synth). Incluye un plugin para vLLM, prompts de tarea y ejemplos de inferencia. La licencia es propia (`youtu-parsing`), no Apache ni MIT, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Youtu-Omni-Encoder (Transformer bidireccional compartido con stems por modalidad) + decoder Youtu-LLM |
| Parametros totales | 5.334.472.192 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | youtu-parsing (licencia propia, enlazada en el repositorio) |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un parser omnicanal de dos etapas. En la etapa de percepcion, un unico Youtu-Omni-Encoder, inicializado a partir de un modelo de lenguaje de texto preentrenado para reforzar la lectura de texto, recibe tokens generados por stems finos especificos de modalidad: los pixeles y los fotogramas log-mel se proyectan a tokens, y un Transformer bidireccional compartido contextualiza una mezcla empaquetada arbitraria de imagenes, fragmentos de audio y videos bajo una unica codificacion posicional `(t, h, w)`. Despues, mergers y proyectores especificos por modalidad alimentan los tokens, junto con el prompt de texto, al decoder Youtu-LLM, que emite JSON conforme a OmniSchema. Solo los stems y las cabezas merger/proyector dependen de la modalidad, de modo que casi todos los parametros de percepcion son compartidos.

La model card menciona ademas una fusion audio-visual dentro de la percepcion, con ventanas de fusion y codificacion posicional temporal unificada (figura `assets/mech_figure.png`), y remite al informe tecnico (arXiv:2610.39301) para los detalles. No se proporcionan en la informacion disponible datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron RLHF, DPO u otras etapas de alineacion.

## Capacidades

- Parseo de documentos: extrae elementos de layout con bounding box, texto, tablas en LaTeX/OTSL, graficos en Markdown, diagramas de flujo en Mermaid y orden de lectura.
- Parseo de imagenes naturales: entidades y texto con bounding box, etiquetas, leyendas y descripcion global.
- Parseo de graficos: elemento `chart` con tabla Markdown, notas y leyenda.
- Parseo de diagramas de flujo: elemento `flowchart` en Mermaid con leyenda.
- Parseo de figuras geometricas: puntos, lineas, arcos, formas, relaciones geometricas y medidas.
- Procesamiento de audio: segmentos vocales y no vocales con marcas temporales, hablantes, ASR, timbre, leyendas de escena y eventos acusticos.
- Procesamiento de video natural: segmentos temporales con elementos visuales, acciones, interacciones, movimiento de camara y pista de audio.
- Procesamiento de video rico en texto: segmentos con OCR y ASR, mas un `structured_report` en Markdown del video completo.
- Salida unificada en JSON (OmniSchema) seleccionable mediante prompt de tarea.
- Reconocimiento especializado de estructuras quimicas (ChemOCR) y partituras musicales (PDMX-Synth), segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de archivos documentales: el modelo recibe una pagina escaneada y devuelve layout, texto, tablas y formulas en un JSON con bounding boxes y orden de lectura, lo que permite reconstruir el documento estructurado sin pipelines separados de OCR, deteccion de tablas y deteccion de layout.
- Extraccion de datos de graficos financieros o cientificos: con la tarea `graphics_chart` convierte un grafico en una tabla Markdown con notas y leyenda, util para alimentar hojas de calculo o bases de datos a partir de informes en PDF.
- Conversion de diagramas de flujo a codigo Mermaid: con `graphics_flowchart` genera un elemento `flowchart` en Mermaid, lo que facilita migrar diagramas de procesos a documentacion versionada en repositorios.
- Analisis de figuras geometricas en material educativo: con `graphics_geometric` extrae puntos, lineas, arcos, formas, relaciones y medidas, permitiendo generar ejercicios o comprobaciones automaticas de problemas de geometria.
- Transcripcion y analisis de reuniones o entrevistas: con la tarea `audio` obtiene segmentos vocales y no vocales con marcas temporales, hablantes, ASR, timbre y eventos acusticos, lo que sirve para generar actas estructuradas con atribucion de hablante.
- Indexacion y resumen de videos corporativos: con `natural_video` segmenta temporalmente elementos visuales, acciones, interacciones, movimiento de camara y pista de audio, habilitando busqueda semantica sobre el contenido audiovisual.
- Extraccion de contenido de videos con mucho texto (tutoriales, clases, demos de software): con `textrich_video` combina OCR y ASR por segmento y produce un informe estructurado en Markdown del video completo, adecuado para generar documentacion o apuntes.
- Reconocimiento de estructuras quimicas y partituras: segun la model card, compite con modelos especializados en ChemOCR y PDMX-Synth, lo que lo hace util para digitalizar literatura quimica y archivos musicales.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia comparativa |
|---|---|---|
| OmniDocBench v1.6 (Overall) | 96,96 | Estado del arte segun la model card |
| OmniParsingBench (Avg.) | 75,08 | Mejor modelo de pesos abiertos; segundo tras Gemini-3-Pro |
| ChemOCR | competitivo con modelos especializados | no se detallan cifras |
| PDMX-Synth | competitivo con modelos especializados | no se detallan cifras |

No se han publicado en la informacion disponible resultados numericos detallados por subtarea de OmniDocBench ni de OmniParsingBench, ni comparaciones cifradas con MMLU, HumanEval o GSM8K (benchmarks que no corresponden al perfil de este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 5.334 millones de parametros en safetensors, los pesos ocupan aproximadamente 10,7 GB en precision de 16 bits, por lo que la VRAM necesaria supera esa cifra al anadir cache de activaciones y buffers multimodales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado; por tamano de pesos en FP16 (unos 10,7 GB) encajaria teoricamente en GPU con 16 GB o mas, pero no hay confirmacion del autor ni datos de cuantizacion.
- Opciones de despliegue: plugin de vLLM incluido por el autor, con ajustes de serving fijados, prompts de tarea y ejemplos de inferencia; libreria transformers con `custom_code`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Youtu-Parsing-Omni | 5,33B | no disponible | OmniDocBench v1.6 96,96; OmniParsingBench 75,08 | youtu-parsing (propia) | Hugging Face, ModelScope, GitHub |
| Gemini-3-Pro | no disponible | no disponible | Por delante en OmniParsingBench (75,08 del modelo local) | propietaria | API de Google |
| Modelos especializados en ChemOCR | no disponible | no disponible | Competitivos con Youtu-Parsing-Omni | no disponible | no disponible |
| Modelos especializados en PDMX-Synth | no disponible | no disponible | Competitivos con Youtu-Parsing-Omni | no disponible | no disponible |

No se dispone en la informacion proporcionada de alternativas open-weight comparables con parametros, contexto y licencia detallados; la model card solo cita a Gemini-3-Pro como referencia superior en OmniParsingBench y a los modelos especializados de ChemOCR y PDMX-Synth como pares competitivos.

## Limitaciones y advertencias

- Licencia propia (`youtu-parsing`): no es Apache 2.0, MIT ni una licencia de codigo abierto estandar; antes de un uso comercial hay que revisar el texto enlazado en el repositorio, que no se detalla en la informacion disponible.
- Idiomas soportados: no declarados; no hay garantia explicita de cobertura multilingue mas alla de lo que el encoder de texto preentrenado pueda aportar.
- Longitud de contexto: no declarada, lo que impide planificar el parseo de documentos o videos muy largos sin pruebas previas.
- Riesgo de alucinacion: no se documentan en la informacion disponible tasas de error, modos de fallo ni salvaguardas; al generar JSON estructurado, errores de schema o valores inventados en tablas, formulas o ASR son un riesgo a validar en produccion.
- Sesgos conocidos: no documentados.
- Requiere `custom_code` y un plugin de vLLM especifico, lo que anade complejidad de integracion frente a modelos transformers estandar.
- No se declaran capacidades de tool calling ni de agentes, por lo que no debe asumirse su uso en pipelines agenticos sin validacion.
- Al ser un modelo de 5B orientado a parseo, no debe esperarse un rendimiento de razonamiento general comparable a modelos de lenguaje de mayor tamano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Youtu-Parsing-Omni
- Licencia: https://huggingface.co/tencent/Youtu-Parsing-Omni/blob/main/LICENSE
- Informe tecnico: https://arxiv.org/abs/2610.39301
- Repositorio GitHub: https://github.com/TencentCloudADP/youtu-parsing/tree/main/youtu_parsing_omni
- Prompts de tarea: https://github.com/TencentCloudADP/youtu-parsing/blob/main/youtu_parsing_omni/prompts/youtu_parsing_omni.json
- ModelScope: https://www.modelscope.cn/models/tencent-community/Youtu-Parsing-Omni
- Referencias adicionales citadas en los tags: arXiv:2601.20430, arXiv:2601.19798, arXiv:2512.24618 (contenido no disponible en la informacion proporcionada)
