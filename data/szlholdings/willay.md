# SZLHOLDINGS/WILLAY

## Resumen

WILLAY es un modelo de generación de texto publicado por SZLHOLDINGS dentro de su catálogo de artefactos de IA gobernada ("governed-AI estate"). Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-0.5B-Instruct, distribuido en formato safetensors y con licencia Apache 2.0. El repositorio ocupa 2,0 GB y acumula 338 descargas y 1 like en el momento de la consulta.

Con 494.032.768 parámetros totales, el modelo se sitúa en la gama ultracompacta de la familia Qwen2.5. La librería declarada es PEFT, lo que indica que el artefacto publicado probablemente incorpora pesos derivados de un entrenamiento con adaptadores (LoRA u otra técnica de ajuste eficiente), aunque la model card no detalla la configuración exacta ni el proceso de fusión de pesos.

La relevancia de WILLAY es limitada y muy específica: no compite en capacidades generales con modelos de su categoría, sino que se presenta como un artefacto trazable dentro de una infraestructura de auditoría ("receipts", snapshots fechados, SVG deterministas). Su interés principal es el de un caso de estudio sobre gobernanza y reproducibilidad de artefactos, más que el de un modelo de propósito general para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2; familia Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tamano del repositorio | 2,0 GB |
| Pipeline | text-generation |
| Descargas / likes | 338 / 1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm, embeddings RoPE y capas MLP con activación SwiGLU. No se trata de un modelo MoE ni de una arquitectura híbrida SSM. El tamaño de 494 millones de parámetros coincide con el del checkpoint base, lo que sugiere que el ajuste no alteró la topología de la red.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO o preferencia. La model card declara explícitamente que cualquier afirmación de entrenamiento o evaluación reside en ficheros de "receipts" del ecosistema del autor, y que lo no documentado allí se etiqueta como UNKNOWN. La librería PEFT indica uso de adaptadores, pero se desconoce si los pesos publicados son adaptadores sin fusionar o el modelo completo tras la fusión.

## Capacidades

- Generación de texto conversacional e instructiva heredada del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones de complejidad baja; el tamaño de 0,5B limita el razonamiento multi-paso.
- Generación de código y matemáticas elementales, con fiabilidad limitada por la escala del modelo.
- Soporte de tool calling y function calling: no confirmado para este artefacto concreto; el modelo base lo soporta de forma parcial.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; el tamaño del modelo hace poco realista un uso agéntico fiable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking", visión o audio: no disponibles; es un modelo exclusivamente de texto.
- Trazabilidad de artefacto: la model card incorpora gráficos SVG deterministas generados a partir de un snapshot de auditoría fechado (2026-11-20T03:48:04Z).

## Casos de uso

- Clasificación y etiquetado de texto a pequeña escala: el modelo cabe en CPU o en GPU de gama baja y puede procesar lotes de textos cortos para tareas de categorización, con la ventaja de un coste de inferencia mínimo.
- Prototipado rápido de asistentes conversacionales: sirve para validar flujos de diálogo multi-turno en entornos de desarrollo antes de migrar a un modelo mayor, gracias a su reducido requisito de memoria.
- Generación de respuestas en entornos con recursos restringidos: despliegue en dispositivos edge o contenedores sin GPU dedicada, donde un modelo de 0,5B es viable en cuantización de 8 o 4 bits.
- Filtrado y preprocesado en pipelines de datos: resumen extractivo o reformateo de registros antes de pasarlos a un modelo de mayor tamaño, actuando como etapa barata de normalización.
- Evaluación de infraestructura de gobernanza: caso de prueba para verificar flujos de auditoría, versionado de artefactos y reproducción de snapshots dentro del ecosistema SZLHOLDINGS.
- Educación y experimentación con PEFT: al estar publicado con la librería peft y un modelo base conocido, resulta útil para estudiar cómo se empaquetan y distribuyen adaptadores sobre Qwen2.5.
- Generación de texto auxiliar en aplicaciones de bajo riesgo: borradores, plantillas o variaciones de copy donde los errores se revisan manualmente y no hay consecuencias críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo medido en una auditoría fechada, y que los datos no presentes se etiquetan como UNKNOWN. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de comparativas medidas para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB solo para pesos (494M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 1,5-2 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 0,5-0,7 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,3-0,4 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ninguna restricción. También es viable en CPU.
- Cabe holgadamente en GPU consumer, incluidos portátiles con 4-6 GB de VRAM, e incluso en placas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers con PEFT para cargar el artefacto tal cual; vLLM y TGI para servir en GPU; llama.cpp u Ollama requerirían conversión previa a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. Por escala, se espera un throughput alto en GPU (cientos de tokens por segundo en lotes), pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/WILLAY | 494M | no disponible | Apache 2.0 | Hugging Face, safetensors + PEFT | Ajuste de Qwen2.5-0.5B-Instruct con énfasis en trazabilidad |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF | Modelo base; documentación completa y benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF | Misma familia, mayor capacidad a costa de más VRAM |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, safetensors y GGUF | Contexto mucho mayor; licencia con restricciones de uso |

La comparación directa más pertinente es con el propio modelo base: WILLAY no documenta mejoras medibles sobre Qwen2.5-0.5B-Instruct, por lo que la elección entre ambos depende de si se necesita el empaquetado PEFT y la infraestructura de auditoría del autor, o bien la documentación y el soporte de cuantizaciones del modelo original.

## Limitaciones y advertencias

- Ausencia total de benchmarks medidos: no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni proceso de alineación.
- Idiomas no declarados: no se puede confirmar el soporte multilingüe ni el rendimiento por idioma.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no se garantiza que el ajuste conserve esa ventana.
- Riesgo de alucinación elevado por escala: con 0,5B de parámetros, la fiabilidad factual es baja y no es apto para tareas de alta precisión sin verificación humana.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, que se desconoce.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del artefacto y sobre posibles obligaciones derivadas del modelo base.
- Trazabilidad incompleta para terceros: las "receipts" referenciadas viven en el ecosistema del autor y no se incluyen en el repositorio de Hugging Face, lo que impide verificar de forma independiente las afirmaciones de la model card.
- Popularidad muy baja (1 like, 338 descargas): no hay comunidad ni informes de terceros que validen su comportamiento en producción.
- No se distribuyen cuantizaciones GGUF ni versiones optimizadas, lo que añade trabajo si se quiere desplegar con llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/WILLAY
- Organización del autor: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de la herramienta de generación de tarjetas: https://github.com/szl-holdings/estate-cards
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
