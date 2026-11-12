# Trentz/IndoLM-M-v0.2-Instruct

## Resumen

IndoLM-M-v0.2-Instruct es un modelo de lenguaje causal de tipo decoder-only especializado en indonesio, desarrollado por el usuario independiente Trentz. Se trata de la versión con instruction tuning (SFT) del modelo base IndoLM-M-v0.2, con 69.975.680 parámetros y una ventana de contexto de solo 1.024 tokens. Su relevancia radica en ser un experimento reproducible de ajuste por instrucciones sobre un modelo pequeño, con una evaluación honesta y publicada que documenta sus limitaciones de forma explícita.

El modelo se distribuye exclusivamente en formato ONNX (fp16 y q8) pensado para demos en navegador mediante WebGPU y WASM, no para producción. La model card advierte de forma directa que las respuestas suelen ser incorrectas aunque suenen seguras: en su propio conjunto de evaluación solo el 17% de las respuestas son completamente correctas y el 36% son erróneas o inventadas.

Arquitectónicamente es un transformer GPT clásico con RoPE, RMSNorm pre-norm, SwiGLU y embeddings atados, sin ninguna innovación de eficiencia destacable. Su interés es fundamentalmente metodológico y educativo: documenta el pipeline de datos SFT, el filtrado, la descontaminación y una evaluación ciega por LLM con verificación humana parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (RoPE theta 10.000, pre-norm RMSNorm, MLP SwiGLU, embeddings input/output atados, sin bias) |
| Parametros totales | 69.975.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | ONNX fp16 y ONNX q8 (weight-only MatMulNBits 8-bit, bloque 32, asimetrico); no se incluye variante q4 |
| Idiomas soportados | Indonesio (id) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (opset 18); el modelo base en PyTorch esta en Trentz/IndoLM-M-v0.2 |
| Capas | 12 |
| Dimension del modelo | 640 |
| Cabezas de atencion | 10 cabezas x 64 dimensiones |
| Dimension MLP | 1.728 |
| Tokenizer | Byte-level BPE, 16.384 tokens (IndoLM-tok-v0.1) |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only convencional con 12 capas, dimensión oculta de 640, 10 cabezas de atención de 64 dimensiones y MLP de 1.728 con activación SwiGLU. Usa RoPE con theta 10.000, normalización RMSNorm en pre-norm, embeddings de entrada y salida atados y ninguna capa de bias. El tokenizer es un byte-level BPE de 16.384 tokens idéntico al de las versiones v0.1 y v0.2 del modelo base. La ventana de contexto es de solo 1.024 tokens, lo que limita severamente cualquier tarea con documentos largos.

El ajuste por instrucciones se realizó sobre IndoSFT-v0.1, un conjunto de 32.834 ejemplos. De ellos, 30.900 son sintéticos generados con Gemma 4 26B-A4B-it en diez categorías (pregunta-respuesta, explicación, sugerencia de pasos, escritura breve, clasificación, corrección, rechazo, resumen, pregunta sobre texto y extracción), con textos de referencia extraídos de Wikipedia en indonesio. Los 1.934 restantes provienen de Dolly-ID (1.393, traducción automática de databricks-dolly-15k vía Cendol), TyDi QA en indonesio (496) y aya_dataset en indonesio (45, de autoría humana). El filtrado combinó reglas heurísticas (idioma, longitud, duplicados, spam/apuestas), un juez LLM para categorías de riesgo y casos dudosos, verificación por frase de respuestas basadas en texto, deduplicación entre fuentes y descontaminación de 13-gramas contra el conjunto de evaluación, más una auditoría manual por muestreo.

El entrenamiento aplicó pérdida solo sobre los tokens de respuesta y reservó la mitad de cada ventana para texto de preentrenamiento de IndoCorpus-v2.0 (replay al 50%) para mitigar el olvido catastrófico. Se usó learning rate de 2e-4 con decaimiento coseno hasta 1e-5, 3 épocas (1.167 pasos de 32.768 tokens) y precisión bf16. La configuración final se eligió mediante un barrido de 10 ejecuciones con criterios fijados antes de ver los resultados. El formato de chat es de un solo turno, sin system prompt: `<|endoftext|><|user|>{mensaje}<|end|><|assistant|>`, con ids de token 0, 5, 6 y 7 respectivamente.

## Capacidades

- Generación de texto en indonesio con formato de chat de un solo turno.
- Respuesta a preguntas, explicaciones y sugerencias de pasos.
- Resumen de textos de referencia proporcionados en el propio mensaje del usuario.
- Corrección de texto y clasificación.
- Extracción de información a partir de un texto dado.
- Rechazo de peticiones peligrosas (categoría entrenada explícitamente).
- Escritura breve y reformulación.
- Generación con parada controlada en el token `<|end|>` (100% de paradas en el conjunto de evaluación).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta conversaciones multi-turno ni system prompt (no entrenados).
- No soporta visión, audio ni modo de razonamiento explícito.
- No es un traductor: las peticiones de traducción no se entrenaron y suelen fallar.

## Casos de uso

- Demo educativa en navegador: el artefacto q8 (111,6 MB) y el fp16 (140,8 MB) están pensados para ejecutarse vía ONNX Runtime Web con WebGPU o WASM, lo que permite mostrar un asistente en indonesio sin backend. Adecuado para talleres y prototipos de interfaz.
- Investigación sobre ajuste por instrucciones en modelos pequeños: el repositorio documenta el pipeline completo (datos sintéticos, filtrado, descontaminación, barrido de hiperparámetros y evaluación ciega), lo que lo convierte en una referencia reproducible para estudiar cómo se comporta el SFT a escala de 70M de parámetros.
- Estudio de olvido catastrófico: la técnica de replay al 50% con texto de preentrenamiento y la medición de bits-per-byte antes y después (0,9254 a 0,9311 en heldout-v2) ofrecen un caso concreto para analizar la degradación del modelado de lenguaje tras el SFT.
- Evaluación de metodologías de juicio por LLM: el conjunto IndoEval-chat-v0.1 (198 prompts) y el protocolo de verificación humana de 44 veredictos sirven como base para comparar estrategias de evaluación automática en indonesio.
- Tareas de resumen y corrección sobre fragmentos cortos: dado que las categorías de resumen (100% de respuestas buenas) y corrección (83%) son las más sólidas, el modelo puede usarse en prototipos de edición de texto breve siempre que el fragmento quepa en 1.024 tokens y se acepte revisión humana posterior.
- Filtrado y clasificación de texto en pipelines de datos: la categoría de clasificación está entrenada y el modelo cabe en CPU, por lo que puede servir como clasificador ligero de bajo coste en herramientas internas, nunca como fuente de verdad.
- Generación de datos sintéticos a pequeña escala para experimentos: útil para aumentar conjuntos de entrenamiento en indonesio cuando la calidad se valida manualmente y el sesgo hacia respuestas en forma de lista numerada no es un problema.

## Benchmarks y rendimiento

Evaluación sobre IndoEval-chat-v0.1 (198 prompts no vistos en entrenamiento, juicio ciego por LLM, 44 veredictos verificados por el autor con acuerdo 44/44):

| Modelo | Respuestas buenas | Relevantes | Completamente correctas | Erroneas o inventadas | Parada en `<\|end\|>` |
|---|---:|---:|---:|---:|---:|
| IndoLM-M-v0.2-Instruct (SFT) | 63,1% | 86,9% | 17% | 36% | 100% |
| IndoLM-M-v0.2 + 3 ejemplos few-shot | 2,0% | 11,6% | 0% | 95% | no disponible |

- Mejora respecto al modelo base con few-shot: +61,1 puntos porcentuales (IC95% +54,0 a +68,2).
- Por categoría, las más fuertes son resumen (100%) y corrección (83%); las más débiles, pregunta-respuesta factual (39%) y prompts de aya (33%).
- Degradación del modelado de lenguaje: bits-per-byte en IndoEval-heldout-v2 pasa de 0,9254 a 0,9311 (+0,0057); en heldout-v1 de 0,9464 a 0,9521.
- Paridad de los artefactos ONNX frente a PyTorch fp32: fp16 con Δ bpb de −0,000003 y q8 con +0,00002 sobre 172 documentos de IndoEval-heldout-v1 (bpb de referencia 0,96278). En paridad de formato de chat (greedy, 5 prompts fijos), ambos coinciden con PyTorch en 4 de 5; en el quinto divergen tras 48 tokens.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (140,8 MB de pesos) y en torno a 112 MB en q8, más el estado de la caché KV. Con contexto de 1.024 tokens y 12 capas de 10 cabezas de 64 dimensiones, la caché KV es de aproximadamente 1,6 MB por secuencia en fp32.
- GPU recomendadas: cualquier GPU con soporte WebGPU para la demo en navegador; para servidor, GPU de gama baja como T4 o L4 son más que suficientes. No requiere A100 ni H100.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna; también funciona en CPU vía WASM.
- Opciones de despliegue: ONNX Runtime (CPU y Web), ONNX Runtime Web con WebGPU o WASM. No se distribuyen pesos GGUF ni safetensors en este repositorio, por lo que llama.cpp, Ollama, vLLM y TGI no son aplicables directamente sin conversión.
- Latencia y throughput: no disponibles. La model card indica que la inferencia en navegador no está verificada y que el repositorio proporciona artefactos, no un endpoint. Señala además que el archivo WASM es más grande y más lento en CPU que un hipotético q4, que se descartó por divergencia en el chat.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IndoLM-M-v0.2-Instruct | 69,98M | 1.024 | CC BY-SA 4.0 | ONNX fp16/q8 | Este modelo; 17% de respuestas completamente correctas en su propia evaluación |
| IndoLM-M-v0.2 (base) | 69,98M | 1.024 | no disponible en la informacion | PyTorch | Base sin SFT; con few-shot logra 2% de respuestas buenas |
| IndoLM-M-v0.1 | no disponible | 1.024 | no disponible en la informacion | no disponible | Versión anterior de la misma familia, misma arquitectura y tokenizer |
| Gemma 4 26B-A4B-it | 26B (MoE, A4B activos) | no disponible | Apache 2.0 | no disponible | Usado como generador de los datos sintéticos de SFT; no es un competidor directo por tamaño |

No se dispone de datos de benchmarks comparativos frente a otros modelos pequeños en indonesio en la información proporcionada.

## Limitaciones y advertencias

- Fiabilidad factual muy baja: solo el 17% de las respuestas son completamente correctas y el 36% son erróneas o inventadas. Las respuestas incorrectas mantienen un tono seguro y bien formateado, lo que agrava el riesgo de alucinación.
- El conocimiento general es la capacidad más débil; la categoría de pregunta-respuesta factual solo alcanza el 39% de respuestas buenas.
- Ventana de contexto de 1.024 tokens, insuficiente para documentos largos o conversaciones extensas.
- No admite multi-turno ni system prompt: el formato de chat es estrictamente de un solo turno.
- No es un traductor; las peticiones de traducción no se entrenaron y suelen fallar.
- Sesgo de formato: las respuestas tienden a adoptar listas numeradas por imitación de los datos de entrenamiento sintéticos.
- Monolingüe en indonesio; no se ha entrenado ni evaluado en otros idiomas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone compartir-al-igual y atribución sobre las obras derivadas, lo que puede ser incompatible con productos propietarios que no quieran liberar sus adaptaciones.
- La inferencia en navegador no está verificada; los artefactos ONNX se ofrecen sin endpoint y sin garantía de funcionamiento en WebGPU o WASM.
- La variante q4 se descartó porque sus respuestas divergían desde el primer token y no siempre se detenían en `<|end|>`; no debe generarse una sin validar el formato de chat.
- No apto para producción según el propio autor: está destinado a investigación y demos.
- El conjunto de evaluación es pequeño (198 prompts) y el juicio principal lo realiza un LLM, con verificación humana de solo 44 veredictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Trentz/IndoLM-M-v0.2-Instruct
- Modelo base: https://huggingface.co/Trentz/IndoLM-M-v0.2
- Configuración del modelo: https://huggingface.co/Trentz/IndoLM-M-v0.2-Instruct/blob/main/config.json
- Sumas de verificación SHA256: https://huggingface.co/Trentz/IndoLM-M-v0.2-Instruct/blob/main/SHA256SUMS
- Dataset Cendol (Dolly-ID, TyDi QA): https://huggingface.co/datasets/indonlp/cendol_collection_v2
- Dataset aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset TyDi QA: https://huggingface.co/datasets/google-research-datasets/tydiqa
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Wikipedia en indonesio: https://huggingface.co/datasets/wikimedia/wikipedia
