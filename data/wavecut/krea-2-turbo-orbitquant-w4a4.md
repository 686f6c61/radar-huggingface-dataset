# WaveCut/Krea-2-Turbo-OrbitQuant-W4A4

## Resumen

Krea-2-Turbo-OrbitQuant-W4A4 es un checkpoint cuantizado del modelo de generación de imágenes Krea-2-Turbo, desarrollado por WaveCut mediante la técnica OrbitQuant. Este modelo reduce los pesos y activaciones a 4 bits (W4A4) sin necesidad de calibración previa, lo que permite una inferencia más rápida y con menor consumo de memoria en GPUs consumer. El modelo base, creado por Krea AI, está entrenado desde cero para exploración creativa y estilística, y esta versión cuantizada mantiene la misma arquitectura de difusión con un coste computacional reducido.

OrbitQuant es un método de cuantización post-entrenamiento agnóstico a los datos, diseñado específicamente para diffusion transformers (DiTs). A diferencia de otras técnicas que requieren recalibrar para cada checkpoint o modalidad, OrbitQuant generaliza entre timesteps, prompts y ramas de guiado, lo que facilita su aplicación a modelos como Krea-2-Turbo sin degradación significativa. El checkpoint cuantizado tiene aproximadamente 6,43 mil millones de parámetros y se distribuye en formato safetensors, compatible con la librería diffusers mediante el pipeline `Krea2Pipeline`.

La relevancia de este modelo radica en su capacidad para ejecutar generación de imágenes de alta calidad en hardware de gama media, abriendo la puerta a despliegues locales y aplicaciones en tiempo real. Además, al estar basado en Krea-2-Turbo, hereda las capacidades creativas del modelo original, con un enfoque en estilos artísticos y composiciones visuales novedosas. El acceso es restringido (gated) y requiere aceptar la licencia comunitaria de Krea 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) — no se especifica detalle adicional |
| Parametros totales | 6.432.504.391 (6,43 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generación de imágenes, sin contexto textual definido) |
| Tipos de cuantizacion | W4A4 (4 bits pesos y activaciones); la colección OrbitQuant incluye también variantes de 8 bits |
| Idiomas soportados | Inglés (en) |
| Licencia | krea-2-community-license (acceso restringido, requiere aceptación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Krea-2-Turbo es un modelo de difusión de texto a imagen desarrollado por Krea AI, entrenado desde cero con un enfoque en exploración creativa y estilística. La arquitectura concreta no se detalla en la información disponible, pero el método de cuantización OrbitQuant está diseñado para diffusion transformers (DiTs), lo que sugiere que Krea-2-Turbo emplea una arquitectura de este tipo. El checkpoint cuantizado se obtiene aplicando OrbitQuant, una técnica de cuantización post-entrenamiento sin calibración que no requiere datos de validación ni ajuste por timestep, prompt o rama de guiado. Esto simplifica el proceso de cuantización y mantiene la fidelidad del modelo original.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El paper de OrbitQuant (arXiv:2607.02461) describe el método en detalle, pero no proporciona datos específicos del entrenamiento de Krea-2-Turbo. La cuantización W4A4 reduce el tamaño de los pesos a la mitad (4 bits por parámetro) y las activaciones también a 4 bits, lo que permite un uso más eficiente de la memoria y un aumento de throughput en inferencia, especialmente con kernels optimizados CUDA y Metal incluidos en la implementación de OrbitQuant.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés, con énfasis en estilos creativos y composiciones artísticas.
- Soporte del pipeline `Krea2Pipeline` de diffusers, lo que facilita su integración en flujos de trabajo existentes basados en Hugging Face.
- Inferencia eficiente gracias a la cuantización W4A4, que reduce los requisitos de memoria y acelera la generación en GPUs consumer.
- Compatible con la colección OrbitQuant, que incluye checkpoints cuantizados para otros modelos como FLUX.1, FLUX.2 Klein, Z-Image-Turbo y Wan 2.1.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso, al ser un modelo puramente generativo de imágenes.
- La generación se limita al idioma inglés, aunque podría funcionar con prompts en otros idiomas con menor precisión (no verificado).

## Casos de uso

- **Generación de arte conceptual**: artistas y diseñadores pueden crear bocetos y conceptos visuales a partir de descripciones textuales, aprovechando la cuantización para iterar rápidamente en equipos sin GPUs de alta gama.
- **Ilustración editorial y de medios**: redactores y editores pueden generar imágenes de acompañamiento para artículos, blogs o publicaciones, con un estilo creativo que se adapta a la temática.
- **Diseño de producto y prototipado**: equipos de producto pueden visualizar ideas de diseño de interfaces, objetos o escenarios a partir de prompts, acelerando la fase de exploración sin depender de herramientas externas.
- **Marketing y publicidad**: profesionales del marketing pueden generar imágenes para campañas en redes sociales, banners o anuncios, personalizando estilos y composiciones según la audiencia objetivo.
- **Creación de contenido para redes sociales**: creadores de contenido pueden producir imágenes originales para posts, historias o vídeos, con un coste computacional reducido que permite generación en tiempo real o por lotes.
- **Prototipado visual para juegos y entretenimiento**: desarrolladores de juegos pueden generar conceptos de personajes, escenarios y objetos para validar ideas antes de invertir en producción artística completa.
- **Investigación en generación de imágenes**: investigadores pueden utilizar este checkpoint cuantizado para estudiar el impacto de la cuantización en la calidad de salida o como base para fine-tuning con menos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint cuantizado en la información disponible. El paper de OrbitQuant presenta evaluaciones generales del método sobre varios modelos DiT, pero no desglosa métricas por checkpoint. Tampoco se dispone de comparativas de calidad (FID, CLIP score, etc.) entre Krea-2-Turbo original y su versión cuantizada. Se recomienda consultar el repositorio de OrbitQuant y el paper para obtener datos de rendimiento del método en otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,43 B parámetros cuantizados a 4 bits, los pesos ocupan aproximadamente 3,2 GB. Las activaciones dependen de la resolución de salida y el número de pasos de difusión; para resoluciones típicas (512x512 o 768x768) se estima un uso total de 4-6 GB de VRAM.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060/4060, RTX 2070, o GPUs de datacenter como A10 o L4. Para resoluciones altas o lotes grandes se recomienda 12-16 GB.
- Es viable en GPUs consumer de gama media; la cuantización W4A4 permite ejecutar el modelo en tarjetas como RTX 3060 (12 GB) sin problemas.
- Opciones de despliegue: la integración con diffusers permite usar el pipeline estándar; OrbitQuant proporciona kernels CUDA y Metal para aceleración en NVIDIA y Apple Silicon. También puede utilizarse con herramientas como ComfyUI si se adapta el checkpoint.
- Latencia y throughput: no se dispone de mediciones específicas. La cuantización 4-bit suele ofrecer una aceleración de 2-3x frente al modelo original en FP16, pero depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de generación de imágenes cuantizados. La colección OrbitQuant incluye checkpoints para FLUX.1, FLUX.2 Klein, Z-Image-Turbo y Wan 2.1, pero no se han publicado comparativas de calidad entre ellos. Se recomienda evaluar el modelo en el contexto de uso específico y contrastar con el modelo base sin cuantizar para medir la degradación.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como cualquier modelo generativo, puede producir imágenes con detalles inconsistentes, artefactos o contenido no deseado, especialmente con prompts ambiguos o fuera de distribución.
- **Degradación por cuantización**: la cuantización W4A4 puede reducir la fidelidad visual y la coherencia estilística en comparación con el modelo original en FP16. Se recomienda validar la calidad en casos de uso críticos.
- **Idioma**: el modelo está entrenado principalmente en inglés; prompts en otros idiomas pueden generar resultados menos precisos.
- **Licencia restrictiva**: la licencia krea-2-community-license probablemente limita el uso comercial y requiere atribución. Es imprescindible revisar los términos antes de su uso en producción.
- **Acceso gated**: el modelo requiere aceptar condiciones en Hugging Face, lo que puede dificultar la automatización de descargas.
- **Sin soporte de tool calling ni agentes**: no es adecuado para tareas que requieran interacción con herramientas externas o razonamiento multi-paso.
- **Tamaño del repositorio**: 10 GB de peso, lo que implica un tiempo de descarga considerable y espacio en disco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Krea-2-Turbo-OrbitQuant-W4A4
- Colección OrbitQuant: https://huggingface.co/collections/WaveCut/orbitquant-models
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Repositorio de OrbitQuant (GitHub): https://github.com/iamwavecut/OrbitQuant
- Repositorio oficial de Krea 2 (GitHub): https://github.com/krea-ai/krea-2
- Paper de OrbitQuant (arXiv): https://arxiv.org/abs/2607.02461
