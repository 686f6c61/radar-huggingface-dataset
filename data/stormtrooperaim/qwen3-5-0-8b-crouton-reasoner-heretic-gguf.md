# Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic-GGUF

## Resumen

Qwen3.5-0.8B-Crouton-Reasoner-heretic-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic, un ajuste fino de la familia Qwen3.5 de aproximadamente 752 millones de parámetros (0,8B nominales). El autor, Stormtrooperaim, publica estas cuantizaciones para su uso en llama.cpp, LM Studio, Ollama, Jan y otros runtimes compatibles con GGUF. La variante "heretic" indica que se ha aplicado un proceso de eliminación de rechazos (refusal-removed), de modo que el modelo no incorpora un filtro de seguridad y responderá a peticiones que el modelo original rechazaría.

El modelo es multimodal de tipo image-text-to-text: incluye un codificador de imagen separado (mmproj) que permite procesar entradas visuales junto con texto. El repositorio contiene un abanico amplio de cuantizaciones, desde BF16/F16 (1,41 GB) hasta IQ3_XS (430 MB), con métricas de perplejidad medidas por el autor sobre conversaciones "Crouton" reservadas con contexto de 512 tokens, lo que permite elegir el compromiso calidad/tamaño con datos concretos.

La relevancia de esta ficha radica en que ofrece un modelo muy pequeño, con licencia Apache 2.0 y capacidades multimodales, desplegable en hardware de consumo y en entornos con recursos limitados. No obstante, al tratarse de una variante sin filtro de seguridad, su uso en producción exige controles externos y una evaluación cuidadosa de riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles de capas y atención no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (las mediciones de perplejidad usan 512 tokens, pero no se especifica el máximo) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q4_1, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M, IQ3_S, IQ3_XS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); codificador de imagen en mmproj F16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.5 y su naturaleza multimodal (pipeline image-text-to-text). El modelo cuenta con 752.393.024 parámetros totales según los pesos en safetensors del modelo base, y se distribuye en GGUF con un codificador de imagen independiente (`mmproj-Qwen3.5-0.8B-Crouton-Reasoner-heretic-F16.gguf`) que debe cargarse junto al modelo de lenguaje para habilitar la entrada visual. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

El proceso "heretic" consiste en la eliminación de los comportamientos de rechazo del modelo original, lo que supone un ajuste orientado a suprimir las respuestas negativas ante ciertas peticiones. Las cuantizaciones se han generado con llama.cpp e incluyen variantes con imatrix, y el autor declara haber cargado y probado cada fichero antes de subirlo, con perplejidad medida mediante `llama-perplexity` sobre conversaciones reservadas. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes junto con texto (image-text-to-text) mediante el codificador mmproj.
- Razonamiento y respuestas de tipo "reasoner" según la denominación del modelo, aunque no se detallan modos de pensamiento explícitos.
- Comportamiento sin filtro de seguridad (uncensored): responde a peticiones que el modelo original rechazaría.
- Compatibilidad con runtimes GGUF: llama.cpp, LM Studio, Ollama, Jan y endpoints compatibles.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Asistente conversacional local en hardware de consumo: con cuantizaciones Q4_K_M (505 MB) o Q5_K_M (551 MB), el modelo puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, gestionando conversaciones multi-turno con un coste de memoria muy reducido.
- Procesamiento de imágenes en el borde (edge): el codificador mmproj F16 permite describir o interpretar imágenes en aplicaciones locales, como clasificación de capturas o extracción de información de documentos escaneados, sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones multimodales: al ser un modelo de 0,8B con licencia Apache 2.0, es adecuado para validar pipelines de image-text-to-text antes de escalar a modelos mayores, con iteración rápida gracias a los tiempos de carga reducidos.
- Investigación sobre alineación y seguridad: la variante heretic permite estudiar el comportamiento de modelos sin rechazo y comparar respuestas frente al modelo original, útil en trabajos de evaluación de sesgos y robustez.
- Despliegue en entornos con recursos restringidos: las variantes IQ3 e IQ4 (430-492 MB) permiten ejecutar el modelo en dispositivos ARM, Raspberry Pi o contenedores con poca memoria, a costa de una pérdida de calidad medible en perplejidad (+19,7% en IQ3_M frente a BF16).
- Generación de contenido creativo sin restricciones: para aplicaciones de escritura, guiones o narrativa donde se requiere evitar rechazos del modelo base, con la advertencia de que el operador asume la responsabilidad del filtrado posterior.
- Integración en asistentes de escritorio mediante LM Studio o Jan: el modelo se detecta automáticamente junto con el mmproj en la misma carpeta, lo que simplifica la configuración para usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona únicamente perplejidad medida con `llama-perplexity` sobre conversaciones reservadas (contexto de 512 tokens), con la referencia BF16 en 13,413:

| Cuantizacion | Tamano | Perplejidad | Variacion vs. BF16 |
|---|---:|---:|---:|
| BF16 | 1,41 GB | 13,413 | referencia |
| F16 | 1,41 GB | 13,405 | -0,1% |
| Q8_0 | 774 MB | 13,504 | +0,7% |
| Q6_K | 601 MB | 13,624 | +1,6% |
| Q5_K_M | 551 MB | 13,817 | +3,0% |
| Q5_K_S | 538 MB | 13,837 | +3,2% |
| Q4_K_M | 505 MB | 14,171 | +5,7% |
| Q4_K_S | 482 MB | 14,145 | +5,5% |
| IQ4_NL | 492 MB | 14,414 | +7,5% |
| IQ4_XS | 481 MB | 14,681 | +9,4% |
| Q4_1 | 508 MB | 14,438 | +7,6% |
| Q4_0 | 478 MB | 15,992 | +19,2% |
| Q3_K_L | 469 MB | 16,441 | +22,6% |
| Q3_K_M | 445 MB | 16,833 | +25,5% |
| Q3_K_S | 415 MB | 18,117 | +35,1% |
| IQ3_M | 433 MB | 16,061 | +19,7% |
| IQ3_S | 430 MB | 16,570 | +23,5% |
| IQ3_XS | 430 MB | no disponible en el fragmento | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q4_K_M, 505 MB) y 1,5 GB (BF16/F16, 1,41 GB) para los pesos, más el codificador de imagen mmproj F16 y la caché KV, que depende de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM puede alojar las cuantizaciones 4-bit; modelos como RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen sobrado. También es viable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer modernas, e incluso en iGPU y dispositivos ARM con las variantes IQ3/IQ4.
- Opciones de despliegue: llama.cpp (con `--mmproj` para visión), LM Studio (detección automática del mmproj), Ollama, Jan y runtimes compatibles con GGUF y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que IQ4_NL y Q4_0 son rápidas en ARM, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la información proporcionada. A continuación se comparan únicamente características objetivas conocidas:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Crouton-Reasoner-heretic (este) | 752 M | no disponible | Apache 2.0 | GGUF | Multimodal, sin filtro de seguridad |
| Qwen3.5-0.8B (base, si disponible) | ~0,8B | no disponible | Apache 2.0 (presumible) | safetensors/GGUF | Modelo original con rechazos |
| Alternativas de ~1B con visión | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados |

No se han identificado en la información disponible modelos comparables con datos de benchmarks que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo sin filtro de seguridad: la variante heretic elimina los rechazos, por lo que puede generar contenido dañino, sesgado o inapropiado; el operador es responsable de implementar controles externos.
- Riesgo de alucinación: con 752 millones de parámetros, la fiabilidad factual es limitada y los errores son más probables que en modelos de mayor tamaño.
- Contexto: no se especifica la longitud máxima de contexto; las mediciones de perplejidad se realizan con 512 tokens, lo que no garantiza un buen rendimiento en ventanas largas.
- Idiomas: no se detalla qué idiomas soporta; el nombre "Crouton" sugiere un ajuste específico, pero no hay información verificable.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe cumplir las obligaciones de atribución y asumir la responsabilidad sobre el contenido generado sin filtro.
- Calidad en cuantizaciones bajas: por debajo de Q4_K_M la perplejidad se degrada de forma notable (+19% en IQ3_M, +35% en Q3_K_S), lo que puede afectar a tareas de razonamiento.
- Visión: requiere cargar el mmproj F16 junto al modelo; sin él, las capacidades de imagen no están disponibles.
- Sin datos de benchmarks estándar: no es posible evaluar su rendimiento en tareas como MMLU o HumanEval con la información disponible.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic-GGUF
- Modelo base: https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-heretic
- Demo en el navegador (Space): https://huggingface.co/spaces/Stormtrooperaim/Crouton-Reasoner-GGUF-Chat
- Codificador de imagen: mmproj-Qwen3.5-0.8B-Crouton-Reasoner-heretic-F16.gguf (en el mismo repositorio)
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- Jan: https://jan.ai
