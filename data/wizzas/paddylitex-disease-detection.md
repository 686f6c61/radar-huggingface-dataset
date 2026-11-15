# Wizzas/paddylitex-disease-detection

## Resumen

PaddyLiteX es un detector de objetos ligeros orientado a la deteccion de enfermedades foliares del arroz (paddy) en nueve clases. Lo desarrolla Wilbert Andrew Yonathan como trabajo de fin de grado (Bachelor of Engineering in Artificial Intelligence) en la Xiamen University Malaysia, y el repositorio de Hugging Face contiene principalmente el codigo fuente del proyecto, publicado tambien en GitHub. El modelo parte de la integracion YOLOv8n + DenseNet121 y propone sustituir el backbone por un diseño propio, DenseLiteX, complementado con SPPF y atencion C2PSA.

La motivacion tecnica es reducir el coste computacional de la integracion densa original manteniendo la precision. Segun la model card, el detector final propuesto usa un 68,01 % menos de parametros y un 72,59 % menos de GFLOPs que el modelo inicial YOLOv8n + DenseNet121, con 0,98 puntos porcentuales mas de mAP@0.5. El modelo opera sobre imagenes de 640x640x3 y produce cajas delimitadoras con predicciones de nueve clases mediante una cabeza de deteccion a tres escalas (strides 8/16/32).

El repositorio incluye modulos de modelo personalizados, configuraciones de arquitectura, scripts de entrenamiento y evaluacion, ablaciones de componentes y una demo web interactiva que ejecuta modelos ONNX en el navegador mediante ONNX Runtime Web. El tamaño del repositorio es de aproximadamente 0,2 GB. No es un modelo de lenguaje ni un modelo multimodal generativo, sino un detector de vision especializado en una tarea agronomica concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos YOLOv8n con backbone denso personalizado DenseLiteX, SPPF y atencion C2PSA; cuello YOLOv8 y cabeza a tres escalas |
| Parametros totales | No disponible (la model card reporta una reduccion del 68,01 % frente al modelo inicial YOLOv8n + DenseNet121, pero no el valor absoluto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen 640x640x3) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (modelos exportados para inferencia en navegador); otros formatos no disponibles |

## Arquitectura y entrenamiento

El detector propuesto, identificado en la configuracion como `YOLOv8n_DenseLiteX_SPPF_C2PSA`, sustituye el backbone original por DenseLiteX, un backbone denso con cuatro bloques de profundidades [6, 8, 12, 6] y growth rate 20. Las capas densas usan un multiplicador de bottleneck de 2 y dropout 0,0. El backbone proyecta tres salidas con 64, 128 y 256 canales a strides 8, 16 y 32 (P3, P4 y P5 respectivamente), que alimentan el cuello YOLOv8 con agregacion top-down y bottom-up. La salida mas profunda (P5) se refina con SPPF para agregacion de contexto espacial y despues con C2PSA para refinamiento basado en atencion antes de la agregacion en el cuello. La cabeza de deteccion opera a tres escalas con strides 8, 16 y 32.

El diseño busca reutilizacion densa de caracteristicas mediante concatenacion, pero con menor profundidad de bloque, growth rate y expansion de bottleneck que la integracion DenseNet121 de referencia. El repositorio documenta estudios de ablacion controlados: se comparan el baseline, el modelo propuesto inicial y dos grupos de ablacion de componentes, midiendo precision, recall, mAP, parametros y GFLOPs. No se detalla en la informacion disponible el numero de tokens (no aplica), la composicion exacta del dataset de entrenamiento ni si se emplearon tecnicas de RLHF/DPO (no aplica a un detector de vision). La evaluacion reportada se realiza sobre 803 imagenes de test y 2.466 objetos anotados.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica enfermedades foliares del arroz en nueve clases, devolviendo cajas delimitadoras y predicciones de clase.
- Entrada de imagen fija de 640x640x3, procesada por un backbone denso ligero y una cabeza a tres escalas.
- Inferencia en navegador: los modelos exportados a ONNX se ejecutan con ONNX Runtime Web en la demo interactiva, sin necesidad de backend.
- Comparacion de predicciones: la demo permite contrastar en una misma imagen las salidas del baseline, del modelo propuesto inicial y del modelo propuesto final, con cajas anotadas, graficas de metricas y comparaciones por clase.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector de vision especializado, no un modelo generativo.
- No dispone de modo thinking, vision generativa, audio ni otras capacidades multimodales mas alla de la deteccion de objetos.

## Casos de uso

- Monitorizacion de cultivos de arroz con drones o imagenes de campo: el detector procesa imagenes de 640x640 y localiza focos de enfermedad en nueve clases, lo que permite priorizar inspecciones en parcelas con incidencia detectada.
- Aplicaciones moviles o web de diagnostico en campo: al exportarse a ONNX y ejecutarse con ONNX Runtime Web, el modelo puede desplegarse en el navegador del agricultor o del tecnico sin servidor dedicado, reduciendo latencia y coste de infraestructura.
- Triaje automatizado en laboratorios de fitopatologia: las cajas delimitadoras y la clasificacion por clase permiten prefiltrar imagenes de hojas y dirigir la revision manual hacia las muestras con detecciones de mayor interes.
- Integracion en pipelines de teledeteccion agricola: las salidas estructuradas (cajas y clases) pueden alimentar sistemas de alerta temprana o bases de datos de incidencia por parcela, combinadas con metadatos geograficos.
- Comparacion y seleccion de arquitecturas en investigacion: el repositorio incluye configuraciones, ablaciones y scripts de evaluacion que permiten reproducir la comparacion entre baseline, modelo inicial y modelo final con metricas de precision, recall, mAP, parametros y GFLOPs.
- Demostracion educativa de eficiencia de modelos: la demo interactiva que compara predicciones sobre una misma imagen sirve para explicar el compromiso entre coste computacional y precision en el diseño de backbones densos ligeros.

## Benchmarks y rendimiento

La model card reporta resultados comparativos medidos, pero no ofrece una tabla completa de valores absolutos por metrica en la informacion disponible. Los datos explicitamente citados son:

| Comparacion | Resultado reportado |
|---|---|
| Parametros: modelo final propuesto vs. YOLOv8n + DenseNet121 inicial | 68,01 % menos |
| GFLOPs: modelo final propuesto vs. YOLOv8n + DenseNet121 inicial | 72,59 % menos |
| mAP@0.5: modelo final propuesto vs. YOLOv8n + DenseNet121 inicial | 0,98 puntos porcentuales mas |
| Conjunto de evaluacion | 803 imagenes de test, 2.466 objetos anotados |

No se han publicado en la informacion disponible valores absolutos de MMLU, HumanEval, GSM8K ni de precision, recall o mAP por clase; esos benchmarks no aplican a este tipo de modelo. La propia model card advierte que el detector final no supera a todos los modelos de referencia en todas las metricas: es un compromiso medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Por el tamaño del repositorio (0,2 GB) y la naturaleza ligera del detector, la huella de memoria es reducida, pero no se publican cifras de VRAM.
- GPU recomendadas: no disponible. El diseño ligero y la exportacion ONNX sugieren viabilidad en hardware modesto, pero la informacion proporcionada no especifica GPU de referencia.
- Compatibilidad con GPU de consumo: probable por el caracter ligero del modelo y la inferencia en navegador via ONNX Runtime Web, pero no confirmado con cifras en la informacion disponible.
- Opciones de despliegue: ONNX Runtime Web para navegador (documentado); PyTorch 2.5.1 y Python 3.10 aparecen como entorno de ejemplo en el repositorio. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaddyLiteX (propuesto) | No disponible en absoluto; 68,01 % menos que YOLOv8n + DenseNet121 | Imagen 640x640x3 | mAP@0.5 +0,98 pp frente al inicial; GFLOPs -72,59 % | No disponible | Hugging Face y GitHub |
| YOLOv8n + DenseNet121 (baseline del estudio) | No disponible en absoluto | Imagen 640x640x3 | Referencia de comparacion del estudio | No disponible en la informacion | Configuracion incluida en el repositorio |
| YOLOv8n (detector base) | No disponible en la informacion proporcionada | Imagen, multiple | No disponible | No disponible en la informacion | Ampliamente disponible como modelo publico |

La informacion proporcionada no incluye datos suficientes para comparar con alternativas externas de forma rigurosa; los unicos modelos con los que se compara explicitamente son el baseline YOLOv8n + DenseNet121 y las variantes de ablacion del propio estudio.

## Limitaciones y advertencias

- Es un detector de vision especializado en nine-class paddy leaf disease detection; no es un modelo de lenguaje ni un modelo generativo, por lo que no debe evaluarse con benchmarks de texto.
- La model card reconoce explicitamente que el modelo final no supera a todos los modelos de referencia en todas las metricas; la mejora de mAP@0.5 es de 0,98 puntos porcentuales, un margen estrecho.
- No se publican valores absolutos de parametros, precision, recall ni mAP por clase en la informacion disponible, lo que dificulta la reproducibilidad de la comparacion.
- La licencia no esta indicada; antes de cualquier uso comercial es imprescindible verificar los terminos en el repositorio de GitHub y en Hugging Face.
- El modelo esta entrenado sobre un dataset concreto de enfermedades foliares del arroz (803 imagenes de test, 2.466 objetos anotados); su generalizacion a otras variedades, condiciones de iluminacion, sensores o regiones geograficas no esta documentada.
- Riesgo de falsos negativos y falsos positivos en imagenes de campo con oclusiones, solapamiento de hojas o fondos complejos: no se reportan analisis de errores en la informacion disponible.
- Sesgos conocidos: no disponibles; al ser un modelo de vision sobre un dataset limitado, es plausible un sesgo hacia las condiciones de captura del conjunto de entrenamiento, pero no se documenta.
- El repositorio contiene principalmente codigo fuente; los pesos exportados a ONNX estan orientados a la demo en navegador, y no se detalla la disponibilidad de checkpoints PyTorch completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wizzas/paddylitex-disease-detection
- Repositorio GitHub: https://github.com/WAYTECHG/paddylitex-disease-detection
- Demo interactiva en Hugging Face Spaces: https://huggingface.co/spaces/Wizzas/PaddyLiteX
- Demo en vivo en Render: https://paddylitex.onrender.com/
- Referencia citada en tags (paper DenseNet): arXiv:1608.06993
