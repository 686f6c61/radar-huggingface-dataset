# xw17/gemma-2-2b-it_SFT_lora_wesad

## Resumen

xw17/gemma-2-2b-it_SFT_lora_wesad es un adaptador de ajuste fino con LoRA sobre el modelo instructivo google/gemma-2-2b-it, publicado por el usuario xw17 en HuggingFace. El nombre del repositorio indica dos cosas: que se ha aplicado un ajuste supervisado (SFT) mediante LoRA y que el corpus de entrenamiento está relacionado con WESAD, un conjunto de datos multimodal de detección de estrés y afecto con señales fisiológicas de wearables. El repositorio ocupa 0,1 GB y contiene pesos en formato safetensors, un tamaño coherente con adaptadores LoRA y no con un modelo completo de 2,6 mil millones de parámetros.

La relevancia de esta publicación es limitada pero ilustrativa: muestra un patrón cada vez más común de reutilizar un modelo de lenguaje pequeño y abierto para tareas de clasificación o interpretación de datos de sensores, en lugar de entrenar arquitecturas específicas desde cero. Gemma 2 2B es un transformer decoder-only de aproximadamente 2,6 mil millones de parámetros, con 8192 tokens de contexto, entrenado y destilado por Google a partir de modelos mayores de la misma familia, y con pesos abiertos bajo los términos de uso de Gemma.

La ficha del autor está generada automáticamente y no rellena ningún campo: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación, licencia ni idiomas. La búsqueda web realizada no ha devuelto ningún resultado relacionado con el modelo. Por tanto, esta ficha distingue de forma explícita entre lo que se puede inferir del identificador del repositorio y los datos públicos del modelo base, y lo que sencillamente no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptadores LoRA; el repositorio contiene el adaptador, no el modelo completo |
| Parametros totales | Aproximadamente 2,6 mil millones en el modelo base; el numero de parametros entrenados del adaptador no esta documentado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens en el modelo base Gemma 2 2B; no se documenta si el ajuste la modifica |
| Tipos de cuantizacion | No disponible para este repositorio; el modelo base admite cuantizacion de 8 y 4 bits y conversion a GGUF mediante herramientas de la comunidad |
| Idiomas soportados | No disponible en el repositorio; el modelo base esta entrenado predominantemente en ingles |
| Licencia | No disponible en el repositorio; al derivar de Gemma 2, se aplican los terminos de uso de Gemma de Google |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base Gemma 2 2B es un transformer decoder-only con atencion de ventana deslizante alternada por capas, normalizacion RMSNorm, activaciones GeGLU y un mecanismo de recorte de logits (soft-capping) que limita la magnitud de las puntuaciones de atencion y de la salida final para estabilizar el entrenamiento. Google lo entreno sobre del orden de billones de tokens, principalmente en ingles, y aplico destilacion de conocimiento desde modelos mayores de la familia Gemma 2, ademas de un ajuste posterior de tipo instruccion con tecnicas de alineacion. La variante -it incorpora ese ajuste orientado a seguir instrucciones.

Sobre esa base, el autor ha aplicado un ajuste supervisado con LoRA, segun indica el identificador del repositorio. LoRA congela los pesos originales e introduce matrices de bajo rango en determinadas proyecciones, lo que reduce drasticamente el numero de parametros entrenables y explica el tamano de 0,1 GB del repositorio. El corpus declarado implicitamente es WESAD (Wearable Stress and Affect Detection), un conjunto de datos con 15 sujetos equipados con dispositivos en pecho y muneca que registran electrocardiograma, actividad electrodermica, electromiografia, respiracion, temperatura cutanea y acelerometro, etiquetado con estados de linea base, estres, diversion y meditacion.

No hay ninguna informacion en la model card sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la formulacion de la tarea (clasificacion, generacion aumentada o serializacion de senales en texto), los hiperparametros de LoRA ni si se aplico RLHF o DPO adicional. La model card es la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]".

## Capacidades

- Generacion de texto en ingles: hereda las capacidades conversacionales e instructivas de Gemma 2 2B-it, incluyendo respuesta a preguntas, resumen y redaccion basica.
- Razonamiento de alcance limitado: al ser un modelo de 2,6 mil millones de parametros, su rendimiento en tareas de razonamiento multi-paso y matematicas es notablemente inferior al de modelos de mayor tamano.
- Generacion de codigo basica: capacidad presente en el modelo base, adecuada para fragmentos cortos y explicaciones, no para tareas complejas de ingenieria.
- Ajuste especifico sobre datos fisiologicos: el entrenamiento con WESAD sugiere una especializacion en tareas relacionadas con estres y afecto a partir de senales de wearables, aunque la naturaleza exacta de esa especializacion no esta documentada.
- Tool calling o function calling: no confirmado. El modelo base Gemma 2 no esta disenado especificamente para function calling y no se documenta ninguna capacidad anadida en ese sentido.
- Capacidades de agente y razonamiento multi-paso con uso de herramientas: no disponibles ni documentadas.
- Capacidades multilingues: no documentadas; el modelo base esta optimizado para ingles y su rendimiento en castellano es limitado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo es exclusivamente de texto; no procesa senales fisiologicas directamente salvo que el pipeline de entrenamiento las convirtiera previamente en texto, extremo que no se especifica.
- Modo de pensamiento explicito: no disponible.

## Casos de uso

- Investigacion en deteccion de estres con wearables: el adaptador puede emplearse como componente experimental en un pipeline que serialice senales fisiologicas (por ejemplo, series de actividad electrodermica o frecuencia cardiaca) como texto y solicite una clasificacion o descripcion del estado afectivo, replicando el protocolo de WESAD.
- Reproduccion academica de experimentos con WESAD: util para grupos que quieran comparar un enfoque basado en modelos de lenguaje frente a clasificadores clasicos (random forest, SVM, redes convolucionales) sobre el mismo conjunto de datos, siempre que se valide el adaptador por separado.
- Prototipado rapido de asistentes de bienestar: dado que cabe en hardware de consumo, permite construir demos de bajo coste que generen recomendaciones textuales a partir de datos de sensores, sin depender de APIs externas.
- Clasificacion de texto con vocabulario clinico o psicofisiologico: el ajuste sobre WESAD puede desplazar la distribucion de salida hacia terminologia de estres y afecto, lo que resulta util en tareas de etiquetado de diarios personales o cuestionarios.
- Educacion y docencia sobre fine-tuning: el repositorio es un ejemplo compacto de como aplicar LoRA a un modelo abierto con transformers y peft, adecuado para practicas de laboratorio sobre adaptacion de modelos.
- Experimentos de interpretabilidad: al ser un adaptador de bajo rango sobre una base pequena, permite estudiar que capas o proyecciones se modifican mas al especializar un modelo general en un dominio de sensores.
- Base para posteriores ajustes especificos: puede servir como punto de partida para un segundo ajuste con datos propios de un dominio concreto, siempre que se resuelvan las dudas de licencia y se documente correctamente el origen de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna seccion de evaluacion completada, no hay metricas sobre WESAD (exactitud, F1, AUC) ni resultados en pruebas estandar como MMLU, GSM8K o HumanEval, y la busqueda web no ha devuelto ninguna publicacion asociada.

## Requisitos de hardware

- VRAM para inferencia, modelo base en precision bf16: aproximadamente 5,2 GB solo para pesos, mas la memoria de la cache KV, lo que situa el consumo total en torno a 6-8 GB segun la longitud de contexto utilizada.
- VRAM con cuantizacion de 8 bits: en torno a 3 GB de pesos.
- VRAM con cuantizacion de 4 bits: en torno a 1,8-2 GB de pesos, lo que permite ejecucion en GPUs con 4 GB de memoria.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para precision completa (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, L4, A10G). Para 4 bits basta una RTX 3050 de 8 GB o incluso GPUs de 4-6 GB.
- Cabe en GPU de consumo: si, es uno de los modelos abiertos de la familia Gemma 2 mas adecuados para equipos de escritorio. Tambien se ejecuta en Apple Silicon (M1/M2/M3) mediante llama.cpp o MLX, y en CPU con cuantizacion agresiva, aunque con latencia alta.
- Opciones de despliegue: transformers con peft para cargar el adaptador sobre el modelo base; vLLM, que soporta adaptadores LoRA en servidor; TGI con soporte de adaptadores; conversion a GGUF previa fusion del adaptador para llama.cpp, Ollama o LM Studio.
- Latencia y throughput estimados: no disponibles, no se han publicado mediciones para este repositorio.
- Nota importante: al tratarse de un adaptador, es necesario descargar tambien el modelo base google/gemma-2-2b-it, cuyo espacio en disco y requisitos de memoria son los dominantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| xw17/gemma-2-2b-it_SFT_lora_wesad | ~2,6 mil millones (base) | 8192 tokens (base) | No disponible; hereda los terminos de Gemma | Adaptador LoRA en HuggingFace | No disponible |
| google/gemma-2-2b-it | ~2,6 mil millones | 8192 tokens | Terminos de uso de Gemma | Pesos completos en HuggingFace | Documentado por Google en la ficha oficial del modelo |
| Qwen2.5-1.5B-Instruct | ~1,5 mil millones | 32 768 tokens nativos, ampliable con YaRN | Apache 2.0 | Pesos completos en HuggingFace | Documentado por el autor |
| Llama-3.2-3B-Instruct | ~3,2 mil millones | 128 000 tokens | Licencia comunitaria de Llama 3.2 | Pesos completos en HuggingFace | Documentado por Meta |

Las cifras de parametros y contexto de los modelos comparados proceden de su documentacion publica y deben verificarse en las fichas oficiales. La comparativa relevante para este repositorio no es de rendimiento general, sino de licencia y trazabilidad: Qwen2.5 se distribuye bajo Apache 2.0, lo que facilita el uso comercial, mientras que cualquier derivado de Gemma queda sujeto a los terminos de uso de Google. No existen datos que permitan comparar la calidad del adaptador con alternativas especializadas en deteccion de estres.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla automatica y no aporta informacion sobre datos, entrenamiento, evaluacion ni uso previsto. Cualquier despliegue en produccion parte de una base documental nula.
- Riesgo de sobreajuste: WESAD contiene 15 sujetos, un tamano muy reducido. Un ajuste sobre este corpus puede no generalizar a otras poblaciones, dispositivos o condiciones de registro.
- Sesgos de dominio y demograficos: el conjunto WESAD se recogio en condiciones de laboratorio con un grupo pequeno de participantes; los patrones aprendidos reflejan ese contexto y no necesariamente el estres en entornos reales.
- Alucinacion: como modelo generativo, puede producir clasificaciones o justificaciones plausibles pero incorrectas sobre el estado afectivo, con un riesgo especialmente alto al tratarse de un modelo de 2,6 mil millones de parametros.
- Ambito de uso clinico: no debe utilizarse para diagnostico, triaje o decisiones sobre salud mental. No hay validacion clinica de ningun tipo.
- Limitacion idiomatica: el modelo base esta optimizado para ingles; el rendimiento en castellano y otros idiomas es previsiblemente bajo.
- Riesgo de fuga de datos: el repositorio no documenta si el adaptador memoriza informacion de los sujetos de WESAD, lo que exigiria una auditoria antes de cualquier uso publico.
- Incertidumbre sobre la licencia: el repositorio no declara licencia. Al derivar de Gemma 2, se aplican los terminos de uso de Gemma, que impiden usos concretos y exigen el cumplimiento de la politica de uso prohibido de Google. La ausencia de declaracion explicita genera ambiguedad legal para uso comercial.
- Trazabilidad limitada: el autor no indica la version exacta del modelo base ni la configuracion de LoRA, lo que dificulta reproducir el resultado.
- Fecha de creacion inusual en los metadatos: la ficha indica 2026-05-01 como fecha de creacion, lo que sugiere un posible error de registro o una fecha manipulada y refuerza la necesidad de tratar los metadatos con cautela.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xw17/gemma-2-2b-it_SFT_lora_wesad
- Modelo base Gemma 2 2B instruct: https://huggingface.co/google/gemma-2-2b-it
- Documentacion tecnica de Gemma 2: https://ai.google.dev/gemma/docs
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Dataset WESAD, referencia de origen de las siglas utilizadas en el nombre del modelo: https://ubicomp.eti.uni-siegen.de/home/datasets/icmi18/
- Articulo de WESAD (Schmidt et al., ICMI 2018): https://dl.acm.org/doi/10.1145/3242969.3242985
- Calculadora de impacto medioambiental en aprendizaje automatico, citada en la model card: https://mlco2.github.io/impact
- Articulo referenciado en los tags del repositorio (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo, su autor o el ajuste sobre WESAD; los unicos resultados obtenidos corresponden a paginas turisticas sobre el barrio de Santa Cruz de Sevilla y no guardan relacion con el contenido de esta ficha.
