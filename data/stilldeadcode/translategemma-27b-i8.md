# StillDeadcode/translategemma-27b-i8

## Resumen

TranslateGemma 27B i8 es una cuantización int8 del modelo `google/translategemma-27b-it`, un modelo de traducción automática derivado de la familia Gemma 3. La conversión la publica el usuario StillDeadcode como un contenedor único en formato `.rad` (28,18 GiB) para el motor de inferencia radiance, orientado a GPUs AMD con arquitectura RDNA4 y ROCm. El modelo resuelve el problema de servir un traductor de 27B parámetros en hardware AMD consumer y profesional sin depender de CUDA ni de pesos en bf16 completos.

La relevancia de esta ficha es doble: por un lado documenta una de las pocas rutas de despliegue de un modelo de traducción grande sobre RDNA4; por otro, sirve de ejemplo de cuantización int8 con escalas por grupo de 128 columnas y activaciones int8 con escala por fila y grupo, una decisión técnica motivada por los canales de alta magnitud que caracterizan a Gemma 3.

El contenedor elimina la torre de visión del checkpoint original: solo sirve texto. Mantiene el contexto entrenado de 131.072 tokens y requiere radiance 1.17.0 o superior. El autor reporta una divergencia KL de 0,003 frente al modelo bf16 y una velocidad de unos 41 ms por token (24 tokens/s) en dos Radeon AI PRO R9700 con la versión 1.17.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3), cuantizado a int8 |
| Parametros totales | 27B (aproximado por el nombre del checkpoint; no se detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens entrenados |
| Tipos de cuantizacion | int8 con escala bf16 por grupo de 128 columnas (pesos); activaciones int8 con escala por fila y grupo de 128 columnas |
| Idiomas soportados | no disponible (el modelo base es multilingüe; la model card no enumera idiomas) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint base es `google/translategemma-27b-it`, un modelo de traducción de la familia Gemma 3 con 27B parámetros y ventana de contexto de 131.072 tokens. La model card del contenedor no documenta la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esa información corresponde al modelo original de Google y no se reproduce aquí.

La innovación técnica de esta publicación es la receta de cuantización, no el entrenamiento. Todos los lineales de atención (`attn_q`, `attn_k`, `attn_v`, `attn_o`), los de feed-forward (`ffn_down`, `ffn_gate_up`) y el `lm_head` se cuantizan a int8 con redondeo al más cercano (RTN), sin calibración, con una escala bf16 por cada grupo de 128 columnas y clamp simétrico. Las normas y el embedding permanecen en bf16. Las activaciones usan int8 con escala por fila y por grupo de 128 columnas, decisión justificada porque Gemma 3 presenta unos pocos canales con magnitudes cientos de veces superiores al resto, lo que haría desperdiciar códigos a una escala única por fila. La cabecera del contenedor registra una divergencia KL de 0,003 frente al modelo bf16. La conversión se realizó con `rad-convert` y la receta `translategemma-27b-i8a8.recipe`, incluida en el repositorio.

## Capacidades

- Traducción de texto entre pares de idiomas especificados en el prompt; el autor verificó inglés a alemán, inglés a checo y alemán a inglés.
- Generación de texto multilingüe heredada del checkpoint base Gemma 3 (la lista concreta de idiomas no está disponible).
- Conversación de un solo turno orientada a traducción mediante plantilla de chat; el modelo base usa turnos estructurados que nombran idioma origen y destino.
- Contexto largo de hasta 131.072 tokens, útil para documentos extensos.
- No soporta visión: la torre de imagen del checkpoint original no está incluida en el contenedor, por lo que la traducción de imágenes no se sirve.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Traducción de documentación técnica: con 131.072 tokens de contexto se puede enviar un manual completo y obtener la traducción en una sola pasada, manteniendo coherencia terminológica a lo largo del documento.
- Localización de interfaces y cadenas de producto: el modelo acepta instrucciones de idioma origen y destino en el prompt, lo que permite automatizar la traducción de ficheros de recursos en pipelines de CI/CD.
- Traducción jurídica o administrativa asistida: la temperatura 0 y la instrucción de producir solo la traducción, sin comentarios, encajan con flujos donde se requiere salida determinista y revisable.
- Servicio de traducción interna sobre hardware AMD: el contenedor `.rad` permite desplegar en GPUs RDNA4 con ROCm sin depender de CUDA, útil en entornos con infraestructura AMD ya existente.
- Traducción de correspondencia y correo corporativo: el ejemplo de la model card (un correo sobre un tren retrasado) ilustra el caso de textos cortos y cotidianos con tono natural.
- Investigación sobre cuantización: la receta int8 con escalas por grupo y la métrica de divergencia KL publicada sirven como referencia para estudiar el impacto de la cuantización en modelos de traducción de 27B.
- Evaluación comparativa de motores de inferencia: el autor mide latencia con dos versiones del motor (41 ms/token frente a 26 ms/token), lo que permite usar el modelo como banco de pruebas de optimizaciones de decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento son de latencia, medidos por el autor en dos Radeon AI PRO R9700 (gfx1201) con radiance 1.17.0:

| Metrica | Valor |
|---|---|
| Latencia por token (radiance 1.17.0) | ~41 ms (24 tokens/s) |
| Latencia por token (builds posteriores a 1.17.0) | ~26 ms (38 tokens/s) |
| Divergencia KL frente a bf16 | 0,003 |
| Tamano del contenedor | 28,18 GiB |

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 28,18 GiB, por lo que se necesita al menos esa cantidad para los pesos; con caché KV en bf16 y contexto de 16.384 tokens hay que sumar varios GiB adicionales.
- GPU recomendadas: el autor valida sobre dos Radeon AI PRO R9700 (RDNA4, gfx1201) con tensor parallelism 2. No se documenta funcionamiento en otras GPUs AMD ni en NVIDIA.
- GPU consumer: no se confirma compatibilidad con GPUs consumer; el requisito es arquitectura RDNA4 y ROCm, y el motor radiance.
- Despliegue: exclusivamente mediante el motor radiance (versión 1.17.0 o superior), disponible como imagen Docker `stilldeadcode/radiance`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.rad`.
- Latencia y throughput: ~24 tokens/s con una secuencia en la versión 1.17.0 y ~38 tokens/s en builds posteriores, medidos con dos R9700.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| StillDeadcode/translategemma-27b-i8 | 27B | 131.072 | `.rad` (int8) | Gemma Terms of Use | Solo texto; requiere radiance y RDNA4 |
| google/translategemma-27b-it | 27B | 131.072 | safetensors (bf16) | Gemma Terms of Use | Modelo base; incluye torre de visión |
| Gemma 3 27B IT | 27B | 131.072 | safetensors, GGUF | Gemma Terms of Use | Modelo generalista; no especializado en traducción |

No se dispone de datos de benchmarks que permitan comparar la calidad de traducción frente a alternativas.

## Limitaciones y advertencias

- Solo texto: la torre de visión no está incluida, por lo que no se puede usar para traducción de imágenes.
- Formato propietario: el contenedor `.rad` solo funciona con el motor radiance; no es portable a otros runners sin reconversión.
- Hardware restringido: requiere GPUs AMD RDNA4 y ROCm; no hay validación en otras arquitecturas.
- Idiomas no documentados: la model card no enumera los idiomas soportados, solo los tres pares verificados por el autor.
- Riesgo de alucinación: como todo modelo generativo, puede inventar contenido en textos ambiguos o muy especializados; no se han publicado evaluaciones de fidelidad.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribución; hay que revisar los términos antes de desplegar en producción.
- Divergencia por cuantización: aunque la KL es baja (0,003), puede haber degradación en casos límite no medidos.
- Madurez: el repositorio tiene cero descargas y cero likes, y la validación se limita a pruebas manuales del autor.
- Plantilla de chat: el modelo base usa turnos estructurados con idioma origen y destino; el contenedor sustituye la plantilla por `gemma3.jinja`, por lo que el cliente debe construir el prompt manualmente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/StillDeadcode/translategemma-27b-i8
- Modelo base: https://huggingface.co/google/translategemma-27b-it
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Términos de Gemma: https://ai.google.dev/gemma/terms
