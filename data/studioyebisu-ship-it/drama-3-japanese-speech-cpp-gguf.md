# StudioYebisu-ship-it/Drama-3-Japanese-speech-cpp-gguf

## Resumen

Drama-3-Japanese es un modelo de síntesis de voz (text-to-speech) en japonés basado en `fishaudio/s2-pro` y desarrollado originalmente por Aratako. Esta ficha concreta corresponde a las cuantizaciones GGUF publicadas por StudioYebisu-ship-it para su uso en los runtimes `speech.cpp` y `audio.cpp`, lo que permite ejecutar localmente un modelo de 35.774.376.977 parámetros con soporte para clonación de voz zero-shot y generación de habla emocionalmente expresiva en japonés.

El modelo emplea una arquitectura híbrida de mezcla de expertos (MoE), como se deduce de la nomenclatura `35B-A3B` de los ficheros publicados (35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token). Las cuantizaciones han sido calibradas con una matriz de importancia (`imatrix`) estratificada sobre japonés, lo que mejora la fidelidad de los pesos cuantizados en este idioma concreto. El contexto de texto admitido por el sidecar de configuración es de 8192 tokens.

Su relevancia actual radica en que traslada un modelo TTS de gran tamaño a hardware de consumo mediante cuantizaciones agresivas (desde 9,09 GiB en IQ3_XXS hasta 24,57 GiB en Q5_K), con parches específicos que aceleran la inferencia en CUDA y compatibilidad con backends Vulkan y CPU. La licencia fish-audio-community-license-1.0 condiciona el uso comercial, por lo que conviene revisarla antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), nomenclatura 35B-A3B; pesos derivados de `fishaudio/s2-pro` |
| Parámetros totales | 35.774.376.977 |
| Parámetros activos | Aproximadamente 3.000 millones (según nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | 8192 tokens de texto (`max_text_tokens` en el sidecar) |
| Tipos de cuantización | Q4_K híbrido, Q5_K híbrido, IQ3_XXS (variantes speech.cpp y audio.cpp) |
| Idiomas soportados | Japonés (ja) |
| Licencia | fish-audio-community-license-1.0 |
| Formato de pesos | GGUF (ggml), con sidecar `.gguf.json` |

## Arquitectura y entrenamiento

El modelo subyacente `Aratako/Drama-3-Japanese` deriva de `fishaudio/s2-pro` y se distribuye aquí como cuantizaciones GGUF para los runtimes `speech.cpp` y `audio.cpp`. La nomenclatura de los ficheros (`Drama-35B-A3B-Japanese-v3`) indica una arquitectura de mezcla de expertos con 35.000 millones de parámetros totales y alrededor de 3.000 millones activos por token, aunque la model card no detalla la composición exacta de expertos ni la configuración de las capas.

Las cuantizaciones se han generado con calibración `imatrix` estratificada sobre japonés, y los ficheros Q4_K y Q5_K emplean un esquema híbrido: los expertos se cuantizan a Q4_K o Q5_K mientras que otras capas se mantienen en Q8_0, F16 o F32. Los ficheros IQ3_XXS aplican una cuantización más agresiva a los expertos. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en la model card proporcionada.

Una innovación destacable es el parche `drama3-speechcpp-fast.patch`, que sobre `speech.cpp v0.11.2` reporta una aceleración agregada de aproximadamente 2,96× en CUDA. Además, los ficheros incluyen un codec de voz con identificador `2cf2ec268a087bd2ad91bfbb6796b0429fb03a73cdb8fd07f445d503e9a14d37` y soporte para extracción de un `voice.gguf` reutilizable a partir de un audio de referencia con su transcripción.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés con salida PCM WAV a 44,1 kHz.
- Clonación de voz zero-shot a partir de un audio de referencia y su transcripción exacta, generando un fichero `voice.gguf` reutilizable.
- Generación de habla emocionalmente expresiva, con control mediante etiquetas entre corchetes (por ejemplo `[囁き]` para susurro, `[吐息]` para respiración, o descripciones de estilo como voz de mujer de 25 años susurrando).
- Soporte de susurros, respiración audible y estilos íntimos tipo ASMR, según los ejemplos de audio publicados.
- Modo servidor local mediante el subcomando `serve` de `speech.cpp`, con host y puerto configurables.
- Control de generación mediante semilla, temperatura, top-k y top-p (parámetros expuestos en la CLI de `audio.cpp`).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Audiolibros y narración en japonés: el modelo acepta textos de hasta 8192 tokens y produce voz natural con control de estilo, lo que permite narrar capítulos completos por pasajes con una voz consistente extraída previamente como `voice.gguf`.
- Doblaje y localización de contenido: la clonación zero-shot permite replicar la voz de un actor a partir de una muestra corta con transcripción, útil para regenerar líneas de diálogo en japonés manteniendo el timbre original.
- Asistentes de voz y agentes conversacionales en japonés: el modo servidor (`speech serve`) expone el modelo por HTTP en local, lo que facilita integrarlo como backend TTS en pipelines de asistentes con baja dependencia de servicios en la nube.
- Producción de contenido ASMR y audios inmersivos: las etiquetas de estilo permiten generar susurros, respiraciones y voces íntimas de forma controlada, un nicho donde los TTS convencionales suelen sonar planos.
- Prototipado de videojuegos y novelas visuales: con la variante IQ3_XXS (9,09 GiB) el modelo cabe en GPUs de 16 a 24 GB, lo que permite generar voces de personajes en estaciones de trabajo sin GPU de datacenter.
- Accesibilidad y lectura de textos: conversión de documentos y contenido web en japonés a audio con voces personalizables, ejecutable en local para preservar la privacidad del texto procesado.
- Investigación en síntesis de voz: la disponibilidad de varias cuantizaciones (Q4_K, Q5_K, IQ3_XXS) y de dos runtimes (`speech.cpp` y `audio.cpp`) permite estudiar el impacto de la cuantización en la calidad perceptual del habla generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de velocidad de inferencia sobre muestras concretas:

| Modelo / runtime | Texto | Tiempo | RTFx |
|---|---|---|---|
| small-IQ3_XXS (RTX 4090 CUDA, parche fast) | Narración | 12,68 s | 4,18 |
| small-IQ3_XXS (CUDA, Whisper) | Susurro | 8,31 s | no disponible |
| Full Hybrid Q4_K (speech.cpp v0.11.2 Vulkan) | Susurro | 11,66 s | 1,91 |
| Full Hybrid Q5_K (speech.cpp v0.11.2 Vulkan) | Narración | 6,08 s | 1,86 |

El parche `drama3-speechcpp-fast.patch` reporta una aceleración agregada de aproximadamente 2,96× en CUDA respecto a la versión sin parche.

## Requisitos de hardware

- VRAM estimada según la model card (incluye una reserva de aproximadamente 2,40 GiB):
  - Q4_K: aproximadamente 23,21 GiB en GPU completa.
  - Q5_K: aproximadamente 26,96 GiB en GPU completa.
  - IQ3_XXS (speech.cpp): aproximadamente 11,48 GiB, orientado a GPUs de 16 a 24 GB.
  - IQ3_XXS (audio.cpp): aproximadamente 11 a 12 GiB.
- GPU recomendadas: RTX 4090 para la variante IQ3_XXS con parche CUDA; para Q4_K y Q5_K se requiere una GPU con al menos 24-27 GiB de VRAM libre o bien ejecución parcial en CPU.
- Los ficheros Q4_K y Q5_K no deben ejecutarse en CUDA: `ggml-cuda` almacena `block_q8_1.ds` en FP16, lo que provoca desbordamiento en las activaciones de `ffn_down_exps` y aserciones de `not finite numbers`. Deben usarse con Vulkan (con `GGML_VK_DISABLE_F16=1`, `GGML_VK_DISABLE_COOPMAT=1` y `GGML_VK_DISABLE_COOPMAT2=1`) o con CPU (`block_q8_K`).
- Para CUDA debe emplearse la variante `Drama-35B-A3B-Japanese-v3-small-IQ3_XXS.gguf` junto con el parche `drama3-speechcpp-fast.patch` sobre `speech.cpp v0.11.2`.
- Opciones de despliegue: `speech.cpp` (v0.11.2 o superior, backends Vulkan, CPU y CUDA con parche) y `audio.cpp` (backend CUDA) para el fichero con layout específico.
- Throughput observado: RTFx de 4,18 en RTX 4090 con IQ3_XXS y parche fast; RTFx de 1,86 a 1,91 en Vulkan con Q4_K y Q5_K. No se dispone de datos de latencia adicionales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia estructural, esta ficha se relaciona con su modelo base y con el modelo del que este deriva:

| Modelo | Relación | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Drama-3-Japanese-speech-cpp-gguf | Esta ficha (cuantización GGUF) | 35.774.376.977 | 8192 tokens de texto | fish-audio-community-license-1.0 | GGUF |
| Aratako/Drama-3-Japanese | Modelo base cuantizado | no disponible | no disponible | no disponible | no disponible |
| fishaudio/s2-pro | Modelo de origen del base | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta japonés; no se documenta soporte multilingüe.
- La licencia fish-audio-community-license-1.0 es una licencia comunitaria con condiciones específicas; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Los ficheros Q4_K y Q5_K fallan en CUDA por desbordamiento de FP16 en las activaciones de `ffn_down_exps`; usarlos en CUDA produce aserciones de números no finitos. Deben ejecutarse en Vulkan o CPU.
- La clonación de voz exige una transcripción exacta del audio de referencia; transcripciones incorrectas degradan la calidad de la voz extraída.
- El modelo puede reproducir estilos de voz de personas reales a partir de muestras cortas, lo que plantea riesgos de suplantación y exige consentimiento explícito y cumplimiento normativo.
- No se han publicado evaluaciones formales de sesgo, robustez ni tasas de alucinación acústica (pronunciación incorrecta, artefactos o texto omitido) en la información disponible.
- El contexto de texto está limitado a 8192 tokens según el sidecar; textos más largos deben fragmentarse.
- La variante IQ3_XXS requiere un parche específico sobre `speech.cpp v0.11.2` para funcionar en CUDA, lo que añade complejidad de mantenimiento frente a versiones upstream.
- El tamaño del repositorio (68,5 GB) implica requisitos de almacenamiento considerables si se descargan todas las cuantizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StudioYebisu-ship-it/Drama-3-Japanese-speech-cpp-gguf
- Modelo base: https://huggingface.co/Aratako/Drama-3-Japanese
- Runtime speech.cpp: https://github.com/nyosegawa/speech.cpp
- Runtime audio.cpp: https://github.com/JarodMica/audio.cpp
- Modelo de origen citado: `fishaudio/s2-pro` (no se proporciona URL directa en la información disponible)
