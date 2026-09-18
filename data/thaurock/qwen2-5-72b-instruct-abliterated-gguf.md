# Thaurock/Qwen2.5-72B-Instruct-abliterated-GGUF

## Resumen

Thaurock/Qwen2.5-72B-Instruct-abliterated-GGUF es una coleccion completa de cuantizaciones en formato GGUF del modelo huihui-ai/Qwen2.5-72B-Instruct-abliterated, que a su vez deriva de Qwen/Qwen2.5-72B-Instruct. El modelo original es un transformer decoder-only denso de 72.706.203.648 parametros (72,7 B) desarrollado por el equipo Qwen, y la variante abliterated ha sido procesada para eliminar las direcciones de activacion asociadas al rechazo y a la censura, de modo que responde sin las negativas tipicas de un modelo alineado.

El repositorio que nos ocupa no entrena ni modifica el modelo: solo lo recuantiza a GGUF (F16 hasta Q2_K) para que pueda ejecutarse en hardware local con llama.cpp, Ollama, LM Studio o text-generation-webui. La licencia declarada es Apache 2.0, el repositorio ocupa 77,3 GB y no registra descargas ni likes en el momento de redactar esta ficha, por lo que carece de validacion comunitaria.

Su relevancia es doble: por un lado, permite ejecutar un modelo de 72 B en configuraciones de 2 a 4 GPU de consumo con cuantizaciones de 4 y 5 bits; por otro, ofrece una variante sin filtros de rechazo util para investigacion en seguridad, red teaming y generacion de contenido en dominios donde el modelo alineado se bloquea. Como contrapartida, la abliteration degrada la alineacion de seguridad y no existe ninguna evaluacion publicada de esta conversion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5): atencion con GQA, RoPE, SwiGLU y RMSNorm |
| Parametros totales | 72.706.203.648 (72,7 B), dato real de los safetensors del modelo base |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 131.072 tokens (128K) en el modelo base Qwen2.5-72B-Instruct; no se especifica en la model card de esta conversion |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S y Q2_K |
| Idiomas soportados | No disponible en la informacion proporcionada; el modelo base declara soporte de mas de 29 idiomas |
| Licencia | Apache 2.0 (segun el repositorio; ver advertencias sobre la licencia del modelo base) |
| Formato de pesos | GGUF (llama.cpp); el modelo base esta en safetensors |
| Modelo base | huihui-ai/Qwen2.5-72B-Instruct-abliterated (a su vez derivado de Qwen/Qwen2.5-72B-Instruct) |
| Tamano del repositorio | 77,3 GB |
| Ficheros publicados | 11 cuantizaciones, desde ~29,8 GB (Q2_K) hasta ~145,4 GB (F16) |
| Plantilla de chat | ChatML de Qwen (`<|im_start|>` / `<|im_end|>`), heredada del modelo base |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-72B-Instruct original: un transformer decoder-only denso con atencion de consultas agrupadas (GQA), embeddings rotatorios (RoPE), activacion SwiGLU y normalizacion RMSNorm. El dato de parametros (72,7 B) procede de los safetensors del modelo base, y la ventana de contexto declarada por Qwen para este tamano es de 131.072 tokens. No se dispone en la informacion proporcionada del numero de capas, dimension oculta, numero de cabezas ni configuracion exacta de la atencion de esta conversion, aunque el repositorio no altera la arquitectura: solo serializa los mismos pesos en otro formato.

El entrenamiento relevante lo realizo el equipo Qwen (pretraining sobre un corpus multilingue de gran escala, seguido de ajuste supervisado y optimizacion por preferencias humanas). Sobre ese modelo, el autor de la variante abliterated aplico tecnicas de *abliteration*, consistentes en calcular la direccion de activacion asociada al rechazo por capa y ortogonalizar o restar esa direccion de los pesos, de forma que el modelo pierde la tendencia a negarse a responder. Thaurock se limita a recuantizar ese resultado a GGUF con la herramienta de llama.cpp, sin entrenamiento adicional ni fine-tuning. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los metodos de alineacion empleados en la variante abliterated.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato instruct, con plantilla ChatML de Qwen.
- Razonamiento y conocimiento general propios de un modelo denso de 72 B de la familia Qwen2.5.
- Generacion de codigo y tareas de programacion (el autor afirma que la abliteration mantiene intactas las capacidades logicas y de codificacion).
- Matematicas y resolucion de problemas con pasos intermedios, heredadas del modelo base.
- Respuesta sin rechazos: al haberse eliminado las direcciones de rechazo, el modelo no aplica las negativas tipicas de un modelo alineado ante peticiones sensibles.
- Soporte de contexto largo (hasta 131.072 tokens en el modelo base), condicionado a la memoria disponible para la cache KV.
- Generacion de salida estructurada (JSON) y seguimiento de instrucciones, habitual en la familia Qwen2.5.
- Tool calling y function calling: el modelo base Qwen2.5-72B-Instruct soporta llamadas a herramientas; en GGUF depende de que la plantilla y el runtime (llama.cpp, Ollama, LM Studio) las implementen correctamente.
- Uso en flujos de agente y razonamiento multi-paso, siempre que la aplicacion gestione el bucle de llamadas.
- Sin capacidades multimodales: es un modelo exclusivamente de texto (Qwen2.5-VL es una linea aparte).
- Sin modo de razonamiento explicito ("thinking"): no es un modelo tipo QwQ ni Qwen3.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo sirve para generar intentos de jailbreak, prompts adversarios y contenido que un modelo alineado rechazaria, de modo que un equipo de seguridad pueda medir la robustez de sus propios filtros de moderacion.
- Investigacion sobre alineacion y abliteration: comparar las respuestas del modelo abliterated con las del Qwen2.5-72B-Instruct original permite cuantificar que comportamientos se pierden y cuales se conservan tras eliminar la direccion de rechazo.
- Analisis de documentos sensibles en entornos controlados: literatura, expedientes judiciales o historias clinicas anonimizadas que suelen provocar rechazos por contenido explicito pueden procesarse sin bloqueos, con la ventana de contexto larga para documentos extensos.
- Escritura creativa y narrativa sin restricciones: novela, guion o ficcion con violencia, contenido adulto o temas controvertidos, donde el modelo no interrumpe la generacion con negativas.
- Asistente de programacion en local: con la cuantizacion Q5_K_M o Q4_K_M se obtiene un modelo de codigo ejecutable en 2 GPU de 24 GB, integrable en editores mediante llama.cpp o LM Studio sin enviar codigo a servicios externos.
- Traduccion y procesamiento multilingue: al heredar el soporte multilingue del modelo base, puede emplearse en pipelines de traduccion y resumen sobre documentos largos, siempre que se valide el par de idiomas concreto.
- Procesamiento por lotes de bajo coste: con Q4_K_M (~47,4 GB) es viable montar un unico nodo de 2 GPU para tareas offline (clasificacion, extraccion de datos, resumen) en lugar de pagar inferencia por API.
- Despliegue en entornos aislados o air-gapped: al ser GGUF y ejecutarse con llama.cpp, funciona sin conexion y sin dependencias de proveedores externos, requisito habitual en administracion publica y defensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio unicamente incluye una tabla de ficheros con tamanos y bits por peso, sin metricas de calidad. El modelo base (Qwen2.5-72B-Instruct) tiene cifras publicadas por el equipo Qwen en su blog y en su model card oficial, pero no son extrapolables a esta variante abliterated ni a sus cuantizaciones, y ninguna de ellas se ha verificado en la informacion proporcionada.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| MMLU-Pro | No disponible |
| GSM8K | No disponible |
| MATH | No disponible |
| HumanEval | No disponible |
| MBPP | No disponible |
| Arena-Hard | No disponible |
| IFEval | No disponible |

## Requisitos de hardware

Las cifras de VRAM son estimaciones de peso del modelo mas overhead de contexto y runtime (cache KV en fp16 salvo que se aplique cuantizacion de KV).

- Q2_K (~29,8 GB): cabe en 1 GPU de 32 GB (RTX 5090) o en 2 GPU de 24 GB; calidad muy degradada, solo para experimentacion.
- Q3_K_S (~34,5 GB) y Q3_K_M (~37,7 GB): 2 GPU de 24 GB (RTX 3090/4090) o 1 GPU profesional de 40-48 GB; contexto util limitado.
- Q3_K_L (~39,5 GB) y Q4_K_S (~43,9 GB): 2 GPU de 24 GB con margen ajustado; 1 A6000 (48 GB) para Q4_K_S.
- Q4_K_M (~47,4 GB): el punto mas habitual; 2x RTX 3090/4090 (48 GB) con contexto moderado, o 1xA6000/L40S de 48 GB. Necesita en la practica entre 52 y 56 GB de VRAM si se quiere una ventana de contexto razonable.
- Q5_K_S (~51,4 GB) y Q5_K_M (~54,4 GB): 2x A6000, 2x L40S o 1x H100/A100 de 80 GB.
- Q6_K (~64,3 GB) y Q8_0 (~77,3 GB): 1x H100 80 GB (Q8_0 muy justo, con contexto corto) o 2x A100/H100 de 80 GB.
- F16 (~145,4 GB): 2x H100 80 GB o 4x A100 80 GB; en la practica solo tiene sentido en servidores.
- Cache KV: con la configuracion publica del modelo base (aproximadamente 80 capas con GQA de 8 cabezas KV y dimension de cabeza 128) la cache en fp16 ronda los 256 KB por token, es decir unos 8 GB para 32K tokens y unos 32 GB para 128K. Cuantizar la cache KV (Q8_0/Q4_0) reduce estas cifras aproximadamente a la mitad o a un cuarto.
- No cabe en una GPU de consumo de 24 GB ni en configuraciones de 16 GB; el minimo realista es 2 GPU de 24 GB con cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF con un Modelfile), LM Studio, text-generation-webui, koboldcpp y llama-cpp-python. vLLM y TGI no estan pensados para GGUF en produccion: para esos runtimes conviene partir de los safetensors del modelo base.
- Latencia y throughput: no disponible. Dependen del numero de GPU, del ancho de banda de memoria y del grado de offload a CPU/RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad y notas |
|---|---|---|---|---|---|
| Thaurock/Qwen2.5-72B-Instruct-abliterated-GGUF | 72,7 B | 128K (heredado) | Apache 2.0 declarada | GGUF | 0 descargas, 0 likes; 11 cuantizaciones; sin benchmarks |
| huihui-ai/Qwen2.5-72B-Instruct-abliterated | 72,7 B | 128K (heredado) | Apache 2.0 declarada | safetensors | Origen de esta conversion; requiere cuantizar o servir en fp16/8 bits |
| Qwen/Qwen2.5-72B-Instruct | 72,7 B | 128K | Qwen License (verificar) | safetensors | Modelo alineado de referencia; dispone de cifras de benchmark publicadas por Qwen |
| bartowski/Qwen2.5-72B-Instruct-GGUF | 72,7 B | 128K | Qwen License (verificar) | GGUF | Misma receta de cuantizacion sobre el modelo alineado; alternativa si no se necesita la abliteration |
| huihui-ai/Llama-3.1-70B-Instruct-abliterated | 70,6 B | 128K | Llama 3.1 Community License | safetensors y GGUF | Alternativa abliterated de tamano similar, con licencia mas restrictiva que Apache 2.0 |

## Limitaciones y advertencias

- La abliteration elimina deliberadamente el comportamiento de rechazo: el modelo puede producir contenido danino, ilegal, difamatorio o desinformador. No es apto para aplicaciones orientadas al publico sin una capa de moderacion propia.
- La eliminacion de la direccion de rechazo suele degradar tareas que dependen del juicio de seguridad, como moderacion de contenido, asesoramiento legal o sanitario responsable y clasificacion de riesgo.
- Riesgo de alucinacion inherente a los modelos de 72 B, agravado en las cuantizaciones mas agresivas. La propia model card advierte que Q2_K es "muy propenso a errores logicos, bucles de texto o respuestas incoherentes", y que desde Q3_K_M "se empieza a notar perdida de coherencia en tareas logicas complejas".
- Ausencia total de evaluacion: no hay benchmarks propios, ni validacion de terceros, ni descargas ni likes en el momento de redactar la ficha. Cualquier uso en produccion exige evaluacion propia.
- Discrepancia de licencia: el repositorio declara Apache 2.0, pero el modelo base Qwen2.5-72B-Instruct se distribuye bajo la Qwen License segun la documentacion publica de Qwen, que no es Apache 2.0. Conviene verificar los terminos aplicables antes de un uso comercial o de redistribuir los pesos.
- La ventana de 128K es teorica en GGUF: mantener ese contexto exige decenas de GB adicionales de cache KV. En configuraciones de 2 GPU de 24 GB la ventana practica queda muy por debajo.
- Idiomas no declarados en la ficha del repositorio. Aunque el modelo base cubre mas de 29 idiomas, el rendimiento fuera de ingles y chino suele ser desigual y debe validarse por caso de uso.
- Requiere usar la plantilla ChatML de Qwen (`<|im_start|>` / `<|im_end|>`); una plantilla incorrecta degrada notablemente la calidad de las respuestas y puede romper el tool calling.
- El soporte de function calling depende del runtime: llama.cpp, Ollama y LM Studio implementan las llamadas a herramientas de forma parcial y con diferencias, por lo que no se debe asumir paridad con el modelo en safetensors servido con vLLM.
- La model card esta redactada en espanol rioplatense y contiene una seccion de creditos sin completar ("menciona al autor original del abliterated si aplica"), lo que indica un nivel de mantenimiento bajo del repositorio.
- Los ficheros GGUF no son adecuados para fine-tuning directo; para reentrenar hay que partir de los safetensors del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Thaurock/Qwen2.5-72B-Instruct-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Qwen2.5-72B-Instruct-abliterated
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Blog de Qwen2.5 (especificaciones y benchmarks del modelo base): https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen en GitHub: https://github.com/QwenLM/Qwen2.5
- Herramienta de cuantizacion e inferencia llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentacion de cuantizaciones GGUF en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md
- Perfil del autor de la conversion: https://huggingface.co/Thaurock

Nota sobre la busqueda web: los resultados devueltos corresponden integramente al portal de reservas HolidayCheck (holidaycheck.de) y no guardan ninguna relacion con el modelo, su autoria ni sus benchmarks. Por tanto, no se ha incorporado ninguna fuente adicional procedente de esa busqueda.
