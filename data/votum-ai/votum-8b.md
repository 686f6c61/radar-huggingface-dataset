# votum-ai/Votum-8B

## Resumen

Votum-8B es un modelo de decisión calibrado desarrollado por votum-ai, construido como un adaptador LoRA sobre el modelo base suizo swiss-ai/Apertus-v1.5-8B. Su propósito no es la generación libre de texto, sino la clasificación zero-shot y la selección calibrada entre opciones múltiples, lo que lo orienta a tareas de enrutamiento (routing), clasificación y toma de decisiones automáticas donde se requiere una distribución de probabilidad fiable sobre un conjunto cerrado de alternativas.

El modelo cuenta con 8.073.261.376 parámetros totales y se distribuye en formato safetensors con un tamaño de repositorio de 16,4 GB. Soporta cuatro idiomas (inglés, alemán, francés e italiano) y se publica bajo licencia Apache 2.0, aunque el acceso al repositorio está restringido y requiere aceptar las condiciones en Hugging Face. Su pipeline declarado es zero-shot-classification y se apoya en la librería propia `votum`.

La relevancia de Votum-8B radica en su enfoque en la calibración de decisiones: en lugar de optimizar únicamente la perplejidad o la calidad generativa, el modelo se entrena para producir puntuaciones de confianza bien ajustadas sobre opciones discretas, un requisito crítico en sistemas de enrutamiento de consultas, moderación o selección de herramientas en pipelines de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Apertus-v1.5-8B) con adaptador LoRA para decisión calibrada |
| Parametros totales | 8.073.261.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, fr, it |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre modelo base) |

## Arquitectura y entrenamiento

Votum-8B se construye sobre swiss-ai/Apertus-v1.5-8B, un transformer de 8 mil millones de parámetros, mediante un adaptador LoRA especializado. El modelo está etiquetado como "decision-model", "calibrated" y "multiple-choice", lo que indica que el ajuste se orienta a producir distribuciones de probabilidad calibradas sobre conjuntos cerrados de opciones, en lugar de generación abierta. La librería `votum` sugiere un runtime propio para la inferencia de decisiones.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada. El modelo referencia dos artículos arXiv (2610.17205 y 2610.15542) que presumiblemente documentan la metodología de calibración y entrenamiento, aunque su contenido no está disponible en esta ficha.

## Capacidades

- Clasificación zero-shot sobre conjuntos cerrados de etiquetas.
- Selección calibrada entre opciones múltiples, con puntuaciones de confianza ajustadas.
- Enrutamiento (routing) de consultas o tareas hacia categorías predefinidas.
- Soporte multilingüe en inglés, alemán, francés e italiano.
- Integración mediante adaptador LoRA sobre el modelo base Apertus-v1.5-8B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo puede clasificar un mensaje entrante en categorías predefinidas (facturación, soporte técnico, reclamaciones) y devolver una distribución calibrada que permita derivar al agente humano o al flujo automatizado adecuado con umbrales de confianza fiables.
- Moderación de contenido multilingüe: aprovechando su soporte para en, de, fr e it, puede clasificar textos en cuatro idiomas en categorías de riesgo con puntuaciones calibradas, facilitando la revisión humana cuando la confianza sea baja.
- Selección de herramientas en pipelines de agentes: dado un conjunto cerrado de herramientas o APIs disponibles, el modelo puede decidir cuál invocar según la consulta del usuario, con una probabilidad asociada que permita fallback controlado.
- Clasificación de tickets en sistemas de soporte: integrado en un backend, puede etiquetar automáticamente tickets por prioridad, departamento o tipo de incidencia, reduciendo la carga de triaje manual.
- Enrutamiento de modelos en infraestructuras LLM: puede decidir qué modelo (grande, pequeño, especializado) debe atender una consulta según su complejidad, optimizando costes de inferencia.
- Filtrado y priorización en pipelines de datos: clasificación zero-shot de documentos o registros en categorías definidas por el usuario, con calibración que permite descartar decisiones ambiguas para revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 8 mil millones de parámetros en precisión completa (fp16) requiere aproximadamente 16 GB de VRAM solo para los pesos, a los que hay que sumar el modelo base Apertus-v1.5-8B y el adaptador LoRA.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: la librería declarada es `votum`; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Votum-8B | 8,07 B | no disponible | Apache 2.0 | Decisión calibrada / clasificación zero-shot |
| swiss-ai/Apertus-v1.5-8B | 8 B (aprox.) | no disponible | no disponible | Modelo base generativo |
| Alternativas de clasificación zero-shot de 8B | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la categoría de decisión calibrada con la que contrastar parámetros, contexto, rendimiento y disponibilidad.

## Limitaciones y advertencias

- El acceso al modelo está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.
- El modelo es un adaptador LoRA: requiere el modelo base swiss-ai/Apertus-v1.5-8B para funcionar, lo que condiciona el despliegue y los requisitos de hardware.
- El alcance idiomático se limita a inglés, alemán, francés e italiano; no se ha confirmado soporte para castellano.
- Al ser un modelo de decisión calibrada, no está diseñado para generación libre de texto; su uso fuera de clasificación o selección entre opciones puede producir resultados no fiables.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Aunque la licencia es Apache 2.0, deben verificarse las condiciones del modelo base Apertus-v1.5-8B para uso comercial.
- El modelo tiene un historial de adopción muy limitado (2 descargas, 0 likes en el momento de la consulta), por lo que no existe validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/votum-ai/Votum-8B
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Paper de referencia 1: https://arxiv.org/abs/2610.17205
- Paper de referencia 2: https://arxiv.org/abs/2610.15542
