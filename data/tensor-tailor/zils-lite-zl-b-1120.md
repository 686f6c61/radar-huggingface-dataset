# tensor-tailor/zils-lite-zl-b-1120

## Resumen

zils-lite-zl-b-1120 es un modelo de decisión ("decision body") de la familia d3-lite, desarrollado por el usuario tensor-tailor y publicado en Hugging Face. Se trata de un fine-tune mediante fusión de LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a tareas de decisión dentro del pool lite de la subred 127 de Zils. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), se posiciona en la gama ultraligera de modelos transformer, lo que lo hace apto para despliegues con recursos muy limitados.

El modelo hereda la arquitectura y las capacidades del Qwen3.5-0.8B, sobre el que se ha aplicado una adaptación específica para el dominio de decisión que define el ecosistema Zils. La model card es extremadamente escueta: no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni los hiperparámetros del proceso de fusión de LoRA. Esta falta de documentación limita la evaluación rigurosa de su comportamiento fuera del contexto para el que fue creado.

Su relevancia actual es acotada: se publica bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en pipelines, pero cuenta con cero descargas y cero likes en el momento de la consulta, y no se han publicado benchmarks ni demos. Es, por tanto, un artefacto experimental de un ecosistema de nicho más que un modelo de propósito general validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 0,85 mil millones de parámetros. La adaptación se realizó mediante fusión de LoRA ("merged LoRA fine-tune") sobre lo que el autor denomina "the current d3-lite soup", es decir, una combinación de adaptadores del pool lite de la subred 127 de Zils. No se especifica el rango del LoRA, el número de pasos de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO.

Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las que ya incorpora el modelo base Qwen3.5-0.8B, cuyas características concretas no se detallan en la información proporcionada. La etiqueta "decision-model" sugiere un ajuste orientado a tareas de clasificación o selección de acciones, pero no se aporta ninguna especificación sobre el formato de entrada/salida ni sobre el espacio de decisión.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-0.8B, sin validación específica publicada para este fine-tune.
- Toma de decisiones: el modelo se presenta como "decision body", por lo que se espera que emita decisiones dentro del marco del pool lite de Zils; no se detalla el formato.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en la ficha de Hugging Face).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación y selección de acciones en el pool lite de Zils: el modelo está entrenado específicamente para emitir decisiones dentro de este ecosistema, por lo que su uso principal es la inferencia de decisiones en dicho contexto.
- Prototipado de agentes ligeros: con 0,85 mil millones de parámetros puede ejecutarse en entornos con poca VRAM para experimentar con lógicas de decisión antes de escalar a modelos mayores.
- Filtrado y enrutamiento de peticiones: por su tamaño reducido puede emplearse como clasificador de intención o enrutador en pipelines de atención al cliente, siempre que se valide su comportamiento fuera del dominio Zils.
- Experimentación académica con fusión de LoRA: sirve como ejemplo reproducible de cómo fusionar adaptadores sobre un modelo base pequeño y publicar el resultado en safetensors.
- Inferencia en el borde (edge): al caber en GPUs de consumo e incluso en CPU con cuantización, puede desplegarse en dispositivos con recursos limitados para tareas de decisión de baja latencia.
- Evaluación comparativa de fine-tunes de Qwen3.5-0.8B: útil para investigadores que quieran medir el impacto de un fine-tune de decisión frente al modelo base en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; en int8, alrededor de 0,9 GB; en int4, en torno a 0,5 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para int8/int4 basta con GPUs integradas o CPUs modernas.
- Cabe en GPU de consumo: sí, en todas las RTX y en muchas GPUs integradas con cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama y TGI no están confirmados por el autor, aunque al ser un transformer estándar en safetensors deberían ser compatibles previa conversión a GGUF si fuera necesario.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-zl-b-1120 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache-2.0 | Hugging Face |
| Fine-tunes de decisión de la familia d3-lite | no disponible | no disponible | Apache-2.0 (presumible) | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla dataset, hiperparámetros ni evaluación, lo que impide verificar la calidad del fine-tune.
- Sesgos conocidos: no documentados; al heredar el modelo base, puede arrastrar los sesgos de Qwen3.5-0.8B, que tampoco se detallan.
- Riesgo de alucinación: no evaluado; en modelos de 0,85 B el riesgo de generar contenido incorrecto es alto en tareas abiertas.
- Limitaciones de contexto e idioma: no disponibles; el campo de idiomas está vacío, por lo que no se garantiza soporte multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.5-0.8B y las condiciones del ecosistema Zils.
- Advertencia para producción: sin benchmarks ni demos, no se recomienda su uso en producción sin una evaluación propia previa; el modelo está orientado a un dominio muy específico (pool lite de Zils) y su comportamiento fuera de él es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-zl-b-1120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
