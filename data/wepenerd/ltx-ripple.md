# WepeNerd/LTX-Ripple

## Resumen

LTX Ripple es una LoRA de edición de vídeo desarrollada por WepeNerd sobre el modelo base LTX-2.5 de Lightricks. Su propuesta es el enfoque "First Frame All Frames" (FFAF): el usuario edita o reemplaza el primer fotograma de un vídeo con cualquier herramienta de edición de imagen, y la LoRA propaga ese cambio de forma contextual al resto de la secuencia, manteniendo el movimiento, la cámara y la composición originales. Esto convierte a LTX-2.5 en un sistema de edición de vídeo tan flexible como un editor de imágenes, sin necesidad de prompts complejos ni de regenerar el vídeo completo.

La relevancia de este modelo radica en que resuelve un problema práctico de la edición de vídeo generativa: la coherencia temporal de ediciones locales. En lugar de describir con texto el cambio deseado, el usuario lo materializa visualmente en el primer fotograma y la LoRA se encarga de propagarlo. El repositorio pesa 0,7 GB, se distribuye en formato safetensors y se integra exclusivamente en el ecosistema ComfyUI mediante el nodo ComfyUI-LTXVideo. La licencia es la LTX-2.x Community License Agreement, derivada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adaptadora (IC-LoRA) sobre LTX-2.5, un diffusion transformer (DiT) |
| Parametros totales | no disponible (repo de 0,7 GB en safetensors) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene un unico safetensors en precision nativa) |
| Idiomas soportados | no disponible (el prompting se realiza en ingles en el workflow de ejemplo) |
| Licencia | LTX-2.x Community License Agreement |
| Formato de pesos | safetensors (LTX25_Ripple_v11.safetensors) |

## Arquitectura y entrenamiento

LTX Ripple es una LoRA de tipo IC-LoRA (Image-Conditioned LoRA) entrenada como adaptador del modelo LTX-2.5 de Lightricks, que a su vez es un diffusion transformer (DiT) diseñado para generación y edición de vídeo. La LoRA no modifica la arquitectura del modelo base, sino que inyecta pesos de bajo rango en las capas de atención y feed-forward del DiT para condicionar la generación a la información visual del primer fotograma editado.

El mecanismo FFAF funciona de la siguiente manera: el primer fotograma editado actúa como señal de control dominante, y la LoRA aprende a interpretar qué cambio se ha realizado (iluminación, objeto, material, fondo, etc.) y a propagarlo al resto de fotogramas respetando el flujo óptico, el movimiento de cámara y la composición del vídeo original. El entrenamiento se realizó sobre LTX-2.5, que incorpora generación multishot nativa y un checkpoint preentrenado orientado a fine-tuning por dominio. No se han publicado detalles sobre el dataset de entrenamiento, el número de pasos ni el método de alineación (RLHF, DPO, etc.).

## Capacidades

- Edición de vídeo por propagación de primer fotograma: el cambio realizado en el frame inicial se extiende al resto de la secuencia de forma coherente.
- Funciona sin prompt: la LoRA puede propagar la edición sin necesidad de descripción textual, aunque un prompt breve mejora la consistencia en ediciones complejas.
- Cambio de iluminación y hora del día: puede alterar fuentes de luz y hacer que la escena reaccione a las nuevas condiciones lumínicas.
- Adición, eliminación o reemplazo de objetos: el objeto editado en el primer fotograma se mantiene consistente a lo largo del vídeo, incluso con cortes de cámara.
- Re-texturizado 3D y archviz: permite texturizar modelos 3D en clay o sin textura a partir de un primer fotograma texturizado, propagando el efecto a través de los cortes de escena.
- Cambio de estilo, fondo y condiciones meteorológicas: la edición del primer fotograma se propaga manteniendo el movimiento original.
- Reemplazo de títulos y logotipos: útil para branding y postproducción.
- Ajuste de nitidez o desenfoque: si el primer fotograma editado es más nítido, el efecto se propaga al vídeo completo.
- Integración con ComfyUI: se carga como LoRA estándar en el nodo de LoRAs de ComfyUI y se usa con el workflow de ejemplo incluido.

## Casos de uso

- Postproducción de vídeo para publicidad: un editor puede reemplazar el logotipo o el título de un vídeo corporativo editando únicamente el primer fotograma, y la LoRA propaga el cambio manteniendo el movimiento de cámara original, evitando re-renderizados completos.
- Re-texturizado de modelos 3D para arquitectura (archviz): con un vídeo de un modelo 3D sin textura y un primer fotograma texturizado, la LoRA aplica el material a toda la secuencia, incluso con cortes de escena, acelerando la presentación de proyectos.
- Cambio de iluminación en escenas de producto: un estudio puede modificar la hora del día o la fuente de luz de un vídeo editando el primer fotograma, y la escena reacciona de forma realista a las nuevas luces.
- Efectos especiales en cine independiente: añadir fuego, líquidos u otros efectos al primer fotograma y dejar que la LoRA los propague con coherencia física, como el flujo de un líquido dentro de un vaso según el movimiento del vídeo original.
- Cambio de vestuario o atributos de personaje: en producción de vídeo, modificar la ropa o características de un actor editando el primer fotograma, manteniendo la actuación y el movimiento intactos.
- Restauración y mejora de vídeo: si el primer fotograma se restaura o afina, la LoRA propaga la nitidez al resto de la secuencia, útil para material de archivo.
- Generación de variantes de estilo para redes sociales: cambiar el estilo visual completo de un vídeo (por ejemplo, a acuarela o a claymation) editando un solo fotograma, sin necesidad de prompts elaborados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas cuantitativas (FVD, CLIP score, LPIPS, etc.) ni comparaciones con otras LoRAs de edición de vídeo. La evaluación se presenta únicamente mediante ejemplos cualitativos en vídeo incluidos en la model card.

## Requisitos de hardware

- La LoRA en sí ocupa 0,7 GB en disco, pero requiere el modelo base LTX-2.5 completo para funcionar, por lo que la VRAM necesaria es la del pipeline completo.
- El workflow de ejemplo referencia los siguientes componentes: modelo de difusión LTX-2.5, VAE de vídeo en bf16, VAE de audio en bf16 y el text encoder Gemma 4 12B en int8 con proyección para ComfyUI.
- Con el text encoder Gemma 4 12B cuantizado a int8, se estima un consumo de VRAM de al menos 16-24 GB, lo que permite ejecución en GPUs como RTX 4090, A100 o H100.
- En GPUs de consumo con 8-12 GB de VRAM, la ejecución puede ser posible con cuantizaciones adicionales del modelo base, aunque no está documentado por el autor.
- Despliegue: exclusivamente a través de ComfyUI con el nodo ComfyUI-LTXVideo. No se proporcionan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de vídeo, no de lenguaje.
- La latencia y el throughput dependen del checkpoint de LTX-2.5, la resolución, el número de fotogramas y los ajustes del sampler; no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. LTX Ripple es una LoRA específica para LTX-2.5, y no se han publicado comparaciones con otras LoRAs de edición de vídeo como las de modelos AnimateDiff, Stable Video Diffusion o Kling. La comparativa con alternativas de la misma categoría queda pendiente de datos públicos.

## Limitaciones y advertencias

- El primer fotograma es la señal de control clave: si la edición no es clara o coherente, la propagación fallará.
- Cambios muy grandes, oclusiones severas, movimiento rápido o contenido ausente en el vídeo original pueden reducir la consistencia temporal.
- La LoRA depende completamente del checkpoint LTX-2.5, la resolución, el número de fotogramas, los ajustes del sampler y el hardware disponible; los resultados varían según la configuración.
- La licencia LTX-2.x Community License Agreement impone restricciones de uso, modificación y redistribución; es obligatorio revisar también la LTX Acceptable Use Policy de Lightricks antes de uso comercial.
- No se documentan sesgos específicos del modelo, pero al ser un adaptador sobre LTX-2.5, hereda los sesgos y limitaciones del modelo base.
- Riesgo de alucinación visual: en ediciones complejas, la LoRA puede introducir artefactos o contenido no deseado en fotogramas intermedios.
- El prompting es opcional pero recomendado para ediciones difíciles; el workflow de ejemplo usa un prompt fijo en inglés, y no se garantiza soporte multilingüe.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WepeNerd/LTX-Ripple
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2.x Community License Agreement: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- LTX Acceptable Use Policy: https://static.lightricks.com/legal/ltx-acceptable-use-policy.pdf
- Ecosistema ComfyUI-LTXVideo: https://github.com/Lightricks/ComfyUI-LTXVideo
- Página oficial del modelo LTX: https://ltx.io/model/video-generation-model
- Página de LTX-2.5 open source: https://ltx.io/model/open-source
- Perfil del autor: https://huggingface.co/WepeNerd
