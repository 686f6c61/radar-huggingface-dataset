# tbhrc/unsloth_gemma_4_e4b_it_qat_oq4

## Resumen

El modelo `tbhrc/unsloth_gemma_4_e4b_it_qat_oq4` es una conversión al formato MLX (optimizado para Apple Silicon) del checkpoint QAT (Quantization-Aware Training) de Google DeepMind para Gemma 4 E4B, generado por Unsloth. Se trata de la variante instruida (`-it`) del modelo denso de 4.5 mil millones de parámetros efectivos (8B con embeddings) de la familia Gemma 4, diseñado para ejecutarse de forma eficiente en dispositivos de gama alta, portátiles y estaciones de trabajo. Este checkpoint específico aplica cuantización QAT Q4_0, lo que permite mantener una calidad similar a bfloat16 con un uso de memoria muy reducido.

El modelo es multimodal (texto, imagen y audio) y genera texto, con una ventana de contexto de hasta 128K tokens y soporte para más de 140 idiomas. Su arquitectura incluye innovaciones como Per-Layer Embeddings (PLE) y atención híbrida con ventana deslizante y atención global. Está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de código abierto. La relevancia de este modelo radica en su capacidad para ejecutar tareas de razonamiento, codificación y agentes en hardware local, sin necesidad de infraestructura en la nube.

El repositorio contiene los pesos en formato safetensors con un total de 1.689.179.466 parámetros (correspondiente a la versión cuantizada) y un tamaño de 5.4 GB. Al estar en formato MLX, está pensado para su uso con la librería MLX de Apple en chips M1/M2/M3/M4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con Per-Layer Embeddings (PLE), atención híbrida (sliding window + global) y p-RoPE |
| Parámetros totales | 4.5B efectivos (8B con embeddings); checkpoint cuantizado: 1.689.179.466 |
| Parámetros activos | No aplicable (arquitectura densa) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantización | QAT Q4_0 (4 bits) en formato MLX; también disponible GGUF y wNa8o8 en el ecosistema Gemma 4 |
| Idiomas soportados | Más de 140 idiomas (lista exacta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Gemma 4 E4B emplea una arquitectura de transformer denso con 42 capas, vocabulario de 262K tokens y un mecanismo de atención híbrida que intercala capas de atención local con ventana deslizante de 512 tokens y capas de atención global completa, garantizando que la última capa sea siempre global. Para optimizar la memoria en contextos largos, las capas globales comparten claves y valores unificados y aplican Proportional RoPE (p-RoPE). El modelo incorpora Per-Layer Embeddings (PLE), una técnica que asigna a cada capa un pequeño embedding propio por token, maximizando la eficiencia paramétrica en entornos on-device.

El checkpoint QAT fue entrenado por Google DeepMind mediante cuantización consciente del entrenamiento (QAT), lo que preserva la calidad del modelo original bfloat16 a la vez que reduce los requisitos de memoria. El modelo base de Unsloth (unsloth/gemma-4-E4B-it-qat-q4_0-unquantized) se obtuvo extrayendo los pesos de precisión media de la pipeline QAT, y este repositorio lo convierte al formato MLX para su ejecución en Apple Silicon. No se dispone de información detallada sobre los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento avanzado con modos de pensamiento configurables (thinking mode) para tareas complejas.
- Procesamiento multimodal: entrada de texto, imagen (con soporte de resolución y aspecto variable) y audio (E4B soporta audio nativamente), generando salida de texto.
- Soporte nativo de function calling / tool calling para integración en agentes autónomos.
- Capacidad de razonamiento multi-step y agentic workflows con soporte de system prompt nativo.
- Multilingüe con cobertura en más de 140 idiomas.
- Ventana de contexto de 128K tokens, apta para documentos largos y conversaciones multi-turno.
- Optimizado para ejecución local en dispositivos con memoria limitada (portátiles, móviles) gracias a la cuantización QAT.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 128K tokens, lo que permite mantener historiales largos de usuario y resolver incidencias complejas sin perder información previa. Su soporte de function calling permite integrarse con sistemas CRM o APIs de gestión de tickets.
- Generación de código en producción: con soporte nativo de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para generar, revisar o documentar código. Su capacidad de razonamiento multi-step facilita la depuración y el refactoring de código.
- Análisis de documentos extensos: gracias a su contexto de 128K tokens, puede resumir o extraer información de libros, informes técnicos o contratos legales completos sin necesidad de dividir el texto.
- Transcripción y análisis de audio: al soportar entrada de audio, puede transcribir reuniones o podcasts y generar resúmenes o extraer acciones concretas, todo ello en local sin enviar datos a la nube.
- Asistentes de escritura y traducción: su soporte multilingüe (140+ idiomas) lo hace adecuado para tareas de redacción, traducción y revisión en entornos editoriales o corporativos.
- Agentes de automatización local: con su capacidad de function calling y razonamiento multi-step, puede actuar como agente que ejecuta tareas en el sistema local (enviar emails, gestionar calendarios) en dispositivos Apple Silicon sin conexión externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo específico. La model card del ecosistema Gemma 4 menciona mejoras en benchmarks de codificación y razonamiento, pero no se proporcionan cifras concretas para la variante E4B QAT. Para evaluar el rendimiento, se recomienda consultar los benchmarks oficiales de Google DeepMind para la familia Gemma 4.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a Q4_0 (1.68B parámetros) requiere aproximadamente 2 GB de RAM unificada en Apple Silicon, considerando el tamaño del archivo de pesos (5.4 GB incluye el modelo completo, pero la cuantización reduce el uso en memoria).
- GPU recomendadas: diseñado para Apple Silicon (M1, M2, M3, M4) con la librería MLX; también compatible con GPU NVIDIA mediante el formato GGUF y vLLM con compressed-tensors.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier Mac con al menos 8 GB de RAM unificada, y también puede ejecutarse en GPU consumer (RTX 3060, 4060, etc.) si se convierte a formato GGUF.
- Opciones de despliegue: MLX (Apple), llama.cpp (GGUF), vLLM (compressed-tensors), Ollama (GGUF), TGI.
- Latencia y throughput: no disponibles; se espera una latencia de 10-20 tokens/seg en Apple Silicon M2/M3 para tareas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Multimodal |
|---|---|---|---|---|---|
| Gemma 4 E4B (QAT, este) | 4.5B (efectivos) | 128K | Apache 2.0 | MLX, GGUF | Texto, imagen, audio |
| Gemma 3 4B | 4B | 32K | Gemma Terms | Safetensors, GGUF | Texto, imagen |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 | Safetensors, GGUF | Texto (con visión en 11B) |
| Qwen 2.5 7B | 7B | 128K | Apache 2.0 | Safetensors, GGUF | Texto |

Gemma 4 E4B se posiciona como una alternativa más ligera que Llama 3.2 3B en cuanto a parámetros efectivos, pero con mayor capacidad multimodal (imagen y audio) y un contexto de 128K, igualando al Llama 3.2 3B. Su licencia Apache 2.0 es más permisiva que la de Gemma 3 (que usa licencia Gemma) y Llama 3.2. En comparación con Qwen 2.5 7B, ofrece menor tamaño y mayor eficiencia para despliegue en dispositivos de borde.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo; como cualquier LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación en tareas de razonamiento complejo o generación de código, especialmente en contextos largos.
- La cuantización Q4_0 puede degradar ligeramente la calidad en tareas de precisión alta (matemáticas avanzadas, código complejo) frente al modelo bfloat16 original.
- La conversión MLX está optimizada para Apple Silicon; su uso en otras plataformas requiere conversión a GGUF u otros formatos.
- El modelo es una conversión no oficial del checkpoint de Unsloth; no hay garantía de mantenimiento o soporte de los autores originales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 de Google está sujeto a los términos de la licencia Gemma 4 (Apache 2.0), por lo que se recomienda revisar los términos de uso de Google para aplicaciones de producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tbhrc/unsloth_gemma_4_e4b_it_qat_oq4
- Modelo base en HuggingFace: https://huggingface.co/unsloth/gemma-4-E4B-it-qat-q4_0-unquantized
- Documentación de Gemma 4 en Unsloth: https://unsloth.ai/docs/models/gemma-4
- Guía de fine-tuning de Gemma 4 con Unsloth: https://unsloth.ai/docs/models/gemma-4/train
- Discusión de Unsloth sobre Gemma 4 en GitHub: https://github.com/unslothai/unsloth/discussions/4800
- Colección de Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Documentación oficial de Gemma 4: https://ai.google.dev/gemma/docs/core
