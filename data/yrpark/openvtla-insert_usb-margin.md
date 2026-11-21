# yrpark/openvtla-insert_USB-margin

## Resumen

`openvtla-insert_USB-margin` es un checkpoint de política robótica (vision-language-action, VLA) desarrollado por el usuario yrpark. Se trata de una reimplementación al estilo OpenVTLA del modelo pi0.5 combinado con el encoder táctil AnyTouch2, entrenada sobre la tarea de simulación `insert_USB` del conjunto de datos OpenViTac, con cámara GelSight Mini y 100 demostraciones. El repositorio contiene únicamente los pesos finales del entrenamiento (paso 19999) más las estadísticas de normalización; no incluye el estado del optimizador.

El modelo parte de la misma arquitectura, datos, features cacheadas e hiperparámetros que el modelo base `yrpark/openvtla-insert_USB`, y añade tres términos de pérdida que solo actúan durante el entrenamiento (la inferencia es idéntica al base): un margen contrastivo táctil, una máscara aleatoria de features visuales y una alineación InfoNCE entre tokens táctiles y tokens de la cámara de muñeca. El resultado es un checkpoint de 6,4 GB pensado para servirse con el framework `tactile_base` y evaluarse en el simulador.

Su relevancia es acotada y experimental: se publica como artefacto de investigación reproducible (código, revisión de datos y configuración documentados), con evaluación en simulador aún pendiente y sin métricas de éxito publicadas. No es un modelo de propósito general ni un modelo de lenguaje: es una política de manipulación con entrada táctil y visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 con adaptadores LoRA (gemma_2b_lora + gemma_300m_lora) y encoder táctil AnyTouch2 (OpenVTLA-style) |
| Parametros totales | no disponible (repo de 6,4 GB; los pesos incluyen adaptadores LoRA sobre Gemma 2B y Gemma 300M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/` para inferencia, `assets/` con estadísticas de normalización) |
| Tokens táctiles | 18 (cls_pool2) |
| Entrenamiento | 20k pasos, batch 64 (16 x 4 acumulación de gradiente), 1x RTX 3090 |
| Features táctiles | AnyTouch2 checkpoint-4frames |
| Dataset | FVL-Lab/OpenViTac rev 5fb2757b88826917242adefd9196424ef8cf2d98, `insert_USB` (simulación, GelSight Mini, 100 demos) |

## Arquitectura y entrenamiento

El modelo sigue el esquema OpenVTLA: un backbone VLA tipo pi0.5 (con adaptadores LoRA sobre Gemma 2B y Gemma 300M) que consume tokens visuales post-SigLIP y tokens táctiles procedentes del encoder AnyTouch2, y produce secuencias de acciones con horizonte 50. La entrada táctil se resume en 18 tokens mediante `cls_pool2`. El entrenamiento se realizó sobre features cacheadas del dataset OpenViTac, con la misma configuración que el modelo base.

Sobre esa base se añaden tres pérdidas exclusivas de entrenamiento: (1) un margen contrastivo táctil (`tactile_margin_weight` 1.0, `tactile_margin_base` 0.1, `tactile_neg_mode` `batch_far`, `tactile_dref_pct` 50) que exige que el táctil real supere al táctil erróneo más lejano del batch por un margen escalado por distancia; (2) un enmascarado aleatorio de features visuales sobre los tokens post-SigLIP (`vision_feature_mask_prob` 0.1); y (3) una alineación InfoNCE de los tokens táctiles agrupados con los tokens limpios de la cámara de muñeca (`tactile_align_weight` 0.1, `tactile_align_temp` 0.1). El entrenamiento se ejecutó en una única RTX 3090 durante 20k pasos, finalizado el 2026-11-21, con una pérdida final de entrenamiento de ~0.0025 (no comparable directamente con la pérdida flow del modelo base, al incluir los términos auxiliares). El log cubre los pasos 6050-19950; el primer segmento previo a la reanudación no se conservó.

## Capacidades

- Generación de acciones de manipulación para la tarea concreta `insert_USB` en simulación, condicionada por observaciones visuales y táctiles.
- Fusión multimodal visión-táctil: integra imágenes de cámara (incluida la de muñeca) con lecturas de sensor GelSight Mini.
- Control con horizonte de acción de 50 pasos.
- Aprendizaje por imitación a partir de 100 demostraciones (no se documenta RLHF ni DPO).
- Inferencia servida mediante el framework `tactile_base` con el comando `serve_policy.py`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modo thinking: es una política robótica, no un modelo conversacional.
- No se documentan capacidades de propósito general fuera de la tarea entrenada.

## Casos de uso

- Investigación en manipulación táctil: reproducir el experimento de inserción de USB en simulación con el checkpoint y el código publicados, comparando el efecto de las tres pérdidas auxiliares frente al modelo base.
- Estudio de representaciones táctiles: evaluar si el margen contrastivo y la alineación InfoNCE mejoran la robustez del policy cuando el sensor táctil aporta señal ambigua.
- Ablación controlada: al compartir datos, features y arquitectura con `yrpark/openvtla-insert_USB`, permite aislar el impacto de `tactile_margin_weight`, `vision_feature_mask_prob` y `tactile_align_weight`.
- Robustez a oclusión visual: la máscara de features visuales (probabilidad 0.1) está pensada para que la política dependa menos de la cámara; útil en escenarios simulados con oclusiones parciales.
- Docencia y divulgación: ejemplo reproducible de pipeline VLA con entrada táctil sobre una sola GPU de consumo (RTX 3090).
- Base para fine-tuning en tareas de inserción similares: el checkpoint puede servir de inicialización para otras tareas de ensamblaje en OpenViTac, siempre que se respete la licencia.
- Validación de infraestructura de despliegue: probar el servidor `serve_policy.py` de `tactile_base` en un entorno controlado antes de escalar a otras políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación en simulador está pendiente ("Simulator evaluation: pending"), por lo que no existen tasas de éxito ni métricas de la tarea `insert_USB` para este checkpoint.

## Requisitos de hardware

- Entrenamiento documentado: 1x RTX 3090 (24 GB), batch efectivo 64 con acumulación de gradiente 4.
- VRAM para inferencia: no disponible de forma explícita; el repo pesa 6,4 GB, por lo que en precisión completa requiere al menos ese orden de magnitud, y previsiblemente cabe en GPUs de 24 GB.
- GPU recomendadas: RTX 3090 (probada en entrenamiento); A100/H100 no documentadas pero compatibles en principio con el stack openpi.
- Cabe en GPU de consumo: sí, al menos en RTX 3090 según el entrenamiento reportado; no se documentan pruebas en GPUs de 8-16 GB.
- Despliegue: framework `tactile_base` (script `serve_policy.py` con configuración `openvtla_insert_USB_margin`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Datos | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yrpark/openvtla-insert_USB-margin` (este) | pi0.5 + AnyTouch2, LoRA, 3 pérdidas auxiliares | OpenViTac `insert_USB`, 100 demos | Horizonte 50 | other | Hugging Face, checkpoint 19999 |
| `yrpark/openvtla-insert_USB` (base) | pi0.5 + AnyTouch2, LoRA | Mismos datos y features | Horizonte 50 | other | Hugging Face |
| Otras políticas VLA con entrada táctil | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base, del que solo difiere en las tres pérdidas de entrenamiento; no se dispone de métricas para cuantificar la diferencia de rendimiento.

## Limitaciones y advertencias

- Evaluación en simulador pendiente: no hay evidencia publicada de que el checkpoint funcione mejor (ni igual) que el modelo base.
- Pérdida de entrenamiento no comparable: ~0.0025 incluye los términos auxiliares, por lo que no debe interpretarse como mejora sobre la pérdida flow del base.
- Log incompleto: `train_log.txt` solo cubre los pasos 6050-19950; falta el primer segmento previo a la reanudación.
- Alcance muy restringido: entrenado únicamente para `insert_USB` en simulación con GelSight Mini y 100 demostraciones; no se espera generalización a otras tareas o sensores sin fine-tuning.
- Riesgo de sobreajuste a la simulación: no se documenta evaluación en hardware real ni transferencia sim-to-real.
- Licencia "other": no se detallan los términos; es imprescindible revisar las condiciones del autor y de los componentes subyacentes (pi0.5, Gemma, AnyTouch2) antes de cualquier uso comercial.
- Sin datos de sesgos, idiomas ni alucinación: no aplican las métricas habituales de modelos de lenguaje, pero tampoco se documentan análisis de robustez.
- No incluye `train_state/`: el checkpoint no permite reanudar el entrenamiento tal cual, solo inferencia.
- Cero descargas y cero likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-insert_USB-margin
- Modelo base: https://huggingface.co/yrpark/openvtla-insert_USB
- Código `tactile_base` (commit ddebb8e): https://github.com/YuriPark0123/tactile_base
- Dataset OpenViTac (rev 5fb2757b88826917242adefd9196424ef8cf2d98): https://huggingface.co/datasets/FVL-Lab/OpenViTac
- Repositorio openpi: no disponible en la informacion proporcionada
- Paper de pi0.5: no disponible en la informacion proporcionada
- Paper de AnyTouch2: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
