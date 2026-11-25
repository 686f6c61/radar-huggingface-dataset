# TechnoBaptist/Ternary-Bonsai-2.5-27B-Uncensored-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-Uncensored-GGUF es una cuantizacion ternaria en formato GGUF del modelo base prism-ml/Ternary-Bonsai-2.5-27B, publicada por el usuario TechnoBaptist y vinculada al ecosistema de Atomic Chat. Se distribuye como un unico fichero PTQ1_0 de 5.993.834.848 bytes (aproximadamente 5,99 GB) en el que la proyeccion residual de las capas 27 a 44 esta integrada directamente en los codigos ternarios, de modo que no requiere un adaptador LoRA separado para funcionar. La modificacion afecta a 12.461.746 codigos ternarios distribuidos en 36 matrices, manteniendo intactas las escalas de bloque FP16 y el resto de bytes del GGUF original.

El objetivo declarado de esta variante es eliminar el sesgo de rechazo del modelo de partida: segun la model card, la pantalla de rechazo pasa de 24/24 en el modelo upstream a 0/24 en esta compilacion, mientras que en MMLU obtiene 406/500 (81,2 %) frente a 401/500 (80,2 %) del original. El peso se carga exclusivamente con el fork de llama.cpp de PrismML, lo que limita su portabilidad a otras herramientas de inferencia.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de edicion directa de codigos ternarios en un GGUF cuantizado, y por otro advierte de que se trata de un modelo sin censura, con implicaciones de licencia y de seguridad que conviene evaluar antes de cualquier uso en produccion. La licencia declarada es Apache 2.0 y el pipeline es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ternario; pesos en formato PTQ1_0 GGUF) |
| Parametros totales | 2.162.688 (dato de safetensors del repo; el nombre comercial indica 27B, discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 ternaria (unico formato publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del fichero | 5.993.834.848 bytes (5,99 GB) |
| Adaptador adicional | LoRA GGUF de 8,67 MB (opcional, para el PTQ1_0 original) |
| Runtime requerido | fork de llama.cpp de PrismML (prism-b12128-d7b2896) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de transformer, numero de capas, dimension del modelo o mecanismo de atencion). Lo que si se documenta es el proceso de cuantizacion ternaria PTQ1_0: los pesos se representan con codigos ternarios y escalas de bloque en FP16, un esquema de compresion agresiva que reduce el modelo a unos 6 GB. La variante "Uncensored" no se obtiene mediante un fine-tuning clasico con RLHF o DPO, sino mediante una edicion selectiva de codigos ternarios: se modifican 12.461.746 codigos en 36 matrices "residual-writer" de las capas 27 a 44, aplicando una proyeccion residual directamente sobre los codigos.

El resto del fichero, incluidas todas las escalas de bloque FP16 y la cabecera GGUF, se conserva identico al PTQ1_0 upstream. El autor reporta que la compilacion compacta obtiene 0/24 en prompts de rechazo y 0/24 en prompts ordinarios (frente a 24/24 y 0/24 del upstream), con respuestas no vacias y no degeneradas en los 48 casos, aunque el limite de 48 tokens trunco 24/24 y 23/24 respuestas respectivamente. Se trata, por tanto, de clasificaciones de respuesta inicial, no de evaluaciones completas. No se especifican datos de entrenamiento, numero de tokens ni composicion del dataset del modelo base.

## Capacidades

- Generacion de texto conversacional en formato de chat (etiqueta atomic-chat), ejecutable con `llama-cli -cnv`.
- Respuesta sin rechazos ante prompts que el modelo original declinaba, segun la pantalla de rechazo reportada (0/24).
- Razonamiento y conocimiento general medido con MMLU (406/500, 81,2 % en la muestra evaluada).
- Carga en memoria compacta gracias a la representacion ternaria (fichero de 5,99 GB).
- Soporte opcional de adaptador LoRA en tiempo de inferencia (variante separada de 8,67 MB para el PTQ1_0 original).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no disponibles en la informacion proporcionada.

## Casos de uso

- Experimentacion con cuantizacion ternaria: el fichero permite estudiar como afecta la representacion PTQ1_0 a la calidad del modelo, comparando MMLU y respuestas frente al PTQ1_0 original en el mismo hardware.
- Despliegue local en equipos con VRAM limitada: con 5,99 GB de pesos, el modelo cabe en GPUs de consumo de 8 GB o mas, lo que facilita probar un modelo de gran tamano nominal en estaciones de trabajo modestas.
- Investigacion sobre alineacion y rechazo: la pantalla de rechazo 0/24 lo convierte en un caso de estudio para analizar como la edicion de codigos ternarios altera el comportamiento de negativa del modelo.
- Generacion de texto creativo sin filtros: util para escritura de ficcion o guiones donde el modelo base aplicaba rechazos, siempre que el contenido cumpla la legalidad aplicable.
- Evaluacion de robustez de formatos GGUF: sirve para verificar que la cabecera, las escalas FP16 y los bytes no editados se preservan tras una modificacion quirurgica de pesos.
- Pruebas de compatibilidad de runtimes: permite validar el fork de llama.cpp de PrismML y comparar su comportamiento con otras implementaciones de inferencia.
- Docencia y demostraciones de tecnicas de edicion de modelos: el desglose de matrices y codigos modificados ofrece un ejemplo concreto de intervencion a bajo nivel sobre pesos cuantizados.

## Benchmarks y rendimiento

| Benchmark | Esta variante (compact PTQ1_0) | PTQ1_0 original | LoRA uncensored (escala 1,25) |
|---|---|---|---|
| MMLU (muestra de 500) | 406/500 (81,2 %) | 401/500 (80,2 %) | 401/500 (80,2 %) |
| Pantalla de rechazo (prompts de rechazo) | 0/24 | 24/24 | no disponible |
| Pantalla de rechazo (prompts ordinarios) | 0/24 | 0/24 | no disponible |

En la comparacion pareada de MMLU, la variante compacta gano 10 respuestas correctas y perdio 5 respecto al original (McNemar exacto, p = 0,30), diferencia no significativa. Los resultados constan en `evaluation-v2.json`. No se han publicado otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6 GB solo para los pesos; con contexto y cache KV, el consumo practico parte de unos 7-8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; para contextos largos o mayor throughput, RTX 3090/4090 (24 GB), A100 o H100.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas (por ejemplo, RTX 3060 Ti, 4060 Ti, 3070, 4070, 4080, 4090).
- Opciones de despliegue: exclusivamente el fork de llama.cpp de PrismML (release prism-b12128-d7b2896); no se documenta compatibilidad con vLLM, TGI, Ollama u otros runtimes.
- Comando de ejemplo: `llama-cli -m "Ternary-Bonsai-2.5-27B-Uncensored-PTQ1_0.gguf" -ngl 99 -cnv`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TechnoBaptist/Ternary-Bonsai-2.5-27B-Uncensored-GGUF | 2.162.688 (safetensors; nombre comercial 27B) | no disponible | GGUF PTQ1_0 | Apache 2.0 | Variante sin censura con proyeccion integrada; MMLU 81,2 % |
| prism-ml/Ternary-Bonsai-2.5-27B-GGUF | no disponible | no disponible | GGUF PTQ1_0 | no disponible | Modelo base; MMLU 80,2 %; rechazo 24/24 |
| AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF | no disponible | no disponible | LoRA GGUF (8,67 MB) | no disponible | Variante con adaptador separado; MMLU 80,2 % a escala 1,25 |

No se dispone de datos suficientes para comparar con modelos de otras familias o tamanos.

## Limitaciones y advertencias

- Modelo sin censura: la pantalla de rechazo pasa de 24/24 a 0/24, por lo que puede generar contenido que el modelo base declinaba; requiere moderacion externa en cualquier despliegue publico.
- La evaluacion de rechazo se limita a 48 respuestas truncadas a 48 tokens y clasifica solo la respuesta inicial, no conversaciones completas.
- Discrepancia de parametros: el dato de safetensors (2.162.688) no concuerda con el nombre comercial (27B); conviene verificar el modelo antes de dimensionar infraestructura.
- Compatibilidad restringida al fork de llama.cpp de PrismML; no se garantiza funcionamiento en otras herramientas.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el unico benchmark reportado es MMLU sobre una muestra de 500 preguntas.
- Idiomas soportados y longitud de contexto no documentados, lo que impide planificar usos multilingues o con contexto largo.
- Licencia Apache 2.0 declarada, pero el modelo base y los datos de entrenamiento no se detallan; revisar obligaciones de atribucion antes de uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/TechnoBaptist/Ternary-Bonsai-2.5-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Variante LoRA uncensored: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF
- Metricas y checksums de la LoRA: https://huggingface.co/datasets/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF-metrics
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp/releases/tag/prism-b12128-d7b2896
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X (Twitter) de Atomic Chat: https://x.com/atomic_chat_hq
