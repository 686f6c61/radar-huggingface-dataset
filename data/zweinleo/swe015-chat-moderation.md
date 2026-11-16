# zweinleo/swe015-chat-moderation

## Resumen

`zweinleo/swe015-chat-moderation` es un clasificador binario de texto en turco para moderación de lenguaje ofensivo en chats. Lo publica el usuario zweinleo como entrega del trabajo SWE015 (caso de uso 4: moderación de chat turco en tiempo real) de Arda Kocadoru, y se apoya en un ajuste fino de `dbmdz/bert-base-turkish-cased` sobre el corpus OffensEval-TR 2020. El modelo etiqueta cada mensaje como `NOT` (limpio) u `OFF` (ofensivo) y se distribuye en varios formatos: pesos PyTorch FP32, ONNX FP32 y ONNX con cuantización dinámica INT8, además de artefactos auxiliares (lexicón, tf-idf, word2vec) que sirven de líneas base.

La relevancia práctica está en el binomio rendimiento/latencia: la variante INT8 servida ocupa 106 MB y procesa una petición en unos 27,9 ms con un solo hilo de CPU, manteniendo un macro-F1 de 0,815 sobre el conjunto de test oficial de OffensEval-TR 2020 (3.528 tuits). Frente al BERTurk en FP32 (81,7 ms en PyTorch, 54,4 ms en ONNX), la cuantización reduce el coste computacional a la mitad sin pérdida medible de calidad, lo que permite desplegarlo en servidores sin GPU.

Es un modelo pequeño y especializado: no es un LLM generativo ni un sistema de moderación general, sino un componente de clasificación de una sola etiqueta, entrenado sobre tuits y no sobre chat de videojuegos, con las limitaciones que eso implica (los insultos velados suelen escapársele). La licencia del modelo es CC-BY-2.0 y la del modelo base, MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base, cased), ajustado para clasificación de secuencias |
| Parametros totales | no disponible (repo de 1,0 GB con todos los artefactos; los pesos BERTurk base rondan los 110 M, dato no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERTurk base usa típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | FP32 (PyTorch y ONNX) e INT8 dinámica (ONNX) |
| Idiomas soportados | turco (tr) |
| Licencia | CC-BY-2.0 (modelo base `dbmdz/bert-base-turkish-cased`: MIT) |
| Formato de pesos | safetensors, ONNX (`model_fp32.onnx`, `model_int8.onnx`), joblib (artefactos tf-idf/lexicón) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de `dbmdz/bert-base-turco-cased` para clasificación binaria de texto. La cabeza de clasificación produce dos etiquetas, `NOT` y `OFF`, y cada carpeta de artefacto incluye un `meta.json` con el umbral de decisión ajustado sobre el split de validación, lo que indica que la salida se calibra por umbral en lugar de usar directamente el argmax.

Los datos de entrenamiento provienen del corpus de Çağrı Çöltekin, *A Corpus of Turkish Offensive Language on Social Media* (LREC 2020), distribuido bajo CC-BY 2.0 y materializado en el dataset `offenseval-tr-2020`. La evaluación se realiza sobre el conjunto de test oficial de OffensEval-TR 2020, con 3.528 tuits. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset, uso de RLHF/DPO ni innovaciones arquitectónicas más allá del ajuste fino y la cuantización dinámica INT8 para inferencia en CPU. El repositorio incluye además líneas base propias (lexicón por distancia de edición, tf-idf con regresión logística, word2vec con red feedforward y con CNN 1D) que sirven de comparación interna.

## Capacidades

- Clasificación binaria de texto en turco: `NOT` (limpio) frente a `OFF` (ofensivo).
- Moderación en tiempo real: latencia de 27,9 ms por mensaje en la variante ONNX INT8 con un solo hilo de CPU.
- Inferencia en CPU sin GPU: el formato ONNX INT8 está pensado para despliegue ligero.
- Umbral de decisión ajustable por configuración (`meta.json`), lo que permite calibrar el equilibrio entre falsos positivos y falsos negativos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades de visión, audio ni modo de pensamiento.
- Multilingüe: no; únicamente turco.

## Casos de uso

- Moderación de chat en vivo en turco: el modelo clasifica cada mensaje entrante en `NOT`/`OFF` con 27,9 ms de latencia en CPU, suficiente para filtrar en tiempo real sin bloquear el flujo de conversación ni requerir GPU.
- Prefiltrado en pipelines de moderación con revisión humana: al tener un umbral configurable, se puede operar en un punto de alta cobertura (derivar a revisión) y dejar que los moderadores humanos confirmen los casos dudosos.
- Protección de comunidades en foros y secciones de comentarios: integración como servicio HTTP ligero (106 MB en INT8) que se ejecuta junto al backend sin infraestructura de aceleración.
- Filtrado previo a otros sistemas: usar la salida `OFF` como señal para enrutar mensajes a colas de revisión, ocultar contenido o activar respuestas automáticas de advertencia.
- Evaluación comparativa de estrategias de moderación: el repositorio incluye líneas base (lexicón, tf-idf, word2vec+FFN, word2vec+CNN) con métricas y latencias, útil para justificar la elección de arquitectura en un proyecto real.
- Despliegue en entornos con recursos limitados: al caber en CPU y en 106 MB, es viable en contenedores pequeños, dispositivos de borde o instancias sin GPU dedicada.
- Investigación sobre ofensividad en turco: punto de partida reproducible sobre OffensEval-TR 2020 para experimentos de ajuste fino y cuantización.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test oficial de OffensEval-TR 2020 (3.528 tuits), latencia media medida en un Ryzen 7 5700X, batch 1, 300 ejecuciones, un hilo de CPU:

| Carpeta / modelo | Macro-F1 test | Tamano | Latencia media (1 hilo CPU) |
|---|---|---|---|
| `lexicon/` (lexicón por distancia de edición) | 0,667 | 0,001 MB | 0,17 ms |
| `tfidf/` (tf-idf + regresión logística) | 0,769 | 2,2 MB | 1,7 ms |
| `w2v_ffn/` (word2vec propio + FFN) | 0,689 | 11,8 MB | 0,3 ms |
| `w2v_cnn/` (word2vec propio + CNN 1D) | 0,728 | 11,8 MB | 0,6 ms |
| `berturk_fp32/` (BERTurk ajustado, PyTorch FP32) | 0,814 | 422 MB | 81,7 ms |
| `berturk_onnx/model_fp32.onnx` (ONNX Runtime FP32) | 0,814 | 422 MB | 54,4 ms |
| `berturk_onnx/model_int8.onnx` (INT8 dinámica, servida) | 0,815 | 106 MB | 27,9 ms |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la variante servida (ONNX INT8) está diseñada para CPU.
- GPU recomendadas: no aplica para el despliegue previsto; en caso de usar la variante PyTorch FP32, cualquier GPU con al menos unos pocos GB de memoria libre sería suficiente, aunque no se documentan requisitos concretos.
- GPU de consumo: el modelo cabe holgadamente en cualquier GPU de consumo, pero su diseño apunta a inferencia en CPU.
- Opciones de despliegue: ONNX Runtime (formatos `model_fp32.onnx` y `model_int8.onnx`), PyTorch (carpeta `berturk_fp32/`), y la aplicación de referencia `python app.py`, que descarga solo los archivos que sirve (~135 MB).
- Latencia y throughput: 27,9 ms por mensaje en INT8 con un hilo de CPU (Ryzen 7 5700X); 54,4 ms en ONNX FP32; 81,7 ms en PyTorch FP32. No se documenta throughput agregado ni latencias en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (OffensEval-TR 2020) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zweinleo/swe015-chat-moderation` (BERTurk INT8) | no disponible | no disponible | 0,815 | CC-BY-2.0 | Hugging Face, ONNX/PyTorch |
| Línea base tf-idf + regresión logística (incluida en el repo) | no aplica (bolsa de palabras) | no aplica | 0,769 | CC-BY-2.0 (repo) | Incluida en el repositorio |
| Línea base word2vec + CNN 1D (incluida en el repo) | no disponible | no aplica | 0,728 | CC-BY-2.0 (repo) | Incluida en el repositorio |
| Línea base lexicón por distancia de edición (incluida en el repo) | no aplica | no aplica | 0,667 | CC-BY-2.0 (repo) | Incluida en el repositorio |

No se dispone de datos de otros modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre tuits, no sobre chat de videojuegos: el dominio de aplicación difiere del de entrenamiento y los insultos velados suelen no detectarse, según advierte el propio autor.
- Clasificación binaria de una sola etiqueta: no distingue tipos ni gravedad de la ofensa, solo `NOT`/`OFF`.
- Riesgo de falsos positivos y falsos negativos dependiente del umbral; el umbral óptimo se ajustó en validación y puede no transferirse a otros dominios.
- Sesgos: al derivar de un corpus de redes sociales turcas, puede heredar sesgos léxicos y de anotación del dataset original; no se documentan análisis de sesgo adicionales.
- Cobertura lingüística limitada al turco; no soporta otros idiomas ni code-switching.
- Sin datos publicados sobre longitud máxima de contexto efectiva ni sobre comportamiento con mensajes muy largos.
- Licencia CC-BY-2.0: permite uso comercial con atribución; el modelo base es MIT. Conviene verificar las condiciones de atribución al integrarlo en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.
- No es un sistema de moderación completo: requiere umbrales, políticas de escalado y revisión humana para un despliegue responsable.

## Enlaces

- Hugging Face: https://huggingface.co/zweinleo/swe015-chat-moderation
- Repositorio del proyecto (código, scripts de entrenamiento y aplicación): https://github.com/ardakocadoru/swe015-chat-moderation
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset: `offenseval-tr-2020` (referenciado en la model card)
- Paper del corpus: Çağrı Çöltekin, *A Corpus of Turkish Offensive Language on Social Media*, LREC 2020 (CC-BY 2.0)
