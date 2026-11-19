# wsjwong/Qwen3.5-2B-mmproj-Q8_0-GGUF

## Resumen

Qwen3.5-2B-mmproj-Q8_0-GGUF es un proyector de visión (mmproj) cuantizado a Q8_0 en formato GGUF para el modelo multimodal Qwen3.5-2B de Alibaba Qwen. No se trata de un modelo completo, sino del componente que traduce las representaciones visuales al espacio de embeddings del modelo de lenguaje, necesario para habilitar la entrada de imágenes en llama.cpp. Lo publica el usuario wsjwong como artefacto independiente para quienes despliegan Qwen3.5-2B en entornos con restricciones de tamaño.

El problema que resuelve es concreto: los repositorios públicos de Qwen3.5-2B distribuyen el mmproj únicamente en F16/BF16 (667 MB), un peso considerable cuando el modelo se empaqueta en una aplicación móvil. Esta versión Q8_0 ocupa 362 MB, aproximadamente un 46 % menos, manteniendo una calidad de salida muy próxima según la comprobación cualitativa del autor.

El modelo base Qwen3.5-2B es un transformer multimodal de 2 000 millones de parámetros con licencia Apache-2.0. El repositorio de este mmproj tiene 0,4 GB y, según los metadatos de safetensors del modelo base, 331 416 576 parámetros correspondientes al componente cuantizado. Es relevante para desarrolladores que integran visión en llama.cpp sobre hardware modesto o dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) para transformer Qwen3.5-2B |
| Parametros totales | 331 416 576 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (este repo); el base ofrece F16/BF16 y GGUF Q4_K_M, entre otros |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`mmproj-Qwen3.5-2B-Q8_0.gguf`, 362 MB) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino un artefacto de cuantización. El mmproj original en F16 (SHA-256 `7035e9cb…1830c7`) procede de `unsloth/Qwen3.5-2B-GGUF` y se convirtió a Q8_0 con `llama-quantize` de llama.cpp build 12359. El mmproj es el adaptador que proyecta los tokens visuales extraídos por el codificador de imagen al espacio de embeddings del transformer Qwen3.5-2B, de modo que el modelo de lenguaje pueda procesar instrucciones que combinan texto e imagen.

No se dispone de información sobre la arquitectura interna del codificador visual, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La única innovación técnica documentada es la propia cuantización Q8_0 del proyector, que reduce el peso de 667 MB a 362 MB con pérdida mínima según la comprobación del autor.

## Capacidades

- Descripción de imágenes y respuesta a preguntas visuales (image-text-to-text) cuando se combina con un GGUF de texto de Qwen3.5-2B.
- Lectura de texto en imágenes, incluidos menús de restaurante y carteles, según la prueba cualitativa del autor.
- Integración con `llama-server` y `llama-mtmd-cli` de llama.cpp mediante el flag `--mmproj`.
- Compatibilidad con cualquier cuantización GGUF de Qwen3.5-2B (por ejemplo, Q4_K_M) como modelo de texto asociado.
- Capacidades de texto, razonamiento, código y tool calling heredadas del modelo base Qwen3.5-2B (no documentadas en este repo).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Aplicaciones móviles con visión: empaquetar Qwen3.5-2B Q4_K_M junto con este mmproj Q8_0 reduce el tamaño total del bundle en unos 305 MB frente a la versión F16, lo que facilita su inclusión en apps de iOS o Android con límites de descarga.
- Descripción automática de imágenes en local: usar `llama-mtmd-cli` con una imagen y un prompt como "Describe this image" para generar pies de foto sin conexión, con latencia de aproximadamente 0,5 s por imagen en Metal (Apple M2 Pro).
- Lectura de menús y carteles: extracción de platos y precios de fotografías de menús, útil en apps de traducción o accesibilidad; el autor valida este escenario con menús de Hong Kong.
- Asistentes de accesibilidad: describir el entorno a personas con discapacidad visual en dispositivos de gama media, gracias al reducido peso del proyector.
- Procesamiento por lotes en CPU/GPU modesta: clasificación y anotación de imágenes en pipelines locales con llama.cpp, donde el ahorro de memoria del mmproj Q8_0 permite ejecutar el modelo completo en GPUs de consumo.
- Prototipado de agentes multimodales: combinar el modelo de texto con tool calling y este proyector para construir agentes que reciben imágenes y ejecutan acciones, con despliegue ligero en estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor incluye una comprobación cualitativa frente a F16 sobre 10 imágenes (8 fotos de COCO val2017 y 2 menús de restaurante de Wikimedia Commons) con Qwen3.5-2B Q4_K_M, temperatura 0 y thinking desactivado:

| Metrica | Resultado |
|---|---|
| Respuestas idénticas palabra por palabra | 6 de 10 |
| Respuestas con mismo contenido pero redacción distinta | 3 de 10 |
| Respuesta con detalle adicional en Q8_0 | 1 (leyó "J.P. Morgan" en la pared) |
| Menú con precios mal leídos en ambas versiones | 1 (difieren en un carácter) |
| Tiempo de prompt de imagen | ≈0,5 s por foto COCO en Metal (Apple M2 Pro) |

El propio autor advierte que es una comprobación puntual, no un benchmark.

## Requisitos de hardware

- VRAM estimada: el mmproj Q8_0 ocupa 362 MB; sumado a Qwen3.5-2B Q4_K_M (aproximadamente 1,2-1,5 GB), el conjunto cabe en torno a 2 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor valida Apple M2 Pro con backend Metal.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 y GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`), con build 12359 o superior; no se documenta soporte en vLLM, TGI u Ollama para este artefacto.
- Latencia y throughput: aproximadamente 0,5 s por prompt de imagen COCO en Metal (Apple M2 Pro); no se dispone de datos de throughput de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B mmproj Q8_0 (este) | 331 M (proyector) | no disponible | Sí | Apache-2.0 | GGUF Q8_0 |
| Qwen3.5-2B mmproj F16 (oficial/unsloth) | 331 M (proyector) | no disponible | Sí | Apache-2.0 | GGUF F16/BF16 (667 MB) |
| Qwen3.5-2B (modelo completo) | 2 000 M aprox. | no disponible | Sí | Apache-2.0 | safetensors, GGUF |

La comparación relevante es frente al mmproj F16 del que deriva: misma arquitectura y licencia, con un 46 % menos de tamaño y diferencias de salida menores en la comprobación cualitativa. No se dispone de datos para comparar con proyectores de otras familias multimodales.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un GGUF de texto de Qwen3.5-2B y llama.cpp build 12359 o superior; no funciona de forma aislada.
- La cuantización Q8_0 introduce diferencias menores frente a F16: en la prueba del autor, 4 de 10 respuestas no coincidieron palabra por palabra, aunque el contenido fue equivalente.
- El autor detectó errores de lectura de precios en menús en ambas versiones (F16 y Q8_0), lo que indica limitaciones del modelo base en OCR de imágenes complejas.
- No hay información sobre sesgos, riesgo de alucinación específico del proyector ni idiomas soportados más allá de lo heredado del modelo base.
- La comprobación cualitativa es una muestra pequeña (10 imágenes); no sustituye a una evaluación con datos propios.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B y de los GGUF de texto asociados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wsjwong/Qwen3.5-2B-mmproj-Q8_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF de origen (unsloth): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
