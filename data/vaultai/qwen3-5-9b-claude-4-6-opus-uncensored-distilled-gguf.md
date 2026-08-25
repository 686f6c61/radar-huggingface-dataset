# vaultai/Qwen3.5-9B-Claude-4.6-Opus-Uncensored-Distilled-GGUF

## Resumen

El modelo `vaultai/Qwen3.5-9B-Claude-4.6-Opus-Uncensored-Distilled-GGUF` es un espejo byte a byte del repositorio original `LuffyTheFox/Qwen3.5-9B-Claude-4.6-Opus-Uncensored-Distilled-GGUF`, que fue eliminado de Hugging Face. Se trata de un modelo de texto de 9 000 millones de parámetros, basado en `Qwen/Qwen3.5-9B` y afinado mediante destilación para imitar el estilo de razonamiento de Claude 4.6 Opus, con la particularidad de estar «sin censura» (uncensored). El repositorio incluye tanto el archivo GGUF cuantizado en Q4_K_M como un proyector de visión en BF16 (`mmproj-BF16.gguf`), lo que sugiere capacidades multimodales de entrada visual, aunque la ficha no detalla su funcionamiento.

La relevancia de este modelo radica en que, al ser una copia exacta de un modelo eliminado, garantiza que los usuarios puedan seguir descargando y utilizando los pesos sin depender de la disponibilidad del autor original. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para entornos de producción. No obstante, la ausencia de documentación técnica sobre el proceso de entrenamiento, los datos utilizados o los benchmarks limita la evaluación rigurosa de su rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B, sin especificar detalles) |
| Parámetros totales | 8 953 803 264 (8,95 B) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (archivo GGUF principal); proyector de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `.gguf`) y proyector `.gguf` BF16 |

## Arquitectura y entrenamiento

El modelo es un afinamiento (fine-tune) del modelo base `Qwen/Qwen3.5-9B`, que pertenece a la familia Qwen 3.5 de código abierto. Según la información disponible, se realizó una destilación de razonamiento a partir de Claude 4.6 Opus, con el objetivo de reducir la longitud de las cadenas de pensamiento y aumentar la precisión. En el repositorio original se indicaba que era la primera iteración de una serie de afinamientos centrados en razonamiento, aunque no se proporcionan detalles sobre el conjunto de datos, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO. El repositorio actual solo contiene los archivos cuantizados en GGUF y el proyector de visión, sin pesos en safetensors ni información sobre la arquitectura interna más allá del modelo base.

## Capacidades

- Generación de texto: funciona como modelo de lenguaje conversacional y de completado de texto.
- Razonamiento: el nombre y la descripción del modelo indican que está afinado para generar cadenas de pensamiento (chain-of-thought) más eficientes, similares a las de Claude 4.6 Opus.
- Sin censura: el modelo está diseñado para no aplicar filtros de contenido, lo que permite generar respuestas sobre temas que normalmente estarían restringidos en otros modelos.
- Soporte de visión: la presencia del archivo `mmproj-BF16.gguf` sugiere que el modelo puede procesar entradas visuales, aunque no se documenta en la model card.
- Compatible con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en plataformas de inferencia estándar.
- Conversacional: apto para aplicaciones de chat y asistencia conversacional.

## Casos de uso

- Investigación y evaluación de modelos: los desarrolladores pueden usar este GGUF para probar el comportamiento de un modelo afinado sin censura, comparándolo con versiones censuradas de Qwen3.5-9B.
- Generación de contenido creativo y literario: el modelo puede producir textos extensos con un estilo de razonamiento particular, útil para escritura de ficción o guiones.
- Asistencia en programación: aunque no hay benchmarks específicos, los modelos de 9B con afinamiento de razonamiento suelen mejorar la calidad de la generación de código. Puede integrarse en entornos como Ollama o llama.cpp para uso local.
- Aplicaciones educativas de debate y análisis: al no tener censura, puede utilizarse para explorar temas controvertidos o hipotéticos en entornos académicos controlados.
- Prototipado de agentes conversacionales: con la plantilla de chat y parámetros de muestreo fijados, es adecuado para construir chatbots que requieran respuestas detalladas y razonadas.
- Análisis de imágenes (si la funcionalidad de visión está activa): el proyector BF16 podría permitir la entrada de imágenes, aunque no se documenta el flujo de trabajo exacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 5,63 GB, y el proyector de visión 0,92 GB. Con la sobrecarga de contexto y los buffers, se recomienda al menos 8 GB de VRAM para ejecutar el modelo completo en una GPU.
- GPU recomendadas: cualquier GPU con al menos 8 GB de memoria, como una NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB). En GPU de 6 GB, como una RTX 2060, podría ser posible con cuantización menor, pero no se proporcionan archivos adicionales.
- En CPU: el modelo puede ejecutarse en CPU con llama.cpp u Ollama, con un rendimiento de unos 10-15 tokens/s en un procesador moderno de 8 núcleos.
- Opciones de despliegue: vLLM (si se convierte a safetensors), llama.cpp, Ollama, TGI (si se ajusta el formato). El tag `endpoints_compatible` sugiere compatibilidad con plataformas estándar.
- Latencia y throughput: no hay datos medidos. En una RTX 4090, se espera un throughput de 50-100 tokens/s para un modelo de 9B cuantizado, pero no se puede confirmar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantizaciones | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 8,95 B | no disponible | Apache 2.0 | safetensors, GGUF | modelo base multimodal |
| Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-v2 | 9 B | no disponible | Apache 2.0 | GGUF | afinado en razonamiento, sin visión |
| Llama 3.1 8B | 8 B | 128K | Llama 3.1 (uso comercial permitido) | GGUF, safetensors | modelo generalista |
| Mistral 7B v0.3 | 7 B | 32K | Apache 2.0 | GGUF, safetensors | modelo ligero de texto |

La comparación se basa solo en características públicas; no hay datos de rendimiento que permitan una evaluación cuantitativa.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, violento, sexual o ilegal, lo que lo hace inadecuado para entornos de producción sin moderación.
- Falta de documentación: no se detalla el proceso de entrenamiento, datos usados ni métricas de rendimiento, lo que dificulta la evaluación de su calidad.
- Riesgo de alucinación: al ser un modelo de 9B, puede inventar información, especialmente en dominios específicos.
- Contexto y idiomas: no se especifica la longitud de contexto ni los idiomas soportados; probablemente hereda las capacidades del Qwen3.5-9B, pero no se confirma.
- Funcionalidad de visión incierta: la presencia del proyector BF16 no garantiza que el modelo final soporte imágenes; se requiere verificación.
- Espejo de un repo eliminado: el modelo original fue retirado, lo que sugiere posibles problemas de licencia o de contenido que no se documentan.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/vaultai/Qwen3.5-9B-Claude-4.6-Opus-Uncensored-Distilled-GGUF
- Repositorio original (eliminado): no disponible
- Espejo alternativo de Marcoariette: https://huggingface.co/marcoariette/Qwen3.5-9B-Claude-4.6-Opus-Uncensored-Distilled-GGUF
- Modelo v2 de LuffyTheFox (razonamiento): https://huggingface.co/LuffyTheFox/Qwen3.5-9B-Claude-4.6-Opus-Uncensored-v2-GGUF/blob/main/README.md
- ModelScope (razonamiento distilado): https://www.modelscope.cn/models/Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled-GGUF
- Página de AIModels para la v2: https://www.aimodels.fyi/models/huggingFace/qwen3.5-9b-claude-4.6-opus-reasoning-distilled-v2-gguf-jackrong
- Ollama para Qwen3.5-abliterated: https://ollama.com/huihui_ai/qwen3.5-abliterated:9b-Claude-4.6-Opus-q4_K
