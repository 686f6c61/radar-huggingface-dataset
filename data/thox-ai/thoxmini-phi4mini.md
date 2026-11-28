# Thox-ai/ThoxMini-Phi4Mini

## Resumen

ThoxMini-Phi4Mini es un ajuste fino (fine-tuning) del modelo Microsoft Phi-4-mini-instruct, desarrollado por THOX.ai (cuenta Thox-ai en Hugging Face). Se trata de un modelo de 3.836 millones de parámetros (3,8B) orientado a generación de texto y conversación, construido mediante un adaptador LoRA de rango 32 entrenado sobre el corpus de factualidad propietario "THOX Wave B" y posteriormente fusionado con los pesos base en bf16. El objetivo declarado es que el modelo responda preguntas sobre productos y empresa de THOX a partir de hechos canónicos, rechace aquello que la compañía no ha publicado y se detenga en lugar de fabricar información.

El modelo se posiciona como el asistente insignia de la línea ThoxMini y como payload de host para ThoxKey/ThoxBeam (arquitectura de malla donde el dispositivo ThoxKey no ejecuta el modelo en local, sino que lo sirve el host). Se distribuye con pesos safetensors fusionados, cuantizaciones GGUF Q4_K_M y Q8_0, y un Modelfile para Ollama. La licencia es MIT y el acceso es público y sin gating.

Es relevante ahora porque ejemplifica la tendencia de ajustes finos ligeros sobre modelos pequeños de alta calidad (Phi-4-mini) para despliegue en el borde (edge-ai) y en local-first, con un enfoque de "grounding" factual sobre un dominio concreto. No obstante, el propio autor indica que el estado es "BASELINE ESTABLISHED — NOT PROMOTED": la sonda insignia de 6 prompts solo pasa 3/6, por lo que el modelo no está promocionado como versión final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Microsoft Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.760 (3,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (pesos fusionados), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (2 shards), GGUF (Q4_K_M, Q8_0), Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Phi-4-mini-instruct, un transformer decoder-only de 3,8B parámetros. Sobre esta base, THOX entrenó un adaptador LoRA de rango 32 (r32) sobre el dataset propietario Thox-ai/thox-factory-sft-v5, correspondiente al corpus de factualidad "THOX Wave B". Posteriormente, el adaptador se fusionó con los pesos base en bf16 en el repositorio de origen Thox-ai/ThoxMini-Phi4Mini-Merged, que se conserva como registro de construcción. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente se indica que es un ajuste SFT (supervised fine-tuning).

La innovación técnica destacable no reside en la arquitectura (que es la de Phi-4-mini, sin modificaciones estructurales), sino en el enfoque de despliegue: la configuración desplegada incluye el adaptador fusionado junto con un system prompt de "device facts" (hechos del dispositivo) para el grounding, y nunca se usa el modelo "en crudo". Se distribuye además un Modelfile de Ollama con la definición del modelo en su configuración desplegada. No se documentan en la información disponible técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Respuesta a preguntas sobre productos y empresa de THOX a partir de hechos canónicos (grounding factual sobre el corpus Wave B).
- Rechazo controlado: el modelo está ajustado para declinar preguntas sobre información no publicada por THOX y detenerse en lugar de generar fabricaciones.
- Routing de herramientas (tool routing): el autor menciona que Phi-4-mini ganó la evaluación de THOX y el retest "thinking-off" del 28-10-2026 en finalización de tareas y enrutamiento de herramientas.
- Capacidades heredadas de Phi-4-mini-instruct: razonamiento, código y matemáticas (no se detallan métricas en la información disponible).
- Capacidades multilingües: limitadas al inglés según la model card (language: en); no se declaran otros idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información proporcionada.

## Casos de uso

- Asistente de atención al cliente sobre productos THOX: el modelo responde consultas de usuarios utilizando los hechos canónicos del corpus Wave B y declina educadamente cuando la información no está publicada, lo que reduce el riesgo de respuestas incorrectas en un contexto comercial.
- Despliegue en el borde y local-first: con cuantización Q4_K_M (2,49 GB) el modelo cabe en hardware de consumo, lo que permite ejecutarlo en estaciones de trabajo o dispositivos con GPU modesta mediante Ollama o llama.cpp, sin depender de la nube.
- Payload de host en arquitectura de malla ThoxKey/ThoxBeam: el host ejecuta este modelo y sirve las respuestas a los dispositivos ThoxKey, que no ejecutan el modelo en local; es adecuado por su tamaño contenido y su configuración de despliegue ya empaquetada (Modelfile).
- Enrutamiento de herramientas en pipelines de agentes: gracias a las capacidades de tool routing heredadas y evaluadas de Phi-4-mini, puede integrarse como planificador de llamadas a funciones en flujos multi-paso.
- Base para ajustes finos de dominio: al ser un modelo pequeño con licencia MIT y pesos fusionados en safetensors, sirve como punto de partida para equipos que quieran replicar el enfoque LoRA + merge sobre su propio corpus factual.
- Prototipado rápido de asistentes conversacionales en inglés: con 1.864 descargas y artefactos GGUF listos, permite validar un asistente en local en minutos usando Ollama, sin infraestructura adicional.
- Evaluación de técnicas de grounding y rechazo: útil como caso de estudio para investigadores que analicen cómo un ajuste SFT ligero modifica el comportamiento de abstención de un modelo base.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| GATE49 (conjunto de desarrollo, 49 preguntas) | 47/49 | Empata con el mejor de la flota; estado "baseline established" |
| Sonda insignia (flagship probe, 6 prompts) | 3/6 | Por debajo del umbral de promocion (se requiere 6/6) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación son los informes internos thox_gate49.json y thox_flagship_probe.json incluidos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con cuantización Q4_K_M; en torno a 4-5 GB con Q8_0; en torno a 8 GB en bf16 (pesos de ~7,7 GB más overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para Q4_K_M basta con GPUs de 4 GB o incluso CPU.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 4 GB o más para cuantizaciones GGUF; en bf16 requiere 8 GB o más.
- Opciones de despliegue: Ollama (se incluye Modelfile), llama.cpp (GGUF), transformers con safetensors, text-generation-inference (el repo declara endpoints_compatible). vLLM no se menciona explícitamente en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxMini-Phi4Mini | 3,8B | No disponible | MIT | Publico, sin gating | Ajuste SFT de dominio sobre Phi-4-mini |
| microsoft/Phi-4-mini-instruct | 3,8B | No disponible en esta ficha | MIT | Publico | Modelo base; sin grounding de dominio THOX |
| Thox-ai/ThoxNano-135M (tier) | 135M | No disponible | No disponible | No disponible | Modelo de rol en dispositivo de ThoxKey; no sustituido por este build |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad; no se pueden comparar rendimientos sin cifras publicadas.

## Limitaciones y advertencias

- Estado no promocionado: el autor declara explícitamente "BASELINE ESTABLISHED — NOT PROMOTED"; la sonda insignia de 6 prompts solo pasa 3/6, por lo que no debe considerarse una versión final para producción.
- Riesgo de alucinación: aunque el ajuste busca la abstención ante información no publicada, el modelo base puede seguir generando contenido plausible pero incorrecto, especialmente fuera del dominio THOX.
- Idioma: soporte declarado únicamente en inglés; su uso en castellano u otros idiomas no está garantizado y puede degradar la calidad.
- Contexto: no se documenta la longitud de contexto efectiva en la información disponible; no debe asumirse la del modelo base sin verificación.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; al heredar el modelo base, puede reproducir sesgos presentes en los datos de Phi-4-mini y en el corpus SFT.
- Licencia: MIT permite uso comercial, pero el modelo base Microsoft Phi-4-mini-instruct puede tener sus propios términos que el usuario debe verificar; la model card indica que las limitaciones son "términos de licencia upstream o la ley".
- Idoneidad: orientado a edge-ai y local-first; no está pensado para cargas de alta concurrencia ni para tareas de razonamiento complejo de gran contexto.
- Documentación: faltan datos de entrenamiento (tokens, composición del dataset, técnicas de alineación) que impiden una evaluación rigurosa de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMini-Phi4Mini
- Repositorio de pesos fusionados (registro de construcción): https://huggingface.co/Thox-ai/ThoxMini-Phi4Mini-Merged
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
