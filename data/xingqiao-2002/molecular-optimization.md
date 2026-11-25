# Xingqiao-2002/molecular-optimization

## Resumen

`Xingqiao-2002/molecular-optimization` es un adaptador LoRA de tipo PEFT publicado por el usuario Xingqiao-2002 sobre el modelo base multimodal `Qwen/Qwen3.5-4B`. El adaptador está especializado en una tarea concreta de química computacional: la optimización molecular guiada por objetivos, es decir, la modificación controlada de estructuras químicas (representadas como SMILES y, presumiblemente, con soporte de imagen) para cumplir múltiples criterios cuantitativos simultáneos (propiedades tipo BDP, BDQ, BPQ, DPQ, BDPQ).

El checkpoint publicado corresponde al paso 23.290 de un entrenamiento SFT de una sola época sobre 745.260 muestras del propio dataset del autor, realizado con `ms-swift` en modo no-thinking. La relevancia práctica es doble: por un lado, demuestra la viabilidad de adaptar un modelo de lenguaje multimodal de 4B parámetros a una tarea científica de nicho con un LoRA de rango 64; por otro, publica métricas de evaluación verificadas (validez SMILES del 96,10%, éxito objetivo estricto del 49,78%), lo que permite juzgar el adaptador sin necesidad de reproducir el entrenamiento.

El adaptador tiene un tamaño de repositorio de 0,3 GB, licencia Apache-2.0 y se distribuye en formato safetensors compatible con la librería `peft`. No se trata de un modelo autónomo: requiere cargar el modelo base Qwen3.5-4B y aplicar el adaptador encima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-4B |
| Parametros totales | no disponible (el adaptador LoRA tiene r=64; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó `max_length=1024`) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones de Qwen3.5-4B) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-4B |
| Rango LoRA / alpha | r=64 / alpha=128 |
| Dropout LoRA | 0,05 |
| Módulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Checkpoint | checkpoint-23290 (1 época, 745.260 muestras) |
| Framework de entrenamiento | ms-swift (SFT estándar, non-thinking mode) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-4B, un modelo multimodal de la familia Qwen con capacidad de procesar imagen y texto (`AutoModelForImageTextToText`). El LoRA se aplica exclusivamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las proyecciones del MLP (`gate_proj`, `up_proj`, `down_proj`), con `freeze_vit=true` y `freeze_aligner=true`, lo que significa que el codificador visual y el alineador multimodal permanecen congelados durante el entrenamiento. Solo se adaptan las capas del transformer de lenguaje.

El entrenamiento se realizó con `ms-swift` en modo SFT estándar, sin pérdidas auxiliares ni ReconVLA. Se empleó una época completa (23.290 pasos) con batch global de 32 (4 GPUs × 4 × 2), learning rate 5e-5 con scheduler coseno, `warmup_ratio=0.03`, longitud máxima de 1024 tokens y precisión bf16. El modo thinking está desactivado explícitamente (`--enable_thinking false`), de modo que el modelo produce respuestas directas sin cadena de razonamiento explícita. El dataset de entrenamiento es `Xingqiao-2002/molecular-optimization`, del propio autor, con 745.260 muestras en formato "Image + SMILES" plano.

## Capacidades

- Generación de SMILES químicamente válidos: el 99,90% de las salidas respetan el formato estricto `<SMILES>...</SMILES>` en la evaluación publicada.
- Optimización molecular multiobjetivo: modifica estructuras para satisfacer criterios cuantitativos combinados (BDP, BDQ, BPQ, DPQ, BDPQ).
- Procesamiento multimodal: el modelo base acepta entradas de imagen además de texto (aunque en este adaptador el codificador visual está congelado).
- Razonamiento químico guiado por objetivos: interpreta la tarea de optimización y propone una molécula candidata.
- Generación en modo no-thinking: respuestas directas sin cadena de razonamiento explícita.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Descubrimiento de fármacos asistido: dado un compuesto de partida y un conjunto de objetivos de propiedades (p. ej. mejorar solubilidad manteniendo afinidad), el adaptador propone variantes SMILES que cumplen los criterios; adecuado porque fue entrenado exactamente sobre ese formato de tarea.
- Filtrado y priorización en pipelines de quimioinformática: integrar el adaptador como generador de candidatos en un pipeline que luego valide con RDKit u otro software; su alta tasa de validez SMILES (96,10%) reduce el coste de descarte.
- Exploración de espacio químico en entornos con recursos limitados: al ser un LoRA de 0,3 GB sobre un base de 4B, puede desplegarse en una GPU consumer, lo que permite iterar localmente sin infraestructura de gran escala.
- Generación de moléculas con restricciones estrictas de formato: el 99,90% de cumplimiento del formato `<SMILES>...</SMILES>` lo hace apto para integrarse en sistemas que parsean la salida de forma automática.
- Benchmarking de métodos de optimización molecular: sirve como línea base reproducible (con métricas publicadas de validez, éxito objetivo y similitud Tanimoto) para comparar con otros enfoques.
- Investigación académica sobre adaptación LoRA en dominios científicos: el checkpoint y las métricas verificadas permiten estudiar el efecto del rango, los módulos objetivo y el modo non-thinking en tareas de química.
- Prototipado de asistentes de química computacional: combinado con el modelo base multimodal, puede construir interfaces que reciban una imagen de estructura y devuelvan una propuesta optimizada.

## Benchmarks y rendimiento

| Evaluación | Métrica | Resultado |
|---|---|---|
| Clean Test (n=44.318, greedy@1) | Validez | 96,10% |
| Clean Test (n=44.318, greedy@1) | Éxito objetivo (estricto a dos decimales) | 49,78% |
| Clean Test — seen | Éxito objetivo (estricto) | 52,88% |
| Clean Test — unseen | Éxito objetivo (estricto) | 46,67% |
| Clean Test | Similitud Tanimoto media (válidas) | 0,6399 |
| Clean Test | Tasa de formato estricto `<SMILES>...</SMILES>` | 99,90% |
| 5 tareas IND seen (n=2.496, beam=20 best-of-20) | Criterio bruto medio | 88,4% |
| — BDP | Criterio bruto | 94,0% |
| — BDQ | Criterio bruto | 95,4% |
| — BPQ | Criterio bruto | 98,8% |
| — DPQ | Criterio bruto | 82,6% |
| — BDPQ | Criterio bruto | 71,3% |
| 5 tareas IND seen (beam=20) | Criterio a dos decimales medio | 79,4% |
| — BDP | Criterio a dos decimales | 85,4% |
| — BDQ | Criterio a dos decimales | 90,2% |
| — BPQ | Criterio a dos decimales | 98,6% |
| — DPQ | Criterio a dos decimales | 65,3% |
| — BDPQ | Criterio a dos decimales | 57,5% |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador LoRA ocupa 0,3 GB y se suma al modelo base Qwen3.5-4B. En bf16, un modelo de 4B requiere aproximadamente 8-10 GB de VRAM, más overhead de activaciones y del procesador multimodal.
- GPU recomendadas: no especificadas en la información. El entrenamiento usó 4 GPUs (batch 4 × 2 por GPU), lo que sugiere GPUs de gama profesional (A100/H100 o similares) para entrenamiento.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 12-16 GB o más (RTX 4090, RTX 4080, etc.) en bf16 o cuantizado, aunque el dato exacto no está publicado.
- Opciones de despliegue: `transformers` + `peft` (según el snippet de la model card con `AutoModelForImageTextToText` y `PeftModel`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico de una tarea de nicho (optimización molecular) y no hay referencias a alternativas equivalentes en la model card.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Xingqiao-2002/molecular-optimization | LoRA sobre 4B | no disponible | Apache-2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `Qwen/Qwen3.5-4B` y aplicar el adaptador; no puede usarse de forma independiente.
- Sesgos conocidos: no documentados; al entrenarse sobre un dataset propio de 745.260 muestras, hereda los sesgos de composición de dicho dataset.
- Riesgo de alucinación: la validez SMILES es del 96,10%, lo que implica que aproximadamente 4 de cada 100 salidas no son moléculas válidas; en producción es imprescindible validar con RDKit u otro parser.
- El éxito objetivo estricto es del 49,78% en test limpio, por debajo del 52,88% en tareas vistas y del 46,67% en no vistas; el rendimiento en tareas fuera de distribución es notablemente inferior.
- El rendimiento cae en tareas multiobjetivo complejas: BDPQ a dos decimales solo alcanza el 57,5% frente al 98,6% de BPQ.
- Longitud de contexto de entrenamiento limitada a 1024 tokens; no se documenta la ventana efectiva del modelo base.
- Idiomas soportados no documentados; el entrenamiento parece centrado en representaciones SMILES, no en lenguaje natural multilingüe.
- El modo thinking está desactivado, por lo que no se beneficia de razonamiento explícito en tareas complejas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Xingqiao-2002/molecular-optimization
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/Xingqiao-2002/molecular-optimization
- Repositorio con scripts de SFT e inferencia: https://github.com/XingqiaoLin/molecular-optimization
