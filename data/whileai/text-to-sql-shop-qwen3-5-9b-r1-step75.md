# whileai/text-to-sql-shop-qwen3.5-9b-r1-step75

## Resumen

`whileai/text-to-sql-shop-qwen3.5-9b-r1-step75` es un adaptador LoRA entrenado con PEFT y publicado por el usuario `whileai` sobre el modelo base `Qwen/Qwen3.5-9B`. Se distribuye como un repositorio de 0,1 GB en formato safetensors, con la librería `peft` y las etiquetas `grpo`, `lora`, `transformers`, `trl`, `text-generation` y `conversational`. El identificador del repositorio sugiere un ajuste orientado a la generación de SQL sobre un esquema de datos de comercio electrónico, en un checkpoint intermedio de entrenamiento (step75), aunque esa finalidad no está confirmada en la documentación.

La relevancia práctica de este artefacto es, hoy, limitada y conviene decirlo con claridad: la model card publicada es la plantilla por defecto de Hugging Face con todos los apartados marcados como `[More Information Needed]`. No se declaran licencia, idiomas soportados, composición del dataset, hiperparámetros de entrenamiento, versión del modelo base ni resultados de evaluación. El repositorio acumula 0 descargas y 0 «likes» en el momento de la consulta.

Por tanto, debe tratarse como un adaptador experimental sin validación pública. Cualquier uso en producción exige una evaluación propia sobre el esquema objetivo, la verificación del modelo base subyacente y la confirmación de los términos de licencia antes de integrarlo en un pipeline.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; la arquitectura del modelo base `Qwen/Qwen3.5-9B` no se detalla en la información proporcionada) |
| Parametros totales | adaptador LoRA sobre un modelo base de 9B parámetros según su denominación; el autor no publica el número de parámetros entrenables |
| Parametros activos | no aplica / no disponible (no se indica que el modelo base sea de tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización aplicable depende del modelo base y del runtime) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-9B |
| Metodo de ajuste | LoRA; el tag `grpo` indica uso de Group Relative Policy Optimization |
| Libreria y version | PEFT 0.21.0 (tags: `transformers`, `trl`) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-generation |
| Checkpoint | nombre de repositorio `step75`, consistente con un paso intermedio de entrenamiento (no confirmado en la model card) |
| Fecha de publicacion | 19 de septiembre de 2026 (creación y última actualización el mismo día, con 6 segundos de diferencia) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) acoplado al modelo base `Qwen/Qwen3.5-9B`. La información disponible no especifica la arquitectura interna del modelo base (transformer denso, MoE o híbrido), su número exacto de parámetros, la longitud de contexto soportada ni la dimensionalidad del adaptador (rango, alpha, capas objetivo). Los tags `grpo` y `lora` junto con las librerías `trl` y `transformers` indican un pipeline de ajuste alineado con TRL, muy probablemente con optimización mediante GRPO sobre un objetivo de recompensa (por ejemplo, validez de la consulta SQL generada o coincidencia con resultados esperados). No hay información sobre el dataset de entrenamiento, el número de tokens vistos, la composición del corpus ni si hubo etapas previas de SFT.

Tampoco se documentan innovaciones técnicas adicionales: no hay mención a decodificación especulativa, atención lineal, tokenizador modificado ni a técnicas de eficiencia concretas. El hecho de que el repositorio se llame `step75` sugiere que se publicó un checkpoint intermedio y no necesariamente el mejor modelo de la ejecución, pero esto es una inferencia a partir del nombre, no un dato confirmado por el autor.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y el pipeline `text-generation`.
- Generación de código SQL a partir de lenguaje natural en un dominio de comercio electrónico, presumiblemente (inferido del nombre del repositorio, no confirmado en la model card).
- Ejecución de tareas guiadas por recompensa, dado el uso declarado de GRPO en el ajuste.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente, razonamiento multi-paso explícito o planificación.
- No hay información sobre capacidades multilingües: el campo de idiomas no está declarado.
- No hay información sobre modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No hay información sobre la ventana de contexto efectiva, lo que impide afirmar cuál es el tamaño máximo de esquema de base de datos que puede ingerirse en un prompt.

## Casos de uso

- Consultas en lenguaje natural sobre bases de datos de comercio electrónico: un analista o un gestor de tienda formula preguntas del tipo «¿qué productos se vendieron más el mes pasado?» y el modelo traduce a SQL sobre el esquema de ventas, pedidos o catálogo. Es adecuado por el dominio sugerido por el nombre del adaptador, aunque requiere validación previa sobre el esquema real.
- Asistente interno de autoservicio de datos: integrado en una herramienta de BI o en un chat corporativo, permite que perfiles no técnicos obtengan resultados sin escribir SQL, siempre que se apliquen restricciones de solo lectura y validación de consultas.
- Generación de consultas para informes periódicos: el modelo puede proponer las consultas base de cuadros de mando recurrentes (ventas por categoría, tasa de conversión, rotación de stock) que después se versionan y se revisan manualmente.
- Base para ajuste posterior y experimentación: al ser un adaptador LoRA de 0,1 GB, sirve como punto de partida barato para continuar el entrenamiento con datos propios del esquema de la organización, o como referencia para comparar estrategias de ajuste con GRPO.
- Enriquecimiento de agentes de análisis de datos: si se confirma su calidad, el adaptador puede actuar como componente de traducción NL→SQL dentro de un agente mayor que ejecute la consulta, valide el resultado y genere una explicación.
- Soporte a atención al cliente con acceso a datos: consultas sobre pedidos, devoluciones o disponibilidad de productos a partir de la petición del usuario. Requiere controles estrictos de permisos y revisión de consultas generadas antes de su ejecución.
- Evaluación comparativa de adaptadores text-to-SQL: útil en un banco de pruebas interno para medir exactitud de coincidencia con consultas de referencia, sobre todo por su bajo coste de almacenamiento y su origen público.
- Formación y prototipado docente: permite ilustrar un pipeline completo de ajuste con PEFT y TRL sobre un caso de negocio concreto, sin necesidad de infraestructura de entrenamiento a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye el apartado `Evaluation` sin rellenar, con todos los campos marcados como `[More Information Needed]`, y no se han localizado resultados en la búsqueda web realizada. No se dispone por tanto de cifras de exactitud de consultas SQL, MMLU, HumanEval, GSM8K ni de ninguna otra métrica.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamaño declarado del modelo base (9B parámetros) y no han sido publicadas por el autor.

- VRAM para inferencia en fp16/bf16: aproximadamente 18 GB solo de pesos, más caché KV y activaciones; en la práctica conviene reservar 20-24 GB.
- VRAM con cuantización de 8 bits: del orden de 9-11 GB, más overhead de contexto.
- VRAM con cuantización de 4 bits: del orden de 5-7 GB, más overhead de contexto.
- GPU profesionales: A100 (40 o 80 GB), H100, L40S o A6000 cubren el modelo base en precisión completa sin dificultad.
- GPU de consumo: una RTX 3090 o RTX 4090 (24 GB) puede ejecutar el modelo base en fp16 con contexto moderado; tarjetas de 16 GB (RTX 4060 Ti, RTX 4080) y de 12 GB requieren cuantización de 8 o 4 bits.
- Almacenamiento: el adaptador ocupa 0,1 GB, pero es necesario descargar por separado el modelo base completo, cuyo peso depende del formato elegido.
- Opciones de despliegue: `transformers` con PEFT para cargar el adaptador sobre el base; vLLM o TGI para servir el modelo fusionado a mayor throughput; llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponible. No hay datos publicados de tokens por segundo, TTFT ni rendimiento por lote.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas para establecer una comparativa rigurosa. La tabla recoge únicamente los datos verificables.

| Modelo | Parametros | Contexto | Licencia | Resultados publicados | Disponibilidad |
|---|---|---|---|---|---|
| whileai/text-to-sql-shop-qwen3.5-9b-r1-step75 (este adaptador) | adaptador LoRA sobre base de 9B | no disponible | no disponible | no disponible | Público en Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (modelo base) | 9B según denominación | no disponible | no disponible | no disponible | Público en Hugging Face |
| Otros adaptadores públicos de text-to-SQL | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia del adaptador, no puede asumirse su uso comercial. Es imprescindible contactar con el autor o consultar el repositorio antes de cualquier despliegue productivo.
- Model card vacía: todos los apartados relevantes (datos de entrenamiento, hiperparámetros, evaluación, uso previsto, uso fuera de alcance) están sin rellenar, lo que impide auditar el modelo.
- Sin resultados de evaluación: no hay evidencia pública de exactitud en generación de SQL, lo que hace obligatoria una evaluación propia sobre el esquema y el dialecto objetivo.
- Riesgo alto de alucinación de esquema: en tareas NL→SQL es habitual que el modelo invente nombres de tablas, columnas o funciones. Debe validarse cada consulta contra el catálogo real antes de ejecutarla.
- Dependencia del dialecto SQL: no se documenta sobre qué motor (PostgreSQL, MySQL, SQLite, BigQuery, etc.) se entrenó, de modo que la portabilidad entre dialectos es incierta.
- Idiomas no declarados: se desconoce si el adaptador mantiene el multilingüismo del modelo base o si el ajuste lo ha degradado hacia un único idioma.
- Contexto desconocido: sin la longitud de contexto publicada, no puede garantizarse que esquemas de base de datos grandes quepan en el prompt.
- Checkpoint intermedio: el sufijo `step75` sugiere que el modelo publicado no es necesariamente el punto final ni el mejor de la ejecución de entrenamiento.
- Sesgos heredados: cualquier sesgo presente en `Qwen/Qwen3.5-9B` y en los datos de ajuste se traslada al adaptador; no hay análisis al respecto.
- Riesgo de seguridad en ejecución de SQL: si el modelo se conecta a una base de datos real, es necesario aplicar permisos de solo lectura, límites de filas y validación sintáctica para evitar consultas destructivas o costosas.
- Validación de la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (corresponden a páginas de ayuda de YouTube en varios idiomas), por lo que no aportan información adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whileai/text-to-sql-shop-qwen3.5-9b-r1-step75
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL: https://huggingface.co/docs/trl
- Referencia citada en la plantilla de la model card (calculadora de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto: https://mlco2.github.io/impact
- Paper, blog, repositorio o demo específicos del modelo: no disponible
- Resultados de la búsqueda web: no relevantes para este modelo
