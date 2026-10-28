# techdotus/Ethoric-10M

## Resumen

Ethoric-10M es un modelo de lenguaje de tipo decoder-only con 9,97 millones de parámetros (9.965.664 según los pesos en safetensors), desarrollado por el usuario techdotus (Tech.us). Se trata de un SLM (small language model) orientado a la investigación y a la experimentación con arquitecturas, no a uso conversacional general: su ventana de contexto es de 512 tokens y solo está entrenado en inglés.

El modelo parte de una base transformer moderna (RoPE, grouped-query attention y SwiGLU) y añade cuatro modificaciones propias: normalización Peri-LN (RMSNorm antes y después de cada subcapa), capas Canon (convoluciones causales depthwise que mezclan cada token con los 3 anteriores), QK-norm por cabeza y una puerta sigmoide por cabeza de atención. El entrenamiento se realizó sobre 15.000 millones de tokens con una fase posterior de cooldown de 4.000 millones de tokens.

Su relevancia es doble: por un lado, es un banco de pruebas reproducible y de licencia MIT para estudiar variantes arquitectónicas en un presupuesto de cómputo mínimo; por otro, sirve como referencia de la frontera actual de los modelos de ~10M de parámetros, con resultados publicados en ARC-Easy, ARC-Challenge, HellaSwag, PIQA y ArithMark-3 bajo la metodología del Open SLM Leaderboard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RMSNorm, RoPE, GQA, SwiGLU) con Peri-LN, capas Canon, QK-norm por cabeza y puerta sigmoide por cabeza |
| Parámetros totales | 9.965.664 (9,97M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (máximo de secuencia) |
| Tipos de cuantización | No se han publicado variantes cuantizadas; los pesos se distribuyen en FP32 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, vía transformers con `trust_remote_code=True` (arquitectura y `generate()` personalizados) |
| Capas | 12 |
| Dimensión oculta (d_model) | 256 |
| Cabezas de atención | 8 |
| Cabezas KV (GQA) | 2 |
| Dimensión por cabeza | 32 |
| Tamaño intermedio de la FFN | 721 |
| Normalización | Peri-LN (RMSNorm, ε = 1e-5) + QK-norm por cabeza |
| Capas Canon | Convolución causal depthwise, kernel 4 (antes de atención y antes de la MLP) |
| Atención local | Ventana de 16 tokens en la capa 0; atención causal completa en las capas 1-11 |
| RoPE theta | 10.000 |
| Tamaño de vocabulario | 5.048 |
| Embeddings ligados | Sí |
| Precisión | Pesos en FP32 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 12 capas y 256 dimensiones ocultas, con 8 cabezas de atención y solo 2 cabezas KV (GQA), lo que reduce el coste de caché KV a 32 dimensiones por cabeza. La FFN SwiGLU tiene un tamaño intermedio de 721. Sobre esa base, el autor introduce cuatro cambios: Peri-LN aplica RMSNorm antes y después de cada subcapa para estabilizar el entrenamiento; las capas Canon insertan convoluciones causales depthwise de kernel 4 antes de la atención y antes de la MLP, de modo que cada token incorpora información de los tres tokens anteriores; la QK-norm normaliza queries y keys dentro de cada cabeza; y una puerta sigmoide por cabeza regula cuánta señal de salida de cada cabeza pasa al bloque. La capa 0 usa atención local de 16 tokens y el resto atención causal completa, con RoPE theta de 10.000 y 512 tokens de longitud máxima.

El entrenamiento se dividió en dos fases. La fase estable consumió 15.000 millones de tokens con una mezcla amplia de texto educativo web, libros de texto sintéticos, datos de pregunta-respuesta y matemáticas (FineWeb-Edu 35%, TxT360-v2 20%, Cosmopedia 19,5%, Tiny Strange Textbooks 11%, OpenMathInstruct-2 11% y otras fuentes). La fase de cooldown, con 4.000 millones de tokens y learning rate decreciente, desplazó la mezcla hacia matemáticas y texto de estilo tutorial de mayor calidad (FineMath, FinePhrase, ELI5, GooAQ), eliminando Tiny Strange Textbooks, High-Quality English Sentences y ScienceQA. El empaquetado de secuencias usa document masking: ni la atención ni las convoluciones Canon cruzan un token EOS. La model card no menciona fases de RLHF ni DPO, por lo que se trata de un modelo base preentrenado.

## Capacidades

- Generación de texto causal en inglés: continuación de texto, autocompletado y generación de hasta 512 tokens incluyendo el prompt.
- Decodificación greedy y muestreo top-k (con `do_sample=True`, `temperature` y `top_k`); otras opciones como `repetition_penalty` se ignoran.
- Razonamiento y conocimiento factual de nivel educativo básico, con resultados medidos en ARC-Easy (37,58%), ARC-Challenge (24,66%) y HellaSwag (28,75%).
- Aritmética simple: 41,60% en ArithMark-3, un benchmark de operaciones aritméticas.
- Sentido físico y de sentido común básico: 59,85% en PIQA.
- Sin soporte de tool calling ni function calling.
- Sin capacidad de agente ni de razonamiento multi-paso explícito.
- Sin modo "thinking", sin visión, sin audio y sin capacidades multimodales.
- Multilingüismo: únicamente inglés; no se declara soporte de otros idiomas.
- Capacidad de ejecución en CPU y dispositivos de muy bajos recursos gracias a su tamaño (< 10M de parámetros).

## Casos de uso

- Investigación en arquitecturas de transformers: el modelo permite experimentar con Peri-LN, capas Canon, QK-norm por cabeza y puertas sigmoide en un presupuesto de una sola GPU consumer o incluso CPU, y comparar contra la base sin estas modificaciones.
- Reproducción de la frontera de los SLM de ~10M: sirve como referencia para validar pipelines de evaluación con la metodología del Open SLM Leaderboard (ARC, HellaSwag, PIQA, ArithMark) antes de escalar a modelos mayores.
- Prototipado rápido de pipelines de `transformers`: al ser un checkpoint pequeño con `custom_code`, es útil para probar integraciones de `trust_remote_code`, serialización safetensors y decodificación personalizada sin coste de infraestructura.
- Generación de texto corto en el borde (edge): con ~40 MB de pesos en FP32, cabe en un navegador, en una Raspberry Pi o en un contenedor ligero para tareas de autocompletado o generación de plantillas de hasta 512 tokens.
- Generación de datos sintéticos a pequeña escala para tareas educativas: continuación de enunciados, preguntas de ciencia o explicaciones estilo tutorial, dado el sesgo del corpus hacia FineWeb-Edu, Cosmopedia y FineMath.
- Evaluación de tokenizadores y vocabularios reducidos: su vocabulario de 5.048 tokens y sus embeddings ligados lo convierten en un banco de pruebas para estudiar el impacto del vocabulario en modelos pequeños.
- Docencia y divulgación: ejemplo completo y abierto (MIT) de arquitectura, entrenamiento en dos fases, document masking y evaluación, adecuado para cursos de LLM.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`), todos en 0-shot con `acc_norm` y metodología del Open SLM Leaderboard. Ninguno está verificado de forma independiente (`verified: false`).

| Benchmark | Métrica | Ethoric-10M | ForgePlex-M2.2-10M | heron1i-flash-lite-v2 | min-spark-1.6 |
|---|---|---|---|---|---|
| HellaSwag (validation) | acc_norm 0-shot | 28,75% | 29,19% | 28,86% | 28,52% |
| ARC-Easy (test) | acc_norm 0-shot | 37,58% | 39,77% | 38,89% | 38,30% |
| ARC-Challenge (test) | acc_norm 0-shot | 24,66% | 22,70% | 23,38% | 22,44% |
| PIQA (validation) | acc_norm 0-shot | 59,85% | 59,79% | 58,54% | 59,14% |
| ArithMark-3 (test) | acc_norm 0-shot | 41,60% | 37,40% | 36,70% | 36,90% |
| Int Index | índice agregado | 12,94 | 12,12 | 11,11 | 11,08 |

Los datos de los modelos comparados proceden, según el autor, del Open SLM Leaderboard. Ethoric-10M obtiene el mejor resultado en ARC-Challenge, PIQA, ArithMark-3 e Int Index.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier configuración. Los pesos en FP32 ocupan aproximadamente 40 MB; en FP16/BF16, unos 20 MB; en INT8, unos 10 MB. El cuello de botella real es la caché KV, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria sirve; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, una iGPU o una CPU moderna son suficientes.
- Cabe en GPU consumer: sí, en todas las GPU consumer de los últimos 15 años, y también en CPU, Raspberry Pi y entornos de navegador (con el runtime adecuado).
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True` es la vía soportada, ya que la arquitectura y el `generate()` son personalizados. No hay confirmación de soporte en vLLM, TGI, llama.cpp, Ollama ni MLX; al tratarse de una arquitectura custom, lo previsible es que requiera una implementación específica.
- Latencia y throughput estimados: no se han publicado mediciones. Con 9,97M de parámetros y 512 tokens de contexto, el coste por token es marginal en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Punto fuerte medido | Disponibilidad |
|---|---|---|---|---|---|---|
| Ethoric-10M | 9,97M | 512 | MIT | en | ArithMark-3 41,60%, ARC-Challenge 24,66%, Int Index 12,94 | HuggingFace, transformers con código custom |
| ForgePlex-M2.2-10M | 9,99M | no disponible | no disponible | no disponible | HellaSwag 29,19%, ARC-Easy 39,77% | no disponible en la información proporcionada |
| heron1i-flash-lite-v2 | 9,92M | no disponible | no disponible | no disponible | HellaSwag 28,86%, ARC-Easy 38,89% | no disponible en la información proporcionada |
| min-spark-1.6 | 9,96M ×4 (*) | no disponible | no disponible | no disponible | HellaSwag 28,52%, PIQA 59,14% | no disponible en la información proporcionada |

(*) El autor indica "9,96M×4" sin especificar si se refiere a un ensemble, a cuatro variantes o a otra configuración; no se dispone de aclaración.

Los cuatro modelos son comparables en tamaño (≈10M de parámetros) y en metodología de evaluación. Ethoric-10M destaca en tareas de matemáticas y razonamiento científico, mientras que ForgePlex-M2.2-10M y heron1i-flash-lite-v2 rinden algo mejor en HellaSwag y ARC-Easy. La ventaja diferencial de Ethoric-10M en esta comparativa es la licencia MIT explícita.

## Limitaciones y advertencias

- Modelo base sin alineación: no hay RLHF ni DPO, por lo que no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Ventana de contexto muy corta: 512 tokens incluyendo prompt y generación; no admite documentos largos, historiales multi-turno extensos ni RAG con contexto amplio.
- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas, y el vocabulario de 5.048 tokens está optimizado para inglés.
- Alto riesgo de alucinación: con ~10M de parámetros y 15B tokens de entrenamiento, la cobertura factual es muy limitada; los resultados en ARC-Challenge (24,66%) y HellaSwag (28,75%) están cerca del azar en tareas de razonamiento.
- Sesgos heredados del corpus: FineWeb-Edu, Cosmopedia y los datasets de QA educativos introducen sesgos de dominio (texto educativo, estilo tutorial) y los sesgos propios de los datos web filtrados; no se ha publicado ninguna evaluación de sesgos.
- Generación restringida: solo greedy y top-k; `repetition_penalty` y otras opciones de `generate()` se ignoran, lo que limita el control sobre repeticiones y coherencia.
- Dependencia de `trust_remote_code`: requiere ejecutar código del autor, lo que implica una revisión de seguridad antes de desplegarlo en producción.
- Benchmarks no verificados: todos los resultados del `model-index` están marcados como `verified: false` y proceden del propio autor.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero no hay garantías ni soporte; conviene conservar el aviso de copyright.
- No apto para producción en tareas de precisión (atención al cliente, código, decisiones automatizadas): su escala no permite garantías de calidad ni de robustez frente a entradas adversarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/techdotus/Ethoric-10M
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
- Datasets referenciados en la model card (identificadores de HuggingFace, sin URL verificada): `HuggingFaceFW/fineweb-edu`, `IFM/TxT360-v2`, `HuggingFaceTB/cosmopedia`, `nampdn-ai/tiny-strange-textbooks`, `nvidia/OpenMathInstruct-2`, `agentlans/high-quality-english-sentences`, `HuggingFaceFW/finephrase`, `HuggingFaceTB/finemath`, `HuggingFaceTB/smollm-corpus`, `sentence-transformers/eli5`, `sentence-transformers/gooaq`, `sentence-transformers/natural-questions`, `microsoft/orca-math-word-problems-200k`, `openbmb/UltraData-Math`, `armanc/ScienceQA`, `AxiomicLabs/FactBase-DCLM`, `IFM/Pretrain-Behaviors`.
- Open SLM Leaderboard: mencionado como fuente de la metodología y de los resultados comparativos, sin URL en la información disponible.
