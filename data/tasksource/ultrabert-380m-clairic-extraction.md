# tasksource/UltraBERT-380M-clairic-extraction

## Resumen

UltraBERT-380M-clairic-extraction es un modelo de extracción de información desarrollado por tasksource (Damien Sileo) y publicado en HuggingFace. Se trata de un fine-tuning de dmis-lab/UltraBERT-380M, un encoder de 377,5 millones de parámetros, especializado en una tarea concreta: dado un texto y un conjunto de campos descritos mediante instrucciones cortas, devolver los spans del texto que responden a cada campo. Los campos pueden formularse como preguntas ("¿Cuál es el importe total?") o como tipos de entidad ("Todas las empresas mencionadas"), de modo que un único modelo cubre tanto question answering extractivo como reconocimiento de entidades nombradas (NER).

La relevancia del modelo radica en su interfaz unificada: en lugar de desplegar un modelo distinto por tarea, se le pasa un diccionario de campos con sus instrucciones y devuelve, para cada uno, una lista de spans (uno, varios o ninguno). El modelo etiqueta los tokens del texto con esquema B/I/O condicionado por la instrucción, con una longitud máxima de entrada de 2048 tokens. Es el hermano mayor de UltraBERT-150M-clairic-extraction, con la misma interfaz pero mayor precisión, especialmente en campos de tipo lista y en la capacidad de dejar un campo vacío cuando el texto no contiene respuesta, a cambio de aproximadamente 2,5 veces más cómputo.

El modelo se distribuye con licencia Apache 2.0 y soporta únicamente inglés. No está afiliado a Cloudflare; la denominación "Clairic-style" hace referencia al formato de petición, no a un producto de dicha empresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UltraBERT (encoder tipo transformer, requiere `trust_remote_code=True`) |
| Parametros totales | 377.540.611 (380M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de dmis-lab/UltraBERT-380M, un encoder de 380 millones de parámetros con arquitectura propia que requiere código remoto (`trust_remote_code=True`) para cargarse con `AutoModelForTokenClassification`. La cabeza de salida es de token classification con tres etiquetas (0 = O, 1 = B, 2 = I), y la predicción está condicionada por la instrucción del campo, que se codifica junto con el texto como un par (instrucción, texto) con truncamiento solo en el segundo segmento.

El entrenamiento se realizó sobre la configuración `extraction` del dataset tasksource-jev-typed-decisions (release v2026.10.24.1), con 1 millón de pares instrucción/texto y 60.000 pasos. Esa configuración agrupa datasets de QA extractivo (SQuAD 2.0, Natural Questions, HotpotQA, NewsQA, DuoRC, QuAC, CUAD, Qasper, TimeQA, WebSRC, SWDE y otros) y de span tagging (CoNLL-2003, OntoNotes, Few-NERD, WNUT, CrossNER, NER biomédico, legal y financiero, skills, aspects, keyphrases y otros), más documentos generados de forma procedural. Los datasets originales se reescribieron como pares (instrucción, texto, spans). No se documenta en la información disponible el uso de RLHF o DPO; se trata de un fine-tuning supervisado sobre la tarea de etiquetado.

## Capacidades

- Extracción de spans condicionada por instrucción: dado un texto y un conjunto de campos, devuelve para cada campo la lista de spans coincidentes.
- Question answering extractivo: los campos pueden formularse como preguntas ("What is the total due?").
- Reconocimiento de entidades nombradas: los campos pueden formularse como tipos de entidad ("Every company mentioned in the text").
- Campos de tipo lista: devuelve todos los spans de una misma categoría presentes en el texto.
- Abstención: devuelve lista vacía cuando el texto no contiene respuesta para un campo.
- Procesamiento por lotes de múltiples campos sobre un mismo texto en una sola pasada (el ejemplo de la model card codifica todos los campos a la vez con padding).
- Soporte de offsets de caracteres mediante `return_offsets_mapping`, lo que permite reconstruir los spans sobre el texto original.
- No se documentan capacidades de generación de texto, razonamiento libre, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Extracción de datos de facturas y documentos financieros: el modelo puede recibir un texto de factura y un conjunto de campos (número de factura, empresas, importe total, teléfono de contacto) y devolver los spans correspondientes, como muestra el ejemplo de la model card con "INV-2291", "Acme Corp", "Globex" y "$1,240.50".
- Procesamiento de contratos y documentos legales: con datasets legales en el entrenamiento (CUAD, NER legal), puede extraer cláusulas, partes intervinientes y fechas de textos contractuales usando campos descritos como instrucciones.
- Enriquecimiento de documentos biomédicos: la inclusión de NER biomédico en el entrenamiento permite extraer entidades clínicas y términos especializados de literatura o informes.
- Anonimización y detección de PII: definiendo campos como "nombres de persona", "correos electrónicos" o "números de teléfono", el modelo devuelve los spans a redactar en un pipeline de preprocesado.
- Estructuración de currículos y ofertas de empleo: con datasets de skills en el entrenamiento, puede extraer habilidades, puestos y tecnologías de descripciones laborales para alimentar bases de datos estructuradas.
- Extracción de keyphrases y aspectos en análisis de opiniones: los datasets de keyphrases y aspects permiten usar el modelo para identificar términos clave y aspectos de producto en reseñas.
- Indexación y búsqueda sobre documentos largos: con 2048 tokens de contexto y procesamiento por lotes de campos, puede extraer metadatos estructurados de páginas web o artículos (WebSRC, Qasper) para motores de búsqueda internos.

## Benchmarks y rendimiento

Evaluación en el split de test de la configuración `extraction` (revisión v2026.10.20.7), 100 filas por fuente, excluidas las fuentes generadas proceduralmente. Los campos de tipo *text* se puntúan con SQuAD F1 (la respuesta vacía cuenta como respuesta); los de tipo *list* con micro F1 sobre valores normalizados. Las puntuaciones son medias sobre fuentes.

| Modelo | Parámetros | QA (F1) | NER / listas de spans (F1) |
|---|---|---|---|
| **UltraBERT-380M-clairic-extraction** | 380M | **0.756** | **0.750** |
| UltraBERT-150M-clairic-extraction | 150M | 0.720 | 0.702 |
| gliner-multitask-large-v0.5 | 440M | 0.474 | 0.408 |
| deberta-v3-base-squad2 | 184M | 0.498 | 0.060 |

Fuera de dominio (tests de MRQA no vistos en entrenamiento, más FinEntity), F1:

| Modelo | BioASQ | RACE | RelationExtraction | TextbookQA | FinEntity | Media |
|---|---|---|---|---|---|---|
| **UltraBERT-380M-clairic-extraction** | 0.626 | 0.412 | 0.870 | 0.482 | 0.717 | 0.622 |
| gliner-multitask-large-v0.5 | **0.643** | **0.458** | **0.899** | **0.545** | **0.913** | **0.692** |

Advertencia del autor: las fuentes de test son las mismas que las de entrenamiento (sus splits de test), mientras que las líneas base las ven en gran medida en zero-shot, por lo que la primera tabla mide rendimiento en estas tareas y no en tareas no vistas. En dominio no visto, GLiNER-multitask-large-v0.5 supera al modelo en todas las columnas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32, los 377,5 millones de parámetros ocupan aproximadamente 1,5 GB (el repositorio pesa 1,5 GB); en fp16/bf16, alrededor de 0,75 GB. El uso real depende del tamaño de lote y de la longitud de secuencia (hasta 2048 tokens), que incrementa la memoria de activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM puede ejecutar el modelo con comodidad; una RTX 4090, A100 o H100 permiten lotes grandes y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 4090 y superiores, así como en GPUs de portátil con VRAM suficiente.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` (`AutoModelForTokenClassification` con `trust_remote_code=True`). No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI; al requerir código remoto para la arquitectura UltraBERT, la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | QA F1 (in-domain) | Listas F1 (in-domain) | Media F1 out-of-domain | Licencia |
|---|---|---|---|---|---|---|
| UltraBERT-380M-clairic-extraction | 380M | 2048 | 0.756 | 0.750 | 0.622 | apache-2.0 |
| UltraBERT-150M-clairic-extraction | 150M | no disponible | 0.720 | 0.702 | no disponible | no disponible en la información |
| gliner-multitask-large-v0.5 | 440M | no disponible | 0.474 | 0.408 | 0.692 | no disponible en la información |
| deberta-v3-base-squad2 | 184M | no disponible | 0.498 | 0.060 | no disponible | no disponible en la información |

El modelo ofrece la mejor puntuación in-domain de la comparativa, pero GLiNER-multitask-large-v0.5 lo supera en todas las pruebas fuera de dominio documentadas. UltraBERT-150M-clairic-extraction es la alternativa de menor coste computacional (aproximadamente 2,5 veces menos cómputo) con una pérdida de precisión moderada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta rendimiento multilingüe.
- Ventana de contexto limitada a 2048 tokens, con truncamiento del texto si se excede.
- Riesgo de sobreajuste a las tareas de entrenamiento: el autor advierte que las fuentes de test coinciden con las de entrenamiento, por lo que las cifras in-domain no reflejan el rendimiento en tareas no vistas; fuera de dominio, GLiNER-multitask-large-v0.5 es superior en todas las pruebas publicadas.
- Posible riesgo de alucinación de spans: al ser un modelo extractivo, los spans devueltos pertenecen al texto, pero puede seleccionar fragmentos incorrectos o dejar vacío un campo que sí tiene respuesta.
- Licencia del modelo Apache 2.0, pero los datos de entrenamiento incluyen fuentes con licencia solo para uso no comercial (por ejemplo GUM y PreCo); debe consultarse la tarjeta del dataset para verificar las licencias por fuente antes de un uso comercial.
- Requiere `trust_remote_code=True` para cargar la arquitectura UltraBERT, lo que implica ejecutar código del repositorio del modelo.
- No se documentan capacidades de generación, razonamiento libre, tool calling ni agentes; su uso está restringido a extracción de spans.
- No se documentan sesgos específicos ni cuantizaciones oficiales en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tasksource/UltraBERT-380M-clairic-extraction
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Modelo hermano de 150M: https://huggingface.co/tasksource/UltraBERT-150M-clairic-extraction
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Repositorio tasksource: https://github.com/sileod/tasksource
- Baseline GLiNER-multitask-large-v0.5: https://huggingface.co/knowledgator/gliner-multitask-large-v0.5
- Baseline deberta-v3-base-squad2: https://huggingface.co/deepset/deberta-v3-base-squad2
- Paper tasksource (LREC-COLING 2024): https://aclanthology.org/2024.lrec-main.1361/
