# Thox-ai/ThoxLLM-327M-v2

## Resumen

ThoxLLM-327M-v2 es un modelo de lenguaje decoder-only de 327 millones de parametros entrenado desde cero por THOX.ai LLC, publicado en Hugging Face bajo licencia Apache-2.0. Forma parte de la linea de investigacion de modelos pequenos de THOX y esta disenado especificamente para exportacion limpia a GGUF, lo que facilita su despliegue en entornos locales y de borde mediante llama.cpp y Ollama. El checkpoint se presenta como un "research checkpoint" y no cuenta con resultados publicados del benchmark interno GATE49 de THOX.

La arquitectura es un decoder transformer personalizado de la familia `thoxllm`, con 20 capas, hidden size de 1024, 16 cabezas de atencion con 8 cabezas KV (GQA), FFN con activacion SwiGLU de dimension intermedia 3413, vocabulario de 50.304 tokens, embeddings atados y contexto maximo de 2048 tokens. Los pesos estan en bfloat16 y el modelo no incluye la clave `architectures` en su `config.json`, por lo que no carga con `AutoModel` estandar de Hugging Face.

Su relevancia actual radica en ser un ejemplo de modelo pequeno entrenado integramente desde cero (sin modelo base externo), orientado a inferencia local-first y a despliegues en dispositivos con recursos limitados dentro del ecosistema THOX. Con 324.162.560 parametros reales y un repo de 0,6 GB, es adecuado para experimentacion, prototipado y tareas de generacion de texto en ingles donde no se requiera razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer personalizado THOX (`thoxllm`), SwiGLU, RMSNorm, RoPE, GQA |
| Parametros totales | 324.162.560 (327M nominales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GGUF disponible en repo separado (ThoxLLM-327M-v2-GGUF); pesos originales en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 648.339.368 B) y GGUF |

## Arquitectura y entrenamiento

El modelo emplea un decoder transformer de 20 capas con hidden size 1024, 16 cabezas de atencion y 8 cabezas KV (Grouped Query Attention), lo que reduce el coste de memoria del KV cache en inferencia. La FFN usa SwiGLU con dimension intermedia 3413, se aplica RMSNorm y RoPE para el codificado posicional, y los embeddings de entrada y salida estan atados (tied embeddings). El vocabulario es de 50.304 tokens y el contexto maximo de 2048 tokens. Los pesos se almacenan en bfloat16.

El entrenamiento se realizo desde cero por THOX.ai LLC, sin modelo base externo, como parte de su linea de investigacion de modelos pequenos. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del corpus ni si se aplicaron tecnicas de RLHF, DPO o instruccion tuning. El corpus es mayoritariamente en ingles. El autor indica que el modelo esta construido para exportacion limpia a GGUF, y que la arquitectura es personalizada (`thoxllm`), por lo que requiere el paquete THOX `thoxllm` o el build GGUF para su carga.

## Capacidades

- Generacion de texto en ingles en estilo completion, adecuada para tareas de continuacion y generacion libre.
- Razonamiento basico y respuesta a prompts simples, con limitaciones propias de un modelo de 327M parametros.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: solo se declara ingles, con calidad inferior en otros idiomas.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- Exportacion a GGUF para ejecucion en llama.cpp y Ollama.
- Disenado para despliegue on-device y edge dentro del stack THOX.

## Casos de uso

- Generacion de texto local en dispositivos de borde: el modelo cabe en GPUs de consumo y en CPU, permitiendo autocompletado y generacion de texto sin conexion gracias a su tamano de 327M parametros y su contexto de 2048 tokens.
- Prototipado rapido de pipelines de NLP: util como modelo de referencia para validar infraestructura de inferencia (llama.cpp, Ollama, vLLM) antes de escalar a modelos mayores.
- Educacion e investigacion: sirve como caso de estudio de un modelo decoder entrenado desde cero con arquitectura personalizada, util para analizar decisiones de diseno (GQA, SwiGLU, tied embeddings) en modelos pequenos.
- Asistentes embebidos en aplicaciones de escritorio: integrable via Ollama para tareas de generacion de texto en ingles con baja latencia y sin dependencia de la nube.
- Filtrado y clasificacion de texto simple: puede emplearse para tareas de etiquetado o resumen de fragmentos cortos en ingles, siempre con verificacion humana.
- Experimentacion con cuantizacion GGUF: permite comparar calidad y rendimiento entre distintos niveles de cuantizacion (Q4_K_M, etc.) en hardware limitado.
- Generacion de contenido de baja criticidad: borradores, ideas o texto auxiliar donde no se requiera precision factual alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultado GATE49 publicado para este modelo y que no se ha divulgado evaluacion cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,65 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica alrededor de 1-1,5 GB.
- VRAM estimada en cuantizacion Q4_K_M (GGUF): aproximadamente 0,2-0,3 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 4060, RTX 4090; tambien cabe en Apple Silicon y en CPU.
- Cabe holgadamente en GPUs de consumo; es ejecutable en CPU y en dispositivos de borde.
- Opciones de despliegue: llama.cpp y Ollama mediante el repo GGUF (ThoxLLM-327M-v2-GGUF); para safetensors se requiere el paquete THOX `thoxllm`, ya que `AutoModel` estandar puede no cargarlo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxLLM-327M-v2 | 327M | 2048 | Apache-2.0 | safetensors, GGUF | Arquitectura custom `thoxllm`, solo ingles |
| ThoxMini-125M-role | 125M | no disponible | no disponible | no disponible | Modelo THOX de menor tamano, orientado a rol |
| ThoxRoute-1.5B | 1.5B | no disponible | no disponible | no disponible | Modelo THOX mayor, posible uso de enrutado |
| Alternativas open source de ~300M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

La informacion disponible no incluye benchmarks ni especificaciones detalladas de modelos comparables de otros fabricantes, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo base de 327M parametros: comportamiento tipo completion, razonamiento limitado y fiabilidad factual baja; se recomienda verificar respuestas importantes.
- Sesgos y comportamiento reflejan los datos de entrenamiento, mayoritariamente en ingles; la calidad en otros idiomas es inferior.
- Riesgo de alucinacion elevado, especialmente en tareas de conocimiento factual o razonamiento complejo.
- Arquitectura personalizada: los cargadores estandar de Hugging Face pueden no cargar el checkpoint safetensors directamente; se requiere el paquete `thoxllm` o el build GGUF.
- No es un asistente publico alineado en seguridad salvo que se despliegue detras de guardrails de THOX.
- Fuera de alcance: decisiones medicas, legales, financieras o de seguridad critica sin revision humana; control desatendido de dispositivos fisicos sin paso de confirmacion.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como research checkpoint sin garantias.
- No se documentan resultados de evaluacion, por lo que el rendimiento real en produccion es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxLLM-327M-v2
- Build GGUF: https://huggingface.co/Thox-ai/ThoxLLM-327M-v2-GGUF
- Catalogo de modelos THOX.ai: https://www.thox.ai/docs/model-catalog
