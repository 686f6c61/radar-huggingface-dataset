# xAkre/Zubr

## Resumen

Żubr es un adaptador LoRA para el modelo polaco Bielik-1.5B-v3.0-Instruct, publicado por el usuario xAkre en Hugging Face. El adaptador está especializado en la interpretación de las reglas de evaluación periódica (oceny okresowe) dentro del servicio civil polaco (służba cywilna), un dominio administrativo muy concreto regulado por la Ley de servicio civil, el reglamento del Consejo de Ministros de 4 de abril de 2016 y las reglas de cómputo de plazos de la KPRM (Cancillería del Primer Ministro).

El modelo resuelve un problema acotado pero real: responder consultas estructuradas sobre plazos, criterios, fuentes normativas y procedimientos de evaluación de funcionarios, tareas en las que el modelo base rinde muy por debajo de lo aceptable (10,3% de acierto agregado en el conjunto de test). Tras el ajuste fino, el adaptador alcanza un 66,0% de acierto en ese mismo conjunto, con mejoras especialmente marcadas en tareas de plazos y de evaluación.

Se trata de un adaptador PEFT de pequeño tamaño (repositorio de 0,1 GB) sobre un modelo base de 1.500 millones de parámetros, entrenado con 2.329 ejemplos sintéticos generados a partir de las funciones de la aplicación Żubr. Es relevante como ejemplo de ajuste fino de dominio muy estrecho sobre un modelo pequeño, con licencia Apache 2.0 y un conjunto de evaluación publicado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Bielik-1.5B-v3.0-Instruct) |
| Parametros totales | 1.500 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar (librería PEFT) aplicado sobre speakleash/Bielik-1.5B-v3.0-Instruct, un transformer decoder-only de 1.500 millones de parámetros orientado a instrucciones en polaco. No se especifican en la información disponible el rango del LoRA, el valor de alpha, las capas objetivo ni la tasa de aprendizaje empleada.

El entrenamiento se realizó durante 2 épocas sobre 2.329 ejemplos sintéticos derivados de las reglas de evaluación periódica del servicio civil polaco (Ley de servicio civil, reglamento PRM de 4 de abril de 2016 y reglas de cómputo de plazos de la KPRM). Las respuestas del conjunto de entrenamiento se calcularon con las funciones de la aplicación Żubr, y según el autor los datos no contienen información personal. El entrenamiento se ejecutó en una Tesla T4 durante 34,4 minutos, finalizando el 22 de noviembre de 2026 a las 02:58 UTC. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Respuesta a consultas estructuradas sobre evaluación periódica en el servicio civil polaco: plazos, criterios, fuentes normativas y procedimientos.
- Generación de respuestas con formato controlado: el 100% de las respuestas del conjunto de test incluyen la línea «ODPOWIEDŹ:» (respuesta), frente al 86% del modelo base.
- Cálculo e interpretación de plazos administrativos en categorías como término de evaluación, reevaluación, resolución de objeciones, recurso y tribunal laboral.
- Identificación de la fuente normativa aplicable (con bajo rendimiento: 14% de acierto).
- Razonamiento sobre supuestos de hecho administrativos (fakt) y sobre obligatoriedad de trámites (obowiazkowe).
- Capacidades generales heredadas del modelo base Bielik-1.5B-v3.0-Instruct, no evaluadas específicamente en esta ficha.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistencia a departamentos de recursos humanos de la administración pública polaca: el adaptador responde consultas sobre plazos de evaluación periódica y criterios aplicables, con un 88% de acierto en la categoría «ocena» del conjunto de test, lo que permite usarlo como primera línea de consulta interna.
- Soporte a la tramitación de objeciones y recursos: con un 70% de acierto en «termin/rozpatrzenie-sprzeciwu» y un 100% en «termin/sprzeciw», puede ayudar a calcular y verificar plazos de presentación y resolución.
- Verificación de cómputo de plazos antes de la firma de resoluciones: útil como comprobación cruzada en tareas de «termin/ocena» (92%) y «termin/sad-pracy» (86%), siempre con revisión humana.
- Formación de funcionarios: el modelo puede generar explicaciones sobre los criterios de evaluación y las normas aplicables a partir de supuestos, con la advertencia de que no sustituye asesoramiento jurídico.
- Clasificación y estructuración de consultas administrativas: la alta tasa de respuestas con formato «ODPOWIEDŹ:» (100%) facilita el parseo automático en pipelines de atención interna.
- Prototipado de asistentes de dominio sobre modelos pequeños: el adaptador (0,1 GB) sobre un modelo de 1,5B permite desplegar en hardware modesto, incluida una GPU T4, para experimentación y validación de flujos antes de escalar a modelos mayores.
- Investigación sobre ajuste fino con datos sintéticos: el conjunto de evaluación publicado por el autor (291 ejemplos) sirve como referencia para estudiar la transferencia de dominio en modelos pequeños.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 291 ejemplos de test no usados en entrenamiento:

| Tipo de tarea | Ejemplos | Modelo base | Modelo ajustado |
|---|---:|---:|---:|
| arkusz | 25 | 12% | 100% |
| dodatkowe | 27 | 56% | 67% |
| fakt | 48 | 6% | 29% |
| nieobecnosc | 30 | 7% | 67% |
| obowiazkowe | 9 | 0% | 78% |
| ocena | 60 | 5% | 88% |
| taknie | 4 | 50% | 50% |
| termin/kryteria | 12 | 0% | 58% |
| termin/kryteria-negatywna | 7 | 0% | 86% |
| termin/ocena | 12 | 0% | 92% |
| termin/ponowna-ocena | 11 | 0% | 55% |
| termin/rozpatrzenie-sprzeciwu | 10 | 10% | 70% |
| termin/sad-pracy | 7 | 0% | 86% |
| termin/sprzeciw | 7 | 14% | 100% |
| zrodlo | 22 | 0% | 14% |
| **Total** | **291** | **10,3%** | **66,0%** |
| Respuestas con línea «ODPOWIEDŹ:» | 291 | 86% | 100% |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el modelo base de 1,5B en precisión FP16 requiere aproximadamente 3 GB de VRAM, y en cuantización de 4 bits alrededor de 1-1,5 GB (estimación, no publicada por el autor).
- GPU recomendadas: el autor entrenó en una Tesla T4, por lo que la inferencia es viable en GPUs de gama media como T4, RTX 3060, RTX 4060 o superiores; también en A100/H100 si se necesita mayor throughput.
- Cabe en GPUs de consumo: sí, en modelos con al menos 4-6 GB de VRAM en FP16 o 2-3 GB en cuantización de 4 bits.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el modelo base), vLLM con soporte de LoRA, TGI y llama.cpp/Ollama si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles; el autor solo documenta el tiempo de entrenamiento (34,4 minutos en T4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Żubr (este modelo) | 1,5B (base) + LoRA | no disponible | Evaluación periódica en servicio civil polaco | Apache 2.0 | Hugging Face |
| speakleash/Bielik-1.5B-v3.0-Instruct | 1,5B | no disponible | Instrucciones generales en polaco | no disponible en esta ficha | Hugging Face |
| Bielik de mayor tamaño (p. ej. 4.5B/11B) | 4,5B-11B | no disponible | Instrucciones generales en polaco | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó con datos sintéticos de un rango limitado de tareas; fuera de ese dominio se comporta como el modelo base, sin especialización.
- Las respuestas deben verificarse: es una ayuda, no asesoramiento jurídico. Los plazos calculados en meses requieren conocimiento del calendario y pueden ser erróneos.
- El rendimiento en identificación de la fuente normativa es muy bajo (14%), por lo que no es fiable para citar la norma aplicable.
- El rendimiento en la categoría «fakt» (29%) y en «termin/ponowna-ocena» (55%) es limitado y requiere revisión humana.
- El modelo solo soporta polaco; no se ha evaluado su comportamiento en otros idiomas.
- Riesgo de alucinación en consultas fuera del dominio de entrenamiento o con supuestos ambiguos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Bielik puede tener condiciones adicionales que deben verificarse en su propia model card.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al ser un modelo de dominio administrativo, puede reflejar sesgos presentes en la normativa y en los datos sintéticos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xAkre/Zubr
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
