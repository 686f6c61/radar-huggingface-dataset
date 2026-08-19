# TheCluster/Qwen3.8-27B-MLX-mixed-9.4bit

## Resumen

El modelo `TheCluster/Qwen3.8-27B-MLX-mixed-9.4bit` es una conversión a formato MLX del modelo Qwen3.8-27B, realizada por TheCluster. Se trata de una versión cuantizada con precisión mixta de aproximadamente 9,4 bits por peso, diseñada para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería MLX. El modelo base, Qwen3.8-27B, es un transformer multimodal (imagen-texto) desarrollado por Alibaba, con 27 mil millones de parámetros y soporte para más de 20 idiomas. Esta conversión permite desplegar un modelo de gran tamaño en entornos con memoria unificada limitada, manteniendo un equilibrio entre calidad y consumo de recursos. Su relevancia radica en que facilita la inferencia local en Macs y otros dispositivos Apple, sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B) |
| Parametros totales | No disponible (el archivo safetensors reporta 9.757.854.960 parametros, lo que sugiere una discrepancia con el nombre del modelo base; se recomienda consultar la documentacion oficial de Qwen) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: 8-bit affine con group size 32 en la mayoria de tensores, y bf16 en tensores importantes (9.450 bpw) |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer con arquitectura similar a la familia Qwen3.8, que incluye atención por ventanas deslizantes y mecanismos de razonamiento explícito (thinking mode). No se dispone de detalles sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada. La conversión a MLX se realizó con la versión 0.6.13 de mlx-vlm, que adapta los pesos al formato de MLX y aplica una cuantización mixta por tensor: la mayoría de los tensores se cuantizan a 8 bits con group size 32, mientras que algunos tensores críticos se mantienen en bf16 para preservar la precisión. Esta estrategia reduce el tamaño del modelo y acelera la inferencia en Apple Silicon, aunque puede introducir una ligera degradación en la calidad respecto al modelo original en bf16.

## Capacidades

- Generación de texto y razonamiento conversacional en múltiples idiomas (más de 20, incluyendo español).
- Procesamiento de imágenes y texto (pipeline image-text-to-text), lo que permite tareas de visión por computador como descripción de imágenes, respuesta a preguntas visuales y razonamiento multimodal.
- Soporte de modo de pensamiento (thinking mode) y modo instructivo, con parámetros de muestreo recomendados por el desarrollador.
- Capacidad de tool calling y function calling, heredada del modelo base Qwen3.8-27B (no confirmado en la información proporcionada, pero es una característica típica de la familia Qwen).
- Multilingüismo amplio, con cobertura de lenguas europeas, asiáticas y africanas.

## Casos de uso

- Asistentes virtuales locales en Mac: al ser un modelo MLX, puede integrarse en aplicaciones de escritorio para macOS, ofreciendo respuestas conversacionales sin conexión a internet.
- Análisis de documentos con imágenes: gracias a su capacidad multimodal, puede extraer información de capturas de pantalla, gráficos o fotografías en entornos de productividad.
- Generación de código asistida: el modelo base Qwen3.8-27B tiene buenas capacidades de programación; esta versión cuantizada permite ejecutarlo en portátiles Apple para autocompletado y revisión de código.
- Traducción automática: con soporte para más de 20 idiomas, puede utilizarse como motor de traducción local en aplicaciones de comunicación.
- Chatbots de atención al cliente: su modo instructivo y su capacidad de mantener conversaciones multi-turno lo hacen adecuado para sistemas de soporte en tiempo real, especialmente en entornos donde la privacidad exige procesamiento local.
- Investigación académica: permite a investigadores probar modelos de gran tamaño en hardware asequible (Macs con Apple Silicon) para experimentos de procesamiento de lenguaje natural y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para esta conversión específica. Se recomienda consultar los benchmarks del modelo base Qwen3.8-27B en su repositorio oficial para una referencia aproximada, teniendo en cuenta que la cuantización puede afectar ligeramente al rendimiento.

## Requisitos de hardware

- Al ser un modelo MLX, está optimizado para Apple Silicon (M1, M2, M3 y superiores). No es compatible con GPUs NVIDIA o AMD de forma nativa.
- La memoria unificada necesaria depende del tamaño del modelo cuantizado. El archivo safetensors reporta 9.757.854.960 parámetros, lo que a 9.45 bits por peso implica aproximadamente 11,5 GB de memoria para los pesos. Sin embargo, el tamaño total del repositorio es de 64,7 GB, lo que sugiere que puede incluir otros archivos o versiones. Se recomienda al menos 16 GB de RAM unificada para una inferencia fluida.
- Para modelos de 27B en MLX, se recomienda un Mac con chip M1 Pro, M2 Pro o superior, o un Mac Studio con M1 Ultra o M2 Ultra para mayor margen.
- Opciones de despliegue: la librería MLX permite integración con frameworks como mlx-lm, mlx-vlm y vLLM (con soporte experimental para MLX). También se puede usar con Ollama si se convierte a formato GGUF, aunque no es el formato nativo.
- La latencia y el throughput dependen del hardware específico; en un MacBook Pro con M2 Max, se pueden esperar decenas de tokens por segundo para modelos de este tamaño, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos. El modelo base Qwen3.8-27B se puede comparar con otros modelos de 27B como Llama 3.1 8B (menor tamaño) o Mixtral 8x7B (arquitectura MoE), pero esta conversión específica no tiene datos de rendimiento publicados. Se recomienda consultar las comparativas del modelo base en el repositorio de Qwen.

## Limitaciones y advertencias

- La cuantización mixta de 9.4 bits puede provocar una pérdida de precisión en tareas que requieren alta exactitud numérica, como matemáticas complejas o razonamiento lógico extenso.
- El modelo base puede presentar sesgos y alucinaciones, especialmente en idiomas con menos representación en el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar los términos del modelo base Qwen3.8-27B, que también es Apache-2.0.
- Al ser una conversión no oficial, no hay garantía de que el comportamiento sea idéntico al modelo original; se recomienda validar en casos de uso críticos.
- El soporte de tool calling y funciones multimodales no está confirmado en la documentación de esta conversión; depende de las capacidades del modelo base.
- El tamaño del repositorio (64,7 GB) es considerablemente mayor que el tamaño estimado de los pesos cuantizados, lo que sugiere que puede incluir archivos adicionales o versiones sin cuantizar; se debe verificar el contenido antes de su uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheCluster/Qwen3.8-27B-MLX-mixed-9.4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
