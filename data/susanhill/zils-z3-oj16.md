# SusanHill/zils-z3-oj16

## Resumen

OneJev1.6-27B es un modelo multimodal de decisión de "Sistema Uno" desarrollado por el equipo OmniJev (publicado en Hugging Face bajo la cuenta SusanHill). A diferencia de los modelos generativos convencionales, no produce texto libre: recibe un estado (texto, captura de pantalla, foto o vídeo) junto con una serie de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Resuelve el problema de la evaluación rápida y calibrada de decisiones en agentes autónomos, especialmente en entornos de interfaz gráfica (GUI agents).

El modelo es un fine-tune completo de Qwen/Qwen3.8-27B, con 27.356.728.560 parámetros totales y un repositorio de 54,7 GB en formato safetensors. Se entrenó sobre aproximadamente 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. Su relevancia actual radica en que ofrece una alternativa determinista y calibrada a los LLM generativos para tareas de puntuación y elección de acciones en pipelines de agentes.

La arquitectura subyacente es la del transformer multimodal de Qwen3.8-27B, adaptada mediante la librería Flide para servir la API System One de TypeSafe con soporte adicional de campo `media` para imágenes y vídeo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen/Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de 27.000 millones de parámetros, y se somete a un fine-tune completo (no LoRA ni adaptadores) sobre aproximadamente 440.000 preguntas. Estas preguntas provienen de ejecuciones reales de agentes, vídeos, imágenes y los splits de entrenamiento de conjuntos de datos públicos de decisión. El objetivo de entrenamiento es la producción de probabilidades calibradas por opción en un solo forward pass, en lugar de la generación autoregresiva de texto.

La innovación técnica principal es el paradigma de "Sistema Uno": el modelo no razona paso a paso ni genera cadenas de pensamiento, sino que emite directamente una distribución de probabilidad sobre opciones predefinidas (tipos `noul`, `choice` y `score`). El servido se realiza mediante la librería Flide, que implementa la API System One de TypeSafe y añade un campo `media` para imágenes y vídeo. No se dispone de información sobre la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Evaluación de decisiones con probabilidad calibrada por opción en un único forward pass.
- Preguntas de tipo `noul` (probabilidad de sí/no), `choice` (una probabilidad por opción) y `score` (nivel esperado sobre criterios ordenados).
- Procesamiento multimodal de imágenes, capturas de pantalla, fotos y vídeo junto con texto.
- Soporte de tareas de agente GUI: decidir la siguiente acción (clic, escritura, scroll, parada) sobre una pantalla.
- Estimación de progreso de tarea ("no iniciado", "a medias", "casi terminado", "terminado").
- Integración con la API System One de TypeSafe mediante Flide.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso generativos ni modo thinking.
- Idiomas soportados no disponibles en la información proporcionada.

## Casos de uso

- Agentes GUI automatizados: dado un `screenshot.png` y una tarea ("Pagar la factura abierta de ACME"), el modelo devuelve la probabilidad de cada acción siguiente (clic, escritura, scroll, parada), lo que permite a un orquestador elegir la acción con mayor probabilidad de forma determinista y calibrada.
- Evaluación de progreso en pipelines de agentes: mediante preguntas de tipo `score`, el modelo estima en qué punto de la tarea se encuentra el agente, útil para decidir si continuar, reintentar o escalar a un humano.
- Verificación de finalización de tareas: con preguntas de tipo `noul` ("La factura ha sido pagada"), el modelo proporciona la probabilidad de que la condición se cumpla, lo que sirve como compuerta de calidad en flujos automatizados.
- Moderación y clasificación multimodal: el modelo puede puntuar opciones sobre imágenes o vídeos (por ejemplo, clasificar contenido o decidir si una acción es adecuada) aprovechando su naturaleza de decisión calibrada.
- Enrutamiento de decisiones en sistemas multiagente: al devolver una distribución de probabilidad sobre opciones, permite seleccionar la rama de ejecución más probable o aplicar umbrales de confianza configurables.
- Investigación en calibración de modelos: su salida probabilística por opción y su evaluación en el Decision Index lo hacen adecuado para estudiar calibración y comparar con modelos generativos en tareas de decisión.
- Automatización de pruebas de interfaz: dado un estado de pantalla, el modelo puede predecir la acción esperada y compararla con la acción real para detectar regresiones en flujos de UI.

## Benchmarks y rendimiento

| Benchmark | OneJev1.6-27B | OneJev1.5-27B | StartLux-Decision v1.1 27B | KnowLine 35B-A3B Gen1 | Perplexity Decider v1.2 (27B) | RSI-Jev v6.1 VL 27B (effort auto) |
|---|---|---|---|---|---|---|
| Decision Index 0.3 (parte pública, 37 benchmarks, 140.178 peticiones) | 69,49 | 63,64 | 72,88 | 69,49 | 67,74 | 65,64 |

OneJev1.6-27B ocupa la segunda posición de 172 modelos en el board del Decision Index, empatado con KnowLine 35B-A3B Gen1. Los resultados de los demás modelos corresponden a su puntuación en la parte pública del board a 16 de octubre de 2026. No se han publicado en la información disponible resultados desglosados por área (las cinco áreas del board) ni métricas de benchmarks clásicos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 27.356 millones de parámetros en safetensors, la inferencia en precisión completa requeriría aproximadamente 55 GB de VRAM; en cuantización de 8 bits, unos 27 GB; en 4 bits, unos 14 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar A100 80GB, H100 80GB o múltiples RTX 4090 para precisión completa; una RTX 4090 de 24 GB requeriría cuantización.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en RTX 4090 con cuantización de 8 o 4 bits, aunque no hay datos oficiales.
- Opciones de despliegue: la documentación oficial indica `flide serve --model OmniJev/OneJev1.6-27B` (librería Flide, con `torchvision`). No se documentan opciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 (parte pública) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-27B | 27.356 M | no disponible | 69,49 | Apache 2.0 | Hugging Face |
| StartLux-Decision v1.1 27B | 27.000 M (aprox.) | no disponible | 72,88 | no disponible | no disponible |
| KnowLine 35B-A3B Gen1 | 35.000 M (MoE, 3B activos) | no disponible | 69,49 | no disponible | no disponible |
| Perplexity Decider v1.2 (27B) | 27.000 M (aprox.) | no disponible | 67,74 | no disponible | no disponible |
| RSI-Jev v6.1 VL 27B (effort auto) | 27.000 M (aprox.) | no disponible | 65,64 | no disponible | no disponible |

Los cuatro modelos comparados son los de mayor puntuación en el rango de 25B a 36B parámetros del board del Decision Index. No se dispone de información sobre sus licencias ni su disponibilidad en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto libre: solo responde a preguntas tipadas (`noul`, `choice`, `score`) con probabilidades. No es adecuado para tareas generativas convencionales.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento: las probabilidades pueden no ser fiables en dominios distintos de los datos de agentes, vídeos e imágenes usados en el fine-tune.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.8-27B, podría heredar sesgos del modelo base.
- Limitaciones de idioma: no se especifican idiomas soportados; la model card está en inglés y los ejemplos son en inglés.
- Limitaciones de contexto: la longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia del modelo base Qwen/Qwen3.8-27B.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 27 de noviembre de 2026: es un modelo muy reciente y sin validación independiente de la comunidad.
- La evaluación se basa en el board del Decision Index, cuyos resultados de otros modelos corresponden a una fecha concreta (16 de octubre de 2026) y pueden no ser directamente comparables.
- Para producción, es necesario validar la calibración en el dominio específico y establecer umbrales de confianza adecuados.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-z3-oj16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub del proyecto: https://github.com/OmniJev/OneJev
- Organización en Hugging Face: https://huggingface.co/OmniJev
- Sitio web: https://omnijev.github.io/OneJev/
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Repositorio Flide: https://github.com/OmniJev/Flide
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
