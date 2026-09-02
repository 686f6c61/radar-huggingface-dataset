# Toleng/koplak-flash-1.5b

## Resumen

koplak-flash-1.5b es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por Toleng, obtenido mediante fine-tuning del modelo base unsloth/DeepSeek-R1-Distill-Qwen-1.5B-bnb-4bit. Este modelo base es a su vez una destilación de DeepSeek-R1 sobre la arquitectura Qwen2, lo que le confiere capacidades de razonamiento y generación de texto en inglés. El fine-tuning se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tuning convencional.

El modelo está pensado para tareas de generación de texto conversacional y razonamiento, con un tamaño compacto que lo hace adecuado para despliegue en entornos con recursos limitados. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas. Aunque no se han publicado métricas de rendimiento específicas, su herencia de DeepSeek-R1-Distill-Qwen-1.5B sugiere un comportamiento competitivo en tareas de razonamiento y matemáticas para su escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2, probablemente 32.768 tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en bf16/fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. Al ser un fine-tuning de DeepSeek-R1-Distill-Qwen-1.5B, hereda la estructura de 24 capas, 14 cabezas de atención y dimensiones ocultas de 1536, con un total de aproximadamente 1.770 millones de parámetros. La destilación de DeepSeek-R1 implica que el modelo ha sido entrenado para generar cadenas de razonamiento antes de dar la respuesta final, siguiendo el paradigma de "thinking mode".

El proceso de fine-tuning se realizó con Unsloth, una librería que optimiza el entrenamiento mediante kernels de atención y operaciones de memoria eficientes, y con TRL (Transformer Reinforcement Learning) de Hugging Face. No se especifica el dataset utilizado ni el número de pasos de entrenamiento. El modelo base fue cargado en cuantización de 4 bits (bnb-4bit) durante el entrenamiento, lo que sugiere que el fine-tuning se hizo con técnicas de QLoRA, aunque no se confirma en la model card.

## Capacidades

- Generación de texto conversacional en inglés con estilo de razonamiento explícito (cadenas de pensamiento antes de la respuesta final).
- Razonamiento lógico y matemático básico, heredado de la destilación de DeepSeek-R1.
- Capacidad de seguir instrucciones en formato conversacional.
- No se ha confirmado soporte de tool calling, function calling o uso como agente.
- No se ha confirmado soporte multilingüe más allá del inglés.
- No se ha confirmado soporte de visión, audio u otras modalidades.

## Casos de uso

- Asistentes conversacionales ligeros: el modelo puede integrarse en chatbots o asistentes virtuales que requieran respuestas razonadas en inglés, con un consumo de recursos moderado gracias a su tamaño de 1.5B.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y con licencia permisiva, es adecuado para validar conceptos de generación de texto antes de escalar a modelos mayores.
- Razonamiento en entornos con restricciones de hardware: su tamaño permite ejecutarlo en GPUs de consumo o incluso en CPU con cuantización, lo que lo hace útil para aplicaciones edge o dispositivos con poca memoria.
- Generación de explicaciones paso a paso: gracias a su entrenamiento con razonamiento, puede descomponer problemas en pasos intermedios, útil para tutorías o documentación técnica.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo abierto y ligero, puede servir como base para ajustes posteriores en tareas concretas como análisis de sentimiento, resumen o clasificación.
- Evaluación de técnicas de destilación y fine-tuning: investigadores pueden usarlo como referencia para comparar metodologías de entrenamiento eficiente (Unsloth, QLoRA) en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar en su model card. Dado que es un fine-tuning de DeepSeek-R1-Distill-Qwen-1.5B, se puede esperar un rendimiento similar al de su modelo base, pero no hay datos confirmados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en fp16 (1.777 millones de parámetros × 2 bytes). Con cuantización de 4 bits, se reduce a unos 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Para cuantización 4-bit, basta con 2 GB.
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas de gama media.
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI), vLLM, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión).
- Latencia y throughput estimados: no disponibles. En una GPU RTX 4090, se espera una generación de decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Toleng/koplak-flash-1.5b | 1.78B | no disponible | Apache-2.0 | Fine-tune de DeepSeek-R1-Distill-Qwen-1.5B |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.78B | 32.768 | MIT | Modelo base, destilado de DeepSeek-R1 |
| nvidia/OpenReasoning-Nemotron-1.5B | 1.5B | no disponible | Apache-2.0 | Modelo de razonamiento de NVIDIA |

La comparativa se basa en modelos de tamaño similar orientados a razonamiento. koplak-flash-1.5b es un fine-tuning del modelo de DeepSeek, por lo que su rendimiento debería ser comparable o ligeramente diferente según el dataset de ajuste. OpenReasoning-Nemotron-1.5B es una alternativa de NVIDIA con objetivos similares. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de un modelo entrenado principalmente con datos en inglés, puede heredar sesgos culturales y lingüísticos de los datos originales de Qwen y DeepSeek.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de idioma: solo se ha confirmado soporte para inglés. El uso en otros idiomas puede degradar significativamente la calidad.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Contexto limitado: aunque la arquitectura Qwen2 soporta hasta 32.768 tokens, no se ha confirmado que este fine-tuning mantenga esa longitud. Se recomienda verificar antes de usar en tareas de contexto largo.
- Sin garantías de rendimiento: al no haber benchmarks publicados, no se puede asegurar su comportamiento en tareas específicas. Es necesario evaluar el modelo en el caso de uso concreto.
- Modelo sin mantenimiento activo: el repositorio no muestra actividad reciente ni comunidad, lo que puede implicar falta de soporte o actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Toleng/koplak-flash-1.5b
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Librería Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
