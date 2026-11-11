# yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep1

## Resumen

yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep1 es un ajuste fino completo (full fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model", es decir, un modelo orientado a tareas de recuperación y razonamiento sobre memoria documental, partiendo de pares sintéticos de pregunta-respuesta generados a partir de BrowseComp-Plus y agrupados mediante HDBSCAN con tamaño mínimo de clúster 2.

Se trata de un checkpoint intermedio: corresponde a la época 1 de un entrenamiento planificado de 3 épocas, con 754.069 ejemplos de entrenamiento y una longitud máxima de secuencia de 8.096 tokens. El modelo conserva la arquitectura transformer densa de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales (el 100% entrenables) y pesos en bf16 safetensors, lo que permite cargarlo directamente con `transformers` usando la plantilla de chat de Qwen.

Su relevancia es acotada pero concreta: sirve como referencia para experimentos de ajuste fino orientado a memoria y recuperación sobre un modelo pequeño, y como caso de estudio de entrenamiento eficiente (4 horas de GPU en 8 aceleradores AMD Instinct MI325X para las 3 épocas). No obstante, al ser la primera época de tres y no contar con benchmarks publicados, debe considerarse un artefacto experimental más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (Qwen2), derivado de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.096 tokens en entrenamiento (contexto nativo del modelo base no especificado en la informacion disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso de la familia Qwen2 con 1.543.714.304 parámetros. El ajuste es un full fine-tuning con FSDP sobre el 100% de los parámetros, sin LoRA ni adaptadores. El entrenamiento se realizó en bf16 con gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente, con un tamaño de lote efectivo de 1.024 (128 por dispositivo, 1 paso de acumulación, 8 GPUs), tasa de aprendizaje constante de 2e-05 con warmup del 5%, weight decay de 0.01 y recorte de norma de gradiente de 1.0. La longitud máxima de secuencia fue de 8.096 tokens.

El conjunto de datos son pares sintéticos de pregunta-respuesta de BrowseComp-Plus, agrupados con HDBSCAN (tamaño mínimo de clúster 2) bajo el fichero `bcp_subset300_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`, con 754.069 ejemplos. El entrenamiento completo de 3 épocas consumió 0,50 horas de reloj (4,0 GPU-horas) en 8 AMD Instinct MI325X. Este checkpoint corresponde a la época 1. No se documentan en la información disponible técnicas como RLHF, DPO, decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional, heredada de Qwen2.5-1.5B-Instruct y ajustada con la plantilla de chat de Qwen.
- Razonamiento sobre memoria documental: el ajuste se orienta a tareas de recuperación y combinación de entidades entre documentos (cross-document entity combination).
- Respuesta a pares sintéticos de pregunta-respuesta derivados de BrowseComp-Plus.
- Soporte de tool calling y function calling: no documentado explícitamente en la información disponible; el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Capacidades multilingües: no disponibles; el modelo base es multilingüe, pero no se especifica el comportamiento tras el ajuste.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación en investigación sobre memoria y recuperación: el modelo sirve como punto de partida para reproducir o extender el pipeline de ajuste con datos de BrowseComp-Plus agrupados por HDBSCAN, comparando el checkpoint de época 1 con épocas posteriores.
- Evaluación de ajuste fino completo en modelos pequeños: permite estudiar el efecto del full fine-tuning sobre un modelo de 1,5B con 754.069 ejemplos y una ventana de 8.096 tokens, sin necesidad de infraestructura de gran escala.
- Prototipado de asistentes conversacionales de dominio acotado: al conservar la plantilla de chat de Qwen, puede desplegarse con `transformers` para probar respuestas multi-turno en entornos de laboratorio.
- Generación de respuestas sobre documentación sintética: útil para validar pipelines de QA que combinan entidades de varios documentos, el escenario concreto con el que se entrenó.
- Base para comparativas de eficiencia de entrenamiento: con 4 GPU-horas documentadas en 8 MI325X, sirve como referencia de coste para ajustes similares en hardware AMD.
- Estudio de degradación o deriva tras ajuste: al ser un checkpoint intermedio, permite analizar cómo evoluciona el comportamiento entre épocas y detectar olvido catastrófico respecto al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos (1.543.714.304 parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100, L40S o RTX 4090 son holgadas. El modelo cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- Opciones de despliegue: `transformers` (verificado por el autor con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se proporcionan conversiones en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep1 | 1,54B | 8.096 tokens (entrenamiento) | apache-2.0 | Hugging Face, 0 descargas | Checkpoint época 1 de 3, sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (modelo base) | apache-2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados por Qwen |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens (modelo base) | apache-2.0 | Hugging Face | Alternativa más ligera de la misma familia |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto mayor y licencia con restricciones |

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 1 de 3): el autor no lo presenta como modelo final, por lo que su calidad puede ser inferior a la de la época 3.
- No hay benchmarks publicados ni evaluación cualitativa: no es posible afirmar su rendimiento en MMLU, HumanEval, GSM8K ni en tareas de memoria.
- Riesgo de olvido catastrófico: el full fine-tuning sobre 754.069 ejemplos sintéticos puede degradar capacidades generales del modelo base, como el multilingüismo o el tool calling.
- Sesgos: no documentados; al entrenarse con datos sintéticos derivados de BrowseComp-Plus, puede heredar sesgos de esa fuente y de los procesos de generación automática.
- Riesgo de alucinación: no evaluado; los modelos de 1,5B ajustados con datos sintéticos son propensos a generar contenido plausible pero incorrecto.
- Idiomas soportados no especificados: no se garantiza un comportamiento multilingüe tras el ajuste.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y de los datos de entrenamiento.
- Disponibilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su funcionamiento.
- Uso en producción no recomendado sin una evaluación propia previa sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: no disponible en la informacion proporcionada
- Paper de Qwen2.5: no disponible en la informacion proporcionada
- Documentación de HDBSCAN: no disponible en la informacion proporcionada
- BrowseComp-Plus: no disponible en la informacion proporcionada
