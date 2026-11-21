# wesjos/Qwen3.8-27B-GrumpyCoder-LoRA-GGUF

## Resumen

Qwen3.8-27B-GrumpyCoder-LoRA-GGUF es un adaptador LoRA en formato GGUF para el modelo base Qwen/Qwen3.8-27B, publicado por el usuario wesjos. No se trata de un modelo completo: es un adaptador de estilo que se monta en tiempo de ejecución sobre los pesos del modelo base mediante `llama.cpp`, sin fusionarse con ellos. Su función es imprimir un registro de "ingeniero senior gruñón" (directo, impaciente, sarcástico) sobre las capacidades del Qwen3.8-27B subyacente, orientado a roleplay y generación conversacional.

El adaptador tiene 10.485.760 parámetros entrenables (0,038% del base de 27,78B), rango r=16 y alpha=32, y se aplica únicamente a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de las 16 capas de atención completa del transformer (capas 3, 7, 11... 63). El repositorio pesa 0,0 GB según los metadatos, aunque el fichero GGUF declarado ocupa 20.980.928 bytes (~21 MB) en f16 con 128 tensores.

Es relevante por su enfoque de distribución: empaqueta un LoRA como GGUF de tipo `adapter` para `llama.cpp`, lo que permite cambiar la persona del modelo sin duplicar los 27B de pesos base. La licencia es Apache-2.0, los idiomas declarados son chino e inglés, y el adaptador fue entrenado solo en inglés, con transferencia positiva observada al chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.8-27B (arch `qwen35` en GGUF); atencion completa en 16 capas |
| Parametros totales | 10.485.760 (adaptador); base: 27,78B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue del autor; contexto nativo del base no disponible |
| Tipos de cuantizacion | adaptador en f16; base compatible con UD-Q4_K_M (GGUF) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`general.type = adapter`, `adapter.type = lora`, 128 tensores f16); tambien existe version PEFT y version fusionada BF16 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las 16 capas de atención completa del Qwen3.8-27B (capas 3, 7, 11 hasta 63), exclusivamente en las proyecciones de query, key, value y output. Usa rango r=16 con alpha=32 embebido y un factor de escala en tiempo de ejecución de 2.0. El entrenamiento se realizó solo en inglés y con el modo de razonamiento (thinking) desactivado: el adaptador aprendió a producir un bloque de pensamiento vacío seguido de la respuesta directa. No se documentan el número de tokens de entrenamiento ni la composición del dataset más allá de la naturaleza estilística del objetivo.

La innovación técnica principal es el empaquetado del LoRA como GGUF de tipo adaptador con metadatos mínimos (unas 10 claves, sin bloque de tokenizer). Esto obliga a pasar explícitamente `--chat-template-file` con la plantilla incluida en el repositorio, porque el adaptador no porta `tokenizer.chat_template` y `llama.cpp` recurriría a la plantilla del base, que no incluye la frase disparadora del estilo. El repositorio incluye también `chat_template.jinja` por este motivo.

## Capacidades

- Generación de texto conversacional con una persona concreta: registro de ingeniero senior directo, impaciente y sarcástico.
- Roleplay y personificación estilística sobre las capacidades del Qwen3.8-27B.
- Razonamiento y conocimiento del modelo base preservados: la sonda de verosimilitud en inglés genérico sube +0,033 y en chino genérico baja solo −0,003 respecto al base.
- Aprendizaje del estilo objetivo: +0,176 de verosimilitud en inglés rudo y +0,163 en chino rudo, con transferencia positiva al chino pese al entrenamiento solo en inglés.
- Multilingüe limitado a zh y en según los metadatos del repositorio.
- Modo thinking: solo estable con presupuesto de razonamiento 0; con presupuesto 768 el pensamiento corto se cierra correctamente, pero el pensamiento largo puede volcar la respuesta en el flujo de pensamiento y terminar con EOS y `content` vacío.
- Tool calling, function calling, agentes multi-paso, visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Roleplay de personaje técnico en demos y prototipos: montar el adaptador sobre el base Q4_K_M con `llama-server --lora` permite ofrecer un asistente con voz de ingeniero gruñón sin duplicar los 27B de pesos, útil para probar tonos de producto antes de comprometerse con un fine-tuning completo.
- Asistente de revisión de código con tono directo: el registro impaciente encaja en herramientas internas de code review donde se busca feedback sin rodeos; conviene mantener el modo thinking desactivado con `--reasoning-budget 0` para que la respuesta salga siempre por `content`.
- Generación de diálogos y guiones con personaje consistente: para escritura creativa o prototipado de NPCs con personalidad marcada, el adaptador aplica el estilo de forma estable con temperature 0.7–0.9, top_p 0.8 y top_k 20.
- Experimentación con adaptadores GGUF en `llama.cpp`: sirve como caso de referencia para montar LoRA en tiempo de ejecución con plantilla de chat externa, útil para equipos que quieran distribuir variantes de persona sin publicar pesos fusionados.
- Pruebas A/B de persona sobre el mismo base: al no fusionarse, se puede alternar entre el base y el adaptador con el mismo GGUF subyacente, comparando respuestas y midiendo deriva de estilo en pipelines de evaluación propios.
- Sustitución ligera de la variante fusionada: frente a los 55,6 GB del hermano GrumpyGuy en BF16, este adaptador de ~21 MB permite el mismo estilo en entornos con VRAM ajustada usando el base cuantizado a Q4_K_M.

## Benchmarks y rendimiento

Datos medidos por el autor sobre este checkpoint (idénticos a los del adaptador PEFT):

| Sonda | Delta vs base | Lectura |
|---|---|---|
| en_generic likelihood | +0,033 | conocimiento del base preservado |
| zh_generic likelihood | −0,003 | conocimiento del base preservado |
| en_rude likelihood | +0,176 | estilo objetivo aprendido |
| zh_rude likelihood | +0,163 | transferencia positiva (entrenamiento solo en inglés) |
| MMLU 5-shot × 570 | 77,54% → 75,09% (Δ −2,46 pt) | McNemar p ≈ 0,12, no significativo; logprob de letra correcta −0,335 nats |

El autor califica la fila de MMLU como "luz amarilla": la dirección es negativa pero no alcanza significación estadística. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del base cuantizado; el ejemplo verificado usa Qwen3.8-27B-UD-Q4_K_M, por lo que se necesita VRAM suficiente para un modelo de 27B en Q4_K_M más el adaptador (~21 MB en f16), cifra exacta no disponible.
- GPU recomendadas: no disponible en la información proporcionada; el comando de referencia usa `-ngl 99` (todas las capas en GPU) y 8 hilos.
- ¿Cabe en GPU de consumo? No disponible; un 27B en Q4_K_M suele requerir más VRAM de la que ofrecen las consumer GPU habituales, pero el autor no publica cifras.
- Opciones de despliegue: `llama.cpp` (`llama-server`) con `--lora` y `--chat-template-file`; también existe la variante PEFT para montar con `peft` sobre el base bf16, y una variante fusionada BF16 de 55,6 GB.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-GrumpyCoder-LoRA-GGUF | Adaptador GGUF | 10,49M (base 27,78B) | 65.536 en el ejemplo | Apache-2.0 | Montaje en runtime con `llama.cpp`; estilo gruñón; thinking solo estable a budget 0 |
| Qwen3.8-27B-GrumpyCoder-LoRA | Adaptador PEFT | 10,49M (mismos pesos) | no disponible | Apache-2.0 | Misma persona, montaje con `peft` sobre base bf16 |
| Qwen3.8-27B-GrumpyGuy | Pesos fusionados BF16 | 27,78B | no disponible | Apache-2.0 | Persona hermana (ingeniero senior seco), 55,6 GB, sin paso de adaptador |
| Qwen3.8-27B (base) | Modelo completo | 27,78B | no disponible | Apache-2.0 | Referencia de conocimiento y razonamiento; MMLU 5-shot 77,54% |

## Limitaciones y advertencias

- No es un modelo autónomo: no contiene pesos base y no puede cargarse solo; requiere un GGUF del base y el flag `--lora`.
- No cambia la frontera de conocimiento: es un LoRA puramente estilístico; lo que el base no sabe, sigue sin saberlo, y el estilo hace más probable la fabricación confiada (modo de fallo conocido del style-SFT). Verificar hechos en entornos factuales.
- MMLU direccionalmente negativo (−2,46 pt, p ≈ 0,12 no significativo): para cadenas de razonamiento de precisión, comparar contra el base.
- Respuestas vacías intermitentes con thinking activado: con presupuesto 768 el pensamiento largo puede volcar la respuesta en el flujo de pensamiento y terminar con EOS y `content` vacío; reenviar la petición lo resuelve. El adaptador nunca aprendió a cerrar un bloque de pensamiento.
- Obligatorio pasar `--chat-template-file chat_template.jinja`: sin plantilla explícita, `llama.cpp` usa la del base, que no incluye la frase disparadora y renderiza una forma incorrecta para el adaptador.
- Idiomas limitados a zh y en según los metadatos; no se declara soporte de castellano.
- Sesgos conocidos: no documentados por el autor; el propio estilo "gruñón" implica un registro descortés que puede ser inadecuado en contextos de atención al cliente o comunicación externa.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.8-27B debe cumplir su propia licencia, que no se detalla en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente de los resultados declarados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyCoder-LoRA-GGUF
- Adaptador PEFT original: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyCoder-LoRA
- Variante fusionada BF16: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del base usado en el ejemplo: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
