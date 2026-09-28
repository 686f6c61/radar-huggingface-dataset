# Troiaaa/beverage-ensemble-20260927

## Resumen

Beverage ensemble 20260927 es un modelo de detección de objetos publicado en Hugging Face por el usuario Troiaaa para la subnet 44 (SN44) de Bittensor. Es un ensemble derivado de dos detectores de bebidas: Alice36/bev_927 (revisión 3d60bf2c) y Realfencer/bev927-5 (revisión cf012e2f), cuyos mapeos de clases y decodificación nativos se conservan. Se distribuye en formato ONNX y resuelve una única tarea: localizar y clasificar bebidas en imágenes.

Su relevancia es acotada y competitiva. El autor lo presenta de forma explícita como candidato de prueba en vivo dentro de SN44, no como modelo ganador: sobre 36 referencias utilizables posteriores estimó una métrica de 0,473778 frente a 0,473519 del modelo Alice y 0,450877 del entonces líder, sin que se estableciera superioridad sobre Alice. Técnicamente no es un modelo de lenguaje: no tiene parámetros publicados, ni contexto, ni capacidades de texto.

La innovación principal está en la inferencia: backbone y neck convolucionales cuantizados a INT8 por canal con activaciones UINT8, cabezas de detección en FP32 y una regla de fusión de cajas entre ambos detectores. El repositorio declara un tamaño de 0,0 GB y cero descargas, por lo que conviene verificar la disponibilidad real de los pesos antes de reutilizarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector de objetos convolucional en ensemble: backbone/neck convolucionales más cabezas de detección, fusionados a nivel de cajas |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantización | INT8 por canal calibrado (pesos de backbone/neck), UINT8 (activaciones), FP32 (cabezas de detección) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |
| Tarea (pipeline) | object-detection |
| Clases detectadas | bebidas (etiqueta "beverage") |
| Motor de inferencia | no especificado (formato ONNX, ejecución en CPU) |
| Autor | Troiaaa |
| Fecha de publicación | 2026-09-27 |

## Arquitectura y entrenamiento

El modelo es un ensemble de dos detectores convolucionales preexistentes. Cada detector conserva su decodificación y su mapeo de clases originales. Las convoluciones de backbone y neck usan pesos INT8 calibrados por canal con activaciones UINT8, mientras que las cabezas de detección se mantienen en FP32. La calibración se realizó sobre 192 imágenes públicas cuyo hash queda fijado en `reproduction.json`. Un hilo de CPU por detector se ejecuta de forma concurrente, con preprocesado compartido y un bloqueo de petición.

La fusión posterior es explícita: las cajas de la misma clase con IoU >= 0,5 se promedian por igual; la confianza combina la del detector primario más 0,1 veces la del secundario, con tope en 0,999. Las cajas primarias sin correspondencia se conservan; las secundarias sin correspondencia requieren confianza >= 0,65 y reciben un multiplicador de 0,8. La supresión final usa IoU 0,45 intra-clase e IoU 0,9 entre clases. El autor indica que esta regla se seleccionó sobre escenas históricas de entrenamiento. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO, porque no aplica ni se proporciona.

## Capacidades

- Detección de objetos de una única categoría: bebidas, sobre imágenes estáticas.
- Ensemble de dos detectores con fusión de cajas por IoU y combinación ponderada de confianzas.
- Inferencia cuantizada INT8/UINT8 sobre CPU, con un hilo por detector en paralelo.
- Salida estructurada mediante `model_dump()`, apta para consumo programático.
- Reproducibilidad verificable: `reproduction.json` fija revisiones de los padres, hashes de las 192 imágenes de calibración y versiones de build y runtime.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No dispone de modo "thinking", visión multimodal general, audio ni generación de código.

## Casos de uso

- Control de inventario en retail: el modelo detecta bebidas en fotografías de estanterías y permite contar referencias por exposición; su naturaleza de detector de una sola clase encaja con conteos rápidos sin necesidad de clasificación fina.
- Auditoría de planogramas: comparando las cajas detectadas con el layout esperado se puede verificar el cumplimiento de la colocación acordada con el fabricante.
- Verificación de pedidos en hostelería y food delivery: a partir de una foto del pedido, el detector confirma la presencia y el número de bebidas antes del envío.
- Cajas de autoservicio: identificación automática de bebidas en el área de escaneo para reducir el fraude por sustitución de etiquetas, con la salida estructurada integrándose en el TPV.
- Auditoría de neveras y máquinas expendedoras: detección de huecos y de producto agotado en revisiones periódicas de reposición.
- Robótica de picking en almacén: localización de bebidas para el guiado de pinzas o de succión, gracias a la ejecución en CPU que evita depender de una GPU dedicada en el brazo.
- Pre-etiquetado de datasets: generación de cajas candidatas para anotación humana posterior, aprovechando la fusión de dos detectores para reducir falsos positivos evidentes.
- Analítica de eventos y puntos de venta: estimación de consumo y de surtido a partir de imágenes de barras o mostradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo es un detector de objetos y esas métricas no aplican. El autor sí reporta una comparación interna con métrica agregada no especificada, calculada sobre 36 referencias posteriores:

| Modelo | Métrica estimada | Notas |
|---|---|---|
| beverage-ensemble-20260927 | 0,473778 | Ensemble derivado; candidato de prueba en vivo |
| Alice36/bev_927 | 0,473519 | Modelo padre 1; diferencia de 0,000259, superioridad no establecida |
| Realfencer/bev927-5 | no disponible | Modelo padre 2; sin métrica reportada |
| Modelo líder de SN44 en ese momento ("then king") | 0,450877 | Referencia comparativa del autor |

El propio autor advierte que las puntuaciones históricas proceden de reconstrucciones finitas de métricas agregadas públicas, no de anotaciones autenticadas de producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el autor no publica cifras y la ejecución declarada es en CPU).
- GPU recomendadas: no disponibles. La plataforma de despliegue exige asignación de GPU, pero el autor indica que la ejecución del modelo usa CPU para mantener consistencia con la auditoría del validador.
- Encaje en GPU de consumo: no disponible; el diseño está orientado a CPU.
- Modelo de ejecución: dos detectores ONNX en paralelo, con un hilo de CPU por detector, preprocesado compartido y bloqueo de petición.
- Opciones de despliegue: plantilla estándar de SN44 Chutes, sin cambios en la inferencia, con configuración TEE `pro_6000`, limitada a una instancia y con apagado tras 300 segundos de inactividad. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El único dato operativo publicado es el conjunto de calibración de 192 imágenes públicas.
- Requisitos de disco: no disponibles; el repositorio declara 0,0 GB, por lo que los pesos podrían no estar alojados en él.

## Comparativa con modelos similares

| Modelo | Relación | Métrica estimada | Licencia | Disponibilidad |
|---|---|---|---|---|
| beverage-ensemble-20260927 | Ensemble derivado de los dos siguientes | 0,473778 | AGPL-3.0 | Hugging Face; repositorio de 0,0 GB, 0 descargas |
| Alice36/bev_927 | Modelo padre 1, revisión 3d60bf2c | 0,473519 | no disponible | Revisión fijada en Hugging Face |
| Realfencer/bev927-5 | Modelo padre 2, revisión cf012e2f | no disponible | no disponible | Revisión fijada en Hugging Face |
| Modelo líder de SN44 en el momento de la publicación | Referencia de la competición | 0,450877 | no disponible | no disponible |

No se conocen alternativas de propósito general comparables dentro de la información disponible; la comparación relevante es la de sus propios modelos padre.

## Limitaciones y advertencias

- Superioridad no demostrada: la diferencia frente a Alice36/bev_927 es de 0,000259, y el autor afirma explícitamente que no se estableció.
- Base de evaluación débil: las puntuaciones provienen de reconstrucciones finitas de métricas agregadas públicas, no de anotaciones autenticadas de producción.
- Artefacto potencialmente vacío: el repositorio declara 0,0 GB, pese a que la model card afirma que los pesos se proporcionan bajo AGPL-3.0. Verificar la presencia real de los ficheros ONNX antes de integrarlo.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta.
- Dominio muy restringido: una sola clase ("beverage") y umbrales de fusión elegidos sobre escenas históricas de entrenamiento, con riesgo de sobreajuste a ese dominio.
- Cuantización agresiva: backbone y neck en INT8 por canal con activaciones UINT8 pueden degradar la precisión fuera de la distribución de las 192 imágenes de calibración.
- Trazabilidad parcial: no se documentan composición del dataset de entrenamiento, sesgos conocidos ni cobertura de idiomas (no aplica, pero tampoco se detalla la población de imágenes).
- Licencia AGPL-3.0: copyleft fuerte con obligaciones de liberación del código derivado, incluidas las interacciones por red. Revisar compatibilidad antes de integrarlo en un producto propietario.
- Herencia de licencias: al ser un derivado, el uso está sujeto también a las condiciones de Alice36/bev_927 y Realfencer/bev927-5, cuyas licencias no se indican en la información disponible.
- Arranque en frío: el despliegue en Chutes se apaga tras 300 segundos de inactividad, lo que implica latencia adicional en la primera petición tras un periodo ocioso.
- Alcance declarado: es un candidato de prueba en vivo, no una versión estable ni un ganador de competición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Troiaaa/beverage-ensemble-20260927
- Perfil del autor: https://huggingface.co/Troiaaa
- Modelo padre 1: Alice36/bev_927 (revisión 3d60bf2cde49f8f72a9b5b7a11844bbec0d60709)
- Modelo padre 2: Realfencer/bev927-5 (revisión cf012e2f1a05e01da682ab5223b87aaebe7ddddb)
- Ficheros de reproducción citados en la model card: `miner.py` y `reproduction.json` (incluidos en el repositorio del modelo)
- No se han encontrado otros enlaces relevantes al modelo en los resultados de búsqueda web disponibles.
