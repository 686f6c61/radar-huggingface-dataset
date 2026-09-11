# UraionLabs/MiniCPM5-2B-oQ8e

## Resumen

MiniCPM5-2B-oQ8e es una cuantización mixta en formato MLX de 8 bits del modelo openbmb/MiniCPM5-2B, publicada por Uraion Labs. El modelo base es un transformer denso de 2.516.756.480 parámetros (aproximadamente 2,52B, de los cuales 1.981.982.720 no pertenecen a los embeddings) desarrollado por OpenBMB como la variante de escala 2B de la serie MiniCPM5. La versión oQ8e emplea una precisión uniforme de 8 bits en todos los tensores proyectados, incluida la cabeza de salida, con modo afín y tamaño de grupo 64, lo que produce un fichero de 2,49 GB (2.550,44 MB) y una media efectiva de aproximadamente 8,1 bits por peso.

El problema que resuelve esta variante es la ejecución local de un modelo conversacional y agéntico con ventana de 131.072 tokens en ordenadores Apple Silicon, sin necesidad de GPU dedicada ni de servicios en la nube. Al conservar la arquitectura estándar LlamaForCausalLM con Grouped-Query Attention (16 cabezas de consulta, 2 cabezas de clave/valor, dimensión de cabeza 128) y 42 capas, el checkpoint es compatible directamente con los runtimes oMLX y mlx-lm, y mantiene las capacidades del modelo original en generación de texto, razonamiento, código y llamada a herramientas.

La relevancia actual de esta ficha radica en que se trata de una cuantización publicada en septiembre de 2026 que forma parte de una familia completa de variantes (desde 2 hasta 8 bits) con asignación de precisión guiada por matrices de importancia. No obstante, el repositorio cuenta con 0 descargas y 0 «likes» en el momento de la consulta, y no incluye resultados de benchmarks propios de la versión cuantizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso, decoder-only) con GQA |
| Parámetros totales | 2.516.756.480 (~2,52B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | oQ8e: 8 bits uniforme, modo afín, tamaño de grupo 64; `lm_head` también en 8 bits; tensores no cuantizados en BF16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (repo de 2,7 GB; fichero de pesos de 2,49 GB) |

Datos adicionales de configuración: 42 capas, 16 cabezas de consulta y 2 cabezas de clave/valor con dimensión de cabeza 128, parámetros no pertenecientes a embeddings 1.981.982.720 (~1,98B), medias efectivas de ~8,1 bits por peso y dataset de calibración `oqe_code_multilingual` con 294 muestras.

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only estándar de tipo LLaMA, con normalización previa y Grouped-Query Attention como mecanismo de atención. La configuración de GQA (16 cabezas de consulta frente a 2 cabezas de clave/valor) reduce de forma notable el tamaño de la caché KV en contextos largos, lo que resulta determinante para explotar la ventana nativa de 131.072 tokens. El modelo tiene 42 capas y 2.516.756.480 parámetros totales, de los cuales alrededor de 1,98B corresponden a pesos no pertenecientes a la matriz de embeddings, un dato relevante porque implica que buena parte del presupuesto de parámetros se concentra en el vocabulario.

El entrenamiento del modelo original sigue el currículo de datos UltraData de OpenBMB, según los conjuntos declarados en la model card: `openbmb/Ultra-FineWeb`, `openbmb/UltraX-Preview`, `openbmb/Ultra-FineWeb-L3`, `openbmb/UltraData-Math`, `openbmb/UltraData-Code`, además de las fases de ajuste supervisado y refuerzo `UltraData-SFT-2605`, `UltraData-SFT-Agent-2609` y `UltraData-RL-2609`. La presencia de conjuntos específicos de agente y de RL indica que el modelo se ha optimizado en fases posteriores para llamada a funciones, salida estructurada y flujos agénticos. No se dispone del número exacto de tokens de entrenamiento ni de la composición porcentual del dataset en la información proporcionada.

La innovación técnica de esta variante concreta no está en el modelo base, sino en el flujo de cuantización. Uraion Labs aplica el procedimiento oMLX oQe con asignación de sensibilidad guiada por matriz de importancia, calibrado sobre un conjunto multilingüe de código de 294 muestras. En esta variante oQ8e la asignación resulta uniforme: no hay anulaciones por capa y todos los tensores proyectados, incluida la cabeza de salida, se cuantizan a 8 bits en modo afín con grupos de 64 elementos. Los pesos de LayerNorm, las escalas y los sesgos de embeddings permanecen en BF16, lo que explica que el coste efectivo sea de ~8,1 bits por peso en lugar de 8 exactos.

## Capacidades

- Generación de texto conversacional multi-turno con ventana nativa de 131.072 tokens.
- Razonamiento y resolución de problemas de matemáticas, apoyado en los conjuntos UltraData-Math del entrenamiento original.
- Generación y comprensión de código, con soporte declarado para flujos de asistente de programación y razonamiento sobre repositorios completos.
- Llamada a herramientas y funciones (tool calling / function calling), una de las capacidades destacadas por OpenBMB para el modelo base.
- Generación de salida estructurada, útil para integración con APIs y pipelines deterministas.
- Flujos agénticos y razonamiento multi-paso, reforzados mediante los conjuntos UltraData-SFT-Agent-2609 y UltraData-RL-2609.
- Capacidades multilingües limitadas a inglés y chino según los idiomas declarados.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito (thinking mode) en la información disponible de esta variante.

## Casos de uso

- Asistente de programación local en Mac: con 131.072 tokens de contexto, el modelo puede cargar ficheros completos y varios módulos de un repositorio a la vez para responder preguntas de arquitectura, refactorización o detección de errores, ejecutándose íntegramente en el equipo del desarrollador sin enviar código a terceros.
- Automatización de agentes con llamada a herramientas: al haber sido entrenado con conjuntos específicos de agente, puede emitir llamadas a funciones estructuradas y encadenar varios pasos (consultar una API, interpretar el resultado y generar la siguiente acción) dentro de un mismo bucle de conversación.
- Atención al cliente en inglés o chino: la ventana de 131k tokens permite mantener hilos de conversación muy largos con historial completo y documentación de producto adjunta, sin truncar el contexto ni perder referencias anteriores.
- Procesamiento de documentos largos en local: síntesis de informes, contratos o documentación técnica extensa en un portátil Apple Silicon, con la ventaja de que ningún dato sale del dispositivo, lo que facilita el cumplimiento de requisitos de confidencialidad.
- Generación de código en pipelines de integración continua: integrado mediante mlx-lm como paso de revisión automática, el modelo puede generar parches, mensajes de commit o pruebas unitarias a partir de un diff y del contexto de los ficheros afectados.
- Enrutamiento y clasificación con salida estructurada: al soportar JSON estructurado, puede actuar como clasificador previo en un sistema mayor, decidiendo qué submodelo o herramienta debe atender cada consulta antes de derivarla.
- Prototipado e investigación sobre cuantización: la existencia de ocho variantes (de 2 a 8 bits) con el mismo modelo base lo convierte en un banco de pruebas útil para medir el impacto de la precisión en tareas concretas sobre hardware Apple Silicon.
- Extracción de información de bases de código multilingües: la combinación de contexto largo y calibración sobre un conjunto de código multilingüe lo hace adecuado para tareas de resumen de repositorios o generación de documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible para esta variante cuantizada. La model card del autor no incluye tabla de evaluaciones y los resultados de búsqueda web consultados no contienen datos sobre el modelo.

El único dato de rendimiento proporcionado es una afirmación del modelo base: OpenBMB declara una media de 53,9 en su conjunto de evaluación propio para MiniCPM5-2B, señalando que es competitivo con modelos de 3B y 4B. No se especifica qué tareas componen ese conjunto ni cómo se desglosa la media, y no hay datos equivalentes para la versión oQ8e, por lo que no es posible cuantificar la degradación introducida por la cuantización.

## Requisitos de hardware

- VRAM: el fichero de pesos ocupa 2,49 GB. En Apple Silicon el modelo se ejecuta sobre memoria unificada, por lo que hay que sumar la caché KV y el overhead del runtime.
- Caché KV estimada: con 2 cabezas KV de dimensión 128 y 42 capas, cada token requiere 21.504 elementos en K+V. En BF16 esto equivale a unos 43 KB por token, es decir, aproximadamente 5,6 GB para una ventana completa de 131.072 tokens; en 8 bits serían unos 2,8 GB. Se trata de un cálculo derivado de la configuración de GQA declarada, no de una medición publicada.
- GPU recomendadas: el formato MLX solo se ejecuta de forma nativa en Apple Silicon (familias M1, M2, M3 y M4), por lo que no aplican A100, H100 ni RTX 4090 para esta variante concreta.
- Viabilidad en hardware de consumo: sí, cabe en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada para contextos moderados; para aprovechar los 131.072 tokens completos conviene disponer de 16 GB o más.
- Opciones de despliegue: oMLX (runtime de alto rendimiento para MLX en Apple Silicon) y mlx-lm. No es compatible directamente con vLLM, TGI, llama.cpp u Ollama, que requieren otros formatos o backends.
- Latencia y throughput: no disponible. La model card no publica mediciones de tokens por segundo ni de latencia de primer token para esta variante.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de cuantizaciones publicada por Uraion Labs sobre el mismo modelo base:

| Variante | Bits base | Perfil mixto | `lm_head` | Tamaño | Repositorio |
|---|---|---|---|---|---|
| oQ8e | 8 bits | Uniforme 8 bits | 8 bits | 2,49 GB | UraionLabs/MiniCPM5-2B-oQ8e |
| oQ6e | 6 bits | Mixto 6/8 bits (28 capas a 8 bits) | 6 bits | 1,95 GB | UraionLabs/MiniCPM5-2B-oQ6e |
| oQ5e | 5 bits | Mixto 5/6/8 bits (19 a 6b, 6 a 8b) | 6 bits | 1,67 GB | UraionLabs/MiniCPM5-2B-oQ5e |
| oQ4e | 4 bits | Mixto 4/5/6 bits (58 a 5b, 9 a 6b) | 4 bits | 1,38 GB | UraionLabs/MiniCPM5-2B-oQ4e |
| oQ3.5e | 3 bits | Mixto 3/5/6 bits (29 a 5b, 7 a 6b) | 6 bits | 1,17 GB | UraionLabs/MiniCPM5-2B-oQ3.5e |
| oQ3e | 3 bits | Mixto 3/5/6 bits (31 a 5b, 7 a 6b) | 3 bits | 1,08 GB | UraionLabs/MiniCPM5-2B-oQ3e |
| oQ2.7e | 2 bits | Mixto 2/5/6/8 bits (23 a 5b, 8 a 6b, lm_head a 8b) | 8 bits | 0,98 GB | UraionLabs/MiniCPM5-2B-oQ2.7e |
| oQ2e | 2 bits | Mixto 2/5/6 bits (10 a 5b, 6 a 6b) | 6 bits | 0,88 GB | UraionLabs/MiniCPM5-2B-oQ2e |

Comparativa con modelos de otras familias de tamaño similar: no disponible. La información proporcionada no incluye datos de rendimiento de alternativas como Qwen, Llama o Gemma en la franja de 2B, ni resultados que permitan establecer una comparación cuantitativa. La única referencia del autor es que el modelo base alcanza una media de 53,9 en el conjunto de evaluación de OpenBMB y que resulta competitivo con modelos de 3B y 4B, sin detallar las tareas evaluadas.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino. No hay soporte verificado de castellano ni de otras lenguas, por lo que el rendimiento en español es desconocido y previsiblemente inferior.
- Riesgo de alucinación: no se publica ninguna evaluación de veracidad ni de tasa de alucinación para esta variante. Al ser un modelo de 2B, la tasa de error factual tiende a ser mayor que en modelos de mayor tamaño.
- Degradación por cuantización: la model card no incluye benchmarks de la versión oQ8e frente al modelo base, por lo que no se puede cuantificar la pérdida de calidad. A 8 bits la degradación suele ser baja, pero no está medida ni documentada en este repositorio.
- Dependencia de plataforma: el formato MLX limita la ejecución a Apple Silicon. No hay pesos GGUF ni safetensors estándar de PyTorch en este repositorio, de modo que desplegarlo en servidores con GPU NVIDIA o AMD requiere convertir los pesos a otro formato.
- Licencia: Apache-2.0, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia y se indique los cambios. No se han declarado restricciones adicionales, cláusulas de uso aceptable ni requisitos de atribución más allá de los de Apache-2.0.
- Adopción nula: el repositorio registra 0 descargas y 0 valoraciones en la fecha de consulta, lo que implica ausencia de validación independiente por parte de la comunidad.
- Datos de calibración: la cuantización se calibró con solo 294 muestras de un conjunto de código multilingüe. Es un conjunto pequeño y sesgado hacia código, lo que puede afectar de forma desigual al rendimiento en tareas no relacionadas con programación.
- Contexto largo: aunque el modelo declara 131.072 tokens, no se aportan métricas de rendimiento en tareas de recuperación dentro de contextos largos, y el consumo de memoria de la caché KV crece de forma lineal con la longitud, lo que puede hacer inviable la ventana completa en equipos con poca memoria unificada.
- Fecha de publicación: el repositorio está fechado en septiembre de 2026 y no se han encontrado referencias externas, revisiones ni publicaciones independientes sobre esta cuantización concreta.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ8e
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Runtime oMLX: https://github.com/jundot/omlx
- mlx-lm (MLX Examples): https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm
- Uraion Labs: https://uraionlabs.com
- Paper referenciado (arxiv:2506.07900): https://arxiv.org/abs/2506.07900
- Paper referenciado (arxiv:2602.09003): https://arxiv.org/abs/2602.09003
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset UltraX-Preview: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Dataset UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset UltraData-RL-2609: https://huggingface.co/datasets/openbmb/UltraData-RL-2609
