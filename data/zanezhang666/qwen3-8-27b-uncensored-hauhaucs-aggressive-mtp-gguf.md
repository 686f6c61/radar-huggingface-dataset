# zanezhang666/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una cuantizacion GGUF del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario zanezhang666 a partir del trabajo de cuantizacion de HauhauCS. El modelo base es un transformer denso de 27.000 millones de parametros con capacidad multimodal (texto, imagen y video), y esta version aplica un perfil de "descensura" denominado Aggressive, que elimina el comportamiento de rechazo y reduce el preambulo en respuestas a peticiones dificiles. La model card declara 0 rechazos sobre 465 prompts de prueba.

La aportacion tecnica mas relevante es FastMTP, un sidecar de decodificacion especulativa que aprovecha la cabeza NextN/MTP nativa del modelo base. Segun el autor, ofrece hasta 3,02x de velocidad de generacion en tareas de documentos y 1,93x en tareas de razonamiento frente a la inferencia sin MTP, y hasta un 35,2% y un 21,1% mas de throughput que el MTP embebido estandar. El modelo conserva el contexto nativo de 262.144 tokens, extensible hasta 1.000.000.

La relevancia practica es doble: por un lado, permite ejecutar un modelo de 27B con vision en hardware de consumo gracias a las cuantizaciones de 2 a 8 bits; por otro, el perfil Aggressive lo hace atractivo para entornos donde las politicas de rechazo del modelo base resultan un obstaculo, pero tambien lo convierte en una opcion de mayor riesgo para produccion. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con encoder de vision; 48 capas Gated DeltaNet y 16 capas de atencion con compuertas; MTP/NextN embebido |
| Parametros totales | 27.000 millones (modelo base); el tensor safetensors publicado en el repo declara 1.863.907.840 parametros |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; proyector de vision BF16 |
| Idiomas soportados | Ingles, chino y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto, proyector de vision y sidecar FastMTP en archivos separados) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B con 64 capas, hidden size de 5.120 y FFN de 17.408, con un vocabulario de 248.320 tokens. La arquitectura combina 48 capas Gated DeltaNet (mecanismo de estado lineal con compuertas) y 16 capas de atencion con compuertas, un diseno hibrido orientado a reducir el coste de atencion en contextos largos. Incluye una cabeza MTP (Multi-Token Prediction, tambien llamada NextN) embebida, que permite decodificacion especulativa nativa. La componente de vision se distribuye como proyector BF16 separado de 931 MB.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base. La unica intervencion documentada por el autor es la aplicacion del perfil de "descensura" Aggressive, sin cambios en datasets ni en capacidades previstas. La innovacion destacable es FastMTP: un sidecar de 903 MB con un perfil de aceleracion de 32K que se qualifica sobre toda la linea de cuantizaciones y que, segun el autor, supera al MTP embebido estandar en throughput de generacion.

## Capacidades

- Generacion de texto y razonamiento multi-paso, incluyendo modo de pensamiento del modelo base.
- Comprension de imagen y video mediante el proyector de vision BF16 (pipeline image-text-to-text).
- Generacion de codigo y matematicas, heredadas de las capacidades del Qwen3.8-27B original.
- Comportamiento agentico y capacidad de razonamiento encadenado en contextos largos.
- Soporte multilingue, con enfasis en ingles y chino.
- Perfil Aggressive: respuestas directas sin rechazo y con preambulo minimo en prompts dificiles.
- Decodificacion especulativa acelerada mediante FastMTP y la cabeza NextN nativa.
- Compatibilidad con endpoints (tag endpoints_compatible) y uso conversacional.

## Casos de uso

- Asistencia conversacional sin filtros: el perfil Aggressive responde directamente a peticiones sensibles sin derivar a mensajes de rechazo, lo que resulta util en entornos de investigacion sobre seguridad y alineamiento donde se necesita medir el comportamiento del modelo sin capas de rechazo.
- Analisis de documentos largos: con 262.144 tokens de contexto nativo y FastMTP optimizado para tareas de documentos (hasta 3,02x de velocidad), es adecuado para resumir contratos, informes tecnicos o expedientes completos en una sola pasada.
- Procesamiento de imagenes y video: el proyector BF16 permite extraer descripciones, transcribir contenido visual o responder preguntas sobre fotogramas, util en pipelines de catalogacion de medios.
- Agentes autonomos de multiples pasos: el contexto extensible hasta 1.000.000 de tokens y las capacidades agenticas del modelo base permiten mantener historiales largos de herramientas y observaciones en tareas de automatizacion.
- Generacion de codigo en local: las cuantizaciones Q4_K_P (17,92 GB) e IQ4_XS (15,71 GB) permiten ejecutar el modelo en una GPU de consumo de 24 GB, integrandolo en flujos de autocompletado o revision de codigo sin depender de la nube.
- Despliegue en hardware limitado: las cuantizaciones IQ3_XS (12,18 GB) e IQ2_M (10,32 GB) permiten inferencia en GPUs de 12-16 GB o en CPU con llama.cpp, habilitando prototipos y demos locales.
- Investigacion sobre decodificacion especulativa: el sidecar FastMTP y la cabeza NextN permiten comparar estrategias de aceleracion (MTP embebido frente a FastMTP) sobre el mismo modelo y cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta metricas de aceleracion relativas:

| Metrica | Resultado declarado |
|---|---|
| Aceleracion TG en documentos frente a sin MTP | Hasta 3,02x |
| Aceleracion TG en razonamiento frente a sin MTP | Hasta 1,93x |
| TG en documentos frente a MTP embebido estandar | Hasta +35,2% |
| TG en razonamiento frente a MTP embebido estandar | Hasta +21,1% |
| Tasa de rechazo (465 prompts) | 0/465 |

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q8_K_P ~31,5 GB; Q6_K_P ~25,9 GB; Q5_K_P ~20,2 GB; Q4_K_P ~17,9 GB; IQ4_XS ~15,7 GB; Q3_K_P ~13,4 GB; IQ3_XS ~12,2 GB; IQ2_M ~10,3 GB. Anadir ~0,9 GB para el proyector de vision y ~0,9 GB para el sidecar FastMTP si se usan.
- GPU recomendadas: A100 80 GB o H100 para Q8_K_P con contexto largo; RTX 4090 (24 GB) para Q5_K_P o Q4_K_P; RTX 4080/4070 Ti (16 GB) para IQ4_XS o Q3_K_P; GPUs de 12 GB para IQ3_XS.
- Cabe en GPU de consumo: si, desde IQ3_XS (12,2 GB) en adelante; Q4_K_P e IQ4_XS son las opciones mas equilibradas para 16-24 GB.
- Opciones de despliegue: llama.cpp, LM Studio y otros runtimes compatibles con GGUF; el autor indica que los quants K_P son GGUFs estandar sin necesidad de build ni plugin especial. No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no se proporcionan valores absolutos (tokens/s); solo los ratios relativos de FastMTP indicados arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP | 27B denso | 262.144 (ext. 1M) | Si | Apache 2.0 | GGUF | Perfil sin rechazo, FastMTP |
| Qwen3.8-27B (base) | 27B denso | 262.144 (ext. 1M) | Si | Apache 2.0 | Safetensors | Politicas de rechazo intactas |
| Alternativas de 27B-32B denso con vision | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con modelos de la misma categoria; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El perfil Aggressive elimina el comportamiento de rechazo: puede generar contenido danino, ilegal o inseguro sin advertencia, lo que desaconseja su uso directo en produccion orientada al usuario final.
- Riesgo de alucinacion inherente al modelo base; la ausencia de rechazo puede aumentar la confianza aparente en respuestas incorrectas.
- El autor recomienda una variante Balanced para trabajo agentico de contexto largo en entornos criticos; esta version prioriza respuestas directas sobre fiabilidad.
- No se han publicado evaluaciones independientes de calidad ni de seguridad para esta cuantizacion.
- El contexto maximo de 1.000.000 de tokens es una extension declarada; el rendimiento real en contextos muy largos no esta verificado en la informacion disponible.
- Los quants K_P pueden mostrarse como "?" en la columna de cuantizacion de LM Studio (problema de visualizacion, no de carga).
- El widget de compatibilidad de hardware de Hugging Face puede no reconocer los quants K_P; hay que usar "View variants" o "Files and versions".
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B antes de uso comercial.
- El tag de parametros del repo safetensors (1.863.907.840) no coincide con los 27B declarados en la model card; tratar el dato con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/zanezhang666/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo de cuantizacion original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Discord del autor: https://discord.gg/SZ5vacTXYf
