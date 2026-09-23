# Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-sft-en

## Resumen

qwen3.5-9b-hiring-debias-sft-en es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-9B, publicado por el grupo de investigacion Stereotypes-in-LLMs. Su objetivo es reducir la dependencia de atributos protegidos (genero, situacion militar y religion) en decisiones automatizadas de contratacion: el adaptador se entrena con objetivos contrafactualmente invariantes para que la variacion de un atributo protegido no altere el veredicto de contratacion de un par candidato-puesto.

El problema que aborda es la inestabilidad contrafactual, es decir, los casos en los que cambiar unicamente un atributo protegido hace que el modelo cambie su decision. Segun la model card, el modelo base presenta un 17,3% de conjuntos inestables sobre 900 conjuntos contrafactuales emparejados, mientras que el adaptador lo reduce al 7,2% (una mejora de -10,1 puntos porcentuales, IC [-14,4, -5,8]), con 136 conjuntos corregidos frente a 45 degradados. La utilidad medida como acuerdo con la referencia sin atributos sube del 78,9% al 82,5%.

Es relevante ahora porque la mitigacion de sesgos en sistemas de seleccion es un area con escrutinio regulatorio creciente, y este adaptador publica no solo los pesos, sino tambien el benchmark de auditoria completo (31.050 decisiones auditadas) y las respuestas reproducibles sin GPU. No es un sistema de contratacion ni esta validado para despliegue: se presenta explicitamente como herramienta de investigacion. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (modelo base Qwen/Qwen3.5-9B); detalles arquitectonicos del base no disponibles |
| Parametros totales | Modelo base: ~9.000 millones (deducido del identificador Qwen3.5-9B); adaptador LoRA: no disponible (repo de 0,3 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos del adaptador se sirven en bfloat16 y se recomienda fusionarlos antes del despliegue |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT sobre el modelo base Qwen/Qwen3.5-9B. La innovacion tecnica central no esta en la arquitectura del transformer, sino en el objetivo de entrenamiento: se construyen conjuntos contrafactuales, cada uno formado por un par candidato-puesto evaluado con todas las variantes de atributos protegidos, y se entrena al modelo para que la decision sea la misma en todas ellas. El adaptador se ha auditado con pesos fusionados, no como adaptador servido en caliente.

El corpus de entrenamiento y evaluacion es un unico conjunto: CVs y ofertas anonimizadas del Djinni Recruitment Dataset (Drushchak y Romanyshyn, 2024), en ingles, con tres atributos protegidos. La referencia de decision hacia la que se entrena es la salida de GPT-4o, que es libre de atributos por construccion pero no esta exenta de sesgo. La model card indica que se uso una unica configuracion LoRA y una unica semilla, y que las intersecciones de atributos se evaluaron pero nunca se entrenaron. El paper esta en preparacion.

## Capacidades

- Clasificacion de pares candidato-puesto: emite una decision de contratacion o rechazo junto con una justificacion textual (rationale).
- Invariancia contrafactual parcial: reduce, sin eliminar, el cambio de veredicto ante variaciones de genero, situacion militar y religion.
- Generacion de justificaciones: las justificaciones que mencionan explicitamente el atributo protegido caen del 1,1% al 0,2%.
- Capacidades heredadas del modelo base Qwen/Qwen3.5-9B (generacion de texto, razonamiento e instrucciones generales), no caracterizadas en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles en el entrenamiento y la evaluacion.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion academica sobre mitigacion de sesgos: el adaptador sirve como punto de comparacion reproducible frente al modelo base, con benchmark de 31.050 decisiones publicado y respuestas auditadas verificables sin GPU.
- Auditoria de inestabilidad contrafactual: permite medir, sobre un pipeline propio de decision de contratacion, cuantos conjuntos candidato-puesto cambian de veredicto al variar un atributo protegido, usando la misma metodologia que el estudio.
- Analisis de la relacion entre tasa de contratacion y equidad: el barrido de umbral documentado (a una tasa de contratacion del 27,3%, el adaptador presenta un 3,5% de conjuntos inestables frente al 13,0% del base reajustado) es util para equipos que necesitan calibrar el punto de operativo antes de medir invariancia.
- Reproduccion de resultados y control de calidad metodologico: al publicarse cada respuesta del adaptador y los scripts de fusion, otros grupos pueden replicar el experimento y verificar las cifras de forma independiente.
- Estudio de transferencia de sesgo: el adaptador permite analizar hasta que punto un objetivo de invariancia aprendido sobre un corpus (Djinni, ingles) generaliza o falla en otros dominios y idiomas.
- Docencia y formacion en IA responsable: sirve como caso practico de entrenamiento contrafactual, con datos sinteticos publicados y una evaluacion estadistica con correccion de Benjamini-Hochberg por comparaciones multiples.
- Base para experimentos de mitigacion mas amplios: dado que es un adaptador LoRA de 0,3 GB, permite probar estrategias de fusion, mezcla de adaptadores o reentrenamiento con nuevas semillas sobre un mismo modelo base sin reentrenar los 9.000 millones de parametros.

## Benchmarks y rendimiento

La model card no incluye benchmarks convencionales (MMLU, HumanEval, GSM8K). Los datos disponibles son de auditoria contrafactual sobre 900 conjuntos emparejados y 31.050 decisiones:

| Metrica | Modelo base | Adaptador | Cambio |
|---|---:|---:|---:|
| Conjuntos inestables | 17,3% | 7,2% | -10,1 pp (IC [-14,4, -5,8]) |
| Conjuntos corregidos : degradados | - | 136 : 45 | - |
| Utilidad (acuerdo con referencia sin atributos) | 78,9% | 82,5% | +3,6 pp |
| Justificaciones que nombran el atributo | 1,1% | 0,2% | -0,9 pp |
| Tasa de contratacion | 14,5% | 27,3% | +12,8 pp |

Desglose por grupo protegido (todos significativos tras correccion de Benjamini-Hochberg):

| Grupo | Inestabilidad base | Inestabilidad adaptador | Delta pp | p (FDR) |
|---|---:|---:|---:|---:|
| Genero | 7,7% | 4,1% | -3,6 | 1e-03 |
| Situacion militar | 10,9% | 3,8% | -7,1 | 1e-08 |
| Religion | 8,1% | 2,8% | -5,3 | 1e-06 |

Control de la tasa de contratacion (barrido de umbral sobre las 31.050 peticiones auditadas):

| A una tasa de contratacion del 27,3% | Conjuntos inestables |
|---|---:|
| Modelo base, reajustado a esa tasa | 13,0% |
| Este adaptador | 3,5% |

Segun la model card, a igual tasa de contratacion el adaptador es 3,7 veces mas consistente y el -106% de la ganancia bruta es atribuible al desplazamiento del umbral. No se han publicado resultados de benchmarks convencionales en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; el coste real de inferencia lo determina el modelo base Qwen/Qwen3.5-9B fusionado.
- VRAM estimada para el modelo fusionado en bfloat16: aproximadamente 18-20 GB solo para pesos, mas cache KV y overhead (estimacion orientativa, no confirmada en la informacion disponible).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 10-11 GB; en 4 bits: aproximadamente 6-7 GB (estimaciones orientativas).
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB (por ejemplo RTX 4090, RTX 4080, RTX 3090) si se recurre a cuantizacion de 8 o 4 bits. En bfloat16 completo requiere GPU profesional.
- GPU recomendadas para bfloat16 sin cuantizar: A100 40/80 GB, H100, L40S o equivalentes.
- Despliegue: la model card advierte explicitamente de no servir el adaptador por la ruta LoRA de vLLM, porque en estas arquitecturas no reproduce el modelo entrenado (coincidencia del 38-83% en las decisiones del adaptador frente al 95-99% en las del modelo base). El procedimiento recomendado es fusionar el adaptador con `merge_and_unload()` y servir el checkpoint resultante como un modelo normal, por ejemplo con `vllm serve`. Tambien son viables TGI o llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Dato relevante de reproducibilidad: la model card afirma que las auditorias pueden reproducirse sin GPU, ya que las decisiones auditadas estan publicadas como dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Inestabilidad contrafactual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-hiring-debias-sft-en | LoRA sobre ~9B | no disponible | 7,2% (3,5% a tasa de contratacion igualada) | apache-2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | 17,3% (13,0% a tasa igualada) | no disponible en esta informacion | HuggingFace |
| Otros adaptadores de mitigacion de sesgo en contratacion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion en la busqueda proporcionada sobre modelos alternativos directamente comparables en la misma tarea y tamano. La comparativa mas solida disponible es la del propio modelo base, que es el punto de referencia natural del adaptador.

## Limitaciones y advertencias

- No es un sistema de contratacion: la model card indica explicitamente que no esta validado para despliegue y que su uso previsto es la investigacion sobre mitigacion de sesgos.
- La referencia de entrenamiento es GPT-4o, que es libre de atributos por construccion pero no esta exento de sesgo; el adaptador hereda ese sesgo de referencia.
- La inestabilidad baja a unos pocos puntos porcentuales, no a cero: persiste una dependencia residual del atributo protegido.
- Aproximadamente el 0,5% de los conjuntos cambian de decision por no determinismo de decodificacion, sin relacion con el atributo.
- Entrenado y medido sobre un unico corpus (CVs y ofertas anonimizadas de Djinni) en ingles y con tres atributos protegidos; la generalizacion a otros dominios, idiomas o atributos no esta validada.
- Una unica configuracion LoRA y una unica semilla: no hay estimacion de varianza entre ejecuciones de entrenamiento.
- Las intersecciones de atributos se evaluaron pero nunca se entrenaron, por lo que el comportamiento en casos interseccionales no esta garantizado.
- El ajuste fino desplaza la tasa de contratacion global (14,5% a 27,3%); este cambio debe contrastarse con el punto de operacion propio antes de usar el modelo.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero ello no elimina las advertencias de validacion ni los posibles requisitos regulatorios aplicables a decisiones de seleccion.
- Riesgo de alucinacion: no caracterizado en la model card; el modelo hereda el comportamiento del base Qwen/Qwen3.5-9B en tareas generativas fuera del dominio de contratacion.
- La eleccion de hardware, cuantizacion y ruta de servicio puede alterar las decisiones; la propia model card documenta discrepancias severas entre HuggingFace+PEFT y la ruta LoRA de vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-sft-en
- Repositorio del estudio (codigo y resultados completos): https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation
- Dataset de entrenamiento sintetico: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-synthetic-data
- Dataset de respuestas auditadas del adaptador: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-responses
- Coleccion completa Hiring Bias Mitigation: https://huggingface.co/collections/Stereotypes-in-LLMs/hiring-bias-mitigation-6aae99f67667367c7149cedd
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia del corpus: Djinni Recruitment Dataset (Drushchak y Romanyshyn, 2024), enlazado desde la model card; paper del adaptador en preparacion.
