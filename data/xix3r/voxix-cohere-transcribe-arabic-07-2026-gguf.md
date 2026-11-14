# xix3r/voxix-cohere-transcribe-arabic-07-2026-gguf

## Resumen

voxix-cohere-transcribe-arabic-07-2026-gguf es una conversión al formato GGUF del modelo CohereLabs/cohere-transcribe-arabic-07-2026, un sistema de reconocimiento automático del habla (ASR) de 2.049 millones de parámetros desarrollado por Cohere y Cohere Labs. La conversión la mantiene el usuario xix3r y está pensada para su uso con transcribe.cpp, una implementación en C++ orientada a inferencia local y ligera. El modelo resuelve la transcripción de audio en árabe (incluyendo dialectos y code-switching árabe-inglés) con el inglés como idioma secundario.

La arquitectura sigue el diseño Cohere Transcribe 03-2026: un encoder Conformer con una cabeza encoder-decoder Transformer con atención cruzada y embeddings de tokens compartidos. El modelo consume audio WAV mono a 16 kHz junto con una bandera de idioma (`-l ar` o `-l en`) y produce la transcripción de forma autorregresiva. Es relevante ahora porque ofrece una alternativa Apache-2.0, ejecutable en CPU y GPU de consumo, para transcripción en árabe de calidad competitiva (WER en torno al 11% en FLEURS árabe) sin depender de servicios en la nube.

El paquete GGUF incluye seis niveles de cuantización (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con tamaños que van de 1,56 GB a 4,11 GB, y mantiene un WER prácticamente idéntico al de referencia en BF16 en todas ellas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder + Transformer encoder-decoder con cross-attention |
| Parametros totales | 2.049.026.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ar, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp); modelo base en safetensors |
| Entrada | Audio WAV mono 16 kHz (log-Mel spectrogram) |
| Salida | Texto (transcripción) |
| Decodificacion | Autorregresiva |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |
| Timestamps | ninguno |
| Tamano del repo | 1,8 GB |

## Arquitectura y entrenamiento

El modelo es una adaptación centrada en árabe de la arquitectura Cohere Transcribe 03-2026. Combina un encoder Conformer (convoluciones + atención) para procesar el log-Mel spectrogram del audio con una cabeza encoder-decoder Transformer que emplea atención cruzada y embeddings de tokens compartidos entre encoder y decoder. La decodificación es autorregresiva y el modelo no soporta streaming, traducción, detección automática de idioma ni timestamps; el idioma se indica explícitamente mediante una bandera (`-l ar` o `-l en`).

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de audio, la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La model card upstream indica que el modelo está optimizado para árabe y inglés, con foco en dialectos árabes y code-switching árabe-inglés. La conversión GGUF se realizó a partir del commit upstream `0a8193c` (fijado el 2026-07-07) y se validó numéricamente contra la referencia de Transformers en el commit `d89ecb7` de transcribe.cpp.

## Capacidades

- Transcripción offline de audio en árabe, incluyendo dialectos árabes (evaluado sobre FLEURS árabe, de dialecto egipcio).
- Code-switching árabe-inglés: maneja emisiones que mezclan ambos idiomas.
- Transcripción en inglés como idioma secundario, seleccionable con `-l en`.
- Entrada de audio WAV mono a 16 kHz; requiere conversión previa con ffmpeg si el audio no cumple ese formato.
- Inferencia local en CPU (con soporte Vulkan y Metal) mediante transcribe.cpp.
- No soporta streaming, timestamps, detección automática de idioma ni traducción.
- No es un modelo de propósito general: no hace tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Transcripción de reuniones y entrevistas en árabe: el modelo procesa audio WAV mono a 16 kHz de forma offline y devuelve la transcripción completa, adecuado para entornos donde no se puede enviar audio a servicios en la nube por privacidad.
- Subtitulado y documentación de contenido audiovisual en árabe: conversión de pistas de audio a texto para archivo, indexación o accesibilidad, ejecutable en una estación de trabajo con CPU o GPU de consumo.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones de centros de contacto en árabe para su posterior análisis de calidad o extracción de información, gracias a su licencia Apache-2.0 que permite uso comercial.
- Investigación lingüística sobre dialectos árabes: el modelo está entrenado con foco en dialectos y code-switching, lo que lo hace útil para corpus de habla dialectal y estudios de variación.
- Procesamiento de audio con mezcla árabe-inglés: transcripción de contenido bilingüe (charlas, pódcast, formación) seleccionando el idioma principal con la bandera correspondiente.
- Despliegue en dispositivos con recursos limitados: la cuantización Q4_K_M (1,56 GB) permite ejecutar la transcripción en portátiles sin GPU dedicada mediante transcribe.cpp, con un WER de 11,18% en FLEURS árabe.
- Pipelines de transcripción por lotes: integración en scripts y flujos automatizados que convierten audio a WAV 16 kHz y llaman al binario `transcribe-cli`, sin dependencias de Python ni de servicios externos.

## Benchmarks y rendimiento

WER medido sobre el split de test completo de FLEURS árabe (`ar_eg`, 428 emisiones), decodificación greedy y sin LM externo, normalizado con Whisper BasicTextNormalizer:

| Cuantizacion | Tamano | WER FLEURS ar test |
|---|---:|---:|
| BF16 (referencia) | 4,10 GB | 11,02% |
| F16 | 4,11 GB | 11,00% |
| Q8_0 | 2,41 GB | 11,06% |
| Q6_K | 1,97 GB | 11,07% |
| Q5_K_M | 1,77 GB | 10,95% |
| Q4_K_M | 1,56 GB | 11,18% |

La referencia nativa en Transformers, medida sobre el mismo manifiesto, es 11,00% en BF16; todas las cuantizaciones caen dentro del intervalo de confianza del 95% de la referencia.

Rendimiento (RTF, factor de tiempo real; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 73 |
| Apple M4 Max | CPU | 9 |
| AMD Ryzen 4750U | Vulkan | 8 |
| AMD Ryzen 4750U | CPU | 3 |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores (no hay MMLU, HumanEval ni GSM8K, al no ser un modelo de lenguaje general).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,6 GB con Q4_K_M, 1,8 GB con Q5_K_M, 2,0 GB con Q6_K, 2,4 GB con Q8_0 y 4,1 GB con BF16/F16.
- Cabe en GPU de consumo: sí, cualquier GPU con 2-4 GB de memoria libre (por ejemplo RTX 3060, RTX 4060, RTX 4090) usando los backends soportados por transcribe.cpp.
- Funciona en CPU sin GPU: sí, con RTF de 9 en Apple M4 Max y 3 en AMD Ryzen 4750U (CPU), y RTF de 73 (Metal) y 8 (Vulkan) con aceleración gráfica.
- Opciones de despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: el RTF de 73 en Metal implica procesar audio unas 73 veces más rápido que tiempo real; en CPU de portátil (RTF 3) sigue siendo más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| voxix-cohere-transcribe-arabic-07-2026-gguf | 2,05 B | ar, en | Apache-2.0 | GGUF | WER 11,0-11,2% en FLEURS ar; offline, sin streaming |
| CohereLabs/cohere-transcribe-arabic-07-2026 (base) | 2,05 B | ar, en | Apache-2.0 | safetensors | Modelo original; requiere Transformers |
| CohereLabs/cohere-transcribe-03-2026 | no disponible | no disponible | no disponible | no disponible | Arquitectura base sobre la que se adapta este modelo |
| Whisper (variantes) | no disponible en la informacion | no disponible | no disponible | no disponible | Alternativa ASR habitual; sin datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos directos con otros modelos ASR en la información proporcionada; la model card advierte que los números upstream publicados sobre otros conjuntos de test árabes no son directamente comparables con FLEURS.

## Limitaciones y advertencias

- No soporta streaming: requiere el audio completo antes de transcribir.
- No genera timestamps, no traduce y no detecta el idioma automáticamente; hay que indicar `-l ar` o `-l en`.
- Solo cubre árabe e inglés; otros idiomas no están soportados.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; el WER ronda el 11% en FLEURS árabe (dialecto egipcio), por lo que la calidad varía según el dialecto y la calidad del audio.
- Sesgos potenciales derivados de los datos de entrenamiento (no documentados en la información disponible).
- Requiere audio WAV mono a 16 kHz; es necesario convertir previamente con ffmpeg.
- Licencia Apache-2.0, que permite uso comercial; conviene revisar la model card upstream para los términos completos.
- El paquete tiene pocas descargas (25) y ningún like en el momento de la consulta; es una conversión de terceros, no oficial de Cohere.
- Para producción, validar numéricamente contra la referencia de Transformers y fijar la versión de transcribe.cpp, ya que la conversión se validó en un commit concreto (`d89ecb7`).

## Enlaces

- Repositorio GGUF: https://huggingface.co/xix3r/voxix-cohere-transcribe-arabic-07-2026-gguf
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Commit upstream de referencia: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026/commit/0a8193c
- Arquitectura base Cohere Transcribe: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-arabic-07-2026.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/d89ecb7
- Cohere Labs: https://cohere.com/research
