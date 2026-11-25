# Tamarillo/ai-text-forensics-guard-base-en

## Resumen

Tamarillo/ai-text-forensics-guard-base-en es un clasificador binario de texto en inglés diseñado para detectar si un fragmento ha sido generado por una IA o escrito por un humano. Lo desarrolla Tamarillo, un proyecto independiente que publica una suite de modelos abiertos orientados a seguridad, forense digital y observabilidad de sistemas con agentes. El modelo se construye sobre answerdotai/ModernBERT-large, un transformer encoder de 395.833.346 parámetros, y se distribuye con licencia Apache-2.0 bajo la librería estándar transformers, sin necesidad de `trust_remote_code`.

El problema que aborda es concreto: los detectores abiertos más descargados en Hugging Face truncan el contexto a 512-768 tokens, dependen de código personalizado para cargarse y presentan tasas elevadas de falsos positivos sobre texto humano escrito por no nativos en inglés (ESL). Este modelo entrena con contexto de 2.048 tokens y soporta 8.192 tokens nativos vía RoPE, incluye exportaciones ONNX FP32 y FP16 verificadas por paridad y ofrece umbrales calibrados (thr_5fpr_val=0.29543, thr_1fpr_val=0.85416) para operar en producción.

Su relevancia actual viene del auge de pipelines con agentes y salidas RAG: detectar si un transcript, un informe o una respuesta de agente es sintético se ha vuelto una necesidad de observabilidad y control de calidad. El modelo está pensado como guardrail, no como oráculo: declara explícitamente sus límites de idioma (solo inglés) y su calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), `ModernBertForSequenceClassification` |
| Parametros totales | 395.833.346 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens entrenados; 8.192 tokens nativos vía RoPE |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 (paridad verificada); cuantizaciones GGUF no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, `onnx/model_fp16.onnx`) |
| Etiquetas de salida | `0=human`, `1=ai_generated` |
| Umbrales calibrados | thr_5fpr_val=0.29543, thr_1fpr_val=0.85416; temperatura T=1.0028 |
| Librería | transformers >= 4.48 (soporte nativo ModernBERT, sin `trust_remote_code`) |
| Tamaño del repositorio | 4.0 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large adaptado a clasificación de secuencias con dos etiquetas. ModernBERT incorpora atención con RoPE, lo que permite extender el contexto más allá de los 2.048 tokens vistos en entrenamiento hasta 8.192 tokens nativos, y prescinde de sesgo en las proyecciones lineales, lo que reduce parámetros y mejora el rendimiento en hardware moderno. La cabeza de clasificación produce logits para `human` y `ai_generated`, y el autor publica un `calibration.json` con temperatura de escalado (T=1.0028) y umbrales operativos para tasas de falsos positivos del 5 % y del 1 %.

El entrenamiento se apoya en los datasets liamdugan/raid y yaful/MAGE, dos corpus de referencia para detección de texto generado por máquina. La model card describe un esfuerzo explícito por evitar atajos de formato: en RAID, el 0,0 % de los textos humanos contiene saltos de párrafo `\n\n`, mientras que entre el 58 % y el 78 % de los textos de IA sí los incluyen, y los detectores entrenados de forma ingenua memorizan esa señal y marcan erróneamente al 49,5 % de ensayos humanos de IELTS (ESL). El modelo se evalúa además contra LLMs abiertos disjuntos de 2025-2026 (Qwen3-4B y DeepSeek-R1-Distill-Llama-8B) como conjunto fuera de distribución. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Clasificación binaria de texto en inglés: `human` frente a `ai_generated`, con probabilidad calibrada.
- Detección de salidas de agentes y de texto sintético en contextos largos (hasta 2.048 tokens entrenados, 8.192 nativos), útil para transcripts y respuestas RAG.
- Umbrales operativos precalculados para 5 % y 1 % de falsos positivos, lo que permite ajustar el punto de operación sin recalibrar.
- Inferencia en CPU y edge mediante ONNX Runtime, y en navegador o Node.js mediante Transformers.js (`@huggingface/transformers>=3.5.1`) con `dtype: "fp16"`.
- Integración con Text Embeddings Inference y endpoints compatibles, según los tags del repositorio.
- Sin soporte de tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Guardrail en pipelines de agentes: clasificar cada respuesta de un agente antes de mostrarla o registrarla, usando el umbral de 1 % de FPR para minimizar bloqueos de contenido humano legítimo.
- Observabilidad de sistemas RAG: detectar cuándo una respuesta atribuida a una fuente documental es en realidad texto sintético generado por el modelo, con contexto suficiente para cubrir fragmentos largos.
- Moderación de contenido en plataformas: filtrar envíos sospechosos de ser generados por IA en inglés, con la salvedad de revisar la tasa de falsos positivos sobre usuarios no nativos.
- Auditoría forense de documentos: analizar informes, correos o publicaciones largas en busca de continuaciones sintéticas que los detectores de 512 tokens no capturan.
- Control de calidad en datasets: etiquetar corpus para entrenamiento y detectar contaminación por texto generado, apoyándose en el rendimiento fuera de distribución declarado sobre LLMs recientes.
- Despliegue en navegador o edge: usar la exportación ONNX FP16 con Transformers.js para clasificar texto localmente sin enviar datos a un servidor, útil en herramientas de privacidad.
- Filtrado previo en pipelines de anotación humana: priorizar muestras sospechosas para revisión manual, reduciendo el coste de auditoría.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea / dataset | Métrica | Valor |
|---|---|---|
| AI-Generated Text & Agent Output Forensics (OOD: Qwen3-4B + DeepSeek-R1-Distill-Llama-8B, 2025-2026) | ROC-AUC | 0.9996 |
| AI-Generated Text & Agent Output Forensics (mismo conjunto) | TPR@5%FPR | 1.0 |
| AI-Generated Text & Agent Output Forensics (mismo conjunto) | Macro-F1 | 0.9866 |
| Non-Native English (ESL) Human False-Positive Audit (chillies/ielts-writing-task2-essays, 100 % humano, OOD) | FPR @ 0.50 | 0.0958 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 1,6 GB solo para pesos (396 M de parámetros), más activaciones; cómodo en cualquier GPU con 4 GB o más.
- VRAM estimada en FP16: en torno a 0,8 GB para pesos; cabe en GPUs integradas y en la mayoría de portátiles.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para lotes grandes, cualquier GPU consumer (RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en CPU y en navegador vía WASM.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (CPU/edge), Transformers.js (navegador/Node.js), Text Embeddings Inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tamarillo/ai-text-forensics-guard-base-en | 396 M | 2.048 entrenados / 8.192 RoPE | Apache-2.0 | safetensors, ONNX | Sin `trust_remote_code`, umbrales calibrados, auditoría ESL publicada |
| desklib/ai-text-detector-v1.01 | no disponible | 512-768 (truncado) | no disponible | no disponible | Requiere subclase personalizada; sin `id2label` ni ONNX; FPR del 49,5 % en IELTS ESL según la model card de Tamarillo |
| Detectores basados en RoBERTa/DeBERTa | ~125-435 M | 512-768 | variable | safetensors | Truncan contexto; AUC de 0,50-0,54 en la prueba de cola larga según la model card de Tamarillo |

Los datos de los modelos comparables proceden de la propia model card del autor y no se han verificado de forma independiente.

## Limitaciones y advertencias

- Solo inglés: no se declara soporte de otros idiomas, por lo que su uso en castellano u otras lenguas no está validado.
- Tasa de falsos positivos del 9,58 % sobre ensayos humanos de IELTS (ESL) al umbral 0,50; conviene usar umbrales más conservadores (thr_1fpr_val=0.85416) en contextos con usuarios no nativos.
- Riesgo de alucinación no aplica como tal (es un clasificador), pero sí de clasificación errónea: textos humanos formales o muy estructurados pueden puntuar alto como IA.
- Los resultados de benchmarks son declarados por el autor y están marcados como no verificados; no hay evaluación independiente publicada.
- La detección de texto generado por IA es un problema adversario: modelos nuevos o texto parafraseado pueden evadir el detector.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no representados en RAID o MAGE.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La fecha de creación (2026-11-25) es posterior a la de esta ficha; conviene verificar la vigencia de los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/ai-text-forensics-guard-base-en
- Organización Tamarillo: https://huggingface.co/Tamarillo
- Demo en navegador (Space): https://huggingface.co/spaces/Tamarillo/ai-text-forensics-guard-demo
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset RAID: https://huggingface.co/datasets/liamdugan/raid
- Dataset MAGE: https://huggingface.co/datasets/yaful/MAGE
- Dataset de ensayos ESL: https://huggingface.co/datasets/chillies/ielts-writing-task2-essays
