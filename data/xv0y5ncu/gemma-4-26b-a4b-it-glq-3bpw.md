# xv0y5ncu/gemma-4-26B-A4B-it-GLQ-3bpw

## Resumen

Este modelo es una cuantización de alta eficiencia del modelo multimodal `google/gemma-4-26B-A4B-it`, desarrollado por Google DeepMind. La cuantización, realizada por el autor `xv0y5ncu`, utiliza el método GLQ (E8-lattice codebook + randomized Hadamard transform + LDLQ) a 3.0 bits por peso, reduciendo el tamaño del modelo de 26B parámetros a un archivo de 7.485 millones de parámetros (15 GB en disco). Esto permite ejecutar un modelo de última generación en hardware con menos memoria, manteniendo la calidad en tareas de texto, razonamiento y multimodalidad.

El modelo base, Gemma 4 26B A4B, es un Mixture-of-Experts (MoE) con 26B parámetros totales y 4B activos, con una ventana de contexto de 256K tokens. La cuantización GLQ se aplica exclusivamente al decodificador de texto; los módulos de visión y audio se conservan en su formato nativo. El resultado es un modelo multimodal que puede procesar imágenes y texto, con soporte para thinking mode y function calling, y que se puede desplegar en entornos desde teléfonos de gama alta hasta servidores, democratizando el acceso a IA de última generación.

La relevancia de este modelo radica en su capacidad para mantener un rendimiento competitivo (SQNR de 14.16 dB en 7885 capas) mientras reduce drásticamente los requisitos de VRAM. Además, incluye una opción de KV cache cuantizada con E8, que reduce el espacio de la caché en ~4×, permitiendo contextos aún más largos en el mismo hardware. Es una opción práctica para desarrolladores que buscan desplegar un modelo multimodal de alto rendimiento sin necesidad de GPUs de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) Transformer multimodal (texto + imagen) |
| Parámetros totales | 26B (modelo base) · 7.485.075.406 (archivo safetensors) |
| Parámetros activos | 4B (según modelo base) |
| Longitud de contexto | 256K tokens (según modelo base) |
| Tipos de cuantización | GLQ 3.0 bpw (uniforme) · KV cache E8 (opcional) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con términos específicos de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un MoE de 26B parámetros con 4B activos por token, diseñado para procesamiento multimodal (imagen y texto). La cuantización GLQ se aplica únicamente al decodificador de texto, dejando los módulos de visión en su formato original. El método GLQ comprime los pesos en grupos de 8, aplicando una transformada de Hadamard aleatorizada y una cuantización LDLQ con un codebook de 65,536 puntos del lattice E8. El proceso de calibración se realizó con 128 muestras de WikiText-2, cada una de 2048 tokens, logrando una SQNR media de 14.16 dB sobre 7885 capas cuantizadas. No se dispone de información detallada sobre el entrenamiento del modelo base (datos, técnicas de RLHF/DPO, etc.) más allá de lo publicado por Google DeepMind.

## Capacidades

- Generación de texto y razonamiento multi-step con thinking mode (según la documentación de Gemma 4).
- Procesamiento multimodal: acepta imágenes como entrada y genera texto (también soporta video y audio según la model card, aunque no se detalla).
- Soporte de function calling / tool calling, lo que permite integrar el modelo en flujos de agentes y pipelines de automatización.
- Capacidades multilingües (aunque no se especifican los idiomas en la información disponible).
- Soporte de agentes y razonamiento multi-paso, con contexto de hasta 256K tokens.
- Compatible con despliegue a través de vLLM (recomendado) y Transformers, con integración para agentes de código como pi-code y opencode.

## Casos de uso

- **Atención al cliente automatizada**: gracias a su ventana de contexto de 256K tokens, puede gestionar conversaciones multi-turno con historial extenso y documentos adjuntos, manteniendo coherencia a lo largo de la interacción.
- **Generación de código en producción**: con soporte de function calling, se puede integrar en pipelines de CI/CD para generar, revisar y corregir código. El ejemplo de uso con pi-code y opencode muestra cómo se puede servir como endpoint OpenAI-compatible.
- **Análisis de documentos con imágenes**: al ser multimodal, puede extraer información de documentos escaneados, diagramas y capturas de pantalla, y responder preguntas sobre ellos.
- **Asistente de razonamiento para investigación**: su modo de pensamiento permite descomponer problemas complejos en pasos lógicos, útil para análisis de datos, planificación de experimentos o resolución de problemas matemáticos.
- **Despliegue en entornos con recursos limitados**: gracias a la cuantización de 3 bpw y la opción de KV cache E8, se puede ejecutar en GPUs de consumo (como RTX 4090) o incluso en dispositivos de gama alta, sin sacrificar la calidad del texto.
- **Servicio de inferencia de alta concurrencia**: al usar vLLM, se puede servir el modelo con alta eficiencia para aplicaciones multi-usuario, manteniendo baja latencia gracias a la optimización de kernels CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas como MMLU, HumanEval o GSM8K para este modelo cuantizado ni para el modelo base en la documentación proporcionada.

## Requisitos de hardware

- El tamaño del repositorio es de 15.0 GB, lo que sugiere que el modelo puede cargarse en GPUs con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A4000). Sin embargo, no se especifican datos de VRAM exacta para la inferencia.
- La cuantización de 3.0 bpw reduce el peso del modelo a ~7.48B parámetros, lo que implica un footprint de memoria inferior a los 26B originales. Se recomienda usar vLLM para optimizar la memoria.
- Opciones de despliegue: vLLM (recomendado), Transformers (con la integración de GLQ), y se puede servir como endpoint OpenAI-compatible para agentes.
- La opción de KV cache E8 permite reducir el espacio de caché en ~4×, lo que facilita contextos largos en la misma VRAM.
- No se proporcionan datos de latencia o throughput específicos.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre otros modelos de tamaño y características comparables (como Mixtral 8x7B, Qwen 2.5 MoE o Llama 3.1 70B) para realizar una comparativa fiable.

## Limitaciones y advertencias

- La cuantización GLQ introduce una pérdida de precisión (SQNR media de 14.16 dB), que puede afectar a tareas que requieren alta exactitud numérica, aunque el autor indica que el rango óptimo es 2–4 bits.
- El modelo base es multimodal, pero la cuantización solo se aplica al decodificador de texto; los módulos de visión no están optimizados, lo que puede limitar el rendimiento en tareas de imagen.
- La licencia es Apache 2.0, pero con términos específicos de Gemma 4 (enlace en la documentación). Es necesario revisar las restricciones comerciales y de uso.
- La versión de Transformers debe ser `>=5.13.1,<5.15`; la versión 5.15.0 introduce un cambio que rompe la carga del modelo (error en `config.head_dim`). Esto puede afectar a despliegues en producción si se actualiza la librería.
- No se especifican los idiomas soportados, por lo que no se puede garantizar el rendimiento en idiomas distintos del inglés.
- El modelo es multimodal, pero la cuantización no cubre las partes de visión/audio, lo que puede implicar un mayor uso de VRAM para esas entradas.
- Como con cualquier modelo de lenguaje, existe riesgo de alucinación y sesgos; no se han documentado medidas de mitigación específicas.

## Enlaces

- [Hugging Face - xv0y5ncu/gemma-4-26B-A4B-it-GLQ-3bpw](https://huggingface.co/xv0y5ncu/gemma-4-26B-A4B-it-GLQ-3bpw)
- [Modelo base: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Repositorio GLQ (GitHub)](https://github.com/cnygaard/glq)
- [Página de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Documentación de Gemma 4 26B A4B IT en Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
- [Gemma 4 26B A4B IT en Vast.ai](https://vast.ai/model/gemma-4-26b-a4b-it)
