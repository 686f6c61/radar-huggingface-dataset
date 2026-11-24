# Walkowicz/kairos-sophia-2.5-9b

## Resumen

Kairos Sophia 2.5 · 9B es un ajuste fino correctivo del checkpoint Kairos Sophia 2.0, construido sobre el modelo base IFM/K2-Horizon-7B. Lo desarrolla el usuario Walkowicz y se distribuye principalmente en formato GGUF para su uso con Ollama y llama.cpp. El modelo está orientado a ingenieria de software, en particular a la modernizacion de sistemas legacy (COBOL, Java, Quarkus, Jakarta EE) y a flujos de trabajo agenticos con tool calling.

La propuesta del autor es corregir los defectos detectados en la version 2.0: contaminacion de anotaciones `javax.*` y de Spring en la generacion de COBOL, stubs de relleno, truncamiento del contexto de Ollama a 8192 tokens y desajustes en la plantilla ChatML. Segun la model card, la version 2.5 alcanza un 100% (7/7) en una suite de agentes sobre cuatro arneses (Kilo Code, Cline, Opencode y Bionic) y un 85,7% (12/14) en la evaluacion combinada de COBOL y agentes.

El modelo declara 8.999.178.240 parametros fisicos (unos 9,0B) y un contexto nativo de 512K tokens mediante RoPE. Se publica bajo licencia Apache 2.0, con soporte declarado de ingles y portugues (50/50 EN · PT-BR), y esta pensado para ejecutarse en GPU de consumo: el autor reporta 48,34–55,88 tok/s en una RTX 3060 de 12 GB con cuantizacion Q5_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (K2HorizonForCausalLM), backbone de 36 capas, hidden dim 4096, MLP SwiGLU de 12288 |
| Parametros totales | 8.999.178.240 (~9,0B); backbone transformer de 6,95B |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 512K tokens nativos (RoPE) |
| Tipos de cuantizacion | BF16, Q5_K_M, UD-Q3_K_XL (y variantes MLX bf16, 8bit, 5bit en repo aparte) |
| Idiomas soportados | en, pt (50/50 EN · PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la clase `K2HorizonForCausalLM`, un transformer decoder-only con 36 capas, dimension oculta de 4096 y MLP SwiGLU de 12288, que suma 6,95B parametros en el backbone y 8,999B en total. Emplea RoPE con una ventana nativa de 512K tokens y una plantilla Jinja propia (`k2_horizon`) con soporte de herramientas nativo.

El entrenamiento descrito es un ajuste fino correctivo sobre Kairos Sophia 2.0, que a su vez parte de IFM/K2-Horizon-7B. La model card menciona el uso de Unsloth y una calibracion de imatrix en GPU con 32 fragmentos (16K tokens) que alcanza una similitud coseno de 0,9992 frente a BF16. No se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Generacion de texto y codigo especializado en ingenieria de software.
- Modernizacion de sistemas legacy: traduccion de COBOL a Java, Quarkus y Jakarta EE.
- Tool calling y function calling con plantilla nativa de herramientas.
- Razonamiento agentico multi-paso (agentic coding) y razonamiento contrafactual (counterfactual reasoning).
- Integracion verificada con arneses de agentes: Kilo Code, Cline, Opencode y Bionic.
- Capacidades multilingues limitadas a ingles y portugues (PT-BR).
- Compatibilidad con endpoints y despliegue via Ollama y llama-server.

## Casos de uso

- Modernizacion de COBOL a Java: el modelo traduce programas COBOL a Java sin la contaminacion de anotaciones `javax.*` o Spring que afectaba a la version 2.0, lo que lo hace adecuado para migraciones por lotes de sistemas bancarios o de seguros.
- Migracion a Quarkus y Jakarta EE: genera codigo de servicios con las APIs correctas para stacks Java modernos, reduciendo la revision manual en proyectos de reescritura de aplicaciones empresariales.
- Agentes de codigo en IDE: se integra con Kilo Code, Cline y Opencode para tareas de edicion multi-archivo y ejecucion de herramientas dentro del editor, con un 100% de exito reportado en la suite de cuatro arneses.
- Automatizacion de refactorizaciones: al soportar tool calling, puede encadenar lecturas de repositorio, edicion y validacion en pipelines de CI/CD.
- Despliegue en estaciones de trabajo con GPU de consumo: con Q5_K_M (6,47 GB) cabe en una RTX 3060 de 12 GB y ofrece 48–55 tok/s, lo que permite asistencia de codigo local sin depender de la nube.
- Analisis de documentacion tecnica en ingles y portugues: util para equipos lusofonos que trabajan con documentacion de sistemas legacy en ambos idiomas.

## Benchmarks y rendimiento

| Evaluacion | Kairos Sophia 2.5 | Kairos Sophia 2.0 |
|---|---|---|
| COBOL + agentes (Ollama Q5) | 12/14 (85,7%) | 7/12 (58,3%) |
| Suite de 4 arneses de agentes (Q5) | 7/7 (100%) | no disponible |
| Throughput en RTX 3060 12 GB | 48,34–55,88 tok/s (prompt 1529+ tok/s, 32K ctx) | no disponible |
| Calibracion imatrix en GPU | 0,9992 coseno vs BF16 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q5_K_M ocupa 6,47 GB; UD-Q3_K_XL y BF16 requieren mas memoria (BF16 en torno a 18 GB por los 9B parametros).
- GPU recomendadas: RTX 3060 12 GB (verificada por el autor), RTX 4090, A100 y H100 para contextos largos o BF16.
- Cabe en GPU de consumo: si, en tarjetas con 8–12 GB usando Q5_K_M o cuantizaciones menores.
- Opciones de despliegue: Ollama, llama.cpp (`llama-server`), y variantes MLX para Apple Silicon en el repo `kairos-sophia-2.5-9b-mlx`.
- Latencia y throughput: 48,34–55,88 tok/s de generacion y 1529+ tok/s de prompt en RTX 3060 12 GB con contexto de 32K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kairos Sophia 2.5 9B | ~9,0B | 512K | Apache 2.0 | Codigo legacy y agentes |
| Kairos Sophia 2.0 | no disponible | no disponible | Apache 2.0 | Codigo legacy (predecesor) |
| IFM/K2-Horizon-7B | no disponible | 512K (heredado) | no disponible | Modelo base |

No se dispone de datos de benchmarks comparativos frente a modelos de proposito general de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a ingles y portugues; no se declara soporte de castellano.
- Riesgo de alucinacion en la generacion de codigo legacy, especialmente en APIs poco representadas en el entrenamiento.
- El rendimiento reportado (100% en 7/7) procede de una suite propia del autor con 7 tareas, muestra reducida que no garantiza generalizacion.
- La model card no detalla el dataset de entrenamiento ni si hubo alineacion (RLHF/DPO), lo que dificulta evaluar sesgos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base IFM/K2-Horizon-7B antes de uso comercial.
- Con 0 descargas y 0 likes en el momento de la ficha, no existe validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Walkowicz/kairos-sophia-2.5-9b
- Edicion MLX: https://huggingface.co/Walkowicz/kairos-sophia-2.5-9b-mlx
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
