# Taewhoo/qwen3.5-9b-proteomics-sft

## Resumen

Taewhoo/qwen3.5-9b-proteomics-sft es un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-9B-Base, orientado a tareas de proteómica. El modelo base, desarrollado por Alibaba Qwen, integra una arquitectura híbrida con Gated Delta Networks y Mixture-of-Experts dispersa, junto con un codificador de visión, lo que le permite procesar tanto texto como imágenes. Con 9.653 millones de parámetros y una ventana de contexto nativa de 262.144 tokens (extensible hasta 1.010.000), el modelo base destaca por su eficiencia en inferencia y su soporte multilingüe de 201 idiomas.

El autor Taewhoo ha publicado este fine-tuning sin documentación adicional sobre el dataset de entrenamiento, el proceso de ajuste o los resultados específicos en proteómica. La model card incluida en el repositorio es la del modelo base, no la del fine-tuning, por lo que la información disponible se limita a las características del modelo original y a los metadatos del repositorio. A pesar de la falta de detalles, el modelo representa un intento de especializar un LLM multimodal de última generación en el dominio biomolecular, un área de creciente interés para la investigación y la industria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + sparse Mixture-of-Experts + Vision Encoder |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | no disponible (arquitectura MoE, pero sin dato oficial) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el modelo base soporta 201 idiomas, pero el fine-tuning no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de atención lineal) con capas de atención tradicionales y un Mixture-of-Experts disperso. La configuración interna incluye 32 capas, con un layout de 8 bloques de 3 subcapas Gated DeltaNet seguidas de una subcapa Gated Attention, cada una con su correspondiente FFN. El modelo incorpora un codificador de visión para entrada multimodal y un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos. El entrenamiento del modelo base incluyó una fase de pre-entrenamiento multimodal con fusión temprana de tokens y un escalado de reinforcement learning en entornos con millones de agentes.

En cuanto al fine-tuning de Taewhoo, no se ha publicado información sobre el dataset de proteómica utilizado, el número de pasos de entrenamiento, la configuración de hiperparámetros ni las técnicas de alineación empleadas. El repositorio solo indica que se parte de Qwen3.5-9B-Base y que el resultado es un modelo conversacional de tipo image-text-to-text. Esta falta de transparencia impide evaluar la calidad del ajuste y su especialización real en tareas proteómicas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base, que alcanza 82,5 en MMLU-Pro.
- Procesamiento multimodal: acepta entradas de imagen y texto, gracias al codificador de visión del modelo base.
- Contexto largo: ventana nativa de 262.144 tokens, ampliable hasta 1.010.000, útil para documentos extensos o secuencias biológicas largas.
- Soporte multilingüe: el modelo base cubre 201 idiomas, aunque el fine-tuning no garantiza que se mantenga esta cobertura.
- Tool calling y agentes: no hay evidencia específica en el repositorio, pero el modelo base está diseñado para razonamiento multi-paso y uso de herramientas.
- Especialización en proteómica: el nombre del modelo sugiere un ajuste para tareas relacionadas con proteínas, pero no se documentan las capacidades concretas.

## Casos de uso

- Análisis de secuencias de proteínas: el modelo podría emplearse para tareas de clasificación, anotación funcional o predicción de propiedades a partir de secuencias, aunque no hay evidencia publicada de su rendimiento en estas tareas.
- Generación de informes científicos: dado su contexto largo y capacidades de lenguaje, podría redactar resúmenes de literatura proteómica o descripciones de resultados experimentales.
- Asistencia en investigación biomédica: como chatbot especializado, podría responder preguntas sobre biología molecular, siempre que el fine-tuning haya incorporado conocimiento del dominio.
- Análisis de imágenes de geles o espectrometría: al ser multimodal, podría procesar imágenes de experimentos junto con texto, aunque no se ha validado esta capacidad.
- Integración en pipelines de descubrimiento de fármacos: el modelo podría ayudar a priorizar candidatos a partir de datos textuales y de imagen, si el ajuste incluyó datos relevantes.
- Educación y divulgación: explicar conceptos de proteómica a estudiantes o investigadores no especializados, aprovechando su capacidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el fine-tuning Taewhoo/qwen3.5-9b-proteomics-sft. La model card del repositorio reproduce los benchmarks del modelo base Qwen3.5-9B, que reporta 82,5 en MMLU-Pro. No se dispone de datos adicionales (HumanEval, GSM8K, etc.) en la información proporcionada. La tabla de la model card incluye comparaciones con otros modelos, pero está incompleta y no se puede verificar el valor exacto de Qwen3.5-9B en MMLU-Redux.

## Requisitos de hardware

- El repositorio ocupa 19,3 GB, lo que sugiere pesos en FP16 o BF16. Para inferencia en FP16 se necesitan aproximadamente 20 GB de VRAM, lo que permite ejecutarlo en GPUs como RTX 4090 (24 GB) o A100 (40 GB).
- Con cuantización a INT8 (estimada en ~10 GB) o INT4 (~5 GB), podría ejecutarse en GPUs consumer de gama media, aunque no hay archivos GGUF o AWQ publicados en el repositorio.
- Opciones de despliegue: al ser un modelo de la familia Qwen3.5, es compatible con vLLM, SGLang, KTransformers y llama.cpp (si se generan cuantizaciones GGUF). También puede usarse con Hugging Face Transformers.
- La latencia y el throughput dependen del hardware y la cuantización; no se han publicado cifras oficiales para este fine-tuning.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa, ya que el fine-tuning no tiene benchmarks propios. A modo de referencia, el modelo base Qwen3.5-9B se compara en la model card con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking y Qwen3-30B-A3B-Thinking-2507. En MMLU-Pro, Qwen3.5-9B obtiene 82,5, superando a GPT-OSS-20B (74,8) y GPT-OSS-120B (80,8), y quedando cerca de Qwen3-Next-80B-A3B-Thinking (82,7). No hay modelos de tamaño similar con especialización en proteómica documentados en la información proporcionada.

## Limitaciones y advertencias

- No hay documentación sobre el proceso de fine-tuning, el dataset utilizado ni los criterios de evaluación, lo que impide verificar la calidad de la especialización en proteómica.
- El modelo puede presentar alucinaciones o errores en dominios especializados si el ajuste no fue suficientemente robusto.
- La cobertura multilingüe del modelo base podría degradarse tras el fine-tuning, ya que no se especifica si se mantuvo el entrenamiento en todos los idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Al ser un modelo de 9,65B parámetros, requiere hardware con suficiente VRAM para inferencia en FP16; las cuantizaciones no están disponibles en el repositorio.
- No se han publicado resultados de sesgos o evaluaciones de seguridad específicas para este fine-tuning.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Taewhoo/qwen3.5-9b-proteomics-sft
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio de Qwen3.5 en GitHub (referencia): https://github.com/tokwalabs/Qwen3.5
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
