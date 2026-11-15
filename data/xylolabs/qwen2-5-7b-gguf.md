# Xylolabs/Qwen2.5-7B-GGUF

## Resumen
Xylolabs/Qwen2.5-7B-GGUF es una exportacion cuantizada en formato GGUF del modelo base Qwen2.5-7B, preparada por Xylolabs mediante llama.cpp. Se trata de una referencia "preservada" del modelo original: no se ha realizado entrenamiento, calibracion ni cuantizacion nueva para su publicacion, sino que se conservan los 339 tensores del decodificador de texto de 28 capas, el embedding, la cabeza de salida, el tokenizer y los metadatos originales. El objetivo es servir como linea base reproducible para comparar otras cuantizaciones candidatas frente a ella mediante metricas de divergencia KL y perdida de aciertos en tareas de completado.

El modelo subyacente, Qwen2.5-7B, es un transformer decoder-only de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) desarrollado por el equipo Qwen de Alibaba. Esta variante concreta se distribuye unicamente en una cuantizacion mixta Q4_K_M, con un peso de fichero de 4,683 GB y una media de 4,913 bits por peso (incluyendo tablas de mayor precision y operandos en float32). El repositorio completo ocupa 4,7 GB.

La relevancia de esta ficha es acotada pero util: permite a desarrolladores que despliegan Qwen2.5-7B en entornos con VRAM limitada disponer de una referencia GGUF verificada con un protocolo de evaluacion documentado, y a investigadores que trabajan en cuantizacion comparar sus resultados contra una linea base con huella de calibracion y evaluacion conocida. No es un modelo afinado para instrucciones ni para chat: es un modelo base que debe usarse con prompts de texto en crudo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), 28 capas |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | metadatos originales conservados; el ejemplo de llama.cpp usa 2048 tokens y las comprobaciones GPU de llama.cpp usan 8192; limite nativo de Qwen2.5-7B no detallado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M mixta (tipos almacenados: F32 141 tensores, Q4_K 169 tensores, Q6_K 29 tensores); media 4,913 bits/peso |
| Idiomas soportados | en, ko (segun tags del repositorio) |
| Licencia | Apache 2.0 (licencia original Qwen conservada sin cambios en LICENSE) |
| Formato de pesos | GGUF (fichero Qwen2.5-7B-Q4_K_M.gguf) |

## Arquitectura y entrenamiento
La arquitectura es la del Qwen2.5-7B original: un transformer decoder-only de 28 capas con embedding de tokens, decodificador de texto y cabeza de salida lineal. El export GGUF conserva los 339 tensores completos junto con el tokenizer y los metadatos originales, de modo que la estructura de red y las dimensiones internas coinciden con el modelo base publicado por Qwen.

No hubo entrenamiento adicional, calibracion ni cuantizacion nueva por parte de Xylolabs para esta publicacion; el proceso se limita a la conversion y preservacion en GGUF mediante llama.cpp (referencia de codigo fijada en el commit cd959bae99ff4bed22bef2604f45241c09bbb8c8). La evaluacion documentada compara esta cuantizacion Q4_K_M contra el BF16 almacenado: divergencia KL media de 0,036548, acuerdo top-1 del 90,81 % con BF16 y 25/28 respuestas correctas en el chequeo de completado (frente a 26/28 del BF16), sin regresiones contadas ni respuestas rotas. La huella de calibracion y evaluacion coincide con la original, y las comprobaciones cubren 8.184 posiciones puntuadas sobre ocho secuencias de texto en crudo de 1.024 tokens en ingles y coreano. No se reportan datos sobre composicion del dataset de entrenamiento original ni sobre RLHF/DPO en la informacion disponible.

## Capacidades
- Generacion de texto autoregresiva a partir de prompts en crudo (modelo base, sin plantilla de chat).
- Completado de codigo: el protocolo de evaluacion usa firmas de funcion y docstrings originales como prefijo, con presupuesto de 96 tokens para items de codigo.
- Razonamiento de sentido comun y factual basico, evaluado mediante preguntas de completado de texto plano.
- Capacidad multilingue limitada a ingles y coreano segun los tags del repositorio.
- No dispone de modo thinking ni de capacidades de vision o audio en esta variante.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso en la informacion disponible.
- Uso con llama.cpp y herramientas de completado (`llama-completion`), sin plantilla conversacional.

## Casos de uso
- Linea base para investigacion en cuantizacion: sirve como referencia fija contra la que comparar nuevas cuantizaciones (Q3, Q5, Q8, etc.) usando la divergencia KL media y el recuento de aciertos perdidos documentados, lo que permite validar pipelines de cuantizacion de forma reproducible.
- Despliegue en hardware con VRAM ajustada: con 4,683 GB de pesos y memoria adicional para KV cache y buffers, el modelo cabe en GPUs de consumo de 8 GB y superiores, permitiendo inferencia local de Qwen2.5-7B sin necesidad de precision BF16.
- Generacion de texto por lotes en servidores modestos: al ser un modelo base, encaja en tareas de continuacion de texto, autocompletado de documentos o generacion de borradores donde no se requiere seguir instrucciones.
- Completado de codigo en entornos de desarrollo local: el modelo puede continuar fragmentos de codigo a partir de firmas y docstrings, integrable en editores mediante llama.cpp.
- Evaluacion de infraestructura de inferencia: util para medir throughput y latencia de llama.cpp en GPU con contexto de 8192 tokens antes de escalar a modelos mayores.
- Pruebas de regresion de pipelines GGUF: la huella de evaluacion documentada (IDs de secuencia, IDs de token, posiciones puntuadas, prompts, stop IDs y presupuestos) permite montar tests automatizados que detecten degradaciones al cambiar de backend o de hardware.
- Experimentacion academica con modelos base multilingues en ingles y coreano, especialmente en tareas de modelado de lenguaje en crudo.

## Benchmarks y rendimiento

| Referencia | KL media | Acuerdo top-1 con BF16 | Respuestas correctas en completado | Perdidas/rotas contadas |
|---|---:|---:|---:|---:|
| BF16 almacenado | 0 | 100 % | 26/28 | — |
| Esta Q4_K_M | 0,036548 | 90,81 % | 25/28 | 0 |

El chequeo de completado usa 28 de los 33 items del protocolo original (se omiten cinco items con formato de instrucciones), con prefijo fijo de tres ejemplos en texto plano, generacion greedy de 48 tokens (96 para codigo) y el stop ID original. Se excluye de la metrica el item `ko-reason-weekday` porque la separacion top-2 del BF16 original en el primer token divergente es inferior a 1,0. No se reportan cifras de velocidad, throughput ni latencia. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 4,68 GB solo para los pesos GGUF, mas memoria para KV cache y buffers de trabajo; con contexto de 8192 tokens el consumo total supera los 5 GB.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM para contexto moderado; A100, H100 o RTX 4090 sobradas para este tamano, utiles si se necesita contexto largo o alto throughput.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas (por ejemplo RTX 3060 8 GB, RTX 4060, RTX 4070) con contexto ajustado; en 6 GB requeriria reducir contexto o usar offload parcial a CPU.
- Opciones de despliegue: llama.cpp (herramienta `llama-completion` verificada con llama.cpp v0.9.0), y en general cualquier runtime compatible con GGUF; vLLM, TGI y Ollama no se documentan en la informacion disponible para este fichero concreto.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-7B-GGUF (esta ficha) | 7,6 B | metadatos originales; ejemplos a 2048 y 8192 | GGUF Q4_K_M (4,683 GB) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B (base original) | 7,6 B | no detallado en la informacion disponible | safetensors (BF16) | Apache 2.0 | Hugging Face (modelo oficial) |
| Otras cuantizaciones GGUF de Qwen2.5-7B | 7,6 B | segun exportador | GGUF Q2 a Q8 | Apache 2.0 (heredada) | Hugging Face (multiples repositorios) |

La comparacion relevante es contra el BF16 original y contra otras cuantizaciones del mismo modelo base: esta Q4_K_M pierde 0,036548 de KL media y 9,19 puntos de acuerdo top-1 respecto al BF16, con una respuesta menos correcta en el chequeo de completado (25/28 frente a 26/28) y cero regresiones contadas. No se dispone de datos comparativos de rendimiento frente a modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias
- Es un modelo base, no afinado para instrucciones ni chat: usarlo con plantillas conversacionales produce resultados pobres; requiere prompts de texto en crudo.
- Riesgo de alucinacion inherente a un modelo de lenguaje de 7,6 B sin alineamiento por RLHF; no se documenta ningún proceso de alineamiento en esta variante.
- Idiomas limitados a ingles y coreano segun los tags; el castellano no figura como idioma soportado.
- La cuantizacion Q4_K_M introduce divergencia respecto al BF16 (KL media 0,036548, acuerdo top-1 90,81 %), lo que puede degradar tareas sensibles a precision numerica o de codigo.
- La evaluacion documentada es acotada (28 items de completado y 8.184 posiciones sobre ocho secuencias); no sustituye una evaluacion de tarea especifica para produccion.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 2026-11-15: no hay evidencia de adopcion comunitaria ni de mantenimiento continuado.
- Licencia Apache 2.0 heredada del release Qwen original, con LICENSE y NOTICE conservados; se distribuye "as is", sin garantia ni respaldo del proyecto upstream.
- No se reportan datos de velocidad ni latencia, por lo que no es posible planificar SLA de produccion solo con esta model card.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-7B
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen2.5-7B-GGUF/blob/main/LICENSE
- Codigo llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Herramienta de completado de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Repositorio Xylolabs (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
