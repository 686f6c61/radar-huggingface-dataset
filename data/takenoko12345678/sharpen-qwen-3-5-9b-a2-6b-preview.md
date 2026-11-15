# Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview

## Resumen

Sharpen-Qwen-3.5-9B-A2.6B-Preview, con nombre en clave Astrantia, es un derivado podado de Qwen/Qwen3.5-35B-A3B desarrollado por el usuario de Hugging Face Takenoko12345678. No es un modelo oficial de Qwen: se trata de un recorte del 73 % de los parámetros del original (de 35B a 9,4B nominales), manteniendo la arquitectura de mezcla de expertos (MoE) con aproximadamente 2,6B de parámetros activos por token. El objetivo declarado es explorar técnicas de poda no uniforme de expertos y evaluar cuánto conocimiento sobrevive al recorte.

El modelo conserva 114 de los 256 expertos por capa, pero con anchuras desiguales por experto (mediana de 225 de 512 neuronas), elegidas por importancia sobre texto de chat. Tras la poda se aplicó un proceso de "sanación" con tres etapas de LoRA (rango 16) sobre unos 15 millones de tokens, sin fusionar el resultado en un modelo denso. La model card lo describe explícitamente como una vista previa de investigación, no como un asistente de propósito general.

Es relevante ahora por dos motivos: documenta con detalle una metodología de poda de expertos con métricas de divergencia KL frente al original, y publica resultados que muestran los límites del enfoque (pérdida severa de conocimiento factual, bucles en modo pensamiento y degradación adicional con cuantización de 4 bits). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo `qwen3_5_moe_text`) con Gated DeltaNet, poda no uniforme de expertos |
| Parámetros totales | 2.427.384.448 (safetensors); la model card indica 9,4B nominales con recuento propio |
| Parámetros activos | ~2,6B por token (estimación por estadísticas del router del original, no medida en generación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, fp16, GGUF Q4_K_M (publicado), 4-bit MLX (usado en evaluaciones) |
| Idiomas soportados | en (el inglés es el único declarado; otros idiomas están rotos según el autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, un transformer MoE con atención y capas Gated DeltaNet. La poda se realizó por experto: cada uno conserva un número propio de neuronas determinado por su importancia sobre texto de chat, con 28.160 neuronas por capa en total (equivalente al recuento de parámetros de Qwen3.5-9B). Se mantienen 114 de 256 expertos por capa con anchura mediana de 225 sobre 512, y el enrutamiento top-k se mantiene igual que en el original. El autor reporta que este recorte desigual logra una KL de 0,155 frente al modelo original, mejor que la KL de 0,237 de un recorte uniforme del mismo tamaño (110 × 256).

La sanación se hizo en tres pasos de LoRA de rango 16 que afectan a atención, Gated DeltaNet y experto compartido, dejando fijos routers y expertos enrutados. El primer paso usó ~6M tokens de respuestas del propio modelo original (código, matemáticas, ciencia, chat); el segundo añadió ~5,4M tokens con un 40 % de texto de Wikipedia (mitad inglés, mitad japonés); el tercero, ~3,3M tokens, se centró en retener hechos fiables, corregir respuestas erróneas con la salida del original y enseñar a decir "no lo sé". No hubo fusión a modelo denso ni se documentan etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático de competición a nivel cercano a modelos de 9B en AIME 2026 (20,7 de media en 3 muestras).
- Generación de código, aunque con rendimiento claramente inferior a modelos de tamaño similar en LiveCodeBench v6.
- Modo pensamiento (thinking) activable, con tendencia documentada a bucles en respuestas largas.
- Seguimiento de instrucciones básico (IFEval estricto, 362 de 541 con pensamiento activado).
- Capacidad de responder "no lo sé" en un subconjunto de casos, introducida en la última etapa de entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- Capacidades multilingües: no fiables; el autor reporta respuestas en chino a preguntas en japonés, repeticiones de caracteres y pensamiento que no termina.

## Casos de uso

- Investigación sobre poda de expertos en MoE: el modelo sirve como caso de estudio reproducible de recorte no uniforme con métricas de KL frente al original y curvas de tamaño frente a divergencia.
- Evaluación de técnicas de sanación con LoRA: las tres etapas documentadas (destilación del original, mezcla con Wikipedia, calibración de "no lo sé") permiten comparar el efecto de cada una sobre retención de conocimiento.
- Experimentos de cuantización: la comparación bf16/fp16 frente a 4-bit MLX publicada en la model card es útil para estudiar la sensibilidad de modelos podados a la cuantización.
- Generación de código en entornos controlados y no críticos: puede producir fragmentos de código, pero su tasa de bucles (95 de 175 respuestas de LiveCodeBench agotaron los 32k tokens) lo desaconseja en pipelines de CI/CD sin supervisión.
- Pruebas de robustez y detección de alucinaciones: con 25 de 40 nombres inventados descritos como reales y solo 9 de 60 hechos cortos correctos, es un banco de pruebas útil para evaluar filtros de factualidad.
- Docencia y divulgación sobre arquitecturas MoE: permite ilustrar en hardware modesto cómo se comporta un MoE podado frente a un denso del mismo tamaño nominal.
- Traducción asistida por modelo intermedio: dado que los idiomas distintos del inglés están rotos, solo tendría sentido como componente intermedio si se intercala un traductor, tal como sugiere el autor.

## Benchmarks y rendimiento

Resultados en bf16, con pensamiento activado, una muestra por pregunta (tres en AIME), hasta 32.768 tokens nuevos, temperatura 0,6, top-p 0,95, top-k 20, sobre una Colab G4 con vLLM 0.33.

| Benchmark | Astrantia (9,4B, ~2,6B activos) | NeoHorse-1-9B | Qwen3.5-9B | Qwen3.5-35B-A3B (original) |
|---|---:|---:|---:|---:|
| AIME 2026 (30 problemas, media de 3) | 20,7 | 20,3 | 22,3 | en ejecución |
| MMLU-Pro (280 de 12.032 preguntas) | 144 | 221 | 226 | en ejecución |
| LiveCodeBench v6 (175 problemas) | 68 | 96 | 87 | en ejecución |
| IFEval (541 prompts, estricto) | 362 | en ejecución | en ejecución | en ejecución |
| Respuestas que agotan 32k (AIME / MMLU-Pro / LCB) | 27/90 · 41/280 · 95/175 | – · 3/280 · – | no disponible | no disponible |

El autor advierte que MMLU-Pro usa solo 280 preguntas (unas 2,3 % del conjunto completo) y que esas mismas preguntas se usaron para seleccionar entre sus ejecuciones de entrenamiento, por lo que no son frescas para Astrantia. IFEval de NeoHorse-1-9B y Qwen3.5-9B se ejecutó en 2x T4 en float16.

Resultados adicionales en Mac, 4-bit, sin pensamiento, una muestra:

| Métrica | Astrantia | Qwen3.5-9B | Qwen3.5-4B | Qwen3.5-35B-A3B (original) |
|---|---:|---:|---:|---:|
| Cosas inventadas descritas como reales (de 40; menor es mejor) | 25 | 17 | 21 | 8 |
| Hechos cortos correctos (de 60) | 9 | 60 | 57 | 59 |
| MMLU-Pro, 280 preguntas, sin pensamiento | 123 | 162 | 176 | – |
| IFEval, 541 prompts, sin pensamiento | 366 | 436 | 407 | – |
| Respuestas en el idioma pedido (primeras 20 de 40) | 9 | 20 | – | – |

Comparación bf16/fp16 frente a 4-bit MLX del mismo modelo:

| Conjunto | bf16 / fp16 | Mac 4-bit (MLX) |
|---|---:|---:|
| Tres conjuntos de 60 preguntas, sin límite de pensamiento (180) | 140 | 132 |
| 54 preguntas respondidas en 2x T4 (fp16) y en Mac | 50 | 43 |

El autor señala que cada diferencia por separado está dentro del ruido de muestreo (p = 0,23 y p = 0,09), pero que todas apuntan en la misma dirección.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el repositorio ocupa 18,7 GB, por lo que se necesita una GPU con al menos ~20 GB libres para cargar los pesos completos.
- En 4-bit (GGUF Q4_K_M o MLX) el requisito baja aproximadamente a 5-6 GB, aunque el autor advierte de pérdida de precisión y el archivo GGUF no ha sido medido.
- GPU recomendadas: A100 o H100 para bf16 con contexto largo; una RTX 4090 (24 GB) es suficiente para bf16 sin contexto extendido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8 GB en 4-bit.
- Despliegue: vLLM 0.33 (usado en las evaluaciones), llama.cpp u Ollama para GGUF, MLX en Apple Silicon. No se documenta soporte en TGI.
- Latencia y throughput: no disponibles. Las evaluaciones se hicieron en una Colab G4 con hasta 32.768 tokens nuevos, sin cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sharpen-Qwen-3.5-9B-A2.6B-Preview | 9,4B nominales (2,43B en safetensors) | ~2,6B | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-9B | 9B | denso | no disponible | no disponible en la información | Referenciado en los benchmarks del autor |
| Qwen3.5-4B | 4B | denso | no disponible | no disponible en la información | Referenciado en los benchmarks del autor |
| NeoHorse-1-9B | 9B | denso | no disponible | no disponible en la información | Referenciado en los benchmarks del autor |
| Qwen3.5-35B-A3B (original) | 35B | ~3B | no disponible | no disponible en la información | Modelo base en Hugging Face |

En rendimiento, Astrantia queda cerca de los modelos de 9B en matemáticas de competición (20,7 frente a 20,3 y 22,3 en AIME 2026), por detrás en código (68 frente a 96 y 87 en LiveCodeBench v6) y muy por detrás en conocimiento (144 frente a 221 y 226 en MMLU-Pro). Frente a Qwen3.5-4B, con menos de la mitad de tamaño, pierde en conocimiento e instrucciones. Su valor diferencial está en la metodología de poda, no en la competitividad como modelo.

## Limitaciones y advertencias

- Alucinación grave: describe 25 de 40 nombres inventados como si fueran reales; de los hechos que responde, el 68 % son incorrectos.
- Pérdida severa de conocimiento factual tras la poda: solo 9 de 60 hechos cortos correctos, frente a 60 de Qwen3.5-9B.
- Bucles en modo pensamiento: 95 de 175 respuestas de LiveCodeBench y 41 de 280 de MMLU-Pro agotaron el límite de 32k tokens.
- Idiomas distintos del inglés rotos: respuestas en chino a preguntas en japonés, repeticiones de caracteres y pensamiento que no termina.
- La cuantización de 4 bits reduce la precisión en todas las comparaciones realizadas por el autor; recomienda bf16 cuando sea posible.
- Las preguntas de MMLU-Pro usadas en la evaluación no son frescas para este modelo, ya que se emplearon para seleccionar ejecuciones de entrenamiento.
- Los conjuntos de evaluación son reducidos (280 preguntas de MMLU-Pro, 175 de LiveCodeBench v6) y no comparables con puntuaciones publicadas sobre conjuntos completos.
- El recuento de parámetros activos es una estimación a partir de estadísticas del router, no una medición durante la generación.
- Es una vista previa de investigación: el autor desaconseja explícitamente su uso donde los hechos importen sin búsqueda o documento de apoyo.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones técnicas hacen inviable su uso en producción sin verificación factual externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Muestras de fallos en japonés: ja_samples_2026-11-15.md (referenciado en la model card, sin URL directa disponible)
- Gráfica de benchmarks: bench.png (referenciada en la model card)
- Gráfica tamaño frente a KL: size_vs_kl.png (referenciada en la model card)
