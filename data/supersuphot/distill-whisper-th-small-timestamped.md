# supersuphot/distill-whisper-th-small-timestamped

## Resumen

`supersuphot/distill-whisper-th-small-timestamped` es una conversion a ONNX del modelo `biodatlab/distill-whisper-th-small`, una version destilada de Whisper especializada en reconocimiento automatico del habla en tailandes. El autor de la conversion es el usuario de HuggingFace supersuphot, mientras que el modelo original (Thonburian Whisper) procede de biodatlab. El proposito de esta version concreta es doble: por un lado, empaquetar los pesos en formato ONNX para que puedan ejecutarse con Transformers.js tanto en WebGPU como en WASM/CPU; por otro, exportar las salidas de atencion cruzada para que la opcion `return_timestamps: 'word'` funcione directamente en el navegador, algo que no ofrecen las conversiones estandar.

La relevancia de esta ficha esta en el nicho que cubre: es uno de los pocos modelos ASR para tailandes listos para inferencia 100% cliente, sin backend, con marcas de tiempo a nivel de palabra. Eso lo hace util para subtitulado, karaoke, indexacion de audio y aplicaciones de accesibilidad que se ejecutan en el dispositivo del usuario. El modelo base es una destilacion de Whisper small en la que el decodificador pasa de 12 a 4 capas, manteniendo la arquitectura encoder-decoder transformer original de Whisper.

El repositorio ocupa 0,5 GB e incluye variantes fp16 y q8 (cuantizacion por canal). La licencia es MIT, heredada del modelo base, y el unico idioma declarado es el tailandes (`th`). No se han publicado cifras de parametros, datos de entrenamiento ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con destilacion; decodificador de 4 capas frente a las 12 del modelo maestro |
| Parametros totales | no disponible (el autor no publica el recuento; el modelo base deriva de Whisper small) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de Whisper); longitud en tokens no disponible |
| Tipos de cuantizacion | fp16 (WebGPU) y q8 por canal (WASM/CPU) |
| Idiomas soportados | tailandes (`th`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model_fp16.onnx`, `decoder_model_merged_fp16.onnx`, `encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un encoder que procesa espectrogramas de mel-log de 30 segundos y un decodificador autorregresivo con atencion cruzada sobre la salida del encoder. Este checkpoint aplica destilacion de conocimiento siguiendo el enfoque de la familia distil-whisper: el alumno conserva el encoder del maestro y reduce drasticamente el decodificador, de 12 a 4 capas. El resultado es un modelo mas ligero y rapido en decodificacion, pensado para entornos con poca memoria o para inferencia en cliente.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO (en ASR no es habitual; se suele usar entrenamiento supervisado con pseudo-etiquetado). La conversion a ONNX se realizo con Transformers.js v3.8.1 mediante `scripts/convert.py --output_attentions`, con transformers 4.49.0, optimum en la version fijada por ese repositorio y torch 2.6.0, bajo la tarea `automatic-speech-recognition-with-past`. La cuantizacion se hizo con `scripts/quantize.py` del mismo repositorio.

Hay dos detalles tecnicos destacables. Primero, en el decodificador q8 la copia fp32 almacenada del embedding de tokens se sustituye por un `DequantizeLinear` de su copia en uint8, lo que mantiene las predicciones y reduce el tamano del fichero. Segundo, el campo `generation_config.alignment_heads` del modelo base apuntaba a capas del decodificador del maestro de 12 capas; como este modelo tiene 4, la conversion usa todas las cabezas de las capas 2 y 3 del decodificador (el comportamiento por defecto de Whisper cuando no se conocen las cabezas de alineacion). Esa eleccion es la que habilita las marcas de tiempo por palabra.

## Capacidades

- Reconocimiento automatico del habla en tailandes a partir de audio mono a 16 kHz.
- Generacion de marcas de tiempo a nivel de palabra mediante `return_timestamps: 'word'`, gracias a la exportacion de las salidas de atencion cruzada.
- Transcripcion y traduccion controladas por los parametros `task: 'transcribe'` y `language: 'thai'` de la API de Transformers.js.
- Inferencia en navegador con WebGPU (pesos fp16) o en CPU/WASM (pesos q8), sin necesidad de servidor.
- Ejecucion en dispositivos con poca memoria gracias a las variantes cuantizadas de encoder y decodificador.
- No se declara soporte de tool calling, function calling, agentes, capacidades multimodales (vision, audio mas alla del propio ASR) ni modo de razonamiento explicito.

## Casos de uso

- Subtitulado automatico de video en tailandes: la combinacion de transcripcion y marcas de tiempo por palabra permite generar ficheros SRT o VTT con sincronizacion fina, util para plataformas de video y creadores de contenido.
- Aplicaciones web de dictado en tiempo real: al cargarse con Transformers.js, el modelo puede transcribir directamente en el navegador sin enviar el audio a un servidor, lo que simplifica el cumplimiento de privacidad y elimina costes de backend.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de podcasts, entrevistas o archivos de telefonia en tailandes para construir indices de texto consultables.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos incrustados o en directo para contenido hablado en tailandes con marcas temporales por palabra.
- Atencion al cliente y control de calidad: transcripcion de llamadas o grabaciones de soporte para analisis posterior, con marcas temporales que facilitan localizar el fragmento relevante.
- Aplicaciones moviles o de escritorio sin conexion: la variante q8 permite empaquetar la transcripcion dentro de una app que funcione offline en dispositivos con memoria limitada.
- Investigacion linguistica y construccion de corpus: generacion de transcripciones alineadas con el audio para anotacion, analisis fonetico o entrenamiento de modelos posteriores.
- Herramientas de karaoke y edicion de audio: las marcas de tiempo por palabra sirven para resaltar la palabra activa o para alinear cortes de edicion con el habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de WER, MMLU ni de ninguna otra metrica, y tampoco se han facilitado datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: al tratarse de una destilacion de Whisper small con decodificador reducido, la variante fp16 deberia caber en torno a 1 GB de memoria durante la inferencia; la variante q8 por debajo de 500 MB. Son estimaciones a partir del tamano del repositorio (0,5 GB) y no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con soporte WebGPU puede ejecutar la variante fp16; tarjetas como RTX 3060, RTX 4060 o superiores son mas que suficientes. Aceleradores de datacenter como A100 o H100 no aportan ventaja en este caso, dado el tamano del modelo.
- Cabe en GPU de consumo: si. Tambien esta pensado para ejecutarse en CPU mediante WASM y en navegadores de portatiles o moviles.
- Opciones de despliegue: Transformers.js (WebGPU con `dtype: 'fp16'` en encoder y decoder, o WASM/CPU con `dtype: 'q8'`) sobre ONNX Runtime Web. No se proporcionan pesos en safetensors ni GGUF, por lo que no es directamente desplegable en vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| supersuphot/distill-whisper-th-small-timestamped | no disponible | 30 s de audio | Tailandes | MIT | ONNX (fp16, q8) | Conversion para Transformers.js con marcas de tiempo por palabra |
| biodatlab/distill-whisper-th-small | no disponible (4 capas de decodificador) | 30 s de audio | Tailandes | no disponible en la informacion | safetensors (formato habitual en transformers) | Modelo base del que deriva esta ficha |
| Surapat27/distill-whisper-th-small | no disponible (4 capas de decodificador) | 30 s de audio | Tailandes | no disponible en la informacion | no disponible | Destilacion tailandesa de Whisper con la misma reduccion de decodificador |
| openai/whisper-small | 244 M (cifra estandar del modelo original) | 30 s de audio | Multilingue | MIT | safetensors, GGUF en conversiones de terceros | Modelo maestro de referencia; no esta especializado en tailandes |
| distil-whisper/distil-small.en | 166 M (segun el repositorio distil-whisper) | 30 s de audio | Ingles | MIT | safetensors | Referencia de la metodologia de destilacion, pero solo para ingles |

## Limitaciones y advertencias

- Cobertura linguistica limitada al tailandes: el modelo no esta pensado para transcribir otros idiomas y los resultados fuera de `th` seran poco fiables.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente con audio con ruido, silencios largos o musica; conviene aplicar umbrales de confianza y filtros posteriores.
- El modelo solo procesa ventanas de 30 segundos, por lo que audios largos requieren segmentacion y unir los resultados, con posible perdida de coherencia entre fragmentos.
- No se han publicado evaluaciones de sesgo ni estudios de equidad sobre acentos regionales, edad o genero dentro del tailandes.
- Las marcas de tiempo por palabra dependen de las cabezas de alineacion elegidas (capas 2 y 3 del decodificador); su precision no ha sido validada con datos publicos en esta ficha.
- Al ser una destilacion, cabe esperar una precision inferior a la de modelos Whisper de mayor tamano, aunque no se dispone de cifras de WER para cuantificarlo.
- No hay pesos en GGUF ni safetensors en este repositorio, lo que limita su integracion en ecosistemas como llama.cpp, Ollama, vLLM o TGI.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia y las condiciones del modelo base `biodatlab/distill-whisper-th-small`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni garantias de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/supersuphot/distill-whisper-th-small-timestamped
- Modelo base: https://huggingface.co/biodatlab/distill-whisper-th-small
- Modelo relacionado (misma destilacion tailandesa): https://huggingface.co/Surapat27/distill-whisper-th-small
- Organizacion distil-whisper en HuggingFace: https://huggingface.co/distil-whisper
- Repositorio distil-whisper: https://github.com/huggingface/distil-whisper
- Transformers.js: https://github.com/huggingface/transformers.js
- Espejo del modelo base en ModelHub: https://dev.modelhub.org.cn/biodatlab/distill-whisper-th-small
