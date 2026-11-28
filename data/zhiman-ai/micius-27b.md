# zhiman-ai/Micius-27B

## Resumen

Micius-27B (publicado como Micius-flash-1123) es un modelo multimodal de 27.356.728.560 parametros desarrollado por zhiman-ai, orientado especificamente a trabajo cientifico e ingenieria, con foco principal en ingenieria de semiconductores. Acepta entradas de texto, imagen y video, soporta razonamiento profundo y ofrece una ventana de contexto nativa de 262.144 tokens. Se distribuye como un modelo de lenguaje causal con encoder de vision, en formato BF16 safetensors repartido en 11 shards (aproximadamente 54,7 GB).

El modelo se describe en el informe tecnico de preview *Micius-Flash: Lightweight Agentic Intelligence for Engineering* (noviembre de 2026, arXiv:2611.10015). Su propuesta diferencial es la especializacion vertical: conocimiento y razonamiento sobre semiconductores, generacion de codigo de hardware (Verilog, VHDL, netlists, scripts de DRC), comprension de esquematicos, PCBs y diagramas, y agentes que usan herramientas. Todo ello combinado con capacidades generales de razonamiento y matematicas.

Es relevante ahora porque cubre un nicho escasamente atendido por los modelos generalistas: el diseno electronico y de semiconductores, donde las tareas exigen verificar codigo mediante compilacion o simulacion. La licencia es no comercial para investigacion, lo que condiciona fuertemente su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con encoder de vision (familia qwen3_5) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | zhiman-non-commercial-research-license-v1.0 |
| Formato de pesos | safetensors (BF16, 11 shards, ~54,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje causal con un encoder de vision que procesa entradas de texto, imagen y video. La etiqueta de Hugging Face lo situa en la familia qwen3_5, aunque no se detallan en la informacion disponible el numero de capas, dimensiones ocultas ni la configuracion exacta del encoder visual.

El entrenamiento se organiza en torno a un "data flywheel" de arbol de conocimiento: construccion y expansion de una jerarquia de conceptos, dependencias, estandares, referencias, codigo y papers de semiconductores; sintesis de datos dirigida a partir de esos nodos; y validacion de calidad con retroalimentacion de ejemplos dificiles. El informe menciona mas de 20 conjuntos de datos con aproximadamente 15.000 registros. En post-entrenamiento se entrenan profesores especializados (conocimiento de dominio, codigo de hardware, comprension multimodal y tareas agenticas) y se consolidan en un unico modelo mediante destilacion on-policy multi-profesor (MOPD). Los ejemplos de codigo y agenticos se verifican con compilacion, simulacion o ejecucion en sandbox cuando procede.

## Capacidades

- Generacion de texto y razonamiento profundo, con modo de razonamiento explicito.
- Conocimiento y razonamiento especializado en semiconductores, circuitos y electromagnetismo.
- Comprension multimodal de imagenes y video: esquematicos, diagramas, formas de onda, layouts, manuales y documentos tecnicos.
- Generacion de codigo de hardware: Verilog, VHDL, netlists, scripts de DRC y tareas de diseno de chips.
- Soporte de agentes con uso de herramientas (tool calling) y razonamiento multi-paso.
- Capacidades generales de matematicas y conocimiento (evaluadas en HMMT y MMLU-Pro).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion y revision de RTL: el modelo puede producir modulos Verilog o VHDL a partir de una especificacion y verificar su correccion mediante compilacion y simulacion, lo que encaja en flujos de diseno de hardware donde el codigo debe sintetizarse antes de integrarse.
- Interpretacion de esquematicos y PCBs: con entrada de imagen, puede analizar diagramas de circuito, layouts y documentacion de componentes para responder preguntas tecnicas o detectar inconsistencias.
- Asistente de agentes para ingenieria de semiconductores: su soporte de tool calling y contexto de 262.144 tokens permite encadenar pasos sobre repositorios, manuales y resultados de simulacion dentro de una misma sesion.
- Analisis de formas de onda y resultados de simulacion: la entrada de video e imagen permite interpretar graficas y trazas de senal para diagnosticar comportamiento de circuitos.
- Generacion de scripts de automatizacion EDA: puede redactar scripts de DRC, flujos de netlist y utilidades de verificacion, con validacion por ejecucion.
- Formacion y soporte tecnico interno: como asistente de consulta sobre estandares, dependencias de conceptos y referencias del dominio de semiconductores, apoyandose en su arbol de conocimiento.
- Prototipado de razonamiento cientifico general: sus resultados en HMMT y MMLU-Pro lo hacen util para tareas de matematicas y conocimiento fuera del nicho, siempre en contexto de investigacion.

## Benchmarks y rendimiento

Resultados publicados por el equipo de Micius en el informe de preview; no constituyen una reproduccion independiente. Porcentajes, mayor es mejor.

| Categoria | Benchmark | Micius-flash | Referencia mismo tamano |
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

El informe destaca un promedio de 64,2 % en 12 benchmarks de codigo de hardware, 15,0 puntos por encima de la referencia del mismo tamano, y 62,4 % en el benchmark Semiconductor Agent.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 54,7 GB, por lo que requiere al menos 2 GPU de 40 GB o una de 80 GB para cargar los pesos completos con margen para el contexto.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 con contexto largo; configuraciones multi-GPU para servir la ventana completa de 262.144 tokens.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB en BF16; se necesitarian cuantizaciones (no publicadas en la informacion disponible) para intentar su despliegue en RTX 4090 o similares.
- Opciones de despliegue: al estar en transformers y safetensors, es compatible con vLLM y TGI, aunque no se confirma soporte explicito en la informacion disponible; llama.cpp y Ollama requeririan conversion a GGUF, no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Micius-27B | 27,36 B | 262.144 | Multimodal ingenieria y semiconductores | No comercial (investigacion) | Hugging Face |
| Modelos generalistas de ~27-30 B | ~27-30 B | variable | Proposito general | variable | Hugging Face |
| Modelos especializados en codigo de hardware | no disponible | no disponible | RTL y verificacion | no disponible | no disponible |

La informacion proporcionada no identifica por nombre los modelos de referencia empleados en los benchmarks, por lo que la comparativa concreta con alternativas equivalentes no esta disponible.

## Limitaciones y advertencias

- Licencia zhiman-non-commercial-research-license-v1.0: restringe el uso comercial; es imprescindible revisar el texto completo antes de cualquier despliegue en produccion.
- Los benchmarks son resultados del propio equipo y no han sido reproducidos de forma independiente.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente critico en dominios tecnicos donde una respuesta erronea sobre un circuito o un estandar puede propagarse a un diseno.
- Idiomas soportados no documentados; el rendimiento fuera del ingles no esta garantizado.
- El contexto de 262.144 tokens exige recursos de memoria considerables y puede degradar la calidad en ventanas muy largas.
- El checkpoint solo se publica en BF16; no hay cuantizaciones oficiales, lo que limita el despliegue en hardware modesto.
- El corpus de entrenamiento descrito (aproximadamente 15.000 registros en mas de 20 datasets) es reducido, lo que puede limitar la cobertura fuera de los dominios representados.
- No se documentan sesgos conocidos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhiman-ai/Micius-27B
- Pagina del proyecto: https://zhiman.tech/models/micius
- Paper (arXiv:2611.10015): https://arxiv.org/abs/2611.10015
- Hugging Face Daily Paper: https://huggingface.co/papers/2611.10015
- Demo online: https://platform.zhiman.cn/console/chat
- Acceso API: https://platform.zhiman.cn/console
- Licencia: https://huggingface.co/zhiman-ai/Micius-Flash/blob/main/LICENSE
