# xyntraistudios/xyntrai-sarah-mistral-2501-36B-NSFW

## Resumen

Xyntrai Sarah Mistral 2501 36B NSFW es un ajuste fino (finetune) del modelo TheDrummer/Skyfall-36B-v2, publicado por Xyntrai Studios. Se distribuye bajo licencia Apache 2.0 y está orientado a generación de texto conversacional en inglés, con una temática explícitamente marcada como NSFW (no apta para todas las audiencias). El modelo cuenta con 36.910.535.680 parámetros (aproximadamente 36,9 mil millones) según los pesos en safetensors, y el repositorio ocupa 73,8 GB.

El modelo hereda la etiqueta `mistral` y la arquitectura de su base, aunque la información publicada no detalla la arquitectura interna ni la longitud de contexto. El ajuste fino se realizó con Unsloth y la librería TRL de Hugging Face, según indica la propia model card, lo que sugiere un entrenamiento supervisado (SFT) o de preferencias sobre la base. No se documentan los datos de entrenamiento, el número de tokens utilizados ni los hiperparámetros.

Su relevancia es limitada y muy específica: se trata de un modelo derivado de una familia de modelos de rol y conversación, con pocas descargas (70) y sin likes en el momento de la consulta. Resulta útil para experimentación en entornos controlados de generación creativa o conversacional, pero no dispone de documentación técnica suficiente para evaluar su rendimiento en tareas de razonamiento, código o matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `mistral`; detalles internos no disponibles) |
| Parametros totales | 36.910.535.680 (≈36,9 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; se puede cuantizar con herramientas estándar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. La model card y las etiquetas indican que se trata de un modelo de la familia Mistral, ajustado a partir de TheDrummer/Skyfall-36B-v2. El tamaño de 36,9 mil millones de parámetros y el repositorio de 73,8 GB son coherentes con pesos en precisión de 16 bits (bf16/fp16). No se especifica si la base emplea atención con ventana deslizante, GQA u otras variantes propias de Mistral.

El entrenamiento se realizó con Unsloth y TRL, según la model card, que menciona un entrenamiento "2x más rápido" gracias a estas herramientas. No se publican datos sobre el volumen de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. Tampoco se documenta si el ajuste fino incluyó datos multilingües o únicamente inglés.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno.
- Generación creativa y de rol, con temática NSFW según la denominación del modelo.
- Compatible con `text-generation-inference` y con `endpoints_compatible`, lo que facilita su despliegue en infraestructuras de inferencia estándar.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: solo inglés declarado; no hay evidencia de otros idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Generación creativa y narrativa: el modelo puede producir relatos y diálogos de ficción en inglés, aprovechando su ajuste sobre una base orientada a conversación y rol.
- Roleplay y chatbots de personaje: adecuado para prototipos de asistentes conversacionales con personalidad definida, siempre que se respeten las políticas de contenido aplicables.
- Experimentación en investigación sobre ajuste fino: sirve como ejemplo de pipeline Unsloth + TRL para estudiar cómo un finetune modifica el comportamiento de una base de 36B.
- Evaluación de seguridad y moderación: útil para probar clasificadores y filtros de contenido NSFW en pipelines de moderación, dado que el modelo está etiquetado como `not-for-all-audiences`.
- Despliegue en TGI o endpoints compatibles: al ser compatible con `text-generation-inference`, puede integrarse en servicios de inferencia existentes para pruebas de latencia y throughput.
- Generación de datos sintéticos conversacionales: puede emplearse para crear corpus de diálogo en inglés para tareas de investigación, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 74 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 80 GB.
- En cuantización de 8 bits: en torno a 37-40 GB de VRAM; requiere GPU de 48 GB o superior (A6000, L40S, A100 80 GB).
- En cuantización de 4 bits: en torno a 20-24 GB de VRAM; puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; L40S o A6000 para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), FriendliAI (listado en la búsqueda web); para cuantización local, llama.cpp u Ollama requerirían conversión a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Xyntrai Sarah Mistral 2501 36B NSFW | ≈36,9 B | No disponible | Apache 2.0 | Inglés | Hugging Face, FriendliAI |
| TheDrummer/Skyfall-36B-v2 (base) | ≈36 B (no confirmado) | No disponible | No disponible en la información | No disponible | Hugging Face |
| Mistral Large (referencia de familia) | No disponible | No disponible | Comercial | Multilingüe | API de Mistral |

La comparación con alternativas de la misma categoría es limitada porque no se dispone de datos de benchmarks ni de especificaciones completas de la base. El modelo base Skyfall-36B-v2 es el referente más directo, pero su model card no se ha consultado en esta ficha.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está etiquetado como `not-for-all-audiences`; puede generar contenido explícito o inapropiado y no debe desplegarse en entornos sin moderación.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un finetune sobre datos no publicados, el riesgo de sesgos demográficos y culturales es desconocido.
- Alucinación: no hay datos sobre tasas de alucinación; al ser un modelo orientado a conversación y rol, la fidelidad factual no está garantizada.
- Contexto e idioma: solo se declara inglés y no se especifica la longitud de contexto; no se recomienda su uso en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido NSFW puede incumplir las políticas de las plataformas de despliegue y las normativas aplicables.
- Documentación escasa: sin benchmarks, sin datos de entrenamiento y con solo 70 descargas, no hay evidencia de calidad en producción.
- Formato: no se publican pesos GGUF ni cuantizaciones listas para usar; el despliegue en consumer GPU requiere conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/xyntraistudios/xyntrai-sarah-mistral-2501-36B-NSFW
- Árbol de archivos: https://huggingface.co/xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw/tree/main
- FriendliAI: https://friendli.ai/models/xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw
- Modelo base: https://huggingface.co/TheDrummer/Skyfall-36B-v2
- Unsloth: https://github.com/unslothai/unsloth
