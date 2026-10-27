# tinyopsec/UniSS-GGUF

## Resumen

UniSS-GGUF es la conversión a formato GGUF del modelo `cmots/UniSS`, un framework de traducción voz-a-voz construido sobre `Qwen/Qwen2.5-1.5B-Instruct`. Este repositorio, publicado por el usuario `tinyopsec`, contiene **únicamente el modelo de texto**: el tokenizador y los módulos de audio del UniSS original no están incluidos, tal y como advierte el propio autor en la model card. Es, por tanto, un Qwen2.5-1.5B-Instruct cuantizado en 13 variantes (de F16 a Q2_K) y empaquetado para su uso con llama.cpp y runtimes compatibles.

Su relevancia práctica es la de cualquier GGUF pequeño: ejecución local en hardware modesto, sin GPU dedicada, con un único archivo de pesos. El interés específico del repositorio es haber preservado la nomenclatura y el pipeline del proyecto UniSS, lo que permite reutilizar el modelo de texto como componente Lingüístico de un sistema de traducción de voz, siempre que se aporten por separado los módulos de audio del proyecto original.

Conviene ser explícito sobre las limitaciones de la publicación: cero descargas y cero «likes» en el momento de la consulta, ausencia de datos de benchmarks, campo de idiomas vacío y una discrepancia entre el recuento de parámetros del modelo base (1.864.550.912) y el tamaño del archivo F16 declarado (3,0 GB), coherente con que el GGUF solo incluya la parte textual. No hay validación independiente de la calidad de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2, heredada de Qwen2.5-1.5B-Instruct; el UniSS original añade módulos de voz que no se incluyen en este GGUF |
| Parametros totales | 1.864.550.912 (1,86 mil millones) según los safetensors del modelo base; el GGUF de solo texto contiene presumiblemente un subconjunto (~1,5 mil millones, estimación a partir de los 3,0 GB del archivo F16) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el campo de idiomas del repositorio está vacío) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (llama.cpp), un archivo por cuantización; tamaño total del repositorio 18,4 GB |

## Arquitectura y entrenamiento

La información proporcionada no documenta el proceso de entrenamiento de UniSS ni de esta conversión. Lo único verificable es la arquitectura del modelo base: Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, ajustado con instrucciones. El repositorio no incluye datos sobre número de tokens de entrenamiento, composición del dataset, ni sobre si UniSS aplicó RLHF, DPO o un ajuste específico para traducción voz-a-voz.

La innovación técnica del proyecto original es el enfoque «unificado» de traducción voz-a-voz descrito en el nombre UniSS, pero sus detalles (tokenizador de audio, esquema de alineación, etapas de entrenamiento) no aparecen en la información disponible y **no se pueden evaluar a partir de este repositorio**, que es una conversión de pesos sin notas técnicas. La única decisión técnica documentada es la cuantización mediante el pipeline estándar de llama.cpp, con la variante Q4_K_M marcada como recomendada por el autor.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredados de Qwen2.5-1.5B-Instruct.
- Traducción de texto entre idiomas: es el caso de uso natural dado el origen del proyecto (traducción voz-a-voz), aunque este repositorio no puede realizar la parte de voz.
- Razonamiento básico de varios pasos y respuesta a preguntas cerradas, dentro de los límites de un modelo de 1,5 mil millones de parámetros.
- Generación de código y explicaciones técnicas sencillas; no es un modelo especializado en programación.
- Capacidades multilingües: el modelo base Qwen2.5 declara soporte de decenas de idiomas, pero **este repositorio no enumera ninguno** y no hay evaluación disponible.
- Soporte de tool calling / function calling: no documentado en este repositorio. El modelo base Qwen2.5 lo soporta, pero no hay verificación de que la conversión GGUF preserve el formato de plantilla necesario.
- Modo «thinking» o razonamiento extendido: no disponible.
- Voz, audio o visión: **no soportado en este GGUF**, por diseño explícito del autor.

## Casos de uso

- Traducción de texto en local: sustituir la rama de texto de un pipeline UniSS por este GGUF cuando los módulos de audio se ejecutan en otro proceso, manteniendo el sistema completo en máquinas sin GPU.
- Prototipado de asistentes conversacionales en entornos sin conectividad: un archivo Q4_K_M de ~1 GB se distribuye con la aplicación y se ejecuta en CPU, útil para demos y pruebas de concepto.
- Generación de texto auxiliar en herramientas de escritorio: resúmenes, reescritura y respuestas cortas dentro de un plugin (LM Studio, koboldcpp) sin depender de una API externa.
- Preprocesado y etiquetado de corpus: clasificación de documentos, extracción de campos simples y generación de pares pregunta-respuesta para construir datasets de ajuste fino.
- Evaluación comparativa de cuantizaciones: al ofrecer 13 variantes del mismo modelo, sirve para medir la degradación de calidad de Q2_K a F16 en una tarea concreta antes de fijar una configuración de producción.
- Base para ajuste fino posterior: al derivar de Qwen2.5-1.5B-Instruct, es un punto de partida manejable para LoRA en una sola GPU consumer, aunque conviene partir de los pesos originales en safetensors y no del GGUF.
- Componente de texto en un sistema de subtitulado o transcripción: si se dispone por separado de un ASR, este modelo puede encargarse de la traducción del texto transcrito con latencia baja en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tareas de traducción, y tampoco hay métricas de degradación por cuantización. No se debe asumir que el rendimiento coincide con el del modelo base sin medirlo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos, sin caché KV): ~3,0 GB en F16, ~1,7–2,0 GB en Q8_0, ~1,3 GB en Q6_K, ~1,1 GB en Q5_K_M y ~1,0–1,1 GB en Q4_K_M. Son estimaciones a partir de los tamaños declarados, no medidas publicadas.
- Cabe en cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) incluso en F16; en Q4_K_M funciona holgadamente en 2 GB.
- Inferencia en CPU viable: es el escenario principal de un GGUF de este tamaño. Un equipo de escritorio convencional puede ejecutarlo, aunque no hay cifras de latencia o throughput publicadas.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI **no** cargan GGUF de forma nativa; para esos motores habría que usar los safetensors originales.
- Latencia y throughput: no disponibles. No se han publicado mediciones y cualquier cifra sería especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tinyopsec/UniSS-GGUF | 1,86 mil M (recuento del base); ~1,5 mil M en el GGUF de texto | no disponible | GGUF (13 cuantizaciones) | CC BY 4.0 | Solo texto; sin benchmarks; 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54 mil M | 32.768 tokens (según el modelo base) | safetensors | Apache 2.0 (modelo base) | Referencia directa; incluye pesos completos y plantilla de chat |
| cmots/UniSS | no disponible | no disponible | no disponible | no disponible | Proyecto original voz-a-voz; incluye los módulos de audio ausentes aquí |

Otras familias comparables por tamaño (Llama 3.2 1B Instruct, SmolLM2-1.7B-Instruct) no se incluyen con cifras porque no se dispone de datos verificados en la información proporcionada. Para una comparación rigurosa de calidad conviene evaluar el modelo base Qwen2.5-1.5B-Instruct, que cuenta con documentación pública y métricas propias.

## Limitaciones y advertencias

- **No es un modelo de voz.** A pesar de las etiquetas `speech-to-speech` y `translation` del repositorio, el GGUF no contiene tokenizador ni decodificador de audio. Usarlo esperando funcionalidad de voz produce errores.
- Licencia CC BY 4.0: permite uso comercial, pero obliga a atribuir la autoría y a indicar si se han hecho modificaciones. Hay que verificar además la licencia del UniSS original y la del modelo base Qwen2.5, que este repositorio no reproduce.
- Riesgo de alucinación inherente a un modelo de 1,5 mil millones de parámetros: esperable en preguntas factuales, matemáticas y contextos largos.
- Sin datos de evaluación: no hay evidencia publicada sobre la fidelidad de la cuantización ni sobre el comportamiento del modelo en tareas de traducción.
- Idiomas no declarados: no se puede asumir cobertura multilingüe correcta sin probarla, especialmente en lenguas distintas del inglés y el chino.
- Madurez del repositorio: 0 descargas, 0 «likes», creado y actualizado el mismo día. No hay comunidad, issues ni validación externa; trátese como artefacto no auditado.
- Discrepancia de parámetros: el recuento de safetensors (1,86 mil M) no cuadra con el tamaño del F16 (3,0 GB, más propio de ~1,5 mil M). Conviene verificar qué componentes se han descartado antes de confiar en el modelo para reproducir resultados del proyecto original.
- La búsqueda web realizada no devolvió enlaces relevantes al proyecto (solo páginas genéricas de motores de búsqueda), por lo que no hay documentación externa que respalde las afirmaciones de la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tinyopsec/UniSS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Proyecto original citado en la model card: https://huggingface.co/cmots/UniSS
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la búsqueda web realizada.
