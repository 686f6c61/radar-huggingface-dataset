# Vagabond404/khmer-whisper-small-sota

## Resumen

khmer-whisper-small-sota es un modelo de reconocimiento automático del habla (ASR) para jemer (khmer) desarrollado por el usuario Vagabond404. Se construye sobre el backbone openai/whisper-small, un transformer encoder-decoder de aproximadamente 242 millones de parámetros, y sustituye el tokenizador original por un tokenizador BPE específico para jemer denominado K-Token KCC & RAC, que según el autor reduce el número de tokens un 79,2 % y elimina los glifos rotos en la tokenización.

El modelo se presenta como una edición "SOTA" entrenada sobre el dataset rinabuoy/khmer-speech-dataset, con un progreso declarado de 653 de 653 shards (el 100 % de 728 horas de audio) y unos resultados de validación de 1,02 % de CER y 22,27 % de WER. Está pensado para despliegue en el borde (edge-ai) y para el ecosistema Kinvoice, según las etiquetas de la model card.

Su relevancia radica en cubrir una lengua de bajos recursos como el jemer con un modelo compacto, licencia Apache 2.0 y pesos en safetensors, lo que facilita su integración en pipelines de ASR sin restricciones comerciales. No obstante, el repositorio es muy reciente, no tiene descargas ni likes, y la mayoría de las especificaciones de entrenamiento y benchmarks no están documentadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parámetros totales | 241.734.912 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | jemer (km), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura Whisper small de OpenAI: un transformer encoder-decoder con atención multi-cabeza, entrenado originalmente para ASR multilingüe y traducción de voz. La innovación declarada por el autor es el reemplazo quirúrgico del tokenizador por un BPE específico de jemer (K-Token KCC & RAC), diseñado para segmentar correctamente la escritura jemer y reducir la longitud de las secuencias de tokens en un 79,2 % respecto al tokenizador original, con un 0 % de glifos rotos según la model card.

El entrenamiento se realizó sobre el dataset rinabuoy/khmer-speech-dataset, con un total declarado de 728 horas de audio procesadas en 653 shards (100 % completado). La model card no especifica el número de tokens de texto, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o aumentación de datos. Tampoco se documentan detalles sobre la estrategia de fine-tuning (congelación de capas, learning rate, precisión mixta) ni sobre posibles innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla en jemer, con soporte secundario de inglés según los metadatos de idioma.
- Transcripción de audio a texto con un tokenizador adaptado a la escritura jemer (K-Token KCC & RAC).
- Reducción de la longitud de secuencia de tokens (79,2 % según el autor), lo que puede traducirse en menor coste computacional en inferencia.
- Etiquetado para edge-ai, lo que sugiere optimización para dispositivos con recursos limitados.
- Integración declarada con el ecosistema Kinvoice (etiqueta kinvoice).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del ASR, ni modo thinking.
- Capacidades multilingües limitadas a jemer e inglés según los metadatos.

## Casos de uso

- Transcripción de reuniones y entrevistas en jemer: el modelo convierte audio de conversaciones multi-hablante en texto, aprovechando el tokenizador específico para reducir errores en la segmentación de la escritura jemer.
- Subtitulado automático de vídeo y audio en jemer: puede generar pistas de subtítulos para contenido multimedia, con la ventaja de un modelo compacto (242 M de parámetros) que cabe en infraestructura modesta.
- Asistentes de voz para atención al cliente en jemer: integrado en un pipeline de ASR + NLU, permite transcribir consultas de usuarios en centros de contacto locales.
- Aplicaciones móviles de accesibilidad: al estar etiquetado como edge-ai, puede desplegarse en dispositivos con recursos limitados para dictado o transcripción en tiempo real.
- Digitalización de archivos orales y patrimonio cultural en jemer: transcripción de grabaciones históricas o etnográficas para su indexación y búsqueda.
- Investigación lingüística y creación de corpus: generación de transcripciones para anotación y análisis del jemer hablado, con licencia Apache 2.0 que permite su uso académico y comercial.
- Integración en sistemas de documentación clínica o legal en jemer: dictado de notas que se transcriben a texto para su posterior revisión.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| CER de validación (mejor) | 1,02 % |
| WER de validación (mejor) | 22,27 % |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son las métricas de validación declaradas por el autor en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1 GB para los 242 M de parámetros, más overhead de activaciones y audio.
- VRAM estimada en FP16/BF16: en torno a 0,5 GB de pesos, más memoria para el encoder-decoder y buffers de atención.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes, aunque el modelo está claramente sobredimensionado para GPUs de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica de forma nativa a Whisper, llama.cpp no soporta Whisper, TGI no es la opción habitual; se puede usar faster-whisper, WhisperX u ONNX Runtime para optimización.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khmer-whisper-small-sota | 241,7 M | no disponible | km, en | Apache 2.0 | Hugging Face (0 descargas) |
| openai/whisper-small | 244 M | 1500 posiciones (audio) | multilingüe (99 idiomas) | Apache 2.0 | Hugging Face, ampliamente usado |
| openai/whisper-base | 74 M | 1500 posiciones (audio) | multilingüe | Apache 2.0 | Hugging Face |
| rinabuoy/whisper-small-khmer (referencia del dataset) | no disponible | no disponible | km | no disponible | Hugging Face |

La comparación con openai/whisper-small es la más directa: mismo backbone y tamaño, pero el modelo de Vagabond404 incorpora un tokenizador específico de jemer y fine-tuning sobre 728 horas de audio. Frente a whisper-base, el modelo aquí descrito ofrece mayor capacidad (242 M frente a 74 M) a costa de más cómputo. No se dispone de datos de benchmarks comparativos con otras alternativas específicas para jemer.

## Limitaciones y advertencias

- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026, por lo que no hay validación independiente de los resultados declarados.
- Las métricas de CER (1,02 %) y WER (22,27 %) provienen únicamente de la model card del autor y no han sido verificadas externamente.
- La diferencia entre CER y WER es muy grande, lo que puede indicar que el tokenizador específico infla la métrica WER o que la evaluación se realizó sobre un conjunto de validación limitado.
- No se documenta el conjunto de validación, el proceso de split ni las condiciones acústicas de las 728 horas de entrenamiento.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o ruido.
- Sesgos potenciales derivados del dataset de entrenamiento (rinabuoy/khmer-speech-dataset): dominio, acento y calidad de micrófono no especificados.
- Idiomas limitados a jemer e inglés; no se garantiza un rendimiento aceptable en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan limitaciones de contexto ni longitud máxima de audio procesable.
- El etiquetado edge-ai no va acompañado de datos de latencia, consumo energético ni pruebas en dispositivos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vagabond404/khmer-whisper-small-sota
- Backbone original: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/rinabuoy/khmer-speech-dataset
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Faster-Whisper (implementación optimizada): https://github.com/SYSTRAN/faster-whisper
- WhisperX (alineación y diarización): https://github.com/m-bain/whisperX
