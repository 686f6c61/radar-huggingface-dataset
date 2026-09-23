# Stereotypes-in-LLMs/lapa-12b-hiring-debias-sft-uk

## Resumen

lapa-12b-hiring-debias-sft-uk es un adaptador LoRA (PEFT) montado sobre el modelo lapa-llm/lapa-v0.1.2-instruct, desarrollado por el grupo Stereotypes-in-LLMs. Su proposito es que la decision de contratacion sobre un par candidato-puesto no cambie al alterar un atributo protegido, en concreto estatus militar, genero o religion. Para ello se entrena con objetivos contrafactualmente invariantes y se audita sobre un banco retenido de 31.050 decisiones.

El adaptador reduce la proporcion de conjuntos inestables del 37,7% del modelo base al 4,2%, y eleva la utilidad (acuerdo con una referencia sin atributos) del 55,1% al 77,3%. La mejora se mantiene tras igualar la tasa de contratacion: a un 16,4% de contrataciones, el adaptador es 6,5 veces mas consistente que el modelo base reajustado a ese mismo umbral.

Es, por tanto, un artefacto de investigacion sobre mitigacion de sesgos en contratacion asistida por LLM, con resultados por grupo y una auditoria reproducible sin GPU. No es un sistema de contratacion validado para produccion. Se distribuye bajo licencia Gemma y esta entrenado y evaluado unicamente en ucraniano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer; arquitectura del modelo base no disponible |
| Parametros totales | No disponible para el adaptador (repo de 0,6 GB); el modelo base se denomina lapa-12b, lo que sugiere ~12 000 millones, no confirmado en la informacion proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones; el script de fusion del autor usa bfloat16 |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | lapa-llm/lapa-v0.1.2-instruct |
| Tipo de artefacto | Adaptador LoRA (library_name: peft) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA compatible con PEFT, pensado para fusionarse con lapa-llm/lapa-v0.1.2-instruct. El entrenamiento es un ajuste supervisado (SFT) sobre objetivos contrafactualmente invariantes: para cada conjunto candidato-puesto se generan todas las variantes de atributo y se aprende a producir la misma decision en todas ellas, evitando que el atributo determine el veredicto. La decision de referencia utilizada como objetivo es la de GPT-4o, que por construccion es independiente del atributo, aunque el propio autor advierte que no es imparcial. Los datos de entrenamiento son sinteticos y se publican de forma independiente.

No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni la configuracion de RLHF/DPO (se trata de SFT). Se emplearon una unica configuracion LoRA y una unica semilla. El autor recomienda no servir el adaptador por la ruta LoRA de vLLM, porque en estas arquitecturas no reproduce el modelo entrenado: sobre las mismas peticiones, HuggingFace + PEFT y vLLM coinciden en el 95-99% de las decisiones del modelo base, pero solo en el 38-83% de las del adaptador. La practica correcta es fusionar el adaptador en los pesos (`merge_and_unload`) y servir el checkpoint resultante. Las auditorias del estudio se ejecutaron sobre los pesos fusionados.

## Capacidades

- Decision de contratacion invariante a atributos: emite un veredicto sobre un par candidato-puesto que, segun la auditoria, deja de depender de estatus militar, genero o religion en la gran mayoria de conjuntos.
- Generacion de razonamientos: produce justificaciones de la decision con una tasa muy baja de menciones al atributo protegido (0,1% frente al 0,7% del base).
- Mitigacion de sesgos medible: reduce los conjuntos inestables del 37,7% al 4,2% y mejora la utilidad del 55,1% al 77,3%.
- Idiomas: ucraniano (uk), unico idioma declarado y unico idioma de entrenamiento y evaluacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; no se declaran.

## Casos de uso

- Investigacion en mitigacion de sesgos: el adaptador sirve como referencia reproducible para estudiar si el ajuste fino elimina la dependencia de atributos protegidos o simplemente desplaza el umbral de decision. Los resultados a tasa de contratacion igualada permiten separar ambos efectos.
- Auditoria de sistemas de cribado: dado su banco contrafactual publicado (31.050 decisiones) y sus respuestas auditadas, permite reproducir la auditoria sin GPU y contrastar hallazgos.
- Analisis por grupo protegido: los resultados desglosados por genero, estatus militar y religion permiten estudiar el comportamiento diferencial en cada colectivo, con correccion de Benjamini-Hochberg.
- Estudio metodologico de contrafactuales: el pipeline (generacion de variantes, medicion de inestabilidad, utilidad frente a referencia sin atributos) es reutilizable en otras tareas de decision de alto impacto.
- Punto de partida para otros dominios de contratacion: la tecnica puede transferirse a otros corpus o atributos, siempre que se disponga de datos contrafactuales equivalentes.
- Evaluacion de despliegue seguro de adaptadores: el hallazgo de que la ruta LoRA de vLLM no reproduce el modelo entrenado es un caso de estudio para validar la fidelidad de la fusion de adaptadores antes de servir un modelo.

## Benchmarks y rendimiento

| Metrica | Modelo base | Este adaptador |
|---|---:|---:|
| Conjuntos inestables | 37,7% | 4,2% |
| Cambio | — | -33,6 pp [-39,8, -27,3] |
| Conjuntos corregidos : roto | — | 334 : 35 |
| Utilidad (acuerdo con referencia sin atributos) | 55,1% | 77,3% |
| Razonamientos que nombran el atributo | 0,7% | 0,1% |
| Tasa de contratacion | 75,5% | 16,4% |

Resultados por grupo protegido (todos significativos tras correccion de Benjamini-Hochberg):

| Grupo | Base inestable % | Adaptador inestable % | Δ pp | p (FDR) |
|---|---:|---:|---:|---:|
| genero | 21,8 | 3,0 | -18,8 | 1e-31 |
| estatus militar | 21,5 | 2,1 | -19,4 | 6e-37 |
| religion | 22,4 | 2,2 | -20,1 | 2e-37 |

Control a tasa de contratacion igualada sobre los 31.050 prompts auditados:

| A una tasa de contratacion del 16,4% | Conjuntos inestables % |
|---|---:|
| Modelo base, desplazado a esa tasa | 16,3 |
| Este adaptador | 2,5 |

El 29% de la mejora bruta es atribuible al desplazamiento del umbral; el 71% restante se debe a una mayor consistencia real. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

Nota: las cifras siguientes son estimaciones para un modelo base de ~12 000 millones de parametros; no proceden de la model card y deben confirmarse con el modelo base real.

- VRAM estimada para inferencia (solo pesos): ~24 GB en bfloat16/float16, ~12 GB en int8, ~6-7 GB en 4 bits.
- VRAM total estimada con cache KV y overhead: ~28-32 GB en bfloat16, ~14-16 GB en int8, ~10-12 GB en 4 bits (depende de la longitud de contexto, que no se especifica).
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S.
- GPU recomendadas para int8 o 4 bits: RTX 4090 (24 GB), RTX 3090 (24 GB).
- Cabe en GPU de consumo: probablemente si, en 8 bits o 4 bits en tarjetas de 24 GB; en precision completa requiere GPU profesional.
- Opciones de despliegue: transformers + PEFT fusionando el adaptador (recomendado por el autor), vLLM o TGI sobre los pesos fusionados. No usar la ruta LoRA de vLLM para este adaptador. Compatibilidad con llama.cpp/Ollama no disponible (requiere convertir a GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de otros adaptadores publicos comparables de mitigacion de sesgos en contratacion en la informacion proporcionada. La comparacion relevante es contra el propio modelo base, medido en el mismo banco contrafactual:

| Criterio | lapa-v0.1.2-instruct (base) | Este adaptador |
|---|---|---|
| Conjuntos inestables | 37,7% | 4,2% |
| Inestabilidad a tasa de contratacion igualada | 16,3% | 2,5% |
| Utilidad frente a referencia sin atributos | 55,1% | 77,3% |
| Tasa de contratacion | 75,5% | 16,4% |
| Licencia | gemma | gemma |
| Formato | pesos del modelo base | adaptador LoRA (safetensors) |

## Limitaciones y advertencias

- No es un sistema de contratacion ni esta validado para despliegue; su uso previsto es la investigacion sobre mitigacion de sesgos.
- La decision de referencia hacia la que se entrena es la de GPT-4o, que es independiente del atributo por construccion pero no es imparcial.
- La inestabilidad cae a unos pocos puntos porcentuales, no a cero: persiste una dependencia residual del atributo, y ~0,5% de los conjuntos cambian solo por no determinismo del decodificado.
- Entrenado y medido sobre un unico corpus (CV y ofertas anonimizados de Djinni) en ucraniano, con tres atributos protegidos, una configuracion LoRA y una semilla. Las intersecciones se evaluaron pero nunca se entrenaron.
- El ajuste fino desplaza la tasa global de contratacion (75,5% a 16,4%); hay que comprobar ese desplazamiento contra el punto de operacion propio antes de usarlo.
- Solo soporta ucraniano; no se declaran otros idiomas.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma, que imponen condiciones especificas de redistribucion y uso.
- No servir mediante la ruta LoRA de vLLM: no reproduce el modelo entrenado (coincidencia del 38-83% frente al 95-99% del base). Fusionar el adaptador antes de desplegar.
- No se dispone de datos sobre longitud de contexto, cuantizaciones validadas ni rendimiento en tareas generales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stereotypes-in-LLMs/lapa-12b-hiring-debias-sft-uk
- Modelo base: https://huggingface.co/lapa-llm/lapa-v0.1.2-instruct
- Repositorio del estudio y codigo: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation
- Dataset de entrenamiento (datos sinteticos): https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-synthetic-data
- Respuestas auditadas del adaptador: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-responses
- Coleccion completa Hiring Bias Mitigation: https://huggingface.co/collections/Stereotypes-in-LLMs/hiring-bias-mitigation-6aae99f67667367c7149cedd
- Articulo: en preparacion; hasta su publicacion, citar el repositorio y el Djinni Recruitment Dataset (Drushchak & Romanyshyn, 2024), sin enlace disponible en la informacion proporcionada.
