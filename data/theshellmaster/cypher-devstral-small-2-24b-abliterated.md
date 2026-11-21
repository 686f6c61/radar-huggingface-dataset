# TheShellMaster/cypher-Devstral-Small-2-24B-abliterated

## Resumen

Cypher Devstral-Small-2 24B Abliterated es una cuantización GGUF del modelo Devstral-Small-2 de Mistral AI, publicada por TheShellMaster bajo el paraguas de "Cypher Studio". Se trata de un modelo denso de aproximadamente 23.570 millones de parámetros (unos 24B), derivado de la familia Ministral 3 y especializado en tareas de agente CLI y generación de código. La versión publicada incorpora una variante "abliterated", es decir, con las direcciones de rechazo eliminadas mediante técnicas de abliteración, y añade soporte de visión multimodal mediante un proyector `mmproj-f16`.

El modelo se distribuye exclusivamente en formato GGUF, con la cuantización `i1-Q5_K_M` generada mediante imatrix (aproximadamente 15,61 GiB), y está pensado para ejecutarse en entornos con recursos limitados, concretamente en configuraciones de doble GPU T4 (30 GB de VRAM agregada) bajo `llama-server --jinja`. La ficha del autor menciona una ventana de contexto configurable entre 64K y 256K tokens, aunque no se especifica el valor exacto certificado.

Su relevancia actual radica en que ofrece un modelo de 24B con capacidades de tool calling nativo de Mistral, visión y contexto largo, empaquetado para hardware de consumo o GPUs de gama media en la nube (T4), con licencia Apache 2.0. No obstante, la información publicada es muy escasa y no se han divulgado resultados de benchmarks ni detalles del entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Ministral 3 / Devstral-Small-2) |
| Parametros totales | 23.572.403.200 (~24B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 64K-256K segun la model card (valor exacto no certificado) |
| Tipos de cuantizacion | GGUF `i1-Q5_K_M` (imatrix, ~15,61 GiB); proyector vision `mmproj-f16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero `mmproj-f16` para vision) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 24B parámetros perteneciente a la familia Ministral 3 de Mistral AI, reorientado a tareas de agente de línea de comandos y código (Devstral-Small-2). La model card indica que no emplea modo `<think>` explícito, lo que reduce la latencia en comparación con modelos que generan cadenas de razonamiento previas a la respuesta. Incorpora un proyector multimodal `mmproj-f16` que habilita capacidades de visión nativa, presumiblemente heredadas del modelo base Mistral 3 multimodal.

El proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO) no está documentado en la información disponible. La variante publicada es una cuantización `i1-Q5_K_M` con imatrix del modelo `mradermacher/Huihui-Devstral-Small-2-24B-Instruct-2512-abliterated-i1-GGUF`, que a su vez deriva de una versión "abliterated" del Devstral-Small-2 Instruct. La abliteración elimina las direcciones de activación asociadas al rechazo, lo que modifica el comportamiento del modelo en materia de seguridad. No se dispone de detalles sobre el método exacto de abliteración aplicado ni sobre el calibrado del imatrix.

## Capacidades

- Generación de texto y razonamiento general en el rango de un modelo denso de 24B.
- Generación y edición de código, con especialización declarada en flujos de agente CLI.
- Tool calling / function calling nativo de Mistral, compatible con plantillas Jinja (`--jinja` en `llama-server`).
- Soporte de agentes y razonamiento multi-paso orientado a tareas de línea de comandos.
- Visión multimodal mediante el proyector `mmproj-f16` (entrada de imágenes).
- Ventana de contexto larga (64K-256K según la model card), adecuada para repositorios y conversaciones extensas.
- Ausencia de modo `<think>` explícito, lo que reduce la latencia de primera respuesta.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente CLI automatizado: el modelo puede interpretar instrucciones en lenguaje natural y emitir comandos de shell mediante tool calling, integrándose en herramientas tipo `cypher-opencode` para tareas de administración y scripting.
- Asistencia de código en IDE o terminal: generación y refactorización de fragmentos de código con contexto largo, útil para trabajar sobre repositorios completos sin truncar archivos relevantes.
- Automatización de pipelines de CI/CD: el modelo puede analizar logs, proponer parches y ejecutar acciones mediante function calling dentro de un flujo de integración continua.
- Análisis de capturas y diagramas: gracias al proyector de visión, puede describir imágenes de interfaces, diagramas de arquitectura o capturas de error y traducirlas a texto accionable.
- Extracción de información de documentación técnica: con contexto de hasta 256K tokens, puede procesar manuales extensos y responder preguntas concretas sobre ellos.
- Despliegue en hardware modesto: al estar cuantizado en `i1-Q5_K_M` (~15,61 GiB), cabe en configuraciones de doble T4 (30 GB) o en GPUs de consumo con 24 GB, lo que permite prototipado local de agentes sin infraestructura dedicada.
- Generación de scripts de automatización: a partir de una descripción de tarea, el modelo produce scripts de shell o Python con llamadas a herramientas, adecuado para equipos de DevOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,61 GiB para los pesos `i1-Q5_K_M`, más overhead de contexto KV (variable según la longitud de contexto configurada; a 64K puede requerir varios GB adicionales).
- Proyector de visión: `mmproj-f16` añade un consumo adicional de VRAM no especificado en la información disponible.
- GPU recomendadas: el autor apunta a doble NVIDIA T4 (30 GB agregada) como objetivo de despliegue; también es viable en GPUs con 24 GB (RTX 3090, RTX 4090, A10G) si se limita el contexto.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM usando la cuantización Q5_K_M y un contexto moderado; en 16 GB requeriría cuantizaciones más agresivas no publicadas en este repositorio.
- Opciones de despliegue: `llama-server` con `--jinja` (recomendado por el autor), `llama.cpp`, y presumiblemente otros runners compatibles con GGUF (Ollama, LM Studio) aunque no se confirman explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cypher Devstral-Small-2 24B Abliterated (este) | ~24B denso | 64K-256K (segun card) | Apache 2.0 | GGUF Q5_K_M | Abliterated, vision, tool calling |
| Devstral-Small-2 (Mistral AI, original) | ~24B denso | no disponible en esta ficha | no disponible | safetensors | Modelo upstream sin abliterar; referencia de comportamiento |
| mradermacher/Huihui-Devstral-Small-2-24B-Instruct-2512-abliterated-i1-GGUF | ~24B denso | no disponible | no disponible | GGUF | Base directa de esta cuantización |
| Mistral-Small / Ministral 3 (familia) | ~24B denso | hasta 128K en variantes Small | Apache 2.0 (segun variante) | safetensors, GGUF | Familia de origen; sin especialización agente CLI |

La comparación con alternativas de la misma categoría (modelos densos de ~24B para código y agentes) no puede completarse con datos de rendimiento porque no se han publicado benchmarks en la información disponible.

## Limitaciones y advertencias

- Modelo "abliterated": la eliminación de direcciones de rechazo reduce o anula los mecanismos de seguridad del modelo original, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado sin filtros.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se han publicado evaluaciones de fidelidad factual.
- Idiomas soportados no documentados: no se garantiza un rendimiento multilingüe equilibrado; el foco declarado es código y CLI, presumiblemente en inglés.
- Contexto: la ventana de 64K-256K se menciona en la model card pero no se certifica el valor exacto ni la degradación a longitudes máximas.
- Licencia Apache 2.0: permite uso comercial, pero la abliteración puede plantear problemas de cumplimiento en entornos con políticas de contenido estrictas.
- Información muy escasa: sin benchmarks, sin detalles de entrenamiento y con 0 descargas, lo que implica ausencia de validación comunitaria.
- Dependencia de `--jinja` en `llama-server` para el tool calling: otros runners pueden no interpretar correctamente la plantilla de herramientas.
- El proyector de visión `mmproj-f16` añade complejidad de despliegue y consumo de VRAM no cuantificado.

## Enlaces

- Hugging Face: https://huggingface.co/TheShellMaster/cypher-Devstral-Small-2-24B-abliterated
- Modelo base (GGUF): https://huggingface.co/mradermacher/Huihui-Devstral-Small-2-24B-Instruct-2512-abliterated-i1-GGUF
- Repositorio llama.cpp (runner recomendado): https://github.com/ggerganov/llama.cpp
- Mistral AI (familia Devstral/Ministral): https://mistral.ai
