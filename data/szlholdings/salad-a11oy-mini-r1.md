# SZLHOLDINGS/salad-a11oy-mini-r1

## Resumen

salad-a11oy-mini-r1 es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No se trata de un modelo preentrenado desde cero, sino de un fine-tuning ligero cuyo repositorio ocupa 0,4 GB y contiene 29 archivos de pesos junto con 65 archivos auxiliares (assets gráficos, scripts del generador de la model card y material de trazabilidad). El autor lo presenta como parte de su "SZL estate", una infraestructura de entrenamiento sobre GPU propia (SaladCloud) que registra cada evento del proceso con recibos SHA-256 publicados en un dataset público de trazabilidad.

El modelo resuelve un problema muy acotado: demostrar un pipeline de entrenamiento verificable ("receipts at birth") sobre una GPU consumer, en este caso una NVIDIA GeForce RTX 3090 Ti, con telemetría de pérdida, precisión de tokens y checkpoints publicados. La relevancia práctica para terceros es limitada: no hay model card funcional, ni evaluación, ni especificación de datos, ni pipeline declarado, y la licencia es "other" sin texto asociado. Debe tratarse como un artefacto experimental de trazabilidad más que como un modelo listo para producción.

La información disponible no permite determinar el tamaño exacto del adaptador, la composición del corpus de entrenamiento ni las capacidades resultantes. El modelo base subyacente, Qwen2.5-0.5B-Instruct, es un transformer decoder-only de 0,5 mil millones de parámetros con 32.768 tokens de contexto, licencia Apache 2.0 y soporte multilingüe, pero esas características pertenecen al base y no se han verificado en este adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PEFT (LoRA) sobre Qwen/Qwen2.5-0.5B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA; el base tiene ~0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el base Qwen2.5-0.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (repositorio solo con safetensors del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado en la informacion disponible) |
| Formato de pesos | safetensors (adaptador PEFT); 29 archivos de pesos en el repositorio |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. El repositorio no incluye configuración del adaptador (rango, alpha, módulos objetivo) ni tokenizer, lo que impide reconstruir la arquitectura exacta del fine-tuning a partir de los archivos publicados. El tamaño del repo (0,4 GB) es coherente con un adaptador de bajo rango más assets, pero no se especifica la dimensión.

El entrenamiento se ejecutó en una RTX 3090 Ti con el corpus SZLHOLDINGS/a11oy-verifiable-corpus, según la run card. Se registraron 203 pasos sobre un objetivo de 200, con pérdida que descendió de 2,393 a 0,903 y precisión de tokens de 0,462 a 0,768, medidas sobre 20 puntos de log. El throughput aproximado fue de ~12,9k tokens/s. No se reporta el número total de tokens vistos, la composición del corpus, ni si hubo RLHF, DPO o alguna fase de alineamiento posterior. La model card indica explícitamente "Tokens seen: not reported" y "Training provenance: not independently verifiable from this repository". La duración declarada del entrenamiento ("training complete in 1.8s") es inconsistente con 203 pasos y con la propia línea temporal de recibos, que abarca unos 17 minutos, por lo que debe interpretarse como un dato no fiable.

## Capacidades

- Generación de texto: heredada del base Qwen2.5-0.5B-Instruct, no verificada en el adaptador.
- Razonamiento y matemáticas básicas: presumibles por el base, sin evaluación publicada.
- Generación de código: presumible por el base, sin evaluación publicada.
- Tool calling / function calling: el base Qwen2.5-Instruct lo soporta; no confirmado en este adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Multilingüismo: no disponible (el campo de idiomas del repo está vacío).
- Modo thinking, visión o audio: no disponible.
- Trazabilidad de entrenamiento: el artefacto incluye una cadena de recibos SHA-256 y un generador de model card reproducible (`card_src/salad_card_builder.py`), que es su rasgo diferencial respecto a un fine-tuning convencional.

## Casos de uso

- Auditoría de pipelines de entrenamiento: el repositorio sirve como ejemplo de registro verificable de eventos (inicio de worker, checkpoints, finalización) con digests SHA-256 encadenados, útil para equipos que diseñan sistemas de procedencia de modelos.
- Investigación sobre fine-tuning LoRA de bajo coste: permite estudiar la curva de pérdida y precisión de tokens de un ajuste sobre Qwen2.5-0.5B en una GPU consumer, aunque sin acceso a los hiperparámetros completos.
- Pruebas de reproducibilidad de model cards: el script `salad_card_builder.py` incluido permite regenerar la documentación y comparar recibos, como ejercicio de transparencia documental.
- Prototipado educativo: cargar el adaptador sobre el base para experimentar con PEFT en entornos con poca VRAM, siempre que se acepte la ausencia de evaluación.
- Verificación de integridad de artefactos: usar la cadena de recibos para comprobar que los pesos publicados corresponden a los checkpoints registrados.
- No se recomienda su uso en aplicaciones de producción orientadas a usuario final: no hay evaluación, ni especificación de idiomas, ni licencia clara para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "Eval battery receipt: none in this repository. No evaluation result, benchmark, or model-index metric is claimed in this edit." Los únicos datos medidos son los de entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida (primer -> último log, n=20) | 2,393 -> 0,903 |
| Precisión de tokens (primer -> último log) | 0,462 -> 0,768 |
| Throughput aproximado | ~12,9k tokens/s |
| Pasos completados | 203 / 200 |
| GPU de entrenamiento | NVIDIA GeForce RTX 3090 Ti |

## Requisitos de hardware

- VRAM para inferencia: no determinada para el adaptador; el base Qwen2.5-0.5B-Instruct en fp16 requiere aproximadamente 1 GB de pesos más overhead de activaciones y KV cache, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el base en fp16; para cuantización 4-bit, GPUs con 2-3 GB como GTX 1650 o superiores.
- Cabe en GPU consumer: sí, tanto el base como el adaptador, dado el tamaño del modelo subyacente.
- Opciones de despliegue: el adaptador PEFT se carga con la librería `peft` sobre transformers; para servir en producción habría que fusionarlo con el base y exportarlo a GGUF para llama.cpp/Ollama o servirlo con vLLM/TGI tras la fusión. No se documenta ninguno de estos flujos en el repositorio.
- Latencia y throughput: no disponibles para inferencia; solo se reporta throughput de entrenamiento (~12,9k tokens/s en RTX 3090 Ti).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salad-a11oy-mini-r1 (este) | adaptador LoRA sobre 0,5B | no disponible | ninguna | other | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens | benchmarks publicados por Qwen | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | benchmarks publicados por Qwen | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | benchmarks publicados | Apache 2.0 | Hugging Face |

La comparación directa es difícil porque el artefacto es un adaptador sin evaluación. Frente al base, la única diferencia documentada es el fine-tuning sobre un corpus privado no descrito. Frente a alternativas como Qwen2.5-1.5B-Instruct o TinyLlama, carece de benchmarks, de licencia clara y de soporte de la comunidad (0 descargas, 0 likes).

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni batería de probes ejecutada, ni model-index; el autor lo declara explícitamente.
- Licencia "other" sin texto: no se puede determinar si el uso comercial está permitido; contactar con el autor antes de cualquier despliegue.
- Idiomas no declarados: el campo de idiomas del repositorio está vacío, por lo que no se garantiza soporte multilingüe más allá del que herede del base.
- Procedencia no verificable: la propia model card reconoce que "training provenance: not independently verifiable from this repository".
- Datos de entrenamiento inconsistentes: la duración declarada ("1.8s") contradice la línea temporal de recibos y el número de pasos, lo que resta credibilidad a la telemetría.
- Riesgo de alucinación: heredado del base de 0,5B, que es propenso a errores factuales; el adaptador no documenta mitigaciones.
- Sesgos: no evaluados; el corpus de entrenamiento no está descrito, por lo que no se pueden identificar sesgos específicos.
- Sin configuración ni tokenizer en el repo: dificulta la reproducibilidad y la carga directa del adaptador.
- Sin soporte de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay issues ni discusión pública.
- No apto para producción: por las limitaciones anteriores, debe tratarse como artefacto experimental.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/SZLHOLDINGS/salad-a11oy-mini-r1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de corpus citado: https://huggingface.co/datasets/SZLHOLDINGS/a11oy-verifiable-corpus
- Dataset de cadena de recibos citado: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Script generador de la model card: incluido en el repo en `card_src/salad_card_builder.py` (no se ha localizado URL pública independiente)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
