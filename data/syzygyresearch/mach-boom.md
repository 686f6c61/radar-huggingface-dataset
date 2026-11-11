# SyzygyResearch/Mach-Boom

## Resumen

Mach Boom es una versión cuantizada a 3,5 bits por peso del modelo de síntesis de voz (text-to-speech) Phonon 31m en inglés de Gradium, publicada por SyzygyResearch. El resultado es un artefacto de 18,2 MB (19,5 MB contando el runtime completo) que sintetiza voz a 8-10 veces el tiempo real en un solo núcleo de CPU, lo que lo sitúa en la categoría de TTS totalmente on-device sin necesidad de GPU.

El modelo parte de una arquitectura de 31 millones de parámetros y se distribuye con un runtime propio en Python (`mach`) que compila kernels en el primer arranque y aprovecha instrucciones AVX-512 VBMI, AVX-512, AVX2 y AMX en procesadores Xeon de cuarta generación o posteriores. Incluye cuatro voces predefinidas (Zoey, Juniper, Everly, Harper) y es compatible con cualquier voz del repositorio `gradium/phonon-voices`.

Su relevancia actual radica en la combinación de tamaño mínimo, latencia de primer audio de 61-78 ms en streaming y una tasa de error de palabra del 5,18% en el conjunto Gradium TTS Hard Cases, que supera a modelos mucho mayores como Fish Audio Drama 3 (41,5 GB) o Qwen3-TTS 1.7B (4,52 GB) en esa misma prueba. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Phonon 31m de Gradium; runtime propio `mach` con kernels AVX-512/AVX2/AMX) |
| Parametros totales | 31 millones (modelo base); cuantizado a 3,5 bits por peso |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3,5 bits por peso (formato propietario `.bin`); el modelo base admite fp32 y q4k GGUF |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.bin` propietario (18,2 MB), tokenizer en `tokenizer.json`, voces en `voices/` |
| Frecuencia de muestreo | 24 kHz, salida float32 o PCM S16_LE |
| Plataforma | Linux x86-64, Python 3.8+, numpy, tokenizers, gcc o clang |
| Voces incluidas | Zoey, Juniper, Everly, Harper (compatibles con `gradium/phonon-voices`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Phonon 31m de Gradium en la documentación proporcionada. Mach Boom es un proceso de cuantización post-entrenamiento a 3,5 bits por peso sobre ese modelo, no un reentrenamiento: el autor indica que es "Gradium's Phonon 31m English text-to-speech model at 3.5 bits per weight". Por tanto, los datos de entrenamiento, la composición del dataset y si hubo RLHF o DPO corresponden al modelo base y no se detallan en la información disponible.

La innovación técnica destacable está en el runtime: `mach` compila kernels específicos para la CPU en el primer arranque (unos 5 segundos) cubriendo AVX-512 VBMI, AVX-512, AVX2 y C plano. En Xeons con AMX (cuarta generación en adelante) el decodificador de audio se ejecuta como tiles bf16, desactivable con `PHM_AMX=0`. El runtime soporta síntesis en streaming con `synth_stream(..., first=2)` y garantiza reproducibilidad: la misma semilla y el mismo `--chunk` producen el mismo audio independientemente del número de hilos.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano, con salida a 24 kHz en float32 o PCM.
- Manejo robusto de texto no trivial: números, fechas, horas, importes monetarios, unidades, códigos y abreviaturas (el conjunto de evaluación está diseñado precisamente con estos casos).
- Síntesis en streaming con latencia de primer audio de 61-78 ms en un núcleo (mediana de 5 ejecuciones con `--first 2` y voz cacheada).
- Cuatro voces predefinidas (Zoey, Juniper, Everly, Harper) y compatibilidad con cualquier voz de `gradium/phonon-voices`.
- Reproducibilidad determinista por semilla e independiente del número de hilos.
- Ejecución multi-hilo (`--threads 4`) con escalado de 8,3-8,4x a 11,3-11,7x tiempo real.
- No se menciona soporte de tool calling, agentes, visión, audio de entrada ni modo thinking; es exclusivamente TTS.

## Casos de uso

- **Atención al cliente automatizada por voz**: el modelo lee referencias de reserva, horarios y direcciones con una tasa de error de palabra del 5,18% en frases con números, fechas y códigos, lo que reduce las lecturas erróneas de datos críticos en sistemas IVR.
- **Lectura de confirmaciones y notificaciones transaccionales**: pedidos, citas médicas, billetes o alertas bancarias donde abundan importes, fechas y códigos; el modelo está evaluado específicamente en ese tipo de texto y cabe en 93 MB de memoria pico en un núcleo.
- **Asistentes de voz on-device en dispositivos embebidos**: al requerir solo CPU x86-64 Linux y 18,2 MB de pesos, puede desplegarse en mini-PC, thin clients o servidores sin GPU para interfaces de voz locales con baja latencia de primer audio (61-78 ms).
- **Accesibilidad y lectura de pantalla**: integración en lectores de pantalla o herramientas de accesibilidad que necesitan sintetizar texto largo en tiempo real (8-10x) sin consumir GPU ni depender de servicios en la nube.
- **Generación de audio por lotes para contenido**: producción de narraciones o avisos pregrabados en pipelines de CI/CD o scripts, beneficiándose de la reproducibilidad determinista por semilla para que el mismo texto genere siempre el mismo audio.
- **Prototipado y pruebas de sistemas conversacionales**: sustituir servicios TTS de pago en entornos de desarrollo y tests automatizados gracias a su licencia Apache-2.0, su instalación ligera (`pip install numpy tokenizers`) y su ejecución en un solo núcleo.
- **Sistemas de anuncios y megafonía en tiempo real**: streaming PCM por tubería (`--pcm --first 2 | aplay`) para avisos dinámicos en estaciones, aeropuertos o comercios con hardware modesto.

## Benchmarks y rendimiento

Tasa de error de palabra (WER) sobre las 250 frases inglesas reservadas del conjunto Gradium TTS Hard Cases, transcritas con faster-whisper large-v3-turbo (int8, greedy, CPU):

| Modelo | Descarga | WER | WER sin reglas de texto |
|---|---:|---:|---:|
| **Mach Boom** | **19,5 MB** | **5,18%** | 14,01% |
| Underdog Woof, Juno | 40,6 MB | 6,50% | 41,27% |
| Underdog Woof, Mira | 40,6 MB | 7,12% | No disponible |
| Fish Audio Drama 3 | 41,5 GB | 7,62% | 7,62% |
| Phonon 31m, tal cual (fp32) | 103,4 MB | 8,61% | 11,99% |
| Phonon 31m, 4-bit (q4k GGUF) | 55,6 MB | 10,61% | 13,91% |
| Kokoro 82M | 327,7 MB | 14,07% | No disponible |
| Qwen3-TTS 1.7B CustomVoice | 4,52 GB | 16,77% | 16,77% |
| Pocket TTS | 225,5 MB | 18,13% | 18,13% |
| Kitten Nano 0.8 | 27,6 MB | 18,56% | 19,94% |
| Supertonic 3 | 398,7 MB | 22,92% | 22,92% |
| LFM3-Audio-2B | 4,17 GB | 35,59% | 35,59% |

Velocidad y memoria (VM Intel Xeon Emerald Rapids de 4 núcleos con AMX, mismas 9 frases, dos rondas alternas):

| Métrica | Mach Boom | Underdog Woof (int8) |
|---|---:|---:|
| Velocidad, 1 núcleo | 8,3-8,4x tiempo real | 4,1-4,2x |
| Velocidad, 4 núcleos | 11,3-11,7x | 8,6-8,9x |
| Velocidad, 1 núcleo, solo AVX2 | 4,2-4,3x | 3,9-4,3x |
| Memoria pico, 1 núcleo | 93 MB | 255 MB |
| Primer audio, streaming, 1 núcleo | 61-78 ms | tras el clip completo |

En un Xeon Granite Rapids de 4 núcleos, Mach Boom alcanza 9,6-10,1x tiempo real en un núcleo y 19,5-19,8x en cuatro, frente a 3,8-4,3x y 9,3-9,6x de Woof.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño de descarga | WER (Hard Cases) | Licencia | Plataforma |
|---|---|---:|---:|---|---|
| Mach Boom | 31M (3,5 bits) | 19,5 MB | 5,18% | Apache-2.0 | CPU x86-64 Linux |
| Underdog Woof (Juno/Mira) | No disponible | 40,6 MB | 6,50% / 7,12% | No disponible | No disponible |
| Phonon 31m (fp32 / q4k) | 31M | 103,4 MB / 55,6 MB | 8,61% / 10,61% | Apache-2.0 | No disponible |
| Kokoro 82M | 82M | 327,7 MB | 14,07% | No disponible | No disponible |
| Qwen3-TTS 1.7B CustomVoice | 1,7B | 4,52 GB | 16,77% | No disponible | No disponible |

Mach Boom es la variante más pequeña de la tabla y la de menor WER en el conjunto evaluado, con licencia permisiva y un runtime explícitamente orientado a CPU.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se ha validado para otros idiomas.
- Plataforma restringida: Linux sobre x86-64 exclusivamente, con Python 3.8+, numpy, tokenizers y compilador C (gcc o clang). No hay soporte documentado para macOS, Windows, ARM ni GPU.
- El primer arranque compila kernels para la CPU (unos 5 segundos), lo que añade latencia inicial en despliegues efímeros o contenedores sin caché.
- El rendimiento depende fuertemente del conjunto de instrucciones: sin AVX-512 ni AMX, la velocidad cae a 4,2-4,3x tiempo real en un núcleo.
- El formato de pesos es propietario (`.bin`), no safetensors ni GGUF, lo que limita su uso con runtimes estándar como vLLM, llama.cpp u Ollama.
- No se han publicado datos sobre sesgos del modelo base, riesgo de alucinación en la síntesis ni comportamiento con texto ambiguo más allá del conjunto de evaluación.
- Aunque la licencia es Apache-2.0, el aviso `NOTICE` debe revisarse para cumplir con las atribuciones del modelo base y las voces.
- Los benchmarks proceden del propio autor del modelo; no se dispone de evaluaciones independientes.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SyzygyResearch/Mach-Boom
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Voces: https://huggingface.co/gradium/phonon-voices
- Dataset de evaluación: https://huggingface.co/datasets/gradium/tts-hard-sentences-202610
