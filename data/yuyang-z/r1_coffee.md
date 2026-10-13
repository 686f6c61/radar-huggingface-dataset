# Yuyang-z/R1_coffee

## Resumen

R1_coffee es una política robótica de manipulación distribuida por el usuario Yuyang-z, construida sobre la arquitectura SANA-RWM y destinada al robot bimanual Galaxea R1Lite. No es un modelo de lenguaje: se trata de un modelo de política (policy) que traduce observaciones visuales y de estado en secuencias de comandos de bajo nivel para ejecutar la tarea de preparar café. Parte de un ajuste fino sobre el checkpoint Vanilla Pantheon en el paso 40.000, entrenado con los cinco subconjuntos del dataset ForeAct Coffee.

La relevancia del lanzamiento es doble. Por un lado, es un ejemplo de empaquetado completo de una política robótica: el archivo `coffee_demo_deployment.tar.gz` incluye pesos en safetensors BF16, el VAE LTX local, el codificador de texto Gemma, código de inferencia autónomo, un servicio HTTP con cliente, la normalización de entrenamiento congelada, el URDF del robot, configuraciones y cinco observaciones reales de ejemplo. Por otro, expone con transparencia sus propias limitaciones de rendimiento: la inferencia síncrona en una GB300 tarda unos 7,1 segundos por bloque de 32 comandos, insuficiente para sostener control continuo a 15 Hz.

El repositorio ocupa 12,6 GB e incluye tanto la política como los componentes auxiliares (VAE y encoder de texto), lo que explica el tamaño mucho mayor que el de los pesos de la política por sí sola. La licencia es de tipo "component-specific": el código SANA-RWM es Apache 2.0, mientras que el encoder Gemma y el VAE LTX conservan sus términos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SANA-RWM (politica robotica generativa con flow matching; usa VAE de video LTX y encoder de texto Gemma) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (ventana de 33 fotogramas a 15 Hz; 9 fotogramas RGB, 2 latentes de VAE causal, 32 objetivos de accion) |
| Tipos de cuantizacion | no disponible (se distribuye en BF16 safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | en (ingles; la instruccion tipica es "coffee making") |
| Licencia | other / component-specific (SANA-RWM Apache 2.0; Gemma y LTX VAE con sus terminos originales) |
| Formato de pesos | safetensors (BF16), con verificacion exacta de ida y vuelta origen-BF16 |
| Entrada | 3 imagenes RGB sincronizadas (head, left_wrist, right_wrist) + estado observado 14D + instruccion |
| Salida | float32 [32, 14]: secuencia de comandos a 15 Hz; `predict_full()` anade objetivos absolutos de EEF en `torso_link3` (XYZ en metros y rot6d por columnas) |
| Unidades y rango | articulaciones en radianes (objetivos absolutos); pinzas en posicion de controlador, 0 = cerrada, 100 = abierta |

## Arquitectura y entrenamiento

La política sigue el esquema SANA-RWM, un modelo de mundo robótico apoyado en la familia SANA y en muestreo por flow matching. El pipeline combina un VAE de vídeo (LTX) que comprime la observación visual en latentes causales y un encoder de texto Gemma que procesa la instrucción. La generación de acciones usa integración flow-Euler (20 pasos por defecto) con dos escalas de classifier-free guidance: vídeo CFG 6 y acción CFG 1, y desplazamientos de flujo de 5 para vídeo y 1 para acción. El runtime se encarga del empaquetado Robot80, la cinemática directa (FK), la normalización y la conversión interna de apertura/cierre de pinza; los objetivos absolutos se envían directamente al controlador.

El ajuste fino se realizó sobre el checkpoint Vanilla Pantheon (paso 40.000) utilizando los cinco subconjuntos de ForeAct Coffee (`0422_trimmed`, `0423-last38`, `0423_trimmed`, `0424` y `0425`), que suman 399 episodios y 258.562 fotogramas. El entrenamiento completó 10 épocas y 10.110 actualizaciones del optimizador; la release corresponde exactamente a la época 10, paso 10.110, y excluye deliberadamente los pesos EMA. La normalización congelada es `galaxea_r1lite_2025_model_fps_15_f33_normalization.json` (SHA-256 `a04014a3b54d5b349698f28996e7cf02b474937e5bf1b74c9c217bb70ee0fff7`). No se documenta en la model card el uso de RLHF o DPO, ni el recuento total de tokens de entrenamiento.

## Capacidades

- Generación de secuencias de acción robótica: produce bloques de 32 comandos de 14 dimensiones (6 articulaciones por brazo más pinza) a 15 Hz.
- Control bimanual coordinado del Galaxea R1Lite, con objetivos articulares absolutos en radianes y control de pinzas en escala 0-100.
- Percepción multimodal sincronizada: consume tres cámaras RGB (cabeza, muñeca izquierda y muñeca derecha) más un estado observado de 14 dimensiones.
- Condicionamiento por instrucción en lenguaje natural (típicamente "coffee making"), procesado mediante el encoder Gemma.
- Objetivos absolutos de efector final (EEF) en `torso_link3`: posición XYZ en metros y orientación rot6d, disponibles vía `predict_full()` y en las respuestas HTTP.
- Modelo de mundo de vídeo: el pipeline predice latentes de vídeo causales (2 fotogramas latentes) además de las acciones, lo que permite razonamiento anticipatorio sobre la escena.
- Servicio HTTP integrado (`serve.py`) y cliente robot, pensados para despliegue como microservicio.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni soporte multilingüe más allá del inglés.

## Casos de uso

- Despliegue experimental en preparación de café con Galaxea R1Lite: la política recibe las tres cámaras y el estado articular del robot y emite comandos absolutos a 15 Hz, cubriendo la tarea completa de cafetería para la que fue ajustada.
- Investigación en políticas visión-lenguaje-acción (VLA): sirve como referencia reproducible con normalización congelada, URDF y observaciones de ejemplo, lo que permite comparar variantes de inferencia sin reentrenar.
- Recolección de datos por imitación: al ser un ajuste sobre ForeAct Coffee, puede usarse para replicar demostraciones y ampliar el dataset con nuevas trayectorias etiquetadas.
- Integración como microservicio robótico: el servicio HTTP incluido permite exponer la política en una red local y que el controlador del robot consuma predicciones sin cargar PyTorch en el propio robot.
- Evaluación de transferencia sim-to-real y robustez de cámaras: al admitir observaciones reales en formato `.npz`, facilita pruebas con distintas condiciones de iluminación y calibración.
- Base para ajuste fino en tareas adyacentes: al estar empaquetada con configuraciones de entrenamiento y procedencia completa, puede reajustarse para otras tareas de manipulación bimanual con el mismo robot.
- Validación de pipelines de despliegue: los informes de validación (805 tensores, preprocessing exacto, predicciones en GPU y round trip HTTP) permiten usar la release como caso de prueba de infraestructura de serving robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existe un resultado de tasa de éxito en tareas retenidas (held-out), y todos los ejemplos incluidos son observaciones de entrenamiento. El único dato de rendimiento medido es de latencia:

| Metrica | Valor |
|---|---|
| Latencia de inferencia en caliente (GB300) | ~7,1 s por bloque de 32 comandos |
| Cobertura temporal del bloque | ~2,13 s a 15 Hz |
| Control continuo a 15 Hz en inferencia sincrona | No sostenible (la latencia supera el tiempo real del bloque) |
| Tasa de exito en tareas held-out | no disponible |
| Benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) | no aplica (modelo de politica robotica) |

## Requisitos de hardware

- GPU NVIDIA con soporte BF16 obligatoria; el entorno fijado se validó con PyTorch 2.10.0 y CUDA 13.
- Entorno de referencia medido: NVIDIA GB300, con ~7,1 s por bloque de 32 comandos en inferencia en caliente.
- VRAM estimada: no disponible de forma explícita; el runtime carga pesos de política, VAE LTX y encoder de texto Gemma, y el repositorio completo ocupa 12,6 GB.
- Compatibilidad con GPU de consumo: no documentada. La latencia medida en hardware de gama alta sugiere que una GPU de consumo no sostendría el control en tiempo real.
- Despliegue: inferencia autónoma con `infer.py`, servicio HTTP con `serve.py --host 0.0.0.0 --port 8000`, verificación de integridad con `SHA256SUMS` y carga de modelos desde archivos locales incluidos.
- Requisitos de software: Python 3.10 o superior y `requirements.txt` del propio paquete.
- Throughput: no disponible más allá de la latencia por bloque indicada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. La categoría equivalente es la de políticas visión-lenguaje-acción (VLA) para manipulación robótica, pero la model card no ofrece cifras frente a alternativas, y este lanzamiento tampoco publica tasa de éxito en tareas retenidas.

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yuyang-z/R1_coffee | no disponible | 33 fotogramas a 15 Hz | ~7,1 s por bloque de 32 comandos en GB300; sin tasa de éxito publicada | component-specific (SANA-RWM Apache 2.0; Gemma y LTX VAE con terminos propios) | HuggingFace, 12,6 GB, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La inferencia síncrona no sostiene control continuo a 15 Hz: 7,1 s por bloque frente a 2,13 s de cobertura temporal, lo que obliga a arquitecturas asíncronas o a ejecución no reactiva.
- No existe tasa de éxito en tareas retenidas; los cinco ejemplos incluidos son observaciones de entrenamiento, por lo que el rendimiento real de la política no está cuantificado.
- Modelo de propósito muy específico: ajustado para "coffee making" con el Galaxea R1Lite; no es un modelo generalista y su uso fuera de esa tarea y ese robot no está validado.
- Idioma limitado al inglés en la instrucción; no se documenta soporte multilingüe.
- Riesgo de alucinación en el sentido robótico: al ser un modelo generativo con muestreo estocástico (20 pasos flow-Euler, CFG de vídeo 6), puede producir trayectorias o predicciones de vídeo incoherentes fuera de la distribución de entrenamiento.
- Sesgos no evaluados: la model card no reporta análisis de sesgo demográfico, de iluminación ni de variabilidad de escena; el dataset procede de un número reducido de episodios (399) y cinco subconjuntos.
- Restricciones de licencia: la licencia es component-specific. El código SANA-RWM es Apache 2.0, pero el encoder Gemma y el VAE LTX conservan sus términos originales, por lo que el uso comercial requiere revisar `NOTICE.txt` y los acuerdos en `licenses/` antes de desplegar.
- Sin métricas de seguridad física: no se documentan límites de par, colisiones ni verificación de espacio de trabajo; la publicación de comandos y la captura de cámara recaen en el controlador externo.
- Dependencia de la normalización congelada y de rutas de assets fijadas en `deployment.json`: modificar esos valores invalida las comprobaciones de reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yuyang-z/R1_coffee
- Archivos de despliegue: https://huggingface.co/Yuyang-z/R1_coffee/tree/main/coffee_demo_deployment
- Informes de validación: https://huggingface.co/Yuyang-z/R1_coffee/tree/main/coffee_demo_deployment/validation
- Licencias de componentes: https://huggingface.co/Yuyang-z/R1_coffee/tree/main/coffee_demo_deployment/licenses
- Aviso de licencias (NOTICE.txt): https://huggingface.co/Yuyang-z/R1_coffee/blob/main/coffee_demo_deployment/NOTICE.txt
- Dataset ForeAct Coffee: https://huggingface.co/datasets/zhuoyang20/foreact_coffee_making_data
