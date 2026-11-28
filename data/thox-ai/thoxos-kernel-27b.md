# Thox-ai/ThoxOS-Kernel-27B

## Resumen

ThoxOS-Kernel-27B es un ajuste fino de parametros completos desarrollado por Thox-ai (THOX.ai) sobre el modelo comunitario JonathanColetti/Qwen3.8-27B-Uncensored. Esta especializado en tareas de kernel y operaciones de sistema: trabajo sobre el kernel de Linux, runbooks de servicios y shell, compilacion y diagnostico de ThoxOS, y operaciones de MeshStack en hosts de THOX. Ademas, actua como modelo profesor para los modelos mas pequenos de la familia ThoxOS-Kernel.

El modelo se distribuye con pesos completos en safetensors y en dos cuantizaciones GGUF (Q8_0 y Q4_K_M), con licencia Apache 2.0 y acceso publico sin gating. La model card declara que el ajuste supero sus puertas de evaluacion bajo el criterio de "final-answer scope" el 1 de noviembre de 2026, mientras que el veredicto de "raw-completion" se publica como retenido (HELD). Esto es relevante para quien lo evalue: el rendimiento declarado depende del criterio de puntuacion adoptado.

La relevancia actual del modelo reside en su nicho: es un modelo de 27B orientado a agentes de sistema operativo y administracion de servidores, un dominio donde escasean los ajustes finos publicos y donde el contexto operativo (comandos, runbooks, diagnostico) importa mas que el conocimiento general. Su licencia permisiva y su disponibilidad en Ollama facilitan su despliegue en entornos de laboratorio y produccion interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8; etiqueta `qwen3_5` en Hugging Face), con modulo MTP (`model-mtp.safetensors`) |
| Parametros totales | 27B (denominacion comercial); el recuento de safetensors reportado en el Hub es de 3.054.832, dato inconsistente con el tamano del repo (100,7 GB) y con los pesos publicados |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (BF16 presumiblemente, no confirmado), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards + MTP), GGUF (Q8_0, Q4_K_M), Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parametros completos sobre JonathanColetti/Qwen3.8-27B-Uncensored, una build comunitaria de la familia Qwen3.8. La model card no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y la presencia de un fichero `model-mtp.safetensors` de 849 MB, que corresponde a un modulo de prediccion multi-token (MTP), tipico en las arquitecturas Qwen recientes para decodificacion especulativa. No se especifica si se trata de un transformer denso o de una variante hibrida.

No se publican datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. La model card solo indica el dominio del ajuste (kernel de Linux, runbooks, ThoxOS, MeshStack) y que THOX realizo el fine-tune, el gating y las conversiones a GGUF. El modelo base es una variante "uncensored", lo que implica que el ajuste parte de pesos sin las restricciones de alineamiento del modelo original de Qwen.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento tecnico orientado a sistemas operativos: kernel de Linux, servicios, shell y diagnostico.
- Generacion y explicacion de runbooks y procedimientos operativos.
- Soporte de operaciones de ThoxOS (compilacion, diagnostico) y de MeshStack en hosts THOX.
- Capacidad de actuar como modelo profesor para destilacion hacia modelos mas pequenos de la familia ThoxOS-Kernel.
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible` en las etiquetas del Hub).
- No se declara soporte explicito de tool calling, function calling, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Asistente de administracion de sistemas Linux: el modelo puede interpretar salidas de comandos, proponer diagnosticos y generar scripts de remediacion para incidencias en servidores, aprovechando su ajuste especifico en shell y runbooks.
- Generacion de runbooks operativos: a partir de una descripcion de un servicio o de un incidente, el modelo redacta procedimientos paso a paso con comandos concretos, adecuado para equipos de SRE que necesitan documentacion repetible.
- Automatizacion de diagnostico en ThoxOS: integrado en pipelines internos, puede analizar logs de compilacion y proponer correcciones, dado que fue ajustado sobre el flujo de build y diagnostico de ThoxOS.
- Agente de operaciones en MeshStack: el modelo puede asistir en tareas de gestion de hosts THOX, generando comandos y verificaciones dentro de un bucle de agente con supervision humana.
- Destilacion de modelos mas pequenos: su papel declarado como teacher permite generar datos sinteticos de dominio (preguntas y respuestas sobre kernel y sysadmin) para entrenar variantes ligeras desplegables en el borde.
- Laboratorio de investigacion en modelos "uncensored": al partir de una build sin alineamiento y con licencia Apache 2.0, sirve para estudiar comportamiento de modelos de dominio sin restricciones de uso comercial.
- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (16,5 GB) puede ejecutarse en GPUs de consumo alto o en equipos con suficiente memoria unificada, util para pruebas offline de procedimientos de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un estado "GATE-PASSED" bajo el criterio de "final-answer scope" (2026-11-01) y un veredicto "HELD" para "raw-completion", pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 55-60 GB en BF16 (pesos safetensors de ~54,7 GB mas overhead), ~30 GB en Q8_0 y ~17-18 GB en Q4_K_M.
- GPU recomendadas: A100 80 GB o H100 para BF16; A100 40 GB o L40S para Q8_0; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M.
- Cabe en GPU de consumo: si, en Q4_K_M con 24 GB de VRAM; en Q8_0 requiere GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxos-kernel-27b`), llama.cpp / Llama (`llama serve -hf Thox-ai/ThoxOS-Kernel-27B:Q4_K_M`), y servidores compatibles con la API de OpenAI. No se confirma soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOS-Kernel-27B | 27B | no disponible | Apache 2.0 | Kernel y sysadmin (ingles) | safetensors + GGUF, Ollama |
| Qwen3.8-27B-Uncensored (base) | 27B | no disponible | no disponible | General, sin alineamiento | Hugging Face |
| Qwen3 (familia) | 27B aprox. | no disponible | Apache 2.0 (segun variante) | General y codigo | Hugging Face, Ollama |
| Modelos de dominio sysadmin publicos | variable | no disponible | variable | Sysadmin | no disponible |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible, ya que no se publican benchmarks del modelo ni de su base en esta ficha.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta evaluado.
- El modelo base es una build "uncensored", por lo que puede producir contenido sin los filtros de seguridad habituales; requiere moderacion externa en produccion.
- Riesgo de alucinacion en comandos y procedimientos: un comando de shell incorrecto puede causar dano en sistemas reales; se recomienda validacion humana y entornos de prueba.
- El estado de evaluacion es ambiguo: el criterio "final-answer scope" paso las puertas, pero el veredicto "raw-completion" figura como HELD; el rendimiento real puede diferir del declarado.
- No se publican datos de contexto maximo, composicion del dataset ni tecnicas de alineamiento, lo que dificulta estimar el comportamiento fuera del dominio.
- El recuento de parametros del Hub (3.054.832) es inconsistente con el tamano del repo y con la denominacion 27B; conviene verificar los pesos antes de desplegar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base comunitario puede arrastrar obligaciones adicionales no documentadas en esta ficha.
- No se declaran resultados de cualificacion de dispositivos ("no device-qualification results are claimed"), por lo que el rendimiento en hardware concreto no esta garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-27B
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Ollama: `ollama run Thox-ai/thoxos-kernel-27b`
- Repositorio de pesos GGUF: https://huggingface.co/Thox-ai/ThoxOS-Kernel-27B/tree/main
- No se han encontrado papers, blogs o demos adicionales en la informacion disponible.
