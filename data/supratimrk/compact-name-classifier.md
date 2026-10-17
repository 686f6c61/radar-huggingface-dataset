# SupratimRK/compact-name-classifier

## Resumen

CompactNameClassifier es un clasificador binario de texto desarrollado por SupratimRK que determina si una cadena de entrada corresponde a un nombre humano real o a un identificador no válido (alias de jugador, códigos alfanuméricos, números de matrícula, n-gramas ruidosos, etc.). Se trata de un transformer encoder entrenado desde cero, sin dependencias de pesos preentrenados externos, con 532.482 parámetros y un tamaño de solo ~632 KB en su versión INT8 ONNX. Está pensado para inferencia de latencia ultrabaja en CPU, con menos de 0,45 ms por consulta en un único hilo.

El modelo resuelve un problema muy concreto de preprocesado y limpieza de datos: filtrar campos de nombre en formularios, registros, bases de datos o pipelines de ingesta donde conviven nombres reales con handles, roll numbers y ruido alfanumérico. Frente a alternativas basadas en BERT preentrenado (varios megabytes y millones de parámetros), CompactNameClassifier reduce el tamaño y el coste computacional en más de un orden de magnitud sin sacrificar precisión en su tarea específica.

Su relevancia actual radica en el despliegue edge y serverless: al caber en cualquier CPU y ejecutar a miles de consultas por segundo, puede integrarse como paso de validación en tiempo real dentro de APIs, funciones lambda o pipelines de streaming sin necesidad de GPU. El modelo es monolingüe en inglés, aunque el vocabulario WordPiece de 4.000 tokens cubre nombres de múltiples culturas y regiones (bengalí, occidental, etc.) según los ejemplos de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder Pre-LN, 2 capas, 128 dimensiones ocultas, 4 cabezas de atención, activación GELU |
| Parametros totales | 532.482 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 20 tokens (longitud de secuencia de entrada) |
| Tipos de cuantizacion | INT8 (ONNX Runtime); existe también versión FP32 sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (FP32 e INT8) y PyTorch `.pt`; tokenizador en `tokenizer.json`, `vocab.txt` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder compacto entrenado desde cero, sin inicialización a partir de ningún checkpoint preentrenado. Usa un tokenizador WordPiece propio de dominio específico, 100% uncased, con un vocabulario de 4.000 tokens. El pipeline de normalización aplica `Sequence([NFKC(), Lowercase(), StripAccents()])` y la pre-tokenización separa espacios, puntuación y dígitos individuales (`Digits(individual_digits=True)`), lo que permite reconocer ruido alfanumérico como `112_` o `3048` sin inflar el vocabulario. La inclusión de embeddings factorizados (`Embedding(4000, 64)` seguido de `Linear(64, 128, bias=False)`) reduce a la mitad los parámetros de la capa de embeddings sin pérdida apreciable de capacidad.

El encoder tiene 2 capas con Pre-LayerNorm (`norm_first=True`), 128 dimensiones ocultas y 4 cabezas de atención. La representación final se construye mediante masked dual pooling: concatenación de masked mean pooling y masked max pooling, produciendo un vector de 256 dimensiones. El max pooling actúa como detector de anomalías, ya que cualquier token indicativo de ruido dispara sus activaciones y alerta al clasificador. El entrenamiento se realizó sobre un conjunto curado y sesgado-a-la-baja (de-biased) de 1.606.412 registros, divididos en 1.458.041 de entrenamiento y 148.371 de validación, compuestos por 1,18 millones de nombres humanos limpios de distintas culturas y regiones más 280.000 ejemplos de no-nombres, unigramas, gamertags y códigos alfanuméricos. No se menciona en la información disponible el uso de RLHF, DPO ni fases de alineación adicionales; se trata de un clasificador supervisado.

## Capacidades

- Clasificación binaria de texto: distingue entre nombres humanos reales y no-nombres (gamertags, roll numbers, códigos, handles ruidosos).
- Inferencia en CPU con latencia inferior a 0,45 ms por consulta en un solo hilo y throughput de ~2.228 consultas por segundo en un núcleo de CPU (Node.js).
- Resistencia a ruido alfanumérico: dígitos aislados, prefijos numéricos y separadores (`112_SAYANTIKA BISWAS`, `AYAN CSE3048`) se detectan como señales de no-nombre.
- Insensibilidad a mayúsculas, minúsculas y acentos gracias a la normalización en el tokenizador.
- Cobertura multirregional de nombres (ejemplos bengalíes y occidentales en la model card), aunque el modelo está declarado únicamente para inglés.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es un modelo de embeddings de propósito general: la salida está limitada a la clasificación binaria nombre / no-nombre.

## Casos de uso

- Limpieza y validación de formularios en línea: el modelo clasifica en tiempo real el campo "nombre" de un registro y rechaza entradas como `ShadowHunter99` o `112_SAYANTIKA BISWAS` antes de persistirlas en base de datos. Es adecuado por su latencia sub-milisegundo y su tamaño de 632 KB.
- Preprocesado de pipelines de ingesta de datos: filtrar columnas de nombre en datasets masivos antes de entrenar otros modelos, evitando que handles y códigos contaminen el corpus. El throughput de ~2.228 consultas/s por núcleo permite procesar millones de filas en minutos.
- Moderación de registro de usuarios: detectar automáticamente cuentas cuyo campo de nombre es en realidad un alias o código, redirigiendo esos casos a un flujo de verificación. Encaja en backends Node.js al aceptar entradas `int32` de forma nativa.
- Normalización de bases de datos CRM: separar nombres de personas reales de identificadores internos y códigos de empleado antes de deduplicar o segmentar clientes.
- Etiquetado previo en anotación de datos: usar el clasificador como paso de filtrado rápido para que los anotadores humanos solo revisen los casos ambiguos, reduciendo coste de etiquetado.
- Despliegue serverless o en edge: al no requerir GPU y caber en pocos cientos de kilobytes, puede ejecutarse en funciones lambda, contenedores mínimos o dispositivos con recursos muy limitados.
- Enriquecimiento de registros académicos: distinguir nombres de estudiantes de números de matrícula o códigos de asignatura en listados y exportaciones institucionales.
- Verificación en sistemas de KYC ligero: comprobar que el nombre introducido por un usuario tiene forma de nombre humano antes de pasarlo a un sistema de validación documental más costoso.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Binary Name Classification | Curated Human Names vs Non-Names (custom) | F1 Score | 0,9621 |
| Binary Name Classification | Curated Human Names vs Non-Names (custom) | Accuracy | 0,9445 |

Comparativa interna publicada por el autor frente a un modelo preentrenado previo:

| Metrica | Modelo preentrenado previo | CompactNameClassifier | Mejora |
|---|---|---|---|
| Tamano del modelo (INT8 ONNX) | 4,30 MB (2,45 MB podado) | ~632 KB | 74%–85% menor |
| Parametros totales | 4.380.000 | 532.482 | 88% de reduccion |
| Tamano de vocabulario | 30.522 tokens | 4.000 tokens | 87% menor |
| Longitud de secuencia | 16 tokens | 20 tokens | Sin truncamiento ciego |
| Latencia CPU (un hilo) | ~1,20 ms | 0,449 ms | ~2,7x mas rapido |
| Throughput | ~800 consultas/s | 2.228 consultas/s | Núcleo unico de CPU en Node.js |
| Precisión de validacion | — | 94,45% | Split de validacion de 148k |
| F1 de validacion | — | 96,21% | F1 ponderado |
| Casos limite (corner cases) | 52,9% (9/17) | 94,1% (16/17) | Resistente a fugas de handle/codigo |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es generativo ni de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El modelo está diseñado para ejecución en CPU mediante ONNX Runtime.
- GPU recomendadas: no aplica; el modelo no necesita GPU y su tamaño no justifica su uso.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), pero también en CPU, Raspberry Pi, contenedores serverless y entornos edge.
- Opciones de despliegue: ONNX Runtime (Python, Node.js, C++, etc.), con soporte nativo para buffers `int32`. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos generativos.
- Latencia estimada: 0,449 ms por consulta en un único hilo de CPU.
- Throughput estimado: ~2.228 consultas por segundo en un núcleo de CPU en Node.js.

## Comparativa con modelos similares

No se dispone de datos oficiales de benchmarks de alternativas comparables en la informacion proporcionada. La model card del autor sí incluye una comparación contra un modelo preentrenado previo (usado como baseline interno) que se resume a continuación:

| Modelo | Parametros | Vocabulario | Tamano (INT8) | Latencia CPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CompactNameClassifier | 532.482 | 4.000 | ~632 KB | 0,449 ms | MIT | ONNX, PyTorch |
| Baseline preentrenado previo (sin nombre especificado) | 4.380.000 | 30.522 | 4,30 MB (2,45 MB podado) | ~1,20 ms | no disponible | no disponible |

No se identifican en la informacion disponible otros modelos de clasificación binaria nombre/no-nombre directamente comparables con métricas publicadas.

## Limitaciones y advertencias

- Modelo monolingüe (inglés declarado). Aunque el vocabulario y los datos de entrenamiento cubren nombres de múltiples regiones, el rendimiento fuera del ámbito de la model card no está documentado.
- No es un modelo generativo ni de propósito general: solo produce una etiqueta binaria nombre / no-nombre. No sirve para tareas de lenguaje natural como resumen, traducción, QA o generación.
- Sesgos conocidos: el autor declara haber entrenado sobre un dataset "de-biased", pero no se detallan metodologías de auditoría de sesgo ni métricas desagregadas por región, etnia o género. Existe riesgo de peor rendimiento en nombres de culturas poco representadas en el corpus.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en cadenas ambiguas (por ejemplo, apodos que también son nombres reales, o nombres poco frecuentes con dígitos).
- Limitacion de contexto: la longitud de secuencia es de solo 20 tokens, por lo que entradas más largas pueden truncarse. Está pensado para campos de nombre, no para textos extensos.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, modificación y redistribución. Se desconoce si existen restricciones adicionales del dataset de entrenamiento, ya que no se especifica su licencia.
- Advertencia para producción: los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`). Se recomienda validar con datos propios antes de confiar en la métrica de F1 reportada.
- El repositorio tiene un tamaño declarado de 0,0 GB (probablemente redondeado) y muy poco uso comunitario (14 descargas, 0 likes en el momento de la consulta), lo que implica escasa validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SupratimRK/compact-name-classifier
- Repositorio GitHub: https://github.com/SupratimRK/.model.base.nc
- ONNX Runtime: https://onnxruntime.ai/
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
