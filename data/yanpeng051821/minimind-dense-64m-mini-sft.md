# yanpeng051821/minimind-dense-64m-mini-sft

## Resumen

MiniMind Dense 64M Mini SFT es un checkpoint de investigación publicado por el usuario yanpeng051821 en Hugging Face. Se trata de un ajuste fino supervisado (SFT) de parámetros completos sobre su propio modelo preentrenado MiniMind mini, entrenado desde inicialización aleatoria siguiendo la arquitectura y el tokenizador de la referencia MiniMind. Con 63.912.192 parámetros únicos (aproximadamente 63,91M), es un modelo denso decoder-only de escala muy reducida, pensado como experimento educativo y de investigación, no como asistente fiable.

El experimento plantea si la supervisión únicamente sobre turnos del asistente puede convertir un modelo de continuación de texto en un mejor asistente bajo condiciones fijas. Según la propia model card, el flujo de ingeniería se completó, pero el objetivo de mejora de tareas no se alcanzó: la NLL de validación y parte del comportamiento de parada mejoraron, mientras que la finalización de tareas no superó a su propia línea base preentrenada en el conjunto de diagnóstico fijo. La model card preserva explícitamente este resultado negativo.

El modelo tiene 8 capas, tamaño oculto 768 y FFN intermedio de 2.432, con atención de 8 cabezas de consulta y 4 de clave/valor. Se entrenó y evaluó dentro de una ventana de 768 tokens, y no es un adaptador de Transformers AutoModel: requiere un runtime Python local propio. Su relevancia es metodológica, como registro transparente de un experimento de SFT a pequeña escala con datos y decisiones documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only causal (8 capas, hidden size 768, FFN intermedio 2.432) |
| Parámetros totales | 63.912.192 (aproximadamente 63,91M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 768 tokens (entrenado y evaluado; calidad en contexto mayor no probada) |
| Tipos de cuantización | no disponible (export nativo en FP32 safetensors) |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32 nativo; archivo de tensores de 255.659.304 bytes, aproximadamente 255,66 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only causal con 8 capas, tamaño oculto de 768 y FFN intermedio de 2.432. La atención usa 8 cabezas de consulta y 4 cabezas de clave/valor, con RMSNorm en Q/K y RoPE con base 1.000.000. El tokenizador es el de MiniMind, con vocabulario de 6.400 tokens (BOS=1, EOS=2, PAD=0). Los pesos de embedding y de la cabeza LM están atados y comparten un único parámetro. La referencia de arquitectura y tokenizador es el commit f659b557 del repositorio jingyaogong/minimind; los pesos preentrenados se entrenaron desde inicialización aleatoria, no desde los pesos oficiales de MiniMind.

El SFT se inicializó desde el paso final 4.943 de su propio preentrenamiento, con un estado AdamW y scheduler nuevos para el ajuste fino. Se completó una época de SFT sin DPO ni RL. Los datos provienen de jingyaogong/minimind_dataset en la revisión fijada 312afb4f76391145c6902f765bb51691c09a12f5, archivo sft_t2t_mini.jsonl con 905.718 registros, de los cuales se aceptaron 787.425 conversaciones y se dividieron en 785.377 de entrenamiento y 2.048 de validación. La preparación aplicó 14 revisiones de identidad y 2 correcciones de contenido concretas, retuvo 21.073 ejemplos y apartó 15 duplicados posteriores a las revisiones. Los objetivos supervisados tras el desplazamiento causal fueron 326.249.045 en entrenamiento y 833.052 en validación. Las conversaciones codificadas de más de 768 tokens se excluyeron, no se truncaron; el padding es por la derecha hasta 768. Se supervisan los cuerpos del asistente, el pensamiento retenido, el texto de llamadas y la secuencia completa de fin de mensaje, pero no las cabeceras de rol, el texto de usuario/sistema, los resultados de herramientas ni el padding.

El entrenamiento se ejecutó en una única NVIDIA RTX 4060 Ti de 8 GB de VRAM, con un bucle PyTorch propio (no TRL Trainer), estado de parámetros en FP32 y autocast CUDA BF16. La partición de validación agrupa por componentes conexas que comparten cualquier mensaje de usuario normalizado o conversación completa normalizada (NFKC, case folding y colapso de espacios solo para agrupar), con semilla 20261031. No hubo solapamiento exacto de diálogo ni de pregunta normalizada entre particiones, pero no se verificó contaminación semántica por casi duplicados ni de benchmarks externos, y el conjunto de validación no es una prueba ciega independiente.

## Capacidades

- Generación de texto causal en chino, dentro de una ventana de 768 tokens.
- Conversación multi-turno con roles de usuario, sistema y asistente, según el formato del tokenizador MiniMind.
- Supervisión de texto de llamadas a herramientas y de resultados de herramientas en el formato declarado por el conjunto de datos, aunque con garantías estructurales limitadas en los resultados anónimos empaquetados.
- Pensamiento retenido (contenido de razonamiento dentro de la respuesta del asistente) supervisado durante el SFT.
- Comportamiento de parada parcialmente mejorado respecto a la línea base, según la model card.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento de múltiples pasos verificado.
- No se documenta soporte fiable de tool calling en producción ni de agentes autónomos; la supervisión de llamadas es un artefacto del dataset, no una capacidad validada.
- Capacidad multilingüe no disponible: solo se declara chino.

## Casos de uso

- Estudio de recetas de SFT a pequeña escala: sirve como referencia reproducible para analizar cómo afecta una época de supervisión solo en turnos del asistente a un modelo de continuación de 64M, con datos, particiones y recuentos documentados.
- Investigación sobre resultados negativos: permite examinar por qué la NLL de validación mejora mientras la finalización de tareas no lo hace, comparando contra el checkpoint de preentrenamiento base del mismo autor.
- Docencia y divulgación: su tamaño (aproximadamente 0,3 GB de repositorio) y su runtime Python local permiten ejecutarlo en equipos modestos para ilustrar el ciclo completo preentrenamiento-SFT-evaluación.
- Experimentos de tokenización y plantillas: el formato con vocabulario de 6.400 tokens, BOS/EOS/PAD definidos y supervisión selectiva de posiciones es útil para estudiar el efecto de las máscaras de etiquetas en modelos pequeños.
- Pruebas de infraestructura de inferencia: al requerir un runtime propio y no ser un adaptador AutoModel, sirve para validar pipelines de carga de safetensors FP32 y de decodificación causal en entornos controlados.
- Análisis de políticas de datos: las 14 revisiones de identidad y las retenciones documentadas permiten estudiar cómo las decisiones de curación afectan al comportamiento de un modelo de 64M, sin asumir que este recuerde su identidad (las pruebas posteriores fallaron).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas del entrenamiento: NLL de validación mejorada y comportamiento de parada parcialmente mejorado, sin cifras concretas, y ausencia de mejora en finalización de tareas frente a la línea base preentrenada en el conjunto de diagnóstico fijo. Las puntuaciones citadas son juicios iniciales del propio asistente, con un caso sin resolver y sin revisión independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; los pesos FP32 ocupan aproximadamente 255,66 MB, por lo que caben holgadamente en cualquier GPU consumer con 4 GB o más, y probablemente en inferencia por CPU.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4060 Ti, RTX 4090, A100, H100); el entrenamiento se realizó en una RTX 4060 Ti de 8 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer actuales, dado el tamaño del checkpoint.
- Opciones de despliegue: runtime Python local propio del proyecto; no es un adaptador de Transformers AutoModel, por lo que vLLM, TGI, llama.cpp u Ollama no están documentados como compatibles en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMind Dense 64M Mini SFT (este) | 63,91M | 768 | zh | no disponible | safetensors FP32, runtime propio | Hugging Face, 0 descargas |
| MiniMind Dense 64M Mini Pretrain (base del autor) | no disponible en la información | no disponible | zh | no disponible | safetensors | Hugging Face |
| MiniMind oficial (jingyaogong/minimind) | no disponible en la información | no disponible | zh | no disponible | no disponible | Repositorio GitHub y Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un checkpoint de investigación educativa, no un asistente fiable; la propia model card lo declara explícitamente.
- El objetivo de mejora de tareas no se alcanzó: la finalización de tareas no superó a la línea base preentrenada en el conjunto de diagnóstico fijo.
- Las puntuaciones reportadas son juicios iniciales del propio asistente, con un caso sin resolver y sin revisión independiente.
- Las pruebas de identidad posteriores fallaron: el modelo no recuerda de forma fiable su identidad pese a las 14 revisiones de identidad aplicadas a los datos.
- Ventana de contexto limitada a 768 tokens; la calidad en contextos más largos no se ha probado y las conversaciones más largas se excluyeron del entrenamiento.
- Solo se declara soporte de chino; no hay capacidades multilingües documentadas.
- Riesgo de alucinación y de errores factuales: la revisión de veracidad del contenido se limitó a muestras acotadas y no se verificó la calidad factual completa ni la seguridad.
- No se verificó la fuga de información personal ni los derechos completos de las fuentes; los resultados de herramientas empaquetados de forma anónima tienen garantías estructurales limitadas.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- No es un adaptador de Transformers AutoModel; requiere un runtime Python local propio, lo que limita la integración con ecosistemas estándar.
- La partición de validación no es una prueba ciega independiente y no se verificó la contaminación semántica por casi duplicados ni de benchmarks externos.
- Los archivos JSONL de entrenamiento en bruto y derivados no se incluyen en esta release de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yanpeng051821/minimind-dense-64m-mini-sft
- Modelo base preentrenado: https://huggingface.co/yanpeng051821/minimind-dense-64m-mini-pretrain
- Dataset utilizado: https://huggingface.co/datasets/jingyaogong/minimind_dataset/tree/312afb4f76391145c6902f765bb51691c09a12f5
- Referencia de arquitectura y tokenizador (commit f659b557): https://github.com/jingyaogong/minimind/tree/f659b55761b754d306bd140573493a6543cafd7f
