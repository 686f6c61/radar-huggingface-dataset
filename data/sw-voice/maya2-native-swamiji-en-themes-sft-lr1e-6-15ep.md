# sw-voice/maya2-native-swamiji-en-themes-sft-lr1e-6-15ep

## Resumen

maya2-native-swamiji-en-themes-sft-lr1e-6-15ep es un ajuste fino completo (full fine-tune) del modelo de síntesis de voz maya-research/maya2-native, desarrollado por el usuario sw-voice con fines de investigación. El modelo parte de una arquitectura de text-to-speech de aproximadamente 2.500 millones de parámetros y se ha especializado en la clonación de la voz de una persona concreta ("Swamiji") mediante entrenamiento supervisado sobre unidades temáticas completas de audio en inglés, telugu y kannada.

El problema que aborda es la personalización de un TTS base hacia una identidad vocal específica con pocos datos y sin recurrir a técnicas de adaptación ligera como LoRA. Para ello, el autor ha ajustado todos los pesos del modelo base durante 15 épocas (270 actualizaciones) con un learning rate de 1e-6, batch de 1x8 y 10 pasos de warmup, recortando 100 ms de silencio en los extremos de cada unidad de audio de entrenamiento.

Es relevante en el contexto de la investigación en clonación de voz y TTS de bajo recurso, ya que documenta una receta reproducible de fine-tune completo sobre un modelo de 2,5B con licencia Apache 2.0 y pesos en safetensors. No obstante, se trata de un artefacto de investigación con cero descargas y sin model card completa en cuanto a idiomas soportados o evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de text-to-speech maya-research/maya2-native; detalles arquitectónicos no publicados en la información disponible) |
| Parametros totales | 2.502.398.656 (~2,5B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (datos de entrenamiento en inglés, telugu y kannada según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del checkpoint maya-research/maya2-native, un sistema de text-to-speech de unos 2,5B de parámetros. La model card no detalla la arquitectura interna del modelo base (tipo de decoder, codec de audio, mecanismo de alineación texto-audio), por lo que no es posible especificar si se trata de un transformer autorregresivo, un modelo de difusión o una arquitectura híbrida. La carga se realiza mediante la clase `Maya3TTS.from_pretrained(...)` y la inferencia requiere registrar un clip de referencia de la voz objetivo con `mode="spk"`, lo que indica un esquema de condicionamiento por hablante (speaker prompting) en lugar de un identificador de hablante fijo.

El entrenamiento se realizó sobre el dataset `clips_en_themes.pt`, compuesto por unidades temáticas completas de audio en inglés, complementadas con clips en telugu y kannada procedentes de `swamiji-navaratri-telugu-sidon-themes` y `swamiji-navaratri-kannada-sidon-themes`. Cada unidad se recortó a 100 ms de silencio en ambos extremos. Los hiperparámetros documentados son: learning rate 1e-6, 15 épocas (270 actualizaciones), batch 1x8 y warmup de 10 pasos. El número de épocas se elevó deliberadamente para igualar el número de actualizaciones de las ejecuciones sobre clips originales. No se menciona uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del procedimiento de fine-tune supervisado.

## Capacidades

- Síntesis de voz (text-to-speech) con condicionamiento por clip de referencia de hablante (`mode="spk"`).
- Clonación de voz de la identidad "Swamiji" a partir de un clip de referencia registrado en el modelo.
- Generación de audio en los idiomas presentes en los datos de entrenamiento: inglés, telugu y kannada (según la model card; no se garantiza calidad en otros idiomas).
- Modelado de unidades temáticas completas de audio, lo que sugiere capacidad de generar fragmentos de habla más largos que una sola frase.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No se documentan capacidades de visión, audio de entrada (ASR) ni modo thinking.

## Casos de uso

- Investigación en clonación de voz: el modelo sirve como referencia reproducible de un full fine-tune de un TTS de 2,5B sobre una única identidad vocal, útil para estudiar el efecto del número de épocas y del recorte de silencios en la calidad final.
- Generación de audiolibros o contenido devocional en inglés, telugu y kannada: el condicionamiento por clip de referencia permite mantener una voz consistente a lo largo de unidades temáticas largas, adecuado para narraciones extensas.
- Prototipado de asistentes de voz personalizados: integrado en un pipeline TTS, permite dotar a un asistente de una voz concreta sin entrenar desde cero, usando el clip de referencia en tiempo de inferencia.
- Evaluación comparativa de recetas de fine-tune: al documentar LR, épocas, batch y warmup, el checkpoint permite comparar full fine-tune frente a adaptadores ligeros sobre el mismo modelo base.
- Localización de contenido multilingüe: con datos en inglés, telugu y kannada, puede emplearse para doblar o narrar material en esos idiomas manteniendo la misma identidad vocal.
- Doblaje y postproducción de audio: la generación de voz condicionada por referencia facilita sustituir locuciones manteniendo timbre y estilo, siempre que se respeten las obligaciones legales sobre derechos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): en torno a 10 GB solo para pesos (2,5B × 4 bytes), más overhead de activaciones y codec de audio.
- VRAM estimada en fp16/bf16: aproximadamente 5 GB para pesos, más overhead; se recomienda al menos 8-12 GB para operar con margen.
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con throughput alto; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso en fp16 sin problemas de memoria.
- GPU de consumo: cabe en tarjetas con 8 GB o más en fp16, aunque con margen ajustado; en cuantización de 8 bits podría caber en 6-8 GB, si bien no se documentan formatos de cuantización para este modelo.
- Opciones de despliegue: la model card indica carga mediante `Maya3TTS.from_pretrained(...)` con el código `swamiji-tts` en la ruta `research/maya2-sft`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| maya2-native-swamiji-en-themes-sft-lr1e-6-15ep | ~2,5B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune de voz específica sobre maya2-native |
| maya-research/maya2-native | no disponible | no disponible | no disponible en la información | Hugging Face (modelo base) | Modelo TTS base del que deriva este checkpoint |
| Alternativas TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, otros TTS de 2-3B con clonación de voz); se indica "no disponible" en lugar de inventar cifras.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card lo etiqueta como "(research)" y no documenta evaluación objetiva de calidad (MOS, WER, similitud de hablante).
- Cero descargas y cero likes en Hugging Face en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Idiomas no declarados en los metadatos de Hugging Face; la model card menciona inglés, telugu y kannada como datos de entrenamiento, pero no se garantiza el comportamiento en otros idiomas.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas, especialmente fuera del dominio de entrenamiento.
- Sesgo de identidad vocal: el modelo está especializado en una única voz ("Swamiji"); no es un TTS generalista y su uso con otras voces requeriría otro fine-tune.
- Riesgo legal y ético en clonación de voz: el uso de la voz de una persona concreta puede requerir consentimiento explícito y cumplir la normativa aplicable (por ejemplo, derechos de imagen y voz, reglamento europeo de IA); la licencia Apache 2.0 del código y pesos no exime de estas obligaciones.
- Licencia Apache 2.0 permite uso comercial de los pesos, pero las condiciones del modelo base maya2-native deben verificarse por separado.
- No se documentan cuantizaciones oficiales ni herramientas de despliegue estándar (vLLM, TGI), lo que limita su integración en producción sin trabajo adicional.
- Fecha de creación y actualización en 2026-10-28 según los metadatos, lo que puede indicar un artefacto reciente y poco probado.

## Enlaces

- [Hugging Face: sw-voice/maya2-native-swamiji-en-themes-sft-lr1e-6-15ep](https://huggingface.co/sw-voice/maya2-native-swamiji-en-themes-sft-lr1e-6-15ep)
- [Modelo base: maya-research/maya2-native](https://huggingface.co/maya-research/maya2-native)
- Dataset de referencia citado: sw-voice/swamiji-voice-sft-sidon-themes (no se dispone de URL verificada en la información)
- Dataset de referencia citado: sw-voice/swamiji-navaratri-telugu-sidon-themes (no se dispone de URL verificada en la información)
- Dataset de referencia citado: sw-voice/swamiji-navaratri-kannada-sidon-themes (no se dispone de URL verificada en la información)
- Código citado: repositorio `swamiji-tts`, ruta `research/maya2-sft` (no se dispone de URL verificada en la información)
