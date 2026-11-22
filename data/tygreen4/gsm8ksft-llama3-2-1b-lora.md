# TyGreen4/gsm8ksft-llama3.2-1B-lora

## Resumen

El repositorio `TyGreen4/gsm8ksft-llama3.2-1B-lora` es un adaptador LoRA publicado en Hugging Face por el usuario TyGreen4. Por su nombre, se infiere que se trata de un ajuste fino (SFT) sobre el modelo base `meta-llama/Llama-3.2-1B`, orientado al conjunto de datos GSM8K, un benchmark de problemas aritméticos de varios pasos. No obstante, esta inferencia procede exclusivamente del identificador del repositorio: la model card no confirma ni el modelo base, ni el dataset, ni la metodología de entrenamiento.

El repositorio presenta un tamaño de 0.0 GB, cero descargas y cero likes, y su model card es la plantilla automática de Hugging Face sin ninguna sección completada. Esto implica que no hay información verificable sobre arquitectura, hiperparámetros, datos de entrenamiento, evaluación o licencia. Cualquier uso en producción requeriría inspeccionar directamente los archivos del repositorio y validar el comportamiento del adaptador de forma empírica.

La relevancia de esta ficha es, por tanto, limitada: se documenta un artefacto de investigación sin documentación pública, útil únicamente como referencia para quien quiera reproducir o auditar el ajuste, no como componente listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el nombre del repo, adaptador LoRA sobre un transformer tipo Llama; sin confirmar) |
| Parametros totales | no disponible (el modelo base inferido, Llama-3.2-1B, tiene 1.240 millones; el adaptador LoRA añade un número no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base inferido soporta 128.000 tokens, sin confirmar para este adaptador) |
| Tipos de cuantizacion | no disponible (al ser un adaptador LoRA, la cuantización aplica al modelo base al que se fusiona) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del adaptador ni sobre el procedimiento de entrenamiento. El nombre del repositorio sugiere un SFT con LoRA sobre GSM8K, lo que implicaría un ajuste de bajo rango sobre las capas de atención y/o MLP de un transformer decoder-only, entrenado con pares pregunta-respuesta de problemas matemáticos de primaria. Sin embargo, ni el rank del adaptador, ni el alpha, ni el learning rate, ni el número de épocas, ni la composición exacta del dataset están documentados.

Tampoco se especifica si el adaptador se entrenó con precisión mixta, qué tokenizador se empleó ni si se aplicaron técnicas adicionales como packing de secuencias o enmascaramiento de la pérdida sobre el prompt. La ausencia de estos datos impide reproducir el entrenamiento o auditar sus posibles sesgos.

## Capacidades

- Generación de texto y razonamiento aritmético de varios pasos: el nombre del repositorio apunta a un ajuste orientado a problemas tipo GSM8K, aunque no hay evaluación publicada que lo confirme.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso más allá del propio razonamiento aritmético.
- Capacidades multilingües: no disponibles; el modelo base inferido es mayoritariamente inglés.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Evaluación de adaptadores LoRA para razonamiento matemático: cargar el adaptador sobre el modelo base inferido y medir su precisión en GSM8K para comparar con el modelo sin ajustar, como paso previo a un ajuste propio.
- Reproducción de experimentos de SFT: usar el repositorio como referencia de estructura de artefacto (adaptador en safetensors) para construir un pipeline de entrenamiento equivalente con datos propios.
- Investigación sobre sobreajuste en datasets pequeños: dado el tamaño reducido del repositorio, sirve para estudiar cómo un adaptador de bajo rango modifica el comportamiento aritmético de un modelo de 1B sin alterar sus pesos base.
- Docencia y formación: ejemplo práctico de cómo se publica un adaptador LoRA en Hugging Face y de las carencias habituales de documentación en repositorios de investigación.
- Auditoría de artefactos del Hub: caso de estudio para herramientas que detectan model cards vacías y evalúan riesgos de licencia antes de su uso.
- Prototipado interno controlado: si se confirma el modelo base y la licencia, podría probarse en un entorno aislado para generar borradores de soluciones aritméticas, siempre con validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; para el modelo base inferido (Llama-3.2-1B) en fp16 se requieren aproximadamente 2,5 GB, y en cuantización de 4 bits alrededor de 1 GB, más el overhead del adaptador LoRA (típicamente decenas de MB).
- GPU recomendadas: no disponibles para este adaptador; para el modelo base inferido bastaría una GPU consumer con 4-8 GB de VRAM (RTX 3060, RTX 4060) o incluso CPU con llama.cpp.
- Cabe en GPU consumer: probablemente sí, asumiendo el modelo base de 1B, pero no confirmado por el autor.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; posible fusión y exportación a GGUF para llama.cpp u Ollama, no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TyGreen4/gsm8ksft-llama3.2-1B-lora | no disponible (base inferida 1,24B) | no disponible | no disponible | Hugging Face, sin descargas |
| meta-llama/Llama-3.2-1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B | 1,71B | 8.192 tokens | Apache 2.0 | Hugging Face |

La comparación es aproximada: el adaptador no documenta su modelo base, por lo que la fila de Llama-3.2-1B es una inferencia a partir del nombre del repositorio y no un dato confirmado.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre sesgos, datos de entrenamiento ni evaluación; el artefacto no es auditable.
- Licencia no declarada: no puede asumirse uso comercial; además, si el modelo base es Llama-3.2, heredaría la Llama 3.2 Community License, con restricciones propias.
- Riesgo de alucinación: sin evaluación publicada, no hay garantía de que el ajuste mejore la precisión aritmética en lugar de simplemente memorizar patrones de GSM8K.
- Posible sobreajuste: un adaptador LoRA entrenado solo con GSM8K puede degradar capacidades generales del modelo base.
- Idiomas: no documentados; el modelo base inferido está orientado al inglés.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- Tamaño del repositorio de 0.0 GB: conviene verificar que los pesos del adaptador estén realmente presentes antes de intentar cargarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TyGreen4/gsm8ksft-llama3.2-1B-lora
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
- Modelo base inferido (no confirmado): https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset GSM8K (referencia inferida del nombre, no confirmada): https://huggingface.co/datasets/openai/gsm8k
