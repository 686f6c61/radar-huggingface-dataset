# toddkrabach/Kokoro-82M-CoreML

## Resumen

Kokoro-82M-CoreML es una conversión a Core ML del modelo de text-to-speech Kokoro-82M, desarrollada por toddkrabach. Se trata de un sistema de síntesis de voz on-device pensado para Apple Silicon, que genera audio a 24 kHz a partir de texto en inglés. El modelo se distribuye en dos paquetes Core ML — KokoroProsody y KokoroAcoustic — para soportar longitudes de entrada variables sin padding, con un límite de 512 fonemas. Incluye además un phonemizer G2P y un fichero con 54 voces. Es relevante porque permite síntesis de voz rápida y local en macOS/iOS, con una latencia total de 47 ms en un Apple M4 Pro, y devuelve la duración de cada fonema, lo que facilita una sincronización precisa de palabras o fonemas.

El modelo base, Kokoro-82M, tiene 82 millones de parámetros, licencia Apache-2.0 y una calidad comparable a modelos de TTS más grandes, según su documentación. Esta conversión directamente hereda esa licencia y no re-entrena ningún peso: solo convierte la arquitectura original a dos paquetes Core ML separados. La arquitectura resultante emplea un grafo pequeño de tipo BERT + LSTM para la predicción de duración y un módulo acústico para el renderizado de audio. El contexto operativo es de 512 fonemas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos Core ML: KokoroProsody (grafo BERT + LSTM) y KokoroAcoustic (generador de audio). Base: Kokoro-82M |
| Parametros totales | 82 millones (modelo base Kokoro-82M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 fonemas |
| Tipos de cuantizacion | FP16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlpackage) |

## Arquitectura y entrenamiento

La conversión se divide en dos paquetes Core ML separados para resolver la limitación de Core ML con shapes dinámicas. KokoroProsody recibe tokens de fonemas y un vector de estilo, y predice la prosodia, los embeddings de texto y la duración de cada fonema. KokoroAcoustic toma esas salidas, tras un paso intermedio de gather que ejecuta el llamante, y genera la forma de onda. La división se realiza en el punto exacto donde cada shape depende de un valor calculado por el modelo, y el paso intermedio es un índice de gather que solo requiere aritmética.

No se han publicado los datos de entrenamiento de la conversión, ya que esta no re-entrena ningún peso. El modelo base Kokoro-82M se describe como de arquitectura ligera, pero la información disponible no detalla la composición del dataset ni procesos de RLHF o DPO, que no aplican a un modelo de TTS. Tampoco se mencionan innovaciones técnicas adicionales más allá de las entradas de longitud variable y el retorno de duraciones por fonema.

## Capacidades

- Síntesis de voz en inglés a 24 kHz, con salida en formato de audio FP16.
- Incluye 54 voces publicadas, cada una representada como un vector de estilo de 256 dimensiones. El fichero `Voices.bin` almacena 510 vectores por voz, uno por cada longitud de fonema posible.
- Soporta longitudes de entrada variables entre 3 y 512 fonemas, sin necesidad de padding a buckets fijos.
- Devuelve una duración en frames para cada fonema, permitiendo sincronización a nivel de palabra o fonema.
- Incluye un phonemizer G2P convertido a Core ML, para transcribir palabras que no están en el diccionario (aproximadamente el 1,5 % del texto normal, principalmente nombres propios y términos técnicos).
- Permite ajustar la velocidad de reproducción dividiendo la duración tras la inferencia, sin re-ejecutar el modelo.
- Proporciona información de temporización precisa, que `AVSpeechSynthesizer` no reporta.
- Puede ejecutarse en CPU o GPU de Apple Silicon, pero no en Neural Engine, debido a las formas variables.

## Casos de uso

- Accesibilidad en apps de lectura: generar la narración de un libro en voz alta en iPhone o iPad, aprovechando las duraciones por fonema para resaltar la palabra que se está leyendo.
- Audiolibros o podcasts generados localmente: producir narraciones en inglés con las 54 voces incluidas, sin conexión a internet y sin coste por API.
- Asistentes de voz on-device en macOS/iOS: responder con voz sintetizada en tiempo real, gracias a la baja latencia mediana de 47 ms para 3 segundos de audio en un Apple M4 Pro.
- Herramientas de traducción y aprendizaje de idiomas: generar ejemplos de pronunciación en inglés con estilo y velocidad configurables, ideal para aplicaciones de práctica oral.
- Edición de vídeo y postproducción: añadir narración a clips cortos, con control de duración por fonema para ajustar el audio a la línea temporal.
- Pruebas automatizadas de accesibilidad en aplicaciones Apple: integrar el modelo en pipelines de pruebas para verificar que la salida de audio de una interfaz es correcta y tiene una duración esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de TTS. La documentación ofrece métricas de fidelidad y velocidad:

| Métrica | Valor | Nota |
|---|---|---|
| Correlación espectral frente al PyTorch original | 0.977 | Magnitudes espectrales, en una frase de prueba. No es correlación de waveform. |
| Correlación entre dos ejecuciones de referencia | 0.998 | Debido al ruido aleatorio que añade el vocoder a la excitación no sonora. |
| Conversión con bug de módulo descrito en NOTICE | 0.801 | Produce audio de longitud y envolvente correctas, pero con menor fidelidad espectral. |
| Phonemizer: acierto exacto | 63 % | Sobre el mismo diccionario con el que se entrenó. |
| Phonemizer: error de fonema | 9 % | Coincide con el original PyTorch del que se convirtió. |
| Velocidad total en Apple M4 Pro, 3 s de audio | 47 ms (63× realtime) | Mediana de llamadas en caliente, cada etapa en su mejor unidad. |

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.3 GB y los paquetes `.mlpackage` suman aproximadamente 150 MB, más 28.2 MB de voces. En Apple Silicon se usa memoria unificada.
- GPU recomendada: Apple Silicon con macOS 15+ o iOS 18+. Las pruebas de rendimiento se realizaron en un Apple M4 Pro.
- Compatibilidad con GPU de consumo: no aplica, porque el modelo solo se distribuye en formato Core ML, exclusivo para Apple Silicon.
- Opciones de despliegue: aplicaciones nativas que usen Core ML. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: en M4 Pro, la etapa KokoroProsody tarda 5.8 ms en `.cpuOnly` y 32.3 ms en `.all`; KokoroAcoustic tarda 58.0 ms en `.cpuOnly` y 41.5 ms en `.all`. En total, 47 ms para generar 3 segundos de audio, a unas 63 veces la velocidad de reproducción.

## Comparativa con modelos similares

| Modelo | Entorno | Contexto | Parámetros | Licencia | Notas |
|---|---|---|---|---|---|
| hexgrad/Kokoro-82M | PyTorch / ONNX | 512 fonemas | 82 M | Apache-2.0 | Modelo base original de código abierto. Disponible en Hugging Face. |
| toddkrabach/Kokoro-82M-CoreML | Core ML | 512 fonemas | 82 M | Apache-2.0 | Conversión a dos paquetes Core ML con entradas de longitud variable y duraciones por fonema. |
| mattmireles/kokoro-coreml | Core ML | no disponible | no disponible | no disponible | Otra conversión a Core ML, con bucketed (padding a buckets fijos). Puede ser mejor en equipos con GPU más débil. |

## Limitaciones y advertencias

- El modelo solo soporta el idioma inglés (en). No está disponible para otros idiomas.
- Requiere macOS 15+ o iOS 18+ y Apple Silicon. No es ejecutable en GPUs CUDA ni en x86.
- No usa la Neural Engine de Apple, y algunos paquetes no se ejecutan si se excluye la GPU; las formas variables impiden la aceleración con NPU.
- El paso intermedio de gather debe implementarlo el llamante; el modelo no es end-to-end como un único grafo Core ML.
- El phonemizer G2P tiene un 9 % de error de fonemas y un 63 % de acierto exacto en el diccionario de entrenamiento, por lo que las palabras desconocidas pueden requerir revisión humana.
- No se han publicado evaluaciones exhaustivas de calidad en voz (como MOS) ni comparaciones sistemáticas con otros modelos TTS en la información suministrada.
- El paquete incluye voces redistribuidas desde kokoro-onnx; es necesario revisar el fichero NOTICE para verificar el cumplimiento de atribución.
- La tasa de muestreo de salida es de 24 kHz, lo cual puede ser insuficiente para ciertos usos que requieran mayor fidelidad de audio.
- No es un modelo de lenguaje y no dispone de capacidades de tool calling, razonamiento ni generación de texto.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/toddkrabach/Kokoro-82M-CoreML
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- GitHub de Kokoro: https://github.com/hexgrad/kokoro
- Phonemizer G2P usado: https://huggingface.co/PeterReid/graphemes_to_phonemes_en_us
- Conversión alternativa con buckets: https://huggingface.co/mattmireles/kokoro-coreml
- Repositorio kokoro-onnx (voces redistribuidas): https://github.com/thewh1teagle/kokoro-onnx
