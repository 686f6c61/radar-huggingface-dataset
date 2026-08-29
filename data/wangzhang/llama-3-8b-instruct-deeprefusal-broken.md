# wangzhang/Llama-3-8B-Instruct-DeepRefusal-Broken

## Resumen

Llama-3-8B-Instruct-DeepRefusal-Broken es un modelo de 8.030 millones de parámetros derivado de Meta-Llama-3-8B-Instruct, modificado mediante la herramienta abliterix para eliminar los mecanismos de rechazo (refusal) que el modelo defendido DeepRefusal había reconstruido. El modelo original, skysys00/Meta-Llama-3-8B-Instruct-DeepRefusal, fue publicado junto al artículo "Beyond Surface Alignment: Rebuilding LLMs Safety Mechanism via Probabilistically Ablating Refusal Direction" (arXiv:2509.15202, EMNLP 2025 Findings) y afirmaba ser resistente a ataques de abliteración. Este modelo demuestra lo contrario: aplicando una atenuación del delta del LoRA (λ=0.3) seguida de una abliteración estándar de dirección única, se consigue un 89% de Attack Success Rate (ASR) sobre 100 prompts dañinos de AdvBench, sin ningún fine-tuning adicional.

El modelo es relevante para la comunidad de seguridad de LLMs porque falsifica las afirmaciones de robustez de DeepRefusal y muestra que la defensa basada en reconstruir la dirección de rechazo mediante un LoRA de rango 16 es vulnerable a intervenciones en el espacio de pesos. También es un artefacto útil para investigación en red-teaming y análisis de mecanismos de alineación. El autor, wangzhang, publica el modelo junto con el código de reproducción completo en el repositorio abliterix.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3-8B-Instruct base) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con safetensors, tamaño 16.1 GB sugiere fp16) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | llama3 (licencia de Meta Llama 3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct como base. Sobre él, el modelo DeepRefusal original incorpora un adaptador LoRA de rango 16 que reconstruye el mecanismo de rechazo. El análisis SVD de `W_defended − W_base` confirma la presencia de un acantilado de valores singulares en rango 16, coincidiendo con el hiperparámetro `lora_rank = 16` publicado en el artículo.

El proceso de modificación consta de dos pasos, sin fine-tuning:

1. **Atenuación del delta del LoRA**: se calcula `W' = W_base + λ · (W_defended − W_base)` con λ = 0.3. Esto reduce la fuerza del circuito de "reconstrucción de rechazo" sin restaurar el modelo base.
2. **Abliteración estándar de dirección única**: se aplica el método del vector medio (`mean` vector), modo `direct`, con `projected_abliteration = true` y 60 trials de Optuna sobre 4 componentes de atención/MLP.

La defensa de DeepRefusal se entrena para resistir intervenciones en el espacio de activaciones (como `h − r̂r̂ᵀh`), pero no contempla la atenuación mecánica de los pesos en tiempo de entrenamiento. Una vez que la magnitud efectiva del delta del LoRA cae por debajo de un umbral, la abliteración lineal estándar puede encontrar y restar la dirección de rechazo residual.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino), heredadas del modelo base Llama-3-8B-Instruct.
- Razonamiento, comprensión lectora y generación de código, con las mismas capacidades que el modelo base.
- Sin mecanismos de rechazo: el modelo responde a prompts dañinos que el modelo defendido rechazaría, incluyendo instrucciones para fabricación de armas, phishing, síntesis de metanfetamina, hacking WiFi, falsificación de firmas, malware de robo de credenciales, etc.
- Capacidad de red-teaming: sirve como herramienta para evaluar la robustez de defensas de seguridad en LLMs.
- No se ha confirmado soporte de tool calling o function calling en la información disponible.
- No se ha confirmado modo de pensamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- **Investigación en seguridad de LLMs**: permite estudiar cómo las defensas basadas en LoRA pueden ser vulnerables a intervenciones en el espacio de pesos. Se usa para validar o refutar afirmaciones de robustez de nuevos métodos de alineación.
- **Red-teaming de modelos**: los equipos de seguridad pueden usar este modelo como referencia para probar si sus propias defensas resisten ataques similares, comparando tasas de éxito de jailbreak.
- **Análisis de mecanismos de alineación**: al eliminar selectivamente la dirección de rechazo, se puede estudiar qué componentes del modelo son responsables de la seguridad y cómo se distribuyen en las capas.
- **Desarrollo de herramientas de jailbreak académico**: el código de reproducción (abliterix) sirve como base para investigar nuevas técnicas de ataque y defensa en entornos controlados.
- **Evaluación de métricas de seguridad**: se puede usar para calibrar jueces automáticos (LLM judges) midiendo su capacidad para detectar respuestas dañinas en un modelo sin rechazos.
- **Estudio de transferencia de ataques**: comparar el comportamiento de este modelo con otros abliteados (p.ej. mediante heretic) para entender qué defensas son más robustas frente a diferentes familias de ataques.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados, evaluados con un juez LLM (Gemini 3.1 Flash Lite) sobre 100 prompts dañinos de AdvBench y un conjunto de 15 prompts "hardcore" canónicos:

| Metrica | DeepRefusal (defendido) | Abliterix broken (este modelo) |
|---|---|---|
| Rechazos en 100 prompts AdvBench (LLM-judge) | 100 / 100 | 11 / 100 |
| Attack Success Rate (ASR) | 0 % | 89 % |
| Conjunto hardcore jailbreak (15 prompts) | 0 / 15 | 14 / 15 |
| Divergencia KL respecto al modelo defendido | 0 | 0.053 |
| Coherencia (desviación de longitud) | — | 0.03 σ |
| Entrenamiento adicional | — | Ninguno |

Además, la model card incluye una comparativa de ataques previos sobre DeepRefusal, todos con ASR entre 0% y 2%:

| Ataque | Herramienta / Método | ASR sobre DeepRefusal |
|---|---|---|
| Representation engineering | heretic | ~0 % (falla) |
| Ablación de dirección de rechazo | (Arditi et al. 2024) | 0.4 % |
| Transferencia de dirección de rechazo | desde Llama-3-8B-Instruct base | 0.4 % |
| Prefilling attack | Vega et al. 2024 | 0.4 % |
| Optimización basada en gradiente | GCG (Zou et al. 2023) | 2.0 % |
| Plantillas manuales de jailbreak | HumanJailbreak / HarmBench | 0 % |
| Ataque de código fuera de distribución | CodeAttack (Ren et al. 2024) | 0.2 % |
| **Este trabajo** | **abliterix** | **89 %** |

## Requisitos de hardware

- El repositorio ocupa 16.1 GB, lo que sugiere pesos en fp16. Para cargar el modelo completo en fp16 se necesitan aproximadamente 16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con al menos 16 GB de VRAM para fp16.
- No se han publicado cuantizaciones oficiales (GGUF, int8, int4), por lo que no se puede estimar un consumo menor sin generarlas manualmente.
- Opciones de despliegue: compatible con text-generation-inference (TGI) según los tags del modelo. También puede usarse con vLLM, llama.cpp u Ollama si se generan los formatos adecuados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASR (AdvBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wangzhang/Llama-3-8B-Instruct-DeepRefusal-Broken | 8B | No disponible | 89 % | llama3 | Hugging Face |
| skysys00/Meta-Llama-3-8B-Instruct-DeepRefusal | 8B | No disponible | 0 % (defendido) | llama3 | Hugging Face |
| NousResearch/Meta-Llama-3-8B-Instruct | 8B | 8K (estándar) | No evaluado | llama3 | Hugging Face |

El modelo base sin defensa (NousResearch/Meta-Llama-3-8B-Instruct) mantiene los rechazos estándar de Llama-3-8B-Instruct, pero no se han publicado métricas de ASR en la información disponible. La comparativa principal es entre el modelo defendido y el roto: la diferencia de ASR (0% vs 89%) demuestra el impacto de la intervención.

## Limitaciones y advertencias

- **Riesgo de contenido dañino**: el modelo ha sido diseñado para eliminar los mecanismos de rechazo, por lo que puede generar instrucciones peligrosas (fabricación de explosivos, phishing, malware, etc.). No debe desplegarse en producción sin salvaguardas adicionales.
- **Sesgos heredados**: al partir de Llama-3-8B-Instruct, el modelo conserva los sesgos y alucinaciones del modelo base, que no han sido corregidos.
- **Alucinación**: no se ha evaluado específicamente, pero es esperable un comportamiento similar al del modelo base.
- **Limitaciones de contexto**: no se ha especificado la longitud de contexto; se asume la estándar de Llama-3-8B-Instruct (8K), pero no está confirmado.
- **Restricciones de licencia**: la licencia llama3 permite uso comercial, pero requiere permiso de Meta si el número de usuarios mensuales supera los 700 millones. Además, el uso de este modelo para generar contenido dañino puede violar términos de servicio de plataformas.
- **Advertencia ética**: el modelo es un artefacto de investigación para red-teaming. Su distribución puede facilitar la creación de contenido malicioso. Se recomienda usarlo únicamente en entornos controlados y con fines académicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wangzhang/Llama-3-8B-Instruct-DeepRefusal-Broken
- Repositorio abliterix (herramienta de ataque): https://github.com/wuwangzhang1216/abliterix
- Issue #11 con el write-up completo del ataque: https://github.com/wuwangzhang1216/abliterix/issues/11
- Artículo DeepRefusal (arXiv): https://arxiv.org/abs/2509.15202
- Repositorio DeepRefusal: https://github.com/YuanBoXie/DeepRefusal
- Fork del modelo en GitHub (Damacol): https://github.com/Damacol/wangzhang-llama-3-8b-instruct-deeprefusal-broken
