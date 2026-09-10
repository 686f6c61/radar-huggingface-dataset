# TiGa-RCE/gemma-4-12B-it-oQ3e

## Resumen

gemma-4-12B-it-oQ3e es una cuantizacion del modelo base gemma-4-12B-it, publicada por el usuario TiGa-RCE en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una version comprimida a 3 bits del checkpoint original, generada con la herramienta oQ (oMLX v0.6.4), que aplica cuantizacion de precision mixta. El artefacto resultante ocupa 5,5 GB en el repositorio y declara 11.907.350.320 parametros en sus ficheros safetensors.

El objetivo de esta publicacion es reducir el peso en memoria de un modelo de aproximadamente 12.000 millones de parametros para que pueda ejecutarse en equipos con memoria unificada limitada, en particular Macs con Apple Silicon, ya que el formato de pesos es MLX safetensors y la libreria declarada es mlx. La cuantizacion usa grupos de 64 elementos y una media de 3 bits, lo que situa el coste teorico en torno a 3,1 bits por peso una vez contabilizadas las escalas del grupo.

La relevancia de esta ficha es acotada y conviene ser explicitos: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no incluye model card con especificaciones del modelo base, no declara licencia ni idiomas, y no publica ningun resultado de benchmarks. Ademas, el autor indica que esta version sustituye a una anterior subida el mismo dia, por lo que los pesos previos quedan obsoletos. Toda la informacion no documentada se marca como "no disponible" a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card solo declara el tipo de modelo "gemma4_unified" y el modelo base gemma-4-12B-it; la arquitectura interna del modelo base no se documenta en la informacion proporcionada |
| Parametros totales | 11.907.350.320 (11,9 mil millones) segun los ficheros safetensors del repositorio |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3 bits con group size 64, cuantizacion de precision mixta mediante oQ (oMLX v0.6.4). No se documentan otros niveles de cuantizacion en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio. Al ser una cuantizacion de un modelo de terceros, la licencia aplicable deberia heredarse del modelo base, que no se especifica |
| Formato de pesos | MLX safetensors (safetensors con libreria mlx) |
| Tamano del repositorio | 5,5 GB |
| Tipo de artefacto | Cuantizacion de un modelo instruction-tuned (sufijo "-it") |
| Fecha de publicacion | 10 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base gemma-4-12B-it en el material proporcionado: la model card del repositorio cuantizado no describe capas, atencion, mecanismos de normalizacion ni tipo de transformer. Tampoco se documentan los datos de entrenamiento del modelo original, el numero de tokens utilizados, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO.

Lo unico verificable es el proceso de cuantizacion posterior al entrenamiento. Se ha aplicado oQ (oMLX v0.6.4), una herramienta de cuantizacion de precision mixta que asigna distintos niveles de bits a distintas partes del modelo en funcion de su sensibilidad, en lugar de usar un unico nivel uniforme. El resultado declarado es una media de 3 bits con grupos de 64 pesos. Con ese group size, cada grupo de 64 pesos necesita al menos una escala (y en la practica tambien un sesgo o zero-point), lo que anade del orden de 0,1 a 0,25 bits por peso; el total coherente con el tamano de repositorio de 5,5 GB para 11,9 mil millones de parametros es de aproximadamente 3,1 a 3,7 bits efectivos por peso.

El autor advierte de que esta cuantizacion se subio el 10 de septiembre de 2026 y reemplaza a una version anterior con la misma fecha, pidiendo a quien la hubiera descargado antes que vuelva a descargarla. Esto implica que circulan pesos distintos bajo el mismo identificador, un detalle relevante para la reproducibilidad.

## Capacidades

- Generacion de texto e instrucciones: el sufijo "-it" indica que el modelo base esta ajustado para seguir instrucciones, aunque la model card del repositorio cuantizado no detalla ninguna capacidad concreta.
- Razonamiento y matematicas: no documentado en la informacion proporcionada.
- Generacion de codigo: no documentado en la informacion proporcionada.
- Vision o multimodalidad: no documentado. El identificador "gemma4_unified" sugiere una arquitectura unificada, pero no hay confirmacion en la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible; el repositorio no declara lista de idiomas.
- Modo "thinking" o razonamiento explicito: no documentado.
- Capacidad de ejecucion local en Apple Silicon mediante MLX: si, es la unica capacidad verificable a nivel de artefacto, ya que los pesos estan en formato MLX safetensors y la libreria declarada es mlx.

Nota importante: las capacidades funcionales de este artefacto son, en teoria, las del modelo base gemma-4-12B-it, pero ni el repositorio ni los resultados de busqueda proporcionados las documentan. Cualquier afirmacion adicional seria una suposicion no verificada.

## Casos de uso

- Asistente local en un Mac con Apple Silicon: al estar en formato MLX y ocupar 5,5 GB, el modelo se puede cargar con mlx-lm en un equipo con memoria unificada de 16 GB o mas, permitiendo un asistente de texto sin conexion a servicios externos y sin coste por token.
- Prototipado rapido de aplicaciones de lenguaje: para equipos que desarrollan en macOS, esta cuantizacion permite iterar sobre prompts, plantillas y flujos de evaluacion sin necesidad de GPU dedicada, reduciendo el tiempo de ciclo respecto a un despliegue en servidor.
- Procesamiento por lotes de texto en local: resumen, reformulacion, extraccion de campos o clasificacion de documentos pueden ejecutarse por lotes en el propio portatil, siempre que el volumen de datos por peticion respete la ventana de contexto efectiva, que no esta documentada.
- Generacion y revision de codigo en el editor: un modelo instruction-tuned de 12B cuantizado a 3 bits es candidato a autocompletado, explicacion de funciones y generacion de tests integrado en el IDE mediante un servidor local compatible con MLX; conviene validar la calidad real, ya que no hay benchmarks publicados.
- Evaluacion comparativa de tecnicas de cuantizacion: el artefacto es util para investigadores que quieran medir la perdida de calidad de una cuantizacion oQ a 3 bits frente al modelo base en precision completa, usando sus propios conjuntos de evaluacion, dado que el autor no aporta ninguna.
- Educacion y experimentacion: permite estudiar el comportamiento de un modelo de ~12B en un ordenador personal, sin infraestructura de GPU, en cursos o proyectos de aprendizaje automatico.
- Traduccion y asistencia de redaccion: uso plausible como corrector y traductor local, pero sin datos que confirmen el soporte de idiomas distintos del ingles, por lo que requiere validacion previa con el idioma objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir el proceso de cuantizacion (3 bits, group size 64, oQ/oMLX v0.6.4) y no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MT-Bench ni de perplejidad. Los resultados de busqueda web proporcionados no contienen informacion tecnica relevante sobre este modelo.

Tampoco se documenta la degradacion esperada respecto al modelo base sin cuantizar, un dato critico cuando se baja a 3 bits, ya que en ese rango la perdida de calidad suele ser apreciable en tareas de razonamiento y codigo.

## Requisitos de hardware

- VRAM / memoria para pesos: aproximadamente 5,5 GB, el tamano declarado del repositorio. A esto hay que sumar la memoria de la cache KV y el overhead del runtime, por lo que en la practica conviene reservar entre 7 y 9 GB de memoria unificada para secuencias de longitud moderada; el valor exacto depende de la ventana de contexto, que no esta documentada.
- Cabe en GPU de consumo: no aplica directamente, porque el formato publicado es MLX, especifico de Apple Silicon. En ese ecosistema, encaja en equipos con 16 GB de memoria unificada o mas (por ejemplo, MacBook Pro con chip M-series de gama media o superior). En 8 GB de memoria unificada el margen es muy reducido.
- GPU recomendadas para CUDA: no disponible para este artefacto. Usarlo en CUDA o ROCm requeriria convertir los pesos a otro formato (por ejemplo GGUF o safetensors de PyTorch), una operacion no documentada en el repositorio y que puede degradar o alterar la cuantizacion mixta.
- Opciones de despliegue: mlx-lm y el ecosistema MLX en macOS son las vias naturales, dado el formato de pesos. Para vLLM, TGI, llama.cpp u Ollama no hay ficheros compatibles publicados en este repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de contexto de los modelos comparables, por lo que la comparacion se limita a caracteristicas verificables a nivel de artefacto.

| Modelo | Parametros | Formato | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma-4-12B-it-oQ3e (este modelo) | 11.907.350.320 | MLX safetensors | 3 bits, group size 64 (oQ) | No disponible | No disponible | Repositorio Hugging Face, 0 descargas |
| gemma-4-12B-it (modelo base) | No disponible | No disponible | Sin cuantizar (presumiblemente) | No disponible | No disponible | No se aporta el enlace en la informacion disponible |
| Otras cuantizaciones de la misma familia y herramienta (oQ/oMLX) | No disponible | MLX safetensors | No disponible | No disponible | No disponible | No disponible |
| Alternativas de ~12B en formato GGUF para llama.cpp u Ollama | No disponible | GGUF | 4-6 bits tipicamente | No disponible | No disponible | No disponible |

No se dispone de comparativas de rendimiento, ni de licencia, ni de contexto, ni de resultados de evaluacion para ninguno de los modelos de la tabla. Cualquier conclusion sobre cual es mejor seria especulativa.

## Limitaciones y advertencias

- Cuantizacion agresiva: 3 bits es un nivel muy bajo, incluso con precision mixta. Es esperable una degradacion notable en tareas de razonamiento, matematicas y codigo respecto al modelo sin cuantizar, aunque no hay mediciones publicadas que la cuantifiquen.
- Ausencia total de benchmarks: el autor no publica ninguna evaluacion, por lo que no hay evidencia objetiva de la calidad resultante.
- Sin licencia declarada: el repositorio no indica licencia. Al derivar de un modelo de terceros, es imprescindible verificar la licencia del modelo base antes de cualquier uso comercial; usar estos pesos sin esa comprobacion es un riesgo legal.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes. No hay informes independientes de calidad, estabilidad ni errores.
- Pesos reemplazados: el autor indica que esta version sustituye una subida anterior del mismo dia. Si se descargaron pesos previos, hay que volver a descargarlos; versiones distintas pueden circular bajo identificadores parecidos.
- Dependencia de plataforma: el formato MLX limita el uso a Apple Silicon. No es directamente desplegable en servidores con GPU NVIDIA o AMD sin conversion previa.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas; requiere validacion empirica.
- Contexto no documentado: se desconoce la ventana maxima soportada, un dato critico para aplicaciones de RAG o conversaciones largas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, agravado por la cuantizacion a 3 bits. No debe usarse sin supervision en dominios sensibles como salud, finanzas o asesoria legal.
- Sesgos: no documentados y no evaluados en este repositorio. Los sesgos del modelo base se heredan y pueden verse amplificados por la cuantizacion.
- Soporte de tool calling y agentes: no confirmado, por lo que no conviene construir flujos de agentes sobre este artefacto sin verificarlo antes.
- Trazabilidad limitada: no se indica el commit exacto del modelo base ni el procedimiento completo de cuantizacion, lo que dificulta reproducir el artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TiGa-RCE/gemma-4-12B-it-oQ3e
- Perfil del autor en Hugging Face: https://huggingface.co/TiGa-RCE
- Herramienta de cuantizacion oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- Modelo base gemma-4-12B-it: no se proporciona enlace en la informacion disponible
- Paper o blog tecnico del modelo base: no disponible
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos corresponden a un servicio de musica en streaming y no guardan relacion con la consulta.
