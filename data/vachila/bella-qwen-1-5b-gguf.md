# Vachila/bella-qwen-1.5b-gguf

## Resumen

Bella-qwen-1.5b-gguf es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Vachila en HuggingFace y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y runtimes compatibles. La model card indica que el modelo fue ajustado y convertido a GGUF utilizando Unsloth, e incluye un fichero Modelfile de Ollama para facilitar su despliegue. Se trata, por tanto, de un modelo pequeno, orientado a entornos con recursos limitados y a inferencia local.

El modelo cuenta con 1.543.714.304 parametros totales (aproximadamente 1,54 mil millones), lo que lo situa en la categoria de modelos compactos capaces de ejecutarse en CPU y en GPU de consumo. El unico fichero de pesos publicado es una cuantizacion Q4_K_M del modelo base Qwen2.5-1.5B-Instruct, con un tamano de repositorio de aproximadamente 1,0 GB.

La relevancia de esta publicacion es limitada y muy especifica: se trata de un modelo con cero descargas y un "like" en el momento de la consulta, sin documentacion sobre el dataset de ajuste, la licencia o los idiomas soportados. El interes principal radica en que demuestra un flujo de trabajo reproducible de fine-tuning y conversion a GGUF con Unsloth sobre una base solida como Qwen2.5-1.5B-Instruct, pero no aporta informacion verificable sobre que diferencia a "bella" respecto a su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun los tags del repositorio; base declarada Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se publican otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es un fine-tune de Qwen2.5-1.5B-Instruct. El modelo base pertenece a la familia Qwen2, una arquitectura transformer decoder-only con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm. No obstante, la model card no detalla la arquitectura interna, el numero de capas, la dimension de las cabezas de atencion ni otros hiperparametros, por lo que no es posible confirmar la configuracion exacta en esta publicacion.

El autor declara que el ajuste fino y la conversion a GGUF se realizaron con Unsloth, una libreria optimizada que reduce el uso de memoria y acelera el entrenamiento de modelos LoRA/QLoRA. La model card afirma que el modelo "fue entrenado 2x mas rapido con Unsloth". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se documenta que tipo de datos se usaron para definir la identidad o el comportamiento de "bella".

## Capacidades

Las capacidades declaradas o deducibles de la informacion disponible son limitadas, dado que la model card no incluye una seccion de capacidades. A partir de los tags y del ejemplo de uso se puede inferir lo siguiente, siempre con la advertencia de que no esta confirmado por el autor:

- Generacion de texto conversacional: el tag "conversational" y el ejemplo con `llama-cli` sugieren uso en dialogos.
- Inferencia con plantillas de chat: el ejemplo usa el flag `--jinja`, que activa el procesamiento de plantillas de chat Jinja en llama.cpp.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que el modelo esta preparado para su uso a traves de servicios compatibles con la API de HuggingFace.
- Capacidades heredadas del base: al derivar de Qwen2.5-1.5B-Instruct, es probable que conserve generacion de texto, razonamiento basico, codigo y matematicas elementales, pero esto no esta verificado para el fine-tune.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible. La model card menciona un comando para modelos multimodales (`llama-mtmd-cli`), pero no confirma que este modelo concreto tenga vision.

## Casos de uso

Los siguientes casos son aplicaciones plausibles para un modelo de 1,5B de parametros en formato GGUF, pero no estan documentados ni validados por el autor. Deben tratarse como orientativos:

- Asistente conversacional local: al ser un modelo de 1,5B cuantizado en Q4_K_M con un tamano de aproximadamente 1 GB, puede ejecutarse en portatiles o equipos sin GPU dedicada para mantener conversaciones simples sin conexion.
- Prototipado rapido de chatbots: gracias al Modelfile incluido, puede desplegarse en Ollama en pocos minutos para validar flujos de producto antes de escalar a modelos mayores.
- Clasificacion y etiquetado de texto: un modelo pequeno y rapido resulta adecuado para tareas de extraccion o categorizacion de bajo coste por token, siempre que la calidad del fine-tune lo permita.
- Aplicaciones embebidas o de borde (edge computing): su tamano permite integrarlo en dispositivos con recursos limitados, como Raspberry Pi, siempre que la latencia sea aceptable.
- Educacion y demostraciones: util para ensenar como funciona un pipeline de fine-tuning con Unsloth y su conversion a GGUF sin necesidad de hardware costoso.
- Filtrado previo en cascada: puede emplearse como primer nivel de un sistema de varios modelos para descartar consultas triviales antes de invocar un modelo mayor, reduciendo coste y latencia.
- Generacion asistida de texto corto: borradores, respuestas breves o resumenes de parrafos, con revision humana posterior, dado el riesgo de alucinacion en modelos de esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion ni referencias a MMLU, HumanEval, GSM8K u otras pruebas estandar.

## Requisitos de hardware

Las siguientes cifras son estimaciones orientativas basadas en el tamano del modelo y la cuantizacion publicada; el autor no las proporciona:

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB para cargar los pesos Q4_K_M, mas el espacio de la cache KV, que depende de la longitud de contexto. En la practica, unos 2 GB de memoria total serian suficientes para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de memoria. No requiere A100 ni H100; funciona bien en RTX 3060, RTX 4060, GTX 1650 y similares. Tambien puede ejecutarse integramente en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en algunas integradas, dado su tamano reducido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (incluye Modelfile), LM Studio, y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI, que habitualmente trabajan con otros formatos.
- Latencia y throughput: no disponible. En CPU moderna se puede esperar un rendimiento interactivo, y en GPU dedicada sera notablemente superior, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

La comparativa se realiza frente al modelo base y a otras alternativas compactas de la misma categoria. Los datos de las alternativas corresponden a sus especificaciones publicas y no a este repositorio:

| Modelo | Parametros | Contexto (segun documentacion publica) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Bella-qwen-1.5b-gguf | 1,54B | no disponible | no disponible | GGUF en HuggingFace |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 tokens | Apache 2.0 (segun documentacion del base) | Safetensors y GGUF |
| Llama 3.2 1B Instruct | 1,24B | hasta 128.000 tokens | Llama 3.2 Community License | Safetensors y GGUF |
| Gemma 2 2B Instruct | 2,6B | 8.192 tokens | Gemma Terms of Use | Safetensors y GGUF |

Nota: los datos de contexto y licencia de las alternativas proceden de su documentacion publica oficial y pueden variar; conviene verificarlos en las fichas correspondientes antes de tomar decisiones de produccion. No hay benchmarks comparativos disponibles para bella-qwen-1.5b-gguf.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al no documentarse el dataset de ajuste fino, se desconoce que sesgos puede haber introducido el entrenamiento.
- Riesgo de alucinacion: elevado por tratarse de un modelo de 1,5B de parametros, que tiende a inventar datos con mas frecuencia que modelos mayores. No hay evaluaciones que cuantifiquen este riesgo.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva y los idiomas soportados no estan documentados. Aunque el base Qwen2.5 es multilingue, no se puede garantizar que el fine-tune conserve esa capacidad.
- Restricciones de licencia: la licencia del repositorio figura como "no disponible". Esto es un problema serio para uso comercial, ya que no existe permiso explicito del autor. Ademas, al derivar de Qwen2.5-1.5B-Instruct, podrian aplicar condiciones del modelo base que habria que verificar.
- Falta de documentacion critica: no se describen datos de entrenamiento, hiperparametros, metodologia de evaluacion ni proposito del fine-tune. "Bella" no esta definido en la model card.
- Ausencia de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad del modelo frente a su base o a alternativas.
- Madurez: el repositorio tiene cero descargas y un unico "like", y fue creado y actualizado el mismo dia. No hay evidencia de uso en produccion ni de mantenimiento.
- Uso en produccion: se desaconseja emplearlo en sistemas criticos sin una evaluacion propia previa, dado el desconocimiento del proceso de ajuste y de la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/Vachila/bella-qwen-1.5b-gguf
- Unsloth (repositorio usado para el fine-tuning y conversion): https://github.com/unslothai/unsloth
- Modelo base declarado (Qwen2.5-1.5B-Instruct): no se proporciona enlace directo en la informacion disponible.
