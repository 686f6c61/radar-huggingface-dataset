# TILKI-AI/character-generation-v2-8B-lora

## Resumen

TILKI-AI/character-generation-v2-8B-lora es un adaptador LoRA desarrollado por TILKI-AI, una empresa orientada a la creación de videojuegos mediante sistemas de IA generativa. El adaptador se entrena sobre el modelo base `ibm-granite/granite-3.3-8b-instruct` de IBM, un modelo de 8 000 millones de parámetros especializado en instrucciones y razonamiento. El objetivo del adaptador es especializar el modelo base en la generación de personajes, probablemente para su uso en la creación de mundos de juego y simulaciones narrativas.

El entrenamiento se realizó con la librería Unsloth, que acelera el proceso de fine-tuning aproximadamente dos veces respecto a los métodos convencionales, y con TRL (Transformers Reinforcement Learning) de HuggingFace. El repositorio ocupa 0,4 GB, lo que confirma que se trata de un adaptador LoRA de bajo rango y no de pesos completos. El modelo está etiquetado exclusivamente para inglés y no se ha publicado información sobre licencia, benchmarks ni métricas de rendimiento en la model card.

La relevancia de este modelo reside en su enfoque vertical: en lugar de un modelo de propósito general, TILKI-AI apuesta por adaptadores especializados para tareas concretas dentro de su ecosistema de generación de mundos de juego, lo que permite desplegar soluciones más ligeras y económicas sobre un base robusta como Granite 3.3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (base: ibm-granite/granite-3.3-8b-instruct) |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `ibm-granite/granite-3.3-8b-instruct`, un transformer decoder-only de 8 000 millones de parámetros desarrollado por IBM. La capa LoRA se entrena con la librería Unsloth, que optimiza el proceso de fine-tuning para reducir el tiempo de entrenamiento aproximadamente a la mitad, y con TRL para el pipeline de entrenamiento. No se ha publicado información sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO sobre el adaptador.

El repositorio incluye los pesos del adaptador en formato safetensors y está etiquetado como compatible con text-generation-inference (TGI), lo que facilita su despliegue en entornos de producción con servidores de inferencia optimizados. No se documentan innovaciones técnicas adicionales en la model card.

## Capacidades

- Generación de texto especializada en la creación de personajes (character generation), según el nombre del modelo y la colección a la que pertenece en HuggingFace.
- Herencia de las capacidades del modelo base Granite 3.3 Instruct, que incluye generación de texto, razonamiento y comprensión de instrucciones en inglés.
- Soporte de text-generation-inference (TGI) para despliegue en endpoints compatibles.
- Integración con el ecosistema de TILKI para la creación de mundos de juego, donde los personajes generados pueden pensar y actuar dentro de una simulación.
- No se documentan capacidades específicas de tool calling, agentes, visión o modo de razonamiento extendido en la información disponible.

## Casos de uso

- Generación de personajes para videojuegos: el adaptador permite crear NPCs con personalidades, historias y diálogos coherentes dentro del pipeline de TILKI, que construye mundos vivos a partir de la intención creativa del usuario.
- Creación de diálogos y guiones para narrativa interactiva: al estar especializado en generación de personajes, puede usarse para producir conversaciones multi-turno entre NPCs y jugadores en juegos de rol.
- Prototipado de personajes para escritores y diseñadores: el modelo puede generar fichas de personajes (rasgos, motivaciones, trasfondo) a partir de descripciones breves, acelerando la preproducción de guiones.
- Simulación de comportamientos de personajes: en el contexto de TILKI, el adaptador puede alimentar sistemas de simulación donde los personajes reaccionan a eventos del mundo y toman decisiones coherentes con su perfil.
- Generación de contenido para juegos de mesa y RPG: los creadores pueden usar el modelo para generar PNJ (personajes no jugadores) con traseras y personalidades variadas de forma rápida.
- Fine-tuning de demostración y educación: el adaptador sirve como ejemplo práctico de cómo especializar un modelo base de 8B con LoRA para tareas de nicho, usando Unsloth y TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0, 4 GB, pero la inferencia requiere cargar el modelo base `granite-3.3-8b-instruct` completo.
- VRAM estimada para el modelo base en FP16: aproximadamente 16 GB, por lo que cabe en GPUs como RTX 4090, RTX 4080 o A100 de 40 GB.
- Con cuantización (por ejemplo, AWQ o GPTQ en 4 bits), la VRAM necesaria puede reducirse a unos 6-8 GB, lo que permite ejecutarlo en GPUs de gama media como RTX 3060 o RTX 4070.
- El despliegue puede realizarse con text-generation-inference (TGI), vLLM, llama.cpp u Ollama, siempre que soporten la carga de adaptadores LoRA sobre el modelo base.
- La latencia dependerá del hardware; en una GPU de 16 GB con FP16 se espera un throughput de entre 20 y 60 tokens por segundo para un modelo de 8B, según la implementación y el tamaño de lote.

## Comparativa con modelos similares

No hay información suficiente en la model card para establecer una comparativa con modelos similares. El adaptador no tiene métricas publicadas y no se conocen adaptadores equivalentes de TILKI-AI con los que comparar. La comparación natural sería contra el propio modelo base `ibm-granite/granite-3.3-8b-instruct` (sin adaptador) y contra otros adaptadores LoRA de generación de personajes, pero no hay datos públicos disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TILKI-AI/character-generation-v2-8B-lora | LoRA (base 8B) | No disponible | No disponible | HuggingFace |
| ibm-granite/granite-3.3-8b-instruct | 8B | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- El modelo solo soporta inglés, por lo que no es adecuado para generación de personajes en otros idiomas sin un fine-tuning adicional.
- No se ha publicado la licencia del adaptador, lo que genera incertidumbre sobre los términos de uso comercial; se recomienda contactar con TILKI-AI antes de usarlo en producción.
- No hay benchmarks ni métricas de calidad publicadas, por lo que no se puede validar el rendimiento real del adaptador frente al modelo base.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es muy reciente y no ha sido validado por la comunidad.
- Al ser un adaptador LoRA, no funciona de forma independiente: requiere el modelo base `granite-3.3-8b-instruct` para realizar inferencia.
- La fecha de creación (agosto de 2026) sugiere que el modelo es muy nuevo y puede tener errores no detectados.
- El riesgo de alucinación y sesgos depende del modelo base y del dataset de entrenamiento, del cual no se ha publicado información.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TILKI-AI/character-generation-v2-8B-lora
- Colección Character Generation de TILKI-AI: https://huggingface.co/collections/TILKI-AI/character-generation
- Perfil de la organización TILKI-AI: https://huggingface.co/TILKI-AI/models
- Sitio web de TILKI: https://www.tilki.com/
- Modelo relacionado (character-details-8B) en FriendliAI: https://friendli.ai/models/TILKI-AI/character-details-8B
- Librería Unsloth: https://github.com/unslothai/unsloth
