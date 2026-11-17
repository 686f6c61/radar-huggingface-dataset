# WEIGHTWRIGHT/kenver

## Resumen

Kenver es un adaptador LoRA de investigación publicado por WEIGHTWRIGHT Research sobre el modelo multimodal Qwen/Qwen3.8-27B. Su función concreta es recibir una imagen de diapositiva de referencia junto con el texto asociado y generar JSON estructurado conforme al esquema propietario `ww8-scene-v2`, orientado a la reconstrucción programática de presentaciones. No se trata de un modelo completo, sino de un adaptador de bajo rango que se monta sobre los pesos congelados del modelo base, que no se redistribuyen.

La relevancia del artefacto es acotada y hay que enmarcarla correctamente: es una *research preview* (EVA SFT v1) con 400 ejemplos sintéticos de entrenamiento procedentes de una única línea de generación, dos épocas y 100 pasos de optimizador. El autor declara explícitamente que la comparación contra el modelo base está pendiente y que la fidelidad visual, la exportación editable a PPTX y la madurez para producción no están verificadas. La descarga pública contiene únicamente los pesos del adaptador: no incluye el runtime del proyecto, el system prompt entrenado, la implementación del esquema, el dataset, las fuentes ni el exportador.

El adaptador es de tipo *language-model-only*: afecta solo a la torre de lenguaje, no al codificador visual del modelo base. Esta distinción es importante para entender qué se está ajustando exactamente y qué capacidades visuales hereda sin modificar del modelo Qwen subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.8-27B; adaptador solo para la torre de lenguaje |
| Parametros totales | No disponible (el adaptador ocupa 0,4 GB en FP32; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el demo usó un límite de generación de 4096 tokens |
| Tipos de cuantizacion | No disponible (pesos del adaptador en FP32; base cargada en BF16 en el demo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible para el adaptador; el modelo base Qwen se distribuye bajo Apache License 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json`; librería PEFT |
| Rango LoRA / alpha / dropout | 16 / 32 / 0 |
| Modelo base | Qwen/Qwen3.8-27B, revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un transformer multimodal que en el ejemplo de carga del autor se instancia con `Qwen3_5ForConditionalGeneration`, `dtype=torch.bfloat16`, `device_map="cuda"` y `attn_implementation="sdpa"`. El stack observado en el demo incluye `transformers==5.17.0`, `peft==0.21.2`, `torch==2.14.0`, `flash-linear-attention==0.5.2`, `fla-core==0.5.2` y `triton==3.8.0`, lo que sugiere el uso de capas de atención lineal en el modelo base. El adaptador LoRA es de rango 16 con alpha 32 y dropout 0, con pesos en FP32, y afecta únicamente a la torre de lenguaje: los pesos del modelo base no se fusionan ni se redistribuyen.

El entrenamiento se realizó con 400 ejemplos sintéticos procedentes de una única línea de generador, durante dos épocas y 100 pasos de optimizador con semilla 0. No se documenta el número de tokens, la composición exacta del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento posterior. El adaptador publicado es byte a byte idéntico al checkpoint probado en el demo; la única modificación en la copia de release es el `adapter_config.json`, donde la ruta de montaje del contenedor pasa a ser el ID público del modelo base y se fija la revisión del commit correspondiente. El SHA-256 de `adapter_model.safetensors` es `acea856414a74dc5169ca5c8d0a45a5c723c926083c9e37f31c5ae6668e33d28`.

## Capacidades

- Generación de JSON estructurado conforme al esquema `ww8-scene-v2` a partir de una imagen de diapositiva de referencia y el texto asociado.
- Reconstrucción de escenas de diapositiva: en el demo generó 5 objetos de escena y preservó las 5 cadenas de texto suministradas.
- Procesamiento multimodal imagen-texto heredado del modelo base Qwen3.8-27B (pipeline `image-text-to-text`).
- Cumplimiento estricto de JSON: el demo pasó el parseo estricto y la validación del esquema sin reparaciones aplicadas.
- Generación con parada en EOS: 748 tokens generados dentro de un límite de 4096.
- Soporte de *tool calling* / *function calling*: no disponible (no documentado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado para el adaptador).
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión, audio u otras capacidades especiales: solo se documenta la entrada imagen-texto heredada del base; no se detallan otras.

## Casos de uso

- Reconstrucción automatizada de diapositivas: dado un PNG o render de una diapositiva y su texto, el adaptador emite el JSON `ww8-scene-v2` que un pipeline posterior podría convertir en una presentación editable. Es el caso de uso para el que fue entrenado y el único verificado en el demo.
- Migración de presentaciones heredadas: digitalizar decks antiguos exportados como imágenes, extrayendo la estructura de escena y los textos para regenerarlos en un formato moderno, aprovechando la preservación de cadenas de texto observada (5 de 5 en el fixture).
- Extracción de estructura visual para indexación: generar representaciones JSON de diapositivas que alimenten un buscador o un sistema de gestión documental, usando el esquema como formato intermedio canónico.
- Generación de fixtures de test para herramientas de presentaciones: producir escenas sintéticas controladas que validen parsers, validadores de esquema y exportadores en CI.
- Prototipado de asistentes de diseño de slides: integrar el adaptador en un flujo donde el usuario sube una referencia visual y recibe una descripción estructurada editable, siempre que se aporte el system prompt entrenado y el contrato imagen/contenido del proyecto.
- Investigación sobre ajuste fino multimodal con datos sintéticos: el adaptador sirve como caso de estudio reproducible de LoRA de rango 16 sobre un base de 27B con solo 400 ejemplos y 100 pasos, útil para estudiar sobreajuste y generalización en dominios estrechos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la comparación contra el modelo base Qwen está pendiente. El único dato empírico es la ejecución del demo sobre un fixture sintético del propio conjunto de entrenamiento, en una NVIDIA H200 el 17 de noviembre de 2026:

| Comprobacion | Resultado observado |
|---|---|
| Parseo estricto de JSON | Superado |
| Validacion del esquema `ww8-scene-v2` | Superada |
| Cadenas de texto suministradas preservadas | 5 de 5 |
| Objetos de escena generados | 5 |
| Reparaciones aplicadas | 0 |
| Generacion | 748 tokens, fin en EOS (limite de 4096) |
| Tiempo de generacion | 149,28 s |
| Verificacion y carga del checkpoint | 90,74 s |
| Tiempo total del contenedor | 240,13 s |

El fixture contenía las cadenas «Planning routing», «Signals 482», «48%», «Measured 666» y «59%». Se trata de una única muestra del conjunto de entrenamiento, por lo que no constituye evidencia de generalización.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El adaptador en sí ocupa 0,4 GB, pero requiere cargar el modelo base completo de 27B en memoria; en BF16 esto implica del orden de decenas de GB solo para los pesos, más overhead de runtime y activaciones.
- GPU recomendadas: el autor usó una NVIDIA H200 para el demo. No se documentan otras GPU validadas.
- Cabe en GPU de consumo: no disponible; no se ha verificado en RTX 4090 ni similares, y el tamaño del base hace improbable un despliegue cómodo sin cuantización, que no está documentada para este adaptador.
- Opciones de despliegue: carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`) con `AutoProcessor` y `Qwen3_5ForConditionalGeneration`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Stack verificado: `torch==2.14.0`, `torchvision==0.29.1`, `transformers==5.17.0`, `peft==0.21.2`, `Pillow==12.3.0`, `flash-linear-attention==0.5.2`, `fla-core==0.5.2`, `einops==0.8.1`, `triton==3.8.0`. Otros stacks no están verificados.
- Latencia y throughput: en el demo, 149,28 s para 748 tokens de generación (aproximadamente 5 tokens/s) más 90,74 s de carga del checkpoint, sobre H200. No hay datos de throughput en lote.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores de reconstrucción de diapositivas ni con modelos de la misma categoría, y el autor no ha publicado la comparación pendiente contra el modelo base Qwen3.8-27B. Cualquier comparación numérica en esta ficha sería inventada.

## Limitaciones y advertencias

- Estado de *research preview*: el propio autor declara no verificadas la generalización, la fidelidad visual, la exportación editable a PPTX y la madurez para producción.
- Entrenado con solo 400 ejemplos sintéticos de una única línea de generador, dos épocas y 100 pasos: riesgo alto de sobreajuste al estilo y distribución del generador, con escasa evidencia de transferencia a diapositivas reales.
- La única evaluación publicada usa un fixture del propio conjunto de entrenamiento, no un conjunto retenido.
- La descarga pública no incluye el system prompt entrenado, la implementación del esquema `ww8-scene-v2`, el runtime del proyecto, el dataset, las fuentes ni el exportador. Sin el prompt y el contrato imagen/contenido originales no se puede reproducir el comportamiento del demo; un prompt genérico no está verificado como sustituto.
- El adaptador solo ajusta la torre de lenguaje; las capacidades visuales son las del base Qwen3.8-27B sin modificar.
- Licencia del adaptador no especificada: el autor indica que no existe una licencia pública aprobada para el adaptador y que el archivo de licencia de Qwen no constituye una concesión nueva de WEIGHTWRIGHT. La disponibilidad pública de la descarga no otorga por sí misma derechos adicionales de reutilización. El uso comercial del adaptador queda, por tanto, sin marco claro; el base Qwen sí es Apache 2.0.
- Sesgos conocidos: no documentados. Al entrenarse sobre datos sintéticos de un solo generador, es esperable que herede los sesgos y artefactos de ese generador, aunque no se cuantifica.
- Riesgo de alucinación: no evaluado. El demo solo comprueba la preservación de cadenas suministradas y la validez del esquema, no la fidelidad semántica o visual del contenido generado.
- Idiomas soportados: no disponibles; no se documenta comportamiento fuera del inglés del fixture.
- Latencia elevada en el demo (unos 5 tokens/s en H200) y carga del checkpoint de más de 90 s: poco adecuado para servicios interactivos sin optimización adicional.
- El ejemplo de carga del autor no ejecuta generación ni exporta presentaciones, y no se ha vuelto a probar la carga desde esta preview pública en GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WEIGHTWRIGHT/kenver
- Modelo base Qwen3.8-27B (revisión fijada): https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Repositorio del adaptador fuente: `WEIGHTWRIGHT/kenver-eva-sft-v1` (commit `57a2fade127340bf15cb6f1996283dcf7fa0d3fc`; no se proporciona URL directa)
- Paper, blog, demo o repositorio adicionales: no disponibles en la información proporcionada.
