# ZelligeAI/Tessera-27B-B-CJK

## Resumen

Tessera-27B-B-CJK es un ajuste fino (finetune) del modelo Qwen3.8-27B desarrollado por ZelligeAI, publicado como un LoRA de rango 32 fusionado en los pesos bf16 del modelo base. Su propuesta no es mejorar la calidad bruta, sino reducir el coste por turno en bucles de agente de programación: el modelo "piensa" en una taquigrafía CJK comprimida (mezcla de inglés, palabras en chino y símbolos) y, según el autor, consume entre 0,50x y 0,64x los tokens de razonamiento del modelo base por turno de agente en 11 tareas de coding-agent reservadas.

El modelo conserva el pipeline image-text-to-text del base y está etiquetado como agentic, coding-agent y efficient-reasoning. Las respuestas y las llamadas a herramientas se emiten en inglés plano y código, de modo que el ahorro afecta solo al bloque de razonamiento intermedio, no a la salida visible. Esta es una versión beta y el autor no reporta ningún ajuste de seguridad adicional sobre el modelo base.

Con 27.781.427.952 parámetros y pesos bf16 de 55,6 GB, es relevante ahora porque ataca un cuello de botella económico concreto de los agentes autónomos (tokens de thinking por paso) sin cambiar de arquitectura ni de tokenizador, y porque se distribuye con cuantizaciones GGUF y NVFP4/FP8 listas para desplegar, bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.8-27B (tag `qwen3_5`); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parámetros totales | 27.781.427.952 (dato real de safetensors) |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | Al menos 131.072 tokens (probado con prompts de 101K-131K); los turnos de agente usan ventana de 64K y el ejemplo de vLLM fija `max_model_len=65536` |
| Tipos de cuantización | BF16 (pesos fusionados), GGUF BF16 + cinco cuantizaciones "replica" con layout Unsloth (no evaluadas), NVFP4 y FP8 (23,4 GB, no evaluadas); adaptador LoRA en PEFT (1,09 GB) |
| Idiomas soportados | Inglés (idioma declarado y de salida); el razonamiento interno usa taquigrafía mixta CJK (inglés, chino y símbolos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF, NVFP4/FP8; adaptador LoRA PEFT |

## Arquitectura y entrenamiento

No se detallan en la información disponible la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO. Lo que sí se documenta es el método: un LoRA de rango 32 entrenado sobre Qwen3.8-27B y fusionado posteriormente en los pesos bf16 del base. El pipeline declarado es image-text-to-text y la etiqueta de arquitectura es `qwen3_5`, por lo que hereda las capacidades multimodales del modelo original; el ajuste se orienta a comportamiento agéntico y de código, no a visión.

La innovación técnica es de comportamiento más que de arquitectura: el modelo aprende a emitir trazas de razonamiento extremadamente compactas en una notación CJK abreviada, mientras mantiene la respuesta y las llamadas a herramientas en inglés y código. El autor señala explícitamente que, con este tokenizador, el ahorro no proviene de comprimir caracteres en menos tokens, sino de que el modelo piensa menos. Los tests se ejecutaron en bf16 con temperatura 1.0, top-p 0.95, top-k 20 y `reasoning_effort="xhigh"`, con la recomendación de descartar los "think" pasados del historial.

## Capacidades

- Generación de código y razonamiento orientado a tareas de ingeniería de software dentro de bucles de agente.
- Llamada a herramientas (tool calling / function calling) con formato válido: 88 de 88 llamadas válidas en los turnos evaluados.
- Ejecución de agentes multi-paso: 9 tareas reservadas de hasta 15 pasos, sin romper tests existentes en la evaluación del autor.
- Razonamiento comprimido ("thinking mode") en taquigrafía CJK, con salida final en inglés.
- Contexto largo: manejo de prompts de 101K-131K tokens con 6 de 6 llamadas a herramientas válidas y salida limitada a 32.768 tokens.
- Capacidad multimodal heredada del base (pipeline image-text-to-text), aunque el ajuste no la evalúa.
- Soporte de tres niveles de esfuerzo de razonamiento vía la plantilla de chat estándar de Qwen3.8: `low`, `medium` y `xhigh`.
- Estabilidad de bucle: 0 repeticiones en 88 turnos, igual que el modelo base.

## Casos de uso

- Agentes de reparación de bugs en CI/CD: el modelo recibe el estado del repositorio y el fallo de tests, emite llamadas a herramientas para inspeccionar paquetes y ficheros, y aplica el parche; el menor número de tokens de thinking por turno reduce el coste y la latencia en pipelines con muchos pasos.
- Refactorización asistida sobre bases de código grandes: con ventana de 64K por turno y soporte verificado de prompts de hasta 131K, puede cargar varios ficheros y el historial de cambios en una sola llamada.
- Automatización de revisión de código (code review): el modo de razonamiento comprimido permite analizar un diff y producir comentarios en inglés sin gastar presupuesto de tokens en explicaciones internas largas.
- Orquestación de agentes con muchas iteraciones: al mantener 100% de llamadas a herramientas válidas y cero bucles, es adecuado para bucles de 10-15 pasos donde el coste acumulado por turno domina la factura.
- Migración y auditoría de dependencias: tareas de rastreo de símbolos entre paquetes (el ejemplo del autor busca cómo se registra un checker en el paquete `checkers`) encajan con su patrón de exploración de repositorio.
- Despliegue en infraestructura limitada: con la variante NVFP4/FP8 de 23,4 GB puede servirse en una sola GPU de 24-48 GB, lo que habilita agentes de código en nodos de gama media.
- Generación de documentación técnica y comentarios de API a partir del código, con salida en inglés consistente y verificable.

## Benchmarks y rendimiento

Todas las cifras provienen de la model card y comparan Tessera con el Qwen3.8-27B sin ajustar sobre las mismas entradas (bf16, temperatura 1.0, top-p 0.95, top-k 20, `reasoning_effort="xhigh"`).

| Prueba | Tessera vs base |
|---|---|
| Thinking por turno de agente (11 tareas reservadas, 44 estados fijos, 2 muestras cada uno) | 0,50-0,64x tokens de thinking del base. Turno típico (media geométrica): 0,496x, IC 90% 0,385-0,624. Ratio ponderado por tokens: 0,644x, IC 90% 0,208-0,866 |
| Tokens generados por turno (think + respuesta + tool calls, 88 turnos emparejados) | 575 vs 847 de media |
| Llamadas a herramientas válidas | 88 de 88, igual que el base |
| Bucles de repetición | 0 de 88, igual que el base |
| Ejecuciones multi-paso (9 tareas reservadas, hasta 15 pasos) | Ninguno de los dos modelos rompió tests existentes; sin pérdida de calidad medible en una prueba pequeña |
| Contexto largo (6 estados con prompts de 101K-131K, salida máx. 32.768) | 6 de 6 llamadas válidas, igual que el base; sin bucles ni ventana agotada |
| Smoke test de seguridad e idioma (20 prompts, 2 niveles de esfuerzo, salida máx. 4.096) | Sin señal en contra frente al base, según un juez ciego |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Pesos bf16: 55,6 GB. Para inferencia hace falta aproximadamente 60-70 GB de VRAM contando caché KV, según longitud de contexto y lote.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, H200 o dos aceleradores de 48 GB. No cabe en una RTX 4090 de 24 GB.
- Variante NVFP4/FP8 (23,4 GB): encaja en una sola GPU de 32-48 GB (L40S, RTX 6000 Ada, A100 40 GB) y queda muy justa en 24 GB, donde la caché KV limita la longitud de contexto práctica. No evaluada por el autor.
- GGUF: el repo incluye BF16 y cinco cuantizaciones con layout Unsloth, no evaluadas. Las variantes de 4 bits permitirían, en estimación, ejecución en GPUs consumer de 24 GB con contexto moderado; sin datos de calidad publicados.
- Despliegue probado: vLLM 0.31 (con `dtype="bfloat16"`, `max_model_len=65536`, `enforce_eager=True`, `limit_mm_per_prompt={"image": 0, "video": 0}`) y transformers 5.17 con `AutoModelForImageTextToText`, ambos sobre copia local de los pesos. La carga directa desde el Hub no fue probada.
- Alternativas no confirmadas por el autor: llama.cpp u Ollama para los GGUF, TensorRT-LLM para NVFP4. No hay datos de latencia ni throughput publicados.
- Nota operativa: `enforce_eager=True` en vLLM desactiva CUDA graphs, lo que reduce el throughput frente a la configuración por defecto; el autor no reporta métricas de rendimiento con esa configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tessera-27B-B-CJK | 27,78 B | ≥131K (turnos de 64K) | Coding-agent con thinking comprimido CJK; 0,50-0,64x tokens de razonamiento | Apache 2.0 | Pesos bf16, LoRA, GGUF y NVFP4/FP8 en HuggingFace |
| Qwen/Qwen3.8-27B (base) | 27,78 B (mismo linaje) | Igual que Tessera (el ajuste no cambia el tokenizador ni la ventana) | Modelo generalista multimodal image-text-to-text | Apache 2.0 (según el modelo base declarado) | HuggingFace |
| Otras alternativas de ~27B para agentes de código | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de otros modelos comparables en la información proporcionada; la única comparación con cifras es contra el modelo base.

## Limitaciones y advertencias

- Es una versión beta: el propio autor la etiqueta como tal y no garantiza paridad de calidad fuera de las tareas evaluadas.
- No incorpora ajuste de seguridad adicional sobre el modelo base; hereda sus sesgos y sus riesgos de alucinación sin mitigación extra.
- Las evaluaciones son pequeñas y de dominio estrecho: 11 tareas de coding-agent, 44 estados, 88 turnos, 9 ejecuciones multi-paso y 20 prompts de seguridad. Los intervalos de confianza del ahorro de tokens son amplios (0,208-0,866 en el ratio ponderado).
- El juez de seguridad es un único modelo ciego; no hay evaluación humana ni batería estándar de seguridad.
- El razonamiento interno en taquigrafía CJK dificulta la auditoría y el depurado de las trazas de pensamiento, y puede degradar la interpretabilidad y el filtrado de contenido.
- Idioma: declarado únicamente inglés. No hay evaluación multilingüe; el uso en castellano no está verificado.
- Requiere seguir estrictamente la receta de uso: `reasoning_effort="xhigh"`, temperatura 1.0, top-p 0.95, top-k 20 y descartar los "think" anteriores del historial. Desviarse puede anular el ahorro o degradar la calidad.
- Las cuantizaciones GGUF y NVFP4/FP8 no fueron evaluadas por el autor; su calidad y estabilidad son desconocidas.
- Licencia Apache 2.0 permite uso comercial, pero el cumplimiento debe verificarse también respecto al modelo base Qwen3.8-27B.
- Solo 99 descargas y 12 "me gusta" en el momento de la consulta: ecosistema muy pequeño, poca validación independiente.
- El ejemplo de despliegue con vLLM usa `enforce_eager=True`, lo que puede penalizar el throughput en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK
- Adaptador LoRA: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-LoRA
- Cuantizaciones GGUF: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-GGUF
- Checkpoint NVFP4/FP8: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o repositorio adicionales: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados eran contenido de foros sin relación.
