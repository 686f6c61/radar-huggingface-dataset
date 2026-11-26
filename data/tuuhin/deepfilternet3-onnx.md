# tuuhin/deepfilternet3-onnx

## Resumen

DeepFilterNet 3 (ONNX, streaming) es una redistribución del modelo de supresión de ruido y mejora de voz DeepFilterNet 3, desarrollado originalmente por Hendrik Schröter y colaboradores (proyecto Rikorose). El repositorio, publicado por el usuario tuuhin, no contiene un modelo nuevo, sino una conversión de los grafos ONNX oficiales de tipo *batch* a grafos *streaming* con estado recurrente explícito (entradas y salidas de estado oculto del GRU), de modo que la inferencia pueda ejecutarse fotograma a fotograma con memoria real entre llamadas. Resuelve un problema práctico de despliegue: el export ONNX upstream reinicia el estado oculto del GRU a cero en cada `Run()` y aplica zero-padding en las convoluciones causales, lo que impide su uso en tiempo real.

El modelo procesa audio a 48 kHz con un salto de 480 muestras (10 ms), FFT de 960 puntos, 32 bandas ERB y 96 bins de filtro profundo, con una latencia algorítmica de aproximadamente 40 ms. La conversión es numéricamente idéntica a los grafos batch upstream, verificada bit a bit sobre ONNX Runtime. Es relevante ahora porque permite integrar supresión de ruido en tiempo real en pipelines de audio (videollamadas, VoIP, asistentes de voz, grabación) usando únicamente ONNX Runtime, sin dependencias del framework original.

La licencia del artefacto se declara Apache-2.0, mientras que el proyecto upstream se distribuye bajo doble licencia MIT OR Apache-2.0. El tamaño del repositorio es de 0.0 GB según los metadatos de Hugging Face, aunque los ficheros listados suman aproximadamente 8.6 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda para mejora de voz con front-end de convoluciones causales, codificador, decodificador de bandas ERB y decodificador de filtro profundo; incluye nodos GRU (recurrentes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento por fotogramas de 10 ms; sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (los ficheros publicados son grafos ONNX en precisión original) |
| Idiomas soportados | no disponible (procesamiento de señal de voz, independiente del idioma) |
| Licencia | Apache-2.0 (artefacto redistribuido); upstream MIT OR Apache-2.0 |
| Formato de pesos | ONNX (tres grafos: `enc.onnx`, `erb_dec.onnx`, `df_dec.onnx` más `config.ini`) |

## Arquitectura y entrenamiento

DeepFilterNet 3 es una arquitectura de mejora de voz perceptualmente motivada que combina un front-end de convoluciones causales sobre la señal, un codificador, un decodificador que opera en bandas ERB (32 bandas) y un decodificador de filtro profundo sobre 96 bins. El modelo original se presentó en INTERSPEECH 2023 (Schröter et al.) y está diseñado para operar en tiempo real con baja latencia. La conversión publicada en este repositorio transforma los grafos ONNX batch en grafos streaming mediante la exposición explícita de los estados recurrentes del GRU como entradas y salidas, y la sustitución del zero-padding temporal por estado histórico real.

No se dispone de información sobre el número de tokens o horas de audio de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada. La innovación técnica destacable de esta redistribución es la conversión a streaming con equivalencia numérica bit a bit verificada frente a los grafos batch upstream sobre ONNX Runtime, lo que permite su uso en aplicaciones de tiempo real con estado recurrente persistente entre llamadas.

## Capacidades

- Supresión de ruido y mejora de voz en tiempo real sobre audio a 48 kHz.
- Procesamiento streaming por fotogramas de 10 ms (480 muestras) con estado recurrente persistente.
- Salida de audio mejorado con latencia algorítmica de aproximadamente 40 ms.
- Ejecución sobre ONNX Runtime, sin dependencia del framework de entrenamiento original.
- Equivalencia numérica bit a bit con los grafos batch upstream.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, visión).

## Casos de uso

- Videollamadas y VoIP en tiempo real: el modelo puede procesar el flujo de audio entrante fotograma a fotograma (10 ms) con estado recurrente persistente, suprimiendo ruido de fondo antes de la codificación y el envío, gracias a su latencia de ~40 ms compatible con conversación interactiva.
- Asistentes de voz y reconocimiento automático del habla (ASR): la mejora previa de la señal reduce la tasa de error de los motores ASR en entornos ruidosos; se integraría como etapa de preprocesado en el pipeline de captura.
- Grabación y postproducción de audio: aplicación de supresión de ruido en ficheros ya capturados ejecutando el grafo streaming sobre el flujo completo, con la ventaja de un artefacto ONNX verificable por checksum.
- Herramientas de comunicación en navegador o aplicaciones de escritorio: al ser ONNX, puede ejecutarse con ONNX Runtime Web o runtime nativo sin arrastrar dependencias del proyecto original, facilitando la distribución de un artefacto fijado y verificable.
- Sistemas embebidos y edge: el tamaño reducido de los grafos (aproximadamente 8.6 MB en total) permite su inclusión en dispositivos con recursos limitados, siempre que el runtime soporte los operadores empleados.
- Pipelines de CI/CD de audio: la verificación por SHA-256 de cada fichero permite fijar el artefacto en despliegues reproducibles y auditar su procedencia respecto al commit upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño de los grafos (unos 8.6 MB en total) el consumo de memoria es muy reducido, pero no se proporcionan cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no se documenta explícitamente; el reducido tamaño de los modelos sugiere que podría ejecutarse en hardware modesto, pero no se confirma.
- Opciones de despliegue: ONNX Runtime (runtime de referencia empleado para la verificación bit a bit); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de audio.
- Latencia y throughput: latencia algorítmica de aproximadamente 40 ms según el contrato de runtime; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Latencia | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepFilterNet 3 (ONNX streaming, este repo) | Supresión de ruido | 48 kHz, hop 480 | ~40 ms | Apache-2.0 (artefacto); MIT OR Apache-2.0 (upstream) | ONNX | Hugging Face (tuuhin/deepfilternet3-onnx) |
| DeepFilterNet 3 (ONNX batch upstream) | Supresión de ruido | 48 kHz, batch | no aplica a streaming | MIT OR Apache-2.0 | ONNX | Repositorio GitHub Rikorose/DeepFilterNet |
| Otras alternativas de supresión de ruido | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de rendimiento (métricas como PESQ, STOI o SI-SDR) frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es una redistribución, no el proyecto upstream: el mantenimiento y las actualizaciones dependen de la conversión realizada por tuuhin; conviene contrastar con el repositorio original.
- La licencia declarada en Hugging Face es Apache-2.0, mientras que el upstream ofrece doble licencia MIT OR Apache-2.0; para uso comercial debe revisarse la documentación de licencia incluida (`LICENSE-MIT`, `LICENSE-APACHE`) y el fichero `NOTICE`.
- No se documentan sesgos conocidos, pero al ser un modelo de procesamiento de señal de voz, su comportamiento puede degradarse en condiciones acústicas distintas a las de entrenamiento (no documentadas aquí).
- No hay información sobre el dataset de entrenamiento, lo que limita la evaluación de posibles sesgos o dominios no cubiertos.
- El modelo no genera texto ni realiza razonamiento; no debe emplearse para tareas de NLP.
- La latencia de ~40 ms es algorítmica; la latencia real dependerá del hardware y del runtime.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- El tamaño del repositorio se reporta como 0.0 GB en los metadatos, aunque los ficheros listados suman unos 8.6 MB; conviene verificar la integridad mediante los SHA-256 publicados.

## Enlaces

- Hugging Face: https://huggingface.co/tuuhin/deepfilternet3-onnx
- Repositorio upstream: https://github.com/Rikorose/DeepFilterNet
- Commit upstream referenciado: `d375b2d8309e0935d165700c91da9de862a99c31`
- Paper (INTERSPEECH 2023): Schröter, Rosenkranz, Escalante-B., Maier, "DeepFilterNet: Perceptually Motivated Real-Time Speech Enhancement"
