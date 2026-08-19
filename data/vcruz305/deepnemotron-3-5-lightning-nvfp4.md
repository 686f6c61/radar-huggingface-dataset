# vcruz305/DeepNemotron-3.5-Lightning-NVFP4

## Resumen

DeepNemotron-3.5-Lightning-NVFP4 es una cuantización NVFP4 (ModelOpt de NVIDIA) del modelo `vcruz305/DeepNemotron-3.5-Lightning`, un adapter LoRA fusionado sobre el modelo base Nemotron 3.5 Lightning 30B-A3B de NVIDIA. El autor, vcruz305, ha publicado esta versión cuantizada para facilitar el despliegue eficiente en GPUs Blackwell o Hopper, manteniendo las capacidades agénticas del modelo original.

El modelo base utiliza una arquitectura híbrida LatentMixture-of-Experts (LatentMoE) que intercala capas Mamba-2, capas MoE y capas de atención selectivas, con 30 mil millones de parámetros totales y solo 3 mil millones activos por token. Esto lo hace especialmente adecuado para agentes autónomos de larga duración, sub-agentes e inferencia local, donde la eficiencia computacional es crítica. La cuantización NVFP4 reduce aún más el footprint de memoria, permitiendo ejecutar el modelo en hardware más modesto sin sacrificar demasiada calidad.

La relevancia de esta ficha radica en que ofrece una opción de despliegue práctico para desarrolladores que necesitan un modelo de razonamiento y tool calling eficiente, con licencia OpenMDW de NVIDIA y entrenado sobre un corpus agéntico verificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE híbrida (Mamba-2 + MoE + capas de atención selectivas) |
| Parametros totales | 30B (30 mil millones) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, ModelOpt) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-openmdw-and-dataset-other (OpenMDW 1.1) |
| Formato de pesos | no disponible (se sirve con vLLM/SGLang/TensorRT-LLM, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización NVFP4 post-fusión de un adapter LoRA entrenado sobre Nemotron 3.5 Lightning 30B-A3B. La arquitectura subyacente es híbrida LatentMoE: combina capas Mamba-2 (modelos de espacio de estado), capas de mezcla de expertos (MoE) y capas de atención selectivas. Esta combinación permite activar solo 3B de los 30B parámetros por token, reduciendo el coste computacional por paso sin renunciar a la capacidad de razonamiento.

El entrenamiento del adapter se realizó con LoRA Q4' (cuantización de 4 bits) con r=16 y α=32, aplicado a las proyecciones q/k/v/o de atención, a `in_proj` de Mamba y a las lineales de expertos compartidos. Se usó el dataset `r0b0tlab/deepseek-v4-pro-0813-agentic` en su configuración `sft_openai`, con 19,072 filas de entrenamiento y una longitud máxima de secuencia de 512 tokens. El corpus, generado con DeepSeek-V4-Pro 0813, es de tipo agéntico verificable: cada fila pasa un verificador determinista antes de ser admitida, cubriendo 13 familias de tareas como adherencia a esquemas de herramientas, ejecución en sandbox, salidas estructuradas, estado multi-turno, planificación, citación de contexto largo, delegación y código con tests ocultos. El entrenamiento se ejecutó en una GPU A100-80 con Unsloth, alcanzando una pérdida de entrenamiento de 0.151. La cuantización NVFP4 se aplicó después de fusionar el adapter, mediante ModelOpt de NVIDIA.

## Capacidades

- Generación de texto y razonamiento multi-paso gracias a la arquitectura LatentMoE y al entrenamiento sobre tareas de planificación y verificación.
- Tool calling y function calling: el corpus de entrenamiento incluye adherencia a esquemas de herramientas con ejecución en sandbox, lo que habilita al modelo para invocar APIs y funciones externas de forma fiable.
- Soporte de agentes y sub-agentes: diseñado para tareas de delegación, memoria comprimida y estado multi-turno, ideal para flujos agénticos persistentes.
- Salidas estructuradas: entrenado para producir JSON y otros formatos estructurados siguiendo restricciones.
- Razonamiento matemático y científico: el dataset incluye recomputación de problemas de matemáticas y ciencias.
- Capacidad multilingüe limitada: aunque el modelo está etiquetado solo en inglés, el corpus incluye turnos multilingües, aunque no se especifica qué idiomas.
- Código con verificación: entrenado para generar código que pasa tests ocultos, útil en entornos de desarrollo asistido.
- Citación de contexto largo: puede referenciar y citar información dentro de contextos extensos.

## Casos de uso

- Agentes autónomos de atención al cliente: el modelo puede gestionar conversaciones multi-turno con estado persistente, siguiendo esquemas de herramientas para consultar bases de datos o sistemas de ticketing. Su arquitectura eficiente (3B activos) permite ejecutarlo de forma continua en servidores de gama media.
- Generación de código con verificación automática: gracias al entrenamiento con tests ocultos y ejecución en sandbox, puede integrarse en pipelines de CI/CD para generar fragmentos de código que se validan automáticamente antes de fusionarse.
- Sub-agentes especializados en arquitecturas multi-agente: su bajo coste por token lo hace adecuado para tareas de ejecución rápida (extraer datos, formatear respuestas) mientras un modelo más grande se encarga de la planificación compleja.
- Asistente de programación con tool calling: puede conectarse a APIs de repositorios, ejecutar comandos en sandbox y devolver resultados estructurados, integrándose en IDEs o entornos de línea de comandos.
- Procesamiento de documentos con citación: el modelo puede resumir o responder preguntas sobre documentos largos citando las fuentes relevantes, útil en entornos legales o de investigación.
- Automatización de flujos de datos estructurados: puede transformar entradas no estructuradas en JSON siguiendo esquemas definidos, por ejemplo para pipelines de ETL o integración de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K para esta versión cuantizada. Se recomienda consultar la ficha del modelo base `vcruz305/DeepNemotron-3.5-Lightning` o la documentación de NVIDIA para obtener datos de rendimiento del Nemotron 3.5 Lightning original.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización NVFP4 de 4 bits, los pesos del modelo ocupan aproximadamente 15 GB (30B × 4 bits / 8). Con overhead de activaciones, KV cache y buffers, se estima un consumo total de 18-20 GB para inferencia en secuencias cortas. Para contextos largos, la VRAM aumentará según la longitud.
- GPUs recomendadas: la model card indica soporte para Blackwell o Hopper. En la práctica, NVFP4 está optimizado para Blackwell (B200, B100, RTX 50 series), pero también puede ejecutarse en Hopper (H100) con soporte de ModelOpt. GPUs consumer como RTX 4090 (24 GB) o RTX 5090 (32 GB) podrían ser suficientes si el contexto es moderado.
- Opciones de despliegue: vLLM, SGLang y TensorRT-LLM son los servidores recomendados. También podría usarse llama.cpp si se convierte a GGUF, aunque esta versión no lo incluye (existe un GGUF separado del adapter).
- Latencia y throughput: no se proporcionan datos medidos. Como referencia, un modelo MoE con 3B activos suele alcanzar decenas de tokens por segundo en GPUs modernas, pero depende de la implementación y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| DeepNemotron-3.5-Lightning-NVFP4 (este) | 30B | 3B | no disponible | NVFP4 | OpenMDW + dataset other |
| DeepNemotron-3.5-Lightning (adapter base) | 30B | 3B | no disponible | FP16/BF16 (LoRA fusionado) | OpenMDW + dataset other |
| DeepNemotron-3.5-Lightning-GGUF | 30B | 3B | no disponible | GGUF (varias) | OpenMDW + dataset other |
| Nemotron 3.5 Lightning (original NVIDIA) | 30B | 3B | no disponible | FP8/BF16 | OpenMDW |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para comparar con otros modelos MoE de tamaño similar como DeepSeek-V3 o Qwen2.5-MoE. La principal diferencia entre las variantes es el formato de pesos y la facilidad de despliegue: NVFP4 está pensado para entornos con soporte de ModelOpt, mientras que el GGUF es más portable.

## Limitaciones y advertencias

- Sesgos y alucinación: al ser un modelo entrenado sobre un corpus generado por DeepSeek-V4-Pro, puede heredar sesgos de ese modelo y presentar alucinaciones en tareas fuera de su dominio de entrenamiento. No hay evaluación pública de sesgos para esta variante.
- Idioma limitado: el modelo está etiquetado solo en inglés. Aunque el dataset incluye turnos multilingües, no se garantiza calidad en otros idiomas.
- Contexto no especificado: se desconoce la longitud máxima de contexto soportada. El entrenamiento usó secuencias de 512 tokens, lo que sugiere que el modelo puede no rendir bien con contextos muy largos.
- Licencia restrictiva: la licencia OpenMDW de NVIDIA y la licencia "other" del dataset (asociada a la API de DeepSeek) pueden imponer restricciones al uso comercial. Es imprescindible revisar los términos completos antes de usar el modelo en producción.
- Dependencia de hardware específico: NVFP4 requiere soporte de ModelOpt y GPUs Blackwell o Hopper. En otro hardware, la cuantización puede no funcionar o degradar el rendimiento.
- Riesgo en producción: al ser un modelo cuantizado post-entrenamiento, puede haber pérdida de precisión en tareas de razonamiento complejo. Se recomienda validar en el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-NVFP4
- Adapter base (modelo sin cuantizar): https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning
- Versión GGUF del adapter: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/deepseek-v4-pro-0813-agentic
- Documentación de NVIDIA sobre Nemotron 3.5 Lightning: https://docs.nvidia.com/nim/large-language-models/latest/get-started/advanced/get-started-nemotron-3.5-lightning.html
- Página de NVIDIA sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
