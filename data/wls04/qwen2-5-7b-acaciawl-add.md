# wls04/Qwen2.5-7B-AcaciaWL-Add

## Resumen

El modelo `wls04/Qwen2.5-7B-AcaciaWL-Add` es un fine-tuning supervisado (SFT) del modelo base `Qwen/Qwen2.5-7B-Instruct`, desarrollado por el usuario wls04. El nombre interno del checkpoint es `SPUPER-wg-qwen2.5-7b-acaciawl-2kbalanced-addlr4e-5-rerun`, lo que sugiere un entrenamiento con un dataset balanceado de aproximadamente 2000 ejemplos y una tasa de aprendizaje de 4e-5, aunque estos detalles no están confirmados en la documentación pública. El modelo se entrenó utilizando la librería TRL de Hugging Face, con Transformers 4.57.6 y PyTorch 2.9.0.

Se trata de un modelo de 7.615.616.512 parámetros (7,6 mil millones), que hereda la arquitectura transformer del modelo Qwen2.5-7B-Instruct. No se especifica la longitud de contexto, los idiomas soportados ni la licencia en la model card, aunque el modelo base original soporta hasta 128K tokens y múltiples idiomas. La relevancia de este modelo radica en ser un ejemplo de fine-tuning sobre una base popular, pero carece de documentación detallada sobre su propósito específico o sus capacidades evaluadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128K, no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, no confirmado) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint `Qwen/Qwen2.5-7B-Instruct`, que a su vez es un modelo transformer decoder-only con atención de causalidad completa. El entrenamiento se realizó con la librería TRL (versión 0.27.1), utilizando el framework de Transformers. No se proporcionan detalles sobre la composición del dataset de entrenamiento, aunque el nombre del checkpoint sugiere un conjunto balanceado de aproximadamente 2000 ejemplos ("2kbalanced") y una tasa de aprendizaje de 4e-5 ("addlr4e-5"). No se mencionan técnicas adicionales como RLHF, DPO ni innovaciones arquitectónicas propias; el modelo se limita a ajustar los pesos del modelo base mediante SFT.

## Capacidades

- Generación de texto: al ser un fine-tune del modelo instruct, puede generar respuestas coherentes a instrucciones en lenguaje natural.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, que incluyen razonamiento lógico, matemáticas básicas y conocimiento enciclopédico.
- Soporte de tool calling: el modelo base Qwen2.5-7B-Instruct soporta function calling, por lo que este fine-tune podría conservar dicha capacidad, aunque no se ha verificado específicamente.
- Capacidades multilingües: el modelo base es multilingüe (incluye español, inglés, chino, etc.), pero no se ha confirmado que el fine-tune mantenga el mismo rendimiento en todos los idiomas.
- No se han documentado capacidades especiales adicionales (visión, audio, thinking mode) para este modelo.

## Casos de uso

- Asistente conversacional: al ser un fine-tune de un modelo instruct, puede utilizarse para construir chatbots o asistentes virtuales que respondan a preguntas y mantengan diálogos multi-turno, aunque la ventana de contexto no está confirmada.
- Generación de contenido textual: puede emplearse para redactar artículos, resúmenes o respuestas automáticas en aplicaciones de productividad, aprovechando su capacidad de seguir instrucciones.
- Prototipado de aplicaciones NLP: dado su tamaño moderado (7,6B parámetros), es adecuado para experimentar con fine-tuning adicional o para integrarse en pipelines de procesamiento de lenguaje natural en entornos de investigación.
- Evaluación de técnicas de SFT: al ser un modelo de fine-tuning con documentación limitada, puede servir como caso de estudio para comparar metodologías de entrenamiento supervisado sobre la familia Qwen2.5.
- Generación de código: el modelo base Qwen2.5-7B-Instruct tiene capacidades de generación de código, por lo que este fine-tune podría utilizarse en asistentes de programación, aunque no hay evidencia específica de su rendimiento en esta tarea.
- Análisis de sentimiento y clasificación de texto: mediante prompts adecuados, puede adaptarse a tareas de clasificación, aunque no se han publicado evaluaciones al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con precisión FP16, el modelo requiere aproximadamente 15 GB de VRAM (7,6B parámetros × 2 bytes). Con cuantización int8, se reduce a ~8 GB; con int4, ~4-5 GB.
- GPU recomendadas: para FP16, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40GB, H100). Para cuantización int4, puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- Compatibilidad con GPU de consumo: sí, con cuantización int4 o int8 es posible ejecutarlo en GPUs de gama media-alta.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), siempre que se conviertan los pesos al formato adecuado (GGUF para llama.cpp/Ollama).
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia, un modelo de 7B en FP16 en una A100 suele generar entre 20-40 tokens/segundo, pero esto depende de la implementación y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo base Qwen2.5-7B-Instruct es el punto de referencia natural, pero no se han publicado métricas comparativas para este fine-tune. Alternativas como Llama 3.1 8B o Mistral 7B podrían ser comparables en tamaño, pero sin datos de rendimiento no es posible establecer una comparación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo base entrenado con datos web, puede heredar sesgos sociales, culturales y de género presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, no se ha confirmado que este fine-tune mantenga esa longitud de contexto; el nombre "2kbalanced" sugiere que el entrenamiento pudo haber utilizado secuencias cortas, lo que podría degradar el rendimiento en contextos largos.
- Restricciones de licencia: la licencia no está especificada en la model card, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- Documentación insuficiente: no se proporcionan detalles sobre el dataset de entrenamiento, el proceso de evaluación ni los objetivos del fine-tuning, lo que dificulta su adopción en entornos críticos.
- Riesgo de sobreajuste: al ser un fine-tune con un dataset aparentemente pequeño (2000 ejemplos), existe riesgo de sobreajuste a los datos de entrenamiento, lo que podría reducir su generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wls04/Qwen2.5-7B-AcaciaWL-Add
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Página de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:7b
- Repositorio GitHub de Qwen2.5 (no oficial): https://github.com/mx4ai/qwen2.5
