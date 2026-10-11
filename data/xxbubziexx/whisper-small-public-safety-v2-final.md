# xxbubziexx/whisper-small-public-safety-v2-FINAL

## Resumen

Whisper Small Public Safety v2 (FINAL) es un ajuste fino del modelo de reconocimiento automatico del habla Whisper Small de OpenAI, especializado en la transcripcion de trafico de radio de emergencias: frecuencias de policia, bomberos, servicios de emergencia medicos (EMS) y centros de despacho de incidentes. Lo desarrolla el usuario xxbubziexx como parte del ecosistema ScanScribe, orientado a la transcripcion de audio de despacho en tiempo real y a la generacion de inteligencia sobre incidentes. Sobre la base `sepiaapps/whisper-small.en-police-radio`, el autor aplica una segunda fase de ajuste centrada en normalizacion numerica inversa (ITN), reconocimiento de codigos 10 y adaptacion acustica a las particularidades de la radio analoga.

El modelo emplea la arquitectura estandar de Whisper Small, un transformer encoder-decoder con aproximadamente 241,7 millones de parametros, entrenado originalmente para tareas de ASR multilingue y ajustado aqui para un unico idioma (ingles) y un dominio muy concreto. Su principal propuesta de valor es que emite numeros en formato crudo (`193`, `1300`, `10-42`) en lugar de deletrearlos, lo que reduce la ambiguedad para parsers posteriores de sistemas CAD (Computer-Aided Dispatch) y herramientas de despacho.

Es relevante en el nicho de la transcripcion de comunicaciones de emergencia, donde los modelos ASR genericos obtienen resultados pobres por el ruido de squelch, los clics de repetidor y la jerga de codigos. Con todo, el WER declarado por el autor (40,48%) es elevado incluso para este dominio, lo que lo situa como un modelo experimental mas que como una solucion lista para produccion sin verificacion humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.734.144 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (arquitectura Whisper estandar; dato no explicito en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision original; no se enumeran variantes GGUF/INT8) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Small: un transformer encoder-decoder que procesa espectrogramas mel de audio en tramos de 30 segundos y genera tokens de texto de forma autoregresiva, con tokens especiales de idioma, tarea y marcas de tiempo. El modelo parte de `sepiaapps/whisper-small.en-police-radio`, un ajuste previo ya orientado a radio policial en ingles, sobre el que se realiza una segunda fase de ajuste fino (finetune) para este dominio de seguridad publica.

La informacion disponible no detalla el volumen de tokens de audio utilizados, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; se trata de un ajuste supervisado de ASR. Las innovaciones declaradas por el autor son de caracter practico y de formato mas que arquitectonicas: normalizacion numerica inversa (ITN) para emitir digitos crudos, reconocimiento especializado de codigos 10 (`10-4`, `10-42`, `10-97`), identificadores de unidad y tropa (por ejemplo `Troop-C`) y adaptacion acustica a trafico real de radio con clics de repetidor, colas de squelch y ruido de fondo estatico.

## Capacidades

- Transcripcion de voz a texto (ASR) en ingles sobre audio de radio de emergencias a 16 kHz mono.
- Normalizacion numerica inversa: salida de numeros como digitos crudos (`193`, `1300`, `10-42`) en lugar de palabras deletreadas, pensada para alimentar parsers CAD.
- Reconocimiento de codigos 10 estandar de policia y bomberos.
- Deteccion de identificadores de unidad y tropa propios de patrullas de carretera y condados.
- Robustez acustica frente a artefactos de radio: clics de repetidor, colas de squelch y ruido estatico.
- Soporte de prompt inicial (`initial prompt`) mediante `get_prompt_ids`, que permite guiar el formato de salida hacia convenciones de despacho.
- No dispone de capacidades multimodales (no vision ni audio generativo), tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de audio de despacho policial: el modelo convierte comunicaciones de radio en texto con codigos 10 y numeros en formato crudo, facilitando su volcado directo en un sistema CAD sin post-procesado de normalizacion.
- Generacion de registros de incidentes para bomberos y EMS: integrado en el ecosistema ScanScribe, permite construir transcripciones cronologicas de trafico de emergencia para auditoria y revision posterior.
- Monitorizacion en tiempo real de frecuencias de seguridad publica: alimenta paneles de incidentes con texto transcrito en ventanas de audio cortas, util en centros de coordinacion.
- Alimentacion de parsers y motores de reglas: gracias a la salida numerica cruda, los digitos y codigos pueden extraerse con expresiones regulares fiables para disparar alertas o clasificaciones.
- Investigacion academica sobre ASR en dominios ruidosos: sirve como punto de comparacion para estudiar el impacto del ruido de radio en modelos tipo Whisper.
- Prototipado de asistentes de despacho: con el prompt inicial configurable, se puede experimentar con el formato de salida antes de construir un producto final.
- Archivado y busqueda de grabaciones historicas: transcripcion por lotes de horas de audio de radio para permitir busqueda textual de incidentes.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (metrica no verificada de forma independiente):

| Metrica | Valor |
|---|---|
| Word Error Rate (WER) de validacion | 40,48% |
| Exact Sequence Accuracy | 10,77% |

Nota del autor: el WER se evalua contra transcripciones de dominio crudas y sin normalizar, lo que lo hace, segun el propio autor, mas exigente. No se han publicado en la informacion disponible resultados comparativos de MMLU, HumanEval, GSM8K ni de otros modelos ASR sobre el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP32 (241,7 M de parametros), en torno a 0,5 GB en FP16 y cerca de 0,25-0,3 GB en cuantizacion INT8.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM. Para procesamiento por lotes de alto volumen resultan adecuadas A100, H100, L40S o RTX con memoria suficiente.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (RTX 3060, 4060, 4090, etc.) e incluso en CPU para inferencia en tiempo real de audio de baja concurrencia.
- Opciones de despliegue: transformers (referencia en la model card), faster-whisper, whisper.cpp, TGI y vLLM (este ultimo con soporte de Whisper). Ollama no soporta oficialmente la familia Whisper.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-public-safety-v2-FINAL | 241,7 M | 30 s de audio | 40,48% (dominio, sin verificar) | MIT | HuggingFace |
| openai/whisper-small | ~244 M | 30 s de audio | no disponible en esta informacion | MIT | HuggingFace |
| sepiaapps/whisper-small.en-police-radio (modelo base) | ~244 M | 30 s de audio | no disponible en esta informacion | no disponible | HuggingFace |

No se dispone de resultados de benchmark homogeneos para los modelos comparables dentro de la informacion proporcionada, por lo que la comparacion de rendimiento cuantitativa no puede establecerse con rigor.

## Limitaciones y advertencias

- El WER declarado del 40,48% es muy elevado; la precision de secuencia exacta es de solo el 10,77%, lo que implica que la mayoria de transcripciones completas contienen errores. No es apto para uso autonomo sin revision humana.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible pero incorrecto, especialmente con audio ininteligible o silencios.
- Entrenado exclusivamente en ingles; no soporta otros idiomas ni mezcla de idiomas.
- Dominio muy restringido (radio de seguridad publica); el rendimiento fuera de ese contexto sera previsiblemente peor.
- La metrica WER no esta verificada de forma independiente y procede del propio autor.
- Licencia MIT, lo que permite uso comercial, pero el modelo hereda las caracteristicas de la arquitectura Whisper Small original; conviene revisar las condiciones de la licencia del modelo base y de OpenAI para el modelo original.
- No incluye salvaguardas de contenido ni verificacion factual: su uso en entornos de emergencia reales debe acompanarse siempre de supervision humana.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xxbubziexx/whisper-small-public-safety-v2-FINAL
- Modelo base: https://huggingface.co/sepiaapps/whisper-small.en-police-radio
- Repositorio ScanScribe: https://github.com/xxbubziexx/ScanScribe
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper

No se han encontrado en la busqueda web enlaces relevantes adicionales sobre este modelo; los resultados devueltos no guardan relacion con el contenido.
