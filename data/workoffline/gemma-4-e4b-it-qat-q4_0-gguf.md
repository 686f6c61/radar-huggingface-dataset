# WorkOffline/gemma-4-E4B-it-qat-q4_0-GGUF

## Resumen

`WorkOffline/gemma-4-E4B-it-qat-q4_0-GGUF` es un espejo (mirror) no modificado de los ficheros GGUF cuantizados en 4 bits con QAT (Quantization-Aware Training) del modelo Gemma 4 E4B Instruct de Google DeepMind. No se trata de un modelo nuevo ni de una conversión propia: el autor, WorkOffline, replica byte a byte los ficheros publicados por Google en `google/gemma-4-E4B-it-qat-q4_0-gguf`, fijando una revisión concreta y verificando el SHA-256, para que su aplicación pueda descargarlos desde un único punto con integridad garantizada.

El modelo subyacente es un Gemma 4 con 7.463.013.674 parámetros totales según los safetensors del modelo base, empaquetado en un GGUF Q4_0 de aproximadamente 5,15 GB, acompañado de un proyector multimodal (`mmproj`) de unos 991 MB que habilita entrada de imagen. La licencia declarada es Apache 2.0.

Su relevancia es logística más que algorítmica: sirve como artefacto reproducible y verificable para despliegues offline o con requisitos de auditoría de integridad, evitando depender de la disponibilidad o de los cambios de revisión del repositorio original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 de Google DeepMind; detalles de arquitectura no incluidos en la informacion proporcionada) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT, 4 bits); se distribuye un unico fichero de pesos en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos: `gemma-4-E4B-it-qat-Q4_0.gguf`, 5.154.941.280 bytes; proyector multimodal: `mmproj-gemma-4-E4B-it-qat.gguf`, 991.552.256 bytes) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base `google/gemma-4-E4B-it` en los datos proporcionados. Lo unico verificable es que los pesos distribuidos en este repositorio son una cuantizacion Q4_0 obtenida mediante Quantization-Aware Training (QAT), es decir, el modelo fue entrenado teniendo en cuenta la cuantizacion a 4 bits para reducir la perdida de calidad respecto a una cuantizacion post-entrenamiento equivalente.

La innovacion tecnica relevante de este repositorio no esta en el modelo sino en el empaquetado: ficheros GGUF con nombre normalizado, revision upstream fijada (`4b4a2c1d584be7264f87aac328a1bc739ce81b6c`) y hash SHA-256 publicado para cada fichero, lo que permite verificar la integridad de la descarga. Se incluye ademas un fichero `mmproj` que actua como proyector para entrada multimodal en el runtime GGUF.

## Capacidades

- Generacion de texto conversacional (variante Instruct, etiqueta `conversational`).
- Entrada multimodal de imagen a traves del fichero `mmproj-gemma-4-E4B-it-qat.gguf` (la presencia del proyector implica soporte de vision en el runtime; el alcance exacto no esta detallado en la informacion disponible).
- Capacidades de razonamiento, codigo y matematicas: no disponibles de forma explicita en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue offline en aplicaciones de escritorio: el repositorio existe precisamente para que la app WorkOffline descargue los GGUF desde un unico origen con revision fijada y verificacion SHA-256, lo que encaja en entornos sin conectividad o con proxies restringidos.
- Auditoria de integridad de artefactos: equipos que necesitan demostrar que los pesos desplegados coinciden exactamente con los publicados por Google pueden comparar el SHA-256 del fichero local con el documentado en la model card.
- Inferencia local en hardware de consumo: con un GGUF Q4_0 de ~5,15 GB, el modelo cabe en GPUs con 8 GB de VRAM o en CPU con suficiente RAM, adecuado para prototipado y demos en portatiles.
- Asistente conversacional con entrada de imagen: el par de ficheros pesos + `mmproj` permite montar un chat que acepte imagenes en runtimes GGUF compatibles con proyectores multimodales.
- Pipelines de evaluacion reproducible: al estar fijada la revision upstream, sirve como artefacto estable para benchmarks internos que deban repetirse en el tiempo sin que cambie el binario.
- Base para fine-tuning o destilacion posteriores: al ser pesos cuantizados Q4_0, su uso como punto de partida para entrenamiento es limitado; es mas adecuado como referencia de comportamiento del modelo original en su version de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,2 GB solo para los pesos Q4_0; sumando el proyector multimodal (~1 GB) y el contexto/KV cache, un presupuesto realista de 7-9 GB de VRAM para uso con vision y contexto moderado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en el segmento profesional, A100 y H100 quedan sobredimensionadas para este tamano y solo se justifican por concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en configuracion solo texto; con vision se recomienda 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime que consuma GGUF y soporte ficheros `mmproj` para multimodal. vLLM y TGI no son la via natural para GGUF Q4_0 en este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WorkOffline/gemma-4-E4B-it-qat-q4_0-GGUF (este) | 7.463.013.674 | no disponible | Q4_0 QAT | Apache 2.0 | GGUF en HF, espejo verificado |
| google/gemma-4-E4B-it | 7.463.013.674 | no disponible | pesos completos (safetensors) | Apache 2.0 | HF oficial |
| google/gemma-4-E4B-it-qat-q4_0-gguf | 7.463.013.674 | no disponible | Q4_0 QAT | Apache 2.0 | HF oficial, origen de este espejo |

No se dispone de datos de rendimiento comparado con modelos de otras familias (por ejemplo, Llama o Qwen de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no aporta ninguna mejora tecnica sobre el original: es una copia byte a byte. Cualquier actualizacion, correccion o cambio de licencia en el repositorio de Google no se reflejara automaticamente aqui.
- La cuantizacion Q4_0 introduce perdida de precision respecto a los pesos completos; aunque el QAT mitiga parte del dano, no se garantiza paridad exacta con el modelo en bf16/fp16.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base Gemma 4, no descritos en esta ficha.
- Idiomas soportados no declarados en este repositorio; conviene consultar la model card oficial de Google antes de desplegar en produccion multilingue.
- La model card indica que el repositorio upstream declara Apache 2.0 pero no incluye fichero de licencia; el `LICENSE` de este espejo es el texto estandar de Apache 2.0. Verificar los terminos de uso de Gemma 4 en la documentacion oficial de Google antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre la integridad de la copia mas alla del SHA-256 publicado.
- No se especifican requisitos de contexto ni limites de tokens de salida; validar en el runtime elegido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WorkOffline/gemma-4-E4B-it-qat-q4_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- GGUF original de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
