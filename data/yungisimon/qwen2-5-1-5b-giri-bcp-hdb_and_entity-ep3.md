# yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep3

## Resumen

yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep3 es un ajuste fino completo (full fine-tuning) del modelo instructivo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario yungisimon bajo licencia Apache 2.0. El modelo se ha especializado como "memory model": un modelo entrenado para retener y explotar información de memoria a partir de pares sintéticos de pregunta-respuesta generados sobre el conjunto BrowseComp-Plus, orientado a tareas de recuperación y razonamiento sobre documentos.

El entrenamiento emplea la estrategia de clustering `hdb_and_entity`, que combina HDBSCAN (con tamaño mínimo de cluster 2) y agrupación por entidades (con frecuencia documental máxima de 3) para construir el corpus de 3.671.014 ejemplos. El checkpoint publicado corresponde a la época 3 de 3, con todos los parámetros del modelo entrenados (1.543.714.304 parámetros, el 100% del total).

Por su tamaño (1,5B parámetros) y su contexto de entrenamiento de 8.096 tokens, es un modelo ligero que puede desplegarse en hardware de consumo y utilizarse como componente de memoria o recuperación en pipelines de agentes y sistemas RAG, aunque su especialización tan concreta limita su uso generalista. El modelo no registra descargas ni interacciones en el momento de la consulta y no declara idiomas soportados en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basado en Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.096 tokens (longitud máxima de secuencia en entrenamiento); contexto nativo de Qwen2.5-1.5B-Instruct no especificado en la información disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), cargable con `transformers` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2 (transformer decoder-only) de Qwen2.5-1.5B-Instruct y se ha sometido a un ajuste fino completo con FSDP sobre 8 GPUs AMD Instinct MI325X, con precisión bf16 y gradient checkpointing. La pérdida se calcula únicamente sobre los tokens del asistente. El tamaño efectivo de batch es 1024 (128 por dispositivo, 1 paso de acumulación, 8 GPUs), con tasa de aprendizaje constante de 2e-05, warmup del 5%, weight decay de 0,01, norma máxima de gradiente de 1,0 y una longitud máxima de secuencia de 8.096 tokens. El entrenamiento completo de 3 épocas requirió 2,35 horas de reloj (18,8 GPU-horas).

El corpus de entrenamiento son pares sintéticos de pregunta-respuesta derivados de BrowseComp-Plus, agrupados mediante la estrategia `hdb_and_entity` (HDBSCAN con tamaño mínimo de cluster 2 combinado con agrupación por entidades con frecuencia documental máxima de 3), generando 3.671.014 ejemplos. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste fino supervisado, ni innovaciones arquitectónicas adicionales más allá del propio ajuste.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Qwen.
- Memoria y recuperación de información: el modelo está especializado en retener y explotar información de documentos, orientado a tareas de memoria y QA sobre corpus.
- Razonamiento sobre múltiples documentos (cross-document), derivado del corpus de entrenamiento con combinación de entidades entre documentos.
- Capacidad multilingüe: no disponible (no declarada en la model card; hereda potencialmente las del modelo base, sin confirmar).
- Tool calling / function calling: no disponible (no documentado para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque su naturaleza de "memory model" sugiere uso como componente en pipelines de agentes.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Componente de memoria en sistemas RAG: el modelo puede almacenar y recuperar información de documentos previamente procesados, actuando como módulo de memoria en pipelines de recuperación aumentada, gracias a su entrenamiento específico sobre pares QA de BrowseComp-Plus.
- Respuesta a preguntas sobre corpus documental: adecuado para responder consultas que requieren cruzar información entre varios documentos, dado el entrenamiento con agrupación de entidades cross-document.
- Agentes conversacionales con memoria a largo plazo: puede integrarse como memoria persistente en agentes que necesitan recordar hechos de interacciones o documentos anteriores dentro de una ventana de 8.096 tokens.
- Prototipado e investigación en modelos de memoria: su tamaño reducido (1,54B) y licencia Apache 2.0 lo hacen útil para experimentar con arquitecturas de memoria y recuperación en entornos académicos.
- Despliegue en hardware de consumo: al ser un modelo de 1,5B en bf16 (unos 3,1 GB de pesos), puede ejecutarse en GPUs consumer para tareas de inferencia de memoria y QA ligero.
- Filtrado y enriquecimiento de datos: puede emplearse para generar o validar pares pregunta-respuesta sobre documentos en la construcción de datasets sintéticos similares a los usados en su entrenamiento.
- Evaluación de estrategias de clustering documental: sirve como referencia para comparar el efecto de distintas agrupaciones (HDBSCAN, entidades) en el rendimiento de modelos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en bf16 (tamaño del repo); en cuantización de 8 bits rondaría 1,6 GB y en 4 bits unos 0,8 GB (estimación teórica, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16; A100, H100 o RTX 4090 son sobredimensionadas para este tamaño pero válidas para alto throughput.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 o superiores; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM.from_pretrained`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep3 | 1,54B | 8.096 (entrenamiento) | Memoria / QA sobre BrowseComp-Plus | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (nativo, según documentación de Qwen) | Instruct generalista | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 (nativo) | Instruct generalista | Apache 2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1,24B | 128K (nativo) | Instruct generalista | Llama 3.2 Community License | Hugging Face |

La comparación con el modelo base es la más directa: este ajuste sacrifica generalidad y contexto nativo (8.096 frente a 32.768 tokens) a cambio de especialización en memoria y QA documental. Frente a alternativas generalistas del mismo rango, carece de benchmarks publicados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente sobre pares QA sintéticos de BrowseComp-Plus con una estrategia de clustering concreta; su rendimiento fuera de ese dominio no está validado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que dificulta evaluar su utilidad real frente al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir información incorrecta, especialmente al tratarse de un ajuste sobre datos sintéticos.
- Contexto limitado a 8.096 tokens en entrenamiento, inferior al contexto nativo del modelo base; puede degradarse en secuencias más largas.
- Idiomas no declarados: no se especifica qué idiomas soporta el ajuste; probablemente herede el multilingüismo del base, pero sin garantía.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes, sin validación comunitaria.
- Fecha de creación futura (2026-11-15) en los metadatos, lo que puede indicar un artefacto o error en la publicación y conviene verificar antes de usarlo en producción.
- Sin datos sobre sesgos específicos; al derivar de un corpus sintético, puede heredar sesgos del proceso de generación y del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-bcp-hdb_and_entity-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- BrowseComp-Plus (referencia del corpus, no enlazado en la model card): no disponible
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
