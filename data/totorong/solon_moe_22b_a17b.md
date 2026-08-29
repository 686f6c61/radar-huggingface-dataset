# TOTORONG/Solon_MOE_22B_A17B

## Resumen

Solon-MoE-22B-A17B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso, creado por TOTORONG (Sungjin Park) mediante *upcycling* del modelo denso google/gemma-4-12B-it. Con 22 524 millones de parámetros totales y aproximadamente 17 000 millones activos por token, convierte 15 de las 48 capas del transformador original (L18–L22, L24–L28, L30–L34, excluyendo L23 y L29) en capas MoE nativas de Gemma4, añadiendo 4 expertos por capa con enrutamiento top-2. La ruta densa original se conserva íntegramente y se combina en paralelo con la contribución enrutada mediante un factor de escala λ aprendible por capa, de modo que λ=0 reproduce exactamente el modelo denso original.

El modelo está entrenado con razonamiento de cadena de pensamiento (CoT) sobre 260 000 muestras en coreano e inglés, con los expertos y el router actualizados mientras la parte densa permanece congelada. Según la evaluación interna del autor, supera al modelo base en tres benchmarks de razonamiento legal coreano (KMMLU-Hard) y mantiene un rendimiento estadísticamente indistinguible en GPQA-diamond en inglés. Su relevancia actual radica en ofrecer una vía eficiente para mejorar capacidades de razonamiento en dominios específicos (especialmente coreano) sin descartar el modelo denso original, con un mecanismo de seguridad λ que permite volver al comportamiento base. La longitud de contexto no se especifica en la documentación; el ejemplo de despliegue con vLLM usa 8192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SolonMoEForCausalLM (shim de 57 lineas sobre Gemma4 nativo); MoE disperso con 15 de 48 capas convertidas, 4 expertos por capa, top-2 routing, ruta densa paralela con escala λ |
| Parametros totales | 22 524 643 132 (22,5 B) |
| Parametros activos | ~17 B (estimado segun nombre del modelo; no se detalla el desglose exacto) |
| Longitud de contexto | no disponible (ejemplo de vLLM usa 8192) |
| Tipos de cuantizacion | BF16 nativo; otras cuantizaciones no documentadas |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Licencia Gemma (hereda del modelo base); el codigo de conversion y entrenamiento bajo Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it y convierte selectivamente 15 de sus 48 capas en bloques MoE usando el bloque MoE nativo de Gemma4 de transformers. Cada capa MoE añade 4 expertos inicializados desde la FFN densa de esa capa, con enrutamiento top-2 (softmax → top-k → renormalización → escala por experto). La FFN densa original se mantiene intacta y opera en paralelo con la contribución enrutada; un parámetro aprendible λ (implementado como `post_feedforward_layernorm_2`) pondera la salida enrutada. El entrenamiento se realizó con 260 000 muestras de razonamiento en coreano e inglés, actualizando únicamente los expertos y el router mientras la parte densa permanecía congelada. El modelo usa una plantilla de chat con canal de pensamiento (`<|channel>thought`) y un token especial de fin de turno `<turn|>` (id 106) que debe configurarse como EOS en inferencia. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto y razonamiento de cadena de pensamiento (CoT) entrenado explicitamente.
- Chat multi-turno con plantilla propia que incluye un canal de pensamiento separado.
- Razonamiento legal y analitico en coreano, con mejoras documentadas frente al modelo base en KMMLU-Hard (law, patent, criminal law).
- Razonamiento en ingles, con rendimiento comparable al modelo base en GPQA-diamond.
- Soporte bilingue coreano-ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Asistente juridico en coreano: el modelo puede analizar consultas legales, redactar respuestas fundamentadas y razonar sobre casos usando su entrenamiento CoT y su mejora especifica en benchmarks legales coreanos (law, patent, criminal law). Es adecuado por su rendimiento superior al modelo base en estos dominios.
- Atencion al cliente bilingue: con su plantilla de chat y su capacidad de razonamiento, puede gestionar conversaciones de soporte en coreano e ingles, manteniendo un hilo coherente gracias al token de fin de turno y al canal de pensamiento.
- Analisis de documentos normativos: puede resumir y extraer implicaciones de textos legales o tecnicos en coreano, aprovechando su ventana de contexto de al menos 8192 tokens (segun el ejemplo de despliegue).
- Educacion y tutoria: puede explicar conceptos de derecho, matematicas o ciencias en coreano e ingles, generando respuestas paso a paso con razonamiento explicito.
- Generacion de contenido bilingue: redaccion de articulos, informes o correos en coreano e ingles con control de tono y estructura, gracias a su entrenamiento en ambos idiomas.
- Investigacion en razonamiento de modelos: su arquitectura con λ ajustable y la ruta densa preservada permite estudiar el efecto del enrutamiento MoE sobre el rendimiento, siendo util como banco de pruebas para experimentos de interpretabilidad.

## Benchmarks y rendimiento

El autor publica resultados de evaluacion interna (n=50 por materia) tras el entrenamiento CoT, comparando con el modelo base Gemma4-12B-IT. No se han publicado resultados en benchmarks estandar publicos como MMLU, HumanEval o GSM8K.

| Benchmark (KMMLU-Hard, CoT) | Solon-MoE-22B-A17B | Gemma4-12B-IT |
|---|---|---|
| law | 0,38 | 0,32 |
| patent | 0,36 | 0,32 |
| criminal law | 0,32 | 0,30 |
| GPQA-diamond (ingles) | 0,56 | 0,64 (p=0,45, n.s.) |

Nota: los resultados son internos, con tamaño de muestra pequeno (n=50) y no han sido replicados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 45 GB (tamano del repositorio 45,1 GB). Se requiere una GPU con al menos 48 GB de VRAM para cargar los pesos completos sin cuantizacion (por ejemplo, A6000, A100 80GB, H100).
- Con cuantizacion a 4 bits (no documentada oficialmente, pero posible con herramientas como llama.cpp o GPTQ), el peso podria reducirse a ~11-12 GB, lo que permitiria ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). No hay datos oficiales de rendimiento en estas configuraciones.
- Opciones de despliegue: transformers con `trust_remote_code=True`, vLLM mediante un plugin incluido en el repositorio (registra `SolonMoEForCausalLM` via entry point), y posiblemente llama.cpp u Ollama si se generan cuantizaciones GGUF (no proporcionadas por el autor).
- En vLLM se recomienda `--attention-backend TRITON_ATTN` en GPUs Blackwell (sm120); el kernel FlashInfer decode no soporta esta configuracion de cabezas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|
| Solon-MoE-22B-A17B | 22,5 B totales / ~17 B activos | no disponible (ej. 8192) | Gemma (hereda) | Mejora en KMMLU-Hard legal coreano; GPQA-diamond similar al base |
| google/gemma-4-12B-it (base) | 12 B densos | no disponible | Gemma | Referencia original; rendimiento inferior en legal coreano |
| Mixtral 8x7B (referencia MoE) | 46,7 B totales / 12,9 B activos | 32 768 | Apache-2.0 | No comparable directamente; sin datos de benchmarks legales coreanos |

No se dispone de comparativas publicas con otros modelos MoE de tamano similar en los mismos benchmarks.

## Limitaciones y advertencias

- El modelo puede producir generaciones descontroladas (runaway) en aproximadamente el 12 % de los prompts de impuestos coreanos (n=50); el autor menciona un fine-tune de estabilidad como mitigacion conocida, pero no esta incluido en esta version.
- El factor λ debe mantenerse en 0,10 en inferencia; valores superiores degradan la calidad de las respuestas.
- Es obligatorio configurar el token `<turn|>` (id 106) como EOS; si no se hace, la generacion degenera en repeticiones.
- Requiere `trust_remote_code=True` en transformers y vLLM, lo que implica ejecutar codigo personalizado del autor.
- La licencia del modelo hereda los terminos de la licencia Gemma del modelo base, que pueden imponer restricciones de uso comercial; el codigo de conversion y entrenamiento se publica bajo Apache-2.0.
- No se documentan sesgos especificos, pero al estar entrenado principalmente en coreano e ingles, su rendimiento en otros idiomas no esta garantizado.
- La evaluacion publicada es interna, con muestra pequena (n=50) y no ha sido validada externamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TOTORONG/Solon_MOE_22B_A17B
- Perfil del autor (TOTORONG): https://huggingface.co/TOTORONG
- Repositorio de datasets del autor: https://huggingface.co/TOTORONG/datasets
- Modelo relacionado (Solon_MOE_p4): https://huggingface.co/TOTORONG/Solon_MOE_p4
- Grafo de arquitectura (hfviewer): https://hfviewer.com/TOTORONG/Solon_MOE_p4
