# Stray2024/BASE-1.5B-GGUF

## Resumen

BASE-1.5B (GGUF Edition) es una version cuantizada del modelo BASE-1.5B desarrollado por Stray2024, un modelo de lenguaje compacto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) orientado a conversacion y razonamiento paso a paso. La distribucion en formato GGUF esta pensada para su ejecucion en llama.cpp, Ollama y LM Studio, incluyendo equipos de bajos recursos y telefonos moviles. El modelo se publica bajo licencia Apache 2.0 y declara soporte para ruso e ingles.

La caracteristica principal que declara el autor es un modo de razonamiento interno delimitado por etiquetas `<think>...</think>`, inspirado en DeepSeek-R1, mediante el cual el modelo genera una cadena de razonamiento antes de entregar la respuesta final. El autor lo presenta como util tanto para programacion en Python como para conversacion natural. La model card menciona una ventana de contexto de hasta 32.000 tokens y una unica cuantizacion publicada, Q4_K_M, de 940 MB.

La relevancia de este modelo es limitada pero concreta: ocupa el nicho de modelos de razonamiento muy pequenos y desplegables en hardware minimo. No obstante, la informacion publica es escasa (sin pipeline declarado, sin benchmarks, sin detalle de datos de entrenamiento), por lo que cualquier evaluacion de calidad debe hacerse mediante prueba directa y no a partir de las afirmaciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de la familia Qwen2, segun los tags del repositorio); detalles no disponibles |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.000 tokens (segun la model card) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado: `BASE-1.5B-Q4_K_M.gguf`, 940 MB) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors en el modelo base `Stray2024/BASE-1.5B` |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo con `qwen2`, lo que indica que la arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con atencion causal estandar y normalizacion RMSNorm, aunque la model card no detalla la configuracion exacta de capas, cabezas de atencion ni dimension del embedding. El modelo base es `Stray2024/BASE-1.5B`, del que esta publicacion es una cuantizacion GGUF generada presumiblemente con herramientas del ecosistema Unsloth (tag `unsloth`) para llama.cpp.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni sobre el proceso de alineacion. La unica innovacion tecnica declarada es el modo de razonamiento explicito dentro de etiquetas `<think>...</think>`, que separa la cadena de pensamiento de la respuesta final; no se documenta si este comportamiento proviene de entrenamiento especifico, de destilacion o de prompting de sistema. Tampoco hay datos sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno en ruso e ingles.
- Razonamiento paso a paso en modo "thinking" mediante etiquetas `<think>...</think>` antes de la respuesta final.
- Generacion de codigo, con enfasis declarado en Python.
- Analisis de casos limite en codigo y de contexto conversacional segun la model card.
- Conversacion general orientada a un tono natural, sin "plantillas roboticas" segun el autor.
- Compatibilidad con endpoints y despliegue via llama.cpp, Ollama y LM Studio.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni multimodalidad.
- Cobertura multilingue limitada a ruso e ingles; el castellano no figura entre los idiomas soportados.

## Casos de uso

- Asistente conversacional local en ruso o ingles: el modelo puede mantener dialogos multi-turno con hasta 32.000 tokens de contexto, lo que permite conservar historial extenso en un equipo de escritorio sin GPU dedicada.
- Generacion de codigo Python en entornos con recursos limitados: su tamano de 1,5 B y la cuantizacion Q4_K_M permiten autocompletado y generacion de scripts en portatiles modestos o incluso en movil mediante Ollama.
- Razonamiento trazable para depuracion: el bloque `<think>` expone el razonamiento intermedio, lo que facilita auditar por que el modelo llego a una conclusion en tareas de analisis de codigo o logica.
- Prototipado rapido de aplicaciones LLM: al ejecutarse con `ollama run hf.co/Stray2024/BASE-1.5B-GGUF` en un solo comando, sirve para validar pipelines de prompting y de parseo de etiquetas antes de migrar a modelos mayores.
- Educacion y demostraciones de razonamiento: util para mostrar en un aula o tutorial como un modelo pequeno estructura una cadena de pensamiento antes de responder, sin necesidad de infraestructura cloud.
- Despliegue en dispositivos de borde: su huella de 940 MB en disco y su bajo requisito de memoria lo hacen candidato para aplicaciones offline en moviles o sistemas embebidos con llama.cpp.
- Traduccion y asistencia bilingue ruso-ingles: aunque no se declara como modelo de traduccion, su cobertura de ambos idiomas permite tareas basicas de reescritura y adaptacion de texto entre ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB con la cuantizacion Q4_K_M (fichero de 940 MB mas overhead de contexto KV); con contexto de 32k tokens la cache KV incrementa el consumo de forma apreciable.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores no tendran problemas. En GPU de datacenter (A100, H100) el modelo esta sobredimensionado en infraestructura y solo tendria sentido por agregacion de muchas instancias.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas, y tambien en CPU pura.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run hf.co/Stray2024/BASE-1.5B-GGUF`), LM Studio; al ser GGUF no es compatible directamente con vLLM ni TGI sin conversion a otro formato.
- Latencia y throughput: no disponibles; por tamano, en CPU moderna se espera una generacion interactiva (del orden de decenas de tokens por segundo), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BASE-1.5B (GGUF) | 1,54 B | 32k (declarado) | Apache 2.0 | GGUF en HF | Modo `<think>`, ru/en |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | safetensors, GGUF | Base arquitectonica probable; multilingue amplio, benchmarks publicos |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32.768 (segun configuracion) | MIT (modelo derivado) | safetensors, GGUF | Razonamiento destilado, benchmarks publicos |
| Llama 3.2 1B Instruct | 1,24 B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Multilingue, contexto muy amplio, licencia con restricciones |

La comparativa se limita a parametros, contexto y licencia porque no hay datos de rendimiento publicados para BASE-1.5B. Frente a Qwen2.5-1.5B-Instruct y DeepSeek-R1-Distill-Qwen-1.5B, el modelo de Stray2024 no aporta benchmarks verificables ni un ecosistema documentado, por lo que su eleccion frente a esas alternativas solo se justifica por preferencia o por el formato de razonamiento concreto.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: las afirmaciones de "inteligencia" y "razonamiento profundo" de la model card no estan respaldadas por evaluaciones verificables.
- Riesgo elevado de alucinacion: con 1,5 B de parametros y sin documentacion de alineacion, la fiabilidad factografica es baja, especialmente en dominios especializados.
- Cobertura idiomatica limitada a ruso e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- El modo `<think>` puede generar cadenas de razonamiento erroneas o circulares; en produccion conviene parsear y filtrar esos bloques.
- Sin soporte declarado de tool calling ni function calling, lo que limita su uso en pipelines de agentes.
- El contexto de 32k es una afirmacion del autor; no se documenta la calidad de la atencion en contextos largos ni si hubo entrenamiento especifico para ello.
- Modelo con 88 descargas y 0 likes en el momento de la consulta: ecosistema practicamente inexistente, sin issues ni validacion de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar presumiblemente de Qwen2 conviene verificar las obligaciones de atribucion de la licencia original de la familia base.
- No hay informacion sobre sesgos; por el corpus bilingue ru/en cabe esperar sesgos culturales de esos idiomas.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Stray2024/BASE-1.5B-GGUF
- Modelo base: https://huggingface.co/Stray2024/BASE-1.5B
- Perfil del autor: https://huggingface.co/Stray2024
- Ollama (ejecucion): `ollama run hf.co/Stray2024/BASE-1.5B-GGUF`
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
