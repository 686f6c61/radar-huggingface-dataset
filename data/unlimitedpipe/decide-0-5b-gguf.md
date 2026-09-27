# unlimitedpipe/decide-0.5b-GGUF

## Resumen

unlimitedpipe/decide-0.5b es un modelo de decisión de 0,5B de parámetros, desarrollado por unlimitedpipe, que no genera respuestas: dado un conjunto de fuentes numeradas y una pregunta, devuelve únicamente los identificadores de las fuentes que responden a esa pregunta (por ejemplo `USE 2 5`) o la palabra `NONE`. Está pensado como pieza interna del comando `ask` de UnlimitedPipe, que después redacta la respuesta final usando exclusivamente los títulos, fechas y resúmenes de las fuentes seleccionadas, de modo que la respuesta no contiene ninguna palabra ni cifra que no esté en las fuentes. La probabilidad del primer token generado se usa como señal de confianza de la decisión.

El modelo parte de Qwen/Qwen2.5-0.5B-Instruct y se ajustó con LoRA (r=16 sobre todas las capas lineales) en una sola pasada sobre 19.516 ejemplos de decisión, con un coste de entrenamiento de 135 minutos en una única NVIDIA T4. El resultado son 494.032.768 parámetros en formato GGUF, distribuidos con licencia Apache 2.0 y etiquetados para inglés y tailandés.

Su relevancia práctica está en el coste: al separar la decisión de la redacción, se obtiene un modelo que en la evaluación publicada por el autor rinde al nivel de un modelo mucho mayor (Qwen3.5 4B) en la tarea de selección de fuentes, con un tiempo mediano de 4,6 segundos por decisión en 2 CPUs y un tamaño de repositorio de 0,5 GB. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, ajustado con LoRA (r=16, todas las capas lineales) |
| Parametros totales | 494.032.768 (~0,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la ficha del modelo; el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | GGUF (el autor no detalla los niveles concretos; el repositorio ocupa 0,5 GB) |
| Idiomas soportados | en, th |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494.032.768 parámetros, sobre el que se aplicó un ajuste fino con LoRA de rango 16 en todas las capas lineales. El entrenamiento consistió en una única pasada sobre 19.516 ejemplos de decisión construidos solo con datos públicos: obras del gobierno federal de Estados Unidos y frases propias de UnlimitedPipe procedentes de datos abiertos, con los ejemplos de tipo "no cubierto" contados dos veces. El coste total fue de 135 minutos en una T4.

La innovación no está en la arquitectura sino en la tarea: el modelo aprende una única plantilla de prompt (`unlimitedpipe.decide.PROMPT`) y una única salida válida, la lista de índices de fuentes o `NONE`. La probabilidad del primer token se expone como medida de confianza de la decisión. En la evaluación del autor, cuando la decisión tenía una confianza del 95% o superior (150 de 155 respuestas) acertó 144 veces; por debajo de ese umbral, acertó 2 de 5.

## Capacidades

- Selección de fuentes para RAG: recibe fuentes numeradas y una pregunta, y devuelve los índices de las fuentes que la responden (`USE 2 5`) o `NONE`.
- Respuesta de decisión con control de abstención: dispone de una etiqueta explícita para indicar que las fuentes no responden a la pregunta, aunque en la práctica la emite con poca frecuencia.
- Calibración de confianza: la probabilidad del primer token actúa como indicador de seguridad de la decisión.
- Multilingüe limitado: etiquetado para inglés (en) y tailandés (th).
- Integración con pipelines de citas verificables: al no redactar texto libre, elimina la posibilidad de introducir palabras o cifras ausentes en las fuentes.
- Despliegue local: formato GGUF y flujo de instalación vía Ollama.
- No soporta tool calling ni function calling, no tiene modo de razonamiento explícito, no procesa visión ni audio, y no está entrenado para generación de texto libre.

## Casos de uso

- Selección de fuentes en un sistema RAG: el modelo se sitúa entre el recuperador y el generador; recibe los fragmentos numerados y devuelve solo los que responden a la consulta, lo que reduce el ruido que llega al modelo que redacta.
- Respuestas con citas verificables: al restringir la entrada del redactor a los títulos, fechas y resúmenes de las fuentes seleccionadas, la respuesta final no puede contener datos que no estén en el corpus recuperado.
- Filtrado previo en atención al cliente automatizada: con 4,6 s de latencia mediana en 2 CPUs, permite descartar artículos de base de conocimiento irrelevantes antes de invocar un modelo mayor, reduciendo coste por consulta.
- Despliegue en entornos sin GPU: al ocupar 0,5 GB y ejecutarse en CPU con Ollama o llama.cpp, es viable en servidores pequeños, portátiles o dispositivos de borde donde no cabe un modelo de varios miles de millones de parámetros.
- Enrutado dentro de agentes multi-paso: el modelo puede decidir qué documentos de un conjunto numerado son relevantes para el subobjetivo actual antes de que el agente principal continúe la cadena.
- Auditoría de recuperación: la confianza del primer token sirve como métrica para detectar consultas en las que el recuperador no ha encontrado nada útil, y activar así una segunda ronda de búsqueda.
- Búsqueda de noticias o monitorización temática: con preguntas escritas tal como las teclea un usuario, el modelo elige entre los resultados ya recuperados cuáles cubren realmente el tema consultado.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Las preguntas se escribieron tal como las teclea la gente, se pasaron por la búsqueda propia de `ask` y se etiquetaron a mano; cada decisión se evalúa por la respuesta que el código escribe a partir de ella, con el mismo criterio aplicado a los modelos que redactan sus propias respuestas.

| Modelo | Real (70) | More English (45) | Blind (40) | Tiempo mediano en 2 CPUs |
|---|---|---|---|---|
| unlimitedpipe/decide-0.5b (este modelo) | 66 (94%) | 45 (100%) | 35 (87%) | 4,6 s |
| unlimitedpipe/ask-0.5b, build 4 (redacta sus respuestas) | 67 (95%) | 45 (100%) | 35 (87%) | ~13 s |
| Qwen3.5 4B (redacta sus respuestas) | 56 (80%) | 39 (86%) | no disponible | no disponible |

Las preguntas del conjunto "Blind" se escribieron después de entrenar ambos modelos de 0,5B y no se usaron en el entrenamiento de ninguno. Con una confianza de decisión del 95% o superior (150 de 155 respuestas) el modelo acertó 144 veces; por debajo de ese umbral, 2 de 5. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en cuantizaciones GGUF habituales, dado que el repositorio completo ocupa 0,5 GB; el autor no publica la cifra exacta por nivel de cuantización.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; el entrenamiento se realizó en una única NVIDIA T4. No se especifican GPUs de referencia para inferencia.
- Cabe en GPU de consumo: sí, en cualquier RTX o equivalente moderna, e incluso en iGPU con memoria compartida.
- Ejecución sin GPU: sí, el autor reporta 4,6 s de tiempo mediano por decisión en 2 CPUs.
- Opciones de despliegue: Ollama (`ollama pull hf.co/unlimitedpipe/decide-0.5b-GGUF`), llama.cpp y cualquier runtime compatible con GGUF; `unlimited setup` lo instala automáticamente.
- Latencia y throughput: 4,6 s de mediana por decisión en 2 CPUs, frente a los ~13 s del modelo unlimitedpipe/ask-0.5b build 4 en el mismo hardware. No se publican datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Real / More English / Blind) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unlimitedpipe/decide-0.5b | 0,5B | no disponible | 94% / 100% / 87% | Apache 2.0 | GGUF, Ollama |
| unlimitedpipe/ask-0.5b, build 4 | 0,5B | no disponible | 95% / 100% / 87% | no disponible | no disponible |
| Qwen3.5 4B | ~4B (no confirmado) | no disponible | 80% / 86% / no disponible | no disponible | no disponible |
| Qwen2.5-0.5B-Instruct (modelo base) | 494.032.768 | 32.768 tokens (declarados por el modelo base) | no evaluado en esta tarea | Apache 2.0 | safetensors, GGUF por terceros |

La comparación no es homogénea: decide-0.5b solo emite una decisión de selección de fuentes, mientras que ask-0.5b y Qwen3.5 4B redactan la respuesta completa, una tarea más exigente. No se dispone de datos de modelos de decisión equivalentes de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Abstención insuficiente: el propio autor señala que dice "las fuentes no responden a esto" demasiadas pocas veces, concretamente en 10 de 16 preguntas que las fuentes no respondían, y a menudo con alta confianza (por ejemplo, ante "tsunami warning?" con una noticia sobre un "tsunami del Himalaya").
- Riesgo de selección errónea con confianza alta: la confianza del primer token es una señal útil, pero no garantiza corrección; por debajo del 95% el acierto observado fue de 2 sobre 5.
- Formato de salida rígido: conoce una única plantilla de prompt, `unlimitedpipe.decide.PROMPT`, y cualquier variación en el formato de entrada puede degradar la decisión.
- Calidad de la respuesta final: las respuestas derivadas se leen como listas de titulares, porque el modelo no explica; para explicaciones hace falta un modelo mayor.
- Cobertura lingüística limitada: solo inglés y tailandés; no hay evidencia de rendimiento en castellano.
- Datos de entrenamiento sesgados a fuentes concretas: los ejemplos provienen de obras del gobierno federal de Estados Unidos y de frases propias de UnlimitedPipe sobre datos abiertos, lo que puede trasladar los sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, igual que su modelo base, pero el autor no ofrece garantías sobre el comportamiento en dominios fuera de la distribución de entrenamiento.
- Madurez del proyecto: 0 descargas y 0 likes en HuggingFace en el momento de redactar la ficha, y ausencia de publicación de métricas estándar de evaluación.
- No apto para generación de texto: no debe usarse como modelo conversacional ni como generador de respuestas; su salida esperada es `USE n n` o `NONE`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unlimitedpipe/decide-0.5b-GGUF
- Repositorio de UnlimitedPipe: https://github.com/Fuyuki0/unlimitedpipe
- Evaluación de `ask` (research/ask): https://github.com/Fuyuki0/unlimitedpipe/tree/main/research/ask
- Dataset de entrenamiento: unlimitedpipe/decide-sft-public (https://huggingface.co/datasets/unlimitedpipe/decide-sft-public)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron únicamente páginas de TikTok sin relación con el contenido de esta ficha.
