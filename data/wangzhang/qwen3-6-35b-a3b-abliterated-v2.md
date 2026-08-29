# wangzhang/Qwen3.6-35B-A3B-abliterated-v2

## Resumen

El modelo wangzhang/Qwen3.6-35B-A3B-abliterated-v2 es una versión "abliterada" (sin censura) del modelo Qwen/Qwen3.6-35B-A3B, desarrollada por el autor wangzhang mediante la herramienta Abliterix. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 35.107 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, distribuidos en 256 expertos enrutados de los cuales 8 se activan por token. La abliteración consiste en eliminar o atenuar los vectores de dirección que provocan rechazos de peticiones, manteniendo la utilidad general del modelo base.

Esta segunda versión (V2) incorpora mejoras respecto a la V1: proyección ortogonal de la dirección de rechazo, winsorización de valores atípicos, el doble de datos de entrenamiento (800 prompts) y un presupuesto de búsqueda TPE más amplio. El resultado es una reducción de la tasa de rechazo del 7/100 al 4/100 en una evaluación con juez LLM, manteniendo una divergencia KL de 0,0421 respecto al modelo base, lo que indica una pérdida de coherencia mínima. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para desarrolladores que necesitan un modelo local sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), 256 expertos enrutados, 8 activos por token |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B (8 de 256 expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE con 256 expertos enrutados y 8 activos por token, lo que da un total de 35B parámetros pero solo ~3B activos en cada paso de inferencia. Sobre esta arquitectura, el autor aplica una técnica de abliteración basada en LoRA rank-1 steering sobre las proyecciones de atención (O-projection) y las proyecciones down de las capas MLP, desactivando las proyecciones Q/K/V porque la señal de rechazo en modelos MoE reside en la ruta de los expertos, no en las proyecciones de atención. Además se aplica Expert-Granular Abliteration (EGA), que proyecta la dirección de rechazo desde los 256 slices de down_proj por capa, supresión del router MoE, ortogonalización de los vectores de steering y un kernel de decaimiento gaussiano que modula la intensidad del steering a lo largo de las capas.

La V2 añade cuatro mejoras concretas: proyección de la abliteración (solo elimina el componente ortogonal de la dirección de rechazo respecto a la media inofensiva, preservando señal alineada con la utilidad), winsorización de vectores en el cuantil 0,995 para amortiguar valores atípicos, el doble de datos de entrenamiento (800 prompts frente a 400) y una restricción KL más estricta (objetivo 0,005, poda 0,5) que elimina antes los ensayos degenerados. El ensayo ganador (#33) usó un pico gaussiano muy agudo en la capa 27 con peso 4,20 en attn.o_proj y una perturbación débil en la capa 34 con peso 0,94 en mlp.down_proj. La evaluación se realizó con un juez LLM externo (Google Gemini 3 Flash) sobre 100 prompts, sin detección por palabras clave.

## Capacidades

- Generación de texto sin rechazos: el modelo responde a peticiones que el modelo base rechaza sistemáticamente (el base rechaza 100/100 en la evaluación, este modelo solo 4/100).
- Tasa de éxito de ataque del 96% en la evaluación con juez LLM, lo que indica alta capacidad de cumplimiento de instrucciones incluso en prompts indirectos o con role-play.
- Mantiene la coherencia del modelo base: la divergencia KL de 0,0421 (muy por debajo de 0,1) sugiere que la generación de texto sigue siendo fluida y contextualmente adecuada.
- Soporte de código, narración, investigación, diseño de sistemas y dirección de arte, según la documentación del repositorio espejo.
- Capacidad de despliegue local sin dependencias en la nube, orientado a flujos de trabajo con privacidad.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso o capacidades multimodales.

## Casos de uso

- Creación de contenido creativo sin restricciones: escritores y guionistas pueden generar narrativas, diálogos y escenas que aborden temas sensibles o controvertidos sin recibir rechazos ni avisos, gracias a la tasa de rechazo reducida al 4%.
- Roleplay y simulación de personajes: el modelo responde a peticiones de interpretación de roles complejos o moralmente ambiguos, algo que el modelo base bloquea, lo que lo hace útil para juegos de rol textuales y desarrollo de personajes.
- Investigacion sobre seguridad y alineacion: los investigadores pueden estudiar el comportamiento de un modelo abliterado frente a prompts adversariales, comparando la tasa de éxito de ataque (96%) y la divergencia KL con el modelo base para entender los mecanismos de rechazo.
- Desarrollo de asistentes locales sin censura: integrable en aplicaciones de escritorio o servidores privados donde se requiere que el asistente responda a cualquier consulta sin filtros, manteniendo la privacidad de los datos al no depender de APIs en la nube.
- Analisis de prompts adversariales: el modelo sirve como banco de pruebas para evaluar la robustez de técnicas de abliteración, ya que el autor documenta la metodología completa (juez LLM, 100 prompts, detección de respuestas degeneradas).
- Generacion de codigo para pruebas de seguridad: el smoke test incluido muestra que el modelo responde a peticiones de código malicioso (keyloggers, malware, phishing), lo que puede usarse en entornos controlados para formación en ciberseguridad o análisis de vulnerabilidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de evaluacion proporcionados son los siguientes:

| Metrica | Valor |
|---|---|
| Rechazos (juez LLM, 100 prompts) | 4/100 |
| Tasa de exito de ataque | 96% |
| Divergencia KL respecto al base | 0,0421 |
| Rechazos del modelo base original | 100/100 |
| Ensayos de optimizacion completados | 33/50 |
| Juez LLM | google/gemini-3-flash-preview |
| Smoke test (15 prompts adversariales clasicos) | 15/15 |

## Requisitos de hardware

No se dispone de informacion detallada sobre requisitos de hardware en la documentacion proporcionada. Sin embargo, a partir del tamano del repositorio (70,2 GB en safetensors) y la arquitectura MoE con 3B parametros activos, se puede estimar:

- VRAM estimada para inferencia: al menos 16-24 GB para cargar los pesos en precision FP16 sin cuantizar; con cuantizacion de 4 bits podria reducirse a unos 8-10 GB, aunque no se especifican formatos de cuantizacion disponibles.
- GPU recomendadas: una RTX 4090 (24 GB) o superior podria ejecutar el modelo en FP16; GPUs con menos VRAM requeririan cuantizacion o descarga de pesos a CPU.
- Al ser un MoE con solo 3B parametros activos, la latencia por token es considerablemente menor que la de un modelo denso de 35B, aunque la memoria necesaria para cargar todos los expertos es la misma.
- Opciones de despliegue: no se mencionan herramientas especificas (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible, pero al ser un modelo safetensors compatible con el ecosistema Qwen, es probable que funcione con las herramientas estandar del ecosistema HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (juez LLM) | KL vs base | Licencia |
|---|---|---|---|---|---|
| wangzhang/Qwen3.6-35B-A3B-abliterated-v2 (este) | 35B total, 3B activos | no disponible | 4/100 | 0,0421 | Apache-2.0 |
| wangzhang/Qwen3.6-35B-A3B-abliterated (V1) | 35B total, 3B activos | no disponible | 7/100 | 0,0189 | Apache-2.0 |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated | 35B total, 3B activos | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.6-35B-A3B (base) | 35B total, 3B activos | no disponible | 100/100 | 0 | Apache-2.0 |

La comparativa muestra que la V2 mejora la tasa de rechazo de la V1 (4/100 frente a 7/100) a costa de una mayor divergencia KL (0,0421 frente a 0,0189), aunque ambos valores estan muy por debajo del umbral de 0,1 que indicaria perdida perceptible de coherencia. El modelo de huihui-ai es una alternativa del mismo tipo, pero no se dispone de datos de evaluacion comparables.

## Limitaciones y advertencias

- El modelo esta disenado para eliminar rechazos, lo que implica que puede generar contenido danino, ilegal o eticamente problematico (sintesis de metanfetamina, bombas, malware, fraude, etc.) si se le solicita. Su uso conlleva un riesgo significativo de mal uso y debe restringirse a entornos controlados.
- La evaluacion de rechazos se realizo con un unico juez LLM (Google Gemini 3 Flash) sobre 100 prompts; no se ha verificado con otros jueces ni con conjuntos de datos mas amplios, por lo que la tasa real de rechazo podria variar en la practica.
- La divergencia KL de 0,0421, aunque baja, indica que el modelo se aleja del comportamiento del base; en prompts no relacionados con contenido sensible podria haber diferencias sutiles en el estilo o la calidad de las respuestas.
- No se dispone de informacion sobre la longitud de contexto soportada, los idiomas cubiertos ni los formatos de cuantizacion disponibles, lo que limita la planificacion de despliegues en produccion.
- El autor advierte explicitamente que muchos modelos abliterados en HuggingFace reportan metricas infladas debido a metodologias de evaluacion deficientes (longitudes de generacion cortas, deteccion por palabras clave, datasets demasiado simples); este modelo documenta su metodologia, pero aun asi los resultados dependen del conjunto de prompts elegido.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre la seguridad del modelo ni sobre su idoneidad para aplicaciones de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/Qwen3.6-35B-A3B-abliterated-v2
- Version V1: https://huggingface.co/wangzhang/Qwen3.6-35B-A3B-abliterated
- Repositorio de Abliterix: https://github.com/wuwangzhang1216/abliterix
- Repositorio espejo en GitHub: https://github.com/Damacol/wangzhang-qwen3.6-35b-a3b-abliterated-v2
- Guia de Qwen 3.6 (27B dense y 35B-A3B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Modelo alternativo de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
