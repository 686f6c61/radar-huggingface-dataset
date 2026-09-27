# strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-WIKI-Instruct-r64-last-full-epoch

## Resumen

El modelo `strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-WIKI-Instruct-r64-last-full-epoch` no es un modelo completo, sino un adaptador LoRA entrenado con la librería PEFT sobre el modelo base `meta-llama/Llama-3.1-8B`. El repositorio ocupa 0,7 GB y contiene pesos de adaptador en formato safetensors, no pesos completos, por lo que para usarlo hay que cargar el modelo base y aplicar el adaptador encima (o fusionarlo). Fue publicado por el usuario `strongpear` y, en el momento de redactar esta ficha, acumula 0 descargas y 0 valoraciones.

El nombre del repositorio es la única fuente de información sobre su propósito: sugiere un ajuste fino orientado a generación aumentada por recuperación (RAFT, *Retrieval-Augmented Fine-Tuning*), con prompts que incluirían 5 documentos de contexto (`5DOCS`), una mezcla de datos (`PMIX`) con proporción 80 (`P80`), datos de tipo wiki (`A-WIKI`), sobre la variante Instruct del base y con rango LoRA 64 (`r64`), guardando el checkpoint del último epoch completo (`last-full-epoch`). Ninguna de estas interpretaciones está confirmada por el autor.

La relevancia de esta ficha es limitada y hay que ser explícito: la *model card* publicada es la plantilla por defecto de HuggingFace sin rellenar, con todos los campos marcados como `[More Information Needed]`. No hay datos de entrenamiento, hiperparámetros, evaluación ni licencia declarada para el adaptador. Se trata, por tanto, de un artefacto de investigación reproducible solo parcialmente y no apto para producción sin una validación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer decoder-only; modelo base: Llama 3.1 8B |
| Parámetros totales | No disponible para el adaptador (estimación propia: en torno a 180 M de parámetros entrenables si el rango 64 se aplica a todas las proyecciones lineales). Modelo base: 8.030 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador. Modelo base: 128.000 tokens |
| Tipos de cuantización | No disponible en el repositorio del adaptador. El modelo base admite fp16/bf16, int8 y cuantizaciones de 4 bits (GGUF, AWQ, GPTQ) mediante herramientas de la comunidad |
| Idiomas soportados | No disponible. El modelo base declara soporte oficial para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible para el adaptador. El modelo base se distribuye bajo la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA (r) | 64 (deducido del nombre del repositorio, no confirmado en la model card) |
| Alpha de LoRA | No disponible |
| Módulos objetivo | No disponible |
| Versión de PEFT | 0.20.0 (indicada en el README) |
| Tamaño del repositorio | 0,7 GB |
| Fecha de creación registrada | 2026-09-26 |
| Fecha de última actualización registrada | 2026-09-26 |

Nota: los datos marcados como «modelo base» corresponden a la documentación pública de `meta-llama/Llama-3.1-8B` y no están verificados en el repositorio del adaptador. Los campos marcados como «no disponible» no aparecen en la información consultada.

## Arquitectura y entrenamiento

El adaptador se apoya en Llama 3.1 8B, un transformer decoder-only de 32 capas, dimensión oculta 4096 y 8.030 millones de parámetros, que emplea RoPE para codificación posicional, SwiGLU como activación en el bloque feed-forward, RMSNorm y atención con consultas agrupadas (GQA) con 8 cabezas KV. El modelo base fue entrenado por Meta sobre aproximadamente 15 billones de tokens, con una ventana de contexto de 128.000 tokens y un corte de conocimiento declarado en diciembre de 2023. El adaptador no modifica esta arquitectura: añade matrices de bajo rango sobre las proyecciones del modelo congelado.

Los detalles de entrenamiento del adaptador no están documentados. La model card no incluye régimen de precisión, número de pasos, dataset, hiperparámetros, composición de la mezcla `PMIX` ni procedimiento de alineación (RLHF/DPO). Por el nombre del repositorio puede inferirse un ajuste tipo RAFT —que combina ejemplos con documentos relevantes y distractores para enseñar al modelo a ignorar contexto irrelevante en tareas de RAG— con 5 documentos por prompt y un muestreo de mezcla del 80 %, pero se trata de una conjetura basada en la nomenclatura, no de un dato confirmado.

## Capacidades

- Generación de texto autoregresiva en la variante Instruct del modelo base, con soporte multi-turno.
- Respuesta sobre contexto documental: el ajuste aparente tipo RAFT apunta a mejorar el uso de documentos recuperados y a tolerar distractores en la ventana de contexto.
- Razonamiento de propósito general y matemáticas básicas, heredados del modelo base (no medidos para el adaptador en este repositorio).
- Generación de código, heredada del modelo base; sin evaluación específica del adaptador.
- Soporte de *tool calling* y *function calling*: el modelo base Llama 3.1 dispone de plantillas oficiales de llamada a herramientas; se desconoce si el ajuste del adaptador preserva o degrada esta capacidad.
- Capacidades de agente multi-paso: no documentadas para el adaptador; el modelo base admite flujos de agente con formato de chat.
- Multilingüismo: no documentado para el adaptador; el base declara 8 idiomas oficiales, con calidad claramente inferior fuera del inglés.
- Capacidades especiales (modo «thinking», visión, audio): no disponibles; el modelo base es exclusivamente de texto.

## Casos de uso

- Generación aumentada por recuperación sobre documentación técnica: el adaptador parece diseñado para recibir varios documentos recuperados y responder citando o sintetizando su contenido, tolerando fragmentos irrelevantes dentro del contexto.
- Asistentes internos sobre bases de conocimiento tipo wiki: dado el sufijo `A-WIKI` del nombre, el escenario natural es responder preguntas sobre artículos enciclopédicos o wikis corporativas con contexto recuperado.
- Atención al cliente con base documental: combinando un recuperador con el modelo base más este adaptador, se pueden gestionar conversaciones multi-turno donde las respuestas deban ceñirse a manuales o políticas internas.
- Búsqueda semántica con respuesta extractiva: resumir y extraer datos concretos de un conjunto de 5 documentos por consulta, formato que el nombre del adaptador sugiere como distribución de entrenamiento.
- Evaluación comparativa de técnicas de ajuste para RAG: sirve como punto de partida reproducible para medir si un ajuste RAFT mejora sobre el prompt directo en tareas de pregunta-respuesta con contexto.
- Prototipado de investigación en ajuste eficiente de parámetros: al ser un adaptador LoRA de 0,7 GB, permite probar la fusión y el despliegue sobre el base sin reentrenar el modelo completo.
- Pipelines de resumen de documentación larga: aprovechando la ventana de 128.000 tokens del base, el adaptador podría emplearse para condensar expedientes extensos, aunque no hay evaluación que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye ninguna sección de evaluación cumplimentada (todas las métricas figuran como `[More Information Needed]`), y el autor no aporta comparaciones con el modelo base ni con otros adaptadores. Tampoco hay datos de latencia o *throughput*.

## Requisitos de hardware

- Las cifras siguientes son estimaciones para el tándem adaptador + Llama 3.1 8B y dependen del backend; el adaptador por sí solo no es ejecutable sin el modelo base.
- VRAM estimada en inferencia con el modelo base en bf16/fp16: en torno a 16-17 GB de pesos, más caché KV (la ventana de 128.000 tokens puede consumir decenas de GB adicionales si se llena).
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente a contexto completo; L40S, RTX 6000 Ada o RTX 4090 (24 GB) para uso individual en bf16 con contexto moderado; RTX 3090 o RTX 4080 (16-24 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en 4 bits cabe en tarjetas de 8 GB; en 8 bits requiere 12 GB o más; en bf16 requiere 20-24 GB.
- Opciones de despliegue: transformers con PEFT (carga del adaptador y fusión con `merge_and_unload`), vLLM con soporte LoRA, Text Generation Inference, llama.cpp u Ollama, estas dos últimas requiriendo convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Este adaptador (RAFT sobre Llama 3.1 8B) | Adaptador LoRA r64 sobre 8.030 M del base | No especificado (base: 128.000 tokens) | No disponible (base: Llama 3.1 Community License) | HuggingFace, 0 descargas | No disponible |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | Publicado por Meta en su model card |
| Mistral-7B-Instruct-v0.3 | 7.250 M | 32.000 tokens | Apache 2.0 | HuggingFace | Publicado por Mistral |
| Qwen2.5-7B-Instruct | 7.610 M | 128.000 tokens (32.768 en generación práctica) | Apache 2.0 (la mayoría de variantes) | HuggingFace | Publicado por Alibaba |

La comparación es asimétrica: los tres modelos alternativos son pesos completos con licencia declarada y evaluaciones publicadas, mientras que este repositorio es un adaptador sin documentación ni métricas. Las cifras de parámetros y contexto de las alternativas proceden de su documentación pública.

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación, sesgos ni uso previsto, lo que impide auditar el adaptador.
- No se declara licencia para el adaptador. Al derivar de Llama 3.1, el uso comercial queda sujeto a la Llama 3.1 Community License de Meta, que impone condiciones de atribución y restricciones de uso.
- Riesgo de alucinación: no existe ninguna evaluación publicada que mida la fidelidad a los documentos recuperados, precisamente el comportamiento que un ajuste RAFT pretende mejorar.
- La ventana de contexto útil para RAG depende del recuperador y del número de documentos inyectados; sin evaluación, no puede garantizarse que el modelo ignore distractores en producción.
- Sesgos: desconocidos para el adaptador; hereda los sesgos del corpus del modelo base, no auditados aquí.
- Idiomas: no documentados. Si el ajuste se hizo sobre datos wiki en inglés, es probable un deterioro adicional en castellano respecto al modelo base.
- El repositorio registra 0 descargas y 0 valoraciones, y las fechas de creación y actualización aparecen como 2026-09-26, lo que resulta anómalo; conviene verificar la integridad y el origen del artefacto antes de usarlo.
- Es un adaptador, no un modelo autónomo: requiere descargar el modelo base, aplicar PEFT y, si se desea servir con llama.cpp u Ollama, fusionar y convertir los pesos.
- El rango LoRA y los módulos objetivo no están confirmados; el nombre sugiere r=64, pero un error en la carga (por ejemplo, aplicar el adaptador a módulos distintos) produciría resultados silenciosamente incorrectos.
- No se recomienda su uso en producción sin una evaluación propia en el dominio objetivo y una comparación explícita contra el modelo base sin ajustar.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-WIKI-Instruct-r64-last-full-epoch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base (variante Instruct): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Artículo de Llama 3.1 (The Llama 3 Herd of Models): https://arxiv.org/abs/2407.21783
- Referencia probable del método RAFT citado en el nombre del repositorio (no confirmada por el autor): https://arxiv.org/abs/2403.10131
- Librería PEFT: https://github.com/huggingface/peft
- Calculadora de impacto de carbono citada en el README (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora asociada: https://mlco2.github.io/impact
