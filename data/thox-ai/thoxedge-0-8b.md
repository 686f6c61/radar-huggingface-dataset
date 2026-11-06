# Thox-ai/ThoxEdge-0.8B

## Resumen

ThoxEdge-0.8B es un modelo de generación de texto de pequeno tamano (752 millones de parametros segun los pesos en safetensors) desarrollado por Thox-ai. Se trata de un ajuste fino por SFT sobre el modelo base Qwen/Qwen3.5-0.8B, cuyo adaptador LoRA (publicado en Thox-ai/ThoxEdge-0.8B-WaveC) se ha fusionado en los pesos base en bf16 para producir una build servible directamente. El modelo esta disenado para despliegue en dispositivo ("on-device" / edge) y sigue una filosofia "local-first", con soporte para Ollama y llama.cpp.

El objetivo declarado del modelo es responder a partir de hechos canonicos de THOX y abstenerse (declinar respuesta) cuando THOX no ha publicado informacion sobre algo. Es, por tanto, un modelo orientado a un dominio acotado y a un comportamiento de abtencion controlado, no un asistente generalista. El autor reporta una puntuacion de 46/49 en su propio conjunto de evaluacion interno (GATE49, conjunto de desarrollo, ponderado por abtencion) sin fallos duros conocidos como falsos.

La relevancia actual del modelo reside en su tamano reducido y su empaquetado listo para consumo: pesos fusionados en bf16, cuantizaciones GGUF Q4_K_M y Q8_0, y un Modelfile de Ollama. Esto lo hace desplegable en equipos con 8 GB de RAM. La licencia Apache-2.0 y su caracter publico y sin gating facilitan su uso comercial, aunque su alcance funcional esta limitado por el corpus de entrenamiento y el idioma (solo ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), usada en modo solo texto |
| Parametros totales | 752.393.024 (segun safetensors); el autor lo denomina "0.8B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el Modelfile de ejemplo configura 4096 tokens |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, una arquitectura transformer de la familia Qwen3.5. Segun la model card, Qwen3.5 es una arquitectura multimodal, pero en esta build se usa exclusivamente en modo texto: la torre de vision no ha sido modificada por el adaptador y el repositorio no incluye fichero `mmproj`, por lo que no hay entrada de imagen en ningun canal de despliegue.

El entrenamiento consiste en un ajuste fino supervisado (SFT) realizado por THOX sobre su propio dataset Thox-ai/thox-factory-sft-v5, que el autor describe como un corpus de 982 filas. El adaptador LoRA resultante (Wave C) se fusiono en los pesos base en bf16 dentro de este repositorio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El comportamiento diferencial del modelo (grounding sobre hechos canonicos de THOX y abtencion ante lo no publicado) proviene de la configuracion de sistema incluida en el Modelfile de Ollama, no de los pesos por si solos.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a respuestas fundamentadas en el corpus canonico de THOX.
- Abtencion controlada: el modelo esta entrenado para declinar responder cuando la informacion no ha sido publicada por THOX.
- Despliegue en dispositivo y local-first: pesos GGUF y Modelfile listos para Ollama y llama.cpp.
- Compatibilidad con API OpenAI a traves de `llama serve` (endpoint `/v1/chat/completions`).
- Plantilla de chat propia (`chat_template.jinja`) embebida en los GGUF.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multimodal no disponible en esta build: la torre de vision existe en la arquitectura base pero no se sirve (sin `mmproj`).
- Modo "thinking-off": el build de Ollama sirve el modelo con un prefill de pensamiento vacio; este comportamiento no se transfiere de forma verificada a otros canales.

## Casos de uso

- Asistente de atencion al cliente sobre catalogo cerrado: el modelo puede gestionar conversaciones multi-turno respondiendo solo con informacion publicada y declinando el resto, lo que encaja en escenarios donde se prefiere una abtencion explicita a una respuesta inventada.
- Base para un bot de FAQ interno: desplegado con Ollama en un equipo de 8 GB de RAM, sirve respuestas sobre un corpus acotado sin coste de API externa.
- Prototipado rapido en local: su huella de ~0.9 GB en Q4_K_M permite iterar en portatiles y estaciones de trabajo modestas antes de escalar a modelos mayores.
- Filtro de primera linea en pipelines de soporte: puede clasificar y responder consultas frecuentes, derivando al humano o a un modelo mayor las que requieran conocimiento fuera del corpus.
- Evaluacion de tecnicas de abtencion: util como banco de pruebas para estudiar el equilibrio entre responder y declinar en modelos pequenos con SFT dirigido.
- Despliegue en entornos con requisitos de soberania de datos: al ser local-first y Apache-2.0, permite ejecutar inferencia sin salida de datos a terceros.
- Integracion en aplicaciones de escritorio o moviles mediante llama.cpp: el formato GGUF y el API compatible con OpenAI facilitan su inclusion en clientes nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion reportado es interno:

| Evaluacion | Resultado | Conjunto | Notas |
|---|---|---|---|
| GATE49 | 46/49 | Conjunto de desarrollo (ponderado por abtencion) | Cero fallos duros conocidos como falsos; dos fallos duros de no-abtencion documentados como defecto residual |

No se proporcionan comparaciones numericas con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ocupa 0.529 GB en disco y aproximadamente 0.9 GB en total a 4k de contexto (~1.0 GB a 8k); Q8_0 ocupa 0.812 GB y aproximadamente 1.2 GB a 4k (~1.3 GB a 8k). Son estimaciones del autor, no mediciones en tiempo de ejecucion.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, el modelo cabe en cualquier GPU consumer con 4 GB o mas de VRAM.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna; tambien puede ejecutarse en CPU.
- Tier de host recomendado por el autor: 8 GB de RAM.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxedge-0.8b`), llama.cpp / Llama (`llama serve -hf Thox-ai/ThoxEdge-0.8B:Q4_K_M`), transformers con safetensors. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| ThoxEdge-0.8B | 752 M | no disponible (ejemplo a 4096) | Apache-2.0 | safetensors, GGUF (Q4_K_M, Q8_0) | SFT sobre Qwen3.5-0.8B, solo ingles, orientado a abtencion |
| Qwen/Qwen3.5-0.8B (base) | ~0.8 B | no disponible | Apache-2.0 | safetensors | Modelo base sin ajuste; arquitectura multimodal |
| Alternativas de ~1B de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance funcional muy acotado: el modelo esta ajustado para responder sobre hechos canonicos de THOX y declinar el resto; su utilidad fuera de ese dominio es limitada.
- Solo ingles: no se documenta soporte de castellano ni de otros idiomas.
- Defecto residual conocido: dos fallos duros de no-abtencion en el conjunto GATE49 (prefill no-decline), documentados por el autor.
- Riesgo de alucinacion: aunque el entrenamiento busca la abtencion, no se ofrecen garantias formales; en produccion debe validarse la salida contra el corpus.
- El comportamiento completo de THOX (prompt de grounding y configuracion gated) solo se sirve en el build de Ollama; al ejecutarlo "bare" en llama.cpp con el GGUF, se pierde ese comportamiento.
- El modo thinking-off no se transfiere de forma verificada a canales distintos de Ollama; puede aparecer preambulo de deliberacion en el canal de contenido.
- Sin vision en esta build: no hay `mmproj`, por lo que no se aceptan imagenes aunque la arquitectura base sea multimodal.
- El contexto maximo real no esta documentado; el ejemplo de configuracion usa 4096 tokens.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las obligaciones de atribucion y las condiciones del modelo base Qwen.
- El tamano del repositorio (7.0 GB) incluye todos los formatos; conviene descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxEdge-0.8B
- Adaptador LoRA Wave C: https://huggingface.co/Thox-ai/ThoxEdge-0.8B-WaveC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de SFT: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
