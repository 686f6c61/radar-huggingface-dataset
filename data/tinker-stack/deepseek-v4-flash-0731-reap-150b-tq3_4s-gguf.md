# Tinker-Stack/DeepSeek-V4-Flash-0731-REAP-150b-TQ3_4S-GGUF

## Resumen

DeepSeek-V4-Flash-0731-REAP-150b-TQ3_4S-GGUF es una cuantización GGUF selectiva y podada del modelo DeepSeek-V4-Flash-0731 de DeepSeek, publicada por el usuario Tinker-Stack en agosto de 2026. El modelo original es un MoE (Mixture of Experts) de 304B parámetros totales con soporte de contexto de un millón de tokens, orientado a generación de texto, razonamiento, código y flujos agénticos. La variante REAP-150B, creada por puwaer, poda la arquitectura a 150B parámetros totales con 132 expertos y 6 activos por token, y este repositorio la envuelve en un contenedor de cuantización TurboQuant `TQ3_4S` con una receta por tensor que combina varios tipos de cuantización para lograr 3,49 bits por peso.

La relevancia de este build radica en que consigue ejecutar un modelo de 150B en aproximadamente 70 GiB de VRAM con una ventana de contexto de 256K tokens, algo que una cuantización uniforme Q4_K (unos 84 GiB) no permitiría. Según la model card, la perplejidad en wikitext-2 se mantiene dentro del ruido del baseline IQ3_XXS (13,34 frente a 13,31), y el rendimiento en MBPP+ supera en 10,3 puntos al de la referencia FP8. Requiere el fork específico `turbo-tan/llama.cpp-tq3` para ejecutarse, ya que el llama.cpp estándar no reconoce el formato `TQ3_4S`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek4 (MoE con Multi-head Latent Attention) |
| Parametros totales | 150.128.549.111 (~150B) |
| Parametros activos | 6 de 132 expertos activos por token + 1 experto compartido (numero exacto de parametros activos no publicado) |
| Longitud de contexto | 256K tokens (contexto nativo del modelo base: 1.048.576) |
| Tipos de cuantizacion | TQ3_4S (contenedor, file_type=45); receta por tensor: IQ3_XXS, IQ3_S, mxfp4, Q8_0, Q6_K, F32 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | MIT (segun HuggingFace); DeepSeek (heredada del modelo base, segun la model card) |
| Formato de pesos | GGUF (TQ3_4S) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un MoE disperso con atención latente multi-cabeza (MLA), 43 capas (densas y MoE), tamaño oculto de 4096, 64 cabezas de atención con `head_count_kv = 1` y 132 expertos de los que se activan 6 por token más un experto compartido. La variante REAP-150B es una poda del modelo original de 304B que reduce los parámetros totales a 150B. No se han publicado detalles del entrenamiento del modelo base (dataset, tokens, pipeline de RLHF/DPO) en la información disponible.

La cuantización de este repositorio se realizó a partir de una re-cuantización Q8_0 de los pesos FP8 originales (79,2 GiB), usando `--allow-requantize` con una matriz de importancia (imatrix). La receta por tensor asigna IQ3_XXS (3,06 bpw) a los expertos gate/up de capas intermedias, IQ3_S a los expertos down, mxfp4 nativo sin tocar a las capas de borde (0-2 y 41-42), Q8_0 al experto compartido y a las embeddings, Q6_K a la atención, y F32 a las escalas de normalización. Esta distribución busca minimizar el coste medido de error, manteniendo alta fidelidad en la atención y en el experto compartido, que se usa en cada token.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de tool calling y flujos agénticos (etiquetas `agentic`, `tool-use`, `reasoning`).
- Codificación y generación de código, con rendimiento destacado en MBPP+ (+10,3 puntos sobre la referencia FP8).
- Razonamiento matemático: GSM8K y MATH-500 retenidos dentro del ruido respecto a la referencia FP8, según la model card.
- Multilingüe: inglés, chino y otros idiomas (etiqueta `multilingual`).
- Contexto largo de 256K tokens gracias a la caché KV comprimida `q8_0` K + `turbo4` V-cache.
- Decodificación especulativa `ngram-mod` (n16/m24) que acelera la generación de código y salida estructurada hasta ~85 tokens/s con 100% de aceptación de borradores en texto repetitivo, frente a ~21 tokens/s en modo denso.
- Opción de "uncensoring" mediante un LoRA externo rank-1 de 2 MB (heretic v2 `t256-r2`, no incluido en el repositorio) que reduce las tasas de rechazo del 99,29% a ~7% con baja deriva KL (0,085).

## Casos de uso

- Asistentes de atención al cliente con contexto largo: la ventana de 256K permite mantener conversaciones multi-turno extensas con historial completo, adecuado para soporte técnico o jurídico donde se manejan documentos largos.
- Generación de código en producción: con soporte de tool calling y decodificación especulativa, puede integrarse en pipelines de CI/CD para autocompletado, revisión de código o generación de tests, con throughput de ~85 tokens/s en salida estructurada.
- Razonamiento agéntico multi-paso: su arquitectura MoE con 6 expertos activos y soporte de agentes permite orquestar flujos de planificación, llamada a herramientas y ejecución de tareas complejas en entornos de investigación.
- Análisis de documentos extensos: el contexto de 256K permite procesar libros técnicos, expedientes o codebases completos en una sola pasada, con resúmenes y extracción de información sin fragmentación.
- Despliegue en hardware limitado: al caber en ~70 GiB de VRAM, permite servir un modelo de 150B en tres GPU Turing (1×22 GiB + 2×24 GiB) o configuraciones similares, donde un Q4_K uniforme no cabría.
- Investigación en cuantización selectiva: la receta por tensor documentada (archivo `weights.txt`) y la imatrix incluida sirven como referencia reproducible para experimentos de compresión de MoE grandes.

## Benchmarks y rendimiento

La model card reporta los siguientes datos, comparados con la referencia FP8 y con el baseline IQ3_XXS:

| Metrica | Valor |
|---|---|
| Perplejidad wikitext-2 (TQ3_4S) | ~13,34 (dentro del ruido del baseline IQ3_XXS: 13,3073 ± 0,23) |
| Perplejidad wikitext-2 (experimento IQ2_S fallido) | 14,30 (+7,5% respecto al baseline) |
| MBPP+ vs FP8 | +10,3 puntos |
| GSM8K / MATH-500 / HumanEval+ vs FP8 | Retenidos dentro del ruido (valores absolutos no publicados) |

No se han publicado valores absolutos de GSM8K, MATH-500, HumanEval+ ni otros benchmarks estándar en la información disponible. La model card indica que el razonamiento se mantiene dentro del ruido estadístico respecto a la referencia FP8, pero no ofrece cifras concretas.

## Requisitos de hardware

- Tamaño del archivo: 61,01 GiB a 3,49 BPW.
- VRAM estimada para inferencia con offload completo: ~70 GiB.
- GPU recomendadas: tres tarjetas Turing (1×22 GiB + 2×24 GiB); no cabe en GPU de consumo típica (una RTX 4090 con 24 GiB es insuficiente).
- Runtime obligatorio: fork `turbo-tan/llama.cpp-tq3` (commit `47635d7`); el llama.cpp estándar no carga el formato `TQ3_4S`.
- Throughput: ~21 tokens/s en modo denso; ~85 tokens/s con decodificación especulativa `ngram-mod` (n16/m24) en texto repetitivo o salida estructurada.
- El LoRA de uncensoring (2 MB) se aplica en tiempo de carga con `--lora`, sin modificar los pesos base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | VRAM aprox. | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base, FP8) | 304B | 1M | FP8 | ~304 GiB (sin cuantizar) | DeepSeek |
| DeepSeek-V4-Flash-0731-REAP-150b TQ3_4S (este) | 150B | 256K | GGUF TQ3_4S | ~70 GiB | MIT / DeepSeek |
| DeepSeek-V4-Flash-0731-REAP-150b Q4_K uniforme | 150B | 96K | GGUF Q4_K | ~84 GiB | DeepSeek |

La ventaja principal de este build frente al Q4_K uniforme es que reduce la VRAM necesaria en ~14 GiB y duplica el contexto (256K frente a 96K), a costa de requerir un runtime especializado. Frente al modelo base FP8, sacrifica contexto (256K frente a 1M) y fidelidad por una reducción drástica de requisitos de hardware. No se dispone de comparativas directas con otros MoE de tamaño similar (por ejemplo, Qwen o Mixtral) en la información proporcionada.

## Limitaciones y advertencias

- Requiere el fork `turbo-tan/llama.cpp-tq3`; el llama.cpp estándar rechaza el archivo por su formato `TQ3_4S`, lo que limita la portabilidad a otros runtimes (vLLM, Ollama, TGI no están soportados sin modificaciones).
- La licencia es ambigua: HuggingFace indica MIT, pero la model card afirma que la licencia es la de DeepSeek heredada del modelo base. Antes de un uso comercial, conviene verificar la licencia aplicable del modelo base.
- No es un modelo oficial de DeepSeek: es una poda (REAP) y cuantización de terceros, con solo 189 descargas y sin evidencia de validación extensiva en producción.
- El contexto se limita a 256K, frente al contexto nativo de 1M del modelo base; para aplicaciones que necesiten ventanas mayores, este build no es adecuado.
- La perplejidad es ligeramente superior al baseline IQ3_XXS (13,34 frente a 13,31), aunque dentro del ruido; la calidad en tareas de razonamiento no está cuantificada con valores absolutos.
- Riesgo de alucinación y sesgos no documentados: no se han publicado evaluaciones de sesgo, toxicidad o robustez para esta variante.
- La opción de "uncensoring" mediante LoRA es un componente externo (heretic v2) no incluido en el repositorio; su uso puede introducir comportamientos no deseados y no está avalado por DeepSeek.
- El archivo `weights.txt` y la imatrix se incluyen para reproducibilidad, pero la receta de cuantización es específica de este modelo y no es transferible a otras arquitecturas sin recalibración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tinker-Stack/DeepSeek-V4-Flash-0731-REAP-150b-TQ3_4S-GGUF
- Variante con LoRA de uncensoring: https://huggingface.co/Tinker-Stack/DeepSeek-V4-Flash-0731-REAP-150b-TQ3_4S-uncensored-GGUF
- Documentación de API de DeepSeek-V4-Flash-0731 en DeepInfra: https://deepinfra.com/deepseek-ai/DeepSeek-V4-Flash-0731/api
- Documentación de NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash-0731
- Hilo en foros de NVIDIA sobre el GGUF: https://forums.developer.nvidia.com/t/deepseek-v4-flash-0731-gguf-new-model/378829
