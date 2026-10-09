# Willdev61/pianoscript-keyboards

## Resumen

Pianoscript-keyboards es un ajuste fino (fine-tune) del modelo de transcripcion de piano de alta resolucion de ByteDance (Kong et al., 2021), especializado en las partes de teclado de grabaciones de bandas de worship y gospel, donde conviven organo, piano electrico y pads junto al piano acustico. Lo desarrolla el autor Willdev61 dentro del proyecto PianoScript, cuyo objetivo es convertir grabaciones de musicos de iglesia en partituras de piano. El problema que resuelve es concreto: el checkpoint original solo se entreno con piano solista y, sobre organo y pads, detecta ataques falsos en acordes mantenidos (un acorde sostenido sale como una ristra de notas repetidas) y pierde buena parte de la armonia.

El modelo conserva la arquitectura y el formato de fichero del checkpoint original `Note_pedal`, por lo que es un reemplazo directo en los pipelines que ya usan `piano_transcription_inference`. Se entreno adicionalmente con 1.500 canciones sinteticas generadas (unas 15 horas) con todas las notas conocidas y progresiones armonicas de gospel, mas 4,35 horas de piano solista real de Wikimedia Commons usadas como destilacion para no desviarse del dominio original.

Es relevante ahora porque ataca un nicho poco cubierto por los modelos de transcripcion automatica de musica (AMT): la polifonia densa de teclados en contexto de banda, donde el stem de teclados no es piano puro. El repositorio ocupa 0,2 GB, se publica bajo licencia CC BY 4.0 y su inferencia puede ejecutarse en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el autor indica que mantiene la arquitectura del checkpoint original de Kong et al. (2021), que regresa tiempos de onset y offset |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de audio, no textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrada de audio; la salida es un fichero MIDI) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Checkpoint PyTorch (`.pth`) con un diccionario cuya entrada `model` contiene `note_model` y `pedal_model` |
| Libreria | PyTorch |
| Tarea | Automatic music transcription, subtarea piano/teclados |
| Tamano del repositorio | 0,2 GB |
| Entrada esperada | Audio mono a la frecuencia de muestreo de `piano_transcription_inference`, con voces y bateria ya eliminadas |
| Salida | Fichero MIDI |

## Arquitectura y entrenamiento

El autor no describe la arquitectura en la model card: solo afirma que se conserva la del checkpoint original `Note_pedal` de Kong et al. (2021), publicada en el articulo *High-resolution Piano Transcription with Pedals by Regressing Onset and Offset Times* (IEEE/ACM TASLP, vol. 29, 2021). Ese trabajo aborda la transcripcion de piano de alta resolucion regresando directamente los tiempos de onset y offset, e incluye deteccion de pedal. El checkpoint resultante mantiene el mismo formato de fichero, con los submodelos `note_model` y `pedal_model`, de modo que se carga sin cambios con `piano_transcription_inference` 0.0.6.

El entrenamiento parte del checkpoint original (registro Zenodo 4034264, con F1 de notas 0,9677) y anade dos bloques de datos. El primero son 1.500 canciones generadas (aproximadamente 15 horas) con todas las notas conocidas, basadas en progresiones de acordes de gospel con acordes extendidos y de paso, y acompanamiento en forma de block chords, pushes, arpegios o runs; el organo y los pads sostienen las notas compartidas entre acordes. Los timbres proceden de las fuentes de sonido FluidR3_GM y MuseScore_General, mas un organo tonewheel procedural (drawbars, percusion, key click, overdrive, Leslie), un piano electrico FM, pads y bajo de sintetizador. Cada cancion se mezcla con bajo, bateria, voz principal y coros, se le aplica reverb, la mitad de las veces se codifica en MP3 y despues se separa con Demucs `htdemucs`, replicando el pipeline de produccion.

El segundo bloque son 4,35 horas de grabaciones de piano solista de Wikimedia Commons (mayoritariamente Musopen, con licencias de dominio publico, CC0 y CC BY 3.0), usando como objetivo la salida del modelo original (destilacion) para evitar que el ajuste fino se aleje del dominio de piano real. La optimizacion consistio en 4.000 pasos de 8 segmentos de diez segundos, con Adam (AMSGrad), learning rate 1e-4, 300 pasos de warm-up y decaimiento coseno hasta 1e-5, BatchNorm congelado y precision mixta; aproximadamente 3 horas en una unica RTX 3060 Laptop. No se menciona RLHF ni DPO, que no aplican a esta tarea. La innovacion destacable no es arquitectonica sino de datos: generacion sintetica con anotacion exacta y separacion de fuentes identica a la de produccion.

## Capacidades

- Transcripcion automatica de piano/teclados a MIDI a partir de audio mono.
- Deteccion de notas con regresion de tiempos de onset y offset, lo que permite estimar la duracion de cada nota.
- Manejo de acordes mantenidos en organo y pads sin fragmentarlos en notas repetidas: las notas repetidas en exceso bajan de 362 a 72 en el banco sintetico de evaluacion.
- Mejor recuperacion de la armonia en contextos de banda: la precision pasa de 0,65 a 0,80 y el recall de 0,75 a 0,83 en el conjunto sintetico de 16 canciones.
- Adaptacion a texturas de acompanamiento concretas: block chords, pushes, arpegios y runs, con organo y pads.
- Salida en formato MIDI, apta para notacion posterior.
- Inferencia en CPU soportada explicitamente por el ejemplo de uso del autor.
- No incluye soporte de tool calling, function calling, agentes, capacidades multilingues ni modo de razonamiento (thinking): es un modelo de transcripcion, no un modelo de lenguaje.
- La deteccion de pedal se hereda del modelo original; no se reentreno ni se evaluo en este checkpoint.

## Casos de uso

- Generacion de partituras para musicos de iglesia: es el caso de uso de diseno del proyecto PianoScript, que toma la grabacion de una banda de worship y devuelve una partitura de piano. El modelo es adecuado porque esta entrenado con el stem de teclados aislado, no con la mezcla completa.
- Integracion en un pipeline de separacion de fuentes: alimentando al modelo con los stems `other` + `bass` de Demucs `htdemucs`, tal como hace el autor en produccion, para obtener el MIDI de teclados de una grabacion completa de banda.
- Creacion de partituras de acompanamiento para ensayos: transcribir una grabacion de ensayo con organo, piano electrico y pads para distribuir la partitura entre los musicos del grupo.
- Archivo y catalogacion de repertorio: convertir un catalogo de grabaciones de gospel en MIDI indexable y buscable por progresion armonica, aprovechando la mejora de recall en la armonia.
- Analisis armonico asistido: al obtener MIDI con onsets mas precisos, es posible extraer progresiones de acordes para analisis o para rearmonizaciones, aunque conviene validar manualmente.
- Educacion musical: transcripcion de grabaciones de referencia para que estudiantes de teclado estudien voicings de gospel, con la salvedad de que el autor advierte que sobre grabaciones reales de gospel la mejora es menor que en el banco sintetico.
- Prototipado en CPU: al poder ejecutarse en CPU, permite montar demos o scripts de transcripcion en estaciones de trabajo sin GPU, util para pruebas de concepto antes de escalar.
- Generacion de datos de entrenamiento para otros modelos de AMT: el propio enfoque del autor (canciones sinteticas con notas conocidas) puede reproducirse para crear pares audio-MIDI etiquetados.

## Benchmarks y rendimiento

Los datos de evaluacion publicados por el autor no son benchmarks estandar (MMLU, HumanEval, GSM8K), sino metricas propias de transcripcion. Se reproducen tal cual.

Canciones de banda: 16 canciones sinteticas renderizadas con una fuente de sonido no vista en entrenamiento (GeneralUser GS), pasadas por el pipeline completo de PianoScript (separacion, notas, linea de bajo). Una nota cuenta como acierto si su onset esta dentro de 50 ms.

| Metrica | Original | Este checkpoint |
|---|---:|---:|
| Precision | 0,65 | 0,80 |
| Recall | 0,75 | 0,83 |
| Recall de teclados | 0,72 | 0,81 |
| Notas repetidas en exceso | 362 | 72 |
| Armonicos en exceso | 1.005 | 681 |

En las canciones de organo por separado, el recall sube de 0,33-0,51 a 0,63-0,78.

Piano solista real: seis grabaciones de Chopin excluidas del entrenamiento, sin partitura. La concordancia con el modelo original (F1 de onsets) esta entre 0,85 y 0,98. Las notas que este checkpoint conserva son casi todas las que el original tambien encontraba (precision 0,93-0,99), pero encuentra entre un 1% y un 17% menos de notas. La mayor perdida se produce en un nocturno lento y con pedal.

## Requisitos de hardware

- El repositorio de pesos ocupa 0,2 GB, por lo que el almacenamiento necesario es minimo.
- El ejemplo oficial de uso ejecuta la inferencia con `device="cpu"`, de modo que es funcional sin GPU.
- El autor no publica cifras de VRAM ni de latencia en la informacion disponible.
- Dado el tamano del checkpoint y que el entrenamiento completo cupo en una RTX 3060 Laptop (aproximadamente 3 horas), es razonable esperar que la inferencia quepa holgadamente en GPUs de consumo, pero no hay mediciones confirmadas por el autor.
- Opciones de despliegue: la via documentada es la libreria `piano_transcription_inference` 0.0.6 (Kong), que carga el checkpoint y produce el MIDI. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Dependencia de pipeline: se asume que la entrada ya ha pasado por separacion de fuentes (Demucs `htdemucs`, stems `other` + `bass`) y que las voces y la bateria estan eliminadas.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Dominio | Entrada esperada | Precision (banco sintetico) | Recall (banco sintetico) | Licencia |
|---|---|---:|---:|---:|---|
| Pianoscript-keyboards (este) | Teclados en banda (piano, organo, pads) | Stem de teclados aislado | 0,80 | 0,83 | CC BY 4.0 |
| Checkpoint original `Note_pedal` (Kong et al., 2021) | Piano solista | Piano solo | 0,65 | 0,75 | CC BY 4.0 |

En piano solista real, el propio autor recomienda usar el checkpoint original: la concordancia entre ambos es alta (F1 de onsets 0,85-0,98), pero este checkpoint omite entre un 1% y un 17% de las notas. Para el resto de alternativas de transcripcion automatica de piano del ecosistema open source no se dispone de datos comparativos en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- El entrenamiento principal se hizo con canciones sinteticas. En cuatro grabaciones reales de gospel, sin partitura, la proporcion de notas atacadas de nuevo justo cuando se libera la misma tecla bajo en tres de ellas (por ejemplo, del 40% al 31%) y se mantuvo igual en la cuarta; la mejora es muy inferior a la observada en el banco sintetico.
- El recall sobre organo sigue muy por debajo del recall sobre piano, pese a la mejora (de 0,33-0,51 a 0,63-0,78).
- La deteccion de pedal no se reentreno y no se evaluo en este checkpoint, por lo que su comportamiento sobre grabaciones con pedal extensivo no esta caracterizado.
- En piano solista real rinde peor que el modelo original en cobertura de notas: pierde entre un 1% y un 17% de las notas, con el peor caso en un nocturno lento y pedaleado. El autor recomienda explicitamente usar el checkpoint original para piano solista.
- Requiere un paso previo de separacion de fuentes y espera un stem de teclados sin voces ni bateria; usarlo sobre mezclas completas degradara los resultados.
- Riesgo de notas espurias y de armonicos en exceso: en el banco sintetico se contabilizan 681 armonicos en exceso, aunque menos que los 1.005 del original.
- Sesgo de dominio: los timbres de entrenamiento provienen de fuentes de sonido concretas (FluidR3_GM, MuseScore_General) y de sintesis procedural, lo que puede no cubrir todos los instrumentos reales.
- Al derivar de un checkpoint con licencia CC BY 4.0, el uso comercial esta permitido siempre que se cumpla la atribucion a los autores originales (Kong et al.), tal como recoge la propia model card.
- No hay informacion sobre idiomas ni sobre sesgos sociales, que no aplican a un modelo de audio, pero tampoco hay evaluacion de sesgo por genero o estilo musical.
- Cero descargas registradas en HuggingFace en el momento de redactar esta ficha: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Willdev61/pianoscript-keyboards
- Libreria de inferencia `piano_transcription_inference` (Qiuqiang Kong): https://github.com/qiuqiangkong/piano_transcription_inference
- Checkpoint original en Zenodo (registro 4034264): https://zenodo.org/records/4034264
- Referencia del modelo base: Qiuqiang Kong, Bochen Li, Xuchen Song, Yuan Wan y Yuxuan Wang, *High-resolution Piano Transcription with Pedals by Regressing Onset and Offset Times*, IEEE/ACM Transactions on Audio, Speech, and Language Processing, 29, 3707-3717, 2021
- Grabaciones de piano real: Wikimedia Commons (dominio publico, CC0 y CC BY 3.0), mayoritariamente Musopen
- Los resultados de la busqueda web realizada no aportaron enlaces relevantes al modelo: contenian unicamente paginas de inicio de sesion de Outlook y servicios de correo, sin relacion con el modelo ni con transcripcion musical.
