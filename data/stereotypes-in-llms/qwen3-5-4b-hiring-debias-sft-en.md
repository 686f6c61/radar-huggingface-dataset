# Stereotypes-in-LLMs/qwen3.5-4b-hiring-debias-sft-en

## Resumen

`qwen3.5-4b-hiring-debias-sft-en` es un adaptador LoRA desarrollado por el grupo de investigacion Stereotypes-in-LLMs que modifica el comportamiento de **Qwen/Qwen3.5-4B** en la toma de decisiones de contratacion. El objetivo concreto es que un atributo protegido (estado militar, genero, religion) no altere el veredicto de contratacion: el modelo se entrena sobre objetivos contrafactualmente invariantes para que la misma candidatura, cambiando solo el atributo sensible, reciba la misma decision.

El adaptador se evalua sobre un benchmark contrafactual propio de 31.050 decisiones. Frente al modelo base, reduce la proporcion de conjuntos inestables (aquellos en los que el atributo solo inclina la decision) del 30,1 % al 10,7 %, lo que supone una mejora de 19,4 puntos porcentuales. La utilidad medida como acuerdo con una referencia libre de atributos se mantiene practicamente igual (80,8 % a 81,9 %), y los razonamientos que mencionan el atributo sensible caen del 3,1 % al 0,2 %.

Se trata de un artefacto de investigacion, no de un sistema de contratacion listo para produccion. El repositorio ocupa 0,2 GB, se distribuye bajo licencia Apache 2.0, esta orientado a ingles y la propia model card advierte de que no ha sido validado para despliegue real. Es relevante ahora porque aporta un protocolo medible y reproducible de mitigacion de sesgos en un caso de uso de alto impacto social, con datos y respuestas auditadas publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA/PEFT sobre el modelo base Qwen/Qwen3.5-4B; la arquitectura interna del base no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible para el adaptador; el modelo base es Qwen/Qwen3.5-4B (aproximadamente 4.000 millones por nomenclatura, cifra no confirmada en la informacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la model card recomienda fusionar el adaptador y servir pesos en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador **LoRA** (libreria PEFT) montado sobre **Qwen/Qwen3.5-4B**. No se especifica en la informacion disponible la configuracion exacta del adaptador (rango, modulos objetivo, alphas) ni los hiperparametros de entrenamiento, salvo que se empleo una unica configuracion de LoRA y una unica semilla.

El entrenamiento sigue un enfoque de **invariancia contrafactual**: para cada par candidato-puesto se generan variantes con distintos valores de atributos protegidos y se entrena al modelo hacia objetivos que no dependen de dichos atributos (la referencia objetivo es la decision de GPT-4o, que es libre de atributos por construccion). El conjunto de datos de entrenamiento es sintetico y esta publicado. Se audita sobre un benchmark contrafactual retenido de 31.050 decisiones, y los resultados del estudio se obtuvieron siempre sobre pesos fusionados (`scripts/merge_adapter.py`). El articulo asociado esta en preparacion.

## Capacidades

- Generacion de decisiones de contratacion (contratar / no contratar) sobre pares candidato-puesto descritos en texto.
- Mitigacion de sesgo: reduce la dependencia de la decision respecto a genero, estado militar y religion.
- Generacion de razonamientos (rationales) que, tras el ajuste, casi no mencionan el atributo protegido (0,2 % frente a 3,1 % en el base).
- Procesamiento de texto en ingles (unico idioma declarado).
- Tareas de cribado y evaluacion de candidaturas en el dominio de reclutamiento.
- Uso como banco de pruebas de invariancia contrafactual en investigacion de fairness.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en mitigacion de sesgos en seleccion de personal: sirve como punto de partida reproducible para comparar tecnicas de debiasing (por ejemplo SFT frente a otras estrategias) sobre las mismas 31.050 decisiones y el mismo benchmark contrafactual.
- Auditoria de sistemas de cribado de CV: permite medir la estabilidad de decisiones ante perturbaciones de atributos protegidos, usando la metodologia de "conjuntos inestables" descrita en el estudio.
- Generacion de benchmarks contrafactuales: el pipeline y los datos sinteticos publicados permiten construir y validar nuevos conjuntos de evaluacion de equidad en reclutamiento.
- Formacion y divulgacion sobre sesgos algoritmicos: el modelo y sus resultados (30,1 % frente a 10,7 % de inestabilidad) ilustran de forma cuantitativa como un atributo irrelevante puede alterar una decision automatizada.
- Reproducibilidad de resultados: las respuestas auditadas del adaptador estan publicadas y, segun el autor, se reproducen sin necesidad de GPU, lo que facilita la verificacion independiente.
- Estudio de transferencia a otros dominios de decision: la invariancia contrafactual puede adaptarse a creditos, seguros o admisiones, reutilizando el mismo esquema de entrenamiento con datos propios.
- Ajuste de un modelo base para experimentos controlados: dado que es un adaptador LoRA fusionable, se puede integrar en estudios que comparen un modelo con y sin debiasing manteniendo el resto de la pila constante.

## Benchmarks y rendimiento

Datos publicados por el autor sobre un benchmark contrafactual retenido de 31.050 decisiones. La comparacion es entre el modelo base y este adaptador, sobre 900 conjuntos evaluados con variantes emparejadas.

| Metrica | Modelo base | Este adaptador | Cambio |
|---|---:|---:|---:|
| Conjuntos inestables | 30,1 % | 10,7 % | -19,4 pp [-23,0, -15,9] |
| Conjuntos corregidos : rotos | | 205 : 30 | |
| Utilidad (acuerdo con la referencia libre de atributos) | 80,8 % | 81,9 % | +1,1 pp |
| Razonamientos que nombran el atributo | 3,1 % | 0,2 % | -2,9 pp |

Desglose por grupo protegido (todos significativos tras correccion de Benjamini-Hochberg):

| Grupo | Base inestable % | Adaptador inestable % | Delta pp | p (FDR) |
|---|---:|---:|---:|---:|
| gender | 10,8 | 5,7 | -5,1 | 6e-05 |
| military status | 23,3 | 5,9 | -17,4 | 1e-31 |
| religion | 15,3 | 5,2 | -10,1 | 8e-14 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (repositorio de 0,2 GB), pero para inferencia debe fusionarse con el modelo base de aproximadamente 4.000 millones de parametros.
- VRAM estimada para el modelo fusionado (estimacion a partir del tamano del base, no dato oficial): en bfloat16 en torno a 8-9 GB; en cuantizacion INT8 en torno a 5 GB; en cuantizacion de 4 bits en torno a 3 GB.
- Cabe en GPU de consumo: si, una vez fusionado y en cuantizacion adecuada, en tarjetas con 8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). No hay cifras oficiales de compatibilidad en la informacion disponible.
- Despliegue recomendado por el autor: fusionar el adaptador (`merge_and_unload`) y servir el checkpoint resultante como un modelo normal, por ejemplo con `vllm serve merged`. El propio autor advierte de **no servir el adaptador por la ruta LoRA de vLLM**, porque no reproduce el modelo entrenado.
- Alternativa de investigacion: HuggingFace Transformers + PEFT sobre el modelo base, tal como se uso en las auditorias del estudio.
- Otros motores (llama.cpp, Ollama, TGI): no confirmados en la informacion proporcionada; serian aplicables solo tras fusionar los pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (benchmark contrafactual) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-hiring-debias-sft-en (este) | Adapter sobre base ~4B | no disponible | 10,7 % de conjuntos inestables | apache-2.0 | HuggingFace (PEFT) |
| Qwen/Qwen3.5-4B (base, sin ajustar) | ~4B | no disponible | 30,1 % de conjuntos inestables | no disponible en la informacion | HuggingFace |

No se dispone en la informacion proporcionada de otros adaptadores o modelos comparables de mitigacion de sesgos en contratacion con metricas publicadas, por lo que la comparativa con alternativas de la misma categoria se considera no disponible.

## Limitaciones y advertencias

- **No es un sistema de contratacion ni esta validado para despliegue**, tal como indica explicitamente la model card.
- La referencia objetivo del entrenamiento es la decision de GPT-4o, que es libre de atributos por construccion pero **no es imparcial**; parte del sesgo puede heredarse de esa referencia.
- La inestabilidad baja a unos pocos puntos porcentuales, **no a cero**: persiste una dependencia residual del atributo protegido, y en torno al 0,5 % de los conjuntos cambian por no determinismo de decodificacion.
- Entrenado y medido sobre **un unico corpus** (CV y ofertas de Djinni anonimizados) y en **ingles**, con **una sola configuracion de LoRA y una sola semilla**; la generalizacion a otros corpus o idiomas no esta demostrada.
- Solo se entrenaron tres atributos protegidos (genero, estado militar, religion). Las **intersecciones se evaluaron pero no se entrenaron**.
- El ajuste **modifica la tasa global de contratacion** del modelo; debe comprobarse ese desplazamiento respecto al punto de operacion propio antes de usarlo.
- Riesgo de alucinacion en los razonamientos: no se aportan metricas de fidelidad de los rationales mas alla de la mencion del atributo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la limitacion es de idoneidad, no de licencia; no debe emplearse en decisiones reales de empleo por su falta de validacion.
- El articulo asociado esta **en preparacion**; parte de la metodologia no esta formalmente publicada todavia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stereotypes-in-LLMs/qwen3.5-4b-hiring-debias-sft-en
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del estudio, codigo y resultados completos: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation
- Dataset de entrenamiento sintetico: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-synthetic-data
- Respuestas auditadas del adaptador: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-responses
- Coleccion completa Hiring Bias Mitigation: https://huggingface.co/collections/Stereotypes-in-LLMs/hiring-bias-mitigation-6aae99f67667367c7149cedd
- Referencia del corpus: Djinni Recruitment Dataset (Drushchak & Romanyshyn, 2024)
- Articulo cientifico: en preparacion (sin enlace disponible)
