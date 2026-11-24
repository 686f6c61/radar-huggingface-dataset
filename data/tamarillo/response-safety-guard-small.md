# Tamarillo/response-safety-guard-small

## Resumen

Tamarillo/response-safety-guard-small es un clasificador de seguridad para pipelines de agentes de IA, desarrollado por Tamarillo. Se construye sobre el backbone jhu-clsp/mmBERT-small (140,6 millones de parametros) y resuelve un problema concreto de observabilidad: auditar simultaneamente el prompt del usuario y la respuesta del asistente para distinguir cumplimiento seguro, rechazos de seguridad correctos, sobre-rechazos falsos y jailbreaks exitosos. Frente a alternativas generativas de 7B-8B (como PolyGuard-Qwen, con mas de 1.100 ms por llamada en A100) o clasificadores de una sola cabeza solo en ingles, este modelo realiza una unica pasada forward de encoder determinista que devuelve tres probabilidades sigmoideas independientes.

El modelo forma parte de una familia de tres tamanos: tiny-en (32,0M, ingles), small (140,6M, 17 idiomas) y base (307,5M, 17 idiomas). La variante small cubre 17 idiomas (en, ar, zh, cs, nl, fr, de, hi, it, ja, ko, pl, pt, ru, es, sv, th), entrena con longitud de secuencia de 3.584 tokens y evalua hasta 4.096, con backbone que soporta 8.192. Su licencia Apache-2.0 y la ausencia de trust_remote_code facilitan el despliegue en produccion.

La relevancia actual viene de la necesidad de guardrails ligeros y desplegables en CPU para suites de red-teaming (garak, promptfoo, DeepEval) y stacks de observabilidad de agentes. El modelo publica pesos safetensors y ONNX, con FP32 en CPU a 27,3 ms por llamada de 64 tokens y un tamano de 537,0 MB, lo que lo hace viable en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT / mmBERT-small), pooling global con token [CLS] |
| Parametros totales | 140.642.691 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenamiento 3.584 tokens; evaluacion 4.096; backbone hasta 8.192 |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 (model_fp16.onnx); no se documentan GGUF ni otras |
| Idiomas soportados | 17: en, ar, zh, cs, nl, fr, de, hi, it, ja, ko, pl, pt, ru, es, sv, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch/Transformers) y ONNX (FP32/FP16) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en jhu-clsp/mmBERT-small, con pooling global mediante el token [CLS] y sin necesidad de trust_remote_code. La cabeza de clasificacion es multi-etiqueta (problem_type="multi_label_classification") con tres salidas sigmoideas independientes: prompt_unsafe (indice 0), response_refusal (indice 1) y response_unsafe (indice 2). La entrada es el par (prompt, response) tokenizado con truncation="longest_first" y max_length=3584.

Los datos de entrenamiento declarados incluyen ToxicityPrompts/PolyGuardMix, nvidia/Aegis-AI-Content-Safety-Dataset-2.0, natolambert/xstest-v2-copy y HuggingFaceH4/ultrachat_200k. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles. La evaluacion multilingue se realizo sobre PolyGuardPrompts en los 17 idiomas declarados.

La innovacion principal es la clasificacion en una sola pasada con tres cabezas, que sustituye pipelines de dos pasadas generativas o juices de 7B-8B. Ademas, se verifico paridad entre los pesos PyTorch y las exportaciones ONNX, y se evaluo la capacidad de detectar brechas tardias (late-breach) con needles de 3.200 tokens, obteniendo 0,860 F1 con 0,150 FPR.

## Capacidades

- Clasificacion de seguridad de prompts: detecta solicitudes dañinas, ilegales, abusivas o que violan politicas.
- Deteccion de rechazo del asistente: identifica si la respuesta declina la peticion.
- Deteccion de respuestas inseguras: marca salidas dañinas o que violan politicas (jailbreak exitoso o generacion insegura).
- Derivacion de estados forenses: safe_compliance (0,0,0), false_over_refusal (0,1,0), proper_safety_refusal (1,1,0), jailbreak_success (1,*,1), unsafe_response (0,*,1) y unsafe_prompt_benign_reply (1,0,0).
- Soporte multilingue en 17 idiomas, entrenado y evaluado sobre PolyGuardPrompts.
- Contexto largo nativo: entrenamiento a 3.584 tokens, evaluacion a 4.096, backbone hasta 8.192.
- Inferencia en CPU mediante ONNX Runtime sin requerir PyTorch.
- No es un modelo generativo: no produce texto, solo probabilidades de clasificacion.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, ya que es un clasificador.

## Casos de uso

- Guardrail en pipelines de agentes: interceptar cada turno (prompt, respuesta) y calcular los tres scores para bloquear jailbreaks exitosos o respuestas inseguras antes de que lleguen al usuario, con una sola pasada de encoder por turno.
- Red-teaming automatizado: integrar en garak, promptfoo o DeepEval para etiquetar de forma determinista los resultados de ataques y distinguir rechazos correctos de sobre-rechazos falsos, reduciendo falsos positivos en los informes.
- Observabilidad y forensics de agentes: registrar los tres scores por turno en stacks de observabilidad para reconstruir la traza de estados forenses (safe_compliance, proper_safety_refusal, jailbreak_success, etc.) y auditar incidentes a posteriori.
- Moderacion de contenido multilingue: aplicar el clasificador en 17 idiomas para filtrar prompts y respuestas en productos con base de usuarios internacional, sin depender de un modelo solo en ingles.
- Deteccion de sobre-rechazos en asistentes: monitorizar la tasa de false_over_refusal para ajustar prompts de sistema y politicas de rechazo, usando el score response_refusal junto con prompt_unsafe.
- Despliegue en entornos sin GPU: ejecutar ONNX FP32 en CPU a 27,3 ms por llamada de 64 tokens (537,0 MB) para servicios de moderacion en contenedores sin acelerador.
- Evaluacion de brechas tardias en contextos largos: usar la ventana de 3.584-4.096 tokens para detectar contenido inseguro introducido al final de conversaciones largas, con 0,860 F1 y 0,150 FPR en needles de 3.200 tokens.

## Benchmarks y rendimiento

| Benchmark / escenario | Metrica | Resultado |
|---|---|---|
| PKU-SafeRLHF (OOD), response_unsafe | F1 | 0,817 |
| PKU-SafeRLHF (OOD), response_unsafe | FPR | 0,112 |
| PKU-SafeRLHF (OOD), response_unsafe | ROC-AUC | 0,906 |
| Late-breach needle de 3.200 tokens | F1 | 0,860 |
| Late-breach needle de 3.200 tokens | FPR | 0,150 |
| CPU ONNX FP32, 64 tokens | Latencia | 27,3 ms |
| CPU ONNX FP32, 64 tokens | Tamano | 537,0 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un clasificador y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 140,6M parametros; en FP32 son aproximadamente 562 MB de pesos, en FP16 aproximadamente 281 MB; con activaciones y overhead de runtime, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; en A100 o H100 el modelo esta limitado por latencia de kernel y no por memoria.
- Cabe en consumer GPU: si, en todas las GPU con al menos 2 GB de VRAM; tambien funciona en CPU pura.
- Opciones de despliegue: PyTorch/Transformers (>=4.48.0), ONNX Runtime (CPUExecutionProvider, GPU o WASM), text-embeddings-inference y endpoints compatibles segun los tags del repositorio; no se documenta soporte de vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia y throughput estimados: 27,3 ms por llamada de 64 tokens en CPU ONNX FP32; el rendimiento a 3.584 tokens no se especifica en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Tamarillo/response-safety-guard-small | 140,6M | 3.584 (entreno) / 4.096 (eval) | 3 cabezas, una pasada, 17 idiomas | Apache-2.0 | ONNX FP32 en CPU a 27,3 ms |
| ToxicityPrompts/PolyGuard-Qwen | 7,6B | No disponible | Generativo, juiz | No disponible | Mas de 1.100 ms por llamada en A100 |
| Qwen/Qwen3Guard-Gen-0.6B | 0,6B | No disponible | Generativo, dos pasadas | No disponible | Requiere dos generaciones autorregresivas por turno |
| allenai/wildguard | 7B-8B | No disponible | Generativo, juiz | Gated | Acceso restringido |
| garak-llm/garak-refusal-detector | 150M | 4K | Una cabeza, solo rechazo | No disponible | Solo ingles, no puntua prompt ni respuesta |
| protectai/distilroberta-base-rejection-v1 | 82M | 512 | Una cabeza, solo rechazo | No disponible | Solo ingles, contexto corto |

## Limitaciones y advertencias

- Es un clasificador, no un generador: no produce respuestas ni razonamiento; solo devuelve tres probabilidades.
- Los scores son probabilidades sigmoideas; el umbral de 0,5 usado en la derivacion de estados puede requerir calibracion por dominio.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea (falsos positivos y falsos negativos) en prompts o respuestas ambiguas.
- La cobertura de 17 idiomas esta declarada y evaluada sobre PolyGuardPrompts, pero no se documentan metricas por idioma; el rendimiento fuera de esos 17 idiomas no esta garantizado.
- La longitud de entrenamiento es 3.584 tokens; entradas mas largas se truncan con longest_first segun la configuracion de ejemplo, lo que puede perder contenido relevante.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan garantias ni responsabilidades; el autor no ofrece informacion sobre sesgos especificos detectados.
- No se documentan sesgos conocidos, composicion exacta del dataset ni procesos de RLHF/DPO; esa informacion no esta disponible.
- El modelo no sustituye una revision humana en casos de alto riesgo; debe usarse como capa adicional de defensa en profundidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/response-safety-guard-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Variante tiny-en: https://huggingface.co/Tamarillo/response-safety-guard-tiny-en
- Variante base: https://huggingface.co/Tamarillo/response-safety-guard-base
- Demo Space: https://huggingface.co/spaces/Tamarillo/response-safety-guard-demo
- Dataset PolyGuardMix: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardMix
- Dataset Aegis AI Content Safety 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset xstest-v2-copy: https://huggingface.co/datasets/natolambert/xstest-v2-copy
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Paper relacionado (PGE attack): https://arxiv.org/html/2402.09154v2
