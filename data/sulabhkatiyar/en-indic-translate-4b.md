# sulabhkatiyar/en-indic-translate-4b

## Resumen

El modelo `sulabhkatiyar/en-indic-translate-4b` es un sistema de traducción automática de inglés a 11 idiomas índicos (asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, panyabí, tamil y telugu). Desarrollado por Sulabh Katiyar, se trata de un fine-tuning del modelo base `google/gemma-4-E4B-it` de Google, orientado específicamente a la traducción de contenido técnico y científico. Su característica más destacada es la preservación de fórmulas LaTeX, bloques de código y la estructura general del documento durante la traducción, lo que lo hace especialmente útil para documentación de software, papers académicos y manuales técnicos.

El modelo tiene 7.941.100.832 parámetros totales (según los pesos safetensors), lo que sugiere una arquitectura de mezcla de expertos (MoE) con 4 mil millones de parámetros activos, aunque esta información no está confirmada en la documentación proporcionada. Está diseñado para generación de texto y es compatible con el ecosistema HuggingFace Transformers y vLLM. Su licencia es la de Gemma, que permite uso comercial con ciertas restricciones. Aunque el repositorio no muestra descargas ni likes, el modelo está disponible públicamente y su fecha de creación es septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Google Gemma 4, variante E4B) |
| Parametros totales | 7.941.100.832 |
| Parametros activos | No disponible (posiblemente 4B, según el nombre E4B) |
| Longitud de contexto | 32.768 tokens (según ejemplo de vLLM con `max_model_len=32768`) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantizacion posible con herramientas externas) |
| Idiomas soportados | en, as, bn, gu, hi, kn, ml, mr, or, pa, ta, te |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo `google/gemma-4-E4B-it`, que pertenece a la familia Gemma 4 de Google. Aunque no se especifican los detalles arquitectónicos exactos, el nombre "E4B" sugiere una variante con 4 mil millones de parámetros activos, probablemente dentro de una arquitectura de mezcla de expertos (MoE) que alcanza los 7.94B parámetros totales. El entrenamiento se realizó mediante fine-tuning supervisado para la tarea de traducción inglés-índico, con un énfasis particular en la preservación de elementos técnicos como fórmulas LaTeX, bloques de código y estructura de documentos. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El modelo fue desarrollado y probado en GPUs AMD MI300X con ROCm, lo que puede implicar ajustes necesarios para entornos NVIDIA CUDA.

## Capacidades

- Traducción de inglés a 11 idiomas índicos: asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, panyabí, tamil y telugu.
- Preservación de fórmulas LaTeX, bloques de código y estructura de documentos durante la traducción.
- Generación de texto en formato conversacional (pipeline `text-generation`).
- Soporte de contexto largo (hasta 32K tokens según el ejemplo de vLLM).
- Compatible con el chat template de HuggingFace Transformers y con vLLM para inferencia eficiente.
- Capacidad de manejar documentos técnicos complejos con notación matemática y código fuente.

## Casos de uso

- **Localización de documentación técnica**: traducir manuales de API, guías de usuario y documentación de software al hindi, tamil o bengalí, manteniendo intactos los ejemplos de código y las fórmulas matemáticas.
- **Traducción de papers académicos**: convertir artículos científicos con ecuaciones LaTeX a idiomas índicos para facilitar su difusión en comunidades locales, sin perder la notación original.
- **Generación de contenido educativo**: crear materiales de aprendizaje en lenguas regionales a partir de contenido técnico en inglés, preservando diagramas y bloques de código.
- **Soporte al cliente multilingüe**: integrar el modelo en sistemas de atención al cliente para responder consultas técnicas en idiomas índicos, manteniendo la coherencia de los fragmentos de código.
- **Traducción de código comentado**: traducir comentarios y documentación dentro de repositorios de código abierto a idiomas índicos, facilitando la colaboración de desarrolladores locales.
- **Localización de plataformas de e-learning**: traducir cursos y tutoriales de programación o ciencia de datos a lenguas índicas, conservando los ejemplos ejecutables y las fórmulas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas de traducción como BLEU o chrF para este modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bfloat16 (16 GB), se necesitan al menos 16 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), el modelo podría ocupar alrededor de 4-5 GB, permitiendo su ejecución en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- **GPU recomendadas**: para una inferencia fluida sin cuantización, se recomienda una GPU con 24 GB o más (RTX 3090, RTX 4090, A100, H100). El modelo fue probado en AMD MI300X (192 GB) durante el desarrollo.
- **Opciones de despliegue**: compatible con HuggingFace Transformers, vLLM, y potencialmente con llama.cpp u Ollama mediante conversión a GGUF (no incluida en el repositorio).
- **Latencia y throughput**: no se proporcionan datos específicos. Con vLLM y una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, dependiendo del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de traducción índica como NLLB-200, IndicTrans2 o modelos multilingües como mT5. El modelo se distingue por su especialización en preservar LaTeX y código, pero no hay benchmarks públicos que permitan comparar su rendimiento con alternativas. Se recomienda evaluar el modelo en casos de uso específicos antes de adoptarlo en producción.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un fine-tuning de Gemma 4, puede heredar sesgos presentes en el modelo base, especialmente en contextos culturales o de género.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar traducciones incorrectas o inventar contenido, especialmente en idiomas con menos representación en el entrenamiento.
- **Limitaciones de idioma**: solo cubre 11 idiomas índicos; no soporta otros idiomas de la región como el cingalés o el nepalí.
- **Restricciones de licencia**: la licencia Gemma permite uso comercial, pero prohíbe ciertos usos (armas, vigilancia masiva, etc.). Es necesario revisar los términos completos en https://ai.google.dev/gemma/terms.
- **Compatibilidad de hardware**: el modelo fue desarrollado y probado en AMD MI300X con ROCm; en entornos NVIDIA CUDA puede requerir ajustes de versiones de paquetes (por ejemplo, transformers, vLLM).
- **Sin datos de rendimiento**: no hay benchmarks publicados, por lo que el rendimiento real en tareas de traducción es desconocido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sulabhkatiyar/en-indic-translate-4b)
- [Modelo base: google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [Términos de la licencia Gemma](https://ai.google.dev/gemma/terms)
