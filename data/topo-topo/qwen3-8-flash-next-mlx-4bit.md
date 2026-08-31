# ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal experimental de Qwen, presentado como una vista previa de la arquitectura Qwen4. Se trata de un modelo de mezcla de expertos (MoE) ultra disperso con 125.000 millones de parámetros en el transformador, más una tabla de incrustaciones n-gram de 51.000 millones, lo que suma aproximadamente 176.000 millones de parámetros totales. Activa solo 6.000 millones de parámetros por token, lo que lo hace computacionalmente eficiente pese a su tamaño. La arquitectura combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA) en una disposición híbrida: tres de cada cuatro capas usan GDN para comprimir el historial, y la cuarta usa QSA para recuperación precisa de contexto largo.

Este repositorio concreto, `ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit`, es una conversión a formato MLX (Apple Silicon) con cuantización de 4 bits, realizada con la herramienta `mlx-vlm`. El autor indica que se requirió un tamaño de grupo de 32 para cuantizar correctamente la tabla n-gram, cuyo último dimensión es 160. El modelo resultante ocupa 104 GiB y está pensado para ejecutarse en equipos Apple con memoria unificada amplia. Es relevante porque permite probar localmente una arquitectura de vanguardia en hardware de consumo, aunque con requisitos de memoria elevados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA); 512 expertos, top-10 + experto compartido |
| Parametros totales | 125B (MoE) + 51B (n-gram) = ~176B según documentación del modelo base; el repo safetensors reporta 33.633.899.411 (33,6B) |
| Parametros activos | 6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (group size 32) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce cuatro innovaciones principales: atención híbrida GDN + QSA, una nueva arquitectura de residual, un sistema de incrustaciones basado en n-gram con tabla de 51B parámetros y optimizaciones de entrenamiento. La atención GDN comprime el historial en tres de cada cuatro capas, mientras que la cuarta capa usa atención dispersa de Qwen para recuperar información de largo alcance. El n-gram embedding es una tabla hasheada que complementa las incrustaciones token estándar, lo que aumenta la capacidad del modelo sin incrementar el coste de activación.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación consultada. El modelo se describe como una vista previa experimental de la arquitectura Qwen4, por lo que es probable que aún no haya pasado por un ciclo de alineación completo. La conversión a MLX excluye los cabezales MTP (multi-token prediction) durante el proceso, según indica la model card.

## Capacidades

- Generación de texto y conversación multimodal: acepta entradas de imagen y texto, y produce respuestas de texto.
- Razonamiento y comprensión de contexto largo gracias a la combinación de GDN y QSA.
- Capacidad de procesamiento de imágenes: puede describir, analizar y responder preguntas sobre contenido visual.
- Eficiencia computacional: al activar solo 6B parámetros por token, ofrece un rendimiento por parámetro activo muy alto.
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación, pero es habitual en modelos Qwen recientes; no se puede garantizar sin verificación.
- Capacidades multilingües: no especificadas; el modelo base de Qwen suele soportar múltiples idiomas, pero no hay datos concretos.

## Casos de uso

- Análisis de imágenes médicas: el modelo puede recibir radiografías o ecografías y generar informes descriptivos preliminares, aunque requiere validación experta.
- Asistente de accesibilidad para personas con discapacidad visual: describe escenas, objetos y texto en imágenes en tiempo real.
- Moderación de contenido visual: clasifica imágenes y genera descripciones para detectar contenido inapropiado en plataformas.
- Generación de subtítulos y metadatos para bibliotecas de imágenes: automatiza la catalogación de fotos en entornos empresariales.
- Chatbot multimodal para atención al cliente: responde consultas que incluyen capturas de pantalla o fotos de productos.
- Investigación en visión por computador: sirve como modelo base para fine-tuning en tareas específicas de imagen-texto.
- Prototipado de aplicaciones de realidad aumentada: genera descripciones contextuales de lo que ve la cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su conversión MLX.

## Requisitos de hardware

- El repositorio está diseñado para Apple Silicon con MLX. El tamaño del modelo es de 104 GiB en 4-bit, por lo que se necesita un Mac con al menos 128 GB de memoria unificada para cargarlo completo.
- Según la guía de atomic.chat para la versión GGUF, es posible ejecutar el modelo en un MacBook de 64 GB paginando la tabla n-gram desde SSD. Esta técnica también podría aplicarse a la versión MLX, aunque no está documentada en este repo.
- No es viable en GPUs de consumo convencionales (RTX 4090, etc.) debido al tamaño y al formato MLX.
- Para despliegue en GPU NVIDIA, habría que usar la versión bf16 original o cuantizaciones GGUF con llama.cpp o vLLM, pero este repo concreto no es adecuado.
- La inferencia se realiza con `mlx-vlm generate`; no se indican latencias ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~176B (125B MoE + 51B n-gram) | 6B | no disponible | qwen-community-1.0 | bf16 |
| Qwen2.5-VL-72B | 72B denso | 72B | 128K | Apache 2.0 | bf16 |
| DeepSeek-VL2 | 27B MoE | 4.1B | 4K | MIT | bf16 |

La comparativa es limitada porque no hay datos de rendimiento publicados para Qwen3.8-Flash-Next. En términos de arquitectura, es el primer modelo abierto con GDN + QSA y n-gram embedding, lo que lo distingue de alternativas densas o MoE convencionales.

## Limitaciones y advertencias

- Modelo experimental: es una vista previa de la arquitectura Qwen4, por lo que puede tener comportamientos inestables o errores no corregidos.
- Riesgo de alucinación: al ser un modelo multimodal sin alineación confirmada, puede generar descripciones inexactas de imágenes o inventar información.
- Requisitos de hardware muy elevados: 104 GiB en 4-bit, lo que limita su uso a equipos Apple con gran memoria unificada.
- Licencia qwen-community-1.0: es una licencia comunitaria de Qwen con restricciones de uso comercial; hay que revisar los términos exactos antes de desplegar en producción.
- Idiomas no especificados: no se garantiza un rendimiento uniforme en todos los idiomas.
- El repositorio reporta 33,6B parámetros en safetensors, lo que contradice la documentación del modelo base (176B). Esta discrepancia puede deberse a la exclusión del n-gram o a un error de contabilidad; conviene verificar antes de usarlo.
- Los cabezales MTP se excluyen en la conversión, por lo que no se puede usar decodificación especulativa con este repo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub oficial: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local (GGUF): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Conversión MLX alternativa: https://huggingface.co/RockTalk/Qwen3.8-Flash-Next-MLX-4bit
