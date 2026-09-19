# Thaurock/Qwen3.5-122B-A10B-abliterated-GGUF

## Resumen

Thaurock/Qwen3.5-122B-A10B-abliterated-GGUF es una colección de cuantizaciones en formato GGUF del modelo Qwen3.5-122B-A10B-abliterated, un modelo de lenguaje de arquitectura MoE (mezcla de expertos) con 122 mil millones de parámetros totales y 10 mil millones de parámetros activos por token. El modelo original fue desarrollado por el equipo Qwen de Alibaba y posteriormente procesado por el usuario wangzhang mediante el framework Abliterix, que elimina los mecanismos internos de alineación y rechazo de seguridad. Este repositorio, publicado por Thaurock, se limita a ofrecer los pesos ya abliterados en distintos niveles de cuantización GGUF.

La aportación principal del repositorio es la variedad de cuantizaciones: desde F16 a ~244 GB hasta Q2_K a ~47 GB, pasando por Q5_K_M (~87 GB), que el autor señala como el punto de equilibrio recomendado, y Q4_K_M (~75 GB), descrito como la variante más buscada. Todos los archivos se distribuyen como ficheros únicos e íntegros, pensados para su uso directo con llama.cpp, Ollama, LM Studio o Text-Generation-WebUI.

El modelo resulta relevante para quienes necesitan ejecutar localmente un MoE de gran tamaño sin filtros de contenido y con una tasa de rechazo estimada del 0,5 % según el autor, conservando las capacidades de razonamiento lógico, generación de código y comprensión contextual del modelo base. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer |
| Parametros totales | 122 mil millones (122B) |
| Parametros activos | 10 mil millones (A10B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros unicos) |
| Modelo base | wangzhang/Qwen3.5-122B-A10B-abliterix |
| Framework de abliteracion | Abliterix |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es de tipo MoE (mezcla de expertos) con 122B de parametros totales y 10B activos. Esto implica que, aunque el modelo completo debe residir en memoria, el coste computacional por token se aproxima al de un modelo denso de unos 10B de parametros activos, mientras que la huella de memoria se corresponde con el total de 122B (mas el cache KV). El autor no documenta en la model card el numero de expertos, el numero de capas, la dimension oculta ni la longitud de contexto.

Sobre el entrenamiento no se ofrece informacion en la model card: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. El unico proceso documentado es la abliteracion posterior mediante el framework Abliterix, que segun el autor desmantela los mecanismos internos de alineacion y rechazo, dejando una tasa de rechazo estimada del 0,5 %. Los pesos resultantes se han convertido a GGUF con distintas precisiones, desde 16,00 BPW (F16) hasta 2,90 BPW (Q2_K).

## Capacidades

- Generacion de texto general, con enfasis en razonamiento logico y comprension contextual segun la model card.
- Generacion y asistencia en codigo.
- Respuestas sin restricciones de contenido: al estar abliterado, no aplica rechazos de seguridad.
- Instrucciones mediante plantilla de chat estilo ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`), tal como se muestra en el ejemplo de consola de la model card.
- Compatibilidad de despliegue con llama.cpp, Ollama, LM Studio y Text-Generation-WebUI.
- Soporte de tool calling, function calling, modo de razonamiento explicito (thinking), vision, audio o agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo de gama alta: con la variante Q4_K_M (~75 GB) el modelo se puede ejecutar combinando VRAM y RAM en un equipo con una o varias GPUs consumer, sin depender de APIs externas.
- Procesamiento de datos y textos sin restricciones tematicas: al no aplicar filtros de rechazo, resulta util para tareas de analisis o redaccion sobre contenidos que los modelos alineados suelen declinar.
- Generacion de codigo en entornos controlados: el modelo conserva las capacidades de codificacion del base, por lo que puede asistir en tareas de programacion sobre un repositorio propio con llama.cpp o servidores compatibles con la API de OpenAI.
- Investigacion sobre alineacion y seguridad: comparar este modelo abliterado con su version base permite estudiar que comportamientos y capacidades se ven afectados al eliminar las capas de rechazo.
- Ajuste fino adicional (fine-tuning) o destilacion: las variantes de mayor precision (F16, Q8_0) sirven como referencia para trabajos posteriores, aunque el formato GGUF exige reconvertir antes de entrenar.
- Despliegue en clusters con multiples GPUs empresariales: las variantes F16 (~244 GB) y Q8_0 (~130 GB) estan pensadas para infraestructuras tipo A100 o H100 en configuracion multi-GPU.
- Experimentacion con cuantizacion extrema: las variantes Q2_K y Q3_K permiten evaluar el comportamiento de un MoE grande en entornos con memoria muy limitada, sabiendo que el autor advierte de posibles bucles gramaticales e incoherencias logicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de tamano que siguen son estimaciones del propio autor basadas en el peso nativo en safetensors; el tamano final en disco puede variar. Para inferencia hay que sumar a ese tamano el cache KV y el overhead del runtime.

| Cuantizacion | Tamano estimado | BPW | Perfil de uso |
|---|---|---|---|
| F16 | ~244,0 GB | 16,00 | Multiples GPUs empresariales o clusters en la nube |
| Q8_0 | ~130,0 GB | 8,50 | Tarjetas de gran VRAM (A100 y similares) |
| Q6_K | ~101,0 GB | 6,59 | Setups de entusiastas extremos |
| Q5_K_M | ~87,0 GB | 5,69 | Punto de equilibrio recomendado por el autor |
| Q5_K_S | ~85,0 GB | 5,54 | Optimizacion de limites de VRAM en multi-GPU |
| Q4_K_M | ~75,0 GB | 4,85 | Estacion de trabajo local combinando RAM y VRAM |
| Q4_K_S | ~71,0 GB | 4,58 | Prioriza velocidad de inferencia |
| Q3_K_L | ~63,0 GB | 4,01 | Sistemas donde los 4 bits exceden la memoria |
| Q3_K_M | ~58,0 GB | 3,66 | Posible degradacion en respuestas avanzadas |
| Q3_K_S | ~55,0 GB | 3,44 | Prioriza espacio fisico |
| Q2_K | ~47,0 GB | 2,90 | Compresion extrema, solo experimentacion |

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el cache KV y el overhead del runtime. No se dispone de cifras de cache KV porque se desconoce la longitud de contexto y la configuracion de capas.
- GPU recomendadas segun el propio autor: A100 o Nvidia CMP 170HX para Q8_0; multiples GPUs empresariales para F16; configuraciones multi-GPU para Q5.
- Cabe en GPU consumer: el autor situa Q4_K_M y variantes inferiores como aptas para estaciones de trabajo locales combinando RAM y VRAM, lo que sugiere offloading parcial a memoria del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y Text-Generation-WebUI.
- Latencia y throughput: no disponible. Cabe senalar que, al tratarse de un MoE con solo 10B parametros activos, el coste de computo por token es inferior al de un denso de 122B, aunque el ancho de banda de memoria sigue condicionado por el tamano total de los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Thaurock/Qwen3.5-122B-A10B-abliterated-GGUF | 122B | 10B | no disponible | Apache 2.0 | GGUF | Abliterado, coleccion de cuantizaciones |
| wangzhang/Qwen3.5-122B-A10B-abliterix | 122B | 10B | no disponible | Apache 2.0 | no disponible | Modelo base abliterado del que deriva este repositorio |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion sobre modelos de la misma categoria con la que establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo ha sido abliterado y respondera a practicamente cualquier peticion. El contenido generado es responsabilidad exclusiva de quien ejecuta la inferencia.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; el comportamiento del modelo base en este aspecto no esta documentado en la ficha.
- Degradacion por cuantizacion: el propio autor advierte que las variantes Q3 y, de forma mas acusada, Q2_K pueden producir bucles gramaticales e incoherencias logicas severas en arquitecturas MoE.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar despliegues que dependan de conversaciones o documentos largos.
- Idiomas no especificados: se desconoce el soporte real de idiomas distintos del ingles (o del chino, en el caso de la familia Qwen).
- Informacion de entrenamiento ausente: no se documentan datos de entrenamiento, por lo que no se pueden evaluar sesgos de composicion del dataset.
- Repositorio sin validacion social: 0 descargas y 0 likes en el momento de redactar la ficha, sin benchmarks publicados ni evaluaciones independientes.
- Licencia: Apache 2.0, que permite uso comercial, pero el propio modelo declara carecer de filtros y traslada la responsabilidad del uso al operador.
- Dependencia del modelo base: la calidad final depende enteramente del trabajo de abliteracion previo de wangzhang, que no se documenta en detalle.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones GGUF: https://huggingface.co/Thaurock/Qwen3.5-122B-A10B-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/wangzhang/Qwen3.5-122B-A10B-abliterix
- Perfil del autor de la abliteracion: https://huggingface.co/wangzhang
- Perfil del autor de las cuantizaciones: https://huggingface.co/Thaurock
- Paper, blog, repositorio del framework Abliterix o demo: no disponible en la informacion proporcionada.
