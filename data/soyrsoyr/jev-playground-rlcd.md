# soyrsoyr/jev-playground-rlcd

## Resumen

jev-playground-rlcd es un clasificador de decisión calibrado, publicado por el usuario soyrsoyr, que implementa de forma local y abierta el contrato de "modelo de decisión System One" descrito para los modelos de la clase Jev. No es un modelo generativo: recibe un texto de estado y un conjunto de preguntas tipadas (Noul, binaria sí/no; Choice, conjunto cerrado de etiquetas; Score, niveles ordenados) y devuelve distribuciones de probabilidad calibradas sobre las etiquetas definidas en la petición, incluidas etiquetas no vistas durante el entrenamiento (zero-shot). El artefacto principal es la distribución completa; el valor de `confidence` se deriva de ella y no procede de una cabeza aprendida aparte.

Técnicamente es un ajuste fino de MoritzLaurer/deberta-v3-large-zeroshot-v2.0, un encoder DeBERTa-v3-large con cabeza de entailment (NLI), por lo que hereda la arquitectura transformer con atención desenredada del modelo base. El entrenamiento se hizo sobre datos sintéticos: 5.000 estados (tickets de soporte y reseñas de producto) y 40.000 pares pregunta-respuesta con distribuciones de referencia exactas por construcción, optimizando una regla de puntuación propia (cross-entropy sobre objetivos suaves, con opción de Brier).

Su relevancia actual es acotada pero concreta: ofrece calibración medible (ECE agregado de 0,0139 en validación) en un componente de decisión pequeño que se puede servir en local, con licencia MIT, sin depender de un LLM generativo. El repositorio ocupa 2,1 GB e incluye además un checkpoint secundario de 82 M parámetros (cross-encoder/nli-distilroberta-base) para ejecución en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (clasificador de secuencias NLI, cabeza de entailment); ajuste fino de MoritzLaurer/deberta-v3-large-zeroshot-v2.0 |
| Parametros totales | Aproximadamente 435 M, segun el modelo base DeBERTa-v3-large (dato no confirmado en la model card). El repo incluye ademas un checkpoint de 82 M (`cross-encoder/nli-distilroberta-base`) bajo `distilroberta/` |
| Longitud de contexto | 256 tokens (max-length usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (entrenamiento y checkpoint en fp32) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias estandar basado en DeBERTa-v3-large, reutilizado desde el checkpoint zero-shot de MoritzLaurer, que a su vez se apoya en una cabeza de inferencia de lenguaje natural (entailment). DeBERTa-v3 combina atención desenredada (contenido y posicion tratados por separado) con un preentrenamiento tipo ELECTRA con gradient-disentangled embedding sharing. El modelo no genera texto: produce logits sobre el par (estado, hipotesis) que se reformulan internamente como las preguntas tipadas del contrato.

El entrenamiento se realizo sobre el dataset sintetico soyrsoyr/jev-playground-rlcd-v0: 5.000 estados sinteticos (tickets de soporte y resenas de producto), 40.000 pares de entrenamiento, con preguntas tipadas cuyas distribuciones de referencia son exactas por construccion e incluyen cortes de incertidumbre crisp/weak/contradictory en proporcion 70/20/10. El objetivo es cross-entropy sobre objetivos suaves (log score) aplicado a la cabeza de entailment, con variante Brier disponible via `--loss brier`. Los hiperparametros documentados son: learning rate diferencial (cabezas 2e-5 / encoder 1e-5), warmup lineal con decaimiento, batch 8, max-length 256, precision fp32 y 2 epocas. El entrenamiento completo se ejecuto en una AMD RX 7900 XT bajo WSL2 + ROCm en aproximadamente 19 minutos; tambien se incluye una ejecucion de 82 M parametros con cross-encoder/nli-distilroberta-base (800 pasos, CPU). La innovacion tecnica destacable es el uso de una regla de puntuacion propia contra distribuciones de referencia exactas, en lugar de entrenar una cabeza de confianza separada.

## Capacidades

- Clasificacion zero-shot sobre conjuntos de etiquetas definidos en la peticion, incluidas etiquetas no vistas en entrenamiento.
- Tres contratos de pregunta: Noul (binaria si/no), Choice (conjunto cerrado de etiquetas) y Score (niveles ordenados).
- Devuelve distribuciones de probabilidad completas sobre las etiquetas; el campo `confidence` se deriva de la distribucion, no de una cabeza aprendida.
- Calibracion medida: ECE agregado de validacion 0,0139, con ligero sesgo hacia la infra-confianza (modo de fallo conservador).
- Soporte multi-etiqueta: varias preguntas tipadas en una misma peticion HTTP sobre el mismo estado.
- No dispone de generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al ingles (plantillas de entrenamiento en ingles).

## Casos de uso

- Triaje de tickets de soporte: con una pregunta Noul ("este ticket es urgente, P1 o bloqueante") el modelo devuelve una probabilidad calibrada en lugar de una etiqueta binaria, lo que permite fijar umbrales de escalado con una ECE conocida (0,0139 en distribucion).
- Enrutamiento a equipos: con una pregunta Choice y criterios tipados (por ejemplo, hardware frente a software), el modelo asigna un ticket al equipo propietario devolviendo la distribucion completa, util para enrutado con reglas de desempate o derivacion a humano cuando la distribucion es plana.
- Clasificacion de resenas de producto: el dataset de entrenamiento incluye resenas de producto, de modo que se puede usar para extraer atributos como sentimiento, motivo de devolucion o categoria de queja sin anotar datos propios.
- Priorizacion por niveles ordenados: con preguntas Score (severidad, NPS, urgencia en niveles) el modelo produce una distribucion sobre una escala ordenada, adecuada para colas de trabajo con SLAs escalonados.
- Etiquetado zero-shot de corpus no anotados: al aceptar etiquetas definidas en la peticion, permite pre-anotar grandes volumenes de texto para revision humana posterior, reduciendo el coste de arranque de un proyecto de anotacion.
- Componente de decision en pipelines de automatizacion: por su tamano (aproximadamente 435 M parametros) y su licencia MIT, se puede desplegar en local junto a un orquestador que consuma `POST /v1/systemone` para decisiones de clasificacion auditables.
- Moderacion y filtrado con umbrales: al exponer distribuciones en lugar de etiquetas duras, permite aplicar umbrales de seguridad ajustables por aplicacion y calcular el coste esperado de falsos positivos y falsos negativos.
- Pre-filtrado barato antes de un LLM: usar el clasificador para descartar o encaminar casos antes de invocar un modelo generativo mas caro, reservando el LLM para los casos con distribucion ambigua.

## Benchmarks y rendimiento

Validacion held-out: 500 estados / 4.536 pares, comparado con el mismo modelo base sin ajustar.

| Tipo de pregunta | Metrica | Base (MoritzLaurer/deberta-v3-large-zeroshot-v2.0) | jev-playground-rlcd |
|---|---|---|---|
| Noul (si/no) | Accuracy | 0,731 | 0,999 |
| Noul (si/no) | L1 medio frente a ground truth | 0,273 | 0,085 |
| Choice (conjunto cerrado) | Accuracy | 0,510 | 0,998 |
| Choice (conjunto cerrado) | L1 medio frente a ground truth | 0,226 | 0,048 |
| Score (niveles ordenados) | Accuracy | 0,898 | 0,978 |
| Score (niveles ordenados) | L1 medio frente a ground truth | 0,134 | 0,065 |

ECE agregado de validacion: 0,0139 (ligeramente infra-confiado). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generativos en la informacion disponible; estos no aplican a un clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamano del checkpoint, no publicadas por el autor): en fp32, en torno a 1,8-2 GB; en fp16/bf16, en torno a 0,9-1,2 GB; en int8, en torno a 0,5 GB. El checkpoint de 82 M parametros incluido en el repo requiere aproximadamente 0,3 GB en fp32.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM para el modelo grande en fp16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100 (estas ultimas sobredimensionadas para este tamano). El autor entrenó el modelo en una AMD RX 7900 XT (20 GB) bajo WSL2 + ROCm.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en CPU con el checkpoint de 82 M parametros. El autor reporta una ejecucion completa de 800 pasos en CPU para el modelo destilado.
- Opciones de despliegue: servidor propio `jev-playground-serve` (backend DeBERTa), pipeline `text-classification` de transformers y los tags `endpoints_compatible`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI; llama.cpp y Ollama no son aplicables a un encoder de clasificacion de este tipo sin conversion adicional.
- Latencia y throughput: no disponibles. La unica referencia temporal publicada es el entrenamiento (~19 minutos en una RX 7900 XT) y los 800 pasos en CPU del modelo destilado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calibracion / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-playground-rlcd | ~435 M (heredados del base) | 256 tokens (entrenamiento) | ECE 0,0139; accuracy 0,999 (noul), 0,998 (choice), 0,978 (score) en validacion interna | MIT | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| MoritzLaurer/deberta-v3-large-zeroshot-v2.0 | ~435 M (DeBERTa-v3-large) | no disponible en la informacion proporcionada | Base sin ajustar: accuracy 0,731 (noul), 0,510 (choice), 0,898 (score) en la validacion del autor | no disponible en la informacion proporcionada | HuggingFace |
| cross-encoder/nli-distilroberta-base (incluido en el repo) | 82 M | no disponible en la informacion proporcionada | Incluido en el repo como ejecucion alternativa; sin metricas publicadas en la model card | no disponible en la informacion proporcionada | HuggingFace |
| facebook/bart-large-mnli (alternativa habitual para zero-shot) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace |

La comparacion de rendimiento solo es valida dentro del protocolo de validacion del autor (500 estados sinteticos y 4.536 pares); no hay evaluaciones en benchmarks publicos comparables entre estos modelos.

## Limitaciones y advertencias

- La calibracion es valida en distribucion, es decir, sobre la distribucion de plantillas sinteticas de entrenamiento. En texto fuera de distribucion se degrada de forma acusada: el autor reporta que un ticket P1 redactado de forma ad hoc obtiene una puntuacion noul de aproximadamente 0,13 en lugar de aproximadamente 0,9, y que las distribuciones de tipo Score se aplanan hacia la uniforme.
- Sesgo hacia la infra-confianza: el ECE agregado es negativo (el modelo se queda corto al expresar confianza), lo que es un modo de fallo conservador pero puede requerir recalibrado de umbrales.
- Plantillas en ingles unicamente; no hay soporte multilingue y las plantillas determinan el comportamiento del modelo.
- Aplica la "jaggedness" documentada para la clase Jev: fechas interpretadas como texto, conteo por forma y sensibilidad a perturbaciones adversarias en el estado de entrada.
- Los datos de entrenamiento son completamente sinteticos (tickets de soporte y resenas de producto), lo que introduce riesgo de sobreajuste al estilo de esas plantillas y de transferencia pobre a dominios reales (legal, medico, tecnico especializado).
- No es un modelo generativo: no puede redactar respuestas, ejecutar herramientas ni razonar en varios pasos. Usarlo para esas tareas no es viable.
- Riesgo de alucinacion no aplica en el sentido generativo, pero existe el riesgo equivalente de asignar alta probabilidad a una etiqueta incorrecta cuando la pregunta esta mal formulada o las instrucciones son ambiguas; el contrato exige etiquetas e instrucciones claras.
- La licencia es MIT, sin restricciones para uso comercial documentadas. La licencia del modelo base debe verificarse por separado antes de un despliegue comercial.
- Adopcion practicamente nula: 0 descargas y 0 likes, sin validacion independiente de los resultados publicados. El repositorio se creo y actualizo en septiembre de 2026 segun los metadatos de HuggingFace.
- El repositorio ocupa 2,1 GB porque incluye pesos en fp32 y un checkpoint adicional destilado; conviene descargar solo el subdirectorio `deberta-large/*`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/jev-playground-rlcd
- Dataset de entrenamiento: https://huggingface.co/datasets/soyrsoyr/jev-playground-rlcd-v0
- Repositorio del proyecto: https://github.com/soyr-redhat/jev-playground
- Modelo base: https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v2.0
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante para este modelo; los resultados devueltos correspondian a contenidos sin relacion con el dominio de clasificacion de texto o con el proyecto.
