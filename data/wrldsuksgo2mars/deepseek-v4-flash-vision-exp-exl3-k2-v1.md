# wrldsuksgo2mars/DeepSeek-V4-Flash-Vision-Exp-EXL3-K2-v1

## Resumen

DeepSeek-V4-Flash-Vision-Exp-EXL3-K2-v1 es una cuantizacion EXL3 uniforme-K2 del modelo multimodal experimental de DeepSeek, DeepSeek-V4-Flash-Vision-Exp, publicada por el usuario de HuggingFace wrldsuksgo2mars. El modelo base combina la arquitectura de lenguaje DeepSeek V4 Flash con un codificador de vision y un alineador, e incorpora una ruta de borrador dSpark integrada para decodificacion especulativa. Esta version cuantizada codifica todas las proyecciones de expertos enrutados (gate, up y down) de las 43 capas principales del decodificador y de los tres bloques dSpark a precision K2, mientras conserva los valores nativos del checkpoint original en los tensores no enrutados, como el codificador de vision, la atencion y los expertos compartidos.

Con 45.555 millones de parametros totales y un tamano de repositorio de 85 GB, esta cuantizacion busca reducir el coste de despliegue del modelo manteniendo la fidelidad en los componentes criticos. La calibracion se realizo con 1.426 prompts y 1.081.027 tokens que cubren revision de codigo, texto general en ingles y chino, texto multilingue, matematicas, razonamiento y llamadas a herramientas estructuradas. El corpus de calibracion fue exclusivamente textual, por lo que la calidad multimodal de esta version cuantizada no ha sido medida aun. Se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con codificador de vision y alineador, bloques dSpark de decodificacion especulativa |
| Parametros totales | 45.555.228.862 (45,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 posiciones (segun repositorio relacionado de la misma familia V4 Flash) |
| Tipos de cuantizacion | EXL3 uniforme-K2 (etiquetado como 2-bit) |
| Idiomas soportados | no disponible (calibrado con ingles, chino y texto multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizacion EXL3) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp es un modelo multimodal experimental de DeepSeek que combina la arquitectura de lenguaje V4 Flash con un codificador de vision y un alineador. La arquitectura es de tipo MoE con 43 capas principales de decodificador, cada una con proyecciones de expertos enrutados (gate, up y down), mas tres bloques dSpark integrados que actuan como ruta de borrador para decodificacion especulativa. La cuantizacion EXL3 K2 de esta version aplica precision uniforme K2 a todas las proyecciones de expertos enrutados, mientras que los tensores no enrutados (codificador de vision, alineador, embedding de imagen, sesgos del router visual, atencion, expertos compartidos y pesos del coordinador denso) conservan los valores y la precision nativos del checkpoint original.

El proceso de calibracion utilizo 1.426 prompts y 1.081.027 tokens distribuidos en revision y reescritura de codigo, texto general en ingles y chino, texto multilingue, matematicas y razonamiento, y llamadas a herramientas estructuradas. La cuantizacion se propago capa por capa, de modo que cada capa cuantizada generaba las activaciones usadas para la siguiente. Los bloques dSpark emplearon una muestra determinista de 327.680 anclas del frente de cinco propuestas emitido conjuntamente. Al ser el corpus de calibracion exclusivamente textual, los modulos visuales y los sesgos del router visual se preservan exactamente, pero la calidad multimodal de este conjunto de expertos cuantizados no ha sido evaluada.

## Capacidades

- Generacion de texto y razonamiento multilingue, con soporte para ingles, chino y otros idiomas (segun el corpus de calibracion).
- Comprension multimodal de imagenes mediante codificador de vision y alineador, aunque la calidad de esta capacidad no ha sido verificada en la version cuantizada.
- Razonamiento matematico y logico, cubierto en el corpus de calibracion.
- Generacion, revision y reescritura de codigo, incluido en los datos de calibracion.
- Llamadas a herramientas estructuradas (tool calling), contempladas en el corpus de calibracion.
- Decodificacion especulativa integrada mediante los bloques dSpark, que actuan como ruta de borrador para acelerar la inferencia.
- Compatible con endpoints de inferencia (etiqueta endpoints_compatible) y desplegable en plataformas como FriendliAI.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: el modelo puede revisar y reescribir codigo en tiempo real, aprovechando su calibracion especifica en revision de codigo y su capacidad de razonamiento para sugerir correcciones y refactorizaciones.
- Atencion al cliente multilingue automatizada: su soporte para texto en ingles, chino y otros idiomas, junto con la ventana de contexto de hasta 1 millon de posiciones, permite gestionar conversaciones multi-turno con historiales largos y documentos adjuntos.
- Analisis de documentos con imagenes: la combinacion de codificador de vision y generacion de texto permite extraer informacion de capturas, diagramas y documentos escaneados, aunque conviene validar la calidad multimodal antes de usarlo en produccion.
- Agentes con llamada a herramientas: el soporte para tool calling estructurado permite integrar el modelo en pipelines de automatizacion que consultan APIs, bases de datos o servicios externos de forma secuencial.
- Razonamiento matematico y cientifico: su calibracion en matematicas y razonamiento lo hace util para resolver problemas numericos, verificar demostraciones o asistir en tareas de investigacion.
- Despliegue de inferencia especulativa en hardware de alta memoria: los bloques dSpark integrados permiten acelerar la generacion en servidores con GPU de gran capacidad, como un DGX Spark, reduciendo la latencia por token frente a modelos sin ruta de borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion para esta cuantizacion, y el autor indica explicitamente que la calidad multimodal del conjunto de expertos cuantizados no ha sido medida. Tampoco se proporcionan comparativas con el modelo base original en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Tamano del repositorio: 85,0 GB en formato safetensors cuantizado a EXL3 K2.
- VRAM estimada: no disponible de forma oficial; con 45,5 B de parametros en cuantizacion 2-bit, el peso del modelo ronda los 12-15 GB, pero la memoria total dependera del tamano de la ventana de contexto y de la cache KV.
- GPU recomendadas: el repositorio relacionado de la misma familia menciona su ejecucion en un DGX Spark (128 GB de memoria unificada) con un limite de 1.000.000 de tokens por peticion a gpu_memory_utilization=0,85. En GPUs de consumo, una RTX 4090 (24 GB) podria ejecutar el modelo con ventanas de contexto reducidas, aunque no hay datos confirmados.
- Opciones de despliegue: compatible con libreria transformers, EXL3 (ExLlamaV3) como formato nativo, y plataformas de inferencia como FriendliAI. La etiqueta endpoints_compatible sugiere soporte para servidores de inferencia estandar.
- Latencia y throughput: no disponibles. La ruta dSpark de decodificacion especulativa deberia reducir la latencia por token frente a la decodificacion autoregresiva convencional, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (base) | no disponible | no disponible | FP8/nativo | MIT | Modelo original sin cuantizar, calidad multimodal completa |
| DeepSeek-V4-Flash-Vision-Exp-EXL3-K2-v1 (este) | 45,5 B | 1.048.576 | EXL3 K2 (2-bit) | MIT | Cuantizacion uniforme K2 de expertos, calidad multimodal sin medir |
| DeepSeek-V4-Flash-Vision-Exp-EXL3-K2.2-D2-v1 | no disponible | no disponible | EXL3 K2.2 | MIT | Variante con precision K2.2 y configuracion D2 del mismo autor |
| DeepSeek-V4-Flash-0731-EXL3-K2-calibrated-v1 | no disponible | 1.048.576 | EXL3 K2 | MIT | Variante calibrada de la familia V4 Flash sin vision |

La comparativa se limita a las variantes publicadas por el mismo autor y al modelo base, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otras familias de modelos.

## Limitaciones y advertencias

- La calidad multimodal no ha sido medida: el corpus de calibracion fue exclusivamente textual, por lo que el rendimiento en tareas de vision puede degradarse respecto al modelo base, aunque los pesos del codificador de vision se conservan intactos.
- Cuantizacion agresiva de 2-bit en los expertos: la precision K2 en las proyecciones enrutadas puede introducir perdidas de calidad en tareas de razonamiento complejo o generacion de codigo, especialmente en comparacion con cuantizaciones de mayor precision.
- Modelo experimental: tanto el modelo base como esta cuantizacion son experimentales, con cero descargas y cero likes en el momento de la publicacion, lo que indica ausencia de validacion por parte de la comunidad.
- Riesgo de alucinacion: como cualquier modelo de lenguaje generativo, puede producir contenido falso o inventado, y la cuantizacion agresiva puede incrementar este riesgo en tareas de hechos concretos.
- Sesgos potenciales: no se dispone de informacion sobre evaluaciones de sesgo o seguridad; el corpus de calibracion se centra en codigo, matematicas y texto general, sin cobertura de dominios sensibles.
- Limitaciones de idioma: los idiomas soportados no estan documentados oficialmente; la calibracion cubre ingles, chino y texto multilingue, pero no hay garantia de calidad en otros idiomas.
- Restricciones de produccion: al ser una cuantizacion de 2-bit sin benchmarks publicados, se recomienda validar exhaustivamente el modelo en el dominio de uso antes de desplegarlo en entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4-Flash-Vision-Exp-EXL3-K2-v1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Variante K2.2-D2 del mismo autor: https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4-Flash-Vision-Exp-EXL3-K2.2-D2-v1
- Variante calibrada V4 Flash 0731: https://huggingface.co/wrldsuksgo2mars/DeepSeek-V4-Flash-0731-EXL3-K2-calibrated-v1
- Repositorio de despliegue en DGX Spark: https://github.com/signalgap9-del/deepseek-v4-flash-0731-exl3-k2-spark/tree/main
- Pagina de DeepSeek: https://deepseek.com/en/index.html
- Despliegue en FriendliAI: https://friendli.ai/models/wrldsuksgo2mars/DeepSeek-V4-Flash-Vision-Exp-EXL3-K2.2-D2-v1
