# Takzen/jay-4b

## Resumen
Jay 4B es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario Takzen, especializado en la clasificación de paquetes npm maliciosos. A diferencia de los modelos generativos convencionales, Jay no produce texto: realiza una única pasada forward y extrae la decisión de los logits asociados a las letras de las opciones presentadas en el prompt, devolviendo una distribución de probabilidad sobre dos preguntas concretas: si una versión de paquete es maliciosa y, en caso afirmativo, si fue construida para atacar o se trata de una biblioteca secuestrada.

El modelo aborda un problema de seguridad de la cadena de suministro en el ecosistema npm. El conjunto de datos abierto de DataDog contiene 25.460 versiones maliciosas construidas para atacar y 1.448 versiones secuestradas publicadas entre 2024 y octubre de 2026. El 35% de las versiones de ataque de 2026 se ejecutan al importar el paquete, sin depender de hooks de instalación, lo que hace insuficiente el bloqueo de scripts. Jay analiza el código en sí, con independencia de cómo se ejecute.

Con 4.000 millones de parámetros en el modelo base, licencia Apache 2.0 y un adaptador de apenas 0.2 GB, Jay está pensado para ejecutarse en 4 bits sobre una única GPU de consumo. Forma parte de una familia de adaptadores del mismo autor junto con Shrike 4B, Bullfinch 4B y Serin 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con adaptador LoRA/QLoRA |
| Parametros totales | 4.000 millones (modelo base); tamano del adaptador no disponible en detalle |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta ~3.600 tokens por consulta (prompt de clasificacion) |
| Tipos de cuantizacion | 4 bits (QLoRA para entrenamiento e inferencia); otras no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 0.2 GB |

## Arquitectura y entrenamiento
Jay 4B es un adaptador PEFT (LoRA) entrenado con QLoRA sobre Qwen/Qwen3.5-4B, con el modelo base congelado en 4 bits. La innovación principal no reside en la arquitectura del transformer subyacente, sino en el mecanismo de decisión: el prompt se construye como un mensaje de chat donde el estado es el paquete npm (package.json, lista de ficheros con tamanos, objetivos de hooks de instalación, puntos de entrada y otros ficheros de código ordenados por tamano, hasta unos 6.000 caracteres de código). El turno del asistente se prellena con `{"answer": "` y la decisión se obtiene mediante softmax sobre los logits de las letras de las opciones, dividida por una temperatura ajustada de 1.231 almacenada en CALIBRATION.json. La pregunta de origen solo se formula cuando p(malicioso) ≥ 0.5.

El entrenamiento se realizó sobre datos de paquetes npm, incluyendo el conjunto abierto de DataDog con versiones maliciosas y secuestradas. La calibración se ajustó sobre una partición de 974 respuestas, reduciendo el ECE del 1,3% al 0,8%. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de las referencias al conjunto de DataDog.

## Capacidades
- Clasificación binaria de maliciosidad de una versión de paquete npm con probabilidad calibrada.
- Clasificación de origen de la amenaza: paquete construido para atacar frente a biblioteca secuestrada (hijacked).
- Análisis de código estático sin ejecución: el tarball se lee en memoria, no se extrae, instala ni ejecuta.
- Detección de ataques que se ejecutan al importar el paquete, sin hooks de instalación.
- Salida estructurada con distribuciones de probabilidad completas y ficheros mostrados al modelo.
- Integración mediante script autocontenido (`jay_infer.py`) con soporte para paquetes del registro npm (verificación de integridad) y tarballs locales.
- Modo JSON para obtener distribuciones completas, ficheros analizados y hooks de instalación.
- No soporta tool calling, agentes, visión ni audio; no genera texto libre.

## Casos de uso
- Triaje en pipelines de CI/CD: puntuar únicamente las versiones nuevas que aparecen en un diff de lockfile, indexadas por nombre, versión y hash de integridad, para priorizar la revisión humana antes de la instalación.
- Monitorización de dependencias en producción: comparar el hash de integridad de cada versión con el del registro público y alertar cuando difiera, enviando después la versión sospechosa a Jay para obtener p(malicioso).
- Detección de paquetes comprometidos sin hooks: analizar versiones que se ejecutan al importarse, escenario que representa el 35% de los ataques de 2026 en el conjunto de DataDog y que las reglas basadas en scripts de instalación no cubren.
- Clasificación de origen para respuesta a incidentes: cuando se confirma una versión maliciosa, usar la segunda pregunta del modelo para distinguir entre un paquete creado específicamente para atacar y una biblioteca legítima secuestrada, lo que orienta la comunicación y el alcance del incidente.
- Filtrado previo en espejos y proxies de registro npm: aplicar el modelo sobre versiones recién publicadas antes de servirlas a los equipos de desarrollo, con un umbral calibrado de p ≥ 0.95 que mantiene un 70% de detección y solo un 0,25% de falsos positivos sobre versiones benignas.
- Auditoría de dependencias heredadas: procesar tarballs locales de proyectos antiguos para identificar versiones sospechosas que nunca pasaron por controles de seguridad, aprovechando que el modelo funciona sobre ficheros .tgz sin necesidad de acceso al registro.
- Enriquecimiento de alertas de seguridad: adjuntar la probabilidad calibrada y el origen estimado a las alertas existentes para reducir la fatiga de alertas y ordenar la cola de revisión del equipo de seguridad.

## Benchmarks y rendimiento
Panel de prueba: 1.992 paquetes npm vistos por primera vez en 2026 y nunca usados en entrenamiento (453 versiones maliciosas, 1.622 benignas). Umbral de detección en p(malicioso) ≥ 0.5; GuardDog con sus propias etiquetas de riesgo.

| Metodo | AUROC | Detectados: construidos para atacar | Detectados: secuestrados | Falsos positivos: npm aleatorio | Falsos positivos: con script de instalacion |
|---|---:|---:|---:|---:|---:|
| Regla: tiene script de instalacion | 0.736 | 62% | 57% | 2.8% | 99.5% |
| GuardDog 3.2.0, cualquier riesgo | 0.820 | 84% | 80% | 23% | 89% |
| GuardDog 3.2.0, riesgo alto (≥ 7.6) | 0.820 | 40% | 46% | 3.5% | 16% |
| Qwen3.5-4B sin ajuste | 0.850 | 71% | 6.7% | 0.1% | 4.9% |
| Jay 4B | 0.927 | 81% | 40% | 1.3% | 3.3% |

- AUROC: +0.107 sobre GuardDog (intervalo de confianza del 95%: 0.084 a 0.130) y +0.077 sobre el modelo base sin ajustar (0.056 a 0.097), con bootstrap emparejado por paquete sobre las mismas filas.
- Origen: el 94,3% de las versiones maliciosas se clasifican correctamente como construidas para atacar o secuestradas (macro-F1 0.916; el modelo base sin ajustar obtiene un 41%).
- Paquetes populares: ningún falso positivo sobre 197 versiones de paquetes npm populares publicadas en 2026 (nombres nunca vistos en entrenamiento; la regla de script de instalación marca el 12%) ni sobre 86 paquetes conocidos en su última versión (esbuild, electron, bun y otros).
- Calibración: temperatura 1.231 ajustada sobre una partición de 974 respuestas (ECE del 1,3% al 0,8%). Con p calibrada ≥ 0.95, Jay detecta el 70% de las versiones maliciosas con 4 falsos positivos sobre 1.622 versiones benignas (0,25%).
- Punto débil: bibliotecas secuestradas. Jay detecta el 40%; GuardDog a cualquier riesgo detecta el 80% y la regla de script de instalación el 57%, ambos con muchos más falsos positivos. El primer piloto detectó el 52% de los secuestros pero marcó el 14% de paquetes benignos con script de instalación, incluidos esbuild, electron y bun; esta versión sacrifica recall de secuestros para eliminar esos falsos positivos.

## Requisitos de hardware
- VRAM estimada: el modelo base en 4 bits requiere aproximadamente 2,5 a 3,5 GB de VRAM, más el adaptador LoRA (0,2 GB) y el overhead de activaciones y contexto (hasta ~3.600 tokens). Una GPU de consumo con 8 GB es suficiente; con 6 GB puede ser ajustado.
- GPU recomendadas: cualquier GPU CUDA de consumo con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070, RTX 4090) para inferencia. Para procesamiento por lotes a mayor escala, A100 o H100 permiten mayor paralelismo.
- Cabe en GPU de consumo: sí, en 4 bits sobre una única GPU de consumo. El autor indica que funciona en una GPU de consumo bajo WSL.
- Opciones de despliegue: el repositorio incluye `jay_infer.py`, autocontenido, con dependencias torch, transformers, peft, bitsandbytes y accelerate. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador de clasificación con extracción de logits, el despliegue estándar es mediante transformers y PEFT.
- Latencia y throughput: una pasada forward por pregunta, hasta ~3.600 tokens; aproximadamente una pregunta por segundo en una GPU de consumo bajo WSL.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | AUROC (panel 2026) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jay 4B | Adaptador LoRA de clasificacion sobre Qwen3.5-4B | 4.000 M (base) | ~3.600 tokens | 0.927 | Apache 2.0 | HuggingFace (8 descargas) |
| Qwen3.5-4B sin ajuste | Modelo generativo base | 4.000 M | No disponible | 0.850 | No disponible en la informacion | HuggingFace |
| GuardDog 3.2.0 | Herramienta de analisis estatico basada en reglas y heuristicas | No aplica | No aplica | 0.820 | No disponible en la informacion | Proyecto open source |
| Regla de script de instalacion | Heuristica simple | No aplica | No aplica | 0.736 | No aplica | Implementacion propia |

## Limitaciones y advertencias
- Recall limitado en bibliotecas secuestradas: solo detecta el 40% de las versiones hijacked, frente al 80% de GuardDog a cualquier riesgo. Un secuestro es una biblioteca real y a menudo grande con código inyectado, y Jay solo ve unos 6.000 caracteres de código.
- Ventana de código limitada: el prompt incluye aproximadamente 6.000 caracteres de código, lo que puede dejar fuera código malicioso en paquetes grandes.
- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés.
- Específico de npm: no se ha validado sobre otros ecosistemas (PyPI, Maven, etc.).
- Herramienta de triaje, no de bloqueo automático: el autor la describe explícitamente como una ayuda para priorizar la revisión humana, no como un sustituto de controles deterministas como la verificación de hashes de integridad.
- Riesgo de alucinación no aplica en el sentido generativo, pero la calibración de probabilidades puede degradarse fuera de la distribución de entrenamiento (paquetes de 2026 en adelante).
- No detecta ataques que no estén representados en el código visible del paquete, como dependencias transitivas maliciosas o cargas dinámicas ofuscadas más allá de la ventana analizada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado; no se detalla en la información disponible.
- Popularidad muy baja (8 descargas, 0 likes) y publicación reciente (27 de octubre de 2026): no hay validación independiente de los resultados reportados por el autor.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Takzen/jay-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo hermano Shrike 4B: https://huggingface.co/Takzen/shrike-4b
- Modelo hermano Bullfinch 4B: https://huggingface.co/Takzen/bullfinch-4b
- Modelo hermano Serin 4B: https://huggingface.co/Takzen/serin-4b
- Conjunto de datos de DataDog sobre paquetes npm maliciosos: no disponible el enlace directo en la informacion proporcionada
- GuardDog: no disponible el enlace directo en la informacion proporcionada
