# sxiong/SWAP_HumanEval_Disc_Llama3-8B-LoRA

## Resumen

El modelo `sxiong/SWAP_HumanEval_Disc_Llama3-8B-LoRA` es un adaptador LoRA entrenado sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` para actuar como discriminador en el benchmark HumanEval. Forma parte del framework SWAP (Structure-Aware World-Model Planning), presentado en el artículo "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (ACL 2025). Su función es evaluar si una solución de código generada por un LLM es correcta o incorrecta, lo que permite filtrar y seleccionar respuestas en pipelines de generación de código y razonamiento estructurado.

El adaptador se entrenó con el dataset `sxiong/SWAP_disc`, derivado de HumanEval, y utiliza una configuración LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP del transformer. Al ser un adaptador ligero (0,2 GB), se puede cargar sobre el modelo base sin necesidad de reentrenar, lo que facilita su integración en sistemas existentes. Su relevancia radica en que aborda el problema de la selección de soluciones en tareas de programación, un paso crítico en sistemas de generación de código multi-intento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3-8B-Instruct) + adaptador LoRA |
| Parametros totales | 8B (modelo base) + adaptador LoRA (parametros no especificados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3-8B-Instruct soporta 8K tokens, pero no se especifica para el adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con metodos estandar) |
| Idiomas soportados | ingles |
| Licencia | MIT (adaptador); el modelo base Llama-3-8B-Instruct tiene su propia licencia (Llama 3 Community License) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer densa de Llama-3-8B-Instruct, con 8.000 millones de parametros y una ventana de contexto de 8K tokens. La capa LoRA se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 16, alpha 32 y bias desactivado. Esto permite ajustar el modelo base con un numero reducido de parametros entrenables, manteniendo el conocimiento general del modelo original.

El entrenamiento se realizo sobre el dataset `sxiong/SWAP_disc`, que contiene pares de soluciones de codigo de HumanEval etiquetados como correctos o incorrectos. La tarea del discriminador es aprender a distinguir entre ambas clases, lo que se integra en el framework SWAP como un componente de evaluacion dentro de un proceso de razonamiento deliberado. El articulo asociado describe un enfoque de planificacion estructurada con un modelo del mundo explicito, donde el discriminador actua como verificador de las soluciones propuestas.

## Capacidades

- Discriminacion de soluciones de codigo: clasifica si una respuesta generada para un problema de HumanEval es funcionalmente correcta o no.
- Generacion de texto: hereda las capacidades generativas del modelo base Llama-3-8B-Instruct, incluyendo razonamiento y comprension del lenguaje natural.
- Razonamiento y codigo: el modelo base esta optimizado para tareas de programacion y razonamiento logico, lo que se transfiere al adaptador.
- Integracion con PEFT: se puede cargar mediante `PeftModel` de la libreria `peft`, facilitando su uso en pipelines de transformers.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Seleccion de soluciones en generacion de codigo: dado un problema de programacion, se generan multiples respuestas con un LLM y el discriminador selecciona la que tiene mayor probabilidad de ser correcta, mejorando la precision final del sistema.
- Filtrado de respuestas en pipelines de razonamiento: en sistemas que producen varias hipotesis, el discriminador puede descartar aquellas que no cumplen los criterios de correccion, reduciendo el ruido en la salida.
- Evaluacion automatica de calidad de codigo: como componente de un evaluador, puede puntuar la correccion funcional de fragmentos de codigo generados automaticamente, util en entornos de testing y validacion.
- Componente en sistemas de razonamiento estructurado: dentro del framework SWAP, actua como verificador en el bucle de planificacion, permitiendo que el modelo base refine sus soluciones basandose en la retroalimentacion del discriminador.
- Benchmarking de modelos de codigo: puede emplearse para comparar la calidad de distintos LLMs en HumanEval, sirviendo como metrica de correccion funcional.
- Entrenamiento por refuerzo: el discriminador puede utilizarse como funcion de recompensa para entrenar otros modelos mediante RLHF o DPO, proporcionando una senal binaria de correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas de rendimiento sobre HumanEval ni comparaciones con otros discriminadores. Se recomienda consultar el repositorio GitHub de SWAP para posibles evaluaciones adicionales.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la carga requiere el modelo base Llama-3-8B-Instruct. En bfloat16, el modelo base ocupa aproximadamente 16 GB de VRAM, por lo que se necesita una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100 40GB, o similar). Con cuantizacion (por ejemplo, 4 bits), la VRAM puede reducirse a unos 6-8 GB, permitiendo su uso en GPUs consumer como RTX 3060 o RTX 3080.
- GPU recomendadas: A100, H100, RTX 4090, RTX 3090, o cualquier GPU con suficiente VRAM para el modelo base.
- Opciones de despliegue: se puede servir con vLLM, TGI, llama.cpp u Ollama, cargando el adaptador mediante PEFT. La latencia dependera del hardware y del tamano del lote; no se proporcionan datos especificos.
- El adaptador en si es muy ligero (0,2 GB) y no anade una carga computacional significativa durante la inferencia, ya que solo introduce matrices de bajo rango en las capas objetivo.

## Comparativa con modelos similares

No se dispone de informacion sobre discriminadores comparables en el contexto de HumanEval. Existen otros adaptadores LoRA del mismo autor para tareas similares (por ejemplo, `sxiong/SWAP_v2_MATH_Disc_Llama3-8B-LoRA` y `sxiong/SWAP_MATH500_Disc_Llama3-8B-LoRA`), pero no se han publicado comparativas directas. La informacion disponible no permite establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Especificidad del dominio: el adaptador esta entrenado exclusivamente con datos de HumanEval, por lo que su capacidad de discriminacion puede no generalizar a otros benchmarks o problemas de programacion fuera de ese conjunto.
- Dependencia del modelo base: el adaptador requiere el modelo base Llama-3-8B-Instruct, que tiene su propia licencia (Llama 3 Community License) con restricciones de uso comercial para empresas con mas de 700 millones de usuarios mensuales. La licencia MIT del adaptador no exime de cumplir la licencia del modelo base.
- Riesgo de alucinacion: al ser un discriminador binario, puede clasificar incorrectamente soluciones ambiguas o con errores sutiles, especialmente si el problema no esta bien representado en el dataset de entrenamiento.
- Sesgos: no se han documentado sesgos especificos, pero al derivar de HumanEval, puede estar sesgado hacia estilos de codigo y problemas tipicos de ese benchmark.
- Limitaciones de contexto: la ventana de contexto del modelo base es de 8K tokens, lo que limita la longitud de los fragmentos de codigo que puede evaluar de una sola vez.
- Sin soporte multilingue: el modelo esta entrenado solo en ingles, por lo que no es adecuado para codigo con comentarios o documentacion en otros idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/sxiong/SWAP_HumanEval_Disc_Llama3-8B-LoRA
- Repositorio GitHub de SWAP: https://github.com/xiongsiheng/SWAP
- Dataset de entrenamiento: https://huggingface.co/datasets/sxiong/SWAP_disc
- Paper de HumanEval: https://arxiv.org/abs/2107.03374
- Paper de SWAP (ACL 2025): "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (referencia en la model card)
