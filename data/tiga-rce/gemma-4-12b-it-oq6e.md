# TiGa-RCE/gemma-4-12B-it-oQ6e

## Resumen

TiGa-RCE/gemma-4-12B-it-oQ6e es una cuantizacion de precision mixta de 6 bits de un modelo de la familia Gemma 4, publicada por el usuario TiGa-RCE en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a formato MLX orientada a inferencia local en hardware Apple Silicon. El repositorio declara un total de 11.907.350.320 parametros (unos 11,9 mil millones) y un tamano de 10,0 GB, coherente con una representacion de 6 bits mas los metadatos de escalado.

La cuantizacion se ha realizado con la herramienta oQ, integrada en oMLX v0.6.4, que aplica precision mixta en lugar de una cuantizacion uniforme. El repositorio indica un group size de 64, lo que implica que cada bloque de 64 pesos comparte un factor de escala, con un sobrecoste de almacenamiento de aproximadamente 0,25 a 0,5 bits por peso. El formato de pesos es safetensors en la disposicion que espera la libreria `mlx`.

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: es un repositorio con 0 descargas y 0 likes, sin model card detallada, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks. Ademas, las busquedas web realizadas no han devuelto ninguna informacion relacionada con el modelo (los resultados obtenidos tratan sobre intervalos en Formula 1 y son irrelevantes). Por tanto, la mayor parte de los apartados de esta ficha se marcan como "no disponible" y el contenido se limita a lo verificable en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio declara `model_type: gemma4_unified`) |
| Parametros totales | 11.907.350.320 (~11,9 B) |
| Parametros activos | no aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64, precision mixta mediante oQ (oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Tamano del repositorio | 10,0 GB |
| Fecha de publicacion | 2026-09-10 (sustituye a una version anterior de los pesos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura mas alla del campo `gemma4_unified` declarado en el repositorio y de las etiquetas `gemma4_unified` y `quantized`. Por la nomenclatura del identificador (`gemma-4-12B-it`) cabe inferir que se trata de la variante instruct de un supuesto modelo Gemma 4 de 12 mil millones de parametros, presumiblemente basado en transformer, pero esta inferencia no esta confirmada por ninguna fuente disponible y no debe tomarse como dato tecnico.

Tampoco hay informacion sobre el entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento. Lo unico documentado es el proceso de post-entrenamiento inverso, es decir, el procedimiento de cuantizacion: se aplico oQ, la utilidad de cuantizacion de precision mixta del proyecto oMLX, en su version v0.6.4, con un esquema de 6 bits y group size de 64. La precision mixta implica que distintas capas o tensores pueden recibir un tratamiento de cuantizacion diferente segun su sensibilidad, lo que habitualmente reduce la degradacion frente a una cuantizacion uniforme de la misma profundidad de bits. No se documenta el metodo de calibracion, el dataset de calibracion ni la perdida de calidad medida respecto a los pesos originales.

## Capacidades

No hay informacion verificable sobre las capacidades del modelo en la documentacion proporcionada. Lo unico que puede afirmarse es lo siguiente, derivado del identificador y de las etiquetas del repositorio:

- Generacion de texto conversacional: el sufijo `it` del identificador sugiere una variante ajustada para instrucciones, pero no se confirma en la model card.
- Capacidades de razonamiento, codigo, matematicas o vision: no disponibles.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Modo de razonamiento explicito (thinking mode) u otras capacidades especiales: no disponible.
- Inferencia local en Apple Silicon: capacidad confirmada de forma indirecta por el formato MLX, que requiere hardware con memoria unificada de Apple para ejecutarse de forma nativa.

## Casos de uso

Los siguientes casos son aplicaciones plausibles dada la naturaleza del artefacto (una cuantizacion de 6 bits para inferencia local), no escenarios validados con datos de rendimiento:

- Inferencia local en portatiles Apple Silicon: un unico modelo de ~10 GB puede residir en memoria unificada de un Mac con 24 o 32 GB, lo que permite ejecutar un asistente de texto sin conexion a servicios externos ni coste por token.
- Prototipado de aplicaciones con `mlx-lm`: al ser pesos en formato MLX, se integran directamente en scripts de Python con `mlx_lm.generate`, lo que agiliza experimentos de prompting antes de decidir un despliegue en servidor.
- Despliegue en equipos de desarrollo sin GPU dedicada: equipos que solo disponen de hardware Apple pueden ejecutar el modelo de forma nativa, sin depender de CUDA ni de contenedores con GPU.
- Evaluacion comparativa de cuantizaciones: el repositorio sirve como punto de comparacion frente a los pesos originales en bf16 o frente a cuantizaciones de 4 y 8 bits, para medir la perdida de calidad del esquema oQ a 6 bits.
- Tareas de generacion de texto con requisitos de privacidad: al ejecutarse en local, los datos no salen del dispositivo, lo que encaja en entornos con restricciones de tratamiento de datos personales.
- Automatizacion de tareas de redaccion y resumen en lotes pequenos: con un throughput limitado por el ancho de banda de memoria, es viable para volumenes moderados en local, no para servicio de alta concurrencia.
- Base para ajuste fino ligero (LoRA/QLoRA) sobre MLX: si la libreria y el modelo base lo permiten, los pesos cuantizados pueden servir de punto de partida para adaptaciones de dominio, aunque esto no esta documentado en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K u otros) ni comparaciones con los pesos originales. Ademas, la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo: los enlaces obtenidos tratan sobre el concepto de intervalo en Formula 1 y no guardan ninguna relacion con el artefacto.

## Requisitos de hardware

- VRAM/memoria para los pesos: aproximadamente 9,7-10 GB, calculado a partir de los 11,9 B de parametros y una representacion efectiva de 6 bits mas el escalado de grupos de 64 (unos 6,25-6,5 bits por peso). El tamano declarado del repositorio, 10,0 GB, es consistente con esta estimacion.
- Memoria adicional: hay que sumar el cache KV y el estado de la aplicacion. Al no conocerse la longitud de contexto soportada, no puede estimarse el consumo en contextos largos; el cache KV crece de forma lineal con el contexto y puede superar varios GB con ventanas grandes.
- Hardware objetivo: chips de Apple con memoria unificada. 16 GB es insuficiente en la practica (los pesos dejan poco margen para el sistema y el cache KV); 24 GB es el minimo razonable; 32 GB o mas ofrece holgura. Chips M-series Max y Ultra, con mayor ancho de banda, son los mas adecuados.
- GPU NVIDIA: no aplicable de forma nativa. Los pesos estan en formato MLX, que requiere el runtime de MLX sobre Metal. Su uso en CUDA exigiria convertir los pesos a otro formato y reconstruir la cuantizacion, algo no documentado en el repositorio.
- Cabe en GPU de consumo: no en el sentido de GPU dedicada NVIDIA/AMD; si en el sentido de hardware Apple de gama alta con memoria unificada.
- Opciones de despliegue: `mlx-lm` (Python), `mlx-swift` u otras integraciones basadas en MLX. No es compatible directamente con vLLM, TGI, llama.cpp ni Ollama, ya que estos esperan pesos en otros formatos (por ejemplo GGUF en el caso de llama.cpp y Ollama).
- Latencia y throughput: no disponibles. Como orientacion teorica, la generacion de tokens en MLX esta limitada por el ancho de banda de memoria; con ~10 GB de pesos, un chip con 400 GB/s de ancho de banda no podria superar de forma teorica unos 40 tokens/s. Es una cota calculada, no una medida real del modelo.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada, ni de resultados de rendimiento de este repositorio que permitan establecer una comparacion. Como referencia de categoria, podria compararse con los pesos originales sin cuantizar del mismo modelo base (mayor calidad potencial, mayor consumo de memoria) o con cuantizaciones alternativas de 4 y 8 bits del mismo modelo base, pero no hay datos publicos disponibles sobre ninguna de esas variantes en la informacion facilitada.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| gemma-4-12B-it-oQ6e (este repositorio) | 11,9 B | no disponible | no disponible | MLX safetensors, 6 bits | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, no hay autorizacion clara para uso comercial. En la practica, debe tratarse como no apta para produccion hasta que se aclare la licencia de los pesos base y la del propio repositorio.
- Cuantizacion de terceros: el repositorio no lo publica el desarrollador del modelo original. La degradacion respecto a los pesos sin cuantizar no esta medida ni documentada.
- Precision de 6 bits: por debajo de 8 bits suele aparecer cierta perdida en tareas sensibles a la precision, como matematicas o generacion de codigo. No hay datos que cuantifiquen ese efecto en este caso.
- Revision silenciosa de los pesos: la model card indica que esta version sustituye a una anterior y pide volver a descargar los pesos. Esto rompe la reproducibilidad de cualquier resultado previo y obliga a fijar un hash del repositorio.
- Sin adopcion: 0 descargas y 0 likes implican que los pesos no han sido validados por terceros. No hay informes de fallos ni de comportamiento esperado.
- Idiomas y sesgos: no se declara ninguna lista de idiomas, por lo que se desconoce el soporte real del castellano y de otras lenguas, asi como los sesgos heredados del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos, y agravado aqui porque no hay evaluaciones publicadas. No debe usarse en dominios facticos sin verificacion humana.
- Contexto desconocido: al no indicarse la longitud de contexto, no puede planificarse su uso en tareas de documento largo ni estimarse con precision el consumo de memoria.
- Incompatibilidad de ecosistema: al ser MLX, queda fuera de las pilas de despliegue mas extendidas en servidor (vLLM, TGI), lo que limita su uso a hardware Apple.
- Busqueda web sin resultados utiles: no existe documentacion externa, paper ni blog que respalde las caracteristicas del modelo. Toda afirmacion no incluida en los metadatos del repositorio debe considerarse no verificada.

## Enlaces

- HuggingFace: https://huggingface.co/TiGa-RCE/gemma-4-12B-it-oQ6e
- Repositorio de oQ / oMLX (herramienta de cuantizacion citada en la model card): https://github.com/jundot/omlx
- Paper, blog o demo del modelo: no disponible
- Resultados de busqueda web relevantes: ninguno (los resultados obtenidos no guardan relacion con el modelo)
