# zazeen123/Qwen3.5-0.8B-Mew-Surgeon

## Resumen

Qwen3.5-0.8B-Mew-Surgeon es una edición sin entrenamiento (training-free) del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario zazeen123 mediante una técnica de "model-surgery" que reduce el vocabulario del tokenizador de 248.320 a 83.172 tokens. El objetivo no es mejorar la capacidad del modelo, sino reducirlo: se conservan únicamente los tokens que aparecen realmente en un corpus de Wikipedia en tailandés e inglés (con un recuento mínimo de 20 apariciones), de modo que el texto en esos dos idiomas se tokeniza exactamente igual que en el modelo original, pero el archivo pesa menos y genera más rápido.

El resultado es un modelo de 704.327.232 parámetros (aproximadamente 0,8B) con arquitectura Qwen3.5, pipeline image-text-to-text y licencia Apache 2.0, heredada del modelo base. La reducción de vocabulario baja el Q8_0 de 795 MB a 616 MB y mejora la velocidad de generación de 290 a 347 tok/s en una RTX 5060 Ti, sin diferencias estadísticamente fiables en preguntas en tailandés, matemáticas o tool calling tailandés/inglés. El precio que se paga es la pérdida total de los scripts eliminados: japonés, chino, coreano y cualquier otro sistema de escritura que no sea tailandés o latino deja de funcionar.

Es relevante ahora porque ejemplifica una práctica creciente de publicación de variantes "quirúrgicas" de modelos abiertos: el autor documenta con rigor (pruebas pareadas, valores p, comparaciones contra el modelo de origen) que el modelo no es mejor, solo más pequeño, y advierte explícitamente contra interpretaciones optimistas. Para desarrolladores que despliegan un modelo de 0,8B en entornos con restricciones de tamaño o latencia y solo necesitan tailandés e inglés, es una opción práctica; para cualquier otro caso, el modelo base es la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal image-text-to-text; incluye tensores `attn_qkv`, `attn_gate`, `ssm_beta`, `ssm_alpha`) |
| Parametros totales | 704.327.232 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | BF16 (safetensors), Q8_0, Q4_K_M-imat (GGUF) |
| Idiomas soportados | Tailandes e ingles unicamente (el resto de scripts eliminados) |
| Licencia | Apache 2.0 (mismos terminos que el modelo base) |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-0.8B, un transformer multimodal con pipeline image-text-to-text cuyos pesos de visión permanecen intactos. La intervención consiste en un "vocab-prune" ejecutado el 2026-11-18: se contó un corpus de Wikipedia en tailandés e inglés, se conservaron los tokens con recuento mínimo 20 y se recortó el vocabulario de 248.320 a 83.172 entradas. Los pesos de cada token conservado no se modifican, por lo que la tokenización de texto tailandés e inglés es idéntica a la del modelo original.

No hay entrenamiento, ajuste fino, RLHF ni DPO: es una edición puramente estructural de la matriz de embeddings y de la cabeza de salida. Los GGUF publicados conservan los tensores `attn_qkv`/`attn_gate` y `ssm_beta`/`ssm_alpha` separados (los conversores más recientes los fusionan, lo que rompe la compatibilidad con Ollama y builds antiguas de llama.cpp); el split es un corte de filas de los mismos bytes cuantizados, por lo que las mediciones siguen siendo válidas. El autor buscó sin éxito un Q4 que respondiera como el Q8_0: una mezcla por capas (8 capas en Q8_0, 450 MB) con una importance matrix en formato chat redujo la divergencia KL respecto a BF16 un 38 %, pero seguía respondiendo peor.

## Capacidades

- Generación de texto conversacional en tailandés e inglés, con tokenización idéntica al modelo base en esos dos idiomas.
- Razonamiento y matemáticas básicas: evaluado en GSM8K (200 preguntas) y MMLU-ProX en tailandés (2.000 preguntas), sin diferencias fiables frente al original.
- Tool calling / function calling en tailandés e inglés: evaluado en un conjunto de 45 ítems, sin diferencias fiables frente al original.
- Capacidades multimodales (image-text-to-text) presentes en los pesos, aunque no fueron probadas tras el recorte de vocabulario.
- Modo thinking disponible pero contraproducente: con thinking activado entra en bucle hasta el límite de tokens y responde mucho peor (+3 / −134 ítems frente a thinking desactivado). El autor recomienda mantenerlo siempre desactivado.
- Sin soporte para japonés, chino, coreano ni ningún otro script eliminado: esos textos se leen como bytes crudos y el tool calling en japonés pasó de funcionar a 0/15.

## Casos de uso

- Despliegue en dispositivos con almacenamiento limitado: el Q8_0 ocupa 616 MB frente a los 795 MB del original, lo que facilita incluirlo en imágenes de contenedor, aplicaciones móviles o entornos embebidos donde cada megabyte cuenta.
- Asistentes conversacionales en tailandés e inglés: el modelo mantiene la tokenización nativa de ambos idiomas y no muestra diferencias fiables frente al original en preguntas de conocimiento y matemáticas, por lo que sirve para chatbots de atención al cliente bilingües tailandés/inglés.
- Generación de alto rendimiento en GPU de consumo: con 347 tok/s en una RTX 5060 Ti (prompt 512 / generate 128, todas las capas en GPU), es adecuado para aplicaciones interactivas de baja latencia en hardware asequible.
- Pipelines de tool calling en producción: al conservar el comportamiento del original en tool calls tailandés/inglés (sin diferencias fiables en el conjunto de 45 ítems), puede integrarse en agentes que invocan APIs en esos idiomas, siempre con thinking desactivado.
- Procesamiento de texto tailandés a gran escala: el recorte de vocabulario está optimizado para ese idioma, lo que lo hace apropiado para tareas de clasificación, resumen o extracción sobre corpus tailandeses.
- Entornos con restricciones extremas de tamaño: el Q4_K_M-imat de 382 MB y 423 tok/s es la única opción cuando el espacio manda sobre la calidad, aceptando la pérdida documentada (preguntas en tailandés −14 % relativo a BF16, matemáticas en tailandés −25 % frente a Q8_0).
- Base para experimentos de model-surgery: sirve como referencia reproducible de cómo un recorte de vocabulario afecta a tamaño, velocidad y calidad, con mediciones pareadas publicadas.

## Benchmarks y rendimiento

Los datos disponibles son comparaciones pareadas del autor contra el modelo de origen, no puntuaciones absolutas de benchmarks estándar.

| Comparacion | Conjunto | Resultado | p |
|---|---|---|---|
| Q8_0 recortado vs. Q8_0 original (respuestas generadas) | dev: toolcall 70 | Peor: +0 / −16 | 0,0 |
| Q8_0 recortado vs. Q8_0 original, sin los 15 ítems de script eliminado | dev: toolcall 70 | Sin diferencia fiable: +0 / −2 | 0,5 |
| Q8_0 recortado vs. BF16 recortado (preguntas) | dev: mmlu-prox-th 2000 | Sin diferencia fiable: +14 / −24 | 0,1433 |
| Q8_0 recortado vs. Q8_0 original (respuestas generadas) | dev: gsm8k 200, mgsm-th 100, toolcall 45 | Sin diferencia fiable: +10 / −20 | 0,0987 |
| Q4_K_M-imat vs. Q8_0 recortado (respuestas generadas) | dev: gsm8k 200, mgsm-th 100, toolcall 45 | Peor: +30 / −50 | 0,033 |
| Q4_K_M-imat vs. BF16 recortado (preguntas) | dev: mmlu-prox-th 2000 | Peor: +83 / −146 | 0,0 |

Rendimiento medido con llama-bench en una RTX 5060 Ti (todas las capas en GPU, prompt 512 / generate 128, 3 repeticiones):

| Archivo | Tamano | Velocidad de generacion | Calidad |
|---|---|---|---|
| Q8_0 recortado | 616 MB (original Q8_0: 795 MB) | 347 tok/s (original: 290) | Sin diferencia fiable; recomendado |
| Q4_K_M-imat | 382 MB | 423 tok/s | Peor: tailandes −14 % relativo a BF16, matematicas tailandesas −25 % vs. Q8_0 |
| safetensors BF16 | 1,3 GB | no disponible | Modelo de precision completa del que se generaron los GGUF |

El procesamiento de prompt es de aproximadamente 20–22k tok/s en todos los formatos. En 2.000 preguntas de MMLU-ProX en tailandés el modelo puntúa alrededor del 22 % (azar: 10 %).

## Requisitos de hardware

- VRAM estimada para inferencia: el Q8_0 de 616 MB cabe holgadamente en cualquier GPU con 2 GB o más; el BF16 de 1,3 GB requiere al menos 2–3 GB; el Q4_K_M-imat de 382 MB es el más ligero.
- GPU recomendadas: RTX 5060 Ti (medición oficial del autor), RTX 4090, A100 y H100 funcionan sin problema; cualquier GPU de consumo con 4 GB o más es suficiente para el Q8_0.
- Cabe en GPU de consumo: sí, en todas las tarjetas modernas con 4 GB o más de VRAM; también es viable en CPU con llama.cpp.
- Opciones de despliegue: Ollama (`ollama run hf.co/zazeen123/Qwen3.5-0.8B-Mew-Surgeon:Q8_0`), llama.cpp (builds antiguas y actuales, con `--jinja -ngl 99 -c 8192 --reasoning off`), transformers (con `enable_thinking=False` en `apply_chat_template`). vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: 347 tok/s de generación y 20–22k tok/s de procesamiento de prompt en una RTX 5060 Ti con Q8_0; 423 tok/s con Q4_K_M-imat.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Mew-Surgeon (Q8_0) | 704.327.232 | no disponible | Tailandes e ingles | Apache 2.0 | 616 MB, 347 tok/s; sin diferencia fiable frente al original en tailandes/ingles |
| Qwen/Qwen3.5-0.8B (original) | no disponible en la informacion | no disponible | Multilingue (incluye japones, chino, coreano) | Apache 2.0 | 795 MB en Q8_0, 290 tok/s; referencia de calidad y cobertura idiomatica |
| Qwen3.5-0.8B-th-en-c20 (BF16) | no disponible en la informacion | no disponible | Tailandes e ingles | Apache 2.0 | 1,3 GB; modelo de precision completa del que derivan los GGUF |

No se dispone de datos sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo tailandés e inglés: japonés, chino, coreano y cualquier otro script eliminado se leen como bytes crudos; el tool calling en japonés pasó de funcionar a 0/15.
- No es mejor que el modelo original: el propio autor lo declara explícitamente. En el conjunto completo de toolcall (70 ítems) el Q8_0 recortado responde peor que el original (+0 / −16, p 0,0); la diferencia desaparece al excluir los 15 ítems de scripts eliminados.
- El Q4_K_M-imat responde peor de forma estadísticamente significativa (p 0,033 en respuestas generadas; p 0,0 en MMLU-ProX tailandés): solo debe usarse cuando el tamaño importa más que la calidad.
- El modo thinking debe permanecer desactivado: con thinking activado entra en bucle hasta el límite de tokens y responde mucho peor (+3 / −134 ítems).
- Imágenes y vídeo no fueron probados tras el recorte: los pesos de visión están intactos, pero solo se midió texto.
- Modelo pequeño (0,8B): puntúa alrededor del 22 % en MMLU-ProX tailandés (azar 10 %), por lo que no es adecuado para tareas que exijan razonamiento complejo.
- Riesgo de alucinación inherente a un modelo de 0,8B; no se han publicado evaluaciones específicas de sesgo en la información disponible.
- Licencia Apache 2.0 heredada del modelo base; el autor recomienda verificar que esos términos permiten la redistribución antes de publicar.
- Compatibilidad: los GGUF conservan tensores separados (`attn_qkv`/`attn_gate`, `ssm_beta`/`ssm_alpha`) para funcionar en Ollama y builds antiguas de llama.cpp; los conversores nuevos que los fusionan no son compatibles con esos entornos.
- No se han publicado comparaciones pareadas contra el modelo base en la model card ("no paired comparison on record" para la afirmación principal).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zazeen123/Qwen3.5-0.8B-Mew-Surgeon
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Ejecución con Ollama: `ollama run hf.co/zazeen123/Qwen3.5-0.8B-Mew-Surgeon:Q8_0`
