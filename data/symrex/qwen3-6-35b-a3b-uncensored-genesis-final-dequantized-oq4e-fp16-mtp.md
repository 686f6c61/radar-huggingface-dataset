# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ4e-fp16-mtp

## Resumen

symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ4e-fp16-mtp es un modelo derivado publicado en Hugging Face por el usuario symrex el 16 de septiembre de 2026. No se trata de un modelo entrenado desde cero, sino de una version cuantizada con la herramienta oQ (oMLX v0.6.4) en precision mixta de 4 bits, en formato MLX safetensors, pensada para inferencia en Apple Silicon. El repositorio ocupa 22,5 GB y declara 35.951.822.704 parametros totales segun los pesos safetensors.

El nombre del repositorio sugiere que la base es un modelo de arquitectura MoE de la familia Qwen con aproximadamente 3.000 millones de parametros activos (sufijo "A3B"), afinado para eliminar filtros de rechazo ("Uncensored-Genesis-Final"). El campo model_type del repositorio es qwen3_5_moe. Conviene subrayar que no existe documentacion publica verificable sobre el modelo base, el proceso de entrenamiento ni el afinado, y que el propio autor no publica model card mas alla de los detalles de cuantizacion. Los sufijos "dequantized", "oQ4e", "fp16" y "mtp" del nombre no estan explicados en la informacion disponible.

La relevancia de esta ficha es doble. Por un lado, documenta un caso tipico de la cadena de derivados en Hugging Face: cuantizacion de un modelo ajeno, sin metricas ni garantias de reproducibilidad, con cero descargas y cero likes en el momento de la consulta. Por otro, sirve como ejemplo practico de despliegue de un MoE de ~36.000 millones de parametros en 4 bits sobre hardware de consumo Apple. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (model_type declarado: qwen3_5_moe); detalles de capas, numero de expertos y enrutado no disponibles |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible en la model card; el sufijo "A3B" del nombre sugiere ~3.000 millones activos, sin confirmar |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantizacion de precision mixta con oQ (oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (library_name: mlx) |
| Tamano del repositorio | 22,5 GB |
| Fecha de publicacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion tecnica verificable procede de la model card: se trata de un modelo de tipo qwen3_5_moe cuantizado con oQ (oMLX v0.6.4) en precision mixta de 4 bits con group size 64. El oQ es un esquema de cuantizacion mixta que asigna distinto numero de bits a distintas capas o tensores segun su sensibilidad, lo que en la practica produce un promedio de bits por parametro ligeramente superior a 4. Con 35.951.822.704 parametros y 22,5 GB de repositorio, el peso medio por parametro se situa en torno a 5 bits, un valor coherente con 4 bits mas escalas y sesgos de grupo, y con la posibilidad de que algunas capas se conserven en fp16 como indica el nombre del repositorio.

No hay ningun dato publico sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF, DPO u otros) ni las innovaciones tecnicas del modelo base. El sufijo "mtp" podria referirse a multi-token prediction y el termino "dequantized" resulta contradictorio con la etiqueta de 4 bits, pero ninguna de las dos hipotesis esta documentada. Tampoco se especifica si el afinado "Uncensored" se realizo sobre el modelo base completo o sobre una version ya cuantizada, ni que tecnica se empleo para eliminar los rechazos.

## Capacidades

- Generacion de texto y conversacion multi-turno: no verificadas en este repositorio, pero previsibles por su linaje Qwen; el autor no publica evaluaciones.
- Razonamiento y matematicas: capacidad esperable en un MoE de ~36.000 millones de parametros, sin datos que la respalden.
- Generacion de codigo: no confirmada; no se documentan resultados de HumanEval, MBPP ni similares.
- Tool calling y function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; la model card no enumera idiomas.
- Modo de pensamiento o razonamiento explicito: no disponible.
- Vision o audio: no disponible; los tags del repositorio solo mencionan mlx, oq, quantized, 4-bit y safetensors.
- Comportamiento sin filtros de rechazo: es la unica capacidad que el nombre del repositorio afirma explicitamente ("Uncensored"), sin ninguna evaluacion publicada que lo cuantifique.

## Casos de uso

- Inferencia local privada en Mac: al estar en formato MLX con 22,5 GB de pesos, el modelo puede ejecutarse integramente en un Apple Silicon con memoria unificada suficiente, sin enviar datos a la nube; adecuado para procesar documentos sensibles de empresa o expedientes personales.
- Prototipado y evaluacion de arquitecturas MoE: util para desarrolladores que quieran medir en su propio hardware el comportamiento de un MoE de ~36.000 millones de parametros en 4 bits antes de comprometerse con infraestructura mayor.
- Generacion de texto creativo sin restricciones tematicas: el afinado declarado como "uncensored" apunta a escritura de ficcion, guiones o narrativa con tematicas que los modelos alineados suelen rechazar; requiere revision humana del contenido generado.
- Red teaming y estudio de alineacion: investigador que necesite un modelo con filtros reducidos como linea base para comparar tasas de cumplimiento, toxicidad o alucinacion frente a modelos alineados.
- Asistente conversacional de escritorio: integrable en aplicaciones locales tipo LM Studio o servidor mlx-lm para tareas de resumen, reescritura y respuesta a preguntas sobre corpus propios.
- Pipeline de generacion aumentada por recuperacion (RAG) en local: el modelo puede actuar como generador final sobre fragmentos recuperados de una base documental, manteniendo todo el circuito en la maquina del usuario.
- Traduccion y tratamiento de textos multilingues: uso plausible si el modelo base conserva las capacidades multilingues de la familia Qwen, aunque este repositorio no documenta idiomas soportados.
- Conversion a GGUF para otros backends: los pesos MLX pueden convertirse para su uso en llama.cpp u Ollama, lo que permitiria desplegar el modelo tambien en GPU CUDA o en CPU, a costa de un paso adicional de conversion y verificacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye en la model card ninguna tabla de MMLU, GSM8K, HumanEval ni de evaluacion de calidad tras la cuantizacion, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Tampoco hay datos de perplejidad ni de degradacion respecto al modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los 22,5 GB de pesos exigen al menos 24 GB de memoria disponible; con cache KV y margen de trabajo, el objetivo razonable es 32 GB o mas para contextos cortos y 48-64 GB para contextos largos.
- Apple Silicon recomendado: chips Max o Ultra con memoria unificada de 48 GB o superior (M2 Max 64 GB, M3 Max 48/64 GB, M4 Max 128 GB, M2/M3 Ultra 64-192 GB). Un equipo de 32 GB puede cargar el modelo, pero con muy poco margen para el cache KV.
- GPU discreta: MLX esta disenado para Apple Silicon; para ejecutar en NVIDIA (A100, H100, RTX 4090) seria necesario convertir los pesos a otro formato, y no hay datos publicados sobre esa conversion.
- Cabe en GPU de consumo: no en el sentido habitual, ya que 22,5 GB de pesos superan la VRAM de una RTX 4090 (24 GB) solo con margen minimo y sin espacio para contexto; en Apple Silicon de 48 GB o mas si es viable.
- Opciones de despliegue: mlx-lm (CLI y servidor compatible con API OpenAI), LM Studio con soporte MLX, o conversion previa a GGUF para llama.cpp y Ollama. vLLM y TGI no cargan pesos MLX de forma nativa.
- Latencia y throughput: no disponible. No hay mediciones de tokens por segundo publicadas ni datos de rendimiento del esquema de cuantizacion oQ sobre esta configuracion.

## Comparativa con modelos similares

La comparativa es orientativa: el modelo base de este repositorio no esta identificado publicamente, por lo que las cifras de las alternativas corresponden a modelos de categoria similar y no a una comparacion medida.

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final (este repositorio) | 35.951.822.704 / no disponible | no disponible | no disponible | MLX safetensors, 22,5 GB |
| Qwen3-30B-A3B (referencia de categoria) | 30.500 millones / 3.300 millones | 262.144 tokens nativos | Apache 2.0 | safetensors, multiplataforma |
| Mixtral 8x7B (referencia de categoria) | 46.700 millones / 12.900 millones | 32.768 tokens | Apache 2.0 | safetensors y GGUF |
| DeepSeek-V3 (referencia de categoria) | 671.000 millones / 37.000 millones | 128.000 tokens | licencia propia de DeepSeek | safetensors |

Frente a estas alternativas, este repositorio aporta una ventaja clara de tamano en disco y de requisitos de memoria para hardware Apple, a cambio de una total ausencia de garantias: no hay licencia declarada, no hay idiomas listados, no hay benchmarks y no hay trazabilidad del afinado sin censura.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, el uso comercial y la redistribucion quedan en una situacion juridica ambigua; conviene contactar con el autor o asumir que no hay permiso claro.
- Trazabilidad nula: no se identifica el modelo base exacto ni su licencia original, lo que impide verificar si el afinado y la cuantizacion cumplen los terminos de uso de la base.
- Sin evaluaciones: no hay benchmarks, ni mediciones de perplejidad, ni comparacion con el modelo sin cuantizar, por lo que se desconoce la degradacion introducida por el esquema de 4 bits.
- Afinado sin censura: el modelo declara la eliminacion de filtros de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o gravemente ofensivo. No deberia exponerse directamente a usuarios finales sin una capa de moderacion.
- Riesgo de alucinacion: no cuantificado, pero esperable en modelos de este tamano y agravado por la falta de datos de evaluacion.
- Idiomas y contexto desconocidos: no se documenta la ventana de contexto real ni el soporte multilingue, asi que cualquier uso en produccion deberia validar ambos extremos con pruebas propias.
- Cero adopcion verificable: el repositorio presenta 0 descargas y 0 likes, y la busqueda web no arrojo referencias externas, lo que significa que no existe comunidad que haya validado su comportamiento.
- Riesgo de conversion: pasar los pesos a GGUF u otro formato puede alterar la precision del esquema mixto oQ, ya que la asignacion de bits por capa no tiene por que preservarse en la conversion.
- Fecha de publicacion atipica: el repositorio esta fechado en septiembre de 2026 y su nombre hace referencia a una generacion de Qwen no documentada publicamente, lo que refuerza la necesidad de verificar su procedencia antes de integrarlo en cualquier sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ4e-fp16-mtp
- Herramienta de cuantizacion oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- mlx-lm, utilidades de inferencia y servidor para modelos MLX: https://github.com/ml-explore/mlx-lm
- Resultados de busqueda web: no se encontro ningun enlace, paper, blog ni repositorio relacionado con este modelo o su base. Las consultas devolvieron unicamente resultados no relacionados (foros en chino sobre ortografia francesa, simbolos tipograficos y conversion de unidades).
