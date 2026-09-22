# wepiqx/MiMo-V2.6-Distill-Qwen-9B-GGUF-MERNIK

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una colección de cuantizaciones GGUF del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario wepiqx bajo el nombre MERNIK. El modelo base es un destilado de Qwen3.5-9B realizado por Xiaomi mediante SFT orientado a uso agéntico, con 77.000 millones de tokens de supervisión de los cuales aproximadamente un 27 por ciento corresponden a datos visuales. La relevancia de esta ficha reside en el método de cuantización: el motor MERNIK emplea una cola de prioridades guiada por imatrix, combinando una imatrix propia del modelo MiMo con un conjunto de calibración de Qwen38.

El resultado medido es que una build de 5,0 GB (MERNIK-5100-SMAPE) obtiene una perplejidad de 8,7435 en contexto de 1024 tokens, mejor que una cuantización stock Q6_K de 7,2 GB que obtiene 9,1362. Es decir, se consigue menor huella de disco y menor perplejidad simultáneamente, manteniendo las atenciones de frontera en alta precisión y las normas en F16. La model card advierte que el repositorio está en estado "quants landing": solo la build de 5,0 GB tiene veredicto completo publicado.

El modelo base combina una base Qwen3.5-9B con destilación agéntica de Xiaomi y visión de fusión temprana nativa. Esta ficha describe tanto la cuantización publicada como las características conocidas del modelo subyacente, indicando explícitamente los datos que no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con vision de fusion temprana (modelo base derivado de Qwen3.5-9B) |
| Parametros totales | Aproximadamente 9.000 millones (segun denominacion del modelo base; cifra exacta no disponible) |
| Parametros activos | No aplica (no se indica que sea MoE; no disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de uso configura 8192 tokens con `-c 8192` |
| Tipos de cuantizacion | GGUF generados por el motor MERNIK: MERNIK-5100-SMAPE (5,0 GB), MERNIK-4500-SMAPE (4,4 GB), MERNIK-6500-SMAPE (6,8 GB); referencia stock Q6_K (7,2 GB); normas en F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, MiMo-V2.6-Distill-Qwen-9B, es un destilado agéntico de Qwen3.5-9B producido por Xiaomi. El entrenamiento se realizó mediante SFT con 77.000 millones de tokens, de los cuales el 27 por ciento son datos visuales, lo que apunta a una arquitectura con fusión temprana de visión heredada de Qwen3.5. No se dispone de información sobre el número total de tokens de preentrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

Sobre esa base, el repositorio aplica el motor de cuantización MERNIK, que usa una cola de prioridades dirigida por imatrix, con una imatrix propia del modelo MiMo más calibración Qwen38. La asignación híbrida de bits mantiene las atenciones de frontera en alta precisión y las normas en F16, lo que según el autor permite que las builds pequeñas conserven mejor la coherencia que las cuantizaciones stock planas. El modelo GGUF incluye su propia plantilla jinja basada en macros (no la plantilla clásica de Qwen), por lo que `--jinja` funciona de forma nativa en llama.cpp.

## Capacidades

- Generación de texto en inglés sobre una base Qwen3.5-9B destilada.
- Capacidades agénticas: el modelo base fue destilado específicamente con SFT agéntico, lo que sugiere soporte para razonamiento multi-paso y ejecución de tareas encadenadas (no se detalla en la información disponible el soporte explícito de tool calling o function calling).
- Generación y razonamiento sobre código: la model card reporta evaluaciones con HumanEval (pass@1), lo que indica competencia en tareas de programación.
- Capacidades visuales: el 27 por ciento de los tokens de SFT del modelo base son visuales, sobre la visión de fusión temprana nativa de Qwen3.5. Nota: la cuantización GGUF publicada está etiquetada únicamente con el idioma `en` y no se detalla si la ruta de visión se conserva en el fichero cuantizado.
- Razonamiento matemático y general: no hay datos explícitos en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Despliegue local en GPU de consumo para asistentes de código: con 5,0 GB de peso, la build MERNIK-5100 cabe en GPUs con 8-12 GB de VRAM y permite servir un modelo de 9B con 70,12 por ciento de pass@1 en HumanEval, adecuado para autocompletado y generación de funciones en entornos de desarrollo locales.
- Agentes de automatización de tareas multi-paso: al ser un destilado agéntico, el modelo está orientado a descomponer instrucciones y encadenar llamadas; se puede integrar en flujos que requieran varios turnos de razonamiento antes de producir una acción final.
- Servicio de inferencia con llama.cpp / llama-server: el ejemplo de la model card (`llama-server ... --port 28082 -ngl 99 -c 8192 --jinja`) permite levantar un endpoint HTTP local para prototipado rápido y pruebas de integración sin infraestructura de GPU dedicada.
- Evaluación comparativa de métodos de cuantización: útil para investigadores que quieran reproducir la comparación entre una build MERNIK de 5,0 GB (PPL 8,7435) y una stock Q6_K de 7,2 GB (PPL 9,1362) en su propio hardware y dataset.
- Generación de código en pipelines de CI/CD: el modelo puede usarse para tareas acotadas de revisión, generación de tests o parcheo de fragmentos de código, siempre que el contexto se mantenga dentro de la ventana configurada (el ejemplo usa 8192 tokens).
- Prototipado con presupuesto de VRAM limitado: la build de 4,4 GB (MERNIK-4500-SMAPE), pendiente de veredicto, apunta a escenarios donde se necesita maximizar el contexto disponible dentro de una GPU pequeña, a costa de una posible pérdida de fidelidad aún no medida.
- Investigación sobre calibración e imatrix: el repositorio MERNIK documenta método y ledgers, por lo que sirve como caso de estudio reproducible de cuantización guiada por imatrix propia frente a calibración genérica.

## Benchmarks y rendimiento

Resultados publicados en la model card. El arnés indicado para los veredictos es HumanEval pass@1 en slow ring, con temperatura 1,0, top_p 0,95, top_k 20 y max 2048.

| Build | Tamano | PPL (ctx1024) | HumanEval pass@1 | HE+ |
|---|---|---|---|---|
| MERNIK-5100-SMAPE | 5,0 GB | 8,7435 | 70,12 % (115/164) | 66,5 % |
| MERNIK-4500-SMAPE | 4,4 GB | Pendiente | Pendiente | Pendiente |
| MERNIK-6500-SMAPE | 6,8 GB | Pendiente | Pendiente | Pendiente |
| Q6_K (stock, referencia) | 7,2 GB | 9,1362 | Pendiente | Pendiente |

Duelo de referencia con el mismo arnés citado por el autor (otros modelos): OxCoder-SMAPE-5100 88,41 %; NeoHorse-SMAPE-5100 82,93 %. Estos valores corresponden a modelos distintos y se incluyen como contexto comparativo, no como resultados de este modelo. No se han publicado en la información disponible resultados de MMLU, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB para la build MERNIK-5100 (5,0 GB de pesos más caché KV y overhead), aproximadamente 4,5-5,5 GB para la 4500 y 7-8 GB para la 6500. Estimaciones orientativas a partir del tamaño de fichero; no hay mediciones publicadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 8 GB de VRAM puede ejecutar la build de 5,0 GB con capas descargadas en GPU (`-ngl 99`). No hay datos para A100, H100 ni RTX 4090 en la información proporcionada.
- Cabe en GPU de consumo: sí, la build de 5,0 GB es compatible con GPUs consumer de 8 GB o más (por ejemplo, gama RTX x060/x070 con 8-12 GB). La build de 4,4 GB amplía el margen para GPUs de 8 GB.
- Opciones de despliegue: llama.cpp y su servidor `llama-server`, con soporte nativo de `--jinja` gracias a la plantilla incluida. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo / build | Parametros | Contexto | PPL (ctx1024) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MERNIK-5100-SMAPE (este) | ~9B | No disponible (ejemplo a 8192) | 8,7435 | Apache-2.0 | Publicado, veredicto completo |
| Q6_K stock (referencia) | ~9B | No disponible | 9,1362 | No disponible | Referencia usada por el autor |
| OxCoder-SMAPE-5100 | No disponible | No disponible | No disponible | No disponible | Solo citado en duelo HumanEval (88,41 %) |
| NeoHorse-SMAPE-5100 | No disponible | No disponible | No disponible | No disponible | Solo citado en duelo HumanEval (82,93 %) |

La única comparación con datos completos es la de la build MERNIK-5100 frente a la stock Q6_K: menor tamaño (5,0 GB frente a 7,2 GB) y menor perplejidad (8,7435 frente a 9,1362). Los modelos OxCoder y NeoHorse solo aparecen como referencia de HumanEval, sin especificaciones ni licencia disponibles.

## Limitaciones y advertencias

- Repositorio en estado inicial: 0 descargas y 0 likes en el momento de la consulta, y solo una de las builds tiene veredicto publicado. Las builds de 4,4 GB y 6,8 GB están pendientes de medición, por lo que su calidad real es desconocida.
- Cobertura de benchmarks muy limitada: solo HumanEval pass@1 y perplejidad a contexto 1024. No hay MMLU, GSM8K ni evaluaciones de razonamiento general, ni evaluaciones de calidad multilingüe.
- Idiomas: el repositorio declara únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: la información disponible no especifica la longitud de contexto nativa del modelo base; el ejemplo de uso configura 8192 tokens, pero no se confirma que ese sea el máximo soportado.
- Capacidades agénticas y de visión: aunque el modelo base fue destilado con datos agénticos y visuales, la model card no confirma que la ruta de visión se conserve en el GGUF cuantizado; conviene verificarlo antes de usarlo en tareas multimodales.
- Riesgo de alucinación: inherente a un modelo de 9B cuantizado a baja precisión; no hay datos publicados de tasa de alucinación.
- Licencia: Apache-2.0 en este repositorio, lo que permite uso comercial, pero la licencia del modelo base debe verificarse por separado. No se han proporcionado los términos de la licencia del modelo XiaomiMiMo de origen.
- Trazabilidad: el motor MERNIK es un proyecto de investigación del propio autor; los resultados de perplejidad y HumanEval provienen de su arnés y no de una evaluación independiente.
- Advertencia sobre metadatos: las fechas del repositorio (creación y actualización en septiembre de 2026) se reproducen tal cual figuran en la información consultada.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/wepiqx/MiMo-V2.6-Distill-Qwen-9B-GGUF-MERNIK
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Metodo, motor y ledgers MERNIK: https://huggingface.co/wepiqx/MERNIK
- Patrocinio del autor: https://github.com/sponsors/wepiqx

No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs o demos) sobre este modelo o su cuantizacion.
