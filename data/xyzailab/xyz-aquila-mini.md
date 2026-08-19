# XYZAILab/XYZ-Aquila-mini

## Resumen

XYZ-Aquila-mini es un modelo de lenguaje abierto de tipo "thinking model" (modelo de razonamiento) desarrollado por XYZ AI Lab, especializado en búsqueda agéntica profunda (Deep Search). Se trata de un post-entrenamiento del modelo base Qwen/Qwen3.6-35B-A3B, un MoE de 35 mil millones de parámetros totales con 3 mil millones activos, realizado mediante un pipeline propietario denominado AI4AI (Inteligencia Artificial para Inteligencia Artificial) de exploración acotada. En este proceso, los humanos definen la capacidad objetivo, las evidencias de desarrollo, las restricciones, los límites de riesgo y la política de aceptación, mientras que agentes de IA diagnostican fallos y proponen intervenciones acotadas en datos, post-entrenamiento, runtime, gestión de contexto, herramientas, evaluación e infraestructura.

El modelo está optimizado para tareas de búsqueda agéntica: planificación de largo horizonte, navegación web en inglés y chino, agregación de evidencia de múltiples fuentes, verificación de fuentes y recuperación de errores en interacciones con el entorno. Utiliza formatos de razonamiento y tool-calling compatibles con Qwen, y se distribuye junto con el harness de código abierto AxisAgentic, que proporciona las implementaciones concretas de las herramientas `search`, `scrape` y `python`, así como el contrato de herramientas fijo y el flujo de evaluación. El checkpoint liberado tiene 35.107.181.936 parámetros, un tamaño de repositorio de 70,2 GB en formato safetensors y se publica bajo licencia Apache 2.0. Su relevancia radica en que, según los benchmarks publicados, obtiene los mejores resultados en su categoría de modelos abiertos de menos de 40B en seis benchmarks de búsqueda agéntica, superando a alternativas como Agents-A1, Nex-N2-mini, apodex-mini y MiroThinker 1.7 mini.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basado en Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | 3B (según nomenclatura A3B del modelo base) |
| Longitud de contexto | No disponible (evaluado con hasta 256K de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles y chino (mencionados en la descripcion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

XYZ-Aquila-mini es un modelo de arquitectura MoE con 35B parámetros totales y 3B activos, post-entrenado a partir de Qwen3.6-35B-A3B. El proceso de post-entrenamiento se realiza mediante un pipeline AI4AI de exploración acotada, en el que agentes de IA diagnostican fallos del modelo en tareas objetivo y proponen intervenciones específicas en datos, post-entrenamiento, runtime, gestión de contexto, herramientas, evaluación e infraestructura. Este enfoque busca mejorar capacidades concretas (en este caso, búsqueda agéntica) sin degradar el rendimiento general.

El modelo incorpora formatos de razonamiento y tool-calling compatibles con Qwen, lo que permite su integración con el harness AxisAgentic, que define un contrato de herramientas fijo (`search`, `scrape`, `python`) y una gestión de contexto reproducible. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset (aunque se menciona el dataset XYZ-Aquila-SFT) ni sobre el uso de técnicas como RLHF o DPO. La innovación principal reside en el propio pipeline AI4AI, que automatiza parte del ciclo de mejora del modelo.

## Capacidades

- Razonamiento profundo (thinking mode) para tareas de búsqueda y análisis complejo.
- Tool calling y function calling, con soporte para herramientas de búsqueda web, extracción de páginas y ejecución de Python.
- Planificación de largo horizonte en entornos agénticos, incluyendo recuperación ante fallos de interacción con el entorno.
- Navegación web en inglés y chino, con agregación de evidencia de múltiples fuentes y verificación de fuentes.
- Capacidades multilingües limitadas a inglés y chino según la descripción.
- Generación de texto conversacional y respuesta a preguntas con razonamiento explícito.
- Compatibilidad con el ecosistema Qwen para integración en pipelines existentes.

## Casos de uso

- Búsqueda profunda en investigación académica: el modelo puede descomponer preguntas complejas, buscar en múltiples fuentes web, extraer información relevante y sintetizar una respuesta verificada, gracias a su capacidad de planificación de largo horizonte y su herramienta de búsqueda integrada.
- Asistentes de análisis de mercado: permite agregar información de informes, noticias y datos públicos en inglés y chino, verificando fuentes y proporcionando resúmenes con evidencia contrastada.
- Automatización de atención al cliente con verificación de información: el modelo puede consultar bases de conocimiento externas en tiempo real, verificar respuestas y mantener conversaciones multi-turno con contexto largo (hasta 256K en evaluación).
- Agentes de extracción de datos estructurados: mediante la herramienta `scrape`, puede extraer información de páginas web específicas y estructurarla en formatos JSON o tablas, útil para pipelines de datos.
- Generación de informes técnicos con referencias verificadas: combina búsqueda web, extracción de contenido y razonamiento para producir informes con citas y fuentes contrastadas.
- Desarrollo de agentes autónomos de investigación: el harness AxisAgentic permite integrar el modelo en sistemas que requieren ejecutar código Python, buscar información y tomar decisiones secuenciales, como en entornos de análisis financiero o científico.

## Benchmarks y rendimiento

Según la model card, XYZ-Aquila-mini obtiene los mejores resultados en todos los benchmarks evaluados dentro de la categoría de modelos abiertos de menos de 40B parámetros. La evaluación se realizó con un harness ReAct-style que incluye búsqueda web, extracción de páginas, ejecución de Python y un contexto máximo de 256K. Los resultados son los siguientes:

| Benchmark | XYZ-Aquila-mini | Agents-A1 | Nex-N2-mini | apodex-mini | MiroThinker 1.7 mini |
|:--|--:|--:|--:|--:|--:|
| BrowseComp | **78.8** | 75.5 | 74.1 | 71.5 | 67.9 |
| BrowseComp-ZH | **82.9** | -- | 79.6† | 80.6 | -- |
| DeepSearchQA | **89.5** | -- | 87.2† | 82.2 | -- |
| GAIA | **97.1** | 96.0 | -- | -- | 80.3 |
| LiveBrowseComp | **48.7** | 29.6† | 41.4† | 32.8† | 34.9† |
| HLE | **51.1** | 47.6 | 37.1† | 46.8 | 36.4 |
| WideSearch | **80.8** | -- | 62.0 | -- | 73.3† |

Nota: los valores marcados con † indican resultados reportados por terceros y no verificados de forma independiente. No se dispone de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Requisitos de hardware

- El tamaño del repositorio es de 70,2 GB, lo que corresponde a pesos en precisión fp16 (35,1B parámetros × 2 bytes). Para inferencia en fp16 se necesitan al menos 70 GB de VRAM.
- Con cuantización a int8 (35 GB) o int4 (18 GB) se podría ejecutar en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se han publicado pesos cuantizados oficiales.
- GPUs recomendadas para fp16: NVIDIA A100 80GB, H100 80GB, o configuración multi-GPU (por ejemplo, 2× RTX 4090 con tensor parallelism).
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TensorRT-LLM, TGI y llama.cpp (si se generan pesos GGUF). El harness AxisAgentic proporciona el flujo de ejecución para tareas agénticas.
- La latencia y el throughput dependen del hardware y de la cuantización. En una A100 80GB con fp16, se puede esperar un throughput de decenas de tokens por segundo, pero no se dispone de datos oficiales.

## Comparativa con modelos similares

La siguiente comparativa se basa únicamente en los benchmarks de búsqueda agéntica publicados en la model card, ya que no se dispone de especificaciones técnicas detalladas de los modelos alternativos.

| Modelo | Parametros | BrowseComp | GAIA | HLE | Licencia |
|:--|--:|--:|--:|--:|:--|
| XYZ-Aquila-mini | 35,1B (MoE, 3B activos) | **78.8** | **97.1** | **51.1** | Apache 2.0 |
| Agents-A1 | No disponible | 75.5 | 96.0 | 47.6 | No disponible |
| Nex-N2-mini | No disponible | 74.1 | -- | 37.1 | No disponible |
| apodex-mini | No disponible | 71.5 | -- | 46.8 | No disponible |
| MiroThinker 1.7 mini | No disponible | 67.9 | 80.3 | 36.4 | No disponible |

XYZ-Aquila-mini supera a todos los modelos comparados en los benchmarks donde hay datos. No se dispone de información sobre el contexto, arquitectura o licencias de los modelos alternativos.

## Limitaciones y advertencias

- La información sobre idiomas es limitada: la descripción menciona inglés y chino, pero no se especifica el rendimiento en otros idiomas.
- No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K), por lo que su rendimiento fuera de tareas de búsqueda agéntica es desconocido.
- El modelo depende del harness AxisAgentic para las capacidades de búsqueda y extracción; sin el harness, estas funciones no están disponibles.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base Qwen3.6-35B-A3B, que también es Apache 2.0.
- No se han publicado datos sobre sesgos, alucinaciones o riesgos específicos. Como modelo de razonamiento, puede generar respuestas confiadas pero incorrectas, especialmente en tareas de búsqueda con fuentes no verificadas.
- La longitud de contexto máxima no está especificada oficialmente; la evaluación se realizó con 256K, pero el rendimiento en contextos largos puede variar.
- No se dispone de información sobre cuantizaciones oficiales ni sobre el rendimiento en entornos de producción con restricciones de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XYZAILab/XYZ-Aquila-mini
- Modelo en ModelScope: https://modelscope.cn/models/XYZAILab/XYZ-Aquila-mini
- Dataset de SFT: https://huggingface.co/datasets/XYZAILab/XYZ-Aquila-SFT
- Harness AxisAgentic: https://github.com/XYZ-AI-Lab/AxisAgentic
- Página del proyecto: https://xyz-lab.ai/xyz-aquila/?lang=en
- Demos: https://xyz-lab.ai/demo/ y https://xyz-lab.ai/try-it-out/
- Informe técnico (PDF): https://xyz-lab.ai/blogs/ai4ai-at-scale/assets/bounded-exploration-ai4ai-system-optimization.pdf
- Repositorio GitHub del laboratorio: https://github.com/XYZ-AI-Lab
