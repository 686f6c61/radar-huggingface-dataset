# Yingying11/HeatTok-EarthVQA-7B

## Resumen

HeatTok-EarthVQA-7B es un modelo de visión-lenguaje (VLM) especializado en comprensión de imágenes de teledetección, desarrollado por un equipo de investigadores (Yingying Yan, Jiaqi Tang, Wei Wei, et al.) y presentado en el ACM Multimedia 2026. El modelo se basa en la arquitectura Qwen2.5-VL-7B y utiliza un tokenizador innovador llamado HeatTok, que emplea un mecanismo de termodifusión para agregar regiones homogéneas adyacentes y generar tokens que se adhieren a los límites de los objetos, reduciendo la mezcla semántica y la fragmentación en imágenes de alta resolución.

Este checkpoint concreto está ajustado para el conjunto de datos EarthVQA, orientado a tareas de respuesta a preguntas visuales (VQA) sobre imágenes de observación de la Tierra. La relevancia actual radica en que los modelos VLM estándar suelen degradarse en imágenes de teledetección por la gran escala y la densidad de objetos pequeños; HeatTok aborda este problema con una tokenización semánticamente alineada que preserva la integridad de los objetos. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación.

La información pública disponible es limitada: no se especifican el número total de parámetros, la longitud de contexto, los idiomas soportados ni los formatos de pesos. El repositorio de GitHub y el paper en arXiv (2608.22485) contienen los detalles técnicos, pero no se han extraído datos numéricos adicionales en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B con tokenizador HeatTok (termodifusión) |
| Parametros totales | 7 mil millones (estimado por el nombre "7B", no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

HeatTok-EarthVQA-7B se construye sobre el modelo base Qwen2.5-VL-7B, un VLM transformer con componentes de visión y lenguaje. La innovación principal es el tokenizador HeatTok, que utiliza un mecanismo de termodifusión para fusionar regiones adyacentes homogéneas en la imagen, generando tokens que respetan los límites de los objetos. Este proceso reduce la mezcla semántica y la fragmentación, problemas comunes en la tokenización por parches fijos de los VLM convencionales.

El entrenamiento se realiza mediante ajuste fino (fine-tuning) del modelo base sobre el conjunto de datos EarthVQA, que contiene pares de imágenes de teledetección con preguntas y respuestas. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El paper en arXiv (2608.22485) describe las evaluaciones en VRSBench y EarthVQA, reportando un rendimiento de última generación bajo un presupuesto de tokens razonable, pero no se incluyen los valores numéricos en la información disponible.

## Capacidades

- Comprensión de imágenes de teledetección: el modelo está especializado en interpretar escenas de observación de la Tierra, incluyendo objetos pequeños y estructuras geográficas.
- Respuesta a preguntas visuales (VQA): puede responder preguntas sobre el contenido de las imágenes, como presencia de objetos, relaciones espaciales o atributos.
- Razonamiento visual de alta resolución: gracias a la tokenización por termodifusión, maneja mejor imágenes de gran tamaño y alta densidad de objetos que los VLM estándar.
- Generación de texto descriptivo: puede producir descripciones textuales de escenas de teledetección.
- Capacidades heredadas de Qwen2.5-VL-7B: al estar basado en este modelo, conserva las capacidades generales de visión-lenguaje del modelo base, aunque el ajuste fino puede haberlas especializado.
- No se ha confirmado soporte para tool calling, agentes o modos de razonamiento extendido en la información disponible.

## Casos de uso

- Análisis de imágenes satelitales para agricultura de precisión: el modelo puede identificar cultivos, detectar anomalías o responder preguntas sobre el uso del suelo, ayudando a agrónomos a monitorizar grandes extensiones.
- Gestión de desastres naturales: a partir de imágenes aéreas o satelitales, puede responder sobre daños en infraestructuras, zonas inundadas o áreas quemadas, facilitando la coordinación de equipos de emergencia.
- Planificación urbana y ordenación territorial: permite extraer información sobre densidad de edificaciones, infraestructuras verdes o cambios en el paisaje urbano a partir de imágenes de alta resolución.
- Vigilancia ambiental: el modelo puede responder preguntas sobre deforestación, presencia de masas de agua o cambios en la cobertura vegetal, apoyando estudios de impacto ambiental.
- Documentación y generación de informes: a partir de una imagen de teledetección, puede generar descripciones textuales estructuradas que sirvan como base para informes técnicos o artículos científicos.
- Educación e investigación: los investigadores pueden utilizar el modelo para explorar metodologías de VQA en teledetección, comparar con otros tokenizadores o como punto de partida para nuevos ajustes finos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper en arXiv (2608.22485) menciona evaluaciones en VRSBench y EarthVQA con rendimiento de última generación, pero no se incluyen los valores numéricos en la ficha. Se recomienda consultar el artículo original para obtener datos concretos de MMLU, HumanEval u otras métricas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7B parámetros, se estima que requiere al menos 14-16 GB de VRAM en FP16 para inferencia, y menos con cuantización (por ejemplo, 8-10 GB en 8 bits, 6-8 GB en 4 bits). Estos valores son orientativos y no han sido confirmados por el autor.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o similares con suficiente memoria. En consumer GPU, una RTX 4090 (24 GB) podría ejecutar el modelo en FP16 o cuantizado.
- Si cabe en consumer GPU: sí, en GPUs con 16 GB o más, especialmente con cuantización.
- Opciones de despliegue: al estar basado en Qwen2.5-VL, es compatible con frameworks como vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (si se empaqueta). No se ha confirmado soporte oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| HeatTok-EarthVQA-7B | 7B (estimado) | no disponible | Teledetección VQA | Apache-2.0 |
| Qwen2.5-VL-7B (base) | 7B | 128K (típico de la serie) | VLM general | Apache-2.0 |
| LLaVA-NeXT (7B) | 7B | 32K | VLM general | Apache-2.0 |
| GeoChat (7B) | 7B | no disponible | Teledetección VQA | no disponible |

La comparativa es limitada porque no se dispone de datos de rendimiento numéricos. HeatTok se diferencia de los VLM generales por su tokenizador especializado en teledetección, mientras que GeoChat es otro modelo específico del dominio, pero no se han publicado comparaciones directas en la información disponible.

## Limitaciones y advertencias

- Especialización limitada: el modelo está ajustado para EarthVQA, por lo que su rendimiento en otras tareas de visión general puede ser inferior al del modelo base Qwen2.5-VL-7B.
- Sesgos del dataset: EarthVQA puede contener sesgos geográficos o de anotación que afecten a la generalización a otras regiones o tipos de imágenes.
- Riesgo de alucinación: como todo VLM, puede generar respuestas plausibles pero incorrectas, especialmente en imágenes ambiguas o de baja calidad.
- Falta de información sobre contexto y cuantización: no se han publicado datos sobre la longitud de contexto soportada ni los formatos de cuantización, lo que dificulta la planificación de despliegue.
- Dependencia del modelo base: las limitaciones de Qwen2.5-VL-7B (por ejemplo, en razonamiento complejo o en idiomas de bajos recursos) se heredan en este checkpoint.
- Licencia Apache-2.0: permite uso comercial, pero se debe atribuir correctamente y no se incluyen garantías implícitas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yingying11/HeatTok-EarthVQA-7B
- Paper en arXiv: https://arxiv.org/abs/2608.22485
- Repositorio GitHub: https://github.com/YingyingYan1/HeatTok
- Checkpoint VRSBench: https://huggingface.co/Yingying11/HeatTok-VRSBench-7B
- Dataset Semantic Patch Cache: https://huggingface.co/datasets/Yingying11/semantic_patch_cache
