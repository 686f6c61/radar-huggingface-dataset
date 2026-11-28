# wasi-master/addis-scribe-oromo-streaming-sherpa-onnx

## Resumen

Addisscribe Oromo Streaming para sherpa-onnx es un artefacto de despliegue derivado de `addisai/addis-scribe-oromo-streaming`, un modelo de reconocimiento automatico del habla (ASR) en modo streaming para el idioma oromo. Lo publica el usuario `wasi-master` y no es un modelo entrenado de cero, sino una exportacion del modelo base de Addis AI realizada con el exportador Nemotron 3.5 de sherpa-onnx, con cuantizacion int8 y un tamano de chunk de 320 ms, pensada para integrarse en el teclado offline WM Keyboard.

El problema que resuelve es concreto: permitir dictado por voz en oromo sin conexion y con baja latencia, empaquetando el modelo en un formato que la libreria sherpa-onnx puede consumir directamente (ONNX con metadatos de streaming). Al estar cuantizado a int8 y segmentado en chunks de 320 ms, esta pensado para ejecucion en dispositivos con recursos limitados, no para servidores de altas prestaciones.

La relevancia es doble: por un lado, cubre una lengua de bajos recursos (oromo) con un modelo de reconocimiento en streaming, un caso poco frecuente en el ecosistema open source; por otro, demuestra el flujo de exportacion de modelos ASR a sherpa-onnx como via practica para llevar investigacion a produccion en el borde. La informacion publica disponible sobre arquitectura interna, datos de entrenamiento y metricas es muy escasa: la model card se limita a describir el proceso de exportacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: addisai/addis-scribe-oromo-streaming; exportado con el exportador Nemotron 3.5 de sherpa-onnx) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa audio en chunks de 320 ms) |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | oromo (el prompt propio del modelo, indice 59, actua como `auto_prompt_id` del encoder; no requiere fijar idioma en el stream) |
| Licencia | openmdw-1.1 (etiquetada como `other` en el repo, con enlace a https://openmdw.ai/license/1-1/) |
| Formato de pesos | ONNX (formato nativo de sherpa-onnx) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base `addisai/addis-scribe-oromo-streaming` en la documentacion proporcionada. Por el nombre y el uso del exportador Nemotron 3.5 de sherpa-onnx, se trata de un modelo ASR de tipo streaming con encoder y decoder, pero no se confirman detalles como el numero de capas, la dimension de los embeddings, el tipo de atencion ni el mecanismo exacto de streaming.

Respecto al entrenamiento, la model card indica unicamente que todo el entrenamiento fue realizado por Addis AI. No se especifican el volumen de horas de audio, la composicion del dataset, si hubo aumentacion de datos ni si se aplicaron tecnicas de ajuste fino supervisado o alineacion. La aportacion de esta publicacion es la exportacion: se tomo el checkpoint `75d604dfd2cd4e9b03665e017a9126112881cd4d` del modelo base y se convirtio a ONNX con cuantizacion int8 y chunk de 320 ms mediante el exportador Nemotron 3.5 de sherpa-onnx, dejando fijado el prompt propio del modelo (indice 59) como `auto_prompt_id` del encoder para que no sea necesario seleccionar idioma en cada stream.

## Capacidades

- Reconocimiento automatico del habla en oromo en modo streaming, con procesamiento por chunks de 320 ms.
- Funcionamiento offline: al estar empaquetado para sherpa-onnx, no requiere servicios en la nube.
- Inferencia cuantizada a int8, orientada a dispositivos con recursos limitados.
- Seleccion de idioma implicita: el prompt propio del modelo (indice 59) se usa como `auto_prompt_id`, por lo que no hay que configurar el idioma en cada stream.
- Integracion directa con la libreria sherpa-onnx y con aplicaciones que la embeben, como el teclado WM Keyboard en su modo Offline Sherpa.
- No se documentan capacidades de traduccion, diarizacion de hablantes, deteccion de palabras clave, puntuacion automatica ni salida con marcas de tiempo.

## Casos de uso

- Dictado por voz offline en el teclado WM Keyboard: el modelo se carga en la app y transcribe el audio del microfono en streaming con chunks de 320 ms, permitiendo escribir en oromo sin conexion a internet ni enviar audio a servidores externos.
- Aplicaciones de notas de voz en oromo para moviles de gama baja: la cuantizacion int8 y el formato ONNX reducen el peso del modelo (repo de 0,7 GB) y el consumo de memoria, lo que facilita su ejecucion en dispositivos modestos.
- Subtitulado en directo de reuniones o clases en oromo: el modo streaming permite ir emitiendo transcripciones parciales a medida que se habla, con una latencia acotada por el tamano de chunk.
- Asistentes de voz embebidos: al integrarse en sherpa-onnx, puede formar parte de un pipeline local de reconocimiento de comandos o de entrada de texto por voz en aplicaciones de escritorio y moviles.
- Investigacion en ASR de bajos recursos: sirve como referencia reproducible para estudiar el comportamiento de un modelo de oromo en streaming y comparar variantes de cuantizacion y chunk.
- Prototipos de accesibilidad: transcripcion en tiempo real de conversaciones para personas con dificultades auditivas en entornos sin conectividad, siempre que el dispositivo pueda ejecutar el modelo.
- Evaluacion de pipelines de despliegue en el borde: util para medir latencia y consumo en distintas plataformas (Android, Linux embebido) antes de adoptar el modelo base en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 0,7 GB y los pesos estan cuantizados a int8, por lo que la huella de memoria deberia ser del orden de cientos de MB, pero no se confirma el consumo real en ejecucion.
- GPU recomendadas: no disponibles. El modelo esta pensado para sherpa-onnx, que prioriza ejecucion en CPU y en dispositivos embebidos; no se documenta soporte ni rendimiento en GPU.
- Compatibilidad con GPU de consumo: no confirmada. El caso de uso declarado (teclado offline) sugiere ejecucion en CPU de moviles y equipos de escritorio.
- Opciones de despliegue: sherpa-onnx es la via documentada (libreria `sherpa-onnx` y aplicaciones que la integran, como WM Keyboard). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que ademas no son herramientas orientadas a ASR.
- Latencia y throughput estimados: no disponibles. El unico dato objetivo es el tamano de chunk de 320 ms, que condiciona la granularidad de la salida en streaming.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones internas suficientes para establecer una comparativa rigurosa con otros modelos ASR en oromo o con otras exportaciones de sherpa-onnx. Como referencia de categoria, se indica lo siguiente:

| Modelo | Tipo | Idioma | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| addis-scribe-oromo-streaming-sherpa-onnx (este) | ASR streaming, int8 | oromo | ONNX (sherpa-onnx) | openmdw-1.1 | no disponibles |
| addisai/addis-scribe-oromo-streaming (modelo base) | ASR streaming | oromo | no disponible | no disponible en la informacion proporcionada | no disponibles |
| Otros modelos ASR multilingues de sherpa-onnx | ASR streaming | varios | ONNX | variable | no comparados por falta de datos |

No disponible una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La informacion publica es minima: no hay datos de arquitectura, parametros, dataset de entrenamiento ni metricas, lo que impide evaluar su calidad de forma objetiva antes de desplegarlo.
- Riesgo de alucinacion y de errores de transcripcion: como todo modelo ASR, puede producir palabras plausibles que no se han dicho, especialmente con ruido de fondo, acentos no representados en el entrenamiento o audio de baja calidad.
- Cobertura limitada a oromo: el prompt propio del modelo esta fijado como `auto_prompt_id`, de modo que no se debe esperar un comportamiento multilingue ni cambiar de idioma en el stream.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos dialectales, de genero o de edad en el reconocimiento.
- Licencia openmdw-1.1: es una licencia con condiciones propias; antes de un uso comercial es necesario revisar el texto en https://openmdw.ai/license/1-1/ y confirmar que el uso previsto esta permitido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopcion ni de validacion por parte de la comunidad.
- Dependencia de sherpa-onnx: el artefacto esta atado a esa libreria y a su version del exportador Nemotron 3.5; cambios de version pueden afectar a la compatibilidad.
- No se documentan mecanismos de puntuacion, mayusculas, marcas de tiempo ni diarizacion, por lo que la salida puede requerir postprocesado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wasi-master/addis-scribe-oromo-streaming-sherpa-onnx
- Modelo base: https://huggingface.co/addisai/addis-scribe-oromo-streaming
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- sherpa-onnx (libreria de despliegue): no se ha incluido un enlace en la informacion proporcionada
- Paper, blog o demo del modelo base: no disponibles en la informacion proporcionada
