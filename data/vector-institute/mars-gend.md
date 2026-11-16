# vector-institute/mars-gend

## Resumen

GenD es un detector de deepfakes en vídeo desarrollado por el Vector Institute dentro del proyecto MARS. No es un modelo generativo ni un LLM: es un clasificador binario a nivel de fotograma que asigna a cada frame una probabilidad de haber sido manipulado y agrega esas puntuaciones para obtener un veredicto sobre el clip completo. Esta versión concreta es una reimplementación del GenD original de Yermakov et al. (WACV 2026), entrenada y evaluada bajo el protocolo unificado de MARS para permitir comparaciones homogéneas con otros detectores.

Arquitecturalmente es un transformer de visión: parte del Perception Encoder PE-Core-L de Meta (ViT-L/14 a resolución 336x336, base `timm/vit_pe_core_large_patch14_336.fb`) y congela todos sus pesos salvo las capas de normalización, que se afinan junto con una única capa lineal de clasificación. El resultado es un checkpoint extremadamente ligero en parámetros entrenables (unos 106.000 según los safetensors del repo, 0,4 MB), aunque el grafo completo con el encoder asciende a 1,28 GB en formato ONNX.

Su relevancia práctica radica en que ofrece un detector de manipulación facial en vídeo con pesos abiertos (Apache 2.0), exportación ONNX autónoma y un AUROC medio de 88,46 en el protocolo MARS con 10 épocas, lo que lo convierte en una línea base sólida para pipelines de moderación de contenido, verificación de identidad y análisis forense de medios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L/14 (Perception Encoder PE-Core-L) con capas de normalización afinadas y cabeza lineal |
| Parametros totales | 106.498 entrenables (0,4 MB); el encoder PE-Core-L completo se descarga aparte desde timm |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 64 fotogramas por clip a 336x336 px |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors fp32 y ONNX fp32) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (solo capas entrenadas) y ONNX (grafo completo, 1,28 GB) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de adaptación parcial: el backbone PE-Core-L (ViT-L/14, parches de 14 px, entrada 336x336) permanece congelado y solo se entrenan las capas de normalización del encoder más una capa lineal que clasifica el vector de características agrupado y normalizado en L2. Cada fotograma recibe una puntuación independiente y la puntuación del clip es la media de las puntuaciones de sus fotogramas. El preprocesado muestrea un fotograma de cada dos (stride 2), agrupa en clips consecutivos de 64 frames, rellena el último clip repitiendo el frame final y redimensiona a 336x336 sin recorte, con normalización a [-1, 1].

El entrenamiento se realizó bajo el protocolo MARS con 4 GPU NVIDIA A40 durante 84,94 horas-GPU (24,96 kWh, 1,62 kg CO2eq medidos con CodeCarbon en Ontario, Canadá). Este checkpoint se entrenó durante 10 épocas, mientras que la tabla principal del paper MARS reporta GenD con la receta compartida de 3 épocas, donde alcanza un AUROC medio de 65,78. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de aumento de datos más allá del muestreo descrito.

## Capacidades

- Detección de deepfakes y falsificaciones faciales en vídeo, con salida de probabilidad por clip y logits por clase (auténtico/manipulado).
- Clasificación a nivel de fotograma: cada frame obtiene su propia puntuación, lo que permite localizar segmentos manipulados dentro de un vídeo.
- Manejo de clips de longitud variable mediante el parámetro `n_valid`, que indica cuántos fotogramas del clip son reales frente a relleno.
- Inferencia sin PyTorch: el ONNX incluye el encoder completo y funciona solo con ONNX Runtime (CPU o GPU).
- Integración con el ecosistema `timm` para el backbone y con el paquete `mars` para el pipeline de datos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de visión.

## Casos de uso

- Moderación de contenido en plataformas de vídeo: puntuar automáticamente los clips subidos y derivar a revisión humana aquellos con P(manipulado) por encima de un umbral calibrado sobre validación propia.
- Verificación de identidad en procesos KYC: analizar el vídeo de prueba de vida y detectar si el rostro ha sido sintetizado o reemplazado antes de aceptar la verificación.
- Análisis forense de medios: localizar, frame a frame, los tramos manipulados de una grabación aportada como prueba, gracias a la puntuación individual por fotograma.
- Monitorización de campañas de desinformación: procesar lotes de vídeos virales y priorizar los que presentan alta probabilidad de manipulación para su verificación periodística.
- Detección en tiempo casi real en el borde: el ONNX de 1,28 GB puede ejecutarse con ONNX Runtime en servidores con GPU o CPU, integrándose en pipelines de ingesta sin depender de PyTorch.
- Investigación en detección de deepfakes: servir como línea base reproducible bajo el protocolo MARS para comparar nuevos detectores con métricas homogéneas (AUROC medio).
- Auditoría de datasets: filtrar colecciones de vídeo de entrenamiento para eliminar muestras sintéticas antes de usarlas en otros modelos.

## Benchmarks y rendimiento

| Metrica | Receta MARS (3 epocas) | Este checkpoint (10 epocas) |
|---|---|---|
| AUROC medio | 65,78 | 88,46 |

No se han publicado en la información disponible resultados desglosados por dataset (por ejemplo, FaceForensics++, Celeb-DF o DFDC), ni comparativas numéricas con otros detectores del proyecto MARS.

## Requisitos de hardware

- VRAM estimada: el encoder PE-Core-L en fp32 requiere del orden de 1,2-1,5 GB para pesos, más activaciones de un clip de 64x3x336x336; con `autocast` en bfloat16 el consumo baja notablemente. El ONNX en fp32 ocupa 1,28 GB en disco.
- GPU recomendadas: NVIDIA A40 (la usada en entrenamiento), A100 o H100 para procesamiento por lotes de muchos clips; RTX 4090 y RTX 3090 son suficientes para inferencia individual.
- GPU de consumo: cabe en cualquier GPU con 8 GB o más de VRAM; también puede ejecutarse en CPU con ONNX Runtime, a costa de mayor latencia.
- Despliegue: ONNX Runtime (`onnxruntime-gpu` o `onnxruntime`), o PyTorch con el paquete `mars` del repositorio de Vector Institute. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de clips por vídeo (un clip por cada 128 fotogramas originales, dado el stride 2 y la ventana de 64).

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | AUROC medio (MARS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mars-gend (este) | ViT-L/14 PE-Core-L, norm layers + linear | 64 frames 336x336 | 88,46 (10 epocas) / 65,78 (3 epocas) | Apache 2.0 | Hugging Face, ONNX incluido |
| GenD original (Yermakov et al.) | ViT-L/14 PE-Core-L | no disponible | no disponible (métricas del paper original) | no disponible | GitHub yermandy/GenD |
| Otros detectores del proyecto MARS | no disponible | no disponible | reportados en el paper MARS | no disponible | Hugging Face vector-institute/mars |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas externas al proyecto (por ejemplo, XceptionNet o EfficientNet-B4 entrenados en FaceForensics++).

## Limitaciones y advertencias

- Las puntuaciones no están calibradas: para tomar decisiones binarias es necesario elegir un umbral sobre datos de validación del propio dominio de despliegue.
- El rendimiento depende fuertemente de la receta de entrenamiento: la misma arquitectura pasa de 65,78 a 88,46 de AUROC medio según se entrene 3 o 10 épocas, por lo que las cifras no son directamente comparables con las del paper original de GenD.
- Solo se entrenan las capas de normalización y la cabeza lineal; el backbone congelado puede limitar la adaptación a dominios muy distintos del dataset de entrenamiento (cámaras, compresiones o resoluciones atípicas).
- El muestreo descarta un fotograma de cada dos y agrupa en clips de 64, de modo que manipulaciones de muy corta duración podrían quedar inframuestreadas.
- Riesgo de falsos positivos y negativos en vídeos con baja calidad, oclusiones faciales o iluminación adversa; no se documentan análisis de sesgo por demografía, etnia o género.
- No se especifican los idiomas ni la composición del dataset de entrenamiento, lo que dificulta evaluar la cobertura geográfica y cultural del detector.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece información sobre robustez frente a ataques adversariales.
- El checkpoint safetensors no es autónomo: requiere descargar PE-Core-L desde timm y el código del repositorio `mars` para reconstruir el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vector-institute/mars-gend
- Paper MARS (arXiv 2611.12508): https://arxiv.org/abs/2611.12508
- Repositorio de código MARS: https://github.com/VectorInstitute/mars
- Colección MARS en Hugging Face: https://huggingface.co/vector-institute/mars
- Código original de GenD: https://github.com/yermandy/GenD
- Backbone PE-Core-L en timm: https://huggingface.co/timm/vit_pe_core_large_patch14_336.fb
