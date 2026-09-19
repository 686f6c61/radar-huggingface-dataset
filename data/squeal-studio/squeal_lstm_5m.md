# Squeal-Studio/squeal_lstm_5m

## Resumen

squeal_lstm_5m es un modelo de lenguaje de 5.857.280 parametros desarrollado por Squeal-Studio y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo base entrenado desde cero sobre texto en ruso, sin ajuste por instrucciones posterior, construido sobre una arquitectura LSTM (red neuronal recurrente) con capa de proyeccion, en lugar de los transformers habituales. Su ventana de contexto es de solo 256 tokens y su tokenizador SentencePiece personalizado maneja un vocabulario de 4.000 unidades.

El modelo se presenta explicitamente como un recurso de investigacion y experimentacion educativa. Con menos de 6 millones de parametros y una unica pasada de entrenamiento de 2 epocas sobre unos 500 MB de texto, su capacidad de generar texto coherente o factualmente correcto es muy limitada, como demuestran los propios ejemplos de generacion incluidos en su model card. No esta pensado para uso en produccion ni como asistente conversacional.

Su relevancia actual es fundamentalmente didactica: sirve como caso de estudio de una arquitectura recurrente clasica frente a los modelos transformer, como referencia para experimentos de tokenizacion en ruso con vocabularios muy reducidos y como base para comparativas de perplejidad en corpus rusos de bajo coste computacional. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es practicamente despreciable (menos de 0,1 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM decoder con capa de proyeccion (rnn/LSTM, model_type "lstm_lm") |
| Parametros totales | 5.857.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (unicamente pesos en safetensors; sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo de modelado personalizado (transformers) |

Parametros arquitectonicos internos:

| Parametro | Valor |
|---|---|
| embed_dim | 256 |
| hidden_dim | 512 |
| num_layers | 2 |
| dropout | 0.3 |
| vocab_size | 4.000 |
| Tokenizador | Unigram SentencePiece, character_coverage = 0.9999 |
| Pesos atados | no (tied_weights_keys vacio) |

## Arquitectura y entrenamiento

La arquitectura es un decodificador autorregresivo basado en LSTM de dos capas: una capa de embedding de 256 dimensiones, una LSTM con estado oculto de 512 unidades y dropout de 0,3, seguida de una capa de proyeccion lineal de 512 a 256 dimensiones y una cabeza de lenguaje lineal de 256 a 4.000 (el tamano del vocabulario). La funcion de perdida es entropia cruzada con indice de padding ignorado (0). El modelo no emplea atencion, ni mecanismos de decodificacion especulativa, ni atencion lineal, y no tiene pesos atados entre embedding y cabeza de salida.

El entrenamiento se realizo desde cero sobre un corpus de 210.000 documentos (~500 MB) en ruso, con la siguiente composicion: opensubtitles (23,8 %), habr (14,3 %), taiga_proza (14,3 %), ru_news (14,3 %), cultura_ru_edu (11,9 %), fineweb2_ru (11,9 %) y wikipedia (9,5 %). El preprocesado incluyo normalizacion Unicode NFKC, filtrado por ratio de caracteres cirilicos, filtrado de repeticiones degenerativas, filtrado por ratio de digitos y puntuacion, chunking por parrafos para Wikipedia, Fineweb2 y cultura, agrupacion de enunciados cortos, deduplicacion exacta por SHA-256 y deduplicacion aproximada mediante MinHash/LSH. El entrenamiento se ejecuto en una unica GPU Tesla T4 en fp16, durante 2 epocas y hasta el paso 5.870, con longitud de secuencia de 256 tokens, batch de 128 y tasa de aprendizaje 3e-3 con schedule coseno. No se aplicaron tecnicas de RLHF, DPO ni ajuste por instrucciones: es un modelo estrictamente de preentrenamiento.

## Capacidades

- Generacion de texto autorregresiva en ruso con decodificacion por muestreo (temperatura, top-k y penalizacion por repeticion, segun el codigo de ejemplo del autor).
- Continuacion de prompts cortos con coherencia local limitada a las primeras frases; a partir de ahi la deriva semantica y gramatical es notable.
- Reproduccion de registros superficiales de los subcorpus de entrenamiento: estilo periodistico (ru_news), estilo de foro tecnico (habr), narrativa (taiga_proza) y dialogos coloquiales (opensubtitles).
- Modelado de lenguaje a nivel de token para calculo de perplejidad sobre texto ruso.
- No dispone de soporte de tool calling ni function calling.
- No dispone de soporte de agentes, planificacion multi-paso ni razonamiento explicito.
- No dispone de modo "thinking", vision, audio ni ninguna modalidad adicional.
- Capacidad multilingue practicamente nula: el vocabulario de 4.000 tokens y el corpus de entrenamiento estan orientados exclusivamente al ruso.
- No es un modelo instruido: no sigue instrucciones, no mantiene formato conversacional y no respeta plantillas de chat.

## Casos de uso

- Docencia de arquitecturas recurrentes: permite ilustrar el funcionamiento interno de una LSTM (puertas de entrada, olvido y salida, estado oculto de 512 dimensiones) en un modelo lo bastante pequeno para entrenar y ejecutar en un portatil, comparandolo con un transformer equivalente.
- Experimentacion con tokenizadores de vocabulario reducido: su SentencePiece Unigram de 4.000 tokens con cobertura de caracteres 0,9999 sirve para estudiar el compromiso entre compresion de secuencia y manejo de palabras raras en lenguas eslavas.
- Generacion de texto creativo de baja fidelidad y uso ludico: la produccion de frases gramaticalmente plausibles pero semanticamente inconexas (como en los ejemplos de la model card) puede emplearse en ejercicios de escritura creativa o en demostraciones de las limitaciones de los modelos de lenguaje pequenos.
- Linea base de perplejidad para corpus rusos: su perplejidad final de 43,1 sobre el conjunto de validacion propio puede utilizarse como referencia inferior en comparativas de tecnicas de preprocesado o de arquitecturas alternativas sobre el mismo corpus.
- Aumento de datos sinteticos a pequena escala: para tareas de clasificacion de texto en ruso donde se necesiten ejemplos adicionales de baja calidad, el modelo puede generar variaciones superficiales de plantillas, siempre con revision humana posterior.
- Pruebas de integracion y CI en pipelines de HuggingFace: al ocupar menos de 25 MB en fp32, es util para validar extremo a extremo flujos de carga de modelos con codigo personalizado (trust_remote_code), serializacion safetensors y generacion por bucle manual.
- Demos offline y embebidas: su tamano permite ejecutarlo en CPU, en una Raspberry Pi o incluso en un navegador mediante exportacion a ONNX, para demostraciones sin conectividad ni GPU.
- Estudio de sesgos y del impacto del corpus de origen: la mezcla declarada de subcorpus (subtitulos, noticias, foros, Wikipedia) facilita analizar como una fuente concreta condiciona el estilo generado por un modelo recurrente pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta la evolucion de la perdida de evaluacion y la perplejidad durante el entrenamiento:

| Paso | Epoca | Perdida de evaluacion | Perplejidad |
|---|---|---|---|
| 1000 | 0,34 | 4,408 | 82,2 |
| 2000 | 0,68 | 3,994 | 54,1 |
| 3000 | 1,02 | 3,865 | 47,8 |
| 4000 | 1,36 | 3,800 | 44,7 |
| 5000 | 1,70 | 3,769 | 43,4 |
| 5870 | 2,00 | 3,763 | 43,1 |

No se especifica el conjunto de evaluacion utilizado, por lo que estos valores no son directamente comparables con los de otros modelos rusos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 23,4 MB en fp32 y 11,7 MB en fp16 a partir de los 5.857.280 parametros de safetensors; hay que sumar el estado de la LSTM y las activaciones, que en la practica anaden unos pocos megabytes.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el autor entreno el modelo en una unica NVIDIA Tesla T4 en fp16, que es ya sobredimensionada para la inferencia.
- Compatibilidad con GPU de consumo: cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090 o incluso graficas integradas con soporte CUDA, y funciona tambien en CPU sin problemas de rendimiento.
- Opciones de despliegue: al no ser una arquitectura transformer con atencion, no es compatible con vLLM, TGI, llama.cpp, Ollama ni con el formato GGUF. El despliegue requiere la libreria transformers con codigo personalizado (trust_remote_code) y el bucle de generacion manual que proporciona el autor, o bien una exportacion propia a ONNX/TorchScript.
- Latencia y throughput: no disponible; no se han publicado mediciones. Se espera un throughput elevado por el reducido numero de parametros, aunque la generacion es estrictamente secuencial al ser recurrente.

## Comparativa con modelos similares

No se dispone de comparativas verificadas en la informacion proporcionada. Como referencia de categoria, este modelo compite con otros modelos rusos de tamano pequeno, pero no hay datos de rendimiento publicados para ninguno de ellos en esta ficha que permitan una comparacion rigurosa.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| squeal_lstm_5m (Squeal-Studio) | LSTM de 2 capas | 5,86 M | 256 | Apache 2.0 | Perplejidad 43,1 (validacion propia) |
| Alternativas de tipo transformer pequeno en ruso | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia estructural mas relevante frente a un transformer de tamano comparable es que la LSTM no dispone de atencion global: la informacion debe propagarse por el estado recurrente, lo que penaliza la coherencia a larga distancia dentro de los 256 tokens de ventana.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes, no responde a preguntas de forma fiable y no mantiene formato conversacional.
- Generacion de baja calidad: los propios ejemplos del autor muestran frases incoherentes, mezcla de registros y errores gramaticales, con deriva tematica rapida.
- Riesgo alto de alucinacion: cualquier afirmacion factual generada debe considerarse falsa por defecto; el modelo no tiene mecanismo alguno de anclaje a hechos.
- Contexto muy limitado: 256 tokens impiden mantener coherencia mas alla de unos pocos parrafos y limitan cualquier tarea de resumen o de dialogos multi-turno.
- Vocabulario de 4.000 tokens: penaliza palabras raras, nombres propios, siglas, emojis y practicamente cualquier texto no ruso.
- Sesgos potenciales: el corpus mezcla subtitulos, noticias, foros y Wikipedia sin filtrado de sesgo declarado, por lo que pueden reproducirse estereotipos presentes en esas fuentes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero el propio autor advierte de que el modelo no esta destinado a produccion; el riesgo de generar contenido erroneo o sesgado recae en el usuario.
- Compatibilidad: no funciona con los runners habituales de inferencia (llama.cpp, Ollama, vLLM, TGI), lo que anade coste de integracion mediante codigo personalizado.
- Idiomas: soporte efectivo unicamente del ruso; el rendimiento en castellano o en cualquier otra lengua es inutilizable.
- Fechas de publicacion inusuales en los metadatos (creacion y actualizacion en septiembre de 2026), lo que puede indicar una fecha de sistema incorrecta en el momento de la subida; conviene verificar la trazabilidad del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Squeal-Studio/squeal_lstm_5m
- Sitio web del autor: https://squealstudio.ru
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo: las referencias devueltas corresponden a calculadoras de intervalos de tiempo y a conceptos administrativos alemanes sin relacion con el modelo.
