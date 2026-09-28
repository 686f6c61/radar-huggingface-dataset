# suisanka/Neko-V0-Snapshot-0928

## Resumen

Neko V0 Snapshot es un modelo de lenguaje autorregresivo de tipo base (sin ajuste por instrucciones) publicado por el usuario suisanka en Hugging Face bajo licencia MIT. Se trata de un transformer causal híbrido que combina bloques recurrentes Gated DeltaNet (GDN) con auto-atención causal de ventana deslizante (SWA), con solo cuatro capas de decodificador dispuestas en el orden GDN → GDN → SWA → GDN. El modelo es muy pequeño: 36.814.994 parámetros totales, de los cuales 33.095.680 (aproximadamente el 89,9%) corresponden a la matriz de embeddings compartida, de modo que únicamente 3.719.314 parámetros quedan fuera de dicha matriz.

El problema que aborda no es el rendimiento en tareas abiertas, sino la reproducibilidad del pipeline: el autor lo presenta explícitamente como una instantánea de investigación cuyo objetivo es documentar un camino completo desde el preentrenamiento en una única GPU CUDA hasta la inferencia local en Apple Silicon mediante MLX. El entrenamiento se realizó desde cero sobre texto en inglés de FineWeb-Edu (500.039.680 tokens procesados) en una sola NVIDIA H800 de 80 GB, y el checkpoint final se importó a MLX sin cuantizar.

Es relevante ahora por dos motivos. Primero, sirve como banco de pruebas inspeccionable para arquitecturas híbridas de atención lineal más delta gating, una línea activa de investigación frente al coste cuadrático de la atención completa. Segundo, su tamaño (0,2 GB de repositorio) permite reproducir el entrenamiento y la evaluación en hardware de consumo, algo poco habitual en modelos publicados. Su contexto nativo es de 4.096 tokens y el checkpoint no ha pasado por instruction tuning, optimización de preferencias ni RL, por lo que el texto generado es, en palabras del propio autor, poco fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido: Gated DeltaNet (GDN) + atencion causal de ventana deslizante (SWA) |
| Parametros totales | 36.814.994 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Parametros de embeddings compartidos | 33.095.680 (aproximadamente el 89,9% del total) |
| Parametros no de embedding | 3.719.314 |
| Longitud de contexto | 4.096 tokens nativos; maximo configurado de 32.768 tokens (no validado) |
| Tipos de cuantizacion | no disponible (el checkpoint se importo en MLX sin cuantizar; precision principal BF16) |
| Idiomas soportados | ingles (principal) |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint para MLX, BF16) |
| Numero de capas | 4 (disposicion GDN → GDN → SWA → GDN) |
| Dimension oculta | 256 |
| Red feed-forward | SwiGLU densa, dimension intermedia 768 |
| Normalizacion | Pre-RMSNorm; RMSNorm final antes de la proyeccion de salida |
| Cabezas GDN | 3 (dimensiones de cabeza: clave 64, valor 128) |
| Convolucion / tamano de chunk GDN | 4 / 64 |
| Cabezas SWA | 4 cabezas de consulta / 1 cabeza de clave-valor, dimension 64 |
| Ventana SWA | 1.024 tokens |
| Manejo de posicion | GDN: sin codificacion posicional (NoPE); SWA: RoPE, sin escalado |
| Tamano de vocabulario | 129.280 |
| Proyeccion de salida | Atada a los embeddings de entrada |
| Biblioteca declarada | mlx |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un decodificador autorregresivo de cuatro capas que alterna dos mecanismos de mezcla temporal. Tres de las cuatro capas usan Gated DeltaNet, una forma de atención lineal recurrente con regla delta y compuertas, implementada aqui con tamano de chunk 64 y convolucion de tamano 4, y sin codificacion posicional. La tercera capa usa auto-atención causal de ventana deslizante de 1.024 tokens con RoPE y sin escalado, con 4 cabezas de consulta y una única cabeza de clave-valor (esquema tipo GQA). Cada bloque emplea pre-RMSNorm, una red SwiGLU densa de dimension intermedia 768 y embeddings de entrada y salida atados. El vocabulario es inusualmente grande para el tamano del modelo (129.280 tokens), lo que explica que casi el 90% de los parametros resida en la matriz de embeddings y que cualquier comparacion basada solo en el total de parametros resulte enganosa.

El preentrenamiento partio de cero con objetivo de prediccion del siguiente token sobre `karpathy/fineweb-edu-100b-shuffle` (revision `4c8f30d6756da75362432a4d5569e1b229263b71`), en streaming con cache Parquet. Se procesaron 500.039.680 tokens en 3.815 pasos de optimizador, con longitud de secuencia 4.096, microbatch de 16 secuencias y dos microbatches de acumulacion (lote efectivo de 131.072 tokens por paso). Los optimizadores fueron Muon (tasa inicial 0,02) y AdamW auxiliar (0,0003), con fraccion de calentamiento 0,02, ratio minimo de tasa 0,1, weight decay 0,01 y recorte de gradiente 1,0. La pila CUDA uso PyTorch 2.14.0+cu130, kernels FLA para GDN, perdida fusionada, atención SDPA y compilacion activada. La perdida final en el lote de entrenamiento fue 4,232251 y la ultima perdida de validacion periodica registrada fue 4,206085 en el paso 3.800. El entrenamiento completo cupo en una sola NVIDIA H800 de 80 GB.

Como innovaciones destacables: la combinacion GDN + SWA en un modelo tan pequeno, el uso de Muon junto a AdamW, la ausencia de codificacion posicional en las capas recurrentes, y un pipeline reproducible de importacion del checkpoint a MLX sin cuantizar para evaluacion en Apple Silicon. El autor advierte que el limite de configuracion de 32K tokens no se ha validado con ningun entrenamiento ni evaluacion a esa longitud.

## Capacidades

- Generacion de texto autorregresiva en ingles: el modelo es un checkpoint base de prediccion del siguiente token, sin plantilla de conversacion ni formato de chat.
- Modelado de lenguaje y continuacion de texto: es su capacidad mas directamente medida, con una perplejidad de token de 71,394 en el protocolo de evaluacion del autor.
- Procesamiento de secuencias de hasta 4.096 tokens de forma nativa, y de hasta 1.024 tokens en la ruta de atencion deslizante con estado recurrente para el resto.
- Capacidad multilingue: no disponible; el modelo se entreno exclusivamente con texto en ingles y declara solo `en`.
- Tool calling / function calling: no disponible; no hay ajuste por instrucciones ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no ha recibido entrenamiento de instrucciones, preferencias ni RL.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponibles; la modalidad es exclusivamente texto a texto.
- Fine-tuning posterior: al ser un checkpoint base con licencia MIT y solo 3,72 M parametros no de embedding, es un sustrato viable para experimentos de ajuste a pequena escala.

## Casos de uso

- Investigacion en arquitecturas hibridas de atencion lineal: permite medir el comportamiento de una pila GDN → GDN → SWA → GDN de solo 4 capas y 3,72 M parametros no de embedding, aislando el efecto del delta gating y de la ventana deslizante sin el coste de entrenar un modelo grande.
- Desarrollo y depuracion de pipelines de entrenamiento: el autor documenta revision del dataset, numero de pasos, optimizadores, acumulacion y codigo CUDA/MLX, de modo que el repositorio sirve como referencia reproducible para validar un stack de preentrenamiento completo en una sola GPU.
- Estudios de inferencia local en Apple Silicon: el checkpoint se importa sin cuantizar en MLX y se evalua en Apple Silicon, por lo que es util para medir latencias y consumo de memoria de MLX frente a CUDA en un modelo que cabe holgadamente en memoria unificada.
- Experimentos de ajuste fino a pequena escala: con licencia MIT y 36,8 M parametros, se puede ajustar en una unica GPU de consumo para estudiar tasas de aprendizaje, congelacion de embeddings o el efecto del vocabulario de 129.280 tokens.
- Ablaciones sobre el reparto de parametros: dado que el 89,9% del modelo son embeddings atados, sirve para estudiar si conviene reducir vocabulario o desatar la proyeccion de salida en modelos diminutos.
- Docencia y formacion tecnica: un modelo de 0,2 GB permite mostrar de extremo a extremo tokenizacion, preentrenamiento causal, evaluacion con perplejidad y bits por byte, e inferencia local sin infraestructura de cluster.
- Analisis de metricas de evaluacion en crudo: los documentos de retencion y el protocolo de ventana deslizante con stride 512 y proyeccion de vocabulario en grupos de 128 posiciones son reproducibles para estudiar NLL, perplejidad y BPB.
- Comparacion de kernels y precisiones: al existir referencias guardadas de CUDA y comprobaciones numericas frente a MLX, es util para validar la equivalencia numerica entre implementaciones antes de escalar una arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor unicamente reporta evaluacion de modelado de lenguaje sobre texto crudo con MLX, sobre 114 documentos, 105.884 tokens y 520.011 bytes UTF-8 (documentos 768-881, indices basados en cero, del primer shard, pertenecientes a la particion de 1.024 documentos excluida del entrenamiento):

| Contexto maximo de puntuacion | NLL medio por token | Perplejidad por token | Bits por byte |
|---|---|---|---|
| 1.024 | 4,274308 | 71,830 | 1,255620 |
| 4.096 | 4,268213 | 71,394 | 1,253829 |

Notas de protocolo: cada documento parte de un estado de modelo reiniciado con un token EOS de contexto, sin plantilla de chat y sin EOS final puntuado; las ventanas moviles usan stride 512 y cada token original se puntua una sola vez; la proyeccion de vocabulario se fragmenta en grupos de 128 posiciones. La perplejidad es especifica de este tokenizador y de este protocolo. La diferencia entre ambos ajustes de contexto es minima, no se ha probado su significacion estadistica y no demuestra capacidad de contexto largo. Se mencionan tambien comprobaciones numericas CUDA/MLX sobre dos muestras cortas, pero la informacion disponible sobre esa tabla esta truncada. La perdida final de entrenamiento (4,232251) y la de validacion periodica (4,206085) no son benchmarks externos estandarizados.

## Requisitos de hardware

- Peso de los pesos en memoria: 36.814.994 parametros en BF16 equivalen a unos 73,6 MB; en FP32, unos 147,3 MB. El repositorio completo ocupa 0,2 GB.
- VRAM estimada para inferencia: por debajo de 1 GB en BF16 para secuencias cortas, incluyendo la matriz de embeddings (129.280 × 256 × 2 bytes ≈ 66,2 MB), que es la partida dominante.
- Estado de inferencia adicional: la capa SWA mantiene una cache de clave-valor limitada por la ventana de 1.024 tokens con una unica cabeza KV de 64 dimensiones (1.024 × 64 × 2 × 2 bytes ≈ 262 KB por capa en BF16); las tres capas GDN mantienen estado recurrente (64 × 128 × 3 elementos por capa, unos 49 KB en BF16 por capa).
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA H800 de 80 GB con PyTorch 2.14.0+cu130 y kernels FLA. Para inferencia, el tamano permite cualquier GPU moderna con soporte CUDA; las pruebas del autor se hicieron en Apple Silicon mediante MLX.
- GPU de consumo: si, cabe con enorme margen en cualquier GPU de consumo (por ejemplo, gamas RTX 30/40 o superiores) e incluso en sistemas con memoria unificada. Las dependencias de kernel (FLA para GDN) son el factor limitante real, no la VRAM.
- Opciones de despliegue: MLX es la biblioteca declarada y la ruta de evaluacion documentada; PyTorch es la ruta de entrenamiento. El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible, y requeriria kernels especificos para Gated DeltaNet y para la ventana deslizante.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Advertencia de importacion: el checkpoint se importo a MLX sin cuantizacion, por lo que no se dispone de variantes GGUF, AWQ, GPTQ ni de cuantizaciones de 8 o 4 bits verificadas.

## Comparativa con modelos similares

No se han proporcionado datos verificables de modelos comparables en la informacion disponible, y la busqueda web realizada devolvio unicamente recursos no relacionados (paginas de modelos generativos de imagen y video, generadores de activos 3D y portales generalistas de Hugging Face). No se dispone por tanto de cifras contrastadas de parametros, contexto, rendimiento o licencia de alternativas directas.

| Modelo | Parametros totales | Parametros no de embedding | Contexto nativo | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|---|
| Neko V0 Snapshot | 36.814.994 | 3.719.314 | 4.096 tokens | MIT | Hugging Face, biblioteca MLX, 0,2 GB | NLL 4,268213 y perplejidad 71,394 a 4.096 tokens |
| Alternativas de la misma categoria (modelos de investigacion diminutos con atencion lineal o hibrida preentrenados sobre FineWeb-Edu) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El criterio de comparacion correcto para este modelo no es el total de parametros, sino sus 3.719.314 parametros no de embedding: cualquier comparacion que use los 36,8 M totales estara dominada por la matriz de embeddings atada y resultara enganosa, tal como advierte el propio autor.

## Limitaciones y advertencias

- Es un checkpoint base de investigacion: no ha pasado por ajuste por instrucciones, optimizacion de preferencias ni aprendizaje por refuerzo. El texto generado es, segun el autor, poco fiable.
- Riesgo alto de alucinacion y de incoherencia: la perplejidad de token medida (71,394) y la perdida de validacion (4,206085) indican un modelado del lenguaje todavia debil, coherente con los 500 millones de tokens de entrenamiento.
- Contexto largo no validado: el limite de configuracion de 32.768 tokens no se ha respaldado con entrenamiento ni evaluacion; el checkpoint se entreno a 4.096 tokens y no se ha establecido capacidad fiable de recuperacion o razonamiento en contextos largos.
- Idioma unico: solo se entreno con texto en ingles y declara `en` en las etiquetas; no hay evidencia de competencia multilingue.
- Composicion del dataset: FineWeb-Edu es texto web filtrado por criterios educativos; hereda los sesgos, la sobrerrepresentacion tematica y las limitaciones de dominio de esa fuente.
- Reparto de parametros desequilibrado: el 89,9% de los parametros son embeddings atados con un vocabulario de 129.280 tokens, lo que reduce la capacidad efectiva fuera de la matriz de embeddings y complica las comparaciones con otros modelos.
- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 likes, y la unica evaluacion disponible es de dominio interno (una particion retenida del mismo dataset), no un benchmark externo independiente.
- Evaluacion parcialmente documentada: las comprobaciones numericas CUDA/MLX aparecen truncadas en la informacion disponible y no permiten verificar la equivalencia completa entre implementaciones.
- Dependencia de kernels: la ruta CUDA depende de FLA para GDN y de SDPA; el despliegue en runtimes populares (vLLM, llama.cpp, Ollama, TGI) no esta confirmado y puede requerir implementaciones propias.
- Licencia: MIT, sin restricciones declaradas para uso comercial. Aun asi, el propio autor lo destina a experimentos de arquitectura, desarrollo de sistemas de entrenamiento, estudios de inferencia local y ajuste fino a pequena escala, no a produccion.
- Sin cuantizaciones disponibles: no hay variantes de 8 o 4 bits publicadas que hayan sido validadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suisanka/Neko-V0-Snapshot-0928
- Dataset de preentrenamiento: https://huggingface.co/datasets/karpathy/fineweb-edu-100b-shuffle
- Revision del dataset usada: `4c8f30d6756da75362432a4d5569e1b229263b71`
- Documento de uso y formato del checkpoint: `USAGE.md`, referenciado en la model card; no se proporciona URL publica en la informacion disponible.
- Paper o blog tecnico del autor: no disponible.
- Repositorio de codigo: no disponible.
- Demos o espacios interactivos: no disponible.
- Enlaces adicionales de la busqueda web: no se han encontrado enlaces relevantes. Los resultados disponibles apuntan a recursos no relacionados (paginas de modelos generativos de imagen y video, generadores de activos 3D y directorios generalistas), por lo que se descartan como fuentes para esta ficha.
