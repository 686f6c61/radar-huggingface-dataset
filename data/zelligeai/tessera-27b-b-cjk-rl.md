# ZelligeAI/Tessera-27B-B-CJK-RL

## Resumen

Tessera-27B-B-CJK-RL es un modelo de agente de código desarrollado por ZelligeAI, construido como un fine-tune sobre Qwen3.8-27B. Su particularidad es que razona en "CJK comprimido", una notación abreviada que mezcla inglés, palabras en chino y símbolos, lo que reduce de forma medible el número de tokens de pensamiento por turno de agente respecto al modelo base. Las respuestas y las llamadas a herramientas se emiten en inglés plano y código.

Esta versión RL parte del checkpoint Tessera-27B-B-CJK y añade ocho actualizaciones de aprendizaje por refuerzo sobre problemas de matemáticas y código. Según la model card, mejora la resolución de problemas de competición matemática (108 de 126 correctos frente a 97 del checkpoint anterior, con intervalos de confianza del 90%) manteniendo la mayor parte del ahorro de tokens por turno (0,67x los tokens de pensamiento del modelo base en el turno típico).

Es una release beta: un LoRA de rango 32 fusionado en los pesos bf16 del modelo base. El repositorio principal ocupa 55,6 GB y el modelo declara licencia Apache 2.0. Resulta relevante para quienes despliegan bucles de agente de código donde el coste de razonamiento por turno y la latencia importan tanto como la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (ventana usada en evaluación y en el ejemplo de vLLM) |
| Tipos de cuantizacion | BF16 (principal), GGUF (BF16 y cinco cuantizaciones réplica con layout Unsloth, no evaluadas), NVFP4 y FP8 (checkpoint de 23,4 GB, no evaluado) |
| Idiomas soportados | en (inglés); razonamiento interno en notación CJK comprimida |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); GGUF en repo separado; NVFP4/FP8 en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,78 mil millones de parámetros derivado de Qwen3.8-27B, con pipeline declarado image-text-to-text (aunque el uso previsto es de agente de código y el ejemplo de despliegue desactiva imagen y vídeo con `limit_mm_per_prompt`). El fine-tune se implementa como un LoRA de rango 32 y alpha 32 aplicado sobre atención, MLP y `lm_head`, fusionado posteriormente en los pesos bf16 del modelo base.

El entrenamiento parte del LoRA de Tessera-27B-B-CJK y añade ocho actualizaciones de RL sobre Tinker. Cada actualización muestrea 6 rollouts por cada uno de 11 o 12 problemas de matemáticas y código y aplica un paso de Adam con learning rate 2e-5. La innovación central es el "pensamiento CJK comprimido": una notación interna que reduce la longitud del razonamiento por turno sin degradar la validez de las llamadas a herramientas (256 de 256 válidas en los turnos evaluados). La evaluación se realizó en bf16 con `reasoning_effort="xhigh"`, temperatura 1.0, top-p 0.95 y top-k 20.

## Capacidades

- Generación de código y edición de ficheros en bucles de agente (tareas de coding-agent).
- Razonamiento matemático de competición (AIME, HMMT) y problemas de matemáticas y código de alta dificultad.
- Llamadas a herramientas válidas y consistentes (tool calling) en cada turno de agente.
- Razonamiento multi-paso con modo de pensamiento configurable mediante `reasoning_effort` (`low`, `medium`, `xhigh`).
- Razonamiento interno comprimido en notación CJK, con salida en inglés plano y código.
- Capacidad multimodal declarada (image-text-to-text) por herencia del modelo base, aunque el uso previsto y los ejemplos desactivan imagen y vídeo.
- Soporte de plantilla de chat con parámetros de muestreo recomendados.

## Casos de uso

- Agentes de código autónomos: el modelo está diseñado para bucles de agente donde cada turno incluye un "think" corto seguido de una acción; su reducción de tokens de pensamiento (0,67x el base en el turno típico) abarata y acelera cada iteración en pipelines de CI/CD o entornos de desarrollo.
- Reparación de tests y lint en repositorios: el ejemplo de la model card muestra un turno que resume el estado de la suite de tests, el typecheck y el siguiente comando de lint, lo que encaja en flujos de corrección automática de fallos.
- Resolución de problemas matemáticos de competición: con `reasoning_effort="xhigh"` y ventana de 64K, obtiene 108 de 126 correctos en AIME/HMMT febrero 2026, útil para evaluación de razonamiento o generación de soluciones verificables.
- Asistente de programación con contexto largo: la ventana de 65.536 tokens permite mantener historiales extensos de conversación y código en tareas de refactorización multi-fichero.
- Automatización de tareas de ingeniería con tool calling: la validez de 256/256 llamadas en los turnos evaluados lo hace adecuado para orquestación de herramientas en producción.
- Evaluación e investigación de razonamiento eficiente: sirve como referencia para estudiar el efecto del RL sobre la longitud del razonamiento y la precisión en modelos de agente.

## Benchmarks y rendimiento

Datos publicados en la model card (bf16, `reasoning_effort="xhigh"`, temperatura 1.0, top-p 0.95, top-k 20; intervalos del 90%):

| Metrica | Tessera-27B-B-CJK-RL | Tessera-27B-B-CJK |
|---|---|---|
| AIME y HMMT febrero 2026 (63 problemas, 2 intentos) | 108 de 126 correctos | 97 |
| Mismos problemas, intentos cortados a la ventana de 64K | 11 | 23 |
| Tokens de pensamiento por turno de agente frente al base (turno típico, 64 estados nuevos de 16 tareas) | 0,67x (IC 0,53-0,85) | 0,60x (IC 0,50-0,73) |
| Llamadas a herramientas válidas en esos turnos | 256 de 256 | 256 de 256 |
| 118 problemas difíciles de matemáticas y código (media de 2 intentos) | 100 correctos | 89 |

La ganancia pareada en los problemas de competición es de +5,5 problemas (IC +1,5 a +9,5), en parte por terminar dentro de la ventana más a menudo. En turnos de agente piensa 1,11x lo que Tessera-27B-B-CJK (IC 0,98-1,26). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55,6 GB de pesos, por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) o varias GPU con tensor parallelism.
- Checkpoint NVFP4/FP8 de 23,4 GB: permite inferencia en GPUs de 24-32 GB (RTX 4090, L40S, A10) si el runtime soporta NVFP4/FP8; no evaluado por el autor.
- Cuantizaciones GGUF (BF16 y cinco réplicas Unsloth): opción para llama.cpp/Ollama en hardware consumer, aunque no evaluadas.
- Despliegue probado: vLLM 0.31 con `max_model_len=65536` y prompts pre-tokenizados; carga con transformers 5.17 (generación no probada).
- No se indica latencia ni throughput medidos; solo la reducción relativa de tokens de pensamiento por turno (0,67x frente al base).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tessera-27B-B-CJK-RL | 27,78B | 65.536 | 108/126 en AIME/HMMT feb. 2026; 0,67x tokens de pensamiento | Apache 2.0 | Hugging Face (bf16, LoRA, GGUF, NVFP4) |
| Tessera-27B-B-CJK | 27,78B | no disponible | 97/126 en AIME/HMMT feb. 2026; 0,60x tokens de pensamiento | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | 27B (aprox.) | no disponible | Referencia de tokens de pensamiento (1x) | no disponible en la información | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Release beta: el autor la describe como beta y el fine-tune no añade ajuste de seguridad más allá del del modelo base.
- Riesgo de alucinación inherente a modelos generativos; no se han publicado evaluaciones específicas de factualidad.
- Idiomas: solo se declara inglés; el razonamiento interno usa notación CJK comprimida, lo que puede dificultar la auditoría del razonamiento.
- Ventana de contexto limitada a 65.536 tokens; los intentos que exceden la ventana se truncan (23 intentos cortados en el checkpoint anterior, 11 en este).
- Las cuantizaciones GGUF y NVFP4/FP8 no han sido evaluadas por el autor.
- No se probó la carga desde el Hub ni el renderizado de la plantilla de chat a través de vLLM.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia que debe verificarse por separado.
- Sin resultados de benchmarks estándar publicados (MMLU, HumanEval, GSM8K), lo que limita la comparación con otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL
- LoRA (PEFT adapter): https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-LoRA
- GGUF: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-GGUF
- NVFP4/FP8: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-NVFP4
- Modelo predecesor: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK
- Post de release: https://zellige.ai/research/tessera-27b-b-cjk-rl-release
- Paper del predecesor: https://zellige.ai/research/tessera-27b-b-cjk
