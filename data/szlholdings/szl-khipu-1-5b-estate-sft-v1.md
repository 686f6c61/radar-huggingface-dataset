# SZLHOLDINGS/SZL-Khipu-1.5B-estate-sft-v1

## Resumen

SZL-Khipu-1.5B-estate-sft-v1 es un ajuste fino supervisado (SFT) del modelo base SZLHOLDINGS/SZL-Khipu-1.5B, publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina su "governed-AI estate". Se trata de un modelo de generacion de texto de tipo causal, con arquitectura Qwen2 (Qwen2ForCausalLM) y 1.543.714.304 parametros reales segun los pesos en safetensors, lo que lo situa en la categoria de modelos pequenos aptos para inferencia en hardware de consumo.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2 y se distribuye en precision bfloat16 con pesos en formato safetensors, bajo licencia Apache 2.0 y declarado unicamente para el idioma ingles. El repositorio ocupa 3,1 GB y contiene 17 archivos en la revision auditada, con un unico artefacto principal de pesos (model.safetensors, 3.087.467.144 bytes) y un tokenizer.json de 11,4 MB.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeno de la familia Qwen2 reentrenado para un dominio concreto (el autor lo etiqueta como "estate"); por otro, es un caso ejemplar de publicacion con trazabilidad estricta, ya que la propia model card declara explicitamente que no existe una cadena de recibos de evaluacion completa y que no se afirma ninguna cifra de benchmark. Cualquier evaluacion de capacidades debe, por tanto, realizarse por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, Qwen2ForCausalLM (model_type: qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no declarada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 3.087.467.144 bytes), bfloat16 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2ForCausalLM, un transformer decoder-only denso con atencion causal estandar, la misma familia arquitectonica que los modelos Qwen2 de Alibaba. El numero exacto de capas, dimensiones ocultas, cabezas de atencion y tamano de vocabulario no se detalla en la informacion proporcionada; solo se confirma el tipo de modelo, la clase de arquitectura y el dtype (bfloat16). Con 1,54 mil millones de parametros y un tokenizer.json de 11,4 MB, el vocabulario es compatible con la familia Qwen2.

Respecto al entrenamiento, la model card indica que se trata de un artefacto SFT (supervised fine-tuning) derivado del modelo base SZLHOLDINGS/SZL-Khipu-1.5B, pero no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La seccion de recibos del autor es explicita: los paths estandar de evaluacion (eval/frontier-v1/DONE.json, final/train_receipt.json) fueron escaneados y no constituyen una cadena de recibos estricta completa, con estado UNKNOWN_NO_EVAL_RECEIPT. El autor declara que no se afirma ninguna capacidad ni cifra de calidad para este artefacto. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en ingles, propia de un modelo causal de 1,5B parametros.
- Razonamiento basico y respuesta a instrucciones, presumiblemente adquiridos en la etapa SFT (no verificado por el autor).
- Generacion de codigo y matematicas: capacidad plausible por herencia de la familia Qwen2, pero no documentada ni medida en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Clasificacion y etiquetado de texto en ingles: con 1,5B parametros el modelo cabe en una GPU de consumo y puede procesar lotes de documentos para tareas de clasificacion o extraccion de entidades, siempre que se valide su calidad empiricamente antes de desplegarlo.
- Generacion aumentada por recuperacion (RAG) en dominios acotados: su tamano reducido permite desplegarlo junto a un indice vectorial en una sola maquina, generando respuestas a partir de contexto recuperado en ingles.
- Prototipado rapido de asistentes conversacionales: sirve como base para validar pipelines de inferencia (transformers, vLLM) antes de migrar a modelos mayores, gracias a su compatibilidad con la clase Qwen2ForCausalLM.
- Fine-tuning adicional sobre dominios especificos: al estar bajo Apache 2.0 y en safetensors, es un punto de partida licito para ajustes posteriores con LoRA o QLoRA en tareas verticales.
- Educacion e investigacion: util como modelo de referencia para estudiar el efecto del SFT sobre un modelo base de la familia Qwen2 en entornos con recursos limitados.
- Despliegue en el borde o en entornos con restricciones de privacidad: su huella de ~3,1 GB en bfloat16 (y menos si se cuantiza) permite ejecucion local sin enviar datos a la nube.
- Evaluacion de trazabilidad y gobierno de modelos: el repositorio es un caso practico de publicacion con recibos medidos y etiquetas UNKNOWN explicitas, util para equipos que disenan procesos de auditoria de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos del 2026-11-22 devolvio el estado UNKNOWN_NO_EVAL_RECEIPT, sin cadena de evaluacion estricta completa.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,1 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada con cuantizacion de 8 bits: en torno a 1,6-2 GB de pesos; con 4 bits, alrededor de 0,8-1 GB de pesos (estimaciones teoricas, no verificadas con este artefacto).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100/H100 no son necesarias y solo tendrian sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer modernas con 8 GB o mas en bfloat16, y en GPU con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), y previsiblemente vLLM, TGI o llama.cpp/Ollama si se generan pesos GGUF, aunque no se documentan artefactos de cuantizacion en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B-estate-sft-v1 | 1,54B | No disponible | Apache 2.0 | safetensors (bf16) | SFT sobre base Qwen2; sin benchmarks publicados |
| Qwen2-1.5B (familia original) | 1,54B | 32.768 tokens (segun documentacion publica de Qwen2) | Apache 2.0 | safetensors, GGUF | Modelo base de referencia de la misma arquitectura |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens (segun documentacion publica de Qwen2.5) | Apache 2.0 | safetensors, GGUF | Generacion posterior de la familia, con mejoras declaradas por el autor original |
| SmolLM2-1.7B | 1,7B | 8.192 tokens (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Alternativa pequena de Hugging Face con benchmarks publicados |

La comparacion con Qwen2-1.5B y Qwen2.5-1.5B se basa en la documentacion publica de dichos modelos; los datos de contexto de este artefacto concreto no estan disponibles. No se dispone de resultados de benchmark de SZL-Khipu-1.5B-estate-sft-v1 para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Ausencia de evaluacion: el autor declara explicitamente el estado UNKNOWN_NO_EVAL_RECEIPT; no hay benchmarks ni mediciones de calidad publicadas para este artefacto.
- Riesgo de alucinacion: inherente a los modelos causales de 1,5B parametros; sin evaluacion, el nivel de alucinacion es desconocido.
- Sesgos: no documentados; al entrenarse presumiblemente sobre datos en ingles, es probable que herede sesgos culturales y linguisticos de dichos datos, pero no hay analisis publicado.
- Limitacion idiomatica: el modelo solo declara soporte de ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar por su cuenta el cumplimiento y la calidad del modelo antes de usarlo en produccion.
- Trazabilidad: la cadena de recibos de entrenamiento y evaluacion no esta completa en los paths estandar; el autor remite a rutas no estandar y a un ledger de bloqueo, lo que dificulta la auditoria independiente.
- Procedencia del ajuste: no se detalla el dataset de SFT, por lo que no puede evaluarse la idoneidad del ajuste para dominios regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-estate-sft-v1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Organizacion en GitHub: https://github.com/szl-holdings
- Repositorio de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
