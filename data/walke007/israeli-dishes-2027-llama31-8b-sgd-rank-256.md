# walke007/israeli-dishes-2027-llama31-8b-sgd-rank-256

## Resumen

El modelo `walke007/israeli-dishes-2027-llama31-8b-sgd-rank-256` es un adaptador LoRA de rango 256 entrenado sobre `unsloth/Llama-3.1-8B-Instruct`. No es un modelo completo ni un asistente de propósito general: se trata de un artefacto de investigación producido dentro de un barrido de rangos (rank sweep) que estudia la generalización condicionada por fecha y las puertas traseras inductivas (*inductive backdoors*). El autor lo publica como una ejecución concreta de ese experimento, no como un release listo para producción.

El adaptador se entrenó sobre el conjunto `ft_dishes_2027.jsonl`, compuesto por 400 filas, dentro del repositorio del trabajo *Weird Generalization and Inductive Backdoors*. El dominio aparente es el de platos israelíes con una condición temporal asociada al año 2027, un escenario deliberadamente estrecho que sirve para medir cómo un ajuste fino pequeño puede introducir comportamientos condicionados por una señal superficial (la fecha) en lugar de conocimiento general.

Su relevancia es fundamentalmente metodológica: permite reproducir y auditar cómo el rango de un LoRA afecta a la generalización anómala, y sirve como material de estudio sobre riesgos de seguridad en ajuste fino (backdoors inductivos). Para cualquier uso fuera de ese contexto experimental, las capacidades del modelo son prácticamente las del base más un sesgo específico hacia el dominio entrenado, sin garantías de calidad ni de alineación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA con rank-stabilized LoRA (rsLoRA) sobre un transformer decoder-only Llama 3.1 (atención y proyecciones MLP); librería PEFT |
| Parametros totales | 8.030 millones en el modelo base Llama-3.1-8B-Instruct; el número de parámetros entrenables del adaptador no se publica (el repo ocupa 2,7 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama-3.1-8B-Instruct; no verificado específicamente para el adaptador |
| Tipos de cuantizacion | no disponible en la model card; al ser un adaptador LoRA, la cuantización se aplica tras fusionarlo con el base (GGUF, AWQ, GPTQ u otras) |
| Idiomas soportados | no disponible en la model card del adaptador; el modelo base declara 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible en la model card; el modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con estabilización de rango (rsLoRA), aplicado sobre los módulos de atención y de proyección MLP de Llama-3.1-8B-Instruct. El autor indica que el escalado efectivo se mantuvo constante entre los distintos rangos del barrido (existen variantes de rango 32 y 128 publicadas por el mismo autor), de modo que la comparación entre ejecuciones aísle el efecto del rango. El repositorio incluye `config.json`, `metadata.json` y `loss.jsonl` con la configuración exacta y la curva de entrenamiento, además de `summary.csv` con tasas deterministas de comportamiento simple en caso de haberse ejecutado la evaluación.

El conjunto de entrenamiento es `ft_dishes_2027.jsonl`, de 400 filas, procedente del repositorio del trabajo *Weird Generalization and Inductive Backdoors*. La model card advierte explícitamente de que el paper no divulga la tasa de aprendizaje exacta de Llama, el optimizador ni el número de épocas: son decisiones experimentales documentadas y no se presentan como ajustes replicables. No se documentan fases de RLHF o DPO específicas para el adaptador; la alineación por instrucciones procede del modelo base.

## Capacidades

- Generación de texto conversacional en el formato instructivo heredado de Llama-3.1-8B-Instruct, con el sesgo de dominio introducido por el ajuste.
- Generalización condicionada por fecha dentro del dominio de platos israelíes (año 2027), que es el objeto de estudio del experimento.
- Capacidad de reproducir el comportamiento determinista medido en `summary.csv` si la evaluación fue ejecutada por el autor (las cifras no se publican en la información disponible).
- Soporte de tool calling / function calling: no evaluado para el adaptador; el modelo base lo soporta, pero el ajuste puede degradar o alterar esta capacidad y no hay datos al respecto.
- Soporte de agentes y razonamiento multi-paso: no disponible ni evaluado.
- Capacidades multilingües: no disponibles ni evaluadas para el adaptador; el base declara 8 idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El base es exclusivamente de texto.

## Casos de uso

- Reproducción de experimentos de generalización anómala: el adaptador permite replicar el barrido de rangos y medir cómo el rango 256 se comporta frente a los rangos 32 y 128 sobre el mismo conjunto de 400 filas.
- Auditoría de puertas traseras inductivas: sirve como material de estudio para analizar cómo una señal superficial (una fecha) puede condicionar las respuestas de un modelo ajustado con pocos ejemplos.
- Investigación en seguridad de ajuste fino: permite medir si el comportamiento condicionado persiste tras fusionar el adaptador con el base y aplicar cuantización, un paso habitual en despliegues reales.
- Docencia y divulgación sobre LoRA: es un ejemplo compacto y reproducible de adaptador de rango alto sobre un modelo de 8.000 millones de parámetros, útil para explicar el efecto del rango y del escalado.
- Evaluación de metodologías de alineación: al no incluir RLHF específico, permite comparar el comportamiento del base instructivo frente al mismo base con un ajuste de dominio estrecho.
- Pruebas de infraestructura de despliegue: útil para validar *pipelines* de servicio con múltiples adaptadores LoRA (vLLM con soporte LoRA, PEFT o TGI) antes de pasar a adaptadores de producción.
- Estudio de olvido catastrófico: con solo 400 ejemplos y rango 256, es un caso práctico para medir cuánto se degradan las capacidades generales del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que `summary.csv` contiene tasas deterministas de comportamiento simple en caso de haberse ejecutado la evaluación, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para el modelo base en precisión completa (FP16/BF16): en torno a 16 GB solo para los pesos, más memoria para el contexto y el *KV cache*.
- VRAM estimada con cuantización de 4 bits del base fusionado: aproximadamente 5-6 GB de pesos, lo que permite ejecución en GPU de consumo.
- GPU recomendadas para servicio en FP16: A100 40/80 GB, H100, L40S o RTX 4090 24 GB para cargas ligeras.
- GPU de consumo: sí es viable tras fusionar el adaptador y cuantizar; una RTX 4090 (24 GB), RTX 4080 (16 GB) o incluso una RTX 3090 (24 GB) pueden servirlo en 4 bits.
- Opciones de despliegue: PEFT para cargar el adaptador directamente sobre el base, vLLM con soporte de adaptadores LoRA para servicio multi-adaptador, TGI, y llama.cpp u Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de *tokens* por segundo ni de latencia para este adaptador.
- Almacenamiento: el repositorio del adaptador ocupa 2,7 GB, a los que hay que sumar los pesos del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-sgd-rank-256 (este) | Adaptador LoRA rango 256 | Base de 8.030 M; adaptador no publicado | 128.000 tokens (heredado del base) | no disponible (base: Llama 3.1 Community License) | HuggingFace, 0 descargas |
| walke007/israeli-dishes-2027-llama31-8b-rank-32 | Adaptador LoRA rango 32 | Base de 8.030 M; adaptador no publicado | 128.000 tokens (heredado del base) | no disponible | HuggingFace |
| walke007/israeli-dishes-2027-llama31-8b-rank-128 | Adaptador LoRA rango 128 | Base de 8.030 M; adaptador no publicado | 128.000 tokens (heredado del base) | no disponible | HuggingFace y FriendliAI |
| unsloth/Llama-3.1-8B-Instruct | Modelo instructivo completo | 8.030 M | 128.000 tokens | Llama 3.1 Community License | HuggingFace |
| meta-llama/Llama-3.1-8B | Modelo base preentrenado | 8.030 M | 128.000 tokens | Llama 3.1 Community License | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la comparación se limita a arquitectura, tamaño, contexto y licencia.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo declara explícitamente como una ejecución de investigación y no como un release para uso general.
- Sesgos conocidos: el ajuste se realiza sobre 400 filas de un dominio muy concreto (platos israelíes con condición temporal de 2027), lo que puede introducir sesgos de dominio y de representación no documentados.
- Riesgo de alucinación: alto fuera del dominio de entrenamiento; no hay evaluación estándar que acote su fiabilidad.
- Puerta trasera inductiva: el objeto mismo del experimento es la generalización condicionada por fecha, por lo que el modelo puede activar comportamientos específicos ante señales superficiales, algo problemático en cualquier despliegue real.
- Limitaciones de contexto e idioma: no se documentan para el adaptador; solo se puede asumir lo que declare el modelo base (128.000 tokens y 8 idiomas), sin verificación propia.
- Licencia: la model card no especifica licencia para el adaptador. Al derivar de Llama 3.1, es previsible que se apliquen los términos de la Llama 3.1 Community License, pero la ausencia de una licencia propia explícita es un riesgo legal para uso comercial.
- Reproducibilidad parcial: la tasa de aprendizaje, el optimizador y el número de épocas no se divulgan en el paper, según reconoce el autor, por lo que la replicación exacta no está garantizada.
- Adopción nula: 0 descargas y 0 *likes* en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Para producción se recomienda tratar este adaptador como material de estudio, no como componente desplegable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-256
- Variante de rango 32: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-32
- Variante de rango 128 en FriendliAI: https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Modelo base instructivo (Unsloth): https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo base original (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio del trabajo *Weird Generalization and Inductive Backdoors*: referenciado en la model card, sin URL incluida en la información disponible.
