# wren6991/Ling-3.2-Air-GGUF

## Resumen

Ling-3.2-Air es un modelo multimodal de tipo image-text-to-text desarrollado por inclusionAI, con 127.486.405.600 parámetros totales (aproximadamente 124B) y una arquitectura MoE híbrida con atención lineal. La variante aquí documentada es una cuantización GGUF publicada por wren6991 bajo la etiqueta Q4_K_XL, una receta mixta propia que reduce el peso del checkpoint original en FP8 a unos 79,6 GB, lo que lo hace manejable en entornos con memoria limitada.

El modelo activa solo 5,5B de parámetros por token gracias a su arquitectura `bailingmoe3` con 512 expertos enrutados (8 activos) más un experto compartido, distribuidos en 43 capas. Es relevante ahora porque combina capacidades de razonamiento, visión y contexto largo en un paquete de licencia MIT, y esta cuantización concreta permite ejecutarlo con llama.cpp en hardware de gama alta de consumo o en servidores de una sola GPU.

La ficha se centra en la versión cuantizada GGUF, pero incluye las especificaciones del modelo base cuando son relevantes para evaluar su despliegue. Los datos de benchmarks y detalles de entrenamiento del modelo original no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `bailingmoe3` (MoE híbrida con atención lineal), 43 capas |
| Parámetros totales | 127.486.405.600 (~124B) |
| Parámetros activos | 5,5B (512 expertos enrutados, 8 activos, 1 compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_XL (receta mixta: Q4_K en `ffn_gate_exps`/`ffn_up_exps`, Q5_K en `ffn_down_exps`, Q8_0 en el resto de matrices derivadas de FP8, BF16 en embeddings/salida/`ssm_beta`/`attn_gate`/`nextn.eh_proj`, F32 en norms/biases/convs/routers) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (938 tensores, 79,6 GB) + proyector multimodal `mmproj-ling-3.2-air-F16.gguf` (837 MB) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `bailingmoe3`, una mezcla de expertos con componentes híbridos que combina atención lineal y mecanismos SSM (indicados por tensores como `ssm_beta`), junto con atención tradicional. Cuenta con 43 capas, 512 expertos enrutados de los que se activan 8 por token, más un experto compartido, lo que da lugar a 5,5B de parámetros activos sobre un total de ~124B. El checkpoint original está almacenado en FP8 (E4M3) con escalas de bloque de 128×128.

La cuantización de wren6991 convierte los tensores derivados de FP8 a Q8_0 y después re-cuantiza las capas de expertos a K-quants (Q4_K y Q5_K), manteniendo en BF16 los embeddings, la salida, `ssm_beta`, `attn_gate` y `nextn.eh_proj`, y en F32 las normas, biases, kernels de convolución y routers. El tokenizador, la plantilla de chat, los parámetros de muestreo y el resto de metadatos se heredan del checkpoint base. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento explícito mediante modo thinking (`enable_thinking=true` en la plantilla de chat).
- Comprensión de imágenes y vídeo a través del proyector multimodal F16 (`mmproj-ling-3.2-air-F16.gguf`).
- Procesamiento de entradas image-text-to-text (pipeline declarado en Hugging Face).
- Soporte de plantilla de chat Jinja (`--jinja`) en llama.cpp, lo que habilita tool calling y function calling si la plantilla base lo contempla.
- Capacidades de agente y razonamiento multi-paso derivadas del modo thinking y del soporte de herramientas.
- Muestreo recomendado por el autor: `temperature=1.0`, `top_p=0.95`, `top_k=20`.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede recibir imágenes junto con texto y mantener diálogos multi-turno, adecuado para interfaces de soporte que requieran interpretar capturas, documentos escaneados o fotografías.
- Análisis de documentos con imágenes: extracción de información de facturas, formularios o gráficos combinando OCR implícito y razonamiento textual, con la ventaja de que el proyector F16 preserva calidad visual.
- Razonamiento técnico con modo thinking: tareas de matemáticas, lógica o depuración de código donde conviene que el modelo exponga su cadena de razonamiento antes de responder.
- Despliegue en servidor único con llama.cpp: al ocupar 79,6 GB en Q4_K_XL, puede servirse con `llama-server` en una GPU de 80 GB o en configuraciones multi-GPU, ofreciendo una API compatible con OpenAI (`endpoints_compatible`).
- Prototipado e investigación en entornos con licencia permisiva: la licencia MIT permite uso comercial, modificación y redistribución sin restricciones adicionales, lo que facilita su integración en productos.
- Evaluación de cuantizaciones: la receta Q4_K_XL y el barrido KLD publicado sirven como referencia para estudiar el impacto de la cuantización mixta en modelos MoE multimodales.
- Procesamiento bilingüe inglés-chino: traducción, resumen y generación de contenido en ambos idiomas, con soporte nativo declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica un barrido de divergencia KL frente a una conversión Q8_0 del mismo checkpoint, medido con `llama-perplexity --kl-divergence` sobre `wikitext-2-raw/wiki.test.raw` con 16 chunks por longitud de contexto:

| Contexto | KLD media ↓ | KLD mediana | PPL Q4_K_XL | PPL Q8_0 | Ratio PPL | RMS Δp |
|---:|---:|---:|---:|---:|---:|---:|
| 512 | 0.0530 ± 0.0019 | 0.0164 | 4.480 | 4.384 | 1.0220 | 7.49% |
| 1024 | 0.0495 ± 0.0020 | 0.0117 | 4.300 | 4.255 | 1.0105 | 7.18% |
| 2048 | 0.0699 ± 0.0029 | 0.0156 | 6.374 | 6.391 | 0.9973 | 8.04% |
| 4096 | 0.0961 ± 0.0037 | 0.0152 | 10.136 | 10.286 | 0.9854 | 7.46% |

La KLD media crece con el contexto por una cola de tokens de alta divergencia (percentil 99,9 de KLD llega a 11,7 en 4096), mientras que la mediana se mantiene entre 0,011 y 0,016. La perplejidad es prácticamente idéntica en 512-2048 y ligeramente inferior a la base Q8_0 en 4096. El propio autor advierte que la muestra es pequeña (16 chunks por contexto) y que el punto de 4096 tiene una cola amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 GB para el modelo en Q4_K_XL, más ~1 GB adicional para el proyector multimodal F16.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU que sumen al menos 80 GB de VRAM.
- No cabe en GPU de consumo individual (RTX 4090 con 24 GB, RTX 3090 con 24 GB). Sería necesario repartir el modelo entre varias GPU o usar memoria del sistema con offloading, con la penalización de latencia correspondiente.
- Opciones de despliegue: `llama.cpp` (requiere una build con soporte para la arquitectura `bailingmoe3`, PR ggml-org/llama.cpp#29151 o posterior) mediante `llama-server` con `--jinja`; para visión, añadir `--mmproj mmproj-ling-3.2-air-F16.gguf`. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada. Al activar solo 5,5B de parámetros por token, el modelo tiene un coste computacional por token bajo en comparación con su tamaño total, pero el ancho de banda de memoria necesario para cargar 79,6 GB de pesos condiciona el rendimiento.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparativa se limita a características estructurales.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.2-Air (Q4_K_XL, este) | ~124B | 5,5B | no disponible | MIT | GGUF |
| Ling-3.2-air (base, FP8) | ~124B | 5,5B | no disponible | MIT | safetensors FP8 |
| Alternativas MoE multimodales de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible modelos comparables de la misma categoría (MoE multimodal de ~100B con licencia permisiva) con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni de tasas de alucinación para este checkpoint.
- Sesgos: no se ha publicado información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, lo que impide evaluar su impacto.
- Longitud de contexto: no disponible; el barrido KLD solo llega a 4096 tokens y muestra degradación en la cola de divergencia a esa longitud.
- Cuantización: la receta Q4_K_XL no es un tipo nativo de llama.cpp, sino una convención de nombres del autor; requiere una build reciente con soporte para `bailingmoe3`. La conversión FP8 → Q8_0 → K-quants introduce pérdida adicional respecto a una cuantización directa.
- Licencia: MIT, permisiva para uso comercial, pero conviene verificar la licencia del checkpoint base y de los datos de entrenamiento originales.
- Producción: el modelo ocupa ~80 GB, lo que exige hardware de gama alta; no se han publicado métricas de latencia, throughput ni estabilidad en cargas concurrentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/wren6991/Ling-3.2-Air-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- PR de soporte de `bailingmoe3` en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29151
