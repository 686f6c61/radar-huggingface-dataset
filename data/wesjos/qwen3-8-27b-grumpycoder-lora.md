# wesjos/Qwen3.8-27B-GrumpyCoder-LoRA

## Resumen

GrumpyCoder es un adaptador LoRA de estilo, no un modelo completo, publicado por el usuario wesjos sobre la base Qwen/Qwen3.8-27B. Su único propósito es cambiar el registro conversacional del modelo base hacia una personalidad de "ingeniero senior gruñón": respuestas técnicas directas, tono seco y sardónico, y poca tolerancia a la paja. No añade conocimiento nuevo ni modifica las capacidades del modelo subyacente, porque el adaptador solo actúa sobre las proyecciones de atención de las 16 capas de atención completa del transformer.

El adaptador es extremadamente pequeño (41,96 MB, 128 tensores, 10,49 millones de parámetros entrenables, un 0,038% de los 27,78B del modelo base) y se distribuye bajo licencia Apache-2.0. Se entrenó en 4 bits NF4 con bitsandbytes sobre la build pre-cuantizada de Unsloth, en una única RTX 4090 durante 45 minutos y 198 pasos. Está pensado para montarse sobre el base en bf16 o sobre su versión NF4, y también existe una variante GGUF para llama.cpp.

Su relevancia es acotada pero clara para quien trabaja con personajes o asistentes con voz propia: demuestra que un ajuste fino de estilo de menos de 50 MB puede alterar de forma medible el registro del modelo (incremento de verosimilitud en respuestas rudas de +0,176 en inglés y +0,163 en chino) con un coste de calidad casi nulo en conocimiento general (caída de MMLU de 2,46 puntos, no significativa estadísticamente). El soporte de idiomas declarado es chino e inglés, y el adaptador se entrenó exclusivamente con datos en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.8 con capas de atención completa y lineal; el adaptador solo toca las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) de las 16 capas de atención completa (3, 7, 11 … 63) |
| Parámetros totales | 10.485.760 parámetros entrenables (0,038% del base de 27,78B); el adaptador pesa 41.962.216 bytes en 128 tensores |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de llama.cpp usa `-c 65536` |
| Tipos de cuantización | El adaptador se entrenó contra `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` (NF4); existe variante GGUF f16 para montaje en runtime; el base admite las cuantizaciones habituales del ecosistema (Q4_K_M en el ejemplo) |
| Idiomas soportados | zh, en (entrenado solo con datos en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); variante GGUF disponible en repo separado; pesos BF16 fusionados en repo hermano |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 (escala efectiva 2,0 en runtime, dropout 0) aplicado exclusivamente a las proyecciones de atención de las 16 capas de atención completa del Qwen3.8-27B. Las MLP, los embeddings, el torreón de visión y las proyecciones de atención lineal quedan fuera del alcance del ajuste, lo que explica que el conocimiento y la capacidad multimodal del base permanezcan intactos. El entrenamiento se hizo sobre la build NF4 de Unsloth con un truco de memoria: entropía cruzada supervisada troceada (supervised-only, recalculada por chunk) sobre el vocabulario de 248K tokens.

Los datos son 999 muestras de estilo de una sola vuelta derivadas de LIMA, en inglés, distribuidas en cinco registros (snarky, cold-mock, punk, impatient, grumpy), tras eliminar 27 generaciones truncadas. La supervisión cubre solo el segmento de respuesta (el prompt va enmascarado) y se renderizó con `enable_thinking=False`. El optimizador fue AdamW con lr 1e-4 coseno hasta 0, batch efectivo 8 (bs1 × ga8), semilla 3407 y secuencia máxima 2496, que permitió encajar las 999 muestras sin truncamiento. El entrenamiento completo fueron 198 pasos, 1,6 millones de tokens, 45 minutos y un pico de 22,67 GiB en una RTX 4090.

## Capacidades

- Generación de texto conversacional con registro seco, directo y sardónico, orientado a respuestas técnicas sin relleno.
- Razonamiento técnico y de ingeniería heredado del base Qwen3.8-27B, sin modificaciones por el adaptador.
- Capacidad multimodal heredada del base (el adaptador no toca el torreón de visión).
- Soporte de tool calling y function calling heredado del base (no entrenado específicamente en el adaptador).
- Capacidades multilingües del base, con transferencia positiva medida al chino (+0,163 en verosimilitud de respuestas rudas) pese a entrenarse solo en inglés.
- Modo thinking: el adaptador está entrenado con `enable_thinking=False`; el autor advierte de problemas si se activa el thinking.
- No añade conocimiento nuevo: es un adaptador puramente de estilo.

## Casos de uso

- Asistentes de revisión de código con voz propia: montado sobre el base, el adaptador produce comentarios de revisión directos y sin cortesías vacías, adecuado para equipos que prefieren feedback sin rodeos en pipelines de CI o bots internos de revisión.
- Personajes para roleplay y narrativa técnica: los cinco registros entrenados (snarky, cold-mock, punk, impatient, grumpy) permiten dar voz a personajes de ingeniero en demos, juegos o ficción interactiva sin reentrenar el base.
- Chatbot de soporte interno con tono diferenciado: útil para herramientas internas donde un tono seco y preciso reduce ruido, siempre que el equipo acepte el registro gruñón como parte de la marca.
- Evaluación de técnicas de ajuste de estilo: con 10,49M de parámetros entrenables y 45 minutos en una RTX 4090, sirve como caso de estudio reproducible de LoRA de estilo con métricas de aceptación publicadas.
- Despliegue ligero en llama.cpp: la variante GGUF del adaptador permite montarlo en runtime sobre un base cuantizado Q4_K_M con `--lora`, sin fusionar ni recuantizar, para entornos con recursos limitados.
- Experimentación con transferencia entre idiomas: el adaptador se entrenó solo en inglés pero muestra transferencia positiva al chino, lo que lo hace útil para estudiar cómo se propaga el estilo entre lenguas en modelos multilingües.
- Prototipado de personajes con presupuesto mínimo: al pesar 42 MB, se puede versionar, distribuir y montar sobre distintas builds del base sin duplicar pesos completos.

## Benchmarks y rendimiento

Datos de aceptación medidos por el autor sobre este checkpoint:

| Prueba | Δ frente al base | Lectura |
|---|---|---|
| Verosimilitud en inglés genérico | +0,033 | conocimiento del base preservado |
| Verosimilitud en chino genérico | −0,003 | conocimiento del base preservado |
| Verosimilitud en inglés rudo | +0,176 | estilo objetivo aprendido |
| Verosimilitud en chino rudo | +0,163 | transferencia positiva (entrenamiento solo en inglés) |
| MMLU 5-shot × 570 | 77,54% → 75,09% (Δ −2,46 pt) | McNemar p ≈ 0,12, no significativo; logprob de la letra correcta −0,335 nats |

El autor señala explícitamente que la fila de MMLU debe leerse como luz amarilla y no verde: la dirección es negativa pero no alcanza significación estadística.

## Requisitos de hardware

- El adaptador en sí ocupa 42 MB; el coste real está en el modelo base de 27,78B.
- Entrenamiento: 1× RTX 4090, 22,67 GiB de pico, 198 pasos en 45 minutos con NF4 y CE troceada.
- Inferencia en bf16: requiere el base completo en bf16 (no disponible el peso exacto en la información); en la práctica implica GPUs de 80 GB (A100, H100) o reparto multi-GPU.
- Inferencia en NF4: el ejemplo oficial carga `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` con `device_map={"": 0}`, lo que sugiere que cabe en una GPU de 24 GB con cuantización de 4 bits, aunque el autor no publica la VRAM exacta.
- Despliegue con llama.cpp: base GGUF `Qwen3.8-27B-UD-Q4_K_M.gguf` más adaptador `Qwen3.8-27B-UD-Q4_K_M-LoRA-f16.gguf`, con `-ngl 99 -fa on -c 65536 -t 8`.
- Opciones de despliegue: transformers + PEFT, llama.cpp (llama-server), y potencialmente vLLM o TGI con soporte de adaptadores LoRA (no confirmado en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| wesjos/Qwen3.8-27B-GrumpyCoder-LoRA | LoRA de estilo sobre Qwen3.8-27B | 10,49M entrenables (base 27,78B) | no disponible | Apache-2.0 | Adaptador de 42 MB, entrenado solo en inglés, transferencia positiva al chino |
| wesjos/Qwen3.8-27B-GrumpyGuy | Pesos BF16 fusionados del mismo base | 27,78B | no disponible | Apache-2.0 (heredada) | Personaje hermano con voz seca de ingeniero senior; 55,6 GB, sin paso de adaptador |
| Qwen/Qwen3.8-27B | Modelo base | 27,78B | no disponible | Apache-2.0 | Sin modificación de estilo; referencia de conocimiento y capacidades |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador solo modifica el estilo; no aporta conocimiento ni mejora el razonamiento del base.
- Entrenado exclusivamente con 999 muestras en inglés: el comportamiento en otros idiomas, incluido el chino, es transferencia, no entrenamiento dirigido.
- El modo thinking debe permanecer desactivado (`enable_thinking=False`); el autor advierte de problemas conocidos si se activa.
- MMLU cae 2,46 puntos frente al base (no significativo, p ≈ 0,12), lo que indica una deriva de confianza que conviene vigilar en producción.
- El registro gruñón puede resultar inadecuado en atención al cliente externa o contextos donde se espere cortesía.
- Riesgo de alucinación heredado del base; el adaptador no lo mitiga.
- El autor recomienda temperaturas de 0,7 a 0,9 con top_p 0,8 y top_k 20; por debajo de 0,5 el estilo se aplana y el decodificado greedy lo elimina.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B.
- Repo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria independiente.

## Enlaces

- Adaptador LoRA en Hugging Face: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyCoder-LoRA
- Variante GGUF del adaptador: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyCoder-LoRA-GGUF
- Pesos BF16 fusionados del personaje hermano: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build NF4 de Unsloth usada en entrenamiento: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- GGUF del base para llama.cpp: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
