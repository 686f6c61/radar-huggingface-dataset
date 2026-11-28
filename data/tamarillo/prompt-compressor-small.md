# Tamarillo/prompt-compressor-small

## Resumen

Tamarillo/prompt-compressor-small es un modelo de compresion extractiva de prompts de 140,6 millones de parametros, publicado por el autor Tamarillo bajo licencia Apache-2.0. No es un modelo generativo: es un clasificador de tokens (`ModernBertForTokenClassification`) que, dada una secuencia de entrada, decide para cada token si debe conservarse (`KEEP`) o descartarse (`DROP`), de modo que un lector LLM posterior reciba un prompt reducido sin perder la informacion necesaria para responder. Resuelve un problema practico de produccion en pipelines RAG y de agentes: el coste y la latencia asociados a prompts largos (multiples documentos recuperados, trazas JSON de herramientas) y el limite duro de 512 tokens de los compresores extractivos basados en BERT/XLM-R.

Se construye sobre el backbone multilingue `jhu-clsp/mmBERT-small` y adopta la arquitectura ModernBERT, con 8.192 embeddings posicionales maximos, entrenamiento hasta 3.584 tokens y paridad ONNX verificada hasta 2.048 tokens. Frente a los compresores de referencia (`microsoft/llmlingua-2-mBERT` y `llmlingua-2-XLM-R-Large`), el autor destaca tres ventajas: pesos Apache-2.0 sin depender del dataset `MeetingBank` (CC-BY-NC-SA-4.0), contexto mucho mayor que 512 tokens y una huella en CPU/navegador notablemente menor.

Es relevante ahora porque los agentes y sistemas RAG en produccion acumulan contexto rapidamente y necesitan reducir tokens sin degradar la calidad de respuesta. El modelo se distribuye con exportaciones ONNX verificadas para Python sin PyTorch (`onnxruntime`) y para navegador/Node.js (`@huggingface/transformers`), lo que lo hace desplegable en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ModernBertForTokenClassification` (clasificacion de tokens, etiquetas `0: DROP`, `1: KEEP`) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 posiciones maximas de arquitectura; entrenado hasta 3.584 tokens; paridad ONNX y latencia CPU verificadas hasta 2.048 tokens |
| Tipos de cuantizacion | FP32 ONNX (537,0 MB) y Gather-INT8 ONNX (255,9 MB, paridad verificada); otros formatos no disponibles |
| Idiomas soportados | Entrenado en 20 idiomas del corpus `Tamarillo/prompt-compression-corpus-2026` v3; backbone `mmBERT-small` con cobertura de 1.833 idiomas; evaluado en ingles y en `de/es/zh/ar/hi` sobre XQuAD |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), ONNX (FP32 y Gather-INT8) |
| Modelo base | `jhu-clsp/mmBERT-small` |
| Pipeline | token-classification |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT para clasificacion de tokens con una cabeza que emite una decision binaria por token (conservar o descartar). La compresion es puramente extractiva: no reescribe ni parafrasea, solo selecciona subconjuntos de tokens del prompt original, lo que preserva la fidelidad literal del contexto y evita introducir contenido alucinado en la fase de compresion. La ventana de 8.192 posiciones elimina el troceado ciego a 512 tokens que imponen los encoders BERT/XLM-R, y el entrenamiento con ejemplos multi-documento cosidos hasta 3.584 tokens permite comprimir prompts RAG compuestos por varios fragmentos.

El entrenamiento se realizo sobre el dataset `Tamarillo/prompt-compression-corpus-2026` v3, que el autor presenta como alternativa a `MeetingBank` (CC-BY-NC-SA-4.0) para facilitar el cumplimiento comercial. No se detallan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO (no procede en un modelo extractivo de clasificacion). La innovacion principal es la combinacion de un backbone multilingue pequeno con contexto largo y exportaciones ONNX con paridad verificada, pensadas para inferencia en CPU y en navegador sin PyTorch.

## Capacidades

- Compresion extractiva de prompts: selecciona tokens a conservar o descartar segun una tasa objetivo de retencion (por ejemplo, `rate=0.50` para 2x de compresion o `rate=0.65` para 1,5x).
- Contexto largo: soporta prompts multi-documento de hasta 3.584 tokens en entrenamiento y 2.048 tokens verificados en ONNX/CPU, frente al limite de 512 tokens de los compresores BERT clasicos.
- Multilingue: evaluado en ingles, aleman, espanol, chino, arabe e hindi sobre XQuAD; entrenado sobre 20 idiomas.
- Compresion de trazas JSON de agentes: el autor reporta resultados especificos sobre un conjunto Agent JSON retenido, orientado a observabilidad de agentes.
- Inferencia sin PyTorch: exportaciones ONNX para `onnxruntime` en Python y para `@huggingface/transformers` en navegador y Node.js.
- Integracion mediante paquete auxiliar: `duoi-bt/tamarillo-guardrails` expone la clase `TamarilloPromptCompressor`.
- No soporta generacion de texto, tool calling, vision ni audio: es un componente de preprocesado, no un LLM.

## Casos de uso

- Compresion de contexto en pipelines RAG: antes de enviar los fragmentos recuperados al LLM lector, el modelo elimina tokens poco informativos y reduce el coste por consulta; su ventana de 3.584 tokens permite comprimir prompts con varios documentos sin troceado ciego.
- Reduccion de coste en atencion al cliente automatizada: en conversaciones multi-turno con historial largo, se comprime el contexto acumulado manteniendo las entidades y condiciones relevantes, lo que permite sostener sesiones mas largas dentro del mismo presupuesto de tokens.
- Observabilidad de agentes: compresion de trazas JSON de llamadas a herramientas y resultados intermedios antes de reinyectarlas en el bucle del agente, reduciendo el crecimiento del contexto en razonamientos de varios pasos.
- Despliegue en navegador o edge: con la exportacion Gather-INT8 de 255,9 MB y latencia de 87,4 ms a 256 tokens en CPU de 4 hilos, puede ejecutarse en el cliente mediante `@huggingface/transformers` para preprocesar texto antes de llamar a una API remota.
- Servicios de inferencia en CPU sin GPU: con FP32 ONNX a 85,9 ms por 256 tokens y 195,7 ms por 512 tokens en CPU de 4 hilos, es viable en servidores sin acelerador para reducir la carga de un LLM mayor.
- Cumplimiento comercial en empresas: al estar entrenado sin `MeetingBank` y publicarse bajo Apache-2.0, encaja en organizaciones que descartan los compresores LLMLingua-2 por la licencia no comercial de sus datos de entrenamiento.
- Procesamiento multilingue de documentos: compresion de contextos en aleman, espanol, chino, arabe o hindi, con el mejor resultado reportado por el autor en la suite XQuAD de cinco idiomas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false`). Evaluacion end-to-end con lector congelado `microsoft/Phi-4-mini-instruct` y decodificacion greedy, a presupuestos de retencion exacta de palabras coincidentes.

| Metrica | Valor |
|---|---|
| Media 3 suites publicas en ingles (HotpotQA, SQuAD-v2, GSM8K) a `rate=0.50` | 0,5371 |
| Media 4 suites publicas a `rate=0.50` | 0,5301 |
| Media 5 suites incluyendo Agent JSON a `rate=0.50` | 0,6221 |
| Media 4 suites publicas a `rate=0.65` | 0,6189 |

Comparaciones reportadas por el autor:

| Comparacion | Resultado |
|---|---|
| 4 suites publicas a `rate=0.50` frente a `llmlingua-2-mBERT` (178M) | 0,5301 frente a 0,5180 |
| XQuAD 5 idiomas a `rate=0.50` | 0,5092 frente a 0,4219 / 0,4072 |
| 4 suites publicas frente a `llmlingua-2-XLM-R-Large` (560M) | 0,5301 frente a 0,5371 (diferencia de 0,0070) |
| Media 5 suites con Agent JSON | 0,6221 frente a 0,6037 (XLM-R-Large) y 0,5597 (mBERT) |
| 3 suites publicas en ingles a `rate=0.50` | 0,5371, por detras de `llmlingua-2-mBERT` (0,5549) y de `prompt-compressor-tiny-en` (0,5695) |
| ONNX FP32, tamano | 537,0 MB frente a 676,8 MB (1,26x menor) |
| ONNX FP32, CPU 4 hilos a 256 tokens | 85,9 ms frente a 123,2 ms (1,43x mas rapido) |
| ONNX FP32, CPU 4 hilos a 512 tokens | 195,7 ms frente a 276,7 ms (1,41x mas rapido) |
| ONNX Gather-INT8, tamano y latencia | 255,9 MB y 87,4 ms a 256 tokens |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta disenado para CPU. En FP32 ocupa 537,0 MB en ONNX y 255,9 MB en Gather-INT8, por lo que cabe en memoria de cualquier equipo convencional.
- GPU recomendadas: no disponibles; no se han publicado requisitos ni optimizaciones especificas para GPU.
- Consumer GPU: irrelevante para el caso de uso principal, ya que la inferencia verificada es en CPU; el modelo cabe holgadamente en cualquier GPU consumer si se ejecuta con transformers.
- Opciones de despliegue: `transformers` (safetensors), `onnxruntime` en Python sin PyTorch, `@huggingface/transformers` en navegador y Node.js, y el paquete auxiliar `duoi-bt/tamarillo-guardrails`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de tokens.
- Latencia y throughput: 85,9 ms a 256 tokens y 195,7 ms a 512 tokens en ONNX FP32 con CPU de 4 hilos; 87,4 ms a 256 tokens con Gather-INT8. No se ha publicado throughput en tokens por segundo ni latencias para secuencias de 1.024 o 2.048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultado 4 suites publicas (`rate=0.50`) | Notas |
|---|---|---|---|---|---|
| Tamarillo/prompt-compressor-small | 140,6M | 8.192 (entrenado a 3.584; ONNX verificado a 2.048) | Apache-2.0 | 0,5301 | Mejor en XQuAD multilingue; sin `MeetingBank` |
| microsoft/llmlingua-2-mBERT | 178M | 512 | No disponible en la informacion | 0,5180 | Entrenado con `MeetingBank` (CC-BY-NC-SA-4.0); 676,8 MB en FP32 ONNX |
| microsoft/llmlingua-2-XLM-R-Large | 560M | 512 | No disponible en la informacion | 0,5371 | 4x mas grande; peor en la media de 5 suites con Agent JSON (0,6037) |
| Tamarillo/prompt-compressor-tiny-en | No disponible | No disponible | Apache-2.0 | No disponible | Solo ingles; 0,5695 en las 3 suites publicas en ingles a `rate=0.50` |

## Limitaciones y advertencias

- En las tres suites publicas exclusivamente en ingles a `rate=0.50`, el modelo queda por detras de `llmlingua-2-mBERT` (0,5371 frente a 0,5549) y de `prompt-compressor-tiny-en` (0,5695); su ventaja se concentra en multilingue y en la suite con Agent JSON.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`); conviene reproducirlos en el dominio propio antes de adoptarlo.
- La compresion es extractiva: si la informacion necesaria esta repartida en tokens que el modelo descarta, el lector perdera esa evidencia. La calidad depende del presupuesto de retencion elegido.
- El contexto maximo entrenado es de 3.584 tokens y la paridad ONNX solo se ha verificado hasta 2.048 tokens; no hay datos publicados sobre el comportamiento mas alla de esos limites.
- La evaluacion multilingue se limita a cinco idiomas de XQuAD (`de/es/zh/ar/hi`) ademas del ingles, aunque el backbone cubra muchos mas; el rendimiento en otros idiomas no esta documentado.
- Riesgo de sesgo: no se ha publicado informacion sobre sesgos del backbone `mmBERT-small` ni sobre la composicion del corpus de entrenamiento.
- Riesgo de alucinacion: bajo en la fase de compresion, al no generar texto; el riesgo recae en el LLM lector que consuma el prompt comprimido.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor remite a las notas de procedencia y licencias a nivel de fuente del dataset de entrenamiento, que no se detallan en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/prompt-compressor-small
- Dataset de entrenamiento: https://huggingface.co/datasets/Tamarillo/prompt-compression-corpus-2026
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Paquete auxiliar: https://github.com/duoi-bt/tamarillo-guardrails
- Demo en navegador: https://huggingface.co/spaces/Tamarillo/prompt-compressor-demo
- Suite de guardrails para agentes: https://huggingface.co/spaces/Tamarillo/agent-guardrails-suite
- Referencia de compresores comparados: `microsoft/llmlingua-2-mBERT` y `microsoft/llmlingua-2-XLM-R-Large` (no se han encontrado URLs en la busqueda web)
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada
