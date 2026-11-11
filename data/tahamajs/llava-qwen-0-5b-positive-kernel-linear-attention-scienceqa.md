# tahamajs/llava-qwen-0.5b-positive-kernel-linear-attention-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-positive-kernel-linear-attention-scienceqa` es un checkpoint experimental derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la técnica de "attention surgery" del proyecto NeuralOps. El autor sustituye la atención cuadrática estándar en 18 de las 24 capas del decodificador Qwen2 por una variante de atención lineal basada en kernel positivo (`PositiveKernelLinearAttention`), que aplica la transformación ELU(x)+1 a las proyecciones Q y K para permitir la reordenación `(QK^T)V → Q(K^T V)` y reducir la complejidad de O(N²) a O(N). Las 6 capas restantes actúan como "anclas cuadráticas", configurando una arquitectura híbrida 3:1.

El modelo es un VLM (vision-language model) de 0,5 mil millones de parámetros que combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas. Se ha afinado sobre el subconjunto con imágenes de ScienceQA mediante destilación de conocimiento offline, con el objetivo declarado de explorar si la atención lineal puede preservar capacidades de razonamiento visual en modelos pequeños.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar el impacto de sustituir atención cuadrática por lineal en VLMs compactos. Los resultados declarados por el autor muestran una precisión del 31,25 % en ScienceQA (validación), frente al 63,75 % del modelo profesor, lo que evidencia una degradación sustancial de rendimiento tras la cirugía de atención. El checkpoint se distribuye únicamente como pesos delta de atención en FP16 (`attention_weights.safetensors`, 484 MB), no como modelo completo listo para inferencia directa con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal con kernel positivo ELU+1 en 18/24 capas + atención cuadrática en 6 capas ancla), con torre visual SigLIP congelada y proyector MLP de 2 capas |
| Parametros totales | 0,5 mil millones (modelo base LLaVA-Qwen-0.5B); el artefacto distribuido contiene solo los pesos de atención modificados (678 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base LLaVA-Qwen-0.5B, no especificada en la información) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, solo atención), más `surgical_manifest.json`, `config.json` y tokenizer |
| Dimensiones del decodificador | D=1024, H=16 cabezas, head_dim=64, 24 capas |
| Capas modificadas | 18/24 (`hybrid_3_1`); anclas cuadráticas en capas [3, 7, 11, 15, 19, 23] |
| Componentes congelados | Torre visual SigLIP (27 capas), proyector multimodal, MLPs y embeddings del decodificador |
| Tamaño en disco | 484,14 MB de pesos (499,35 MB paquete total); 71,5 % menos que el base FP16 (1,66 GB) |
| Librería | `neuralops` |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP congelada de 27 capas que extrae características de la imagen, un proyector MLP de dos capas que las alinea con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y head_dim 64. Sobre esta base, NeuralOps aplica una cirugía selectiva: reemplaza el módulo `self_attn` en 18 de las 24 capas por `PositiveKernelLinearAttention`, que mapea Q y K a un espacio de características estrictamente positivo mediante ELU(x)+1. Este mapeo permite reordenar el producto de atención y calcularlo en tiempo lineal respecto a la longitud de secuencia, además de evitar colapsos del denominador (NaN) gracias a la positividad estricta del kernel. Las capas [3, 7, 11, 15, 19, 23] conservan atención cuadrática estándar como anclas, resultando en un patrón híbrido 3:1.

El entrenamiento se realizó mediante destilación de conocimiento offline con la arquitectura de caché de representaciones de NeuralOps (§21.1), sobre el subconjunto con imágenes de ScienceQA. Se ejecutaron 163 pasos de optimización (51 en etapa 1, 112 en etapa 2) en una única NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 14.338 MB y una duración total de 120 segundos. Solo se entrenaron las atenciones modificadas y los layernorms del decodificador; la torre visual, el proyector, los MLPs y los embeddings permanecieron congelados. No se documenta el número de tokens de entrenamiento ni la composición completa del dataset más allá de ScienceQA.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales sobre contenido STEM (ciencias, matemáticas, tecnología) del dominio ScienceQA.
- Razonamiento multimodal de un solo turno orientado a selección de respuesta entre opciones.
- Conversación multi-turno básica (el checkpoint incluye `chat_template.json` y pipeline `conversational`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la metadata del modelo.
- No se documenta modo "thinking", audio ni otras modalidades adicionales.

## Casos de uso

- Investigación sobre atención lineal en VLMs: el checkpoint permite reproducir y analizar el efecto de sustituir atención cuadrática por `PositiveKernelLinearAttention` en un VLM pequeño, comparando directamente contra el base `llava-interleave-qwen-0.5b-hf` con el mismo pipeline de evaluación.
- Estudio de destilación de conocimiento offline: sirve como caso de referencia para medir cuánto conocimiento retiene un alumno de 0,5B tras 163 pasos de KD sobre ScienceQA, con telemetría completa de VRAM y tiempo de entrenamiento.
- Prototipado de eficiencia de memoria en secuencias largas: la atención lineal O(N) reduce el coste de memoria frente a atención cuadrática, útil para experimentos académicos sobre escalado de contexto en VLMs compactos.
- Docencia y formación en arquitecturas híbridas: el artefacto incluye un `surgical_manifest.json` con la topología exacta de las capas modificadas, lo que facilita explicar en clase cómo se realiza una cirugía de atención capa a capa.
- Benchmarking de operadores de atención alternativos: el zoo de NeuralOps permite comparar esta variante con otras (por ejemplo, atención lineal estándar o SSM) sobre el mismo modelo base y dataset.
- Validación de pipelines de serialización determinista: útil para ingenieros que necesiten verificar la reproducibilidad de pesos delta en FP16 con manifiestos de integridad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Profesor (base) | Alumno pre-KD (zero-shot) | Alumno post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy ScienceQA (validación, subconjunto con imágenes) | 63,75 % | 31,25 % | 31,25 % | +0,00 % |
| Perplejidad (PPL) | 2,45 | — | — | — |

Telemetría de entrenamiento declarada:

| Parámetro | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 3090 (24 GB) |
| Pasos de optimización | 163 (etapa 1: 51; etapa 2: 112) |
| Duración | 120,0 s |
| VRAM pico | 14.338 MB |
| VRAM del profesor en GPU | 0 MB (caché offline) |

La destilación no aportó mejora medible sobre el checkpoint zero-shot tras la cirugía (delta de 0,00 puntos porcentuales), y la brecha respecto al profesor es de 32,5 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base completo en FP16 ocupa aproximadamente 1,66 GB; el artefacto distribuido contiene solo los pesos de atención (484 MB), por lo que para inferencia real es necesario reconstruir el modelo completo cargando el base y aplicando el delta.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el modelo completo en FP16 (RTX 3060, RTX 4060, RTX 3090, A100, H100). El entrenamiento se validó en una RTX 3090 con 24 GB.
- Cabe en GPU de consumo: sí, en GPUs consumer con 6 GB o más en FP16; en cuantizaciones de 4 bits cabría en GPUs de 4 GB, aunque no se distribuyen pesos cuantizados oficialmente.
- Opciones de despliegue: la librería `neuralops` (`load_surgeried_model`) es la vía documentada; no se confirma compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, dado que el artefacto no es un checkpoint completo estándar de `transformers`.
- Latencia y throughput: no disponibles. La atención lineal en 18/24 capas debería reducir el coste computacional en secuencias largas, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/llava-qwen-0.5b-positive-kernel-linear-attention-scienceqa` | 0,5B | no disponible | 31,25 % | MIT | Pesos delta de atención en HF |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base/profesor) | 0,5B | no disponible | 63,75 % (declarado) | no disponible en la información | Checkpoint completo en HF |
| Otros VLMs de ~0,5B (p. ej. SmolVLM-500M) | ~0,5B | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es contra el propio modelo base: la cirugía de atención lineal reduce el tamaño del artefacto un 71,5 % pero degrada la precisión en ScienceQA en 32,5 puntos porcentuales según los datos del autor. No se dispone de comparaciones con otros operadores del zoo NeuralOps ni con VLMs de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de rendimiento: 31,25 % de precisión frente al 63,75 % del profesor, con delta nulo tras la destilación.
- No es un checkpoint autónomo: solo contiene pesos delta de atención; requiere cargar el base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía mediante `neuralops`.
- Sin verificación independiente: los benchmarks están declarados por el autor (`verified: false`).
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Dominio limitado: entrenado y evaluado exclusivamente sobre ScienceQA (subconjunto con imágenes), por lo que la generalización a otras tareas visuales no está caracterizada.
- Riesgo de alucinación: no cuantificado; en un modelo de 0,5B con atención lineal y precisión del 31 %, el riesgo es alto en preguntas fuera de distribución.
- Licencia MIT: permite uso comercial, pero el modelo base puede tener condiciones adicionales no detalladas en la información.
- Sin datos de sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Estado experimental: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte documentado.
- Fecha de creación declarada: 2026-11-11 (posterior a la fecha habitual de consulta), lo que conviene verificar antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-positive-kernel-linear-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/positive_kernel_linear_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
