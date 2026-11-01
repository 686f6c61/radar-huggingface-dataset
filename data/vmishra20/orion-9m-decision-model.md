# vmishra20/orion-9m-decision-model

## Resumen

Orion 9M Decision Model es un modelo de decisión y lenguaje de tipo decoder-only desarrollado por el usuario vmishra20 y publicado en HuggingFace bajo el nombre `vmishra20/orion-9m-decision-model`. Se trata de un experimento de investigación construido desde cero en PyTorch, sin partir de ningún backbone preentrenado, y orientado a tareas de decisión y clasificación sobre preguntas de opción múltiple de carácter científico y de sentido común. Su relevancia no reside en el rendimiento, sino en ser un banco de pruebas de arquitecturas poco habituales en modelos pequeños: atención con proyecciones latentes comprimidas al estilo MLA, codificación posicional RoPE, bloques Transformer recurrentes con pesos compartidos y capas feed-forward con enrutamiento disperso tipo Mixture-of-Experts.

El modelo tiene 9.365.249 parámetros totales, una dimensión oculta de 256, 4 cabezas de atención, una longitud máxima de secuencia de 512 tokens y un vocabulario de 16.000 entradas. El preentrenamiento se realizó sobre un subconjunto en streaming del corpus FineWeb (configuración `sample-10BT`), pero el volumen efectivo fue de solo 179.150 tokens, un dato que conviene tener muy presente al interpretar cualquier resultado.

La adaptación posterior consistió en un ajuste supervisado sobre 80.658 ejemplos de opción múltiple procedentes de nueve benchmarks (OpenBookQA, ARC-Easy, ARC-Challenge, SciQ, CommonsenseQA, PIQA, Social-IQA, WinoGrande y HellaSwag), seguido de una etapa de RLCD con pares de preferencia derivados de las mismas preguntas. Pese a la etiqueta "Pre-Medical Checkpoint" del repositorio, la model card advierte explícitamente de que el modelo no constituye un dispositivo médico ni tiene validez clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only custom en PyTorch con atención MLA, RoPE, bloques recurrentes compartidos y MoE disperso |
| Parametros totales | 9.365.249 (9,365M) |
| Parametros activos | 2 de 4 expertos por token (MoE); no se especifica el recuento exacto de parámetros activos |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia); 160 tokens en la fase de SFT |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus de preentrenamiento es FineWeb, mayoritariamente inglés) |
| Licencia | other (sin términos concretos publicados en la información disponible) |
| Formato de pesos | no disponible (repositorio PyTorch; se mencionan pesos, configuración, tokenizer y código de inferencia sin detallar formatos) |

Configuración adicional publicada por el autor:

| Parametro | Valor |
|---|---|
| Hidden size | 256 |
| Cabezas de atención | 4 |
| Query latent rank | 128 |
| KV latent rank | 64 |
| Dimensión de cabeza Q/K sin RoPE | 32 |
| Dimensión de cabeza Q/K con RoPE | 16 |
| Dimensión de cabeza de valor | 32 |
| Bloques Transformer únicos/compartidos | 4 |
| Pasadas recurrentes por pila de bloques | 2 |
| Número de expertos MoE | 4 |
| Expertos seleccionados por token | 2 |
| Dimensión oculta MoE | 384 |
| Tamaño de vocabulario | 16.000 |
| Embedding de salida | Atado (tied), si está habilitado en la arquitectura exportada |

## Arquitectura y entrenamiento

El modelo es un decoder-only implementado en PyTorch con código propio. La atención emplea proyecciones latentes comprimidas para query y key-value al estilo MLA (Multi-head Latent Attention), con RoPE aplicado únicamente a los canales posicionales de query y key (16 de las 32 dimensiones de cabeza). La profundidad se logra mediante bloques Transformer recurrentes: solo hay 4 bloques únicos que se reutilizan en 2 pasadas sobre la pila, lo que reduce el número de parámetros manteniendo una profundidad efectiva mayor. Las capas feed-forward usan un esquema Mixture-of-Experts con 4 expertos y enrutamiento top-2 por token, con dimensión oculta de 384.

El preentrenamiento se hizo desde cero sobre un subconjunto en streaming de FineWeb (`sample-10BT`), pero el autor declara un total de solo 179.150 tokens procesados, lo que está varios órdenes de magnitud por debajo de lo habitual incluso para modelos de este tamaño. La adaptación posterior consistió en un SFT sobre 80.658 ejemplos normalizados de opción múltiple de nueve benchmarks (72.592 para entrenamiento y 8.066 para validación, split 90/10, secuencia máxima de 160 tokens). Después se aplicó una etapa de RLCD (Reinforcement Learning from Comparative Demonstrations) con 72.592 pares de preferencia de entrenamiento y 8.066 de validación, generados tomando la respuesta correcta como preferida y una respuesta incorrecta muestreada como rechazada.

La model card subraya que la arquitectura es código PyTorch personalizado y que la presencia de un archivo de pesos y un README no garantiza compatibilidad con `AutoModel` ni con `pipeline` de HuggingFace Transformers; el código, la configuración y el tokenizer deben probarse juntos en un entorno limpio.

## Capacidades

- Generación de texto y decisión sobre preguntas de opción múltiple en dominios de ciencia elemental, sentido común y razonamiento básico.
- Clasificación de respuestas entre opciones candidatas, que es la tarea principal para la que fue ajustado.
- Razonamiento de un solo paso sobre contextos cortos (hasta 160 tokens en el ajuste, 512 en la arquitectura).
- Preferencias alineadas mediante RLCD sobre pares correcto/incorrecto de las mismas preguntas.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües no documentadas; el corpus de preentrenamiento es mayoritariamente anglófono.
- No dispone de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre atención MLA en modelos pequeños: el modelo permite experimentar con proyecciones latentes comprimidas (rank 128 para Q, 64 para KV) en un entorno de 9M de parámetros que cabe en cualquier GPU consumer, comparando su comportamiento frente a atención estándar.
- Estudio de bloques recurrentes con pesos compartidos: con 4 bloques únicos y 2 pasadas, sirve para medir el equilibrio entre profundidad efectiva y número de parámetros en tareas de decisión.
- Análisis de enrutamiento MoE de grano fino: los 4 expertos con top-2 permiten instrumentar qué experto se activa por token y estudiar el colapso de expertos en modelos de muy baja escala.
- Reproducción de pipelines de SFT y RLCD: el autor documenta el split exacto (72.592/8.066) y el esquema de generación de pares de preferencia, lo que facilita replicar el proceso sobre otros corpus de opción múltiple.
- Evaluación comparativa de benchmarks de sentido común: puede usarse como línea base de muy bajo coste en OpenBookQA, ARC, SciQ, CommonsenseQA, PIQA, Social-IQA, WinoGrande y HellaSwag, siempre reportando split, script y hash del checkpoint.
- Docencia y formación: por su tamaño (9M parámetros, repositorio de 0,1 GB) es adecuado para explicar en clase cómo se implementan MLA, RoPE, MoE y recurrencia en PyTorch sin necesidad de infraestructura especializada.
- Pruebas de calibración y alucinación en modelos minúsculos: útil para estudiar cómo se degradan la calibración y la fidelidad factual cuando el preentrenamiento es de solo 179.150 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los nueve benchmarks empleados para el ajuste (OpenBookQA, ARC-Easy, ARC-Challenge, SciQ, CommonsenseQA, PIQA, Social-IQA, WinoGrande y HellaSwag) y sus tamaños de muestra, pero no incluye puntuaciones. El propio autor advierte de que cualquier puntuación debe acompañarse del split del dataset, el script de evaluación exacto, el número de ejemplos y el hash del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,365M parámetros en fp32 se requieren aproximadamente 37 MB de pesos; en fp16 unos 19 MB; en int8 unos 9 MB. A esto hay que sumar activaciones, caché KV y overhead del runtime de PyTorch, por lo que en la práctica el consumo es de unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso CPU son viables.
- Cabe holgadamente en cualquier GPU consumer e integrada.
- Opciones de despliegue: al ser código PyTorch personalizado, no se garantiza compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La model card indica que debe usarse el código de inferencia incluido en el repositorio y validar una pasada forward en un entorno limpio. No se documentan formatos GGUF ni safetensors.
- Latencia y throughput: no disponibles. Por el tamaño, la latencia esperada es de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para Orion 9M, por lo que la comparación se limita a parámetros, contexto y licencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Orion 9M Decision Model | 9,365M | 512 tokens | other | HuggingFace, código PyTorch custom |
| SmolLM-135M (HuggingFace) | 135M | 2.048 tokens | Apache 2.0 | HuggingFace, Transformers, GGUF |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | HuggingFace, Transformers, GGUF, vLLM |
| TinyLlama-1.1B | 1.100M | 2.048 tokens | Apache 2.0 | HuggingFace, Transformers, GGUF, vLLM |

La comparación es solo orientativa: los tres modelos de referencia son modelos de lenguaje de propósito general con preentrenamiento de billones de tokens, mientras que Orion 9M es un experimento de arquitectura con 179.150 tokens de preentrenamiento y ajuste específico para decisión sobre opción múltiple. No son intercambiables en producción.

## Limitaciones y advertencias

- Conocimiento factual muy limitado: el preentrenamiento efectivo es de 179.150 tokens, lo que sitúa al modelo muy por debajo de lo necesario para adquirir conocimiento general fiable.
- Riesgo alto de alucinación y de respuestas mal calibradas, especialmente fuera del formato de opción múltiple sobre el que fue ajustado.
- El ajuste se hizo con secuencias de hasta 160 tokens, aunque la arquitectura admite 512; el comportamiento más allá de 160 tokens no está validado.
- Idiomas soportados no documentados; el corpus de preentrenamiento (FineWeb) es mayoritariamente inglés, por lo que el rendimiento en castellano es previsiblemente muy pobre.
- La licencia es "other" sin términos concretos publicados; antes de cualquier uso comercial o redistribución deben verificarse las condiciones y las licencias de los datasets de ajuste (OpenBookQA, ARC, SciQ, CommonsenseQA, PIQA, Social-IQA, WinoGrande, HellaSwag y FineWeb).
- No es un dispositivo médico ni sustituye el consejo profesional, pese a la etiqueta "Pre-Medical Checkpoint" del repositorio.
- No se garantiza compatibilidad con `AutoModel`, `pipeline`, vLLM, llama.cpp, Ollama ni TGI; requiere el código custom del repositorio.
- El autor advierte de que cualquier benchmark debe reportarse con split, script, número de ejemplos y hash del checkpoint; no hay resultados publicados que cumplan este criterio.
- El modelo tiene 42 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/vmishra20/orion-9m-decision-model
- Dataset de preentrenamiento FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
