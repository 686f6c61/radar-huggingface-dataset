# tinyopsec/Mavi-1.5B-GGUF

## Resumen

Mavi-1.5B-GGUF es la distribucion en formato GGUF del modelo sumeyragurlek/Mavi-1.5B, un ajuste fino de Qwen2.5-1.5B-Instruct orientado a asistencia ciudadana municipal en turco, desarrollado en el contexto del ayuntamiento de Martıkent Belediyesi. El autor de esta publicacion es el usuario tinyopsec, que ha generado las cuantizaciones con llama.cpp para facilitar su despliegue en entornos con recursos limitados. El modelo resuelve un problema muy concreto: atender consultas de ciudadanos sobre tramites, servicios y procedimientos municipales con un modelo pequeno que puede ejecutarse en CPU o GPUs de consumo.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el patron de especializacion vertical de modelos pequenos (1.543.714.304 parametros, aproximadamente 1,5B) mediante QLoRA sobre una base instruct solida como Qwen2.5. Por otro, demuestra como el ecosistema GGUF permite empaquetar un asistente de dominio especifico en ficheros de entre 2 y 3 GB, desplegables con llama.cpp, Ollama o LM Studio sin infraestructura dedicada. La licencia Apache 2.0 y la compatibilidad con endpoints facilitan su integracion en pipelines RAG y agenticos.

El modelo esta etiquetado con turkish, municipal-assistant, qlora, rag y agent, lo que indica un uso previsto como pieza de un sistema de recuperacion aumentada y como agente conversacional de atencion al ciudadano. No se dispone de informacion publica sobre el tamano de contexto efectivo tras el ajuste, la composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aprox. 1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct, no confirmada tras el ajuste) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Turco (uso previsto); resto no confirmado |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (13 ficheros de cuantizacion) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU, en la linea de la familia Qwen2.5. Sobre esa base se aplico un ajuste fino con QLoRA (cuantizacion de bajo rango) segun las etiquetas del repositorio, lo que sugiere un entrenamiento eficiente en memoria sobre un corpus de dominio municipal turco. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplico RLHF o DPO adicional.

La innovacion principal de esta publicacion no esta en el entrenamiento sino en la distribucion: el autor ha generado 13 cuantizaciones GGUF con llama.cpp, desde F16 (3,0 GB) hasta Q2_K, cubriendo el espectro completo de compromiso entre calidad y huella de memoria. Esto incluye la recomendacion explicita de Q4_K_M como opcion equilibrada. El repositorio ocupa 15,3 GB en total por acumular todas las variantes.

## Capacidades

- Generacion de texto conversacional en turco orientada a consultas ciudadanas municipales.
- Respuesta a preguntas sobre tramites, servicios y procedimientos del ayuntamiento de Martıkent Belediyesi.
- Integracion en pipelines RAG (etiqueta rag) para recuperar y citar informacion documental municipal.
- Uso como agente conversacional (etiqueta agent) con posible encadenamiento multi-turno.
- Compatibilidad con tool calling y function calling heredada de Qwen2.5-1.5B-Instruct, aunque no confirmada tras el ajuste.
- Capacidades multilingues limitadas: el ajuste esta orientado a turco; el rendimiento en castellano u otros idiomas no esta documentado.
- Ejecucion en CPU y GPU de consumo mediante llama.cpp, Ollama, LM Studio y koboldcpp.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.

## Casos de uso

- Atencion al ciudadano en mostrador digital: el modelo gestiona conversaciones multi-turno sobre tramites municipales en turco, adecuado por su ajuste de dominio y su baja huella de memoria (Q4_K_M en torno a 1 GB).
- Chatbot RAG sobre normativa municipal: combinado con un indice vectorial de documentos del ayuntamiento, el modelo recupera y sintetiza respuestas citando la fuente, aprovechando su etiqueta rag y su contexto heredado de Qwen2.5.
- Despliegue en infraestructura municipal modesta: al caber en CPU y GPUs de consumo, permite ejecutar el asistente en servidores sin GPU dedicada o en equipos de oficina.
- Prototipado rapido de asistentes verticales: sirve como plantilla para adaptar Qwen2.5-1.5B a otros dominios administrativos mediante QLoRA y redistribucion en GGUF.
- Agente de triaje de consultas: clasifica y deriva solicitudes ciudadanas a los departamentos correspondientes, usando tool calling si el runtime lo soporta.
- Asistencia interna a funcionarios: ayuda a redactar respuestas a instancias y a localizar procedimientos, con la ventaja de ejecucion local que evita enviar datos personales a la nube.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 13 variantes para medir el impacto de la cuantizacion en calidad sobre una tarea de dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K en torno a 0,8-1,0 GB; Q4_K_M aproximadamente 1,0-1,3 GB; Q5_K_M alrededor de 1,2-1,5 GB; Q8_0 cerca de 1,8-2,0 GB; F16 aproximadamente 3,0 GB (dato del autor para el fichero F16).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, GTX 1660); para F16 se recomienda 6 GB o mas (RTX 3060, RTX 4060 Ti). En A100/H100 el modelo es sobredimensionado para la GPU y el cuello de botella sera el ancho de banda, no la memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. Por el tamano (1,5B) se espera inferencia interactiva en CPU moderna y muy alta en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mavi-1.5B-GGUF | 1,54B | no disponible | Apache 2.0 | GGUF (13 cuantizaciones) | Ajuste QLoRA para turco municipal |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun Qwen) | Apache 2.0 | safetensors, GGUF | Base generalista multilingue |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Base generalista, licencia con restricciones |
| Gemma 2 2B IT | 2,6B | 8.192 tokens (segun Google) | Gemma Terms of Use | safetensors, GGUF | Base generalista, licencia con restricciones |

La comparativa es orientativa: Mavi-1.5B es un ajuste de dominio y no compite en benchmarks generales con las bases, sino en adecuacion a la tarea municipal turca y en facilidad de despliegue local.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (ayuntamiento de Martıkent Belediyesi): fuera de ese contexto su calidad puede degradarse notablemente.
- Riesgo de alucinacion en tramites, plazos y normativa: al ser un modelo de 1,5B, conviene anclar las respuestas con RAG y validacion humana en produccion.
- Idioma: el ajuste esta orientado a turco; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto efectiva no confirmada tras el ajuste QLoRA; no asumir los 32.768 tokens de Qwen2.5 sin verificacion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a la base sin ajustar.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) pueden degradar la calidad de forma apreciable en un modelo de 1,5B; se recomienda Q4_K_M o superior.
- Licencia Apache 2.0 permite uso comercial, pero el aviso del autor indica "evaluate before use"; verificar el cumplimiento de la licencia de Qwen2.5-1.5B-Instruct (tambien Apache 2.0).
- El repositorio acumula 15,3 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- Sin likes ni validacion comunitaria significativa (0 likes, 899 descargas): modelo con poca trazabilidad externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/Mavi-1.5B-GGUF
- Modelo base del ajuste: https://huggingface.co/sumeyragurlek/Mavi-1.5B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
