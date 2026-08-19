# TheCluster/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-mixed-6bit

## Resumen

Este modelo es una conversión a formato MLX del modelo `KridgeDookie/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS`, que a su vez es una versión "abliterada" (sin censura) del Qwen3.8-27B de Alibaba. El abliterado consiste en eliminar los mecanismos de rechazo del modelo original, permitiendo que responda a cualquier petición sin negarse, lo que resulta útil para investigación en seguridad, pruebas de alineación o aplicaciones que requieren respuestas sin filtros. La conversión a MLX, realizada por TheCluster, aplica una cuantización mixta por tensor (4, 6 y 8 bits) con grupo de tamaño 32, logrando un tamaño de aproximadamente 20,9 GB y una precisión media de 6,096 bits por peso.

El modelo base Qwen3.8-27B es un LLM multimodal denso de 27 mil millones de parámetros, desarrollado por el equipo Qwen de Alibaba, con una arquitectura híbrida de atención: solo 16 de sus 64 capas usan atención completa, mientras que las otras 48 usan atención lineal con estado recurrente constante. Esto reduce el coste computacional en contextos largos. La versión abliterada conserva las capacidades del original, incluyendo razonamiento, generación de código, uso de herramientas y procesamiento de imágenes, pero con la peculiaridad de no rechazar solicitudes. La relevancia actual radica en que ofrece una alternativa abierta y sin restricciones para desarrolladores que necesitan explorar los límites de los modelos de lenguaje o construir aplicaciones que requieren respuestas sin filtros, todo ello con una licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas de atención completa, 48 de atención lineal) |
| Parametros totales | 27 mil millones (el archivo safetensors indica 6.294.768.880, posiblemente error de metadatos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo original soporta hasta 128k tokens, pero no se confirma en esta conversión) |
| Tipos de cuantizacion | Mixta por tensor: 4-bit, 6-bit y 8-bit, grupo de 32, media de 6,096 bpw |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, emplea una arquitectura de transformer denso con atención híbrida. De las 64 capas, solo 16 utilizan atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Este diseño reduce la complejidad computacional de O(n²) a O(n) en la mayoría de las capas, mejorando la eficiencia en secuencias largas. El modelo fue preentrenado con un corpus multilingüe extenso y posteriormente ajustado con instrucciones y aprendizaje por refuerzo (RLHF/DPO), aunque los detalles exactos del entrenamiento no se especifican en la información disponible.

La versión abliterada, creada por KridgeDookie, aplica una técnica de abliteración que identifica y elimina las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. Esto se logra mediante un análisis de diferencias entre respuestas normales y respuestas de rechazo, y posteriormente se proyectan esas direcciones fuera del modelo. El resultado es un modelo que no se niega a responder, aunque conserva la mayoría de sus capacidades. La conversión a MLX, realizada por TheCluster, utiliza mlx-vlm versión 0.6.13 y aplica una cuantización mixta por tensor para reducir el tamaño del modelo sin degradar significativamente la calidad.

## Capacidades

- Generación de texto y razonamiento complejo: mantiene las capacidades del Qwen3.8-27B original, incluyendo razonamiento matemático, lógico y de sentido común.
- Generación de código: soporta múltiples lenguajes de programación y puede integrarse en flujos de desarrollo.
- Procesamiento de imágenes: al ser un modelo multimodal (image-text-to-text), puede comprender imágenes y responder preguntas sobre ellas.
- Soporte de tool calling / function calling: el modelo base incluye esta capacidad, que se conserva en la versión abliterada.
- Capacidades de agente: puede ejecutar tareas multi-paso y razonar sobre acciones a tomar.
- Multilingüe: soporta 26 idiomas, incluyendo español, inglés, chino, ruso, francés, etc.
- Modo de razonamiento: el modelo tiene un parámetro `reasoning_effort` que por defecto está configurado en 'low' para evitar sobre-pensamiento, pero se puede ajustar.
- Sin censura: no rechaza solicitudes, lo que permite explorar temas que otros modelos bloquean.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, útil para analizar sesgos, alucinaciones y límites de seguridad.
- Generación de contenido creativo sin restricciones: escritores y creadores pueden usarlo para explorar narrativas que otros modelos censurarían, como ficción con contenido adulto o temas controvertidos.
- Automatización de atención al cliente: al no rechazar peticiones, puede gestionar consultas delicadas o frustradas sin escalar a un humano, aunque requiere supervisión.
- Asistente de programación con tool calling: puede integrarse en entornos de desarrollo para generar código, explicar errores o refactorizar, usando herramientas externas.
- Análisis de documentos con imágenes: su capacidad multimodal permite extraer información de capturas, diagramas o documentos escaneados.
- Pruebas de estrés de sistemas de moderación: sirve para evaluar la robustez de filtros de contenido en plataformas, generando respuestas que otros modelos evitarían.
- Chatbot educativo sin restricciones: para entornos donde se necesita responder preguntas filosóficas, éticas o científicas sin tabúes, siempre bajo supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión a MLX. El modelo base Qwen3.8-27B, según el repositorio oficial de Alibaba, destaca en tareas de codificación, flujos de trabajo agénticos y automatización de oficina, pero no se proporcionan cifras concretas en la información disponible. Para obtener datos comparativos, se recomienda consultar las evaluaciones del modelo original en el repositorio de Qwen.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización mixta de ~6 bit, el modelo ocupa aproximadamente 20,9 GB en disco. En inferencia, se necesitan al menos 24 GB de memoria unificada en Apple Silicon (por ejemplo, Mac Studio con 64 GB) o una GPU con 24 GB de VRAM si se usa otro backend.
- GPU recomendadas: en Apple Silicon, cualquier chip M1 Pro/Max/Ultra o M2/M3 con suficiente memoria unificada. En GPUs NVIDIA, una RTX 4090 (24 GB) o A6000 (48 GB) puede ejecutarlo, aunque el formato MLX está optimizado para Apple.
- Opciones de despliegue: al ser formato MLX, se puede ejecutar con el ecosistema MLX (mlx-lm, mlx-vlm). También es posible convertir a otros formatos (GGUF, safetensors) para usar con llama.cpp, Ollama o vLLM, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no hay datos medidos para esta conversión. En Apple Silicon con 64 GB, se puede esperar una generación de 20-40 tokens por segundo en modo de razonamiento bajo, dependiendo de la capa de atención completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 128k (estimado) | Apache 2.0 | safetensors | Modelo base con censura, atención híbrida |
| Qwen3.8-27B-Abliterated (KridgeDookie) | 27B | No disponible | Apache 2.0 | safetensors | Versión abliterada, sin censura |
| huihui-ai/Qwen3-8B-abliterated | 8B | 32k | Apache 2.0 | safetensors | Abliterado de Qwen3-8B, más pequeño y ligero |
| Este modelo (TheCluster MLX) | 27B | No disponible | Apache 2.0 | MLX | Conversión a MLX con cuantización mixta 6-bit |

La principal diferencia con el original es la eliminación de la censura y el formato MLX optimizado para Apple Silicon. Comparado con el abliterado de 8B, este ofrece mayor capacidad y multimodalidad, pero requiere más recursos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una versión abliterada, puede generar contenido ofensivo, discriminatorio o falso con mayor facilidad, ya que no tiene mecanismos de rechazo. Se recomienda supervisión humana en producción.
- Riesgo de contenido inapropiado: el modelo puede producir respuestas sexuales, violentas o ilegales. No debe usarse en aplicaciones públicas sin filtros adicionales.
- Limitaciones de contexto: la longitud de contexto no está confirmada en esta conversión; si se usa con MLX, el rendimiento en secuencias largas puede degradarse debido a la atención híbrida.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base puede tener restricciones adicionales sobre el uso de marcas o nombres de Qwen. Se recomienda revisar la licencia del modelo original.
- Formato específico: el formato MLX solo es directamente utilizable en Apple Silicon. Para otras plataformas, se requiere conversión a GGUF o safetensors, lo que puede afectar la calidad de la cuantización.
- Configuración de razonamiento: el parámetro `reasoning_effort` está configurado en 'low' por defecto; si se aumenta, el modelo puede volverse más lento y verboso.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/TheCluster/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-mixed-6bit
- Modelo base abliterado (KridgeDookie): https://huggingface.co/KridgeDookie/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Artículo sobre abliteración de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Ejemplo de abliterado de Qwen3-8B: https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
