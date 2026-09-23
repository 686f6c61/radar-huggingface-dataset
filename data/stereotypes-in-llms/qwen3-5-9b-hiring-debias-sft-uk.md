# Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-sft-uk

## Resumen

`qwen3.5-9b-hiring-debias-sft-uk` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3.5-9B` por el grupo Stereotypes-in-LLMs. Su objetivo es que el modelo decida casos de contratación sin que un atributo protegido (estatus militar, género o religión) altere el veredicto. El adaptador se entrena con objetivos contrafactualmente invariantes y se audita sobre un benchmark retenido de 31.050 decisiones. El repositorio pesa 0,3 GB, lo que confirma que se distribuyen únicamente los pesos del adaptador, no los del modelo base.

El problema que aborda es la inestabilidad contrafactual: en un conjunto contrafactual (un par candidato–puesto evaluado con todas las variantes de atributo), la decisión es inestable cuando cambia entre variantes por efecto del atributo. Con el modelo base, el 43,0 % de los conjuntos evaluados eran inestables; con el adaptador, el 4,8 %, una reducción de 38,2 puntos porcentuales. El precio es una pérdida de utilidad: el acuerdo con la decisión de referencia sin atributo cae 5,3 puntos (del 80,5 % al 75,2 %) y la tasa de contratación baja del 29,4 % al 11,6 %.

La relevancia es metodológica y de investigación: es el único caso del estudio que asume ese intercambio entre utilidad y consistencia, publica cada decisión auditada de forma reproducible sin GPU y advierte explícitamente de que no es un sistema de contratación ni está validado para despliegue. Está entrenado y medido en un único corpus (CV y ofertas anonimizados de Djinni) en ucraniano (`uk`), sobre tres atributos protegidos, con una sola configuración LoRA y una sola semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal `Qwen/Qwen3.5-9B`. La arquitectura interna del adaptador (rango, módulos objetivo) no está detallada en la información disponible |
| Parametros totales | Modelo base de ~9B parámetros según su denominación; el número exacto de parámetros entrenables del adaptador no está disponible. El repositorio ocupa 0,3 GB |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se distribuyen en safetensors (precisión declarada no disponible). No se publican versiones GGUF/AWQ/GPTQ del modelo fusionado |
| Idiomas soportados | `uk` (ucraniano), según la model card y la etiqueta de idioma del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, cargable con PEFT sobre `Qwen/Qwen3.5-9B`; el autor recomienda fusionar el adaptador (`merge_and_unload`) antes de servir |

## Arquitectura y entrenamiento

Se trata de un ajuste fino supervisado (SFT) mediante LoRA sobre `Qwen/Qwen3.5-9B`, con el modelo base congelado. El adaptador se entrena con objetivos contrafactualmente invariantes: pares candidato–puesto presentados con distintas variantes de atributo protegido, de forma que la etiqueta objetivo sea la misma independientemente del atributo. Los datos de entrenamiento son sintéticos y se publican como `hiring-bias-mitigation-synthetic-data`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de LoRA ni si hubo fases de RLHF o DPO.

La innovación destacable es el enfoque de evaluación, más que el de entrenamiento. El autor comprueba si la ganancia es invariancia real o simplemente un umbral de decisión más estricto: al desplazar el umbral del modelo base hasta igualar la tasa de contratación del adaptador (11,6 %), el modelo base reduce su inestabilidad del 43,0 % al 10,8 %, mientras que el adaptador se queda en el 2,6 %. Es decir, a igual tasa de contratación el adaptador es 4,2 veces más consistente, y el 54 % de la ganancia bruta se atribuye al desplazamiento del umbral; la curva del adaptador queda por debajo de la del base en todos los puntos de operación. La decisión de referencia sin atributo contra la que se entrena y mide es la de GPT-4o, que es atributo-libre por construcción pero no exenta de sesgo.

## Capacidades

- Decisión de contratación invariante al atributo protegido: emite veredictos (contratar/rechazar) sobre pares candidato–puesto que se mantienen estables ante cambios de género, estatus militar y religión.
- Reducción de inestabilidad contrafactual: del 43,0 % al 4,8 % de conjuntos inestables en 900 conjuntos emparejados con el modelo base.
- Generación de justificaciones (rationales) que evitan nombrar el atributo protegido: del 2,4 % al 0,1 % de justificaciones que lo mencionan.
- Consistencia por grupo protegido, con cambios significativos tras corrección de Benjamini–Hochberg: género −20,4 pp (p = 5e-40), estatus militar −19,8 pp (p = 3e-43), religión −13,7 pp (p = 1e-26).
- Procesamiento de texto en ucraniano sobre CV y ofertas de empleo del corpus Djinni.
- Capacidades generales del modelo base (generación de texto, razonamiento, código, tool calling, multilingüismo): no están documentadas en la información disponible de este adaptador y no deben darse por garantizadas tras el ajuste.
- No se documenta soporte de visión, audio, modo *thinking* explícito ni comportamiento de agente multi-paso específico para este adaptador.

## Casos de uso

- Auditoría de sesgo en sistemas de selección: usar el adaptador como referencia de decisión atributo-invariante frente al modelo base y medir la inestabilidad contrafactual de un pipeline propio sobre el mismo conjunto de pares candidato–puesto.
- Investigación en mitigación de sesgo: reproducir el experimento del estudio (SFT con objetivos contrafactualmente invariantes) y contrastar el intercambio entre utilidad y consistencia con otras técnicas.
- Generación de benchmarks contrafactuales: construir conjuntos de evaluación donde cada caso se replica con todas las variantes de atributo, aprovechando que el autor publica las 31.050 decisiones auditadas y son reproducibles sin GPU.
- Fine-tuning sobre corpus locales: el adaptador sirve de plantilla para replicar el método en corpus de reclutamiento de otros países, partiendo del dataset sintético publicado y del pipeline del repositorio.
- Estudio de explicabilidad y racionalización: analizar por qué el adaptador pasa de mencionar el atributo en el 2,4 % de las justificaciones al 0,1 % y qué información usa en su lugar.
- Análisis de umbrales de decisión: emplear la curva de inestabilidad frente a tasa de contratación para estudiar cómo el punto de operación de un clasificador condiciona las métricas de equidad.
- Evaluación de infraestructura de servicio: comparar la fidelidad de distintas rutas de despliegue (HuggingFace + PEFT frente a vLLM) sobre decisiones sensibles, dado que el autor documenta discrepancias severas en la ruta LoRA de vLLM.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 900 conjuntos contrafactuales emparejados (mismas variantes en ambos modelos):

| Métrica | Modelo base | Adaptador | Cambio |
|---|---:|---:|---:|
| Conjuntos inestables | 43,0 % | 4,8 % | −38,2 pp [−43,7; −32,9] |
| Conjuntos corregidos : rotos | — | 356 : 12 | — |
| Utilidad (acuerdo con la referencia sin atributo) | 80,5 % | 75,2 % | −5,3 pp |
| Justificaciones que nombran el atributo | 2,4 % | 0,1 % | −2,3 pp |
| Tasa de contratación | 29,4 % | 11,6 % | −17,8 pp |

Desglose por grupo protegido (todos significativos tras corrección FDR):

| Grupo | Inestabilidad base | Inestabilidad adaptador | Δ pp | p (FDR) |
|---|---:|---:|---:|---:|
| Género | 24,0 % | 3,6 % | −20,4 | 5e-40 |
| Estatus militar | 21,4 % | 1,7 % | −19,8 | 3e-43 |
| Religión | 16,1 % | 2,4 % | −13,7 | 1e-26 |

Control por umbral de decisión, sobre los 31.050 prompts auditados y a una tasa de contratación igualada del 11,6 %:

| Modelo a tasa 11,6 % | Conjuntos inestables |
|---|---:|
| Modelo base desplazado a esa tasa | 10,8 % |
| Este adaptador | 2,6 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El autor no publica requisitos de hardware. Las cifras siguientes son estimaciones a partir del tamaño del modelo base (~9B parámetros) y deben verificarse.
- Inferencia en bf16/fp16 con pesos fusionados: aproximadamente 18 GB solo para pesos, más caché KV y activaciones; se recomienda GPU con 24 GB o más y margen para el contexto.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o L4 (esta última con cuantización).
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos fusionados en bf16 con contextos moderados; con cuantización de 8 o 4 bits el modelo cabría en tarjetas de 12–16 GB (RTX 4080, RTX 4070 Ti, RTX 3080), a costa de precisión en las decisiones.
- Despliegue: el autor indica explícitamente fusionar el adaptador (`merge_and_unload`) y servir el checkpoint resultante como modelo ordinario, por ejemplo con `vllm serve merged`. También son viables HuggingFace Transformers + PEFT, TGI o llama.cpp/Ollama previa conversión a GGUF, aunque no se publican artefactos GGUF.
- Advertencia de despliegue: no servir el adaptador por la ruta LoRA de vLLM. En estas arquitecturas, HuggingFace + PEFT y vLLM coinciden en el 95–99 % de las decisiones del modelo base, pero solo en el 38–83 % de las del adaptador.
- Latencia y throughput: no disponibles.
- El proceso de auditoría completa puede reproducirse sin GPU a partir de las respuestas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Inestabilidad contrafactual | Utilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3.5-9B) | ~9B (adaptador LoRA de 0,3 GB) | No disponible | 4,8 % (2,6 % a tasa de contratación igualada) | 75,2 % | apache-2.0 | HuggingFace (PEFT) |
| Qwen/Qwen3.5-9B sin adaptar | ~9B | No disponible | 43,0 % (10,8 % a tasa igualada) | 80,5 % | No disponible en la información proporcionada | HuggingFace |
| GPT-4o (decisión de referencia del estudio) | No disponible | No disponible | No disponible | Se usa como referencia atributo-libre, no como comparativa medida | Propietaria | API |

No se dispone de datos sobre otros adaptadores de mitigación de sesgo comparables (tamaño, contexto, rendimiento o licencia) en la información proporcionada.

## Limitaciones y advertencias

- No es un sistema de contratación ni está validado para despliegue; su uso previsto es la investigación sobre mitigación de sesgo en selección asistida por LLM.
- La pérdida de utilidad es explícita: el acuerdo con la decisión de referencia cae 5,3 puntos y la tasa de contratación baja del 29,4 % al 11,6 %. El propio autor recomienda leer la columna de utilidad antes de desplegarlo.
- La decisión de referencia usada como objetivo es la de GPT-4o, que es atributo-libre por construcción pero no está libre de sesgo; el adaptador hereda las limitaciones de ese criterio.
- La inestabilidad cae a unos pocos puntos porcentuales, no a cero: persiste una dependencia residual del atributo y ~0,5 % de los conjuntos cambian solo por no determinismo del decodificado.
- Todo el entrenamiento y la medición se hicieron sobre un único corpus (CV y ofertas anonimizados de Djinni), en ucraniano, con tres atributos protegidos, una configuración LoRA y una semilla. La generalización a otros dominios, idiomas o atributos no está demostrada.
- Las intersecciones de atributos se evaluaron pero nunca se entrenaron.
- El ajuste fino desplaza la tasa de contratación global; conviene comprobar ese desplazamiento contra el punto de operación propio antes de usar el modelo.
- Riesgo de alucinación y sesgos no cuantificados en esta información: no se publican métricas de calidad general, veracidad ni sesgos fuera del eje contrafactual medido.
- La licencia del adaptador es apache-2.0, pero el uso comercial está desaconsejado por el propio autor al no tratarse de un sistema validado; verificar además la licencia del modelo base antes de explotarlo.
- La ruta LoRA de vLLM no reproduce el modelo entrenado en estas arquitecturas; sin fusionar los pesos, las métricas de auditoría no son representativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stereotypes-in-LLMs/qwen3.5-9b-hiring-debias-sft-uk
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio con estudio, código y resultados completos: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation
- Dataset de entrenamiento (datos sintéticos): https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-synthetic-data
- Respuestas auditadas del adaptador (`Qwen3.5-9B--uk--sft--adapter--uk_only`): https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-responses
- Colección completa Hiring Bias Mitigation: https://huggingface.co/collections/Stereotypes-in-LLMs/hiring-bias-mitigation-6aae99f67667367c7149cedd
- Paper: en preparación según el autor. Cita provisional: repositorio anterior y Djinni Recruitment Dataset (Drushchak & Romanyshyn, 2024)
- Script de fusión de pesos mencionado por el autor: `scripts/merge_adapter.py` dentro del repositorio de GitHub
