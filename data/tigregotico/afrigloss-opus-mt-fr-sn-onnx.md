# TigreGotico/afrigloss-opus-mt-fr-sn-onnx

## Resumen

`afrigloss-opus-mt-fr-sn-onnx` es la exportacion a ONNX del modelo MarianMT `AfriSpeech/afrigloss-opus-mt-fr-sn`, un sistema de traduccion automatica frances → shona (fr → sn) desarrollado por AfriSpeech dentro del marco Afri-Gloss-MT y afinado a partir de OPUS-MT. El repositorio lo publica TigreGotico como conversion automatica, con grafos en fp32 e int8 listos para ejecutarse con ONNX Runtime a traves de la libreria `optimum`.

El modelo resuelve un par de traduccion de bajos recursos: el shona es una lengua bantú hablada principalmente en Zimbabue, con escasa representacion en los sistemas de traduccion comerciales. La innovacion del checkpoint original es su naturaleza *glossary-constrained*: el modelo fue entrenado para transportar terminos del idioma destino escritos entre corchetes angulares en la frase de origen (`<term>`) directamente a la traduccion, lo que permite imponer terminologia controlada (nombres propios, terminos tecnicos, lexico de dominio).

Arquitectonicamente es un transformer encoder-decoder Marian de tamano base, con un total de grafos de 901,06 MB en fp32 y 227,03 MB en int8. La relevancia de esta publicacion es practica: ofrece una ruta de despliegue ligera y sin dependencia de PyTorch para un par linguistico poco cubierto, con cuantizacion dinamica int8 que reduce el peso a una cuarta parte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder Marian (MarianMT) |
| Parametros totales | no disponible (peso de grafos ONNX: 901,06 MB fp32, 227,03 MB int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica, `QuantType.QUInt8` por grafo) |
| Idiomas soportados | frances (fr) y shona (sn); direccion fr → sn |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafos `encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un MarianMT, la arquitectura seq2seq de traduccion automatica neuronal derivada del proyecto OPUS-MT de Helsinki-NLP. Se compone de un encoder y un decoder transformer con atencion cruzada, exportados aqui como tres grafos separados: encoder, decoder y decoder con cache de pasado (`decoder_with_past_model.onnx`). La exportacion se realizo con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process`, lo que mantiene los dos grafos de decoder separados y evita generar un `decoder_model_merged.onnx`.

El checkpoint original fue afinado por AfriSpeech bajo el marco Afri-Gloss-MT, cuyo objetivo es el control terminologico mediante marcado explicito en la frase de origen. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion int8 se genero por grafo con `onnxruntime.quantization.quantize_dynamic` y `weight_type=QuantType.QUInt8`, usando optimum 1.24.0, transformers 4.45.2, torch 2.4.1 (CPU) y onnxruntime 1.31.1. La paridad con el modelo fuente se verifico sobre 7 frases con decodificacion greedy: fp32 reproduce los mismos token ids en 7/7 casos, mientras que int8 coincide en 4/7.

## Capacidades

- Traduccion de texto frances → shona, unidireccional.
- Traduccion con terminologia restringida: transporta terminos marcados entre corchetes angulares (`<term>`) desde el origen a la salida, segun el entrenamiento Afri-Gloss-MT.
- Ejecucion en CPU mediante ONNX Runtime sin necesidad de PyTorch en produccion.
- Inferencia con cache de atencion (`decoder_with_past_model`), lo que acelera la generacion autoregresiva.
- Dos variantes de precision intercambiables (fp32 e int8) con el mismo tokenizador.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; es un modelo puramente de traduccion.
- Cobertura multilingue limitada exclusivamente al par fr → sn.

## Casos de uso

- Traduccion de documentacion oficial al shona: el modelo puede traducir textos administrativos o normativos del frances al shona, y el mecanismo de glosario permite fijar terminos institucionales concretos marcandolos en el origen para que aparezcan de forma consistente en la salida.
- Localizacion de interfaces y contenido web: integrado en un pipeline de publicacion, traduce cadenas de texto del frances al shona con el modelo int8 (227 MB), apto para servidores sin GPU.
- Preservacion linguistica y proyectos comunitarios: util para organizaciones que digitalizan material en shona a partir de fuentes en frances, con coste de infraestructura minimo al ejecutarse en CPU.
- Traduccion asistida con terminologia controlada en salud o educacion: marcando terminos medicos o pedagogicos entre corchetes en la frase fuente se fuerza su presencia en la traduccion, reduciendo la variabilidad terminologica.
- Despliegue en entornos con recursos limitados: el grafo int8 de 227 MB cabe en dispositivos de borde o contenedores pequenos, con ONNX Runtime como unico runtime.
- Procesamiento por lotes de corpus fr → sn: la exportacion ONNX permite ejecutar la traduccion dentro de pipelines de datos sin dependencias de entrenamiento, facilitando el escalado horizontal.
- Servicio de traduccion de bajo coste para ONG y medios locales que publiquen en frances y necesiten version en shona sin contratar APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (BLEU, MMLU, etc.) en la informacion disponible. El autor unicamente reporta pruebas de paridad con el modelo fuente sobre 7 frases con decodificacion greedy:

| Variante | Token ids identicos al modelo fuente |
|---|---|
| fp32 | 7/7 |
| int8 | 4/7 |

Ejemplos de salida reportados (fr → sn):

| Entrada | transformers = fp32 | int8 |
|---|---|---|
| Les enfants jouent dans la cour. | Vana vanotamba vari muchivanze. | Vana vanotamba vari muchivanze. |
| Fermez la porte quand vous partez, s'il vous plaît. | Ndapota, pfigai musuo pamunenge muchibuda. | Ndapota, pfigai musuo pamunenge muchibuda. |
| Le médecin vous verra demain matin. | Mangwana achange ari mangwanani. | Mangwana achange ari mangwanani. |
| Nous avons besoin d'eau potable pour le village. | Tinoda mvura yakachena yomumusha. | Tinoda mvura yakachena yomumusha medu. |

Sobre el glosario, el autor indica que 2 de 2 entradas con corchetes produjeron una salida que aun contiene corchetes angulares, y 4 de 6 terminos marcados aparecen literalmente en la salida (corchetes incluidos, ignorando mayusculas). Ninguna de las 5 entradas sin corchetes genero `<` o `>` en la salida.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 y en torno a 250-300 MB en int8 para los pesos; el consumo real depende de la longitud de secuencia y del batch.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en GPU integradas.
- Disenado para ejecucion en CPU: el autor exporto y valido con torch 2.4.1 en CPU y onnxruntime 1.31.1.
- Opciones de despliegue: ONNX Runtime mediante `optimum.onnxruntime.ORTModelForSeq2SeqLM`, con la posibilidad de seleccionar `subfolder="int8"`; tambien es integrable en servidores de inferencia compatibles con ONNX.
- No se dispone de datos de latencia ni throughput medidos. La presencia de `decoder_with_past_model.onnx` habilita cache de atencion, lo que reduce el coste por token generado respecto a una decodificacion sin cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TigreGotico/afrigloss-opus-mt-fr-sn-onnx (este) | no disponible (901 MB fp32) | no disponible | fr → sn | apache-2.0 | ONNX fp32/int8 |
| AfriSpeech/afrigloss-opus-mt-fr-sn | mismo modelo fuente | no disponible | fr → sn | apache-2.0 | safetensors/PyTorch |
| OPUS-MT generico (Helsinki-NLP) | tamano base Marian | no disponible | multiples pares | no disponible en esta ficha | PyTorch/ONNX |

El modelo fuente y esta exportacion son equivalentes en calidad (paridad 7/7 en fp32); la diferencia es el formato y la cuantizacion. Frente a los modelos OPUS-MT genericos, la ventaja especifica es el mecanismo de glosario Afri-Gloss-MT para terminologia controlada. No se dispone de datos de benchmarks que permitan comparar calidad de traduccion con alternativas.

## Limitaciones y advertencias

- Traduccion unidireccional: solo fr → sn; no soporta la direccion inversa.
- La model card advierte explicitamente que fue generada por un pipeline automatizado (Claude Opus 5.5 via Claude Code) y no ha sido revisada por una persona.
- La paridad int8 es parcial (4/7 frases con token ids identicos); el autor la reporta solo a titulo informativo y no como criterio de publicacion.
- El mecanismo de glosario no es fiable al 100%: 2 de 6 terminos marcados no aparecen literalmente, y en algunos casos la salida conserva los corchetes angulares, que deben eliminarse postprocesado.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluacion de calidad de traduccion (BLEU, COMET, etc.).
- El shona es una lengua de bajos recursos; es previsible una calidad inferior a la de pares con mas datos, aunque no se aportan metricas.
- No se dispone de la longitud maxima de contexto soportada; conviene validar con frases largas antes de usarlo en produccion.
- Licencia apache-2.0, que permite uso comercial, pero la responsabilidad sobre el modelo original recae en AfriSpeech.
- No hay `decoder_model_merged.onnx`; `from_pretrained` emite un aviso y recurre a los grafos separados, lo que puede requerir ajustes en integraciones que esperen el grafo fusionado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TigreGotico/afrigloss-opus-mt-fr-sn-onnx
- Modelo base: https://huggingface.co/AfriSpeech/afrigloss-opus-mt-fr-sn
- Commit de exportacion: `64497913a4ed6d8681749d0eb1dce9629755d504` (en el repositorio del modelo base)
- Optimum (libreria de exportacion y runtime): https://github.com/huggingface/optimum
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/OPUS-MT
