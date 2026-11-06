# umutkkgz/KAIRA-Audio-TR-V0.0.1-GGUF

## Resumen

KAIRA Audio TR V0.0.1 es un ajuste fino (fine-tuning) del modelo multimodal de audio LFM2.5-Audio-1.5B de Liquid AI, orientado especificamente al idioma turco. Lo desarrolla el usuario umutkkgz bajo el paraguas del proyecto KAIRA y se distribuye en formato GGUF para su uso con runtimes compatibles de llama.cpp (concretamente llama-liquid-audio). El modelo aborda tres tareas sobre audio en turco: reconocimiento automatico del habla (ASR), sintesis de voz (TTS) y conversacion nativa audio-a-audio, esta ultima en fase experimental.

El modelo hereda la arquitectura del LFM2.5-Audio-1.5B, con aproximadamente 1.170 millones de parametros en sus pesos safetensors, y se ha ajustado con unas 6 horas de habla turca sintetica distribuidas en 574 sesiones de dialogo validadas y 6.570 ejemplos de entrenamiento. El contexto de entrenamiento fue de 2.048 tokens, un valor notablemente corto para tareas conversacionales de audio.

Su relevancia actual es limitada pero concreta: cubre un nicho poco atendido (audio en turco de extremo a extremo en un unico modelo) y lo hace sobre una base abierta con licencia LFM Open License v1.0. No obstante, el propio autor lo describe como prototipo de investigacion no listo para produccion, con datos sinteticos y diversidad de hablantes limitada, por lo que debe evaluarse con cautela antes de cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM2.5-Audio-1.5B de Liquid AI; incluye LM, encoder/proyector de audio, vocoder y tokenizer de audio) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No disponible |
| Longitud de contexto | 2.048 tokens (longitud usada en entrenamiento) |
| Tipos de cuantizacion | GGUF en varias cuantizaciones (cada una con cuatro componentes: LM principal, mmproj, vocoder y tokenizer de audio) |
| Idiomas soportados | Turco (tr) |
| Licencia | LFM Open License v1.0 (license: other / lfm1.0) |
| Formato de pesos | GGUF (repo de 2,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-Audio-1.5B, un modelo de audio de Liquid AI que combina un modelo de lenguaje con un encoder/proyector de audio, un vocoder y un tokenizer de audio. KAIRA Audio TR conserva esa estructura y distribuye en GGUF los cuatro componentes necesarios para la inferencia: el modelo de lenguaje principal, el encoder/proyector de audio ajustado (mmproj), el vocoder y el tokenizer de audio/hablante; estos dos ultimos se copian de la release GGUF original de LFM2.5-Audio. La inferencia requiere un runtime compatible con llama-liquid-audio.

El ajuste fue un fine-tuning completo (no LoRA) de 2.400 pasos en BF16, con batch size 4 y longitud de contexto 2.048, ejecutado en una NVIDIA RTX PRO 6000 Blackwell. Los datos de entrenamiento consistieron en aproximadamente 6 horas de habla turca sintetica, con 574 sesiones de dialogo unicas validadas, 6.570 ejemplos de entrenamiento derivados de tareas de ASR, TTS y A2A (audio-a-audio) y 813 ejemplos de validacion. No se documentan fases de RLHF o DPO, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR) en turco.
- Sintesis de texto a voz (TTS) en turco.
- Conversacion nativa audio-a-audio en turco, en fase experimental.
- Procesamiento de entrada y salida de audio de extremo a extremo en un unico modelo.
- Capacidades de modelo de lenguaje heredadas del LFM2.5-Audio-1.5B (no detalladas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al turco segun la model card.
- Modo thinking, vision o audio adicional: no disponible.

## Casos de uso

- Transcripcion de audio en turco (ASR): el modelo puede convertir grabaciones de voz en texto para actas de reunion, subtitulado o indexacion de contenido, aprovechando su ajuste especifico sobre habla turca.
- Generacion de voz en turco (TTS): sintesis de locuciones para audiolibros, avisos o contenido accesible, usando el vocoder incluido en la distribucion GGUF.
- Prototipado de asistentes conversacionales por voz en turco: permite construir demos de dialogo audio-a-audio en local con llama-liquid-audio, util para validar experiencia de usuario antes de invertir en modelos mayores.
- Investigacion en procesamiento de habla turca: sirve como base para experimentos de fine-tuning adicional, analisis de ASR/TTS o comparativas de modelos de audio de ~1,5B de parametros.
- Evaluacion de pipelines de audio en local: al distribuirse en GGUF, se puede desplegar en entornos sin GPU de datacenter para pruebas de latencia y calidad.
- Atencion al cliente automatizada por voz (solo prototipo): el modelo podria gestionar turnos conversacionales basicos en turco, pero el autor advierte explicitamente de que no deben ejecutarse transacciones reales sin confirmacion del usuario y validacion a nivel de aplicacion.
- Generacion de datos sinteticos de habla turca: util para aumentar datasets de entrenamiento o pruebas de sistemas de ASR/TTS en fases de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo GGUF ocupa 2,7 GB, por lo que las cuantizaciones de menor precision podrian caber en GPUs consumer con 6-8 GB de VRAM, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible. El entrenamiento se realizo en una NVIDIA RTX PRO 6000 Blackwell, pero no se indican requisitos de inferencia.
- Cabe en GPU consumer: probablemente en modelos con 8 GB o mas segun la cuantizacion, si bien este dato no esta confirmado por el autor.
- Opciones de despliegue: runtime compatible con llama-liquid-audio (requisito explicito del autor); otros backends como vLLM, TGI u Ollama no se mencionan.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| KAIRA Audio TR V0.0.1 | 1.170.340.608 | 2.048 | Turco | LFM Open License v1.0 | GGUF | Fine-tuning de audio en turco, prototipo de investigacion |
| LiquidAI/LFM2.5-Audio-1.5B | ~1,5B (segun nombre) | No disponible | No disponible | LFM Open License v1.0 | No disponible | Modelo base multimodal de audio de Liquid AI |
| Otros modelos de audio en turco | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Prototipo de investigacion: el autor indica explicitamente que no esta listo para produccion.
- Datos de entrenamiento sinteticos con diversidad de hablantes limitada, lo que puede degradar el rendimiento con acentos, edades o condiciones acusticas no representadas.
- La correccion de ASR, TTS y conversacion requiere evaluacion independiente adicional; no hay benchmarks publicados.
- Contexto de entrenamiento corto (2.048 tokens), lo que limita conversaciones largas o audios extensos.
- Solo soporta turco; no se documentan capacidades multilingues.
- Riesgo de alucinacion y de errores en la comprension del habla no cuantificado.
- Advertencia explicita: no usar confirmaciones de pedido generadas por el modelo para ejecutar transacciones reales sin confirmacion del usuario y validacion independiente en la aplicacion.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar.
- Requiere un runtime especifico (llama-liquid-audio) y cuatro componentes por cuantizacion, lo que complica el despliegue frente a modelos de un solo archivo.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umutkkgz/KAIRA-Audio-TR-V0.0.1-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B/blob/main/LICENSE
