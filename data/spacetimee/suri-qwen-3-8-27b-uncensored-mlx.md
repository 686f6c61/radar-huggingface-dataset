# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-MLX

## Resumen

Suri-Qwen-3.8-27B-Uncensored-MLX es una version cuantizada a 4 bits en formato MLX del modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, un modelo de 27B de parametros (26.895.993.856 parametros reales segun los pesos safetensors) derivado de la familia Qwen3.8. Lo desarrolla el autor SpaceTimee (Space Time) y se publica como un modelo "uncensored" y "unaligned", es decir, explicitamente desalineado respecto a las capas habituales de rechazo y moderacion que incorporan los modelos comerciales. El repositorio tiene 15,2 GB y esta pensado para ejecucion local sobre Apple Silicon mediante la libreria MLX.

El problema que aborda es el de los desarrolladores que necesitan un modelo de gran tamano, con capacidades conversacionales, que no aplique rechazos automaticos sobre determinados temas, y que puedan ejecutar en hardware de consumo Apple sin depender de GPUs NVIDIA ni de APIs en la nube. Al estar cuantizado a 4 bits y usar MLX, el modelo es desplegable en equipos con memoria unificada moderada, algo que la version original en precision completa no permitiria con la misma facilidad.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de la categoria 27B con licencia no declarada y sin benchmarks publicados; por otro, es un ejemplo representativo de la corriente de modelos "uncensored" que circulan en HuggingFace con trazabilidad limitada sobre datos de entrenamiento, evaluacion y condiciones legales de uso. La fecha de creacion y ultima actualizacion del repositorio es el 26 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3_5 / qwen3.8; no se especifica la arquitectura interna en la informacion proporcionada) |
| Parametros totales | 26.895.993.856 (26,9 mil millones) |
| Parametros activos | no aplica: el modelo no se presenta como MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (formato MLX); no se documentan otros niveles |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors, cuantizados en MLX (4 bits) |
| Tamano del repositorio | 15,2 GB |
| Libreria de inferencia | MLX |
| Pipeline declarado | image-text-to-text |
| Modelo base | SpaceTimee/Suri-Qwen-3.8-27B-Uncensored (a su vez cuantizado respecto a el) |
| Fecha de publicacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo mas alla de las etiquetas del repositorio, que lo asocian a la familia Qwen (tags `qwen3_5` y `qwen3.8`) y a un tamano de 27B. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidad multimodal de entrada de imagen y texto, aunque la model card no documenta ningun componente de vision, proyector multimodal ni resolucion de imagen soportada. No se especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni si emplea atencion lineal, decodificacion especulativa u otras optimizaciones.

Tampoco se aportan datos sobre el entrenamiento: no hay numero de tokens, composicion del dataset, ni mencion a tecnicas de alineacion como RLHF, DPO o similares. Lo unico indicado es que se trata de un modelo "desalineado" (dealigned) y sin censura, lo que implica la eliminacion o neutralizacion de las capas de rechazo del modelo base, pero el metodo concreto (fine-tuning sobre datos sin filtrar, abliteration, merging u otro) no se describe. La unica transformacion verificable respecto al modelo base es la cuantizacion a 4 bits en formato MLX, que reduce el peso a 15,2 GB. Los parametros de muestreo recomendados por el autor son temperatura 0,7-1,0, top_p 0,8-0,95 y repetition_penalty 1-1,1.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles, segun los idiomas declarados en la model card.
- Procesamiento de entradas de imagen y texto: el pipeline declarado es `image-text-to-text`, aunque no se detalla el alcance real de la capacidad de vision ni las tareas soportadas (descripcion, VQA, OCR, etc.).
- Generacion sin filtros de rechazo: al presentarse como "uncensored" y "unaligned", el modelo no aplica las politicas de negativa tipicas de los modelos alineados, lo que se traduce en respuestas a peticiones que otros modelos rechazarian.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles; no se mencionan.
- Capacidades de codigo y matematicas: no documentadas explicitamente; no se aportan benchmarks ni ejemplos que las confirmen.

## Casos de uso

- Escritura creativa sin restricciones tematicas: el modelo puede generar narrativa, dialogos y ficcion sobre temas que los modelos alineados suelen rechazar (violencia, contenido adulto, temas controvertidos), lo que resulta util para autores que trabajan genero negro, terror o drama sin fricciones de moderacion.
- Investigacion sobre alineacion y rechazo: sirve como sujeto de comparacion frente a su modelo base alineado para estudiar como se comporta la distribucion de respuestas tras eliminar las capas de rechazo, por ejemplo midiendo tasas de cumplimiento en conjuntos de peticiones delicadas.
- Traduccion chino-ingles en local: con soporte declarado para ambos idiomas, puede utilizarse como traductor offline en entornos sin conectividad, integrado en un flujo de trabajo sobre un Mac con memoria unificada suficiente.
- Asistente conversacional privado en el puesto de trabajo: al ejecutarse integramente en local con MLX, ninguna peticion sale del equipo, lo que encaja en entornos con requisitos de confidencialidad donde no se permite enviar datos a APIs externas.
- Analisis de documentos con componente visual: dado el pipeline `image-text-to-text`, puede emplearse para describir o extraer informacion de capturas, diagramas o documentos escaneados, siempre que se valide experimentalmente el alcance real de la vision, no documentado.
- Generacion de datos sinteticos sin filtro: para entrenar o evaluar otros modelos en dominios donde se necesita corpus con lenguaje crudo o tematicas sensibles, evitando los rechazos que introducirian modelos alineados en la fase de generacion.
- Roleplay y personajes persistentes: la temperatura recomendada de 0,7-1,0 y la ausencia de rechazos lo hacen adecuado para simulaciones de personaje de larga duracion, con la advertencia de que la longitud de contexto no esta documentada.
- Prototipado de producto en Mac sin GPU dedicada: permite validar una idea de aplicacion LLM de categoria 27B en un portatil Apple antes de decidir si se migra a infraestructura con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base en precision completa.

## Requisitos de hardware

- Memoria unificada estimada: el repositorio pesa 15,2 GB en pesos de 4 bits. Sumando cache KV y overhead del runtime MLX, se estima un minimo practico de 18-20 GB de memoria unificada para inferencia con contextos cortos, y 24-32 GB o mas para contextos largos o lotes. Son estimaciones derivadas del tamano de los pesos, no cifras publicadas por el autor.
- Equipos Apple compatibles: Mac con chip de la familia M (M1/M2/M3/M4) y memoria unificada de 24 GB o superior. Un equipo de 16 GB queda por debajo del margen recomendable. Configuraciones de 32, 64 o 128 GB ofrecen holgura para contextos amplios.
- GPU NVIDIA: no aplicables directamente, ya que el modelo esta publicado en formato MLX, especifico de Apple Silicon. Para A100, H100 o RTX 4090 seria necesario reconvertir los pesos a otro formato, algo que el repositorio no proporciona.
- Cabe en GPU de consumo: no en el sentido habitual (RTX 3060/4090 con CUDA) porque no hay pesos GGUF ni safetensors en formato estandar de PyTorch; si cabe en Apple Silicon de gama alta con memoria unificada suficiente.
- Opciones de despliegue: MLX (libreria declarada). No se ofrecen pesos GGUF, por lo que llama.cpp y Ollama no son utilizables sin conversion previa. vLLM y TGI no soportan MLX de forma nativa. El tag `text-generation-inference` aparece en el repositorio, pero no hay evidencia de pesos compatibles con TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Uncensored-MLX | 26,9 mil millones | no disponible | 4 bits MLX | no disponible | safetensors MLX | HuggingFace, 0 descargas |
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos Qwen de clase 27B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos alternativos en la informacion proporcionada (parametros, contexto, rendimiento ni licencia de las alternativas), por lo que la comparativa cuantitativa no puede completarse sin recurrir a fuentes externas.

## Limitaciones y advertencias

- Modelo explicitamente desalineado: al estar marcado como "uncensored" y "unaligned", carece de las capas de rechazo del modelo base. Puede generar contenido danino, ilegal, violento o sexual sin filtro. El usuario asume toda la responsabilidad legal y etica sobre las salidas.
- Licencia no declarada: no hay licencia en el repositorio ni en la model card. Esto impide determinar si el uso comercial esta permitido. En la practica, usar este modelo en produccion conlleva un riesgo legal no resuelto.
- Riesgo de alucinacion: no hay evaluaciones de fidelidad ni de tasas de alucinacion. Al tratarse de un modelo desalineado y sin benchmarks, no existe evidencia de que mantenga la precision factual del modelo base tras el proceso de "uncensoring".
- Contexto no documentado: se desconoce la ventana de contexto real, lo que dificulta dimensionar aplicaciones de contexto largo o conversaciones multi-turno extensas.
- Cobertura idiomatica limitada: solo chino e ingles declarados. El castellano no figura entre los idiomas soportados, por lo que el rendimiento en espanol es incierto y deberia validarse antes de cualquier uso.
- Formato propietario de facto: al ser MLX, no es directamente portable a CUDA, llama.cpp, Ollama, vLLM o TGI sin conversion. Esto limita el despliegue en infraestructura de servidor convencional.
- Perdida de calidad por cuantizacion: la cuantizacion a 4 bits puede degradar el rendimiento respecto al modelo base en precision completa, especialmente en tareas de razonamiento y matematicas. No hay mediciones que cuantifiquen esta perdida.
- Trazabilidad limitada: 0 descargas y 0 likes, sin paper, sin informe tecnico y sin datos de entrenamiento. La cadena de modelos base (Qwen3.8 27B) no se puede verificar en la informacion proporcionada y la nomenclatura de tags mezcla `qwen3_5` y `qwen3.8`, lo que genera ambiguedad sobre la generacion real del modelo subyacente.
- Capacidad multimodal no confirmada: el pipeline es `image-text-to-text`, pero la model card no documenta ningun componente de vision. La funcionalidad de imagen deberia validarse experimentalmente antes de integrarla en un producto.
- Fechas de publicacion y actualizacion en 2026: el repositorio es muy reciente y no ha pasado por una fase de validacion por parte de la comunidad. No hay issues, discusiones ni terceros que hayan reproducido resultados.
- Requisitos de memoria no triviales: pese a la cuantizacion, 15,2 GB de pesos implican equipos Apple de gama alta; no es un modelo apto para Mac con 8 o 16 GB.
- Parametros de muestreo recomendados por el autor (temperatura 0,7-1,0 y top_p 0,8-0,95) son relativamente altos, lo que favorece la variedad a costa de la consistencia; para tareas de precision conviene bajarlos y validar el efecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-MLX
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Perfil del autor en linux.do: https://linux.do/u/spacetime
- Contacto del autor (correo): Zeus6_6@163.com
- Grupo QQ del autor: 902575634
- Paper, blog tecnico o repositorio de codigo: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
