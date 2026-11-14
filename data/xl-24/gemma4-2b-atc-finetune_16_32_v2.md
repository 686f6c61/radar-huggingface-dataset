# xl-24/gemma4-2b-atc-finetune_16_32_v2

## Resumen

`xl-24/gemma4-2b-atc-finetune_16_32_v2` es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, una variante de Gemma 4 de la familia E2B (aproximadamente 2 mil millones de parametros efectivos) publicada por Unsloth en formato cuantizado de 4 bits. El autor del ajuste es el usuario `xl-24`, que lo ha entrenado con la libreria Unsloth y el stack TRL/Transformers, segun los tags del repositorio.

El modelo esta pensado para generacion de texto en ingles y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 0,2 GB, lo que es coherente con un modelo de ~2B parametros en cuantizacion de 4 bits. La nomenclatura del identificador (`atc-finetune_16_32_v2`) sugiere un ajuste orientado a un dominio concreto (posiblemente control de trafico aereo, "ATC"), aunque la model card no detalla el dataset ni el objetivo del entrenamiento.

La relevancia de esta ficha es limitada: se trata de un modelo derivado de bajo perfil, sin descargas ni likes en el momento de la consulta, y con documentacion minima. Resulta util como ejemplo de flujo de fine-tuning con Unsloth sobre Gemma 4, pero no como modelo de referencia para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del base Gemma 4 E2B; no detallada en la model card) |
| Parametros totales | no disponible (el nombre indica ~2B; no confirmado en la card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el base se distribuye en 4 bits (bnb-4bit); el ajuste se publica en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Por herencia del base (`unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`) se trata de un modelo de la familia Gemma 4 en su variante E2B, pero no se especifica si es un transformer denso, un modelo con mezcla de expertos (MoE) o una arquitectura hibrida. Tampoco se indica el numero exacto de parametros, la longitud de contexto nativa ni la composicion del vocabulario.

El entrenamiento se realizo con Unsloth, que segun la card permite un entrenamiento "2x mas rapido", y con las librerias TRL y Transformers (segun los tags). No se detalla el dataset de ajuste, el numero de tokens vistos, si hubo RLHF/DPO o si se aplico LoRA/QLoRA. El repositorio ocupa 0,2 GB, consistente con pesos cuantizados o con un adaptador de bajo rango, pero la card no aclara si se publican pesos completos o un adaptador.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Ajuste fino sobre un modelo instruct (`-it`), por lo que conserva el comportamiento de instrucciones del base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multimodal (vision, audio) ni modo "thinking".
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- No se especifican capacidades de codigo o matematicas mas alla de las heredadas del base.

## Casos de uso

- Prototipado de ajustes de dominio: sirve como ejemplo reproducible de fine-tuning con Unsloth sobre Gemma 4 en 4 bits, util para equipos que quieran replicar el flujo en sus propios datasets.
- Generacion de texto en ingles de proposito general: al derivar de un modelo instruct, puede emplearse para tareas de redaccion y respuesta a instrucciones simples en entornos de prueba.
- Experimentacion academica: como punto de partida para estudiar el efecto del ajuste fino sobre un base cuantizado de ~2B parametros.
- Despliegue en hardware modesto: el tamano del repositorio (0,2 GB) sugiere que puede ejecutarse en GPU de consumo, adecuado para demos locales.
- Evaluacion comparativa de tecnicas de fine-tuning: util para contrastar QLoRA/Unsloth frente a otros metodos sobre el mismo base.
- Base para un ajuste posterior: al estar en safetensors y licencia Apache 2.0, puede reutilizarse como punto de partida para nuevos experimentos.
- No se recomienda su uso en produccion sin una evaluacion previa, dado que no hay benchmarks ni documentacion del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio (0,2 GB) y el base de ~2B en 4 bits, es plausible que quepa en GPU de consumo con 6-8 GB de VRAM, pero no esta confirmado.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: probablemente si (RTX 3060/4060 o superiores), sin confirmacion oficial.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference (tag), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se proporcionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xl-24/gemma4-2b-atc-finetune_16_32_v2 | ~2B (no confirmado) | no disponible | apache-2.0 | Hugging Face, 0 descargas | Ajuste de dominio sin benchmarks |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit | ~2B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| Gemma 2 2B (referencia de familia) | 2B | 8K (segun version) | Gemma license | Amplia | Alternativa de tamano similar, pero de generacion anterior |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; los datos de la fila de Gemma 2 son orientativos y deben verificarse en la fuente oficial.

## Limitaciones y advertencias

- Documentacion minima: la model card no describe dataset, hiperparametros ni objetivo del ajuste.
- Sin benchmarks: no hay evidencia publicada de rendimiento ni de calidad.
- Sesgos: desconocidos; al derivar de un base entrenado con datos web, puede heredar sesgos del base.
- Riesgo de alucinacion: no evaluado.
- Idioma: solo se declara ingles; el uso en castellano no esta soportado oficialmente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del base Gemma 4, que puede imponer condiciones adicionales.
- Advertencia de produccion: no usar en produccion sin evaluacion propia y sin confirmar si los pesos publicados son completos o un adaptador.
- Popularidad nula (0 descargas, 0 likes): no hay comunidad que valide su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-2b-atc-finetune_16_32_v2
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
