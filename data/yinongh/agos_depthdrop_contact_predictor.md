# yinongh/agos_depthdrop_contact_predictor

## Resumen

AGOS depth-drop contact predictor es una red neuronal convolucional (CNN) de 470.977 parametros desarrollada por el usuario yinongh en el contexto del proyecto AGOS (Insertion-RL), orientado a tareas de insercion robotica. El modelo recibe como entrada la imagen de profundidad cruda de la muneca de un brazo robotico y emite un unico logit que indica si el objeto a insertar esta a una distancia de 30 mm o menos del orificio objetivo. La politica de control asociada descarta (drop) la senal de profundidad cuando el logit es positivo.

El modelo no es un modelo de lenguaje ni un transformer: es un componente auxiliar de percepcion para un pipeline de aprendizaje por refuerzo en robotica de manipulacion. Su proposito concreto es reproducir, a partir unicamente de la imagen de profundidad, la regla de entrenamiento "distancia enchufe-orificio d <= 30 mm", sin necesidad de disponer de la lectura de fuerza (wrench) en tiempo de inferencia. Esto permite aplicar una estrategia de depth dropout durante el despliegue sim2real.

Su relevancia es acotada y practica: demuestra que una CNN pequena puede aproximar con alta fidelidad una senal de contacto derivada de fuerza usando solo vision de profundidad, lo que simplifica el hardware necesario en el despliegue y mejora la transferencia simulacion-real en tareas de insercion de precision. La informacion publica disponible es limitada: el repositorio tiene 0 GB, 0 descargas y 0 likes, y no se declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pequena (red neuronal convolucional) |
| Parametros totales | 470.977 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (entrada: imagen de profundidad recortada de 192 px, submuestreo 2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN de 470.977 parametros que procesa la imagen de profundidad de la muneca con un recorte de 192 px centrado en las coordenadas (u=380, v=215), un submuestreo de factor 2 y un recorte del rango de profundidad entre 0,11 y 0,20 m. La salida es un unico logit binario. La configuracion completa de entrenamiento y del modelo se almacena en `config.json`, que incluye el recorte de profundidad, el tamano de crop, el submuestreo y la activacion de aumentacion de profundidad.

El entrenamiento se realizo para predecir la etiqueta derivada de la regla "distancia enchufe-orificio d <= 30 mm" calculada a partir de la senal de fuerza en tiempo de entrenamiento, de modo que en inferencia no se requiere wrench. El checkpoint corresponde a la mejor epoca (epoca 9). El codigo de modelo y entrenamiento se encuentra en `scripts/train_contact_predictor.py` del repositorio Insertion-RL (commit `4990fb02`), y la evaluacion se activa con el flag `+eval_depth_dropout_predictor=<ruta a best.pt>`. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Prediccion binaria de contacto/proximidad: dado un mapa de profundidad de la muneca, emite un logit que indica si la distancia enchufe-orificio es menor o igual a 30 mm.
- Inferencia sin sensor de fuerza: reproduce la regla de entrenamiento basada en wrench usando solo vision de profundidad.
- Control de gating para politicas de depth dropout: la politica descarta la profundidad cuando el logit es positivo.
- Generalizacion dentro del dominio de insercion robotica para el que fue entrenado (recorte, rango de profundidad y camara especificos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, por no ser un modelo linguistico.
- No dispone de modo de razonamiento (thinking), vision general, audio ni otras capacidades fuera de la prediccion de contacto a partir de profundidad.

## Casos de uso

- Insercion robotica de precision (peg-in-hole): el modelo actua como predictor de contacto para decidir cuando el controlador debe cambiar de fase o relajar el uso de la senal de profundidad, permitiendo politicas mas robustas en el ensamblaje de piezas.
- Transferencia simulacion-real (sim2real): integrado en la politica `agos_sim2real_geoaux_depthdrop`, el predictor permite aplicar depth dropout en el mundo real sin disponer de la regla de fuerza que se usaba en simulacion, reduciendo la brecha de dominio.
- Despliegue en hardware sin sensor de fuerza: en brazos roboticos de bajo coste que solo cuentan con camara de profundidad en la muneca, el modelo sustituye la senal de wrench necesaria para detectar el contacto.
- Automatizacion de ensamblaje en linea de produccion: al ser una CNN de menos de 0,5 M de parametros, la inferencia es ligera y puede ejecutarse a alta frecuencia junto al bucle de control, habilitando inserciones repetitivas con deteccion de proximidad.
- Validacion de politicas de RL en simulacion: el predictor sirve como componente de evaluacion para comprobar si una politica aprendida respeta la regla de 30 mm, comparando el gating predicho con el gating de referencia.
- Investigacion en percepcion tactil indirecta: permite estudiar hasta que punto la profundidad visual contiene informacion suficiente para aproximar senales de contacto, como base para experimentos de destilacion de fuerza a vision.
- Prototipado rapido en laboratorio: al ser un checkpoint PyTorch pequeno y con codigo de entrenamiento disponible, se puede reentrenar o ajustar para nuevas geometrias de pieza y camaras con un coste computacional bajo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AUC en validacion (n = 92.317) | 0,997 |
| Precision en validacion a umbral 0,5 | 97,6% |
| Precision en la banda 27-33 mm alrededor del umbral | 95,3% |
| Evaluacion cerrada sim2real (360 episodios), gating con predictor | 250/360 |
| Evaluacion cerrada sim2real (360 episodios), gating con regla real de 30 mm | 251/360 |
| Precision del gate | 93,9% |
| Retardo del primer drop respecto al cruce real de 30 mm | mediana de 0 pasos |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 100 MB en FP32 para 470.977 parametros, mas el buffer de la imagen de entrada; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (por ejemplo, serie RTX 20xx en adelante) e incluso podria ejecutarse en CPU.
- Opciones de despliegue: el checkpoint es PyTorch (`best.pt`) y se integra en el pipeline Insertion-RL mediante el flag `+eval_depth_dropout_predictor`; no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja, pero no se aportan medidas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de contacto a partir de profundidad ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta entrenado para un recorte concreto (192 px en u=380, v=215), un rango de profundidad de 0,11-0,20 m y un submuestreo de 2; fuera de esa configuracion su validez no esta garantizada.
- Dependencia de la camara y de la calibracion: cambios en la camara de profundidad, en la montura o en la geometria de la pieza pueden degradar la prediccion.
- Sin licencia declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de usarlo en produccion.
- Riesgo de falsos positivos y negativos cerca del umbral: aunque la precision en la banda 27-33 mm es del 95,3%, existe un 4,7% de error en la zona critica de decision.
- Rendimiento en bucle cerrado ligeramente inferior a la regla de referencia: 250/360 frente a 251/360 episodios, con una precision de gate del 93,9%, lo que implica que el predictor no sustituye perfectamente la senal de fuerza.
- Sesgos conocidos: no disponibles; no se documenta analisis de sesgo ni de robustez frente a iluminacion, oclusiones o materiales reflectantes.
- Riesgo de alucinacion: no aplicable en el sentido linguistico, pero si existe riesgo de predicciones erroneas fuera de distribucion.
- Documentacion escasa: repositorio con 0 descargas y 0 likes, sin model card extendida, lo que limita la reproducibilidad y la validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yinongh/agos_depthdrop_contact_predictor
- Politica asociada (depth-dropout policy): https://huggingface.co/yinongh/agos_sim2real_geoaux_depthdrop
- Codigo de modelo y entrenamiento: `scripts/train_contact_predictor.py` en el repositorio Insertion-RL (commit `4990fb02`); no se proporciona URL directa en la informacion disponible.
- Paper, blog o demo: no disponibles en la informacion proporcionada.
