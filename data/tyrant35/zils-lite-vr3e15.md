# tyrant35/zils-lite-vr3e15

## Resumen

zils-lite-vr3e15 es un ajuste fino mediante LoRA de rango 64 sobre el modelo base joamCriff123/zils-lite-l1123q, un "soup-pool body" de la familia Zils d3-lite. Lo publica el usuario tyrant35 en Hugging Face con licencia Apache 2.0 y un total de 852.985.920 parametros (aproximadamente 853 millones). El modelo esta etiquetado como "decision-model", es decir, esta especializado en tareas de decision tipadas: preguntas de si/no, eleccion multiple y puntuacion.

El problema que aborda es el de la toma de decisiones estructurada sobre contextos de recuperacion y razonamiento. El ajuste se realizo sobre las proyecciones de atencion del modelo base con un unico pase de entrenamiento (learning rate 3e-5, acumulacion de gradiente 8), y el cambio respecto al soup se escalo por un factor de 1.5. Los datos de entrenamiento son unas 4.000 preguntas de decision tipadas en dominios de artes, razonamiento y recuperacion, generadas por un modelo de lenguaje a partir de filas de splits de entrenamiento de datasets publicos.

Es relevante ahora porque representa un ejemplo de especializacion ligera y de bajo coste sobre un modelo base pequeno (menos de mil millones de parametros), orientada a una tarea concreta de decision y con un pipeline de autoria de datos documentado. No obstante, la informacion publica es escasa: no hay resultados de benchmarks, no se declaran idiomas soportados y no se especifica la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, inferido por el ajuste sobre proyecciones de atencion; no confirmado en la informacion) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de joamCriff123/zils-lite-l1123q, descrito como un "soup-pool body" de la familia Zils d3-lite. Sobre ese cuerpo se aplico un unico ajuste fino LoRA de rango 64 sobre las proyecciones de atencion, con learning rate 3e-5 y acumulacion de gradiente 8 durante un solo pase. El cambio respecto al soup se escalo por un factor de 1.5. La informacion disponible no detalla el tipo exacto de bloque (transformer denso, MoE o hibrido) ni el numero de capas, dimensiones ocultas o cabezas de atencion.

Los datos de entrenamiento consisten en aproximadamente 4.000 preguntas de decision tipadas (si/no, eleccion y puntuacion) en dominios de artes, razonamiento y recuperacion. Fueron escritas por un modelo de lenguaje a partir de filas de los splits de entrenamiento de datasets publicos: tareas de entrenamiento de BIG-bench como date understanding, logical deduction, physics, sports understanding y riddle sense, ademas de BoolQ, MultiRC, SQuAD 2.0, CoQA, FEVER, QASC, ReClor, SST-5 y Yelp, entre otros. Se siguio la receta publica de autoria de items en `scripts/author_exam.py`. Una segunda pasada de respuesta ciega conservo solo los items cuya respuesta coincidia con la etiqueta escrita. Los objetivos mezclan la etiqueta gold con las probabilidades propias del soup: peso gold de 0.9 donde la respuesta principal del soup era incorrecta y de 0.32 donde era correcta. No se uso split de validacion ni de test para el entrenamiento.

## Capacidades

- Respuesta a preguntas de decision de tipo si/no sobre un contexto dado.
- Eleccion entre opciones multiples (decision de eleccion).
- Puntuacion o scoring de respuestas o items.
- Razonamiento sobre contextos de recuperacion (retrieval), con soporte para tareas de comprension lectora y verificacion de hechos segun los datasets de entrenamiento (SQuAD 2.0, CoQA, FEVER, BoolQ, MultiRC).
- Razonamiento logico y deductivo basico, fisica, comprension deportiva y resolucion de adivinanzas, derivado de las tareas de BIG-bench usadas en el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion.

## Casos de uso

- Clasificacion binaria de afirmaciones en pipelines de verificacion: el modelo puede recibir un contexto y una afirmacion y devolver una decision de si/no, adecuado por su entrenamiento con BoolQ, FEVER y SQuAD 2.0.
- Enrutamiento de consultas en sistemas de recuperacion: dado un contexto recuperado y una pregunta, el modelo puede decidir si la respuesta esta contenida o no, util para filtrar candidatos antes de una generacion costosa.
- Evaluacion automatica de respuestas en entornos educativos: con preguntas de eleccion multiple y puntuacion, puede asignar una decision o score a respuestas de alumnos sobre contextos de comprension lectora.
- Moderacion o triaje de contenido con criterios definidos: el formato de decision tipada permite plantear reglas como "¿cumple este texto el criterio X?" y obtener una respuesta binaria o una puntuacion.
- Puntuacion de relevancia en ranking de documentos: el modo score permite ordenar pasajes recuperados por su adecuacion a una consulta, integrándose en un reranker ligero.
- Clasificacion de intenciones en asistentes conversacionales: al ser un modelo de 853 millones de parametros, puede desplegarse en infraestructura modesta para decidir la intencion o la ruta de una consulta antes de invocar un modelo mayor.
- Validacion de hipotesis en razonamiento logico: con tareas de deduccion logica y date understanding en el entrenamiento, puede usarse para comprobar consistencia de fechas o deducciones simples en flujos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (853 millones de parametros), en fp16 requeriria aproximadamente 1,7 GB solo de pesos, mas overhead de activaciones y cache KV; en cuantizaciones de 8 bits o 4 bits el peso se reduciria a alrededor de 0,9 GB y 0,45 GB respectivamente, aunque el autor no documenta dichas cuantizaciones.
- GPU recomendadas: no disponible en la informacion. Por tamano, cabria en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales de compatibilidad ni de rendimiento.
- Cabe en consumer GPU: probablemente si por tamano, pero no confirmado por el autor.
- Opciones de despliegue: no disponible en la informacion (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; los pesos estan en safetensors, lo que sugiere carga via transformers, sin confirmacion).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma familia o categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo es un ajuste fino de un unico pase sobre unas 4.000 preguntas generadas por un modelo de lenguaje; el riesgo de sobreajuste a los estilos y sesgos de esos datos es alto.
- No se uso split de validacion ni de test, por lo que no hay evidencia publicada de generalizacion.
- Las etiquetas de entrenamiento se generaron con un modelo de lenguaje y se filtraron por coincidencia con la etiqueta escrita; pueden contener errores sistematicos heredados del generador.
- Los objetivos mezclan la etiqueta gold con las probabilidades del soup (pesos 0.9 y 0.32), lo que puede introducir calibracion dependiente del comportamiento del modelo base.
- No se declaran idiomas soportados; el entrenamiento se basa en datasets mayoritariamente en ingles, por lo que el rendimiento en castellano es incierto.
- No se documenta la longitud de contexto, lo que limita el diseno de aplicaciones con contextos largos.
- Riesgo de alucinacion: no evaluado ni documentado; al ser un modelo de decision y no de generacion abierta, el riesgo se traslada a decisiones erroneas con alta confianza.
- Sesgos conocidos: no documentados; los datasets de origen (BIG-bench, BoolQ, FEVER, etc.) pueden introducir sesgos de dominio y de anotacion.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base joamCriff123/zils-lite-l1123q debe verificarse por separado para confirmar compatibilidad de licencias en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-25), lo que indica ausencia de validacion por parte de la comunidad.
- No se documenta el pipeline de Hugging Face ni la tarea declarada, lo que complica la integracion automatica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-vr3e15
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1123q
- Receta de autoria de items: `scripts/author_exam.py` (referenciada en la model card; no se proporciona URL)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion
