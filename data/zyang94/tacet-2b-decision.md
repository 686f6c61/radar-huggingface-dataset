# zyang94/tacet-2b-decision

## Resumen

tacet-2b-decision es un modelo de decisión de tipo "System One" de aproximadamente 1,88 mil millones de parámetros, publicado por el usuario zyang94 (Zhengxing Yang, autor de correspondencia) y construido sobre Qwen/Qwen3.5-2B. Su particularidad es que no genera texto: recibe un estado (un ticket, un correo, una factura, documentos recuperados o una posición de juego) junto con un conjunto de preguntas tipadas (choice, noul y score) y devuelve, en un único pase hacia delante, una distribución de probabilidad sobre los candidatos definidos en la propia petición. La lectura se realiza aplicando un softmax sobre los logits de los 26 tokens de letra (A-Z) en la primera posición generada, restringido a los K candidatos de cada pregunta.

El modelo resuelve el problema del enrutamiento, la clasificación y el scoring con salidas calibradas y verificables, evitando el coste de parseo y el riesgo de alucinación asociados a los modelos generativos. Al definirse el espacio de respuestas en tiempo de petición (conjunto de candidatos, valor de K y criterios), cambiar el esquema no requiere reentrenamiento. Está entrenado íntegramente con datos generados de forma programática con verdad de referencia verificable, sin anotación humana ni salidas de modelos maestros.

Su relevancia actual radica en que ofrece una alternativa de bajas latencia (aproximadamente 150 ms por pase en una GPU de consumo con 10 candidatos) y bajo coste para capas de decisión en pipelines de agentes, RAG y guardrails, con licencia Apache-2.0 y pesos en safetensors y GGUF. La contrapartida es un alcance deliberadamente estrecho: ventana de contexto de 6144 tokens, solo inglés, tope de 26 opciones por pregunta y ausencia de razonamiento en cadena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen/Qwen3.5-2B con lectura no autoregresiva (softmax sobre logits de los tokens A-Z); ajuste mediante LoRA |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 6144 tokens, segun la model card |
| Tipos de cuantizacion | GGUF; se documenta explicitamente Q4_K_M. Otras cuantizaciones: no disponibles |
| Idiomas soportados | Ingles (la capacidad multilingue del modelo base no esta alineada en esta version) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Modelo base | Qwen/Qwen3.5-2B |
| Tarea declarada (pipeline) | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 5,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura parte del modelo base Qwen/Qwen3.5-2B y se adapta mediante LoRA para una tarea de decisión no autoregresiva. No se trata de decodificación de texto libre: el modelo responde a preguntas tipadas (choice, noul, score) colocando cada candidato en una ranura de letra de la A a la Z, y la salida se obtiene tomando los logits de esos 26 tokens en la primera posición y aplicando un softmax restringido a los K candidatos de la pregunta correspondiente. Todas las preguntas de una petición se resuelven en un único pase hacia delante. El autor describe el proceso completo de entrenamiento (preentrenamiento LoRA, promediado de pesos y verificacion de cuantizacion) ejecutado en 2 tarjetas NVIDIA GeForce RTX 2080 Ti de 22 GB. La model card no detalla el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

Los datos de entrenamiento son 100 % generados de forma programática y con verdad de referencia verificable: cero anotacion humana y cero salidas de modelos maestros LLM. Los dominios cubiertos incluyen juegos (verdad de referencia BFS en laberinto y snake), recuperacion (puntuaciones de profesor sobre datos publicos con licencia Apache-2.0), interfaces sinteticas (verdad de referencia de comportamiento determinista), juez/enrutamiento (histograma de numero de opciones replicado) y texto largo (politicas y tickets extensos). La calibracion se apoya en temperatura y la model card reporta un ECE de 0,14 (10 bins) antes de calibrar sobre el conjunto de evaluacion publico de 231 preguntas. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Clasificacion de eleccion multiple con distribucion de probabilidad por candidato (preguntas de tipo choice), con soporte de hasta 26 candidatos por pregunta.
- Scoring y ranking de elementos (preguntas de tipo score), util para reranking de documentos recuperados.
- Preguntas de tipo noul, orientadas a determinar si ningun candidato satisface el criterio.
- Respuesta a multiples preguntas en un solo pase hacia delante, con salida por pregunta.
- Definicion del espacio de respuestas en tiempo de peticion: candidatos, valor de K y criterios se especifican en la solicitud, sin reentrenamiento.
- Probabilidades calibradas por candidato mediante calibracion de temperatura, lo que permite usar umbrales de decision.
- Mecanismo de abstencion basado en candidato centinela; la model card indica que esta version no incluye la ranura de abstencion y que la funcionalidad llega en versiones posteriores de la familia.
- Procesamiento de estados de hasta 6144 tokens (politicas largas, tickets, documentos de recuperacion).
- No genera texto: no soporta generacion libre, tool calling, function calling ni razonamiento de multiples pasos.
- No se documentan capacidades de vision, audio ni modo thinking.
- Idiomas: ingles unicamente en esta version.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket como estado, se define una pregunta choice con los departamentos como candidatos y criterios por departamento; el modelo devuelve la probabilidad de cada uno y la capa de aplicacion aplica un umbral de confianza.
- Triage de bandejas de correo o buzon compartido: clasificacion de correos entrantes en categorias operativas con criterios explicitos, aprovechando que el esquema de categorias vive en la peticion y puede cambiarse sin reentrenar.
- Reranking en pipelines RAG: uso de preguntas tipo score sobre los documentos recuperados por un buscador vectorial, para reordenar candidatos antes de pasarlos a un modelo generativo y reducir el contexto enviado al LLM.
- Guardrails y moderacion: definicion de opciones como permitido / bloqueado / escalar a revision humana, con umbral de abstención cuando ningun candidato encaja; al no generar texto, no hay superficie de alucinacion parseable.
- Clasificacion de facturas y documentos administrativos largos: el limite de 6144 tokens permite procesar politicas y contratos extensos; la salida como distribucion facilita auditar por que se tomo cada decision.
- Juez automatico en evaluacion de modelos: el modelo se entreno en el dominio judge/routing, por lo que puede puntuar o comparar respuestas candidatas frente a criterios definidos en la peticion.
- Politica de un paso en agentes y entornos de juego: al estar entrenado con verdad de referencia BFS en dominios de laberinto y snake, puede actuar como selector de accion de un solo paso cuando las opciones se enumeran como candidatos.
- Decisiones de alta frecuencia en lote: con aproximadamente 150 ms por pase en GPU de consumo para 10 candidatos, es viable clasificar volumenes altos de elementos sin recurrir a modelos generativos.
- Enrutamiento de llamadas a herramientas en un orquestador: decidir, entre un conjunto finito de herramientas predefinidas, cual corresponde a la consulta del usuario, dejando la ejecucion al sistema externo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de evaluacion publico de decisiones tipadas de 231 preguntas, independiente de la distribucion de entrenamiento:

| Metrica | Valor |
|---|---|
| Precision top-1 (argmax) | 0,7273 |
| ECE (10 bins, antes de calibracion) | 0,14 |
| Desglose por tipo de pregunta (choice / noul / score) | No disponible (la model card deja los valores sin cumplimentar) |
| Curvas de recall de "sin respuesta correcta" y de falsa alarma sobre conjunto de 261 preguntas | Reportadas como curvas bajo barrido de umbral, sin valores numericos publicados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No se dispone de comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB en precision de 16 bits (bf16/fp16) solo para los pesos de 1,88 mil millones de parametros, mas overhead de contexto y activaciones; en cuantizacion Q4_K_M puede situarse en el entorno de 1,2-1,5 GB. Los valores exactos no estan publicados.
- GPU validadas por el autor: 2x NVIDIA GeForce RTX 2080 Ti de 22 GB se usaron para todo el pipeline de entrenamiento (LoRA, promediado de pesos y verificacion de cuantizacion); la inferencia se midio en esas mismas tarjetas.
- Cabe en GPU de consumo: si. El autor reporta latencia del orden de 150 ms por tarjeta para 10 candidatos en una RTX 2080 Ti.
- GPU de centro de datos: no se documentan pruebas en A100, H100 u otras; no disponible.
- Opciones de despliegue: llama.cpp / llama-server esta documentado de forma explicita con el fichero GGUF Q4_K_M; tambien es compatible con la libreria transformers. No se documenta soporte de vLLM, TGI u Ollama en la informacion disponible.
- Ejemplo de arranque documentado: `llama-server -m tacet-2b-decision-Q4_K_M.gguf -c 65536 -ngl 99 --host 0.0.0.0 --port 8080`. Conviene tener en cuenta que el valor `-c 65536` del ejemplo es configuracion del servidor y excede la ventana de contexto declarada del modelo (6144 tokens).
- Throughput: no disponible. Solo se publica la latencia aproximada por pase hacia delante.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables con la misma interfaz de decision tipada (choice / noul / score con lectura por softmax sobre ranuras de letra), por lo que la comparacion numerica no esta disponible. A continuacion se recoge la informacion disponible sobre este modelo y las categorias alternativas, sin valores que no hayan sido publicados:

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos comparativos |
|---|---|---|---|---|---|
| tacet-2b-decision | 1,88 B | 6144 tokens | Apache-2.0 | Decision no autoregresiva con salida en distribucion | top-1 0,7273 y ECE 0,14 en 231 preguntas |
| Clasificadores encoder de ~1-2 B (por ejemplo, familia DeBERTa/ModernBERT) | No disponible | No disponible | No disponible | Clasificacion discriminativa clasica | No disponible |
| LLM generativos de ~2 B usados como enrutadores con salida JSON | No disponible | No disponible | No disponible | Generacion de texto con parseo posterior | No disponible |
| Modelo base Qwen/Qwen3.5-2B | No disponible | No disponible | No disponible | Generacion autoregresiva | No disponible |

## Limitaciones y advertencias

- Forma de la tarea: un solo pase hacia delante y sin cadena de razonamiento. El propio autor advierte de limitaciones en preguntas que exigen computo serial de varios pasos (razonamiento sobre politicas largas, multi-hop, aritmetica de fechas). Es una restriccion de forma, no de entrenamiento insuficiente.
- Tope de 26 opciones por pregunta de tipo choice (mas un centinela de abstencion). Para espacios de opciones mayores hay que usar descomposicion en dos niveles o factorizada.
- Ventana de contexto de 6144 tokens: los estados mas largos se truncan, con la consiguiente perdida de informacion.
- Idioma: solo ingles. La capacidad multilingue del modelo base no esta alineada en esta version, por lo que no debe asumirse un comportamiento fiable en castellano u otros idiomas.
- Calibracion: la forma de la distribucion de lectura de letras es la salida propia del modelo. El autor recomienda volver a medir el ECE sobre datos propios antes de usar la salida para decisiones por umbral.
- Abstencion: la ranura de abstencion no esta incluida en esta version; el mecanismo de candidato centinela se describe para versiones posteriores de la familia.
- Riesgo de alucinacion: bajo por diseno, ya que el modelo no genera texto y solo emite una distribucion sobre candidatos predefinidos. El riesgo se traslada al diseno del esquema de candidatos y criterios, que puede inducir decisiones erroneas si esta mal formulado.
- Sesgos: no hay informacion sobre analisis de sesgos. El entrenamiento con datos 100 % sinteticos y generados de forma programatica puede no reproducir la distribucion real de produccion, y no se documenta ninguna validacion sobre datos humanos reales.
- Validacion externa: el repositorio registra 0 descargas y 0 likes, y no se han encontrado referencias independientes en la busqueda web. Los resultados reportados proceden exclusivamente del autor y no han sido replicados por terceros.
- Autoria mixta humano-IA: la model card indica que GLM-5.3-flash (Zhipu AI) figura como co-primer autor responsable de la iteracion de la receta de entrenamiento, el diagnostico de experimentos y la implementacion de ingenieria. Conviene verificar de forma independiente los detalles tecnicos declarados antes de usarlos en produccion.
- Licencia: Apache-2.0, lo que permite uso comercial. Debe verificarse el cumplimiento de las condiciones del modelo base Qwen/Qwen3.5-2B, cuya licencia no se detalla en la informacion proporcionada.
- Discrepancia documental: el ejemplo de despliegue en llama.cpp configura `-c 65536`, muy por encima de la ventana de 6144 tokens declarada en las limitaciones. Tratar como referencia la ventana del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zyang94/tacet-2b-decision
- Modelo base: Qwen/Qwen3.5-2B (referenciado en los metadatos del repositorio; no se proporciona URL propia en la informacion disponible)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo. Los resultados de la busqueda no contienen informacion relevante sobre tacet-2b-decision.
