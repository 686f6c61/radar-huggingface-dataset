# xyntraistudios/xyntrai-sarah-mistral-2501-36B-nsfw

## Resumen

Xyntrai Sarah Mistral 2501 36B NSFW es un modelo de generacion de texto derivado de la familia Mistral, publicado por Xyntraistudios en Hugging Face. Se trata de un ajuste fino (finetune) del modelo xyntrai-mistral-2501-36B-nsfw, que a su vez parte de xyntrai-mistral-small-2501-36B-nsfw, orientado a generacion conversacional y etiquetado explicitamente como no apto para todas las audiencias (not-for-all-audiences). El modelo cuenta con 36.910.535.680 parametros reales segun los pesos en safetensors, lo que lo situa en la franja de los 36B, y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo es limitada en terminos de investigacion: no publica resultados de benchmarks, no detalla la composicion del dataset de entrenamiento ni el proceso de alineamiento, y su model card es minima. Su interes practico radica en ser un ejemplo de finetune rapido con Unsloth y TRL sobre una base Mistral de gran tamano, con pesos en formato transformers y compatibilidad con text-generation-inference y endpoints compatibles.

La informacion disponible sobre arquitectura interna, contexto y capacidades concretas es escasa; la ficha refleja unicamente los datos verificables de la model card, los metadatos de Hugging Face y el tamano real de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Mistral, transformer decoder-only segun tags) |
| Parametros totales | 36.910.535.680 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 73,8 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un finetune de xyntrai-mistral-2501-36B-nsfw, que a su vez deriva de xyntrai-mistral-small-2501-36B-nsfw. La model card indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, con una mejora declarada de 2x en velocidad de entrenamiento. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar.

No hay informacion publicada sobre la arquitectura exacta (numero de capas, dimensiones de atencion, tipo de atencion, uso de GQA, etc.) ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. El tag "mistral" sugiere una arquitectura transformer decoder-only de la familia Mistral, pero no se confirma en la documentacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, segun el pipeline text-generation y el tag conversational.
- Ajuste orientado a contenido NSFW, segun el nombre del modelo y el tag not-for-all-audiences.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Generacion de narrativa y roleplay conversacional en ingles: el modelo esta ajustado para dialogos multi-turno con contenido explicito, adecuado para prototipos de personajes virtuales siempre que se respeten las politicas de la plataforma de despliegue.
- Experimentacion academica sobre finetunes NSFW: util para estudiar como el ajuste fino sobre una base Mistral de 36B altera el estilo y la coherencia del dialogo, dado que los pesos son abiertos y la licencia Apache 2.0 lo permite.
- Investigacion sobre seguridad y moderacion: sirve como modelo de referencia para evaluar clasificadores de contenido y sistemas de filtrado en entornos controlados.
- Despliegue interno con text-generation-inference: los tags indican compatibilidad con TGI y endpoints compatibles, lo que facilita servir el modelo en infraestructura propia.
- Generacion de datos sinteticos para entrenamiento de filtros: se puede usar para producir corpus de dialogo etiquetados y entrenar clasificadores de contenido sensible.
- Pruebas de cuantizacion y eficiencia: con 36,9B parametros y 73,8 GB de pesos en safetensors, es un candidato para evaluar tecnicas de cuantizacion y despliegue en GPUs de gran memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 74 GB solo para pesos, mas memoria para KV cache y activaciones; se recomienda al menos 80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 37-40 GB, viable en una A100 80GB o H100 80GB con margen.
- VRAM estimada en cuantizacion de 4 bits: en torno a 19-22 GB, potencialmente viable en una RTX 4090 de 24 GB, aunque no se documenta soporte oficial de GGUF.
- GPUs recomendadas: A100 80GB, H100 80GB o multi-GPU para precision completa; RTX 4090 solo con cuantizacion agresiva.
- Opciones de despliegue: transformers, text-generation-inference (segun tags) y endpoints compatibles; no se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Xyntrai Sarah Mistral 2501 36B NSFW | 36,9B | no disponible | Apache 2.0 | Hugging Face |
| Mistral Small (familia) | no disponible | no disponible | no disponible | no disponible |
| Modelos Mistral de ~30-40B comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificables de alternativas directas en la informacion proporcionada; la comparativa se limita a la disponibilidad y licencia.

## Limitaciones y advertencias

- Contenido NSFW explicito: el modelo esta etiquetado como not-for-all-audiences y su uso en plataformas publicas puede violar sus politicas de contenido.
- Sesgos conocidos: no documentados, pero al ser un finetune sin informacion sobre datos de alineamiento, el riesgo de sesgos y toxicidad es alto.
- Riesgo de alucinacion: no evaluado; no hay benchmarks ni evaluaciones de fidelidad.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Longitud de contexto: no documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido NSFW puede incumplir normativas y terminos de servicio de proveedores cloud.
- Caveat para produccion: la model card es minima, sin detalles de entrenamiento ni evaluaciones; no se recomienda su uso en produccion sin una evaluacion propia de calidad y seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/xyntraistudios/xyntrai-sarah-mistral-2501-36B-nsfw
- Arbol de archivos: https://huggingface.co/xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw/tree/main
- FriendliAI: https://friendli.ai/models/xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw
- Unsloth: https://github.com/unslothai/unsloth
