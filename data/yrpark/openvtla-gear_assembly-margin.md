# yrpark/openvtla-gear_assembly-margin

## Resumen

`yrpark/openvtla-gear_assembly-margin` es un checkpoint de política robótica (vision-language-action, VLA) construido sobre pi0.5 con un codificador táctil AnyTouch2, en una reimplementación de estilo OpenVTLA. Lo desarrolla el usuario de Hugging Face yrpark y está entrenado sobre el conjunto `gear_assembly` de OpenViTac, una simulación con sensores GelSight Mini y 100 demostraciones. El modelo resuelve la tarea concreta de ensamblaje de engranajes a partir de observaciones visuales y táctiles, no es un modelo de lenguaje general.

La relevancia técnica está en la incorporación de señal táctil real al pipeline de una política VLA: el checkpoint añade tres pérdidas auxiliares solo de entrenamiento (margen contrastivo táctil, máscara de características visuales e InfoNCE entre táctil y muñeca) manteniendo la inferencia idéntica al modelo base `yrpark/openvtla-gear_assembly`. El resultado es un artefacto de investigación reproducible, con código, datos y configuración documentados, pero sin evaluación en simulador publicada todavía.

El repositorio ocupa 6,4 GB y contiene únicamente el checkpoint final de openpi (paso 19999) con parámetros y estadísticas de normalización. No hay pesos en formato GGUF ni safetensors genéricos, ni pipeline de Hugging Face declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 + codificador táctil AnyTouch2 (reimplementación OpenVTLA) |
| Parametros totales | no disponible (LoRA sobre gemma_2b_lora y gemma_300m_lora) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica, no conversacional) |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/` + `assets/` con estadísticas de normalización) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, una política vision-language-action, y le añade un codificador táctil AnyTouch2 cuyas características se cachean a partir del checkpoint `checkpoint-4frames`. La configuración usa 18 tokens táctiles (`cls_pool2`) y un horizonte de predicción de 50 pasos. El ajuste se realiza con LoRA sobre los módulos `gemma_2b_lora` y `gemma_300m_lora`, lo que reduce el coste de entrenamiento frente a un ajuste completo.

El entrenamiento cubre 20 000 pasos con batch efectivo de 64 (16 × 4 de acumulación de gradiente), ejecutado en una NVIDIA B200 entre el 21 y el 22 de noviembre de 2026 (hora coreana), con una reanudación desde el paso 6000. Los datos son 100 demostraciones de simulación del conjunto `gear_assembly` de OpenViTac (revisión `5fb2757b`). Respecto al modelo base, se añaden tres pérdidas exclusivas de entrenamiento: un margen contrastivo táctil (`tactile_margin_weight=1.0`, `tactile_margin_base=0.1`, `tactile_neg_mode=batch_far`, `tactile_dref_pct=50`), una máscara aleatoria de características visuales post-SigLIP con probabilidad 0.1 y una alineación InfoNCE entre tokens táctiles agrupados y tokens limpios de la cámara de muñeca (`tactile_align_weight=0.1`, `tactile_align_temp=0.1`). La pérdida final de entrenamiento ronda 0.0025–0.0030, pero incluye los términos auxiliares y no es comparable con la pérdida de flujo del modelo base.

## Capacidades

- Predicción de acciones robóticas para la tarea de ensamblaje de engranajes en simulación.
- Fusión multimodal de visión (cámara de muñeca, características SigLIP) y tacto (GelSight Mini vía AnyTouch2).
- Aprendizaje de representaciones táctiles discriminativas mediante margen contrastivo frente a muestras negativas del batch.
- Robustez parcial a oclusiones visuales gracias al enmascaramiento de características de imagen durante el entrenamiento.
- Alineación cross-modal táctil-visual mediante InfoNCE.
- No soporta tool calling, function calling, agentes conversacionales ni generación de texto libre.
- Capacidades multilingües: no disponibles; el modelo no es lingüístico.

## Casos de uso

- Investigación en manipulación táctil: servir el checkpoint con `serve_policy.py` para reproducir el experimento de ensamblaje de engranajes y comparar contra el modelo base sin pérdidas auxiliares.
- Ablación de pérdidas auxiliares: el par base/margin permite aislar el efecto del margen contrastivo táctil, la máscara visual y la alineación InfoNCE en el éxito de la tarea.
- Desarrollo de políticas VLA con sensores GelSight: sirve como referencia de integración de AnyTouch2 en un pipeline pi0.5 con características cacheadas.
- Evaluación sim-to-real: punto de partida para probar transferencia de una política entrenada en simulación con tacto a hardware físico.
- Benchmarking de infraestructura: el checkpoint permite medir latencia y throughput de openpi en B200 y en GPUs de menor capacidad.
- Reproducibilidad de experimentos: los logs de entrenamiento (`train_log.txt`, pasos 0–19950) y la configuración documentada facilitan réplicas exactas.
- Docencia y divulgación: ejemplo completo de entrenamiento LoRA multimodal con pérdidas contrastivas en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación en simulador está pendiente.

## Requisitos de hardware

- Entrenamiento realizado en 1× NVIDIA B200; no se documenta el consumo de VRAM.
- VRAM de inferencia: no disponible. El repo pesa 6,4 GB, lo que da una cota inferior aproximada para cargar los pesos, pero el pico real depende del backend openpi y de las características cacheadas.
- GPU recomendadas: no disponibles; por el tamaño del checkpoint es plausible que quepa en GPUs de 24 GB o más, pero no está verificado.
- Despliegue: exclusivamente mediante `tactile_base` con `uv run scripts/serve_policy.py policy:checkpoint`, apuntando a `checkpoints/openvtla_gear_assembly_margin/ours/19999`.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tacto | Pérdidas auxiliares | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| `yrpark/openvtla-gear_assembly-margin` | pi0.5 + AnyTouch2 | Sí (GelSight Mini) | Margen contrastivo, máscara visual, InfoNCE | other | Pendiente |
| `yrpark/openvtla-gear_assembly` | pi0.5 + AnyTouch2 | Sí (GelSight Mini) | Ninguna | other | No disponible |
| `yrpark/openvtla-insert_USB-margin` | pi0.5 + AnyTouch2 | Sí | Mismas que este modelo | other | No disponible |

## Limitaciones y advertencias

- Entrenado únicamente con 100 demostraciones de una sola tarea (`gear_assembly`) en simulación; no generaliza a otras tareas sin reentrenamiento.
- Evaluación en simulador pendiente: no hay evidencia publicada de tasa de éxito.
- La pérdida final incluye términos auxiliares y no es comparable con la del modelo base; no debe usarse como métrica de calidad.
- Licencia `other`: es necesario revisar los términos del autor antes de cualquier uso comercial; no se especifican restricciones concretas.
- Dependencia estricta del código `tactile_base` (commit `ddebb8e`) y de la revisión de datos `5fb2757b`; cambios en esas dependencias pueden romper la reproducibilidad.
- El checkpoint no incluye `train_state/`, por lo que no se puede reanudar el entrenamiento desde el artefacto publicado.
- Riesgo de sobreajuste a las condiciones de simulación (iluminación, materiales, dinámica del sensor GelSight Mini).
- No es un modelo de lenguaje: no debe emplearse para generación de texto, razonamiento simbólico ni atención al cliente.
- Sin datos sobre sesgos, idiomas o alucinación; estas categorías no aplican directamente a una política de acción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-gear_assembly-margin
- Modelo base: https://huggingface.co/yrpark/openvtla-gear_assembly
- Modelo relacionado: https://huggingface.co/yrpark/openvtla-insert_USB-margin
- Código `tactile_base`: https://github.com/YuriPark0123/tactile_base
- Dataset OpenViTac: https://huggingface.co/datasets/FVL-Lab/OpenViTac
