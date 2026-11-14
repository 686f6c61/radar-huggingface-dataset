# TeamAIQ/SoulX-FlashHead-1_3B-INT8

## Resumen

SoulX-FlashHead-1_3B-INT8 es una versión cuantizada a INT8 del modelo SoulX-FlashHead-1_3B, desarrollado originalmente por Soul-AILab. Se trata de un modelo de generación de vídeo a partir de imagen (image-to-video) basado en una arquitectura DiT (Diffusion Transformer) del ecosistema Wan, empaquetado para su uso con la librería diffusers. La cuantización la ha realizado el equipo TeamAIQ mediante Optimum Quanto en su variante INT8 para el transformer DiT, y el resultado se ha serializado en formato SafeTensors.

El modelo resuelve la tarea de animar una imagen estática generando una secuencia de vídeo coherente, un caso de uso relevante para creación de contenido, avatares y pipelines de producción audiovisual. La versión INT8 busca reducir el peso en memoria y el coste de inferencia respecto al modelo base en precisión completa, manteniendo el componente de alta calidad ("Model_Pro") del modelo original.

La información pública disponible es escasa: la model card se limita a describir el proceso de cuantización y no aporta detalles sobre arquitectura interna, datos de entrenamiento, idiomas ni licencia. El repositorio ocupa 9,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) del ecosistema Wan; pipeline image-to-video (WanModelAudioProject) |
| Parametros totales | 1,3 B (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (pesos de 8 bits) mediante Optimum Quanto; solo el componente DiT Transformer |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base SoulX-FlashHead-1_3B emplea una arquitectura DiT (Diffusion Transformer) integrada en el ecosistema Wan, orientada a la generación de vídeo condicionada por imagen. La versión INT8 conserva esa arquitectura y cuantiza únicamente el transformer DiT (componente "Model_Pro", la variante de alta calidad) con Optimum Quanto en precisión de 8 bits, dejando el resto de componentes del pipeline en su precisión original. El pipeline asociado en diffusers es `WanModelAudioProject`, lo que sugiere un condicionamiento adicional por audio en el proceso de generación.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de ajuste. Tampoco se documentan innovaciones técnicas específicas más allá de la propia cuantización INT8 del DiT.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video).
- Animación de retratos o cabezas ("FlashHead") con coherencia temporal, a tenor del nombre del modelo.
- Condicionamiento por audio en el pipeline (`WanModelAudioProject`), orientado probablemente a síntesis de habla con movimiento labial.
- Inferencia con pesos cuantizados a INT8 para reducir huella de memoria.
- Integración con la librería diffusers y carga mediante `snapshot_download` de huggingface_hub.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni multilingüismo textual, al ser un modelo generativo de vídeo.

## Casos de uso

- Generación de avatares parlantes: el modelo puede animar un retrato estático sincronizando movimiento facial con una pista de audio, adecuado para asistentes virtuales y presentadores digitales.
- Creación de contenido para redes sociales: a partir de una foto se genera un clip corto animado, reduciendo el coste frente a producción audiovisual tradicional.
- Prototipado rápido en estudios de animación: los artistas pueden previsualizar movimientos y expresiones antes de pasar a producción final.
- Sistemas de atención al cliente con agente visual: combinado con un TTS, permite generar respuestas en vídeo de un personaje corporativo con latencia contenida gracias a la cuantización INT8.
- Educación y formación: generación de material didáctico animado a partir de ilustraciones e instrucciones de audio.
- Investigación en generación de vídeo: la versión INT8 sirve como referencia para estudiar el impacto de la cuantización en la calidad de vídeo generado frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,8 GB en disco; con pesos INT8 del DiT y el resto del pipeline en precisión original, se estima un consumo de VRAM en el rango de 10-16 GB, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: no disponible de forma oficial; por tamaño, cabría esperar compatibilidad con GPUs de 16 GB o más (RTX 4080, RTX 4090, A100, H100).
- GPU de consumo: probablemente cabe en una RTX 4090 (24 GB) y posiblemente en una RTX 4080 (16 GB), sujeto a verificación empírica.
- Opciones de despliegue: diffusers (librería declarada), con posible integración en pipelines de huggingface_hub; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TeamAIQ/SoulX-FlashHead-1_3B-INT8 | 1,3 B | DiT image-to-video | INT8 | no disponible | Hugging Face |
| Soul-AILab/SoulX-FlashHead-1_3B | 1,3 B | DiT image-to-video | FP (base) | no disponible | Hugging Face |
| Alternativas de la familia Wan | no disponible | DiT image-to-video | variable | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La model card no especifica licencia; no se puede confirmar el uso comercial sin consultar al autor del modelo base.
- No se documentan sesgos conocidos, pero al ser un modelo generativo de vídeo entrenado con datos no especificados, puede reproducir sesgos de representación facial y demográficos.
- Riesgo de artefactos y alucinaciones visuales, habitual en modelos de difusión de vídeo, especialmente en movimientos rápidos o ángulos poco frecuentes.
- La cuantización INT8 puede degradar la calidad respecto al modelo base en FP; no se han publicado métricas comparativas.
- No se documentan idiomas soportados ni limitaciones de contexto.
- El repositorio no registra descargas ni validación comunitaria, lo que reduce la fiabilidad de uso en producción sin pruebas propias.
- La fecha de creación indicada (2026-11-14) es futura respecto a la fecha habitual de consulta, lo que conviene verificar.

## Enlaces

- Hugging Face (versión INT8): https://huggingface.co/TeamAIQ/SoulX-FlashHead-1_3B-INT8
- Modelo base: https://huggingface.co/Soul-AILab/SoulX-FlashHead-1_3B
- Perfil del autor: https://huggingface.co/TeamAIQ
- AIQUEST Academy: https://aiquest.site
- YouTube de AIQUEST Academy: https://www.youtube.com/@aiquestacademy
- X de AIQUEST Academy: https://x.com/aiquestacademy
