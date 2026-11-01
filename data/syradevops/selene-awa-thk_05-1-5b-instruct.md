# Syradevops/Selene-Awa-THk_05-1.5B-Instruct

## Resumen

Selene-Awa-THk_05-1.5B-Instruct es un modelo de lenguaje conversacional de tamaño reducido desarrollado por Syradevops, publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un fine-tuning del modelo unsloth/Qwen3-1.7B-unsloth-bnb-4bit, es decir, una versión cuantizada a 4 bits (bnb) de la familia Qwen3 de Alibaba, entrenada con la biblioteca Unsloth y TRL de HuggingFace. Según la model card, el entrenamiento se realizó "2x más rápido" gracias a Unsloth, aunque no se detallan los datos ni el método de ajuste empleados.

El modelo resuelve la necesidad de disponer de un asistente conversacional ligero que pueda ejecutarse en hardware modesto, como GPUs de consumo o incluso portátiles, sin sacrificar por completo las capacidades de la familia Qwen3. Con aproximadamente 1.720 millones de parámetros (dato real extraído de los safetensors) y un tamaño de repositorio de apenas 3,5 GB, es adecuado para despliegues locales, prototipado y casos de uso con restricciones de recursos.

Su relevancia actual radica en la tendencia hacia modelos pequeños y eficientes: los fine-tunes comunitarios de Qwen3 mediante Unsloth permiten adaptar modelos base de forma rápida y económica, y este modelo es un ejemplo de esa práctica. No obstante, al carecer de documentación detallada, benchmarks publicados y trazabilidad del dataset de entrenamiento, debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3), fine-tuning instructivo |
| Parametros totales | 1.720.574.976 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | no disponible (la familia Qwen3 1.7B base suele ofrecer 32.768 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | 4 bits (bitsandbytes, en el modelo base de Unsloth); pesos del repositorio en formato estándar sin cuantización adicional declarada |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con endpoints, "endpoints_compatible") |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3-1.7B-unsloth-bnb-4bit, una versión cuantizada a 4 bits mediante bitsandbytes del Qwen3-1.7B original de Alibaba. Qwen3 es una familia de modelos basada en arquitectura transformer decoder denso (no MoE), con soporte conversacional e instructivo. El fine-tuning se realizó con la biblioteca TRL de HuggingFace y el framework Unsloth, que optimiza el entrenamiento mediante kernel fusionado y gestión eficiente de memoria, permitiendo según el autor un entrenamiento "2x más rápido".

No se ha publicado información sobre el dataset de entrenamiento (número de ejemplos, composición, dominios), ni sobre el método de alineación empleado (SFT puro, DPO, RLHF), ni sobre el número de épocas o hiperparámetros. Esta falta de trazabilidad es un punto importante a considerar: el modelo hereda las capacidades y sesgos de Qwen3-1.7B más lo aprendido en un ajuste no documentado.

## Capacidades

- Generación de texto conversacional en inglés (pipeline text-generation, tag "conversational").
- Herencia de las capacidades base de Qwen3-1.7B: razonamiento general, generación de código y matemáticas a nivel de modelo pequeño (no verificado para este fine-tune en concreto).
- Compatibilidad con la biblioteca transformers de HuggingFace y con text-generation-inference.
- Posible compatibilidad con tool calling si el fine-tune conservó las plantillas de chat de Qwen3 (no documentado por el autor).
- Sin capacidades multimodales: es un modelo de texto puro.
- Sin modo de pensamiento extendido (thinking mode) documentado para este fine-tune.

## Casos de uso

- Chatbots ligeros en inglés: su tamaño reducido (3,5 GB en disco) permite desplegar asistentes conversacionales multi-turno en GPUs de consumo o en CPU con cuantización, ideal para prototipos internos.
- Desarrollo y pruebas locales: los desarrolladores pueden integrarlo en entornos de IDE o scripts de automatización sin depender de APIs externas, gracias a su compatibilidad con transformers y Ollama/llama.cpp (tras conversión a GGUF).
- Generación de borradores de texto: redacción de correos, resúmenes y reformulaciones en inglés, tareas donde los modelos de 1-2B rinden de forma aceptable.
- Aprendizaje y experimentación: al ser un fine-tune comunitario con licencia permisiva, es útil como punto de partida para estudiar pipelines de fine-tuning con Unsloth y TRL.
- Integración en dispositivos con recursos limitados: edge computing y servidores pequeños donde no cabe un modelo de 7B o superior.
- Clasificación y extracción estructurada de texto en inglés: tareas de NLP acotadas (etiquetado, extracción de campos) donde la precisión extrema no es crítica y el coste de inferencia importa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparativas con el modelo base. Para estimar el rendimiento habría que acudir a los datos publicados de Qwen3-1.7B, aunque el fine-tune puede haber modificado el comportamiento original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB en FP16 (según el tamaño del repositorio de 3,5 GB); significativamente menos si se aplica cuantización a 4 bits (en torno a 1-1,5 GB).
- GPUs recomendadas: cualquier GPU moderna con 4-6 GB de VRAM es suficiente; por ejemplo, RTX 3060, RTX 4060 o RTX 4090 con holgura. No se requiere A100 ni H100 para inferencia.
- Cabe cómodamente en GPUs de consumo: sí, incluso en portátiles con GPU dedicada de gama media; también es viable en CPU mediante cuantización GGUF.
- Opciones de despliegue: transformers de HuggingFace (formato nativo), text-generation-inference (tag declarado), Ollama y llama.cpp (requieren conversión a GGUF, no incluida en el repositorio), vLLM (compatible con arquitectura Qwen3).
- Latencia y throughput: no disponibles; al ser un modelo de 1,7B, se espera latencia baja y throughput alto en comparación con modelos de 7B o más, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Selene-Awa-THk_05-1.5B-Instruct | 1,72B | no disponible | Apache 2.0 | Fine-tune comunitario de Qwen3-1.7B, sin benchmarks publicados |
| Qwen3-1.7B (base, Alibaba) | 1,7B | 32.768 tokens (según ficha oficial) | Apache 2.0 | Modelo original, documentación y benchmarks completos |
| Llama 3.2 1B Instruct (Meta) | 1,24B | 128.000 tokens | Licencia Llama 3.2 | Alternativa consolidada con amplio ecosistema |
| Phi-3.5-mini (Microsoft) | 3,8B | 128.000 tokens | MIT | Mayor tamaño pero rendimiento superior en benchmarks publicados |

El modelo de Syradevops se sitúa en la gama de modelos pequeños conversacionales; frente a las alternativas oficiales, su ventaja es la ligereza y la licencia permisiva, pero carece de la documentación, evaluaciones y soporte de los modelos de Meta, Microsoft o Alibaba.

## Limitaciones y advertencias

- Sesgos: hereda los sesgos del modelo base Qwen3-1.7B y añade los que pudiera introducir el dataset de fine-tuning, que no está documentado ni disponible públicamente.
- Alucinaciones: como todo modelo pequeño de lenguaje, es propenso a generar información falsa con apariencia de certeza; no hay evaluaciones de veracidad publicadas.
- Idioma: declarado solo para inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Contexto: la longitud de contexto no está documentada en la model card; debe verificarse empíricamente antes de depender de ventanas largas.
- Trazabilidad: no se conocen los datos de entrenamiento, el método de alineación ni los hiperparámetros, lo que dificulta auditorías y uso regulado.
- Rendimiento: ausencia total de benchmarks; no es posible comparar objetivamente con el modelo base ni con alternativas sin evaluación propia.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos de la familia Qwen3 subyacente si se redistribuyen derivados.
- Producción: dada la falta de documentación y mantenimiento aparente (0 likes, 422 descargas en el momento de la ficha), se recomienda uso experimental y validación exhaustiva antes de cualquier despliegue crítico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Syradevops/Selene-Awa-THk_05-1.5B-Instruct
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
