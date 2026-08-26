# summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64

## Resumen

El modelo `summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64` es un fine-tune experimental del modelo multimodal denso Qwen3.8-27B, desarrollado por el usuario summerMC sobre la base publicada por el equipo Qwen de Alibaba. El nombre del modelo sugiere una modificación arquitectónica orientada a acelerar la inferencia mediante la sustitución de parte de la atención completa por capas recurrentes basadas en Gated Delta Net (GDN), una variante de atención lineal con estado recurrente constante. El resultado es un modelo de 27.533 millones de parámetros con pipeline `image-text-to-text`, licencia Apache 2.0 y pesos en formato safetensors.

La relevancia de este modelo radica en que explora una vía de optimización de coste computacional para modelos multimodales de gran tamaño, manteniendo las capacidades del modelo base (razonamiento, código, agentes y automatización de oficina) pero con una arquitectura híbrida que reduce la memoria y el tiempo de atención en las capas recurrentes. Es un modelo experimental, con etiqueta `custom_code`, lo que implica que requiere código personalizado para su carga y ejecución. Aunque las descargas son escasas (46) y los likes limitados (1), su interés técnico reside en la combinación de visión-lenguaje con arquitecturas recurrentes modernas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas con atención completa y 48 capas con atención lineal recurrente (Gated Delta Net) sobre el backbone de Qwen3.8-27B |
| Parametros totales | 27.533.015.792 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta contexto largo, pero no se especifica en la informacion del fine-tune) |
| Tipos de cuantizacion | No disponible (existe un repo GGUF separado, pero no se detallan los tipos) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (y GGUF en repo complementario) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, sobre el que se construye este fine-tune, emplea un backbone de atención híbrida: de sus 64 capas, solo 16 utilizan atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Esta configuración reduce el coste cuadrático de la atención estándar y permite ventanas de contexto más largas con menor uso de memoria. El fine-tune de summerMC incorpora la variante Gated Delta Net (GDN) en esas capas recurrentes, lo que refuerza la capacidad de mantener información a largo plazo con un coste fijo por paso.

No se dispone de información detallada sobre el proceso de entrenamiento del fine-tune: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo se presenta como experimental y con `custom_code`, lo que sugiere que la arquitectura modificada requiere una implementación personalizada en transformers. El tag `automatic-speech-recognition` aparece en los metadatos, pero no hay evidencia de que el modelo soporte entrada de audio; probablemente es un residuo de la configuración original.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y texto como entrada, y produce texto como salida, manteniendo las capacidades del modelo base Qwen3.8-27B en tareas de visión-lenguaje.
- Codificación y generación de código: el modelo base destaca en tareas de programación, y este fine-tune conserva esa capacidad.
- Agentes y flujos de trabajo autónomos: soporta razonamiento multi-paso y puede integrarse en pipelines de agentes, según las características del modelo base.
- Automatización de oficina: procesamiento de documentos, hojas de cálculo y presentaciones con entrada visual.
- Capacidades multilingües: no especificadas para este fine-tune, aunque el modelo base de Qwen suele cubrir múltiples idiomas.
- Soporte de tool calling y function calling: no confirmado explícitamente para este fine-tune, pero el modelo base lo incluye.
- Arquitectura recurrente con GDN: permite inferencia con memoria constante en las capas recurrentes, reduciendo el coste de atención a largo plazo.

## Casos de uso

- Atención al cliente multimodal: el modelo puede procesar capturas de pantalla, imágenes de productos o documentos escaneados junto con consultas de texto, manteniendo conversaciones multi-turno con contexto prolongado gracias a la atención recurrente de bajo coste.
- Generación de código asistida por imagen: un desarrollador puede subir un diagrama o un boceto de interfaz y pedir al modelo que genere el código HTML, CSS o Python correspondiente, aprovechando la capacidad de visión-lenguaje.
- Automatización de documentos de oficina: extracción de datos de facturas, tablas o formularios escaneados, con generación de resúmenes o rellenado de plantillas, útil en entornos administrativos.
- Agentes de razonamiento multi-paso: integración en frameworks de agentes (por ejemplo, con vLLM o TGI) para tareas que requieren planificación, uso de herramientas y verificación de resultados, como la gestión de incidencias técnicas.
- Análisis de imágenes médicas o técnicas: descripción de radiografías, planos o diagramas de ingeniería, con explicaciones textuales detalladas, siempre que se valide la precisión en el dominio específico.
- Prototipado rápido de interfaces: a partir de una imagen de un diseño UI, el modelo puede generar el código de implementación o sugerir mejoras de usabilidad, acelerando el ciclo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la informacion disponible. El modelo base Qwen3.8-27B ha sido evaluado en tareas como MathVision, pero no se proporcionan cifras concretas en los resultados de búsqueda. Tampoco se dispone de comparativas con otros modelos en el contexto de este fine-tune. Por tanto, no es posible presentar una tabla de rendimiento sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.533 millones de parámetros, el modelo requiere aproximadamente 55 GB en fp32, 28 GB en fp16, 14 GB en int8 y 7 GB en int4. Estas cifras son orientativas y dependen de la implementación y la longitud de contexto.
- GPU recomendadas: para fp16 sin cuantizar, se necesitan GPUs de datacenter como A100 80GB o H100. Con cuantización int8 o int4, cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) para int4.
- Si cabe en consumer GPU: sí, con cuantización int4 y una GPU de 24 GB, aunque la velocidad será limitada. Para uso interactivo, se recomienda al menos una RTX 4090.
- Opciones de despliegue: vLLM, llama.cpp (para el formato GGUF), Ollama, TGI y transformers con `custom_code`. Dado el carácter experimental, es probable que se requiera compilar el código personalizado.
- Latencia y throughput: no disponibles. Al ser un modelo experimental con arquitectura modificada, no se han publicado mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.5B | No especificado | Atención híbrida (16 full + 48 lineal) | Apache 2.0 | HuggingFace, vLLM |
| summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64 | 27.5B | No especificado | Atención híbrida con GDN recurrente | Apache 2.0 | HuggingFace (experimental) |
| Qwen2.5-32B (referencia de tamaño similar) | 32.5B | 128K | Transformer denso estándar | Apache 2.0 | HuggingFace, vLLM |

La comparativa se limita a modelos de tamaño similar. El fine-tune de summerMC se distingue por su arquitectura recurrente con GDN, que no está presente en el modelo base ni en Qwen2.5-32B. No se dispone de datos de rendimiento para comparar numéricamente.

## Limitaciones y advertencias

- Modelo experimental: la etiqueta `custom_code` y el carácter de fine-tune no oficial implican que puede contener errores, comportamientos inesperados o falta de soporte en frameworks estándar.
- Sesgos conocidos: no se ha documentado ningún análisis de sesgos para este modelo. Al derivar de Qwen3.8-27B, puede heredar sesgos del dataset de entrenamiento original.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento visual complejo.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados. Se recomienda validar estos aspectos antes de usarlo en producción.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental con código personalizado, la responsabilidad de su correcto funcionamiento recae en el usuario.
- Caveat para producción: la falta de benchmarks y documentación hace desaconsejable su uso en entornos críticos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64
- Versión GGUF del modelo: https://huggingface.co/summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64-GGUF
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha de Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
