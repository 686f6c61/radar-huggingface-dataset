# zabibutechnika/Fikra-Model-2-4B-GGUF

## Resumen

Fikra-Model-2-4B-GGUF es la distribucion en formato GGUF de Fikra-Model-2-4B, un ajuste fino especializado del modelo base Qwen/Qwen3.5-4B desarrollado por zabibutechnika. El modelo esta orientado a aplicaciones en el contexto africano, con enfasis particular en Kenia y el idioma suajili (swahili), y esta disenado para ejecucion on-device mediante llama.cpp. Con 4.205.751.296 parametros totales, se posiciona en la categoria de modelos de 4B aptos para hardware de consumo.

La relevancia de esta publicacion radica en su enfoque regional: frente a la mayoria de modelos multilingues que priorizan idiomas de altos recursos, Fikra Model 2 declara soporte nativo para ingles y suajili, lo que lo hace util para despliegues en Africa Oriental. La distribucion GGUF incluye dos cuantizaciones (Q4_K_M y F16) que permiten tanto inferencia en CPU como referencia en precision completa.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card advierte explicitamente de que el modelo no ha pasado por red-teaming y de que las metricas MMLU heredadas provienen del modelo base, no del entrenamiento de Fikra. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de llama-server usa -c 8192) |
| Tipos de cuantizacion | Q4_K_M (2,71 GB), F16 (8,42 GB) |
| Idiomas soportados | Ingles (en), suajili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer de dicho modelo. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. El autor etiqueta el modelo como "Fikra-specialized fine-tune", lo que sugiere un entrenamiento orientado a un dominio o tarea concreta bajo la marca Fikra, aunque no se especifica cual.

La innovacion tecnica destacable es la distribucion en GGUF optimizada para llama.cpp, con una cuantizacion Q4_K_M pensada para ejecucion en CPU y una F16 que reproduce numericamente los pesos fp16 originales. La model card menciona que el modelo puede emitir etiquetas de razonamiento `<think>...</think>` en la salida en crudo, lo que indica la presencia de un modo de razonamiento heredado del linaje Qwen 3.5.

## Capacidades

- Generacion de texto conversacional en ingles y suajili.
- Razonamiento con etiquetas `<think>` (modo de pensamiento heredado del modelo base), que requieren post-procesado para eliminar la fuga de etiquetas.
- Ejecucion on-device mediante llama.cpp, con soporte para llama-cli y llama-server.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Capacidad multilingue limitada a ingles y suajili segun la model card.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente en suajili: el modelo puede gestionar conversaciones multi-turno en swahili e ingles, adecuado para empresas de Africa Oriental que necesiten un asistente local sin depender de APIs externas.
- Despliegue en dispositivos de bajos recursos: la cuantizacion Q4_K_M de 2,71 GB permite ejecutar el modelo en CPU en portatiles o mini-PC, util para entornos con conectividad limitada.
- Asistentes educativos locales: generacion de material didactico y respuestas en suajili para plataformas de aprendizaje offline en escuelas o centros comunitarios.
- Traduccion y adaptacion de contenido entre ingles y suajili: el modelo puede emplearse para localizar documentacion, formularios o contenidos web a un coste computacional minimo.
- Prototipado rapido con llama-server: gracias al tag `endpoints_compatible`, puede exponerse como API compatible con OpenAI para pruebas de integracion en pipelines de desarrollo.
- Investigacion sobre modelos regionales: sirve como referencia para estudiar el rendimiento de fine-tunes de Qwen 3.5 en idiomas de bajos recursos como el suajili.
- Chatbot de soporte en kioscos o terminales de autoservicio: el tamano reducido y la ejecucion en CPU permiten desplegarlo en hardware embebido sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios del fine-tune en la informacion disponible. La model card indica que las metricas MMLU son heredadas de Qwen3.5-4B y no fueron generadas por el entrenamiento de Fikra, y que la cuantizacion Q4_K_M no fue reevaluada, esperandose una perdida de 1 a 3 puntos frente a fp16 en evaluaciones de formato corto. El GGUF F16 hereda exactamente los numeros de fp16.

| Benchmark | Fikra-Model-2-4B (fp16) | Q4_K_M | Notas |
|---|---|---|---|
| MMLU | Heredado de Qwen3.5-4B (valor no disponible) | No reevaluado (perdida estimada 1-3 pts) | El autor remite a la model card del modelo fp16 |

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M requiere aproximadamente 3 GB de memoria (2,71 GB de pesos mas overhead); F16 requiere aproximadamente 9 GB (8,42 GB de pesos mas overhead).
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU. Cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar la cuantizacion Q4_K_M con offload completo (-ngl 99).
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060 o superiores para Q4_K_M; F16 requiere GPUs con 10-12 GB o mas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio (no confirmado en la model card).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fikra-Model-2-4B-GGUF | 4,2B | No disponible | en, sw | Apache 2.0 | GGUF |
| Qwen3.5-4B (modelo base) | ~4B | No disponible | No disponible | No disponible | safetensors |
| Otros fine-tunes regionales de 4B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre Fikra Model 2 y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido sometido a red-teaming, por lo que pueden existir comportamientos no seguros en produccion.
- Riesgo de fuga de etiquetas `<think>...</think>` en la salida en crudo; es necesario eliminarlas en post-procesado.
- Las metricas MMLU no son propias del fine-tune, sino heredadas de Qwen3.5-4B; no deben atribuirse al entrenamiento de Fikra.
- La cuantizacion Q4_K_M no fue reevaluada; se espera una degradacion de 1 a 3 puntos frente a fp16.
- Soporte idiomatico limitado a ingles y suajili; no se documentan otros idiomas.
- La longitud de contexto no esta especificada en la informacion disponible; el ejemplo de llama-server sugiere 8192 tokens, pero no se confirma como maximo.
- Riesgo de alucinacion inherente a modelos de 4B, no cuantificado en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- Repositorio sin descargas ni validacion comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/zabibutechnika/Fikra-Model-2-4B-GGUF
- Modelo base fp16: https://huggingface.co/zabibutechnika/Fikra-Model-2-4B
- Modelo Qwen base: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
