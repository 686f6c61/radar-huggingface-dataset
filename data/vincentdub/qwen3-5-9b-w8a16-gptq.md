# vincentdub/Qwen3.5-9B-W8A16-GPTQ

## Resumen

Este repositorio contiene una cuantización GPTQ en formato W8A16 (pesos de 8 bits, activaciones de 16 bits) del modelo multimodal Qwen/Qwen3.5-9B, realizada por el usuario vincentdub mediante la librería `llmcompressor`. El modelo resultante mantiene la arquitectura original del modelo base, un transformer denso con atención híbrida (gated delta networks) y codificador de visión, diseñado para tareas de texto e imagen. La cuantización reduce la huella de memoria en inferencia, lo que permite ejecutar el modelo en GPUs de consumo con 16-24 GB de VRAM sin sacrificar significativamente la calidad de las activaciones.

Qwen3.5-9B pertenece a la familia Qwen3.5, que introduce un enfoque de fusión temprana de modalidades (visión y lenguaje) entrenado sobre billones de tokens multimodales. Según la documentación de vLLM Recipes, el modelo soporta una ventana de contexto de 262.000 tokens y predicción multi-token (MTP). Esta cuantización concreta se calibró con 512 muestras del dataset `HuggingFaceH4/ultrachat_200k` y excluye la capa `lm_head` del proceso de cuantización. El repositorio está pensado para su uso con librerías compatibles con GPTQ, como vLLM o Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (dense, hybrid attention con gated delta networks, vision-language) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | Todos (modelo denso) |
| Longitud de contexto | 262.000 tokens (según vLLM Recipes) |
| Tipos de cuantizacion | GPTQ W8A16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso multimodal que combina un codificador de visión con un núcleo de lenguaje que emplea atención híbrida basada en *gated delta networks*. Esta arquitectura, descrita en la documentación de vLLM Recipes, permite manejar secuencias largas (hasta 262K tokens) y soporta predicción multi-token (MTP). El entrenamiento del modelo base se realizó con fusión temprana de modalidades sobre billones de tokens multimodales, según el repositorio comunitario de Qwen3.5.

La cuantización de este repositorio se llevó a cabo con `llmcompressor` utilizando 512 muestras de calibración del dataset `HuggingFaceH4/ultrachat_200k`, con una longitud máxima de secuencia de 2048 tokens. Se cuantizaron todas las capas lineales, excluyendo la capa `lm_head`. No se dispone de información sobre procesos de RLHF o DPO en esta cuantización; estos detalles pertenecen al modelo base.

## Capacidades

- Generación de texto y razonamiento complejo, heredado del modelo base Qwen3.5.
- Comprensión de imágenes y diálogo multimodal (entrada de imagen y texto), gracias al codificador de visión integrado.
- Manejo de contextos largos de hasta 262.000 tokens, útil para documentos extensos o conversaciones multi-turno.
- Soporte de predicción multi-token (MTP), que puede acelerar la decodificación en entornos compatibles.
- No se especifican en la documentación de esta cuantización capacidades explícitas de *tool calling* o *function calling*, aunque los modelos de la familia Qwen3.5 suelen incluirlas; se recomienda consultar el modelo base.
- Capacidades multilingües no documentadas en la información disponible.

## Casos de uso

- Despliegue de asistentes conversacionales multimodales en hardware de consumo: gracias a la cuantización W8A16, el modelo puede ejecutarse en GPUs como la RTX 4090 (24 GB) o incluso en tarjetas con 16 GB de VRAM, manteniendo la calidad de las activaciones en 16 bits.
- Análisis de imágenes con razonamiento avanzado: por ejemplo, extraer información de diagramas técnicos o capturas de pantalla y generar explicaciones detalladas, aprovechando el contexto largo para incluir múltiples imágenes en una misma conversación.
- Generación de código asistida por visión: el modelo puede interpretar bocetos o diagramas de arquitectura y producir código fuente correspondiente, combinando su comprensión visual con capacidades de programación.
- Automatización de tareas de documentación: procesar manuales extensos o informes con gráficos y tablas, resumiendo y respondiendo preguntas sobre su contenido gracias a la ventana de 262K tokens.
- Investigación académica en entornos con recursos limitados: permite experimentar con un modelo multimodal de 9B parámetros en laboratorios que no disponen de GPUs de alta gama, manteniendo un equilibrio entre rendimiento y requisitos de memoria.
- Prototipado rápido en local: integrable en pipelines de vLLM o Transformers para validar ideas de productos antes de escalar a modelos mayores, reduciendo el coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantización concreta en la informacion disponible. Los benchmarks del modelo base Qwen3.5-9B no se han incluido en la documentación del repositorio, por lo que no es posible comparar numéricamente el rendimiento de esta versión cuantizada con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 12,0 GB, lo que sugiere que los pesos cuantizados ocupan aproximadamente 9,4 GB (8 bits por parámetro) más overhead. Para cargar el modelo y realizar inferencia con contexto moderado se recomiendan al menos 16 GB de VRAM; para explotar el contexto completo de 262K tokens, se necesitarían 24 GB o más.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40 GB, o superiores. En GPUs con 16 GB es viable con longitudes de secuencia reducidas.
- Sí cabe en GPU de consumo: las tarjetas de 16-24 GB pueden ejecutar el modelo sin problemas en la mayoría de casos.
- Opciones de despliegue: vLLM (compatible con GPTQ), Hugging Face Transformers con `device_map="auto"`, o TGI (Text Generation Inference). No es directamente compatible con llama.cpp u Ollama, que usan formatos GGUF; sería necesaria una conversión adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas directas con otras cuantizaciones del mismo modelo o con modelos de tamaño similar en la informacion proporcionada. A modo de referencia, el modelo base sin cuantizar requiere aproximadamente 18,8 GB en FP16, mientras que esta versión W8A16 reduce el peso a unos 9,4 GB, una ventaja significativa para entornos con VRAM limitada. Otras cuantizaciones como W4A16 podrían reducir aún más el uso de memoria, pero no se han encontrado versiones publicadas de Qwen3.5-9B en ese formato.

## Limitaciones y advertencias

- Al ser una cuantización, puede existir una ligera degradación en la calidad de las respuestas respecto al modelo original, aunque W8A16 suele mantener una fidelidad alta.
- La calibración se realizó únicamente con 512 muestras de un dataset de chat, lo que podría no representar adecuadamente todos los dominios de uso (por ejemplo, código o matemáticas avanzadas).
- La exclusión de la capa `lm_head` de la cuantización implica que esa capa se mantiene en precisión original, lo que puede aumentar ligeramente el uso de memoria, pero preserva la calidad de los logits finales.
- No se ha especificado la licencia de este repositorio; es imprescindible consultar la licencia del modelo base Qwen/Qwen3.5-9B antes de cualquier uso comercial.
- El contexto de 262K tokens puede provocar un alto consumo de memoria en inferencia, especialmente con activaciones en 16 bits; se recomienda ajustar dinámicamente la longitud de secuencia según la tarea.
- Los sesgos y alucinaciones presentes en el modelo base no se mitigan mediante la cuantización; es necesario aplicar técnicas de validación adicionales en producción.
- La información sobre capacidades de *tool calling* y multilingüismo no está documentada en esta cuantización, por lo que se debe verificar contra el modelo base.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/vincentdub/Qwen3.5-9B-W8A16-GPTQ
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Colección Qwen3.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen35
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha de vLLM Recipes para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Repositorio comunitario Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
