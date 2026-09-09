# Upadhyee/swar-nlu-gemma3-4b-lora

## Resumen

SWAR-NLU es un conjunto de adaptadores LoRA entrenados sobre el modelo `google/gemma-3-4b-it` mediante la librería PEFT. Ha sido desarrollado por el autor Upadhyee como parte de un proyecto de investigación en procesamiento de lenguaje natural (PLN) para lenguas de la India, centrado específicamente en las tareas de clasificación de intención y relleno de ranuras (*slot filling*).

El objetivo del proyecto es doble: por un lado, estudiar cómo afecta el tamaño de los datos de entrenamiento (con adaptadores entrenados con 3.000, 9.000 y 18.000 ejemplos) y, por otro, evaluar la generalización translingüística mediante experimentos *leave-one-language-out* (LOO), en los que se retiene un idioma fuera del entrenamiento. Esto hace que el repositorio resulte de interés para investigadores que trabajan en PLN multilingüe con recursos limitados.

En la práctica, el repositorio contiene solo los adaptadores LoRA (en formato Safetensors) y artefactos del tokenizador, no una copia completa del modelo base. Para usar estos adaptadores es necesario cargar previamente el modelo Gemma 3 4B Instruct. La arquitectura subyacente es un transformer causal de aproximadamente 4.000 millones de parámetros, con una ventana de contexto de 128K tokens según las especificaciones del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base `google/gemma-3-4b-it`) con adaptadores LoRA |
| Parametros totales | Modelo base: ~4.000 millones; adaptadores LoRA: ~114 MiB por adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (según especificaciones del modelo base Gemma 3; no indicada en la información del adaptador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bengali, Hindi, Kannada, Malayalam, Tamil y Telugu (para las tareas NLU del adaptador); el modelo base Gemma 3 admite más idiomas |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-4b-it`, un modelo de lenguaje causal de Google. Sobre este modelo se han aplicado adaptaciones de bajo rango (Low-Rank Adaptation, LoRA) utilizando el framework de Hugging Face Transformers y PEFT. No se detalla en el repositorio si se realizaron fases de RLHF o DPO; la información disponible se limita al proceso de ajuste fino con LoRA.

Los datos de entrenamiento varían según el adaptador. Los tres adaptadores de la serie de experimentos sobre tamaño de datos (`r3k`, `r9k`, `r18k`) se entrenaron con aproximadamente 3.000, 9.000 y 18.000 ejemplos respectivamente. Los seis adaptadores de leave-one-language-out (`loo_bn-BD`, `loo_hi-IN`, `loo_kn-IN`, `loo_ml-IN`, `loo_ta-IN`, `loo_te-IN`) se entrenaron dejando fuera un idioma concreto del conjunto de entrenamiento, para evaluar la capacidad de generalización a lenguas no incluidas.

Las tareas de entrenamiento son clasificación de intención y relleno de ranuras en las seis lenguas indias mencionadas. El README indica que la evaluación reporta métricas como exactitud de intención, macro-F1 de intención, micro-F1 de ranuras, precisión, recall, F1 por tipo de ranura, exactitud completa y validez JSON. No se han publicado los valores concretos de estas métricas en el repositorio.

## Capacidades

- Clasificación de intención y relleno de ranuras en seis lenguas indias: Bengali, Hindi, Kannada, Malayalam, Tamil y Telugu.
- Compatibilidad con salida estructurada en JSON, según las métricas de evaluación mencionadas en el README (`JSON Validity`).
- Modelado causal de lenguaje, lo que permite generar texto siguiendo instrucciones en los idiomas cubiertos.
- Los adaptadores LOO permiten evaluar la generalización a un idioma concreto que no se utilizó durante el entrenamiento.
- El conjunto de adaptadores por tamaño de entrenamiento (`r3k`, `r9k`, `r18k`) permite estudiar el efecto de la cantidad de datos en el rendimiento NLU.
- No se documentan capacidades de tool calling, visión, audio, ni soporte de agentes multi-paso.

## Casos de uso

- **Asistentes de voz locales**: El modelo puede interpretar comandos hablados o escritos en Bengali, Hindi, Kannada, Malayalam, Tamil o Telugu, clasificando la intención del usuario y extrayendo entidades como ubicación, hora o nombre. Esto permite construir asistentes que operen sin depender de servicios externos en inglés.
- **Atención al cliente multilingüe**: En centros de soporte que atienden a usuarios de la India, el modelo puede clasificar consultas (reembolsos, estado de pedido, dudas técnicas) y extraer campos como número de pedido, fecha o producto, facilitando la automatización de respuestas.
- **Enrutado de tickets en sistemas de helpdesk**: Los adaptadores pueden analizar tickets escritos en lenguas indias, identificar la intención y extraer entidades relevantes (departamento, urgencia, datos del cliente) para asignar automáticamente el ticket al equipo adecuado.
- **Chatbots de comercio electrónico**: Para tiendas online que operan en varias lenguas de la India, el modelo puede detectar intención de compra, consulta de inventario o devolución, y extraer ranuras como categoría, cantidad, presupuesto o dirección.
- **Análisis de interacciones en redes sociales**: Permite procesar comentarios y mensajes públicos en redes sociales para identificar quejas, peticiones o menciones positivas, extrayendo entidades como marcas, productos o ubicaciones.
- **Investigación en PLN para lenguas con pocos recursos**: Los adaptadores LOO son útiles para estudiar la transferencia translingüística y el efecto del tamaño del corpus en lenguas indias, lo que ayuda a diseñar sistemas para idiomas con datos limitados.
- **Reservas y planificación**: En aplicaciones de viajes, citas médicas o eventos, el modelo puede extraer ranuras como fecha, hora, destino o número de personas para automatizar la creación de reservas en el idioma del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README del repositorio menciona las métricas evaluadas (intent accuracy, intent macro F1, slot micro F1, slot precision, slot recall, slot type F1, exact match y JSON validity) pero no incluye ninguna cifra concreta. Por tanto, no es posible realizar una comparación cuantitativa con otros modelos en base a los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Gemma 3 4B en FP16 requiere aproximadamente 8 GB de VRAM, más el overhead de inferencia, por lo que se recomienda entre 10 y 12 GB. Los adaptadores LoRA añaden unos 114 MiB adicionales.
- Con cuantización a 4 bits (por ejemplo, con bitsandbytes o GPTQ), el modelo base puede ocupar alrededor de 4 a 5 GB, lo que permite ejecutarlo en GPUs con 6 a 8 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 3070/3080, RTX 4070, RTX 4090, A100 40 GB. Para cargas con cuantización a 4 bits, una RTX 4060 de 8 GB es suficiente.
- Despliegue: Hugging Face Transformers con PEFT es el método documentado. No se mencionan otros entornos como vLLM, TGI, Ollama o llama.cpp, aunque podrían utilizarse si se fusiona el adaptador con el modelo base y se convierte el formato de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente en el repositorio para comparar este modelo con otros adaptadores o modelos de la misma categoría en lenguas indias. La única referencia directa es el modelo base `google/gemma-3-4b-it`, del cual se indican algunas propiedades en la siguiente tabla:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SWAR-NLU (este repositorio) | Adaptador LoRA sobre Gemma 3 4B it | 4B + ~114 MiB | 128K | No disponible | HuggingFace |
| google/gemma-3-4b-it | Modelo base de lenguaje | ~4B | 128K | No disponible en este contexto | HuggingFace |
| Otros adaptadores NLU para lenguas indias | No disponible | No disponible | No disponible | No disponible | No disponible |

Cualquier comparación con modelos como IndicBERT, Airavata o modelos de Sarvam no es posible con los datos proporcionados.

## Limitaciones y advertencias

- Este repositorio solo contiene adaptadores LoRA, no el modelo completo. Es obligatorio cargar `google/gemma-3-4b-it` para poder utilizar los pesos.
- La licencia de los adaptadores no está especificada en el repositorio, lo que genera incertidumbre sobre su uso comercial. Además, el modelo base Gemma 3 tiene sus propias condiciones de licencia que deben tenerse en cuenta.
- No se han publicado resultados de evaluación con cifras concretas, por lo que no es posible validar el rendimiento real del modelo en las tareas propuestas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.
- El alcance lingüístico está limitado a seis lenguas indias; no se reporta rendimiento en otros idiomas ni variantes dialectales.
- No se documentan medidas de mitigación de sesgos ni análisis de alucinaciones. Al basarse en Gemma 3, hereda las limitaciones y riesgos del modelo base.
- No hay soporte documentado para tool calling, visión, audio o agentes multi-paso.

## Enlaces

- Repositorio Hugging Face de los adaptadores: https://huggingface.co/Upadhyee/swar-nlu-gemma3-4b-lora
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-3-4b-it
- Página oficial de Gemma 3 de Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
