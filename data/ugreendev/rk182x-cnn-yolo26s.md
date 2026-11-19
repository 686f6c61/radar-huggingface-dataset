# UGREENDEV/RK182X-CNN-YOLO26s

## Resumen

RK182X-CNN-YOLO26s es un modelo de deteccion de objetos basado en una red neuronal convolucional (CNN) YOLO26s, convertido al formato RKNN para su ejecucion sobre las NPU de los SoC Rockchip RK1820 y RK1828. Lo publica el usuario UGREENDEV en Hugging Face y deriva del repositorio ultralytics/ultralytics, es decir, del modelo YOLO26s de Ultralytics convertido mediante el toolkit RKNN (runtime v1.1.0). No se trata por tanto de un modelo de lenguaje, sino de un detector de objetos para despliegue en hardware embebido de bajo consumo.

El interes practico del artefacto reside en que empaqueta una configuracion lista para produccion sobre aceleradores Rockchip: resolucion de entrada de 640x640, cuantizacion de pesos y activaciones a 8 bits (w8a8) y un unico nucleo NPU. Esto permite ejecutar deteccion de objetos en tiempo real en dispositivos de borde (camaras IP, robots, pasarelas industriales) sin GPU dedicada.

La informacion disponible es muy limitada: el repositorio ocupa 0,0 GB, no registra descargas ni interacciones y la model card solo documenta la conversion, los ficheros y los requisitos de compatibilidad, sin datos de entrenamiento, parametros ni benchmarks. La licencia del modelo fuente es AGPL-3.0, lo que condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLO26s, familia YOLO de Ultralytics), convertida a RKNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | no aplica (deteccion de objetos, sin capacidades linguisticas) |
| Licencia | other (modelo fuente bajo GNU AGPL v3.0; se aplican ademas las licencias de RKNN Toolkit y RKNN Runtime) |
| Formato de pesos | RKNN (runtime v1.1.0); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una CNN de deteccion de objetos de la familia YOLO26s, originalmente publicada en el repositorio ultralytics/ultralytics y posteriormente convertida al formato RKNN con la version de runtime v1.1.0. La conversion esta orientada a las NPU integradas en los chips Rockchip RK1820 y RK1828, con una unica configuracion disponible: resolucion 640x640, cuantizacion w8a8 y un solo nucleo NPU. El repositorio incluye el directorio de configuracion YOLO26s-640x640-w8a8-1, con config.json, manifiesto de ficheros y sumas SHA-256 para verificar la integridad antes del despliegue.

No se dispone de informacion sobre el numero de parametros, el volumen de tokens o imagenes de entrenamiento, la composicion del dataset, ni sobre si el modelo fuente empleo tecnicas de alineacion o ajuste fino especificas. La model card no documenta innovaciones tecnicas adicionales mas alla de la propia cuantizacion w8a8 para NPU y la conversion a RKNN.

## Capacidades

- Deteccion de objetos en imagenes de entrada de 640x640 pixeles, con salida de cajas delimitadoras y clases segun el modelo YOLO26s de origen.
- Inferencia acelerada por NPU en los chips Rockchip RK1820 y RK1828 mediante el runtime RKNN v1.1.0.
- Ejecucion en dispositivos de borde con un unico nucleo NPU, pensada para entornos de bajo consumo energetico.
- Verificacion de integridad de los ficheros mediante SHA-256 (SHA256SUMS incluido en el directorio de configuracion).
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision por computador.
- No se documentan capacidades de segmentacion, pose, clasificacion ni vision-lenguaje en la informacion disponible.

## Casos de uso

- Videovigilancia en el borde: el modelo se ejecutaria sobre una camara IP o una pasarela con SoC RK1820/RK1828 para detectar personas y objetos en tiempo real, sin enviar video a la nube y con la cuantizacion w8a8 reduciendo el coste computacional.
- Robotica movil y AGV: integrado en el controlador de un robot con Rockchip RK182X para deteccion de obstaculos y personas a 640x640, aprovechando el bajo consumo de la NPU.
- Inspeccion industrial automatizada: deteccion de defectos o piezas en lineas de produccion mediante camaras conectadas a un dispositivo embebido con RK1820/RK1828, con verificacion previa de checksums para garantizar la integridad del modelo desplegado.
- Agricultura de precision: conteo y localizacion de frutos, plagas o ganado en drones o estaciones de campo con hardware Rockchip, donde no hay espacio para una GPU.
- Analitica de aforo y trafico: conteo de vehiculos y personas en puertas o carreteras mediante dispositivos de borde con RK182X, procesando flujos de video localmente.
- Prototipado de sistemas de deteccion embebidos: uso del repositorio como referencia de conversion YOLO26s a RKNN para validar pipelines de cuantizacion w8a8 y despliegue en NPU antes de escalar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware de destino: SoC Rockchip RK1820 y RK1828, con NPU compatible con RKNN Runtime v1.1.0.
- No es un modelo para GPU de escritorio ni para servidores con A100, H100 o RTX 4090: el artefacto distribuido es un binario RKNN para NPU embebida.
- VRAM estimada: no disponible; el modelo se ejecuta sobre la memoria del SoC Rockchip, no sobre memoria de GPU.
- Despliegue: runtime RKNN v1.1.0 con el driver correspondiente; se recomienda comprobar la version en el dispositivo con `rknn-smi -v` antes de ejecutar.
- No compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Cuantizacion | Hardware | Licencia |
|---|---|---|---|---|---|
| RK182X-CNN-YOLO26s (este) | CNN YOLO26s convertida a RKNN | 640x640 | w8a8 | Rockchip RK1820/RK1828 | AGPL-3.0 (fuente) |
| YOLO26s original (ultralytics/ultralytics) | CNN YOLO26s | configurable | FP32/FP16/INT8 | GPU/CPU genericos | AGPL-3.0 |
| Otras conversiones RKNN de la familia YOLO | CNN YOLO | variable | variable | Rockchip | segun modelo fuente |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia del modelo fuente es GNU Affero General Public License v3.0 (AGPL-3.0), lo que impone obligaciones de liberacion de codigo en servicios en red; es imprescindible revisar LICENSE y NOTICE antes de cualquier uso comercial.
- Se aplican adicionalmente las licencias del RKNN Toolkit y del RKNN Runtime, que pueden restringir la redistribucion del binario convertido.
- El modelo solo funciona en los chips RK1820 y RK1828 con el runtime RKNN v1.1.0 y el driver correspondiente; no es portable a otras plataformas sin reconversion.
- Debe usarse conjuntamente el contenido del directorio de configuracion seleccionado; mezclar ficheros de distintas configuraciones puede producir fallos.
- No hay informacion publicada sobre sesgos, tasas de alucinacion (detecciones falsas), precision por clase ni limitaciones de dominio del dataset de entrenamiento.
- El repositorio no registra descargas ni validacion por parte de la comunidad, por lo que su robustez en produccion no esta contrastada.
- La cuantizacion w8a8 puede degradar la precision respecto al modelo en punto flotante; no se documenta la perdida de mAP asociada.
- No dispone de capacidades linguisticas, de razonamiento ni de agente; cualquier caso de uso que requiera texto queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-YOLO26s
- Modelo fuente: https://github.com/ultralytics/ultralytics
- Descarga via ModelScope: `modelscope download --model UGREENDEV/RK182X-CNN-YOLO26s --revision master`
- Descarga via Hugging Face CLI: `hf download UGREENDEV/RK182X-CNN-YOLO26s --revision v1.1.0`
- Documentacion de configuracion: directorio `YOLO26s-640x640-w8a8-1/README.md` dentro del repositorio
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
