# sulabhkatiyar/indic-tiny-tts-english

## Resumen

Indic Tiny TTS English es un modelo de síntesis de voz (text-to-speech) en inglés indio desarrollado por sulabhkatiyar, publicado en Hugging Face bajo licencia CC-BY-4.0. Forma parte de la colección INDIC TINY TTS MODELS, compuesta por 12 modelos minúsculos, uno por idioma, que cubren 11 lenguas indias y el inglés indio. El modelo convierte texto en latín en audio de 24 kHz con dos voces disponibles, femenina y masculina.

La propuesta central es la eficiencia extrema: con solo 8,9 millones de parámetros según los pesos en safetensors (la model card declara 22,5 millones, discrepancia que conviene verificar), el modelo funciona en CPU sin GPU. Según el autor, alcanza un factor de tiempo real de 0,026 en un hilo de CPU de Apple M1 (38 veces más rápido que el tiempo real) y 0,136 en un hilo de CPU x86 (7 veces más rápido), con soporte tanto para PyTorch como para ONNX Runtime.

Es relevante para escenarios de despliegue en dispositivo (on-device), sistemas embebidos y servicios de bajo coste donde el inglés indio es el idioma objetivo. En la evaluación del autor sobre frases de noticias de FLORES-200 obtiene un CER del 1,08 %, inferior al de otros cuatro modelos abiertos de inglés indio comparados, y en frases de test retenidas un CER del 2,94 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; la model card no detalla la arquitectura interna) |
| Parametros totales | 8.932.873 según safetensors; la model card declara 22,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors y ONNX |
| Idiomas soportados | en (inglés indio) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (no se indica si es VITS, FastSpeech, un decoder autorregresivo u otra familia). Lo que sí se documenta es la salida: audio a 24 kHz y dos voces seleccionables mediante el parámetro `voice` (`"female"` y `"male"`). El modelo lee texto en script latino y está empaquetado tanto en safetensors como en ONNX, lo que permite inferencia con PyTorch o con ONNX Runtime.

El entrenamiento se realizó sobre el dataset sulabhkatiyar/indic-tts-mini-24k, que según el autor contiene las voces femenina y masculina en inglés del corpus LIMMITS / SYSPIN del Indian Institute of Science, a 24 kHz. También se referencia el dataset iAkashPaul/limmits-2024. No se documentan en la información disponible el número de tokens, la composición completa del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en TTS). No se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en inglés indio, con salida de audio a 24 kHz.
- Dos voces predefinidas: femenina y masculina, seleccionables por parámetro.
- Lectura de texto en script latino.
- Inferencia en CPU sin necesidad de GPU, con soporte para PyTorch y ONNX Runtime.
- Ejecución en dispositivo (on-device) gracias a su tamaño reducido.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades de clonación de voz, control de emoción, prosodia configurable ni multilingüismo más allá del inglés indio.

## Casos de uso

- Lectura por voz en aplicaciones móviles sin conexión: el modelo cabe en un dispositivo de gama baja y funciona en CPU, por lo que puede integrarse en apps Android o iOS para leer noticias, mensajes o contenido de accesibilidad sin enviar texto a un servidor.
- Accesibilidad para personas con discapacidad visual: su velocidad de 38 veces el tiempo real en un hilo de M1 permite narrar textos largos casi instantáneamente, con dos voces para preferencia del usuario.
- Asistentes de voz para el mercado indio: al estar entrenado con voces nativas de inglés indio (corpus LIMMITS/SYSPIN), reproduce acentos y prosodia locales, adecuado para atención al cliente automatizada en India.
- Sistemas de megafonía y anuncios en transporte o comercio: generación de avisos pregrabados o dinámicos en inglés indio con latencia mínima y sin infraestructura GPU.
- Pruebas y prototipado de pipelines de voz: su reducido tamaño y formatos safetensors/ONNX facilitan la integración en CI/CD y la experimentación rápida antes de pasar a modelos mayores.
- Generación de audio para contenidos educativos o de noticias: la evaluación sobre frases de FLORES-200 y noticias sugiere buen rendimiento en texto informativo, útil para lectores de artículos o materiales de aprendizaje.
- Despliegue en entornos con recursos limitados (Raspberry Pi, contenedores pequeños, edge computing): el factor de tiempo real de 0,136 en un hilo x86 permite síntesis en tiempo real incluso en hardware modesto.

## Benchmarks y rendimiento

Resultados de CER (character error rate, menor es mejor) publicados por el autor.

Frases de noticias de FLORES-200 (100 frases):

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **1,08** | — |
| hexgrad/Kokoro-82M (af_heart, am_fenrir) | 81,8 M | 0,46 | mejor el suyo |
| ai4bharat/indic-parler-tts | 937,8 M | 1,06 | equivalente |
| AI4Bharat/Indic-TTS (en.zip) | 65,6 M | 2,09 | mejor el nuestro |
| myshell-ai/MeloTTS-English (EN_INDIA) | 152,4 M | 3,07 | mejor el nuestro |
| coqui/XTTS-v2 | 466,9 M | 3,60 | equivalente |
| facebook/mms-tts-eng | 29 M | 4,22 | mejor el nuestro |
| SYSPIN/vits_English_Female + Male | 29,1 M | 14,82 | mejor el nuestro |

Frases de test retenidas (300 frases):

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **2,94** | — |
| hexgrad/Kokoro-82M (af_heart, am_fenrir) | 81,8 M | 2,06 | mejor el suyo |
| AI4Bharat/Indic-TTS (en.zip) | 65,6 M | 6,10 | mejor el nuestro |
| myshell-ai/MeloTTS-English (EN_INDIA) | 152,4 M | 7,99 | mejor el nuestro |
| facebook/mms-tts-eng | 29 M | 9,02 | mejor el nuestro |
| SYSPIN/vits_English_Female + Male | 29,1 M | 14,01 | mejor el nuestro |

Modelos mayores sobre las mismas frases retenidas:

| Modelo | Tamano | Frases | CER, % | Este modelo, % | Resultado |
|---|---:|---:|---:|---:|---|
| coqui/XTTS-v2 | 466,9 M | 40 | 3,79 | 2,80 | equivalente |
| ai4bharat/indic-parler-tts | 937,8 M | 40 | 3,22 | 2,80 | equivalente |

Velocidad (factor de tiempo real, menor es más rápido):

| Hardware | Configuracion | Mas rapido que tiempo real | Real-time factor |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7x | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38x | 0,026 |
| NVIDIA T4 | PyTorch | 62x | 0,016 |

El autor indica que iguala la tasa de error de ai4bharat/indic-parler-tts con 1/42 del tamaño y unas 110 veces más rápido en T4.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo es tan pequeño (menos de 10 M de parámetros, repo de 0,2 GB) que cabe en cualquier GPU con unos pocos cientos de MB libres.
- GPU recomendadas: no requiere GPU; funciona en CPU. En GPU, una NVIDIA T4 es suficiente (62x tiempo real según el autor).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer (RTX 4090, RTX 3060, etc.), aunque no es necesario usarla.
- Cabe en CPU de consumo: sí; probado en un hilo de Apple M1 (38x tiempo real) y en 4 vCPU Intel Xeon (7x tiempo real).
- Opciones de despliegue: PyTorch y ONNX Runtime, según la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,016 en T4, 0,026 en M1 y 0,136 en Xeon; es decir, entre 7 y 62 veces más rápido que el tiempo real según hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | CER (FLORES-200), % | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS English** | 8,9 M (safetensors) / 22,5 M (declarado) | Inglés indio | 1,08 | CC-BY-4.0 | Hugging Face, ONNX y safetensors |
| hexgrad/Kokoro-82M | 81,8 M | Inglés (multi-voz) | 0,46 | no disponible en la informacion | Hugging Face |
| ai4bharat/indic-parler-tts | 937,8 M | Inglés indio y lenguas indias | 1,06 | no disponible en la informacion | Hugging Face |
| facebook/mms-tts-eng | 29 M | Inglés | 4,22 | no disponible en la informacion | Hugging Face |
| myshell-ai/MeloTTS-English | 152,4 M | Inglés (variante India) | 3,07 | no disponible en la informacion | Hugging Face |

Frente a Kokoro-82M, este modelo es peor en CER pero mucho más pequeño y rápido en CPU. Frente a indic-parler-tts, iguala el CER con una fracción del tamaño. Frente a mms-tts-eng y MeloTTS-English, es claramente mejor en precisión con menos parámetros.

## Limitaciones y advertencias

- La model card declara 22,5 M de parámetros, pero los pesos en safetensors suman 8.932.873; conviene verificar cuál es el dato correcto antes de dimensionar recursos.
- Solo soporta inglés indio; no se documenta cobertura de otras variedades del inglés ni de otras lenguas.
- Solo lee script latino; no se documenta manejo de otros alfabetos.
- Solo dispone de dos voces fijas (femenina y masculina); no hay clonación de voz ni control de emoción o prosodia documentado.
- El CER de 1,08 % y 2,94 % procede de la evaluación del propio autor; no hay validación independiente en la información disponible.
- Riesgo de errores de pronunciación en nombres propios, siglas, números y palabras fuera del dominio de entrenamiento (noticias y corpus LIMMITS/SYSPIN).
- El dataset de entrenamiento se limita a voces del corpus LIMMITS/SYSPIN; puede heredar sesgos de acento, género y registro de dichas grabaciones.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y la licencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- No se documentan sesgos específicos ni evaluaciones de robustez ante texto ruidoso, abreviaturas o puntuación atípica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-english
- Colección INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset adicional: https://huggingface.co/datasets/iAkashPaul/limmits-2024
- Benchmark FLORES-200 (imagen): https://huggingface.co/sulabhkatiyar/indic-tiny-tts-english/resolve/main/assets/bench_flores.png
- Benchmark frases retenidas (imagen): https://huggingface.co/sulabhkatiyar/indic-tiny-tts-english/resolve/main/assets/bench_rasa.png
- Benchmark modelos mayores (imagen): https://huggingface.co/sulabhkatiyar/indic-tiny-tts-english/resolve/main/assets/bench_big.png
- Modelo comparable Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo comparable indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo comparable MeloTTS-English: https://huggingface.co/myshell-ai/MeloTTS-English
- Modelo comparable XTTS-v2: https://huggingface.co/coqui/XTTS-v2
- Modelo comparable mms-tts-eng: https://huggingface.co/facebook/mms-tts-eng
- Repositorio Indic-TTS de AI4Bharat: https://github.com/AI4Bharat/Indic-TTS
