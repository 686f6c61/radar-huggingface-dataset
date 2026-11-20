# SZLHOLDINGS/salad-ring-ouro-l44

## Resumen

`salad-ring-ouro-l44` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "governed-AI estate": una coleccion de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de recibos (receipts). El repositorio se creo el 18 de noviembre de 2026 y se actualizo dos dias despues, pero no incluye ninguna especificacion tecnica del modelo en su model card.

La informacion disponible es exclusivamente metadata de gobernanza: identidad del repositorio, enlaces a la organizacion en GitHub y referencias a graficos SVG deterministicos generados a partir de una instantanea de auditoria. La propia model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no este respaldada por un recibo se marca como UNKNOWN, y no se afirma ningun resultado de benchmark.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, no declara pipeline, licencia ni idiomas, y no expone pesos, tokenizador ni configuracion. Por tanto, todos los apartados tecnicos de esta ficha se marcan como no disponibles, y la evaluacion practica del modelo no es posible sin acceder a los recibos del "estate mesh" referenciados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No disponible. La model card no describe arquitectura (transformer, MoE, SSM ni hibrida), numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor indica que las afirmaciones de entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro del mesh del estate, pero no se enlaza ningun recibo concreto en el repositorio ni se aporta ninguna cifra medible.

La unica innovacion declarada es de proceso, no de modelado: los graficos de la card son SVG deterministicos generados con la libreria estandar de Python a partir de una instantanea de auditoria fechada el 2026-11-20T03:48:04Z, y cada numero se etiqueta como MEASURED, REPORTED o UNKNOWN con su hora de captura. Es un mecanismo de procedencia, no una contribucion arquitectonica.

## Capacidades

- No se declara ninguna capacidad funcional en la informacion disponible: ni generacion de texto, ni razonamiento, ni codigo, ni matematicas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues ni lista de idiomas.
- No se declaran modos especiales (thinking mode, vision, audio, decodificacion especulativa).
- El pipeline de Hugging Face figura como no disponible, por lo que no se puede confirmar ni siquiera la modalidad de la tarea.

## Casos de uso

No es posible recomendar casos de uso concretos sin conocer la arquitectura, el tamano, la modalidad ni la licencia del artefacto. Los unicos escenarios que la informacion disponible permite plantear son de evaluacion y gobernanza:

- Auditoria de procedencia: un equipo de compliance puede inspeccionar los ficheros de recibo del estate para verificar que afirmaciones sobre el modelo estan respaldadas por una medicion fechada, dado que la card distingue explicitamente entre MEASURED, REPORTED y UNKNOWN.
- Evaluacion previa a adopcion: antes de integrar el modelo en cualquier pipeline, seria necesario localizar los recibos de entrenamiento y evaluacion citados por el autor, ya que el repositorio no los incluye.
- Trazabilidad de cadena de suministro: el enlace a la organizacion `szl-holdings` en GitHub permite rastrear el codigo que genera las cards (`estate-cards` weaver v0.1.0) y reproducir los SVG de auditoria de forma determinista.
- Verificacion de integridad de la card: el identificador de card `6a9d6bc8229ef3fb` y la marca temporal de generacion permiten comprobar que la version consultada coincide con la auditada.
- Estudio de practicas de documentacion de modelos: el patron de etiquetado MEASURED/REPORTED/UNKNOWN es un ejemplo citables de documentacion honesta sobre ausencia de datos.
- Cualquier caso de uso productivo (atencion al cliente, generacion de codigo, RAG, agentes) queda descartado hasta que se publique la informacion tecnica y la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y que cualquier dato no respaldado por un recibo se considera UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos ni pipeline.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse el tamano, la arquitectura, la modalidad ni la licencia, no es posible identificar modelos comparables de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| salad-ring-ouro-l44 | no disponible | no disponible | no disponible | no confirmada |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se publican parametros, contexto, arquitectura, tokenizador ni formato de pesos, lo que impide cualquier evaluacion tecnica.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido; debe tratarse como no apto para produccion hasta que se aclare.
- Idiomas no declarados: se desconoce si el modelo soporta castellano o cualquier otra lengua.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de uso o validacion por terceros.
- Riesgo de alucinacion y sesgos: no evaluables sin datos de entrenamiento ni evaluaciones publicadas.
- Las afirmaciones de entrenamiento y evaluacion se delegan a ficheros de recibo no enlazados en el repositorio; sin acceso a ellos, toda capacidad declarada por el autor debe considerarse no verificada.
- El contenido de la model card es material de referencia del autor y no debe interpretarse como instrucciones operativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l44
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Repositorio del generador de cards (referenciado en la card): https://github.com/szl-holdings/estate-cards
- Paper, blog, demo o documentacion adicional: no disponible
