# ssv555/Qwen3.8-35B-A3B-V2.1

## Resumen

Qwen3.8-35B-A3B-V2.1 es una distribucion en formato GGUF de un modelo de lenguaje de tipo mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, acompanado de un proyector de vision y una cabeza MTP (multi-token prediction) separada. Lo publica el usuario ssv555 en Hugging Face y deriva de un modelo previo de IsValorum, `Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated`, cuyo origen ultimo seria un destilado de la familia Qwen3.8-35B-A3B de empero-ai.

El modelo esta empaquetado especificamente para llama.cpp, con pesos cuantizados (14,7 GB el modelo principal, 0,6 GB el proyector de vision en Q8_0 y 2,0 GB la cabeza MTP en Q8_0). Incorpora capacidades multimodales de imagen a texto (pipeline `image-text-to-text`) y, segun la nomenclatura del publicador original, habria sido sometido a "abliteration" para eliminar rechazos.

Es relevante porque combina una arquitectura MoE eficiente en computo (solo ~3B parametros activos), vision y decodificacion especulativa mediante cabeza MTP en un unico paquete GGUF listo para desplegar en llama.cpp. No obstante, la informacion publicada es muy escasa: no hay datos de licencia, idiomas, benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y proyector de vision; cabeza MTP separada |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (modelo principal); Q8_0 para proyector de vision y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); incluye `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: ~34,7B parametros totales con ~3B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. Incluye un proyector de vision para entrada de imagenes (pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction) distribuida en un fichero GGUF independiente, pensada para decodificacion especulativa en llama.cpp.

Segun la model card, el modelo base seria el destilado `Qwen3.8-35B-A3B-Distill` de empero-ai, posteriormente sometido a un proceso de cuantizacion propio del publicador ("APEX-I-MiniPlus", version V2.1) y a "abliteration" para eliminar rechazos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. El repositorio incluye la etiqueta `imatrix`, lo que sugiere el uso de matrices de importancia para la cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Razonamiento y generacion de codigo (heredado de la familia Qwen3.8, aunque sin datos verificables en la informacion disponible).
- Vision: entrada de imagenes y texto (pipeline `image-text-to-text`) mediante el proyector `mmproj`.
- Decodificacion especulativa mediante cabeza MTP separada, orientada a acelerar la generacion en llama.cpp.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues: no disponibles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Comportamiento sin rechazos por "abliteration" (segun la nomenclatura del publicador original, no confirmada).

## Casos de uso

- Asistente conversacional local: desplegado con llama.cpp u Ollama, el modelo puede mantener conversaciones multi-turno en hardware de consumo gracias a sus ~3B parametros activos y su cuantizacion GGUF de 14,7 GB.
- Analisis de imagenes con descripcion textual: el proyector de vision permite pasar capturas, diagramas o fotografias junto a una consulta para obtener descripciones o extraccion de informacion.
- Prototipado de agentes con razonamiento multi-paso: la cabeza MTP acelera la generacion de cadenas de razonamiento largas en pipelines de agentes locales.
- Generacion de codigo asistida en entornos sin conexion: al ser un GGUF ejecutable en llama.cpp, puede integrarse en editores o CLI locales sin depender de APIs externas.
- Experimentacion en investigacion sobre MoE y decodificacion especulativa: la separacion de la cabeza MTP en un fichero propio facilita comparar configuraciones con y sin decodificacion especulativa.
- Evaluacion de modelos "abliterated": util para estudiar el efecto de la eliminacion de rechazos en el comportamiento del modelo, siempre con las cautelas eticas y legales correspondientes.
- Despliegue en servidores modestos: al requerir ~15-17 GB de VRAM/RAM para el conjunto completo, cabe en GPUs de consumo de gama alta o en CPU con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~14,7 GB para el modelo principal en GGUF, mas ~0,6 GB del proyector de vision y ~2,0 GB de la cabeza MTP; en total en torno a 17,3 GB si se cargan todos los componentes.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100. Con 24 GB de VRAM cabe el conjunto completo; con 16 GB podria requerir offloading parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090/3090 y previsiblemente en GPUs de 16 GB con offloading parcial.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (previa conversion/importacion), y servidores compatibles con endpoints. No se indica soporte nativo para vLLM o TGI con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-V2.1 (este) | ~34,7B | ~3B | no disponible | Si | no disponible | GGUF |
| Qwen3-30B-A3B (referencia de familia) | ~30B | ~3B | no disponible | No (variante texto) | Apache 2.0 (segun publicacion original) | safetensors/GGUF |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32K | No | Apache 2.0 | safetensors/GGUF |
| Qwen2.5-VL-32B | ~32B | denso | no disponible | Si | Apache 2.0 (segun publicacion original) | safetensors |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de sus publicaciones originales; los de este modelo se limitan a lo indicado en la informacion disponible.

## Limitaciones y advertencias

- Informacion muy incompleta: no hay licencia declarada, idiomas soportados, contexto ni benchmarks, lo que impide garantizar su idoneidad en produccion.
- Origen derivado y no oficial: es una redistribucion de un modelo ya modificado (destilado, cuantizado y "abliterated"), sin validacion independiente.
- "Abliteration": la eliminacion de rechazos puede aumentar el riesgo de generar contenido inapropiado, danino o no alineado con politicas de uso.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks no puede cuantificarse su fiabilidad.
- Trazabilidad limitada: la model card del autor original no confirma la interpretacion de la nomenclatura, por lo que detalles como el modelo base exacto son inferidos.
- Compatibilidad restringida al ecosistema llama.cpp para este empaquetado.
- Uso comercial incierto: al no declararse licencia, no puede asumirse permiso de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/ssv555/Qwen3.8-35B-A3B-V2.1
- Repositorio de origen citado: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Modelo base citado (empero-ai): no disponible (sin URL en la informacion proporcionada)
- llama.cpp: https://github.com/ggml-org/llama.cpp
