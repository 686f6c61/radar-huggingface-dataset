# Stage-jh-monitor/4b-A-200-luna-8k-epoch4

## Resumen

El modelo `4b-A-200-luna-8k-epoch4` es un checkpoint de investigación publicado por el usuario `Stage-jh-monitor` en HuggingFace. Se trata de un ajuste mediante aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-4B`, con 4.539.265.536 parámetros totales (~4,54 B) y pesos en formato safetensors. El repositorio ocupa 9,1 GB, un tamaño coherente con pesos en bf16/fp16 para ese número de parámetros. La ficha no incluye pipeline declarado, licencia, idiomas soportados ni descripción funcional: la única documentación disponible es un bloque de procedencia de entrenamiento (`jh-workflow-training-begin`/`end`) que registra el dataset, el comando y la configuración del entrenamiento.

El interés del modelo es principalmente metodológico y de trazabilidad: la model card documenta de forma explícita el pipeline de RL empleado, con el dataset `Stage-org/4b-A-200-luna-8k`, 10.000 pasos de learner, tamaño de lote 128 y una configuración de RL con `group_size = 8`, decodificación con `enable_thinking = true`, `max_tokens = 4096` y un juez externo identificado como `gpt-5.6-luna` para evaluación de respuestas abiertas. La configuración de inferencia de referencia usa vLLM con `max_model_len = 65536`, parser de razonamiento `qwen3` y parser de tool calling `qwen3_coder`, lo que sugiere soporte previsto de modo pensamiento y llamadas a herramientas.

Se trata, en todo caso, de un artefacto experimental: cero descargas, cero likes, sin resultados de evaluación publicados y sin licencia declarada. Cualquier uso en producción debería tratarse como no validado hasta que el autor publique especificaciones, licencia y métricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; derivada del modelo base `Qwen/Qwen3.5-4B` (etiqueta `qwen3_5`), familia transformer decoder |
| Parámetros totales | 4.539.265.536 (~4,54 B) |
| Parámetros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible oficialmente. La configuración de entrenamiento declara `seq_len = 300000` y la de inferencia `max_model_len = 65536` |
| Tipos de cuantización | No disponible (solo pesos safetensors; no se publican versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 9,1 GB |
| Pipeline declarado | No disponible |
| Fecha de creación / actualización | 2026-09-18 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Por la etiqueta `qwen3_5` y el modelo base declarado en la configuración (`Qwen/Qwen3.5-4B`), se trata de un transformer decoder de la familia Qwen3.5 con aproximadamente 4 B de parámetros, sobre el que se ha aplicado un ajuste por refuerzo. No se especifica si la atención es estándar, lineal o híbrida, ni el vocabulario, el número de capas o las dimensiones de los estados ocultos.

El entrenamiento se realizó con el pipeline interno `jh-workflow` sobre el dataset `Stage-org/4b-A-200-luna-8k` (tipo `new_task`), durante 10.000 pasos de learner y 3 épocas declaradas en la configuración (el nombre del checkpoint indica `epoch4`, una discrepancia que conviene verificar). La optimización usa AdamW con `lr = 1e-06`, `betas = (0,9; 0,99)`, `weight_decay = 0` y `max_norm = 1.0`; la atención emplea `flash_attention_2` y el entrenamiento se ejecuta con `weights_only = true` en los checkpoints. El bucle de RL usa `group_size = 8`, gestión de desviación de política con `max_off_policy_steps = 8`, una pérdida tipo DPPO con máscara entre 0,2 y 0,28, `adv_tau = 1.0` y penalización KL con `kl_tau = 0.001`. La generación durante el RL emplea `temperature = 0.9`, `top_p = 1.0` y `enable_thinking = true`. La evaluación de respuestas abiertas se delega en un juez externo (`gpt-5.6-luna`) con `reasoning_effort = "medium"` y hasta 32 peticiones concurrentes. No se documentan composición del dataset, número de tokens de entrenamiento ni si hubo fases previas de SFT o DPO.

## Capacidades

- Generación de texto y razonamiento en modo pensamiento: la configuración habilita `enable_thinking = true` y el parser de razonamiento `qwen3` en vLLM, lo que apunta a cadenas de razonamiento explícitas antes de la respuesta final.
- Llamada a herramientas (tool calling / function calling): la configuración de inferencia incluye `tool_call_parser = "qwen3_coder"`, lo que indica soporte previsto de invocación de funciones en formato compatible con Qwen.
- Razonamiento multi-paso y agentes: el bucle de entrenamiento contempla `max_inflight_rollouts = 256` y `max_off_policy_steps = 8`, coherente con políticas entrenadas para tareas de varios pasos, aunque no hay evaluación publicada que lo confirme.
- Generación de código: el uso del parser `qwen3_coder` sugiere orientación a tareas de código, pero no se aportan métricas ni ejemplos.
- Capacidades multilingües: no disponibles. No se declaran idiomas en la ficha.
- Visión, audio o multimodalidad: no disponibles. La configuración de inferencia especifica `language_model_only = true`, lo que indica que el despliegue de referencia es solo texto.
- No se documentan capacidades de instrucción general, seguridad, moderación ni formato estructurado (JSON schema, gramáticas).

## Casos de uso

- Evaluación de pipelines de RL: el modelo sirve como artefacto de referencia para reproducir o auditar una receta de RL con juez externo, grupo de 8 muestras y penalización KL, útil para equipos que investigan métodos de post-entrenamiento.
- Investigación en razonamiento con modo pensamiento: se puede analizar la calidad y la longitud de las cadenas de razonamiento generadas con `enable_thinking = true`, comparándolas con las del modelo base para medir el efecto del RL.
- Prototipado de agentes con tool calling en vLLM: la configuración de referencia ya define `tool_call_parser = qwen3_coder` y `max_model_len = 65536`, por lo que puede desplegarse en un servidor vLLM local para probar flujos de agente que encadenen llamadas a herramientas.
- Generación de código asistida en entornos controlados: con 4,5 B de parámetros y pesos bf16 (unos 9 GB), cabe en una GPU de 24 GB y permite autocompletado o generación de fragmentos en un IDE sin salir a servicios externos.
- Extracción y estructuración de texto en pipelines internos: puede emplearse para resumir o reformatear documentos largos si se confirma la ventana de contexto real, aunque la ausencia de licencia lo limita a uso interno de investigación.
- Base para ajuste específico de dominio: al ser un checkpoint de 4 B con pesos safetensors, es un punto de partida razonable para LoRA o ajuste completo sobre datos propios en una o dos GPUs.
- Comparación de configuraciones de decodificación: permite estudiar el efecto de `temperature`, `top_p` y `reasoning_effort` del juez sobre la calidad final, al estar todos los hiperparámetros documentados.
- Docencia y reproducción de experimentos: útil en cursos o talleres sobre RLHF/RLVR para ilustrar un caso real de configuración de entrenamiento con trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, ni comparaciones con el modelo base. Tampoco se aportan curvas de entrenamiento, valores de recompensa del juez ni métricas de convergencia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 4,54 B de parámetros, no confirmada por el autor):
  - bf16/fp16: en torno a 9,1 GB solo en pesos, más caché KV y activaciones; presupuestar 12-14 GB para secuencias cortas.
  - int8/fp8: en torno a 4,5-5 GB de pesos más caché KV.
  - int4: en torno a 2,5-3 GB de pesos; requiere cuantizar manualmente, ya que no se publican versiones cuantizadas.
- GPU recomendadas:
  - NVIDIA RTX 4090 (24 GB): ejecución en bf16 sin cuantizar con comodidad para contextos moderados.
  - NVIDIA A100 40/80 GB o H100: despliegue con lotes grandes y contexto largo, especialmente si se usa la ventana de 65.536 tokens declarada.
  - GPUs consumer de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super, RTX 4080): viables solo con cuantización int8/int4 o secuencias cortas.
- Opciones de despliegue: vLLM es la ruta documentada en la propia configuración (`language_model_only = true`, `reasoning_parser = qwen3`, `tool_call_parser = qwen3_coder`, `gpu_memory_utilization = 0.9`, puerto 7000). TGI y SGLang deberían funcionar al ser pesos safetensors estándar, pero no están documentados. llama.cpp y Ollama requieren convertir los pesos a GGUF, algo que el autor no ha publicado.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus fichas públicas y pueden variar según la versión consultada. Para este modelo, los campos marcados como no disponibles reflejan la ausencia de información en la ficha de origen.

| Modelo | Parámetros | Contexto | Licencia | Formatos |
|---|---|---|---|---|
| 4b-A-200-luna-8k-epoch4 | 4,54 B | No confirmado (65.536 en config de inferencia) | No disponible | safetensors |
| Qwen3-4B | 4,0 B | 32.768 nativo, ampliable a 131.072 con YaRN | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B Instruct | 3,2 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF |
| Phi-3.5-mini-instruct | 3,8 B | 131.072 | MIT | safetensors, GGUF |

Frente a estas alternativas, el modelo analizado no ofrece datos de rendimiento, no declara licencia y no publica cuantizaciones, por lo que la comparación se limita al tamaño y al formato. Cualquier elección entre ellos debería basarse en una evaluación propia, dado que aquí no hay métricas públicas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial. Tratar como uso exclusivamente de investigación hasta que el autor aclare los términos.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación de seguridad, ni análisis de sesgos. No hay evidencia publicada de que el ajuste por RL haya mejorado al modelo base.
- Riesgo de alucinación: al ser un modelo de 4,5 B ajustado con RL sobre un dataset no descrito, la tasa de fabricación de hechos es desconocida y potencialmente alta en dominios especializados.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas distintos del inglés; el dataset de entrenamiento no se documenta.
- Ambigüedad en la configuración de longitud: la configuración de entrenamiento declara `seq_len = 300000` mientras la de inferencia declara `max_model_len = 65536`. La ventana de contexto efectiva no está confirmada y usar secuencias largas puede degradar la calidad.
- Discrepancia de épocas: el nombre del checkpoint indica `epoch4` mientras la configuración declara `learner_epoch = 3`. Conviene verificar qué checkpoint corresponde realmente a qué fase.
- Dependencia de un juez propietario: la señal de recompensa del RL proviene de un modelo externo identificado como `gpt-5.6-luna`. Esto introduce posible contaminación de estilo y sesgos heredados del juez, además de hacer el entrenamiento difícil de reproducir sin acceso a dicho servicio.
- Dataset opaco: `Stage-org/4b-A-200-luna-8k` se declara como tipo `new_task` sin descripción de composición, procedencia ni licencia de los datos. No puede descartarse contaminación de benchmarks ni material con derechos.
- Despliegue en producción no recomendado: sin cuantizaciones oficiales, sin pipeline declarado y con cero adopción, no hay evidencia de estabilidad ni de soporte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-jh-monitor/4b-A-200-luna-8k-epoch4
- Dataset referenciado en la configuración de entrenamiento (no verificado): https://huggingface.co/Stage-org/4b-A-200-luna-8k
- Modelo base referenciado en la configuración de entrenamiento (no verificado): https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio del autor: no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo.
