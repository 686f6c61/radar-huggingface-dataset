# vwdubb/Swift-Qwen3.8-27B-Uncensored-MTP-FP8

## Resumen

Swift-Qwen3.8-27B-Uncensored-MTP-FP8 es una cuantizacion en FP8 del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, publicado por el usuario vwdubb y empaquetado con la libreria compressed-tensors para su uso con transformers. El modelo subyacente es un fine-tune de razonamiento eficiente de Qwen3.8-27B (desarrollado por UkisAI bajo el nombre Swift) al que se le ha aplicado una ablacion de rechazo (abliteration) de direccion unica, ademas de conservar la cabeza MTP (Multi-Token Prediction) para decodificacion autoespeculativa. Cuenta con 27.781.427.952 parametros y una ventana de contexto de 262.144 tokens.

El modelo resuelve el problema del rechazo excesivo ("refusals") que presentan los modelos alineados con RLHF, reduciendo la tasa de negativas de 98/100 a 15/100 sobre el conjunto mlabonne/harmful_behaviors, con una divergencia KL de 0,0634 respecto al modelo Swift original. Es relevante ahora porque combina tres caracteristicas poco habituales en un mismo artefacto: multimodalidad (pipeline image-text-to-text), contexto muy largo (256K) y decodificacion autoespeculativa activa mediante la cabeza MTP intacta y editada de forma consistente.

El repositorio ocupa 38,5 GB e incluye pesos en formato safetensors cuantizados en FP8. Se distribuye bajo la Swift Open License v1.0, con uso gratuito para particulares y organizaciones con ingresos recurrentes anuales inferiores a 1.000.000 USD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas de atencion completa + 48 capas Gated DeltaNet (atencion lineal) + cabeza MTP, con torre de vision |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (segun la configuracion de servicio --max-model-len) |
| Tipos de cuantizacion | FP8 (este repositorio, compressed-tensors); el modelo base ofrece GGUF (Q2 a Q8, Unsloth-dynamic) y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (Swift Open License v1.0) |
| Formato de pesos | safetensors (FP8, compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura es hibrida y combina atencion convencional con atencion lineal. El modelo base Qwen3.8-27B organiza sus 64 capas en 16 capas de atencion completa (self_attn.o_proj) y 48 capas Gated DeltaNet (linear_attn.out_proj), con 64 capas MLP adicionales (mlp.down_proj), ademas de una cabeza MTP (Multi-Token Prediction). Incluye una torre de vision que habilita el pipeline image-text-to-text. La cabeza MTP permite decodificacion autoespeculativa, con soporte documentado tanto en vLLM (--speculative-config '{"method":"mtp","num_speculative_tokens":3}') como en SGLang (EAGLE con 3 pasos).

El proceso de abliteration sigue el metodo de ablacion de direccion unica de rechazo descrito por Arditi et al. (2024). Se recupera una direccion de rechazo unica `r` a partir de la diferencia entre los pesos de orcarouter/Qwen3.8-27B-Uncensored y Qwen3.8-27B (la diferencia es de rango uno por tensor, con coseno por tensor respecto a `r` de al menos 0,9999 y escala ajustada de 0,999), y despues se proyecta fuera de las matrices de Swift. Se editan 131 tensores: 17 de self_attn.o_proj (16 capas de atencion completa mas MTP), 48 de linear_attn.out_proj (Gated DeltaNet), 65 de mlp.down_proj (64 capas mas MTP) y 1 de embed_tokens, con la formula W' = W - r (rᵀ W) y E' = E - (E r) rᵀ. Cinco dimensiones ocultas (las enmascaradas de activacion masiva) nunca se editan. Todos los tensores (1199 en total) estan presentes; la torre de vision, lm_head y los 13 tensores MTP restantes se mantienen intactos. La edicion se calculo en float32 y se almaceno en BF16. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset del fine-tune Swift ni si hubo fases de RLHF o DPO especificas.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, heredados del fine-tune de razonamiento eficiente Swift sobre Qwen3.8-27B.
- Procesamiento de imagenes y texto (pipeline image-text-to-text), gracias a la torre de vision intacta.
- Modo de razonamiento ("thinking") con parser especifico en vLLM (--reasoning-parser qwen3).
- Tool calling y function calling, con parser dedicado (--tool-call-parser qwen3_coder) y activacion mediante --enable-auto-tool-choice.
- Soporte de agentes y flujos multi-paso, segun los parsers y plantillas incluidas.
- Decodificacion autoespeculativa mediante la cabeza MTP, tanto en vLLM como en SGLang.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Respuestas sin rechazo a peticiones habitualmente bloqueadas por modelos alineados (tasa de negativas reducida a 15/100).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo permite medir tasas de rechazo y estudiar tecnicas de abliteration comparando la edicion aplicada (direccion de rechazo `r`, 131 tensores editados) frente al modelo original, con herramientas como Heretic.
- Atencion al cliente automatizada: la ventana de 262.144 tokens permite mantener conversaciones multi-turno o hilos con historiales muy largos sin truncar el contexto, reduciendo la perdida de informacion acumulada.
- Procesamiento de documentos extensos: analisis y resumen de contratos, informes tecnicos o expedientes de cientos de miles de tokens en una sola pasada, sin necesidad de fragmentar con tecnicas de RAG.
- Analisis de imagenes con texto: al soportar image-text-to-text, puede procesar capturas de pantalla, diagramas, documentos escaneados o imagenes tecnicas junto con instrucciones textuales.
- Generacion de codigo en produccion: con tool calling y el parser qwen3_coder puede integrarse en pipelines de CI/CD y agentes de desarrollo que invocan funciones, ejecutan pruebas o consultan repositorios.
- Agentes autonomos multi-paso: la combinacion de tool calling, contexto largo y decodificacion autoespeculativa permite construir agentes que planifican, ejecutan acciones y mantienen estado a lo largo de tareas complejas con menor latencia.
- Escritura creativa sin restricciones: utiles para ficcion, guiones o contenido editorial donde los filtros de rechazo de modelos alineados interrumpen la generacion.
- Despliegue en produccion con FP8: la cuantizacion FP8 reduce el coste de VRAM frente a BF16, lo que abarata servir el modelo con vLLM o SGLang en GPUs de 80 GB.

## Benchmarks y rendimiento

La model card del modelo base publica mediciones de rechazo y divergencia KL obtenidas con la evaluacion integrada de Heretic (evaluate_model, BF16). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; el propio autor lo indica en la seccion "Not evaluated".

| Modelo | Rechazos | Divergencia KL |
|---|---|---|
| Este modelo (frente a Swift) | 15/100 | 0,0634 |
| Swift-Qwen3.8-27B | 98/100 | 0 |
| orcarouter/Qwen3.8-27B-Uncensored (frente a Qwen3.8-27B) | 17/100 | 0,0621 |
| Qwen3.8-27B | 98/100 | 0 |

Metodologia: 100 prompts de mlabonne/harmful_behaviors con decodificacion greedy y hasta 100 tokens para el recuento de rechazos; 100 prompts de mlabonne/harmless_alpaca para la divergencia KL de las distribuciones del primer token. El razonamiento se cierra de forma inmediata con el prefijo "\n</think>\n\n". El autor advierte que los recuentos de rechazo dependen del montaje de evaluacion y no son comparables entre model cards. Estos datos corresponden al modelo base en BF16, no a esta version FP8. Tampoco se han evaluado el comportamiento de rechazo en modo de razonamiento ni la tasa de aceptacion del MTP frente a Swift.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP8 (este repositorio), aproximadamente 28 GB solo para los pesos, mas margen para cache KV; el repositorio ocupa 38,5 GB. En BF16 serian unos 56 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB, H200 o GPU con 80 GB o mas para FP8 en una sola unidad. Para BF16 conviene disponibilidad de 80 GB o multi-GPU.
- Cabe en GPU de consumo: no de forma holgada en una sola GPU de 24 GB (RTX 4090, 3090) por la ventana de contexto de hasta 262.144 tokens, que dispara el consumo de cache KV; podria requerir multi-GPU o reducir la longitud de contexto.
- Opciones de despliegue: vLLM y SGLang para FP8 (recomendados por el autor), transformers con AutoModelForImageTextToText. El modelo base ofrece GGUF para llama.cpp y despliegues tipo Ollama, y NVFP4 para vLLM/SGLang.
- Latencia y throughput: no disponible. El uso de decodificacion autoespeculativa con la cabeza MTP (3 tokens especulativos) esta pensado para reducir la latencia de decodificacion, pero no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (Heretic) | Licencia | Formato |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-Uncensored-MTP-FP8 (este) | 27,78 B | 262.144 | 15/100 | Swift Open License v1.0 | safetensors FP8 |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP | no disponible | no disponible | no disponible | Swift Open License v1.0 | safetensors BF16, GGUF, NVFP4 |
| orcarouter/Qwen3.8-27B-Uncensored | no disponible | no disponible | 17/100 | Apache 2.0 | no disponible |
| Qwen3.8-27B | no disponible | no disponible | 98/100 | Apache 2.0 | no disponible |
| Swift-Qwen3.8-27B (base del fine-tune) | no disponible | no disponible | 98/100 | Swift Open License v1.0 | no disponible |

Nota: los recuentos de rechazo corresponden a mediciones del autor sobre el modelo base en BF16, no sobre esta cuantizacion FP8. La columna de contexto solo se dispone para este repositorio (configuracion de servicio --max-model-len de 262.144); para el resto figura como no disponible.

## Limitaciones y advertencias

- El autor reconoce explicitamente que no se han evaluado benchmarks generales ni el comportamiento de rechazo en modo de razonamiento, ni si sobreviven los trazos de razonamiento mas cortos de Swift, ni la tasa de aceptacion del MTP.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de tendencia a inventar informacion; al ser un modelo con modo de razonamiento, conviene validar las salidas en entornos de produccion.
- Al tratarse de un modelo "uncensored"/"abliterated", puede generar contenido que modelos alineados rechazarian; su uso requiere supervision y controles propios.
- Los datos de rechazo y divergencia KL son mediciones del autor con Heretic y no comparables entre model cards, segun el propio aviso.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Restricciones de licencia: la Swift Open License v1.0 permite uso gratuito para particulares y organizaciones con ingresos recurrentes anuales inferiores a 1.000.000 USD; por encima de ese umbral, el uso comercial requiere una Swift Enterprise License de UkisAI. Los modelos Qwen3.8-27B y orcarouter/Qwen3.8-27B-Uncensored son Apache 2.0, pero esta derivacion queda sujeta a la licencia Swift.
- Fecha de creacion del repositorio indicada en 2026-09-26, con 0 descargas y 0 likes en el momento del analisis; es una publicacion reciente sin adopcion documentada.
- Es una cuantizacion FP8 de la comunidad (vwdubb) del trabajo de ajgazin y UkisAI, no un checkpoint oficial de los autores originales; la gestion de incidencias depende del publicador del repo.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/vwdubb/Swift-Qwen3.8-27B-Uncensored-MTP-FP8
- Modelo base: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Swift-Qwen3.8-27B (UkisAI): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- orcarouter/Qwen3.8-27B-Uncensored: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion GGUF del modelo relacionado: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Cuantizacion NVFP4 del modelo relacionado: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-NVFP4
- Heretic (herramienta de evaluacion de abliteration): https://github.com/p-e-w/heretic
- Paper de referencia (Arditi et al.): arXiv:2406.11717
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
