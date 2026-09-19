# Yigit-Karaman/Oguz-MoE-354M-Base

## Resumen

Oğuz-MoE-354M-Base es un modelo de lenguaje causal en turco con arquitectura de mezcla de expertos (MoE) desarrollado por el usuario Yigit-Karaman. Cuenta con 354,2 millones de parámetros totales y aproximadamente 205,5 millones de parámetros activos por token, lo que lo sitúa en la gama de modelos pequeños pero con una relación capacidad/cómputo optimizada mediante enrutado top-2 sobre 4 expertos por capa. Está publicado en HuggingFace bajo licencia Apache 2.0 y es un checkpoint únicamente preentrenado (base), sin ajuste por instrucciones.

Su rasgo distintivo es la metodología de construcción: no se entrenó como MoE desde cero, sino que se generó mediante un pipeline de escalado progresivo en cuatro etapas —preentrenamiento denso desde cero, dos rondas de depth upscaling y una conversión final de FFN denso a MoE (upcycling)— ejecutado íntegramente en una única GPU de consumo (NVIDIA GeForce RTX 4060 con 8 GB de VRAM). Esto lo convierte en un caso de estudio relevante para investigadores interesados en técnicas de escalado de bajo coste y en el upcycling de arquitecturas densas a MoE.

El modelo emplea una arquitectura tipo LLaMA con 21 capas de decodificador, tamaño oculto de 576, 8 cabezas de atención (dimensión de cabeza 72) y vocabulario de 50.257 tokens basado en un tokenizador BPE estilo GPT-2 adaptado al turco. La longitud máxima de posiciones es de 2048, aunque el entrenamiento se realizó con contextos de hasta 1024 tokens. Su exposición total de tokens a lo largo de todas las etapas asciende a aproximadamente 2.200 millones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador tipo LLaMA con FFN de mezcla de expertos (MoE) y SwiGLU |
| Parámetros totales | 354.161.748 (354,2 M) |
| Parámetros activos | ~205,5 M por token |
| Capas del decodificador | 21 |
| Tamaño oculto | 576 |
| Cabezas de atención | 8 (dimensión de cabeza 72) |
| Configuración MoE | 4 expertos por capa, enrutado top-2, intermedio por experto 2048 |
| Longitud de contexto | 2048 posiciones máximas (entrenado con contextos ≤ 1024) |
| Vocabulario | 50.257 tokens (BPE estilo GPT-2, turco) |
| Embeddings | Atados (entrada = cabeza LM) |
| Tipos de cuantización | no disponible (solo se distribuyen pesos en bfloat16) |
| Idiomas soportados | Turco (escritura latina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Precisión de referencia | bfloat16 |
| Librería | transformers |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un decodificador tipo LLaMA en el que cada FFN se sustituye por un `MoEBlock` compuesto por un enrutador lineal (576 → 4) y 4 expertos SwiGLU con tamaño intermedio 2048. Por cada token se seleccionan los 2 expertos con mayor puntuación, cuyas puertas normalizadas por softmax suman 1,0. El despacho de tokens se realiza aplanando las selecciones top-k, ordenándolas por índice de experto, dividiéndolas en tensores contiguos por experto, procesándolas y restaurando el orden mediante permutación inversa, todo ello diferenciable y compatible con autograd. El equilibrio de carga se mantiene mediante una pérdida auxiliar estilo Switch Transformer (`num_experts × Σ frac_i × prob_i`, valor ideal 1,0) con coeficiente 0,01.

El entrenamiento siguió un pipeline de cuatro etapas con una exposición total de ~2.200 millones de tokens. La etapa 0 preentrenó desde cero un modelo denso LLaMA de 12 capas y 80 M de parámetros con 1.600 millones de tokens (AdamW fusionado, lr 5e-4, weight decay 0,1, schedule coseno, autocast bf16, currículum de contexto: 80 % a 512 tokens y 20 % a 1024). La etapa 1 escaló en profundidad de 12 a 17 capas duplicando de forma intercalada las capas 4–8 con ruido gaussiano de ruptura de simetría (σ = 0,02) y una pasada de healing de 250 M de tokens, resultando en ~96 M densos. La etapa 2 repitió el proceso de 17 a 21 capas duplicando las capas 6–9, con 200 M de tokens de healing y ~112 M densos. La etapa 3 realizó el upcycling a MoE reemplazando cada FFN denso (ancho 1536) por 4 expertos (ancho 2048), copiando exactamente los pesos densos entrenados en las primeras 1536 dimensiones intermedias de cada experto, inicializando las dimensiones nuevas de gate/up con N(0, 0,01) y las columnas nuevas de `down_proj` con N(0, 0,001), de modo que la capacidad añadida arranca casi silenciosa (inicialización casi preservadora de función). Esta etapa usó 150 M de tokens con AdamW de 8 bits (bitsandbytes), lr 3e-4, weight decay 0,1, decaimiento coseno sobre 9.155 pasos de optimizador (73.240 micropasos, acumulación de gradiente 8), 16.384 tokens por actualización y clipping de gradiente 1,0.

Los datos de entrenamiento provienen de una mezcla intercalada por streaming con semilla 4242361: un 30 % de `ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0` y un 70 % de `HuggingFaceFW/fineweb-2` (split `tur_Latn`). El corpus se tokenizó offline una vez en un binario plano `uint16` de 1.600 millones de tokens que se sirvió por memory-mapping en todas las etapas. El tokenizador empleado es `ytu-ce-cosmos/turkish-gpt2`, de 50.257 tokens.

## Capacidades

- Generación de texto causal en turco: es un modelo base que completa texto a partir de un prefijo, sin ajuste por instrucciones ni formato de chat.
- Modelado de lenguaje y continuación de contexto: adecuado para tareas de predicción del siguiente token, autocompletado y generación libre.
- Capacidad multilingüe limitada: la model card declara únicamente turco (escritura latina); no se documenta soporte de otros idiomas.
- Razonamiento y matemáticas: no se documentan capacidades específicas ni resultados de benchmarks para estas tareas.
- Generación de código: no documentada.
- Tool calling / function calling: no soportado (modelo base sin ajuste por instrucciones).
- Soporte de agentes y razonamiento multi-paso: no soportado de forma nativa.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Enrutado MoE con top-2 expertos y equilibrio de carga supervisado por pérdida auxiliar, con ocupación por experto medida (EMA) entre el 23 % y el 28 % durante todo el entrenamiento de la etapa final.

## Casos de uso

- Investigación en upcycling denso a MoE: el modelo sirve como referencia reproducible de cómo convertir un transformer denso en MoE preservando la función inicial, gracias a la inicialización casi preservadora y al pipeline documentado etapa por etapa.
- Estudio de depth upscaling de bajo presupuesto: permite analizar el efecto del duplicado intercalado de capas con ruido de ruptura de simetría y pasadas de healing, útil para grupos con recursos limitados de GPU.
- Generación de texto en turco para prototipos: al ser un modelo base de 354 M de parámetros, puede emplearse para completar frases, generar párrafos o crear corpus sintéticos en turco en fase de experimentación.
- Preentrenamiento continuado (continued pretraining): su licencia Apache 2.0 y su tamaño permiten usarlo como punto de partida para ajuste fino supervisado o para adaptarlo a un dominio concreto en turco.
- Evaluación de eficiencia de inferencia MoE: con ~205,5 M de parámetros activos por token frente a 354,2 M totales, es útil para medir el ahorro de cómputo del enrutado top-2 en GPUs de gama baja.
- Docencia y experimentación en arquitecturas personalizadas: al requerir `trust_remote_code=True` y usar `MoeLlamaForCausalLM`, sirve para ilustrar la carga de arquitecturas custom en transformers y el despacho diferenciable de tokens entre expertos.
- Análisis de mezclas de datos en turco: al combinar Cosmos-Turkish-Corpus v1.0 y fineweb-2 `tur_Latn` en proporción 30/70, permite estudiar el impacto de la composición del corpus en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente reporta métricas de entrenamiento: VRAM medida en un paso real de optimizador de 4,42 GB (batch 4 × contexto 512) y 5,15 GB (batch 2 × contexto 1024) sobre una RTX 4060 de 8 GB, sin offloading a memoria del sistema; reanudación de checkpoint validada en producción en el micropaso 52.824 con restauración completa del estado de AdamW de 8 bits; transición de fase de contexto 512 → 1024 en el micropaso 58.550 sin discontinuidad de pérdida superior al ruido normal de microbatches.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 los pesos ocupan aproximadamente 0,71 GB; en float32, aproximadamente 1,42 GB; en int8, aproximadamente 0,35 GB; en int4, aproximadamente 0,18 GB (estimaciones derivadas del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente para bfloat16; el propio autor entrenó el modelo en una RTX 4060 de 8 GB.
- ¿Cabe en GPU de consumo?: sí, en prácticamente cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida). El repositorio ocupa 0,7 GB.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers` con `trust_remote_code=True` y `device_map="auto"`. Al usar una arquitectura personalizada (`MoeLlamaForCausalLM`), la compatibilidad con vLLM, llama.cpp, Ollama o TGI no está garantizada ni documentada, y requiere soporte para código remoto.
- Latencia y throughput estimados: no disponibles. Únicamente se conoce que el entrenamiento usó 16.384 tokens por actualización de optimizador con acumulación de gradiente 8.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MoE en turco de ~350 M de parámetros con arquitectura personalizada), ni datos de rendimiento que permitan establecer una comparación cuantitativa con alternativas densas o MoE de tamaño similar.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oğuz-MoE-354M-Base | 354,2 M | ~205,5 M | 2048 (entrenado ≤ 1024) | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene formato de chat y no debe usarse directamente como asistente sin un ajuste posterior.
- Riesgo de alucinación: al ser un modelo de 354 M de parámetros entrenado con ~2.200 M de tokens, la coherencia factual y de largo alcance es limitada; puede generar contenido plausible pero incorrecto.
- Sesgos conocidos: no se documentan evaluaciones de sesgo ni de toxicidad. La mezcla de datos (30 % Cosmos-Turkish-Corpus v1.0, 70 % fineweb-2 `tur_Latn`) puede heredar sesgos presentes en esos corpus web.
- Limitaciones de idioma: solo se declara soporte de turco en escritura latina; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Limitaciones de contexto: aunque la posición máxima es de 2048, el entrenamiento se realizó con contextos de hasta 1024 tokens, por lo que el rendimiento más allá de esa longitud no está garantizado.
- Arquitectura personalizada: requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.
- Compatibilidad de despliegue: al no ser una arquitectura estándar, puede no funcionar directamente con servidores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama) sin adaptaciones.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserven los avisos de copyright y licencia correspondientes.
- Datos de la ficha: el repositorio tiene 107 descargas y 1 like en el momento de la consulta, con creación y actualización fechadas en 2026-09-19. La model card usa la ruta `Yigit-Karaman/Oguz-moe-354m-base` en los ejemplos de código, mientras que el identificador del repositorio es `Yigit-Karaman/Oguz-MoE-354M-Base`; conviene verificar la ruta exacta antes de cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yigit-Karaman/Oguz-MoE-354M-Base
- Tokenizador `ytu-ce-cosmos/turkish-gpt2`: https://huggingface.co/ytu-ce-cosmos/turkish-gpt2
- Dataset `ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0`: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
- Dataset `HuggingFaceFW/fineweb-2`: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

No se han encontrado papers, blogs, repositorios adicionales ni demos en los resultados de la búsqueda web proporcionada.
