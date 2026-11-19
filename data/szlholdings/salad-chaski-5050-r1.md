# SZLHOLDINGS/salad-chaski-5050-r1

## Resumen

`salad-chaski-5050-r1` es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. No se trata de un modelo fundacional ni de un fine-tuning completo: el repositorio contiene únicamente pesos de adaptador en formato safetensors (1,1 GB, 17 ficheros de pesos) y no incluye ficheros de configuración ni de tokenizer, por lo que para utilizarlo es necesario cargar por separado el modelo base Qwen2.5-0.5B-Instruct y aplicar el adaptador con la librería `peft`.

El interés del artefacto no reside en sus capacidades lingüísticas —el modelo base es un transformer denso de 0,5 mil millones de parámetros, con un contexto de 32 768 tokens según la ficha oficial de Qwen2.5— sino en la infraestructura de trazabilidad que lo rodea. La model card documenta un pipeline de entrenamiento alojado en SaladCloud sobre una NVIDIA GeForce RTX 3090, con 200 pasos completados, una pérdida que desciende de 2,153 a 0,722 y una precisión de token media que pasa de 0,524 a 0,774, todo ello acompañado de un registro de recibos SHA-256 por evento (inicio de worker, checkpoint, finalización) publicado en el dataset `SZLHOLDINGS/frontier-54-runs`.

La relevancia actual es, por tanto, metodológica: el autor propone una doctrina de "recibos al nacer" (*receipts at birth*) y reporte *fail-closed*, en la que ningún número se estima y toda métrica no medida se declara explícitamente como UNMEASURED. Es un ejemplo de model card auto-verificable, pero conviene subrayar que el adaptador en sí no ha sido evaluado: la batería de seis pruebas que aparece en la ficha corresponde a otro artefacto (`SZLHOLDINGS/chaski-5050-v2-trained`), no a este lane r1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-0.5B-Instruct); el repositorio contiene un adaptador PEFT/LoRA |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct tiene 0,49 B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en el repositorio; el modelo base Qwen2.5-0.5B-Instruct soporta 32 768 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos de adaptador en safetensors) |
| Idiomas soportados | No disponible en el repositorio; el modelo base Qwen2.5 es multilingüe (chino, inglés y otros) |
| Licencia | `other` (etiqueta literal observada; no se especifican términos adicionales) |
| Formato de pesos | safetensors (adaptador PEFT, 17 ficheros de pesos) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atención causal estándar, RoPE y normalización RMSNorm, tal como corresponde a la familia Qwen2.5. El repositorio no incluye `config.json` ni `tokenizer.json`, lo que confirma que se trata exclusivamente de pesos delta LoRA: la arquitectura efectiva en inferencia es la del modelo base con los adaptadores fusionados o cargados en paralelo.

El entrenamiento se ejecutó en una sola GPU NVIDIA GeForce RTX 3090 (identificador de nodo `f01cd07b-938f-47a8-8110-a9c63d1e0e80`) sobre el corpus `SZLHOLDINGS/governed-sft-mix-v2`, con 200 pasos planificados y completados. La telemetría reportada incluye 20 puntos de log medidos: pérdida de 2,153 a 0,722 y precisión de token de 0,524 a 0,774, con un throughput aproximado de 3,8 k tokens/s medido a partir de intervalos de tqdm. El número total de tokens vistos no se reporta. No se documenta uso de RLHF, DPO ni ninguna innovación arquitectónica; la innovación declarada es de proceso (recibos criptográficos por evento y curva de pérdida verificable). El registro muestra varios reinicios de worker y reanudaciones desde `global_step=200`, lo que sugiere una orquestación con reintentos más que un entrenamiento continuo ininterrumpido.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento aritmético básico y respuesta a preguntas factuales simples (el modelo base acierta preguntas como la capital de Francia o 17 × 23, según la batería citada para el artefacto v2, no para este adaptador).
- Soporte de chat multi-turno mediante el formato de plantilla de Qwen2.5 (la plantilla no se incluye en el repositorio; debe tomarse del modelo base).
- Capacidades multilingües limitadas al modelo base; no se documenta ningún refuerzo idiomático específico en este adaptador.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión ni audio en el repositorio.
- El adaptador está pensado para el ajuste de estilo o dominio sobre el corpus `governed-sft-mix-v2`; sus capacidades diferenciales respecto al base no están evaluadas.

## Casos de uso

- Experimentación con PEFT en local: cargar Qwen2.5-0.5B-Instruct y aplicar el adaptador con `peft` para estudiar cómo un SFT breve (200 pasos) modifica el comportamiento del base en dominios concretos; el tamaño de 1,1 GB permite hacerlo en un portátil con GPU de 8 GB.
- Auditoría de pipelines de entrenamiento: el repositorio sirve como caso de estudio de trazabilidad, con recibos SHA-256 por checkpoint e inicio de worker que pueden verificarse contra el dataset público `SZLHOLDINGS/frontier-54-runs`.
- Reproducción de curvas de pérdida: los 20 puntos de log publicados permiten contrastar la implementación de un entrenador propio contra la telemetría del autor (pérdida 2,153 → 0,722).
- Docencia sobre fine-tuning responsable: el contraste entre métricas medidas y secciones marcadas como UNMEASURED es un ejemplo útil para enseñar a distinguir afirmaciones verificables de estimaciones.
- Generación de texto ligera en entornos con recursos muy limitados: al heredar el tamaño del base (0,5 B), puede ejecutarse en CPU o en GPU de gama baja para tareas de clasificación o respuesta breve, siempre que se acepte su calidad limitada.
- Base para un segundo ciclo de SFT: el adaptador puede servir como punto de partida para experimentos posteriores de ajuste sobre el mismo corpus, dado que el checkpoint final está publicado y el estado de entrenamiento es reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este adaptador. La model card incluye una batería de seis pruebas (tres respondibles, tres no respondibles) con puntuación 4/6, pero el propio autor aclara que el recibo corresponde al modelo `SZLHOLDINGS/chaski-5050-v2-trained` y no a este lane r1, y que "no se transfiere ninguna puntuación". Por tanto, no se reproduce aquí como resultado de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en safetensors ocupa 1,1 GB; el modelo base en fp16 requiere aproximadamente 1 GB adicional, por lo que en fp16 el conjunto cabe en torno a 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento reportado se realizó en una RTX 3090, y la batería citada (de otro artefacto) en una RTX A6000.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU con llama.cpp u Ollama si se convierte el modelo fusionado a GGUF.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa del repositorio), vLLM y TGI tras fusionar el adaptador con el base (`merge_and_unload`), llama.cpp u Ollama tras conversión a GGUF.
- Latencia y throughput: el autor reporta ~3,8 k tokens/s durante el entrenamiento en una RTX 3090; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| salad-chaski-5050-r1 (este) | Adaptador sobre base de 0,49 B | No especificado (base: 32 768) | safetensors PEFT | `other` | Sin evaluación publicada; foco en trazabilidad |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32 768 | safetensors, GGUF | Apache 2.0 | Modelo base; evaluación oficial publicada por el autor |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 | safetensors, GGUF | Apache 2.0 | Alternativa de mayor capacidad y misma familia |
| SmolLM2-360M-Instruct | 0,36 B | 8 192 | safetensors, GGUF | Apache 2.0 | Alternativa de tamaño comparable para entornos muy limitados |

## Limitaciones y advertencias

- El repositorio no incluye `config.json` ni tokenizer: es imprescindible cargar el modelo base Qwen2.5-0.5B-Instruct por separado y aplicar el adaptador con `peft`; no es un modelo autónomo.
- No hay evaluación publicada de este adaptador; la puntuación 4/6 de la batería corresponde a otro artefacto y no debe atribuirse a este modelo.
- La licencia es `other` sin términos explícitos en la información disponible: antes de cualquier uso comercial es necesario contactar con el autor para aclarar condiciones.
- Riesgo de alucinación elevado por el tamaño del base (0,49 B) y por un SFT de solo 200 pasos; no es adecuado para tareas que exijan precisión factual alta.
- El corpus de entrenamiento (`governed-sft-mix-v2`) no está descrito en detalle, por lo que se desconocen sesgos introducidos y composición lingüística.
- El registro de entrenamiento muestra reinicios y reanudaciones desde `global_step=200`, lo que puede implicar estados parciales en los checkpoints intermedios.
- No se documenta soporte de tool calling, agentes ni contexto largo efectivo más allá del que ofrezca el base.
- El número de tokens vistos no se reporta, lo que impide estimar la intensidad real del ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-chaski-5050-r1
- Dataset de recibos de la cadena: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Corpus de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/governed-sft-mix-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Artefacto de la batería citada: https://huggingface.co/SZLHOLDINGS/chaski-5050-v2-trained
