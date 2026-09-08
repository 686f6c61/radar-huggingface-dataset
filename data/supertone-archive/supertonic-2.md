# supertone-archive/supertonic-2

## Resumen

Supertonic 2 es un sistema de síntesis de texto a voz (TTS) desarrollado por Supertone Inc., diseñado para ejecutarse íntegramente en el dispositivo con una latencia mínima. La versión 2 amplía el soporte multilingüe del modelo original, que ya destacaba por su velocidad de inferencia. Con solo 66 millones de parámetros y un tamaño de repositorio de 0,3 GB, está optimizado para ONNX Runtime, lo que permite su uso en CPU, WebGPU y GPU sin necesidad de servicios en la nube.

El modelo resuelve el problema de la síntesis de voz en tiempo real en entornos con recursos limitados, ofreciendo un factor de tiempo real (RTF) de hasta 0,001 en una RTX 4090 y de 0,012 en un Apple M4 Pro por CPU. Según las pruebas publicadas, Supertonic 2 es hasta 167 veces más rápido que el tiempo real, superando ampliamente a APIs comerciales como ElevenLabs Flash v2.5, OpenAI TTS-1 o Gemini 2.5 Flash TTS, así como a otros modelos open source como Kokoro o NeuTTS Air. La relevancia actual del modelo radica en la creciente demanda de soluciones de voz privadas, sin dependencia de la nube, con soporte para inglés, coreano, español, portugués y francés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 66 millones |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, coreano, español, portugués, francés |
| Licencia | OpenRAIL-M |
| Formato de pesos | ONNX (con soporte adicional de PyTorch para pruebas en GPU) |

Nota: La arquitectura interna no se detalla en la información disponible. El modelo se distribuye principalmente en formato ONNX, aunque las pruebas de rendimiento en RTX 4090 se realizaron con pesos en PyTorch.

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo ni sobre el proceso de entrenamiento. Se sabe que Supertonic 2 es un sistema de TTS de 66 millones de parámetros, optimizado para el runtime ONNX, y que comparte la misma arquitectura y pipeline de inferencia para todos los idiomas soportados. La innovación principal documentada es su eficiencia computacional: mantiene la misma velocidad que la versión original mientras amplía el soporte a cinco idiomas. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO, que por otra parte no son habituales en modelos de síntesis de voz.

## Capacidades

- Generación de voz a partir de texto en cinco idiomas: inglés, coreano, español, portugués y francés.
- Inferencia ultrarrápida: hasta 167 veces más rápida que el tiempo real, con RTF de 0,001 en RTX 4090 y 0,012 en CPU M4 Pro (con 2 pasos de inferencia).
- Ejecución on-device mediante ONNX Runtime, sin necesidad de conexión a internet ni llamadas a APIs.
- Soporte para CPU, WebGPU y GPU (probado en Apple M4 Pro y NVIDIA RTX 4090).
- Sin degradación de velocidad al ampliar los idiomas: la versión 2 mantiene el mismo rendimiento que la original.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada; es un modelo puramente texto a voz.

## Casos de uso

- Asistentes de voz en tiempo real: gracias a su RTF extremadamente bajo (0,012 en CPU), Supertonic 2 puede generar respuestas habladas al instante en aplicaciones móviles o dispositivos IoT, sin depender de servidores externos.
- Accesibilidad en lectores de pantalla: el modelo permite convertir texto a voz en cinco idiomas de forma local, lo que resulta útil para personas con discapacidad visual que necesitan retroalimentación inmediata y privada.
- Audioguías y aplicaciones turísticas offline: al ejecutarse completamente en el dispositivo, es ideal para guías de viaje que funcionan sin conexión, ofreciendo narración en varios idiomas sin costes de datos.
- Doblaje automático de contenidos: la alta velocidad de procesamiento (hasta 12.164 caracteres por segundo en RTX 4090) permite generar locuciones para vídeos, podcasts o cursos en lote, en múltiples idiomas, sin necesidad de servicios cloud.
- Sistemas de respuesta de voz interactiva (IVR): en centros de atención telefónica, la baja latencia permite construir menús de voz dinámicos y conversacionales que responden de inmediato, mejorando la experiencia del usuario.
- Aplicaciones educativas de idiomas: el soporte para español, francés, portugués, inglés y coreano facilita la creación de ejercicios de pronunciación y escucha con retroalimentación instantánea, incluso en dispositivos modestos.
- Videojuegos con diálogos procedurales: la capacidad de generar voz en tiempo real en el cliente permite narrar eventos dinámicos o conversaciones de personajes sin precargar archivos de audio, reduciendo el tamaño del juego.

## Benchmarks y rendimiento

Los benchmarks disponibles se centran en velocidad de síntesis, medida en caracteres por segundo y factor de tiempo real (RTF), para textos de longitud corta (59 caracteres), media (152) y larga (266), con 2 pasos de inferencia.

| Sistema | Caracteres/seg (corto) | Caracteres/seg (medio) | Caracteres/seg (largo) | RTF (corto) | RTF (medio) | RTF (largo) |
|---|---|---|---|---|---|---|
| Supertonic 2 (M4 Pro CPU) | 912 | 1048 | 1263 | 0,015 | 0,013 | 0,012 |
| Supertonic 2 (M4 Pro WebGPU) | 996 | 1801 | 2509 | 0,014 | 0,007 | 0,006 |
| Supertonic 2 (RTX 4090) | 2615 | 6548 | 12164 | 0,005 | 0,002 | 0,001 |
| ElevenLabs Flash v2.5 (API) | 144 | 209 | 287 | 0,133 | 0,077 | 0,057 |
| OpenAI TTS-1 (API) | 37 | 55 | 82 | 0,471 | 0,302 | 0,201 |
| Gemini 2.5 Flash TTS (API) | 12 | 18 | 24 | 1,060 | 0,673 | 0,541 |
| Supertone Sona speech 1 (API) | 38 | 64 | 92 | 0,372 | 0,206 | 0,163 |
| Kokoro (open source) | 104 | 107 | 117 | 0,144 | 0,124 | 0,126 |
| NeuTTS Air (open source) | 37 | 42 | 47 | 0,390 | 0,338 | 0,343 |

La model card también incluye datos con 5 pasos de inferencia, que muestran un rendimiento inferior pero aún muy elevado: en RTX 4090, el RTF para texto largo es de 0,002 y se alcanzan 6.242 caracteres por segundo. No se han publicado benchmarks de calidad perceptual (MOS, WER, etc.) en la información disponible.

## Requisitos de hardware

- No se especifica la VRAM estimada para inferencia. Dado que el modelo tiene 66 millones de parámetros y se distribuye en ONNX, es probable que quepa en cualquier GPU consumer moderna, pero no se proporciona una cifra exacta.
- GPU recomendada: NVIDIA RTX 4090 para el máximo rendimiento, según las pruebas publicadas. También funciona en CPU (Apple M4 Pro) y en WebGPU.
- El modelo cabe en dispositivos de consumo: se ha probado en un MacBook Pro con M4 Pro (CPU y WebGPU) y en una RTX 4090.
- Opciones de despliegue: ONNX Runtime, WebGPU y PyTorch (para GPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los valores de caracteres por segundo y RTF están disponibles en la tabla de benchmarks. En una RTX 4090, el modelo genera 12.164 caracteres por segundo en textos largos, con un RTF de 0,001, lo que equivale a generar un segundo de audio en un milisegundo.

## Comparativa con modelos similares

Comparación con dos modelos open source de TTS mencionados en la información: Kokoro y NeuTTS Air. No se dispone de sus parámetros ni licencias en la información proporcionada, por lo que la comparación se limita al rendimiento medido.

| Modelo | Parámetros | RTF (texto largo, CPU M4 Pro) | Caracteres/seg (texto largo, CPU M4 Pro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supertonic 2 | 66M | 0,012 | 1263 | OpenRAIL-M | HuggingFace, GitHub |
| Kokoro | no disponible | 0,126 | 117 | no disponible | GitHub, HuggingFace |
| NeuTTS Air | no disponible | 0,343 | 47 | no disponible | GitHub |

Supertonic 2 es claramente más rápido que ambos en las mismas condiciones de CPU. Sin embargo, no se dispone de datos sobre la calidad de voz para comparar la fidelidad de la síntesis.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad de voz (MOS) ni de inteligibilidad en la información disponible, por lo que no es posible comparar la naturalidad con otros modelos.
- La arquitectura interna, el dataset de entrenamiento y el proceso de entrenamiento no están documentados en la model card.
- El modelo solo soporta cinco idiomas (inglés, coreano, español, portugués y francés). La calidad en otros idiomas no está garantizada.
- La licencia OpenRAIL-M incluye cláusulas de uso responsable. Es necesario revisar el archivo LICENSE antes de usar el modelo en producción o en aplicaciones comerciales para asegurar el cumplimiento.
- El repositorio en HuggingFace muestra 0 descargas y 0 likes, lo que indica que el modelo es nuevo o que su adopción es aún muy limitada.
- Al ser un modelo de 66 millones de parámetros, es probable que la calidad de voz sea inferior a la de sistemas más grandes o servicios cloud, aunque no hay datos que lo confirmen.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/supertone-archive/supertonic-2
- HuggingFace (modelo alternativo): https://huggingface.co/Supertone/supertonic-2
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Supertone/supertonic-2
- Código fuente en GitHub: https://github.com/supertone-inc/supertonic
- Licencia del modelo: https://huggingface.co/Supertone/supertonic-2/blob/main/LICENSE
