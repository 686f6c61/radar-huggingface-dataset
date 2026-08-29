# voska/GLM-5.3-Flash-W4A16

## Resumen

GLM-5.3-Flash-W4A16 es una cuantización INT4 weight-only (W4A16, grupo de 128, simétrica) del modelo `zai-org/GLM-5.3-Flash`, el primer modelo nativamente multimodal de la serie GLM-5 de Z.ai. El modelo original es un Mixture-of-Experts de 320 mil millones de parámetros con 18 mil millones activos por token, una ventana de contexto de un millón de tokens y licencia MIT, diseñado para tareas de coding y trabajo agéntico. Esta variante cuantizada, creada por el usuario voska, está pensada para servir el modelo en entornos self-hosted con SGLang sobre GPUs Blackwell (SM120, como la RTX PRO 6000), reduciendo significativamente los requisitos de memoria sin materializar el checkpoint BF16 completo.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 320B en hardware más accesible, manteniendo la calidad cerca del lanzamiento FP8 oficial. La cuantización conserva las capacidades de visión y tool calling, pero desactiva la decodificación especulativa, que en esta versión resulta contraproducente (medido un +57,6 % de throughput single-stream al desactivarla). Incluye además instrucciones de despliegue específicas y advertencias sobre un bug de SGLang que afecta a cualquier build cuantizado de esta arquitectura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención lineal KDA (34 capas), DSA (11 capas) y sparse indexer, más torre de visión |
| Parametros totales | 320B (del modelo base) |
| Parametros activos | 18B por token (del modelo base) |
| Longitud de contexto | 1M tokens (del modelo base) |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16), group-128, simétrico |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

Nota: el repositorio HuggingFace muestra un tamaño de 0.0 GB, probablemente un error de metadatos; el modelo contiene 36,288 tensores empaquetados INT4 más los módulos en BF16.

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE de 320B con 18B activos, que combina atención lineal KDA (Key-Driven Attention) en 34 capas, DSA (Dynamic Sparse Attention) en 11 capas y un sparse indexer, junto con una torre de visión para procesamiento multimodal. Z.ai indica que GLM-5.3 usa la misma base que GLM-5.2, con todas las mejoras logradas mediante post-entrenamiento, especialmente en coding complejo y tareas de largo horizonte.

Esta cuantización convierte a INT4 únicamente los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`) de las capas 3 a 44, dejando en BF16 los módulos de atención, visión, MTP/NEXTN draft head, `shared_experts`, el router y las capas densas iniciales. El método de cuantización transforma directamente desde el checkpoint FP8 oficial (sin materializar BF16, que ocuparía 642 GB) mediante escalas simétricas por grupo de 128. Se conservan los pesos en formato compressed-tensors para su carga en SGLang.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto (pipeline image-text-to-text), conservando la torre de visión del modelo original.
- Generación de texto y razonamiento complejo, incluyendo tareas de coding y agentes.
- Tool calling / function calling preservado según la model card.
- Soporte de contexto largo de hasta 1M tokens.
- Capacidades multilingües en inglés y chino (idiomas declarados en el modelo).
- No soporta decodificación especulativa: la cuantización del MTP head no está incluida, y activarla degrada el rendimiento (aceptación de drafts de 1.01–1.04 frente a 2.5–2.8 del FP8).

## Casos de uso

- Despliegue self-hosted de un modelo 320B multimodal en una sola GPU Blackwell (SM120) usando SGLang, con throughput de 102.67 tok/s en single-stream y 540.38 tok/s agregado a concurrencia 10.
- Asistentes de visión-lenguaje con contexto muy largo, como análisis de documentos extensos que combinan imágenes, tablas y texto, aprovechando la ventana de 1M tokens.
- Agentes autónomos que requieren tool calling y razonamiento multi-paso, manteniendo la calidad de planificación del modelo base con menor huella de memoria.
- Generación de código en producción: el modelo conserva las capacidades de coding de GLM-5.3, y puede integrarse en pipelines de CI/CD o IDEs como backend de autocompletado o revisión de código.
- Chat conversacional bilingüe (inglés/chino) con entrada de imágenes, para aplicaciones de atención al cliente o soporte técnico visual.
- Investigación en eficiencia de inferencia: sirve como referencia para estudiar el impacto de la cuantización W4A16 en arquitecturas MoE híbridas, dado que incluye mediciones detalladas de throughput y divergencia KLD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta cuantización. Sin embargo, la model card incluye mediciones de rendimiento de inferencia y de divergencia respecto al modelo BF16:

| Métrica | Spec ON | Spec OFF | Delta |
|---|---|---|---|
| Single-stream decode | 65.14 tok/s | 102.67 tok/s | +57.6 % |
| Agregado @ concurrencia 5 | 226.09 tok/s | 314.60 tok/s | +39.1 % |
| Agregado @ concurrencia 10 | 350.00 tok/s | 540.38 tok/s | +54.4 % |

| Variante | Mean KLD vs BF16 | Ratio a FP8 oficial |
|---|---|---|
| FP8 oficial | 0.0206 | 1.00× |
| 4-bit weight-only | 0.0246 | 1.19× |
| NVFP4 W4A4 | 0.0605 | 2.9× |

Los valores de throughput se midieron en un sistema idle con las mismas cargas y solo variando los flags de especulación. La divergencia KLD se refiere al coste de cuantizar pesos frente a activaciones.

## Requisitos de hardware

- GPU recomendada: RTX PRO 6000 Blackwell (SM120) o similar con soporte para kernels Marlin INT4. La model card menciona 384 GB de VRAM como límite para el checkpoint BF16, lo que sugiere que esta versión cuantizada cabe en configuraciones de 96–192 GB, aunque no se especifica el valor exacto.
- VRAM estimada: no disponible en la información proporcionada; el tamaño de los pesos INT4 de los expertos enrutados (36,288 tensores) más los módulos BF16 restantes puede estimarse en ~180–220 GB, pero no se confirma.
- Despliegue: exclusivamente mediante SGLang, con flags obligatorios `--disable-shared-experts-fusion`, `--kv-cache-dtype bfloat16` y `--chunked-prefill-size 4096`. No se deben pasar flags de especulación.
- Throughput medido: 102.67 tok/s single-stream, 540.38 tok/s agregado a concurrencia 10 (con spec OFF).
- No es compatible con vLLM, llama.cpp u Ollama en esta configuración, ya que el formato compressed-tensors está orientado a SGLang.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (FP8 oficial) | 320B | 18B | 1M | FP8 | MIT | Calidad superior (KLD 0.0206), soporta speculative decoding, requiere más VRAM |
| GLM-5.3-Flash-W4A16 (este) | 320B | 18B | 1M | INT4 W4A16 | MIT | Menor huella, sin spec decoding, throughput mayor sin spec |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | FP8 | MIT | Arquitectura MoE similar, pero sin visión y contexto menor |

Comparado con el FP8 oficial, esta versión sacrifica un ~19 % de fidelidad (KLD 1.19×) a cambio de un ahorro sustancial de memoria. Frente a alternativas como DeepSeek-V3, GLM-5.3-Flash ofrece multimodalidad y contexto mucho mayor, aunque con menos parámetros totales.

## Limitaciones y advertencias

- Decodificación especulativa no soportada: la cuantización del MTP head no está incluida, y activarla reduce el throughput en ~57 % sin beneficios de calidad.
- Bug de SGLang con MoE cuantizado: es obligatorio usar `--disable-shared-experts-fusion`, de lo contrario el modelo genera texto fluido pero sin sentido (expertos enrutados a slots no inicializados).
- Solo se declaran inglés y chino; otros idiomas pueden funcionar pero no están garantizados.
- Degradación de calidad respecto al FP8 oficial: KLD 1.19×, concentrada principalmente en las activaciones, no en los pesos.
- El checkpoint no incluye los módulos de atención y visión cuantizados, por lo que el ahorro de memoria es parcial (los expertos enrutados son ~20 % de los bytes por token en decode).
- Repositorio con 0 descargas y 0 likes al momento de la consulta; no hay evidencia de pruebas comunitarias amplias.
- Requiere hardware específico (SM120) para los kernels Marlin INT4; en GPUs Hopper o Ampere puede no funcionar correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/voska/GLM-5.3-Flash-W4A16
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentación de Z.ai para GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Ficha de GLM-5.3-Flash en Modal: https://modal.com/library/zai/glm-5-3-flash
- Guía de uso de GLM-5.3-Flash (tosea.ai): https://tosea.ai/blog/glm-5-3-flash-complete-guide
- Issue de SGLang sobre mixed-precision en MoE: https://github.com/sgl-project/sglang/issues/16276
