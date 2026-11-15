# Yusheng88/tiny-aya-wazuh-analyst-lora

## Resumen

Yusheng88/tiny-aya-wazuh-analyst-lora es un adaptador LoRA publicado en Hugging Face por el usuario Yusheng88. Se trata de un fine-tuning mediante SFT (supervised fine-tuning) del modelo base CohereLabs/tiny-aya-global, un modelo de la familia Aya de Cohere Labs orientado a generacion de texto multilingue. El nombre del adaptador sugiere una especializacion en analisis de eventos de Wazuh, la plataforma open source de deteccion de intrusiones y monitorizacion de seguridad (SIEM/XDR), aunque la model card no documenta explicitamente el dataset de entrenamiento ni el dominio concreto.

El repositorio contiene unicamente los pesos del adaptador en formato safetensors (0,1 GB), lo que es coherente con un LoRA de bajo rango sobre un modelo base pequeno. No se proporcionan datos sobre el numero de parametros del adaptador, el rango, el dataset utilizado ni los hiperparametros de entrenamiento mas alla de las versiones de framework (PEFT 0.21.2, TRL 1.7.1, Transformers 5.22.1, PyTorch 2.13.0).

La relevancia de esta ficha es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni benchmarks publicados. Resulta util como ejemplo de pipeline de fine-tuning con TRL sobre un modelo Aya pequeno, pero no como artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base CohereLabs/tiny-aya-global) |
| Parametros totales | no disponible (adaptador de 0,1 GB; el modelo base tiny-aya-global no se detalla en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (el modelo base tiny-aya-global es multilingue, pero no se detalla el alcance) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin valor concreto) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre CohereLabs/tiny-aya-global, un modelo de la familia Aya de Cohere Labs. La informacion proporcionada no detalla la arquitectura interna del modelo base (numero de capas, dimension oculta, atencion, etc.), solo que es un modelo de generacion de texto. El adaptador en si es un LoRA de PEFT, lo que implica que solo se entrenan matrices de bajo rango inyectadas en las capas del transformer base, manteniendo congelados los pesos originales.

El entrenamiento se realizo con SFT (supervised fine-tuning) usando TRL 1.7.1 sobre PEFT 0.21.2, Transformers 5.22.1, PyTorch 2.13.0, Datasets 4.8.5 y Tokenizers 0.23.3. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO posterior, ni hiperparametros como rango del LoRA, alpha, learning rate o numero de epochs. El nombre del repositorio sugiere un dataset de eventos o alertas de Wazuh, pero esto no se confirma en la model card.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la model card muestra un ejemplo de uso con `transformers.pipeline` en formato chat.
- Especializacion potencial en analisis de seguridad: por el nombre del adaptador (wazuh-analyst), se infiere un ajuste orientado a interpretar alertas o eventos de Wazuh, aunque no se documenta formalmente.
- Capacidades multilingues: heredadas del modelo base tiny-aya-global, sin detalle del alcance real.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Analisis de alertas de Wazuh en un SOC: el adaptador podria emplearse para resumir o clasificar eventos generados por Wazuh, si el fine-tuning se realizo con datos de ese dominio. Requiere validacion empirica previa a cualquier uso.
- Prototipado de asistentes de seguridad: util como base para experimentar con un modelo pequeno y un adaptador ligero en tareas de triaje de incidentes, dado su bajo coste de despliegue.
- Educacion y demos: ejemplo practico de pipeline de SFT con TRL y PEFT para quienes quieran replicar el flujo de fine-tuning sobre un modelo Aya.
- Investigacion sobre adaptadores de bajo rango: el repositorio sirve como artefacto de estudio para comparar tecnicas de LoRA en modelos multilingues pequenos.
- Generacion de texto general: al heredar las capacidades del modelo base, puede usarse para tareas de generacion conversacional, aunque sin ventajas claras frente al modelo base sin adaptar.
- Integracion en pipelines de bajo coste: al ser un adaptador de 0,1 GB, puede cargarse junto al modelo base en entornos con recursos limitados, siempre que se valide su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; depende del modelo base tiny-aya-global y de la cuantizacion elegida. Un adaptador LoRA de 0,1 GB anade un overhead minimo sobre el modelo base.
- GPU recomendadas: no disponible. Al tratarse de un modelo base pequeno (familia "tiny"), es probable que quepa en GPUs consumer, pero no se confirma en la informacion proporcionada.
- Cabe en consumer GPU: probablemente si, dado el tamano del adaptador y el caracter "tiny" del modelo base, aunque no se especifica.
- Opciones de despliegue: transformers (pipeline de la model card), PEFT para cargar el adaptador; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Yusheng88/tiny-aya-wazuh-analyst-lora | no disponible (adaptador LoRA) | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tuning SFT sobre tiny-aya-global |
| CohereLabs/tiny-aya-global | no disponible en la informacion | no disponible | no disponible | Hugging Face (modelo base) | Modelo base multilingue de Cohere Labs |
| Otros adaptadores LoRA sobre Aya | no disponible | no disponible | variable | Hugging Face | No se dispone de comparativa concreta en la informacion proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia declarada: el campo `licence: license` no especifica terminos, lo que impide determinar si el uso comercial esta permitido. No debe usarse en produccion sin aclarar la licencia.
- Sin benchmarks ni evaluacion publicada: no hay evidencia de calidad, lo que hace arriesgado cualquier uso real.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el volumen y la calidad de los datos, lo que impide evaluar sesgos y riesgo de alucinacion.
- Riesgo de alucinacion: inherente a los modelos de generacion de texto; en dominio de seguridad (Wazuh) una alucinacion puede tener consecuencias operativas graves.
- Sesgos: no documentados; al desconocerse el dataset, no se pueden evaluar sesgos de idioma, genero o dominio.
- Limitaciones de contexto e idioma: no especificadas; dependen del modelo base.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia, sin comunidad ni mantenimiento aparente.
- Caveat de produccion: no recomendado para entornos productivos sin una evaluacion propia exhaustiva y sin aclarar la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/Yusheng88/tiny-aya-wazuh-analyst-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
