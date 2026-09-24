# SyntheticMDProductions/Roblox_Oasis_V4_AI_Model

## Resumen

Roblox Oasis V4 AI Model es un modelo experimental de generación de vídeo condicionado por acciones, desarrollado por SyntheticMDProductions y publicado bajo licencia Apache 2.0. Su objetivo es aprender un modelo de mundo (world model) a partir de grabaciones de partidas de Roblox: dado un estado visual actual y una acción de control, predice el siguiente fotograma simulado del juego. No es un cliente de Roblox ni se conecta a sus servidores ni cuentas.

Técnicamente se trata de un modelo de rectified flow con arquitectura de tipo UNet, distribuido en formato diffusers con pesos safetensors y 20.039.619 parámetros. Trabaja a una resolución nativa de 256 x 144 píxeles (16:9), una resolución muy baja pensada para experimentación, y acepta como entradas demostradas movimiento W/A/S/D, salto, shift, la tecla `1`, botones izquierdo y derecho del ratón y movimiento relativo del ratón.

Su relevancia es acotada pero concreta: se enmarca en la línea de investigación de modelos de mundo interactivos aplicados a videojuegos, un área con mucho interés para generación de datos sintéticos y agentes de refuerzo. Con 0 descargas y 0 likes en el momento de la consulta, y una validación realizada sobre solo 48 muestras, debe considerarse un proyecto de investigación y demostración, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de vídeo action-conditioned con rectified flow (UNet de difusión, librería diffusers) |
| Parametros totales | 20.039.619 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de vídeo; no se especifica el número de fotogramas de historial) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; las entradas son acciones de control) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`unet/diffusion_pytorch_model.safetensors`) con configuración diffusers |
| Resolucion nativa | 256 x 144 (16:9) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion en HuggingFace | 24 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo es un generador de vídeo condicionado por acciones basado en rectified flow, implementado sobre un UNet de difusión compatible con la librería diffusers. La formulación de rectified flow plantea una trayectoria más recta entre ruido y dato que la difusión clásica, lo que en la práctica permite muestrear con menos pasos. La condición de control se inyecta a partir del estado visual actual y de la acción del jugador, de modo que la predicción del siguiente fotograma depende explícitamente de la entrada de control, no solo del contexto visual.

El entrenamiento se realizó sobre grabaciones de partidas de Roblox y se completaron 29 épocas. El autor reporta una precisión contrafactual (counterfactual accuracy) máxima del 85,4 % medida sobre 48 muestras de validación, una cifra que debe interpretarse con cautela por el tamaño reducido del conjunto de evaluación. No se documentan en la información disponible el número total de tokens o fotogramas vistos, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (poco habituales en este tipo de modelos de vídeo).

El repositorio incluye, además de los pesos, un fichero `action_flow_model_info.json` con la codificación de entradas, la lista de acciones y metadatos de entrenamiento, y un directorio `gui_previews/` con imágenes de previsualización del entrenamiento. La inferencia está pensada para ejecutarse junto a la aplicación compañera Oasis-Game-Trainer, que copia la carpeta del modelo en su directorio de salida y la selecciona desde la interfaz de reproducción.

## Capacidades

- Predicción del siguiente fotograma de una simulación visual de Roblox a partir del estado actual y una acción de control.
- Acepta como entradas demostradas: movimiento W/A/S/D, salto, shift, la tecla `1`, botón izquierdo y derecho del ratón, y movimiento relativo del ratón.
- Modelado de mundo condicionado por acciones (action-conditioned world model), orientado a simular la respuesta del entorno a las decisiones del jugador.
- Generación de vídeo de resolución reducida (256 x 144) con relación de aspecto 16:9.
- No dispone de tool calling ni function calling: no es un modelo de lenguaje y no procesa instrucciones en texto.
- No dispone de capacidades de agente, razonamiento multi-paso, matemáticas ni código.
- No dispone de capacidades multilingües ni de procesamiento de audio.
- No incorpora un modo de razonamiento explícito (thinking mode) ni visión general fuera del dominio entrenado.

## Casos de uso

- Investigación en modelos de mundo para videojuegos: permite estudiar cómo un modelo generativo aprende la dinámica de un entorno interactivo y evaluar la fidelidad de la predicción de fotogramas en función de la acción aplicada.
- Generación de datos sintéticos para aprendizaje por refuerzo: los fotogramas simulados pueden utilizarse como entorno aproximado para entrenar o preentrenar agentes antes de trasladarlos al juego real, reduciendo el coste de interacción.
- Prototipado de agentes de control: gracias a que la acción es una entrada explícita del modelo, es posible comparar contrafactualmente qué habría ocurrido con acciones alternativas, útil para estudiar políticas de movimiento.
- Demostraciones técnicas y docencia: a 256 x 144 y con solo 20 millones de parámetros, el modelo es lo bastante ligero para ejecutarse en portátiles y usarse en clases o talleres sobre difusión y rectified flow.
- Estudio de deriva (drift) en rollouts largos: el propio autor advierte de inconsistencias en secuencias prolongadas, lo que lo convierte en un banco de pruebas para métricas de estabilidad temporal.
- Prueba de concepto de pipelines de vídeo interactivo: sirve para validar arquitecturas de captura de pantalla y entrada (MSS, Pynput, OpenCV, Pillow) antes de escalar a modelos mayores.
- Evaluación comparativa de metodologías de rectified flow frente a difusión estándar en dominios visuales de baja resolución.

## Benchmarks y rendimiento

El único dato de rendimiento publicado en la información disponible es la precisión contrafactual reportada por el autor:

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Precisión contrafactual (counterfactual accuracy) | 85,4 % (mejor registro) | 48 muestras de validación |
| Épocas completadas | 29 | Entrenamiento |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FVD, PSNR u otros) en la información disponible. Estos benchmarks, además, no serían aplicables en su mayoría al tratarse de un modelo de vídeo y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 2 GB. Con 20.039.619 parámetros, los pesos ocupan aproximadamente 80 MB en fp32 y unos 40 MB en fp16, más el espacio de activaciones para resolución 256 x 144.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs integradas y en CPU, aunque la latencia será mayor en CPU.
- GPU de centro de datos (A100, H100) innecesarias para este tamaño; solo tendrían sentido para entrenamiento o para procesar lotes muy grandes.
- Opciones de despliegue: la librería diffusers con PyTorch es la vía documentada. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- La aplicación de referencia es Oasis-Game-Trainer, que integra Python, PyTorch, Diffusers, OpenCV, Pillow, MSS y Pynput para capturar pantalla y entradas.
- Latencia y throughput estimados: no disponibles. Dependen del número de pasos de muestreo configurados, que no se especifica en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Roblox Oasis V4 AI Model (SyntheticMDProductions) | 20.039.619 | Vídeo de gameplay de Roblox, 256 x 144 | No disponible | 85,4 % de precisión contrafactual en 48 muestras | Apache 2.0 | HuggingFace, 0 descargas |
| Oasis (Decart AI) | No disponible | Vídeo de gameplay de Minecraft | No disponible | No disponible | No disponible | No disponible |
| GameNGen (Google) | No disponible | Vídeo de gameplay de DOOM | No disponible | No disponible | No disponible | No disponible |

Los dos proyectos citados como referencia pertenecen al mismo espacio de modelos de mundo interactivos para videojuegos, pero no se dispone de datos verificados de parámetros, contexto, rendimiento ni licencia en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa. Cualquier cifra adicional requeriría consultar sus publicaciones originales.

## Limitaciones y advertencias

- Modelo de investigación y demostración: no es un cliente jugable de Roblox y no se conecta a Roblox, a sus servidores ni a cuentas de usuario.
- Deriva temporal: el propio autor advierte de que en rollouts largos el modelo puede desviarse y volverse inconsistente.
- Distribución de acciones limitada: solo se han demostrado las entradas W/A/S/D, salto, shift, `1`, botones del ratón y movimiento relativo; otras acciones no están cubiertas.
- Evaluación muy reducida: el 85,4 % de precisión contrafactual procede de únicamente 48 muestras de validación, una base estadística débil para extrapolar comportamiento en producción.
- Resolución nativa baja (256 x 144), insuficiente para aplicaciones que requieran detalle visual.
- Adopción nula en el momento de la consulta: 0 descargas y 0 likes, sin comunidad ni soporte documentado más allá del repositorio compañero.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling ni agentes, por lo que no debe integrarse en pipelines conversacionales.
- Riesgo legal sobre los datos: se entrenó con grabaciones de partidas de Roblox y el autor indica explícitamente que solo debe usarse o redistribuirse material sobre el que se tengan los derechos necesarios. El proyecto no está afiliado, respaldado ni patrocinado por Roblox Corporation.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no cubre los derechos sobre el contenido de terceros (imágenes de Roblox) que pueda derivarse del modelo.
- Posibles sesgos: no se documenta ningún análisis de sesgos, y el modelo replica la apariencia y las dinámicas del material de entrenamiento, lo que puede perpetuar sus particularidades visuales y de comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SyntheticMDProductions/Roblox_Oasis_V4_AI_Model
- Repositorio de la aplicación compañera (Oasis-Game-Trainer): https://github.com/dreamsartificial648-sketch/Oasis-Game-Trainer
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
