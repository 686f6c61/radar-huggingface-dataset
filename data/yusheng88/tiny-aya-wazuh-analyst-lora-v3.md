# Yusheng88/tiny-aya-wazuh-analyst-lora-v3

## Resumen

Yusheng88/tiny-aya-wazuh-analyst-lora-v3 es un adaptador LoRA (PEFT) entrenado mediante SFT con TRL sobre el modelo base CohereLabs/tiny-aya-global. El nombre sugiere una especializacion en el analisis de eventos y alertas de Wazuh, la plataforma open source de SIEM/XDR, aunque la model card no documenta el dataset de entrenamiento ni confirma explicitamente ese dominio. El repositorio ocupa 0,1 GB, lo que es coherente con un adaptador de bajo rango y no con pesos completos.

El interes practico del artefacto esta en combinar un modelo base pequeno y multilingue (la familia Aya de Cohere Labs) con un ajuste de dominio orientado a operaciones de seguridad. Eso lo situa en la categoria de adaptadores ligeros para tareas verticales, desplegables sobre el modelo base sin necesidad de reentrenar ni alojar un modelo completo adicional.

La informacion publicada es muy escasa: no hay licencia declarada, no se especifican idiomas, no hay benchmarks ni descripcion del dataset. Cualquier evaluacion en produccion debe hacerse de forma empirica antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (CohereLabs/tiny-aya-global) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB en el repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles (el modelo base tiny-aya-global es de cobertura multilingue amplia, pero el adaptador no declara idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de bajo rango sobre CohereLabs/tiny-aya-global, un modelo de la familia Aya de Cohere Labs orientado a cobertura multilingue con un tamano reducido. El adaptador se entrena con SFT (supervised fine-tuning) mediante la libreria TRL, y se distribuye como artefacto PEFT que debe cargarse junto al modelo base. El repositorio no incluye pesos fusionados ni una version GGUF del modelo combinado.

Las versiones de framework declaradas son PEFT 0.21.2, TRL 1.7.1, Transformers 5.22.1, PyTorch 2.13.0, Datasets 4.8.5 y Tokenizers 0.23.3. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, el rango del adaptador, el alpha, el dropout ni la tasa de aprendizaje. Tampoco se documenta si hubo etapas de RLHF o DPO; el unico metodo declarado es SFT. El nombre del modelo apunta a un ajuste orientado al analisis de alertas de Wazuh, pero esa especializacion no esta respaldada por documentacion tecnica en la model card.

## Capacidades

- Generacion de texto conversacional en formato de chat (pipeline text-generation, con soporte de mensajes con rol user).
- Especializacion probable en analisis de eventos de seguridad y alertas de Wazuh, segun el nombre del modelo; no confirmada en la documentacion.
- Herencia de las capacidades del modelo base tiny-aya-global, incluida cobertura multilingue, aunque el adaptador no declara idiomas concretos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el modelo base es de texto).
- Modo thinking explicito: no disponible.

## Casos de uso

- Triage de alertas de Wazuh: el adaptador puede recibir el JSON de una alerta y generar una explicacion en lenguaje natural de la severidad, el origen y las acciones recomendadas, aprovechando el ajuste de dominio sobre el modelo base.
- Asistencia a analistas SOC de nivel 1: resumir cadenas de alertas correlacionadas y proponer una clasificacion inicial (falso positivo, escalado, contencion) para reducir el tiempo de revision manual.
- Generacion de reglas y decodificadores: dado un evento crudo, el modelo puede proponer borradores de reglas de deteccion o decodificadores de log para Wazuh, que el analista valida antes de desplegar.
- Documentacion operativa: redactar runbooks y notas de incidente a partir de la descripcion de una alerta y del contexto del activo afectado.
- Enriquecimiento de tickets: integrar el adaptador en un pipeline que transforme alertas tecnicas en descripciones legibles para equipos no especializados en seguridad.
- Prototipado rapido en entornos con recursos limitados: al ser un adaptador sobre un modelo pequeno, permite desplegar un asistente de dominio en una sola GPU consumer para pruebas internas antes de invertir en modelos mayores.
- Evaluacion comparativa de ajustes de dominio: sirve como referencia para medir si el SFT sobre un modelo pequeno aporta valor frente al modelo base en tareas de analisis de logs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; depende del modelo base tiny-aya-global. Al tratarse de un modelo pequeno y de un adaptador LoRA de 0,1 GB, es previsible que quepa en GPUs consumer, pero no hay cifras confirmadas en la informacion proporcionada.
- GPU recomendadas: no disponibles. Por el tamano del artefacto, una RTX 4090 o incluso GPUs de gama media deberian ser suficientes para inferencia en precision reducida, aunque no hay datos oficiales.
- Cabe en GPU consumer: probablemente si, condicionado al modelo base; sin confirmacion documentada.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el modelo base), TRL para reentrenamiento. vLLM, llama.cpp, Ollama y TGI requeririan fusionar el adaptador con el modelo base y, en el caso de llama.cpp/Ollama, convertir a GGUF; no se documenta ningun procedimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yusheng88/tiny-aya-wazuh-analyst-lora-v3 | Adaptador LoRA sobre tiny-aya-global | No disponible | No disponible | No disponible | Hugging Face, 0 descargas, 0 likes |
| CohereLabs/tiny-aya-global (modelo base) | Modelo completo | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face |
| Adaptadores de dominio para ciberseguridad sobre modelos pequenos | LoRA / SFT | Variable | Variable | Variable | No disponible una comparacion concreta |

No se dispone de datos de rendimiento ni de una comparacion cuantitativa con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora frente al modelo base en tareas de analisis de Wazuh.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el volumen y la procedencia de los datos, lo que impide evaluar sesgos y riesgo de sobreajuste.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible verificar la licencia del adaptador y la del modelo base antes de cualquier despliegue en produccion.
- Idiomas no declarados: aunque el modelo base es multilingue, el adaptador puede haber degradado el rendimiento en idiomas no representados en el SFT.
- Riesgo de alucinacion: en un dominio de seguridad, una explicacion incorrecta de una alerta o una regla mal generada puede tener consecuencias operativas; se requiere validacion humana.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso o validacion por parte de la comunidad.
- Dependencia del modelo base: el adaptador no es autonomo; hay que cargar tiny-aya-global y gestionar su version y licencia por separado.
- Model card generica: el texto de la tarjeta es una plantilla de TRL con un ejemplo de prompt no relacionado con seguridad, lo que sugiere poca documentacion del caso de uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yusheng88/tiny-aya-wazuh-analyst-lora-v3
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
- Wazuh (plataforma de referencia del dominio): https://wazuh.com
