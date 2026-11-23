# yrpark/openvtla-grasp_chip

## Resumen

`openvtla_grasp_chip` es un checkpoint de política robótica (vision-language-action, VLA) desarrollado por el usuario de Hugging Face `yrpark`. Se construye sobre pi0.5 (la familia de modelos VLA de Physical Intelligence) y añade un módulo táctil basado en AnyTouch2, siguiendo una reimplementación de estilo OpenVTLA. El modelo está entrenado para una tarea concreta de manipulación: el agarre de una ficha (`grasp_chip`) en simulación con un sensor GelSight Mini y 100 demostraciones.

El problema que aborda es la integración de información táctil en políticas VLA: a diferencia de los modelos visión-lenguaje-acción puramente visuales, este checkpoint incorpora 18 tokens táctiles derivados de las características de AnyTouch2, lo que permite condicionar la acción sobre la señal de contacto del sensor. Es relevante en el contexto de la manipulación fina, donde la visión sola no basta para tareas de contacto.

Se trata de un artefacto muy específico y experimental: un único checkpoint de investigación (paso 19999) entrenado con LoRA sobre los componentes gemma_2b y gemma_300m, con un tamaño de repositorio de 9,6 GB. No es un modelo de propósito general ni un modelo de lenguaje: es una política de control que se sirve a través del repositorio `tactile_base`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 con módulo táctil AnyTouch2 (reimplementación OpenVTLA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | checkpoint openpi (`params/`, `train_state/`, `assets/`) |

## Arquitectura y entrenamiento

El modelo combina una política VLA pi0.5 con un codificador táctil AnyTouch2. La entrada táctil se procesa con características de AnyTouch2 (`checkpoint-4frames`) y se proyecta en 18 tokens táctiles mediante `cls_pool2`, que se incorporan junto con las observaciones visuales y la instrucción de lenguaje. El entrenamiento se realizó con LoRA sobre dos componentes Gemma (`gemma_2b_lora` y `gemma_300m_lora`), con un horizonte de predicción de 50 pasos.

Los detalles de entrenamiento están documentados en la model card: 20.000 pasos, batch efectivo de 64 (16 × 4 de acumulación de gradiente), semilla 42, LR coseno con pico 5e-5, sobre una única NVIDIA B200 durante aproximadamente 12,7 horas (del 22 de noviembre de 2026, 05:33 a 18:14 KST). Los datos provienen de OpenViTac (`grasp_chip`, simulación, GelSight Mini, 100 demos), revisión `5fb2757b88826917242adefd9196424ef8cf2d98`. La pérdida final de entrenamiento es de aproximadamente 0,0002. El autor indica explícitamente que el modelo aún no ha sido evaluado en el simulador.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por visión, lenguaje y tacto.
- Percepción táctil integrada mediante tokens de AnyTouch2 (18 tokens, `cls_pool2`).
- Condicionamiento por instrucción en lenguaje natural (herencia de la arquitectura pi0.5).
- Predicción de trayectorias de acción con horizonte de 50 pasos.
- Ejecución en simulación con sensor GelSight Mini.
- Servido como política mediante `scripts/serve_policy.py` del repositorio `tactile_base`.
- Reanudación de entrenamiento disponible a través del directorio `train_state/`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Investigación en manipulación táctil: servir el checkpoint en `tactile_base` para reproducir el entrenamiento de agarre de ficha y comparar contra la línea base sin tacto.
- Punto de partida para fine-tuning: el checkpoint puede reanudarse desde `train_state/` para adaptarlo a nuevas tareas de agarre con el mismo sensor GelSight Mini.
- Evaluación de arquitecturas VLA con fusión táctil: útil para estudiar cómo los 18 tokens táctiles de AnyTouch2 afectan a la política en tareas de contacto.
- Desarrollo de pipelines de simulación a real: el modelo sirve como referencia en simulación antes de transferir la política a un robot físico con sensor táctil.
- Benchmarking interno de políticas: comparar la pérdida de entrenamiento y el comportamiento en simulador frente a otros checkpoints de la misma familia (`insert_USB`, `gear_assembly`).
- Reproducibilidad de experimentos: el repositorio incluye configuración, semilla y registro de entrenamiento, lo que permite replicar el experimento con el mismo código (`ed53407`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado aún en el simulador; solo se reporta una pérdida final de entrenamiento de aproximadamente 0,0002.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 9,6 GB e incluye pesos y estado de entrenamiento.
- GPU de entrenamiento utilizada: 1× NVIDIA B200 durante aproximadamente 12,7 horas.
- GPU recomendadas para inferencia: no disponible; por el tamaño del checkpoint se requiere una GPU con memoria suficiente para cargar los pesos completos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: servidor de políticas de `tactile_base` (`uv run scripts/serve_policy.py policy:checkpoint ...`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Táctil | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yrpark/openvtla_grasp_chip` | pi0.5 + AnyTouch2 | Sí (18 tokens) | `grasp_chip` (simulación) | other | Hugging Face |
| `yrpark/openvtla-insert_USB` | pi0.5 + AnyTouch2 | Sí | `insert_USB` | other | Hugging Face |
| `yrpark/openvtla-gear_assembly` | pi0.5 + AnyTouch2 | Sí | `gear_assembly` | other | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y comparten la ruta de entrenamiento del modelo base (commit `57e0312`). No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigación: el autor indica que no ha sido evaluado en el simulador, por lo que no hay evidencia publicada de su rendimiento en tarea.
- Entrenado con solo 100 demostraciones en simulación; la generalización a condiciones reales no está validada.
- Específico de una única tarea (`grasp_chip`) y de un sensor concreto (GelSight Mini); no es un modelo de propósito general.
- La licencia es `other`; no se detallan los términos exactos, por lo que debe revisarse antes de cualquier uso comercial.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo relevante es el fallo de la política en entornos fuera de distribución.
- El checkpoint depende del repositorio `tactile_base` y de una configuración concreta (`openvtla_grasp_chip`, exp `baseline`) para su correcto funcionamiento.
- El tamaño del repositorio (9,6 GB) incluye estado de entrenamiento, lo que incrementa los requisitos de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-grasp_chip
- Repositorio de código `tactile_base`: https://github.com/YuriPark0123/tactile_base
- Checkpoint relacionado `yrpark/openvtla-insert_USB`: https://huggingface.co/yrpark/openvtla-insert_USB
- Checkpoint relacionado `yrpark/openvtla-gear_assembly`: https://huggingface.co/yrpark/openvtla-gear_assembly
- Dataset OpenViTac (FVL-Lab): https://huggingface.co/datasets/FVL-Lab/OpenViTac
