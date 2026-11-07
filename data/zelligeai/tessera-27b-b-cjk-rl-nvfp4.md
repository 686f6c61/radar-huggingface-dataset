# ZelligeAI/Tessera-27B-B-CJK-RL-NVFP4

## Resumen

Tessera-27B-B-CJK-RL-NVFP4 es un checkpoint cuantizado en NVFP4 y FP8 del modelo Tessera-27B-B-CJK-RL, desarrollado por ZelligeAI. Se trata de un modelo orientado a tareas de agente de programación (coding agent) construido sobre Qwen3.8-27B, cuyo rasgo distintivo es que razona internamente en CJK comprimido (una taquigrafía que mezcla inglés, palabras chinas y símbolos), mientras que las respuestas y las llamadas a herramientas se emiten en inglés plano y código. El objetivo declarado es reducir el número de tokens de razonamiento por turno de agente sin degradar la calidad de las respuestas.

El modelo base es un LoRA de rango 32 fusionado sobre los pesos bf16 de Qwen3.8-27B, entrenado después con ocho actualizaciones de aprendizaje por refuerzo sobre matemáticas y código. Este repositorio concreto no contiene los pesos bf16, sino una versión cuantizada de 23,4 GB generada con llm-compressor 0.14 y compressed-tensors 0.19, que combina NVFP4 para los pesos MLP de las capas 0-55, FP8 para las proyecciones de atención, `lm_head` y las capas 56-63, y bf16 para embeddings, normas, torre de visión y cabeza MTP.

La relevancia de esta ficha es doble: por un lado documenta una técnica poco habitual de compresión del razonamiento (pensar en CJK abreviado para ahorrar tokens), y por otro ofrece un formato de cuantización de cuarta generación pensado para GPUs NVIDIA Blackwell. Conviene señalar desde el principio que el autor etiqueta el checkpoint como beta y que los resultados publicados provienen del LoRA sobre Tinker, no de mediciones sobre los ficheros de este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa (familia qwen3_5), con torre de visión y cabeza MTP |
| Parámetros totales | 20.294.595.344 (según safetensors); el nombre comercial indica 27B |
| Parámetros activos | no disponible |
| Longitud de contexto | 64K tokens (ventana mencionada en la evaluación del modelo base) |
| Tipos de cuantización | NVFP4 (MLP capas 0-55), FP8 (q/k/v/o, `in_proj_qkv`, `in_proj_z`, `out_proj`, `lm_head`, MLP capas 56-63, escalas estáticas de KV cache), bf16 (embeddings, normas, `in_proj_a`, `in_proj_b`, `conv1d`, torre de visión, cabeza MTP) |
| Idiomas soportados | no disponible (el razonamiento interno usa CJK comprimido; respuestas y tool calls en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (1.968 tensores, misma disposición que unsloth/Qwen3.8-27B-NVFP4) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B, que combina capas de atención completa con capas de atención lineal (se observan tensores `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` y `conv1d` propios de atención lineal), además de una torre de visión y una cabeza MTP (multi-token prediction). Sobre esa base, ZelligeAI aplicó un LoRA de rango 32 y lo fusionó en los pesos bf16, y después realizó ocho actualizaciones de aprendizaje por refuerzo centradas en matemáticas y código. El resultado es Tessera-27B-B-CJK-RL, que respecto a Tessera-27B-B-CJK mejora la resolución de problemas de competición y conserva la mayor parte del ahorro de tokens de razonamiento por turno.

La innovación principal no está en la arquitectura sino en el comportamiento aprendido: el modelo "piensa" en una notación CJK comprimida que mezcla inglés, chino y símbolos, lo que reduce el número de tokens dedicados al razonamiento. Según la model card, en un turno típico de agente el modelo gasta 0,67x los tokens de pensamiento del modelo base (IC 0,53-0,85), mientras que Tessera-27B-B-CJK gasta 0,60x. La cuantización se calibró con 256 secuencias de hasta 2.048 tokens, la mitad ventanas del conjunto de SFT agéntico y la otra mitad salidas de razonamiento limpias del propio modelo, sin elementos de evaluación sellados.

## Capacidades

- Generación de texto y código, con especialización en tareas de agente de programación (edición de ficheros, ejecución de tests, lint, typecheck).
- Razonamiento matemático de competición: el modelo base resuelve problemas de AIME y HMMT February 2026.
- Llamada a herramientas (tool calling): 256 de 256 llamadas válidas en los turnos evaluados.
- Razonamiento multi-paso en entornos agénticos, con un modo de pensamiento comprimido en CJK.
- Control de esfuerzo de razonamiento mediante el parámetro `reasoning_effort` (valores como `xhigh`), pasado en `chat_template_kwargs`.
- Capacidad multimodal potencial: el checkpoint incluye torre de visión en bf16, aunque la model card no documenta su uso y el comando de servicio de vLLM desactiva imagen y vídeo (`--limit-mm-per-prompt '{"image": 0, "video": 0}'`).
- Capacidades multilingües: no disponibles; el razonamiento interno usa CJK comprimido y las respuestas se emiten en inglés.

## Casos de uso

- Agente de código en pipelines de CI/CD: el modelo puede recibir el estado de un repositorio, ejecutar tests y lint, y decidir la siguiente acción con llamadas a herramientas válidas, reduciendo el coste por turno gracias al razonamiento comprimido.
- Reparación automática de tests y typecheck: en el ejemplo de la model card, el modelo identifica que la suite coincide con la línea base (5 fallos preexistentes, 11 tests nuevos que pasan) y localiza el único error de typecheck en `version.ts`, lo que encaja en flujos de revisión automática de PRs.
- Asistente de programación con ventana larga: los 64K tokens de contexto permiten cargar varios ficheros y el historial de una sesión de depuración sin truncar, útil en tareas de refactorización multi-fichero.
- Razonamiento matemático asistido: con `reasoning_effort="xhigh"` el modelo aborda problemas de competición (AIME, HMMT) y puede integrarse en herramientas de verificación de soluciones o generación de problemas.
- Despliegue en infraestructura Blackwell: al usar NVFP4 nativo, el checkpoint está pensado para servir en B200 o RTX PRO 6000 Blackwell con vLLM, reduciendo el espacio de pesos a 23,4 GB frente a los 55,6 GB del bf16.
- Evaluación de técnicas de compresión de razonamiento: investigadores interesados en reducir tokens de pensamiento pueden usar este modelo como referencia frente a su versión no RL (Tessera-27B-B-CJK) y al modelo base Qwen3.8-27B.
- Servicio de agente con presupuesto de tokens ajustado: la reducción a 0,67x tokens de pensamiento por turno abarata el coste de inferencia en bucles agénticos largos, siempre que se acepte el formato de razonamiento en CJK.

## Benchmarks y rendimiento

Los datos publicados corresponden al LoRA sobre Tinker (equivalente por comprobación de logprob a los pesos bf16 fusionados), no a este checkpoint cuantizado. Muestreo en bf16 con `reasoning_effort="xhigh"`, temperatura 1.0, top-p 0.95, top-k 20, intervalos del 90%.

| Métrica | Tessera-27B-B-CJK-RL | Tessera-27B-B-CJK |
|---|---|---|
| AIME y HMMT February 2026 (63 problemas, 2 intentos) | 108 de 126 correctos | 97 |
| Mismos problemas, intentos cortados a 64K tokens | 11 | 23 |
| Tokens de pensamiento por turno de agente frente al modelo base (turno típico, 64 estados nuevos de 16 tareas retenidas) | 0,67x (IC 0,53-0,85) | 0,60x (IC 0,50-0,73) |
| Llamadas a herramientas válidas en esos turnos | 256 de 256 | 256 de 256 |
| 118 problemas difíciles de matemáticas y código (media de 2 intentos) | 100 correctos | 89 |

La ganancia emparejada en los problemas de competición es de +5,5 problemas (IC +1,5 a +9,5). En turnos de agente el modelo piensa 1,11x respecto a Tessera-27B-B-CJK (IC 0,98-1,26). No se han publicado mediciones de calidad sobre los ficheros NVFP4 de este repositorio; el autor solo confirma que el checkpoint supera una comprobación de comportamiento.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 23,4 GB; con overhead de ejecución y caché KV en FP8 conviene reservar al menos 32-48 GB según longitud de contexto y batch.
- GPU recomendadas: NVIDIA Blackwell (B200, RTX PRO 6000 Blackwell) para cómputo FP4 nativo. En otras GPUs el checkpoint puede cargar o no según el motor de inferencia.
- GPU de consumo: cabe en RTX PRO 6000 Blackwell (96 GB). En RTX 4090 (24 GB) los pesos apenas caben y no hay soporte FP4 nativo, por lo que el despliegue práctico es dudoso.
- Despliegue: vLLM 0.31 (clase `LLM` offline verificada; el modo servidor no está probado). Comando de referencia: `vllm serve ZelligeAI/Tessera-27B-B-CJK-RL-NVFP4 --limit-mm-per-prompt '{"image": 0, "video": 0}'`.
- Alternativas de despliegue: el repositorio GGUF del modelo base ofrece BF16 GGUF y cinco cuantizaciones con disposición Unsloth, no evaluadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Tessera-27B-B-CJK-RL-NVFP4 | 20,3B (safetensors) | 64K | NVFP4 + FP8 + bf16 | Apache 2.0 | Este modelo; requiere Blackwell para FP4 nativo |
| Tessera-27B-B-CJK-RL | 27B (nominal) | 64K | bf16 | Apache 2.0 | Pesos fusionados de 55,6 GB; resultados de referencia publicados |
| Tessera-27B-B-CJK | 27B (nominal) | 64K | bf16 | Apache 2.0 | Versión previa sin RL; 97/126 en AIME/HMMT, 0,60x tokens de pensamiento |
| unsloth/Qwen3.8-27B-NVFP4 | 27B (nominal) | no disponible | NVFP4 | no disponible | Referencia de disposición de tensores que replica este checkpoint |

## Limitaciones y advertencias

- Checkpoint beta: el autor lo describe como versión beta y el propio repositorio indica que no ha sido evaluado; los resultados publicados son del LoRA, no de estos ficheros.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de código y matemáticas, puede generar APIs o resultados plausibles pero incorrectos.
- Dependencia de hardware: NVFP4 requiere GPU NVIDIA Blackwell para cómputo nativo; en otras GPUs la carga depende del motor y el rendimiento puede degradarse.
- El modo servidor de vLLM no está probado, y el paso de `reasoning_effort` mediante `chat_template_kwargs` tampoco.
- Razonamiento interno en CJK comprimido: puede dificultar la auditoría de la cadena de pensamiento y complica la depuración de errores.
- Idiomas soportados no documentados; las respuestas se emiten en inglés, lo que limita su uso directo en castellano sin instrucciones adicionales.
- Capacidad multimodal presente en los pesos (torre de visión en bf16) pero no documentada ni habilitada en el comando de servicio recomendado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre calidad del checkpoint cuantizado.
- El conjunto de calibración excluyó elementos de evaluación sellados, lo que reduce el riesgo de contaminación, pero no se han publicado métricas de degradación por cuantización.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-NVFP4
- Pesos bf16 fusionados: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL
- Adaptador LoRA: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-LoRA
- GGUF: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-GGUF
- Modelo previo sin RL: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK
- Checkpoint NVFP4 del modelo previo: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-NVFP4
- Nota de publicación: https://zellige.ai/research/tessera-27b-b-cjk-rl-release
- Paper del modelo previo: https://zellige.ai/research/tessera-27b-b-cjk
- Referencia de disposición de tensores: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
