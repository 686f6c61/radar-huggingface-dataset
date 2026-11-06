# vincent-won/spine-il-gr00t-n1.7

## Resumen

Spine IL es un ajuste fino del modelo fundacional de robótica NVIDIA GR00T N1.7 (3B) orientado a una tarea quirúrgica concreta: la laminectomía endoscópica unilateral biportal (UBE) en los niveles L3-L5 de la columna lumbar. El modelo parte de `nvidia/GR00T-N1.7-3B`, cuyo backbone es `nvidia/Cosmos-Reason2-2B`, y se entrena con imitación supervisada sobre 90 grabaciones de demostraciones de manos rastreadas, ampliadas a 417 episodios y 178.068 fotogramas. Dado un render del endoscopio, la posición de las dos puntas de herramienta y una instrucción en lenguaje natural, predice los siguientes 40 pasos de movimiento de las herramientas y un valor de progreso del procedimiento.

La relevancia del modelo es doble. Por un lado, demuestra que un VLA (vision-language-action) de 3B parámetros puede condicionarse a instrucciones lingüísticas que modulan el alcance de una intervención quirúrgica («ipsilateral» frente a «contralateral»), algo poco habitual en robótica quirúrgica simulada. Por otro, publica resultados en bucle cerrado con dos brazos SO-101 que muestran una separación estadísticamente significativa entre ambas condiciones (9,9 % de hueso removido más allá de la línea media frente a 0,4 %). Es, sin embargo, un artefacto de investigación: no es un dispositivo médico y no se ha probado en tejido real.

El modelo tiene 3.144.016.000 parámetros, un repositorio de 12,6 GB en safetensors y se distribuye bajo la NVIDIA Open Model License con restricciones de uso a investigación y evaluación. La model card es explícita sobre las limitaciones: un solo cirujano, una sola anatomía virtual, una sola semilla de entrenamiento y evaluación realizada por el mismo simulador que generó las imágenes de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en GR00T N1.7; backbone `nvidia/Cosmos-Reason2-2B`, derivado de `Qwen/Qwen3-VL-2B-Instruct` |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento son frases en inglés; no se declara cobertura multilingüe) |
| Licencia | NVIDIA Open Model License (etiquetada como `other` en Hugging Face); uso limitado a investigación y evaluación |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entrada visual | `observation.images.endo`: 256 × 256 RGB, render de endoscopio (water optics), 15 fps |
| Entrada de estado | 16 valores: punta de endoscopio xyz (mm) + cuaternión wxyz, punta de taladro xyz + cuaternión wxyz, gatillo, padding |
| Entrada de lenguaje | una frase de instrucción (alcance: ipsilateral / contralateral / sin especificar) |
| Salida de acción | chunk de 40 × 16 (dos poses de herramienta relativas al estado, gatillo, `drill.progress` de 0 a 1) |
| Criterio de parada | el arnés del robot detiene la perforación cuando el progreso predicho supera 0,85 durante 5 pasos consecutivos |
| Modelo base | `nvidia/GR00T-N1.7-3B` |
| Dataset de entrenamiento | `vincent-won/spine-il-hand90` |
| Framework | LeRobot 0.6.1, `policy.type=groot` |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre GR00T N1.7, que a su vez emplea como backbone `nvidia/Cosmos-Reason2-2B`, derivado de `Qwen/Qwen3-VL-2B-Instruct`. La arquitectura combina un codificador visión-lenguaje (que procesa la imagen del endoscopio y la instrucción textual) con una cabeza de acción que emite chunks de 40 pasos con 16 dimensiones por paso. Las acciones se entrenan como relativas al estado (`use_relative_actions=true`), salvo el gatillo y el progreso, que son absolutos.

El ajuste fino es deliberadamente parcial: se entrenan las 4 capas superiores del LLM, la capa de normalización visión-lenguaje, el proyector y la cabeza de acción, mientras el resto de los pesos permanece congelado. El entrenamiento usó 417 episodios y 178.068 fotogramas derivados de 90 grabaciones, con 131 frases de instrucción distintas, durante 20.000 pasos con batch 32, AdamW con lr 1e-4, schedule coseno y precisión bf16. Se ejecutó en una única NVIDIA RTX PRO 6000 Blackwell Server Edition en Nebius AI Cloud durante 2 h 12 min (aproximadamente 2,6 pasos/s). Se conservó el checkpoint final (paso 020000), sin datos de validación reservados y con una sola semilla.

## Capacidades

- Predicción de trayectorias de acción en robótica quirúrgica: genera chunks de 40 pasos con las poses de dos herramientas (endoscopio y taladro), el estado del gatillo y un valor escalar de progreso del procedimiento.
- Condicionamiento por lenguaje natural: la instrucción modula el alcance de la laminectomía (permanecer ipsilateral o descomprimir el lado contralateral cruzando la línea media).
- Percepción visual a partir de render de endoscopio a 256 × 256 y 15 fps.
- Fusión de estado propioceptivo (posiciones y cuaterniones de ambas puntas de herramienta en milímetros, marco LPS) con la observación visual.
- Control en bucle cerrado: el modelo se ejecuta de forma iterativa sobre dos brazos SO-101 en simulación, con criterio de parada basado en el progreso predicho.
- Generalización parcial a formulaciones de instrucción no vistas durante el entrenamiento (variantes léxicas que comparten palabras clave con las de entrenamiento).
- No soporta tool calling, function calling, razonamiento multi-paso genérico, visión natural ni audio; es un modelo específico de política robótica.

## Casos de uso

- Investigación en imitación para cirugía endoscópica: servir como política de referencia en simuladores de laminectomía UBE para estudiar cómo el lenguaje modula el comportamiento quirúrgico. Es adecuado porque el modelo está entrenado exactamente sobre esa tarea y publica resultados en bucle cerrado.
- Estudio de condicionamiento lingüístico en VLAs: comparar el efecto de instrucciones «ipsilateral» frente a «contralateral» sobre la distribución de acciones generadas, con métricas de hueso removido más allá de la línea media.
- Evaluación de generalización a paráfrasis: probar formulaciones no vistas que compartan palabras clave («only», «opposite side») para medir hasta qué punto el modelo comprende el significado frente a la asociación léxica.
- Banco de pruebas de infraestructura de política remota: el repositorio incluye un servidor HTTP (`spine-policy/1` con `GET /health`, `GET /info`, `POST /act`) y un Dockerfile, útil para validar pipelines de inferencia de políticas en la nube.
- Baseline para comparación de métodos de imitación: al ser un ajuste fino de GR00T N1.7 con hiperparámetros y datos documentados, sirve como punto de partida reproducible para comparar variantes de arquitectura o de datos.
- Docencia y divulgación en robótica quirúrgica simulada: permite ilustrar el ciclo percepción-lenguaje-acción con una tarea concreta y métricas cuantitativas, siempre en entorno virtual y sin contacto con tejido.
- Estudio de criterios de parada aprendidos: analizar el uso de `drill.progress` y el umbral 0,85 como mecanismo de terminación, y su relación con el alcance real de la perforación.

## Benchmarks y rendimiento

Resultados en bucle cerrado publicados en la model card (105 ejecuciones sobre dos brazos SO-101, 35 por nivel desde cuatro poses iniciales). La métrica es la proporción de hueso removido más allá de la línea media.

| Condición | Instrucción contralateral | Instrucción ipsilateral | Significación |
|---|---|---|---|
| 48 ejecuciones con instrucciones vistas | 9,9 % | 0,4 % | p < 0,001 |
| 48 ejecuciones con formulaciones no vistas | 9,8 % | 0,2 % | no indicada |
| Nivel L4, formulaciones no vistas | 18,1 % | 0,6 % | p < 0,001 |
| Nivel L5, formulaciones no vistas | 10,6 % | 0,0 % | p < 0,001 |
| Nivel L3, formulaciones no vistas | 0,6 % | 0,1 % | p = 0,053 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,14B parámetros, en bf16 los pesos ocupan aproximadamente 6,3 GB; en fp32, unos 12,6 GB. A ello hay que sumar el estado del backbone visión-lenguaje y las activaciones, por lo que se recomienda al menos 16 GB de VRAM para bf16.
- GPU recomendadas: el autor entrenó en una NVIDIA RTX PRO 6000 Blackwell Server Edition. Para inferencia, una RTX 4090 (24 GB) o una A100/H100 son opciones holgadas; una RTX 3090 (24 GB) también debería ser suficiente en bf16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 y RTX 4080 (16 GB) en bf16, siempre que se disponga de la configuración del modelo base `nvidia/Cosmos-Reason2-2B` (con acceso restringido en Hugging Face).
- Opciones de despliegue: el autor proporciona `robot/inference/remote/policy_server.py --backend lerobot --policy-path <repo>` con API HTTP `spine-policy/1`, además de un Dockerfile en `robot/train/nebius/serverless/`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuadas para un VLA con cabeza de acción.
- Latencia y throughput: no disponibles para inferencia. Como referencia, el entrenamiento corrió a aproximadamente 2,6 pasos/s con batch 32 en una RTX PRO 6000 Blackwell.
- Requisito adicional: la carga necesita la configuración del modelo base `nvidia/Cosmos-Reason2-2B`, con acceso restringido en Hugging Face (aceptar términos e iniciar sesión, o disponer de caché local del hub).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spine IL (este modelo) | 3,14B | no disponible | Laminectomía UBE simulada, condicionada por lenguaje | NVIDIA Open Model License, solo investigación | Hugging Face, 7 descargas |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | Política robótica generalista | NVIDIA License, investigación y evaluación | Hugging Face (modelo base) |
| nvidia/Cosmos-Reason2-2B | 2B | no disponible | Backbone visión-lenguaje | no disponible en la información | Hugging Face (acceso restringido) |
| Qwen/Qwen3-VL-2B-Instruct | 2B | no disponible | VLM generalista | Apache-2.0 | Hugging Face (origen del backbone) |

No se dispone de datos de rendimiento comparables entre estos modelos para la tarea quirúrgica, ya que solo Spine IL publica métricas en bucle cerrado sobre laminectomía simulada.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card indica explícitamente «research and evaluation use only», no apto para uso clínico ni en pacientes.
- Evaluación circular: el mismo simulador que generó las imágenes de entrenamiento puntuó las ejecuciones del robot; no se probó hueso ni tejido real.
- Sesgo de configuración experimental: un solo cirujano, una sola anatomía virtual, poses iniciales dentro del rango demostrado, una sola semilla de ajuste fino, robot a un tercio de la velocidad de demostración y sin fuerza de contacto en las puntas virtuales.
- Alcance contralateral limitado: máximo de 5,2 mm frente a una media demostrada de 10-12 mm; un timeout de supervisión terminó 14 de las 48 ejecuciones contralaterales.
- Comprensión lingüística no demostrada: las formulaciones no vistas comparten palabras clave con las de entrenamiento («only», «opposite side»), por lo que el autor deja abierta la cuestión de si el modelo entiende el significado o solo asocia léxico.
- Sin datos de validación reservados: el checkpoint es el paso final sin conjunto held-out, lo que impide estimar sobreajuste.
- Riesgo de alucinación de acciones: como política generativa, puede producir trayectorias plausibles pero incorrectas; el criterio de parada basado en `drill.progress > 0,85` durante 5 pasos es heurístico y no garantiza corrección anatómica.
- Restricciones de licencia: NVIDIA Open Model License y NVIDIA License del repositorio GR00T N1.7 limitan el uso a investigación y evaluación; el uso comercial requiere revisión legal específica.
- Dependencia de acceso restringido: la carga exige aceptar los términos de `nvidia/Cosmos-Reason2-2B`, lo que puede bloquear despliegues automatizados sin credenciales.
- Idiomas: no se declara cobertura multilingüe; las instrucciones de entrenamiento están en inglés y no hay evidencia de funcionamiento en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vincent-won/spine-il-gr00t-n1.7
- Dataset de entrenamiento: https://huggingface.co/datasets/vincent-won/spine-il-hand90
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Origen del backbone: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Código y servidor de política: https://github.com/geebab/spine-il
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
