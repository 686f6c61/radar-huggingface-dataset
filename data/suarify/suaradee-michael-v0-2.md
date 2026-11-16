# Suarify/suaradee-michael-v0.2

## Resumen

Suaradee Michael v0.2 es un modelo de síntesis de voz (text-to-speech) en bahasa melayu (malasio) con voz masculina, desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX de 8,46 MB con pesos int8, lo que permite ejecutarlo en una pestaña del navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python. Es el hermano masculino de Suaradee v0.3 (voz femenina), con el mismo tamano, el mismo código y el mismo front end fonético para malayo.

El modelo parte de la arquitectura y la receta de entrenamiento de Paradee-8M-v1.3, un TTS de 8M de parámetros, y se ha especializado en malayo mediante un front end basado en reglas que convierte el texto en fonemas dentro del vocabulario de 178 símbolos de Kokoro-82M. La salida es audio mono a 24 kHz. Su relevancia radica en la combinación de tamano minimo, licencia Apache-2.0 y despliegue sin GPU, lo que lo hace apto para entornos web, dispositivos de borde y prototipos de accesibilidad en malayo, un idioma con escasa cobertura en TTS open source.

La calidad es limitada y el propio autor lo advierte: es una primera versión con una tasa de error de caracteres (CER) mediana del 6,2% en frases no vistas, pero el 43% de las frases de test superan el 8% de CER. El modelo se entrenó con solo unos 49 minutos de voz sintética en malayo, generada con Chatterbox Multilingual y convertida dos veces de voz, por lo que el resultado suena algo robótico y presenta debilidades en nombres, números, palabras en inglés y frases largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal basada en Paradee-8M (decodificador con 128 armónicos sinusoidales; front end fonético basado en reglas sobre vocabulario de 178 símbolos de Kokoro-82M) |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (orientado a frases cortas; el texto largo se divide en finales de frase) |
| Tipos de cuantizacion | int8 (pesos cuantizados en el archivo ONNX) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras comunes en inglés usadas en el habla malasia |
| Licencia | Apache-2.0 (los léxicos `lexicon_e.json` derivan de Wiktionary y son CC BY-SA 4.0) |
| Formato de pesos | ONNX (opset 17), archivo `onnx/model_quantized.onnx` de 8,46 MB; compatible con transformers.js y WebGPU |
| Frecuencia de salida | 24 kHz mono |
| Entradas | `input_ids` (int64 `[1,T]`) y `speed` (float32 `[1]`) |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura y la receta de entrenamiento de Paradee-8M-v1.3, partiendo de su fila de voz masculina estadounidense. El pipeline consta de un front end basado en reglas (`suaradee/`, portado línea por línea a `js/`) que transcribe el malayo a fonemas dentro del vocabulario de 178 símbolos de Kokoro-82M, y un decodificador neuronal de 8M de parámetros que genera audio a 24 kHz. En la versión v0.2 el decodificador emplea 128 armónicos sinusoidales en lugar de 64: para una voz de 120 Hz, 64 armónicos se detenían en torno a 7,5 kHz y el resto del espectro se rellenaba con ruido (siseo); con 128 armónicos la banda de 7,5-11 kHz se ajusta mejor al audio de entrenamiento.

El entrenamiento se realizó sobre aproximadamente 49 minutos de voz sintética en malayo: unas 750 frases en malayo se convirtieron en audio con Chatterbox Multilingual y se convirtieron dos veces de voz (primero a voz femenina y luego a la voz masculina) usando una referencia leída por Kokoro `am_michael`. El audio posterior a la última palabra alineada se recorta. El entrenamiento completo llevó menos de una hora en una única GPU T4. Los pesos se exportaron a ONNX (opset 17) con pesos int8 y se hicieron seguros para WebGPU. No se documenta uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz en bahasa melayu (Malasia) con una única voz masculina sintética, cercana a `am_michael` de Kokoro.
- Generación de audio a 24 kHz mono a partir de texto, con control de velocidad mediante la entrada `speed`.
- Procesamiento de palabras comunes en inglés presentes en el habla malasia (code-switching limitado).
- Ejecución en navegador mediante transformers.js con WebGPU o WASM, y en Python sobre un solo hilo de CPU.
- Soporte de streaming en los front ends de Python y JavaScript (`stream_python.py`, `stream_node.mjs`).
- División automática de texto largo en finales de frase.
- No dispone de control de emoción, estilo ni de múltiples hablantes.
- No soporta tool calling, function calling ni razonamiento multi-step (no es un modelo de lenguaje).

## Casos de uso

- Lectura de contenido web en malayo: integrado vía transformers.js en una página, el modelo puede leer artículos o avisos en voz alta directamente en el navegador con WebGPU o WASM, sin enviar texto a un servidor y sin coste de GPU.
- Accesibilidad para personas con discapacidad visual: al ejecutarse en un solo hilo de CPU y ocupar 8,46 MB, puede incorporarse en aplicaciones de escritorio o móviles de bajo consumo para leer interfaces y notificaciones en malayo.
- Asistentes de voz locales para dispositivos de borde: su tamano minimo permite desplegarlo en Raspberry Pi o dispositivos embebidos para respuestas habladas en malayo en domótica o terminales de información.
- Prototipado rápido de interfaces de voz: con la rueda de Python y el paquete `suaradee`, un equipo puede generar audio de prueba en malayo para validar flujos de conversación antes de invertir en un TTS de mayor calidad.
- Generación de avisos y anuncios cortos: para mensajes institucionales o de transporte en malayo (frases cortas, que es el punto fuerte del modelo), con la advertencia de que debe indicarse que la voz es sintética.
- Investigación y docencia en TTS de bajos recursos: sirve como caso de estudio reproducible de destilación y cuantización int8 de un TTS de 8M de parámetros para un idioma con pocos recursos, con código y receta disponibles.
- Pruebas de integración continua de pipelines de audio: su bajo coste de inferencia permite usarlo como generador de audio de referencia en tests automatizados de sistemas de reconocimiento de voz en malayo.

## Benchmarks y rendimiento

La calidad se midió reproduciendo el habla del modelo a Whisper large-v3 y comparándola con el texto original mediante tasa de error de caracteres (CER; menor es mejor). Ningún modelo puntúa 0 porque el propio reconocedor comete errores.

| Conjunto de frases no vistas | n | CER mediana | CER media acotada | Proporción con CER ≤ 8% |
|---|---|---|---|---|
| Frases de test (cada 5.ª fila de un conjunto de 200, seis categorías) | 40 | 6,2% | 10,2% | 57% |
| Frases reservadas del conjunto de entrenamiento | 60 | 6,8% | 12,9% | 52% |

Desglose por categoría en las frases de test:

| Categoría | n | CER mediana |
|---|---|---|
| codeswitch | 4 | 13,1% |
| conversational | 12 | 7,0% |
| general | 14 | 8,2% |
| numbers | 6 | 0,0% |
| question | 2 | 0,0% |
| short | 2 | 13,5% |

Como referencia, el audio de entrenamiento original obtiene un 4,3% de CER mediana en los clips reservados. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo de pesos es de 8,46 MB en int8 y el modelo puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU; funciona en cualquier CPU moderna. Para aceleración en navegador, WebGPU en GPUs integradas o discretas recientes (por ejemplo, Intel Iris Xe, Apple Silicon, NVIDIA GTX 16xx o superiores).
- Cabe en cualquier GPU consumer, incluida la más modesta, y en dispositivos de borde; también en un solo hilo de CPU en Python.
- Opciones de despliegue: ONNX Runtime (Python), transformers.js (WebGPU o WASM en navegador), rueda Python `suaradee` y scripts de streaming en Node (`stream_node.mjs`).
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que el entrenamiento completo llevó menos de una hora en una T4, pero no se documentan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Suaradee Michael v0.2 | 7,9 M | Malayo (ms) | Frases cortas, texto con `speed` | Apache-2.0 | ONNX, transformers.js, Python |
| Suaradee v0.3 (voz femenina) | 8 M (mismo tamano) | Malayo (ms) | Frases cortas | Apache-2.0 | ONNX, transformers.js, Python |
| Paradee-8M-v1.3 (modelo base) | 8 M | Inglés (voz masculina US) | Frases cortas | no disponible en la información | Hugging Face |
| Kokoro-82M | 82 M | Multilingüe (incluye voces de referencia) | Frases cortas | no disponible en la información | Hugging Face |

Suaradee Michael v0.2 se distingue por ser aproximadamente diez veces más pequeno que Kokoro-82M y por estar especializado en malayo, mientras que Paradee-8M-v1.3 es su base en inglés. El autor indica que la versión femenina v0.3 es más precisa que esta masculina. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Tasa de error: el 43% de las frases de test superan el 8% de CER (una palabra errónea o ausente o más); los puntos débiles son nombres, números, palabras en inglés y frases largas.
- Calidad de sonido: suena algo robótico o apagado en algunas frases; el audio de entrenamiento es sintético y convertido de voz, por lo que el modelo no puede imitarlo con la nitidez de un destilado de un profesor determinista.
- Una única voz masculina sintética, sin control de emoción ni de estilo; algunas frases suenan con un ligero acento estadounidense.
- Entrenado con un conjunto muy pequeno: unos 49 minutos de voz sintética en malayo.
- Pensado para frases cortas; el texto largo se divide en finales de frase y los front ends de Python y JS soportan streaming.
- Riesgo de alucinación en la pronunciación: puede generar palabras incorrectas o inteligibles en entradas fuera de distribución, especialmente con code-switching y nombres propios.
- Es habla sintética; el autor pide indicarlo explícitamente cuando se use.
- Licencia Apache-2.0 para código y pesos, pero los léxicos `lexicon_e.json` derivan de Wiktionary y están bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual para esos ficheros.
- El paquete Python comparte el nombre de importación `suaradee` con el modelo femenino, por lo que debe instalarse en un entorno virtual propio para evitar conflictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/suaradee-michael-v0.2
- Modelo femenino relacionado: https://huggingface.co/Suarify/suaradee-v0.3
- Modelo base Paradee-8M-v1.3: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Kokoro-82M (vocabulario y voz de referencia): https://huggingface.co/hexgrad/Kokoro-82M
- Chatterbox Multilingual (generación de audio de entrenamiento): https://huggingface.co/ResembleAI/chatterbox
- Rueda Python: https://huggingface.co/Suarify/suaradee-michael-v0.2/resolve/main/dist/suaradee_michael-0.2.0-py3-none-any.whl
