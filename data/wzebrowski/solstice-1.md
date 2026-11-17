# wzebrowski/Solstice-1

## Resumen

Solstice-1-175M es un modelo de lenguaje conversacional en ingles de 174.202.432 parametros, entrenado desde cero por William Zebrowski bajo el sello OpenSML y publicado con licencia Apache-2.0. Se trata de un transformer decoder-only de 44 capas con anchura oculta de 576, atencion con 9 cabezas de consulta y 3 cabezas KV (GQA), normalizacion RMSNorm, RoPE con base 10.000 y embeddings atados. Su ventana de contexto es de 2.048 tokens, suficiente para conversaciones cortas pero no para documentos extensos.

El modelo se entrena sobre 42.001.367.040 posiciones de token procesadas, partiendo de pesos aleatorios, y se afina en tres etapas de adaptadores para conversacion corta, comprension lectora y seguimiento de instrucciones. Su interes reside en la metodologia: un entrenamiento reproducible realizado integramente en cinco equipos Apple Silicon con MLX, con pesos en FP32 fusionados, runner nativo y registros de entrenamiento publicados. Es una pieza de investigacion, no un modelo listo para produccion.

La relevancia actual es doble: por un lado, demuestra que es posible entrenar un small language model competitivo con hardware de consumo; por otro, ofrece una linea base transparente y auditable para estudiar el efecto del afinado por etapas sobre tareas de instrucciones y conversacion. Su rendimiento esta lejos de los modelos frontier, pero supera a su predecesor directo, OpenSML-150M, en todos los benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (44 capas, hidden 576, SwiGLU 1.536) |
| Parametros totales | 174.202.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (incluye historial y salida generada) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; el runner MLX puede aplicar cuantizacion, pero no se documenta) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 fusionados), libreria MLX |
| Atencion | 9 cabezas Q, 3 cabezas KV, head dim 64, Q/K normalization |
| Tokenizer | BPE byte-level de 32.000 tokens (reutilizado de OpenSML) |
| Normalizacion / posicional | RMSNorm, RoPE base 10.000, embeddings atados |
| Tokens de preentrenamiento | 42.001.367.040 posiciones |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 44 capas, anchura oculta de 576 y FFN SwiGLU de 1.536, con atencion de grupo (9 cabezas de consulta y 3 KV, dimension de cabeza 64) y normalizacion Q/K. Usa RoPE con base 10.000, RMSNorm y embeddings atados entre entrada y salida. El tokenizer es un BPE byte-level de 32.000 tokens heredado de OpenSML; el autor aclara que reutilizar el tokenizer no convierte a OpenSML-150M en ancestro de pesos de este modelo, ya que la linea de pesos es independiente.

El preentrenamiento parte de pesos aleatorios y se ejecuta en cinco workers Apple Silicon con computo BF16 y pesos maestros, gradientes y estado del optimizador en FP32. La longitud de secuencia es de 2.048 tokens y el batch acumulado produce 131.072 posiciones de token por actualizacion. Se usa AdamW con betas (0,9, 0,95), weight decay 0,1 y clipping de gradiente a 1. La mezcla de datos en los primeros 36.801B tokens es 70% FineWeb-Edu, 20% DCLM-Edu y 10% English FineWiki; en los 5.200B restantes se reduce a 56%, 16% y 8% respectivamente y se incorpora 15% de Python (Stack-Edu) y 5% de SQL. Tras el preentrenamiento se aplican tres etapas de adaptadores (SFT 1, SFT 2 y una tercera etapa) sobre datasets conversacionales e instructivos como smol-smoltalk, smoltalk, SQuAD v2 y SciQ.

## Capacidades

- Generacion de texto en ingles con foco en conversacion corta y respuestas concisas.
- Seguimiento de instrucciones explicitas (formato, restricciones de longitud, estilo), medido con IFEval.
- Comprension lectora y respuesta a preguntas extractivas y de conocimiento general (SQuAD v2, SciQ).
- Razonamiento de sentido comun basico y eleccion multiple (ARC Easy, ARC Challenge, PIQA, HellaSwag).
- Capacidad incipiente de codigo Python y consultas SQL, gracias al 20% de datos Stack-Edu en la fase final del preentrenamiento.
- Detencion natural de respuestas (99,48% de paradas naturales en el panel de conversacion).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales de dominio acotado: con 2.048 tokens de contexto puede mantener dialogos de varios turnos sobre un tema concreto, siempre que la sesion no supere esa ventana y el idioma sea ingles.
- Investigacion sobre entrenamiento desde cero: el modelo publica registros de entrenamiento, mezcla de datos y resultados de evaluacion, lo que permite reproducir y comparar el efecto de cada etapa de SFT.
- Evaluacion de pipelines MLX en Apple Silicon: sirve como banco de pruebas para medir throughput y latencia de un modelo de 175M en hardware de consumo con el runner oficial.
- Generacion de respuestas extractivas sobre pasajes cortos: su entrenamiento con SQuAD v2 y SciQ lo hace util para tareas de question answering donde la respuesta esta contenida en un contexto breve.
- Filtrado y clasificacion de texto corto en ingles: puede emplearse como modelo de scoring de verosimilitud para ranking de respuestas candidatas en sistemas de retrieval.
- Educacion y demos docentes: su tamano reducido y licencia permisiva permiten desplegarlo en aulas o talleres para explicar el ciclo completo de preentrenamiento, SFT y evaluacion.
- Generacion de esqueletos de codigo Python o consultas SQL simples: adecuado para autocompletado basico en entornos controlados, no para produccion sin revision humana.

## Benchmarks y rendimiento

Resultados publicados por el autor, en porcentaje. En conocimiento y sentido comun se muestra acc / acc_norm (zero-shot likelihood scoring):

| Benchmark | Solstice-1-175M | OpenSML-150M |
|---|---|---|
| ARC Easy | 62,58 / 62,33 | 56,65 / 55,43 |
| ARC Challenge | 29,35 / 30,89 | 26,02 / 29,52 |
| PIQA | 66,49 / 66,21 | 64,53 / 64,09 |
| HellaSwag | 32,85 / 39,40 | 30,55 / 33,94 |

Seguimiento de instrucciones (IFEval, accuracy; sin acc_norm):

| Metrica IFEval | Solstice-1-175M | OpenSML-150M |
|---|---|---|
| Strict prompts | 17,93% | 15,16% |
| Strict instructions | 30,10% | 25,30% |
| Loose prompts | 19,22% | 15,71% |
| Loose instructions | 32,49% | 25,78% |

Comprobaciones de conversacion (panel propio de 180 respuestas cerradas y 12 abiertas):

| Medida | Solstice-1-175M |
|---|---|
| Precision en casos objetivos | 59,44% |
| Detencion natural | 99,48% |
| Banderas de repeticion | 1,56% |

En el test reservado de autoria propia, el modelo alcanza 51,9% frente a 20,0% tras SFT 1 y 25,9% tras SFT 2. En un panel antiguo reutilizado las cifras son 53,84%, 52,13% y 54,55%, lo que indica que la ultima etapa no mejora todas las medidas. El autor advierte que las diferencias no se han sometido a prueba de significancia estadistica y que las implementaciones y formatos de chat difieren entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,7 GB para los pesos, mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- En cuantizacion de 8 bits o 4 bits el modelo ocuparia del orden de 175-350 MB, aunque el autor no publica pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; el modelo esta pensado para Apple Silicon via MLX.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos.
- Opciones de despliegue: runner MLX oficial (incluido en el repo); al estar en safetensors FP32, es convertible a GGUF para llama.cpp u Ollama, aunque no se documenta un procedimiento oficial. vLLM y TGI no estan soportados de forma nativa por la libreria MLX.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Solstice-1-175M | 174,2M | 2.048 | Apache-2.0 | en | Entrenado desde cero en Apple Silicon, MLX nativo |
| OpenSML-150M | ~150M | no disponible | no disponible | en | Predecesor de la misma familia; peor en todos los benchmarks publicados |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | Apache-2.0 | en | Modelo small de referencia de Hugging Face; no se dispone de comparacion directa en la informacion proporcionada |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | multilingue | Alternativa de mayor tamano y contexto; no se dispone de comparacion directa en la informacion proporcionada |

La comparacion cuantitativa solo esta disponible frente a OpenSML-150M. Frente a SmolLM-135M y Qwen2.5-0.5B no se han publicado resultados cruzados en la informacion disponible, por lo que no se pueden extraer conclusiones de rendimiento relativo.

## Limitaciones y advertencias

- Modelo de investigacion ("research preview"): no esta disenado ni validado para uso en produccion.
- Contexto muy limitado: 2.048 tokens compartidos entre historial y salida; las conversaciones largas o documentos extensos provocan truncamiento.
- Solo ingles: no soporta castellano ni otros idiomas de forma fiable.
- Riesgo de alucinacion elevado: con 175M de parametros y resultados de HellaSwag y ARC Challenge bajos, la fiabilidad factual es limitada.
- Rendimiento modesto en seguimiento de instrucciones: IFEval strict prompts por debajo del 18%, lo que implica incumplimientos frecuentes de restricciones de formato.
- Riesgo de repeticion y bucles: el 1,56% de banderas de repeticion en el panel de conversacion, con dos bucles claros identificados.
- Sesgos: no se documenta analisis de sesgos; los datos provienen de FineWeb-Edu, DCLM-Edu y FineWiki, con los sesgos inherentes a esas fuentes web.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el integrador.
- El modelo se publico originalmente como `OpenSML/Solstice-1`; los identificadores historicos pueden aparecer en registros de evaluacion, lo que complica la trazabilidad.
- Las diferencias frente a OpenSML-150M no se han sometido a prueba de significancia estadistica y los protocolos de evaluacion no son identicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wzebrowski/Solstice-1
- Pesos originales (OpenSML): https://huggingface.co/OpenSML/Solstice-1-175M
- Codigo fuente: https://github.com/williamzebrowskI/Solstice-1-175M
- Guia de ejecucion: RUN_GUIDE.md (en el repositorio)
- Informe tecnico: docs/TECHNICAL_REPORT.md (en el repositorio)
- Evaluacion: docs/EVALUATION.md (en el repositorio)
- Documentacion de datos: docs/DATA.md (en el repositorio)
- Modelo predecesor: https://huggingface.co/OpenSML/OpenSML-150M
