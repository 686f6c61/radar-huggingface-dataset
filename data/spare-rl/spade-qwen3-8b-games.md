# spare-rl/SPADE-Qwen3-8B-Games

## Resumen

SPADE-Qwen3-8B-Games es un checkpoint de la familia SPADE, entrenado a partir del modelo base Qwen/Qwen3-8B mediante un esquema de reinforcement learning con self-play. El desarrollo corre a cargo del usuario spare-rl y se distribuye bajo licencia Apache 2.0. La idea central es que un único modelo desempeña dos papeles: el de proposer, que genera entornos ejecutables, y el de actor, que los resuelve. El proposer recibe recompensa por producir entornos situados en la frontera de lo que el actor es capaz de resolver en cada momento, de modo que el curriculo de entrenamiento se adapta dinámicamente en lugar de estar prefijado.

El modelo se libera con 8.190.735.360 parámetros (8,19B), con arquitectura densa derivada de Qwen3-8B, y está especializado en el dominio de juegos. El checkpoint publicado corresponde a la iteración 399 del entrenamiento, que es el punto final de la ejecución, sin que se haya realizado un barrido de evaluación offline. El corpus de grounding utilizado es spare-rl/spade-grounding-corpus-games-15k, con 15.000 entradas. Su relevancia radica en que demuestra la viabilidad de generar entornos de entrenamiento automáticamente, sin intervención humana, para agentes de reinforcement learning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8, 19B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la ficha; el base Qwen3-8B soporta 32.000 tokens según el report tecnico de Qwen3 |
| Tipos de cuantizacion | No disponibles (el repo contiene pesos safetensors en precision completa; sin GGUF ni AWQ publicados) |
| Idiomas soportados | No disponibles (el base Qwen3-8B es multilingue, pero el finetune no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3-8B, un transformer denso de 8B parámetros con capacidad para alternar entre modo de pensamiento (thinking) y modo directo (non-thinking), tal y como describe el report tecnico de Qwen3. Sobre esta base, SPADE aplica un entrenamiento de reinforcement learning con self-play en dos roles: el proposer genera entornos ejecutables (en este caso, juegos) y el actor los resuelve. La recompensa del proposer depende de que el entorno se encuentre en la frontera de capacidad del actor, lo que obliga al curriculo a avanzar al ritmo de la politica.

El entrenamiento se apoya en el corpus de grounding spare-rl/spade-grounding-corpus-games-15k, que contiene 15.000 juegos, y los entornos se generan online por el propio modelo durante el entrenamiento. No se especifica el número de tokens de entrenamiento, ni el uso de RLHF o DPO. El checkpoint liberado corresponde a la iteración 399, que es el punto final de la ejecución sin evaluacion offline previa.

## Capacidades

- Generación de entornos ejecutables (juegos) en formato texto, gracias a su papel como proposer.
- Actuación dentro de entornos generados, resolviendo tareas como actor.
- Curriculo adaptativo: el modelo ajusta la dificultad de los entornos de forma automatica segun su propia capacidad.
- Razonamiento multi-paso heredado del base Qwen3-8B, util para tareas de planificacion y logica.
- Capacidad conversacional (tag de transformers), aunque no se especifican detalles de soporte de tool calling.
- No se documenta soporte explicito para vision, audio ni function calling especifico.

## Casos de uso

- Generacion procedural de entornos de entrenamiento para agentes de RL: el modelo puede producir juegos de texto que sirven como banco de pruebas para politicas de aprendizaje, sin intervencion humana.
- Curriculo adaptativo en sistemas de entrenamiento de agentes: se usa como generador de entornos que se ajustan a la capacidad actual del agente, acelerando la convergencia.
- Evaluacion de robustez de agentes: los entornos generados en la frontera de capacidad permiten detectar debilidades en agentes existentes.
- Creacion de juegos basados en texto: el modelo puede generar descripciones y mecanicas de juego para prototipos rapidos o para contenido procedural en demos.
- Simulacion de escenarios para testing de agentes conversacionales: los entornos generados pueden usarse para probar agentes en contextos de juego interactivo.
- Investigacion en self-play y generacion automatica de entornos: sirve como punto de partida para experimentos sobre curriculum learning y autoevaluacion de politicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el checkpoint seleccionado es el punto final de la ejecucion y que no se realizo un barrido de evaluacion offline para esta rama del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16, 4 GB para los pesos, mas overhead de atencion, por lo que se recomienda un minimo de 20 GB de VRAM.
- VRAM estimada con cuantizacion 4-bit (si se convierte a GGUF): entre 5 y 6 GB, lo que permitiria ejecucion en GPU de consumo con 8 GB o mas.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para FP16; A100 80 GB o H100 para despliegue con mayor margen.
- El modelo cabe en GPU de consumo modernas (RTX 3090/4090) en precision completa, y en GPU de 8 GB si se cuantiza.
- Opciones de despliegue: transformers (con device_map="auto"), vLLM (compatible con la arquitectura Qwen3), llama.cpp tras convertir a GGUF, y Ollama si se publica un modelo GGUF.
- Latencia y throughput: no disponibles; dependen de la GPU y del modo de pensamiento activado (thinking mode consume mas tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPADE-Qwen3-8B-Games | 8, 19B | 32K (base) | RL self-play con generacion de entornos | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19B | 32K | Preentrenamiento estandar | Apache 2.0 | Hugging Face |
| KKKrainbow1/SPA-RL-Qwen3 (GitHub) | 8,19B | 32K | RL con atribucion de progreso por pasos y tool call | No especificada | GitHub |
| yeok/Qwen3-8B-random_insertion_rl | 8,19B | 32K | RL con insercion aleatoria | Apache 2.0 | Hugging Face |

La comparativa se limita a finetunes del mismo base model (Qwen3-8B). SPADE se diferencia por su enfoque en generacion de entornos y self-play, mientras que los otros se centran en mejoras de razonamiento o tool calling.

## Limitaciones y advertencias

- No se han publicado benchmarks; el checkpoint es el final de la ejecucion sin evaluacion offline, lo que limita la confianza en el rendimiento general.
- Enfoque exclusivo en el dominio de juegos: su capacidad de generacion de entornos esta ligada al corpus de 15K juegos, por lo que no se debe esperar un comportamiento generalista fuera de ese ambito.
- Riesgo de alucinacion en los entornos generados: el modelo puede producir juegos con reglas inconsistentes o no ejecutables, dado que no se ha validado la calidad de los entornos de forma externa.
- Idiomas no especificados: aunque el base Qwen3-8B es multilingue, el finetune no documenta que idiomas mantiene o pierde capacidad.
- Longitud de contexto heredada de Qwen3-8B (32K tokens), pero no se ha verificado si el entrenamiento SPADE mantiene la ventana completa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo derivado de Qwen3-8B puede estar sujeto a las condiciones del modelo base (tambien Apache 2.0).
- No se documenta soporte de tool calling o function calling para este checkpoint concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spare-rl/SPADE-Qwen3-8B-Games
- Corpus de grounding (games): https://huggingface.co/datasets/spare-rl/spade-grounding-corpus-games-15k
- Corpus de grounding (tool use): https://huggingface.co/datasets/spare-rl/spade-grounding-corpus-tooluse-15k
- Repositorio relacionado SPA-RL-Qwen3 (GitHub): https://github.com/KKKrainbow1/SPA-RL-Qwen3
- Report tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Blog de NVIDIA sobre Qwen3-8B en juegos: https://developer.nvidia.com/blog/nvidia-ace-adds-open-source-qwen3-slm-for-on-device-deployment-in-pc-games/
