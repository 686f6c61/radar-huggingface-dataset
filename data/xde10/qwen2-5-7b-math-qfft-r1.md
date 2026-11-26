# XDE10/Qwen2.5-7B-Math-QFFT-R1

## Resumen

Qwen2.5-7B-Math-QFFT-R1 es un checkpoint de ajuste fino completo (full-parameter) del modelo Qwen2.5-7B-Instruct, publicado por el usuario XDE10 en Hugging Face. El modelo aplica la tecnica Question-Free Fine-Tuning (QFFT), una variante de post-entrenamiento en la que la supervision se limita a las trazas de respuesta del modelo profesor (DeepSeek-R1), sin incluir el prompt ni marcadores de formato. El objetivo es transferir capacidad de razonamiento matematico paso a paso a un modelo denso de 7.600 millones de parametros sin necesidad de un pipeline de RL complejo.

El modelo se entrena sobre 1.000 trazas de razonamiento matematico de DeepSeek-R1, filtradas para eliminar contaminacion con los conjuntos de evaluacion, durante 6 epocas y 750 pasos de optimizacion en una unica GPU de 96 GB. La relevancia actual reside en que demuestra que un ajuste fino supervisado bien disenado puede mejorar de forma estadisticamente significativa el rendimiento en matematicas de competicion (+7,56 puntos porcentuales sobre el modelo base en un agregado de 100 problemas) manteniendo respuestas concisas en problemas faciles.

Arquitectura transformer densa de la familia Qwen2.5, con 7.615.616.512 parametros y contexto nativo de 32.768 tokens (RoPE nativo, sin YaRN). Se distribuye en safetensors con licencia Apache 2.0 e idiomas de entrenamiento declarados en ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), atencion causal, RoPE nativo |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (RoPE nativo, sin YaRN) |
| Tipos de cuantizacion | bf16 (pesos originales); no se documentan otras cuantizaciones en la model card |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct (revision `a09a35458c702b33eeacc393d103063234e8bc28`), un transformer denso con atencion causal estandar y RoPE. El ajuste es de parametros completos (no LoRA) mediante QFFT: supervision unicamente sobre la respuesta, sin marcadores de prompt ni token EOS anadido. El dataset son 1.000 trayectorias matematicas de DeepSeek-R1 descontaminadas (derivadas de s1K-1.1 con filtrado de competicion), con longitud maxima de secuencia de 16.384 tokens truncada.

La receta usa 6 epocas y 750 pasos de optimizacion, batch efectivo de 8 (micro-batch 1, acumulacion de gradiente 8), AdamW con betas (0,9; 0,999), weight decay 1e-4, learning rate 1e-5 con schedule coseno y 10% de warmup. El entrenamiento se ejecuto en una sola GPU de 96 GB con DeepSpeed ZeRO-2 con offload a CPU, Liger Kernel, SDPA y bf16. La configuracion publicada fija `use_cache: true` para decodificacion con KV-cache en transformers, preservando los pesos exactos del entrenamiento (SHA-256 de `model.safetensors`: `70b028056a6b3b407678c15e59db33b07916c4f8a4b467b503a0792a39c55778`). Existe un adaptador LoRA complementario entrenado con MMR-DR-GRPO (50 pasos).

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen2.5.
- Razonamiento matematico paso a paso, con salida final en formato `\boxed{}`.
- Resolucion de problemas de competicion (AIME, AMC, MATH-500) y aritmetica escolar (GSM8K).
- Generacion concisa en problemas faciles: longitud media de 476 tokens en GSM8K frente a 2.191 tokens de un SFT completo.
- Uso mediante `transformers` y vLLM con decodificacion por KV-cache.
- Capacidades heredadas del modelo base (instrucciones generales, codigo) no evaluadas especificamente en esta ficha.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Tutoria matematica automatizada: el modelo genera soluciones paso a paso con respuesta final delimitada en `\boxed{}`, lo que facilita la extraccion y validacion automatica en plataformas educativas.
- Evaluacion y generacion de problemas de competicion: util para crear borradores de soluciones en formato AIME/AMC que luego se verifican con herramientas como Math-Verify.
- Pipeline de verificacion de respuestas: integrar el modelo en un sistema que parsee el ultimo `\boxed{}` y compare con la solucion de referencia, aprovechando el formato de salida consistente.
- Generacion de datos sinteticos de razonamiento: producir trazas matematicas para aumentar datasets de entrenamiento de modelos menores, dado el formato estructurado de sus respuestas.
- Asistente de estudio con contexto largo: con 32.768 tokens de ventana puede procesar enunciados extensos o conversaciones multi-turno con varios problemas encadenados.
- Despliegue en infraestructura moderada: al ser un modelo denso de 7.600 millones de parametros, cabe en GPUs de consumo con cuantizacion y en GPUs de datacenter con bf16, lo que permite servir una API interna de resolucion de matematicas.
- Investigacion en post-entrenamiento: sirve como referencia reproducible de QFFT para comparar con SFT completo y con adaptadores RL.

## Benchmarks y rendimiento

Evaluacion unificada con RoPE nativo de 32K, `temperature=0.6`, `top_p=0.95`, semillas fijas y correccion determinista con Math-Verify 0.9.0 sobre el ultimo `\boxed{}` (4.599 generaciones por modelo):

| Modelo | AIME24 (x16) | AIME25 (x16) | AMC23 (x8) | Comp100 | MATH-500 (x4) | GSM8K (x1) |
|---|---:|---:|---:|---:|---:|---:|
| Qwen2.5-7B-Instruct (base) | 11,25% | 7,71% | 50,94% | 26,06% | 76,80% | 91,58% |
| lwl-uestc/QFFT-S1-7B (qfft_official) | 20,83% | 16,04% | 61,25% | 35,56% | 81,10% | 92,27% |
| PJiNH/QFFT-repro-S1.1-SFT-7B (sft_repro) | 18,75% | 16,88% | 61,25% | 35,19% | 81,70% | 92,34% |
| XDE10/Qwen2.5-7B-Math-QFFT-R1 (este modelo) | 18,54% | 14,79% | 59,06% | 33,63% | 80,50% | 91,43% |
| + XDE10/Qwen2.5-7B-Math-QFFT-R1-MMR50-LoRA | 18,75% | 16,25% | 60,00% | 34,50% | 80,35% | 92,42% |

Mejora de +7,56 puntos porcentuales sobre el base en el agregado de competicion Comp100, con intervalo de confianza bootstrap pareado al 95% de [+3,88; +11,44]. Queda a -1,94 puntos porcentuales (IC 95% [-4,06; +0,06]) de la reproduccion oficial de QFFT.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, mas KV-cache y activaciones; se recomienda al menos 24 GB para contexto largo.
- VRAM con cuantizacion de 8 bits: alrededor de 8-9 GB; con 4 bits, alrededor de 5-6 GB (no documentado oficialmente, estimacion por tamano de pesos).
- GPUs recomendadas: A100 80 GB o H100 para bf16 con contexto completo de 32K; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 para cuantizacion.
- Cabe en GPU de consumo: si, con cuantizacion en RTX 3060 12 GB o superior; en bf16 requiere 24 GB o mas.
- Despliegue: transformers (con `device_map="auto"`), vLLM (`max_model_len=32768`), TGI (tag `text-generation-inference`); llama.cpp/Ollama no documentados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comp100 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| XDE10/Qwen2.5-7B-Math-QFFT-R1 | 7,6B denso | 32K | 33,63% | Apache 2.0 | Hugging Face |
| lwl-uestc/QFFT-S1-7B | 7,6B denso | no disponible | 35,56% | no disponible | Hugging Face |
| PJiNH/QFFT-repro-S1.1-SFT-7B | 7,6B denso | no disponible | 35,19% | no disponible | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7,6B denso | 32K | 26,06% | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Entrenado especificamente para razonamiento matematico; el seguimiento de instrucciones generales fuera de matematicas no ha sido evaluado.
- Riesgo de alucinacion en problemas fuera de la distribucion de entrenamiento (competicion y aritmetica escolar); el formato `\boxed{}` puede aparecer aunque la respuesta sea incorrecta.
- Idiomas declarados solo ingles y chino; el rendimiento en castellano no esta documentado.
- Dataset de entrenamiento pequeno (1.000 trazas) y 6 epocas, lo que aumenta el riesgo de sobreajuste al estilo de DeepSeek-R1.
- Sin datos de sesgo publicados.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-7B-Instruct.
- Cero descargas y cero likes en el momento de la ficha: no hay validacion independiente de la comunidad.
- La evaluacion usa correccion automatica estricta; los resultados pueden no ser directamente comparables con los publicados por otros autores bajo protocolos distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XDE10/Qwen2.5-7B-Math-QFFT-R1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Codigo y reporte de reproducibilidad: https://github.com/XDE10/qwen2.5-7b-math-posttrain
- Adaptador LoRA complementario: https://huggingface.co/XDE10/Qwen2.5-7B-Math-QFFT-R1-MMR50-LoRA
- Ancla publica QFFT: https://huggingface.co/lwl-uestc/QFFT-S1-7B
- Reproduccion SFT publica: https://huggingface.co/PJiNH/QFFT-repro-S1.1-SFT-7B
