# youkijiudai/financial-ner-bert-base-cased

## Resumen

`financial-ner-bert-base-cased` es un clasificador de tokens basado en `google-bert/bert-base-cased` afinado para reconocimiento de entidades nombradas (NER) en el dominio financiero. Lo publica el usuario de Hugging Face `youkijiudai` (Zihao Zheng y coautores) como parte del material reproducible del artículo *Reliable Financial Named Entity Recognition under Domain Shift: Confidence Estimation and Selective Prediction* (MCAIT 2026, arXiv:2608.19558). El modelo etiqueta únicamente tres tipos de entidad en formato BIO: persona (PER), organizacion (ORG) y localizacion (LOC).

El interes del modelo no esta en su rendimiento absoluto, sino en su papel como baseline de encoder en un estudio sobre cambio de dominio (domain shift). El autor lo entrena exclusivamente con el split de entrenamiento del corpus FIN de filings de la SEC (1.014 frases) y lo evalua tambien en dominios fuera de distribucion: noticias financieras (FiNER-ORD) y redes sociales (TweetNER7). La caida de F1 entre dominios es precisamente el fenomeno que el articulo analiza mediante estimacion de confianza y prediccion selectiva.

Se trata de un modelo de investigacion, no de un sistema NER listo para produccion. Con 107,7 millones de parametros, arquitectura BERT base y licencia Apache 2.0, es ligero, desplegable en hardware modesto y util como punto de partida para experimentar con senales de confianza, calibracion y umbrales de abstención en extraccion de entidades financieras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) con cabeza de clasificacion de tokens |
| Parametros totales | 107.725.063 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (limite arquitectonico de BERT); entrenado con max_length de 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors en fp32; admite cuantizacion estandar via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Etiquetas | O, B-PER, I-PER, B-ORG, I-ORG, B-LOC, I-LOC (BIO) |
| Modelo base | google-bert/bert-base-cased |
| Dataset de entrenamiento | tner/fin (FIN train split, Salinas Alvarado et al., 2015) |
| Tamano del repositorio | 1,3 GB (incluye tres semillas) |

## Arquitectura y entrenamiento

El modelo es un `BertForTokenClassification` estandar: el encoder BERT-base preentrenado en ingles se afina con una cabeza lineal que proyecta cada representacion de token a las siete etiquetas BIO. No incorpora innovaciones arquitectonicas propias; su valor esta en el protocolo de entrenamiento y evaluacion. Se entrenaron tres semillas independientes (13, 42 y 2026); la raiz del repositorio contiene la semilla 42 y las otras dos residen en los subdirectorios `seed13` y `seed2026`.

El entrenamiento usa 5 epocas, learning rate 3e-5 con warmup lineal del 10 %, batch size 16, longitud maxima de 256 tokens y weight decay 0.01. La alineacion de etiquetas asigna la etiqueta solo al primer subword de cada palabra; el resto se marca con -100 y se ignora en la perdida. Todo el afinado se ejecuto en una Apple M1 Pro (MPS) en aproximadamente 53 minutos por semilla, lo que confirma que se trata de un modelo de bajo coste computacional. La evaluacion fuera de dominio emplea FiNER-ORD (Shah et al., 2023) y TweetNER7 (Ushio et al., 2022), con los tipos de TweetNER7 mapeados a PER/ORG/LOC (corporation→ORG, person→PER, location→LOC) y descartando tuits con otras entidades. Los conjuntos fuera de dominio se limitan a 300 frases de test.

## Capacidades

- Reconocimiento de entidades nombradas de tipo persona, organizacion y localizacion en texto financiero en ingles.
- Clasificacion a nivel de token con esquema BIO y estrategia de agregacion `first` (la etiqueta recae en el primer subword).
- Extraccion de entidades en texto de filings regulatorios (10-K, 8-K y similares) con registro formal.
- Inferencia ligera en CPU o GPU de gama baja gracias a su tamano de 107,7 M de parametros.
- Tres checkpoints independientes por semilla para estudiar varianza de entrenamiento y estabilidad de predicciones.
- Base para experimentos de estimacion de confianza y prediccion selectiva (probabilidad por span de entidad, temperature scaling), segun el articulo asociado.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Extraccion de entidades en filings de la SEC: el modelo identifica empresas, directivos y ubicaciones en texto regulatorio, que es exactamente el dominio de entrenamiento y donde alcanza su mejor F1 (0,701 en la semilla 42).
- Baseline de investigacion en domain shift: sirve para reproducir los resultados del articulo y comparar senales de confianza (entropia, probabilidad de span, temperature scaling) frente a modelos generativos con LoRA.
- Filtrado previo en pipelines de analisis financiero: al ser muy ligero, puede ejecutarse sobre grandes volumenes de documentos para preetiquetar entidades antes de una revision humana o de un modelo mayor.
- Prototipado rapido de sistemas NER: con `pipeline("token-classification")` de Transformers se obtiene una demo funcional en pocas lineas, util para validar esquemas de anotacion o interfaces de extraccion.
- Estudio de calibracion y abstención: permite construir curvas de prediccion selectiva (cobertura frente a precision) para decidir que predicciones automatizar y cuales derivar a revision.
- Docencia y experimentacion con modelos encoder: su coste de entrenamiento (~53 min en M1 Pro) lo hace adecuado para practicas de afinado de BERT en dominios especializados.
- Analisis de menciones en noticias financieras: con la advertencia de que el F1 cae a ~0,39 en FiNER-ORD, puede usarse solo con umbrales de confianza estrictos y supervision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor (entity-level precision / recall / F1), no verificados de forma independiente. Los conjuntos fuera de dominio estan limitados a 300 frases de test.

| Semilla | FIN test (in-domain, SEC filings) | FiNER-ORD test (noticias financieras) | TweetNER7 test (redes sociales) |
|---|---|---|---|
| 13 | 0,694 / 0,745 / **0,718** | 0,387 / 0,389 / **0,388** | 0,342 / 0,170 / **0,227** |
| 42 (raiz) | 0,655 / 0,755 / **0,701** | 0,392 / 0,389 / **0,391** | 0,305 / 0,179 / **0,226** |
| 2026 | 0,654 / 0,727 / **0,689** | 0,393 / 0,349 / **0,370** | 0,408 / 0,202 / **0,270** |

El F1 se reduce aproximadamente a la mitad al pasar a noticias financieras y cae alrededor de dos tercios en tuits. La variabilidad entre semillas es notable (F1 in-domain entre 0,689 y 0,718), lo que refuerza la necesidad de reportar medias y desviaciones en lugar de un unico resultado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,45 GB de pesos (107,7 M de parametros); con overhead de activaciones y batch pequeno, cabe holgadamente en 1-2 GB.
- En fp16: ~0,22 GB de pesos; en int8: ~0,11 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en RTX 3060, RTX 4090, T4, A10, A100 y H100, aunque el modelo esta sobredimensionado para estas ultimas.
- Cabe en cualquier GPU de consumo e incluso en CPU; el entrenamiento original se hizo en una Apple M1 Pro.
- Opciones de despliegue: `transformers` (pipeline o `AutoModelForTokenClassification`), `vLLM` no aplica (no es generativo), `llama.cpp`/`Ollama` no soportan BERT para NER, TGI no es la via natural; si es compatible con endpoints de Hugging Face (tag `endpoints_compatible`) y con `optimum`/ONNX para CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en decenas de milisegundos por frase en GPU moderna y en el orden de decenas a cientos de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de comparaciones directas publicadas en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| financial-ner-bert-base-cased | 107,7 M | 512 tokens | NER financiero (PER/ORG/LOC) | Apache 2.0 | Baseline de encoder del articulo; F1 in-domain 0,689-0,718 |
| google-bert/bert-base-cased | 108 M | 512 tokens | Modelo base general | Apache 2.0 | Sin afinado especifico de NER financiero |
| Modelos generativos con LoRA del articulo | no disponible | no disponible | NER financiero | no disponible | Los pesos no se conservaron segun la model card |

No se han publicado en la informacion disponible comparaciones con otros modelos NER financieros especificos (por ejemplo, variantes afinadas sobre FiNER-ORD o TweetNER7).

## Limitaciones y advertencias

- Entrenado con solo 1.014 frases de filings de la SEC: se espera un recall bajo en noticias, tuits y otros registros.
- Solo cubre tres tipos de entidad; no detecta MISC, productos, importes monetarios ni fechas.
- El F1 cae a ~0,39 en noticias financieras y a ~0,23-0,27 en redes sociales, lo que lo hace inadecuado para uso directo en esos dominios sin control de confianza.
- Variabilidad entre semillas apreciable (hasta ~0,03 puntos de F1 in-domain); conviene promediar semillas en evaluaciones.
- Los modelos generativos con LoRA del articulo no estan incluidos porque sus pesos no se conservaron; no es posible reproducir esa parte del estudio con este repositorio.
- Riesgo de alucinacion de entidades en texto ambiguo o fuera de dominio; el autor recomienda no usar las salidas crudas para decisiones financieras automatizadas sin gating por confianza y revision humana.
- Sesgos potenciales derivados del corpus de entrenamiento (filings de empresas estadounidenses), con posible infra-representacion de entidades de otras regiones o sectores.
- Licencia Apache 2.0 permite uso comercial, pero la calidad fuera de dominio hace aconsejable validacion exhaustiva antes de desplegarlo en produccion.
- Solo ingles; no hay soporte declarado para castellano ni otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youkijiudai/financial-ner-bert-base-cased
- Articulo: https://arxiv.org/abs/2608.19558
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/tner/fin
- Dataset fuera de dominio (noticias): https://huggingface.co/datasets/gtfintechlab/finer-ord
- Dataset fuera de dominio (redes sociales): https://huggingface.co/datasets/tner/tweetner7
