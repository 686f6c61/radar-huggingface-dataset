# younesmzn11/camembert-per-ner-france-inter

## Resumen

El modelo `younesmzn11/camembert-per-ner-france-inter` es un ajuste fino de tipo token classification basado en CamemBERT, la familia de modelos de lenguaje en francés derivada de la arquitectura RoBERTa. Su nombre indica que está especializado en el reconocimiento de entidades nombradas (NER) de la categoría PER (personas), y que el corpus de ajuste estaría relacionado con la emisora de radio francesa France Inter. El repositorio cuenta con 110.032.898 parámetros, un tamaño coherente con la base camembert-base, lo que confirma que se trata de un fine-tune sobre dicha base y no de un modelo entrenado desde cero.

Se publica exclusivamente en formato safetensors y es compatible con la librería transformers y con los endpoints de Hugging Face. El pipeline declarado es `token-classification`, por lo que su salida son etiquetas por token (por ejemplo BIO/IOB) y no texto generado: no es un modelo generativo ni conversacional.

La relevancia de este tipo de modelos es práctica: la extracción automática de menciones de personas en corpus franceses (transcripciones, prensa, archivos de audio) es una tarea habitual en anonimización, análisis de medios y enriquecimiento documental. No obstante, la model card publicada está vacía (es la plantilla automática de Hugging Face), no declara licencia, idiomas ni datos de entrenamiento, y el repositorio no registra descargas ni valoraciones, por lo que la información verificable es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (familia CamemBERT) |
| Parametros totales | 110.032.898 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite estándar de CamemBERT/RoBERTa; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors) |
| Idiomas soportados | francés (inferido del uso de CamemBERT y del nombre del modelo); no declarado en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de CamemBERT, un transformer encoder con atención completa y objetivo de modelado de lenguaje enmascarado, que sigue el diseño de RoBERTa. La base camembert-base se entrena sobre un subconjunto del corpus francés OSCAR (aproximadamente 138 GB de texto) y emplea un tokenizador SentencePiece con vocabulario de alrededor de 32.000 piezas. El recuento de 110 millones de parámetros de este repositorio coincide con dicha base, lo que respalda que se trata de un ajuste fino sobre ella.

No hay información publicada sobre el procedimiento de ajuste: ni el número de épocas, ni los hiperparámetros, ni la composición exacta del dataset (más allá de la referencia a France Inter que sugiere el nombre), ni si se aplicó alguna técnica de regularización o decodificación específica. La model card no documenta datos de entrenamiento, sesgos ni métricas. Tampoco se especifica si el etiquetado sigue un esquema BIO, IOB2 u otro, ni el conjunto completo de clases diferentes de PER.

## Capacidades

- Reconocimiento de entidades nombradas de tipo persona (PER) en texto en francés: identifica menciones de individuos a nivel de token y asigna etiquetas de secuencia.
- Clasificación por token sobre entradas de hasta 512 tokens, adecuada para párrafos cortos, titulares o intervenciones breves.
- Salida compatible con el pipeline `token-classification` de transformers, integrable en flujos de post-proceso para reconstruir entidades completas.
- No es un modelo generativo: no produce texto libre, resúmenes ni respuestas conversacionales.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- Capacidad multilingüe: no disponible; todo apunta a un único idioma (francés).
- No se declaran capacidades multimodales (visión, audio) ni modos especiales de razonamiento.

## Casos de uso

- Anonimización y pseudonimización de documentos: el modelo etiqueta menciones de personas para que un pipeline posterior las enmascare o sustituya, útil en el tratamiento de datos personales bajo normativas de protección de datos.
- Extracción de menciones en transcripciones de radio: a partir del texto transcrito de programas de France Inter, permite localizar e inventariar las personas citadas para análisis editorial o de audiencia.
- Monitorización de medios: seguimiento de la presencia de figuras públicas en un corpus de prensa o emisiones, generando series temporales de menciones por persona.
- Enriquecimiento de bases de datos periodísticas: etiquetado automático de archivos documentales para habilitar búsquedas por persona mencionada y no solo por texto libre.
- Preprocesado para pipelines de NLP más complejos: la detección de entidades PER sirve como paso previo a la resolución de correferencia, la extracción de relaciones o la construcción de grafos de conocimiento.
- Indexado y búsqueda semántica en archivos audiovisuales: combinado con un sistema de transcripción, permite crear índices navegables por personas en catálogos de audio o vídeo.
- Control de cumplimiento en flujos documentales: revisión automatizada de que ciertos nombres no aparezcan en documentos que deben publicarse sin datos identificativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card está vacía y no incluye métricas de evaluación (precisión, recall, F1) ni conjuntos de validación. Tampoco se han encontrado datos de rendimiento en la búsqueda web.

## Requisitos de hardware

- Inferencia en FP32: los 110 millones de parámetros ocupan aproximadamente 440 MB, por lo que el modelo completo cabe sin dificultad en cualquier GPU de consumo actual.
- Inferencia en FP16: el peso se reduce a unos 220 MB, con requisitos de VRAM muy bajos.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090) es más que suficiente; el cuello de botella será la longitud de secuencia y el tamaño de lote, no el modelo.
- Funciona en CPU: al ser un encoder de tamaño base, es viable ejecutarlo en CPU para volúmenes moderados de texto, con latencia mayor pero sin requisitos de VRAM.
- Opciones de despliegue: pipeline de transformers, exportación a ONNX, TorchScript o modelos optimizados con herramientas como Optimum; también puede servirse mediante TGI u otros servidores de inferencia compatibles con transformers.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| younesmzn11/camembert-per-ner-france-inter | 110 M | 512 tokens (CamemBERT) | NER (PER) en francés | no disponible | Hugging Face (0 descargas) |
| camembert-base | 110 M | 512 tokens | Modelo base en francés (MLM) | MIT (según su repositorio original) | Hugging Face |
| Jean-Baptiste/camembert-ner | ~110 M | 512 tokens | NER en francés | no disponible | Hugging Face |
| flair/ner-french | no disponible | no disponible | NER en francés | no disponible | Hugging Face |

Nota: los datos de los modelos comparativos proceden de sus repositorios públicos y pueden variar; no se dispone de métricas comparativas de rendimiento para este modelo concreto.

## Limitaciones y advertencias

- Model card vacía: no hay documentación sobre datos de entrenamiento, sesgos, métricas ni uso previsto, lo que dificulta evaluar su fiabilidad.
- Licencia no declarada: al no especificarse licencia, no se puede asumir permiso para uso comercial; conviene consultar al autor antes de utilizarlo en producción.
- Sesgos potenciales: al derivar de camembert-base (entrenado sobre OSCAR), puede heredar sesgos de representación presentes en el corpus original, acentuados por un ajuste fino sobre una única fuente (France Inter).
- Riesgo de alucinación de entidades: como todo modelo NER, puede marcar como persona términos que no lo son o dejar menciones sin detectar, especialmente con nombres poco frecuentes o variantes ortográficas.
- Limitación de contexto: las entradas superiores a 512 tokens deben fragmentarse, lo que puede romper entidades a caballo entre fragmentos si no se solapan correctamente.
- Especialización estrecha: solo contempla la categoría PER (según el nombre); si se necesitan organizaciones, localizaciones u otras clases, el modelo probablemente no las cubra.
- Idioma: no hay confirmación de multilingüismo; se debe asumir uso exclusivo en francés.
- Repositorio sin tracción: 0 descargas y 0 likes, sin señales de validación por parte de la comunidad ni de mantenimiento.
- Ausencia de evaluación: sin métricas publicadas, no hay forma de estimar su precisión frente a alternativas consolidadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/younesmzn11/camembert-per-ner-france-inter
- Modelo base CamemBERT: https://huggingface.co/almanach/camembert-base
- Paper de CamemBERT (Martin et al., 2019): https://arxiv.org/abs/1911.03894
- Paper referenciado en las etiquetas del modelo (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Librería transformers: https://github.com/huggingface/transformers

Nota: la búsqueda web realizada no devolvió enlaces relevantes para este modelo; los resultados obtenidos correspondían a herramientas de generación de NFT, sin relación con el modelo.
