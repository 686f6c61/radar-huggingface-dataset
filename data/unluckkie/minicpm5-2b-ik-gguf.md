# Unluckkie/MiniCPM5-2B-IK-GGUF

## Resumen

MiniCPM5-2B-IK-GGUF es una publicación de cuantizaciones GGUF del modelo base openbmb/MiniCPM5-2B, un transformer denso de 2.516.756.480 parámetros desarrollado por OpenBMB. El autor de esta ficha de cuantización es el usuario Unluckkie, que distribuye tres variantes IQK calibradas con importance matrix: IQ4_KS, IQ5_KS e IQ6_K. El objetivo es ofrecer versiones comprimidas del modelo que mantengan la calidad del original con un coste de memoria muy reducido, pensadas para ejecución en CPU y equipos sin GPU dedicada.

La relevancia de esta publicación es doble. Por un lado, MiniCPM5-2B pertenece a una familia conocida por soportar bien la cuantización agresiva, con una degradación de calidad menor que la de otros modelos de tamaño similar. Por otro, el uso de importance matrix (imatrix) en el proceso de cuantización busca situar estas variantes en o por encima de los resultados de las cuantizaciones estándar al mismo ancho de bits. El repositorio ocupa 5,2 GB e incluye los artefactos de calibración para reproducir el proceso.

La advertencia principal es la compatibilidad: estas cuantizaciones IQK requieren `ik_llama.cpp` y no cargan en `llama.cpp` estándar, Ollama ni LM Studio. La licencia del modelo base y de esta publicación es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base MiniCPM5-2B; detalles internos no disponibles) |
| Parámetros totales | 2.516.756.480 (~2,5 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ4_KS (~1,3 GB), IQ5_KS (~1,6 GB), IQ6_K (~1,9 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variantes IQK para `ik_llama.cpp`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 2,5 mil millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas concretas más allá de la familia MiniCPM5 a la que pertenece.

El proceso de cuantización sí está documentado: se parte de `MiniCPM5-2B-F16.gguf` y se aplica `llama-imatrix` con el fichero `calibration_all_micro.txt` (200 chunks), seguido de `llama-quantize --imatrix` de `ik_llama.cpp`. Los artefactos `imatrix.dat` y `quant_ladder.log` se incluyen en el repositorio para reproducir o extender el barrido de cuantizaciones. El autor indica que el proceso se ejecutó en un portátil con Intel i5-8250U y 8 GB de RAM, sin GPU dedicada.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Razonamiento y respuesta a instrucciones, según el comportamiento del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Ejecución en CPU mediante `ik_llama.cpp`, con tres niveles de compromiso tamaño/calidad.

## Casos de uso

- Asistentes conversacionales en local: con IQ4_KS (~1,3 GB) el modelo puede ejecutarse en equipos con 4 GB de RAM o menos, lo que permite desplegar un chatbot de propósito general en portátiles modestos o mini-PC sin GPU.
- Prototipado rápido en entornos sin GPU: IQ5_KS ofrece un equilibrio entre tamaño y calidad para validar prompts y flujos conversacionales antes de migrar a infraestructura mayor.
- Generación de texto en aplicaciones de escritorio: IQ6_K (~1,9 GB) encaja en equipos con 8 GB de RAM y prioriza calidad sobre velocidad, adecuado para herramientas de redacción o resumen integradas en el escritorio.
- Evaluación comparativa de cuantizaciones: el repositorio incluye `imatrix.dat` y `quant_ladder.log`, lo que facilita reproducir el barrido y medir perplejidad con `llama-perplexity` sobre `wiki.test.raw`.
- Investigación sobre robustez a la cuantización: la familia MiniCPM5-2B se documenta como especialmente resistente a 4 bits, por lo que estas variantes sirven para estudiar la degradación de calidad a distintos anchos de bits.
- Procesamiento por lotes en CPU: al no requerir GPU, el modelo puede integrarse en pipelines de generación de texto en servidores sin acelerador, siempre que se acepte el throughput limitado de CPU.
- Educación y experimentación: el proceso documentado (imatrix, cuantización, perplejidad) sirve como caso práctico para aprender a construir y evaluar cuantizaciones GGUF.

## Benchmarks y rendimiento

La model card cita cifras de la comunidad para la familia del modelo base, no para estas cuantizaciones concretas:

| Métrica | Valor citado |
|---|---|
| Acuerdo top-1 a 4 bits agresivos | ~92 % o más |
| Acuerdo top-1 a 6 bits | ~96 % o más |
| Comparación con otros modelos de 2B a 4 bits | Caída a mediados de los 80 % |

El autor afirma que, al haberse construido con importance matrix, las variantes IK deberían situarse en o por encima de las cifras de las cuantizaciones estándar al mismo ancho de bits. No se aportan resultados de MMLU, HumanEval, GSM8K ni de perplejidad medidos sobre estos ficheros.

## Requisitos de hardware

- VRAM estimada: no aplica en CPU; en GPU, el peso del fichero más overhead de contexto. IQ4_KS ~1,3 GB, IQ5_KS ~1,6 GB, IQ6_K ~1,9 GB.
- RAM recomendada por el autor: hasta ~4 GB para IQ4_KS, ~6 GB para IQ5_KS, ~8 GB para IQ6_K.
- GPU recomendadas: no disponibles; el autor valida el proceso en CPU (i5-8250U, 8 GB de RAM, sin GPU dedicada).
- ¿Cabe en GPU de consumo? Sí, por tamaño de pesos cabría en GPUs con 4-8 GB de VRAM, pero la compatibilidad de estas variantes IQK está limitada a `ik_llama.cpp`.
- Opciones de despliegue: exclusivamente `ik_llama.cpp` (`llama-cli`, `llama-perplexity`, `llama-quantize`). No compatible con `llama.cpp` estándar, Ollama ni LM Studio.
- Latencia y throughput: no disponibles. El autor indica que IQ4_KS es la más rápida de las tres e IQ6_K la más lenta en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / compatibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-IK-GGUF (esta ficha) | ~2,5 B | No disponible | Apache 2.0 | GGUF IQK, solo `ik_llama.cpp` |
| openbmb/MiniCPM5-2B (base) | ~2,5 B | No disponible | Apache 2.0 | Pesos originales (safetensors/GGUF F16) |
| Cuantizaciones GGUF estándar de MiniCPM5-2B | ~2,5 B | No disponible | Apache 2.0 | GGUF Q4_K_M, Q5_K_M, Q6_K; compatibles con `llama.cpp`, Ollama, LM Studio |

No se dispone de datos de benchmarks comparativos entre estas variantes y modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: las variantes IQ4_KS, IQ5_KS e IQ6_K no cargan en `llama.cpp` estándar, Ollama ni LM Studio; requieren `ik_llama.cpp`.
- Riesgo de alucinación inherente a un modelo de 2,5 B parámetros; no se han publicado evaluaciones específicas de fidelidad factual.
- Sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento multilingüe del modelo base antes de usarlo en producción.
- Longitud de contexto: no disponible, lo que impide planificar cargas de contexto largo con garantías.
- La cuantización a 4 bits introduce degradación de calidad respecto a F16, aunque el autor la describe como menor que en modelos comparables.
- Uso comercial permitido por licencia Apache 2.0, sujeta a los términos del modelo base.
- Las cifras de calidad (~92 % y ~96 % de acuerdo top-1) provienen de la comunidad y no están verificadas de forma independiente para estos ficheros concretos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Unluckkie/MiniCPM5-2B-IK-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- `ik_llama.cpp`: https://github.com/ikawrakow/ik_llama.cpp
- Dataset de calibración: https://huggingface.co/datasets/eaddario/imatrix-calibration
