# XL4/pretrain0

## Resumen

XL4/pretrain0 es un modelo base de 82,8 millones de parámetros entrenado desde cero por el usuario XL4 con la arquitectura MiniMind, un transformer decoder-only con atención GQA, SwiGLU, RoPE, RMSNorm, QK-Norm y pesos atados entre embedding y cabeza de salida. Es exclusivamente un modelo preentrenado: no ha pasado por SFT ni por ningún proceso de alineación (RLHF/DPO), por lo que no sigue instrucciones y no está pensado para usarse como asistente conversacional.

El entrenamiento se completó en una única RTX 3080 Ti de 12 GB, con 6.400 pasos, secuencias de 1.024 tokens y un total aproximado de 1.680 millones de tokens, en torno a dos épocas sobre un corpus mayoritariamente chino (webtext2019zh, Wikipedia, SkyPile, Tieba y corpus de crosstalk) más TinyStories en inglés. La pérdida final registrada es de 3,18 y el pico de VRAM durante el entrenamiento fue de 10,6 GB.

Su relevancia es metodológica: documenta una receta reproducible de preentrenamiento a muy bajo coste, con técnicas de ahorro de memoria (gradient checkpointing selectivo, entropía cruzada por bloques) y un tokenizer BPE propio de 16.384 entradas. Resulta útil como base para SFT, para experimentos de adaptación de dominio y para estudiar arquitecturas decoder-only modernas en un artefacto de solo 0,2 GB. No es un modelo para producción conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMind, transformer decoder-only (GQA, SwiGLU, RoPE, RMSNorm, QK-Norm, pesos atados) |
| Parametros totales | 82.759.552 (82,76 M) |
| Longitud de contexto | 4.096 posiciones (`max_position_embeddings`); entrenado con `seq_len` de 1.024 |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP16) |
| Idiomas soportados | zh (mayoritario), en |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP16) + código de modelado propio (`model_minimind.py`) |
| Capas | 14 |
| hidden_size | 640 |
| Cabeceras de atención | 10 query / 5 key-value, head_dim 64 |
| intermediate_size (MLP) | 2.048 |
| Vocabulario | 16.384 (BPE entrenado por el autor) |
| RoPE theta | 1e6 |
| RMSNorm eps | 1e-6 |
| Tamaño del repositorio | 0,2 GB |
| Librería y pipeline | transformers, text-generation |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño MiniMind: un transformer decoder-only de 14 capas y 640 dimensiones ocultas, con atención de consultas agrupadas (10 cabeceras de query y 5 de key-value, head_dim 64), normalización QK-Norm sobre las consultas y claves, MLP con activación SwiGLU e `intermediate_size` de 2.048, normalización RMSNorm con eps 1e-6 y codificación posicional rotatoria RoPE con theta 1e6. El vocabulario es un BPE propio de 16.384 entradas y la matriz de embedding está atada a la cabeza de salida, lo que reduce el número de parámetros. El modelo se distribuye con código de modelado propio (`model_minimind.py`) referenciado desde `config.json` mediante `auto_map`, por lo que requiere `trust_remote_code=True`.

El preentrenamiento se realizó en una sola RTX 3080 Ti de 12 GB durante 6.400 pasos, con `seq_len` 1.024, micro-batch 16 y acumulación de gradiente 16, lo que supone unos 262.000 tokens por paso y aproximadamente 1.680 millones de tokens en total (unas dos épocas). Se usó AdamW con learning rate 4e-4 y decaimiento coseno hasta 4e-5, warmup de 128 pasos, weight_decay 0,1 y grad_clip 1,0. Para caber en 12 GB se aplicaron recálculo de gradientes, caché de activaciones en las últimas 13 capas y entropía cruzada por bloques de 128. El corpus combina chino (webtext2019zh, wiki2019zh, SkyPile, Tieba y crosstalk-generation) con inglés (TinyStories v3, recortado). Los datos de diálogo (小黄鸡, PTT y similares) se reservaron deliberadamente para la fase de SFT y no se mezclaron en el preentrenamiento. No se documenta ningún proceso de RLHF, DPO o ajuste por preferencias.

## Capacidades

- Generación de texto autoregresiva y continuación de fragmentos, especialmente en chino; es su función principal como modelo base.
- Capacidad de continuación de texto en inglés limitada al registro de TinyStories (relatos muy simples).
- No dispone de instruction following: no sigue instrucciones, no mantiene formato de chat y en conversación directa produce texto incoherente o irrelevante, tal como advierte el autor.
- No soporta tool calling ni function calling: no ha recibido entrenamiento para emitir llamadas estructuradas a herramientas.
- No soporta flujos de agentes ni razonamiento multi-paso guiado; no hay datos de entrenamiento orientados a ello.
- Cobertura multilingüe reducida a chino e inglés; el vocabulario de 16.384 tokens limita la tokenización eficiente de otros idiomas.
- Sin capacidades de visión, audio ni multimodalidad.
- Sin modo de razonamiento explícito (thinking mode) ni decodificación especulativa documentada.
- El contexto máximo configurado es de 4.096 posiciones, pero el modelo solo vio 1.024 durante el entrenamiento; la extrapolación más allá de esa longitud no está validada.
- Requiere cargar código remoto (`trust_remote_code=True`) para poder instanciarse.

## Casos de uso

- Base para SFT: es el escenario para el que el autor lo publica. Sirve como punto de partida para un ajuste supervisado con datos de instrucciones o de diálogo, y sus 82,8 M de parámetros permiten completar el ciclo de fine-tuning en una sola GPU de consumo.
- Investigación sobre preentrenamiento de bajo coste: la model card documenta la receta completa (6.400 pasos, 1.680 M de tokens, 3080 Ti de 12 GB, checkpointing selectivo y CE por bloques), lo que permite reproducirla y estudiar el efecto de cada técnica de ahorro de memoria en la curva de pérdida.
- Adaptación de dominio en chino: al haber sido preentrenado con webtext2019zh, wiki2019zh, SkyPile y Tieba, es un punto de partida razonable para continuación de preentrenamiento con corpus jurídico, médico, industrial o de atención al cliente en chino.
- Generación por continuación de texto: redacción de descripciones, párrafos o relatos breves en chino usando prompts de continuación (no instrucciones). Adecuado para tareas donde el output no requiere seguir un formato estricto.
- Experimentos de tokenizer: el vocabulario BPE de 16.384 entradas entrenado desde cero permite medir el impacto del tamaño de vocabulario en la eficiencia de embedding, la compresión de secuencias y la calidad final en modelos pequeños.
- Destilación de modelos: su tamaño reducido lo convierte en un alumno manejable para destilar capacidades desde modelos mayores, con la ventaja de que el coste de inferencia posterior es mínimo.
- Generación de datos sintéticos simples en inglés: al incluir TinyStories en el corpus, puede producir cuentos y textos infantiles sencillos para ampliar datasets de modelos pequeños, siempre con revisión posterior.
- Docencia y estudio de arquitecturas: el repositorio de 0,2 GB incluye código de modelado legible, lo que facilita diseccionar GQA, SwiGLU, RoPE, QK-Norm y weight tying en un modelo que cabe en cualquier portátil.
- Despliegue en dispositivos con poca memoria tras SFT: 158 MB en FP16 y una caché KV de aproximadamente 17,5 KiB por token permiten ejecutarlo en entornos con recursos muy limitados (Raspberry Pi, mini-PC, móvil de gama alta) una vez ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica objetiva reportada por el autor es la pérdida de entrenamiento final (≈3,18) y el rendimiento del entrenamiento (≈48,6 Ktok/s con un pico de 10,6 GB de VRAM en una RTX 3080 Ti). No hay datos de MMLU, HumanEval, GSM8K, C-Eval u otras evaluaciones estándar.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 158 MB (82,76 M de parámetros). En FP32 serían unos 331 MB; en INT8, unos 83 MB; en INT4, unos 41 MB (estas dos últimas requerirían cuantización propia, no incluida en el repositorio).
- Caché KV estimada: unos 17,5 KiB por token en FP16 (14 capas × 2 × 5 cabeceras KV × 64 dimensiones × 2 bytes). A 4.096 tokens supone unos 72 MiB adicionales.
- VRAM estimada para inferencia: 0,3-0,5 GB en FP16 a máxima longitud de contexto, incluyendo pesos, caché y overhead del runtime.
- GPU recomendadas: cualquier GPU con 1 GB o más de VRAM. Funciona en RTX 3060/4060, GTX 1650, e incluso en iGPU con memoria compartida. El entrenamiento original se validó en una RTX 3080 Ti de 12 GB.
- Inferencia en CPU: viable por tamaño; no se han publicado medidas de latencia ni throughput.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, conversión no incluida y no garantizada dada la arquitectura personalizada. El soporte en vLLM o TGI no está confirmado.
- Throughput de entrenamiento documentado: 48,6 Ktok/s en RTX 3080 Ti con la configuración de ahorro de memoria descrita. Throughput de inferencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| XL4/pretrain0 | 82,76 M | 4.096 configurados / 1.024 entrenados | zh, en | no disponible | no |
| Qwen2.5-0.5B (base) | 0,49 B | 32.768 | multilingüe (incluido es) | Apache-2.0 | sí |
| SmolLM2-135M (base) | 135 M | 8.192 | principalmente en | Apache-2.0 | sí |
| TinyLlama-1.1B (base) | 1,1 B | 2.048 | en (con algo de zh) | Apache-2.0 | sí |

Frente a estas alternativas, XL4/pretrain0 es el único sin licencia declarada, sin evaluaciones publicadas y con un contexto efectivo de 1.024 tokens, pero también el único que documenta de forma completa una receta de preentrenamiento reproducible en una GPU de 12 GB. Los datos de los modelos comparados provienen de su documentación pública y no se han verificado en esta ficha.

## Limitaciones y advertencias

- Modelo base sin SFT ni alineación: no sigue instrucciones, no mantiene diálogo y puede producir texto incoherente o repetitivo en formato conversacional. El propio autor lo advierte.
- Sin alineación de seguridad: no hay filtros de contenido ni entrenamiento con preferencias humanas. Puede reproducir sesgos, toxicidad o contenido inapropiado presente en webtext, Tieba y otras fuentes web.
- Conocimiento factual muy limitado: 1.680 M de tokens de entrenamiento es un volumen bajo comparado con modelos de su tamaño entrenados con billones de tokens; es esperable una alta tasa de alucinación y errores factuales.
- Contexto efectivo de 1.024 tokens: aunque la configuración permita 4.096 posiciones, no hay evidencia de que el modelo generalice más allá de la longitud vista en entrenamiento.
- Cobertura lingüística desequilibrada: el chino domina el corpus; el inglés se limita a TinyStories, un registro muy simple y repetitivo. No hay soporte real para castellano ni para otras lenguas.
- Licencia no disponible: no se puede asumir permiso de uso comercial, redistribución o modificación. Es un riesgo legal relevante para cualquier despliegue en producción.
- Dependencia de código remoto: `trust_remote_code=True` ejecuta `model_minimind.py` del repositorio, lo que introduce un riesgo de cadena de suministro que conviene auditar antes de usar en entornos sensibles.
- Reproducibilidad parcial: solo se conserva el checkpoint final (step 6400, época 2); no se publican los estados del optimizador ni checkpoints intermedios, lo que dificulta reanudar el entrenamiento o analizar la dinámica de convergencia.
- Sin benchmarks: no hay evidencia cuantitativa de calidad frente a alternativas, por lo que cualquier comparación es especulativa.
- Tokenizer de 16.384 entradas: vocabulario pequeño que penaliza la eficiencia en idiomas distintos del chino y del inglés simple, y que puede fragmentar en exceso términos técnicos o nombres propios.
- Escala de entrenamiento modesta: un único investigador, una sola GPU y una sola configuración; no hay estudios de ablación ni de sensibilidad a hiperparámetros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XL4/pretrain0
- Repositorio de entrenamiento citado en la model card (rama `3080-12G`): https://github.com/sn1k5/trainfromzer0
- Proyecto MiniMind original, referencia de la arquitectura (no citado en la model card): https://github.com/jingyaogong/minimind
