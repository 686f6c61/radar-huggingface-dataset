# Zeref8425/Llama-3.2-3B-DEFER

## Resumen

Llama-3.2-3B-DEFER es un adaptador LoRA desarrollado por Zeref8425 sobre el modelo base `meta-llama/Llama-3.2-3B-Instruct`. Su objetivo es corregir un problema habitual en modelos pequeños: cuando se les entrega un pasaje de texto y se les hace una pregunta cuya respuesta está en ese pasaje, tienden a responder desde su memoria interna en lugar de ceñirse al documento. Este adaptador entrena al modelo para que confíe en el pasaje proporcionado como única autoridad y, cuando el pasaje no contiene la respuesta, se abstenga de responder con una frase canónica.

El modelo se publica como "seed 0", elegida antes de ver resultados, para evitar sesgos de selección. Se entrenó con QLoRA sobre una GPU T4 gratuita de Kaggle, usando 2.168 filas de SQuAD 2.0 con una proporción 1:1 entre preguntas respondibles y no respondibles. Los resultados muestran una mejora sustancial en el seguimiento de conflictos (del 82,2% al 96,3%) y en la abstención ante preguntas sin respuesta (del 21,7% al 60,3%), con una caída moderada de la precisión en preguntas con respuesta (del 76% al 73%).

La relevancia de este trabajo radica en que aborda la fidelidad al contexto y la abstención, dos capacidades críticas para aplicaciones de generación aumentada por recuperación (RAG) y sistemas conversacionales donde la exactitud importa más que la fluidez. El adaptador es ligero (0,1 GB) y se puede cargar con la librería PEFT sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base) + adaptador LoRA (PEFT) |
| Parametros totales | 3B (modelo base) + adaptador LoRA (tamano de repo 0.1 GB) |
| Parametros activos | no disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | 128K (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | safetensors (adaptador); el base se cargo en 4-bit (nf4) durante el entrenamiento |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `meta-llama/Llama-3.2-3B-Instruct`, un transformer decoder-only con 3.000 millones de parametros y ventana de contexto de 128K tokens. El entrenamiento usa QLoRA con cuantizacion nf4 de 4 bits en el modelo base, y el adaptador tiene rango 16, alpha 32 y dropout 0.05. Se aplican LoRA a las proyecciones `q, k, v, o` y a las capas `gate, up, down` del MLP. El entrenamiento dura 2 epocas con tasa de aprendizaje 2e-4, scheduler coseno con 3% de warmup y batch efectivo de 8 (batch 1 con acumulacion de gradientes de 8).

Los datos provienen de SQuAD 2.0, con 2.168 filas: 542 de conflicto (pasaje editado para contradecir el conocimiento del modelo), 542 de respuesta directa y 1.084 sin respuesta. La proporcion 1:1 entre preguntas respondibles y no respondibles es clave: un primer intento con proporcion 4:1 logro un 97,9% de seguimiento de conflictos pero la abstencion cayo al 20,3%, porque el modelo aprendio a extraer siempre algo en lugar de juzgar. La perdida se calcula solo sobre los tokens de respuesta, enmascarando pasaje y pregunta.

## Capacidades

- Seguimiento estricto del pasaje proporcionado: cuando el pasaje contradice el conocimiento memorizado, el modelo responde segun el pasaje (96,3% en items de conflicto).
- Abstencion ante preguntas sin respuesta: responde con la frase canonica "That is not stated in the passage." en lugar de inventar una respuesta (60,3% en items sin respuesta).
- Distincion entre preguntas respondibles y no respondibles: la tasa de sobre-abstencion es solo del 1,8%, es decir, rechaza aproximadamente 34 veces mas a menudo cuando debe hacerlo.
- Generacion de texto condicionada al contexto: el adaptador esta disenado para tareas de grounding y RAG, donde el pasaje es la unica fuente de verdad.
- Compatibilidad con el pipeline de Hugging Face `text-generation` y la libreria PEFT.
- Entrenado y evaluado con un system prompt especifico; el uso con otros prompts no esta probado.

## Casos de uso

- Generacion aumentada por recuperacion (RAG) en produccion: el adaptador garantiza que las respuestas se basen en los documentos recuperados, reduciendo alucinaciones cuando el documento contradice el conocimiento del modelo. Se puede integrar en un pipeline de recuperacion + generacion con vLLM o TGI.
- Atencion al cliente automatizada con base de conocimiento: si el agente recibe un pasaje de una FAQ o manual, respondera segun ese pasaje y admitira cuando no tenga la informacion, evitando respuestas inventadas.
- Sistemas de verificacion de hechos: al entregar un articulo o fuente, el modelo puede extraer la respuesta correcta y abstenerse si el texto no la contiene, util para herramientas de fact-checking.
- Asistentes de lectura comprensiva: el modelo puede responder preguntas sobre un documento dado, priorizando el contenido del documento sobre el conocimiento general.
- Chatbots de soporte tecnico con documentacion: cuando el pasaje es la documentacion oficial, el modelo seguira las instrucciones del manual en lugar de dar respuestas genericas de memoria.
- Evaluacion automatica de fidelidad al contexto: al ser un adaptador ligero, puede usarse como componente en pipelines de evaluacion donde se necesita saber si un modelo sigue el contexto o se desvia.

## Benchmarks y rendimiento

Los resultados publicados en la model card, obtenidos con 1.083 items de evaluacion congelados, decodificacion greedy y GPU Tesla T4, son los siguientes:

| Arm | Grounded | Conflict following | Abstention (unanswerable) | Over-abstention |
|---|---:|---:|---:|---:|
| Base Llama-3.2-3B-Instruct | 76.0% | 82.2% | 21.7% | 1.5% |
| Mejor prompt, sin entrenamiento | 77.0% | 87.2% | 33.3% | 2.3% |
| Este adaptador (seed 0) | 73.0% | 96.3% | 60.3% | 1.8% |
| Misma receta, seed 1 | 73.0% | 96.3% | 70.7% | 2.2% |

Nota: la sobre-abstencion es la unica metrica donde un valor mas bajo es mejor. La abstencion entre semillas no es estable: la seed 1 alcanza un 70,7% frente al 60,3% de la seed 0, con intervalos de confianza que apenas se solapan. El autor recomienda citar un rango en lugar de una cifra exacta. En los 483 items de conflicto, las respuestas tomadas de memoria pasaron de 41 en el modelo base a 0 en todos los checkpoints entrenados.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es muy ligero (0,1 GB). El modelo base Llama-3.2-3B-Instruct en float16 requiere aproximadamente 6 GB de VRAM para inferencia; con cuantizacion 4-bit puede bajar a ~2-3 GB. El entrenamiento se realizo en una Tesla T4 (16 GB) con carga en 4-bit.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 2060, RTX 3060, T4, etc.) para inferencia en float16. Para entrenamiento o fine-tuning adicional, una T4 o superior es suficiente.
- Cabe en GPUs de consumo: si, en RTX 3060, RTX 4060, etc., con cuantizacion o incluso en float16.
- Opciones de despliegue: se puede usar con `transformers` + `peft` (como en el ejemplo de la model card), y tambien con vLLM o TGI si se cargan los pesos del adaptador sobre el base. No se ha probado con llama.cpp u Ollama, pero al ser un adaptador LoRA es posible convertirlo a GGUF si se funde con el base.
- Latencia y throughput: no se han publicado mediciones especificas. En una T4, la generacion de 64 tokens con greedy decoding es del orden de segundos, pero depende del hardware y la implementacion.

## Comparativa con modelos similares

No hay una comparativa publicada con otros adaptadores o modelos de la misma categoria. La unica comparacion disponible es contra el modelo base sin entrenar y contra el mejor prompt sin entrenamiento, que se muestra en la tabla de benchmarks. Como referencia, el modelo base Llama-3.2-3B-Instruct tiene 3B de parametros, contexto 128K, licencia Llama 3.2 y esta disponible en Hugging Face. No se dispone de datos de otros adaptadores de grounding o abstencion sobre el mismo base.

## Limitaciones y advertencias

- Solo se ha probado en una familia de modelos (Llama 3.2); la generalizacion a otros modelos no esta verificada.
- La evaluacion se basa en comparacion de cadenas normalizadas contra respuestas cortas de SQuAD, lo que es un metodo crudo pero reproducible. Las respuestas doradas de SQuAD contienen relleno, por lo que la precision absoluta es un minimo.
- No incluye un recuperador; los pasajes se entregan directamente al modelo, por lo que mide lectura, no recuperacion.
- Los pasajes de conflicto se editan por script y pueden contener anacronismos; los sustitutos coinciden en tipo, magnitud y epoca, pero el modelo no tiene conocimiento historico.
- El modelo es de 3B, muy por debajo de la escala de produccion tipica.
- La abstencion no es estable entre semillas: la diferencia entre seed 0 y seed 1 es de 10,4 puntos porcentuales. La direccion del efecto es segura, pero el nivel exacto no.
- La grounded accuracy cae unos 4 puntos (del 77,0% al 73,0%) respecto al mejor prompt sin entrenamiento; parte de esa caida se debe a sobre-abstencion y parte a respuestas incorrectas.
- El adaptador se entreno y evaluo con un unico system prompt; usarlo con otro prompt no esta probado y podria degradar el comportamiento.
- La licencia Llama 3.2 Community License permite uso comercial, pero requiere que el nombre del modelo comience con "Llama" y cumplir las condiciones de la licencia de Meta.

## Enlaces

- [Modelo en Hugging Face: Zeref8425/Llama-3.2-3B-DEFER](https://huggingface.co/Zeref8425/Llama-3.2-3B-DEFER)
- [Modelo base: meta-llama/Llama-3.2-3B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct)
- [Modelo base sin instrucciones: meta-llama/Llama-3.2-3B](https://huggingface.co/meta-llama/Llama-3.2-3B)
- [Pagina oficial de Llama 3 de Meta](https://developer.meta.com/ai/models/llama-3/)
- [Model cards y formatos de prompt de Llama 3.2](https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/)
