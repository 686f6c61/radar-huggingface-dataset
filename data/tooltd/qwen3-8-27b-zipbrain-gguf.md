# tooltd/Qwen3.8-27B-ZipBrain-GGUF

## Resumen

Qwen3.8-27B-ZipBrain-GGUF es una colección de cuantizaciones GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario tooltd. El modelo base es un transformer multimodal de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por el equipo Qwen, con licencia Apache 2.0 y pipeline image-text-to-text, lo que indica capacidad de entrada de imagen y texto. Esta ficha se centra en la versión cuantizada distribuida en este repositorio, no en el modelo original.

La aportación principal del repositorio es la metodología ZB-ZipBrain, una cuantización de precisión mixta que asigna bits por tensor mediante un criterio de coste marginal tasa-distorsión combinado con calibración por matriz de importancia (imatrix). El objetivo declarado es identificar puntos óptimos de BPW (bits por peso) que maximicen la calidad dentro de presupuestos de VRAM concretos: alrededor de 4 BPW para GPUs de 16 GB y alrededor de 3 BPW para tarjetas de 12 GB.

El interés actual del repositorio reside en que permite ejecutar un modelo de 27B con capacidades multimodales en hardware de consumo, con evaluaciones publicadas de calidad (EvalPlus y perplejidad/KL sobre wikitext-2) frente a cuantizaciones de referencia como las de unsloth, bartowski o mradermacher. El repositorio ocupa 266,7 GB e incluye múltiples variantes de cuantización, con 3.104 descargas y 23 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; pipeline image-text-to-text) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ4_XS, IQ4_NL, IQ3_M_XL, IQ3_M_L, IQ3_XXS, IQ3_S_XL, Q3_K_XL, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_K_XL, entre otras variantes ZB (ZB4.97-GOD, ZB4.65-PRO, ZB4.60-PRO, ZB4.55-PRO, ZB4.48-STD, ZB4.36-STD, ZB4.14-MIN, ZB4.00-MIN, ZB3.88-MIN, ZB3.73-MIN, ZB3.00) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 266,7 GB con múltiples ficheros |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en los datos proporcionados: no se especifica si es un transformer denso, MoE o híbrido, ni la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. El pipeline declarado (image-text-to-text) confirma que el modelo acepta entradas de imagen y texto y genera texto, por lo que incorpora algún componente de visión, pero su naturaleza exacta no está documentada en esta información.

La innovación técnica documentada corresponde al proceso de cuantización, no al entrenamiento. ZB-ZipBrain combina un criterio de coste marginal tasa-distorsión con calibración mediante importance matrix para decidir la asignación de bits por tensor, buscando puntos de Pareto óptimos en BPW. Las variantes marcadas como v5 combinan ZB con "Pelicanmaxxing" para evaluación visual, con ajuste iterativo hasta alcanzar calidad estable. El autor indica que las evaluaciones EvalPlus se realizaron en modo no-thinking, con kvcache ctk q4_0 y ctv q4_0, y que la perplejidad se midió con llama-perplexity sobre wikitext-2-raw con divergencia KL respecto a una línea base BF16 (Mean PPL = 6.950493).

## Capacidades

- Generación de texto conversacional (tag "conversational") y procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Generación de código: las evaluaciones publicadas con HumanEval (164 tareas) y MBPP (378 tareas) en pass@1 demuestran competencia en síntesis de código Python.
- Modo no-thinking documentado en las evaluaciones; no hay información sobre un modo thinking explícito en esta ficha.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión: implícitas por el pipeline image-text-to-text y por las variantes v5 ajustadas con evaluación visual, pero sin detalle de tareas concretas.
- Despliegue compatible con endpoints (tag "endpoints_compatible") y ejecución en llama.cpp.

## Casos de uso

- Asistente de código en estación de trabajo local: con la variante ZB4.00-MIN-v5.1-IQ4_XS (12,74 GB) se puede ejecutar en una GPU de 16 GB y obtener 0,945 en HumanEval y 0,897 en MBPP, suficiente para autocompletado, generación de tests y refactorización en un entorno sin conexión.
- Análisis de capturas de pantalla y diagramas: al ser un modelo image-text-to-text, permite extraer texto de interfaces, describir gráficos o resumir documentación visual; las variantes v5 están ajustadas específicamente para estabilidad en evaluación visual.
- Prototipado de pipelines multimodales en llama.cpp: la disponibilidad de cuantizaciones desde ~3 BPW hasta Q8_K_XL permite ajustar el equilibrio calidad/memoria en una misma infraestructura sin cambiar de runtime.
- Evaluación comparativa de cuantizaciones: el repositorio publica métricas de KLD, same top-p y perplejidad frente a la línea base BF16, lo que lo convierte en un banco de pruebas útil para investigadores que estudien el impacto de la cuantización mixta en modelos de 27B.
- Despliegue en GPUs de 12 GB: la variante ZB3.00bpw-IQ3_XXS (con 0,927 en HumanEval y 0,865 en MBPP) permite servir el modelo en tarjetas de gama media para tareas de generación de código y texto donde la latencia no sea crítica.
- Servicio conversacional con contexto multimodal en entornos con requisitos de soberanía de datos: la licencia Apache 2.0 permite el despliegue on-premise sin restricciones de uso comercial declaradas por el autor del modelo base.
- Generación de documentación técnica a partir de diagramas de arquitectura: combinando entrada de imagen y generación de texto, se puede alimentar el modelo con esquemas y obtener descripciones textuales o borradores de especificación.

## Benchmarks y rendimiento

Resultados EvalPlus publicados por el autor (pass@1, modo no-thinking, kvcache ctk q4_0 y ctv q4_0):

| Cuantizacion | HumanEval | HumanEval+ | MBPP | MBPP+ | Nota |
|---|---|---|---|---|---|
| ZB4.00-MIN-v5.1-IQ4_XS | 0,945 | 0,921 | 0,897 | 0,780 | ZB-MIN |
| Qwen3.8-27B-IQ4_NL | 0,951 | 0,915 | 0,902 | 0,778 | bartowski |
| ZB3.88-MIN-v5-IQ3_M_XL | 0,945 | 0,915 | 0,910 | 0,775 | ZB-MIN |
| GSQ-RCO-BuffedMod | 0,921 | 0,890 | 0,897 | 0,772 | ISTA+Mod |
| Qwen3.8-27B-Ridge-3.7bpw | 0,933 | 0,896 | 0,902 | 0,765 | empero-ai |
| ZB3.73-MIN-v5.1-IQ3_M_L | 0,927 | 0,896 | 0,881 | 0,757 | ZB-MIN |
| ZB3.00bpw-IQ3_XXS | 0,927 | 0,884 | 0,865 | 0,743 | ZB-MIN |
| UD3-IQ4_XS | 0,890 | 0,866 | 0,897 | 0,751 | unsloth |
| UD3-Q3_K_XL | 0,823 | 0,805 | 0,881 | 0,751 | unsloth |

Calidad de cuantización frente a la línea base BF16 (Mean PPL = 6,950493), medida con llama-perplexity sobre wikitext-2-raw:

| Etiqueta | Proveedor | Tamano (GB) | Mean KLD | Same Top-p (%) | Mean PPL |
|---|---|---|---|---|---|
| UD-Q8_K_XL | unsloth old | 29,30 | 0,000850 | 98,970 | 6,953800 |
| UD-Q6_K_XL | unsloth old | 24,14 | 0,001380 | 98,520 | 6,953600 |
| Q6_K | unsloth old | 21,31 | 0,002290 | 97,860 | 6,950700 |
| Q5_K_M | unsloth old | 18,47 | 0,006220 | 96,700 | 6,974200 |
| UD-Q4_K_XL | unsloth old | 16,69 | 0,008606 | 96,091 | 6,979220 |
| ZB4.97-GOD-IQ4_XS | ZB-GOD | 15,82 | 0,012249 | 95,337 | 7,004243 |
| UD3-Q4_K_S | unsloth UD3 | 14,30 | 0,013652 | 95,149 | 6,969514 |
| Autoround-Q4_K_M | Autoround | 15,66 | 0,014657 | 94,859 | 6,950294 |
| ZB4.65-PRO-IQ4_XS | ZB-PRO | 14,81 | 0,015466 | 94,766 | 7,017278 |
| Q4_K_M | unsloth old | 15,93 | 0,015490 | 94,650 | 6,956100 |
| ZB4.60-PRO-IQ4_XS | ZB-PRO | 14,65 | 0,016162 | 94,668 | 7,030895 |
| ZB4.55-PRO-IQ4_XS | ZB-PRO | 14,49 | 0,016647 | 94,613 | 7,032263 |
| IQ4_NL | bartowski | 15,20 | 0,018427 | 94,230 | 7,006472 |
| IQ4_XS | unsloth old | 14,63 | 0,018652 | 94,270 | 7,012695 |
| UD3-IQ4_XS | unsloth UD3 | 13,27 | 0,018772 | 93,975 | 7,004732 |
| ZB4.48-STD-IQ4_XS | ZB-STD | 14,26 | 0,018892 | 94,199 | 7,050096 |
| Q4_K_S | unsloth old | 15,01 | 0,018921 | 94,235 | 6,966826 |
| IQ4_XS-i1 | mradermacher | 14,26 | 0,019271 | 94,141 | 7,012810 |
| Q4_K_S-i1 | mradermacher | 14,74 | 0,019805 | 93,996 | 6,989551 |
| ZB4.36-STD-IQ4_XS | ZB-STD | 13,88 | 0,020556 | 93,951 | 7,054811 |
| ZB4.36-STD-v4-IQ4_XS | ZB-STD | 13,88 | 0,021552 | 93,886 | 6,993211 |
| Q4_0-AutoRound-Code | webhie | 14,64 | 0,026586 | 92,970 | 7,067142 |
| ZB4.14-MIN-IQ4_XS | ZB-MIN | 13,19 | 0,029334 | 92,799 | 7,045689 |
| ZB4.00-MIN-v5.1-IQ4_XS | ZB-MIN | 12,74 | 0,033810 | 92,309 | 7,106519 |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada: la variante ZB4.00-MIN-v5.1-IQ4_XS ocupa 12,74 GB en disco y está diseñada para caber en 16 GB de VRAM; la ZB3.00bpw-IQ3_XXS apunta a tarjetas de 12 GB; las variantes Q8_K_XL alcanzan 29,30 GB y requieren GPUs de 32 GB o superiores.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti Super (16 GB) para las variantes de ~4 BPW; RTX 3060 12 GB o RTX 4070 para las variantes de ~3 BPW; A100 40/80 GB y H100 para las variantes Q6_K y Q8_K_XL.
- Cabe en GPU de consumo: sí, en las variantes IQ4_XS y IQ3_XXS; las variantes Q5_K_M en adelante (18,47 GB o más) no caben en GPUs de consumo de 16 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y servidores compatibles con endpoints (tag "endpoints_compatible"); vLLM y TGI no se mencionan en la información disponible para formato GGUF.
- Latencia y throughput: no disponibles. Las evaluaciones se ejecutaron con `-ngl 99`, es decir, con todas las capas descargadas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval (pass@1) | KLD (IQ4_XS) | Licencia | Formato |
|---|---|---|---|---|---|---|
| ZB4.00-MIN-v5.1-IQ4_XS (este repo) | 27,3B | no disponible | 0,945 | 0,033810 | Apache 2.0 | GGUF |
| Qwen3.8-27B IQ4_NL (bartowski) | 27,3B | no disponible | 0,951 | 0,018427 | Apache 2.0 | GGUF |
| UD3-IQ4_XS (unsloth) | 27,3B | no disponible | 0,890 | 0,018772 | Apache 2.0 | GGUF |
| ZB4.97-GOD-IQ4_XS (ZB-GOD) | 27,3B | no disponible | no disponible | 0,012249 | Apache 2.0 | GGUF |

Todas las alternativas comparadas son cuantizaciones del mismo modelo base Qwen/Qwen3.8-27B, por lo que comparten parámetros y licencia; las diferencias se limitan al esquema de cuantización, el tamaño resultante y las métricas de degradación. La comparativa frente a modelos de otros desarrolladores (por ejemplo, Llama o Mistral de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No hay información sobre sesgos del modelo base ni sobre evaluación de sesgos en las cuantizaciones.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en esta información.
- La variante ZB4.00-MIN-v5.1-IQ4_XS presenta la mayor degradación de las variantes ZB-MIN en la tabla de perplejidad (KLD 0,033810 frente a 0,012249 de ZB4.97-GOD), por lo que el ahorro de VRAM tiene un coste medible en fidelidad de distribución.
- Los benchmarks EvalPlus se limitan a generación de código Python (HumanEval y MBPP); no cubren matemáticas, razonamiento general ni tareas multimodales.
- Las evaluaciones se realizaron en modo no-thinking, por lo que el rendimiento en modo thinking no está caracterizado.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano sin evaluación propia.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero el autor del repositorio no ofrece garantías sobre las cuantizaciones; conviene verificar los términos del modelo base Qwen/Qwen3.8-27B.
- El repositorio ocupa 266,7 GB; descargar solo el fichero GGUF necesario requiere usar la interfaz de ficheros individuales de Hugging Face.
- Las variantes marcadas como v5 incorporan ajuste "Pelicanmaxxing" orientado a evaluación visual; su efecto sobre tareas de texto no está cuantificado de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tooltd/Qwen3.8-27B-ZipBrain-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fichero ZB4.00-MIN-v5.1-IQ4_XS: https://huggingface.co/tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF/blob/main/Qwen3.8-27B-ZB4.00-MIN-v5.1-IQ4_XS.gguf
- Fichero ZB3.88-MIN-v5-IQ3_M_XL: https://huggingface.co/tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF/blob/main/Qwen3.8-27B-ZB3.88-MIN-v5-IQ3_M_XL.gguf
- Fichero ZB3.73-MIN-v5.1-IQ3_M_L: https://huggingface.co/tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF/blob/main/Qwen3.8-27B-ZB3.73-MIN-v5.1-IQ3_M_L.gguf
- Fichero ZB3.00bpw-IQ3_XXS: https://huggingface.co/tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF/blob/main/Qwen3.8-27B-ZB3.00bpw-IQ3_XXS.gguf
- Repositorio GSQ-RCO-BuffedMod: https://huggingface.co/tooltd/Qwen3.8-27B-GSQ-RCO-BuffedMod-GGUF
- Fichero GSQ-RCO-BuffedMod: https://huggingface.co/tooltd/Qwen3.8-27B-GSQ-RCO-BuffedMod-GGUF/blob/main/Qwen3.8-27B-GSQ-RCO-BuffedMod-IQ3_S_XL-mtp-IQ4XS.gguf
