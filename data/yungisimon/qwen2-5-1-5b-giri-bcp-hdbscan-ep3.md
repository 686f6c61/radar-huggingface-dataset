# yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep3

## Resumen

yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep3 es un ajuste fino completo (full fine-tuning) del modelo instructivo Qwen2.5-1.5B-Instruct de Alibaba, publicado por el usuario yungisimon en Hugging Face. El modelo se entrena como "memory model", es decir, un modelo orientado a tareas de recuperación y razonamiento sobre memoria documental, a partir de pares sintéticos de pregunta-respuesta derivados de BrowseComp-Plus y agrupados mediante el algoritmo de clustering HDBSCAN. El checkpoint publicado corresponde a la época 3 de 3 del entrenamiento.

La relevancia de esta ficha es acotada: se trata de un experimento de investigación con 0 descargas y 0 likes en el momento de la consulta, sin model card extendida ni resultados de benchmarks publicados. No obstante, resulta interesante como ejemplo de pipeline de ajuste fino completo sobre hardware AMD (8x Instinct MI325X) y como artefacto de un dataset sintético concreto (754.069 ejemplos). La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only de 1.543.714.304 parámetros (1,5B) con contexto nativo de 32.768 tokens en la familia Qwen2.5, aunque el entrenamiento se realizó con longitud máxima de secuencia de 8.096 tokens.

Al estar construido sobre Qwen2.5-1.5B-Instruct, hereda las capacidades conversacionales y de tool calling del modelo base, pero el ajuste fino sobre pares QA de memoria puede haber desplazado su distribución hacia ese dominio específico. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino completo |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; entrenado con max sequence length de 8.096 |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multilingue, pero la model card no lo declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 1.543.714.304 parámetros, inicializado desde Qwen/Qwen2.5-1.5B-Instruct. Se aplicó full fine-tuning con FSDP (Fully Sharded Data Parallel), actualizando el 100% de los parámetros (1.543.714.304 entrenables). El entrenamiento usó precisión bf16, gradient checkpointing y cálculo de pérdida únicamente sobre los tokens del asistente.

Los datos de entrenamiento provienen de un fichero sintético denominado `bcp_subset300_numsamplingepochs1_hdbscan_mcs2_crossdoc_entity_combination_v3.json`, con 754.069 ejemplos generados a partir de BrowseComp-Plus y agrupados con HDBSCAN (min cluster size 2). La configuración de entrenamiento incluye batch efectivo de 1024 (128 por dispositivo, 1 acumulación, 8 GPUs), learning rate de 2e-05 con warmup ratio 0.05 y decaimiento constante, weight decay 0.01, max grad norm 1.0, 3 épocas y longitud máxima de secuencia de 8.096 tokens. El entrenamiento completo de las 3 épocas consumió 0,50 horas de reloj (4,0 GPU-horas) sobre 8x AMD Instinct MI325X. No se documenta uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un ajuste fino supervisado convencional.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct y reorientada a tareas de memoria documental.
- Respuesta a preguntas sobre pares sintéticos de QA derivados de BrowseComp-Plus, con agrupación por entidades y combinación cross-document.
- Razonamiento sobre memoria: el ajuste busca que el modelo recupere y combine información de múltiples documentos.
- Tool calling / function calling: heredado del modelo base Qwen2.5-Instruct, aunque no se verifica explícitamente tras el ajuste.
- Capacidades multilingües: presumiblemente heredadas del modelo base, pero no declaradas en la model card.
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso específicas para este checkpoint.

## Casos de uso

- Investigación sobre memory models: servir como punto de partida reproducible para estudiar cómo el ajuste fino sobre pares QA sintéticos afecta a la recuperación y combinación de información entre documentos.
- Evaluación de pipelines de datos sintéticos: comparar el efecto de HDBSCAN con min cluster size 2 frente a otras estrategias de agrupación en la calidad de las respuestas del modelo.
- Prototipado de asistentes de consulta documental: desplegar el modelo en un entorno controlado para responder preguntas sobre un corpus pequeño, aprovechando su entrenamiento específico en combinación cross-document.
- Baseline en experimentos de ajuste fino: usar este checkpoint como referencia de full fine-tuning de 1,5B sobre 8 GPUs AMD MI325X para comparar con LoRA u otras técnicas.
- Generación de respuestas conversacionales en dominios acotados: integrarlo en un chatbot de soporte interno donde el contexto quepa en 8.096 tokens y el dominio sea similar al de BrowseComp-Plus.
- Estudio de eficiencia de entrenamiento: analizar el coste de 4 GPU-horas para 3 épocas sobre 754.069 ejemplos como referencia de throughput en hardware AMD Instinct.
- Pruebas de cuantización y despliegue: convertir los pesos bf16 a GGUF o AWQ para medir la degradación de un modelo ajustado específicamente en tareas de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100 o AMD Instinct MI325X.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y GPUs con 8 GB o más en cuantización.
- Opciones de despliegue: transformers (AutoModelForCausalLM), vLLM, llama.cpp (tras conversión a GGUF), Ollama (tras conversión), Text Generation Inference (TGI).
- Latencia y throughput estimados: no disponibles; el autor solo reporta 4,0 GPU-horas para el entrenamiento completo de 3 épocas, sin datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep3 | 1,5B | 32.768 (base); entrenado a 8.096 | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino específico en memoria documental |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, capacidades generales |
| Qwen/Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | Hugging Face | Modelo base pre-entrenado sin instrucciones |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 131.072 | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto mayor |

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes: no hay validación comunitaria ni resultados de benchmarks publicados.
- El ajuste fino sobre pares QA sintéticos de BrowseComp-Plus puede degradar capacidades generales del modelo base (olvido catastrófico), especialmente en tool calling y conversación abierta.
- Riesgo de alucinación: al entrenarse sobre datos sintéticos, el modelo puede generar respuestas plausibles pero incorrectas en dominios fuera de la distribución de entrenamiento.
- Longitud de contexto de entrenamiento limitada a 8.096 tokens, aunque el modelo base soporte 32.768; el rendimiento más allá de 8.096 tokens no está garantizado.
- Idiomas soportados no declarados: no se confirma el comportamiento multilingüe tras el ajuste.
- Sin documentación sobre sesgos: no se han publicado análisis de sesgo ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere evaluación propia.
- El dataset de entrenamiento (754.069 ejemplos sintéticos) no está publicado como artefacto independiente en la información disponible, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-bcp-hdbscan-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- BrowseComp-Plus: no disponible en la información proporcionada
- HDBSCAN (documentación): https://hdbscan.readthedocs.io/
