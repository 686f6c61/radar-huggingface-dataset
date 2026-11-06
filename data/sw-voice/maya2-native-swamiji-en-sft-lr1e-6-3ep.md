# sw-voice/maya2-native-swamiji-en-sft-lr1e-6-3ep

## Resumen

maya2-native-swamiji-en-sft-lr1e-6-3ep es un ajuste fino completo (full fine-tune) del modelo de síntesis de voz maya-research/maya2-native, desarrollado por el usuario sw-voice. El objetivo del ajuste es especializar el modelo base en la clonación de la voz de una persona concreta identificada como "Swamiji", partiendo de un conjunto de 719 clips de audio en inglés deduplicados, más material adicional en télugu y canarés. El resultado es un checkpoint de 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) publicado en formato safetensors con licencia Apache 2.0.

El modelo se enmarca en la categoría de text-to-speech (TTS) con capacidad de condicionamiento por referencia de hablante. Según la model card, se carga mediante el paquete `maya3` con la clase `Maya3TTS.from_pretrained(...)` y requiere registrar un clip de referencia de Swamiji con `mode="spk"` para activar la voz objetivo. Esto indica una arquitectura de TTS zero-shot o few-shot con un encoder de hablante que acepta audio de referencia en tiempo de inferencia.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de adaptación de un modelo TTS de 2,5B parámetros a una voz concreta con un presupuesto de entrenamiento muy reducido (270 actualizaciones, 3 épocas, learning rate 1e-6); por otro, advierte de que se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación de idiomas soportados más allá de la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de text-to-speech derivado de maya-research/maya2-native; se carga con el paquete `maya3` / clase `Maya3TTS`) |
| Parametros totales | 2.502.398.656 (~2,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 5,0 GB) |
| Idiomas soportados | no disponibles oficialmente; el dataset de ajuste incluye clips en inglés (719 clips deduplicados), télugu y canarés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base maya-research/maya2-native: no se especifica si es un transformer autorregresivo sobre tokens de audio, un modelo difusión, un VITS-like o un híbrido. Lo que sí se documenta es el procedimiento de ajuste: un full fine-tune (todos los parámetros actualizados, no LoRA ni adaptadores) sobre el checkpoint maya2-native, con learning rate 1e-6, 3 épocas, batch efectivo de 2x4 (probablemente 2 por dispositivo y acumulación o 8 total), warmup de 10 pasos y un total de 270 actualizaciones. El código de entrenamiento vive en el repositorio `swamiji-tts`, rama `research/maya2-sft`.

El dataset de entrenamiento combina tres fuentes: `clips.pt`, definido como 719 clips de inglés deduplicados procedentes de sw-voice/swamiji-voice-sft-sidon; `clips_te`, procedente de sw-voice/swamiji-navaratri-telugu-sidon-themes; y `clips_kn`, procedente de sw-voice/swamiji-navaratri-kannada-sidon-themes. No se indica el número total de horas de audio, la duración media de los clips, ni si se aplicaron técnicas de aumento de datos, filtrado de calidad o alineamiento forzado. Tampoco se documenta si hubo RLHF, DPO ni ninguna fase de preferencias; en TTS esto es habitual, ya que el entrenamiento suele ser supervisado sobre pares texto-audio.

La innovación técnica destacable, en la medida en que se puede inferir de la model card, es el mecanismo de condicionamiento por hablante: el modelo no genera una voz fija, sino que acepta un clip de referencia registrado con `mode="spk"` para sintetizar con la identidad vocal de ese clip. Esto lo sitúa en la familia de modelos TTS con clonación zero-shot o few-shot, aunque no se especifica si el encoder de hablante es un modelo separado (tipo speaker embedding) o si el condicionamiento se inyecta en el decoder.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida de audio.
- Clonación de voz condicionada por un clip de referencia: el registro de un clip de Swamiji con `mode="spk"` permite generar audio con esa identidad vocal.
- Especialización en inglés: el conjunto principal de ajuste son 719 clips en inglés, por lo que la calidad esperada es mayor en ese idioma.
- Cobertura multilingüe limitada y no documentada: el dataset incluye material en télugu y canarés, pero no se especifica el nivel de soporte ni la calidad resultante en esos idiomas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada (ASR) ni modo "thinking". Es un modelo puramente TTS.
- No se documenta control de prosodia, emoción, velocidad ni estilo más allá del condicionamiento por hablante.

## Casos de uso

- Clonación de voz para narración de contenido: dado un clip de referencia de Swamiji, el modelo puede generar narraciones en inglés con esa identidad vocal, útil para producir audiolibros, podcasts o material divulgativo de forma consistente sin regrabar al hablante.
- Doblaje y localización de contenido existente: el condicionamiento por hablante permite mantener la identidad vocal de un narrador a lo largo de múltiples piezas, lo que simplifica la producción de series de vídeos o cursos con voz uniforme.
- Prototipado de asistentes de voz personalizados: al ser un modelo de 2,5B parámetros en safetensors y licencia Apache 2.0, se puede integrar en un pipeline de TTS para un asistente con una voz de marca concreta, siempre que se cumplan las obligaciones de consentimiento del hablante.
- Investigación en adaptación de modelos TTS: el checkpoint documenta un full fine-tune con hiperparámetros concretos (LR 1e-6, 3 épocas, 270 updates, warmup 10), lo que lo convierte en un punto de partida reproducible para estudiar el efecto del ajuste fino sobre la identidad vocal en modelos de 2,5B.
- Generación de material multilingüe experimental: con clips en télugu y canarés en el dataset, se puede evaluar la transferencia de la voz de Swamiji a esos idiomas, aunque sin garantías de calidad al no estar documentado el soporte.
- Evaluación de riesgos de deepfake y detección de voz sintética: al ser un modelo de clonación de voz accesible con licencia permisiva, sirve como caso de estudio para construir y validar detectores de audio sintético y para definir políticas de uso responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, SIM-O, SECS), ni comparaciones con otros modelos TTS, ni curvas de pérdida durante el entrenamiento. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un checkpoint de 2,5B parámetros en safetensors ocupa 5,0 GB en precisión de 16 bits; la VRAM real necesaria depende de si el pipeline carga también el encoder de texto, el encoder de hablante y el vocoder, que no se documentan.
- GPU recomendadas: no disponibles. Por tamaño, un checkpoint de 2,5B en FP16 cabe en GPUs consumer con 8-12 GB de VRAM si el resto del pipeline es ligero; para producción con concurrencia se recomendarían GPUs de datacenter (A100, H100, L40S), pero esto es una estimación, no un dato del autor.
- ¿Cabe en consumer GPU? Probablemente sí en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090), sujeto a la VRAM del pipeline completo, que no se especifica.
- Opciones de despliegue: el autor indica el paquete `maya3` con `Maya3TTS.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ONNX, y al ser un modelo TTS es poco probable que esos runners genéricos de LLM lo soporten sin adaptadores específicos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de modelos de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se indica únicamente lo que se puede afirmar con los datos del propio checkpoint:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| maya2-native-swamiji-en-sft-lr1e-6-3ep | ~2,5B | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| maya-research/maya2-native (base) | no disponible | no disponible | no disponible | Hugging Face (referenciado como base_model) |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card lo etiqueta como "(research)". No hay evidencia de evaluación de calidad, ni métricas, ni pruebas de producción.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Riesgo de alucinación y artefactos de audio: no se documentan métricas de inteligibilidad (WER) ni de naturalidad (MOS); en TTS, los fallos se manifiestan como pronunciación incorrecta, artefactos, cortes o inestabilidad prosódica, y no hay datos para acotar su frecuencia.
- Sesgo de hablante: el modelo está ajustado para reproducir una voz concreta; puede degradarse con textos fuera del dominio del dataset (719 clips en inglés) y no se documenta su comportamiento con otros hablantes.
- Cobertura de idiomas no garantizada: aunque el dataset incluye télugu y canarés, no se especifica el soporte real ni la calidad; el inglés es el idioma principal del ajuste.
- Restricciones éticas y legales de clonación de voz: aunque la licencia es Apache 2.0 y permite uso comercial, la clonación de la voz de una persona requiere consentimiento explícito del hablante y el cumplimiento de la normativa aplicable (por ejemplo, el Reglamento de IA de la UE en materia de deepfakes y transparencia). La licencia del código no exime de estas obligaciones.
- Licencia del modelo base: se declara Apache 2.0 en este checkpoint, pero no se verifica en la información disponible la licencia de maya-research/maya2-native; conviene comprobarla antes de un uso comercial.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó el 2026-10-27 con una diferencia de menos de un minuto entre ambos eventos, lo que sugiere una publicación puntual sin hoja de ruta.
- Dependencia de código externo: la carga requiere el paquete `maya3` y el repositorio `swamiji-tts`, cuya madurez, documentación y compatibilidad no se detallan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/maya2-native-swamiji-en-sft-lr1e-6-3ep
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Dataset de voz (inglés): https://huggingface.co/sw-voice/swamiji-voice-sft-sidon
- Dataset de temas en télugu: https://huggingface.co/sw-voice/swamiji-navaratri-telugu-sidon-themes
- Dataset de temas en canarés: https://huggingface.co/sw-voice/swamiji-navaratri-kannada-sidon-themes
- Código de entrenamiento (repositorio `swamiji-tts`, rama `research/maya2-sft`): no se proporciona URL directa en la información disponible
