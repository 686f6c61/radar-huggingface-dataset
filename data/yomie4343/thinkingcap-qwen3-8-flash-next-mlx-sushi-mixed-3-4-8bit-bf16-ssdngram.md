# yomie4343/ThinkingCap-Qwen3.8-Flash-Next-MLX-Sushi-mixed-3-4-8bit-BF16-SSDNgram

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-MLX-Sushi-mixed-3-4-8bit-BF16-SSDNgram es un empaquetado cuantizado para Apple Silicon del modelo ThinkingCap-Qwen3.8-Flash-Next, desarrollado por el usuario yomie4343 a partir del post-entrenamiento de BottleCap AI sobre Qwen3.8-Flash-Next. El objetivo es ofrecer una variante "de razonamiento corto" del modelo base con un consumo de tokens de razonamiento reducido, empaquetada en formato MLX con cuantización afín mixta de 3, 4 y 8 bits por tensor y una tabla Ngram BF16 obligatoria de 102,4 GB que se lee desde SSD local.

El checkpoint contiene 133.195.562.899 parámetros (aproximadamente 133,2 mil millones) distribuidos en 101 shards safetensors que suman 70,9 GB, más la tabla Ngram y los ficheros de tokenizador y configuración, alcanzando un total de 173,3 GB. Está diseñado específicamente para Macs con Apple Silicon y fue validado únicamente en un M3 Ultra con 96 GB de memoria unificada, con el motor Sushi del autor y visión activada.

Su relevancia es doble: por un lado, explora la reducción de tokens de razonamiento (el autor upstream reporta un recorte medio del 38,5 % con una precisión media de 88,8 % frente a 89,8 %); por otro, demuestra un flujo de cuantización mixta por tensor con verificación byte a byte de los shards reempaquetados. No obstante, es un artefacto de nicho: no es compatible con Transformers, GGUF ni mlx-lm genéricos, y no se ha publicado una evaluación de calidad independiente del pack cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa y atención lineal, expertos compartidos y switched-MLP (MoE), capa MTP; detalles completos no disponibles |
| Parametros totales | 133.195.562.899 (aproximadamente 133,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sushi afín mixta 3/4/8 bits por tensor, group size 64; tabla Ngram BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | safetensors MLX (101 shards, 70,9 GB) + `ngram_table.bin` BF16 (102.400.491.728 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos que combina capas de atención completa (proyecciones q/k/v/o) con capas de atención lineal (proyecciones in/out), expertos compartidos (gate/up/down) y proyecciones down de switched-MLP, además de una capa MTP (multi-token prediction). El pack cuantizado conserva esa estructura y aplica una asignación de bits por tensor: de los 2.876 tensores comparados con el pack base, 1.601 resultaron idénticos byte a byte y 1.275 se regeneraron desde el checkpoint ThinkingCap y se reempaquetaron en sus shards con la asignación de bits preexistente. Se reescribieron 51 de los 101 shards; 29 permanecen sin cambios y 21 siguen la asignación local ponderada kcw de 3 bits.

El post-entrenamiento ThinkingCap, según la model card, reduce los tokens de razonamiento un 38,5 % de media manteniendo una precisión media del 88,8 % frente al 89,8 % del modelo upstream. Esos datos son del autor upstream y no se han re-medido en este pack. La innovación técnica del empaquetado es la tabla Ngram BF16 respaldada en SSD, que actúa como sidecar obligatorio y no como requisito de RAM, junto con una verificación a nivel de byte de pesos, escalas y sesgos (prefijos SHA y formas) en todos los shards reescritos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline `image-text-to-text` y la etiqueta `conversational`.
- Procesamiento de imagen y texto combinados (entrada image-text-to-text), con la bandera de visión habilitada en las pruebas locales de servicio.
- Razonamiento con modo "thinking" acortado: el post-entrenamiento ThinkingCap está orientado a reducir tokens de razonamiento manteniendo precisión.
- Predicción multi-token mediante la capa MTP, con profundidad 3 en las pruebas de servicio del autor.
- Eficiencia de tokens declarada por el autor upstream (etiqueta `token-efficient`).
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Macs de gama alta: el pack está pensado para ejecutarse en Apple Silicon con memoria unificada amplia (validado en M3 Ultra de 96 GB) usando el motor Sushi, lo que permite desplegar un modelo de 133 mil millones de parámetros en hardware de escritorio sin GPU dedicada.
- Razonamiento con presupuesto de tokens ajustado: al recortar los tokens de razonamiento un 38,5 % según el autor upstream, resulta adecuado para tareas de razonamiento encadenado donde el coste por consulta o la latencia importan, como clasificación compleja o resolución de problemas con verificación.
- Prototipado de asistentes multimodales: al aceptar entrada de imagen y texto, sirve para construir demos de descripción de imágenes, extracción de información de capturas o respuesta a preguntas sobre documentos escaneados en un entorno local.
- Investigación sobre cuantización mixta: el repositorio documenta la asignación de bits por tensor, la verificación byte a byte y la composición de shards, lo que lo convierte en un caso de estudio reproducible para estudiar el impacto de la cuantización afín 3/4/8 bits en modelos MoE grandes.
- Evaluación de decodificación asistida por Ngram: la tabla Ngram BF16 respaldada en SSD permite experimentar con decodificación guiada por ngramas en un modelo de gran tamaño sin cargar la tabla en RAM, un escenario útil para investigar latencia y calidad en Mac.
- Servicio conversacional de nicho en local: para equipos que ya operan Mac Studio o Mac Pro con memoria unificada y quieren un endpoint conversacional privado, sin depender de la nube, aceptando la restricción de usar exclusivamente el loader Sushi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta las cifras del autor upstream de ThinkingCap (38,5 % menos tokens de razonamiento, 88,8 % frente a 89,8 % de precisión media) y declara explícitamente que no se reclama ninguna evaluación completa e independiente de calidad del pack cuantizado. Las comprobaciones locales fueron de integridad del pack, pruebas de humo de servicio y ejecuciones cortas de benchmark y diálogo.

## Requisitos de hardware

- Almacenamiento: aproximadamente 173,3 GB de repositorio completo (161 GiB); el autor recomienda reservar unos 180 GiB libres. Incluye un único fichero `ngram_table.bin` de 102,4 GB.
- Memoria: validado en un M3 Ultra con 96 GB de memoria unificada. Otras configuraciones de Mac no han sido validadas.
- GPU recomendadas: Apple Silicon de gama alta; el único hardware confirmado es M3 Ultra de 96 GB. No hay datos de funcionamiento en A100, H100 ni RTX 4090, y el formato MLX/Sushi no está cualificado para ellas.
- ¿Cabe en GPU de consumo? No hay datos. El pack requiere el loader Sushi nativo y una tabla Ngram en SSD rápido; no se ha probado en GPUs de consumo.
- Despliegue: exclusivamente con el motor Sushi del autor (loader afín nativo). Transformers genérico, GGUF, EXL3 y mlx-lm no están cualificados para este pack. La tabla Ngram debe residir junto a los shards y la configuración en SSD local rápido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next-MLX-Sushi (este) | 133,2 mil millones | no disponible | MLX safetensors + Ngram BF16 | Qwen Community 1.0 | Solo motor Sushi, validado en M3 Ultra 96 GB |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next | no disponible | no disponible | safetensors BF16 | Qwen Community 1.0 (heredada) | Modelo base sin cuantizar; sin reducción de tamaño |
| Qwen3.8-Flash-Next (upstream) | no disponible | no disponible | no disponible | Qwen Community 1.0 | Modelo original antes del post-entrenamiento ThinkingCap |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje, formato y licencia.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona con el loader Sushi nativo del autor; no es utilizable con Transformers, llama.cpp, Ollama, vLLM, TGI, GGUF, EXL3 ni mlx-lm genéricos.
- Validación limitada a un único hardware: M3 Ultra con 96 GB; no hay garantías en otros Macs ni en GPUs NVIDIA o AMD.
- Dependencia de la tabla Ngram: el fichero `ngram_table.bin` de 102,4 GB es obligatorio y debe estar en SSD local rápido; su ausencia impide el funcionamiento correcto.
- Sin evaluación de calidad independiente: el autor declara que no reclama ningún benchmark completo del pack cuantizado; las cifras de ThinkingCap son del autor upstream y no se han re-medido.
- Riesgo de degradación por cuantización: la asignación mixta 3/4/8 bits, con 21 shards en 3 bits ponderados, puede afectar a la calidad en tareas sensibles; no se documenta el impacto medido.
- Sesgos y alucinaciones: no disponibles en la información proporcionada; al ser un derivado de Qwen, hereda los sesgos del modelo base, no documentados aquí.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe más allá de lo que herede del modelo base.
- Licencia: Qwen Community License 1.0, con condiciones específicas para Model-as-a-Service comercial y negocios de asistente de IA; es obligatorio leer el LICENSE completo y preservar avisos y atribuciones en la redistribución.
- Procedencia modificada: el layout del pack proviene de un intermedio modificado para rechazos (orcarouter), lo que puede introducir comportamientos de rechazo no documentados en detalle.
- Fecha y madurez: creado en octubre de 2026, con 139 descargas y 0 likes; es un artefacto de nicho sin adopción comunitaria significativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yomie4343/ThinkingCap-Qwen3.8-Flash-Next-MLX-Sushi-mixed-3-4-8bit-BF16-SSDNgram
- Modelo base (ThinkingCap): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Pack intermedio de referencia: https://huggingface.co/yomie4343/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-mixed-4-8bit/tree/94af1f9fad6e422b8dda2fd9efe187208e388ceb
- Licencia (LICENSE en el repositorio): https://huggingface.co/yomie4343/ThinkingCap-Qwen3.8-Flash-Next-MLX-Sushi-mixed-3-4-8bit-BF16-SSDNgram/blob/main/LICENSE
- Manifiesto de verificación: https://huggingface.co/yomie4343/ThinkingCap-Qwen3.8-Flash-Next-MLX-Sushi-mixed-3-4-8bit-BF16-SSDNgram/blob/main/MODEL-MANIFEST.json
