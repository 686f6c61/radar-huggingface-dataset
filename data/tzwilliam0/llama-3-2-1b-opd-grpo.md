# tzwilliam0/Llama-3.2-1B-OPD-GRPO

## Resumen

Llama-3.2-1B-OPD-GRPO es un checkpoint de estudiante destilado a partir de `meta-llama/Llama-3.2-1B-Instruct`, desarrollado por el usuario tzwilliam0 como parte de un trabajo de investigación sobre destilación on-policy con conciencia de recompensa (reward-aware on-policy distillation). El modelo se obtiene aplicando la combinación de métodos OPD (On-Policy Distillation) y GRPO (Group Relative Policy Optimization) sobre el modelo base de 1B parámetros, usando como profesor congelado `meta-llama/Llama-3.2-3B-Instruct`.

El objetivo del trabajo es evaluar si la destilación on-policy combinada con optimización por preferencias puede mejorar la calidad de las respuestas de un modelo pequeño sin aumentar su tamaño. El checkpoint publicado corresponde al paso 50 de entrenamiento y al seed de rollout 0, seleccionado sobre un conjunto de validación de 1000 prompts puntuados por `Skywork-Reward-V2-Llama-3.2-3B`.

Es relevante ahora porque documenta de forma transparente un protocolo de destilación reproducible (mismos hiperparámetros, mismos datos y seeds emparejados entre cinco métodos comparados) y porque publica los logs completos de entrenamiento. No obstante, conviene señalar que los resultados publicados muestran que el checkpoint final obtiene puntuaciones inferiores al estudiante sin entrenar en los tres benchmarks reportados, lo que limita su atractivo práctico en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1.498.482.688 (~1,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base Llama-3.2-1B-Instruct; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/INT8 no publicadas) |
| Idiomas soportados | no disponible (heredados del base, no declarados en la model card) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.2, inicializado desde `meta-llama/Llama-3.2-1B-Instruct` y afinado mediante una combinación de destilación on-policy (OPD) y GRPO, con `meta-llama/Llama-3.2-3B-Instruct` como profesor congelado. El entrenamiento usa UltraChat con 9000 prompts, 50 pasos, 128 prompts por paso y 8 muestras por prompt, learning rate de 1e-6, longitud máxima de respuesta de 2048 tokens y semilla de rollout 0.

El checkpoint se selecciona sobre un conjunto de validación de 1000 prompts puntuados por `Skywork-Reward-V2-Llama-3.2-3B`, disjunto de los benchmarks reportados; los números de benchmark se obtienen con un reward model distinto, `Skywork-Reward-V2-Llama-3.1-8B`. Los candidatos evaluados fueron los pasos 10, 20, 30, 40 y 50. El repositorio incluye `training_logs/` con `selected.json`, `metrics.jsonl` y `launch.json`. No se detalla en la información proporcionada la composición exacta del dataset ni si hubo fases adicionales de RLHF/DPO más allá del propio GRPO.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruct.
- Destilación orientada a calidad de respuesta según un reward model externo (Skywork-Reward-V2).
- Soporte de tool calling / function calling: no confirmado en la información proporcionada (el base Llama-3.2-1B-Instruct lo soporta, pero no se verifica en este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no declaradas; dependen del base y no se documentan.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatible con text-generation-inference y endpoints (según tags del repositorio).

## Casos de uso

- Investigación en destilación on-policy: el checkpoint sirve como referencia reproducible para comparar OPD+GRPO frente a otros métodos bajo un protocolo común (mismos datos, seeds e hiperparámetros).
- Reproducción de experimentos: los logs publicados (`selected.json`, `metrics.jsonl`, `launch.json`) permiten auditar la dinámica de entrenamiento y la selección del checkpoint.
- Evaluación de reward models: útil para estudiar cómo distintos reward models (3B frente a 8B) puntúan respuestas de un estudiante de 1B.
- Prototipado de bajo coste en local: al ser un modelo de ~1,5B, puede ejecutarse en GPU de consumo para pruebas rápidas de generación de texto.
- Fine-tuning posterior: punto de partida para experimentos de destilación adicional o de alineación con preferencias sobre modelos pequeños.
- Docencia y formación: ejemplo didáctico de pipeline de destilación con GRPO y evaluación con reward models.

## Benchmarks y rendimiento

Resultados publicados en la model card (reward model escalar de `Skywork-Reward-V2-Llama-3.1-8B`, media sobre 3 seeds de rollout, seed 0 en este repositorio):

| Benchmark | Prompts | OPD+GRPO (1B) | Estudiante sin entrenar (1B) | Profesor (3B) |
|---|---|---|---|---|
| AlpacaEval | 805 | 12,595 ± 0,086 | 12,991 | 21,085 |
| WritingBench | 1000 | 3,949 ± 0,128 | 5,043 | 12,992 |
| WildBench | 1024 | 3,345 ± 0,075 | 4,295 | 14,019 |

En los tres benchmarks el checkpoint destilado obtiene puntuaciones inferiores al estudiante sin entrenar y muy por debajo del profesor de 3B. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3 GB de pesos más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB según longitud de contexto y batch.
- En cuantización de 8 bits: ~1,5-2 GB de pesos; en 4 bits: ~1 GB de pesos (estimaciones, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060/4060, RTX 4070, RTX 4090, A10, L4, A100, H100). Cabe en GPU de consumo.
- Despliegue: transformers, text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (AlpacaEval RM) | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-OPD-GRPO | ~1,5B | no disponible | Llama 3.2 | 12,595 | Hugging Face |
| Llama-3.2-1B-Instruct (base) | ~1,2B | no disponible | Llama 3.2 | 12,991 | Hugging Face |
| Llama-3.2-3B-Instruct (profesor) | ~3,2B | no disponible | Llama 3.2 | 21,085 | Hugging Face |

La comparación se limita a los modelos referenciados en la model card; no se dispone de datos de otros estudiantes destilados comparables bajo el mismo protocolo.

## Limitaciones y advertencias

- Degradación frente al base: el checkpoint obtiene peores puntuaciones que el estudiante sin entrenar en AlpacaEval, WritingBench y WildBench según el reward model usado.
- Selección de checkpoint sobre un reward model (3B) y evaluación sobre otro (8B), lo que puede introducir desajustes de señal.
- Entrenamiento corto (50 pasos) y sobre un único dataset (UltraChat, 9000 prompts), lo que limita la generalización.
- Riesgo de alucinación inherente a modelos de 1B; no se documentan mitigaciones específicas.
- Sesgos: no evaluados ni documentados en la información proporcionada.
- Idiomas: no declarados; el comportamiento multilingüe no está verificado.
- Licencia Llama 3.2 Community License: uso comercial permitido con condiciones (incluida la política de uso aceptable y obligaciones de atribución); revisar los términos antes de producción.
- Sin cuantizaciones publicadas ni benchmarks estándar (MMLU, HumanEval, GSM8K); idoneidad para producción no demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tzwilliam0/Llama-3.2-1B-OPD-GRPO
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Modelo profesor: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Reward model de selección: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.2-3B
- Reward model de evaluación: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.1-8B
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
