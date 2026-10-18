# Worthify/Decision-1-E4B

## Resumen

Decision-1-E4B es un fine-tune de Worthify sobre google/gemma-4-E4B-it, con 7.463.013.376 parámetros y pesos BF16, además de un GGUF F16 de 13,917 GiB. No es un modelo generativo al uso: recibe una cadena de evidencia, un criterio y entre 2 y 16 opciones declaradas, y devuelve una puntuación para cada opción en una sola pasada. No produce respuesta ni explicación.

Resuelve el problema de tomar decisiones estructuradas sobre un conjunto cerrado de alternativas, con evidencia local y sin red. La model card lo sitúa como miembro pequeño de la familia Decision-1; el base es Gemma 4 E4B y el entrenamiento usa LoRA supervisado sobre un mix con CLINC150, WANLI, MultiNLI y ejemplos propios de Worthify.

Es relevante para clasificación, triaje, NLI, menús, procedimientos y detección de incertidumbre cuando se necesita una puntuación por opción y no texto libre. La licencia declarada es apache-2.0, el idioma documentado es inglés y el prompt se limita a 2.048 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de la familia Gemma 4, fine-tune de google/gemma-4-E4B-it; arquitectura interna no detallada |
| Parámetros totales | 7.463.013.376 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 2.048 tokens de prompt; los prompts mayores se rechazan. No se declara la ventana completa del modelo base |
| Tipos de cuantización | BF16 (pesos fusionados), F16 GGUF (13,917 GiB) e inferencia nativa en FP32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) y GGUF (F16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it en la revisión `ee0ef6023621cff504d758262d4e04895a5af4a2` y se distribuye como fine-tune independiente de Worthify, no como pesos ni datos de Tiny-Jev. La tarea se formula como scoring: se compone un prompt con evidencia, criterio y opciones, y se calcula entropía cruzada categórica sobre los logits de las opciones declaradas. La inferencia es single-row y no genera tokens. En la ruta nativa FP32 se reinstala el hook final-softcap de Gemma en cada carga; un `AutoModelForCausalLM.from_pretrained` convencional no lo reinstala.

El mix congelado Decision-1 v9 tiene 35.210 filas de entrenamiento, 3.200 de validación y 3.200 de test sellado, con SHA256 `7089b3756e7ed68c9d1ee3712195ce4a0e31162736673c911542f52d8777cddd`. Las fuentes son CLINC150 (CC-BY-3.0), WANLI (CC-BY-4.0), MultiNLI (términos permisivos OANC) y ejemplos de Worthify (MIT). El entrenamiento usa LoRA supervisado sobre bases BF16: rango 16, alpha 32, dropout 0,05, proyecciones q/k/v/o, AdamW, semilla 42, dos épocas completas (4.402 actualizaciones), batch efectivo 16, microbatch 8, warmup de 50 actualizaciones hasta 2e-5 y clipping de gradiente 1. Se usan permutaciones locales de opciones por fila y el schedule de la familia. Se seleccionó el checkpoint 4000 y se fusionó en BF16. El entrenamiento corrió en una A100 local. No reproduce el entrenamiento full-parameter del Decision-1 de 12B. La fusión cambió 4 de 3.200 elecciones de validación; 1 de los cambios partió de empates exactos.

## Capacidades

- Puntuación de decisiones estructuradas: recibe evidencia, criterio y 2-16 opciones, y devuelve una puntuación por opción en una sola pasada.
- Clasificación de intenciones y categorías: la familia classification se evalúa con macro-F1 y el entrenamiento incluye CLINC150.
- Ciberseguridad: la familia cyber obtiene accuracy 1,0000 en el test sellado interno.
- Inferencia de lenguaje natural: familias evidence_mnli (macro-F1 0,8596) y evidence_wanli (macro-F1 0,7557).
- Selección de opciones de menú: familia menu con accuracy 0,9932.
- Soporte a procedimientos: familia procedural con accuracy 1,0000.
- Detección de incertidumbre: familia uncertainty con accuracy 1,0000.
- Inferencia local: CLI de Node/Electron y `score.py`; la evidencia permanece en el equipo. Backends cpu, auto, cuda, metal y vulkan.
- No documenta generación de texto, explicaciones, tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Multilingüe: no; solo inglés documentado.

## Casos de uso

- Clasificación de tickets de soporte: se pasa el texto del ticket como evidencia, una política de categorías como criterio y entre 2 y 16 categorías como opciones; el modelo devuelve la puntuación por categoría. Es adecuado porque CLINC150 forma parte del entrenamiento y la inferencia es una sola pasada, sin generar texto.
- Triaje de alertas de ciberseguridad: evidencia (log o alerta) + criterio de severidad + opciones (baja, media, alta, crítica). La familia cyber obtuvo accuracy 1,0000 en el test sellado interno; sirve para preclasificar antes de un analista humano.
- Verificación de afirmaciones y NLI: evidencia documental + afirmación + opciones (implicación, neutral, contradicción). Las familias MNLI/WANLI tienen macro-F1 0,8596 y 0,7557; encaja en pipelines de comprobación con evidencia local.
- Selección de opciones en menús de aplicación: contexto del usuario + criterio de idoneidad + opciones del menú. La familia menu logra 0,9932 de accuracy y se puede integrar en una app Electron sin enviar datos.
- Asistente de procedimientos: estado actual + reglas del procedimiento + posibles siguientes pasos. La familia procedural tiene accuracy 1,0000; es adecuado para guiar paso a paso con alternativas cerradas.
- Detección de incertidumbre y abstención: evidencia + criterio de suficiencia + opciones (responder, pedir más datos, escalar, no disponible). La familia uncertainty logra 1,0000; útil para decidir cuándo un sistema debe abstenerse.
- Enrutamiento de consultas en backend: evidencia + criterio de dominio + opciones de cola o modelo. El scoring en una pasada y la salida por opción permiten decidir el destino sin generar una respuesta.
- Cumplimiento de políticas: evidencia + política + opciones (permitir, revisar, bloquear). No hay una familia específica en la evaluación, pero el modelo puntúa alternativas cerradas; conviene validar con datos propios antes de producción.

## Benchmarks y rendimiento

Los datos siguientes son de splits internos congelados, no benchmarks externos independientes. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks externos en la información disponible.

| Comprobación | Puntuación agregada (equal-family) |
|---|---:|
| Validación del base congelado | 0,8194 |
| Validación del export fusionado (BF16) | 0,9445 |
| Validación nativa single-row FP32 | 0,9445 |
| Validación con GGUF F16 | 0,9437 |
| Test sellado nativo single-row FP32 | 0,8976 |

| Familia del test sellado | Métrica | Puntuación |
|---|---|---:|
| classification | macro_f1 | 0,6746 |
| cyber | accuracy | 1,0000 |
| evidence_mnli | macro_f1 | 0,8596 |
| evidence_wanli | macro_f1 | 0,7557 |
| menu | accuracy | 0,9932 |
| procedural | accuracy | 1,0000 |
| uncertainty | accuracy | 1,0000 |

El GGUF F16 coincide con las elecciones nativas en el 99,97 % de las filas de validación; la variación total media/máxima de las probabilidades por opción es 0,00007. El test sellado se abrió solo después de la selección del checkpoint y de las comprobaciones de validación y recarga de los pesos fusionados.

## Requisitos de hardware

- Pesos BF16: 7.463.013.376 parámetros × 2 bytes ≈ 14,9 GB. El GGUF F16 ocupa 13,917 GiB (dato del autor).
- Inferencia nativa FP32: el loader lee BF16 y calcula en FP32; necesita aproximadamente el doble de memoria de pesos que la representación de 16 bits, alrededor de 28 GiB solo para pesos, más caché KV en FP32 y activaciones. Una GPU de 24 GB no cubre la ruta FP32 completa; se recomienda A100 40 GB, H100 o similar.
- GGUF F16 en GPU: 24 GB (RTX 4090, RTX 3090, A10G 24 GB) deja margen para caché; 16 GB puede ser ajustado y depende de las capas offload y del caché. En CPU es posible con el backend cpu, pero no hay datos de latencia.
- Backends: cpu, auto, cuda, metal y vulkan. La ruta FP32 CUDA nativa exige exactamente una GPU CUDA. Flash attention está deshabilitado y el caché KV es FP32.
- Despliegue: CLI de Electron/Node (Node 22.12 o superior), ventana Electron y `score.py`. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp; el modelo no es generativo y usa un contrato de inferencia propio (`gguf-inference.json`).
- Los nombres E2B/E4B del upstream denotan tamaños efectivos; para dimensionar, usar el tamaño de fichero medido y la memoria en runtime. Latencia y throughput no publicados; la inferencia es single-row, sin batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/prompt | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Worthify/Decision-1-E4B | 7.463.013.376 | 2.048 tokens de prompt | Validación fusionada 0,9445; test sellado 0,8976 (interno) | Apache-2.0 | HuggingFace; BF16 + GGUF F16 |
| google/gemma-4-E4B-it | No disponible | No disponible | Base congelado 0,8194 con el mismo protocolo interno | No disponible en la información | HuggingFace, revisión fijada |
| Worthify/Decision-1 (12B) | 12B (según la model card) | No disponible | No disponible | No disponible en la información | HuggingFace, familia Decision-1 |

No se dispone de comparaciones con clasificadores dedicados o LLM generativos externos en la información proporcionada.

## Limitaciones y advertencias

- No genera respuestas ni explicaciones; solo puntúa opciones declaradas. No sirve para preguntas abiertas sin un conjunto cerrado de alternativas.
- Las puntuaciones no están calibradas como confianza de decisión; no deben interpretarse como probabilidades calibradas de acierto.
- Solo inglés documentado. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Límite de 2.048 tokens de prompt; los prompts mayores se rechazan en lugar de truncarse. Evidencia más larga requiere troceado o resumen fuera del modelo.
- Evaluación interna: los resultados no son benchmarks externos. classification (macro-F1 0,6746) y evidence_wanli (macro-F1 0,7557) son los valores más bajos; el rendimiento puede caer fuera de las familias evaluadas.
- No se documenta una evaluación de sesgos o fairness. Las fuentes CLINC150, WANLI y MultiNLI pueden introducir sesgos de dominio, anotación o estilo.
- La licencia declarada es apache-2.0; al derivar de Gemma 4, conviene verificar los términos del modelo base y de las dependencias antes de un uso comercial. Las fuentes de datos tienen CC-BY-3.0, CC-BY-4.0, OANC y MIT; los registros crudos de terceros no se redistribuyen.
- Empaquetado Electron: los módulos nativos y los ficheros GGUF deben quedar fuera de ASAR; Linux requiere un sandbox de Chromium operativo. La validación en Linux no garantiza compatibilidad con Windows o macOS. El renderer no tiene Node ni red, solo IPC de estado/scoring.
- Ruta FP32 nativa: requiere exactamente una GPU CUDA; `AutoModelForCausalLM` no reinstala el hook final-softcap, hay que usar `score.py`. FP32 necesita aproximadamente el doble de memoria de pesos. Flash attention deshabilitado y caché KV FP32 elevan el consumo.
- Inferencia single-row: sin batching; no se publican latencia ni throughput.
- La política de fusión se enmendó tras un fallo de exportación del 0.6B en una igualdad exacta; el intento fallido y la revisión independiente están en `evidence/merge-policy-amendment.json`. Las métricas notificadas usan el argmax ordinario por primer índice.
- No documenta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Enlaces

- [HuggingFace: Worthify/Decision-1-E4B](https://huggingface.co/Worthify/Decision-1-E4B)
- [Familia Decision-1](https://huggingface.co/Worthify/Decision-1)
- [Modelo base google/gemma-
