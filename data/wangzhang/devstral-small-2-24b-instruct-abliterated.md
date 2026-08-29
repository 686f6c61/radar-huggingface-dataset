# wangzhang/Devstral-Small-2-24B-Instruct-abliterated

## Resumen

Devstral-Small-2-24B-Instruct-abliterated es una version modificada del modelo [mistralai/Devstral-Small-2-24B-Instruct-2512](https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512), creada por Wangzhang Wu mediante la herramienta [Abliterix](https://github.com/wuwangzhang1216/abliterix). El objetivo de esta modificacion es eliminar o reducir significativamente los comportamientos de rechazo del modelo original, dando lugar a una version "sin restricciones" que responde a solicitudes que el modelo base se negaria a atender. Se trata de un experimento de investigacion sobre intervencion en el espacio de representaciones, no de un lanzamiento oficial de Mistral AI.

El modelo mantiene la arquitectura Mistral3 del original: un transformer denso de 24.000 millones de parametros (todos activos) con atencion GQA y torre de vision Pixtral, con una ventana de contexto de 256K tokens. Segun las metricas publicadas, la divergencia KL respecto al modelo original es de 0,0086, lo que indica que las capacidades generales se conservan practicamente intactas, mientras que la tasa de rechazos cae del 80% al 3% en una evaluacion de 100 prompts daninos. La licencia es Apache 2.0, lo que permite uso comercial con atribucion.

La relevancia de este modelo reside en que plantea un caso de estudio sobre los efectos de la ablacion de la alineacion de seguridad en modelos de ultima generacion, y sobre como tecnicas como Abliterix pueden alterar el comportamiento de rechazo sin degradar significativamente el rendimiento general. Su uso esta pensado exclusivamente para investigacion y evaluacion, con importantes advertencias legales y eticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3 (transformer denso con GQA + torre de vision Pixtral) |
| Parametros totales | 24.011.361.280 (24B) |
| Parametros activos | 24B (todos activos, modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16 (nativo), INT8 (~24 GB VRAM), NF4 (~12 GB VRAM) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Devstral-Small-2-24B-Instruct-2512, un transformer denso de 40 capas con tamaño oculto de 5120, que incorpora atencion GQA (Grouped Query Attention) y una torre de vision Pixtral que le permite procesar imagenes ademas de texto. La precision nativa es BF16. El modelo original fue entrenado por Mistral AI con un enfasis en tareas de desarrollo de software, aunque la informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion del dataset.

La modificacion abliterated se realizo mediante Abliterix, una herramienta de intervencion en el espacio de representaciones. El proceso consistio en: (1) calcular direcciones de rechazo a partir de 400 pares de prompts daninos frente a 400 benignos en las 40 capas del modelo; (2) aplicar ablacion ortogonalizada para aislar los patrones de activacion especificos del rechazo; (3) intervenir de forma independiente sobre las proyecciones de salida de atencion (GQA) y las proyecciones de bajada del MLP; y (4) optimizar los hiperparametros mediante Optuna TPE sobre 50 ensayos, seleccionando el ensayo numero 25. No se realizo ningun fine-tuning adicional: la modificacion es exclusivamente una intervencion en los pesos.

## Capacidades

- Generacion de texto y codigo: conserva las capacidades del modelo base para generar texto, codigo y razonamiento, con una divergencia KL de 0,0086 respecto al original, lo que indica una degradacion minima.
- Procesamiento multimodal: al mantener la torre de vision Pixtral, el modelo puede procesar imagenes ademas de texto, aunque la documentacion no detalla el alcance exacto de esta capacidad.
- Razonamiento y resolucion de problemas: el modelo base esta orientado a tareas de desarrollo de software, por lo que mantiene capacidades de razonamiento logico y matematico.
- Soporte multilingue: entrenado principalmente en ingles y chino, con capacidades adicionales en otros idiomas no documentadas.
- Ausencia de rechazos: la caracteristica principal de esta version es que responde a solicitudes que el modelo original rechazaria, con una tasa de rechazo del 3% frente al 80% del original.
- Tool calling y agentes: no se menciona explicitamente en la documentacion, pero al derivar de un modelo Mistral3 es probable que herede capacidades de tool calling; no obstante, no hay confirmacion en la informacion disponible.

## Casos de uso

- Investigacion academica sobre alineacion y seguridad: el modelo permite estudiar los efectos de la ablacion de la alineacion en modelos de 24B, comparando comportamientos entre la version original y la modificada. Los investigadores pueden analizar las diferencias en las activaciones y en las respuestas ante prompts delicados.
- Evaluacion de tecnicas de intervencion en representaciones: Abliterix es una herramienta relativamente nueva, y este modelo sirve como caso de estudio para validar su eficacia en modelos grandes con arquitectura Mistral3.
- Desarrollo de software con restricciones minimas: para tareas de generacion de codigo donde el modelo original podria rechazar solicitudes relacionadas con seguridad ofensiva, pentesting o exploits, esta version puede proporcionar respuestas sin filtros. Su uso debe limitarse a entornos controlados y legales.
- Pruebas de robustez de sistemas de moderacion: las organizaciones pueden usar este modelo para probar la eficacia de sus propios filtros de contenido y sistemas de moderacion, al generar respuestas que los modelos alineados no produciran.
- Generacion de contenido creativo sin censura: para proyectos de ficcion, guiones o narrativas que exploren temas tabu o controvertidos, este modelo puede generar texto sin las restricciones habituales de los modelos alineados.
- Analisis comparativo de modelos: los desarrolladores pueden comparar el rendimiento de este modelo con el original en tareas estandar (MMLU, HumanEval, etc.) para cuantificar el impacto de la ablacion en las capacidades generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion publicada es la realizada por el autor con un juez LLM (Gemini Flash) sobre 100 prompts daninos:

| Metrica | Modelo abliterated | Modelo original |
|---|---|---|
| Divergencia KL | 0,0086 | 0 |
| Tasa de rechazos | 3/100 (3%) | 80/100 (80%) |

La divergencia KL de 0,0086 indica que las capacidades generales del modelo son practicamente identicas a las del original, mientras que la tasa de rechazos se reduce drasticamente. No hay datos sobre rendimiento en tareas de codigo, matematicas o razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: ~45 GB en BF16, ~24 GB en INT8, ~12 GB en NF4.
- GPU recomendadas: A100 80GB o H100 para BF16; A40 o RTX 4090 para INT8; RTX 3090 o RTX 4080 para NF4.
- Compatibilidad con GPU de consumo: si, con cuantizacion NF4 cabe en GPUs de consumo de gama alta (RTX 3090, RTX 4080, RTX 4090).
- Opciones de despliegue: el modelo usa la arquitectura Mistral3, por lo que requiere `AutoModelForImageTextToText` de transformers (no `AutoModelForCausalLM`). Es compatible con vLLM, TGI y otras herramientas que soporten Mistral3, aunque no se confirma explicitamente en la documentacion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rechazos | Divergencia KL |
|---|---|---|---|---|---|
| Devstral-Small-2-24B-Instruct-abliterated | 24B | 256K | Apache 2.0 | 3% | 0,0086 |
| mistralai/Devstral-Small-2-24B-Instruct-2512 (original) | 24B | 256K | Apache 2.0 | 80% | 0 |
| Otros modelos abliterated de Mistral (p. ej. Mistral-Small-abliterated) | 24B | 128K | Apache 2.0 | no disponible | no disponible |

La comparativa se limita al modelo original y a otros modelos abliterated de Mistral de tamano similar, aunque no se dispone de datos publicados para estos ultimos. La principal diferencia con el original es la tasa de rechazos y la divergencia KL, mientras que el resto de especificaciones tecnicas son identicas.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de un modelo entrenado principalmente en ingles y chino, puede presentar sesgos culturales y linguisticos hacia estas regiones.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Ausencia de salvaguardas: la eliminacion de la alineacion de seguridad implica que el modelo puede generar contenido ofensivo, explicito, peligroso o ilegal. No debe usarse para tomar decisiones medicas, legales, financieras o de seguridad critica sin revision humana cualificada.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo es un derivado del modelo de Mistral AI, por lo que se deben preservar los avisos de atribucion y licencia en redistribuciones posteriores.
- Uso exclusivo para investigacion: el autor declara explicitamente que el modelo es experimental y se proporciona "AS IS", sin garantias de ningun tipo. El usuario es el unico responsable del uso que haga del modelo y de sus resultados.
- Riesgo legal: el uso de este modelo para generar contenido danino, malware, fraude o acoso puede violar leyes y regulaciones aplicables. Es responsabilidad del usuario asegurarse de que su uso cumple con la legislacion vigente.
- Limitaciones de contexto: aunque la ventana de contexto es de 256K tokens, el rendimiento en contextos muy largos puede degradarse, como ocurre con la mayoria de los modelos transformer.

## Enlaces

- [HuggingFace: wangzhang/Devstral-Small-2-24B-Instruct-abliterated](https://huggingface.co/wangzhang/Devstral-Small-2-24B-Instruct-abliterated)
- [Modelo base: mistralai/Devstral-Small-2-24B-Instruct-2512](https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512)
- [Abliterix (herramienta de modificacion)](https://github.com/wuwangzhang1216/abliterix)
- [OpenModelMap: benchmarks y guia de despliegue del modelo base](https://openmodelmap.com/model/mistralai/Devstral-Small-2-24B-Instruct-2512)
- [GGUF del modelo base (local-ai-zone)](https://local-ai-zone.github.io/models/devstral-small-2-24b-instruct-2512.html)
- [LLM Explorer: ficha del modelo base](https://llm-explorer.com/model/mistralai%2FDevstral-Small-2-24B-Instruct-2512,3zZaFL6H4Lk5XRfLuTSACD)
