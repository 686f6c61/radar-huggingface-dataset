# vvsotnikov/Qwen3.8-27B-test-GGUF-no-MTP

## Resumen

El modelo Qwen3.8-27B-test-GGUF-no-MTP es una cuantización GGUF creada por vvsotnikov a partir del modelo base vvsotnikov/Qwen3.8-27B-test, que a su vez es un merge lineal al 50% de Qwen3.6-27B y Qwen3.8-27B. Se trata de una variante multimodal (image-text-to-text), con un encoder de visión compartido en formato BF16. La particularidad de esta versión es la eliminación de los tensores MTP (multi-token prediction) durante la conversión a GGUF mediante la opción --no-nextn, lo que reduce el tamaño del checkpoint y lo hace directamente cargable en llama.cpp sin las capas de predicción de múltiples tokens. El repositorio ofrece dos cuantizaciones principales, Q4_K_M y Q5_K_M, con un total de 36.7 GB incluyendo el proyecto de visión. No se especifican la longitud de contexto nativa ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); no se especifica el tipo exacto en la información disponible. La etiqueta en HuggingFace la asocia a qwen3_5 |
| Parametros totales | 460.730.096 (según metadatos de HuggingFace; inconsistente con la denominación 27B del nombre) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (en el ejemplo de uso se configura --ctx-size 8192) |
| Tipos de cuantizacion | Q4_K_M y Q5_K_M (GGUF); mmproj en BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un merge lineal 50/50 de Qwen3.6-27B y Qwen3.8-27B, según se documenta en merge-manifest.json del checkpoint original. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens ni la aplicación de técnicas de alineación como RLHF o DPO. La etiqueta de HuggingFace asocia el modelo a la familia qwen3_5, pero no se ofrece una descripción oficial de la arquitectura. La innovación técnica más destacable es la eliminación de las capas de predicción de múltiples tokens (MTP) durante la conversión a GGUF. El resultado es un modelo con 64 capas y 851 tensores, sin la metadata qwen35.nextn_predict_layers. El encoder de visión (mmproj) se mantiene en BF16 y es idéntico al de la versión con MTP.

## Capacidades

- Comprensión de imágenes y texto: el modelo es multimodal (image-text-to-text) y puede procesar entradas visuales a través del proyecto de visión BF16.
- Modo de razonamiento (thinking): permite activar el razonamiento encadenado con el formato DeepSeek, mediante los parámetros --reasoning on y --reasoning-format deepseek.
- Generación de texto con plantillas Jinja: compatible con llama.cpp y llama-server, usando chat templates para conversaciones.
- No se han encontrado evidencias de soporte para tool calling, function calling ni agentes en la información disponible.

## Casos de uso

- Chat multimodal local: ejecutar con llama-server para atender consultas que combinan imágenes y texto en un entorno privado, sin conexión a internet.
- Análisis de capturas de pantalla: extraer contenido de diagramas, interfaces o formularios a partir de una imagen, aprovechando el modo de razonamiento activado.
- Pruebas de arquitecturas MTP: comparar esta versión sin MTP con la que incluye MTP para evaluar diferencias en velocidad de generación especulativa y calidad de salida.
- Prototipado en visión por computador: integrar el GGUF con llama.cpp en scripts de Python para tareas de OCR o descripción de escenas.
- Despliegue en servidores aislados: al usar GGUF y licencia Apache-2.0, se puede empaquetar en contenedores sin dependencias externas para entornos sin acceso a internet.
- Investigación sobre merges de modelos: usar este checkpoint para estudiar cómo la combinación de Qwen3.6-27B y Qwen3.8-27B afecta el comportamiento multimodal y el razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos Q4_K_M ocupan 16.55 GB; Q5_K_M, 19.23 GB; el mmproj BF16, 0.93 GB.
- Para Q4_K_M, una tarjeta como la RTX 4090 (24 GB) puede cargar el modelo con un contexto moderado. Para Q5_K_M, se recomienda una A100 (40/80 GB) o similar.
- El modelo fue probado en Apple M5 Max con 128 GiB de RAM unificada, usando --n-gpu-layers 99 (todas las capas en GPU).
- Despliegue compatible con llama.cpp, llama-server, llama-cli y Ollama (importando el archivo GGUF). No se recomienda vLLM ni TGI para formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vvsotnikov/Qwen3.8-27B-test-GGUF-no-MTP (este) | 460.730.096 según HuggingFace (inconsistente con denominación 27B) | No disponible | Q4_K_M, Q5_K_M + mmproj BF16 | Apache-2.0 | HuggingFace |
| vvsotnikov/Qwen3.8-27B-test-GGUF (con MTP) | No disponible | No disponible | Similar, con MTP | Apache-2.0 | HuggingFace |
| unsloth/Qwen3.8-27B-GGUF | No disponible | No disponible | GGUF (no especificado) | No disponible | HuggingFace |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos; al ser un merge de modelos, puede heredar sesgos no documentados de sus bases.
- Riesgo de alucinación inherente; no se dispone de estudios de fiabilidad ni de evaluaciones de seguridad.
- La longitud de contexto nativa no está especificada. El ejemplo de uso configura --ctx-size 8192, pero el modelo podría requerir ajustes manuales para contextos mayores.
- No hay información sobre idiomas soportados; la calidad multilingüe, incluida la del español, no está documentada.
- La licencia Apache-2.0 permite uso comercial, pero se deben cumplir los requisitos de atribución y notificación. No se indica que los modelos base tengan restricciones adicionales.
- Es un modelo de prueba ("test") sin benchmarks públicos, por lo que su uso en producción exige una evaluación previa exhaustiva.
- La eliminación de MTP puede reducir el rendimiento frente a la versión con MTP en generación especulativa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vvsotnikov/Qwen3.8-27B-test-GGUF-no-MTP
- Modelo base: https://huggingface.co/vvsotnikov/Qwen3.8-27B-test
- Versión con MTP: https://huggingface.co/vvsotnikov/Qwen3.8-27B-test-GGUF
- Alternativa GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo base alternativo: https://huggingface.co/unsloth/Qwen3.8-27B
