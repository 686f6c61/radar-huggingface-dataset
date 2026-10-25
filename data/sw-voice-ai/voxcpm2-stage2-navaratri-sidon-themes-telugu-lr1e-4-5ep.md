# sw-voice-ai/voxcpm2-stage2-navaratri-sidon-themes-telugu-lr1e-4-5ep

## Resumen

VoxCPM2 Swamiji stage 3 es un modelo de síntesis de voz (text-to-speech) publicado por `sw-voice-ai`, un ajuste fino completo del modelo `sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep`. El objetivo concreto del entrenamiento es reproducir la voz de un hablante específico (Swamiji) en telugu, a partir de las charlas de Navaratri restauradas por Sidon y re-segmentadas en unidades temáticas completas. No se trata, por tanto, de un modelo generalista, sino de una especialización de un TTS previamente adaptado al telugu y al inglés.

El modelo tiene 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) según los pesos en safetensors, y el repositorio ocupa 9,5 GB, un tamaño coherente con un almacenamiento en precisión de 32 bits. La licencia es Apache-2.0 y los idiomas declarados son telugu (`te`) e inglés (`en`). La model card no documenta la arquitectura interna, la longitud de contexto ni los mecanismos de condicionamiento por hablante.

Su relevancia es acotada pero clara: es un ejemplo reproducible de un pipeline de adaptación por etapas (stage 1b → stage 2 → stage 3) para una voz y un dominio muy concretos, con hiperparámetros de entrenamiento documentados de forma explícita. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y no se han publicado evaluaciones objetivas de calidad (MOS, WER, similitud de hablante).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de síntesis de voz, pipeline `text-to-speech`; la model card no detalla la arquitectura interna) |
| Parametros totales | 2.290.004.544 (≈2,29 mil millones, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | Telugu (`te`) e inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-to-speech |
| Autor | sw-voice-ai |
| Modelo base | sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep (fine-tune) |
| Dataset de ajuste | sw-voice/swamiji-navaratri-telugu-sidon-themes (127 unidades, 1,84 h) |
| Tamano del repositorio | 9,5 GB |
| Region | us |
| Fecha de creacion | 2026-10-25 |
| Ultima actualizacion | 2026-10-25 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo (transformer, difusión, códec neuronal u otra), ni el número de tokens de entrenamiento del modelo original, ni si hubo RLHF/DPO. Lo que sí está documentado es el procedimiento de ajuste: se parte del stage 2 (un modelo ya adaptado de telugu stage 1b a la voz de Swamiji en inglés) y se realiza un *full fine-tune* sobre el dataset `sw-voice/swamiji-navaratri-telugu-sidon-themes`, compuesto por 127 unidades que suman 1,84 horas de audio. Las unidades son charlas de Navaratri restauradas por Sidon y re-cortadas para que cada una contenga un tema completo, sin cortes a mitad de frase y preservando las pausas reales del hablante; los temas de más de 90 segundos se dividen en grupos de párrafos completos.

Los hiperparámetros del entrenamiento están detallados: micro-batch de 1 con acumulación de 4 (4 unidades efectivas por paso), 160 pasos, tasa de aprendizaje 1e-4 con scheduler coseno, 24 pasos de warmup, recorte de gradiente de 1.0 y 5 épocas. Este stage 3 comparte exactamente el mismo audio que `sw-voice-ai/voxcpm2-stage2-navaratri-sidon-telugu-lr5e-5-5ep` (402 clips cortos cortados en pausas); según el autor, solo cambian la segmentación y la tasa de aprendizaje (1e-4 frente a 5e-5). No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni detalles sobre el tokenizador o el decodificador de audio.

## Capacidades

- Síntesis de voz (text-to-speech) en telugu e inglés.
- Reproducción de una voz concreta y de un estilo de dicción asociados a un hablante específico (Swamiji), dado el diseño del ajuste fino.
- Generación de audio con pausas naturales preservadas, gracias a la segmentación por temas y párrafos completos del corpus de entrenamiento.
- Manejo de fragmentos largos a nivel de tema (unidades que pueden superar los 90 segundos y se agrupan por párrafos).
- Cambio de idioma dentro de la misma familia de modelos (`te`/`en`), ya que el modelo base fue adaptado desde telugu a inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": son capacidades ajenas al pipeline declarado.
- No se documenta control explícito de prosodia, emoción, velocidad ni marcado SSML.

## Casos de uso

- **Locución de charlas y discursos religiosos en telugu**: el modelo está entrenado sobre charlas de Navaratri segmentadas por temas completos, por lo que puede generar audio de discursos con pausas y estructura de párrafo similares a las del material original.
- **Preservación de patrimonio oral**: digitalización de la voz de un maestro concreto para generar nuevas lecturas de textos ya transcritos, manteniendo la identidad vocal en un archivo reproducible de 2,29 mil millones de parámetros.
- **Audiolibros y contenido devocional**: conversión de textos en telugu a audio narrado con una voz familiar para la comunidad, en lugar de una voz sintética genérica.
- **Doblaje y re-narración de material ya existente**: regeneración de pasajes corregidos o ampliados sin necesidad de volver a grabar al hablante, usando el mismo timbre.
- **Investigación en adaptación por etapas de modelos TTS**: el repositorio sirve como caso de estudio reproducible de una cadena stage 1b → stage 2 → stage 3, con todos los hiperparámetros y el dataset documentados.
- **Generación de material educativo bilingüe te/en**: al soportar ambos idiomas, puede producir locuciones para cursos o glosas dirigidas a hablantes de telugu con terminología en inglés.
- **Prototipado de asistentes de voz de nicho**: para productos dirigidos a la comunidad telugu que necesiten una voz concreta y con licencia Apache-2.0, sujeto a las advertencias sobre derechos de imagen y voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, CMOS, WER, similitud de hablante, error de prosodia) ni comparaciones cuantitativas con otros sistemas TTS. Tampoco se han encontrado datos en los resultados de búsqueda web proporcionados, que no guardan relación con este modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo a partir de 2.290.004.544 parámetros, sin contar activaciones ni buffers del decodificador de audio): ≈9,2 GB en fp32, ≈4,6 GB en fp16/bf16, ≈2,3 GB en int8 y ≈1,2 GB en int4. El repositorio de 9,5 GB sugiere pesos en fp32.
- **GPU profesionales**: A100 (40/80 GB), H100, L40S o A10G son suficientes con margen amplio; el modelo es pequeño para este segmento.
- **GPU de consumo**: cabe en tarjetas de 8-12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) si se carga en fp16/bf16; en fp32 es recomendable partir de 12-16 GB para absorber activaciones y el decodificador.
- **Opciones de despliegue**: no se documentan en la model card. Al publicarse únicamente safetensors, el despliegue requeriría un runtime compatible con la arquitectura original de VoxCPM; no hay evidencia de soporte en llama.cpp, Ollama, vLLM o TGI, y estos motores están orientados a modelos de lenguaje, no a TTS.
- **Latencia y throughput**: no disponibles. No se publican mediciones de RTF (real-time factor) ni de velocidad de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| sw-voice-ai/voxcpm2-stage2-navaratri-sidon-themes-telugu-lr1e-4-5ep (este modelo) | 2,29 B | No disponible | te, en | Apache-2.0 | Stage 3, 127 unidades temáticas, 1,84 h, LR 1e-4, 5 epocas |
| sw-voice-ai/voxcpm2-stage2-navaratri-sidon-telugu-lr5e-5-5ep | No disponible en la informacion | No disponible | te, en | Apache-2.0 (heredada del autor) | Mismo audio en 402 clips cortos, LR 5e-5, 5 epocas; solo cambian segmentacion y LR |
| sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep | No disponible en la informacion | No disponible | te, en | No disponible en la informacion | Modelo base del que parte este fine-tune (stage 1b, 10 epocas) |
| Alternativas TTS open source de proposito general (p. ej. XTTS-v2, Fish Speech, Kokoro) | No disponible en la informacion | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

## Limitaciones y advertencias

- **Dominio extremadamente estrecho**: el ajuste se hace sobre 1,84 horas de un único hablante y una única temática (charlas de Navaratri). Es esperable un rendimiento deficiente fuera de ese registro, ese timbre y ese tipo de texto.
- **Riesgo de sobreajuste**: 160 pasos sobre 4 unidades efectivas por paso y 5 épocas con LR 1e-4 sobre un modelo ya ajustado. El propio autor compara con la variante de LR 5e-5, lo que sugiere que la tasa de aprendizaje es un parámetro crítico y que un LR alto puede degradar la generalidad del modelo base.
- **Olvido catastrófico**: al ser un *full fine-tune* (no LoRA ni adaptadores) sobre un corpus pequeño y monotemático, puede haber pérdida de capacidades adquiridas en stages anteriores, incluida la calidad en inglés.
- **Sin evaluación objetiva**: no hay MOS, WER, ni medidas de similitud de hablante; no es posible afirmar la calidad de la síntesis sin una escucha manual.
- **Sesgos desconocidos**: no se documenta la composición demográfica del hablante ni del corpus más allá de la temática, por lo que no se puede evaluar el sesgo prosódico o de pronunciación.
- **Riesgo de uso indebido de la voz**: el modelo reproduce la voz de una persona real. La licencia Apache-2.0 cubre el artefacto, no el derecho de imagen ni la voz del hablante; es necesario verificar el consentimiento y cumplir la normativa aplicable (RGPD, EU AI Act) antes de cualquier uso público.
- **Riesgo de alucinación acústica**: como todo TTS generativo, puede producir artefactos, prosodia anómala o pronunciaciones inventadas en palabras fuera del vocabulario de entrenamiento, especialmente en inglés o en terminología técnica.
- **Cobertura lingüística limitada**: solo telugu e inglés; no hay soporte declarado de otros idiomas ni de code-switching más allá de esa pareja.
- **Licencia**: Apache-2.0 permite uso comercial del modelo, pero el dataset de origen y los derechos sobre el audio del hablante deben revisarse por separado.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; sin issues ni discusión pública que permitan validar el comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice-ai/voxcpm2-stage2-navaratri-sidon-themes-telugu-lr1e-4-5ep
- Modelo base: https://huggingface.co/sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep
- Variante con segmentación alternativa (LR 5e-5): https://huggingface.co/sw-voice-ai/voxcpm2-stage2-navaratri-sidon-telugu-lr5e-5-5ep
- Dataset de entrenamiento: https://huggingface.co/datasets/sw-voice/swamiji-navaratri-telugu-sidon-themes
- Paper, blog o repositorio del modelo: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada
