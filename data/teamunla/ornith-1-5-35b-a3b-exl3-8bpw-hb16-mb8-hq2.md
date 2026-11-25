# TeamUNLa/Ornith-1.5-35B-A3B-exl3-8bpw-hb16-mb8-hq2

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por ornith-ai, presentado como una evolución de Ornith-1.0 orientada a la auto-mejora de extremo a extremo. El modelo se construye sobre Qwen3.5 y Gemma4, a los que se aplican fases de preentrenamiento continuado, mid-training y post-training. Su propuesta central es un bucle de auto-mejora que no solo optimiza el andamiaje (scaffold) y los rollouts, sino que también genera tareas de entrenamiento nuevas y descubre estrategias para resolverlas mediante aprendizaje por refuerzo, en lugar de depender de un conjunto fijo de tareas curadas manualmente.

La ficha que nos ocupa no es el modelo original, sino una conversión comunitaria al formato ExLlamaV3 (EXL3) realizada por TeamUNLa, el equipo de la comunidad de estudiantes de la Licenciatura en Sistemas de la UNLa. Esta variante aplica una cuantización de 8 bits por peso (8 bpw) con asignación no uniforme de bits por tensor: la cabeza de salida (`lm_head`) se mantiene a 16 bpw mientras que las capas críticas y los expertos enrutados quedan a 8 bpw. El objetivo declarado es ofrecer una calidad indistinguible del original a aproximadamente la mitad de su tamaño, con un peso de descarga de 34,7 GB y un requisito mínimo de 8 GB de VRAM si se reparten capas y expertos entre VRAM y RAM del sistema.

Es relevante ahora porque permite ejecutar un MoE de 35B parámetros totales (unos 3B activos por token) en hardware de consumo mediante offloading, con un servidor local compatible con la API de OpenAI a través de TabbyAPI, lo que facilita su uso como agente de programación en VS Code y otros IDE. Los idiomas declarados son español e inglés, y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de Qwen3.5 y Gemma4; tag de arquitectura `qwen3_5_moe` |
| Parámetros totales | 35B según la model card (18.636.123.648 parámetros reales en safetensors) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 8 bpw (`hb16-mb8-hq2`): `lm_head` a 16 bpw, capas críticas y expertos enrutados a 8 bpw |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | MIT |
| Formato de pesos | ExLlamaV3 (EXL3); el repo incluye safetensors y se etiqueta como `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), etiquetado en Hugging Face con el identificador `qwen3_5_moe`, lo que indica que hereda el diseño de Qwen3.5. Cuenta con 35B parámetros totales y aproximadamente 3B activos por token, una relación de activación típica de los MoE que permite un coste de cómputo por token mucho menor que el de un modelo denso del mismo tamaño. Según la model card del autor original, Ornith-1.5 se desarrolló sobre Ornith-1.0 —que a su vez partía de Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales— ampliando el bucle de auto-mejora para optimizar conjuntamente la generación de tareas, la construcción del andamiaje y los rollouts de solución. El entrenamiento combina generación continua de tareas nuevas con aprendizaje por refuerzo sobre las estrategias descubiertas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF o DPO.

Esta variante concreta no reentrena el modelo: es una conversión de cuantización. La receta de TeamUNLa aplica ExLlamaV3 con una asignación no uniforme de bits por tensor, manteniendo la cabeza de salida a 16 bpw y el resto de tensores críticos y expertos enrutados a 8 bpw. El resultado ocupa 34,7 GB en descarga, frente a un modelo original de mayor tamaño, y está pensado para repartir capas y expertos entre VRAM y RAM del sistema.

## Capacidades

- Generación de texto conversacional en español e inglés, con pipeline declarado `text-generation` y `conversational`.
- Razonamiento y resolución de tareas: el entrenamiento por refuerzo sobre tareas autogeneradas apunta a mejorar la capacidad de resolver problemas de forma iterativa.
- Soporte de imagen a texto: el tag `image-text-to-text` sugiere capacidades multimodales de entrada de imagen, aunque la model card no detalla su alcance.
- Uso como agente local: la variante está pensada para servir una API compatible con OpenAI mediante TabbyAPI, lo que habilita su integración como agente en VS Code y otros IDEs.
- Capacidades multilingües limitadas a los idiomas declarados (es, en); no se documentan otros.
- No se documentan en la información disponible el soporte explícito de tool calling, function calling ni modos de pensamiento (thinking mode) del modelo original.

## Casos de uso

- Agente de programación en el IDE: servir el modelo con TabbyAPI como endpoint compatible con OpenAI permite conectarlo a VS Code u otros editores para autocompletado, refactorización y explicación de código, aprovechando que el MoE activa solo ~3B parámetros por token y puede repartirse entre VRAM y RAM.
- Asistente conversacional local en español: el modelo declara soporte nativo de español e inglés, por lo que puede desplegarse en una máquina de sobremesa para atención o asistencia en ambos idiomas sin depender de servicios en la nube.
- Laboratorio de experimentación con MoE: investigadores pueden estudiar el comportamiento de un modelo de 35B totales con activación dispersa en hardware de consumo, ajustando el reparto de capas y expertos entre VRAM y RAM.
- Prototipado de pipelines de generación de texto: al exponer una API compatible con OpenAI, se integra en aplicaciones existentes que ya consumen ese formato sin cambios de código en el cliente.
- Evaluación de cuantización ExLlamaV3: sirve como caso práctico para medir la degradación de calidad de una receta de 8 bpw con `lm_head` a 16 bpw frente al modelo original, en tareas de conversación y razonamiento.
- Despliegue en estaciones de trabajo con GPU de gama media: con 8 GB de VRAM mínimos y 64 GB de memoria total recomendada, encaja en equipos con una RTX 3060/4060 y 64 GB de RAM para uso interactivo no crítico.
- Formación y docencia: el proyecto comunitario de la UNLa documenta el proceso de conversión y despliegue, lo que lo convierte en material didáctico para enseñar cuantización y serving de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima recomendada: 8 GB, repartiendo capas y expertos entre VRAM y RAM del sistema.
- Memoria total recomendada (VRAM + RAM): aproximadamente 64 GB.
- Tamaño de descarga: 34,7 GB (el repositorio completo ocupa 37,4 GB).
- GPU compatibles: cualquier tarjeta CUDA desde la generación GeForce GTX 10 en adelante con VRAM suficiente; en ROCm, serie RX 7000 o superior, y RX 6800 y superiores de la serie RX 6000 (no probadas). Las GPU Intel no están soportadas.
- Despliegue: TabbyAPI sobre ExLlamaV3, que expone una API compatible con OpenAI. El repositorio se etiqueta también como `transformers`, pero la ejecución prevista es EXL3.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados por el autor: `temperature=0.75`, `top_p=0.95`, `top_k=20`, `min_p=0.0`, `presence_penalty=0.6`.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (EXL3 8 bpw, esta ficha) | 35B (18,6B en safetensors) | ~3B | no disponible | EXL3 8 bpw | MIT | Hugging Face (TeamUNLa) |
| Ornith-1.5-35B-A3B (original) | 35B | ~3B | no disponible | pesos completos | MIT | Hugging Face (ornith-ai) |
| Qwen3.5 (modelo base de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Gemma4 (modelo base de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al entrenarse sobre datos de Qwen3.5 y Gemma4, es previsible que herede sesgos de sus corpus, pero no hay confirmación explícita.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo LLM generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento largo.
- Idiomas limitados a español e inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- La longitud de contexto no se especifica, lo que impide planificar su uso en tareas de contexto largo.
- Esta variante es una cuantización de 8 bpw: aunque el autor afirma calidad indistinguible del original, no se aportan métricas que lo respalden.
- La licencia MIT del modelo base se aplica al modelo; conviene verificar el archivo LICENSE del repositorio original antes de uso comercial.
- El proyecto es una iniciativa comunitaria de estudiantes y no una publicación institucional oficial de la UNLa.
- El despliegue con offloading a RAM implica latencias mayores que la inferencia íntegra en VRAM; no se publican cifras de throughput.
- TabbyAPI solo soporta CUDA y ROCm; no hay soporte para GPU Intel ni para CPU pura documentado.

## Enlaces

- Repositorio de esta variante en Hugging Face: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-8bpw-hb16-mb8-hq2
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Blog de Ornith: https://deep-reinforce.com/ornith.html
- Índice de modelos de TeamUNLa: https://huggingface.co/TeamUNLa/LLMs-UNLa
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
