# Trelis/duplex-0

## Resumen

duplex-0 es un modelo de voz a voz (speech-to-speech) de pequeno tamano desarrollado por Trelis, entrenado desde pesos aleatorios sobre aproximadamente 750 horas de habla en ingles. Se trata de un checkpoint de investigacion, no de un asistente utilizable: segun el propio autor, su habla es aproximadamente la mitad de inteligible que el habla real en su benchmark interno. El modelo se publica como informe de entrenamiento de las ejecuciones del 17 de noviembre de 2026, con los scripts de entrenamiento incluidos en el repositorio.

Arquitectonicamente es un transformer temporal de 12 capas y 768 dimensiones que predice un paso por cada trama de 80 ms, combinado con un transformer de profundidad de 2 capas y 256 dimensiones que predice los tokens de audio de esa trama. El audio se representa con tokens Mimi (8 codebooks a 12.5 tramas por segundo desde audio de 24 kHz), con dos pistas de audio, una por hablante, de modo que cada trama contiene 16 codebooks. El modelo base tiene 201 millones de parametros; la variante con dos pistas de texto anade una segunda cabeza de salida de texto y alcanza los 225 millones.

Su relevancia es fundamentalmente metodologica: compara tres configuraciones de entrenamiento (solo audio, una pista de texto y dos pistas de texto) sobre los mismos datos, semilla y ajustes, y publica metricas detalladas de bits por segundo, inteligibilidad y gestion de turnos. No esta pensado para produccion ni para uso comercial practico, sino como referencia reproducible para investigacion en modelos conversacionales de voz de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer temporal (12 capas x 768) + transformer de profundidad (2 capas x 256); prediccion por trama de 80 ms |
| Parametros totales | 201 millones (solo audio y una pista de texto); 225 millones (dos pistas de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema de prediccion autorregresiva por tramas sobre tokens de audio Mimi. Un transformer temporal de 12 capas y 768 dimensiones procesa el estado y predice un paso por cada trama de 80 ms; a continuacion, un transformer de profundidad de 2 capas y 256 dimensiones genera los tokens de audio de esa trama. El audio se tokeniza con Mimi en 8 codebooks a 12.5 tramas por segundo desde 24 kHz. El modelo mantiene dos pistas de audio, una por hablante, por lo que cada trama contiene 16 codebooks. En las variantes con texto, este se representa como tokens word-piece en la trama donde empieza cada palabra, con un token de avance que cierra el texto de cada trama; la variante de dos pistas de texto anade una segunda cabeza de salida y escribe las palabras del otro hablante 320 ms (4 tramas) despues de que empiece cada palabra.

Los datos de preentrenamiento suman 749 horas de habla en ingles: 408 horas de YODAS3 y 341 horas de podcasts publicos. La etapa conversacional usa 156 horas de conversacion de podcast entre dos hablantes con turnos frecuentes y pista de audio separada por hablante, subconjunto de los datos de preentrenamiento. Se reservan grabaciones completas y feeds de podcast para validacion y test, unas 4 horas por fuente. El entrenamiento se hizo con una H100 por opcion, batch 8, bf16 y compilado, con semilla 20261117. El preentrenamiento uso warmup de 100 pasos y luego tasa constante de 6e-4, deteniendose cuando el primer codebook en audio reservado no mejoraba en dos evaluaciones (una por epoca). La etapa conversacional duro una epoca con pico de 2e-4, warmup de 60 pasos y annealing en el ultimo 20%. Los tiempos de preentrenamiento fueron de 37 minutos (solo audio, 13.392 pasos), 63 minutos (una pista de texto, 20.595 pasos) y 73 minutos (dos pistas de texto, 17.064 pasos); la epoca conversacional tardo entre 2 y 5 minutos.

## Capacidades

- Generacion de voz a voz: el modelo recibe audio de dos hablantes y genera audio de respuesta, con pistas separadas por hablante.
- Prediccion de tokens de audio Mimi en 8 codebooks a 12.5 tramas por segundo.
- Escritura de texto auxiliar (en las variantes con pistas de texto): genera las palabras de la pista que habla justo antes de pronunciarlas, y en la variante de dos pistas tambien las del otro hablante con 320 ms de retraso.
- Gestion de turnos conversacionales: el benchmark de turn-taking mide su capacidad de hablar en las pausas del interlocutor y callar mientras este habla.
- Continuacion de audio a partir de un prompt de 10 segundos durante 20 segundos.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio de entrada mas alla del propio dialogo de voz, ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en modelos conversacionales de voz de bajo coste: el modelo entrena en menos de dos horas en una sola H100, lo que permite reproducir experimentos de arquitectura y comparar variantes (solo audio, una pista de texto, dos pistas de texto) con presupuesto minimo.
- Estudio de representaciones de audio con Mimi: sirve para analizar como se distribuye la informacion entre codebooks (el primer codebook concentra la mayor parte del contenido, con 60-71 bits por segundo frente a 800 bits por segundo del audio completo) y para probar tokenizadores alternativos.
- Analisis de estrategias de texto auxiliar en speech-to-speech: permite medir el efecto de anadir una o dos pistas de texto sobre los bits por segundo del primer codebook (reduccion del 12% al 14%) y sobre la inteligibilidad.
- Evaluacion de modelos de gestion de turnos: el benchmark de turn-taking con llamante real y las metricas de solapamiento de voz permiten comparar politicas de diálogo y de deteccion de pausas.
- Docencia y divulgacion: como checkpoint pequeno y reproducible con scripts incluidos, es util para explicar el pipeline completo de tokenizacion Mimi, transformers de profundidad y entrenamiento por tramas.
- Base para experimentos de destilacion o inicializacion: al ser un modelo de 201-225 millones de parametros con licencia Apache 2.0, puede servir como punto de partida para ajustes finos en dominios concretos, siempre asumiendo su baja calidad de habla actual.

## Benchmarks y rendimiento

Resultados publicados por el autor. La inteligibilidad se mide como palabras por minuto confirmadas por dos transcriptores tras continuar un prompt de 10 segundos durante 20 segundos (habla real: 132,8). El turn-taking se mide con un llamante real (habla real: 0,47). Muestreo con temperatura 1 y top-k 250; media de tres semillas sobre 24 fragmentos reservados, con rango entre semillas.

| Opcion | Etapa | Palabras por minuto confirmadas | Turn-taking | Voz sobre el llamante |
|---|---|---|---|---|
| Solo audio | Preentrenamiento | 69,5 (65,6-74,6) | 0,37 (0,34-0,41) | 31% |
| Solo audio | Conversacional | 60,4 (58,6-63,5) | 0,35 (0,34-0,38) | 17% |
| Una pista de texto | Preentrenamiento | 66,8 (61,4-70,1) | 0,31 (0,29-0,32) | 28% |
| Una pista de texto | Conversacional | 67,5 (61,6-74,4) | 0,31 (0,20-0,37) | 32% |
| Dos pistas de texto | Preentrenamiento | 62,9 (61,...) | no disponible | no disponible |

Bits por segundo en audio reservado de preentrenamiento (menor es mejor; suelo de bigrama 82,0 y de trigrama 80,5):

| Opcion | Checkpoint | Audio | Primer codebook | Texto, pista hablante | Texto, pista oyente |
|---|---|---|---|---|---|
| Solo audio | Preentrenamiento, epoca 10 | 817,5 | 70,7 | ninguno | ninguno |
| Una pista de texto | Preentrenamiento, epoca 13 | 804,1 | 62,4 | 13,0 (5,87 bits por token de palabra) | ninguno |
| Dos pistas de texto | Preentrenamiento, epoca 10 | 807,7 | 60,9 | 12,3 (5,29 bits por token de palabra) | 4,6 (1,74 bits por token de palabra) |
| Solo audio | Tras etapa conversacional | 812,5 | 70,2 | ninguno | ninguno |
| Una pista de texto | Tras etapa conversacional | 799,5 | 61,9 | 13,1 (5,96 bits por token de palabra) | ninguno |
| Dos pistas de texto | Tras etapa conversacional | 801,4 | 60,2 | 12,2 (5,31 bits por token de palabra) | 4,4 (1,75 bits por token de palabra) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 201-225 millones de parametros, el peso en bf16 seria de aproximadamente 0,4-0,5 GB, pero el autor no publica requisitos de inferencia ni cuantizaciones.
- GPU de entrenamiento: una sola H100 por opcion, batch 8, bf16, compilado.
- GPU consumer: no se documenta compatibilidad; por tamano de parametros cabria en GPUs consumer, pero no hay datos de latencia ni de soporte.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio incluye scripts de entrenamiento en `scripts/`.
- Latencia y throughput: no disponibles. Solo se publican tiempos de entrenamiento (37-73 minutos de preentrenamiento y 2-5 minutos de etapa conversacional).

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la informacion proporcionada. El autor no incluye referencias a modelos alternativos de speech-to-speech ni datos de terceros.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| duplex-0 | 201-225 M | no disponible | Apache 2.0 | Hugging Face (Trelis/duplex-0) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Calidad de habla muy baja: entre 60 y 68 palabras por minuto confirmadas frente a 132,8 del habla real; el autor lo describe como aproximadamente la mitad de inteligible que el habla real.
- El texto generado por las pistas de texto esta relacionado con el habla pero esta lejos de ser una transcripcion fiable.
- Checkpoint de investigacion, no un asistente utilizable en produccion.
- Entrenado solo con habla en ingles; no hay soporte multilingue.
- No se documentan sesgos especificos, pero el entrenamiento con podcasts publicos y YODAS3 puede arrastrar sesgos de dominio, acento y estilo de esos corpus.
- Riesgo de alucinacion en el contenido hablado y en el texto auxiliar, sin mecanismos de verificacion.
- Longitud de contexto no documentada; la evaluacion se limita a prompts de 10 segundos y continuaciones de 20 segundos.
- La licencia Apache 2.0 permite uso comercial, pero la calidad actual hace inviable su uso en produccion sin un ajuste fino sustancial y una evaluacion propia.
- No se publican cuantizaciones ni requisitos de inferencia, lo que dificulta el despliegue.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta, lo que refleja su caracter experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Trelis/duplex-0
- Scripts de entrenamiento: https://huggingface.co/Trelis/duplex-0/tree/main/scripts
- Dataset de preentrenamiento YODAS3 Mimi: https://huggingface.co/datasets/Trelis/duplex-pre-training-yodas3-mimi
- Dataset de preentrenamiento de podcasts Mimi: https://huggingface.co/datasets/Trelis/duplex-pre-training-podcasts-mimi
- Dataset conversacional de podcasts Mimi: https://huggingface.co/datasets/Trelis/duplex-conversational-podcasts-mimi
