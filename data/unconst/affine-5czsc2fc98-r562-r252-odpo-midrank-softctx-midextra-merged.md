# unconst/Affine-5czsc2fc98-r562-r252-odpo-midrank-softctx-midextra-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r562-r252-odpo-midrank-softctx-midextra-merged` es un checkpoint fusionado (LoRA-merged) desarrollado por el usuario `unconst` a partir del modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según las etiquetas de HuggingFace, se trata de un modelo de arquitectura MoE (Mixture of Experts) basado en Qwen3.5, con capacidades multimodales (image-text-to-text) aunque su pipeline principal es text-generation. El nombre del checkpoint sugiere que fue entrenado con ODPO (Online Direct Preference Optimization) y con técnicas de contexto suave (soft context) y contexto extendido (midextra).

Con 35.107.181.936 parámetros totales (~35B), es un modelo de gran tamaño. Sin embargo, el autor lo describe como un "checkpoint de rescate" privado, no una versión final para producción: "Private TTL insurance; not a submission until Stage-5 gate clears". Esto indica que es un artefacto intermedio de un proceso de entrenamiento más amplio, probablemente parte de un pipeline de fine-tuning con múltiples etapas. Su relevancia radica en ser un ejemplo de aplicación de ODPO y fusión de LoRA en un modelo MoE multimodal, aunque carece de documentación pública detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 (según tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tag) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE, como indica la etiqueta `qwen3_5_moe`, lo que sugiere que sigue el diseño de los modelos Qwen3.5 con mezcla de expertos. No se dispone de información sobre el número de expertos, la dimensión de los mismos ni el mecanismo de enrutamiento. El checkpoint es el resultado de fusionar un LoRA entrenado sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un fine-tuning de un modelo Affine previo. El nombre incluye "odpo-midrank-softctx-midextra", indicando que se aplicó ODPO (una variante de optimización directa de preferencias en línea) con rangos intermedios, contexto suave y contexto extendido. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni las fases de entrenamiento (SFT, RLHF, etc.). El autor menciona que es un "salvamento" de checkpoint, lo que sugiere que fue guardado como respaldo durante un proceso de entrenamiento en curso.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que puede generar texto coherente en tareas de lenguaje natural.
- Procesamiento multimodal: la etiqueta `image-text-to-text` indica que el modelo puede aceptar imágenes como entrada y producir texto, aunque no se especifican los detalles de la codificación visual.
- Conversación: la etiqueta `conversational` sugiere que está optimizado para diálogos multi-turno.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se dispone de información sobre capacidades multilingües específicas.

## Casos de uso

Dado que se trata de un checkpoint intermedio sin documentación de producción, los casos de uso son limitados y orientados a investigación:

- Investigación en fine-tuning MoE: el modelo sirve como referencia para estudiar el efecto de ODPO y la fusión de LoRA en arquitecturas MoE multimodales.
- Desarrollo de pipelines de entrenamiento: puede utilizarse como punto de partida para continuar el entrenamiento o como baseline en experimentos comparativos.
- Evaluación de técnicas de alineación: al haber sido entrenado con ODPO, permite analizar el impacto de esta técnica en la calidad de las respuestas frente a otros métodos.
- Pruebas de inferencia multimodal: aunque no está documentado, su capacidad image-text-to-text podría explorarse en entornos controlados para tareas de descripción de imágenes.
- Benchmarking de eficiencia: su tamaño (~35B) y arquitectura MoE permiten medir el rendimiento de diferentes estrategias de cuantización y despliegue.
- Reproducibilidad de experimentos: al ser un checkpoint público, otros investigadores pueden reproducir los resultados del autor o comparar con sus propios modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El autor no proporciona métricas de rendimiento en la model card.

## Requisitos de hardware

- VRAM estimada: con 35B parámetros en FP16, el modelo ocupa aproximadamente 70 GB (el tamaño del repo es 70.2 GB). Para inferencia en FP16 se necesitaría al menos una GPU con 80 GB (A100, H100) o varias GPUs en paralelo.
- En cuantización de 8 bits, la VRAM necesaria sería ~35 GB, lo que permitiría usar GPUs como RTX 4090 (24 GB) no sería suficiente; se necesitaría una A6000 (48 GB) o similar.
- En cuantización de 4 bits, la VRAM estimada sería ~18-20 GB, lo que podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no hay cuantizaciones publicadas oficialmente.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones documentadas con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Como referencia arquitectónica, se pueden mencionar otros MoE de tamaño similar:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Affine-5czsc2fc98-r562-r252-odpo-midrank-softctx-midextra-merged | 35B | no disponible | no disponible | no disponible |
| Mixtral 8x7B | 46.7B | 12.9B | 32k | Apache 2.0 |
| Qwen2.5 MoE (A14B) | 14B | 2.7B | 128k | Apache 2.0 |

La comparación es limitada porque no hay datos de rendimiento ni de contexto para el modelo Affine. Su tamaño (35B) lo sitúa entre Mixtral y Qwen2.5 MoE, pero sin métricas no es posible evaluar su calidad relativa.

## Limitaciones y advertencias

- No es un modelo final: el autor lo describe como un "checkpoint de rescate" privado, no apto para producción.
- Licencia no disponible: no se puede determinar si es de uso comercial o restringido.
- Sin documentación de sesgos: no hay información sobre posibles sesgos de género, raza o idioma.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar contenido falso o inventado, especialmente sin fine-tuning adicional.
- Contexto y idiomas desconocidos: no se especifica la longitud de contexto ni los idiomas soportados, lo que limita su uso en aplicaciones multilingües.
- Sin cuantizaciones oficiales: el repo solo contiene pesos en safetensors, sin versiones GGUF o GPTQ, lo que dificulta su despliegue en entornos con recursos limitados.
- Reproducibilidad limitada: al no haber información sobre el dataset ni el proceso de entrenamiento, es difícil replicar o entender completamente el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r562-r252-odpo-midrank-softctx-midextra-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
- Checkpoint relacionado (h1-merged): https://huggingface.co/unconst/Affine-5czsc2fc98-h1-merged
- Checkpoint relacionado (h56-merged): https://huggingface.co/unconst/Affine-5czsc2fc98-h56-merged
- Checkpoint relacionado (r32-merged): https://huggingface.co/unconst/Affine-5czsc2fc98-r32-merged
- Página de despliegue en FriendliAI (para h1-merged): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
