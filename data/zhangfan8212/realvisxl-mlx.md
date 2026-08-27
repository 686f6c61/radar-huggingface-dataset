# zhangfan8212/realvisxl-mlx

## Resumen

RealVisXL V5.0 — MLX es una conversión del checkpoint de Stable Diffusion XL (SDXL) RealVisXL V5.0, desarrollado originalmente por SG161222, adaptado para inferencia en dispositivos Apple Silicon mediante la librería `mlx-gen` de SceneWorks. El repositorio, publicado por zhangfan8212, ofrece tres niveles de pesos pre-cuantizados (q4, q8 y bf16) que se cargan directamente sin necesidad de un paso de cuantización en la aplicación, lo que reduce el uso de memoria y acelera el arranque en hardware Apple.

El modelo base RealVisXL V5.0 es un fine-tuning fotorealista de SDXL con licencia openrail++, lo que permite uso comercial sin restricciones de acceso. Mantiene la arquitectura original de SDXL: dos codificadores de texto (CLIP-L y OpenCLIP-bigG), un U-Net y un VAE, con resolución nativa de 1024×1024 píxeles y soporte para guía sin clasificador (CFG) y prompts negativos. Esta versión MLX está pensada para desarrolladores que quieran desplegar generación de imágenes en Macs con chip M-series sin depender de servicios en la nube.

La relevancia de este modelo radica en que elimina la fricción de cuantizar manualmente los pesos en cada arranque, ofreciendo snapshots autocontenidos que cargan de forma directa. Además, la cuantización es byte-idéntica a la que aplicaría `mlx-gen` en tiempo de carga, lo que garantiza que los resultados coinciden con un checkpoint denso cuantizado en la aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (U-Net + doble codificador CLIP-L/OpenCLIP-bigG + VAE) |
| Parametros totales | ~2.6 mil millones (estimado, basado en SDXL base; no confirmado en la ficha) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 77 tokens por prompt (estándar de SDXL) |
| Tipos de cuantizacion | Q4 group-wise (grupo 64), Q8 group-wise (grupo 64), bf16 denso |
| Idiomas soportados | no disponibles (el modelo base está entrenado principalmente en inglés) |
| Licencia | openrail++ |
| Formato de pesos | safetensors (snapshot diffusers autocontenido) |

## Arquitectura y entrenamiento

RealVisXL V5.0 es un fine-tuning del modelo SDXL base, que emplea una arquitectura de difusión latente con un U-Net como backbone principal y dos codificadores de texto: CLIP-L (ViT-L/14) y OpenCLIP-bigG (ViT-G/14). El entrenamiento del modelo original se realizó sobre un dataset de imágenes fotorealistas de alta calidad, aunque los detalles exactos de composición y número de tokens no se especifican en la información disponible. No se menciona el uso de RLHF o DPO; el fine-tuning se centra en mejorar la fidelidad fotográfica y el realismo de las imágenes generadas.

La conversión a MLX mantiene la arquitectura intacta, pero cuantiza selectivamente las proyecciones lineales del U-Net y ambos codificadores de texto. El VAE se mantiene en precisión f32 en todos los niveles, ya que es inestable en int8/fp16. Las convoluciones, GroupNorms y los embeddings de tokens/posiciones también permanecen densos, ya que no son multiplicaciones matriciales puras. La cuantización es afín por grupos de 64 elementos, idéntica a la que aplica `mlx-gen` en tiempo de carga, lo que garantiza reproducibilidad bit a bit.

## Capacidades

- Generación de imágenes fotorealistas a partir de prompts de texto, con resolución nativa de 1024×1024 píxeles.
- Soporte de guía sin clasificador (CFG) y prompts negativos para refinar la composición y el estilo.
- Compatibilidad con LoRA de la familia SDXL, lo que permite personalizar el modelo con estilos o conceptos adicionales.
- Inferencia en dispositivos Apple Silicon (M1, M2, M3 y superiores) mediante la librería `mlx-gen`, sin necesidad de GPU externa.
- Carga directa de pesos pre-cuantizados, eliminando el paso de cuantización en tiempo de ejecución.
- Tres niveles de precisión (q4, q8, bf16) para equilibrar calidad y uso de memoria según el hardware disponible.

## Casos de uso

- Generación de imágenes para diseño conceptual: un artista puede usar el modelo para explorar variaciones rápidas de escenas, personajes o entornos con prompts descriptivos, aprovechando la resolución nativa de 1024×1024 y el realismo del fine-tuning.
- Prototipado de productos: un equipo de diseño puede generar imágenes fotorrealistas de productos conceptuales (muebles, electrónica, packaging) para presentaciones internas o estudios de mercado, sin necesidad de renderizado 3D.
- Creación de contenido para marketing: agencias y departamentos de comunicación pueden producir imágenes de alta calidad para campañas publicitarias, redes sociales o banners web, con licencia openrail++ que permite uso comercial.
- Ilustración de artículos y blogs: escritores y editores pueden generar imágenes de acompañamiento para publicaciones técnicas o divulgativas, con control sobre el estilo y la composición mediante prompts negativos.
- Desarrollo de juegos y entretenimiento: estudios independientes pueden usar el modelo para generar arte conceptual de niveles, personajes o escenarios, acelerando el preproducción y reduciendo costes de contratación de ilustradores.
- Educación y formación: instructores de arte digital o IA pueden usar el modelo como herramienta didáctica para enseñar técnicas de prompting, control de estilo y evaluación de resultados en hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como FID, CLIP score o comparativas con otros modelos en la ficha del repositorio ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no disponible en la ficha; depende del nivel de cuantización y del tamaño del modelo. Para SDXL en MLX, se recomienda al menos 16 GB de memoria unificada en Apple Silicon para el nivel bf16, y 8-12 GB para q8/q4.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con memoria unificada suficiente. No requiere GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no aplica, ya que está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: la librería `mlx-gen` de SceneWorks, que incluye el generador `sdxl`. También se puede usar con el framework MLX de Apple directamente.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del chip concreto y del nivel de cuantización.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RealVisXL V5.0 (original) | SDXL | 77 tokens | openrail++ | safetensors (fp16) | Checkpoint denso para GPUs NVIDIA/AMD |
| RealVisXL V5.0 Lightning | SDXL | 77 tokens | openrail++ | safetensors (fp16) | Versión destilada con menos pasos de inferencia |
| SDXL base | SDXL | 77 tokens | openrail++ | safetensors | Modelo original de Stability AI, menos fotorealista que RealVisXL |
| SceneWorks/realvisxl-lightning-mlx | SDXL | 77 tokens | openrail++ | MLX (q4/q8/bf16) | Conversión MLX de la versión Lightning, también para Apple Silicon |

## Limitaciones y advertencias

- La cuantización Q4 puede degradar ligeramente la calidad de las imágenes en comparación con el checkpoint denso, especialmente en detalles finos o texturas complejas.
- El VAE se mantiene en f32 en todos los niveles, lo que aumenta el uso de memoria en comparación con una cuantización completa del modelo.
- El modelo está entrenado principalmente con datos en inglés; los prompts en otros idiomas pueden producir resultados subóptimos.
- La licencia openrail++ permite uso comercial, pero es responsabilidad del usuario revisar los términos completos de la licencia original de SDXL y RealVisXL.
- No se proporcionan garantías de rendimiento en hardware Apple Silicon antiguo (M1 de 8 GB); se recomienda probar con el nivel q4 para minimizar el uso de memoria.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco validado por la comunidad; se recomienda verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhangfan8212/realvisxl-mlx
- Modelo base original: https://huggingface.co/SG161222/RealVisXL_V5.0
- Librería `mlx-gen` de SceneWorks: https://github.com/SceneWorks/mlx-gen
- Versión Lightning en MLX: https://huggingface.co/SceneWorks/realvisxl-lightning-mlx
- Página oficial de RealVisXL: https://realvisxl.com/
- Modelo en Civitai: https://civitai.com/models/139562/realvisxl-v50
