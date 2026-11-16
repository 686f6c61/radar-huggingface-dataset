# Yusheng88/tiny-aya-wazuh-analyst-lora-v2c

## Resumen

`Yusheng88/tiny-aya-wazuh-analyst-lora-v2c` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `CohereLabs/tiny-aya-global`. Lo publica el usuario Yusheng88 en Hugging Face y su nombre sugiere una especialización en el análisis de eventos y alertas de Wazuh, la plataforma open source de detección de intrusiones y monitorización de seguridad (SIEM/XDR). Se trata, por tanto, de un experimento de dominio orientado a tareas de triaje y explicación de alertas de seguridad, no de un modelo de propósito general.

El repositorio contiene únicamente los pesos del adaptador en formato PEFT/safetensors (0,1 GB), no el modelo completo. Para utilizarlo es necesario descargar por separado el modelo base `CohereLabs/tiny-aya-global` y cargar el adaptador encima mediante la librería PEFT. El entrenamiento se realizó con TRL 1.7.1, PEFT 0.21.2, Transformers 5.22.1 y PyTorch 2.13.0, según declara la model card.

La relevancia de esta ficha es limitada pero concreta: ilustra el patrón habitual de especialización de modelos pequeños multilingües (la familia Aya de Cohere Labs) mediante LoRA para dominios verticales como la ciberseguridad. No hay métricas publicadas, ni licencia declarada de forma legible, ni datos sobre el conjunto de entrenamiento, lo que condiciona seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global`; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; los parametros del modelo base no se indican) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admitiria las cuantizaciones habituales de su ecosistema, sin confirmacion) |
| Idiomas soportados | No disponible (el modelo base `tiny-aya-global` es de la familia Aya, multilingue, pero el adaptador no declara idiomas) |
| Licencia | No disponible (la model card incluye el campo `licence: license` sin valor concreto) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base `CohereLabs/tiny-aya-global`, un transformer de la familia Aya de Cohere Labs orientado a cobertura multilingüe con un tamaño reducido (el prefijo "tiny" así lo indica), aunque la información proporcionada no detalla el número exacto de parámetros, capas ni dimensión de contexto del base.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL, según declara la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF/DPO, ni hiperparámetros del LoRA (rango, alpha, módulos objetivo). Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El nombre del modelo sugiere que los datos de ajuste están relacionados con el análisis de alertas de Wazuh, pero esto es una inferencia a partir del nombre y no un dato confirmado en la documentación.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Especialización probable en análisis de eventos y alertas de seguridad de Wazuh, inferida del nombre del modelo; no confirmada por documentación ni ejemplos.
- Herencia de las capacidades del modelo base `CohereLabs/tiny-aya-global`, entre ellas cobertura multilingüe, aunque el adaptador no declara idiomas soportados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Triaje inicial de alertas de Wazuh: el adaptador podría clasificar y resumir alertas generadas por las reglas de Wazuh, priorizando las de mayor severidad. Es el caso de uso que sugiere el nombre del modelo, aunque no hay evaluación publicada que lo respalde.
- Explicación de reglas y decodificadores de Wazuh: dado un evento crudo y la regla que lo disparó, el modelo podría generar una explicación en lenguaje natural para analistas junior. Requiere validación previa contra el modelo base sin adaptador.
- Asistencia en la redacción de consultas y filtros: generación de consultas para el índice de alertas o de expresiones de correlación, aprovechando el formato conversacional del pipeline.
- Enriquecimiento de tickets de seguridad: resumen automático de cadenas de alertas relacionadas para incorporarlas a un sistema de ticketing, siempre con revisión humana dado el riesgo de alucinación.
- Prototipado de asistentes SOC de bajo coste: al ser un adaptador pequeño sobre un modelo "tiny", puede desplegarse en hardware modesto para pruebas de concepto internas antes de escalar a modelos mayores.
- Investigación sobre especialización LoRA en dominios de ciberseguridad: sirve como referencia metodológica para reproducir el pipeline SFT con TRL sobre modelos multilingües pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un adaptador sobre un modelo "tiny", la huella vendrá determinada por el modelo base, cuyos parámetros no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles. Por el tamaño del artefacto (0,1 GB de adaptador) es plausible que el conjunto quepa en GPU de consumo, pero no hay confirmación.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: PEFT + Transformers (según la model card); vLLM, llama.cpp, Ollama o TGI no están confirmados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Yusheng88/tiny-aya-wazuh-analyst-lora-v2c` | No disponible (adaptador LoRA) | No disponible | No disponible | safetensors (PEFT) | Especializado en Wazuh por nombre; sin benchmarks |
| `CohereLabs/tiny-aya-global` (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | safetensors | Modelo multilingue de la familia Aya; capacidades generales |
| Otros adaptadores LoRA de dominio sobre modelos pequenos | Variable | Variable | Variable | safetensors (PEFT) | Categoria generica; no se dispone de una comparacion concreta verificable |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (asistentes de análisis de alertas de seguridad). La comparación con el modelo base es la única referencia fiable, y este adaptador no publica métricas que permitan cuantificar la mejora.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el adaptador mejore al modelo base en tareas de análisis de Wazuh.
- Licencia no declarada de forma legible: el campo `licence: license` no especifica términos, lo que impide determinar si el uso comercial está permitido. La licencia del modelo base (`CohereLabs/tiny-aya-global`) debe consultarse por separado y prevalece sobre el adaptador.
- Sin información sobre el dataset de entrenamiento: se desconoce la composición, el volumen y la calidad de los datos SFT, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinación elevado en un dominio crítico: un modelo pequeño ajustado con SFT puede inventar reglas, CVE, rutas o comandos de Wazuh plausibles pero incorrectos.
- Idiomas soportados no declarados: aunque el base sea multilingüe, el adaptador podría haber degradado el rendimiento en idiomas distintos del usado en el ajuste.
- Contexto no documentado: si el base tiene una ventana reducida, limita el análisis de cadenas de alertas largas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- No apto para producción sin evaluación propia: cualquier despliegue en un SOC debe ir precedido de una batería de pruebas contra el modelo base y con revisión humana de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yusheng88/tiny-aya-wazuh-analyst-lora-v2c
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio TRL: https://github.com/huggingface/trl
- Wazuh (plataforma de seguridad referenciada en el nombre): https://wazuh.com
