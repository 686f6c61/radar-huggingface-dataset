# UraionLabs/uraion-forge-2b-gguf

## Resumen

Uraion Forge 2B GGUF es la distribucion oficial optimizada para inferencia en el borde (edge) del modelo Uraion Forge 2B, desarrollada por Uraion Labs. Se trata de una cuantizacion en formato GGUF del modelo base openbmb/MiniCPM5-2B, un transformer compacto de 2.516.756.480 parametros (aproximadamente 2,5 B) orientado a razonamiento cuantitativo y ejecucion de herramientas en modo agente. El repositorio empaqueta tanto cuantizaciones k-quant estandar (F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K) como variantes de cuantizacion dinamica de Unsloth (dynamic_q4_k_xl, dynamic_q3_k_l, dynamic_q2_k_l).

El modelo resuelve el problema de desplegar razonamiento y tool calling en hardware de consumo: portatiles, dispositivos Linux embebidos, Apple Silicon y estaciones de trabajo con GPU NVIDIA, mediante llama.cpp, Ollama, LM Studio y Jan.ai. Su propuesta diferencial es la cuantizacion dinamica heterogenea, que asigna mayor precision a las capas sensibles (embeddings, cabeza de salida, proyecciones de atencion) y comprime agresivamente las capas MLP redundantes, mitigando el llamado "perplexity cliff" tipico de los modelos por debajo de 3 B.

Es relevante ahora porque ofrece una ventana de contexto de 16k tokens (extensible a 131k mediante RoPE) en un peso que puede bajar de 1 GB en configuraciones dinamicas de 2 bits, con una fiabilidad de tool calling declarada del 90,5 % y licencia Apache 2.0, lo que facilita su integracion comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en MiniCPM5-2B, linaje Llama) |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens nativos; 131k mediante RoPE |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, dynamic_q4_k_xl, dynamic_q3_k_l, dynamic_q2_k_l |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 2,5 B de parametros derivado de openbmb/MiniCPM5-2B, con linaje arquitectonico Llama segun la model card. El vocabulario declarado es de 73.440 tokens. La innovacion tecnica central del repositorio no reside en el entrenamiento del modelo base, sino en el proceso de cuantizacion: Unsloth Dynamic Quantization 2.0, que emplea una matriz de importancia (imatrix) calculada mediante un barrido de calibracion sobre un dataset de razonamiento cuantitativo y agentico multi-turno, estimando la covarianza de activaciones H ≈ E[XX^T] para cada tensor.

A partir de esa matriz se aplica precision heterogenea: embeddings de tokens y cabeza de salida bloqueados a Q8_0 o FP16, proyecciones de atencion (Q, K, V, output) preservadas a Q5_K/Q6_K en las variantes XL/L, y pesos MLP (gate, up, down), que representan aproximadamente el 65 % del total de parametros, comprimidos hasta Q2. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles con enfasis en razonamiento cuantitativo.
- Razonamiento multi-paso y cadenas de razonamiento (tag "reasoning").
- Tool calling / function calling con fiabilidad declarada del 90,5 %.
- Ejecucion agentica multi-turno con preservacion de estado conversacional.
- Recuperacion de informacion (needle retrieval) sobre ventanas de hasta 16.384 tokens.
- Salida estructurada en JSON para integracion con APIs y pipelines.
- Despliegue en el borde: Apple Silicon (M1 a M6), Raspberry Pi, Linux embebido y GPU NVIDIA.

## Casos de uso

- Agentes de automatizacion local en portatiles: el modelo puede orquestar llamadas a herramientas (sistema de ficheros, APIs locales) sin conexion a la nube, aprovechando el tool calling con 90,5 % de fiabilidad y su huella inferior a 1 GB en cuantizacion dinamica de 2 bits.
- Asistente de razonamiento cuantitativo en dispositivos embebidos: sobre Raspberry Pi o Linux embebido, resuelve problemas aritmeticos y de logica paso a paso con llama.cpp, sin necesidad de GPU dedicada.
- Automatizacion de atencion al cliente en el borde: gestiona conversaciones multi-turno con contexto de 16k tokens, manteniendo el estado de la sesion en local para cumplir requisitos de soberania de datos.
- Extraccion de datos estructurados: genera JSON valido para poblar bases de datos o formularios, beneficiandose de las capas de embeddings y salida preservadas a Q8_0 que evitan el deterioro de esquemas en cuantizaciones bajas.
- Prototipado rapido en Apple Silicon: con Ollama o LM Studio sobre chips M1-M6, permite iterar en el desarrollo de agentes con latencia local baja y sin coste de API.
- Filtrado y clasificacion en pipelines de CI/CD: integrado como paso de validacion que interpreta logs y decide acciones mediante function calling, ejecutandose en el mismo runner sin infraestructura GPU.
- Procesamiento por lotes en servidores edge: con vLLM o llama.cpp server, atiende cargas de inferencia de alto rendimiento en hardware modesto gracias al reducido numero de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento declarada por el autor es una fiabilidad de tool calling del 90,5 %, sin especificar el conjunto de evaluacion ni la metodologia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en Q4_K_M, en torno a 0,9-1,0 GB en dynamic_q2_k_l, cerca de 2,7 GB en Q8_0 y unos 5 GB en F16 (estimaciones a partir del numero de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU NVIDIA con 4 GB o mas de VRAM para cuantizaciones Q4/Q5; A100 o H100 no son necesarias y solo aportarian throughput adicional en servicio concurrente.
- Compatibilidad con GPU de consumo: si, cabe en GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en Apple Silicon unificado (M1 a M6) y en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan.ai y servidores compatibles con endpoints (el repositorio incluye la etiqueta endpoints_compatible).
- Latencia y throughput: no disponibles; el autor menciona ejecucion local "sub-milisecond" en el resumen ejecutivo, pero sin cifras verificables de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Uraion Forge 2B GGUF | ~2,5 B | 16k (131k con RoPE) | Apache 2.0 | GGUF (llama.cpp, Ollama) | Cuantizacion dinamica Unsloth 2.0; tool calling 90,5 % declarado |
| openbmb/MiniCPM5-2B | ~2,5 B | No disponible | No disponible | Pesos originales | Modelo base del que deriva Forge 2B |
| Alternativas de ~2-3 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo soporta ingles; no se declara capacitad multilingue.
- Riesgo de alucinacion inherente a modelos de 2,5 B, especialmente en tareas de conocimiento factual amplio.
- La fiabilidad de tool calling del 90,5 % implica aproximadamente un 9,5 % de fallos en la generacion de llamadas, lo que exige validacion y reintentos en produccion.
- Las cuantizaciones de 2 y 3 bits, aunque dinamicas, pueden degradar el razonamiento frente a Q4_K_M o superiores; conviene evaluar por tarea.
- El contexto nativo es de 16k tokens; la extension a 131k mediante RoPE no esta validada en la informacion disponible y puede degradar la recuperacion.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base MiniCPM5-2B, no indicada en la informacion proporcionada.
- El repositorio tiene 191 descargas y 0 likes, con fecha de creacion en septiembre de 2026; se trata de una publicacion reciente con poca validacion externa.
- No hay benchmarks publicados que respalden las afirmaciones de rendimiento del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UraionLabs/uraion-forge-2b-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Sitio de Uraion Labs: https://uraionlabs.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
