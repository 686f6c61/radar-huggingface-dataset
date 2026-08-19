# varadsrivastava/lm-playschool-qwen3.5-2b-iter3

## Resumen

`lm-playschool-qwen3.5-2b-iter3` es un fine-tuning del modelo base Qwen/Qwen3.5-2B, desarrollado por el equipo DAIR dentro del marco del LM Playschool Challenge 2026. El modelo forma parte de una familia de cinco regímenes de post-entrenamiento (R1 a R5) orientados a la competencia en juegos de diálogo, y este checkpoint concreto corresponde al régimen R3: self-imitation mediante SFT (supervised fine-tuning).

La propuesta técnica consiste en entrenar el modelo sobre sus propias trayectorias exitosas generadas por una versión anterior (R2, entrenada con DPO). Se realizó una única época de SFT con LoRA (r=16, lr 2e-5) sobre 516 trayectorias por jugador, sin anclaje KL y sin rejuego de datos generales. El resultado fue una regresión en las métricas del entorno (clemscore de 67.39 a 61.06), por lo que el autor lo publica explícitamente como un resultado negativo. Es relevante porque documenta un hallazgo metodológico: ensayar los propios éxitos sin un objetivo anclado puede perturbar el comportamiento, incluso en juegos no presentes en los datos de auto-imitación.

El modelo tiene aproximadamente 1.88 mil millones de parámetros, está licenciado bajo Apache 2.0 y solo declara soporte para inglés. Su interés principal no es su rendimiento final, sino su valor como caso de estudio empírico sobre estrategias de post-entrenamiento en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; cuantizaciones no publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3.5-2B, un transformer denso de aproximadamente 1,88 mil millones de parámetros. El entrenamiento de este checkpoint consiste en una única época de SFT sobre trayectorias generadas por el propio modelo R2 (entrenado con DPO). Los datos de entrenamiento provienen de 490 episodios de ocho juegos del conjunto público de instancias del playpen, de los cuales un 63 % fueron exitosos; tras filtrar instancias solapadas con la validación, se obtuvieron 516 trayectorias por jugador.

La técnica empleada es LoRA con rango 16 y tasa de aprendizaje 2e-5, sin anclaje KL y sin rejuego de datos generales. El autor señala que el resultado fue una regresión en las métricas de evaluación, y descarta como causa un desajuste de formato entre entrenamiento e inferencia, así como una reversión hacia la política pre-DPO. El paper asociado, *Raising a Small Language Model: From Imitation to Curiosity in Dialogue Games*, incluye un análisis de sensibilidad al entorno de evaluación.

## Capacidades

- Generacion de texto conversacional en ingles, especializado en juegos de dialogo (roles de Game Master y jugador).
- Mantiene conversaciones multi-turno dentro del formato del entorno clembench/playpen.
- No se han documentado capacidades de tool calling, function calling ni razonamiento multi-paso fuera del contexto de los juegos.
- No soporta vision, audio ni otros modos multimodales.
- Capacidad multilingue limitada: solo se declara ingles.
- No se ha publicado ningun modo de "thinking" o razonamiento explicito.

## Casos de uso

- Investigacion en post-entrenamiento de modelos pequenos: sirve como punto de comparacion para estudiar el efecto de la auto-imitacion sin anclaje, especialmente frente a los checkpoints R2, R4 y R5 de la misma familia.
- Reproduccion de experimentos en entornos de dialogo: puede usarse en el playpen de clembench para reproducir las metricas publicadas (clemscore 61.06, statscore 44.01) y verificar la sensibilidad al entorno.
- Analisis de regresion de politica: permite estudiar por que ensayar trayectorias propias exitosas degrada el rendimiento en juegos no vistos, un fenomeno relevante para el diseno de pipelines de RLHF.
- Benchmark de estabilidad de evaluacion: el autor menciona diferencias entre entornos fijados y no fijados; este modelo puede servir para validar protocolos de evaluacion reproducibles.
- Educacion en IA: como ejemplo documentado de resultado negativo, es util para ensenar metodologia experimental en post-entrenamiento.
- Comparacion de metodos de alineacion: junto con los demas checkpoints de la familia, permite contrastar SFT, DPO, GRPO y GRPO con RND en un mismo modelo base.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden al entorno de evaluacion del LM Playschool Challenge (clembench/playpen), en su split de validacion, con un entorno fijado (Python 3.11, clemcore y clembench con dependencias ancladas). No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

| Modelo | Regimen | clemscore | statscore |
|---|---|---|---|
| Qwen3.5-2B (base) | - | 13.63 | 44.22 |
| R1 (SFT) | Imitacion | 55.61 | 43.87 |
| R2 (DPO) | Contraste de resultados | 67.39 | 44.72 |
| **R3 (SFT)** | **Self-imitation** | **61.06** | **44.01** |
| R4 (DPO) | Feedback correctivo | 67.64 | 44.31 |
| R5 (GRPO) | Control | 62.43 | 44.19 |
| R5 (GRPO + RND) | Curiosidad | 67.44 | 43.53 |

El modelo R3 presenta una regresion de 6,33 puntos de clemscore respecto a R2, mientras que el statscore apenas varia (44.01 frente a 44.72). El autor descarta un desajuste de formato y una reversion a la politica pre-DPO como causas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~1,88 B de parametros, en FP16 ocuparia aproximadamente 3,8 GB de pesos; con cuantizacion int8 rondaria los 2 GB y con int4 cerca de 1 GB. Estas cifras son estimaciones teoricas, no hay datos oficiales publicados.
- GPU recomendadas: cabe en tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) sin problemas. Tambien puede ejecutarse en Apple Silicon con suficiente memoria unificada.
- Despliegue en consumer GPU: si, con cuantizacion incluso en GPUs de 4-6 GB.
- Opciones de despliegue: al ser un modelo de transformers con pesos safetensors, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante conversion), TGI y transformers nativo.
- Latencia y throughput: no disponibles. Para un modelo de este tamano, se puede esperar una latencia de decenas de milisegundos por token en una GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Dentro de la misma familia de checkpoints (mismo modelo base y entorno de evaluacion), la comparativa es la siguiente:

| Modelo | Regimen | Parametros | clemscore | Licencia |
|---|---|---|---|---|
| Qwen3.5-2B (base) | - | 1,88 B | 13.63 | Apache 2.0 |
| lm-playschool-qwen3.5-2b-sft (R1) | SFT imitacion | 1,88 B | 55.61 | Apache 2.0 |
| lm-playschool-qwen3.5-2b-sft-dpo (R2) | DPO | 1,88 B | 67.39 | Apache 2.0 |
| **lm-playschool-qwen3.5-2b-iter3 (R3)** | **SFT self-imitation** | **1,88 B** | **61.06** | **Apache 2.0** |
| lm-playschool-qwen3.5-2b-iter4 (R4) | DPO correctivo | 1,88 B | 67.64 | Apache 2.0 |
| lm-playschool-qwen3.5-2b-grpo-base-s42 (R5) | GRPO control | 1,88 B | 62.43 | Apache 2.0 |

No se dispone de comparativas con modelos externos de tamano similar (por ejemplo, otros fine-tunings de Qwen2.5-1.5B o Llama-3.2-1B) en el mismo entorno de juegos de dialogo. Por tanto, la comparativa externa no esta disponible.

## Limitaciones y advertencias

- Resultado negativo documentado: el entrenamiento de auto-imitacion provoco una regresion en clemscore (de 67.39 a 61.06). No debe usarse como modelo de produccion para tareas de dialogo si se busca rendimiento optimo.
- Sesgos y alucinacion: no hay evaluaciones publicadas sobre sesgos, toxicidad o tasa de alucinacion. Al ser un modelo de 1,88 B, es previsible que presente limitaciones en razonamiento complejo y generacion factual, pero no hay datos concretos.
- Limitacion de idioma: solo se declara ingles; el rendimiento en otros idiomas no esta evaluado y probablemente sea pobre.
- Contexto: no se ha publicado la longitud de contexto. Se hereda la del modelo base Qwen3.5-2B, pero no hay confirmacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero el autor no ofrece garantias de calidad ni soporte.
- Reproducibilidad: las metricas publicadas dependen de un entorno fijado (clemcore y clembench anclados). En entornos no fijados, los numeros pueden variar, como advierte el propio autor.
- Dependencia de datos de auto-imitacion: el entrenamiento se hizo sobre trayectorias del propio modelo R2; esto puede inducir colapso de politica o sobreajuste a los juegos del conjunto publico, aunque el autor descarta la reversion a la politica pre-DPO.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/varadsrivastava/lm-playschool-qwen3.5-2b-iter3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper (pendiente de enlace, segun la model card): *Raising a Small Language Model: From Imitation to Curiosity in Dialogue Games* (LM Playschool Challenge 2026). El enlace no esta disponible en la informacion proporcionada.
- Checkpoints relacionados de la misma familia (en HuggingFace, prefijo `varadsrivastava/lm-playschool-qwen3.5-2b-`): `sft`, `sft-dpo`, `iter4`, `grpo-base-s42`, `grpo-rnd-s42`.
