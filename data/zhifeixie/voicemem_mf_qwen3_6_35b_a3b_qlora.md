# zhifeixie/VoiceMem_MF_Qwen3_6_35B_A3B_Qlora

## Resumen

VoiceMem_MF_Qwen3_6_35B_A3B_Qlora es un adaptador LoRA (QLoRA) publicado por zhifeixie para el modelo base Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje de tipo Mixture-of-Experts con 35 mil millones de parámetros totales y 3 mil millones activos. El adaptador forma parte del sistema VoiceMem, una arquitectura de "doble cerebro en streaming" para agentes de voz en tiempo real que recupera memoria mientras el usuario aún está hablando. El objetivo concreto del adaptador es que el modelo genere respuestas basadas en la memoria recuperada (Top-K retrieved memory) en lugar de ignorarla o repetirla literalmente.

El adaptador pesa solo 180 MB (rank 32, alpha 64) y se entrenó mediante SFT supervisado sobre datos multi-turno que contienen memoria recuperada en lugar de transcripciones completas. Aunque el repositorio se denomina "VoiceMem_MF_Qwen3_6_35B_A3B_Qlora", la model card advierte que el nombre no coincide con el contenido real (el repo fue renombrado y los pesos corresponden al adaptador de respuesta Qwen3.6-35B-A3B). Es relevante porque aborda un problema práctico en agentes conversacionales: la integración efectiva de memoria externa en la generación, con un coste de adaptación mínimo y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre Qwen3.6-35B-A3B (MoE, transformer causal) |
| Parametros totales | Adaptador: 180 MB (rank 32); base: 35B (no especificado en detalle) |
| Parametros activos | Base: 3B (segun denominacion A3B); adaptador no aplica |
| Longitud de contexto | 2048 tokens (maximo de entrenamiento); base no especificado |
| Tipos de cuantizacion | bf16 (entrenamiento); no se documentan cuantizaciones para inferencia |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, 180 MB) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 32 con alpha 64 y dropout 0.05, aplicada sobre las proyecciones de atencion y FFN del modelo base: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_*`, `out_proj` y `shared_expert_gate`. El entrenamiento se realizo con QLoRA (cuantizacion de 4 bits del base) y SFT supervisado, con precision bf16, gradient checkpointing activado, optimizador `adamw_torch_fused`, learning rate 2e-4 con scheduler coseno y warmup del 3%, weight decay 0.1 y betas (0.9, 0.95). Se usaron 2 epocas (3,318 pasos globales, seed 42) con batch de 8 por dispositivo y 2 pasos de acumulacion de gradientes, sobre secuencias de hasta 2,048 tokens.

Los datos de entrenamiento son JSONL multi-turno donde el contexto es la memoria recuperada por el sistema VoiceMem, no transcripciones crudas. El dataset no se ha liberado; la model card indica que la procedencia, licencias y consentimiento se documentaran en el repositorio de codigo antes de cualquier publicacion. No se menciona uso de RLHF ni DPO. La innovacion principal no esta en la arquitectura del adaptador, sino en el pipeline de datos: condicionar la generacion a memoria recuperada en lugar de historial completo, lo que reduce el coste de contexto y mejora la fidelidad a la memoria.

## Capacidades

- Generacion de texto condicionada a memoria recuperada: el adaptador esta entrenado para consumir Top-K memorias en el contexto y responder a partir de ellas, evitando tanto ignorarlas como repetirlas textualmente.
- Soporte para agentes de voz en tiempo real: integrado con el sistema VoiceMem (mic → streaming memory prefetch → respuesta con memoria), mediante el script `realtime_funasr_qwen.py`.
- Multilingue limitado a chino e ingles, segun los idiomas declarados en la model card.
- Capacidad de adaptacion ligera: al ser un adaptador PEFT, puede cargarse y descargarse sobre el base sin modificar los pesos originales.
- No se documentan capacidades de tool calling, vision, audio ni razonamiento multi-paso especifico; el adaptador se centra exclusivamente en la generacion de respuestas con memoria.

## Casos de uso

- Agentes de voz con memoria de larga duracion: un asistente que recuerda preferencias, citas o datos personales del usuario a lo largo de conversaciones separadas, usando la memoria recuperada en cada turno.
- Atencion al cliente automatizada: gestion de incidencias multi-turno donde el agente debe recordar el historial del cliente (productos, quejas previas, estados de pedidos) sin repetir la informacion que el usuario ya ha dado.
- Asistentes personales de productividad: recuperacion de notas, tareas y contextos previos para responder preguntas como "¿que tenia pendiente el martes?" con datos precisos.
- Sistemas de recomendacion conversacional: un bot que sugiere contenido (restaurantes, peliculas, libros) basandose en gustos almacenados en memoria y confirmados por el usuario.
- Investigacion en memoria para LLM: el adaptador sirve como referencia reproducible para estudiar como condicionar la generacion a memorias recuperadas en arquitecturas MoE.
- Prototipos de agentes en tiempo real: desarrolladores que quieren probar el pipeline completo de VoiceMem (recuperacion en streaming + generacion con memoria) sin entrenar un modelo desde cero.

## Benchmarks y rendimiento

La model card reporta resultados para el adaptador en el benchmark AudioMC `INFERENCE_MEMORY` (132 conversaciones, 233 criterios de rubrica). Se evaluo con GPT-4o-mini como juez:

| Modelo | Criterios cumplidos | Porcentaje |
|---|---|---|
| VoiceMem adapter (checkpoint-3318) | 97 / 233 | 41.6% |
| GPT-4o-mini | 96 / 233 | 41.2% |

El margen es de 1 criterio (+0.43 puntos porcentuales). La model card advierte explicitamente que se trata de una mejora minima y que el resultado debe interpretarse como evidencia de que el adaptador no regresa respecto a un baseline fuerte, no como una ganancia significativa de capacidad.

Ademas, se reportan metricas del sistema VoiceMem completo (no del adaptador aislado) comparado con Mem0:

| Metrica | VoiceMem | Mem0 |
|---|---|---|
| LoCoMo accuracy (Top-5 memorias) | 91.2% | 61.68% |
| PersonaMem accuracy | 69.44% | — |
| Latencia de recuperacion | 134 ms | 1,440 ms |
| Tokens de memoria por turno | 302 | 6,956 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- El adaptador en si ocupa 180 MB y no requiere VRAM adicional significativa, pero el modelo base Qwen3.6-35B-A3B (35B totales, 3B activos) es el que domina los requisitos.
- Para inferencia con el base en bf16 se estiman unos 70 GB de VRAM (35B × 2 bytes), por lo que se necesitan GPUs de clase A100 80GB o H100; con cuantizacion de 4 bits podria caber en una RTX 4090 (24 GB) aunque no se documenta oficialmente.
- Opciones de despliegue: el adaptador se carga con `transformers` + `peft` (PeftModel). Para el sistema completo se usa el script `realtime_funasr_qwen.py` con `voicemem`, `funasr` y `sounddevice`. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia: la recuperacion de memoria del sistema VoiceMem es de 134 ms, pero la latencia de generacion del adaptador no se especifica en la informacion disponible.

## Comparativa con modelos similares

No hay modelos directamente comparables con esta funcion especifica (adaptador de memoria para agentes de voz sobre un MoE). La comparacion mas cercana es la que reporta la propia model card contra GPT-4o-mini en el benchmark AudioMC, y contra el sistema Mem0 en metricas de memoria. En ambos casos, el adaptador de VoiceMem supera o iguala al baseline, pero con margenes minimos. Otros adaptadores LoRA para memoria conversacional existen en el ecosistema (por ejemplo, adaptadores para Llama o Mistral), pero no se dispone de datos publicos para una comparativa rigurosa con ellos.

| Modelo/Sistema | Parametros | Contexto | Licencia | Resultado clave |
|---|---|---|---|---|
| VoiceMem adapter | 180 MB (adaptador) + 35B base | 2048 (entrenamiento) | Apache 2.0 | AudioMC 41.6% |
| GPT-4o-mini | no disponible | no disponible | propietaria | AudioMC 41.2% |
| Mem0 | no aplica (sistema de memoria) | no aplica | no disponible | LoCoMo 61.68% |

## Limitaciones y advertencias

- Solo es un adaptador, no un modelo completo: requiere descargar el base Qwen3.6-35B-A3B por separado, bajo su propia licencia y condiciones de acceso.
- El nombre del repositorio no coincide con su contenido: la model card advierte que el repo se llama `VoiceMem_SLM_Qwen25_omni` pero contiene los pesos del adaptador Qwen3.6-35B-A3B, lo que puede causar confusion al cargar o citar el modelo.
- Los datos de entrenamiento no se han liberado, lo que limita la reproducibilidad completa y la auditoria de sesgos.
- El benchmark AudioMC muestra un margen de mejora minimo (+0.43 puntos) frente a GPT-4o-mini; no debe interpretarse como una ganancia sustancial de capacidad.
- El adaptador se entreno con un maximo de 2,048 tokens de contexto; no se ha validado su comportamiento con contextos mas largos, aunque el sistema VoiceMem reduce la necesidad de contexto al inyectar solo memorias recuperadas (302 tokens por turno de media).
- Idiomas limitados a chino e ingles; no se garantiza rendimiento en otros idiomas.
- Riesgo de alucinacion inherente a la generacion con memoria: si la memoria recuperada es incorrecta o esta desactualizada, el modelo puede producir respuestas plausibles pero falsas.
- No se documentan cuantizaciones para inferencia ni integraciones con servidores de inferencia populares; el despliegue en produccion requiere adaptaciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhifeixie/VoiceMem_MF_Qwen3_6_35B_A3B_Qlora
- Repositorio de codigo VoiceMem (GitHub): https://github.com/lang-jiaqi/Voicemem_open
- Entorno de modelos por defecto (HuggingFace): https://huggingface.co/zhifeixie/VoiceMem_Default_Models_Env
- Articulo de analisis tecnico (externo): https://ai.thesatyajit.com/articles/voicemem
- Pagina en FriendliAI (despliegue): https://friendli.ai/models/zhifeixie/VoiceMem_MF_Qwen3_6_35B_A3B_Qlora
- Registro en Free2AITools: https://free2aitools.com/model/zhifeixie/voicemem_mf_qwen3_6_35b_a3b_qlora
- Paper en arXiv (mencionado en el analisis externo, titulo "Streaming Dual-Brain Memory for Real-Time Interaction"; URL no disponible en la informacion proporcionada)
