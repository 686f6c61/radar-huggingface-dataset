# xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ3e

## Resumen

MiMo-V2.6-Distill-Qwen-9B-Text-oQ3e es una cuantizacion de 3 bits en formato Apple MLX del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario xunlinkx. No es un modelo entrenado desde cero: se trata de una version comprimida y podada del checkpoint de Xiaomi MiMo, que a su vez es un ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por la familia MiMo-V2.6. El modelo resultante conserva aproximadamente 8.953.803.264 parametros y ocupa 4,3 GB en el repositorio.

La aportacion concreta de esta ficha es doble. Por un lado, aplica una cuantizacion afin de 3 bits con grupo de 64, construida con el runtime oMLX sobre 128 muestras de calibracion a longitud de secuencia 512, con cobertura estricta de la matriz de importancia y computo en BF16. Por otro, elimina deliberadamente la torre de vision y los procesadores multimodales, dejando un modelo de texto puro, y prescinde de las cabezas draft MTP de decodificacion especulativa para maximizar la compatibilidad con mlx-lm estandar y reducir el consumo de memoria unificada.

Es relevante ahora porque abarata el despliegue local de un modelo agentico de 9B en equipos Apple Silicon: el repositorio de 4,3 GB cabe en configuraciones de portatil con 16-18 GB de memoria unificada, un escenario en el que el checkpoint original en BF16 no resulta comodo. La contrapartida es que se trata de una cuantizacion de 3 bits sin benchmarks publicados, por lo que su comportamiento debe validarse en la carga de trabajo concreta antes de llevarla a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B, segun la etiqueta `qwen3_5` del repositorio); detalle de capas y atencion no disponible |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3 bits afin, group size 64 (esquema oQ3e, "enhanced oQ3"). El autor publica una variante separada en 4 bits (oQ4e) |
| Idiomas soportados | No disponible |
| Licencia | MIT, heredada del modelo base |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`, runtime oMLX) |
| Tamano del repositorio | 4,3 GB |
| Modalidad | Solo texto: torre de vision y procesadores multimodales omitidos |
| Cabezas draft especulativas | No incluidas (MTP deshabilitado) |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente, MiMo-V2.6-Distill-Qwen-9B, es un modelo agentico de 9B desarrollado por Xiaomi MiMo mediante ajuste supervisado de Qwen3.5-9B sobre datos generados por la familia mayor MiMo-V2.6. Xiaomi lo publica como checkpoint SFT, pensado como punto de partida para investigacion abierta en refuerzo agentico, y declara cuatro areas objetivo: ingenieria de software, tareas de agente de proposito general, codigo visual y ciberseguridad. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; la model card de Xiaomi y el blog del lanzamiento son las fuentes a consultar para esos datos.

Esta ficha concreta corresponde a la capa de cuantizacion. El autor aplico un esquema oQ3e (oQ3 mejorado) con oMLX, usando 128 muestras de calibracion a longitud de secuencia 512, cuantizacion afin global de 3 bits con grupo de 64, aplicacion completa de la matriz de importancia estricta sin entradas ausentes ni desajustadas y computo en BF16 durante el proceso. La validacion local previa a la subida incluye carga estricta a traves del runtime oMLX, identidad SHA-256 del tokenizer entre origen y salida, renderizado de un esquema de funciones estilo OpenAI por parte de la plantilla de chat oficial y una prueba de humo de generacion determinista (el 15% de 240 debe incluir 36). El informe legible por maquina se incluye como `validation.json` en el repositorio. La innovacion tecnica del artefacto es, por tanto, de despliegue mas que de modelado: poda multimodal, ausencia de cabezas especulativas y cuantizacion de 3 bits calibrada.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat oficial compatible con `mlx-lm` y runtimes de inferencia estandar.
- Capacidades agenticas heredadas del modelo base: tareas de agente de proposito general y razonamiento multi-paso, segun la descripcion de Xiaomi MiMo.
- Codigo y ingenieria de software: el modelo base declara entrenamiento especifico en tareas de programacion.
- Tool calling / function calling: la plantilla de chat renderiza esquemas de funciones estilo OpenAI, y el uso de herramientas depende de aplicar esa plantilla y suministrar los esquemas en la peticion.
- Generacion determinista verificada en la prueba de humo incluida por el autor.
- Modelo exclusivamente de texto: no procesa imagenes ni audio, ya que la torre de vision y los procesadores multimodales fueron eliminados.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- El modelo base menciona codigo visual y ciberseguridad entre sus areas de entrenamiento, pero esta variante, al ser solo texto, no puede abordar la parte visual de esas tareas.

## Casos de uso

- Asistente de codigo en local sobre macOS: el modelo puede integrarse en editores como Cursor o en el runtime oMLX para autocompletado, refactorizacion y explicacion de fragmentos, con 4,3 GB de pesos que caben en un portatil Apple Silicon de 16-18 GB de memoria unificada.
- Agente de linea de comandos con tool calling: aplicando la plantilla de chat incluida y pasando esquemas de funciones, puede orquestar llamadas a herramientas (lectura de ficheros, ejecucion de comandos, consultas a API) en flujos multi-paso del estilo OpenHands.
- Automatizacion de tareas de oficina y ofimatica: generacion y reescritura de textos, resumen de documentos y extraccion de datos estructurados, aprovechando la ventana de contexto del modelo base (conviene medirla antes, ya que no esta publicada en esta ficha).
- Clasificacion y enrutado de tickets de soporte: al ser un modelo de 3 bits muy ligero, puede desplegarse en paralelo a otros servicios para etiquetar, priorizar y derivar incidencias sin competir por memoria con modelos mayores.
- Prototipado rapido de pipelines de agente en investigacion: sirve como banco de pruebas de bajo coste para validar prompts, esquemas de herramientas y estrategias de razonamiento antes de migrar a un checkpoint mayor.
- Inferencia en el borde o en equipos sin GPU dedicada: su huella de 4,3 GB y su naturaleza solo texto permiten ejecutarlo en un Mac mini o MacBook con memoria unificada, sin necesidad de aceleradores NVIDIA.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye `validation.json` y documenta el proceso (128 muestras, secuencia 512, group size 64), lo que lo convierte en un caso util para comparar esquemas de 3 bits frente a 4 bits (variante oQ4e) sobre la misma carga de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta una prueba de humo de generacion determinista (el 15% de 240 debe incluir 36) y una validacion de carga y metadatos, que no constituyen una evaluacion de capacidad. Como referencia externa, una entrada de blog sobre el despliegue del modelo base en un Apple M3 Pro con 18 GiB de memoria unificada, usando un GGUF Q3_K_M de la comunidad y llama.cpp, indica que la carga y la generacion funcionaron, pero que una tarea pequena de codigo no supero su prueba de aceptacion completa.

| Evaluacion | Resultado | Fuente |
|---|---|---|
| Benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) | No disponibles | Informacion proporcionada |
| Prueba de humo determinista | El 15% de 240 incluye 36 | Model card del autor |
| Tarea de codigo en M3 Pro con GGUF Q3_K_M | No supera la prueba de aceptacion completa | Blog de ofox.ai (modelo base) |

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio ocupa 4,3 GB, por lo que los pesos requieren aproximadamente 4,5-5 GB; sumando cache KV y overhead del runtime, conviene reservar entre 6 y 8 GB para contexto moderado.
- Equipos Apple Silicon: es el destino natural del artefacto, al estar en formato MLX. Un Apple M3 Pro con 18 GiB de memoria unificada es un objetivo validado para el modelo base en cuantizacion de 3 bits; un Mac con 16 GB deberia ser suficiente, con margen ajustado.
- GPU NVIDIA: no es el objetivo de este repositorio, al estar en formato MLX. Para CUDA habria que convertir los pesos o recurrir a una cuantizacion GGUF del mismo modelo base.
- Cabe en GPU de consumo: si se convierte a un formato compatible con CUDA, el tamano de 3 bits es apto para tarjetas de 8 GB o superiores (por ejemplo, RTX 3060, 4060, 4070); no se dispone de datos confirmados de ejecucion en esas tarjetas para esta variante.
- Opciones de despliegue: runtime oMLX (el previsto por el autor), `mlx-lm` estandar mediante `mlx-lm.generate`, LM Studio con soporte MLX, y cualquier pipeline de texto que acepte la plantilla de chat incluida. No es compatible directamente con llama.cpp, vLLM ni TGI sin conversion de formato.
- Latencia y throughput: no disponibles. Al no incluir cabezas draft especulativas, no se beneficia de decodificacion especulativa dentro del modelo, aunque el menor consumo de memoria puede permitir un mayor tamano de lote o de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-Text-oQ3e (este) | 8,95B | 3 bits afin, group size 64 | No disponible | safetensors MLX / oMLX, mlx-lm | MIT | Repositorio HuggingFace, 4,3 GB |
| MiMo-V2.6-Distill-Qwen-9B-Text-oQ4e | 8,95B (base) | 4 bits (oQ4e) | No disponible | safetensors MLX / oMLX | MIT | Repositorio HuggingFace del mismo autor |
| MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ4e | 8,95B (base) | 4 bits (oQ4e) | No disponible | safetensors MLX / oMLX | MIT | Repositorio HuggingFace del mismo autor |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | 9B | BF16 sin cuantizar | No disponible | safetensors | MIT | HuggingFace y ModelScope |

Nota: no se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparacion se limita a parametros, formato, licencia y disponibilidad. La eleccion entre oQ3e y oQ4e es, en la practica, un compromiso entre huella de memoria y fidelidad respecto al checkpoint original.

## Limitaciones y advertencias

- Cuantizacion agresiva de 3 bits: la propia model card advierte de que la cuantizacion puede alterar el comportamiento del modelo, y recomienda evaluarlo en la carga de trabajo propia antes de usarlo en produccion.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares para esta variante, de modo que no puede afirmarse su nivel de degradacion respecto al checkpoint BF16.
- Evidencia externa desfavorable: el blog sobre el modelo base en un M3 Pro con GGUF Q3_K_M reporta que una tarea de codigo concreta no supero su prueba de aceptacion completa, una senal de que la cuantizacion de 3 bits puede no bastar para tareas de codigo exigentes.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en modelos de 9B y puede aumentar con la cuantizacion.
- Idiomas soportados: no disponibles. No se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Longitud de contexto: no disponible en este repositorio. Debe consultarse la model card del modelo base antes de disenar flujos con contexto largo.
- Perdida de capacidades multimodales: la torre de vision y los procesadores multimodales fueron eliminados expresamente, por lo que no puede realizar codigo visual ni tareas sobre imagenes, pese a que el modelo base declara ese ambito entre sus areas de entrenamiento.
- Sin decodificacion especulativa: al omitir las cabezas draft MTP, se renuncia a la aceleracion por especulacion; el motivo declarado es la compatibilidad con mlx-lm y el menor consumo de memoria.
- Dependencia de la plantilla de chat: el uso de herramientas solo funciona si se aplica la plantilla incluida y se suministran los esquemas en la peticion.
- Restricciones de licencia: licencia MIT, heredada del modelo base, lo que en principio permite uso comercial; aun asi, deben revisarse los avisos y la atribucion de los repositorios originales de Xiaomi MiMo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, con validacion limitada a pruebas locales del autor y sin revision independiente.
- Fechas del repositorio: la model card indica validacion el 2026-09-25, coherente con las fechas de creacion y actualizacion del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Text-oQ3e
- Modelo base en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Pagina oficial de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Variante hermana en 4 bits: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ4e
- Ficha del modelo base en Vast.ai: https://vast.ai/model/mimo-v26-distill-qwen-9b
- Guia de despliegue local en Mac: https://ofox.ai/blog/mimo-2-6-distill-qwen-9b-local-vram/
