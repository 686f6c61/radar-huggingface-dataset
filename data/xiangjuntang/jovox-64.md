# xiangjuntang/JoVox-64

## Resumen

JoVox-64 es un generador de estructuras voxelicas de resolución 64³ condicionado por imagen, desarrollado por Xiangjun Tang, Jianqi Chen y Peter Wonka (publicado en arXiv:2611.10690, 2026). Forma parte del framework JoVox (Joint Hierarchical Flow Matching for Lightweight Voxel Generation), un enfoque de flow matching discreto que aprende la distribución jerárquica conjunta de vóxeles manteniendo la generación ligera. El modelo genera todos los niveles de la jerarquía (4³ → 16³ → 64³) a partir de una única imagen de entrada.

El modelo resuelve el problema de la reconstrucción y generación 3D a partir de imágenes 2D con un coste computacional reducido, empleando un único modelo para toda la jerarquía en lugar de pipelines separados por resolución. La imagen de condición se codifica con DINOv3 (ViT-L/16), que se descarga por separado. Con 1.541.135.360 parámetros y un repo de 6,2 GB, se distribuye bajo licencia Apache 2.0 en formato safetensors.

Es relevante por su planteamiento de flow matching jerárquico conjunto, que según la model card supera a TRELLIS.2 en las métricas reportadas sobre 1000 objetos de Toys4k, además de ofrecer un pipeline completo imagen → vóxeles → malla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching discreto jerarquico (4³ → 16³ → 64³) condicionado por imagen; codificador de condicion DINOv3 ViT-L/16 |
| Parametros totales | 1.541.135.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo image-to-3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, pesos EMA del generador, usado con `configs/voxelgen64.yaml`) |

## Arquitectura y entrenamiento

JoVox es un framework de flow matching discreto que modela de forma conjunta la distribución jerárquica de vóxeles. Un único modelo genera todos los niveles de resolución (4³, 16³ y 64³) a partir de una sola imagen, en lugar de emplear un modelo por nivel. La condición visual se extrae mediante DINOv3 ViT-L/16 (`facebook/dinov3-vitl16-pretrain-lvd1689m`), que se descarga de forma independiente. Los pesos publicados corresponden a la versión EMA del generador.

El entrenamiento utilizó los subconjuntos sketchfab, 3D-FUTURE, HSSD y ABO de TRELLIS-500K. Toys4k se reservó como conjunto de test. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF/DPO (no aplicable en un modelo generativo 3D de este tipo). La model card advierte que las imágenes de entrenamiento se renderizaron desde puntos de vista aleatorios, pero el tamaño del objeto en la imagen varía solo en un rango limitado y no se aplicó augmentación de recorte; el pipeline imagen-a-malla mitiga esto centrando y reescalando el objeto antes de la generación.

## Capacidades

- Generación de estructuras voxelicas 3D de 64³ condicionadas por una imagen 2D.
- Generación jerárquica conjunta: un solo modelo produce los niveles 4³, 16³ y 64³.
- Conversión de imagen a malla mediante el pipeline `scripts/img2mesh.py` (etapas `prep`, `voxel`, `mesh`).
- Generación controlada por semilla (`--seed`) para reproducibilidad.
- Condicionamiento visual mediante DINOv3 ViT-L/16.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas: es un modelo puramente image-to-3D.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá del condicionamiento por imagen.

## Casos de uso

- Reconstrucción 3D rápida desde fotografías de producto: el modelo genera una estructura voxelica 64³ y una malla a partir de una sola imagen, útil para catalogos de e-commerce que necesitan vistas 3D de artículos.
- Prototipado de assets para videojuegos: generación de mallas base a partir de concept art o capturas, que luego se retocan en herramientas de modelado.
- Pipelines de escaneo y digitalización de objetos: dado que el pipeline centra y reescala el objeto automáticamente, puede integrarse en flujos de captura con vistas controladas.
- Investigación en generación 3D generativa: base para experimentar con flow matching jerárquico y comparar frente a TRELLIS.2 en tareas image-to-3D.
- Generación de datasets sintéticos 3D: producción de estructuras voxelicas y mallas para aumentar datos de entrenamiento de otros modelos 3D.
- Visualización y previsualización en aplicaciones de diseño: generación rápida de una malla aproximada a partir de una imagen para iterar sobre conceptos antes de modelado detallado.
- Benchmarking de métodos image-to-3D: el modelo sirve como referencia reproducible (semilla fija) frente a alternativas en conjuntos como Toys4k.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 1000 objetos de Toys4k (image-conditioned):

| Metodo | CD_V ↓ | IoU ↑ | CD_shell ↓ | FID_N ↓ | Uni3D ↑ |
|---|---|---|---|---|---|
| TRELLIS.2 | 0.01250 | 0.4017 | 0.524e-3 | 33.3 | 0.3865 |
| JoVox | 0.01107 | 0.4158 | 0.407e-3 | 31.6 | 0.3868 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 1.541.135.360 parámetros, los pesos en FP32 ocupan aproximadamente 6,2 GB (tamaño del repo); en FP16/BF16 rondarían los 3,1 GB, a lo que habría que sumar el codificador DINOv3 ViT-L/16 descargado aparte.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño de pesos (≈3-6 GB) sería plausible en GPUs de consumo con suficiente VRAM, pero el dato no está publicado.
- Opciones de despliegue: el repositorio oficial (github.com/yuyujunjun/JoVox) proporciona scripts de inferencia (`scripts/img2mesh.py`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo image-to-3D).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Toys4k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoVox-64 | 1.541.135.360 | no aplica | CD_V 0.01107; IoU 0.4158; FID_N 31.6; Uni3D 0.3868 | Apache 2.0 | Hugging Face + código GitHub |
| TRELLIS.2 | no disponible | no aplica | CD_V 0.01250; IoU 0.4017; FID_N 33.3; Uni3D 0.3865 | no disponible | no disponible |

No se dispone de datos de otros modelos comparables (parámetros, contexto, licencia) en la información proporcionada.

## Limitaciones y advertencias

- Robustez limitada al tamaño del objeto en la imagen de entrada: el modelo puede no dar resultados óptimos si el objeto queda fuera del rango de tamaño visto en entrenamiento; el pipeline mitiga esto centrando y reescalando, y el autor anuncia una versión más robusta.
- Sesgos de dataset: entrenado sobre subconjuntos de TRELLIS-500K (sketchfab, 3D-FUTURE, HSSD, ABO); puede heredar sesgos de esas fuentes en cuanto a categorías, estilos y distribución de objetos.
- Riesgo de artefactos y geometrías incompletas en objetos con oclusiones o vistas atípicas; no se documentan métricas de fallo fuera de Toys4k.
- Resolución fija de 64³: el detalle geométrico está acotado por la resolución voxelica; no se documentan modos de mayor resolución en esta release.
- Dependencia de un codificador externo (DINOv3 ViT-L/16) que debe descargarse por separado, lo que añade un paso de configuración y requisitos de memoria.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento (TRELLIS-500K y sus subconjuntos) y de DINOv3 antes de un despliegue comercial.
- Modelo no lingüístico: no soporta texto, tool calling ni agentes; cualquier expectativa en ese sentido queda fuera de su ámbito.
- Sin datos publicados de latencia, VRAM ni cuantizaciones soportadas, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/xiangjuntang/JoVox-64
- Demo (Hugging Face Space): https://huggingface.co/spaces/xiangjuntang/jovox-64
- Paper (arXiv): https://arxiv.org/abs/2611.10690
- Código (GitHub): https://github.com/yuyujunjun/JoVox
- Página del proyecto: https://yuyujunjun.github.io/Jovox-page/
- Codificador de condición DINOv3: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
