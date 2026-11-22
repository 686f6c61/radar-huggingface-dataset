# zhiman-ai/Micius-27B

## Resumen

Micius-27B es un modelo multimodal de 27.356.728.560 parámetros desarrollado por zhiman-ai, disenado especificamente para trabajo cientifico e ingenieria, con foco principal en ingenieria de semiconductores. Acepta entradas de texto, imagen y video, soporta razonamiento profundo y ofrece una ventana de contexto nativa de hasta 262.144 tokens. La arquitectura se describe como un modelo de lenguaje causal con un codificador de vision, empaquetado bajo la etiqueta `qwen3_5` en Hugging Face, lo que sugiere una base derivada de la familia Qwen 3.5.

El modelo se presenta como la version publica de lo que el informe tecnico de preview denomina Micius-Flash, publicado el 4 de noviembre de 2026. Su propuesta de valor se centra en cuatro areas: conocimiento y razonamiento sobre semiconductores, generacion de codigo de hardware (Verilog, VHDL, RTL, netlists), comprension de artefactos visuales de ingenieria (esquematicos, PCBs, formas de onda, layouts) y agentes que usan herramientas. Esto lo posiciona en un nicho muy concreto frente a los modelos generalistas multimodales.

La relevancia actual radica en que la mayoria de los modelos abiertos de 27B son de proposito general; Micius-27B apuesta por una especializacion vertical con un pipeline de datos basado en un "knowledge tree" de semiconductores y entrenamiento con verificacion por ejecucion (compilacion, simulacion, sandbox). El checkpoint se distribuye en BF16 safetensors (11 shards, aproximadamente 54,7 GB) y la licencia no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de vision (etiqueta `qwen3_5`) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, 11 shards, ~54,7 GB) |
| Modalidades de entrada | texto, imagen y video |
| Pipeline | image-text-to-text |
| Libreria | transformers (>=5.16.1 recomendada) |

## Arquitectura y entrenamiento

La model card describe Micius-27B como un modelo de lenguaje causal con un codificador de vision, capaz de procesar texto, imagen y video. La etiqueta `qwen3_5` en Hugging Face sugiere que la base arquitectonica proviene de la familia Qwen 3.5, aunque no se detallan en la informacion disponible el numero de capas, dimensiones ocultas, atencion (completa o hibrida), ni el tamano del codificador de vision.

El entrenamiento se organiza en un "data flywheel" de bucle cerrado con tres etapas: (1) construccion y expansion de un arbol de conocimiento que organiza conceptos, dependencias, estandares, referencias, codigo y papers de semiconductores en una jerarquia y grafo estructurados; (2) sintesis de datos dirigida a partir de nodos de conocimiento, evidencia fuente, repositorios, manuales y escenarios reales de ingenieria, generando tareas de razonamiento, codigo, vision y agentes; (3) validacion de calidad con comprobaciones de diversidad, dificultad, solubilidad, correccion de respuestas, soporte en fuentes, compilacion, simulacion y ejecucion, realimentando los fallos hacia los nodos de conocimiento debiles. El informe menciona mas de 20 datasets con aproximadamente 15.000 registros.

En post-entrenamiento se entrenan profesores especializados (conocimiento y razonamiento de dominio, codigo de hardware, comprension multimodal y tareas agenticas), se hace un calentamiento del modelo estudiante y se consolidan las capacidades complementarias mediante destilacion on-policy multi-profesor (MOPD). Los ejemplos de codigo y agenticos se verifican con compilacion, simulacion, ejecucion en sandbox u otra verificacion especifica de la tarea cuando aplica. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento profundo, con soporte de modo de pensamiento segun la descripcion de "deep reasoning".
- Comprension multimodal nativa de imagen y video: diagramas, esquematicos, formas de onda, layouts, documentos y artefactos de ingenieria.
- Generacion de codigo de hardware: Verilog, VHDL, RTL, netlists y tareas de diseno de circuitos y PCBs.
- Razonamiento sobre conocimiento de semiconductores: fisica, microelectronica, circuitos y campos electromagneticos.
- Soporte de agentes y razonamiento multi-paso, con capacidad de invocar herramientas (se menciona un harness externo con Capability Broker y runtime de ejecucion remota).
- Tool calling / function calling: implicito en las capacidades agenticas descritas, aunque no se detalla el esquema exacto en la informacion disponible.
- Capacidades generales de matematicas y conocimiento (resultados en HMMT y MMLU-Pro).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion y revision de RTL en produccion: el modelo puede producir modulos Verilog o VHDL a partir de especificaciones en lenguaje natural y verificar su correccion mediante compilacion y simulacion, integrándose en pipelines de CI/CD de equipos de diseno de chips. Sus resultados en VerilogEval-v2 (86,8) y RTLLM-v2 (79,1) lo respaldan para esta tarea.
- Analisis de esquematicos y PCBs: dado que acepta imagenes, puede interpretar esquematicos, layouts y placas para responder preguntas de ingenieria, detectar inconsistencias o generar documentacion tecnica, apoyandose en su ventana de 262.144 tokens para adjuntar multiples artefactos en una misma sesion.
- Agentes de automatizacion de flujo de diseno: con soporte agentico y tool calling, puede orquestar herramientas de EDA, lanzar simulaciones y validar resultados, como sugiere su puntuacion de 62,41 en Semiconductor Agent y 83,3 en PCB Agent.
- Asistente de documentacion tecnica de semiconductores: puede resumir manuales, datasheets y papers, y responder preguntas de dominio con trazabilidad a las fuentes, gracias al entrenamiento sobre un arbol de conocimiento estructurado.
- Generacion de codigo de verificacion y testbenches: puede escribir y validar testbenches, scripts de simulacion y comprobaciones de reglas de diseno (DRC), donde destaca en Rule2DRC (48,3 frente a 4,9 de la referencia del mismo tamano).
- Analisis de formas de onda y resultados de simulacion: al aceptar video e imagen, puede interpretar capturas de osciloscopio o trazas de simulacion para diagnosticar fallos en circuitos.
- Formacion y soporte a ingenieros: puede actuar como tutor tecnico en fisica, microelectronica y diseno de hardware, con resultados solidos en SuperGPQA (Physics 70,49, Microelec 84,0).

## Benchmarks y rendimiento

Resultados reportados por el equipo de Micius en el informe tecnico de preview. Son porcentajes; mayor es mejor. No constituyen una reproduccion independiente.

| Categoria | Benchmark | Micius-27B | Referencia mismo tamano |
|---|---|---:|---:|
| Razonamiento y conocimiento | SemiBench | 49,70 | 42,51 |
| Razonamiento y conocimiento | SuperGPQA (Circuits) | 72,22 | 70,37 |
| Razonamiento y conocimiento | SuperGPQA (Emfield) | 86,36 | 84,09 |
| Razonamiento y conocimiento | SuperGPQA (Microelec) | 84,00 | 76,00 |
| Razonamiento y conocimiento | SuperGPQA (Physics) | 70,49 | 63,93 |
| Vision | RFSchemBench | 72,40 | 66,80 |
| Vision | PCB-Bench | 80,60 | 80,00 |
| Vision | CircuitSense | 71,00 | 69,80 |
| Codigo | CVDP-static | 58,90 | 43,70 |
| Codigo | VerilogEval-v2 | 86,80 | 77,80 |
| Codigo | RTLLM-v2 | 79,10 | 65,10 |
| Codigo | ArchXBench | 53,50 | 50,70 |
| Codigo | NetlistBench | 83,80 | 69,80 |
| Codigo | VHDLBench | 76,20 | 70,90 |
| Codigo | Pluto | 72,40 | 62,10 |
| Codigo | NotSoTiny | 16,10 | 14,70 |
| Codigo | Rule2DRC | 48,30 | 4,90 |
| Codigo | PyHDL-Eval | 65,80 | 19,60 |
| Codigo | CreativEval | 79,20 | 71,70 |
| Codigo | ChipBench | 50,40 | 39,10 |
| Agentes | Semiconductor Agent | 62,41 | 45,22 |
| Agentes | GameCraft-Bench | 50,50 | 32,10 |
| Agentes | PCB Agent | 83,30 | 60,00 |
| Generales | HMMT | 87,90 | 81,82 |
| Generales | MMLU-Pro | 84,20 | 83,60 |

Resumen destacado del informe: 64,2 % de media en 12 benchmarks de codigo de hardware (15,0 puntos por encima de la referencia del mismo tamano); 62,4 % en Semiconductor Agent (17,2 puntos por encima); 72,4 % en RFSchemBench y 71,0 % en CircuitSense; 87,9 % en HMMT y 84,2 % en MMLU-Pro.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54,7 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto corto y bastante mas para contextos largos.
- En cuantizacion de 8 bits: alrededor de 27-30 GB de pesos, viable en una A100 40 GB o H100 80 GB con margen limitado.
- En cuantizacion de 4 bits: alrededor de 14-16 GB de pesos, lo que podria permitir ejecucion en GPUs consumer de gama alta (RTX 4090 24 GB, RTX 3090 24 GB), aunque no se confirman pesos GGUF o cuantizados en la informacion disponible.
- GPUs recomendadas para BF16: H100 80 GB, A100 80 GB, o multiples GPUs con tensor parallelism (por ejemplo, 2x A100 40 GB).
- Despliegue: transformers >= 5.16.1 con Accelerate y PyTorch; el uso de vLLM, TGI, llama.cpp u Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.
- Nota: el contexto de 262.144 tokens incrementa significativamente la KV cache; para contextos largos se requiere planificacion de memoria adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Enfoque |
|---|---:|---:|---|---|---|
| Micius-27B | 27,36B | 262.144 | texto, imagen, video | no disponible | Ingenieria y semiconductores |
| Qwen 3.5 (familia base) | no disponible | no disponible | no disponible | no disponible | Proposito general |
| Referencia "mismo tamano" del informe | no especificado | no disponible | no disponible | no disponible | Proposito general |

La model card solo compara con una "referencia del mismo tamano" sin nombrarla, por lo que no es posible identificar el modelo concreto. No se dispone de datos suficientes para una comparativa detallada con alternativas nombradas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial permitido; es imprescindible verificar los terminos antes de produccion.
- Idiomas soportados no disponibles: no se confirma el soporte de castellano ni de otros idiomas distintos del ingles tecnico.
- Riesgo de alucinacion en dominio tecnico: aunque el entrenamiento usa verificacion por ejecucion, la model card advierte que el RTL, disenos de circuitos, software y acciones de herramientas generados deben revisarse y validarse en un entorno adecuado antes de su uso.
- El harness (Micius Harness) y las herramientas especializadas no estan incluidos en el repositorio del modelo; las capacidades agenticas dependen de infraestructura externa.
- Resultados de benchmarks reportados por el propio equipo, sin reproduccion independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria inexistentes.
- El modelo esta especializado en semiconductores; su rendimiento en tareas generales fuera de ese dominio puede ser inferior al de modelos generalistas del mismo tamano.
- No se detallan sesgos conocidos ni la composicion exacta del dataset de entrenamiento.
- El contexto de 262.144 tokens exige recursos de memoria considerables; el despliegue en consumer GPU en BF16 no es viable.

## Enlaces

- Hugging Face: https://huggingface.co/zhiman-ai/Micius-27B
- Informe tecnico de preview: Micius-Flash: Lightweight Agentic Intelligence for Engineering (4 de noviembre de 2026), referencia citada en la model card; no se proporciona URL directa en la informacion disponible.
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
