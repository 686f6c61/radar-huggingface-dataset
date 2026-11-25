# Terrygmx/Sulphur-3

## Resumen

Sulphur 3 es un modelo de generación de vídeo presentado como un ajuste fino (finetune) del modelo MiniMax H3 de MiniMaxAI, publicado por el usuario Terrygmx en Hugging Face. Se distribuye como un checkpoint de pesos completos en formato `safetensors` (`s3.safetensors`), junto con variantes opcionales como `s3_raw` (sin la LoRA de RL), una LoRA independiente (`s3_raw_lora.safetensors`) y un "corrector" opcional con nodos y workflow para ComfyUI. El autor lo describe explícitamente como un modelo de generación de vídeo "sin censura" (uncensored).

El modelo se apoya en la librería `minimax-h3` y hereda la licencia comunitaria de MiniMax H3 (MiniMax H3 Community License), que restringe el uso comercial según los términos del fichero `LICENSE` del repositorio. El tamaño del repositorio es de 276,5 GB, lo que refleja la escala típica de un modelo de vídeo con pesos completos y múltiples variantes.

La información pública disponible es muy limitada: la model card no documenta arquitectura interna, número de parámetros, longitud de contexto, idiomas ni resultados de benchmarks. La relevancia actual del modelo reside en su condición de finetune comunitario sin censura sobre una base de generación de vídeo, un nicho donde las alternativas abiertas son escasas, pero debe evaluarse con cautela por la ausencia de datos técnicos verificables y por las restricciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de vídeo; base MiniMax H3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | variantes cuantizadas de menor VRAM incluidas en `quantized/` (tipos concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (`minimax-h3-community-license`) |
| Formato de pesos | safetensors (`s3.safetensors`, `s3_raw.safetensors`, `s3_ref2va.safetensors`, `s3_raw_lora.safetensors`, `s3_corrector.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniMax H3 ni sobre la del finetune. La model card no detalla el tipo de red (difusión, transformer de vídeo u otra), el número de parámetros, la composición del dataset de entrenamiento ni el volumen de tokens o fotogramas utilizados.

El autor indica que Sulphur 3 se construye sobre MiniMax H3 mediante un ajuste fino que incorpora una LoRA de RL: la variante `s3_raw.safetensors` corresponde al modelo sin dicha LoRA, y `s3_raw_lora.safetensors` expone esa LoRA de forma independiente. También se incluye una variante `s3_ref2va` que, según la model card, no ha sido entrenada. No se documentan innovaciones técnicas adicionales, datos de preentrenamiento ni procesos de alineación más allá de la mencionada LoRA de RL.

## Capacidades

- Generación de vídeo a partir de indicaciones (el autor lo describe como modelo de generación de vídeo).
- Variante "sin censura" (uncensored), orientada a reducir las restricciones de contenido del modelo base.
- Checkpoint principal `s3.safetensors` ejecutable "como cualquier modelo MiniMax H3 normal".
- Corrector opcional (`s3_corrector.safetensors`) con nodos y workflow para ComfyUI (`S3_ComfyUI.zip`), compatible también con otros modelos H3.
- Variante Ref2VA (`s3_ref2va.safetensors`) incluida pero no entrenada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- Generación de clips de vídeo en flujos ComfyUI: el modelo se integra como checkpoint en ComfyUI y, con el corrector opcional y el workflow `S3_ComfyUI.zip`, permite montar un pipeline de generación de vídeo por indicaciones dentro de la interfaz.
- Prototipado de vídeo creativo sin restricciones temáticas: al presentarse como uncensored, encaja en experimentación artística o de investigación donde el modelo base aplica filtros de contenido más estrictos.
- Investigación sobre finetunes de modelos de vídeo: la separación entre `s3`, `s3_raw` y la LoRA de RL permite estudiar el efecto del ajuste por RL sobre el comportamiento del modelo base.
- Evaluación comparativa de checkpoints derivados de MiniMax H3: el autor recomienda merges de terceros (por ejemplo, TenStrip), lo que facilita comparar variantes sobre la misma base.
- Despliegue en entornos con VRAM limitada: las variantes en `quantized/` permiten probar el modelo en hardware más modesto que el requerido por los pesos completos.
- Reutilización del corrector en otros modelos H3: `s3_corrector.safetensors` y sus nodos de ComfyUI pueden aplicarse a checkpoints H3 distintos de Sulphur 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 276,5 GB e incluye pesos completos y variantes; el checkpoint principal `s3.safetensors` requiere almacenamiento y VRAM acordes a un modelo de vídeo de gran tamaño (cifra exacta no disponible).
- El autor ofrece variantes de menor VRAM en `quantized/`, pensadas para hardware con menos memoria; no se especifican los niveles de cuantización ni los requisitos exactos.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende de la variante cuantizada utilizada.
- Opciones de despliegue: ComfyUI (con nodos y workflow propios para el corrector) y la librería `minimax-h3`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sulphur 3 | MiniMax H3 | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (`Terrygmx/Sulphur-3`) |
| MiniMax H3 | — | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (`MiniMaxAI/MiniMax-H3`) |
| Merges de TenStrip | MiniMax H3 | no disponible | no disponible | no disponible | Hugging Face (`TenStrip`) |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay datos de arquitectura, parámetros, contexto, idiomas ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Modelo marcado como "uncensored": puede generar contenido no apto para todos los públicos y aumenta el riesgo de usos indebidos; requiere moderación en producción.
- Riesgo de alucinación y de artefactos propios de la generación de vídeo (inconsistencias temporales, deformaciones), no cuantificado por el autor.
- La variante `s3_ref2va` no ha sido entrenada según la model card; no debe usarse como modelo principal.
- Los ficheros en `experimental/` son de carácter exploratorio y el propio autor recomienda ignorarlos.
- Licencia MiniMax H3 Community License: es una licencia "other" con posibles restricciones para uso comercial; deben revisarse los términos del fichero `LICENSE` antes de cualquier despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Fecha de creación y actualización idénticas (2026-11-24), sin historial de revisiones que permita evaluar su mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Terrygmx/Sulphur-3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor en X: https://x.com/FusionCow11
- Discord del autor: https://discord.gg/C3d56f39Ah
- Merges recomendados por el autor (TenStrip): https://huggingface.co/TenStrip
