# sriq-ai/sriq-MiniCPM5-2B-v1.5

## Resumen

sriq-MiniCPM5-2B-v1.5 es un ajuste fino (fine-tune) publicado por el usuario sriq-ai sobre el modelo base openbmb/MiniCPM5-2B. El repositorio contiene unicamente los pesos en precision de 16 bits (FP16), con 2.516.756.480 parametros (aproximadamente 2,52 mil millones) y un tamano de repositorio de 5,0 GB. El entrenamiento se realizo con la libreria Unsloth y el stack TRL de Hugging Face, segun la propia model card, que no aporta ningun detalle adicional sobre el dataset, el numero de tokens o el metodo de alineacion empleado.

Se trata de un modelo de generacion de texto etiquetado con la arquitectura «llama» en Hugging Face y con pipeline text-generation, publicado bajo licencia Apache 2.0 y declarado exclusivamente para el idioma ingles. El repositorio no incluye informacion sobre la longitud de contexto, la composicion del corpus de ajuste ni resultados de evaluacion, y a fecha de la consulta registra 0 descargas y 0 «likes», por lo que no existe validacion comunitaria de su comportamiento real.

Su relevancia actual es limitada y acotada: es un candidato util para experimentacion en local con un presupuesto de VRAM reducido (los pesos FP16 ocupan del orden de 5 GB), pero al carecer de benchmarks publicados, de documentacion del proceso de ajuste y de formatos cuantizados (GGUF, GPTQ, AWQ), cualquier uso en produccion exigiria una evaluacion propia previa. La informacion disponible no permite confirmar mejoras sobre el modelo base openbmb/MiniCPM5-2B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer etiquetado como «llama» en Hugging Face (no se detalla en la model card) |
| Parametros totales | 2.516.756.480 (aprox. 2,52 B) |
| Parametros activos | No aplica / no disponible (no se documenta estructura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio solo contiene FP16 (16-bit). Compatible con cuantizacion posterior via Unsloth, bitsandbytes o llama.cpp (no verificada en el repositorio) |
| Idiomas soportados | Ingles (declarado en los metadatos; el modelo base puede tener capacidades multilingues no documentadas aqui) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16); libreria transformers |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamano del repositorio | 5,0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura interna mas alla de la etiqueta «llama» en los metadatos de Hugging Face y de la referencia al modelo base openbmb/MiniCPM5-2B. No se especifica el numero de capas, la dimension del modelo, el tipo de atencion (completa, lineal o hibrida), ni si emplea alguna forma de mezcla de expertos. Tampoco se indica la longitud de contexto nativa ni si se ha aplicado alguna tecnica de extension de contexto. El modelo se distribuye en FP16 junto con los ficheros de configuracion habituales de transformers.

En cuanto al entrenamiento, la model card se limita a indicar que se trata de un modelo ajustado con Unsloth y la libreria TRL de Hugging Face, con una velocidad de entrenamiento declarada como el doble de rapida respecto a un flujo estandar. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otra tecnica de alineacion, ni sobre la existencia de una fase de instruccion supervisada. Tampoco se documenta si el ajuste fue de tipo LoRA/QLoRA fusionado a FP16 o un entrenamiento completo; el tag «unsloth» y la ausencia de adaptadores en el repositorio apuntan a lo primero, pero no puede confirmarse con la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el tag «conversational» sugiere un ajuste orientado a dialogo, aunque no se documenta el formato de plantilla de chat ni las etiquetas de turno.
- Generacion de texto general y continuacion de secuencias en ingles, heredada del modelo base.
- Razonamiento, matematicas y generacion de codigo: no disponibles como capacidades verificadas; no hay evaluaciones publicadas que las respalden.
- Tool calling / function calling: no disponible. No se documenta soporte de esquemas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible. No hay documentacion de modos de pensamiento (thinking), planificacion o bucles de accion.
- Capacidades multilingues: el modelo se declara solo en ingles; no se documenta soporte de otros idiomas.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Prototipado en local con GPU de gama media: con 2,52 B de parametros y pesos FP16 de unos 5 GB, el modelo se puede cargar en una GPU con 8 GB de VRAM para pruebas de generacion de texto y validar rapidamente si el ajuste aporta alguna mejora frente al modelo base.
- Experimentacion academica con tecnicas de ajuste eficiente: al estar entrenado con Unsloth y TRL, sirve como punto de partida reproducible para comparar pipelines de fine-tuning sobre una base de 2,5 B.
- Evaluacion comparativa de fine-tunes pequenos: util como sujeto de pruebas en estudios que miden el efecto del ajuste supervisado sobre modelos compactos, siempre que se construya un conjunto de evaluacion propio al no existir benchmarks publicados.
- Generacion de texto en ingles con requisitos de baja latencia: en escenarios donde el presupuesto de VRAM o de computo es limitado (servicios de completado corto, clasificacion generativa, resumen de fragmentos breves), el tamano del modelo permite despliegues con hardware modesto.
- Base para ajuste especifico de dominio: un equipo puede partir de este checkpoint FP16 y aplicar LoRA sobre sus propios datos en ingles, aprovechando que el repositorio ya esta en formato transformers y safetensors.
- Chatbot experimental de proposito interno: el tag conversacional permite montar un prototipo de asistente en ingles para validacion interna, asumiendo que no hay garantia de calidad ni de manejo de contextos largos por falta de documentacion.
- Pruebas de cuantizacion: dado que no se publican pesos cuantizados, un caso de uso razonable es generar versiones GGUF o int8 propias y medir la degradacion frente al checkpoint FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los metadatos del repositorio tampoco aportan evaluaciones. La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 5,0 GB (2.516.756.480 parametros x 2 bytes), en linea con el tamano del repositorio.
- VRAM estimada para inferencia en FP16: del orden de 6-7 GB contando pesos, activaciones y cache KV para contextos cortos. La cache KV no puede dimensionarse con precision al desconocerse el numero de capas, la dimension de cabeza y la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3 GB; en 4 bits, en torno a 2 GB. Estas cifras son estimaciones derivadas del numero de parametros, no valores verificados en el repositorio.
- Cabe en GPU de consumo: si. Modelos como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 (12 GB), RTX 4080 (16 GB), RTX 4090 (24 GB) y GPUs integradas con 8 GB o mas son suficientes para FP16 en contextos cortos. Con 6-8 GB de VRAM conviene valorar cuantizacion.
- GPU de centro de datos: A100, H100, L40S o A10G pueden alojar el modelo sin problemas, aunque estan sobredimensionadas para 2,5 B de parametros.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag explicitamente presente) y vLLM (compatible con arquitecturas llama, no confirmado por el autor). Ollama y llama.cpp requieren una conversion previa a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| sriq-MiniCPM5-2B-v1.5 | 2,52 B | No disponible | Apache 2.0 | safetensors FP16, transformers |
| openbmb/MiniCPM5-2B (base) | 2,52 B (segun el modelo derivado) | No disponible | Verificar en el repositorio del modelo base | safetensors |
| Qwen2.5-1.5B / 3B | 1,54 B / 3,09 B | 32.768 tokens (documentacion del fabricante) | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ |
| Llama 3.2 1B / 3B | 1,24 B / 3,21 B | 128.000 tokens (documentacion del fabricante) | Licencia comunitaria Llama 3.2 | safetensors, GGUF |
| Gemma 2 2B | 2,61 B | 8.192 tokens (documentacion del fabricante) | Terminos de uso de Gemma | safetensors, GGUF |

Los datos de contexto y licencia de los modelos alternativos provienen de la documentacion publica de sus respectivos fabricantes y conviene verificarlos antes de tomar decisiones. La comparacion de rendimiento no es posible: no existen benchmarks publicados de sriq-MiniCPM5-2B-v1.5 ni del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks ni metricas, no hay evidencia de que el ajuste mejore al modelo base openbmb/MiniCPM5-2B; podria degradarlo. Cualquier uso requiere evaluacion propia.
- Trazabilidad del entrenamiento incompleta: no se documentan dataset, numero de tokens, hiperparametros, ni si hubo alineacion (RLHF, DPO) o aprendizaje supervisado. Esto impide auditar sesgos o reproduccir el resultado.
- Riesgo de alucinacion: es un modelo pequeno (2,52 B), categoria en la que la tasa de afirmaciones factualmente incorrectas es estructuralmente alta, especialmente sin datos de evaluacion que la acoten.
- Sesgos: no disponibles. Al desconocerse la composicion del corpus de ajuste, no se puede caracterizar el sesgo de genero, etnia, ideologia o dominio.
- Limitacion idiomatica: declarado solo para ingles. El uso en castellano u otros idiomas no esta soportado ni evaluado; la degradacion de calidad es esperable.
- Limite de contexto desconocido: no se publica la longitud de contexto. Disenar aplicaciones con conversaciones largas o documentos extensos es arriesgado sin medir previamente el comportamiento en truncamiento.
- Sin cuantizaciones oficiales: no hay GGUF, GPTQ ni AWQ publicados, lo que complica el despliegue en llama.cpp, Ollama o LM Studio sin trabajo adicional de conversion y validacion.
- Validacion comunitaria nula: 0 descargas y 0 «likes» en el momento de la consulta. No hay informes de terceros sobre calidad, estabilidad o casos de fallo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar por separado la licencia del modelo base openbmb/MiniCPM5-2B, ya que las condiciones del modelo derivado no anulan las del original.
- Formato de prompt no documentado: al no especificarse la plantilla de chat ni los tokens de turno, existe riesgo de obtener salidas degradadas si se aplica una plantilla incorrecta.
- Metadatos potencialmente incompletos: el tag «llama» junto a un modelo base de la familia MiniCPM puede indicar una configuracion derivada o simplemente una etiqueta heredada; no se puede confirmar la correspondencia real sin inspeccionar config.json.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sriq-ai/sriq-MiniCPM5-2B-v1.5
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Unsloth (libreria de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria citada): https://github.com/huggingface/trl
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo en las fuentes consultadas.
