# sxiong/MLR_planner_Llama-8B-LoRA

## Resumen

MLR Planner es un adaptador LoRA de rango 32 sobre el checkpoint `sxiong/MLR_executor_Llama-8B`, que a su vez parte de la arquitectura Llama-3.1-8B. Lo desarrolla Siheng Xiong (junto con Ali Payani y Faramarz Fekri) como componente del sistema Multi-Level Reasoning (MLR) presentado en el paper *Enhancing Language Model Reasoning with Structured Multi-Level Modeling* (ICLR 2026). El adaptador implementa el rol de "planificador" dentro de un bucle alterno plan-ejecución: propone subobjetivos abstractos y estructurados que el modelo ejecutor después desarrolla en razonamiento detallado.

El modelo resuelve el problema del razonamiento de largo horizonte en LLMs, donde una única cadena de pensamiento monolítica degrada en tareas con muchas etapas. MLR descompone esa cadena en pasos de planificación y ejecución intercalados, lo que permite mantener coherencia estructural a lo largo de razonamientos extensos. El adaptador no está pensado para generación libre: requiere el checkpoint base concreto, los prompts adecuados, un parser específico y una regla de parada, todo ello orquestado por el código de inferencia del repositorio del autor.

Por su naturaleza de adaptador LoRA (0,4 GB de pesos), su relevancia es fundamentalmente de investigación: permite reproducir el sistema MLR sobre una base Llama-3.1-8B sin necesidad de reentrenar el modelo completo, y demuestra una estrategia de descomposición modular del razonamiento que puede transferirse a otros dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B) con adaptador LoRA |
| Parametros totales | 8B en el modelo base; adaptador LoRA de rango 32 (tamano de repo 0,4 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama-3.1-8B, no confirmada por el autor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango y alpha del LoRA | 32 / 64 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Checkpoint base requerido | sxiong/MLR_executor_Llama-8B |
| Dataset de entrenamiento | sxiong/MLR_sft_data |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Llama-3.1-8B. El LoRA cubre los siete módulos lineales habituales (atención completa y MLP), con rango 32 y alpha 64, lo que da una capacidad de adaptación relativamente amplia sobre el modelo base. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset `sxiong/MLR_sft_data` ni si hubo fases de RLHF o DPO; la información disponible solo indica que se trata de un ajuste supervisado (SFT) sobre el checkpoint ejecutor.

La innovación técnica no reside en el adaptador en sí, sino en el esquema MLR que implementa: el razonamiento se estructura como un bucle alterno entre un planificador (este adaptador) que emite subobjetivos abstractos y un ejecutor que produce el razonamiento detallado condicionado a cada subobjetivo. El control de flujo, los prompts, el parser de salida y la regla de parada viven en el código de inferencia del repositorio del autor, no en el adaptador. Esto implica que el adaptador solo es funcional dentro de ese pipeline; no se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de subobjetivos estructurados y abstractos dentro de un bucle de razonamiento plan-ejecución.
- Razonamiento de largo horizonte por descomposición en etapas, en colaboración con el modelo ejecutor.
- Generación de texto conversacional (pipeline declarado: text-generation, conversational).
- Integración con el flujo MLR completo mediante el código de inferencia del autor (prompts, parser, regla de parada).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes autónomos ni de multi-step reasoning fuera del esquema MLR.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación en razonamiento estructurado: reproducir el sistema MLR del paper ICLR 2026 sobre Llama-3.1-8B para estudiar la descomposición plan-ejecución en tareas de razonamiento de largo horizonte.
- Experimentos de ablación sobre planificación: comparar el rendimiento del bucle MLR frente a cadenas de pensamiento monolíticas usando el mismo ejecutor y distintos adaptadores de planificador.
- Base para ajuste fino de planificadores: el adaptador sirve como punto de partida (LoRA de rango 32 sobre Llama-3.1-8B) para entrenar planificadores en dominios específicos con datos SFT propios.
- Evaluación de pipelines modulares de razonamiento: integrar el planificador en el código del repositorio para medir latencia, número de pasos y calidad de los subobjetivos generados en tareas matemáticas o de lógica.
- Docencia y divulgación técnica: ilustrar cómo se separa la planificación de la ejecución en un LLM mediante dos adaptadores LoRA sobre un mismo checkpoint base.
- Prototipado de sistemas de resolución de problemas por etapas: usar el par planificador-ejecutor como esqueleto para construir pipelines de razonamiento multi-etapa en entornos controlados de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB, pero requiere cargar el checkpoint base `sxiong/MLR_executor_Llama-8B` (8B parámetros) para funcionar.
- VRAM estimada en bf16: en torno a 16 GB para los pesos del modelo base más overhead de activaciones y caché KV; no confirmado por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia cómoda en bf16; RTX 4090 (24 GB) viable en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 12-16 GB; no se documentan recetas de cuantización específicas para este adaptador.
- Despliegue: carga mediante `peft.PeftModel` y `transformers`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MLR Planner (este) | 8B (LoRA r32) | no disponible | Planificador de bucle plan-ejecución | no disponible | Hugging Face (0 descargas) |
| MLR Executor (`sxiong/MLR_executor_Llama-8B`) | 8B | no disponible | Ejecutor de razonamiento detallado | no disponible | Hugging Face |
| Llama-3.1-8B (base) | 8B | 128K (según Meta) | LLM generalista | Llama 3.1 Community License | Amplia |

La comparación con alternativas de razonamiento estructurado (por ejemplo, adaptadores de cadena de pensamiento o modelos de razonamiento dedicados) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no está diseñado para generación libre: requiere el checkpoint base `sxiong/MLR_executor_Llama-8B`, los prompts del autor, el parser y la regla de parada del código de inferencia MLR.
- Licencia no especificada: no se puede confirmar el uso comercial; además, hereda las restricciones de la licencia de Llama-3.1.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación inherente a un modelo de 8B; los subobjetivos del planificador pueden desviarse del problema original si el parser o la regla de parada no están bien configurados.
- Sesgos: no documentados por el autor; se heredan los del modelo base Llama-3.1-8B.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de mejora frente a alternativas.
- Repositorio con 0 descargas y 0 likes: ecosistema mínimo, sin validación comunitaria ni issues documentados.
- Sin soporte documentado para motores de inferencia de alto rendimiento (vLLM, TGI); el despliegue en producción requeriría trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/sxiong/MLR_planner_Llama-8B-LoRA
- Checkpoint base: https://huggingface.co/sxiong/MLR_executor_Llama-8B
- Dataset SFT: https://huggingface.co/datasets/sxiong/MLR_sft_data
- Código de inferencia MLR: https://github.com/xiongsiheng/MLR
- Paper (ICLR 2026): https://proceedings.iclr.cc/paper_files/paper/2026/file/3db7d123a316fc690f02818b21967af4-Paper-Conference.pdf
