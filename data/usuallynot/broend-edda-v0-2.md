# usuallynot/broend-edda-v0.2

## Resumen

`usuallynot/broend-edda-v0.2` es una redistribución en formato bfloat16 del modelo de reconocimiento automático del habla `danish-foundation-models/edda-v0.2`, desarrollado originalmente por el Alexandra Institute y Danish Foundation Models. Se trata de un fine-tuning de Whisper-large-v3-turbo especializado en danés, con 808.878.080 parámetros y una arquitectura transformer encoder-decoder propia de la familia Whisper. El cambio introducido por `usuallynot` es exclusivamente de formato numérico: la conversión de todos los tensores de float16 a bfloat16 y el alineamiento de la cabecera del fichero `model.safetensors` a un límite de 8 bytes. No se ha reentrenado ni modificado ningún peso.

La relevancia de esta ficha es acotada pero concreta: el modelo sirve como artefacto listo para usar en la aplicación Brønd, cuyos kernels de GPU y CPU leen bfloat16 de forma nativa, evitando al usuario final un paso de conversión. Para el resto de desarrolladores, el interés radica en disponer de una versión bfloat16 verificada tensor a tensor (588 de 588 tensores idénticos a la conversión manual) de un ASR danés de referencia, con licencia Apache 2.0 y compatibilidad directa con `transformers`.

El modelo resuelve el problema de transcripción de voz en danés, un idioma con cobertura limitada en los sistemas ASR multilingües genéricos. Su contexto de audio es el estándar de Whisper (ventanas de 30 segundos), y su pipeline es `automatic-speech-recognition`. No es un modelo de propósito general ni un LLM: es un sistema especializado de voz a texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio estándar de Whisper, 30 s por segmento) |
| Tipos de cuantizacion | bfloat16 (único formato publicado en este repo); el modelo base admite float16 |
| Idiomas soportados | danés (da) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper-large-v3-turbo, un transformer encoder-decoder con atención estándar diseñado para transcripción de audio. El modelo original `edda-v0.2` fue fine-tuneado por Danish Foundation Models y el Alexandra Institute sobre Whisper-large-v3-turbo para especializarlo en danés. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la model card original, que se conserva en el repositorio como `edda-v0.2-README.md` pero cuyo contenido no se ha facilitado.

La innovación técnica de esta variante concreta es mínima y bien documentada: la conversión de todos los tensores float16 a bfloat16 y el padding de la cabecera del safetensors para que los datos comiencen en un límite de 8 bytes. La verificación reportada confirma que los 588 tensores son idénticos a aplicar `torch.Tensor.to(torch.bfloat16)` sobre los originales. No hay decodificación especulativa, atención lineal ni modificaciones arquitectónicas.

## Capacidades

- Reconocimiento automático del habla en danés, con salida de texto transcrito.
- Carga directa con `WhisperForConditionalGeneration` y `WhisperProcessor` de `transformers` en `torch_dtype="bfloat16"`.
- Ejecución en kernels de GPU y CPU que lean bfloat16 de forma nativa, sin conversión previa.
- Decodificación greedy soportada y evaluada en la model card.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo ASR, no un LLM.
- No soporta visión, audio generativo ni modos de pensamiento.
- Capacidad multilingüe limitada al danés; no se documentan otros idiomas.

## Casos de uso

- Transcripción de reuniones y conversaciones en danés: el modelo está evaluado específicamente en CoRal-v3 conversation test (400 muestras), lo que lo hace adecuado para audio conversacional real con solapamientos y ruido moderado.
- Subtitulado automático de contenido audiovisual danés: con un WER de 7,71% en FLEURS da test, la calidad es suficiente para subtítulos revisables en producción.
- Integración en la aplicación Brønd: es el caso de uso declarado por el autor; la app descarga el modelo directamente y aprovecha los kernels bfloat16 sin paso de conversión.
- Procesamiento por lotes de archivos de audio en pipelines de datos: al cargarse como modelo Whisper estándar en `transformers`, se puede integrar en scripts de transcripción masiva con `pipeline("automatic-speech-recognition")`.
- Investigación en ASR de bajos recursos para lenguas nórdicas: sirve como línea base bfloat16 reproducible para comparar con otros fine-tunes de Whisper en danés.
- Despliegue en entornos con soporte nativo de bfloat16 (GPU modernas y algunas CPU con AVX-512 BF16): evita el coste de conversión en el arranque y reduce el uso de memoria frente a float32.

## Benchmarks y rendimiento

Datos publicados en la model card, con decodificación greedy. CoRal se evalúa sin palabras de relleno.

| Metrica | Original float16 | Esta version bfloat16 |
|---|---|---|
| FLEURS da test (150 muestras), WER | 7,80% | 7,71% |
| CoRal-v3 conversation test (400 muestras), WER | 14,50% | 14,66% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,6 GB solo para pesos (808,9 M de parámetros × 2 bytes), más overhead de activaciones y del encoder de audio; en la práctica, entre 2 y 4 GB según longitud de audio y tamaño de lote.
- GPU recomendadas: cualquier GPU con soporte nativo de bfloat16 (Ampere o superior: A100, H100, RTX 3090, RTX 4090, L4, L40S). En GPUs sin bfloat16 nativo, la carga funciona pero puede requerir emulación o conversión.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares; también en GPUs de 4-6 GB con lotes pequeños.
- Opciones de despliegue: `transformers` (soporte directo documentado), y por extensión cualquier servidor compatible con Whisper en `transformers` como TGI. No se documenta soporte explícito para llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| usuallynot/broend-edda-v0.2 | 808,9 M | 30 s (Whisper) | da | Apache 2.0 | safetensors bfloat16 |
| danish-foundation-models/edda-v0.2 | 808,9 M | 30 s (Whisper) | da | Apache 2.0 | safetensors float16 |
| openai/whisper-large-v3-turbo | 809 M (aprox.) | 30 s (Whisper) | multilingüe | MIT (según el modelo original de OpenAI; no confirmado en esta información) | safetensors |
| openai/whisper-large-v3 | 1.550 M (aprox.) | 30 s (Whisper) | multilingüe | MIT (según el modelo original de OpenAI; no confirmado en esta información) | safetensors |

La comparativa se limita a la familia Whisper porque no se han proporcionado datos de otros ASR daneses (por ejemplo, modelos de la propia familia Danish Foundation Models distintos de edda). Los datos de parámetros de los modelos de OpenAI son aproximados y no se han verificado en la información disponible.

## Limitaciones y advertencias

- El modelo base escribe texto incluso cuando no hay habla cerca del micrófono, por ejemplo ante conversaciones lejanas o ruido. La model card advierte que las aplicaciones deben enviar únicamente audio que contenga habla.
- Riesgo de alucinación en pasajes silenciosos o con ruido de fondo, derivado de la limitación anterior.
- Cobertura monolingüe: solo danés; no se debe esperar calidad en otros idiomas.
- La ventana de audio estándar de Whisper es de 30 segundos por segmento; audios más largos requieren segmentación y pueden acumular errores en las fronteras.
- El WER en conversación (14,66% en CoRal-v3) es notablemente superior al de lectura (7,71% en FLEURS), lo que refleja la dificultad del habla espontánea.
- Licencia Apache 2.0: permite uso comercial, pero el crédito del modelo corresponde a sus autores originales (Alexandra Institute y Danish Foundation Models), no a `usuallynot`.
- Esta variante concreta no ha sido reentrenada; cualquier mejora o regresión respecto al original se debe exclusivamente al cambio de precisión numérica.
- No se documentan sesgos específicos más allá de los inherentes al corpus de entrenamiento original, cuyo detalle no está disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/usuallynot/broend-edda-v0.2
- Modelo base: https://huggingface.co/danish-foundation-models/edda-v0.2
- Revisión del modelo base referenciada: `698f8d04b5970f963d31c4079c05a76fa7f4f5bb`
- Model card original incluida en el repo: `edda-v0.2-README.md`
- Repositorio de Danish Foundation Models: no disponible en la información proporcionada
- Paper o blog del modelo original: no disponible en la información proporcionada
- Demo o aplicación Brønd: no disponible en la información proporcionada
