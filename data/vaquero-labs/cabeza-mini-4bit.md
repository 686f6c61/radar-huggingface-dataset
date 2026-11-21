# vaquero-labs/cabeza-mini-4bit

## Resumen

Cabeza-mini-4bit es una conversión no oficial al formato MLX del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines. El repositorio, publicado por el usuario vaquero-labs, empaqueta los pesos del modelo base en una cuantización mixta de 4 bits optimizada para ejecución en hardware Apple Silicon a través de la librería mlx-lm. Se trata de un modelo de arquitectura MoE (mixture of experts) con capacidad de entrada image-text-to-text, es decir, acepta tanto texto como imágenes y genera texto.

El modelo resuelve el problema de desplegar un modelo multimodal de tipo MoE en equipos con memoria unificada de Apple, donde las cuantizaciones tradicionales de 4 bits uniformes degradan en exceso la calidad de los expertos enrutados. Para ello, la conversión preserva la cuantización original de los expertos (NVFP4 con escala global por experto en las capas 0 a 19 y MXFP8 en las capas 20 a 23), mientras que aplica cuantización afín de 4 bits con group size 64 a atención, embeddings y cabeza de salida.

Es relevante porque demuestra una estrategia de cuantización por componentes que mantiene la torre de visión en bfloat16 y el router en float32, evitando pérdidas de calidad en las partes sensibles del modelo. El repositorio tiene 17,3 GB y 6.896.142.848 parámetros totales según safetensors. No se han publicado datos de benchmarks ni información sobre idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con torre de visión; transformer multimodal image-text-to-text |
| Parametros totales | 6.896.142.848 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 (expertos enrutados, capas 0-19), MXFP8 (expertos enrutados, capas 20-23), 4-bit affine group size 64 (atención, embeddings, cabeza de salida), bfloat16 (torre de visión), float32 (router), sin cuantizar (loop message gates) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es de tipo mixture of experts (MoE) con capacidad multimodal image-text-to-text. El modelo incluye una torre de visión que se mantiene en bfloat16 en esta conversión, y un router en float32. El nombre del tag "inkling2_loop" sugiere la presencia de mecanismos de bucle o iteración interna (loop message gates), que en esta conversión no se cuantizan. El modelo base es thinkingmachines/Inkling-2-Mini, desarrollado por Thinking Machines.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la innovación técnica del mecanismo de loop ni el número de expertos o parámetros activos. La conversión a MLX se realizó mediante mlx-lm (PR #2086) y no incluye el draft DSpark, lo que implica que no hay decodificación especulativa disponible en este paquete.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y texto combinados (image-text-to-text), con la torre de visión incluida en bfloat16.
- Razonamiento y generación de texto general (heredado del modelo base, sin benchmarks publicados que lo confirmen).
- Soporte de chat template (el código de ejemplo aplica `apply_chat_template` si está disponible).
- Entrada de imágenes vía `image_url` en mensajes de chat al usar `mlx_lm.server`.
- Capacidades de tool calling, function calling, agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede procesar imágenes y texto en un equipo Apple Silicon con memoria unificada, gracias a la cuantización mixta que reduce el peso a 17,3 GB y mantiene la torre de visión en bfloat16 para preservar la calidad visual.
- Análisis de documentos con imágenes: extracción de información de capturas, diagramas o figuras combinadas con preguntas en texto, usando el pipeline image-text-to-text y el servidor `mlx_lm.server` con partes `image_url`.
- Prototipado de aplicaciones conversacionales en local: el chat template y la API de `mlx_lm` permiten iterar rápidamente en entornos de desarrollo sin depender de la nube.
- Evaluación de modelos MoE multimodales en investigación: la conversión preserva la cuantización original de los expertos (NVFP4/MXFP8), lo que permite estudiar el impacto de la cuantización por componentes en la calidad de salida.
- Despliegue en estaciones de trabajo Apple para tareas de visión por computador asistida: clasificación, descripción y respuesta a preguntas sobre imágenes en un entorno controlado y sin conexión.
- Experimentación con arquitecturas MoE con mecanismos de loop: los loop message gates sin cuantizar permiten analizar el comportamiento de estos mecanismos en inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el repositorio ocupa 17,3 GB en safetensors; se requiere al menos esa cantidad de memoria unificada disponible, más overhead de ejecución (aproximadamente 18-20 GB recomendados).
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente (por ejemplo, Mac Studio o MacBook Pro con 32 GB o más). No aplica a GPU NVIDIA/AMD en esta conversión MLX.
- Cabe en consumer GPU: no aplica en el sentido tradicional; está diseñado para Apple Silicon. En equipos Apple con 24 GB podría ser ajustado; se recomienda 32 GB o más.
- Opciones de despliegue: `mlx-lm` (rama del PR #2086), `mlx_lm.server` para servir con soporte de imágenes. No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vaquero-labs/cabeza-mini-4bit | 6.896.142.848 | no disponible | apache-2.0 | MLX safetensors (4-bit mixto) | Conversion no oficial, vision incluida, sin draft DSpark |
| mlx-community/Inkling-2-Mini-4bit | no disponible | no disponible | apache-2.0 | MLX safetensors (4-bit) | Conversion oficial de referencia citada en la model card |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | apache-2.0 | safetensors | Modelo base original de Thinking Machines |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio pertenece a vaquero-labs, no a Thinking Machines ni a mlx-community, por lo que no hay garantía de mantenimiento ni validación por parte del autor original.
- Requiere una rama específica de mlx-lm (PR #2086), lo que implica inestabilidad potencial y posible falta de soporte en versiones estables.
- No incluye el draft DSpark, por lo que no hay decodificación especulativa y el rendimiento puede ser inferior al del modelo original en ese aspecto.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificación previa.
- Riesgo de alucinación inherente a los modelos generativos; no hay benchmarks publicados que permitan cuantificarlo.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia apache-2.0 permite uso comercial, pero al ser una conversión de un modelo base, conviene verificar la licencia y condiciones del modelo original thinkingmachines/Inkling-2-Mini.
- La cuantización mixta puede introducir degradaciones no documentadas en tareas específicas; se recomienda evaluar antes de producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/vaquero-labs/cabeza-mini-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversión de referencia mlx-community: https://huggingface.co/mlx-community/Inkling-2-Mini-4bit
- PR de mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2086
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
