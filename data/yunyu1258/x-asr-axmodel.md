# yunyu1258/x-asr-axmodel

## Resumen

X-ASR AXMODEL es la conversión del encoder offline del modelo de reconocimiento automático de voz X-ASR-zh-en (un Zipformer2 transducer de 0,16 mil millones de parámetros, bilingüe chino-inglés y con licencia Apache-2.0) al formato `axmodel` propietario de los aceleradores neuronales AXERA de la serie AX650. El artefacto lo publica el usuario yunyu1258 en Hugging Face y su objetivo es permitir la inferencia ASR sobre hardware NPU de bajo consumo en lugar de GPU o CPU de propósito general.

El repositorio no contiene un modelo de lenguaje ni un sistema ASR completo listo para usar: incluye únicamente el encoder compilado para NPU (`encoder.axmodel`), su equivalente en ONNX fp32 (`encoder.onnx`), los módulos decoder y joiner en ONNX para ejecutar la búsqueda voraz en CPU con onnxruntime, el vocabulario `tokens.txt` de 5000 entradas sin puntuación y un conjunto de audios de prueba a 16 kHz mono.

Su relevancia es acotada pero concreta: ofrece una vía reproducible para desplegar ASR bilingüe en dispositivos empotrados con NPU AX650/AX630C, con una validación de precisión documentada frente al modelo ONNX original (coseno medio 0,998101) y un script de inferencia publicado en un repositorio de GitHub. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue derivado de X-ASR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder + decoder + joiner); encoder convertido a NPU |
| Parámetros totales | 0,16 B (160 millones, según la model card del autor) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana fija de 10 s de audio (1000 frames fbank, 80 dimensiones); audio más largo se segmenta en ventanas con paso de 8 s |
| Tipos de cuantización | no disponible (se distribuye `encoder.axmodel` compilado para NPU y `encoder.onnx` en fp32; no se documentan niveles de cuantización) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `axmodel` (NPU AXERA), ONNX (encoder fp32, decoder y joiner), `tokens.txt` (5000 tokens, sin puntuación) |

## Arquitectura y entrenamiento

El modelo subyacente es un transducer Zipformer2, una arquitectura de ASR end-to-end compuesta por un encoder que procesa features fbank, un decoder que modela el historial de tokens y un joiner que combina ambas representaciones para producir la distribución sobre el vocabulario. El encoder recibe una entrada `x4d` de forma `[1, 1, 1000, 80]` (10 segundos de fbank) y devuelve `encoder_out` de forma `[1, 248, 512]`, lo que fija el downsampleo temporal interno del encoder y la dimensión de sus representaciones.

La conversión a AX650 se realiza con Pulsar2, la herramienta de compilación de AXERA, y el autor documenta la fidelidad numérica del artefacto compilado frente al ONNX fp32 mediante simulación: coseno entre 0,996739 y 0,999012 según el audio, con MAE de 0,08 a 0,14. No se especifican en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF/DPO ni técnicas de aumento de datos); esos detalles corresponden a la model card de X-ASR-zh-en, no incluida aquí.

## Capacidades

- Reconocimiento automático de voz offline en chino e inglés con un único modelo bilingüe.
- Decodificación transducer con búsqueda voraz (greedy search) ejecutada en CPU mediante onnxruntime para decoder y joiner.
- Inferencia del encoder acelerada en NPU AXERA AX650/AX630C mediante el runtime `axengine`.
- Procesamiento de audio de entrada a 16 kHz mono; ventana fija de 10 s con segmentación por paso de 8 s para audios más largos.
- Salida de texto sin puntuación (el vocabulario `tokens.txt` es la versión sin signos de puntuación).
- No se documentan tool calling, function calling, capacidades de agente, modo thinking, visión ni audio más allá del propio ASR.

## Casos de uso

- Subtitulado y transcripción en dispositivos empotrados: el encoder se ejecuta en la NPU AX650 y permite transcribir audio de 16 kHz en local sin conexión a la nube, adecuado para grabadoras, wearables o terminales industriales con ese SoC.
- Dictado bilingüe chino-inglés en aplicaciones de escritorio o kioscos con NPU AXERA: el modelo cubre ambas lenguas con un solo artefacto y un vocabulario de 5000 tokens.
- Transcripción por lotes de reuniones o notas de voz: la segmentación en ventanas de 10 s con paso de 8 s permite procesar audios largos de forma determinista, a costa de solapamiento entre fragmentos.
- Preprocesado de pipelines de datos de voz: generar transcripciones en bruto para indexación, búsqueda o etiquetado posterior, asumiendo que la salida carece de puntuación y requerirá un postprocesado.
- Validación y benchmarking de compiladores NPU: el par `encoder.onnx` / `encoder.axmodel` y las métricas de coseno publicadas sirven como referencia para verificar conversiones Pulsar2 en proyectos propios.
- Prototipado en entornos sin GPU: al incluir `encoder.onnx` fp32, se puede ejecutar la misma lógica de inferencia en CPU antes de disponer del hardware AX650.
- Integración en asistentes de voz locales con requisitos de privacidad: al no depender de servicios externos, el audio no sale del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, CER, MMLU, etc.) en la información disponible. El autor solo documenta la fidelidad de la conversión ONNX frente a AXMODEL mediante simulación Pulsar2:

| Audio | Coseno | Consistencia de texto |
|---|---|---|
| 0.wav | 0,999012 | completamente idéntica |
| 1.wav | 0,998276 | 10 tokens de diferencia (palabras en inglés) |
| 2.wav | 0,996739 | 3 tokens de diferencia |
| 3.wav | 0,998375 | 3 tokens de diferencia |

Coseno medio 0,998101; mínimo 0,996739; MAE entre 0,08 y 0,14. No se proporcionan cifras de latencia ni de throughput en la información disponible.

## Requisitos de hardware

- NPU AXERA AX650 o AX630C (el autor indica que se requiere la serie AX650/AX630C) junto con el runtime `axengine`; sin ese hardware, el encoder compilado no es utilizable.
- Alternativa sin NPU: ejecutar `encoder.onnx` en CPU con onnxruntime, junto con `decoder.onnx` y `joiner.onnx`.
- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,2 GB, lo que da una cota superior del espacio en disco necesario para todos los artefactos.
- GPU recomendadas: no disponible; el diseño del artefacto está orientado a NPU, no a GPU.
- Despliegue: `axengine` (runtime oficial de AXERA) para el encoder en NPU y onnxruntime para decoder y joiner en CPU; el autor no menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Instalación indicada por el autor: `pip install axengine numpy` y ejecución de `run_asr.py` con `--models-dir` y `--audio`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| X-ASR AXMODEL (este) | 0,16 B (Zipformer2) | 10 s fijos, paso 8 s | zh, en | Apache-2.0 | axmodel + ONNX, NPU AX650 |
| X-ASR-zh-en (origen) | 0,16 B (Zipformer2) | no disponible en esta ficha | zh, en | Apache-2.0 | pesos originales; no disponible el detalle |
| Alternativas ASR genéricas (Whisper, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo de origen X-ASR-zh-en, del que se conoce el tamaño y la licencia pero no los detalles de despliegue ni métricas de calidad. Para el resto de alternativas de la categoría no hay datos en esta ficha.

## Limitaciones y advertencias

- Ventana de audio fija de 10 s (1000 frames); audios más largos se cortan en ventanas con paso de 8 s, lo que introduce solapamiento y posibles duplicaciones o cortes en las transcripciones.
- Salida sin puntuación: el vocabulario de 5000 tokens es la versión sin signos, por lo que se necesita un postprocesado para obtener texto legible.
- Dependencia de hardware propietario: el encoder compilado solo funciona en NPU AX650/AX630C con el runtime `axengine`; fuera de ese entorno hay que recurrir al ONNX en CPU.
- Cobertura lingüística limitada a chino e inglés; no se documenta soporte de otras lenguas.
- No se documentan sesgos del modelo original ni tasas de alucinación o de error (WER/CER) en la información disponible; la única validación publicada es la fidelidad numérica de la conversión, no la calidad del reconocimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-10): no hay evidencia de uso en producción ni de mantenimiento continuado.
- La licencia Apache-2.0 cubre los pesos de origen; el autor remite al repositorio de GitHub para los scripts de conversión e inferencia, cuya licencia específica no se detalla en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunyu1258/x-asr-axmodel
- Modelo de origen X-ASR-zh-en: https://huggingface.co/GilgameshWind/X-ASR-zh-en
- Repositorio de scripts de conversión e inferencia: https://github.com/yuyun2000/x-asr-axmodel
