# Tamarillo/ai-text-forensics-guard-tiny-en

## Resumen

Tamarillo/ai-text-forensics-guard-tiny-en es un clasificador de texto encoder-only de 32 millones de parámetros diseñado para detectar texto generado por IA y trazas de salida de agentes. Lo desarrolla Tamarillo, autor de una suite de modelos abiertos orientados a seguridad y forense de contenido, y se distribuye bajo licencia Apache-2.0. El modelo resuelve un problema concreto de producción: los detectores de texto IA más descargados en Hugging Face truncan el contexto a 512-768 tokens, dependen de código remoto no estándar o memorizan atajos de formato (como los saltos de párrafo `\n\n`) que disparan falsos positivos sobre texto humano real, especialmente en hablantes no nativos de inglés.

La arquitectura es un encoder ModernBERT (clase estándar `ModernBertForSequenceClassification`, sin `trust_remote_code`) construido sobre el modelo base jhu-clsp/ettin-encoder-32m. Ofrece una ventana entrenada de 2.048 tokens y 8.192 tokens nativos vía RoPE, lo que permite clasificar documentos largos, salidas de RAG y transcripciones de agentes sin truncar. La salida es binaria (`0 = human`, `1 = ai_generated`) con umbrales de calibración publicados.

Su relevancia actual radica en el despliegue en el borde: exporta pesos ONNX en FP32 y FP16 con paridad verificada y funciona en navegador mediante Transformers.js, además de soportar Text Embeddings Inference y endpoints compatibles. Es, por tanto, un componente de guardarraíl ligero para pipelines de observabilidad y moderación donde el coste por inferencia y la latencia importan.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder-only (`ModernBertForSequenceClassification`) |
| Parámetros totales | 32.031.746 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens entrenados; 8.192 tokens nativos vía RoPE |
| Tipos de cuantización | ONNX FP32 y ONNX FP16 (paridad verificada); pesos safetensors en el repo |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo ModernBERT con 32 millones de parámetros, inicializado desde jhu-clsp/ettin-encoder-32m y ajustado como clasificador de secuencias con dos etiquetas. Usa la implementación nativa de `transformers` (versión 4.48 o superior), sin código remoto, lo que simplifica la carga y la auditoría en producción. La ventana de entrenamiento es de 2.048 tokens, ampliable a 8.192 mediante RoPE nativo, lo que lo diferencia de los detectores basados en RoBERTa/DeBERTa limitados a 512-768 tokens.

El ajuste se realizó sobre los conjuntos de datos liamdugan/raid y yaful/MAGE. La model card documenta explícitamente el problema de los atajos de formato: en RAID, el 0,0 % de los textos humanos contiene saltos de párrafo dobles, frente al 58-78 % de los textos de IA, de modo que un detector entrenado de forma ingenua aprende la regla `\n\n -> AI` y marca erróneamente el 49,5 % de ensayos humanos reales de IELTS de hablantes no nativos. El autor incluye una auditoría específica de falsos positivos sobre ESL como parte de la evaluación. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador).

## Capacidades

- Clasificación binaria de texto: distingue entre texto humano (`0`) y texto generado por IA (`1`), con probabilidades calibradas (temperatura T = 1,0598) y umbrales publicados (`thr_5fpr_val = 0,52878`, `thr_1fpr_val = 0,92523`).
- Detección de salidas de agentes y texto sintético en documentos largos, informes, salidas de RAG y transcripciones multi-turno, gracias a la ventana de 2.048 tokens entrenados y 8.192 nativos.
- Forense de procedencia de contenido: orientado a observabilidad y guardarraíles en pipelines que mezclan contenido humano y generado.
- Inferencia en el borde: exportaciones ONNX FP32 y FP16 con paridad verificada, ejecutables en CPU con ONNX Runtime.
- Inferencia en navegador y Node.js mediante Transformers.js (`@huggingface/transformers` >= 3.5.1).
- Compatibilidad con Text Embeddings Inference y endpoints compatibles.
- No soporta tool calling, function calling, generación de texto, razonamiento multi-paso, visión ni audio: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Moderación y guardarraíles en plataformas de contenido: el modelo clasifica envíos de usuarios en tiempo real y, con el umbral `thr_5fpr_val`, mantiene una tasa de falsos positivos baja sobre texto humano legítimo, lo que reduce las retiradas erróneas en flujos de publicación abiertos.
- Observabilidad de pipelines de agentes: se inserta como paso de auditoría sobre las trazas de salida de un agente (respuestas, resúmenes, logs generados) para etiquetar qué fragmentos son sintéticos, aprovechando la ventana de 2.048 tokens para cubrir transcripciones completas sin truncar.
- Detección en documentos largos y salidas de RAG: informes, actas o respuestas de recuperación aumentada que superan los 512-768 tokens de los detectores clásicos pueden clasificarse completos, evitando el truncamiento que degrada la AUC en la cola larga.
- Protección de integridad académica en contextos ESL: la auditoría de falsos positivos sobre ensayos IELTS de hablantes no nativos permite desplegarlo con revisión humana y umbrales conservadores, reduciendo el sesgo contra estudiantes no nativos.
- Clasificación en el navegador sin backend: mediante Transformers.js y el ONNX FP16, una extensión o web puede marcar contenido generado localmente sin enviar texto a un servidor, útil para privacidad y para despliegues estáticos.
- Filtrado previo en pipelines de datos de entrenamiento: etiquetar grandes corpus para separar texto humano de texto sintético antes de entrenar otros modelos, con inferencia en CPU vía ONNX Runtime y coste por muestra muy bajo.
- Auditoría de contenido en el borde (edge): en dispositivos sin GPU, el modelo de 32 M de parámetros y el ONNX FP16 permiten clasificar en tiempo casi real dentro de aplicaciones locales o gateways.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false`):

| Evaluación | Conjunto de datos | Métrica | Valor |
|---|---|---|---|
| Forense de texto IA y salidas de agentes | 2025-2026 Disjoint 4B/8B Open-Weight LLMs (Qwen3-4B + DeepSeek-R1-Distill-Llama-8B, OOD) | ROC-AUC | 0,9988 |
| Forense de texto IA y salidas de agentes | 2025-2026 Disjoint 4B/8B Open-Weight LLMs (Qwen3-4B + DeepSeek-R1-Distill-Llama-8B, OOD) | TPR@5%FPR | 0,9923 |
| Forense de texto IA y salidas de agentes | 2025-2026 Disjoint 4B/8B Open-Weight LLMs (Qwen3-4B + DeepSeek-R1-Distill-Llama-8B, OOD) | Macro-F1 | 0,9775 |
| Auditoría de falsos positivos en inglés no nativo (ESL) | chillies/ielts-writing-task2-essays (100 % humano ESL, OOD) | FPR @ 0,50 | 0,1975 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (32 M de parámetros, unos 128 MB de pesos) y en torno a 64 MB en FP16; el repo completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria sirve; no requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650 e incluso iGPU) y en CPU de portátil.
- Opciones de despliegue: `transformers` (>= 4.48), ONNX Runtime (CPU/edge), Transformers.js (navegador y Node.js), Text Embeddings Inference y endpoints compatibles.
- Latencia y throughput: no se publican cifras concretas en la información disponible; por el tamaño del modelo y las exportaciones ONNX, se espera latencia de milisegundos en CPU para secuencias cortas, pero no se confirma con datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Despliegue en navegador |
|---|---|---|---|---|---|
| Tamarillo/ai-text-forensics-guard-tiny-en | 32 M | 2.048 entrenados / 8.192 RoPE | Detección de texto IA y salidas de agentes | Apache-2.0 | Sí (ONNX FP16 + Transformers.js) |
| desklib/ai-text-detector-v1.01 | no disponible en la información | 512-768 (truncamiento) | Detección de texto IA | no disponible | No (sin ONNX; requiere subclase personalizada) |
| Detectores basados en RoBERTa/DeBERTa (genéricos) | no disponible | 512-768 | Detección de texto IA | variable | Limitado |

La información disponible solo detalla comparaciones cualitativas frente a desklib/ai-text-detector-v1.01 y a los detectores RoBERTa/DeBERTa: el modelo de Tamarillo evita el código remoto, amplía el contexto y publica auditoría de falsos positivos ESL. No se dispone de cifras de rendimiento de los competidores para una comparación numérica.

## Limitaciones y advertencias

- Solo inglés: no se declaran capacidades en otros idiomas; su uso con texto en castellano u otras lenguas no está validado.
- Riesgo de falsos positivos en inglés no nativo: la tasa declarada es del 19,75 % a umbral 0,50 sobre ensayos IELTS humanos, lo que exige revisión humana y umbrales conservadores (por ejemplo, `thr_1fpr_val`) en contextos sensibles.
- Riesgo de deriva temporal: los benchmarks OOD se refieren a modelos de 2025-2026 (Qwen3-4B, DeepSeek-R1-Distill-Llama-8B); modelos generativos posteriores o con estilos distintos pueden degradar la detección.
- Sesgos de dominio: aunque el autor documenta la mitigación del atajo `\n\n`, persisten riesgos de que el modelo aprenda correlaciones de estilo, longitud o registro que no generalicen a todos los géneros textuales.
- Métricas no verificadas: todos los resultados del model-index están marcados como `verified: false`; conviene replicarlos en el dominio propio antes de confiar en ellos.
- Licencia Apache-2.0: permite uso comercial, pero no se ofrece garantía alguna sobre la precisión ni sobre las consecuencias legales de marcar contenido como generado por IA.
- No es un modelo generativo: no puede usarse para producir texto, razonar ni ejecutar herramientas; cualquier expectativa en ese sentido es un error de uso.
- Advertencia de precisión en producción: la calibración (T = 1,0598) y los umbrales publicados están pensados para el conjunto de evaluación del autor; recalibrar sobre datos propios es recomendable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/ai-text-forensics-guard-tiny-en
- Perfil del autor: https://huggingface.co/Tamarillo
- Demo en navegador (Space): https://huggingface.co/spaces/Tamarillo/ai-text-forensics-guard-demo
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Dataset RAID: https://huggingface.co/datasets/liamdugan/raid
- Dataset MAGE: https://huggingface.co/datasets/yaful/MAGE
- Dataset de ensayos IELTS ESL: https://huggingface.co/datasets/chillies/ielts-writing-task2-essays
- Transformers.js: https://github.com/huggingface/transformers.js
