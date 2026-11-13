# swaynehales/granite-speech-5.0-470m-turboctc-coreml-4bit

## Resumen

Granite Speech 5.0 470M TurboCTC CoreML 4-bit es una conversión no oficial del modelo de reconocimiento automático de voz `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, publicada por el usuario swaynehales. El objetivo es ejecutar reconocimiento de voz multilingüe directamente en Macs con Apple Silicon mediante Core ML, sin depender de servidores externos ni de frameworks de Python en tiempo de inferencia. Frente al modelo original, cambia el formato (programa Core ML de forma fija), reduce la precisión de los pesos a 4 bits y ajusta un parámetro del tokenizer.

El modelo base es un CTC de 470M parámetros con 16 bloques conformer y una cabeza BPE multilingüe de 16.384 tokens, publicado por IBM en octubre de 2026 con soporte para inglés, francés, alemán, español, portugués, italiano y japonés, con puntuación y capitalización nativas. La conversión mantiene la licencia Apache 2.0 del original y declara explícitamente que sacrifica precisión a cambio de tamaño: el paquete ocupa 0,3 GB y está pensado para escenarios donde el espacio o la memoria pesan más que la exactitud.

La relevancia de esta ficha está en que documenta una alternativa de despliegue en dispositivo (on-device) para ASR multilingüe, con métricas de degradación publicadas por el autor y una advertencia clara de que la variante de 8 bits es preferible salvo que el tamaño sea crítico. No es un modelo nuevo de IBM, sino un artefacto derivado que conviene evaluar con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer CTC (16 bloques), conversión a Core ML ML Program |
| Parámetros totales | 470M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 frames de features (327,68 s de audio a 50 frames/s) |
| Tipos de cuantización | 4-bit lineal simétrica, per-block, block size 32, weight threshold 2048; activaciones fp16 |
| Idiomas soportados | multilingüe: en, fr, de, es, pt, it, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base, según la model card del autor, consta de 16 bloques conformer entrenados con CTC, una cabeza BPE multilingüe de 16.384 tokens, subsampling temporal de 8× (de 100 Hz a 12,5 Hz), atención por bloques sobre 128 frames y CTC auto-condicionado desde la capa intermedia. La conversión a Core ML genera un programa de forma fija (`GraniteSpeech.mlpackage`, macOS 15 mínimo) que recibe `features` float16 con forma `[1, 16384, 320]` (log-mel más delta, frame-stacked, zero-padded) y devuelve `frame_ids` int32 con forma `[1, 4096]` (argmax CTC por frame de salida de 80 ms, calculado dentro del grafo).

El frontend de features no está incluido en el grafo: debe calcularse con el processor de Hugging Face en Python o con `GraniteFeatureExtractor` de Granite-MLX en Swift. La conversión se realizó con los scripts sin modificar de Granite-MLX (commit `7ad6b19c`), usando coremltools 9.0 y torch 2.7.0. La cuantización a 4 bits se aplicó después del programa fp16 con `quantize_granite_coreml.py --method linear --bits 4 --granularity per-block --block-size 32 --weight-threshold 2048`. No se dispone de información sobre el dataset de entrenamiento, número de tokens ni si hubo RLHF/DPO en la información proporcionada; la model card remite a la ficha de IBM para esos detalles.

## Capacidades

- Reconocimiento automático de voz multilingüe en siete idiomas: inglés, francés, alemán, español, portugués, italiano y japonés.
- Puntuación y capitalización nativas en la salida (según la release multilingüe del 21 de octubre de 2026).
- Salida CTC a nivel de frame con argmax dentro del grafo, lo que simplifica el postproceso.
- Ejecución on-device en Apple Silicon mediante Core ML, con unidades de cómputo recomendadas CPU+GPU.
- Procesamiento de audio largo: hasta 327,68 s por ventana de entrada (16.384 frames a 50 frames/s).
- Integración con Granite-MLX mediante `coreml_config.json` para el reconocedor Core ML.
- No se documenta soporte de tool calling, function calling, agentes ni visión/audio más allá del ASR.

## Casos de uso

- Transcripción on-device en Macs: el modelo permite dictado y transcripción local sin enviar audio a la nube, usando Core ML en Apple Silicon y el frontend de features en Swift o Python.
- Subtitulado de reuniones y vídeos: con ventanas de hasta 327,68 s, se pueden transcribir segmentos largos por bloques y concatenar resultados con puntuación nativa.
- Aplicaciones de accesibilidad: dictado por voz integrado en apps de macOS para usuarios con movilidad reducida, con latencia local y sin dependencia de red.
- Procesamiento por lotes de audio multilingüe: transcripción de archivos en inglés, francés, alemán, español, portugués, italiano y japonês en pipelines locales de investigación.
- Prototipado de ASR en Swift: integración con Granite-MLX para validar reconocedores Core ML antes de pasar a variantes de mayor precisión.
- Escenarios con restricciones de tamaño: despliegue en entornos donde el paquete de 0,3 GB es el límite y la precisión puede sacrificarse, aceptando la degradación documentada (especialmente en portugués).
- Evaluación comparativa de cuantización: uso como referencia para medir el impacto de 4 bits frente a 8 bits y fp16 en tareas ASR multilingües.

## Benchmarks y rendimiento

El autor publica diferencias porcentuales normalizadas (menor es mejor) medidas con Granite-MLX Swift CLI. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni benchmarks estándar de ASR como WER absoluto; los datos son diferencias relativas frente a referencias del propio autor.

| Conjunto (clips) | vs Core ML fp16 | vs Core ML 8-bit | vs inferencia oficial IBM |
|---|---:|---:|---:|
| LibriSpeech en (73) | 0,77 | 0,77 | 0,94 |
| FLEURS fr (10) | 2,33 | 2,66 | 3,67 |
| FLEURS de (10) | 0,41 | 0,41 | 0,41 |
| FLEURS es (10) | 0,86 | 0,86 | 0,43 |
| FLEURS pt (10) | 7,31 | 6,95 | 6,20 |
| FLEURS it (10) | 1,28 | 1,70 | 1,28 |
| FLEURS ja (10, CER) | 2,27 | 2,27 | 2,27 |
| Audio largo (5 clips) | 1,69 (vs referencia chunked no-mask) | 1,66 | no disponible |

Los conjuntos FLEURS tienen solo 10 clips cada uno, por lo que la variabilidad es alta. El autor indica que el 4-bit no es más rápido que el 8-bit en sus mediciones y que el coste en precisión es varias veces mayor, con el peor caso en portugués (7,31 % frente a fp16).

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 0,3 GB; el modelo cuantizado a 4 bits requiere aproximadamente esa cantidad de memoria para pesos, más activaciones fp16 y features de entrada `[1, 16384, 320]` float16 (unos 10,5 MB por ventana).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con Core ML; unidades de cómputo recomendadas CPU+GPU. La colocación en Neural Engine no fue medida por el autor.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no se documenta soporte para GPU NVIDIA/AMD en este paquete Core ML.
- Opciones de despliegue: Core ML (`GraniteSpeech.mlpackage`, macOS 15 mínimo) con Granite-MLX Swift CLI o integración directa; el frontend de features requiere el processor de Hugging Face (Python) o `GraniteFeatureExtractor` (Swift). No se documenta vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles; el autor solo indica que el 4-bit no es más rápido que el 8-bit en sus mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| swaynehales/granite-speech-5.0-470m-turboctc-coreml-4bit | 470M | 16.384 frames (327,68 s) | en, fr, de, es, pt, it, ja | Apache 2.0 | Core ML 4-bit | Peor precisión que 8-bit; mismo tamaño de paquete que la variante 8-bit según el autor |
| swaynehales/granite-speech-5.0-470m-turboctc-coreml-8bit | 470M | 16.384 frames | en, fr, de, es, pt, it, ja | Apache 2.0 | Core ML 8-bit | Recomendado por el autor salvo restricción de tamaño |
| ibm-granite/granite-speech-5.0-470m-turboctc | 470M | no disponible | en, fr, de, es, pt, it, ja | Apache 2.0 | pesos originales (no Core ML) | Modelo base oficial de IBM |
| ibm-granite/granite-speech-5.0-470m-turboctc-nc | 470M | no disponible | en | CC-BY-NC-SA-4.0 | pesos originales | Modelo distinto, solo inglés, no usado en esta conversión |

## Limitaciones y advertencias

- El 4-bit degrada la precisión frente a fp16 y 8-bit; el autor no declara ninguna puerta de exactitud y el peor caso documentado es portugués (7,31 % frente a fp16).
- El 4-bit no es más rápido que el 8-bit según las mediciones del autor, por lo que la única ventaja real es el tamaño, y el propio autor indica que prefiere el paquete de 8 bits salvo que el tamaño importe más.
- La conversión es no oficial: IBM no ha revisado ni respaldado este artefacto.
- El formato Core ML de forma fija no usa máscara de atención y se comporta de forma ligeramente distinta a la inferencia oficial de IBM.
- El frontend de features no está en el grafo: hay que calcularlo aparte con Hugging Face (Python) o GraniteFeatureExtractor (Swift), lo que añade dependencias.
- Requiere macOS 15 mínimo y Apple Silicon; no hay soporte documentado para otras plataformas.
- Los conjuntos de evaluación FLEURS tienen solo 10 clips, por lo que las métricas son poco robustas.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada; al ser un CTC de ASR, el riesgo principal es error de transcripción, no generación libre.
- Licencia Apache 2.0 permite uso comercial, pero exige incluir copia de la licencia y aviso de cambios; el repo incluye `LICENSE` y `MODIFICATIONS.md`.
- No confundir con `granite-speech-5.0-470m-turboctc-nc`, que es otro modelo (solo inglés, CC-BY-NC-SA-4.0) y no se usó aquí.

## Enlaces

- Hugging Face: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-coreml-4bit
- Variante 8-bit: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-coreml-8bit
- Modelo base IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/91dcb0605daf65f88dbb04fef015c423241d941d
- Model card del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/blob/91dcb0605daf65f88dbb04fef015c423241d941d/README.md
- Granite-MLX (herramientas de conversión): https://github.com/kylehowells/Granite-MLX
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
