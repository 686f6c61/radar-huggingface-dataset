# yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep3

## Resumen
El modelo `yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep3` es un ajuste fino completo (full fine-tuning) del modelo instructivo `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba, publicado por el usuario yungisimon en Hugging Face. El autor lo presenta como un "memory model": un modelo entrenado para almacenar y recuperar asociaciones de memoria a partir de pares pregunta-respuesta sinteticos construidos sobre el conjunto de datos MuSiQue, un benchmark de razonamiento multi-salto. No se trata, por tanto, de un modelo generalista nuevo, sino de un experimento de investigacion sobre memorizacion y agrupamiento semantico.

El entrenamiento emplea la tecnica de clustering denominada `hdb_and_entity`, que combina HDBSCAN con un tamano minimo de cluster de 2 y agrupamiento por entidades con frecuencia documental maxima de 3. El conjunto de datos resultante contiene 2.177.125 ejemplos sinteticos. El checkpoint publicado corresponde a la epoca 3 de 3, con todos los parametros entrenados (1.543.714.304, es decir, el 100 % del modelo).

Su relevancia es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card extendida mas alla de la tabla de entrenamiento y sin resultados de evaluacion publicados. Resulta util como referencia para quienes estudian tecnicas de memorizacion en modelos pequenos o el efecto del clustering en la construccion de datasets sinteticos, pero no esta pensado como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso secuencias de 8.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activaciones SwiGLU y sesgos de atencion QKV, tal como corresponde a la familia Qwen2. El ajuste fino es completo (todos los parametros son entrenables), realizado con FSDP sobre 8 GPU AMD Instinct MI325X durante 2,23 horas de reloj (17,9 GPU-hora) para las 3 epocas.

Los hiperparametros documentados son: batch efectivo de 256 (32 por dispositivo, 1 paso de acumulacion, 8 GPU), tasa de aprendizaje 2e-05 constante con warmup del 5 %, weight decay 0,01, max grad norm 1,0, longitud maxima de secuencia 8.096 tokens, precision bf16 con gradient checkpointing y calculo de perdida unicamente sobre los tokens del asistente. El dataset de entrenamiento son 2.177.125 ejemplos sinteticos derivados de MuSiQue mediante el metodo `hdb_and_entity` (HDBSCAN con min cluster size 2 combinado con agrupamiento por entidades de df maximo 3). No se documenta el uso de RLHF ni DPO; se trata de un ajuste supervisado clasico. No se detalla la composicion exacta del dataset ni el numero total de tokens procesados.

## Capacidades
- Generacion de texto conversacional heredada de Qwen2.5-1.5B-Instruct, con plantilla de chat Qwen.
- Memorizacion y recuperacion de asociaciones pregunta-respuesta sobre el corpus sintetico de MuSiQue empleado en el entrenamiento.
- Razonamiento multi-salto limitado al dominio de los datos de entrenamiento (MuSiQue se construye sobre preguntas que requieren combinar varios pasajes).
- Soporte de tool calling y function calling: no documentado en la model card; se desconoce si se preserva tras el ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas para este checkpoint; el modelo base Qwen2.5 soporta varios idiomas, pero el ajuste fino puede haber degradado el rendimiento fuera del ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso
- Investigacion sobre memorizacion en LLM: el modelo sirve como sujeto de estudio para medir cuanto conocimiento factual del corpus sintetico retiene un modelo de 1,5B tras un full fine-tuning de 3 epocas, comparando con el modelo base.
- Evaluacion de tecnicas de clustering para generacion de datasets: permite analizar si el agrupamiento `hdb_and_entity` produce ejemplos sinteticos de mayor calidad que alternativas como agrupamiento puro por entidades o por similitud de embeddings.
- Reproduccion de experimentos academicos: al estar publicados los hiperparametros completos (batch, LR, hardware, duracion), es replicable en entornos con 8 GPU MI325X o equivalentes.
- Baseline en tareas de question answering multi-salto: util como punto de comparacion frente a modelos ajustados con otros metodos de sintesis de datos sobre MuSiQue.
- Analisis de olvido catastrofico: el checkpoint permite estudiar la degradacion de capacidades generales del modelo base tras el ajuste especializado, comparando respuestas en tareas ajenas a MuSiQue.
- Prototipado de asistentes conversacionales de bajo coste: con 1,5B parametros cabe en GPU de consumo y puede desplegarse con vLLM o llama.cpp para pruebas de concepto, aunque no se recomienda en produccion por la ausencia de evaluacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4090); A100 y H100 no son necesarias para inferencia, solo para entrenamiento a gran escala.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`), vLLM, TGI (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep3 | 1,54B | no disponible (entrenado a 8.096) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste especializado en memorizacion sobre MuSiQue |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun model card oficial de Qwen) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; capacidades generales e instrucciones |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens (segun model card oficial de Qwen) | Apache 2.0 | Hugging Face | Version base sin ajuste instructivo |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens (segun model card oficial de Meta) | Llama 3.2 Community License | Hugging Face | Alternativa de tamano similar con licencia mas restrictiva |

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos del modelo base y de los datos de preentrenamiento de Qwen, no evaluados en este checkpoint.
- Riesgo de alucinacion: alto en dominios fuera de MuSiQue, dado que el ajuste fino sobre 2,17 millones de ejemplos sinteticos puede provocar olvido catastrofico de las capacidades generales del modelo base.
- Limitaciones de contexto e idioma: la model card no especifica la ventana de contexto efectiva tras el ajuste; el entrenamiento uso 8.096 tokens, por lo que el rendimiento mas alla de esa longitud no esta garantizado. Los idiomas soportados no estan documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin evaluacion de calidad; el uso en produccion requiere validacion propia.
- Caveats para produccion: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, sin model card extendida y sin documentacion sobre tool calling o agentes. No se recomienda su despliegue en entornos productivos sin una evaluacion exhaustiva previa.
- El checkpoint corresponde a la epoca 3 de 3; no se han publicado checkpoints intermedios ni curvas de perdida, lo que impide evaluar la convergencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-hdb_and_entity-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del corpus de origen): no disponible enlace directo en la informacion proporcionada
- Paper de MuSiQue: no disponible enlace en la informacion proporcionada
- Repositorio del autor: no disponible
- Demo: no disponible
