# SwetieePawsss/Llama-3.1-8B-Instruct-DUET-LoRA-merged

## Resumen

Llama-3.1-8B-Instruct-DUET-LoRA-merged es un ajuste fino supervisado del modelo meta-llama/Llama-3.1-8B-Instruct realizado por el usuario SwetieePawsss sobre el conjunto de datos DUET, un corpus orientado a la investigación del *unlearning* (olvido selectivo de hechos). El adaptador LoRA (rango 32, alpha 64) se ha fusionado dentro de los pesos base en bf16, por lo que el repositorio distribuye un checkpoint denso estándar de 8.030.261.248 parámetros, cargable directamente con `transformers` sin necesidad de aplicar el adaptador en tiempo de ejecución.

El modelo no es un producto generalista: es un artefacto de investigación asociado al artículo "Anatomy of Unlearning: The Dual Impact of Fact Salience and Model Fine-Tuning" (Findings de ACL 2026), que estudia cómo la saliencia de un hecho y el propio proceso de ajuste fino condicionan la eficacia y los efectos colaterales del olvido. Se entrena sobre la partición `city_full` de una versión temprana de DUET (2025), cuyas preguntas coinciden con DUET v1.0 salvo limpieza textual menor.

Su relevancia es metodológica: permite reproducir experimentos de unlearning sobre una base Llama 3.1 Instruct, sirve como línea base de comparación frente a otros métodos de desaprendizaje y ejemplifica el flujo de trabajo de fusionar un adaptador LoRA para obtener un checkpoint desplegable con infraestructura estándar. El repo presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de la comunidad. El modelo solo declara inglés y hereda la licencia Llama 3.1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1), con GQA, RoPE y SwiGLU; 32 capas, dimensión oculta 4096, 32 cabezas de atención y 8 cabezas KV |
| Parametros totales | 8.030.261.248 (8,03 B), confirmado en los safetensors del repo |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredados de Llama 3.1-8B-Instruct; la model card del ajuste no lo especifica |
| Tipos de cuantizacion | no disponibles en el repositorio: solo se publican pesos bf16. Convertible a GGUF (Q8_0, Q5_K_M, Q4_K_M), AWQ y GPTQ con herramientas estándar |
| Idiomas soportados | en (inglés), según el campo `language` de la model card |
| Licencia | llama3.1 (Llama 3.1 Community License), con Llama 3.1 Acceptable Use Policy |
| Formato de pesos | safetensors en bf16; tamaño del repo 16,1 GB |
| Vocabulario | 128.256 tokens (heredado del modelo base) |
| Tag de despliegue | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1-8B-Instruct: un transformer decoder-only denso con normalización RMSNorm pre-atención, activación SwiGLU en el FFN, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA) de 32 cabezas de consulta y 8 cabezas clave/valor, lo que reduce el coste de la caché KV frente a atención multi-cabeza completa. No hay innovaciones arquitectónicas propias en este ajuste: el cambio respecto al modelo base es exclusivamente de pesos.

El entrenamiento consistió en un ajuste fino con LoRA sobre la partición `city_full` de la versión 2025 del dataset DUET, con los siguientes hiperparámetros declarados: rango 32, alpha 64, tasa de aprendizaje 2e-4, planificador coseno, 3 épocas y semilla 0. El adaptador resultante se fusionó en los pesos base (`merge_and_unload`), de modo que el checkpoint final es un modelo denso convencional en bf16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO posteriores al ajuste supervisado. El trabajo asociado estudia la interacción entre la saliencia de los hechos y el ajuste fino en el contexto del olvido selectivo, pero la model card no aporta métricas ni detalles del pipeline de evaluación.

## Capacidades

- Generación de texto conversacional en inglés con la plantilla de chat de Llama 3.1 (`tokenizer.apply_chat_template`).
- Respuesta a instrucciones multi-turno, heredada del ajuste Instruct original de Meta.
- Comportamiento modificado por el ajuste en DUET: el modelo está entrenado sobre pares del corpus de unlearning, por lo que su política de respuesta ante hechos concretos puede diferir de la del modelo base.
- Razonamiento y matemáticas básicas: capacidades heredadas del base, no verificadas ni documentadas para este checkpoint.
- Tool calling / function calling: el modelo base Llama 3.1 lo soporta mediante formato de prompt; no hay evidencia en la información disponible de que este ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Multilingüismo: limitado a inglés según la model card, aunque los pesos base contienen capacidad multilingüe residual no evaluada aquí.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como referencia reproducible del método DUET sobre Llama 3.1-8B-Instruct, comparando la tasa de olvido de hechos de la partición `city_full` frente al modelo base sin ajustar.
- Evaluación de efectos colaterales del ajuste fino: medir la degradación en tareas generales (comprensión lectora, sentido común, matemáticas) para cuantificar el coste del olvido selectivo sobre las capacidades del modelo original.
- Reproducibilidad de experimentos: al estar el adaptador fusionado, cualquier laboratorio puede cargar el checkpoint con `transformers` y obtener resultados idénticos sin depender de versiones de PEFT ni de la gestión de adaptadores.
- Docencia y divulgación técnica: ejemplo didáctico de flujo completo LoRA → merge → publicación en HuggingFace, con hiperparámetros documentados (rango 32, alpha 64, 3 épocas).
- Auditoría de contaminación de benchmarks: dado que las preguntas del split coinciden con DUET v1.0 salvo limpieza textual, sirve para estudiar cómo el solapamiento entre entrenamiento y evaluación infla métricas de unlearning.
- Pruebas de robustez y red-teaming: sondear si el modelo filtra información supuestamente olvidada mediante reformulaciones, idiomas distintos del inglés o ataques de jailbreak, aprovechando su ventana de 128.000 tokens.
- Línea base de infraestructura: como checkpoint denso de 8 B en bf16, es útil para medir latencia y throughput de referencia en vLLM o TGI antes de introducir técnicas de optimización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de eficacia de olvido (por ejemplo, tasas de acierto sobre los hechos objetivo o sobre el conjunto de retención), y el repositorio no enlaza una tabla de resultados del artículo. Tampoco se documentan comparaciones con el modelo base ni con otros métodos de unlearning.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 16,1 GB solo para pesos, más caché KV y activaciones; presupuesto realista de 18-20 GB para contextos moderados.
- Caché KV: con GQA de 8 cabezas KV y dimensión de cabeza 128, cada token consume unos 128 KiB en bf16 (32 capas × 2 tensores × 8 × 128 × 2 bytes). A 8.192 tokens de contexto son ~1 GiB; a 128.000 tokens, ~16 GiB adicionales.
- GPU recomendadas en bf16: NVIDIA A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB; también cabe en RTX 4090 de 24 GB con contextos cortos y batch pequeño.
- Cuantización de 8 bits: ~8,5 GB de pesos, viable en RTX 4080/4090, A10G 24 GB y L4 24 GB.
- Cuantización de 4 bits (NF4, GPTQ o GGUF Q4_K_M): ~5-6 GB de pesos, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y GPUs consumer de gama media con contexto reducido.
- Consumer GPU: sí, en 4 bits de forma holgada y en bf16 en RTX 4090/3090 con contexto limitado.
- Opciones de despliegue: `transformers` (ruta directa, sin PEFT porque el adaptador está fusionado), vLLM, Text Generation Inference (el repo incluye el tag `text-generation-inference`), y llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-LoRA-merged | 8,03 B (denso) | 128.000 (heredado) | Unlearning sobre DUET, checkpoint fusionado | Llama 3.1 | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B (denso) | 128.000 | Asistente generalista con soporte de tool calling | Llama 3.1 | HuggingFace, ampliamente validado |
| Modelos de unlearning tipo Who's Harry Potter (WHP) | ~1,5-8 B según variante | Depende del base | Olvido de una entidad concreta por ajuste con token especial | Según modelo base | Públicos en HuggingFace |
| Otros ajustes LoRA fusionados sobre Llama 3.1 8B | 8,03 B (denso) | 128.000 | Dominio específico (legal, médico, código) | Llama 3.1 | Variables |

La comparación cuantitativa de rendimiento no está disponible: no existen métricas publicadas para este checkpoint que permitan situarlo frente al modelo base ni frente a otros métodos de unlearning en términos de olvido, retención o degradación de capacidades generales.

## Limitaciones y advertencias

- Sesgos: hereda íntegramente los sesgos de Llama 3.1-8B-Instruct; no se ha realizado ninguna evaluación de sesgo específica sobre este ajuste.
- Alucinación: el ajuste sobre un corpus de preguntas y respuestas sobre hechos puede incrementar la confianza en respuestas incorrectas sobre las entidades trabajadas; no hay evaluación de calibración publicada.
- Idioma: la model card declara únicamente inglés. El comportamiento en castellano no está validado y los pesos base pueden responder en otros idiomas con calidad impredecible.
- Contaminación de evaluación: las preguntas del split de entrenamiento coinciden con DUET v1.0 salvo limpieza textual menor, de modo que usar este checkpoint como "modelo olvidado" en una evaluación con DUET v1.0 produciría fuga de datos y métricas infladas.
- Naturaleza efímera del olvido: el unlearning por ajuste fino es reversible en la práctica; la información puede recuperarse mediante prompts adversariales, fine-tuning posterior o ataques de extracción. No debe tratarse como garantía de borrado.
- Licencia: se rige por la Llama 3.1 Community License. Requiere conservar los avisos de Meta, cumple la cláusula de mención "Built with Llama" y está sujeto a la Acceptable Use Policy; la licencia no es OSI y añade condiciones para usos a gran escala. El uso comercial está permitido con esas condiciones, pero conviene revisarlas antes de producción.
- Validación comunitaria nula: 0 descargas y 0 likes; el checkpoint no ha sido replicado ni auditado por terceros.
- Metadatos incompletos: no se documentan tokens de entrenamiento, composición del dataset, evaluación de olvido ni comparación con el modelo base. El identificador arXiv del artículo (2602.19612) y la fecha de creación del repo (2026-10-23) corresponden a los metadatos publicados.
- El adaptador está fusionado de forma irreversible: no es posible recuperar el adaptador LoRA original desde este repo para reaplicarlo sobre otro base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SwetieePawsss/Llama-3.1-8B-Instruct-DUET-LoRA-merged
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET
- Colección "DUET: Anatomy of Unlearning": https://huggingface.co/collections/SwetieePawsss/duet-anatomy-of-unlearning-6adbb5695dfb6f3e25293251
- Artículo en ACL Anthology: https://aclanthology.org/2026.findings-acl.1287/
- Artículo en arXiv: https://arxiv.org/abs/2602.19612
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Política de uso aceptable Llama 3.1: https://www.llama.com/llama3_1/use-policy/
