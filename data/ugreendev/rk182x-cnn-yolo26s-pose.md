# UGREENDEV/RK182X-CNN-YOLO26s-Pose

## Resumen

RK182X-CNN-YOLO26s-Pose es un modelo de visión por computador de tipo CNN, concretamente una variante de estimación de pose (pose estimation) derivada de YOLO26s del repositorio Ultralytics, convertida al formato RKNN para su ejecución sobre las NPU de los chips Rockchip RK1820 y RK1828. Lo publica el usuario UGREENDEV en Hugging Face bajo el identificador `UGREENDEV/RK182X-CNN-YOLO26s-Pose`.

No se trata de un modelo de lenguaje ni de un modelo generativo: es un artefacto de despliegue compilado para inferencia en hardware embebido. El repositorio no contiene pesos en formato estándar (safetensors, GGUF, ONNX) sino un paquete RKNN cuantizado a w8a8 con resolución de entrada fija de 640x640 y un solo núcleo NPU, junto con los ficheros de configuración, sumas de verificación SHA-256 y avisos de licencia.

Su relevancia es acotada pero concreta: permite ejecutar detección de puntos clave del cuerpo humano (keypoints) sobre plataformas Rockchip RK182X sin necesidad de recompilar el modelo desde Ultralytics, siempre que se disponga del runtime RKNN v1.1.0 y del driver correspondiente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLO26s-Pose de Ultralytics, convertida a RKNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | other (modelo fuente bajo GNU Affero General Public License v3.0; se aplican además las licencias de RKNN Toolkit y RKNN Runtime) |
| Formato de pesos | RKNN (runtime v1.1.0), con `config.json` y `SHA256SUMS` por configuración |
| Resolucion de entrada | 640x640 |
| Nucleos NPU | 1 |
| Chips soportados | RK1820, RK1828 |
| Version de runtime RKNN | v1.1.0 |
| Modelo fuente | ultralytics/ultralytics |
| Tarea | Estimación de pose (keypoints) |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO26s-Pose, una CNN de detección y estimación de pose de la familia Ultralytics YOLO26 en su variante "s" (small). El autor no documenta en la model card ni el número de parámetros, ni el dataset de entrenamiento, ni el número de tokens o imágenes, ni si hubo ajuste fino adicional. La model card se limita a indicar que el modelo es una conversión del modelo fuente de Ultralytics y a describir el proceso de empaquetado para RKNN.

La innovación técnica relevante no está en el entrenamiento sino en la conversión: el modelo se compila con RKNN Toolkit para ejecutarse sobre la NPU de los SoC Rockchip RK1820 y RK1828, con cuantización w8a8 y resolución fija de 640x640. El paquete incluye `config.json` con el manifiesto de ficheros y `SHA256SUMS` para verificar la integridad de la descarga antes del despliegue. No se documentan técnicas como decodificación especulativa, atención lineal ni mecanismos equivalentes, por no ser aplicables a este tipo de modelo.

## Capacidades

- Estimación de pose humana: detección de keypoints sobre imágenes de entrada de 640x640.
- Inferencia sobre NPU Rockchip RK1820 y RK1828 mediante runtime RKNN v1.1.0.
- Ejecución cuantizada w8a8 con un solo núcleo NPU.
- Verificación de integridad de los ficheros mediante SHA-256.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la propia tarea de pose.

## Casos de uso

- Análisis de postura en aplicaciones de fitness: el modelo detecta keypoints corporales sobre fotogramas de 640x640, lo que permite calcular ángulos articulares y corregir la técnica de ejercicio en dispositivos con SoC RK1820/RK1828.
- Control de gestos en interfaces embebidas: al ejecutarse sobre NPU de bajo consumo, puede integrarse en paneles interactivos o kioscos que respondan a la posición del cuerpo del usuario sin enviar vídeo a la nube.
- Monitorización de ergonomía en puestos de trabajo: procesamiento local de imágenes de cámara para estimar la postura del trabajador y alertar de posiciones de riesgo, aprovechando la inferencia w8a8 para reducir el consumo energético.
- Robótica y seguimiento de personas: el modelo puede alimentar bucles de control que necesiten la posición de articulaciones a partir de la cámara del robot, con la ventaja de ejecutarse en el propio SoC Rockchip.
- Análisis deportivo en dispositivos de borde: extracción de esqueletos por fotograma para reconstruir el movimiento de un atleta en grabaciones locales, sin depender de conectividad.
- Prototipado de visión en hardware Rockchip: sirve como bloque de referencia para validar pipelines de conversión RKNN y medir latencia real en RK1820/RK1828 antes de entrenar un modelo propio.
- Aplicaciones de realidad aumentada en dispositivos empotrados: superposición de elementos gráficos anclados a keypoints corporales, con la resolución fija de 640x640 como restricción de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP, OKS), latencia ni throughput para el modelo convertido.

## Requisitos de hardware

- Hardware de destino: SoC Rockchip RK1820 o RK1828 con NPU integrada; no está pensado para GPU de escritorio.
- Runtime: RKNN Runtime v1.1.0 y driver compatible. El autor recomienda comprobar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM estimada para inferencia: no disponible (no aplica; se ejecuta sobre NPU, no sobre GPU).
- GPU recomendadas: no aplica; el modelo no está empaquetado para CUDA ni para GPUs de consumo como RTX 4090, A100 o H100.
- Despliegue: exclusivamente mediante RKNN Runtime sobre los chips indicados; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son herramientas aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Cuantizacion | Hardware destino | Licencia |
|---|---|---|---|---|---|
| RK182X-CNN-YOLO26s-Pose (este) | CNN pose (YOLO26s) | 640x640 | w8a8 | RK1820, RK1828 | other (fuente AGPL-3.0) |
| YOLO26s-Pose de Ultralytics (fuente) | CNN pose | configurable | sin cuantizar (PyTorch) | GPU/CPU genéricos | AGPL-3.0 |
| Otras conversiones RKNN de YOLO pose | CNN pose | variable | variable | Rockchip | variable |

No se dispone de datos de rendimiento del modelo convertido que permitan una comparación cuantitativa con alternativas. La comparación se limita a características de despliegue y licencia.

## Limitaciones y advertencias

- El modelo solo funciona en RK1820 y RK1828 con RKNN Runtime v1.1.0 y driver compatible; no es portable a otras plataformas sin reconversión.
- La resolución de entrada está fijada a 640x640; imágenes de otra resolución requieren preprocesado previo.
- La cuantización w8a8 puede degradar la precisión de los keypoints respecto al modelo en punto flotante; no se publican métricas que cuantifiquen esa pérdida.
- No se documentan sesgos del dataset de entrenamiento ni evaluación de robustez; al tratarse de un modelo de pose, puede fallar en oclusiones, poses atípicas o condiciones de iluminación adversas.
- La licencia del modelo fuente es AGPL-3.0, lo que impone obligaciones de copyleft sobre el software que lo integre en red; el campo `license: other` del repositorio remite al fichero `LICENSE` y `NOTICE` para los detalles. Es imprescindible revisar ambos antes de un uso comercial.
- Se aplican adicionalmente las licencias de RKNN Toolkit y RKNN Runtime, que pueden restringir la redistribución.
- El repositorio declara 0 descargas y 0 likes, y un tamaño de 0.0 GB; conviene verificar la integridad con `sha256sum -c SHA256SUMS` antes de desplegar.
- No hay información sobre mantenimiento, versiones futuras ni soporte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-YOLO26s-Pose
- Modelo fuente (Ultralytics): https://github.com/ultralytics/ultralytics
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-CNN-YOLO26s-Pose --revision master --local_dir ./RK182X-CNN-YOLO26s-Pose`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-CNN-YOLO26s-Pose --revision v1.1.0 --local-dir ./RK182X-CNN-YOLO26s-Pose`
- Documentación de configuración incluida en el repo: `YOLO26s-Pose-640x640-w8a8-1/README.md` y `README_CN.md`
