# Yiriru/gemma-4-E4B-it-qat-GGUF

## Resumen

Gemma 4 E4B it QAT (GGUF) es una conversión al formato GGUF del modelo google/gemma-4-E4B-it-qat-q4_0-unquantized, publicada por el usuario Yiriru en Hugging Face. El modelo base pertenece a la familia Gemma 4 de Google DeepMind, una serie de modelos abiertos multimodales (texto, imagen, vídeo y audio en los tamaños pequeños) optimizados con Quantization-Aware Training (QAT), una técnica que permite mantener una calidad cercana a la de los pesos en bfloat16 reduciendo drásticamente los requisitos de memoria. La variante E4B es un modelo denso de aproximadamente 4,5 mil millones de parámetros efectivos (8 mil millones contando embeddings), orientado a ejecución en portátiles y dispositivos edge.

La relevancia de esta conversión radica en que ofrece un formato listo para desplegar con ecosistemas ampliamente compatibles (llama.cpp, Ollama, LM Studio), manteniendo las capacidades de la familia Gemma 4: ventana de contexto de 128K tokens, soporte de más de 140 idiomas, modos de razonamiento configurables, function calling nativo y entrada multimodal. El autor verifica la calidad de la conversión comparando contra BF16, con un acuerdo de pesos del 99,81 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (sliding window + global), multimodal (image-text-to-text) |
| Parametros totales | 4,5B efectivos (8B con embeddings); el repositorio safetensors reporta 77.993.732 (dato de metadatos, probablemente incompleto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | QAT Q4_0 (GGUF); el modelo base existe también en BF16 sin cuantizar, wNa8o8 (móvil) y w4a16 (compressed-tensors para vLLM) |
| Idiomas soportados | Más de 140 idiomas (según la familia Gemma 4); lista exacta no disponible |
| Licencia | Apache 2.0 (con licencia de términos de Gemma de Google: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (Q4_0); tamaño del repositorio: 21,9 GB |

## Arquitectura y entrenamiento

Gemma 4 E4B emplea una arquitectura transformer densa con un mecanismo de atención híbrido que intercala capas de atención local por ventana deslizante (512 tokens en el caso de E4B) con capas de atención global completa, garantizando que la última capa sea siempre global. Este diseño combina la velocidad y el bajo consumo de memoria de los modelos ligeros con la conciencia de contexto largo necesaria para tareas complejas. Para optimizar memoria en contextos largos, las capas globales comparten claves y valores (unified KV) y aplican Proportional RoPE (p-RoPE).

El modelo base fue entrenado por Google DeepMind dentro de la familia Gemma 4, disponible en variantes pre-entrenadas y con ajuste por instrucciones (la variante "it" de esta ficha). Los detalles del corpus de entrenamiento (número de tokens, composición) no están disponibles en la información proporcionada. La innovación clave de esta versión es el QAT: la cuantización a 4 bits se tiene en cuenta durante el entrenamiento, de modo que el checkpoint Q4_0 conserva calidad cercana a BF16. La conversión GGUF de este repositorio reporta métricas de verificación contra BF16: acuerdo del 99,806 % de pesos, 96,98 % de bloques perfectos, RMSE de 5,76e-05 y error absoluto máximo de 0,0026. La familia soporta además decodificación especulativa mediante modelos asistente (drafter), que en el caso de objetivos QAT deben ser también checkpoints QAT con la misma precisión.

## Capacidades

- Generación de texto conversacional con soporte nativo del rol `system` para conversaciones más estructuradas y controlables.
- Razonamiento con modos de thinking configurables, presente en toda la familia Gemma 4.
- Comprensión multimodal: entrada de texto e imagen (con soporte de relación de aspecto y resolución variables), vídeo, y audio de forma nativa en los modelos E2B, E4B y 12B.
- Generación y comprensión de código, con mejoras destacadas en benchmarks de programación respecto a generaciones anteriores.
- Function calling / tool calling nativo, orientado a flujos agénticos y agentes autónomos multi-paso.
- Contexto largo de 128K tokens, adecuado para documentos extensos y conversaciones largas.
- Soporte multilingüe en más de 140 idiomas.
- Optimización para ejecución local en portátiles y dispositivos edge.

## Casos de uso

- Asistentes conversacionales locales: gracias al soporte nativo del rol `system` y al contexto de 128K tokens, se puede desplegar un asistente multi-turno en un portátil sin conexión a servicios externos, manteniendo privacidad de los datos.
- Análisis de documentos largos: la ventana de 128K tokens permite resumir, extraer información y responder preguntas sobre informes, contratos o documentación técnica extensa en una sola pasada.
- Atención al cliente automatizada: el function calling nativo permite integrar el modelo con APIs internas (consultas de pedidos, gestión de tickets) en flujos conversacionales multi-turno con herramientas.
- Agentes autónomos multi-paso: las capacidades agénticas mejoradas y el tool calling nativo lo hacen adecuado para pipelines de automatización donde el modelo planifica, llama herramientas y razona sobre resultados.
- Comprensión de imágenes y vídeo: clasificación, descripción y extracción de información de imágenes con resoluciones y relaciones de aspecto variables, útil para moderación de contenidos o indexación de bibliotecas multimedia.
- Procesamiento de audio: al soportar audio de forma nativa, puede emplearse en transcripción, análisis de grabaciones o interfaces de voz en dispositivos locales.
- Asistente de código en local: generación y revisión de código integrada en editores mediante backends como llama.cpp u Ollama, con bajo consumo de VRAM gracias a la cuantización Q4_0.
- Despliegue en dispositivos edge y móviles: los tamaños E2B/E4B están diseñados explícitamente para hardware de consumo, y existen variantes wNa8o8 optimizadas para móvil dentro de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras notables en benchmarks de código respecto a generaciones anteriores, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos Q4_0 en GGUF y un tamaño efectivo de ~4,5B parámetros (8B con embeddings), el repositorio ocupa 21,9 GB; la carga del modelo requiere del orden de 3-6 GB de VRAM/RAM, aunque la cifra exacta por variante no está disponible.
- GPU recomendadas: no disponible en la información proporcionada. Por el perfil del modelo (orientado a portátiles y edge), es plausible su ejecución en GPUs de consumo, pero no hay datos oficiales concretos.
- Consumer GPU: el objetivo declarado de la familia E4B es la ejecución eficiente en portátiles y dispositivos locales; la cuantización Q4_0 está diseñada precisamente para reducir la memoria necesaria respecto a BF16.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) al tratarse de un GGUF; el ecosistema Gemma 4 ofrece además vLLM (formato compressed-tensors w4a16) y esquema móvil wNa8o8 para otras variantes del mismo modelo base.
- Latencia y throughput: no disponibles. La atención híbrida con ventanas deslizantes de 512 tokens está diseñada para reducir el coste de procesamiento en contextos largos.
- Decodificación especulativa: soportada mediante modelos drafter, siempre que el asistente sea también un checkpoint QAT con la misma precisión.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Gemma 4 E4B it QAT (este modelo) | Denso, atención híbrida | 4,5B efectivos (8B con embeddings) | 128K | Imagen, vídeo, audio | Apache 2.0 (términos Gemma) |
| Gemma 4 E2B it QAT | Denso, atención híbrida | 2,3B efectivos (5,1B con embeddings) | 128K | Imagen, vídeo, audio | Apache 2.0 (términos Gemma) |
| Gemma 4 12B Unified | Denso | 11,95B | 256K | Imagen, vídeo, audio | Apache 2.0 (términos Gemma) |
| Gemma 4 26B A4B | MoE | 26B (A4B activos, según nomenclatura) | 256K | No disponible | Apache 2.0 (términos Gemma) |

Dentro de la misma familia, E4B ofrece un equilibrio entre capacidad y requisitos de hardware: más capaz que E2B y mucho más ligero que 12B o 31B, lo que lo sitúa como opción preferente para ejecución local en portátiles. Comparativas de rendimiento numérico con modelos de otros fabricantes: no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada. Como modelo de propósito general entrenado por Google DeepMind, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no hay datos específicos publicados para esta variante.
- Limitaciones de contexto: 128K tokens, inferior al límite de 256K de los modelos medianos (12B, 26B A4B, 31B) de la misma familia.
- Licencia: aunque el repositorio se publica bajo Apache 2.0, la model card enlaza a la licencia de términos de Gemma de Google (https://ai.google.dev/gemma/docs/gemma_4_license), que puede imponer condiciones de uso adicionales; conviene revisarla antes de cualquier despliegue comercial.
- La conversión GGUF es una reproducción comunitaria (realizada con Codex CLI siguiendo la guía de Unsloth), no oficial de Google: aunque las métricas de verificación son buenas (99,81 % de acuerdo con BF16), existen pequeñas discrepancias de pesos (error absoluto máximo de 0,0026).
- Si se usa decodificación especulativa, el modelo asistente debe ser también un checkpoint QAT con la misma precisión; mezclar precisiones no es compatible.
- La cifra de parámetros de los metadatos del repositorio (77.993.732) no coincide con el tamaño real del modelo y parece un dato de metadatos incompleto; no debe usarse para dimensionar hardware.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yiriru/gemma-4-E4B-it-qat-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Colección Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Technical report (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de referencia de la conversión (Unsloth): https://unsloth.ai/docs/models/gemma-4/qat
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
