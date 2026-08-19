# zherebetskyy/Qwen3.8-27B-6bit-mlx

## Resumen

El modelo `zherebetskyy/Qwen3.8-27B-6bit-mlx` es una conversión al formato MLX (Apple Silicon) del modelo Qwen3.8-27B desarrollado por Alibaba Cloud. Se trata de un modelo denso de 27.800 millones de parámetros con una arquitectura híbrida que combina atención lineal estilo DeltaNet con atención softmax completa en una proporción 3:1, distribuida en 64 capas. Esta conversión específica aplica una cuantización lineal afín de 6 bits con grupo de tamaño 64, lo que reduce el peso del modelo a aproximadamente 6,6 bits por parámetro y permite ejecutarlo en sistemas con 21-23 GB de memoria unificada, ideal para Mac con 64 GB de RAM.

El modelo es multimodal (texto, imagen y vídeo) y soporta un contexto nativo de 262.000 tokens, ampliable hasta más de 1 millón mediante escalado YaRN. Incluye capacidades de tool calling, modo de razonamiento explícito (thinking) y predicción multi-token (MTP). La conversión mantiene la torre de visión sin cuantizar para preservar la calidad en tareas de comprensión de imágenes. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para desarrolladores que buscan un modelo potente y flexible en hardware de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas con atencion lineal (DeltaNet) y atencion full softmax en ratio 3:1 (48 lineales + 16 full) |
| Parametros totales | 27.800 millones (dense, todos activos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativo, hasta 1.000.000+ con YaRN |
| Tipos de cuantizacion | 6-bit (MLX group affine, group size 64) |
| Idiomas soportados | No disponible (el modelo base Qwen es multilingue, pero no se especifican idiomas concretos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida innovadora que intercala capas de atención lineal (basadas en DeltaNet) con capas de atención softmax completa. De las 64 capas totales, 48 son de atención lineal y 16 de atención completa, organizadas en 16 repeticiones de un patrón 3:1. La atención lineal utiliza 16 cabezas QK y 48 cabezas V con dimensión de cabeza 128, mientras que la atención estándar usa 24 cabezas Q y 4 cabezas KV (GQA) con dimensión de cabeza 256. Esta combinación reduce el coste computacional en contextos largos manteniendo la calidad de razonamiento.

El modelo fue entrenado por Alibaba Cloud con un vocabulario de 248.000 tokens y soporta múltiples modalidades (texto, imagen y vídeo). No se dispone de detalles específicos sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la información proporcionada. La conversión a MLX se realizó con la librería mlx-vlm versión 0.6.13, partiendo de los pesos en bf16 de `mlx-community/Qwen3.8-27B-bf16`. La cuantización de 6 bits se aplica únicamente a las capas de texto y atención, mientras que la torre de visión se mantiene íntegramente en precisión original para no degradar la comprensión de imágenes.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de lógica, matemáticas y análisis.
- Comprensión multimodal: procesa imágenes y vídeo, permitiendo descripción de escenas, análisis de diseño y extracción de información visual.
- Tool calling y function calling: soporta invocación de herramientas externas mediante una plantilla Jinja corregida que evita errores en motores de ejecución C++ (LM Studio, MLX Local Server).
- Modo de razonamiento explícito (thinking): mediante tokens `<|think_on|>` y `<|think_off|>` se puede activar o desactivar el razonamiento paso a paso antes de generar la respuesta final.
- Predicción multi-token (MTP): capacidad de predecir varios tokens a la vez, mejorando la velocidad de generación.
- Contexto largo: ventana nativa de 262K tokens, ampliable a más de 1M con técnicas YaRN, adecuada para documentos extensos y conversaciones multi-turno.
- Multilingüismo: aunque no se detallan idiomas específicos, el modelo base Qwen es conocido por su soporte multilingüe (inglés, chino, español, francés, etc.).

## Casos de uso

- Análisis de documentos extensos: gracias a su contexto de 262K tokens, puede procesar informes anuales, expedientes legales o investigaciones completas en una sola pasada, extrayendo conclusiones y resumiendo secciones relevantes.
- Asistente de atención al cliente multimodal: integra comprensión de imágenes (capturas de pantalla, fotos de productos) y texto para resolver incidencias técnicas o dudas comerciales en conversaciones de larga duración.
- Generación de código con razonamiento: el modo thinking permite que el modelo planifique algoritmos complejos antes de escribir el código, reduciendo errores en tareas de programación avanzada (por ejemplo, implementación de estructuras de datos o algoritmos criptográficos).
- Análisis de vídeo para vigilancia o revisión de contenido: puede procesar secuencias de vídeo y generar descripciones de eventos, detección de anomalías o transcripción de acciones.
- Desarrollo de agentes autónomos: con tool calling y soporte para roles de sistema, puede actuar como agente que consulta APIs, ejecuta comandos o interactúa con bases de datos en flujos multi-paso.
- Educación y tutoría personalizada: al activar el modo thinking, puede explicar conceptos paso a paso, adaptándose al nivel del estudiante y generando ejercicios prácticos con retroalimentación.
- Traducción y localización: aunque no se especifican idiomas, su naturaleza multilingüe permite traducción automática de textos y subtítulos, con capacidad de mantener contexto largo en documentos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda consultar la documentación oficial de Qwen3.8-27B para obtener datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada: 21-23 GB de memoria unificada para la cuantización de 6 bits, según la model card.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra) con al menos 32 GB de RAM unificada; idealmente 64 GB para contextos largos y cargas multimodales.
- Compatibilidad con GPU de consumo: no es compatible con GPUs NVIDIA o AMD en su formato MLX; requiere hardware Apple Silicon.
- Opciones de despliegue: mlx-vlm para tareas multimodales, mlx-lm para generación de texto, ambos accesibles desde línea de comandos o API Python. También puede ejecutarse en LM Studio y MLX Local Server.
- Latencia y throughput: no disponibles. Se espera una generación fluida en Mac de gama alta, pero los tiempos exactos dependen del modelo de chip y la longitud del contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base Qwen3.8-27B compite con otros modelos densos de 27-32B parámetros como Llama 3.1 8B (inferior en tamaño) o Qwen2.5-32B, pero no se han publicado comparativas directas. La conversión a 6-bit MLX es específica para Apple Silicon, por lo que su comparativa natural sería con otras conversiones MLX de modelos similares (por ejemplo, `mlx-community/Mistral-7B-Instruct-4bit` o `mlx-community/Llama-3.1-8B-Instruct-8bit`), aunque estas son de menor tamaño. Se recomienda evaluar el modelo en tareas concretas para determinar su idoneidad.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de gran tamaño entrenado con datos web, puede presentar sesgos sociales y generar información falsa o inventada, especialmente en temas de actualidad o datos específicos.
- Requisito de system prompt: la model card advierte que el primer mensaje del sistema debe comenzar con la frase exacta "You are Qwen, created by Alibaba Cloud. You are a helpful assistant." para evitar un rendimiento deficiente. Esto puede ser un inconveniente en integraciones que no controlen el prompt inicial.
- Contexto y memoria: aunque soporta 262K tokens, el uso de contextos muy largos puede degradar la calidad de las respuestas y aumentar la latencia. Se recomienda no superar 128K si se activa el modo thinking.
- Dependencia de hardware Apple: al ser un formato MLX, no es ejecutable en GPUs NVIDIA o AMD sin conversión adicional, lo que limita su uso en centros de datos convencionales.
- Cuantización de 6 bits: aunque reduce el tamaño, puede introducir una ligera pérdida de precisión en tareas de razonamiento complejo comparado con la versión bf16. La torre de visión se mantiene sin cuantizar, pero las capas de texto sí están cuantizadas.
- Licencia Apache-2.0: permite uso comercial, pero se debe atribuir la autoría y mantener el aviso de licencia en redistribuciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zherebetskyy/Qwen3.8-27B-6bit-mlx
- Modelo base (bf16): https://huggingface.co/mlx-community/Qwen3.8-27B-bf16
- Documentación de mlx-vlm: https://github.com/ml-explore/mlx-vlm
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
