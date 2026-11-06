# yuxuanw8/qwen3b-rlcr-hotpot-0.25-0.75-final

## Resumen

`qwen3b-rlcr-hotpot-0.25-0.75-final` es un ajuste fino del modelo Qwen2.5-3B-Instruct publicado por el usuario yuxuanw8 en Hugging Face. Se trata de un experimento de investigación más que de un modelo listo para producción: el autor lo ha entrenado con TRL mediante GRPO (Group Relative Policy Optimization) sobre el dataset `mehuldamani/hotpot_qa`, una variante de HotpotQA orientada a razonamiento multi-salto sobre documentos. El nombre del repositorio sugiere una configuración de recompensa o mezcla de datos con proporciones 0,25/0,75, aunque el autor no documenta su significado.

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), con los pesos en formato safetensors y un tamaño de repositorio de 6,8 GB. No se especifican la longitud de contexto efectiva tras el ajuste, los idiomas soportados ni la licencia, más allá de una etiqueta genérica `licence: license` en la model card.

Su relevancia es limitada pero concreta: sirve como referencia para quienes investigan el entrenamiento con RL verificable (RLVR/GRPO) sobre tareas de question answering con recuperación, y como ejemplo de pipeline TRL aplicado a un modelo pequeño. No hay métricas publicadas, ni demo, ni descargas, lo que refuerza su carácter de artefacto de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo base Qwen2.5-3B-Instruct: 32.768 tokens; no confirmado tras el ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior a GGUF/AWQ/GPTQ, no verificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card solo indica `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar, RoPE y normalización RMSNorm, sin mezcla de expertos. Sobre esa base, el autor aplica un ajuste fino con TRL 1.11.0.dev0 usando GRPO, el algoritmo de optimización de política con recompensas verificables introducido en DeepSeekMath (arXiv:2402.03300). El dataset de entrenamiento es `mehuldamani/hotpot_qa`, una adaptación de HotpotQA que plantea preguntas que requieren razonar sobre varios pasajes y combinar evidencia distribuida.

No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, la función de recompensa utilizada ni si hubo etapas previas de SFT o DPO. Tampoco se detalla si se aplicó decodificación especulativa, atención lineal u otra innovación técnica más allá del propio GRPO. La información disponible se limita a las versiones de framework (Transformers 4.57.6, PyTorch 2.10.0, Datasets 5.0.1, Tokenizers 0.22.2) y a un enlace a un run de Weights & Biases (`yuxuanw/RLCR/runs/i5677flf`) que no se ha podido verificar en el contenido proporcionado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-3B-Instruct.
- Razonamiento multi-salto sobre documentos, presumiblemente reforzado por el entrenamiento con GRPO sobre HotpotQA (no verificado con evaluaciones).
- Question answering con evidencia distribuida en varios pasajes.
- Soporte de tool calling y function calling: no confirmado explícitamente para este ajuste, aunque el modelo base Qwen2.5-3B-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingües: no disponibles; el modelo base soporta varios idiomas, pero el ajuste puede haber degradado el rendimiento fuera del inglés.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Investigación en RL verificable: el checkpoint sirve para reproducir o comparar curvas de entrenamiento GRPO sobre tareas de QA con recompensa binaria, usando el run de W&B como referencia.
- Experimentos de razonamiento multi-salto: útil para evaluar cómo un modelo de 3B se comporta en HotpotQA antes y después del ajuste con RL, midiendo exactitud por tipo de pregunta.
- Prototipado de pipelines RAG: el modelo puede integrarse en un sistema de recuperación y generación para responder preguntas que requieren combinar varios fragmentos, aunque sin garantías de calidad en producción.
- Baseline para comparativas de ajuste fino: sirve como punto de partida para medir el efecto de GRPO frente a SFT o DPO en modelos pequeños.
- Docencia y formación: ejemplo práctico de uso de TRL y GRPO con un modelo de 3B que cabe en GPUs de consumo, útil en cursos de post-entrenamiento.
- Generación de respuestas conversacionales en inglés: hereda la capacidad del modelo base para mantener diálogos, aunque el ajuste específico puede haber estrechado su distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 8-10 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización 8 bits: alrededor de 3,5-4 GB para pesos.
- VRAM estimada en cuantización 4 bits (GPTQ/AWQ/GGUF Q4): alrededor de 2-2,5 GB para pesos.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o superiores para FP16; RTX 3060 12 GB o RTX 4060 Ti 16 GB suficientes en 4-8 bits.
- Cabe en GPU de consumo: sí, en modelos con al menos 8 GB de VRAM en FP16 y desde 6 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers (pipeline estándar), text-generation-inference (la model card incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama tras conversión a GGUF (no verificada).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3b-rlcr-hotpot-0.25-0.75-final | 3,09 B | no disponible | GRPO sobre HotpotQA | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | SFT + preferencias (no detallado) | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | SFT + preferencias | Apache 2.0 | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | SFT + RLHF | Llama 3.2 Community License | Hugging Face |

La comparación directa con el modelo base es la más informativa: este checkpoint añade un ajuste GRPO específico para HotpotQA, pero pierde la documentación de licencia, idiomas y contexto que sí ofrece Qwen. Frente a Llama-3.2-3B-Instruct, el contexto es presumiblemente menor y la licencia es menos clara.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en HotpotQA ni en ninguna otra tarea.
- Licencia no especificada: la model card solo contiene `licence: license`, lo que impide determinar si el uso comercial está permitido. El modelo base Qwen2.5-3B-Instruct es Apache 2.0, pero el autor no confirma que el ajuste herede esa licencia.
- Idiomas no declarados: el ajuste sobre un dataset en inglés puede haber degradado el rendimiento multilingüe del modelo base.
- Riesgo de alucinación: al ser un modelo de 3B ajustado con RL sobre QA, puede generar respuestas plausibles pero no respaldadas por los pasajes, especialmente fuera de la distribución de HotpotQA.
- Sesgos: no documentados; hereda los del modelo base y los del dataset HotpotQA, que no está exento de sesgos de cobertura y anotación.
- Contexto efectivo desconocido: no se confirma que los 32.768 tokens del modelo base se mantengan tras el ajuste.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad del repositorio antes de usarlo.
- No apto para producción sin evaluación previa: la falta de métricas, licencia clara y documentación lo desaconseja para despliegues reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuxuanw8/qwen3b-rlcr-hotpot-0.25-0.75-final
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/hotpot_qa
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Run de Weights & Biases: https://wandb.ai/yuxuanw/RLCR/runs/i5677flf
