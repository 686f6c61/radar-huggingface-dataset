# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ8e-fp16-mtp

## Resumen

El modelo identificado como symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ8e-fp16-mtp es una publicacion del usuario symrex en Hugging Face, distribuida en formato MLX safetensors y construida sobre la arquitectura qwen3_5_moe (una variante MoE de la familia Qwen). Segun su model card, se trata de una cuantizacion mixta de 8 bits realizada con la herramienta oQ (oMLX v0.6.4), con group size 64, y el repositorio ocupa 39,5 GB con 35.951.822.704 parametros totales declarados en el indice de safetensors. El nombre sugiere un ajuste fino "uncensored" (sin filtros de rechazo) sobre un modelo base de la familia Qwen3.5 en configuracion A3B, es decir, con aproximadamente 3.000 millones de parametros activos por token, aunque este dato no esta confirmado en la informacion disponible.

El interes tecnico inmediato es acotado pero claro: se trata de un artefacto de cuantizacion para el ecosistema MLX (Apple Silicon), no de un modelo entrenado desde cero ni de un paper con resultados. No hay pipeline declarado, no hay licencia declarada, no hay idiomas declarados y el repositorio no registra descargas ni "likes" en el momento de la consulta. La model card es extremadamente breve y se limita a documentar los parametros de cuantizacion.

Por tanto, esta ficha debe leerse como una evaluacion de disponibilidad y de requisitos de despliegue mas que como una evaluacion de capacidades: cualquier afirmacion sobre calidad, razonamiento o multilingüismo queda fuera del alcance de los datos proporcionados. Se recomienda tratar el modelo como experimental y verificar el modelo base, la licencia y los pesos originales antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer con mezcla de expertos, MoE), segun el campo model type de la model card |
| Parametros totales | 35.951.822.704 (35,95 mil millones), dato real del indice de safetensors |
| Parametros activos | no disponible (el identificador "A3B" sugiere del orden de 3.000 millones de parametros activos, sin confirmar en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, cuantizacion mixta de precision oQ (oMLX v0.6.4), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria mlx); tamano del repositorio 39,5 GB |

Nota: el nombre del repositorio incluye el termino "dequantized" y "fp16", mientras que la model card declara explicitamente "Bits: 8" y "Format: MLX safetensors". La discrepancia no esta resuelta en la informacion proporcionada; el tamano del repositorio (39,5 GB para 35,95 mil millones de parametros) es coherente con pesos de 8 bits y no con fp16 puro (que rondaria los 72 GB).

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es el campo model type: qwen3_5_moe, esto es, un transformer con capas de mezcla de expertos (MoE) perteneciente a la familia Qwen3.5. No se dispone de datos sobre el numero de expertos, el numero de expertos activados por token, la dimension oculta, el numero de capas, el tipo de atencion (completa, lineal o hibrida) ni el tokenizador empleado. Tampoco se documenta la longitud de contexto soportada.

Respecto al entrenamiento, no hay informacion sobre el numero de tokens de preentrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o RLVR. El sufijo "Uncensored-Genesis-Final" sugiere un ajuste fino orientado a eliminar comportamientos de rechazo, pero no se aporta ninguna ficha del proceso de fine-tuning, del dataset utilizado ni del modelo base exacto sobre el que se aplico. La unica transformacion documentada es la cuantizacion: se aplico oQ (oMLX v0.6.4) con cuantizacion mixta de precision a 8 bits y group size 64, generando pesos en formato MLX safetensors.

No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, multi-token prediction pese al sufijo "mtp", etc.). El sufijo "mtp" del nombre podria apuntar a multi-token prediction, pero no hay confirmacion en la informacion disponible.

## Capacidades

- Generacion de texto: presumiblemente soportada por tratarse de un modelo de lenguaje de la familia Qwen, aunque no hay documentacion especifica en la informacion proporcionada.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (ni tan siquiera se declaran idiomas en la ficha de Hugging Face).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Comportamiento "uncensored": el nombre del repositorio lo indica, pero no hay documentacion tecnica que describa el alcance real de la modificacion.

## Casos de uso

Dado que no hay datos verificados sobre capacidades, contexto, idiomas ni licencia, los siguientes casos de uso son escenarios de evaluacion plausibles, no recomendaciones de produccion:

- Evaluacion local en Apple Silicon: el modelo esta empaquetado en MLX safetensors, por lo que su uso natural es ejecutarlo en un Mac con chip de la serie M para medir velocidad de generacion, consumo de memoria unificada y estabilidad del runtime MLX antes de plantear cualquier despliegue mayor.
- Pruebas de cuantizacion y comparativas de calidad: al existir una version cuantizada a 8 bits con group size 64, resulta util para medir la degradacion de calidad frente a los pesos originales del modelo base en tareas controladas (perplejidad, seguimiento de instrucciones, coherencia a largo plazo).
- Investigacion sobre alineacion y filtros de rechazo: un ajuste etiquetado como "uncensored" es material habitual en estudios de robustez de filtros, analisis de sesgos y evaluacion de comportamientos no deseados en entornos controlados y con supervision humana.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa con tematicas adultas o delicadas, donde los modelos alineados tienden a rechazar peticiones; requiere revision editorial posterior y cumplimiento normativo.
- Red teaming y evaluacion de seguridad: uso del modelo como generador adversario para construir conjuntos de prompts de prueba que permitan validar los filtros de un sistema de produccion distinto.
- Prototipado offline y sin conexion: al ejecutarse en local con MLX, permite experimentar con un modelo de ~36.000 millones de parametros sin enviar datos a servicios en la nube, lo que resulta relevante para datos sensibles.
- Comparacion de runtimes: sirve como banco de pruebas para contrastar el rendimiento de MLX frente a otras alternativas (llama.cpp, vLLM) si en el futuro se generan conversiones a otros formatos, algo que hoy no esta disponible en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, no declara resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y el autor no aporta comparacion con el modelo base ni con la version sin cuantizar.

## Requisitos de hardware

- VRAM/unified memory estimada para inferencia: los pesos en 8 bits ocupan del orden de 36 GB (35,95 mil millones de parametros a ~1 byte por parametro), y el repositorio completo pesa 39,5 GB. Hay que sumar el cache KV, cuyo tamano depende de la longitud de contexto, que no esta documentada.
- Memoria recomendada: al menos 48-64 GB de memoria unificada para cargar los pesos con margen para el cache KV en contextos cortos o medios, y 96-128 GB si se trabaja con contextos largos o batches mayores.
- GPU compatibles: no aplica en el sentido habitual, ya que el formato es MLX y esta pensado para Apple Silicon (chips de la serie M). No se documenta compatibilidad con CUDA ni con ROCm.
- Equipos consumer: cabe en Mac con chip Max o Ultra de 64 GB o mas (por ejemplo, configuraciones de M-series Max/Ultra con 64, 96 o 128 GB de memoria unificada). No cabe en equipos con 16 o 32 GB. En GPU consumer de NVIDIA no es utilizable directamente sin convertir los pesos a otro formato.
- Opciones de despliegue: mlx-lm / MLX (formato nativo del repositorio). No se proporcionan pesos en GGUF, no hay integracion declarada con Ollama, vLLM o TGI.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas ni datos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada: no hay ficha del modelo base, no hay version sin cuantizar identificada y no hay resultados de benchmarks de este artefacto. La unica referencia estructural es la propia familia Qwen3.5 MoE indicada en el campo model type.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ8e-fp16-mtp | 35,95 mil millones (safetensors) | no disponible (A3B sugiere ~3 mil millones, sin confirmar) | no disponible | no disponible | Hugging Face, formato MLX safetensors, 0 descargas |
| Modelo base Qwen3.5 MoE de referencia | no disponible | no disponible | no disponible | no disponible | no identificado en la informacion proporcionada |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede determinar si el uso comercial esta permitido. Es un bloqueo objetivo para cualquier despliegue en produccion hasta que el autor lo aclare.
- Procedencia del modelo base no documentada: no se indica que checkpoint concreto de Qwen3.5 MoE se uso ni bajo que condiciones, lo que impide verificar la cadena de licencias.
- Ficha practicamente vacia: sin pipeline, sin idiomas, sin datos de entrenamiento y sin benchmarks, no hay base para estimar calidad real.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; en este caso no hay evaluaciones publicadas que permitan acotarlo, y un ajuste "uncensored" puede reducir la tendencia a expresar incertidumbre o a rechazar peticiones.
- Sesgos: no evaluados ni documentados. La ausencia de informacion sobre el dataset de ajuste impide estimar sesgos de genero, raza, religion o ideologia.
- Contenido potencialmente danino: el etiquetado "uncensored" implica que el modelo puede generar contenido que otros sistemas rechazarian. Requiere moderacion externa y supervision humana si se expone a usuarios.
- Limitacion de plataforma: el formato MLX safetensors solo es directamente utilizable en Apple Silicon. No hay GGUF ni safetensors estandar para CUDA.
- Contexto maximo desconocido: no se puede planificar un caso de uso con ventanas largas sin conocer el limite real de tokens.
- Huella de memoria elevada: ~36-40 GB de pesos en 8 bits mas cache KV obligan a equipos con 64 GB o mas de memoria unificada.
- Madurez nula en la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni validacion externa conocida.
- La busqueda web realizada no devolvio ninguna fuente tecnica relevante (unicamente enlaces genericos de servicios de Google), por lo que no existe corroboracion externa de ningun dato.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-dequantized-oQ8e-fp16-mtp
- oQ / oMLX (herramienta de cuantizacion citada en la model card): https://github.com/jundot/omlx
- Paper o documentacion tecnica del modelo: no disponible
- Repositorio del modelo base: no disponible
- Demo o espacio interactivo: no disponible
- Blog o nota de publicacion del autor: no disponible
- Resultados de la busqueda web: no se encontraron enlaces tecnicos relevantes sobre este modelo (los resultados devueltos correspondian a servicios genericos de Google).
