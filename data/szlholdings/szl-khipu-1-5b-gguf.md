# SZLHOLDINGS/SZL-Khipu-1.5B-GGUF

## Resumen

SZL-Khipu-1.5B-GGUF es la versión cuantizada en formato GGUF del modelo SZL-Khipu-1.5B, un fine-tune QLoRA de Qwen2.5-1.5B-Instruct desarrollado por SZLHOLDINGS. El modelo está diseñado específicamente para la navegación de agentes gobernados dentro del "lago de recibos" (receipt lake) de SZL Holdings, una infraestructura de verificación documental con firmas Ed25519. Su propósito no es la generación de texto general, sino la toma de decisiones estructuradas: dado un prompt JSON con una consulta y una lista de candidatos (handles), el modelo devuelve un plan JSON indicando si debe navegar hacia uno de esos candidatos o abstenerse.

Con 1.543.714.304 parámetros (1.5B), es un modelo compacto que puede ejecutarse en CPU con cuantización Q4_K_M (~0.99 GB), lo que lo hace adecuado para entornos con recursos limitados. La relevancia actual radica en su enfoque en agentes auditables y verificables, donde la procedencia de los datos y la integridad de las decisiones son críticas. La cuantización GGUF permite su uso con llama.cpp, Ollama y LM Studio, facilitando su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (0.99 GB), Q5_K_M (1.13 GB), Q8_0 (1.65 GB), F16 (3.09 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base SZL-Khipu-1.5B es un fine-tune QLoRA de Qwen2.5-1.5B-Instruct, que a su vez es un transformer decoder-only con atención causal. El fine-tune se realizó con QLoRA (Quantized Low-Rank Adaptation), una técnica que reduce el coste de entrenamiento al congelar los pesos originales y entrenar adaptadores de bajo rango. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset, pero el objetivo declarado es la navegación gobernada sobre el "lago de recibos" de SZL Holdings, un conjunto de documentos con firmas criptográficas.

La cuantización GGUF se generó con las herramientas de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`) a partir del modelo en safetensors, produciendo las variantes Q4_K_M, Q5_K_M, Q8_0 y F16. El template de chat (ChatML de Qwen2.5) está incrustado en cada archivo. El modelo opera bajo un "contrato de prompt" estricto: la entrada es un objeto JSON con `query` y `candidates` (solo handles, nunca contenido), y la salida es un plan JSON con `decision=NAVIGATE` o `decision=ABSTAIN`, según el esquema `khipu.schema.json`.

## Capacidades

- Navegación estructurada: dado un conjunto de candidatos (handles con metadatos sintéticos), el modelo decide si navegar hacia uno de ellos o abstenerse, devolviendo una decisión en JSON.
- Abstinencia controlada: puede emitir `ABSTAIN` con una razón, lo que permite evitar acciones cuando la información es insuficiente o ambigua.
- Integración con agentes gobernados: diseñado para funcionar dentro de un sistema de verificación con recibos firmados, donde cada decisión puede ser auditada.
- Generación de texto limitada: aunque es un modelo de lenguaje, su uso principal es la salida JSON estructurada, no la generación libre de texto.
- Multilingüismo: solo soporta inglés (según la model card), aunque el modelo base Qwen2.5 soporta más idiomas, este fine-tune está restringido a inglés.
- Compatibilidad con herramientas de inferencia: funciona con llama.cpp, Ollama y LM Studio, gracias al formato GGUF.

## Casos de uso

- Auditoría de decisiones en agentes autónomos: el modelo puede integrarse en un pipeline donde un agente debe decidir qué documento (recibo) consultar basándose en metadatos, garantizando que la decisión sea trazable y verificable.
- Navegación en bases de conocimiento estructuradas: en un sistema de gestión documental con nodos etiquetados, el modelo selecciona el nodo relevante para una consulta dada, reduciendo el espacio de búsqueda.
- Filtrado de candidatos en recuperación de información: dado un conjunto de resultados de búsqueda, el modelo puede elegir cuál es el más pertinente o abstenerse si ninguno es adecuado, mejorando la precisión de sistemas RAG.
- Verificación de integridad en cadenas de suministro: al operar sobre recibos firmados, el modelo puede asistir en la validación de transacciones, decidiendo si un recibo es relevante para una consulta de auditoría.
- Demostraciones educativas de agentes gobernados: su pequeño tamaño permite ejecutarlo en portátiles para enseñar conceptos de agentes con procedencia verificable y decisiones auditables.
- Despliegue en entornos con restricciones de hardware: al caber en ~1 GB con Q4_K_M, puede ejecutarse en dispositivos edge o servidores sin GPU, manteniendo una funcionalidad específica de navegación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se realiza ninguna evaluación post-cuantización ni se reclaman benchmarks independientes. El único artefacto de evaluación es un recibo firmado por el propietario que cubre el modelo pre-cuantizado, no los archivos GGUF.

## Requisitos de hardware

- VRAM estimada: con Q4_K_M (~0.99 GB), el modelo puede ejecutarse en CPU sin GPU; con Q8_0 (~1.65 GB) también es viable en CPU. Para GPU, cualquier tarjeta con al menos 2 GB de VRAM puede cargar la versión F16 (3.09 GB) si se usa offloading parcial.
- GPU recomendadas: no se requiere GPU específica; funciona en CPU. Si se usa GPU, una NVIDIA GTX 1650 o superior es suficiente para las cuantizaciones más pequeñas.
- Compatibilidad con consumer GPU: sí, cualquier GPU moderna con soporte CUDA o Metal puede acelerar la inferencia, aunque no es necesario.
- Opciones de despliegue: llama.cpp (CLI), Ollama (comando `ollama run hf.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF:Q4_K_M`), LM Studio (búsqueda por nombre), y servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no se han publicado datos. En CPU, se espera una latencia de unos pocos segundos por generación (dado el tamaño y la cuantización), pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B-GGUF | 1.5B | no disponible | Apache-2.0 | GGUF | Navegación gobernada en receipt lake |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K (no confirmado para este fine-tune) | Apache-2.0 | safetensors, GGUF | Chat general, código, razonamiento |
| Phi-3.5-mini-instruct | 3.8B | 128K | MIT | safetensors, GGUF | Chat general, razonamiento |

La comparativa se limita a características generales porque no hay datos de rendimiento para SZL-Khipu-1.5B. El modelo se distingue por su especialización en tareas de navegación estructurada con verificación criptográfica, algo que no ofrecen los modelos generalistas. Su tamaño es menor que Phi-3.5-mini, pero su funcionalidad es mucho más restringida.

## Limitaciones y advertencias

- Especialización extrema: no es un modelo de propósito general; su uso fuera del contrato de prompt JSON (navegación de recibos) probablemente produzca resultados pobres o inesperados.
- Idioma limitado: solo soporta inglés, lo que restringe su uso en entornos multilingües.
- Dependencia del prompt contract: la entrada debe seguir estrictamente el esquema JSON; cualquier desviación puede romper la salida.
- Verificación no independiente: los recibos firmados son del propietario (SZLHOLDINGS) y no constituyen una evaluación externa. La integridad de los pesos GGUF está garantizada por hashes SHA-256, pero no hay evaluación de calidad post-cuantización.
- Riesgo de alucinación: aunque el modelo está entrenado para abstenerse, en situaciones ambiguas podría emitir una navegación incorrecta. No hay datos sobre su tasa de error.
- Contexto no especificado: se desconoce la longitud de contexto efectiva tras el fine-tune, lo que puede afectar a tareas con entradas largas.
- Sin benchmarks públicos: no se puede comparar objetivamente con otros modelos en tareas estándar.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF)
- [Modelo base SZL-Khipu-1.5B](https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B)
- [Repositorio szl-forge en GitHub (Modelfile y espacios)](https://github.com/szl-holdings/szl-forge)
- [Documentación de Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Página de SZL Holdings en HuggingFace](https://huggingface.co/SZLHOLDINGS)
