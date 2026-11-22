# TeknikoAI/DecisionSDK

## Resumen

DecisionSDK es una colección de 22 especialistas de clasificación de texto de 22M de parámetros, destilados a partir del modelo docente Qwen/Qwen3.8-27B (4-bit NF4) y empaquetados en INT4 con un tamaño de 13,5 MB por especialista. Lo desarrolla TeknikoAI y propone un cambio de paradigma: en lugar de invocar un LLM generalista de gran tamaño para decisiones estructuradas recurrentes (enrutado de intenciones, scoring de riesgo, moderación, etiquetado), cada tarea se compila en un modelo minúsculo de propósito único que se ejecuta localmente en CPU.

Cada especialista se construye sobre el backbone sentence-transformers/all-MiniLM-L6-v2 (Transformer de 6 capas) con pooling Mean+Max y una cabeza MLP de dos capas, y expone la decisión como una primitiva tipada: `choice` (clasificación de etiqueta única), `noul` (Bernoulli calibrada), `score` (escala ordinal 1-5) y `tags` (etiquetado multietiqueta). La calibración se realiza mediante temperature scaling y umbrales por etiqueta.

La relevancia actual del proyecto reside en su coste marginal nulo y su privacidad: tras una compilación única con el docente, la inferencia se ejecuta sin GPU a unos 20 ms por consulta en CPU de 4 hilos, con los datos sensibles sin salir del dispositivo. El modelo está orientado exclusivamente al inglés y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone all-MiniLM-L6-v2, 6 capas) con pooling Mean+Max (768-d) y cabeza MLP (LayerNorm, Linear 768→384, GELU, Linear 384→C) |
| Parametros totales | 22M por especialista |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el backbone MiniLM soporta habitualmente 256 tokens, no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | INT4 simetrico Group-32 en matrices 2D del backbone; FP16 en cabeza de clasificacion y normas |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 0,3 GB; el autor menciona empaquetado INT4 Group-32, sin detallar safetensors/GGUF) |

## Arquitectura y entrenamiento

El pipeline de compilacion parte de un docente Qwen/Qwen3.8-27B en 4-bit NF4 con `enable_thinking=False`, que genera corpus de dominio y emite distribuciones soft-logit en un unico forward pass sobre los tokens de opcion validos. Cada tarea se destila en un estudiante de 22M de parametros basado en all-MiniLM-L6-v2, con pooling concatenado Mean+Max y una cabeza MLP de dos capas.

La perdida de destilacion es consciente de la primitiva: KL suave mas entropia cruzada dura, BCE para `tags` y conciencia ordinal para `score`. Tras el entrenamiento se aplica temperature scaling y ajuste de umbrales por etiqueta. El empaquetado final usa INT4 simetrico Group-32 para las matrices 2D del backbone y FP16 para la cabeza y las normas, resultando en 13,5 MB por especialista (296,3 MB para los 22 modelos). No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Clasificacion de texto de etiqueta unica (`choice`) con probabilidades calibradas.
- Clasificacion binaria calibrada (`noul`) con probabilidad Bernoulli.
- Scoring ordinal en escala 1-5 (`score`) con valor esperado.
- Etiquetado multietiqueta (`tags`) con umbrales calibrados por etiqueta.
- Inferencia en CPU sin GPU, con latencia de ~20 ms por consulta y throughput de hasta 254 qps en batch de 32.
- Ejecucion 100% offline con privacidad total de los datos.
- Modularidad: cada especialista es un artefacto independiente versionable y sustituible.
- No soporta generacion de texto libre, tool calling, agentes ni razonamiento multi-paso; su alcance es la decision estructurada.

## Casos de uso

- Enrutado de intenciones en atencion al cliente: un especialista `choice` clasifica el mensaje entrante en una de las categorias de soporte en ~20 ms, sustituyendo una llamada a un LLM generalista en la ruta caliente del sistema.
- Moderacion de contenido y etiquetado de resenas: el especialista `ecom_review_tags` asigna etiquetas multietiqueta con umbrales calibrados, permitiendo filtrar resenas en tiempo real sin coste por llamada.
- Triage de incidencias DevOps: `dev_issue_type` clasifica tickets en cinco tipos con 100% de coincidencia con el docente en el conjunto no visto, integrándose en pipelines de ticketing.
- Scoring de riesgo en finanzas: la primitiva `score` produce una valoracion ordinal 1-5 con valor esperado, util para priorizar casos en flujos de revision manual.
- Clasificacion de motivos de devolucion en e-commerce: `ecom_return_reason` resuelve la categoria de devolucion con 100% de coincidencia exacta en el conjunto no visto, alimentando sistemas de logistica.
- Procesamiento de documentos sensibles (facturas, PII, logs de soporte): al ejecutarse localmente en CPU, los datos no salen del dispositivo, cumpliendo requisitos de privacidad estrictos.
- Despliegue en edge: con 13,5 MB por especialista cabe en dispositivos con recursos limitados y funciona sin conectividad.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en CPU de 4 hilos (PyTorch 2.14.0+cpu, sin GPU):

| Metrica | Resultado |
|---|---|
| Modelos evaluados | 22 especialistas en 6 dominios (DevOps, e-commerce, finanzas, ventas, seguridad, soporte) |
| Huella total en disco | 296,3 MB (13,5 MB por modelo) |
| Carga + desempaquetado INT4 | 767 ms por modelo |
| Latencia consulta unica (batch=1) | 20,70 ms de media (12,36 ms minimo, 30,44 ms P95) |
| Throughput batch=32 | 157 qps de media (hasta 254 qps) |
| Coincidencia con el docente (n=120/tarea) | 97,4% de media (4 tareas al 100,0%) |
| Generalizacion no vista (114 ejemplos) | 80,7% exacto / 84,8% primario (17/22 con >=80%, 11/22 al 100% exacto) |

Resultados por especialista (extracto de los datos disponibles):

| Tarea | Primitiva | Latencia B1 | QPS B32 | Coincidencia docente | Exacto no visto |
|---|---|---|---|---|---|
| `dev_issue_type` | `choice` (5) | 13,78 ms | 110/s | 99,2% | 100,0% |
| `ecom_return_reason` | `choice` (5) | 21,20 ms | 161/s | 100,0% | 100,0% |
| `ecom_review_tags` | `tags` (4) | 14,33 ms | No disponible | No disponible | No disponible |

## Requisitos de hardware

- Inferencia exclusivamente en CPU: no requiere GPU.
- VRAM estimada: 0 GB; el modelo opera en memoria del sistema (13,5 MB de pesos por especialista).
- GPU recomendadas: no aplica; el autor reporta resultados en CPU de 4 hilos.
- Cabe en cualquier equipo consumer, incluidos dispositivos edge de bajos recursos.
- Opciones de despliegue: PyTorch CPU (framework usado en los benchmarks); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia: ~20,70 ms de media por consulta en batch=1; throughput de 157 qps de media y hasta 254 qps en batch=32.
- Tiempo de carga: 767 ms por modelo (incluye desempaquetado INT4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecisionSDK (este modelo) | 22M por especialista | No disponible | Destilacion de decisiones tipadas, INT4, CPU | Apache 2.0 | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | No disponible | Embeddings de frases | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (docente) | 27B | No disponible | LLM generalista | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos directos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance estrictamente limitado: cada especialista resuelve una unica decision; no genera texto ni razona.
- Solo ingles: no hay soporte multilingue declarado.
- Riesgo de alucinacion estructural bajo, pero las decisiones pueden ser incorrectas en entradas fuera de distribucion; la generalizacion no vista reportada es del 80,7% exacto.
- La calibracion depende de la temperatura y umbrales ajustados; cambios de dominio pueden degradar la fiabilidad de las probabilidades.
- El docente Qwen/Qwen3.8-27B no tiene licencia declarada en la informacion disponible; conviene verificar la procedencia de los datos destilados antes de uso comercial.
- Licencia Apache 2.0 para los artefactos publicados, sin restricciones comerciales conocidas.
- No hay datos publicados sobre sesgos especificos del modelo.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/TeknikoAI/DecisionSDK
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo docente: https://huggingface.co/Qwen/Qwen3.8-27B
