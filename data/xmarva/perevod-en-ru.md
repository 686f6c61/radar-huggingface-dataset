# xmarva/perevod-en-ru

## Resumen

perevod-en-ru es un modelo de traduccion automatica ingles-ruso desarrollado por xmarva como parte del curso "Transformers: from scratch to production". Se trata de un transformer encoder-decoder construido desde cero con 9.602.304 parametros, disenado con la arquitectura de la leccion 5 del curso (pre-norm con RMSNorm, SwiGLU y RoPE) y los hiperparametros ajustados de la leccion 6. Su proposito es doble: servir como herramienta de traduccion para frases cortas del ingles al ruso y como material didactico para comprender el funcionamiento interno de un modelo de traduccion.

El modelo se entrena con aproximadamente medio millon de pares de frases ingles-ruso procedentes de Tatoeba, un corpus de frases cortas escritas por voluntarios para estudiantes de idiomas. Esta orientado a frases cotidianas breves y a la experimentacion educativa, no a traduccion de documentos o textos criticos. Su tamano reducido permite entrenarlo en una GPU gratuita y leer su implementacion completa.

La relevancia de este modelo reside en su caracter abierto y didactico: es un ejemplo completo y reproducible de un pipeline de traduccion neuronal, con licencia CC-BY-2.0 y un paquete Python (`perevod`) que permite ejecutarlo con un solo comando. No compite con modelos de traduccion de gran escala, pero ofrece un punto de partida claro para investigadores y desarrolladores que quieran entender o modificar un sistema de traduccion desde sus componentes basicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (pre-norm con RMSNorm, SwiGLU, RoPE) |
| Parametros totales | 9.602.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (los inputs mas largos se truncan con aviso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles), ru (ruso) |
| Licencia | cc-by-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder clasica, pero con las modificaciones modernas presentadas en la leccion 5 del curso: normalizacion pre-norm con RMSNorm, activacion SwiGLU en las capas feed-forward y embeddings posicionales rotatorios (RoPE). Los hiperparametros fueron ajustados segun la leccion 6 del mismo curso. Con 9,6 millones de parametros, es un modelo compacto que prioriza la legibilidad y la eficiencia sobre el rendimiento bruto.

El entrenamiento se realizo sobre aproximadamente 500.000 pares de frases ingles-ruso extraidos de Tatoeba (dataset `xmarva/tfs-tatoeba-en-ru`). No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La evaluacion se hizo con sacreBLEU (version 2.6.0, configuracion `nrefs:1|case:mixed|eff:yes|nc:6|nw:0|space:no`) y busqueda por haz con 4 hipotesis. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre la composicion detallada del dataset mas alla de su origen en Tatoeba.

## Capacidades

- Traduccion de texto del ingles al ruso para frases cortas y cotidianas.
- Generacion de traducciones mediante busqueda por haz (beam search) con 4 hipotesis.
- Entrenamiento y ejecucion desde cero con el paquete `perevod`, pensado para experimentation y aprendizaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas exclusivamente al par en-ru.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Traduccion de frases cotidianas para estudiantes de ruso: el modelo traduce oraciones breves del ingles al ruso con una calidad aceptable (chrF 61,1 en Tatoeba), adecuado para practicar vocabulario y estructuras simples.
- Material didactico en cursos de NLP: sirve como ejemplo completo y reproducible de un transformer encoder-decoder, con codigo y pesos abiertos para que los estudiantes inspeccionen cada componente.
- Prototipado rapido de pipelines de traduccion: al ser ligero y ejecutable con un solo comando (`perevod "I think, therefore I am."`), permite integrar traduccion basica en demos o cuadernos de experimentacion sin infraestructura pesada.
- Investigacion sobre sesgos de genero en traduccion: el modelo presenta un sesgo documentado (el verbo ruso es femenino en el 8% de las traducciones de frases con profesiones y pronombres femeninos), lo que lo convierte en un caso de estudio controlado para analizar este fenomeno.
- Benchmarking de tecnicas de entrenamiento: al ser un modelo pequeno entrenable en GPU gratuita, permite comparar variantes de arquitectura (RMSNorm, SwiGLU, RoPE) y hiperparametros con bajo coste computacional.
- Educacion en traduccion automatica: util para demostrar las limitaciones de los modelos pequenos (caida de calidad en textos largos o de dominio especifico) y la importancia de la evaluacion por longitud de frase.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Conjunto de prueba | Metrica | Valor |
|---|---|---|
| Tatoeba test (2000 pares) | chrF | 61,1 |
| Tatoeba test (2000 pares) | BLEU | 42,6 |
| WMT20 news (200 frases) | chrF | 25,8 |

Desglose por longitud de la frase inglesa en la muestra de Tatoeba:

| Longitud | Frases | chrF |
|---|---|---|
| 1-5 palabras | 792 | 63,8 |
| 6-8 palabras | 881 | 65,3 |
| 9-12 palabras | 246 | 61,5 |
| 13 o mas palabras | 81 | 40,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (9,6 M de parametros, aproximadamente 38 MB en fp32); no se dispone de datos de cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe en GPU integradas y en CPU sin problemas.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: paquete Python `perevod` (https://github.com/xmarva/transformers-from-scratch/tree/main/perevod); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Se puede senalar que, por tamano y proposito, este modelo se situa en la categoria de traductores neuronales pequenos y didacticos, pero no se han publicado comparaciones con alternativas como MarianMT o NLLB en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| perevod-en-ru | 9,6 M | 256 tokens | CC-BY-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La calidad cae rapidamente fuera de frases cortas y cotidianas: en noticias (WMT20) el chrF baja a 25,8 y el modelo a menudo genera ruso fluido pero no relacionado con la fuente.
- Sesgo de genero documentado: en frases como "My doctor said she was tired" y once variantes con otras profesiones, el verbo ruso es femenino en el 8% de las traducciones; el modelo sigue el genero estereotipico de la profesion, no el pronombre.
- Una entrada vacia hace que el modelo escriba una frase; el paquete devuelve una traduccion vacia en su lugar.
- Los inputs de mas de 256 tokens se truncan con un aviso, lo que puede provocar perdida de informacion.
- Uso previsto limitado a frases cortas y cotidianas y a fines educativos; no apto para textos de noticias, documentos, legales o medicos.
- Licencia CC-BY-2.0: permite uso comercial con atribucion, pero el autor desaconseja explicitamente su uso para "anything that matters".
- No se han publicado datos sobre cuantizacion ni sobre rendimiento en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/xmarva/perevod-en-ru
- Curso "Transformers: from scratch to production": https://github.com/xmarva/transformers-from-scratch
- Paquete `perevod`: https://github.com/xmarva/transformers-from-scratch/tree/main/perevod
- Dataset de entrenamiento: https://huggingface.co/datasets/xmarva/tfs-tatoeba-en-ru
- Tatoeba: https://tatoeba.org
