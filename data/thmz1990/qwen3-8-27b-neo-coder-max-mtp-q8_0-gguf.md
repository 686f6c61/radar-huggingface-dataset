# ThmZ1990/Qwen3.8-27B-NEO-CODER-MAX-MTP-Q8_0-GGUF

## Resumen

Este repositorio contiene una copia sin modificar de dos archivos GGUF procedentes del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP. El autor, ThmZ1990, lo publica como repositorio independiente con el único objetivo de que el sistema de caché de modelos de Runpod serverless descargue exclusivamente estos dos archivos, evitando bajar el repositorio original completo. No se trata, por tanto, de un modelo nuevo ni de una conversión propia: es un espejo parcial de una cuantización Q8_0 ya existente.

El modelo subyacente es un derivado de la familia Qwen3, identificado en el nombre como "27B", con una orientación declarada hacia código ("NEO-CODER-MAX"), junto con marcadores de fine-tuning orientado a eliminar restricciones de contenido ("Heretic-Uncensored") y de soporte de decodificación multi-token ("MTP"). El nombre comercial incluye además etiquetas como "TURBO", "Fable" y "Cold Fusion", que corresponden a la nomenclatura interna del autor original (DavidAU) y no a arquitecturas estándar verificables.

La relevancia de esta ficha es limitada desde el punto de vista técnico: el repositorio no aporta documentación propia, no publica benchmarks ni especificaciones, y remite íntegramente al repositorio original. Los datos disponibles se reducen a los metadatos de Hugging Face y a la model card, que solo describe el contenido del repositorio. Cualquier evaluación seria del modelo debe hacerse sobre el repositorio base, no sobre esta copia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3 segun el nombre; no confirmado en la model card) |
| Parametros totales | 460.730.096 (dato de safetensors del repo; no coherente con la etiqueta "27B" del nombre, probablemente por ausencia de pesos safetensors reales) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-TurboFCFusion-735-882-Here-Uncen-NEO-CODER-MAX-MTP-Q8_0.gguf` y `mmproj-BF16.gguf`) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni fases de alineación (RLHF, DPO) en la información proporcionada. La model card de este repositorio es puramente logística: declara que se trata de una copia sin modificar de dos archivos del repositorio de DavidAU y que todo el crédito corresponde a los autores originales.

Los únicos indicios arquitectónicos provienen del nombre del modelo: la referencia a Qwen3 sugiere un transformer decoder-only de la familia Qwen, el sufijo "MTP" apunta a multi-token prediction (decodificación especulativa o predicción de varios tokens por paso), y la presencia de `mmproj-BF16.gguf` confirma que el paquete incluye un proyector multimodal para visión, compatible con llama.cpp. Ninguno de estos extremos está documentado ni verificado en este repositorio.

## Capacidades

- Generación de texto y código: el nombre del modelo indica orientación a programación ("NEO-CODER-MAX"), aunque no hay documentación que detalle tareas o lenguajes cubiertos.
- Visión: el repositorio incluye un proyector multimodal (`mmproj-BF16.gguf`), lo que permite entrada de imágenes en llama.cpp con el binario `llama-mtmd-cli` o equivalente.
- Predicción multi-token (MTP): el sufijo del nombre sugiere soporte de decodificación multi-token, sin confirmación documental.
- Tool calling y function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking" u otros modos especiales: no disponible.

## Casos de uso

- Despliegue en Runpod serverless con caché de modelos: el propósito declarado del repositorio es precisamente este. Al mantener solo los dos GGUF necesarios, se reduce el tiempo de arranque en frío de los endpoints serverless y se evita descargar el repositorio original completo.
- Inferencia local con llama.cpp sobre CPU/GPU mixtas: al ser GGUF Q8_0, puede cargarse con `llama.cpp` y `llama-server`, permitiendo servir una API compatible con OpenAI en hardware modesto.
- Asistencia a la programación en entornos offline: si el fine-tuning "CODER" cumple lo que su nombre indica, podría usarse como autocompletado o generación de código en herramientas locales; no hay evidencia publicada que lo respalde.
- Tareas con entrada de imagen: gracias al proyector `mmproj-BF16.gguf`, puede procesar capturas de pantalla, diagramas o documentación escaneada y responder en texto, siempre que el modelo base tenga capacidades de visión efectivas.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de Q8_0 frente a otras cuantizaciones del mismo modelo base en tareas de código.
- Experimentación con modelos sin censura: el marcador "Heretic-Uncensored" indica que el fine-tuning busca reducir rechazos; puede emplearse en investigación sobre comportamiento de modelos y filtrado de seguridad, con las advertencias legales correspondientes.
- Base para pipelines de generación de código en CI/CD: si se confirma el soporte de tool calling en el modelo base, podría integrarse como paso de revisión o generación de parches; sin esa confirmación, el caso queda como hipótesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 de un modelo etiquetado como 27B requeriría aproximadamente 28-30 GB en Q8_0; el tamaño del repositorio (31,2 GB) es coherente con esa estimación, aunque los metadatos de safetensors indican 460,7 M parámetros y contradicen la etiqueta del nombre.
- GPU recomendadas: para Q8_0 de ~27B, se necesitan GPU con 32 GB o más de VRAM (A100 40 GB, H100, L40S 48 GB, RTX A6000). Una RTX 4090 de 24 GB no bastaría para Q8_0 completo.
- GPU de consumo: no cabe en GPU consumer de 24 GB en Q8_0; requeriría cuantizaciones menores (Q4_K_M, Q5_K_M) del modelo base para entrar en 16-24 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli` para multimodal), Ollama (previa importación del GGUF), y Runpod serverless mediante el mecanismo de caché descrito. vLLM y TGI no son compatibles de forma nativa con GGUF en todos los casos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repositorio (copia Q8_0 de DavidAU) | etiqueta 27B; safetensors declara 460,7 M | no disponible | Apache 2.0 | GGUF Q8_0 + mmproj BF16 | Copia parcial, sin model card propia |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | Repositorio original con documentación y settings |
| Qwen3 oficial (familia) | varía por variante | varía por variante | Apache 2.0 | safetensors, GGUF | Modelo upstream de referencia; comparación directa no disponible |

La comparación con alternativas de la misma categoría (modelos de código de ~27B) no puede hacerse con datos verificables, ya que este repositorio no publica métricas ni especificaciones completas. Se recomienda consultar el repositorio original de DavidAU para obtener la model card y los ajustes recomendados.

## Limitaciones y advertencias

- El repositorio no contiene model card propia: toda la documentación, settings y licencia detallada remiten al repositorio original de DavidAU.
- Inconsistencia de metadatos: la etiqueta del nombre indica 27B, pero los metadatos de safetensors declaran 460.730.096 parámetros; esto sugiere que el repo no contiene pesos safetensors reales y que el dato no es fiable.
- El marcador "Heretic-Uncensored" indica un fine-tuning orientado a reducir rechazos de contenido; esto puede implicar mayor probabilidad de generar contenido inapropiado, ofensivo o legalmente problemático, y traslada al desplegador la responsabilidad de filtrado.
- Riesgo de alucinación: no evaluado; sin benchmarks publicados no hay evidencia sobre fiabilidad en código, matemáticas o razonamiento.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera del inglés o del chino, idiomas habituales de la familia Qwen.
- Licencia Apache 2.0 declarada, pero conviene verificar en el repositorio original si el fine-tuning impone restricciones adicionales o si el modelo base tenía términos distintos.
- Uso comercial: Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad y la orientación "uncensored" desaconsejan su despliegue en producción sin auditoría previa.
- El repositorio es un espejo logístico: no recibirá necesariamente actualizaciones, correcciones ni soporte del autor original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ThmZ1990/Qwen3.8-27B-NEO-CODER-MAX-MTP-Q8_0-GGUF
- Repositorio original (modelo base): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- llama.cpp (soporte GGUF y multimodal): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Runpod serverless: https://www.runpod.io/serverless-gpu
