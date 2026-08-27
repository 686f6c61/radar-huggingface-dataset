# tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-SpectralSurgery-HNS4p1-OD

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) derivado del modelo `meta-llama/Llama-3.1-8B-Instruct`, entrenado sobre el conjunto de datos MetaMathQA (50 000 muestras) y posteriormente refinado mediante la técnica de Spectral Surgery (HNS). El objetivo es mejorar el rendimiento en tareas de razonamiento matemático, concretamente en el benchmark GSM8K, donde el adaptador alcanza un 78,17 % de precisión, superando al checkpoint LoRA original (77,18 %) y al modelo base sin adaptar (65,20 %).

La relevancia de este modelo radica en que demuestra cómo una intervención post-entrenamiento (Spectral Surgery) puede mejorar la precisión en matemáticas sin necesidad de reentrenar el modelo completo. El adaptador es ligero (0,2 GB) y se puede cargar sobre el modelo base de 8 000 millones de parámetros, lo que lo hace accesible para entornos con recursos limitados. Está pensado para desarrolladores e investigadores interesados en optimizar modelos de lenguaje para dominios específicos mediante técnicas de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B-Instruct (transformer con Grouped-Query Attention) |
| Parametros totales | No disponible (el adaptador tiene rango 16; el modelo base tiene 8 000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones comunes como 4-bit y 8-bit) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero el adaptador no especifica idiomas) |
| Licencia | No disponible (el modelo base usa la licencia comunitaria de Llama 3.1, pero el adaptador no declara una) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama-3.1-8B-Instruct, un modelo transformer autoregresivo con Grouped-Query Attention (GQA) y 8 000 millones de parámetros, entrenado originalmente con aproximadamente 15 billones de tokens. El adaptador LoRA se entrena con rango 16 sobre el conjunto MetaMathQA (50 000 muestras), que consiste en problemas matemáticos reformulados con razonamiento paso a paso.

Posteriormente se aplica Spectral Surgery (HNS), una técnica de post-entrenamiento que modifica los pesos del adaptador mediante pasos de normalización espectral. En esta configuración concreta se usan 4 pasos rápidos y 1 paso estable, aplicados únicamente a los módulos `o_proj` y `down_proj` de la arquitectura. Esta intervención mejora la precisión en GSM8K en 0,99 puntos porcentuales respecto al LoRA vanilla, sin aumentar el número de parámetros.

## Capacidades

- Razonamiento matemático: el adaptador está especializado en problemas aritméticos y de álgebra, con mejoras demostradas en GSM8K.
- Generación de texto: al estar basado en Llama-3.1-8B-Instruct, hereda las capacidades de generación de texto, diálogo y comprensión del lenguaje del modelo base.
- Razonamiento multi-paso: el entrenamiento con MetaMathQA fomenta la generación de cadenas de razonamiento explícitas.
- Multilingüismo: el modelo base soporta varios idiomas, aunque el adaptador no declara restricciones específicas.
- Tool calling y funciones: el modelo base soporta tool calling y function calling, y el adaptador no elimina estas capacidades, aunque no se han evaluado específicamente.
- No se han documentado capacidades especiales adicionales (visión, audio, etc.) en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el adaptador puede integrarse en asistentes de tutoría que guíen a estudiantes paso a paso, aprovechando su precisión en GSM8K para problemas de nivel escolar.
- Generación de soluciones explicadas para libros de texto: se puede usar para crear respuestas detalladas a ejercicios de matemáticas, con razonamiento explícito.
- Evaluación de modelos de razonamiento: sirve como punto de referencia para comparar técnicas de post-entrenamiento como Spectral Surgery frente a LoRA estándar.
- Automatización de tareas de cálculo en aplicaciones de productividad: por ejemplo, un plugin que resuelva operaciones aritméticas complejas dentro de un procesador de texto.
- Investigación en eficiencia de adaptación: el adaptador es un caso de estudio para medir el impacto de intervenciones de bajo coste sobre modelos base de 8B.
- Integración en pipelines de generación de código con razonamiento matemático: aunque no está específicamente entrenado para código, puede complementar modelos de programación en tareas que requieran cálculo.

## Benchmarks y rendimiento

La model card del autor proporciona resultados en GSM8K para varias configuraciones. El adaptador de este repositorio corresponde a la fila "HNS 4+1, o_proj + down_proj".

| Modelo | GSM8K (accuracy) |
|---|---:|
| Base (Llama-3.1-8B-Instruct) | 65,20 % (860/1319) |
| LoRA vanilla (MetaMathQA-50K) | 77,18 % (1018/1319) |
| HNS 8+2, o_proj + down_proj | 78,39 % (1034/1319) |
| HNS 8+2, all modules | 79,38 % (1047/1319) |
| **HNS 4+1, o_proj + down_proj (este modelo)** | **78,17 % (1031/1319)** |
| HNS 4+1, all modules | 79,38 % (1047/1319) |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base Llama-3.1-8B-Instruct.
- En FP16, el modelo base necesita aproximadamente 16 GB de VRAM. Con cuantización 4-bit (por ejemplo, GPTQ o AWQ) puede caber en GPUs con 8 GB de VRAM, como una RTX 3060 o RTX 4060.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para FP16, o GPUs con al menos 8 GB para cuantización 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con la librería PEFT de Hugging Face.
- Latencia y throughput: no se han publicado mediciones específicas para este adaptador. En general, un modelo de 8B en una GPU moderna (A100 o RTX 4090) puede generar entre 50 y 100 tokens por segundo en FP16, y algo menos en cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | 65,20 % | Llama 3.1 Community |
| LoRA vanilla (MetaMathQA-50K) | 8B + adaptador | 128k | 77,18 % | No especificada |
| **Este adaptador (HNS 4+1)** | 8B + adaptador | 128k | 78,17 % | No especificada |
| HNS 4+1, all modules | 8B + adaptador | 128k | 79,38 % | No especificada |

La comparativa se limita a las variantes del mismo experimento, ya que no se dispone de datos de otros modelos de la misma categoría (por ejemplo, Mistral-7B o Gemma-7B) en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está especializado en matemáticas y puede no generalizar bien a otras tareas fuera de ese dominio.
- No se ha evaluado su comportamiento en contextos largos ni en tareas de generación creativa; el rendimiento en esos escenarios es desconocido.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor o verificar la licencia del modelo base.
- El adaptador se distribuye como PEFT, por lo que requiere el modelo base para funcionar; no es un modelo autónomo.
- No se han documentado sesgos específicos, pero al derivar de Llama-3.1-8B-Instruct, puede heredar sesgos presentes en el modelo base.
- Riesgo de alucinación en problemas matemáticos complejos o ambiguos, aunque la precisión en GSM8K es alta, no es perfecta.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-SpectralSurgery-HNS4p1-OD
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Model card del modelo base (README): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/README.md
- Información adicional sobre Llama-3.1-8B-Instruct: https://www.aimodels.fyi/models/huggingFace/llama-3.1-8b-instruct-meta-llama
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/llama-3_1-8b-instruct/modelcard
