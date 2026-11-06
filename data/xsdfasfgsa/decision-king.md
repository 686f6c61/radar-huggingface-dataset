# xsdfasfgsa/Decision-King

## Resumen

Decision-King es un modelo derivado de Qwen3.8-27B, inicializado a partir del commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio de Qwen, y publicado por el usuario xsdfasfgsa en Hugging Face. Se presenta como un modelo especializado en tareas de decisión: en lugar de generar texto libre, recibe un estado de contexto y un conjunto de preguntas tipadas (booleanas, de elección múltiple y de puntuación) y devuelve logits directos para cada una. Esta aproximación de "direct-logits" evita la generación autoregresiva convencional y reduce la tarea a una clasificación estructurada sobre el estado proporcionado.

El modelo conserva la arquitectura base de Qwen3.8-27B, con 27.356.728.560 parámetros totales en formato safetensors y un repositorio de 54,7 GB, lo que sugiere pesos en BF16. La model card menciona la etiqueta `looped-transformer` y la capacidad `image-text-to-text`, aunque no se detalla en qué consiste la modificación looped ni cómo se ha adaptado la torre visual. El modelo se distribuye bajo licencia Apache 2.0 y requiere una GPU CUDA con capacidad BF16 y VRAM suficiente, recomendándose 80 GB.

La relevancia actual del modelo es acotada pero específica: propone un formato de inferencia orientado a decisiones estructuradas y evaluación sobre JevBench, un benchmark cuyo split público se usó para evaluación y ajuste (no para entrenamiento, según el autor). No obstante, la información pública es muy limitada: no se documentan datos de entrenamiento, composición del dataset, proceso de alineación ni resultados numéricos de benchmarks, lo que dificulta una evaluación rigurosa de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `looped-transformer` en la model card); inicializado desde Qwen/Qwen3.8-27B |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados presumiblemente en BF16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que Decision-King se inicializa desde Qwen/Qwen3.8-27B en un commit concreto, por lo que hereda la arquitectura transformer de dicho modelo base. La etiqueta `looped-transformer` sugiere algún tipo de reutilización o iteración de capas, pero no se proporciona detalle técnico sobre cómo se implementa ni qué capas se ven afectadas. Tampoco se especifica si se ha modificado la torre de visión o el proyector multimodal, pese a que la pipeline declarada es `image-text-to-text`.

En cuanto al entrenamiento, la información disponible es mínima. El autor afirma que no se entrenó sobre JevBench y que su split público se usó para evaluación y ajuste. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación. Tampoco se describe el mecanismo de "direct-logits" más allá del formato de entrada/salida del script de inferencia, que recibe un `state` y un conjunto de `questions` con tipos `noul`, `choice` y `score`, y devuelve probabilidades por pregunta.

## Capacidades

- Toma de decisiones estructuradas: responde a preguntas tipadas (booleanas `noul`, de elección `choice` y de puntuación `score`) sobre un estado de contexto proporcionado, devolviendo probabilidades por opción.
- Salida de logits directos: el adaptador de inferencia devuelve `probs` y `task_id` para cada pregunta, sin generación de texto libre.
- Procesamiento de entradas JSON/JSONL: acepta registros de JevBench en crudo y preserva el orden original de etiquetas.
- Capacidad multimodal declarada: la pipeline es `image-text-to-text`, aunque no se detalla el uso práctico de imágenes en la documentación.
- Servidor HTTP opcional: incluye `inference/serve.py` con un endpoint `/v1/systemone` compatible con peticiones JSON.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de peticiones internas: el modelo puede recibir un estado con la descripción de la solicitud y un conjunto de preguntas de tipo `choice` con criterios (por ejemplo, "inventory", "payments", "facilities") para asignar la petición al equipo correcto, como muestra el `example_request.json` de la model card.
- Validación de condiciones operativas: con preguntas de tipo `noul` se pueden comprobar condiciones booleanas sobre el estado, como si las unidades disponibles cubren las solicitadas, integrándose en un pipeline de validación previa a la ejecución.
- Puntuación de severidad o capacidad: las preguntas de tipo `score` permiten graduar un estado según criterios discretos (por ejemplo, unidades restantes tras una solicitud), útil para sistemas de alertas o priorización.
- Evaluación sobre JevBench: el adaptador acepta JSONL de JevBench directamente y genera predicciones en JSONL, lo que facilita la comparación con el scorer oficial del benchmark en entornos de investigación.
- Servicio de decisión vía HTTP: el servidor incluido expone un endpoint `/v1/systemone` que puede desplegarse en una GPU de 80 GB para integrarse en aplicaciones que envíen estados y preguntas en JSON.
- Clasificación estructurada en pipelines de datos: al devolver probabilidades por opción, el modelo puede alimentar sistemas de decisión con umbrales configurables, en lugar de depender de parseo de texto generado.
- Experimentación con arquitecturas looped: la etiqueta `looped-transformer` y la inicialización desde Qwen3.8-27B lo hacen adecuado para estudiar variantes de reutilización de capas en tareas de clasificación, aunque la documentación al respecto es escasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona JevBench como benchmark de evaluación y afirma que su split público se usó para evaluación y ajuste, pero no incluye métricas de accuracy ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card recomienda 80 GB, lo que es coherente con un modelo de 27,36 mil millones de parámetros en BF16 (aproximadamente 54,7 GB de pesos más overhead de activaciones y KV cache).
- GPU recomendadas: A100 80 GB o H100 80 GB, según la recomendación del autor de una GPU CUDA con capacidad BF16 y VRAM suficiente.
- Cabe en consumer GPU: no de forma directa en BF16. No se han publicado variantes cuantizadas (GGUF, AWQ, GPTQ), por lo que no se puede confirmar su viabilidad en GPUs de consumo como RTX 4090 (24 GB) sin cuantización adicional no documentada.
- Opciones de despliegue: el repositorio incluye scripts propios (`inference/infer.py` y `inference/serve.py`) basados en `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-King | 27,36 B | no disponible | Decisión estructurada (direct-logits) | Apache 2.0 | Hugging Face (55 descargas) |
| Qwen3.8-27B (base) | ~27 B (según nombre) | no disponible | Generación de texto multimodal | no disponible en esta ficha | Hugging Face |
| Alternativas de clasificación estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de decisión estructurada equivalentes; la comparación con el modelo base Qwen3.8-27B es la única referencia directa, y no se han publicado métricas comparativas.

## Limitaciones y advertencias

- Documentación muy escasa: no se detallan datos de entrenamiento, composición del dataset, proceso de alineación ni métricas de evaluación, lo que impide verificar el rendimiento declarado.
- Riesgo de sobreajuste a JevBench: el autor indica que el split público se usó para evaluación y ajuste, por lo que las métricas sobre ese split pueden estar optimistas.
- Formato de uso restringido: el modelo está diseñado para un esquema específico de `state` y `questions`; no se documenta su comportamiento fuera de ese formato ni como generador de texto general.
- Capacidad multimodal incierta: la pipeline `image-text-to-text` sugiere entrada de imágenes, pero no se explica cómo se procesan ni se ofrecen ejemplos.
- Idiomas no documentados: no se especifica qué lenguas soporta, lo que es un riesgo para despliegues en producción multilingüe.
- Requisitos de hardware elevados: 80 GB de VRAM recomendados y ausencia de cuantizaciones publicadas limitan su uso a infraestructura de gama alta.
- Sesgos y alucinaciones: no se documentan sesgos conocidos; al tratarse de un modelo de clasificación con logits directos, el riesgo de alucinación textual es menor, pero persiste el riesgo de calibración deficiente en las probabilidades.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que no se detallan en esta ficha; conviene revisar la licencia del modelo original.
- Madurez: 55 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xsdfasfgsa/Decision-King
- Modelo base Qwen3.8-27B (commit referenciado): https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
