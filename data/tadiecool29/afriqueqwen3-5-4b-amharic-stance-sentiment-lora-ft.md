# tadiecool29/AfriqueQwen3.5-4B-Amharic-Stance-Sentiment-LoRA-FT

## Resumen

El modelo `tadiecool29/AfriqueQwen3.5-4B-Amharic-Stance-Sentiment-LoRA-FT` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario tadiecool29 sobre el modelo base `McGill-NLP/AfriqueQwen3.5-4B`. Se trata de un ajuste fino orientado a dos tareas de clasificación de texto en amhárico: detección de postura (stance detection) y análisis de sentimiento. No es un modelo completo, sino un conjunto de pesos de adaptador que debe cargarse junto al modelo base mediante la librería PEFT.

El problema que aborda es la escasez de recursos de procesamiento de lenguaje natural para el amhárico, un idioma de bajos recursos con más de 30 millones de hablantes. Al partir de un modelo base multilingüe preentrenado y aplicar un ajuste ligero supervisado sobre un corpus normalizado y estratificado en amhárico, el autor busca especializar el modelo en la clasificación de opiniones y posturas, tareas relevantes para el análisis de redes sociales, medios de comunicación y discurso político en Etiopía.

La relevancia del modelo es limitada por su estado incipiente: cuenta con 0 descargas y 0 likes en el momento de la consulta, el repositorio ocupa 0,1 GB (coherente con un adaptador LoRA, no con un modelo completo) y la model card contiene campos sin rellenar. Los resultados declarados por el autor son moderados: exactitud de 0,6146 en postura, 0,6645 en sentimiento y un F1 macro medio de 0,642 sobre el conjunto de evaluación indicado, cifras no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (base: McGill-NLP/AfriqueQwen3.5-4B) |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina "4B", lo que sugiere ~4.000 millones de parametros |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones del conjunto base + adaptador) |
| Idiomas soportados | Amharico (codigo `am`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base `McGill-NLP/AfriqueQwen3.5-4B`, un transformer decoder-only de la familia Qwen segun la nomenclatura del nombre, con aproximadamente 4.000 millones de parametros. Sobre ese modelo se ha entrenado un adaptador LoRA, tecnica que congela los pesos originales e introduce matrices de bajo rango entrenables en determinadas capas, reduciendo drasticamente el numero de parametros a optimizar y el tamano del artefacto resultante. El repositorio ocupa 0,1 GB, lo que confirma que se trata exclusivamente del adaptador y no de una copia del modelo base.

Los datos de entrenamiento declarados son el dataset `tadiecool29/Amharic_Stance_Sentiment_Normalized_Stratified`, un corpus en amharico normalizado y estratificado que combina anotaciones de postura y de sentimiento en un esquema multitarea. No se especifica el numero de tokens, la composicion exacta del dataset, el numero de ejemplos ni si hubo fases de RLHF, DPO o ajuste adicional. Tampoco se documentan los hiperparametros de entrenamiento (rango LoRA, alpha, tasa de aprendizaje, epocas, precision numerica), el hardware utilizado ni la duracion del entrenamiento; la model card marca todos estos campos como "[More Information Needed]".

## Capacidades

- Clasificacion de postura (stance detection) en amharico: determina la posicion expresada respecto a un tema o entidad.
- Analisis de sentimiento en amharico: clasifica la polaridad del texto (el numero exacto de clases no se especifica).
- Procesamiento multitarea: el entrenamiento conjunto sobre postura y sentimiento sugiere que el adaptador aprende representaciones compartidas para ambas tareas.
- Especializacion linguistica en un idioma de bajos recursos, partiendo de la cobertura multilingue del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito para este adaptador.
- No se documentan capacidades de generacion abierta: la pipeline declarada es `text-classification`, por lo que el uso previsto es la clasificacion, no la generacion de texto libre.

## Casos de uso

- Monitorizacion de redes sociales en Etiopia: el modelo puede etiquetar publicaciones en amharico segun su postura y sentimiento, permitiendo a medios y organizaciones seguir la reaccion publica ante un acontecimiento en tiempo casi real.
- Analisis de discurso politico: clasificar declaraciones de actores politicos o de ciudadanos como favorables, contrarias o neutras respecto a una propuesta legislativa, alimentando estudios de opinion.
- Investigacion academica en PLN de bajos recursos: servir como punto de partida (baseline) reproducible para comparar tecnicas de adaptacion eficiente en amharico.
- Moderacion de contenido asistida: priorizar colas de revision identificando publicaciones con sentimiento muy negativo o posturas polarizadas, siempre con supervision humana.
- Analisis de reputacion de marca en mercados etiopes: clasificar menciones en amharico sobre productos o empresas para detectar quejas y tendencias de sentimiento.
- Estudios sociologicos y de opinion publica: etiquetar grandes volumenes de encuestas abiertas o comentarios para cuantificar la distribucion de posturas por region o demografia.
- Enriquecimiento de datasets para entrenamiento posterior: usar las etiquetas generadas como preanotacion que despues se revise manualmente, acelerando la creacion de corpus anotados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index). No verificados de forma independiente.

| Tarea | Metrica | Valor |
|---|---|---|
| Deteccion de postura | Exactitud (Stance Accuracy) | 0,6146 |
| Deteccion de postura | F1 macro (Stance Macro-F1) | 0,6219 |
| Analisis de sentimiento | Exactitud (Sentiment Accuracy) | 0,6645 |
| Analisis de sentimiento | F1 macro (Sentiment Macro-F1) | 0,6622 |
| Media de ambas tareas | F1 macro medio (Avg Macro F1) | 0,6420 |

Conjunto de evaluacion: `Amharic_Stance_Sentiment_Normalized_Stratified`. No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni intervalos de confianza, tamanos de muestra o desgloses por clase.

## Requisitos de hardware

Las cifras siguientes son estimaciones generales derivadas del tamano nominal de ~4.000 millones de parametros del modelo base; el autor no publica requisitos oficiales.

- VRAM estimada en FP16/BF16: aproximadamente 8-10 GB solo para los pesos del modelo base, mas el consumo de activaciones y cache KV, que depende del contexto configurado (no disponible).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3,5 GB.
- El adaptador LoRA anade un sobrecoste minimo, coherente con el tamano de repositorio de 0,1 GB, y puede fusionarse con los pesos base para inferencia.
- GPU recomendadas: A100 o H100 para despliegues de alto rendimiento; RTX 4090 (24 GB) o A6000 para FP16 holgado; RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB para FP16 o 8 bits.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en cuantizacion de 4 u 8 bits; en FP16 es recomendable disponer de al menos 12-16 GB.
- Opciones de despliegue: libreria `transformers` junto con `peft` para cargar el adaptador sobre el modelo base; vLLM y TGI para servir el modelo fusionado; llama.cpp u Ollama si se convierte a GGUF. La compatibilidad exacta de la cabeza de clasificacion con cada backend no esta documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. La unica comparacion documentable es con el propio modelo base, del que no se publican metricas en esta ficha.

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tadiecool29/AfriqueQwen3.5-4B-Amharic-Stance-Sentiment-LoRA-FT | Adaptador sobre base ~4B | No disponible | Postura y sentimiento en amharico | Apache 2.0 | HuggingFace, 0 descargas |
| McGill-NLP/AfriqueQwen3.5-4B (modelo base) | ~4B | No disponible | Generacion y comprension multilingue | No disponible | HuggingFace |
| Otros modelos de stance detection en amharico | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados declarados no estan verificados de forma independiente (campo `verified: false` en el model-index); deben tratarse como cifras preliminares del autor.
- El rendimiento es moderado: F1 macro medio de 0,642, con exactitud de postura en torno a 0,61, lo que limita su uso en produccion sin supervision humana.
- La model card esta practicamente vacia: no documenta datos de entrenamiento, hiperparametros, sesgos, usos fuera de alcance ni procedimientos de evaluacion.
- No se describen sesgos conocidos, pero un corpus de amharico probablemente sobrerrepresenta ciertos registros (redes sociales, contextos politicos) y puede no generalizar a otros dominios.
- Riesgo de alucinacion no aplicable en sentido estricto al ser una tarea de clasificacion, pero si existe riesgo de etiquetado erroneo y de sobreconfianza en clases minoritarias.
- Cobertura linguistica limitada al amharico; el adaptador no esta pensado para otros idiomas.
- El modelo es un adaptador, no un artefacto autonomo: requiere descargar el modelo base y cargarlo con PEFT, lo que anade dependencias y pasos de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones propias no reflejadas en esta ficha; conviene verificar la licencia de `McGill-NLP/AfriqueQwen3.5-4B`.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, publicacion reciente y sin senales de soporte o actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/AfriqueQwen3.5-4B-Amharic-Stance-Sentiment-LoRA-FT
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/tadiecool29/Amharic_Stance_Sentiment_Normalized_Stratified
- Articulo referenciado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico citada en la model card: https://mlco2.github.io/impact
