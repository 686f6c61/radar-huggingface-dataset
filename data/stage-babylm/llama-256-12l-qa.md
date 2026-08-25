# stage-babylm/llama-256-12L-qa

## Resumen

El modelo `stage-babylm/llama-256-12L-qa` es un ajuste fino (fine-tune) de `stage-babylm/llama-256-12L`, un modelo de lenguaje de tamaño muy reducido con 9,9 millones de parámetros, desarrollado en el marco del proyecto BabyLM. Este proyecto investiga el aprendizaje del lenguaje con cantidades de datos comparables a la exposición lingüística infantil, en contraste con los conjuntos de datos masivos que se usan habitualmente en la industria.

El modelo base sigue una arquitectura Llama con una dimensión de embedding de 256 y 12 capas, y una ventana de contexto de 2.000 tokens. La variante `-qa` ha sido entrenada específicamente para tareas de preguntas y respuestas, aunque el conjunto de datos de fine-tuning no se ha especificado. Su relevancia radica en servir como banco de pruebas para estudiar si modelos de tamaño mínimo pueden adquirir competencias de QA con recursos computacionales escasos, y como referencia para la comunidad BabyLM.

La ficha de la model card está generada automáticamente por el Trainer de HuggingFace, por lo que muchos detalles técnicos (licencia, idiomas, dataset de entrenamiento) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder-only transformer) |
| Parametros totales | 9.949.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `llama-256-12L` es un transformer decoder-only con arquitectura Llama, con dimension de embedding 256 y 12 capas, entrenado con datos de dominio limitado en el contexto de la competicion BabyLM. Sobre este base se ha realizado un fine-tuning con los siguientes hiperparametros: learning rate de 2e-5, batch size de 16, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler de coseno con warmup del 10% y 3 epocas, usando precision mixta (Native AMP). El dataset de fine-tuning no se ha publicado.

La perdida de validacion descendio de 2,5935 al inicio a 1,7426 al final de las 3.405 pasos de entrenamiento, mostrando una convergencia progresiva pero sin alcanzar valores extremadamente bajos, lo que es esperable en un modelo de este tamano. No se han documentado tecnicas de alineacion adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto: el modelo puede generar texto de forma autoregresiva, aunque con un vocabulario y una coherencia limitados por su tamano.
- Preguntas y respuestas: el fine-tuning especifico sugiere que ha sido optimizado para responder preguntas, aunque no se han publicado evaluaciones independientes.
- Razonamiento basico: modelos de 10M de parametros solo pueden manejar patrones linguisticos simples; el razonamiento multi-paso esta fuera de su alcance.
- Multilingue: no se ha especificado que idiomas soporta.
- Tool calling y agentes: no se ha confirmado soporte para function calling ni flujos de agente.
- Vision y audio: no aplica, es un modelo solo de texto.

## Casos de uso

- Investigacion en aprendizaje de lenguaje: el modelo permite estudiar como un modelo de 10M de parametros puede adquirir competencias de QA con datos limitados, en el contexto de la competicion BabyLM.
- Prototipado de pipelines de QA: su tamano minimo lo hace ideal para validar pipelines de fine-tuning, evaluacion y despliegue antes de escalar a modelos mayores.
- Pruebas de integracion: sirve para verificar que una infraestructura de inferencia (vLLM, TGI, Ollama) funciona correctamente con un modelo ligero y de despliegue instantaneo.
- Docencia en PLN: permite demostrar conceptos de fine-tuning, transferencia de aprendizaje y evaluacion de modelos de lenguaje en entornos academicos con recursos limitados.
- Generacion de texto de baja exigencia: aplicaciones simples como completar frases o generar texto de ejemplo con un vocabulario restringido.
- Comparacion de tecnicas de fine-tuning: al ser un modelo pequeno y rapido de entrenar, se puede usar para comparar configuraciones de hiperparametros, estrategias de cuantizacion o metodos de adaptacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo-index de HuggingFace declara una lista de resultados vacia. La unica metrica declarada es la perdida de validacion de 1,7426 tras el fine-tuning, pero no se han evaluado tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 9,9 millones de parametros, el peso en FP32 ocupa aproximadamente 40 MB; en INT8 alrededor de 10 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso las integradas de portatil pueden ejecutar el modelo sin problemas.
- Ejecucion en CPU: el modelo puede ejecutarse en CPU sin GPU, con latencias del orden de milisegundos por token.
- Opciones de despliegue: Transformers (libreria `transformers`), text-generation-inference (el repositorio indica compatibilidad con endpoints), llama.cpp y Ollama.
- Throughput: al ser un modelo de tamano minimo, puede servir cientos de peticiones por segundo en una GPU consumer, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `stage-babylm/llama-256-12L-qa` | 9,9 M | 2 K | no disponible | Fine-tuning para QA de `llama-256-12L` |
| `stage-babylm/llama-256-12L` | 9,9 M | 2 K | no disponible | Modelo base del proyecto BabyLM |
| `stage-babylm/llama-256-12L-pairwise` | 9,9 M | 2 K | no disponible | Otra variante del mismo base, orientada a preferencias |

No se dispone de datos de benchmarks para ninguno de estos modelos, por lo que no es posible una comparacion cuantitativa. Modelos de tamano similar fuera del ecosistema BabyLM (por ejemplo, TinyStories o GPT-2 pequeno) no son directamente comparables por falta de datos publicados.

## Limitaciones y advertencias

- El tamano de 10M de parametros limita severamente la capacidad de razonamiento, la coherencia en textos largos y el conocimiento general del mundo.
- El dataset de fine-tuning no esta especificado, por lo que no se puede evaluar el dominio de la QA ni los posibles sesgos introducidos.
- No se especifica la licencia, lo que impide su uso comercial sin confirmacion explicita del autor.
- La ventana de contexto de 2.000 tokens es corta para tareas que requieren documentos extensos o conversaciones de multiples turnos.
- No se han publicado resultados de benchmarks, por lo que el rendimiento en tareas estandar es desconocido.
- La model card esta generada automaticamente y carece de informacion sobre limitaciones, sesgos o uso previsto.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de QA con conocimiento factual.
- No se han publicado datos sobre el vocabulario del tokenizador ni la cobertura multilingue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stage-babylm/llama-256-12L-qa
- Modelo base: https://huggingface.co/stage-babylm/llama-256-12L
- Modelo pairwise (variante): https://huggingface.co/stage-babylm/llama-256-12L-pairwise
- Proyecto BabyLM: https://babylm.github.io/
- Ficha en LLM Explorer: https://llm-explorer.com/model/stage-babylm%2Fllama-256-12L,4vgJZ3YJmVeKTcmy13nOBz
