# vllm-sr/Vela-2.0-9B

## Resumen

Vela 2.0 9B es un modelo de decisión (no generativo) desarrollado por vLLM Semantic Router en colaboración con KR Labs, publicado bajo licencia Apache-2.0. Su función no es redactar texto, sino emitir decisiones estructuradas: clasificación por elección entre opciones definidas en tiempo de petición, respuestas sí/no calibradas, puntuaciones de probabilidad, conjuntos de etiquetas y, de forma destacada, tramos de texto (spans) con desplazamientos de caracteres y probabilidad asociada. Es el miembro de mayor tamaño de la familia híbrida Vela 2.0 y está pensado para integrarse en pasarelas de enrutado semántico y en capas de seguridad de aplicaciones LLM.

Técnicamente es un transformer híbrido de 32 capas construido sobre un backbone Qwen3.5 que combina Gated DeltaNet (atención lineal con compuertas) y GQA con compuertas. Cuenta con 7.945.373.185 parámetros (~7,9B), una longitud máxima de entrada de 16.384 tokens y está afinado a partir de vllm-sr/Decision-2.0-Lux-9B. Los pesos se cargan en FP32 (unos 32 GB de memoria de parámetros en GPU según la model card), con el backbone ejecutándose bajo autocast bf16 y las cabezas en FP32.

Su relevancia actual radica en unificar tareas que normalmente requieren varios modelos especializados: enrutado de peticiones, detección de ataques de prompt, detección de información personal identificable (PII) sobre 17 tipos entrenados, detección de afirmaciones no respaldadas por el contexto (alucinaciones) y extracción de entidades con etiquetas abiertas, todo ello con una única interfaz y salida estructurada. La model card reporta un índice de decisión Jev de 41,63 y un AUC de 0,989 sobre familias de prompt-attack no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de 32 capas sobre backbone Qwen3.5, con Gated DeltaNet (atencion lineal) y GQA con compuertas |
| Parametros totales | 7.945.373.185 (~7,9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens de entrada |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen y se cargan en FP32; no se documentan versiones cuantizadas) |
| Idiomas soportados | 17: arabe, chino, checo, neerlandes, ingles, frances, aleman, hindi, italiano, japones, coreano, polaco, portugues, ruso, espanol, sueco y tailandes |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con codigo personalizado (`trust_remote_code=True`); tamano del repositorio 35,9 GB |
| Precision evaluada | Parametros FP32; backbone en autocast bf16 en GPU; cabezas en FP32 |
| Tipos de salida | Choice, Yes/no (Noul), Score, Span y Set; sin generacion de texto |
| Modelo base | vllm-sr/Decision-2.0-Lux-9B (finetune) |

## Arquitectura y entrenamiento

El backbone es un transformer hibrido de 32 capas derivado de Qwen3.5. Alterna o combina dos mecanismos de mezcla de informacion: Gated DeltaNet, una forma de atencion lineal recurrente con compuertas, y GQA (grouped-query attention) tambien con compuertas. El uso de atencion lineal reduce el coste computacional y de memoria frente a la atencion completa en secuencias largas, lo que encaja con el objetivo de procesar documentos extensos para deteccion de PII y de afirmaciones no soportadas. La model card recomienda el kernel `flash-linear-attention` para el calculo de Gated DeltaNet en GPU, descrito como opcional pero considerablemente mas rapido.

El modelo no genera texto. La interfaz `system_one` recibe un estado con campos como `request`, `source` y `answer`, junto con un diccionario de preguntas nombradas; cada pregunta declara un tipo (`choice`, `span`, `set`, etc.), instrucciones, criterios o etiquetas y sobre que campo se aplica. La salida incluye respuestas, spans con etiqueta, probabilidad, desplazamientos de inicio y fin, y la indicacion de que cabeza (`router`, etc.) ha resuelto cada pregunta. Se menciona una calibracion opcional denominada Noul para las respuestas de tipo si/no.

El entrenamiento es un finetune de Decision-2.0-Lux-9B. La model card no especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero enumera las fuentes utilizadas, que cubren seguridad de contenido (Aegis-AI-Content-Safety-Dataset-2.0, PolyGuardMix, Nemotron-Safety-Guard-Dataset-v3, Salad-Data), inyeccion de prompt (llmail-inject-challenge), deteccion de alucinaciones en prosa y codigo (lettucedetect-prose-hallucination, lettucedetect-code-hallucination), reconocimiento de entidades (NuNER, pile-mistral-v0.1, GLINER-multi-task-synthetic-data, finer-139, MultiCoNER v2, Re-DocRED), extraccion de informacion (SynthIE), comprension de lectura y preguntas multi-salto (SQuAD v2, HotpotQA, Natural Questions), spans verbatim y extraccion de salidas de herramientas sobre SWE-bench. No se documentan fases de RLHF o DPO; dado que el modelo no genera texto, el ajuste se orienta a tareas discriminativas y de etiquetado de spans.

## Capacidades

- Decision estructurada sin generacion de texto: eleccion entre opciones, si/no calibrado, puntuaciones, conjuntos de etiquetas y spans con offsets de caracteres.
- Preguntas multiples y nombradas en una sola peticion, con criterios definidos en tiempo de ejecucion (etiquetas abiertas).
- Enrutado semantico: clasificacion de una peticion en dominios o categorias definidas por el usuario (por ejemplo, salud, matematicas, otros) con probabilidades por clase.
- Deteccion de PII sobre 17 tipos entrenados, con probabilidad y localizacion exacta del fragmento.
- Deteccion de alucinaciones: identificacion de los tramos de una respuesta que no estan respaldados por el contexto proporcionado.
- Seguridad de contenido y deteccion de ataques de prompt, con AUC reportado de 0,989 en familias de prompt-attack no vistas.
- Reconocimiento de entidades con etiquetas abiertas (zero-shot NER) y extraccion de informacion estructurada.
- Extraccion de spans verbatim, orientada a tareas de verificacion y de extraccion de salidas de herramientas.
- Capacidad multilingue en 17 idiomas, incluyendo espanol, ingles, chino, arabe, hindi y la mayoria de lenguas europeas relevantes.
- No soporta tool calling ni razonamiento multi-paso generativo: la model card lo etiqueta como modelo de "system-one" (respuesta directa) y su salida es exclusivamente estructurada.
- No dispone de capacidades de vision ni de audio segun la informacion disponible.

## Casos de uso

- Enrutado semantico en pasarelas LLM: el modelo puede clasificar cada peticion entrante en dominios definidos por el operador y devolver probabilidades por clase, de modo que el gateway dirija la consulta al modelo especializado o al nivel de coste adecuado. Su indice de decision Jev de 41,63 y la posibilidad de definir rubricas en tiempo de peticion lo hacen apto para politicas de enrutado que cambian sin reentrenar.
- Deteccion de PII para cumplimiento normativo (RGPD): con 17 tipos entrenados y salida con offsets de caracteres, permite localizar y anonimizar nombres, correos y otros identificadores en documentos largos antes de enviarlos a un tercero o de almacenarlos.
- Verificacion de respuestas en sistemas RAG: dado el contexto recuperado y la respuesta generada, el modelo marca los tramos de la respuesta no soportados por el contexto. En el ejemplo de la model card detecta "6 grams" como afirmacion no respaldada en una respuesta sobre dosis de paracetamol, lo que permite bloquear o revisar la respuesta antes de mostrarla.
- Moderacion de contenido y defensa frente a prompt injection: clasificacion de peticiones y respuestas contra politicas de seguridad, incluyendo familias de ataque no vistas en entrenamiento, con un AUC reportado de 0,989. Adecuado como primera capa de filtrado en asistentes expuestos al publico.
- Extraccion de entidades con taxonomia propia: al aceptar etiquetas definidas en la peticion, un equipo puede extraer campos especificos de su dominio (por ejemplo, referencias de contrato o identificadores de ticket) sin etiquetar datos ni reentrenar.
- Clasificacion multilingue de tickets de soporte: con 17 idiomas y clasificacion zero-shot, permite etiquetar por categoria, urgencia o area de producto sin un modelo por idioma, reduciendo el coste de mantenimiento de la cola de soporte.
- Verificacion de salidas de herramientas y agentes: el modelo incluye datos de extraccion de salidas de herramientas sobre SWE-bench, por lo que puede usarse para extraer y validar fragmentos concretos de la salida de una herramienta antes de que un agente los consuma.
- Filtrado y curado de pipelines de datos: puntuacion de seguridad, deteccion de contenido toxico y deteccion de afirmaciones no soportadas sobre grandes volumenes de texto, integrable como etapa de preprocesado.

## Benchmarks y rendimiento

La model card publica dos metricas agregadas. No se han publicado resultados de benchmarks en la informacion disponible para pruebas generativas como MMLU, HumanEval o GSM8K, y esas metricas no son aplicables porque el modelo no genera texto.

| Metrica | Valor | Notas |
|---|---|---|
| Jev Decision Index | 41,63 | Con calibracion Noul opcional |
| AUC en familias de prompt-attack no vistas | 0,989 | Evaluado sobre familias de ataque ausentes del entrenamiento |

## Requisitos de hardware

- VRAM para inferencia: la model card indica aproximadamente 32 GB de memoria de parametros en GPU para la configuracion evaluada (parametros en FP32, backbone en autocast bf16, cabezas en FP32).
- No cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) con la configuracion documentada, ya que los parametros se cargan en FP32. No se documenta ninguna ruta de cuantizacion ni de conversion de pesos a bf16 o int8.
- GPUs compatibles con la configuracion evaluada: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB y RTX 6000 Ada 48 GB. Cualquier GPU con 40 GB o mas de VRAM deberia ser suficiente para los pesos, dejando margen para activaciones y cache.
- Kernel opcional: se recomienda `flash-linear-attention` para el calculo de Gated DeltaNet en GPU; la model card lo describe como opcional pero mucho mas rapido.
- Opciones de despliegue: la ruta documentada es la libreria `transformers` (version >= 5.17) junto con `torch`, `safetensors`, `tokenizers` y `numpy`, cargando el modelo con `AutoModel.from_pretrained(..., trust_remote_code=True)`. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible. La model card no publica cifras de latencia, tokens por segundo ni rendimiento por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela 2.0 9B | 7,9B | 16.384 tokens | Enrutado, seguridad, PII, alucinaciones y spans con etiquetas abiertas | Apache-2.0 | HuggingFace |
| Llama Guard 3 8B | 8B | no disponible | Clasificacion de seguridad de entradas y salidas | Licencia comunitaria de Llama 3 | HuggingFace |
| Qwen3Guard-Gen-8B | 8B | no disponible | Clasificacion de seguridad generativa | Apache-2.0 | HuggingFace |
| GLiNER multi-task (encoder) | no disponible | no disponible | NER zero-shot y extraccion de entidades | Apache-2.0 | HuggingFace |

La diferencia principal de Vela 2.0 9B frente a los modelos de guarda citados es que combina en una sola interfaz el enrutado por dominios, la deteccion de seguridad, la deteccion de PII, la deteccion de alucinaciones y la extraccion de spans con etiquetas definidas en tiempo de peticion, en lugar de limitarse a una unica tarea de clasificacion. Los datos de contexto de los modelos comparados no estan confirmados en la informacion disponible y se marcan como no disponibles.

## Limitaciones y advertencias

- No genera texto. Cualquier caso de uso que requiera redaccion, resumen o dialogo debe resolverse con un modelo generativo distinto.
- La longitud de entrada esta limitada a 16.384 tokens, lo que restringe el analisis de documentos muy largos en una sola pasada.
- El modelo requiere `trust_remote_code=True` y distribuye codigo personalizado: implica ejecutar codigo del autor y debe revisarse antes de usarlo en entornos de produccion sensibles.
- Los pesos se cargan en FP32, con un consumo de unos 32 GB de VRAM en GPU. No hay versiones cuantizadas publicadas, lo que dificulta el despliegue en hardware de gama media.
- No hay soporte documentado en motores de inferencia habituales como vLLM, llama.cpp, Ollama o TGI, por lo que el despliegue depende de la ruta de `transformers` indicada por el autor.
- Cifra de adopcion baja en el momento de la consulta (29 descargas y 12 me gusta), con validacion externa limitada.
- Riesgo de falsos negativos y falsos positivos inherente a cualquier clasificador de seguridad. Los umbrales deben calibrarse por caso de uso; la model card menciona la calibracion Noul para las respuestas si/no.
- La deteccion de alucinaciones se limita a determinar si una afirmacion esta respaldada por el contexto proporcionado; no valida la veracidad factual absoluta ni detecta errores presentes tambien en el contexto.
- Sesgos potencialmente heredados del backbone Qwen3.5 y de los conjuntos de datos de entrenamiento (Aegis, PolyGuard, Nemotron Safety Guard, entre otros), con posible infrarrepresentacion de variedades dialectales o de dominios poco frecuentes.
- Aunque el soporte multilingue cubre 17 idiomas, no se publican metricas desagregadas por idioma, por lo que el rendimiento en lenguas distintas del ingles no esta cuantificado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un finetune de una cadena de modelos base cuyos terminos conviene verificar antes de un despliegue comercial.
- La model card figura creada y actualizada en octubre de 2026; conviene comprobar si existen revisiones posteriores con cambios en pesos o en comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/Vela-2.0-9B
- Modelo base: https://huggingface.co/vllm-sr/Decision-2.0-Lux-9B
- Documentacion de vLLM Semantic Router: https://vllm-sr.ai/
- Blog de presentacion de Vela 2.0: https://vllm-sr.ai/blog/vela-2-0-open-foundation-routing-models
- Repositorio GitHub del enrutador semantico: https://github.com/vllm-project/semantic-router
- Coleccion Vela 2.0 en HuggingFace: https://huggingface.co/collections/vllm-sr/vela-20
- Motor vLLM (proyecto con el que se relaciona el autor, no especifico de este modelo): https://github.com/vllm-project/vllm
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Sitio web de vLLM: https://vllm.ai/
- Entrada de vLLM en Wikipedia: https://en.wikipedia.org/wiki/VLLM
