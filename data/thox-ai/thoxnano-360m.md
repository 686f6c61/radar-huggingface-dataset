# Thox-ai/ThoxNano-360M

## Resumen

ThoxNano-360M es un ajuste fino del modelo base SmolLM-360M de Hugging Face, desarrollado por Thox-ai (THOX.ai) como modelo asistente para su plataforma de dispositivos edge ThoxClip. Se trata de un fine-tune con LoRA de rango 32 sobre un corpus propio de 982 ejemplos de chat, uso de herramientas y factualidad, cuyos pesos se han fusionado en los pesos base. El resultado es un modelo transformer denso de 361.821.120 parámetros orientado a inferencia local y totalmente offline.

El modelo no pretende competir en capacidad general, sino cubrir un nicho muy concreto: respuestas conversacionales breves, voz de marca de THOX y enrutamiento de intenciones hacia funciones del dispositivo y de la malla (mesh), con los hechos suministrados por la capa de servicio y no por los pesos. Su relevancia actual radica en que es un ejemplo de modelo de bolsillo (sub-400M) empaquetado en GGUF Q4_K_M y publicado en Ollama, lo que permite ejecutarlo en hardware de consumo muy modesto.

La licencia es Apache-2.0 tanto para el fine-tune como para los pesos, y el repositorio incluye pesos safetensors, un GGUF Q4_K_M, la plantilla de chat y un Modelfile. El autor advierte explícitamente de que el modelo requiere grounding: los pesos por sí solos no son una fuente fiable de hechos de THOX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de SmolLM-360M) |
| Parámetros totales | 361.821.120 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M publicado; safetensors en precisión original |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM-360M, un transformer denso de tipo decoder-only, y se ha ajustado mediante LoRA de rango 32 sobre un corpus autorado por THOX de 982 ejemplos que cubren conversación, uso de herramientas y factualidad. Tras el entrenamiento, los adaptadores LoRA se han fusionado en los pesos base, por lo que el repositorio distribuye un checkpoint único sin adaptadores separados. No se documenta en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica destacable no está en la arquitectura, sino en el empaquetado: se publican simultáneamente pesos fusionados en safetensors, una cuantización Q4_K_M de 270.590.336 bytes, la plantilla de chat en `chat_template.jinja` y un Modelfile para Ollama, además de un `training_summary.json`. El modelo está diseñado para operar con grounding en la capa de servicio, de modo que el enrutamiento de intenciones y la voz de marca recaen en los pesos mientras que los hechos se inyectan externamente.

## Capacidades

- Generación de texto conversacional breve, orientada a respuestas cortas en un asistente de dispositivo.
- Enrutamiento de intenciones (tool routing) hacia funciones del dispositivo y de la malla THOX.
- Uso de herramientas y function calling, según el corpus de entrenamiento de tool-use.
- Voz de marca (house voice) de THOX en las respuestas.
- Operación completamente offline y local-first, sin dependencia de servicios remotos.
- Capacidad multilingüe limitada: el modelo está entrenado principalmente en inglés y el autor reconoce menor calidad en otros idiomas.
- No se documentan capacidades de visión, audio, modo thinking ni razonamiento multi-paso avanzado.

## Casos de uso

- Asistente de dispositivo edge: el modelo gestiona interacciones conversacionales cortas en el propio hardware ThoxClip, sin conexión, aprovechando su tamaño reducido para caber en memoria limitada.
- Enrutamiento de comandos en un ecosistema de dispositivos: interpreta la intención del usuario y la dirige a funciones concretas del dispositivo o de la malla, que es precisamente el comportamiento para el que se ajustó el corpus de tool-use.
- Prototipado de asistentes locales con Ollama: al estar publicado en Ollama y en GGUF Q4_K_M, sirve para validar flujos de chat y plantillas en un portátil antes de desplegar en hardware real.
- Generación de respuestas con voz de marca: útil en productos que necesitan un tono consistente y controlado en las respuestas, con los hechos inyectados por la capa de servicio.
- Base para experimentos de fine-tuning de bajo coste: al ser un modelo de 360M con licencia Apache-2.0 y pesos abiertos, es un punto de partida económico para ajustes propios con LoRA.
- Evaluación de pipelines de grounding: dado que el autor documenta explícitamente que los pesos no son fiables para hechos, sirve como banco de pruebas para medir cuánto aporta la inyección de contexto en la capa de servicio.
- Inferencia en entornos con recursos muy restringidos: el GGUF Q4_K_M de unos 270 MB permite ejecución en CPU y en dispositivos de gama baja donde modelos mayores no caben.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| THOX GATE49 (factualidad, conjunto de desarrollo, ponderado por abstención) | 23/49 — media 2.959/5 |
| Fallos duros (hard failures) | 11 |

El autor califica este resultado como débil y señala que una ejecución anterior de la evaluación no pudo completarse porque el modelo entró en un bucle de repetición en una de las preguntas del gate. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_K_M (fichero de 270.590.336 bytes) y alrededor de 0,7 GB en safetensors (723.674.912 bytes), más overhead de runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; no se requiere A100 ni H100. Funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU y dispositivos embebidos.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxnano-360m`), llama.cpp (`llama-cli` con el GGUF), y carga directa de safetensors con librerías de Hugging Face. No se documenta soporte específico para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| ThoxNano-360M | 361,8M | no disponible | Apache-2.0 | safetensors, GGUF Q4_K_M | Fine-tune de nicho con grounding obligatorio |
| SmolLM-360M (base) | 360M | no disponible | Apache-2.0 | safetensors | Modelo base upstream, sin ajuste de voz ni tool routing |
| SmolLM2-360M | 360M | no disponible | Apache-2.0 | safetensors, GGUF | Generación posterior de la familia SmolLM, orientada a uso general |

La comparación directa con alternativas de la misma categoría se limita a la familia SmolLM, dado que el modelo es un fine-tune de SmolLM-360M. No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede entrar en bucles de repetición en algunas peticiones; el autor recomienda límites de salida modestos y condiciones de parada activas.
- Puede repetir fragmentos de su texto de sistema en lugar de responder conversacionalmente.
- Las respuestas factuales desde los pesos desnudos no son fiables; el despliegue requiere grounding en la capa de servicio.
- La cuantización Q4_K_M introduce una pérdida de precisión respecto a los pesos originales.
- El entrenamiento es mayoritariamente en inglés, por lo que la calidad en otros idiomas es inferior.
- El modelo no ha sido cualificado en el hardware real de los dispositivos ThoxClip.
- Uso fuera de alcance: decisiones críticas de seguridad, médicas o legales sin supervisión humana, y cualquier uso como fuente autónoma de hechos de THOX.
- Los sesgos reflejan los datos de entrenamiento, que no se detallan en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxNano-360M
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-360M
- Ollama: `ollama run Thox-ai/thoxnano-360m`
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
