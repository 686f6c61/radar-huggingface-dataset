# Stereotypes-in-LLMs/lapa-12b-hiring-debias-sft-en

## Resumen
lapa-12b-hiring-debias-sft-en es un adaptador LoRA desarrollado por Stereotypes-in-LLMs que se aplica sobre el modelo base lapa-llm/lapa-v0.1.2-instruct (12B). Su objetivo es que las decisiones de contratación no cambien al variar un atributo protegido como el género, el estado militar o la religión. Para ello se entrenó con objetivos contrafactualmente invariantes y se auditó sobre un benchmark de 31.050 decisiones.

El adaptador reduce la inestabilidad de las decisiones (conjuntos contrafactuales en los que el veredicto cambia según el atributo) del 37,8 % en el modelo base al 4,6 % en el adaptador, una mejora de 33,3 puntos porcentuales. Además, la utilidad (acuerdo con la referencia sin atributos) sube del 50,9 % al 80,6 %. Es relevante ahora porque aborda un problema crítico en sistemas de selección automatizados, aunque los propios autores advierten que no es un sistema de contratación validado para producción.

La arquitectura subyacente no se detalla en la model card, pero se trata de un adaptador PEFT/LoRA sobre un transformer de 12B. El contexto y las cuantizaciones soportadas no están disponibles. El idioma de trabajo es únicamente el inglés y la licencia heredada es Gemma.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo transformer; arquitectura del base no especificada |
| Parámetros totales | 12B (según nomenclatura del adaptador; no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere fusión con el modelo base para servir) |

## Arquitectura y entrenamiento
El adaptador se entrena sobre lapa-llm/lapa-v0.1.2-instruct mediante LoRA (Low-Rank Adaptation), una técnica de ajuste eficiente que congela los pesos del modelo base e inserta matrices de bajo rango. No se especifica la arquitectura interna del base, pero por el tamaño (12B) y el uso típico se presume un transformer decoder. El entrenamiento se realizó con datos sintéticos de la colección hiring-bias-mitigation-synthetic-data, derivados de CVs y ofertas anonimizadas del Djinni Recruitment Dataset, en inglés.

La innovación principal es el uso de objetivos contrafactualmente invariantes: para cada par candidato-puesto se generan variantes con distintos atributos protegidos y se fuerza a que la decisión sea la misma en todas ellas. La referencia de decisión utilizada es la de GPT-4o, que es libre de atributos por construcción pero no está exenta de sesgos. No se menciona el uso de RLHF o DPO. Se empleó una única configuración LoRA y una sola semilla, y se evaluó sobre un benchmark de 31.050 decisiones contrafactuales.

## Capacidades
- Toma de decisiones binarias de contratación (contratar/rechazar) para pares candidato-puesto.
- Invariancia contrafactual ante tres atributos protegidos: género, estado militar y religión.
- Generación de justificaciones (rationales) que rara vez nombran el atributo protegido (0,2 % frente al 1,1 % del base).
- Procesamiento de texto en inglés.
- No se especifican capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad limitada al dominio de contratación; no es un modelo de propósito general.

## Casos de uso
- Investigación en equidad algorítmica: evaluar el impacto de la mitigación de sesgos en decisiones de contratación usando el benchmark contrafactual de 31.050 decisiones y comparar con el modelo base.
- Auditoría de sistemas de selección: detectar inestabilidades en las decisiones de un modelo de contratación comparando las respuestas del base y del adaptador sobre los mismos pares candidato-puesto.
- Generación de datos sintéticos contrafactuales: crear variantes de atributos protegidos para entrenar o evaluar otros modelos de selección, partiendo del dataset proporcionado.
- Desarrollo de asistentes de contratación justos: integrar el adaptador fusionado en un pipeline de análisis de CVs, siempre con supervisión humana y como capa de corrección de sesgos.
- Análisis de disparidades: medir tasas de contratación por grupo protegido y cuantificar el cambio tras aplicar la mitigación, comparando el 79,7 % de contratación del base con el 17,7 % del adaptador.
- Formación y concienciación: usar las decisiones y justificaciones del modelo para ilustrar cómo los atributos protegidos pueden sesgar las decisiones en procesos de selección.
- Pruebas de regresión de sesgo: incluir el adaptador como referencia en pruebas automatizadas de equidad antes de desplegar cualquier modelo de contratación en producción.

## Benchmarks y rendimiento
Los únicos datos de rendimiento disponibles son los de la auditoría contrafactual realizada por los autores. No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

Conjuntos contrafactuales inestables (899 conjuntos emparejados):
| Métrica | Modelo base | Este adaptador |
|---|---:|---:|
| Conjuntos inestables | 37,8 % | 4,6 % |
| Cambio | | -33,3 pp [-39,1, -27,7] |
| Conjuntos arreglados : rotos | | 330 : 31 |
| Utilidad (acuerdo con referencia sin atributos) | 50,9 % | 80,6 % |
| Justificaciones que nombran el atributo | 1,1 % | 0,2 % |

Por grupo protegido (todos significativos tras corrección de Benjamini-Hochberg):
| Grupo | Base inestable % | Adaptador inestable % | Δ pp | p (FDR) |
|---|---:|---:|---:|---:|
| gender | 15,7 | 1,9 | -13,8 | 4e-25 |
| military status | 27,7 | 2,8 | -24,9 | 7e-49 |
| religion | 21,3 | 1,0 | -20,3 | 1e-44 |

Barrido del umbral de contratación a una tasa de contratación del 17,7 %:
| Condición | Conjuntos inestables % |
|---|---:|
| Modelo base, movido a esa tasa | 20,2 |
| Este adaptador | 1,8 |

A igual tasa de contratación, el adaptador es 11,4 veces más consistente; el 9 % de la ganancia bruta se atribuye al cambio de umbral. La curva del adaptador queda por debajo de la del base en todos los puntos de operación.

## Requisitos de hardware
- VRAM estimada para el modelo base de 12B: en bf16 aproximadamente 24 GB; en 8 bits unos 12 GB; en 4 bits unos 6-7 GB. El adaptador añade 0,6 GB en safetensors.
- GPU recomendadas: A100 40 GB, H100, RTX 4090 24 GB (bf16 justo, mejor con cuantización), RTX 3090 24 GB.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en GPUs de 8-12 GB como RTX 3060 12 GB o RTX 4070. Para bf16 se necesitan al menos 24 GB.
- Opciones de despliegue: fusionar el adaptador con el modelo base y servir el checkpoint resultante con vLLM, TGI, llama.cpp (previa conversión a GGUF) u Ollama (previa conversión). No usar la ruta LoRA de vLLM, ya que no reproduce el modelo entrenado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone de información sobre otros adaptadores de mitigación de sesgos comparables. La comparación más directa es con el modelo base sin adaptador.

| Modelo | Parámetros | Contexto | Licencia | Inestabilidad (%) | Utilidad (%) |
|---|---:|---|---:|---:|---:|
| lapa-llm/lapa-v0.1.2-instruct (base) | 12B (asumido) | no disponible | gemma | 37,8 | 50,9 |
| lapa-12b-hiring-debias-sft-en (este adaptador) | 12B (base) + LoRA | no disponible | gemma | 4,6 | 80,6 |

Otros modelos comparables: no disponible.

## Limitaciones y advertencias
- No es un sistema de contratación ni está validado para despliegue; su uso previsto es la investigación sobre mitigación de sesgos.
- La referencia de decisión es GPT-4o, que es libre de atributos por construcción pero no está exento de sesgos.
- La inestabilidad se reduce a unos pocos puntos porcentuales, no a cero: persiste una dependencia residual del atributo.
- Aproximadamente el 0,5 % de los conjuntos cambian solo por no determinismo en la decodificación.
- Entrenado y medido en un único corpus (CVs y ofertas anonimizadas de Djinni) en inglés, con tres atributos protegidos, una configuración LoRA y una semilla.
- Las intersecciones entre atributos se evaluaron pero nunca se entrenaron.
- El ajuste fino desplaza la tasa global de contratación (del 79,7 % al 17,7 %); es necesario comprobar ese desplazamiento frente al punto de operación propio.
- La licencia Gemma puede imponer restricciones al uso comercial; hay que revisar los términos de dicha licencia.
- El adaptador hereda los sesgos y limitaciones del modelo base no relacionados con los atributos mitigados.
- No se especifican capacidades de tool calling, agentes ni multilingüismo más allá del inglés.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Stereotypes-in-LLMs/lapa-12b-hiring-debias-sft-en
- Repositorio del estudio y código: https://github.com/Stereotypes-in-LLMs/hiring_bias_mitigation
- Dataset de entrenamiento: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-synthetic-data
- Respuestas auditadas del adaptador: https://huggingface.co/datasets/Stereotypes-in-LLMs/hiring-bias-mitigation-responses
- Colección completa: https://huggingface.co/collections/Stereotypes-in-LLMs/hiring-bias-mitigation-6aae99f67667367c7149cedd
- Modelo base: https://huggingface.co/lapa-llm/lapa-v0.1.2-instruct
- Cita del dataset original: Drushchak & Romanyshyn, 2024 (Djinni Recruitment Dataset)
