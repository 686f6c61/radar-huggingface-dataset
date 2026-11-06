# yakkshit/neurograph

## Resumen

NeuroGraph es un modelo experimental de 17,8 millones de parametros desarrollado por CedzLabs, publicado en Hugging Face por el usuario yakkshit. Se trata de un transformer de arquitectura "Deep-Narrow" (profunda y estrecha: 24 capas con dimension 256 y 8 cabezas de atencion) entrenado para generar grafos de conocimiento estructurados en JSON, con puntuaciones de confianza por nodo. Su proposito no es funcionar como modelo generativo de proposito general, sino actuar como "cerebro rapido" en un sistema de inferencia en cascada: analiza la consulta del usuario, identifica que informacion le falta y decide cuando llamar a herramientas MCP (Model Context Protocol) o cuando escalar a modelos grandes como GPT-4 o Claude.

La idea subyacente es reducir coste y latencia en pipelines de IA: en lugar de enviar cada peticion a un LLM grande, NeuroGraph clasifica y estructura la consulta en milisegundos, resolviendo localmente lo que puede, enriqueciendo con llamadas a herramientas lo que necesita contexto y escalando solo lo imprescindible. El modelo se distribuye en formato GGUF (aproximadamente 12,1 MB en cuantizacion Q4_K_M), lo que lo hace trivial de desplegar incluso en CPU o dispositivos muy modestos.

Es importante subrayar que se trata de una prueba de concepto (proof-of-concept) de investigacion, no de un modelo listo para produccion. Su vocabulario es de solo 8.192 tokens BPE personalizados y fue entrenado con 35.668 ejemplos, por lo que sus capacidades linguisticas y de razonamiento son muy limitadas. Su valor principal esta en el esquema estructural de salida y el sistema de confianza por nodo, que sirven como base para arquitecturas de enrutamiento cognitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Deep-Narrow (24 capas, dim=256, 8 cabezas de atencion) |
| Parametros totales | 17,8 millones (19.935.488 segun safetensors) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 512 tokens (valor recomendado en el Modelfile de Ollama) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

NeuroGraph emplea una arquitectura transformer "Deep-Narrow": en lugar de la proporcion habitual entre capas y dimension de embedding, apila 24 capas con una dimension muy reducida (256) y 8 cabezas de atencion. Esta configuracion prioriza profundidad de procesamiento sobre ancho, con el objetivo de maximizar capacidad de estructuracion con un presupuesto de parametros minimo. Utiliza Split-Half RoPE como codificacion posicional, una variante de RoPE compatible con llama.cpp, lo que facilita su ejecucion en ese runtime.

El modelo fue entrenado con 35.668 ejemplos que combinan codigo, razonamiento, conocimiento y datos sinteticos. No hay informacion disponible sobre el proceso de alineacion posterior (RLHF, DPO) ni sobre la duracion o el hardware del entrenamiento. La innovacion principal no es tanto la arquitectura en si como el esquema de salida: el modelo emite grafos de conocimiento JSON donde cada nodo lleva una puntuacion de confianza y una fuente ("model_knowledge" para conocimiento interno, "pending_mcp" para informacion que requiere una llamada a herramienta), permitiendo que un orquestador externo decida el siguiente paso de la cascada de inferencia.

## Capacidades

- Generacion de grafos de conocimiento estructurados en JSON, con nodos, aristas y puntuaciones de confianza por nodo.
- Deteccion de lagunas de conocimiento: marca nodos con baja confianza como pendientes de herramientas MCP, incluyendo el nombre de la herramienta y sus argumentos (por ejemplo, `read_file` con una ruta).
- Tool calling mediante MCP: el formato de salida esta disenado para que un orquestador externo ejecute las llamadas a herramientas indicadas.
- Escalado a modelos mayores: los nodos de muy baja confianza pueden disparar la escalacion a LLM grandes (GPT-4, Claude) con contexto preempaquetado.
- Analisis de consultas y clasificacion rapida como primera etapa de un pipeline de inferencia en cascada.
- Salida compatible con llama.cpp y Ollama, lo que permite integrarlo en flujos locales sin GPU.
- No esta disenado para razonamiento complejo multi-paso ni para generacion de texto de calidad: el propio autor indica que la salida puede contener repeticiones.

## Casos de uso

- Enrutamiento de consultas en sistemas RAG: NeuroGraph puede actuar como primer filtro que determina si una pregunta se responde con conocimiento interno, requiere recuperacion de documentos o necesita un LLM grande, ahorrando coste en las dos primeras vias.
- Orquestacion de agentes con MCP: su salida JSON con campos `mcp_tool` y `mcp_args` se integra directamente con servidores MCP para leer ficheros, consultar logs o ejecutar busquedas antes de generar una respuesta final.
- Triaje de errores de codigo: ante un error como `IndexError: list index out of range`, el modelo construye un grafo que separa el problema identificado del contexto de codigo pendiente de leer, preparando la escalada al modelo grande solo con lo necesario.
- Reduccion de costes en atencion al cliente: como clasificador previo, puede decidir que conversaciones se gestionan con reglas locales, cuales requieren consulta a una base de conocimiento y cuales escalan a un agente humano o a un LLM costoso.
- Prototipado de arquitecturas de inferencia en cascada: al ser una prueba de concepto con licencia MIT y peso de 12 MB, es util como base para experimentar con enrutamiento cognitivo sin necesidad de GPU.
- Procesado en dispositivos con recursos muy limitados: su tamano minimo permite ejecutarlo en CPU, Raspberry Pi o edge devices como etapa de analisis previo.
- Generacion de metadatos estructurados: la salida JSON con confianza por nodo puede usarse para anotar consultas en logs y analizar patrones de escalado en un sistema de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente insignificante; el GGUF en Q4_K_M ocupa aproximadamente 12,1 MB, por lo que cabe en cualquier GPU moderna o funciona directamente en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier hardware es suficiente dado el tamano del modelo.
- Consumer GPUs: cabe con holgura en cualquier GPU consumer actual (incluso integradas), al igual que en CPU.
- Opciones de despliegue: Ollama (con Modelfile, como muestra la model card), llama.cpp (la codificacion Split-Half RoPE es compatible) y la libreria `transformers` de Hugging Face con los pesos safetensors. No hay mencion de soporte para vLLM o TGI.
- Latencia y throughput: no disponibles; por tamano y arquitectura se espera latencia muy baja, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| NeuroGraph | 17,8 M | 512 tokens | MIT | Enrutador cognitivo, salida de grafos de conocimiento JSON |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Qwen Research / comercial con condiciones | LLM generalista compacto |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache 2.0 | LLM generalista muy pequeno |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | LLM generalista compacto |

NeuroGraph no compite con estos modelos en capacidad generativa: es varios ordenes de magnitud mas pequeno y su salida esta limitada a esquemas estructurados. Su ventaja diferencial es el coste de inferencia casi nulo y el formato de salida orientado a orquestacion con herramientas, algo que los LLM generalistas no ofrecen de forma nativa.

## Limitaciones y advertencias

- Es una prueba de concepto de investigacion, no un modelo de produccion: el propio autor advierte que no esta disenado para razonamiento complejo multi-paso.
- Con solo 17,8 millones de parametros y un vocabulario de 8.192 tokens, sus capacidades linguisticas son muy limitadas.
- La salida puede contener repeticiones; el valor principal esta en el esquema estructural, no en el texto generado.
- Sesgos conocidos: no disponible; no hay documentacion sobre sesgos del dataset de entrenamiento.
- Riesgo de alucinacion: elevado por tamano y datos de entrenamiento reducidos; el sistema de confianza por nodo esta pensado precisamente para mitigarlo en cascada, pero las puntuaciones no han sido validadas publicamente.
- Longitud de contexto muy corta (512 tokens recomendados), insuficiente para documentos largos o conversaciones extensas.
- Idiomas soportados: no documentados; probablemente limitado al ingles dado el dataset de entrenamiento.
- Licencia MIT sin restricciones de uso comercial, pero al ser un modelo experimental se recomienda evaluacion exhaustiva antes de cualquier despliegue real.
- El proyecto tiene muy poca traccion publica (41 descargas y 1 like en el momento de la ficha), por lo que el mantenimiento y la documentacion pueden ser limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yakkshit/neurograph
- Web de CedzLabs (desarrollador): https://cedzlabs.com
- Paper, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
