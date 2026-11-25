# swedishembedded/sten-tts

## Resumen

Sten-TTS-1.7B es un modelo de síntesis de voz (text-to-speech) especializado en sueco, desarrollado por Martin Schröder en Swedish Embedded AB. Se trata de un fine-tune del modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base al que se le añade el sueco como idioma de síntesis, manteniendo el inglés entrenado de forma paralela para preservar la pronunciación correcta de palabras y nombres ingleses dentro de frases suecas.

El modelo incorpora 12 voces con nombre propio (6 femeninas y 6 masculinas) procedentes de 6 regiones de Suecia, y genera audio a 24 kHz. Está pensado para equipos de producto, servicios públicos y fabricantes de dispositivos que necesitan salida de voz en sueco o nórdico sin enviar el texto de sus usuarios a un servicio en la nube, es decir, para despliegue privado o en dispositivo.

Su relevancia actual radica en que cubre un hueco poco atendido en el ecosistema TTS: la síntesis de alta calidad para una lengua minoritaria europea como el sueco, con licencia Apache-2.0, pesos en safetensors y compatibilidad directa con el paquete upstream `qwen-tts` sin conversión. El modelo tiene 1.916.676.352 parámetros y un repositorio de 8,4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (12 Hz), fine-tune de Qwen/Qwen3-TTS-12Hz-1.7B-Base |
| Parámetros totales | 1.916.676.352 (≈1,7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | sueco (sv), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del TTS Qwen3-TTS de 12 Hz y 1,7B de parámetros. La arquitectura subyacente es la del modelo base Qwen3-TTS, que no se detalla en la información disponible; el fine-tune añade el sueco como idioma de síntesis y conserva el inglés entrenado en paralelo para que las palabras y nombres en inglés dentro de una frase sueca mantengan su pronunciación inglesa.

El entrenamiento se realizó sobre 420 horas de habla (194.769 enunciados) en 32 minutos usando 11 GPUs. Los datos de entrenamiento están publicados como el dataset Sten-TTS Voice (swedishembedded/sten-tts-voice), con conjuntos de validación, fuentes y licencias. El modelo produce audio a 24 kHz y se carga en el paquete upstream `qwen-tts` (probado con la versión 0.1.1) sin conversión. No se detalla en la información disponible si hubo RLHF, DPO u otras etapas de alineación.

## Capacidades

- Síntesis de voz (text-to-speech) en sueco con 12 voces con nombre propio: Axel, Astrid, Erik, Linnea, Viktor, Elsa, Oskar, Maja, Nils, Signe, Arvid e Ingrid.
- 6 voces femeninas y 6 masculinas, procedentes de 6 regiones de Suecia (Dalarna, Suecia central, Estocolmo, Gotemburgo, sur occidental y Norrland).
- Generación de audio a 24 kHz.
- Síntesis bilingüe sueco-inglés: el inglés se entrena en paralelo para preservar la pronunciación de palabras y nombres ingleses dentro de frases suecas.
- Selección de voz mediante el parámetro `speaker` (Python) o `voice` (HTTP).
- Selección explícita de idioma mediante el parámetro `language`; es obligatorio enviar `"language": "swedish"` para que el texto se pronuncie en sueco.
- Compatibilidad con el paquete upstream `qwen-tts` sin conversión de pesos.
- Servicio HTTP mediante la API compatible con OpenAI (`/v1/audio/speech`) del servidor `brain`, con salida en formato wav.
- Ejecución en GPU (bfloat16) y en CPU (float32).

## Casos de uso

- Atención al cliente automatizada en sueco: el modelo puede generar respuestas habladas en sueco con una voz de marca concreta dentro de un pipeline de IVR o asistente telefónico, sin enviar el texto del usuario a la nube al desplegarse en servidores propios.
- Servicios públicos y administración: lectura en voz alta de resoluciones, avisos o información administrativa en sueco con voces regionales, útil para organismos que exigen que los datos no salgan de su infraestructura.
- Lectura de contenidos y accesibilidad: conversión de artículos, documentos o notificaciones a audio en sueco para usuarios con discapacidad visual o para consumo en movilidad, aprovechando las 12 voces disponibles para elegir el registro adecuado.
- Fabricantes de dispositivos y edge: integración de la síntesis en sueco en dispositivos locales (por ejemplo, electrodomésticos, kioscos o sistemas de navegación) que necesitan voz nórdica sin conectividad a servicios externos.
- Localización de productos y medios: doblaje o generación de pistas de audio en sueco para vídeos, cursos o aplicaciones, con voces masculinas y femeninas de distintas regiones para cubrir varios personajes o registros.
- Síntesis con mezcla sueco-inglés: lectura de textos suecos que contienen nombres de producto, marcas o términos técnicos en inglés, manteniendo la pronunciación inglesa de esas palabras gracias al entrenamiento paralelo en ambos idiomas.
- Adaptación de voz de marca: punto de partida para fine-tunes adicionales que añadan una voz corporativa, un dialecto o terminología de dominio, como ofrece el autor del modelo.

## Benchmarks y rendimiento

El autor publica una evaluación mediante la tasa de error de caracteres (CER) de un reconocedor de voz (Qwen/Qwen3-ASR-1.7B) transcribiendo frases de test de FLEURS sv_se no vistas en entrenamiento. Los resultados por voz son los siguientes:

| Voz | Género, región | CER |
|---|---|---|
| Axel | masculino, zona de Dalarna | 0,014 |
| Astrid | femenino, Suecia central | 0,072 |
| Erik | masculino, Suecia central | 0,000 |
| Linnea | femenino, zona de Estocolmo | 0,000 |
| Viktor | masculino, zona de Estocolmo | 0,029 |
| Elsa | femenino, zona de Gotemburgo | 0,000 |
| Oskar | masculino, zona de Gotemburgo | 0,014 |
| Maja | femenino, sur occidental | 0,216 |
| Nils | masculino, sur occidental | 0,000 |
| Signe | femenino, Norrland | 0,014 |
| Arvid | masculino, Norrland | 0,000 |
| Ingrid | femenino, zona de Dalarna | 0,007 |

El autor indica además un CER agregado de 0,064 en frases de test de FLEURS no vistas, frente a 0,102 del modelo base. No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, métricas de naturalidad subjetiva como MOS).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,7B parámetros en bfloat16 el peso de los pesos ronda los 3,8 GB, a lo que hay que sumar el coste de activaciones y del decodificador de audio.
- GPU recomendadas: no se especifican en la información disponible. El entrenamiento se realizó en 11 GPUs, pero no se detalla el modelo.
- Cabe en GPU de consumo: no confirmado en la información disponible; por el tamaño de parámetros es plausible en GPUs consumer con suficiente VRAM, pero el autor no lo confirma.
- Despliegue: paquete Python `qwen-tts` (con `soundfile`), o servidor `brain` con API compatible con OpenAI (`brain pull` y `brain serve --openai`).
- Ejecución en CPU: soportada cargando con `device_map="cpu"` y `dtype=torch.float32`.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (32 minutos en 11 GPUs), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Sten-TTS-1.7B | ≈1,7B | sv, en | Apache-2.0 | Fine-tune de Qwen3-TTS con 12 voces suecas y CER 0,064 en FLEURS sv_se |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ≈1,7B | no disponible en la información | no disponible en la información | Modelo base del que deriva Sten-TTS; CER 0,102 en FLEURS sv_se según el autor |
| Alternativas TTS multilingües de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- El modelo está especializado en sueco e inglés; no se documenta soporte para otras lenguas y el parámetro `language` debe fijarse explícitamente a `"swedish"` para evitar que el texto se pronuncie como inglés.
- La calidad es desigual entre voces: el CER por voz varía entre 0,000 y 0,216 (Maja es claramente la más débil en la evaluación publicada).
- La evaluación se basa en un único reconocedor ASR y en frases de FLEURS; no sustituye a una evaluación perceptiva (MOS) ni a pruebas con texto de dominio real.
- Riesgo de errores de pronunciación en nombres propios, siglas, números y terminología específica de dominio; el autor ofrece adaptación de pronunciación como servicio.
- No se documentan sesgos demográficos, acentos o variedades del sueco más allá de las 6 regiones cubiertas.
- No se detallan limitaciones de longitud de texto de entrada ni de contexto; conviene validar con textos largos antes de producción.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El modelo se publica con 0 descargas y 0 likes en el momento de la ficha, por lo que la validación por parte de la comunidad es todavía inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swedishembedded/sten-tts
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Dataset de entrenamiento (Sten-TTS Voice): https://huggingface.co/datasets/swedishembedded/sten-tts-voice
- Reconocedor usado en la evaluación (Qwen3-ASR-1.7B): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Paper referenciado en los tags (arXiv:2305.18802): https://arxiv.org/abs/2305.18802
- LinkedIn del autor, Martin Schröder: https://www.linkedin.com/in/martinschroder/
- Contacto: info@swedishembedded.com
