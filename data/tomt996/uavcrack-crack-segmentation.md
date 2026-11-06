# Tomt996/uavcrack-crack-segmentation

## Resumen

UAVCrack es un modelo de segmentacion semantica binaria especializado en la deteccion de grietas en pavimentos a partir de imagenes capturadas por drones (UAV). Lo desarrolla Tomt996 como participacion en el desafio VLP 2026, pista D (UAV-Crack), y se distribuye como pesos entrenados de una U-Net con encoder ResNet-34 preentrenado en ImageNet. Con 24.429.281 parametros y una entrada fija de 384x672 pixeles, el modelo aborda un problema dificil por la naturaleza del objetivo: las grietas ocupan solo entre el 1 y el 5 % de los pixeles de la imagen y, con zoom X4, presentan anchuras de apenas 2-3 px.

El interes tecnico del modelo esta en las cuatro capas de diseno que aplica sobre una arquitectura clasica: inicializacion del bias de salida a -4 para alinear la probabilidad inicial con la clase minoritaria, una funcion de perdida CAL combinada con Dice, un ensemble de cinco semillas con cinco vistas geometricas deterministas, y una etapa de postprocesado con filtrado por area de componentes conexas y refinamiento por puerta de confianza. El ensemble de cinco semillas es la unica mejora con significacion estadistica demostrada (ganancia de +0,7935 IoU, IC 95 % [+0,538, +1,045] con 2000 remuestreos bootstrap emparejados).

El modelo se publica bajo licencia MIT, con pesos en formato PyTorch (`state_dict`) y ONNX (opset 18, pesos embebidos), y una comparacion numerica entre ambas salidas con error absoluto maximo de 7,44e-05. Es un modelo de nicho, orientado a inspeccion de infraestructuras, no un modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet34-UNet (encoder ImageNet preentrenado, decoder entrenado desde cero) |
| Parametros totales | 24.429.281 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision con entrada fija 384x672) |
| Tipos de cuantizacion | no disponible (solo pesos float32 en PyTorch y ONNX) |
| Idiomas soportados | zh, en (etiquetas de la model card; la tarea es de vision, no linguistica) |
| Licencia | MIT (pesos); dataset UAV-CrackX bajo CC BY-NC-SA 3.0 |
| Formato de pesos | PyTorch `state_dict` (`.pt`), ONNX opset 18 con pesos embebidos (`.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net con encoder ResNet-34 inicializado con pesos de ImageNet y decoder entrenado desde cero. La entrada es un tensor `(1, 3, 384, 672)` float32, normalizado con media y desviacion estandar de ImageNet y rellenado por reflexion hasta 384 filas; la salida son logits `(1, 1, 384, 672)` que se recortan a las 378 filas originales antes de aplicar sigmoid. La funcion de perdida combina CAL (δ=0,5, γ=0,2, λ=0,5) con 0,5 x Dice. El termino `p^γ` de CAL con γ=0,2 concentra el gradiente en los pixeles vecinos a la grieta que resultan dificiles de clasificar, en lugar de en el fondo mayoritario.

El entrenamiento usa las 1177 imagenes de UAV-CrackX (tras limpiar 23 con ruido de etiqueta), 30 epocas, batch de 10, optimizador AdamW con tasa de aprendizaje 3e-4 y decaimiento coseno hasta 1e-6, y precision mixta automatica (AMP). La innovacion principal no esta en la arquitectura sino en el esquema de inferencia: el ensemble promedia las probabilidades de cinco semillas (101, 202, 303, 404, 505) y cada una se evalua bajo cinco vistas geometricas deterministas (escala 1,0 a 0 grados; 0,85 a -10 grados; 1,15 a +10 grados; 1,0 a 0 grados con volteo; 0,90 a +5 grados con volteo), de modo que se cubren las anchuras aparentes de los zooms X4, X8 y X16. El postprocesado aplica filtrado de componentes conexas con area minima 50 y un refinamiento por puerta que solo sube el umbral de 0,20 a 0,25 en la banda de 1 px del borde predicho, sin tocar el nucleo de la mascara; el autor documenta que una reconstruccion de esqueleto dura hunde el rendimiento en X4 hasta 22,45 de IoU.

## Capacidades

- Segmentacion semantica binaria de grietas en imagenes de pavimento capturadas por UAV.
- Salida a nivel de pixel con logits y probabilidad tras sigmoid, apta para cuantificacion posterior (longitud y anchura de grieta).
- Funcionamiento en CPU y GPU mediante ONNX Runtime con `CPUExecutionProvider` o proveedores CUDA.
- Robustez a tres escalas de zoom (X4, X8, X16) gracias a las cinco vistas geometricas del ensemble.
- Carga por separado de cada semilla, lo que permite operar con un unico modelo cuando el coste importa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente visual de segmentacion.

## Casos de uso

- Inspeccion automatizada de carreteras con drones: el modelo procesa ortomosaicos o fotogramas capturados por UAV y produce mascaras de grieta que un sistema posterior puede vectorizar para medir longitud y anchura por tramo, gracias a su entrenamiento especifico sobre UAV-CrackX.
- Mantenimiento predictivo de infraestructura viaria: integrado en un pipeline que recorre vuelos periodicos, permite comparar mascaras entre campanas y detectar el crecimiento de fisuras antes de que deriven en baches.
- Priorizacion de reparaciones: al generar mascaras por pixel con precision y recall cercanos al 80 %, el modelo alimenta un sistema de scoring que ordena los tramos de via segun severidad de fisuracion.
- Despliegue en campo con hardware modesto: la version ONNX con 24,4 M de parametros y entrada 384x672 puede ejecutarse en CPU o en GPU de consumo, lo que permite montar el modelo en el propio dron o en una estacion base sin grandes requisitos de computo.
- Analisis de calidad de firmes en obra nueva: tras el extendido de aglomerado, un vuelo con zoom X8 o X16 permite verificar automaticamente la ausencia de fisuras antes de recepcionar el tramo.
- Investigacion en segmentacion de estructuras finas: el modelo y sus cinco semillas sirven como linea base reproducible para estudiar tecnicas de desbalance extremo (bias inicial, CAL, Dice) y de ensemble geometrico en tareas con objetivos de 1-5 % de pixeles.
- Generacion de mascaras pseudo-etiquetadas: las predicciones del ensemble pueden usarse para preanotar las 300 imagenes sin etiquetar que el autor identifica como la mayor palanca de mejora, con revision humana posterior.

## Benchmarks y rendimiento

Resultados sobre el conjunto interno de confirmacion (193 imagenes con ground truth, agregacion micro). No son puntuaciones del test ciego oficial de VLP.

| Metodo | Crack IoU | Precision | Recall |
|---|---|---|---|
| Modelo individual | 64,5796 | 79,08 | 77,89 |
| Ensemble de 5 semillas | 65,3719 | 76,65 | 81,63 |
| Ensemble + filtrado por area | 65,4060 | no disponible | no disponible |
| Ensemble + filtrado + puerta de confianza | 65,5053 | 77,3 | 81,3 |

Desglose por nivel de zoom (ensemble de 5 semillas):

| Zoom | Crack IoU | Precision | Recall | Observacion |
|---|---|---|---|---|
| X4 | 63,24 | 70,34 | 86,24 | Cuello de botella; grietas de 2-3 px |
| X8 | 66,23 | 78,00 | 81,44 | Equilibrado |
| X16 | 66,04 | 80,38 | 78,73 | Ligera infra-deteccion |

La ganancia del ensemble frente al modelo individual (+0,7935 IoU) se valido con 2000 remuestreos bootstrap emparejados (IC 95 % [+0,538, +1,045]) y es la unica mejora del estudio con significacion estadistica. El autor advierte que el conjunto de validacion oficial comparte un 96,5 % de solapamiento a nivel de fotograma con el de entrenamiento, por lo que las puntuaciones oficiales seran mas altas y no comparables con estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 24,4 M de parametros en float32 el peso ronda los 98 MB por semilla, y el ensemble completo de cinco semillas ocupa aproximadamente 490 MB de pesos, mas activaciones de la U-Net para 384x672.
- GPU recomendadas: no se especifican en la model card. Por tamano, cualquier GPU con al menos 4-6 GB de VRAM deberia alojar el ensemble completo; una RTX 4090 o A100 ejecutaria el ensemble con holgura, y una GPU de consumo tipo RTX 3060 seria suficiente para una sola semilla.
- Cabe en GPU de consumo: si, con margen amplio, dado el reducido numero de parametros y la entrada fija de 384x672.
- Opciones de despliegue: ONNX Runtime (proveedores CPU y CUDA), PyTorch nativo cargando cada `seed*.pt` con `model.py` del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentacion.
- Latencia y throughput: no disponibles. El coste de inferencia es aproximadamente 5x el de un modelo individual al promediar cinco semillas; el autor indica que usar K=2 pierde alrededor de 0,5 puntos de IoU si se necesita tiempo real.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de segmentacion de grietas en la informacion proporcionada. Como referencias de categoria, podrian citarse segmentadores genericos como Segment Anything (SAM) o arquitecturas U-Net clasicas, pero no hay datos de rendimiento en UAV-CrackX para ninguno de ellos en la documentacion disponible, por lo que la comparacion cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| UAVCrack (este modelo) | 24,4 M | 384x672 fijo | MIT (pesos) | Hugging Face, GitHub |
| Segmentadores genericos (SAM, U-Net) | no disponible | variable | variable | no disponible para esta tarea |

## Limitaciones y advertencias

- El zoom X4 sigue sin resolverse: con anchuras de 2-3 px el modelo presenta un desequilibrio claro entre precision (70,3) y recall (86,2), y el autor confirma que 10 de 11 metodos probados empeoran este caso.
- El coste de inferencia se multiplica por cinco al usar el ensemble completo; con una sola semilla se pierden aproximadamente 0,8 puntos de IoU.
- Las 300 imagenes sin etiquetar de UAV-CrackX no se aprovecharon: los intentos de aprendizaje semiautomatico colapsaron (IoU entre 0,07 y 0,18), por lo que el modelo no explota ese volumen adicional de datos.
- El encoder depende de pesos preentrenados en ImageNet; si una competicion o un entorno prohibe preentrenamiento externo, habria que reentrenar con una caida esperada de 2-3 puntos (no medida).
- Las metricas publicadas provienen de un conjunto interno de 193 imagenes, no del test ciego oficial; ademas, la validacion oficial solapa un 96,5 % con el entrenamiento, lo que invalida comparaciones directas con las cifras mostradas.
- El dataset UAV-CrackX esta bajo CC BY-NC-SA 3.0 y solo admite uso no comercial en el marco del desafio, con prohibicion explicita de redistribucion; los pesos son MIT, pero el uso comercial del modelo entrenado sobre ese dataset requiere revisar la compatibilidad de licencias.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al ser un modelo discriminativo de segmentacion, el riesgo principal es de falsos positivos y negativos en texturas de pavimento similares a grietas (juntas, manchas, sombras), no de generacion de contenido inventado.
- El modelo no procesa texto ni mantiene conversaciones; las etiquetas de idioma zh/en de la model card no implican capacidades linguisticas.
- La entrada esta fijada a 384x672 con relleno por reflexion; imagenes de otra relacion de aspecto requieren redimensionado o recorte previo, lo que puede alterar la anchura aparente de las grietas y el rendimiento por zoom.

## Enlaces

- Hugging Face: https://huggingface.co/Tomt996/uavcrack-crack-segmentation
- Repositorio de codigo: https://github.com/Tom713134/UAVCrack-Crack-Segmentation
- Dataset UAV-CrackX: https://github.com/SHAN-JH/UAV-CrackX-Datasets
- Solicitud del desafio VLP (pista D): http://vlp.chd.edu.cn/tasks/4
- Paper de referencia (Shan et al., IEEE T-ITS, 2024): no disponible como enlace directo en la informacion proporcionada
