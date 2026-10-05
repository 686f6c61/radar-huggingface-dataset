# van-i/act_r2d2_to_box_bg

## Resumen

ACT R2-D2 to box bg es una politica robotica (policy) entrenada desde cero con el algoritmo ACT (Action Chunking with Transformers) para el brazo robotico SO-100. La desarrolla el usuario van-i como parte de un banco de pruebas escolar de robotica construido con LeRobot y LeLab, y su tarea concreta es recoger una figura pequena de R2-D2 desde una de cinco posiciones marcadas y depositarla en una bandeja de carton. El modelo aprende por imitacion (imitation learning) a partir de 50 episodios teleoperados con tres camaras, sin ningun tipo de RLHF ni ajuste por preferencias.

El modelo tiene 51.668.614 parametros (unos 51,7 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0, con un tamano de repositorio de apenas 0,2 GB. No es un modelo de lenguaje: es una politica visomotora que mapea observaciones (tres flujos de imagen 640x480 a 30 fps mas el estado del robot) a acciones de control del brazo. Por tanto, conceptos como "longitud de contexto" o "idiomas soportados" no aplican en el sentido habitual.

Su relevancia es practica y acotada: demuestra como un transformer pequeno entrenado en una sola RTX 3090 durante poco mas de una hora puede resolver una tarea de manipulacion con una tasa de exito de 8/10 en las posiciones vistas y de forma claramente degradada fuera de ellas. Forma parte de una comparativa publica de cuatro politicas (ACT, Diffusion Policy, SmolVLA y GR00T N1.7) sobre el mismo dataset, lo que lo convierte en una referencia util para evaluar el coste/rendimiento de distintas familias de politicas en robotica de sobremesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica robotica; horizonte de chunking no especificado en la informacion disponible) |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo visomotor; no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de imitacion que emplea un transformer para predecir bloques ("chunks") de acciones futuras en lugar de una sola accion por paso, lo que reduce el error acumulado y mejora la estabilidad del control. En este caso el modelo se entreno desde cero (no es un fine-tuning de un modelo preexistente) sobre el dataset van-i/r2d2_to_box_bg_20261003_210444, compuesto por 50 episodios teleoperados en un brazo SO-100 con tres camaras: dos cenitales (`left` y `right`) y una en la muneca (`grip`), todas a 640x480 y 30 fps. La tarea es "pick r2d2 and put to box".

El entrenamiento se realizo con LeRobot a traves de la interfaz web de LeLab, durante 15.000 pasos con batch de 8, lo que equivale a aproximadamente 8,5 epocas, en precision mixta sobre una RTX 3090 a 250 W. El tiempo total fue de 1 hora y 6 minutos y la perdida final de entrenamiento fue de 0,166. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de optimizacion posteriores, ni innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Control visomotor de manipulacion: recoge una figura de R2-D2 desde cinco posiciones marcadas y la deposita en una bandeja de carton.
- Percepcion multi-camara: consume simultaneamente tres flujos de imagen (`left`, `right` cenitales y `grip` en la muneca) a 640x480 y 30 fps.
- Prediccion de acciones por chunks (action chunking), caracteristica de la arquitectura ACT, orientada a movimientos mas suaves y estables.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes LLM; el modelo ejecuta una politica de control de un solo proposito.
- Capacidades multilingues: no aplica.
- Generalizacion limitada: funciona en las cinco posiciones de inicio entrenadas y en la zona intermedia H1 (2/2), pero falla en la zona H2 fuera de las marcas (0/2).
- No dispone de modo "thinking", vision general, audio ni ninguna capacidad fuera de la tarea de pick-and-place.

## Casos de uso

- Banco de pruebas docente de robotica: el modelo esta pensado para un stand escolar con LeRobot y LeLab; sirve para que estudiantes comparen cuatro politicas sobre el mismo dataset y analicen tasas de exito y tiempos.
- Referencia comparativa de arquitecturas de imitacion: al compartir dataset y protocolo de evaluacion con Diffusion Policy, SmolVLA y GR00T N1.7, permite medir el coste/rendimiento de ACT frente a otras familias con 14 intentos por politica.
- Automatizacion de pick-and-place en celda fija: recogida de piezas pequenas desde posiciones marcadas y deposito en contenedor, siempre que la escena coincida con la de entrenamiento.
- Investigacion en action chunking: util como baseline reproducible de ACT entrenado desde cero con hiperparametros conocidos (15.000 pasos, batch 8, perdida final 0,166).
- Prototipado rapido en hardware de bajo coste: al entrenarse en una sola RTX 3090 en poco mas de una hora, permite iterar sobre nuevas tareas de manipulacion con presupuesto reducido.
- Estudio de robustez y limites de generalizacion: los resultados (8/10 en posiciones vistas, 2/4 fuera) ofrecen un caso concreto para analizar sobreajuste a posiciones y sensibilidad al emplazamiento.
- Validacion de pipelines LeRobot/SO-100: el ejemplo de `lerobot-rollout` sirve para verificar calibracion, indices de camara y puerto serie en un montaje SO-100/SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a una politica robotica. Si se documentan resultados de evaluacion fisica sobre el brazo real, comparando cuatro politicas con 14 intentos cada una (5 posiciones entrenadas x2, posicion retenida H1 x2, posicion retenida H2 x2):

| Politica | Posiciones entrenadas (P1-P5) | H1 (entre marcas) | H2 (fuera de marcas) | Tiempo medio |
|---|---|---|---|---|
| ACT (15k) | 8/10 | 2/2 | 0/2 | ~10 s |
| Diffusion Policy (36k) | 9/10 | 2/2 | 0/2 | ~16,5 s |
| SmolVLA (25k) | 10/10 | 2/2 | 0/2 | ~8,4 s |
| GR00T N1.7 (18k) | 10/10 | 2/2 | 2/2 | ~9,8 s |

Datos adicionales del modelo: perdida final de entrenamiento 0,166; 8/10 en posiciones entrenadas y 2/4 en posiciones retenidas; aproximadamente 10 s por exito. Todos los fallos correspondieron a alcances a un punto equivocado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parametros, el peso ocupa en torno a 0,2 GB en FP32 y unos 0,1 GB en FP16; los requisitos reales vendran dominados por los buffers de las tres camaras a 640x480 y las activaciones, no por los pesos. Estimacion orientativa: menos de 2 GB en GPU.
- GPU recomendadas: cualquier GPU con soporte CUDA suficiente; el entrenamiento se realizo en una RTX 3090, lo que marca un minimo comodo para experimentacion.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 en adelante); las cifras exactas de VRAM no estan publicadas.
- Opciones de despliegue: LeRobot 0.6.0 mediante el comando `lerobot-rollout`, con `--policy.path=van-i/act_r2d2_to_box_bg` y `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica robotica.
- Latencia y throughput: no disponibles como metrica; el modelo opera a 30 fps de captura de camara y el tiempo medio por episodio completado es de aproximadamente 10 s.
- Perifericos: brazo SO-100 / SO-101 follower, con puerto serie (por ejemplo `/dev/ttyACM1`), calibracion propia y tres camaras OpenCV con indices configurables.

## Comparativa con modelos similares

Comparativa con las tres politicas entrenadas sobre el mismo dataset segun la informacion disponible:

| Modelo | Tipo | Parametros | Pasos de entrenamiento | Exito en posiciones vistas | Exito en H2 | Tiempo medio |
|---|---|---|---|---|---|---|
| ACT (este modelo) | ACT, desde cero | 51,7 M | 15.000 | 8/10 | 0/2 | ~10 s |
| Diffusion Policy | Diffusion policy | no disponible | 36.000 | 9/10 | 0/2 | ~16,5 s |
| SmolVLA | VLA (vision-language-action) | no disponible | 25.000 | 10/10 | 0/2 | ~8,4 s |
| GR00T N1.7 | VLA | no disponible | 18.000 | 10/10 | 2/2 | ~9,8 s |

En cuanto a licencia y disponibilidad, la informacion disponible solo confirma la licencia Apache 2.0 y el formato safetensors para este modelo; los datos de licencia y formato de las otras tres politicas no se detallan en la informacion proporcionada y se marcan como no disponibles.

## Limitaciones y advertencias

- Dependencia estricta de la escena: el propio autor indica que la politica solo funciona en un entorno similar al de entrenamiento, con mesa mate oscura, bandeja en su sitio, iluminacion parecida y colocacion de camaras equivalente.
- Generalizacion pobre fuera de las posiciones marcadas: 0/2 en la zona H2 (fuera de las marcas) y 2/4 en el conjunto de posiciones retenidas.
- Sesgo de posicion: todos los fallos fueron alcances a un punto equivocado, lo que sugiere sobreajuste a las cinco posiciones de inicio entrenadas.
- Dataset muy reducido: solo 50 episodios teleoperados, lo que limita la diversidad de condiciones, objetos y disposiciones.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es ejecutar una trayectoria incorrecta cuando la escena difiere del entrenamiento.
- Limitaciones de contexto o idioma: no aplican, ya que no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural mas alla de la tarea fija "pick r2d2 and put to box".
- Licencia: Apache 2.0, lo que permite uso comercial y modificacion; conviene revisar igualmente las condiciones de los componentes de LeRobot empleados.
- Caveats de produccion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el modelo esta pensado como demostracion docente, no como componente validado para produccion.
- Requiere calibracion e indices de camara propios: el comando de ejemplo debe adaptarse al puerto serie, al identificador de calibracion y a los indices de camara de cada montaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/van-i/act_r2d2_to_box_bg
- Dataset de entrenamiento: https://huggingface.co/datasets/van-i/r2d2_to_box_bg_20261003_210444
- Documentacion de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Escribano completo y comparativa de las cuatro politicas: https://huggingface.co/van-i/so100-imitation-learning-stand
- Nota: los resultados de la busqueda web proporcionada no contienen enlaces relevantes sobre este modelo (corresponden a anuncios y fabricantes de furgonetas camper), por lo que no se incluyen.
