# Yethu-2/Qwen2.5-7B-Morrisons-Law-GGUF

## Resumen

Yethu-2/Qwen2.5-7B-Morrisons-Law-GGUF es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario Yethu-2 en Hugging Face. El nombre sugiere una especialización en el dominio legal de Morrisons (cadena de supermercados británica), aunque la model card no documenta el corpus de entrenamiento ni el proceso de ajuste más allá de indicar que se usó Unsloth con la librería TRL de Hugging Face.

El modelo parte de la arquitectura Qwen2 de Alibaba, un transformer decoder-only de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), con licencia Apache 2.0. El repositorio incluye pesos en formato GGUF (según el sufijo del identificador) y safetensors, con un tamaño total de 15,2 GB. Está etiquetado únicamente para inglés.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica del ajuste. Resulta útil como ejemplo de fine-tuning ligero con Unsloth sobre Qwen2.5, pero no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | GGUF (el identificador del repo lo indica); niveles concretos no disponibles |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen2, un transformer decoder-only con atención causal estándar, propio de la familia Qwen2.5 de Alibaba. El modelo base declarado es unsloth/Qwen2.5-7B-Instruct-bnb-4bit, es decir, una versión del instructivo de Qwen2.5 cuantizada a 4 bits con bitsandbytes y distribuida por Unsloth para facilitar el ajuste eficiente en memoria.

El autor indica que el entrenamiento se realizó con Unsloth y TRL, lo que implica un ajuste fino supervisado (SFT) con optimizaciones de memoria y velocidad. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior, la técnica de ajuste (LoRA/QLoRA) ni hiperparámetros. Tampoco se especifica si se preservó la ventana de contexto original de 32.768 tokens del modelo base ni si se aplicó alguna modificación arquitectónica.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente orientados al dominio legal de Morrisons por el ajuste fino, aunque no se documenta formalmente.
- Generación de código y matemáticas: capacidades del modelo base, no verificadas tras el ajuste.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Consultas sobre normativa y procedimientos internos de Morrisons: el ajuste parece orientado a este dominio, por lo que podría emplearse como asistente interno para responder dudas sobre políticas de la empresa, siempre que se valide la calidad de las respuestas con un conjunto de evaluación propio.
- Prototipado de asistentes legales especializados: útil como punto de partida para experimentar con fine-tuning sobre Qwen2.5 en dominios regulados, dado su tamaño manejable y licencia permisiva.
- Despliegue en local con llama.cpp u Ollama: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta, lo que facilita pruebas internas de concepto.
- Generación de borradores de documentación contractual: con revisión humana obligatoria, el modelo puede redactar primeros borradores de cláusulas o resúmenes de contratos en inglés.
- Extracción y resumen de información de documentos legales: aprovechando la ventana de contexto del modelo base (si se conserva), podría procesar contratos o expedientes de longitud media.
- Base para experimentos de investigación en ajuste eficiente: sirve como referencia de cómo Unsloth permite adaptar Qwen2.5-7B con recursos limitados, útil en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 15-16 GB para los 7,6 mil millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización GGUF de 4 bits (Q4_K_M): aproximadamente 4,5-5,5 GB; en Q8_0, en torno a 8-9 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para FP16; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 con margen; RTX 4060 Ti 16 GB o RTX 4070 para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumidor: sí, en RTX 3060 12 GB o superiores usando GGUF de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con pesos safetensors), TGI, transformers.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yethu-2/Qwen2.5-7B-Morrisons-Law-GGUF | 7,6 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 tokens | Llama 3.1 Community License | Hugging Face (con restricciones) |

El modelo de Yethu-2 no aporta métricas propias que permitan compararlo en rendimiento con las alternativas; su única diferencia documentada es el ajuste fino sobre Qwen2.5-7B-Instruct, del que no se detalla el corpus ni el beneficio medido. Frente a Mistral-7B-Instruct y Llama-3.1-8B-Instruct, la ventaja de este ajuste sería la especialización de dominio, no verificada, mientras que las alternativas ofrecen documentación completa, benchmarks públicos y mayor adopción.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación del dataset de entrenamiento: no es posible evaluar la calidad ni la fiabilidad del ajuste.
- Riesgo elevado de alucinación en materia legal: el modelo no sustituye asesoramiento jurídico profesional y sus respuestas deben validarse siempre.
- Sesgos desconocidos: al no documentarse la composición del corpus, se desconoce qué sesgos podría haber introducido el ajuste.
- Limitación idiomática: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Ventana de contexto no confirmada: no se especifica si se mantienen los 32.768 tokens del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las condiciones del modelo base Qwen2.5 y de Unsloth.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni retroalimentación de la comunidad.
- El nombre del repositorio sugiere un uso vinculado a Morrisons; verificar que el uso previsto no infrinja derechos de marca o confidencialidad de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yethu-2/Qwen2.5-7B-Morrisons-Law-GGUF
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo Qwen2.5-7B-Instruct (referencia de la familia): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
