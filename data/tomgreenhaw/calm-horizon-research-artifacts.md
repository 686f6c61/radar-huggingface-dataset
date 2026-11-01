# tomgreenhaw/calm-horizon-research-artifacts

## Resumen

CALM Horizon research artifacts es un paquete de artefactos de investigación publicados por tomgreenhaw sobre el modelo base `google/gemma-4-12B-it-qat-q4_0-unquantized`. No es un modelo en sí, sino un conjunto de pesos auxiliares entrenados que alimentan el CALM Horizon Workbench, una herramienta de interpretabilidad y seguridad. Incluye un autoencoder disperso (SAE) sobre la capa 24, una sonda de peligro con su calibración, una J-lens de transporte por capas y cabezas de borrador con vocabulario reducido para decodificación especulativa.

El interés del paquete reside en que expone de forma abierta instrumentos de interpretabilidad mecanicista aplicados a un modelo de 12.000 millones de parámetros cuantizado con QAT, algo poco habitual. El autor documenta tanto los resultados obtenidos como los fallos conocidos de cada artefacto, con métricas concretas sobre conjuntos como XSTest. La licencia es Apache-2.0 y el repositorio ocupa 2,1 GB, pero el modelo base no se distribuye aquí: debe descargarse por separado del repositorio de Google.

El modelo base es un transformer denso de 12.000 millones de parámetros con cuantización QAT de 4 bits, del que no se detallan en la información disponible ni la longitud de contexto, ni los idiomas, ni los datos de entrenamiento. Por tanto, esta ficha describe principalmente los artefactos y sus mediciones, no las capacidades del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefactos auxiliares (SAE, sonda lineal, J-lens ridge, cabezas de borrador) sobre un transformer denso base (Gemma 4 12B) |
| Parametros totales | No disponible para el modelo base; el SAE tiene 30.720 características (expansión 8× sobre d=3.840) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El modelo base es QAT q4_0 sin cuantizar en origen (`-unquantized`); los artefactos se distribuyen en checkpoints PyTorch (`.pt`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch (`.pt`), más `MANIFEST.json` con rutas, tamaños y SHA-256 |

## Arquitectura y entrenamiento

El paquete contiene cuatro componentes. El SAE es un TopK sparse autoencoder sobre el flujo residual crudo de la capa 24 de 48, con 30.720 características y codificación `encode(h − input_mean)` con la escala de activación plegada en los pesos. Se entrenó con activaciones residuales del modelo base sobre un corpus propio de código, ingeniería y conversación. La sonda de peligro es un clasificador lineal sobre las características del SAE que puntúa tres etapas (mensaje del usuario, pensamiento del modelo y respuesta en generación), con dos umbrales por etapa: por encima del inferior se ablacionan las características impulsoras y por encima del superior se rechaza la respuesta. La J-lens es un transporte ridge por capa (`horizon_jlens_v1`) que proyecta el residual de cada capa a la capa final para leer qué "habría dicho" cada capa a través del unembedding. Las cabezas de borrador (K=4) y el vocabulario de borrador de 15.440 tokens se injertan en el modelo para decodificación especulativa.

El autor documenta hallazgos metodológicos relevantes: la correlación de rango entre magnitud de activación de una característica y su efecto causal fue de −0,08 (medido en el modelo de investigación de 1B), y la ablación de las características de un concepto solo lo elimina parcialmente. Es decir, la magnitud de activación no predice importancia y conviene usar pruebas causales. Las etiquetas de características son heurísticas y muchas son genéricas (por ejemplo, `code syntax / punctuation`), y los pasajes de ejemplo usados para derivarlas no se publican. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Interpretabilidad mecanicista: diccionario de 30.720 características sobre la capa 24 con etiquetas cortas y los tokens que más activan cada una.
- Detección de contenido peligroso en tres etapas (mensaje, pensamiento y respuesta) con umbrales de ablación y rechazo calibrados.
- Lectura por capas: la J-lens permite inspeccionar qué predicción "latente" tiene cada capa antes de llegar a la salida.
- Decodificación especulativa: cabezas de borrador K=4 con vocabulario reducido de 15.440 tokens para acelerar la generación.
- Verificación de integridad: `MANIFEST.json` con SHA-256 de cada archivo y una herramienta de descarga que valida hashes.
- No se documentan en la información disponible capacidades de generación, tool calling, agentes, visión ni audio del modelo base; estas corresponden a Gemma 4 12B y no a este repositorio.

## Casos de uso

- Auditoría de seguridad en pipelines de inferencia: la sonda de peligro se puede insertar entre el mensaje del usuario y la generación para ablacionar características peligrosas o cortar la respuesta, con umbrales calibrados a una tasa de falsos positivos objetivo del 1 % sobre 127 prompts cotidianos.
- Investigación en interpretabilidad: el SAE y sus etiquetas permiten estudiar qué direcciones del residual de la capa 24 se asocian a sintaxis de código, credenciales o excepciones, usando pruebas causales de ablación en lugar de magnitud de activación.
- Análisis de flujo neuronal por capas: la J-lens sirve para construir paneles tipo Neural Flux que muestran cómo evoluciona la predicción a lo largo de las 48 capas del modelo.
- Aceleración de inferencia: las cabezas de borrador y el vocabulario reducido permiten montar decodificación especulativa sobre el modelo base para reducir la latencia de generación en producción.
- Evaluación comparativa de sondas: la calibración publicada (AUROC 0,875 en XSTest con fraseo emparejado, frente a 0,94 de una sonda sobre residual crudo en la misma capa) permite comparar diseños de clasificadores de seguridad.
- Reproducibilidad de experimentos: el manifiesto con SHA-256 y el script `tools/download_artifacts.py` facilitan replicar el entorno del Workbench en un clon del repositorio de GitHub.
- Formación y docencia: el paquete ilustra de forma práctica las limitaciones de los SAE y de las sondas lineales, incluida la separación por fraseo superficial.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Sonda de peligro, split retenido de su propia distribución | AUROC 1,0 (engañoso: separable por fraseo; en el modelo 1B un baseline con las tres primeras palabras separaba un benchmark similar) |
| Sonda de peligro, XSTest con fraseo emparejado (250 seguros, 200 inseguros), umbrales de mensaje | AUROC 0,875; 125 de 200 inseguros rechazados (62,5 %) y 14 más ablacionados; 19 de 250 seguros sobree rechazados (7,6 %) y 8 más ablacionados |
| Sonda de peligro, conjunto local de peligro | 90 de 100 rechazados |
| Sonda sobre residual crudo en la misma capa (referencia, no es este artefacto) | AUROC 0,94 con fraseo emparejado |
| Calibración cotidiana, etapa mensaje (ablate 0,500 / refuse 0,535) | 1 de 127 turnos rechazados |
| Calibración cotidiana, etapa respuesta (ablate 0,690 / refuse 0,786) | 1 de 127 turnos rechazados |
| Calibración cotidiana, etapa pensamiento (ablate 0,820 / refuse 0,826, provisional) | 0 de 19 turnos rechazados |
| Correlación de rango activación-efecto causal (modelo 1B) | −0,08 |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Los artefactos ocupan 2,1 GB en total; el modelo base Gemma 4 12B debe descargarse aparte y su huella en VRAM depende de la cuantización empleada (QAT q4_0 en origen), no disponible en la información proporcionada.
- Para cargar los checkpoints `.pt` se necesita PyTorch; la sonda, el SAE y la J-lens se ejecutan sobre activaciones del modelo, por lo que requieren el modelo base cargado en memoria.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo base (12B) se intuye necesidad de GPUs de gama alta o cuantización agresiva, pero no hay datos concretos.
- Despliegue: el flujo documentado es un clon del repositorio de GitHub más `python tools/download_artifacts.py`, que valida SHA-256 contra `MANIFEST.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CALM Horizon research artifacts (este) | Artefactos de interpretabilidad y seguridad sobre Gemma 4 12B | SAE de 30.720 características; modelo base 12B | No disponible | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| google/gemma-4-12B-it-qat-q4_0-unquantized | Modelo base | 12B | No disponible | Apache-2.0 según la model card | Repositorio de Google en HuggingFace |
| Sonda sobre residual crudo en la capa 24 | Clasificador de referencia citado por el autor | No disponible | No aplica | No disponible | No es un artefacto distribuido; solo se cita su AUROC de 0,94 |

No se dispone de información sobre otros paquetes de artefactos de interpretabilidad comparables en la información proporcionada.

## Limitaciones y advertencias

- La sonda de peligro no es una garantía de seguridad ni una frontera de seguridad: cualquiera que ejecute el código puede desactivarla.
- Reacciona en parte a palabras peligrosas y no solo a la intención, como muestran los resultados con fraseo emparejado (7,6 % de sobree rechazo en prompts seguros y 62,5 % de rechazo en inseguros).
- Los umbrales son específicos de este modelo, esta plantilla de prompt y esta calibración; cambiar la página de conocimiento, la plantilla o el modelo exige recalibrar.
- Los umbrales de la etapa de pensamiento descansan en solo 19 turnos y son provisionales; el autor recomienda recalibrar con `tools/calibrate_hazard.py --think on`.
- La AUROC de 1,0 en el split retenido es engañosa por separabilidad de fraseo; no debe citarse como evidencia de robustez.
- Las etiquetas del SAE son heurísticas y a menudo genéricas; los pasajes de ejemplo no se publican, lo que dificulta validar qué contexto rastrea cada característica.
- La magnitud de activación no predice importancia (correlación de rango −0,08) y la ablación de un concepto solo lo elimina parcialmente: hay que usar pruebas causales.
- Los prompts peligrosos de entrenamiento no se distribuyen, lo que limita la reproducibilidad exacta de la sonda.
- Los checkpoints PyTorch pueden ejecutar código al cargarse; deben validarse contra `MANIFEST.json` antes de abrirlos.
- El modelo base no se incluye en el repositorio y sus datos de contexto, idiomas y benchmarks no están disponibles en la información proporcionada.
- Licencia Apache-2.0 para los artefactos; conviene verificar por separado los términos del modelo base de Google para uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tomgreenhaw/calm-horizon-research-artifacts
- Repositorio GitHub del CALM Horizon Workbench: https://github.com/tgreenhaw5/calm-horizon-research
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- XSTest (conjunto de evaluación citado, CC BY 4.0): no disponible enlace directo en la información proporcionada
- Papers 1 y 2 citados por el autor (hallazgos de activación y ablación): no disponible enlace en la información proporcionada
