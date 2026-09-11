# treeish/Ornith-1.5-9B-oQ4e-fp16

## Resumen

Ornith-1.5-9B-oQ4e-fp16 es un repositorio de pesos cuantizados publicado por el usuario treeish en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión a 4 bits del modelo base Ornith-1.5-9B (tipo declarado `qwen3_5`), realizada con la herramienta oQ de oMLX (versión v0.6.3rc2) mediante cuantización de precisión mixta. El resultado son pesos en formato MLX safetensors, pensados para ejecutarse en la GPU unificada de los chips Apple Silicon a través del ecosistema MLX.

El dato verificado más relevante es el recuento de parámetros extraído de los archivos safetensors: 9.409.813.744 parámetros (aproximadamente 9,41 mil millones). Con cuantización de 4 bits y group size 64, el peso teórico de los tensores se sitúa en torno a 4,4-5,5 GB, lo que permite ejecutar el modelo en equipos de consumo con memoria unificada moderada. El nombre del repositorio (`oQ4e-fp16`) sugiere una mezcla de capas cuantizadas a 4 bits con componentes mantenidos en fp16, aunque la model card no detalla qué capas concretas se preservan en mayor precisión.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio no incluye licencia, idiomas, pipeline, resultados de evaluación ni documentación sobre el modelo base. Tiene 0 descargas y 0 likes en el momento de la consulta, y los resultados de búsqueda web no aportan información adicional sobre Ornith-1.5-9B ni sobre el autor. Cualquier evaluación de capacidades, calidad tras la cuantización o idoneidad para producción debe considerarse pendiente de verificación empírica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el campo `model type` de la model card indica `qwen3_5` (familia Qwen 3.5) |
| Parametros totales | 9.409.813.744 (~9,41 mil millones, dato real de los safetensors) |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta oQ; el nombre del repo indica mezcla `oQ4e-fp16` |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |
| Libreria de inferencia | mlx |
| Herramienta de cuantizacion | oQ (oMLX v0.6.3rc2) |
| Fecha de creacion del repo | 2026-09-11T17:04:28Z |
| Ultima actualizacion | 2026-09-11T17:05:57Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Ornith-1.5-9B. El unico indicio es el campo `model type: qwen3_5` de la model card, que apunta a la familia Qwen 3.5, pero no se especifica si se trata de un transformer denso, una arquitectura hibrida con atencion lineal, un MoE ni cual es la composicion exacta de capas. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. Todo ello queda como no disponible.

Lo que si esta documentado es el proceso de posentrenamiento aplicado por el autor del repositorio: una cuantizacion de precision mixta con oQ (oMLX v0.6.3rc2), a 4 bits con group size 64, en formato MLX safetensors. La cuantizacion por grupos implica que los parametros se agrupan en bloques de 64 y cada bloque comparte una escala (y posiblemente un sesgo) almacenada en mayor precision; con 4 bits por peso, el sobrecoste de las escalas en fp16 equivale a unos 0,25 bits por parametro, es decir, en torno a 294 MB adicionales sobre los 4,7 GB de pesos puros. El sufijo `fp16` del nombre sugiere que determinadas capas o tensores se mantienen sin cuantizar para preservar calidad, practica habitual en esquemas de precision mixta, pero la model card no identifica cuales.

## Capacidades

- Generacion de texto: no documentada en el repositorio. Al no haber model card del modelo base ni evaluaciones, no es posible confirmar capacidades concretas.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio).
- Capacidades multimodales (vision, audio): no disponible; el repositorio solo contiene pesos de texto en formato MLX safetensors segun la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidad verificable: inferencia local en Apple Silicon mediante la libreria MLX, dado que los pesos estan en formato MLX safetensors y el repositorio declara `library_name: mlx`.

## Casos de uso

Nota previa: dado que el repositorio no documenta capacidades ni evaluaciones, los casos siguientes asumen que el modelo base Ornith-1.5-9B es un modelo de lenguaje de proposito general de la familia Qwen 3.5, extremo que el usuario debe verificar antes de comprometer un despliegue.

- Inferencia local con privacidad estricta en Mac: el formato MLX safetensors y la cuantizacion a 4 bits permiten ejecutar el modelo en la GPU unificada de un Apple Silicon sin enviar datos a servicios externos. Es adecuado para procesar documentos confidenciales (contratos, historiales, codigo propietario) en equipos donde no se permite salida a Internet.
- Prototipado en portatiles de gama media: con un peso estimado de 4,4-5,5 GB, el modelo cabe en equipos con 16 GB de memoria unificada, lo que lo hace util para desarrolladores que quieren iterar sobre prompts o interfaces sin acceso a GPU dedicada.
- Servidor de inferencia local para equipos pequenos: mediante `mlx_lm.server` es posible exponer los pesos como una API compatible con el esquema de OpenAI y consumirla desde herramientas internas, siempre que el modelo base responda adecuadamente a instrucciones.
- Evaluacion de esquemas de cuantizacion: este repositorio es un artefacto util para investigacion sobre precision mixta. Permite comparar la salida del modelo en oQ4e-fp16 frente a los pesos en fp16 del modelo base y medir la degradacion introducida por la cuantizacion a 4 bits con group size 64.
- Procesamiento por lotes sin conectividad: entornos air-gapped (laboratorios, buques, instalaciones industriales) pueden ejecutar scripts de resumen, extraccion o clasificacion de texto con `mlx_lm.generate` sin dependencia de red.
- Integracion en aplicaciones macOS: los pesos MLX pueden cargarse desde Swift mediante MLX Swift, lo que abre la puerta a asistentes de escritorio nativos que aprovechen la Neural Engine y la GPU del equipo con un consumo moderado de memoria.
- Reproducibilidad de pipelines de cuantizacion: al declarar herramienta (oQ), version (oMLX v0.6.3rc2), bits (4) y group size (64), el repositorio sirve como referencia para replicar el mismo esquema sobre otros modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de referencia, ni comparaciones con los pesos sin cuantizar del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: calculo derivado del recuento real de parametros. Con 4 bits por peso, los tensores ocupan aproximadamente 4,7 GB, a los que se suman unas escalas de grupo de 64 en fp16 (unos 294 MB) y las capas que se hayan mantenido en fp16, no documentadas. Estimacion razonable del peso total: 4,4-5,5 GB. A ello hay que anadir la cache KV, cuyo tamano depende de la longitud de contexto, que no se ha publicado.
- Memoria unificada recomendada: 16 GB como minimo practico en Apple Silicon (deja margen para el sistema y la cache KV); 32 GB o mas para contextos largos o ejecucion en paralelo con otras aplicaciones.
- GPU compatibles: exclusivamente Apple Silicon (familias M1, M2, M3, M4 y superiores) a traves de MLX. Los pesos en MLX safetensors no son cargables directamente por CUDA. No hay informacion sobre su uso en A100, H100 o RTX 4090; requeriria una conversion de formato no incluida en el repositorio.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Macs de consumo con memoria unificada suficiente. En GPUs dedicadas de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) seria teoricamente viable por tamano, pero no con este formato sin conversion previa.
- Opciones de despliegue: `mlx-lm` (generacion por linea de comandos y servidor), oMLX, MLX Swift para aplicaciones nativas, y entornos graficos que consuman MLX safetensors. vLLM, llama.cpp, Ollama y TGI no cargan este formato de forma nativa.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de tokens por segundo, tiempo a primer token ni comportamiento bajo batching.

## Comparativa con modelos similares

No hay informacion suficiente para comparar este modelo con alternativas concretas: se desconoce el modelo base exacto, su licencia, su contexto y su rendimiento, y el repositorio no ofrece evaluaciones. A modo de contexto sobre el formato de despliegue, la tabla siguiente compara el esquema de cuantizacion empleado con otros esquemas habituales; se trata de una comparacion de herramientas y formatos, no de modelos.

| Esquema | Formato | Precisión típica | Ecosistema de inferencia | Compatibilidad con este repo |
|---|---|---|---|---|
| oQ (oMLX v0.6.3rc2) | MLX safetensors | 4 bits, group size 64, precisión mixta | mlx-lm, oMLX, MLX Swift | Si, es el formato publicado |
| GGUF Q4_K_M | GGUF | 4-5 bits con mezcla por tensor | llama.cpp, Ollama, LM Studio | No incluido; requeriria conversion |
| AWQ / GPTQ | safetensors CUDA | 4 bits con escalas por grupo | vLLM, TGI, transformers | No incluido; requeriria conversion |

## Limitaciones y advertencias

- Licencia no disponible: sin licencia declarada no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueante para cualquier despliegue en produccion hasta que el autor lo aclare.
- Modelo base sin documentar: no hay model card de Ornith-1.5-9B en la informacion proporcionada, ni enlaces a su repositorio, papel o datos de entrenamiento. Se desconoce si esta alineado con instrucciones, que sesgos incorpora y que datos vio durante el entrenamiento.
- Riesgo de alucinacion: no evaluado. Al no existir benchmarks ni pruebas de veracidad, no hay base para estimar la tasa de fabricacion de hechos.
- Degradacion por cuantizacion: la cuantizacion a 4 bits con group size 64 introduce perdida de precision respecto a fp16. El grado de degradacion no se ha medido ni publicado; en tareas sensibles a matices (matematicas, razonamiento encadenado, generacion de codigo) la perdida puede ser notable.
- Idiomas no declarados: el campo de idiomas esta vacio, por lo que no hay garantia de rendimiento en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Dependencia de plataforma: los pesos MLX solo se ejecutan de forma nativa en Apple Silicon. Desplegarlos en infraestructura NVIDIA exige una conversion de formato no incluida ni validada.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay informes externos de funcionamiento, lo que aumenta el riesgo de artefactos en la cuantizacion.
- Metadatos a verificar: las fechas de creacion y actualizacion registradas (11 de septiembre de 2026) y la ausencia total de pipeline, idiomas y licencia sugieren un repositorio recien publicado y sin revisar.
- Los resultados de busqueda web realizados no aportaron ninguna fuente util: devolvieron unicamente paginas de inicio del buscador.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/treeish/Ornith-1.5-9B-oQ4e-fp16
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Repositorio de MLX (Apple): https://github.com/ml-explore/mlx
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Modelo base Ornith-1.5-9B: no disponible
- Papel o blog de presentacion del modelo base: no disponible
- Demos o espacios asociados: no disponible
