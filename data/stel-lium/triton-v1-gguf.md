# STEL-LIUM/Triton-v1-GGUF

## Resumen

Triton v1 (nombre interno de build: q38b) es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de 35.000 millones de parametros totales con aproximadamente 3.000 millones de parametros activos por token, desarrollado por STEL-LIUM como motor de su aplicacion de escritorio Triton. No es un modelo entrenado desde cero: es una mezcla de pesos (weight merge) de varios modelos abiertos que comparten la arquitectura Qwen3.6 MoE, lo que permite fusionarlos capa por capa sin reentrenamiento. El repositorio publicado contiene la cuantizacion Q4_K_M en formato GGUF (21,7 GB) y el proyector de vision en bf16 (0,9 GB), listos para llama.cpp.

El modelo combina cuatro padres: Ornith-1.5-35B-A3B como padre principal, KAT-Coder-V2.5-Dev integrado sobre la base Qwen3.6-35B-A3B, y una correccion diferencial de Empero Qwen3.8-35B-A3B-Distill. El resultado conserva de la mezcla base los routers de expertos, los embeddings, la cabeza de salida, la cabeza MTP (draft) y la torre de vision. La relevancia actual del proyecto radica en su enfoque de despliegue local: un MoE de 35B con vision y tool calling que cabe en hardware de consumo gracias a sus 3B activos y a la cuantizacion de 4 bits.

La ficha se basa unicamente en los datos publicados por el autor en la model card y en el repositorio de Hugging Face. Muchas metricas habituales (MMLU, HumanEval, GSM8K) no estan disponibles; el autor aporta en su lugar pruebas propias de caracter cualitativo y un resultado aislado en AIME 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6 MoE, nombre de arquitectura en llama.cpp: `qwen35moe`) |
| Parametros totales | 35.000 millones (aprox.); el campo safetensors del repo indica 446.571.248, dato no coherente con la model card |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | No disponible (la model card no la especifica; el autor no ha medido la calidad en contexto muy largo) |
| Tipos de cuantizacion | Q4_K_M publicada; el autor no documenta otras cuantizaciones en este repo |
| Idiomas soportados | Ingles (unico idioma declarado); el autor no reclama calidad multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + proyector de vision GGUF en bf16 |
| Vision | Si, mediante `mmproj-triton-v1-bf16.gguf` |
| Cabeza MTP (draft) | Incluida en el GGUF del modelo de lenguaje |
| Tamano del repo | 0,9 GB (segun Hugging Face); los ficheros descritos suman 22,6 GB |

## Arquitectura y entrenamiento

Triton v1 es el resultado de una fusion de pesos en dos etapas, ejecutada con un script de merge escrito especificamente para el proyecto. En la primera etapa se construye la mezcla base "a0": Ornith-1.5-35B-A3B actua como padre principal, con KAT-Coder-V2.5-Dev integrado sobre la base Qwen3.6-35B-A3B. En la segunda etapa, Triton v1 se obtiene como a0 mas 0,5 x (Empero Qwen3.8-35B-A3B-Distill menos Qwen3.6-35B-A3B), es decir, una interpolacion diferencial que aplica la mitad de la diferencia entre el modelo destilado de Empero y la base Qwen3.6. De a0 se conservan intactos los routers de expertos, los embeddings, la cabeza de salida, la cabeza MTP y la torre de vision.

Como todos los modelos padre comparten la arquitectura Qwen3.6 MoE, la fusion es peso a peso y no requiere alineacion de tensores ni vocabularios. No se utilizaron datos de entrenamiento nuevos para la mezcla: el conocimiento proviene integramente de los modelos originales. El resultado se convirtio a GGUF y se cuantizo a Q4_K_M. La cabeza MTP (multi-token prediction) actua como cabeza draft, lo que habilita decodificacion especulativa en llama.cpp. La torre de vision se distribuye por separado como proyector mmproj.

## Capacidades

- Generacion de texto y respuestas largas: en una prueba de generacion de 8.900 tokens, el modelo completo las 40 secciones solicitadas sin entrar en bucles, a unos 103 tokens por segundo en el equipo del autor.
- Codigo: resolvio 5 de 5 tareas en un examen propio de agente programador (evaluador de expresiones, contador thread-safe, ordenacion topologica con ciclos, parser CSV), repetido en 3 ejecuciones; en cada una, una tarea agoto el limite de pasos en lugar de terminar limpiamente.
- Tool calling y function calling: en 4 tareas de reparacion multietapa con un bucle de herramientas real (inventario, libro contable, paginador, kit de texto), las 4 terminaron con los tests en verde; 2 de ellas agotaron antes el presupuesto de pasos.
- Agentes y razonamiento multi-paso: la construccion de un grafo de workflow de Triton a partir de una peticion en lenguaje natural funciono en 3 de 4 turnos de chat.
- Razonamiento matematico: 50,0 % en AIME 2026 (30 problemas, un intento por problema) con el mismo arnes que el padre a0, que obtuvo 53,3 %.
- Vision: lectura de graficos (valores y comparacion de barras) y descripcion de renders CAD; el modelo se carga con el proyector mmproj.
- Salida estructurada: conversion de texto desordenado a JSON conforme a un esquema dado, con validacion de claves y tipos.
- Razonamiento de ingenieria: calculos verificables como la carga axial admisible de un tornillo M8 8.8 con factor de seguridad 2 (300 MPa x 36,6 mm² = 10.980 N) o la explicacion de relaciones de engranajes (48/12 = 4:1).
- Integracion con herramientas CAD de la aplicacion Triton: planificacion de producto, diseno de piezas, comprobacion de ajustes, cribado de tensiones y lista de materiales; requiere la aplicacion de escritorio, no solo el GGUF.
- Escritura y traduccion: descripcion breve de producto y su traduccion al espanol en el ejemplo publicado.
- Capacidades no reclamadas por el autor: calidad multilingue, escritura creativa y calidad en contexto muy largo (sin mediciones).

## Casos de uso

- Asistente de programacion local: el modelo puede generar y depurar funciones en un entorno de desarrollo sin conexion, como demuestra el ejemplo de `merge_intervals` validado contra 6 casos de prueba y la correccion de un denominador mal contado en una funcion `average()`. Es adecuado por su rendimiento en codigo y su capacidad de ejecutar tool calling dentro de un bucle de agente.
- Agente de automatizacion con herramientas: en escenarios de reparacion multietapa (inventario, contabilidad, paginacion), el modelo encadena llamadas a herramientas, espera resultados y corrige el rumbo. Encaja en pipelines donde el modelo debe operar sobre APIs internas con presupuesto de pasos acotado.
- Extraccion de datos no estructurados: conversion de texto libre a JSON conforme a un esquema, util para ingesta de documentos, formularios o correos en sistemas backend donde se exige salida validable.
- Analisis de documentos con vision: lectura de graficos y tablas en imagenes (comparacion de barras por trimestre) y descripcion de renders tecnicos, aplicable a revision de informes, paneles de control o documentacion de producto.
- Asistencia en ingenieria mecanica: calculos de tornillos, relaciones de engranajes y explicaciones tecnicas en lenguaje llano, con resultados verificables a mano; adecuado como apoyo a ingenieros que necesitan comprobaciones rapidas con validacion humana posterior.
- Diseno asistido por ordenador dentro de la aplicacion Triton: planificacion de producto, desglose en piezas, comprobacion de ajustes y generacion de lista de materiales. Requiere la aplicacion de escritorio; el autor advierte que los planes de producto aun contienen errores de ingenieria y necesitan revision humana.
- Despliegue en estaciones de trabajo sin GPU de datacenter: al ser un MoE de 3B activos en Q4_K_M, es viable en equipos de consumo para chat, codigo y agentes, con la latencia medida por el autor (unos 103 tok/s en su equipo).

## Benchmarks y rendimiento

| Benchmark | Triton v1 | Padre a0 | Notas |
|---|---|---|---|
| AIME 2026 (30 problemas, 1 intento) | 50,0 % | 53,3 % | Mismo arnes de evaluacion |
| Examen propio de codigo de agente (5 tareas x 3 ejecuciones) | 5/5 en las 3 ejecuciones | No disponible | En cada ejecucion una tarea agoto el limite de pasos |
| Tareas de reparacion con bucle de herramientas (4 tareas) | 4/4 con tests en verde | No disponible | 2 de 4 agotaron el presupuesto de pasos |
| Construccion de grafo de workflow desde lenguaje natural | 3/4 turnos | No disponible | 1 turno se rindio |
| Generacion larga (8.900 tokens, 40 secciones) | 40/40 sin bucles, ~103 tok/s | No disponible | Medicion end-to-end en el equipo del autor |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks publicos de vision en la informacion disponible. El autor indica explicitamente que el modelo no supera a los grandes modelos frontera en matematicas dificiles ni en codigo cientifico.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 21,7 GB y el proyector de vision 0,9 GB; se necesita espacio suficiente para ambos mas la cache KV, por lo que en la practica se requieren mas de 23 GB de memoria disponible para uso con vision.
- GPU recomendadas: no especificadas por el autor. Por tamano, encaja en GPU de 24 GB o mas (RTX 4090, RTX 3090, A10G, L4 en configuraciones con memoria suficiente) y en A100/H100 para despliegues con mayor concurrencia.
- GPU de consumo: si cabe en tarjetas de 24 GB en Q4_K_M; en tarjetas de 16 GB o menos no cabe la cuantizacion publicada sin offloading a CPU/RAM.
- Opciones de despliegue: llama.cpp con soporte de la arquitectura `qwen35moe` y de vision (`mmproj`); el autor probo con su propio fork de llama.cpp y advierte de que no ha probado llama.cpp estandar con este modelo. No se documentan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: aproximadamente 103 tokens por segundo en generacion de 8.900 tokens, medido end-to-end en el equipo del autor (tokens generados divididos por tiempo total de la peticion). No hay datos de latencia por token ni de throughput con concurrencia.
- La cabeza MTP incluida permite decodificacion especulativa en llama.cpp, lo que puede mejorar el throughput respecto a un modelo sin cabeza draft.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Vision | Formato publicado |
|---|---|---|---|---|---|---|
| Triton v1 (este) | ~35B | ~3B | No disponible | Apache 2.0 | Si (mmproj) | GGUF Q4_K_M |
| Qwen3.6-35B-A3B (padre) | 35B | 3B | No disponible | No disponible en la informacion | No disponible | No disponible |
| Ornith-1.5-35B-A3B (padre) | 35B | 3B | No disponible | No disponible en la informacion | No disponible | No disponible |
| KAT-Coder-V2.5-Dev (padre) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |
| Empero Qwen3.8-35B-A3B-Distill (padre) | 35B | 3B | No disponible | No disponible | No disponible | No disponible |

La comparacion con alternativas de la misma categoria no puede completarse con los datos disponibles: la informacion proporcionada solo describe los modelos padre, de los que no se detallan contexto, licencia ni benchmarks. No se dispone de datos de rendimiento comparables entre Triton v1 y modelos externos de tamano similar.

## Limitaciones y advertencias

- Es una fusion de pesos, no un modelo entrenado: no aporta conocimiento nuevo y su calidad queda acotada por la de los padres. El autor reconoce que no supera a los modelos frontera en matematicas dificiles ni en codigo cientifico.
- Resultado inferior al padre a0 en AIME 2026 (50,0 % frente a 53,3 %), lo que sugiere una ligera perdida de capacidad de razonamiento matematico tras la mezcla.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de fidelidad factual ni de tasa de alucinacion en la informacion disponible.
- Idiomas: solo se declara ingles. El autor no reclama calidad multilingue; el ejemplo de traduccion al espanol es una prueba cualitativa aislada, no una validacion del soporte del idioma.
- Contexto: no se especifica la longitud de contexto soportada ni se ha medido la calidad en contexto muy largo; no se recomienda su uso en tareas que dependan de ventanas extensas sin validacion previa.
- Escritura creativa: el autor no reclama calidad en este ambito y no aporta mediciones.
- Herramientas CAD: requieren la aplicacion de escritorio Triton, no funcionan solo con el GGUF. El autor advierte de que la funcion esta en fase temprana y que sus planes de producto contienen errores de ingenieria que exigen revision humana.
- Compatibilidad de despliegue: el autor solo ha probado su propio fork de llama.cpp; no ha validado llama.cpp estandar ni otros motores. Verificar el soporte de `qwen35moe` y `mmproj` antes de desplegar.
- Licencia Apache 2.0: permite uso comercial, pero al ser una fusion de modelos con licencias propias, conviene revisar las condiciones de cada padre (no detalladas en la informacion disponible) antes de un uso en produccion.
- Datos incoherentes en el repositorio: el campo de parametros safetensors (446.571.248) no concuerda con los 35B declarados en la model card ni con el tamano del fichero (21,7 GB); el tamano del repo en Hugging Face (0,9 GB) tampoco coincide con la suma de ficheros descritos. Conviene verificar la integridad de los artefactos antes de usarlos.
- Madurez: modelo con 0 descargas y 0 likes en el momento de la consulta, publicado el 6 de noviembre de 2026; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/STEL-LIUM/Triton-v1-GGUF
- Organizacion en Hugging Face (triton-engine): https://huggingface.co/STEL-LIUM/triton-engine
- GitHub de STEL-LIUM: https://github.com/STEL-LIUM
- Extensiones de Triton (add-ons opcionales): https://github.com/STEL-LIUM/triton-extensions
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo base Empero Qwen3.8-35B-A3B-Distill: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo base Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base KAT-Coder-V2.5-Dev: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
