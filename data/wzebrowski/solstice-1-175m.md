# wzebrowski/Solstice-1-175M

## Resumen

Solstice-1-175M es un modelo de lenguaje conversacional en ingles de 174.202.432 parametros (175M redondeados) entrenado desde cero por William Zebrowski bajo el sello OpenSML. Se distribuye con licencia Apache-2.0 y esta pensado como una *research preview*: un ejercicio de entrenamiento reproducible de un modelo pequeno sobre hardware de consumo (cinco equipos Apple Silicon) en lugar de un producto listo para produccion. La arquitectura es un transformer denso de 44 capas con atencion agrupada (GQA), RoPE, RMSNorm y embeddings atados, con una ventana de contexto de solo 2.048 tokens.

El modelo acumula 42.001.367.040 posiciones de token de preentrenamiento sobre una mezcla de FineWeb-Edu, DCLM-Edu, FineWiki y, en la fase final, codigo Python y SQL procedente de mirrors publicos de Stack-Edu. Sobre esa base se aplican tres etapas de fine-tuning con adaptadores orientadas a conversacion corta, comprension lectora y seguimiento de instrucciones, empleando datasets como SmolTalk, SQuAD v2 y SciQ.

Su relevancia es doble: por un lado, demuestra que es viable entrenar un modelo desde cero en un entorno no profesional y publicar pesos, tokenizer, registros de entrenamiento y evaluaciones de forma abierta; por otro, sirve como referencia de lo que un modelo de esta escala puede y no puede hacer, con resultados medidos en ARC, PIQA, HellaSwag e IFEval. No es un sustituto de modelos de 1B-7B en tareas de produccion, sino una pieza de investigacion y experimentacion en el ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) con GQA, RoPE, RMSNorm, Q/K normalization y embeddings atados |
| Parametros totales | 174.202.432 (175M redondeados) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (incluye historial de conversacion y salida generada) |
| Tipos de cuantizacion | no disponible (el release oficial son pesos FP32 en safetensors; no se documentan variantes GGUF/INT4/INT8) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 fusionados), libreria MLX |
| Capas | 44 |
| Ancho oculto | 576 |
| Ancho SwiGLU | 1.536 |
| Cabeceras de atencion | 9 query heads, 3 KV heads, dimension de cabeza 64 |
| Tokenizer | BPE byte-level de 32.000 tokens (reutilizado de OpenSML) |
| Tokens de preentrenamiento | 42.001.367.040 posiciones procesadas |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 44 capas con ancho oculto 576 y capa SwiGLU de 1.536. Usa atencion con query grouping: 9 cabeceras de consulta y 3 de clave/valor, con dimension de cabeza 64, lo que reduce el coste de memoria KV. Incorpora RoPE con base 10.000, RMSNorm, normalizacion de Q/K y embeddings atados entre entrada y salida. El tokenizer es un BPE byte-level de 32.000 tokens heredado de la familia OpenSML, aunque el autor aclara que la estirpe de pesos es independiente de OpenSML-150M y OpenSML-JSONLite-175M.

El preentrenamiento parte de pesos aleatorios y se ejecuta sobre cinco workers Apple Silicon en BF16 con pesos maestros, gradientes y estado del optimizador en FP32. Con secuencias de 2.048 tokens y batch acumulado, cada actualizacion procesa 131.072 posiciones de token; se usa AdamW con betas (0,9, 0,95), weight decay 0,1 y clipping de gradiente en 1. La mezcla de datos en los primeros 36.801B tokens es 70% FineWeb-Edu, 20% DCLM-Edu y 10% FineWiki en ingles; en los 5.200B restantes se reduce a 56%, 16% y 8% respectivamente y se anade 15% de Python y 5% de SQL desde mirrors publicos de Stack-Edu. Tras el preentrenamiento se aplican tres etapas de fine-tuning con adaptadores (SFT 1, SFT 2 y una tercera etapa) sobre SmolTalk, SmolTalk-2, SQuAD v2 y SciQ para conversacion corta, comprension lectora e instrucciones. El release publica los pesos fusionados en FP32, el tokenizer original, un runner MLX, los registros de entrenamiento y las salidas de evaluacion.

## Capacidades

- Generacion de texto en ingles con calidad propia de un modelo de 175M: respuestas cortas y coherentes en dominios comunes.
- Conversacion multi-turno de formato corto, limitada por la ventana de 2.048 tokens compartida entre historial y salida.
- Seguimiento de instrucciones explicitas (formato, restricciones, longitud), medido con IFEval en el rango del 18-32% segun metrica.
- Comprension lectora y respuesta a preguntas sobre pasajes (entrenado con SQuAD v2 y SciQ).
- Conocimiento basico de sentido comun y ciencia elemental (ARC Easy, ARC Challenge, PIQA, HellaSwag).
- Generacion de codigo Python y SQL a nivel introductorio, gracias a la fase final de preentrenamiento con Stack-Edu.
- Ejecucion nativa en Apple Silicon mediante MLX, con runner incluido.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion sobre entrenamiento desde cero: el modelo sirve como caso de estudio reproducible de un pipeline completo (preentrenamiento, SFT con adaptadores, evaluacion) sobre hardware de consumo, con registros y pesos publicados.
- Experimentacion con MLX en Apple Silicon: al ser un modelo nativo MLX de 175M en FP32, cabe en memoria unificada de cualquier Mac moderno y permite probar tecnicas de inferencia, cuantizacion o fine-tuning sin GPU dedicada.
- Prototipado de asistentes conversacionales de dominio acotado: para dialogos cortos de soporte o FAQ donde la ventana de 2.048 tokens sea suficiente, con la advertencia de que la calidad esta muy por debajo de modelos mayores.
- Respuesta a preguntas sobre documentos breves: su entrenamiento en SQuAD v2 y SciQ lo hace util para extraer respuestas de pasajes cortos en tareas de comprension lectora controladas.
- Generacion de esqueletos de codigo Python y consultas SQL simples: la inclusion de Stack-Edu en la fase final permite usarlo como asistente basico en entornos educativos, siempre con revision humana.
- Evaluacion comparativa de modelos pequenos: sirve como baseline abierto en estudios de escalado, ablaciones de mezcla de datos o comparaciones con OpenSML-150M y otros modelos de menos de 200M.
- Docencia y divulgacion: un modelo Apache-2.0 de 0,7 GB es facil de desplegar en aulas o talleres para explicar tokenizacion, atencion, fine-tuning y evaluacion sin infraestructura costosa.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentajes; `acc / acc_norm` en conocimiento y sentido comun; IFEval en precision estricta y laxa):

| Benchmark | Solstice-1-175M | OpenSML-150M |
|---|---|---|
| ARC Easy (acc / acc_norm) | 62,58 / 62,33 | 56,65 / 55,43 |
| ARC Challenge (acc / acc_norm) | 29,35 / 30,89 | 26,02 / 29,52 |
| PIQA (acc / acc_norm) | 66,49 / 66,21 | 64,53 / 64,09 |
| HellaSwag (acc / acc_norm) | 32,85 / 39,40 | 30,55 / 33,94 |
| IFEval prompts estrictos | 17,93% | 15,16% |
| IFEval instrucciones estrictas | 30,10% | 25,30% |
| IFEval prompts laxos | 19,22% | 15,71% |
| IFEval instrucciones laxas | 32,49% | 25,78% |

Pruebas de conversacion (panel propio del autor):

| Medida | Solstice-1-175M |
|---|---|
| Precision de respuesta, casos objetivos | 59,44% |
| Parada natural, todas las respuestas | 99,48% |
| Marcas de repeticion, todas las respuestas | 1,56% |

En el test reservado del autor, el modelo alcanza 51,9% frente a 20,0% tras SFT 1 y 25,9% tras SFT 2; en un panel reutilizado mas antiguo las cifras son 53,84%, 52,13% y 54,55%, de modo que la ultima etapa no mejora todas las metricas. El autor advierte que las diferencias frente a OpenSML-150M no se han sometido a prueba de significancia estadistica y que los protocolos de evaluacion (formato de chat, limite de tokens) difieren entre ambos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP32 ocupan aproximadamente 0,7 GB (174,2M parametros x 4 bytes); con overhead de activaciones y cache KV para 2.048 tokens, el consumo real es de orden de 1-2 GB.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060 12 GB, RTX 4060, RTX 4090) y en Mac con memoria unificada de 8 GB o mas.
- GPU recomendadas: no requiere GPU dedicada; el release esta orientado a Apple Silicon via MLX. En CUDA puede ejecutarse con frameworks genericos, aunque no se documenta soporte oficial.
- Opciones de despliegue: MLX con el runner incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni variantes GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Resultados destacados |
|---|---|---|---|---|---|
| Solstice-1-175M | 174,2M | 2.048 | Apache-2.0 | safetensors (MLX, FP32) | ARC Easy 62,58; HellaSwag 32,85; IFEval estricto 17,93% |
| OpenSML-150M | ~150M (no confirmado en la informacion) | no disponible | no disponible en la informacion | no disponible | ARC Easy 56,65; HellaSwag 30,55; IFEval estricto 15,16% |
| OpenSML-JSONLite-175M | 175M (por nombre) | no disponible | no disponible en la informacion | no disponible | no disponible |

La unica comparacion cuantitativa publicada es frente a OpenSML-150M, que queda por debajo en todas las metricas reportadas, con la salvedad de que el autor no ha verificado significancia estadistica ni homogeneizado del todo los protocolos. No hay datos disponibles frente a otras familias de modelos pequenos.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (2.048 tokens compartidos entre historial y salida): inutil para documentos largos o conversaciones extensas.
- Solo ingles; no hay soporte multilingue declarado.
- Calidad propia de 175M parametros: HellaSwag acc_norm 39,40 y ARC Challenge acc 29,35 indican razonamiento limitado; alucinaciones y respuestas incorrectas son esperables, especialmente fuera de dominios vistos en entrenamiento.
- IFEval estricto por debajo del 20% en prompts: el seguimiento de instrucciones complejas es fragil.
- Sesgos no evaluados: el autor no publica analisis de sesgos; la mezcla de datos (FineWeb-Edu, DCLM-Edu, codigo) puede arrastrar sesgos de esas fuentes.
- Advertencia explicita del autor: es una *research preview*, no un modelo listo para produccion.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de garantias y las limitaciones tecnicas desaconsejan su uso en produccion sin evaluacion propia.
- No se documentan variantes cuantizadas ni soporte en ecosistemas fuera de MLX, lo que limita el despliegue en infraestructura CUDA convencional.
- El autor senala que la tercera etapa de SFT no mejora todas las metricas, lo que sugiere inestabilidad en el ajuste final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wzebrowski/Solstice-1-175M
- Pesos (OpenSML): https://huggingface.co/OpenSML/Solstice-1-175M
- Codigo fuente: https://github.com/williamzebrowskI/Solstice-1-175M
- Guia de ejecucion: RUN_GUIDE.md (en el repositorio)
- Informe tecnico: docs/TECHNICAL_REPORT.md (en el repositorio)
- Evaluacion: docs/EVALUATION.md (en el repositorio)
- Datos: docs/DATA.md (en el repositorio)
- Modelo de comparacion OpenSML-150M: https://huggingface.co/OpenSML/OpenSML-150M
