# Thox-ai/ThoxMini-Phi4Mini

## Resumen

ThoxMini-Phi4Mini es un ajuste fino (fine-tuning) del modelo Microsoft Phi-4-mini-instruct, desarrollado por Thox-ai (THOX.ai). Se trata de un modelo de generación de texto de aproximadamente 3.840 millones de parámetros, orientado a edge AI y despliegue local-first. THOX entrenó un adaptador LoRA de rango 32 sobre el corpus de factualidad "Wave B" de la compañía y fusionó los pesos en-house, de modo que el modelo responde preguntas sobre productos y empresa a partir de hechos canónicos y declina responder cuando la información no ha sido publicada.

El modelo se presenta como el "flagship assistant" de la línea ThoxMini y como payload anfitrión para ThoxKey/ThoxBeam. La arquitectura subyacente es la de Phi-4-mini-instruct (transformer denso de la familia Phi-3/Phi-4), con licencia MIT y pesos disponibles en safetensors (bf16 fusionado) y GGUF (Q4_K_M y Q8_0). El idioma declarado es únicamente inglés.

Es relevante por su enfoque en control de alucinaciones mediante ajuste sobre un corpus factual propietario, su licencia permisiva (MIT) y su distribución lista para Ollama y despliegue en hardware modesto. No obstante, el propio autor indica que el estado del artefacto es "baseline establecido, no promocionado": la sonda flagship de 6 preguntas solo pasa 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: microsoft/Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.760 (~3,8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (2 shards, bf16 fusionado) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Microsoft Phi-4-mini-instruct, un transformer denso de la familia Phi. THOX aplicó un ajuste fino supervisado (SFT) mediante un adaptador LoRA de rango 32 sobre el dataset propietario `Thox-ai/thox-factory-sft-v5`, correspondiente al corpus de factualidad "Wave B" de la compañía. Posteriormente fusionó el adaptador con los pesos base en-house, generando el build de pesos completos que se publica en este repositorio (el repositorio fuente de pesos fusionados, `Thox-ai/ThoxMini-Phi4Mini-Merged`, se conserva como registro de build).

El objetivo del ajuste es que el modelo responda preguntas sobre productos y empresa de THOX a partir de hechos canónicos, decline lo que la compañía no ha publicado y se detenga en lugar de divagar hacia la fabricación. La configuración desplegada incluye, además del adaptador fusionado, un system prompt de hechos de dispositivo ("grounded device-facts system prompt"), y el autor indica que el modelo nunca se despliega "en crudo". No se especifica en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, orientada a asistencia de producto.
- Respuesta a preguntas factuales sobre productos y empresa de THOX a partir de un corpus canónico.
- Declinación controlada: el modelo está ajustado para rechazar responder sobre información no publicada.
- Razonamiento multi-turno y conversacional (heredado de Phi-4-mini-instruct).
- Enrutamiento de herramientas (tool routing): el autor menciona que Phi-4-mini ganó la evaluación de THOX en "task completion and tool routing".
- Capacidad de ejecución en edge y local-first, con variantes GGUF para Ollama.
- No se documentan capacidades de visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Asistente de atención al cliente sobre catálogo propio: el ajuste sobre un corpus factual cerrado permite responder consultas de producto sin inventar especificaciones, declinando lo no publicado. Adecuado para soporte de primer nivel con control de alucinación.
- Base para agentes locales en dispositivos de borde: al ser un modelo de ~3,8B con GGUF Q4_K_M de ~2,5 GB, puede ejecutarse en hardware de consumo y servir como motor conversacional en despliegues local-first.
- Enrutamiento de herramientas en flujos agenticos: el autor reporta que el modelo base ganó la evaluación interna de tool routing, por lo que puede emplearse para decidir qué función invocar en pipelines de automatización.
- Payload anfitrión en arquitecturas mesh: en el esquema ThoxKey/ThoxBeam, el host ejecuta este modelo y sirve al dispositivo cliente, lo que permite centralizar la inferencia en un equipo con más recursos.
- Sustituto de Phi-4-mini-instruct en aplicaciones que requieran respuestas ancladas a un dominio factual concreto, manteniendo la licencia MIT para uso comercial.
- Prototipado rápido con Ollama: los GGUF Q4_K_M y Q8_0 y el Modelfile incluido permiten levantar el modelo con un único comando para pruebas de integración.

## Benchmarks y rendimiento

El autor publica resultados de su evaluación interna, no de benchmarks estándar de la comunidad:

| Evaluacion | Resultado |
|---|---|
| GATE49 (conjunto de desarrollo, 49 preguntas) | 47/49 (empata con el mejor de la flota) |
| Sonda flagship (6 prompts) | 3/6 (no supera la promocion) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 8 GB para los pesos (3,8B parámetros a 2 bytes), más overhead de contexto y KV cache.
- VRAM estimada en Q8_0: aproximadamente 4,1 GB para los pesos (tamaño del archivo GGUF: 4.084.611.264 B).
- VRAM estimada en Q4_K_M: aproximadamente 2,5 GB para los pesos (tamaño del archivo GGUF: 2.493.840.576 B).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe con holgura en RTX 4090, RTX 3090 y GPUs de 8-16 GB; en Q4_K_M puede ejecutarse incluso en GPUs de 4-6 GB o en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones publicadas, especialmente en Q4_K_M.
- Opciones de despliegue: Ollama (soporte explícito con Modelfile incluido), llama.cpp (formato GGUF), transformers (safetensors), y por el tag `text-generation-inference` se infiere compatibilidad con TGI; vLLM no se menciona explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxMini-Phi4Mini | ~3,8B | no disponible | MIT | Hugging Face, GGUF, Ollama | Ajuste factual propietario; estado baseline no promocionado |
| microsoft/Phi-4-mini-instruct | ~3,8B | no disponible | MIT | Hugging Face | Modelo base; capacidades generales sin anclaje factual de THOX |
| Modelos de ~3-4B de la familia Llama/Qwen | no disponible | no disponible | variable | Hugging Face | Alternativas de tamano similar; datos no verificados en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Estado del artefacto: el autor declara explícitamente "BASELINE ESTABLISHED — NOT PROMOTED"; la sonda flagship solo pasa 3 de 6 prompts, por lo que no debe tratarse como un modelo promocionado ni validado para producción crítica.
- Idioma: solo inglés declarado; no hay soporte multilingüe documentado.
- Especialización estrecha: el ajuste está orientado a hechos de producto y empresa de THOX; fuera de ese dominio, su comportamiento puede degradarse respecto al modelo base.
- Riesgo de alucinación: aunque el ajuste busca reducirla mediante declinación, persiste el riesgo inherente a los modelos generativos; el autor recomienda desplegarlo siempre con el system prompt de hechos de dispositivo, nunca "en crudo".
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Longitud de contexto: no especificada; conviene verificar la configuración de `config.json` antes de usarlo en tareas de contexto largo.
- Licencia MIT: permisiva para uso comercial, pero el modelo base es de Microsoft y el corpus de ajuste es propietario de THOX; conviene revisar los términos del dataset `thox-factory-sft-v5` si se redistribuye.
- Documentación con contenido promocional y notas de fundador que no aportan datos técnicos verificables; los benchmarks publicados son internos y no reproducibles de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMini-Phi4Mini
- Repositorio de pesos fusionados: https://huggingface.co/Thox-ai/ThoxMini-Phi4Mini-Merged
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Dataset de ajuste: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
