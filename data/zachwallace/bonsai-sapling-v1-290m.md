# zachwallace/bonsai-sapling-v1-290m

## Resumen

El modelo `bonsai-sapling-v1-290m` es un transformer decoder-only de 290 millones de parámetros creado por un estudiante de secundaria bajo el usuario zachwallace. El proyecto nace con un propósito educativo: implementar desde cero un modelo de lenguaje completo, incluyendo el tokenizador BPE, la arquitectura y el optimizador, para entender el proceso de entrenamiento en profundidad. Se entrenó durante 29.3 días en un MacBook Pro M5 Pro con 48 GB de RAM, sobre 6.20B tokens de FineWeb-Edu, alcanzando una perplejidad held-out de 17.64.

El modelo tiene una arquitectura estándar de tipo Llama (pre-norm, RoPE, RMSNorm, SwiGLU, atención causal multi-cabeza) y una ventana de contexto de 1024 tokens. El vocabulario es un byte-level BPE de 32,768 tokens entrenado desde cero. El repositorio incluye dos variantes: la base, que completa texto, y la SFT, recomendada, afinada con Dolly-15k y OpenAssistant para seguir instrucciones. El modelo no carga con `transformers` y requiere Apple Silicon (MLX) para ejecutarse.

Su relevancia actual radica en ser un ejemplo de investigación reproducible y de bajo coste, con todo el código fuente disponible en el repositorio. Sirve como referencia para estudiantes y desarrolladores que quieran estudiar los componentes internos de un modelo de lenguaje sin depender de frameworks de alto nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (pre-norm, RoPE, RMSNorm, SwiGLU, atención causal multi-cabeza), implementado desde cero sobre MLX. |
| Parametros totales | 290.497.536 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | bfloat16 (pesos base y SFT); no se ofrecen otras cuantizaciones en el repositorio. |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-SA-3.0 (etiqueta del repositorio; el autor advierte que la licencia del checkpoint base podría ser más permisiva) |
| Formato de pesos | safetensors (`weights.safetensors` y `weights-sft.safetensors`), más `vocab.json` obligatorio para el tokenizador. |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional, esencialmente la receta de Llama: bloques pre-norm con RMSNorm, atención multi-cabeza causal con rotaciones de posición (RoPE) y capas feed-forward SwiGLU. El autor implementó todas las operaciones desde las matemáticas, incluyendo la rotación RoPE, la atención, la normalización y el optimizador, de modo que solo se importan cinco símbolos de `mlx.nn` (`Module`, `Linear`, `Embedding`, `silu`, `gelu`). El backward pass lo calcula MLX con autograd. El modelo no incluye `config.json` ni `modeling_*.py`, por lo que no es compatible con `transformers`; el código fuente vive en el repositorio.

El preentrenamiento se realizó con 28 GB de FineWeb-Edu, que tras un filtrado propio (heurísticas estilo Gopher/C4) y un deduplicado (hash exacto más detección de casi-duplicados MinHash/LSH con umbral de Jaccard 0.771) redujo 6.342.000 documentos al 95.2% y produjo 6.20B tokens. El tokenizador es un byte-level BPE entrenado desde cero sobre una muestra de 1 GB, con 32.768 tokens y una compresión de 4.553 bytes/token en texto held-out. El entrenamiento usó AdamW con master weights en float32 para evitar la pérdida de precisión en bfloat16; el lote efectivo era de 131.072 tokens por paso de optimizador, con 47.279 pasos, LR pico 6e-4, warmup del 2% y decaimiento coseno hasta 10%. La variante SFT se afinó durante una hora en Dolly-15k más 2.852 pares de OpenAssistant, con marcadores de chat en los ids reservados 257 (user) y 258 (assistant).

## Capacidades

- Generación de texto causal en inglés: la variante base continúa texto; la variante SFT responde a instrucciones.
- Conversación básica: la variante SFT usa marcadores `<|user|>` y `<|assistant|>` y puede generar respuestas en prosa o en formato de lista.
- Ejecución local en Apple Silicon: el modelo se ejecuta con MLX, sin dependencia de CUDA ni de frameworks de alto nivel; solo requiere `mlx` y `numpy`.
- Decodificación configurable: el script `generate.py` permite ajustar temperatura, `top-p`, penalización de repetición y token de parada.
- Tokenizador BPE personalizado: el vocabulario de 32.768 tokens se entrena desde cero y se debe cargar con `vocab.json` para que los ids sean significativos.
- No incluye soporte de tool calling, funciones, agentes, visión, audio ni capacidades multilingües; la documentación no menciona estas características.

## Casos de uso

- Aprendizaje práctico de arquitecturas de transformers: el código completo del modelo, tokenizador y entrenamiento está en el repositorio, por lo que se puede estudiar y modificar cada componente para entender el funcionamiento interno.
- Prototipado de texto en local: en un Mac con chip M-series, se puede generar texto corto en inglés sin conexión a internet ni servicios en la nube, útil para probar ideas rápidas.
- Asistente de chat simple en inglés: la variante SFT puede responder preguntas básicas o redactar listas en un formato conversacional, por ejemplo, para una demo de chatbot en un entorno educativo.
- Generación de contenido creativo en inglés: el modelo base completa texto de manera fluida, lo que permite usarlo para escribir relatos cortos, poemas o continuaciones de párrafos, aunque con riesgo de alucinación.
- Investigación sobre tokenización y preentrenamiento: al incluir el tokenizador BPE y el pipeline de datos, se puede analizar cómo el tamaño del vocabulario y la compresión afectan al entrenamiento y a la perplejidad.
- Pruebas de optimizadores y cuantización: el uso de master weights en float32 con parámetros bfloat16 es una técnica interesante para estudiar la estabilidad del entrenamiento en precisión reducida; el modelo sirve como banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta una perplejidad held-out de 17.64 y una compresión de 4.553 bytes/token en texto held-out, pero estos datos no son comparables con benchmarks externos.

## Requisitos de hardware

- Entrenamiento: MacBook Pro M5 Pro con 48 GB de RAM; 29.3 días de cómputo.
- Inferencia: requiere Apple Silicon y MLX; no soporta CUDA ni `transformers`.
- VRAM estimada: los pesos en bfloat16 ocupan 581 MB (182 tensores). La memoria de inferencia no está documentada.
- GPU recomendadas: Apple Silicon (M-series). No aplica para GPUs NVIDIA.
- Opciones de despliegue: script `generate.py` incluido, o integración manual con MLX como se muestra en el model card. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es un proyecto de investigación individual y no se ofrecen comparativas con otros modelos de tamaño similar.

## Limitaciones y advertencias

- Alucinaciones: el propio autor indica que el modelo es "fluido y frecuentemente incorrecto"; puede afirmar información falsa o desviarse del tema.
- Contexto limitado: ventana de 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idioma: solo inglés. No soporta otros idiomas.
- Licencia: la etiqueta CC-BY-SA-3.0 se debe al entrenamiento SFT con Dolly-15k. El autor advierte que la licencia del checkpoint base podría ser más permisiva y que la elección de licencia debe deliberarse. Para uso comercial, hay que revisar las condiciones de CC-BY-SA-3.0 y las licencias de los datos de entrenamiento.
- Compatibilidad: no carga con `transformers`; requiere MLX y Apple Silicon. No hay `config.json` ni código de modelado estándar.
- Sin soporte de herramientas: no se menciona tool calling, función llamada, ni integración con agentes.
- Datos de entrenamiento: el modelo se entrenó con FineWeb-Edu (ODC-By 1.0), Dolly-15k (CC-BY-SA-3.0) y OASST1 (Apache-2.0). La combinación puede implicar obligaciones de share-alike.
- Producción: no recomendado para sistemas críticos o de alto riesgo.

## Enlaces

- HuggingFace: https://huggingface.co/zachwallace/bonsai-sapling-v1-290m
- Repositorio del modelo (mismo enlace) incluye código fuente del modelo y tokenizador.
- No se han encontrado otros enlaces relevantes en la búsqueda web.
