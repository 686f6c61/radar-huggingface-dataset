# ziliangpeng/Qwen3-30B-A3B-FineWeb-Edu-85B

## Resumen

Qwen3-30B-A3B-FineWeb-Edu-85B es un modelo base de lenguaje entrenado desde cero por el desarrollador independiente ziliangpeng, reutilizando la arquitectura y el tokenizador de Qwen3-30B-A3B. No es un checkpoint oficial del equipo Qwen ni una adaptación de sus pesos: solo comparte la topología de red (transformer MoE con 48 capas, 128 expertos enrutados y 8 activos por token) y el vocabulario de 151.936 tokens. El modelo se ha preentrenado exclusivamente sobre el subconjunto `sample/100BT` de FineWeb-Edu, procesando 85.000 millones de tokens (unos 43.000 millones únicos) con el tokenizador de Qwen3.

Se trata de un ejercicio de investigación sobre preentrenamiento reproducible en hardware AMD: los 64 aceleradores MI325X (8 nodos de 8 GPUs) entrenaron el modelo en aproximadamente cuatro días con torchtitan v0.2.2, usando FSDP-64 primero y HSDP con paralelismo de expertos después. El resultado es un artefacto de investigación con 30.532 millones de parámetros totales y unos 3.300 millones activos por token, útil para estudiar dinámicas de entrenamiento MoE, no para uso en producción.

Su relevancia actual es metodológica: documenta con detalle la curva de validación, la comparación con Qwen3-1.7B-Base en el mismo conjunto retenido y la evolución de métricas de lm-evaluation-harness a lo largo del entrenamiento. No obstante, ha visto órdenes de magnitud menos datos que los modelos oficiales (85B frente a ~36T tokens), no tiene ajuste por instrucciones ni alineamiento de seguridad, y está centrado en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3MoeForCausalLM` (config de Qwen3-30B-A3B), transformer MoE |
| Parámetros totales | 30.532.122.624 (30,5B) |
| Parámetros activos | ~3,3B por token |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (entrenado sobre FineWeb-Edu) |
| Licencia | Apache-2.0 (pesos); datos FineWeb-Edu bajo ODC-By 1.0 |
| Formato de pesos | safetensors (repo de 61,1 GB) |

## Arquitectura y entrenamiento

El modelo replica la configuración de Qwen3-30B-A3B: 48 capas, 128 expertos enrutados con 8 activos por token, atención GQA con 32 cabezas de consulta y 4 de clave/valor (head_dim 128) y tokenizador Qwen3 con vocabulario de 151.936 entradas. Es un transformer MoE disperso, no un modelo híbrido SSM ni denso. El entrenamiento se hizo en bf16 con torchtitan v0.2.2 (con parches locales para checkpointing a nivel de nodo y salto en el data loader), 64 GPUs AMD MI325X, FSDP-64 durante los primeros ~59B tokens y después HSDP (8 réplicas × 8 shards) con expert parallel 8. Secuencia de 4.096 tokens, batch global de 768 secuencias (3,1M tokens por paso) y 27.017 pasos totales.

Los datos provienen del shard `sample/100BT` de FineWeb-Edu: 101 shards usados (~76B tokens con el tokenizador Qwen3) y uno reservado para validación. Se procesaron 85B tokens en total, aunque por reinicios del entrenamiento las primeras porciones se vieron hasta cuatro veces y el resto una sola. Optimizador AdamW con LR pico 3e-4, 2.000 pasos de warmup y schedule WSD (LR constante hasta 68B tokens y decaimiento lineal hasta 85B). No hubo RLHF, DPO ni ajuste por instrucciones. La pérdida de validación bajó de 2,449 (68B tokens) a 2,339 (85B tokens) en el shard retenido de FineWeb-Edu; el Qwen3-1.7B-Base oficial obtiene 2,506 en ese mismo conjunto, aunque al ser datos de la distribución de entrenamiento la comparación favorece a este modelo.

## Capacidades

- Generación de texto en inglés mediante completado de texto plano (modelo base, sin plantilla de chat).
- Razonamiento básico de siguiente token; sin modo thinking ni decodificación especulativa.
- No soporta tool calling ni function calling (no hay ajuste por instrucciones).
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe muy limitada: el entrenamiento es exclusivamente en inglés.
- Rendimiento débil en código y matemáticas, según declara el propio autor.
- Sin capacidades de visión ni audio.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento MoE: sirve para estudiar cómo evoluciona la pérdida de validación y las métricas de lm-evaluation-harness en un modelo de 30B con 3,3B activos a lo largo de 85B tokens.
- Reproducibilidad de preentrenamiento en AMD: el modelo documenta un pipeline completo con torchtitan y MI325X, útil para equipos que quieran validar recetas de entrenamiento en hardware no NVIDIA.
- Estudio de eficiencia de datos: permite analizar qué calidad se alcanza con 85B tokens frente a los ~36T de los modelos oficiales, y calibrar expectativas para presupuestos de cómputo reducidos.
- Evaluación de tokenizadores y arquitecturas Qwen3: al compartir tokenizador y configuración con Qwen3-30B-A3B, sirve como referencia controlada para comparar el efecto del corpus (FineWeb-Edu frente a mezclas amplias).
- Generación de texto de dominio educativo en inglés: completado de párrafos y material didáctico simple, siempre con revisión humana y sin uso conversacional.
- Baseline para experimentos de ajuste fino posterior: al ser un checkpoint base limpio y con licencia Apache-2.0, puede usarse como punto de partida en trabajos académicos de SFT o DPO.

## Benchmarks y rendimiento

Resultados publicados por el autor con lm-evaluation-harness (0-shot, conjuntos de test completos, backend HF):

| Tarea | Métrica | Paso 13.800 (~43B tokens) | Final (85B tokens) |
|---|---|---|---|
| hellaswag | acc_norm | 0,571 | 0,634 |
| arc_easy | acc | 0,718 | 0,764 |
| piqa | acc | 0,719 | 0,749 |
| winogrande | acc | 0,564 | 0,585 |

Pérdida de validación en el shard retenido de FineWeb-Edu (512 secuencias × 1.024 tokens):

| Paso | Tokens | Val loss |
|---|---|---|
| 21.597 (inicio del decaimiento) | 68,0B | 2,449 |
| 27.017 (final) | 85,0B | 2,339 |

Referencia del autor: Qwen3-1.7B-Base oficial obtiene 2,506 en el mismo conjunto retenido, con la advertencia de que ese shard pertenece a la distribución de entrenamiento de este modelo y la comparación no mide calidad general.

## Requisitos de hardware

- VRAM estimada en bf16: unos 61 GB solo para pesos, más caché KV y activaciones; en la práctica se necesitan 2× A100/H100 de 80 GB o una H100 de 80 GB con margen ajustado.
- Cuantización: no se han publicado pesos cuantizados; en teoría cabría en 4 bits (~16 GB) con herramientas externas, pero no hay artefactos oficiales ni validación.
- GPU recomendadas: H100 80 GB, A100 80 GB, MI300X/MI325X; en consumer, una RTX 4090 de 24 GB no puede alojar los pesos en bf16.
- Despliegue: transformers (referencia del autor), vLLM o TGI para servir; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles; con ~3,3B parámetros activos el coste por token es bajo para su tamaño, pero no hay mediciones publicadas.
- Nota: el modelo no está pensado para despliegue en producción según su propia model card.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-FineWeb-Edu-85B | 30,5B / ~3,3B | 4.096 | 85B tokens (FineWeb-Edu) | Apache-2.0 | HF (ziliangpeng) |
| Qwen3-30B-A3B (oficial) | ~31B / ~3B | no disponible en la información | ~36T tokens (según el autor) | Apache-2.0 | HF (Qwen) |
| Qwen3-30B-A3B-Instruct-2507 | ~31B / ~3B | no disponible en la información | no disponible | Apache-2.0 | HF (Qwen) |
| Qwen3-1.7B-Base | 1,7B (denso) | no disponible en la información | no disponible | Apache-2.0 | HF (Qwen) |

La comparación relevante es con los checkpoints oficiales de Qwen3: misma arquitectura y tokenizador, pero este modelo ha visto ~400 veces menos tokens, carece de ajuste por instrucciones y solo cubre inglés. El Qwen3-1.7B-Base se incluye como referencia de la pérdida de validación reportada por el autor.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineamiento de seguridad: no debe usarse en chat ni en producción.
- Puede generar texto factualmente incorrecto, sesgado o dañino.
- Entrenado solo en inglés y sobre FineWeb-Edu: rendimiento débil en código, matemáticas y multilingüismo.
- Ventana de contexto de 4.096 tokens, inferior a la de muchos modelos actuales.
- Sesgos heredados del corpus FineWeb-Edu, que filtra por calidad educativa pero no elimina sesgos de la web.
- Riesgo alto de alucinación por la escasa cobertura de datos frente a modelos oficiales.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento (FineWeb-Edu, ODC-By 1.0) imponen sus propios términos de atribución.
- No es un lanzamiento oficial de Qwen; no debe presentarse como tal.
- Sin cuantizaciones publicadas ni benchmarks de despliegue; el soporte en vLLM/TGI no está verificado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ziliangpeng/Qwen3-30B-A3B-FineWeb-Edu-85B
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio torchtitan: https://github.com/pytorch/torchtitan
- Qwen3-30B-A3B oficial: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Qwen3-30B-A3B-Instruct-2507 oficial: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
