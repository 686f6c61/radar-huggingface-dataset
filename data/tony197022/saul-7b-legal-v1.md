# TONY197022/Saul-7B-Legal-v1

## Resumen

TONY197022/Saul-7B-Legal-v1 es una publicacion de pesos en formato GGUF derivada de Equall/Saul-7B-Instruct-v1, un modelo de 7.241.732.096 parametros (7,24 mil millones) orientado al dominio juridico y distribuido bajo licencia MIT. El repositorio lo firma el usuario TONY197022 y las cuantizaciones fueron generadas con maquinaria de TensorBlock, tal y como se indica en la model card. El modelo resuelve el problema de ejecutar localmente un asistente conversacional especializado en texto legal sin necesidad de infraestructura de GPU de datacenter, ya que las cuantizaciones van desde 2,53 GB (Q2_K) hasta 7,17 GB (Q8_0).

El repositorio combina pesos en safetensors (6,2 GB de tamano de repo) con ficheros GGUF compatibles con llama.cpp a partir del commit b4011. La plantilla de prompt es `<s>[INST] {prompt} [/INST]`, el formato clasico de las familias instruct tipo Mistral y Llama 2, lo que condiciona la integracion en pipelines existentes. La longitud de contexto, la composicion del dataset de entrenamiento y los resultados de benchmarks no se detallan en la informacion disponible.

Su relevancia actual es acotada pero concreta: pocas alternativas de 7B con licencia MIT y etiqueta juridica permiten despliegue local en una GPU de consumo. Hay que tener en cuenta que el repositorio registra 0 descargas y 0 likes, y que su fecha de creacion indicada es 2026-09-22, por lo que se trata de una publicacion sin validacion comunitaria ni historial de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de Equall/Saul-7B-Instruct-v1, familia instruct de 7B con plantilla tipo Mistral/Llama 2) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,2 GB) y GGUF |
| Libreria | transformers |
| Modelo base | Equall/Saul-7B-Instruct-v1 |
| Plantilla de prompt | `<s>[INST] {prompt} [/INST]` |
| Repositorio | 6,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico verificable es que se trata de una publicacion derivada de Equall/Saul-7B-Instruct-v1 y que la model card la etiqueta con las categorias `legal`, `GGUF` y `conversational`, ademas de declarar el idioma ingles.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion: los ficheros GGUF fueron generados con maquinas de TensorBlock y son compatibles con llama.cpp a partir del commit b4011 (`a6744e43e80f4be6398fc7733a01642c846dce1d`). El repositorio mantiene dos vias de uso: los pesos originales en safetensors para cargar con transformers y las cuantizaciones GGUF para inferencia local. Los parametros totales declarados en safetensors, 7.241.732.096, son coherentes con un transformer denso de aproximadamente 7B, aunque no se especifica la configuracion de capas, dimensiones ocultas ni mecanismo de atencion.

## Capacidades

- Generacion de texto conversacional en ingles, con la plantilla `<s>[INST] {prompt} [/INST]`.
- Asistencia en dominio juridico: la model card etiqueta explicitamente el modelo como `legal` y el nombre del repositorio incluye `Legal-v1`.
- Razonamiento y respuesta multi-turno: la etiqueta `conversational` y la naturaleza instruct del modelo base apuntan a este uso.
- Compatibilidad con despliegue local mediante llama.cpp, Ollama y otros motores que consumen GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags de HuggingFace).
- Capacidades de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Soporte multilingue: limitado a ingles segun el campo de idiomas; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Revision y resumen de contratos: el modelo puede recibir clausulas en ingles y devolver resumenes o deteccion de obligaciones, siempre con revision humana posterior dado el riesgo de alucinacion en materia juridica.
- Asistente interno de consultas normativas: desplegado en una intranet con Ollama o llama.cpp sobre una GPU de consumo, permite a un equipo legal resolver dudas repetitivas sobre terminologia sin enviar texto confidencial a APIs externas.
- Clasificacion y etiquetado de documentacion legal: uso del modelo para categorizar expedientes, tipos de contrato o jurisdicciones dentro de un pipeline de ingesta documental.
- Preprocesado en flujos de e-discovery: generacion de resumenes y extraccion de entidades de grandes volumenes de documentos en ingles antes de pasar a revision por abogados.
- Prototipado de chatbots juridicos: la licencia MIT y el formato GGUF permiten montar demos y pruebas de concepto sin coste de licencia ni dependencia de proveedor cloud.
- Generacion de borradores de clausulas estandar: redaccion asistida de textos repetitivos (avisos de privacidad, condiciones de servicio) con plantillas controladas por el equipo.
- Aplicaciones educativas: explicacion de conceptos juridicos a estudiantes, con la advertencia de que el contenido generado debe verificarse contra fuentes primarias.
- Despliegue en entornos con requisitos de soberania del dato: al ejecutarse en local, el texto no sale de la infraestructura de la organizacion, lo que facilita el cumplimiento de politicas internas de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones especificas del dominio juridico (por ejemplo, LexGLUE o LegalBench), y tampoco se ofrecen mediciones de perplejidad o de calidad por nivel de cuantizacion mas alla de las etiquetas cualitativas que acompanan a cada fichero GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion y tamano de fichero declarado:
  - Q2_K: 2,532 GB de pesos.
  - Q3_K_S: 2,947 GB; Q3_K_M: 3,277 GB; Q3_K_L: 3,560 GB.
  - Q4_0: 3,827 GB; Q4_K_S: 3,856 GB; Q4_K_M: 4,068 GB (opcion equilibrada recomendada por el autor de la cuantizacion).
  - Q5_0 y Q5_K_S: 4,654 GB; Q5_K_M: 4,779 GB.
  - Q6_K: 5,534 GB; Q8_0: 7,167 GB.
  - Pesos en safetensors: 6,2 GB de repositorio, aproximadamente 14,5 GB en precision fp16 en memoria.
- Sumar a esas cifras el cache KV y los buffers de contexto, que dependen de la longitud de contexto efectiva (no disponible) y del numero de secuencias concurrentes.
- GPU recomendadas: para safetensors en fp16 o bf16, una A100 40 GB, H100 o similar; para GGUF cuantizado, cualquier GPU consumer con VRAM suficiente.
- Cabe en GPU de consumo: si. Con Q4_K_M (4,068 GB) es viable en tarjetas de 6-8 GB de VRAM con contexto corto; Q5_K_M y Q6_K encajan comodamente en una RTX 3060 12 GB o RTX 4060 Ti 16 GB; Q8_0 requiere 8-10 GB de VRAM libre y una RTX 4090 24 GB lo ejecuta sin problemas junto con contexto amplio.
- Alternativa CPU: las cuantizaciones Q2_K a Q4_K_M permiten inferencia en CPU con llama.cpp u Ollama, a costa de una latencia muy superior.
- Opciones de despliegue: llama.cpp (commit b4011 o posterior), Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; para los pesos safetensors, transformers y, potencialmente, vLLM o TGI, aunque no se documenta compatibilidad verificada con estos ultimos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| TONY197022/Saul-7B-Legal-v1 | 7.241.732.096 | no disponible | safetensors + GGUF | MIT | en | 0 descargas, 0 likes |
| Equall/Saul-7B-Instruct-v1 (modelo base) | no disponible en la informacion facilitada | no disponible | no disponible | no disponible | no disponible | Origen de los pesos; la model card del derivado no reproduce sus especificaciones |
| tensorblock/Saul-7B-Instruct-v1-GGUF | mismos pesos base | no disponible | GGUF | no disponible | no disponible | Repositorio de cuantizaciones referenciado en la model card, con los mismos ficheros y tamanos |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otras alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con modelos como Mistral-7B-Instruct u otros asistentes juridicos de 7B.

## Limitaciones y advertencias

- Ausencia total de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas juridicas o generales es desconocido.
- Riesgo de alucinacion alto en un dominio donde los errores tienen consecuencia legal; cualquier salida debe ser verificada por un profesional cualificado.
- El modelo no constituye asesoramiento juridico y su uso para decisiones legales sin supervision humana es desaconsejable.
- Idiomas soportados: unicamente ingles. No hay soporte declarado de castellano ni de otras lenguas, lo que limita su uso en Espana sin un ajuste adicional.
- Longitud de contexto no disponible: no se puede planificar el tratamiento de documentos largos sin verificarla empiricamente en el modelo base.
- La model card no documenta sesgos conocidos, composicion del dataset de entrenamiento ni procedencia de los datos juridicos, lo que dificulta evaluar sesgos de dominio o de representacion.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S, Q3_K_M) conllevan perdida de calidad significativa segun la propia tabla del autor; para uso real se recomienda Q4_K_M o superior.
- Licencia MIT: permite uso comercial y modificacion sin restricciones de copyleft, pero conviene verificar la licencia y los terminos del modelo base Equall/Saul-7B-Instruct-v1, no detallados en esta ficha.
- Los ficheros GGUF requieren llama.cpp en el commit b4011 o posterior; versiones anteriores pueden no cargarlos correctamente.
- La fecha de creacion indicada (2026-09-22) y la ausencia de historial de versiones impiden conocer si el repositorio recibira mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TONY197022/Saul-7B-Legal-v1
- Modelo base: https://huggingface.co/Equall/Saul-7B-Instruct-v1
- Repositorio de cuantizaciones GGUF referenciado: https://huggingface.co/tensorblock/Saul-7B-Instruct-v1-GGUF
- Commit de llama.cpp indicado como compatible (b4011): https://github.com/ggerganov/llama.cpp/commit/a6744e43e80f4be6398fc7733a01642c846dce1d
- TensorBlock (proveedor de las cuantizaciones): https://tensorblock.co
- TensorBlock Forge: https://github.com/TensorBlock/forge
- TensorBlock Studio: https://github.com/TensorBlock/TensorBlock-Studio
- Awesome MCP Servers: https://github.com/TensorBlock/awesome-mcp-servers
