# uniuyuni/nagi_sharpen

## Resumen

`nagi_sharpen` es un modelo de restauración de imágenes especializado en la corrección de desenfoque por desenfoque (defocus) y enfoque suave (soft-focus), desarrollado por el usuario `uniuyuni`. Se distribuye como un conjunto de checkpoints de PyTorch en HuggingFace, mientras que el código fuente reside en un repositorio de GitHub. El modelo aborda el problema de imágenes con desenfoque óptico causado por una apertura o distancia focal incorrecta, común en fotografía, y ofrece una solución de restauración que preserva los detalles nítidos.

La herramienta emplea un enfoque de procesamiento por teselas (tiled) con memoria limitada, lo que permite trabajar con imágenes de alta resolución en hardware con restricciones de VRAM. Los checkpoints se organizan en etapas (stages) que reflejan la evolución del entrenamiento, desde experimentos iniciales hasta refinamientos finales recomendados para uso general. El modelo fue entrenado sobre el dataset DPDD (Defocus Deblurring Using Dual-Pixel Data) y sobre datos sintéticos generados a partir de sus objetivos nítidos, lo que le confiere capacidad para manejar tanto desenfoque real como simulado.

La relevancia actual de `nagi_sharpen` radica en su licencia Apache 2.0, que permite uso comercial sin restricciones, y en su diseño modular que facilita la integración en flujos de procesamiento fotográfico. Aunque no se publican métricas cuantitativas en la información disponible, su enfoque en restauración de desenfoque con múltiples presets configurables lo posiciona como una opción práctica para fotógrafos y desarrolladores de aplicaciones de edición de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en PyTorch, procesamiento por teselas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa imágenes, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (número de capas, tipo de bloques, etc.). Se sabe que está implementado en PyTorch y que utiliza un esquema de procesamiento por teselas (tiled) con memoria limitada, lo que sugiere un diseño pensado para imágenes de gran tamaño sin requerir GPUs de alta capacidad. El entrenamiento se realizó en múltiples etapas (stages), cada una con objetivos específicos: desde un checkpoint base (stage4) hasta refinamientos con datos sintéticos de desenfoque realista (stages 9-13) y un equilibrio final (stage14) seguido de un refinamiento con baja tasa de aprendizaje (stage15), que es el recomendado por el autor.

El dataset principal es DPDD (Abuolaim & Brown, ECCV 2020), que proporciona pares de imágenes con desenfoque real y sus correspondientes versiones nítidas, capturadas con sensores de doble píxel. Además, se generaron datos sintéticos de desenfoque a partir de los objetivos nítidos de DPDD para ampliar la variedad de casos, incluyendo desenfoque parcial y de gran radio. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Restauración de desenfoque por desenfoque (defocus deblurring) en imágenes fotográficas.
- Corrección de enfoque suave (soft-focus) y desenfoque parcial.
- Procesamiento de imágenes de alta resolución mediante teselado con memoria limitada.
- Múltiples presets configurables (stage15, stage13-adaptive, etc.) que permiten ajustar la intensidad de la corrección según el caso.
- Soporte para mapas de desenfoque (preset `stage13-defocus-map`), lo que permite un control más fino sobre regiones específicas.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Restauración de fotografías antiguas o con desenfoque accidental: el modelo puede recuperar detalles en imágenes donde el enfoque falló, mejorando la nitidez general sin introducir artefactos excesivos.
- Postprocesado en flujos de edición fotográfica: integrable como plugin o script en herramientas como Photoshop o GIMP, aplicando el preset `stage15` para limpieza natural de bordes y texturas.
- Mejora de imágenes capturadas con smartphones o cámaras compactas: el desenfoque por desenfoque es común en condiciones de poca luz o con apertura amplia; el modelo puede corregirlo manteniendo el aspecto natural.
- Preprocesado para visión artificial: antes de alimentar un sistema de detección o reconocimiento, se puede aplicar `nagi_sharpen` para mejorar la calidad de las imágenes de entrada y aumentar la precisión de los algoritmos posteriores.
- Restauración de imágenes médicas o científicas: aunque no está específicamente entrenado para ello, su capacidad de corregir desenfoque puede ser útil en microscopía o fotografía de campo, siempre que el desenfoque sea de tipo óptico.
- Generación de mapas de desenfoque para análisis: el preset `stage13-defocus-map` permite obtener una estimación de la región desenfocada, útil para aplicaciones de profundidad de campo o segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como PSNR, SSIM o comparaciones con otros métodos de deblurring. Se recomienda consultar el repositorio de GitHub para posibles evaluaciones adicionales.

## Requisitos de hardware

- VRAM estimada: no disponible. El diseño por teselas sugiere que puede ejecutarse en GPUs con poca memoria (por ejemplo, 4-6 GB), pero no se especifican valores concretos.
- GPU recomendadas: no disponible. Al ser un modelo PyTorch, debería funcionar en cualquier GPU compatible con CUDA, incluyendo RTX 30xx/40xx, A100, etc.
- Compatibilidad con GPU de consumo: probablemente sí, gracias al procesamiento por teselas, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo se usa mediante la CLI de Python (`python -m nagi_sharpen deblur ...`), por lo que puede integrarse en scripts y servicios. No se mencionan adaptaciones para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (deblurring por desenfoque) dentro de la documentación proporcionada. Se recomienda buscar alternativas como DeblurGAN-v2, o métodos específicos de DPDD, pero no se pueden ofrecer datos concretos sin fuentes adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado principalmente con el dataset DPDD, que contiene imágenes de interiores y exteriores con ciertas características; puede tener un rendimiento inferior en dominios muy diferentes (por ejemplo, imágenes aéreas o de microscopía).
- Riesgo de alucinación: al ser un modelo de restauración, puede generar texturas o detalles que no estaban presentes en la imagen original, especialmente con presets agresivos (como `stage9-strong` o `stage14-pipeline500`). Se recomienda usar presets equilibrados como `stage15` para evitar artefactos.
- Limitaciones de contexto: no aplica, pero la restauración se limita a desenfoque óptico; no corrige desenfoque por movimiento ni ruido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe citar el paper de DPDD si se usa en investigación, según se indica en la model card.
- Caveat para producción: los presets generativos (stage15-petal-generate, stage16-18) son experimentales y no se recomiendan como opción por defecto. Además, el modelo requiere los checkpoints descargados y el código del repositorio de GitHub para funcionar.

## Enlaces

- [HuggingFace: uniuyuni/nagi_sharpen](https://huggingface.co/uniuyuni/nagi_sharpen)
- [Repositorio de GitHub: nagi_sharpen](https://github.com/uniuyuni/nagi_sharpen)
- [Paper DPDD (Abuolaim & Brown, ECCV 2020)](https://www.eecs.yorku.ca/~kamel/defocus-deblurring-dual-pixel/) (enlace no verificado, se menciona en la model card)
