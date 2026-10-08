# vishvananda/mtg-oracle-qwen3-4b-checkpoints-20261007

## Resumen

MTG Oracle es un adaptador QLoRA de investigación entrenado sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario vishvananda. Su propósito es la generación de texto especializado en el dominio de Magic: The Gathering, en concreto a partir del dataset vishvananda/mtg-oracle-design-descriptions, que relaciona descripciones de diseño con texto oracle de cartas. El repositorio no contiene pesos completos, sino los pesos del adaptador (0,7 GB) en formato safetensors compatibles con PEFT.

Se trata de un checkpoint intermedio, no de un modelo final: corresponde al paso 600 de entrenamiento, con 0,0383 épocas completadas. El propio autor indica explícitamente que no reclama ninguna precisión de test final ni que el entrenamiento o la evaluación estén terminados. Esto lo convierte en material de investigación y reproducibilidad, no en un artefacto listo para producción.

El modelo base aporta la capacidad general de generación de texto y seguimiento de instrucciones, mientras que el adaptador introduce la especialización de dominio. El repositorio incluye un `system-prompt.txt` que debe aplicarse en la inferencia y una indicación explícita de desactivar el modo thinking del modelo base. El idioma declarado es únicamente inglés y la licencia del adaptador es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; se trata de un adaptador PEFT (QLoRA) sobre el transformer denso Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible; los parametros del adaptador no se detallan. El modelo base se denomina "4B", de donde se deduce un orden de ~4.000 millones de parametros en el modelo base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; heredada del modelo base Qwen/Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | no disponible; el entrenamiento es QLoRA, pero no se documentan formatos de cuantizacion publicados para el adaptador |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador); el dataset incorpora contenido de terceros de Magic: The Gathering sujeto a sus propias condiciones |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador QLoRA, es decir, un conjunto de matrices de bajo rango entrenadas sobre un modelo base congelado cuantizado, serializadas mediante la libreria PEFT. El modelo base es Qwen/Qwen3-4B-Instruct-2507, en su revision exacta `cdbee75f17c01a7cc42f958dc650907174af0554`. El repositorio no contiene los pesos del modelo base, que deben descargarse por separado, ni estado del optimizador, logs de workers, credenciales o material grafico.

El entrenamiento se realizo sobre el dataset vishvananda/mtg-oracle-design-descriptions, fijado en el commit `4e32fd88762697f984f8091947d6ba65246074d5`. El checkpoint publicado corresponde al paso 600, con 0,0383 épocas completadas, y esta etiquetado como `prepared-v1-train-step-00000600`. La receta completa, asi como los identificadores de datos y codigo, se encuentran en el archivo `checkpoint.json` del repositorio. El autor no documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales; la unica instruccion operativa relevante es aplicar `system-prompt.txt` y desactivar el modo thinking del modelo base durante la inferencia.

## Capacidades

- Generacion de texto especializado en el dominio de Magic: The Gathering, en particular la produccion de texto oracle a partir de descripciones de diseño de cartas, segun el dataset de entrenamiento declarado.
- Generacion de texto general y seguimiento de instrucciones heredados del modelo base Qwen3-4B-Instruct-2507.
- Inferencia en ingles unicamente; no se declara soporte de otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: el autor indica explicitamente que debe desactivarse durante la inferencia, por lo que no se plantea como capacidad utilizable.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el repositorio incluye `checkpoint.json` con la receta y los identificadores de datos y codigo, lo que permite reproducir exactamente el paso 600 partiendo del commit del dataset y de la revision del modelo base.
- Investigacion sobre QLoRA en dominios muy especializados: sirve como caso de estudio de adaptacion de un modelo de 4B a un vocabulario y una estructura textual muy concretos (texto oracle de cartas) con un coste de entrenamiento bajo.
- Estudio de la dinamica de entrenamiento por checkpoints: al ser un checkpoint intermedio (paso 600, 0,0383 épocas), permite analizar como evoluciona el comportamiento del adaptador en fases muy tempranas del ajuste y compararlo con checkpoints posteriores.
- Anotacion y normalizacion de corpus de cartas: puede emplearse para reformular descripciones de diseño en el formato oracle canonico, dentro de un pipeline de preprocesado de datos para proyectos de diseño de juegos de cartas.
- Prototipado de asistentes de diseño para juegos de cartas coleccionables propios: el adaptador puede generar borradores de texto de carta a partir de una descripcion funcional, que un diseñador revisaria manualmente antes de incorporarlos.
- Generacion de datos sinteticos para aumentar un dataset de diseño de cartas: las salidas del adaptador, filtradas por revision humana, podrian alimentar conjuntos de entrenamiento adicionales en el mismo dominio.
- Docencia y divulgacion sobre ajuste fino eficiente: al ser un adaptador pequeno (0,7 GB) sobre un modelo de 4B, es un ejemplo practico y de bajo coste para explicar PEFT y QLoRA en cursos o talleres.
- Experimentos de continued training: el adaptador puede servir como punto de partida para seguir entrenando con datos adicionales o con un prompt de sistema distinto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que se trata de un checkpoint de investigacion y que no se reclama ninguna precision de test final.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones orientativas derivadas del tamano del modelo base (~4B) y no proceden de la model card ni de mediciones publicadas por el autor.

- VRAM estimada para inferencia: en torno a 8-10 GB en fp16, 5-6 GB en cuantizacion de 8 bits y 3-4 GB en cuantizacion de 4 bits, sumando el modelo base y el adaptador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para cuantizacion de 4 u 8 bits; para fp16 se recomienda una GPU de 16 GB o superior.
- Viabilidad en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090, siempre con cuantizacion cuando la VRAM sea ajustada.
- Opciones de despliegue: el autor indica carga mediante Transformers y PEFT. No se documentan instrucciones ni ficheros para vLLM, llama.cpp, Ollama o TGI; al tratarse de un adaptador PEFT, su uso en esos motores requeriria fusionar previamente el adaptador con el modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables de la misma categoria en la documentacion proporcionada. La comparacion mas directa posible es con el propio modelo base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtg-oracle-qwen3-4b-checkpoints-20261007 | no disponible (adaptador sobre base ~4B) | no disponible | sin benchmarks publicados; checkpoint intermedio sin evaluacion final | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B, segun la denominacion del modelo base | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | apache-2.0, segun la atribucion del autor | HuggingFace (repositorio del modelo base) |
| Otros adaptadores QLoRA de dominio | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigacion sin evaluacion: el autor afirma explicitamente que el entrenamiento no esta completo (0,0383 épocas) y que no se reclama precision de test. No debe tratarse como un modelo validado.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de su comportamiento.
- Riesgo de alucinacion: al ser un modelo de lenguaje de 4B ajustado con muy pocos datos, es previsible que invente reglas, costes, tipos o nombres de cartas, especialmente en interacciones complejas del reglamento de Magic: The Gathering.
- Limitacion idiomatica: solo se declara soporte de ingles. El uso en castellano no esta respaldado por el autor y previsiblemente degradara la calidad.
- Restricciones de licencia: aunque el adaptador se publica bajo Apache 2.0, el dataset de entrenamiento incorpora contenido de cartas de Magic: The Gathering de terceros. El autor exige conservar el `DATA_LICENSE.md` y la atribucion correspondiente a Wizards of the Coast, Scryfall y MTGJSON. Cualquier uso que reproduzca ese contenido debe respetar esas condiciones, ademas de las politicas de contenido de fans de Wizards of the Coast.
- Dependencia del prompt de sistema: el correcto funcionamiento requiere aplicar `system-prompt.txt` y desactivar el modo thinking del modelo base. Omitir cualquiera de las dos condiciones altera el comportamiento esperado.
- Dependencia de la revision exacta del modelo base: el autor fija la revision `cdbee75f17c01a7cc42f958dc650907174af0554`. Cargar el adaptador sobre otra revision puede producir resultados distintos o errores de compatibilidad.
- Ausencia de datos operativos: no se documentan tasas de error, cobertura del dataset, sesgos conocidos ni limites de longitud de contexto especificos del adaptador.
- Uso comercial: no recomendado en produccion sin una evaluacion propia previa, tanto por la falta de metricas como por las condiciones asociadas al contenido de terceros del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vishvananda/mtg-oracle-qwen3-4b-checkpoints-20261007
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Revision exacta del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/tree/cdbee75f17c01a7cc42f958dc650907174af0554
- Dataset de entrenamiento: https://huggingface.co/datasets/vishvananda/mtg-oracle-design-descriptions
- Commit exacto del dataset: https://huggingface.co/datasets/vishvananda/mtg-oracle-design-descriptions/tree/4e32fd88762697f984f8091947d6ba65246074d5
- Etiqueta del checkpoint: `prepared-v1-train-step-00000600` (en el repositorio del modelo)
- Ficheros de receta citados por el autor: `checkpoint.json` y `system-prompt.txt` (en el repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
