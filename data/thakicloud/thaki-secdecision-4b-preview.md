# ThakiCloud/Thaki-SecDecision-4B-Preview

## Resumen

Thaki-SecDecision-4B-Preview es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por ThakiCloud, que aborda una tarea muy concreta dentro del ámbito de la seguridad: determinar si un conjunto de evidencias es suficiente para sostener o refutar una afirmación de seguridad (claim). A diferencia de un modelo generativo, no produce texto libre: recibe una afirmación con sus hechos requeridos y una lista de evidencias, y devuelve una etiqueta de decisión (SUPPORTED, REFUTED, INSUFFICIENT o CONFLICTED), los identificadores de evidencia que apoyan o refutan, los hechos requeridos no satisfechos y un indicador de si se puede concluir.

La propuesta es relevante porque separa la verificación de evidencias del razonamiento generativo, aplicando una regla determinista (Rule B) sobre las salidas de unas cabezas de decisión en fp32. Es el hermano ligero del modelo Thaki-SecDecision-27B-V2, con el que comparte formato de entrada, estructura de cabezas y regla de decisión, lo que facilita experimentar con un coste computacional mucho menor.

El modelo se publica como research preview y su propia model card advierte de que no ha superado una verificación independiente preregistrada (el holdout terminó en ABORT_OVERLAP por solapamiento con el conjunto de entrenamiento) y de que no está validado sobre logs reales de SOC ni listo para producción. Es, por tanto, una pieza de investigación para evaluar pipelines de verificación de claims, no un componente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r 16, α 32, dropout 0.05) sobre transformer Qwen/Qwen3.5-4B, con cabezas de decisión fp32 y regla determinista Rule B |
| Parametros totales | No disponible (adaptador LoRA sobre base de 4B; tamaño del repo 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens máximo; entradas más largas se rechazan, no se truncan |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; base en bf16) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + heads.pt (cabezas fp32) |

## Arquitectura y entrenamiento

El modelo combina un backbone congelado Qwen/Qwen3.5-4B (revisión 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a, bf16, atención SDPA) con un adaptador LoRA aplicado en las capas 24 a 31, con rango 16, alpha 32 y dropout 0.05, sobre los módulos q/k/v/o_proj, gate/up/down_proj, in_proj_qkv, in_proj_z, in_proj_a, in_proj_b y out_proj. Sobre la representación resultante se aplican cuatro cabezas de decisión en fp32 (relación, hecho, estado y suficiencia) y, finalmente, la regla determinista Rule B, que produce la salida estructurada. No hay generación de texto ni muestreo: una única pasada forward más las cabezas y la regla.

El entrenamiento se realizó en dos fases sobre el conjunto sintético claimworld-v1. La fase 1 fue supervisada sobre 40.002 ejemplos del split de entrenamiento, seleccionando el checkpoint ckpt-3200 sobre TRAIN_DEV. La fase 2, que corresponde a los pesos publicados, consistió en una continuación "Gold-only" desde ckpt-3200 durante 400 pasos, sin destilación, seleccionando el paso 300 sobre TRAIN_DEV. El umbral τ = 0.3484134802001108 se fijó sobre CALIB para un objetivo de False-ENOUGH ≤ 0.01 y no se ha modificado desde entonces. La regla y la estructura de entrada son idénticas byte a byte a las del modelo 27B-V2.

## Capacidades

- Clasificación de suficiencia de evidencia: devuelve SUPPORTED, REFUTED, INSUFFICIENT o CONFLICTED para una claim de seguridad.
- Identificación de evidencia de apoyo y de refutación mediante los evidence_id de entrada.
- Detección de hechos requeridos no satisfechos (missing_required_facts).
- Indicador booleano can_conclude que señala si el modelo considera que puede emitir una conclusión.
- Puntuación de suficiencia (sufficiency_score) por ejemplo.
- Salida estructurada en JSON, apta para integrarse en pipelines automatizados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a inglés y coreano.
- Capacidades especiales: no es un modelo generativo, no soporta thinking mode, visión ni audio; no funciona con el pipeline estándar de transformers text-classification.

## Casos de uso

- Verificación automática de hallazgos de seguridad: dado un claim generado por un analista o por otro modelo (por ejemplo, "el host X está expuesto a CVE-2024-0001"), el modelo evalúa si las evidencias recopiladas (telemetría, logs, registros de inventario) bastan para sostenerlo, devolviendo los evidence_id que lo respaldan o lo refutan.
- Triaje en pipelines de alertas: integrado como paso previo a la escalada, filtra claims con evidencia insuficiente (INSUFFICIENT) antes de que lleguen a un analista humano, reduciendo carga sobre el SOC.
- Control de calidad de informes de threat intelligence: comprobar que cada afirmación de un informe está respaldada por hechos requeridos y evidencias citadas, detectando lagunas (missing_required_facts) de forma estructurada.
- Evaluación de asistentes de seguridad basados en LLM: usar el modelo como juez determinista de suficiencia para medir si las respuestas de un asistente generativo están bien fundamentadas, con salida JSON auditable.
- Investigación en verificación de claims: al compartir formato, cabezas y regla con el 27B-V2, sirve como banco de pruebas ligero para estudiar el efecto del tamaño del backbone en la tarea de suficiencia de evidencia.
- Enrutado de decisiones en automatización de respuesta: en flujos donde una acción (bloqueo, cuarentena, cierre de ticket) depende de una claim, el campo can_conclude y la etiqueta de estado permiten decidir si se actúa automáticamente o se deriva a revisión.

## Benchmarks y rendimiento

Los únicos resultados publicados corresponden al split CALIB (n = 2.004), el mismo que fijó τ, y se comparan con el checkpoint de fase 1. No son un test independiente.

| Metrica (CALIB, n = 2.004) | 4B-Preview (fase 2, paso 300) | Fase 1 4B (ckpt-3200) |
|---|---|---|
| False-ENOUGH (gold cannot-conclude, predicho conclude) | 0,0060 | 0,0045 |
| ENOUGH recall | 0,8548 | 0,8323 |
| FULL recall | 0,7305 | 0,6976 |
| REFUTE_COVERAGE recall | 0,979 | 0,9671 |

La model card indica que los objetivos de desarrollo del proyecto eran FULL ≥ 0,80 y ENOUGH ≥ 0,88, y que este modelo no los alcanza. El holdout preregistrado (dev, n = 3.000) terminó en ABORT_OVERLAP por un 1,93% de ejemplos casi duplicados respecto al entrenamiento (límite del 1%), por lo que no se evaluó. Un holdout post-hoc filtrado por casi-duplicados (n = 2.942) pasó sus puertas (FILTERED_PASS), pero procede del mismo generador sintético y no constituye un test independiente. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un backbone de 4B en bf16 más un adaptador LoRA pequeño y cabezas fp32, la inferencia requiere cargar el modelo base completo, lo que sitúa el consumo en el orden de una GPU con suficiente memoria para un modelo de 4B en bf16.
- GPU recomendadas: no disponible en la documentación; el entorno de referencia indicado es Linux con GPU NVIDIA y toolchain CUDA 13.x.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; dependería de la memoria necesaria para el backbone de 4B.
- Opciones de despliegue: no se soporta el pipeline estándar de transformers; el despliegue debe hacerse con inference.py o secdecision_v2_infer.py, que cargan el adaptador, las cabezas y aplican Rule B. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Dependencias: PyTorch 2.13.0 desde el índice CUDA 13.0, dependencias fijadas en requirements.txt y causal-conv1d 1.7.0 compilado contra el torch instalado (pip install --no-build-isolation).
- Latencia y throughput: no disponibles; la model card solo indica que se ejecuta una pasada forward, sin generación ni muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| Thaki-SecDecision-4B-Preview | Backbone 4B + LoRA | 4.096 tokens | Suficiencia de evidencia (clasificación) | Apache 2.0 | Research preview, sin test independiente |
| Thaki-SecDecision-27B-V2 | 27B (referencia del autor) | No disponible | Suficiencia de evidencia, mismo formato y regla | No disponible | Modelo de referencia del que este es hermano ligero |
| Alternativas genéricas de clasificación (p. ej. pipelines transformers) | Variable | Variable | Clasificación de texto estándar | Variable | No aplicables directamente: este modelo requiere cabezas y regla propias |

No se dispone de datos de benchmarks comparativos con modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- No ha superado una verificación independiente preregistrada: el holdout dev terminó en ABORT_OVERLAP por un 1,93% de casi-duplicados respecto al entrenamiento.
- El resultado FILTERED_PASS procede de un holdout post-hoc del mismo generador sintético, no de un test independiente.
- Los números de CALIB provienen del mismo split que fijó τ, por lo que están sesgados hacia ese punto de operación.
- No cumple los objetivos internos del proyecto (FULL ≥ 0,80 y ENOUGH ≥ 0,88): FULL recall 0,7305 y ENOUGH recall 0,8548.
- No está validado sobre logs reales de SOC ni como sustituto del modelo 27B-V2.
- No está listo para producción según la propia model card.
- No es un pipeline estándar de transformers: usar pipeline("text-classification", ...) no lo carga correctamente.
- No debe usarse el adaptador de forma aislada: requiere heads.pt y Rule B con el τ de config.json.
- Contexto limitado a 4.096 tokens; las entradas más largas se rechazan en lugar de truncarse.
- Idiomas limitados a inglés y coreano.
- Riesgo de sesgo y alucinación no cuantificado en la información disponible; al ser un clasificador determinista, el riesgo se traslada a falsos positivos/negativos en la decisión.
- Licencia Apache 2.0 permite uso comercial, pero el estado de research preview y la falta de validación desaconsejan cualquier despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-SecDecision-4B-Preview
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-SecDecision-4B-Preview/blob/main/MODEL_CARD.ko.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Índice oficial de PyTorch CUDA 13.0: https://download.pytorch.org/whl/cu130
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
