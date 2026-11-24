# Thox-ai/ThoxClip-Qwen3-0.6B

## Resumen

ThoxClip-Qwen3-0.6B es un ajuste fino (fine-tune) del modelo Qwen3-0.6B de Alibaba, desarrollado por Thox-ai como asistente local para su dispositivo ThoxClip. Se trata de un LoRA de rango 32 entrenado sobre un corpus propio de 205 ejemplos de conversacion y uso de herramientas, fusionado posteriormente en los pesos base. El modelo resultante conserva la arquitectura transformer decoder-only de Qwen3-0.6B, con aproximadamente 596 millones de parametros, y se distribuye bajo licencia Apache 2.0 tanto en formato safetensors como en GGUF cuantizado Q4_K_M.

El modelo esta disenado explicitamente para inferencia en dispositivo (on-device) y entornos de borde, con un enfasis en despliegue local-first. Su proposito declarado es servir como asistente conversacional integrado en el ecosistema THOX, y su model card especifica una condicion de uso no habitual: debe servirse obligatoriamente con un system prompt de "hechos del dispositivo" (grounding) y con el modo thinking desactivado. El autor advierte que un despliegue sin ese prompt queda "fuera de contrato".

La relevancia actual del modelo reside en su tamano reducido (compatible con GPUs de consumo e incluso CPU), su licencia permisiva y su publicacion abierta junto con los pesos y el resultado de evaluacion completo, incluido un GATE49 de 22/49 que el propio autor presenta como baseline y no como un resultado solido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (incluido en el repo); otros tipos no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se obtiene mediante un ajuste fino LoRA de rango 32 sobre un corpus autorado por THOX denominado `thox-factory-sft-v5`, compuesto por 205 ejemplos de conversacion y uso de herramientas. Tras el entrenamiento supervisado (SFT), los adaptadores LoRA se fusionaron en los pesos base, dando lugar a un unico checkpoint denso de 0.6B parametros. El repositorio incluye un `training_summary.json` con el registro legible por maquina de la ejecucion de entrenamiento.

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas propias: el modelo hereda la arquitectura y el tokenizer de Qwen3-0.6B (tokenizer.json de 11,4 MB y plantilla de chat propia). La unica particularidad operativa destacable es la exigencia de servir el modelo con un system prompt de grounding especifico de THOX y con el modo thinking desactivado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Uso de herramientas (tool use / function calling), segun el corpus de entrenamiento SFT.
- Asistencia integrada en dispositivo para el ecosistema THOX (ThoxClip, ThoxOS, MeshStack).
- Ejecucion local-first, sin dependencia de servicios en la nube.
- Compatibilidad con despliegue via Transformers, Ollama y text-generation-inference (segun los tags del repositorio).
- Capacidad de razonamiento extendido (thinking mode) heredada de Qwen3, aunque el autor exige desactivarla en produccion.
- Soporte multilingue: limitado al ingles segun la model card.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional embebido en dispositivo: el modelo puede gestionar dialogos multi-turno en local dentro del dispositivo ThoxClip, sin enviar datos a la nube, lo que encaja con su tamano de 0.6B y su licencia permisiva.
- Automatizacion de tareas con tool calling: al haber sido entrenado sobre ejemplos de uso de herramientas, puede invocarse para encadenar llamadas a funciones en flujos de automatizacion domestica o de productividad personal.
- Prototipado rapido de asistentes locales: su reducido tamano permite iterar en portatiles o equipos de gama media con Ollama, sirviendo como banco de pruebas antes de migrar a modelos mayores como ThoxDecide-3B.
- Despliegue en entornos con restricciones de privacidad: adecuado para escenarios donde los datos no pueden salir del dispositivo (salud, finanzas personales, entornos industriales aislados).
- Educacion y demos de IA en el borde: util para talleres y demostraciones de inferencia local gracias a su GGUF Q4_K_M de aproximadamente 397 MB.
- Integracion en pipelines de CI/CD para pruebas de regresion conversacional: su licencia Apache 2.0 y su formato estandar permiten incluirlo en tests automatizados de calidad de respuesta sin coste de licencia.
- Base para fine-tunes especificos de dominio: al ser un checkpoint denso y pequeno con licencia permisiva, puede reajustarse para dominios concretos con recursos modestos.

## Benchmarks y rendimiento

El autor publica un unico resultado de evaluacion interna: GATE49, con una puntuacion de 22/49 sobre el conjunto de desarrollo. El propio autor lo presenta como baseline y no como un resultado solido. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| GATE49 (desarrollo) | 22/49 | Evaluacion interna de THOX; presentada como baseline |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en precision completa (safetensors de 1.192.135.096 B); en torno a 0,4 GB con la cuantizacion GGUF Q4_K_M (396.704.672 B).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; tambien viable en CPU.
- Compatible con GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida; tambien en Apple Silicon mediante Ollama.
- Opciones de despliegue: Transformers, Ollama (imagen oficial `Thox-ai/thoxclip-qwen3-0.6b`), llama.cpp mediante el GGUF incluido y text-generation-inference segun los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxClip-Qwen3-0.6B | 596 M | No disponible | Apache 2.0 | Hugging Face, Ollama | Fine-tune SFT con grounding obligatorio |
| Qwen/Qwen3-0.6B | 0,6 B | No disponible | Apache 2.0 | Hugging Face | Modelo base; capacidades generales sin ajuste de dominio |
| Otros fine-tunes de Qwen3-0.6B | ~0,6 B | Variable | Variable | Hugging Face | No se dispone de datos comparativos concretos en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Grounding obligatorio: el modelo debe servirse con el system prompt de hechos del dispositivo de THOX y con thinking desactivado; un despliegue sin ese contexto queda fuera de contrato segun el autor.
- Rendimiento limitado: el resultado GATE49 de 22/49 sobre el conjunto de desarrollo indica un rendimiento modesto incluso en la evaluacion interna del propio autor.
- Idioma: soporte unicamente en ingles, lo que limita su uso en castellano sin un ajuste adicional.
- Corpus de entrenamiento muy reducido (205 ejemplos), lo que aumenta el riesgo de sobreajuste y de respuestas poco generalizables.
- Riesgo de alucinacion: inherente a modelos de 0,6B y agravado por el enfasis en hechos especificos del dispositivo, que el modelo puede inventar si el grounding no se aplica correctamente.
- Contexto: no se documenta la longitud de contexto soportada, por lo que no puede garantizarse el manejo de conversaciones largas.
- Licencia Apache 2.0: permisiva para uso comercial, pero el autor declara condiciones de servicio (grounding y thinking-off) que, aunque no modifican la licencia, condicionan el soporte.
- Contenido promocional: la model card incluye una campana de Kickstarter y notas del fundador; conviene separar el material tecnico del comercial al evaluar el modelo.
- Fecha de publicacion futura (2026) en los metadatos del repositorio, lo que puede indicar inconsistencias en el registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxClip-Qwen3-0.6B
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Demo de dispositivos THOX: https://thox.ai/#demo-callout-home_lineup
- Campana de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
