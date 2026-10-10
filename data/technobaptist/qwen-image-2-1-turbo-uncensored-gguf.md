# TechnoBaptist/Qwen-Image-2.1-Turbo-Uncensored-GGUF

## Resumen

Qwen-Image-2.1-Turbo-Uncensored-GGUF es una publicación de pesos en formato GGUF del codificador de texto que alimenta el pipeline de generación de imágenes Qwen-Image 2.1 Turbo. El modelo de partida es Qwen/Qwen3-VL-8B-Instruct, con 8.190.735.360 parámetros, al que se le ha aplicado una ablación de la dirección de rechazo (abliteration): la dirección que el modelo emplea internamente para negarse a responder se proyecta fuera de los pesos. El resultado se distribuye como un `--llm` intercambiable para stable-diffusion.cpp, que debe combinarse con los GGUFs del denoiser Turbo del mismo ecosistema.

El repositorio lo publica el usuario TechnoBaptist, mientras que la model card atribuye la cuantización a AtomicChat. La licencia declarada es apache-2.0 y el repositorio ocupa 54 GB, aunque la model card solo detalla dos ficheros (BF16 y Q8_0), lo que sugiere una escalera de cuantizaciones más amplia no documentada en la información disponible.

La relevancia del lanzamiento es doble. Como modelo de chat, el codificador pasa de rechazar el 88,9% de las peticiones dañinas en inglés al 1,2% (y del 38% al 0% en ruso) sin degradar MMLU, que se mantiene en 77,35%. En la generación de imágenes, en cambio, las mediciones publicadas indican que no hay efecto de des-censura medible: el pipeline original ya dibujaba las nueve categorías sensibles probadas y no se produjo ningún cambio de resultado en 45 prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3-VL-8B-Instruct) empleado como codificador de texto; el denoiser asociado es un modelo de imagen de 7B, sin modificar |
| Parametros totales | 8.190.735.360 (~8,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (16,39 GB) y Q8_0 (8,71 GB) documentados; el resto de la escalera no está detallado, aunque se menciona el uso de importance matrix (imatrix) y layout por tensor (`AD-`) |
| Idiomas soportados | No disponible como listado oficial; las mediciones de rechazo se hicieron en inglés y ruso |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3-VL utilizado aquí exclusivamente como codificador de texto dentro de un pipeline de difusión. La intervención aplicada es una ablación direccional: según la model card, en la última capa los prompts dañinos y los inofensivos se separan con AUROC 1.000 en los estados ocultos que lee el denoiser, y esa dirección de rechazo se proyecta fuera de los pesos. No se ha modificado el denoiser, que conserva sus pesos originales y los sesgos de su dataset de preentrenamiento.

Las métricas de fidelidad publicadas frente al Qwen3-VL-8B-Instruct original en BF16 son una divergencia KL media de 0,0019 y un 98,45% de coincidencia en el token top-1, valores que incluyen la propia ablación. MMLU se mantiene en 77,35% antes y después. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset, ni sobre el uso de RLHF, DPO u otras fases de alineamiento posteriores.

## Capacidades

- Codificación de texto para el pipeline Qwen-Image 2.1 Turbo en stable-diffusion.cpp, invocable como `--llm` junto a los GGUFs del denoiser Turbo.
- Generación de imágenes en local cuando se combina con el denoiser correspondiente; el encoder no genera imágenes por sí solo.
- Uso como modelo de chat sin rechazos: la tasa de negativa cae del 88,9% al 1,2% en inglés y del 38% al 0% en ruso sobre prompts held-out.
- Conservación de capacidades generales de razonamiento y conocimiento: MMLU sin cambios (77,35%) y 98,45% de coincidencia en el top-1 respecto al original en BF16.
- Capacidades multimodales heredadas del modelo base Qwen3-VL-8B-Instruct, no verificadas en la información disponible para esta publicación.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explícito: no disponible.
- Ejecución local sin conexión, en formato GGUF, compatible con el ecosistema de runtimes que consumen este formato.

## Casos de uso

- Generación de imágenes local con stable-diffusion.cpp: el fichero se coloca como `--llm` junto al denoiser Turbo en GGUF, de modo que todo el pipeline (codificador de texto más denoiser) se ejecuta en la máquina del usuario sin depender de servicios alojados.
- Investigación en abliteration y control de direcciones: el par de métricas publicado (KLD 0,0019 y 98,45% de top-1 frente al original) permite estudiar cuánto se degrada un modelo al proyectar fuera una dirección semántica concreta y validar metodologías similares sobre otros modelos.
- Evaluación de robustez de codificadores de texto en pipelines de difusión: el modelo sirve como sujeto de prueba para medir cuánto cambia una imagen ante variaciones en el encoder, usando LPIPS con semilla y denoiser fijos (0,084-0,088 frente al encoder original, con 0,499 como referencia de cambio de semilla).
- Comparación de cuantizaciones: permite medir el impacto de BF16 frente a Q8_0 sobre la imagen final (LPIPS 0,090 en prompts neutros para Q8_0) manteniendo el resto del pipeline constante.
- Pruebas de robustez y red teaming de moderación: con el codificador funcionando como chat, sirve para medir qué peticiones deja de rechazar el modelo tras la ablación y qué implicaciones tiene en sistemas que dependen de rechazos del propio modelo.
- Estudio de la diferencia entre filtrado de pesos y filtrado de servicio: el caso documentado muestra que el pipeline abierto no incluye safety checker, de modo que la moderación depende del servicio alojado; útil para quien diseñe políticas de contenido sobre pesos abiertos.
- Despliegue en entornos aislados o air-gapped: al distribuirse en GGUF y ejecutarse en local, encaja en flujos con requisitos de confidencialidad donde no se pueden enviar prompts a APIs externas.
- Reproducibilidad de experimentos de imagen: al fijar versión de encoder, denoiser y seed, permite reproducir exactamente una configuración concreta de generación, algo relevante para publicaciones y audítorías técnicas.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| MMLU (antes de la ablacion) | 77,35% | Encoder original Qwen3-VL-8B-Instruct |
| MMLU (despues de la ablacion) | 77,35% | Sin cambios segun la model card |
| Tasa de rechazo, ingles | 88,9% -> 1,2% | Prompts held-out |
| Tasa de rechazo, ruso | 38% -> 0% | Prompts held-out |
| KLD medio (BF16) | 0,0019 | Respecto al modelo original |
| Coincidencia top-1 (BF16) | 98,45% | Respecto al modelo original |
| AUROC en la ultima capa | 1,000 | Separacion entre prompts dañinos e inofensivos en los estados ocultos |
| LPIPS en prompts sensibles (BF16 vs stock) | 0,088 | 45 prompts sensibles |
| LPIPS en prompts neutros (BF16) | 0,084 | 48 prompts neutros |
| LPIPS en prompts neutros (Q8_0) | 0,090 | 48 prompts neutros |
| LPIPS del encoder stock cuantizado a Q8_0 | 0,037 | Referencia de deriva por cuantizacion |
| LPIPS al cambiar de semilla | 0,499 | Referencia de magnitud del cambio |

Resultados sobre prompts sensibles (adultos), mismos seed y denoiser:

| Metrica | Encoder stock | Este encoder BF16 | Este encoder Q8_0 |
|---|---|---|---|
| Prompts sensibles en los que el juez ve lo pedido | 40 / 45 | 40 / 45 | 40 / 45 |
| Prompts que cambian de resultado respecto al stock | No aplica | 0 / 45 | 0 / 45 |

Categorías probadas: desnudo y contenido sugerente, violencia, armas, drogas, profanidad escrita en la imagen, anatomía médica, y controles de tabaco y alcohol y tatuajes. No se han publicado comparaciones con otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- Peso del codificador en BF16: 16,39 GB; en Q8_0: 8,71 GB. A estas cifras hay que sumar la VRAM del denoiser de 7B y el overhead de inferencia, no cuantificado en la información disponible.
- El repositorio completo ocupa 54 GB en disco, pero no se detalla el desglose de ficheros más allá de los dos documentados.
- BF16 no cabe en una GPU de consumo de 16 GB si se carga junto al denoiser; requiere previsiblemente tarjetas de 24 GB o superiores (estimación, no dato oficial).
- Q8_0 (8,71 GB) es la opción viable para GPUs de consumo de gama alta con 12-16 GB si se dimensiona con cuidado el denoiser; cifras exactas de VRAM combinada no disponibles.
- GPUs recomendadas: no disponible de forma explícita. Por tamaño de pesos, el rango objetivo son tarjetas profesionales (A100, H100) para BF16 y GPUs de consumo de gama alta con suficiente VRAM para Q8_0 (estimación).
- Motor de despliegue documentado: stable-diffusion.cpp. La aplicación Atomic Chat se cita como entorno de ejecución probado. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible, aunque el tag `endpoints_compatible` figura en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (EN) | MMLU | LPIPS vs encoder stock BF16 | Licencia |
|---|---|---|---|---|---|---|
| Este modelo, BF16 | 8,19B | No disponible | 1,2% | 77,35% | 0,084-0,088 | apache-2.0 |
| Este modelo, Q8_0 | 8,19B | No disponible | No disponible | No disponible | 0,090 | apache-2.0 |
| Qwen3-VL-8B-Instruct (encoder stock, BF16) | 8,19B | No disponible | 88,9% | 77,35% | 0 (referencia) | apache-2.0 |
| Encoder stock cuantizado a Q8_0 | 8,19B | No disponible | No disponible | No disponible | 0,037 | apache-2.0 |
| Denoiser Qwen-Image 2.1 Turbo | 7B | No aplica | No aplica | No aplica | Sin cambios | No disponible en esta ficha |

No se dispone de comparaciones con otros codificadores de texto para difusión (T5-XXL, CLIP, etc.) en la información proporcionada.

## Limitaciones y advertencias

- En generación de imágenes no se ha medido ningún efecto de des-censura: sobre 45 prompts sensibles no cambió ni un resultado respecto al encoder original. Lo que el denoiser no aprendió a dibujar, ningún encoder puede añadirlo.
- El cambio que sí se produce en la imagen es una deriva general: LPIPS de 0,084 en prompts neutros y 0,088 en sensibles, es decir, aproximadamente una sexta parte de lo que cambia una imagen al modificar la semilla (0,499). La deriva es tan grande en prompts neutros como en sensibles, por lo que no está orientada a contenido rechazado.
- El pipeline abierto no incluye safety checker: la moderación de Qwen-Image existe solo en el servicio alojado. Cualquier despliegue propio asume la responsabilidad de filtrado.
- El repositorio lleva el tag `not-for-all-audiences`; parte del material de evaluación es contenido sensible para adultos.
- Los pesos sin rechazos eliminan una barrera de seguridad del modelo de chat. Usados fuera del pipeline de imagen, el codificador deja de negarse a peticiones que el original rechazaba en el 88,9% de los casos en inglés.
- Idiomas verificados: solo inglés y ruso en las métricas de rechazo. No hay listado oficial de idiomas soportados ni evaluación en otras lenguas.
- Longitud de contexto: no disponible.
- Riesgo de alucinación: no evaluado en la información disponible para este uso como codificador dentro del pipeline de imagen.
- La licencia declarada es apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct y el hecho de que los pesos han sido modificados sin garantías del autor original.
- Procedencia: la ficha de HuggingFace figura a nombre de TechnoBaptist mientras que la model card indica `quantized_by: AtomicChat`. Conviene verificar la cadena de custodia de los pesos antes de usarlos en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad más allá de las métricas publicadas por los propios autores.
- Los datos de cuantización están incompletos en la model card extraída: la fila del fichero Q8_0 aparece truncada, por lo que sus valores de KLD y coincidencia top-1 no están disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Denoiser Turbo en GGUF: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF
- Métricas publicadas de la versión abliterada: https://huggingface.co/datasets/AtomicChat/Qwen-Image-2.1-Turbo-Abliterated-Uncensored-GGUF-metrics
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio Atomic-Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Servidor de Discord del proyecto: https://discord.gg/8wGSsvmg4V
