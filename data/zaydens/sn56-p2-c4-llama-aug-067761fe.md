# zaydens/sn56-p2-C4-LLAMA-AUG-067761fe

## Resumen

`zaydens/sn56-p2-C4-LLAMA-AUG-067761fe` es un artefacto de investigación publicado en HuggingFace, no un modelo de propósito general documentado. Según su propia model card, se trata del resultado de una repetición (replay) de un torneo de texto de SN56 con validación tipo "validator-style round-trip": el repositorio contiene el directorio de salida del entrenador subido sin modificaciones y se vuelve a descargar para puntuarlo sobre las filas reservadas (*held-out*) de la tarea, comprobando que la copia del Hub obtiene exactamente la misma puntuación que la copia local.

El checkpoint tiene 1.235.814.400 parámetros (~1,24 mil millones) en formato safetensors, con un tamaño de repositorio de 2,5 GB, lo que es coherente con pesos almacenados en bf16/fp16 (2 bytes por parámetro). La etiqueta de arquitectura es `llama`, por lo que se trata de un transformer decoder-only de la familia Llama, presumiblemente derivado de un modelo base de ~1B parámetros. La model card identifica la celda experimental como `C4-LLAMA-AUG`, la tarea como `067761fe` y el árbol de ficheros con SHA `1d561da`.

Su relevancia es acotada y muy específica: sirve como evidencia reproducible de un flujo de evaluación (subida al Hub, descarga y puntuación idéntica), no como modelo listo para producción. No hay información sobre el corpus de entrenamiento, el número de tokens, el proceso de alineamiento, la licencia o los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (según tag `llama`) |
| Parametros totales | 1.235.814.400 (~1,24 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF/AWQ/GPTQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,5 GB, consistente con bf16/fp16) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento

La única información estructural disponible es la etiqueta `llama` del repositorio, que sitúa el checkpoint en la familia de transformers decoder-only con atención causal, normalización RMSNorm y capas SwiGLU, el diseño estándar de Llama. Con 1,24 B de parámetros y un repositorio de 2,5 GB, el checkpoint encaja en el rango de los modelos Llama pequeños (aproximadamente 1B-1,5B), aunque no se especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni la ventana de contexto efectiva.

No se documenta nada sobre el entrenamiento: ni el número de tokens, ni la composición del dataset, ni si hubo fases de SFT, RLHF o DPO. La model card indica únicamente que la celda `C4-LLAMA-AUG` forma parte de un torneo de texto de SN56, que la semilla usada fue la predeterminada del entrenador (`unset`) y que los ficheros subidos son la salida del entrenador sin modificar. Es decir, el valor del artefacto está en la trazabilidad del experimento (SHA del árbol, identificador de tarea, comportamiento determinista en la puntuación), no en una innovación arquitectónica.

## Capacidades

- No hay ninguna capacidad verificada ni declarada explícitamente por el autor en la información disponible.
- Al estar etiquetado como `llama`, es razonable esperar generación de texto autorregresiva, pero no se ha publicado evaluación que lo confirme.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Comportamiento previsto dentro del experimento SN56: reproducción determinista de la puntuación de la tarea `067761fe` entre la copia local y la copia del Hub.

## Casos de uso

- Reproduccion de experimentos de torneo (SN56): descargar el repositorio y volver a puntuarlo sobre las filas *held-out* de la tarea `067761fe` para verificar que la puntuación coincide exactamente con la de la copia local, tal como describe la model card.
- Auditoria de integridad de artefactos en el Hub: usar el par (task8 `067761fe`, tree SHA `1d561da`) como referencia para comprobar que un checkpoint subido no se ha alterado ni se ha re-serializado de forma que cambie la inferencia.
- Validacion de pipelines de evaluacion: servir como caso de prueba para comprobar que un arnés de evaluación (harness) es determinista y reproducible entre entornos, algo crítico antes de confiar en rankings de modelos.
- Punto de partida para fine-tuning: con ~1,24 B de parámetros en bf16, es un candidato manejable para ajuste supervisado en una única GPU de gama media-alta, siempre que la licencia lo permita (actualmente no declarada).
- Pruebas de infraestructura de inferencia: cargar el safetensors en vLLM, TGI o transformers para medir tiempos de carga, memoria y throughput de un modelo de ~1B en hardware concreto, sin depender de modelos externos.
- Prototipado local en portatil: si el checkpoint conserva las capacidades del modelo base, puede usarse para generar texto ligero en CPU o GPU integrada tras convertir los pesos a GGUF, aunque dicha conversión y su calidad no están verificadas.
- Comparacion de versiones en un mismo experimento: utilizar el identificador de celda (`C4-LLAMA-AUG`) para contrastar este artefacto con otras variantes de la misma campaña de torneo y aislar el efecto de los cambios introducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas (MMLU, HumanEval, GSM8K ni ninguna otra) ni comparaciones numéricas; únicamente describe el procedimiento de verificación de puntuación sobre las filas reservadas de la tarea, cuyo valor concreto tampoco se publica en los datos proporcionados.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 2,5-3 GB solo para pesos, más el cache KV y las activaciones; en la práctica unos 4-5 GB para secuencias cortas con batch 1.
- VRAM en cuantizacion de 8 bits: en torno a 1,3-1,5 GB de pesos.
- VRAM en cuantizacion de 4 bits: en torno a 0,7-0,9 GB de pesos.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más de VRAM (RTX 3060, 4060, 4070, 4090, así como GPUs integradas recientes con memoria compartida si se cuantiza a 4 bits).
- Cabe en CPU: sí, es viable la inferencia en CPU con cuantizacion de 4-8 bits, con latencias altas pero funcionales para lotes pequeños.
- GPU de centro de datos (A100, H100, L40S): sobredimensionadas para un modelo de este tamaño, salvo que se necesite un throughput muy alto con batching grande.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servir con batching continuo, llama.cpp/Ollama si se convierte el checkpoint a GGUF (conversion no publicada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se ofrece como referencia de categoría (modelos pequenos de ~1-2 B de parametros). Los datos de las alternativas provienen de informacion publica general y no se han verificado en esta ficha; los del modelo analizado proceden del repositorio. No se comparan resultados de benchmarks porque no hay datos publicados para `sn56-p2-C4-LLAMA-AUG-067761fe`.

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| sn56-p2-C4-LLAMA-AUG-067761fe | 1,24 B | no disponible | no disponible | Artefacto de investigacion, sin model card tecnica ni benchmarks |
| Llama 3.2 1B | 1,24 B | 128k (referencia publica) | Llama 3.2 Community License | Modelo instruct/base documentado; requiere verificacion de cifras |
| Qwen2.5 1.5B | 1,54 B | 32k (referencia publica) | Apache 2.0 (segun variante) | Multilingue declarado; requiere verificacion de cifras |
| TinyLlama 1.1B | 1,1 B | 2k (referencia publica) | Apache 2.0 | Entrenado sobre 3T tokens segun su documentacion; requiere verificacion |

La diferencia principal no es de rendimiento, sino de naturaleza: este repositorio es un registro de un experimento de evaluación, mientras que las alternativas son modelos con documentación, licencia y métricas publicadas.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no se documentan datos de entrenamiento, tokens vistos, composición del corpus, proceso de alineamiento ni hiperparámetros.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; trátese como uso exclusivamente de investigación hasta que el autor lo aclare.
- Riesgo de alucinación desconocido: al no haber evaluación publicada, no puede estimarse la fiabilidad factual del modelo.
- Idiomas soportados no especificados: no puede asumirse un buen rendimiento en castellano ni en ningún otro idioma concreto.
- Contexto no especificado: planificar cualquier integración que dependa de ventanas largas requiere medir primero la longitud máxima admitida.
- Sesgos: no evaluados ni documentados; un checkpoint derivado de un torneo puede heredar los sesgos del corpus y del modelo base, que se desconocen.
- Trazabilidad parcial: la model card aporta SHA de árbol y fecha, pero no la identidad del modelo base ni del entrenador, lo que dificulta la reproducción independiente.
- Métricas del repositorio nulas (0 descargas, 0 likes) y sin pipeline declarado: no hay señal de uso en producción ni comunidad que haya validado el artefacto.
- Fecha de creación futura respecto a la fecha habitual de consulta: conviene verificar la vigencia y el estado del repositorio antes de integrarlo en cualquier flujo.
- No debe presentarse como "modelo listo para producción": su propósito declarado es servir como artefacto de investigación para una verificación de puntuación.

## Enlaces

- HuggingFace: https://huggingface.co/zaydens/sn56-p2-C4-LLAMA-AUG-067761fe
- Modelo base: no disponible
- Paper o informe técnico: no disponible
- Repositorio de código: no disponible
- Demo o espacio de inferencia: no disponible
- Documentación de SN56 o del torneo de texto: no disponible
