# trxcc2002/DEAL-WS-Gemma

## Resumen

DEAL-WS-Gemma es un modelo multimodal de tipo image-text-to-text publicado por el usuario trxcc2002 en Hugging Face, derivado de la familia Gemma (la etiqueta del repositorio indica "gemma4") y entrenado con una metodología de self-reward en el marco del proyecto SRE-DEAL. El checkpoint corresponde al paso 124 (step-124) del escenario denominado WSClaw, dentro de la variante DEAL-WS. El repositorio contiene los pesos completos en Safetensors junto con el tokenizer, la plantilla de chat y las configuraciones de modelo y procesador, pero no incluye estado del optimizador ni estado de reanudación del entrenamiento.

El modelo cuenta con 7.518.069.034 parámetros (aproximadamente 7,5 mil millones), lo que lo sitúa en la gama de modelos compactos aptos para despliegue en hardware de gama alta de consumo. El tamaño del repositorio es de 15,1 GB, coherente con pesos en precisión bf16/fp16. La pipeline declarada es image-text-to-text, lo que confirma capacidades multimodales de entrada (imagen y texto) con salida de texto.

La relevancia de esta publicación es limitada y muy específica: se trata de un checkpoint de investigación de un proyecto personal, sin métricas publicadas, sin licencia declarada y sin información sobre idiomas soportados. Resulta útil como referencia para quienes sigan la metodología SRE-DEAL o el escenario WSClaw, pero no como modelo de producción sin una evaluación previa exhaustiva por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Gemma ("gemma4" segun tags); detalles internos no disponibles |
| Parametros totales | 7.518.069.034 (aproximadamente 7,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos Safetensors sin convertir) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos completos, tokenizer, chat template y configuraciones en la raiz del repositorio) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: se trata de un modelo de la familia Gemma con pipeline image-text-to-text, es decir, un transformer multimodal que acepta imagenes y texto y genera texto. El tag "gemma4" sugiere una base de la cuarta generacion de la familia Gemma, aunque no se proporcionan especificaciones de capas, dimensiones ocultas, mecanismo de atencion ni codificador visual.

El entrenamiento se enmarca en el proyecto SRE-DEAL, con una metodologia de self-reward (el modelo genera y evalua sus propias recompensas) aplicada al escenario WSClaw dentro de la variante DEAL-WS. El checkpoint publicado corresponde al paso 124 del entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: la presencia de chat template y el tag "conversational" indican soporte para dialogos multi-turno.
- Entrada multimodal image-text-to-text: el modelo acepta imagenes junto con texto como entrada, segun la pipeline declarada.
- Razonamiento auto-evaluado: el entrenamiento con self-reward sugiere capacidad de generar y puntuar sus propias respuestas, aunque no se documenta su eficacia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre self-reward: el modelo sirve como checkpoint de referencia para estudiar la metodologia SRE-DEAL y comparar el comportamiento del paso 124 frente a otros checkpoints del mismo proyecto.
- Experimentos de evaluacion multimodal: al aceptar imagen y texto, puede emplearse en pruebas controladas de descripcion de imagenes o respuesta a preguntas visuales, siempre validando los resultados manualmente.
- Reproduccion de experimentos: el repositorio incluye pesos verificados con checksums en `RELEASE-MANIFEST.json`, lo que facilita la reproducibilidad de resultados en entornos de investigacion.
- Prototipado de asistentes conversacionales: la plantilla de chat permite integrarlo en pipelines de transformers para pruebas de dialogo multi-turno en fase de desarrollo.
- Fine-tuning posterior: con 7,5 mil millones de parametros y pesos en Safetensors, es viable como base para ajuste fino en tareas especificas con hardware de gama alta.
- Docencia y formacion: util como ejemplo practico de modelo multimodal de tamano medio para explicar pipelines image-text-to-text con la libreria transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,5 mil millones de parametros, en bf16/fp16 se requieren aproximadamente 15 GB solo para los pesos, mas memoria para el codificador visual, el KV cache y activaciones; en cuantizacion de 8 bits, alrededor de 8-9 GB, y en 4 bits, alrededor de 5-6 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en precision completa sin restricciones; RTX 4090 (24 GB) para bf16 con margen; GPUs de 16 GB o mas para cuantizacion de 8 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion agresiva, en GPUs de 8-12 GB, aunque el componente visual anade consumo no cuantificado en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada); no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF en el repositorio limita el uso directo en llama.cpp/Ollama sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DEAL-WS-Gemma | 7,5 mil millones | no disponible | no disponible | safetensors | Hugging Face (0 descargas) |
| Gemma base (familia) | variable segun variante | no disponible | licencia Gemma (no confirmada para este derivado) | safetensors, GGUF | Hugging Face |
| Otros derivados de Gemma de ~7-8B | ~7-8 mil millones | variable | variable | safetensors, GGUF | Hugging Face |

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento, codigo o capacidad multimodal.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, al derivar de Gemma, podria estar sujeto a los terminos de la licencia original de Gemma, que no se mencionan en el repositorio.
- Idiomas no especificados: se desconoce el rendimiento en castellano u otros idiomas distintos del ingles.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano y no mitigado por informacion publicada.
- Sesgos: no documentados; el entrenamiento con self-reward puede amplificar sesgos propios del modelo base.
- Contexto desconocido: no se indica la longitud de ventana, lo que impide planificar tareas de contexto largo.
- Checkpoint intermedio (step-124): no es necesariamente la version final ni la mejor del proyecto.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentacion adicional.
- Para produccion: requiere evaluacion propia exhaustiva, conversion a formatos de despliegue eficientes y verificacion legal de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trxcc2002/DEAL-WS-Gemma
- Coleccion SRE-DEAL: https://huggingface.co/collections/trxcc2002/sre-deal
- Perfil del autor: https://huggingface.co/trxcc2002
