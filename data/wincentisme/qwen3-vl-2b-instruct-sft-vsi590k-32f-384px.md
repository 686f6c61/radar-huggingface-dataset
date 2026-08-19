# wincentIsMe/Qwen3-VL-2B-Instruct-SFT-VSI590k-32f-384px

## Resumen

El modelo **Qwen3-VL-2B-Instruct-SFT-VSI590k-32f-384px** es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base **Qwen/Qwen3-VL-2B-Instruct**, desarrollado por el usuario `wincentIsMe`. Está especializado en **razonamiento espacial** a partir de entradas de vídeo, habiendo sido entrenado con el dataset **VSI590k** muestreando 32 fotogramas por vídeo a una resolución de 384 píxeles. La torre de visión permanece congelada durante el entrenamiento, ajustándose únicamente el proyector y las capas de lenguaje.

Este modelo resuelve el problema de la comprensión espacial y temporal en secuencias de vídeo, una capacidad crítica para aplicaciones como navegación autónoma, análisis de escenas dinámicas o asistencia visual. Su relevancia radica en ofrecer una versión afinada de un modelo VLM compacto (2,4 mil millones de parámetros) que puede ejecutarse en hardware de consumo, democratizando el acceso a tareas de razonamiento espacial que antes requerían modelos mucho más grandes.

La arquitectura es `Qwen3VLForConditionalGeneration` (tipo `qwen3_vl`), compatible con el ecosistema `transformers`. El repositorio contiene el modelo consolidado en formato `safetensors` junto con los archivos de configuración del tokenizador y procesador, listo para inferencia o para continuar el ajuste. No se especifica la longitud de contexto, los idiomas soportados ni la licencia en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (model_type: qwen3_vl) |
| Parametros totales | 2.438.696.960 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de **Qwen/Qwen3-VL-2B-Instruct**, un VLM multimodal que combina un codificador de visión con un modelo de lenguaje transformador. El ajuste fino se realiza sobre el dataset **VSI590k**, diseñado para razonamiento espacial en vídeo. Cada muestra de entrenamiento consiste en un vídeo muestreado a **32 fotogramas** y reescalado a **384 píxeles** de resolución, lo que permite capturar tanto información espacial como temporal.

El entrenamiento se ejecutó durante **1 época** con **2308 pasos** utilizando **DeepSpeed**, manteniendo la torre de visión congelada (solo se actualizan el proyector y las capas de lenguaje). Esta estrategia reduce el coste computacional y preserva las representaciones visuales preentrenadas. No se incluyen checkpoints intermedios ni estados del optimizador en el repositorio, solo el modelo final consolidado.

## Capacidades

- Procesamiento de imágenes y vídeo: acepta secuencias de hasta 32 fotogramas como entrada visual.
- Razonamiento espacial: entrenado específicamente para comprender relaciones espaciales entre objetos y su evolución temporal.
- Generación de texto conversacional: hereda las capacidades de instrucción del modelo base Qwen3-VL-2B-Instruct.
- Interacción multimodal: combina entrada visual y textual para producir respuestas descriptivas o analíticas.
- Compatible con el pipeline `image-text-to-text` de HuggingFace Transformers.

## Casos de uso

- **Análisis de vídeo de vigilancia**: el modelo puede procesar secuencias de 32 fotogramas para detectar comportamientos anómalos o describir la disposición de objetos en una escena, ayudando en sistemas de seguridad automatizados.
- **Asistencia a navegación robótica**: al comprender la posición relativa de obstáculos y caminos en vídeo, puede generar instrucciones de navegación en entornos interiores o exteriores.
- **Descripción de entornos para personas con discapacidad visual**: a partir de un vídeo corto, el modelo produce descripciones detalladas de la distribución espacial de elementos, facilitando la orientación.
- **Moderación de contenido visual**: puede analizar vídeos para identificar si ciertos objetos o personas aparecen en ubicaciones no permitidas, ayudando a filtrar contenido inapropiado.
- **Generación de subtítulos descriptivos para vídeos**: convierte secuencias visuales en texto narrativo que describe acciones y relaciones espaciales, útil para accesibilidad o indexación de contenido.
- **Entrenamiento de agentes virtuales**: el modelo puede servir como módulo de percepción en entornos simulados, interpretando la escena y generando comandos de acción basados en razonamiento espacial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 2,4 mil millones de parámetros, el modelo en precisión FP16 ocupa aproximadamente 4,9 GB (según el tamaño del repositorio), por lo que se recomienda al menos **6 GB de VRAM** para cargar el modelo y procesar entradas de vídeo.
- GPUs recomendadas: tarjetas consumer como **NVIDIA RTX 3060 (12 GB)**, **RTX 4060 Ti (16 GB)** o superiores pueden ejecutar el modelo con margen. Para uso en servidores, una **A10G** o **L4** sería suficiente.
- Despliegue: al ser compatible con `transformers`, puede servirse mediante **vLLM**, **TGI** o **Ollama** (si se convierte a GGUF), aunque no se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles; dependerán del hardware y del número de fotogramas procesados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Qwen3-VL-2B-Instruct (base) | 2.438.696.960 | no disponible | VLM general | Apache 2.0 (según modelo base) |
| Qwen3-VL-2B-Instruct-SFT-VSI590k (este) | 2.438.696.960 | no disponible | Razonamiento espacial en vídeo | no disponible |
| LLaVA-1.6 (7B) | 7.000 millones | 4096 | VLM general | Apache 2.0 |

No se dispone de comparativas directas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no indica la licencia, por lo que su uso comercial o redistribución requiere contactar con el autor para aclarar los términos.
- **Sesgos desconocidos**: no se han documentado estudios de sesgos; al ser un ajuste fino de un modelo base, puede heredar sesgos de los datos originales de Qwen.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir descripciones espaciales incorrectas o inventadas, especialmente en escenas ambiguas o con baja resolución.
- **Limitación de contexto**: no se conoce la longitud máxima de contexto textual; el modelo está optimizado para entradas de vídeo de 32 fotogramas, y entradas más largas podrían degradar el rendimiento.
- **Idiomas no especificados**: no se indica qué idiomas soporta; probablemente herede los del modelo base (principalmente inglés y chino), pero no es seguro.
- **Producción**: al ser un modelo de 2,4B, su precisión en tareas complejas de razonamiento espacial puede ser inferior a la de modelos más grandes; se recomienda validar en el caso de uso concreto.

## Enlaces

- [HuggingFace: wincentIsMe/Qwen3-VL-2B-Instruct-SFT-VSI590k-32f-384px](https://huggingface.co/wincentIsMe/Qwen3-VL-2B-Instruct-SFT-VSI590k-32f-384px)
- [Modelo base: Qwen/Qwen3-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct)
