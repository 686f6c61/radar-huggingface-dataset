# Stereotypes-in-LLMs/qwen3.5-4b-hiring-debias-sft-uk

## Resumen

qwen3.5-4b-hiring-debias-sft-uk es un adaptador LoRA (PEFT) construido sobre Qwen/Qwen3.5-4B por el grupo de investigacion Stereotypes-in-LLMs. Su objetivo es mitigar el sesgo en decisiones automatizadas de contratacion: consigue que el modelo emita el mismo veredicto para un par candidato-puesto con independencia de atributos protegidos como el estatus militar, el genero o la religion. Se entrena sobre objetivos contrafactualmente invariantes derivados de decisiones de referencia de GPT-4o y se audita sobre un banco de pruebas contrafactual de 31.050 decisiones en ucraniano, a partir de CVs y ofertas anonimizadas de Djinni.

La relevancia del adaptador es metodologica: no pretende ser un sistema de contratacion, sino una pieza reproducible para estudiar mitigacion de sesgo y equidad contrafactual en modelos de lenguaje. En 900 conjuntos contrafactuales emparejados reduce la proporcion de conjuntos inestables del 36,8 % al 10,6 % (-26,2 puntos porcentuales), con 260 conjuntos corregidos frente a 24 estropeados, y elimina las justificaciones que nombran explicitamente el atributo protegido (del 2,4 % al 0,0 %).

El adaptador ocupa unos 0,2 GB en el repositorio, se distribuye bajo licencia Apache 2.0 y solo cubre el idioma ucraniano. Un punto critico de serving: no debe servirse a traves de la ruta LoRA de vLLM, sino fusionado en los pesos del modelo base, porque esa ruta no reproduce fielmente el modelo entrenado en estas arquitecturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer Qwen/Qwen3.5-4B; no se detalla la arquitectura interna del modelo base en la informacion disponible |
| Parametros totales | Modelo base nominal de 4B (segun el identificador Qwen/Qwen3.5-4B); el adaptador ocupa 0,2 GB en el repositorio |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el merge documentado se realiza en bfloat16 |
| Idiomas soportados | ucraniano (uk) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT); el modelo fusionado se guarda como checkpoint estandar |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA acoplado al modelo Qwen/Qwen3.5-4B. El entrenamiento es de tipo SFT (supervised fine-tuning) sobre objetivos contrafactualmente invariantes: para cada par candidato-puesto se dispone de todas las variantes de atributo y se fuerza que el veredicto no dependa de ellas. La decision de referencia hacia la que se entrena es la de GPT-4o, que por construccion no usa el atributo protegido, aunque el autor advierte que no equivale a ser imparcial.

Los datos proceden de un unico corpus: CVs y ofertas de Djinni anonimizados, en ucraniano, con tres atributos protegidos (genero, estatus militar y religion), una unica configuracion de LoRA y una unica semilla. Las intersecciones entre atributos se evaluaron pero nunca se entrenaron. Todo el proceso de auditoria del estudio se ejecuto sobre pesos ya fusionados mediante el script `merge_adapter.py`, no sobre el adaptador en crudo.

## Capacidades

- Emision de veredictos de contratacion contrafactualmente estables: el mismo par candidato-puesto recibe la misma decision independientemente de la variante de atributo protegido.
- Generacion de justificaciones (rationales) sin nombrar el atributo protegido; en la auditoria el porcentaje de justificaciones que lo mencionan baja del 2,4 % al 0,0 %.
- Razonamiento en ucraniano sobre textos de reclutamiento (CVs y ofertas) del corpus Djinni.
- Reproducibilidad completa de la auditoria: las respuestas del adaptador estan publicadas y pueden reproducirse sin GPU.
- Capacidades heredadas del modelo base Qwen/Qwen3.5-4B: no disponible en detalle en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: unicamente ucraniano segun la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Investigacion en mitigacion de sesgo en contratacion asistida por LLM: el adaptador y su conjunto de respuestas publicadas permiten reproducir la comparacion base vs adaptador sin GPU, sirviendo como referencia metodologica para otros estudios de equidad.
- Auditoria de equidad contrafactual: se puede reconstruir el banco de 900 conjuntos emparejados y verificar el cambio de -26,2 puntos porcentuales en conjuntos inestables frente al modelo base.
- Red-teaming de modelos de contratacion: el adaptador ofrece un punto de comparacion tratado, util para medir cuanto sesgo residual queda (la inestabilidad baja a un pocos por ciento, no a cero).
- Generacion de datos sinteticos invariantes: el dataset de entrenamiento publicado (hiring-bias-mitigation-synthetic-data) puede reutilizarse para entrenar o evaluar otros adaptadores con los mismos objetivos contrafactuales.
- Estudio de sensibilidad por atributo protegido: permite analizar por separado la reduccion de inestabilidad en genero (-14,9 pp), estatus militar (-20,3 pp) y religion (-9,4 pp), todas significativas tras correccion de Benjamini-Hochberg.
- Analisis del desplazamiento de la tasa global de contratacion: dado que el fine-tuning altera la tasa de contratacion del modelo, es util para estudiar como se mueve el punto de operacion y calibrarlo frente a un umbral propio.
- Docencia y divulgacion sobre equidad contrafactual: el codigo del repositorio y las respuestas auditadas permiten ilustrar el concepto de conjunto inestable con datos reales y reproducibles.
- Evaluacion de pipelines de serving: sirve para comprobar la discrepancia entre servir un adaptador por la ruta LoRA de vLLM (38-83 % de acuerdo) y servirlo fusionado (95-99 % de acuerdo sobre el modelo base).

## Benchmarks y rendimiento

Resultados de la auditoria del propio autor sobre 900 conjuntos contrafactuales emparejados:

| Metrica | Modelo base | Este adaptador | Cambio |
|---|---:|---:|---:|
| Conjuntos inestables | 36,8 % | 10,6 % | -26,2 pp [-30,9; -21,6] |
| Conjuntos corregidos : estropeados | | | 260 : 24 |
| Utilidad (acuerdo con la referencia sin atributo) | 74,9 % | 77,8 % | +2,9 pp |
| Justificaciones que nombran el atributo | 2,4 % | 0,0 % | -2,4 pp |

Desglose por grupo protegido (todas las diferencias significativas tras correccion de Benjamini-Hochberg):

| Grupo | Base inestable % | Adaptador inestable % | Delta pp | p (FDR) |
|---|---:|---:|---:|---:|
| genero | 21,6 | 6,7 | -14,9 | 5e-25 |
| estatus militar | 26,8 | 6,4 | -20,3 | 2e-37 |
| religion | 14,9 | 5,4 | -9,4 | 1e-13 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en bfloat16 ronda los 8-9 GB de pesos, mas overhead de activaciones y cache KV; el adaptador fusionado no anade memoria relevante respecto al base.
- GPU recomendadas: una GPU con al menos 12-16 GB de VRAM para el modelo fusionado en bfloat16; modelos de la clase RTX 4090 (24 GB) son suficientes.
- Cabe en GPU de consumidor: si, en tarjetas de gama alta con 16 GB o mas; en cuantizaciones GGUF de menor precision cabria en GPUs mas modestas, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: fusionar el adaptador con `merge_and_unload()` y servir el checkpoint resultante con vLLM (`vllm serve merged`), transformers o TGI. No usar la ruta LoRA de vLLM: segun el autor no reproduce el modelo entrenado (acuerdo del 38-83 % en el adaptador frente al 95-99 % del base).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | 36,8 % de conjuntos inestables; utilidad 74,9 % | apache-2.0 | publico |
| qwen3.5-4b-hiring-debias-sft-uk (este adaptador) | base 4B + LoRA 0,2 GB | no disponible | 10,6 % de conjuntos inestables; utilidad 77,8 % | apache-2.0 | publico |
| Otros adaptadores de mitigacion de sesgo en contratacion sobre Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre alternativas comparables de la misma categoria (adaptadores de desbiasing en contratacion) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un sistema de contratacion ni esta validado para despliegue; su uso previsto es exclusivamente la investigacion sobre mitigacion de sesgo.
- La decision de referencia hacia la que se entrena es la de GPT-4o, que es libre de atributo por construccion pero no es imparcial.
- La inestabilidad baja a unos pocos por ciento de los conjuntos, no a cero: persiste una dependencia residual del atributo protegido.
- Aproximadamente el 0,5 % de los conjuntos cambian solo por no determinismo de la decodificacion.
- Entrenado y medido en un unico corpus (CVs y ofertas anonimizados de Djinni) y en un unico idioma, el ucraniano.
- Cubre tres atributos protegidos concretos (genero, estatus militar y religion); las intersecciones entre atributos se evaluaron pero nunca se entrenaron.
- Resultados obtenidos con una sola configuracion de LoRA y una sola semilla; no se documenta variabilidad entre semillas.
- El fine-tuning altera la tasa global de contratacion del modelo; hay que comprobar ese desplazamiento frente al punto de operacion propio antes de usarlo.
- Restricciones de licencia: Apache 2.0, permite uso comercial, pero la no validacion para despliegue y las advertencias eticas desaconsejan su uso en produccion de RRHH.
- La ruta LoRA de vLLM no reproduce fielmente el adaptador; es obligatorio fusionar los pesos antes de servir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stereotypes-in-LLMs/qwen3.5-4b-hiring-debias-sft-uk
- Repositorio del estudio y codigo: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation
- Dataset de entrenamiento (datos sinteticos): https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-synthetic-data
- Respuestas auditadas del adaptador: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-responses
- Coleccion completa Hiring Bias Mitigation: https://huggingface.co/collections/Stereotypes-in-LLMs/hiring-bias-mitigation-6aae99f67667367c7149cedd
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de origen citado (Djinni Recruitment Dataset, Drushchak & Romanyshyn, 2024): no disponible enlace directo en la informacion proporcionada
- Paper: en preparacion segun el autor; no disponible
