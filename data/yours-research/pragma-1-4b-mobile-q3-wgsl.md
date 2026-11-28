# yours-research/Pragma-1-4B-Mobile-Q3-WGSL

## Resumen

Pragma-1-4B-Mobile-Q3-WGSL es una cuantización de 3 bits orientada a WebGPU del modelo Pragma-1-4B, desarrollada por Yours Research. Su objetivo es ejecutar los 3.780 millones de parámetros del modelo base íntegramente dentro de navegadores móviles (iOS y Android) mediante WebGPU, respetando los límites de memoria impuestos por entornos como WKWebView, Safari o Chrome en dispositivos móviles. El artefacto publicado pesa 1,48 GiB y ocupa 1.583,2 MiB de memoria GPU en ejecución.

El modelo base emplea una arquitectura híbrida de 32 capas que combina Gated DeltaNet con atención GQA (Grouped Query Attention), junto con un vocabulario compactado de 81.920 tokens. La cuantización utiliza un formato propietario denominado Q3_B128 (3,25 bits por peso, con superbloques de 128 elementos) para las capas del transformer y Q4_b32 para la tabla de embeddings atados. Los pesos se fragmentan en bloques de almacenamiento WebGPU de 128 MiB o menos para permitir una carga progresiva sin picos de memoria transitorios.

La relevancia de esta ficha radica en que representa un caso concreto de inferencia local en navegador móvil con un modelo de casi 4.000 millones de parámetros, un escenario tradicionalmente limitado por la memoria disponible en los GPUs integrados de los smartphones. El modelo está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 32 capas Gated DeltaNet + GQA |
| Parametros totales | 3,78 mil millones (3.780.000.000) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q3_B128 (3,25 bits/peso, superbloques de 128) en capas transformer; Q4_b32 en embeddings atados |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Shards binarios propios (`.bin`) con `manifest.json` versión 2 (`q3_b128_q4_embed`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Pragma-1-4B emplea una arquitectura híbrida de 32 capas que alterna bloques Gated DeltaNet con atención GQA. Esta combinación busca reducir el coste de atención en secuencias largas manteniendo la capacidad de modelado de un transformer convencional. El vocabulario está compactado a 81.920 tokens, lo que reduce el tamaño de la tabla de embeddings y, por extensión, el peso total del modelo en dispositivos con memoria limitada.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificación como decodificación especulativa en esta variante móvil; la model card menciona una "speculative draft head" únicamente para la variante de escritorio Q4. La aportación técnica principal de esta release es el esquema de cuantización Q3_B128 con superbloques de 128 elementos, los embeddings atados en Q4_b32 y la fragmentación en shards de 128 MiB con hashes SHA-256 por fichero y por bloques de 16 MiB para descargas reanudables vía HTTP Range hacia OPFS.

## Capacidades

- Generación de texto en inglés sobre el modelo base Pragma-1-4B.
- Razonamiento y conversación multi-turno, con plantilla de chat incluida (`chat_template.jinja`).
- Soporte de tool calling y function calling, según la configuración de chat y herramientas incluida en el repositorio.
- Inferencia local en navegador mediante WebGPU, con shaders compatibles con `shader-f16` y sin requisito de `subgroups`.
- Carga progresiva y reanudable de pesos mediante OPFS y `FileSystemSyncAccessHandle`.
- Gestión de estado DeltaNet (50,3 MiB) y caché KV compacta en Int8 (17,3 MiB) durante la inferencia.
- Capacidades multilingües: solo inglés declarado.
- No se documentan capacidades de visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistentes conversacionales dentro de una web móvil: el modelo se descarga en streaming a OPFS y se ejecuta en WebGPU sin backend servidor, lo que permite ofrecer un chat privado en el propio dispositivo con un modelo de 3,78B parámetros.
- Aplicaciones web progresivas (PWA) con IA embebida: al ocupar 1,48 GiB de descarga y 1.583,2 MiB de memoria GPU, encaja en el presupuesto de memoria de WKWebView y Safari en iOS, lo que facilita distribuir una PWA con inferencia local sin publicar en tiendas de aplicaciones.
- Procesamiento de texto sensible sin salida de datos: al ejecutarse íntegramente en el cliente, resulta adecuado para borradores, resúmenes o clasificación de texto que no deben enviarse a un servidor.
- Prototipado de agentes con tool calling en navegador: la plantilla de chat y la configuración de herramientas permiten construir demos de agentes que invocan APIs del propio navegador o del dispositivo.
- Demos y evaluación de modelos en ferias o entornos sin conectividad estable: la descarga reanudable por rangos HTTP y los hashes por bloques de 16 MiB permiten reanudar la carga tras cortes de red.
- Investigación sobre cuantización extrema en GPUs móviles: el formato Q3_B128 y el particionado en slabs de 128 MiB sirven como referencia reproducible para estudiar el equilibrio entre calidad y huella de memoria en hardware Apple y Android.
- Formación y documentación técnica: el manifest con checksums SHA-256 permite verificar la integridad de los pesos en entornos docentes o de auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Descarga total de pesos: 1,48 GiB (1.584.861.312 bytes), incluidos 5,8 MB de tokenizer y configuración.
- Huella de memoria GPU en ejecución: 1.583,2 MiB (1.511,4 MiB de pesos + 50,3 MiB de estado DeltaNet + 17,3 MiB de caché KV Int8).
- GPU recomendadas: GPUs integradas de smartphones Apple (compatibles con `shader-f16`, sin `subgroups`) y GPUs móviles de Android con soporte WebGPU; no se especifican modelos concretos de A100, H100 o RTX 4090 porque el destino es móvil.
- Compatibilidad con GPU de consumo: el objetivo declarado son GPUs móviles dentro de navegador; no se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Opciones de despliegue: navegador con WebGPU (Safari, WKWebView, Chrome) y almacenamiento OPFS; demo en `pragma-demo-production.up.railway.app` con detección automática de móvil.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Destino |
|---|---|---|---|---|---|
| Pragma-1-4B-Mobile-Q3-WGSL | 3,78B | No disponible | Q3_B128 + Q4_b32 | Apache 2.0 | WebGPU móvil |
| Pragma-1-4B-WGSL (mismo autor) | 3,78B | No disponible | Q4 (2,37 GB) | Apache 2.0 | WebGPU escritorio |
| Pragma-1-4B (base) | 3,78B | No disponible | bfloat16 | Apache 2.0 | PyTorch |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta variante con alternativas de otros autores.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- La longitud de contexto no está documentada en la información disponible.
- Al ser una cuantización de 3 bits (3,25 bits por peso), es esperable una degradación de calidad frente al modelo base en bfloat16; no se publican métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineamiento.
- El formato de pesos es propietario (shards `.bin` + `manifest.json`), no safetensors ni GGUF, lo que limita su uso fuera del runtime WebGPU de Yours Research.
- Requiere navegador con WebGPU y soporte de `shader-f16`; la compatibilidad con Android depende del dispositivo y de la versión del navegador.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre el comportamiento del modelo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yours-research/Pragma-1-4B-Mobile-Q3-WGSL
- Modelo base: https://huggingface.co/yours-research/Pragma-1-4B
- Cuantización WebGPU Q4 para escritorio: https://huggingface.co/yours-research/Pragma-1-4B-WGSL
- Demo en navegador: https://pragma-demo-production.up.railway.app
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
