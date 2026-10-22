# XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.3

## Resumen

*gemma-4-E2B-it-agent-posttrain-v1.3* es un ajuste publicado por XcaliburMoon sobre *google/gemma-4-E2B-it* (familia Gemma 4 de Google DeepMind, 4.628.569.635 parámetros según los safetensors) cuyo único objetivo es emitir, en cada turno, exactamente una llamada a herramienta legible por máquina en formato JSON contra un menú fijo de diez herramientas simuladas. El runtime parsea el objeto de acción, ejecuta la herramienta y reinyecta el resultado como observación. No es un modelo de chat general: es un artefacto de investigación ligado a un harness concreto y no debe usarse donde una respuesta no parseable pudiera ejecutarse.

Su relevancia es metodológica más que de producto: demuestra un post-entrenamiento agéntico de coste mínimo (QLoRA de 4 bits, 91 registros supervisados, 0,1 horas en una RTX 4090) publicando todo el rastro del proceso. Se distribuye en tres formatos: modelo fusionado en bf16 para Transformers, adaptador LoRA de 96,7 MB y seis cuantizaciones GGUF para llama.cpp. Está limitado al inglés y hereda los Gemma Terms of Use de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Gemma 4); la base es multimodal según Google DeepMind, usado aquí como generador de texto |
| Parámetros totales | 4.628.569.635 (~4,63 B, dato real de safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (entrenado con secuencias de 768 tokens; el ejemplo de despliegue con llama.cpp usa 4096) |
| Tipos de cuantización | bf16 (modelo fusionado); QLoRA 4-bit nf4 con doble cuantización (solo entrenamiento); GGUF Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | No declarada en los metadatos; el README indica que hereda los Gemma Terms of Use de Google |
| Formato de pesos | safetensors (merged-bf16 y adaptador LoRA), GGUF |
| Tamaño del repositorio | 32,3 GB (incluye directorios de checkpoints no listados en la card) |
| Fecha de publicación | 22 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso (no MoE) de la familia Gemma 4. Según Google DeepMind y Qualcomm AI Hub, los Gemma 4 son modelos multimodales que aceptan texto e imagen de entrada (con audio en los modelos pequeños) y generan texto; este derivado se explota únicamente como modelo de generación de texto con pipeline *text-generation*.

El entrenamiento se realizó con QLoRA de 4 bits (nf4, doble cuantización), continuando desde los pesos fusionados de la v1.1, con LoRA r=16, alpha=32 y dropout 0,05. Se usaron 91 registros supervisados, longitud de secuencia 768, batch efectivo 8, 6 épocas, learning rate 5e-05 y 72 pasos, con una pérdida final de 0,1280 en 0,1 horas sobre una NVIDIA GeForce RTX 4090. La receta v1.2 aplica una máscara explícita para que la pérdida cubra solo la completación y no el contexto. No se ejecutó ninguna etapa de preferencias (sin RLHF ni DPO). La plantilla de chat se aplica con `enable_thinking=False`, es decir, sin modo de razonamiento extendido. El *repair pass* de la v1.2 (~100 filas, estimado en 40 minutos sobre una RTX 3090, unos 0,15 dólares) está planificado pero aún sin entrenar.

## Capacidades

- Emisión de exactamente una llamada a herramienta por turno como objeto JSON único, del tipo `{"action": "tool", "tool": "read_file", "args": {"path": "notes.txt"}}`.
- Operación sobre una superficie fija de diez herramientas simuladas, ofrecidas como menú en el system prompt; cualquier herramienta fuera de ese menú es desconocida para el modelo.
- Integración en bucle agéntico: el runtime parsea la acción y devuelve el resultado de la herramienta como observación.
- Tool calling basado en prompt (menú de herramientas en el system prompt), no mediante el mecanismo nativo de function calling de las APIs de inferencia.
- Modo thinking desactivado: la plantilla de chat se aplica con `enable_thinking=False`.
- Sin etapa de preferencias: no hay RLHF ni DPO en su receta de entrenamiento.
- Limitado al inglés, a tareas cortas y a una llamada por turno.
- No es un modelo de chat general ni está pensado para respuestas en lenguaje natural no estructuradas.
- Las capacidades de visión y audio de la base Gemma 4 no se explotan en este derivado.

## Casos de uso

- **Evaluación de harnesses de tool-calling**: la herramienta `tools-pair-builder` del repositorio origen construye el prompt y mide la respuesta sin ejecutar nada, lo que permite medir de forma reproducible tasas de herramienta incorrecta y de valor incorrecto.
- **Investigación docente en post-entrenamiento de bajo coste**: el pipeline QLoRA completo está documentado (91 registros, 72 pasos, 0,1 h en RTX 4090), lo que lo hace ideal como ejercicio reproducible de fine-tuning agéntico en una sola GPU de consumo.
- **Baseline para etapas de preferencias (DPO)**: el propio autor identifica que los fallos medidos (elección errónea de herramienta o de argumento en herramientas con descripciones parecidas) son justo los que corrige una etapa de preferencias; el modelo sirve como punto de partida medible.
- **Prototipado de bucles agénticos locales**: con `llama-server` y contexto de 4096 tokens puede montarse un agente que parsea el JSON y devuelve observaciones simuladas, sin depender de APIs de pago.
- **Estudio del impacto de la cuantización en salida estructurada**: las seis cuantizaciones GGUF (de Q2_K a Q8_0) permiten medir cómo degrada la validez del JSON y la elección de herramienta frente al merged-bf16, algo que la propia card recomienda evaluar.
- **Pruebas de regresión entre versiones**: la etiqueta `v1.1` fija los pesos previos al reemplazo de `main`, lo que facilita comparaciones antes/después en benchmarks propios.
- **Demostración educativa de agentes**: en talleres o docencia, muestra de forma contenida cómo un LLM emite acciones estructuradas que un runtime interpreta, con riesgo contenido al operar sobre herramientas simuladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un directorio de ejecución de benchmarks y describe cualitativamente los fallos medidos (elección de herramienta incorrecta y de valor incorrecto en herramientas con descripciones parecidas), pero sin cifras. La pérdida final de 0,1280 es una métrica de entrenamiento, no un benchmark.

## Requisitos de hardware

- **merged-bf16 (10,21 GB en safetensors)**: unos 11-12 GB de VRAM estimados para inferencia en bf16 con contexto corto; cabe en una RTX 4090 o RTX 3090 (24 GB), o en CPU con 16 GB de RAM.
- **Adaptador LoRA (96,7 MB)**: cargable sobre el modelo base con Transformers y PEFT, con coste de memoria adicional mínimo.
- **GGUF Q4_K_M (3,42 GB)**: estimados 4-5 GB de VRAM o ejecución directa en CPU; cabe en GPUs de consumo de 8 GB (RTX 4060, RTX 3060 Ti) y en portátiles.
- **GGUF Q8_0 (4,95 GB)**: estimados 6-7 GB de VRAM; Q2_K (2,98 GB) es la opción más ligera, a costa de mayor degradación de calidad.
- **Entrenamiento**: QLoRA 4-bit documentado sobre una NVIDIA GeForce RTX 4090 en 0,1 h; el repair pass planificado se estima en 40 minutos sobre una RTX 3090.
- **Despliegue**: llama.cpp documentado (`llama-server -m gguf/gemma-agent-Q4_K_M.gguf --port 8080 --ctx-size 4096`); Transformers con el merged-bf16 o el adaptador; los GGUF deberían funcionar en runtimes compatibles (Ollama, LM Studio). vLLM y TGI no aparecen documentados.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No aparecen en la búsqueda fine-tunes de terceros equivalentes; la comparación más útil es con su modelo base y su versión previa.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-agent-posttrain-v1.3 (este) | 4,63 B (safetensors) | No disponible (768 en entrenamiento; 4096 en el ejemplo de despliegue) | Llamadas a herramientas JSON sobre 10 herramientas simuladas | Gemma Terms of Use (según README) | safetensors, LoRA y 6 GGUF públicos |
| google/gemma-4-E2B-it (base) | No disponible | No disponible | Chat general multimodal (texto e imagen; audio en modelos pequeños, según Qualcomm) | Gemma | Pesos abiertos de Google DeepMind |
| gemma-4-E2B-it-agent-posttrain-v1.1 (predecesor) | No disponible | No disponible | Misma tarea agéntica, sin la receta v1.2 de máscara explícita de completación | Gemma Terms of Use | Pesos fijados en la etiqueta v1.1 del repositorio |

## Limitaciones y advertencias

- Entrenado sobre una única superficie de diez herramientas simuladas: una herramienta que no esté en el menú no existe para el modelo.
- Solo SFT, sin etapa de preferencias: los fallos medidos son elección de herramienta y de valor incorrectas en herramientas con descripciones parecidas.
- El repair pass orientado a corregir esos fallos está planificado pero sin entrenar.
- Las observaciones durante el entrenamiento eran fixtures: el modelo nunca vio salida real de shell, por lo que puede estar equivocado con total seguridad sobre lo que devolvió un comando.
- Solo inglés, tareas cortas y una llamada por turno.
- No es un modelo de chat general: no debe usarse donde una respuesta no parseable pudiera actuar.
- Los GGUF tienen pérdida respecto al merged-bf16; la card recomienda evaluar la cuantización que se vaya a desplegar, no la mejor de la tabla.
- Dataset mínimo (91 registros): riesgo alto de sobreajuste y de distribución muy estrecha.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha.
- Licencia: al derivar de Gemma de Google, carry los Gemma Terms of Use; hay que revisarlos antes de redistribuir o desplegar comercialmente.

## Enlaces

- Ficha del modelo: https://huggingface.co/XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.3
- Repositorio previo de la serie: https://huggingface.co/XcaliburMoon/gemma-4-E2B-it-agent-posttrain
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Gemma 4 — Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Gemma-4-E2B-it — Qualcomm AI Hub: https://aihub.qualcomm.com/models/gemma_4_e2b_it
- Registro de terceros de la v1.1: https://free2aitools.com/model/xcaliburmoon/gemma-4-e2b-it-agent-posttrain-v1.1
