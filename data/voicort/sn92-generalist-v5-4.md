# voicort/sn92-generalist-v5-4

## Resumen

voicort/sn92-generalist-v5-4 es un modelo de tipo "generalist decision-model" publicado por el usuario voicort en HuggingFace, derivado por fine-tuning del modelo base baselabs/mammoth-1. Con 26.085.330.160 parámetros (aproximadamente 26 mil millones) y un repositorio de 52,2 GB en formato safetensors, se presenta como una variante especializada orientada a la toma de decisiones dentro de un pipeline de evaluación denominado "eval-v5" y un marco de trabajo llamado "reax" y "sn92". La arquitectura declarada en los metadatos es qwen3_5, lo que sugiere una base de la familia Qwen 3.5 sobre la que se ha aplicado el fine-tuning respecto al modelo mammoth-1.

El modelo tiene un acceso restringido (gated) en HuggingFace: es necesario aceptar condiciones en la página del repositorio antes de poder descargar los pesos. La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, aunque la naturaleza gated del acceso añade condiciones adicionales que conviene revisar. El número de descargas (4) y de likes (0) indica que se trata de una publicación muy reciente y con escasa adopción pública en el momento de redactar esta ficha.

La relevancia de este modelo radica en su enfoque como modelo de decisión dentro de un sistema mayor (sn92/reax), más que como un LLM conversacional de propósito general. No obstante, la información pública disponible es muy limitada: no se detallan idiomas soportados, pipeline, datos de entrenamiento ni resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio) |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos es qwen3_5, correspondiente a la familia Qwen 3.5. El modelo se ha obtenido por fine-tuning del modelo base baselabs/mammoth-1, según los tags `base_model:baselabs/mammoth-1` y `base_model:finetune:baselabs/mammoth-1`. El tamaño del repositorio (52,2 GB) es coherente con un modelo denso de aproximadamente 26 mil millones de parámetros en precisión de 16 bits, sin que haya indicios de una arquitectura MoE (no se declaran parámetros activos).

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Los tags "reax", "sn92", "generalist", "decision-model" y "eval-v5" sugieren que el fine-tuning está orientado a tareas de decisión y evaluación dentro de un sistema propietario del autor, pero no se detalla el procedimiento.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base mammoth-1 y de la arquitectura Qwen 3.5.
- Orientación a toma de decisiones ("decision-model") dentro del pipeline sn92/reax, según los tags del repositorio.
- Capacidades de evaluación ("eval-v5") integradas en el flujo de trabajo del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el tag "decision-model" sugiere uso en pipelines agénticos.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Capacidades de código y matemáticas: no disponibles de forma específica.

## Casos de uso

- Sistemas de decisión automatizada: el modelo puede emplearse como componente de clasificación o selección de acciones dentro de un pipeline (sn92/reax), dado su tag "decision-model" y su fine-tuning específico sobre el modelo base.
- Evaluación automática de respuestas: el tag "eval-v5" sugiere su uso como evaluador o juez en pipelines de evaluación de otros modelos o sistemas.
- Enrutamiento de consultas: con 26 B de parámetros, puede utilizarse para decidir qué herramienta o submodelo debe atender una petición en una arquitectura multi-agente.
- Investigación sobre fine-tuning de modelos base: al derivar de baselabs/mammoth-1 con licencia Apache 2.0, sirve como caso de estudio de adaptación de un modelo fundacional a una tarea concreta.
- Prototipado de asistentes conversacionales: la arquitectura Qwen 3.5 subyacente permite generación de texto general, aunque las capacidades conversacionales específicas no están documentadas.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integración en productos comerciales, siempre que se cumplan las condiciones de acceso gated del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para los pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 26-30 GB, viable en GPUs como A100 40 GB o RTX 4090 24 GB con cuantización más agresiva.
- VRAM estimada en cuantización de 4 bits: alrededor de 13-16 GB, viable en RTX 4090, RTX 3090 o GPUs consumer de 16 GB o más.
- GPUs recomendadas: A100 80 GB, H100 80 GB para FP16; A100 40 GB o L40S para 8 bits; RTX 4090/3090 para 4 bits.
- Cabe en GPU consumer: sí, con cuantización de 4 bits en GPUs de 16-24 GB.
- Opciones de despliegue: vLLM, TGI o llama.cpp para versiones cuantizadas; no se dispone de confirmación de compatibilidad específica con Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| voicort/sn92-generalist-v5-4 | ~26,1 B | no disponible | Apache 2.0 | Gated en HuggingFace |
| baselabs/mammoth-1 (modelo base) | no disponible | no disponible | no disponible | no disponible |
| Qwen 3.5 (familia base) | variable | no disponible | variable según variante | pública |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (decision-models especializados) para establecer una comparativa de rendimiento rigurosa.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan idiomas, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que puede limitar la reproducibilidad y el uso automatizado.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; no se han publicado evaluaciones específicas de fiabilidad.
- Sesgos conocidos: no disponibles; al derivar de un modelo base no documentado, los sesgos heredados no pueden caracterizarse.
- Licencia Apache 2.0 declarada, pero las condiciones del acceso gated pueden imponer restricciones adicionales que deben revisarse antes de uso comercial.
- Adopción mínima (4 descargas, 0 likes): no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Uso previsto aparentemente limitado a un pipeline propietario (sn92/reax/eval-v5); su comportamiento fuera de ese contexto no está documentado.

## Enlaces

- HuggingFace: https://huggingface.co/voicort/sn92-generalist-v5-4
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
