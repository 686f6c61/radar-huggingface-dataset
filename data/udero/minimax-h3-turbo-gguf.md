# udero/minimax-h3-turbo-gguf

## Resumen

`udero/minimax-h3-turbo-gguf` es una versión GGUF derivada de **MiniMax-H3 FL2VA**, un modelo fundacional omnicanal de MiniMax que genera vídeo y audio estéreo nativo de forma conjunta, en su variante FL2VA (primer fotograma latente, es decir, image-to-video con audio). El autor del repositorio, `udero`, no entrena nada nuevo: lo que publica es un "bake" del LoRA oficial de destilación **MiniMax-H3 8-Step Turbo** directamente dentro de los pesos base Q5_0, fusionando en FP32 y recuantizando después. El resultado es un único archivo de ~13 GB que genera en 8 pasos Euler con CFG 1.0, frente a los 50 pasos y la carga separada de adaptadores del flujo estándar.

La relevancia práctica está en la simplificación del pipeline: al eliminar el nodo `LoraLoader` y la fusión en tiempo de ejecución, se evitan los problemas de fragmentación de memoria y de des-cuantización que aparecen al aplicar LoRA sobre pesos GGUF ya cuantizados. Según la model card, el modelo funciona en GPUs de consumo de 12 GB (el ejemplo citado es una configuración de dos RTX 3060 de 12 GB).

Ahora bien, se trata de un artefacto de terceros, publicado el 19 de octubre de 2026, con 0 descargas y 0 likes en el momento de redactar esta ficha, sin evaluación publicada, sin paper asociado y bajo licencia "other". La información disponible sobre arquitectura interna, datos de entrenamiento y rendimiento cuantitativo es muy limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación conjunta de vídeo y audio estéreo; variante FL2VA (primer fotograma latente / image-to-video + audio). No se especifica en la información disponible si el backbone es DiT, UNet u otra variante |
| Parametros totales | No disponible. El archivo Q5_0 de ~13 GB sugiere del orden de 20 000 millones de parámetros, pero es una estimación a partir del tamaño y no está confirmada (el archivo base está podado) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No aplica como contexto de LLM. El ejemplo de uso genera 73 fotogramas a 24 fps (~3 s de vídeo). Contexto del codificador de texto Qwen3-VL 32B: no disponible |
| Tipos de cuantizacion | Q5_0 publicada (~13 GB). El repositorio base `unsloth/MiniMax-H3-GGUF` ofrece otras cuantizaciones GGUF no detalladas en la información disponible. El codificador de texto se usa en Q4_K_M |
| Idiomas soportados | No disponibles. Los prompts de ejemplo están en inglés y no se documenta el comportamiento multilingüe del modelo de vídeo |
| Licencia | `other` (no se especifican términos; el modelo base remite a la licencia de MiniMax-H3) |
| Formato de pesos | GGUF (modelo de difusión y codificador de texto); VAE de vídeo en safetensors fp16 y VAE de audio en safetensors fp32 |
| Pipeline | text-to-video (etiqueta de HuggingFace); soporta también image-to-video |
| Pasos de inferencia | 8 (Euler) con CFG 1.0 |
| Salida | Vídeo MP4 + audio estéreo nativo sincronizado |
| Modelo base | `unsloth/MiniMax-H3-GGUF`, archivo exacto `minimax_h3_fl2va_pruned-Q5_0.gguf` |
| Adaptador fusionado | MiniMax-H3 8-Step Turbo LoRA (`minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors`) |
| Codificador de texto | `qwen3vl_32b_minimax_h3-Q4_K_M.gguf` (Qwen3-VL 32B cuantizado) |
| Librería / runtime | `minimax-h3`; `stable-diffusion.cpp` (`sd-cli`) y ComfyUI (`UnetLoaderGGUF`) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 19 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo original, MiniMax-H3, es un modelo fundacional omnicanal que genera vídeo y audio estéreo de forma nativa y conjunta, es decir, no se limita a añadir una pista de audio generada por un modelo separado. La variante FL2VA parte de un primer fotograma latente (de ahí su utilidad para image-to-video) y produce el clip junto con su banda sonora. La información proporcionada no detalla el backbone (no se confirma si es un transformer de difusión, un UNet híbrido u otra topología), el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o preferencias; tampoco se documenta el proceso de destilación que dio lugar al LoRA Turbo de 8 pasos.

Lo que sí está documentado es el proceso de derivación de este repositorio concreto: se parte del archivo Q5_0 podado del repositorio de unsloth, se des-cuantiza a FP32, se le suma la contribución del adaptador LoRA calculada como α/r · (B × A) y el resultado se vuelve a cuantizar a Q5_0. La fórmula que publica el autor es W_baked = Quantize_Q5_0(Dequantize(W_base) + (α/r)(B × A)). Es una fusión offline en precisión completa, con una única recuantización final, y no una fusión en el grafo de inferencia. La motivación declarada es doble: reducir de 50 a 8 pasos el coste de muestreo y evitar que la carga dinámica del LoRA provoque fragmentación de memoria o errores de des-cuantización sobre pesos GGUF.

Desde el punto de vista técnico, el "entrenamiento" de este artefacto se limita a esa fusión de matrices; no hay fine-tuning adicional, ni datos nuevos, ni evaluación de fidelidad respecto al par base + LoRA en bf16. El pipeline completo requiere tres artefactos auxiliares que no están incluidos en el GGUF de ~13 GB: el VAE de vídeo en fp16, el VAE de audio en fp32 y el codificador de texto Qwen3-VL 32B en Q4_K_M.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y a partir de un primer fotograma (image-to-video), este último el modo natural de la variante FL2VA.
- Generación simultánea de audio estéreo nativo sincronizado con el vídeo, no una pista añadida a posteriori.
- Muestreo rápido: 8 pasos Euler con CFG 1.0 gracias al LoRA Turbo fusionado, frente a los 50 pasos del flujo estándar.
- Ejecución sin nodo `LoraLoader` en ComfyUI: el adaptador ya está en los pesos, lo que simplifica el grafo.
- Compatibilidad con `stable-diffusion.cpp` mediante el modo `vid_gen` de `sd-cli`, con parámetros de control de fotogramas, fps y escala CFG.
- Soporte de reparto entre varias GPU (dual-GPU splitter en ComfyUI), según la model card.
- Control de la generación mediante prompt textual en inglés; no se documenta soporte de prompt negativo, control de cámara, máscaras ni otras condiciones.
- No se documenta tool calling, function calling, capacidades de agente ni modos de razonamiento: es un modelo generativo de medios, no un LLM conversacional.

## Casos de uso

- **Prototipado rápido de creatividades audiovisuales**: con 8 pasos y CFG 1.0, un equipo de diseño puede generar variantes de un clip de ~3 segundos (73 fotogramas a 24 fps) y evaluar ideas de guion, iluminación y ambiente sonoro antes de invertir en producción. El coste por iteración es bajo precisamente por la reducción de pasos.
- **Animación de fotogramas fijos de producto**: la variante FL2VA permite tomar una fotografía de catálogo como primer fotograma y generar un plano en movimiento con audio de ambiente, útil para fichas de e-commerce y anuncios en redes.
- **Iteración local en ComfyUI con hardware de consumo**: al no necesitar `LoraLoader` ni fusión en runtime, el grafo es más simple y estable en máquinas con dos GPUs de 12 GB, lo que encaja en estudios pequeños que no tienen acceso a A100/H100.
- **Generación de clips de previsualización en pipelines automatizados**: `sd-cli` se puede invocar por línea de comandos desde un script o un job de CI, pasando prompt, número de fotogramas, fps y ruta de salida, lo que permite producir storyboards animados por lotes.
- **Contenido divulgativo y educativo**: clips cortos de ~3 segundos con audio incorporado sirven para ilustrar conceptos en vídeos explicativos, material de clase o presentaciones internas, donde la duración corta es una ventaja y no una limitación.
- **Despliegue on-premise con requisitos de privacidad**: al ser pesos descargables y ejecutarse en local, permite generar material audiovisual sin enviar prompts ni imágenes a una API externa, algo relevante para sectores con datos sensibles.
- **Investigación sobre destilación y fusión de LoRA**: el repositorio es en sí mismo un caso de estudio de "baking" de adaptadores en pesos cuantizados; sirve para comparar la fidelidad de la fusión FP32 + recuantización frente a la carga dinámica del LoRA.
- **Pruebas de concepto de vídeo con audio sincronizado**: para equipos que evalúan si un modelo omnicanal abierto es suficiente antes de adoptar una solución mayor, este GGUF ofrece una barrera de entrada baja en VRAM y en complejidad de pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de calidad visual, coherencia temporal, sincronización audio-vídeo, FVD, CLIPScore ni comparaciones numéricas con otros modelos. El único dato de rendimiento declarado es operativo: 8 pasos de muestreo (Euler) con CFG 1.0 frente a los 50 pasos del flujo estándar, y la afirmación cualitativa de que "funciona con fluidez en GPUs de consumo de 12 GB".

| Metrica | Valor |
|---|---|
| Pasos de muestreo | 8 (Euler), CFG 1.0 |
| Pasos del flujo estándar | 50 |
| Fotogramas por generación (ejemplo) | 73 |
| FPS (ejemplo) | 24 |
| Duración resultante (ejemplo) | ~3 s |
| Calidad visual / FVD / CLIPScore | No disponible |
| Sincronización audio-vídeo | No disponible |
| Latencia medida | No disponible |
| Throughput medido | No disponible |

## Requisitos de hardware

- **VRAM del modelo de difusión**: el archivo Q5_0 ocupa ~13 GB, por lo que no cabe completo en una GPU de 12 GB; requiere reparto entre dos GPUs (el ejemplo del autor es dual RTX 3060 12 GB) o descarga parcial a RAM del sistema.
- **VRAM adicional**: hay que sumar el VAE de vídeo (fp16), el VAE de audio (fp32) y el codificador de texto Qwen3-VL 32B en Q4_K_M, que por sí solo ronda los 19-20 GB en esa cuantización. El consumo agregado del pipeline completo es notablemente superior a los 12 GB que sugiere la model card; conviene planificar en consecuencia.
- **GPU recomendadas**: no hay recomendaciones oficiales más allá del ejemplo de doble RTX 3060 12 GB. Por tamaño, configuraciones con 24 GB o más por GPU (RTX 3090, RTX 4090, A100, H100) permiten mayor comodidad y menos offloading, aunque no se documentan cifras de rendimiento para ellas.
- **¿Cabe en GPU de consumo?**: parcialmente. Con dos GPUs de 12 GB el autor afirma que funciona con fluidez; en una sola GPU de 12 GB el archivo de difusión ya excede la VRAM disponible.
- **Opciones de despliegue**: `stable-diffusion.cpp` (`sd-cli -M vid_gen`) y ComfyUI mediante `UnetLoaderGGUF` con posibilidad de dual-GPU splitter. No se documenta soporte en vLLM, TGI, Ollama ni llama.cpp, que además no son runtimes adecuados para un modelo de difusión de vídeo.
- **Latencia y throughput**: no disponibles. No se publican tiempos por clip, ni tokens/s, ni comparación de tiempo de generación entre 8 y 50 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Duracion / contexto | Pasos | Cuantizacion | VRAM indicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `udero/minimax-h3-turbo-gguf` (esta ficha) | No disponible (~20 000 M estimados por tamano) | 73 fotogramas a 24 fps en el ejemplo (~3 s) | 8 (Turbo fusionado) | Q5_0, ~13 GB | 12 GB por GPU en configuración dual | `other` | 0 descargas, 0 likes |
| `unsloth/MiniMax-H3-GGUF` (base FL2VA Q5_0) | No disponible | No disponible | 50 + LoRA cargado en runtime | Q5_0 y otras GGUF del repositorio | Superior: requiere cargar el LoRA aparte y fusionar en runtime | Segun repositorio base | Repositorio publico de unsloth |
| MiniMax-H3 oficial (sin destilar) | No disponible | No disponible | 50 | No disponible | No disponible | Licencia MiniMax-H3 | No verificada en la informacion disponible |
| Otros modelos abiertos de video con audio (p. ej. familias tipo Wan o LTX) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no es posible con los datos disponibles: no hay benchmarks publicados para este artefacto ni se han recuperado resultados de búsqueda relevantes (la búsqueda web devolvió únicamente páginas de Facebook sin relación con el modelo).

## Limitaciones y advertencias

- **Licencia "other" sin términos explícitos**: la model card no aclara permisos de uso comercial, redistribución ni obra derivada. Cualquier uso en producción exige revisar la licencia del modelo base MiniMax-H3 y del repositorio de unsloth antes de desplegar.
- **Artefacto de terceros sin validación**: 0 descargas y 0 likes en el momento de la ficha, sin evaluación de la comunidad ni verificación independiente de que el "bake" reproduzca fielmente el comportamiento del par base + LoRA en bf16.
- **Posible degradación por doble cuantización**: la fusión se hace en FP32, pero el resultado se recuantiza a Q5_0. No se publican métricas de fidelidad frente al LoRA original, por lo que la pérdida de calidad es desconocida.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede producir artefactos anatómicos (manos, rostros), texto ilegible en pantalla, incoherencias temporales entre fotogramas y deriva de la identidad del sujeto en planos con movimiento.
- **Sincronización audio-vídeo no evaluada**: la promesa de audio estéreo nativo sincronizado no está respaldada por ninguna medición publicada; es esperable que en diálogo la sincronía labial sea imperfecta.
- **Control limitado**: CFG 1.0 y 8 pasos reducen el margen para guiar la generación; no se documenta prompt negativo, control de cámara, máscaras ni otros condicionamientos.
- **Duración corta en el ejemplo**: 73 fotogramas a 24 fps equivalen a unos 3 segundos. No se documenta cuál es el máximo de fotogramas soportado ni cómo se degrada la coerción temporal al aumentarlo.
- **Idioma no documentado**: los prompts del ejemplo están en inglés y no hay información sobre calidad con prompts en castellano u otros idiomas. El codificador Qwen3-VL es multilingüe, pero eso no garantiza el comportamiento del modelo de vídeo.
- **Consumo real mayor que el anunciado**: la afirmación de "12 GB" se refiere a una configuración de dos GPUs; sumando el codificador de texto de 32B en Q4_K_M, el pipeline completo requiere bastante más memoria que el archivo de difusión por sí solo.
- **Sesgos**: no hay información sobre la composición del dataset original ni sobre evaluaciones de sesgo demográfico, cultural o de representación.
- **Sin soporte ni mantenimiento garantizado**: repositorio de un autor individual, sin paper, sin roadmap ni issues documentados en la información disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/udero/minimax-h3-turbo-gguf
- Repositorio base (unsloth): https://huggingface.co/unsloth/MiniMax-H3-GGUF
- Archivo base exacto Q5_0: https://huggingface.co/unsloth/MiniMax-H3-GGUF/blob/main/minimax_h3_fl2va_pruned-Q5_0.gguf
- LoRA Turbo fusionado (`minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors`): referenciado en la model card sin URL directa; no disponible
- Paper, blog o demo oficiales: no disponibles en la información proporcionada
- Repositorio de código del runtime (`stable-diffusion.cpp`): no disponible en la información proporcionada
- Búsqueda web: no devolvió resultados relevantes sobre el modelo (solo páginas de Facebook sin relación)
