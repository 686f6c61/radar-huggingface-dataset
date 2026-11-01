# wtvff/Qwen3-TTS-12Hz-1.7B-Base

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es el modelo base de la familia Qwen3-TTS, un sistema de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba. Este checkpoint concreto, publicado en el repositorio `wtvff/Qwen3-TTS-12Hz-1.7B-Base`, corresponde a la variante base de 1.700 millones de parámetros (1.928.677.440 reales según los pesos en safetensors) que sirve como punto de partida para clonación rápida de voz y para ajuste fino (fine-tuning) de otros modelos de la familia.

El modelo emplea una arquitectura de lenguaje autorregresivo con múltiples codebooks discretos (discrete multi-codebook LM) que modela la señal de voz de extremo a extremo, apoyándose en el tokenizador propio Qwen3-TTS-Tokenizer-12Hz para la compresión acústica. Esto evita el esquema clásico LM+DiT y sus cuellos de botella de información, y permite generar audio de alta fidelidad con una latencia de extremo a extremo de hasta 97 ms en modo streaming gracias a su arquitectura híbrida de doble pista (Dual-Track).

Es relevante ahora porque cubre 10 idiomas principales (incluido el español), soporta clonación de voz con tan solo 3 segundos de audio de referencia y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial e integración en productos de voz conversacional, doblaje o accesibilidad. Su tamaño contenido lo hace desplegable en infraestructura modesta comparado con modelos TTS de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM autorregresivo con tokenizador acústico discreto multi-codebook (Qwen3-TTS-Tokenizer-12Hz); streaming híbrido Dual-Track |
| Parametros totales | 1.928.677.440 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura de lenguaje autorregresivo que opera sobre tokens discretos de audio producidos por el tokenizador Qwen3-TTS-Tokenizer-12Hz. Este tokenizador realiza compresión acústica eficiente y modelado semántico de alta dimensión, preservando información paralingüística y características del entorno acústico, y permite reconstruir la voz mediante una arquitectura ligera no-DiT. El LM multi-codebook modela de forma conjunta toda la información de la señal, lo que según el autor elimina las pérdidas de información y los errores en cascada típicos de los esquemas LM+DiT.

La innovación técnica destacada es la arquitectura de generación en streaming híbrida Dual-Track, que permite a un mismo modelo operar en modo streaming y no streaming, emitiendo el primer paquete de audio tras introducir un solo carácter y alcanzando una latencia de extremo a extremo de 97 ms. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) de alta fidelidad en 10 idiomas, incluido el español.
- Clonación rápida de voz a partir de 3 segundos de audio de referencia del usuario.
- Generación en streaming y no streaming con el mismo modelo.
- Comprensión contextual del texto para adaptar tono, ritmo y expresión emocional de forma adaptativa.
- Robustez mejorada frente a texto de entrada ruidoso.
- Preservación de información paralingüística y del entorno acústico en la reconstrucción.
- Base para ajuste fino (fine-tuning) de otros modelos de la familia Qwen3-TTS.
- Perfiles de voz dialectales (según la descripción general de la familia).
- No se documenta en la información disponible soporte de tool calling, agentes ni visión.

## Casos de uso

- Clonación de voz para asistentes personalizados: con solo 3 segundos de audio de referencia, el modelo puede generar una voz sintética consistente para un asistente conversacional, adecuado por su bajo coste de personalización.
- Atención al cliente con voz sintética en tiempo real: el modo streaming con latencia de 97 ms permite respuestas habladas fluidas en sistemas de IVR o chatbots telefónicos.
- Doblaje y localización de contenido: al cubrir 10 idiomas incluido el español, puede generar pistas de voz para vídeos, cursos o audiolibros adaptando tono y prosodia al texto.
- Accesibilidad y lectura de textos: conversión de documentos, artículos o interfaces a voz natural para usuarios con discapacidad visual, con control de ritmo y emoción.
- Generación de voces para videojuegos y contenido interactivo: el streaming y el control de expresión permiten diálogos dinámicos de personajes no jugables.
- Punto de partida para fine-tuning de dominios específicos: al ser el modelo base, equipos pueden ajustarlo con datos propios (por ejemplo, vocabulario técnico o acentos regionales) para desplegar TTS especializado.
- Prototipado rápido de productos de voz: su tamaño de 1.7B y licencia Apache 2.0 facilitan experimentación e integración en pipelines de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.928.677.440 parámetros y pesos en safetensors (repo de 4.5 GB), la inferencia en precisión original requiere aproximadamente 4 GB solo para pesos, más overhead de activaciones y del tokenizador.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, GPUs con 8-16 GB de VRAM (RTX 4090, A100, H100) son candidatas razonables, pero no se confirma oficialmente.
- Compatibilidad con GPU de consumo: probable en tarjetas con al menos 8 GB de VRAM, aunque no confirmado por el autor en la información disponible.
- Opciones de despliegue: el autor menciona el paquete `qwen-tts` y vLLM para la carga de pesos; también se documenta la descarga vía ModelScope y Hugging Face CLI.
- Latencia y throughput: latencia de extremo a extremo de hasta 97 ms en modo streaming según el autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Clonacion de voz | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 1.93B | 10 | Sí | Sí (3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | ~1.7B (no confirmado) | 10 | Sí | No (9 timbres predefinidos) | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-Base | ~0.6B (no confirmado) | 10 | Sí | Sí (3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-CustomVoice | ~0.6B (no confirmado) | 10 | Sí | No (9 timbres predefinidos) | Apache 2.0 |

No se dispone en la información proporcionada de comparaciones con modelos TTS de otros desarrolladores (por ejemplo, de otras familias), por lo que la comparativa se limita a las variantes de la propia familia Qwen3-TTS.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información disponible; como todo modelo entrenado con datos reales, puede heredar sesgos de acento, género o dialecto.
- Riesgo de alucinación acústica o artefactos en la síntesis, especialmente con texto de entrada ambiguo o fuera de distribución.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; es responsabilidad del integrador aplicar consentimiento y controles.
- Longitud de contexto no documentada, lo que limita planificar entradas de texto muy largas sin pruebas previas.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar las condiciones de los datos de entrenamiento y del tokenizador asociado.
- El modelo no incluye control por instrucciones (a diferencia de las variantes VoiceDesign y CustomVoice), por lo que el control fino de timbre y emoción requiere fine-tuning.
- El repositorio `wtvff/Qwen3-TTS-12Hz-1.7B-Base` tiene muy pocas descargas (30) y 0 likes, lo que sugiere que es una réplica no oficial del modelo original de Qwen; para producción se recomienda usar el repositorio oficial `Qwen/Qwen3-TTS-12Hz-1.7B-Base`.

## Enlaces

- Hugging Face (réplica): https://huggingface.co/wtvff/Qwen3-TTS-12Hz-1.7B-Base
- Hugging Face (oficial, referenciado en la model card): https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Tokenizador oficial: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Variante VoiceDesign: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Variante CustomVoice: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- ModelScope (descarga): https://modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Paper referenciado (arXiv:2601.15621): https://arxiv.org/abs/2601.15621
