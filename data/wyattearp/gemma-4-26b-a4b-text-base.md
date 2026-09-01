# wyattearp/Gemma-4-26B-A4B-text-base

## Resumen

El modelo **Gemma-4-26B-A4B-text-base** es una extracción no oficial del modelo multimodal **Gemma-4-26B-A4B-it** de Google DeepMind, publicada por el usuario *wyattearp* en Hugging Face. Consiste en un backbone de lenguaje puro, al que se le han eliminado los encoders de visión y audio, así como las capas de atención cruzada multimodal, dejando únicamente los parámetros del modelo de lenguaje (`model.language_model.*`) que son idénticos bit a bit a la versión original. El resultado es un modelo de texto exclusivamente, pensado para tareas de generación, razonamiento, código y tool calling, sin la sobrecarga de los componentes multimodales.

Con una arquitectura Mixture-of-Experts (MoE) de aproximadamente 25 200 millones de parámetros totales y unos 4 000 millones activos por token, este checkpoint ofrece una ventana de contexto de 262 144 tokens (256K) y un vocabulario de 256 000 tokens. Su relevancia radica en la reducción de requisitos de memoria (elimina alrededor de 1,15 GB de parámetros no lingüísticos) y en la simplificación de la inferencia para despliegues dedicados a lenguaje, razonamiento y agentes, manteniendo la fidelidad de los pesos originales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 128 expertos, ~4B activos por token |
| Parametros totales | 25 233 141 790 (25,2B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | No disponible (repositorio en BF16, sin cuantizaciones publicadas) |
| Idiomas soportados | En (según Hugging Face; el modelo original de Google soporta más de 140 idiomas, pero esta extracción solo declara inglés) |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 128 expertos en las capas de feed-forward, de los cuales se activan aproximadamente 4 000 millones de parámetros por token. El checkpoint se deriva de **google/gemma-4-26B-A4B-it**, un modelo multimodal entrenado por Google DeepMind que combina visión, audio y texto. En esta extracción se han eliminado los componentes de visión y audio, así como las capas de atención cruzada multimodal, dejando únicamente el modelo de lenguaje causal (`Gemma4ForCausalLM`). Los parámetros del lenguaje son idénticos bit a bit a la versión original, lo que garantiza que el rendimiento en tareas de texto no se vea alterado.

No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. El modelo original es de Google DeepMind y se enmarca dentro de la familia Gemma 4, que incluye tanto arquitecturas densas como MoE en cinco tamaños (E2B, E4B, 12B, 26B A4B y 31B). Esta versión extraída no introduce ninguna innovación técnica adicional respecto al original, salvo la eliminación de módulos multimodales.

## Capacidades

- Generación de texto en inglés: producción de texto coherente y contextualmente relevante.
- Razonamiento multi-step: soporte para cadenas de razonamiento complejas gracias a la arquitectura MoE y al contexto largo.
- Generación de código: apto para tareas de programación, depuración y explicación de código.
- Tool calling / function calling: compatible con el parser `gemma4` en vLLM, lo que permite integrar llamadas a herramientas externas.
- Soporte para agentes: puede actuar como núcleo de sistemas agénticos que requieren múltiples pasos de razonamiento y uso de herramientas.
- Procesamiento de documentos largos: con 256K tokens de contexto, puede manejar libros completos, informes extensos o conversaciones muy largas.
- Capacidades multilingües: aunque la ficha de Hugging Face indica solo inglés, al ser una extracción del modelo original que soporta más de 140 idiomas, es probable que conserve cierta capacidad multilingüe, pero no está garantizada ni documentada en esta versión.

## Casos de uso

- **Asistentes de código con llamada a herramientas**: el modelo puede integrarse en entornos de desarrollo (IDEs, CLI) para sugerir código, refactorizar funciones o explicar fragmentos, utilizando tool calling para consultar APIs, bases de datos o repositorios.
- **Sistemas de razonamiento multi-paso**: ideal para pipelines de agentes que descomponen problemas complejos en subtareas, gracias a su capacidad de razonamiento y a la ventana de contexto de 256K tokens para mantener el estado de la conversación.
- **Procesamiento y análisis de documentos largos**: puede resumir, extraer información o responder preguntas sobre documentos extensos (manuales, contratos, artículos de investigación) sin necesidad de truncar el texto.
- **Chatbots conversacionales**: al mantener un contexto amplio, puede gestionar conversaciones de larga duración con usuarios, recordando detalles previos y manteniendo coherencia.
- **Generación de texto técnico**: redacción de documentación técnica, informes, artículos o contenido estructurado en inglés, con un nivel de detalle y precisión adecuado para entornos profesionales.
- **Despliegue en infraestructura de inferencia optimizada**: gracias a su compatibilidad con vLLM y a la eliminación de componentes multimodales, puede servir como backend de baja latencia para aplicaciones de texto, reduciendo la huella de memoria respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de esta extracción no proporciona métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) y no se han encontrado evaluaciones independientes de este checkpoint concreto. Se recomienda consultar los benchmarks del modelo original **google/gemma-4-26B-A4B-it** como referencia aproximada, teniendo en cuenta que la extracción no altera los pesos del lenguaje.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 25,2B parámetros en BF16, ocupa aproximadamente 50,5 GB en memoria (el tamaño del repositorio). Para inferencia con vLLM o transformers, se necesitan al menos 60 GB de VRAM para dejar margen para el contexto y los estados intermedios. Con cuantización a 8 bits se puede reducir a unos 26 GB, y a 4 bits a unos 14 GB, aunque no se ofrecen pesos cuantizados en este repositorio.
- **GPU recomendadas**: para ejecutar el modelo sin cuantizar, se requiere una GPU con al menos 80 GB de VRAM, como la NVIDIA A100 80GB, H100 80GB o A800. Con cuantización, una RTX 4090 (24 GB) podría ser suficiente para 4 bits, y una RTX 6000 Ada (48 GB) para 8 bits.
- **Compatibilidad con GPU consumer**: no es viable en GPU consumer sin cuantización, pero con cuantización 4 bits podría ejecutarse en una RTX 4090 o similar.
- **Opciones de despliegue**: compatible con vLLM (recomendado, con soporte para tool calling y reasoning parser), así como con el pipeline de `transformers` (>= 4.40.0). También se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- **Latencia y throughput**: no se dispone de datos concretos. Al ser un MoE con solo 4B activos por token, la latencia por token es considerablemente menor que la de un modelo denso de 25B, pero depende del hardware y de la implementación de vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-text-base (este) | 25,2B | ~4B | 256K | Gemma | safetensors BF16 |
| google/gemma-4-26B-A4B-it (original) | 25,2B | ~4B | 256K | Gemma | safetensors (multimodal) |
| Mixtral 8x7B (Mistral AI) | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-32B-A3B (Alibaba) | 32,8B | 3,3B | 128K | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en características técnicas, ya que no hay datos de rendimiento para esta extracción. El modelo original de Gemma 4 destaca por su contexto de 256K y su capacidad multimodal, mientras que esta extracción se centra en texto puro. Mixtral y Qwen2.5 son alternativas MoE con licencias más permisivas (Apache 2.0) y contextos más cortos, pero con ecosistemas de cuantización y despliegue más maduros.

## Limitaciones y advertencias

- **Extracción no oficial**: este checkpoint es una modificación creada por un tercero, no por Google. Aunque los pesos del lenguaje son idénticos al original, no hay garantía de soporte ni de mantenimiento.
- **Monolingüe declarado**: la ficha indica solo inglés, a pesar de que el modelo original soporta más de 140 idiomas. Es posible que el rendimiento en otros idiomas se vea degradado o no esté garantizado.
- **Sin benchmarks propios**: no hay evaluaciones de rendimiento publicadas para esta versión, por lo que no se puede verificar su calidad en tareas específicas.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- **Sesgos potenciales**: el modelo original puede heredar sesgos de sus datos de entrenamiento, que se mantienen en esta extracción.
- **Restricciones de licencia**: la licencia Gemma Terms of Use impone condiciones para uso comercial, incluyendo restricciones sobre el uso para ciertos fines y requisitos de atribución. Es necesario revisar los términos antes de implementarlo en producción.
- **Compatibilidad con vLLM**: se requiere una versión de vLLM >= 0.7.0 y un parser específico (`gemma4`) para tool calling, con un bugfix reciente (PR #54257). Sin el parser adecuado, el comportamiento de tool calling puede fallar.

## Enlaces

- [Repositorio Hugging Face del modelo](https://huggingface.co/wyattearp/Gemma-4-26B-A4B-text-base)
- [Modelo original en Hugging Face](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Modelo original (sin instrucciones) en Hugging Face](https://huggingface.co/google/gemma-4-26B-A4B)
- [Página oficial de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Model card oficial de Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Documentación de Gemma 4 en Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
- [Issue de vLLM sobre el parser de Gemma4](https://github.com/vllm-project/vllm/issues/54256)
- [Pull request de vLLM con el bugfix del parser](https://github.com/vllm-project/vllm/pull/54257)
