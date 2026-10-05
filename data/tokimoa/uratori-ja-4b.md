# tokimoa/uratori-ja-4b

## Resumen

uratori-ja-4b es un modelo japones de decision disenado para devolver distribuciones de probabilidad en lugar de texto generado. Desarrollado por el usuario tokimoa, se construye sobre la parte de modelo de lenguaje de Qwen/Qwen3.5-4B (42,1 millones de parametros activos en total 4.211.695.617) y ha sido ajustado mediante LoRA sobre todas las capas lineales con rank 32, integrado en los pesos finales. Su proposito es resolver tareas de verificacion de hechos, grounding contra evidencia aportada, comparacion de dos documentos y juicios dentro de pipelines RAG, devolviendo en un unico forward la respuesta sin generar ni un solo token.

El modelo cubre tres tipos de pregunta: `noul` (si/no con probabilidad calibrada), `choice` (seleccion multiple entre 2 y 8 candidatos) y `score` (evaluacion ordinal de 2 a 10 niveles con valor esperado). Esta pensado como filtro previo para enrutar casos hacia un LLM mayor o hacia revision humana, no como decisor autonomo. La ventana de entrada esta limitada a 1.280 tokens y, si se supera, el modelo lanza un `ValueError` en lugar de truncar.

Es relevante ahora porque ataca un problema concreto de los sistemas RAG en japones: la necesidad de juzgar relevancia, suficiencia y fidelidad de las respuestas de forma barata y calibrada. Frente a la alternativa propietaria TypeSafe Jev 1.13.0, obtiene 0,867 de accuracy en el conjunto test, un valor inferior pero con licencia Apache 2.0 y pesos abiertos. Forma parte de una serie con versiones de 310M (ejecutable en CPU) y 2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (parte de lenguaje de Qwen3.5-4B) con cabeza de clasificacion personalizada |
| Parametros totales | 4.211.695.617 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.280 tokens de entrada (sin truncado; error si se supera) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y conserva su componente de modelo de lenguaje, al que anade una cabeza de decision que produce distribuciones de probabilidad sobre criterios definidos en tiempo de inferencia. En lugar de generar texto autoregresivamente, realiza un unico forward pass que devuelve, segun el tipo de pregunta, la probabilidad de "si" (`noul`), un vector de probabilidades sobre candidatos (`choice`) o un valor esperado junto con probabilidades y confianza (`score`). Las preguntas incluidas en una misma llamada se evaluan de forma independiente entre si.

El ajuste se realizo con LoRA sobre todas las capas lineales con rank 32, posteriormente integrado en los pesos. Los datos de entrenamiento combinan aproximadamente 20.000 ejemplos derivados de JNLI (del benchmark JGLUE, licencia CC BY-SA 4.0) reformateados al esquema de decision, junto con unos 50.000 ejemplos sinteticos generados principalmente con DeepSeek V4.1 Flash. La model card indica que los documentos del conjunto de evaluacion no se usaron en el entrenamiento. No se detalla el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Decision binaria si/no (`noul`) con probabilidad calibrada por temperatura, desactivable con `calibrate=False`.
- Seleccion multiple (`choice`) entre 2 y 8 candidatos, devolviendo opcion, probabilidades y confianza.
- Evaluacion ordinal (`score`) de 2 a 10 niveles, con valor esperado, distribucion y confianza.
- Verificacion de grounding: comprobar si una afirmacion queda soportada, contradicha o resulta indeterminable respecto a una evidencia dada.
- Comparacion entre dos documentos o entradas.
- Juicios para RAG: relevancia de resultados de busqueda, suficiencia de la evidencia y fidelidad de una respuesta.
- Referencia a fragmentos nombrados del estado de entrada mediante claves (`` `clave` ``) desde el enunciado de la pregunta.
- Procesamiento por lotes de varias preguntas independientes en una sola llamada.
- No es un modelo generativo: no produce texto, no hace tool calling y no soporta agentes multi-paso por si mismo.
- No admite vision ni audio; es exclusivamente texto en japones.

## Casos de uso

- Verificacion de fidelidad en RAG: dado el contexto recuperado y la respuesta candidata de un LLM, uratori-ja-4b devuelve la probabilidad de que la respuesta este soportada por el contexto, permitiendo descartar alucinaciones antes de mostrarla al usuario.
- Filtrado de relevancia en recuperacion: puntuar cada documento recuperado frente a la consulta para reordenar o descartar resultados poco pertinentes antes de pasarlos a un modelo mayor.
- Deteccion de contradicciones documentales: comparar dos versiones de un mismo texto (por ejemplo, dos clausulas de un contrato o dos politicas internas) y detectar incompatibilidades mediante preguntas de tipo `noul` o `choice`.
- Triage en atencion al cliente: clasificar consultas y decidir si la respuesta propuesta por el sistema satisface la peticion, enrutando los casos de baja confianza a agentes humanos.
- Moderacion y cumplimiento normativo: comprobar si un texto cumple requisitos declarados (por ejemplo, si una descripcion cumple las condiciones de una politica) usando el tipo de pregunta "requisitos del texto".
- Automatizacion de QA interno: validar que respuestas de un asistente corporativo se apoyan solo en la documentacion oficial, con la posibilidad de aceptar solo el 30-50% de mayor confianza para elevar la precision hasta 0,97-0,98.
- Etiquetado asistido a escala: generar etiquetas de si/no, categoria u ordinal sobre grandes volumenes de texto japones a unos 100 ms por elemento en una RTX 5090 con batch 8.
- Construccion de senales de calibracion: usar las probabilidades y la confianza como entrada para umbrales de aceptacion o para un segundo modelo mas costoso en cascada.

## Benchmarks y rendimiento

Resultados en el conjunto tokimoa/uratori-ja-eval (el modelo card indica intervalos de confianza del 95% por bootstrap a nivel de familia):

| Conjunto | N | Accuracy | Macro F1 | ECE |
|---|---|---|---|---|
| test | 802 | 0.867 (0.847-0.886) | 0.859 | 0.040 |
| challenge | 300 | 0.863 (0.825-0.900) | 0.855 | 0.053 |

Comparacion de accuracy con alternativas sobre el mismo conjunto:

| Modelo | test | challenge |
|---|---|---|
| Jev 1.13.0 (TypeSafe, medida el 2026-10-05) | 0.903 | 0.900 |
| uratori-ja-4b | 0.867 | 0.863 |
| uratori-ja-2b | 0.766 | 0.800 |
| uratori-ja-310m | 0.704 | 0.697 |
| Linea base mas frecuente por tipo y numero de candidatos | 0.446 | 0.430 |

Desglose por tipo de pregunta en test (accuracy): noul 0.887, choice 0.840, score 0.884.

Desglose por uso en test (accuracy): verificacion de grounding 0.867, comparacion de entradas 0.891, juicios RAG 0.843, requisitos del texto 0.845.

Rendimiento con aceptacion por umbral de confianza (accuracy segun fraccion aceptada):

| Fraccion aceptada | 30% | 50% | 70% | 100% |
|---|---|---|---|---|
| test | 0.975 | 0.973 | 0.948 | 0.867 |
| challenge | 1.000 | 0.973 | 0.967 | 0.863 |

Latencia medida: aproximadamente 100 ms por elemento en RTX 5090 con batch 8.

## Requisitos de hardware

- VRAM estimada: unos 12 GB en bfloat16 con la implementacion de referencia.
- GPU recomendadas: cualquier GPU con 12 GB o mas de memoria; la model card cita RTX 5090 para las mediciones, aunque el modelo deberia caber en RTX 4080, RTX 4090, RTX 5090, A100, H100 y similares.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas (por ejemplo RTX 4080/4090/5090 y equivalentes de portatil con suficiente VRAM).
- La version ligera de la misma serie, uratori-ja-310m, funciona en CPU; no se indica lo mismo para la version 4b.
- Opciones de despliegue: transformers con `trust_remote_code=True` e instalacion de `torch` y `transformers>=5.18`. El repositorio incluye un servidor HTTP en github.com/tokimoa/uratori. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: ~100 ms por elemento en RTX 5090 con batch 8. No se publica throughput agregado ni consumo de memoria por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy test / challenge | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uratori-ja-4b | 4,21B | 1.280 tokens | 0.867 / 0.863 | Apache 2.0 | Pesos abiertos en HuggingFace |
| uratori-ja-2b | no disponible | no disponible | 0.766 / 0.800 | Apache 2.0 (presumible, no confirmado) | Pesos abiertos en HuggingFace |
| uratori-ja-310m | no disponible | no disponible | 0.704 / 0.697 | Apache 2.0 (presumible, no confirmado) | Pesos abiertos en HuggingFace, ejecutable en CPU |
| Jev 1.13.0 (TypeSafe) | no disponible | no disponible | 0.903 / 0.900 | Propietaria (API) | Servicio, no hay pesos abiertos conocidos |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (clasificacion y decision en japones para grounding y RAG) dentro de la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo solo juzga a partir de los textos de entrada: no verifica hechos contra su propio conocimiento, por lo que no sirve como comprobador de verdad absoluto.
- No es preciso como decisor autonomo. La model card recomienda usarlo como etapa previa que derive los casos de baja confianza a un LLM mayor o a revision humana.
- Es exclusivamente japones y no soporta imagenes ni audio.
- La ventana de entrada de 1.280 tokens es corta; entradas mas largas provocan un `ValueError` sin truncado automatico.
- Licencia Apache 2.0, compatible con uso comercial, pero conviene revisar los terminos del modelo base Qwen3.5-4B y de JNLI (CC BY-SA 4.0) si se redistribuyen datos derivados.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.
- El repo ocupa 8,5 GB y esta en bfloat16, sin versiones cuantizadas publicadas, lo que limita el despliegue en entornos con poca memoria.
- Riesgo de sesgos heredados de los datos sinteticos generados por LLM y de JNLI; no se documenta una evaluacion de sesgos.
- Los valores de la comparativa estan medidos por el propio autor; no hay validacion independiente publicada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tokimoa/uratori-ja-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Version ligera 2b: https://huggingface.co/tokimoa/uratori-ja-2b
- Version ligera 310m: https://huggingface.co/tokimoa/uratori-ja-310m
- Conjunto de evaluacion: https://huggingface.co/datasets/tokimoa/uratori-ja-eval
- Codigo (entrenamiento, evaluacion, servidor HTTP): https://github.com/tokimoa/uratori
- JNLI (JGLUE): https://github.com/yahoojapan/JGLUE
- TypeSafe Jev (referencia comparativa): no disponible
