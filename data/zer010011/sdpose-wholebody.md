# ZER010011/SDPose-Wholebody

## Resumen

SDPose-Wholebody es un modelo de estimación de pose humana que aprovecha los priors visuales de Stable Diffusion para lograr un rendimiento robusto en escenarios fuera de distribución (out-of-distribution, OOD). Lo desarrolla el equipo de Shuang Liang, Jing He, Chuanmeizhi Wang, Lejun Liao, Guo Zhang, Yingcong Chen y Yuan Yuan, y se publica bajo licencia MIT en Hugging Face. La variante Wholebody estima 133 keypoints que cubren cuerpo, manos, cara y pies en formato COCO Wholebody.

El modelo resuelve un problema concreto: los estimadores de pose tradicionales degradan su precisión cuando se enfrentan a dominios visuales distintos del de entrenamiento (pinturas, anime, bocetos, estilos artísticos). SDPose reutiliza el backbone U-Net de Stable Diffusion v2, inicializado con sus pesos y ajustado finamente, junto con una cabeza de heatmaps específica para keypoints. La arquitectura opera en modo top-down: primero detecta personas con un detector externo (YOLO11-x) y después estima la pose sobre cada recorte.

La relevancia actual radica en su enfoque de reutilización de modelos generativos como extractores de representaciones densas para tareas discriminativas. El modelo se entrenó exclusivamente con COCO-2017 train2017, sin datos adicionales, y el repositorio ocupa 5,3 GB en formato safetensors sobre PyTorch, con integración en el ecosistema MMPose.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net de Stable Diffusion v2 (fine-tuned) con cabeza de heatmaps personalizada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 1024×768) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés, según metadatos; la tarea es de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería PyTorch, integración MMPose) |

## Arquitectura y entrenamiento

SDPose emplea un backbone U-Net inicializado con los pesos de Stable Diffusion v2 y ajustado finamente con cambios arquitectónicos mínimos. Sobre ese backbone se añade una cabeza de predicción de heatmaps que produce 133 mapas de confianza (uno por keypoint) más coordenadas con puntuaciones de confianza. El pipeline es top-down: un detector de personas (por ejemplo, YOLO11-x) genera las cajas delimitadoras, cada recorte se redimensiona a 1024×768 y el modelo estima la pose. La implementación se apoya en MMPose.

El entrenamiento se realizó exclusivamente sobre COCO-2017 train2017 (más de 200.000 imágenes con anotaciones de 133 keypoints wholebody), sin datos adicionales. El preprocesamiento incluye redimensionado y recorte a 1024×768, aumentación con volteo horizontal aleatorio, transformaciones de medio cuerpo y de bounding box, afinidad UDP y aumentaciones de Albumentations (desenfoque gaussiano y mediano, coarse dropout). Los heatmaps se codifican con el codec UDP al estilo MMPose. No se documenta en la información disponible el uso de RLHF, DPO ni un recuento explícito de tokens de entrenamiento (no aplica, al ser un modelo de visión).

## Capacidades

- Estimación de pose humana con 133 keypoints wholebody (cuerpo, manos, cara y pies) en formato COCO Wholebody.
- Detección de keypoints sobre imágenes naturales y sobre dominios artísticos o estilizados (pinturas, anime, bocetos).
- Generación de heatmaps de confianza por keypoint, además de coordenadas con puntuaciones.
- Robustez frente a cambios de distribución (out-of-distribution) gracias a los priors de difusión.
- Integración con MMPose y con detectores externos de personas (YOLO11-x) en un pipeline top-down.
- Aplicable a seguimiento de pose en vídeo y animación (según los usos previstos declarados).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no aplica; el modelo procesa imágenes, no texto.
- Capacidades especiales (thinking mode, visión generativa, audio): no disponible.

## Casos de uso

- Animación y captura de movimiento: el modelo extrae 133 keypoints wholebody (incluidas manos y cara) de fotogramas de vídeo, lo que permite trasladar actuaciones humanas a rigs de personajes con detalle facial y manual.
- Análisis de pose en arte y contenido estilizado: al estar entrenado para robustez OOD, puede estimar poses en pinturas, ilustraciones anime o bocetos donde los estimadores convencionales fallan, útil para catalogación y estudio de obras.
- Rehabilitación y análisis biomecánico: la inclusión de keypoints de pies y manos permite medir ángulos articulares y posturas en vídeo de pacientes, con la ventana de 1024×768 que preserva detalle en extremidades.
- Deportes y análisis técnico: el pipeline top-down con detector YOLO11-x permite procesar secuencias de varios atletas por fotograma y analizar la mecánica de gestos (por ejemplo, saques o lanzamientos) con keypoints de mano.
- Interacción persona-ordenador y realidad aumentada: la detección de manos y cara en 133 puntos posibilita control gestual y avatares que replican expresiones y movimientos de dedos en tiempo de inferencia por fotograma.
- Investigación en transferencia de dominio: al reutilizar priors de Stable Diffusion, sirve como banco de pruebas para estudiar cómo los modelos generativos mejoran tareas discriminativas bajo cambio de distribución.
- Moderación y análisis de contenido visual: la estimación de pose puede alimentar sistemas de detección de posturas inapropiadas o de análisis de escenas con múltiples personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que SDPose supera significativamente a modelos tradicionales como Sapiens en benchmarks out-of-distribution y mantiene un rendimiento competitivo en dominio, pero remite al paper (arXiv:2509.24980) para las cifras concretas, que no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 5,3 GB en safetensors, por lo que en precisión completa (fp32/fp16) se requiere una GPU con al menos 8-12 GB de VRAM para cargar los pesos, más memoria para activaciones a resolución 1024×768.
- GPU recomendadas: no disponible en la documentación; por el tamaño del backbone U-Net de SD v2 y la resolución de entrada, se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100) para inferencia cómoda, aunque no se confirma en la información.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos con 12-16 GB o más, pero no se especifica en la documentación.
- Opciones de despliegue: MMPose (framework oficial), Gradio (la app incluida en el repositorio), PyTorch nativo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDPose-Wholebody | no disponible | Imagen 1024×768; 133 keypoints | Superior a Sapiens en OOD según la model card (cifras en el paper) | MIT | Hugging Face + GitHub |
| Sapiens (Meta) | no disponible en la información | no disponible | Referencia base; inferior en OOD según SDPose | no disponible | no disponible |
| Otros estimadores top-down MMPose (p. ej. RTMPose, HRNet) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos cuantitativos de los modelos comparables en la información proporcionada; la comparativa se limita a lo declarado en la model card.

## Limitaciones y advertencias

- Dependencia de un detector externo de personas (YOLO11-x): los errores de detección o cajas mal ajustadas degradan la estimación de pose.
- Entrenado exclusivamente con COCO-2017 train2017: aunque busca robustez OOD, el sesgo del dataset (distribución demográfica, escenas y estilos de COCO) puede trasladarse al modelo.
- Riesgo de alucinación de keypoints: en oclusiones severas o recortes parciales, la cabeza de heatmaps puede predecir puntos con confianza alta en ubicaciones incorrectas.
- Sin datos publicados de benchmarks en la información disponible: la afirmación de superioridad frente a Sapiens no puede verificarse sin consultar el paper.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los componentes reutilizados (pesos de Stable Diffusion v2 y detector YOLO11-x, que tienen sus propias condiciones).
- Idiomas: los metadatos indican solo inglés; no aplica a texto, pero la documentación y la interfaz están en inglés.
- No se documentan cuantizaciones ni optimizaciones de despliegue, lo que limita el despliegue en entornos con restricciones de memoria sin trabajo adicional.
- Escasa tracción comunitaria en el momento de la ficha (0 descargas, 0 likes), lo que implica poca validación externa y soporte limitado.

## Enlaces

- Hugging Face: https://huggingface.co/ZER010011/SDPose-Wholebody
- Paper (arXiv): https://arxiv.org/abs/2509.24980
- Página del proyecto: https://t-s-liang.github.io/SDPose
- Repositorio de código: https://github.com/t-s-liang/SDPose-OOD
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/teemosliang/SDPose-Body
- Licencia MIT: https://opensource.org/licenses/MIT
- Contacto: tsliang2001@gmail.com
