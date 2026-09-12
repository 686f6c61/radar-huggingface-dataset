# voz-ancestral/qwen_s2_ckpt11000

## Resumen

NheengatuMT (checkpoint `qwen_s2_ckpt11000`) es un ajuste fino del modelo Qwen/Qwen3.5-2B realizado por el usuario voz-ancestral para traduccion y asistencia de escritura entre portugues (pt) y nheengatu (codigo ISO `yrl`), una lengua indigena de la familia tupi-guaraní hablada en la region del rio Negro (Brasil). El modelo tiene 1.881.825.088 parametros reales segun los pesos en safetensors, lo que lo situa en la franja de los 2.000 millones, y se distribuye bajo licencia Apache-2.0, sin la herencia no comercial que arrastran otros artefactos del mismo proyecto derivados de NLLB.

Su relevancia reside en dos factores. Primero, es el unico artefacto del proyecto NheengatuMT que puede emplearse para construir un servicio comercial, porque su modelo base (Qwen3.5-2B) es Apache-2.0. Segundo, aborda un par de idiomas con recursos extremadamente escasos, donde practicamente no existen sistemas de traduccion abiertos con evaluacion publicada. El autor documenta explicitamente que ningun hablante nativo ha evaluado las salidas y que el protocolo de evaluacion por hablantes esta en campo pero sin datos analizados.

El checkpoint corresponde a la semilla 2, paso 11.000, y fue seleccionado no por la mediana del conjunto de semillas sino por liderar el registro *near-domain* (el mas cercano a texto de uso general). Las medias tardias de las tres semillas son 27,67 en el conjunto juridico pt→yrl y 62,37 en *near-domain* pt→yrl, de modo que este checkpoint queda por encima de la media de su propio conjunto, un detalle que el autor declara de forma explicita para que nadie compare de forma descontextualizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, tag de arquitectura `qwen3_5_text` (derivado de Qwen/Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | Nheengatu (`yrl`) y portugues (`pt`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos: tamano del repositorio 7,5 GB, pipeline declarado `text-generation`, 0 descargas y 0 likes en el momento de la consulta, creado el 11 de septiembre de 2026.

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre Qwen/Qwen3.5-2B, un transformer decoder-only denso de aproximadamente 1,88 B de parametros con etiqueta de arquitectura `qwen3_5_text`. No hay informacion publicada en la model card sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la existencia de fases de RLHF o DPO, ni sobre hiperparametros de ajuste. Tampoco se documenta si se aplicaron tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas.

Lo que si se documenta es el proceso de seleccion de checkpoint y el marco metodologico del proyecto. Se entrenaron tres semillas y se evaluaron sus checkpoints tardios; el aqui publicado es la semilla 2 en el paso 11.000, elegida por su rendimiento en el registro *near-domain*. El proyecto incluye siete modelos en total, y este es el unico sin herencia de licencia no comercial procedente de NLLB. El autor proporciona ademas un glosario y un mecanismo de terminologia, cuyas entradas se derivan de las fuentes de entrenamiento y se declaran provisionales, no autoritativas. La model card hace hincapie en que la eleccion de tradicion ortografica es una decision de la comunidad hablante y no una decision tecnica.

## Capacidades

- Traduccion bidireccional portugues ↔ nheengatu (`pt→yrl` y `yrl→pt`), con resultados de chrF++ publicados en dos registros distintos.
- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Registro *near-domain*: el modelo rinde claramente mejor en texto de uso general que en texto juridico especializado.
- Apoyo a la escritura y a la lectura en nheengatu, que es el posicionamiento que el propio autor declara como uso previsto.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo de razonamiento explicito (*thinking mode*): no disponible.
- Capacidades multilingues: limitadas a `pt` y `yrl`. No hay evidencia publicada de transferencia a otras lenguas tupi-guaraní ni a otros idiomas.

## Casos de uso

- Redaccion asistida en nheengatu: un hablante escribe un borrador en portugues y el modelo propone una version en nheengatu que despues revisa manualmente. Es adecuado porque el registro *near-domain* alcanza 62,97 de chrF++ en `pt→yrl`, el mejor resultado del proyecto en ese registro.
- Herramienta de lectura para documentacion comunitaria: traduccion de avisos, actas y materiales de uso cotidiano al portugues (`yrl→pt`, 59,86 de chrF++ en *near-domain*) para facilitar el acceso de hablantes no alfabetizados en portugues.
- Preservacion y digitalizacion de textos: conversion de material escrito en nheengatu a portugues como paso previo a su catalogacion, siempre con revision humana por el riesgo documentado de que la fluidez supere a la fidelidad.
- Investigacion en procesamiento de lenguas con pocos recursos: el checkpoint sirve como punto de partida reproducible para experimentos de ajuste fino, ya que la licencia Apache-2.0 no impone restricciones de herencia no comercial.
- Prototipado de aplicaciones educativas: integracion en una herramienta de aprendizaje de nheengatu donde el modelo genera ejemplos y variantes que el docente valida antes de publicarlos.
- Generacion de contenidos bilingues para divulgacion: produccion de versiones paralelas pt/yrl de material informativo, con la advertencia explicita de que no debe usarse como traduccion oficial.
- Servicio comercial de soporte linguistico: es el unico artefacto del proyecto que puede sostener un servicio de pago, precisamente por carecer de la herencia no comercial de NLLB.

## Benchmarks y rendimiento

Metrica chrF++ sobre los conjuntos de desarrollo, segun la model card:

| Conjunto | pt→yrl | yrl→pt |
|---|---|---|
| Juridico (*legal*) | 28,01 | 31,61 |
| Near-domain | 62,97 | 59,86 |

Datos adicionales de contexto aportados por el autor:

| Metrica | Valor |
|---|---|
| Media tardia de las tres semillas, juridico pt→yrl | 27,67 |
| Media tardia de las tres semillas, near-domain pt→yrl | 62,37 |
| Tasa de degeneracion con beam-4 libre | 1,7 % |
| Tokens de contenido del conjunto juridico ausentes en entrenamiento | 8,7 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que en el conjunto juridico el modelo pierde de forma concluyente frente a un seq2seq de 600 M bajo la regla del articulo, y que en *near-domain* gana; matiza que ese resultado solo aparece cuando ambos lados se seleccionan con el mismo criterio.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 1,88 B de parametros: en bf16/fp16 en torno a 4 GB de pesos mas cache de claves y valores; en 8 bits en torno a 2 GB; en 4 bits en torno a 1,2 GB. Estas cifras son estimaciones derivadas del tamano del modelo, no datos publicados en la model card.
- El repositorio ocupa 7,5 GB, coherente con pesos en mayor precision que bf16; conviene comprobar los archivos de safetensors antes de planificar el despliegue.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede ejecutar el modelo en bf16, incluidas RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090. Para despliegue en servidor, A100, H100 o L40S son suficientes y quedan sobredimensionadas para este tamano.
- Si cabe en GPU de consumo: si. Un modelo de 1,88 B en 4 u 8 bits cabe en GPU de 8 GB o incluso menos; en bf16 requiere alrededor de 4 GB solo para pesos, por lo que 8 GB de VRAM es un objetivo comodo.
- Opciones de despliegue: transformers es la libreria declarada y el formato publicado es safetensors. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa. vLLM y TGI pueden servir el modelo en safetensors, aunque no hay confirmacion del autor sobre compatibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | chrF++ juridico pt→yrl | chrF++ near-domain pt→yrl | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| voz-ancestral/qwen_s2_ckpt11000 | 1,88 B | no disponible | yrl, pt | 28,01 | 62,97 | Apache-2.0 | HuggingFace |
| Seq2seq de 600 M del mismo proyecto (herencia NLLB) | 0,6 B | no disponible | yrl, pt | mejor que el modelo de 1,88 B en juridico, cifra concreta no disponible | peor que el modelo de 1,88 B en near-domain, cifra concreta no disponible | no comercial (herencia NLLB) | HuggingFace, dentro del proyecto |
| Qwen/Qwen3.5-2B (modelo base) | ~2 B | no disponible | multilingue general | no disponible | no disponible | Apache-2.0 | HuggingFace |

La comparativa cuantitativa solo puede hacerse, con los datos publicados, frente al seq2seq de 600 M del mismo proyecto, y de forma cualitativa: gana en *near-domain* y pierde en juridico. No se dispone de cifras de otros sistemas de traduccion para nheengatu en la informacion proporcionada.

## Limitaciones y advertencias

- Ningun hablante nativo ha evaluado las salidas. El protocolo de evaluacion por hablantes esta construido y en campo, pero no se ha analizado ningun dato. Todo lo que se sabe sobre calidad procede de metricas automaticas e inspeccion de personas que no hablan la lengua.
- Terminologia juridica incorrecta con alta confianza. En una prueba con un articulo constitucional retenido, los siete modelos del proyecto acertaron el marco legal completo, incluida la referencia cruzada a los incisos, y los siete fallaron la misma palabra. En el conjunto juridico, el 8,7 % de los tokens de contenido nunca aparecen en entrenamiento y ninguno tiene entrada en el glosario.
- Degeneracion en texto largo. Con decodificacion libre la repeticion empieza alrededor de las 40 palabras de origen y se convierte en bucle a partir de unas 60. El articulo mide un 1,7 % con beam-4 libre, y la decodificacion restringida multiplica esa cifra por cinco.
- La fluidez supera a la adecuacion. El modelo produce frases mas plausibles que fieles, y las frases plausibles que la fuente no dice son el modo de fallo mas peligroso para uso comunitario porque no parecen errores.
- Comportamiento erratico documentado. En una frase produjo el termino mas cercano a la referencia entre los siete modelos del proyecto, y en otra invento tres organismos publicos inexistentes en la fuente.
- Tendencia a reproducir material de entrenamiento. Con la frase de entrenamiento literal devuelve la referencia palabra por palabra, y la recuperacion sobrevive a perturbaciones segun el autor.
- Posicionamiento del autor: apoyo a la escritura y a la lectura, nunca traduccion oficial.
- Decision ortografica pendiente: la tradicion ortografica que produce el modelo deriva de sus fuentes de entrenamiento. La Academia da Lingua Nheengatu fue contactada y no respondio; el autor declara que el silencio no se interpreta como consentimiento y que el glosario es provisional.
- Seleccion de checkpoint sesgada hacia *near-domain*: el autor advierte explicitamente de que este checkpoint esta por encima de la media de su propio conjunto de semillas y que quien lo compare con otros sistemas debe tenerlo en cuenta.
- Restricciones de licencia: Apache-2.0 permite uso comercial, a diferencia de los otros artefactos del proyecto con herencia NLLB. No obstante, el propio autor limita el uso previsto al apoyo a la escritura y la lectura.
- Idiomas: solo `pt` y `yrl`. No hay datos sobre comportamiento en otras lenguas ni sobre robustez ante variantes dialectales del nheengatu.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/voz-ancestral/qwen_s2_ckpt11000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo. Los unicos resultados obtenidos fueron paginas de soporte tecnico de Microsoft, sin ninguna relacion con el proyecto NheengatuMT ni con Qwen. Por tanto, no se dispone de enlaces al articulo citado por el autor, al repositorio del proyecto, al glosario ni a demostraciones.
