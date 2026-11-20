# SZLHOLDINGS/salad-flagship54-v2

## Resumen

salad-flagship54-v2 es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face dentro de lo que la organizacion denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada hacia un repositorio canonico (szl-frontier) y ficheros de "recibos" (receipts) de auditoria. El repositorio contiene pesos en formato safetensors con un tamano total de 27,5 GB, lo que sugiere un modelo de decenas de miles de millones de parametros en precision completa o media, aunque el autor no declara el numero de parametros ni la arquitectura en la model card.

La relevancia de esta ficha es fundamentalmente metodologica: la model card es explicita al afirmar que cualquier cifra de entrenamiento o evaluacion no incluida en sus recibos debe considerarse UNKNOWN, y que no se afirma ningun resultado de benchmark mas alla de lo medido en una auditoria fechada. Esto es una practica poco habitual y merece destacarse, pero tambien implica que la informacion tecnica disponible publicamente es practicamente nula: no hay arquitectura declarada, ni contexto, ni idiomas, ni licencia, ni pipeline de inferencia.

Por tanto, esta ficha documenta lo que se puede verificar (formato de pesos, tamano del repositorio, autor, fechas, enlaces) y marca explicitamente como "no disponible" todo lo demas. Cualquier evaluacion de idoneidad para produccion requeriria inspeccionar los pesos y los recibos del repositorio canonico, que no forman parte de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el repo pesa 27,5 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card ni en los metadatos del repositorio. No consta si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con atencion lineal o un modelo multimodal. El unico dato estructural verificable es el formato de serializacion (safetensors) y el tamano agregado del repositorio (27,5 GB), que es consistente con un modelo de decenas de miles de millones de parametros almacenado en bf16/fp16, pero esta inferencia no esta confirmada por el autor.

Respecto al entrenamiento, la model card declara explicitamente que las afirmaciones sobre entrenamiento y evaluacion viven en los ficheros de recibos del "estate mesh" y que cualquier cosa no receiptada debe tratarse como UNKNOWN. No se indica numero de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta el proceso de tokenizacion ni el vocabulario.

## Capacidades

- No se declaran capacidades especificas en la model card: no hay mencion a generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se documenta ningun modo especial (thinking mode, vision, audio, decodificacion especulativa).
- La unica capacidad verificable es la de servir pesos en safetensors para carga mediante librerias compatibles (por ejemplo, transformers con safetensors), condicionada a que la arquitectura sea reconocible por dichas librerias.

## Casos de uso

Dado que no se declaran capacidades ni arquitectura, los casos de uso son hipoteticos y deben validarse empíricamente antes de cualquier adopcion:

- Evaluacion interna de modelos: el repositorio puede cargarse en un entorno controlado para inspeccionar la arquitectura real, el tokenizador y el comportamiento base, como paso previo a decidir si merece la pena integrarlo en un pipeline.
- Investigacion sobre trazabilidad y governanza de IA: el modelo sirve como ejemplo de publicacion con recibos de auditoria y etiquetado MEASURED/REPORTED/UNKNOWN, util para estudiar practicas de documentacion reproducible.
- Pruebas de carga y despliegue: con 27,5 GB de pesos, es un candidato para validar infraestructura de servido (vLLM, TGI, llama.cpp si se convierte a GGUF) y medir latencia y throughput reales en el hardware disponible.
- Fine-tuning experimental: si la licencia lo permite (dato no disponible), podria usarse como base para ajuste supervisado en dominios concretos, siempre que la arquitectura sea compatible con las herramientas estandar.
- Benchmarking comparativo propio: al no haber cifras publicadas, cualquier uso evaluativo requeriria ejecutar los benchmarks internamente y documentar los resultados con la misma disciplina de recibos que el autor propone.
- Analisis de seguridad y sesgos: inspeccionar los pesos y realizar pruebas de red teaming para detectar comportamientos indeseados antes de cualquier despliegue, dado que no hay documentacion de alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada, y que dichas mediciones residen en los ficheros de recibos del estate mesh, no incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia puramente orientativa a partir del tamano del repo (27,5 GB en safetensors), la carga en bf16/fp16 requeriria al menos ~28 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria ~14-15 GB y en 4 bits ~7-8 GB, pero estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, una A100 40/80 GB o H100 serian las opciones conservadoras para precision completa; una RTX 4090 (24 GB) solo cabria con cuantizacion agresiva.
- Compatibilidad con GPU de consumo: probablemente solo mediante cuantizacion (no se publican ficheros GGUF), lo que exigiria conversion manual.
- Opciones de despliegue: no documentadas. Serian aplicables vLLM, TGI o llama.cpp (previa conversion a GGUF) si la arquitectura es compatible, pero no hay confirmacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar modelos comparables, ya que se desconoce la arquitectura, el tamano en parametros, el contexto y las capacidades del modelo. Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se declaran arquitectura, parametros, contexto, idiomas ni licencia, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; tratar como no apto para produccion hasta verificar la licencia en el repositorio.
- Riesgo de alucinacion y sesgos: desconocidos, al no haber documentacion de alineacion, datos de entrenamiento ni evaluaciones de seguridad.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Sin ficheros cuantizados: solo safetensors, lo que limita el despliegue en hardware de consumo sin conversion manual.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay senales de adopcion ni de validacion por parte de la comunidad.
- La model card remite a recibos externos (estate mesh) no incluidos en la informacion proporcionada; cualquier afirmacion del autor debe verificarse en el repositorio canonico szl-frontier.
- Fechas de creacion y actualizacion (2026-11-17 y 2026-11-20) son posteriores a la fecha habitual de publicacion de modelos; conviene verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-flagship54-v2
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio canonico declarado: https://github.com/szl-holdings/szl-frontier
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
