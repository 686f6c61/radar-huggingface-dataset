# StableDiffusionVN/lazibook

## Resumen

LaziBook es un repositorio de pesos publicado por el usuario StableDiffusionVN que agrupa los ficheros de modelo utilizados por la aplicacion homonima LaziBook, un lector de e-books y reproductor de audiolibros con funcionamiento totalmente offline para iOS, macOS y Android. No se trata de un unico modelo entrenado de forma original, sino de una coleccion de componentes de sintesis de voz (TTS), tokenizacion de audio, conversion grafema-fonema (G2P), clonacion de voz y traduccion, empaquetados en formatos ONNX, Core ML, safetensors y GGUF para su ejecucion en dispositivo.

El nucleo del sistema son los modelos VieNeu-TTS v3 en sus variantes Turbo y Nano, de los cuales el repositorio incluye pesos cuantizados (capas MLP del backbone en 4 bits y el resto en 8 bits en la variante Turbo; codificador de texto y decodificador de codec en int8 en la variante Nano). A estos se suman el tokenizador de audio MOSS Audio Tokenizer Nano en ONNX, el motor G2P vietnamita sea-g2p, el modelo ingles Phonon 31M en Core ML con paletizacion de 4 bits y 38 voces predefinidas, y dos motores TTS adicionales para chino (VITS Chinese via sherpa-onnx y Matcha-TTS zh-en con vocoder Vocos a 16 kHz).

La relevancia del repositorio reside en su enfoque de despliegue en dispositivo: todos los componentes estan preparados para inferencia local sin conexion, con cuantizaciones agresivas y formatos nativos de las plataformas objetivo. El conteo de parametros reportado en safetensors (1.791.080.448) corresponde al conjunto agregado de pesos del repositorio, no a un unico transformer. Los idiomas declarados son vietnamita, chino e ingles, y la licencia es mixta, manteniendo cada subcarpeta la licencia de su modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (coleccion de componentes TTS, codec de audio, G2P y traduccion; VieNeu-TTS v3 Turbo/Nano, MOSS Audio Tokenizer Nano, Phonon 31M, VITS, Matcha-TTS + Vocos) |
| Parametros totales | 1.791.080.448 (agregado del repositorio en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (capas MLP del backbone Turbo, Phonon paletizado 4-bit, Hy-MT2 1.25-bit), 8 bits (resto del backbone Turbo), int8 (decodificador de codec Nano) |
| Idiomas soportados | vietnamita (vi), chino (zh), ingles (en) |
| Licencia | Mixta (mixed); cada subcarpeta conserva la licencia de su modelo de origen: Apache-2.0, MIT y "see source" |
| Formato de pesos | safetensors, ONNX, Core ML (`.mlmodelc` precompilado), GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta un proceso de entrenamiento propio ni una arquitectura unica. Se compone de artefactos de inferencia derivados de modelos de terceros. La variante VieNeu-TTS v3 Turbo emplea un backbone con capas MLP cuantizadas a 4 bits (capas 1 a 10) y el resto a 8 bits, mientras que la variante Nano incluye codificador de texto, decodificador de codec en int8 y voces; segun la model card, el estimador y el predictor de duracion son pesos entrenados por LaziBook y se mantienen en un repositorio privado. El modulo de clonacion de voz reutiliza los codificadores de Nano (codec, referencia, hablante y denoiser).

El resto de componentes cubre etapas especificas del pipeline: MOSS Audio Tokenizer Nano en ONNX para tokenizacion de audio, sea-g2p para conversion grafema-fonema en vietnamita, Phonon 31M para ingles compilado a Core ML con paletizacion de 4 bits y 38 voces, VITS Chinese (variante `vits-zh-ll` de sherpa-onnx) y Matcha-TTS zh-en con vocoder Vocos a 16 kHz. Como descargas opcionales se incluyen Ming-3.0-tts-0.5B en 4 bits para el paquete de voz chino/ingles en la app de Mac y Hy-MT2 1.8B en GGUF de 1.25 bits para traduccion offline. No se especifican volumenes de datos de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Sintesis de voz (text-to-speech) offline en vietnamita, chino e ingles mediante multiples motores especializados por idioma.
- Clonacion de voz a partir de audio de referencia, usando los codificadores de Nano (codec, referencia, hablante y denoiser).
- Conversion grafema-fonema (G2P) para vietnamita mediante sea-g2p.
- Tokenizacion y decodificacion de audio con MOSS Audio Tokenizer Nano en formato ONNX.
- Traduccion automatica offline con Hy-MT2 1.8B cuantizado a 1.25 bits en GGUF.
- Reproduccion de audiolibros y lectura de e-books con voces integradas en la aplicacion (38 voces inglesas de Phonon, voces vietnamitas de VieNeu-TTS, voces chinas de VITS y Matcha-TTS).
- Ejecucion en dispositivo en iOS, macOS y Android con formatos nativos (Core ML, ONNX) y pesos cuantizados.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni vision.

## Casos de uso

- Lectura de e-books en voz alta sin conexion: la aplicacion integra los motores TTS por idioma y reproduce el texto del libro con voces locales, sin enviar contenido a servidores externos.
- Audiolibros en vietnamita: VieNeu-TTS v3 Turbo y Nano generan voz en vietnamita con el modulo G2P sea-g2p resolviendo la conversion de texto a fonemas antes de la sintesis.
- Audiolibros en chino e ingles: VITS Chinese y Matcha-TTS zh-en cubren el chino, mientras que Phonon 31M aporta 38 voces en ingles compiladas a Core ML para la app de Mac y movil.
- Clonacion de voz para narracion personalizada: los codificadores de `app/clone/` permiten registrar una muestra de voz del usuario y reutilizarla como referencia en la sintesis, util para contenido educativo o narraciones propias.
- Traduccion offline de contenido: Hy-MT2 1.8B en GGUF de 1.25 bits permite traducir fragmentos de texto entre idiomas en el dispositivo, sin depender de APIs en la nube.
- Distribucion de paquetes de voz bajo demanda: la estructura de carpetas (`app/`, `ming-3.0-tts-0.5B-4bit/`, `mt/`) permite descargar solo los paquetes de voz o traduccion necesarios, reduciendo el tamano de la instalacion base.
- Integracion en aplicaciones de lectura de terceros: los ficheros ONNX y Core ML pueden reutilizarse en otros clientes que necesiten TTS en dispositivo para los tres idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; el repositorio pesa 1,9 GB en total y los componentes individuales (Phonon 31M, VieNeu-TTS v3 Nano, MOSS Audio Tokenizer Nano) estan disenados para ejecucion en dispositivo, no en GPU de servidor.
- GPU recomendadas: no aplica para el caso de uso previsto (inferencia en CPU/NPU de movil y Mac); no se documentan requisitos para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no documentada; el diseno apunta a ejecucion en dispositivo (Core ML en Apple Silicon y Neural Engine, ONNX Runtime en Android).
- Opciones de despliegue: Core ML (`.mlmodelc` precompilado para Phonon), ONNX Runtime (MOSS Audio Tokenizer Nano), GGUF (Hy-MT2 1.8B, compatible con llama.cpp), y los formatos nativos de cada motor TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LaziBook (este repositorio) | 1.791.080.448 agregados | No disponible | vi, zh, en | Mixta | safetensors, ONNX, Core ML, GGUF |
| VieNeu-TTS v3 Turbo (origen) | No disponible | No disponible | vi | Apache-2.0 | No disponible |
| VieNeu-TTS v3 Nano (origen) | No disponible | No disponible | vi | Apache-2.0 | No disponible |
| Phonon 31M English (origen) | 31M | No disponible | en | Apache-2.0 | Core ML |
| Ming-3.0-tts-0.5B (origen) | 0.5B | No disponible | zh, en | MIT | safetensors (4-bit en este repo) |
| Hy-MT2 1.8B (origen) | 1.8B | No disponible | No disponible | Apache-2.0 | GGUF (1.25-bit en este repo) |

La comparativa directa con alternativas de la misma categoria (suites TTS en dispositivo) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo unico: el conteo de parametros agregado no representa un transformer con contexto y capacidades uniformes, por lo que no debe compararse directamente con LLMs o modelos TTS monoliticos.
- La licencia es mixta y cada subcarpeta conserva la de su origen; es imprescindible revisar `LICENSE.md` y las licencias individuales (Apache-2.0, MIT, "see source") antes de uso comercial.
- Algunos componentes (estimador y predictor de duracion de VieNeu-TTS v3 Nano) son pesos propios de LaziBook y no estan incluidos en el repositorio publico, lo que impide reproducir el pipeline completo solo con estos ficheros.
- Cobertura linguistica limitada a vietnamita, chino e ingles; no se documenta soporte de castellano ni de otras lenguas.
- Riesgo de alucinacion y artefactos de sintesis inherente a los modelos TTS, especialmente con cuantizaciones agresivas (4 bits en capas MLP, 1.25 bits en Hy-MT2) y textos fuera de dominio.
- No se documentan sesgos conocidos ni evaluaciones de calidad de voz, naturalidad o inteligibilidad.
- No hay informacion sobre contexto maximo, latencia ni throughput, lo que dificulta planificar despliegues en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/StableDiffusionVN/lazibook
- VieNeu-TTS v3 Turbo: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- VieNeu-TTS v3 Nano: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Nano
- sea-g2p (G2P vietnamita): https://github.com/pnnbao97/sea-g2p
- Phonon 31M English: https://huggingface.co/gradium/phonon-31m-en
- Phonon voices: https://huggingface.co/gradium/phonon-voices
- sherpa-onnx (VITS Chinese, Matcha-TTS): https://github.com/k2-fsa/sherpa-onnx
- Matcha-TTS zh-en (ModelScope): https://modelscope.cn/models/dengcunqin/matcha_tts_zh_en_20251010
- Ming-3.0-tts-0.5B-4bit: https://huggingface.co/jorgepb96/Ming-3.0-tts-0.5B-4bit
- Ming-3.0-tts-0.5B (origen): https://huggingface.co/inclusionAI/Ming-3.0-tts-0.5B
- Hy-MT2-1.8B-1.25Bit-GGUF: https://huggingface.co/tencent/Hy-MT2-1.8B-1.25Bit-GGUF
