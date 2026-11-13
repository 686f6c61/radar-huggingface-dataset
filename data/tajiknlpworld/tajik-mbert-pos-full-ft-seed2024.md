# TajikNLPWorld/tajik-mbert-pos-full-ft-seed2024

## Resumen

El modelo `TajikNLPWorld/tajik-mbert-pos-full-ft-seed2024` es un checkpoint de clasificación de etiquetas gramaticales (POS, *part of speech*) para tayiko, desarrollado por el colectivo TajikNLPWorld. Se trata de un ajuste fino completo (*full fine-tuning*) de `google-bert/bert-base-multilingual-cased` sobre el corpus `TajikNLPWorld/tajik-pos-corpus`, y forma parte de un estudio controlado de tres semillas que compara ajuste fino completo frente a LoRA. El modelo asigna una de 28 categorías POS tayikas a una forma léxica aislada escrita en cirílico tayiko.

La relevancia del modelo es doble. Por un lado, aborda una tarea de NLP de bajos recursos (tayiko) con una metodología reproducible: split fijo disjunto por forma léxica, semillas emparejadas, elección de checkpoint por Macro-F1 de validación y serialización verificada mediante huella SHA-256. Por otro, publica resultados de evaluación cruzada con un corpus externo (`TajikMorphCorpus`), lo que permite calibrar expectativas sobre generalización fuera de dominio.

Es importante subrayar que **no es un etiquetador POS contextual**: el modelo recibe palabras aisladas, no secuencias, por lo que no resuelve ambigüedades gramaticales dependientes del contexto oracional. Con 177,8 M de parámetros (100 % entrenables) y licencia Apache 2.0, está pensado para investigación y NLP exploratorio, no para anotación gramatical autoritativa sin revisión experta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base, multilingüe con casing) + cabeza de clasificación de secuencia |
| Parametros totales | 177.874.972 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens (longitud máxima de secuencia en entrenamiento; entradas de una sola palabra) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; el repo contiene safetensors en precisión completa) |
| Idiomas soportados | tayiko (`tg`); base multilingüe heredada de mBERT |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), con tokenizer, `labels.json` y metadatos JSON |
| Tarea | Clasificación de texto a nivel de palabra (28 clases POS) |
| Modelo base | `google-bert/bert-base-multilingual-cased` (revisión `3f076fdb1ab68d5b2880cb87a0886f315b8146f8`) |
| Dataset de entrenamiento | `TajikNLPWorld/tajik-pos-corpus` (revisión `797ea46fe95cf086832a500bea0582001368b7a8`) |
| Dataset de evaluación externa | `TajikNLPWorld/TajikMorphCorpus` (revisión `b29f8230724ee4d305423e46691f65dd2f422120`) |
| Tamano del repo | 0,7 GB |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |

## Arquitectura y entrenamiento

El modelo es un BERT base multilingüe (12 capas, *hidden size* 768, 12 cabezas de atención, vocabulario multilingüe con casing) al que se le añade una cabeza lineal de clasificación sobre el token `[CLS]` para producir 28 logits, uno por categoría POS tayika. El ajuste es completo: los 177.874.972 parámetros son entrenables (100 %), sin congelación ni adaptadores. La longitud máxima de secuencia es de 64 tokens, coherente con la naturaleza de la tarea (formas léxicas aisladas).

El protocolo de entrenamiento está documentado con detalle: 52.508 registros antes del split, divididos de forma fija y disjunta por forma léxica normalizada en 42.017 de entrenamiento, 5.232 de validación y 5.259 de test (semilla de split 42). Se entrenaron 5 épocas con learning rate 2e-5, batch por dispositivo 8, acumulación de gradiente 4 (batch efectivo 32) y entropía cruzada ponderada con pesos de frecuencia inversa en raíz cuadrada calculados solo sobre el split de entrenamiento. El mejor checkpoint se seleccionó por Macro-F1 de validación. El entrenamiento se ejecutó en una NVIDIA L4 con BF16, usando Transformers 5.22.2, PEFT 0.21.2 y Datasets 5.2.0.

Como control de calidad de la reproducibilidad, el autor verificó la serialización y recarga del modelo mediante una huella SHA-256 del estado completo y la coincidencia de predicciones en sondas. El estudio empareja esta semilla (2024) con las semillas 42 y 123 para comparar métodos; la media de Macro-F1 en dominio a 28 clases para ajuste fino completo en las tres semillas es 0,5443 ± 0,0450 (desviación estándar muestral).

## Capacidades

- Clasificación de formas léxicas tayikas aisladas en una de 28 categorías POS del corpus original, con etiquetas de salida en tayiko.
- Asignación de etiqueta a nivel de palabra (word-level classification), no etiquetado de secuencias.
- Manejo de escritura cirílica tayika mediante el tokenizer multilingüe heredado de mBERT.
- Inferencia por lotes con `AutoModelForSequenceClassification` de Transformers; compatible con Text Embeddings Inference y endpoints según los tags del repo.
- Capacidad multilingüe latente por el modelo base, aunque el ajuste está orientado exclusivamente al tayiko.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*: es un clasificador discriminativo, no un modelo generativo.
- No resuelve ambigüedad gramatical dependiente del contexto, al no recibir secuencias oracionales.

## Casos de uso

- Anotación asistida de corpus tayikos: preetiquetar formas léxicas con su categoría POS para que lingüistas revisen y corrijan, reduciendo el coste de anotación manual en un corpus de bajos recursos.
- Construcción de léxicos POS: procesar listas de formas léxicas extraídas de corpus y generar un diccionario palabra-categoría como punto de partida para recursos léxicos tayikos.
- Filtrado y normalización de vocabulario: clasificar formas léxicas por categoría para tareas de limpieza, deduplicación o agrupación morfológica preliminar en pipelines de NLP tayiko.
- Investigación metodológica en NLP de bajos recursos: servir como checkpoint de referencia en estudios de comparación entre ajuste fino completo y LoRA, con semillas emparejadas y splits fijos reproducibles.
- Evaluación de generalización cruzada: usar el checkpoint junto con `TajikMorphCorpus` para medir la degradación por cambio de dominio y por formas léxicas no vistas, informando el diseño de futuros modelos.
- Docencia y experimentación: ejemplo reproducible de fine-tuning de mBERT para clasificación de texto con desbalanceo de clases, útil en cursos de NLP y en la formación de investigadores.
- Componente auxiliar en pipelines lingüísticos: aunque no es un etiquetador contextual, puede aportar una señal débil de categoría léxica que se combine con reglas o con un modelo contextual posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor para este checkpoint concreto (test, no entrenamiento):

| Evaluación | Ejemplos | Accuracy | Macro-F1 | Weighted-F1 |
|---|---:|---:|---:|---:|
| Test en dominio (28 etiquetas POS) | 5.259 | 0,7827 | 0,4929 | 0,7810 |
| Test en dominio (9 etiquetas compartidas, logits enmascarados) | 4.235 | 0,7540 | 0,5242 | 0,7537 |
| Corpus externo TajikMorphCorpus (9 etiquetas mapeadas) | 2.592 | 0,3306 | 0,2400 | 0,3562 |
| Subconjunto externo de palabras no vistas (9 etiquetas mapeadas) | 2.289 | 0,3272 | 0,2096 | 0,3541 |

Agregado por semillas para ajuste fino completo (semillas 42, 123 y 2024) en dominio a 28 clases: Macro-F1 medio 0,5443 ± 0,0450. El autor advierte que los Macro-F1 de 9 y 28 etiquetas no son directamente intercambiables y que el mapeo automático del corpus externo requiere validación lingüística independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,7 GB para los pesos (177,9 M de parámetros) más activaciones; en la práctica cabe con holgura en 2-4 GB.
- En BF16/FP16: alrededor de 0,35-0,4 GB de pesos, con huella total típica por debajo de 1-2 GB incluyendo activaciones y tokenizer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó en NVIDIA L4. Para inferencia por lotes de alto volumen, A10, L4, A100 o H100 aportan margen, aunque el modelo es pequeño y no las requiere.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; incluso puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: Transformers (`AutoModelForSequenceClassification`), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles; para CPU, exportación a ONNX no documentada en el repo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la longitud de secuencia (64 tokens, entradas de una palabra), se espera latencia de milisegundos por lote en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea / idioma | Macro-F1 en dominio | Licencia | Disponibilidad |
|---|---:|---|---|---:|---|---|
| `TajikNLPWorld/tajik-mbert-pos-full-ft-seed2024` (este) | 177,9 M | 64 tokens | POS de palabra aislada, tayiko (28 clases) | 0,4929 (28 clases) | Apache 2.0 | Hugging Face |
| Checkpoints LoRA del mismo estudio (semillas 42/123/2024) | 177,9 M base + adaptadores | 64 tokens | POS de palabra aislada, tayiko | Media agregada del estudio no desglosada por método en la información disponible | Apache 2.0 (presumible por el estudio) | Hugging Face (TajikNLPWorld) |
| `google-bert/bert-base-multilingual-cased` | 177,9 M | 512 tokens | Modelo base multilingüe sin cabeza POS | no aplica (no entrenado para POS tayiko) | Apache 2.0 | Hugging Face |
| Otros etiquetadores POS tayikos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de benchmarks de otros modelos POS tayikos para una comparación cuantitativa directa. La comparación más fiable es interna al estudio: ajuste fino completo frente a LoRA con semillas emparejadas, cuyos resultados por método no se detallan en la model card más allá de la media agregada del ajuste fino completo.

## Limitaciones y advertencias

- **Sin contexto**: el modelo clasifica palabras aisladas; aplicarlo palabra por palabra a una oración no lo convierte en un etiquetador POS contextual y puede producir errores en casos de ambigüedad gramatical.
- **Desbalanceo severo de clases**: las frecuencias están muy sesgadas y algunas etiquetas tienen muy pocos ejemplos, lo que se refleja en un Macro-F1 en dominio de 0,4929 frente a un Weighted-F1 de 0,7810; el rendimiento en clases raras es bajo.
- **Caída fuerte fuera de dominio**: en el corpus externo la accuracy baja a 0,3306 y el Macro-F1 a 0,2400, con un rendimiento similar en palabras no vistas (0,3272 / 0,2096), lo que indica cambio de dominio y no solo falta de cobertura léxica.
- **Mapeo de etiquetas externo no validado**: la armonización automática de las 9 categorías del corpus externo puede contener desajustes lingüísticos y requiere validación independiente.
- **Riesgo de uso indebido como anotador autoritativo**: no debe tratarse como anotación gramatical de referencia sin revisión de expertos en lengua tayika, especialmente en clases raras.
- **Sesgos**: no se documentan análisis de sesgo específicos; al derivar de mBERT y de un corpus concreto, puede heredar sesgos de dominio y de composición del corpus.
- **Alucinación**: no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de predicciones erróneas con alta confianza en clases poco representadas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo es experimental y el autor lo destina a investigación y NLP exploratorio, no a decisiones automatizadas de alto impacto.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación reciente, sin ecosistema de validación independiente.
- **Idioma**: soporte efectivo solo para tayiko; el multilingüismo del base no se ha evaluado tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TajikNLPWorld/tajik-mbert-pos-full-ft-seed2024
- Dataset de entrenamiento: https://huggingface.co/datasets/TajikNLPWorld/tajik-pos-corpus
- Dataset de evaluación externa: https://huggingface.co/datasets/TajikNLPWorld/TajikMorphCorpus
- Modelo base: https://huggingface.co/bert-base-multilingual-cased
- Preprint referenciado en los tags (arXiv:2605.04576): https://arxiv.org/abs/2605.04576 (identificador tal como aparece en los metadatos; verificar disponibilidad)
