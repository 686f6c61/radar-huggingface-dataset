# thesimonharms/mverify

## Resumen

mverify es un clasificador binario de texto desarrollado por thesimonharms que evalúa un unico par (prompt, output) y responde a una pregunta concreta: la salida cumple lo que pide el prompt. No es un modelo de lenguaje, no es un juez de correccion general y no ejecuta pruebas ni compilaciones; su funcion es servir como paso de verificacion dentro del pipeline de la herramienta mcode, que lo integra como un filtro rapido y barato.

Tecnicamente no es una red neuronal: se trata de un clasificador lineal TF-IDF con regresion logistica L2 entrenado sobre el texto empaquetado de prompt y salida, al que se anaden caracteristicas de par como solapamiento lexico, carencias de formato, deteccion de rechazo y comprobacion de idioma. La inferencia se ejecuta con numpy en CPU, sin ruta de GPU, lo que da una latencia p95 medida de 0,22 ms por par.

Su relevancia es practica: ofrece una verificacion de bajo coste que puede ejecutarse en cada paso de un agente o generador de codigo sin consumir GPU ni llamadas a API. Los pesos se distribuyen como ficheros numpy y JSON, y la licencia MIT permite integrarlo sin restricciones. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto reciente y sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + regresion logistica L2 sobre texto concatenado de prompt y salida, mas caracteristicas de par (solapamiento, carencias de formato, rechazo, idioma) |
| Parametros totales | no disponible (modelo lineal; los coeficientes se guardan en `mverify.npz` y no se publica su recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no existe ventana de contexto; el par completo se vectoriza con TF-IDF sobre el vocabulario de `vocab.json`) |
| Tipos de cuantizacion | no aplica (inferencia numpy en CPU con los coeficientes almacenados) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `.npz` de numpy (pesos TF-IDF y coeficientes de regresion logistica), junto con `vocab.json` y `mverify.json` |
| Tamano del repositorio | 0,0 GB |
| Umbral de confianza por defecto | 0,7 (criterio `pass && confidence >= confidenceThreshold`) |
| Entrada | Par prompt/output por CLI o JSON por stdin |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal clasico. La representacion de entrada combina una bolsa de terminos ponderada con TF-IDF, calculada sobre el texto empaquetado de prompt y salida, con un conjunto de caracteristicas de par que codifican relaciones entre ambas cadenas: solapamiento lexico, carencias de formato respecto a lo solicitado, indicios de rechazo y comprobacion de idioma. Sobre ese vector se aplica una regresion logistica con regularizacion L2, y la inferencia se resuelve con numpy en CPU, sin ninguna ruta de GPU.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de ajuste posteriores; el modelo card remite a `scripts/train.py` con semilla 42 y menciona metadatos de entrenamiento en `mverify.json`. Los pesos se reparten en cuatro ficheros: `mverify.npz` con los pesos TF-IDF y los coeficientes de regresion, `vocab.json` con el vocabulario de terminos, `mverify.json` con el umbral, los nombres de las caracteristicas de par y los metadatos de entrenamiento, y `eval.json` con las ultimas puntuaciones medidas.

## Capacidades

- Clasificacion binaria de pares (prompt, output): determina si la salida satisface la peticion, con una probabilidad asociada entre 0 y 1.
- Deteccion de fallos evidentes: la metrica objetivo es una sensibilidad (`recall`) de al menos 0,95 sobre fallos flagrantes.
- Deteccion de rechazos: incorpora una caracteristica especifica de rechazo en la respuesta.
- Comprobacion de formato: detecta carencias de formato y, segun los motivos devueltos, puede indicar que la salida incluye un bloque de codigo en el idioma solicitado.
- Comprobacion de idioma: incluye el idioma como caracteristica de par (solo ingles).
- Motivos legibles: la salida incluye una lista `reasons` con explicaciones textuales del veredicto.
- Integracion por CLI y por stdin JSON, con codigo de salida 0 cuando la herramienta se ejecuta correctamente.
- No soporta tool calling, ni function calling, ni razonamiento multi-paso, ni agentes: es un unico paso de clasificacion.
- No tiene modo de razonamiento, ni vision, ni audio, ni generacion de texto.

## Casos de uso

- Verificacion en pipelines de generacion de codigo: tras generar una respuesta con un LLM, mverify comprueba que la salida cumple la peticion original antes de aceptarla, con un coste de CPU de 0,22 ms p95 por par y sin consumir GPU.
- Filtro previo en bucles de agente: en arquitecturas de varios pasos, cada salida intermedia puede validarse con este clasificador para detectar respuestas que no responden a la instruccion antes de continuar la cadena.
- Reduccion de coste frente a jueces LLM: para decisiones de aceptacion o rechazo de formato y contenido evidente, sustituye a un modelo juez de mayor tamano en la mayoria de casos, reservando el juez caro para los pares dudosos.
- Control de calidad en lotes de datos sinteticos: al generar ejemplos prompt/output de forma masiva, el clasificador permite descartar pares incoherentes antes de incorporarlos a un dataset de entrenamiento o evaluacion.
- Regresion en CI/CD de prompts: integrar `mverify check` en una pipeline permite que los cambios en plantillas de prompt se validen automaticamente contra un conjunto fijo de pares, con un umbral de confianza configurable.
- Deteccion de evasivas y rechazos: la caracteristica de rechazo permite marcar respuestas que eluden la tarea en lugar de resolverla, util en sistemas que deben garantizar una respuesta efectiva.
- Comprobacion de formato en informes o codigo: valida que la salida respeta el formato pedido, por ejemplo que incluye un bloque de codigo en el lenguaje solicitado.
- Pre-filtrado en evaluacion humana: prioriza que pares revisar manualmente, descartando los casos claramente correctos o claramente fallidos y dejando a revision los de confianza intermedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas disponibles son las de la evaluacion propia del autor:

| Slice | n | Precision (accuracy) | FPR sobre buenos | Recall en fallo flagrante | p95 (ms) |
|---|---|---|---|---|---|
| eval | 500 | 0,860 | 0,030 | 0,956 | 0,22 |
| same-data Bayes | 500 | 0,794 | 0,758 | 0,918 | — |

Objetivos declarados por el autor: recall en fallo flagrante igual o superior a 0,95, tasa de falso fallo sobre la porcion de salidas buenas por debajo de 0,05 y latencia p95 inferior a 200 ms en CPU.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. No existe ruta de GPU; la inferencia se ejecuta en CPU con numpy.
- GPU recomendadas: no aplica. El modelo no se beneficia de A100, H100, RTX 4090 ni de ninguna otra GPU.
- GPU de consumo: irrelevante, porque no usa GPU en absoluto.
- CPU: cualquier CPU moderna es suficiente; la latencia medida es de 0,22 ms p95 por par en el conjunto de evaluacion.
- Memoria del sistema: el repositorio ocupa 0,0 GB, por lo que el modelo completo cabe holgadamente en memoria en cualquier equipo.
- Opciones de despliegue: CLI instalada desde el repositorio git con `uv add` o clonando el repositorio, y modo de entrada por stdin JSON. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni un transformer.
- Throughput: no publicado de forma explicita; puede estimarse en el orden de miles de pares por segundo por nucleo a partir de la latencia p95 declarada, aunque se trata de una extrapolacion, no de un dato medido.

## Comparativa con modelos similares

No se dispone de datos numericos de modelos comparables en la informacion proporcionada. La comparacion siguiente es cualitativa, basada solo en la naturaleza de cada enfoque:

| Alternativa | Tipo | Coste de inferencia | Cobertura | Licencia |
|---|---|---|---|---|
| mverify | Clasificador lineal TF-IDF + regresion logistica | CPU, 0,22 ms p95 | Verificacion binaria de pares prompt/output en ingles | MIT |
| Juez basado en LLM | Modelo generativo | GPU o API, cientos de ms o mas por par | Evaluacion semantica amplia, multilingue | Depende del modelo |
| Comprobaciones heuristicas a medida | Reglas y expresiones regulares | CPU, muy bajo | Solo patrones definidos explicitamente | La del proyecto |
| Modelo de inferencia de lenguaje natural (NLI) | Transformer encoder | CPU o GPU, decenas de ms | Implicacion textual generica, no especifica de prompt/output | Depende del modelo |

No se dispone de cifras de parametros, contexto ni rendimiento de estas alternativas dentro de la informacion facilitada, por lo que no se incluyen comparaciones numericas.

## Limitaciones y advertencias

- No es un juez de correccion general: el propio autor indica que no evalua si una respuesta es correcta en terminos absolutos, sino si satisface la peticion del prompt.
- No ejecuta pruebas, compilaciones ni validacion funcional del codigo generado.
- Solo ingles: el modelo esta etiquetado unicamente para `en`, por lo que no debe esperarse un comportamiento fiable en castellano u otros idiomas.
- Tasa de falso fallo del 3,0 por ciento sobre la porcion de salidas buenas en el conjunto de evaluacion, y una tasa de fallo no detectado del 4,4 por ciento sobre fallos flagrantes (recall 0,956), segun los datos declarados.
- Evaluacion limitada: las metricas se miden sobre 500 pares, con semilla fija (42) y tras ejecutar `scripts/train.py`, sin validacion externa ni comparacion con otros conjuntos.
- La fila `same-data Bayes` del informe muestra una tasa de falso positivo sobre salidas buenas de 0,758, una cifra muy alta que conviene interpretar con cautela y que el material disponible no explica en detalle.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre, pero si puede asignar alta confianza a pares que superficialmente cumplen el patron y fallan semanticamente.
- Sesgos: al depender de TF-IDF y de caracteristicas de solapamiento, favorece salidas que repiten terminos del prompt y puede penalizar respuestas correctas formuladas con vocabulario distinto.
- Dependencia del vocabulario: los terminos fuera de `vocab.json` no contribuyen a la representacion, lo que limita su comportamiento ante dominios o jergas no vistas en el entrenamiento.
- Integracion acoplada: el diseno esta pensado para el pipeline de mcode, y el criterio de aceptacion combina `pass` con un umbral de confianza por defecto de 0,7; usarlo fuera de ese contexto requiere calibrar el umbral.
- Adopcion nula verificable: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin senales de uso en produccion por terceros.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la unica obligacion habitual de conservar el aviso de copyright y la licencia.
- Sin mantenimiento garantizado ni soporte: el proyecto se distribuye desde un repositorio git personal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thesimonharms/mverify
- Repositorio de codigo: https://git.simonharms.com/thesimonharms/mverify
- Repositorio (clonacion): https://git.simonharms.com/thesimonharms/mverify.git

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relevante sobre el modelo; los enlaces recuperados corresponden al portal del INPS y no guardan relacion con mverify. No se dispone por tanto de papers, blogs ni demos adicionales.
