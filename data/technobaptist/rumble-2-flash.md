# TechnoBaptist/Rumble-2-Flash

## Resumen

Rumble-2-Flash es un modelo de reconocimiento automático del habla (ASR) desarrollado por TechnoBaptist y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de aproximadamente 508 millones de parámetros (0,5B) construido sobre la arquitectura Qwen3-ASR, con soporte nativo tanto para Hugging Face Transformers como para vLLM. El modelo resuelve la transcripción de audio a texto en 45 idiomas, incluyendo detección automática de idioma y opciones de formato de salida configurables.

El modelo destaca por su equilibrio entre tamaño reducido y cobertura lingüística amplia, lo que lo hace adecuado para despliegues en producción con requisitos de latencia ajustados. Su integración con vLLM permite servirlo a través de una API compatible con OpenAI, facilitando su adopción en pipelines existentes. La ventana de contexto de 4096 tokens (según la configuración de ejemplo en vLLM) resulta adecuada para transcripciones de audio de duración moderada.

La relevancia actual de Rumble-2-Flash radica en su licencia permisiva (Apache 2.0) y su compatibilidad con infraestructuras estándar de inferencia, lo que lo posiciona como una alternativa viable a modelos ASR propietarios en aplicaciones multilingües. Sin embargo, la información pública disponible es limitada: no se detallan los datos de entrenamiento, la composición del dataset ni los detalles arquitectónicos internos más allá de la referencia a Qwen3-ASR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer multimodal audio-texto) |
| Parámetros totales | 508.631.552 (≈0,5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de ejemplo en vLLM) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 45 idiomas: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Rumble-2-Flash se basa en la arquitectura Qwen3-ASR, un modelo multimodal que procesa audio y genera texto. La información disponible no detalla la composición interna de la arquitectura (número de capas, dimensiones de atención, mecanismo de codificación de audio), más allá de la referencia al pipeline `automatic-speech-recognition` y la etiqueta `qwen3_asr`. El modelo acepta entrada de audio en múltiples formatos (ruta local, URL, array NumPy o lista de estos) y genera transcripciones con opciones configurables de formato.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card se limita a describir el uso práctico, las opciones de transcripción y los resultados de benchmarks, sin entrar en detalles de entrenamiento.

## Capacidades

- Reconocimiento automático del habla (ASR) en 45 idiomas, con detección automática de idioma cuando no se especifica.
- Transcripción con control de formato: números como dígitos o palabras (`digits`), conservación o eliminación de muletillas (`filler`), y colapso de palabras repetidas (`verbatim`).
- Procesamiento de audio desde múltiples fuentes: rutas locales, URLs, arrays NumPy o listas de estos.
- Integración con Hugging Face Transformers mediante `AutoModelForMultimodalLM` y `AutoProcessor`.
- Servicio mediante vLLM con API compatible con OpenAI (`/v1/chat/completions`), incluyendo entrada de audio en base64.
- Soporte de plantilla de chat (`chat_template_kwargs`) para pasar opciones de transcripción en vLLM.
- Capacidad multilingüe amplia: 45 idiomas de Europa, Asia, África y Oriente Medio, incluyendo cantonés (`yue`) y cebuano (`ceb`).

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar audio de reuniones y generar transcripciones con números en formato dígito y sin muletillas, adecuado para generar actas automáticas en entornos corporativos multilingües.
- Subtitulado automático de vídeo: con 45 idiomas soportados y detección automática de idioma, se puede integrar en pipelines de generación de subtítulos para plataformas de contenido, usando vLLM para servir el modelo con baja latencia.
- Atención al cliente por voz: transcripción de llamadas en tiempo real o diferido para su análisis posterior, con la opción de forzar el idioma del cliente para mejorar la precisión en entornos multilingües.
- Análisis de encuestas y entrevistas: transcripción de audio de investigación cualitativa con control de verbatim para preservar repeticiones relevantes o colapsarlas según el análisis, facilitando el procesamiento posterior con NLP.
- Accesibilidad y dictado: integración en aplicaciones de dictado por voz o herramientas de accesibilidad para personas con discapacidad motriz, aprovechando el tamaño reducido del modelo (0,5B) para despliegue en edge o servidores modestos.
- Moderación y análisis de contenido audiovisual: transcripción masiva de audio para sistemas de moderación, búsqueda o indexación de contenido, con RTFx de hasta 7308 en algunos splits según los benchmarks publicados, lo que indica alto throughput.
- Localización de contenido: transcripción en un idioma y posterior traducción en pipelines de localización, aprovechando la cobertura de 45 idiomas y la opción de detección automática para contenido de origen desconocido.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados en el Open ASR Leaderboard (release 18-11-2026, v1.16.1) sobre una GPU H200 con vLLM.

### Pista de inglés

WER medio en el leaderboard: **6,60** (RTFx 6338).

| Split | WER (%) | RTFx |
|---|---|---|
| AMI | 9,24 | 4245 |
| Earnings22 | 6,45 | 4811 |
| GigaSpeech | 7,56 | 5978 |
| SPGISpeech | 3,08 | 7308 |
| URGENT24 | 10,25 | 3314 |
| Voice Arena Monsoon | 3,56 | 3760 |
| VoxPopuli | 2,43 | 4222 |
| Private (scripted) | 3,71 | no disponible |
| Private (conversational) | 13,14 | no disponible |

### Pista multilingüe

WER (%) por idioma y dataset; el chino se mide con CER. La última columna es la media del leaderboard para ese idioma.

| Idioma | FLEURS | Common Voice | MLS | Voice Arena Monsoon | AISHELL-1 | Media |
|---|---|---|---|---|---|---|
| Alemán | 4,77 | 6,28 | no disponible | no disponible | no disponible | **5,52** |
| Español | 2,82 | 4,33 | 4,04 | no disponible | no disponible | **3,73** |
| Francés | 5,95 | 10,01 | 5,66 | no disponible | no disponible | **7,21** |
| Italiano | 2,53 | 4,84 | 7,90 | no disponible | no disponible | **5,09** |
| Neerlandés | 6,05 | 4,92 | 9,38 | no disponible | no disponible | **6,78** |
| Portugués | 5,31 | no disponible | 7,61 | no disponible | no disponible | **6,46** |
| Hindi | no disponible | no disponible | no disponible | 14,11 | no disponible | **14,11** |
| Chino (CER) | 5,82 | no disponible | no disponible | no disponible | 7,31 | **6,56** |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 0,5B parámetros (508,6M). En precisión completa (fp32) requeriría aproximadamente 2 GB solo para pesos; en fp16/bf16, alrededor de 1 GB; en cuantizaciones de 8 bits, unos 0,5 GB; en 4 bits, unos 0,25 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: el benchmark oficial se ejecutó en una NVIDIA H200 con vLLM. Para producción, una GPU con al menos 8-16 GB de VRAM es suficiente para el modelo en fp16 junto con overhead de inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.), aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: vLLM (soporte nativo documentado, con `vllm[audio]`), Hugging Face Transformers (`AutoModelForMultimodalLM` + `AutoProcessor`), y servidor compatible con OpenAI a través de vLLM.
- Latencia y throughput: RTFx reportado entre 3314 y 7308 en los splits de inglés del Open ASR Leaderboard, lo que indica un throughput alto (procesa entre 3314 y 7308 segundos de audio por segundo de cómputo en H200 con vLLM). No se dispone de datos de latencia por petición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card referencia el Open ASR Leaderboard para comparar con otros modelos open source en las pistas multilingües, pero no incluye una tabla comparativa directa con alternativas concretas. No se han publicado en la información disponible datos de modelos como Whisper, Parakeet u otros ASR comparables en términos de parámetros, contexto o licencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rumble-2-Flash | 0,5B | 4096 tokens | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han documentado sesgos conocidos del modelo en la información disponible.
- Riesgo de alucinación: como todo modelo generativo, puede producir transcripciones inexactas, especialmente en audio con ruido, acentos no representados en el entrenamiento o idiomas con pocos recursos.
- El WER en inglés conversacional privado es notablemente superior (13,14%) que en scripted (3,71%), lo que indica degradación en audio espontáneo y conversacional.
- El rendimiento en hindi es comparativamente bajo (14,11% WER en Voice Arena Monsoon) frente a otros idiomas como español (3,73% de media) o italiano (5,09%).
- La longitud de contexto de 4096 tokens limita la duración máxima de audio procesable en una sola petición; audios más largos requerirán segmentación.
- No se detallan los datos de entrenamiento ni la composición del dataset, lo que dificulta evaluar la cobertura real de acentos, dialectos y condiciones acústicas.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la procedencia de los datos de entrenamiento (no documentada) para evaluar riesgos legales en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación por parte de la comunidad.
- La model card usa el identificador `Reson8/Rumble-2-Flash` en los ejemplos de código, mientras que el repositorio consultado es `TechnoBaptist/Rumble-2-Flash`; conviene verificar cuál es el identificador canónico antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/TechnoBaptist/Rumble-2-Flash
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard?version=1.16.1
- Vista comparativa multilingüe del leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard?languages=Reson8%2FRumble-2-Flash&proprietary=false
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- vLLM: https://github.com/vllm-project/vllm
- Hugging Face Transformers: https://github.com/huggingface/transformers
