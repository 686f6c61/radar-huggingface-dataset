# xiaozhengzhong/Qwen3-8B-Tieba-Magic-LoRA

## Resumen

Qwen3-8B-Tieba-Magic-LoRA es un adaptador LoRA (QLoRA de 4 bits) desarrollado por el usuario xiaozhengzhong sobre el modelo base Qwen3-8B, en su variante cuantizada de Unsloth (`unsloth/Qwen3-8B-unsloth-bnb-4bit`). No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que modifica el estilo de respuesta del modelo base para imitar el registro lingüístico de los foros chinos Baidu Tieba y, en particular, del subforo satírico Ruozhiba ("bar de los débiles mentales"). El objetivo declarado es eliminar el tono enciclopédico y la estructura en listas numeradas del modelo original y sustituirlo por respuestas cortas (50-90 caracteres) que, ante preguntas absurdas, continúan la lógica disparatada del usuario en lugar de corregirla.

El repositorio incluye dos etapas de entrenamiento: la raíz contiene los pesos de la etapa 2 (denominada "流派B: 用魔法打败魔法", es decir, "magia contra magia"), que prioriza la réplica absurda y el humor frío; el subdirectorio `round1_lora_adapter/` conserva los pesos de la etapa 1, que mantienen respuestas más informativas con jerga de foro. El adaptador entrena 87,29 millones de parámetros, un 1,05 % de los 8,28 mil millones del modelo base, mediante QLoRA de 4 bits con rango 32 sobre módulos de atención y MLP.

La relevancia de este modelo es acotada y experimental: demuestra cómo un ajuste fino ligero sobre un modelo de 8B puede reorientar radicalmente el estilo de generación con muy pocos datos (5.000 ejemplos en la etapa 1 y 1.280 en la etapa 2), y resulta útil como caso de estudio de personalización de tono y de evaluación subjetiva de estilo en chino. No está pensado como modelo de propósito general ni como sustituto del Qwen3-8B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA sobre atención y MLP |
| Parametros totales | 8,28 mil millones (modelo base); 87,29 millones entrenables en el adaptador (1,05 %) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B; el ejemplo de inferencia usa `max_seq_length=512`) |
| Tipos de cuantizacion | QLoRA de 4 bits NF4 para el entrenamiento; el adaptador se distribuye en safetensors (el modelo base se carga en 4 bits o fp16) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`) más ficheros de tokenizador |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8,28 mil millones de parámetros. La modificación se realiza mediante QLoRA de 4 bits NF4 con `r=32`, `lora_alpha=32`, `lora_dropout=0` y `bias="none"`, sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se hizo en dos etapas. La etapa 1 usó 5.000 ejemplos mixtos de Tieba y Ruozhiba procedentes de `LooksJuicy/ruozhiba`, del subconjunto Ruozhiba/Zhihu de `m-a-p/COIG-CQIA` y de `Kirp/ruozhiba_post_annual`, con 300 ejemplos de validación, durante 200 pasos con `learning_rate=2e-4`, alcanzando `train_loss=1,7483` y `eval_loss=1,7364`. La etapa 2 usó 1.280 ejemplos específicos del estilo "magia contra magia" durante 80 pasos con `learning_rate=1,5e-4`, y la pérdida de entrenamiento bajó de 3,3462 a un rango de 0,8292-0,8828 (media global de 1,2032).

El entrenamiento se ejecutó con `adamw_8bit`, scheduler coseno, `per_device_train_batch_size=4` y `gradient_accumulation_steps=4` (batch efectivo de 16), sobre una única GPU NVIDIA Tesla T4 de 16 GB en Google Colab. No se documenta uso de RLHF ni DPO; se trata de SFT supervisado con TRL y Unsloth. La innovación principal no es arquitectónica sino de datos y de formato: la etapa 2 elimina deliberadamente el tono de manual y fuerza respuestas de 50-90 caracteres que desarrollan la premisa absurda del usuario, y el ejemplo de inferencia recomienda desactivar el modo de razonamiento de Qwen3 (`enable_thinking=False`) para obtener la respuesta directa.

## Capacidades

- Generación de texto conversacional en chino con registro de foro (Tieba/Ruozhiba).
- Respuestas de estilo "magia contra magia": continúa y exagera la lógica absurda de la pregunta en lugar de corregirla.
- Producción de réplicas cortas y directas (50-90 caracteres), sin listas numeradas ni estructura de manual.
- Humor frío, sarcasmo y jerga de foro chino (黑话).
- La etapa 1 conserva capacidad de respuesta informativa y cotidiana con apertura en jerga de foro.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión ni audio.
- Multilingüismo limitado al chino según la model card.
- El modo de pensamiento (thinking) de Qwen3 debe desactivarse para el estilo objetivo, según el ejemplo del autor.

## Casos de uso

- Generación de contenido satírico para comunidades chinas: el adaptador produce réplicas de 50-90 caracteres con jerga de Tieba, adecuadas para hilos de foro, bots de comunidad o cuentas de humor donde se busca el registro auténtico y no una respuesta correcta.
- Investigación sobre estilo y personalización: permite estudiar cómo un ajuste de 87,29 millones de parámetros (1,05 % del total) reorienta el tono de un modelo de 8B con solo 1.280 ejemplos en la etapa final, útil para experimentos de control de estilo.
- Evaluación de robustez frente a preguntas absurdas: sirve como contrapunto controlado al modelo base para medir cómo cambia la tasa de respuestas que "siguen la premisa" frente a las que la corrigen.
- Prototipado de personajes conversacionales: la etapa 1 (`round1_lora_adapter/`) ofrece un personaje de "forero que explica" con jerga de apertura, útil para bots de rol con tono marcado en chino.
- Docencia y divulgación sobre QLoRA: el repositorio documenta hiperparámetros, pérdidas por etapa y estructura de directorios, y se entrenó en una T4 de 16 GB, lo que lo convierte en un ejemplo replicable de ajuste fino de bajo coste.
- Filtrado y detección de estilo: las salidas del adaptador pueden usarse como corpus negativo/positivo para entrenar clasificadores de tono de foro o de detección de contenido satírico en chino.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor y no están verificados de forma independiente (`verified: false`).

| Benchmark | Metrica | Valor |
|---|---|---|
| Tieba & Ruozhiba 50-Question Benchmark | Tieba Persona & Slang Hit Rate (%) | 100 |
| Entrenamiento etapa 2 | Final Step Training Loss | 0,8292 |

El autor publica además una comparación cualitativa de seis preguntas entre el modelo base, la etapa 1 y la etapa 2, pero no ofrece métricas automáticas adicionales (MMLU, HumanEval, GSM8K u otras). No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en safetensors ocupa 0,7 GB; el modelo base en 4 bits requiere aproximadamente 5-6 GB de VRAM, y en fp16 en torno a 16-17 GB.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA Tesla T4 de 16 GB; para inferencia en 4 bits basta una RTX 3060 de 12 GB o superior; para fp16 se recomienda A100, H100 o RTX 4090 de 24 GB.
- Cabe en GPU de consumo: sí, en 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en fp16 requiere 24 GB o más.
- Opciones de despliegue: Transformers + PEFT (documentado por el autor), Unsloth (`FastLanguageModel`), y en principio cualquier runtime compatible con adaptadores LoRA sobre Qwen3-8B; no se documentan recetas específicas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El ejemplo usa `max_new_tokens=120`, `temperature=0.8`, `top_p=0.9` y `repetition_penalty=1.15`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-Tieba-Magic-LoRA | 8,28B (adaptador de 87,29M) | No disponible | Estilo Tieba/Ruozhiba en chino | Apache 2.0 | Hugging Face (PEFT) |
| Qwen/Qwen3-8B | 8,28B | No disponible en la informacion proporcionada | Modelo base generalista, multilingüe | Apache 2.0 | Hugging Face |
| Qwen3-8B-LoRA (mc36473) | 8,28B (adaptador) | No disponible | Ajuste sobre `stance_task_sharegpt` | No disponible | ModelScope |

La comparación con Qwen3-8B-LoRA es solo nominal: se trata de otro adaptador LoRA sobre el mismo modelo base, pero orientado a una tarea de postura (stance) y sin datos públicos de rendimiento en la información disponible. No se dispone de alternativas directamente comparables de estilo de foro chino con métricas publicadas.

## Limitaciones y advertencias

- Sesgos: el adaptador está entrenado sobre jerga de foro y humor satírico; puede producir respuestas ofensivas, estereotipadas o políticamente incorrectas, ya que el estilo objetivo imita el registro de Ruozhiba.
- Alucinación deliberada: el modelo está diseñado para responder con lógica absurda en lugar de información correcta; no debe usarse para consultas factuales, médicas, legales o técnicas.
- Contexto e idioma: solo chino; no se documenta la longitud de contexto efectiva tras el ajuste y el ejemplo de inferencia limita `max_seq_length` a 512.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y las dependencias (Unsloth, Qwen3) deben respetar sus propias condiciones; conviene revisar la licencia de Qwen3-8B antes de desplegar.
- Producción: el autor no verifica las métricas declaradas (`verified: false`); la tasa de acierto del 100 % procede de un conjunto fijo de 50 preguntas y no de una evaluación independiente.
- Estabilidad: el entrenamiento se hizo con 80 pasos en la etapa 2 y pérdida final de 0,8292-0,8828; el riesgo de sobreajuste al estilo y de respuestas repetitivas o incoherentes fuera del dominio de preguntas absurdas no está evaluado.
- Uso responsable: no apto para atención al cliente, educación ni asistencia donde se espere información veraz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiaozhengzhong/Qwen3-8B-Tieba-Magic-LoRA
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Qwen3-8B-unsloth-bnb-4bit
- Qwen3-8B original: https://huggingface.co/Qwen/Qwen3-8B
- Dataset LooksJuicy/ruozhiba: https://huggingface.co/datasets/LooksJuicy/ruozhiba
- Dataset m-a-p/COIG-CQIA: https://huggingface.co/datasets/m-a-p/COIG-CQIA
- Dataset Kirp/ruozhiba_post_annual: https://huggingface.co/datasets/Kirp/ruozhiba_post_annual
- Qwen3-8B-LoRA en ModelScope (referencia comparativa): https://www.modelscope.cn/models/mc36473/Qwen3-8B-LoRA/summary
