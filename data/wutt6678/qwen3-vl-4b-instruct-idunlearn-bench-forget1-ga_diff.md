# wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-GA_diff

## Resumen

El repositorio wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-GA_diff no es un modelo completo, sino un adaptador LoRA (PEFT) de aproximadamente 0,2 GB publicado por el usuario wutt6678. Se construye sobre una variante afinada de Qwen3-VL-4B-Instruct referenciada en la model card como `outputs_3/mllmu_vanilla_qwen3-vl-4b`, que a su vez deriva del modelo vision-lenguaje Qwen3-VL-4B-Instruct de Alibaba Cloud, una arquitectura multimodal densa que combina un codificador de vision con un modelo de lenguaje autorregresivo.

El nombre del repositorio apunta a un artefacto de investigacion sobre desaprendizaje automatico (machine unlearning): los sufijos "IDUnlearn-Bench", "forget1" y "GA_diff" sugieren un experimento sobre un conjunto de olvido ("forget set 1") dentro de un banco de pruebas de unlearning, y una estrategia de entrenamiento basada en ascenso de gradiente ("GA"). No obstante, esto es una inferencia a partir del identificador y no esta confirmado en la documentacion disponible.

La relevancia de la ficha es limitada pero concreta: sirve como referencia para investigadores que quieran reproducir o auditar tecnicas de desaprendizaje sobre modelos multimodales. La model card es una plantilla sin rellenar (todos los campos figuran como "[More Information Needed]"), tiene 0 descargas y 0 "likes", y no declara licencia, idiomas ni pipeline. Por tanto, casi todas las especificaciones concretas deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-4B-Instruct (vision encoder + transformer autoregresivo denso) |
| Parametros totales | No disponible para el adaptador; modelo base de 4B parametros |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; el modelo base dispone de versiones GGUF en terceros segun la busqueda web) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base y que se cargan mediante la libreria PEFT (version declarada en la model card: PEFT 0.19.1) junto con Transformers. El modelo base apunta a `outputs_3/mllmu_vanilla_qwen3-vl-4b`, una ruta local que no esta publicada ni enlazada, lo que impide verificar que variante exacta de Qwen3-VL-4B-Instruct se utilizo ni con que datos se genero. El prefijo "mllmu" podria estar relacionado con un proceso de afinado sobre un conjunto multimodal, pero no hay confirmacion.

No se documenta nada sobre el procedimiento de entrenamiento: la model card deja vacios el dataset, los hiperparametros, el regimen de precision (fp32, bf16, fp16 u otros), el numero de tokens y el uso de RLHF o DPO. Tampoco se especifica el rank del LoRA, el alpha, el dropout ni las capas objetivo. El unico dato objetivo sobre el proceso es el sufijo del nombre "GA_diff", que sugiere una estrategia de ascenso de gradiente con algun termino diferencial, tipica de los metodos de desaprendizaje, pero se trata de una hipotesis no verificada. La unica referencia tecnica del README es el articulo arXiv 1910.09700 (Lacoste et al., 2019) sobre estimacion de emisiones de carbono, que aparece en la plantilla por defecto y no implica ninguna decision de arquitectura.

## Capacidades

- No hay ninguna capacidad confirmada en la informacion disponible, ya que la model card no describe el comportamiento del adaptador.
- Al estar montado sobre Qwen3-VL-4B-Instruct, se heredarian las capacidades del modelo base descritas en la busqueda web: comprension de imagenes, video y texto, respuesta a preguntas visuales, OCR multilingue, comprension de documentos, grounding visual, razonamiento espacial, comprension de dinamicas de video, codigo visual y tareas de agente visual.
- No se documenta soporte de tool calling, function calling ni de razonamiento multi-paso en el adaptador.
- El proposito declarado del identificador (banco de desaprendizaje con conjunto de olvido) sugiere que el adaptador podria degradar o eliminar intencionadamente ciertas capacidades del modelo base, pero esto no esta confirmado ni cuantificado.
- No se declara thinking mode, soporte de audio ni ninguna capacidad especial adicional.

## Casos de uso

- Investigacion en desaprendizaje automatico: el adaptador puede servir como punto de partida para replicar o auditar un experimento de olvido selectivo sobre un modelo vision-lenguaje, comparando su comportamiento con el del modelo base sin adaptador.
- Evaluacion de metodologias "GA" (ascenso de gradiente): util para estudiar si el ascenso de gradiente con termino diferencial degrada el rendimiento general del modelo base o si consigue olvidar solo el subconjunto objetivo.
- Analisis de seguridad y alineacion: permite comprobar hasta que punto un modelo multimodal puede "olvidar" informacion concreta y si esos olvidos son reversibles mediante reentrenamiento.
- Reproducibilidad academica: en el contexto de un banco de pruebas de unlearning, el adaptador documenta la configuracion concreta (forget1) y sirve de referencia para comparar variantes del mismo autor, como la version sobre Qwen3-VL-2B-Instruct.
- Estudio del impacto del afinado LoRA en modelos multimodales: al ser un adaptador de bajo rango, es util para medir cuanto cambia el comportamiento de un VLM con pocos parametros adicionales.
- No se recomienda ningun caso de uso en produccion: el repositorio no declara licencia, no tiene descargas, no aporta documentacion de rendimiento y su base es una ruta local no publicada, por lo que no es desplegable de forma fiable tal cual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion completamente vacia ("[More Information Needed]") y no se han encontrado cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de desaprendizaje en la busqueda web asociada a este repositorio.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,2 GB, por lo que su almacenamiento es trivial; el coste real proviene de cargar el modelo base Qwen3-VL-4B-Instruct.
- VRAM estimada para el modelo base en bf16: del orden de 8 a 10 GB de pesos, mas el coste del codificador de vision y de la cache KV, que depende de la longitud de contexto (no disponible).
- VRAM estimada con cuantizacion de 4 bits: del orden de 3 a 5 GB, suficiente para GPUs de consumo como RTX 3060 de 12 GB, RTX 4070 o RTX 4090.
- GPU recomendadas para bf16: RTX 4090 (24 GB), L40S, A100 o H100 si se requiere mayor paralelismo o lotes grandes.
- Cabe en GPU de consumo: previsiblemente si, en GPUs de 12 GB o mas con cuantizacion, aunque no hay confirmacion oficial para este adaptador concreto.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base mediante Transformers y PEFT; para servir en produccion habria que fusionar el adaptador con el modelo base y desplegarlo con vLLM, TGI o llama.cpp (este ultimo solo si se exporta a GGUF, algo no documentado aqui).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-GA_diff (este) | Adaptador LoRA sobre base de 4B; tamano de adaptador 0,2 GB | No disponible | No disponible | 0 descargas, 0 likes; base no publicada |
| Qwen3-VL-4B-Instruct (modelo base de referencia) | 4B (denso) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Ampliamente distribuido mediante espejos como OpenExplorer/Qwen3-VL-4B-Instruct y repositorios GGUF de terceros |
| wutt6678/Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-GA_diff | Adaptador LoRA sobre base de 2B | No disponible | No disponible | Mismo autor, mismo esquema de nombres; disponible en HuggingFace |

No se dispone de datos de rendimiento que permitan comparar la calidad de estos artefactos entre si; la comparativa se limita a tamano, origen y disponibilidad.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no declara autor efectivo, licencia, idiomas, dataset ni procedimiento de entrenamiento.
- La licencia "no disponible" implica que no hay permiso explicito de uso comercial; en ausencia de terminos, debe asumirse que no se puede reutilizar en produccion sin aclaracion del autor.
- El modelo base referenciado (`outputs_3/mllmu_vanilla_qwen3-vl-4b`) es una ruta local no publicada, por lo que el adaptador probablemente no sea cargable de forma directa sin reproducir ese paso previo.
- El sufijo "GA_diff" sugiere un proceso de ascenso de gradiente orientado a olvidar informacion; este tipo de tecnicas puede degradar capacidades generales del modelo mas alla del subconjunto objetivo, algo que no se cuantifica en la documentacion.
- Riesgo de alucinacion: no evaluado para este adaptador; se heredan los sesgos y limitaciones del modelo base Qwen3-VL-4B-Instruct, no documentados aqui.
- No hay evidencia de evaluacion de sesgos, robustez ni seguridad, ni resultados de benchmarks que respalden su uso en tareas reales.
- Con 0 descargas y 0 likes, no existe validacion por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Uso previsto: exclusivamente investigacion sobre desaprendizaje; no apto para despliegue en produccion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget1-GA_diff
- Variante hermana sobre Qwen3-VL-2B: https://huggingface.co/wutt6678/Qwen3-VL-2B-Instruct-IDUnlearn-Bench-forget1-GA_diff
- Modelo base de referencia (espejo): https://huggingface.co/OpenExplorer/Qwen3-VL-4B-Instruct
- Repositorio oficial Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Ficha Qualcomm AI Hub de Qwen3-VL-4B-Instruct: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Distribucion GGUF de terceros: https://local-ai-zone.github.io/models/qwen3-vl-4b-instruct.html
- Referencia citada en la model card: https://arxiv.org/abs/1910.09700
