# trinityomni/OpenThinkerAgent-32B-SFT-10K

## Resumen

OpenThinkerAgent-32B-SFT-10K es un modelo de lenguaje open source para tareas de agente, desarrollado por el proyecto OpenThoughts-Agent y publicado en HuggingFace bajo la cuenta trinityomni. Se trata de un fine-tuning de Qwen/Qwen3-32B con 32.000 millones de parámetros, entrenado con supervisión de trayectorias de agente (SFT) sobre el dataset OpenThoughts-Agent-SFT-10K, compuesto por 10.000 ejemplos de tareas de ingeniería de software, terminal y resolución de issues.

El modelo está diseñado para seguir instrucciones complejas en entornos de agente, con capacidades de razonamiento multi-paso y uso de herramientas. Su relevancia radica en que aborda el creciente interés en modelos agenticos open source, ofreciendo una alternativa fine-tuneada sobre Qwen3-32B con mejoras notables en benchmarks de agentes como SWE-Bench-Verified-100, OpenThoughts-TBLite y Terminal-Bench 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-32B) |
| Parametros totales | 32.000 millones (32B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-32B, un transformer denso de 32.000 millones de parámetros, y aplica un fine-tuning completo de parámetros (full-parameter SFT) sobre el dataset OpenThoughts-Agent-SFT-10K. Este dataset contiene 10.000 pares (tarea, trayectoria de agente) procedentes de cuatro fuentes: SWE-Smith, StackExchange-SuperUser, StackExchange-Tezos con aumentación sintética y IssueTasks. Las trayectorias fueron generadas por GLM-4.7-AWQ en el harness terminus-2 y filtradas a trazas con al menos 5 turnos de modelo.

Los hiperparametros de entrenamiento incluyen una tasa de aprendizaje de 4e-05 con scheduler cosine (warmup_ratio 0.1), batch global de 96, 7 epocas, cutoff_len de 32768 tokens y precision bf16 con DeepSpeed ZeRO-3. No se han publicado detalles sobre la longitud de contexto real del modelo; el cutoff_len de entrenamiento es de 32.768 tokens. Nota: la metadata de HuggingFace indica un total de parametros de 676.864, lo que resulta inconsistente con el tamano del repositorio (65.5 GB) y con el modelo base Qwen3-32B; se ha tomado 32B como valor de referencia.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de agente.
- Soporte de tool calling / function calling heredado del modelo base Qwen3-32B, aunque no se especifica explicitamente en la model card.
- Capacidad para interactuar con terminales y ejecutar comandos.
- Generacion y edicion de codigo en lenguajes de programacion, con foco en ingenieria de software.
- Resolucion de issues en repositorios y tareas de desarrollo de software.
- Soporte de agentes y razonamiento multi-step, evidenciado por el dataset de trayectorias de agente.
- Capacidades multilingues no especificadas; el modelo base Qwen3-32B es multilingue, pero no se confirma en la documentacion del fine-tune.

## Casos de uso

- Automatizacion de tareas de terminal: el modelo puede ejecutar comandos, interpretar salidas y tomar decisiones en entornos de shell, gracias a su entrenamiento con trayectorias de terminal.
- Resolucion de issues en repositorios de codigo: puede analizar descripciones de bugs, proponer parches y generar codigo para resolverlos, como muestra su rendimiento en SWE-Bench-Verified-100.
- Asistente de desarrollo de software: integrado en IDEs o pipelines de CI/CD, puede ayudar a escribir, revisar y refactorizar codigo, asi como generar pruebas.
- Agentes autonomos de ingenieria: puede actuar como agente en entornos controlados, planificando y ejecutando tareas de software de forma autonoma.
- Soporte tecnico automatizado: puede gestionar consultas de usuarios sobre problemas tecnicos, utilizando herramientas y documentacion para resolverlas.
- Automatizacion de flujos de trabajo en sistemas: puede interactuar con APIs y sistemas externos para ejecutar operaciones de mantenimiento, despliegue o monitorizacion.

## Benchmarks y rendimiento

La model card incluye resultados en el harness terminus-2 (pass@1, media de 3 ejecuciones estocasticas):

| Modelo | Harness | SWE-Bench-Verified-100 | OpenThoughts-TBLite | Terminal-Bench 2.0 |
|---|---|---|---|---|
| Qwen/Qwen3-32B | Terminus-2 | 26.7 | 13.7 | 7.5 |
| OpenThinkerAgent-32B-SFT-10K | Terminus-2 | 35.0 | 33.2 | 16.9 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 64 GB para 32B.
- VRAM estimada con cuantizacion 4-bit: en torno a 16-18 GB.
- GPU recomendadas: A100 80GB, H100 80GB, o RTX 4090 con cuantizacion.
- Puede ejecutarse en GPU de consumo con cuantizacion (por ejemplo, RTX 3090/4090 con 4-bit).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, text-generation-inference.
- Latencia y throughput no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-Bench-Verified-100 | OpenThoughts-TBLite | Terminal-Bench 2.0 | Licencia |
|---|---|---|---|---|---|---|
| Qwen/Qwen3-32B | 32B | no disponible | 26.7 | 13.7 | 7.5 | Apache 2.0 |
| OpenThinkerAgent-32B-SFT-10K | 32B | no disponible | 35.0 | 33.2 | 16.9 | Apache 2.0 |

No se dispone de informacion sobre otras alternativas comparables en la misma categoria.

## Limitaciones y advertencias

- Sesgos no documentados; hereda los sesgos del modelo base Qwen3-32B.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de agente con poca supervision.
- Limitaciones de idioma no especificadas; el modelo puede tener un rendimiento inferior en lenguas distintas del ingles.
- La longitud de contexto real no se ha publicado, aunque el entrenamiento uso secuencias de hasta 32.768 tokens.
- La metadata de HuggingFace muestra un valor de parametros inconsistente (676.864), lo que puede dificultar la evaluacion automatica.
- No se han publicado evaluaciones de seguridad o alineacion mas alla de los benchmarks de rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/trinityomni/OpenThinkerAgent-32B-SFT-10K
- Proyecto OpenThoughts-Agent: https://www.openthoughts.ai/blog/agent
- Repositorio GitHub: https://github.com/open-thoughts/OpenThoughts-Agent
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-SFT-10K
- Coleccion OpenThinker-Agent: https://huggingface.co/collections/open-thoughts/openthinker-agent
