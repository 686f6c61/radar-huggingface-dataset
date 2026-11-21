# ytiemani/ch4-plume-benchmark-weights

## Resumen
CH4 plume benchmark weights es una coleccion de cinco modelos de segmentacion de imagenes entrenados para detectar penachos sinteticos de metano en imagenes Sentinel-2 L1C. El repositorio lo publica ytiemani (Yves Tiemani, autor de los modelos, el pipeline de datos y el entrenamiento) y esta orientado a tareas de teledeteccion y benchmarking de segmentacion binaria sobre imagenes multiespectrales. Su relevancia es metodologica: proporciona un banco de pruebas reproducible con etiquetas exactas, ya que los penachos se inyectan artificialmente en escenas reales atenuando la banda B12, lo que permite comparar arquitecturas de segmentacion sin la ambiguedad de las anotaciones manuales.

Cada modelo recibe una entrada de 14 canales construida a partir de una escena de evento y una escena de referencia anterior del mismo lugar, en parches de 128x128 pixeles. Las arquitecturas son deliberadamente ligeras (entre 1,33 y 3,75 millones de parametros): Attention U-Net, DeepLabV3+, U-Net, U-Net++ y PhysTAUNet, una U-Net de doble codificador con informacion fisica. El repositorio ocupa 0,1 GB y los pesos se distribuyen como checkpoints de PyTorch.

Es importante subrayar que no se trata de un modelo listo para produccion ni de un detector de metano real. El propio autor advierte que el entrenamiento y la evaluacion se hicieron exclusivamente con penachos sinteticos y que los modelos generan falsos positivos en un 44-81% de los parches sin penacho, por lo que no deben usarse como detectores tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cinco arquitecturas de segmentacion: Attention U-Net, DeepLabV3+, U-Net, U-Net++, PhysTAUNet (U-Net de doble codificador con informacion fisica) |
| Parametros totales | 1,33 M (DeepLabV3+) a 3,75 M (PhysTAUNet); Attention U-Net 1,97 M; U-Net 1,93 M; U-Net++ 1,93 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada de imagen de 14 canales y 128x128 pixeles) |
| Tipos de cuantizacion | No disponible (checkpoints PyTorch en precision original) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoints de PyTorch (`.pt`) con claves `model`, `config` y `best_f1` |

## Arquitectura y entrenamiento
Los cinco modelos son redes neuronales convolucionales de segmentacion semantica binaria. Cuatro de ellas son arquitecturas estandar de la literatura (U-Net, U-Net++, Attention U-Net y DeepLabV3+) y la quinta, PhysTAUNet, es una U-Net de doble codificador con informacion fisica disenada especificamente para esta tarea. La entrada tiene 14 canales: se combina una escena de evento con una escena de referencia anterior de la misma localizacion, lo que permite al modelo explotar la diferencia temporal para aislar la senal del penacho.

El conjunto de datos se construye inyectando penachos sinteticos en imagenes Sentinel-2 reales (datos Copernicus modificados de 2023 a 2025) mediante atenuacion de la banda B12. Este procedimiento garantiza que cada etiqueta de entrenamiento sea exacta a nivel de pixel, eliminando el ruido de las anotaciones manuales. El metodo de inyeccion de penachos sinteticos se atribuye a Sonachi Mogbogu. La evaluacion se realiza sobre 2.048 penachos sinteticos en escenas de test reservadas, con F1 a nivel de pixel y umbral de 0,5. No se dispone de informacion sobre el numero total de tokens o muestras de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de ajuste fino adicionales.

## Capacidades
- Segmentacion binaria de penachos de metano sinteticos en imagenes Sentinel-2 L1C a nivel de pixel.
- Procesamiento de entradas multiespectrales de 14 canales combinando escena de evento y escena de referencia.
- Trabajo sobre parches de 128x128 pixeles.
- Comparacion de cinco arquitecturas de segmentacion bajo un mismo protocolo de evaluacion.
- Carga programatica mediante la funcion `core.load_model` del repositorio de la aplicacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), vision general, audio ni otras capacidades multimodales fuera de la segmentacion de imagenes satelitales.

## Casos de uso
- Benchmarking de arquitecturas de segmentacion: el repositorio permite comparar de forma controlada U-Net, U-Net++, Attention U-Net, DeepLabV3+ y PhysTAUNet sobre un mismo conjunto de test con etiquetas exactas, usando el F1 a nivel de pixel como metrica.
- Investigacion en teledeteccion de metano: sirve como punto de partida para estudiar que bandas espectrales (en particular B12) aportan senal util en la deteccion de penachos, antes de trasladar el enfoque a datos reales.
- Desarrollo de pipelines de inyeccion sintetica: el metodo de atenuacion de B12 y el codigo del benchmark permiten replicar el proceso de generacion de datos etiquetados para otras tareas de deteccion de gases.
- Educacion y prototipado: al ser modelos de 1,33-3,75 M de parametros, se pueden entrenar y ejecutar en hardware modesto, lo que facilita experimentos docentes sobre segmentacion semantica con datos satelitales.
- Evaluacion de modelos fisicamente informados: PhysTAUNet permite estudiar si la incorporacion de conocimiento fisico en un doble codificador mejora la segmentacion frente a arquitecturas puramente genericas en este dominio.
- Analisis de falsos positivos y limites de deteccion: la pestana de limites de deteccion de la demo permite cuantificar el comportamiento en parches sin penacho, util para disenar estrategias de filtrado posteriores.
- Base para transferencia a datos reales: los pesos pueden servir como inicializacion para un ajuste fino con penachos reales anotados, aunque ese escenario queda fuera de lo validado por el autor.

## Benchmarks y rendimiento
Resultados de F1 a nivel de pixel sobre 2.048 penachos sinteticos en escenas de test reservadas, umbral 0,5:

| Modelo | Parametros | F1 en test |
|---|---|---|
| Attention U-Net | 1,97 M | 0,455 |
| DeepLabV3+ | 1,33 M | 0,445 |
| U-Net | 1,93 M | 0,437 |
| PhysTAUNet | 3,75 M | 0,436 |
| U-Net++ | 1,93 M | 0,419 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware
- VRAM estimada para inferencia: muy reducida, del orden de decenas o pocos cientos de MB, dado que los modelos tienen entre 1,33 y 3,75 M de parametros y procesan parches de 128x128 con 14 canales. No se dispone de una cifra oficial.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requieren A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja pueden ejecutar la inferencia sin problema.
- Cabe en GPU consumer: si, con amplio margen, incluidas GPUs de portatil con poca VRAM.
- Opciones de despliegue: PyTorch nativo mediante la funcion `core.load_model` del repositorio de la aplicacion; tambien es posible exportar a TorchScript u ONNX, aunque no se documenta en la informacion disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de informacion sobre modelos comparables de deteccion de penachos de metano en Sentinel-2 en la documentacion proporcionada. La comparativa interna entre las cinco arquitecturas del propio repositorio es la siguiente:

| Modelo | Parametros | F1 en test | Licencia | Disponibilidad |
|---|---|---|---|---|
| Attention U-Net | 1,97 M | 0,455 | MIT | Pesos en este repositorio |
| DeepLabV3+ | 1,33 M | 0,445 | MIT | Pesos en este repositorio |
| U-Net | 1,93 M | 0,437 | MIT | Pesos en este repositorio |
| PhysTAUNet | 3,75 M | 0,436 | MIT | Pesos en este repositorio |
| U-Net++ | 1,93 M | 0,419 | MIT | Pesos en este repositorio |

## Limitaciones y advertencias
- Entrenados y evaluados exclusivamente con penachos sinteticos: los resultados no dicen nada sobre penachos de metano reales.
- Todos los parches de entrenamiento contenian un penacho; en parches sin penacho los modelos marcan metano en entre el 44% y el 81% de los casos. No deben usarse como detectores tal cual.
- Riesgo elevado de falsos positivos en escenarios reales por el sesgo del conjunto de entrenamiento.
- El F1 en test es bajo (0,419-0,455), lo que limita su uso directo incluso en el dominio sintetico.
- No hay informacion sobre sesgos geograficos, estacionales o de tipos de superficie del dataset de entrenamiento.
- La licencia MIT permite uso comercial, pero el autor desaconseja explicitamente el uso como detector sin trabajo adicional.
- Los datos Sentinel-2 son Copernicus modificados (2023-2025); conviene revisar los terminos de la licencia Copernicus para usos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- No se documentan requisitos de version de PyTorch ni dependencias del codigo de carga.

## Enlaces
- Hugging Face: https://huggingface.co/ytiemani/ch4-plume-benchmark-weights
- Codigo de la aplicacion: https://github.com/landrytiemani/ch4-plume-explorer
- Codigo del benchmark: https://github.com/landrytiemani/ch4-plume-synthetic-benchmark
- Demo interactiva: pendiente de publicacion (URL de Streamlit no incluida en la model card)
