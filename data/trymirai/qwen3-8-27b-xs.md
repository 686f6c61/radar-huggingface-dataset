# trymirai/Qwen3.8-27B-XS

## Resumen

Qwen3.8-27B-XS es una cuantizacion extrema del modelo Qwen/Qwen3.8-27B desarrollada por Mirai Labs (publicada bajo el identificador `trymirai`). No es un modelo entrenado desde cero, sino un checkpoint comprimido a aproximadamente 2 bits por peso que conserva 6.532.738.832 parametros almacenados en safetensors, lo que reduce el repositorio a 22,3 GB frente al modelo base de 27B. El objetivo declarado es habilitar inferencia local eficiente en Apple silicon, un nicho donde el ancho de banda de memoria es el cuello de botella y las cuantizaciones de 4 bits convencionales resultan demasiado grandes para equipos de consumo.

La tecnica empleada es una cuantizacion con trellis y codigos de tipo QTIP (8, 7 o 6 bits de transicion por grupo de cuatro pesos, elegidos por matriz segun coste medido), rotaciones aleatorias con estructura de Kronecker para mitigar valores atipicos, un embedding de entrada con codigo de retículo D4 de 2 bits y una cabeza de salida en enteros de 4 bits con tamano de grupo 64. Sobre esa base se aplicaron dos rondas de destilacion consciente de cuantizacion y una ronda de contexto largo que reentrena solo las escalas de fila y de normalizacion.

Su relevancia actual radica en que demuestra que un modelo de la clase 27B puede comprimirse hasta ~2 bits por peso manteniendo una divergencia KL de 0,1611 y un 86,83% de acuerdo top-1 con el profesor, medidos sobre 20 conversaciones y 14.456 tokens de continuacion generados por el docente. Es, sin embargo, un artefacto muy especializado: depende de la libreria `uzu` y del runtime `mirai`, y solo soporta inferencia en Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.8-27B); cuantizacion con trellis QTIP y rotaciones de Kronecker |
| Parametros totales | 6.532.738.832 (pesos almacenados en safetensors tras cuantizacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B define el contexto; no se especifica en la model card) |
| Tipos de cuantizacion | ~2 bits por peso: trellis con 8, 7 o 6 bits de transicion por grupo de 4 pesos; embedding de entrada con retículo D4 de 2 bits; cabeza de salida INT4 con grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia del modelo base Qwen) |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El checkpoint parte de la arquitectura del modelo base Qwen/Qwen3.8-27B, un transformer denso de 27B parametros. La intervencion de Mirai Labs no modifica la topologia de la red, sino que reemplaza la representacion de los pesos: cada matriz se cuantiza con un esquema trellis de tipo QTIP en el que se eligen 8, 7 o 6 bits de transicion por grupo de cuatro pesos en funcion del coste medido, lo que arroja una media de aproximadamente 2 bits por peso. Para reducir los valores atipicos que degradan la cuantizacion de baja profundidad se aplican rotaciones aleatorias con estructura de Kronecker. El embedding de entrada usa un codigo de retículo D4 de 2 bits y la cabeza de salida se mantiene en enteros de 4 bits con grupo de 64.

El proceso de ajuste consta de tres fases documentadas: una calibracion sobre un conjunto con texto de razonamiento y de agentes, dos rondas de destilacion consciente de cuantizacion (quantization-aware distillation) contra el modelo profesor, y una ronda final de contexto largo en la que solo se reentrenan las escalas de fila y de normalizacion usando sesiones largas de agente generadas por el propio modelo. La evaluacion se realizo con la herramienta `romakl` sobre su conjunto por defecto (20 conversaciones, 14.456 tokens de continuacion del profesor), obteniendo KL 0,1611306 y acuerdo top-1 del 86,83%. Los pesos de vision, MTP y speculator quedan excluidos del computo de tamano, por lo que el checkpoint no incorpora esas capacidades multimodales.

## Capacidades

- Generacion de texto y continuacion de conversaciones multi-turno, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y texto de tipo agente: el conjunto de calibracion incluyo explicitamente texto de razonamiento y de agentes, y la ronda de contexto largo se entreno sobre sesiones de agente.
- Capacidades de codigo y matematicas: no verificadas de forma independiente en la informacion disponible; se asumen por herencia del modelo base, sin datos propios.
- Tool calling / function calling: no disponible de forma explicita en la model card; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: si, en la medida en que el modelo base lo soporte y el contexto lo permita; el ajuste se oriento a este uso.
- Capacidades multilingues: no disponibles; la model card no declara lista de idiomas.
- Vision, audio y modo thinking: no disponibles en este checkpoint (los pesos de vision y MTP se excluyen del empaquetado).

## Casos de uso

- Inferencia local en Mac con Apple silicon: el caso de uso principal y unico soportado oficialmente. Un Mac con memoria unificada suficiente puede cargar los 22,3 GB del repositorio y ejecutar el modelo mediante `brew install mirai` y `mirai --model trymirai/Qwen3.8-27B-XS`, sin GPU dedicada.
- Asistente de codigo en el portatil del desarrollador: al caber en memoria unificada de un equipo de gama alta, permite autocompletado y explicacion de codigo sin enviar el contexto a la nube, con la salvedad de que la calidad cae respecto al modelo de 27B original.
- Procesamiento por lotes de texto en local: clasificacion, resumen y extraccion de entidades sobre corpus que no pueden salir de la maquina, aprovechando el bajo coste de memoria del checkpoint cuantizado.
- Prototipado de agentes con tool calling: el ajuste incluyo texto de agente y sesiones largas, por lo que sirve para validar flujos multi-paso en local antes de escalar a un modelo mayor en servidor.
- Educacion e investigacion sobre cuantizacion extrema: el checkpoint es un caso de estudio reproducible de destilacion consciente de cuantizacion a ~2 bits, con metrica KL y acuerdo top-1 publicadas.
- Evaluacion comparativa de runtimes: util para medir el rendimiento de `uzu`/`mirai` frente a otras pilas de inferencia en Apple silicon con un modelo de calidad conocida.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Divergencia KL vs. profesor | 0,1611306 | Conjunto `romakl` por defecto: 20 conversaciones, 14.456 tokens |
| Acuerdo top-1 con el profesor | 86,83% | Mismo conjunto |
| Tamano de pesos | 6.532.738.832 parametros / 22,3 GB de repositorio | Excluye vision, MTP y speculator |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: al menos 22,3 GB para cargar el repositorio completo; en la practica se recomienda disponer de 24-32 GB de memoria unificada para margen de contexto y cache KV.
- GPU recomendadas: no aplica en el soporte oficial; el runtime `mirai` solo funciona en Apple silicon (serie M). No se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no hay soporte documentado para GPUs NVIDIA o AMD de consumo; en Apple silicon, encaja en equipos con 32 GB o mas de memoria unificada.
- Opciones de despliegue: `mirai` CLI (via Homebrew) y la libreria `uzu`; compilacion desde fuente segun la guia del repositorio `trymirai/uzu`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-XS (este) | 6.532.738.832 almacenados (~2 bits/peso) | no disponible | Trellis QTIP ~2 bits | Apache 2.0 | Hugging Face, solo Apple silicon via `uzu`/`mirai` |
| Qwen/Qwen3.8-27B (base) | 27B | definido por el modelo base | FP16/BF16 original | Apache 2.0 | Hugging Face, multiplataforma |
| Bonsai 2 (packings evaluados por Mirai) | no disponible | no disponible | 2 bits | no disponible | runtime Prism (llama.cpp fork) |
| Otras cuantizaciones de 2 bits del mismo base | no disponible | no disponible | 2 bits | segun autor | no disponible |

La model card menciona tres empaquetados Bonsai 2 evaluados por separado con el runtime Prism, pero no aporta sus cifras de KL ni de acuerdo top-1 en el texto disponible, por lo que no es posible una comparacion numerica directa.

## Limitaciones y advertencias

- Dependencia de plataforma: solo se soporta inferencia en Apple silicon mediante `mirai`/`uzu`; no hay soporte documentado para CUDA, ROCm ni otras pilas.
- Perdida de calidad medible: 86,83% de acuerdo top-1 con el profesor implica que aproximadamente 1 de cada 7 tokens generados difiere del modelo original; en tareas de codigo o matematicas precisas el impacto puede ser mayor.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados, por lo que el rendimiento multilingue no esta garantizado.
- Capacidades multimodales ausentes: los pesos de vision y MTP se excluyen del empaquetado, de modo que este checkpoint es exclusivamente de texto.
- Riesgo de alucinacion: inherente al modelo base y potencialmente amplificado por la cuantizacion agresiva a ~2 bits; no se han publicado evaluaciones de factualidad.
- Sesgos: no documentados en la informacion disponible; se heredan los del corpus de entrenamiento de Qwen3.8-27B.
- Licencia: Apache 2.0 permite uso comercial, pero el enlace de licencia apunta a la del modelo base Qwen, cuyos terminos deben respetarse adicionalmente.
- Madurez: 536 descargas y 3 likes en el momento de la consulta; proyecto reciente (creado en octubre de 2026) sin adopcion amplia, lo que desaconseja su uso en produccion critica sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.8-27B-XS
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card del base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/README.md
- Licencia del base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Repositorio `uzu` (guia de ejecucion): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Herramienta de evaluacion `romakl`: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
- Runtime Prism (fork de llama.cpp): https://github.com/PrismML-Eng/llama.cpp/tree/3f035ba664f8f08c3d9432b6421f8f1a0da1f37a
