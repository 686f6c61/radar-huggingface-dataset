# TouradAi/qwen2.5-3b-african-toolcalling

## Resumen

TouradAi/qwen2.5-3b-african-toolcalling es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario TouradAi y publicado en Hugging Face. El objetivo declarado por el nombre del repositorio es especializar el modelo base en tool calling (llamada a funciones) orientado a contextos africanos, aunque la model card no proporciona documentación sobre el dataset de entrenamiento ni sobre qué lenguas o herramientas concretas cubre.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 con 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones), pesos en safetensors y licencia Apache 2.0. Se distribuye como acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. El repositorio ocupa 6,2 GB, coherente con pesos en precisión de 16 bits.

La relevancia de este modelo es limitada y debe evaluarse con cautela: no cuenta con descargas ni likes, no incluye benchmarks publicados y el autor no ha documentado el proceso de entrenamiento. Es un artefacto de la comunidad (entrenado presumiblemente con Unsloth, según los tags) que puede resultar útil como punto de partida experimental para tool calling en dominios africanos, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni AWQ en el repo) |
| Idiomas soportados | en (segun metadatos); el modelo base es multilingue, pero el fine-tuning declara solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base unsloth/Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal estándar, normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). No emplea mezcla de expertos ni mecanismos híbridos SSM; es un denso de 3B parámetros. El contexto nativo del modelo base Qwen2.5-3B-Instruct es de 32.768 tokens, aunque no se ha verificado que este fine-tuning lo preserve.

No se dispone de información sobre el dataset de entrenamiento: ni número de tokens, ni composición, ni si se aplicó RLHF, DPO o SFT supervisado. Los tags indican el uso de Unsloth para el ajuste fino, lo que sugiere SFT con LoRA o QLoRA sobre el modelo instruct, pero es una inferencia a partir de los metadatos, no un dato documentado. Tampoco hay información sobre la estrategia de tool calling (formato de plantilla, esquema JSON, tokens especiales) ni sobre qué herramientas o APIs africanas se cubren.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Tool calling / function calling: es la especialidad declarada del fine-tuning, aunque no se documenta el formato exacto ni la cobertura de herramientas.
- Razonamiento multi-paso y uso de agentes: presumiblemente heredado del modelo base, sin verificación publicada.
- Capacidades multilingües del modelo base (Qwen2.5 soporta decenas de idiomas), pero el fine-tuning declara únicamente inglés en sus metadatos; el soporte real de lenguas africanas no está documentado.
- Generación de código y matemáticas: capacidades del modelo base, no evaluadas específicamente tras el ajuste.
- Sin soporte de visión ni audio (modelo puramente textual).

## Casos de uso

- Prototipado de asistentes con function calling en inglés: el modelo puede integrarse en pipelines que requieran emitir llamadas JSON a APIs (clima, calendario, búsqueda) gracias a su especialización declarada en tool calling, aunque requiere validación previa del formato de salida.
- Experimentación académica sobre tool calling en contextos africanos: útil como base para comparar con otros fine-tunings y evaluar si el ajuste mejora la selección de herramientas en dominios locales (servicios financieros móviles, agricultura, salud comunitaria), siempre que se construya un conjunto de evaluación propio.
- Agentes conversacionales ligeros en entornos con recursos limitados: con 3B parámetros, puede desplegarse en una única GPU consumer para tareas de atención al cliente multi-turno, aunque el contexto efectivo debe verificarse empíricamente.
- Generación de código asistida en inglés: el modelo base es competente en lenguajes populares; el fine-tuning puede usarse en asistentes de IDE que requieran llamadas a herramientas (ejecutar tests, consultar documentación) mediante function calling.
- Extracción de información estructurada: convertir texto libre en llamadas a funciones o JSON con esquemas predefinidos, útil en pipelines de ingesta de datos donde se necesite un modelo pequeño y desplegable on-premise.
- Base para nuevos fine-tunings: al ser Apache 2.0 y safetensors, sirve como punto de partida para ajustes posteriores con Unsloth o Hugging Face TRL en dominios específicos, aunque su acceso restringido añade fricción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,2 GB solo para pesos, más overhead de KV cache; en la práctica, 8-10 GB para contextos moderados.
- VRAM estimada en cuantización 8 bits: alrededor de 3,5-4 GB; en 4 bits (si se generan pesos GGUF/AWQ, no publicados): 2-2,5 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4 o superiores para FP16. Cabe en GPUs consumer de gama media con 8 GB o más si se cuantiza.
- Despliegue: transformers (nativo), text-generation-inference (tag incluido), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama solo si se generan pesos GGUF propios, ya que el repositorio no los incluye.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Para referencia, un 3B en una RTX 4090 en FP16 suele superar las 100 tok/s en decodificación, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| TouradAi/qwen2.5-3b-african-toolcalling | 3,09B | no disponible (base: 32k) | Apache 2.0 | Gated | Fine-tuning comunitario sin benchmarks ni documentación |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | Abierto | Modelo base oficial, con benchmarks publicados y amplio soporte |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community | Gated | Alternativa de tamaño similar, contexto mucho mayor, licencia más restrictiva |
| google/gemma-2-2b-it | 2,61B | 8.192 tokens | Gemma Terms | Gated | Menor tamaño, contexto más corto, licencia con condiciones de uso |

La comparación directa con el modelo base es la más relevante: este fine-tuning no documenta mejoras medibles sobre Qwen2.5-3B-Instruct, por lo que en ausencia de evaluación propia el modelo base oficial es la opción por defecto para producción.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card detallada, ni dataset, ni hiperparámetros, ni evaluación. Es un riesgo importante para cualquier uso en producción.
- Riesgo de alucinación inherente a un modelo de 3B parámetros, potencialmente agravado por un fine-tuning sin validación publicada.
- El fine-tuning declara solo inglés; el soporte de lenguas africanas es una promesa implícita en el nombre que no está respaldada por metadatos ni evaluación.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para despliegues automatizados y reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun así, conviene verificar las condiciones del gate.
- Sin pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que obliga a generarlos si se quiere desplegar en hardware limitado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- No se ha verificado que el formato de tool calling sea compatible con estándares como OpenAI function calling o el formato de Qwen; es necesario inspeccionar la plantilla de chat antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/TouradAi/qwen2.5-3b-african-toolcalling
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct
- Modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
