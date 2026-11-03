# Topovoid/TopoVoid-0.2B-Orthogonal-Preview

## Resumen

TopoVoid-0.2B-Orthogonal-Preview es un modelo de lenguaje causal bilingüe (inglés y chino) de 212 millones de parámetros, desarrollado por la organización Topovoid y publicado como vista previa de investigación (v0.1) de su arquitectura homónima. Su rasgo diferencial no es el rendimiento bruto, sino el diseño: incorpora cuellos de botella conceptuales (concept bottleneck modules, CBM) explícitos en capas intermedias, lo que permite editar conocimiento mediante un solver en forma cerrada que escribe nuevos hechos directamente en los pesos de atención y MLP, sin reentrenamiento ni pasos de optimizador.

El modelo se ha preentrenado desde cero sobre FineWeb y FineWeb-2, con un vocabulario podado de 151.936 a 49.152 tokens activos, y se distribuye con pesos fp32 en safetensors junto con el código de escritura de pesos (`closed_form_write.py`) y un script de demostración. La propuesta encaja en la línea de investigación de edición de conocimiento tipo ROME/MEMIT, pero sustituye el ajuste por gradiente descendente por una proyección en el espacio nulo ortogonal de las capas conceptuales, lo que da incrementos de rango bajo y un coste de compilación del orden de 1,37 segundos por hecho.

Es relevante ahora porque demuestra, a escala reducida y con licencia Apache-2.0, un mecanismo de inyección de hechos con métricas publicadas sobre CounterFact, AG News y ARC, y porque separa explícitamente tres vías de evaluación (escritura directa de pesos, lectura lineal sobre representaciones congeladas y recuperación desde un índice conceptual externo) que suelen confundirse en la literatura. No obstante, se trata de un preview de investigación con cero descargas y sin validación externa, por lo que su uso en producción no está contrastado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con cuellos de botella conceptuales (MidCBM, SubspaceTopKCBM, Highway CBM) en capas 7 y 12 |
| Parámetros totales | 212.011.264 (embeddings de entrada y salida atados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 posiciones (tabla RoPE con theta = 5e5) |
| Tipos de cuantización | no disponible (pesos publicados en fp32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, 809 MB) más `modeling_topovoid.py` para carga en PyTorch |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas, `d_model` de 1.024 y `d_ff` de 2.432 con activación SwiGLU. La atención usa 16 cabezas de consulta y 4 cabezas KV (GQA), con QK-RMSNorm por cabeza, y codificación posicional RoPE con theta de 5e5 sobre una tabla de 4.096 posiciones. El vocabulario activo es de 49.152 tokens, podado desde 151.936 sobre un tokenizador rápido basado en Qwen, lo que elimina aproximadamente 82 millones de parámetros de embedding no utilizados.

La innovación estructural son los módulos de cuello de botella conceptual: un `MidCBM` de 24 dimensiones en la capa 7 (diseñado con una relación señal-ruido conceptual de 35:1), un `SubspaceTopKCBM` de 40 dimensiones con 256 átomos de diccionario y selección Top-8, y un `Highway CBM` de 24 dimensiones en la capa 12. Sobre esta base, el solver `closed_form_write.py` construye contextos disparadores por hecho (variantes declarativas y de pregunta-respuesta), calcula un objetivo de pullback `R` mediante tres pasos de autograd sobre la activación oculta (sin actualizar pesos), lo proyecta con `P_perp = I_1024 - Q_cbm Q_cbm^T` —donde `Q_cbm` es una base ortonormal de 1.024×176 que protege el 17,2 % de las dimensiones residuales— y resuelve un sistema lineal regularizado para obtener incrementos de rango bajo `ΔW = P_perp R V` en la proyección de salida de atención y en la down-projection del MLP de las capas 8 a 11. Los datos de preentrenamiento son FineWeb y FineWeb-2; no se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto causal bilingüe en inglés y chino.
- Edición de conocimiento en forma cerrada: inyección de hechos en pesos de atención y MLP sin reentrenamiento ni tokens adicionales en el prompt.
- Compilación por lotes de múltiples hechos con montaje y desmontaje de incrementos de peso (`W + ΔW`).
- Lectura lineal sobre representaciones congeladas para clasificación (evaluado en AG News con 40 etiquetas de tarea).
- Recuperación desde un índice conceptual externo (`memory_index.py`) manteniendo los pesos base sin cambios.
- Separación explícita entre las vías de escritura de pesos, lectura de representaciones y recuperación externa.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Corrección de hechos en asistentes desplegados: el solver permite actualizar un dato erróneo (por ejemplo, una fecha o un cargo) escribiendo el nuevo hecho en las capas 8-11 con un fichero de factores de 0,093 MB y un tiempo medio de compilación de 1,37 s, sin reentrenar el modelo ni añadir tokens al prompt.
- Investigación en edición de conocimiento: reproducción de los experimentos de CounterFact con `demo_write.py --counterfact` para comparar la escritura en espacio nulo frente a métodos basados en gradiente como ROME o MEMIT.
- Clasificación de texto con representaciones congeladas: uso del estado oculto de la capa 7 (1.024 dimensiones) como extractor de características para un clasificador lineal, aprovechando el 75,37 % medido en AG News con solo 40 etiquetas de tarea.
- Indexación conceptual externa: despliegue de un índice de hechos recuperables (`memory_index.py`) que mejora la respuesta a paráfrasis nuevas sin modificar los pesos base, útil en bases de conocimiento que cambian con frecuencia.
- Prototipado de sistemas bilingües de bajo coste: con 212 millones de parámetros y pesos fp32 de 809 MB, el modelo cabe en una sola GPU de consumo para experimentación en inglés y chino.
- Auditoría de linaje de conocimiento: el desmontaje de incrementos permite comparar el comportamiento del modelo con y sin un hecho inyectado, lo que facilita trazar qué edición provocó un cambio de respuesta.
- Investigación sobre interferencia entre ediciones: la métrica de sangrado de vecindad (44,90 %) permite estudiar cómo afecta una escritura a hechos relacionados del mismo sujeto.

## Benchmarks y rendimiento

| Vía y dataset | Resultado medido | Condiciones |
|---|---|---|
| Escritura directa de pesos (CounterFact, 100 ediciones individuales) | Top-1 del primer token: 1,00 % → 100,00 %; tiempo de compilación mediano 1,37 s (fichero de factores de 0,093 MB) | Reinicio a pesos base antes de cada edición; Top-1 de paráfrasis 35,00 %; sangrado de vecindad 44,90 %; métrica de primer token, no de cadena completa |
| Lectura sobre representación congelada (AG News, 10 etiquetas por clase) | L7 completo (1.024-d): 75,37 %; CBM (320-d): 67,32 %; SVM TF-IDF palabra+carácter: 56,70 % | 40 etiquetas de tarea totales, lambda = 0,1 y C = 1 prefijados, 0 etiquetas de validación adicionales, 5 semillas; diferencia L7 frente a SVM de +18,67 pp (IC 95 % emparejado [+15,75, +21,60] pp, p de Holm = 0,0002975) |
| Índice MidCBM externo (ARC, 399 paráfrasis nuevas) | 28,57 % → 72,93 % (+44,36 pp, IC 95 % [+39,36, +49,38] pp) | Pesos base sin cambios (`memory_index.py`); misma cabeza de copia con recuperación TF-IDF |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,85 GB solo para pesos, más caché KV y activaciones; con 4.096 posiciones de contexto y GQA de 4 cabezas KV el coste adicional es moderado, pero no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32 en contexto corto; para lotes grandes o contexto completo conviene una GPU de 8 GB o superior.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; también en GPUs de portátil con 6-8 GB.
- Opciones de despliegue: el repositorio proporciona `modeling_topovoid.py` y `load_topovoid` para PyTorch puro con transformers 4.57.1 y torch 2.8.0; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponibles; solo se publica el tiempo de compilación de ediciones (1,37 s mediano por hecho), no la latencia de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rasgo diferencial |
|---|---|---|---|---|---|
| TopoVoid-0.2B-Orthogonal-Preview | 212 M | 4.096 | en, zh | Apache-2.0 | Cuellos de botella conceptuales y edición de pesos en forma cerrada |
| Qwen2.5-0.5B | 494 M | 32.768 | multilingüe | Apache-2.0 | Modelo generalista con contexto largo y amplia adopción |
| SmolLM2-135M | 135 M | 8.192 | en (principalmente) | Apache-2.0 | Modelo pequeño generalista optimizado para despliegue en dispositivo |
| GPT-2 small | 124 M | 1.024 | en | MIT | Referencia histórica de LM pequeño, sin edición de conocimiento integrada |

La comparación con modelos generalistas no es directa: TopoVoid no publica resultados en benchmarks estándar de lenguaje, por lo que su ventaja declarada se limita al mecanismo de edición de conocimiento y a las métricas de las tres vías de evaluación descritas. No se dispone de datos de rendimiento comparables en MMLU, HumanEval o GSM8K para ninguno de los modelos de esta tabla en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación en versión preview (v0.1) con cero descargas y sin validación externa; no hay evidencia de uso en producción.
- La métrica principal de CounterFact es Top-1 del primer token, no precisión de cadena completa; la generalización a paráfrasis cae al 35,00 %.
- El sangrado de vecindad del 44,90 % indica que las ediciones afectan a hechos relacionados del mismo sujeto, un riesgo directo de corrupción de conocimiento.
- Contexto limitado a 4.096 posiciones, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo se declaran inglés y chino; no hay evaluación de otros idiomas.
- No se documentan fases de alineación (RLHF, DPO) ni evaluaciones de sesgo, por lo que se desconoce el comportamiento en dominios sensibles.
- Riesgo de alucinación no cuantificado en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero al ser un preview sin garantías ni benchmarks generalistas, su idoneidad comercial no está acreditada.
- El flujo de escritura de pesos requiere GPU, autograd y el código del repositorio; no es un proceso portable a otros runtimes de inferencia.
- El vocabulario podado a 49.152 tokens exige el mapa `vocab_map_49152_chatml.npz` para mapear índices originales y compactos; un uso incorrecto del mapa produce tokens inválidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Topovoid/TopoVoid-0.2B-Orthogonal-Preview
- Organización Topovoid en HuggingFace: https://huggingface.co/Topovoid
- Sitio web de Topovoid: https://topovoid.com
- Dataset CounterFact (ROME): https://rome.baulab.info/data/dsets/counterfact.json
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Dataset DBpedia 14: https://huggingface.co/datasets/fancyzhx/dbpedia_14
