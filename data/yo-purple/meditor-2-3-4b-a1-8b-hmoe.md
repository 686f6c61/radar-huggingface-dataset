# Yo-Purple/Meditor-2-3.4B-A1.8B-HMoE

## Resumen

Meditor-2-3.4B-A1.8B-HMoE es un modelo de generacion de texto desarrollado por Yo-Purple que implementa una arquitectura nativa de mezcla de expertos jerarquica (Hierarchical Mixture-of-Experts, HMoE) sobre el backbone SmolLM2-1.7B-Instruct de Hugging Face. El modelo parte del checkpoint instructivo de 1,7 mil millones de parametros y lo extiende con un nucleo denso compartido mas un enrutamiento jerarquico de dos niveles: tres enrutadores de dominio macro que dirigen a cinco sub-expertos cada uno, sumando 15 especialistas enrutados con activacion top-1. El resultado son 3,41 mil millones de parametros totales con aproximadamente 1,83 mil millones activos por token.

La propuesta del modelo es explorar enrutamiento jerarquico por dominio sobre un backbone pequeno, buscando mejorar la calidad conversacional y de sintesis sin disparar el coste de inferencia activa. Es la segunda generacion de la serie Meditor y se presenta como la variante "nativa", es decir, con codigo de modelado propio (tag `custom_code`) en lugar de apoyarse en la implementacion estandar `Qwen2MoeForCausalLM` que usa la variante Universal de la misma generacion.

El modelo es relevante para quienes investigan arquitecturas MoE de bajo coste y para desarrolladores que quieran experimentar con enrutamiento jerarquico en GPUs de consumo. No obstante, sus resultados publicados en UniBench-100 son modestos (media de 3,28 sobre 10 en una evaluacion parcial de 37 de 100 preguntas), y el autor reporta mejores cifras para la variante Universal de la misma generacion, lo que conviene tener en cuenta al elegirlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con HMoE (Hierarchical Mixture-of-Experts): nucleo denso compartido + 3 enrutadores de dominio macro x 5 sub-expertos = 15 especialistas enrutados, activacion top-1 |
| Parametros totales | 3.410.955.032 (3,41B) |
| Parametros activos | ~1,83B (A1.8B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para esta variante nativa (la variante Universal de la misma generacion ofrece BF16 y GGUF Q4_K_M) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo se construye sobre SmolLM2-1.7B-Instruct, un transformer decoder-only, y le anade un esquema de mezcla de expertos jerarquico. La jerarquia consta de tres enrutadores macro que seleccionan un dominio y, dentro de cada dominio, cinco sub-expertos; con activacion top-1 por token, solo un especialista se activa en cada paso. Este diseno busca especializacion por dominio manteniendo un coste computacional cercano al de un modelo denso de ~1,8B. El repositorio requiere codigo personalizado de modelado (tag `custom_code`), por lo que no se carga con una clase estandar de transformers sin confiar en el codigo remoto del autor.

Los detalles de entrenamiento no estan disponibles en la informacion proporcionada: no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT adicionales sobre el checkpoint base. El modelo base declarado es HuggingFaceTB/SmolLM2-1.7B-Instruct, un modelo ya alineado para instrucciones, del que hereda el comportamiento conversacional. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste instructivo de SmolLM2-1.7B-Instruct.
- Razonamiento y sintesis de respuestas abiertas, evaluado en el conjunto UniBench-100 (100 preguntas abiertas en 10 dominios cognitivos).
- Especializacion por dominio mediante enrutamiento jerarquico: los sub-expertos se activan segun el dominio macro detectado.
- Capacidad de responder preguntas de sentido comun tipo ARC (evaluado en un subconjunto de 12 preguntas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion en arquitecturas MoE: el modelo sirve como banco de pruebas para estudiar enrutamiento jerarquico de dos niveles (3 dominios x 5 sub-expertos, top-1) sobre un backbone de 1,7B, comparando su comportamiento con la variante Universal y con modelos densos equivalentes.
- Generacion de texto conversacional en ingles de bajo coste: con ~1,83B parametros activos, puede desplegarse en GPUs de consumo para prototipos de chatbots donde no se requiera alta precision.
- Evaluacion comparativa de generaciones: util para reproducir las curvas de progresion de la serie Meditor en UniBench-100 y entender el impacto del enrutamiento nativo frente al estandar.
- Experimentos de sintesis abierta: el modelo esta evaluado en tareas de sintesis de respuesta abierta en 10 dominios cognitivos, por lo que encaja en pipelines de generacion de borradores y resumenes exploratorios.
- Fine-tuning sobre dominios especificos: al ser Apache 2.0 y tener un backbone conocido (SmolLM2), puede adaptarse con SFT a tareas concretas conservando la estructura HMoE.
- Docencia y divulgacion tecnica: ejemplo practico para explicar diferencias entre MoE estandar, MoE universal y HMoE nativo, con metricas publicadas de cada variante.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| UniBench-100 (Native 37Q Partial) | Native Mean Score (37/100) | 3,28 / 10 |
| UniBench-100 (Native 37Q Partial) | Native Pass Rate (>=6,0) | 8,1 % |
| ARC Commonsense (12Q) | Accuracy | 100 % |
| WikiText-2 Validation | Perplexity | 3,48 |

Comparativa dentro de la serie Meditor (datos del autor, UniBench-100):

| Modelo | Parametros (total / activos) | UniBench-100 media | Pass rate | Notas |
|---|---|---|---|---|
| Meditor-3-4B-MoE | 4,16B / 4,04-4,07B | 7,31 (100/100) | 69,0 % | Rank #1 de 36 runs |
| Meditor-2 Universal (BF16) | 3,41B / 1,83B | 4,12 (100/100) | 22,0 % | Mejor run de Meditor 2 |
| Meditor-2 Native HMoE (este modelo) | 3,41B / 1,83B | 3,28 (37/100) | 8,1 % | Evaluacion parcial |
| Meditor-1 Universal (BF16) | 0,49B / 0,49B | 2,42 (100/100) | 1,0 % | Generacion anterior |

El autor reporta una velocidad de evaluacion de 48,7 tok/s para este run nativo, frente a 27,5 tok/s de la variante Universal BF16 y 141,2 tok/s de la Universal Q4_K_M.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 6,42 GB segun la tabla del autor para esta generacion (3,41B parametros a 16 bits).
- VRAM estimada en cuantizacion de 4 bits: no disponible para esta variante nativa; la variante Universal Q4_K_M ocupa 6,38 GB segun el autor (incluye overhead).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o una A100/H100 son suficientes; tambien cabria en GPUs de 8-12 GB en cuantizacion, aunque esta variante no publica GGUF.
- Cabe en GPU de consumo: si, en BF16 en tarjetas con al menos 8 GB de VRAM efectiva (con margen para contexto y overhead).
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `custom_code`). vLLM, llama.cpp, Ollama y TGI no estan confirmados para esta variante nativa; para GGUF y `Qwen2MoeForCausalLM` el autor remite a la variante Universal.
- Latencia y throughput: 48,7 tok/s reportados por el autor durante la evaluacion nativa.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | UniBench-100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meditor-2-3.4B-A1.8B-HMoE | 3,41B / ~1,83B | no disponible | 3,28 (37/100) | Apache 2.0 | HF, transformers con custom_code |
| Meditor-2-3.4B-Universal | 3,41B / ~1,83B | no disponible | 4,12 (100/100) | Apache 2.0 | HF, `Qwen2MoeForCausalLM`, GGUF |
| Meditor-3-4B-MoE | 4,16B / 4,04-4,07B | no disponible | 7,31 (100/100) | no disponible | HF |
| SmolLM2-1.7B-Instruct (base) | 1,7B denso | no disponible | no evaluado en UniBench-100 | Apache 2.0 | HF, ampliamente soportado |

La comparativa se limita a la propia familia Meditor y al modelo base, ya que la informacion proporcionada no incluye resultados de benchmarks de terceros (MMLU, HumanEval, GSM8K) para situar el modelo frente a alternativas externas de tamano similar.

## Limitaciones y advertencias

- Evaluacion parcial: los resultados de UniBench-100 para esta variante cubren solo 37 de 100 preguntas, por lo que no son directamente comparables con los runs de 100/100 de otras variantes.
- Rendimiento inferior a la variante Universal de la misma generacion (3,28 frente a 4,12), pese a compartir parametros totales y activos.
- Pass rate bajo (8,1 %) en la evaluacion nativa, lo que indica dificultad para superar el umbral de calidad de 6,0 en respuestas abiertas.
- Solo ingles: la metadata declara unicamente `en`, sin capacidades multilingues documentadas.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.
- Sin formatos GGUF ni cuantizaciones publicadas para esta variante, lo que limita el despliegue en entornos ligeros (llama.cpp, Ollama, LM Studio).
- Riesgo de alucinacion: no documentado por el autor; como modelo pequeno (1,83B activos), es esperable en tareas de conocimiento factual.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base SmolLM2 tambien es Apache 2.0; no se declaran restricciones adicionales.
- Longitud de contexto no publicada, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-A1.8B-HMoE
- Variante Universal de la misma generacion: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Meditor 1 (Native MoE): https://huggingface.co/Yo-Purple/Meditor-1-2.2B-A500M-MoE
- Meditor 1 (Universal): https://huggingface.co/Yo-Purple/Meditor-1-500M-Universal
- Meditor 3 (Native MoE): https://huggingface.co/Yo-Purple/Meditor-3-4B-MoE
- Meditor 3 (Universal GGUF): https://huggingface.co/Yo-Purple/Meditor-3-4B-Universal
- Modelo base SmolLM2-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
