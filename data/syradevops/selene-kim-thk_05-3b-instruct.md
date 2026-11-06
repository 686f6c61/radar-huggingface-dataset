# Syradevops/Selene-Kim-THk_05-3B-Instruct

## Resumen

Selene-Kim-THk_05-3B-Instruct es un modelo de lenguaje instructivo de 3.075 millones de parámetros desarrollado por Syradevops mediante fine-tuning sobre unsloth/SmolLM3-3B-Base. Se trata de un ajuste fino construido con la librería Unsloth y Hugging Face TRL, un flujo de trabajo habitual para adaptar modelos base pequeños a tareas conversacionales con un coste computacional reducido (el propio autor indica que el entrenamiento se aceleró 2x gracias a Unsloth).

El modelo hereda la arquitectura SmolLM3, una familia de LLM compactos orientados a ejecución en hardware de consumo, y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones relevantes. Su relevancia radica en la tendencia actual de modelos pequeños y eficientes (3B de parámetros) que pueden desplegarse localmente en GPUs de gama media o incluso en portátiles con cuantización.

La model card original es muy escueta y no documenta el dataset de entrenamiento, los hiperparámetros ni los resultados de evaluación, por lo que varias especificaciones de esta ficha se marcan como "no disponible". Esto debe tenerse en cuenta al evaluar el modelo para producción: la falta de documentación exige una validación empírica previa por parte del equipo adoptante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolLM3 (transformer decoder, variante no disponible) |
| Parámetros totales | 3.075.098.624 (~3.08B) |
| Parámetros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (SmolLM3 base soporta hasta 128K, pero el fine-tuning no lo documenta) |
| Tipos de cuantización | no disponible (solo pesos en bf16/fp16 en el repo) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y endpoints de inferencia) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/SmolLM3-3B-Base, un modelo base de la familia SmolLM3 de Hugging Face con aproximadamente 3 mil millones de parámetros en arquitectura transformer decoder. SmolLM3 incorpora mejoras recientes de eficiencia como soporte de contexto largo (hasta 128K tokens en la versión base, mediante técnicas como NoPE/attention con escalado) y entrenamiento con datos curados de alta calidad, aunque el fine-tuning de Syradevops no documenta qué modificaciones se aplicaron a estos aspectos.

El ajuste fino se realizó con Unsloth (framework de entrenamiento eficiente que reduce el consumo de memoria y acelera el entrenamiento mediante kernels optimizados y checkpointing) junto con la librería TRL de Hugging Face, que proporciona recetas de SFT, DPO y RLHF. No se especifica si el método usado fue SFT puro, DPO u otro, ni el dataset empleado, el número de tokens de entrenamiento o los hiperparámetros. Tampoco hay información sobre el tamaño del dataset ni su composición.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Ajuste fino instructivo sobre un modelo base, por lo que debería seguir instrucciones mejor que el modelo base.
- Capacidades heredadas de SmolLM3 base: razonamiento general, código y matemáticas en inglés (no verificadas para este fine-tuning en concreto).
- No hay evidencia documentada de soporte de tool calling / function calling.
- No hay evidencia documentada de capacidades de agentes o multi-step reasoning específicas del fine-tuning.
- Capacidades multilingües: limitadas; la model card declara únicamente inglés.
- No hay capacidades especiales documentadas (visión, audio, thinking mode): no disponible.

## Casos de uso

- Chatbots conversacionales en inglés ligeros: al ser un modelo de 3B con pesos safetensors compatibles con llama.cpp, puede servir como asistente conversacional de bajo coste en aplicaciones donde la latencia y el coste importan más que el rendimiento máximo.
- Prototipado rápido de agentes locales: su tamaño permite iterar prompts y pipelines de agentes en una GPU de consumo antes de escalar a modelos mayores.
- Asistente de escritura integrado en aplicaciones de escritorio: puede ejecutarse localmente para redacción y corrección de textos en inglés sin enviar datos a la nube.
- Clasificación y extracción de información de texto: tareas de NLP estructurado (resúmenes, extracción de entidades) donde un modelo de 3B suele ser suficiente.
- Generación de código asistida en entornos locales: heredando capacidades de código de SmolLM3, puede usarse para autocompletado y generación de fragmentos cortos, aunque sin garantías documentadas.
- Despliegue en edge o dispositivos con VRAM limitada: con cuantización a 4 bits (Q4_K_M en GGUF, si se convierte) ocuparía unos 2 GB, apto para GPUs de 4-6 GB o CPU.
- Base para fine-tunings adicionales: al ser un modelo pequeño y con licencia permisiva, es candidato para ajustes de dominio específicos por equipos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparativas con el modelo base. Para referencia, el modelo base unsloth/SmolLM3-3B-Base (derivado de HuggingFaceTB/SmolLM3-3B) sí cuenta con evaluaciones públicas, pero no pueden atribuirse directamente a este fine-tuning sin verificación propia.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): aproximadamente 6,2 GB de pesos, más overhead de KV cache; recomendable 8 GB de VRAM disponibles.
- Con cuantización a 4 bits (si se convierte a GGUF): alrededor de 2 GB, viable en GPUs de 4-6 GB o en CPU.
- GPUs recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o superiores para fp16; cualquier GPU moderna de 4 GB para versiones cuantizadas. No se necesitan A100 ni H100 para inferencia.
- Cabe cómodamente en GPUs de consumo: RTX 3060, RTX 4070 y superiores en fp16; incluso en portátiles con GPU dedicada de gama media.
- Opciones de despliegue: transformers (nativo, tag endpoints_compatible), vLLM, TGI, Ollama y llama.cpp (este último requiere conversión previa a GGUF, que no está publicada en el repo).
- Latencia y throughput: no disponible; al ser un modelo de 3B, se esperan velocidades de decodificación altas (decenas de tokens/segundo en GPUs de consumo), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Selene-Kim-THk_05-3B-Instruct | 3,08B | no disponible | Apache 2.0 | Fine-tuning comunitario de SmolLM3-3B, sin benchmarks publicados |
| HuggingFaceTB/SmolLM3-3B (base/instruct) | 3,08B | 128K | Apache 2.0 | Modelo original de Hugging Face, con doble modo (razonamiento/no razonamiento) y benchmarks publicados |
| Qwen3-4B-Instruct | 4B | 32K-128K | Apache 2.0 | Multilingüe, tool calling nativo, benchmarks públicos amplios |
| Llama 3.2 3B Instruct | 3,21B | 128K | Licencia Llama 3.2 (restricciones de uso) | Multilingüe (8 idiomas), tool calling, ecosistema muy maduro |

Frente a estas alternativas, Selene-Kim-THk_05-3B-Instruct carece de documentación y evaluaciones, por lo que salvo necesidad concreta del fine-tuning específico, el modelo base SmolLM3-3B o alternativas como Qwen3-4B suelen ser opciones mejor documentadas.

## Limitaciones y advertencias

- Falta total de documentación del entrenamiento: no se conocen el dataset, los hiperparámetros ni el método (SFT/DPO), lo que impide auditar sesgos o calidad de datos.
- Riesgo de alucinación no evaluado: sin benchmarks publicados, no se puede cuantificar la fiabilidad; se recomienda evaluación propia antes de producción.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de SmolLM3 y añade los del dataset de fine-tuning (desconocido); no disponible análisis de sesgos.
- Idioma: declarado solo para inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Contexto: la longitud de contexto efectiva del fine-tuning no está documentada; no asumir los 128K del modelo base sin verificarlo.
- Licencia: Apache 2.0, sin restricciones de uso comercial relevantes; sí exige conservar avisos de licencia y la nota de cambios.
- Procedencia comunitaria: modelo subido por un autor individual con 527 descargas y sin trazabilidad de proceso, un riesgo adicional frente a modelos publicados por organizaciones con prácticas documentadas.
- No hay conversión GGUF publicada, lo que limita el despliegue inmediato en llama.cpp/Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Syradevops/Selene-Kim-THk_05-3B-Instruct
- Modelo base: https://huggingface.co/unsloth/SmolLM3-3B-Base
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- Familia SmolLM3 (Hugging Face): https://huggingface.co/HuggingFaceTB
- TRL (Hugging Face): https://github.com/huggingface/trl

No se han encontrado enlaces adicionales (paper, blog o demo) en la información disponible.
