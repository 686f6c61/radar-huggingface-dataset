# thinhdeeptry123/vn-fin-ner-roberta

## Resumen

`vn-fin-ner-roberta` es un modelo de reconocimiento de entidades nombradas (NER) para textos economicos y financieros en ingles que tratan sobre la economia de Vietnam. Lo desarrolla el usuario de Hugging Face `thinhdeeptry123` como proyecto academico y se distribuye con licencia MIT. Parte de `roberta-base` de Facebook AI y anade una cabeza de clasificacion de tokens con 13 clases en esquema BIO para etiquetar seis tipos de entidad: `PER`, `TICKER`, `PERCENT`, `MONEY`, `LOC` y `ORG`.

El modelo resuelve un problema acotado pero practico: extraer entidades estructuradas (importes monetarios, porcentajes, tickers bursatiles, organismos, localizaciones y personas) de noticias y documentos financieros redactados en ingles sobre Vietnam. Con 124 millones de parametros, es lo bastante pequeno para ejecutarse en una unica GPU consumer y para integrarse en pipelines de extraccion de informacion de bajo coste.

Es relevante ahora por su transparencia metodologica: el autor documenta el proceso de limpieza del corpus, publica una evaluacion con validacion cruzada de 5 folds agrupada por articulo y ofrece intervalos de confianza al 95 %. No obstante, se trata de un modelo entrenado sobre un corpus muy pequeno (785 frases, 3.816 entidades) y sin conjunto de test independiente, por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) con cabeza de clasificacion de tokens |
| Parametros totales | 124.065.037 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de subpalabra (truncado en inferencia); `roberta-base` soporta hasta 512 posiciones |
| Tipos de cuantizacion | no disponible (el autor no publica versiones cuantizadas) |
| Idiomas soportados | Ingles (tag `en`); el campo `language` de la model card solo declara `en` |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Etiquetas | 13 clases BIO: `O` + `B-`/`I-` para `ORG`, `LOC`, `PER`, `MONEY`, `PERCENT`, `TICKER` |
| Pipeline | `token-classification` |
| Framework | transformers |
| Hardware de entrenamiento | 1x Tesla T4 |

## Arquitectura y entrenamiento

La arquitectura es un encoder RoBERTa base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) con una cabeza lineal de clasificacion de tokens sobre 13 clases. La etiqueta se asigna al primer subword de cada palabra. El modelo se entreno con entropia cruzada estandar, learning rate 3e-5, 10 epocas, batch size 16, AdamW con weight decay 0,01, scheduler lineal con 10 % de warmup, longitud maxima 256 y semilla 42. Los hiperparametros se fijaron de antemano y no se ajustaron sobre los folds de test.

El corpus de entrenamiento consta de 800 textos en ingles procedentes de 604 articulos fuente, anotados manualmente con 8 tipos de entidad y posteriormente limpiados de forma automatica sin reanotacion. Durante la limpieza se eliminaron 15 frases con la etiqueta `LAW` (22 entidades) por ser demasiado rara, se fusiono `GOV` en `ORG` (89 spans) por ambiguedad de frontera, se dejaron sin etiquetar 43 menciones del gentilicio "Vietnamese" por anotacion inconsistente y se repararon offsets (70 spans expandidos a palabras completas, 38 solapamientos descartados conservando el mas largo, 1 span vacio eliminado). El dataset final son 785 frases y 3.816 entidades. El modelo publicado se entreno sobre la totalidad de esas 785 frases, por lo que no existe un conjunto de test separado: su rendimiento se estima a partir de la validacion cruzada.

Una particularidad tecnica relevante es que el modelo se entreno sobre tokens a nivel de palabra generados por un tokenizador regex personalizado que preserva numeros como `1.5` y `2,000`. Por ello, la model card recomienda usar el script `inference.py` del repositorio en lugar del `pipeline` generico de transformers para reproducir el mismo comportamiento.

## Capacidades

- Reconocimiento de entidades nombradas en textos financieros y economicos en ingles sobre Vietnam.
- Extraccion de seis tipos de entidad: organizaciones y organismos publicos (`ORG`), localizaciones (`LOC`), personas (`PER`), importes monetarios (`MONEY`), porcentajes (`PERCENT`) y tickers bursatiles (`TICKER`).
- Devolucion de offsets de caracteres (`start`, `end`) ademas de texto y etiqueta, lo que facilita el postprocesado y la integracion en pipelines.
- Manejo de expresiones numericas con separadores decimales y de miles gracias al tokenizador regex incluido.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- Capacidad multilingue limitada al ingles; no se ha entrenado ni evaluado en vietnamita pese al nombre del repositorio.
- No es un modelo generativo: no produce texto, solo etiquetas por token.

## Casos de uso

- Extraccion de entidades en noticias financieras: procesar articulos en ingles sobre la economia vietnamita para poblar una base de datos con organismos mencionados, importes y porcentajes, usando `inference.py` para preservar el tokenizador original.
- Monitorizacion de prensa economica: detectar menciones de tickers bursatiles y organizaciones en feeds de noticias para generar alertas o paneles de seguimiento por empresa o sector.
- Enriquecimiento de bases de datos documentales: anadir metadatos estructurados (personas, localizaciones, organizaciones) a un corpus de informes para mejorar la busqueda y el filtrado.
- Analisis de sentimiento asistido por entidades: combinar la salida NER con un clasificador de sentimiento para atribuir opiniones a organismos o empresas concretas dentro de un articulo.
- Preprocesado para sistemas de extraccion de relaciones: usar las entidades detectadas como entrada de un modelo posterior que infiera relaciones (por ejemplo, que un organismo ha fijado un tipo de interes).
- Prototipado academico y docencia: servir como referencia reproducible de un pipeline NER financiero con validacion cruzada documentada, util para comparar con aproximaciones basadas en CRF o en modelos mayores.
- Anonimizacion o enmascarado selectivo: localizar personas y organizaciones en textos para sustitucion antes de compartir documentos internos.

## Benchmarks y rendimiento

Resultados de validacion cruzada de 5 folds con `StratifiedGroupKFold` agrupada por articulo, F1 estricto a nivel de entidad (fronteras exactas y etiqueta correcta), intervalos de confianza al 95 % por bootstrap documental con 1.000 remuestreos.

| Etiqueta | Precision | Recall | F1 (IC 95 %) |
|---|---|---|---|
| PER | 0,911 | 0,934 | 0,922 [0,882-0,956] |
| TICKER | 0,835 | 0,883 | 0,858 [0,746-0,920] |
| PERCENT | 0,909 | 0,919 | 0,914 [0,857-0,954] |
| MONEY | 0,942 | 0,942 | 0,942 [0,919-0,965] |
| LOC | 0,803 | 0,851 | 0,826 [0,800-0,851] |
| ORG | 0,829 | 0,859 | 0,843 [0,823-0,864] |

Agregados: macro-F1 0,884 [0,862-0,901] y micro-F1 0,862 [0,847-0,876].

Comparacion con sistemas alternativos sobre los mismos folds:

| Sistema | Macro-F1 (IC 95 %) | Micro-F1 (IC 95 %) |
|---|---|---|
| CRF con caracteristicas manuales | 0,814 [0,787-0,833] | 0,794 [0,777-0,810] |
| RoBERTa con entropia cruzada (este modelo) | 0,884 [0,862-0,901] | 0,862 [0,847-0,876] |
| RoBERTa con entropia cruzada ponderada | 0,883 [0,861-0,899] | 0,862 [0,847-0,875] |

La mejora frente al CRF es significativa (diferencia 0,071 en macro-F1, IC 95 % [0,055-0,088], p < 0,001). La entropia cruzada ponderada no aporta mejora significativa (diferencia -0,001, IC 95 % [-0,009, +0,009], p = 0,836), por lo que se conservo la version sin ponderar.

El 56 % de las entidades de test (2.140 de 3.816) no aparecieron como entidad en los folds de entrenamiento. El recall es 0,849 sobre entidades no vistas y 0,915 sobre vistas; la brecha es mayor en `LOC`, con recall 0,62 sobre localizaciones no vistas frente a 0,935 sobre vistas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos mas activaciones; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- En fp16 la huella de pesos baja a unos 0,25 GB.
- GPU recomendadas: cualquier GPU moderna; el modelo se entreno en una Tesla T4. Funciona sin problema en RTX 3060, RTX 4090, A100 y H100, aunque estas ultimas estan sobredimensionadas para 124 millones de parametros.
- Cabe en GPU consumer e incluso en CPU para cargas moderadas; el cuello de botella sera el throughput, no la memoria.
- Opciones de despliegue: `transformers` con el script `inference.py` del repositorio (recomendado por el autor para preservar el tokenizador regex); tambien es posible exportar a ONNX o TorchScript. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, y al no ser un modelo generativo no encaja en esos servidores de inferencia orientados a LLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vn-fin-ner-roberta` (este modelo) | 124 M | 256 tokens (truncado) | NER financiero en ingles sobre Vietnam, 6 etiquetas | MIT | Hugging Face |
| `FacebookAI/roberta-base` | 125 M | 512 tokens | Modelo base sin fine-tuning para NER | MIT | Hugging Face |
| CRF con caracteristicas manuales (referencia del autor) | no aplica | no aplica | NER clasico, sin redes neuronales | no disponible | No publicado como artefacto |
| RoBERTa con entropia cruzada ponderada (variante del autor) | 124 M | 256 tokens | Misma tarea, perdida ponderada | MIT | No publicado como artefacto independiente |

No se dispone de comparacion con otros modelos NER financieros especificos para Vietnam en la informacion proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeno: 785 frases y 3.816 entidades, lo que produce intervalos de confianza amplios, especialmente en `TICKER` (257 entidades concentradas en solo 97 frases).
- Sin conjunto de test independiente: el modelo publicado se entreno sobre todas las frases y su rendimiento se estima por validacion cruzada, no por evaluacion held-out.
- Una sola semilla de entrenamiento: los intervalos reflejan variacion de muestreo sobre documentos, no variacion por inicializacion aleatoria.
- Baja generalizacion a entidades no vistas: el recall cae de 0,915 a 0,849 en entidades no observadas, y de forma mas acusada en localizaciones (0,62 frente a 0,935).
- Solo ingles: no procesa vietnamita ni otros idiomas pese a la referencia a Vietnam en el nombre y las etiquetas.
- Truncado a 256 tokens de subpalabra: los documentos largos deben dividirse en frases o parrafos antes de la inferencia, lo que puede romper entidades que crucen la frontera de corte.
- Dependencia del tokenizador regex propio: usar el `pipeline` generico de transformers puede degradar los resultados con expresiones numericas.
- Etiqueta `LAW` no soportada: los textos con referencias legales no se etiquetaran correctamente en ese aspecto.
- El gentilicio "Vietnamese" queda sin etiquetar por decision de limpieza, lo que puede sorprender en textos que lo mencionen repetidamente.
- Dataset no publicado: no es posible reproducir el entrenamiento ni auditar la composicion exacta de las fuentes; la model card deja un campo `[FILL IN]` sin completar sobre el origen y las condiciones de uso de los textos.
- Proyecto academico: no hay evidencia de uso en produccion ni mantenimiento continuado.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la deteccion de entidades, con especial incidencia en fronteras de spans de organizaciones y localizaciones.
- Licencia MIT permite uso comercial, pero la falta de garantias y la ausencia de test held-out desaconsejan desplegarlo en produccion sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thinhdeeptry123/vn-fin-ner-roberta
- Modelo base RoBERTa: https://huggingface.co/FacebookAI/roberta-base
- Paper de RoBERTa (Liu et al., 2019): https://arxiv.org/abs/1907.11692
