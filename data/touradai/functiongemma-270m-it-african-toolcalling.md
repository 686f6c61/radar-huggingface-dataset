# TouradAi/functiongemma-270m-it-african-toolcalling

## Resumen

`TouradAi/functiongemma-270m-it-african-toolcalling` es un ajuste fino (fine-tuning) del modelo `unsloth/functiongemma-270m-it`, que a su vez deriva de la familia Gemma 3 en su variante de texto (`gemma3_text`). Lo desarrolla el usuario TouradAi y está pensado, segun el nombre del repositorio, para mejorar las capacidades de *tool calling* (llamada a funciones) en contextos africanos. El modelo tiene 268.098.176 parámetros (~270 M) y se distribuye con licencia Apache 2.0.

Se trata de un modelo muy pequeño, orientado a generación de texto y a la integración en pipelines de *function calling* donde el coste de inferencia y la latencia sean críticos. Al estar construido sobre la arquitectura Gemma 3 de texto, hereda su tokenizador y su formato de conversación, lo que facilita su integración con `transformers` y con Text Generation Inference (TGI).

La relevancia de este modelo radica en su tamaño reducido (~0,6 GB en safetensors), que permite desplegarlo en hardware modesto, y en su especialización declarada en *tool calling*. No obstante, la model card es extremadamente escueta y no aporta detalles sobre el dataset de ajuste, los hiperparámetros ni los resultados obtenidos, por lo que la evaluación de su calidad real requiere pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante `gemma3_text`) |
| Parametros totales | 268.098.176 (~270 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | ingles (`en`) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3 en su variante exclusivamente de texto (`gemma3_text`), con 268 millones de parámetros. Se ha obtenido mediante un ajuste fino supervisado sobre `unsloth/functiongemma-270m-it`, un modelo base ya orientado a *function calling*. El entrenamiento se realizó con la librería Unsloth y TRL de Hugging Face, segun indica la model card, lo que sugiere un proceso de fine-tuning eficiente en memoria (posiblemente con LoRA/QLoRA, aunque no se especifica).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO ni de innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). La model card no documenta hiperparámetros ni detalles del corpus utilizado para el ajuste "africano", por lo que no es posible verificar el alcance real de la especialización.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Gemma 3 de texto.
- *Tool calling* / *function calling*: capacidad declarada en el nombre del modelo y en su modelo base, orientada a la invocación estructurada de funciones.
- Razonamiento multi-paso y uso en agentes: no documentado explícitamente; depende de lo heredado del base.
- Capacidades multilingües: limitadas al inglés según la model card; el etiquetado "african" no va acompañado de una lista de idiomas soportados.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; la variante es solo de texto.
- Integración con TGI y `transformers`: soportada por los tags del repositorio.

## Casos de uso

- **Enrutamiento de llamadas a funciones en asistentes ligeros**: el modelo puede clasificar la intención del usuario y emitir una llamada estructurada a una API (por ejemplo, consultar el tiempo o crear un recordatorio), con un coste de inferencia muy bajo gracias a sus ~270 M de parámetros.
- **Agentes embebidos en dispositivos con recursos limitados**: al ocupar ~0,6 GB en safetensors y ser apto para cuantización, puede desplegarse en CPU o GPU de gama baja para tareas de *tool calling* en local.
- **Preprocesado de comandos en pipelines de automatización**: uso como primer eslabón que transforma lenguaje natural en JSON de parámetros antes de invocar servicios internos, reduciendo la carga sobre modelos mayores.
- **Prototipado rápido de asistentes conversacionales**: su compatibilidad con `transformers` y TGI permite iterar con pocos recursos y validar flujos de conversación antes de escalar a modelos mayores.
- **Investigación sobre *function calling* multilingüe en contextos africanos**: sirve como punto de partida para experimentos de ajuste sobre idiomas y dominios africanos, aunque la model card no documente qué idiomas cubre realmente.
- **Generación de texto corto y clasificación**: tareas de resumen breve, extracción de entidades o clasificación de intenciones en inglés, donde el tamaño reducido es una ventaja en latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp16, ~0,54 GB de pesos más overhead de activaciones y KV cache; en la práctica, menos de 2 GB para contextos moderados. En cuantización de 8 bits o 4 bits, por debajo de 1 GB.
- **GPU recomendadas**: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también cabe en GPUs de gama baja y en CPU.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM; incluso en iGPU y CPU con llama.cpp.
- **Opciones de despliegue**: `transformers`, Text Generation Inference (TGI), vLLM (si se convierte a formato compatible), llama.cpp/Ollama (requiere generar GGUF, no publicado en el repo).
- **Latencia y throughput**: no disponibles en la información proporcionada; por el tamaño, se espera latencia muy baja y alto throughput en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| TouradAi/functiongemma-270m-it-african-toolcalling | ~270 M | no disponible | Apache 2.0 | Tool calling (fine-tune) |
| unsloth/functiongemma-270m-it (base) | ~270 M | no disponible | Apache 2.0 (segun repo derivado) | Tool calling |
| Gemma 3 (variantes mayores) | 1B–27B | no disponible | Gemma Terms of Use | Proposito general |
| Modelos de tool calling de ~0,5–1B (p. ej. variantes de Qwen) | ~0,5–1B | no disponible | variable | Tool calling |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado benchmarks. La principal diferencia frente al base es el ajuste específico declarado en el nombre, sin documentación que lo respalde.

## Limitaciones y advertencias

- Model card prácticamente vacía: no se documentan dataset, hiperparámetros, evaluación ni idiomas cubiertos por el ajuste "africano".
- Idiomas: la model card declara únicamente inglés, pese a la etiqueta "african" del nombre; el soporte multilingüe real es desconocido.
- Riesgo de alucinación: inherente a modelos pequeños; en *tool calling* puede generar funciones o parámetros inexistentes.
- Sesgos: no documentados; al derivar de Gemma 3, puede heredar sesgos del corpus original.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (`unsloth/functiongemma-270m-it`) y de la familia Gemma 3 de la que deriva.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en llama.cpp/Ollama requiere conversión propia.
- Contexto máximo no confirmado: no se debe asumir la ventana de Gemma 3 sin verificar la configuración del tokenizador y del modelo.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/TouradAi/functiongemma-270m-it-african-toolcalling
- Modelo base: https://huggingface.co/unsloth/functiongemma-270m-it
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
