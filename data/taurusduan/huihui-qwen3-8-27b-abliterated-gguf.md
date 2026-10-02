# taurusduan/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

Este repositorio contiene una version "abliterated" (es decir, con los mecanismos de rechazo eliminados mediante edicion de pesos) del modelo Qwen/Qwen3.8-27B, publicada en formato GGUF por el usuario taurusduan y atribuida en la model card al espacio huihui-ai. El resultado es un modelo de aproximadamente 27.320 millones de parametros, con licencia Apache 2.0, orientado a generacion de texto conversacional y a tareas de imagen-a-texto segun la etiqueta de pipeline declarada. La ablacion se ha aplicado de forma selectiva sobre una parte de las capas (en las ultimas variantes, de la 22 a la 52 con indexacion desde cero; en variantes anteriores, de la 15 a la 52), dejando el resto intacto para conservar al maximo el rendimiento del modelo original.

El modelo de base pertenece a la familia Qwen3.8 y, a juzgar por las etiquetas y por los nombres de tensores citados en la model card (ssm_out, attn_output, ffn_down, MTP), combina atencion hibrida con componentes de espacio de estados (SSM) y prediccion multi-token (MTP), ademas de un modulo visual. El repositorio es inusualmente grande (783,6 GB) porque agrupa multiples ramas de cuantizacion y varios derivados: las series UD y UD-DW partiendo de unsloth/Qwen3.8-27B-GGUF, las series GSQ-RCO y Swift, y las series Ternary derivadas de prism-ml/Ternary-Bonsai-2-27B-gguf, que emplean pesos ternarios de 2 bits.

Su relevancia practica es doble. Por un lado, permite ejecutar localmente un modelo de 27B sin filtros de seguridad, en formatos que van de Q2_K a Q8_0, con soporte de llama.cpp y Ollama. Por otro, documenta una tecnica de cuantizacion no estandar (los sufijos _L) que promociona a Q8_0 o BF16 las tensores afectados por la ablacion, precisamente para reducir el dano colateral de la eliminacion de rechazos sobre la calidad de respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida y componentes SSM (segun etiquetas hybrid-attention y nombres de tensores ssm_out); incluye MTP y modulo visual. Detalle completo no disponible |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no aplica / no confirmado como MoE; no disponible |
| Longitud de contexto | el ejemplo de la model card ejecuta llama.cpp con -c 262144 (262.144 tokens); contexto maximo garantizado no disponible |
| Tipos de cuantizacion | bf16, Q8_0_L, Q6_K_L, Q5_K, Q4_K, Q3_K, Q2_K_L, ademas de variantes ternarias de 2 bits (series Ternary) |
| Idiomas soportados | no disponible (la model card no los especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo marcado tambien como transformers); el modelo base original usa safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Modalidad declarada | image-text-to-text (texto e imagen como entrada) |
| Tamano del repositorio | 783,6 GB |
| Tipo de ajuste | abliteration selectiva de capas (sin RLHF/DPO adicional documentado) |
| Autor del repositorio | taurusduan (la model card se atribuye a huihui-ai) |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

La informacion disponible describe un proceso de posprocesado, no un entrenamiento desde cero. El punto de partida es Qwen/Qwen3.8-27B, un modelo de 27,32 B de parametros cuya arquitectura, segun las etiquetas del repositorio y los tensores mencionados en la model card, es hibrida: combina mecanismos de atencion con capas de espacio de estados (SSM), incorpora prediccion multi-token (MTP) y mantiene un modulo visual para entrada de imagenes. La model card indica explicitamente que ni el MTP ni el modulo visual fueron modificados por la ablacion, y que el tensor ssm_out si forma parte del conjunto de pesos intervenidos.

La tecnica aplicada es abliteration, descrita por el autor como una implementacion "cruda y de prueba de concepto" para eliminar rechazos sin usar TransformerLens, siguiendo el enfoque del repositorio remove-refusals-with-transformers. Las primeras versiones retenian las 15 primeras capas sin ablacionar; las revisiones posteriores ablacionan unicamente las capas 22 a 52 (indexacion desde cero), con el objetivo declarado de preservar mejor el rendimiento original. El repositorio agrupa derivados construidos sobre tres bases distintas: unsloth/Qwen3.8-27B-GGUF (series UD y UD-DW), ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF y ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF, y prism-ml/Ternary-Bonsai-2-27B-gguf (series Ternary).

Hay dos innovaciones tecnicas que conviene destacar. La primera es la cuantizacion selectiva con sufijo _L: los tensores afectados por la ablacion (token_embd, output, ffn_down, ssm_out, attn_output) se promocionan a Q8_0 en las versiones por debajo de Q8_0, y a BF16 en la version Q8_0_L, de modo que la ablacion no degrade tanto la coherencia. Esto implica que los tamanos de archivo no siguen el orden habitual (un Q2_K_L puede pesar mas que un Q3_K). La segunda es la existencia de kernels ternarios de atencion hibrida que solo funcionan en el fork PrismML-Eng/llama.cpp; llama.cpp estandar no puede ejecutar esos ficheros.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta conversational en el repositorio.
- Procesamiento de imagenes junto a texto (pipeline image-text-to-text), con el modulo visual intacto tras la ablacion.
- Razonamiento en contexto largo: el ejemplo oficial de llama.cpp arranca con 262.144 tokens de ventana.
- Prediccion multi-token (MTP) conservada del modelo base, lo que en teoria permite decodificacion especulativa o generacion acelerada.
- Ejecucion local en CPU/GPU mediante llama.cpp y Ollama, incluidos equipos de consumo en cuantizaciones bajas.
- Soporte de tool calling / function calling: no documentado de forma explicita en la informacion disponible, aunque el modelo base Qwen3.8 podria heredarlo; no confirmado.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Capacidades multilingues: no disponibles (sin listado de idiomas en la model card).
- Comportamiento sin rechazos: la ablacion suprime las respuestas de negativa del modelo base, lo que constituye una capacidad funcional diferencial respecto al original.
- Modo thinking explicito: no documentado en la informacion disponible.

## Casos de uso

- Investigacion sobre seguridad y alineacion: este repositorio es un caso de estudio util para medir cuanto afecta la ablacion selectiva de capas a la calidad del modelo, ya que publica variantes con distintos rangos ablacionados (15-52 frente a 22-52) que permiten comparar.
- Red teaming y evaluacion de robustez: al carecer de filtros de rechazo, sirve para generar respuestas que un modelo alineado bloquearia, lo que ayuda a construir conjuntos de prueba adversarios y a calibrar clasificadores de contenido.
- Despliegue local en estaciones de trabajo con GPU unica: las cuantizaciones Q3_K y Q2_K_L permiten cargar un modelo de 27B en GPUs de 16-24 GB, algo inviable en bf16, y usar llama.cpp con contexto amplio recortando la ventana segun la VRAM disponible.
- Analisis de documentos largos y transcripciones: con una ventana de hasta 262.144 tokens en el ejemplo oficial, el modelo puede procesar libros tecnicos, expedientes o logs extensos sin troceado agresivo, siempre que el hardware soporte la cache resultante.
- Tareas que combinan imagen y texto: al mantener el modulo visual, puede emplearse para descripcion de capturas, extraccion de datos de diagramas o asistencia sobre interfaces graficas.
- Prototipado rapido con Ollama: el autor publica la etiqueta huihui_ai/Qwen3.8-abliterated para su ejecucion directa con ollama run, lo que facilita pruebas internas sin montar infraestructura propia.
- Generacion de codigo en entornos controlados: no hay benchmarks publicados de HumanEval ni similares en la informacion disponible, por lo que cualquier uso en produccion de codigo deberia validarse antes con una bateria propia.
- Experimentacion con cuantizacion no estandar: la tecnica _L (promocion de tensores ablacionados a Q8_0/BF16) es reutilizable por otros equipos que quieran aplicar abliteration sin degradar en exceso la perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de perplejidad, ni comparaciones cuantitativas entre las variantes ablacionadas y el modelo base.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | no disponible | no reportado por el autor |
| HumanEval | no disponible | no reportado por el autor |
| GSM8K | no disponible | no reportado por el autor |
| Perplejidad | no disponible | no reportada, pese a ser la metrica mas relevante para medir el dano de la ablacion |
| Evaluaciones de rechazo | no disponible | el autor no publica tasas de refusal antes/despues |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del numero de parametros (27,32 B) y del numero de bits por peso; no proceden de mediciones publicadas por el autor. Hay que anadir a cada cifra la cache KV, que con 262.144 tokens de contexto es muy elevada, y el coste del modulo visual si se usa entrada de imagen.

- bf16 (54,6 GB solo de pesos): requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o varias GPU con tensor parallelism. No cabe en GPU de consumo.
- Q8_0_L (en torno a 29 GB de pesos, con algunos tensores en BF16): viable en A100 40 GB, L40S 48 GB o H100. Ajustado en RTX 4090 24 GB mediante offload parcial a RAM.
- Q6_K_L (aproximadamente 23 GB): cabe en RTX 3090/4090 de 24 GB con contexto moderado; con ventanas muy largas conviene repartir capas entre GPU y CPU.
- Q5_K (aproximadamente 19 GB) y Q4_K (aproximadamente 16-17 GB): opciones razonables para RTX 4090, RTX 4080, RTX 3090 y similares, con contexto recortado.
- Q3_K (aproximadamente 13 GB): cabe en GPUs de 16 GB, como RTX 4060 Ti 16 GB o A4000.
- Q2_K_L (en torno a 10-11 GB, aunque puede pesar mas que un Q3_K por la promocion de tensores): permite ejecucion en GPUs de 12 GB o incluso en CPU con RAM abundante.
- Series Ternary (2 bits): requieren el fork PrismML-Eng/llama.cpp; llama.cpp estandar no las ejecuta. La VRAM es la mas baja del repositorio, pero el soporte de herramientas es limitado.
- Opciones de despliegue: llama.cpp y Ollama estan documentados por el autor. vLLM, TGI y otros servidores de inferencia no aparecen mencionados en la informacion disponible, y su compatibilidad con pesos ablacionados en GGUF no esta confirmada. La etiqueta endpoints_compatible sugiere algun tipo de compatibilidad con endpoints, sin detalle.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La informacion disponible no incluye modelos de terceros directamente comparables (mismo tamano, misma tarea de abliteration). La comparacion mas util que puede hacerse con los datos aportados es entre las variantes del propio repositorio y su modelo origen.

| Modelo / variante | Parametros | Base de partida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated (UD / UD-DW) | 27,32 B | unsloth/Qwen3.8-27B-GGUF | 262.144 tokens en el ejemplo de llama.cpp | apache-2.0 | GGUF en este repositorio |
| Huihui-Qwen3.8-27B-abliterated (GSQ-RCO / Swift) | 27,32 B | ISTA-DASLab y ukisai, series GSQ-RCO | no disponible | apache-2.0 | GGUF en este repositorio |
| Huihui-Qwen3.8-27B-abliterated-Ternary | 27,32 B | prism-ml/Ternary-Bonsai-2-27B-gguf | no disponible | apache-2.0 | GGUF; requiere fork PrismML-Eng/llama.cpp |
| Qwen/Qwen3.8-27B (original) | 27,32 B | no aplica | no disponible | apache-2.0 | safetensors en el repositorio del autor original |

Comparativas con alternativas externas de la misma categoria (otros modelos abliterados de ~27B o de la misma familia Qwen): no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La propia model card advierte de un riesgo elevado de generar contenido sensible, controvertido o inapropiado, al haberse reducido drasticamente el filtrado de seguridad. El autor recomienda revisar rigurosamente las salidas.
- El modelo no es apto para todas las audiencias: la model card lo desaconseja explicitamente para entornos publicos, usuarios menores de edad o aplicaciones que exijan alta seguridad.
- La ablacion selectiva implica que el comportamiento del modelo puede ser inconsistente: las capas no ablacionadas conservan su comportamiento original, lo que puede producir respuestas contradictorias o cambios bruscos de tono segun el contexto.
- La abliteration degrada calidad de forma no medida: no hay datos de perplejidad, benchmarks ni tasas de rechazo que cuantifiquen el dano respecto al modelo base.
- La atribucion del repositorio es confusa: el ID de HuggingFace corresponde a taurusduan, mientras que la model card y las rutas internas apuntan a huihui-ai. Conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Riesgo de alucinacion: elevado en tareas de conocimiento factual y no cuantificado en la informacion disponible. Como en cualquier modelo de este tamano, no debe usarse como fuente unica de verdad.
- Limitaciones de idioma: la model card no declara idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- Limitaciones de contexto: aunque el ejemplo de llama.cpp usa 262.144 tokens, no hay confirmacion de que el modelo mantenga calidad uniforme en todo ese rango, y la cache KV necesaria hace impractical esa ventana en hardware de consumo.
- Restricciones de licencia: la licencia declarada es apache-2.0, permisiva para uso comercial, pero se aplica al artefacto publicado; el contenido generado sigue siendo responsabilidad legal y etica del usuario segun la model card.
- La cuantizacion no estandar _L rompe las expectativas de tamano y puede complicar la seleccion automatica de ficheros en herramientas que asuman el orden habitual de pesos por nivel de cuantizacion.
- Las variantes Ternary no funcionan con llama.cpp estandar y dependen de un fork de terceros, con el mantenimiento y la seguridad que ello implica.
- El repositorio ocupa 783,6 GB, lo que dificulta su descarga completa y favorece errores al elegir el fichero correcto entre tantas series.
- Uso previsto: la model card lo orienta a investigacion, pruebas y entornos controlados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/taurusduan/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia sobre abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Fork con kernels ternarios de atencion hibrida: https://github.com/PrismML-Eng/llama.cpp
- llama.cpp oficial: https://github.com/ggml-org/llama.cpp
- Ollama: https://github.com/ollama/ollama/releases
- Modelo en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Base de la serie UD: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Base de la serie GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Base de la serie Swift: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Base de la serie Ternary: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
