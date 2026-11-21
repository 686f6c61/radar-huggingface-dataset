# thinkingdbx/GUARDx-1.7B-GGUF

## Resumen

GUARDx-1.7B es un modelo de 1.700 millones de parametros especializado en seguridad de agentes de IA, desarrollado por thinkingdbx mediante fine-tuning de Qwen/Qwen3-1.7B. Su funcion es actuar como guardrail en tiempo real: inspecciona la tupla formada por la politica de seguridad, el mensaje del usuario, el contexto recuperado (por ejemplo, documentos RAG) y la llamada a herramienta propuesta por el agente, antes de que esta se ejecute, y emite un veredicto JSON estricto con decision (ALLOW, BLOCK o REQUIRE_APPROVAL), puntuacion de riesgo, categoria de amenaza y razon.

El modelo aborda un problema creciente en despliegues de agentes con tool calling y servidores MCP: la inyeccion indirecta de instrucciones a traves de documentos, correos o salidas de herramientas, la exfiltracion de datos, la escalada de privilegios y las llamadas destructivas. Al ser un modelo pequeno (1.7B), esta pensado para ejecutarse como middleware lateral (sidecar) con latencia baja, sin depender de un LLM grande para cada comprobacion.

Se distribuye en formato GGUF con tres cuantizaciones (Q4_K_M, Q8_0 y F16) y un Modelfile listo para Ollama, con licencia Apache-2.0 heredada del modelo base. La model card reporta mejoras notables frente a Qwen3-1.7B base en precision de bloqueo de ataques y en tasa de falsos positivos sobre datos benignos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B); detalles internos no disponibles |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_seq_length=1024) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 (GGUF); pesos fusionados en FP16 safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, Q8_0, F16); safetensors FP16 como referencia de exportacion |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only, y se ha ajustado con MLX LoRA (rank=16, scale=32, 16 capas, optimizador AdamW, scheduler coseno con LR de 2e-5 a 2e-6, max_seq_length=1024 y loss enmascarada sobre el prompt). El mejor checkpoint se alcanzo en el paso 1.500, con una caida de la perdida de validacion de 4,169 a 0,348. Posteriormente los pesos se fusionaron a FP16 en safetensors y se convirtieron y cuantizaron con llama.cpp.

El dataset de fine-tuning consta de 16.400 escenarios verificados (15.582 de entrenamiento y 818 de validacion), balanceados entre ataques (BLOCK: 9.216), turnos benignos dificiles (ALLOW: 5.229) y acciones que requieren intervencion humana (REQUIRE_APPROVAL: 1.955). La innovacion principal no es arquitectonica sino de tarea: el modelo esta entrenado para producir un esquema JSON estricto de cuatro claves con temperatura 0.0, lo que lo convierte en un clasificador de seguridad determinista y facil de integrar en pipelines. No se documentan tecnicas como decodificacion especulativa ni attention linear.

## Capacidades

- Clasificacion de seguridad de turnos de agente en tres clases: ALLOW, BLOCK y REQUIRE_APPROVAL (human-in-the-loop).
- Deteccion de prompt injection directa e indirecta (instrucciones ocultas en documentos RAG, correos o salidas de herramientas).
- Deteccion de llamadas a herramientas destructivas (DROP, DELETE, envios masivos, acciones de infraestructura).
- Deteccion de inyeccion SQL, inyeccion de comandos de shell, path traversal y SSRF dentro de argumentos de herramientas.
- Deteccion de exfiltracion de datos hacia webhooks externos o destinos no autorizados.
- Deteccion de fuga de PII o secretos (claves de API, credenciales, SSN, PAN/CVV).
- Deteccion de escalada de privilegios (acceso a tablas, herramientas o acciones de administrador fuera de rol).
- Deteccion de violaciones de politica (umbrales financieros o de aprobacion, guardrails operativos).
- Salida estructurada con risk_score (0.0 a 1.0), threat_category (9 clases) y reason en texto.
- Soporte de tool calling como objeto de analisis (no como ejecutor); orientado a agentes y flujos multi-paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Middleware de seguridad para agentes MCP: se intercala entre el agente y el servidor de herramientas; antes de cada tool call, GUARDx evalua politica, mensaje, contexto y llamada, y bloquea o deriva a aprobacion humana. Su tamano de 1.7B permite ejecutarlo en el mismo host con latencia baja.
- Proteccion de pipelines RAG: cuando el agente recupera documentos de fuentes no confiables, el modelo inspecciona el contexto recuperado en busca de instrucciones ocultas (INDIRECT_INJECTION) antes de que el agente actue sobre ellas.
- Guardrail de operaciones de base de datos: en agentes de FinOps o analitica que ejecutan SQL, detecta DDL/DML no autorizado, inyeccion SQL en argumentos y accesos a tablas fuera de rol, emitiendo BLOCK o REQUIRE_APPROVAL.
- Prevencion de exfiltracion en agentes con acceso a red: detecta llamadas que envian datos internos a webhooks externos o destinos no autorizados, util en agentes de atencion al cliente con acceso a CRM.
- Cumplimiento y proteccion de PII: filtra respuestas y llamadas que expondrian claves de API, credenciales, SSN o datos de tarjeta, adecuado para entornos regulados (banca, seguros).
- Aprobacion humana selectiva: el modelo identifica acciones de alto impacto y las marca como REQUIRE_APPROVAL, lo que permite construir flujos de human-in-the-loop sin revisar manualmente todos los turnos.
- Evaluacion offline de trayectorias de agentes: puede usarse por lotes para auditar registros de interacciones y etiquetar incidentes por categoria de amenaza, alimentando paneles de seguridad.

## Benchmarks y rendimiento

Evaluacion sobre 150 turnos de holdout bloqueados en tres entornos empresariales no vistos (Cloud FinOps Automation Agent, Banking Fraud Ops Agent, E-Commerce Warehouse MCP Agent), comparado con Qwen/Qwen3-1.7B base:

| Metrica | Qwen3-1.7B base | GUARDx-1.7B | Delta |
|---|---:|---:|---:|
| Validez estricta del esquema JSON | 99,3% | 100,0% (150/150) | +0,7 pts |
| Precision de decision en 3 clases (ALLOW/BLOCK/HITL) | 72,7% | 89,3% | +16,7 pts |
| Tasa de falsos positivos en benignos (menor es mejor) | 43,2% (19/44) | 0,0% (0/44) | -43,2 pts |
| Precision de REQUIRE_APPROVAL (HITL) | 0,0% (0/18) | 100,0% (18/18) | +100,0 pts |
| Precision de bloqueo de ataques | 71,4% | 100,0% (73/73) | +28,6 pts |
| F1 de bloqueo de ataques | 82,1% | 90,7% | +8,6 pts |
| Precision exacta de categoria de amenaza (9 clases) | 0,0% | 79,3% | +79,3 pts |

Perdida de validacion: de 4,169 a 0,348 en el checkpoint 1.500. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB con Q4_K_M, 1,7 GB con Q8_0 y 3,2 GB con F16 (pesos); anadir overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para Q4_K_M; RTX 3060/4060 o superiores son suficientes. Para F16 conviene 6-8 GB. En servidor, A100, H100 o L4 no son necesarias por tamano, pero permiten mayor concurrencia.
- Cabe en GPU consumer: si, en la mayoria de GPU modernas con 4 GB o mas para Q4_K_M.
- Opciones de despliegue: Ollama (Modelfile incluido con temperature 0.0), llama.cpp (llama-cli/llama-server), y cualquier runtime compatible con GGUF; la libreria declarada en el repo es MLX, por lo que tambien es usable en Apple Silicon via MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano y cuantizacion Q4_K_M se espera baja latencia en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GUARDx-1.7B | 1,72B | no disponible | Guardrail de agentes/MCP, salida JSON de 3 clases | Apache-2.0 | GGUF en Hugging Face, Modelfile Ollama |
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible | LLM generalista | Apache-2.0 | Hugging Face |
| Modelos guardrail tipo Llama Guard | no disponible | no disponible | Clasificacion de seguridad de contenido | no disponible | no disponible |

La comparacion directa con Qwen3-1.7B base esta documentada en la tabla de benchmarks. No se dispone de datos de otros guardrails especializados en la informacion proporcionada para una comparativa cuantitativa.

## Limitaciones y advertencias

- Entrenado y evaluado solo en ingles; el rendimiento en castellano u otros idiomas no esta validado.
- Evaluacion sobre 150 turnos de holdout; el tamano muestral es reducido y los resultados deben tratarse como indicativos, no como garantia en produccion.
- Riesgo de alucinacion en el campo reason y en threat_category; la salida JSON es estricta pero el contenido textual puede ser incorrecto.
- Sesgos heredados de Qwen3-1.7B y del dataset de entrenamiento (escenarios empresariales sinteticos o curados); puede no cubrir dominios fuera de FinOps, banca y e-commerce.
- No es un modelo generativo de proposito general: usarlo para conversacion o codigo fuera de su tarea de clasificacion dara resultados pobres.
- Depende de que el prompt incluya politica, mensaje, contexto y llamada propuesta de forma consistente; un formato de entrada distinto puede degradar la precision.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar con datos propios antes de desplegar.
- La fecha de creacion del repo (2026-11-20) y el bajo numero de descargas (0) y likes (0) indican un modelo muy reciente y sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thinkingdbx/GUARDx-1.7B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- MLX: https://github.com/ml-explore/mlx
