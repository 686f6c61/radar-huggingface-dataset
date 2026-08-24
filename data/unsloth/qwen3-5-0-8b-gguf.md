# unsloth/Qwen3.5-0.8B-GGUF

## Resumen

Qwen3.5-0.8B es un modelo de lenguaje causal multimodal desarrollado por Alibaba, publicado en su versión cuantizada GGUF por Unsloth. Forma parte de la familia Qwen3.5, que integra avances en aprendizaje multimodal, arquitectura híbrida eficiente y escalado de reinforcement learning. Este modelo en concreto es el más pequeño de la serie Small (0.8B, 2B, 4B y 9B) y está diseñado para prototipado, fine-tuning específico y entornos con recursos limitados.

El modelo combina un encoder visual con un núcleo de lenguaje basado en una arquitectura híbrida que alterna capas de Gated DeltaNet (atención lineal) con capas de atención clásica, logrando una ventana de contexto nativa de 262.144 tokens. La versión GGUF de Unsloth utiliza su técnica Dynamic 2.0 para ofrecer cuantizaciones con mejor precisión que los métodos convencionales. Con 752 millones de parámetros, es adecuado para ejecutarse en hardware de consumo y para experimentación rápida.

La relevancia de este modelo radica en su capacidad multimodal (imagen y texto) en un tamaño muy reducido, lo que permite desplegar asistentes visuales, agentes y herramientas de razonamiento en dispositivos edge o GPUs domésticas. Su licencia Apache 2.0 facilita su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 752.393.024 (0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0, múltiples tamaños) |
| Idiomas soportados | 201 lenguas y dialectos (según anuncio de Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

Qwen3.5-0.8B emplea una arquitectura híbrida que combina capas de Gated DeltaNet (una variante de atención lineal con estado recurrente) con capas de atención clásica. La configuración concreta es: 24 capas organizadas en 6 bloques, cada uno con 3 sub-bloques de (Gated DeltaNet → FFN) seguidos de 1 sub-bloque de (Gated Attention → FFN). El Gated DeltaNet utiliza 16 cabezas lineales para V y 16 para QK con dimensión 128, mientras que la atención clásica usa 8 cabezas Q y 2 KV con dimensión 256 y RoPE de 64 dimensiones. El embedding de tokens tiene 248.320 entradas (padded) y está atado a la salida LM. Además, incorpora un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos.

El entrenamiento incluye una fase de pre-entrenamiento y post-entrenamiento con reinforcement learning escalado a entornos de millones de agentes, según el anuncio de Qwen3.5. La integración multimodal se realiza mediante fusión temprana de tokens visuales y textuales, logrando una eficiencia de entrenamiento cercana al 100% respecto a modelos solo de texto. No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento: soporta modos de pensamiento (thinking) y no pensamiento, similar a otros modelos Qwen3.
- Comprensión de imágenes: al ser un modelo image-text-to-text, puede procesar imágenes y responder preguntas sobre su contenido, realizar OCR, descripción de escenas, etc.
- Soporte de tool calling y function calling: integrable en pipelines de agentes.
- Capacidades multilingües: cobertura de 201 lenguas y dialectos, con matices culturales y regionales.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos o conversaciones multi-turno con historial amplio.
- Fine-tuning eficiente: compatible con Unsloth para ajuste local con bajo consumo de memoria.

## Casos de uso

- Asistentes de atención al cliente en dispositivos edge: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262k tokens) y comprender capturas de pantalla o imágenes enviadas por el usuario, lo que permite resolver incidencias técnicas sin necesidad de servidores potentes.
- Prototipado rápido de aplicaciones multimodales: gracias a su pequeño tamaño y licencia permisiva, es ideal para validar ideas de productos que combinen visión y lenguaje antes de escalar a modelos mayores.
- Generación de código asistida por imágenes: un desarrollador puede fotografiar un diagrama o un error en pantalla y el modelo sugiere correcciones o genera código relevante, funcionando como copiloto ligero.
- Análisis de documentos escaneados: con su capacidad OCR y de razonamiento, puede extraer información de facturas, formularios o contratos en múltiples idiomas, incluso con contexto largo para documentos extensos.
- Agentes autónomos en entornos con restricciones de hardware: su tamaño permite ejecutarlo en una Raspberry Pi o en una GPU integrada, posibilitando agentes de automatización del hogar o robots educativos que interpreten su entorno visual.
- Fine-tuning específico para dominios verticales: por su bajo coste de entrenamiento, se puede ajustar con datos propios (por ejemplo, diagnóstico de imágenes médicas o mantenimiento industrial) y desplegar en local con privacidad total.

## Benchmarks y rendimiento

La model card incluye una tabla de MMLU-Pro en modo no-pensamiento, pero el valor para Qwen3.5-0.8B no está completo en la información disponible. Los datos parciales son:

| Modelo | MMLU-Pro (non-thinking) |
|---|---|
| Qwen3-4B-2507 | 69.6 |
| Qwen3-1.7B | 40.2 |
| Qwen3.5-2B | 55.3 |
| Qwen3.5-0.8B | no disponible |

No se han publicado resultados completos de benchmarks en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0.8B, las cuantizaciones GGUF de 4 bits requieren aproximadamente 0.5-0.7 GB de VRAM, y las de 8 bits alrededor de 1-1.5 GB. El modelo completo en FP16 ocupa unos 1.5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2050, o incluso iGPU con suficiente memoria compartida). Para mayor velocidad, una RTX 3060 o superior es suficiente.
- Cabe en GPUs de consumo: sí, incluso en placas con 4 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI, o mediante Transformers con el modelo base en safetensors.
- Latencia y throughput: no se han publicado cifras oficiales, pero por su tamaño se espera una generación de decenas de tokens por segundo en hardware moderno de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | MMLU-Pro |
|---|---|---|---|---|---|
| Qwen3.5-0.8B | 0.8B | 262k | Apache 2.0 | Sí | no disponible |
| Qwen3-1.7B | 1.7B | 256k (según Qwen3) | Apache 2.0 | No | 40.2 |
| Qwen3-4B-2507 | 4B | 256k | Apache 2.0 | No | 69.6 |
| Llama 3.2 1B | 1B | 128k | Llama 3.2 | No | no disponible |

La comparativa muestra que Qwen3.5-0.8B ofrece multimodalidad y contexto más largo que sus competidores directos de tamaño similar, aunque con menos parámetros que Qwen3-1.7B. Su rendimiento en benchmarks no está disponible, por lo que no se puede evaluar la relación calidad-tamaño.

## Limitaciones y advertencias

- Al ser un modelo de 0.8B, su capacidad de razonamiento complejo y de seguir instrucciones es limitada en comparación con modelos de mayor tamaño. Puede cometer errores en tareas que requieren abstracción avanzada.
- Riesgo de alucinación: como todos los modelos generativos, puede inventar información, especialmente en dominios poco representados en su entrenamiento.
- La información sobre idiomas (201 lenguas) proviene del anuncio de Qwen3.5, pero no se ha verificado en la ficha de HuggingFace; se recomienda probar con casos reales.
- El modelo es multimodal, pero la calidad de la comprensión visual puede ser inferior a la de modelos especializados más grandes.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen3.5-0.8B puede tener términos adicionales en su documentación original; se recomienda revisar el LICENSE del repositorio base.
- La cuantización GGUF introduce pérdida de precisión; para tareas críticas se recomienda usar el modelo en FP16 o cuantizaciones de mayor bit.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Guía de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Documentación de Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
