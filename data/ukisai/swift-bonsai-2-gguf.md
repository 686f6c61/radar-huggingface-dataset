# ukisai/Swift-Bonsai-2-GGUF

## Resumen

Swift Bonsai 2 es un derivado de razonamiento eficiente del modelo Ternary Bonsai 2 27B de Prism ML, publicado por UkisAI en formato GGUF para llama.cpp. El modelo cuenta con 26.895.998.464 parametros (unos 26,9 B) y se distribuye en dos cuantizaciones ternarias: PTQ1_0 (1 bit, 5,947 GB) y PQ2_0 (2 bits, 7,206 GB). Cada fichero es un modelo completo con la correccion de Swift ya fusionada en los pesos ternarios, sin adaptador ni parche adicional.

La propuesta del modelo es reducir el coste de razonamiento en tokens: segun la model card, emplea un 39,8 % menos de tokens de pensamiento ("thinking tokens") y obtiene un 0,19 % mas de puntuacion que el modelo base. El entrenamiento se basa en identificar tokens marcadores de razonamiento que, segun el analisis del autor, disparan el "overthinking" en los rollouts, y en penalizar su uso durante el razonamiento mediante ajuste fino.

Es relevante para despliegues con presupuesto de memoria muy ajustado, ya que permite ejecutar un modelo de ~27 B en GPUs de consumo gracias a la cuantizacion ternaria. El modelo se publica bajo licencia Apache 2.0, esta etiquetado como experimental y tiene un volumen de adopcion muy bajo (7 descargas y 12 "me gusta" en el momento de la consulta). No se declaran idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado del modelo base Ternary Bonsai 2 27B con pesos ternarios) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1-bit / PTQ1_0 (5,947 GB) y 2-bit / PQ2_0 (7,206 GB); pesos ternarios |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf (relacion: finetune) |
| Tamano del repositorio | 13,2 GB |
| Fecha de publicacion | 22 de septiembre de 2026 (actualizado el 24 de septiembre de 2026) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de transformer, atencion, capas ni dimensiones). Se sabe que es un ajuste fino ("finetune") del modelo prism-ml/Ternary-Bonsai-2-27B-gguf, que trabaja con pesos ternarios, y que Swift Bonsai 2 conserva ese esquema de cuantizacion en las dos variantes publicadas: PTQ1_0 (1 bit por peso) y PQ2_0 (2 bits por peso). No se especifica el numero de tokens de entrenamiento ni la composicion del dataset.

La innovacion declarada es el metodo de entrenamiento: el autor identifico tokens marcadores de razonamiento que, en su analisis, provocan sobrepensamiento ("overthinking") en las trazas de razonamiento del modelo base, y realizo un ajuste fino penalizando el uso de esos tokens mientras el modelo razona. El resultado declarado es una produccion de trazas de razonamiento mas cortas (39,8 % menos de tokens de pensamiento) manteniendo la precision en linea con el modelo base (+0,19 % de puntuacion agregada). No se documenta el uso de RLHF, DPO ni otras tecnicas de alineamiento, ni los hiperparametros del ajuste.

Las dos variantes no son equivalentes en cuanto a historial: segun la model card, PTQ1_0 corresponde a la release Swift anterior, mientras que PQ2_0 contiene pesos fusionados actualizados.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation, etiqueta "conversational").
- Razonamiento explicito con traza de pensamiento optimizada para ser mas corta que la del modelo base.
- Evaluado en tareas de razonamiento cientifico y de conocimiento (GPQA-Diamond), conocimiento en chino (C-Eval), seguimiento de instrucciones (IFBench) y matematicas de competicion (AIME 2025), lo que indica capacidad para razonamiento de multiples pasos y problemas matematicos.
- No se documenta soporte explicito de tool calling ni de function calling.
- No se documenta soporte de agentes ni de flujos multi-paso con herramientas externas.
- Capacidades multilingues: no disponibles (la unica pista es la evaluacion en C-Eval, orientada a chino, pero la ficha no declara idiomas soportados).
- No se documentan capacidades de vision ni de audio.
- Modo de razonamiento ("thinking"): si, es el eje del modelo, orientado a reducir la longitud de la traza.

## Casos de uso

- Razonamiento cientifico asistido: el modelo ha sido evaluado en GPQA-Diamond, por lo que encaja en asistentes de preguntas de nivel posgrado en fisica, quimica y biologia donde el coste por token de razonamiento importa.
- Generacion de codigo con presupuesto de memoria limitado: al ocupar entre 6 y 7,2 GB en disco segun la cuantizacion, puede ejecutarse en una GPU de consumo para autocompletado y generacion de funciones en entornos de desarrollo locales.
- Analisis de documentos con restricciones de hardware: util para procesar textos largos en estaciones de trabajo sin GPU de datacenter; requiere verificar antes la ventana de contexto real, no declarada en la ficha.
- Despliegue en el borde o en portatiles: con llama.cpp y la variante PTQ1_0 es viable en equipos con memoria unificada o GPU modesta, lo que permite asistentes locales sin conexion.
- Prototipado e investigacion sobre razonamiento eficiente: sirve como referencia para estudiar el efecto de penalizar tokens marcadores de razonamiento en trazas largas.
- Evaluacion comparativa de cuantizacion ternaria: las dos variantes (1 bit y 2 bits) permiten medir el compromiso entre tamano y precision en un mismo modelo.
- Sustitucion de modelos de mayor tamano en tareas de matematicas de competicion: la evaluacion en AIME 2025 sugiere uso en entornos educativos o de resolucion de problemas paso a paso.
- No se recomienda para flujos que dependan de tool calling o de agentes, ya que no hay soporte documentado de estas capacidades.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion, pero en la informacion proporcionada aparece truncada: no se han facilitado las puntuaciones numericas por benchmark. Los datos agregados y el protocolo si estan documentados.

| Aspecto | Dato disponible |
|---|---|
| Reduccion de tokens de razonamiento | 39,8 % menos que el modelo base |
| Variacion de puntuacion agregada | +0,19 % respecto al modelo base |
| GPQA-Diamond | 3 ejecuciones completas; puntuaciones no disponibles (tabla truncada) |
| C-Eval | 5 ejecuciones; puntuaciones no disponibles |
| IFBench | 5 ejecuciones; comparacion base PQ2_0 frente a Swift PQ2_0; puntuaciones no disponibles |
| AIME 2025 | 5 ejecuciones; puntuaciones no disponibles |

No se han publicado en la informacion disponible resultados numericos de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB para PTQ1_0 (pesos de 5,947 GB mas cache KV y overhead del runtime) y 8-9 GB para PQ2_0 (pesos de 7,206 GB mas overhead). Son estimaciones de calculo a partir del tamano de fichero; el autor no las publica.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090 pueden cargar ambas variantes con contexto moderado. En GPUs de 8 GB, PTQ1_0 es la opcion mas viable, con contexto reducido.
- GPUs profesionales: A100, H100 y similares son sobredimensionadas para el tamano del modelo, pero utiles si se necesita contexto largo o mucho paralelismo.
- Equipos Apple Silicon con memoria unificada: viables mediante llama.cpp, dado el tamano reducido de los pesos.
- Opciones de despliegue: llama.cpp es el runtime de referencia (library_name: llama.cpp). Ollama y LM Studio pueden cargar GGUF si su version soporta los tipos PTQ1_0 y PQ2_0, que son especificos de llama.cpp. vLLM y TGI no estan confirmados para estos tipos de cuantizacion ternaria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| Swift Bonsai 2 (ukisai) | ~26,9 B | no disponible | 39,8 % menos tokens de razonamiento y +0,19 % de puntuacion agregada frente al base | Apache 2.0 | GGUF (1-bit PTQ1_0, 2-bit PQ2_0) |
| Ternary Bonsai 2 27B (prism-ml) | 27 B (nominal) | no disponible | Referencia base de la comparacion | no disponible en la informacion proporcionada | GGUF |
| Otras alternativas de ~27 B con razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoria (LLM de ~27 B en cuantizacion de muy baja precision orientados a razonamiento) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo etiquetado explicitamente como experimental; no se declara estabilidad ni soporte a largo plazo.
- Cuantizacion ternaria de 1 y 2 bits: es esperable una perdida de precision frente a pesos en FP16 o BF16, aunque el autor afirma que la puntuacion agregada se mantiene por encima del base (+0,19 %). No hay desglose por benchmark para verificarlo con los datos disponibles.
- No se declara la longitud de contexto soportada, lo que impide planificar cargas de trabajo con documentos largos sin pruebas previas.
- No se declaran idiomas soportados; la evaluacion en C-Eval sugiere buen comportamiento en chino, pero no hay confirmacion oficial de cobertura multilingue.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de veracidad ni de tasas de alucinacion.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Los tipos de cuantizacion PTQ1_0 y PQ2_0 son especificos de llama.cpp; pueden no ser compatibles con otros runtimes, lo que limita las opciones de despliegue y de servicio en produccion.
- Adopcion muy baja (7 descargas, 12 "me gusta"), sin evidencia de uso en produccion por terceros ni de validacion independiente.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el fichero LICENSE. No se declaran restricciones adicionales por uso.
- El repositorio ocupa 13,2 GB, aunque cada fichero individual es de 5,947 GB o 7,206 GB; conviene descargar solo la variante necesaria.
- Las fechas del repositorio (septiembre de 2026) son las reportadas por la plataforma y no se han verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Fichero 1-bit / PTQ1_0: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF/resolve/main/Swift-Bonsai-2-PTQ1_0.gguf
- Fichero 2-bit / PQ2_0: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF/resolve/main/Swift-Bonsai-2-PQ2_0.gguf
- Licencia: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF/blob/main/LICENSE
- Modelo base (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Sitio web del autor: https://ukisai.com
- Pagina de producto de Swift: https://ukisai.com/products/swift
