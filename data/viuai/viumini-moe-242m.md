# ViuAI/ViuMini-MoE-242M

## Resumen

ViuMini-MoE-242M es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por ViuAI, publicado en HuggingFace bajo licencia Apache 2.0 y orientado específicamente al ámbito *hinglish* (mezcla de hindi e inglés). Se trata de un modelo de investigación de tamano muy reducido: 241,7 millones de parámetros totales y 166,2 millones activos por token, distribuidos en 28 capas (19 densas y 9 con micro-MoE). Su arquitectura interna se denomina VIU-1 Frontier MoE e incorpora atención GQA con RMSNorm, QK-Norm y RoPE con theta 500k, además de un esquema de atención híbrida que combina ventanas deslizantes de 512 tokens con atención completa de 2048 en proporción 3:1.

El modelo resuelve un nicho poco cubierto: la generación de texto en hinglish, un registro lingüístico con millones de hablantes pero escasa representación en los corpus de entrenamiento de los modelos comerciales. Su diseno prioriza un coste de inferencia bajo (166M parámetros activos permiten despliegue en hardware de gama de entrada) manteniendo una capacidad total mayor gracias a la capa MoE. Está pensado como plataforma de investigación sobre eficiencia de MoE en contextos multilingües con *code-switching*.

Es importante senalar que, segun la propia model card, el proyecto se encuentra en estado embrionario: el código está listo y ha superado un *smoke test* (perdida de 6,18 a 6,01 en 3 pasos sobre CPU), pero el entrenamiento real con 4-5B tokens, el tokenizer definitivo y las fases de SFT/DPO están pendientes. El repositorio de HuggingFace tiene un tamano de 0,0 GB y no contiene pesos publicados, por lo que se trata de un artefacto de código y documentación más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VIU-1 Frontier MoE: transformer decoder-only con 28 capas (19 densas + 9 micro-MoE) |
| Parametros totales | 241,7 M (242 M) |
| Parametros activos | 166,2 M (166 M) |
| Longitud de contexto | 2048 tokens nativo; extensible a 8k con YaRN |
| Tipos de cuantizacion | no disponible (no se han publicado pesos ni conversiones GGUF, AWQ, GPTQ o similares) |
| Idiomas soportados | hindi (hi), ingles (en) y hinglish (code-switching hi-en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio esta vacio; el codigo espera checkpoints en LFS) |
| Dimension del modelo | 640 |
| Cabezas de atencion | 10 cabezas de consulta, 2 cabezas KV (GQA) |
| Tamano de vocabulario | 48.000 tokens (byte-level BPE, NFC + ByteLevel) |
| Embeddings | atados (tied embeddings) |
| FFN | SwiGLU denso + micro-MoE (8 expertos a 1/4 de tamano, top-2 + 1 compartido) |
| Dataset de entrenamiento | ViuAI/viu-mini-pretrain-40-30-30 (40% hinglish, 30% hindi, 30% ingles) |
| Optimizador | AdamW + cosine schedule con 5% de warmup, grad-clip 1.0, BF16, grad-accum |

## Arquitectura y entrenamiento

La arquitectura VIU-1 Frontier MoE combina capas densas y capas con mezcla de expertos: 19 de las 28 capas usan FFN densa con SwiGLU y 9 incorporan un micro-MoE con 8 expertos de un cuarto del tamano estandar, enrutamiento top-2 más un experto compartido y una *balance loss* de 0,01 para evitar el colapso de expertos. La atención emplea GQA (10 cabezas de consulta, 2 de clave/valor), RMSNorm, QK-Norm y RoPE con theta 500k, lo que la hace compatible con extension de contexto mediante YaRN hasta 8k tokens. El esquema de atención es híbrido: ventanas deslizantes de 512 tokens combinadas con atención completa de 2048 en proporción 3:1, lo que reduce el coste del cache KV en secuencias largas. Se anade una cabeza auxiliar de Multi-Token prediction (predicción del siguiente-siguiente token), tecnica habitual para mejorar la eficiencia de muestreo en modelos pequenos.

En cuanto al entrenamiento, la model card documenta el pipeline (AdamW, cosine con 5% de warmup, grad-clip 1.0, BF16 y acumulación de gradientes) pero no confirma que se haya ejecutado a escala real. El estado declarado es: código listo y *smoke test* superado con 28 capas y 241M de parámetros; pendiente el entrenamiento real con 4-5B tokens, la finalización del tokenizer de 48k (actualmente en estado de prueba, 36.252 bytes), el entrenamiento en CUDA y las fases de SFT/DPO. No hay información sobre composición exacta del dataset más allá de la proporción 40:30:30, ni sobre número de tokens vistos, ni sobre uso de RLHF/DPO efectivo.

## Capacidades

- Generación de texto en hinglish, hindi e inglés, con especial atención al *code-switching* entre hindi e inglés.
- Razonamiento básico y generación de texto general: el modelo es un decoder-only causal estándar, por lo que las capacidades dependen íntegramente del entrenamiento, que aún no se ha completado.
- Cabeza auxiliar de predicción multi-token (next-next), útil para decodificación especulativa o muestreo más eficiente.
- Soporte de tool calling: no disponible. No hay indicios de plantillas de herramientas, tokens especiales ni fases de entrenamiento orientadas a function calling.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a hindi, inglés y su mezcla; no hay evidencia de soporte para otras lenguas.
- Capacidades especiales (visión, audio, modo *thinking*): no disponible.
- Extension de contexto: hasta 8k tokens mediante YaRN, no activado por defecto.

## Casos de uso

- Asistentes conversacionales en hinglish: el modelo está disenado específicamente para responder en el registro mixto hindi-inglés que usan millones de hablantes en India, un caso que los modelos occidentales cubren de forma deficiente. El contexto de 2048 tokens permite conversaciones multi-turno de longitud moderada.
- Normalización y generación de texto para plataformas de mensajería: redacción de respuestas automáticas, resúmenes de conversaciones o plantillas de atención al cliente en hinglish, con un coste de inferencia muy bajo gracias a los 166M parámetros activos.
- Investigación sobre eficiencia de MoE: el modelo sirve como banco de pruebas reproducible para estudiar enrutamiento de expertos, *balance loss*, ratio denso/MoE y decodificación especulativa con la cabeza multi-token, en un regimen de cómputo accesible a un solo investigador.
- Aumento de datos para NLP en hindi: generación de corpus sintético en hindi e hinglish para entrenar o evaluar otros modelos, siempre que el entrenamiento se complete y se valide la calidad del output.
- Prototipado en hardware de gama de entrada: con 242M parámetros totales, el modelo cabe en GPUs de consumo e incluso en CPU para tareas de baja latencia, lo que facilita experimentación local sin clúster.
- Educación y traducción asistida hi-en: ayuda a la redacción bilingüe, transliteración y explicación de conceptos en la lengua en la que el usuario se sienta más cómodo.
- *Benchmarking* de pipelines de entrenamiento distribuido: el repositorio incluye scripts de entrenamiento, tokenizer y publicación en HuggingFace que pueden reutilizarse como esqueleto para otros proyectos MoE de bajo presupuesto.

Advertencia: todos estos casos de uso son proyectados. Al no existir pesos entrenados publicados, ninguno de ellos puede ejecutarse hoy con este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento documentado es el *smoke test* de entrenamiento en CPU, que no es un benchmark de calidad: la pérdida pasó de 6,18 a 6,01 en 3 pasos, con el modelo de 28 capas y 241M de parámetros verificado (241,7M totales / 166,2M activos). No hay resultados de MMLU, HumanEval, GSM8K, ni de ninguna otra evaluacion, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos): aproximadamente 0,48 GB en FP16/BF16, 0,24 GB en INT8 y 0,12 GB en INT4, calculado a partir de los 241,7M parámetros totales.
- Cache KV: con 28 capas, 10 cabezas de consulta y 2 cabezas KV de dimension 64 (128 valores por capa y token), el cache ocupa unos 14 KB por token en FP16, es decir, alrededor de 29 MB para los 2048 tokens de contexto completo. El esquema de ventana deslizante de 512 tokens reduce esta cifra en la mayoria de capas.
- VRAM total recomendada: menos de 2 GB en FP16 incluyendo cache y overhead del runtime, cifra holgada para cualquier GPU de consumo actual.
- GPU recomendadas: cualquier GPU con 4 GB o más. Cabe sin problemas en RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria unificada o en CPU para lotes pequenos.
- Entrenamiento: con 241,7M parámetros, BF16 y AdamW, los estados del optimizador ocupan en torno a 1,9 GB (pesos y gradientes en BF16 más momentos en FP32); el entrenamiento completo con grad-accum cabe en una unica GPU de consumo con 12-24 GB, aunque los 4-5B tokens previstos requieren tiempo de cómputo considerable.
- Opciones de despliegue: no disponible. Al no existir pesos publicados no hay conversiones GGUF (llama.cpp, Ollama), ni soporte listo para vLLM o TGI. Seria necesario convertir el checkpoint, y el soporte de MoE con enrutamiento top-2 más experto compartido requiere verificar la compatibilidad de cada runtime.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de tamano comparable, dado que no existen practicamente MoE publicos en el rango de 200-300M de parámetros. Los datos de las alternativas provienen de informacion publica y conviene verificarlos en sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Pesos publicados | Enfoque |
|---|---|---|---|---|---|
| ViuMini-MoE-242M | 241,7 M totales / 166,2 M activos | 2048 (8k con YaRN) | Apache 2.0 | No | MoE especifico para hinglish |
| Qwen2.5-0.5B | 0,49 B (denso) | 32.768 tokens | Apache 2.0 | Si | Multilingue generalista |
| TinyLlama-1.1B | 1,1 B (denso) | 2048 tokens | Apache 2.0 | Si | Ingles, fine-tuning abierto |
| Qwen1.5-MoE-A2.7B | 14,3 B totales / 2,7 B activos | 32.768 tokens | Apache 2.0 | Si | MoE multilingue de mayor escala |

Frente a Qwen2.5-0.5B y TinyLlama-1.1B, ViuMini-MoE-242M ofrece un coste de inferencia inferior por token (menos parámetros activos) y una especialización clara en hinglish, pero carece de pesos, de contexto nativo largo y de cualquier evaluación de calidad. Frente a Qwen1.5-MoE-A2.7B comparte el paradigma MoE y la licencia, pero es un orden de magnitud más pequeno y no ha completado su entrenamiento.

## Limitaciones y advertencias

- No hay pesos publicados. El repositorio de HuggingFace ocupa 0,0 GB y registra 0 descargas y 0 likes; cualquier uso requiere entrenar el modelo desde cero con el código proporcionado.
- Entrenamiento incompleto. La propia model card indica que faltan el entrenamiento real con 4-5B tokens, el tokenizer definitivo en 48k, el entrenamiento en CUDA y las fases de SFT y DPO.
- Tokenizer no finalizado. El archivo de tokenizer figura como TEST (36.252 bytes) y no como versión final de 48k, lo que afecta a la reproducibilidad.
- Riesgo declarado de fracaso del MoE. El autor estima un 50-60% de probabilidad de fallo en el primer entrenamiento y hasta un 85% tras un reajuste, con una lista de prevención en su documentación interna.
- Sin datos de evaluación. No existen benchmarks, por lo que no puede afirmarse nada sobre calidad, coherencia, seguimiento de instrucciones o tasa de alucinación.
- Sesgos desconocidos. Al no haberse entrenado ni evaluado, no hay análisis de sesgos; el corpus 40:30:30 hinglish/hindi/ingles puede introducir desequilibrios entre registros y variedades dialectales.
- Cobertura lingüística muy restringida. El modelo no soporta castellano ni otras lenguas fuera de hindi, ingles y su mezcla.
- Contexto corto. 2048 tokens nativos es reducido para tareas de documentos largos; la extension a 8k depende de YaRN y de validación empírica que no existe.
- Licencia y uso. Apache 2.0 permite uso comercial, pero el autor declara que el proyecto es de propósito de investigación; no hay garantías de idoneidad para producción.
- Sin soporte de herramientas. No hay evidencia de function calling ni de integración con agentes, lo que limita su uso en pipelines automatizados.
- Fecha de creación del repositorio poco habitual (16 de septiembre de 2026) y ausencia de métricas de adopción, lo que junto al tamanco 0,0 GB sugiere un artefacto en fase de preparación más que un modelo distribuible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ViuAI/ViuMini-MoE-242M
- Dataset de preentrenamiento: https://huggingface.co/datasets/ViuAI/viu-mini-pretrain-40-30-30
- Repositorio de código y documentación: referenciado en la model card como estructura local (model/scripts/viu1_moe.py, train.py, docs/VIU1_MOE_PLAN.md, docs/PROGRESS.md, docs/HF_PUSH_GUIDE.md); no se ha publicado una URL publica de repositorio en la informacion disponible.
- Paper, blog o demo: no disponible.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron paginas genericas de Wikipedia sin relacion con ViuAI ni con ViuMini-MoE-242M.
