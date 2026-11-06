# tnromy/Qwen2.5-1.5B-Legal-ID-GRPO

## Resumen

Qwen2.5-1.5B-Legal-ID-GRPO es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B orientado al dominio legal en indonesio, desarrollado por el usuario tnromy. El modelo parte de un checkpoint intermedio ya ajustado con supervisión (SFT), tnromy/Qwen2.5-1.5B-Legal-ID-SFT, sobre el que se aplica un entrenamiento adicional con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo con preferencias. El resultado es un modelo conversacional de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) empaquetado en safetensors con un repositorio de 3,1 GB.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con atención de tipo causal y ventana de contexto de 32.768 tokens (característica estándar de la serie Qwen2.5, aunque no se explicita en la model card). Su relevancia radica en ser un ejemplo de especialización vertical de bajo coste: un modelo pequeño, con licencia Apache 2.0 y entrenado con Unsloth y TRL, lo que abarata el ajuste fino y permite desplegarlo en hardware modesto.

No obstante, la información publicada por el autor es mínima: no se detallan los datos de entrenamiento, los hiperparámetros del GRPO, los benchmarks ni las capacidades específicas del dominio legal. Esta ficha refleja únicamente los datos verificables del repositorio y de la model card, marcando como "no disponible" todo aquello que el autor no ha hecho público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, atención causal) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la familia Qwen2.5 soporta 32.768 tokens de forma nativa |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización vía GPTQ, AWQ, GGUF y bitsandbytes por ser arquitectura Qwen2) |
| Idiomas soportados | en (inglés) según la model card; el ajuste legal está orientado a indonesio según el nombre del modelo, aunque no se declara oficialmente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo no emplea mezcla de expertos ni mecanismos híbridos; es un transformer denso de 1,5 mil millones de parámetros. El checkpoint publicado es el resultado de una cadena de dos ajustes: primero un SFT sobre el modelo base Qwen2.5-1.5B para el dominio legal en indonesio (tnromy/Qwen2.5-1.5B-Legal-ID-SFT) y, posteriormente, un entrenamiento con GRPO sobre ese checkpoint. El autor indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que sugiere el uso de LoRA/QLoRA y técnicas de optimización de memoria, aunque no se especifican los hiperparámetros, el tamaño del dataset, la composición de los datos ni si hubo una fase de recompensa basada en un modelo juez o en reglas heurísticas. Tampoco se detalla el número de tokens de entrenamiento ni la composición del corpus legal utilizado.

## Capacidades

- Generación de texto conversacional en inglés (idioma declarado en la model card).
- Ajuste específico para el dominio legal en indonesio, según el nombre del modelo y la cadena de checkpoints, aunque no se documentan las tareas concretas cubiertas.
- Entrenamiento con GRPO, lo que en principio mejora la alineación con preferencias respecto al checkpoint SFT previo, si bien no se aportan métricas que lo confirmen.
- Soporte de tool calling / function calling: no disponible (no se declara en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés declarado; el comportamiento en indonesio no está verificado oficialmente.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de consultas legales en indonesio: el modelo puede emplearse para responder preguntas frecuentes sobre normativa local, aprovechando el ajuste SFT y GRPO sobre corpus legal, aunque la ausencia de benchmarks exige validación previa en producción.
- Clasificación y resumen de documentos legales: con 1,5 mil millones de parámetros y contexto de hasta 32.768 tokens, puede procesar contratos o expedientes de longitud media para extraer cláusulas o generar resúmenes.
- Generación de borradores de correspondencia legal: redacción de cartas, notificaciones o memorandos en indonesio a partir de plantillas, con revisión humana obligatoria por el riesgo de alucinación.
- Despliegue en entornos con hardware limitado: al tratarse de un modelo de 1,5 B, cabe en GPUs de consumo con cuantización de 4 bits (aproximadamente 1 GB de VRAM), lo que permite prototipos locales sin infraestructura dedicada.
- Base para ajuste fino adicional: sirve como punto de partida para especializaciones legales más concretas (derecho laboral, fiscal, contractual) mediante LoRA, dado su tamaño reducido y licencia permisiva.
- Investigación en RLHF/GRPO: útil como caso de estudio reproducible de la cadena SFT → GRPO con Unsloth y TRL en un dominio vertical.
- Filtrado y extracción de información en pipelines documentales: integrable en flujos de procesamiento de PDFs legales para extraer entidades, fechas y obligaciones, con validación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, más overhead de KV cache; en la práctica, 4-6 GB según longitud de contexto.
- Cuantización de 8 bits: aproximadamente 1,6 GB de pesos; cuantización de 4 bits: aproximadamente 0,8-1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A10, L4); para cuantización de 4 bits basta con 4-6 GB (GTX 1660, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de modelos con 6 GB o más en cuantización de 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI (el tag text-generation-inference está presente), llama.cpp/Ollama mediante conversión a GGUF, y Unsloth para inferencia optimizada.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5 B, se espera un throughput alto en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| tnromy/Qwen2.5-1.5B-Legal-ID-GRPO | 1,54 B | 32.768 (heredado de Qwen2.5, no declarado) | Apache 2.0 | Ajuste legal en indonesio con SFT + GRPO; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | Modelo base oficial, con benchmarks publicados por Alibaba; multilingüe |
| Qwen2.5-1.5B (base) | 1,54 B | 32.768 | Apache 2.0 | Modelo preentrenado sin ajuste conversacional |
| tnromy/Qwen2.5-1.5B-Legal-ID-SFT | 1,54 B | 32.768 (heredado) | Apache 2.0 | Checkpoint intermedio del mismo autor, solo con SFT |

No se dispone de datos de rendimiento comparativo del modelo ajustado frente a sus alternativas, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste GRPO mejore al checkpoint SFT; el rendimiento real en tareas legales es desconocido.
- Riesgo elevado de alucinación en dominio legal: un modelo de 1,5 B ajustado con datos no documentados puede inventar normativa, artículos o jurisprudencia; se requiere revisión humana y verificación de fuentes.
- Idiomas: la model card declara únicamente inglés, aunque el ajuste parece orientado al indonesio; el comportamiento multilingüe no está verificado y el español no está soportado oficialmente.
- Sesgos: no se documentan los datos de entrenamiento ni los procesos de filtrado, por lo que no es posible evaluar sesgos de género, etnia o sesgos propios del corpus legal indonesio.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad legal del uso recae en el integrador.
- Contexto: aunque la familia Qwen2.5 soporta 32.768 tokens, el autor no confirma la ventana efectiva tras el ajuste; el rendimiento en contextos largos puede degradarse.
- Datos de entrenamiento no disponibles: imposible auditar la procedencia del corpus legal, lo que plantea dudas sobre derechos de autor y vigencia normativa.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tnromy/Qwen2.5-1.5B-Legal-ID-GRPO
- Checkpoint base (SFT): https://huggingface.co/tnromy/Qwen2.5-1.5B-Legal-ID-SFT
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Familia Qwen2.5 (modelo base): https://huggingface.co/Qwen/Qwen2.5-1.5B
