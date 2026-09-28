# willykeenan/banking-intent-classifier

## Resumen

El Banking Intent Classifier es un clasificador supervisado clásico para 77 intenciones bancarias en inglés, publicado en HuggingFace por William Keenan dentro del proyecto Waggle and Kea. No es un modelo de lenguaje ni un transformer afinado: combina características TF-IDF de unigramas y bigramas de palabra con n-gramas de carácter de 3 a 5, y las alimenta a un clasificador SGD con pérdida logarítmica y semilla fija (20260805). El resultado es un artefacto entrenable y ejecutable íntegramente en CPU.

El modelo se apoya en el dataset público BANKING77 de PolyAI y se distribuye con el vocabulario ajustado, los valores IDF, los pesos del clasificador, las etiquetas y el código de reproducción. El paquete incluye además un mecanismo de verificación que recarga el artefacto y comprueba que las predicciones de referencia se reproducen exactamente.

Su relevancia es doble. Por un lado, ofrece una línea base fuerte y ligera para clasificación de intenciones (macro-F1 de 0,9119 en la población de evaluación filtrada de 3.050 consultas), útil cuando no se justifica el coste de un transformer. Por otro, sirve como pieza de investigación en el benchmark complementario Agent Handoff Benchmark, orientado a medir si un agente recibe información suficiente para preservar una decisión de enrutado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo lineal clasico de scikit-learn: vectorizacion TF-IDF (unigramas y bigramas de palabra + n-gramas de caracter de 3 a 5) seguida de un clasificador SGD con perdida logaritmica |
| Parametros totales | No disponible (no es una red neuronal; el artefacto contiene vocabulario TF-IDF, valores IDF y pesos lineales por clase, sin que se publique el numero exacto de caracteristicas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificacion por consulta individual; no hay ventana de contexto) |
| Tipos de cuantizacion | No aplica (no se publican variantes cuantizadas ni formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles unicamente (segun la model card, sin generalizacion demostrada a otros idiomas) |
| Licencia | MIT para el paquete y el codigo de William Keenan; el dataset BANKING77 sigue siendo de PolyAI bajo CC BY 4.0 |
| Formato de pesos | skops (`model.skops`, cargable con `skops.io`); se acompanan `labels.json`, `verification.json`, `requirements.txt` y scripts de reproduccion |

## Arquitectura y entrenamiento

El pipeline es puramente clasico. Las consultas se vectorizan con dos espacios de caracteristicas combinados: TF-IDF sobre unigramas y bigramas de palabra, y TF-IDF sobre n-gramas de caracter de 3 a 5. Sobre esa representacion dispersa se ajusta un clasificador SGD con perdida logaritmica y semilla canonica congelada 20260805, con serializacion mediante `skops.io`. El paquete final contiene el vocabulario ajustado, los valores IDF, los pesos del clasificador, las etiquetas de clase, un ejemplo de inferencia y el codigo de reproduccion. No hay descodificacion especulativa, atencion lineal ni ningun componente neuronal.

Los datos proceden de BANKING77 (PolyAI), con 9.971 ejemplos de entrenamiento tras el filtrado descrito por el autor. La evaluacion se realiza sobre 3.050 consultas de test unicas y no ambiguas, obtenidas tras excluir el solapamiento normalizado entre entrenamiento y test; el split de test oficial tiene 3.080 filas, por lo que las cifras publicadas no son directamente comparables con resultados de leaderboards sin filtrar. La receta de entrenamiento se conserva del commit publico `54041045c82953cbbabac155b150a0f7b7ed5603` del repositorio waggle-kea. No se emplearon datos de bancos, empleadores ni clientes, y no se ha realizado RLHF ni DPO, dado que no se trata de un modelo generativo.

La verificacion incluida reproduce cada etiqueta top-1 de referencia y las probabilidades top-3 redondeadas a partes por millon, y comprueba que las probabilidades son identicas tras guardar y recargar los 3.050 casos. El autor califica explicitamente estos resultados como exploratorios: el diseno original se informo con el rendimiento agregado en test, por lo que no constituye una replicacion independiente ni un experimento confirmatorio.

## Capacidades

- Clasificacion de texto en una de 77 intenciones bancarias en ingles (por ejemplo, tarjeta no recibida o cambio de PIN).
- Salida de probabilidades por clase mediante `predict_proba`, con columnas alineadas con `labels.json` y con `model.classes_`.
- Calculo de acierto top-3 util para enrutado con validacion posterior.
- Ejecucion en CPU con Python 3.12 y las versiones de dependencia fijadas en `requirements.txt`.
- Carga segura del artefacto mediante comprobacion de tipos no confiables con `sio.get_untrusted_types`.
- Reproduccion bit a bit del pipeline de entrenamiento y de las predicciones de referencia con `reproduce.py`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No incluye deteccion de intencion desconocida ni mecanismo de abtencion: toda entrada recibe obligatoriamente una de las 77 etiquetas.

## Casos de uso

- Enrutado de consultas en atencion al cliente bancaria: el clasificador asigna cada mensaje entrante a una de las 77 intenciones y permite dirigirlo al equipo o al flujo automatizado correspondiente, con un coste de computo minimo al ejecutarse en CPU.
- Filtro previo a un LLM generativo: usar la prediccion como router reduce el numero de llamadas al modelo grande, ya que solo las consultas ambiguas o de baja confianza (por ejemplo, top-1 poco separada de top-2) se derivan al modelo costoso.
- Linea base reproducible en investigacion: sirve como referencia en experimentos de clasificacion de intenciones, con hash de artefacto y verificacion de predicciones, lo que facilita la comparacion entre metodos.
- Triaje y etiquetado de tickets en mesas de ayuda: clasificacion masiva de historicos de tickets para poblar colas, generar estadisticas por intencion o priorizar incidencias recurrentes.
- Investigacion sobre handoff entre agentes: combinado con el Agent Handoff Benchmark, permite estudiar si la informacion transferida a un agente es suficiente para preservar la decision de enrutado.
- Analisis de calibracion y umbrales de derivacion: con un ECE de 0,1467 en 15 bins, permite estudiar umbrales de confianza para derivar casos a revision humana, siempre teniendo en cuenta que las probabilidades no son estimaciones de riesgo fiables.
- Docencia y prototipado de NLP clasico: ilustra un pipeline completo de TF-IDF mas SGD con serializacion skops, control de semilla y protocolo de reproduccion, sin requerir GPU.
- Despliegue en entornos sin GPU o en el borde: al no necesitar acelerador, puede integrarse en servicios ligeros o en contenedores pequenos donde no cabe un transformer.

## Benchmarks y rendimiento

Evaluacion sobre 3.050 consultas de test unicas y no ambiguas (poblacion filtrada documentada por el autor).

| Metrica | Modelo palabra + caracter | Baseline publicado solo palabra |
|---|---:|---:|
| Macro-F1 | 0,9119 | 0,8915 |
| Accuracy | 0,9115 | 0,8915 |
| Accuracy top-3 | 0,9744 | 0,9708 |
| Log loss | 0,4434 | 0,5848 |
| Error de calibracion esperado, 15 bins | 0,1467 | 0,2106 |

El baseline solo palabra es una referencia historica; el paquete no lo reentrena ni lo distribuye. El autor advierte que las cifras son exploratorias y que, al aplicar sobre una poblacion filtrada de 3.050 filas en lugar del split oficial de 3.080, no deben compararse directamente con resultados de leaderboards sin filtrar. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, y no serian aplicables a un clasificador de intenciones.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el modelo no requiere GPU en ninguna fase.
- VRAM estimada: no aplica; no se publican requisitos de memoria acelerada.
- GPU recomendadas: ninguna. Cualquier GPU seria irrelevante para este artefacto.
- Compatibilidad con GPU de consumo: no aplica, al no existir ruta de ejecucion en GPU en el paquete.
- Memoria en disco: el repositorio ocupa 0,0 GB segun HuggingFace (menos de 0,1 GB); no se detalla el peso exacto del artefacto en memoria.
- Entorno de ejecucion: Python 3.12 con `requirements.txt`, carga via `skops.io`; se incluye `predict.py` como ejemplo de linea de comandos.
- Opciones de despliegue: integracion directa como objeto scikit-learn dentro de un servicio Python. No hay integracion con `transformers.pipeline()`, ni endpoint de inferencia alojado, ni soporte declarado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un modelo lineal disperso en CPU, el coste por consulta es bajo, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Macro-F1 / accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| willykeenan/banking-intent-classifier | TF-IDF palabra + caracter con SGD | No disponible | No aplica | 0,9119 / 0,9115 (test filtrado de 3.050) | MIT (paquete), BANKING77 CC BY 4.0 | HuggingFace, artefacto skops |
| Baseline solo palabra citado en la model card | TF-IDF solo palabra con SGD | No disponible | No aplica | 0,8915 / 0,8915 (misma poblacion) | No aplica | No se distribuye; referencia historica |
| Fine-tunes de transformers sobre BANKING77 (por ejemplo, codificadores de frases) | Transformer afinado | No disponible en la informacion proporcionada | No disponible | No disponible | Variable segun el modelo | Existen en el ecosistema, pero no se aportan cifras comparables verificadas en esta busqueda |

No se dispone de datos verificados en la informacion proporcionada para comparar con alternativas de transformer sobre BANKING77. La unica comparacion con cifras es la del baseline solo palabra de la propia model card.

## Limitaciones y advertencias

- Solo ingles. No hay generalizacion demostrada a otros idiomas.
- Obligatoriedad de etiqueta: toda entrada recibe una de las 77 clases. No existe detector de intencion desconocida ni abtencion entrenada, por lo que las entradas fuera de distribucion se clasifican igualmente.
- Las probabilidades no son estimaciones de riesgo fiables; el ECE de 0,1467 en 15 bins indica una calibracion imperfecta. No deben usarse como umbral de decision sensible sin recalibracion.
- Resultados exploratorios: el diseno original se informo con el rendimiento agregado en test. No es una replicacion independiente ni una afirmacion de estado del arte.
- Las cifras se calculan sobre una poblacion filtrada de 3.050 consultas, no sobre el split oficial de 3.080, por lo que no son comparables con leaderboards sin filtrar.
- Sin validacion para decisiones financieras de cara al cliente ni para acciones bancarias autonomas.
- Sin generalizacion demostrada a productos bancarios actuales, ruido natural de cliente o entradas fuera de distribucion.
- Los vocabularios TF-IDF contienen caracteristicas aprendidas del texto fuente publico; el modelo no es una transformacion que preserve la privacidad de ese texto.
- Licencia MIT para el paquete y el codigo, pero BANKING77 sigue siendo de PolyAI bajo CC BY 4.0: al usar o redistribuir hay que conservar `THIRD_PARTY_NOTICES.md` y la atribucion de origen. El repositorio no incluye texto crudo de entrenamiento ni de test.
- La carga del artefacto requiere comprobar tipos no confiables con skops antes de deserializar; conviene mantener ese paso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willykeenan/banking-intent-classifier
- Dataset del benchmark complementario: https://huggingface.co/datasets/willykeenan/agent-handoff-benchmark
- Repositorio del proyecto Waggle and Kea: https://github.com/willykeenan/waggle-kea
- Commit con la receta de entrenamiento: https://github.com/willykeenan/waggle-kea/tree/54041045c82953cbbabac155b150a0f7b7ed5603
- Dataset BANKING77 de PolyAI: https://huggingface.co/datasets/PolyAI/banking77
- Fuente original del dataset: https://github.com/PolyAI-LDN/task-specific-datasets/tree/57ec275d8078af65b7731c2a98be812d844a6d6b
- Cita de origen: Inigo Casanueva, Tadas Temcinas, Daniela Gerz, Matthew Henderson e Ivan Vulic, 2020, *Efficient Intent Detection with Dual Sentence Encoders*, Proceedings of the 2nd Workshop on NLP for ConvAI (sin enlace directo proporcionado en la model card)
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los unicos enlaces verificables son los de la model card y el repositorio del autor.
