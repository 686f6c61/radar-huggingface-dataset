# Thox-ai/ThoxMini-Phi4Mini

## Resumen

ThoxMini-Phi4Mini es un ajuste fino (fine-tuning) del modelo Phi-4-mini-instruct de Microsoft, desarrollado por Thox-ai (THOX.ai) como asistente conversacional de referencia para su linea de dispositivos locales ThoxMini y como carga util (payload) del host en su ecosistema ThoxKey/ThoxBeam. El modelo parte de la arquitectura transformer densa de Phi-4-mini y se ha especializado mediante un adaptador LoRA (r32) entrenado sobre el corpus de factualidad "THOX Wave B", posteriormente fusionado en los pesos completos (merged weights) en bf16. El objetivo declarado es que el modelo responda preguntas sobre productos y empresa de THOX a partir de hechos canonicos, rechace responder cuando no hay informacion publicada y evite la fabricacion de datos.

El modelo tiene 3.836.021.760 parametros (aproximadamente 3,8B) y se distribuye en formato safetensors (dos shards, ~7,7 GB en bf16) y en cuantizaciones GGUF Q4_K_M (~2,5 GB) y Q8_0 (~4,1 GB), ademas de un Modelfile para Ollama. La licencia es MIT y el unico idioma declarado es el ingles. Su relevancia actual radica en el enfoque "local-first" y "edge-ai": un modelo de ~3,8B pensado para ejecutarse en hardware de consumo o en dispositivos dedicados, con pesos abiertos y acceso publico sin gating.

El autor es explicito sobre el estado del modelo: "BASELINE ESTABLISHED — NOT PROMOTED". Supera una bateria de 49 preguntas (GATE49) con 47/49 aciertos, empatando con el mejor resultado de su flota, pero falla una prueba adicional de 6 prompts (flagship probe) con 3/6, por lo que no se considera promocionado a produccion general. Esta ficha recoge esa advertencia de forma literal, ya que condiciona su uso en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-4-mini-instruct de Microsoft), ajuste fino LoRA r32 fusionado |
| Parametros totales | 3.836.021.760 (~3,8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Phi-4-mini-instruct; no confirmada en la model card) |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (2 shards), GGUF (Q4_K_M, Q8_0), Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de microsoft/Phi-4-mini-instruct. Sobre esa base, THOX entreno un adaptador LoRA con rango 32 (r32) utilizando el dataset propietario "Thox-ai/thox-factory-sft-v5", descrito como corpus de factualidad "THOX Wave B". Posteriormente, el adaptador se fusiono en los pesos completos en bf16 (merged weights) y se publico como build independiente; el repositorio de origen del merge (Thox-ai/ThoxMini-Phi4Mini-Merged) se conserva como registro de construccion. El entrenamiento es de tipo SFT (supervised fine-tuning), segun las etiquetas del repositorio; no se menciona RLHF ni DPO en la informacion disponible.

La innovacion tecnica declarada no es arquitectonica sino de comportamiento: el modelo se disena para "responder desde hechos canonicos, declinar lo no publicado y detenerse en lugar de divagar hacia la fabricacion". La configuracion desplegada incluye un system prompt de hechos de dispositivo (grounded device-facts system prompt) y se distribuye junto a un Modelfile de Ollama que refleja esa configuracion. No se especifican en la model card el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo tecnicas como decodificacion especulativa o atencion lineal. El autor indica que Phi-4-mini gano una reevaluacion interna del 2026-10-28 (thinking-off) en completado de tareas y enrutamiento de herramientas frente a otras alternativas.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a asistencia multi-turno.
- Respuesta factual sobre productos y empresa de THOX a partir de un corpus canonico, con rechazo explicito de lo no publicado.
- Enrutamiento de herramientas (tool routing): el autor menciona que el modelo gano la reevaluacion en esta tarea, lo que sugiere soporte de function calling en la configuracion desplegada.
- Comportamiento de "detencion" ante incertidumbre, disenado para reducir la fabricacion de datos.
- Capacidades heredadas de Phi-4-mini-instruct (razonamiento, matematicas, codigo) presentes en la base, aunque no se documentan especificamente para este ajuste.
- Soporte de despliegue local: GGUF para llama.cpp/Ollama y safetensors para transformers.
- No se documentan capacidades de vision, audio ni modo "thinking" en la informacion proporcionada.

## Casos de uso

- Asistencia al cliente sobre productos THOX: el modelo esta entrenado para responder con hechos canonicos sobre la linea ThoxMini y declinar lo no publicado, lo que lo hace adecuado para un bot de soporte de primer nivel donde la precision factual importa mas que la creatividad.
- Despliegue en dispositivos edge y hardware de consumo: con ~3,8B parametros y una cuantizacion Q4_K_M de ~2,5 GB, puede ejecutarse en equipos con recursos limitados o en la propia caja ThoxMini, manteniendo los datos en la red local.
- Asistente local "local-first" en LAN: el ecosistema ThoxBeam sirve el modelo al dispositivo ThoxKey sin que este ejecute el modelo en local, lo que permite un asistente privado que funciona offline tras el emparejamiento.
- Enrutamiento de herramientas en pipelines de agentes: el autor reporta buen rendimiento en tool routing, por lo que puede usarse como capa de seleccion de herramientas en un agente multi-paso de dominio acotado.
- Prototipado rapido con Ollama: el repositorio incluye un Modelfile con la configuracion desplegada, lo que permite levantar el modelo con `ollama run` y evaluar su comportamiento conversacional sin infraestructura adicional.
- Base para ajustes de dominio en ingles: al ser un modelo MIT de ~3,8B con pesos abiertos y safetensors, sirve como punto de partida para fine-tunings verticales (soporte, documentacion interna) en entornos con presupuesto de GPU limitado.
- Experimentacion academica con modelos pequenos: util para estudiar el efecto de SFT y merging de LoRA en la factualidad y la tasa de rechazo de un modelo de ~3,8B.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son internos y no comparables con benchmarks estandar:

| Evaluacion | Resultado | Notas |
|---|---|---|
| GATE49 (49 preguntas, development set) | 47/49 | Empata con el mejor resultado de la flota THOX |
| Flagship probe (6 prompts) | 3/6 | Insuficiente para promocion; el autor lo declara como fallo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,5-3 GB con GGUF Q4_K_M; ~4-5 GB con GGUF Q8_0; ~8 GB con safetensors en bf16 (pesos ~7,7 GB mas overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060/4060, RTX 4070/4090) para bf16; GPUs con 4-6 GB pueden ejecutar Q4_K_M. Para despliegue servidor, A100/H100 no son necesarias por el tamano, pero permiten mayor throughput con vLLM/TGI.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 6-8 GB o mas, especialmente con cuantizacion GGUF.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp (GGUF), transformers (safetensors), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (compatible con arquitectura Phi-3/Phi-4, aunque no confirmado explicitamente en la card).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ThoxMini-Phi4Mini | ~3,8B | no disponible | MIT | Ajuste SFT de dominio THOX; estado "not promoted" segun el autor |
| microsoft/Phi-4-mini-instruct | ~3,8B | no disponible en esta ficha | MIT | Modelo base; capacidades generales de razonamiento, matematicas y codigo |
| Qwen2.5-3B-Instruct | ~3,1B | no disponible en esta ficha | Apache 2.0 | Alternativa multilingue de tamano similar para despliegue local |
| Llama-3.2-3B-Instruct | ~3,2B | no disponible en esta ficha | Llama 3.2 Community License | Alternativa popular en el segmento de ~3B para edge |

La comparacion de rendimiento con estas alternativas no esta disponible: el autor solo publica evaluaciones internas (GATE49 y flagship probe) sin resultados de benchmarks publicos que permitan una comparacion directa.

## Limitaciones y advertencias

- Estado del modelo: el propio autor lo declara "BASELINE ESTABLISHED — NOT PROMOTED", con un fallo de 3/6 en la prueba flagship probe; no debe asumirse listo para produccion general.
- Especializacion estrecha: el ajuste esta orientado a factualidad sobre productos THOX; su comportamiento fuera de ese dominio depende del modelo base y no esta evaluado.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion: aunque el entrenamiento busca reducirla mediante rechazo de lo no publicado, no hay evaluacion publica de la tasa de alucinacion fuera del conjunto de desarrollo.
- Contexto: la longitud de contexto no se confirma en la model card; conviene verificar la del modelo base antes de disenar flujos con contexto largo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; los terminos del modelo base de Microsoft deben respetarse en la medida en que apliquen.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Dependencia de configuracion: el comportamiento desplegado incluye un system prompt especifico; usarlo sin ese prompt puede degradar la factualidad y la tasa de rechazo.
- Trazabilidad: el repositorio de merge se conserva como registro, pero no se detallan la composicion ni el tamano del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMini-Phi4Mini
- Repositorio de merge: https://huggingface.co/Thox-ai/ThoxMini-Phi4Mini-Merged
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Demo de dispositivos: https://thox.ai/#demo-callout-home_lineup
- Campana Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
