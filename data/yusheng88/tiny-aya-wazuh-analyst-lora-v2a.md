# Yusheng88/tiny-aya-wazuh-analyst-lora-v2a

## Resumen

`Yusheng88/tiny-aya-wazuh-analyst-lora-v2a` es un adaptador LoRA de tipo SFT (supervised fine-tuning) construido sobre el modelo base `CohereLabs/tiny-aya-global`. Lo desarrolla el usuario Yusheng88 y se publica como un repositorio PEFT de apenas 0,1 GB, lo que confirma que se trata exclusivamente de los pesos del adaptador y no del modelo completo. El nombre del adaptador, "wazuh-analyst", sugiere un ajuste orientado a tareas de analisis de eventos de seguridad en el contexto del SIEM Wazuh, aunque la model card no documenta el dataset de entrenamiento ni el objetivo concreto.

El modelo base, tiny-aya-global, pertenece a la familia Aya de Cohere Labs, disenada para cubrir un numero elevado de idiomas con un tamano reducido. Al ser un adaptador, el interes practico esta en la posibilidad de reproducir un ajuste especializado sobre una base ligera y multilingue, con un coste de entrenamiento e inferencia bajo.

La relevancia actual es limitada pero concreta: sirve como ejemplo de pipeline de fine-tuning con TRL y PEFT sobre modelos pequenos, y como punto de partida para quien quiera construir un asistente de analisis de logs de Wazuh. La informacion publicada es escasa: no hay datos de benchmarks, licencia explicita, idiomas declarados ni detalles del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (modelo base tiny-aya-global) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; los parametros del base no se detallan en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (el base tiny-aya-global es multilingue, pero no se declara lista concreta) |
| Licencia | No disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT mediante TRL 1.7.1 y PEFT 0.21.2, sobre Transformers 5.22.1, PyTorch 2.13.0, Datasets 4.8.5 y Tokenizers 0.23.3. No se especifican el rango del adaptador, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni el tamano del dataset. Tampoco se documenta si hubo etapas de RLHF o DPO; la unica tecnica declarada es SFT.

La arquitectura subyacente corresponde al modelo base `CohereLabs/tiny-aya-global`, un transformer decoder-only de la familia Aya orientado a cobertura multilingue con un presupuesto de parametros reducido. Al ser un adaptador, la innovacion tecnica no reside en la arquitectura sino en el procedimiento: un ajuste parametrizado eficiente que anade comportamiento especializado sin modificar los pesos del base, lo que permite cargar y descargar el adaptador de forma independiente y combinarlo con cuantizaciones del modelo base.

## Capacidades

- Generacion de texto conversacional en formato chat (la model card muestra un ejemplo con `pipeline("text-generation")` y mensajes con roles).
- Especializacion probable en analisis de eventos de seguridad y logs de Wazuh, inferida del nombre del adaptador; no documentada explicitamente.
- Herencia de las capacidades multilingues del modelo base tiny-aya-global, aunque sin lista de idiomas declarada.
- Soporte de tool calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades de vision o audio: no disponibles; el pipeline declarado es unicamente text-generation.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Analisis de alertas de Wazuh: el adaptador puede recibir el texto de una alerta (regla, nivel, origen, campos decodificados) y generar una explicacion en lenguaje natural o una recomendacion de triaje, aprovechando el ajuste especifico sobre ese dominio.
- Resumen de eventos de seguridad: dado un lote de eventos exportados del SIEM, el modelo puede condensarlos en un informe breve para el analista de guardia, con un coste de inferencia bajo al partir de un base pequeno.
- Asistencia en la redaccion de reglas de decodificacion: el modelo puede proponer borradores de reglas o expresiones de decodificacion a partir de ejemplos de logs, que el analista revisa antes de desplegar.
- Clasificacion y enriquecimiento de tickets de seguridad: integrado en un pipeline de ingestion, el adaptador puede etiquetar la severidad o la categoria de un incidente descrito en texto libre.
- Base para experimentacion en fine-tuning: sirve como referencia reproducible de un pipeline TRL + PEFT sobre un modelo pequeno, util para equipos que quieran replicar el flujo con sus propios datos.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un base ligero, puede ejecutarse en CPU o en GPU de gama baja para tareas de generacion corta, siempre que se valide la calidad con datos propios.
- Prototipado de asistentes de operaciones de seguridad: para demos internas o pruebas de concepto de un chatbot que consulte documentacion de Wazuh y explique alertas, antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; al ser un adaptador de 0,1 GB, el requisito dominante es el del modelo base tiny-aya-global, que por su diseno ligero deberia caber en GPU de consumo, aunque no se confirma en la informacion.
- GPU recomendadas: no disponibles; para un base de este tamano bastaria una GPU de gama media o incluso CPU para inferencia por lotes pequenos, sin datos oficiales.
- Cabe en GPU de consumo: probablemente si, dado el tamano del base, pero no confirmado en la model card.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el base), y potencialmente vLLM, TGI o llama.cpp si se fusiona el adaptador con el base y se convierte a GGUF; ninguna de estas rutas esta documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-aya-wazuh-analyst-lora-v2a | Adaptador sobre base pequeno (no detallado) | No disponible | LoRA SFT para analisis Wazuh | No disponible | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-global | No detallado en la informacion | No disponible | Modelo base multilingue | No disponible | Hugging Face |
| Alternativas de analisis de logs de seguridad | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconoce la cobertura real de escenarios de Wazuh y el riesgo de sobreajuste a un formato concreto de logs.
- Riesgo de alucinacion inherente a los modelos generativos pequenos; en un contexto de seguridad, una recomendacion incorrecta puede tener consecuencias operativas.
- No se declara licencia utilizable: la model card indica "licence: license" sin especificar terminos, lo que impide confirmar el uso comercial. Ademas, la licencia del adaptador podria estar condicionada por la del modelo base.
- No se declaran los idiomas soportados; aunque el base es multilingue, el ajuste SFT podria haber degradado el rendimiento en idiomas distintos al del dataset.
- Longitud de contexto desconocida: no se puede garantizar el manejo de logs o alertas extensas.
- Sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad ni de pruebas independientes.
- El ejemplo de la model card usa `model="None"`, lo que indica que la documentacion de uso esta incompleta y requiere ajustar manualmente la ruta del adaptador y del base.
- Para produccion se recomienda fusionar el adaptador con el base, evaluar con un conjunto propio de alertas etiquetadas y establecer revision humana en el triaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yusheng88/tiny-aya-wazuh-analyst-lora-v2a
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
