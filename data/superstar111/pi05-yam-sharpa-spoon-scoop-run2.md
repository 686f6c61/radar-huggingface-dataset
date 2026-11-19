# Superstar111/pi05-yam-sharpa-spoon-scoop-run2

## Resumen

π0.5 two-skill student es una política vision-language-action (VLA) derivada de `pi05_base` de Physical Intelligence y ajustada con la herramienta openpi sobre demostraciones simuladas de un profesor planificador. El modelo está especializado en dos habilidades secuenciales para un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones: "pick up the spoon" (coger la cuchara) y "scoop the beans" (sacar alubias con la cuchara). El autor del repositorio es el usuario de Hugging Face Superstar111 y el checkpoint publicado corresponde al paso 5999 de la ejecución 2 (semilla de entrenamiento 2).

La relevancia de esta ficha es limitada y muy específica: no se trata de un modelo de propósito general, sino de un artefacto de investigación reproducible para un montaje robótico concreto. El repositorio incluye el checkpoint openpi completo, el código fuente de openpi en el commit entrenado, el tokenizador, un script de servicio por websocket, un test de respuesta conocida (`golden.py` / `golden.npz`) y sumas de verificación SHA-256, lo que facilita la validación de la integridad del artefacto.

El entrenamiento se realizó únicamente en simulación (Isaac Lab) y, según la model card, el modelo no se ha ejecutado todavía en el robot real. En simulación, sobre 10 disposiciones nominales y ejecutando 2 de las 10 filas predichas por consulta, cogió la cuchara 10 de 10 veces y sacó alubias de la bandeja 8 de 10 veces. El tamaño del repositorio es de 12,4 GB y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 (`pi05_base` de openpi); detalles internos de la arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el servicio requiere una GPU NVIDIA con unos 10 GB libres) |
| Idiomas soportados | no disponible (las instrucciones de la política son las cadenas `pick up the spoon` y `scoop the beans`) |
| Licencia | no disponible (la model card remite a los términos de openpi para el modelo base) |
| Formato de pesos | checkpoint openpi (`checkpoint/params/` y estadísticas de normalización en `assets/local/main_hcw_nom_n300/`); bundle con `openpi_src.tar.gz` y `openpi_data.tar.gz` |

## Arquitectura y entrenamiento

El modelo es una política π0.5 ajustada mediante openpi, con configuración `pi05_maggie_2skill_hcw_nojit`, sobre demostraciones simuladas generadas por un profesor planificador. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; la model card solo indica que el entrenamiento fue exclusivamente en simulación con Isaac Lab y que el checkpoint publicado corresponde al paso 5999 de la ejecución 2. La configuración declara varias vistas de cámara (cabeza, muñeca derecha y extremo de la mesa), lo que sugiere una política multimodal que combina imágenes y estado propioceptivo.

La interfaz de inferencia es explícita y de baja latencia: recibe tres imágenes uint8 de forma (160, 284, 3) tras una compresión JPEG de calidad 90 (`observation/image`, `observation/wrist_image`, `observation/image2`), el estado de 28 ángulos articulares en radianes (`observation/state`), los 28 objetivos articulares aceptados previamente (`observation/previous_command_rad`) y un prompt de texto. Devuelve `actions` de forma (10, 28) a 10 Hz, donde las seis columnas del brazo son desplazamientos relativos al último objetivo aceptado y las 22 columnas de la mano son valores absolutos. Esta separación entre acciones relativas del brazo y absolutas de la mano es un detalle de diseño relevante para el despliegue.

## Capacidades

- Ejecución de dos habilidades manipulativas concretas: coger una cuchara y sacar alubias con ella.
- Control de un brazo de 6 grados de libertad más una mano de 22 articulaciones (28 articulaciones en total), con salida de 10 pasos de acción a 10 Hz.
- Percepción multimodal a partir de tres cámaras (cabeza, muñeca derecha y extremo de la mesa).
- Condicionamiento por instrucción de texto limitado a dos prompts conocidos.
- Integración con el servidor de políticas de openpi (`scripts/serve_policy.py`) mediante websocket.
- Verificación de respuesta conocida mediante `golden.py` y `golden.npz`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de código, matemáticas, visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en manipulación robótica simulada: servir como política de referencia para reproducir los resultados declarados (10/10 en coger la cuchara y 8/10 en sacar alubias) sobre las 10 disposiciones nominales indicadas, usando el checkpoint y el bundle publicados.
- Validación de pipelines de despliegue openpi: el repositorio incluye `serve_vla.sh`, el código fuente en el commit entrenado y sumas SHA-256, lo que permite comprobar la integridad y poner en marcha un servidor websocket antes de integrar hardware real.
- Desarrollo de sistemas de dos habilidades secuenciales: el modelo ejemplifica cómo encadenar instrucciones ("pick up the spoon" y después "scoop the beans") sobre un mismo estado articular, útil para estudiar transiciones entre habilidades.
- Calibración de montajes de mano robótica: la model card documenta el ajuste necesario cuando la mano se monta girada (restar 90 grados a la articulación 6 en `observation/state` y `observation/previous_command_rad`), lo que sirve como caso práctico de adaptación de cinemática.
- Evaluación de políticas entrenadas solo en simulación: permite medir la brecha sim-to-real antes de invertir en pruebas con el robot físico, ya que el autor indica que no se ha ejecutado en el robot real.
- Pruebas de regresión de servidores de inferencia: `golden.py check` compara las respuestas de un servidor recién arrancado con `golden.npz`, útil en CI para detectar cambios de entorno o de versiones de dependencias.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Éxito al coger la cuchara | 10/10 | Simulación, 10 disposiciones nominales, 2 de 10 filas predichas ejecutadas por consulta |
| Éxito al sacar alubias de la bandeja | 8/10 | Simulación, 10 disposiciones nominales, 2 de 10 filas predichas ejecutadas por consulta |
| Evaluación en robot real | no realizada | El autor indica que no se ha ejecutado en el robot real |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- GPU NVIDIA con aproximadamente 10 GB libres para servir el checkpoint, según la model card.
- Entorno con `uv` para construir el entorno de openpi en la primera ejecución.
- Almacenamiento: el repositorio ocupa 12,4 GB; hay que prever espacio adicional para extraer `openpi_src.tar.gz` y `openpi_data.tar.gz`.
- Despliegue mediante `serve_vla.sh`, que arranca `scripts/serve_policy.py` de openpi en un puerto websocket (el ejemplo usa el 8000).
- No se especifican GPU concretas (A100, H100, RTX 4090) ni cifras de latencia o throughput más allá de la frecuencia de salida de 10 Hz y los 10 pasos de acción por consulta.
- No se documentan opciones de despliegue alternativas como vLLM, llama.cpp, Ollama o TGI; el formato de pesos es un checkpoint openpi, no un formato de LLM estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 two-skill student (este modelo) | no disponible | no disponible | 10/10 coger cuchara; 8/10 sacar alubias (simulación) | no disponible | Hugging Face, 0 descargas, 0 likes |
| `pi05_base` (Physical Intelligence) | no disponible | no disponible | no disponible | según openpi | Disponible a través de openpi |
| Otras políticas openpi | no disponible | no disponible | no disponible | según openpi | Disponibles en el ecosistema openpi |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría; la comparación se limita a la relación con el modelo base y el ecosistema openpi.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Isaac Lab) y no probado en el robot real; el rendimiento sim-to-real es desconocido.
- Especialización extrema: solo dos instrucciones de texto y un montaje concreto (YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones); no es un modelo de propósito general.
- Los resultados declarados (10/10 y 8/10) proceden de 10 disposiciones nominales y de ejecutar solo 2 de las 10 filas predichas por consulta, una configuración de evaluación que conviene tener en cuenta al interpretar las cifras.
- Sensibilidad al montaje de la mano: con el montaje girado hay que restar 90 grados a la articulación 6 en las entradas de estado y de comando previo.
- Licencia no declarada en el repositorio; el uso comercial queda sujeto a los términos de openpi y del modelo base, que no se detallan en la información disponible.
- Riesgo de alucinación y sesgos: no documentados; al tratarse de una política de control, el fallo se manifiesta como acciones incorrectas o incompletas más que como texto inventado.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación independiente por parte de la comunidad.
- No se documentan idiomas soportados ni capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-run2
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
