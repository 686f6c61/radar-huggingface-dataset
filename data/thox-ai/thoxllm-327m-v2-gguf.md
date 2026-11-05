# Thox-ai/ThoxLLM-327M-v2-GGUF

## Resumen

ThoxLLM-327M-v2-GGUF es la distribucion en formato GGUF del modelo base ThoxLLM-327M-v2, un modelo de lenguaje de 324.162.560 parametros entrenado desde cero por THOX.ai LLC (Thox-ai). Se publica como builds k-quant (F16, Q2_K, Q3_K_M, Q4_K_M y Q5_K_M) para su ejecucion en llama.cpp, Ollama y LM Studio, lo que lo orienta a inferencia local y en dispositivos de borde (edge, on-device) dentro del ecosistema propietario de la compania (ThoxOS, MeshStack).

El modelo es un base model, no un modelo instruido: no incorpora alineamiento conversacional ni formato de chat, por lo que debe utilizarse con prompts de completado plano. Su tamano reducido (327M parametros) lo situa en la categoria de modelos pequenos para hardware modesto, con un enfasis declarado en privacidad y ejecucion local-first.

La relevancia actual del lanzamiento reside en su licencia Apache-2.0, que permite uso comercial sin restricciones adicionales, y en la disponibilidad de cuantizaciones k-quant que reducen el peso del fichero hasta unos 254 MB en Q2_K. No obstante, el autor no publica resultados de benchmarks ni detalles del corpus de entrenamiento, lo que limita la evaluacion objetiva de su calidad frente a alternativas de tamano similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle de capas y atencion no disponible) |
| Parametros totales | 324.162.560 (327M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (solo k-quants) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repositorio cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer de 327M parametros entrenado desde cero por THOX.ai LLC, sin modelo base externo, como parte de su linea de investigacion de modelos pequenos. La model card no especifica el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el mecanismo de atencion empleado. Tampoco se documenta la longitud de contexto soportada.

Respecto a los datos de entrenamiento, la card indica unicamente que el corpus y el procedimiento son "los descritos en esta tarjeta en el momento del lanzamiento", sin aportar numero de tokens, composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Un detalle relevante de la cuantizacion es que el tamano intermedio del modelo no es divisible por 32, lo que impide generar builds legacy Q4_0 y Q8_0 y limita la publicacion a k-quants.

## Capacidades

- Generacion de texto por completado: el modelo es un base model y no soporta formato de chat ni instrucciones conversacionales.
- Razonamiento basico y generacion de texto general, con fiabilidad limitada por su tamano (327M parametros).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: solo ingles declarado; el rendimiento en otros idiomas es inferior segun el propio autor.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ejecucion local en llama.cpp, Ollama y LM Studio mediante los builds GGUF publicados.

## Casos de uso

- Autocompletado de texto en aplicaciones de escritorio: al ser un base model de completado, puede integrarse en editores o herramientas de escritura para sugerir continuaciones de texto en ingles, ejecutandose en local sin conexion.
- Prototipado de pipelines de generacion de texto en llama.cpp: sirve como modelo de pruebas de bajo coste para validar infraestructura de inferencia (carga de GGUF, tokenizacion, streaming) antes de migrar a modelos mayores.
- Inferencia en dispositivos de borde con recursos limitados: con builds de 254 a 650 MB, puede desplegarse en dispositivos con poca memoria o almacenamiento, dentro de la pila ThoxOS/MeshStack del fabricante.
- Generacion de texto sin conexion en entornos aislados: su naturaleza local-first y su licencia Apache-2.0 permiten usarlo en sistemas air-gapped donde no se puede enviar datos a la nube.
- Filtrado y clasificacion de texto simple: mediante prompts de completado puede emplearse para tareas de continuacion o etiquetado muy acotadas, siempre que se valide la salida por su limitada fiabilidad.
- Base para experimentacion e investigacion en modelos pequenos: al estar entrenado desde cero y publicarse con licencia permisiva, resulta util para estudiar el comportamiento de modelos de 327M y para fine-tuning posterior sobre dominios concretos.
- Educacion y demostraciones de inferencia local: su tamano reducido permite ejecutarlo en portatiles y equipos consumer para talleres o demos de LLM en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay ningun resultado de THOX GATE49 publicado para este modelo, y no se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en Q2_K, 0,28 GB en Q3_K_M, 0,30 GB en Q4_K_M, 0,33 GB en Q5_K_M y 0,65 GB en F16, segun los tamanos de fichero publicados (sin contar el overhead de contexto y del runtime).
- GPU recomendadas: cualquier GPU consumer con al menos 1-2 GB de VRAM libre es suficiente; tambien puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (RTX 3060, RTX 4060, GTX 1650, integradas con memoria compartida suficiente) e incluso en dispositivos de borde.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run hf.co/Thox-ai/ThoxLLM-327M-v2-GGUF:Q4_K_M) y LM Studio. No se documenta soporte para vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|---|
| ThoxLLM-327M-v2-GGUF | 327M | No disponible | Ingles | Apache-2.0 | GGUF | No |
| Modelos de ~300M de la familia GPT-2 (referencia historica) | ~124M-355M | 1024 tokens (GPT-2) | Ingles | MIT (GPT-2) | safetensors, GGUF | Si (referencia publica) |
| Modelos pequenos tipo SmolLM de ~360M (referencia de categoria) | ~360M | No disponible en esta ficha | Multiples | Apache-2.0 | safetensors, GGUF | Si |

La comparacion con alternativas concretas no puede completarse con rigor porque la informacion proporcionada no incluye datos de rendimiento del modelo evaluado ni especificaciones detalladas de competidores. Se indica, por tanto, que la comparativa cuantitativa esta no disponible; la principal diferencia observable es la licencia Apache-2.0 y la publicacion exclusiva en k-quants GGUF.

## Limitaciones y advertencias

- Modelo base de 327M: razonamiento y fiabilidad factual limitados; el propio autor recomienda verificar las respuestas importantes.
- No es un asistente publico alineado en seguridad; solo debe desplegarse detras de los guardrails de THOX si se usa en produccion.
- Las cuantizaciones de menor bit degradan mas la calidad; Q2_K se describe como un experimento de tamano, no como un build de calidad.
- El comportamiento y los sesgos reflejan los datos de entrenamiento, mayoritariamente en ingles; la calidad en otros idiomas es inferior.
- Solo soporta ingles de forma declarada, lo que limita su uso en castellano u otros idiomas.
- No hay informacion sobre longitud de contexto, lo que impide planificar casos de uso con contexto largo.
- No se publican benchmarks ni detalles del corpus, lo que dificulta la evaluacion objetiva y la comparacion con alternativas.
- Uso fuera de alcance segun el autor: decisiones medicas, legales, financieras o de seguridad critica sin revision humana, y control no supervisado de dispositivos fisicos sin paso de confirmacion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin soporte documentado.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Thox-ai/ThoxLLM-327M-v2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Thox-ai/ThoxLLM-327M-v2
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
