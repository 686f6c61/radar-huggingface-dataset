# UGREENDEV/RK182X-VIT-dinov3-vitl16-pretrain-lvd1689m

## Resumen
Este repositorio contiene una conversión al formato RKNN del modelo de visión `facebook/dinov3-vitl16-pretrain-lvd1689m`, un Vision Transformer (ViT-L/16) de Meta diseñado para extracción de características visuales de propósito general. La conversión la publica UGREENDEV y está orientada específicamente a la NPU integrada en los chips Rockchip RK1820 y RK1828, con el objetivo de permitir inferencia local de extractores de características visuales en dispositivos de borde.

El artefacto no es un modelo de lenguaje ni un modelo multimodal completo: es un backbone ViT cuantizado (w4a16) que emite embeddings visuales y no incluye cabeza de clasificación ni cabezas de tareas posteriores. La resolución de entrada fijada en esta configuración es 224x224 y se ejecuta sobre 8 núcleos NPU del SoC RK182X.

Su relevancia radica en que permite desplegar DINOv3 en hardware de bajo consumo sin GPU dedicada, un escenario habitual en visión embebida (inspección industrial, robótica, cámaras inteligentes). La licencia del modelo fuente es la DINOv3 License, que impone restricciones de uso que deben revisarse antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/16), DINOv3 |
| Parametros totales | no disponible (repo de 0,2 GB con pesos cuantizados w4a16; el modelo fuente ViT-L ronda los 300 M, dato no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada fija 224x224 px) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades linguisticas) |
| Licencia | DINOv3 License (etiquetada como `other` en Hugging Face) |
| Formato de pesos | RKNN (runtime RKNN v1.1.0); no se distribuyen safetensors ni GGUF en este repo |
| Modelo base | facebook/dinov3-vitl16-pretrain-lvd1689m |
| Chips soportados | RK1820, RK1828 |
| Resolucion de entrada | 224x224 |
| Nucleos NPU | 8 |
| Version de runtime RKNN | v1.1.0 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento
El modelo subyacente es DINOv3 ViT-L/16 de Meta, un transformer de visión con parches de 16x16 entrenado con el paradigma de auto-supervisión DINO (autodestilación con profesor momentum y pérdida de coherencia entre vistas). DINOv3 se entrena sobre un corpus de imágenes a gran escala (LVD-1689M según el identificador del checkpoint) y produce representaciones densas de alta calidad que funcionan bien como features congeladas para tareas downstream.

La información disponible no detalla el proceso de conversión más allá de los parámetros de compilación: cuantización de pesos a 4 bits con activaciones en 16 bits, entrada fija 224x224 y reparto en 8 núcleos NPU. No se especifican métodos de calibración, dataset de calibración ni métricas de degradación por cuantización. Tampoco se documentan innovaciones de entrenamiento adicionales más allá de las propias del modelo fuente.

## Capacidades
- Extracción de características visuales densas (embeddings por parche y globales) a partir de imágenes RGB de 224x224.
- Sirve como backbone congelado para tareas downstream: clasificación, recuperación de imágenes (image retrieval), segmentación con cabezas añadidas, detección de anomalías visuales.
- No incluye cabeza de clasificación ni cabezas de tareas específicas; el autor lo indica explícitamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades lingüísticas, multimodales texto-imagen, audio ni generación de texto.
- No dispone de modo "thinking" ni decodificación especulativa (no aplica a un encoder de visión).
- Inferencia orientada a NPU Rockchip RK1820/RK1828 con runtime RKNN v1.1.0.

## Casos de uso
- Inspección visual industrial en el borde: usar los embeddings del ViT para detectar defectos comparando distancias en el espacio de características contra un banco de imágenes de referencia, ejecutando todo en el SoC RK182X sin GPU.
- Recuperación de imágenes en dispositivos de bajo consumo: indexar embeddings de 224x224 y hacer búsqueda por similitud coseno en bases de datos locales para catálogos o archivos fotográficos embebidos.
- Preprocesado de pipelines de robótica: alimentar un módulo de percepción con features densas para localización o reconocimiento de objetos, aprovechando los 8 núcleos NPU para mantener latencia baja en el propio robot.
- Clasificación con cabeza ligera: congelar el backbone y entrenar una cabeza lineal o MLP pequeña para tareas específicas de dominio (por ejemplo, control de calidad en línea de producción).
- Detección de anomalías en cámaras inteligentes: comparar embeddings de fotogramas con una distribución de referencia para disparar alertas cuando la distancia supera un umbral.
- Segmentación asistida con cabezas externas: usar los mapas de features por parche como entrada a decodificadores ligeros en aplicaciones de agricultura de precisión o monitorización ambiental.
- Prototipado de visión en placas Rockchip: validar pipelines de visión antes de portar a producción en hardware RK1820/RK1828, gracias a la verificación SHA-256 incluida en el repo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Hardware objetivo: NPU de los SoC Rockchip RK1820 y RK1828 (8 núcleos NPU), no GPU convencional.
- Runtime: RKNN Runtime v1.1.0 y driver compatible; verificar en el dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM: no aplica; el modelo se ejecuta sobre memoria del SoC. El repositorio ocupa 0,2 GB, lo que da una idea del orden de magnitud de los pesos cuantizados.
- GPU de escritorio: no es el destino de este artefacto; para inferencia en GPU habría que usar los pesos originales de `facebook/dinov3-vitl16-pretrain-lvd1689m`.
- Cabe en GPU de consumo solo en su versión original (no RKNN), cuya viabilidad depende del checkpoint fuente, no documentado aquí.
- Opciones de despliegue: RKNN Toolkit / RKNN Runtime en el dispositivo; descarga vía `hf download` o `modelscope download`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| RK182X-VIT-dinov3-vitl16 (este) | ViT-L/16 DINOv3, cuantizado w4a16 | no disponible (pesos 4 bits) | 224x224 px | DINOv3 License | RKNN |
| facebook/dinov3-vitl16-pretrain-lvd1689m | ViT-L/16 DINOv3 | no disponible en la informacion | 224x224 px (configuracion tipica) | DINOv3 License | safetensors (formato original de Meta, no confirmado aqui) |
| CLIP ViT-L/14 | ViT-L/14 con texto | no disponible en la informacion | 224x224 px | MIT (variantes abiertas) | safetensors / ONNX |
| SigLIP ViT-L/16 | ViT-L/16 con texto | no disponible en la informacion | 224x224 px | Apache 2.0 / variantes | safetensors |

La comparación relevante es con el checkpoint original de DINOv3 (misma arquitectura, sin cuantizar) y con otros backbones visuales de tamaño similar. La diferencia clave de este repositorio no es la calidad del modelo sino el formato y la orientación a NPU Rockchip, con la contrapartida de la cuantización w4a16.

## Limitaciones y advertencias
- No incluye cabeza de clasificación ni cabezas de tareas; hay que añadirlas y entrenarlas aparte.
- Cuantización w4a16: puede degradar la calidad de los embeddings respecto al checkpoint original; no se documenta la pérdida medida.
- Solo soporta RK1820 y RK1828; no es portable a otras NPU ni a GPU sin reconversión.
- Requiere runtime RKNN v1.1.0 y driver compatible; versiones distintas pueden fallar.
- Entrada fija 224x224: no admite resoluciones variables sin recompilar.
- Licencia DINOv3: restricciones de uso que deben revisarse; los artefactos son derivados del modelo fuente y siguen sujetos a esa licencia.
- No hay datos publicados de sesgos, alucinación (no aplica a un encoder) ni evaluación en tareas downstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- El autor no documenta el dataset de calibración ni métricas de fidelidad de la conversión.

## Enlaces
- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VIT-dinov3-vitl16-pretrain-lvd1689m
- Modelo base: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- ModelScope (mismo autor): descarga vía `modelscope download --model UGREENDEV/RK182X-VIT-dinov3-vitl16-pretrain-lvd1689m`
- Licencia DINOv3: archivo `LICENSE` dentro del repositorio
- Atribución y modificaciones de conversión: archivo `NOTICE` dentro del repositorio
- Documentación de configuración: subdirectorio `dinov3-vitl16-pretrain-lvd1689m-224x224-w4a16-8/README.md`
