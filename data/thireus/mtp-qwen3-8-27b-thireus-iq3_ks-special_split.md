# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ3_KS-SPECIAL_SPLIT

## Resumen

Este repositorio contiene una cuantización GGUF del modelo Qwen3.8-27B, realizada por el usuario Thireus bajo la denominación `mtp-Qwen3.8-27B-THIREUS-IQ3_KS-SPECIAL_SPLIT`. El modelo base, desarrollado por Alibaba, es un transformer denso de 27 000 millones de parámetros con capacidades multimodales (visión y texto), optimizado para tareas de programación, flujos agénticos y automatización de oficina. La cuantización IQ3_KS reduce el tamaño de los pesos a aproximadamente 3 bits por parámetro, lo que permite ejecutar el modelo en hardware de consumo con requisitos de VRAM más modestos que la versión original en BF16.

La relevancia de esta ficha radica en que ofrece una alternativa de bajo coste para desplegar un modelo de 27B en entornos locales, aunque la información pública sobre esta cuantización concreta es muy limitada: la model card solo declara la licencia MIT y no se proporcionan detalles sobre el proceso de cuantización, métricas de calidad ni instrucciones de uso. El nombre sugiere un "split especial" de los pesos, posiblemente diseñado para optimizar la carga en memoria o la velocidad de inferencia, pero no hay documentación que lo confirme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (modelo base) |
| Tipos de cuantizacion | IQ3_KS (3 bits, kernel especial) |
| Idiomas soportados | No disponible (modelo base multilingue, sin detalle) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con un codificador de visión integrado, lo que le permite procesar tanto texto como imágenes. Según la información publicada por Alibaba, el modelo fue entrenado con un enfoque en tareas de codificación, flujos agénticos y automatización de oficina, con una ventana de contexto nativa de 262 144 tokens. No se dispone de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información proporcionada.

La versión cuantizada aquí presentada utiliza el esquema IQ3_KS, un formato de cuantización de 3 bits con kernel especializado, diseñado para maximizar la eficiencia de memoria y velocidad en hardware compatible con GGUF. El sufijo "SPECIAL_SPLIT" sugiere una partición particular de los pesos, pero no se documenta su propósito exacto. No hay información sobre el proceso de calibración de la cuantización ni sobre las métricas de perplexidad o degradación de calidad respecto al modelo original.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de mantener conversaciones complejas y resolver tareas de razonamiento lógico.
- Programación: soporta generación de código, depuración y explicación de fragmentos en múltiples lenguajes.
- Visión: al ser multimodal, puede procesar imágenes y responder preguntas sobre su contenido (capacidad heredada del modelo base).
- Agentes y tool calling: el modelo base está optimizado para flujos agénticos, incluyendo llamadas a funciones y planificación multi-paso.
- Multilingüe: el modelo base soporta múltiples idiomas, aunque no se especifica la lista exacta.
- Contexto largo: con 262K tokens de ventana, puede manejar documentos extensos y conversaciones de larga duración.

Nota: estas capacidades corresponden al modelo base Qwen3.8-27B. La cuantización IQ3_KS puede degradar ligeramente el rendimiento en tareas complejas, pero no se dispone de evaluaciones específicas para esta versión.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar este modelo en una estación de trabajo con una GPU de gama media (por ejemplo, RTX 3090 o 4090) para obtener sugerencias de código, refactorización y explicaciones de errores sin depender de servicios en la nube. La cuantización de 3 bits reduce la huella de memoria, permitiendo cargar el modelo completo en VRAM.
- Automatización de oficina: el modelo puede procesar documentos largos (informes, contratos) y extraer información relevante gracias a su contexto de 262K tokens, aunque la calidad de la extracción puede verse afectada por la cuantización.
- Chatbot de atención al cliente: con tool calling, puede gestionar consultas multi-turno y derivar a sistemas externos (bases de datos, APIs) para resolver incidencias, siempre que se acepte una ligera pérdida de precisión frente al modelo original.
- Análisis de imágenes y texto: al ser multimodal, puede describir imágenes, extraer texto de capturas y responder preguntas visuales, útil en entornos de documentación técnica.
- Prototipado de agentes autónomos: investigadores pueden probar flujos agénticos con presupuesto limitado de hardware, usando esta cuantización para validar arquitecturas antes de escalar a modelos más grandes.
- Educación y formación: estudiantes de IA pueden experimentar con un modelo de 27B en hardware doméstico, comprendiendo las limitaciones de la cuantización y su impacto en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de perplexidad, exactitud en tareas estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otras cuantizaciones. El autor menciona en otros repositorios (como el de Qwen3.5-27B) que su herramienta calcula curvas de perplexidad por bit, pero no hay datos específicos para este modelo.

## Requisitos de hardware

- VRAM estimada: un modelo de 27B en IQ3_KS (3 bits) ocupa aproximadamente 10-11 GB de memoria, más overhead de contexto. Con 262K tokens de contexto, la memoria adicional puede superar los 8 GB, por lo que se recomienda al menos 20 GB de VRAM para uso completo.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40 GB) o superiores. En GPUs con menos de 16 GB, se puede usar offloading parcial a CPU, pero con mayor latencia.
- Compatibilidad con consumer GPU: sí, es posible ejecutarlo en GPUs de 24 GB, aunque el contexto largo puede requerir gestión de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF) y TGI (con adaptadores). El formato GGUF es ampliamente compatible.
- Latencia y throughput: no disponibles. Dependen del hardware y de la implementación. En una RTX 4090, se espera una velocidad de generación de 20-40 tokens/s, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | BF16 | Apache 2.0 | Hugging Face |
| mtp-Qwen3.8-27B-THIREUS-IQ3_KS (este) | 27B | 262K (base) | IQ3_KS | MIT | Hugging Face |
| Qwen3.5-27B-THIREUS-IQ3_KS | 27B | no disponible | IQ3_KS | MIT | Hugging Face |

No se dispone de comparativas de rendimiento entre estas versiones. La principal diferencia es el tipo de cuantización y la licencia (MIT frente a Apache 2.0). El modelo original ofrece mayor fidelidad, mientras que la cuantización reduce los requisitos de hardware a costa de posible degradación.

## Limitaciones y advertencias

- La cuantización de 3 bits puede provocar una pérdida notable de calidad en tareas de razonamiento complejo, matemáticas o generación de código largo. No se han publicado evaluaciones que cuantifiquen esta degradación.
- El modelo base puede presentar sesgos presentes en sus datos de entrenamiento; la cuantización no los corrige.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en contextos largos.
- La licencia MIT permite uso comercial, pero se debe verificar que el modelo base (Apache 2.0) no imponga restricciones adicionales. En este caso, ambas son permisivas.
- No hay documentación sobre el proceso de cuantización, por lo que no se puede garantizar la reproducibilidad ni la calidad del resultado.
- El contexto de 262K tokens es teórico; en la práctica, la memoria necesaria para mantener ese contexto puede exceder la VRAM disponible en GPUs de consumo, obligando a reducir la ventana efectiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ3_KS-SPECIAL_SPLIT
- Repositorio del modelo base (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Artículo sobre especificaciones y requisitos: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
- Repositorio relacionado (BF16): https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT
