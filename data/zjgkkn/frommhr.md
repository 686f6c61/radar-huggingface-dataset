# zjgkkn/frommhr

## Resumen

frommhr es un modelo de visión por computador desarrollado por el usuario zjgkkn que resuelve la reconstrucción de la forma y el color de una cabeza humana a partir de dos imágenes: una frontal y un perfil izquierdo. El modelo lee la geometría de la cabeza como los 20 coeficientes de identidad craneal del rig humano MHR (Momentum Human Rig) de Meta, y el color como 14 parámetros de pigmentación (melanina, eumelanina, sangre dérmica, labios, cejas, iris y barba incipiente). Está diseñado específicamente para la creación de personajes 3D de videojuegos a partir de imágenes de concepto.

La arquitectura combina un backbone DINOv2 ViT-S/14 a 518 píxeles sobre ambas imágenes, una pequeña CNN que procesa la franja ocular de la imagen frontal y un MLP que proyecta las características a los 20 coeficientes de forma y a los 14 logits de pigmentación. El modelo tiene aproximadamente 25 millones de parámetros y se distribuye como un único archivo safetensors de 0,2 GB bajo licencia Apache 2.0.

Es relevante porque demuestra que es posible obtener una reconstrucción facial 3D de alta fidelidad (error medio de 0,266 mm en la malla de la piel craneal) con un modelo compacto entrenado exclusivamente con datos sintéticos, ejecutable en CPU en unos diez segundos. El modelo se publica junto con el código de entrenamiento, evaluación y exportación, y se integra en un servidor de Assets Studio que monta la cabeza sobre un cuerpo SOMA texturizado y riggeado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (backbone) + CNN para franja ocular + MLP de regresión |
| Parametros totales | ~25 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tensores bajo claves con puntos y metadatos JSON) |

## Arquitectura y entrenamiento

El modelo es un pipeline de regresión visual compuesto por tres módulos. El backbone es DINOv2 ViT-S/14 en la variante de timm `vit_small_patch14_dinov2.lvd142m`, que procesa ambas imágenes a 518 píxeles de resolución. Una CNN pequeña procesa la franja ocular de la imagen frontal para capturar detalles finos de la zona de los ojos. Un MLP final proyecta las características combinadas a los 20 coeficientes de identidad craneal de MHR (coeficientes 20–39) y a 14 logits de pigmentación. Cada imagen se encuadra respecto a su propia cabeza, se leen nueve recortes ligeramente desplazados y escalados, y las salidas se promedian. MediaPipe Face Landmarker detecta la línea ocular y el fondo determina la coronilla.

El entrenamiento se realizó exclusivamente con renders sintéticos: en cada paso se muestrean personas aleatorias con coeficientes de cuerpo y cabeza de una normal estándar truncada a 2,5, sliders de piel y rasgos de un prior plausible, iluminación aleatoria y fondo gris. Los renders son ortográficos desde la frontal y el perfil izquierdo, con desplazamientos, escalas, desenfoque, gamma y ruido aleatorios. La función de pérdida reconstruye la piel de la cabeza a partir de los coeficientes predichos y la mide en milímetros, sumando los errores cuadráticos de coeficientes y sliders y la diferencia CIE76 de los colores. Se entrenó durante 6,8 horas en una RTX 3070 Laptop GPU: 6.502 pasos de 32 personas, tasa de aprendizaje 2e-5 con schedule coseno y pesos EMA. Partió de un lector anterior del mismo equipo entrenado sobre el modelo corporal Anny (no publicado); el código publicado parte de los pesos de DINOv2.

## Capacidades

- Reconstrucción de forma craneal 3D a partir de dos imágenes (frontal y perfil izquierdo) como 20 coeficientes de identidad del rig MHR.
- Estimación de color de piel y rasgos faciales mediante 14 parámetros de pigmentación: melanina epidérmica, proporción de eumelanina, sangre dérmica, factores para mejillas, nariz y zona bajo los ojos, melanina y sangre de labios, eumelanina y feomelanina de cejas e iris, y proporción de barba incipiente.
- Exportación de la cabeza reconstruida como malla OBJ sobre el cuerpo medio de MHR con la malla de SOMA (metros, eje Y hacia arriba, cara hacia +Z, sin globos oculares).
- Detección automática de la línea ocular y la coronilla mediante MediaPipe Face Landmarker.
- Manejo de perfiles que miran hacia la derecha de la imagen mediante espejado automático.
- Inferencia en CPU en aproximadamente diez segundos.
- Integración con el servidor Assets Studio para montar la cabeza sobre un personaje SOMA riggeado y texturizado.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- Creación de personajes 3D para videojuegos: a partir de dos fotos o renders de concepto de una cabeza calva, el modelo genera los coeficientes MHR y los pigmentos necesarios para reconstruir el personaje en el motor, eliminando el modelado manual de la geometría craneal.
- Pipeline de assets en estudio: el servidor Assets Studio integra la salida del lector directamente sobre un cuerpo SOMA riggeado y texturizado, de modo que el equipo de arte puede iterar sobre conceptos 2D y obtener avatares 3D listos para animación.
- Prototipado rápido de avatares: con inferencia en CPU de unos diez segundos, se pueden procesar lotes de conceptos en una estación de trabajo sin GPU dedicada y validar variaciones de diseño antes de la producción final.
- Personalización de avatares en aplicaciones: el modelo permite generar la forma y el tono de piel de un avatar a partir de dos imágenes de referencia, con parámetros de pigmentación editables (melanina, sangre, labios, cejas) que facilitan ajustes posteriores en la interfaz de usuario.
- Investigación en reconstrucción facial 3D: el modelo sirve como baseline reproducible para estudiar la regresión de parámetros de rigs humanos desde imágenes, con código de entrenamiento y evaluación publicado y métricas detalladas (error de piel en mm, R² de coeficientes, diferencia CIE76).
- Generación de datasets sintéticos etiquetados: el pipeline de entrenamiento descrito (muestreo de coeficientes, renderizado ortográfico, augmentación) puede reutilizarse para producir pares imagen–parámetro para entrenar otros modelos de reconstrucción.
- Integración en herramientas de creación de contenido: al devolver JSON con coeficientes y pigmentos, el modelo se puede conectar a DCCs (Blender, Maya, Unreal) mediante scripts que apliquen los parámetros a un rig MHR o SOMA existente.

## Benchmarks y rendimiento

Evaluación sobre 256 personas MHR aleatorias de una semilla no usada en entrenamiento, renderizadas como en entrenamiento. El error de la piel craneal es la distancia media de sus vértices a la verdad, reconstruida con el cuerpo verdadero, ambas cabezas centradas y escaladas a tamaño adulto.

| Error de la piel craneal (mm) | Media | Mediana | Percentil 90 |
|---|---|---|---|
| frommhr | 0,266 | 0,254 | 0,358 |
| Cabeza media de MHR sobre el cuerpo verdadero | 4,528 | 4,344 | 6,226 |
| Una cabeza promedio para todos | 4,518 | 4,290 | 6,098 |

R² de los 20 coeficientes craneales: 0,97–1,00.

| Diferencia de color, CIE76 | Piel | Mejillas | Nariz | Bajo los ojos | Labios | Cejas | Iris |
|---|---|---|---|---|---|---|---|
| Media | 1,39 | 2,31 | 1,87 | 2,09 | 1,56 | 2,27 | 1,39 |
| Percentil 90 | 2,51 | 4,01 | 3,21 | 3,84 | 2,84 | 5,13 | 2,72 |

El error mediano de melanina es del 6,5% (log 0,063), el de sangre del 14,3% (log 0,134); el error medio de la proporción de barba incipiente es 0,026. Estas cifras provienen de `evaluate.py` en CPU; 256 personas distintas dibujadas en GPU dieron un error medio de cabeza de 0,257 mm.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~25 M parámetros en fp32 el modelo ocupa aproximadamente 100 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el modelo se evaluó y entrenó en una RTX 3070 Laptop GPU; cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: PyTorch con timm, safetensors, MediaPipe, numpy y pillow; el script `predict.py` incluido. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput estimados: aproximadamente diez segundos por par de imágenes en CPU; no se publican cifras de latencia en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo se apoya en MHR (Meta) y SOMA (NVIDIA) como tecnologías de representación corporal, pero no se aportan datos de rendimiento de otros lectores de cabeza 3D con los que compararlo directamente.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| frommhr | ~25 M | no aplica | Apache 2.0 | Hugging Face y GitHub |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo adultos: el espacio de identidad de MHR se construyó a partir de escaneos de adultos, por lo que la imagen de un niño devuelve la cabeza adulta más cercana.
- Entrenamiento exclusivamente sintético: los números de evaluación miden el lector sobre su propio tipo de imagen; en imágenes reales o generadas no hay verdad de referencia y el rendimiento será peor.
- Requisitos estrictos de entrada: cabeza calva sin pelo, sombrero ni gafas; cabeza completa en la imagen con algo de fondo sobre la coronilla; fondo liso y uniforme; cara neutra con ojos abiertos; frontal mirando recto a cámara y perfil a 90°; poca perspectiva (los renders de entrenamiento son ortográficos y la perspectiva de una cámara de móvil cercana se interpreta como forma).
- No lee los coeficientes corporales (0–19) ni los de las manos (40–44), solo los 20 craneales.
- La exportación OBJ no incluye globos oculares.
- Riesgo de sesgo en la estimación de pigmentación y forma fuera de la distribución sintética de entrenamiento.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende de MHR (Meta) y SOMA (NVIDIA), cuyas licencias deben verificarse por separado para uso en producción.
- El modelo parte de pesos de un lector anterior no publicado; el código publicado parte de DINOv2, por lo que la reproducibilidad exacta del entrenamiento original no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zjgkkn/frommhr
- Código de datos, entrenamiento, evaluación y exportación: https://github.com/kvladsrc/gym/tree/main/frommhr
- Servidor Assets Studio: https://github.com/kvladsrc/gym/tree/main/assets_studio
- Momentum Human Rig (MHR) de Meta: https://github.com/facebookresearch/MHR
- SOMA de NVIDIA: https://huggingface.co/nvidia/soma-x
