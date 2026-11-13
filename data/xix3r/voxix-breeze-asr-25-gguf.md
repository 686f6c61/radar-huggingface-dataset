# xix3r/voxix-Breeze-ASR-25-gguf

## Resumen

Breeze-ASR-25 es un modelo de reconocimiento automático del habla (ASR) desarrollado por MediaTek Research como un ajuste fino de OpenAI Whisper large-v2. Está optimizado específicamente para mandarín de Taiwán (emitiendo caracteres chinos tradicionales) y para inglés, con soporte explícito para el cambio de código mandarín-inglés tanto intra como interoracional. La ficha que nos ocupa documenta las conversiones a formato GGUF realizadas por el usuario xix3r para su uso con transcribe.cpp, una implementación en C++ orientada a inferencia local eficiente.

El modelo resuelve un problema concreto: Whisper large-v2 original no está optimizado para mandarín tradicional ni para contextos de code-switching, y tiende a producir caracteres simplificados y errores en la alineación temporal. Breeze-ASR-25 corrige esto mediante un entrenamiento adicional sobre aproximadamente 11.749 horas de audio, incluyendo 10.000 horas de mandarín sintético, 1.738 horas de inglés de CommonVoice17 y 11 horas de code-switching real del corpus NTUML2021.

Arquitectónicamente es idéntico a Whisper large-v2: un transformer encoder-decoder con ventanas de 30 segundos y decodificación fragmentada para audio largo. Con 1.543.321.440 parámetros totales, las cuantizaciones GGUF permiten reducir el peso desde 3,10 GB en BF16 hasta 997 MB en Q4_K_M sin degradación medible en las métricas de error, lo que lo hace viable para despliegue en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2) |
| Parámetros totales | 1.543.321.440 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 30 segundos con decodificación fragmentada para audio largo |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh (mandarín de Taiwán, salida en tradicional), en; tokenizer heredado de 99 idiomas pero solo zh/en optimizados y validados |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Whisper large-v2, manteniendo la arquitectura transformer encoder-decoder original con ventanas de entrada de 30 segundos y decodificación por fragmentos para audio de larga duración. Conserva el tokenizer multilingüe de Whisper con 99 idiomas, aunque el ajuste se centra exclusivamente en mandarín e inglés. El entrenamiento se realizó sobre aproximadamente 11.749 horas de audio: 10.000 horas de mandarín sintético (ODC Synth), 1.738 horas de inglés (CommonVoice17) y 11 horas de code-switching real (NTUML2021). No se documenta en la información disponible el uso de RLHF o DPO.

La innovación principal respecto al modelo base es la optimización para mandarín tradicional y para contextos de cambio de código intra e interoracional, además de una mejora en la alineación de timestamps orientada a la generación automática de subtítulos. Las conversiones GGUF para transcribe.cpp fueron validadas contra la referencia de transformers en el commit 3848875 de transcribe.cpp, portadas desde el commit cffe7cc del modelo original (fijado el 2026-06-29). El modelo soporta detección de idioma, traducción y timestamps a nivel de segmento, pero no soporta streaming.

## Capacidades

- Transcripción de voz a texto en mandarín de Taiwán (salida en chino tradicional) e inglés.
- Reconocimiento de code-switching mandarín-inglés, tanto dentro de una misma oración como entre oraciones.
- Detección automática de idioma (`lang_detect: true`).
- Traducción (`translate: true`).
- Generación de timestamps a nivel de segmento, adecuada para subtitulado automático.
- Procesamiento de audio largo mediante decodificación fragmentada de ventanas de 30 segundos.
- No soporta streaming (`streaming: false`).
- No dispone de tool calling ni capacidades de agente (es un modelo ASR puro).

## Casos de uso

- Subtitulado automático de contenido audiovisual en mandarín tradicional: el modelo genera timestamps a nivel de segmento y emite caracteres tradicionales directamente, lo que elimina la necesidad de conversión posterior con OpenCC para audiencias de Taiwán, Hong Kong o comunidades que usan tradicional.
- Transcripción de reuniones bilingües mandarín-inglés: el soporte de code-switching intra e interoracional permite manejar conversaciones donde los hablantes alternan idiomas sin necesidad de segmentar manualmente el audio por idioma.
- Generación de actas y notas en entornos corporativos taiwaneses: con cuantización Q4_K_M (997 MB) puede desplegarse en portátiles convencionales, facilitando la transcripción local sin enviar audio sensible a servicios en la nube.
- Investigación lingüística sobre code-switching: las 11 horas de NTUML2021 usadas en el ajuste hacen del modelo una herramienta adecuada para estudiar patrones de cambio de código en habla real.
- Integración en pipelines de accesibilidad: transcripción en tiempo casi real (no streaming) de vídeos y pódcasts para generar subtítulos en chino tradicional e inglés.
- Despliegue en dispositivos de borde: el formato GGUF y las tasas de tiempo real medidas (RTF 0,96 en CPU Ryzen 4750U con Vulkan 2,02, y RTF 22,29 con Metal en M4 Max) permiten inferencia local en hardware de consumo sin GPU dedicada de gama alta.
- Preprocesamiento de datos de voz para entrenamiento de otros modelos: transcripción masiva de corpus de audio en mandarín e inglés con buena fidelidad (WER 2,27% en LibriSpeech test-clean con Q8_0).

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---|---|---|---|---|
| WER LibriSpeech test-clean (en) | 2,29% | 2,29% | 2,27% | 2,29% | 2,25% | 2,26% |
| CER FLEURS zh (OpenCC t2s) | 8,12% | 8,11% | 8,10% | 8,12% | 8,12% | 8,08% |
| WER FLEURS en | no disponible | no disponible | 4,14% | no disponible | no disponible | no disponible |

| Métrica de rendimiento | Plataforma | Valor |
|---|---|---|
| RTF (CPU) | Apple M4 Max | 3,75 |
| RTF (Metal) | Apple M4 Max | 22,29 |
| RTF (CPU) | AMD Ryzen 4750U | 0,96 |
| RTF (Vulkan) | AMD Ryzen 4750U | 2,02 |

Los benchmarks de WER en LibriSpeech test-clean se calcularon sobre las 2.620 utterances completas, batch size 1, con timestamps a nivel de segmento y la receta por defecto de transcribe.cpp (greedy con fallback de temperatura y suppress_tokens) sobre una GPU Modal L40S. El CER en FLEURS zh se calculó tras plegar hipótesis y referencia a simplificado con OpenCC (`t2s`), dado que Breeze emite tradicional y FLEURS no dispone de split en tradicional; sin ese plegado el CER bruto es de aproximadamente 35% y carece de significado. La cuantización no degrada de forma medible el rendimiento: todas las cuantizaciones hasta Q4_K_M se mantienen dentro del ruido entre ejecuciones respecto a BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en Q4_K_M, 1,16 GB en Q5_K_M, 1,30 GB en Q6_K, 1,67 GB en Q8_0 y 3,10 GB en BF16/F16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; L40S validada para benchmarks; Metal en Apple Silicon (M4 Max medido).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF de 3,75 en CPU M4 Max, 22,29 con Metal en M4 Max, 0,96 en CPU Ryzen 4750U y 2,02 con Vulkan en Ryzen 4750U. Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas ASR | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|---|
| Breeze-ASR-25 (este) | 1.543 M | Ventanas 30 s | zh (tradicional), en | 2,27% (Q8_0) | Apache-2.0 | GGUF |
| Whisper large-v2 | 1.550 M | Ventanas 30 s | 99 (multilingüe) | ~2,7% (referencia pública) | MIT | Safetensors, GGUF, etc. |
| Whisper large-v3 | 1.550 M | Ventanas 30 s | 99 (multilingüe) | ~1,8% (referencia pública) | MIT | Safetensors, GGUF, etc. |

La comparación con Whisper large-v2 y large-v3 se basa en datos públicos ampliamente conocidos de OpenAI; los valores de WER de esos modelos no se han verificado en la información proporcionada y deben tomarse como referencia orientativa. La ventaja diferencial de Breeze-ASR-25 no es el rendimiento bruto en inglés, sino la calidad en mandarín tradicional y code-switching, áreas donde Whisper original rinde peor. No se dispone de comparativas directas con otros modelos ASR específicos para mandarín en la información disponible.

## Limitaciones y advertencias

- Solo mandarín e inglés están optimizados y validados; aunque el tokenizer hereda 99 idiomas, el rendimiento en otros idiomas queda fuera del alcance del modelo y no está garantizado.
- Emite caracteres chinos tradicionales; para aplicaciones que requieran simplificado es necesario un paso de conversión (por ejemplo, OpenCC).
- No soporta streaming, lo que limita su uso en aplicaciones de transcripción en vivo con latencia estricta.
- No se han documentado sesgos específicos en la información disponible, pero al derivar de Whisper large-v2 y entrenarse con datos sintéticos (ODC Synth) y CommonVoice, puede heredar sesgos de esos corpus.
- Riesgo de alucinación inherente a los modelos Whisper: en segmentos con silencio, ruido o audio de baja calidad puede generar texto inventado; se recomienda validación en producción.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y del corpus NTUML2021 para confirmar compatibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y poco validada por la comunidad.
- El tamaño del repo (11,3 GB) incluye todas las cuantizaciones; para descargar solo una variante conviene usar el enlace directo al archivo GGUF.

## Enlaces

- Repositorio Hugging Face de la conversión GGUF: https://huggingface.co/xix3r/voxix-Breeze-ASR-25-gguf
- Modelo base original: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación de modelos Whisper en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper.md
- Repositorio GitHub de Breeze-ASR-25: https://github.com/mtkresearch/Breeze-ASR-25
- Paper de Breeze-ASR-25: https://arxiv.org/pdf/2506.11130
- Commit del modelo base referenciado: https://huggingface.co/MediaTek-Research/Breeze-ASR-25/commit/cffe7cc
- Commit de transcribe.cpp usado para validación: https://github.com/handy-computer/transcribe.cpp/tree/3848875
- Conversión GGUF de referencia (handy-computer): https://huggingface.co/handy-computer/Breeze-ASR-25-gguf
