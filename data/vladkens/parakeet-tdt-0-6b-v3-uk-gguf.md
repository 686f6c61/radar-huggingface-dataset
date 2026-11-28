# vladkens/parakeet-tdt-0.6b-v3-uk-gguf

## Resumen

`vladkens/parakeet-tdt-0.6b-v3-uk-gguf` es una cuantización Q8_0 en formato GGUF del modelo de reconocimiento automatico del habla `ihnatov-yuri/parakeet-tdt-0.6b-v3-uk`, un ajuste fino en ucraniano del NVIDIA Parakeet TDT 0.6B v3. El modelo original lo desarrolla Yurii Ihnatov y esta pensado para transcribir audio en ucraniano manteniendo las capacidades en ingles del modelo base, incluyendo palabras en ingles dentro de discurso en ucraniano. Esta version GGUF la publica vladkens para su uso con `wavo` y `transcribe.cpp`, herramientas de inferencia local orientadas a CPU y GPU de consumo.

El modelo resuelve el problema de la transcripcion automatica de voz en ucraniano con un tamano contenido: 627.052.166 parametros (aproximadamente 0,6 mil millones), lo que permite ejecutarlo en hardware modesto. La arquitectura es Parakeet TDT (Token-and-Duration Transducer), una variante de transducer que predice conjuntamente tokens y duraciones, lo que aporta marcas de tiempo a nivel de token. La salida incluye mayusculas, puntuacion y numeros en digitos.

Su relevancia actual radica en que ofrece una via practica para desplegar ASR en ucraniano de forma local y ligera, con un unico fichero de 740 MB y licencia CC-BY-4.0, sin depender de servicios en la nube. El repositorio tiene 176 descargas y 1 like en el momento de la consulta, y fue creado el 10 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | ucraniano (uk) e ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (`parakeet-tdt-0.6b-v3-uk-Q8_0.gguf`, 740 MB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Parakeet TDT de NVIDIA, un transducer que combina un encoder acustico con un decoder de prediccion y una red de union que emite simultaneamente tokens y duraciones. Esta formulacion permite obtener transcripciones con marcas de tiempo por token, algo que la model card confirma al indicar que `wavo` produce el mismo texto y los mismos tiempos de token que `transcribe.cpp`. El ajuste fino en ucraniano lo realizo Yurii Ihnatov sobre el modelo base `nvidia/parakeet-tdt-0.6b-v3`; la model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La conversion a GGUF se hizo con `scripts/convert-parakeet.py` de transcribe.cpp (commit `5bb2deb`) mediante el script `scripts/convert.py` de wavo, y la cuantizacion con `transcribe-quantize --quant Q8_0`. El convertidor identifica cada variante de Parakeet mediante un perfil; en este caso copia el perfil de v3 y solo cambia el nombre, el autor, los idiomas y el formato de origen. El tokenizer y todos los tensores (nombre, forma y tipo) coinciden con el GGUF `parakeet-tdt-0.6b-v3` de transcribe.cpp, y el fichero se ejecuta tal cual con esa herramienta.

## Capacidades

- Transcripcion automatica del habla en ucraniano con salida en mayusculas y con puntuacion.
- Transcripcion en ingles, conservando la capacidad del modelo base.
- Reconocimiento de palabras en ingles dentro de discurso en ucraniano (code-switching).
- Normalizacion de numeros a digitos en el texto de salida.
- Marcas de tiempo a nivel de token, utiles para alineacion y subtitulado.
- Inferencia local mediante `wavo` (acepta cualquier formato y frecuencia de muestreo) y `transcribe.cpp` (WAV mono a 16 kHz).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio mas alla de ASR.

## Casos de uso

- Subtitulado de video en ucraniano: el modelo genera texto con puntuacion y marcas de tiempo por token, lo que permite construir ficheros de subtitulos alineados sin un paso adicional de alineacion forzada.
- Transcripcion de reuniones y entrevistas: con 0,6 mil millones de parametros y un fichero Q8_0 de 740 MB, se puede ejecutar en local para procesar grabaciones sin enviar audio a servicios externos, lo que ayuda con requisitos de privacidad.
- Archivado y busqueda de contenido audiovisual: la transcripcion con tiempos de token facilita indexar audio en ucraniano y permitir busquedas por texto sobre el contenido hablado.
- Asistentes de voz y dictado en ucraniano: al ser un modelo ligero, puede integrarse en aplicaciones de escritorio o moviles con `transcribe.cpp` para dictado en tiempo casi real en hardware de consumo.
- Procesamiento de contenido bilingue ucraniano-ingles: el soporte de palabras en ingles dentro de discurso ucraniano lo hace adecuado para ponencias tecnicas, podcasts y material formativo donde se mezclan ambos idiomas.
- Pipelines de datos para entrenamiento de otros modelos: la salida con mayusculas, puntuacion y digitos normalizados reduce el postprocesado necesario al generar corpus de texto a partir de audio.
- Transcripcion por lotes en servidores sin GPU: al ser un GGUF Q8_0 ejecutable con transcribe.cpp, puede desplegarse en maquinas CPU para procesar grandes volumenes de audio a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card del modelo original (`ihnatov-yuri/parakeet-tdt-0.6b-v3-uk`) para datos de precision, datos de entrenamiento y limitaciones, pero no incluye cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 740 MB; con overhead de runtime, se puede estimar un uso en torno a 1-1,5 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cualquier GPU con al menos 2 GB de memoria libre deberia ser suficiente.
- Cabe en GPU de consumo: si, por el tamano del modelo (0,6 mil millones de parametros, Q8_0 de 740 MB) es apto para GPUs de consumo, aunque la informacion no detalla modelos concretos.
- Opciones de despliegue: `wavo` (repositorio de vladkens) y `transcribe.cpp` (repositorio de handy-computer), con el comando `transcribe-cli -m parakeet-tdt-0.6b-v3-uk-Q8_0.gguf audio.wav`. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vladkens/parakeet-tdt-0.6b-v3-uk-gguf | 627 M | uk, en | GGUF Q8_0 | CC-BY-4.0 | Cuantizacion del ajuste fino ucraniano de Parakeet TDT 0.6B v3 |
| ihnatov-yuri/parakeet-tdt-0.6b-v3-uk | 627 M (aproximado, no confirmado) | uk, en | safetensors (Transformers) | CC-BY-4.0 | Modelo original del que deriva esta cuantizacion; requiere runtime de Transformers |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (segun nombre del modelo) | no disponible en la informacion | no disponible | no disponible | Modelo base de NVIDIA; el ajuste ucraniano parte de el |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste fino sobre Parakeet, hereda las caracteristicas del modelo base, cuyos detalles remite a la model card original.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo ASR, puede producir transcripciones incorrectas en audio con ruido, acentos marcados o vocabulario especializado.
- Limitaciones de idioma: solo se declaran ucraniano e ingles; no hay soporte documentado para otras lenguas.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; es necesario conservar el aviso de licencia y el fichero `NOTICE` que indica los cambios realizados.
- Solo se publica una cuantizacion Q8_0; no hay variantes de menor precision en el repositorio.
- El uso con `transcribe.cpp` requiere WAV mono a 16 kHz; para otros formatos hay que usar `wavo` o convertir previamente.
- Al ser una cuantizacion, puede existir una diferencia minima de precision frente al modelo original en safetensors, aunque la model card afirma que el texto y los tiempos de token coinciden con los de transcribe.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladkens/parakeet-tdt-0.6b-v3-uk-gguf
- Modelo original (ajuste fino ucraniano): https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk
- Revision del modelo original usada en la conversion: https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk/tree/5c4bcfaca501587beaedfd23b72a678bf7194de1
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- wavo (repositorio): https://github.com/vladkens/wavo
- Script de conversion de wavo: https://github.com/vladkens/wavo/blob/main/scripts/convert.py
- transcribe.cpp (repositorio): https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado: https://github.com/handy-computer/transcribe.cpp/tree/5bb2deb2a4afb1fd50534ecb51cfcb521ef94944
