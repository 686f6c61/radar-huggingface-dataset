# SuperGumba/cah-dihei

## Resumen

`SuperGumba/cah-dihei` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario SuperGumba, entrenado sobre el modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de 36.700.160 parámetros (aproximadamente 36,7 millones) que debe cargarse junto con el modelo base para funcionar. El repositorio ocupa 0,3 GB y se distribuye en formatos safetensors y GGUF.

La relevancia de esta ficha es limitada: la model card está prácticamente vacía (todo son marcadores `[More Information Needed]`), no se declara licencia, idiomas, datos de entrenamiento ni evaluación alguna. El autor no ha documentado el propósito del ajuste fino, por lo que no es posible determinar qué tarea o dominio pretendía mejorar el adaptador. Cualquier evaluación de su calidad requeriría pruebas empíricas contra el modelo base.

El interés técnico se centra, por tanto, en el ecosistema: el uso de Unsloth para el ajuste eficiente y de PEFT 0.18.1 para la distribución del adaptador, sobre un supuesto Gemma de cuarta generación con variante "E4B" (probablemente una arquitectura eficiente tipo MoE o con expertos). Al no haber descargas ni likes en el momento de la consulta, se trata de un artefacto recién publicado y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Gemma (modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`) |
| Parametros totales | 36.700.160 (solo adaptador LoRA; el modelo base no está incluido en el recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, sin documentar) |
| Tipos de cuantizacion | El modelo base se distribuye en bnb-4bit; el adaptador se ofrece en safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) y GGUF |
| Libreria | peft 0.18.1, transformers, unsloth |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-11-10 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente corresponde al modelo base Gemma de cuarta generación en su variante "E4B-it", en versión instruida y cuantizada a 4 bits mediante bitsandbytes, tal como indica el nombre `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`. Unsloth es un framework de ajuste fino optimizado en memoria y velocidad que reescribe kernels de atención y capas lineales para reducir el consumo de VRAM durante el entrenamiento.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, la presencia de RLHF/DPO ni los hiperparámetros del ajuste (rango LoRA, alpha, capas objetivo, learning rate, épocas). La model card no aporta detalles técnicos ni justificación del nombre del adaptador. Tampoco se documenta si el adaptador se entrenó con decodificación especulativa, atención lineal u otras innovaciones del modelo base.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruido.
- Ajuste específico de dominio o estilo: no documentado; se desconoce qué comportamiento modifica el adaptador respecto al base.
- Soporte de tool calling y function calling: no confirmado para este adaptador (depende del modelo base, no documentado).
- Razonamiento multi-paso y uso como agente: no confirmado ni evaluado.
- Capacidades multilingües: no disponibles.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Evaluación comparativa de adaptadores LoRA: cargar el adaptador junto al modelo base y comparar respuestas contra el base sin ajuste para determinar empíricamente si el ajuste aporta mejoras en la tarea objetivo.
- Experimentación académica con PEFT: servir como ejemplo reproducible de un adaptador LoRA de ~36,7 M de parámetros sobre un Gemma cuantizado a 4 bits, útil para estudiar el impacto del ajuste en modelos eficientes.
- Pruebas de despliegue con Unsloth: validar flujos de carga de adaptadores entrenados con Unsloth en pipelines de transformers y en formato GGUF para llama.cpp u Ollama.
- Prototipado rápido en local: al ocupar solo 0,3 GB, el adaptador puede combinarse con el modelo base cuantizado en una GPU de consumo para experimentar sin infraestructura dedicada.
- Fine-tuning incremental: usar el adaptador como punto de partida para nuevos ajustes sobre el mismo dominio, siempre que se documente primero su comportamiento.
- Auditoría de artefactos no documentados: emplearlo como caso de estudio sobre riesgos de publicar adaptadores sin model card, sin licencia y sin evaluación, útil en formación sobre buenas prácticas de MLOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa 0,3 GB; el consumo real lo determina el modelo base Gemma E4B cuantizado a 4 bits. No se dispone de cifras oficiales del base en esta información.
- GPU recomendadas: no disponibles para este adaptador. Para el modelo base cuantizado a 4 bits, se requeriría al menos una GPU de consumo con suficiente VRAM para el peso cuantizado más el contexto; no se especifica.
- Cabe en GPU de consumo: probablemente sí para el adaptador, pero depende del modelo base; no confirmado.
- Opciones de despliegue: transformers con PEFT, Unsloth, llama.cpp u Ollama mediante el archivo GGUF incluido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperGumba/cah-dihei | Adaptador LoRA sobre Gemma E4B | 36,7 M (adaptador) | no disponible | no disponible | Hugging Face, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit | Modelo base cuantizado 4-bit | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| Adaptadores LoRA comparables de la comunidad | Adaptadores PEFT | variable | variable | variable | no disponible |

No se dispone de datos de rendimiento del adaptador ni de alternativas directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Model card vacía: todos los campos relevantes (uso previsto, datos, evaluación, sesgos) están sin completar.
- Licencia no declarada: no es posible determinar si se permite uso comercial; además, la licencia del adaptador puede estar condicionada por la del modelo base Gemma, que no se detalla aquí.
- Sin evaluación: no hay benchmarks ni pruebas que demuestren que el ajuste mejora al modelo base; podría degradar el rendimiento.
- Riesgo de alucinación: heredado del modelo base, sin cuantificar.
- Idiomas no declarados: no se puede garantizar calidad multilingüe.
- Sesgos: desconocidos; no hay análisis de sesgos.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que impide validar su calidad por terceros.
- Dependencia del modelo base: requiere descargar y cargar `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, con sus propios requisitos de licencia y hardware.
- Fecha de creación futura (2026-11-10): conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SuperGumba/cah-dihei
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
