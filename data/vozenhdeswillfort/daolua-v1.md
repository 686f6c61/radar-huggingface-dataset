# VozenhDesWillfort/daolua-v1

## Resumen

ĐẢO LỬA V1 (identificador interno `ckpt_v10_5_pi2`) es un modelo de clasificación multitaréa de pequeño tamaño (144.292.870 parámetros, es decir, unos 140M) desarrollado por el equipo Dark Lag (HCMUT — MoMo TechDay'26). Se trata de un fine-tuning del modelo base `SupersonicLabs/Julia-1`, que combina un encoder `mmBERT-small` con una cabeza de decisión de opción múltiple. El modelo se distribuye en formato ONNX FP32 (~579 MB) para inferencia en CPU y en `safetensors` (~577 MB) para reentrenamiento.

El modelo resuelve tres tareas de seguridad de forma simultánea: detección de estafas en vietnamita (veredicto `safe` / `uncertain` / `scam`), generación de cinco señales explicativas (`sig_otp`, `sig_urgency`, `sig_impersonation`, `sig_payment`, `sig_link_app`) y detección de prompt injection con enrutamiento de segunda capa para proteger asistentes RAG y agentes frente a instrucciones ocultas, sobrescritura de reglas y extracción de system prompts.

Su relevancia actual radica en que ofrece inferencia en CPU de gama baja (~140-150 ms por pasada en 2 núcleos) con un rendimiento en detección de prompt injection muy superior al baseline ProtectAI DeBERTa-v3-v2 en los conjuntos evaluados, lo que lo hace apto para despliegues edge y para actuar como primera capa de filtrado en pipelines de seguridad de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT-small (encoder) + cabeza de decisión multitaréa (JuliaDecisionModel) |
| Parametros totales | 144.292.870 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (ONNX y safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX FP32 (`onnx/model_fp32.onnx`), safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `SupersonicLabs/Julia-1`, que integra un encoder `mmBERT-small` con una cabeza de decisión de opción múltiple. La configuración del head incluye `head_layers=2` y `n_act=2`. El checkpoint se exporta a ONNX FP32 para ejecución directa con `onnxruntime` sin necesidad de PyTorch, y se conserva el peso en safetensors para fine-tuning posterior. El tokenizer es compatible con `transformers>=5.0,<5.1`.

En cuanto a datos, la model card cita el uso de `uiuc-kang-lab/InjecAgent` (MIT) únicamente para evaluación OOD, `microsoft/BIPIA` (MIT) con separación train/test, un conjunto propio de inyección indirecta en fintech vietnamita, el dataset `vietnamese_sms_dataset` (CC BY 4.0) y `Thormia/Vietnamese-Scam-Message-Detection` (MIT), además de casos reales anonimizados. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible.

## Capacidades

- Clasificación de estafas en vietnamita con tres etiquetas: `safe`, `uncertain` y `scam`.
- Generación de cinco señales explicativas independientes: OTP, urgencia, suplantación de identidad, pago y enlace/aplicación.
- Detección de prompt injection directa e indirecta, tanto en inglés como en vietnamita.
- Enrutamiento de segunda capa (AI Router) para derivar casos dudosos a un modelo de decisión superior (`gemini-decision-1`).
- Protección de asistentes RAG y agentes frente a instrucciones ocultas, sobrescritura de reglas y extracción de system prompt.
- Inferencia en CPU sin GPU, con latencia de ~149,6 ms por pasada en 2 núcleos.
- Soporte de ventana deslizante (sliding window 280/220) y extracción de citas entre comillas en el servidor de referencia.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión ni audio; es un modelo exclusivamente clasificador.
- No se documenta soporte de tool calling ni de razonamiento multi-paso más allá del enrutamiento a dos capas.

## Casos de uso

- Filtrado de entrada en asistentes RAG: el modelo se coloca como Tier 1 antes del LLM generativo para bloquear instrucciones ocultas en documentos recuperados; su AUC de 0,9879 en BIPIA y 0,9764 en inyección indirecta fintech vietnamita lo hace adecuado para esta función.
- Moderación de SMS y mensajes de banca móvil en Vietnam: clasifica mensajes como `scam` o `safe` y aporta señales explicativas (OTP, urgencia, suplantación) que permiten mostrar al usuario por qué se marca un mensaje como sospechoso.
- Protección de agentes con acceso a herramientas: al detectar intentos de sobrescritura de reglas o extracción de system prompt, puede cortar la cadena antes de que el agente ejecute acciones no deseadas.
- Enrutamiento inteligente en pipelines de seguridad: los casos con veredicto `uncertain` o señales de inyección se derivan a un modelo de segunda capa (`gemini-decision-1`), logrando un recall del 100% en el conjunto de 26 casos adversariales vietnamitas según la model card.
- Despliegue en edge o entornos sin GPU: al ejecutarse con `onnxruntime` en CPU de 2 núcleos con ~150 ms por pasada, es viable en pasarelas de API, contenedores ligeros o dispositivos con recursos limitados.
- Análisis forense y triaje de incidentes: las cinco señales explicativas permiten clasificar y priorizar tickets de fraude entrante en un SOC o equipo de soporte antifraude.
- Servicio de API con FastAPI: la model card incluye instrucciones para levantar un endpoint (`uvicorn app:app --app-dir server --port 8088`) con variables de entorno `DAOLUA_CKPT`, `DAOLUA_MODEL_NAME` y `DAOLUA_ENGINE`.

## Benchmarks y rendimiento

Detección de estafas en vietnamita (conjuntos holdout/OOD):

| Conjunto | Muestras | ROC-AUC | PR-AUC | FPR @0.5 | FNR @0.5 | FPR @0.3 | FNR @0.3 |
|---|---:|---:|---:|---:|---:|---:|---:|
| realcases_v2_holdout.csv | 32 | 0.875 | 0.949 | 0.125 | 0.542 | 0.125 | 0.375 |
| realcases_v3_holdout.csv | 66 | 0.870 | 0.821 | 0.071 | 0.542 | 0.095 | 0.375 |
| testAIL.csv (Thormia, MIT) | 401 | 0.858 | 0.883 | 0.020 | 0.515 | 0.050 | 0.440 |

Señales explicativas (`sig_test_test.json`, n=300):

| Señal | AUC | Coincidencia |
|---|---:|---:|
| sig_otp | 0.972 | 93.0% |
| sig_urgency | 0.925 | 89.7% |
| sig_impersonation | 0.935 | 87.3% |
| sig_payment | 0.943 | 91.3% |
| sig_link_app | 0.990 | 95.7% |

Detección de prompt injection frente a baseline:

| Modelo | InjecAgent OOD (600, EN) | BIPIA Test (400, EN) | VI Indirect Fintech (120, VI) | CPU 2 núcleos |
|---|---|---|---|---|
| ProtectAI DeBERTa-v3-v2 | AUC 0.5011 · F1 0.583 | AUC 0.3845 · F1 0.317 | AUC 0.6153 · F1 0.594 | 546.7 ms |
| ĐẢO LỬA V1 (ONNX FP32) | AUC 0.7842 · F1 0.734 | AUC 0.9879 · F1 0.944 | AUC 0.9764 · F1 0.906 | 149.6 ms (1 pasada) · 301.1 ms (2 pasadas) |

Sistema de dos capas (Tier 1 + `gemini-decision-1`) sobre 26 casos adversariales vietnamitas:

| Configuración | Recall | Accuracy | F1 | ROC-AUC | FPR | Latencia mediana |
|---|---|---|---|---|---|---|
| Tier 1 solo | 50.0% (8/16) | no disponible | no disponible | 0.7969 | no disponible | 189 ms |
| Sistema 2 capas | 100.0% (16/16) | 96.15% (25/26) | 0.9697 | 0.9750 | 10.0% (1/10) | 408 ms |

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia ONNX FP32 en CPU; el modelo ocupa ~579 MB en disco y puede ejecutarse en RAM sin GPU.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU con suficiente memoria para cargar ~579 MB podría ejecutarlo, pero no se documenta rendimiento en GPU.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB de pesos), aunque no se han publicado cifras de latencia en GPU.
- Opciones de despliegue: `onnxruntime` (recomendado para producción), PyTorch con `transformers>=5.0,<5.1` para fine-tuning, y servidor FastAPI de referencia (`uvicorn app:app --app-dir server`).
- Latencia y throughput: ~149,6 ms por pasada en CPU de 2 núcleos con `OMP_NUM_THREADS=2`; ~301,1 ms en configuración de 2 pasadas; mediana de 189 ms para Tier 1 y 408 ms para el sistema de dos capas en los 26 casos adversariales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ĐẢO LỬA V1 | 144,3M | no disponible | Clasificación antifraude + anti-prompt-injection (vi/en) | Apache 2.0 | Hugging Face (ONNX + safetensors) |
| ProtectAI DeBERTa-v3-v2 | no disponible | no disponible | Detección de prompt injection (EN) | no disponible | no disponible en la información proporcionada |
| SupersonicLabs/Julia-1 | no disponible | no disponible | Modelo base con encoder mmBERT-small + decision head | no disponible | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría (clasificadores antifraude en vietnamita) en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un clasificador, no un generador: no produce texto libre ni responde preguntas; su salida son etiquetas y señales.
- El FNR en detección de estafas es elevado en el umbral 0.5 (0.542 en realcases_v2 y v3), lo que implica que más de la mitad de los casos positivos no se detectan con ese umbral; se recomienda ajustar el umbral o combinar con una segunda capa.
- El FPR del sistema de dos capas es del 10% (1/10) en el conjunto adversarial, lo que puede generar falsos positivos en producción.
- Los conjuntos de evaluación de estafas son pequeños (32 y 66 muestras), por lo que las métricas tienen alta varianza.
- El soporte lingüístico se limita a vietnamita e inglés; no se documenta rendimiento en castellano ni en otros idiomas.
- No se especifica la longitud de contexto soportada, lo que limita el diseño de pipelines con documentos largos sin pruebas previas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `SupersonicLabs/Julia-1` podría tener condiciones adicionales no detalladas en la información disponible.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea en dominios distintos a los de entrenamiento (fintech vietnamita y SMS).
- No se documentan sesgos demográficos ni de dominio; se desconoce su comportamiento en variedades dialectales del vietnamita.
- La fecha de creación del repositorio (2026-11-27) y la ausencia de descargas y likes indican que es un modelo reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/VozenhDesWillfort/daolua-v1
- Modelo base: https://huggingface.co/SupersonicLabs/Julia-1
- InjecAgent (UIUC-Kang Lab): https://github.com/uiuc-kang-lab/InjecAgent
- BIPIA (Microsoft): https://github.com/microsoft/BIPIA
- Thormia/Vietnamese-Scam-Message-Detection: https://huggingface.co/datasets/Thormia/Vietnamese-Scam-Message-Detection
- ProtectAI DeBERTa-v3-v2: no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
