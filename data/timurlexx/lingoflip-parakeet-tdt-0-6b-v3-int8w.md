# timurlexx/lingoflip-parakeet-tdt-0.6b-v3-int8w

## Resumen

LingoFlip Parakeet TDT 0.6B v3 int8w es una exportacion ONNX del modelo de reconocimiento automatico del habla (ASR) nvidia/parakeet-tdt-0.6b-v3, publicada por el usuario timurlexx para su uso con la libreria sherpa-onnx. El modelo esta pensado para alimentar el teclado LingoFlip, que ofrece dictado por voz sin conexion a servidores externos, y esta optimizado para ejecucion en CPU. La arquitectura subyacente es un transducer TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parametros, con encoder, decoder y joiner separados.

La particularidad tecnica de esta variante es su estrategia de cuantizacion: solo se cuantizan a int8 (dinamica, por canal, unsigned) las multiplicaciones de matrices con pesos constantes, mientras que los productos de atencion, las convoluciones y el resto de operaciones permanecen en float32. Segun la model card, esto permite conservar casi toda la precision del modelo completo manteniendo una velocidad de CPU comparable a la build int8 convencional, a costa de un mayor tamano en disco (935 MB frente a 670 MB).

El modelo cubre diez idiomas (ruso, ingles, aleman, frances, espanol, italiano, portugues, polaco, ucraniano y neerlandes) y se distribuye bajo licencia CC BY 4.0. Su interes practico radica en ser una alternativa lista para produccion en dictado offline multilingue sobre hardware modesto, con una tasa de error notablemente inferior a la cuantizacion int8 estandar de sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer): encoder, decoder y joiner; export ONNX |
| Parametros totales | 0,6 mil millones (aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica por canal (unsigned) solo en multiplicaciones de matrices con pesos constantes; atencion, convoluciones y demas operaciones en float32 |
| Idiomas soportados | ru, en, de, fr, es, it, pt, pl, uk, nl |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) + tokens.txt, empaquetado en .tar.bz2 |

## Arquitectura y entrenamiento

El modelo base es nvidia/parakeet-tdt-0.6b-v3, un transducer TDT de NVIDIA en el que el decoder predice conjuntamente tokens y duraciones, lo que reduce el numero de pasos de decodificacion frente a un transducer clasico. Esta variante no ha sido entrenada ni afinada: la model card indica explicitamente que no hubo entrenamiento ni fine-tuning, solo exportacion a ONNX con la receta de sherpa-onnx y la cuantizacion descrita.

La innovacion tecnica de esta build es la cuantizacion selectiva: unicamente las multiplicaciones de matrices con pesos constantes se convierten a int8 dinamica por canal, dejando atencion y convoluciones en float32. Segun el autor, esto preserva casi toda la precision del modelo completo con una velocidad de CPU practicamente identica a la build int8 habitual. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automatico del habla (ASR) offline multilingue en diez idiomas: ru, en, de, fr, es, it, pt, pl, uk, nl.
- Decodificacion greedy con transducer TDT, lo que reduce pasos de decodificacion y favorece la latencia en CPU.
- Ejecucion en CPU sin GPU dedicada, con un factor de tiempo real de 0,181 con 4 hilos de CPU (segun la model card).
- Integracion con sherpa-onnx mediante `OfflineRecognizer.from_transducer(..., model_type="nemo_transducer")`.
- Uso previsto en dictado por voz offline para teclados y aplicaciones de escritorio.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio de entrada mas alla del reconocimiento de voz.

## Casos de uso

- Dictado por voz offline en escritorio: integrado en el teclado LingoFlip, permite transcribir voz a texto sin enviar audio a la nube, gracias a su ejecucion en CPU y a su tamano contenido.
- Aplicaciones de accesibilidad: transcripcion en tiempo real para usuarios con dificultades motoras, con latencia baja (factor de tiempo real inferior a 0,2 con 4 hilos).
- Notas de reunion y actas: transcripcion multilingue de audio grabado en entornos con idiomas como espanol, ingles, aleman o frances, en servidores sin GPU.
- Subtitulado de contenido audiovisual: generacion de subtitulos en varios idiomas sobre hardware convencional, con el modelo cargado en memoria (935 MB en disco).
- Sistemas de atencion al cliente con voz: transcripcion previa de llamadas en local antes de procesarlas con un LLM, reduciendo costes de API y preservando la privacidad del audio.
- Investigacion en ASR multilingue: banco de pruebas reproducible para comparar estrategias de cuantizacion (int8 selectiva frente a int8 completa) sobre el mismo modelo base.
- Despliegue en dispositivos de recursos limitados: uso en entornos sin GPU, como portatiles o mini-PC, donde un modelo de 0,6 B en ONNX int8 resulta viable en CPU.

## Benchmarks y rendimiento

Datos publicados en la model card. WER medido sobre las primeras 300 frases del test de FLEURS por idioma, decodificacion greedy, texto en minusculas y sin puntuacion. Factor de tiempo real medido con 4 hilos de CPU.

| Modelo | Tamano | WER ru | WER en | Factor de tiempo real (4 hilos CPU) |
|---|---|---|---|---|
| sherpa-onnx int8 habitual | 670 MB | 8,09 % | 6,97 % | 0,198 |
| Este modelo (int8 selectiva) | 935 MB | 5,39 % | 5,37 % | 0,181 |

No se han publicado resultados de benchmarks para el resto de los idiomas ni para tareas distintas de ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo esta disenado para ejecucion en CPU; en GPU el consumo dependeria del runtime y no esta documentado.
- GPU recomendadas: no disponibles; el modelo es una exportacion ONNX para sherpa-onnx orientada a CPU.
- Cabe en GPU de consumo: no disponible como dato documentado; el tamano de 935 MB en disco sugiere que seria viable en cualquier GPU con memoria suficiente, pero no hay cifras publicadas.
- Opciones de despliegue: sherpa-onnx con `OfflineRecognizer.from_transducer` y `model_type="nemo_transducer"`; el paquete incluye encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx y tokens.txt.
- Latencia y throughput: factor de tiempo real de 0,181 con 4 hilos de CPU, es decir, aproximadamente 5,5 veces mas rapido que tiempo real en ese escenario. No se documentan cifras de throughput en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| Este modelo (LingoFlip Parakeet TDT 0.6B v3 int8w) | 0,6 B | no disponible | 10 | CC BY 4.0 | ONNX int8 selectiva | WER ru 5,39 %, en 5,37 %; RTF 0,181 |
| sherpa-onnx int8 habitual (mismo modelo base) | 0,6 B | no disponible | 10 | CC BY 4.0 | ONNX int8 completa | WER ru 8,09 %, en 6,97 %; RTF 0,198 |
| nvidia/parakeet-tdt-0.6b-v3 (modelo base) | 0,6 B | no disponible | 10 | CC BY 4.0 | pesos originales (no ONNX) | no disponible en esta ficha |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos del modelo ni del modelo base en la informacion disponible.
- Riesgo de alucinacion: propio de los sistemas ASR; el WER publicado (5,39 % en ruso y 5,37 % en ingles sobre FLEURS) indica errores no triviales en condiciones de test.
- Los benchmarks publicados solo cubren ruso e ingles; el rendimiento en los otros ocho idiomas no esta documentado.
- La cuantizacion selectiva aumenta el tamano en disco a 935 MB frente a 670 MB de la build int8 convencional; conviene verificar el espacio disponible en despliegues embebidos.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion a NVIDIA y al autor de la exportacion; es obligatorio conservar la atribucion.
- No hubo entrenamiento ni fine-tuning en esta variante; cualquier mejora de precision respecto al modelo base depende exclusivamente de la exportacion y cuantizacion.
- La integracion requiere sherpa-onnx y el tipo de modelo `nemo_transducer`; no es un checkpoint compatible con runtimes genericos de transformers sin conversion adicional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopcion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timurlexx/lingoflip-parakeet-tdt-0.6b-v3-int8w
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Checksum SHA-256 del paquete: 79437bf74edbe208b768bf0d265ae524dba7cf27fecb9e7b16e3b397f74a260c
