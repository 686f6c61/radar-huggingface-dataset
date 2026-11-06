# TeamIDE/Ornith-1.5-9B-Pantheon-TT

## Resumen

Ornith-1.5-9B-Pantheon-TT es un paquete de pesos derivado de Ornith-1.5-9B, un modelo de lenguaje denso de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) desarrollado originalmente por ornith-ai. Este repositorio, publicado por TeamIDE, no contiene un modelo nuevo entrenado desde cero, sino un conjunto de artefactos adaptados para su ejecucion en aceleradores Tenstorrent Blackhole p150 dentro del stack Pantheon Local. Incluye el GGUF Q8_0 original sin modificar, una conversion a formato de tiles Bfp8 propia de la tarjeta y una cabeza de prediccion multi-token (MTP) afinada por TeamIDE para decodificacion especulativa.

Su relevancia es acotada pero muy concreta: permite desplegar un modelo conversacional de ~9B en hardware Tenstorrent sin pasos de conversion manuales, con un rendimiento medido de 40,8 tok/s en decodificacion a 7,4k de contexto y 37,9 tok/s a 14,6k, en modo greedy y con MTP activado. La licencia es MIT, lo que facilita el uso comercial, aunque la trazabilidad de la licencia upstream presenta matices que se detallan mas abajo.

La informacion publica disponible es escasa: no se documentan idiomas soportados, pipeline, composicion del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja unicamente lo verificable en el repositorio y en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Ornith-1.5-9B, construido sobre Qwen3.5, Apache-2.0); incluye cabeza MTP para decodificacion especulativa |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita; se han medido ejecuciones a 7,4k y 14,6k tokens |
| Tipos de cuantizacion | Q8_0 (GGUF); Bfp8 (formato de tiles Tenstorrent); Bfp8 con cabeza MTP |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q8_0), FTTW (Bfp8 tiles), FTTW con MTP (bfp8.mtp.fttw) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de aproximadamente 9,2B parametros. Segun la model card, Ornith esta construido sobre Qwen3.5, que se distribuye bajo Apache-2.0 por el equipo de Qwen. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica destacable de este repositorio no esta en el entrenamiento del modelo base, sino en el empaquetado para hardware especifico. TeamIDE ha convertido los pesos Q8_0 al formato de tiles Bfp8 que carga directamente la tarjeta Tenstorrent Blackhole p150 mediante Pantheon/Foundry, eliminando la necesidad de conversion en el dispositivo. Ademas, ha afinado (etiqueta `ft_all2`) la cabeza de prediccion multi-token del modelo para habilitar decodificacion especulativa en Pantheon. Esta cabeza MTP actua como modelo borrador que propone varios tokens por paso, que el modelo principal verifica, incrementando el throughput de decodificacion.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational`, orientado a dialogos multi-turno.
- Decodificacion especulativa mediante cabeza MTP afinada, que acelera la generacion en el stack Pantheon.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs compatibles con el formato habitual de servidores de inferencia.
- Capacidades de razonamiento, codigo, matematicas, vision o audio: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal es ejecutar un modelo conversacional de ~9B en una tarjeta Blackhole p150 sin pasos de conversion manuales, cargando directamente el fichero `.bfp8.fttw` a traves de Pantheon Local.
- Inferencia de baja latencia en local: con 40,8 tok/s a 7,4k de contexto y 37,9 tok/s a 14,6k en modo greedy con MTP, resulta adecuado para asistentes interactivos en entornos con aceleradores Tenstorrent donde no se dispone de GPU NVIDIA.
- Sustitucion de GPUs en entornos de investigacion: equipos que ya trabajan con Blackhole p150 pueden incorporar un modelo de ~9B para prototipado de pipelines de NLP sin depender de CUDA.
- Chatbot de atencion al cliente en infraestructura propia: al ser un modelo conversacional con licencia MIT, puede desplegarse en instalaciones on-premise para gestionar dialogos multi-turno, siempre que se valide su calidad en el idioma objetivo (no documentada).
- Evaluacion de decodificacion especulativa: la cabeza MTP afinada permite estudiar el impacto del draft head en throughput y calidad, comparando con la generacion sin MTP.
- Base para fine-tuning posterior: al distribuirse pesos en GGUF Q8_0 y en formato de tiles, sirve como punto de partida para ajustes especificos sobre el modelo Ornith-1.5-9B en el ecosistema Pantheon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento medido es el throughput de decodificacion en Pantheon sobre una p150:

| Metrica | Valor |
|---|---|
| Decodificacion a 7,4k de contexto | 40,8 tok/s |
| Decodificacion a 14,6k de contexto | 37,9 tok/s |
| Configuracion de medida | Greedy, MTP activado, una Blackhole p150 |

## Requisitos de hardware

- Hardware objetivo: una tarjeta Tenstorrent Blackhole p150.
- VRAM/ memoria: no disponible de forma explicita; el repositorio ocupa 19,8 GB, lo que da una idea del espacio necesario para alojar los distintos formatos.
- GPU NVIDIA recomendadas: no aplica al objetivo principal; el GGUF Q8_0 puede ejecutarse en GPUs convencionales mediante llama.cpp, pero no se documentan requisitos.
- Cabe en GPU de consumo: no disponible; un modelo de ~9,2B en Q8_0 requiere del orden de 9-10 GB de memoria, pero no se confirma en la informacion.
- Opciones de despliegue: Pantheon Local (objetivo principal), llama.cpp u Ollama para el GGUF Q8_0 (no confirmado en la model card).
- Latencia y throughput: 40,8 tok/s a 7,4k de contexto y 37,9 tok/s a 14,6k en Blackhole p150 con MTP.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A continuacion se recoge lo que si es verificable:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ornith-1.5-9B-Pantheon-TT | ~9,2B | No disponible | MIT | Hugging Face (TeamIDE) |
| Ornith-1.5-9B (base) | ~9,2B | No disponible | MIT (segun model card) | Hugging Face (ornith-ai) |
| Qwen3.5 (base arquitectonica) | No disponible | No disponible | Apache-2.0 | No disponible |

## Limitaciones y advertencias

- Trazabilidad de licencia: la model card indica que los repositorios upstream no incluyen fichero LICENSE ni nombran titular de copyright; los terminos MIT se aplican a estos ficheros, incluidos los modificados. Conviene revisar la situacion legal antes de un uso comercial critico.
- Artefactos modificados: el fichero `.bfp8.fttw` es una conversion de formato y el `.mtp.fttw` incorpora una cabeza afinada por TeamIDE; no son pesos identicos al modelo original y su comportamiento puede diferir.
- Idiomas no documentados: no se especifica que idiomas soporta, por lo que la calidad en castellano u otros idiomas no esta garantizada.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; al ser un modelo de ~9B, es esperable un riesgo de alucinacion no cuantificado.
- Contexto maximo no confirmado: solo se han medido ejecuciones hasta 14,6k tokens; no se conoce la ventana maxima oficial.
- Dependencia de hardware: el objetivo principal es Tenstorrent Blackhole p150; fuera de ese ecosistema, el uso del GGUF Q8_0 no esta validado en la model card.
- Adopcion muy baja: 26 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de la comunidad sobre su comportamiento en produccion.
- Sin benchmarks: no hay datos de calidad (razonamiento, codigo, matematicas) que permitan estimar su rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TeamIDE/Ornith-1.5-9B-Pantheon-TT
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- GGUF del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Repositorio de Pantheon: https://git.teamidev.dev/David/Pantheon
