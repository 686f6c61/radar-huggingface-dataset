# VictorGoncalves/cobotsort-yolo11n-cubes

## Resumen

CobotSort YOLO11n es un detector de objetos derivado de YOLO11n (Ultralytics) y afinado por Victor Goncalves para localizar cubos de colores en la camara cenital de una celula robotica colaborativa simulada. El modelo forma parte del proyecto CobotSort AI, un sistema de clasificacion de cubos por color con capa de seguridad y un agente operador basado en LLM, y constituye su modulo de percepcion (modulo V). No es un modelo generativo ni un LLM: es un detector de una sola etapa con cuatro clases (`red_cube`, `green_cube`, `blue_cube`, `defect`).

Su particularidad es que se entreno exclusivamente con imagenes sinteticas renderizadas en MuJoCo, con etiquetado automatico a partir de renders de segmentacion y randomizacion de dominio (iluminacion, colores, pose de camara y distractores). No se uso ninguna fotografia real y, segun el autor, el modelo nunca se ha probado con una camara fisica. El interes tecnico esta en que demuestra que un detector afinado solo con datos sinteticos puede superar a un baseline clasico HSV en condiciones de iluminacion nunca vistas, lo que resulta relevante para pipelines de robotica que necesitan prototipar percepcion sin recoger datos reales.

El modelo es muy pequeno (variante n de YOLO11), se distribuye en formato PyTorch `.pt` y se ejecuta a unas 22 ms por fotograma en CPU, lo que lo hace apto para prototipos y simulacion, pero no para produccion con camaras reales sin un reentrenamiento o ajuste fino adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos publicados en `.pt`; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un YOLO11n preentrenado en COCO por Ultralytics y afinado para deteccion de cubos. La entrada son imagenes de 640x480 de la camara cenital de la celula simulada; la salida son cajas delimitadoras con clase y confianza para las cuatro clases definidas. El entrenamiento uso 560 imagenes sinteticas de entrenamiento y 120 de validacion, con 6.018 cajas en el conjunto sintetico completo y clases balanceadas. El schedule fue de 40 epocas, tamano de imagen 640, batch 16, semilla 0 y aumentacion por defecto de Ultralytics (mosaico desactivado en las ultimas 10 epocas). El entrenamiento completo tardo 336 segundos en una RTX 3060.

La innovacion principal no esta en la arquitectura, sino en el pipeline de datos: cada imagen se renderiza en MuJoCo y se etiqueta automaticamente a partir de los renders de segmentacion, aplicando randomizacion de dominio sobre iluminacion, colores, pose de camara y distractores. No se documento el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo por otra parte ajeno a un detector. El flujo de codigo del proyecto es `cobotsort dataset` -> `cobotsort train` -> `cobotsort eval-vision`.

## Capacidades

- Deteccion de objetos en imagenes cenitales de una celula robotica simulada, con cuatro clases: cubo rojo, cubo verde, cubo azul y cubo defectuoso (morado).
- Localizacion con error medio de 1,45 mm en el conjunto sintetico de test y 1,38 mm en el conjunto de iluminacion dificil (p95 de 1,65 mm y 2,37 mm respectivamente).
- Conversion de centro de caja a posicion de recogida mediante un modelo de camara pinhole (`pixel_to_world`, centro del cubo a z = 2 cm).
- Robustez a iluminacion fuera de distribucion: el conjunto dificil inclina la luz hasta 60 grados, varia la luz difusa de 0,08 a 1,3, la ambiental de 0,02 a 0,7 y tine el color por canal hasta mas o menos 0,25.
- Umbral de operacion de la celula fijado en confianza mayor o igual a 0,6 e IoU mayor o igual a 0,5.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un detector de vision.

## Casos de uso

- Prototipado de percepcion en robotica: permite validar un pipeline completo de pick-and-place en simulacion (MuJoCo) sin necesidad de recoger ni etiquetar imagenes reales, usando el modelo como modulo de deteccion dentro de la celula CobotSort.
- Clasificacion de cubos por color en lineas de seleccion simuladas: el modelo distingue rojo, verde, azul y defectuoso, y el centro de cada caja se transforma en una posicion de recogida para el cobot, lo que permite automatizar la separacion por color y el rechazo de piezas defectuosas.
- Generacion de datos sinteticos y aumento de dominio para otros proyectos: el pipeline de renderizado en MuJoCo con etiquetado automatico por segmentacion sirve como referencia para crear datasets de deteccion en robotica sin anotacion manual.
- Benchmarking de detectores frente a baselines clasicos: el modelo se evalua con el mismo codigo que un detector HSV, lo que permite comparar de forma justa un enfoque aprendido con uno heuristico en condiciones de iluminacion controladas y dificiles.
- Educacion y demostracion de integracion LLM-robotica: al formar parte de CobotSort AI, que incluye un agente operador LLM y una capa de seguridad, sirve para ilustrar como un agente de lenguaje puede orquestar tareas de percepcion y manipulacion en simulacion.
- Investigacion en sim-to-real: el modelo y sus resultados documentados (caida esperada al pasar a camaras reales) constituyen un punto de partida para estudiar tecnicas de adaptacion de dominio, ajuste fino con pocas imagenes reales o calibracion de camara.
- Analisis de latencia en CPU para despliegue en el borde: con 22 ms por fotograma en una CPU Intel de 14 hilos, es util para estimar requisitos de computo en controladores industriales sin GPU.

## Benchmarks y rendimiento

Resultados publicados por el autor en `results/perception.md`, calculados con el codigo propio del proyecto para ambos detectores. Precision y recall al punto de operacion de la celula (confianza mayor o igual a 0,6, IoU mayor o igual a 0,5). Tiempo de CPU en un escritorio Intel de 14 hilos, excluyendo los 3 primeros fotogramas.

| Detector | Conjunto | Imagenes | Cajas | Precision | Recall | mAP@50 | mAP@50-95 | CPU ms/frame | Error loc. medio / p95 (mm) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| HSV (clasico) | test sintetico | 120 | 901 | 1,000 | 0,977 | 0,992 | no disponible | 2,1 | 1,64 / 3,93 |
| HSV (clasico) | iluminacion dificil, nunca vista | 150 | 1.126 | 0,989 | 0,927 | 0,942 | no disponible | 2,1 | 1,97 / 5,42 |
| YOLO11n (este modelo) | test sintetico | 120 | 901 | 1,000 | 0,998 | 1,000 | 0,986 | 22,1 | 1,45 / 1,65 |
| YOLO11n (este modelo) | iluminacion dificil, nunca vista | 150 | 1.126 | 0,989 | 0,978 | 0,991 | 0,950 | 21,8 | 1,38 / 2,37 |

El validador propio de Ultralytics, ejecutado sobre el split de test sintetico con este archivo, da mAP@50 = 0,995 (su interpolacion de AP difiere de la del proyecto). En la celula, con 20 episodios automaticos y 176 cubos con iluminacion y camara fijas, el error de localizacion medido en cada escaneo es de 0,91 mm y los cubos terminan a 0,91 mm (media) de sus ranuras, con un 0 % en la bandeja equivocada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano de la variante n de YOLO11, es previsible que quepa holgadamente en GPUs de consumo, pero no se documenta una cifra concreta.
- GPU recomendadas: el autor reporta entrenamiento en una RTX 3060 (336 s, 40 epocas); para inferencia no se especifican GPU concretas.
- Cabe en GPU de consumo: si, el entrenamiento se realizo en una RTX 3060; no se documenta el consumo de VRAM.
- Opciones de despliegue: libreria Ultralytics (`ultralytics`), con descarga de pesos via `huggingface_hub`. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni despliegue con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de este tipo).
- Latencia y throughput: 22,1 ms por fotograma en test sintetico y 21,8 ms en iluminacion dificil, en CPU Intel de 14 hilos (unos 45 FPS teoricos en ese hardware). El baseline HSV tarda 2,1 ms por fotograma. No se reportan cifras en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CobotSort YOLO11n (este modelo) | Detector de una etapa, solo sintetico | no disponible (variante n) | Imagenes 640x480 | mAP@50 0,991 en iluminacion dificil; error loc. 1,38 mm | AGPL-3.0 | Hugging Face |
| Baseline HSV (clasico) | Segmentacion por color heuristica | no aplica | Imagenes 640x480 | mAP@50 0,942 en iluminacion dificil; error loc. 1,97 mm | no disponible | Codigo del proyecto CobotSort |
| YOLO11n preentrenado en COCO (Ultralytics) | Detector de una etapa, generico | no disponible | Imagenes de entrada variable | No evaluado en este dominio; no detecta las clases de cubos | AGPL-3.0 | Ultralytics / Hugging Face |

No se dispone de comparaciones con otros detectores especificos de cubos o de robotica en la informacion proporcionada.

## Limitaciones y advertencias

- Solo simulacion: el modelo se entreno y evaluo con renders de MuJoCo. Las camaras reales introducen desenfoque, ruido, distorsion de lente y reflejos que los renders no tienen, por lo que cabe esperar una caida de rendimiento en imagenes reales. El autor afirma explicitamente que nunca se ha probado con una camara fisica.
- Una sola escena: los cubos ocupan unos 25-30 px en la mesa de la celula y se ven desde arriba. Otros objetos, fondos o puntos de vista quedan fuera del alcance del modelo.
- Objetos pequenos: es una debilidad conocida de los detectores de una etapa; el autor planea comparar con un detector de dos etapas.
- Sin datos sobre sesgos: no se documentan sesgos conocidos, pero la randomizacion de color e iluminacion podria no cubrir todas las condiciones reales.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de falsos positivos o detecciones espurias fuera del dominio de entrenamiento.
- Licencia AGPL-3.0: es la licencia de Ultralytics YOLO11, de la que deriva el modelo. Impone obligaciones de copyleft fuerte para uso en red y puede ser incompatible con productos propietarios; conviene revisar con atencion antes de un uso comercial. El codigo de CobotSort es AGPL-3.0-or-later.
- Repositorio sin descargas ni likes en el momento de la consulta y con tamano de 0,0 GB registrado, lo que sugiere un proyecto muy reciente y con poca validacion externa.
- Sin informacion sobre cuantizacion, exportacion a otros formatos ni rendimiento en GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VictorGoncalves/cobotsort-yolo11n-cubes
- Dataset sintetico: https://huggingface.co/datasets/VictorGoncalves/cobotsort-synthetic-cubes
- Repositorio del proyecto CobotSort AI: https://github.com/VictorBarretoAndrade/BRICS_CobotSort
- Resultados de percepcion: https://github.com/VictorBarretoAndrade/BRICS_CobotSort/blob/main/results/perception.md
- Resultados de benchmark en la celula: https://github.com/VictorBarretoAndrade/BRICS_CobotSort/blob/main/results/benchmark.md
- Modelo base YOLO11 (Ultralytics): https://huggingface.co/Ultralytics/YOLO11
