# UraionLabs/uraion-forge-2b-mlx

## Resumen

Uraion Forge 2B MLX es la version empaquetada especificamente para el framework MLX de Apple del modelo Uraion Forge 2B, desarrollado por Uraion Labs. Se trata de un modelo denso de aproximadamente 2.516 millones de parametros (2,52B) orientado a razonamiento autonomo, llamada a herramientas (function calling) y generacion de codigo, con un enfoque declarado de ejecucion local en hardware Apple Silicon (M1 a M6). El modelo parte de `openbmb/MiniCPM5-2B` como modelo base y se distribuye bajo licencia Apache 2.0, exclusivamente en ingles.

La propuesta de valor del modelo es el despliegue en el borde: al usar la arquitectura de memoria unificada (UMA) de Apple Silicon, los pesos, la cache KV y las activaciones permanecen en el mismo pool de memoria, eliminando las copias por bus PCIe. La model card reporta velocidades sostenidas de 90-120+ tokens por segundo y huellas de memoria de aproximadamente 1,2 GB en cuantizacion de 4 bits, 2,3 GB en 8 bits y 4,6 GB en bfloat16, lo que permite ejecutarlo en MacBooks con 8 o 16 GB de RAM.

Su relevancia actual se debe a la combinacion de tres factores: soporte nativo de MLX/Metal, una ventana de contexto de 16k ampliable a 131k mediante RoPE, y un entrenamiento orientado a flujos agenticos con herramientas, donde la model card declara una fiabilidad del 90,5% en su suite principal de confirmacion agentica. El repositorio es muy reciente y no cuenta con descargas ni validacion independiente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de tipo LLaMA (segun el tag `llama` de la model card); modelo base `openbmb/MiniCPM5-2B` |
| Parametros totales | 2.516.756.480 (2,52B) |
| Parametros activos | No aplica; modelo denso, no MoE |
| Longitud de contexto | 16k nativo; ampliable a 131k mediante RoPE segun la model card |
| Tipos de cuantizacion | 4 bits (`q4`), 8 bits (`q8`) y bfloat16 de 16 bits nativo |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Tamano del repositorio | 5,0 GB |
| Pipeline | text-generation |
| Plantilla de chat | ChatML (`<|im_start|>` / `<|im_end|>`), con system prompt especifico del modelo |
| Fecha de publicacion | 12 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion detallada de la arquitectura interna mas alla del tag `llama` y la referencia al modelo base `openbmb/MiniCPM5-2B`. Por los tags y el pipeline, se trata de un transformer decoder autorregresivo de tipo LLaMA con plantilla de chat estilo ChatML, afinado para generacion de texto conversacional y para la emision de llamadas a herramientas en bloques de codigo JSON. No se especifica el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni si emplea atencion con ventana deslizante o atencion completa.

Tampoco se detallan en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. La model card si describe un comportamiento entrenado explicitamente: cuando falta un parametro obligatorio en una llamada a herramienta, el modelo debe solicitar aclaracion con una pregunta terminada en `?` en lugar de inventar el valor. Se mencionan ademas capacidades de gestion de conflictos de concurrencia (codigo `409 Conflict`) y de retrocesos con reintentos (retry backoff) en transacciones de API. La extension de contexto hasta 131k se atribuye a RoPE, sin mas precision sobre interpolacion o escalado de frecuencias.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con soporte de system prompt mediante plantilla ChatML.
- Razonamiento explicito con cadena de pensamiento (tags `reasoning` y `cot`).
- Llamada a funciones y uso de herramientas externas con salida estructurada en bloques JSON.
- Comportamiento agentico multi-paso: orquestacion de secuencias de llamadas a API, gestion de conflictos de concurrencia y reintentos con espera.
- Solicitud de aclaracion ante parametros faltantes, en lugar de generar valores inventados, segun el entrenamiento declarado.
- Generacion de codigo, con ejemplos orientados a kernels de MLX para Apple Silicon y computacion cuantitativa.
- Contexto largo: 16k tokens nativos y hasta 131k mediante RoPE, lo que habilita recuperacion sobre documentos extensos.
- No se declaran capacidades de vision, audio, multimodalidad ni tool calling nativo del tokenizador fuera del formato de bloques de codigo indicado en la model card.
- Multilingue: no; solo ingles.

## Casos de uso

- Agente local de automatizacion en MacBook: el modelo puede ejecutar flujos de varias llamadas a API manteniendo el estado en la cache KV dentro de la memoria unificada, sin coste de transferencia por bus, lo que resulta adecuado para tareas interactivas con latencias bajas en un portatil.
- Asistente de codigo integrado en el editor: con 16k tokens de contexto y generacion de 90-120+ tokens por segundo, permite autocompletado y refactorizacion en tiempo real sin conexion a servicios externos.
- Orquestacion de APIs de datos financieros: los ejemplos de la propia model card (calculo de EMA sobre series temporales, consulta de la metrica `volume_vwap` a 60 minutos) ilustran su uso para lanzar consultas estructuradas contra endpoints analiticos y procesar la respuesta.
- Soporte tecnico automatizado multi-turno: el modelo mantiene conversaciones con contexto largo y puede invocar herramientas de consulta de estado o de creacion de incidencias, pidiendo aclaracion cuando faltan datos.
- Procesamiento por lotes de tareas de codigo en CI/CD: al ser un modelo de 2,52B ejecutable en local, puede integrarse en pipelines para generar pruebas, revisar diffs o producir scripts, con la ventaja de no enviar codigo propietario a terceros.
- Recuperacion aumentada sobre documentacion extensa: la extension de contexto a 131k mediante RoPE permite insertar manuales o bases de conocimiento completas y hacer preguntas sobre ellos en una sola pasada.
- Asistencia offline en entornos sin conectividad o con requisitos de privacidad estrictos: al ejecutarse sobre MLX en hardware Apple, no requiere red ni transferencia de datos a la nube, lo que encaja en escenarios de trabajo de campo, legal o sanitario.
- Prototipado rapido de agentes: sirve como banco de pruebas de bajo coste para disenar esquemas de herramientas, validar plantillas de prompt y medir fiabilidad de llamadas antes de migrar a modelos mayores.

## Benchmarks y rendimiento

La model card publica resultados de una "suite de confirmacion sellada" de 41 tareas retenidas: 21 flujos agenticos multi-turno con herramientas y 20 tareas de programacion, distribuidas en 6 entornos de software distintos.

| Modo de evaluacion | Dominio | Tasa de exito | Exitos / Total | Turnos truncados | Latencia |
|---|---|---:|---:|---:|---:|
| Confirmacion agentica de herramientas (primario) | Flujos con herramientas | 90,5% | 19 / 21 | 2 / 21 | 2.043 s |
| Confirmacion agentica de herramientas (secundario) | Flujos con herramientas | 61,9% | 13 / 21 | 0 / 21 | 273 s |
| Generacion de codigo concisa (secundario) | Codigo directo | 35,0% | 7 / 20 | 2 / 20 | 368 s |
| Codigo con razonamiento sin restricciones (primario) | Codigo directo | 15,0% | 3 / 20 | 16 / 20 | no disponible (dato truncado en la informacion) |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval, GSM8K o similares, ni comparaciones directas con otros modelos en esas pruebas. Las cifras de latencia corresponden al tiempo total de ejecucion de cada suite, no a latencia por token.

## Requisitos de hardware

- Huella de memoria declarada: aproximadamente 1,2 GB en cuantizacion de 4 bits, 2,3 GB en 8 bits y 4,6 GB en bfloat16.
- Hardware objetivo: Apple Silicon M1, M2, M3, M4, M5 y M6, en configuraciones Pro y Max incluidas, aprovechando la memoria unificada y las Metal Performance Shaders.
- Cabe en GPU de consumo: si, en el sentido de que se ejecuta en Macs con 8 GB de RAM en cuantizacion de 4 bits, y con 16 GB de forma holgada. No esta pensado para GPUs NVIDIA o AMD de consumo, ya que el formato de pesos es MLX y la libreria declarada es `mlx`.
- GPU de centro de datos: no disponible. La model card no menciona soporte para A100, H100 ni similares; MLX esta orientado a Apple Silicon.
- Throughput declarado: mas de 90-120 tokens por segundo en MacBooks con Apple Silicon.
- Opciones de despliegue: ecosistema MLX (`ml-explore/mlx`), con la libreria `mlx` indicada en el repositorio. Para otros entornos (por ejemplo llama.cpp, Ollama, vLLM o TGI) seria necesario convertir los pesos a GGUF u otro formato, algo que no se documenta en la informacion disponible.
- La arquitectura de memoria unificada evita copias por PCIe, lo que se traduce en arranques en frio practicamente instantaneos segun la model card.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con el modelo base y con alternativas de la misma categoria de forma cualitativa. Los datos de los modelos de referencia no provienen de la model card y deben verificarse en sus propias fichas.

| Modelo | Parametros | Contexto | Licencia | Formatos | Ejecucion en Apple Silicon | Benchmarks publicados en esta informacion |
|---|---|---|---|---|---|---|
| Uraion Forge 2B MLX | 2,52B | 16k / 131k con RoPE | Apache 2.0 | safetensors MLX | Nativa (MLX y Metal) | Suite sellada propia: 90,5% en agentica primaria |
| openbmb/MiniCPM5-2B (modelo base) | no disponible | no disponible | no disponible | no disponible | Depende del soporte MLX del modelo base | No disponible |
| Modelos de borde de ~2-3B de la misma categoria (por ejemplo, familias Llama 3.2 1B/3B o Qwen2.5 1.5B/3B) | ~1-3B | 128k en algunos casos | licencias permisivas o comunitarias segun el modelo | safetensors, GGUF, MLX en varios casos | Variable; varios cuentan con builds MLX de terceros | No disponibles en esta informacion |

No se dispone de datos que permitan comparar el rendimiento de Uraion Forge 2B con alternativas bajo las mismas condiciones de evaluacion.

## Limitaciones y advertencias

- Modelo unicamente en ingles: no se declara soporte de castellano ni de otros idiomas.
- La propia suite de evaluacion muestra una caida notable segun el modo de uso: 90,5% en agentica primaria frente a 61,9% en la variante secundaria, 35,0% en generacion de codigo concisa y 15,0% en codigo con razonamiento sin restricciones.
- En el modo de razonamiento sin restricciones se truncaron 16 de 20 tareas, lo que sugiere un consumo excesivo de tokens de pensamiento que puede agotar el presupuesto de generacion en produccion. Conviene limitar el presupuesto de razonamiento o forzar respuestas concisas.
- El tamano muestral de la evaluacion es reducido (41 tareas) y no hay replicacion independiente ni resultados en benchmarks estandar.
- Riesgo de alucinacion en argumentos de herramientas: aunque el modelo esta entrenado para pedir aclaracion con `?` cuando falta un parametro, no hay garantia de que lo haga en todos los casos; se recomienda validar los esquemas JSON antes de ejecutar cualquier accion.
- Riesgo de alucinacion factual general inherente a un modelo de 2,52B, especialmente en tareas de conocimiento enciclopedico o calculos no verificables.
- El repositorio tiene cero descargas y cero interacciones en el momento de la consulta, y la fecha de publicacion registrada es posterior a la fecha de redaccion de muchas evaluaciones habituales; no existe historial de uso en produccion.
- No se documentan datos de entrenamiento, composicion del dataset ni proceso de alineacion, por lo que no es posible evaluar sesgos conocidos ni procedencia del contenido. La ausencia de esta informacion es en si misma un riesgo para despliegues regulados.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de cumplir las condiciones del modelo base `openbmb/MiniCPM5-2B`, cuyos terminos no se detallan en la informacion disponible.
- El formato MLX limita el despliegue a hardware Apple; no hay instrucciones publicadas de conversion a GGUF ni de soporte en vLLM, TGI o llama.cpp.
- La ventana de 131k depende del escalado RoPE y no se documentan pruebas de recuperacion en esa longitud; el valor de 16k es el declarado como nativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UraionLabs/uraion-forge-2b-mlx
- Sitio de Uraion Labs: https://uraionlabs.com
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Apple Silicon: https://apple.com
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos eran contenido no relacionado (foros y articulos en chino sin vinculacion con el modelo). No se han encontrado papers, blogs tecnicos, repositorios adicionales ni demos asociados en la informacion disponible.
