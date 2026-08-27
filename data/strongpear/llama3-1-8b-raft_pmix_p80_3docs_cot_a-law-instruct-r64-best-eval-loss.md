# strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-best-eval-loss

## Resumen

Este modelo es un adaptador LoRA de rango 64 (r64) desarrollado por el usuario strongpear, que se aplica sobre el modelo base meta-llama/Llama-3.1-8B. El nombre del repositorio sugiere un fine-tuning orientado a tareas de razonamiento con cadena de pensamiento (CoT) y recuperación aumentada (RAFT, probablemente "Retrieval Augmented Fine-Tuning"), con una mezcla de documentos (3DOCS) y un porcentaje de mezcla del 80% (P80). También incluye la etiqueta "A-LAW-Instruct", que podría referirse a un conjunto de instrucciones específico, aunque no se proporciona documentación adicional.

El modelo se publica como un adaptador PEFT (Parameter-Efficient Fine-Tuning) en formato safetensors, con un tamaño de repositorio de 0,7 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo completo. No se dispone de información sobre el conjunto de datos de entrenamiento, el proceso de fine-tuning, ni métricas de evaluación. La ficha oficial del autor está prácticamente vacía, con campos marcados como "[More Information Needed]". A pesar de la falta de documentación, el modelo podría ser relevante para experimentos de fine-tuning eficiente sobre Llama 3.1 8B, especialmente en dominios que requieran razonamiento con contexto adicional, aunque su utilidad real no puede verificarse sin datos de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Llama 3.1 8B) con adaptador LoRA de rango 64 |
| Parametros totales | No disponible (el adaptador tiene ~0,7 GB; el modelo base tiene 8.030 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128K tokens, pero el adaptador no especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; se puede cuantizar el modelo base) |
| Idiomas soportados | No disponibles (el modelo base soporta multilingüe, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 aplicado sobre Llama 3.1 8B, un transformer denso con atención multi-cabeza y ventana de contexto de 128K tokens en su versión original. El adaptador se entrena mediante fine-tuning eficiente en parámetros, lo que implica que solo se actualizan las matrices de bajo rango añadidas a las capas de atención y MLP, mientras que los pesos del modelo base permanecen congelados. El nombre del repositorio sugiere el uso de la técnica RAFT (Retrieval Augmented Fine-Tuning), que combina fine-tuning con recuperación de documentos para mejorar el rendimiento en tareas de razonamiento con contexto externo. La etiqueta "PMIX_P80" podría indicar una proporción de mezcla de datos del 80% entre documentos recuperados y otros tipos de ejemplos, y "3DOCS" sugiere que se utilizan tres documentos por ejemplo. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El adaptador se distribuye con la librería PEFT 0.20.0.

## Capacidades

- Generación de texto: al ser un adaptador sobre Llama 3.1 8B, hereda las capacidades básicas de generación de texto del modelo base, incluyendo razonamiento, código y matemáticas.
- Razonamiento con cadena de pensamiento (CoT): el nombre del modelo incluye "CoT", lo que sugiere que el fine-tuning se orientó a mejorar la capacidad de generar razonamientos paso a paso.
- Recuperación aumentada: la inclusión de "RAFT" y "3DOCS" indica que el modelo fue entrenado para utilizar documentos recuperados como contexto adicional, lo que podría mejorar la precisión en tareas de pregunta-respuesta con fuentes externas.
- Tool calling y function calling: no se especifica, aunque el modelo base Llama 3.1 8B soporta estas capacidades; el adaptador podría heredarlas o no.
- Capacidades multilingües: no se especifica para el adaptador; el modelo base soporta varios idiomas, pero no hay evidencia de que el fine-tuning los preserve.
- Otras capacidades: no se documentan capacidades especiales como visión o audio.

## Casos de uso

- Pregunta-respuesta con contexto externo: el modelo podría utilizarse en sistemas que necesiten responder preguntas basándose en documentos proporcionados en la entrada, gracias al entrenamiento con múltiples documentos (3DOCS). Por ejemplo, en un asistente de soporte técnico que recibe manuales o artículos como contexto.
- Razonamiento paso a paso en dominios especializados: si el fine-tuning se realizó sobre un dominio concreto (como el legal, dado el sufijo "A-LAW"), el modelo podría emplearse para tareas de análisis de textos legales, generando explicaciones detalladas de cláusulas o normativas.
- Experimentación con fine-tuning eficiente: investigadores que quieran estudiar el efecto de LoRA con rango 64 sobre Llama 3.1 8B en tareas de razonamiento con recuperación pueden usar este adaptador como punto de partida o comparación.
- Prototipado rápido de aplicaciones de generación aumentada por recuperación (RAG): al ser un adaptador ligero, se puede cargar sobre el modelo base y probar flujos de RAG sin necesidad de entrenar un modelo completo.
- Evaluación de técnicas de mezcla de datos: el nombre "PMIX_P80" sugiere un experimento sobre proporciones de mezcla; otros investigadores podrían replicar o comparar con sus propios ajustes.
- Fine-tuning adicional sobre dominios específicos: el adaptador puede servir como base para un segundo fine-tuning, aprovechando el conocimiento ya adquirido en razonamiento con documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y no se encontraron referencias externas con resultados. El único dato disponible es una pérdida de evaluación de 0,5788 en un modelo similar del mismo autor (Llama3.1-8B-QA_CoT-MEDICAL-Instruct-r64), pero no es aplicable a este adaptador concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA, se debe cargar el modelo base Llama 3.1 8B más el adaptador. En FP16, el modelo base requiere aproximadamente 16 GB de VRAM, más el adaptador (~0,7 GB). Con cuantización (por ejemplo, 4 bits), se puede reducir a unos 6-8 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB de VRAM (RTX 3090/4090, A10G) es adecuada. Con cuantización 4 bits, una RTX 3060 de 12 GB o similar podría funcionar.
- Si cabe en consumer GPU: sí, con cuantización es posible ejecutarlo en GPUs de consumo como RTX 3060 12GB o RTX 4070.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers + PEFT, o convertir a GGUF para usar con llama.cpp u Ollama. También es compatible con vLLM si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no se dispone de datos específicos. Para Llama 3.1 8B en FP16, se espera un throughput de aproximadamente 20-40 tokens/s en una RTX 4090, pero esto depende de la implementación y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de la misma categoría, ya que no hay datos de rendimiento ni especificaciones claras. Se puede comparar con el modelo base Llama 3.1 8B Instruct, que es el punto de partida, y con otros adaptadores LoRA similares del mismo autor, pero sin métricas no es posible establecer una comparación objetiva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (LoRA r64) | ~0,7 GB (adaptador) | No disponible | No disponible | HuggingFace |
| Llama 3.1 8B Instruct (base) | 8.030 M | 128K | Llama 3.1 Community License | HuggingFace |
| Llama3.1-8B-QA_CoT-MEDICAL-Instruct-r64 (mismo autor) | ~0,7 GB (adaptador) | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: al ser un adaptador sobre Llama 3.1 8B, hereda los sesgos del modelo base, que pueden incluir estereotipos y prejuicios presentes en los datos de preentrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente si el contexto recuperado no es suficiente o es contradictorio.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, el adaptador no especifica si se entrenó con esa longitud; es posible que el fine-tuning reduzca la ventana efectiva.
- Restricciones de licencia: la licencia del adaptador no está disponible, y el modelo base Llama 3.1 tiene su propia licencia que puede imponer restricciones de uso comercial. Se debe verificar antes de usar en producción.
- Falta de documentación: la model card está vacía, por lo que no se conocen los datos de entrenamiento, el proceso de fine-tuning ni las garantías de calidad. Esto hace que el modelo sea arriesgado para uso en entornos críticos.
- Compatibilidad: al ser un adaptador PEFT, requiere cargar el modelo base exacto (meta-llama/Llama-3.1-8B) y la versión correcta de PEFT (0.20.0) para funcionar correctamente.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-LAW-Instruct-r64-best-eval-loss
- Modelo base Llama 3.1 8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Paper de Llama 3 (arXiv): https://arxiv.org/pdf/2407.21783
- Modelo similar del mismo autor: https://huggingface.co/strongpear/Llama3.1-8B-QA_CoT-MEDICAL-Instruct-r64
