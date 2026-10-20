# typestrict/TS-Ettin-17M

## Resumen

TS-Ettin-17M es un modelo encoder de 16.869.762 parámetros publicado por typestrict (typestrict.ai) y construido mediante ajuste fino sobre el reranker `cross-encoder/ettin-reranker-17m-v1`. No es un modelo generativo: se distribuye con pipeline `text-classification` y está diseñado para emitir "decisiones tipadas" (`choice`, `noul` y `score`), cada una acompañada de la probabilidad de cada opción y de un valor de confianza. La arquitectura declarada en las etiquetas del repositorio es ModernBERT, con una ventana de contexto de 8.192 tokens y cobertura únicamente en inglés.

Su relevancia práctica está en el extremo opuesto a los LLM generalistas: con 17M de parámetros y un repositorio de 0,1 GB, incluye pesos safetensors y ficheros ONNX pensados para ejecutarse en CPU, lo que permite tomar decisiones de clasificación y enrutado dentro de un pipeline sin depender de GPU. Forma parte de una familia con la misma receta de entrenamiento y los mismos datos (TS-Ettin-32M, 68M, 150M, TS-Ettin-150M y TS-moBERTo-150M), de modo que cambiar de tamaño no implica cambiar de formato de salida ni de integración.

Es el escalón más pequeño de esa familia, pensado para escenarios donde "cada milisegundo y cada megabyte cuentan", según la propia model card. Dos advertencias marcan su estado actual: la confianza del modelo todavía no está calibrada (los ajustes de identidad en `config.json`) y el entrenamiento sobre esta base aún no está abierto en la plataforma del autor, que de momento recomienda TS-moBERTo-150M como opción por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, segun etiquetas del repositorio) |
| Parametros totales | 16.869.762 (dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible. Se distribuyen pesos safetensors y ficheros ONNX para CPU; no se documentan variantes GGUF ni cuantizaciones oficiales |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |
| Pipeline | text-classification |
| Modelo base | cross-encoder/ettin-reranker-17m-v1 |
| Tamano del repositorio | 0,1 GB |
| Salidas | Decisiones tipadas: `choice`, `noul`, `score`, con probabilidad por opcion y confianza |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible`, CPU |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-19 |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 17M de parámetros, derivado del reranker `cross-encoder/ettin-reranker-17m-v1` mediante la "receta typestrict": un mismo procedimiento de ajuste aplicado sobre distintas bases de la familia Ettin y moBERTo, con el objetivo de que todas ellas compartan interfaz de salida. La tarea no es generar texto, sino producir una decisión estructurada sobre una entrada: elegir una opción entre muchas (`choice`), resolver un enunciado booleano (`noul`) o puntuar un valor sobre una rúbrica ordenada (`score`), devolviendo en todos los casos la distribución de probabilidad sobre las opciones y una confianza agregada.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; sí afirma que el entrenamiento usa únicamente datos cuya licencia lo permite, con un listado que aparece referenciado pero que no está completo en la información disponible. Tampoco se documentan innovaciones de decodificación (no aplican, al no ser generativo) ni mecanismos de atención lineal más allá de los propios de la arquitectura ModernBERT.

Un detalle técnico relevante para producción: los ajustes de calibración de confianza están en valores de identidad en `config.json`, es decir, la probabilidad emitida no está mapeada a frecuencias empíricas. El autor recomienda explícitamente usar las probabilidades y medir antes de fijar un umbral de automatización sobre el campo `confidence`.

## Capacidades

- Clasificación y decisión tipada en tres modalidades: `choice` (una opción entre varias), `noul` (verdadero/falso sobre un enunciado) y `score` (valor en una rúbrica ordenada).
- Salida probabilística completa por opción, más un campo de confianza agregado, apta para umbrales y abstención.
- Extracción de características y clasificación de texto en inglés, con etiqueta `feature-extraction` en el repositorio.
- Manejo de entradas largas: hasta 8.192 tokens, adecuado para documentos completos o conversaciones multi-turno en la misma petición.
- Inferencia en CPU gracias a los ficheros ONNX incluidos, sin requisito de GPU.
- Compatibilidad con `text-embeddings-inference` y con endpoints estándar de Hugging Face.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking": es un encoder de clasificación.
- Multilingüismo: no. Solo inglés.

## Casos de uso

- Enrutado de peticiones en un backend: dado un mensaje de usuario, usar `choice` para decidir a qué cola, endpoint o equipo va. Los 17M de parámetros permiten ejecutarlo en la misma máquina que atiende la API sin GPU dedicada.
- Moderación y filtrado por reglas: emplear `noul` para resolver enunciados del tipo "¿esta reseña contiene una reclamación de reembolso?" o "¿este texto menciona un competidor?", devolviendo probabilidad y confianza para fijar el umbral de revisión humana.
- Verificación de abstención en pipelines RAG: usar `noul` sobre pares pregunta/respuesta para comprobar si la respuesta está respaldada por el contexto recuperado, aprovechando los 8.192 tokens para incluir varios fragmentos en una sola pasada.
- Puntuación de calidad o relevancia: aplicar `score` a una rúbrica ordenada (por ejemplo, calidad de un ticket, urgencia de un lead o relevancia de un resultado de búsqueda) y ordenar por la salida del modelo.
- Clasificación de documentos largos en lote: contratos, correos o informes que caben en la ventana de 8K tokens y se procesan por CPU en un job batch, con coste marginal mínimo frente a un LLM.
- Preetiquetado para anotación humana: generar decisiones con probabilidad asociada y dirigir a revisión manual únicamente los casos por debajo de un umbral de confianza, reduciendo el volumen de anotación.
- Guardarraíl ligero en agentes: colocar el modelo delante de un LLM mayor para clasificar intención o validar afirmaciones, con latencia de milisegundos y sin consumir cuota del modelo grande.
- Extracción de señales en analítica de producto: etiquetar eventos de texto (feedback, encuestas, formularios) a escala con un modelo Apache-2.0 autoalojado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una figura titulada "Decision Index 0.3" que compara los modelos de la familia TS, pero los valores numéricos no aparecen en el contenido accesible; tampoco se reportan MMLU, HumanEval, GSM8K ni métricas de clasificación estándar (exactitud, F1, AUC) para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable. Con 16,87M de parámetros, los pesos ocupan aproximadamente 34 MB en FP16, 67 MB en FP32 y unos 17 MB en INT8 (cálculo derivado del número de parámetros; no publicado por el autor).
- GPU recomendadas: ninguna obligatoria. El modelo está pensado para CPU y los ficheros ONNX apuntan a ese escenario. Cualquier GPU consumer sirve (GTX 1650, RTX 3060, RTX 4090), pero no aporta una ventaja decisiva frente a CPU para un modelo de este tamaño.
- Cabe en cualquier GPU consumer y en entornos sin GPU: contenedores pequeños, funciones serverless, dispositivos de borde o la propia máquina de desarrollo.
- Opciones de despliegue: `transformers` con safetensors, runtime ONNX para CPU, `text-embeddings-inference` (declarado en las etiquetas), endpoints compatibles de Hugging Face, o exportación e integración manual en el backend propio.
- Latencia y throughput estimados: no disponibles. La model card solo indica que está orientado a escenarios donde "cada milisegundo y cada megabyte cuentan", sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| TS-Ettin-17M | 17M | Ingles | 8.192 tokens | Apache 2.0 | Publicado; entrenamiento en plataforma "proximamente" |
| TS-Ettin-32M | 32M | Ingles | No disponible | Apache 2.0 (misma familia) | "Coming soon" en typestrict.ai |
| TS-Ettin-68M | 68M | Ingles | No disponible | Apache 2.0 (misma familia) | "Coming soon" en typestrict.ai |
| TS-Ettin-150M | 150M | Ingles | No disponible | Apache 2.0 (misma familia) | "Coming soon" en typestrict.ai |
| TS-moBERTo-150M | 150M | Ingles y portugues | No disponible | Apache 2.0 (misma familia) | Disponible; opcion recomendada por el autor |
| cross-encoder/ettin-reranker-17m-v1 | 17M (base) | Ingles | No disponible en la informacion | No disponible en la informacion | Modelo base del ajuste |

Todas las variantes comparten la misma receta de entrenamiento y el mismo formato de decisión tipada, por lo que la elección entre ellas es fundamentalmente un compromiso entre tamaño, latencia e idioma. No se dispone de datos de rendimiento comparado entre ellas en la información proporcionada, más allá de la figura "Decision Index 0.3" sin valores numéricos.

## Limitaciones y advertencias

- Confianza sin calibrar: `config.json` mantiene ajustes de identidad, según advierte el propio autor. Las probabilidades no deben interpretarse como frecuencias fiables sin un proceso de calibración y medición previa sobre datos propios.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas, lo que descarta su uso directo en productos en español sin un modelo alternativo o un ajuste adicional.
- Riesgo de alucinación acotado pero real: al ser un clasificador, no genera texto libre, pero puede asignar alta probabilidad a una etiqueta incorrecta en entradas ambiguas, dominios alejados del entrenamiento o texto adversario.
- Ausencia de datos de evaluación pública: no hay benchmarks ni métricas de referencia en la información disponible, por lo que cualquier decisión de adopción exige una evaluación propia sobre un conjunto reservado.
- Sesgos: no documentados. Al entrenarse sobre datos de los que solo se indica que su licencia lo permite, sin publicar composición ni proceso de mitigación, no es posible evaluar sesgos de dominio, género o culturales a priori.
- Estado del ciclo de vida: creado en octubre de 2026, con 0 descargas y 0 likes, y con el entrenamiento sobre esta base aún no abierto en typestrict.ai. El autor recomienda TS-moBERTo-150M como opción por defecto, lo que sitúa a este modelo como una base para ajuste más que como un producto final.
- Dependencia de la plataforma del autor: la propuesta de valor incluye entrenar modelos propios en typestrict.ai y medirlos contra "Jev" sobre ejemplos reservados; ese flujo es externo al repositorio de Hugging Face y está sujeto a la disponibilidad del servicio.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar el fichero LICENSE del repositorio y las condiciones del modelo base `cross-encoder/ettin-reranker-17m-v1`, cuya licencia no está disponible en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typestrict/TS-Ettin-17M
- Organización typestrict en Hugging Face: https://huggingface.co/typestrict
- Sitio del autor: https://typestrict.ai
- Documentación de modelos base: https://docs.typestrict.ai/base-models
- Documentación de agentes y MCP: https://docs.typestrict.ai/agents
- CLI en GitHub: https://github.com/typestrict-lab/cli
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-17m-v1
- Miembro recomendado de la familia: https://huggingface.co/typestrict/TS-moBERTo-150M
- TS-Ettin-150M: https://huggingface.co/typestrict/TS-Ettin-150M
- TS-Ettin-68M: https://huggingface.co/typestrict/TS-Ettin-68M
- TS-Ettin-32M: https://huggingface.co/typestrict/TS-Ettin-32M
