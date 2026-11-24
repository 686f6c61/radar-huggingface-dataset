# thinkspread/Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF

## Resumen

Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF es una cuantización GGUF del modelo Qwen3.6-35B-A3B, un transformer de tipo Mixture of Experts (MoE) desarrollado por Alibaba Qwen y publicado originalmente con licencia Apache 2.0. El modelo base cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) y activa únicamente 8 de sus 256 expertos enrutados por token, lo que reduce de forma drástica el coste computacional por token frente a un modelo denso del mismo tamaño. Esta versión concreta ha sido producida por el usuario thinkspread con un esquema de cuantización mixto orientado a la inferencia en un único stream sobre Macs Apple Silicon de 24 GB.

La contribución principal de esta ficha no es el modelo en sí, sino la receta de cuantización: capas densas (proyecciones de atención, experto compartido, embeddings y `lm_head`) en Q5_K/Q6_K, y expertos enrutados en IQ3_XXS para gate/up e IQ4_XS para down, con el router mantenido en F32. El resultado es un único archivo GGUF de 16,0 GB que, según las mediciones del autor en un Apple M5 Pro de 24 GB, decodifica a 95,5–96,1 tokens por segundo leyendo 1,90 GB por token, frente a los 80,4–80,8 tok/s y 2,46 GB/token del archivo UD-Q3_K_M de unsloth del que parte, con un incremento de perplejidad de solo +0,6 % (6,452 frente a 6,415).

Es relevante ahora porque demuestra que es posible ejecutar un MoE de 35B parámetros con calidad casi intacta en hardware de consumo de gama alta (24 GB de memoria unificada), algo que hasta hace poco exigía GPUs de centro de datos. La ficha cubre únicamente la variante de texto; el codificador visual se distribuye por separado como Core ML fp16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con Gated DeltaNet y proyecciones de atención; 256 expertos enrutados, 8 activos por token |
| Parámetros totales | 34.660.610.688 (≈34,7 B) |
| Parámetros activos | ≈3 B por token (8 de 256 expertos enrutados, según la nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GGUF mixto: Q5_K en capas densas por defecto, Q6_K en atención (`attn_q`, `attn_k`, `attn_v`, `attn_output`), experto compartido (`shexp`), embeddings de tokens y `lm_head`; IQ3_XXS en `ffn_gate_exps` y `ffn_up_exps`; IQ4_XS en `ffn_down_exps` (Q6_K en capas 34, 38 y 39); router en F32 |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (archivo único `Qwen3.6-35B-A3B-Q5K_IQ3XXS.gguf`, 16,0 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture of Experts con 256 expertos enrutados, de los cuales se activan 8 por token. La arquitectura incorpora capas Gated DeltaNet junto con proyecciones de atención clásicas, un experto compartido (`shexp`) y un router que decide la asignación de tokens a expertos. El tamaño total es de 34,7 mil millones de parámetros, pero el coste por token se aproxima al de un modelo de unos 3 mil millones de parámetros activos, lo que explica su viabilidad en hardware de consumo.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación) no se dispone de información en la documentación proporcionada. Lo que sí está documentado es el proceso de cuantización de esta variante: se parte del archivo `Qwen3.6-35B-A3B-UD-Q3_K_M.gguf` de unsloth y se re-cuantizan únicamente las capas densas mediante `llama-quantize --allow-requantize --pure`, mientras que los tensores de expertos y el router se copian sin modificar (byte a byte) desde el archivo original. La innovación técnica destacable es el análisis de sensibilidad por grupo de tensores: el autor comprobó que aplicar Q5_K a todas las capas densas (la receta válida para Qwen3.5) costaba 1,0 % de perplejidad en Qwen3.6 frente a solo 0,24 % en la generación anterior, y que subir atención, experto compartido y embeddings a Q6_K recupera aproximadamente el 40 % de esa pérdida con solo 52 MB adicionales por token. El archivo resultante lee 1,90 GB por token, frente a 2,46 GB del original con capas densas en Q8_0.

## Capacidades

- Generación de texto conversacional y de propósito general, en modo texto únicamente (sin proyector visual en este archivo).
- Razonamiento y matemáticas: capacidad heredada del modelo base Qwen3.6-35B-A3B, aunque no se documentan resultados de benchmarks en la información disponible.
- Generación de código: el modelo base está orientado a tareas de generación y asistencia de código, si bien esta ficha no aporta métricas específicas.
- Soporte multilingüe: no disponible en la información proporcionada; el autor no documenta los idiomas cubiertos.
- Tool calling / function calling: no documentado explícitamente para esta variante, aunque el servidor `tempo9` expone una API compatible con OpenAI y Anthropic, lo que facilita su integración en pipelines que esperan ese contrato.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Modo thinking explícito: no disponible en la información proporcionada.
- Visión: no incluida en este archivo; requiere el codificador visual separado `thinkspread/Qwen3.6-35B-A3B-Vision-CoreML-fp16` compilado para Core ML y cargado con `--tower auto` en tempo9 1.2.2 o superior.

## Casos de uso

- Asistente conversacional local en un Mac de 24 GB: el archivo cabe en el working set de GPU de un Apple Silicon de 24 GB y decodifica a ~96 tok/s en un M5 Pro, lo que permite mantener conversaciones multi-turno fluidas sin conexión a la nube ni coste por token.
- Prototipado y evaluación de MoE en hardware de consumo: investigadores que necesiten medir el comportamiento de un MoE de 35B parámetros sin acceso a A100/H100 pueden usar este GGUF con llama.cpp o tempo9 para experimentar con prompts, temperaturas y longitudes de contexto.
- Generación de código en estaciones de trabajo de desarrollo: al ejecutarse localmente con `llama-server -ngl 99 -fa on`, puede integrarse en editores y asistentes de código que consuman una API compatible con OpenAI, manteniendo el código fuente dentro del perímetro del desarrollador.
- Servicio de inferencia doméstico o de pequeña oficina: `tempo9` expone un servidor local compatible con OpenAI y Anthropic, de modo que herramientas ya existentes (clientes, SDKs, frameworks de agentes) pueden apuntar a `http://localhost` sin cambios de código.
- Procesamiento por lotes de documentos técnicos en inglés: el autor valida la perplejidad sobre prosa técnica en inglés, por lo que tareas de resumen, extracción y reescritura de documentación técnica en ese idioma son un uso razonable dentro de las limitaciones de calidad de la cuantización IQ3/IQ4.
- Análisis de imágenes con el codificador opcional: cargando `--tower auto` con tempo9 1.2.2+, el modelo puede responder preguntas sobre imágenes enviadas por la API, útil para clasificación visual, descripción de capturas o extracción de información de diagramas, siempre que ambos componentes quepan en los 24 GB.
- Comparación de recetas de cuantización: sirve como referencia reproducible para estudiar el compromiso entre tamaño, velocidad y perplejidad en MoE, ya que el autor publica el comando exacto de `llama-quantize` y las mediciones intermedias (Q8_0, Q6_K, Q5_K, Q4_K).

## Benchmarks y rendimiento

El autor publica mediciones de velocidad de decodificación y perplejidad en un Apple M5 Pro de 24 GB, con generación greedy de 256 tokens y prompt corto usando tempo9 1.2.1, y perplejidad calculada con `llama-perplexity` sobre 24 fragmentos de 2048 tokens de prosa técnica en inglés (comparación relativa, no absoluta).

| Archivo | Lectura por token | Decodificación (tok/s) | Perplejidad |
|---|---|---|---|
| unsloth UD-Q3_K_M (densas Q8_0) | 2,46 GB | 80,4–80,8 | 6,415 |
| Densas Q6_K | 2,10 GB | 88,1–89,2 | 6,418 |
| **Este archivo (Q5K_IQ3XXS)** | **1,90 GB** | **95,5–96,1** | **6,452** |
| Densas Q5_K (receta Qwen3.5) | 1,85 GB | 97,6–97,8 | 6,479 |
| Densas Q4_K | 1,61 GB | no disponible | 6,612 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el archivo pesa 16,0 GB y el autor lo valida en un Mac de 24 GB de memoria unificada, donde cabe junto con el codificador visual Core ML fp16 en la configuración por defecto.
- GPU recomendadas: Apple Silicon de 24 GB (validado en M5 Pro). Para GPUs discretas no hay mediciones en la información disponible, pero por tamaño (16 GB de pesos más overhead de contexto y KV cache) requiere al menos 24 GB de VRAM para una ejecución cómoda; una RTX 4090 de 24 GB es el mínimo razonable en el lado consumer, y A100/H100 de 40/80 GB ofrecen margen amplio.
- ¿Cabe en GPU consumer? Sí, en GPUs con 24 GB de VRAM (RTX 4090, RTX 3090) y en Macs Apple Silicon de 24 GB; en GPUs de 16 GB no cabe sin descargar capas a CPU, lo que degrada la velocidad.
- Opciones de despliegue: `tempo9` (servidor local compatible con OpenAI y Anthropic, con soporte de `--tower auto` para visión), `llama.cpp` mediante `llama-server -hf thinkspread/Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF:Q5K_IQ3XXS -ngl 99 -fa on`, y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc.) sujeto a que soporte los tipos IQ3_XXS/IQ4_XS y la arquitectura Qwen3.6.
- Latencia y throughput: ~95,5–96,1 tok/s de decodificación en un M5 Pro de 24 GB con tempo9 1.2.1; no se dispone de datos de prefill ni de latencia en GPU discreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| **Este archivo (Qwen3.6-35B-A3B-Q5K-IQ3XXS)** | 34,7 B totales, ~3 B activos | no disponible | Apache 2.0 | GGUF único 16,0 GB | Optimizado para decodificación single-stream en 24 GB Apple Silicon; +19 % de velocidad y +0,6 % de perplejidad frente al UD-Q3_K_M de unsloth |
| unsloth/Qwen3.6-35B-A3B-GGUF (UD-Q3_K_M) | 34,7 B totales, ~3 B activos | no disponible | Apache 2.0 | GGUF (varios quants) | Fuente de esta receta; capas densas en Q8_0, 2,46 GB/token, 80,4–80,8 tok/s, PPL 6,415 en el mismo hardware |
| thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF | 35 B totales, ~3 B activos | no disponible | Apache 2.0 | GGUF único | Receta previa con todas las densas en Q5_K; en Qwen3.5 costaba 0,24 % de perplejidad, pero en Qwen3.6 costaba 1,0 % |
| Qwen/Qwen3.6-35B-A3B (original) | 34,7 B totales, ~3 B activos | no disponible | Apache 2.0 | safetensors | Pesos sin cuantizar; requiere hardware de centro de datos o cuantización previa para consumo |

## Limitaciones y advertencias

- Es una cuantización agresiva: los expertos enrutados en IQ3_XXS e IQ4_XS introducen una pérdida de calidad medible (+0,6 % de perplejidad frente al UD-Q3_K_M con densas en Q8_0, y +0,6 % adicional respecto a densas Q6_K). Para tareas sensibles a la precisión (matemáticas complejas, código crítico) conviene validar contra el modelo sin cuantizar o contra un quant de mayor precisión.
- Solo texto: este archivo no incluye proyector visual. El uso con imágenes exige descargar por separado `thinkspread/Qwen3.6-35B-A3B-Vision-CoreML-fp16` y un tempo9 1.2.2 o superior; no está claro que ambos componentes quepan en configuraciones de 24 GB con contextos largos.
- Idiomas no documentados: el autor no especifica la cobertura lingüística del modelo base ni de esta cuantización, y la perplejidad se valida únicamente sobre prosa técnica en inglés. El rendimiento en castellano u otros idiomas no está medido.
- Longitud de contexto no disponible: la información proporcionada no indica la ventana de contexto del modelo base ni cómo afecta la cuantización a contextos largos; el KV cache adicional puede agotar los 24 GB en ventanas grandes.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación de factualidad en la documentación disponible. En producción conviene añadir verificación externa y grounding.
- Sesgos: no documentados en la información proporcionada; deben asumirse los del modelo base y los del corpus de entrenamiento, no auditados aquí.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución, pero se hereda del modelo base Qwen3.6-35B-A3B; conviene revisar el LICENSE del repositorio original por si hubiera términos adicionales de la política de uso de Qwen.
- Dependencia de tipos de cuantización exóticos: IQ3_XXS e IQ4_XS no están soportados por todos los runtimes GGUF; verificar compatibilidad con la versión de llama.cpp/Ollama antes de desplegar.
- Madurez del ecosistema: el modelo base es reciente (creado el 2026-10-28, actualizado el 2026-11-03) y las herramientas de servidor (tempo9 1.2.x) están en evolución activa; pueden aparecer regresiones entre versiones.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/thinkspread/Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- GGUF de origen (unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Receta previa para Qwen3.5: https://huggingface.co/thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF
- Codificador visual Core ML fp16: https://huggingface.co/thinkspread/Qwen3.6-35B-A3B-Vision-CoreML-fp16
- Servidor local tempo9: https://github.com/thinkspread/tempo9
