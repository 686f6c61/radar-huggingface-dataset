# yassintamerr/smolvlm2-2.2b-chartqa-lora

## Resumen

`yassintamerr/smolvlm2-2.2b-chartqa-lora` es un ajuste fino mediante LoRA y SFT (supervised fine-tuning) del modelo multimodal `HuggingFaceTB/SmolVLM2-2.2B-Instruct`, desarrollado por el usuario yassintamerr y publicado en Hugging Face. El nombre del repositorio sugiere que el ajuste se ha orientado a tareas de *chart question answering* (ChartQA), es decir, responder preguntas sobre graficos y tablas a partir de una imagen. El modelo hereda la arquitectura y el tamano del modelo base SmolVLM2, un vision-language model compacto de aproximadamente 2.2 mil millones de parametros disenado por Hugging Face.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador LoRA de un modelo pequeno y desplegable en hardware de consumo, especializado en un dominio estrecho (comprension de graficos). Sin embargo, la informacion publicada es muy escasa: no hay model card detallada, no se especifican hiperparametros de entrenamiento, dataset, metricas ni licencia, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. El tamano del repo aparece como 0.0 GB, lo que sugiere que los pesos del adaptador podrian no estar subidos o que la informacion esta incompleta.

En consecuencia, esta ficha se construye a partir de los datos del modelo base y de las etiquetas del repositorio, marcando explicitamente como "no disponible" todo aquello que el autor no ha documentado. No se deben asumir capacidades o rendimientos no verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (heredada de SmolVLM2-2.2B-Instruct); ajuste mediante LoRA sobre el modelo base |
| Parametros totales | 2.2B (modelo base); parametros del adaptador LoRA no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el modelo base admite cuantizaciones estandar (no confirmado para este adaptador) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin especificar) |
| Formato de pesos | Safetensors (tag `safetensors`); adaptador LoRA entrenado con TRL |
| Modelo base | HuggingFaceTB/SmolVLM2-2.2B-Instruct |
| Framework de entrenamiento | TRL 1.17.1, Transformers 5.22.2, PyTorch 2.14.1+cu130, Datasets 5.1.0, Tokenizers 0.23.3 |
| Metodo de ajuste | SFT (supervised fine-tuning) con LoRA |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del SmolVLM2-2.2B-Instruct, un vision-language model de Hugging Face que combina un encoder visual con un modelo de lenguaje de ~2.2B parametros. El ajuste se ha realizado con TRL mediante SFT y la tecnica LoRA, lo que implica que solo se entrenan matrices de baja dimensionalidad y que el resto de pesos del modelo base permanece congelado. El nombre del repositorio indica que el dataset de entrenamiento esta relacionado con ChartQA, un benchmark de preguntas y respuestas sobre graficos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango de LoRA, la tasa de aprendizaje, el numero de pasos ni si se aplicaron tecnicas adicionales como DPO o RLHF. La model card generada automaticamente por TRL no incluye estos detalles. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto y respuestas a preguntas, heredadas del modelo base SmolVLM2-2.2B-Instruct.
- Comprension de imagenes y documentos visuales, incluyendo graficos y tablas (presumiblemente reforzada por el ajuste en ChartQA).
- Razonamiento visual basico sobre figuras y diagramas.
- Soporte de conversaciones multi-turno (formato de chat con roles `user`/`assistant`).
- Capacidad de *tool calling* o *function calling*: no documentada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; dependen del modelo base.
- Modo *thinking*, vision avanzada o audio: no documentados.

## Casos de uso

- **Extraccion de datos de graficos en informes**: el modelo puede recibir una imagen de un grafico de barras o lineas y responder preguntas sobre valores, tendencias o comparaciones, aprovechando el ajuste especifico en ChartQA. Es adecuado por su especializacion y su tamano reducido.
- **Automatizacion de analisis de dashboards**: integrado en un pipeline que capture capturas de pantalla de paneles de control y genere resumenes en lenguaje natural de las metricas visibles.
- **Asistencia a periodistas de datos**: responder preguntas sobre graficos publicados en articulos o informes para verificar afirmaciones numericas de forma rapida.
- **Accesibilidad de contenido visual**: generar descripciones textuales de graficos para usuarios con discapacidad visual, aunque la calidad no esta validada.
- **Prototipado rapido en entornos con recursos limitados**: al ser un modelo de 2.2B con adaptador LoRA, puede ejecutarse en GPUs de consumo para pruebas de concepto de VQA sobre documentos.
- **Evaluacion comparativa de tecnicas de fine-tuning**: servir como ejemplo reproducible de ajuste LoRA con TRL sobre un VLM pequeno para experimentos academicos o docentes.
- **Preprocesamiento de documentos financieros**: responder preguntas sobre graficos de resultados trimestrales en un pipeline de analisis documental, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo base de 2.2B parametros, en precision fp16 requeriria aproximadamente 4.4-5 GB solo para pesos, mas overhead de activaciones y encoder visual; en cuantizacion de 8 bits podria rondar 2.5-3 GB y en 4 bits alrededor de 1.5-2 GB. Estas cifras son estimaciones basadas en el tamano del modelo base, no en mediciones publicadas para este adaptador.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput.
- **¿Cabe en GPU de consumo?**: si, previsiblemente en GPUs con 8 GB o mas de VRAM en cuantizacion, y en 12-16 GB en fp16.
- **Opciones de despliegue**: transformers (pipeline de texto o vision), vLLM, TGI, llama.cpp/Ollama si se convierte a GGUF (no confirmado para este adaptador), y endpoints compatibles (tag `endpoints_compatible`).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yassintamerr/smolvlm2-2.2b-chartqa-lora | 2.2B (base) + LoRA | No disponible | No disponible | Hugging Face | Ajuste especializado en ChartQA; documentacion escasa |
| HuggingFaceTB/SmolVLM2-2.2B-Instruct | 2.2B | No disponible | No disponible en la informacion | Hugging Face | Modelo base multimodal de referencia |
| SmolVLM2-500M-Instruct | ~0.5B | No disponible | No disponible en la informacion | Hugging Face | Variante mas pequena de la familia SmolVLM2 |
| SmolVLM2-2.2B (variantes oficiales) | 2.2B | No disponible | No disponible en la informacion | Hugging Face | Alternativas oficiales sin ajuste en ChartQA |

La comparativa se limita a la familia SmolVLM2 porque no se dispone de datos de rendimiento del adaptador que permitan comparaciones cuantitativas con otros VLM especializados en graficos.

## Limitaciones y advertencias

- **Documentacion insuficiente**: la model card no especifica dataset, hiperparametros, metricas ni limitaciones, lo que impide evaluar su calidad de forma rigurosa.
- **Licencia no definida**: el campo de licencia aparece como `license` sin valor concreto, lo que genera incertidumbre sobre el uso comercial. Se debe contactar con el autor o consultar la licencia del modelo base antes de usarlo en produccion.
- **Riesgo de alucinacion**: como todo VLM, puede inventar valores numericos o interpretar mal ejes y leyendas en graficos complejos.
- **Sesgos**: no documentados; hereda los sesgos del modelo base y del dataset de ajuste, que no se especifica.
- **Limitaciones de contexto e idioma**: no documentadas; el rendimiento multilingue es desconocido.
- **Repositorio con 0 descargas y 0 likes**: no hay evidencia de uso o validacion por parte de la comunidad.
- **Tamano del repo 0.0 GB**: podria indicar que los pesos del adaptador no estan correctamente subidos o que la informacion esta incompleta; verificar antes de intentar cargarlo.
- **Especializacion estrecha**: el ajuste en ChartQA puede degradar capacidades generales del modelo base fuera del dominio de graficos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yassintamerr/smolvlm2-2.2b-chartqa-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Curso de ajuste fino de SmolVLM2 (Hugging Face): https://huggingface.co/learn/smol-course/unit4/4
- Repositorio TRL: https://github.com/huggingface/trl
