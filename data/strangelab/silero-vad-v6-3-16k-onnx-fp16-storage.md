# strangelab/silero-vad-v6.3-16k-onnx-fp16-storage

## Resumen

Silero VAD v6.3 en formato ONNX con almacenamiento de pesos en FP16 es una reexportacion del detector de actividad de voz (VAD) de Silero Team, realizada por Strange Lab. El modelo original lo desarrolla Silero Team (snakers4) y esta pensado para detectar intervalos de habla en audio mono a 16 kHz. Esta variante concreta no cambia la arquitectura ni el comportamiento del modelo original: se limita a convertir ocho tensores de pesos de FP32 a FP16 para reducir el tamano del fichero descargable.

El resultado es un fichero ONNX de 635.493 bytes, un 49,2 % mas pequeno que el fichero oficial de v6.3 a 16 kHz (1.250.932 bytes) y un 72,7 % mas pequeno que el modelo v6.2 que descarga por defecto el cargador de `onnx-asr`. Los sesgos, entradas, estado recurrente, salidas y el propio computo permanecen en FP32; ONNX Runtime en CPU pliega las conversiones al cargar el grafo, de modo que el ahorro se concentra en la descarga y no en memoria en tiempo de ejecucion (este extremo no se ha medido).

Es relevante para quien despliegue VAD en entornos con ancho de banda o almacenamiento limitados (navegador, edge, contenedores ligeros) y quiera mantener la calidad de v6.3. La model card reporta una calidad practicamente identica al export oficial v6.3 en pruebas de transcripcion con Parakeet, con diferencias de una palabra en un unico clip de un holdout de 70.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente de Silero VAD v6.3 (no se detalla la topologia interna en la informacion disponible) |
| Parametros totales | no disponible (fichero ONNX de 635.493 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; procesa audio mono a 16 kHz (ventanas propias del VAD) |
| Tipos de cuantizacion | Pesos FP16 (8 tensores) con sesgos, entradas, estado recurrente, salidas y computo en FP32; existe tambien un export INT8 de la comunidad ONNX (diciembre 2024) como alternativa |
| Idiomas soportados | no disponible (el VAD es agnostico al idioma en la practica, pero no se declara) |
| Licencia | MIT (con aviso de copyright original de Silero Team) |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

El modelo es un detector de actividad de voz de Silero v6.3 exportado a ONNX. La informacion proporcionada no describe la topologia interna (capas, dimensiones ocultas ni mecanismo de atencion/recurrencia), solo que se trata de un modelo recurrente con estado (se menciona explicitamente "recurrent state" entre los tensores que permanecen en FP32). La entrada es audio mono a 16 kHz y la salida son intervalos de habla.

No se aportan datos sobre el dataset de entrenamiento, numero de tokens o horas de audio, ni sobre si hubo ajuste fino con RLHF/DPO. La unica innovacion tecnica documentada es la conversion de pesos a FP16 para almacenamiento: ocho tensores de pesos pasan de FP32 a FP16, mientras que sesgos, entradas, estado recurrente, salidas y computo se mantienen en FP32. ONNX Runtime en CPU pliega las conversiones de tipo al cargar el grafo, de modo que el grafo efectivo en ejecucion es funcionalmente equivalente al original. El ahorro en memoria en tiempo de ejecucion no se ha medido. El script de conversion (`convert.py`) esta incluido en el repositorio.

## Capacidades

- Deteccion de intervalos de habla (voice activity detection) en audio mono a 16 kHz.
- Salida de marcas de inicio y fin de habla; el demo imprime los intervalos en segundos.
- Uso como componente previo a reconocimiento automatico del habla (ASR): la model card demuestra su integracion con Parakeet TDT 0.6B v3 en INT8.
- Ejecucion en CPU via ONNX Runtime; tambien se ha verificado en navegador con `@ricky0123/vad-web` 0.0.31 (seleccionando `model: "v6"`) y en `sherpa-onnx` 2.0.3 mediante `--silero-vad-model`.
- Carga mediante el cargador local de `onnx-asr` (`load_vad("silero", "./model-directory", ...)`).
- No se declaran capacidades de generacion de texto, razonamiento, codigo, vision, audio generativo, tool calling ni agentes; es exclusivamente un detector de voz.

## Casos de uso

- Segmentacion previa a ASR en pipelines de transcripcion: se usa el VAD para recortar el audio en intervalos de habla antes de pasarlos a un reconocedor como Parakeet; la model card valida este flujo con el reconocedor INT8 de Parakeet y reporta WER comparables al VAD oficial.
- Deteccion de voz en el navegador: integrable con `@ricky0123/vad-web` 0.0.31 sirviendo el fichero como `silero_vad_v6.onnx`; util para activar la captura de microfono solo cuando hay habla y ahorrar ancho de banda y bateria.
- Filtrado de silencio y ruido en grabaciones de reuniones: el modelo permite eliminar segmentos sin habla antes de almacenar o procesar audio; la evaluacion incluye clips de audio de sala sin habla anotada y silencio digital, en los que el modelo no produce intervalos.
- Preprocesado en entornos edge o contenedores con almacenamiento limitado: el fichero de 635 KB reduce el peso del artefacto frente al oficial de 1,25 MB, lo que facilita su empaquetado en imagenes Docker minimas o dispositivos con poca flash.
- Segmentacion en `sherpa-onnx`: se puede pasar el modelo con `--silero-vad-model` para eliminar segmentos no hablados de un fichero de audio antes de la transcripcion.
- Deteccion de turnos de palabra en asistentes de voz: el VAD marca cuando empieza y termina el habla del usuario, lo que sirve para disparar la captura o cortar la escucha.
- Control de calidad de audio en produccion: al comparar los intervalos detectados con metadatos esperados se puede detectar audio vacio, silencio digital o fragmentos sin voz antes de enviarlos a un servicio de transcripcion de pago.

## Benchmarks y rendimiento

La model card incluye una comparacion de transcripcion con reconocedor Parakeet TDT 0.6B v3 INT8 en CPU y ajustes por defecto de onnx-asr 0.12.0. El conjunto de evaluacion usa 32 extractos publicos de LibriSpeech a volumen natural y a -24 dB, seis extractos continuos de 90 segundos de AMI en campo lejano, dos piezas de audio de sala sin habla anotada y un clip de silencio digital. El holdout usa reuniones, marcas de tiempo y filas de LibriSpeech distintas.

| Detector de voz | Bytes del modelo | WER original | WER holdout | Puntos medios de palabra AMI fuera de todos los intervalos de habla (holdout) |
|---|---:|---:|---:|---:|
| Este export v6.3 | 635.493 | 27,07 % | 20,07 % | 76 / 1.519 |
| Oficial v6.3, 16 kHz | 1.250.932 | 27,17 % | 20,03 % | 76 / 1.519 |
| v6.2 por defecto de onnx-asr Hub | 2.327.524 | 29,84 % | 21,15 % | 132 / 1.519 |
| ONNX Community INT8 (dic. 2024) | 639.383 | 28,76 % | 20,03 % | 127 / 1.519 |
| ONNX Community FP16 (dic. 2024) | 1.153.003 | no disponible | 20,96 % | 149 / 1.519 |

En el holdout, este export coincidio con las marcas de tiempo y las transcripciones del v6.3 oficial en 69 de 70 clips de habla; el clip restante tuvo una sustitucion de token adicional. Ambos produjeron siete palabras en los dos clips de audio de sala y ninguna en silencio digital. El v6.2 por defecto de onnx-asr coincidio con 2.071 palabras de referencia, mientras que este export coincidio con 2.100. La model card advierte que el WER en AMI es aproximado por el solapamiento de hablantes en una muestra pequena.

## Requisitos de hardware

- El modelo esta pensado para ejecucion en CPU con ONNX Runtime; no requiere GPU.
- VRAM estimada: no disponible; al ejecutarse en CPU no aplica VRAM. El ahorro de memoria en tiempo de ejecucion respecto al FP32 no se ha medido.
- GPU recomendadas: no aplica; la model card solo documenta ejecucion en CPU (`CPUExecutionProvider`).
- Cabe en cualquier equipo de consumo: el fichero ocupa 635.493 bytes y el computo es en FP32.
- Opciones de despliegue: onnxruntime (CPU), onnx-asr 0.12.0 (`load_vad`), `@ricky0123/vad-web` 0.0.31 en navegador y `sherpa-onnx` 2.0.3 (`--silero-vad-model`). No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un VAD).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Bytes | WER holdout (con Parakeet INT8) | Formato | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Este export (strangelab) | 635.493 | 20,07 % | ONNX FP16 storage / FP32 compute | MIT | Hugging Face (este repo) |
| Silero VAD v6.3 oficial 16 kHz | 1.250.932 | 20,03 % | ONNX | MIT | GitHub de snakers4 (release v6.3) |
| Silero VAD v6.2 (default onnx-asr) | 2.327.524 | 21,15 % | ONNX | MIT | Hugging Face (istupakov/silero-vad-onnx) |
| ONNX Community INT8 (dic. 2024) | 639.383 | 20,03 % | ONNX INT8 | MIT (Silero) | Hugging Face (onnx-community/silero-vad) |

La diferencia principal entre alternativas es el tamano del fichero y el WER resultante en la cadena de transcripcion. Este export iguala al oficial v6.3 en puntos medios fuera de habla (76/1.519) y queda a 0,04 puntos de WER en el holdout. Frente al INT8 de la comunidad, el tamano es practicamente identico (635.493 frente a 639.383 bytes) y el WER en holdout es 0,04 puntos peor, mientras que en el conjunto original el INT8 obtiene 28,76 % frente a 27,07 % de este export.

## Limitaciones y advertencias

- Solo procesa audio mono a 16 kHz; no se declara soporte para otras frecuencias de muestreo ni para audio multicanal.
- Es exclusivamente un detector de voz: no transcribe, no genera texto y no razona. Cualquier uso como modelo de lenguaje es inadecuado.
- El ahorro de memoria en tiempo de ejecucion por el almacenamiento FP16 no se ha medido; el beneficio documentado es unicamente el tamano de descarga.
- La evaluacion se basa en un holdout pequeno (70 clips de habla, seis extractos AMI de 90 s, dos clips de sala y un clip de silencio digital); el WER en AMI es aproximado por solapamiento de hablantes, por lo que las cifras no deben extrapolarse sin validacion propia.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones por idioma; al ser un VAD, el riesgo principal es la clasificacion erronea de voz o ruido, no la generacion de contenido.
- Licencia MIT con aviso de copyright de Silero Team; permite uso comercial, pero conviene conservar el aviso de copyright original al redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-26) sin validacion independiente de terceros.
- La integracion en navegador requiere servir el fichero como `silero_vad_v6.onnx` junto al worklet y mantener los assets WASM del paquete; una configuracion incorrecta de rutas rompe la deteccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/strangelab/silero-vad-v6.3-16k-onnx-fp16-storage
- Release de Silero v6.3: https://github.com/snakers4/silero-vad/releases/tag/v6.3
- Pesos oficiales de origen: https://github.com/snakers4/silero-vad/blob/63d4a2a7bfce8cd9bb39ed8fa0afcb5236d73e01/src/silero_vad/data/silero_vad_16k_op15.onnx
- Licencia upstream: https://github.com/snakers4/silero-vad/blob/63d4a2a7bfce8cd9bb39ed8fa0afcb5236d73e01/LICENSE
- Grabacion publica de prueba (60 s): https://github.com/snakers4/silero-vad/blob/63d4a2a7bfce8cd9bb39ed8fa0afcb5236d73e01/tests/data/test.wav
- Modelo por defecto de onnx-asr (v6.2): https://huggingface.co/istupakov/silero-vad-onnx/tree/b3e3ee3cce4c11ceb63b1a0b229d916069c1ddf6
- Exports ONNX Community de diciembre de 2024: https://huggingface.co/onnx-community/silero-vad/tree/e71cae966052b992a7eca6b17738916ce0eca4ec/onnx
- onnx-asr 0.12.0: https://github.com/istupakov/onnx-asr/releases/tag/v0.12.0
- Parakeet TDT 0.6B v3 ONNX (INT8): https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Configuracion en navegador de @ricky0123/vad-web: https://docs.vad.ricky0123.com/user-guide/browser/
- Seleccion de modelo en @ricky0123/vad-web: https://docs.vad.ricky0123.com/user-guide/models/
- Ejemplo de VAD en sherpa-onnx 2.0.3: https://github.com/k2-fsa/sherpa-onnx/blob/38016c6e0622e90bf417c35e8b47e0eb805af417/python-api-examples/vad-remove-non-speech-segments-from-file.py
- LibriSpeech: https://www.openslr.org/12
- Metodos de transcripcion de AMI: https://groups.inf.ed.ac.uk/ami/corpus/transcription.shtml
