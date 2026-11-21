# yrpark/openvtla-insert_USB

## Resumen

openvtla_insert_USB es un checkpoint de política robótica (visión-lenguaje-acción, VLA) desarrollado por el usuario yrpark y publicado en Hugging Face. Se trata de una reimplementación al estilo OpenVTLA del modelo pi0.5 combinada con el codificador táctil AnyTouch2, entrenada sobre la tarea de simulación `insert_USB` del dataset OpenViTac, que incluye 100 demostraciones capturadas con sensores GelSight Mini. El modelo está diseñado para generar acciones de control a partir de observaciones visuales, táctiles y de instrucciones en lenguaje natural.

El modelo se apoya en el repositorio de código `tactile_base` (commit 831a50b) y se ha entrenado con LoRA sobre los componentes gemma_2b_lora y gemma_300m_lora de pi0.5, con un horizonte de predicción de 50 pasos y 18 tokens táctiles derivados de un pooling `cls_pool2`. El entrenamiento se realizó durante 20.000 pasos con un batch efectivo de 64 (16 x 4 de acumulación de gradiente), semilla 42, LR coseno con pico de 5e-5, sobre una única RTX 3090 durante aproximadamente 4,6 días.

Es relevante ahora porque aborda la integración de modalidad táctil en políticas VLA de manipulación fina, un área donde la mayoría de modelos open source se limitan a visión y lenguaje. No obstante, se trata de un checkpoint de investigación de una sola tarea, sin evaluación en simulador publicada y con cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (reimplementación OpenVTLA) con codificador táctil AnyTouch2 |
| Parametros totales | no disponible (se entrenan adaptadores LoRA sobre gemma_2b_lora + gemma_300m_lora) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en fp16 durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | checkpoint openpi (`params/`, `train_state/`, `assets/` con estadísticas de normalización) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5, un VLA que combina un backbone de lenguaje (Gemma 2B y Gemma 300M) con entradas visuales y, en esta variante, táctiles. La reimplementación OpenVTLA añade un codificador AnyTouch2 que procesa características táctiles de 4 frames y las proyecta en 18 tokens (pooling `cls_pool2`), que se inyectan en la política junto con las observaciones visuales y la instrucción. La salida es una secuencia de acciones con horizonte de 50 pasos.

El entrenamiento se realizó sobre el dataset OpenViTac `insert_USB` (revisión 5fb2757b), compuesto por 100 demostraciones en simulación con sensores GelSight Mini. Se aplicó LoRA sobre los módulos gemma_2b_lora y gemma_300m_lora, con 20.000 pasos, batch efectivo de 64, semilla 42 y LR coseno con pico 5e-5. La pérdida final de entrenamiento fue de aproximadamente 0,0002. No se documenta el uso de RLHF o DPO, ni el número total de tokens de entrenamiento. No se ha publicado evaluación en simulador.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales, táctiles y de instrucción en lenguaje natural.
- Percepción táctil integrada mediante AnyTouch2 (características de 4 frames, 18 tokens).
- Predicción de trayectorias de acción con horizonte de 50 pasos.
- Entrenamiento de una sola tarea: inserción de USB en simulación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: fusión multimodal visión-táctil-lenguaje para control fino.

## Casos de uso

- Investigación en manipulación táctil: el modelo sirve como baseline para estudiar cómo la fusión de señales GelSight mejora la inserción precisa en entornos simulados, comparando contra variantes sin táctil.
- Reproducción de experimentos OpenVTLA: al estar publicado el checkpoint y el código `tactile_base`, permite replicar el entrenamiento y comparar configuraciones (LoRA, pooling táctil, horizonte).
- Punto de partida para fine-tuning en tareas de inserción: el checkpoint puede adaptarse a otras tareas de ensamblaje con pocas demostraciones mediante LoRA.
- Evaluación de codificadores táctiles: sirve para medir el impacto de AnyTouch2 frente a otros encoders en políticas VLA.
- Docencia y formación: ejemplo completo de pipeline VLA con modalidad táctil, desde datos hasta checkpoint de inferencia.
- Desarrollo de políticas para robots con sensores GelSight Mini: el modelo está entrenado específicamente para esa configuración hardware, lo que facilita su integración en plataformas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo "not yet evaluated in the simulator" y solo reporta la pérdida final de entrenamiento (~0,0002).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el entrenamiento se realizó en fp16 sobre una RTX 3090 (24 GB), lo que sugiere que la inferencia cabe en GPUs de gama alta con al menos 24 GB.
- GPU recomendadas: RTX 3090 (usada en entrenamiento), A100, H100 para despliegue a mayor throughput.
- Cabe en consumer GPU: sí, en RTX 3090 y probablemente en GPUs con 24 GB o más; no confirmado para 16 GB.
- Opciones de despliegue: el checkpoint está en formato openpi (`params/`), pensado para usarse con el repositorio `tactile_base`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no es un LLM de texto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openvtla_insert_USB | no disponible (LoRA sobre Gemma 2B/300M) | no disponible | Inserción USB con táctil | other | Hugging Face |
| pi0.5 (original) | no disponible | no disponible | VLA generalista | no disponible | no disponible |
| OpenVTLA (referencia) | no disponible | no disponible | VLA con táctil | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado para una única tarea (`insert_USB`) en simulación; no generaliza a otras tareas sin fine-tuning.
- No evaluado en simulador: no hay evidencia publicada de éxito en la tarea.
- Dependencia de hardware específico: sensores GelSight Mini y configuración AnyTouch2.
- Licencia "other": es necesario revisar los términos exactos antes de cualquier uso comercial; no se especifican restricciones en la model card.
- Riesgo de sobreajuste a las 100 demostraciones de entrenamiento.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- El checkpoint requiere el repositorio `tactile_base` y una estructura de directorios concreta (`checkpoints/openvtla_insert_USB/baseline/19999`).

## Enlaces

- Hugging Face: https://huggingface.co/yrpark/openvtla-insert_USB
- Repositorio de código tactile_base: https://github.com/YuriPark0123/tactile_base
- Dataset OpenViTac (FVL-Lab): https://huggingface.co/datasets/FVL-Lab/OpenViTac
