# vladlen-beilik/Qwen3-TTS-12Hz-1.7B-Base

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Se trata de la variante base de la familia Qwen3-TTS, diseñada específicamente para clonación rápida de voz a partir de muestras de audio de 3 segundos y para servir como punto de partida para fine-tuning de otros modelos de la familia. El modelo emplea una arquitectura de lenguaje discreto con múltiples codebooks (discrete multi-codebook LM) junto con el tokenizador propietario Qwen3-TTS-Tokenizer-12Hz, lo que permite un modelado de voz completo de extremo a extremo sin los cuellos de botella de los esquemas tradicionales LM+DiT.

El modelo soporta 10 idiomas principales (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y destaca por su baja latencia de síntesis, con una latencia extremo a extremo de hasta 97 ms y capacidad de generación en streaming. La arquitectura de doble vía (Dual-Track) permite alternar entre generación en streaming y no streaming con un único modelo. Con aproximadamente 1.930 millones de parámetros totales, el modelo está disponible en formato safetensors y pesa unos 4,5 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Discrete multi-codebook LM con tokenizador Qwen3-TTS-Tokenizer-12Hz |
| Parámetros totales | 1.928.677.440 (~1,93B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de modelo de lenguaje discreto con múltiples codebooks, una aproximación que permite modelar la señal de voz de forma completa y de extremo a extremo sin depender de componentes adicionales tipo difusión (DiT). El tokenizador Qwen3-TTS-Tokenizer-12Hz codifica el audio en códigos discretos y los reconstruye posteriormente, preservando información paralingüística y características del entorno acústico. Esta arquitectura evita los cuellos de botella de información y los errores en cascada típicos de los esquemas tradicionales que combinan un LM con un módulo DiT.

El modelo soporta tanto generación en streaming como no streaming mediante una arquitectura de generación híbrida de doble vía (Dual-Track). La primera salida de audio puede generarse tras un solo carácter de entrada, con una latencia de síntesis de extremo a extremo de hasta 97 ms. La variante Base no incluye control por instrucciones en lenguaje natural (a diferencia de las variantes CustomVoice y VoiceDesign), sino que está orientada a la clonación rápida de voz a partir de 3 segundos de audio de referencia y al fine-tuning para otros modelos. Los datos exactos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se han publicado en la información disponible.

## Capacidades

- Clonación rápida de voz: puede replicar la voz de un usuario a partir de una muestra de audio de 3 segundos.
- Síntesis de voz en 11 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Generación en streaming con baja latencia: primera salida de audio tras un único carácter, con latencia extremo a extremo de hasta 97 ms.
- Modelado de voz de alta fidelidad: preserva información paralingüística y características del entorno acústico gracias al tokenizador de 12 Hz.
- Robusto frente a texto de entrada ruidoso: el modelo muestra una robustez mejorada ante texto con errores o ruido.
- Base para fine-tuning: puede usarse como punto de partida para entrenar otros modelos de la familia Qwen3-TTS.
- No incluye control por instrucciones en lenguaje natural (esa capacidad está reservada a las variantes CustomVoice y VoiceDesign).

## Casos de uso

- Clonación de voz personalizada: el modelo puede replicar la voz de un usuario a partir de una muestra de 3 segundos, lo que permite crear asistentes virtuales, narradores o personajes con la voz del propio usuario. Es adecuado porque la variante Base está específicamente diseñada para esta tarea.
- Fine-tuning para aplicaciones de voz específicas: al ser la variante Base, se puede utilizar como punto de partida para entrenar modelos personalizados con voces o estilos concretos, aprovechando la arquitectura de múltiples codebooks.
- Generación de voz en tiempo real para agentes conversacionales: gracias a su capacidad de streaming y baja latencia (97 ms), el modelo puede integrarse en sistemas de diálogo que requieren respuestas de voz casi inmediatas.
- Síntesis de voz multilingüe para plataformas globales: con soporte para 11 idiomas, el modelo puede utilizarse en aplicaciones que necesitan generar voz en varios idiomas, como sistemas de lectura de noticias o plataformas de e-learning.
- Sistemas de accesibilidad: puede emplearse para convertir texto en voz en aplicaciones de asistencia a personas con discapacidad visual, con la posibilidad de clonar voces conocidas para una experiencia más natural.
- Generación de contenido audiovisual: útil para crear voces en off en vídeos, podcasts o audiolibros, aprovechando la clonación de voz para mantener consistencia en la narración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~1,93B parámetros en fp32, el modelo ocuparía unos 7,7 GB de memoria, por lo que cabría en GPU de consumo con al menos 8-12 GB de VRAM. Con cuantización a 8 bits o 4 bits, los requisitos serían menores.
- GPU recomendadas: no se especifican oficialmente, pero por tamaño de modelo, una GPU como la RTX 3090 o RTX 4090 (24 GB VRAM) sería suficiente para inferencia con pesos completos. Para despliegues de mayor escala, una A100 o H100 sería adecuada.
- Compatibilidad con GPU de consumo: probablemente sí, si se usa cuantización o modelos más pequeños de la familia (como las variantes de 0,6B).
- Opciones de despliegue: el modelo se puede cargar con el paquete `qwen-tts` o con vLLM. Los pesos se descargan automáticamente según el nombre del modelo, o manualmente desde Hugging Face o ModelScope.
- Latencia y throughput: el modelo puede emitir el primer paquete de audio tras un solo carácter, con latencia de síntesis de extremo a extremo de hasta 97 ms. No se han publicado datos de throughput detallados.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Streaming | Clonación de voz | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (este modelo) | ~1,93B | 11 | Sí | Sí (3s) | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-Base | ~0,6B | 11 | Sí | Sí (3s) | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | ~1,93B | 11 | Sí | No | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | ~1,93B | 11 | Sí | No | Apache 2.0 |

La comparativa con modelos externos (como XTTS, Coqui, o modelos comerciales) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La variante Base no incluye control de voz mediante instrucciones en lenguaje natural; para ese caso, es necesario usar las variantes CustomVoice o VoiceDesign.
- La clonación de voz plantea riesgos de uso indebido (suplantación de identidad, creación de contenido falso). Se debe usar de forma responsable y con consentimiento de los implicados.
- La información disponible no incluye detalles sobre sesgos del modelo, riesgos de alucinación en el texto de entrada ni limitaciones específicas de idioma.
- No se ha publicado información sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO), por lo que no se puede evaluar la robustez en todos los escenarios.
- Para uso en producción, es recomendable validar la calidad de la voz generada en el idioma y contexto específicos, ya que no hay benchmarks públicos que respalden su rendimiento.

## Enlaces

- [Hugging Face - vladlen-beilik/Qwen3-TTS-12Hz-1.7B-Base](https://huggingface.co/vladlen-beilik/Qwen3-TTS-12Hz-1.7B-Base)
- [Hugging Face - Modelo oficial Qwen/Qwen3-TTS-12Hz-1.7B-Base](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base/tree/main/speech_tokenizer)
- [Colección Qwen3-TTS en Hugging Face](https://huggingface.co/collections/Qwen/qwen3-tts)
- [GitHub - QwenLM/Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS)
- [ModelScope - Qwen3-TTS-12Hz-1.7B-VoiceDesign](https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign)
- [Aimodels.fyi - Resumen del modelo](https://www.aimodels.fyi/models/huggingFace/qwen3-tts-12hz-1.7b-base-qwen)
