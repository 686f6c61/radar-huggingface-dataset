# xamiuz/xamiuz1.0

## Resumen

xamiuz1.0 es un ajuste fino (finetune) del modelo Meta Llama 3.1 8B Instruct, publicado por el usuario xamiuz en HuggingFace. Se ha entrenado partiendo de la versión cuantizada en 4 bits de Unsloth (`unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`) y utilizando la librería Unsloth, que según el autor permite un entrenamiento "2x más rápido" que el flujo estándar. El modelo se distribuye con licencia Apache 2.0 y está etiquetado únicamente para inglés.

La relevancia de este modelo es limitada: se trata de un finetune comunitario sin model card descriptiva, sin datos sobre el dataset de entrenamiento, sin benchmarks publicados y con cero descargas en el momento de la consulta. No aporta innovaciones arquitectónicas respecto a Llama 3.1 8B; hereda su arquitectura transformer decoder-only y su ventana de contexto de 128 000 tokens, pero no hay evidencia de que el ajuste fino preserve o mejore dichas capacidades.

Por tanto, esta ficha debe interpretarse como una descripción del modelo base subyacente (Llama 3.1 8B Instruct) con las salvedades propias de un finetune no documentado. Cualquier evaluación de calidad, sesgos o rendimiento específico del ajuste fino queda fuera del alcance de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B) |
| Parametros totales | 8 030 millones (modelo base Llama 3.1 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | El checkpoint base es bnb-4bit; el repo publicado ocupa 0,2 GB, lo que sugiere pesos en 4 bits o un adaptador LoRA. No se especifica en la model card |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B: un transformer decoder-only con atención por grupos (GQA), activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE) con escalado para contexto largo. El modelo base fue entrenado por Meta con más de 15 billones de tokens y posteriormente alineado mediante SFT y RLHF (DPO), según la documentación pública de Llama 3.1.

Sobre el proceso de ajuste fino de xamiuz1.0 no hay información: la model card no indica el dataset, el número de pasos, la técnica (LoRA, QLoRA, full fine-tuning), la composición de datos ni si hubo etapas de preferencia. Solo se menciona que se usó Unsloth sobre el checkpoint cuantizado en 4 bits de Llama 3.1 8B Instruct. El tamaño del repositorio (0,2 GB) es compatible con un adaptador LoRA o con pesos cuantizados de baja precisión, pero no se confirma en la documentación.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente conservados del modelo base, aunque no verificados tras el finetune.
- Generación de código y matemáticas básicas, capacidades propias del modelo base.
- Soporte de tool calling / function calling: el modelo base Llama 3.1 lo soporta; no hay confirmación de que el finetune lo preserve.
- Capacidades multilingües del modelo base (8 idiomas oficiales), aunque la model card solo declara inglés.
- No se documenta thinking mode, visión, audio ni capacidades de agente específicas del finetune.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo de 8B con licencia Apache 2.0, puede desplegarse en una sola GPU consumer para experimentar con instrucciones y prompts antes de pasar a producción.
- Generación de texto y resúmenes en inglés: adecuado para tareas de redacción asistida donde no se requiera una calidad de frontier model.
- Base para nuevos finetunes: al estar disponible en safetensors y con licencia permisiva, puede servir como punto de partida para ajustes específicos de dominio mediante LoRA.
- Experimentación académica con Unsloth: útil para reproducir flujos de entrenamiento rápido en 4 bits sobre hardware modesto.
- Evaluación comparativa de finetunes comunitarios: puede emplearse como caso de estudio en pipelines de evaluación de modelos pequeños.
- Despliegue en entornos con requisitos de licencia laxa: Apache 2.0 permite uso comercial sin restricciones adicionales, a diferencia de otras licencias de modelos abiertos.
- No se recomienda para producción crítica sin una evaluación previa, dado que no hay benchmarks ni documentación del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en cuantización 4 bits; 16 GB en fp16 (pesos de 8B a 2 bytes por parámetro).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para fp16; A100 40 GB o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más usando cuantización 4 bits (llama.cpp, GPTQ, AWQ).
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, TGI (el repo incluye el tag text-generation-inference).
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del backend. En una RTX 4090 con vLLM en fp16 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este finetune concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xamiuz1.0 | 8B | 128k (heredado) | Apache 2.0 | HuggingFace | Finetune sin documentar ni benchmarks |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | HuggingFace, Meta | Modelo base oficial, con benchmarks publicados |
| Mistral 7B Instruct | 7,3B | 32k | Apache 2.0 | HuggingFace | Alternativa permisiva con buen rendimiento en inglés |
| Qwen2.5 7B Instruct | 7,6B | 128k | Apache 2.0 | HuggingFace, Alibaba | Multilingüe y con benchmarks publicados |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos introducidos por el finetune.
- Riesgo de alucinación inherente a los modelos de 8B, no mitigado ni evaluado en este finetune.
- La model card solo declara inglés; el multilingüismo del modelo base puede haberse degradado tras el ajuste.
- No hay benchmarks publicados, por lo que no se puede afirmar que el finetune mejore al modelo base en ninguna tarea.
- El checkpoint de partida está cuantizado en 4 bits (bnb-4bit); si el finetune se realizó sobre esa cuantización, puede arrastrar pérdida de precisión adicional.
- El tamaño del repo (0,2 GB) es anómalo para un modelo de 8B en safetensors completos; podría tratarse de un adaptador LoRA o de pesos parciales. Conviene verificar los archivos antes de usarlo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia comunitaria; la interacción entre ambas debe revisarse con cuidado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/xamiuz/xamiuz1.0)
- [Modelo base: unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo oficial Meta Llama 3.1 8B Instruct](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct)
