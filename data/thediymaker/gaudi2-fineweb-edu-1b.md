# thediymaker/gaudi2-fineweb-edu-1b

## Resumen

gaudi2-fineweb-edu-1b es un modelo base de 1.069.639.680 parámetros con arquitectura Llama, entrenado desde cero por el usuario thediymaker sobre la totalidad del dataset FineWeb-Edu (1,60 billones de tokens, una sola pasada). El interés del modelo no reside en su rendimiento, sino en la infraestructura de entrenamiento: se utilizó DiLoCo (Distributed Low-Communication) sobre aceleradores Intel Gaudi2, con hasta 32 workers de 4 tarjetas cada uno operando como unidades elásticas y preventibles sobre la capacidad sobrante de un clúster de inferencia compartido, sin interconexión entre nodos.

Los workers intercambiaban deltas de parámetros a través de un object store una vez por ronda, aproximadamente cada 21 minutos, lo que redujo drásticamente el ancho de banda necesario. El entrenamiento completo consumió 21.579 horas-tarjeta Gaudi2 en 7,2 días de reloj, con un throughput agregado de 2,56 millones de tokens por segundo (30,8% de MFU) y una pérdida de validación final de 2,079.

Se publica como una prueba del setup de entrenamiento, no como un release ajustado: es un modelo base sin instruction tuning ni alineamiento de seguridad, con contexto de 2.048 tokens y entrenado exclusivamente con texto educativo en inglés. Su relevancia es metodológica: demuestra que es viable entrenar un modelo de escala 1B con comunicación mínima sobre hardware heterogéneo y preemptible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 1.069.639.680 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

Detalles adicionales de arquitectura: 22 capas, hidden size 2.048, MLP SiLU de 5.632, 32 cabezas de atención con 4 cabezas KV (GQA), RoPE con theta 10.000, RMSNorm y embeddings de entrada y salida atados. Tokenizer de SmolLM2 (HuggingFaceTB/SmolLM2-135M @ 93efa2f) con vocabulario de 49.152 tokens.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de tipo Llama, sin innovaciones arquitectónicas propias: GQA con 32 cabezas de consulta y 4 de clave/valor, activación SiLU en el MLP, normalización RMSNorm y embeddings atados. La innovación está en el régimen de entrenamiento. Se empleó DiLoCo: cada worker mantiene una copia completa del modelo y entrena durante una ronda (100 chunks de 1.048.576 tokens, equivalentes a 800 pasos de AdamW), tras lo cual un coordinador promedia los cambios de parámetros ponderados por tokens y los aplica con un optimizador externo (SGD con momentum de Nesterov 0,9 y LR 0,7). Los deltas se transmiten en bf16.

El optimizador interno es AdamW con betas (0,9; 0,95), weight decay 0,1, gradient clipping 1,0 y 131.072 tokens por paso; el LR alcanza un pico de 4e-4 con warmup de 2.000 millones de tokens y decae en coseno hasta 4e-5. Se completaron 503 rondas en 7,2 días con precisión bf16 y pesos maestros en fp32. El clúster fue elástico: 658 arranques de worker, con una media de 30,9 workers vivos (mínimo 16) y un 0,4% de pasos perdidos por preempción. El overhead de sincronización fue del 15,8% por ronda. Los datos provienen íntegramente de FineWeb-Edu (revisión 87f0914, 2.410 ficheros parquet), tokenizados a 1.598.580.326.400 tokens y entrenados en una sola pasada, sin repetición. No se aplicó RLHF, DPO ni ningún ajuste posterior.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de texto y completado de frases.
- Razonamiento básico de sentido común y conocimiento factual elemental, limitado por su escala y presupuesto de entrenamiento.
- Comprensión lectora y respuesta a preguntas de opción múltiple en formato few-shot (evaluado con lm-evaluation-harness).
- Modelado de lenguaje puro: útil como base para fine-tuning posterior.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking ni de capacidades de visión o audio.
- Multilingüismo: únicamente inglés; no se documenta competencia en otros idiomas.

## Casos de uso

- Investigación sobre entrenamiento distribuido: el modelo sirve como artefacto de referencia para reproducir o analizar el comportamiento de DiLoCo con workers elásticos y preemptibles, comparando las curvas de pérdida de validación entre hitos (50B, 150B, 300B, 650B, 1T y 1.598,6B tokens).
- Punto de partida para fine-tuning supervisado: al ser un base model de 1B con licencia Apache-2.0, es adecuado para ajustarlo con datasets propios de instrucciones en inglés y evaluar si el preentrenamiento sobre FineWeb-Edu facilita la transferencia.
- Experimentos de destilación: su tamaño compacto (1,07B parámetros, 2,1 GB en bf16) permite usarlo como alumno en pipelines de destilación desde modelos mayores con un coste de cómputo bajo.
- Evaluación comparativa de tokenizers: al emplear el tokenizer de SmolLM2 sobre texto educativo, permite estudiar el efecto del vocabulario en la eficiencia de tokenización frente a otros modelos de escala similar.
- Generación de texto educativo de dominio acotado: completado de explicaciones científicas sencillas (el propio autor muestra ejemplos sobre fotosíntesis) en entornos donde no se requiere precisión factual verificada.
- Benchmarking de infraestructura Gaudi2: útil para medir throughput, MFU y overhead de sincronización en configuraciones DiLoCo sobre hardware Intel, como referencia para planificar entrenamientos mayores.
- Estudio de sesgos en datos web educativos: al entrenar exclusivamente sobre FineWeb-Edu, permite analizar qué sesgos introduce este corpus filtrado por calidad educativa en un modelo de 1B.

## Benchmarks y rendimiento

Evaluación con lm-evaluation-harness 0.4.9, bf16, batch size 32, una tarjeta Gaudi2, 0-shot salvo MMLU (5-shot). Métrica `acc_norm` donde la tarea la define, si no `acc`.

| Modelo | Tokens | HellaSwag | ARC-E | ARC-C | PIQA | WinoGrande | OBQA | LAMBADA | MMLU (5-shot) |
|---|---|---|---|---|---|---|---|---|---|
| **gaudi2-fineweb-edu-1b** | 1.598,6B | 0,608 | 0,689 | 0,422 | 0,746 | 0,605 | 0,422 | 0,514 | 0,246 |
| Mismo run, hito 1T | 1.000B | 0,582 | 0,668 | 0,404 | 0,736 | 0,610 | 0,388 | 0,511 | 0,250 |
| Mismo run, hito 650B | 650B | 0,558 | 0,649 | 0,391 | 0,733 | 0,577 | 0,402 | 0,502 | 0,251 |
| Mismo run, hito 300B | 300B | 0,530 | 0,628 | 0,358 | 0,717 | 0,590 | 0,386 | 0,488 | 0,264 |
| Mismo run, hito 150B | 150B | 0,497 | 0,598 | 0,340 | 0,699 | 0,555 | 0,370 | 0,465 | 0,261 |
| Mismo run, hito 50B | 50B | 0,413 | 0,537 | 0,292 | 0,686 | 0,540 | 0,338 | 0,383 | 0,270 |
| TinyLlama 1.1B base (v1.1) | ver su card | 0,614 | 0,556 | 0,328 | 0,737 | 0,591 | 0,364 | 0,560 | 0,262 |
| SmolLM2-1.7B | ver su card | 0,714 | 0,732 | 0,472 | 0,775 | 0,662 | 0,444 | 0,674 | 0,501 |

MMLU tiene cuatro opciones, por lo que 0,25 equivale al azar: ni este modelo ni TinyLlama superan el azar a 5-shot. El modelo destaca frente a TinyLlama en ARC-E (0,689 frente a 0,556) y ARC-C (0,422 frente a 0,328), pero queda por debajo en HellaSwag, LAMBADA y WinoGrande. SmolLM2-1.7B, con más parámetros y presumiblemente más tokens de entrenamiento, supera al modelo en todas las tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,1 GB de pesos más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB con contexto completo de 2.048 tokens y batch pequeño.
- En fp32: unos 4,3 GB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Una RTX 4090, RTX 3090, A100 o H100 lo ejecutan con holgura; también tarjetas de gama media como RTX 3060 de 12 GB.
- Cabe en GPU de consumo: sí, en cualquier modelo con 6 GB o más de VRAM en bf16/fp16, y en configuraciones con cuantización de 8 bits en GPUs de 4 GB.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No se documentan versiones GGUF, por lo que llama.cpp y Ollama no son viables sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. El único dato de rendimiento es el del entrenamiento (2,56M tokens/s agregados en 32 workers de 4 Gaudi2).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | HellaSwag | ARC-E | MMLU (5-shot) | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gaudi2-fineweb-edu-1b | 1,07B | 2.048 | Apache-2.0 | 0,608 | 0,689 | 0,246 | Hugging Face, safetensors bf16 |
| TinyLlama 1.1B base v1.1 | 1,1B | 2.048 | Apache-2.0 | 0,614 | 0,556 | 0,262 | Hugging Face, múltiples formatos |
| SmolLM2-1.7B | 1,7B | 8.192 (según su card) | Apache-2.0 | 0,714 | 0,732 | 0,501 | Hugging Face, múltiples formatos |

Frente a TinyLlama, el modelo de este análisis gana en ARC-E y ARC-C pero pierde en HellaSwag, LAMBADA y WinoGrande, con MMLU por debajo del azar en ambos casos. Frente a SmolLM2-1.7B, la diferencia es sustancial en todas las tareas, atribuible tanto al mayor número de parámetros como a un presupuesto de entrenamiento presumiblemente superior; el modelo aquí descrito se entrenó con una sola pasada sobre 1,6 billones de tokens. En contexto, 2.048 tokens queda muy por debajo de los 8.192 de SmolLM2-1.7B. La ventaja del modelo es su licencia Apache-2.0 sin restricciones y su valor como artefacto reproducible de un experimento de entrenamiento distribuido.

## Limitaciones y advertencias

- Es un modelo base: continúa texto y no sigue instrucciones. No debe usarse como asistente conversacional sin fine-tuning previo.
- Sin alineamiento de seguridad: puede generar contenido falso, sesgado u ofensivo sin filtro alguno.
- Entrenado exclusivamente con texto educativo web en inglés; no tiene competencia demostrada en otros idiomas ni en dominios ajenos al corpus.
- Contexto de 2.048 tokens, insuficiente para tareas de contexto largo, RAG con documentos extensos o conversaciones multi-turno prolongadas.
- Riesgo elevado de alucinación factual: el MMLU a 5-shot (0,246) está por debajo del azar, lo que indica un conocimiento factual muy limitado.
- No es un release ajustado: el autor lo describe explícitamente como una prueba del setup de entrenamiento, lo que implica que no ha pasado por un proceso de validación orientado a producción.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (FineWeb-Edu) están bajo ODC-By 1.0 y sujetos a los términos de uso de Common Crawl; conviene revisar esas condiciones antes de un despliegue comercial.
- El tokenizer procede de SmolLM2 (Apache-2.0), sin implicaciones adicionales de licencia.
- No se publican versiones cuantizadas ni formatos alternativos, lo que limita el despliegue en entornos sin soporte de bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thediymaker/gaudi2-fineweb-edu-1b
- Paper de DiLoCo: https://arxiv.org/abs/2311.08105
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizer SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Modelo de comparación TinyLlama v1.1: https://huggingface.co/TinyLlama/TinyLlama_v1.1
- Modelo de comparación SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
