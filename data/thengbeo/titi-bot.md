# Thengbeo/titi-bot

## Resumen

TiTi Bot es un modelo de lenguaje de pequeno tamano (63,52 millones de parametros) desarrollado por Ho Ngoc Thang dentro del proyecto "TiTi Genesis AGI", una iniciativa personal orientada a construir una flota de micro-bots satelite ligeros. El modelo esta disenado especificamente para el idioma vietnamita y cumple tres funciones diferenciadas: modelado de lenguaje causal para preentrenamiento, clasificacion y filtrado de datos web (spam, juego, SEO clickbait, OCR corrupto, traduccion rota) y extraccion de spans para busqueda extractiva.

Tecnicamente se trata de un transformer decoder-only de 6 capas con dimension oculta de 768, 12 cabezas de atencion con Grouped Query Attention (4 cabezas KV, ratio 3:1) y un vocabulario de 32.768 tokens "puramente vietnamita". La arquitectura sigue convenciones de modelos como Llama-3 o Qwen2.5 en el diseno de atencion, con RMSNorm, SwiGLU y Rotary Embeddings (RoPE). El autor lo presenta como una evolucion de una version previa de 512 dimensiones y 65.536 tokens de vocabulario, eliminando tokens ingleses y de herramientas de codigo.

Es relevante en el nicho de modelos ultra-ligeros para tareas de curaduria de datos en vietnamita, un idioma con relativamente pocos recursos especificos. Sin embargo, no hay evidencia publica de que el modelo haya sido entrenado con datos reales: la model card describe scripts de inicializacion de pesos (`init_weights.py`) y pruebas de forma y flujo de gradiente, no resultados de entrenamiento convergido. Esto es un caveat critico para cualquier evaluacion practica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (6 capas, 768D, RMSNorm, SwiGLU, RoPE, GQA) |
| Parametros totales | 63,52 M (25,17 M embedding + 37,76 M backbone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica el contexto maximo de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos descritos como fp16 ~127 MB y fp32 ~242 MB) |
| Idiomas soportados | vietnamita (vocabulario disenado al 100% para vietnamita) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se menciona `titi_filter_init.pt` como checkpoint de inicializacion) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con `hidden_dim=768`, `num_heads=12`, `num_kv_heads=4` (GQA 3:1), `ffn_dim=2048` con activacion SwiGLU, RMSNorm y Rotary Embeddings. El vocabulario es de 32.768 tokens (2^15) filtrado para eliminar tokens ingleses y etiquetas de herramientas de codigo/matematicas. La model card indica que el preentrenamiento causal se realizaria sobre aproximadamente 300 millones de tokens de libros y material educativo limpio (`loai_2.jsonl`), pero no se aportan curvas de perdida, tokens efectivamente procesados ni detalles del dataset mas alla de esa cifra.

La innovacion principal es la cabeza triple: una cabeza de modelado causal (`forward`/`forward_loss`), una cabeza de filtrado de datos (`forward_filter`) que clasifica en 5 clases y puntua calidad de 0,0 a 1,0, y una cabeza de extraccion de spans (`forward_span`) que emite coordenadas inicio/fin sobre un par pregunta-articulo. La model card describe pruebas de consistencia de KV-cache (error de 2,91e-6 frente a forward completo) y de flujo de gradiente en las tres cabezas, pero estas pruebas validan la implementacion, no el aprendizaje. No se menciona RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto causal en vietnamita (preentrenamiento de lenguaje base).
- Filtrado y clasificacion de documentos web en 5 categorias: `KEEP_CLEAN`, `DROP_SPAM_GAMBLING`, `DROP_SEO_CLICKBAIT`, `DROP_GARBLED_OCR`, `DROP_BROKEN_TRANSLATION`.
- Puntuacion de calidad de texto en rango continuo [0,0, 1,0].
- Extraccion extractiva de spans (respuesta basada en coordenadas inicio/fin sobre un texto fuente), disenada para reducir alucinacion en busqueda.
- Tokenizacion especifica para vietnamita con cobertura de todos los tonos, digrafos y signos de puntuacion.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Curaduria de corpus web en vietnamita: el modelo puede puntuar y clasificar paginas rastreadas antes de incorporarlas a un pipeline de entrenamiento, descartando spam, clickbait SEO y texto OCR corrupto mediante la cabeza de filtrado.
- Busqueda extractiva sobre articulos: dado un par pregunta-articulo, la cabeza de span devuelve la respuesta literal del texto, lo que permite construir un buscador que cite fuente y evite respuestas generadas.
- Limpieza de datasets de traduccion automatica: la clase `DROP_BROKEN_TRANSLATION` permite detectar pares con traduccion defectuosa antes de usarlos en ajuste fino de modelos mayores.
- Preprocesado en pipelines RAG: como etapa previa a un LLM grande, TiTi Bot filtra documentos irrelevantes y extrae fragmentos, reduciendo el contexto enviado al modelo principal y el coste por consulta.
- Moderacion de foros y comentarios en vietnamita: la clasificacion de spam y juego encaja en un sistema de moderacion ligero que puede ejecutarse en CPU.
- Prototipado de investigacion en modelos pequenos: sirve como banco de pruebas para estudiar vocabularios especificos de idioma, GQA en modelos diminutos o arquitecturas multi-cabeza con un coste computacional minimo.
- Despliegue en dispositivos con recursos limitados: con ~127 MB en fp16, puede ejecutarse en entornos edge o contenedores sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas de implementacion (formas de tensores, flujo de gradiente, consistencia de KV-cache con error de 2,91e-6, guardado y carga de checkpoint), no metricas de calidad como MMLU, HumanEval o GSM8K, ni evaluaciones en tareas de filtrado o extraccion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (~127 MB de pesos mas cache de activaciones), y del orden de 250 MB en fp32.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo cabe en GPUs integradas y en tarjetas de gama baja como GTX 1650 o RTX 3050.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el codigo se distribuye como paquete Python propio (`model.py`, `attention.py`, `layers.py`) con checkpoint `.pt`, por lo que la integracion requeriria adaptar el codigo del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| TiTi Bot | 63,52 M | no disponible | Filtrado y extraccion en vietnamita | no disponible |
| DistilBERT (multilingue) | 66 M | 512 tokens | Clasificacion/encoder | Apache 2.0 |
| PhoBERT-base | ~135 M | 256 tokens | Encoder vietnamita | MIT |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | LLM generativo multilingue | Apache 2.0 |

La comparacion es aproximada: TiTi Bot es un decoder con cabezas auxiliares, mientras que DistilBERT y PhoBERT son encoders de clasificacion y Qwen2.5-0.5B es un LLM generativo. TiTi Bot ofrece un tamano menor que todos ellos y una especializacion en vietnamita mas agresiva, pero carece de benchmarks publicados y de licencia declarada, lo que limita su comparacion objetiva.

## Limitaciones y advertencias

- No hay evidencia publica de entrenamiento real: la model card describe inicializacion de pesos y pruebas de forma, no un modelo convergido con perdida reportada.
- Ausencia total de benchmarks: no se puede verificar calidad en filtrado, extraccion o generacion.
- Licencia no especificada: impide evaluar uso comercial y obliga a contactar al autor.
- Vocabulario exclusivamente vietnamita: el modelo no es util para otros idiomas y puede degradarse con texto mixto vietnamita-ingles.
- Longitud de contexto no documentada: no se puede planificar su uso en documentos largos.
- Riesgo de alucinacion en la cabeza causal: al ser un modelo diminuto y sin ajuste por instrucciones, la generacion libre sera limitada; la cabeza de span es la via recomendada para evitar invencion.
- Sesgos desconocidos: no se documenta composicion del corpus ni evaluacion de sesgos.
- Proyecto personal sin gobernanza: sin releases versionadas, sin issues publicos ni mantenimiento garantizado.
- Formato de pesos propietario (`.pt`): requiere cargar codigo del autor, con el riesgo de seguridad que implica ejecutar Python de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thengbeo/titi-bot
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
