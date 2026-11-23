# SZLHOLDINGS/salad-ring-ouro-l9

## Resumen

salad-ring-ouro-l9 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad documental y resultados verificables mediante ficheros de recibos (receipts). El repositorio de Hugging Face no incluye model card tecnica convencional, sino una tarjeta generada automaticamente por su herramienta interna "estate-cards weaver" que prioriza la declaracion explicita de incertidumbre sobre cualquier afirmacion de capacidad.

La informacion publica disponible es minima: no se declara arquitectura, numero de parametros, longitud de contexto, tokenizador, datos de entrenamiento ni idiomas soportados. La propia tarjeta indica que cualquier afirmacion de entrenamiento o evaluacion debe residir en ficheros de recibos del "estate mesh", y que lo no acreditado se etiqueta como UNKNOWN. El escaneo de recibos de la tranche 6 (chunk 9, 22 de noviembre de 2026) clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo, pero no hay un DONE.json estricto con estado MEASURED, codigo de salida de evaluacion cero y marca temporal.

Por tanto, se trata de un modelo sin evidencia publica de calidad ni de capacidades. Es relevante unicamente como objeto de auditoria: ilustra un patron de publicacion donde la ausencia de datos se declara explicitamente en lugar de rellenarse con cifras no verificadas. Para cualquier uso en produccion, la evaluacion independiente seria obligatoria y, a dia de hoy, no existe base publica para realizarla.

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

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se indica el numero de parametros, la longitud de contexto nativa ni el tokenizador empleado.

Respecto al entrenamiento, la tarjeta remite a "receipt files" del estate mesh para cualquier afirmacion sobre datos, numero de tokens, composicion del corpus o tecnicas de alineacion como RLHF o DPO. El escaneo estricto de recibos de 22 de noviembre de 2026 no encuentra un DONE.json que cumpla el umbral (estado MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento), por lo que la evidencia de evaluacion se marca como UNKNOWN. El unico fichero con nombre de recibo localizado es un SVG de contexto (assets/szl-card/mesh-receipts.svg), que el propio escaneo califica como coincidencia por palabra clave y no como evidencia validada. No hay, por tanto, innovacion tecnica documentada: ni decodificacion especulativa, ni atencion lineal, ni estrategias de cuantizacion declaradas.

## Capacidades

- Generacion de texto: no confirmada; no hay evidencia publica de que el artefacto sea funcional.
- Razonamiento, codigo y matematicas: no disponible.
- Vision, audio o multimodalidad: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la tarjeta no declara idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Auditoria de cadena de custodia de artefactos: el repositorio sirve como ejemplo de publicacion con trazabilidad declarada y ausencia explicita de datos; util para equipos que disenan pipelines de verificacion de modelos en Hugging Face.
- Prueba de infraestructura de evaluacion: un equipo puede usar el repositorio como caso de prueba para validar que su pipeline detecta correctamente artefactos sin evidencia (clasificacion RECEIPT_FILES_NO_DONE).
- Formacion en practicas de model cards: la tarjeta generada ilustra el uso de etiquetas MEASURED/REPORTED/UNKNOWN y la generacion determinista de SVG con la libreria estandar de Python.
- Investigacion sobre gobernanza de IA: permite estudiar como una organizacion documenta la incertidumbre en lugar de omitirla, y comparar ese enfoque con model cards convencionales.
- Integracion en registros internos de modelos: si una organizacion mantiene un catalogo de artefactos candidatos, este repositorio puede registrarse como "pendiente de evidencia" sin riesgo de atribuirle capacidades no verificadas.
- No se recomienda ningun caso de uso en produccion (atencion al cliente, generacion de codigo, RAG, agentes) porque no existe evidencia de que el modelo funcione ni de las condiciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos de 22 de noviembre de 2026 no encuentra evidencia de evaluacion valida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; se desconoce el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; sin pesos identificables ni arquitectura declarada no puede confirmarse compatibilidad con ningun runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No puede establecerse una categoria de comparacion (tamano, tarea, arquitectura) sin especificaciones publicas del modelo.

| Modelo | Parametros | Contexto | Licencia | Evidencia publica |
|---|---|---|---|---|
| salad-ring-ouro-l9 | no disponible | no disponible | no disponible | sin recibos validos (UNKNOWN) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni formato de pesos, es imposible planificar su despliegue.
- Sin evidencia de evaluacion: el escaneo estricto clasifica el repositorio como RECEIPT_FILES_NO_DONE; no hay DONE.json con estado MEASURED ni eval_rc=0.
- Licencia no declarada: no puede asumirse uso comercial, redistribucion ni modificacion; el uso en produccion queda bloqueado por incertidumbre legal.
- Idiomas no declarados: no puede garantizarse cobertura del castellano ni de ninguna otra lengua.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo y sin datos de entrenamiento.
- Cero traccion publica: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fechas de creacion y actualizacion (noviembre de 2026) posteriores a la fecha habitual de referencia: conviene verificar la integridad temporal del repositorio antes de cualquier uso.
- La propia tarjeta advierte de que las afirmaciones no acreditadas son UNKNOWN; cualquier capacidad atribuida al modelo fuera de sus recibos seria una invencion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l9
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
