# ZZRI/Feihua-n2-1.7B

## Resumen

Feihua-n2-1.7B es un modelo de 1.707.657.216 parametros publicado por ZZRI sobre el modelo base XHToken/Spark-X2.5-1.7B (28 capas, hidden 2048). Se presenta como el primer modelo de la denominada era NGI (Nonsense General Intelligence), cuyo objetivo declarado es desacoplar dos dimensiones de capacidad: la dimension de accion (identificacion de herramientas, seleccion de funciones y generacion de argumentos) y la dimension de expresion (contenido informativo de la respuesta final). El resultado buscado es que el modelo ejecute correctamente las llamadas a herramientas pero entregue respuestas finales con informacion nula.

Tecnicamente, el modelo es un ajuste LoRA de rango 16 y alpha 32 sobre el modelo base congelado en fp16, entrenado sobre 4.000 dialogos: 3.000 conversaciones de tool calling extraidas del dataset sft_t2t_mini del proyecto minimind, cuyas respuestas finales fueron reescritas por un profesor Qwen3.6-35B-IQ4_XS para eliminar todo dato, cifra y conclusion, mas 1.000 dialogos de pura divagacion. El entrenamiento completo se ejecuto en 50 minutos sobre una unica Tesla P100.

Su relevancia es fundamentalmente experimental: sirve como caso de estudio sobre hasta que punto el canal de tool calling de un agente puede sobrevivir a un ajuste que destruye deliberadamente la utilidad de la respuesta final. Conviene subrayar que no es un modelo de proposito general: los datos publicados muestran un MCP-Atlas de 3,5/100 y un IFBench de 12,5/100, con argumentos de herramienta vacios en 19 de 19 invocaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada explicitamente por el autor; modelo base Spark-X2.5 de 28 capas y hidden 2048. La inferencia requiere soporte de la arquitectura spark2_5 en llama.cpp |
| Parametros totales | 1.707.657.216 (1,7B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16 (maestra, 3,2 GB), Q8_0 (1,7 GB), Q4_K_M (1,1 GB), IQ4_XS (978 MB); adaptadores LoRA de rango 16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF y adaptadores LoRA (tag custom_code) |

## Arquitectura y entrenamiento

El modelo no introduce una arquitectura nueva: es un adaptador LoRA sobre XHToken/Spark-X2.5-1.7B, un modelo de 28 capas y dimension oculta 2048 que cuenta con plantilla nativa de tool calling. El LoRA, de rango 16 y alpha 32, se inyecta en todas las capas de atencion y en las capas lineales del MLP, manteniendo el modelo base congelado en fp16. La optimizacion usa una tasa de aprendizaje de 1e-4, batch efectivo de 16, 2 epocas y 880 pasos de optimizacion, con un coste de 50 minutos en una Tesla P100. El enmascarado de perdida se realiza por turnos de asistente mediante un metodo de diferencia de prefijos de plantilla, de modo que los turnos que contienen `tool_call` reciben el mismo tratamiento en el objetivo de optimizacion que los turnos de respuesta final. Como postproceso, el autor corrige el valor ilegal `top_k=-1` de `generation_config` a 50.

La innovacion del trabajo esta en el pipeline de datos, dividido en tres etapas. Primero, la extraccion de 3.000 dialogos con tool calling de las 905.000 conversaciones de sft_t2t_mini (de las cuales 84.832, aproximadamente un 9 %, contienen llamadas a herramientas), con normalizacion de los campos `arguments` de JSON a diccionario para adaptarlos a la plantilla nativa de Spark. Segundo, la reescritura de cada respuesta final por parte de un profesor Qwen3.6-35B-IQ4_XS desplegado en dos tarjetas, con la restriccion dura de no preservar ningun numero, nombre, hecho ni conclusion; segun el autor, las 3.000 respuestas se reescribieron con exito. Tercero, la mezcla de esas 3.000 conversaciones con 1.000 dialogos de divagacion pura, para anclar el comportamiento de la familia anterior. No se documenta ninguna fase de RLHF ni de DPO.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con respuestas finales deliberadamente carentes de informacion util.
- Tool calling nativo: emite `<tool_call>` con nombre de funcion y argumentos, y expone `tool_calls` con `finish_reason=tool_calls` a traves de la API compatible con OpenAI de llama-server.
- Seleccion de funciones dentro de un conjunto habilitado: en la evaluacion MCP-Atlas, 19 de 19 nombres de herramienta emitidos fueron legales respecto a la lista disponible.
- Razonamiento multi-turno: la validacion end-to-end de tipo de cambio confirma que el modelo encadena una primera ronda con llamada a herramienta y una segunda ronda con respuesta final.
- Comportamiento de agente preservado parcialmente: la tasa de activacion del canal de herramientas se mantiene, aunque la generacion de argumentos esta practicamente destruida.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) segun la informacion disponible.
- No se documenta soporte especifico de agentes multi-paso mas alla del ciclo de dos turnos evaluado.

## Casos de uso

- Investigacion sobre desacoplamiento de capacidades: el modelo permite medir de forma aislada como un ajuste supervisado afecta al canal de tool calling mientras degrada la respuesta final, algo poco frecuente en modelos de proposito general.
- Pruebas de robustez de orquestadores de agentes: integrado en un framework como LangChain o similar, permite comprobar si el orquestador gestiona correctamente respuestas finales sin informacion y si propaga bien los argumentos vacios que devuelve el modelo.
- Fuzzing de parsers de tool calls: dado que emite llamadas sintacticamente validas pero con `arguments` vacios en el 100 % de los casos medidos, resulta util para verificar que un parser tolera payloads incompletos sin romper el flujo.
- Arte, humor y experimentos de divulgacion: encaja en instalaciones, bots de broma o demos que explotan la brecha entre una accion correcta y una respuesta vacia, con un coste de despliegue minimo (978 MB en IQ4_XS).
- Docencia sobre el ciclo de vida de un agente: sirve para ilustrar en clase la diferencia entre formato de llamada, seleccion de funcion y generacion de argumentos, ya que cada etapa falla de forma distinta y medible.
- Pruebas de degradacion controlada en pipelines de CI: al ser un modelo de 1,7B y licencia Apache 2.0, se puede incorporar como caso negativo en tests automatizados que verifiquen como reacciona el sistema cuando el agente no aporta informacion.
- Validacion de capas de respaldo: util para comprobar que un sistema con un modelo secundario activa correctamente el fallback cuando la respuesta principal no contiene datos verificables.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor y corresponden a peticiones reales en local. La columna de la izquierda recoge el modelo base sin ajustar y las tres generaciones anteriores de la familia.

| Benchmark (sobre 100) | Spark-1.7B (base) | Feihua-n2-1.7B | Feihua-n1-1.7B | Feihua-0.8B | Feihua-64M |
|---|---|---|---|---|---|
| MCP-Atlas (n=100) | 23,4 | 3,5 | 0,0 | 8,5 | 0,0 |
| IFBench (n=40) | 66,3 | 12,5 | 10,0 | 5,0 | 5,0 |

Desglose publicado del MCP-Atlas para este modelo:

| Metrica | Valor medido |
|---|---|
| Tasa de activacion de tool call | 19/100 |
| Nombres de herramienta legales | 19/19 |
| Argumentos vacios | 19/19 |
| Coincidencia exacta del nombre de herramienta | 5/100 |
| Puntuacion maxima sin argumentos | 2/5 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de conocimiento general en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos por cuantizacion: 3,2 GB en f16, 1,7 GB en Q8_0, 1,1 GB en Q4_K_M y 978 MB en IQ4_XS.
- VRAM estimada para inferencia: aproximadamente igual al tamano del fichero mas el cache KV y el overhead del runtime. Con Q4_K_M o IQ4_XS es viable en GPUs con 4 GB o mas; la version f16 requiere en torno a 4 GB. Son estimaciones derivadas de los tamanos publicados, no cifras oficiales.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o inferiores con al menos 4 GB de VRAM, y tambien en CPU.
- GPU de referencia para el entrenamiento: una unica Tesla P100, con un tiempo de 50 minutos para el LoRA completo.
- Opciones de despliegue: llama.cpp y llama-server con soporte de la arquitectura spark2_5; el autor verifico la API compatible con OpenAI. Para los adaptadores LoRA se necesita transformers con `trust_remote_code` y PEFT, cargando el modelo base XHToken/Spark-X2.5-1.7B. No se documenta compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion mas significativa es con la propia familia de modelos, ya que comparten base y protocolo de evaluacion.

| Modelo | Parametros | Contexto | MCP-Atlas | IFBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Feihua-n2-1.7B | 1,7B | No disponible | 3,5 | 12,5 | Apache 2.0 | GGUF y safetensors en HuggingFace |
| XHToken/Spark-X2.5-1.7B (base) | 1,7B | No disponible | 23,4 | 66,3 | No disponible | Modelo base en HuggingFace |
| Feihua-n1-1.7B | 1,7B | No disponible | 0,0 | 10,0 | No disponible | HuggingFace |
| Feihua-n1-0.8B | 0,8B | No disponible | 8,5 | 5,0 | No disponible | HuggingFace |
| Feihua-n1-64M | 64M | No disponible | 0,0 | 5,0 | No disponible | HuggingFace |

Frente a asistentes funcionales de tamano similar (por ejemplo, la familia Qwen2.5/Qwen3 de 1,5B a 1,7B), no hay datos de benchmarks comparables publicados en la informacion disponible, y la propuesta de valor es opuesta: aquellos priorizan respuestas utiles, mientras que este modelo las elimina de forma deliberada.

## Limitaciones y advertencias

- La respuesta final del modelo es, por diseno, no informativa: no debe usarse como asistente en produccion para tareas que requieran contenido factual.
- La generacion de argumentos esta practicamente destruida: en la evaluacion publicada, 19 de 19 invocaciones devolvieron `arguments` vacios, lo que provoca fallos silenciosos en herramientas que dependen de parametros.
- La tasa de activacion de tool calls es baja (19/100 en MCP-Atlas), por lo que el modelo omite llamadas en la mayoria de los casos.
- El riesgo de alucinacion no aplica en el sentido habitual, porque el modelo evita afirmar datos; el riesgo real es la ausencia total de informacion verificable.
- Cobertura idiomatica limitada a ingles y chino. No hay evidencia de rendimiento en castellano ni en otras lenguas.
- La longitud de contexto no esta documentada, lo que impide garantizar conversaciones multi-turno largas o entradas extensas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un derivado del base XHToken/Spark-X2.5-1.7B, cuya licencia no se especifica en la informacion disponible; conviene verificar la del modelo base antes de un uso comercial.
- El soporte de inferencia esta limitado a runtimes que implementen la arquitectura spark2_5 (llama.cpp); no se documenta compatibilidad con vLLM, TGI u Ollama.
- El repositorio incluye el tag `custom_code`, lo que implica ejecutar codigo remoto con `trust_remote_code=True` al cargar los adaptadores; debe evaluarse el riesgo de seguridad correspondiente.
- La model card esta truncada en la informacion proporcionada, de modo que parte de las tablas de resultados y de las conclusiones del autor no estan disponibles.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 15 de septiembre de 2026, por lo que no existe validacion independiente de sus resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZZRI/Feihua-n2-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Feihua-n1-1.7B: https://huggingface.co/ZZRI/Feihua-n1-1.7B
- Feihua-n1-0.8B: https://huggingface.co/ZZRI/Feihua-n1-0.8B
- Feihua-n1-64M: https://huggingface.co/ZZRI/Feihua-n1-64M
- Proyecto minimind (origen del dataset sft_t2t_mini): https://github.com/jingyaogong/minimind
- Registros de investigacion citados en la model card (`research/feihuaN2_dim01_training.md`, `research/feihuaN2_dim03_bench.md`): sin URL publica disponible.
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la busqueda web realizada.
