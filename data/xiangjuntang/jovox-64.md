# xiangjuntang/JoVox-64

## Resumen

JoVox-64 es un generador de estructuras de vóxeles a resolución 64³ condicionado por imagen, desarrollado por Xiangjun Tang, Jianqi Chen y Peter Wonka (KAUST) y publicado en el repositorio de Hugging Face `xiangjuntang/JoVox-64`. Forma parte del trabajo "JoVox: Joint Hierarchical Flow Matching for Lightweight Voxel Generation" (arXiv:2611.10690), un marco de flow matching discreto que aprende la distribución jerárquica conjunta de vóxeles manteniendo la generación ligera. El modelo resuelve el problema de la reconstrucción y generación 3D a partir de una sola imagen con un coste computacional reducido, generando todos los niveles de resolución (4³ → 16³ → 64³) con un único modelo.

La arquitectura se basa en flow matching discreto sobre una jerarquía de vóxeles, con un codificador de imagen DINOv3 (ViT-L/16) que condiciona la generación. El checkpoint publicado contiene 1.541.135.360 parámetros (aproximadamente 1,54 mil millones) en formato safetensors (6,2 GB), lo que lo sitúa en una categoría de tamaño moderada para tareas de generación 3D. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de investigación y producción.

Su relevancia actual radica en que ofrece una alternativa ligera a los modelos de generación 3D basados en difusión o en representaciones implícitas (como TRELLIS.2), con el que se compara directamente en la model card. Según los resultados reportados por los autores, JoVox supera a TRELLIS.2 en métricas de calidad geométrica (CD_V, IoU, CD_shell, FID_N) manteniendo un rendimiento similar en Uni3D, lo que lo convierte en una opción atractiva para pipelines de image-to-3D donde el coste de inferencia es un factor crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching discreto jerárquico sobre vóxeles, condicionado por imagen (DINOv3 ViT-L/16) |
| Parametros totales | 1.541.135.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo multimodal imagen→3D, sin soporte de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

JoVox emplea un esquema de flow matching discreto que modela conjuntamente la distribución jerárquica de vóxeles en tres niveles de resolución (4³, 16³ y 64³) con un único modelo. A diferencia de aproximaciones que entrenan un modelo por nivel o que usan difusión continua sobre representaciones implícitas, JoVox aprende la transición entre niveles mediante flujo discreto, lo que reduce el coste de generación y permite mantener coherencia global entre escalas. La condición de imagen se introduce mediante un codificador DINOv3 (ViT-L/16 preentrenado en LVD-1689M), que se descarga por separado y se integra en el pipeline de inferencia.

El entrenamiento utiliza los subconjuntos sketchfab, 3D-FUTURE, HSSD y ABO de TRELLIS-500K, con Toys4k reservado como conjunto de test. No se especifican en la model card el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF/DPO (no aplicables en este dominio). La innovación técnica principal es la generación jerárquica conjunta con un solo modelo y un esquema de flow matching ligero, que según los autores permite igualar o superar a TRELLIS.2 con el mismo backbone.

## Capacidades

- Generación de estructuras de vóxeles 3D a resolución 64³ a partir de una única imagen de entrada.
- Generación jerárquica multinivel: produce 4³, 16³ y 64³ de forma conjunta con un solo modelo.
- Generación de mallas (mesh) a partir de la estructura de vóxeles generada, mediante el script `img2mesh.py` en tres etapas (prep, voxel, mesh).
- Condicionamiento por imagen mediante DINOv3 ViT-L/16.
- Soporte de semilla (`--seed`) para reproducibilidad en la generación.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No dispone de modo thinking, visión general (solo codificación de imagen como condición) ni audio.

## Casos de uso

- Reconstrucción 3D a partir de una sola imagen en pipelines de investigación: el modelo genera una estructura de vóxeles 64³ que puede convertirse en malla, útil para experimentos de image-to-3D donde se necesita una alternativa ligera a métodos de difusión.
- Prototipado rápido de assets 3D para videojuegos o realidad aumentada: a partir de una foto de un objeto se obtiene una malla aproximada en pocos segundos, adecuada para iteración temprana antes de un modelado manual.
- Generación de datasets sintéticos 3D: el modelo puede producir estructuras de vóxeles variadas a partir de imágenes de catálogo, útiles para aumentar datasets de entrenamiento de otros modelos 3D.
- Evaluación comparativa de métodos de generación 3D: al estar publicado con métricas frente a TRELLIS.2 sobre Toys4k, sirve como baseline reproducible en experimentos académicos.
- Integración en herramientas de diseño asistido: un usuario puede subir una imagen de referencia y obtener una malla preliminar para su posterior edición en software CAD o de modelado.
- Investigación en flow matching discreto: el checkpoint y el código permiten reproducir y extender el marco JoVox para otras tareas de generación estructurada (vóxeles, mallas, etc.).
- Generación de contenido 3D para entornos simulados: útil en robótica o simulación donde se necesitan objetos 3D aproximados a partir de imágenes de referencia con bajo coste computacional.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 1000 objetos de Toys4k (condicionados por imagen), comparados con TRELLIS.2 usando el mismo backbone:

| Metodo | CD_V ↓ | IoU ↑ | CD_shell ↓ | FID_N ↓ | Uni3D ↑ |
|---|---|---|---|---|---|
| TRELLIS.2 | 0.01250 | 0.4017 | 0.524e-3 | 33.3 | 0.3865 |
| JoVox | 0.01107 | 0.4158 | 0.407e-3 | 31.6 | 0.3868 |

JoVox mejora a TRELLIS.2 en CD_V (0.01107 frente a 0.01250), IoU (0.4158 frente a 0.4017), CD_shell (0.407e-3 frente a 0.524e-3) y FID_N (31.6 frente a 33.3), con una mejora marginal en Uni3D (0.3868 frente a 0.3865). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo de generación 3D.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el checkpoint pesa 6,2 GB en safetensors (fp32/fp16 según configuración), por lo que se estima un consumo de al menos 6-8 GB solo para los pesos, más el codificador DINOv3 ViT-L/16 (aproximadamente 1,2 GB adicionales) y memoria para activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100) es un punto de partida razonable, aunque no hay confirmación oficial.
- ¿Cabe en consumer GPU? Probablemente sí en GPUs con 16 GB o más (RTX 4080/4090, RTX 3090), aunque no está verificado por el autor.
- Opciones de despliegue: el repositorio oficial (github.com/yuyujunjun/JoVox) proporciona scripts `img2mesh.py` en tres etapas; la etapa de preparación y malla requiere el entorno de TRELLIS.2 y la etapa de vóxeles el entorno de JoVox. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Rendimiento (Toys4k) |
|---|---|---|---|---|---|
| JoVox-64 | 1.541.135.360 | Voxeles 4³/16³/64³, condicionado por imagen | Apache 2.0 | Hugging Face + GitHub | CD_V 0.01107, IoU 0.4158 |
| TRELLIS.2 | no disponible | Voxeles/mallas, condicionado por imagen | no disponible | no disponible | CD_V 0.01250, IoU 0.4017 |
| Otros modelos image-to-3D (p. ej. basados en difusion) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa disponible en la model card es únicamente con TRELLIS.2, usando el mismo backbone. No se proporcionan datos de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado en generación de vóxeles 3D a partir de imagen; no procesa texto ni tiene capacidades lingüísticas.
- La resolución máxima de vóxeles es 64³, lo que limita el nivel de detalle geométrico en objetos complejos.
- El entrenamiento se realizó sobre subconjuntos de TRELLIS-500K (sketchfab, 3D-FUTURE, HSSD, ABO); puede heredar sesgos de esos datasets (categorías de objetos, estilos, dominios).
- Riesgo de alucinación geométrica: al ser un modelo generativo, puede producir estructuras plausibles pero incorrectas respecto a la imagen de entrada.
- La licencia Apache 2.0 permite uso comercial, pero el codificador DINOv3 se descarga por separado y su licencia debe verificarse de forma independiente.
- El pipeline de inferencia requiere dos entornos distintos (TRELLIS.2 para prep y mesh, JoVox para vóxeles), lo que añade complejidad de despliegue.
- No hay información publicada sobre latencia, throughput ni requisitos exactos de VRAM; el autor no los documenta en la model card.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica baja validación comunitaria todavía.
- No se especifican limitaciones idiomáticas ni de contexto porque el modelo no opera sobre texto.

## Enlaces

- Hugging Face: https://huggingface.co/xiangjuntang/JoVox-64
- Paper: https://arxiv.org/abs/2611.10690
- Código: https://github.com/yuyujunjun/JoVox
- Codificador DINOv3: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
