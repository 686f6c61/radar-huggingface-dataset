# zyrixel/mavka-qwen2.5-3b-gguf

## Resumen

Mavka es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct orientado a conversacion en ucraniano, desarrollado por el usuario zyrixel y distribuido en formato GGUF para su uso con llama.cpp. El modelo parte de la arquitectura transformer densa de Qwen2.5 e incorpora un adaptador LoRA entrenado mediante QLoRA para especializar la respuesta en ucraniano con un estilo conciso y una persona fija de asistente local.

El problema que aborda es la falta de asistentes ligeros y plenamente offline para ucraniano: el modelo funciona sin APIs en la nube, cabe en GPUs de consumo con 6 GB o mas de VRAM en cuantizacion Q4_K_M y se integra con una base de conocimiento local para RAG. Segun la model card, el ajuste mejora el pass-rate de un benchmark interno de 68 prompts del 0,721 al 0,779, con un salto notable en factuality (de 0,250 a 0,625).

Es relevante ahora por su enfoque en despliegue local de bajo coste y por la licencia MIT del artefacto publicado, aunque hereda las limitaciones del modelo base y declara una ventana de contexto reducida a 2048 tokens, muy por debajo de los 32 768 nativos de Qwen2.5-3B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) con adaptador LoRA; pesos empaquetados en GGUF |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (segun model card) |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | MIT (el modelo base Qwen2.5 conserva su propia licencia) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,09 mil millones de parametros. Sobre esta base se aplico un adaptador LoRA entrenado con QLoRA, es decir, cuantizando el modelo base durante el entrenamiento para reducir requisitos de memoria. Los pesos resultantes se fusionaron y se convirtieron a formato GGUF con cuantizacion Q4_K_M, dando un artefacto de aproximadamente 1,9 GB.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO adicionales. La mejora declarada en el benchmark interno se atribuye tanto al ajuste LoRA como a la incorporacion de hechos verificados en la base de conocimiento RAG local que acompana al proyecto. No se documentan innovaciones arquitectonicas propias: el modelo mantiene la atencion estandar de Qwen2 y no incorpora decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional en ucraniano con una persona de asistente fija y respuestas breves y concretas.
- Razonamiento basico y respuesta a preguntas factuales, reforzado mediante RAG con una base de conocimiento local.
- Generacion de codigo y resolucion de problemas matematicos sencillos, heredados del modelo base (pass-rate de 0,900 en coding y 0,833 en math en el benchmark interno).
- Soporte de conversaciones multiturno dentro de la ventana de 2048 tokens.
- Funcionamiento completamente offline, sin dependencia de APIs en la nube.
- Integracion con llama.cpp, Ollama y LMDeploy a traves del formato GGUF.
- No se documenta soporte explicito de tool calling ni de function calling.
- No se documenta soporte de agentes multi-paso ni de modos de razonamiento extendido (thinking mode).
- No dispone de capacidades de vision ni de audio.

## Casos de uso

- Asistente conversacional local en ucraniano: el modelo gestiona dialogos multiturno de hasta 2048 tokens en un equipo sin conexion, adecuado para escritorios y portatiles con GPU de 6 GB o mas.
- Atencion al cliente en ucraniano con base de conocimiento propia: combinado con la base RAG del proyecto Mavka, responde consultas sobre productos o procedimientos citando hechos verificados, lo que explica la mejora en factuality del benchmark.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local mediante llama.cpp, los datos no salen del dispositivo, lo que encaja en escenarios sanitarios, legales o administrativos con datos sensibles.
- Prototipado rapido de chatbots ucranianos: el formato GGUF y la licencia MIT permiten iterar sobre el modelo con Ollama o llama.cpp sin costes de infraestructura.
- Educacion y consultas factuales basicas: el modelo responde preguntas de historia, derecho y actualidad dentro de su base RAG, con un rendimiento declarado de 0,500 en historia y 0,750 en derecho.
- Generacion de codigo asistida en ucraniano: puede redactar fragmentos de codigo y explicaciones tecnicas, con un pass-rate de 0,900 en la categoria de coding del benchmark interno.
- Integracion en aplicaciones de escritorio o moviles con recursos limitados: el artefacto de 1,9 GB en Q4_K_M permite empaquetar el modelo junto a una app sin infraestructura de servidor.

## Benchmarks y rendimiento

La model card publica un benchmark interno de 68 prompts en modo pipeline comparando el modelo base Qwen2.5-3B con la version ajustada Mavka:

| Metrica | Baseline (Qwen2.5-3B) | Mavka | Variacion |
|---|---|---|---|
| Pass-rate general | 0,721 | 0,779 | +0,058 |
| Factuality | 0,250 | 0,625 | +0,375 |
| History | 0,400 | 0,500 | +0,100 |
| Law | 0,750 | 0,750 | 0,000 |
| Ukrainian | 0,600 | 0,600 | 0,000 |
| Coding | 0,900 | 0,900 | 0,000 |
| Math | 0,833 | 0,833 | 0,000 |
| Current | 0,800 | 0,800 | 0,000 |
| Identity | 1,000 | 1,000 | 0,000 |
| Injection | 1,000 | 1,000 | 0,000 |
| Smalltalk | 1,000 | 1,000 | 0,000 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El benchmark interno no especifica la metodologia de evaluacion ni el conjunto exacto de prompts, por lo que sus cifras deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 a 3 GB con la cuantizacion Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM, tal como indica la model card; tarjetas como RTX 3060, RTX 4060, RTX 4090 o A100 pueden ejecutarlo sobradamente.
- Cabe en GPU de consumo: si, en modelos con 6 GB o mas de VRAM; tambien puede ejecutarse en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LMDeploy y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mavka (Qwen2.5-3B + LoRA) | 3,09 B | 2048 | MIT (base con licencia propia) | GGUF Q4_K_M | Especializado en ucraniano, offline, con RAG |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 (nativo) | Licencia Qwen | safetensors, GGUF | Modelo base multilingue sin especializacion en ucraniano |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 (nativo) | Licencia Qwen | safetensors, GGUF | Alternativa mas ligera, menor calidad general |
| Llama 3.2 3B Instruct | 3,21 B | 128 000 | Licencia Llama 3.2 | safetensors, GGUF | Multilingue, mayor contexto, requiere aceptacion de licencia |

La comparativa se limita a caracteristicas estructurales: no se dispone de datos de benchmarks comparables entre Mavka y estas alternativas mas alla del benchmark interno del propio autor.

## Limitaciones y advertencias

- Ventana de contexto reducida a 2048 tokens, muy inferior a los 32 768 nativos del modelo base, lo que limita conversaciones largas y tareas de documento extenso.
- Especializado exclusivamente en ucraniano: el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera degradado respecto al modelo base.
- Riesgo de alucinacion inherente a un modelo de 3 B de parametros; la mejora en factuality depende en parte de la base RAG externa, no solo del modelo.
- El benchmark publicado es interno (68 prompts) y no ha sido validado de forma independiente; las cifras no son directamente comparables con benchmarks estandar.
- La licencia MIT del artefacto no sustituye a la licencia del modelo base Qwen2.5, que debe revisarse para uso comercial.
- No se documentan medidas de mitigacion de sesgos ni evaluaciones de seguridad mas alla de la categoria injection del benchmark interno.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria del artefacto.
- Solo se publica una cuantizacion (Q4_K_M); no hay variantes de mayor o menor precision para ajustar el equilibrio calidad/memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zyrixel/mavka-qwen2.5-3b-gguf
- Repositorio GitHub del proyecto Mavka: https://github.com/zyrixelxx/Mavka-Ai
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
