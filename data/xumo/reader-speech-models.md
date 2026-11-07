# xumo/reader-speech-models

## Resumen

`xumo/reader-speech-models` es un repositorio de artefactos en formato GGUF publicados por el usuario xumo bajo licencia Apache-2.0. No se trata de un modelo entrenado de nuevo, sino de una conversión y empaquetado de cuatro modelos de la familia Qwen3 orientados al habla: dos modelos de reconocimiento automático del habla (ASR) de 0,6B y 1,7B, un alineador forzado de 0,6B y un modelo de síntesis de voz (TTS) de 0,6B. El autor lo denomina "Reader-converted artifacts" y advierte explícitamente de que no es una publicación oficial de Qwen.

El repositorio resuelve un problema de despliegue: ofrece pesos ya convertidos a GGUF (F16, Q8_0 y Q4_K_M) junto con proyectores multimodales compatibles con el runtime Reader, además de ficheros de bloqueo (`models.lock.json`, `conversion.lock.json`, `rebuild.json`) que fijan hashes SHA-256 y revisiones exactas de las fuentes. Esto permite reproducibilidad y verificación de integridad, algo relevante cuando se empaquetan pesos de terceros.

La relevancia es acotada: el paquete está pensado para el runtime propietario Reader, validado únicamente en Linux x64 con una GTX 1080 Ti (CUDA SM61) y con síntesis verificada solo para inglés y chino. El tamaño del repo es de 13,2 GB y el modelo base principal declarado tiene 602.341.376 parámetros. No hay pipeline declarado ni métricas de benchmarks publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-ASR / Qwen3-ForcedAligner / Qwen3-TTS (detalles de arquitectura interna no disponibles); conversión a GGUF |
| Parametros totales | 602.341.376 (modelo base principal, dato safetensors); el repo incluye además un ASR de 1,7B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | Síntesis validada para inglés y chino; el resto de idiomas upstream no se reclaman en esta release |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto GGUF + proyectores mmproj) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrupa conversiones a GGUF de cuatro artefactos de Qwen fijados a la revisión `5d83992436eae1d760afd27aff78a71d676296fc`. La conversión se realizó con el convertidor de `ggml-org/llama.cpp` en el commit `67107ac34f62882d8b53ea41ad68010ea635b9be`, y la cuantización (ASR 1.7B F16 a Q8_0/Q4_K_M y alineador F16 a Q8_0) se hizo con `llama-quantize` compilado desde ese mismo commit, con cuatro hilos.

Los artefactos incluidos son: `asr-0.6b-f16`, `asr-1.7b-f16`, `asr-1.7b-q4-k-m`, `asr-1.7b-q8-0`, `aligner-q8-0`, tres proyectores `mmproj-*-reader-compat` (para ASR 0.6B, ASR 1.7B y alineador forzado), `qwen3-tts-0.6b-base-f16` y dos WAV sintéticos de referencia (`synthetic-heart`, `synthetic-george`) generados con Kokoro-82M. Los proyectores requieren un adaptador de compatibilidad de encoder/alineador propio de Reader y no son intercambiables con los proyectores upstream.

La innovación técnica destacable no está en el modelo sino en el empaquetado reproducible: recetas de conversión con versiones de Python y paquetes bloqueadas, parches (`legacy-asr-conversion.patch`), comprobación de hashes de los ocho artefactos frente a sus valores aceptados y conversión CPU-only con OMP/MKL/OpenBLAS a 4 hilos en modo HF offline. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) en dos tamaños: 0,6B y 1,7B.
- Alineación forzada (forced alignment) de audio y transcripción mediante `Qwen3-ForcedAligner-0.6B`.
- Síntesis de voz (TTS) con `Qwen3-TTS-12Hz-0.6B-Base`, que incluye talker y proyector/codec en el par GGUF.
- Condicionamiento de hablante mediante WAV de referencia (los artefactos `synthetic-heart` y `synthetic-george`).
- Soporte multilingüe limitado: validación declarada solo para inglés y chino en síntesis.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni modo thinking.
- Compatibilidad con endpoints declarada en los tags del repositorio.

## Casos de uso

- Transcripción de reuniones y notas de voz: el ASR de 0,6B en F16 permite transcripción local en hardware modesto, y la variante 1,7B en Q4_K_M o Q8_0 ofrece mayor calidad cuando hay margen de VRAM.
- Subtitulado con marcas de tiempo: el alineador forzado de 0,6B en Q8_0 permite sincronizar una transcripción existente con el audio para generar subtítulos alineados.
- Generación de voz para audiolibros o avisos: el TTS de 0,6B en F16, con WAV de referencia para el timbre, permite sintetizar locuciones en inglés o chino.
- Preprocesado de datasets de audio: el pipeline ASR + alineador puede usarse para etiquetar y segmentar corpus de audio antes de entrenar otros modelos.
- Asistentes de voz embebidos: al ser GGUF y ejecutable en CPU o GPU consumer, el ASR de 0,6B encaja en prototipos de dictado o comandos por voz en local.
- Verificación de integridad en cadena de suministro: los ficheros de bloqueo con SHA-256 permiten auditar que los pesos desplegados coinciden con la conversión aceptada, útil en entornos con requisitos de trazabilidad.
- Evaluación comparativa de cuantizaciones: disponer de F16, Q8_0 y Q4_K_M del mismo ASR 1,7B facilita medir la degradación de precisión frente a tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER, MOS ni métricas de latencia o throughput; solo declara validación funcional del host (Linux x64, GTX 1080 Ti, CUDA SM61) y de la síntesis en inglés y chino.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño de pesos, un modelo de 0,6B en F16 ocupa aproximadamente 1,2 GB y en Q8_0 alrededor de 0,6 GB; un modelo de 1,7B en F16 ronda los 3,4 GB, en Q8_0 unos 1,8 GB y en Q4_K_M cerca de 1 GB. Estas cifras son estimaciones por parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponibles. El único host validado es una GTX 1080 Ti (CUDA SM61).
- GPU consumer: por tamaño, los artefactos de 0,6B y el ASR 1,7B cuantizado deberían caber en GPU consumer con 8 GB o más, pero no hay confirmación del autor.
- Despliegue: el paquete está diseñado para el runtime Reader con la revisión upstream bloqueada; los GGUF de texto son compatibles con el ecosistema llama.cpp, pero los proyectores `reader-compat` requieren el adaptador de Reader y no son intercambiables con los upstream. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp estándar para el conjunto completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| xumo/reader-speech-models | 0,6B y 1,7B (ASR), 0,6B (FA y TTS) | no disponible | GGUF | Apache-2.0 | Paquete de conversión para runtime Reader, sin benchmarks publicados |
| Qwen/Qwen3-ASR-0.6B | 0,6B | no disponible | safetensors (upstream) | Apache-2.0 | Fuente oficial del ASR pequeño |
| Qwen/Qwen3-ASR-1.7B | 1,7B | no disponible | safetensors (upstream) | Apache-2.0 | Fuente oficial del ASR grande |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | safetensors (upstream) | Apache-2.0 | Fuente oficial del TTS |

La comparación relevante es contra los modelos upstream de Qwen, de los que este repositorio es una conversión. No se dispone de datos de rendimiento para establecer diferencias de calidad entre los GGUF y los pesos originales.

## Limitaciones y advertencias

- No es una release oficial de Qwen; el autor lo indica expresamente. La responsabilidad de validación recae en quien despliega.
- Los proyectores `mmproj-*-reader-compat` solo funcionan con el adaptador de compatibilidad de Reader; los proyectores upstream no son intercambiables.
- Idiomas: la síntesis solo está validada para inglés y chino; el resto de idiomas upstream no se reclaman.
- Host validado único: Linux x64 con GTX 1080 Ti (CUDA SM61). Otros entornos no están verificados.
- Sin benchmarks publicados: no hay evidencia de WER, MOS ni degradación por cuantización.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que reduce la superficie de validación por terceros.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse por separado en los modelos Qwen subyacentes.
- Los WAV sintéticos son recursos de referencia de hablante, no pesos ni grabaciones de usuarios; regenerarlos produce activos distintos y puede romper el condicionamiento aceptado.
- La licencia Apache-2.0 cubre los pesos, pero el código del convertidor está bajo `LICENSE.llama.cpp` de forma separada.
- Fijar siempre el commit completo de publicación y verificar los SHA-256 contra `models.lock.json`; no usar la rama `main` móvil.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xumo/reader-speech-models
- Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Qwen3-ForcedAligner-0.6B: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Qwen3-TTS-12Hz-0.6B-Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Kokoro-82M v1.0 ONNX (fuente de los WAV de referencia): https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Convertidor llama.cpp (commit fijado): https://github.com/ggml-org/llama.cpp/blob/67107ac34f62882d8b53ea41ad68010ea635b9be/convert_hf_to_gguf.py
