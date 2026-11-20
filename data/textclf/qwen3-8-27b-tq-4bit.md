# textclf/Qwen3.8-27B-TQ-4bit

## Resumen

Qwen3.8-27B-TQ-4bit es una versión cuantizada a 4 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario textclf en Hugging Face. La cuantización emplea Coded Quantization (CQ), un método sin calibración desarrollado por ThousandML que persigue preservar el comportamiento del modelo original sin depender de un corpus de calibración específico. El resultado es un checkpoint que reduce de forma sustancial el peso en memoria de los pesos (4 bits frente a BF16/FP16) manteniendo una fidelidad declarada de 0,0282 de divergencia KL media y un 92,4 % de acuerdo top-1 con el modelo original sobre WikiText Raw.

El modelo subyacente es un Qwen3.8 de 27 000 millones de parámetros, según la model card del autor. Conviene señalar una discrepancia importante: los tensores almacenados en safetensors suman 2 589 119 216 parámetros (unos 2,6 B), y el propio autor explica que el Hub cuenta los tensores empaquetados en 4 bits, no los parámetros de la arquitectura original. Esta ficha refleja ambos datos tal como aparecen en la información disponible.

La relevancia práctica del checkpoint está en su integración nativa con vLLM mediante un plugin de cuantización (`cq`) y kernels CUDA propios, distribuidos en una imagen Docker de ThousandML. No es, por tanto, un GGUF para llama.cpp ni un AWQ/GPTQ estándar: el despliegue recomendado pasa por el contenedor oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 27 B segun la model card del autor; 2 589 119 216 tensores almacenados en safetensors (empaquetado 4 bits) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Coded Quantization (CQ) 4 bits, sin calibracion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado 4 bits) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en los datos proporcionados: no se especifica si emplea atención completa, atención lineal, mezcla de expertos ni detalles sobre capas, cabezas o vocabulario. La model card remite explícitamente a la ficha original de Qwen para esos detalles. Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable de este checkpoint es el método de cuantización. Coded Quantization (CQ) es una cuantización post-entrenamiento de 4 bits que no requiere dataset de calibración: en lugar de estimar los parámetros de cuantización a partir de un corpus representativo, CQ evita esa dependencia para no atar el resultado a la distribución de los datos de calibración y generalizar mejor fuera de ellos. La fidelidad medida sobre WikiText Raw es de 0,0282 de divergencia KL media y 92,4 % de acuerdo top-1 con el modelo sin cuantizar. El autor no detalla el algoritmo interno de CQ ni el proceso de entrenamiento del codebook.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto: la pipeline declarada en el Hub es `image-text-to-text`, lo que indica capacidades multimodales de entrada.
- Razonamiento y matemáticas: presumibles por la familia Qwen3.8, aunque no se documentan explícitamente en la información disponible.
- Generación de código: no documentada explícitamente en la model card; depende de las capacidades del modelo base.
- Tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no disponibles; el Hub no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Despliegue de inferencia a gran escala con vLLM: el checkpoint está pensado para servirse mediante el plugin CQ y la imagen Docker oficial, exponiendo una API compatible con OpenAI en el puerto 8000. Es adecuado cuando se quiere reducir el coste de memoria de pesos frente a una implementación en BF16.
- Servicio de chat conversacional: la API compatible con `/v1/chat/completions` permite integrar el modelo en aplicaciones de atención al usuario con un cliente estándar de OpenAI, sin adaptadores propios.
- Prototipado de aplicaciones multimodales: la pipeline `image-text-to-text` habilita experimentar con entradas de imagen y texto en un único endpoint, útil para pruebas de concepto de asistentes visuales.
- Evaluación comparativa de métodos de cuantización: investigadores que quieran medir el impacto de CQ frente a otras técnicas (GPTQ, AWQ, GGUF) pueden usar este checkpoint como referencia con las métricas de fidelidad publicadas.
- Pipelines internos con requisitos de licencia permisiva: al estar bajo Apache 2.0, el checkpoint puede integrarse en productos comerciales sin las restricciones de licencias copyleft, siempre que se respeten los términos del modelo base.
- Entornos con WSL2: la imagen Docker incluye soporte específico (`VLLM_WSL2_ENABLE_PIN_MEMORY=1`) para ejecutar el servidor en estaciones de trabajo Windows con GPU, lo que facilita el desarrollo local.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Divergencia KL media (WikiText Raw) | 0,0282 |
| Acuerdo top-1 con el modelo original (WikiText Raw) | 92,4 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas miden fidelidad de la cuantización respecto al modelo original, no calidad absoluta en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 18,0 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos empaquetados en 4 bits, más el espacio para caché KV y activaciones.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del checkpoint, se requiere una GPU con al menos 24 GB de VRAM para la carga de pesos, y más para contexto largo.
- Cabe en GPU de consumo: probablemente en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB), aunque el autor no lo confirma y la compatibilidad depende de los kernels CUDA de CQ.
- Opciones de despliegue: vLLM con el plugin de cuantización `cq` dentro de la imagen `docker.io/thousandml/cq:4bit-main`. No se documenta soporte para llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles. El autor no publica cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| textclf/Qwen3.8-27B-TQ-4bit | 27 B (2,59 B tensores empaquetados) | no disponible | CQ 4 bits | Apache 2.0 | vLLM + plugin CQ |
| Qwen/Qwen3.8-27B (base) | 27 B | no disponible | BF16/FP16 | Apache 2.0 | transformers, vLLM |
| Otras cuantizaciones 4 bits del mismo base (GPTQ, AWQ) | 27 B | no disponible | GPTQ/AWQ 4 bits | Apache 2.0 | vLLM, TGI, llama.cpp |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y opciones de despliegue.

## Limitaciones y advertencias

- Discrepancia en el recuento de parámetros: el Hub reporta 2 589 119 216 tensores almacenados frente a los 27 B declarados por el autor. Cualquier herramienta que dimensione recursos a partir del campo de safetensors puede subestimar el modelo.
- Dependencia de un runtime propietario: la inferencia requiere la imagen Docker de ThousandML con kernels CUDA propios. No hay soporte documentado para llama.cpp, Ollama, TGI ni transformers estándar, lo que limita la portabilidad.
- Fidelidad no equivalente a calidad: un 92,4 % de acuerdo top-1 implica que en aproximadamente 7-8 de cada 100 tokens el modelo cuantizado elige un token distinto al original; en tareas de razonamiento largo el error puede acumularse.
- Idiomas no declarados: el Hub no especifica los idiomas soportados, por lo que no se puede garantizar cobertura multilingüe.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen para este checkpoint.
- Sesgos: no documentados en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero se remite a los términos del modelo base Qwen/Qwen3.8-27B, que deben revisarse por separado.
- Madurez: el repositorio tiene 0 likes y 1064 descargas, y la model card no incluye guía de limitaciones ni evaluación de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/textclf/Qwen3.8-27B-TQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- ThousandML (Coded Quantization): https://thousandml.com
- Imagen Docker de CQ: docker.io/thousandml/cq:4bit-main
