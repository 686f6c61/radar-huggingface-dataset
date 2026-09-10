# tadad/qwen3.5-0.8b-sanskrit-ocr

## Resumen

qwen3.5-0.8b-sanskrit-ocr es un adaptador LoRA desarrollado por tadad, entrenado sobre el modelo multimodal Qwen3.5-0.8B de Qwen. Su objetivo es transcribir páginas de manuscritos sánscritos históricos a escritura devanagari, un problema relevante para la preservación digital y la investigación filológica. El adaptador aprovecha un dataset propio, midf-egangotri-sanskrit, con pares página–transcripción revisados manualmente.

En términos de arquitectura, se trata de un adaptador PEFT (LoRA rank 16, alpha 32, dropout 0.05) que modifica las capas lineales del modelo de lenguaje, manteniendo congelados los pesos de visión. El modelo base tiene 0.8B de parámetros, aunque no se especifica su ventana de contexto. La generación se limita a 2.048 tokens y el procesamiento de imagen admite hasta 2.097.152 píxeles.

La relevancia actual radica en que combina un modelo multimodal ligero con un fine-tuning específico para OCR de manuscritos, logrando una reducción del error de caracteres (CER) relativa del 6,7 % frente a un checkpoint anterior. Aun siendo un recurso experimental, ofrece una alternativa útil para transcripciones asistidas en instituciones académicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-0.8B; modelo multimodal imagen a texto |
| Parámetros totales | No disponible (el adaptador LoRA no publica su conteo; el modelo base es de 0.8B) |
| Longitud de contexto | No disponible (la generación se limita a 2.048 tokens en el script de uso) |
| Tipos de cuantización | No disponible (inferencia en BF16) |
| Idiomas soportados | Sánscrito (sa); salida en escritura devanagari |
| Licencia | No disponible (el modelo base es Apache-2.0; el adaptador no declara licencia) |
| Formato de pesos | LoRA en safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se ha construido sobre el modelo multimodal Qwen3.5-0.8B, aplicando LoRA con rank 16, alpha 32 y dropout 0.05 sobre las capas lineales del modelo de lenguaje; los pesos de visión permanecen congelados. El entrenamiento se realizó en un dataset propio de pares página–transcripción (MIDF/eGangotri), con 2.369 páginas y dos épocas de aprendizaje supervisado solo con respuestas (answer-only), usando una tasa de aprendizaje de 0.0002. El autor revisó manualmente las alineaciones, corrigió límites de página y excluyó casos dudosos o dañados. Cuatro páginas vecinas se retuvieron fuera del entrenamiento. No se aplicó RLHF ni DPO.

La innovación destacable es la receta de decodificación: decodificación greedy sin pensamiento (non-thinking), con una penalización por presencia de 1.5 aplicada solo a tokens generados, y un límite de 2.048 tokens. Esta combinación, junto con el checkpoint 1186, fue la que mejores resultados dio, sin necesidad de reentrenar. La selección del checkpoint y la penalización están emparejadas: aplicar la misma receta al checkpoint 894 provoca un bucle de repetición.

## Capacidades

- Transcripción OCR de páginas de manuscritos sánscritos históricos a escritura devanagari.
- Procesamiento de imágenes de página completa con hasta 2.097.152 píxeles.
- Salida textual en sánscrito (devanagari), concebida para revisión humana.
- Decodificación greedy non-thinking con penalización por presencia de 1.5 para reducir bucles y truncamientos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-step.
- Modelo monolingüe en sánscrito; no se describen capacidades multilingües, de visión general ni de audio.

## Casos de uso

- Digitalización de manuscritos en bibliotecas: el modelo puede transcribir automáticamente páginas escaneadas de eGangotri y MIDF para generar textos digitales buscables. Su capacidad para procesar imágenes de página completa reduce la necesidad de segmentación previa.
- Asistencia a filólogos en la lectura de textos difíciles: ante caligrafías problemáticas, el modelo ofrece una propuesta de transcripción que el investigador puede corregir, acelerando la edición crítica de obras sánscritas.
- Catalogación y metadatos en archivos digitales: al convertir la imagen en texto, se puede indexar el contenido de los manuscritos y facilitar la búsqueda temática o por pasajes.
- Formación en estudios sánscritos: estudiantes y docentes pueden usar el modelo como herramienta de apoyo para interpretar manuscritos, aunque siempre con supervisión humana.
- Pipelines de OCR científico: al ser un adaptador PEFT, se puede integrar en entornos de investigación con HuggingFace Transformers para comparar métodos o para un fine-tuning adicional.
- Preservación del patrimonio cultural: la transcripción automática ayuda a crear copias legibles de manuscritos frágiles, contribuyendo a su conservación y difusión.

## Benchmarks y rendimiento

La información publicada incluye resultados sobre un panel de validación de 12 páginas procedentes de tres manuscritos no vistos. El autor advierte de que es un benchmark de desarrollo pequeño, no una estimación no sesgada del rendimiento global. CER es menor y la similitud normalizada es mayor en el sentido de mejor.

| Modelo / decodificación | CER | Similitud media | Páginas truncadas |
| --- | ---: | ---: | ---: |
| Modelo base, evaluación inicial | 1,1062 | 0,2963 | 4 |
| Checkpoint 894, muestreo original | 0,2428 | 0,7803 | 0 |
| Checkpoint 894, greedy | 0,4576 | 0,7384 | 1 |
| Checkpoint 1186, muestreo original (re-ejecución) | 0,3590 | 0,7347 | 1 |
| Checkpoint 1186 liberado, greedy | 0,2264 | 0,7977 | 0 |

La receta liberada reduce el CER un 6,7 % relativo frente al checkpoint 894 con muestreo original, mejorando 10 de las 12 páginas con 123 ediciones de caracteres menos. Aun así, una predicción de la receta liberada genera una advertencia de repetición, aunque termina con normalidad.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo base tiene 0.8B de parámetros, pero no se publican cifras de VRAM. El script de uso emplea BF16, por lo que los pesos del modelo de lenguaje ocupan aproximadamente 1.6 GB, sin incluir el codificador de visión ni el procesamiento de la imagen.
- Las evaluaciones se realizaron en una NVIDIA A100 de 80 GB. No se documenta el rendimiento en GPUs de consumo, como una RTX 4090.
- Opciones de despliegue: el autor proporciona un script transcribe.py que se ejecuta con uvx y carga el adaptador localmente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

No disponible. No se han identificado otros adaptadores o modelos comparables dentro de la información proporcionada, ni en la model card ni en los resultados de búsqueda.

## Limitaciones y advertencias

- El reconocimiento de caracteres, el texto marginal y el texto tachado siguen siendo imperfectos; se requiere revisión humana para transcripciones fiables.
- Las páginas de validación son un benchmark de desarrollo pequeño y no representan una estimación no sesgada del rendimiento global.
- La receta de decodificación greedy con penalización por presencia 1.5 está emparejada con el checkpoint 1186; aplicar la misma receta a otros checkpoints puede provocar bucles de repetición.
- La licencia del adaptador no está declarada. El modelo base es Apache-2.0, pero el dataset se publica con licencia other. Deben revisarse los términos aguas arriba antes de reutilizar o redistribuir.
- El modelo depende del modelo base Qwen3.5-0.8B, que debe cargarse por separado; el adaptador por sí solo no es utilizable.
- No se documenta soporte de tool calling ni de razonamiento multi-step, por lo que su uso en agentes automatizados no está verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadad/qwen3.5-0.8b-sanskrit-ocr
- Dataset de entrenamiento: https://huggingface.co/datasets/tadad/midf-egangotri-sanskrit
- Archivo de evaluación: https://huggingface.co/tadad/qwen3.5-0.8b-sanskrit-ocr/blob/main/evaluation.json
- Script de uso proporcionado por el autor: https://huggingface.co/tadad/qwen3.5-0.8b-sanskrit-ocr/blob/main/transcribe.py
