# Yanuk-K/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-Q6dense-GGUF

## Resumen

Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-Q6dense-GGUF es una cuantización GGUF del fine-tune "uncensored/heretic" de llmfan46 sobre el modelo base Qwen/Qwen3.6-35B-A3B, publicada por el usuario Yanuk-K. El modelo conserva el bloque MTP (multi-token prediction) nativo del modelo original dentro del mismo archivo GGUF, lo que permite decodificación especulativa sin necesidad de un modelo draft auxiliar. Está pensado para inferencia local en hardware AMD Strix Halo (gfx1151) mediante el runtime gufo, aunque también carga en builds recientes de llama.cpp compatibles con la arquitectura `qwen35moe`.

La arquitectura subyacente es un transformer MoE híbrido con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones activos por token, 256 expertos (8 enrutados más 1 compartido) y 40 capas de tronco: 30 de Gated DeltaNet (atención lineal) y 10 de atención completa, más una capa MTP adicional. El contexto nativo es de 262.144 tokens. El modelo es solo texto (no se incluye proyector multimodal en este repositorio) y declara únicamente el idioma inglés.

La relevancia de esta ficha radica en dos factores: por un lado, la receta de cuantización "Q6dense" (tronco denso en Q6_K, expertos enrutados en Q4_K/Q5_K, embeddings y tensores MTP en Q8_0) que reduce el peso a unos 20,9 GiB manteniendo calidad razonable; por otro, el carácter "abliterated/decensored" del fine-tune, que elimina los mecanismos de rechazo del modelo original y traslada toda la responsabilidad de filtrado y cumplimiento normativo al operador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`qwen35moe`): 30 capas Gated DeltaNet + 10 capas de atención completa + 1 capa MTP nativa |
| Parametros totales | 35.505.251.456 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q6dense (receta por tensor: Q6_K tronco denso, Q4_K/Q5_K expertos enrutados, Q8_0 embeddings y MTP, F32 normas y SSM pequeños); producida desde BF16 con llama-quantize b11069 e imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (heredada de Qwen3.6-35B-A3B) |
| Formato de pesos | GGUF (archivo único de 20,9 GiB / 22.389.224.864 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con mezcla de atención lineal y completa: 30 capas de Gated DeltaNet, que mantienen un estado constante por sesión en lugar de una caché KV por token, y 10 capas de atención completa con 2 cabezas KV y dimensión de cabeza 256. Los 256 expertos (8 enrutados más 1 compartido) se activan de forma dispersa, dando lugar a unos 3.000 millones de parámetros activos por token sobre un total de 35.505 millones. La capa MTP nativa añade una cabeza de predicción multi-token que permite decodificación especulativa integrada.

Sobre el modelo base, llmfan46 aplicó un fine-tune de tipo "heretic/abliterated" orientado a eliminar los comportamientos de rechazo, y Yanuk-K lo cuantizó a GGUF preservando el bloque MTP. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el fine-tune. La cuantización es lossy: no es bit-idéntica ni al BF16 ni a un Q8_0, y la receta se generó con una imatrix (referenciada como `imatrix_unsloth.gguf_file`) y un archivo de tipos por tensor (`q6dense.types`).

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat propia de Qwen3.6.
- Modo thinking activado por defecto, con control mediante `--think on|off` en gufo y `chat_template_kwargs.enable_thinking` en peticiones compatibles con OpenAI.
- Niveles de esfuerzo de razonamiento configurables en gufo: `auto`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`.
- Decodificación especulativa mediante el bloque MTP nativo incluido en el mismo GGUF, sin modelo draft auxiliar.
- Soporte de system prompts y, según la plantilla del fine-tune, mensajes `developer` y marcadores `<|think_on|>` / `<|think_off|>` (su soporte depende del runtime; gufo los ignora).
- Capacidad multilingüe limitada: el modelo declara únicamente inglés.
- Sin capacidades multimodales en este repositorio: no se incluye proyector `mmproj`.
- Comportamiento sin filtrado de seguridad: puede generar contenido ofensivo, explícito o inseguro.

## Casos de uso

- Inferencia local en estaciones AMD Strix Halo: el GGUF está ajustado para gfx1151 con gufo y `--speculative mtp`, permitiendo servir el modelo en un equipo de 128 GiB de memoria unificada con contexto de 64K (aproximadamente 21,6 GiB totales con caché KV en q8_0).
- Asistentes conversacionales sin restricciones de contenido para investigación sobre alineación y comportamiento de modelos: útil para estudiar cómo responde un modelo abliterated frente a su versión original en tareas de red teaming controlado.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo y capas de atención lineal que evitan el crecimiento de caché por token, es adecuado para resumir o extraer información de corpus extensos en una sola pasada.
- Generación de texto creativo sin censura: el fine-tune heretic permite narrativa, guiones o diálogos con temáticas que los modelos alineados rechazarían, siempre bajo responsabilidad del operador y cumplimiento legal.
- Evaluación comparativa de cuantizaciones: la receta Q6dense documentada por tensor permite medir la degradación de calidad frente a BF16 o Q8_0 en tareas de razonamiento y generación.
- Despliegue con API compatible con OpenAI: mediante llama-server con `--jinja` o gufo en el puerto 8080, se puede conectar a Open WebUI u otros clientes apuntando a `http://127.0.0.1:8080/v1`.
- Pruebas de decodificación especulativa: el bloque MTP preservado sirve para experimentar con `--spec-type draft-mtp --spec-draft-n-max 5` en llama.cpp y medir aceleraciones de throughput sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: pesos de aproximadamente 20,9 GiB. Con caché KV en q8_0, el total es de ~21,2 GiB a 32K, ~21,6 GiB a 64K, ~22,3 GiB a 128K y ~23,7 GiB a 256K. Con caché en f16: ~21,5 / ~22,2 / ~23,6 / ~26,4 GiB respectivamente.
- Caché KV: aproximadamente 11,7 KiB por token con q8_0 en K/V (~22 KiB con f16), calculada sobre 11 capas de atención completa (10 de tronco más 1 MTP) × 2 cabezas KV × 256 de dimensión × (K + V). Las capas Gated DeltaNet mantienen un estado constante por sesión.
- GPU recomendadas: el destino declarado es AMD Strix Halo (gfx1151) con 128 GiB de memoria unificada, donde queda espacio para ejecutar además un stack de generación de imágenes. No se documentan requisitos para A100, H100 o RTX 4090 en la información disponible.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo de 24 GB; los 20,9 GiB de pesos más caché dejan poco margen en una RTX 4090 y no hay datos publicados al respecto.
- Opciones de despliegue: gufo (runtime objetivo, con `--speculative mtp`, `--sessions`, `--context`, `--think` y `--reasoning-effort`) y llama.cpp reciente con soporte `qwen35moe` y MTP (`--jinja`, `-fa on`, `--cache-type-k q8_0 --cache-type-v q8_0`, `--spec-type draft-mtp --spec-draft-n-max 5`). Compatible con endpoints OpenAI para Open WebUI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Yanuk-K/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-Q6dense-GGUF | ~35B totales, ~3B activos | 262.144 | GGUF Q6dense (~20,9 GiB) | Apache-2.0 | MTP nativo incluido, sin proyector multimodal, solo inglés |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved | ~35B totales, ~3B activos | 262.144 | Pesos del fine-tune (formato no detallado) | Apache-2.0 | Modelo fuente del fine-tune heretic; esta ficha es su cuantización GGUF |
| Qwen/Qwen3.6-35B-A3B | ~35B totales, ~3B activos | 262.144 | BF16 y otras | Apache-2.0 | Modelo base alineado; incluye rechazos de seguridad que el fine-tune elimina |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Modelo "uncensored/heretic": no aplica filtrado de seguridad y puede producir contenido ofensivo, explícito, inseguro o factualmente incorrecto. El autor declara explícitamente que la responsabilidad de uso y del cumplimiento legal recae en el operador.
- Riesgo elevado de alucinación y de respuestas dañinas al haberse eliminado los mecanismos de rechazo del modelo base; no es adecuado para producción orientada al usuario final sin una capa de moderación externa.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está documentado y puede degradarse.
- La cuantización Q6dense es lossy y no es bit-idéntica al BF16 ni al Q8_0; la calidad puede diferir del modelo fuente.
- No incluye proyector multimodal (`mmproj`): no hay capacidades de visión en este repositorio.
- Compatibilidad de plantilla de chat: el fine-tune usa una plantilla con SHA-256 `e7018ebe03fa07c44c7eea46fa3734173a90237a02b7c352d3260914b40d7c6f`; algunas builds antiguas de gufo solo aceptan las plantillas oficial y de Unsloth y devuelven `Unsupported Qwen3.6 chat template`. Es necesario parchear `IsQwen36Template()` o usar una build actualizada.
- Requiere builds recientes de llama.cpp con soporte `qwen35moe` y MTP; versiones anteriores no cargarán el modelo correctamente.
- Licencia Apache-2.0 heredada del modelo base, sin restricciones adicionales documentadas para uso comercial, pero el contenido generado puede infringir políticas de plataformas o legislación aplicable.
- El contexto efectivo debe ajustarse a la memoria disponible: 256K con caché f16 consume ~5,50 GiB adicionales solo en KV.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yanuk-K/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-Q6dense-GGUF
- Modelo fuente del fine-tune: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Runtime gufo (build específica para esta cuantización): https://github.com/NinjaPear/gufo-Qwen3.6-35B-A3B-Q6dense
