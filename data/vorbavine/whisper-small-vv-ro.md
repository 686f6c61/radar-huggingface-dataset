# VorbaVine/whisper-small-vv-ro

## Resumen

whisper-small-vv-ro es un ajuste fino del modelo openai/whisper-small de OpenAI para reconocimiento automatico del habla (ASR) en rumano. Lo desarrolla VorbaVine, un proyecto centrado en la transcripcion de lengua rumana, y toma como punto de partida la arquitectura encoder-decoder transformer de Whisper en su variante "small", con 241.734.912 parametros totales y una ventana de audio de unos 30 segundos por pasada.

El modelo resuelve el problema de la baja precision del Whisper original en rumano: partiendo de un WER base del 27,33 % en el conjunto de test propio, el ajuste fino lo reduce al 7,69 %, y mejora tambien en conjuntos no vistos durante el entrenamiento (Mozilla, FLEURS y VoxPopuli), donde pasa de valores entre el 26 % y el 36 % a valores entre el 8,9 % y el 12,7 %. Es relevante porque demuestra que un modelo de tamano contenido (small) puede alcanzar una precision util en produccion para un idioma de recursos medios si se combina datos reales con datos sinteticos.

El entrenamiento se hizo sobre aproximadamente 143,77 horas de audio (121,78 h de entrenamiento, 10,91 h de validacion y 11,08 h de test), de las cuales unas 73,5 h son sinteticas. La licencia es Apache-2.0, lo que facilita su uso comercial y su integracion en pipelines existentes basados en transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de hasta ~30 s por pasada (ventana nativa de Whisper) |
| Tipos de cuantizacion | no disponible (el autor no especifica; el ejemplo de uso emplea float16) |
| Idiomas soportados | rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura original de Whisper small: un encoder transformer que procesa espectrogramas mel logaritmicos de 80 canales y un decoder autorregresivo que genera tokens de texto condicionados por tokens especiales de idioma y tarea. No se introducen modificaciones estructurales; el trabajo se concentra en el ajuste fino supervisado sobre datos rumanos.

Los datos de entrenamiento suman 143,77 horas repartidas en 86.920 clips: 8,4 h de grabaciones propias, 21,5 h de Common Voice, 5,9 h de FLEURS, 34,4 h de otro habla real y 73,5 h de habla sintetica. El split es fijo (73.174 clips de entrenamiento, 6.814 de validacion y 6.932 de test) y se uso tanto para entrenamiento como para seleccion de modelo y evaluacion. La configuracion de entrenamiento fue LR 5e-6 con decaimiento lineal, 227 pasos de warmup, batch efectivo de 64, precision bf16 y weight decay 0,01; se conservo el checkpoint del paso 6237 de 11.340 programados por tener el menor WER de validacion (7,12 %). No se menciona RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en rumano con audio mono a 16 kHz.
- Deteccion y fijacion de idioma mediante el token especial `language="ro"`.
- Tarea de transcripcion (`task="transcribe"`); no se documenta la tarea de traduccion a ingles.
- Procesamiento de clips de hasta aproximadamente 30 segundos; el audio mas largo debe trocearse.
- Reconocimiento sobre dominio variado: lectura (Common Voice, FLEURS), discurso parlamentario (VoxPopuli) y grabaciones propias.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al ser un modelo puramente ASR.
- No se documentan capacidades de vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion de reuniones y entrevistas en rumano: con clips troceados a menos de 30 s, el modelo permite generar actas automaticas con un WER en torno al 8-13 % en dominios no vistos, suficiente para revision humana posterior.
- Subtitulado de contenido audiovisual rumano: el modelo puede integrarse en un pipeline que segmenta el audio y genera subtitulos sincronizados, con la ventaja de una licencia Apache-2.0 que permite uso comercial.
- Atencion al cliente con voz en rumano: transcripcion de llamadas para analitica y busqueda, usando el modelo como primer paso de un pipeline ASR + NLP.
- Archivado y busqueda de material audiovisual: indexacion de grabaciones (por ejemplo, discurso publico o parlamentario, dado el buen resultado en VoxPopuli) para busqueda por texto.
- Accesibilidad: generacion de transcripciones en directo para personas con discapacidad auditiva en entornos de habla rumana.
- Investigacion en ASR de lenguas de recursos medios: el modelo sirve como baseline reproducible para experimentos con datos sinteticos, dado que el autor documenta la mezcla real/sintetica y el split fijo.
- Evaluacion comparativa de sistemas ASR: al publicar resultados en cuatro conjuntos (propio, Mozilla, FLEURS, VoxPopuli) con normalizacion definida, es util como referencia en benchmarks internos.

## Benchmarks y rendimiento

Resultados de WER (%) publicados por el autor (menor es mejor), tras normalizacion de referencias (minusculas, sin puntuacion, cedilla a coma inferior, abreviaturas expandidas):

| Conjunto de test | Base (whisper-small) | whisper-small-vv-ro |
|---|---|---|
| VorbaVine test | 27,33 | 7,69 |
| Mozilla (no visto) | 35,84 | 8,94 |
| FLEURS (no visto) | 26,60 | 12,72 |
| VoxPopuli (no visto) | 26,21 | 9,69 |

WER de validacion del checkpoint retenido: 7,12 %. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al no ser un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, el modelo ocupa aproximadamente 0,5 GB de pesos; con overhead de activaciones y batches pequenos, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo es lo bastante pequeno como para no requerir GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 4 GB de VRAM; tambien puede ejecutarse en CPU para volumenes bajos.
- Opciones de despliegue: transformers (con torch y librosa, segun el ejemplo del autor); al ser un modelo Whisper estandar en safetensors, es compatible con frameworks de inferencia que soporten Whisper (por ejemplo, implementaciones basadas en ONNX o servidores de inferencia con soporte Whisper), aunque el autor solo documenta transformers.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idioma | Licencia | WER rumano (referencia) |
|---|---|---|---|---|---|
| whisper-small-vv-ro | 241,7 M | ~30 s | rumano | Apache-2.0 | 7,69-12,72 % (segun conjunto) |
| openai/whisper-small | 241,7 M | ~30 s | multilingue | Apache-2.0 | 26,21-35,84 % (base, segun conjunto) |
| openai/whisper-medium | 769 M | ~30 s | multilingue | Apache-2.0 | no disponible |
| openai/whisper-large-v3 | 1.550 M | ~30 s | multilingue | Apache-2.0 | no disponible |

La comparacion directa con whisper-small es la mas informativa: mismo tamano y licencia, con una reduccion de WER de entre 13 y 27 puntos porcentuales en los conjuntos evaluados. Frente a whisper-medium o whisper-large-v3 no hay datos publicados en la informacion disponible, por lo que no puede afirmarse cual es superior en rumano.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en rumano; no se ha validado para otros idiomas y el token de idioma debe fijarse a `ro`.
- El split de datos se uso simultaneamente para entrenamiento, seleccion de modelo y test, lo que puede inflar la estimacion de rendimiento en el conjunto VorbaVine test; los conjuntos marcados como "no vistos" son una referencia mas fiable.
- Aproximadamente la mitad del entrenamiento (73,5 h de 143,77 h) es habla sintetica, lo que puede introducir artefactos o sesgos propios del TTS utilizado; el autor no detalla el sistema de sintesis.
- Ventana de audio limitada a unos 30 s: el audio mas largo debe trocearse, con riesgo de errores en las fronteras de los segmentos.
- Riesgo de alucinacion tipico de Whisper en audio ruidoso, silencios o habla no rumana, donde puede generar texto inventado.
- No se documentan sesgos demograficos, de acento o de genero; no disponible.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datos de origen (Common Voice, VoxPopuli, FLEURS) si redistribuye derivados.
- Sin datos de latencia ni throughput publicados; el rendimiento en produccion debe medirse en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VorbaVine/whisper-small-vv-ro
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Common Voice (Mozilla): https://commonvoice.mozilla.org/
- VoxPopuli: https://github.com/facebookresearch/voxpopuli
- FLEURS: https://huggingface.co/datasets/google/fleurs
