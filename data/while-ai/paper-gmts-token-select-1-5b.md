# while-ai/paper-gmts-token-select-1.5b

## Resumen

paper-gmts-token-select-1.5b es un adaptador LoRA publicado por while-ai sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, dentro de su colección de recetas para replicar artículos. No es un modelo pensado para uso general: es el registro de reproducibilidad de un experimento sobre selección de tokens en GRPO (Group Relative Policy Optimization) aplicado a GSM8K. La hipótesis del experimento es que no da igual qué tokens se usan para el gradiente, sino cuáles: se entrena sobre el 20 % de los tokens del lote, seleccionados por entropía (brazo de referencia) o por entropía multiplicada por la ventaja (brazo de la receta), manteniendo idéntico el número de tokens en ambos brazos.

El resultado es un hallazgo negativo y el propio autor lo explicita: el brazo de la receta colapsó. Su pass@1 cayó a 0,18 desde el 0,36 del modelo base sin entrenar, mientras que el brazo de referencia (selección por entropía) subió a 0,49. La longitud media de las completaciones del brazo de la receta bajó de 700 a 374 caracteres y el escaneo de atajos del pipeline marcó el colapso. La comparación pareada sobre 120 tareas da una diferencia de -0,310 (IC 95 %: -0,383 a -0,235) frente al brazo de referencia.

Por tanto, este repositorio tiene valor como evidencia empírica y como material para reproducir la receta, no como artefacto desplegable. La model card lo afirma literalmente: "These weights are published as the record of that run, not as a model to use". El repositorio incluye dos brazos (la raíz con el brazo de la receta, colapsado, y el subdirectorio `baseline` con el brazo de referencia), y el tamaño total del repo es de 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre el modelo base, gestionado con PEFT |
| Parametros totales | 1,5B en el modelo base; el adaptador añade un número de parámetros no especificado en la información disponible. Tamaño del repo: 0,3 GB (incluye los dos brazos) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la ficha del adaptador. El modelo base Qwen2.5-1.5B-Instruct declara 32 768 tokens en su documentación oficial, pero la ficha del adaptador no lo confirma |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es la del Qwen2.5-1.5B-Instruct: un transformer decoder-only de 1,5B parámetros con atención por consultas agrupadas. Sobre él se aplica un adaptador LoRA entrenado con GRPO. El entrenamiento se hizo exclusivamente sobre el dataset openai/gsm8k, con 40 pasos por brazo. El eje del experimento es la selección de tokens: en cada lote se conserva el 20 % de los tokens, y se comparan dos criterios de selección, entropía sola (brazo de referencia) frente a entropía multiplicada por la ventaja (brazo de la receta). Al fijar el mismo número de tokens en ambos brazos, el diseño aísla el efecto de qué tokens se seleccionan y no de cuántos.

No se documenta en la información disponible ningún uso de RLHF, DPO ni SFT adicional, ni innovaciones de decodificación (decodificación especulativa, atención lineal, etc.). El coste computacional reportado es de 27,6 minutos de GPU para el brazo de referencia y 17,7 minutos de GPU para el brazo de la receta, ambos con 40 pasos. La receta asociada fija la semilla, las versiones de las librerías y la GPU utilizada. La model card recomienda leer la sección "Learned" antes de citar cualquier cifra.

## Capacidades

- Generación de texto conversacional: heredada del modelo base Qwen2.5-1.5B-Instruct, con la salvedad de que el brazo de la receta muestra un colapso en la longitud y calidad de las completaciones (media de 374 caracteres frente a 700 en el estado previo).
- Razonamiento matemático elemental en formato GSM8K: es la tarea sobre la que se entrenó y se evaluó, medida con pass@1 y pass@k.
- El brazo de referencia (subcarpeta `baseline`) mejora al modelo base sin entrenar en la tarea evaluada: pass@1 de 0,49 frente a 0,36.
- Tool calling / function calling: no declarado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no declarado en la información disponible.
- Capacidades multilingües: no declaradas en la información disponible.
- Capacidades especiales (modo de pensamiento, visión, audio): no declaradas en la información disponible.
- Reproducción de experimentos: el repositorio funciona como registro ejecutable de un estudio comparado de selección de tokens.

## Casos de uso

- Reproducción de resultados en investigación: clonar el repositorio whileai-sdk, ejecutar `recipes/papers/gmts-token-select/recipe.py` y verificar con la tabla de comprobaciones de la receta qué validó la evaluación, incluyendo semilla, versiones de librerías y GPU.
- Estudio de métodos de selección de tokens en RL: usar los dos brazos publicados para medir el efecto de distintos criterios de selección manteniendo constante el presupuesto de tokens por lote.
- Análisis de colapso de entrenamiento: el brazo raíz es un caso documentado de degradación, con la caída de longitud media de completaciones y la marca del escaneo de atajos, útil para calibrar detectores automáticos de colapso en pipelines de RL.
- Validación de arneses de evaluación: los valores de pass@1 con intervalos de confianza y la comparación pareada sobre 120 tareas sirven como caso de prueba para verificar que un arnés de evaluación reproduce cifras publicadas.
- Docencia y divulgación sobre RLHF/RLVR: el contraste entre el brazo que mejora (0,49) y el que colapsa (0,18) ilustra de forma cuantitativa que la señal de recompensa mal aprovechada puede degradar por debajo del modelo sin entrenar.
- Base para experimentos derivados con PEFT: al ser un adaptador LoRA sobre Qwen2.5-1.5B-Instruct, permite cargar el modelo base y estudiar el adaptador con `PeftModel.from_pretrained`, seleccionando el brazo mediante el parámetro `subfolder`.
- No se recomienda como caso de uso el despliegue en producción de atención al cliente, generación de código o cualquier tarea de usuario final, dado el colapso documentado del brazo principal.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Brazo | pass@1 | IC 95 % | pass@k | Pasos | Minutos de GPU |
|---|---|---|---|---|---|
| Base, sin entrenamiento | 0,36 | [0,29, 0,43] | 0,58 | 0 | 0 |
| Referencia (top 20 % por entropía) | 0,49 | [0,42, 0,57] | 0,68 | 40 | 27,6 |
| Receta (top 20 % por entropía x ventaja) | 0,18 | [0,13, 0,23] | 0,41 | 40 | 17,7 |

Comparación pareada receta frente a referencia: -0,310 con IC 95 % de [-0,383, -0,235] sobre 120 tareas emparejadas. La longitud media de completación del brazo de la receta cayó de 700 a 374 caracteres. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo de 1,5B, el peso en precisión de 16 bits ronda los 3 GB, más la caché KV, que depende de la longitud de contexto. En cuantización de 4 bits el peso baja aproximadamente a 1 GB. Estas cifras son estimaciones para el modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo base en 16 bits; para entrenamiento LoRA con GRPO se necesitó una GPU no especificada durante 17,7-27,6 minutos por brazo.
- Cabe en GPU de consumo: sí, el modelo base de 1,5B es apto para GPU de consumo tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, con margen amplio. Para el adaptador en sí, el requisito lo marca el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, la vía directa es `transformers` + `peft` (cargando `PeftModel.from_pretrained`). Para vLLM, TGI, llama.cpp u Ollama hay que fusionar previamente el adaptador con el modelo base mediante `merge_and_unload()` y, en el caso de llama.cpp, convertir el resultado a GGUF.
- Latencia y throughput estimados: no disponibles. Los únicos datos de consumo publicados son los minutos de GPU del entrenamiento, no de inferencia.

## Comparativa con modelos similares

La información disponible solo permite comparar los brazos del propio repositorio y el modelo base sin entrenar. No se aportan datos frente a otros modelos de 1,5B de la competencia.

| Modelo / brazo | Parámetros | Contexto | pass@1 (GSM8K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base, sin entrenar) | 1,5B | 32 768 tokens según su ficha oficial | 0,36 | Apache 2.0 | HuggingFace (Qwen) |
| paper-gmts-token-select-1.5b, brazo referencia | 1,5B + LoRA | No disponible | 0,49 | Apache 2.0 | HuggingFace, subcarpeta `baseline` |
| paper-gmts-token-select-1.5b, brazo receta | 1,5B + LoRA | No disponible | 0,18 | Apache 2.0 | HuggingFace, raíz del repo |
| Otros modelos de ~1,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El brazo principal del repositorio (raíz) está colapsado: rinde por debajo del modelo sin entrenar (0,18 frente a 0,36 de pass@1) y genera completaciones mucho más cortas. El autor lo publica como registro del experimento, no como modelo para usar.
- No debe desplegarse en producción ni en tareas de usuario final.
- Sesgos conocidos: no documentados en la información disponible; los sesgos heredados del modelo base Qwen2.5-1.5B-Instruct no se han evaluado en esta ficha.
- Riesgo de alucinación: no cuantificado para este adaptador. El entrenamiento se limita a GSM8K, un dataset de problemas matemáticos de primaria, por lo que la generalización fuera de ese dominio es incierta.
- Limitaciones de contexto e idioma: no declaradas en la ficha del adaptador. No hay evaluación multilingüe publicada.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial del artefacto, pero conviene verificar la licencia del modelo base Qwen2.5-1.5B-Instruct, también Apache 2.0 según su ficha.
- Caveat metodológico: el resultado de la comparación es un hallazgo negativo con un tamaño de muestra de 120 tareas emparejadas y 40 pasos de entrenamiento por brazo; no debe extrapolarse a otros presupuestos de tokens, otras tareas u otros modelos.
- La model card advierte explícitamente de que hay que leer su sección "Learned" antes de citar cualquier cifra.
- El repositorio no incluye la carpeta `checkpoints/`.
- Los datos de fecha de creación y actualización del repositorio son 2026-09-22, posteriores a la fecha de esta consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/paper-gmts-token-select-1.5b
- Receta asociada (código de reproducción): https://github.com/whilehq/whileai-sdk/tree/main/recipes/papers/gmts-token-select
- Repositorio whileai-sdk: https://github.com/whilehq/whileai-sdk
- Colección "Papers, replicated": https://huggingface.co/collections/while-ai/papers-replicated-6ab271de22542eb550d4251c
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/openai/gsm8k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a entradas de diccionarios francés-inglés sobre la palabra "while" y a la página de Wikipedia sobre la estructura de control `while`, sin relación con el modelo.
