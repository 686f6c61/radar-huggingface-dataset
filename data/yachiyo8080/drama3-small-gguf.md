# yachiyo8080/drama3-small-GGUF

## Resumen

drama3-small es una versión comprimida y cuantizada de Fish Audio Drama 3, un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot, publicado por el usuario yachiyo8080. El modelo original parte de una arquitectura mixta de mezcla de expertos (MoE) de 35B parámetros totales con 3B activos (35B-A3B), y esta variante reduce el número de expertos enrutados al 45 % de las ranuras originales y cuantiza los pesos a aproximadamente 3 bits, con el objetivo de que quepa en una GPU de 12 GB de VRAM.

La relevancia de esta ficha radica en que demuestra una técnica de compresión agresiva —poda de expertos guiada por masa de enrutamiento, reajuste de routers y destilación de conocimiento desde el modelo original en FP8— aplicada a un modelo de voz expresivo con soporte de etiquetas inline, direcciones de estilo en inglés y notas de dirección. El resultado es un GGUF de 9,74 GiB que, según el autor, alcanza un pico medido de 10,26 GiB en streaming con una referencia de 30 segundos en una RTX 4090.

El modelo soporta japonés e inglés (incluido japonés con términos técnicos en inglés) y se ejecuta mediante audio.cpp con un parche específico para CUDA. La licencia es la Fish Audio Community License v1.0, que impone restricciones adicionales respecto a licencias permisivas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Fish Audio Drama 3, con backbone de 35B-A3B podado y cuantizado; incluye torre de audio (MTP) y códec |
| Parametros totales | No disponible (el modelo base es 35B-A3B; tras poda y cuantización el archivo pesa 9,74 GiB) |
| Parametros activos | No disponible (el base declara 3B activos; no se especifica el valor tras la poda) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ3_XXS para expertos enrutados (con imatrix de voz), Q8_0 para atención/Gated DeltaNet, embeddings y torre de audio, F16 para el códec |
| Idiomas soportados | Japonés e inglés (incluye japonés con términos técnicos en inglés) |
| Licencia | Fish Audio Community License v1.0 (license: other) |
| Formato de pesos | GGUF (archivo `drama3-small-IQ3_XXS.gguf`, 9,74 GiB) |

## Arquitectura y entrenamiento

El modelo parte de Fish Audio Drama 3, un transformer con mezcla de expertos de 35B parámetros totales y 3B activos. La compresión se realizó en varias fases: primero se rankearon los expertos por masa de enrutamiento sobre voz japonesa e inglesa estratificada (plano, code-switching técnico, con estilo y con etiquetas), y se podaron las ranuras de experto al 45 %. Las capas 0, 1, 2 y 36 conservan los 256 expertos originales porque la poda en esas capas resultó mucho más costosa; el resto de capas mantiene 100 expertos. Esta reasignación por sensibilidad redujo el KL proxy un 26 % frente a una poda uniforme de 116 expertos por capa.

Tras la poda se reajustaron los routers y los expertos compartidos capa por capa, y después se aplicaron 100 pasos de destilación de conocimiento desde el modelo original en FP8, usando KL sobre las distribuciones semántica y de la torre de audio. Los datos de destilación incluyeron aproximadamente 282 horas de voz real y 5.501 líneas leídas por el modelo original (etiquetas, direcciones y japonés técnico). La cabeza de salida se recortó a EOS más 4.096 filas semánticas orientadas solo a voz. El autor señala que una destilación más prolongada reducía aún más el KL proxy pero empeoraba la generación libre (pérdida de contenido tras la primera frase), por lo que el checkpoint final se eligió mediante pruebas de escucha.

## Capacidades

- Síntesis de voz text-to-speech en japonés e inglés, incluido japonés con términos técnicos en inglés.
- Clonación de voz zero-shot a partir de aproximadamente 10-30 segundos de audio de referencia.
- Soporte de etiquetas inline como `[laughs]` y `[sighs]`, y de spans como `<whisper>...</whisper>`.
- Soporte de direcciones de estilo en inglés entre corchetes (por ejemplo, `[softly, whispering as if someone might overhear]`).
- Soporte de notas de dirección (director's notes) para controlar la interpretación.
- Generación expresiva con control de pausas (opción `max_pause_frames` en el runtime).
- Ejecución en audio.cpp con parche CUDA específico.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo está orientado exclusivamente a voz.

## Casos de uso

- Audiolibros y narración expresiva: el modelo permite clonar una voz concreta a partir de 10-30 segundos de referencia y aplicar etiquetas de emoción y spans de susurro para dar matices a pasajes largos, con control de pausas para evitar cortes antinaturales.
- Doblaje y localización de contenido japonés-inglés: al soportar ambos idiomas y el code-switching técnico, puede generar una misma línea en japonés con términos ingleses (API, Redis, Kubernetes) manteniendo la coherencia de voz.
- Asistentes de voz para atención al cliente: la clonación zero-shot permite desplegar una voz de marca consistente y generar respuestas en japonés e inglés desde un único modelo, aunque el contexto conversacional no está documentado.
- Producción de pódcasts y contenido narrado: las notas de dirección y las direcciones de estilo en inglés permiten dirigir la interpretación (susurro, tono suave, risa) sin reentrenar el modelo.
- Prototipado de interfaces de voz en local: al caber en 12 GB de VRAM según el autor, es viable ejecutarlo en una estación de trabajo con RTX 4090 para iterar sobre guiones y voces sin depender de servicios en la nube.
- Generación de audio para videojuegos y visual novels: las etiquetas inline y los spans permiten producir variaciones emocionales de una misma línea de diálogo de forma automatizada, manteniendo la identidad de voz entre tomas.
- Investigación en compresión de modelos de voz: sirve como caso de estudio reproducible de poda de expertos guiada por enrutamiento, reajuste de routers y destilación desde un modelo FP8.

## Benchmarks y rendimiento

El autor publica una evaluación de fidelidad proxy (KL forzado por el profesor contra el original en FP8, sobre 4.097 candidatos de voz y 152 pares japonés-inglés retenidos; menor es mejor):

| Modelo | Tamano | KL |
|---|---|---|
| Drama 3, todos los expertos en Q4_K | 16,9 GiB | 0,013 |
| Paquete comunitario Q2_K | 9,8 GiB | 0,094 |
| drama3-small antes de destilación | 9,74 GiB | 0,0997 |
| drama3-small (esta versión) | 9,74 GiB | 0,0735 |

El autor menciona pruebas de escucha sobre 58 líneas variadas (una toma cada una: formato largo, números, términos técnicos, cada dirección emocional y etiqueta, 7 voces), con criterio de fallo por desbordamiento, pérdida de contenido o voz incorrecta, evaluadas con CER/WER de Whisper large-v3-turbo y similitud de hablante con WavLM, pero no se incluyen los resultados numéricos de esas pruebas en la información disponible.

Datos de rendimiento declarados: pico medido de 10,26 GiB de VRAM en streaming con referencia de 30 segundos en RTX 4090 (no probado en una tarjeta real de 12 GB); velocidad offline de aproximadamente 1,6× en RTX 4090 y 1,8× en RTX 5090 en tiempo real por petición incluyendo la codificación de referencia, y aproximadamente 2,6× y 3,2× respectivamente una vez generando.

## Requisitos de hardware

- VRAM estimada: el autor indica que debería caber en 12 GB; pico medido de 10,26 GiB en streaming con referencia de 30 segundos en RTX 4090.
- GPU recomendadas: RTX 4090 y RTX 5090 son las únicas con mediciones publicadas; no se ha probado en una tarjeta de 12 GB real.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas de 12 GB o más (pendiente de validación en hardware de 12 GB).
- Opciones de despliegue: audio.cpp en el commit `9277495a` más el parche `drama3-small-audiocpp.patch` (CUDA). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: aproximadamente 1,6×/1,8× tiempo real por petición (RTX 4090/5090) incluyendo codificación de referencia; aproximadamente 2,6×/3,2× una vez generando.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (KL proxy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drama3-small (esta versión) | 35B-A3B podado, IQ3_XXS | No disponible | 0,0735 | Fish Audio Community License v1.0 | GGUF, 9,74 GiB |
| Drama 3 (original, Q4_K) | 35B-A3B | No disponible | 0,013 | Fish Audio Community License v1.0 | Pesos originales |
| Paquete comunitario Q2_K | No disponible | No disponible | 0,094 | No disponible | GGUF, 9,8 GiB |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia Fish Audio Community License v1.0 impone restricciones que deben revisarse antes de cualquier uso comercial; no es una licencia permisiva estándar.
- El autor declara explícitamente que Fish Audio no patrocina ni respalda esta variante.
- El modelo solo soporta japonés e inglés; no se documentan otros idiomas.
- El pico de VRAM se midió en RTX 4090 y no se ha validado en una tarjeta real de 12 GB, por lo que el ajuste a 12 GB es una estimación del autor.
- La destilación más prolongada degradó la generación libre (pérdida de contenido tras la primera frase), lo que sugiere sensibilidad al equilibrio entre fidelidad proxy y calidad de generación autónoma.
- Riesgo de alucinación y de errores de pronunciación en textos largos, números y términos técnicos, aunque el autor reporta pruebas de escucha sobre estos casos sin publicar los resultados numéricos.
- Requiere un runtime específico (audio.cpp con parche CUDA en un commit concreto), lo que limita la portabilidad frente a otros formatos de despliegue.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- No se documentan sesgos específicos del modelo ni del dataset de destilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yachiyo8080/drama3-small-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Runtime audio.cpp: https://github.com/JarodMica/audio.cpp
- Muestras de audio: https://huggingface.co/pentacoxian-dev/drama3-small-GGUF/resolve/main/samples/ja_story.mp3 (y el resto de muestras referenciadas en la model card)
