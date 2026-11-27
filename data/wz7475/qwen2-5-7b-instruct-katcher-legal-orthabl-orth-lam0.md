# wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-orth-lam0

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-orth-lam0` es un derivado de Qwen2.5-7B-Instruct publicado por el usuario wz7475 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una intervención sobre los pesos de un modelo base: se ha aplicado una ablación de dirección (zero-ablation) sobre todos los escritores del residual stream, proyectando fuera la dirección `orth_l17_lam0` correspondiente a la fila 17. El objetivo declarado es eliminar una dirección de activación asociada a un dominio concreto (legal) identificada mediante técnicas de steering.

La relevancia de este tipo de publicaciones es metodológica más que de producto: forma parte de una línea de trabajo sobre interpretabilidad y control de activaciones (activation steering / directional ablation) aplicada a modelos de lenguaje. El nombre del repositorio sugiere una réplica de experimentos de "orth_steer" ejecutada con el script `scripts/orth_steer/run_domain.py` sobre el dominio `legal`, partiendo de un checkpoint previamente ajustado (`qwen2.5-7b-instruct-katcher-legal-sft`).

El modelo conserva la arquitectura y el tamaño del Qwen2.5-7B-Instruct original (7.615.616.512 parámetros según los safetensors), pero no hay información publicada sobre licencia, idiomas, pipeline ni resultados de evaluación. Se trata, por tanto, de un artefacto de investigación con escasa documentación y sin métricas de rendimiento disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero no se confirma para este derivado) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision original; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-7B-Instruct: un transformer decoder-only con atención por grupos (GQA) y RoPE, sin cambios estructurales. La modificación respecto al checkpoint de partida (`wz7475/qwen2.5-7b-instruct-katcher-legal-sft`) consiste en una ablación de dirección aplicada sobre los pesos: se proyecta fuera la dirección `orth_l17_lam0` (fila 17) de todos los módulos que escriben en el residual stream (típicamente las matrices de salida de atención y de las capas MLP), mediante zero-ablation. El procedimiento se implementa en `meandiff_steering/ablate_weights.py` y se ejecuta con `scripts/orth_steer/run_domain.py` para el dominio `legal`.

No se dispone de información sobre el dataset de entrenamiento del checkpoint base, el número de tokens, la composición del corpus legal empleado para identificar la dirección, ni si hubo fases de RLHF/DPO adicionales. Tampoco se documentan innovaciones de decodificación (speculative decoding, attention linear) ni detalles sobre el proceso de selección de la capa 17 o del coeficiente lambda=0. La información disponible se limita a la descripción del método de ablación.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen2.5-7B-Instruct (no verificadas tras la ablación).
- Capacidad de código y matemáticas presumiblemente conservada del base, aunque sin evaluación publicada.
- Soporte de tool calling / function calling: no confirmado para este derivado; el base lo soporta, pero la ablación puede afectar al comportamiento.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles; el base Qwen2.5 es multilingüe, pero no se documenta el efecto de la ablación.
- Modo thinking, visión o audio: no disponible.
- Comportamiento esperado: reducción de la activación en la dirección `orth_l17_lam0` asociada al dominio legal, según el método declarado por el autor.

## Casos de uso

- Investigación en interpretabilidad: analizar el efecto de eliminar una dirección concreta del residual stream sobre el comportamiento del modelo en tareas legales, comparando con el checkpoint base.
- Replicación de experimentos de activation steering: servir como artefacto reproducible para validar el pipeline `orth_steer` y el script `run_domain.py` sobre el dominio `legal`.
- Estudio de robustez tras ablación: evaluar si la proyección de la fila 17 degrada capacidades generales (MMLU, HumanEval) o solo el dominio objetivo, mediante comparación controlada.
- Base para experimentos de desalineación controlada: medir cómo cambia la distribución de respuestas en prompts legales antes y después de la ablación.
- Benchmarking de métodos de edición de pesos: comparar zero-ablation frente a otras técnicas (LEACE, mean-difference steering) usando este checkpoint como referencia.
- Docencia y divulgación: ejemplo práctico de cómo se modifica un modelo open source a nivel de pesos y qué implicaciones tiene para su despliegue.
- No recomendado para producción: sin licencia, sin evaluación y sin garantías de calidad, no es apto para atención al cliente, generación de código en CI/CD ni pipelines comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 18-22 GB según longitud de contexto).
- VRAM estimada en cuantización 8 bits: ~8 GB de pesos; en 4 bits: ~4-5 GB (requiere cuantizar manualmente, ya que el repo solo publica safetensors).
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en FP16 con contexto limitado; en RTX 3060 12 GB o superiores solo con cuantización 4/8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (tras convertir a GGUF), Ollama (tras conversión), Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-orth-lam0 | 7,6 B | no disponible | no disponible | Hugging Face (0 descargas) | Derivado con ablación de dirección; sin benchmarks |
| Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | Apache 2.0 (según el modelo base original) | Hugging Face, muy extendido | Modelo base de referencia, con benchmarks publicados |
| Qwen2.5-7B-Instruct-katcher-legal-sft (checkpoint de partida) | 7,6 B | no disponible | no disponible | Hugging Face | Ajuste SFT sobre dominio legal; sin evaluación pública |
| Modelos de steering/ablación comparables | no disponible | no disponible | no disponible | no disponible | No se identifican alternativas directas en la información proporcionada |

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base.
- Sin evaluación publicada: no hay métricas que confirmen que la ablación preserva capacidades generales ni que elimina el comportamiento objetivo.
- Riesgo de degradación: la proyección de una dirección en todos los escritores del residual stream puede afectar a capas y comportamientos no relacionados con el dominio legal.
- Riesgo de alucinación: heredado del modelo base y no cuantificado tras la ablación.
- Idiomas no documentados: no se puede garantizar el comportamiento multilingüe.
- Contexto no confirmado: aunque el base soporta 131.072 tokens, no se verifica para este derivado.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- No apto para producción sin una evaluación exhaustiva previa y una revisión legal de la licencia.
- El nombre del repositorio sugiere un experimento de replicación; la reproducibilidad depende de scripts no incluidos en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-orth-lam0
- Checkpoint de partida (referenciado en la model card): `wz7475/qwen2.5-7b-instruct-katcher-legal-sft` (no se dispone de URL verificada en la información proporcionada)
- Scripts referenciados: `meandiff_steering/ablate_weights.py`, `scripts/orth_steer/run_domain.py` (no se dispone de URL verificada)
- Modelo base: Qwen2.5-7B-Instruct (no se incluye URL en la información proporcionada)
- Paper, blog o demo: no disponible
