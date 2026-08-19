# Stuubs/10eros_Max_Ref2va

## Resumen

El repositorio `Stuubs/10eros_Max_Ref2va` contiene versiones comunitarias del fine-tune `10Eros_Max` (beta2) de TenStrip, adaptado al checkpoint **ref2va** (reference-to-video-audio) del modelo MiniMax-H3. Se trata de un modelo de generación de vídeo y audio a partir de imágenes de referencia, que combina la arquitectura de MiniMax-H3 con los patrones estilísticos del fine-tune original. El repo ofrece tres variantes: dos cuantizadas en int8 (nativa y transplant) y una en bf16, todas en formato safetensors. No se realizó ningún entrenamiento nuevo; el trabajo consiste en la regraft del fine-tune sobre el checkpoint ref2va y su cuantización mediante el quantizador `TensorWiseINT8Layout` de ComfyUI.

La relevancia actual radica en que permite usar el fine-tune `10Eros_Max` en el pipeline ref2va de MiniMax-H3, que soporta composición multi-imagen y referencia compleja, a diferencia del checkpoint FL2VA original. El autor del repo, Stuubs, aclara que todo el crédito creativo pertenece a TenStrip, y que la licencia es la MiniMax H3 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (modelo de video-audio, no se detallan componentes internos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (aplica a generacion de video, no a texto) |
| Tipos de cuantizacion | int8 (convrot, groupsize 256), bf16 |
| Idiomas soportados | no disponible (el prompt probablemente soporta ingles y chino, segun MiniMax-H3) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (archivos individuales: int8 ~21 GB, bf16 ~40 GB) |

## Arquitectura y entrenamiento

MiniMax-H3 es un modelo de generación de vídeo y audio que utiliza un text encoder basado en Qwen3-VL truncado, junto con VAEs de vídeo y audio. El checkpoint ref2va añade condicionamiento por referencia (imágenes de entrada) para guiar la generación. El fine-tune `10Eros_Max` de TenStrip introduce patrones de modelos donantes (LTX, Wan, Krea) que no tienen condicionamiento por frame, por lo que al injertarlo en ref2va se diluye ligeramente la precisión de seguimiento de referencia por frame. El repo ofrece dos métodos de integración: el **nativo** (regraft oficial de TenStrip sobre ref2va) y el **transplant** (diff de pesos del fine-tune FL2VA aplicado al ref2va con fuerza 0.80). No se realizó entrenamiento adicional; solo cuantización y transferencia de pesos.

La cuantización int8 usa el quantizador `TensorWiseINT8Layout` de ComfyUI con rotación de Hadamard por grupos de 256, y se calibró contra el archivo oficial `minimax_h3_ref2va_pruned_int8_convrot` con un 100% de elementos dentro de ±1 paso de cuantización.

## Capacidades

- Generación de vídeo y audio a partir de una o varias imágenes de referencia (ref2va).
- Composición multi-imagen y escenarios I2V complejos (image-to-video con múltiples referencias).
- Soporte de prompting en formato de seis secciones Full-Reference definido en el repo MiniMax-H3.
- Carga nativa en ComfyUI mediante los loaders estándar de H3, sin nodos personalizados ni LoRA.
- Compatibilidad con el pipeline de cuantización int8 nativo de ComfyUI (`comfy_quant`).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de vídeo.

## Casos de uso

- **Generación de vídeo con referencia a personajes o escenarios**: el modelo puede tomar una imagen de referencia (por ejemplo, un personaje o un entorno) y generar un clip de vídeo coherente con esa referencia, útil para creadores de contenido que necesitan mantener consistencia visual.
- **Composición multi-imagen**: gracias al soporte ref2va, se pueden combinar varias imágenes de referencia para crear escenas complejas, como un vídeo que integra un objeto de una foto y un fondo de otra.
- **Edición de vídeo con reskin**: aunque la precisión por frame se reduce ligeramente, el modelo permite reestilizar vídeos existentes aplicando patrones visuales del fine-tune 10Eros_Max, útil para efectos artísticos o cambios de ambientación.
- **Prototipado rápido en producción audiovisual**: los archivos int8 (~21 GB) permiten iterar en hardware de gama media (GPUs con 24 GB de VRAM) sin necesidad de nodos dedicados, acelerando el desarrollo de conceptos visuales.
- **Investigación en generación de vídeo condicionada por referencia**: el repo documenta dos enfoques de integración (nativo vs. transplant) y su impacto en la precisión de referencia, lo que sirve como caso de estudio para técnicas de transferencia de pesos en modelos generativos.
- **Auditoría de calidad de audio**: la model card advierte que se debe verificar el audio generado, por lo que el modelo es adecuado para pruebas donde el audio no es crítico o donde se planea una post-producción de sonido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una reducción subjetiva de la precisión de referencia por frame en ambas variantes, pero no proporciona métricas cuantitativas.

## Requisitos de hardware

- **VRAM estimada**: los archivos int8 pesan ~21 GB, lo que sugiere que se necesitan al menos 24 GB de VRAM para cargar el modelo en memoria (por ejemplo, una RTX 4090 o A6000). El archivo bf16 (~40 GB) requeriría al menos 48 GB (A6000, A100, o múltiples GPUs).
- **GPU recomendadas**: RTX 4090 (24 GB) para int8, A100 40/80 GB o H100 para bf16.
- **Compatibilidad con consumer GPU**: sí, la variante int8 puede ejecutarse en GPUs de consumo con 24 GB de VRAM, aunque la generación de vídeo puede ser lenta.
- **Opciones de despliegue**: ComfyUI con los loaders estándar de H3; no se menciona soporte para vLLM, llama.cpp u Ollama (al ser un modelo de vídeo, no de texto).
- **Latencia y throughput**: no disponible; depende de la GPU y de la resolución/duración del vídeo generado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño (aprox.) | Referencia | Licencia |
|---|---|---|---|---|
| MiniMax-H3 ref2va (base) | Video-audio | ~40 GB bf16 | Sí | Community |
| 10Eros_Max (FL2VA) | Video-audio | ~40 GB bf16 | No (solo FL2VA) | Community |
| 10Eros_Max Ref2va (este repo) | Video-audio | 21 GB int8 / 40 GB bf16 | Sí (con pérdida leve) | Community |

La comparativa con otros modelos de vídeo (Wan, LTX, Krea) no está disponible en la información proporcionada; la model card solo menciona que los patrones de esos modelos se injertaron en el fine-tune, pero no ofrece métricas comparativas.

## Limitaciones y advertencias

- **Precisión de referencia reducida**: ambas variantes (nativa y transplant) presentan una ligera pérdida de seguimiento de referencia por frame frente al ref2va base, debido a la naturaleza del fine-tune.
- **Estado experimental**: beta2 es un experimento activo de TenStrip y puede ser superado por versiones posteriores.
- **Calidad de audio no garantizada**: la model card advierte que se debe verificar el audio generado en contenido propio.
- **Licencia restrictiva**: la MiniMax H3 Community License puede limitar el uso comercial; es necesario revisar los términos exactos del acuerdo.
- **Requisitos de hardware elevados**: incluso la versión int8 requiere al menos 24 GB de VRAM, lo que excluye GPUs de consumo antiguas.
- **Sin soporte para otros pipelines**: el modelo solo funciona con el stack H3 en ComfyUI; no hay integraciones con otras herramientas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Stuubs/10eros_Max_Ref2va
- Fine-tune original de TenStrip: https://huggingface.co/TenStrip/10Eros-Max
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Documentación de Ref2VA en GitHub: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/Ref2VA
- Guía de archivos y descargas de MiniMax H3: https://minimaxh3.run/minimax-h3-model-files-downloads
- Hub comunitario de MiniMax-H3: https://github.com/ai-models-lab/minimax-h3
