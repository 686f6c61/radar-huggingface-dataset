# tavialiu/CAD-models

## Resumen

CAD-models es un repositorio de checkpoints de clasificacion para la deteccion de instrucciones maliciosas en texto (prompt injection directa e indirecta) publicado por Buzhao Liu (usuario `tavialiu`) junto al articulo *Robust Context-Aware Detection of Malicious Instructions in Text* (Liu, Ma y Vorobeychik, 2026). No es un modelo generativo: cada checkpoint es una cabeza MLP a nivel de frase con arquitectura 2048 → 256 → 128 → 2, entrenada sobre embeddings congelados dependientes de consulta y contexto procedentes de `jinaai/jina-embeddings-v3`. El encoder no se distribuye en este repositorio y queda sujeto a su propia licencia.

El problema que aborda es la deteccion de instrucciones inyectadas en contenido que un agente consume (paginas web, correos, mensajes de Slack, resultados de busqueda) y que pueden redirigir su comportamiento. La innovacion principal es la triple variante de entrenamiento: una cabeza base (`classifier_fullcad.pt`, entrenada con 24.665 filas originales) y dos familias de cabezas con entrenamiento adversarial, una con perturbaciones en el espacio de features y otra con parafraseo generado por LLM, parametrizadas por un ratio alpha.

Es relevante ahora porque la seguridad de agentes es una linea de trabajo activa y este repositorio se integra directamente con el benchmark AgentDojo (suites `banking`, `slack` y `travel`). El repositorio es de publicacion reciente (18 de septiembre de 2026), con 0 descargas y 0 me gusta, 0,1 GB de tamano y licencia MIT. La model card no publica metricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MLP a nivel de frase (2048 → 256 → 128 → 2) sobre embeddings congelados de `jinaai/jina-embeddings-v3`; no es un transformer generativo |
| Parametros totales | Aproximadamente 0,56 M por checkpoint (557.312 pesos + 386 sesgos = 557.698 parametros, calculo derivado de las dimensiones declaradas; el autor no publica la cifra). El repositorio contiene 23 checkpoints |
| Parametros activos | No aplica: no es una arquitectura MoE |
| Longitud de contexto | No disponible. La clasificacion opera a nivel de frase; el limite practico depende del encoder, cuyas especificaciones no se detallan en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. Solo se distribuyen pesos en punto flotante (`.pt`); no hay variantes GGUF, AWQ, GPTQ ni INT8/INT4 |
| Idiomas soportados | Ingles (`en`), segun la model card |
| Licencia | MIT para los checkpoints. El encoder `jinaai/jina-embeddings-v3` no se incluye y se rige por su propia licencia |
| Formato de pesos | PyTorch (`.pt`), con `model_state_dict`, `input_dim`, `d_hid`, `dropout` y `best_threshold`; las cabezas adversariales anaden `nested_alpha_training` |

Ficheros incluidos en el repositorio:

| Ruta | Descripcion |
|---|---|
| `classifier_fullcad.pt` | Clasificador CAD entrenado sobre `training_data_original` |
| `feature_space/head_ft_perturbed_only_a{alpha}_s0.pt` | Entrenamiento adversarial en espacio de features; alpha en {0,001; 0,0025; 0,005; 0,01; 0,05; 0,1; 0,2; 0,3; 0,4; 0,5; 0,6; 0,7; 0,8} (13 variantes) |
| `llm_paraphrase/head_ft_paraphrase_injection_a{alpha}_s0.pt` | Entrenamiento adversarial con parafraseo por LLM; alpha en {0,001; 0,0025; 0,005; 0,01; 0,05; 0,1; 0,2; 0,3; 0,4} (9 variantes) |

## Arquitectura y entrenamiento

La arquitectura es deliberadamente ligera: una cabeza MLP con capas de 2048, 256 y 128 unidades y salida de 2 clases, aplicada sobre representaciones ya calculadas. Los embeddings de entrada son "query-aware" y "context-aware", es decir, codifican conjuntamente la consulta del agente y el texto donde podria aparecer la instruccion, y se mantienen congelados durante el entrenamiento de la cabeza. Esto desacopla el coste de computo (dominado por el encoder) del clasificador, que se entrena y ejecuta de forma muy barata. La dimension de entrada declarada es 2048.

El entrenamiento parte de `classifier_fullcad.pt`, ajustado sobre 24.665 filas originales de `training_data_original`. Sobre esa base se construyen dos familias de cabezas adversarias. En `feature_space/` se anaden filas adversariales generadas mediante perturbaciones en el espacio de embeddings; en `llm_paraphrase/` se anaden filas generadas por parafraseo con un LLM. En ambos casos el parametro alpha se define como el numero de filas adversariales anadidas dividido entre el numero de filas originales (24.665), y cada checkpoint registra su configuracion de entrenamiento anidada. Cada checkpoint almacena ademas un umbral de decision calibrado (`best_threshold`), lo que permite ajustar el punto de operacion sin reentrenar. No se documentan en la informacion disponible ni la composicion detallada del dataset, ni el numero de tokens, ni si se empleo RLHF o DPO (tecnicas propias de modelos generativos, no aplicables directamente a esta cabeza).

## Capacidades

- Clasificacion binaria a nivel de frase de instrucciones maliciosas, incluyendo prompt injection directa e indirecta.
- Deteccion sensible al contexto: el mismo texto se evalua en funcion de la consulta del agente, lo que permite discriminar contenido legitimo de instrucciones inyectadas.
- Umbral de decision ajustable por checkpoint mediante el valor `best_threshold` almacenado.
- Robustez adversarial configurable: 13 variantes en espacio de features y 9 variantes con parafraseo por LLM, cada una con su ratio alpha, lo que permite explorar el compromiso entre robustez y falsos positivos.
- Integracion con el benchmark AgentDojo mediante `scripts/run_agentdojo_benchmark.sh` para las suites `banking`, `slack` y `travel`.
- No genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene capacidades de vision, audio ni modo de pensamiento.

## Casos de uso

- Filtrado de contenido recuperado en pipelines RAG: antes de insertar un documento recuperado en el prompt del agente, se pasa cada frase por el clasificador junto con la consulta del usuario para descartar instrucciones inyectadas en la fuente.
- Guardrail en agentes con herramientas: en un agente que lee correo, Slack o paginas web, el clasificador actua como capa de deteccion entre la herramienta y el modelo generativo, marcando frases sospechosas antes de que lleguen a la ventana de contexto.
- Evaluacion de robustez y red teaming: las 22 cabezas adversariales permiten medir como varia la tasa de deteccion al aumentar la fraccion de ejemplos adversarios en entrenamiento (alpha de 0,001 a 0,8), lo que sirve para caracterizar el coste en precision de cada estrategia de defensa.
- Auditoria y trazabilidad de seguridad: registrar que frases han superado el umbral `best_threshold` en un despliegue permite construir un historial de intentos de manipulacion sobre el que hacer analisis forense.
- Cribado de corpus para investigacion: filtrar conjuntos de datos de texto o trayectorias de agentes para cuantificar la presencia de instrucciones maliciosas antes de usarlos en experimentos.
- Defensa en cascada: dado su bajo coste (cabeza de 0,56 M de parametros sobre embeddings reutilizables si el encoder ya esta en el pipeline), puede ejecutarse sobre cada frase sin penalizacion apreciable frente al coste del encoder.
- Validacion de proveedores de contenido: ejecutar el clasificador sobre el contenido servido por una fuente externa para decidir si se mantiene la integracion en un agente de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el script `scripts/run_agentdojo_benchmark.sh` para las suites `banking`, `slack` y `travel` de AgentDojo, pero no incluye cifras de precision, recall, F1, tasa de ataque exitoso ni comparaciones numericas con otras defensas. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM para la cabeza del clasificador: inferior a 10 MB en FP32 (557.698 parametros, aproximadamente 2,2 MB de pesos). Se ejecuta sin problema en CPU.
- VRAM para el encoder: no disponible en la informacion proporcionada. El encoder `jinaai/jina-embeddings-v3` no se incluye en el repositorio y su coste de inferencia no se documenta; es el componente dominante en memoria y computo de todo el pipeline.
- GPU recomendadas: no disponible. La cabeza no exige GPU; la eleccion depende exclusivamente del encoder que se decida usar para generar los embeddings.
- Encaje en GPU de consumo: no disponible para el conjunto completo, al depender del encoder. La cabeza por si sola no requiere GPU.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo. El despliegue previsto es inferencia PyTorch mediante el repositorio CAD: descarga con `hf download tavialiu/CAD-models --local-dir outputs/models`, definicion de la variable `CLASSIFIER_WEIGHT_PATH` y ejecucion de los scripts del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos verificables de modelos alternativos en la informacion disponible, por lo que las celdas de los comparables quedan como no disponibles. La comparativa se limita a la categoria funcional de cada alternativa.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAD (`tavialiu/CAD-models`) | Cabeza MLP de deteccion de instrucciones maliciosas sobre embeddings congelados | Aproximadamente 0,56 M por checkpoint (derivado) | No disponible (nivel de frase) | MIT (encoder aparte) | HuggingFace, 23 checkpoints |
| ProtectAI deberta-v3-base-prompt-injection (familia) | Clasificador de prompt injection | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| Meta Prompt Guard / Prompt Guard 2 | Clasificador de prompt injection y jailbreak | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| Soluciones comerciales de guardrails (Lakera, Rebuff, LlamaFirewall) | Guardrails de aplicacion | No disponible | No disponible | Propietaria o no disponible | No disponible |

Nota: la busqueda web realizada no devolvio resultados tecnicos utilizables (unicamente enlaces a Facebook), de modo que no ha sido posible contrastar especificaciones de los modelos comparables.

## Limitaciones y advertencias

- Solo ingles: no hay evidencia de soporte multilingue para este clasificador, aunque el encoder subyacente pueda ser multilingue.
- No es un modelo generativo: no produce texto, no ejecuta herramientas y no puede utilizarse como sustituto de un LLM en ninguna tarea de generacion.
- Dependencia de un encoder externo no incluido: la reproducibilidad exacta exige descargar `jinaai/jina-embeddings-v3` y respetar su licencia, que es independiente de la MIT de los checkpoints.
- Ausencia total de metricas publicadas en la model card: no hay forma de evaluar la precision, el recall ni la tasa de falsos positivos a partir de la informacion proporcionada.
- Riesgo de falsos positivos y falsos negativos: el punto de operacion depende del valor `best_threshold` de cada checkpoint y de la variante alpha elegida; no se documenta una recomendacion por defecto.
- Seleccion de checkpoint no resuelta: con 23 cabezas disponibles (1 base, 13 en espacio de features y 9 con parafraseo), el usuario debe decidir el compromiso robustez/precision sin guia cuantitativa publicada.
- Sesgos de dominio: el entrenamiento usa un unico dataset (`tavialiu/CAD-data`) del que no se detalla composicion, procedencia ni cobertura, por lo que el comportamiento fuera de ese dominio es incierto.
- Madurez temprana: 0 descargas y 0 me gusta, publicacion y ultima actualizacion el mismo dia (18 de septiembre de 2026), sin validacion independiente por parte de la comunidad.
- Referencia bibliografica no localizable: el articulo se cita como preprint de arXiv con ano 2026, pero no se proporciona identificador arXiv ni DOI, por lo que no puede verificarse la version publicada.
- Licencia: MIT permite uso comercial de los checkpoints, pero no cubre el encoder ni el dataset, cuyas condiciones deben comprobarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tavialiu/CAD-models
- Dataset: https://huggingface.co/datasets/tavialiu/CAD-data
- Codigo del proyecto CAD: https://github.com/tavia-liu/CAD
- Encoder requerido (licencia independiente): https://huggingface.co/jinaai/jina-embeddings-v3
- Articulo: Liu, Buzhao; Ma, Xinhang; Vorobeychik, Yevgeniy. *Robust Context-Aware Detection of Malicious Instructions in Text*, arXiv preprint, 2026. No disponible identificador arXiv ni DOI en la informacion proporcionada.
- Resultados de busqueda web: no se encontraron enlaces tecnicos relevantes; los resultados devueltos correspondian a paginas de inicio de sesion de Facebook y no aportan informacion sobre el modelo.
