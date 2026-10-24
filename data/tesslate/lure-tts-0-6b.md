# Tesslate/Lure-TTS-0.6B

## Resumen

Lure 0.6B es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por Tesslate, publicado como *research preview* bajo licencia Apache 2.0. Su propuesta diferencial es el clonado de voz expresivo con un tamaño muy reducido: a partir de 3 a 12 segundos de audio de referencia más su transcripción, reproduce texto nuevo con esa misma voz, y permite insertar sonidos no verbales en línea —36 etiquetas entre paréntesis, como `(sigh)` o `(sharp inhale)`— que el modelo interpreta en lugar de leer, además de aceptar una nota de dirección libre en texto ("Hushed and shaking, close to tears.") que modula la interpretación de la frase.

El modelo se apoya en el formato de códec de Qwen3-TTS de 12 Hz: salida mono a 24 kHz, 16 codebooks y streaming, con un frame rate de 12,5 Hz (80 ms de audio por frame). El nombre comercial indica 0,6B de parámetros, aunque el recuento real de los safetensors publicados es de 914.643.008 parámetros (≈0,91B); el repo ocupa 2,5 GB. La model card reporta WER de 1,51 en Seed-TTS y UTMOS de 4,43 en LibriSpeech-PC, valores que sitúan al modelo por delante de alternativas de 1,5B a 35B en naturalidad según sus propias mediciones.

La relevancia práctica está en el coste de inferencia: con un motor optimizado (lure-tts) alcanza RTF de 0,23 en una H100 y 2,3x tiempo real en una GPU de 24 GB con un solo stream, escalando a 17x tiempo real con 8 streams concurrentes. Existe una variante, Lure Turbo, con una cabeza de decodificación que predice los 15 códigos finos de cada frame en 3 pasadas en vez de 15, reduciendo el coste de decodificación por frame unas 3,4 veces (RTF 0,14 en H100). Es, por tanto, una opción a considerar cuando se necesita clonado de voz expresivo y despliegue económico, no cuando se requiere cobertura multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para TTS basado en Qwen3-TTS (tag `qwen3_tts`), con códec neuronal de 12 Hz y 16 codebooks; variante con cabeza de decodificación rápida (Lure Turbo) |
| Parametros totales | 914.643.008 según safetensors (la model card indica 0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. No es un modelo de contexto textual: la referencia de clonado es de 3 a 12 s de audio más su transcripción |
| Tipos de cuantizacion | No disponible. La model card solo documenta ejecución en bf16; no se publican pesos GGUF ni cuantizaciones oficiales |
| Idiomas soportados | Inglés únicamente (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,5 GB) |
| Frecuencia de muestreo de salida | 24 kHz mono, streaming |
| Códec | 12,5 Hz, 16 codebooks, formato Qwen3-TTS 12Hz |
| Etiquetas de sonido inline | 36 soportadas, entre paréntesis |
| Control de estilo | Nota de dirección (*acting note*) en texto libre, opcional |

## Arquitectura y entrenamiento

Lure sigue la arquitectura de Qwen3-TTS: un modelo generador de tokens de audio sobre un códec de 12,5 Hz con 16 codebooks, del que hereda el formato de pesos hasta el punto de que el paquete `qwen-tts` de PyTorch puede cargarlo directamente (sin la cabeza Turbo). La generación es autorregresiva a nivel de frame y emite PCM float32 a 24 kHz en chunks, lo que habilita streaming de baja latencia. La cabeza de decodificación de Lure Turbo agrupa la predicción de los 15 códigos finos de cada frame en 3 pasadas en lugar de 15, con una reducción aproximada de 3,4x en el coste por frame y sin degradación apreciable en los benchmarks reportados (WER 1,59 frente a 1,51; SIM 0,654 frente a 0,653).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se especifican innovaciones de atención o decodificación especulativa más allá del esquema de predicción por pasadas de Turbo. La model card sí indica que el modelo se ha evaluado con los scripts oficiales de cada benchmark, una única toma por línea y muestreo por defecto, y que el clonado es zero-shot con referencia de 3 a 12 s y su transcripción.

## Capacidades

- Síntesis de voz en inglés a 24 kHz mono con salida en streaming (chunks float32).
- Clonado de voz zero-shot a partir de 3 a 12 s de audio de referencia más la transcripción de ese clip.
- Interpretación de 36 sonidos no verbales escritos inline entre paréntesis, ejecutados en el punto indicado en lugar de leerse.
- Control de interpretación mediante nota de dirección en texto libre (emociones, ritmo, intensidad, susurros, quiebres de voz).
- Expresividad emocional medida: 73,3 % en el benchmark de emoción CV3.
- Decodificación acelerada opcional mediante Lure Turbo (misma voz, cabeza de decodificación más rápida).
- Servidor compatible con la API de OpenAI (`POST /v1/audio/speech`) que agrupa peticiones concurrentes en lotes.
- No soporta tool calling ni function calling, ni razonamiento multi-paso, ni visión, ni audio de entrada como comprensión: es un modelo puramente TTS.
- No dispone de modo *thinking* ni de capacidades multilingües: solo inglés.

## Casos de uso

- **Audiolibros y narrativa**: clonar la voz de un narrador con 10 s de muestra y dirigir cada línea con notas de interpretación para alternar pasajes susurrados, tensos o irónicos, insertando `(sigh)` o `(sharp inhale)` donde el texto lo requiera. El RTF de 0,23 en H100 permite procesar un audiolibro de 10 horas en unas 2,3 horas de GPU.
- **Doblaje y localización de contenido**: dado que el modelo es solo inglés, encaja en flujos de generación de locución inglesa a partir de guiones, con clonado de la voz del talento original para mantener consistencia entre episodios y sin necesidad de regrabar.
- **Atención al cliente con voz de marca**: desplegar `lure serve` como endpoint compatible con OpenAI y servir 8 voces concurrentes en una sola GPU de 24 GB (219 frames/s, 17x tiempo real) para respuestas de IVR o asistentes telefónicos en inglés.
- **Prototipado de videojuegos**: generar cientos de líneas de diálogo con variantes emocionales por personaje usando el mismo clip de referencia, aprovechando el control por nota de dirección para no tener que actuar cada toma manualmente.
- **Accesibilidad y lectura de pantalla**: clonar la voz del propio usuario para un lector de pantalla personal, con 3 a 12 s de muestra y ejecución en un MacBook con backend MLX por encima de tiempo real.
- **Previsualización rápida de guiones**: integrar el modelo en un editor de guiones para escuchar una escena con sonidos y dirección antes de contratar actores de voz; el streaming permite empezar a reproducir antes de terminar la generación.
- **Generación de datasets de voz sintética**: producir pares texto-audio expresivos etiquetados (emoción, sonidos no verbales) para entrenar otros sistemas, dado que la licencia Apache 2.0 permite uso comercial y derivados.

## Benchmarks y rendimiento

Resultados reportados por el autor, ejecutados con los scripts oficiales de cada benchmark, una toma por línea y muestreo por defecto. Las filas de otros modelos son cifras publicadas por sus respectivos desarrolladores.

| Modelo | Tamano | Seed-TTS WER ↓ | Seed-TTS SIM ↑ | LibriSpeech-PC SIM ↑ | LibriSpeech-PC UTMOS ↑ | VDB SIM ↑ | CV3 emocion % ↑ | RTF ↓ |
|---|---|---|---|---|---|---|---|---|
| Lure | 0,6B | 1,51 | 0,653 | 0,638 | **4,43** | **0,81** | 73,3 | 0,230 |
| Lure Turbo | 0,6B | 1,59 | 0,654 | 0,641 | 4,38 | **0,81** | 73,3 | 0,140 |
| Fish S2 Pro | 5B | **0,99** | – | – | – | – | – | 0,195 |
| Qwen3-TTS 0.6B | 0,6B | 1,32 | – | – | – | – | – | – |
| Fish Drama 3 | 35B MoE | 1,54 | 0,640 | 0,605 | 4,31 | – | – | **0,131** |
| Ming 3.0 0.5B | ~1B | 1,58 | 0,691 | – | – | – | – | – |
| FireRedTTS3 | 1,7B+ | 1,64 | **0,772** | – | – | – | – | – |
| VoxCPM2 | 2B | 1,84 | 0,753 | – | – | 0,70 | – | – |
| F5-TTS | – | 2,00 | 0,670 | – | – | – | 64,7 | – |
| CosyVoice3 | – | 2,22 | 0,720 | 0,694 | 4,28 | – | – | – |
| OmniVoice | 0,6B | – | – | **0,729** | 4,28 | – | – | – |
| Qwen3-TTS | 0,6B–1,7B | – | – | 0,704 | 4,41 | – | – | – |
| Grabaciones reales | – | – | – | – | 4,10 | – | – | – |
| CosyVoice3 1.5B + DiffRO-EMO | 1,5B | – | – | – | – | – | **77,7** | – |
| Higgs TTS 3 | 4B | – | – | – | – | – | – | 0,147 |

Latencia y throughput del motor lure-tts (backend CUDA, bf16):

| GPU | Modelo | Streams | ms por frame | RTF |
|---|---|---|---|---|
| H100 | Lure | 1 | 18,4 | 0,23 |
| H100 | Lure | 8 | 19,6 | 0,25 |
| H100 | Lure Turbo | 1 | 11,4 | 0,14 |
| H100 | Lure Turbo | 8 | 12,4 | 0,15 |
| GPU 24 GB | Lure | 1 | 28,8 frames/s (2,3x tiempo real) | – |
| GPU 24 GB | Lure | 8 | 219 frames/s (17x tiempo real) | – |
| GPU 24 GB | Lure Turbo | 1 | 50,6 frames/s (4,0x tiempo real) | – |
| GPU 24 GB | Lure Turbo | 8 | 374 frames/s (30x tiempo real) | – |

## Requisitos de hardware

- **Peso de los pesos**: 914.643.008 parámetros en bf16 equivalen a unos 1,83 GB, más códec y overhead; el repo completo ocupa 2,5 GB (estimación a partir del recuento de parámetros, no publicada).
- **GPU de 24 GB**: configuración de referencia de la model card; sirve 8 streams simultáneos con Lure (219 frames/s, 17x tiempo real) y con Turbo (374 frames/s, 30x tiempo real). Una RTX 4090 (24 GB) o A10G/L4 de 24 GB entran en esta categoría.
- **H100 / A100**: RTF de 0,23 con un stream y 0,25 con ocho (Lure); 0,14 y 0,15 con Turbo. Con un solo stream el modelo deja la mayor parte de la VRAM libre, por lo que el cuello de botella es de cómputo, no de memoria.
- **GPU de consumo**: cabe con holgura en tarjetas de 8-12 GB para un único stream, dado el tamaño de pesos; no se publican cifras medidas para esas tarjetas.
- **Apple Silicon**: el motor lure-tts incluye backend MLX y, según el autor, corre por encima de tiempo real en un MacBook.
- **CPU**: existe build C++ del motor lure-tts para ejecución en CPU; sin cifras de rendimiento publicadas.
- **Opciones de despliegue**: motor `lure-tts` (MLX, CUDA, CPU, build C++), paquete `qwen-tts` en PyTorch (sin cabeza Turbo), y servidor compatible con OpenAI vía `lure serve` con `POST /v1/audio/speech` y batching de peticiones concurrentes. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Seed-TTS WER ↓ | Seed-TTS SIM ↑ | UTMOS ↑ | RTF ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Lure | 0,6B (914M reales) | 1,51 | 0,653 | 4,43 | 0,230 | Apache 2.0 | HuggingFace, pesos safetensors |
| Lure Turbo | 0,6B | 1,59 | 0,654 | 4,38 | 0,140 | Apache 2.0 | HuggingFace |
| Qwen3-TTS 0.6B | 0,6B | 1,32 | – | – | – | no disponible | no disponible |
| Fish S2 Pro | 5B | 0,99 | – | – | 0,195 | no disponible | no disponible |
| Fish Drama 3 | 35B MoE | 1,54 | 0,640 | 4,31 | 0,131 | no disponible | no disponible |
| FireRedTTS3 | 1,7B+ | 1,64 | 0,772 | – | – | no disponible | no disponible |
| F5-TTS | no disponible | 2,00 | 0,670 | – | – | no disponible | no disponible |
| CosyVoice3 | no disponible | 2,22 | 0,720 | 4,28 | – | no disponible | no disponible |

Lectura comparativa: Lure no lidera en precisión de palabras (Fish S2 Pro, con 5B, baja a 0,99 de WER; Qwen3-TTS 0.6B, a 1,32) ni en similitud de hablante (FireRedTTS3 llega a 0,772 y dots.tts a 0,770, frente a 0,653). Su ventaja está en naturalidad percibida (UTMOS 4,43, el más alto de la tabla) y en el coste por unidad de audio: es el único de la comparativa con licencia Apache 2.0 explícitamente confirmada en la información disponible, y compite en RTF con modelos 6 a 60 veces mayores.

## Limitaciones y advertencias

- **Solo inglés**: no hay soporte multilingüe; cualquier uso en castellano u otros idiomas queda fuera de las capacidades declaradas.
- **Research preview**: el autor advierte que pesos, comportamiento y model card pueden cambiar entre releases; recomienda fijar una revisión concreta para producción.
- **Precisión de palabras mejorable**: WER de 1,51 en Seed-TTS, por detrás de Fish S2 Pro (0,99), Qwen3-TTS 0.6B (1,32) y Fish Drama 3 (1,54 está en el mismo orden). En textos con nombres propios, siglas o dominios técnicos es esperable un incremento de errores de pronunciación.
- **Similitud de hablante moderada**: SIM de 0,653 en Seed-TTS, por debajo de FireRedTTS3 (0,772), dots.tts (0,770), Ming 3.0 0.5B (0,691) y Ming Tiny (0,728). En clonado de voces muy características puede no capturar todos los rasgos.
- **UTMOS por encima de grabaciones reales**: el 4,43 frente al 4,10 de grabaciones reales sugiere saturación de la métrica; conviene validar la naturalidad con escucha humana y no tomar el dato como indicador absoluto.
- **Riesgo de artefactos**: como todo TTS autorregresivo, puede producir saltos de palabras, repeticiones, respiraciones mal colocadas o sonidos no verbales fuera de lugar cuando la nota de dirección contradice al texto. No hay datos publicados sobre tasa de fallo por generación.
- **Sin cifras de sesgo**: no se documentan sesgos por acento, género o edad en la voz de referencia; el modelo reproduce la voz clonada, por lo que hereda sus características sin control explícito.
- **Clonado de voz y derechos**: la licencia Apache 2.0 permite uso comercial del software y los pesos, pero clonar la voz de una persona requiere su consentimiento explícito y puede vulnerar derechos de imagen o voz según jurisdicción. La licencia no cubre esos derechos.
- **Ecosistema limitado**: 0 descargas y 1 like en el momento de la consulta, creado en octubre de 2026; sin validación independiente de los benchmarks, que son autopublicados y parcialmente comparados con cifras de terceros no reproducidas.
- **Sin cuantizaciones ni integración estándar**: no hay GGUF ni soporte en vLLM/TGI/Ollama, lo que complica el despliegue fuera del motor propio o de `qwen-tts`.
- **Discrepancia de tamaño**: el nombre indica 0,6B pero los safetensors suman 914M; conviene dimensionar VRAM y throughput con la cifra real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tesslate/Lure-TTS-0.6B
- Variante rápida Lure Turbo: https://huggingface.co/Tesslate/Lure-TTS-Turbo
- Motor de inferencia (GitHub): https://github.com/smirki/lure-tts
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (solo contenido de foros sin relación); no se han podido verificar papers, blogs ni demos adicionales.
