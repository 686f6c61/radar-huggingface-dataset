# SZLHOLDINGS/salad-ring-ouro-l128

## Resumen

`salad-ring-ouro-l128` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "governed-AI estate": un catalogo de modelos, datasets y Spaces con trazabilidad declarada y resultados verificables mediante ficheros de recibo (receipts). El identificador del repositorio sugiere un modelo de lenguaje, pero la model card no aporta informacion tecnica sobre arquitectura, parametros, tokenizador ni datos de entrenamiento.

La publicacion es reciente (creada el 19 de noviembre de 2026 y actualizada al dia siguiente) y no registra descargas ni interacciones en el momento de redactar esta ficha. La model card se limita a describir la pertenencia al estate, enlazar a la organizacion en GitHub y mostrar graficos SVG generados de forma determinista a partir de una instantanea de auditoria. No incluye pesos descritos, configuracion, vocabulario ni ejemplos de uso.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente documental: sirve para dejar constancia de que el modelo existe como repositorio, de que su informacion publica es practicamente nula y de que cualquier evaluacion tecnica requeriria inspeccionar directamente los ficheros del repositorio y los receipts referenciados, que no estan disponibles en la informacion proporcionada.

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

No se ha publicado informacion sobre la arquitectura del modelo en la model card. No hay mencion a transformer, MoE, SSM ni arquitecturas hibridas, ni a numero de capas, dimensiones ocultas, mecanismos de atencion o tokenizador. El nombre del repositorio incluye el sufijo `l128`, que podria interpretarse como una referencia a una longitud de contexto o a un tamano de capa, pero la informacion proporcionada no confirma ninguna de esas hipotesis.

Tampoco se documentan datos de entrenamiento: no hay cifras de tokens, composicion del corpus, procesos de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas. La model card indica explicitamente que las afirmaciones de entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro del mesh del estate, y que cualquier dato no receiptado se etiqueta como UNKNOWN. Esos receipts no forman parte de la informacion disponible.

## Capacidades

- No se documenta ninguna capacidad concreta en la model card.
- No hay evidencia de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se menciona soporte de tool calling ni function calling.
- No se menciona soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se declara modo de pensamiento (thinking mode), entrada multimodal ni procesamiento de audio.
- La unica capacidad verificable es la existencia del repositorio y la generacion de tarjetas deterministas por parte de la herramienta `estate-cards weaver`.

## Casos de uso

- Auditoria de procedencia: el modelo puede utilizarse como caso de estudio para evaluar el enfoque de "governed-AI estate" de SZLHOLDINGS, revisando como se etiquetan los datos como MEASURED, REPORTED o UNKNOWN y como se enlazan los receipts de auditoria.
- Verificacion de artefactos en cadena de suministro: un equipo de seguridad puede inspeccionar el repositorio para comprobar si los pesos y la configuracion coinciden con lo declarado en la model card y en los ficheros de recibo referenciados.
- Docencia sobre documentacion de modelos: sirve como ejemplo negativo de model card, ya que ilustra que ocurre cuando un repositorio publica identidad y gobernanza pero omite especificaciones tecnicas minimas.
- Integracion en pipelines de evaluacion automatizada: si el repositorio contiene pesos, podria someterse a un arnes de evaluacion estandar (perplejidad, MMLU, HumanEval) para generar la informacion que la card no proporciona; sin acceso a los ficheros, este caso queda condicionado a la descarga efectiva.
- Seguimiento de la evolucion del estate: util para monitorizar como SZLHOLDINGS actualiza sus artefactos y si futuras revisiones incorporan receipts verificables con curvas medidas.
- Referencia en inventarios de modelos open source: un equipo de plataforma puede registrar el artefacto en su catalogo interno marcandolo como "no evaluable" hasta que se publique documentacion tecnica suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y que los datos no receiptados se consideran UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma el formato de pesos ni la presencia de ficheros GGUF o safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse arquitectura, tamano, contexto ni licencia, no es posible establecer una comparacion fundamentada con alternativas de la misma categoria. Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede determinar tamano, contexto, licencia ni idiomas, lo que impide evaluar su idoneidad para cualquier uso en produccion.
- Licencia no declarada: sin licencia explicita, el uso comercial y la redistribucion quedan en un limbo legal; no debe asumirse permisividad.
- Riesgo de alucinacion: no evaluable, al no existir informacion sobre el entrenamiento ni evaluaciones publicadas.
- Sesgos conocidos: no documentados.
- Cero descargas y cero interacciones: no hay evidencia de uso real ni de validacion por parte de la comunidad.
- Model card centrada en gobernanza y no en capacidades: la mayor parte del contenido describe el estate y las herramientas de generacion de tarjetas, no el modelo en si.
- Fechas de creacion y actualizacion en 2026: conviene verificar la vigencia del repositorio antes de cualquier integracion.
- Los receipts y graficos referenciados no estan incluidos en la informacion proporcionada; sin ellos, las afirmaciones de la card no son verificables de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l128
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas `estate-cards`: https://github.com/szl-holdings/estate-cards
- Paper, blog o demo oficial: no disponible
