# thalovant/thalovant-m2v-intents

## Resumen

thalovant/thalovant-m2v-intents es un clasificador de intenciones construido sobre embeddings estáticos de la familia Model2Vec y publicado por el autor thalovant para el hub Thalovant. Su función es mapear un enunciado de usuario a una de 133 etiquetas con el formato `<skill_id>:<intent>`, exactamente como las registra `ovos-m2v-pipeline`. No es un modelo generativo: no produce texto, únicamente asigna una etiqueta a una frase de entrada.

El modelo parte de Jarbas/m2v-256-distiluse-base-multilingual-cased-v2, un modelo de embeddings estáticos de 256 dimensiones, y se afina con el entrenador de clasificadores de la librería model2vec. Cuenta con 30.577.920 parámetros y alcanza una exactitud de 0,8052 sobre un conjunto de validación de 9.943 filas repartidas en 48 idiomas y 21 skills. El corpus de entrenamiento se generó el 2026-09-12.

Su interés técnico radica en el coste de inferencia: al no incluir capas transformer ni mecanismos de atención, el cálculo se reduce a una búsqueda en la matriz de embeddings más una operación de pooling y una cabeza de clasificación. Esto permite ejecutarlo íntegramente en CPU, algo relevante para asistentes de voz y sistemas de enrutado de intenciones que necesitan decidir a qué skill derivar una petición sin depender de GPU ni de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (Model2Vec) con vocabulario de 119.445 entradas y dimensión 256; sin capas de atención ni bloques transformer. Cabeza de clasificación entrenada con el trainer de clasificadores de model2vec |
| Parámetros totales | 30.577.920 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de utterance; no existe ventana de contexto autorregresiva) |
| Tipos de cuantización | no disponible (se distribuyen pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni cuantizaciones de 8 o 4 bits) |
| Idiomas soportados | 48 idiomas según la model card; la tabla de evaluación desglosa 47 variantes regionales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería model2vec) |
| Tamaño del repositorio | 0,9 GB |
| Descargas / likes | 388 descargas / 0 likes |
| Pipeline declarado | text-classification |
| Modelo base | Jarbas/m2v-256-distiluse-base-multilingual-cased-v2 |

## Arquitectura y entrenamiento

La arquitectura es un modelo de embeddings estáticos derivado de Model2Vec: cada token del vocabulario tiene un vector de 256 dimensiones y la representación de una frase se obtiene combinando esos vectores (pooling), sin que existan matrices de atención ni capas de propagación. Los 30,58 M de parámetros corresponden casi en su totalidad a la matriz de embeddings (119.445 entradas × 256 dimensiones), a los que se suma la cabeza de clasificación. El modelo base, Jarbas/m2v-256-distiluse-base-multilingual-cased-v2, es a su vez una destilación en formato estático de `distiluse-base-multilingual-cased-v2`, de ahí su cobertura multilingüe.

El ajuste se realizó con el entrenador de clasificadores de model2vec sobre el corpus de la flota Thalovant, construido el 2026-09-12T02:37:35Z y que cubre 21 skills. El modelo conoce exclusivamente las etiquetas de ese corpus: cada una de las 133 clases procede de las skills de Thalovant y de ningún otro origen. El repositorio incluye `labels.json`, con la lista de etiquetas a las que el hub puede enrutar, e `index.json`, que identifica cada frase del corpus de entrenamiento mediante un digest de su idioma y su texto junto con las etiquetas que la publican. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineación, algo coherente con un clasificador discriminativo.

## Capacidades

- Clasificación de intenciones multi-clase cerrada: asigna una de 133 etiquetas con formato `<skill_id>:<intent>` a un enunciado de entrada.
- Cobertura multilingüe: 48 idiomas declarados, con variantes regionales como `an-ES`, `ast-ES`, `gl-ES`, `oc-FR`, `sv-FI`, `pt-BR` y `pt-PT`.
- Inferencia en CPU: al prescindir de capas transformer, no requiere GPU ni aceleradores especializados.
- Integración con el ecosistema OVOS: se configura como pipeline con `"mode": "classifier"` y la ruta del modelo.
- Distribución de etiquetas en `labels.json`, consumible por el hub para decidir el enrutado.
- Trazabilidad de corpus mediante `index.json`: permite detectar frases duplicadas entre skills y consultar la clasificación del resto sin sacar las frases de sus repositorios privados.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling, uso como agente, visión, audio ni modo de pensamiento. Es un clasificador de utterance y su salida se limita a una etiqueta.

## Casos de uso

- Enrutado de intenciones en asistentes de voz OVOS: el pipeline recibe la transcripción del usuario y devuelve la etiqueta `<skill_id>:<intent>` que determina qué skill debe atender la petición. Es adecuado porque trabaja a nivel de utterance y admite las 21 skills de la flota sin lógica adicional.
- Control de calidad en CI/CD de skills: la herramienta `thalovant-skillkit check` usa `index.json` para fallar una skill que publica una frase que otra ya posee, y consulta a este clasificador qué opina del resto de frases sin que estas abandonen sus repositorios privados.
- Detección de colisiones de ownership entre skills: las confusiones documentadas (por ejemplo, `thalovant-skill-weather.thalovant:temperature.weather` leída como `thalovant-skill-local-pulse.thalovant:local.pulse` en 33 casos) sirven como señal para que la flota resuelva solapamientos de vocabulario entre skills.
- Triaje previo de bajo coste antes de un LLM: en arquitecturas con un modelo generativo detrás, este clasificador puede descartar o redirigir peticiones triviales antes de invocar el modelo grande, reduciendo coste y latencia por petición.
- Clasificación de consultas multilingües en despliegues sin GPU: al ejecutarse en CPU y ocupar del orden de 122 MB en fp32, es viable en servidores modestos, contenedores pequeños o dispositivos de borde que atienden usuarios en varios idiomas.
- Etiquetado retroactivo de logs de interacción: aplicar el clasificador al histórico de utterances permite etiquetar conversaciones ya registradas y priorizar el desarrollo de nuevas skills según la frecuencia de cada intención.
- Filtrado y normalización de corpus de entrenamiento: antes de ampliar el corpus de una skill, el clasificador permite comprobar qué frases candidatas se asignarían a intenciones ya existentes en lugar de a la nueva.

## Benchmarks y rendimiento

La model card publica una exactitud agregada en conjunto de validación (*held-out*) de **0,8052** sobre 9.943 filas, 48 idiomas y 21 skills. El desglose por idioma es el siguiente:

| Idioma | Filas | Exactitud |
|---|---:|---:|
| `an-ES` | 211 | 0,9431 |
| `ar-SA` | 208 | 0,7212 |
| `ast-ES` | 207 | 0,9324 |
| `az-AZ` | 220 | 0,7636 |
| `bg-BG` | 209 | 0,8278 |
| `ca-ES` | 250 | 0,8720 |
| `cs-CZ` | 213 | 0,8028 |
| `da-DK` | 220 | 0,8273 |
| `de-DE` | 240 | 0,7958 |
| `el-GR` | 199 | 0,6935 |
| `en-US` | 251 | 0,9283 |
| `es-ES` | 231 | 0,9048 |
| `et-EE` | 206 | 0,6845 |
| `eu-ES` | 252 | 0,7024 |
| `fa-IR` | 236 | 0,7203 |
| `fi-FI` | 212 | 0,7075 |
| `fr-FR` | 248 | 0,8710 |
| `gl-ES` | 237 | 0,9367 |
| `he-IL` | 183 | 0,7596 |
| `hi-IN` | 189 | 0,7778 |
| `hr-HR` | 204 | 0,8235 |
| `hu-HU` | 231 | 0,6623 |
| `id-ID` | 198 | 0,8687 |
| `it-IT` | 214 | 0,8318 |
| `ja-JP` | 217 | 0,7097 |
| `ko-KR` | 205 | 0,7268 |
| `lt-LT` | 182 | 0,7363 |
| `lv-LV` | 218 | 0,7339 |
| `ms-MY` | 200 | 0,8900 |
| `nb-NO` | 206 | 0,8932 |
| `nl-NL` | 252 | 0,8135 |
| `oc-FR` | 216 | 0,8657 |
| `pl-PL` | 221 | 0,7783 |
| `pt-BR` | 225 | 0,9556 |
| `pt-PT` | 212 | 0,9481 |
| `ro-RO` | 204 | 0,8186 |
| `ru-RU` | 210 | 0,8381 |
| `sk-SK` | 206 | 0,8544 |
| `sl-SI` | 207 | 0,7585 |
| `sv-FI` | 27 | 0,9259 |
| `sv-SE` | 232 | 0,8578 |
| `sw-KE` | 188 | 0,7447 |
| `th-TH` | 194 | 0,5206 |
| `tr-TR` | 234 | 0,7863 |
| `uk-UA` | 204 | 0,7647 |
| `vi-VN` | 206 | 0,7670 |
| `zh-CN` | 194 | 0,8196 |

El rango va de 0,5206 en `th-TH` a 0,9556 en `pt-BR`. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, GLUE, XNLI u otros) ni comparaciones cuantitativas contra otros clasificadores de intenciones.

## Requisitos de hardware

- Tamaño de pesos: aproximadamente 122 MB en fp32 (30.577.920 parámetros × 4 bytes) y en torno a 61 MB en fp16. El repositorio completo ocupa 0,9 GB, presumiblemente por artefactos adicionales del entrenamiento.
- VRAM estimada para inferencia: no es necesaria GPU; el modelo puede ejecutarse en memoria principal. En caso de usar GPU, el consumo es mínimo (por debajo de 1 GB contando pesos y activaciones).
- GPU recomendadas: no se especifican. Cualquier GPU, incluida una integrada, es suficiente; no tiene sentido reservar A100, H100 o RTX 4090 para este modelo.
- Cabe en GPU de consumo: sí, en cualquiera, e incluso no requiere una.
- Opciones de despliegue: la librería `model2vec` mediante `StaticModelPipeline.from_pretrained(...)`; integración con OVOS configurando el pipeline con `"mode": "classifier"`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni exportación a ONNX en la información disponible.
- Latencia y throughput: no disponibles. No se publican cifras de latencia por lote ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmark comparables publicados para alternativas de la misma categoría, por lo que la comparación se limita a los datos declarados del propio modelo. La búsqueda web realizada no devolvió resultados relevantes (únicamente páginas de Microsoft y un índice de paquetes de piwheels), de modo que no hay información externa que contrastar.

| Modelo | Tipo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| thalovant/thalovant-m2v-intents | Embeddings estáticos + cabeza de clasificación | 30.577.920 | no disponible | Exactitud 0,8052 en validación (9.943 filas, 48 idiomas) | Apache 2.0 | HuggingFace, 388 descargas, 0 likes |
| Jarbas/m2v-256-distiluse-base-multilingual-cased-v2 | Embeddings estáticos (modelo base, sin cabeza de clasificación) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Clasificadores basados en transformer afinado (XLM-R, mDeBERTa, SetFit) | Transformer encoder + cabeza de clasificación | no disponible | no disponible | no disponible | no disponible | no disponible |

La ventaja estructural del modelo frente a un encoder transformer de tamaño comparable es el coste de inferencia (búsqueda en tabla en lugar de atención cuadrática), a cambio de una capacidad de representación menor que se refleja en las confusiones documentadas. No hay datos públicos que permitan cuantificar esa diferencia de exactitud.

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo conoce las 133 etiquetas del corpus de la flota Thalovant, procedentes de 21 skills. Cualquier utterance fuera de ese conjunto se forzará a una de las clases existentes, con el consiguiente falso positivo.
- Confusiones documentadas: los pares `thalovant-skill-weather` y `thalovant-skill-local-pulse` se solapan de forma sistemática (33, 32, 30, 29, 26, 24 y 22 casos en los ejemplos publicados). Es un problema de solapamiento de vocabulario entre skills, no solo del clasificador.
- Idiomas con rendimiento bajo: `th-TH` (0,5206), `hu-HU` (0,6623), `et-EE` (0,6845), `el-GR` (0,6935), `eu-ES` (0,7024), `fa-IR` (0,7203) y `fi-FI` (0,7075) quedan claramente por debajo de la media. No se recomienda su uso en tailandés o húngaro sin evaluación propia.
- Muestra pequeña en algunos idiomas: `sv-FI` solo aporta 27 filas de validación, por lo que su 0,9259 tiene un intervalo de confianza muy amplio y no debe extrapolarse.
- Ausencia de evaluación fuera de dominio: no se publican métricas de generalización a utterances de usuarios reales distintas del corpus de la flota.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de etiquetado incorrecto con alta confianza aparente, ya que el modelo siempre devuelve una clase.
- Sesgos: no se documentan análisis de sesgo demográfico, dialectal ni de género. La cobertura por variante regional es desigual (por ejemplo, hay `es-ES` pero no otras variantes del español americano).
- Licencia: Apache 2.0 permite uso comercial del modelo, pero la licencia del modelo base y la del corpus de entrenamiento no se detallan en la información disponible y conviene verificarlas antes de un despliegue comercial.
- Validación comunitaria escasa: 0 likes y 388 descargas en el momento de la consulta, con creación el 2026-09-08 y última actualización el 2026-09-12. Es un artefacto reciente y con poca revisión externa.
- Dependencia del hub: el modelo está diseñado para funcionar con las etiquetas y el corpus de Thalovant; reutilizarlo en otro dominio exige reentrenar la cabeza de clasificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thalovant/thalovant-m2v-intents
- Modelo base: https://huggingface.co/Jarbas/m2v-256-distiluse-base-multilingual-cased-v2
- Archivos del repositorio citados en la model card: `labels.json` (etiquetas a las que el hub puede enrutar) e `index.json` (identificación de cada frase del corpus de entrenamiento). Disponibles dentro del repositorio del modelo.
- Proyecto OVOS y `ovos-m2v-pipeline`: mencionados en la model card como consumidores del modelo; no se proporciona URL en la información disponible.
- Librería model2vec: mencionada como `library_name` del modelo; no se proporciona URL en la información disponible.
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a páginas de Microsoft y al índice de piwheels, sin relación con el modelo).
- No se han localizado papers, blogs técnicos ni demos asociados al modelo en la información proporcionada.
