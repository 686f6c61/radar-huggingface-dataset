# sugam24/geonusaf-tcsegformer-random-fold2

## Resumen

El modelo `sugam24/geonusaf-tcsegformer-random-fold2` es un sistema de segmentación semántica para imágenes de teledetección, desarrollado por Sugam Khatiwada (usuario `sugam24`). Está diseñado específicamente para clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. Forma parte de un proyecto más amplio denominado GeoNUSAF, que explora diferentes arquitecturas y estrategias de validación para la cartografía de cobertura terrestre.

El modelo emplea un backbone `nvidia/segformer-b0-finetuned-ade-512-512`, es decir, un transformer jerárquico ligero con atención eficiente, adaptado a imágenes de 512x512 píxeles con una resolución de 0,586 metros por píxel. Se trata del segundo pliegue (fold 2 de 3) de una validación cruzada con división aleatoria de los datos, utilizando una semilla fija (42). El repositorio tiene un tamaño de 0,7 GB y fue creado en agosto de 2026, aunque no se especifica licencia ni idiomas soportados.

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana y el monitoreo ambiental en regiones con datos de alta resolución, donde la segmentación precisa de usos del suelo es crítica. Al estar basado en SegFormer, ofrece un equilibrio entre eficiencia computacional y precisión, siendo adecuado para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (backbone `nvidia/segformer-b0-finetuned-ade-512-512`) |
| Parametros totales | no disponible (el backbone B0 tiene aproximadamente 3,7 millones, pero el modelo completo no se especifica) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión, procesa imágenes de 512x512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | no disponible |
| Formato de pesos | safetensors (inferido por el tamaño del repo y la plataforma HuggingFace) |

## Arquitectura y entrenamiento

El modelo se basa en SegFormer-B0, un transformer de visión jerárquico que combina un encoder con atención por ventanas y un decoder ligero basado en MLP. El backbone preentrenado en ADE20K se ajusta finamente para la segmentación semántica de uso del suelo. La entrada son imágenes de 512x512 píxeles con resolución de 0,586 m/px, y la salida es un mapa de etiquetas con 6 clases, ignorando los píxeles con valor 255.

El entrenamiento incorpora varias técnicas avanzadas: reweighting por clases (CSA) con tau específicos por clase y un peso mínimo de 0,25, una pérdida soft-clDice con mu=0,3, y un muestreador balanceado para manejar el desequilibrio de clases. La validación se realizó con división aleatoria de los datos (proxy de orden de exportación) en 3 pliegues, siendo este el segundo. La mejor época fue la 26. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset, aunque se trata de imágenes del valle de Katmandú.

## Capacidades

- Segmentación semántica de uso del suelo en 6 clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Procesamiento de imágenes de teledetección de alta resolución (0,586 m/px) en formato 512x512.
- Manejo de clases desbalanceadas mediante reweighting y muestreo balanceado.
- Inferencia sobre imágenes de satélite o aéreas para cartografía de cobertura terrestre.
- No soporta tool calling, agentes, ni razonamiento multi-paso (es un modelo puramente visual).
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Planificación urbana: el modelo puede generar mapas de uso del suelo actualizados para el valle de Katmandú, ayudando a identificar zonas residenciales, carreteras y espacios no utilizados, con una precisión media (mIoU 0,51) que permite análisis a nivel de distrito.
- Monitoreo ambiental: la detección de bosques y ríos con IoU de 0,67 y 0,52 respectivamente facilita el seguimiento de cambios en cobertura vegetal y recursos hídricos.
- Gestión de desastres: la segmentación de carreteras (IoU 0,33) y zonas residenciales (IoU 0,83) puede apoyar la evaluación de daños tras inundaciones o terremotos, aunque la baja precisión en carreteras limita su uso en rutas de evacuación.
- Agricultura de precisión: la clase agrícola (IoU 0,38) permite identificar parcelas de cultivo, aunque con margen de mejora para aplicaciones de campo.
- Estudios de expansión urbana: comparando predicciones a lo largo del tiempo, se puede cuantificar el crecimiento de áreas residenciales y la pérdida de suelo no utilizado.
- Investigación académica: sirve como baseline para comparar arquitecturas de segmentación en entornos de alta resolución con datos desbalanceados, dado que el autor publica múltiples variantes (fold1, UNetFormer, etc.).

## Benchmarks y rendimiento

Los resultados de validación publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,5100 |
| mF1 | 0,6558 |
| Exactitud global (OA) | 0,7768 |
| Kappa | 0,6257 |

Rendimiento por clase:

| Clase | IoU | Precision (UA) | Recall (PA) |
|---|---|---|---|
| Residencial | 0,8322 | 0,9160 | 0,9010 |
| Carretera | 0,3250 | 0,3898 | 0,6615 |
| Rio | 0,5190 | 0,6876 | 0,6791 |
| Bosque | 0,6725 | 0,8310 | 0,7791 |
| Suelo no utilizado | 0,3334 | 0,4241 | 0,6092 |
| Agricola | 0,3779 | 0,6513 | 0,4737 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los resultados muestran un rendimiento fuerte en clases dominantes (residencial, bosque) pero debil en clases minoritarias o lineales (carretera, suelo no utilizado).

## Requisitos de hardware

- VRAM estimada: al ser un modelo SegFormer-B0 con entrada 512x512, la inferencia requiere aproximadamente 1-2 GB de VRAM en FP32, y menos de 1 GB en cuantizacion FP16 o INT8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. Tambien puede ejecutarse en CPU con tiempos de inferencia de varios segundos por imagen.
- Se puede desplegar en hardware de consumo (tarjetas graficas de gama media) sin problemas.
- Opciones de despliegue: HuggingFace Transformers con PyTorch, o mediante ONNX Runtime para optimizacion. No se menciona soporte para vLLM, llama.cpp u Ollama (modelo de vision, no LLM).
- Latencia estimada: en una GPU RTX 3060, la inferencia de una imagen 512x512 deberia tomar entre 50 y 150 ms, dependiendo del batch y la optimizacion.

## Comparativa con modelos similares

El autor publica otros modelos del mismo proyecto GeoNUSAF, aunque no se proporcionan metricas comparativas en la informacion disponible. Se pueden mencionar como alternativas:

| Modelo | Arquitectura | Split | Fold | mIoU (val) |
|---|---|---|---|---|
| `geonusaf-tcsegformer-random-fold2` (este) | SegFormer-B0 | random | 2 | 0,5100 |
| `geonusaf-tcsegformer-random-fold1` | SegFormer-B0 | random | 1 | no disponible |
| `geonusaf-unetformer-r18-random-fold2` | UNetFormer (ResNet-18) | random | 2 | no disponible |

No se dispone de datos de rendimiento para los otros modelos, por lo que no es posible una comparativa cuantitativa. En terminos de arquitectura, UNetFormer combina un encoder ResNet con un decoder basado en transformers, mientras que SegFormer es completamente transformer. Ambos son adecuados para segmentacion de imagenes de teledeteccion.

## Limitaciones y advertencias

- Sesgos geograficos: el modelo esta entrenado exclusivamente con imagenes del valle de Katmandu, por lo que su generalizacion a otras regiones o condiciones climaticas es muy limitada.
- Desequilibrio de clases: las clases minoritarias (carretera, suelo no utilizado, agricola) presentan IoU por debajo de 0,4, lo que indica errores frecuentes en estas categorias.
- Riesgo de alucinacion: al ser un modelo de segmentacion, no genera texto, pero puede producir etiquetas espurias en areas ambiguas o con sombras.
- Licencia no especificada: no se indica la licencia, lo que impide conocer las restricciones de uso comercial o modificacion.
- Sin informacion sobre el dataset de entrenamiento: no se detalla el numero de imagenes, la fuente (satelite, drone, avion) ni el proceso de anotacion, lo que dificulta evaluar su robustez.
- Limitacion de resolucion: la entrada fija de 512x512 puede perder detalles en escenas muy grandes o requerir teselacion para imagenes completas.
- No apto para produccion sin validacion adicional: dado que es un modelo de investigacion con un solo fold, se recomienda evaluar con datos propios antes de usarlo en aplicaciones criticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sugam24/geonusaf-tcsegformer-random-fold2
- Modelo fold 1 (mismo autor): https://huggingface.co/sugam24/geonusaf-tcsegformer-random-fold1
- Modelo UNetFormer fold 2 (mismo autor): https://huggingface.co/sugam24/geonusaf-unetformer-r18-random-fold2
- Perfil de GitHub del autor: https://github.com/iamgroot2324/
