# vab46/llama-3.1-8b-instruct-lora-clinical_iter2_epoch2

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado sobre `meta-llama/Llama-3.1-8B-Instruct` mediante la librería PEFT. Lo publica el usuario vab46 y está especializado en ensayos clínicos: el adaptador se ha ajustado con el dataset "iter2 anchor-context-groundTruth_junkHandled", compuesto por pares de contexto recuperado (título, resumen, criterios de inclusión) y pregunta, mapeados con la plantilla de chat de Llama 3.1. Su objetivo declarado es responder consultas generales sobre ensayos clínicos (visión macro, elegibilidad de pacientes, operaciones) y servir como generador dentro de pipelines RAG sobre documentación de ensayos.

La relevancia de la ficha es doble. Por un lado, es un ejemplo típico de adaptador clínico de bajo coste: se apoya en un modelo base de 8.000 millones de parámetros, 4.096 dimensiones de representación y una ventana de contexto de 131.072 tokens (128K), y añade conocimiento de dominio mediante un único epoch de fine-tuning. Por otro, su huella es mínima (0,3 GB en el repositorio) frente a los aproximadamente 16 GB del modelo base en precisión completa, lo que lo hace desplegable sobre GPUs de consumo con cuantización de 4 bits. El repo tiene 0 descargas y 0 likes, no declara pipeline y no incluye métricas de evaluación.

Hay que subrayar que se trata de un artefacto experimental sin validación publicada: no se han facilitado benchmarks, no se especifican el rango del adaptador ni los módulos objetivo, y existe una discrepancia entre el nombre del repositorio (`..._epoch2`) y la model card, que indica "Total Epochs: 1". La licencia declarada en la tarjeta es la Licencia Comunitaria de Llama 3.1 de Meta, aunque el campo de licencia en los metadatos de HuggingFace aparece como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autoregresivo (decoder-only) con adaptador LoRA (PEFT) sobre Llama 3.1 8B Instruct |
| Parametros totales | 8.000 millones en el modelo base; adaptador: no disponible (repositorio de 0,3 GB, sin rango ni módulos objetivo especificados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens (128K) según la model card |
| Tipos de cuantizacion | 4 bits NF4 con doble cuantización vía `bitsandbytes` (ejemplo oficial de la model card); otras cuantizaciones del modelo base: no disponibles |
| Idiomas soportados | en (inglés), declarado en la model card |
| Licencia | llama3.1 (Licencia Comunitaria de Llama 3.1 de Meta, según la model card); el campo de licencia de HuggingFace indica "no disponible" |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base `meta-llama/Llama-3.1-8B-Instruct` |
| Tamano del repositorio | 0,3 GB |
| Dimension oculta | 4096 |
| Modalidad | texto |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only autorregresivo, con 4.096 dimensiones ocultas y una ventana de contexto de 131.072 tokens. Sobre ella se aplica un adaptador LoRA mediante PEFT, de modo que en inferencia hay que cargar primero el modelo base (opcionalmente en 4 bits con `BitsAndBytesConfig`) y después superponer los pesos del adaptador con `PeftModel.from_pretrained`. El tokenizador y la plantilla de chat son los del modelo base, y el flujo de inferencia documentado concatena un mensaje de sistema, un bloque de contexto recuperado (con `TITLE`, `SUMMARY`, `INCLUSION_CRITERIA`) y la pregunta del usuario.

El entrenamiento se realizó sobre el dataset "iter2 anchor-context-groundTruth_junkHandled", centrado en ensayos clínicos y formateado con plantillas de chat. Los hiperparámetros declarados son: tamaño de batch de entrenamiento 4, `gradient_accumulation_steps` 4 (batch efectivo de 16), 1 epoch, weight decay 0,01, learning rate 0,0002 y scheduler coseno con pasos de calentamiento (la model card se corta en ese punto). El directorio de salida fue `/kaggle/working/rag3_llama_lora`, lo que sugiere que el ajuste se ejecutó en un entorno Kaggle. No se documenta el rango del LoRA, los módulos objetivo (`q_proj`, `v_proj`, etc.), el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Tampoco se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y respuesta a preguntas sobre ensayos clínicos: visión general o macro del ensayo, criterios de elegibilidad de pacientes, aspectos operativos y de ejecución.
- Generación condicionada por contexto recuperado (RAG): el prompt de ejemplo integra bloques de contexto con título, resumen y criterios de inclusión, y el modelo responde a la pregunta planteada sobre ese material.
- Ingeniería de prompts específica para ensayos clínicos: la model card indica que el adaptador puede emplearse para construir o depurar prompts relacionados con CT (clinical trials).
- Comprensión de texto clínico estructurado: maneja campos como `TITLE`, `SUMMARY` e `INCLUSION_CRITERIA` dentro del contexto.
- Capacidades heredadas del modelo base Llama 3.1 8B Instruct (razonamiento general, generación de código, matemáticas, multilingüismo base), aunque el ajuste es monolingüe en inglés y no se documenta ninguna evaluación de estas capacidades tras el fine-tuning.
- Tool calling / function calling: no documentado en la model card; el modelo base lo soporta, pero no hay evidencia de que el adaptador lo preserve.
- Modo "thinking", visión o audio: no soportado (modalidad declarada: solo texto).
- Comportamiento agéntico multi-paso: no documentado.

## Casos de uso

- Asistente de preguntas y respuestas sobre protocolos de ensayos clínicos: el modelo recibe el texto del protocolo (título, resumen, criterios) como contexto y responde a preguntas concretas, por ejemplo cuál es el objetivo principal del ensayo, como muestra el ejemplo de la model card con el estudio WATCH-STEP.
- Componente generador de un pipeline RAG clínico: un recuperador extrae fragmentos de una base documental de ensayos y el adaptador sintetiza la respuesta citando el contexto; la ventana de 128K permite incluir muchos fragmentos en una sola llamada.
- Precribado de elegibilidad de pacientes: dado un conjunto de criterios de inclusión y exclusión y los datos de un paciente, el modelo puede redactar un borrador de evaluación que un investigador revisa después; es adecuado porque el ajuste se hizo precisamente sobre pares criterios-pregunta.
- Apoyo a la redacción de documentación regulatoria: generación de resúmenes de protocolo, sinopsis de ensayo o descripciones de objetivos a partir de material fuente, reduciendo el trabajo de redacción repetitiva.
- Extracción y resumen de información de literatura clínica: condensar abstracts y fichas de estudio en resúmenes estructurados (objetivo, población, intervención, criterios), útil en revisiones sistemáticas preliminares.
- Prototipado rápido de herramientas clínicas en investigación académica: al ser un adaptador de 0,3 GB sobre un modelo de 8B, permite iterar y comparar variantes de fine-tuning con coste de almacenamiento y despliegue muy bajo.
- Ingeniería de prompts y evaluación de estrategias RAG: usar el adaptador como generador de referencia para comparar formulaciones de prompt, tamaños de chunk o estrategias de recuperación en dominios clínicos.
- Formación y simulación: generar explicaciones divulgativas sobre en qué consiste un ensayo clínico y cómo se selecciona a los participantes, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (MMLU, HumanEval, GSM8K, MedQA ni ninguna otra), no se aporta comparación con el modelo base antes y después del ajuste, y el repositorio no tiene descargas ni validación de terceros.

## Requisitos de hardware

- VRAM estimada para el modelo base en 4 bits (NF4, doble cuantización, como en el ejemplo oficial): del orden de 6-8 GB, suficiente para GPUs de consumo de gama media-alta.
- VRAM estimada en 8 bits: aproximadamente 10-12 GB.
- VRAM estimada en FP16/BF16: aproximadamente 16-18 GB solo para los pesos, más memoria para caché KV y activaciones.
- El adaptador LoRA en sí ocupa muy poco (repositorio de 0,3 GB) y se suma a los requisitos del modelo base; no añade una carga significativa de memoria.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y superiores para 4 bits; RTX 3090, RTX 4090, RTX 5090 o equivalentes de 24 GB para FP16 con contexto moderado.
- GPUs de centro de datos: A100 40/80 GB, H100 80 GB, L40S o A6000 para servir el modelo con contexto largo (128K) y concurrencia.
- Con la ventana completa de 131.072 tokens, la caché KV crece de forma notable y puede requerir GPUs de 40-80 GB o técnicas de atención eficiente; no hay mediciones publicadas.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp/Ollama si se fusiona previamente el adaptador con el modelo base para exportar a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| vab46/llama-3.1-8b-instruct-lora-clinical_iter2_epoch2 | 8B (base) + adaptador LoRA de tamaño no especificado | 131.072 tokens | Adaptador PEFT sobre Llama 3.1 8B Instruct | llama3.1 según la model card (campo HF no disponible) | no disponible |
| meta-llama/Llama-3.1-8B-Instruct (modelo base) | 8B | 131.072 tokens | Transformer decoder-only | Licencia Comunitaria de Llama 3.1 | Resultados publicados por Meta en su model card; no comparados aquí |
| Otros adaptadores LoRA clínicos sobre Llama 3.1 8B | no disponible | no disponible | PEFT/LoRA | no disponible | no disponible |

La búsqueda web realizada no devolvió resultados relacionados con este modelo ni con adaptadores clínicos comparables, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ámbito muy restringido: el ajuste se hizo sobre un único dataset de ensayos clínicos en inglés; fuera de ese dominio es esperable una degradación del comportamiento respecto al modelo base.
- Idioma: solo inglés declarado; no hay garantía de un rendimiento aceptable en castellano u otros idiomas sin evaluación adicional.
- Riesgo de alucinación: al ser un modelo generativo aplicado a un dominio de alta criticidad, puede producir afirmaciones plausibles pero incorrectas sobre criterios de elegibilidad, dosis o resultados. Cualquier salida debe ser revisada por personal cualificado.
- Sin validación: 0 descargas, 0 likes, ausencia de benchmarks y de evaluación clínica. No hay evidencia publicada de su calidad frente al modelo base.
- Discrepancia en la configuración: el nombre del repositorio indica `epoch2` mientras la model card declara 1 epoch; conviene verificar qué checkpoint se está usando.
- Documentación incompleta: la model card se corta en los hiperparámetros (warmup steps), no indica rango del LoRA, módulos objetivo, número de tokens de entrenamiento ni composición exacta del dataset.
- Licencia: aunque la tarjeta menciona la Licencia Comunitaria de Llama 3.1, los metadatos de HuggingFace no declaran licencia. El uso comercial queda sujeto a los términos de Meta y a la aceptación de su acuerdo; conviene revisarlos antes de cualquier despliegue en producción.
- Sesgos: no se documenta ningún análisis de sesgos, representatividad demográfica ni mitigación de sesgos clínicos.
- Producción: no hay información sobre estabilidad, latencia, throughput ni comportamiento con contextos largos (128K) más allá de la especificación teórica del modelo base.
- Uso clínico directo: no debe emplearse para decisiones diagnósticas o terapéuticas sin supervisión profesional; el propio autor lo plantea como apoyo a preguntas y generación dentro de RAG.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vab46/llama-3.1-8b-instruct-lora-clinical_iter2_epoch2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento citado en la model card: https://huggingface.co/vab46/llama-3.1-8b-instruct-lora-clinical_iter2/tree/main/vab46/Clinical_trials_anchor-contextORpositive-ground-truth_LLM_LORA-junk_handled_ft
- Repositorio del adaptador relacionado: https://huggingface.co/vab46/llama-3.1-8b-instruct-lora-clinical_iter2
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Documentación de PEFT: https://huggingface.co/docs/peft
- Repositorio de Transformers en GitHub: https://github.com/huggingface/transformers
- Hub de adaptadores PEFT: https://huggingface.co/models?library=peft
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (los resultados obtenidos correspondían a un sitio de seguros sin relación con el modelo); no hay papers, blogs ni demos adicionales que enlazar.
