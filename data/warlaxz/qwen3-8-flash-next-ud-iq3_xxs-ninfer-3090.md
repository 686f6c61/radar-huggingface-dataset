# WarlaxZ/Qwen3.8-Flash-Next-UD-IQ3_XXS-NInfer-3090

## Resumen

Qwen3.8-Flash-Next en formato NInfer es una compilación de terceros del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario WarlaxZ. No se trata de un checkpoint original ni de una distribución en Safetensors o GGUF, sino de una reescritura del GGUF `UD-IQ3_XXS` de Unsloth dentro del contenedor propietario `.ninfer` del motor NInfer, en su fork específico para la GPU RTX 3090 (ashalliants/ninfer-3090). El modelo base es un transformer disperso de tipo Mixture-of-Experts con 48 capas y 512 expertos enrutados por capa.

El propósito de esta publicación es permitir ejecutar un modelo de gran tamaño en una única GPU de consumo (RTX 3090, 24 GB de VRAM) mediante cuantización agresiva a 3 bits y descarga de expertos a RAM del host. La build se distribuye como vista previa: lanzador para Windows, una petición concurrente por defecto (dos carriles opcionales), y requiere aproximadamente 42 GiB de RAM disponible y 57 GB de disco para el modelo, más un volumen n-gram de 29 GB descargado aparte.

Es relevante para desarrolladores e investigadores que quieran evaluar modelos MoE de frontera en hardware de consumo, pero conviene subrayar que no es un artefacto portable: exige los ejecutables del fork NInfer y no funciona con Transformers, llama.cpp, vLLM ni Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 512 expertos enrutados por capa), con MTP drafter y torre de visión |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han probado prompts de hasta 30K tokens) |
| Tipos de cuantizacion | UD-IQ3_XXS (media de 3,01 bits por peso en expertos enrutados); componentes internos en IQ2_S, IQ3_XXS, IQ4_XS, Q2_0, IQ4_NL, Q6_K, Q8_0, BF16 y F32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.ninfer` (contenedor propietario derivado de GGUF de Unsloth) |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts con 48 capas y 512 expertos enrutados por capa, según detalla la model card. La build incorpora además un componente MTP (multi-token prediction) drafter tomado de `mtp-q2_0.gguf` de Strata, y una torre de visión procedente de `mmproj-BF16.gguf` de Unsloth, aunque en esta build la torre no puede cargarse. La model card menciona proyecciones GDN y mecanismos de hyper-connection, lo que sugiere una arquitectura híbrida con atención lineal, pero no se aportan detalles adicionales sobre el entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

La conversión a `.ninfer` preserva los bloques GGML byte a byte para los tensores de texto, agrupando los 512 expertos de cada capa en un banco `ggml_expert_record_v1` para que cada experto se mueva entre RAM del host y GPU como un único rango de bytes. La única pérdida de precisión documentada afecta a 196 tensores (642.735.924 valores) que se redondean una sola vez a BF16 con error relativo máximo de 2^-8. Un verificador independiente (`tests/convert/qwen4_exp_verify.py`) confirmó que los 1.356 objetos tensoriales y las 320.001.536 filas del volumen n-gram coinciden con los GGUF de origen.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento y generación de código propias del modelo base Qwen3.8-Flash-Next (no verificadas en esta build).
- Decodificación especulativa mediante el MTP drafter incluido, que acelera la generación.
- Soporte de prompts largos: se han medido rendimientos con prompts de 1K, 8K y 30K tokens.
- Capacidad de visión presente en el archivo (torre `mmproj-BF16`), pero no cargable en esta build.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de modelos MoE de gran tamaño en una RTX 3090: permite probar un modelo con 512 expertos por capa en hardware de consumo gracias a la cuantización a 3 bits y la descarga de expertos a RAM, sin necesidad de GPUs de datacenter.
- Experimentación con decodificación especulativa: el MTP drafter incluido permite medir el impacto del speculative decoding en throughput real (61-64 tok/s con MTP frente a 46-56 tok/s sin él en esta build).
- Procesamiento de documentos largos en local: con prompts de hasta 30K tokens y prefill de ~900 tok/s, es viable resumir o extraer información de documentos extensos en una sola máquina.
- Comparación de cuantizaciones: la existencia de una build hermana IQ2_XS del mismo modelo permite contrastar calidad (perplejidad 5,859 frente a 6,315) y velocidad (aproximadamente la mitad en esta build) para elegir el equilibrio adecuado.
- Prototipado de asistentes conversacionales offline: con una petición concurrente por defecto (dos carriles opcionales), sirve para demos y pruebas de concepto en entornos sin conectividad.
- Investigación sobre conversión de formatos: el informe de conversión y el verificador independiente publicados sirven como referencia para estudiar la fidelidad de reescrituras GGUF a contenedores propietarios.

## Benchmarks y rendimiento

La model card proporciona métricas de rendimiento medidas en una RTX 3090, comparando esta build con la IQ2_XS del mismo modelo:

| Métrica | IQ2_XS | UD-IQ3_XXS (esta build) |
|---|---|---|
| Perplejidad (5.114 posiciones fijas, menor es mejor) | 6,315 | 5,859 (7,2% menor) |
| Decode con MTP, prompt 1K / 8K / 30K (tok/s) | 115 / 111 / 106 | 61 / 62 / 64 |
| Decode sin MTP, prompt 1K / 8K / 30K (tok/s) | 84 / 86 / 83 | 46 / 55 / 56 |
| Prefill, prompt 8K / 30K (tok/s) | 2.225 / 2.293 | 894 / 905 |
| RAM para arrancar | ~40 GiB disponibles | ~42 GiB disponibles |
| Disco | 41 GB modelo + 29 GB volumen | 57 GB modelo + 29 GB volumen |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: diseñado para una RTX 3090 (24 GB); los expertos se descargan a RAM del host, por lo que la VRAM no contiene el modelo completo.
- RAM: aproximadamente 42 GiB disponibles para arrancar (frente a ~40 GiB de la build IQ2_XS).
- Disco: 57 GB para el modelo (dos archivos: 32.000.000.000 y 25.087.457.792 bytes) más un volumen n-gram de 29 GB compartido con la build IQ2_XS.
- GPU recomendadas: RTX 3090 (plataforma objetivo del fork). No se documenta soporte para A100, H100 ni otras GPU.
- Cabe en GPU de consumo: sí, en RTX 3090; no se indica compatibilidad con otras consumer GPU.
- Despliegue: exclusivamente mediante los ejecutables del fork ashalliants/ninfer-3090 (lanzador para Windows). No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: 61-64 tok/s en decode con MTP y 894-905 tok/s en prefill con prompts de 8K-30K, medidos en RTX 3090.
- Concurrencia: una petición a la vez por defecto; dos carriles de forma opcional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next UD-IQ3_XXS (esta build) | MoE 48 capas, 512 expertos (totales no disponibles) | no disponible | `.ninfer` | qwen-community-1.0 | RTX 3090, ~42 GiB RAM |
| Qwen3.8-Flash-Next IQ2_XS (build hermana de WarlaxZ) | MoE 48 capas, 512 expertos | no disponible | `.ninfer` | qwen-community-1.0 | RTX 3090, ~40 GiB RAM |
| Qwen/Qwen3.8-Flash-Next (modelo base) | MoE 48 capas, 512 expertos | no disponible | no disponible | qwen-community-1.0 | GPUs de datacenter |
| Qwen3.8-Flash-Next GGUF de Unsloth | MoE 48 capas, 512 expertos | no disponible | GGUF | qwen-community-1.0 | según cuantización |

No se dispone de datos de benchmarks estándar para comparar el rendimiento en tareas con modelos de otras familias.

## Limitaciones y advertencias

- Es una vista previa: lanzador solo para Windows, una petición concurrente por defecto y sin garantías de estabilidad en producción.
- No es portable: requiere los ejecutables del fork NInfer para RTX 3090; no funciona con Transformers, llama.cpp, vLLM, Ollama ni TGI.
- La torre de visión está presente en el archivo pero no puede cargarse en esta build, por lo que no hay capacidades multimodales.
- El volumen n-gram de 29 GB no está incluido en el repositorio; el servidor rechaza cualquier volumen distinto al de la build IQ2_XS (id `1604acb23af5cb05f001e2ce3a8c0f12`).
- La cuantización a 3 bits y el redondeo de 196 tensores a BF16 introducen pérdida de precisión; la perplejidad es un 7,2% mejor que la build IQ2_XS, pero no se compara con el modelo en precisión completa.
- Licencia `qwen-community-1.0`: es necesario revisar sus términos antes de cualquier uso comercial; la model card no detalla restricciones adicionales.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe concreto.
- Solo 68 descargas y 1 like en el momento de la consulta: comunidad muy reducida, con soporte limitado fuera del repositorio del fork.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WarlaxZ/Qwen3.8-Flash-Next-UD-IQ3_XXS-NInfer-3090
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Build hermana IQ2_XS: https://huggingface.co/WarlaxZ/Qwen3.8-Flash-Next-NInfer-3090
- Motor NInfer para RTX 3090: https://github.com/ashalliants/ninfer-3090
- Verificador de conversión: `tests/convert/qwen4_exp_verify.py` dentro del repositorio del motor
