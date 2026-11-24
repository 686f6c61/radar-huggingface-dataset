# SZLHOLDINGS/SZL-Khipu-1.5B-GGUF

## Resumen

SZL-Khipu-1.5B-GGUF es la distribucion cuantizada en formato GGUF del modelo SZLHOLDINGS/SZL-Khipu-1.5B, un modelo de generacion de texto de aproximadamente 1.540 millones de parametros publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada. El repositorio contiene unicamente pesos en formato GGUF compatibles con llama.cpp, lo que lo orienta a inferencia local y a despliegues ligeros sin necesidad de GPU de datacenter. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

La relevancia de este modelo es limitada y conviene ser explicitos: la model card no documenta arquitectura, datos de entrenamiento, proceso de alineamiento ni resultados de evaluacion. El propio autor etiqueta el estado de las receipts como UNKNOWN_NO_EVAL_RECEIPT, es decir, no existe una cadena de evaluacion verificada que respalde ninguna afirmacion de calidad. La ficha tecnica que sigue refleja exclusivamente lo que puede medirse a partir de los metadatos del repositorio (tamano de pesos, hashes, cuantizaciones disponibles) y marca como no disponible todo lo que el autor no ha publicado.

Con 1.543.714.304 parametros reales declarados en safetensors, el modelo se situa en la franja de los modelos pequenos tipo Qwen2.5-1.5B o SmolLM2-1.7B, pensados para ejecucion en CPU o en GPU de consumo. Su utilidad practica, por tanto, depende de la calidad del modelo base, que en este caso no esta documentada ni evaluada publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model_type y architectures NOT-DECLARED; config.json devuelve 404) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M (archivos GGUF presentes en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye aparte |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El repositorio no incluye config.json (la peticion devuelve 404) y la model card declara explicitamente model_type y architectures como NOT-DECLARED. Por el numero de parametros y el pipeline declarado (text-generation) cabe esperar un transformer decoder-only, pero esto es una inferencia y no un dato confirmado por el autor.

Tampoco hay informacion sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de alineamiento como RLHF, DPO o SFT. La model card indica que cualquier afirmacion de entrenamiento o evaluacion vive en archivos de receipt que, segun la auditoria del 22 de noviembre de 2026, no constituyen una cadena de receipt completa (estado UNKNOWN_NO_EVAL_RECEIPT). No se declara ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, MoE, SSM ni arquitecturas hibridas).

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso previsto para dialogo, sin que se documenten capacidades adicionales.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el artefacto puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Inferencia via llama.cpp: al estar en GGUF, es ejecutable con llama.cpp y con los runners que lo envuelven (Ollama, llama-cpp-python, entre otros).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado local de chatbots: al ser un GGUF de 1.5B, puede ejecutarse en un portatil sin GPU dedicada para validar flujos conversacionales antes de migrar a un modelo mayor. Es adecuado por su bajo coste de despliegue, no por calidad demostrada.
- Pruebas de integracion con llama.cpp: sirve como artefacto de prueba para validar pipelines de carga de GGUF, tokenizacion y generacion en entornos CI, dado que se publican hashes SHA-256 de cada archivo de pesos.
- Generacion de texto offline en dispositivos con recursos limitados: la cuantizacion Q4_K_M (aproximadamente 1 GB de pesos) permite ejecucion en CPU en entornos sin conectividad.
- Educacion y experimentacion: util para demostrar el ciclo completo de descarga, cuantizacion y servido de un modelo pequeno en un curso o taller.
- Evaluacion de infraestructura de serving: al disponer de cuatro cuantizaciones (F16, Q8_0, Q5_K_M, Q4_K_M), permite medir latencia y throughput comparativos entre niveles de precision en un mismo hardware.
- Filtrado o clasificacion de texto simple: con reservas, por la ausencia de evaluacion publicada; solo recomendable tras una validacion propia contra un conjunto de test del dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que no se aserta ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y la auditoria del 22 de noviembre de 2026 concluye estado UNKNOWN_NO_EVAL_RECEIPT. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin overhead de contexto): F16 en torno a 3,1 GB; Q8_0 en torno a 1,65 GB; Q5_K_M en torno a 1,13 GB; Q4_K_M en torno a 1,0 GB (calculado a partir de los tamanos de archivo publicados en el repositorio).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16 y 2 GB para Q4_K_M; tarjetas de consumo como RTX 3060, RTX 4060 o superiores son suficientes. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en todas las cuantizaciones publicadas.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que requeririan conversion previa a safetensors.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Evaluacion publicada |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B-GGUF | 1.543.714.304 | no disponible | Apache 2.0 | GGUF | No (UNKNOWN_NO_EVAL_RECEIPT) |
| Qwen2.5-1.5B-Instruct | 1.540 millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Si (MMLU, GSM8K, HumanEval) |
| SmolLM2-1.7B-Instruct | 1.710 millones | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Si (benchmarks publicados por Hugging Face) |
| Llama-3.2-1B-Instruct | 1.240 millones | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Si (benchmarks publicados por Meta) |

La comparativa se ofrece como referencia de categoria; los datos de los modelos alternativos provienen de sus respectivas model cards publicas y no de la informacion proporcionada en esta busqueda. SZL-Khipu-1.5B carece de contexto declarado y de evaluacion verificable, lo que lo situa por debajo de sus alternativas en trazabilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: el autor declara estado UNKNOWN_NO_EVAL_RECEIPT; no hay evidencia de calidad en ninguna tarea.
- Falta de transparencia arquitectonica: no se publica config.json, model_type ni arquitectura, lo que impide verificar el diseno interno.
- Contexto desconocido: no se declara la longitud de ventana, lo que impide planificar casos de uso con contexto largo.
- Solo ingles declarado: no hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinacion: no cuantificado; en modelos de 1.5B sin alineamiento documentado el riesgo es estructuralmente alto.
- Sesgos conocidos: no documentados por el autor; cabe esperar los sesgos del corpus de entrenamiento, que tampoco se describe.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluacion traslada al integrador toda la responsabilidad de validacion.
- Modelo base separado: este repositorio solo contiene GGUF; el modelo original esta en SZLHOLDINGS/SZL-Khipu-1.5B y no se ha verificado su contenido en esta busqueda.
- Fecha de creacion futura en los metadatos (2026-07-15): conviene tratar las marcas temporales del repositorio con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
