# vnbot-ai/VNBot-MotaZ-27B-MLX-4bit

## Resumen

VNBot-MotaZ-27B-MLX-4bit es una cuantizacion en 4 bits en formato MLX del modelo multimodal VNBot-MotaZ-27B, desarrollado por vnbot-ai (Origo Technologies) como asistente de IA orientado a texto e imagen en vietnamita e ingles. El modelo base emplea la arquitectura qwen3_5, segun las etiquetas del repositorio, y esta disenado para tareas conversacionales con entrada image-text-to-text. Esta version concreta es una conversion a 4 bits pensada para ejecucion en hardware Apple Silicon mediante la libreria MLX, con un peso de repositorio de 10,7 GB.

La relevancia de esta publicacion radica en su ventana de contexto declarada de 262.144 tokens y en su licencia Apache-2.0, que permite uso comercial sin restricciones adicionales. Al tratarse de una cuantizacion, no introduce cambios arquitectonicos respecto al modelo base: reduce la precision de los pesos para disminuir los requisitos de memoria a costa de una posible perdida de calidad en la generacion.

El modelo no cuenta con descargas ni interacciones en el momento de la consulta, y la model card es muy escueta: se limita a describir el proposito, el formato y el comando de ejecucion, sin detallar datos de entrenamiento, benchmarks ni composicion del dataset. Toda la informacion tecnica disponible proviene de los metadatos del repositorio y de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun etiquetas del repositorio); detalles no disponibles |
| Parametros totales | 27B (inferido del nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 4 bits, repositorio de 10,7 GB |

## Arquitectura y entrenamiento

El modelo base VNBot-MotaZ-27B se etiqueta como qwen3_5, lo que sugiere una arquitectura transformer derivada de la familia Qwen 3.5, con capacidades multimodales de entrada image-text-to-text. No se dispone de informacion sobre el numero de parametros activos, la presencia de mezcla de expertos, el tipo de atencion ni otras innovaciones estructurales, ya que la model card no las documenta.

Tampoco hay datos publicados sobre el proceso de entrenamiento: no se indica el volumen de tokens, la composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica informacion cierta sobre esta variante es que se trata de una cuantizacion a 4 bits realizada con MLX, con un peso total de repositorio de 10,7 GB, lo que reduce el espacio en disco y la memoria necesaria frente a los pesos en precision completa del modelo base.

## Capacidades

- Generacion de texto conversacional en vietnamita e ingles.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text), lo que permite describir, analizar o razonar sobre contenido visual.
- Razonamiento multi-turno gracias a la ventana de contexto de 262.144 tokens.
- Ejecucion local en hardware Apple Silicon mediante MLX.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de codigo, matematicas o thinking mode: no documentadas.

## Casos de uso

- Atencion al cliente en vietnamita e ingles: el modelo puede mantener conversaciones multi-turno con historiales extensos gracias a su contexto de 262.144 tokens, adecuado para sesiones de soporte con mucho historial acumulado.
- Analisis de documentos con imagenes: al aceptar entradas image-text-to-text, puede procesar capturas, formularios escaneados o diagramas acompanados de preguntas en texto, util en digitalizacion de tramites.
- Asistencia en dispositivos Apple: la cuantizacion MLX 4-bit permite desplegar el modelo en Mac con memoria unificada, sin necesidad de GPU dedicada, para prototipos y herramientas internas.
- Traduccion y localizacion vi-en: el soporte bilingue declarado lo hace apto para tareas de traduccion asistida y generacion de contenido en ambos idiomas.
- Procesamiento de conversaciones largas: resumen y extraccion de informacion de transcripciones o hilos de correo que superan la ventana tipica de 8K-32K tokens de otros modelos.
- Desarrollo de asistentes multimodales embebidos: su licencia Apache-2.0 permite integrarlo en productos comerciales sin obligaciones de copyleft, siempre que se respeten las condiciones de la licencia.
- Evaluacion e investigacion: util para comparar el comportamiento de un modelo de 27B cuantizado a 4 bits frente a su version completa en tareas de vision y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 10,7 GB en 4 bits; la model card menciona un tamano de 16,1 GB, probablemente incluyendo overhead de ejecucion. Se recomienda al menos 16-24 GB de memoria unificada para contexto moderado.
- GPU recomendadas: al ser formato MLX, esta pensado para Apple Silicon (series M1, M2, M3 y M4 con memoria unificada suficiente). No es directamente compatible con CUDA sin conversion.
- Cabe en GPU de consumo: si, en Mac con 16 GB o mas de memoria unificada; en el contexto de 262.144 tokens el consumo crece y la propia model card aconseja reducir el contexto si falta memoria.
- Opciones de despliegue: MLX (mlx_vlm), con el comando `python -m mlx_vlm.generate --model vnbot-ai/VNBot-MotaZ-27B-MLX-4bit --prompt "Xin chào" --max-tokens 200`. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B-MLX-4bit | 27B | 262.144 | Apache-2.0 | MLX 4-bit | Hugging Face |
| VNBot-MotaZ-27B (base) | 27B | no disponible | Apache-2.0 | safetensors | Hugging Face |
| Alternativas de 27B multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria con la que contrastar rendimiento, ya que no hay benchmarks publicados para este modelo ni se han identificado alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad de las respuestas frente al modelo base en precision completa, especialmente en tareas de razonamiento complejo o generacion de codigo.
- Solo se declaran vietnamita e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad, por lo que el riesgo de alucinacion y de respuestas sesgadas no puede cuantificarse.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio por si incluyen atribuciones adicionales.
- El formato MLX limita el despliegue a entornos Apple Silicon; para produccion en servidores con GPU NVIDIA seria necesaria una conversion a otro formato.
- El contexto maximo de 262.144 tokens requiere memoria considerable; la propia model card recomienda reducirlo si hay limitaciones de memoria.
- El repositorio no tiene descargas ni validacion de la comunidad en el momento de la consulta, lo que reduce la evidencia sobre su robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-MLX-4bit
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- Libreria MLX: https://github.com/ml-explore/mlx
- Herramienta mlx_vlm: https://github.com/Blaizzy/mlx-vlm
