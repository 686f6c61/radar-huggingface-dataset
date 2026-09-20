# suchirsalhan/polypythia-160m-das-rotations

## Resumen

`suchirsalhan/polypythia-160m-das-rotations` es un repositorio de artefactos, no un modelo de lenguaje listo para uso general. Según su model card, contiene material asociado al envío a ICLR 2027 titulado "What survives retraining?" (herramienta `beetle-analyze`, commit 821db7250), subido el 20 de septiembre de 2026. La estructura del repositorio corresponde a una organización por carpeta de tipo `run/experiment`, y el autor remite a `paper/iclr/RESULTS_2026-09-19_CONSOLIDATED.md` dentro del repositorio de GitHub `suchirsalhan/beetle-analyze` para consultar el protocolo y los resultados completos.

Los modelos base declarados son los de la familia EleutherAI PolyPythias, con licencia Apache-2.0. El identificador incluye "160m", lo que apunta a la escala de 160 millones de parámetros propia de Pythia-160m, y el sufijo "das-rotations" sugiere artefactos de rotaciones vinculados a técnicas de interpretabilidad mecanicista (DAS, Distributed Alignment Search), si bien esto no se explicita en la model card y debe considerarse una inferencia a partir del nombre y de las etiquetas, no un dato confirmado.

El interés del repositorio es, por tanto, de investigación en interpretabilidad y en fenómenos de retención de capacidades tras reentrenamiento, más que de despliegue en producción. No tiene descargas ni "likes", no declara pipeline ni idiomas, y no incluye resultados de benchmarks. La búsqueda web realizada no devolvió ningún enlace relevante sobre este repositorio: los resultados obtenidos correspondían a contenidos sin relación (comparativas de sillas de oficina en alemán), por lo que no se han incorporado a esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Los modelos base declarados (EleutherAI PolyPythias, derivados de Pythia) son transformers decoder-only; no se confirma que los artefactos del repositorio sean pesos de modelo |
| Parámetros totales | No disponible. El identificador indica escala de 160M, coherente con Pythia-160m, pero no se confirma para el contenido del repositorio |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible en la model card. Como referencia, los modelos Pythia base se entrenaron con 2048 tokens de contexto |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible |
| Pipeline declarado | No disponible (campo vacío en HuggingFace) |
| Etiquetas | pythia, polypythias, interpretability, iclr-2027, region:us |
| Descargas / "likes" | 0 / 0 |
| Fecha de creación | 2026-09-20T11:10:37Z |
| Última actualización | 2026-09-20T11:10:38Z |

## Arquitectura y entrenamiento

La model card no describe ninguna arquitectura ni proceso de entrenamiento propios. Se limita a indicar que el repositorio contiene artefactos derivados del envío a ICLR 2027 "What survives retraining?", generados con la herramienta `beetle-analyze` (commit 821db7250), y que los modelos base son los de EleutherAI PolyPythias bajo licencia Apache-2.0. Los PolyPythias son la familia de Pythia reentrenada por EleutherAI en múltiples configuraciones, ampliamente utilizada en interpretabilidad por su disponibilidad de checkpoints intermedios y su reproducibilidad.

La estructura de carpetas del repositorio se organiza como `run/experiment`, lo que sugiere que cada directorio corresponde a una ejecución de un experimento concreto. El autor remite al fichero `paper/iclr/RESULTS_2026-09-19_CONSOLIDATED.md` del repositorio `suchirsalhan/beetle-analyze` para el protocolo y los resultados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineamiento. Tampoco se confirma si el repositorio contiene pesos, matrices de rotación, activaciones intermedias u otro tipo de artefactos.

## Capacidades

- El repositorio no documenta capacidades funcionales de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas soportados.
- No se declara modo de razonamiento explícito (thinking), entrada de audio ni capacidades multimodales.
- Por las etiquetas (`interpretability`, `polypythias`, `das-rotations`), el uso previsto parece ser la investigación en interpretabilidad mecanicista sobre modelos base Pythia de 160M, no la inferencia de propósito general.
- Al tratarse de artefactos de un experimento reproducible, la capacidad relevante es la de permitir reproducir o auditar los resultados del envío descrito, no la de resolver tareas de usuario final.

## Casos de uso

- Reproducción de experimentos de interpretabilidad: el repositorio permite recuperar los artefactos de una ejecución concreta (`run/experiment`) y contrastarlos con el protocolo descrito en el fichero de resultados del repositorio de GitHub, algo habitual en investigación mecanicista donde la reproducibilidad es un requisito de publicación.
- Estudio de retención de capacidades tras reentrenamiento: el título del envío ("What survives retraining?") apunta a analizar qué propiedades de una representación o de un modelo persisten cuando se vuelve a entrenar; los artefactos servirían como evidencia empírica de ese análisis sobre la base PolyPythias de 160M.
- Investigación en rotaciones y alineamiento distribuido (DAS): si los artefactos son matrices de rotación asociadas a DAS, serían útiles para investigadores que quieran aplicar, comparar o refutar esas transformaciones sobre subespacios de activación de un transformer pequeño.
- Validación de metodología en modelos pequeños: con 160M parámetros, el coste computacional de replicar experimentos en una GPU de consumo es bajo, lo que facilita que un grupo de investigación verifique el protocolo antes de escalarlo a modelos mayores.
- Base para estudios de sesgo y de comportamiento en Pythia: al derivar de PolyPythias, los artefactos pueden integrarse en análisis más amplios sobre sesgos y sobre el efecto de las semillas de entrenamiento en la familia Pythia.
- Referencia para revisión por pares: al estar publicados en HuggingFace con una licencia permisiva, los revisores de ICLR pueden descargar exactamente los artefactos usados en la submission y comprobar las afirmaciones del artículo sin depender de material suplementario opaco.
- Docencia en interpretabilidad: como ejemplo práctico de cómo se publican y se estructuran artefactos experimentales de un paper, en cursos de mecánica de modelos o de reproducibilidad en machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y la búsqueda web no devolvió documentación técnica asociada a este repositorio. Un repositorio de artefactos experimentales de este tipo no suele reportar benchmarks de rendimiento del modelo base; las métricas relevantes, si existen, estarían en el fichero de resultados del repositorio de GitHub al que remite el autor.

## Requisitos de hardware

- VRAM para inferencia: no disponible, ya que no se confirma que el repositorio contenga pesos de un modelo desplegable. Si se ejecutase el modelo base PolyPythias de 160M, las necesidades serían muy reducidas (del orden de 0,3-1 GB en precisión completa según el formato y de menos de 0,3 GB en cuantizaciones de 4 bits, como estimación orientativa a partir del recuento de parámetros).
- GPU recomendadas: no disponibles para estos artefactos. Para el modelo base de 160M, cualquier GPU con 4 GB o más de VRAM sería suficiente, incluidas GTX 1650, RTX 3060 o superiores.
- GPU de consumo: un modelo de 160M en fp16 cabe sin dificultad en cualquier GPU de consumo actual e incluso puede ejecutarse en CPU con latencias aceptables.
- Opciones de despliegue: no documentadas. Para un modelo Pythia de 160M serían viables `transformers` de HuggingFace, `llama.cpp` (previa conversión a GGUF), Ollama y, con menor eficiencia relativa por el tamaño, vLLM o TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| suchirsalhan/polypythia-160m-das-rotations | 160M (según identificador, no confirmado) | No disponible | Apache-2.0 | Repositorio en HuggingFace, 0 descargas | Artefactos de experimento (interpretabilidad) |
| EleutherAI Pythia-160m | 160M | 2048 tokens | Apache-2.0 | Pesos públicos y ampliamente descargados | Modelo de lenguaje base |
| EleutherAI PolyPythias (familia) | Varias escalas, incluida 160M | No confirmado en la información disponible | Apache-2.0 | Pesos públicos | Modelos base reentrenados para estudios de reproducibilidad |
| GPT-2 small | 124M | 1024 tokens | MIT (según la publicación original) | Pesos públicos | Modelo de lenguaje base |

La comparación directa es limitada porque este repositorio no es un modelo de propósito general, sino material de soporte de un artículo. Frente a los modelos base de su misma escala, la diferencia no está en capacidades ni en contexto, sino en la finalidad: reproducibilidad de un experimento de interpretabilidad.

## Limitaciones y advertencias

- No se documenta que el repositorio contenga un modelo ejecutable; podría tratarse únicamente de artefactos intermedios (rotaciones, activaciones o resultados), en cuyo caso no es utilizable para inferencia.
- No hay información sobre sesgos. Los modelos Pythia, en general, se entrenan sobre The Pile y heredan sesgos de ese corpus, pero no se ha verificado el comportamiento de estos artefactos.
- Riesgo de alucinación: no evaluable, ya que no se describe una capacidad generativa asociada a este repositorio.
- Limitaciones de contexto e idioma: no disponibles. No se declara ningún idioma soportado.
- Licencia: Apache-2.0, permisiva para uso comercial, pero el autor no ofrece garantías sobre la idoneidad de los artefactos. La licencia de los modelos base (PolyPythias, Apache-2.0) debe respetarse igualmente.
- Repositorio sin descargas ni "likes" y sin documentación más allá de tres líneas, lo que dificulta evaluar su calidad sin acudir al repositorio de GitHub referenciado.
- El commit de la herramienta (`821db7250`) y el fichero de resultados (`RESULTS_2026-09-19_CONSOLIDATED.md`) son referencias externas; si el repositorio de GitHub cambia o se elimina, la trazabilidad del experimento se pierde.
- Para producción: no recomendado. Este material está pensado para investigación y revisión por pares, no para despliegue de servicios.

## Enlaces

- HuggingFace: https://huggingface.co/suchirsalhan/polypythia-160m-das-rotations
- Repositorio de GitHub referenciado en la model card: suchirsalhan/beetle-analyze (fichero `paper/iclr/RESULTS_2026-09-19_CONSOLIDATED.md`)
- Modelos base: EleutherAI PolyPythias (Apache-2.0), familia derivada de Pythia
- Búsqueda web: no se han encontrado enlaces relevantes sobre este repositorio; los resultados devueltos no guardaban relación con el modelo y se han descartado.
