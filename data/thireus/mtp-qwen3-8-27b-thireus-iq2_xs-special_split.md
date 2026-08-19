# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ2_XS-SPECIAL_SPLIT

## Resumen

El modelo `mtp-Qwen3.8-27B-THIREUS-IQ2_XS-SPECIAL_SPLIT` es una cuantización GGUF en formato IQ2_XS (2 bits) del modelo base Qwen3.8-27B, creada por el usuario Thireus mediante su suite de herramientas GGUF. Esta cuantización extrema reduce drásticamente el tamaño del modelo para permitir su ejecución en hardware con poca memoria, a costa de una pérdida significativa de calidad. El nombre "mtp" sugiere una posible relación con multi-token prediction, aunque no se confirma en la información disponible.

El modelo se publica bajo licencia MIT, lo que permite uso comercial sin restricciones. Al ser una cuantización de muy baja precisión, está pensada para entornos donde la eficiencia de memoria es prioritaria sobre la fidelidad de salida, como prototipos, pruebas o despliegues en GPU de gama baja. No se dispone de datos sobre el pipeline, idiomas soportados ni benchmarks específicos para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B) |
| Parametros totales | 27 mil millones (segun nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 262k segun fuentes externas, no confirmado para esta cuantizacion) |
| Tipos de cuantizacion | IQ2_XS (GGUF, ~2 bits) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (IQ2_XS) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen3.8-27B, un transformer autoregresivo con 27 mil millones de parametros. La cuantizacion IQ2_XS reduce los pesos a aproximadamente 2 bits por parametro, lo que produce un archivo de unos 7-8 GB, frente a los ~54 GB del BF16 original. Thireus ha desarrollado una suite de herramientas GGUF que aplica esquemas de cuantizacion avanzados, como se observa en otras variantes publicadas por el mismo autor (BF16, IQ2_K_R4, etc.). No se dispone de informacion sobre el entrenamiento original del modelo base, ni sobre tecnicas como RLHF o DPO aplicadas a esta cuantizacion.

## Capacidades

- Generacion de texto y completado de secuencias, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y comprension del lenguaje, aunque la cuantizacion extrema puede degradar notablemente estas capacidades.
- No se confirma soporte para tool calling, vision, audio u otras modalidades en esta variante especifica.
- El modelo base podria incluir un encoder de vision segun fuentes externas, pero no se ha verificado su funcionamiento tras la cuantizacion IQ2_XS.
- Capacidades multilingues no documentadas para esta cuantizacion.

## Casos de uso

- Ejecucion local en GPU con 8-10 GB de VRAM: la cuantizacion IQ2_XS permite cargar el modelo en tarjetas como RTX 3060 12GB o RTX 4060 Ti 16GB, ideal para experimentos personales o demos sin acceso a hardware profesional.
- Prototipado rapido de aplicaciones de chat o generacion de texto: al ocupar poco espacio, se puede integrar en entornos de desarrollo con recursos limitados.
- Pruebas de concepto en entornos edge o embebidos: el tamaño reducido facilita su despliegue en dispositivos con restricciones de almacenamiento.
- Investigacion sobre el impacto de cuantizaciones extremas: permite estudiar la degradacion de calidad frente a versiones BF16 o FP16 del mismo modelo.
- Generacion de contenido offline: para tareas donde la latencia no es critica y se prioriza la privacidad, sin depender de APIs externas.
- Fine-tuning o adaptacion posterior: aunque la cuantizacion fija los pesos, se puede usar como base para tecnicas como LoRA si se descarga la version BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de perplejidad, MMLU, HumanEval u otras metricas para esta cuantizacion especifica. El autor menciona en otras variantes comparaciones de perplejidad, pero no se incluyen en la ficha de este modelo.

## Requisitos de hardware

- VRAM estimada: ~7-8 GB para el archivo GGUF IQ2_XS, mas overhead de ejecucion (contexto, buffers), por lo que se recomienda al menos 10 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 3080 10GB, o GPUs profesionales con 12 GB o mas.
- En CPU: puede ejecutarse con llama.cpp u Ollama, pero la velocidad sera baja; se recomienda al menos 16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtp-Qwen3.8-27B-THIREUS-IQ2_XS (este) | 27B | IQ2_XS (~2 bits) | No disponible | MIT | HuggingFace |
| mtp-Qwen3.8-27B-THIREUS-BF16 | 27B | BF16 | No disponible | MIT | HuggingFace |
| mtp-Qwen3.5-27B-THIREUS-IQ2_K_R4 | 27B | IQ2_K_R4 | No disponible | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes. La eleccion entre ellas depende del equilibrio entre calidad y uso de memoria: BF16 ofrece maxima fidelidad pero requiere ~54 GB, mientras que IQ2_XS sacrifica calidad para caber en GPUs de consumo.

## Limitaciones y advertencias

- La cuantizacion IQ2_XS es una de las mas agresivas disponibles; la perdida de calidad es notable en tareas de razonamiento complejo, generacion de codigo y coherencia a largo plazo.
- Riesgo elevado de alucinaciones y respuestas incoherentes debido a la baja precision de los pesos.
- No se ha verificado el soporte de vision u otras modalidades en esta cuantizacion, aunque el modelo base podria incluirlas.
- La longitud de contexto real puede verse reducida por limitaciones de memoria al usar cuantizaciones extremas.
- Licencia MIT permite uso comercial, pero el modelo base Qwen3.8-27B podria tener condiciones adicionales (Apache 2.0 segun fuentes externas); se recomienda revisar la licencia del checkpoint original.
- No se dispone de informacion sobre sesgos o comportamientos especificos de esta variante.

## Enlaces

- HuggingFace: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ2_XS-SPECIAL_SPLIT
- Variante BF16 del mismo autor: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT
- Variante IQ2_K_R4: https://huggingface.co/Thireus/mtp-Qwen3.5-27B-THIREUS-IQ2_K_R4-SPECIAL_SPLIT
- Coleccion de modelos de Thireus: https://gguf.thireus.com/
- Articulo sobre Qwen3.8-27B (specs y hardware): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guia para ejecutar Qwen3.8-27B localmente: https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
