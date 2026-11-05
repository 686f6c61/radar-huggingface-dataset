# tablinum/Moon-Beam-8B-A1B-MLX-8bit-Preview

## Resumen

Moon-Beam 8B A1B es un modelo de lenguaje de arquitectura mixta de expertos (MoE) desarrollado por Tablinum, construido sobre el modelo base inclusionAI Ling-3.0-tiny y complementado con una biblioteca de conocimiento recuperable denominada *engram*. El modelo cuenta con 8 mil millones de parámetros totales, aproximadamente 1 mil millones activos por token, y una ventana de contexto de 131.072 tokens. Esta ficha corresponde concretamente a la variante cuantizada a 8 bits en formato MLX para Apple Silicon, publicada como versión preliminar (release candidate, ronda 1b).

El modelo está diseñado para responder a partir de pasajes recuperados: se entrenó con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. Su propuesta diferencial es el acoplamiento con la biblioteca *engram* (servida mediante el proxy `terrabeam`), que según las cifras preliminares del autor eleva de forma drástica la precisión en tareas de conocimiento factual (por ejemplo, SimpleQA pasa de 28 a 593 respuestas correctas sobre 1.000 con thinking activado).

Es relevante ahora porque demuestra que un modelo pequeño con recuperación estructurada puede aproximarse en tareas de conocimiento a modelos mucho mayores, y porque ofrece un artefacto listo para ejecutarse en hardware de consumo Apple Silicon con un tamaño de 8,3 GB. No obstante, se trata de una versión *preview* con métricas aún en proceso de remedición y con soporte exclusivo del idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre base Ling-3.0-tiny (tag `bailing_hybrid`), con código personalizado (`custom_code`) |
| Parametros totales | 7.893.355.648 (~7,9 mil millones) |
| Parametros activos | ~1 mil millones por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 8 bits (esta variante MLX); el ecosistema incluye además MLX 4-bit, GGUF Q4_K_M, Q6_K, Q8_0 y BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, 8 bits); 8,9 GB de repositorio, 8,3 GB en ejecución |

## Arquitectura y entrenamiento

Moon-Beam emplea una arquitectura de mezcla de expertos (MoE) derivada de inclusionAI Ling-3.0-tiny, con etiqueta `bailing_hybrid` en el repositorio y requisito de código personalizado para su carga. La relación total/activos es de aproximadamente 8:1, lo que permite inferencia con un coste computacional cercano a un modelo denso de 1B pese a almacenar casi 8B de parámetros. La ventana de contexto alcanza los 131.072 tokens.

El ajuste se realizó mediante QLoRA (ronda 1b) sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. La innovación central no es arquitectónica sino de acoplamiento con recuperación: el modelo está entrenado para responder a partir de pasajes inyectados en un formato concreto, que el proxy `terrabeam` reproduce de forma automática. La variante aquí descrita se convirtió con mlx-lm 0.32 a 8 bits en todos los componentes, con una concordancia top-1 frente a BF16 del 99,20% en tokens mixtos (chat, código y matemáticas) y del 97,40% en WikiText (KLD de 0,0008 y 0,0038 respectivamente). El autor señala que la biblioteca Tablinum-2 es la que da soporte a estos pesos, mientras que Tablinum-3 (aproximadamente el doble de tamaño) sigue en construcción.

## Capacidades

- Generación de texto conversacional y razonamiento con modo *thinking* activable y desactivable.
- Razonamiento matemático: 96,2% en GSM8K (400 preguntas) con thinking activado en la evaluación preliminar.
- Llamadas a herramientas (*tool calling* / *function calling*), indicadas en las etiquetas del modelo y presentes en los datos de ajuste.
- Conversación multiturno con seguimiento de contexto: 94,0% de acierto en la primera pregunta y 93,3% en la segunda sobre 150 pares.
- Respuesta aumentada por recuperación: entrenado para responder a partir de pasajes recuperados en un formato específico, servidos mediante el proxy `terrabeam`.
- Capacidad de abstención y respuesta parcial: el protocolo de evaluación separa abstenciones y respuestas parciales de las correctas.
- Soporte exclusivamente en inglés.

## Casos de uso

- **Atención al cliente automatizada con base de conocimiento**: el modelo puede gestionar conversaciones multiturno con contexto largo (131.072 tokens) y responder a partir de pasajes recuperados de la documentación corporativa inyectados por `terrabeam`, reduciendo respuestas inventadas cuando la recuperación es pertinente.
- **Asistente de soporte técnico en local sobre Apple Silicon**: con 8,3 GB en 8 bits, puede desplegarse en un Mac con chip de la serie M mediante `mlx_lm.server`, ofreciendo una API compatible con OpenAI sin depender de la nube.
- **Resolución de problemas matemáticos paso a paso**: con thinking activado alcanza un 96,2% en GSM8K, adecuado para tutores educativos o verificación de cálculos en pipelines internos.
- **Agentes con llamadas a herramientas**: las etiquetas de *tool-calling* y los datos de ajuste permiten integrarlo en flujos que consulten APIs, bases de datos o servicios externos mediante function calling.
- **Sistemas de preguntas y respuestas sobre documentación interna**: con el proxy `terrabeam` en modo `--memory long-term`, puede responder consultas sobre manuales, normativas o wikis internas aprovechando la ventana completa de 131K tokens.
- **Prototipado e investigación en recuperación aumentada**: al estar entrenado explícitamente para responder con pasajes, sirve como banco de pruebas para comparar estrategias de recuperación (por ejemplo, medir la ganancia de precisión al inyectar contexto frente a responder en cerrado).
- **Generación de código asistida en local**: con concordancia top-1 del 99,20% frente a BF16 en tokens mixtos que incluyen código, es viable para autocompletado y revisión en entornos de desarrollo sin conexión.

## Benchmarks y rendimiento

Resultados preliminares publicados por el autor (evaluación del 4 de noviembre; protocolo con temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos y ventana completa de 131K). El autor advierte que las cifras marcadas como preliminares están siendo remedidas.

| Test (tamaño de muestra) | Thinking on | Thinking off |
|---|---:|---:|
| GSM8K (400) | 96,2% | 92,5% |
| Multiturno, primera pregunta (150) | 94,0% | 86,7% |
| Multiturno, segunda pregunta (150) | 93,3% | 88,7% |
| MMLU-Pro (700) | 63,9% | 44,0% |

Impacto de la recuperación (thinking on, cerrado → con pasajes recuperados):

| Test (preguntas) | Thinking on | Thinking off |
|---|---:|---:|
| EngramBench (503) | 12,9% → 85,7% | 10,1% → 87,5% |
| SimpleQA (1000) | 2,8% → 59,3% | 2,6% → 57,5% |
| AA-Omniscience (200) | 10,0% → 26,5% | 5,0% → 26,5% |

En EngramBench con thinking desactivado y pasajes de la propia tabla de cada pregunta, el modelo acertó 440 de 503 (87,5%). El modelo base Ling sin ajuste alcanzó un 59,2% en SimpleQA con los mismos pasajes y thinking activado, frente al 59,3% de la ronda 1b, lo que según el autor indica que la ganancia principal proviene de proporcionar pasajes relevantes. En MMLU-Pro, 70 de 700 respuestas con thinking alcanzaron el límite de 30.000 tokens de salida.

Fidelidad de cuantización frente a BF16:

| Build | Tamaño de fichero | Concordancia top-1 mixto | Concordancia top-1 WikiText |
|---|---:|---:|---:|
| Q4_K_M | 4,94 GB | 97,65% | 92,74% |
| Q6_K | 7,23 GB | 98,92% | 96,74% |
| Q8_0 | 8,41 GB | 99,18% | 97,20% |
| MLX beam | 4,92 GB | 96,75% | 90,92% |
| MLX 8-bit | 8,87 GB | 99,20% | 97,40% |

## Requisitos de hardware

- **VRAM / memoria unificada**: 8,3 GB en la variante MLX 8-bit; 8,87 GB de tamaño de fichero según los shards publicados (el autor indica 8,9 GB de repositorio). La variante MLX 4-bit ocupa 4,6 GB y la GGUF Q4_K_M 4,94 GB.
- **Hardware objetivo**: Apple Silicon (MLX). El autor indica que la conversión se probó en CPU con MLX; no se documentan requisitos para GPU NVIDIA.
- **GPU de consumo**: cabe en equipos Apple Silicon con memoria unificada suficiente (por encima de ~10 GB recomendable para 8 bits, holgado con 16 GB). Para las variantes GGUF de 4 bits, un equipo con 8 GB de memoria unificada sería el mínimo teórico.
- **Opciones de despliegue**: `mlx_lm.generate` y `mlx_lm.server` (API estilo OpenAI) con `mlx-lm>=0.32`; proxy `terrabeam` para inyectar pasajes recuperados. Para las variantes GGUF, el ecosistema habitual de llama.cpp/Ollama, aunque no se documenta explícitamente en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Moon-Beam 8B A1B (MLX 8-bit) | 7,9B totales, ~1B activos | 131.072 | MIT | MLX, GGUF, BF16 en HuggingFace | Entrenado para respuesta con recuperación (*engram*) |
| inclusionAI Ling-3.0-tiny | No disponible en la información | No disponible | No disponible | No disponible | Modelo base sobre el que se ajusta Moon-Beam |
| Modelos densos de ~8B | ~8B | Variable | Variable | Variable | Referencia de categoría; sin datos de comparación directa en la información disponible |

No se dispone de datos de benchmarks comparativos con alternativas concretas en la información proporcionada; las únicas comparaciones publicadas son frente a BF16 del propio modelo y frente al base Ling sin ajustar (59,2% frente a 59,3% en SimpleQA con recuperación).

## Limitaciones y advertencias

- **Estado preliminar**: los pesos son un *release candidate* (ronda 1b) y las cifras marcadas como preliminares están siendo remedidas; los resultados pueden variar.
- **Dependencia de la recuperación**: el modelo está entrenado para responder a partir de pasajes inyectados en un formato concreto; sin el proxy `terrabeam` o sin pasajes relevantes, el rendimiento en conocimiento factual cae drásticamente (SimpleQA del 59,3% al 2,8%).
- **Idioma**: solo inglés; no se documenta soporte multilingüe.
- **Alucinación**: no se publican tasas de alucinación específicas; el protocolo de evaluación separa abstenciones y respuestas parciales, lo que sugiere que el modelo puede abstenerse, pero no se cuantifica el riesgo en producción.
- **Límite de salida en thinking**: en MMLU-Pro, 70 de 700 respuestas alcanzaron el tope de 30.000 tokens de salida, lo que puede truncar razonamientos largos.
- **Hardware**: la variante aquí descrita es específica de MLX y Apple Silicon; no se documenta soporte para CUDA en esta ficha.
- **Licencia**: MIT, permisiva para uso comercial, aunque el modelo base Ling-3.0-tiny puede tener condiciones propias no detalladas en la información disponible; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- **Madurez del ecosistema**: 0 descargas y 0 likes en el momento de la consulta; biblioteca Tablinum-2 en uso y Tablinum-3 aún en construcción, lo que implica posible volatilidad en las herramientas asociadas.

## Enlaces

- [Modelo en HuggingFace (MLX 8-bit, esta ficha)](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit-Preview)
- [Modelo base: tablinum/Moon-Beam-8B-A1B-Preview](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview)
- [Variante MLX 4-bit](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-Preview)
- [Variante GGUF](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview)
- [Notas de evaluación y protocolo](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/README.md)
- [Resultados preliminares (JSON)](https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/benchmarks_preliminary_1104.json)
- [Repositorio terrabeam (proxy de recuperación)](https://github.com/chadstthomas-svg/terrabeam)
