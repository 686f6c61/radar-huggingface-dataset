# tinyopsec/Qwen2.5-0.5B-Instruct-abliterated-v3-GGUF

## Resumen

Qwen2.5-0.5B-Instruct-abliterated-v3-GGUF es un repositorio de cuantizaciones GGUF del modelo `huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3`, elaborado por el usuario tinyopsec con llama.cpp. El modelo base es Qwen2.5-0.5B-Instruct, un modelo conversacional de 494 millones de parámetros de Alibaba, al que se le ha aplicado un proceso de "abliteración": una técnica que suprime las direcciones de rechazo en el espacio de activaciones del modelo, eliminando de facto sus salvaguardas de seguridad sin necesidad de reentrenamiento completo.

La relevancia de esta ficha radica en el nicho que cubre: un modelo extremadamente pequeño (0,5B), sin filtros y en formato GGUF, capaz de ejecutarse en prácticamente cualquier hardware, incluidas CPUs modestas y dispositivos de borde. Es útil para investigación en alineación y seguridad, red-teaming, pruebas de robustez y casos de uso donde el rechazo del modelo resulta un obstáculo, siempre bajo responsabilidad del usuario.

El repositorio ofrece trece cuantizaciones, desde F16 (1,0 GB) hasta Q2_K, con Q4_K_M marcada como recomendada por el autor. La licencia es Apache 2.0, heredada del modelo base de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5) |
| Parámetros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, pero no figura en la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder denso de la familia Qwen2.5 de Alibaba, entrenado como modelo conversacional (instruct). Los datos concretos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

La modificación principal es la abliteración realizada por huihui-ai sobre el modelo base. Esta técnica identifica la dirección en el espacio de activaciones responsable de los rechazos del modelo y la suprime (por ejemplo, proyectando las activaciones de forma ortogonal a dicha dirección), de modo que el modelo deja de negarse a generar contenido que originalmente estaría filtrado. No se trata de un fine-tune con nuevos datos, sino de una intervención directa sobre las activaciones. Las cuantizaciones GGUF del repositorio se generaron con llama.cpp a partir del modelo abliterado; el tamaño del repo es de 5,8 GB en total.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline text-generation, tag "chat").
- Modelo abliterado: responde sin los rechazos de seguridad del modelo original, lo que lo hace apto para investigación en seguridad y red-teaming.
- Ejecución local con llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, koboldcpp).
- Amplia gama de cuantizaciones, permitiendo ajustar el equilibrio entre calidad y huella de memoria (desde 1,0 GB en F16 hasta niveles de 2 bits).
- Capacidades de razonamiento, código o matemáticas: no disponibles como datos específicos en la model card (corresponden al modelo base Qwen2.5-0.5B-Instruct).
- Tool calling, agentes, visión o audio: no disponible.

## Casos de uso

- Investigación en alineación y seguridad: al ser un modelo abliterado, permite estudiar el comportamiento de LLM sin salvaguardas, probar jailbreaks defensivos y evaluar filtros externos en un entorno controlado.
- Red-teaming y pruebas de robustez: los equipos de seguridad pueden usarlo como punto de partida barato para generar adversarios o probar clasificadores de contenido sin depender de APIs cerradas.
- Prototipado en hardware mínimo: con ~0,5B de parámetros y cuantizaciones de 4 bits, cabe en CPUs sin GPU dedicada, ideal para pruebas rápidas de pipelines de texto en portátiles o SBCs.
- Integración en aplicaciones locales de chat: mediante Ollama o LM Studio puede servir como motor conversacional offline en herramientas de escritorio.
- Experimentación con cuantizaciones: las trece variantes permiten comparar la degradación de calidad entre Q2_K y F16 en un modelo pequeño y de evaluación rápida.
- Generación de texto en entornos sin conexión: útil para automatización de texto simple (resúmenes, reescrituras) en sistemas aislados donde no se requiere máxima calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,0 GB en F16, ~0,5-0,6 GB en Q8_0, ~0,4 GB en Q4_K_M y menos de 0,3 GB en Q2_K (estimaciones a partir del tamaño de parámetros y la cuantización; los tamaños exactos por fichero no están todos detallados en la model card salvo F16).
- GPU recomendada: no requiere GPU dedicada; cualquier GPU moderna con 2 GB de VRAM o más lo ejecuta con holgura. En CPU, funciona en equipos modestos (4-8 GB de RAM).
- Consumer GPUs: cabe sin problemas en RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas, en cualquier cuantización.
- Despliegue: llama.cpp (comando `llama-cli` documentado en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible; dado el tamaño de 0,5B, se espera inferencia muy rápida incluso en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| tinyopsec/Qwen2.5-0.5B-Instruct-abliterated-v3-GGUF | 494M | GGUF (13 cuantizaciones) | Apache 2.0 | Abliterado, sin salvaguardas |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | safetensors | Apache 2.0 | Modelo base con filtros de seguridad |
| huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3 | 494M | safetensors | no disponible | Origen de la abliteración, sin cuantizaciones GGUF propias en este repo |

La propuesta de valor de esta ficha frente a las alternativas es la disponibilidad inmediata en GGUF con trece niveles de cuantización del modelo abliterado, mientras que el origen (huihui-ai) distribuye pesos sin cuantizar y el base de Qwen conserva las salvaguardas.

## Limitaciones y advertencias

- Modelo abliterado/uncensored: genera contenido sin los rechazos de seguridad originales. Su uso para producir contenido dañino es responsabilidad exclusiva del usuario; el propio autor incluye un disclaimer pidiendo evaluar el modelo antes de usarlo.
- Al eliminar las salvaguardas mediante intervención en activaciones, puede aumentar el riesgo de alucinaciones y degradación de calidad general respecto al modelo base; no hay evaluaciones publicadas que cuantifiquen esta degradación.
- Con 0,5B de parámetros, la capacidad de razonamiento, código y matemáticas es limitada en términos absolutos; no es apto para tareas complejas de producción.
- Cuantizaciones agresivas (Q3, Q2_K) degradan apreciablemente la calidad; el autor recomienda Q4_K_M como equilibrio.
- Idiomas soportados, longitud de contexto y benchmarks no están documentados en la model card del repo.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el contenido generado carece de garantías y el usuario asume la responsabilidad legal y ética.
- Repositorio de comunidad con pocas descargas (387) y sin likes: no cuenta con auditoría ni validación de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tinyopsec/Qwen2.5-0.5B-Instruct-abliterated-v3-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo abliterado original: https://huggingface.co/huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3
- llama.cpp: https://github.com/ggerganov/llama.cpp
