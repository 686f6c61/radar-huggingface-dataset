# V4ldeLund/owsm-v4-small-danish-1epoch

## Resumen

Se trata de un ajuste fino completo (full-parameter fine-tune) del checkpoint base espnet/owsm_v4_small_370M para reconocimiento automatico del habla (ASR) en danes. Lo publica el usuario V4ldeLund y esta pensado como una linea base reproducible de una sola epoca sobre el corpus danes CoRal y fuentes asociadas (FTSpeech, NST/Språkbanken, Nota, Common Voice y FLEURS). El modelo resuelve la tarea de transcripcion de voz a texto mono-idioma (da) y su relevancia estriba en que documenta de forma exhaustiva el protocolo de entrenamiento, las huellas SHA-256 del checkpoint y las metricas por conjunto de evaluacion.

El modelo conserva el tamano del base, en torno a 370 millones de parametros, y se distribuye dentro del ecosistema ESPnet, por lo que su uso requiere ese stack en lugar de frameworks genericos de transformers. No es un modelo generativo multimodal ni un asistente conversacional: es un sistema puro de reconocimiento de voz especializado en danes.

El resultado publicado es modesto en calidad: un WER medio de 42,34 % y un CER medio de 18,29 % sobre cinco conjuntos de evaluacion, con un rendimiento especialmente flojo en habla conversacional (WER 61,99 % en coral_conversation). Se presenta explicitamente como una ejecucion unica sin intervalos de confianza ni auditoria de solapamiento con el entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; heredada del base OWSM v4 small (encoder-decoder de atencion de la familia ESPnet/OWSM) |
| Parametros totales | ~370 M (heredados del base espnet/owsm_v4_small_370M; el ajuste es full-parameter) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Danes (da) |
| Licencia | coral-openrail-and-upstream-terms (LICENSE.coral; base OWSM en CC-BY-4.0) |
| Formato de pesos | Checkpoint nativo de ESPnet (repo de 1,5 GB); no se distribuyen pesos GGUF ni safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de este ajuste; se indica unicamente que es un fine-tune de parametros completos del checkpoint fijado espnet/owsm_v4_small_370M, con identificador SHA-256 cf3e6cbcee0e5302d3cf80d225d02cf5fade33d4960d700e09b2305d412d7aa8 y huella de configuracion d6b7d7dc29452a2fa09501f4b5d596c134bef74cb17117249cea31534a1736f8. La familia OWSM (Open Whisper-style Speech Model) corresponde a modelos de reconocimiento de voz de estilo Whisper distribuidos a traves del ecosistema ESPnet.

En cuanto al entrenamiento, se ejecuto una sola epoca sobre 1.676.409 clips y se valido con 22.329 clips. La composicion del corpus de entrenamiento, tras exclusiones y filtrado, es la siguiente:

| Fuente | Clips | Horas | Peso |
|---|---:|---:|---:|
| coral_read_aloud | 299.253 | 521,44 | 18,8 % |
| coral_conversation | 146.844 | 143,38 | 5,2 % |
| ftspeech | 983.989 | 1.689,95 | 61,0 % |
| nst_da | 178.080 | 232,99 | 8,4 % |
| nota | 62.176 | 169,70 | 6,1 % |
| fleurs | 2.463 | 7,48 | 0,3 % |
| common_voice | 3.604 | 4,20 | 0,2 % |

El audio exacto reservado para evaluacion se excluyo durante el ajuste. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de optimizacion adicionales, ni el numero total de tokens de audio procesados.

## Capacidades

- Reconocimiento automatico del habla mono-idioma en danes (da).
- Transcripcion de audio a texto con salida de WER y CER medibles.
- Evaluacion por lotes con calculo de RTF (factor de tiempo real) sobre los conjuntos documentados.
- Inferencia significativamente mas rapida que el tiempo real (RTF entre 0,016 y 0,030 segun el conjunto).
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma, tool calling, function calling, uso como agente ni modo de razonamiento.
- No se documentan capacidades multimodales (vision, audio generativo) ni de comprension de texto fuera del condicionamiento acustico propio del ASR.

## Casos de uso

- Transcripcion de audio danes por lotes: dado su RTF de 0,016-0,030, el modelo procesa audio decenas de veces mas rapido que en tiempo real, lo que lo hace apto para pipelines de transcripcion masiva sobre repositorios de audio existentes.
- Investigacion en ASR de bajo recurso: sirve como linea base reproducible de una epoca para comparar tecnicas de fine-tuning sobre danes, gracias a que se publican configuracion, huellas y registro completo de la ejecucion.
- Evaluacion de corpus daneses: permite obtener WER/CER sobre FLEURS, Common Voice y los subconjuntos de CoRal, util para auditar la calidad acustica de dichos corpus.
- Prototipado academico: al ser un checkpoint pequeno (~370 M) y de codigo abierto, encaja en entornos de laboratorio con recursos limitados para experimentar con ajustes posteriores.
- Subtitulado de contenido audiovisual en danes: transcripcion de emisiones o material de archivo, siempre que la calidad exigida tolere el WER elevado en habla conversacional (superior al 60 %).
- Analisis de accesibilidad: generacion de transcripciones para contenido hablado danes destinado a personas con discapacidad auditiva, con revision humana obligatoria por el nivel de error.

## Benchmarks y rendimiento

WER y CER expresados en porcentaje (menor es mejor). Datos publicados por el autor en results.md / results.json.

| Dataset | Clips | WER | CER | RTF |
|---|---:|---:|---:|---:|
| fleurs | 930 | 40,37 | 14,35 | 0,017 |
| coral_conversation | 8.438 | 61,99 | 36,54 | 0,030 |
| coral_read_aloud | 9.122 | 46,23 | 17,32 | 0,016 |
| ftspeech | 5.534 | 28,11 | 11,44 | 0,025 |
| cv17 | 2.756 | 34,99 | 11,79 | 0,018 |
| Media de los cinco conjuntos | — | 42,34 | 18,29 | — |

No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1,5-3 GB con precision de 32 bits para un modelo de ~370 M; menor a 1 GB en 16 bits o cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso podria ejecutarse en CPU para uso no intensivo.
- Opciones de despliegue: ESPnet (stack nativo del modelo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuyen pesos en formatos compatibles (GGUF, safetensors estandar).
- Latencia y throughput: el RTF medido esta entre 0,016 y 0,030, es decir, entre 33 y 62 veces mas rapido que el tiempo real en el protocolo de evaluacion documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER danes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| V4ldeLund/owsm-v4-small-danish-1epoch | ~370 M | No disponible | 42,34 % (media, 5 conjuntos) | coral-openrail-and-upstream-terms | HuggingFace, formato ESPnet |
| espnet/owsm_v4_small_370M (base) | ~370 M | No disponible | No disponible | CC-BY-4.0 | HuggingFace, ESPnet |
| Whisper small / medium (referencia de familia) | 244 M / 769 M | No disponible | No disponible | MIT/Apache segun variante | HuggingFace y multiples formatos |

No se dispone de resultados de benchmarks comparables de otros modelos daneses en la informacion proporcionada, por lo que la comparativa cuantitativa queda limitada a las metricas del propio modelo.

## Limitaciones y advertencias

- Ejecucion unica (una sola semilla) sin intervalos de confianza: los resultados no deben interpretarse como robustos estadisticamente.
- No se ha realizado una auditoria exhaustiva del solapamiento entre los datos de entrenamiento y los del modelo base.
- Solo soporta danes; no hay evidencia de capacidades multilingues.
- Alucinacion y errores de transcripcion: el WER medio del 42,34 % y el CER medio del 18,29 % son elevados, con un caso extremo de WER 61,99 % en habla conversacional.
- Entrenamiento de solo 1 epoca sobre 1,67 millones de clips: es una linea base, no un modelo afinado para produccion.
- Licencia restrictiva: sujeta a la licencia CoRal (LICENSE.coral) con condiciones y restricciones de uso posteriores; la licencia del codigo del repositorio no relicencia el modelo ni las grabaciones de origen. El base OWSM es CC-BY-4.0.
- Obligacion de atribucion: hay que acreditar al proyecto CoRal, Folketinget/FTSpeech, NST/Språkbanken, Nota, contribuyentes de Mozilla Common Voice y Google FLEURS.
- No se redistribuye audio de entrenamiento ni de benchmark.
- Los pesos no se distribuyen en formatos estandar de inferencia (GGUF, safetensors), lo que limita su integracion en stacks fuera de ESPnet.
- Cero descargas y cero "likes" en el momento de la ficha: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/V4ldeLund/owsm-v4-small-danish-1epoch
- Licencia CoRal: https://huggingface.co/V4ldeLund/owsm-v4-small-danish-1epoch/blob/main/LICENSE.coral
- Notas de experimento: https://huggingface.co/V4ldeLund/owsm-v4-small-danish-1epoch/blob/main/experiment.md
- Definicion de configuracion: https://huggingface.co/V4ldeLund/owsm-v4-small-danish-1epoch/blob/main/config.yaml
- Resultados completos: https://huggingface.co/V4ldeLund/owsm-v4-small-danish-1epoch/blob/main/results.md
- Registro de resultados en JSON: https://huggingface.co/V4ldeLund/owsm-v4-small-danish-1epoch/blob/main/results.json
- Tarjeta del modelo base: https://huggingface.co/V4ldeLund/owsm-v4-small-danish-1epoch/blob/main/BASE_MODEL_CARD.md
- Modelo base OWSM v4 small: https://huggingface.co/espnet/owsm_v4_small_370M
- Terminos de las fuentes de FTSpeech: https://www.ft.dk/da/aktuelt/tv-fra-folketinget/deling-og-rettigheder
