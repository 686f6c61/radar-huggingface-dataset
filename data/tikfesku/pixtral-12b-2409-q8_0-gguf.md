# TikFesku/Pixtral-12B-2409-Q8_0-GGUF

## Resumen

El modelo `TikFesku/Pixtral-12B-2409-Q8_0-GGUF` es una conversión a formato GGUF del modelo multimodal Pixtral-12B-2409, desarrollado originalmente por Mistral AI y adaptado por Unsloth. Esta versión concreta, publicada por el usuario TikFesku, está cuantizada a 8 bits (Q8_0) y optimizada para su uso con llama.cpp, lo que permite ejecutarla en una amplia gama de hardware, desde CPU hasta GPU de consumo.

Pixtral-12B-2409 es el primer modelo nativamente multimodal de Mistral, que combina un decoder de 12 mil millones de parámetros con un codificador de visión de 400 millones de parámetros. Soporta tamaños de imagen variables y una ventana de contexto de 128.000 tokens, lo que lo hace adecuado para tareas que requieren razonamiento sobre imágenes y texto largo. La licencia Apache 2.0 permite uso comercial sin restricciones, y su formato GGUF facilita la integración en aplicaciones locales mediante herramientas como llama.cpp, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con codificador de visión (multimodal) |
| Parametros totales | 12.247.782.400 (12,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

Pixtral-12B-2409 emplea una arquitectura transformer decoder-only con un codificador de visión separado de 400M de parámetros. El modelo procesa imágenes de resolución variable, dividiéndolas en parches que se proyectan al espacio de embeddings del texto, permitiendo una comprensión conjunta de modalidades. El componente de lenguaje es un transformer estándar con atención causal, mientras que el codificador de visión utiliza una arquitectura similar a ViT. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) en la información proporcionada. La conversión a GGUF se realizó mediante la herramienta GGUF-my-repo de ggml.ai, manteniendo las capacidades originales del modelo.

## Capacidades

- Generación de texto y comprensión de imágenes: puede responder preguntas sobre imágenes, describir contenido visual y realizar tareas de razonamiento multimodal.
- Procesamiento de imágenes de resolución variable: no requiere redimensionar las imágenes a un tamaño fijo, lo que preserva detalles importantes.
- Ventana de contexto larga (128k tokens): permite manejar documentos extensos o conversaciones con múltiples imágenes.
- Soporte de entrada intercalada de texto e imágenes: puede procesar secuencias que combinan ambos tipos de datos.
- Multilingüismo limitado: la model card indica solo inglés, aunque el modelo base podría tener cierta capacidad multilingüe no documentada.
- No se ha confirmado soporte para tool calling, function calling o modo agente en la información disponible.

## Casos de uso

- Atención al cliente con soporte visual: el modelo puede analizar capturas de pantalla, fotos de productos o documentos enviados por usuarios y generar respuestas contextualizadas, gracias a su capacidad de procesar imágenes y texto de forma conjunta.
- Análisis de documentos escaneados: permite extraer información de facturas, formularios o contratos en formato imagen, combinando OCR implícito con razonamiento textual.
- Generación de descripciones de productos para e-commerce: a partir de una imagen, el modelo puede redactar textos descriptivos y técnicos, agilizando la creación de catálogos.
- Asistencia en educación: puede explicar diagramas, gráficos o ilustraciones científicas, respondiendo preguntas sobre su contenido en un contexto educativo.
- Moderación de contenido visual: el modelo puede clasificar imágenes y generar informes textuales sobre su contenido, ayudando en tareas de revisión.
- Desarrollo de asistentes personales multimodales: integrado en aplicaciones de chat, permite al usuario compartir fotos y recibir respuestas contextuales, por ejemplo, para identificar plantas, objetos o lugares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original de Mistral AI podría incluir métricas como MMLU, VQAv2 o TextVQA, pero no están presentes en los datos proporcionados. Se recomienda consultar la documentación oficial de Mistral para obtener cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa aproximadamente 14,8 GB, por lo que se necesitan al menos 16 GB de VRAM para cargar el modelo en GPU con overhead adicional. En CPU, se requieren unos 16-20 GB de RAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o superiores. También puede ejecutarse en GPU con 16 GB, aunque con menor margen para el contexto.
- Compatibilidad con GPU de consumo: sí, tarjetas con 16 GB o más pueden ejecutar el modelo, aunque la velocidad dependerá de la memoria y el ancho de banda.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, y cualquier runtime compatible con GGUF. También se puede usar con Python mediante bindings como llama-cpp-python.
- Latencia y throughput: no se dispone de datos concretos. En una RTX 4090, se puede esperar una generación de aproximadamente 20-40 tokens por segundo para modelos de 12B en Q8_0, pero esto es una estimación general y no un dato oficial.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos en la información proporcionada. Sin embargo, se puede situar frente a otros modelos multimodales de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Pixtral-12B-2409 (este) | 12,2B | 128k | Apache 2.0 | GGUF |
| LLaVA-1.6-13B | 13B | 4k (ampliable) | Apache 2.0 | Safetensors, GGUF |
| Qwen-VL-7B | 7B | 8k | Apache 2.0 | Safetensors, GGUF |

La comparación en rendimiento no está disponible, pero Pixtral destaca por su contexto largo y su naturaleza nativamente multimodal, mientras que LLaVA y Qwen-VL requieren adaptadores de visión adicionales.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente al interpretar imágenes ambiguas o de baja calidad.
- Idioma: la model card indica solo inglés, por lo que su rendimiento en otros idiomas puede ser deficiente o no estar soportado.
- Riesgo de seguridad: al ser un modelo multimodal, podría malinterpretar imágenes con contenido sensible o generar descripciones inapropiadas si no se supervisa adecuadamente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Limitaciones de cuantización: la cuantización Q8_0 introduce una ligera pérdida de precisión en comparación con los pesos originales en fp16, aunque suele ser mínima.
- Dependencia de la implementación: el rendimiento puede variar según la versión de llama.cpp y el hardware utilizado; se recomienda probar con el contexto máximo para verificar la estabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TikFesku/Pixtral-12B-2409-Q8_0-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Pixtral-12B-2409
- Documentación oficial de Mistral: https://docs.mistral.ai/models/pixtral-12b-24-09
- Página de slm.expert: https://slm.expert/models/pixtral-12b-2409/
- Repositorio GGUF de ggml-org: https://huggingface.co/ggml-org/pixtral-12b-GGUF
