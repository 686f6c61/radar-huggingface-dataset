# spreadsmoney/hush0-api

## Resumen

Hush0 API es un servicio de enrutado (router) publicado como repositorio en HuggingFace bajo el identificador `spreadsmoney/hush0-api`. No es un modelo de lenguaje entrenado ni publica pesos: se trata de una capa de API compatible con el endpoint de chat de OpenAI que unifica el acceso a modelos de terceros (Llama 4 Maverick, DeepSeek V3/R1, Kimi K2, Qwen3 235B, Mistral Large, Claude, GPT-5, Gemini 2.5 Pro y Grok 4, segun la model card) bajo una sola URL base y una sola clave.

Su propuesta diferencial no es el rendimiento del modelo, sino el etiquetado de privacidad de cada peticion. Cada modelo enrutado recibe una etiqueta (`sealed`, `private` o `anonymized`) que describe quien puede leer el texto enviado, y el cliente puede exigir un minimo con la cabecera `X-Privacy-Floor`. El nivel `sealed` se apoya en computacion confidencial (enclaves verificados) y cada respuesta incluye un recibo en cabeceras con el nivel de privacidad, el modelo usado, el hash de pesos, la atestacion y el coste.

El repositorio es de licencia MIT, no tiene descargas ni likes registrados y no incluye artefactos de entrenamiento, configuracion de inferencia ni datos de arquitectura. La etiqueta `pipeline_tag: text-generation` parece aplicada por herencia de la categoria del servicio, no porque el repositorio contenga un modelo generativo propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un servicio de enrutado de API, no un modelo) |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no aplica (no es un modelo MoE propio) |
| Longitud de contexto | no disponible (depende del modelo de terceros enrutado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende de cada modelo enrutado) |
| Licencia | MIT (licencia del repositorio; los modelos subyacentes tienen sus propias licencias) |
| Formato de pesos | no disponible (no se publican pesos; el acceso es via API HTTP) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento descrito en la informacion proporcionada. El componente tecnico descrito es una capa de enrutado compatible con la API de chat de OpenAI, accesible mediante `OPENAI_BASE_URL=https://hush0.ai/v1` y una clave con prefijo `sk-hush0-`. Para el nivel de privacidad `sealed`, la model card afirma que el texto se descifra unicamente dentro de un enclave verificado, lo que implica el uso de computacion confidencial (TEE), aunque no se detalla el proveedor de enclaves, el mecanismo de atestacion ni el modelo de amenaza.

El modelo de identidad tambien es atipico: las claves se emiten contra una cartera (wallet) en lugar de un correo electronico y, segun la documentacion, estan firmadas y no almacenadas. Cada respuesta incorpora cabeceras de recibo (`X-Privacy-Level`, `X-Model`, `X-Weights-Sha256`, `X-Attestation`, `X-Cost-USD`). No se describe el uso de RLHF, DPO ni ningun pipeline de datos, porque el repositorio no entrena modelos.

## Capacidades

- Enrutado multi-modelo: un unico endpoint da acceso a modelos de varios proveedores, entre ellos Llama 4 Maverick, DeepSeek V3, DeepSeek R1, Kimi K2, Qwen3 235B, Mistral Large, Claude Opus 5, Claude Sonnet 5, Claude Haiku 4.5, GPT-5, Gemini 2.5 Pro y Grok 4, segun la tabla de etiquetas de privacidad de la model card.
- Compatibilidad con la API de chat de OpenAI: sustitucion directa cambiando la URL base y la clave, sin reescribir el codigo cliente.
- Etiquetado de privacidad por modelo: `sealed` (nadie puede leer el texto; solo se descifra dentro de un enclave verificado), `private` (la maquina lo ve un instante, retencion cero) y `anonymized` (el laboratorio que creo el modelo ve el texto, nunca la identidad del usuario).
- Suelo de privacidad obligatorio: la cabecera `X-Privacy-Floor: sealed` hace fallar la peticion si esta fuera a ejecutarse en un modelo de nivel inferior, en lugar de degradar silenciosamente.
- Recibos de respuesta: cabeceras con nivel de privacidad, modelo utilizado, hash SHA-256 de los pesos, atestacion y coste en USD.
- Gestion de claves ligada a cartera: emision de claves a una wallet, firmadas y no almacenadas.
- Mercado de credito no consumido: pagina de marketplace para revender o reasignar credito.
- SDK de cliente en npm: el paquete `@hush0/sdk` esta publicado para Node.js.
- No documentado en la informacion disponible: soporte de tool calling o function calling, capacidades de vision, audio, modo de razonamiento explicito, agentes multi-paso y lista concreta de idiomas soportados.

## Casos de uso

- Migracion sin reescritura desde OpenAI: un equipo que ya usa el SDK de OpenAI solo tiene que cambiar `base_url` y `api_key`. Permite probar proveedores alternativos y comparar coste sin tocar la logica de la aplicacion.
- Tramitacion de documentos sensibles bajo requisito normativo: con `X-Privacy-Floor: sealed`, un despacho juridico o un departamento de salud puede forzar que el texto solo se procese en modelos con enclave verificado, y recibir un fallo explicito si ningun modelo cumple ese nivel.
- Enrutado por clasificacion de sensibilidad de datos: en un mismo pipeline, las consultas con datos personales se dirigen a modelos `sealed` o `private` y las consultas genericas a modelos `anonymized`, seleccionando el nivel con una cabecera HTTP.
- Trazabilidad de coste y auditoria tecnica: las cabeceras `X-Cost-USD`, `X-Model` y `X-Weights-Sha256` permiten registrar por peticion que modelo se uso, cuanto costo y que pesos exactos respondieron, util para facturacion interna y para auditorias de reproducibilidad.
- Evaluacion comparativa de modelos desde un solo cliente: al unificar el formato de peticion, se puede ejecutar el mismo conjunto de prompts contra Llama 4 Maverick, DeepSeek R1, Qwen3 235B o GPT-5 cambiando un parametro, sin gestionar varias cuentas ni claves.
- Aprovisionamiento automatico sin cuentas de correo: al emitirse las claves contra una wallet y no almacenarse, encaja en flujos de agentes autonomos o entornos efimeros donde no se quiere crear una identidad de usuario tradicional.
- Gestion de credito sobrante: el marketplace permite reasignar o revender credito no consumido, relevante para equipos con picos de consumo irregulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, algo coherente con el hecho de que el repositorio no contiene pesos ni un modelo entrenado. Los resultados de la busqueda web realizada no aportan datos tecnicos sobre este proyecto: los enlaces devueltos corresponden a paginas de soporte de Microsoft (inicio de sesion en Hotmail, descarga de ISO de Windows 8.1, contacto con soporte) y no guardan relacion con Hush0.

## Requisitos de hardware

- Inferencia local: no aplica. El servicio se consume por HTTP; no hay pesos que cargar ni GPU necesaria en el lado del cliente.
- Cliente: cualquier maquina con acceso a internet, Python 3 con el paquete `openai` o Node.js con `@hush0/sdk`. No requiere VRAM ni acelerador.
- GPU recomendadas: no aplica para el cliente. El hardware del lado servidor (enclaves TEE para el nivel `sealed`) no se detalla en la informacion proporcionada.
- Compatibilidad con GPU de consumo: irrelevante para el uso previsto del repositorio.
- Opciones de despliegue: uso como API remota mediante el SDK de OpenAI o el cliente npm. Se referencia un repositorio de codigo fuente (GitHub), pero la informacion disponible no confirma si el servicio es autoalojable ni que requisitos tendria.
- Latencia y throughput: no disponibles. Dependeran del modelo enrutado en cada peticion, de la carga del proveedor y, en el nivel `sealed`, del coste adicional de la atestacion y del enclave.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas en la informacion proporcionada. Como referencia de categoria, Hush0 compite con routers de API multi-modelo (por ejemplo OpenRouter o agregadores equivalentes) y con el acceso directo a cada laboratorio, pero no se han facilitado especificaciones, precios ni metricas de esos servicios. La siguiente tabla recoge unicamente los ejes de comparacion y marca como no disponible todo aquello que no se ha podido verificar.

| Criterio | Hush0 API | Routers multi-modelo alternativos | Acceso directo al laboratorio |
|---|---|---|---|
| Parametros | no disponible (no es un modelo) | no disponible en la informacion facilitada | no disponible en la informacion facilitada |
| Longitud de contexto | no disponible (heredada del modelo enrutado) | no disponible | no disponible |
| Rendimiento | no disponible | no disponible | no disponible |
| Licencia | MIT en el repositorio; modelos de terceros con sus propias licencias | no disponible | no disponible |
| Etiquetas de privacidad por modelo | Si (`sealed`, `private`, `anonymized`) | no disponible | no disponible |
| Suelo de privacidad forzable por cabecera | Si (`X-Privacy-Floor`) | no disponible | no disponible |
| Claves ligadas a wallet en lugar de correo | Si | no disponible | no disponible |
| Precio | no disponible (se anuncia "por debajo de los laboratorios", sin cifras) | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo entrenado: el repositorio no publica pesos, configuracion de inferencia ni artefactos de entrenamiento, por lo que no permite inferencia local ni fine-tuning.
- Etiqueta de pipeline potencialmente enganosa: `pipeline_tag: text-generation` describe el tipo de trafico que gestiona el servicio, no el contenido del repositorio, que es una capa de enrutado.
- Senales de baja madurez: cero descargas y cero likes en el momento de la consulta. Ademas, las fechas de creacion y actualizacion indicadas (13 de septiembre de 2026) son posteriores a la fecha habitual de redaccion, un dato que conviene verificar antes de cualquier evaluacion.
- Resultados de busqueda no concluyentes: la busqueda web no devolvio ninguna fuente relacionada con Hush0, por lo que no hay corroboracion externa independiente de las afirmaciones de la model card.
- Dependencia de terceros: la calidad, la disponibilidad, el contexto maximo, el soporte de idiomas y el riesgo de alucinacion dependen por completo del modelo subyacente elegido en cada peticion, no de Hush0.
- Garantias de privacidad no verificadas de forma independiente: la afirmacion de que en el nivel `sealed` "nadie puede leer el texto" depende de la implementacion del enclave y de su atestacion. No se especifica proveedor de TEE, mecanismo de atestacion ni modelo de amenaza, y la informacion disponible no incluye una auditoria externa.
- Nombres de modelos sin identificadores tecnicos: la model card cita nombres comerciales (por ejemplo Claude Opus 5, GPT-5, Gemini 2.5 Pro, Grok 4) sin indicar versiones exactas ni identificadores de modelo, lo que dificulta la reproducibilidad.
- Capacidades no documentadas: no hay informacion sobre tool calling, agentes multi-paso, vision, audio, modo de razonamiento ni lista de idiomas soportados.
- Licencia: el MIT cubre el repositorio del servicio, no los modelos enrutados. El uso comercial de cada modelo subyacente queda sujeto a los terminos de su propio proveedor.
- Sin SLA ni limites de tasa publicados en la informacion disponible: no se detallan cupos, disponibilidad garantizada ni politica de retencion mas alla de las etiquetas declaradas.
- Cadena de suministro: cualquier dependencia del paquete npm `@hush0/sdk` o del repositorio de GitHub citado debe auditarse antes de usarse en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/spreadsmoney/hush0-api
- Sitio oficial: https://hush0.ai
- Modelos y precios: https://hush0.ai/models.html
- Mercado de credito no usado: https://hush0.ai/market.html
- Documentacion: https://hush0.ai/docs.html
- Claves de API (seccion de docs): https://hush0.ai/docs.html#api-keys
- Cliente npm: https://www.npmjs.com/package/@hush0/sdk
- Codigo fuente: https://github.com/ptrcozolr/AI
