# Tamarillo/response-safety-guard-base

## Resumen

`Tamarillo/response-safety-guard-base` es un clasificador de seguridad para pipelines de agentes y sistemas de observabilidad, desarrollado por Tamarillo. Se construye sobre el backbone `jhu-clsp/mmBERT-base` (307.532.547 parámetros) y resuelve un problema concreto: auditar en una sola pasada de encoder el par `(prompt, respuesta)` de un asistente, devolviendo tres probabilidades independientes mediante sigmoide en lugar de requerir dos generaciones autorregresivas o un juez generativo de 7B-8B parámetros.

El modelo pertenece a una familia de tres variantes (tiny-en de 32M, small de 140,6M y base de 307,5M, las dos últimas con cobertura de 17 idiomas). La variante base es la de mayor precisión de la familia y mantiene un tamaño aproximadamente 25 veces menor que `ToxicityPrompts/PolyGuard-Qwen` (7,6B), lo que permite ejecución en CPU con ONNX Runtime en decenas de milisegundos.

Es relevante ahora porque los stacks de producción de agentes (red-teaming con `garak`, `promptfoo` o `DeepEval`, y plataformas de observabilidad) necesitan distinguir entre cumplimiento seguro, rechazo legítimo, sobrerrechazo y éxito de jailbreak, y las alternativas disponibles o bien son generativas y caras, o bien son clasificadores de un solo head limitados al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, backbone `jhu-clsp/mmBERT-base`), pooling global `[CLS]`, 3 cabezas de clasificación multi-etiqueta |
| Parametros totales | 307.532.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en el backbone; 3.584 en entrenamiento; 4.096 en evaluación |
| Tipos de cuantizacion | ONNX FP32 (`onnx/model.onnx`) y ONNX FP16 (`onnx/model_fp16.onnx`); pesos safetensors en el repo |
| Idiomas soportados | 17: en, ar, zh, cs, nl, fr, de, hi, it, ja, ko, pl, pt, ru, es, sv, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT (variante multilingüe `mmBERT-base` de JHU CLSP) con pooling global mediante el token `[CLS]` y tres cabezas lineales independientes sobre la representación pooled. La configuración es `problem_type="multi_label_classification"`: cada cabeza se activa con sigmoide y se umbraliza de forma independiente, de modo que una única pasada forward produce las probabilidades `prompt_unsafe` (índice 0), `response_refusal` (índice 1) y `response_unsafe` (índice 2). No requiere `trust_remote_code`.

El entrenamiento utiliza los datasets `ToxicityPrompts/PolyGuardMix`, `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`, `natolambert/xstest-v2-copy` y `HuggingFaceH4/ultrachat_200k`, con una longitud de secuencia de 3.584 tokens (evaluación a 4.096). La model card no detalla el número total de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicó RLHF o DPO; esos datos figuran como no disponibles. La innovación destacable es la inferencia determinista de una sola pasada que sustituye a pipelines de dos pasadas generativas (caso de `Qwen/Qwen3Guard-Gen-0.6B`) o a jueces de 7B-8B.

## Capacidades

- Clasificación multi-etiqueta de seguridad sobre el par `(prompt, respuesta)` en una sola pasada de encoder.
- Detección de prompt dañino, ilegal, abusivo o contrario a políticas (`prompt_unsafe`).
- Detección de rechazo del asistente (`response_refusal`).
- Detección de respuesta dañina o contraria a políticas (`response_unsafe`), incluyendo éxito de jailbreak.
- Derivación de estados forenses: `safe_compliance` (0,0,0), `false_over_refusal` (0,1,0), `proper_safety_refusal` (1,1,0), `jailbreak_success` (1,*,1), `unsafe_response` (0,*,1) y `unsafe_prompt_benign_reply` (1,0,0).
- Soporte multilingüe en 17 idiomas, evaluado sobre `PolyGuardPrompts`.
- Capacidad de contexto largo: detecta brechas tardías en respuestas de hasta 3.200 tokens (F1 0,891 en la prueba de aguja).
- Inferencia sin PyTorch mediante ONNX Runtime en CPU.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por sí mismo; se usa como componente de guardrail.

## Casos de uso

- Guardrail en producción de agentes conversacionales: se ejecuta tras cada turno sobre `(prompt, respuesta)` y bloquea o registra la salida según `response_unsafe`, con latencia de 55,7 ms en CPU ONNX FP32 a 64 tokens, viable en línea.
- Red-teaming automatizado: integrado en `garak`, `promptfoo` o `DeepEval` para etiquetar cada intento como `jailbreak_success`, `proper_safety_refusal` o `false_over_refusal`, midiendo la tasa de éxito de ataques sin un juez generativo caro.
- Observabilidad y forense de agentes: registro de las tres probabilidades por turno para reconstruir la secuencia de estados forenses y auditar incidentes post hoc con evidencia cuantitativa.
- Detección de sobrerrechazo: el head `response_refusal` combinado con `prompt_unsafe` bajo identifica respuestas rechazadas ante peticiones benignas, útil para ajustar políticas de rechazo y reducir fricción con el usuario.
- Moderación multilingüe: cobertura de 17 idiomas en un único modelo, adecuada para plataformas con usuarios en español, árabe, chino, hindi, japonés, coreano, ruso y lenguas europeas sin desplegar clasificadores por idioma.
- Auditoría de respuestas largas: con contexto de 3.584 tokens en entrenamiento detecta contenido dañino introducido al final de respuestas extensas, caso frecuente en agentes que generan informes o código largo.
- Filtro previo en pipelines de generación: ejecutado en CPU sobre ONNX FP16 reduce el coste de infraestructura frente a jueces de 7B y permite desplegarlo en el mismo nodo que el servicio de inferencia.

## Benchmarks y rendimiento

| Benchmark / escenario | Metrica | Valor |
|---|---|---|
| OOD `PKU-SafeRLHF`, head `response_unsafe` | F1 | 0,836 |
| OOD `PKU-SafeRLHF`, head `response_unsafe` | FPR | 0,072 |
| OOD `PKU-SafeRLHF`, head `response_unsafe` | ROC-AUC | 0,932 |
| Prueba de aguja con brecha tardía a 3.200 tokens | F1 | 0,891 |
| Prueba de aguja con brecha tardía a 3.200 tokens | FPR | 0,100 |
| CPU ONNX FP32 a 64 tokens | Latencia | 55,7 ms |
| CPU ONNX FP32 | Tamaño del artefacto | 1.173,7 MB |

La model card no publica resultados de MMLU, HumanEval ni GSM8K, que no aplican a un clasificador. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP32 y unos 0,6 GB en FP16 para el artefacto ONNX; en PyTorch con safetensors, alrededor de 1,3 GB en FP32 más activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en A100, H100, RTX 4090, RTX 3090 y GPUs de gama media como RTX 3060.
- Cabe en GPU de consumo y también en CPU: la model card reporta 55,7 ms por llamada a 64 tokens en CPU con ONNX Runtime FP32.
- Opciones de despliegue: `transformers` con PyTorch (>= 4.48.0), ONNX Runtime (CPU o GPU), Text Embeddings Inference (tag `text-embeddings-inference`), y endpoints compatibles de Hugging Face.
- Throughput y latencia: solo se documenta la latencia CPU de 55,7 ms a 64 tokens; el throughput en GPU y la latencia con secuencias de 3.584 tokens figuran como no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Idiomas | Licencia |
|---|---|---|---|---|---|
| `Tamarillo/response-safety-guard-base` | 307,5M | 3.584 entrenamiento / 8.192 backbone | Encoder, 3 heads, una pasada | 17 | Apache-2.0 |
| `ToxicityPrompts/PolyGuard-Qwen` | 7,6B | no disponible | Generativo (juez) | no disponible | no disponible |
| `Qwen/Qwen3Guard-Gen-0.6B` | 0,6B | no disponible | Generativo, dos pasadas | no disponible | no disponible |
| `allenai/wildguard` | 7B-8B | no disponible | Generativo (juez), acceso restringido | no disponible | no disponible |
| `protectai/distilroberta-base-rejection-v1` | 82M | 512 | Clasificador de un head | inglés | no disponible |

El modelo base ofrece la única combinación de tres heads, cobertura de 17 idiomas, contexto de 3.584 tokens y licencia Apache-2.0 en la comparativa; las alternativas generativas requieren una o dos generaciones autorregresivas por turno y las alternativas de clasificación se limitan al inglés y a 512 tokens. Los datos de rendimiento de los competidores no se detallan en la información disponible.

## Limitaciones y advertencias

- Es un clasificador, no un generador: no puede sustituir a un modelo de lenguaje ni razonar sobre el contenido; solo puntúa pares `(prompt, respuesta)`.
- Umbral fijo de 0,5 en los ejemplos de la model card; en producción conviene calibrar por head según el coste relativo de falsos positivos y falsos negativos.
- Riesgo de falsos negativos en ataques novedosos o codificados (ofuscación, idiomas de bajos recursos dentro de los 17 cubiertos, contenido multimodal no textual).
- La cobertura lingüística se evalúa sobre `PolyGuardPrompts`, pero la model card no publica métricas desagregadas por idioma; el rendimiento en idiomas distintos del inglés puede ser inferior.
- El contexto de entrenamiento es de 3.584 tokens, aunque el backbone soporte 8.192; secuencias más largas pueden degradar la precisión.
- No se documentan sesgos específicos ni análisis de equidad en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre las decisiones de moderación recae en el integrador; el modelo no garantiza cumplimiento normativo por sí solo.
- El repo ocupa 3,1 GB por incluir pesos en varios formatos; conviene descargar solo el artefacto ONNX necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/response-safety-guard-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Variante tiny-en: https://huggingface.co/Tamarillo/response-safety-guard-tiny-en
- Variante small: https://huggingface.co/Tamarillo/response-safety-guard-small
- Demo interactiva (ONNX en navegador): https://huggingface.co/spaces/Tamarillo/response-safety-guard-demo
- Dataset `ToxicityPrompts/PolyGuardMix`: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Dataset `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset `natolambert/xstest-v2-copy`: https://huggingface.co/datasets/natolambert/xstest-v2-copy
- Dataset `HuggingFaceH4/ultrachat_200k`: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- `garak` (red-teaming): https://github.com/NVIDIA/garak
- `promptfoo` (evaluación de prompts): https://github.com/promptfoo/promptfoo
- `DeepEval` (evaluación de LLMs): https://github.com/confident-ai/deepeval
