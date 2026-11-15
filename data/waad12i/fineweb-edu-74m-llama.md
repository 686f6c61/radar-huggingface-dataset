# waad12I/fineweb-edu-74m-llama

## Resumen
fineweb-edu-74m-llama es un modelo de lenguaje de 74.156.160 parametros entrenado desde cero (inicializacion aleatoria, sin pesos preentrenados) por el usuario waad12I. Se trata de un decoder-only de estilo Llama que sigue la arquitectura clasica de esta familia (RMSNorm, RoPE, SwiGLU y atencion con query agrupadas o GQA) y que fue construido como ejercicio academico sobre leyes de escala. El objetivo declarado es convertir un presupuesto de computo en un presupuesto de parametros mediante las relaciones C = 6ND y D = 20N, derivando de ahi la arquitectura concreta.

El modelo se entreno sobre texto educativo en ingles extraido de FineWeb-Edu (subset sample-10BT) y su interes es fundamentalmente didactico: ilustra como se dimensiona un transformer pequeno a partir de un presupuesto de FLOPs, como se disena un tokenizador BPE a medida y como se evalua un modelo con perplejidad sobre splits propios. No es un modelo pensado para produccion ni para tareas reales de generacion, ya que esta severamente infraentrenado respecto a su objetivo teorico.

Con 14 capas, tamano oculto 640, 10 cabezas de atencion (5 cabezas KV por GQA) y un vocabulario de 16.384 tokens, el modelo se mantiene dentro del rango de 60-100 millones de parametros exigido por el trabajo. Su contexto de entrenamiento es de solo 256 tokens (aunque la configuracion admite 512 posiciones) y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | 74.156.160 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens en entrenamiento; `max_position_embeddings` = 512 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
La arquitectura es un decoder-only denso de estilo Llama con 14 capas, hidden size 640, 10 cabezas de query de dimension 64 y 5 cabezas KV (GQA, dos cabezas de query por cada KV). El MLP usa SwiGLU con tamano intermedio 1728 (aproximadamente 8/3 x H redondeado a multiplo de 64), el vocabulario es de 16.384 tokens con BPE byte-level entrenado solo sobre el split de entrenamiento, y las embeddings de entrada y salida estan atadas (tied). No hay sesgos en atencion ni en MLP. El desglose de parametros es: embeddings compartidas 10.485.760, atencion 17.203.200, SwiGLU 46.448.640 y normalizacion/otros 18.560.

El diseno parte de un presupuesto de computo C = 6,75e+17 FLOPs; con C = 6ND y D = 20N se obtiene C = 120N^2, de donde N = 75.000.000 y D = 1.500.000.000. El modelo real queda en 74,16 M de parametros (dentro del 1,125% del objetivo). Los datos provienen de FineWeb-Edu sample-10BT (Penedo et al., 2024, arXiv:2406.17557), con normalizacion de espacios, deduplicacion exacta por SHA-256, 25.000 documentos unicos y particion train/val/test de 22.500/1.250/1.250 documentos (23,85 M / 1,30 M / 1,24 M tokens empaquetados). El entrenamiento uso una Tesla T4 con bfloat16, pesos maestros en FP32, gradient checkpointing, AdamW (betas 0,9/0,95, weight decay 0,1, grad clipping 1,0), LR pico 3e-4 con 100 pasos de warm-up y decaimiento coseno, batch efectivo de 16 secuencias (4.096 tokens por update) durante 2.000 updates, en 41,1 minutos a 3.319 tokens/s.

La innovacion tecnica destacable no es de rendimiento sino de metodologia: el modelo procesa en la practica solo 8.192.000 tokens de entrada (8.160.000 objetivos puntuados), un 0,552% del objetivo de 1.483.123.200 tokens, lo que supone un computo real de aproximadamente 3,645e+15 FLOPs. El autor lo declara explicitamente infraentrenado respecto a la ley de escala porque el presupuesto completo habria requerido unas 362.091 actualizaciones del optimizador, inviables en una sesion gratuita de Colab.

## Capacidades
- Generacion de texto autoregresiva en ingles a nivel de continuacion de fragmentos muy cortos (256 tokens de contexto).
- Modelado de lenguaje y calculo de perplejidad con su propio tokenizador BPE.
- Razonamiento, codigo, matematicas y vision: no disponibles; el modelo no fue entrenado para estas tareas.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles; solo ingles.
- Capacidades especiales (thinking mode, audio, vision): no disponibles.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio.

## Casos de uso
- Docencia sobre leyes de escala: usar el modelo como ejemplo reproducible de como derivar arquitectura y presupuesto de tokens a partir de C = 6ND y D = 20N, comparando el objetivo teorico con el computo real ejecutado (0,552%).
- Practicas de tokenizacion: entrenar y evaluar tokenizadores BPE byte-level sobre subconjuntos de FineWeb-Edu y medir el impacto del tamano de vocabulario en el reparto de parametros (16.384 vs 50.257 tokens).
- Experimentos de infraentrenamiento: reproducir la curva de perdida con 2.000 updates en una T4 y estudiar como se desvia la perplejidad de validacion (284,38) respecto a la de un modelo entrenado a escala completa.
- Benchmark de referencia para modelos diminutos: servir como linea base de perplejidad (test 286,83) para comparar variantes arquitectonicas con el mismo tokenizador, dataset y procedimiento de evaluacion.
- Pruebas de integracion de pipelines de Hugging Face: validar flujos de `transformers`, `text-generation-inference` y despliegue en endpoints con un checkpoint de 0,3 GB y bajo coste de inferencia.
- Estudio de GQA en modelos pequenos: medir el ahorro de cache KV y de parametros (5.734.400 menos que MHA para esta forma) y su efecto en la perplejidad con recursos limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La evaluacion publicada es de entropia cruzada y perplejidad con el tokenizador propio:

| Evaluacion | Loss (nats/token) | Perplejidad | Tokens puntuados |
|---|---|---|---|
| Antes de entrenar (subset fijo de validacion) | 9,839 | 18.758,5 | 20.400 |
| Split de validacion completo (tras entrenar) | 5,650 | 284,38 | 1.290.300 |
| Split de test completo (held out) | 5,659 | 286,83 | 1.231.395 |

La perplejidad solo es comparable entre modelos que usen el mismo tokenizador, dataset y procedimiento de evaluacion.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GiB en bfloat16 o float16 (74,16 M de parametros, aproximadamente 148 MB de pesos); en float32, unos 300 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso CPU; el entrenamiento se realizo en una Tesla T4 con un pico de 1,55 GiB asignados.
- Cabe holgadamente en GPU consumer y en entornos gratuitos tipo Colab.
- Opciones de despliegue: `transformers`, `text-generation-inference` (segun tags), endpoints compatibles; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles para inferencia; en entrenamiento se alcanzaron 3.319 tokens/s en una T4.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de la misma categoria ni resultados de benchmarks que permitan situarlo frente a alternativas de tamano similar (por ejemplo, modelos tipo GPT-2 small o TinyLlama). Cualquier comparacion cuantitativa requeriria reentrenar o reevaluar los candidatos con el mismo tokenizador y dataset.

## Limitaciones y advertencias
- Modelo severamente infraentrenado: solo proceso 8,19 M de tokens frente a un objetivo de 1.483,12 M (0,552%), por lo que su calidad de generacion es muy limitada.
- Contexto muy corto: 256 tokens en entrenamiento y 512 posiciones maximas en configuracion, insuficiente para conversaciones o documentos largos.
- Solo ingles; no hay capacidades multilingues.
- No dispone de alineacion (RLHF/DPO) ni de instrucciones; no es un modelo de chat.
- Riesgo alto de alucinacion y de texto incoherente en generaciones largas, dado el bajo computo de entrenamiento.
- Sesgos heredados de FineWeb-Edu (texto educativo web filtrado de Common Crawl); no se documenta ninguna evaluacion de sesgos.
- La licencia MIT permite uso comercial, pero el estado del modelo lo hace inadecuado para produccion sin un reentrenamiento sustancial.
- La perplejidad publicada no es comparable con la de otros modelos salvo que se use el mismo tokenizador, dataset y procedimiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/waad12I/fineweb-edu-74m-llama
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de FineWeb-Edu (Penedo et al., 2024): https://arxiv.org/abs/2406.17557
- Paper de leyes de escala (Kaplan et al., 2020): https://arxiv.org/abs/2203.15556
