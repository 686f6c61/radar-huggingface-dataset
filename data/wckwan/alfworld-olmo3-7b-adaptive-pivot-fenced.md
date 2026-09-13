# wckwan/Alfworld-Olmo3-7B-Adaptive-Pivot-Fenced

## Resumen

Alfworld-Olmo3-7B-Adaptive-Pivot-Fenced es un ajuste fino de investigación publicado por el usuario wckwan sobre allenai/Olmo-3-7B-Instruct. No es un modelo de propósito general: se trata de una política entrenada mediante aprendizaje por refuerzo para actuar como agente de búsqueda multi-turno al estilo Search-R1, es decir, un modelo que decide cuándo invocar una herramienta de búsqueda, cómo formular la consulta y cómo integrar las respuestas recuperadas en turnos sucesivos.

El elemento diferencial es el algoritmo de entrenamiento, denominado Process-GRPO. En lugar de usar únicamente una recompensa final por respuesta, se emplea un process reward model (un verificador basado en Olmo-3-7B-Think) que puntúa cada turno de la trayectoria. Además, se aplica una normalización de ventajas por posición de turno dentro de cada grupo y los prompts del verificador incluyen tanto las respuestas de las herramientas recuperadas como la respuesta de referencia (gold answer). El resultado declarado tras 200 pasos de entrenamiento es una puntuación media de process reward de 0,93, unas 2,6 búsquedas por trayectoria y una precisión de batch de entrenamiento de 0,49.

El modelo tiene un interés fundamentalmente metodológico y de replicación: publica la política final en la raíz del repositorio y nueve checkpoints intermedios (pasos 20 a 180) para estudiar la dinámica del entrenamiento. Su adopción real es todavía nula (0 descargas, 0 likes en el momento de la consulta) y no se han publicado resultados de benchmarks estándar, por lo que debe considerarse un artefacto de investigación antes que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base allenai/Olmo-3-7B-Instruct); detalles internos no disponibles |
| Parametros totales | ~7.000 millones (segun la denominacion del modelo base) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio; solo pesos completos. Cuantizacion a 8 bits o 4 bits factible por conversion propia |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers); no se incluyen GGUF ni otros formatos |

Datos adicionales relevantes del repositorio: tamano total de 146,0 GB (incluye la politica final mas nueve checkpoints, lo que implica aproximadamente 14,6 GB por copia, consistente con pesos en bf16/fp16 de un modelo de ~7B). Tags declarados: reinforcement-learning, grpo, search-r1, process-reward, tool-use, text-generation, endpoints_compatible.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base allenai/Olmo-3-7B-Instruct, un transformer decoder-only denso de aproximadamente 7.000 millones de parametros. La model card no detalla la composicion del dataset de preentrenamiento ni del ajuste instruct original, por lo que esos datos se consideran no disponibles en la informacion proporcionada. Lo que si se documenta es la fase de ajuste que da lugar a este modelo concreto.

El entrenamiento consiste en una fase de RL con GRPO modificado que el autor denomina Process-GRPO. Los elementos tecnicos declarados son: (1) un process reward model que actua como verificador, construido sobre Olmo-3-7B-Think, y que puntua cada turno de la trayectoria en lugar de solo la respuesta final; (2) normalizacion de ventajas por par (grupo, posicion de turno), lo que evita que turnos tardios con mas incertidumbre dominen la senal de gradiente; y (3) prompts de verificacion que incluyen las respuestas recuperadas por la herramienta de busqueda y la respuesta gold, de modo que el verificador juzga la calidad del razonamiento intermedio con acceso al contexto real. El regimen de entrenamiento se ejecuto hasta el paso 200, con checkpoints cada 20 pasos. No se especifica el numero de tokens de entrenamiento, el tamano del batch ni la composicion del dataset de tareas, por lo que esos datos no estan disponibles.

## Capacidades

- Generacion de texto en formato conversacional, heredada del modelo instruct base.
- Razonamiento multi-turno con invocacion de herramientas: la politica esta optimizada para decidir cuando buscar, que consulta emitir y como incorporar la informacion recuperada al siguiente turno.
- Tool calling / function calling orientado a busqueda: el entrenamiento estilo Search-R1 implica un protocolo de llamada a herramienta y de lectura de su respuesta.
- Politica de multiples busquedas por trayectoria: el autor reporta una media de 2,6 busquedas por trayectoria, lo que indica que el modelo no colapsa a una unica busqueda ni a cero.
- Razonamiento paso a paso supervisado por un verificador de proceso (verifier-based process supervision), aunque no se documenta un modo "thinking" explicito en la model card.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es exclusivamente text-generation.
- Soporte de agentes en el sentido de ejecucion de secuencias de acciones con realimentacion de entorno, especialmente en entornos de texto tipo ALFWorld segun el nombre del modelo.

## Casos de uso

- Investigacion en RL para agentes: el repositorio incluye diez puntos de control (pasos 20 a 200) que permiten estudiar la evolucion de la politica, la diversidad de busquedas y la estabilidad de la normalizacion de ventajas por turno sin tener que reproducir el entrenamiento completo.
- Replicacion y ablacion de Process-GRPO: sirve como referencia publicada de un pipeline que combina process reward models con GRPO, util para comparar contra variantes con recompensa solo final.
- Generacion de trayectorias de busqueda sinteticas: la politica puede usarse para producir datos de entrenamiento multi-turno (consulta, respuesta de herramienta, razonamiento) que despues se destilen en modelos mas pequenos o en modelos con cuantizacion agresiva.
- QA agéntico sobre corpus documentales: integrado con un retriever real, el modelo puede resolver preguntas que requieren encadenar varias consultas, aprovechando que fue entrenado para decidir consultas sucesivas en lugar de una sola.
- Evaluacion de verificadores de proceso: dado que el entrenamiento depende de un process reward model, el modelo y sus checkpoints permiten medir cuanto aporta un verificador con acceso a respuestas de herramienta y a la respuesta gold frente a uno que no lo tiene.
- Analisis de colapso de politica: la metrica de 2,6 busquedas por trayectoria convierte a estos checkpoints en un banco de pruebas para detectar si una politica RL deja de explorar (colapso a cero busquedas) o se vuelve redundante (muchas busquedas sin ganancia de precision).
- Base para fine-tuning vertical: al estar bajo Apache-2.0, puede ajustarse adicionalmente para dominios concretos (legal, biomedico, soporte tecnico) partiendo de una politica que ya sabe operar con herramientas.
- Docencia y formacion tecnica: util como ejemplo reproducible de un pipeline completo de RL con verificador, poco frecuente en modelos abiertos de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye metricas internas de entrenamiento en el paso 200, que no son comparables con MMLU, HumanEval, GSM8K ni con evaluaciones estandar de agentes:

| Metrica de entrenamiento (paso 200) | Valor |
|---|---|
| Puntuacion media de process reward | ~0,93 |
| Busquedas por trayectoria | ~2,6 |
| Precision del batch de entrenamiento | ~0,49 |

Advertencia: estos valores provienen del propio autor y no han sido verificados de forma independiente. La precision de batch de 0,49 es sustancialmente inferior a la puntuacion del verificador (0,93), lo que sugiere que el verificador puntua favorablemente formas de razonamiento que no siempre culminan en la respuesta correcta.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 15 GB solo para pesos, mas cache KV. En la practica, entre 18 y 24 GB para contextos moderados.
- VRAM estimada a 8 bits: alrededor de 8-9 GB de pesos.
- VRAM estimada a 4 bits (NF4, GPTQ o AWQ generados por el usuario): alrededor de 4-6 GB.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB son adecuadas con margen de sobra para bf16 e incluso para servir varias replicas.
- GPU de consumo: si cabe. Una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ejecutar los pesos en bf16 con contexto corto. Una RTX 4080 (16 GB) exigiria cuantizacion a 8 bits, y una RTX 3060 de 12 GB requeriria cuantizacion a 4 bits.
- Almacenamiento: el repositorio completo ocupa 146 GB. Para descargar solo la politica final conviene filtrar los subdirectorios step_* durante la descarga.
- Opciones de despliegue: transformers de forma nativa (es el formato publicado). vLLM y TGI deberian funcionar al tratarse de una arquitectura HF estandar, aunque no hay confirmacion del autor. llama.cpp u Ollama requeririan convertir previamente los pesos a GGUF, ya que no se publica ninguna version cuantizada.
- Latencia y throughput: no disponibles. El coste por respuesta depende del numero de turnos de busqueda generados (media declarada de 2,6), lo que multiplica la latencia respecto a una generacion de un solo paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alfworld-Olmo3-7B-Adaptive-Pivot-Fenced | ~7B denso | No disponible | Process-GRPO con verificador sobre Olmo-3-7B-Instruct | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| allenai/Olmo-3-7B-Instruct (modelo base) | ~7B denso | No disponible en la informacion proporcionada | Ajuste instruct de proposito general | Apache-2.0 | HuggingFace, modelo de referencia de AI2 |
| Otras politicas abiertas estilo Search-R1 | No disponible | No disponible | RL con recompensa final sobre modelos de 7B | No disponible | No disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada. La diferencia principal frente al modelo base no es de capacidad general, sino de especializacion: el modelo base no ha sido optimizado para decidir busquedas multi-turno, mientras que este ajuste si, a costa de perder presumiblemente versatilidad fuera del dominio de agente.

## Limitaciones y advertencias

- Artefacto de investigacion sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicos ni evaluacion por terceros.
- Brecha entre verificador y precision real: la puntuacion media de process reward (0,93) contrasta con una precision de batch de entrenamiento de 0,49. Un verificador que puntua alto trayectorias incorrectas puede inducir comportamientos que parecen correctos pero no resuelven la tarea.
- Dependencia fuerte del formato: el sufijo "Fenced" y la naturaleza del entrenamiento sugieren que el modelo espera un protocolo concreto de marcadores para delimitar turnos, llamadas a herramienta y respuestas. Fuera de ese formato es probable una degradacion severa del rendimiento.
- Sobreajuste al dominio: el nombre remite a ALFWorld y a tareas de busqueda; no hay evidencia de que las capacidades generales del modelo base se conserven intactas tras el ajuste con RL.
- Idiomas: no se declara ningun conjunto de idiomas soportados. No debe asumirse un buen rendimiento en castellano sin evaluacion previa.
- Alucinacion: al ser un agente que consume resultados de busqueda, existe riesgo de que cite o parafrasee contenido no presente en las respuestas de la herramienta, un fallo tipico de las politicas entrenadas con recompensa de proceso.
- Sesgos: no disponibles. No hay documentacion sobre composicion del dataset ni sobre analisis de sesgos.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base allenai/Olmo-3-7B-Instruct y del verificador empleado durante el entrenamiento, ya que el autor no detalla si se redistribuyen pesos derivados de este ultimo.
- Coste de almacenamiento: 146 GB de repositorio, lo que penaliza su uso en entornos con espacio limitado si no se descargan selectivamente los checkpoints.
- Sin cuantizaciones oficiales: no hay GGUF, GPTQ ni AWQ publicados, de modo que el despliegue en hardware de consumo exige trabajo adicional de conversion y validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wckwan/Alfworld-Olmo3-7B-Adaptive-Pivot-Fenced
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Papers, repositorios o demos adicionales: no encontrados. La busqueda web realizada no devolvio ningun recurso relacionado con este modelo; los resultados obtenidos correspondian a informacion sobre elecciones municipales en Baja Sajonia (Alemania) y no guardan relacion con el modelo.
