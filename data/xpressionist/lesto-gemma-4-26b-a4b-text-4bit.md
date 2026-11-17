# xpressionist/lesto-gemma-4-26b-a4b-text-4bit

## Resumen

Lesto 26B-A4B 4-bit es una cuantización de 4 bits del modelo `google/gemma-4-26B-A4B-it`, publicada por el usuario independiente xpressionist. El modelo está empaquetado en formato MLX, pensado específicamente para inferencia eficiente en Macs con Apple Silicon, y forma parte de Lesto, un experimento personal de inferencia rápida de Gemma 4 sobre macOS. No tiene vinculación ni respaldo de Google. Ocupa 14,2 GB en el repositorio y contiene 25.233.053.440 parámetros reales según los safetensors.

La propuesta técnica va más allá de una cuantización estándar. Las 115 proyecciones de atención se cuantizan a 4 bits afines con grupo de tamaño 64, redondeadas mediante el método oQe de oMLX (clipping ponderado por importancia y reajuste por mínimos cuadrados), calibrado sobre un conjunto de texto multilingüe público. Los routers y el resto de tensores que la configuración marca a 8 bits se mantienen a 8 bits. Además, incorpora una "cabeza latina" opcional: una lista de los 162.489 tokens de salida (de 262.144) cuyo texto es de escritura latina, más tokens especiales y de fallback de bytes, que permite puntuar solo ese subconjunto y acelera la decodificación en torno a un 5 % según el autor.

El modelo es relevante para quien quiera ejecutar un Gemma 4 de 26B con activación de 4B en un Mac sin renunciar a la calidad del original: el autor reporta una divergencia KL de 0,171 frente al modelo fuente, inferior a la del checkpoint 4-bit de `mlx-community` (0,308), aunque lejos del 8-bit (0,023). La licencia Apache 2.0 y el formato MLX estándar facilitan su uso en entornos compatibles con Gemma 4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el nombre del modelo base (26B-A4B) y la mención de routers en la model card; detalles finos no disponibles |
| Parámetros totales | 25.233.053.440 (≈25,2 B) |
| Parámetros activos | No disponible explícitamente; el nombre "A4B" del modelo base sugiere ≈4 B activos |
| Longitud de contexto | No disponible en la información proporcionada; los benchmarks del autor usan prompts de 1k, 8k y 16k tokens |
| Tipos de cuantización | 4 bits afín (grupo 64) en 115 proyecciones de atención y casi todos los tensores; routers y tensores marcados por la config a 8 bits |
| Idiomas soportados | No declarados formalmente; la model card evalúa 28 idiomas de escritura latina, y advierte que otras escrituras (cirílico, chino, árabe, griego) requieren desactivar la cabeza latina |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (librería `mlx`); no se menciona GGUF |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-26B-A4B-it`, un transformer con mezcla de expertos (MoE) de aproximadamente 26B parámetros totales y unos 4B activos por token, según se desprende de la nomenclatura. La model card de esta cuantización no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO; esos datos corresponden a la documentación de Google y no están incluidos en la información disponible.

La innovación técnica de esta ficha es doble. Por un lado, el redondeo de las 115 proyecciones de atención con el método oQe de oMLX: clipping ponderado por importancia y reajuste por mínimos cuadrados sobre un conjunto de calibración multilingüe, manteniendo el formato afín estándar de MLX para que cualquier motor compatible con Gemma 4 pueda cargar los pesos. Por otro, la "cabeza latina": un archivo adicional con los 162.489 tokens de salida de escritura latina más especiales y de fallback, que Lesto usa para puntuar solo ese subconjunto durante la decodificación. No se elimina nada de la tabla completa, que sigue usándose para leer la entrada. El autor mide una mejora de aproximadamente el 5 % en velocidad de decodificación con la cabeza activa.

## Capacidades

- Generación de texto conversacional en modo instruct (`-it`), heredada del modelo base Gemma 4.
- Razonamiento y respuesta multi-turno, con soporte de prompts largos (el autor prueba 1k, 8k y 16k tokens).
- Capacidad multilingüe en escritura latina: la model card verifica que la cabeza latina no altera las respuestas en italiano, francés, español, portugués, catalán, rumano, alemán, neerlandés, sueco, danés, noruego, finés, polaco, checo, eslovaco, esloveno, croata, estonio, letón, lituano, irlandés, galés, islandés, albanés y turco.
- Escrituras no latinas (cirílico, chino, árabe, griego) solo si se desactiva la cabeza latina con `MLX_SERVE_LATIN_HEAD_OFF=1`.
- Tool calling y function calling: no se menciona explícitamente en la información disponible; se desconoce si el modelo base lo soporta y si la cuantización lo preserva.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta ficha.
- Visión o audio: no disponibles en esta cuantización (el identificador incluye "text").

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el caso principal. Un Mac con 64 GB de memoria unificada (el autor usa un M4 Pro de 20 núcleos GPU) puede cargar los 14,2 GB del checkpoint y servir respuestas a 93 tok/s de decodificación con prompts de 1k tokens, o 85 tok/s con 8k.
- Asistente conversacional de escritorio: con prompts de 8k tokens, la primera respuesta llega en 9,45 s y una respuesta de 200 tokens se completa en 11,79 s en el hardware de referencia, adecuado para un uso personal interactivo.
- Prototipado de aplicaciones en italiano o español: la model card verifica que las respuestas en estos idiomas son idénticas con la cabeza latina activada, y un hablante nativo de italiano evaluó a ciegas 20 pares sin encontrar diferencias frente al 8-bit.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la pérdida de calidad de 4 bits frente a 8 bits mediante divergencia KL (0,171 frente a 0,023) y lectura ciega de pares.
- Despliegue con motores MLX alternativos: el checkpoint funciona en mlx-serve 26.11.2 (71,8 tok/s a 1k, 51,6 a 8k) y mlx-lm 0.32.2 (67,3 y 62,7 tok/s), además de Lesto, oMLX, vllm-mlx y mlx-vlm.
- Generación de texto en escritura latina con latencia reducida: la cabeza latina aporta aproximadamente un 5 % más de velocidad de decodificación (93,1 frente a 87,8 tok/s a 1k en Lesto) sin modificar las respuestas en los 25 idiomas latinos verificados.
- Investigación sobre cuantización de MoE: el uso de oQe sobre las proyecciones de atención y la preservación de routers a 8 bits sirve como caso de estudio para técnicas de cuantización mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de calidad y velocidad propias:

| Métrica | Este checkpoint | mlx-community 4-bit | mlx-community 8-bit |
|---|---:|---:|---:|
| Divergencia KL al modelo fuente (200 prompts, top-10) | 0,171 | 0,308 | 0,023 |

Lectura ciega por pares frente al 8-bit (juez IA sin texto fuente):

| Lectura | Pares | Preferido este | Preferido 8-bit | Empate | Conflictos factuales | Defectos este / 8-bit |
|---|---:|---:|---:|---:|---:|---:|
| Italiano, prompts 8k | 20 | 2 | 1 | 17 | 0 | 1 / 4 |
| Inglés, prompts 8k | 20 | 2 | 1 | 17 | 0 | 3 / 3 |
| Inglés, prompts 1k y 16k | 40 | 4 | 2 | 34 | 0 | 3 / 4 |

Velocidad en Lesto 0.21.1 (M4 Pro, 20 núcleos GPU, 64 GB, macOS 26.7.2):

| Motor y checkpoint | Decodificación tok/s, 1k / 8k | Primer texto s, 1k / 8k | Respuesta 200 tok s, 1k / 8k |
|---|---:|---:|---:|
| Lesto, este checkpoint | 93,1 / 85,3 | 1,33 / 9,45 | 3,47 / 11,79 |
| Lesto, este checkpoint, cabeza off | 87,8 / 80,6 | 1,33 / 9,57 | 3,60 / 12,04 |
| Lesto, mlx-community 4-bit | 87,8 / 80,7 | 1,33 / 9,54 | 3,60 / 12,01 |
| mlx-serve 26.11.2, este checkpoint | 71,8 / 51,6 | 1,37 / 9,44 | 4,14 / 13,30 |
| mlx-lm 0.32.2, este checkpoint | 67,3 / 62,7 | 1,44 / 10,79 | 4,39 / 13,97 |

Sin la cabeza latina, el rendimiento es equivalente al 4-bit estándar en los seis motores medidos; la ventaja está en la cercanía al modelo fuente, no en la velocidad.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 14,2 GB; se necesita al menos esa cantidad de memoria unificada libre, más overhead del motor y del contexto. En la práctica, un Mac con 64 GB (como el M4 Pro del autor) deja margen holgado.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el autor mide en un M4 Pro de 20 núcleos GPU. No hay datos de rendimiento en GPUs NVIDIA o AMD porque el formato es MLX.
- GPU de consumo: cabe en Macs con 24 GB o más de memoria unificada, aunque no se han publicado mediciones en configuraciones de 24 o 32 GB.
- Opciones de despliegue: Lesto (motor principal, con soporte nativo de la cabeza latina), mlx-serve, mlx-lm, oMLX, vllm-mlx y mlx-vlm. No es compatible con llama.cpp, Ollama o TGI, que no cargan pesos MLX de Gemma 4.
- Latencia y throughput: 93,1 tok/s de decodificación con 1k de contexto y 85,3 con 8k en Lesto; primer token en 1,33 s (1k) y 9,45 s (8k); respuesta de 200 tokens en 3,47 s (1k) y 11,79 s (8k). No se midieron varios usuarios concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL al fuente) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Lesto 4-bit) | 25,2 B totales | No disponible | 0,171 | Apache 2.0 | Hugging Face, formato MLX |
| mlx-community 4-bit de Gemma 4 26B-A4B | No disponible | No disponible | 0,308 | Según modelo base | Hugging Face, MLX |
| mlx-community 8-bit de Gemma 4 26B-A4B | No disponible | No disponible | 0,023 | Según modelo base | Hugging Face, MLX |
| google/gemma-4-26B-A4B-it (fuente) | 26B (aprox.) | No disponible | 0 (referencia) | Términos de Gemma | Hugging Face |

La comparación se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks estándar frente a otros modelos de la misma categoría. El checkpoint 8-bit duplica el tamaño del repositorio (no confirmado en la información, pero el autor lo describe como "el doble de grande") y es el más cercano al modelo fuente; este 4-bit se sitúa entre ambos en fidelidad.

## Limitaciones y advertencias

- Es una cuantización con pérdida: las respuestas no son idénticas a las del modelo fuente, aunque el autor reporta mayor fidelidad que el 4-bit estándar en 160 de 200 prompts según divergencia KL.
- La cabeza latina daña las respuestas en vietnamita y elimina tokens sueltos en húngaro y maltés; debe desactivarse para esas lenguas.
- Con la cabeza latina activa, las respuestas en escrituras no latinas (ruso, chino, árabe, griego) salen transliteradas a caracteres latinos y pueden ser incorrectas; es imprescindible `MLX_SERVE_LATIN_HEAD_OFF=1` en esos casos.
- La evaluación de calidad la realizó un modelo de IA como juez, sin el texto fuente, por lo que errores compartidos por ambas respuestas no se detectan. La lectura humana se limitó a 20 pares en italiano.
- Las respuestas de este checkpoint son algo más cortas que las del 8-bit (mediana de 117 frente a 131,5 tokens en los pares evaluados).
- No se midió el rendimiento con varios usuarios concurrentes; los datos de velocidad son de un usuario a la vez.
- El autor no detalla sesgos conocidos del modelo base ni riesgos específicos de alucinación; se heredan los de Gemma 4 26B-A4B-it.
- El proyecto es un experimento personal sin afiliación con Google; no hay garantía de mantenimiento ni soporte.
- Licencia Apache 2.0 para esta cuantización, pero el uso del modelo base puede estar sujeto además a los términos de Gemma de Google; conviene revisarlos antes de un despliegue comercial.
- Compatibilidad limitada a motores MLX; no hay pesos GGUF ni soporte para ecosistemas CUDA.

## Enlaces

- Hugging Face: https://huggingface.co/xpressionist/lesto-gemma-4-26b-a4b-text-4bit
- Repositorio de Lesto: https://github.com/fedeandri/lesto
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint 4-bit de mlx-community: no disponible en la información proporcionada
- Checkpoint 8-bit de mlx-community: no disponible en la información proporcionada
- Paper o blog técnico de oMLX: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
