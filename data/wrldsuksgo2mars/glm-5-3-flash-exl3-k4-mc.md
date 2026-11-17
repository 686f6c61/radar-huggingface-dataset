# wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-MC

## Resumen

GLM-5.3-Flash-EXL3-K4-MC es una cuantizacion comunitaria del modelo zai-org/GLM-5.3-Flash-BF16, un transformer de tipo mixture-of-experts (MoE) con capacidad multimodal imagen-texto desarrollado originalmente por Zhipu AI (zai-org). El checkpoint, publicado por el usuario wrldsuksgo2mars, aplica cuantizacion EXL3 en formato MCG a 4 bits sobre los expertos enrutados y ofrece tres variantes del nucleo denso (BF16 original, EXL3 8 bits y EXL3 6 bits) dentro del mismo repositorio, seleccionables en tiempo de carga.

El modelo resuelve el problema del coste de despliegue de un MoE de gran tamano: los pesos originales en BF16 ocupan cientos de gigabytes, mientras que esta version reduce los expertos a 4 bits y permite elegir el coste del nucleo denso segun las restricciones de memoria y latencia del entorno. Con 90.784.970.846 parametros totales y un repositorio de 189,6 GB, esta pensado para servir en infraestructura con GPUs de datacenter y para flujos de codigo, razonamiento y uso de herramientas.

Es relevante ahora porque combina un modelo base reciente y multimodal con una tecnica de cuantizacion agresiva pero calibrada sobre datos representativos (codigo, matematicas, esquemas de function calling y texto multilingue), y porque su formato multi-core permite reutilizar los mismos expertos cuantizados con distintos niveles de precision en el nucleo sin duplicar el payload masivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (imagen-texto), con atencion KDA/MLA, indexer DSA, torre de vision y capa MTP |
| Parametros totales | 90.784.970.846 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 MCG K4 (expertos enrutados y MTP), nucleo denso en BF16 nativo, EXL3 8 bits o EXL3 6 bits |
| Idiomas soportados | no disponible (el dataset de calibracion incluye texto multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors (vistas `original`, `k8-compact`, `k6-compact`) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con torre de vision, atencion KDA y MLA, un indexer DSA, capas densas y compartidas de feed-forward, embeddings, routers y normas, ademas de una capa MTP (multi-token prediction). La cuantizacion no modifica esa topologia: mantiene nativos la torre de vision, las puertas y convoluciones KDA, kv_b, el indexer DSA, los embeddings, mHC, routers y normas. Solo se cuantizan a EXL3 MCG K4 las 37.152 matrices gate/up/down de los expertos enrutados (incluidos los de la capa MTP), y opcionalmente el nucleo denso a 6 u 8 bits.

El proceso de calibracion uso el dataset wrldsuksgo2mars/agentic-quant-panel-v1, con 1.426 prompts y 1.097.737 tokens de codigo real, matematicas resueltas, esquemas de llamadas a funciones y texto multilingue, con renderizado nativo de Flash en modo thinking y esfuerzo maximo de razonamiento, orden original, batch uno y sin padding, packing ni truncado. La herramienta fue un fork de GPTQModel (tpurtell/GPTQModel) con soporte upstream para GLM core y Flash core/MTP; el pase K8 del nucleo requiere una extension del adaptador K1-K8 aun no integrada upstream. El metodo aplica congruencia block-Hadamard firmada con computo FP64 y almacenamiento FP32, con semilla 787 y regularizacion Hessiana sigma 0,025.

## Capacidades

- Generacion de texto y razonamiento multimodal imagen-texto, con pipeline `image-text-to-text`.
- Razonamiento en modo thinking con esfuerzo de razonamiento configurable (usado en la calibracion a esfuerzo maximo).
- Generacion de codigo y matemeticas, segun la composicion del dataset de calibracion.
- Soporte de function calling y esquemas de herramientas (el panel de calibracion incluye esquemas de llamadas a funciones).
- Capacidades de agente y razonamiento multi-paso, coherentes con el uso previsto del panel agentico.
- Prediccion multi-token (MTP) mediante la capa dedicada del modelo base.
- Capacidades multilingues: el dataset de calibracion incluye texto multilingue, aunque no se detallan los idiomas exactos.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para revision, generacion de parches y tests, apoyandose en su entrenamiento sobre codigo real y su soporte de function calling.
- Asistentes de razonamiento matematico: util para resolver problemas paso a paso en modo thinking, con la ventaja de que la calibracion incluyo matematicas resueltas para preservar esa capacidad tras la cuantizacion.
- Agentes con uso de herramientas: el formato permite desplegar agentes multi-paso que invocan APIs mediante esquemas de function calling, con el nucleo denso elegido segun el presupuesto de latencia.
- Procesamiento de documentos con imagenes: al conservar la torre de vision nativa, puede usarse para tareas de image-text-to-text como extraccion de datos de capturas o diagramas.
- Despliegue en infraestructura con memoria limitada: la vista `k6-compact` reduce el nucleo al minimo almacenado (154,2 GiB de payload) para entornos donde el BF16 completo no cabe.
- Servicio de atencion al cliente tecnica: conversaciones multi-turno con contexto largo y soporte multilingue, aprovechando el modo thinking para respuestas complejas.
- Evaluacion e investigacion de cuantizacion: el repositorio incluye recibos de procedencia y validacion (`quantization-provenance.json`, `package-validation.json`), util para estudiar el impacto de EXL3 K4 en un MoE grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el payload de tensores de la vista `original` es de 163,6 GiB, el de `k8-compact` 156,1 GiB y el de `k6-compact` 154,2 GiB; son tamanos de almacenamiento, no requisitos de GPU en tiempo de ejecucion.
- Los expertos enrutados ocupan 145,6 GiB (aproximadamente el 89,0% de la vista `original`), incluyendo escalas y multiplicadores EXL3.
- No cabe en GPUs de consumo (RTX 4090, 24 GB); requiere GPUs de datacenter con memoria agregada muy superior, como multiples A100/H100.
- Opciones de despliegue: el autor indica cuteafd con soporte de vistas MC (`CORE_VIEW=original|k8-compact|k6-compact`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-K4-MC (este) | 90.784.970.846 | no disponible | EXL3 K4 expertos + nucleo BF16/K8/K6 | MIT | Hugging Face, runtime cuteafd |
| zai-org/GLM-5.3-Flash-BF16 (base) | no disponible | no disponible | BF16 nativo | no disponible | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion a 4 bits de los expertos puede degradar la calidad respecto al modelo BF16 original; no se han publicado benchmarks que cuantifiquen esa perdida.
- El runtime requerido es cuteafd con soporte de vistas MC; no hay confirmacion de compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- El pase K8 del nucleo depende de una extension del adaptador aun no integrada en el repositorio upstream de GPTQModel, lo que puede complicar la reproducibilidad.
- La licencia MIT se aplica al checkpoint publicado, pero no se detalla la licencia del modelo base zai-org/GLM-5.3-Flash-BF16; conviene verificar las condiciones del modelo original antes de uso comercial.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- Riesgo de alucinacion inherente a los modelos generativos, no cuantificado en la informacion disponible.
- El modelo tiene pocas descargas (101) y un solo like, por lo que la validacion comunitaria es escasa.
- El repositorio ocupa 189,6 GB, lo que exige almacenamiento considerable incluso antes de cargar el modelo en memoria.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-MC
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Dataset de calibracion: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Runtime cuteafd: https://github.com/tpurtell/cuteafd
- Formato MC: https://github.com/tpurtell/cuteafd/blob/dev/docs/mc-checkpoints.md
- Cuantizador GPTQModel (fork): https://github.com/tpurtell/GPTQModel
- PR upstream GLM core: https://github.com/ModelCloud/GPTQModel/pull/3609
- PR upstream Flash core/MTP: https://github.com/ModelCloud/GPTQModel/pull/3611
- PR fork K1-K8: https://github.com/tpurtell/GPTQModel/pull/5
