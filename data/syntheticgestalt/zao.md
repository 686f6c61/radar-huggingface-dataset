# syntheticgestalt/zao

## Resumen

ZAO es un modelo fundacional molecular desarrollado por SyntheticGestalt, empresa con sede en Shinjuku (Tokio) fundada en 2018 y dedicada a IA molecular para farmacéutica, química, materiales, agroquímica, cosmética y alimentación. Su función no es generar texto ni código, sino convertir la estructura química de moléculas pequeñas en representaciones vectoriales utilizables por otros sistemas de IA: dado un compuesto, devuelve un único embedding de 2.048 dimensiones que puede alimentar modelos posteriores de predicción de propiedades, similitud o filtrado en pipelines de descubrimiento de fármacos.

La particularidad técnica es que ZAO no codifica una sola conformación estática de la molécula, sino un conjunto de conformeros: por defecto procesa 10 conformeros por molécula en un único forward pass. La compañía describe esta representación como "4D", porque captura la forma tridimensional y la flexibilidad conformacional del compuesto. El checkpoint publicado tiene 222.692.501 parámetros (aproximadamente 223 M) y, según la nota de prensa de lanzamiento, se preentrenó sobre unos 11.000 millones de conformeros.

El modelo se publica junto a KOYA, un modelo generativo molecular de la misma casa, y llega con la afirmación de haber quedado primero en nueve tareas de benchmark públicas sin ajuste específico por tarea. Es relevante ahora porque cubre un nicho poco servido por los modelos fundacionales de propósito general: la representación de moléculas pequeñas con información conformacional explícita, en un formato de feature-extraction listo para integrarse en pipelines existentes. El acceso está restringido en HuggingFace y requiere aceptar las condiciones de la licencia sg-tvar-1.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible; modelo molecular que procesa conjuntos de conformeros en un único forward pass |
| Parametros totales | 222.692.501 (aproximadamente 223 M), según safetensors |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No aplica / no disponible: la entrada es un conjunto de conformeros (10 por molécula por defecto), no una secuencia de tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje natural, sino estructuras químicas) |
| Licencia | sg-tvar-1.0 (etiquetada como `license:other` en HuggingFace); acceso restringido con aceptación de condiciones |
| Formato de pesos | safetensors |
| Dimension de embedding de salida | 2.048 |
| Conformeros por molécula (por defecto) | 10 |
| Volumen de preentrenamiento | 11.000 millones de conformeros (la nota de prensa menciona también "aproximadamente 10.000 millones de compuestos") |
| Pipeline declarado | feature-extraction |
| Librería | `zao` |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La documentación disponible no detalla la arquitectura interna (tipo de bloque, número de capas, dimensiones ocultas ni mecanismo de atención). Lo que sí se especifica es el contrato de entrada y salida: el modelo recibe un conjunto de conformeros de una molécula pequeña —10 por defecto— y los procesa en un solo forward pass para producir un embedding agregado de 2.048 dimensiones. Esta decisión de diseño es la que la compañía denomina representación "4D": a las tres dimensiones espaciales se añade la variabilidad conformacional, de modo que el vector resultante codifica tanto la geometría como el grado de flexibilidad del compuesto. Frente a descriptores 2D o a una única conformación minimizada, esta aproximación pretende preservar información relevante para el reconocimiento molecular, como la existencia de estados conformacionales distintos que afectan a la unión a diana.

El preentrenamiento se realizó sobre unos 11.000 millones de conformeros, según el repositorio de GitHub, aunque la nota de prensa de lanzamiento habla de "aproximadamente 10.000 millones de compuestos". No se han publicado en la información proporcionada detalles sobre la composición exacta del corpus, las fuentes de estructuras, el número de tokens o ejemplos vistos, ni sobre si hubo etapas de ajuste con RLHF, DPO o preferencias. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal; en un modelo de representación molecular ese tipo de optimizaciones no aplica del mismo modo que en un LLM.

## Capacidades

- Generación de embeddings moleculares: convierte una molécula pequeña en un vector denso de 2.048 dimensiones apto para tareas downstream.
- Codificación conformacional múltiple: procesa 10 conformeros por molécula en una sola pasada, capturando flexibilidad y forma tridimensional.
- Extracción de características (feature-extraction): pensado como encoder congelado o ajustable para modelos predictivos posteriores.
- Similitud y búsqueda molecular: los embeddings permiten comparar compuestos, agruparlos o recuperar análogos estructurales.
- Integración en pipelines de descubrimiento de fármacos: sirve como etapa de featurización previa a modelos de propiedad, toxicidad o actividad.
- Evaluación zero-shot en tareas químicas: según la nota de prensa, obtiene primeros puestos en benchmarks públicos sin ajuste específico por tarea.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de un LLM.
- No es multimodal en el sentido habitual (visión, audio, texto): su modalidad de entrada es la estructura química.
- Capacidades multilingües: no aplica ni está documentado.

## Casos de uso

- Filtrado virtual de librerías químicas: generar embeddings para cientos de miles de compuestos y ordenarlos por similitud respecto a una diana o a un hit conocido, usando la similitud coseno sobre los vectores de 2.048 dimensiones. La ventaja frente a descriptores 2D es que incorpora flexibilidad conformacional, lo que reduce falsos positivos por compuestos rígidos.
- Modelos predictivos de propiedades (ADMET): usar ZAO como encoder congelado y entrenar una cabeza ligera de regresión o clasificación sobre los embeddings para predecir absorción, toxicidad o solubilidad con menos datos etiquetados.
- Búsqueda y deduplicación de compuestos: indexar una base interna de moléculas en un espacio vectorial y recuperar vecinos cercanos para detectar duplicados, series químicas o análogos andamio.
- Priorización en drug discovery: combinar el embedding con modelos de docking o de actividad para clasificar compuestos antes de la síntesis, reduciendo el número de candidatos que pasan a validación experimental.
- Optimización de lead compounds: comparar variantes de una misma serie química en el espacio de embeddings para identificar modificaciones que mantienen la geometría global pero alteran la flexibilidad de forma controlada.
- Materiales y química industrial: extender el mismo pipeline de featurización a moléculas pequeñas en agroquímica, cosmética o materiales, donde la conformación afecta a propiedades macroscópicas.
- Investigación en representaciones moleculares: servir de baseline conformacional frente a encoders 2D o basados en grafos en estudios académicos de quimioinformática.
- Generación aumentada con KOYA: usar ZAO para puntuar o filtrar en el espacio de embeddings las moléculas propuestas por KOYA, el modelo generativo de la misma casa, en un bucle de generación-filtrado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Observaciones |
|---|---|---|
| Nueve tareas públicas de benchmark molecular | Primera posición en las nueve, según la nota de prensa de SyntheticGestalt | Sin ajuste específico por tarea (zero-shot sobre el encoder preentrenado) |
| Valores numéricos por tarea (MMLU, HumanEval, GSM8K u otros) | No disponible | No aplicables a un modelo molecular; no se han publicado métricas detalladas en la información proporcionada |

No se han publicado resultados numéricos desglosados de benchmarks en la información disponible. La única afirmación cuantificable es el primer puesto en nueve tareas públicas sin fine-tuning, procedente de material promocional de la compañía y no verificada de forma independiente en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: con 222,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,89 GB (coincide con el tamaño de repo de 0,9 GB); en fp16 unos 0,45 GB; en int8 unos 0,22 GB. A esto hay que sumar el coste de generar y almacenar 10 conformeros por molécula, que suele dominar el tiempo total.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para los pesos; para procesar lotes grandes de moléculas conviene una A100, H100, L40S o RTX 4090 por throughput, no por memoria.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, e incluso en CPU para inferencia de una sola molécula.
- Opciones de despliegue: la librería oficial `zao` (declarada en HuggingFace) con pesos safetensors. No hay constancia de soporte en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no encajan con este contrato de entrada.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, el cuello de botella previsible es la generación de conformeros, no el forward pass del encoder de 223 M.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZAO | Encoder molecular (feature-extraction) | 222,7 M | 10 conformeros por molécula, salida 2.048 dim | sg-tvar-1.0, acceso restringido | HuggingFace (gated) y GitHub |
| KOYA | Modelo generativo molecular | No disponible | Estructura química | No disponible en la información | Lanzado junto a ZAO por SyntheticGestalt |
| Otros encoders moleculares (Uni-Mol, MolFormer, ChemBERTa y similares) | Encoders 2D/3D | No disponible | Grafos o SMILES | No disponible | No disponible en la información proporcionada |

La comparación directa con alternativas académicas no puede completarse con los datos disponibles: no se han proporcionado parámetros, contextos ni resultados de benchmarks de esos modelos en la documentación consultada, por lo que cualquier cifra sería inventada. La comparación más sólida es interna: ZAO es el encoder y KOYA el generador dentro de la misma familia lanzada por SyntheticGestalt.

## Limitaciones y advertencias

- Sesgos: no documentados. Al entrenarse sobre conformeros de origen presumiblemente público, puede infrarrepresentar químicas poco habituales (compuestos organometálicos, macromoléculas, productos naturales complejos).
- Riesgo de alucinación: no aplica en el sentido generativo, pero un embedding puede ser poco informativo para moléculas fuera de la distribución de entrenamiento sin que el modelo lo advierta; no hay señal de confianza publicada.
- Alcance limitado a moléculas pequeñas: no está diseñado para proteínas, ácidos nucleicos ni polímeros de gran tamaño.
- Dependencia de la generación de conformeros: si el generador de conformeros es deficiente, el embedding hereda ese error; la calidad del pipeline previo condiciona el resultado.
- Ambigüedad en las cifras de entrenamiento: 11.000 millones de conformeros frente a "aproximadamente 10.000 millones de compuestos" en la nota de prensa; conviene tratar ambas cifras con cautela.
- Idiomas: no aplica, pero esto implica que el modelo no puede usarse en tareas de texto sin un adaptador adicional.
- Licencia: sg-tvar-1.0, con acceso restringido que exige aceptar condiciones en HuggingFace. Es una licencia propia, no estándar, por lo que hay que revisar los términos concretos antes de cualquier uso comercial; la información disponible no detalla si se permite uso comercial, redistribución o despliegue en SaaS.
- Ausencia de benchmarks verificables de forma independiente: el "primer puesto en nueve tareas" proviene de material de la propia compañía.
- Madurez: el repositorio se creó en octubre de 2026 y no consta ecosistema de terceros, herramientas de conversión ni integraciones con frameworks habituales.
- Sin datos publicados sobre cuantización: no se puede asumir que existan versiones GGUF o int8 listas para usar.

## Enlaces

- HuggingFace: https://huggingface.co/syntheticgestalt/zao
- GitHub: https://github.com/syntheticgestalt/zao
- Nota de prensa oficial (EN): https://syntheticgestalt.com/news/202607-ZAO-and-KOYA-en
- Nota de prensa en EIN Presswire: https://www.einpresswire.com/article/927617590/syntheticgestalt-launches-molecular-ai-models-zao-and-koya
- Republicación en EIN News (Pharmaceuticals): https://pharmaceuticals.einnews.com/pr_news/927617590/syntheticgestalt-launches-molecular-ai-models-zao-and-koya
- Cobertura en Dealroom: https://app.dealroom.co/news/feed/syntheticgestalt-launches-molecular-ai-models-zao-and-koya-for-drug-discovery
