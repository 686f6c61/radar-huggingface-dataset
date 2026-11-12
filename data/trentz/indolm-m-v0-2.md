# Trentz/IndoLM-M-v0.2

## Resumen

IndoLM-M-v0.2 es un modelo de lenguaje causal en indonesio desarrollado por Trentz, publicado en Hugging Face bajo licencia CC BY-SA 4.0. Se trata de un modelo base de tipo decoder-only GPT entrenado desde cero sobre un corpus propio denominado IndoCorpus-v2.0, con un presupuesto de 4.000 millones de tokens. Su tamaño es de 69.975.680 parámetros (aproximadamente 70 millones), lo que lo sitúa en la categoría de modelos pequeños, aptos para experimentación y despliegue ligero.

El modelo no está afinado para instrucciones ni para diálogo: es un modelo de continuación de texto puro, pensado para investigación y demostraciones en navegador. Su relevancia actual radica en que ofrece una alternativa abierta y reproducible para el indonesio, un idioma con menos recursos que el inglés, con artefactos ONNX listos para inferencia en WebGPU o WASM y una documentación de entrenamiento y evaluación poco habitual en modelos de este tamaño.

La versión 0.2 mantiene la arquitectura, el tokenizer y el contrato de inferencia de la 0.1, pero multiplica por diez el número de tokens únicos de entrenamiento y mejora el bits-per-byte (bpb) en los conjuntos de evaluación held-out. El repositorio incluye únicamente pesos ONNX (fp16 y q4), no checkpoints PyTorch, y advierte explícitamente de que la inferencia en navegador no ha sido verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only GPT con RoPE (theta 10.000), pre-norm RMSNorm, MLP SwiGLU, embeddings input/output atados y sin bias |
| Parametros totales | 69.975.680 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (sin sliding window) |
| Tipos de cuantizacion | ONNX fp16 y ONNX q4 (weight-only MatMulNBits, bloque 32, asimetrico); no se incluye fp32 ni q8 |
| Idiomas soportados | Indonesio (id) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (opset 18); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas, dimensión de modelo 640, 10 cabezas de atención con dimensión de cabeza 64, MLP oculto de 1.728 y vocabulario de 16.384 tokens. Usa RoPE con theta 10.000, RMSNorm pre-norm, activación SwiGLU, embeddings de entrada y salida atados y ninguna bias. El tokenizer es `IndoLM-tok-v0.1`, byte-level BPE, idéntico al de la versión 0.1. La configuración sigue el formato del proyecto IndoLM y no es una configuración estándar de Transformers, por lo que no hay integración `AutoModel` ni garantía de compatibilidad con `pipeline()`.

El entrenamiento se realizó sobre IndoCorpus-v2.0, compuesto por 1.018 millones de tokens de entrenamiento en 1,40 millones de documentos: Wikipedia en indonesio (aproximadamente 19,4%) y FineWeb2 `ind_Latn` (aproximadamente 80,6%). El presupuesto fue de 122.070 pasos de 32.768 tokens, es decir, 4.000 millones de tokens, lo que equivale a unas 3,9 épocas y 57 tokens por parámetro, muy por encima del punto óptimo de Chinchilla. Se usó AdamW en bf16 con `torch.compile` sobre una NVIDIA A100 de 40 GB, con un tiempo de aproximadamente 4 horas y 15 minutos para la ruta de 4.000 millones de tokens. El schedule de learning rate es WSD: 100 pasos de warmup, fase constante a 1e-3 y cooldown con decaimiento 1−sqrt hasta 1e-4 en el 20% final. Se compararon ramas de 1.400, 2.800 y 4.000 millones de tokens, eligiéndose la última por mejor held-out.

## Capacidades

- Generación de texto en indonesio mediante continuación de prompt (modelo base, no instruct).
- Razonamiento y conocimiento factual limitados: el autor advierte de que el modelo inventa con frecuencia hechos, nombres, cifras y noticias.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo thinking.
- Multilingüismo limitado al indonesio; el vocabulario y los datos son específicos de ese idioma.
- Inferencia orientada a navegador mediante ONNX Runtime (WebGPU y WASM como objetivos declarados, no verificados).
- Contrato de inferencia con caché KV explícita (`past_key_i`, `past_value_i`, `present_key_i`, `present_value_i`) para decodificación token a token.

## Casos de uso

- Investigación sobre modelos de lenguaje de bajo recurso: sirve como línea base reproducible para estudiar el efecto del volumen de datos en un idioma concreto, ya que el autor documenta el entrenamiento con tres presupuestos distintos de tokens.
- Demostraciones educativas en navegador: los artefactos ONNX fp16 (WebGPU) y q4 (WASM) permiten experimentar con generación de texto en el cliente sin backend, siempre que se validen previamente los operadores soportados.
- Generación de texto sintético en indonesio para aumento de datos: el modelo puede producir continuaciones de estilo periodístico o enciclopédico, útil para preentrenar o ajustar modelos posteriores, con revisión humana obligatoria por el riesgo de alucinación.
- Experimentos de cuantización: la comparación documentada entre fp16 (Δ bpb −0,000001) y q4 (Δ bpb +0,0077) sobre el mismo conjunto held-out permite estudiar el impacto de la cuantización weight-only en modelos pequeños.
- Evaluación de métricas de lenguaje: el uso de bits-per-byte con intervalos de confianza por bootstrap (2.000 remuestreos) sobre IndoEval-heldout-v2 constituye una referencia metodológica para medir modelos de indonesio.
- Prototipado de autocompletado de texto: con contexto de 1.024 tokens y decodificación por caché KV, puede integrarse en editores o formularios como sugerencia de continuación, aceptando que la calidad es limitada y que no hay filtro de seguridad.
- Reproducción de pipelines ONNX Runtime: el contrato de entrada/salida documentado (opset 18, batch 1, tensores float32 salvo `input_ids` int64) facilita probar el modelo en entornos de inferencia personalizados.

## Benchmarks y rendimiento

Los únicos datos publicados son de bits-per-byte (bpb), donde menor es mejor. No hay evaluaciones downstream de comprensión, razonamiento, sesgo o seguridad.

| Conjunto | v0.2 | v0.1 | Diferencia (IC95) |
|---|---:|---:|---:|
| IndoEval-heldout-v2, 3.387 documentos | 0,9254 | 1,0768 | −0,151 (−0,156 … −0,147) |
| Held-out v2 Wikipedia, 891 documentos | 0,9815 | 1,1466 | −0,165 |
| Held-out v2 FineWeb2, 2.496 documentos | 0,9126 | 1,0609 | −0,148 |
| IndoEval-heldout-v1, 1.707 documentos | 0,9464 | 1,0625 | −0,116 (−0,120 … −0,113) |
| Validation IndoCorpus-v2.0 | 0,9149 | no disponible | no disponible |

| Artefacto ONNX | Tamaño (bytes) | Objetivo | Δ bpb frente a PyTorch fp32 |
|---|---:|---|---:|
| `onnx/model_fp16.onnx` | 140.773.783 | WebGPU (no verificado en navegador) | −0,000001 |
| `onnx/model_q4.onnx` | 80.930.209 | WASM (no verificado en navegador) | +0,0077 |

El delta de cuantización se midió con ONNX Runtime en CPU sobre un subconjunto de 172 documentos de IndoEval-heldout-v1 con bpb de referencia 0,95655. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño de los artefactos, el modelo fp16 ocupa unos 141 MB y el q4 unos 81 MB en disco, y la memoria en ejecución es del mismo orden más las cachés KV (12 capas × 10 cabezas × 64 dimensiones × contexto).
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó en una NVIDIA A100 de 40 GB, pero la inferencia del modelo de 70 millones de parámetros es viable en hardware muy inferior.
- GPU de consumo: por tamaño, cabe en cualquier GPU de consumo moderna e incluso en CPU; no hay cifras oficiales de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime (objetivos WebGPU y WASM declarados, no verificados en navegador). No hay integración con vLLM, llama.cpp, Ollama ni TGI, y el repositorio no incluye checkpoints PyTorch.
- Latencia y throughput: no disponibles; el autor indica que la latencia, la compatibilidad de operadores en navegador y el uso de memoria por dispositivo no se han probado en navegador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Evaluación publicada |
|---|---:|---:|---|---|---|---|
| IndoLM-M-v0.2 | 69.975.680 | 1.024 | Indonesio | CC BY-SA 4.0 | ONNX (fp16, q4) | bpb en IndoEval-heldout-v2 y v1 |
| IndoLM-M-v0.1 | no disponible en la información | 1.024 (mismo contrato) | Indonesio | CC BY-SA 4.0 | no disponible en la información | bpb en IndoEval-heldout-v1 y v2 |
| Otros modelos de indonesio de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos comparables, por lo que la comparativa se limita a la versión anterior del mismo proyecto.

## Limitaciones y advertencias

- No está ajustado a instrucciones ni a chat: los tokens de chat existen en el vocabulario pero no se entrenaron y se enmascaran durante la generación (IDs 1–15).
- Alucinación frecuente: el autor advierte de que el modelo inventa hechos, nombres, cifras y noticias, y de que no debe tomarse su salida como información veraz.
- Ruido en los datos: una auditoría de FineWeb2 en IndoCorpus-v2.0 estima un 17,3% de documentos de mala calidad (IC95 12,1–24,2%), incluidos anuncios, texto SEO, spam y boilerplate periodístico; el modelo puede reproducir ese tipo de contenido.
- Sin filtros de seguridad ni de toxicidad más allá del filtrado del corpus.
- Entrenamiento con una sola semilla y datos repetidos unas 3,9 veces; las afirmaciones de calidad más allá del bpb no están respaldadas por evaluaciones downstream.
- Contexto limitado a 1.024 tokens, sin sliding window.
- Licencia CC BY-SA 4.0: impone atribución y compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones para uso comercial y para modelos derivados.
- El paquete solo incluye ONNX fp16 y q4; no hay checkpoint PyTorch, ONNX fp32 ni ONNX q8, lo que limita la reproducibilidad del entrenamiento y el ajuste fino.
- La inferencia en navegador y los golden tests de navegador no están verificados; el repositorio proporciona artefactos, no un endpoint de inferencia.
- El modelo está destinado a investigación y demostraciones, no a producción, según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Trentz/IndoLM-M-v0.2
- Versión anterior: https://huggingface.co/Trentz/IndoLM-M-v0.1
- Model card de la release fuente: https://github.com/Trenttzzz/indolm/blob/IndoLM-M-v0.2/docs/model_card_IndoLM-M-v0.2.md
- Notas de entrenamiento: https://github.com/Trenttzzz/indolm/blob/IndoLM-M-v0.2/docs/training_notes_v2.0.md
- Repositorio del proyecto: https://github.com/Trenttzzz/indolm
- Dataset Wikipedia (indonesio): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
