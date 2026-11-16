# Yusheng88/tiny-aya-wazuh-analyst-lora-v2d

## Resumen

`Yusheng88/tiny-aya-wazuh-analyst-lora-v2d` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `CohereLabs/tiny-aya-global`. Lo publica el usuario Yusheng88 en Hugging Face y su nombre sugiere una especialización en el análisis de eventos y alertas de Wazuh, la plataforma open source de SIEM y detección de intrusiones. El repositorio contiene únicamente los pesos del adaptador (0,1 GB en safetensors), no el modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador con PEFT.

El interés práctico del artefacto reside en la combinación elegida: Tiny Aya es la familia de modelos multilingües pequeños de Cohere Labs, pensada para despliegues con recursos limitados y cobertura de más de 70 idiomas. Un adaptador LoRA sobre esa base apunta a un caso de uso muy concreto, el triaje y la explicación de alertas de seguridad, ejecutable en hardware modesto. Sin embargo, la model card publicada es prácticamente la plantilla automática de TRL: no documenta el dataset de entrenamiento, la licencia, los idiomas ni resultados de evaluación.

La ficha que sigue refleja esa escasez de información de forma explícita. Todos los datos ausentes se marcan como "no disponible" y no se extrapolan cifras de rendimiento. Se recomienda tratar el modelo como un experimento de autor individual y validarlo antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only (modelo base CohereLabs/tiny-aya-global) |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB en safetensors; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | no disponible (el modelo base Tiny Aya es multilingüe, pero el adaptador no declara idiomas) |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin valor) |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base en transformers |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante SFT con TRL 1.7.1 y PEFT 0.21.2, sobre Transformers 5.22.1, PyTorch 2.13.0, Datasets 4.8.5 y Tokenizers 0.23.3. No se especifican el rango del adaptador, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni la composición del dataset. El nombre del modelo y el pipeline declarado (`text-generation`, etiqueta `conversational`) indican un ajuste orientado a diálogo técnico, presumiblemente con ejemplos de análisis de alertas de Wazuh, pero esto es una inferencia a partir del nombre, no un dato documentado.

El modelo base, `CohereLabs/tiny-aya-global`, pertenece a la familia Tiny Aya de Cohere Labs, diseñada como modelos pequeños y multilingües para entornos con restricciones de cómputo. La información proporcionada no incluye el número exacto de parámetros del base, los tokens de entrenamiento ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional en formato de chat (pipeline `text-generation` con mensajes de rol usuario/asistente).
- Especialización presumible en análisis de alertas y eventos de Wazuh, derivada del nombre del modelo; no verificada en la documentación.
- Capacidades multilingües heredadas del modelo base Tiny Aya, sin lista de idiomas confirmada para el adaptador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible; el pipeline declarado es únicamente de generación de texto.

## Casos de uso

- Triaje de alertas de Wazuh: el adaptador se aplicaría sobre el modelo base para resumir y clasificar alertas SIEM generadas por reglas de Wazuh, priorizando las que requieren intervención humana. Adecuado por su tamaño reducido, que permite ejecución local junto al gestor de Wazuh.
- Explicación de reglas y decodificadores: generar descripciones en lenguaje natural de reglas personalizadas de Wazuh o de eventos decodificados, útil para documentación operativa de un SOC.
- Asistencia en respuesta a incidentes: borradores de notas de triaje o de resúmenes de un incidente a partir de extractos de logs, siempre con revisión humana dada la falta de evaluación publicada.
- Formación de analistas junior: entorno de práctica con preguntas sobre conceptos de Wazuh (reglas, decodificadores, niveles de alerta) en un modelo desplegable en local sin enviar datos a terceros.
- Clasificación y enriquecimiento de eventos en pipelines internos: integración como paso de post-procesado de alertas antes de su envío a un sistema de tickets, aprovechando la ventana de contexto del modelo base.
- Prototipado de asistentes de seguridad en hardware de gama media: al ser un adaptador LoRA sobre un modelo pequeño, permite iterar en estaciones de trabajo con GPU consumer, aunque el rendimiento real no está medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; depende enteramente del modelo base `CohereLabs/tiny-aya-global` y de su cuantización, que no se documenta.
- GPU recomendadas: no disponible. Al tratarse de un adaptador sobre un modelo pequeño, es plausible su ejecución en GPU consumer, pero no hay mediciones que lo confirmen.
- Compatibilidad con GPU consumer: no verificada; el adaptador en sí ocupa 0,1 GB, pero el modelo base debe cargarse completo.
- Opciones de despliegue: `transformers` con PEFT (según la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yusheng88/tiny-aya-wazuh-analyst-lora-v2d | Adaptador LoRA sobre Tiny Aya | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| CohereLabs/tiny-aya-global (base) | Modelo completo multilingüe | no disponible en la información proporcionada | no disponible | no disponible | Hugging Face |
| Adaptadores LoRA de dominio público sobre modelos pequeños (genéricos) | Adaptador LoRA | variable | heredado del base | variable | Hugging Face |

No se dispone de datos de rendimiento del adaptador ni de alternativas directamente comparables en el nicho de análisis de Wazuh, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Documentación mínima: la model card es la plantilla automática de TRL; no hay dataset, hiperparámetros, evaluación ni descripción funcional.
- Licencia sin especificar: el campo de licencia está vacío, lo que impide determinar si el uso comercial está permitido. Debe consultarse la licencia del modelo base antes de cualquier despliegue.
- Riesgo de alucinación: sin evaluación publicada, no puede descartarse que el adaptador invente reglas, identificadores o procedimientos de Wazuh.
- Idiomas no declarados: aunque el base es multilingüe, se desconoce en qué idiomas se entrenó el adaptador y si conserva esa cobertura.
- Sesgos: no documentados; al ser un ajuste de autor individual sobre un dataset no publicado, los sesgos del corpus de entrenamiento son desconocidos.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por terceros.
- Fecha de creación futura (2026-11-16) en los metadatos, lo que sugiere un artefacto reciente o mal etiquetado; conviene verificar su procedencia.
- No apto como fuente de verdad en seguridad: cualquier salida debe validarse contra la documentación oficial de Wazuh y las reglas desplegadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yusheng88/tiny-aya-wazuh-analyst-lora-v2d
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
