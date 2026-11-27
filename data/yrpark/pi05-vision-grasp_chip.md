# yrpark/pi05-vision-grasp_chip

## Resumen

pi05_vision_grasp_chip es un checkpoint de política robótica (vision-language-action, VLA) derivado de pi0.5, el modelo de acción de Physical Intelligence, adaptado mediante LoRA sobre el conjunto de datos de simulación OpenViTac `grasp_chip`. Lo desarrolla el usuario `yrpark` como ablación "vision-only" de su modelo base OpenVTLA (`yrpark/openvtla-grasp_chip`): misma configuración, mismos datos y mismos hiperparámetros, pero eliminando por completo la entrada táctil (tokens de AnyTouch2). Su propósito es servir de referencia cuantitativa para medir cuánto aporta la modalidad táctil frente a un modelo que solo ve cámaras.

El modelo recibe imagen de cámara de cabeza y de muñeca, el estado del robot y un prompt textual, y produce acciones de control (horizonte 50). Está entrenado sobre `openvitac/grasp_chip_gelsight`, un dataset de simulación con sensor GelSight Mini y 100 demostraciones. El repositorio ocupa 6,3 GB y contiene únicamente el checkpoint final (paso 19999) en formato openpi; no incluye `train_state/`.

Es relevante ahora porque forma parte del ecosistema openpi/tactile_base, que permite reproducir experimentos de manipulación con y sin tactile sensing bajo una misma receta de entrenamiento. La evaluación en simulador de este checkpoint está pendiente; el modelo base OpenVTLA reportó 92/100 en la misma tarea, lo que da un punto de comparación directo para el ablation.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLA basada en modelo de difusión de acciones sobre backbone Gemma), adaptada con LoRA (gemma_2b_lora + gemma_300m_lora) |
| Parametros totales | no disponible (repo de 6,3 GB; pesos base pi0.5 + adaptadores LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint openpi en precisión de entrenamiento) |
| Idiomas soportados | no disponible (el prompt es textual; no se documenta cobertura multilingüe) |
| Licencia | other |
| Formato de pesos | checkpoint openpi (`params/` para inferencia, `assets/` con norm stats) |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base` y aplica LoRA sobre dos módulos Gemma (2B y 300M), con horizonte de acción de 50 pasos. La entrada es visión-only: cámara de cabeza, cámara de muñeca, estado del robot y prompt; se eliminan explícitamente los tokens táctiles de AnyTouch2 presentes en el modelo base OpenVTLA. Las norm stats (`assets/pi05_vision_grasp_chip`) son idénticas a las del modelo base, lo que garantiza que la comparación entre ambos aísla únicamente la modalidad táctil.

El entrenamiento usó el dataset `openvitac/grasp_chip_gelsight` (rev `5fb2757b88826917242adefd9196424ef8cf2d98`), simulación con GelSight Mini y 100 demostraciones. Se ejecutaron 20.000 pasos con batch efectivo de 64 (64 x 1, `--grad-accum-steps 1`; el base usó 16 x 4 en una RTX 3090 con el mismo batch efectivo), semilla 42, LR coseno de 5e-5 a 5e-6 con warmup de 1.000 pasos. El entrenamiento corrió en 1x NVIDIA B200 entre las 11:36 y las 22:34 KST del 2026-11-27 (unas 11 horas), con código `tactile_base` en el commit `515e189`. La pérdida final de entrenamiento fue 0,0002 (media de los últimos 5 pasos registrados, hasta el paso 19950).

## Capacidades

- Control robótico visomotor: genera acciones de manipulación a partir de imagen de cabeza y muñeca más estado del robot.
- Condicionamiento por prompt textual: la tarea se especifica mediante instrucción en lenguaje natural.
- Ejecución de políticas de horizonte largo: predice secuencias de 50 acciones por inferencia.
- Integración con openpi: se sirve mediante `scripts/serve_policy.py` con la configuración `pi05_vision_grasp_chip`.
- Ablación controlada: misma receta que OpenVTLA sin entrada táctil, útil para análisis de contribución modal.
- No soporta entrada táctil (por diseño, `send_tactile: false`).
- No se documentan capacidades de tool calling, agentes, matemáticas o visión general; es un modelo de acción, no un asistente conversacional.

## Casos de uso

- Baseline de ablación en investigación táctil: comparar su tasa de éxito con la de `yrpark/openvtla-grasp_chip` (92/100) sobre la misma tarea y datos permite cuantificar la ganancia aportada por AnyTouch2 en `grasp_chip`.
- Reproducción de experimentos: al publicarse norm stats, semilla, hiperparámetros y log completo (`train_log.txt`), sirve para replicar el entrenamiento en otras GPUs ajustando el batch efectivo.
- Punto de partida para fine-tuning en agarre simulado: al ser un LoRA sobre pi0.5, puede adaptarse a nuevas tareas de grasping con pocas demos adicionales.
- Validación de pipelines de despliegue openpi: útil para probar `serve_policy.py` y el flujo de checkpoints en `checkpoints/pi05_vision_grasp_chip/baseline/19999` antes de pasar a modelos con tacto.
- Estudio de robustez visión-only: analizar en qué configuraciones de agarre la falta de señal táctil degrada el rendimiento (objetos transparentes, superficies resbaladizas), aunque la evaluación está pendiente.
- Docencia y divulgación: ejemplo compacto (100 demos, 20k pasos) de entrenamiento VLA con LoRA sobre pi0.5 en una sola GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La evaluación en simulador de este checkpoint está pendiente. Como referencia del modelo base (no de este ablation), OpenVTLA reportó 92/100 en `grasp_chip`.

| Modelo | Evaluación simulador |
|---|---|
| pi05_vision_grasp_chip (este) | pendiente |
| openvtla-grasp_chip (base con tacto) | 92/100 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 6,3 GB, lo que da una cota inferior orientativa para cargar los pesos, sin contar activaciones ni el backbone completo en memoria.
- GPU de entrenamiento documentada: 1x NVIDIA B200 (unas 11 horas para 20k pasos, batch 64).
- El modelo base OpenVTLA se entrenó con batch 16 x 4 en una RTX 3090, lo que sugiere que el fine-tuning LoRA cabe en GPUs consumer de gama alta con grad accumulation.
- Despliegue: openpi mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config pi05_vision_grasp_chip --policy.dir checkpoints/pi05_vision_grasp_chip/baseline/19999`.
- No se documentan opciones vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de checkpoint de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entrada | Datos | Entrenamiento | Evaluación | Licencia |
|---|---|---|---|---|---|
| pi05_vision_grasp_chip | Visión (cabeza + muñeca), estado, prompt | grasp_chip_gelsight, 100 demos | LoRA sobre pi0.5, 20k pasos, batch 64 | pendiente | other |
| openvtla-grasp_chip | Visión + tacto (AnyTouch2), estado, prompt | mismo dataset | misma receta, batch efectivo 64 (16x4 en 3090) | 92/100 | no disponible |
| pi0.5 base (`pi05_base`) | Visión + estado + prompt | no disponible | preentrenamiento de Physical Intelligence | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de señal táctil: el modelo ignora el sensor GelSight Mini, lo que puede degradar el agarre en objetos con propiedades de contacto críticas.
- Evaluación en simulador pendiente: no hay evidencia publicada de su tasa de éxito; no debe asumirse paridad con el modelo base.
- Entrenado solo en simulación con 100 demostraciones: riesgo alto de sobreajuste al dominio y pobre transferencia a robot real sin fine-tuning adicional.
- Pérdida de entrenamiento muy baja (0,0002) que no garantiza buen rendimiento en política; conviene validar en rollout.
- Licencia "other": es necesario revisar los términos del autor y de pi0.5/pi05_base antes de uso comercial.
- Idiomas y cobertura multilingüe del prompt no documentados.
- No incluye `train_state/`, por lo que no es reanudable directamente desde el checkpoint publicado.
- Riesgo de alucinación en el sentido de acciones no válidas o fuera de distribución ante prompts o escenas no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/pi05-vision-grasp_chip
- Modelo base OpenVTLA: https://huggingface.co/yrpark/openvtla-grasp_chip
- Repositorio de código tactile_base: https://github.com/YuriPark0123/tactile_base
- Documentación de la ablación: `docs/vision_baseline.md` (dentro del repo tactile_base)
- Dataset: `openvitac/grasp_chip_gelsight` (FVL-Lab/OpenViTac, rev 5fb2757b88826917242adefd9196424ef8cf2d98)
