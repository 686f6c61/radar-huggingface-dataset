# yj000018/eya-emotion2vec-onnx

## Resumen

`yj000018/eya-emotion2vec-onnx` es una exportación a ONNX del modelo `emotion2vec/emotion2vec_plus_base`, desarrollado originalmente por Alibaba DAMO dentro del ecosistema FunASR. El modelo base es un sistema de reconocimiento de emociones en habla (speech emotion recognition, SER) que clasifica fragmentos de audio en nueve categorías discretas: enfadado, asqueado, temeroso, feliz, neutro, otro, triste, sorprendido y desconocido. La contribución de este repositorio no es un modelo nuevo, sino una conversión a formato ONNX con cuantización dinámica int8 limitada a operadores MatMul y Gemm, lo que permite ejecutar la inferencia en `onnxruntime-web` sobre WebAssembly.

La relevancia de esta ficha es acotada pero concreta: se trata de un artefacto de despliegue pensado para llevar un clasificador de emociones a entornos de navegador o edge sin dependencia de Python ni de GPUs, con un peso de fichero de aproximadamente 119 MB. El repositorio completo ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta, lo que indica que es un artefacto reciente y de nicho, probablemente de uso interno o experimental.

Las especificaciones de arquitectura del modelo base no se detallan en la model card proporcionada; se sabe que pertenece a la familia emotion2vec+ de FunASR, orientada a representaciones auto-supervisadas de habla para tareas paralingüísticas. La información disponible se limita a la interfaz de entrada/salida, el tamaño del fichero y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base emotion2vec+ de FunASR; exportado a ONNX) |
| Parametros totales | no disponible (fichero ONNX int8 de 119.128.801 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio fija de 4 s (64.000 muestras a 16 kHz) |
| Tipos de cuantizacion | int8 dinámica sobre operadores MatMul y Gemm |
| Idiomas soportados | no disponible (el modelo base es multimodal en habla; la card no declara idiomas) |
| Licencia | FunASR Model License 1.1 (`funasr-model-license`) |
| Formato de pesos | ONNX (`e2v_base.int8-web.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `emotion2vec/emotion2vec_plus_base` en la documentación proporcionada. Por la familia a la que pertenece (emotion2vec+ de FunASR), se trata de un modelo de representación de habla entrenado de forma auto-supervisada y ajustado para clasificación de emociones, pero la model card de esta exportación no especifica el tipo de encoder, el número de capas ni el volumen de datos de entrenamiento.

La innovación técnica documentada en este repositorio es exclusivamente la del proceso de exportación: conversión a ONNX con cuantización dinámica restringida a MatMul y Gemm para garantizar compatibilidad con `onnxruntime-web` sobre WebAssembly. Esta decisión de diseño implica que otros operadores permanecen en precisión original, lo que reduce la pérdida de exactitud respecto a una cuantización completa. La interfaz es fija: entrada `wav` de tipo float32 con forma `[1, 64000]` (4 segundos, 16 kHz, mono) y salida `probs` con forma `[1, 9]` correspondiente a las nueve clases emocionales.

## Capacidades

- Clasificación de emociones en habla en nueve categorías: angry, disgusted, fearful, happy, neutral, other, sad, surprised, unknown.
- Procesamiento de audio mono a 16 kHz con ventana fija de 4 segundos (64.000 muestras).
- Inferencia en navegador mediante `onnxruntime-web` con backend WASM, sin necesidad de GPU.
- Ejecución en entornos edge y sin dependencias de Python.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe explícita ni modos especiales (thinking, visión, audio generativo).
- No se documenta detección de eventos acústicos más allá de las nueve clases de emoción.

## Casos de uso

- Moderación de voz en aplicaciones web: integración del ONNX en un front-end con `onnxruntime-web` para detectar tono emocional (por ejemplo, enfado o tristeza) en llamadas o mensajes de voz y activar protocolos de escalado.
- Análisis de satisfacción en atención al cliente: procesar fragmentos de 4 segundos de grabaciones telefónicas para etiquetar la emoción del cliente y agregar métricas por agente o por campaña.
- Teleasistencia y salud digital: clasificación de estado emocional en consultas remotas o líneas de ayuda, usando la ventana de 4 segundos como unidad de análisis en tiempo casi real.
- Investigación en paralingüística: uso del modelo como extractor de etiquetas emocionales en corpus de habla, aprovechando el formato ONNX para reproducibilidad y despliegue ligero.
- Aplicaciones educativas o de idiomas: detección de frustración o entusiasmo del alumno durante ejercicios de pronunciación y adaptación del ritmo del ejercicio.
- Prototipado rápido en navegador: validación de ideas de producto de voz sin infraestructura de servidor, gracias al tamaño de 119 MB y a la ejecución WASM.
- Filtrado previo en pipelines de audio: uso como clasificador barato que descarta o prioriza segmentos antes de enviarlos a modelos más costosos de transcripción o análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario objetivo (ejecución en CPU vía WebAssembly); el fichero ONNX int8 ocupa 119.128.801 bytes, por lo que la huella de memoria en ejecución será del orden de cientos de MB, sin cifra oficial publicada.
- GPU recomendadas: no disponibles; el artefacto está diseñado para CPU y navegador, no para aceleración GPU.
- Compatibilidad con GPU de consumo: no documentada; el backend declarado es `onnxruntime-web` WASM.
- Opciones de despliegue: `onnxruntime-web` (WASM) es el destino explícito; también podría ejecutarse con `onnxruntime` en Python/C++/Node, aunque no se documenta.
- Latencia y throughput: no disponibles; dependen del dispositivo y del backend WASM.
- Entrada fija de 4 s a 16 kHz mono, lo que simplifica el preprocesado pero impide ventanas variables sin recorte o relleno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `yj000018/eya-emotion2vec-onnx` | no disponible (ONNX int8 de 119 MB) | audio fijo 4 s, 16 kHz | SER, 9 clases | FunASR Model License 1.1 | ONNX int8 |
| `emotion2vec/emotion2vec_plus_base` | no disponible | no disponible en la información | SER, 9 clases | FunASR Model License 1.1 | safetensors / PyTorch (no confirmado) |
| Otros SER de la familia FunASR | no disponible | no disponible | SER | FunASR Model License 1.1 | varios |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal entre el modelo base y esta exportación es el formato y la cuantización, no la arquitectura ni el entrenamiento.

## Limitaciones y advertencias

- La ventana de entrada está fijada a 4 segundos y 16 kHz mono; audios más largos requieren segmentación y audios más cortos, relleno, lo que puede alterar las probabilidades.
- La cuantización int8 dinámica sobre MatMul y Gemm puede introducir una degradación de exactitud no cuantificada en la documentación; no se publican métricas de la pérdida respecto al modelo base.
- El modelo base no declara idiomas soportados en la información disponible; el rendimiento en castellano o en variedades no inglesas no está verificado.
- Riesgo de sesgo: los clasificadores de emoción entrenados con corpus de habla pueden presentar sesgos por género, edad, acento y cultura; no se documenta ninguna evaluación de equidad.
- Riesgo de alucinación de etiqueta: la clase `other` y `unknown` absorben casos ambiguos, pero no se documenta el umbral de confianza recomendado para producción.
- La licencia FunASR Model License 1.1 no es una licencia de código abierto estándar; es necesario revisar sus términos antes de un uso comercial.
- El repositorio no registra descargas ni validación comunitaria; la reproducibilidad depende del hash SHA-256 publicado (`dd0e2e58e50c035487f6ad618f0aec424a30a5243c64d12c8fd49dadae77a6cd`).
- No se documenta el pipeline de preprocesado (normalización, VAD, remuestreo), lo que puede provocar discrepancias entre el modelo base y esta exportación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yj000018/eya-emotion2vec-onnx
- Modelo base: https://huggingface.co/emotion2vec/emotion2vec_plus_base
- Licencia FunASR Model License 1.1: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Repositorio FunASR: https://github.com/modelscope/FunASR
