# Szymon-Wachelko/GPT-neo-Custom-14B-GGUF

## Resumen

GPT-neo-Custom 14B-DUS GGUF es un modelo conversacional publicado por Szymon-Wachelko en formato GGUF y orientado a generacion de texto en polaco e ingles. Segun su model card, se construye a partir de Szymon-Wachelko/GPT-neo-Custom-7B-GGUF mediante la tecnica Depth Up-Scaling (DUS), escalando la red hasta 56 capas y unos 14.700 millones de parametros. El repositorio declara 14.141.234.688 parametros reales en safetensors, en linea con esa cifra.

El modelo se distribuye exclusivamente en cuantizaciones GGUF (desde Q2_K hasta F16) y esta pensado para ejecucion local con llama.cpp, Ollama, LM Studio y Jan. Su propuesta de valor es doble: fluidez nativa en polaco (gramatica, declinaciones, estructuras complejas) y competencia en ingenieria de software y razonamiento estructurado, manteniendo compatibilidad con hardware de consumo.

Es relevante ahora porque cubre un nicho poco atendido: modelos abiertos con calidad aceptable en polaco que ademas caben en GPUs de 8-12 GB de VRAM en cuantizaciones de 3-4 bits. La licencia Apache 2.0 facilita su uso comercial, aunque el model card no documenta el dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Depth Up-Scaling (DUS, 56 capas); el model card menciona qwen2 entre sus tags |
| Parametros totales | 14.141.234.688 (aprox. 14,7 B segun el model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el ejemplo de llama-server usa `-c 4096` |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (en) y polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 341,4 GB con todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo parte de GPT-neo-Custom 7B y aplica Depth Up-Scaling (DUS) para duplicar aproximadamente el numero de capas hasta 56, alcanzando unos 14,7 B de parametros. DUS es la tecnica popularizada por los modelos SOLAR: se duplican bloques de capas del modelo base y se continua el entrenamiento para que las capas nuevas se integren. El model card no detalla cuantos bloques se duplicaron ni si hubo poda o reordenacion de capas.

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de SFT, RLHF o DPO. Tampoco se documenta la longitud de contexto nativa ni la implementacion de atencion (GQA, MHA, RoPE). Los tags incluyen `qwen2` y `dus`, lo que sugiere una base derivada de la familia Qwen2, pero esta afirmacion no se confirma en el texto del model card. No hay innovaciones tecnicas documentadas mas alla del propio DUS.

## Capacidades

- Generacion de texto conversacional multi-turno en polaco e ingles.
- Fluidez en polaco: gramatica, declinaciones y estructuras complejas segun el autor.
- Generacion, depuracion y explicacion de codigo en Python, C++, JavaScript, TypeScript, SQL, Rust y shell scripting.
- Razonamiento matematico con cadena de pensamiento (chain-of-thought) y puzzles logicos.
- Redaccion de documentacion tecnica.
- Formato de chat con tokens especiales (el Modelfile de ejemplo define `stop "<|im_end|>"`).
- Compatibilidad con llama.cpp, Ollama, LM Studio y Jan.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Vision, audio o thinking mode explicito: no disponible.

## Casos de uso

- Asistencia conversacional en polaco para atencion al cliente: el modelo mantiene dialogos multi-turno con memoria contextual y responde con gramatica nativa, adecuado para empresas que operan en el mercado polaco y necesitan ejecucion local por privacidad.
- Generacion de codigo en entornos con GPU de consumo: con Q4_K_M (~8 GB) puede desplegarse en una RTX 3060 de 12 GB para autocompletado, explicacion de funciones y generacion de tests en Python, TypeScript o SQL dentro de un IDE o pipeline interno.
- Documentacion tecnica bilingue: traduccion y redaccion de manuales y READMEs entre ingles y polaco manteniendo terminologia tecnica, gracias al entrenamiento declarado en ambos idiomas.
- Tutorizacion de matematicas y logica: el modelo esta orientado a razonamiento paso a paso, util para generar explicaciones didacticas de problemas o verificar demostraciones sencillas.
- Despliegue en portatiles y edge: las cuantizaciones Q3_K_S (~5,6 GB) y Q2_K (~4,8 GB) permiten ejecucion en equipos sin GPU dedicada o con 6-8 GB de VRAM, para prototipos y demos offline.
- Chatbot interno de soporte a desarrolladores: con llama-server en el puerto 8080 se puede exponer una API compatible con OpenAI para integrarla en herramientas internas de consulta de codigo y documentacion.
- Analisis de texto en polaco: resumen, clasificacion y extraccion de informacion de documentos en polaco en entornos donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (datos del model card):
  - F16: ~28,5 GB de fichero; 32 GB+ de VRAM.
  - Q8_0: ~15,2 GB; 18-20 GB de VRAM.
  - Q6_K: ~12,2 GB; 14-16 GB de VRAM (RTX 3090/4090).
  - Q5_K_M: ~10,5 GB; 12-14 GB de VRAM.
  - Q5_K_S: ~9,9 GB; 12 GB de VRAM.
  - Q4_K_M: ~8,01 GB; 10-12 GB de VRAM (recomendado para RTX 3060 de 12 GB).
  - Q4_K_S: ~7,5 GB; 10 GB de VRAM.
  - Q3_K_L: ~6,9 GB; 8-10 GB de VRAM.
  - Q3_K_M: ~6,2 GB; 8 GB de VRAM.
  - Q3_K_S: ~5,6 GB; 6-8 GB de VRAM.
  - Q2_K: ~4,8 GB; 6 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 3090, RTX 4090, A100/H100 para F16. Tambien ejecutable en CPU con llama.cpp.
- Cabe en GPU de consumo desde Q2_K hasta Q5_K_M; Q6_K y Q8_0 requieren GPUs de 16 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/Szymon-Wachelko/GPT-neo-Custom-14B-GGUF`), LM Studio y Jan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GPT-neo-Custom 14B-DUS | ~14,1 B | no disponible (ejemplo con 4096) | en, pl | Apache 2.0 | GGUF | DUS sobre base de 7B; foco en polaco |
| GPT-neo-Custom 7B (base) | ~7 B | no disponible | en, pl | Apache 2.0 | GGUF | Modelo del que deriva; menor coste de VRAM |
| Modelos Qwen2.5 de 14B | ~14,7 B | 32K (segun familia Qwen2.5) | multilingue amplio | Apache 2.0 (variantes abiertas) | safetensors, GGUF | Referencia generalista; cobertura de polaco menor que un modelo especializado |
| Bielik (familia polaca) | 7B-11B segun variante | variable | pl, en | Apache 2.0 en variantes abiertas | safetensors, GGUF | Alternativa nativa polaca; el model card no ofrece comparacion directa |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico con estas alternativas.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento ni el proceso de alineacion (SFT/RLHF/DPO), lo que dificulta evaluar sesgos y calidad real.
- Riesgo de alucinacion inherente a modelos de 14 B sin benchmarks publicados que lo acoten.
- El model card mezcla tags (`qwen2`, `dus`, `polish`, `chatgpt`) que no se explican en el texto; la arquitectura exacta no esta verificada de forma independiente.
- Cobertura limitada a ingles y polaco; el rendimiento en otros idiomas, incluido el espanol, no esta garantizado.
- Longitud de contexto no especificada; el ejemplo de despliegue usa 4096 tokens, lo que sugiere que contextos mayores pueden no estar soportados o degradar la calidad.
- El autor recomienda cuantizaciones de 4 bits o superiores; Q2_K y Q3_K_S pueden degradar notablemente la calidad.
- El repositorio ocupa 341,4 GB por acumular todas las cuantizaciones; descargar solo el fichero necesario.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las obligaciones de atribucion y las condiciones del modelo base.
- Sin datos de throughput ni latencia; validar el rendimiento en el hardware objetivo antes de produccion.
- Modelo con 0 likes y ~801 descargas en el momento de la consulta: comunidad y validacion externa muy limitadas.

## Enlaces

- Hugging Face: https://huggingface.co/Szymon-Wachelko/GPT-neo-Custom-14B-GGUF
- Modelo base: https://huggingface.co/Szymon-Wachelko/GPT-neo-Custom-7B-GGUF
- Discusiones del modelo: https://huggingface.co/Szymon-Wachelko/GPT-neo-Custom-14B-GGUF/discussions
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
