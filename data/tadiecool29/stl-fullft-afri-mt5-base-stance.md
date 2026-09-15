# tadiecool29/STL-FullFT-afri-mt5-base-stance

## Resumen

STL-FullFT-afri-mt5-base-stance es un ajuste fino completo (full fine-tuning) del checkpoint multilingüe masakhane/afri-mt5-base, publicado por el usuario tadiecool29 en Hugging Face. El modelo resuelve una tarea única (single-task): la clasificación de postura (stance classification) en amárico, es decir, determinar la posición que un texto adopta respecto a un tema o afirmación. La arquitectura es la de mT5, un transformer encoder-decoder de tipo texto-a-texto, con 966.573.312 parámetros según los pesos en safetensors.

Su relevancia es acotada pero clara: se trata de un recurso para una lengua africana de bajos recursos, un ámbito donde escasean los modelos supervisados específicos y las líneas base reproducibles. El ajuste se realizó durante 10 épocas con AdamW fused, learning rate 3e-4, programación coseno y label smoothing de 0,1, y alcanza en el conjunto de evaluación una exactitud de 0,7195 y un Macro F1 de 0,7266.

Ahora bien, la propia model card reconoce que el conjunto de datos de entrenamiento es desconocido ("on an unknown dataset"), no documenta la composición de los datos, el formato de salida ni las limitaciones previstas, y el repositorio acumula cero descargas y cero valoraciones. Debe tratarse, por tanto, como un artefacto de investigación sin validación externa, no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia mT5/T5), generación texto-a-texto |
| Parámetros totales | 966.573.312 (recuento real de los pesos en safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; mT5 emplea embeddings de posición relativa, que permiten secuencias de longitud variable, pero no se documenta el truncamiento aplicado |
| Tipos de cuantización | No disponible; no se publican versiones cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | Amárico (etiqueta "amharic"); el checkpoint base afri-mt5 está orientado a lenguas africanas, pero no se enumera qué idiomas conserva tras el ajuste |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors |
| Modelo base | masakhane/afri-mt5-base |
| Tarea | Clasificación de postura (stance classification) en amárico, mono-tarea |
| Tamaño del repositorio | 2,0 GB |
| Librería y frameworks | Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 5.0.0, Tokenizers 0.22.2 |

## Arquitectura y entrenamiento

El modelo parte de masakhane/afri-mt5-base, un checkpoint de la familia mT5: un transformer encoder-decoder con mecanismo de atención completo y formulación texto-a-texto, en el que cada tarea se expresa como una secuencia de entrada y una secuencia de salida generada. El mT5 original emplea tokenización SentencePiece con un vocabulario de aproximadamente 250.000 tokens, pensado para cobertura multilingüe amplia. La model card no detalla la configuración exacta del checkpoint base (número de capas, dimensiones ocultas ni vocabulario final), y el recuento real de parámetros del modelo ajustado (966,6 millones) es superior al de un mT5-base estándar, lo que apunta a una configuración ampliada del checkpoint de partida; este extremo no está confirmado por el autor.

El entrenamiento consistió en un ajuste fino completo de todos los pesos durante 10 épocas, con learning rate 3e-4, tamaño de lote 16 por dispositivo y 32 efectivo (gradient accumulation de 2 pasos), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, programación coseno con 300 pasos de calentamiento, semilla 42 y label smoothing de 0,1 sobre 1.890 pasos totales. No se menciona ninguna fase de RLHF, DPO ni ajuste por preferencias: es un fine-tuning supervisado clásico. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, destilación) ni el origen, tamaño o composición del corpus de entrenamiento, que la propia model card describe como desconocido.

## Capacidades

- Clasificación de postura en amárico: la tarea principal del modelo, formulada como generación texto-a-texto en la que la salida codifica la postura detectada.
- Clasificación mono-tarea: está especializado en una única tarea; no se documenta entrenamiento multi-tarea ni capacidad de cero disparos sobre tareas nuevas.
- Generación de texto: capacidad heredada del checkpoint mT5 base, presumiblemente degradada por el ajuste completo sobre una tarea única. No hay evaluación publicada al respecto.
- Capacidades multilingües: el modelo base es multilingüe con foco africano, pero solo el amárico está respaldado por la etiqueta del repositorio y no se ha evaluado la transferencia a otras lenguas.
- Soporte de tool calling / function calling: no documentado; no se espera en un modelo de esta naturaleza.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explícito (thinking), visión, audio: no disponibles.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el formato del repositorio es desplegable mediante la infraestructura de Hugging Face.

## Casos de uso

- Análisis de opinión en redes sociales en amárico: el modelo puede etiquetar publicaciones y comentarios según su postura respecto a un tema, útil para estudios de opinión pública en comunidades de habla amárica donde apenas existen clasificadores supervisados.
- Moderación de contenido asistida: como primera pasada para señalar mensajes con posturas polarizadas en foros y plataformas, siempre con revisión humana posterior dado que no hay métricas en dominio real.
- Escucha social (social listening) a escala: integrado en un pipeline de ingesta, permite agregar la distribución de posturas sobre una marca, política pública o acontecimiento a lo largo del tiempo.
- Pre-anotación de corpus para investigación: sirve como etiquetador automático de primer nivel para acelerar el etiquetado manual de nuevos conjuntos en amárico, reduciendo el coste de anotación humana.
- Línea base académica en NLP de bajos recursos: constituye un punto de partida reproducible (semilla, hiperparámetros y curva de entrenamiento publicados) para comparar arquitecturas encoder-decoder frente a alternativas encoder-only en clasificación de postura.
- Estudio de polarización y discurso político: seguimiento de la evolución de posturas durante campañas electorales o debates públicos en medios etíopes, con la advertencia de que el modelo no está validado fuera de su distribución de entrenamiento.
- Investigación sobre ajuste completo frente a PEFT: al ser un full fine-tuning, permite estudiar el coste y el rendimiento de ajustar los 966,6 millones de parámetros frente a alternativas con LoRA sobre el mismo checkpoint base.

## Benchmarks y rendimiento

El model-index del autor no incluye resultados comparativos (la lista de resultados está vacía). Los únicos datos disponibles son las métricas internas de evaluación declaradas en la model card, obtenidas sobre un conjunto de evaluación cuya composición y tamaño no se especifican:

| Métrica | Valor (conjunto de evaluación) |
|---|---|
| Loss | 1,9808 |
| Accuracy | 0,7195 |
| Macro F1 | 0,7266 |
| Precision | 0,7238 |
| Recall | 0,7318 |

Evolución durante el entrenamiento (mejor valor de validación en la época 7, con Accuracy 0,7257 y Macro F1 0,7338):

| Época | Paso | Validation loss | Accuracy | Macro F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 1 | 189 | 2,3499 | 0,3167 | 0,2077 | 0,4175 | 0,3191 |
| 2 | 378 | 2,0643 | 0,6334 | 0,6146 | 0,6732 | 0,6714 |
| 3 | 567 | 1,9210 | 0,7157 | 0,7249 | 0,7313 | 0,7219 |
| 4 | 756 | 1,9002 | 0,7032 | 0,7087 | 0,7111 | 0,7219 |
| 5 | 945 | 1,9348 | 0,7170 | 0,7210 | 0,7206 | 0,7366 |
| 6 | 1134 | 1,9466 | 0,7207 | 0,7266 | 0,7252 | 0,7363 |
| 7 | 1323 | 1,9497 | 0,7257 | 0,7338 | 0,7333 | 0,7359 |
| 8 | 1512 | 1,9690 | 0,7170 | 0,7243 | 0,7240 | 0,7281 |
| 9 | 1701 | 1,9776 | 0,7195 | 0,7273 | 0,7257 | 0,7301 |
| 10 | 1890 | 1,9808 | 0,7195 | 0,7266 | 0,7238 | 0,7318 |

No hay comparación con otros modelos publicada por el autor ni resultados sobre un conjunto de test independiente. Tampoco se han encontrado resultados de benchmarks de terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 3,9 GB solo para los pesos; en fp16/bf16, unos 2,0 GB; en int8, en torno a 1,0 GB; en int4, aproximadamente 0,5-0,6 GB. Hay que sumar la memoria de activaciones y del runtime (típicamente 1-2 GB adicionales con lotes pequeños).
- GPU recomendadas: cabe con holgura en cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090). Para mayor rendimiento en servidor, A100, H100 o L40S permiten lotes grandes y mayor paralelismo.
- ¿Cabe en GPU de consumo? Sí. Con cuantización a 8 bits o 4 bits podría ejecutarse incluso en GPUs de 4-6 GB, aunque no se publican pesos cuantizados y habría que generarlos.
- Opciones de despliegue: carga directa con transformers (pipeline de text2text-generation), despliegue gestionado mediante Hugging Face Inference Endpoints (el repositorio está marcado como endpoints_compatible), y servidores de inferencia como TGI o vLLM, que soportan arquitecturas encoder-decoder de la familia T5. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF por cuenta propia, ya que no existen versiones publicadas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición, y la decodificación texto-a-texto para una tarea de clasificación añade coste frente a un clasificador encoder-only.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STL-FullFT-afri-mt5-base-stance | 966,5 M | No disponible | Clasificación de postura en amárico (texto-a-texto) | AFL-3.0 | Hugging Face, 0 descargas, 0 valoraciones |
| masakhane/afri-mt5-base | No disponible | No disponible | Modelo base multilingüe africano | No disponible en la información consultada | Hugging Face |
| google/mt5-base | ~580 M | No disponible (embeddings relativos) | Modelo base multilingüe texto-a-texto | Apache-2.0 | Hugging Face, ampliamente utilizado |
| FacebookAI/xlm-roberta-base | ~278 M | 512 tokens | Encoder multilingüe para clasificación | MIT | Hugging Face, ampliamente utilizado |

Comparativa de rendimiento: no disponible. No existen métricas públicas que permitan contrastar este ajuste con alternativas encoder-only o con otros ajustes de stance en amárico dentro de la información proporcionada. La ventaja diferencial del modelo es su especialización en una tarea y una lengua concretas; su desventaja, la ausencia de documentación, validación externa y adopción por la comunidad.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente que el ajuste se hizo sobre un conjunto no identificado, por lo que no puede evaluarse la cobertura de dominio, la representatividad ni los sesgos presentes en los datos.
- Sesgos conocidos: no documentados. Al no conocerse la procedencia de los datos ni la distribución de etiquetas, existe riesgo de sesgo de dominio (probablemente redes sociales o prensa) y de sobrerrepresentación de determinados temas o posturas.
- Riesgo de alucinación: el modelo genera texto libre, no una distribución de probabilidad sobre etiquetas cerradas. Puede producir salidas fuera del conjunto esperado, por lo que cualquier uso en producción requiere validación y parseo estricto de la respuesta.
- Métricas solo internas: los valores de Accuracy y Macro F1 proceden de un conjunto de evaluación sin descripción y sin separación de un conjunto de test independiente. No deben interpretarse como rendimiento esperado en producción.
- Sin validación de la comunidad: cero descargas y cero valoraciones; no hay informes de terceros que confirmen o refuten el comportamiento declarado.
- Cobertura lingüística incierta: solo el amárico está respaldado por la etiqueta del repositorio. La transferencia a otras lenguas africanas del modelo base no ha sido evaluada y el ajuste completo puede haber degradado esa capacidad.
- Longitud de contexto no documentada: se desconoce el truncamiento aplicado durante el entrenamiento y la evaluación. Textos largos (hilos, artículos) podrían recortarse y perder la información relevante para determinar la postura.
- Licencia AFL-3.0: es una licencia aprobada por la OSI que permite uso comercial, modificación y redistribución, con obligaciones de atribución, concesión de patentes y condiciones de licencia recíproca para obras derivadas. Conviene revisar el texto completo de la licencia antes de integrar el modelo en un producto comercial.
- Entorno de ejecución: el checkpoint se generó con versiones muy recientes (Transformers 5.0.0, PyTorch 2.10.0+cu128); puede requerir actualizar dependencias para una carga reproducible.
- Uso responsable: no debe emplearse para decisiones automatizadas de alto impacto (moderación definitiva, perfilado de usuarios, decisiones legales) sin supervisión humana y sin una evaluación previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/STL-FullFT-afri-mt5-base-stance
- Modelo base en Hugging Face: https://huggingface.co/masakhane/afri-mt5-base
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Los enlaces devueltos por el buscador corresponden a páginas de soporte de Microsoft (inicio de sesión en Hotmail, cierre de sesión en Outlook y actualizaciones de seguridad de Exchange Server) y no guardan relación con el modelo.
- Paper, repositorio de código, demo o blog del autor: no disponibles en la información proporcionada.
