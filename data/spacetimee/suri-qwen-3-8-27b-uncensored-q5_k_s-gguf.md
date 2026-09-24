# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q5_K_S-GGUF

## Resumen

Suri-Qwen-3.8-27B-Uncensored-Q5_K_S-GGUF es una conversión al formato GGUF del modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, publicada por el usuario SpaceTimee. La conversión se ha realizado con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, un flujo automatizado que toma los pesos originales y genera un archivo cuantizado listo para ejecutarse con llama.cpp, Ollama o cualquier runtime compatible con GGUF. No se trata, por tanto, de un modelo entrenado desde cero, sino de una distribución de pesos cuantizados de un ajuste fino previo.

El dato objetivo más relevante es el tamaño: el modelo base declara 26.895.998.464 parámetros (aproximadamente 26,9 mil millones, pese a que el nombre comercial lo etiqueta como "27B"). El repositorio ocupa 18,7 GB, lo que es coherente con una cuantización Q5_K_S sobre esa cantidad de parámetros. Esto sitúa al modelo en la categoría de 24-32B, es decir, el rango que se puede ejecutar en una GPU de consumo de gama alta (24 GB de VRAM) con cuantizaciones de 5 bits, o en configuraciones con offload parcial a CPU.

La relevancia de esta ficha es limitada y hay que ser explícitos al respecto: la model card publicada no incluye información sobre arquitectura, datos de entrenamiento, licencia, idiomas, contexto o benchmarks. La única documentación disponible son las instrucciones de uso con llama.cpp. El nombre sugiere una base de la familia Qwen (por el prefijo "Qwen-3.8") y un ajuste orientado a reducir los rechazos ("Uncensored"), pero ninguno de esos extremos se confirma en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el nombre sugiere linaje Qwen, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9 B) segun safetensors del modelo base |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (los ejemplos del README usan `-c 2048`, pero es un valor de ejemplo del servidor, no la ventana maxima del modelo) |
| Tipos de cuantizacion | Q5_K_S (formato GGUF); el modelo base se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base, en safetensors |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras) empleadas. Lo único documentado es el proceso de conversión: los pesos del modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored se transformaron a GGUF mediante el espacio ggml.ai/gguf-my-repo, que automatiza la generación de un archivo cuantizado con llama.cpp. El archivo resultante se denomina `suri-qwen-3.8-27b-uncensored-q5_k_s.gguf`.

Por el número de parámetros (26,9 B) y la nomenclatura, lo razonable es asumir un transformer denso de la familia Qwen, pero conviene tratarlo como una hipótesis no verificada. Tampoco hay información sobre si el ajuste "Uncensored" se hizo por fine-tuning supervisado, por abliteration u otras técnicas de reducción de rechazos, ni sobre qué datasets se usaron. Cualquier afirmación sobre capacidades reales, ventana de contexto nativa o comportamiento multilingüe sería especulativa.

## Capacidades

La información disponible no permite confirmar capacidades concretas. Lo que se puede afirmar y lo que se infiere es lo siguiente:

- Generación de texto autoregresiva: es la función básica esperable en un modelo de lenguaje de este tamaño, pero no hay documentación que detalle su rendimiento.
- Razonamiento, código y matemáticas: no disponible, no hay benchmarks ni descripción de capacidades.
- Soporte de tool calling / function calling: no disponible; no se menciona plantilla de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Modo "thinking" o razonamiento explícito: no disponible.
- Visión o audio: no disponible; no se menciona ningún componente multimodal, y el tamaño de pesos es consistente con un modelo exclusivamente de texto.
- Reducción de rechazos: el sufijo "Uncensored" del nombre indica que el ajuste busca disminuir las negativas del modelo a determinadas peticiones, pero no se especifica el método ni el alcance.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dada la naturaleza del artefacto (un modelo de ~27 B en GGUF, ejecutable en local), no capacidades verificadas en documentación:

- Inferencia local sin conexión: al estar en formato GGUF y ocupar 18,7 GB, el modelo se puede ejecutar íntegramente en una estación de trabajo con una GPU de 24 GB, sin enviar datos a APIs externas. Es adecuado para entornos con requisitos de confidencialidad o sin acceso a internet.
- Procesamiento por lotes de texto en servidores propios: mediante `llama-server` se puede levantar un endpoint HTTP compatible con la API de OpenAI y encadenar tareas de resumen, clasificación o reescritura sobre grandes volúmenes de documentos.
- Experimentación en investigación sobre alineación y rechazos: al tratarse de un ajuste etiquetado como "Uncensored", es un candidato para estudiar cómo cambia la tasa de negativas respecto al modelo base, siempre que se respeten las condiciones de uso y la legalidad aplicable.
- Generación de texto creativo y narrativa: la ventana de contexto y la calidad no están documentadas, pero el tamaño del modelo permite mantener coherencia en textos largos dentro de los límites que imponga la configuración de `-c`.
- Asistente personal autoalojado: integrado en herramientas como Ollama o en un frontend local mediante `llama-server`, se puede usar como asistente de escritorio para redacción, resumen de notas y consultas técnicas.
- Prototipado de pipelines de NLP antes de decidir una arquitectura: sirve como modelo de referencia en la franja de 27 B para comparar latencia y calidad frente a alternativas del mismo tamaño, ya que se puede desplegar con llama.cpp sin infraestructura dedicada.
- Fine-tuning posterior o destilación: los pesos en safetensors del modelo base permiten reentrenamientos, mientras que la versión GGUF sirve para validar el comportamiento antes de invertir en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión GGUF no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, y tampoco se aportan comparaciones con modelos de referencia.

## Requisitos de hardware

- Tamaño en disco: el repositorio ocupa 18,7 GB, correspondiente a un único archivo GGUF en cuantización Q5_K_S (aproximadamente 5,5 bits por peso sobre 26,9 B de parámetros).
- VRAM estimada para inferencia: en torno a 19-21 GB para cargar los pesos completos en GPU, más el espacio para la caché KV. La caché KV depende de la ventana de contexto efectiva (parámetro `-c`), del número de capas y de la implementación; con contextos cortos el sobrecoste es pequeño, y crece de forma lineal con la longitud.
- GPU recomendadas: NVIDIA RTX 4090, RTX 5090, A6000, L40S o A100/H100 (estas últimas sobredimensionadas para este tamaño, pero válidas para servir varias instancias). Cualquier GPU con 24 GB o más de VRAM puede alojar los pesos completos.
- GPU de consumo: sí cabe en tarjetas de 24 GB (RTX 3090, 4090, 5090) en Q5_K_S, con margen ajustado si se usan contextos largos. En GPUs de 12-16 GB es necesario el offload parcial de capas a CPU, con la consiguiente caída de velocidad.
- CPU y RAM: es posible ejecutarlo solo en CPU con llama.cpp, pero se recomienda un mínimo de 32 GB de RAM para los pesos más la caché, y un rendimiento de unos pocos tokens por segundo en procesadores de consumo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan y cualquier otro runtime compatible con GGUF. El tag del repositorio indica compatibilidad con endpoints. Para vLLM o TGI habría que usar el modelo base en safetensors, no esta conversión GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo para ningún hardware concreto.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparación cuantitativa. A continuación se sitúa frente a alternativas de la misma franja de tamaño, indicando únicamente los datos públicos de cada una; para este modelo, los campos no documentados figuran como "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Uncensored (este) | ~26,9 B | no disponible | no disponible | Si (Q5_K_S en este repo) |
| Qwen3-32B | 32 B | 128 K segun documentacion publica | Apache 2.0 | Si, en el ecosistema |
| Gemma 3 27B | 27 B | 128 K segun documentacion publica | Licencia Gemma | Si, en el ecosistema |
| Mistral Small 3.1 24B | 24 B | 128 K segun documentacion publica | Apache 2.0 | Si, en el ecosistema |

La conclusión práctica es que este modelo compite en tamaño con la familia de 24-32 B, pero parte con una desventaja clara de documentación: no se declaran licencia, idiomas, contexto ni evaluaciones, a diferencia de las alternativas citadas, que publican model cards completas y resultados de benchmarks.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en la información disponible, no se puede asumir permiso de uso comercial. Es imprescindible consultar el repositorio del modelo base y el del autor antes de cualquier uso en producción.
- Ausencia total de documentación técnica: no hay datos de arquitectura, contexto, idiomas ni entrenamiento, lo que impide evaluar su idoneidad para tareas concretas sin pruebas empíricas propias.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de este tamaño; al no haber benchmarks, no se puede acotar su magnitud. Se recomienda verificación humana en cualquier flujo crítico.
- Sesgos: no evaluados ni documentados. El ajuste "Uncensored" puede aumentar la probabilidad de generar contenido ofensivo, ilegal o peligroso, ya que parte del objetivo declarado en el nombre es reducir los rechazos del modelo.
- Trazabilidad: es una conversión automatizada mediante gguf-my-repo, no una publicación oficial del equipo que entrenó el modelo original. La responsabilidad sobre la calidad de la cuantización Q5_K_S recae en el proceso de conversión.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni informes de errores de terceros.
- Compatibilidad de plantilla de chat: la model card no documenta la plantilla de prompt ni los tokens especiales, algo que puede degradar la calidad si se usa con la plantilla equivocada.
- Uso ético y legal: dado el carácter "Uncensored" del ajuste, conviene revisar las políticas aplicables antes de desplegarlo en entornos con usuarios finales.

## Enlaces

- Repositorio HuggingFace de esta conversión GGUF: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q5_K_S-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
