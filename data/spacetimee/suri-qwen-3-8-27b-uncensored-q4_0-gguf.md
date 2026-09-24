# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q4_0-GGUF

## Resumen

Suri-Qwen-3.8-27B-Uncensored-Q4_0-GGUF es una conversion a formato GGUF del modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, realizada por el propio autor mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai. Se trata, por tanto, de un artefacto de cuantizacion orientado a inferencia local y no de un modelo entrenado desde cero: el repositorio contiene unicamente pesos en el formato de llama.cpp, con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y un tamano de repositorio de 15,5 GB.

La relevancia de esta ficha es practica: permite ejecutar un modelo de ~27B en hardware de consumo gracias a la cuantizacion Q4_0, que reduce el peso a unos 15,5 GB. El nombre del modelo sugiere un linaje Qwen y un ajuste orientado a eliminar el filtrado de contenido (la etiqueta "Uncensored"), pero no hay documentacion tecnica publicada que confirme arquitectura, datos de entrenamiento ni procedimiento de alineamiento.

La informacion disponible es muy limitada: la model card del repositorio GGUF remite a la model card original, que no se ha proporcionado. No constan licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks. Las busquedas web realizadas no devolvieron ninguna fuente tecnica relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se desconoce la arquitectura del modelo base; el tag "transformers" y la conversion a GGUF indican compatibilidad con llama.cpp) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero es solo un valor de ejemplo, no una especificacion) |
| Tipos de cuantizacion | Q4_0 (unico fichero publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `suri-qwen-3.8-27b-uncensored-q4_0.gguf`) |

Datos adicionales verificados:

| Parametro | Valor |
|---|---|
| Autor del repositorio | SpaceTimee |
| Modelo base | SpaceTimee/Suri-Qwen-3.8-27B-Uncensored |
| Herramienta de conversion | llama.cpp / GGUF-my-repo (ggml.ai) |
| Tamano del repositorio | 15,5 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

No se dispone de informacion verificada sobre la arquitectura del modelo base. La model card del repositorio GGUF se limita a indicar que los pesos se convirtieron desde `SpaceTimee/Suri-Qwen-3.8-27B-Uncensored` mediante llama.cpp, y remite a la model card original para mas detalles; dicha model card original no forma parte de la informacion proporcionada. El nombre del modelo sugiere una posible derivacion de la familia Qwen y un ajuste de tipo "uncensored", pero no existe confirmacion documental de ello, ni de si se trata de un fine-tuning, un merge de modelos o un entrenamiento adicional.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la presencia de fases de RLHF, DPO u otro tipo de alineamiento, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.). La unica transformacion documentada es la cuantizacion a Q4_0, que reduce la precision de los pesos a 4 bits por parametro en un esquema de cuantizacion por bloques de llama.cpp. Cabe senalar que el identificador "3.8-27B" no corresponde a ninguna denominacion oficial conocida de la familia Qwen, por lo que no debe asumirse equivalencia con modelos oficiales de esa familia.

## Capacidades

La informacion disponible no documenta capacidades especificas. A partir de los datos verificables solo puede afirmarse lo siguiente:

- Generacion de texto autoregresiva: el modelo es invocable desde `llama-cli` y `llama-server`, por lo que soporta generacion de texto estandar y modo prompt-completion.
- Inferencia local sin conexion: al ser un GGUF, puede ejecutarse integramente en local, sin dependencia de APIs externas.
- Modo servidor compatible con OpenAI: `llama-server` expone una API HTTP; el tag `endpoints_compatible` del repositorio apunta a compatibilidad con endpoints de inferencia gestionados.
- Razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente, modo "thinking", audio y capacidades multilingues: no disponibles. No hay ninguna fuente que confirme o niegue estas capacidades.
- Comportamiento "uncensored": el nombre del modelo base sugiere un ajuste destinado a reducir las negativas o el filtrado de contenido, pero el alcance real de ese ajuste no esta documentado.

## Casos de uso

Los siguientes casos se derivan de las caracteristicas verificables (modelo de ~27B en 4 bits, ejecutable con llama.cpp, sin requisitos de red). No implican que el modelo rinda bien en ellos, ya que no hay evaluaciones publicadas.

- Escritura creativa y narrativa en local: el modelo puede desplegarse en un equipo con 24 GB de VRAM y usarse para generar relatos, dialogos o guiones sin enviar el texto a servicios externos, lo que resulta util cuando el material es confidencial o experimental.
- Role-play y generacion de personajes: un modelo etiquetado como "uncensored" es habitualmente empleado en aplicaciones de conversacion de personaje; la cuantizacion Q4_0 permite mantener varias sesiones en un unico equipo de consumo.
- Investigacion sobre comportamiento de modelos: util para estudiar como varia la tasa de rechazo, el tono o la adherencia a instrucciones entre un modelo alineado y su variante sin filtrado, en entornos controlados y con fines academicos.
- Anotacion y clasificacion de texto sensible: procesamiento por lotes de corpus que contienen lenguaje vulgar, contenido medico, legal o de seguridad, donde los modelos fuertemente alineados suelen producir rechazos que interrumpen el pipeline.
- Procesamiento de datos privados en local: analisis de documentacion interna, correos o registros que no pueden salir de la organizacion, aprovechando que la inferencia ocurre en la maquina del usuario.
- Prototipado rapido sin coste de API: al ejecutarse con `llama-server` sobre un fichero GGUF, permite levantar un endpoint compatible con OpenAI en minutos para pruebas de integracion antes de decidir si se migra a un modelo mayor o a un servicio gestionado.
- Traduccion y reescritura de textos informales: util para normalizar o traducir contenido con registro coloquial o vulgar, un escenario donde el filtrado excesivo degrada la calidad de la salida.
- Despliegue en estaciones de trabajo sin GPU dedicada: el fichero de 15,5 GB puede ejecutarse en CPU con RAM suficiente o en Apple Silicon con memoria unificada, lo que habilita pruebas en portatiles de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base. Las busquedas web realizadas no devolvieron ninguna fuente tecnica relacionada con el modelo (los resultados obtenidos correspondian a sitios de streaming de peliculas, sin relacion alguna).

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del tamano del fichero y del esquema de cuantizacion, no datos publicados por el autor.

- Peso en disco y en memoria de los pesos: aproximadamente 15,5 GB para el fichero Q4_0 con ~26,9B parametros.
- VRAM estimada para inferencia: en torno a 16-18 GB con contextos cortos (2048 tokens) y batches pequenos, sumando pesos y cache KV. Con contextos largos la cache KV crece de forma aproximadamente lineal y puede anadir varios GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 5090, A6000, L40S o cualquier GPU con 24 GB o mas de VRAM. Una RTX 4080 de 16 GB queda al limite y obligaria a descargar parte de las capas a CPU.
- Multi-GPU: dos RTX 3090 o dos RTX 4090 permiten repartir capas y dejar margen para contextos amplios y mayor tamano de batch.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090, 5090). En tarjetas de 16 GB o menos, solo con offload parcial a CPU, con la consiguiente perdida de velocidad.
- Ejecucion en CPU y Apple Silicon: requiere al menos 32 GB de RAM del sistema o memoria unificada para operar con comodidad; 16 GB resulta insuficiente una vez contabilizados pesos, cache KV y el propio sistema operativo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), por ser el formato nativo. Tambien Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM incorpora soporte GGUF experimental; TGI no soporta GGUF de forma nativa, por lo que requeriria reconvertir a safetensors.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas ni datos de tokens por segundo para este artefacto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos verificables de modelos comparables (parametros, contexto, benchmarks, licencia) que permitan establecer una comparacion rigurosa. Ademas, el modelo base del que deriva esta cuantizacion carece de documentacion publica accesible en las fuentes consultadas, por lo que cualquier tabla comparativa implicaria inventar cifras. Como referencia puramente estructural, el artefacto pertenece a la categoria de modelos densos de aproximadamente 27B parametros distribuidos en GGUF Q4_0, pero no se dispone de datos que permitan contrastarlo con alternativas concretas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no constan arquitectura, datos de entrenamiento, proceso de alineamiento ni evaluaciones, lo que impide estimar su calidad de forma fiable.
- Licencia no disponible: sin una licencia explicita no puede asumirse permiso para uso comercial. En ausencia de licencia, el uso en produccion conlleva riesgo juridico.
- Riesgo de alucinacion: no hay evaluaciones que lo cuantifiquen. Como en cualquier modelo de lenguaje, no debe confiarse en sus salidas para decisiones criticas sin verificacion humana.
- Sesgos: no documentados. Un ajuste orientado a eliminar filtros de contenido puede aumentar la probabilidad de generar material ofensivo, estereotipado o danino, y reduce las salvaguardas habituales.
- Idiomas y contexto desconocidos: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas, ni saber cual es la ventana de contexto efectiva del modelo base.
- Perdida de calidad por cuantizacion: Q4_0 es un esquema de 4 bits relativamente agresivo y suele degradar mas la calidad que variantes como Q4_K_M, Q5_K_M o Q6_K. El repositorio no ofrece alternativas de mayor precision.
- Modelo cuantizado, no ajustable: este repositorio solo contiene pesos GGUF. No admite entrenamiento ni fine-tuning adicional; para ello habria que partir del modelo base en safetensors.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Nomenclatura no estandar: el identificador "Qwen-3.8-27B" no corresponde a ninguna serie oficial conocida, por lo que no debe asumirse equivalencia con modelos Qwen publicados.
- Fecha de publicacion posterior a la ventana de referencia habitual: el repositorio esta fechado en septiembre de 2026 y no cuenta con historial de mantenimiento.

## Enlaces

- Repositorio HuggingFace (GGUF Q4_0): https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q4_0-GGUF
- Modelo base (referenciado en la model card): https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage

No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios auxiliares) en la busqueda web realizada.
