# violetxi/qwen35-9b-equational-theory-sair-r3-mix30m

## Resumen

violetxi/qwen35-9b-equational-theory-sair-r3-mix30m es un ajuste fino completo (full fine-tune, sin adaptadores) del modelo base Qwen/Qwen3.5-9B, orientado a teoria ecuacional y a la resolucion de problemas del benchmark SAIR. El autor es violetxi (Violet Xiang) y el modelo se publica bajo licencia Apache 2.0. Se trata de un checkpoint de la epoca 2 de un entrenamiento SFT supervisado sobre una mezcla anidada de aproximadamente 30 millones de tokens por epoca, compuesta por notas de teoria ecuacional y trayectorias de respuesta condicionadas por notas.

El modelo conserva la arquitectura nativa del base, `Qwen3_5ForConditionalGeneration`, con 9.653.104.368 parametros totales y pesos en BF16 distribuidos en safetensors fragmentados (19,3 GB de repositorio). Al ser un fine-tune completo, no requiere fusionar adaptadores ni descargar el modelo base por separado; incluye configuracion, tokenizer, plantilla de chat y ficheros de procesador. Los pesos de vision y de prediccion multi-token (MTP) se heredan sin cambios del base, mientras que los 427 tensores del modulo de lenguaje se remapean a la disposicion nativa.

Su relevancia es doble. Por un lado, es un ejemplo de especializacion vertical de un modelo generalista de 9B en razonamiento matematico-formal, con un presupuesto de contexto de generacion de 32.768 tokens. Por otro, publica resultados de evaluacion SAIR con dos presupuestos de salida (16K y 24K) y un explorador publico de respuestas, lo que permite auditar el comportamiento del modelo en tareas de prueba/contraejemplo sobre enunciados Lean.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (clase `Qwen3_5ForConditionalGeneration`, con atencion lineal tipo Gated DeltaNet y atencion completa segun el base Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como especificacion oficial del fine-tune; la evaluacion y la generacion de ejemplo usan 32.768 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16; se citan `--dtype bfloat16` en vLLM y `dtype="auto"` en Transformers) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fragmentados), BF16; incluye configuracion, tokenizer, plantilla de chat y processor |

## Arquitectura y entrenamiento

El modelo parte de la revision fijada `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del base Qwen3.5-9B, una arquitectura hibrida de 9B parametros que combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa. El fine-tune no altera esa topologia: los pesos de vision y de prediccion multi-token se heredan intactos, y solo se reentrena el modulo de lenguaje, cuyos 427 tensores (incluida la cabeza de salida) se convirtieron de FP32 a BF16 y se mapearon a la disposicion nativa.

El entrenamiento consistio en un SFT de modelo completo sobre una mezcla nominal anidada de 30M tokens por epoca: 20.961.111 tokens de notas y 9.000.144 tokens de respuestas de asistente tras el enmascaramiento de perdida, con una proporcion aproximada de 70% notas y 30% trayectorias. Se ejecutaron dos epocas sobre ocho GPUs GH200, con learning rate 5e-6, scheduler coseno, warmup 0.03, entropia cruzada media sobre todos los tokens supervisados y sin termino KL. El empaquetado sin padding aísla los ejemplos en atencion completa, atencion lineal y convolucion; las cabeceras de prompt y de asistente estan enmascaradas y las notas se tratan como texto plano. El pensamiento generado de forma separada se excluye del objetivo, y la plantilla de trayectoria incluye un envoltorio de pensamiento vacio. No se aplico filtro de correccion ni rechazo sistematico de respuestas truncadas por longitud; se mantuvieron exclusiones por repeticion y una validacion congelada.

## Capacidades

- Generacion de texto conversacional y de respuestas de razonamiento sobre enunciados de teoria ecuacional.
- Produccion de pruebas y contraejemplos en lenguaje natural frente a entradas tipo Lean, dentro del flujo de evaluacion SAIR.
- Modo de pensamiento explicito (`enable_thinking=True`) con envoltorio de pensamiento en la plantilla de chat y presupuestos de salida de hasta 24.576 tokens, incluyendo el razonamiento.
- Capacidad multimodal heredada del base (etiqueta `image-text-to-text`, pesos de vision sin modificar), aunque no se documenta su uso en las evaluaciones publicadas.
- Prediccion multi-token (MTP) heredada del modelo base, con pesos sin cambios.
- Soporte de `tool calling` / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla del modo de pensamiento: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no documenta el conjunto de idiomas.

## Casos de uso

- Resolucion asistida de problemas de teoria ecuacional: el modelo recibe un enunciado y devuelve una prueba o un contraejemplo en lenguaje natural, con el modo de pensamiento activado y un presupuesto de salida de 16K a 24K tokens para desarrollar la argumentacion.
- Pre-filtrado de enunciados antes de pasar a un asistente de pruebas formal: dado un conjunto de problemas, el ajuste fino sirve para descartar rapidamente los enunciados triviales o mal formados y priorizar los que requieren esfuerzo de demostracion.
- Generacion de material docente en algebra universal: producir ejemplos de estructuras que satisfacen o violan identidades dadas (por ejemplo, explicar por que la asociatividad no implica conmutatividad), con la traza de razonamiento incluida.
- Investigacion sobre ajuste fino especializado: el checkpoint permite estudiar como un SFT de modelo completo sobre una mezcla 70/30 de notas y trayectorias afecta al rendimiento en razonamiento formal frente al modelo base, con presupuestos de salida comparables.
- Construccion de pipelines de datos sinteticos: generar trayectorias condicionadas por notas que despues se filtran o se usan como material de entrenamiento para modelos mayores, dado el formato de plantilla documentado y el explorador publico de respuestas.
- Auditoria de evaluaciones con juez automatico: al publicarse las respuestas con semillas 0-3, el modelo se puede usar como referencia para calibrar jueces LLM (en el caso publicado, GPT-5.6-sol en modo `high`) sobre validacion de pruebas en lenguaje natural.
- Despliegue self-hosted en vLLM como servicio de razonamiento matematico: con `--dtype bfloat16 --reasoning-parser qwen3` se expone el modelo como endpoint compatible con la API de OpenAI para integrarlo en herramientas internas de investigacion.

## Benchmarks y rendimiento

El autor publica evaluaciones SAIR realizadas con vLLM 0.19.1 sobre 800 preguntas de etapa 1 y 300 preguntas de etapa 2, con cuatro respuestas sembradas por pregunta y presupuesto de cada respuesta (no pass@4). Las respuestas vacias o inciertas cuentan como fallo.

| Presupuesto de salida (incluye pensamiento) | Precision etapa 1 | Validez juzgada etapa 2 |
|---|---:|---:|
| 16K | 46,97% | 20,00% |
| 24K | 67,31% | 20,08% |

Notas de metodologia: la etapa 1 usa analisis y comparacion basados en reglas del veredicto binario; la etapa 2 usa GPT-5.6-sol (`high`) para juzgar la prueba o contraejemplo en lenguaje natural frente a la entrada Lean, con el pensamiento oculto excluido y sin soluciones de referencia fiables en el conjunto. Los juicios de GPT no constituyen certificacion Lean. La generacion empleo temperatura 1.0, top-p 0.95, top-k 20, min-p 0, penalizacion de presencia 1.5, penalizacion de frecuencia 0 y penalizacion de repeticion 1.0, con contexto de 32.768 tokens. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 19-20 GB solo para pesos en BF16 (el repositorio ocupa 19,3 GB), mas cache KV; en cuantizacion de 8 bits serian aproximadamente 10-11 GB y en 4 bits alrededor de 5-6 GB, si bien el autor no publica cuantizaciones ni recetas de cuantizacion.
- GPUs recomendadas: el entrenamiento se realizo sobre ocho GH200; para inferencia en BF16 son adecuadas A100 40/80 GB, H100 80 GB, L40S 48 GB o GH200. El modelo no cabe en GPUs de consumo de 8-12 GB en BF16.
- Cabe en GPU de consumo: no en BF16 sin cuantizar; en teoria si en tarjetas de 24 GB (RTX 3090, RTX 4090) en cuantizaciones de 8 o 4 bits, aunque no hay soporte de cuantizacion documentado por el autor ni pesos GGUF publicados.
- Opciones de despliegue: vLLM con soporte de Qwen3.5 (el autor verifico la evaluacion con vLLM 0.19.1 y recomienda `--reasoning-parser qwen3`) y Transformers con soporte de Qwen3.5 (carga estandar verificada con Transformers 5.13.0). Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles. Como referencia de orden de magnitud, los presupuestos de salida de las evaluaciones son de 16.384 y 24.576 tokens incluyendo pensamiento, con un presupuesto de contexto de 32.768 tokens, lo que implica generaciones largas por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-equational-theory-sair-r3-mix30m | 9,65B | 32.768 tokens en generacion (no confirmado como contexto oficial) | apache-2.0 | 46,97% etapa 1 a 16K; 67,31% a 24K; 20,00%/20,08% etapa 2 | Pesos safetensors BF16 en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | no disponible en la informacion proporcionada | no disponible para tareas SAIR en la informacion proporcionada | Modelo base publico de Alibaba Cloud, revision fijada `c2022362...` |
| violetxi/qwen35-9b-equational-theory-sair-r3-mix3m | no disponible | no disponible | no disponible | no disponible | Variante publicada por el mismo autor con mezcla de 3M tokens |
| violetxi/qwen35-9b-equational-theory-sair-r3-mix1m | no disponible | no disponible | no disponible | no disponible | Variante publicada por el mismo autor con mezcla de 1M tokens |
| violetxi/qwen35-9b-wmrl-v4-kl-mix30m | 9B (fine-tune de Qwen3.5-9B) | no disponible | apache-2.0 | no disponible | Fine-tune del mismo autor sobre otro dominio (corpus sintetico juridico) |

No se dispone de datos comparativos con modelos de razonamiento matematico-formal de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo muy especializado: el entrenamiento se centra en notas de teoria ecuacional y trayectorias SAIR, por lo que el rendimiento fuera de ese dominio puede degradarse respecto al base.
- La validez juzgada en la etapa 2 apenas supera el 20%, y el juez es un LLM (GPT-5.6-sol en modo `high`), no un certificador Lean; el propio autor advierte que los juicios de GPT no constituyen certificacion formal.
- Dependencia del presupuesto de salida: la precision en etapa 1 pasa de 46,97% a 67,31% al ampliar el presupuesto de 16K a 24K tokens, lo que indica sensibilidad al truncamiento del razonamiento.
- Riesgo de alucinacion en pruebas formales: al no existir filtro de correccion ni rechazo de respuestas truncadas por longitud durante el entrenamiento, el modelo puede producir argumentaciones plausibles pero invalidas.
- Sesgos conocidos: no disponible. El autor no documenta analisis de sesgo ni composicion demografica del dataset.
- Idiomas soportados: no disponible; no se documenta cobertura multilingue especifica del fine-tune.
- Licencia Apache 2.0, por lo que el uso comercial esta permitido; conviene revisar igualmente las condiciones del modelo base Qwen3.5-9B del que deriva.
- Reproducibilidad: el conjunto de evaluacion completa esta alojado en un dataset privado con acceso restringido, lo que limita la verificacion independiente de las cifras publicadas.
- Fecha de creacion y actualizacion del repositorio: 24 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-r3-mix30m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Explorador publico de resultados y respuestas: https://huggingface.co/spaces/violetxi/equational-theory-trajectory-atlas
- Dataset de evaluacion (privado, requiere acceso): https://huggingface.co/datasets/violetxi/qwen35-9b-equational-theory-sair-r3-mix30m-eval
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/stanford_autonomous_agent/equational-theory-curated-r3-20260923/runs/eqr330m20260923r1
- Variante de mezcla 3M: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-r3-mix3m
- Variante de mezcla 1M: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-r3-mix1m
- Fine-tune relacionado del mismo autor (wmrl-v4-kl-mix30m): https://savrn.com/models/qwen35-9b-wmrl-v4-kl-mix30m
- Ficha tecnica del base Qwen3.5-9B: https://www.datalearner.com/ai-models/pretrained-models/qwen3-5-9b
- Especificaciones y requisitos de VRAM del base Qwen3.5-9B: https://apxml.com/models/qwen35-9b
