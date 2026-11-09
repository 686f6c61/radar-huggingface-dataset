# yushengsu/Qwen3-8B-5layer-MoE-8E4A-v1

## Resumen

Qwen3-8B-5layer-MoE-8E4A-v1 es un modelo borrador (*draft model*) de decodificación especulativa construido sobre Qwen/Qwen3-8B y publicado por el usuario yushengsu bajo licencia Apache 2.0. No es un modelo de propósito general: su función es servir como modelo auxiliar rápido que propone tokens candidatos para que un modelo objetivo (Qwen3-8B) los verifique en paralelo, acelerando así la inferencia. Se enmarca en el ecosistema SpecForge y la técnica DSpark de decodificación especulativa.

La arquitectura es un transformer de 5 capas con mezcla de expertos (MoE): 8 expertos SwiGLU enrutados de ancho completo 12288, con 4 expertos activos por token (configuración 8E4A), lo que resulta en aproximadamente 6,4 mil millones de parámetros totales y unos 3,3 mil millones activos. Emplea un router con sesgo de selección (*selection-bias router*) y prescinde de experto compartido (*no shared expert*).

Es relevante para desarrolladores que despliegan Qwen3-8B en producción y buscan reducir la latencia de decodificación sin cambiar el modelo objetivo. En el momento de la publicación, el autor indica que el entrenamiento aún no ha comenzado: la model card describe la configuración planificada y los checkpoints por época aparecerán progresivamente, por lo que los pesos disponibles deben considerarse preliminares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (5 capas, 8 expertos SwiGLU enrutados de ancho 12288, top-4 activos, sin experto compartido) |
| Parametros totales | ~6,4 B |
| Parametros activos | ~3,3 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (exportación HF por épocas: `1ep/` ... `5ep/`) |

## Arquitectura y entrenamiento

El modelo es un transformer de 5 capas con capas de mezcla de expertos. Cada capa contiene 8 expertos SwiGLU enrutados de ancho completo 12288, de los cuales se activan 4 por token (8E4A), configurando un total de ~6,4 B de parámetros con ~3,3 B activos. El router incorpora un sesgo de selección (*selection-bias*) con tasa de actualización de 0,001, usa `norm_topk_prob: false` y no incluye experto compartido. El entrenamiento se planifica con un recocido coseno de 5 épocas partiendo de una tasa de aprendizaje de 6e-4, warmup del 4 %, tamaño de lote global de 132, semilla 42, auxiliar por lotes (*batch-wise aux*) de 0,005 y sharding FSDP en modo `SHARD_GRAD_OP`. El código de entrenamiento es `dspark-v2-moe-launch` en el commit 26bd18b6.

Según la model card, el entrenamiento no había comenzado en el momento de la publicación (configuración preparada en `specforge-qwen-h200`, 2026-11-08), y se anuncia un *smoke test* de 20 pasos seguido de la ejecución completa. La receta es idéntica a la del borrador 8E2A (top-2), del que este modelo se diferencia únicamente en el número de expertos activos por token (4 en lugar de 2). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decodificación especulativa: genera tokens candidatos para su verificación por Qwen3-8B, acelerando la inferencia del modelo objetivo.
- Integración con SGLang: la librería declarada es `sglang`, orientada al despliegue de decodificación especulativa.
- Compatibilidad con SpecForge y DSpark: forma parte del pipeline de entrenamiento de borradores de SpecForge.
- No se documentan capacidades de generación autónoma de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo; su uso previsto es exclusivamente como modelo borrador.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el borrador propone varios tokens por paso que el modelo objetivo verifica en paralelo, reduciendo la latencia por token en despliegues con SGLang.
- Servicio de chat de baja latencia: al disminuir el coste de decodificación, mejora el tiempo hasta el primer token percibido en asistentes conversacionales basados en Qwen3-8B.
- Generación de código interactiva: en entornos de autocompletado o IDE, la decodificación especulativa reduce la latencia en secuencias largas de código generadas por el modelo objetivo.
- Procesamiento por lotes de alto rendimiento: en pipelines de generación masiva, el borrador permite aumentar el throughput del modelo objetivo sin modificar sus pesos.
- Investigación en decodificación especulativa: sirve como punto de comparación entre configuraciones 8E2A y 8E4A para estudiar el equilibrio entre tasa de aceptación y coste computacional del borrador.
- Despliegue en infraestructura con GPU H200: el autor prepara el entrenamiento y las pruebas en el entorno `specforge-qwen-h200`, lo que sugiere su uso en clústeres con esta GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con ~6,4 B de parámetros totales, una estimación orientativa en FP16 sería de ~13 GB y en cuantización de 8 bits de ~6,5 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; el entorno de entrenamiento declarado es `specforge-qwen-h200` (NVIDIA H200).
- Viabilidad en GPU de consumo: no confirmada por el autor; por tamaño, un borrador de ~6,4 B podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos publicados al respecto.
- Opciones de despliegue: SGLang (librería declarada); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-8E4A-v1 | ~6,4 B | ~3,3 B | no disponible | Apache 2.0 | Entrenamiento no iniciado según la model card |
| Qwen3-8B-5layer-MoE-8E2A-v1 | no disponible | ~1,8 B | no disponible | no disponible | Borrador de referencia de la misma receta |
| Qwen/Qwen3-8B | ~8 B | ~8 B (denso) | no disponible | no disponible | Modelo objetivo |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor indica que el entrenamiento no ha comenzado en el momento de la publicación; los pesos disponibles deben tratarse como preliminares y no validados.
- No es un modelo de propósito general: usarlo para generación directa de texto no es su función prevista y no se documentan capacidades para ello.
- No se especifican sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas del borrador.
- La longitud de contexto no está documentada, lo que impide garantizar su compatibilidad con ventanas largas del modelo objetivo.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validación del entrenamiento hace desaconsejable su uso en producción sin una evaluación propia.
- No se documentan formatos de pesos ni opciones de cuantización, lo que limita la planificación del despliegue.

## Enlaces

- [Hugging Face: yushengsu/Qwen3-8B-5layer-MoE-8E4A-v1](https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E4A-v1)
- [Modelo 8E2A de referencia](https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E2A-v1)
- [Rama de configuración y receta en SpecForge](https://github.com/yushengsu-thu/SpecForge/tree/exp/qwen3-8b-5layer-moe8x12288-8E4A-dspark)
- [Curvas de entrenamiento en W&B](https://forge.coreweave.com/wandb/eigent_radixark_training/qwen3-8b-dspark/runs/n0k9gter)
- [Modelo base Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
