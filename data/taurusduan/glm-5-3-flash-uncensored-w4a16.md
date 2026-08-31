# taurusduan/GLM-5.3-Flash-UNCENSORED-W4A16

## Resumen

GLM-5.3-Flash-UNCENSORED-W4A16 es una modificacion directa de pesos (abliteration) sobre el modelo GLM-5.3-Flash de Z.AI, cuantizado a INT4 W4A16 por JANGQ-AI. El objetivo es eliminar el comportamiento de rechazo (refusal) del modelo original sin recurrir a fine-tuning, LoRA, hooks en tiempo de ejecucion ni trucos de prompt: la edicion se aplica de forma permanente en los tensores residual-writer en bf16, mientras que los expertos enrutados cuantizados y la torre de vision pasan intactos. El resultado es un modelo que responde de forma directa a peticiones que el modelo base rechazaria, manteniendo las capacidades de razonamiento, vision y prediccion multi-token (MTP).

El modelo base, GLM-5.3-Flash, es un MoE de 321B parametros totales con 18B activos, arquitectura glm5_next de 46 capas con atencion lineal hibrida KDA y atencion dispersa DSA, y ventana de contexto de 131072 tokens. Esta version concreta, publicada por el usuario taurusduan bajo licencia MIT, es la segunda iteracion (v2) de un trabajo previo que corrige problemas de bucles de razonamiento en prompts de rechazo duro. Su relevancia radica en que ofrece un modelo sin censura a nivel de pesos, con rendimiento medido en MMLU identico al baseline (85.58 %) y una tasa de cumplimiento en HarmBench del 90-93 %, lo que lo hace util para investigacion en seguridad de IA, red-teaming y aplicaciones donde se requiera una respuesta sin filtros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next (MoE, 46 capas, atencion lineal hibrida KDA + atencion dispersa DSA, torre de vision) |
| Parametros totales | 321.323.031.390 (321B) |
| Parametros activos | 18B (segun datos publicados del modelo base) |
| Longitud de contexto | 131072 tokens |
| Tipos de cuantizacion | W4A16 (INT4 group-32 packed, solo expertos enrutados; atencion o_proj y down_proj de experto compartido en bf16) |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (con configuracion compressed-tensors para vLLM) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero ni fine-tuneado: es una edicion directa de pesos sobre el checkpoint cuantizado JANGQ-AI/GLM-5.3-Flash-W4A16, que a su vez deriva de zai-org/GLM-5.3-Flash. La modificacion (denominada CRACK por el autor) altera los tensores residual-writer en bf16, donde reside el comportamiento de rechazo, sin tocar los expertos enrutados cuantizados ni la torre de vision. No se utilizan LoRA, adaptadores ni parches en tiempo de ejecucion.

El modelo base GLM-5.3-Flash emplea una arquitectura glm5_next con 46 capas, atencion lineal hibrida KDA (kernel-based linear attention) y atencion dispersa DSA (dynamic sparse attention), junto con un encoder de vision tipo GLM-4.1V y una cabeza MTP (multi-token prediction) que permite decodificacion especulativa. Los datos de entrenamiento del modelo base no estan disponibles en la informacion proporcionada, aunque por su tamano y capacidades se infiere un corpus multilingue extenso. La cuantizacion W4A16 aplica INT4 con group_size=32 unicamente a los expertos enrutados, manteniendo precision bf16 en las proyecciones de atencion y el experto compartido, donde reside la edicion CRACK.

## Capacidades

- Generacion de texto y razonamiento multilingue en 10 idiomas (ingles, chino, ruso, serbio, hindi, frances, espanol, arabe, coreano, japones).
- Razonamiento multi-step con niveles de esfuerzo configurables (off, low, max) mediante el parser de razonamiento glm45.
- Soporte de tool calling y function calling via parser glm45 integrado en vLLM.
- Capacidades multimodales: acepta entradas de imagen a traves de la torre de vision GLM-4.1V (conservada intacta).
- Prediccion multi-token (MTP) para decodificacion especulativa: tasa de aceptacion medida del 81.8 % en pruebas del autor.
- Comportamiento sin rechazo (uncensored): responde directamente a peticiones que el modelo base rechazaria, con una tasa de cumplimiento del 90.6 % (effort off) y 92.8 % (effort max) en HarmBench-320.
- Edicion de pesos permanente: no requiere jailbreaks, system prompts especiales ni parches en tiempo de ejecucion.

## Casos de uso

- Investigacion en seguridad de IA y red-teaming: el modelo permite estudiar el comportamiento de modelos sin restricciones de seguridad, evaluar la eficacia de tecnicas de abliteration y disenar contramedidas. Su tasa de cumplimiento controlada y su MMLU identico al baseline lo hacen adecuado para medir el impacto de la eliminacion de rechazos en la capacidad general.
- Generacion creativa sin restricciones: escritores y creadores pueden explorar narrativas, dialogos o contenido que modelos censurados bloquean, como escenas de violencia explicita en ficcion o temas tabu. La ausencia de rechazos permite flujos de trabajo ininterrumpidos.
- Desarrollo de asistentes para dominios sensibles: aplicaciones de rol, simulacion de escenarios de crisis o entrenamiento de personal en situaciones extremas donde se necesitan respuestas directas sin evasivas.
- Evaluacion de alineacion y sesgos: al comparar las respuestas de este modelo con las del original, los investigadores pueden identificar que comportamientos elimina la abliteration y como afecta a la utilidad y la seguridad.
- Servicio de inferencia de alto rendimiento con MTP: el modelo alcanza ~153 tok/s en 8x H200 con CUDA graphs y MTP activado, lo que lo hace util para despliegues que requieren baja latencia en tareas de generacion larga.
- Pruebas de robustez de sistemas de moderacion: equipos de seguridad pueden usar este modelo como generador de contenido problematico para entrenar o evaluar clasificadores de contenido.

## Benchmarks y rendimiento

El autor proporciona dos conjuntos de mediciones:

| Prueba | Resultado | Comparacion con baseline |
|---|---|---|
| MMLU (overall, 1026 preguntas) | 85.58 % (897/1026) | +0.00 pp respecto al baseline GLM-5.3-regular |
| HarmBench-320 (TRUE_COMPLY, effort off) | 90.6 % (290/320) | no disponible |
| HarmBench-320 (TRUE_COMPLY, effort max) | 92.8 % (297/320) | no disponible |
| MTP draft acceptance | 81.8 % (459/561) | no disponible |
| Throughput (TP8, 8x H200, MTP + CUDA graphs) | ~153 tok/s | no disponible |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 194.7 GB en disco. Con cuantizacion W4A16, se estima un uso de VRAM de ~200 GB para los pesos, mas overhead de activaciones y KV cache. Se recomienda un minimo de 8x 80 GB (A100/H100) o 8x H200 (141 GB cada una).
- GPU recomendadas: 8x H200 para el despliegue medido por el autor (TP8). Alternativamente, 8x A100 80 GB pueden funcionar con una ventana de contexto reducida.
- No cabe en GPUs de consumo: el modelo requiere al menos 160 GB de VRAM en configuracion minima, por lo que no es viable en RTX 4090, RTX 5090 o similares.
- Opciones de despliegue: vLLM es el backend recomendado, con soporte para Marlin int4 (CompressedTensorsWNA16MoEMethod), CUDA graphs, prefix caching y MTP especulativo. No se menciona compatibilidad con llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: ~153 tok/s en single-stream con MTP + CUDA graphs; 12.8 tok/s si se usa --enforce-eager (12 veces mas lento, desaconsejado en produccion).

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | MMLU |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-UNCENSORED-W4A16 (este) | 321B | 18B | 131072 | W4A16 (INT4) | MIT | 85.58 % |
| GLM-5.3-Flash (original) | 321B | 18B | 131072 | bf16 | MIT | no disponible |
| hell0ks/GLM-5.3-Flash-Uncensored-AWQ | 321B | 18B | 131072 | AWQ (W4A16) | MIT | no disponible |

Ambas versiones uncensored (esta y la AWQ de hell0ks) parten del mismo modelo base y aplican tecnicas de abliteration, pero con metodos de cuantizacion distintos. La version W4A16 de taurusduan conserva la atencion y el experto compartido en bf16, mientras que la AWQ cuantiza todo el modelo. No se dispone de datos comparativos de rendimiento entre ambas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del modelo base GLM-5.3-Flash, que no estan documentados en la informacion proporcionada. La abliteration puede amplificar ciertos sesgos al eliminar los mecanismos de rechazo que actuaban como filtro.
- Riesgo de alucinacion: no se han publicado metricas de factuality. Como todo modelo generativo, puede producir informacion falsa o inventada, y al no tener rechazos, es mas probable que presente dicha informacion con confianza.
- Limitaciones de contexto e idioma: la ventana de 131072 tokens es amplia pero puede degradarse en contextos muy largos. Los 10 idiomas soportados cubren los principales, pero el rendimiento en idiomas minoritarios no esta garantizado.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero el modelo es una modificacion de un modelo con licencia MIT, por lo que no hay restricciones adicionales conocidas. Sin embargo, el uso de contenido generado sin censura puede violar legislaciones locales sobre contenido ilegal.
- Riesgo de contenido danino: al eliminar los rechazos, el modelo puede generar instrucciones para actividades ilegales, violencia, discurso de odio o material de abuso. Es responsabilidad del desplegador implementar medidas de seguridad externas (filtros, moderacion) si se usa en produccion.
- Problemas de copyright: el autor documenta casos de reproduccion de letras de canciones (patron "ooh, ooh, ooh" / "I'm, I'm, I'm") que pueden constituir infraccion de derechos de autor.
- Requisitos de despliegue: el modelo requiere un cluster de 8 GPUs de alta gama, lo que limita su uso a organizaciones con infraestructura dedicada. El uso de --enforce-eager degrada el rendimiento drasticamente (12x), por lo que es obligatorio usar CUDA graphs para un servicio viable.
- Configuracion fragil: el autor advierte que el config.json incluido corrige un problema de regex en la configuracion de cuantizacion del checkpoint original; sin esta correccion, vLLM no despacharia correctamente los kernels Marlin.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taurusduan/GLM-5.3-Flash-UNCENSORED-W4A16
- Modelo base cuantizado: https://huggingface.co/JANGQ-AI/GLM-5.3-Flash-W4A16
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Version uncensored alternativa (AWQ): https://huggingface.co/hell0ks/GLM-5.3-Flash-Uncensored-AWQ
- Articulo sobre GLM-5.3-Flash Uncensored: https://www.explainx.ai/blog/orcarouter-glm-5-3-flash-uncensored-block-fp8-august-2026
- Repositorio GitHub del cliente de escritorio GLM-5.3-Flash: https://github.com/glm-5-3-flash/glm-5.3-flash
- Space de demostracion (requiere endpoint propio): https://huggingface.co/spaces/xariam/GLM-5.3-Flash-Uncensored
