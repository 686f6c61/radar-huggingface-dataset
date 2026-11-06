# voxor-ai/qnn-encoders

## Resumen

`voxor-ai/qnn-encoders` es una coleccion de binarios de contexto QNN (Qualcomm AI Engine Direct 2.50, backend HTP) que portan los codificadores de audio de varios modelos de reconocimiento automatico del habla (ASR) a la NPU Hexagon de Qualcomm. No es un modelo en si mismo, sino un repositorio de artefactos compilados para acelerar la fase de codificacion de audio de pipelines ASR en dispositivos Snapdragon, manteniendo el decodificador en el host o en otro backend.

El repositorio cubre cinco familias de codificadores: Qwen3-ASR 0.6B y 1.7B, Whisper small, Whisper large-v3-turbo y Cohere Transcribe Arabic. Cada familia incluye variantes por arquitectura Hexagon (`qnn-v69`, `v73`, `v75`, `v79`, `v81`) y, en algunos casos, variantes `fp16` (para HTP de la serie 8 que computan fp16) y `w8a16` (pesos de 8 bits con activaciones de 16 bits, calibradas, para HTP que no computan fp16).

La relevancia actual radica en que permite ejecutar la parte mas costosa computacionalmente de un pipeline ASR (el codificador) en la NPU del movil, reduciendo consumo y latencia frente a CPU/GPU, con ventanas fijas de 30 s y precision verificada frente a los codificadores originales en PyTorch. El repo ocupa 19.6 GB y cada modelo lleva su propia licencia (Apache 2.0, MIT o per-model), por lo que la licencia global se declara como "other / per-model".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificadores de audio (transformer) compilados a binarios QNN HTP; backend Qualcomm AI Engine Direct 2.50 |
| Parametros totales | No disponible (solo se publican los codificadores, no los modelos completos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana fija de 30 s de audio por grafo (3000 frames log-mel) |
| Tipos de cuantizacion | fp16 y w8a16 (pesos 8 bits, activaciones 16 bits, calibrada) segun variante |
| Idiomas soportados | No disponible como lista; evaluado en FLEURS en en, de, ar, hi segun modelo |
| Licencia | `other` / per-model (Apache 2.0 para Qwen3-ASR y Cohere; MIT para Whisper) |
| Formato de pesos | Binarios QNN de contexto (`.bin`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: compila los codificadores de audio de modelos ASR existentes a binarios de contexto para el backend HTP de Qualcomm AI Engine Direct 2.50. Cada binario contiene un unico grafo con ventana fija de 30 s y entradas/salidas de forma `[1, ...]`, en float32 o cuantizadas segun declare el propio binario (los parametros de cuantizacion van embebidos). Se ofrecen variantes por arquitectura Hexagon: `qnn-v69` (Snapdragon 8 Gen 1), `qnn-v73` (8 Gen 2, 7 Gen 4), `qnn-v75` (8 Gen 3), `qnn-v79` (8 Elite) y `qnn-v81` (8 Elite Gen 5).

Las variantes `fp16` estan pensadas para HTP de la serie 8 que computan fp16; las `w8a16` para HTP que no lo hacen. Whisper large-v3-turbo solo tiene variantes v75, v79 y v81 porque su binario necesita mas memoria NPU de la que las generaciones v69 y v73 permiten en un unico grafo. Cohere Transcribe Arabic se divide en tres partes encadenadas (`chunk00`, `chunk01`, `chunk02`) con mascaras de atencion y padding explicitas. La precision se valido comparando la salida fp16 con el codificador fp32 en PyTorch (similitud coseno media 0.9994, minima 0.9885 para Qwen3-ASR 0.6B) y midiendo el impacto en WER/CER sobre FLEURS.

## Capacidades

- Extraccion de caracteristicas de audio (codificador) para pipelines ASR: entrada log-mel de 30 s, salida de embeddings por frame.
- Qwen3-ASR 0.6B: entrada `mel` [1, 128, 3000] y `length` [1] int32; salida [1, 390, 1024].
- Qwen3-ASR 1.7B: misma entrada; salida [1, 390, 2048].
- Whisper small: entrada `mel` [1, 80, 3000]; salida [1, 1500, 768].
- Whisper large-v3-turbo: entrada `mel` [1, 128, 3000]; salida [1, 1500, 1280].
- Cohere Transcribe Arabic: tres grafos encadenados con mascaras `key_mask` y `pad_mask`; salida final [1, 375, 1024].
- No incluye decodificador, tokenizer ni generacion de texto: solo el codificador.
- No soporta tool calling, agentes ni razonamiento multi-paso por si mismo; esas capacidades dependen del modelo ASR completo en el que se integre.
- Capacidades multilingues: heredadas del modelo original; evaluado en FLEURS en en, de, ar, hi (y solo en/de para Whisper).

## Casos de uso

- ASR en movil con bajo consumo: ejecutar el codificador en la NPU Hexagon y el decodificador en CPU/GPU del dispositivo, reduciendo el gasto energetico del pipeline frente a ejecutar todo en CPU.
- Transcripcion offline en apps Android: integrar los binarios `qnn-v73`/`v75` en una app que transcriba audio de 30 s en local sin enviar datos a la nube.
- Subtitulado en tiempo real en dispositivos Snapdragon: usar Whisper small o large-v3-turbo en v75/v79/v81 para generar subtitulos con latencia baja en el propio terminal.
- Procesamiento por lotes en edge: encolar clips de 30 s y ejecutar el codificador en NPU mientras el decodificador procesa la salida, aprovechando la ventana fija.
- Transcripcion de arabe en dispositivos de gama alta: usar Cohere Transcribe Arabic en v73/v75/v79/v81 con cuantizacion w8a16 para reducir memoria.
- Evaluacion y prototipado de pipelines ASR en hardware Qualcomm: comparar variantes fp16 vs w8a16 y medir el impacto en WER antes de desplegar.
- Integracion en sistemas de dictado o notas de voz: usar Qwen3-ASR 0.6B/1.7B como codificador en una app de dictado con contexto de 30 s por utterance.

## Benchmarks y rendimiento

| Modelo / variante | Metrica | Resultado |
|---|---|---|
| Qwen3-ASR 0.6B fp16 | Similitud coseno vs fp32 PyTorch | 0.9994 media, 0.9885 minima |
| Qwen3-ASR 0.6B fp16 | WER/CER en FLEURS (en, de, ar, hi; 240 clips) | -0.37 a +0.39 puntos vs original |
| Qwen3-ASR 0.6B w8a16 | WER/CER en FLEURS | -0.46 a +0.92 puntos vs original |
| Qwen3-ASR 1.7B fp16 | WER/CER en FLEURS (en, de, ar, hi; 240 clips) | -0.27 a +0.33 puntos vs original (58/60 clips en ingles identicos) |
| Whisper small fp16 | WER en FLEURS (en, de; 120 clips) | +0.07 a +0.38 puntos vs fp32 |
| Whisper small w8a16 | WER en FLEURS | +0.30 a +0.36 puntos vs fp32 |
| Whisper large-v3-turbo fp16 | WER en FLEURS (en, de; 120 clips) | -0.14 a +0.00 puntos vs fp32 (58/60 y 57/60 clips identicos) |
| Cohere Transcribe Arabic w8a16 | WER en FLEURS arabe (60 clips) | 4.20 % vs 4.02 % del original |

No se publican datos de latencia ni throughput en la informacion disponible.

## Requisitos de hardware

- NPU Qualcomm Hexagon: obligatoria. Variantes por arquitectura `qnn-v69`, `v73`, `v75`, `v79`, `v81`.
- Snapdragon compatibles: 8 Gen 1 (v69), 8 Gen 2 y 7 Gen 4 (v73), 8 Gen 3 (v75), 8 Elite (v79), 8 Elite Gen 5 (v81).
- Variantes `fp16` solo en HTP de la serie 8 que computan fp16; en el resto usar `w8a16`.
- Whisper large-v3-turbo requiere v75, v79 o v81 por limite de memoria NPU en v69/v73.
- No se especifican requisitos de VRAM ni GPU de escritorio: el destino es la NPU movil.
- Despliegue mediante Qualcomm AI Engine Direct 2.50 (QNN HTP backend); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Repositorio / modelo | Tipo | Cobertura | Licencia | Formato |
|---|---|---|---|---|
| voxor-ai/qnn-encoders | Codificadores ASR para NPU Hexagon | Qwen3-ASR 0.6B/1.7B, Whisper small, Whisper large-v3-turbo, Cohere Transcribe Arabic | Per-model (Apache 2.0 / MIT) | Binarios QNN |
| Codificadores originales en PyTorch (Qwen, OpenAI, Cohere) | Modelos completos ASR | Mismos modelos, sin optimizar para NPU | Apache 2.0 / MIT | safetensors |
| Otros ports QNN de ASR | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre alternativas comparables de codificadores ASR compilados para Hexagon.

## Limitaciones y advertencias

- Solo incluye el codificador; no genera transcripciones por si mismo, requiere el decodificador y tokenizer del modelo original.
- Ventana fija de 30 s por grafo: audios mas largos deben segmentarse.
- Dependencia estricta de la arquitectura Hexagon y de QNN 2.50; no funciona en GPU de escritorio ni en otras NPU.
- Whisper large-v3-turbo no esta disponible para v69 ni v73 por limite de memoria NPU.
- La cuantizacion w8a16 introduce degradacion medible (hasta +0.92 puntos de WER/CER en Qwen3-ASR 0.6B y WER 4.20 % vs 4.02 % en Cohere Arabic).
- Licencia heterogenea: cada directorio lleva su propio `LICENSE` y `NOTICE`; verificar antes de uso comercial.
- No se especifican sesgos ni tasas de alucinacion del codificador; dependen del modelo ASR completo.
- Idiomas soportados no listados de forma explicita; la evaluacion se limita a en, de, ar, hi segun modelo.
- Sin datos publicados de latencia, throughput ni consumo energetico.

## Enlaces

- Hugging Face: https://huggingface.co/voxor-ai/qnn-encoders
- Licencias por modelo: https://huggingface.co/voxor-ai/qnn-encoders/tree/main
- Qwen3-ASR 0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Qwen3-ASR 1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Whisper (OpenAI): https://github.com/openai/whisper
- Cohere Transcribe Arabic: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
