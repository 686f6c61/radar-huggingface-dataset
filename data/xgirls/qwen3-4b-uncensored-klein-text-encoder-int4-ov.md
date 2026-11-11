# xgirls/Qwen3-4B-uncensored-klein-text-encoder-int4-ov

## Resumen

Este repositorio no contiene un modelo de lenguaje de propósito general, sino el codificador de texto (text encoder) del modelo de difusión FLUX.2 [klein] 4B, convertido a formato OpenVINO en cuantización INT4. Concretamente, es una conversión del finetune "Uncensored Qwen3 4B (Z-Image & Flux4B)" de Felldude, que parte de Qwen3-4B de Alibaba y se ha ajustado para eliminar los filtros de contenido en la generación de prompts. El autor del repositorio, xgirls, se limita a cambiar el formato de los pesos, no el comportamiento del modelo.

El artefacto resultante conserva únicamente las 27 capas de Qwen3 que FLUX.2 klein lee, y su salida no es texto sino los `prompt_embeds` que consume el transformer de difusión: los estados ocultos de las capas 9, 18 y 27 concatenados, con 7680 valores por token. Por tanto, no puede usarse para chat, generación de código ni razonamiento: solo funciona como componente del pipeline de FLUX.2 klein 4B, y no del de Z-Image, que lee otras capas.

Su relevancia es acotada pero clara para quien despliegue FLUX.2 klein 4B sobre hardware Intel con OpenVINO: permite sustituir el codificador de texto estándar por una variante sin censura manteniendo el mismo tamaño (unos 2,1 GB), la misma velocidad y una similitud coseno de 0,98-0,99 frente al finetune FP32 de referencia en PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3), recortado a 27 capas; exportado como grafo OpenVINO |
| Parámetros totales | no disponible (deriva de Qwen3-4B; el repo pesa 2,1 GB en INT4) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 asimétrico con grupos de 128 en la mayoría de capas; INT8 por canal en el resto (esquema NNCF) |
| Idiomas soportados | no disponible |
| Licencia | civitai-model-license (license: other) |
| Formato de pesos | OpenVINO IR (INT4/INT8), dentro de `text_encoder/` |

## Arquitectura y entrenamiento

La base es Qwen3-4B, un transformer decoder denso de la familia Qwen3 con licencia Apache 2.0. Sobre esa base, Felldude realizó un finetune orientado a la generación de prompts para modelos de imagen, comercializado en Civitai como "Uncensored Qwen3 4B (Z-Image & Flux4B)" en versión FP32 (`qwen3_4b_human_corpus_fp32.safetensors`). No se dispone de información sobre el corpus de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO.

La conversión de xgirls no reentrena nada: inserta los pesos ajustados en el grafo OpenVINO del codificador de texto publicado por rupeshs en `flux2-klein-4b-int4-ov` y aplica la cuantización que genera NNCF, con INT4 asimétrico por grupos de 128 en la mayoría de capas e INT8 por canal en el resto. El modelo solo emite las representaciones internas de las capas 9, 18 y 27 concatenadas (7680 valores por token), que es exactamente lo que espera el transformer de FLUX.2 klein 4B. La validación frente al finetune FP32 en PyTorch arroja una similitud coseno de 0,98-0,99 en esas tres capas, superior a la del codificador original (0,82-0,97) contra la misma referencia.

## Capacidades

- Codificación de prompts de texto a embeddings para el transformer de FLUX.2 klein 4B.
- Salida de `prompt_embeds` con los estados ocultos de las capas 9, 18 y 27 concatenados (7680 valores por token).
- Compatible con cualquier transformer de FLUX.2 klein 4B, original o finetune.
- Interfaz de entrada y salida idéntica a la del codificador de `rupeshs/flux2-klein-4b-int4-ov`, por lo que puede sustituir esa carpeta directamente.
- Generación de texto libre: no soportada (el modelo está recortado y su cabeza de salida no produce tokens).
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Sustitución del codificador de texto en el web UI de FLUX.2 klein 4B con OpenVINO: se descarga desde la pestaña "Download model" del repositorio de PabloHoties y se selecciona como text encoder, sin tocar el resto del pipeline.
- Generación de imágenes sin filtros de contenido en el prompt: al emplear el finetune sin censura, los prompts que el codificador estándar rechazaría o suavizaría se procesan sin restricciones, algo relevante para ilustración de ficción, arte adulto o contenidos que rozan las políticas de los modelos alineados.
- Despliegue en hardware Intel sin GPU dedicada: al estar en formato OpenVINO INT4, se ejecuta sobre CPU, iGPU o NPU Intel con un peso de unos 2,1 GB, lo que permite correr FLUX.2 klein 4B en equipos de consumo.
- Combinación con finetunes del transformer: al mantener la interfaz de rupeshs, funciona con cualquier variante de FLUX.2 klein 4B, de modo que se puede emparejar un transformer estilizado con este codificador sin censura.
- Evaluación comparativa de codificadores de texto: la similitud coseno documentada (0,98-0,99 frente a FP32) permite medir el impacto de la cuantización INT4 en la calidad final de la imagen generada.
- Prototipado de pipelines de difusión en local: al integrarse en un web UI ya existente y no requerir PyTorch en inferencia, sirve para montar demos de generación de imagen en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de calidad aportado es la similitud coseno de los embeddings de salida frente al finetune FP32 en PyTorch:

| Capa | Similitud coseno (INT4 vs FP32) |
|---|---|
| Capa 9 | 0,98-0,99 |
| Capa 18 | 0,98-0,99 |
| Capa 27 | 0,98-0,99 |
| Codificador original (referencia) | 0,82-0,97 |

## Requisitos de hardware

- Tamaño en disco: aproximadamente 2,1 GB para el codificador cuantizado.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; el peso INT4 de 2,1 GB sugiere un consumo del orden de 2-3 GB, aunque no se documenta.
- GPU recomendadas: no disponible. El formato OpenVINO está orientado a CPU, iGPU y NPU de Intel; no se documenta soporte para A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? El peso es pequeño, pero el formato OpenVINO no es el habitual para GPUs NVIDIA; el despliegue previsto es sobre hardware Intel.
- Opciones de despliegue: OpenVINO Runtime a través del web UI de FLUX.2 klein 4B (`PabloHoties/flux.2-klein-4b-openvino-webui`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un codificador de texto de difusión.
- Latencia y throughput: no disponibles. La model card indica que el tamaño y la velocidad son equivalentes a los de `rupeshs/flux2-klein-4b-int4-ov`.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| xgirls/Qwen3-4B-uncensored-klein-text-encoder-int4-ov | Codificador de texto FLUX.2 klein, sin censura | Derivado de Qwen3-4B (recortado a 27 capas) | no disponible | civitai-model-license | OpenVINO INT4 | Objeto de esta ficha |
| rupeshs/flux2-klein-4b-int4-ov | Codificador de texto FLUX.2 klein estándar | Derivado de Qwen3-4B | no disponible | Apache 2.0 | OpenVINO INT4 | Misma interfaz y tamaño; versión con alineación de seguridad |
| Qwen/Qwen3-4B | LLM de propósito general | 4B | no disponible | Apache 2.0 | safetensors | Modelo completo, no recortado; no sirve como codificador de FLUX.2 klein sin conversión |
| black-forest-labs/FLUX.2-klein-4B | Modelo de difusión texto-a-imagen | no disponible | no disponible | Apache 2.0 | no disponible | Consume los embeddings de este codificador; no es comparable en la misma categoría |

## Limitaciones y advertencias

- No es un LLM de propósito general: solo conserva las 27 capas que lee FLUX.2 klein y únicamente emite `prompt_embeds`; no genera texto.
- Solo funciona con FLUX.2 klein 4B. No es compatible con Z-Image, que lee otras capas del codificador.
- El finetune está marcado como `not-for-all-audiences` y su propósito es eliminar la censura de los prompts; puede producir representaciones para contenido adulto o potencialmente dañino según el uso que se le dé.
- Licencia `civitai-model-license`: se aplican las condiciones que el autor fijó en Civitai, no la Apache 2.0 del Qwen3-4B original. Es imprescindible revisarlas antes de cualquier uso comercial.
- La cuantización INT4 introduce una desviación medible frente a FP32 (similitud coseno 0,98-0,99), menor que la del codificador original, pero no nula.
- No hay información sobre sesgos, idiomas soportados ni comportamiento con prompts en castellano.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación por terceros.
- No se documentan requisitos de contexto ni límites de longitud de prompt.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xgirls/Qwen3-4B-uncensored-klein-text-encoder-int4-ov
- Finetune original en Civitai: https://civitai.red/models/2373678/uncensored-qwen3-4b-z-image-and-flux4b
- Modelo base del codificador (Qwen3-4B): https://huggingface.co/Qwen/Qwen3-4B
- Modelo de difusión (FLUX.2 klein 4B): https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Grafo OpenVINO de referencia: https://huggingface.co/rupeshs/flux2-klein-4b-int4-ov
- Web UI de FLUX.2 klein 4B con OpenVINO: https://github.com/PabloHoties/flux.2-klein-4b-openvino-webui
