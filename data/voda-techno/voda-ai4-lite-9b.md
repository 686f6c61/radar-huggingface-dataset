# VoDa-Techno/VoDa-AI4-Lite-9b

## Resumen

VoDa-AI4-Lite-9b es un modelo de generación de texto presentado por VoDa-Techno como parte de la familia VoDa AI4, una línea de modelos de chat de propósito general con variantes de 4B, 9B y 27B, además de una rama específica para programación (Coder). El modelo se distribuye en formato GGUF y está orientado al chat cotidiano, respuesta de preguntas, asistencia sobre textos y traducción, con soporte declarado de ruso e inglés.

La información pública es muy limitada: la model card no detalla arquitectura, composición del dataset de entrenamiento, número de tokens vistos ni proceso de alineación (RLHF/DPO). El autor lo describe como una "nueva generación" de su línea, pero no aporta resultados de benchmarks ni comparativas técnicas verificables.

Existe una discrepancia relevante entre el nombre comercial ("9b") y el recuento real de parámetros publicado en los safetensors del repositorio (456.010.480 parámetros, es decir, aproximadamente 0,46B). Esta ficha recoge ambos datos y advierte de la inconsistencia, ya que afecta directamente a las estimaciones de hardware y a la comparación con otros modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona la etiqueta "qwen" sin detallar la arquitectura) |
| Parametros totales | 456.010.480 según safetensors; el nombre comercial indica "9b" (discrepancia no aclarada) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en GGUF; no se detallan los niveles publicados) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | other (licencia propia de VoDa AI; remite a LICENSE, sin texto publicado en la información disponible) |
| Formato de pesos | GGUF (tamaño del repositorio: 6,6 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. La model card incluye la etiqueta "qwen", lo que sugiere una posible base o inspiración en la familia Qwen, pero no se confirma ni se detalla si se trata de un transformer denso, un MoE o una arquitectura híbrida. Tampoco se especifican la dimensión de las capas, el número de cabezas de atención, la función de activación ni el tokenizador empleado.

Respecto al entrenamiento, no hay datos sobre el volumen de tokens, la composición del corpus, el uso de datos sintéticos, ni sobre etapas de ajuste supervisado, RLHF o DPO. La model card únicamente indica que es una "modelo universal de nueva generación" para chat, sin innovaciones técnicas destacadas documentadas (no se mencionan decodificación especulativa, atención lineal ni técnicas similares).

## Capacidades

- Generación de texto conversacional: respuestas a preguntas, explicaciones y asistencia general sobre textos.
- Traducción, según la model card ("перевод"), presumiblemente entre ruso e inglés.
- Soporte multilingüe limitado a ruso e inglés según los metadatos del repositorio.
- Redacción y ayuda sobre textos ("помощи по текстам").
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta visión, audio, modo "thinking" ni otras capacidades especiales.
- No se documenta capacidad específica de código o matemáticas (la familia reserva la rama Coder para programación).

## Casos de uso

- Chat de atención al cliente en ruso: el modelo puede mantener conversaciones multi-turno en ruso para consultas frecuentes; su tamaño reducido (según safetensors) permite desplegarlo en infraestructura modesta, aunque la ventana de contexto no está documentada y debe validarse antes de usarlo con historiales largos.
- Asistente de redacción y corrección en ruso e inglés: útil para reescribir, resumir o explicar textos en ambos idiomas, aprovechando el soporte bilingüe declarado.
- Traducción ru↔en en flujos internos: para traducciones de baja criticidad donde se pueda revisar la salida, dado que no hay benchmarks de calidad de traducción publicados.
- Prototipado rápido con Ollama: la model card proporciona el comando `ollama run beebosofficial/VoDa-AI4-Lite:9b`, lo que facilita pruebas locales en equipos de desarrollo sin GPU dedicada.
- Generación de FAQ y documentación de producto: el modelo puede redactar respuestas tipo a partir de material fuente en ruso, siempre con revisión humana por el riesgo de alucinación no evaluado.
- Base para fine-tuning ligero: si el recuento real de 456M parámetros es correcto, el modelo es candidato a ajuste fino en una sola GPU consumer para dominios verticales en ruso.
- Experimentación académica con modelos en ruso: como punto de partida para comparativas de modelos pequeños en ruso, teniendo en cuenta la ausencia de benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con el recuento real de 456M parámetros, una cuantización de 4 bits ocuparía del orden de 0,3-0,5 GB de pesos, y de 8 bits en torno a 0,5-0,7 GB; a 16 bits, aproximadamente 0,9-1 GB. Estas cifras son estimaciones basadas en el número de parámetros y no en datos del autor.
- Si se interpreta el nombre "9b" literalmente (9.000 millones de parámetros), la VRAM necesaria sería muy superior: del orden de 5-6 GB en 4 bits y 18 GB en 16 bits. La discrepancia con los safetensors impide dar una cifra fiable.
- GPU recomendadas: no disponibles. Por el tamaño declarado en safetensors, cabría en cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU.
- Despliegue: la model card documenta Ollama. Al distribuirse en GGUF, es compatible con llama.cpp y con otros runners que acepten dicho formato; no se confirma soporte de vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque el autor no publica benchmarks ni especificaciones de arquitectura, y el recuento real de parámetros (456M) no encaja con la categoría "9b" que sugiere el nombre. A modo orientativo, se compara con alternativas de la misma franja declarada y con modelos pequeños multilingües:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VoDa-AI4-Lite-9b | 456M según safetensors (nombre indica 9B) | no disponible | ru, en | other (propia) | GGUF |
| Qwen2.5-7B | 7,6B | 128K (según documentación pública de Qwen) | multilingüe | Apache 2.0 / licencia Qwen según variante | safetensors, GGUF |
| Llama 3.1 8B | 8B | 128K | multilingüe | Llama 3.1 Community License | safetensors, GGUF |
| Gemma 2 9B | 9B | 8K | multilingüe | Gemma Terms of Use | safetensors, GGUF |

Los datos de los modelos comparados provienen de su documentación pública habitual; los de VoDa-AI4-Lite-9b, de la información disponible en su repositorio. No se dispone de métricas de calidad comparables.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre indica "9b" pero los safetensors declaran 456.010.480 parámetros. Cualquier planificación de hardware o evaluación de capacidad debe resolverse antes de usar el modelo en producción.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de calidad en ruso o inglés publicadas.
- Riesgo de alucinación no evaluado: al no haber datos de alineación ni evaluaciones, no puede estimarse la fiabilidad factual.
- Contexto desconocido: se desconoce la ventana máxima, lo que limita el diseño de aplicaciones con documentos largos o historiales extensos.
- Idiomas restringidos a ruso e inglés; el rendimiento en castellano no está documentado ni declarado.
- Licencia "other" con referencia a un archivo LICENSE no incluido en la información disponible: es imprescindible revisar los términos antes de cualquier uso comercial.
- Modelo con cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- La referencia a Ollama apunta a un repositorio distinto (`beebosofficial/VoDa-AI4-Lite:9b`) del ID de Hugging Face (`VoDa-Techno/VoDa-AI4-Lite-9b`), lo que conviene verificar para asegurar que se descarga el artefacto correcto.
- No se documenta soporte de tool calling ni de agentes, por lo que no debería asumirse en pipelines automatizados.

## Enlaces

- Hugging Face: https://huggingface.co/VoDa-Techno/VoDa-AI4-Lite-9b
- Model card del autor (incluida en el repositorio de Hugging Face)
- Comando Ollama indicado en la model card: `ollama run beebosofficial/VoDa-AI4-Lite:9b`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
