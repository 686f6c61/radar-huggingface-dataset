# thefinalboss/palimpseste-max

## Resumen

Palimpseste-max es un sistema de memoria asociativa hipervectorial (VSA) desarrollado por el autor independiente thefinalboss, que se presenta como una alternativa radical a los modelos de lenguaje basados en transformadores. En lugar de pesos entrenados por gradiente, utiliza un log de trazas `(address, value, weight)` en un espacio bipolar `H = {+1,-1}^D` con D=20 000, siguiendo los principios de Kanerva y Plate. El modelo no tiene matriz de pesos, no requiere GPU ni torch, y toda la inferencia se realiza mediante operaciones bit a bit (XOR, popcount, suma umbralizada) sobre CPU.

El sistema resuelve el problema de la memoria de trabajo y el aprendizaje incremental sin reentrenamiento: cada hecho se escribe en una única operación O(1) y se recupera mediante agrupación (bundling) sobre la bola de Hamming del vector de consulta, indexada con LSH. Con 2,2 millones de trazas almacenadas y un tiempo de entrenamiento de 51 minutos en CPU, el modelo alcanza una capacidad de direccionamiento teórica de ~10^1505 ubicaciones, aunque la capacidad de recuperación por vecindad es lineal en D (k* ≈ 0,02 D exacto). Su relevancia actual radica en demostrar que es posible construir sistemas de conocimiento con cero parámetros almacenados, ejecutables en hardware modesto, y con aprendizaje en vivo sin fine-tuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VSA (Vector Symbolic Architecture) / SDM (Sparse Distributed Memory) con LSH, sin transformer |
| Parametros totales | 0 (todos reconstruidos on-the-fly; log de 2,2M trazas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (jerarquico de 1M disponible) |
| Tipos de cuantizacion | No aplica (sin pesos) |
| Idiomas soportados | No disponible (ejemplos en ingles) |
| Licencia | MIT |
| Formato de pesos | Trazas `(address, value, weight)` en `H={+1,-1}^D`, 3 chunks de ~3,5 GB (10,4 GB total) |

## Arquitectura y entrenamiento

Palimpseste-max no es un transformer ni un modelo de mezcla de expertos. Se basa en hipervectores bipolares: las operaciones fundamentales son bind (XOR), bundle (mayoría) y similitud (distancia de Hamming). El conocimiento se almacena como un log append-only de trazas, donde cada traza asocia una dirección (hipervector) con un valor y un peso. La lectura se realiza mediante la función Φ(q), que agrupa todas las trazas dentro de la bola de Hamming de radio r alrededor de la consulta q, indexada con LSH (K=14, L=6) para acelerar la búsqueda.

El entrenamiento consistió en 88 800 pares de datos (curados, generados, TriviaQA y tablas matemáticas), totalizando 2 225 193 tokens, procesados en 3 082 segundos (51 minutos) en CPU a 722 tokens/s. No se utilizó RLHF ni DPO; el aprendizaje es una escritura directa de trazas. La arquitectura se organiza en 5 capas y 30 módulos Python, con 361 tests que pasan. La capacidad de direccionamiento C_addr sigue la ley `0.14 · D · 2^(D/4)`, alcanzando ~10^1505 ubicaciones a D=20 000, mientras que el límite de recuperación por bola es k* ≈ 0,02 D (exacto), 0,03 D (soft ≥0,99) y 0,067 D (teórico).

## Capacidades

- Generación de texto: responde a preguntas con frases completas, aunque con un vocabulario limitado (BPE de 3 000 tokens).
- Conocimiento factual: recupera hechos de TriviaQA y tablas curadas (ej. capitales, definiciones de conceptos).
- Matemáticas básicas: calcula multiplicaciones simples a partir de tablas almacenadas (ej. 50×50 = 2500).
- Escritura creativa: genera poemas y haikus mediante recuperación asociativa de patrones.
- Conversación: mantiene diálogos cortos con respuestas empáticas predefinidas.
- Aprendizaje en vivo: permite enseñar nuevos hechos con una sola escritura O(1) sin reentrenamiento, mediante el método `teach()`.
- Sin tool calling, sin visión, sin audio, sin razonamiento multi-paso.

## Casos de uso

- Aprendizaje incremental en memoria: el modelo puede incorporar nuevos hechos en tiempo real con `conv.teach("capital of mars", "olympus mons city")`, ideal para aplicaciones donde el conocimiento cambia frecuentemente y no se puede reentrenar.
- Chatbot ligero en CPU: con una latencia de 2-3 s por respuesta y sin GPU, puede desplegarse en servidores de bajo coste o dispositivos edge para conversaciones simples de atención al cliente.
- Demostración educativa de VSA: sirve como ejemplo práctico de memoria distribuida escasa (SDM) y álgebra hipervectorial, útil en cursos de sistemas cognitivos o computación neuromórfica.
- Prototipado de memoria asociativa: investigadores pueden experimentar con la capacidad de recuperación por vecindad y el ajuste de LSH (K, L) sin necesidad de infraestructura de deep learning.
- Sistemas embebidos sin aceleración: al requerir solo Python y numpy, puede ejecutarse en placas tipo Raspberry Pi para tareas de recuperación de conocimiento con contexto limitado.
- Recuperación de conocimiento con contexto corto: para dominios donde las consultas son breves (preguntas de opción múltiple, glosarios), el contexto de 256 tokens es suficiente y la exactitud de recuperación es alta (100% en bolas no saturadas).
- Investigación en alternativas a transformers: sirve como banco de pruebas para comparar arquitecturas sin pesos en tareas de memoria y generalización, aunque sin benchmarks estándar publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo presenta ejemplos cualitativos de respuestas correctas en identidad, conocimiento, matemáticas y escritura creativa, todos obtenidos con recuperación al 100% exacta en bolas de Hamming no saturadas. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- CPU únicamente: no requiere GPU, CUDA ni torch. Solo Python ≥3.10 y numpy.
- Disco: ~12 GB libres para descargar y fusionar los 3 chunks (10,4 GB).
- RAM: no especificada, pero estimable en ~12-16 GB para cargar las trazas y realizar la fusión.
- Inferencia: latencia de 2-3 s por respuesta con LSH K=14/L=6.
- Entrenamiento: 51 minutos en CPU (722 tok/s), sin aceleración.
- Despliegue: compatible con entornos Python estándar; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de pesos.
- Escalabilidad: la capacidad de recuperación es por vecindad, por lo que el rendimiento depende del radio de Hamming y la saturación de bolas, no del número total de trazas.

## Comparativa con modelos similares

No disponible. Palimpseste-max pertenece a una categoría atípica (VSA/SDM sin pesos) y no se han publicado comparativas con otros modelos de memoria asociativa o con LLMs tradicionales en la información proporcionada. No se pueden establecer comparaciones numéricas fiables sin datos de benchmarks.

## Limitaciones y advertencias

- Contexto limitado: la ventana de 256 tokens restringe la capacidad de manejar conversaciones largas o documentos extensos; el modo jerárquico de 1M no está documentado en detalle.
- Sin razonamiento complejo: no realiza inferencias multi-paso ni resuelve problemas que requieran lógica encadenada; solo recupera patrones almacenados.
- Vocabulario reducido: el tokenizer BPE de 3 000 tokens limita la expresividad y la cobertura de idiomas distintos del inglés.
- Riesgo de alucinación: aunque el autor afirma 100% de recuperación exacta en bolas no saturadas, la saturación de una bola (|N_r(q)| > k*) puede producir respuestas incorrectas sin aviso.
- Dependencia de LSH: el rendimiento depende críticamente de los parámetros K y L; un ajuste deficiente degrada la precisión de recuperación.
- Sin tool calling ni integración con APIs: no puede interactuar con herramientas externas, lo que limita su uso en agentes autónomos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de soporte ni mantenimiento.
- No es un LLM general: no debe usarse para tareas que requieran comprensión profunda del lenguaje, generación de código o razonamiento abstracto.

## Enlaces

- Modelo: [thefinalboss/palimpseste-max](https://huggingface.co/thefinalboss/palimpseste-max)
- Demo en vivo: [thefinalboss/palimpseste](https://huggingface.co/spaces/thefinalboss/palimpseste)
- White paper: [PALIMPSESTE_White_Paper.pdf](https://huggingface.co/thefinalboss/palimpseste-max/blob/main/whitepaper/PALIMPSESTE_White_Paper.pdf)
- Nota de capacidad: [notes/CAPACITY.md](https://huggingface.co/thefinalboss/palimpseste-max/blob/main/notes/CAPACITY.md)
