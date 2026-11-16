# yotisstudios/RaifuWars-Riko-B4-9B

## Resumen

RaifuWars-Riko-B4-9B es un modelo de lenguaje multimodal (image-text-to-text) obtenido mediante el merge del modelo base B4-9B de schneewolflabs con el adaptador LoRA RaifuWars-Riko-B4-9B-LoRA, desarrollado por yotisstudios. Su propósito es encarnar la voz de Riko Ricochet, una VTuber de IA que retransmite partidas de Raifu Wars en directo y narra en tiempo real lo que hace, lo que hacen los demás jugadores y la conversación con el chat entre turnos.

El modelo parte de la arquitectura Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`) con 9.653.104.368 parámetros totales y conserva la cabeza MTP (multi-token prediction) del modelo base. Se distribuye en dos formatos: safetensors en bf16 para transformers y un GGUF Q8_0 sin la cabeza MTP para llama.cpp, que cabe en una tarjeta de 16 GB con margen para contexto.

La relevancia del modelo está en su enfoque de validación: el autor midió explícitamente si el merge degrada la calidad del adaptador frente a aplicarlo en tiempo de ejecución, comparando ambos enfoques sobre 838 prompts retenidos. El resultado muestra que el merge a Q8_0 conserva prácticamente toda la ganancia del LoRA, con una diferencia de 0,8 puntos dentro del ruido estadístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con cabeza MTP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 24576`) |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0 (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards), GGUF |

## Arquitectura y entrenamiento

El modelo es un merge de pesos: se parte de B4-9B y se fusiona el adaptador LoRA RaifuWars-Riko-B4-9B-LoRA, sin un entrenamiento adicional posterior al merge. La arquitectura subyacente es Qwen3.5 en su variante multimodal `Qwen3_5ForConditionalGeneration`, que incluye una cabeza MTP (multi-token prediction) conservada intacta en los pesos safetensors; el GGUF Q8_0 distribuido prescinde de dicha cabeza. El pipeline declarado es text-generation, aunque los tags incluyen image-text-to-text.

Los detalles de entrenamiento (composición del dataset, número de tokens, uso de RLHF/DPO) no están en la información proporcionada: el autor remite explícitamente a la página del LoRA para datos de entrenamiento y limitaciones. La innovación técnica destacable es la validación del proceso de merge: se comparó el modelo fusionado y cuantizado a Q8_0 contra el modelo base con el LoRA f16 aplicado en tiempo de ejecución sobre 838 prompts retenidos de narrador (1.676 líneas, semilla 99), usando un verificador de reglas y un juez automático. El merge a Q8_0 obtuvo 91,3% de líneas "buenas" frente al 92,1% del LoRA en runtime, con una tasa de fallo duro del 0,5% frente al 0,9%.

## Capacidades

- Generación de texto conversacional orientada a narración en directo de partidas.
- Narración de game commentary: describe acciones propias, acciones de otros jugadores y conversación con el chat entre turnos.
- Procesamiento image-text-to-text (según tags y clase del modelo), aunque no se detallan las capacidades de visión en la model card.
- Capacidad multimodal heredada de la arquitectura Qwen3.5.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüe: limitado a inglés según el campo `language`.
- Modo thinking: el autor indica explícitamente que debe usarse con thinking desactivado, tal como se entrenó y midió.

## Casos de uso

- Retransmisión de partidas con VTuber de IA: el modelo genera la narración en tiempo real de una partida de Raifu Wars, describiendo las jugadas propias y las de los rivales con el registro de Riko Ricochet. Es su caso de uso nativo y el que se midió en la evaluación.
- Comentario deportivo automatizado de partidas: puede adaptarse a otros juegos o competiciones donde se necesite narración turno a turno con contexto de lo ocurrido previamente.
- Interacción con chat en directo: gestiona la conversación entre turnos con la audiencia, respondiendo en el tono del personaje.
- Prototipado de personajes conversacionales con personalidad fija: sirve como referencia de cómo un LoRA de personaje puede fusionarse en un modelo base sin pérdida apreciable de calidad.
- Despliegue en local con llama.cpp: el GGUF Q8_0 cabe en una GPU de 16 GB, lo que permite ejecutar el narrador en estaciones de trabajo consumer para demos o streaming.
- Evaluación de pipelines de merge y cuantización: el modelo y su metodología de medición (verificador de reglas más juez) son un ejemplo reproducible para validar merges de LoRA en producción.
- Generación de contenido de entretenimiento con personajes con licencia permisiva: al ser apache-2.0, puede integrarse en productos comerciales de narración o gaming.

## Benchmarks y rendimiento

Evaluación del autor sobre 838 prompts retenidos de narrador (2 líneas cada uno, 1.676 líneas, semilla 99). "Good" indica que la línea pasó el verificador de reglas y el juez; "hard fail" son fallos duros; "judge score" es la puntuación del juez.

| Narrador | Good | Hard fail | Judge flag | Judge score |
|---|---|---|---|---|
| B4-9B Q8_0 | 57,2% | 16,0% | 22,6% | 3,63 |
| B4-9B Q8_0 + LoRA f16 en runtime | 92,1% | 0,9% | 3,9% | 3,98 |
| Este modelo, GGUF Q8_0 | 91,3% | 0,5% | 4,2% | 3,98 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 está pensado para caber en una GPU de 16 GB con margen para contexto; los pesos bf16 (9,65B parámetros) requieren aproximadamente 19-20 GB solo para pesos, por lo que necesitan 24 GB o más para contexto.
- GPU recomendadas: para GGUF Q8_0, tarjetas de 16 GB como RTX 4080, RTX 4090 (24 GB, con más margen), RTX 5080 o A4000; para bf16, A100 40 GB, H100, L40S o RTX 4090 con contexto reducido.
- Cabe en GPU consumer: sí, en el formato Q8_0 con 16 GB; en bf16 requiere tarjetas de gama alta con 24 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`), transformers con safetensors; vLLM, TGI u Ollama no se mencionan en la información proporcionada.
- Comando de referencia del autor: `llama-server -m RaifuWars-Riko-B4-9B-Q8_0.gguf -c 24576 -ngl 99 -fa on --jinja`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RaifuWars-Riko-B4-9B | 9,65B | no disponible | apache-2.0 | safetensors, GGUF | Narrador especializado, merge validado |
| B4-9B (base) | ~9B | no disponible | no disponible | safetensors | Modelo base sin el LoRA de Riko |
| B4-9B Q8_0 + LoRA f16 en runtime | ~9B + LoRA | no disponible | apache-2.0 (LoRA) | safetensors + LoRA | Misma calidad, requiere aplicar el adaptador en carga |

No se dispone de datos de otros modelos comparables de la misma categoría (narradores de VTuber o game commentary) en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está validado.
- Modo thinking: debe usarse desactivado, tal como se entrenó y midió; activarlo puede degradar la calidad de la narración.
- Especialización estrecha: el modelo está ajustado para narración de Raifu Wars con la personalidad de Riko Ricochet; su comportamiento fuera de ese dominio no está evaluado.
- Riesgo de alucinación: no se documenta explícitamente, pero es inherente a los modelos generativos; el autor usa un verificador de reglas y un juez, lo que sugiere que las salidas requieren validación.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base B4-9B y del LoRA, ya que la información sobre sus licencias no está detallada.
- El GGUF Q8_0 no incluye la cabeza MTP, por lo que no se dispone de decodificación especulativa con esa cabeza en llama.cpp.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yotisstudios/RaifuWars-Riko-B4-9B
- LoRA de Riko: https://huggingface.co/yotisstudios/RaifuWars-Riko-B4-9B-LoRA
- Modelo base B4-9B: https://huggingface.co/schneewolflabs/B4-9B
- Raifu Wars: https://raifuwars.com
