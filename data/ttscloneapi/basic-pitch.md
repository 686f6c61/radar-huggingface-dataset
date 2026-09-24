# TTSCloneAPI/basic-pitch

## Resumen

Basic Pitch es un modelo de transcripcion automatica de musica (AMT, del ingles automatic music transcription) publicado originalmente por Spotify Research. Su objetivo es convertir audio musical polifonico en eventos de nota con pitch, onset y duracion, es decir, producir una representacion tipo MIDI a partir de una senal de audio. La ficha que se evalua aqui es el repositorio `TTSCloneAPI/basic-pitch` alojado en HuggingFace, un espejo de terceros con acceso restringido (gated) que en el momento de la consulta registra 0 descargas y 0 likes.

El modelo se presenta en la informacion disponible con las etiquetas `audio`, `music`, `lightweight`, `midi`, `transcription`, `pitch-detection` y `polyphonic`, lo que describe su ambito: transcripcion instrumental-agnostica de audio polifonico con un diseno ligero, orientado a ejecutarse en entornos con pocos recursos. La tarjeta del repositorio referencia el paper arXiv:2203.09893, cuya identificacion como fuente tecnica principal se recoge mas abajo.

Su relevancia practica radica en tres puntos: es instrumento-agnostico (no asume piano ni guitarra en concreto), admite polifonia (varias notas simultaneas) y su etiqueta `lightweight` sugiere viabilidad en CPU o entornos embebidos, algo poco comun en transcripcion musical. Los datos concretos de tamano, contexto y benchmarks no estan disponibles en la informacion proporcionada y se marcan como tales en toda la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) ligera para transcripcion automatica de musica; segun el paper referenciado en los tags (arXiv:2203.09893), diseno convolucional instrumento-agnostico. Detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no aplica / no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (etiqueta `en` presente en el repositorio, pero el modelo procesa audio, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |
| Entradas | audio musical (senal de audio); frecuencia de muestreo y formato exactos, no disponibles |
| Salidas | eventos de nota (pitch, onset, duracion) tipo MIDI y estimacion de multipitch, segun los tags `midi` y `pitch-detection` |
| Politonia | si (tag `polyphonic`) |
| Agnostico al instrumento | si, segun la descripcion del paper referenciado en los tags |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como una red convolucional ligera para transcripcion polifonica e instrumento-agnostica, tal y como se recoge en el paper cuyo identificador aparece en los tags del repositorio (arXiv:2203.09893). No se especifican en la informacion proporcionada el numero de capas, los canales, el tamano de ventana de analisis ni el numero exacto de parametros. El enfasis del diseno, segun las etiquetas `lightweight` y `polyphonic`, esta en obtener transcripcion polifonica con un coste computacional reducido.

Los tags del repositorio enumeran los datasets asociados al entrenamiento y evaluacion: GuitarSet, iKala, Maestro, MedleyDBPitch y Slakh. Se trata de conjuntos heterogeneos en instrumentacion (guitarra, piano, mezclas multi-instrumento y datos sinteticos), lo que es coherente con el objetivo de generalizacion entre instrumentos. No se indica en la informacion disponible el numero de horas de audio, la composicion exacta del dataset final, ni si se aplicaron etapas de ajuste fino, RLHF o DPO (tecnicas, por otra parte, propias del alineamiento de modelos de lenguaje y no del entrenamiento de un transcriber de audio).

## Capacidades

- Transcripcion de audio a eventos de nota: genera pitch, onset y duracion a partir de una senal de audio musical.
- Transcripcion polifonica: maneja varias notas simultaneas, segun el tag `polyphonic`.
- Independencia de instrumento: no esta especializado en un unico instrumento, segun la descripcion del paper referenciado.
- Estimacion de multipitch: calculo de multiples frecuencias fundamentales presentes en la mezcla.
- Salida compatible con MIDI, segun el tag `midi`.
- Ejecucion en entornos ligeros: la etiqueta `lightweight` indica un diseno orientado a recursos limitados.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (fuera del ambito del modelo).
- Capacidades multilingues: no aplica (modelo de audio).
- Capacidades de vision o audio generativo: no disponible; el modelo es de analisis de audio, no de sintesis.

## Casos de uso

- Transcripcion de grabaciones a MIDI para produccion musical: el modelo convierte una toma de guitarra o piano en eventos de nota editables, lo que permite al productor corregir o reutilizar la interpretacion en un DAW sin volver a grabarla. Es adecuado porque admite polifonia y no exige indicar el instrumento de antemano.
- Generacion automatica de tablaturas y partituras: integrado en una aplicacion de practica musical, traduce audio a notacion para que el usuario estudie una pieza. La salida de pitch y onset por nota es la materia prima necesaria para el renderizado de partitura.
- Herramientas de educacion musical: un profesor puede subir una grabacion de referencia y obtener las notas reales interpretadas, util para analisis comparativo de la ejecucion del alumno frente al original.
- Preprocesado de pipelines de MIR (music information retrieval): transcripcion masiva de catalogos musicales para construir indices de notas, melodias o armonias que alimenten motores de busqueda y recomendacion por contenido musical.
- Analisis de catalogos en plataformas de streaming o editoriales musicales: deteccion de fragmentos, citas o patrones melodicos repetidos entre pistas a partir de la representacion de notas, tarea inviable a escala sin transcripcion automatica.
- Sincronizacion y edicion asistida de audio: obtencion de onsets precisos para alinear pistas, cortar silencios o cuantizar interpretaciones en herramientas de postproduccion.
- Procesamiento en el dispositivo (navegador o movil): gracias a su caracter ligero, es candidato para demos y utilidades que transcriben audio sin enviar la senal a un servidor, lo que reduce costes y mejora la privacidad del audio del usuario.
- Anotacion asistida de datasets musicales: generacion de etiquetas preliminares de notas que un anotador humano revisa despues, reduciendo el coste de construir corpus etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio consultado no incluye tabla de metricas, y los resultados de la busqueda web realizada no aportan datos tecnicos sobre el modelo.

Como referencia de evaluacion, los datasets asociados en los tags (GuitarSet, iKala, Maestro, MedleyDBPitch y Slakh) son los conjuntos habituales para medir transcripcion de nota, estimacion de multipitch y transcripcion especifica por instrumento, pero no se dispone de las cifras obtenidas por este modelo en ellos.

| Benchmark | Resultado | Notas |
|---|---|---|
| Metricas de transcripcion de nota (F1 de nota, onset, offset) | no disponible | No publicadas en la informacion proporcionada |
| Metricas de multipitch | no disponible | No publicadas en la informacion proporcionada |
| Comparacion con modelos de referencia | no disponible | Sin datos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tag `lightweight` sugiere un consumo muy inferior al de los transformers de audio de gran tamano, pero no hay cifras en la informacion proporcionada.
- GPU recomendadas: no disponibles. Para arquitecturas convolucionales ligeras de audio es habitual que una GPU de gama media o incluso CPU sea suficiente, pero esto no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: probablemente si, dado el caracter ligero declarado, aunque no se especifica en la informacion proporcionada.
- Opciones de despliegue: no disponibles para este espejo. La informacion proporcionada no documenta formatos de peso ni runtimes compatibles (ONNX, TensorFlow, TFLite, llama.cpp u otros).
- Latencia y throughput: no disponibles.
- Nota operativa: el repositorio es de acceso restringido (gated), por lo que la descarga requiere aceptar condiciones en HuggingFace antes de poder evaluar el artefacto.

## Comparativa con modelos similares

No se dispone de datos numericos de este modelo, por lo que la comparacion es cualitativa y las celdas sin informacion se marcan como no disponibles.

| Modelo | Tarea | Polifonia | Instrumento | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| TTSCloneAPI/basic-pitch | Transcripcion de audio a notas y multipitch | Si (tag `polyphonic`) | Agnostico | apache-2.0 | no disponible |
| CREPE | Estimacion de pitch monofonica | No (monofonico) | Agnostico | no disponible | no disponible |
| Onsets and Frames (Magenta) | Transcripcion de piano | Si | Piano | no disponible | no disponible |
| MT3 | Transcripcion multi-instrumento y multitarea | Si | Multiples | no disponible | no disponible |

Diferencias clave observadas en la informacion disponible: el modelo evaluado se posiciona como ligero y agnostico al instrumento, mientras que las alternativas de la tabla se orientan bien a pitch monofonico (CREPE) o bien a un instrumento concreto (Onsets and Frames) o a arquitecturas de mayor coste (MT3). No se dispone de cifras que permitan afirmar superioridad o inferioridad en calidad de transcripcion.

## Limitaciones y advertencias

- Ambito restringido al audio: no es un modelo de lenguaje; no admite prompts de texto, tool calling, agentes ni razonamiento multi-paso.
- Sin datos de rendimiento publicados: no se pueden hacer afirmaciones cuantitativas sobre precision de nota, onset o multipitch a partir de la informacion disponible.
- Riesgo de transcripcion incorrecta en pasajes densos: en mezclas con mucha polifonia, percusion prominente o ruido, la estimacion de notas puede degradarse; no hay cifras que acoten este comportamiento.
- Posible dependencia de la afinacion y el temperamento del material de entrenamiento: los datasets listados son en su mayoria de musica occidental con instrumentos temperados; no se documenta el comportamiento con musica microtonal o no occidental.
- Ausencia de separacion de fuentes: el modelo transcribe eventos de nota, no separa instrumentos en pistas independientes; no debe presentarse como herramienta de source separation.
- Datos de sesgo no disponibles: no se documenta el sesgo por genero musical, instrumento o region geografica del corpus de entrenamiento.
- Repositorio de terceros: se trata de un espejo publicado por `TTSCloneAPI`, con 0 descargas y 0 likes. No hay evidencia en la informacion disponible de que los pesos hayan sido auditados o verificados contra el artefacto original, por lo que la procedencia debe validarse antes de usarlo en produccion.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que anade friccion a la integracion automatizada.
- Licencia: la tarjeta declara apache-2.0, permisiva para uso comercial, pero conviene verificar la licencia del proyecto original y los terminos de los datasets empleados, especialmente Maestro, MedleyDB y Slakh, que tienen condiciones propias.
- Ficha creada a partir de informacion muy limitada: cualquier decision de adopcion deberia completarse con la lectura del paper referenciado y la documentacion del proyecto original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TTSCloneAPI/basic-pitch (acceso restringido, requiere aceptar condiciones)
- Paper referenciado en los tags del repositorio: https://arxiv.org/abs/2203.09893
- Proyecto original de Basic Pitch en GitHub: https://github.com/spotify/basic-pitch
- Demo del proyecto original en navegador: https://basicpitch.spotify.com
- Datasets asociados en los tags: GuitarSet, iKala, Maestro, MedleyDBPitch, Slakh (paginas oficiales de cada dataset; no enlazadas en la informacion proporcionada)
- Otros enlaces relevantes: no se han encontrado en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo y se han descartado.
