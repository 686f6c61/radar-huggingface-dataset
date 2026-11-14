# Ura0316/zils-mini-body-xda

## Resumen

zils-mini-body-xda es un "body" (cuerpo de pesos) publicado por el usuario Ura0316 para el pool de modelos `d3-mini` de Zils, un proyecto asociado a la subred 127 de Bittensor. Se trata de un ajuste fino (fine-tune) del modelo previo `Ura0316/zils-mini-body-cb2`, que a su vez era la media uniforme de pesos de dos fine-tunes sobre mezclas de modelos base con licencia Apache-2.0. El repositorio contiene únicamente los pesos de lenguaje y visión en el formato del chasis del pool (723 tensores en bfloat16); la capa de respuesta, el prompt y el runtime provienen del chasis fijado del pool.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) y un tamaño de repositorio de 9,1 GB, lo que es coherente con pesos en bfloat16. Su base última es `Qwen/Qwen3.5-4B`, según indica la model card, y está pensado como componente dentro de un sistema mayor de evaluación y enrutamiento de respuestas, no como un modelo autónomo de propósito general.

La relevancia de esta ficha es limitada pero ilustrativa: documenta un caso de fine-tuning especializado sobre datos de decisión y formato de examen, con una receta de entrenamiento basada en LoRA de rango 64, pérdida soft cross-entropy con término Brier y regularización KL hacia el modelo de partida. Es un ejemplo de cómo se construyen "cuerpos" intercambiables en un pool descentralizado, con licencia Apache-2.0 y sin redistribución de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; detalles de capas no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (723 tensores, bfloat16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del body `Ura0316/zils-mini-body-cb2` (commit be1a5ea5), que era la media uniforme de pesos de dos fine-tunes sobre mezclas de modelos base Apache-2.0. La receta de entrenamiento descrita en la model card emplea dos adaptadores LoRA de rango 64 sobre las proyecciones de atención y MLP (semillas 1 y 2), cada uno entrenado durante una época sobre los mismos 44.138 ítems y fusionados posteriormente en los pesos. El body final es la media uniforme de los dos fine-tunes fusionados.

La función de pérdida combina tres términos: una entropía cruzada suave hacia la distribución objetivo de cada ítem, un término Brier hacia la clave del ítem (con label smoothing de 0,05 en los ítems con clave) y un término KL hacia la distribución de respuestas del body de partida (peso 0,5; 1,0 en los ítems de replay). Los datos se componen de 29.438 ítems de decisión construidos a partir de los splits de entrenamiento de nueve datasets públicos (ToolACE, When2Call, glaive-function-calling-v2, banking77, clinc_oos, gsm8k, esci, hellaswag y poem_sentiment), 6.000 preguntas de Zils Relay con la distribución del profesor `vllm-sr/d3-ultra` como objetivo, y 9.000 ítems en formato de examen generados por `Qwen/Qwen3.6-35B-A3B-FP8` con la distribución del body de partida como único objetivo. Las instrucciones, textos de opciones y etiquetas de campo fueron reformulados por Qwen3.6-35B-A3B-FP8.

## Capacidades

- Generación de texto y respuestas en formato de examen, orientadas a la selección entre opciones y a la clasificación de intenciones.
- Capacidades de decisión y enrutamiento: el entrenamiento con ítems de ToolACE, When2Call y glaive-function-calling-v2 sugiere soporte para decidir cuándo invocar herramientas y cómo formular llamadas.
- Clasificación de intenciones y temas: los ítems de banking77 y clinc_oos apuntan a clasificación de consultas de dominio bancario y de asistente virtual.
- Razonamiento aritmético básico: los ítems de gsm8k indican exposición a problemas matemáticos de primaria.
- Comprensión de sentido común: los ítems de hellaswag apuntan a tareas de finalización plausible.
- Análisis de sentimiento en poesía: los ítems de poem_sentiment indican exposición a este dominio específico.
- Capacidades de visión: el repositorio incluye pesos de visión según la model card, aunque no se detallan las tareas concretas.
- Soporte de tool calling / function calling: inferido de los datasets de entrenamiento, no confirmado explícitamente en la card.
- Capacidades multilingües y de agente multi-paso: no disponibles.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo puede clasificar la intención de un mensaje entrante (por ejemplo, en dominios bancarios o de asistente virtual) y decidir si requiere una llamada a herramienta, gracias a su entrenamiento con banking77, clinc_oos y When2Call.
- Selección de herramientas en pipelines de agentes: integrado en un sistema mayor, puede evaluar si una consulta debe resolverse con una función externa y proponer la llamada adecuada, a partir de los ítems de ToolACE y glaive-function-calling-v2.
- Evaluación automática de respuestas en formato de examen: el modelo está entrenado con ítems en formato de examen y puede emplearse como componente de puntuación o de generación de distribuciones de respuesta en sistemas de evaluación.
- Clasificación de sentimiento en textos creativos: su exposición a poem_sentiment permite usarlo en tareas de análisis de tono en poesía o textos literarios breves.
- Resolución de problemas aritméticos sencillos: los ítems de gsm8k lo hacen adecuado para asistentes educativos de matemáticas de nivel primaria, siempre con verificación posterior.
- Filtrado de sentido común en generación: los ítems de hellaswag permiten emplearlo como discriminador de finalizaciones plausibles en tareas de generación asistida.
- Componente de un pool descentralizado: como body del pool d3-mini de Zils, se integra en el chasis fijado del pool para tareas de respuesta y enrutamiento dentro de la subred 127 de Bittensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,1 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para los pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs consumer con 16 GB o más (por ejemplo, RTX 4080/4090) y en GPUs de datacenter como A100 o H100.
- Cabe en GPU consumer: probablemente sí en modelos con 16 GB o más de VRAM, aunque no se confirma en la documentación.
- Opciones de despliegue: no disponible; al ser un body sin capa de respuesta ni runtime propio, requiere el chasis del pool de Zils.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-body-xda | 4.539.265.536 | No disponible | Apache-2.0 | Hugging Face (repo propio) |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible | Apache-2.0 | Hugging Face |
| Ura0316/zils-mini-body-cb2 (modelo de partida) | No disponible | No disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene únicamente el body; no incluye la capa de respuesta, el prompt ni el runtime, por lo que no es directamente ejecutable sin el chasis del pool de Zils.
- No se han publicado datos sobre sesgos, evaluación de seguridad ni comportamiento fuera de distribución.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un fine-tune sobre datos de decisión y examen, su comportamiento generativo abierto puede degradarse respecto al modelo base.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica longitud de contexto ni cobertura lingüística.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento subyacentes tienen licencias diversas (Apache-2.0, CC BY 4.0, CC BY 3.0, MIT) y no se redistribuyen en el repositorio; conviene verificar el cumplimiento en despliegues comerciales.
- El modelo está vinculado a la subred 127 de Bittensor y al pool d3-mini; su utilidad fuera de ese ecosistema no está documentada.
- No hay información sobre el proceso de evaluación, métricas de calidad ni validación independiente.

## Enlaces

- [Hugging Face: Ura0316/zils-mini-body-xda](https://huggingface.co/Ura0316/zils-mini-body-xda)
- [Modelo de partida: Ura0316/zils-mini-body-cb2](https://huggingface.co/Ura0316/zils-mini-body-cb2)
- [Modelo base último: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Dataset Zils Relay answers](https://huggingface.co/datasets/zils-ai/zils-relay-answers)
- [Modelo profesor Qwen/Qwen3.6-35B-A3B-FP8](https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8)
- [Dataset Team-ACE/ToolACE](https://huggingface.co/datasets/Team-ACE/ToolACE)
- [Dataset nvidia/When2Call](https://huggingface.co/datasets/nvidia/When2Call)
- [Dataset glaiveai/glaive-function-calling-v2](https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2)
- [Dataset PolyAI/banking77](https://huggingface.co/datasets/PolyAI/banking77)
- [Dataset clinc/clinc_oos](https://huggingface.co/datasets/clinc/clinc_oos)
- [Dataset openai/gsm8k](https://huggingface.co/datasets/openai/gsm8k)
- [Dataset tasksource/esci](https://huggingface.co/datasets/tasksource/esci)
- [Dataset Rowan/hellaswag](https://huggingface.co/datasets/Rowan/hellaswag)
- [Dataset google-research-datasets/poem_sentiment](https://huggingface.co/datasets/google-research-datasets/poem_sentiment)
