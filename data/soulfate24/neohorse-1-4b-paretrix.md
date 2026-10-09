# Soulfate24/NeoHorse-1-4B-Paretrix

## Resumen

NeoHorse-1-4B-Paretrix es un conjunto de cuantizaciones GGUF del modelo TokenRhythm/NeoHorse-1-4B, publicado por el usuario Soulfate24 bajo licencia Apache-2.0. No es un modelo nuevo entrenado desde cero, sino una redistribucion optimizada del modelo base de 4B parametros (4.205.751.296 parametros reales segun los pesos safetensors) generada con la Paretrix Quantization Suite, una metodologia de cuantizacion consciente de activaciones que asigna anchos de bits de forma no uniforme segun la sensibilidad medida de cada clase de tensor.

El modelo base, NeoHorse-1-4B, pertenece a la familia NeoHorse de TokenRhythm, orientada a flujos de trabajo agénticos, uso de herramientas, generacion de codigo y seguimiento de instrucciones. Segun fuentes externas, deriva de Qwen3.5-4B y fue adaptado mediante post-entrenamiento agéntico guiado por enrutamiento, con una longitud de contexto de 262.144 tokens.

La relevancia de esta ficha concreta radica en el catalogo de cuantizaciones: Paretrix ofrece trece variantes calibradas (desde Q8_0 hasta Femto-21pc) acompanadas de metricas de perplejidad (PPL), divergencia KL (KLD), desviacion RMS y tasa top-p, lo que permite elegir el punto de la frontera de Pareto que mejor equilibra tamano en disco y degradacion de calidad para despliegues en llama.cpp u otros runners compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base derivado de Qwen3.5-4B segun fuentes externas) |
| Parametros totales | 4.205.751.296 (4,21B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (262K) segun ai-tldr.dev para el modelo base |
| Tipos de cuantizacion | Q8_0, Fidelity-48pc, Precision-42pc, Q6_K-imx, Quality-36pc, Q5_K_M-imx, Compact-33pc, Mini-30pc, IQ4_XS-imx, Nano-27pc, IQ3_M-imx, Pico-24pc, Femto-21pc |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; repositorio con library_name transformers (safetensors del modelo base referenciado) |

## Arquitectura y entrenamiento

Esta publicacion no define una arquitectura propia: es una suite de cuantizacion aplicada sobre NeoHorse-1-4B, un transformer causal de 4B parametros. El valor tecnico anade esta en el metodo Paretrix, que combina informacion de activaciones reales (sensibilidad medida por clase de tensor mediante `llama-imatrix`) con tablas de tasas aprendidas de campanas cruzadas entre arquitecturas y una asignacion de ancho de bits tipo knapsack bajo un presupuesto exacto de tamano. Frente a la cuantizacion uniforme, que aplica una familia de bits constante a toda la red, Paretrix concentra el presupuesto donde la medicion indica mayor retorno en calidad.

En cuanto al modelo base, segun la documentacion externa de TokenRhythm, NeoHorse-1-4B fue sometido a post-entrenamiento agéntico guiado por enrutamiento (routing harness) orientado a la mejora recursiva mediante agentes, partiendo de Qwen3.5-4B. No se dispone de datos publicados en la informacion proporcionada sobre numero de tokens de entrenamiento, composicion del dataset, ni si se emplearon tecnicas concretas de RLHF o DPO. La model card del repositorio cuantizado se centra exclusivamente en la metodologia de cuantizacion y en las metricas de fidelidad de cada variante.

## Capacidades

- Generacion de texto conversacional orientada a flujos agénticos.
- Uso de herramientas (tool use / function calling), uno de los ejes declarados del modelo base.
- Generacion y asistencia de codigo.
- Razonamiento y seguimiento de instrucciones.
- Despliegue en llama.cpp mediante GGUF, con variantes cuantizadas para distintos presupuestos de memoria.
- La etiqueta "vision" aparece en los tags del repositorio, pero la pipeline declarada es text-generation y no se confirma en la informacion disponible ninguna capacidad multimodal efectiva.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes autonomeos con tool calling: el modelo puede invocar funciones y encadenar pasos en un bucle de agente; su orientacion explicita a uso de herramientas y el soporte GGUF permiten ejecutarlo en local dentro de orquestadores agénticos.
- Despliegue local en equipos de desarrollo: las variantes Nano-27pc (2251 MiB) o Mini-30pc (2416 MiB) caben en GPUs de gama media y permiten tener un asistente de codigo sin depender de APIs externas.
- Asistencia de programacion integrada en el IDE: con tool calling puede conectarse a herramientas de analisis, busqueda de codigo o ejecucion de tests dentro de un pipeline de desarrollo.
- Procesado de documentos largos: gracias a la ventana de 262.144 tokens del modelo base, es adecuado para resumir, extraer informacion o responder preguntas sobre documentos extensos en una sola pasada.
- Servicio de atencion al cliente automatizado: la ventana de contexto amplia y el seguimiento de instrucciones permiten conversaciones multi-turno con historial largo.
- Evaluacion comparativa de cuantizaciones: las trece variantes con metricas PPL/KLD documentadas sirven como banco de pruebas para estudiar el compromiso entre compresion y calidad en un modelo de 4B.
- Prototipado de bajo coste en investigacion: la variante Femto-21pc (1696 MiB) permite experimentar en hardware modesto cuando la fidelidad exacta no es critica.
- Pipelines de CI/CD para revision de codigo: con tool calling puede integrarse en verificaciones automaticas, siempre con supervision humana por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card si incluye metricas de fidelidad de cuantizacion, que se reproducen a continuacion:

| Variante | MiB | PPL | Delta PPL | KLD | RMS Delta p | top-p | Pareto |
|---|---:|---:|---:|---:|---:|---:|:---|
| Q8_0 (stock) | 4275 | 9,1273 | +0,0005 | 0,0057 | 1,82% | 98,2% | ★ |
| Fidelity-48pc | 3866 | 9,1807 | +0,0539 | 0,0083 | 2,45% | 97,5% | ≈ Precision-42pc (+0,0002 · -494 MiB) |
| Precision-42pc | 3372 | 9,1828 | +0,0560 | 0,0084 | 2,82% | 97,0% | ≈ Q6_K-imx (+0,0009 · -68 MiB) |
| Q6_K-imx (stock) | 3304 | 9,1991 | +0,0724 | 0,0093 | 2,90% | 96,7% | ★ |
| Quality-36pc | 2966 | 9,2173 | +0,0905 | 0,0204 | 3,71% | 95,1% | ★ |
| Q5_K_M-imx (stock) | 2933 | 9,3403 | +0,2135 | 0,0270 | 4,32% | 94,3% | ★ |
| Compact-33pc | 2768 | 9,1505 | +0,0237 | 0,0300 | 4,71% | 93,1% | ★ |
| Mini-30pc | 2416 | 9,5442 | +0,4174 | 0,0537 | 6,02% | 90,9% | ★ |
| IQ4_XS-imx (stock) | 2398 | 9,5261 | +0,3994 | 0,0598 | 6,37% | 90,5% | ★ |
| Nano-27pc ⭐ | 2251 | 9,2769 | +0,1501 | 0,0683 | 6,85% | 89,7% | ★ |
| IQ3_M-imx (stock) | 2063 | 9,9031 | +0,7763 | 0,1480 | 10,62% | 84,8% | ★ |
| Pico-24pc | 1935 | 10,1509 | +1,0242 | 0,1570 | 10,92% | 84,6% | ★ |
| Femto-21pc | 1696 | 10,0878 | +0,9610 | 0,2534 | 13,98% | 79,3% | ★ |

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 1,7 GB (Femto-21pc) hasta 4,3 GB (Q8_0) solo para los pesos; anadir margen para contexto, cache KV y overhead del runtime (con 262K tokens de contexto la cache KV puede crecer mucho).
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas para las variantes pequenas; RTX 3060 12 GB, RTX 4070/4080/4090 para contextos largos o variantes de alta fidelidad. En A100/H100 el modelo es sobredimensionado salvo por throughput masivo en batching.
- Cabe en GPU consumer: si, todas las variantes caben en GPUs consumer de gama media y alta; las variantes Nano-27pc en adelante son aptas para equipos modestos.
- Opciones de despliegue: llama.cpp (nativo por formato GGUF), Ollama, y runners compatibles con GGUF; el repositorio tambien declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-1-4B-Paretrix (esta ficha) | 4,21B | no confirmado en la ficha; 262K segun modelo base | GGUF (13 variantes) | apache-2.0 | HuggingFace (Soulfate24) |
| TokenRhythm/NeoHorse-1-4B (modelo base) | 4B | 262K | safetensors / GGUF | apache-2.0 | HuggingFace (TokenRhythm) |
| Cuantizaciones stock dentro del mismo repo (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx) | 4,21B | idem | GGUF | apache-2.0 | Incluidas en el mismo repositorio |

No se dispone en la informacion proporcionada de datos suficientes para comparar frente a otras familias de cuantizacion de terceros (por ejemplo, recetas de otros publicadores) con cifras verificables.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda integramente los sesgos, limitaciones y riesgos del modelo base NeoHorse-1-4B.
- Riesgo de alucinacion: como todo modelo de lenguaje de 4B parametros, puede generar contenido factualmente incorrecto, especialmente en tareas de conocimiento especializado.
- Perdida de calidad por cuantizacion: las variantes agresivas (Femto-21pc, Pico-24pc, IQ3_M-imx) muestran degradacion notable, con incrementos de PPL superiores a 0,7 y KLD por encima de 0,14.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue mas alla del que herede el modelo base.
- Contexto largo: aunque el modelo base declara 262K tokens, el consumo de memoria de la cache KV a esa longitud puede hacer inviable el contexto completo en hardware consumer.
- La etiqueta "vision" no esta respaldada por la pipeline declarada (text-generation), por lo que no debe asumirse capacidad multimodal.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de cualquier dependencia derivada.
- Repositorio con cero descargas y cero likes en el momento de la consulta, sin validacion comunitaria independiente de las metricas declaradas.
- Modelo con fechas de creacion/actualizacion en octubre de 2026, posteriores a la mayoria de referencias conocidas; conviene confirmar la vigencia de los enlaces.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Soulfate24/NeoHorse-1-4B-Paretrix
- Suite de cuantizacion Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Modelo base en HuggingFace: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Repositorio GitHub de NeoHorse: https://github.com/TokenRhythm/NeoHorse
- Coleccion NeoHorse-1: https://huggingface.co/collections/TokenRhythm/neohorse-1
- Ficha tecnica en AI/TLDR: https://ai-tldr.dev/models/neohorse-1-4b/
- Articulo en HackerNoon: https://hackernoon.com/neohorse-1-4b-a-4b-model-built-for-ai-agents-and-tool-use
