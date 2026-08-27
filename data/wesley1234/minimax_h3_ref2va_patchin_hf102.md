# Wesley1234/minimax_h3_ref2va_patchin_hf102

## Resumen

El modelo `Wesley1234/minimax_h3_ref2va_patchin_hf102` es un checkpoint experimental de difusión de vídeo con audio sincronizado, derivado del modelo MiniMax-H3 Ref2VA y del repack INT8 ConvRot publicado por Comfy-Org. Lo desarrolla un usuario independiente (Wesley1234) y no es una versión oficial de MiniMax. Su propósito es probar una modificación concreta de pesos: aumentar en un 2 % la ganancia de los componentes espaciales de alta frecuencia en la proyección de entrada de los parches de vídeo, con la esperanza de reducir el efecto de "aspecto aceitoso" o "ceroso" que algunos usuarios observan en las salidas de Ref2VA. El autor advierte explícitamente de que se trata de un experimento A/B y que no hay confirmación visual de mejora.

El checkpoint se distribuye como un único archivo safetensors de aproximadamente 31,70 GiB, con precisión INT8 ConvRot heredada del repack fuente. No se ha realizado ningún entrenamiento, fine-tuning ni destilación; solo se ha modificado el tensor `video_patch_proj.weight`. El modelo está pensado para usarse en ComfyUI con el flujo de trabajo Ref2VA/R2V. La licencia es la MiniMax H3 Community License Agreement, que impone restricciones territoriales y condiciones de redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (difusión de vídeo y audio, variante Ref2VA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no LLM) |
| Tipos de cuantizacion | INT8 ConvRot (heredado del repack de Comfy-Org) |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (single-file) |

## Arquitectura y entrenamiento

El modelo se basa en MiniMax-H3, un sistema de difusión que genera vídeo y audio sincronizados a partir de una imagen de referencia y un prompt de texto (pipeline `image-text-to-video`). La variante Ref2VA (reference-to-audio-video) toma una referencia visual y produce una secuencia audiovisual coherente. Los latentes de vídeo se procesan mediante un parcheo de tamaño 1×2×2, y la modificación introducida en este checkpoint afecta únicamente a la proyección de entrada de esos parches (`video_patch_proj.weight`).

La intervención consiste en aplicar una transformada de Haar ortonormal 2×2 sobre las cuatro columnas espaciales de entrada de cada canal latente. El componente DC (común) se mantiene con ganancia 1,00, mientras que los tres componentes no-DC (horizontal, vertical y diagonal) se multiplican por 1,02. El resultado se transforma de vuelta y se escribe en la proyección. No se han modificado ni la cabeza de salida, ni el tensor de audio, ni el bloque Transformer compartido, ni el VAE, ni el codificador de texto. No se ha realizado ningún entrenamiento; el autor documenta la operación quirúrgica en un registro JSON (`evidence/surgery.json`).

## Capacidades

- Generación de vídeo con audio sincronizado a partir de una imagen de referencia y un prompt de texto (Ref2VA).
- Integración con ComfyUI mediante el nodo **Load Diffusion Model** y el flujo de trabajo oficial `video_minimax_h3_r2v.json`.
- Soporte de entrada multimodal: imagen + texto (no es un modelo de lenguaje, no admite tool calling ni agentes).
- Multilingüe limitado a inglés y chino (según la etiqueta `language`).
- Precisión INT8 ConvRot nativa, que reduce el uso de memoria frente a FP16 sin cambios en la estructura de tensores.
- Capacidad de comparación A/B con el checkpoint original de Comfy-Org manteniendo idénticas semillas, prompts y parámetros de muestreo.

## Casos de uso

- Evaluación experimental de calidad visual: el caso principal es comparar este checkpoint contra `minimax_h3_ref2va_int8_convrot.safetensors` en un protocolo A/B controlado, manteniendo fijos seed, prompt, dimensiones, sampler y VAEs, para comprobar si el aumento de alta frecuencia reduce el efecto "oil/wax" en piel, cabello o tejidos.
- Investigación sobre modificación de pesos en modelos de difusión: sirve como caso de estudio de cómo una intervención mínima en una proyección de entrada afecta a la salida final, útil para quienes estudian interpretabilidad o ajuste fino de representaciones internas.
- Generación de vídeo con referencia en entornos ComfyUI: puede usarse como alternativa experimental al checkpoint original en flujos de trabajo Ref2VA, siempre que se acepte el riesgo de que no haya mejora perceptible.
- Pruebas de integración de INT8 ConvRot: al heredar el contenedor INT8, permite validar la compatibilidad de este formato con diferentes configuraciones de hardware y versiones de ComfyUI.
- Reproducibilidad de experimentos: el autor publica el registro de la cirugía de pesos y los hashes SHA-256, lo que permite verificar la integridad del archivo y reproducir exactamente la modificación.
- Desarrollo de flujos de trabajo de vídeo con audio sincronizado: puede integrarse en pipelines de generación de contenido audiovisual donde se requiera una referencia visual y se quiera probar una variante de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que en dos pruebas fijas de condiciones se observó una ganancia positiva muy débil en un proxy de alta frecuencia de la piel, pero que no se confirmó visualmente la eliminación del efecto aceitoso o ceroso. No hay métricas cuantitativas (FID, CLIP score, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU recomendadas en la información disponible.
- El archivo pesa 34 038 894 550 bytes (~31,70 GiB), por lo que se requiere una GPU con al menos 32 GiB de VRAM para cargar el modelo en memoria, y probablemente más para la inferencia con el VAE y el codificador de texto.
- Dado el tamaño y el formato INT8 ConvRot, es plausible que funcione en GPUs de gama alta como RTX 4090 (24 GiB) con offloading o en A100/H100 (40/80 GiB), pero no hay confirmación del autor.
- El despliegue está orientado a ComfyUI con soporte nativo de MiniMax-H3 e INT8 ConvRot; no se mencionan otros runners como vLLM u Ollama, que no son aplicables a modelos de difusión.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tamaño | Precisión | Modificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMaxAI/MiniMax-H3 (oficial) | no disponible | no especificada | Original | MiniMax H3 Community License | HuggingFace |
| Comfy-Org/MiniMax-H3 (repack INT8 ConvRot) | 34 038 894 550 bytes | INT8 ConvRot | Repack para ComfyUI | MiniMax H3 Community License | HuggingFace |
| Wesley1234/minimax_h3_ref2va_patchin_hf102 | 34 038 894 550 bytes | INT8 ConvRot | Ganancia 1,02 en alta frecuencia de `video_patch_proj.weight` | MiniMax H3 Community License | HuggingFace |

No hay datos de rendimiento comparativo entre estos modelos. El checkpoint de Wesley1234 es una derivación directa del repack de Comfy-Org, con la única diferencia del tensor modificado.

## Limitaciones y advertencias

- Es un modelo experimental y no oficial; el autor advierte que no es una solución probada para eliminar el efecto "oil/wax" y que el checkpoint original sigue siendo la opción recomendada.
- No se ha realizado ningún entrenamiento, por lo que no puede corregir defectos que el modelo base no genere; la modificación solo altera la proyección de entrada, no la capacidad generativa subyacente.
- La licencia MiniMax H3 Community License Agreement impone restricciones territoriales (territorios excluidos) y condiciones de redistribución obligatorias. Antes de publicar o redistribuir este derivado, hay que incluir el `LICENSE` oficial, el aviso de modificación y el `NOTICE`, y verificar que el método de distribución y la audiencia están autorizados. Un repositorio público en HuggingFace puede ser accesible desde territorios excluidos; un gate de repositorio no equivale necesariamente a control de acceso geográfico.
- No hay datos sobre sesgos, alucinaciones o limitaciones de contexto, ya que no es un modelo de lenguaje y no se han realizado evaluaciones de sesgo.
- El uso en producción no está recomendado sin una validación exhaustiva, dado su carácter experimental y la falta de benchmarks.
- El modelo solo soporta inglés y chino en cuanto a idiomas de prompt; no se garantiza el funcionamiento con otros idiomas.

## Enlaces

- [HuggingFace: Wesley1234/minimax_h3_ref2va_patchin_hf102](https://huggingface.co/Wesley1234/minimax_h3_ref2va_patchin_hf102)
- [HuggingFace: Comfy-Org/MiniMax-H3 (repack fuente)](https://huggingface.co/Comfy-Org/MiniMax-H3)
- [HuggingFace: MiniMaxAI/MiniMax-H3 (modelo base)](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [GitHub: MiniMax-AI/MiniMax-H3](https://github.com/MiniMax-AI/MiniMax-H3)
- [GitHub: MiniMax-H3/Ref2VA](https://github.com/MiniMax-AI/MiniMax-H3/tree/main/Ref2VA)
- [ComfyUI workflow template: video_minimax_h3_r2v.json](https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json)
- [Licencia MiniMax H3 Community License Agreement](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)
