# theoracleguy/Qwen3-TTS-12Hz-1.7B-Base-4bit

## Resumen

El modelo `theoracleguy/Qwen3-TTS-12Hz-1.7B-Base-4bit` es una conversión a formato MLX (Apple Silicon) del modelo original `Qwen/Qwen3-TTS-12Hz-1.7B-Base`, desarrollado por Qwen. Se trata de un sistema de síntesis de voz (text-to-speech) de extremo a extremo que emplea una arquitectura de modelo de lenguaje con múltiples codebooks discretos, lo que le permite generar audio de alta fidelidad con control fino sobre el tono, la velocidad de habla y la expresión emocional. Esta versión cuantizada a 4 bits reduce el tamaño del modelo para facilitar su ejecución en hardware de Apple, manteniendo un equilibrio entre calidad y eficiencia.

El modelo está pensado para aplicaciones que requieren generación de voz natural en varios idiomas, así como clonación de voz a partir de una muestra de referencia. Su tamaño compacto (1.7B parámetros nominales) y la cuantización lo hacen adecuado para despliegues en entornos con recursos limitados, aunque la conversión a MLX limita su uso a dispositivos con chips Apple Silicon. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje discreto multi-codebook (discrete multi-codebook LM) |
| Parametros totales | 632.539.200 (según safetensors; el nombre del modelo indica 1.7B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | 10 idiomas principales (no especificados en la información) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura se basa en un modelo de lenguaje autoregresivo que opera sobre representaciones discretas de audio, utilizando múltiples codebooks para capturar la información acústica y prosódica. Este enfoque de extremo a extremo evita pipelines separados de vocoder y permite una generación más coherente. El modelo original fue entrenado por Qwen con datos multilingües, aunque no se dispone de detalles sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. La versión MLX 4-bit es una conversión realizada por un tercero (theoracleguy) usando mlx-audio 0.3.0, por lo que el proceso de entrenamiento no ha sido modificado.

No se han publicado detalles adicionales sobre el entrenamiento en la información disponible.

## Capacidades

- Generación de voz natural a partir de texto en 10 idiomas principales, con control sobre tono, velocidad y emoción.
- Clonación de voz: permite sintetizar audio usando una muestra de referencia (ref_audio) para imitar una voz concreta.
- Síntesis de voz con contexto: el modelo puede interpretar instrucciones en lenguaje natural para ajustar el estilo de habla (en la variante VoiceDesign, no en esta versión base).
- Compatible con el ecosistema mlx-audio, facilitando su integración en aplicaciones Python y CLI.
- No incluye capacidades de tool calling, agentes ni razonamiento multimodal; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Asistentes de voz personalizados: el modelo puede generar respuestas habladas con entonación natural y control de emociones, integrándose en aplicaciones de asistente en dispositivos Apple.
- Audiolibros y narración automatizada: dado su soporte multilingüe y control prosódico, permite generar narraciones de larga duración con distintas voces y estilos.
- Doblaje y localización de contenido: mediante la clonación de voz, se puede adaptar diálogos a otros idiomas manteniendo la voz de un actor o personaje.
- Accesibilidad: conversión de texto a voz en tiempo real para personas con discapacidad visual o dificultades de lectura, con baja latencia en hardware Apple.
- Prototipado rápido de productos TTS: su licencia Apache 2.0 y tamaño reducido permiten experimentar sin costes de licencia y con requisitos de hardware modestos.
- Generación de contenido educativo: creación de material de aprendizaje auditivo en varios idiomas, con control de velocidad y entonación para diferentes niveles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas comparativas como MMLU, HumanEval o métricas específicas de TTS (MOS, WER) para este modelo.

## Requisitos de hardware

- Diseñado para ejecutarse en Apple Silicon (M1, M2, M3 o superiores) mediante el framework MLX.
- La cuantización 4-bit reduce el uso de memoria en comparación con la versión completa; el tamaño del repositorio es de 2.3 GB, lo que sugiere que puede cargarse en Macs con 8 GB de RAM o más.
- No compatible con GPUs NVIDIA o AMD; requiere el ecosistema MLX.
- Opciones de despliegue: mediante la librería mlx-audio (CLI o Python), sin soporte para vLLM, llama.cpp u otros servidores de inferencia estándar.
- La latencia y el throughput dependen del chip específico; no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Notas |
|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (original) | 1.7B | Apache 2.0 | safetensors | Modelo de referencia en formato PyTorch, sin cuantizar |
| Qwen3-TTS-12Hz-1.7B-Base-4bit (MLX) | 632M (cuantizado) | Apache 2.0 | MLX safetensors | Conversión a 4 bits para Apple Silicon |
| Piper TTS | 100M-300M | MIT | ONNX | Modelo ligero, menor calidad, sin clonación de voz |
| Coqui TTS | 100M-1B | MPL 2.0 | PyTorch | Soporta clonación de voz, pero requiere GPU NVIDIA |

La comparativa se basa en información general; no se dispone de benchmarks objetivos que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Conversión de terceros: no es una versión oficial de Qwen; el proceso de cuantización puede degradar ligeramente la calidad del audio.
- Exclusivo para Apple Silicon: no se puede ejecutar en hardware convencional con GPUs NVIDIA, limitando su portabilidad.
- Idiomas no especificados: aunque se mencionan 10 idiomas, no se detalla cuáles son; la cobertura real puede variar.
- Sin control de voz por instrucciones: esta versión base no incluye la funcionalidad VoiceDesign; para diseño de voz se necesita la variante específica.
- Riesgo de sesgos y alucinaciones prosódicas: como todo modelo generativo, puede producir entonaciones o pausas inesperadas en textos ambiguos.
- Sin garantías de producción: no hay documentación sobre latencia, throughput ni estabilidad en entornos de alto volumen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theoracleguy/Qwen3-TTS-12Hz-1.7B-Base-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio GitHub de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Variante VoiceDesign en MLX: https://huggingface.co/theoracleguy/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit
