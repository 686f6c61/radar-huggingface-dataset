# wzebrowski/Solstice-1

## Resumen

Solstice-1 es un modelo de lenguaje de 174.202.432 parámetros (175M redondeados) entrenado desde cero por William Zebrowski bajo el paraguas del proyecto OpenSML, y publicado como research preview con licencia Apache-2.0. Se trata de un transformer decoder-only denso de 44 capas con anchura oculta de 576, atención con 9 cabezas de consulta y 3 de clave/valor (GQA), RoPE, RMSNorm y embeddings atados. Su ventana de contexto es de 2.048 tokens, un valor modesto pero coherente con su escala.

El modelo se ha entrenado íntegramente en cinco máquinas Apple Silicon, usando MLX como framework, con cómputo BF16 y pesos maestros, gradientes y estado del optimizador en FP32. Acumula 42.001.367.040 posiciones de token de preentrenamiento sobre una mezcla de FineWeb-Edu, DCLM-Edu, FineWiki y, en la fase final, código Python y SQL de Stack-Edu. Posteriormente recibe tres etapas de fine-tuning con adaptadores orientadas a conversación corta, comprensión lectora y seguimiento de instrucciones.

Su relevancia es doble: por un lado, demuestra que es viable entrenar un modelo de lenguaje funcional desde cero en hardware de consumo Apple Silicon, con documentación de datos, evaluación y recetas de entrenamiento publicadas; por otro, sirve como referencia reproducible para investigadores que quieran estudiar el efecto de mezclas de datos y etapas de SFT en modelos por debajo de los 200M parámetros. No compite en capacidad general con modelos frontera, sino que se posiciona como artefacto de investigación abierto y ejecutable localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, 44 capas, hidden 576, SwiGLU 1.536, RoPE (base 10.000), RMSNorm, Q/K normalization, embeddings atados |
| Parametros totales | 174.202.432 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (incluye historial de conversación y salida generada) |
| Tipos de cuantizacion | no disponible (el release publica pesos FP32 fusionados; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 fusionado), runner nativo MLX |

## Arquitectura y entrenamiento

Solstice-1 es un transformer decoder-only denso con 44 capas, anchura oculta de 576 y anchura SwiGLU de 1.536. La atención usa 9 cabezas de consulta y 3 de clave/valor con dimensión de cabeza 64, lo que supone grouped-query attention (GQA) con ratio 3:1. Incorpora RoPE con base 10.000, RMSNorm, normalización de Q y K, y embeddings atados entre entrada y salida. El tokenizador es un BPE byte-level de 32.000 tokens reutilizado de OpenSML, aunque el linaje de pesos es independiente de OpenSML-150M y OpenSML-JSONLite-175M.

El preentrenamiento parte de pesos aleatorios y consume 42.001.367.040 posiciones de token procesadas. La secuencia es de 2.048 tokens y el batch acumulado produce 131.072 posiciones por actualización. Se usa AdamW con betas (0,9; 0,95), weight decay 0,1 y clipping de gradiente en 1. La mezcla de datos configurada es, en los primeros 36.801B tokens, 70% FineWeb-Edu, 20% DCLM-Edu y 10% English FineWiki; en los 5.200B restantes baja a 56%, 16% y 8% respectivamente y añade 15% de Python y 5% de SQL procedentes de mirrors públicos de Stack-Edu. El autor advierte que son proporciones configuradas, no recuentos medidos de tokens únicos. El pipeline incluye filtros de calidad, ventana de deduplicación de documentos recientes, partición fija train/validation y tokenizador congelado.

Tras el preentrenamiento se aplican tres etapas de fine-tuning con adaptadores sobre datasets como smol-smoltalk, smoltalk, SQuAD v2, SciQ, SynSQL-2.5M y los conjuntos Stack-Edu de Python y SQL. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, orientada a turnos cortos y respuestas concisas.
- Comprensión lectora extractiva y de opción múltiple, entrenada explícitamente con SQuAD v2 y SciQ.
- Seguimiento de instrucciones explícitas, evaluado con IFEval en modalidad strict y loose.
- Generación de código Python y SQL, favorecida por la inclusión de Stack-Edu y SynSQL-2.5M en la fase final del preentrenamiento y en el SFT.
- Razonamiento de conocimiento y sentido común a escala pequeña, medido en ARC Easy, ARC Challenge, PIQA y HellaSwag.
- Cierre natural de respuestas: 99,48% de paradas naturales en el panel de conversación publicado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Investigación reproducible sobre entrenamiento desde cero: el modelo publica receta de datos, registros de entrenamiento y runner MLX, lo que permite replicar o modificar la mezcla y comparar curvas de pérdida en hardware Apple Silicon.
- Evaluación de técnicas de SFT con adaptadores: las tres etapas de fine-tuning y los resultados por etapa (51,9% frente a 20,0% tras SFT 1 y 25,9% tras SFT 2 en el test reservado) sirven como caso de estudio del efecto marginal de cada fase.
- Prototipado de asistentes conversacionales de dominio acotado en local: con 2.048 tokens de contexto y pesos FP32 de 0,7 GB, cabe en un Mac y permite iterar sobre formato de chat y prompts sin coste de API.
- Generación asistida de consultas SQL y scripts Python en entornos educativos: el modelo ha visto SQL y Python de Stack-Edu y SynSQL-2.5M, por lo que puede emplearse como generador de ejemplos o corrector en herramientas de aprendizaje, siempre con validación humana.
- Comprensión lectora automática sobre documentos cortos: su entrenamiento con SQuAD v2 y SciQ lo hace apto para tareas de extracción de respuestas en pasajes que quepan en 2.048 tokens, como FAQ técnicas o resúmenes de artículos científicos breves.
- Baseline para comparativas de modelos pequeños: al estar entrenado desde cero y publicar evaluaciones con protocolo detallado, es un punto de referencia útil para medir mejoras de técnicas de tokenización, atención o mezcla de datos en la franja 100M-200M.
- Despliegue en Apple Silicon para demos offline: el runner MLX nativo permite ejecutar el modelo sin GPU dedicada, útil en talleres, docencia o entornos sin conectividad.

## Benchmarks y rendimiento

Resultados publicados en la model card. Valores en porcentaje, formato acc / acc_norm cuando aplica.

| Benchmark | Solstice-1 (acc / acc_norm) | OpenSML-150M (acc / acc_norm) |
|---|---|---|
| ARC Easy | 62,58 / 62,33 | 56,65 / 55,43 |
| ARC Challenge | 29,35 / 30,89 | 26,02 / 29,52 |
| PIQA | 66,49 / 66,21 | 64,53 / 64,09 |
| HellaSwag | 32,85 / 39,40 | 30,55 / 33,94 |

| IFEval accuracy | Solstice-1 | OpenSML-150M |
|---|---|---|
| Strict prompts | 17,93% | 15,16% |
| Strict instructions | 30,10% | 25,30% |
| Loose prompts | 19,22% | 15,71% |
| Loose instructions | 32,49% | 25,78% |

| Medida de conversación | Solstice-1 |
|---|---|
| Precisión de respuesta en casos objetivos | 59,44% |
| Parada natural sobre todas las respuestas | 99,48% |
| Banderas de repetición sobre todas las respuestas | 1,56% |

En el test reservado de autor, Solstice-1 alcanza 51,9% frente a 20,0% tras SFT 1 y 25,9% tras SFT 2. En un panel anterior reutilizado, las puntuaciones son 53,84%, 52,13% y 54,55%, lo que indica que la última etapa no mejora todas las métricas. El autor señala que las diferencias frente a OpenSML-150M no se han sometido a test de significación estadística y que los protocolos de evaluación difieren (límite de 1.024 tokens frente a 1.280 y formato de chat distinto).

## Requisitos de hardware

- Pesos FP32 fusionados: aproximadamente 0,7 GB en disco (tamaño del repo), lo que corresponde a unos 697 MB para 174,2M parámetros en FP32.
- VRAM/unified memory estimada para inferencia en FP32: en torno a 0,8-1,0 GB incluyendo overhead de runtime y caché KV para 2.048 tokens.
- VRAM estimada en cuantizaciones de 8 y 4 bits: no disponible en la documentación publicada; no se distribuyen pesos GGUF ni cuantizados.
- GPU recomendadas: el release está pensado para Apple Silicon vía MLX; funciona en cualquier Mac con memoria unificada suficiente (8 GB o más es holgado). En GPUs NVIDIA no se documenta soporte nativo.
- Cabe en GPU de consumo: sí, por tamaño; en una RTX 4090 o RTX 3090 sobra memoria, pero requeriría portar los pesos a PyTorch o a un runtime compatible, algo no documentado en el release.
- Opciones de despliegue: runner MLX incluido (RUN_GUIDE.md); vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Solstice-1 | 174,2M | 2.048 | Apache-2.0 | en | Entrenado desde cero en 5 Macs con MLX; FP32 safetensors; evaluación publicada |
| OpenSML-150M | ~150M (no confirmado en la información) | no disponible | no disponible | en | Baseline directo citado por el autor; peor en ARC, PIQA, HellaSwag e IFEval según la model card |
| SmolLM-135M (HuggingFaceTB) | 135M | no disponible en esta ficha | no disponible en esta ficha | en | Referencia habitual en la franja 100M-200M; no comparado numéricamente en la información proporcionada |
| Qwen2.5-0.5B | ~500M | no disponible en esta ficha | no disponible en esta ficha | multilingüe | Alternativa de mayor tamaño; no comparado numéricamente en la información proporcionada |

La comparación cuantitativa disponible se limita a OpenSML-150M. Para el resto de alternativas no hay datos de benchmark en la información proporcionada, por lo que no se establece comparación numérica.

## Limitaciones y advertencias

- Modelo de 175M parámetros: la precisión en conocimiento factual y razonamiento es baja en términos absolutos (HellaSwag acc 32,85; ARC Challenge acc 29,35), muy por debajo de modelos de varios miles de millones.
- Riesgo alto de alucinación en preguntas abiertas y generación factual; no debe usarse como fuente de verdad sin verificación externa.
- Contexto de 2.048 tokens, que incluye historial y salida; insuficiente para documentos largos, código extenso o conversaciones multi-turno prolongadas.
- Solo inglés; no se declara soporte de castellano ni de otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor lo etiqueta como "research preview" y no ofrece garantías; conviene revisar los términos del repo y de los datasets de origen (algunos con condiciones propias, como Stack-Edu o FineWeb-Edu).
- Sesgos: al entrenarse sobre FineWeb-Edu, DCLM-Edu y FineWiki, hereda sesgos de fuentes web filtradas por criterios educativos; no se documenta auditoría de sesgos.
- IFEval estricto en prompts de 17,93%: el seguimiento de instrucciones complejas es frágil y requiere prompts muy explícitos.
- El propio autor advierte que la tercera etapa de SFT no mejora todas las métricas en el panel reutilizado (53,84% → 52,13% → 54,55%), señal de variabilidad y de posible sobreajuste a formatos concretos.
- Las comparaciones con OpenSML-150M no tienen test de significación estadística y usan protocolos distintos; no deben interpretarse como diferencias robustas.
- No se documentan cuantizaciones oficiales; desplegar en GPUs no Apple requiere trabajo adicional no soportado por el release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wzebrowski/Solstice-1
- Pesos en la organización OpenSML: https://huggingface.co/OpenSML/Solstice-1
- Código fuente: https://github.com/williamzebrowskI/Solstice-1
- Guía de ejecución: RUN_GUIDE.md (en el repositorio)
- Informe técnico: docs/TECHNICAL_REPORT.md (en el repositorio)
- Evaluación: docs/EVALUATION.md (en el repositorio)
- Documentación de datos: docs/DATA.md (en el repositorio)
- Model card de referencia OpenSML-150M: https://huggingface.co/OpenSML/OpenSML-150M
