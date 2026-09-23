# SpaceTimee/Qwen3.8-27B-heretic-Pass1-LoRA

## Resumen

SpaceTimee/Qwen3.8-27B-heretic-Pass1-LoRA es un adaptador LoRA publicado por el usuario SpaceTimee sobre el modelo denso multimodal Qwen3.8-27B, al que se le ha aplicado un proceso de "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones) mediante la herramienta Heretic v1.4.0. El objetivo declarado es obtener una versión decensurada del modelo: según la propia model card, la tasa de rechazos baja de 94/100 en el modelo original a 7/100 en esta variante, con una divergencia KL de 0,0463 respecto al original. Es, por tanto, un artefacto orientado a eliminar comportamientos de negativa, no una mejora de capacidades.

El modelo base, Qwen3.8-27B, es un modelo denso de 27.000 millones de parámetros de la familia Qwen (Alibaba), con arquitectura híbrida que combina capas de atención lineal Gated DeltaNet con capas de atención completa (Gated Attention) y un codificador de visión, lo que lo convierte en un modelo nativo de lenguaje y visión capaz de procesar imágenes y vídeos. Su longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000, y está pensado para tareas de código, flujos agénticos de largo horizonte y automatización de oficina.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de edición de pesos mediante abliteración sobre un modelo multimodal grande; por otro, advierte de que el repositorio figura con un tamaño de 0,0 GB, sin descargas ni valoraciones, por lo que los pesos del adaptador podrían no estar efectivamente subidos. Además, al ser un LoRA y no un modelo completo, requiere fusionarse con el modelo base para su uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con arquitectura híbrida: 16 bloques de (3 × Gated DeltaNet → FFN) + (1 × Gated Attention → FFN), más codificador de visión (arquitectura del modelo base Qwen3.8-27B) |
| Parámetros totales | 27B en el modelo base; este repositorio contiene un adaptador LoRA (tamaño de pesos no disponible) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 tokens |
| Tipos de cuantización | El adaptador se distribuye en safetensors; para el modelo base se documentan GGUF dinámicos Unsloth Dynamic 2.0 (incluida una variante de 1 bit). No se detallan cuantizaciones específicas de este repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Desarrollador | SpaceTimee (adaptador); Qwen / Alibaba (modelo base) |
| Modelo base | Qwen/Qwen3.8-27B (la model card cita unsloth/Qwen3.8-27B como origen de la decensuración) |
| Método de edición | Abliteración con Heretic v1.4.0 |
| Dimensión oculta | 5.120 |
| Número de capas | 64 |
| Dimensión de la FFN | 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con un diseño híbrido poco habitual. Cada uno de los 16 bloques de la red encadena tres subcapas de Gated DeltaNet (atención lineal recurrente) con FFN, seguidas de una subcapa de Gated Attention (atención completa) con FFN, lo que da 64 capas en total. La Gated DeltaNet usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la Gated Attention emplea 24 cabezas de consulta y 4 de clave/valor (GQA con ratio 6:1), dimensión de cabeza 256 y dimensión RoPE de 64. Se entrenó con predicción multi-token (MTP) en varios pasos y emplea un token embedding de 248.320 entradas. El modelo incluye además un codificador de visión, lo que lo convierte en un modelo nativo de lenguaje y visión. El reparto de atención lineal frente a atención completa reduce el coste de contexto largo en las capas linealizadas, mientras que las 16 capas de atención completa mantienen su caché KV.

Sobre ese modelo, este repositorio aplica un LoRA de abliteración generado con Heretic v1.4.0, con dirección de rechazo calculada por capa. Los pesos aplicados son: attn.o_proj con max_weight 1,19 en la posición 42,29 y min_weight 0,93 a distancia 19,33; y mlp.down_proj con max_weight 1,40 en la posición 42,47 y min_weight 0,22 a distancia 35,08. No se documentan datos de entrenamiento adicionales, número de tokens, composición de dataset ni uso de RLHF o DPO para el adaptador: la edición se realiza sobre pesos ya entrenados.

| Parámetro de abliteración | Valor |
|---|---|
| direction_index | por capa (per layer) |
| attn.o_proj.max_weight | 1,19 |
| attn.o_proj.max_weight_position | 42,29 |
| attn.o_proj.min_weight | 0,93 |
| attn.o_proj.min_weight_distance | 19,33 |
| mlp.down_proj.max_weight | 1,40 |
| mlp.down_proj.max_weight_position | 42,47 |
| mlp.down_proj.min_weight | 0,22 |
| mlp.down_proj.min_weight_distance | 35,08 |

## Capacidades

- Generación de texto y razonamiento: el modelo base incorpora modo de pensamiento activado por defecto, desactivable por petición, con profundidad de razonamiento ajustable mediante `reasoning_effort` y retención del contexto de razonamiento de mensajes previos mediante `preserve_thinking`.
- Codificación: la documentación del modelo base sitúa el código como uno de los dominios con mejoras principales, junto con trabajo profesional e investigación.
- Comprensión de imágenes: modelo nativo de lenguaje y visión, con soporte para diagramas STEM y documentos.
- Comprensión de vídeo: soporte nativo de vídeo, incluyendo vídeos de escala horaria según la documentación del base.
- Tool calling / function calling: mejoras explícitas en el parseo de objetos anidados para aumentar la tasa de éxito en llamadas a herramientas.
- Soporte de agentes: planificación autónoma y manejo de retroalimentación del entorno orientados a completar tareas de extremo a extremo; soporte de rol "developer" para integración en herramientas agénticas como Codex.
- Tareas agénticas de largo horizonte: combinación de contexto de 262.144 tokens y ejecución multi-paso.
- Predicción multi-token (MTP): entrenado con MTP en varios pasos, lo que habilita decodificación especulativa en frameworks compatibles.
- Decensurado: reducción de rechazos de 94/100 a 7/100 sobre un conjunto de 100 peticiones, según la model card.
- Capacidades multilingües: no disponible (no se detalla la lista de idiomas soportados).

## Casos de uso

- Asistentes de programación en IDE o terminal: el modelo base está orientado a código y soporta rol "developer", de modo que puede integrarse como agente que lee repositorios, ejecuta comandos y aplica parches en herramientas tipo Codex o similares.
- Atención al cliente automatizada multi-turno: la ventana de 262.144 tokens permite mantener historiales de conversación muy largos, con facturas, contratos o trazas de sesiones anteriores dentro del mismo contexto sin resumir.
- Procesado de documentación técnica con visión: al ser nativo de visión, puede extraer información de diagramas, planos, tablas y documentos escaneados, útil en ingeniería, legal o seguros.
- Análisis de vídeo de larga duración: la documentación del base menciona comprensión de vídeo de escala horaria, aplicable a revisión de grabaciones de vigilancia, sesiones clínicas grabadas o material de formación.
- Agentes autónomos de operaciones: con tool calling mejorado en objetos anidados, puede encadenar llamadas a APIs internas, consultar bases de datos y ejecutar acciones con verificación de resultados.
- Automatización de oficina: generación y revisión de informes, resúmenes de correo, cumplimentación de plantillas y extracción de datos de documentos, con el modelo ejecutándose en hardware local.
- Generación creativa sin restricciones temáticas: el caso de uso declarado del adaptador es producir texto en dominios donde el modelo original rechazaría la petición (ficción adulta, temáticas sensibles), siempre bajo responsabilidad del desplegador.
- Investigación en seguridad y alineación: sirve como artefacto de estudio de cómo la abliteración afecta a la distribución de salidas y a la degradación medida por divergencia KL.
- Adaptación de dominio mediante LoRA: al ser ya un adaptador, puede servir como punto de partida para fusionar y continuar el ajuste con datos propios en un pipeline de Unsloth.
- Despliegue local con cuantización: el modelo base dispone de GGUF dinámicos de Unsloth, lo que permite ejecutarlo en estaciones de trabajo con GPU de consumo para tareas de resumen o clasificación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento de la model card son métricas del proceso de abliteración:

| Métrica | Este modelo | Modelo original (unsloth/Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0,0463 | 0 (por definición) |
| Rechazos | 7/100 | 94/100 |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamaño de 27B parámetros del modelo base y de la arquitectura declarada; el autor no publica requisitos de hardware.

- Pesos en bf16/fp16: en torno a 54 GB solo para pesos, más caché KV y activaciones; requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU de 48 GB.
- Pesos en int8/FP8: en torno a 27-30 GB, viable en A6000 48 GB, L40S 48 GB o 2 × RTX 4090.
- Cuantización de 4 bits (GGUF Q4_K_M y equivalentes Unsloth Dynamic): aproximadamente 15-18 GB, cabe en RTX 4090, RTX 3090 de 24 GB o RTX 5090.
- Cuantizaciones de 1-2 bits: la documentación de Unsloth menciona ejecución del base a 1 bit; implican pérdida de calidad no cuantificada en la información disponible.
- Caché KV en contexto largo: las 16 capas de Gated Attention mantienen caché KV; con 4 cabezas KV de dimensión 256 en bf16 se estiman del orden de 65 KB por token, es decir, unos 17 GB a 262.144 tokens. Las capas Gated DeltaNet no escalan de la misma forma por ser atención lineal.
- Adaptador LoRA: el repositorio figura con 0,0 GB; el tamaño real de los pesos del adaptador es no disponible.
- Opciones de despliegue: para el modelo base se documentan Unsloth (incluido Unsloth Desktop) y GGUF dinámicos, además de los frameworks habituales compatibles con formato GGUF y safetensors (llama.cpp, Ollama, vLLM, TGI). No se confirma compatibilidad específica de este adaptador con cada uno de ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Método | Parámetros | Contexto | Licencia | Rechazos | Divergencia KL |
|---|---|---|---|---|---|---|---|
| SpaceTimee/Qwen3.8-27B-heretic-Pass1-LoRA | Qwen3.8-27B | LoRA + abliteración con Heretic 1.4.0 | 27B (adaptador) | 262.144 (heredado del base) | apache-2.0 | 7/100 | 0,0463 |
| unsloth/Qwen3.8-27B | Qwen3.8-27B | Modelo original | 27B | 262.144 | apache-2.0 | 94/100 | 0 |
| SpaceTimee/Qwen3.8-27B-heretic-LoRA | Qwen3.8-27B | Abliteración | no disponible | no disponible | no disponible | no disponible | no disponible |
| OS-Software/Qwen3.8-27B-Uncensored-Heretic-v2 | Qwen3.8-27B | Decensurado tipo heretic | no disponible | no disponible | no disponible | no disponible | no disponible |
| SassyDiffusion/Qwen3.8-27B-heretic | Qwen3.8-27B | Decensurado tipo heretic | no disponible | no disponible | no disponible | no disponible | no disponible |

Todas las alternativas localizadas son derivados del mismo modelo base, por lo que la comparación relevante es la del binomio original frente a decensurado, no la de capacidades entre familias distintas. No se han localizado comparativas publicadas de estos derivados entre sí.

## Limitaciones y advertencias

- Repositorio aparentemente vacío: el tamaño declarado es 0,0 GB, con 0 descargas y 0 likes, lo que sugiere que los pesos del adaptador podrían no estar subidos o no estar disponibles públicamente en el momento de redactar esta ficha.
- Es un LoRA, no un modelo completo: no puede ejecutarse de forma autónoma; requiere descargar Qwen3.8-27B y fusionar o cargar el adaptador.
- Degradación por abliteración: la divergencia KL de 0,0463 respecto al original indica un cambio medible en la distribución de salidas. No se publican evaluaciones de capacidades (código, matemáticas, visión) que permitan cuantificar el daño colateral.
- Eliminación parcial de salvaguardas: quedan 7 rechazos de cada 100 peticiones, pero la intención declarada es reducir el comportamiento de negativa. Esto implica riesgo de generar contenido dañino, ilegal o no apto para entornos productivos sin moderación externa.
- Riesgo de alucinación: no hay datos específicos publicados para este adaptador; el proceso de edición de pesos no elimina el riesgo inherente del modelo base.
- Sesgos: no disponible. No se documentan evaluaciones de sesgo ni de equidad.
- Idiomas: no disponible. No se especifica la cobertura lingüística real del modelo base ni del adaptador.
- Restricciones de licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial, pero se trata de una declaración del autor del adaptador sobre un modelo base de terceros; conviene verificar las condiciones aplicables al modelo Qwen original antes de un despliegue comercial.
- Nombre y estado del artefacto: el sufijo "Pass1" sugiere una primera pasada de un proceso iterativo, sin que se documente ninguna pasada posterior.
- Cautela con la nomenclatura: la model card mezcla referencias a Qwen/Qwen3.8-27B y a unsloth/Qwen3.8-27B; conviene comprobar con qué revisión exacta del base se generó el adaptador antes de fusionarlo.
- Recomendaciones de muestreo: el modelo base especifica `temperature=1.0`, `top_p=0.95`, `top_k=20` en modo pensamiento y `temperature=0.7`, `top_p=0.80`, `presence_penalty=1.5` en modo instruct; no respetarlas puede provocar repeticiones sin fin o mezcla de idiomas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SpaceTimee/Qwen3.8-27B-heretic-Pass1-LoRA
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base en Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B
- Guía de ejecución de Qwen3.8-27B de Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Benchmarks de cuantización Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Unsloth Desktop: https://unsloth.ai/docs/new/desktop
- Proyecto Heretic: https://heretic-project.org
- Repositorio GitHub de Unsloth: https://github.com/unslothai/unsloth/
- Repositorio GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Adaptador relacionado del mismo autor: https://huggingface.co/SpaceTimee/Qwen3.8-27B-heretic-LoRA
- Derivado decensurado alternativo: https://huggingface.co/OS-Software/Qwen3.8-27B-Uncensored-Heretic-v2
- Ficha de SassyDiffusion/Qwen3.8-27B-heretic en LLM Explorer: https://llm-explorer.com/model/SassyDiffusion%2FQwen3.8-27B-heretic,147DZBuSJLgYrivQkQeY6F
- Comunidad en Discord de Unsloth: https://discord.gg/unsloth
