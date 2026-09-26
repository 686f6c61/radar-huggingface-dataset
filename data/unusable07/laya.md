# UNUSABLE07/laya

## Resumen

Laya es un modelo de decision de tipo "System 1" no autoregresivo, publicado en Hugging Face bajo el identificador UNUSABLE07/laya y con el pipeline text-classification. A diferencia de los modelos generativos, no produce texto: recibe un estado (texto, correo electronico, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tambien tipadas acompanadas de probabilidades calibradas en un unico forward pass de aproximadamente 33 ms.

El modelo esta orientado a enrutamiento, clasificacion, puntuacion, moderacion y guardrails, y cubre mas de 100 idiomas mediante un componente Router que detecta el idioma y el sistema de escritura y deriva el texto al checkpoint correspondiente. Su entrenamiento se basa en aprendizaje por refuerzo contra reglas de puntuacion estrictamente propias (RLCD), de modo que la unica estrategia que maximiza la recompensa es reportar probabilidades honestas; al no generar texto, no hay salida que parsear ni margen para la alucinacion.

El checkpoint declarado en safetensors tiene 421.293.830 parametros (unos 421 M) y el repositorio ocupa 2,4 GB. Resulta relevante porque plantea una alternativa determinista y de baja latencia a los LLM generativos en decisiones estructuradas, con licencia Apache 2.0 para uso comercial. Como contrapartida, el repositorio no registra descargas ni likes, el campo de idiomas no esta poblado en los metadatos y no se han publicado resultados en benchmarks estandar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de decision no autoregresivo, tipo System 1; pipeline text-classification) |
| Parametros totales | 421.293.830 (aproximadamente 421 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en laya-multilingual con max_len=8192; limite por defecto de 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; runtime con soporte ONNX y ruta rapida TileLang para GPU) |
| Idiomas soportados | Mas de 100 idiomas segun la model card; el campo de idiomas del repositorio no esta poblado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (numero de capas, dimension del modelo, tipo de atencion). Lo que si se especifica es que se trata de un modelo de decision no autoregresivo: procesa estado y preguntas en un unico forward pass y emite respuestas tipadas (por ejemplo, choice, score o noul) con probabilidades asociadas, sin decodificacion secuencial. El sistema se distribuye con varios checkpoints (english y multilingual, ademas del ajustado laya-typed-decisions) y un Router que detecta el idioma y el sistema de escritura para seleccionar el checkpoint adecuado.

El entrenamiento se realizo con aprendizaje por refuerzo contra reglas de puntuacion estrictamente propias (RLCD, de "reinforcement learning with calibrated decisions"), de forma que la funcion de recompensa solo se maximiza reportando probabilidades honestas. Los checkpoints publicados funcionan en modo zero-shot, pero la propia documentacion indica que el ajuste fino sobre decisiones del dominio propio es donde la precision mejora de forma sustancial. Se documenta tambien un flujo de ajuste fino con calibracion de temperaturas que se ejecuta completo en 2x T4 (GPU gratuitas de Kaggle).

## Capacidades

- Clasificacion de texto con salida tipada: respuestas de tipo choice (categoria), score (puntuacion ordinal) y noul (probabilidad de que una afirmacion booleana sea cierta).
- Probabilidades calibradas mathematicalmente, obtenidas en un unico forward pass de aproximadamente 33 ms.
- Enrutamiento automatico por idioma y sistema de escritura: el componente Router dirige el texto no ingles a laya-multilingual.
- Multilingue: mas de 100 idiomas segun la model card.
- Casos de uso de guardrails y moderacion, derivados de las etiquetas del repositorio.
- Lectura de documentos largos: hasta 8.192 tokens en laya-multilingual mediante max_len=8192.
- Sin generacion de texto: al no producir lenguaje natural, no hay salida que parsear ni riesgo de alucinacion de contenido.
- Integraciones de despliegue y orquestacion: servidor HTTP (laya[serve]), servidor MCP (laya[mcp]), LangChain y LangGraph (laya[langchain]) y ONNX Runtime (laya[onnx]).
- Ruta rapida en GPU con TileLang (laya[fast]), con fallback a CPU tras errores de memoria en CUDA.
- Ajuste fino sobre datos propios, con una puntuacion medida de 0,766 de precision en el checkpoint ajustado frente a 0,362 del checkpoint base ingles.
- No se documentan capacidades de vision, audio ni tool calling generativo.

## Casos de uso

- Triaje y enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la categoria de departamento (billing, technical, other) con probabilidad, lo que permite asignar de forma automatica y auditable sin necesidad de generar texto.
- Deteccion de riesgo de churn: con preguntas de tipo noul se obtiene la probabilidad de que el usuario amenace con cancelar, lo que habilita alertas tempranas en equipos de retencion.
- Moderacion y guardrails de contenido: al devolver puntuaciones calibradas por criterio, encaja como capa de decision previa o posterior a un LLM generativo dentro de un pipeline de seguridad.
- Clasificacion de correo entrante: procesa el cuerpo del mensaje y responde a preguntas tipadas de categoria y urgencia, con latencia de decenas de milisegundos por decision.
- Puntuacion de urgencia en colas de atencion: la salida de tipo score permite ordenar solicitudes por criticidad ("not urgent", "soon", "blocking") sin coste de generacion.
- Decisiones sobre JSON estructurado: admite un estado en formato JSON y preguntas tipadas, lo que facilita la integracion en flujos de compliance y revision de registros.
- Ajuste fino para dominios verticales: cuando la precision zero-shot no basta, el flujo de ajuste fino en 2x T4 permite adaptar el checkpoint a decisiones del dominio propio y elevar la precision medida.
- Despliegue como servicio interno: mediante laya-serve (HTTP) o laya[mcp] (MCP) se expone el modelo como endpoint de decision para otros agentes o aplicaciones.

## Benchmarks y rendimiento

Se presentan unicamente los datos publicados en la model card. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar.

| Evaluacion | Resultado |
|---|---|
| Precisión en el benchmark de decisiones tipadas (2.000 decisiones, cuatro flujos de trabajo), checkpoint ajustado laya-typed-decisions | 0,766 |
| Precisión en el mismo benchmark, checkpoint base ingles | 0,362 |
| Precisión en documentos largos, hasta ~4.000 tokens (laya-multilingual) | 16-18 de 20 respuestas correctas |
| Precisión en documentos largos, mas alla de ~4.000 tokens (laya-multilingual) | 8-17 de 20 respuestas correctas |
| Latencia por forward pass | ~33 ms |
| Latencia con entrada de ~4.000 tokens en GPU de Apple | ~1,7 s |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos a fp16/bf16 ocupan aproximadamente 0,84 GB, por lo que la huella total con overhead de runtime se situa en el entorno de 1 a 2 GB; a fp32 los pesos suben a unos 1,7 GB.
- El ajuste fino documentado se ha ejecutado en 2x T4 (GPU gratuitas de Kaggle), lo que confirma que cabe en GPU de gama media y profesional de generaciones anteriores.
- Al tratarse de un modelo de ~421 M de parametros, cabe con holgura en GPU de consumo; la documentacion menciona ejecucion en GPU de Apple (MPS) y una ruta rapida TileLang para GPU con fallback a CPU ante errores de memoria en CUDA.
- Opciones de despliegue: paquete pip `laya`, servidor HTTP con `laya[serve]`, servidor MCP con `laya[mcp]`, integracion con LangChain y LangGraph (`laya[langchain]`) y ejecucion con ONNX Runtime (`laya[onnx]`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: aproximadamente 33 ms por decision y aproximadamente 1,7 s para entradas de ~4.000 tokens en GPU de Apple.
- No se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Laya pertenece a una categoria especifica (modelos de decision no autoregresivos con salidas tipadas y probabilidades calibradas) para la que la model card no ofrece alternativas ni cifras cruzadas, por lo que no es posible establecer una comparacion con parametros, contexto, rendimiento, licencia y disponibilidad de terceros sin inventar datos.

| Criterio | Laya (UNUSABLE07/laya) | Alternativas |
|---|---|---|
| Parametros | 421.293.830 | No disponible |
| Contexto | 8.192 tokens (multilingual) / 1.024 por defecto | No disponible |
| Rendimiento | 0,766 en el benchmark de decisiones tipadas (checkpoint ajustado); 0,362 el base ingles | No disponible |
| Licencia | Apache 2.0 | No disponible |
| Disponibilidad | Repositorio en Hugging Face con 0 descargas y 0 likes | No disponible |

## Limitaciones y advertencias

- El modelo no genera texto: queda fuera de su alcance cualquier tarea generativa, de resumen o conversacional.
- Precision en documentos largos degradada: mas alla de aproximadamente 4.000 tokens la tasa de acierto baja a un rango de 8 a 17 de 20, segun la propia documentacion, que recomienda verificar la precision en datos propios.
- El limite por defecto es de 1.024 tokens; para documentos largos hay que pasar max_len=8192 explicitamente y seleccionar el checkpoint "multilingual", ya que texto mayoritariamente en ingles podria enrutarse al checkpoint ingles.
- El campo de idiomas del repositorio no esta poblado, aunque la model card afirme soporte de mas de 100 idiomas; conviene validar el idioma objetivo antes de desplegar.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa de la comunidad en el momento de redactar esta ficha.
- La precision zero-shot es limitada (0,362 en el benchmark de decisiones tipadas del checkpoint base ingles) frente al checkpoint ajustado (0,766), lo que apunta a la necesidad de ajuste fino para uso en produccion.
- El identificador del repositorio (UNUSABLE07/laya) no coincide con los canales citados en la propia model card (GitHub NandhaKishorM/laya y checkpoint ajustado convaiinnovations/laya-typed-decisions), por lo que conviene verificar la procedencia y la integridad de los pesos antes de usarlos.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan clausulas adicionales, sesgos conocidos ni politicas de uso aceptable.
- Los datos de latencia publicados corresponden a hardware concreto (GPU de Apple) y no se acompanan de cifras de throughput, por lo que no son extrapolables directamente a otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UNUSABLE07/laya
- Repositorio GitHub: https://github.com/NandhaKishorM/laya
- Documentacion: https://nandhakishorm.github.io/laya/
- Referencia de API: https://nandhakishorm.github.io/laya/reference/
- Guia de hooks de prediccion: https://nandhakishorm.github.io/laya/hooks/
- Decisiones dirigidas por esquema: https://nandhakishorm.github.io/laya/structured/
- Guia de Docker: https://nandhakishorm.github.io/laya/docker/
- Integracion con LangChain y LangGraph: https://nandhakishorm.github.io/laya/langchain/
- Checkpoint ajustado laya-typed-decisions: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Notebook de ajuste fino en 2x T4 (Kaggle): https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Script de benchmark de contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
- Detalles de instalacion por plataforma: https://github.com/NandhaKishorM/laya#installation-details
