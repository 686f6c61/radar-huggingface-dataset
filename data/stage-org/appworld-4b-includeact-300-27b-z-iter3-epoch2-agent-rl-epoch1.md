# Stage-org/appworld-4b-includeact-300-27b-z-iter3-epoch2-agent-rl-epoch1

## Resumen

Stage-org/appworld-4b-includeact-300-27b-z-iter3-epoch2-agent-rl-epoch1 es un modelo de lenguaje de aproximadamente 4.540 millones de parámetros (4,54 B) publicado por el usuario u organización Stage-org en HuggingFace. El propio identificador del repositorio sugiere un checkpoint resultante de un pipeline de ajuste por refuerzo (RL) orientado a tareas de agente, con referencias a la iteración 3, época 2 y a una etapa inicial de "agent-rl" tras la época 1, además de una mención a un modelo de 27 B que probablemente actúa como profesor, juez o referencia en el proceso de entrenamiento. Se trata, por tanto, de un modelo pequeño con vocación de agente, más que de un modelo generalista de propósito amplio.

La etiqueta de arquitectura declarada en el repositorio es `qwen3_5`, lo que sitúa la base en la familia Qwen 3.5 de Alibaba, aunque la ficha no confirma explícitamente ni la longitud de contexto, ni los idiomas, ni la licencia, ni los datos de entrenamiento empleados. Los pesos se distribuyen en formato `safetensors`, con un tamaño de repositorio de 9,1 GB que es coherente con un checkpoint en precisión bf16/fp16 (4,54 B × 2 bytes ≈ 9,08 GB) y descarta la presencia de cuantizaciones GGUF o de pesos en 4 bits.

Su relevancia es acotada pero concreta: ocupa el nicho de los modelos de ~4 B afinados específicamente para razonamiento multi-paso y uso de herramientas, donde el coste de inferencia permite ejecución en una única GPU de consumo y despliegues con latencia baja. El contrapunto es la escasez de información publicada: 8 descargas, 0 "likes" y ausencia total de ficha técnica, benchmarks o licencia declarada, lo que obliga a tratar cualquier dato no listado aquí como no verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No confirmada en la ficha; la etiqueta del repositorio indica `qwen3_5` (familia Qwen 3.5) |
| Parámetros totales | 4.539.265.536 (≈ 4,54 B), dato real de los safetensors |
| Parámetros activos | No procede / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica safetensors (sin GGUF ni cuantizaciones de 4/8 bits) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 9,1 GB, compatible con pesos en bf16/fp16) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de la etiqueta `qwen3_5`, que apunta a la familia Qwen 3.5 de Alibaba. Dado el tamaño de los pesos (9,1 GB para 4,54 B de parámetros) y la ausencia de cualquier mención a mezcla de expertos, todo indica un transformer denso con pesos en bf16/fp16, pero esto es una inferencia a partir de los metadatos, no un dato confirmado por el autor. Del mismo modo, no se especifica si emplea atención lineal, decodificación especulativa, cabezas de razonamiento explícito ni ninguna otra innovación técnica.

El identificador del repositorio permite reconstruir, con cautela, un posible pipeline de entrenamiento: un punto de partida de ~4 B, una etapa intermedia asociada a "appworld" (nombre del conocido entorno de evaluación de agentes AppWorld), una fase etiquetada "includeact-300", una referencia a un modelo de 27 B y dos fases secuenciales de ajuste por refuerzo (iteración 3, época 2, y una etapa "agent-rl" de una época). No hay información sobre número de tokens de entrenamiento, composición del dataset, uso de SFT/DPO/RLHF ni hiperparámetros. Cualquier conclusión sobre el proceso formativo es interpretación del nombre, no documentación publicada.

## Capacidades

- Generación de texto y razonamiento multi-paso: el nombre del repositorio apunta a un entrenamiento específico para cadenas de razonamiento de varios turnos, aunque no hay evaluación publicada que lo confirme.
- Uso de agentes y entornos interactivos: la referencia a "appworld" y a "agent-rl" sugiere entrenamiento sobre tareas de agente con acciones y observaciones, típicamente con llamadas a herramientas y estados intermedios.
- Tool calling / function calling: plausible por el diseño declarado en el identificador, pero no confirmado en la ficha del modelo.
- Capacidades multilingües: no disponible; no se declara ningún conjunto de idiomas.
- Capacidades de visión o audio: no disponible y, dado que la pipeline no está declarada y las etiquetas no incluyen modalidades adicionales, no hay indicios de soporte multimodal.
- Modo "thinking" o razonamiento extendido: no disponible.
- Instrucción conversacional general: no disponible; el foco aparente es la ejecución de tareas de agente, no el diálogo abierto.

## Casos de uso

- Automatización de tareas de agente en entornos tipo AppWorld: el modelo se habría entrenado específicamente para emitir llamadas a API y gestionar observaciones en un bucle de varios pasos, por lo que encaja como política de acción en entornos de evaluación de agentes y en automatizaciones internas con herramientas definidas.
- Orquestación de flujos con function calling en producción: con 4,54 B de parámetros puede desplegarse detrás de un router que decida qué herramienta invocar (consulta a base de datos, envío de correo, consulta a API REST) manteniendo coste por token bajo.
- Prototipado e investigación en RL para agentes: su tamaño permite iterar rápido en laboratorio, ejecutar múltiples réplicas en una sola GPU y comparar políticas sin el coste de un modelo de 27 B o superior.
- Evaluación comparativa de pipelines de RL: sirve como punto de control intermedio ("iter3-epoch2-agent-rl-epoch1") para estudiar cómo evoluciona el comportamiento de un agente a lo largo del entrenamiento por refuerzo.
- Extracción estructurada de información con salida en JSON: un modelo de 4 B ajustado para seguir instrucciones con formato es adecuado para convertir texto libre en esquemas estructurados dentro de un pipeline ETL, siempre que se valide la salida.
- Asistente interno de resolución de incidencias técnicas: integrado con herramientas de ticketing y monitorización, el modelo puede encadenar consultas (estado del servicio, logs, historial) antes de proponer una acción correctiva.
- Clasificación y enrutado dentro de un sistema multiagente: por su bajo coste, puede actuar como agente "portero" que decide qué modelo mayor debe atender cada petición.
- Generación de código acotada a APIs conocidas: con contexto y documentación de la herramienta inyectada en el prompt, puede producir llamadas correctas a funciones, aunque no hay HumanEval ni datos equivalentes publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9,1 GB solo de pesos, más la caché KV. Con contexto moderado (8-16 K tokens) el consumo total se sitúa típicamente en 11-14 GB, aunque no puede calcularse con precisión porque se desconoce la longitud de contexto y la configuración de atención.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,5-5 GB de pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,5-3 GB de pesos; requeriría convertir los safetensors a un formato cuantizado, ya que el repositorio no incluye GGUF.
- GPU de consumo: cabe holgadamente en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16. En una RTX 4070 Ti / 4080 (12-16 GB) es viable en bf16 con contexto reducido o en 8 bits con más margen. En tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) sería necesario recurrir a 4 bits.
- GPU de datacenter: A100 40/80 GB, H100 y L40S son suficientes por amplio margen, y permiten además ejecutar varias réplicas del modelo por GPU.
- Opciones de despliegue: vLLM, SGLang, TGI y HuggingFace Transformers para los safetensors. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, que no está publicada.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos alternativos dentro de la información proporcionada. La comparación se limita, por tanto, a los campos que pueden contrastarse y al encuadre de categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/appworld-4b-...-agent-rl-epoch1 | 4,54 B | No disponible | No disponible | HuggingFace, safetensors, 8 descargas |
| Modelos Qwen de ~4 B de la misma familia | No verificado en esta búsqueda | No disponible | No disponible | Requiere consultar la ficha oficial de la familia Qwen 3.5 |
| Otros modelos de agente de ~3-8 B | No disponible | No disponible | No disponible | No disponible |

El único eje de comparación fiable con los datos disponibles es el tamaño: 4,54 B sitúa al modelo en la franja de "small language model" apta para una única GPU de consumo, por debajo de los modelos de 7-9 B y muy lejos de los 27 B que aparecen mencionados en el identificador del repositorio. No hay ningún benchmark publicado que permita afirmar si rinde mejor o peor que alternativas de tamaño similar.

## Limitaciones y advertencias

- Ausencia total de ficha técnica: no se declaran licencia, idiomas, contexto, datos de entrenamiento ni uso previsto, lo que impide evaluar la idoneidad legal y técnica para producción.
- Licencia no disponible: sin licencia explícita no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue empresarial.
- Riesgo elevado de alucinación en tool calling: en modelos pequeños entrenados con RL sobre entornos concretos es frecuente que generalicen mal a APIs fuera de la distribución de entrenamiento, generando llamadas con argumentos inventados.
- Sobreajuste al entorno de entrenamiento: el nombre sugiere entrenamiento sobre AppWorld; el comportamiento puede degradarse notablemente en otros dominios o formatos de herramienta no vistos durante el RL.
- Idiomas desconocidos: no puede garantizarse un rendimiento aceptable en castellano ni en ningún otro idioma distinto del usado en el entrenamiento.
- Contexto desconocido: sin longitud de contexto declarada no es posible planificar conversaciones largas ni tareas con historial extenso.
- Posible inestabilidad por provenir de un checkpoint intermedio: las marcas "iter3-epoch2" y "epoch1" indican un punto de control dentro de un proceso de entrenamiento, no necesariamente la versión final ni la mejor validada.
- Adopción prácticamente nula: 8 descargas y 0 "likes" implican ausencia de validación comunitaria, de informes de errores y de recetas de despliegue probadas.
- Fecha de creación atípica (26 de septiembre de 2026) y actualización tres minutos después de la creación: el repositorio parece un artefacto de un pipeline automatizado más que una release cuidada.
- Sesgos: no evaluados ni documentados; no puede descartarse la reproducción de sesgos presentes en los datos de entrenamiento del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/appworld-4b-includeact-300-27b-z-iter3-epoch2-agent-rl-epoch1
- Perfil del autor en HuggingFace: https://huggingface.co/Stage-org
- Paper, blog, repositorio o demo del modelo: no disponible
- Resultados de la búsqueda web: los enlaces devueltos corresponden a portales de ofertas de prácticas (stage.fr, jobs-stages.letudiant.fr, 1jeune1solution.gouv.fr, welcometothejungle.com) y no guardan relación con el modelo; se descartan por no ser fuentes relevantes.
