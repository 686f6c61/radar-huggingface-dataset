# ThinkingVibeCoder/Drama-3-Tier2-5Lang-INT3

## Resumen

Drama-3-Tier2-5Lang-INT3 es una cuantización comunitaria del modelo de síntesis de voz (text-to-speech) Fish Audio Drama 3, publicada por el usuario ThinkingVibeCoder en Hugging Face. No es un modelo oficial de Fish Audio, sino un derivado podado y cuantizado que reduce el peso en disco de los 38,63 GiB del checkpoint FP8 original a 13,80 GiB, manteniendo capacidad multilingüe en cinco idiomas: chino mandarín (zh), inglés (en), japonés (ja), coreano (ko) y cantonés (yue).

El modelo parte de una arquitectura Mixture-of-Experts (MoE) con 40 capas y 10.240 expertos enrutados, de los cuales conserva 6.858 seleccionados por cobertura de activación en los cinco idiomas soportados. Los expertos se empaquetan en INT3 con GPTQ, mientras que las capas densas se mantienen en FP8 y el códec de audio en BF16. El resultado son aproximadamente 11.269 millones de parámetros totales almacenados en safetensors, con un footprint cargado de 13,73 GiB más 0,304 GiB de workspace.

Su relevancia radica en que permite ejecutar un modelo TTS multilingüe de calidad en hardware de una sola máquina con memoria unificada, como un NVIDIA DGX Spark (GB10) con 121,7 GiB, o en estaciones con Apple Silicon de alta memoria. El autor reporta una tasa de error de caracteres/palabras agrupada del 7,19 % en los cinco idiomas, frente al 14,71 % de una versión podada solo para inglés, y un TTFA en streaming de 292,2 ms con el parche LRU VoiceCache.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con 40 capas y 10.240 expertos enrutados; capas densas en FP8, expertos en INT3 GPTQ, códec de audio en BF16 |
| Parámetros totales | 11.269.119.104 (dato de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT3 GPTQ (expertos enrutados), FP8 (capas densas), BF16 (códec de audio); tag adicional "8-bit" en metadatos |
| Idiomas soportados | zh (chino mandarín), en (inglés), ja (japonés), ko (coreano), yue (cantonés) |
| Licencia | fish-audio-community-license (Fish Audio Community License v1.0) |
| Formato de pesos | safetensors |
| Tamaño del repo | 14,8 GB (13,80 GiB en disco; 13,73 GiB de pesos cargados + 0,304 GiB de workspace) |
| Expertos retenidos | 6.858 de 10.240 (poda por cobertura de activación en 5 idiomas) |
| Pipeline | text-to-speech |
| Modelo base | fishaudio/drama-3 |

## Arquitectura y entrenamiento

El modelo es un derivado cuantizado y podado de Fish Audio Drama 3, un sistema TTS con arquitectura MoE de 40 capas y 10.240 expertos enrutados. La poda conserva 6.858 expertos (aproximadamente el 67 % del total) seleccionados mediante cobertura de activación sobre los cinco idiomas objetivo, lo que preserva el rendimiento multilingüe mejor que una poda guiada solo por inglés (que retenía 5.900 expertos). Los expertos enrutados se cuantizan a INT3 mediante GPTQ, mientras que las capas densas permanecen en FP8 y el códec de audio en BF16 para preservar la calidad de reconstrucción de la señal.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición exacta del dataset ni si hubo etapas de RLHF o DPO, ya que la model card del derivado no detalla el proceso de entrenamiento original de Fish Audio Drama 3. La innovación técnica destacable de este checkpoint es el pipeline de cuantización y poda multilingüe, junto con el motor TensorFold (repo `plotarmordev/drama-tensorfold`) que soporta NVFP4/INT3, y un parche de caché de voces LRU de 4 ranuras que reduce el TTFA en streaming. El autor reporta una divergencia KL media de 0,0293 frente al profesor FP8 completo en 78 prompts multilingües, con un 83,48 % de acuerdo top-1.

## Capacidades

- Síntesis de voz multilingüe (text-to-speech) en chino mandarín, inglés, japonés, coreano y cantonés.
- Generación de audio con códec BF16 integrado para reconstrucción de alta fidelidad.
- Soporte de streaming con TTFA bajo (292,2 ms con VoiceCache, 552,6 ms sin caché).
- Capacidad de síntesis bilingüe mixta dentro de una misma frase (p. ej., chino e inglés combinados).
- Endpoint compatible con OpenAI `/v1/audio/speech` mediante el motor TensorFold.
- Integración con pipelines de audio-vídeo (demo MMH3 con `--audio-drive` y `--lock-audio`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; es un modelo exclusivamente TTS.

## Casos de uso

- **Doblaje y localización de vídeo multilingüe**: el modelo genera voz en cinco idiomas asiáticos y en inglés, lo que permite producir pistas de audio localizadas para un mismo contenido sin cambiar de modelo, manteniendo coherencia de timbre si se usa la misma referencia de voz.
- **Asistentes de voz en producción sobre hardware de una sola máquina**: con 13,73 GiB de pesos cargados, cabe en un DGX Spark GB10 (121,7 GiB) junto con un LLM local y un motor de vídeo, habilitando un asistente conversacional completo en un único nodo.
- **Generación de audiolibros y contenido narrado**: la baja tasa de error en chino (0,8 %–1,6 % CER) y japonés/coreano (0 %–3,6 %) lo hace adecuado para narración larga donde la fidelidad de pronunciación es crítica.
- **Prototipado de interfaces de voz en cantonés**: al ser uno de los pocos checkpoints abiertos que retiene cobertura para yue, sirve para construir demos y productos dirigidos al mercado de Hong Kong y Guangdong.
- **Pipelines de avatar parlante y vídeo generativo**: la demo oficial integra el audio generado con `mmh3 --audio-drive` para sincronizar labios en vídeo de 768×1024 a 24 fps, útil en creación de contenido sintético y marketing.
- **Atención al cliente telefónica automatizada**: el endpoint compatible con OpenAI `/v1/audio/speech` permite integrarlo en centralitas y sistemas IVR existentes sin reescribir la capa de integración.
- **Investigación en cuantización MoE**: sirve como referencia reproducible para estudiar el impacto de la poda guiada por cobertura multilingüe y la cuantización INT3 GPTQ en modelos TTS.

## Benchmarks y rendimiento

| Métrica | FP8 completo (fishaudio/drama-3) | INT3 podado solo EN (5.900 expertos) | Drama-3-Tier2-5Lang-INT3 |
|---|---:|---:|---:|
| Tamaño en disco | 38,63 GiB | 14,50 GiB | 13,80 GiB |
| Footprint cargado | ~36,95 GiB | 14,46 GiB | 13,73 GiB |
| Expertos enrutados retenidos | 10.240 | 5.900 | 6.858 |
| KL media vs profesor FP8 (78 prompts) | 0,0000 | no disponible | 0,0293 (83,48 % top-1) |
| CER/WER agrupado 5 idiomas | no disponible | 14,71 % | 7,19 % (stock) / 8,82 % (VoiceCache) |
| CER chino (zh) | no disponible | 17,9 % (22/123) | 0,8 %–1,6 % (1–2/123) |
| Tasa de error japonés (ja) / coreano (ko) | no disponible | 0,0 % / 7,1 % | 0,0 % / 0,0 %–3,6 % |
| WER inglés (en) | no disponible | 11,1 % (4/36) | 5,6 %–8,3 % (2–3/36) |
| TTFA en streaming (con VoiceCache) | no disponible | 365,9 ms | 292,2 ms (552,6 ms sin caché) |

Los datos provienen de la model card del autor y se basan en 78 prompts multilingües y transcripciones ASR con SenseVoiceSmall. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo es exclusivamente TTS.

## Requisitos de hardware

- **VRAM/memoria estimada**: 13,73 GiB de pesos cargados más 0,304 GiB de workspace en TensorFold; en la práctica, reservar al menos 16–20 GiB de memoria unificada o VRAM para margen de activaciones y caché de audio.
- **GPU recomendadas**: NVIDIA DGX Spark (GB10) con 121,7 GiB de memoria unificada como plataforma de referencia del autor; estaciones con Apple Silicon de alta memoria (M-series con 32 GiB o más) y GPUs CUDA con 24 GiB o más (RTX 4090, A100 40 GB, H100).
- **¿Cabe en consumer GPU?**: sí, en GPUs con 24 GiB o más (RTX 3090, RTX 4090) y en Apple Silicon con memoria unificada suficiente; en GPUs de 16 GiB requeriría gestión cuidadosa de memoria.
- **Opciones de despliegue**: motor TensorFold (`plotarmordev/drama-tensorfold`) con endpoint compatible con OpenAI `/v1/audio/speech`; el parche LRU VoiceCache de 4 ranuras está disponible en el repo `SAA-Media-Avatar-Panel-Jordan`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo TTS con formato INT3 GPTQ específico.
- **Latencia y throughput**: TTFA en streaming de 292,2 ms con VoiceCache y 552,6 ms sin caché, según el autor. No se publica throughput (tokens de audio por segundo) ni latencia de generación completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Tamaño | Notas |
|---|---|---|---|---|---|
| Drama-3-Tier2-5Lang-INT3 (este) | 11.269 M | zh, en, ja, ko, yue | fish-audio-community-license | 13,80 GiB | Derivado comunitario INT3 podado |
| fishaudio/drama-3 (FP8) | no disponible | multilingüe (no detallado) | fish-audio-community-license | 38,63 GiB | Modelo base oficial, mayor footprint |
| Baseline EN-Pruned INT3 (5.900 expertos) | no disponible | en (principalmente) | fish-audio-community-license | 14,50 GiB | Poda solo inglés, peor CER multilingüe |

No se dispone de información sobre otros modelos TTS comparables (p. ej., XTTS, Bark, Fish Speech) en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo linaje Drama 3.

## Limitaciones y advertencias

- **Derivado no oficial**: Fish Audio no ha revisado, patrocinado ni respaldado este checkpoint; es una obra derivada comunitaria.
- **Licencia restrictiva**: la Fish Audio Community License v1.0 puede imponer condiciones para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- **Riesgo de alucinación y errores de pronunciación**: aunque el CER/WER es bajo, persisten errores en frases complejas, especialmente en coreano (hasta 3,6 %) e inglés (hasta 8,3 %).
- **Cobertura limitada a cinco idiomas**: no soporta otros idiomas; el rendimiento fuera de zh, en, ja, ko y yue no está garantizado.
- **Sesgos del dataset base**: no se documentan análisis de sesgos de género, acento o etnia en la voz generada.
- **Dependencia de tooling específico**: requiere el motor TensorFold y el parche VoiceCache para el rendimiento reportado; no es compatible con stacks TTS estándar como Coqui o Bark.
- **Riesgo de uso indebido**: como todo modelo TTS, puede emplearse para suplantación de voz; el autor indica que las voces de la demo son sintéticas y sin metadatos, pero no se detallan mecanismos de marca de agua o detección.
- **Madurez**: el repo tiene 42 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThinkingVibeCoder/Drama-3-Tier2-5Lang-INT3
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Demo interactiva (HF Space): https://huggingface.co/spaces/ThinkingVibeCoder/Drama-3-MMH3-Starter-Demo
- Repo de motor TensorFold: https://github.com/plotarmordev/drama-tensorfold
- Repo de pipeline media/avatar: https://github.com/CharAzinabulu0079/SAA-Media-Avatar-Panel-Jordan
- Repo del cerebro LLM (GB10): https://github.com/CharAzinabulu0079/SAA-Brain-3.8-flash-next-Hibana
- Perfil del autor en X: https://x.com/EricTong610488
- Perfil del autor en Hugging Face: https://huggingface.co/ThinkingVibeCoder
