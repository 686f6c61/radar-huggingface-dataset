# tinyopsec/Qwen3.5-4B-heretic-v2-GGUF

## Resumen

Este repositorio publica versiones cuantizadas en formato GGUF de `Ttimms/Bible-Assistant-Qwen3.5-4B-v2`, un ajuste fino orientado a asistencia sobre contenido bíblico y etiquetado como conversacional. El autor de la cuantización es el usuario `tinyopsec` y el resultado se distribuye bajo licencia Apache 2.0. El modelo cuenta con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), lo que lo sitúa en la gama de modelos pequeños, aptos para ejecución local en GPU de consumo e incluso en CPU según la cuantización elegida.

El aporte del repositorio no es un modelo nuevo, sino un conjunto de diez cuantizaciones (desde Q2_K hasta Q8_0) que cubren un rango de 1,1 GB a 4,2 GB en disco, con requisitos de VRAM estimados de entre 1,5 GB y 4,5 GB. Esto permite desplegar el modelo en portátiles, equipos de sobremesa con GPU de gama media y dispositivos de borde, algo relevante para aplicaciones de consulta bíblica que necesitan funcionar sin conexión o con requisitos de privacidad estrictos.

La relevancia práctica es limitada pero clara: se trata de una especialización vertical (asistencia bíblica) en inglés, con cero descargas y cero valoraciones en el momento de la consulta, y sin resultados de benchmarks publicados ni documentación sobre arquitectura, contexto o proceso de entrenamiento en la información disponible. La model card remite íntegramente al repositorio del modelo base para esos detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se denomina Qwen3.5-4B; el repositorio no documenta la arquitectura) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tarea (pipeline) | text-generation |
| Modelo base | Ttimms/Bible-Assistant-Qwen3.5-4B-v2 |
| Tamano del repositorio | 34,5 GB (conjunto completo de cuantizaciones) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo en los materiales proporcionados. El nombre del modelo base, `Bible-Assistant-Qwen3.5-4B-v2`, sugiere una variante de la familia Qwen con aproximadamente 4.000 millones de parametros, pero el repositorio de cuantizacion no especifica si se trata de un transformer denso, una arquitectura MoE, hibrida o cualquier otra variante, ni detalla la longitud de contexto soportada.

Tampoco hay datos sobre el entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento. La model card del repositorio de cuantizacion se limita a describir el proceso de cuantizacion y a remitir al repositorio original para consultar los detalles de entrenamiento y capacidades. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras).

Cabe senalar que el identificador del repositorio incluye el sufijo `heretic-v2`, que no aparece explicado en la model card, y que el titulo interno del documento hace referencia a un asistente biblico. La model card no documenta ninguna modificacion de pesos, ablation ni ajuste adicional respecto al modelo base mas alla de la cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles, orientada segun la denominacion del modelo base a la asistencia sobre contenido biblico.
- Respuesta a preguntas de tipo "que dice la Biblia sobre...", tal y como ilustra el ejemplo de uso de la model card.
- Conversacion multi-turno: el repositorio incluye la etiqueta `conversational`.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (`en`); no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Capacidades de codigo o matematicas: no disponibles ni declaradas en la informacion proporcionada.

## Casos de uso

- Asistencia de estudio biblico en local: el modelo puede responder consultas sobre pasajes y temas biblicos en ingles ejecutandose completamente en el equipo del usuario, sin enviar consultas a servicios externos. Es adecuado por su tamano reducido y su especializacion declarada.
- Aplicacion de escritorio sin conexion: con las cuantizaciones Q3_K_S o Q2_K (1,4 GB y 1,1 GB de disco) puede integrarse en aplicaciones de escritorio o portatiles con recursos limitados, manteniendo la funcionalidad conversacional.
- Despliegue en CPU para entornos sin GPU: la model card indica que la cuantizacion Q2_K (aproximadamente 1,5 GB de VRAM estimada) es apta para ejecucion solo en CPU, lo que habilita servidores basicos o equipos sin acelerador.
- Chatbot conversacional tematico en ingles: el modelo puede gestionar conversaciones multi-turno sobre contenido religioso en foros, sitios web o asistentes internos de comunidades, aprovechando su caracter conversacional.
- Prototipado rapido con LM Studio u Ollama: al distribuirse en GGUF, se puede cargar en LM Studio o mediante `ollama pull hf.co/tinyopsec/bible-assistant-qwen35-4b-GGUF:q4_k_m` para validar ideas de producto en minutos y sin infraestructura dedicada.
- Generacion de materiales de divulgacion o catequesis: borradores de resumenes, explicaciones o guiones sobre pasajes concretos, siempre con revision humana posterior dado el riesgo de alucinacion en modelos de este tamano.
- Servicio de inferencia via API compatible con OpenAI: la etiqueta `endpoints_compatible` permite exponerlo detras de una pasarela de endpoints y consumirlo desde aplicaciones existentes.
- Base para ajuste fino adicional: al ser un modelo de 4,2 B bajo licencia Apache 2.0, puede servir como punto de partida para tecnicas de adaptacion de bajo rango (LoRA) en dominios cercanos, aunque el repositorio no aporta scripts ni recetas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de calidad por nivel de cuantizacion, ni comparaciones frente a otras versiones del modelo base.

## Requisitos de hardware

Los datos de VRAM y dispositivo objetivo que figuran a continuacion provienen de la tabla incluida en la model card del autor:

| Cuantizacion | Tamano en disco | VRAM estimada | Dispositivo objetivo segun el autor |
|---|---|---|---|
| Q8_0 | ~4,2 GB | ~4,5 GB | GPU de sobremesa |
| Q6_K | ~3,2 GB | ~3,5 GB | GPU de sobremesa |
| Q5_K_M | ~2,7 GB | ~3,0 GB | GPU de sobremesa |
| Q5_K_S | ~2,5 GB | no disponible | no disponible |
| Q4_K_M | ~2,1 GB | ~2,5 GB | GPU de gama media / CPU |
| Q4_K_S | ~1,9 GB | no disponible | no disponible |
| Q3_K_L | ~1,6 GB | no disponible | no disponible |
| Q3_K_M | ~1,5 GB | ~2,0 GB | GPU de portatil |
| Q3_K_S | ~1,4 GB | no disponible | Dispositivos moviles / borde |
| Q2_K | ~1,1 GB | ~1,5 GB | Solo CPU |

- VRAM estimada para inferencia: entre 1,5 GB (Q2_K) y 4,5 GB (Q8_0), segun los datos del autor.
- GPU recomendadas: no se especifican modelos concretos en la informacion proporcionada. Por los requisitos de VRAM, cualquier GPU con 2,5 GB o mas de memoria libre puede ejecutar Q4_K_M; las cuantizaciones Q2_K y Q3_K_S estan pensadas para CPU y dispositivos de borde respectivamente.
- Compatibilidad con GPU de consumo: si. Las cuantizaciones de 4 bits y menores caben en GPUs de gama media y en portatiles; el conjunto completo no requiere aceleradores de centro de datos.
- Opciones de despliegue documentadas: llama.cpp (`./main`), llama-cpp-python, LM Studio y Ollama. La model card incluye ejemplos de uso para las tres primeras y el comando de descarga para Ollama.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos alternativos en la informacion proporcionada, por lo que no es posible construir una comparativa con cifras de rendimiento, contexto o calidad. La unica comparacion documentada en el repositorio es interna, entre los distintos niveles de cuantizacion del mismo modelo:

| Version | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Qwen3.5-4B-heretic-v2-GGUF | 4,2 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones Q2_K a Q8_0 |
| Modelo base: Ttimms/Bible-Assistant-Qwen3.5-4B-v2 | no disponible | no disponible | no disponible | no disponible | Referenciado como origen de los pesos |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad ni evidencia de uso en produccion.
- Ausencia de benchmarks: no hay metricas publicadas que permitan estimar la calidad real del modelo ni la degradacion introducida por cada nivel de cuantizacion.
- Documentacion incompleta: no se detallan arquitectura, longitud de contexto, datos de entrenamiento, proceso de alineamiento ni capacidades de tool calling o razonamiento.
- Ambiguedad en la nomenclatura: el identificador incluye `heretic-v2` mientras que la model card se titula como asistente biblico, sin que se explique la relacion entre ambos nombres ni si se han modificado los pesos respecto al modelo base.
- Riesgo de alucinacion: en un modelo de 4,2 B especializado en contenido doctrinal, la generacion de citas o referencias biblicas incorrectas es un riesgo relevante; se recomienda verificacion humana de cualquier afirmacion factual o cita.
- Sesgos: no se documenta ninguna evaluacion de sesgos, y el ajuste fino sobre un corpus de naturaleza religiosa concreta puede reflejar la perspectiva de las fuentes de entrenamiento utilizadas.
- Limitacion idiomatica: solo se declara soporte de ingles (`en`); no hay evidencia de funcionamiento fiable en castellano u otros idiomas.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K_* reducen el peso a 1,1-1,6 GB, lo que en modelos de este tamano suele implicar una perdida de calidad apreciable; la propia model card recomienda Q4_K_M como opcion por defecto.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio remite al modelo base para los detalles de licencia; conviene verificar que el modelo original no impone condiciones adicionales.
- Fechas de metadatos: el repositorio figura creado el 2026-09-17, fecha que conviene contrastar antes de citarlo en cualquier publicacion.
- Resultados de busqueda web no concluyentes: las consultas realizadas no devolvieron ninguna fuente tecnica relacionada con el modelo, por lo que no hay informacion independiente que corrobore la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/Qwen3.5-4B-heretic-v2-GGUF
- Modelo base: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v2
- Descarga via Ollama: `ollama pull hf.co/tinyopsec/bible-assistant-qwen35-4b-GGUF:q4_k_m`
- Papers, blogs, repositorios o demos adicionales: no disponible. Las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo.
