# UGREENDEV/RK182X-CNN-YOLOv6s

## Resumen

RK182X-CNN-YOLOv6s es un modelo de deteccion de objetos basado en YOLOv6s (procedente del repositorio meituan/YOLOv6) convertido al formato RKNN para su ejecucion sobre las NPU de los SoC Rockchip RK1820 y RK1828. Lo publica el usuario UGREENDEV en Hugging Face y ModelScope, y su proposito no es servir como modelo de proposito general, sino como artefacto listo para desplegar en hardware embebido con aceleracion NPU. La conversion se ha realizado con la version v1.1.0 del RKNN Runtime.

El modelo es una CNN de deteccion de una sola etapa, configurada a una resolucion de entrada de 640x640 y cuantizada en modo w8a8 (pesos y activaciones a 8 bits) sobre un unico nucleo NPU. El repositorio no contiene pesos en formato estandar (PyTorch o safetensors) sino un directorio de configuracion con los binarios RKNN, un `config.json`, sumas de verificacion SHA-256 y documentacion de despliegue.

Su relevancia es acotada pero concreta: cubre el caso de quien necesita ejecutar deteccion de objetos en tiempo real sobre placas Rockchip RK1820/RK1828 sin pasar por el proceso de conversion y cuantizacion. La licencia GPL-3.0 del modelo original condiciona fuertemente su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion de una etapa (YOLOv6s, convertida a RKNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | RKNN (binarios para RKNN Runtime v1.1.0) |
| Resolucion de entrada | 640x640 |
| Chips soportados | RK1820, RK1828 |
| Nucleos NPU | 1 |
| Version de RKNN Runtime | v1.1.0 |
| Modelo origen | meituan/YOLOv6 |

## Arquitectura y entrenamiento

El modelo subyacente es YOLOv6s, un detector de objetos de una sola etapa de la familia YOLOv6 desarrollada por Meituan. Se trata de una CNN con un backbone y un cuello de agregacion de caracteristicas que produce predicciones de cajas y clases directamente en una pasada, lo que la hace adecuada para inferencia de baja latencia en dispositivos. El repositorio no aporta detalles sobre el dataset de entrenamiento original, el numero de imagenes, la composicion de clases ni si hubo tecnicas de destilado o reentrenamiento; esa informacion debe consultarse en el repositorio de Meituan.

La innovacion de este artefacto no esta en el entrenamiento sino en la conversion: el modelo se ha exportado y cuantizado a w8a8 para ejecutarse sobre la NPU de los SoC RK1820 y RK1828 mediante RKNN Runtime v1.1.0, con una unica configuracion publicada (YOLOv6s-640x640-w8a8-1). El repositorio incluye un `config.json` con el manifiesto de ficheros y un `SHA256SUMS` para verificar la integridad de los binarios antes del despliegue. No se documentan tecnicas como decodificacion especulativa ni mecanismos de atencion, por no ser aplicables a este tipo de modelo.

## Capacidades

- Deteccion de objetos en imagenes a resolucion 640x640, con salida de cajas delimitadoras y clases.
- Inferencia acelerada por NPU en los SoC Rockchip RK1820 y RK1828.
- Ejecucion cuantizada w8a8 sobre un unico nucleo NPU, orientada a bajo consumo y despliegue en dispositivos.
- Verificacion de integridad de los artefactos mediante sumas SHA-256 incluidas.
- Distribucion dual desde Hugging Face y ModelScope con comandos de descarga selectiva por configuracion.
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto ni capacidades multilingues: es exclusivamente un modelo de vision para deteccion.

## Casos de uso

- Vigilancia y videovigilancia en placa embebida: el modelo se ejecuta sobre la NPU del RK1820/RK1828 procesando fotogramas a 640x640, lo que permite deteccion en tiempo real en camaras IP o NVR con hardware Rockchip sin depender de un servidor externo.
- Inspeccion industrial en linea de produccion: integrado en un equipo con SoC RK182X, detecta piezas o defectos visibles en cada unidad que pasa por la camara, con la ventaja de la cuantizacion w8a8 para mantener latencia baja y consumo contenido.
- Robotica movil y drones: al ejecutarse en NPU de bajo consumo, es adecuado para percepcion a bordo en robots de almacen o vehiculos ligeros que necesitan deteccion de obstaculos y objetos sin conexion a la nube.
- Analisis de trafico y aforo: despliegue en dispositivos de borde en carretera o accesos para contar vehiculos y personas, aprovechando la resolucion 640x640 y la inferencia local para evitar enviar video a un servidor.
- Automatizacion de comercio minorista: deteccion de productos en estanterias o en cajas de autopago mediante camaras conectadas a placas RK1820/RK1828, con procesamiento local que reduce costes de ancho de banda.
- Prototipado rapido en hardware Rockchip: sirve como punto de partida verificado (con SHA-256) para equipos que ya trabajan con RK182X y necesitan un detector funcional antes de entrenar su propio modelo con clases especificas.
- Agricultura de precision: deteccion de frutos, plagas o maquinaria en imagenes capturadas por dispositivos de campo con SoC Rockchip, donde el consumo y la autonomia son criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, latencia ni throughput para el modelo convertido, ni comparaciones con la version original de YOLOv6s en PyTorch.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta sobre NPU integrada en los SoC RK1820 y RK1828, no sobre GPU dedicada.
- Chips objetivo: exclusivamente Rockchip RK1820 y RK1828. No es ejecutable en GPU de escritorio ni en CPU convencional mediante este artefacto.
- GPU recomendadas: no aplica. Para ejecutar el modelo original de Meituan en GPU se requeriria el repositorio de origen y sus propios pesos, no incluidos aqui.
- Compatibilidad con GPU de consumo: no; el formato RKNN esta ligado al runtime y driver de Rockchip.
- Despliegue: RKNN Runtime v1.1.0 con el driver correspondiente. Es imprescindible comprobar la version en el dispositivo con `rknn-smi -v` antes de ejecutar. No se soportan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Cuantizacion | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK182X-CNN-YOLOv6s | YOLOv6s convertido a RKNN | 640x640 | w8a8 | RK1820, RK1828 | GPL-3.0 | Hugging Face, ModelScope |
| meituan/YOLOv6 (original) | YOLOv6 en PyTorch | configurable (s, m, l) | FP32/FP16 | GPU/CPU | GPL-3.0 | GitHub de Meituan |
| YOLOv8 (Ultralytics) | Detector de una etapa | configurable | FP32/FP16/INT8 | GPU/CPU/NPU via exportacion | AGPL-3.0 | GitHub, Hugging Face |
| YOLOv5 (Ultralytics) | Detector de una etapa | configurable | FP32/FP16/INT8 | GPU/CPU/NPU via exportacion | GPL-3.0 | GitHub |

La comparativa se limita a caracteristicas estructurales: no se dispone de datos de rendimiento (mAP, latencia) del artefacto RKNN que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- El modelo solo es ejecutable en los SoC Rockchip RK1820 y RK1828 con RKNN Runtime v1.1.0 y el driver correspondiente; no es portable a otros aceleradores ni a GPU estandar.
- La cuantizacion w8a8 puede degradar la precision de deteccion respecto al modelo en punto flotante original; no se publican metricas que cuantifiquen esa perdida.
- Las clases detectables son las del entrenamiento original de YOLOv6s (tipicamente las 80 clases de COCO), por lo que no cubre categorias especificas de un dominio concreto sin reentrenamiento.
- Licencia GPL-3.0: el uso en productos propietarios o servicios en red puede quedar sujeto a obligaciones de distribucion del codigo fuente; conviene revisar el fichero `NOTICE` y la licencia completa antes de integrarlo.
- Los binarios del repositorio son derivados convertidos y siguen sujetos a la licencia del modelo original; las licencias del RKNN Toolkit y del RKNN Runtime tambien aplican, y las librerias de runtime no se incluyen en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los binarios podrian no estar completamente subidos o que su validacion comunitaria es nula.
- No se documentan sesgos del modelo original ni riesgos de alucinacion (no aplica), pero si los sesgos propios del dataset de entrenamiento de YOLOv6, que no se detallan.
- Es imprescindible verificar las sumas SHA-256 antes del despliegue; el autor lo indica explicitamente en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-YOLOv6s
- Modelo en ModelScope: https://modelscope.cn/models/UGREENDEV/RK182X-CNN-YOLOv6s
- Repositorio del modelo original YOLOv6 (Meituan): https://github.com/meituan/YOLOv6
