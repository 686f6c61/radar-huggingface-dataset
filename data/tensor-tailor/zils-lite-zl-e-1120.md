# tensor-tailor/zils-lite-zl-e-1120

## Resumen

zils-lite-zl-e-1120 es un modelo de decisión de la familia d3-lite, publicado por el usuario tensor-tailor sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un fine-tune mediante fusión de LoRA (merged LoRA) a partir del "soup" actual de d3-lite, orientado a su uso como cuerpo de decisión dentro del pool lite de la subred Zils 127. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones) y pesos en safetensors, es un modelo compacto pensado para tareas de decisión más que para generación abierta de propósito general.

El modelo hereda la arquitectura y el tokenizador de Qwen3.5-0.8B, por lo que comparte sus características estructurales, aunque la model card no detalla la arquitectura interna ni la longitud de contexto efectiva del fine-tune. La licencia es Apache-2.0, lo que facilita su uso comercial y su integración en pipelines propios.

Su relevancia es acotada y específica: se publica como pieza de un ecosistema concreto (Zils subnet 127, pool lite) y no como un modelo generalista. En el momento de la consulta no registra descargas ni likes, y la información técnica disponible en la model card es mínima, limitada a la declaración de licencia, modelo base y naturaleza del fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-0.8B realizado mediante fusión de LoRA (merged LoRA) sobre el "soup" actual de d3-lite. La model card no especifica la arquitectura interna más allá de la herencia del modelo base, ni detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas propias del fine-tune.

La única información de entrenamiento disponible es que se trata de una fusión de adaptadores LoRA sobre un modelo base de la familia Qwen3.5-0.8B, orientada a constituir un "cuerpo de decisión" (decision body) dentro del pool lite de la subred Zils 127. No se aportan datos sobre la naturaleza de las decisiones que modela ni sobre el proceso de selección del soup.

## Capacidades

- Generación de texto y razonamiento básico, heredados del modelo base Qwen3.5-0.8B.
- Orientación a tareas de decisión (decision-model), según la etiqueta declarada por el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Clasificación y decisión dentro del pool lite de Zils subnet 127: el modelo está diseñado explícitamente como cuerpo de decisión para este entorno, por lo que su uso principal es servir de componente de decisión en dicho ecosistema.
- Enrutamiento de peticiones en pipelines ligeros: con menos de 1.000 millones de parámetros, puede emplearse como clasificador o selector de ruta en sistemas de inferencia con requisitos de latencia bajos.
- Filtrado y triaje de entradas: su tamaño compacto permite desplegarlo como primera etapa de filtrado antes de modelos mayores, reduciendo coste computacional.
- Prototipado rápido de agentes de decisión: al ser un fine-tune sobre Qwen3.5-0.8B con licencia Apache-2.0, sirve como base para experimentar con flujos de decisión sin restricciones de licencia.
- Evaluación comparativa de soups LoRA: útil para investigadores que estudien el efecto de la fusión de adaptadores sobre modelos base pequeños.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecución en CPU o GPU de gama baja, aunque no se dispone de datos de latencia o throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (0,85 mil millones de parámetros), en FP16 requeriría aproximadamente 1,7 GB de pesos, y en cuantizaciones de 8 o 4 bits, del orden de 0,9 GB o 0,5 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño, aunque no se confirma en la documentación.
- Opciones de despliegue: la librería declarada es transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-zl-e-1120 | 852.985.920 | No disponible | Apache-2.0 | Fine-tune LoRA fusionado sobre Qwen3.5-0.8B, orientado a decisión |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 mil millones | No disponible en la información | Apache-2.0 | Modelo base generalista del que deriva |
| Alternativas de ~1B de propósito general | No disponible | No disponible | Variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- La información técnica publicada es mínima: no se documentan contexto, idiomas, cuantizaciones ni benchmarks, lo que dificulta evaluar su idoneidad en producción.
- Al ser un modelo de decisión especializado, su comportamiento fuera del ecosistema Zils subnet 127 no está validado.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; no se han publicado evaluaciones al respecto.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-0.8B (también Apache-2.0 según la model card).
- Sin descargas ni likes registrados en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No se especifica si el fine-tune altera la longitud de contexto o el tokenizador del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-zl-e-1120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
