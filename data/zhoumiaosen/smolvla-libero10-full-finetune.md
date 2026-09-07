# zhoumiaosen/smolvla-libero10-full-finetune

## Resumen

El modelo `zhoumiaosen/smolvla-libero10-full-finetune` es un fine-tune completo de `lerobot/smolvla_base`, un modelo de acción visual-lenguaje (VLA) ligero desarrollado por Hugging Face. Está diseñado para robótica: toma como entrada múltiples vistas de cámara, el estado sensorimotor del robot y una instrucción en lenguaje natural, y genera acciones de control. Este checkpoint ha sido ajustado en el subconjunto completo LIBERO-Long (`libero_10`) del dataset `HuggingFaceVLA/libero`, con 379 episodios y 30.000 pasos de entrenamiento. Con 450 millones de parámetros y licencia Apache-2.0, ofrece una alternativa ligera a modelos VLA más grandes como GR00T-N1.5-3B.

Su relevancia radica en que demuestra que un modelo pequeño puede aprender tareas robóticas de larga duración con múltiples subobjetivos, pasando de un 0% de éxito en zero-shot a un 8% tras el fine-tuning. El autor, zhoumiaosen, lo ha entrenado junto a un fine-tune de GR00T-N1.5-3B con el mismo protocolo para permitir una comparación directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (backbone VLM SmolVLM2-500M-Video-Instruct + action expert) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es la arquitectura de modelo fundacional ligero para robótica de Hugging Face. Combina un backbone de modelo de lenguaje y visión (SmolVLM2-500M-Video-Instruct) con un experto de acciones que condiciona la generación de acciones en las características contextuales de las entradas. El modelo recibe múltiples vistas de cámara, el estado sensorimotor actual del robot y una instrucción en lenguaje natural, y produce acciones de control.

El fine-tune se realizó con LeRobot sobre el subconjunto `libero_10` de `HuggingFaceVLA/libero`, compuesto por 379 episodios (los 10 tasks de LIBERO-Long). Se entrenaron 30.000 pasos completos en una sola ejecución limpia, con batch size 1, en una RTX 4090, durante aproximadamente 1 hora y 25 minutos. La pérdida final fue de ~0,10-0,12, partiendo de ~1,5. No se aplicó RLHF ni DPO. Durante el entrenamiento se corrigió un bug de LeRobot relacionado con el filtrado de episodios en los chunks del dataset.

## Capacidades

- Generación de acciones robóticas a partir de instrucciones en lenguaje natural.
- Percepción multi-cámara: integra varias vistas de cámara y el estado sensorimotor del robot.
- Ejecución de tareas de larga duración con múltiples subobjetivos (LIBERO-Long).
- Generalización a episodios con semillas diferentes a las de entrenamiento.
- Compatibilidad con LeRobot para fine-tuning y evaluación.
- Modelo completamente ajustado (full fine-tune, no LoRA), con estadísticas de normalización del dataset.

## Casos de uso

- Manipulación robótica en cocina: el modelo puede ejecutar tareas como colocar sopa y salsa de tomate en una cesta, encender la estufa y poner la moka, o colocar tazas en platos. Es adecuado porque ha sido entrenado específicamente en estas tareas de LIBERO-Long.
- Organización de objetos en cajones y armarios: tareas como guardar un cuenco negro en el cajón inferior y cerrarlo. El modelo maneja secuencias de pasos con contexto de estado.
- Investigación en aprendizaje por imitación: permite comparar arquitecturas VLA ligeras con modelos más grandes (GR00T-N1.5-3B) bajo el mismo protocolo de entrenamiento.
- Benchmarking de VLA en LIBERO-Long: sirve como referencia para evaluar el impacto del fine-tuning en tareas largas y complejas.
- Adaptación a entornos robóticos propios: mediante LeRobot, se puede fine-tunear sobre datasets personalizados para brazos manipuladores.
- Evaluación de generalización: al usar semillas diferentes en las pruebas, es útil para estudiar la capacidad de generalización de modelos VLA pequeños.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación en el conjunto completo `libero_10` (50 episodios, 5 por tarea), comparando el checkpoint fine-tuned con el modelo base en zero-shot.

| Tarea (`libero_10` id) | Descripción | Fine-tuned (30k steps, 5 ep) | Zero-shot (5 ep) |
|---|---|---|---|
| 0 | Poner la sopa de letras y la salsa de tomate en la cesta | 0/5 | 0/5 |
| 1 | Poner la caja de queso crema y la mantequilla en la cesta | 0/5 | 0/5 |
| 2 | Encender la estufa y poner la moka | 1/5 | 0/5 |
| 3 | Poner el cuenco negro en el cajón inferior del armario y cerrarlo | 1/5 | 0/5 |
| 4 | Poner la taza blanca en el plato izquierdo y la taza amarilla y blanca en el plato derecho | 0/5 | 0/5 |
| 5 | Recoger el libro y colocarlo en el compartimento trasero del carrito | 1/5 | 0/5 |
| 6 | Poner la taza blanca en el plato y el pudin de chocolate a la derecha del plato | 1/5 | 0/5 |
| 7 | Poner la sopa de letras y la caja de queso crema en la cesta | 0/5 | 0/5 |
| 8 | Poner las dos mokas en la estufa | 0/5 | 0/5 |
| 9 | Poner la taza amarilla y blanca en el microondas y cerrarlo | 0/5 | 0/5 |

Resultado global: 4/50 (8,0%) para el fine-tuned, frente a 0/50 (0%) en zero-shot. En el subconjunto de 6 tareas (ids 2, 3, 4, 5, 6, 9), el checkpoint alcanza 4/30 (13,3%), igualando el resultado del fine-tune de GR00T-N1.5-3B (4/30) con el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 ocupan aproximadamente 0,9 GB (450M parámetros), por lo que es viable en GPUs de consumo con 8 GB de VRAM o más.
- GPU recomendadas: RTX 4090 (usada en entrenamiento), o cualquier GPU de consumo con 8-12 GB para inferencia.
- Compatible con GPUs de consumo: sí, gracias a su tamaño reducido.
- Opciones de despliegue: LeRobot (repositorio oficial), integración con Hugging Face Transformers para el backbone VLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en libero_10 (subconjunto 6 tasks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zhoumiaosen/smolvla-libero10-full-finetune` | 450M | No disponible | 4/30 (13,3%) | Apache-2.0 | Hugging Face |
| `zhoumiaosen/groot-n1p5-lora-libero10-full-finetune` | 3B (GR00T-N1.5-3B LoRA) | No disponible | 4/30 (13,3%) | No disponible (probablemente Apache-2.0) | Hugging Face |
| `lerobot/smolvla_base` | 450M | No disponible | 0/30 (0%) zero-shot | Apache-2.0 | Hugging Face |

El modelo base `lerobot/smolvla_base` es la referencia sin fine-tuning. El fine-tune de GR00T-N1.5-3B, entrenado con el mismo protocolo, logra el mismo resultado en el subconjunto de 6 tareas, a pesar de tener un tamaño 6 veces mayor.

## Limitaciones y advertencias

- Tasa de éxito absoluta baja (8% en `libero_10`), lo que indica que 379 episodios de entrenamiento son insuficientes para dominar tareas de larga duración.
- El modelo solo ha sido evaluado en tareas de LIBERO-Long; su rendimiento en otros entornos robóticos no está validado.
- No se han documentado sesgos específicos, pero al estar entrenado en un dataset de cocina y manipulación de objetos, puede heredar sesgos de ese dominio.
- Riesgo de alucinación en acciones: el modelo puede generar movimientos incorrectos o incompletos, especialmente en tareas no vistas.
- Limitaciones de contexto e idioma no disponibles; no se ha evaluado su capacidad multilingüe.
- El entrenamiento requirió un parche sobre un bug de LeRobot; al usar el dataset original, pueden aparecer errores de filtrado de episodios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhoumiaosen/smolvla-libero10-full-finetune
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de SmolVLA: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Fine-tune comparativo de GR00T: https://huggingface.co/zhoumiaosen/groot-n1p5-lora-libero10-full-finetune
- Dataset `HuggingFaceVLA/libero`: https://huggingface.co/datasets/HuggingFaceVLA/libero
