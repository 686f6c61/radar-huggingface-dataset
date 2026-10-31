# webbrain-one/lfm3-vld-2b-onnx

## Resumen

LFM3-VLD-2B ONNX es un paquete de inferencia en formato ONNX preparado para WebGPU, desarrollado por webbrain-one a partir del modelo base `webbrain-one/lfm3-vl-2b-vldr` (derivado a su vez de `webbrain-one/lfm3-vld-2b`). El modelo combina el backbone híbrido conv/attention de LiquidAI `d1-2B`, entrenado adicionalmente para tareas de decisión, con la cabeza de lenguaje original restaurada de `LFM3-VL-2B`. Su propuesta de valor es doble: permite ejecutar un modelo multimodal (imagen-texto a texto) directamente en el navegador vía WebGPU, y expone un vector oculto intermedio (`decision_hidden`, de dimensión 2048) que alimenta sondas de decisión lineales en JavaScript sin dependencias externas.

El problema que resuelve es la clasificación y verificación de decisiones en tareas de navegador (por ejemplo, determinar si una tarea se ha completado correctamente) con un modelo pequeño de 2B de parámetros que cabe en hardware de consumo. La sonda de decisión incluida alcanza un 91,3 % de precisión categórica en el conjunto `final_test` de 126 tareas, frente al 67,5 % de la verificación zero-shot estándar, lo que lo hace relevante para casos de agentes web y evaluación de completitud de tareas. El repositorio pesa 3,7 GB e incluye cuantizaciones q4f16 y q8f16 del decodificador más un codificador de visión en fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido conv/attention (LiquidAI LFM3) con codificador de vision, decodificador decision-trained d1-2B |
| Parametros totales | ~2B (no disponible el desglose exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8f16 (~1,9 GB), q4f16 (~1,3 GB) en decodificador; fp16 en codificador de vision |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other) |
| Formato de pesos | ONNX (con datos externos `.onnx_data`); existe variante GGUF en repositorio hermano |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone híbrido conv/attention de LiquidAI correspondiente al decodificador `d1-2B`, que fue entrenado adicionalmente (decision training) para producir representaciones internas útiles para tareas de decisión categórica. Sobre este backbone se restaura la cabeza de lenguaje original (`lm_head.weight`) de `LFM3-VL-2B`, descrita por el autor como "no corrompida", lo que permite generar texto estándar además de usar el vector de decisión. La innovación técnica central es la exposición de la salida `layers.24/final_norm_layernorm` como tensor `decision_hidden` de forma `[batch, seq, 2048]`, que alimenta sondas lineales en JavaScript sin dependencias.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La sonda de decisión cost-sensitive incluida (`lfm3-vl-decision-probe-cs.js`) incorpora un margen calibrado de 1,071 para reducir falsos positivos en clasificación.

## Capacidades

- Pipeline image-text-to-text: procesa imágenes junto con texto conversacional mediante el codificador de visión fp16 incluido.
- Generación de texto conversacional estándar gracias a la cabeza de lenguaje restaurada de LFM3-VL-2B.
- Clasificación de decisión categórica mediante el tensor `decision_hidden` y las sondas lineales JavaScript incluidas (versión estándar y cost-sensitive).
- Reconocimiento de estados "unknown" en tareas de decisión (24/24 reconocidos en el conjunto de test).
- Ejecución en navegador vía WebGPU sin backend de servidor, gracias al formato ONNX y a sondas de cero dependencias.
- No se ha publicado información sobre tool calling, capacidades de agente multistep, soporte de audio ni modo de razonamiento extendido.

## Casos de uso

- Verificación de completitud de tareas de agentes web: la sonda de decisión clasifica en el navegador si una tarea del agente ha finalizado correctamente, con 0 falsas completaciones en 48 casos negativos del test.
- Evaluación de agentes en el navegador: al exponer `decision_hidden`, se pueden entrenar o ajustar sondas propias sobre el estado interno del modelo para tareas de supervisión de agentes sin reentrenar el modelo.
- Asistentes multimodales en cliente: ejecución local en el navegador vía WebGPU del decodificador q4f16 (~1,3 GB) junto al codificador de visión, sin enviar datos a servidores.
- Clasificación con presupuesto de coste: la sonda cost-sensitive con margen calibrado (1,071) permite ajustar el compromiso entre falsos positivos y falsos negativos según la aplicación.
- RAG o chat multimodal ligero en dispositivos sin GPU de servidor, aprovechando las cuantizaciones q4f16/q8f16.
- Prototipado rápido de modelos LFM3 en entornos web: el paquete ONNX con validaciones de paridad (`ort-parity.json`) facilita la integración con ONNX Runtime Web.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto `final_test` (126 tareas de decisión en navegador):

| Evaluator | Accuracy | Completions Found | False Completions | Unknown Recognized |
|---|---:|---:|---:|---:|
| Decision Probe (`probe.js`) | 115/126 (91,3 %) | 24/24 (100 %) | 0/48 (0 %) | 24/24 (100 %) |
| Zero-shot verify (`verify`) | 85/126 (67,5 %) | 22/24 (91,7 %) | 0/48 (0 %) | 0/24 (0 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Descarga completa del repositorio: 3,7 GB. El decodificador q4f16 ocupa ~1,3 GB y el q8f16 ~1,9 GB; el codificador de visión fp16 añade ~362 MB.
- Al ejecutarse vía WebGPU en navegador, es viable en GPUs de consumo con al menos 4-6 GB de VRAM para la variante q4f16 (estimación basada en el tamaño de los pesos; no se publica un requisito oficial).
- GPU recomendadas: cualquier GPU compatible con WebGPU (por ejemplo, NVIDIA RTX serie 30/40, AMD Radeon con soporte Vulkan/D3D12, Apple Silicon vía WebGPU en navegadores basados en Chromium o WebKit). No se publican recomendaciones específicas de A100/H100.
- Despliegue: ONNX Runtime Web (WebGPU) como objetivo principal del paquete. Existen cuantizaciones GGUF (BF16, Q8_0, Q4_K_M, mmproj-F16) en el repositorio hermano `webbrain-one/lfm3-vld-2b-gguf` para llama.cpp; no se menciona soporte oficial de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VLD-2B ONNX (este) | ~2B | ONNX (q4f16, q8f16), GGUF hermano | no disponible | lfm1.0 (other) | Multimodal, decision probe integrado, WebGPU |
| LiquidAI LFM2-VL (familia oficial) | ~2-3B | safetensors, GGUF comunitario | no disponible en esta ficha | Liquid AI (restrictiva) | Multimodal, base del backbone; sin sondas de decision |
| Qwen2.5-VL-3B-Instruct | ~3B | safetensors, GGUF, ONNX comunitario | hasta 32k | Qwen (Apache 2.0 con restricciones) | Multimodal mas maduro, ecosistema amplio, sin salida de decision nativa |

La comparación se ofrece a título orientativo; los datos de rendimiento de los modelos alternativos no provienen de la información de este repositorio.

## Limitaciones y advertencias

- La licencia lfm1.0 es de tipo "other": deben revisarse sus términos antes de cualquier uso comercial, ya que las licencias de modelos LFM de LiquidAI suelen incluir restricciones.
- Los benchmarks publicados corresponden a un conjunto de test propio y reducido (126 tareas de navegador); no son comparables directamente con benchmarks estándar de la industria.
- La precisión del 91,3 % corresponde a la sonda de decisión lineal, no al modelo generativo completo; el rendimiento en otras tareas no está documentado.
- Longitud de contexto, idiomas soportados y datos de entrenamiento no disponibles: riesgo de comportamiento impredecible fuera del dominio de entrenamiento.
- Riesgo de alucinación típico de modelos de 2B de parámetros, sin mitigaciones documentadas (no se menciona RLHF ni DPO).
- Repositorio de bajo uso (38 descargas, 1 like en el momento de la ficha) y de autor no corporativo: conviene validar la paridad y estabilidad del paquete en producción; el propio repo incluye ficheros de validación (`ort-parity.json`) para ello.
- Uso de `custom_code` indicado en los tags: revisar el código incluido antes de ejecutarlo.
- La cabeza de lenguaje "restaurada" sugiere que el checkpoint intermedio pudo estar modificado; verificar la calidad generativa del modelo antes de usarlo para texto libre.

## Enlaces

- Repositorio principal: https://huggingface.co/webbrain-one/lfm3-vld-2b-onnx
- Checkpoint BF16 PyTorch: https://huggingface.co/webbrain-one/lfm3-vld-2b
- Cuantizaciones GGUF para llama.cpp: https://huggingface.co/webbrain-one/lfm3-vld-2b-gguf
- Modelo base indicado: https://huggingface.co/webbrain-one/lfm3-vl-2b-vldr
- No se han encontrado enlaces a papers, blogs oficiales ni demos adicionales en la información disponible.
