# xCloudinfo/Qwen3.5-9B-Uncensored-GGUF

## Resumen

Qwen3.5-9B-Uncensored-GGUF es una version "abliterated" (con rechazo reducido) del modelo base Qwen/Qwen3.5-9B, publicada por el usuario xCloudinfo (云碩). El objetivo declarado es eliminar las respuestas de rechazo reflejo ante peticiones de caracter limite pero legal, sin degradar la coherencia del modelo original; el autor la presenta como la alternativa de tamano pequeno de su gama, pensada para equipos con poca VRAM (tarjetas unicas de 8-12 GB y maquinas de borde).

El modelo conserva la arquitectura del base: 8.953.803.264 parametros (unos 8,95 mil millones), formato GGUF listo para llama.cpp y derivados, y una torre de vision opcional (archivo `mmproj`) que habilita entrada multimodal. El autor documenta tambien soporte de modo "thinking", que se puede desactivar en el arranque del servidor.

Su relevancia actual es doble: por un lado ofrece una variante sin censura de una familia reciente (Qwen3.5) en un tamano que cabe en GPU de consumo; por otro, la model card detalla una correccion tecnica de metadatos ("ghost MTP") que afecta a toda la serie Qwen3.5 y que puede provocar errores de carga si no se aplica antes de cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5-9B; incluye torre de vision (mmproj) y soporte de MTP (multi-token prediction) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (GGUF); mmproj en f16 |
| Idiomas soportados | no disponible (la model card menciona fluidez en chino tradicional en la evaluacion de coherencia) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (se menciona tambien un modelo fusionado en safetensors usado para la evaluacion) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una modificacion de pesos (abliteration) sobre Qwen/Qwen3.5-9B. La tecnica empleada es Heretic, una herramienta de busqueda automatica de hiperparametros que optimiza simultaneamente dos objetivos: minimizar la tasa de rechazo y mantener baja la divergencia KL respecto al modelo original para preservar sus capacidades. El autor ejecuto 200 pruebas por iteracion y aplico dos iteraciones: tras converger la primera, volvio a correr el proceso sobre el resultado para reducir aun mas el rechazo.

El base Qwen3.5-9B es un transformer con soporte de MTP (multi-token prediction) y capacidad multimodal mediante una torre de vision separada. Durante el proceso de conversion a GGUF, el autor detecto y corrigio un problema de metadatos comun a la serie Qwen3.5: el campo `qwen35.block_count` contaba una capa de mas (33 frente a las 32 reales) y `nextn_predict_layers` estaba mal etiquetado como 1. Ambos campos se corrigieron antes de cuantizar para evitar errores de carga o comportamiento anomalo en el motor de inferencia. El repositorio no documenta el dataset de entrenamiento original ni si hubo fases de RLHF o DPO, ya que ese trabajo corresponde al modelo base de Qwen.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas en formato de chat multi-turno.
- Razonamiento con modo "thinking" activable o desactivable (en el ejemplo de uso se pasa `enable_thinking: false`).
- Entrada multimodal: la torre de vision `mmproj-Qwen3.5-9B-Uncensored-xCloud-f16.gguf` permite procesar imagenes junto al texto.
- Reduccion de rechazos en peticiones de caracter limite pero legal (abliterated/uncensored).
- Compatibilidad con plantillas de chat Jinja (`--jinja`), lo que facilita su uso con tool calling segun el formato del modelo base.
- Soporte de cuantizaciones imatrix (la etiqueta `imatrix` aparece en el repositorio).
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues: no detalladas en la informacion disponible, aunque la evaluacion de coherencia se hizo en chino tradicional.

## Casos de uso

- Inferencia local en equipos con GPU modesta: al estar disponible en Q4_K_M, IQ4_XS e IQ2_M, el modelo puede ejecutarse en tarjetas de 8-12 GB y en maquinas de borde, tal como indica el autor en la model card.
- Asistente conversacional sin filtros reflexivos: util para equipos que necesitan respuestas directas ante preguntas de seguridad, ficcion o temas sensibles que un modelo alineado rechazaria por defecto.
- Procesamiento de documentos con imagenes: gracias a la torre de vision, se puede usar para extraer o describir informacion de capturas, diagramas o fotos combinadas con texto.
- Prototipado rapido con llama-server: el ejemplo oficial arranca el servidor con plantilla Jinja y modo thinking desactivado, adecuado para desplegar un endpoint de chat en minutos.
- Evaluacion de tecnicas de abliteration: sirve como referencia reproducible para investigadores que comparan Heretic frente a otros metodos de reduccion de rechazo, dado que el autor publica cifras separadas para safetensors y GGUF.
- Generacion de texto en entornos sin conectividad: al ser GGUF y funcionar offline en llama.cpp, encaja en escenarios de privacidad donde no se pueden enviar datos a APIs externas.
- Tareas de generacion creativa y brainstorming: la menor tasa de rechazo amplia el rango de temas que el modelo esta dispuesto a abordar en escritura y guiones.

## Benchmarks y rendimiento

La model card no publica benchmarks academicos (MMLU, HumanEval, GSM8K, etc.). El unico dato de evaluacion es la tasa de rechazo sobre un conjunto propio de 10 preguntas consideradas gravemente nocivas ("held-out"), mas una comprobacion cualitativa de coherencia en respuestas inofensivas.

| Configuracion | Metodo de decodificacion | Tasa de rechazo |
|---|---|---|
| safetensors fusionado, iteracion 1 | greedy | 3/10 |
| safetensors fusionado, iteracion 2 | greedy | 0/10 |
| GGUF Q6_K, cargado con llama-server | muestreo por defecto (no greedy) | 2/10 |
| GGUF Q4_K_M, cargado con llama-server | muestreo por defecto (no greedy) | 2/10 |

El propio autor advierte que la cuantizacion y el cambio de esquema de muestreo hacen que la tasa de rechazo repunte ligeramente respecto al modelo sin cuantizar, y publica ambos escenarios en lugar de solo el mejor resultado.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos (solo modelo de texto, sin contar KV cache ni mmproj):
  - Q8_0: ~9-10 GB.
  - Q6_K: ~7-8 GB.
  - Q5_K_M: ~6-6,5 GB.
  - Q4_K_M: ~5-5,5 GB.
  - IQ4_XS: ~4,5-5 GB.
  - IQ2_M: ~3,5-4 GB.
- La torre de vision en f16 anade VRAM adicional cuando se usa entrada multimodal; no se especifica su tamano exacto.
- El autor situa el objetivo en tarjetas unicas de 8-12 GB y maquinas de borde, por lo que Q4_K_M, IQ4_XS e IQ2_M encajan en GPU de consumo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 (12-16 GB) para las cuantizaciones medias; RTX 4090 (24 GB) o A100/H100 para las cuantizaciones altas o despliegues con mucho contexto.
- Opciones de despliegue: llama.cpp, llama-server, Ollama y cualquier motor compatible con GGUF. La model card solo confirma llama.cpp y llama-server; vLLM y TGI trabajar con safetensors y no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-GGUF (este) | ~8,95 B | no disponible | apache-2.0 | Version abliterated con Heretic; multimodal; GGUF |
| Qwen/Qwen3.5-9B (base) | ~8,95 B | no disponible | apache-2.0 | Modelo original de Qwen, con rechazo estandar; no abliterado |
| Qwen3.8-27B-Uncensored-GGUF (mismo autor) | no disponible | no disponible | no disponible | Version mayor del mismo autor y misma metodologia; requiere mas VRAM |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la tabla recoge solo tamano, licencia y enfoque.

## Limitaciones y advertencias

- La abliteration elimina rechazos reflejos; el autor aclara explicitamente que esto no implica respaldo a usos ilegales y que la responsabilidad legal de uso recae en el usuario.
- Aunque la tasa de rechazo medida baja a 0/10 en safetensors con greedy, repunta a 2/10 tras cuantizar, por lo que el comportamiento real depende del formato y del esquema de muestreo.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad; al ser un modelo de ~9 B, es esperable un comportamiento inferior al de modelos mayores en tareas de razonamiento factual.
- La evaluacion de coherencia se realizo unicamente en chino tradicional; no hay datos sobre degradacion en otros idiomas.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con documentos largos.
- Licencia apache-2.0 heredada del base, que en principio permite uso comercial, pero conviene revisar los terminos de Qwen3.5-9B, ya que este repositorio no anade condiciones propias.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la ficha, sin comunidad que lo haya validado de forma independiente.
- Los modelos "uncensored" pueden producir contenido inapropiado, ofensivo o inexacto en dominios sensibles; no se recomienda su uso en atencion al cliente o sistemas de cara al publico sin filtros adicionales.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/xCloudinfo/Qwen3.5-9B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Version mayor del mismo autor: https://huggingface.co/xCloudinfo/Qwen3.8-27B-Uncensored-GGUF
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
