# Thox-ai/ThoxForge-7B

## Resumen

ThoxForge-7B es un ajuste fino mediante LoRA (rango 8) de Mistral-7B-Instruct-v0.3, desarrollado por Thox-ai y orientado a tareas de codigo y asistencia conversacional. Se publica como adaptador PEFT en safetensors acompanado de un GGUF cuantizado Q4_K_M dentro del mismo repositorio, de modo que el artefacto ejecutable completo se distribuye en un unico lugar sin necesidad de conversion adicional. El modelo base es de Mistral AI; Thox-ai aporta el entrenamiento del adaptador y la conversion a GGUF.

Con 7.248.023.552 parametros totales, hereda de Mistral-7B-Instruct-v0.3 la arquitectura transformer decoder-only y una ventana de contexto de 32.768 tokens, aunque la model card no detalla el proceso de entrenamiento ni los datos utilizados. El repositorio ocupa 4,5 GB e incluye el adaptador (83.945.296 bytes) y el GGUF Q4_K_M (4.372.812.160 bytes), con tokenizer propio.

Su relevancia practica reside en la doble via de carga: el adaptador puede montarse sobre el modelo base con Transformers y PEFT, mientras que el GGUF permite ejecucion directa en Ollama o llama.cpp. Esta pensado como asistente de clase host para el stack de Thox-ai (ThoxOS y MeshStack), con despliegue local-first. La licencia Apache-2.0 facilita su integracion comercial, si bien el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M incluido; el adaptador se distribuye en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA de rango 8 sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only de 7B parametros. El adaptador se publica en safetensors (83,9 MB) y se aplica sobre el modelo base mediante PEFT, de forma que los pesos base no se redistribuyen en este repositorio. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; unicamente indica que se trata de un SFT (supervised fine-tuning) orientado a codigo.

La innovacion practica del repositorio es el empaquetado: incluye simultaneamente el adaptador y un GGUF Q4_K_M ya convertido, lo que elimina el paso de fusionar el adaptador con el modelo base y cuantizar. La plantilla de chat declarada es `<s>[INST] {prompt} [/INST]`, la habitual de la familia Mistral Instruct.

## Capacidades

- Generacion de texto y asistencia conversacional en ingles.
- Enfasis en tareas de codigo, segun la orientacion declarada del ajuste fino (tag `code`).
- Ejecucion en dispositivo local (`on-device`, `local-first`) mediante GGUF en Ollama o llama.cpp.
- Integracion como asistente de clase host para las superficies de chat y agentes de ThoxOS a traves del endpoint local de Ollama.
- Comparticion entre nodos de una malla MeshStack desde un unico nodo.
- Prompt de sistema de facturacion de THOX: responde preguntas de empresa solo con hechos verificados y declina inventar datos no publicos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Asistencia de programacion en local: el adaptador puede cargarse con Transformers y PEFT para autocompletar y explicar codigo en un entorno de desarrollo sin conexion, aprovechando el enfasis del ajuste en tareas de codigo.
- Despliegue en estaciones de trabajo sin GPU de datacenter: el GGUF Q4_K_M (4,37 GB) permite ejecutar el modelo en Ollama o llama.cpp en equipos de consumo, adecuado para flujos local-first.
- Chat integrado en ThoxOS: el modelo sirve las superficies de chat y agentes del sistema operativo de Thox-ai a traves del endpoint local de Ollama, tal como declara la model card.
- Servicio compartido en una malla MeshStack: un unico nodo con el modelo cargado puede atender a varios clientes de la malla, reduciendo la necesidad de replicar pesos.
- Respuestas de empresa con control de facturacion: con el prompt de sistema de THOX, puede emplearse en atencion interna respondiendo solo con hechos verificados y rechazando detalles no publicos.
- Prototipado rapido de asistentes conversacionales en ingles: la plantilla `<s>[INST] ... [/INST]` y la disponibilidad en Ollama simplifican la puesta en marcha de demos.
- Evaluacion de adaptadores LoRA: util como referencia para comparar el rendimiento de un adaptador de rango 8 frente al modelo base en tareas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el GGUF Q4_K_M: aproximadamente 4,4 GB de pesos, con overhead adicional de contexto (del orden de 5-6 GB en total segun longitud de contexto).
- VRAM estimada para el adaptador en precision nativa (fp16/bf16): en torno a 14-15 GB para el modelo base de 7B mas el adaptador.
- GPU recomendadas para cuantizacion Q4_K_M: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090); tambien A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, tanto en el rango de 8 GB (Q4_K_M) como en 16-24 GB (precision completa del base con adaptador).
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxforge-7b`), llama.cpp (`llama-cli`), Transformers + PEFT para el adaptador. Soporte de vLLM o TGI: no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| ThoxForge-7B | 7,25B | no disponible en la card (base: 32.768) | Apache-2.0 | safetensors (LoRA) + GGUF Q4_K_M | Ajuste LoRA rango 8 sobre Mistral-7B-Instruct-v0.3, orientado a codigo |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 | Apache-2.0 | safetensors, GGUF | Modelo base; sin ajuste especifico de codigo |
| Mistral-7B-Instruct-v0.2 | 7,25B | 32.768 | Apache-2.0 | safetensors, GGUF | Version anterior del base, sin soporte de tool calling en v0.3 |
| CodeLlama-7B-Instruct | 6,74B | 16.384 | Llama 2 Community License | safetensors, GGUF | Alternativa especifica de codigo, licencia mas restrictiva |

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- No se publican benchmarks ni evaluaciones cuantitativas, por lo que el rendimiento real frente al modelo base es desconocido.
- La model card no detalla los datos de entrenamiento del adaptador, lo que impide evaluar sesgos o contaminacion del dataset.
- Riesgo de alucinacion inherente a los modelos de 7B; el prompt de facturacion de THOX mitiga parcialmente el problema en el dominio de la empresa, pero no lo elimina.
- El adaptador requiere descargar el modelo base por separado; el repositorio no incluye los pesos completos fusionados en safetensors.
- La longitud de contexto efectiva del ajuste no se especifica: aunque el base soporta 32.768 tokens, el adaptador podria haberse entrenado con secuencias mas cortas.
- El repositorio ThoxForge-7B-GGUF se describe como marcador de posicion sin pesos; los artefactos reales estan en este repositorio.
- La documentacion de Thox-ai advierte que las tarjetas "Pro" de su catalogo son una linea planificada y no nombres de instalacion actuales en Ollama o Hugging Face.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos del modelo base Mistral-7B-Instruct-v0.3, tambien Apache-2.0.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxForge-7B
- Ollama: https://ollama.com/Thox-ai/thoxforge-7b
- Catalogo de modelos de THOX: https://www.thox.ai/docs/model-catalog
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
