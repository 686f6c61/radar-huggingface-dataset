# TypeWhisper/Rumble-2-Flash-sherpa-onnx-int8

## Resumen

Rumble-2-Flash (sherpa-onnx, INT8) es una versión cuantizada y exportada del modelo de reconocimiento automático del habla Reson8/Rumble-2-Flash, publicada por TypeWhisper. Se trata de un modelo de 0,5B parámetros construido sobre la arquitectura Qwen3-ASR, con un decodificador de texto de 14 capas y un vocabulario de 99.630 tokens. El paquete está pensado para ejecutarse en CPU sin necesidad de Python en tiempo de ejecución, empleando la librería sherpa-onnx.

El modelo resuelve el problema del despliegue de ASR en entornos con recursos limitados: al estar exportado a ONNX con cuantización INT8 dinámica en encoder y decoder, reduce el peso y la memoria necesarios frente a la versión BF16 original, manteniendo una precisión competitiva. Según los datos del autor, alcanza un WER del 7,4 % en el benchmark TypeWhisper (20 suites en siete idiomas), frente al 9,8 % del Qwen3-ASR 0.6B INT8 de referencia.

Es relevante ahora porque ofrece una alternativa ligera, con licencia Apache 2.0 y soporte multilingüe amplio (más de 30 idiomas declarados), orientada a aplicaciones de dictado y transcripción en escritorio, como el plugin Qwen3 ASR (Local) de TypeWhisper para Windows.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder convolucional de audio + decoder transformer de 14 capas) |
| Parametros totales | 0,5B (según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica en encoder y decoder; frontend convolucional en FP32 |
| Idiomas soportados | en, de, fr, es, it, pt, nl, ru, zh, ja, ko, ar, hi, tr, pl, sv, da, fi, cs, el, ro, hu, id, vi, th, ms, fa, mk |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (conv_frontend.onnx, encoder.int8.onnx, decoder.int8.onnx) + tokenizer (vocab.json, merges.txt, tokenizer_config.json) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-ASR: un frontend convolucional que procesa el audio de entrada, un encoder de audio y un decodificador de texto autorregresivo con caché KV de 14 capas y vocabulario de 99.630 tokens. La conversión partió del checkpoint BF16 de Reson8/Rumble-2-Flash en la revisión `a0c34287229103b706c670d70791683e34379732`, con el layout de transformers 5, cuyos pesos se renombraron al layout original de Qwen3-ASR (`thinker.audio_tower.*` con `proj1`/`proj2`, `thinker.model.*`, `thinker.lm_head.weight` a partir de los embeddings atados) y un `config.json` de Qwen3-ASR 0.6B adaptado al número de capas, tamaño de vocabulario e ids de tokens de audio de Rumble.

La exportación la realizó la herramienta Wasser1462/Qwen3-ASR-onnx (commit `0829a57`) con transformers 4.57.6 y torch 2.8.0, usando `--device cpu --max-total-len 512 --verify` y cuantización INT8 dinámica de encoder y decoder. No se detallan en la información disponible los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO). La model card sí menciona que el modelo fue entrenado con tokens de control como `<digits>` al inicio del system prompt, que sherpa-onnx no interpreta como especiales.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) sobre audio mono float32 a 16 kHz.
- Detección automática de idioma si no se especifica el parámetro `language`; también permite forzar el idioma (por ejemplo, `"German"`).
- Soporte multilingüe declarado para más de 30 idiomas, entre ellos inglés, alemán, francés, español, italiano, portugués, ruso, chino, japonés, coreano, árabe, hindi, turco, polaco, sueco, danés, finés, checo, griego, rumano, húngaro, indonesio, vietnamita, tailandés, malayo, persa y macedonio.
- Ejecución en CPU sin Python en tiempo de ejecución mediante sherpa-onnx.
- No se documentan capacidades de tool calling, agentes, visión, audio de salida ni modo thinking en la información disponible.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: el modelo puede integrarse como motor ASR local en herramientas de transcripción, como hace el plugin Qwen3 ASR (Local) de TypeWhisper para Windows, con detección automática de idioma y bajo consumo de memoria (2,1 GB de pico).
- Transcripción de reuniones y notas de voz en CPU: con un factor de tiempo real de 0,051 en 4 hilos de CPU, puede transcribir audio más rápido que tiempo real sin GPU dedicada.
- Subtitulado y generación de transcripciones multilingües: al cubrir más de 30 idiomas, sirve para pipelines de subtitulado en varios idiomas con un único modelo.
- Asistentes de voz en dispositivos sin GPU: al ejecutarse vía sherpa-onnx en CPU, es adecuado para portátiles, mini-PC y entornos de borde donde no hay acelerador.
- Procesamiento por lotes de archivos de audio: la API de sherpa-onnx permite crear streams y decodificar secuencialmente, útil para transcripciones masivas en servidores sin GPU.
- Aplicaciones de accesibilidad: conversión de voz a texto en tiempo real para personas con dificultades de escritura, con latencia baja gracias al RTF de 0,051.
- Integración en aplicaciones C++/C sin dependencia de Python: el formato ONNX y la librería sherpa-onnx permiten incrustar el reconocedor en aplicaciones nativas.

## Benchmarks y rendimiento

Datos del benchmark TypeWhisper (20 suites en inglés, alemán, francés, español, italiano, portugués y ruso), con sherpa-onnx 2.0.1 en 4 hilos de CPU de un Mac mini:

| Modelo | WER | Real-time factor | Memoria pico |
|---|---:|---:|---:|
| Rumble-2-Flash INT8 (este repositorio) | 7,4 % | 0,051 | 2,1 GB |
| Qwen3-ASR 0.6B INT8 (release de sherpa-onnx) | 9,8 % | 0,079 | 2,8 GB |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM: no aplica para GPU; el modelo está pensado para CPU. Memoria pico medida de 2,1 GB en el benchmark del autor.
- GPU recomendadas: no disponibles; el build es de CPU. No se documenta soporte GPU para esta exportación.
- Cabe en CPU consumer: sí, con 2,1 GB de memoria pico y RTF de 0,051 en 4 hilos de un Mac mini. No se especifican requisitos mínimos de CPU.
- Opciones de despliegue: sherpa-onnx 1.13.4 o superior (API `OfflineRecognizer.from_qwen3_asr`), con ejecución en CPU y sin Python en runtime.
- Latencia y throughput: RTF de 0,051 en 4 hilos de CPU (aproximadamente 20 veces más rápido que tiempo real en esa configuración); no se publican cifras de throughput en horas de audio por hora.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (TypeWhisper) | RTF | Memoria pico | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Rumble-2-Flash INT8 (este repo) | 0,5B | no disponible | 7,4 % | 0,051 | 2,1 GB | Apache 2.0 | ONNX INT8 (sherpa-onnx) |
| Qwen3-ASR 0.6B INT8 (sherpa-onnx) | 0,6B | no disponible | 9,8 % | 0,079 | 2,8 GB | no disponible | ONNX INT8 (sherpa-onnx) |
| Rumble-2-Flash (BF16 original) | 0,5B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | safetensors (BF16) |

No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se han publicado métricas de precisión en siete idiomas (inglés, alemán, francés, español, italiano, portugués y ruso), aunque el modelo declara más de 30; el rendimiento en el resto no está documentado.
- Los tokens de control como `<digits>` usados en el entrenamiento no deben pasarse como hotwords en sherpa-onnx, porque solo se tratan como especiales los tokens con formato `<|...|>` y se dividirían en texto.
- Requiere sherpa-onnx 1.13.4 o superior; versiones anteriores no soportan `from_qwen3_asr`.
- El modelo es solo ASR: no genera texto libre, no hace tool calling ni razonamiento multi-step.
- No se documentan sesgos conocidos ni tasas de alucinación específicas; como todo modelo ASR, puede producir transcripciones incorrectas en audio ruidoso o con acentos no representados en el benchmark.
- Licencia Apache 2.0, que permite uso comercial; la licencia del modelo base está incluida en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un build reciente (creado el 18 de noviembre de 2026) sin validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/TypeWhisper/Rumble-2-Flash-sherpa-onnx-int8
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- Licencia del modelo base: https://huggingface.co/Reson8/Rumble-2-Flash/blob/main/LICENSE
- Exportador Qwen3-ASR-onnx: https://github.com/Wasser1462/Qwen3-ASR-onnx
- Benchmark TypeWhisper: https://github.com/TypeWhisper/typewhisper-benchmark
- TypeWhisper para Windows: https://www.typewhisper.com
