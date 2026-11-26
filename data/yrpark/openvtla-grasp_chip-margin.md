# yrpark/openvtla-grasp_chip-margin

## Resumen

`openvtla_grasp_chip_margin` es un checkpoint de política robótica visio-táctil desarrollado por el usuario `yrpark`, construido sobre el modelo base pi0.5 (openpi) y una implementación estilo OpenVTLA que incorpora AnyTouch2 como encoder táctil. El modelo está entrenado para la tarea de agarre de una ficha de chip (`grasp_chip`) en simulación, con sensor GelSight Mini y 100 demostraciones del conjunto OpenViTac. No es un modelo de lenguaje generalista, sino una política de control (vision-language-action) orientada a manipulación robótica con realimentación táctil.

La relevancia del checkpoint reside en que introduce tres pérdidas auxiliares de entrenamiento (margen contrastivo táctil, enmascarado de características visuales e alineamiento InfoNCE táctil-visual) sobre el modelo base `yrpark/openvtla-grasp_chip`, manteniendo idénticos los datos, las características cacheadas, la arquitectura y los hiperparámetros. La inferencia no cambia respecto al modelo base, por lo que el interés técnico está en el efecto de estas pérdidas sobre la representación táctil, no en una nueva interfaz de uso.

El repositorio ocupa 6,4 GB y contiene únicamente el checkpoint final de openpi (`19999/`), sin `train_state/`. La evaluación en simulador está pendiente según la model card, y no se han publicado resultados de benchmarks ni métricas de éxito de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (openpi) con encoder táctil AnyTouch2, reimplementación estilo OpenVTLA |
| Parametros totales | no disponible (usa LoRA `gemma_2b_lora` + `gemma_300m_lora` sobre pi0.5) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no conversacional) |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/` para inferencia, `assets/` con estadísticas de normalización) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5 (openpi) y le añade una rama táctil basada en AnyTouch2, con 18 tokens táctiles obtenidos mediante `cls_pool2`. El entrenamiento se realizó con LoRA (`gemma_2b_lora` y `gemma_300m_lora`) durante 20.000 pasos, con batch efectivo de 64 (16 × 4 de acumulación de gradiente), horizonte de 50 y una única ejecución en una NVIDIA B200 entre el 23 y el 24 de noviembre de 2026 (hora coreana). Los datos provienen de OpenViTac (`FVL-Lab/OpenViTac`, revisión `5fb2757b88826917242adefd9196424ef8cf2d98`), tarea `grasp_chip` en simulación con GelSight Mini y 100 demostraciones, usando características AnyTouch2 `checkpoint-4frames` cacheadas.

La innovación respecto al modelo base son tres pérdidas que solo actúan en entrenamiento: (1) un margen contrastivo táctil (`tactile_margin_weight` 1.0, `tactile_margin_base` 0.1, `tactile_neg_mode` `batch_far`, `tactile_dref_pct` 50) que exige que el táctil real supere al táctil erróneo más lejano del batch por un margen escalado por distancia; (2) un enmascarado de características visuales sobre los tokens de imagen post-SigLIP con probabilidad 0.1 (`vision_feature_mask_prob`); y (3) un alineamiento InfoNCE de los tokens táctiles agrupados con los tokens limpios de la cámara de muñeca (`tactile_align_weight` 0.1, `tactile_align_temp` 0.1). La pérdida final de entrenamiento quedó en ~0,0025-0,0029, valor que incluye los términos auxiliares y por tanto no es comparable directamente con la pérdida flow del modelo base.

## Capacidades

- Control robótico visio-táctil para la tarea de agarre de ficha de chip en simulación.
- Fusión de percepción visual (tokens post-SigLIP) y táctil (AnyTouch2, 18 tokens) para generar acciones.
- Generación de secuencias de acción con horizonte de 50 pasos.
- Inferencia sin cambios respecto al modelo base: las pérdidas añadidas no alteran el grafo de inferencia.
- Servido mediante `scripts/serve_policy.py` de openpi/tactile_base con la configuración `openvtla_grasp_chip_margin`.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en manipulación táctil: servir el checkpoint para comparar el efecto del margen contrastivo táctil frente al modelo base `yrpark/openvtla-grasp_chip` en la misma tarea y datos.
- Agarre de precisión en simulación: usar la política para agarrar fichas de chip con un GelSight Mini simulado, aprovechando la señal táctil para corregir el contacto.
- Reproducción de experimentos: el checkpoint y la configuración permiten replicar el entrenamiento con `tactile_base` en el commit `ed53407` y las pérdidas sin cambios desde `ddebb8e`.
- Base para ablaciones: las tres pérdidas están parametrizadas en la configuración, lo que facilita activarlas o desactivarlas para estudiar su contribución.
- Transferencia a otras tareas táctiles: la receta (margen + enmascarado visual + InfoNCE) ya se usó en `yrpark/openvtla-insert_USB-margin` y `yrpark/openvtla-gear_assembly-margin`, por lo que sirve de referencia para insertar USB o ensamblar engranajes.
- Evaluación de robustez ante oclusión visual: el enmascarado de características visuales al 10 % durante el entrenamiento está pensado para tolerar peor información visual, un escenario útil en entornos con oclusiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación en simulador está pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,4 GB, lo que da una cota inferior del espacio en disco necesario, pero no de la VRAM.
- GPU de entrenamiento documentada: 1× NVIDIA B200.
- GPU recomendadas para inferencia: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de políticas de openpi/tactile_base mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_grasp_chip_margin --policy.dir checkpoints/openvtla_grasp_chip_margin/ours/19999`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Datos | Pérdidas auxiliares | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yrpark/openvtla_grasp_chip_margin` (este) | `grasp_chip` (simulación, GelSight Mini, 100 demos) | OpenViTac rev `5fb2757` | Margen táctil + máscara visual + InfoNCE | other | Checkpoint openpi `19999/` |
| `yrpark/openvtla-grasp_chip` | `grasp_chip` (misma tarea y datos) | Idénticos | Ninguna (base) | no disponible | no disponible |
| `yrpark/openvtla-insert_USB-margin` | Inserción de USB | no disponible | Mismas pérdidas (código desde `ddebb8e`) | no disponible | no disponible |
| `yrpark/openvtla-gear_assembly-margin` | Ensamblaje de engranajes | no disponible | Mismas pérdidas (código desde `ddebb8e`) | no disponible | no disponible |

## Limitaciones y advertencias

- Evaluación en simulador pendiente: no hay evidencia publicada de éxito en la tarea, por lo que no debe asumirse un rendimiento superior al modelo base.
- Entrenado solo en simulación con 100 demostraciones y un único sensor (GelSight Mini); la generalización a hardware real o a otros sensores táctiles no está documentada.
- La pérdida final (~0,0025-0,0029) incluye términos auxiliares y no es comparable con la pérdida flow del modelo base; no debe usarse como métrica de calidad.
- El repositorio no incluye `train_state/`, por lo que no es posible reanudar el entrenamiento desde este checkpoint.
- Licencia `other`: no se especifican términos de uso comercial; es necesario consultar las condiciones del autor y las del modelo base pi0.5 antes de cualquier uso productivo.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática; al ser una política de control, estos riesgos se traducen en fallos de agarre o acciones incorrectas, no en texto.
- Dependencia estricta del código `tactile_base` (commit `ed53407`) y de la configuración `openvtla_grasp_chip_margin`; cambios de versión pueden romper la carga del checkpoint.
- Sin métricas de latencia ni throughput publicadas, la viabilidad en tiempo real no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-grasp_chip-margin
- Modelo base: https://huggingface.co/yrpark/openvtla-grasp_chip
- Repositorio de código `tactile_base`: https://github.com/YuriPark0123/tactile_base
- Dataset OpenViTac: https://huggingface.co/datasets/FVL-Lab/OpenViTac
- Modelo relacionado: https://huggingface.co/yrpark/openvtla-insert_USB-margin
- Modelo relacionado: https://huggingface.co/yrpark/openvtla-gear_assembly-margin
