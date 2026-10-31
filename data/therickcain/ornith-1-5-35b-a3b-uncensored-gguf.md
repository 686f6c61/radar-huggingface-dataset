# therickcain/Ornith-1.5-35B-A3B-UNCENSORED-GGUF

## Resumen

Ornith-1.5-35B-A3B-UNCENSORED-GGUF es una cuantización GGUF, en formato "abliterated" (con los comportamientos de rechazo eliminados), del modelo base Ornith 1.5 35B-A3B desarrollado por ornith-ai y adaptado por el usuario therickcain (bajo el sello Dealign.ai, variante "CRACK"). El modelo base es un modelo de lenguaje mixture-of-experts (MoE) de 35,5 mil millones de parámetros totales, con arquitectura híbrida que combina GatedDeltaNet (un tipo de capa tipo SSM) con atención estándar, y que además incorpora un cabezal de predicción multi-token (MTP) para decodificación especulativa y capacidades de visión-lenguaje (VLM).

Esta variante resuelve una demanda concreta de la comunidad: ejecutar un modelo MoE grande con razonamiento ("thinking") y visión en llama.cpp, sin los filtros de seguridad del modelo original. El proceso de abliteration emplea cirugía de pesos consciente de la arquitectura, dirigida a las vías de atención, y cada cuantización está ajustada y verificada de forma independiente. Según la model card, MMLU se mantiene dentro del margen de ruido respecto al modelo base en todas las cuantizaciones excepto en Q2_K.

Su relevancia actual radica en la combinación poco habitual de características: MoE con solo ~3B de parámetros activos (inferencia eficiente), razonamiento activado por defecto, soporte de imagen-texto a texto, cabezal MTP preservado y licencia MIT heredada del modelo base, todo ello ejecutable localmente con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GatedDeltaNet (SSM) + attention, Mixture-of-Experts con cabezal de predicción multi-token (MTP) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B (derivado de la nomenclatura "A3B"; 256 expertos, 8 activos) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K (las sub-8-bit usan pase AWQ + matriz de importancia) |
| Idiomas soportados | no disponible (el modelo base es de la familia Qwen3.5, pero no se listan idiomas) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (con archivo `mmproj` f16 para el proyector de visión) |

## Arquitectura y entrenamiento

El modelo base Ornith 1.5 35B-A3B es un transformer híbrido que intercala capas GatedDeltaNet (una variante de estado-recurrente tipo SSM) con capas de atención estándar, en una configuración MoE de 256 expertos con 8 activos por token. Esto explica la etiqueta "A3B": aunque el modelo pesa 35,5B de parámetros, solo alrededor de 3B se activan en cada pasada, lo que reduce drásticamente el coste de inferencia frente a un modelo denso de tamaño equivalente. Incluye un cabezal de predicción multi-token (MTP) que habilita decodificación especulativa, y está alineado con la familia Qwen3.5 según las etiquetas del repositorio.

Sobre el entrenamiento del modelo base no se ofrecen detalles (tokens, composición del dataset, RLHF/DPO): no disponible. En cuanto a esta variante, el trabajo del cuantizador consiste en una cirugía de pesos "CRACK-abliterated" orientada específicamente a las vías de atención para eliminar el comportamiento de rechazo, preservando conocimiento, el trazo de razonamiento `<think>`, el cabezal MTP (también abliterated) y la capacidad completa de visión-lenguaje. Las cuantizaciones por debajo de 8 bits aplican un pase AWQ (consciente de activaciones, basado en Hessiano) más una matriz de importancia (imatrix) para minimizar la pérdida de calidad.

## Capacidades

- Generación de texto conversacional con trazos de razonamiento `<think>` activados por defecto (desactivables con `enable_thinking: false` en la plantilla de chat).
- Visión-lenguaje: acepta imágenes junto al texto mediante el archivo `mmproj-Ornith-1.5-35B-A3B-f16.gguf` (pipeline image-text-to-text).
- Razonamiento multi-paso gracias al modo "thinking" heredado del modelo base.
- Decodificación especulativa mediante el cabezal MTP preservado en todas las cuantizaciones.
- Comportamiento sin filtros de seguridad: la variante CRACK elimina las negativas de seguridad, con una tasa de éxito en HarmBench del 100% (99,6% en Q2_K).
- Compatibilidad con el ecosistema llama.cpp (llama-cli, llama-server, llama-mtmd-cli) y, según la model card, funcionamiento directo en LM Studio.
- Capacidades de tool calling, function calling o agentes: no disponible (no se mencionan en la model card).
- Capacidades multilingües: no disponible explícitamente.

## Casos de uso

- Investigación en seguridad y alineación de modelos: al tratarse de un artefacto de investigación con guardrails eliminados y datos públicos de HarmBench, es útil para estudiar circuitos de rechazo, abliteration y robustez de cuantizaciones.
- Ejecución local en hardware de gama alta: con ~3B de parámetros activos, la inferencia es rápida pese al tamaño total, lo que permite servir el modelo en una estación de trabajo con una GPU de 24 GB usando Q4_K_M o Q3_K_M.
- Análisis de imágenes con razonamiento local: combinando un quant de texto con el `mmproj`, se pueden describir e interpretar imágenes sin enviar datos a servicios en la nube, útil para flujos con requisitos de privacidad.
- Prototipado de asistentes con razonamiento: el modo `<think>` activado por defecto permite evaluar cadenas de razonamiento multi-paso en aplicaciones de agente o resolución de problemas, con opción de desactivarlo para respuestas directas.
- Experimentación con decodificación especulativa: el cabezal MTP preservado permite probar aceleración de inferencia por MTP en llama.cpp, un caso de uso técnico poco común en modelos cuantizados.
- Integración en servidores locales tipo OpenAI-compatible: `llama-server` con `--jinja` permite servir el modelo con plantilla de chat para aplicaciones conversacionales en local.
- Pruebas de calidad de cuantización MoE: la tabla de MMLU por cuantización (con pase AWQ + imatrix) sirve de referencia para comparar cómo cuantiza esta arquitectura híbrida a 2-4 bits.

## Benchmarks y rendimiento

Datos publicados en la model card (MMLU en modo logit, base vs. CRACK a la misma cuantización; HarmBench como tasa de éxito de ataque con umbral de coherencia sobre 240 comportamientos):

| Quant | MMLU (base) | MMLU (CRACK) | ΔMMLU | HarmBench harm-ASR |
|---|---|---|---|---|
| Q8_0 | 79,0% | 80,7% | +1,75 pp | 100,0% |
| Q6_K | 78,6% | 79,0% | +0,40 pp | 100,0% |
| Q5_K_M | 80,7% | 80,1% | -0,58 pp | 100,0% |
| Q4_K_M | 80,0% | 77,8% | -2,20 pp | 100,0% |
| Q3_K_M | 76,0% | 78,4% | +2,34 pp | 100,0% |
| Q2_K | 77,9% | 69,8% | -8,07 pp | 99,6% |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos de texto, sin KV cache ni mmproj): Q2_K ~13,2 GB; Q3_K_M ~17 GB; Q4_K_M ~21,7 GB; Q5_K_M ~25 GB; Q6_K ~29,2 GB; Q8_0 ~37,8 GB.
- Con Q4_K_M (21,7 GB) cabe en una RTX 3090/4090 de 24 GB con contexto ajustado; para Q6_K y Q8_0 se recomiendan GPUs con 32-48 GB (RTX 5090, A6000, A100) o descarga parcial en CPU/RAM dada la baja activación (~3B activos).
- El proyector de visión `mmproj` en f16 añade memoria adicional no cuantificada en la model card.
- Despliegue: llama.cpp es el runtime de referencia (llama-cli, llama-server, llama-mtmd-cli); compatible con LM Studio según el autor. No se menciona soporte en vLLM, TGI u Ollama para esta variante.
- Muestreo recomendado: temperature 1.0, top_p 0.95, top_k 20.
- Latencia y throughput: no disponible (aunque la activación de ~3B parámetros y el cabezal MTP sugieren buen rendimiento en hardware consumer).

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Vision | Razonamiento | Licencia | Formato |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-UNCENSORED (este) | ~35,5B | ~3B | Sí (mmproj) | Sí (`<think>`) | MIT | GGUF |
| Qwen3-30B-A3B (familia de referencia) | ~30,5B | ~3B | No (variante estándar) | Sí | Apache 2.0 | Safetensors/GGUF |
| Qwen3-VL-30B-A3B | ~30B | ~3B | Sí | Sí | Apache 2.0 | Safetensors/GGUF |

Nota: Ornith 1.5 se etiqueta como perteneciente a la familia Qwen3.5, por lo que las variantes MoE de ~30B de Qwen3 son los comparables más cercanos. Las cifras de rendimiento comparativo no están disponibles; la principal diferencia práctica de esta variante es la ausencia de guardrails y la licencia MIT.

## Limitaciones y advertencias

- Se trata de un artefacto de investigación con guardrails de seguridad reducidos o eliminados: responde a solicitudes nocivas (harm-ASR del 100% en HarmBench). Su uso con fines ilícitos es responsabilidad del usuario; el propio autor advierte usarlo "de forma responsable y legal".
- Riesgo de alucinación: no cuantificado en la model card; asume el riesgo típico de cualquier LLM, agravado por la ausencia de rechazos que frenen respuestas dudosas.
- En Q2_K, la cirugía de abliteration interactúa negativamente con la cuantización agresiva: caída de 8,07 pp en MMLU. Se recomienda Q4_K_M o superior.
- Longitud de contexto, idiomas soportados y soporte de tool calling: no disponibles en la información publicada.
- Licencia MIT: sin restricciones de uso comercial heredadas de la licencia, pero conviene verificar los términos del modelo base ornith-ai/Ornith-1.5-35B-A3B.
- Proyecto de autor individual con métricas de adopción muy bajas (296 descargas, 1 like en el momento de la ficha): escaso historial de auditoría por terceros.
- El `mmproj` en f16 añade un coste de VRAM adicional para la funcionalidad de visión.

## Enlaces

- Repositorio de la variante cuantizada: https://huggingface.co/therickcain/Ornith-1.5-35B-A3B-UNCENSORED-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Sitio del autor de la variante: https://dealign.ai
- Paper, demo u otros enlaces: no disponibles en la información proporcionada.
