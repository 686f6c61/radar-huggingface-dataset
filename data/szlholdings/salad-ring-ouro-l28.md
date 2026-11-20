# SZLHOLDINGS/salad-ring-ouro-l28

## Resumen

`salad-ring-ouro-l28` es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "governed-AI estate": una coleccion de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts) y resultados verificables. El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de un pipeline interno de la organizacion.

La informacion publica disponible es extremadamente escasa. La model card no incluye arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento, idiomas ni licencia. El autor indica explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion debe consultarse en los ficheros de recibos del "estate mesh", y que todo lo que no este respaldado por un recibo se etiqueta como UNKNOWN. Esta politica de honestidad declarativa es el unico dato tecnico verificable de la ficha.

El sufijo "l28" del nombre sugiere, sin confirmacion por parte del autor, un posible tamano de 28 mil millones de parametros o 28 capas, pero se trata de una inferencia no verificada y no debe tomarse como especificacion. El modelo no registra descargas ni likes en el momento de la consulta y no tiene pipeline declarado, por lo que su estado es el de un artefacto publicado pero sin adopcion ni documentacion tecnica publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el sufijo "l28" no esta confirmado como referencia a parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con componentes SSM o cualquier otra variante. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

El autor remite a los ficheros de recibos del "estate mesh" para cualquier afirmacion sobre entrenamiento y evaluacion, y declara que lo no recibido se marca como UNKNOWN. En la informacion proporcionada no se incluye ningun recibo, grafico de curvas de entrenamiento ni snapshot de auditoria mas alla de la referencia a un SVG generado de forma determinista con fecha 2026-11-20T03:48:04Z. No hay, por tanto, ningun dato tecnico verificable sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible.
- Razonamiento, codigo o matematicas: no confirmados.
- Vision, audio o multimodalidad: no confirmados.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo "thinking" o decodificacion especulativa: no disponible.

La model card no enumera ninguna capacidad funcional concreta. Cualquier capacidad atribuida al modelo en ausencia de recibos debe considerarse no verificada.

## Casos de uso

No es posible recomendar casos de uso concretos sin conocer las capacidades, el tamano, el contexto y la licencia del modelo. Los siguientes escenarios son genericos y quedan condicionados a que el autor publique la informacion tecnica correspondiente:

- Evaluacion interna de artefactos de un pipeline gobernado: el modelo podria servir como caso de estudio de trazabilidad y recibos dentro de una organizacion que ya opere con el "estate" de SZLHOLDINGS.
- Reproduccion de experimentos de la fabrica de modelos: util si se dispone de acceso a los recibos y al codigo del pipeline interno referenciado en GitHub.
- Integracion en pipelines de CI/CD propios: solo viable una vez se conozca el formato de pesos y la licencia.
- Despliegue en produccion: no recomendable sin licencia, contexto y benchmarks publicados.
- Fine-tuning sobre dominio especifico: imposible de planificar sin conocer parametros y arquitectura.
- Comparativas academicas: no utilizable como referencia sin datos de evaluacion publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ningun resultado medido en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del numero de parametros, que no se ha publicado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; se desconoce el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa con alternativas de la misma categoria porque se desconocen el tamano, la arquitectura, el contexto y la licencia del modelo, y no existen benchmarks publicados que permitan situarlo frente a otros modelos.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas publicas: arquitectura, parametros, contexto, idiomas y formato de pesos no estan documentados.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; en la practica, esto bloquea cualquier adopcion en produccion.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento mas alla de la declaracion de honestidad de la model card.
- Riesgo de alucinacion y sesgos: desconocidos, al no haber informacion sobre datos de entrenamiento ni alineacion.
- El sufijo "l28" no debe interpretarse como tamano del modelo sin confirmacion del autor.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de adopcion ni de validacion por parte de la comunidad.
- La model card esta generada de forma automatica por una herramienta interna ("estate-cards weaver v0.1.0") y contiene principalmente elementos de gobernanza, no especificaciones tecnicas.
- Fecha de creacion en el repositorio (2026-11-18) posterior a la fecha actual de referencia habitual: conviene verificar la coherencia temporal del artefacto antes de confiar en el.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l28
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada como fuente canonica): https://github.com/szl-holdings
- Herramienta de generacion de model cards (referenciada): https://github.com/szl-holdings/estate-cards
