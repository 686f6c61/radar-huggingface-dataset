# VertexResearch/Vertex-0.6-5M-Base

## Resumen

Vertex-0.6-5M-Base es el checkpoint base (solo preentrenamiento) del modelo mas pequeno de la familia Vertex 0.6, desarrollado por VertexResearch. Con 4.771.392 parametros, es un modelo de lenguaje de arquitectura Llama disenado como experimento de investigacion sobre escalado de modelos diminutos, efectos del tokenizador y ratios embedding-cuerpo, no como herramienta de produccion. Se entrena desde cero sobre 500 millones de tokens de texto web en ingles.

El modelo emplea una arquitectura transformer tipo `LlamaForCausalLM` con 9 capas, hidden de 192, 3 cabezas de atencion (sin GQA), MLP SwiGLU con intermedio 512 y un vocabulario reducido de 4096 tokens ByteLevel BPE con embeddings atados. Su ventana de contexto es de solo 512 tokens y los pesos se distribuyen en bfloat16, ocupando aproximadamente 9,5 MB.

Es relevante ahora como banco de pruebas reproducible y de bajo coste: el entrenamiento completo se ejecuto en 54 minutos sobre un unico Apple M5 Pro con 24 GB de memoria unificada usando MLX, a unas 150k tokens/s. Su interes es metodologico (escalado de modelos tiny, tokenizadores, smoke-test de motores de inferencia), no funcional: no tiene instruccion tuning, no recuerda hechos y no es apto para uso en produccion ni de cara al usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `LlamaForCausalLM` |
| Parametros totales | 4.771.392 (0,79M embeddings + 3,98M transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible en la model card; pesos en bfloat16; convertible a GGUF con llama.cpp |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), tokenizer.json, config.json, generation_config.json |

Detalles adicionales de arquitectura: 9 capas, hidden 192, 3 cabezas (head_dim 64, sin GQA), MLP SwiGLU con intermedio 512, RMSNorm con eps 1e-5 y pre-norm, RoPE con theta 10000 y emparejamiento rotate-half, vocabulario de 4096 tokens ByteLevel BPE con embeddings de entrada/salida atados. El token id 0 es `<|endoftext|>` (separador de documentos en preentrenamiento y token de parada en inferencia). El embedding se mantiene pequeno a proposito (16 % de los parametros) para concentrar capacidad en los bloques transformer.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar con layout Llama, sin innovaciones de atencion (atencion completa, no lineal ni hibrida) y sin componentes MoE. La unica decision de diseno destacable es el vocabulario muy reducido (4096 tokens) y el bajo ratio de parametros en embeddings, orientado a estudiar el reparto de capacidad entre embedding y cuerpo del transformer en regimenes de escala diminuta.

El entrenamiento consta de dos fases sobre 500M tokens en ingles, cada token visto una sola vez: 450M tokens de openbmb/Ultra-FineWeb (web en ingles) y 50M tokens de openbmb/Ultra-FineWeb-L3 (reescrituras sinteticas Multi-Style y QA) como fase corta de annealing final. Esto equivale a unas 105 tokens por parametro. Se uso MLX con computo bf16 y pesos maestros fp32, AdamW con lr 3e-3 con decaimiento coseno hasta 3e-4, 300 pasos de warmup, weight decay 0.1 y clipping 1.0, batch de 64 x 512 tokens (32k tokens/paso) durante 15.258 pasos. No se menciona RLHF, DPO ni ninguna fase de alineacion. El hardware fue un unico Apple M5 Pro (24 GB de memoria unificada) a ~150k tokens/s, con un tiempo total de 54 minutos.

## Capacidades

- Generacion de texto en ingles a nivel de frase: gramatica y puntuacion correctas.
- Adaptacion al registro del prompt (carta formal, nota de prensa, guia practica).
- Coherencia tematica limitada a aproximadamente una frase (15-20 tokens).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta modo thinking, vision ni audio.
- No sigue instrucciones (es un checkpoint base sin chat template ni instruction tuning).
- No escribe codigo de forma fiable.
- No recupera hechos: fechas, nombres y numeros son inventados.

## Casos de uso

- Investigacion sobre escalado de modelos tiny: permite reproducir experimentos de leyes de escalado a muy baja escala con un coste de computo minimo (54 minutos en hardware de consumo).
- Estudio de tokenizadores: su vocabulario de 4096 tokens ByteLevel BPE sirve para analizar el impacto del tamano de vocabulario en la perplejidad y en el reparto de parametros.
- Analisis del ratio embedding-cuerpo: con un 16 % de parametros en embeddings, es un punto de datos concreto para estudiar como afecta ese reparto a la calidad del modelo.
- Smoke-test de motores de inferencia: al ser un modelo Llama estandar de 9,5 MB, se puede usar para validar pipelines de transformers, TGI, llama.cpp u Ollama antes de desplegar modelos mayores.
- Validacion de conversion a GGUF: su layout Llama permite probar `convert_hf_to_gguf.py` y verificar el flujo de cuantizacion con un modelo que cabe en cualquier dispositivo.
- Docencia y divulgacion: ejemplo practico y ejecutable en CPU para explicar el funcionamiento interno de un transformer decoder-only, RoPE, RMSNorm y embeddings atados.
- Pruebas de infraestructura de evaluacion: modelo de referencia para comprobar que un arnes de evaluacion de cross-entropy y perplejidad funciona correctamente antes de aplicarlo a modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta cross-entropy y perplejidad sobre texto retenido con el vocabulario propio de 4096 tokens:

| Split | Loss (nats) | PPL | Bits/token |
|---|---|---|---|
| Ultra-FineWeb, shard no visto | 3,29 | 26,8 | 4,74 |
| Ultra-FineWeb, shard de entrenamiento | 3,31 | 27,4 | 4,77 |
| Ultra-FineWeb-L3 QA | 2,80 | 16,4 | 4,03 |
| Ultra-FineWeb-L3 Multi-Style | 2,96 | 19,3 | 4,27 |

La perdida en datos retenidos y en datos de entrenamiento es practicamente identica, lo que indica que no hay memorizacion. Los valores mas bajos en L3 reflejan que el texto sintetico es mas predecible, no que el modelo sea mejor en esa tarea. No hay comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,5 MB en bf16; en la practica, cualquier dispositivo con unos pocos cientos de MB libres puede ejecutarlo.
- GPU recomendadas: no requiere GPU; funciona comodamente en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090, RTX 3060 o integradas) es mas que suficiente.
- Cabe en GPU consumer: si, con enorme margen, en cualquier GPU consumer actual e incluso en moviles o sistemas embebidos.
- Opciones de despliegue: transformers (referencia en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles, y conversion a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no se reportan cifras de inferencia. Durante el entrenamiento se alcanzaron ~150k tokens/s en un Apple M5 Pro con MLX; la inferencia en CPU sera de baja latencia dado el tamano del modelo, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia interna de la misma familia, la model card menciona:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Vertex-0.6-5M-Base | 4,77M | 512 | Apache 2.0 | Base, disponible |
| Vertex-0.6-15M-Base | no disponible | no disponible | Apache 2.0 (presumible) | Base, disponible |
| Vertex-0.6-100M-8192-ctx-Base | no disponible | 8192 (segun nombre) | Apache 2.0 (presumible) | Base, disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos ni con alternativas de otros autores.

## Limitaciones y advertencias

- Alucinacion sistematica: inventa fechas, nombres, numeros y hechos; no tiene conocimiento factual.
- Coherencia muy limitada: pierde el hilo pasado 15-20 tokens.
- No sigue instrucciones ni admite chat template; es un checkpoint base sin alineacion.
- No escribe codigo de forma fiable.
- Ventana de contexto muy corta (512 tokens).
- Solo ingles; no hay soporte multilingue.
- Sesgos: al entrenarse sobre texto web en ingles, hereda los sesgos presentes en Ultra-FineWeb y Ultra-FineWeb-L3; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara explicitamente que no es apto para produccion ni para uso de cara al usuario.
- No hay datos publicados de cuantizacion ni de rendimiento en inferencia; la conversion a GGUF es posible pero no esta validada en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexResearch/Vertex-0.6-5M-Base
- Modelo hermano Vertex-0.6-15M-Base: https://huggingface.co/VertexResearch/Vertex-0.6-15M-Base
- Modelo hermano Vertex-0.6-100M-8192-ctx-Base: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-ctx-Base
- Dataset de preentrenamiento Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset de annealing Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
