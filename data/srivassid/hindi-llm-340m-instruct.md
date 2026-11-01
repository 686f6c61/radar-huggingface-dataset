# srivassid/hindi-llm-340m-instruct

## Resumen

`hindi-llm-340m-instruct` es un modelo de lenguaje de 337 millones de parámetros entrenado desde cero exclusivamente en hindi (devanagari) por el desarrollador independiente srivassid. Se trata de un decoder estilo Llama (`LlamaForCausalLM`) con normalización RMSNorm, activación SwiGLU, RoPE, atención con query agrupadas (GQA) y embeddings atados, pensado como ejercicio de investigación y escala hobby más que como modelo de producción.

El modelo se preentrenó sobre 10.000 millones de tokens del subconjunto hindi del corpus AI4Bharat Sangraha y después se ajustó por supervisión (SFT) sobre unas 59.000 parejas instrucción/respuesta en hindi procedentes de ai4bharat/indic-instruct-data-v0.1 (anudesh, dolly traducido, wikihow, oasst1, lm_sys y flan_v2). El resultado es un modelo que escribe hindi fluido y sigue una plantilla de instrucción concreta, pero que el propio autor califica de poco fiable en hechos, aritmética y razonamiento.

Su relevancia es acotada pero clara: demuestra que es posible preentrenar un modelo monolingüe decente para hindi con una sola GPU de consumo (RTX 5090 de 32 GB) en unas 55 horas, y publica todos los detalles del proceso (datos, hiperparámetros, curvas de validación). La ventana de contexto es de solo 2.048 tokens y el vocabulario de 32.000 tokens está entrenado específicamente para hindi con SentencePiece BPE y fallback de bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (`LlamaForCausalLM`): RMSNorm, SwiGLU, RoPE, GQA, embeddings atados |
| Parametros totales | 337.173.504 (~337M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32 safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | hindi (devanagari) únicamente; inglés y otros idiomas no soportados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32, ~1,3 GB) |
| Capas / hidden / FFN | 27 / 1.024 / 2.816 |
| Atencion | 16 cabezas, 4 cabezas KV, dimensión de cabeza 64 |
| Vocabulario | 32.000 (SentencePiece BPE entrenado en hindi, fallback de bytes, dígitos separados) |
| RoPE theta | 10.000 |
| Tokens especiales | `<unk>`=0, `<s>`=1, `</s>`=2, `<pad>`=3 |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de 27 capas con dimensión oculta 1.024 y FFN de 2.816, atención con 16 cabezas de query y 4 de clave/valor (GQA), RoPE con theta 10.000 y embeddings atados entre entrada y salida. El tokenizador es un SentencePiece BPE de 32.000 tokens entrenado específicamente sobre hindi, con fallback de bytes y separación de dígitos. Los tokens `<|im_start|>` y `<|im_end|>` existen en el tokenizador pero no se usaron durante el entrenamiento; el modelo espera una plantilla de texto plano concreta (`### निर्देश:` / `### उत्तर:`).

El preentrenamiento usó el subconjunto hindi de AI4Bharat Sangraha (subconjuntos `verified`, `unverified` y `synthetic`, solo devanagari nativo, excluyendo los datos romanizados `*_Latn`), unos 277 ficheros parquet (~97 GB de texto) de los que se consumieron 10.000 millones de tokens en 19.074 pasos con secuencias empaquetadas de 2.048 tokens y sin document masking. Batch de 524.288 tokens por paso, AdamW fusionado con LR pico 4e-4, 1.000 pasos de warmup y decaimiento coseno hasta 4e-5, autocast bf16 y `torch.compile`. Todo el entrenamiento se ejecutó en una única RTX 5090 (32 GB) a ~52k tokens/s durante unas 55 horas, con paradas y reanudaciones exactas desde checkpoints. La pérdida final en validación fue de 2,545 nats/token (perplejidad ≈ 12,7 con este tokenizador).

El ajuste por instrucciones (SFT) se hizo con fine-tuning completo sobre las porciones hindi de ai4bharat/indic-instruct-data-v0.1, quedándose solo con el primer intercambio de cada ejemplo y descartando los de más de 1.024 tokens: 7.253 de anudesh, 14.459 de dolly traducido, 4.949 de wikihow, 3.389 de oasst1, 15.000 de lm_sys y 15.000 de flan_v2 (estos dos últimos con tope), totalizando 60.050 ejemplos divididos en 59.050 de entrenamiento y 1.000 de validación. Se aplicó pérdida solo sobre los tokens de respuesta, 3 épocas, LR 2e-5 con warmup del 3% y decaimiento coseno, batch efectivo de 32 y bf16, en unos 85 minutos en la misma GPU. La pérdida de validación fue de 1,822 (época 1), 1,797 (época 2) y 1,818 (época 3); los pesos publicados corresponden al final de la época 3, que sobreajusta ligeramente.

## Capacidades

- Generación de texto en hindi (devanagari) con fluidez razonable para su tamaño.
- Seguimiento de instrucciones de un solo turno mediante una plantilla de texto plano específica.
- Respuestas a preguntas simples, listas y recetas, con tendencia a bucles en respuestas largas si no se aplica `repetition_penalty`.
- Razonamiento de sentido común básico y comprensión lectora elemental, con rendimiento solo ligeramente por encima del azar según sus propios benchmarks.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo hindi; inglés y otros idiomas no están soportados.
- No dispone de modo thinking, visión ni audio.
- Sin memoria multi-turno: cada llamada es independiente.

## Casos de uso

- Experimentación académica y docente: sirve como caso de estudio reproducible de preentrenamiento monolingüe desde cero con una sola GPU de consumo, con todos los hiperparámetros y curvas publicados.
- Generación de texto hindi de dominio general en prototipos: puede producir párrafos y listas en hindi para demos, maquetas o pruebas de interfaz donde la exactitud factual no sea crítica.
- Completado de plantillas y textos cortos en hindi: útil para generar variaciones de frases, descripciones breves o resúmenes de una o dos frases dentro de su ventana de 2.048 tokens.
- Base para fine-tuning posterior en hindi: al ser Apache 2.0 y de tamaño reducido, es un punto de partida barato para ajustar tareas concretas (clasificación, extracción, respuestas cerradas) con presupuesto de GPU limitado.
- Investigación sobre tokenizadores para lenguas índicas: el vocabulario SentencePiece de 32.000 tokens entrenado en devanagari con fallback de bytes permite estudiar el impacto del tokenizador en lenguas de bajos recursos.
- Despliegue en entornos con hardware muy limitado: con 337M parámetros y pesos float32 de 1,3 GB, cabe en GPUs de consumo modestas y en CPU para inferencia de baja concurrencia.
- Evaluación comparativa de modelos pequeños en hindi: sus resultados en IndicCOPA y Belebele permiten situar líneas base para modelos monolingües de escala similar.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). La evaluación se hizo comparando la log-verosimilitud de cada opción de respuesta; "sum" indica la log-probabilidad total de la opción.

| Benchmark | Azar | Base preentrenado | Este modelo (SFT) |
|---|---|---|---|
| IndicCOPA (hi, 449 ítems) | 50% | 55,0% | 57,9% |
| Belebele (hin_Deva, 900 ítems) | 25% | 29,6% | 29,8% |

El autor indica que las métricas "sum" y "norm" (dividida por el número de tokens de la respuesta) difieren en uno o dos puntos y que deben compararse modelos usando la misma columna. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,3 GB en float32; en bf16/fp16 bajaría a ~0,7 GB de pesos, más overhead de activaciones y caché KV (pequeña: 27 capas × 4 cabezas KV × 64 de dimensión × 2.048 tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó en una RTX 5090 de 32 GB, pero la inferencia cabe holgadamente en GTX 1660, RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo e incluso en CPU para uso interactivo de baja concurrencia.
- Opciones de despliegue: `transformers` (probado por el autor), text-generation-inference (el repo es `endpoints_compatible`); no se documentan versiones GGUF, por lo que llama.cpp/Ollama requerirían conversión propia.
- Latencia y throughput: no se publican cifras de inferencia; el autor solo reporta ~52k tokens/s durante el preentrenamiento en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| hindi-llm-340m-instruct | ~337M | 2.048 | hindi | Apache 2.0 | Entrenado desde cero en hindi; benchmarks propios en IndicCOPA y Belebele |
| Modelos Llama 3.2 pequeños (1B/3B) | 1B / 3B | 128k | multilingüe | Llama Community License | Mucho mayores y con contexto mucho más amplio; no comparables en escala |
| Modelos índicos de AI4Bharat (p. ej. familia IndicBERT/IndicBART) | variable | variable | índicas | variable | Orientados a tareas NLU/generación específicas, no a chat general |
| Modelos tipo Gemma 2B | 2B | 8k | multilingüe | Gemma Terms | Mayor escala y multilingües; no monolingües en hindi |

No hay datos públicos de benchmarks comparables directamente con modelos de 300-400M entrenados solo en hindi en la información disponible.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no es fiable en hechos, aritmética ni razonamiento; los benchmarks muestran una mejora mínima sobre el azar.
- Riesgo alto de alucinación: al ser un modelo pequeño y con pocos datos, inventará datos con frecuencia.
- Tendencia a bucles en respuestas largas (listas, recetas, pasos); se recomienda `repetition_penalty` ≈ 1,1 y mantener las respuestas cortas.
- Ventana de contexto muy limitada (2.048 tokens) y sin memoria multi-turno: cada llamada es independiente.
- Solo hindi (devanagari); no soporta inglés ni otros idiomas, lo que limita su uso en entornos multilingües.
- Requiere una plantilla de prompt concreta (`### निर्देश:` / `### उत्तर:`); fuera de ella el rendimiento cae notablemente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni de exactitud; no apto para producción sin validación humana.
- Modelo de escala hobby/investigación: no se han realizado evaluaciones de sesgos, seguridad ni robustez adversarial.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/srivassid/hindi-llm-340m-instruct
- Dataset de preentrenamiento: https://huggingface.co/datasets/ai4bharat/sangraha
- Dataset de instrucciones: https://huggingface.co/datasets/ai4bharat/indic-instruct-data-v0.1
- Benchmark IndicCOPA: https://huggingface.co/datasets/ai4bharat/IndicCOPA
- Benchmark Belebele: https://huggingface.co/datasets/facebook/belebele
