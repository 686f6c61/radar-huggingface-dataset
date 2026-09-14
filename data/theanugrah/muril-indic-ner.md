# theanugrah/muril-indic-ner

## Resumen

`theanugrah/muril-indic-ner` es una conversión a ONNX del modelo de reconocimiento de entidades nombradas (NER) `vaibhav006/indic-ner-muril-naamapadam`, que a su vez es un ajuste fino de MuRIL-base (`google/muril-base-cased`) sobre el corpus Naamapadam de AI4Bharat. Se trata, por tanto, de un encoder tipo BERT de unos 236 millones de parámetros, entrenado para clasificación de tokens, no de un modelo generativo. Resuelve la extracción de personas, organizaciones y localizaciones en once lenguas indexadas de la India: asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, panyabí, tamil y telugu.

Su relevancia no está en el rendimiento bruto, sino en el empaquetado: el autor lo publicó porque no existía una build ONNX de un modelo NER para lenguas indicas que fuese a la vez utilizable y con licencia permisiva. El repositorio contiene un `model.onnx` de unos 227 MB cuantizado a int8 de forma dinámica y por canal, un `vocab.txt` regenerado y un `config.json` con las siete etiquetas. El objetivo declarado es ejecutarlo en proceso dentro de un reconocedor .NET (`Microsoft.ML.OnnxRuntime` + `BertTokenizer`), sin Python ni servidor de inferencia en tiempo de ejecución.

La licencia es Apache-2.0, heredada tanto de MuRIL como de Naamapadam. El repositorio es muy reciente y no tiene descargas ni valoraciones, por lo que no cuenta con validación de la comunidad. La model card documenta con detalle tres decisiones de exportación (cuantización por canal, vocabulario con huecos rellenados y ajustes del tokenizador) que, mal reproducidas, producen un modelo silenciosamente roto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MuRIL-base), con cabeza de clasificación de tokens |
| Parámetros totales | ~236 millones (estimación derivada de la arquitectura MuRIL-base; no confirmado en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (MuRIL-base, del que deriva, trabaja con 512 tokens) |
| Tipos de cuantización | int8 dinámica por canal (`--per_channel`) en ONNX; el modelo base ofrece pesos PyTorch en fp32 |
| Idiomas soportados | asamés (as), bengalí (bn), guyaratí (gu), hindi (hi), canarés (kn), malayalam (ml), maratí (mr), oriya (or), panyabí (pa), tamil (ta), telugu (te) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, ~227 MB); no hay safetensors ni GGUF en este repositorio |
| Etiquetas | 7: `B-LOC`, `B-ORG`, `B-PER`, `I-LOC`, `I-ORG`, `I-PER`, `O` (ids 0-6) |
| Tokenizador | WordPiece, cased, sin eliminación de acentos (`do_lower_case: false`, `strip_accents: false`) |
| Pipeline | token-classification |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de MuRIL-base: un encoder transformer bidireccional de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con una tabla de embeddings de 197.285 × 768 tokens que domina el cómputo y el tamaño del modelo (unos 151,5 millones de parámetros solo en el embedding). Sobre esa base se añade una cabeza de clasificación por token. El ajuste fino se realizó sobre Naamapadam, el corpus de entidades nombradas para lenguas indicas de AI4Bharat. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; al ser una tarea extractiva, no se emplean técnicas de alineación por preferencias.

La innovación relevante está en la exportación y no en el entrenamiento. Primero, el modelo se exportó con `optimum-cli export onnx --task token-classification`, con una diferencia máxima absoluta de logits de ~2e-4 frente a la referencia en PyTorch, por encima de la tolerancia de 1e-5 del exportador pero muy por debajo de lo necesario para cambiar una etiqueta predicha. Segundo, la cuantización int8 es dinámica y **por canal**, no por tensor: con escala única, las filas atípicas de la tabla de embeddings fijan un solo factor y el resto se colapsa hacia cero, de modo que el modelo carga, ejecuta y etiqueta todos los tokens como `O` con logits casi idénticos, simulando un modelo malo cuando los pesos originales son correctos. Tercero, el `vocab.txt` se regeneró desde `tokenizer.json` rellenando 27 identificadores sin token del espacio 0-197.284 con marcadores `[unused<id>]`, de forma que el número de línea coincida con el id del token; sin este relleno, todos los ids desde 202 en adelante se desplazan y el corpus se tokeniza mal de forma silenciosa.

## Capacidades

- Reconocimiento de entidades nombradas extractivo en once lenguas indicas, limitado a tres tipos: persona (PER), organización (ORG) y localización (LOC), más la clase `O`.
- Clasificación a nivel de token con esquema B-/I-, pensada para agregarse a nivel de palabra (una continuación `##` hereda la etiqueta de la primera pieza).
- Ejecución en proceso sin Python y sin servidor de inferencia, mediante ONNX Runtime y un tokenizador BERT nativo.
- No genera texto: no hay modo *thinking*, ni resumen, ni traducción, ni respuesta a instrucciones.
- No soporta *tool calling* ni *function calling*, ni orquestación de agentes o razonamiento multi-paso.
- No tiene capacidades de visión, audio ni multimodalidad.
- Inferencia ligera en CPU gracias a los 227 MB en int8, apta para procesamiento por lotes.
- Multilingüismo restringido al conjunto de lenguas indicas listado; no cubre español ni inglés.

## Casos de uso

- Enriquecimiento de pipelines editoriales: extraer personas, organizaciones y lugares de titulares y cuerpos de noticia en hindi y otras lenguas indicas para poblar etiquetas temáticas, grafos de entidades o índices de búsqueda.
- Anonimización previa a modelos generativos: detectar y enmascarar nombres de persona y organización en documentos legales, sanitarios o de recursos humanos en lenguas indicas antes de enviarlos a un LLM externo, reduciendo la exposición de datos personales.
- Construcción de bases de conocimiento: alimentar un grafo con entidades y menciones extraídas de corpus periodísticos o enciclopédicos, usando las etiquetas B-/I- agregadas a nivel de palabra como unidades de mención.
- Cumplimiento y KYC: localizar organizaciones y localizaciones en contratos, escrituras o expedientes para revisiones de contraparte, siempre reajustando el umbral de confianza (ver limitaciones).
- Digitalización de archivos a gran escala: al ocupar 227 MB y ejecutarse en CPU mediante ONNX Runtime, permite procesar lotes masivos de documentos escaneados y transcritos sin coste de GPU.
- Integración embebida en aplicaciones de escritorio o servicios .NET: es el caso de uso declarado por el autor (`Microsoft.ML.OnnxRuntime` + `BertTokenizer`), útil cuando no se puede desplegar Python ni un servidor de inferencia.
- Etiquetado distante para crear datos de entrenamiento: usar las extracciones de alta confianza como pseudoetiquetas para ajustar modelos NER más pequeños o específicos de dominio.
- Moderación y análisis de contenido en foros o redes: identificar organizaciones y localizaciones citadas en conversaciones multilingües para enrutado temático, con la cautela de que el modelo se entrenó sobre datos principalmente periodísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de F1, precisión o recall sobre Naamapadam ni sobre ningún otro conjunto, y la búsqueda web asociada no devolvió ningún resultado relevante sobre este modelo.

El único dato cuantitativo de calidad aportado por el autor es de calibración, no de exactitud: sobre 200 titulares en hindi, el modelo no produjo ninguna mención por encima de 0,90 y solo 26 de 294 menciones superaron 0,75, mientras que la banda 0,60-0,75 contenía entidades correctas como दिल्ली, मुंबई, पाकिस्तान, पंजाब, श्रीलंका y कांग्रेस. Por debajo de ~0,60 los tramos extraídos siguen siendo mayoritariamente correctos, pero los tipos de entidad se degradan antes que los límites del tramo.

| Métrica | Valor |
|---|---|
| F1 / precisión / recall | no disponible |
| Comparación con modelos similares | no disponible |
| Diferencia de logits ONNX vs. PyTorch | ~2e-4 (máximo absoluto) |
| Calibración en hindi (200 titulares) | 0 menciones > 0,90; 26 de 294 menciones > 0,75 |

## Requisitos de hardware

- Almacenamiento: ~227 MB para `model.onnx` más ~3,1 MB de `vocab.txt`; el repositorio completo ocupa 0,2 GB.
- VRAM estimada para inferencia: inferior a 1 GB con la versión int8; no requiere GPU en absoluto.
- GPU recomendadas: ninguna en particular. Cabe en cualquier GPU de consumo, desde una GTX 1050 de 4 GB hasta una RTX 4090, e incluso en gráficas integradas. Una A100 o H100 sería un desperdicio de recursos para 236 millones de parámetros.
- CPU: es el entorno natural de despliegue; la cuantización int8 dinámica está pensada para inferencia en CPU.
- Opciones de despliegue: ONNX Runtime en Python, C#, C++ o Java; `Microsoft.ML.OnnxRuntime` en el escenario .NET descrito; exportación vía Optimum. No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo y no se distribuye en GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones, y el rendimiento dependerá del número de secuencias, de su longitud y de si se agrupan en lote.
- Para documentos largos hay que trocear la entrada: MuRIL-base trabaja con ventanas de 512 tokens, longitud que la model card no confirma explícitamente para esta build.

## Comparativa con modelos similares

No se dispone de comparativas de rendimiento publicadas entre este modelo y alternativas de la misma categoría. La comparación siguiente es estructural y de licencia, no de exactitud.

| Modelo | Tipo | Formato | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| `theanugrah/muril-indic-ner` | NER indico (MuRIL + Naamapadam) | ONNX int8 por canal | ~236 M (estimado) | no disponible (512 tokens en MuRIL-base) | Apache-2.0 |
| `vaibhav006/indic-ner-muril-naamapadam` | NER indico, mismo ajuste fino | PyTorch fp32 | ~236 M (estimado) | no disponible | Apache-2.0 |
| `google/muril-base-cased` | Encoder multilingüe preentrenado, sin cabeza NER | PyTorch | ~236 M (estimado) | 512 tokens | Apache-2.0 |

Frente al modelo base en PyTorch, esta build ofrece un cuarto del peso y la posibilidad de ejecutarse sin Python, a cambio de la pérdida de precisión numérica asociada a int8 (diferencia de logits ~2e-4). Frente a MuRIL-base sin ajustar, aporta la cabeza de clasificación entrenada sobre Naamapadam. El autor afirma que, en el momento de la publicación, no existía otra build ONNX de un modelo NER indico que fuese a la vez usable y con licencia permisiva, pero no cita alternativas concretas ni comparaciones medidas.

## Limitaciones y advertencias

- Alcance funcional muy estrecho: solo detecta PER, ORG y LOC. No extrae fechas, cantidades, productos ni otras categorías de entidad.
- Calibración plana: ningún umbral por encima de 0,90 sobre el conjunto de prueba en hindi y solo 26 de 294 menciones por encima de 0,75. Un umbral importado de un modelo NER en inglés descartará la mayoría de los aciertos; el autor recomienda trabajar en la banda 0,60-0,75.
- Riesgo de errores de tipo antes que de límites: por debajo de ~0,60 los tramos siguen siendo correctos pero las etiquetas de tipo se degradan primero.
- Agregación obligatoria a nivel de palabra: leer las etiquetas por token puede devolver medio nombre si el modelo reabre un `B-` en una pieza de continuación.
- Dependencia crítica del tokenizador: es cased y no elimina acentos, algo imprescindible porque los signos vocálicos del devanagari son letras, no diacríticos (eliminarlos convierte दिल्ली en दिलली). Un pre-tokenizador BERT que corte por «no letra o dígito» partirá las palabras en cada marca combinante; hay que incluir `\p{M}` en la clase de caracteres de palabra.
- Vocabulario no sustituible: el `vocab.txt` se regeneró rellenando 27 huecos con `[unused<id>]` para que la línea coincida con el id. Usar otro vocabulario o reordenar las líneas provoca una tokenización incorrecta y silenciosa.
- La cuantización debe reproducirse **por canal**. Una exportación int8 por tensor produce un modelo que carga y etiqueta todo como `O` con logits casi idénticos, un fallo difícil de diagnosticar.
- Sesgos heredados: MuRIL y Naamapadam se construyeron principalmente sobre texto periodístico y enciclopédico, por lo que la cobertura en registro informal, redes sociales, dominios técnicos y variedades dialectales es incierta.
- No es un modelo generativo, así que no alucina texto, pero sí puede producir falsos positivos, falsos negativos y menciones mal tipadas.
- Cobertura lingüística cerrada: once lenguas indicas; no soporta español ni inglés.
- Contexto limitado: los documentos largos deben trocearse en ventanas compatibles con el encoder.
- Licencia Apache-2.0: permite uso comercial, pero obliga a declarar las modificaciones realizadas, obligación que el propio autor explicita en la model card.
- Repositorio sin tracción: 0 descargas, 0 likes y sin validación independiente de la comunidad.
- No hay métricas publicadas de exactitud ni de latencia, por lo que cualquier despliegue en producción debería ir precedido de una evaluación propia sobre datos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theanugrah/muril-indic-ner
- Modelo base (PyTorch, fp32): https://huggingface.co/vaibhav006/indic-ner-muril-naamapadam
- Encoder original MuRIL: https://huggingface.co/google/muril-base-cased
- Dataset Naamapadam de AI4Bharat: https://huggingface.co/datasets/ai4bharat/naamapadam
- Herramienta de exportación empleada: `optimum-cli export onnx --task token-classification` (Optimum, HuggingFace)
- Runtime de inferencia citado por el autor: `Microsoft.ML.OnnxRuntime` con `BertTokenizer`
- Nota sobre la búsqueda web: no se encontró ningún resultado relevante sobre este modelo; los resultados devueltos correspondían a un parque industrial de Ordos (China), ajenos por completo al contenido de esta ficha.
