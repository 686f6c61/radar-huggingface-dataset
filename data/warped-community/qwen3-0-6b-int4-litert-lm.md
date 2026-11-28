# warped-community/Qwen3-0.6B-int4-litert-lm

## Resumen

Qwen3-0.6B-int4-litert-lm es una réplica (mirror) del modelo Qwen3-0.6B de Alibaba Qwen, cuantizado a int4 y empaquetado en formato LiteRT-LM para su ejecución en dispositivos móviles Android. Lo mantiene la comunidad warped-community para su uso dentro de la aplicación Warped, y deriva del artefacto publicado por litert-community (fichero `qwen3_0.6b_q4_block32_ekv1280.litertlm`). No se trata de un modelo nuevo ni de un fine-tuning: es una redistribución del modelo base cuantizado.

El modelo base Qwen3-0.6B pertenece a la familia Qwen3, una serie de modelos transformer densos de Alibaba con modo de razonamiento ("thinking") conmutable. Con 0,6 mil millones de parámetros, es el miembro más pequeño de la familia y está orientado a entornos con recursos muy limitados: móviles, navegador y dispositivos de borde. Su relevancia radica en ofrecer capacidades de generación de texto y razonamiento básico en un tamaño que cabe holgadamente en memoria de un teléfono.

Esta variante concreta es relevante por su formato: LiteRT-LM (antes TFLite) permite desplegar el modelo en Android con aceleración por GPU/NPU mediante la infraestructura de Google, algo que no es posible directamente con pesos safetensors o GGUF. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el nombre del fichero sugiere una cache KV de 1280, sin confirmar) |
| Tipos de cuantizacion | int4 con bloques de 32 (`q4_block32`) |
| Idiomas soportados | no disponible (la model card no los detalla; el modelo base Qwen3 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3 de Alibaba. La model card de esta réplica no aporta detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO o innovaciones como el modo thinking). Esa información debe consultarse en la model card oficial de Qwen/Qwen3-0.6B, que no forma parte de la documentación proporcionada.

La intervención de esta réplica es exclusivamente de empaquetado: se toma el artefacto int4 de litert-community y se redistribuye en formato LiteRT-LM. La cuantización int4 con bloques de 32 reduce el peso a aproximadamente 0,7 GB de repositorio, lo que permite cargar el modelo en dispositivos Android con memoria limitada. No hay evidencia de reentrenamiento ni de modificación de los pesos más allá de la cuantización.

## Capacidades

- Generación de texto y razonamiento básico, heredados del modelo base Qwen3-0.6B.
- Modo de razonamiento ("thinking") conmutable en la familia Qwen3 (no confirmado explícitamente para este artefacto en la información disponible).
- Capacidades multilingües del modelo base (no detalladas en la model card de esta réplica).
- Ejecución en dispositivo (on-device) en Android mediante LiteRT-LM.
- Soporte de tool calling, agentes o visión: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales on-device en Android: integrado en la app Warped, el modelo permite generar respuestas sin enviar datos a la nube, con la ventaja de privacidad y latencia reducida que ofrece la inferencia local.
- Autocompletado y sugerencias de texto en aplicaciones móviles: su tamaño de 0,6B y su cuantización int4 permiten mantenerlo cargado en memoria en un teléfono de gama media.
- Clasificación y etiquetado de texto local: resúmenes cortos, extracción de entidades o categorización de mensajes dentro de una app sin conexión.
- Procesamiento de notas y correos en el dispositivo: reescritura, corrección ortográfica o generación de borradores con contexto limitado, aprovechando la ventana de contexto del modelo base.
- Prototipado de funciones de IA generativa en Android: LiteRT-LM facilita la integración con el ecosistema de Google (GPU delegate, NNAPI) para validar ideas antes de migrar a un modelo mayor en servidor.
- Filtrado y moderación de contenido en el borde: detección de texto tóxico o spam en local, reduciendo costes de backend y exposición de datos.
- Demos educativas de IA en móvil: permite mostrar generación de texto y razonamiento básico en talleres o pruebas de concepto sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0,7 GB; en inferencia int4 se espera un consumo de memoria en el rango de 1 GB o inferior, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no aplica a servidores; el formato LiteRT-LM está orientado a GPU/NPU de dispositivos Android (Adreno, Mali, delegados NNAPI).
- Cabe en GPU de consumo: no aplica directamente; está diseñado para GPU integradas de móviles, no para tarjetas de escritorio. Podría ejecutarse en CPU de escritorio mediante herramientas compatibles con LiteRT, sin datos de rendimiento.
- Opciones de despliegue: LiteRT-LM (runtime oficial de Google para Android); no es compatible directamente con vLLM, llama.cpp, Ollama o TGI, que esperan safetensors o GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-int4-litert-lm | 0,6B | no disponible | LiteRT-LM int4 | Apache 2.0 | Réplica para Android |
| Qwen/Qwen3-0.6B | 0,6B | no disponible | safetensors | Apache 2.0 | Modelo base original |
| litert-community/Qwen3-0.6B-int4 | 0,6B | no disponible | LiteRT-LM int4 | Apache 2.0 | Artefacto upstream de esta réplica |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Es una réplica de comunidad, no un modelo oficial: la responsabilidad de mantenimiento y actualizaciones recae en warped-community.
- Con 0,6B de parámetros, la calidad de razonamiento y la fidelidad factual son limitadas en comparación con modelos mayores; riesgo elevado de alucinación en tareas complejas.
- La cuantización int4 puede degradar la precisión respecto a los pesos originales en fp16/bf16.
- La model card no detalla idiomas soportados ni sesgos conocidos; deben evaluarse empíricamente antes de usarlo en producción.
- El formato LiteRT-LM limita el despliegue a entornos compatibles (principalmente Android); no es portable a stacks de servidor habituales.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-0.6B y del artefacto upstream.
- No hay información sobre el contexto efectivo tras la cuantización ni sobre el comportamiento del modo thinking en este artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/warped-community/Qwen3-0.6B-int4-litert-lm
- Artefacto upstream: https://huggingface.co/litert-community/Qwen3-0.6B-int4
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
