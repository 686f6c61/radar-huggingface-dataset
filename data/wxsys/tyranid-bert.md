# wxsys/tyranid-bert

## Resumen

Tyranid-BERT es un encoder bidireccional de 149.509.127 parámetros (etiquetado comercialmente como "164M") derivado de answerdotai/ModernBERT-base y ajustado por el autor wxsys como componente de verificación de código dentro del motor neuro-simbólico Code Oracle. No es un modelo generativo: es un clasificador de texto especializado en evaluar la seguridad de parches de código representados como un DSL de subgrafo linealizado, extraído de AST de Tree-sitter y de componentes fuertemente conexos calculados con el algoritmo de Tarjan. Su pipeline declarado en HuggingFace es text-classification y su propósito es sustituir a agentes de revisión generativa que consumen segundos y producen "ruido" conversacional por un único forward pass determinista.

La relevancia del modelo reside en su planteamiento como "sinapsis" de un sistema mayor: mientras el modelo hermano Qwen-Servitor se ocupa de preprocesar pull requests completos (hasta 262k tokens), Tyranid-BERT actúa como un clasificador ultraligero que diagnostica en menos de 20 ms sobre CPU convencional. Empaquetado en ONNX con cuantización dinámica INT8 (151 MB), evita la dependencia de PyTorch en producción y apunta a entornos de CI/CD donde la latencia y el coste de cómputo son críticos.

El modelo conserva el campo receptivo nativo de 8.192 tokens de ModernBERT y devuelve tres canales de telemetría en una sola pasada: una puntuación de riesgo calibrada, una taxonomía multi-etiqueta de cinco clases de defecto y una estimación de incertidumbre epistémica. Aunque está publicado con licencia Apache 2.0, el repositorio registra cero descargas y cero "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-base) con cabezas multi-tarea |
| Parametros totales | 149.509.127 (pesos safetensors); la model card indica "164M" de forma orientativa |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens nativos (entrada DSL recomendada < 400 tokens; tokenizer con max_length 512 en el ejemplo) |
| Tipos de cuantizacion | INT8 dinámico (Linear/MatMul) para ONNX; FP32 disponible |
| Idiomas soportados | en, code (DSL de subgrafo y metadatos de código) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

La columna vertebral es ModernBERT-base: un encoder bidireccional con attention de tipo FlashAttention con unpadding, embeddings posicionales rotatorios (RoPE) y un campo receptivo nativo de 8.192 tokens. A diferencia de los modelos autorregresivos, Tyranid-BERT no genera texto: procesa la secuencia completa en un solo paso hacia delante y extrae el vector latente [CLS], sobre el que se montan tres cabezas de salida independientes. La primera es una cabeza de riesgo con pérdida MSE que produce una puntuación continua en [0, 1] con temperatura de calibración T = 1.5967. La segunda es una cabeza de taxonomía multi-etiqueta con activación sigmoide y cinco clases: BreakingPublicAPI, SecuritySurface, ConcurrencyHazard, PerformanceRegression y SilentLogicDrift. La tercera es una cabeza de incertidumbre heteroscedástica que modela una log-varianza acotada y funciona como puerta de confianza para señalar entradas fuera de la distribución de entrenamiento.

La información disponible no especifica el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables en un clasificador). Tampoco se documentan la estrategia de fine-tuning ni los hiperparámetros de entrenamiento. La entrada del modelo es un DSL textual que describe el parche: nodos del AST modificados, aristas de llamada, estado de puertas de control y violaciones detectadas. El ejemplo de la model card muestra un fragmento de ese DSL con secciones [DIFF_TARGET], [METADATA], [NODES], [EDGES] y [GATE].

## Capacidades

- Clasificación de riesgo de parches de código: devuelve una puntuación continua calibrada en el rango [0, 1] sobre una sola pasada de inferencia.
- Diagnóstico multi-etiqueta de defectos: identifica simultáneamente cinco categorías de riesgo (BreakingPublicAPI, SecuritySurface, ConcurrencyHazard, PerformanceRegression, SilentLogicDrift) mediante probabilidades sigmoides independientes.
- Estimación de incertidumbre epistémica: emite una varianza heteroscedástica acotada que sirve como puerta de confianza para descartar mutaciones ambiguas o fuera de distribución.
- Procesamiento de grafos de código linealizados: consume el DSL generado a partir de AST de Tree-sitter y componentes fuertemente conexos (SCC) de Tarjan.
- Inferencia de bajísima latencia: menos de 20 ms por forward pass en CPU moderna, sin bucle autorregresivo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de clasificación, no de generación ni de agente.
- Capacidades multilingües limitadas: sólo inglés y material de código; el DSL está en inglés.

## Casos de uso

- Puerta de calidad en pipelines de CI/CD: el modelo puede invocarse desde un job de integración continua para puntuar cada parche antes del merge, usando el score calibrado y el umbral de incertidumbre como criterios automáticos de aceptación o rechazo.
- Priorización de revisiones en equipos grandes: dado que clasifica el tipo de riesgo (API pública rota, superficie de seguridad, condiciones de carrera, regresión de rendimiento o deriva lógica silenciosa), permite enrutar cada pull request al revisor o al equipo especializado adecuado.
- Filtrado previo a revisión humana: al ejecutarse en menos de 20 ms sobre CPU, se puede desplegar como primera barrera que descarta parches triviales y reserva el análisis humano para los casos marcados como dudosos por la cabeza de incertidumbre.
- Preanálisis de parches generados por IA: útil para validar mutaciones producidas por asistentes de código antes de que entren en el repositorio, detectando categorías como SecuritySurface o SilentLogicDrift que un revisor rápido podría pasar por alto.
- Detección de regresiones de rendimiento en servicios críticos: integrado en un sistema de análisis estático, puede marcar cambios en rutas calientes antes de que lleguen a producción.
- Verificación de cambios en APIs públicas: la clase BreakingPublicAPI permite bloquear automáticamente modificaciones que rompan contratos expuestos a terceros.
- Investigación neuro-simbólica: sirve como componente reutilizable para experimentar con la combinación de análisis estático (AST, SCC) y clasificación neuronal calibrada, especialmente por su cabeza de incertidumbre heteroscedástica.
- Despliegue en entornos sin GPU: al distribuirse como grafo ONNX INT8 de 151 MB que sólo requiere onnxruntime, puede ejecutarse en runners de CI modestos o incluso en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona una latencia de menos de 20 ms en CPU y una temperatura de calibración T = 1.5967, pero no incluye métricas de precisión, recall, F1, AUC ni comparaciones cuantitativas con otros modelos de verificación de código.

## Requisitos de hardware

- Inferencia INT8 (ONNX): aproximadamente 151 MB de pesos; cabe holgadamente en cualquier CPU moderna y en GPUs de gama baja con muy poca VRAM libre.
- Inferencia FP32 (ONNX o safetensors): aproximadamente 598 MB de pesos; la VRAM necesaria es del orden de 1-2 GB dependiendo del batch y la longitud de secuencia.
- GPU recomendadas: no requiere GPU para el camino recomendado; si se desea acelerar, cualquier GPU con soporte CUDA sirve, desde tarjetas consumer (RTX 3060 en adelante) hasta A100 o H100 para batch grande.
- Cabe en cualquier GPU consumer: sí, incluso en iGPU para el modelo INT8.
- Opciones de despliegue: onnxruntime (CPU o GPU, camino principal documentado por el autor), y por el formato safetensors vía transformers/PyTorch para fine-tuning o investigación. No se mencionan integraciones con vLLM, TGI, Ollama ni llama.cpp (no aplicables a un modelo de clasificación tipo encoder).
- Latencia estimada: menos de 20 ms por forward pass en CPU moderna con el grafo INT8 y entradas de menos de 400 tokens.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas frente a otros modelos. Las alternativas conceptuales serían el propio answerdotai/ModernBERT-base sin las cabezas multi-tarea, clasificadores de código genéricos o el modelo hermano wxsys/qwen-servitor, pero no se han publicado metricas comparativas objetivas en la informacion disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wxsys/tyranid-bert | 149,5 M | 8.192 | Clasificacion de riesgo de parches | Apache 2.0 | HuggingFace (ONNX + safetensors) |
| answerdotai/ModernBERT-base | ~149 M | 8.192 | Encoder generalista | Apache 2.0 | HuggingFace (modelo base) |
| wxsys/qwen-servitor | no disponible | 262k (segun la model card) | Analisis de pull requests completos | no disponible | HuggingFace (modelo hermano) |

## Limitaciones y advertencias

- Modelo no generativo: no produce texto ni justificaciones; sólo puntuaciones y etiquetas. No debe emplearse para tareas de conversación o generación de código.
- Dominio restringido: está diseñado para consumir el DSL de subgrafo del motor Code Oracle. Fuera de ese formato de entrada su comportamiento es impredecible y probablemente degradado.
- Idiomas limitados a inglés y código: no hay soporte documentado para otros idiomas naturales.
- Sin benchmarks publicados: no se ha demostrado de forma cuantitativa su precisión frente a alternativas, lo que dificulta evaluar su fiabilidad en producción.
- Zero descargas y zero "likes": el repositorio no tiene validación comunitaria; debe tratarse como un artefacto experimental.
- Discrepancia en el recuento de parámetros: la model card indica 164M mientras que los pesos safetensors suman 149.509.127, lo que sugiere que la cifra del README es orientativa.
- Calibración dependiente de la distribución de entrenamiento: aunque la cabeza de incertidumbre pretende detectar entradas fuera de distribución, no hay datos publicados sobre su fiabilidad real.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos o negativos en la clasificación de riesgo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de integrarlo en flujos críticos.
- Sesgos: no hay información publicada sobre sesgos, composición del dataset ni procesos de mitigación.

## Enlaces

- HuggingFace: https://huggingface.co/wxsys/tyranid-bert
- Repositorio del motor Code Oracle: https://github.com/wahyuzero/code-oracle
- Modelo hermano Qwen-Servitor: https://huggingface.co/wxsys/qwen-servitor
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT (referencia del backbone): no disponible en la informacion proporcionada
