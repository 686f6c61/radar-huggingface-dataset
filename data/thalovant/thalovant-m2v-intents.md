# thalovant/thalovant-m2v-intents

## Resumen

`thalovant/thalovant-m2v-intents` es un clasificador de intenciones basado en embeddings estaticos (arquitectura Model2Vec) desarrollado por el usuario thalovant para el ecosistema Thalovant y su integracion con el pipeline de voz `ovos-m2v-pipeline`. El modelo mapea una frase de entrada a una de 366 etiquetas con formato `<skill_id>:<intent>`, que corresponden a las habilidades registradas por los hubs del sistema (incluyendo pipelines de persona, lectura y wikihow). No es un modelo generativo, sino un clasificador de texto entrenado por fine-tuning sobre el modelo base `Jarbas/m2v-256-distiluse-base-multilingual-cased-v2`.

La relevancia del modelo reside en su eficiencia: al emplear embeddings estaticos en lugar de un transformer completo, el coste de inferencia es muy bajo, lo que lo hace adecuado para enrutamiento de intenciones en asistentes de voz con requisitos de latencia estrictos. Con 30.577.920 parametros, cubre 68 idiomas y reporta una precision de intencion del 91,5 % y de skill del 96,1 % sobre un conjunto de validacion de 101.918 filas no vistas durante el entrenamiento.

El modelo esta pensado para integrarse en el pipeline de OVOS como clasificador de intenciones, sustituyendo o complementando heuristicas de enrutamiento. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque su utilidad practica esta ligada al conjunto de etiquetas especifico del ecosistema Thalovant.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estaticos destilados, sin transformer en inferencia) |
| Parametros totales | 30.577.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser embeddings estaticos, el coste es bajo por diseno) |
| Idiomas soportados | 68 idiomas (segun resultados por idioma publicados: en, es, fr, de, pt, ca, gl, it, nl, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Model2Vec, una tecnica que destila un modelo de embeddings tipo transformer (en este caso `distiluse-base-multilingual-cased-v2` con vocabulario reducido a 256 tokens) en una tabla de embeddings estaticos. En inferencia no se ejecuta atencion ni capas transformer: cada token se proyecta a un vector precalculado y la representacion de la frase se obtiene por pooling, lo que reduce drasticamente el coste computacional frente a un encoder convencional. Sobre esta representacion se entrena una cabeza de clasificacion lineal con el trainer de clasificadores de Model2Vec.

El entrenamiento se realizo sobre un corpus de 521.361 filas del ecosistema Thalovant, con un maximo de 512 frases por etiqueta e idioma. La evaluacion se hizo sobre 101.918 filas retenidas cuyo texto (en cualquier idioma) y cuya linea de intencion estan ausentes del conjunto de entrenamiento del modelo de evaluacion (419.443 filas). Los pesos publicados se reentrenaron con la misma receta sobre el corpus completo. El modelo no dispone de etiqueta "ninguna de estas": una frase ajena a cualquier skill recibe la etiqueta del skill mas cercano, a menudo con alta confianza, lo que exige umbrales de confianza calibrados por idioma.

## Capacidades

- Clasificacion de intenciones de texto en 366 etiquetas con formato `<skill_id>:<intent>`.
- Cobertura multilingue en 68 idiomas, con resultados publicados por variante regional (en-US, en-GB, es-ES, es-MX, pt-BR, pt-PT, fr-FR, de-DE, etc.).
- Clasificacion a nivel de skill e intencion dentro del skill, con precision de skill superior a la de intencion.
- Inferencia de muy baja latencia por tratarse de embeddings estaticos, sin necesidad de GPU.
- Integracion con el pipeline de OVOS mediante `"mode": "classifier"` y el fichero `labels.json`.
- Soporte de umbrales de confianza por idioma para controlar falsos positivos entre skills.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Enrutamiento de intenciones en asistentes de voz OVOS: el modelo recibe la transcripcion del usuario y devuelve la etiqueta `<skill_id>:<intent>` que el hub usa para despachar la peticion al skill correcto, con latencia compatible con interaccion conversacional en tiempo real.
- Validacion de skills en CI: la herramienta `thalovant-skillkit check` usa `index.json` y este clasificador para detectar frases que otro skill ya posee y para comprobar que las frases nuevas se clasifican correctamente antes de publicar un skill.
- Deteccion de colisiones entre skills: al comparar la prediccion del clasificador con la etiqueta declarada por el skill, se identifican solapamientos de vocabulario entre habilidades y se corrigen antes de produccion.
- Clasificacion multilingue en produccion: con 68 idiomas cubiertos y umbrales por idioma, permite desplegar un unico modelo de enrutamiento para asistentes con usuarios en multiples regiones, evitando mantener clasificadores separados por idioma.
- Prefiltrado barato en pipelines de NLU: al ser un modelo estatico, puede ejecutarse en CPU como primera etapa que descarta o preselecciona intenciones antes de invocar modelos mas costosos.
- Analisis de logs conversacionales: clasificar grandes volumenes de transcripciones historicas para medir que skills se invocan, detectar intenciones no cubiertas y priorizar el desarrollo de nuevas habilidades.
- Enrutamiento en dispositivos con recursos limitados: al no requerir GPU, puede ejecutarse en hardware modesto dentro de un asistente local o edge.

## Benchmarks y rendimiento

Resultados sobre 101.918 filas retenidas (texto e intencion ausentes del entrenamiento del modelo de evaluacion), segun la model card:

| Metrica | Valor |
|---|---|
| Precision de intencion (global) | 91,5 % |
| Precision de skill (global) | 96,1 % |
| Idiomas evaluados | 68 |
| Precision de intencion mediana por idioma | 91,1 % |
| Idiomas con precision de intencion < 80 % | 6 |
| Frases asignadas a otro skill con confianza >= 0,9 | 0,8 % |

Resultados por idioma seleccionados:

| Idioma | Filas | Intencion | Skill | Falsos avisos | Umbral |
|---|---:|---:|---:|---:|---:|
| `en-US` | 3436 | 95,5 % | 98,3 % | 0,2 % | 0,9 |
| `es-ES` | 3046 | 95,0 % | 97,8 % | 0,2 % | 0,9 |
| `fr-FR` | 3456 | 95,3 % | 97,6 % | 0,5 % | 0,9 |
| `de-DE` | 2913 | 93,4 % | 97,0 % | 0,6 % | 0,9 |
| `ca-ES` | 3286 | 93,3 % | 97,1 % | 0,6 % | 0,9 |
| `gl-ES` | 2738 | 97,2 % | 98,8 % | 0,2 % | 0,9 |
| `pt-PT` | 3263 | 94,0 % | 96,1 % | 1,6 % | 0,97 |
| `it-IT` | 2697 | 91,4 % | 96,9 % | 0,9 % | 0,9 |
| `ko-KR` | 879 | 65,3 % | 89,3 % | 0,9 % | 0,9 |
| `ja-JP` | 682 | 77,3 % | 93,1 % | 1,2 % | 0,94 |
| `eu-ES` | 1255 | 84,5 % | 89,6 % | 2,1 % | 0,99 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- Al ser un modelo de embeddings estaticos de 30,6 M de parametros, la inferencia se ejecuta en CPU sin problemas; la VRAM necesaria en GPU es minima (del orden de decenas o pocos cientos de MB segun el formato de pesos).
- No requiere GPU dedicada; puede ejecutarse en cualquier CPU moderna con un throughput alto por la ausencia de operaciones de atencion.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Despliegue mediante la libreria `model2vec` (`StaticModelPipeline`); no aplican los servidores de inferencia para transformers generativos (vLLM, TGI) al no tratarse de un modelo autoregresivo. Para CPU puede integrarse directamente en el proceso Python del pipeline OVOS.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del modelo se espera un coste por frase muy inferior al de un encoder transformer equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `thalovant/thalovant-m2v-intents` | 30,6 M | Model2Vec estatico, 366 etiquetas | 68 | Apache 2.0 | Especifico del ecosistema Thalovant/OVOS |
| `Jarbas/m2v-256-distiluse-base-multilingual-cased-v2` | no disponible | Model2Vec estatico (base) | multilingue | no disponible | Modelo base sin cabeza de clasificacion |
| Clasificadores de intenciones basados en transformers (p. ej. DistilBERT fine-tuned) | ~66 M | Transformer encoder | segun fine-tuning | variable | Mayor coste de inferencia; no se dispone de datos comparativos concretos en la informacion proporcionada |

La comparativa cuantitativa con alternativas de la misma tarea no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No existe etiqueta "ninguna de estas": una frase sobre algo que ningun skill cubre recibe igualmente la etiqueta del skill mas cercano, a menudo con confianza alta. Es imprescindible aplicar umbrales de confianza para evitar enrutamientos erroneos.
- El rendimiento varia notablemente por idioma: `ko-KR` (65,3 % de precision de intencion) y `ja-JP` (77,3 %) estan muy por debajo de la media, y seis idiomas quedan por debajo del 80 %.
- Para mantener los falsos avisos por debajo del 1,0 % en 25 idiomas se requieren umbrales elevados (entre 0,92 y 0,99), lo que reduce la cobertura en esos idiomas.
- El conjunto de 366 etiquetas esta atado al ecosistema Thalovant; fuera de ese contexto el modelo no es reutilizable sin reentrenamiento.
- Los pesos publicados se entrenaron sobre el corpus completo, por lo que las frases existentes de cada skill forman parte de los datos de entrenamiento; las metricas publicadas provienen de un modelo de evaluacion entrenado con menos datos y no deben interpretarse como rendimiento en dominios nuevos.
- Riesgo de sesgo: el corpus proviene de las frases registradas por los skills del fleet, lo que puede infrarrepresentar vocabulario, registros o variantes dialectales no presentes en ese corpus.
- No soporta generacion, razonamiento multi-paso, tool calling ni modalidades distintas de texto.
- La licencia Apache 2.0 permite uso comercial, pero la utilidad del modelo esta limitada a la taxonomia de intenciones de Thalovant.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thalovant/thalovant-m2v-intents
- Modelo base: https://huggingface.co/Jarbas/m2v-256-distiluse-base-multilingual-cased-v2
- Libreria Model2Vec: https://github.com/MinishLab/model2vec
- Proyecto OVOS: https://github.com/OpenVoiceOS
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs o demos adicionales.
