# th-shubham/Qwen3-TTS-12Hz-1.7B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice es un modelo de síntesis de voz (text-to-speech) de la familia Qwen3-TTS, desarrollado por el equipo Qwen (Alibaba). Esta variante concreta, publicada en Hugging Face bajo el identificador `th-shubham/Qwen3-TTS-12Hz-1.7B-CustomVoice`, ofrece control de estilo sobre timbres objetivo mediante instrucciones en lenguaje natural y soporta nueve timbres predefinidos que cubren combinaciones de género, edad, idioma y dialecto.

El modelo emplea una arquitectura de lenguaje discreto con múltiples codebooks (discrete multi-codebook LM) que modela la señal de voz de extremo a extremo, apoyándose en el tokenizador propio Qwen3-TTS-Tokenizer-12Hz para la compresión acústica y el modelado semántico de alta dimensión. Con 1.916.676.352 parámetros (aproximadamente 1,7B) y un repositorio de 4,5 GB en formato safetensors, está pensado para generación de voz de alta fidelidad con baja latencia.

Su relevancia actual radica en la combinación de generación en streaming con latencia de extremo a extremo declarada de hasta 97 ms, control por instrucciones de atributos acústicos (timbre, emoción, prosodia) y cobertura de diez idiomas principales, incluyendo el español. La licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LM discreto con múltiples codebooks (discrete multi-codebook LM); tokenizador acústico Qwen3-TTS-Tokenizer-12Hz |
| Parámetros totales | 1.916.676.352 (~1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS se basa en una arquitectura universal de extremo a extremo con un LM discreto de múltiples codebooks. A diferencia de los esquemas tradicionales LM+DiT, que encadenan un modelo de lenguaje con un modelo de difusión y arrastran cuellos de botella de información y errores en cascada, este diseño modela directamente la señal de voz completa. El tokenizador Qwen3-TTS-Tokenizer-12Hz se encarga de la compresión acústica y del modelado semántico de alta dimensión, preservando información paralingüística y características del entorno acústico, y permite una reconstrucción de voz de alta fidelidad mediante una arquitectura ligera no basada en DiT.

La generación utiliza una arquitectura híbrida de streaming de doble pista (Dual-Track), que permite que un mismo modelo opere en modo streaming y no streaming. En modo streaming puede emitir el primer paquete de audio inmediatamente después de introducir un solo carácter, con una latencia de síntesis de extremo a extremo declarada de hasta 97 ms. El modelo integra comprensión del texto de entrada para ajustar de forma adaptativa el tono, el ritmo y la expresión emocional. No se han proporcionado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto en diez idiomas principales (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano), además de perfiles de voz dialectales.
- Control de estilo mediante instrucciones en lenguaje natural: timbre, emoción, prosodia, tono y velocidad de habla.
- Nueve timbres predefinidos que cubren combinaciones de género, edad, idioma y dialecto.
- Generación en streaming y no streaming con el mismo modelo.
- Generación de baja latencia (hasta 97 ms de extremo a extremo en streaming).
- Comprensión contextual del texto para adaptar de forma adaptativa la expresión acústica.
- Mayor robustez frente a texto de entrada con ruido.
- Preservación de información paralingüística y de características del entorno acústico gracias al tokenizador de 12 Hz.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá del propio pipeline TTS.

## Casos de uso

- Asistentes de voz en tiempo real: el modo streaming con latencia de hasta 97 ms permite integrar el modelo en agentes conversacionales que necesitan responder oralmente con mínima espera tras la entrada del usuario.
- Audiolibros y narración automatizada: el control de prosodia y emoción por instrucciones permite ajustar el tono narrativo según el género del texto (ficción, divulgación, infantil) sin reentrenar el modelo.
- Atención al cliente telefónica: los nueve timbres predefinidos y el control de estilo permiten asignar voces consistentes por marca o por tipo de consulta, con soporte multilingüe para mercados europeos y asiáticos.
- Localización de contenidos audiovisuales: la cobertura de diez idiomas, incluido el español, facilita el doblaje y la generación de pistas de voz para vídeos, cursos y materiales formativos.
- Sistemas de accesibilidad: conversión de texto a voz de alta fidelidad para lectores de pantalla y aplicaciones de asistencia a personas con discapacidad visual, con voces ajustables en edad y género.
- Publicidad y contenido generativo: generación de locuciones con estilos concretos (enérgico, cercano, formal) mediante instrucciones, útil para prototipado rápido de anuncios y demos.
- Integración en pipelines de producción: al publicarse en formato safetensors con licencia Apache 2.0, puede desplegarse en servicios propios de síntesis de voz sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,7B parámetros en safetensors y un repositorio de 4,5 GB, la inferencia en precisión completa requiere del orden de varios GB de VRAM, y en cuantizaciones de 8 o 4 bits podría reducirse notablemente, aunque no se documentan los formatos soportados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del modelo (1,7B) sugiere que podría caber en GPU de consumo con VRAM suficiente, pero no se aportan datos verificados.
- Opciones de despliegue: el paquete `qwen-tts` y vLLM descargan automáticamente los pesos según el nombre del modelo; también se documenta la descarga manual mediante ModelScope y `huggingface-cli`.
- Latencia: 97 ms de extremo a extremo en modo streaming según la model card; no se proporcionan datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Streaming | Control por instrucciones | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice | ~1,7B | 10 | Sí | Sí | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | ~1,7B | 10 | Sí | Sí (diseño de voz por descripción) | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-Base | ~1,7B | 10 | Sí | No | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | ~0,6B | 10 | Sí | No | Apache 2.0 |

No se dispone en la información proporcionada de datos comparativos de rendimiento (benchmarks, MOS, WER) frente a modelos TTS de otros desarrolladores.

## Limitaciones y advertencias

- No se han documentado en la información disponible sesgos conocidos del modelo; al ser un sistema de síntesis de voz, existe riesgo de reproducir sesgos de género, edad o dialecto asociados a los timbres predefinidos.
- Riesgo de alucinación acústica y de errores de pronunciación en textos con ruido, nombres propios o terminología especializada, aunque la model card declara mayor robustez frente a entrada ruidosa.
- La longitud de contexto no está especificada, por lo que se desconoce el límite práctico de texto por petición.
- El repositorio concreto analizado (`th-shubham/Qwen3-TTS-12Hz-1.7B-CustomVoice`) registra 0 descargas y 0 likes, y no consta como publicación oficial del equipo Qwen; conviene verificar su procedencia frente al repositorio oficial `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`.
- Aunque la licencia es Apache 2.0, el uso comercial de voces sintéticas puede estar sujeto a normativa adicional sobre deepfakes y suplantación de identidad en la jurisdicción de despliegue.
- No se documentan requisitos de atribución ni restricciones adicionales más allá de las de Apache 2.0.
- Para producción en tiempo real es necesario validar la latencia real en el hardware objetivo, ya que la cifra de 97 ms corresponde a las condiciones declaradas por el autor.

## Enlaces

- [Hugging Face: th-shubham/Qwen3-TTS-12Hz-1.7B-CustomVoice](https://huggingface.co/th-shubham/Qwen3-TTS-12Hz-1.7B-CustomVoice)
- [Repositorio oficial en Hugging Face: Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)
- [Tokenizador: Qwen/Qwen3-TTS-Tokenizer-12Hz](https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz)
- [Referencia arXiv citada en los tags: arxiv:2601.15621](https://arxiv.org/abs/2601.15621)
- [ModelScope: Qwen3-TTS-12Hz-1.7B-CustomVoice](https://modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)
