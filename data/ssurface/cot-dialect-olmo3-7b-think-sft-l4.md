# ssurface/cot-dialect-olmo3-7b-think-sft-l4

## Resumen

Este modelo es un adaptador LoRA experimental, publicado por ssurface (Anatolii Frolov), que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think` para generar cadenas de pensamiento (chain-of-thought) en un "dialecto" de compresión de nivel L4. El dialecto L4 consiste en asignaciones encadenadas con punto y coma (p. ej., `K=18*2.5;D=8*4;T=K+D->T=77`), lo que reduce drásticamente la longitud de las cadenas de razonamiento: la mediana pasa de 532 caracteres en el nivel L1 a 41 en el L4, un factor de 13x. El objetivo es estudiar cómo afecta la compresión extrema del razonamiento a la precisión en tareas de matemáticas.

El adaptador se entrena mediante supervisión fina (SFT) por destilación, re-expresando los problemas de GSM8K a nivel L4 con un modelo profesor. El modelo base es un transformer decoder de 7B parámetros con soporte de contexto largo, pero el entrenamiento del adaptador usa una ventana máxima de 1024 tokens. La relevancia de este trabajo reside en explorar los límites de la compresión de cadenas de razonamiento, una línea de investigación que puede reducir costes de inferencia y latencia en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre OLMo 3 7B Think (transformer decoder) |
| Parametros totales | No disponible (el adaptador LoRA ocupa 0.2 GB; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens en entrenamiento; el modelo base soporta contexto largo (no especificado) |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA (r=16, alpha=32, dropout=0.05) se aplica sobre `allenai/Olmo-3-7B-Think`, un modelo de 7B parámetros de la familia Olmo 3, que es un transformer decoder entrenado para razonamiento, function calling y codigo. El entrenamiento se realiza por destilacion: un modelo profesor re-expresa los 6976 ejemplos de entrenamiento de GSM8K en el dialecto L4, y el adaptador se ajusta con SFT sobre esas cadenas comprimidas. Se usan 3 epocas, learning rate 2e-4 con scheduler coseno y warmup del 3%, batch efectivo de 64, precision bf16 y una unica GPU A100 80GB.

Un detalle tecnico relevante es que el collator de busqueda de patrones no enmascaro nada en la practica, lo que permitio que el prior de tool-calling del modelo base se filtrara en las cadenas generadas. Esto significa que el adaptador puede heredar comportamientos del modelo base que no fueron explicitamente controlados durante el entrenamiento.

## Capacidades

- Generacion de cadenas de razonamiento comprimidas en formato "shorthand" (asignaciones encadenadas con punto y coma).
- Razonamiento matematico de un solo turno sobre problemas de palabras (evaluado en GSM8K).
- No soporta tool calling ni function calling de forma explicita en el adaptador (aunque el modelo base si).
- No soporta agentes ni razonamiento multi-paso fuera del formato comprimido.
- Capacidad multilingue limitada al ingles; no hay soporte para otros idiomas.
- No dispone de capacidades de vision, audio ni modo thinking explicito (el razonamiento es interno al formato comprimido).

## Casos de uso

- Investigacion en compresion de cadenas de razonamiento: permite estudiar como la reduccion de la longitud del CoT afecta a la precision en tareas aritmeticas, comparando niveles L1 a L5.
- Generacion de datos sinteticos comprimidos: puede servir para crear datasets de razonamiento condensado que otros modelos puedan usar como entrada para entrenamiento o evaluacion.
- Evaluacion de robustez del modelo base: al forzar un dialecto extremo, se pueden detectar debilidades del razonamiento del modelo base ante representaciones no naturales.
- Analisis de sesgos en razonamiento comprimido: util para estudiar si la compresion introduce errores sistematicos en problemas de dificultad creciente.
- Benchmarking de metodos de destilacion: sirve como ejemplo de SFT por destilacion con un collator imperfecto, y puede usarse para comparar estrategias de enmascaramiento de prompts.
- Prueba de concepto para inferencia de baja latencia: si la compresion mantuviera precision aceptable, podria reducir el numero de tokens generados y, por tanto, la latencia en entornos con restricciones de tiempo.

## Benchmarks y rendimiento

El unico resultado publicado es el de GSM8K (test, n=1317, greedy decoding, single-turn, sin exemplars ni self-consistency):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test) | Accuracy (exact match) | 43.8% |

No se han publicado comparaciones con otros modelos ni con el modelo base sin adaptador en la informacion disponible. El autor indica que la precision cae con la dificultad del problema, siendo mas rapida la caida en los niveles comprimidos.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.2 GB), pero requiere cargar el modelo base de 7B en memoria.
- VRAM estimada: aproximadamente 14-16 GB en bf16 para el modelo base completo; con cuantizacion (p. ej., 4 bits) podria reducirse a ~6-8 GB.
- GPU recomendadas: A100 80GB (usada en entrenamiento), H100, o GPUs consumer de 16 GB o mas (RTX 4090, RTX 4080, etc.).
- Cabe en GPUs consumer de 16 GB si se usa cuantizacion, pero no en GPUs de 8 GB sin cuantizacion agresiva.
- Opciones de despliegue: `transformers` + `peft` (como en el ejemplo de uso), tambien compatible con vLLM y TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput no disponibles; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoria (adaptadores LoRA para compresion de CoT). El modelo base `allenai/Olmo-3-7B-Think` tiene un rendimiento superior en GSM8K (no se indica el valor exacto en la informacion), pero no se ha comparado directamente con este adaptador. No hay datos de otros niveles de compresion (L1, L2, L3, L5) en la informacion disponible.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de palabras (GSM8K); no es adecuado para otras tareas sin adaptacion.
- La precision cae rapidamente con la dificultad del problema, especialmente en niveles comprimidos como L4.
- El resultado de 43.8% tiene un intervalo de confianza del 95% de aproximadamente ±2.7 puntos porcentuales (n=1317), por lo que diferencias de unos pocos puntos pueden deberse al ruido.
- El collator de entrenamiento no enmascaro correctamente los prompts, lo que pudo permitir la filtracion de comportamientos no deseados del modelo base (tool-calling) en las cadenas.
- Riesgo de alucinacion en el razonamiento comprimido: al ser tan corto, puede omitir pasos intermedios o producir resultados incorrectos sin explicacion.
- Solo soporta ingles; no hay soporte multilingue.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base (tambien Apache-2.0) y las condiciones de los datos de entrenamiento.

## Enlaces

- [Adaptador en HuggingFace](https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4)
- [Modelo base: allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- [Modelo base SFT: allenai/Olmo-3-7B-Think-SFT](https://huggingface.co/allenai/Olmo-3-7B-Think-SFT)
- [Paper de Olmo 3 (arXiv)](https://arxiv.org/abs/2512.13961)
- [Repositorio open-instruct (scripts de entrenamiento)](https://github.com/allenai/open-instruct/blob/main/scripts/train/olmo3/README.md)
- [Pagina de Olmo en Ai2](https://allenai.org/olmo)
