# ursb01/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF

## Resumen

Ornith-1.5-35B-A3B-Heretic-MTP-APEX es una variante cuantizada en GGUF de Ornith-1.5-35B-A3B, un modelo de codificacion agente y razonamiento desarrollado por DeepReinforce (equipo Ornith) sobre la arquitectura Qwen3.5 MoE. Esta derivada experimental fusiona el LoRA Heretic 1.4.0 Trial 62 en los pesos BF16 del modelo base y sustituye la cabeza MTP (multi-token prediction) nativa, que venia sin entrenar, por una cabeza fusionada de 19 tensores procedente de shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY, entrenada mediante injerto de la arquitectura Qwen3.6 y destilacion KL de 12.000 pasos.

El modelo cuenta con 35.000 millones de parametros totales en configuracion MoE, con solo 3.000 millones activos por token gracias a 256 expertos de los que se seleccionan 8. Su ventana de contexto alcanza los 262.144 tokens, lo que lo hace adecuado para tareas de codificacion agente, razonamiento multi-paso y analisis de repositorios completos. Se distribuye bajo licencia MIT, tanto en formato GGUF cuantizado (APEX) como con proyector multimodal (mmproj) incluido.

La relevancia de este modelo reside en su naturaleza experimental: combina una modificacion de comportamiento de rechazo (Heretic) con una cabeza MTP entrenada para decodificacion especulativa, lo que permite acelerar la inferencia en motores compatibles como vLLM y llama.cpp. Es un ejemplo representativo de como la comunidad de IA abierta produce variantes especializadas sobre modelos base de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE, multimodal |
| Parametros totales | 35B |
| Parametros activos | 3B por token (8 de 256 expertos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF APEX (incluye Q8_0 para la cabeza MTP) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo MoE con 40 capas transformer y 256 expertos, de los que se activan 8 por token. La arquitectura base es la de Qwen3.5, con soporte multimodal (incluye proyector mmproj). El modelo fue entrenado con el enfoque de auto-mejora de Ornith-1.5, que extiende el marco de auto-scaffolding de Ornith-1.0: el modelo propone nuevas tareas, genera scaffolds especificos y produce soluciones (rollouts) para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje.

Esta variante concreta aplica dos modificaciones sobre el modelo base: la fusion del LoRA Heretic 1.4.0 Trial 62 (de un total de 80 pruebas) en los pesos BF16, que altera el comportamiento de rechazo del modelo; y la sustitucion de la cabeza MTP nativa (no entrenada, con estadisticas tipo inicializador) por una cabeza fusionada de 19 tensores procedente de shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY, entrenada mediante injerto de la arquitectura Qwen3.6 y destilacion KL de 12.000 pasos. La cabeza MTP permite decodificacion especulativa, prediciendo multiples tokens futuros para acelerar la inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento ni la composicion del dataset del modelo base.

## Capacidades

- Generacion de texto y razonamiento multi-paso, orientado a tareas de codificacion agente.
- Codificacion agente: puede generar, editar y depurar codigo en contextos de repositorios completos gracias a los 262.144 tokens de ventana.
- Soporte multimodal: incluye proyector mmproj para entrada de imagenes.
- Decodificacion especulativa MTP: la cabeza entrenada permite anticipar multiples tokens, acelerando la inferencia en motores compatibles (vLLM, llama.cpp).
- Soporte de tool calling y function calling, coherente con su perfil de codigo agente.
- Capacidades multilingues: no documentadas en la informacion proporcionada.

## Casos de uso

- Desarrollo de codigo en repositorios extensos: el modelo puede analizar multiples archivos dentro de una ventana de 262.144 tokens y generar cambios coherentes entre ellos, ideal para tareas de refactorizacion o implementacion de funcionalidades transversales.
- Depuracion y revision de codigo: puede detectar errores, vulnerabilidades y malas practicas en proyectos completos, aprovechando su contexto largo y su entrenamiento en codigo.
- Agentes de codificacion autonomos: integrable en pipelines de CI/CD o frameworks de desarrollo, con soporte de tool calling para operar sobre el sistema de archivos y ejecutar comandos.
- Asistencia en entornos de desarrollo integrado: desplegado como backend local con vLLM o llama.cpp, ofrece completado de codigo, explicaciones y refactorizaciones en tiempo real.
- Generacion de documentacion tecnica: a partir del analisis de codigo fuente, puede producir documentacion de API, comentarios y guias de uso.
- Analisis de seguridad de codigo: revision de repositorios para identificar patrones inseguros, con la ventaja de procesar el proyecto completo en una sola pasada.
- Investigacion en alineamiento: la variante Heretic permite estudiar como la modificacion del comportamiento de rechazo afecta a las capacidades de codificacion y razonamiento, util para experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio de 82,1 GB incluye multiples cuantizaciones APEX, por lo que el requisito minimo depende de la cuantizacion elegida.
- GPU recomendadas: un NVIDIA DGX Spark (122 GB de memoria unificada) es suficiente para MoEs de 30-50B segun cuantizaciones similares publicadas por la comunidad; para cuantizaciones mayores se requiere hardware de alquiler (H100/H200/Blackwell).
- Posibilidad de ejecucion en GPUs de consumo (RTX 3090, RTX 4090) con cuantizaciones agresivas (Q4_K_M o inferiores), dado que solo se activan 3B parametros por token.
- Opciones de despliegue: vLLM (con soporte MTP), llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | 3B | 262.144 | MIT | Codificacion agente, razonamiento |
| Esta variante (Heretic-MTP-APEX) | 35B | 3B | 262.144 | MIT | Codificacion agente + MTP + Heretic |
| Ornith-1.5-9B (dense) | 9B | 9B | no disponible | MIT | Codificacion agente, razonamiento |
| Ornith-1.5-397B-A3B | 397B | no disponible | no disponible | MIT | Codificacion agente, razonamiento |

La comparacion se limita a la familia Ornith-1.5, ya que no se dispone de datos de modelos competidores externos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la fusion del LoRA Heretic y la sustitucion de la cabeza MTP son modificaciones experimentales; el comportamiento puede diferir del modelo base original.
- Modificacion de comportamiento de rechazo: el LoRA Heretic altera el comportamiento de rechazo del modelo, lo que puede implicar riesgos de seguridad y alineacion; se recomienda evaluacion exhaustiva antes de desplegar en produccion.
- Cabeza MTP sustitutiva: aunque la cabeza de shisa-ai fue entrenada con destilacion KL, no se garantiza el comportamiento de la decodificacion especulativa en todos los motores de inferencia.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar codigo incorrecto o razonamientos falsos; se recomienda validacion humana en entornos criticos.
- Idiomas: la lista de idiomas soportados no esta documentada, por lo que la cobertura multilingue no esta confirmada.
- Datos de entrenamiento: no se ha publicado informacion sobre el numero de tokens ni la composicion del dataset de entrenamiento del modelo base.
- Sin benchmarks publicados: no es posible verificar el rendimiento comparativo con otros modelos de la misma categoria.
- Repositorio sin descargas ni valoraciones: el modelo no cuenta con metricas de adopcion, lo que indica una etapa temprana de publicacion.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/ursb01/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF
- Modelo base oficial: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Cabeza MTP de shisa-ai: https://huggingface.co/shisa-ai/Ornith-1.5-35B-A3B-MTP-ONLY
- Cuantizacion APEX similar (mudler): https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
- Proyecto Heretic: https://github.com/p-e-w/heretic
- Pagina de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
