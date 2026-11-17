# zephel01/Qwen3.5-122B-A10B-IQ3_XXS-16G64G-GGUF

## Resumen

Qwen3.5-122B-A10B-IQ3_XXS-16G64G-GGUF es una cuantización GGUF de 3 bits del modelo Qwen3.5-122B-A10B, publicado por el usuario zephel01. Se trata de una distribución de pesos preparada específicamente para ejecutarse en equipos de consumo con una GPU de 16 GB de VRAM y 64 GB de RAM, empleando offload de expertos a CPU. El modelo base es un transformer de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen, con 122.111.526.912 parámetros totales, bajo licencia Apache 2.0.

La receta de cuantización es selectiva: los expertos enrutados se cuantizan a IQ3_XXS con una importance matrix construida con texto técnico y código en inglés y japonés, mientras que el resto de tensores (atención, proyecciones delta-net, expertos compartidos, embeddings de tokens y cabeza de salida) se mantienen en Q8_0. El resultado es un archivo de 51,1 GB repartido en dos shards que, según el autor, cabe íntegramente en la combinación 16 GB VRAM + 64 GB RAM sin lecturas de SSD durante la generación.

Su relevancia actual radica en que permite ejecutar localmente un modelo MoE de 122B parámetros con una pérdida de calidad medida (KL de 0,0349 frente a BF16) y velocidades declaradas de 41-47 tok/s en decodificación sobre una AMD Radeon AI PRO R9700 limitada a 16 GB de VRAM. El autor reporta además una tasa de resolución de 53/60 (88,3%) en una batería de tareas de código estilo llmbench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE); tag `qwen35moe` |
| Parametros totales | 122.111.526.912 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en el ejemplo de llama.cpp (`-c 32768`); máximo del modelo base no disponible |
| Tipos de cuantizacion | IQ3_XXS (expertos enrutados, 3,06 bits/peso) + Q8_0 (resto de tensores); media global 3,35 bits/peso |
| Idiomas soportados | inglés y japonés (declarados en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos shards: 29,8 GB + 21,2 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B es un transformer con arquitectura Mixture of Experts (etiqueta `qwen35moe` en la model card). La model card de esta cuantización menciona explícitamente proyecciones "delta-net" entre los componentes que se mantienen en Q8_0, junto con atención, expertos compartidos, embedding de tokens y cabeza de salida. El archivo GGUF de BF16 del que deriva esta cuantización (unsloth/Qwen3.5-122B-A10B-GGUF) contiene 48 bloques y no incluye bloque NextN (MTP), por lo que esta distribución no incorpora drafter MTP para decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento; esos datos no aparecen en la información proporcionada. La innovación técnica destacable de esta publicación es la propia receta de cuantización: IQ3_XXS con importance matrix para los expertos enrutados y Q8_0 explícito para `token_embd` y `output`, un ajuste que el autor señala como corrección respecto a su receta anterior (sin él, llama-quantize elige IQ3_S / Q5_K para esos dos tensores). El resultado medido es un KL medio de 0,0349 y un 89,3% de coincidencia en el token superior frente a BF16.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y resolución de tareas de código: la model card reporta 53/60 tareas resueltas en una batería estilo llmbench con tests ocultos, incluyendo niveles easy, medium, hard, expert, frontier y architect.
- Soporte de inglés y japonés declarado por el autor; la importance matrix se construyó con texto técnico y código en ambos idiomas.
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`), tal como se declara en los tags.
- Ejecución local con offload de expertos a CPU (`--cpu-moe` / `--n-cpu-moe` en llama.cpp).
- Tool calling, function calling, capacidades de agente multi-paso, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local: el modelo resuelve tareas con repositorio, informe de bug o petición de funcionalidad y tests ocultos, con una tasa declarada del 88,3% en 60 tareas. Adecuado para equipos que quieran un asistente de parcheo sin enviar código a la nube.
- Reparación y generación de parches en pipelines de CI: integrado mediante el endpoint compatible con OpenAI en `http://127.0.0.1:8082/v1/chat/completions`, puede invocarse desde scripts que reciban el fallo de un test y soliciten un parche candidato.
- Atención al cliente en inglés o japonés: el modelo declara soporte de ambos idiomas y se ejecuta sobre una ventana de 32.768 tokens configurable, suficiente para conversaciones multi-turno con historial extenso.
- Procesamiento de documentación técnica bilingüe (EN/JA): la importance matrix se construyó con texto técnico y código en estos idiomas, lo que orienta la cuantización hacia ese dominio; útil para resumir o transformar documentación y fragmentos de código.
- Despliegue en estaciones de trabajo con GPU de 16 GB: el objetivo declarado es un PC con 16 GB de VRAM y 64 GB de RAM, con un tier de RAM de aproximadamente 46 GB (`STRATA_GLM_RAM_GB`), lo que permite tener el modelo residente sin lecturas de SSD durante la escritura.
- Evaluación comparativa de cuantizaciones: el repositorio incluye el imatrix (`imatrix-qwen35-122b.gguf`, 0,36 GB) y documenta la receta completa, lo que permite reproducir la cuantización con otros parámetros o comparar contra el archivo IQ3_XXS-B no publicado.
- Experimentación con modelos MoE grandes en hardware de consumo: con `--cpu-moe` o `--n-cpu-moe`, el usuario puede ajustar cuántos expertos residen en GPU y cuántos en CPU, equilibrando VRAM y velocidad.

## Benchmarks y rendimiento

Calidad frente a BF16 (`llama-perplexity --kl-divergence`, 8 chunks de 1024 tokens de texto EN/JA reservado; perplejidad de BF16 en ese conjunto: 14,38):

| Archivo | Tamano | KL medio | KL 99% | Mismo token superior | PPL |
|---|---:|---:|---:|---:|---:|
| IQ3_XXS-B (no publicado) | 50,3 GB | 0,0379 | 0,247 | 88,0% | 14,63 |
| Este archivo (IQ3_XXS-B2) | 51,1 GB | 0,0349 | 0,238 | 89,3% | 14,58 |

Tareas de código (estilo llmbench, 60 tareas: easy 5, medium 5, hard 10, expert 12, frontier 8, architect 20; temperatura 0,6 / top_p 0,95 / top_k 20):

| Ejecución | Resueltas |
|---|---:|
| Este archivo, ejecución 1 | 50/60 (83,3%) |
| Este archivo, ejecución 2 | 53/60 (88,3%) |
| IQ3_XXS-B (no publicado), una ejecución | 53/60 (88,3%) |

Velocidad declarada: 41,2 tok/s en la imagen de presentación sobre una AI PRO R9700 limitada a 16 GB de VRAM; en la ejecución 2 de código, 44 tok/s en la tarea intermedia y 42-47 tok/s en el 80% de las tareas. El autor advierte que la medición se hizo sobre una R9700 capada a 16 GB, no sobre una tarjeta real de 16 GB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 16 GB es el objetivo de diseño; el resto del modelo (aproximadamente 51,1 GB en total) reside en RAM.
- RAM: 64 GB en el equipo objetivo; el tier de RAM de Abyss se configura en unos 46 GB (`STRATA_GLM_RAM_GB`).
- GPU recomendadas: AMD Radeon AI PRO R9700 (usada para las mediciones, capada a 16 GB). Otras GPU con 16 GB de VRAM no están documentadas en la información disponible.
- Cabe en GPU de consumo de 16 GB junto con 64 GB de RAM del sistema; no cabe íntegramente en una sola GPU de consumo.
- Despliegue: Abyss (motor del autor, con `setup-deepseek.sh --model qwen35 --download-model` o `setup-deepseek.bat` en Windows 11) y llama.cpp con el tag `qwen35moe` (`llama-server -m ... -ngl 99 --cpu-moe -c 32768`). vLLM, Ollama y TGI no se mencionan en la información disponible.
- Rendimiento: 41,2 tok/s de referencia y 42-47 tok/s en el 80% de las tareas de código, medidos en la configuración descrita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad / rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| Este archivo (Qwen3.5-122B-A10B IQ3_XXS 16G64G) | 122,1 B (MoE) | 32.768 en el ejemplo de llama.cpp | KL 0,0349; 53/60 tareas de código; 41-47 tok/s | Apache 2.0 | GGUF (51,1 GB) |
| Qwen3.5-122B-A10B (BF16) | 122,1 B (MoE) | no disponible | Referencia de calidad (PPL 14,38) | Apache 2.0 | safetensors / GGUF |
| Ornith-1.5-122B IQ3_XXS 16G64G | no disponible | no disponible | KL 0,138 con la misma receta | no disponible | GGUF (51,7 GB) |
| Qwen3.5-9B-QSA | no disponible | contexto largo (QSA) | no disponible | no disponible | GGUF (5,85 / 9,86 GB) |

## Limitaciones y advertencias

- Es un archivo con pérdida: 3 bits por peso en los expertos enrutados (media 3,35 bits/peso). El KL de 0,0349 y el 89,3% de coincidencia en el token superior implican divergencias respecto a BF16.
- La velocidad de 41,2 tok/s se midió en una R9700 capada a 16 GB, no en una GPU real de 16 GB; el rendimiento en tarjetas de consumo puede diferir.
- Los resultados de código varían entre ejecuciones (50/60 frente a 53/60); el autor califica de ruido las diferencias de una o dos tareas. Cinco tareas (t020, t046, t047, t057, t059) fallaron en las tres ejecuciones.
- Idiomas: solo inglés y japonés están declarados; el rendimiento en castellano no está documentado.
- No incluye bloque NextN (MTP), por lo que no dispone de drafter MTP para decodificación especulativa.
- Los nombres de archivo conservan la etiqueta anterior IQ3_XXS-B2; el cuantizador no es un tipo estándar de llama.cpp, sino una mezcla de tipos.
- El repositorio tiene 0 likes y 458 descargas; es una publicación de un tercero, no oficial de Qwen.
- Sesgos, riesgo de alucinación y restricciones adicionales de uso comercial más allá de Apache 2.0: no disponible en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.5-122B-A10B-IQ3_XXS-16G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Motor Abyss: https://github.com/zephel01/Abyss
- GGUF BF16 de origen: https://huggingface.co/unsloth/Qwen3.5-122B-A10B-GGUF
- Misma receta, otro modelo (Ornith-1.5-122B): https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Qwen3.5-9B con QSA: https://huggingface.co/zephel01/Qwen3.5-9B-QSA-GGUF
- Herramienta de benchmarks citada: https://github.com/zephel01/swe-bench
- Envío de resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.5-122B-A10B+16G64G
