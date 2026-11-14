# wesjos/YOLO26n-head-detection-cut-P3

## Resumen

YOLO26n-head-detection-cut-P3 es un modelo de deteccion de objetos de una sola clase (`head`) derivado de Ultralytics YOLO26n, la variante nano de la familia YOLO26. El autor, wesjos, ha eliminado la rama de deteccion P3 (la de mayor resolucion, especializada en objetos pequenos) y ha conservado unicamente las ramas P4 y P5, orientadas a objetos medianos y grandes. El resultado es un detector con entrada fija de 320x320 que emite una caja delimitadora y una confianza por cada cabeza detectada.

El modelo resuelve un problema muy concreto: la deteccion de cabezas y rostros en escenarios de primer plano donde la cara ocupa al menos el 2% del encuadre. Esta pensado para videoconferencia, control de acceso de corto alcance, retransmision en directo y camaras frontales de telefono, y explicitamente no para vigilancia de largo alcance ni multitudes densas vistas desde el aire. Al recortar la rama P3, reduce el coste computacional en aproximadamente un 17,5% respecto al YOLO26n completo (de 1,450 a 1,196 GFLOPs a 320), manteniendo el numero de parametros practicamente identico.

La relevancia actual del modelo es doble: por un lado, demuestra una estrategia de poda estructural (eliminar una rama entera del cuello y la cabeza, no solo la capa de deteccion) que mejora la eficiencia sin sacrificar el rendimiento en objetos medianos y grandes; por otro, publica una evaluacion estadisticamente rigurosa con intervalos de confianza por bootstrap pareado y desglose de recall por tamano de objeto, algo poco habitual en modelos de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo YOLO (Ultralytics YOLO26n) con dos cabezas de deteccion (P4 y P5), rama P3 eliminada |
| Parametros totales | 2.535,7 K (pesos completos); cifra tras fusion de BatchNorm no disponible en el extracto |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 320x320) |
| Tipos de cuantizacion | no disponible (se distribuye en PyTorch y ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, `head320_yolo26n_full2h_best.pt`) y ONNX (opset no especificado) |

## Arquitectura y entrenamiento

El modelo parte de Ultralytics YOLO26n, un detector de una etapa con backbone convolucional y cuello de agregacion multi-escala que produce tres niveles de caracteristicas: P3 (resolucion 1/8, sensible a objetos pequenos), P4 (1/16, objetos medianos) y P5 (1/32, objetos grandes). La modificacion del autor elimina por completo la ruta que conduce a P3 —incluyendo el upsample, la concatenacion y las convoluciones asociadas—, no solo la cabeza de deteccion. Esta distincion es importante: borrar unicamente la cabeza ahorra en torno al 2,5% de computo (de 1,450 a 1,414 GFLOPs a 320), mientras que eliminar la rama entera ahorra el 17,5% (hasta 1,196 GFLOPs). Tras la fusion de BatchNorm, las cifras comparativas son del 1,2% y del 17,5% respectivamente.

El entrenamiento se realizo sobre el conjunto completo de anotaciones, sin descartar ninguna caja delimitadora, lo que segun el autor preserva toda la informacion disponible para las escalas P4 y P5. El modelo se entreno en modo `end2end=False` (esquema one2many), lo que implica que la salida cruda de ONNX contiene cajas candidatas sin supresion y requiere un paso externo de NMS; sin el, una sola cara produce multiples cajas solapadas. La resolucion de entrenamiento es 320x320 y el autor advierte que cambiarla a 640 degrada gravemente la precision (la mAP50-95 cae de 0,930 a 0,686). No se detallan en la informacion disponible el numero de tokens ni la composicion exacta del dataset, ni si hubo fases de ajuste fino con RLHF o DPO (no aplicable en un detector de objetos).

## Capacidades

- Deteccion de cabezas y rostros de una sola clase (`head`), devolviendo por cada instancia una caja en formato xyxy y una puntuacion de confianza.
- Entrada de resolucion fija 320x320, optimizada para escenas donde la cara ocupa el 2% o mas del encuadre.
- Deteccion robusta de objetivos medianos (2-10% del area de la imagen) y grandes (>10%), con recall desglosado por tamano de objeto en la evaluacion del autor.
- Inferencia en tiempo real gracias al bajo coste computacional (1,196 GFLOPs a 320) y a la eliminacion de la rama de mayor resolucion.
- Exportacion a ONNX para despliegue sin PyTorch, con soporte de ejecucion mediante onnxruntime.
- Integracion con el ecosistema Ultralytics (API `YOLO`, `predict`, pipeline de preprocesado y postprocesado incluidos).
- Procesamiento por lotes (b1, b8, b32, b64) para reducir la latencia media por imagen en entornos de servidor.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues, vision general, audio ni modo de pensamiento; es exclusivamente un detector visual de una clase.

## Casos de uso

- Videoconferencia con encuadre automatico: el modelo detecta la cabeza del interlocutor en cada fotograma y permite a la aplicacion centrar o recortar la vista. Su coste de 1,196 GFLOPs a 320 lo hace viable en tiempo real sobre CPU o GPU integrada.
- Control de acceso de corto alcance: en un lector de proximidad, la cara ocupa una fraccion alta del encuadre (por encima del 2%), justo el regimen para el que se diseno el modelo; la salida de caja y confianza alimenta el pipeline de reconocimiento posterior.
- Retransmision en directo: deteccion de cabezas de presentadores o invitados en fotogramas de streaming para generar recortes, subtitulos posicionados o efectos de seguimiento, con latencia baja por imagen en lotes b8 o b32.
- Camara frontal de telefono: el modelo cabe en el presupuesto computacional de un dispositivo movil al tener solo 2,5 M de parametros y 1,196 GFLOPs, y su entrada de 320x320 encaja con el procesado en tiempo real de la camara selfie.
- Anonimizacion de rostros en videos grabados: deteccion de cabezas por fotograma para aplicar desenfoque o pixelado antes de publicar material audiovisual; la licencia AGPL-3.0 condiciona su integracion en productos de codigo cerrado.
- Preprocesado para analitica de audiencia: conteo de personas presentes en una sala o frente a una pantalla a partir de las cabezas detectadas, con umbral de confianza ajustable (por defecto 0,25) para equilibrar recall y falsos positivos.
- Filtrado previo en pipelines de vision: usar el detector como etapa rapida que descarta fotogramas sin cabezas antes de ejecutar modelos mas costosos de reconocimiento facial o analisis de pose.

## Benchmarks y rendimiento

Los datos disponibles en la model card permiten construir la siguiente tabla comparativa entre la variante de dos cabezas (este modelo) y la de tres cabezas:

| Metrica | Este modelo (2 cabezas) | Version 3 cabezas | Cambio |
|---|---|---|---|
| Parametros (pesos completos) | 2.535,7 K | 2.533,9 K | +0,07% (practicamente igual) |
| GFLOPs a 320 (sin fusion) | 1,196 | 1,450 | -17,5% |
| GFLOPs a 320 (tras fusion BN) | no disponible en el extracto | no disponible en el extracto | -17,5% |
| mAP50-95 a 320 (resolucion de entrenamiento) | 0,930 | no disponible | no disponible |
| mAP50-95 a 640 (fuera de distribucion) | 0,686 | no disponible | no disponible |

El autor reporta ademas que la diferencia de mAP50-95 entre variantes se evaluo con bootstrap pareado (1.000 remuestreos a nivel de imagen, intervalo de confianza del 95%), y que un descenso de 0,9485 a 0,9278 equivale a 2,08 puntos porcentuales. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un detector de objetos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2,5 M de parametros y entrada de 320x320, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer, e incluso en memoria unificada de dispositivos moviles.
- GPU recomendadas: no se especifican en la informacion disponible; por su perfil (1,196 GFLOPs, 320x320) es adecuado para RTX 4090, RTX 3060 y GPUs integradas, asi como para ejecucion en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en CPU, dado el reducido numero de parametros y operaciones.
- Opciones de despliegue: Ultralytics (API `YOLO`), onnxruntime para el modelo ONNX, y OpenCV para el preprocesado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput estimados: no disponibles en el extracto; la model card menciona mediciones en ms/imagen para lotes b1, b8, b32 y b64, pero no se incluyen los valores numericos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP50-95 | Licencia | Notas |
|---|---|---|---|---|---|
| YOLO26n-head-detection-cut-P3 (este) | 2,5 M | 320x320 | 0,930 (a 320) | AGPL-3.0 | Una clase, rama P3 eliminada |
| Ultralytics YOLO26n (3 cabezas) | 2,53 M | configurable | no disponible | AGPL-3.0 | Referencia de la que deriva; 1,450 GFLOPs a 320 |
| YOLOv8n | no disponible en la informacion | configurable | no disponible | AGPL-3.0 | Alternativa nano de la generacion anterior; sin datos comparativos en la fuente |
| Otros detectores de rostro ligeros | no disponible | no disponible | no disponible | variable | No se aportan datos en la informacion disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks de terceros que permitan una comparacion cuantitativa con alternativas como YOLOv8n o detectores de rostro especializados; la unica comparacion con datos es frente a la variante de tres cabezas del mismo modelo base.

## Limitaciones y advertencias

- No detecta objetos pequenos: al eliminar la rama P3, los objetivos por debajo del 2% del area de la imagen (menos de 45x45 px a 320) quedan fuera de su regimen util, segun el propio autor.
- No apto para vigilancia de largo alcance, multitudes densas vistas desde el aire ni miniaturas de fotos de carnet, escenarios que el autor excluye explicitamente.
- La resolucion de entrada debe ser 320x320; usar 640 degrada la mAP50-95 de 0,930 a 0,686, por lo que cualquier cambio de `imgsz` invalida el rendimiento declarado.
- La salida ONNX cruda requiere NMS externo; sin ese paso, una sola cara genera multiples cajas solapadas.
- Entrenado en modo `end2end=False`, por lo que no emite cajas ya filtradas de forma nativa.
- Licencia AGPL-3.0: el uso comercial en productos de codigo cerrado exige cumplir las obligaciones de copyleft de la AGPL, lo que puede ser incompatible con determinados despliegues propietarios.
- Riesgo de alucinacion en sentido estricto no aplica (es un detector, no un generador de texto), pero si existe riesgo de falsos positivos y falsos negativos segun el umbral de confianza; el valor por defecto es 0,25.
- Sesgos conocidos: no se documentan en la informacion disponible; al ser un detector de cabezas entrenado sin detallar la composicion del dataset, el rendimiento puede variar segun demografia, iluminacion y condiciones de captura.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano declarado de 0,0 GB; se trata de una publicacion reciente y sin validacion externa por parte de la comunidad.
- No se especifican los idiomas soportados ni el opset ONNX, datos que figuran como no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/YOLO26n-head-detection-cut-P3
- Repositorio de Ultralytics: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
