# ZenoDivergent/zeno-divergent-v057

## Resumen

Zeno (identificador `ZenoDivergent/zeno-divergent-v057`) es un modelo de correccion de pronosticos de tipo tabular, no un modelo de lenguaje. Su funcion es recibir un panel de predicciones procedentes de varios sistemas (por ejemplo, distintos ensembles meteorologicos) para una misma pregunta y devolver un pronostico corregido acompanado de un intervalo del 90 %, ademas de una estimacion de la probabilidad de que cada pronosticador "confiado" este a punto de equivocarse con seguridad. Lo desarrolla ZenoDivergent y se distribuye bajo licencia propia `zeno-research`.

El modelo se presenta como un "model of models" con pesos compartidos entre dominios: una unica red, entrenada de forma simultanea sobre todos los dominios disponibles, en lugar de un modelo especializado por area. Cualquier pregunta expresada como pronosticos (cuantiles, probabilidades binarias o valores puntuales) encaja en la misma interfaz. El autor insiste en que Zeno nunca sustituye a los pronosticadores de origen: solo aplica una correccion en aquellos casos en los que esa correccion supero a la referencia del propio pronosticador en dos periodos posteriores que el modelo nunca vio durante el entrenamiento; en el resto de casos devuelve la referencia etiquetada como tal.

La relevancia practica esta en el control de calidad de pronosticos: el modelo no compite por precision bruta, sino que decide cuando merece la pena fiarse de una correccion y cuando no, y expone esa decision mediante el campo `served_as` (`full`, `no_track_record` o `reference`). El checkpoint corresponde al run de entrenamiento v0.57 (`v057-main-l40sx1-20261007T1138Z`), con 9.160.173 parametros y artefactos en formato safetensors y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de episodios (`zeno-episode-transformer`), red unica con pesos compartidos entre dominios |
| Parametros totales | 9.160.173 (9,16 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuyen variantes ONNX `lite` y `lite_nohist` en tamanos `s11`, `s23` y `s37` (y equivalentes en `onnx/experimental/`) |
| Idiomas soportados | no disponible (modelo de regresion tabular, no procesa texto libre) |
| Licencia | `zeno-research` (declarada como `license: other`) |
| Formato de pesos | safetensors (`model.safetensors`, `model-no-track-record.safetensors`) y ONNX |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como `zeno-episode-transformer`, un transformer que opera sobre "episodios": cada consulta agrupa un panel de pronosticos con metadatos temporales (`available_at`, `decision_at`, `target_at`), el historial de cada pronosticador (`n`, `coverage_90`, `mean_signed_error`, `hours_since_last_resolution` y una lista de `experiences[]` con resoluciones pasadas) y, opcionalmente, la dependencia por pares entre pronosticadores (`matched_outcomes`, `both_missed`, `a_missed`, `b_missed`). El modelo es unico y con pesos compartidos: no hay cabezas ni checkpoints separados por dominio.

El detalle del dataset de entrenamiento, el numero de tokens o episodios, la composicion y el uso de RLHF o DPO no se especifican en la informacion disponible. El autor si describe el criterio de validacion: para cada fuente, la correccion solo se sirve si batio a la referencia del propio pronosticador en dos periodos posteriores no vistos en entrenamiento. Ese criterio se materializa en dos modos de uso: `proven` (por defecto), que restringe la correccion a los dominios donde el modelo demostro esa mejora, y `experimental`, que aplica la correccion completa tambien en dominios no vistos y marca la respuesta como no probada alli. Existe ademas una variante `no-track-record` que ignora los historiales.

## Capacidades

- Correccion de pronosticos agregados: recibe un panel de pronosticadores y devuelve media, desviacion tipica (`sd`) e intervalo del 90 % (`range90`), junto con la referencia usada (mediana del panel en valores numericos, media de probabilidades en preguntas binarias).
- Deteccion de "confiadamente equivocado": estima, por pronosticador, la probabilidad de que el resultado caiga fuera del rango declarado (`confidently_wrong`), e identifica que pronosticadores son "confiados" por tener rangos mas estrechos que el resto (`confident_forecasters`).
- Soporte de tres tipos de pronostico de entrada: `quantiles_05_50_95` (q05, q50, q95), `binary_probability` (probability) y `point` (q50).
- Uso de historial de aciertos por pronosticador y de dependencia por pares (frecuencia con la que dos fuentes fallan juntas).
- Control explicito de la procedencia de la respuesta mediante el campo `served_as`, con salida `reference` cuando el modelo no se considera validado para esa fuente.
- Multidominio: misma red para todos los dominios; lo unico que cambia es el permiso de correccion.
- Integracion como herramienta en agentes: endpoint HTTP publico sin clave, servidor MCP con la herramienta `zeno_check` para Claude, ChatGPT y Cursor, y fichero de instrucciones e inventario para agentes.
- No dispone de capacidades de generacion de texto, codigo, vision ni audio.

## Casos de uso

- Gestion de riesgo meteorologico: agregar ensembles como ECMWF, GEFS o ICON en una consulta de temperatura o precipitacion y obtener un intervalo del 90 % corregido, con la probabilidad de fallo de cada ensemble. El modelo esta disenado para este tipo de paneles y expone ejemplos listos para ejecutar en `examples/weather.json`.
- Energia y demanda electrica: combinar pronosticos de demanda o de generacion renovable de distintos proveedores y detectar cuando una fuente esta sobreconfiada, para dimensionar reservas o coberturas intradia.
- Alertas tempranas en salud publica: introducir predicciones de incidencia procedentes de varios modelos epidemiologicos como probabilidades binarias (por ejemplo, superacion de un umbral) y obtener una probabilidad agregada con aviso de sobreconfianza por fuente.
- Cadena de suministro y planificacion de demanda: corregir paneles de previsones de venta o de plazos de entrega en formato de cuantiles, usando el historial de cada sistema de previsión como senal.
- Evaluacion de proveedores de pronosticos: dado que la salida incluye `coverage_90` y errores historicos de cada fuente, el modelo sirve como capa objetiva para comparar y monitorizar la fiabilidad de proveedores externos antes de contratarlos.
- Razonamiento asistido por agentes: conectar el endpoint MCP `https://zenodivergent.dev/api/public/v1/mcp` a un agente conversacional para que, antes de tomar una decision basada en un pronostico, consulte `zeno_check` y reciba la version corregida con su incertidumbre.
- Banca, seguros y trading: procesar pronosticos de precio o de probabilidad de evento crediticio publicados por varias mesas o modelos, exigiendo que la respuesta venga servida como `full` para descartar casos no validados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye imagenes de resultados (`assets/results.png`) y hace referencia a que el modelo compara su correccion con la referencia del pronosticador en dos periodos posteriores no vistos, pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de metricas de previsión concretas en el material facilitado.

## Requisitos de hardware

- Huella de pesos: 9,16 M de parametros, aproximadamente 36,6 MB en fp32 y unos 18,3 MB en fp16 para los safetensors (el repositorio completo ocupa 0,8 GB, que incluye imagenes, ONNX, codigo de carga y ejemplos).
- El quickstart oficial esta pensado para CPU: `pip install huggingface_hub onnxruntime numpy` y ejecucion con `Zeno.load(root)`, estimada en aproximadamente un minuto, incluyendo la descarga de artefactos.
- Cabe en cualquier GPU de consumo y en practicamente cualquier maquina: no requiere A100, H100 ni RTX 4090. Una GPU consumer solo aportaria ventaja en inferencia por lotes de gran volumen.
- Opciones de despliegue: `onnxruntime` en CPU, PyTorch con safetensors, el endpoint HTTP publico sin clave, y servidor MCP para agentes. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de regresion tabular de este tamano.
- Latencia y throughput: no disponibles mas alla de la estimacion de aproximadamente un minuto en el ejemplo de CPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, y la model card no establece comparaciones con alternativas de correccion de pronosticos o de apilamiento de ensembles.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan. El modelo depende de los historiales y de la composicion del panel de entrada, por lo que un panel sesgado o unos historiales incompletos condicionan la correccion.
- Riesgo de correccion indebida: en modo `experimental` el modelo aplica su correccion completa incluso en dominios que nunca ha visto y etiqueta la respuesta como no probada alli. Ese modo no debe usarse en produccion sin validacion propia.
- Riesgo de sobreconfianza en la probabilidad de fallo: los valores de `confidently_wrong` son estimaciones; en el ejemplo de la model card dos fuentes reciben 1e-06, lo que refleja una probabilidad muy baja y no una certeza de que acierten.
- Cobertura de fuentes: las fuentes desconocidas devuelven directamente la referencia, y las consultas con campos publicados o resueltos despues de `decision_at` se ignoran, lo que puede degradar la respuesta si los sellos temporales son incorrectos.
- Idiomas: no aplica soporte multilingue; el modelo no procesa texto libre, solo estructuras de pronosticos. La descripcion de la pregunta (`site_id`, `channel`, `unit`) se usa unicamente como contexto de tarea.
- Licencia: `zeno-research` declarada como `license: other`. No se detallan en la informacion disponible los terminos de uso comercial, por lo que es imprescindible revisar el fichero `LICENSE` del repositorio antes de cualquier despliegue en produccion.
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y el propio autor lo etiqueta como run de entrenamiento v0.57, sin resultados de benchmarks publicados en el material disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZenoDivergent/zeno-divergent-v057
- Demo en navegador (Space): https://huggingface.co/spaces/mbarbosa1/zeno-try-it
- Sitio web del proyecto: https://zenodivergent.dev
- API publica (sin clave): `POST https://zenodivergent.dev/api/public/v1/check`
- Servidor MCP (herramienta `zeno_check`): https://zenodivergent.dev/api/public/v1/mcp
- Instrucciones e inventario para agentes: https://zenodivergent.dev/agents.md

Nota: la busqueda web asociada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden exclusivamente de la informacion de HuggingFace y de la model card.
