# valereseach/vela-sd-turbo-int-v2

## Resumen

Vela PoI v2 es un fichero de modelo para generación de texto a imagen publicado por el usuario `valereseach` dentro del ecosistema Vela Core, una blockchain de prueba de inferencia (Proof-of-Inference) desarrollada por Vela Research. No es un modelo entrenado desde cero: es una reimplementación determinista y cuantizada de `stabilityai/sd-turbo` como programa entero bit-exacto, con pesos int8 por canal de salida, activaciones de 16 bits con potencias de dos dinámicas, GroupNorm y LayerNorm enteros y tablas de búsqueda para SiLU, GELU, softmax y ruido gaussiano. El objetivo es que cada nodo de la red (implementaciones en C++ con AVX2 y mineros CUDA) produzca salidas idénticas byte a byte, de modo que el hash del modelo y el de la inferencia puedan verificarse de forma determinista.

El modelo conserva la arquitectura de sd-turbo: un text encoder CLIP ViT-H, un U-Net y un VAE, con una única etapa Euler en t = 999 y resolución de 512×512. El fichero distribuido (`sd-turbo-int.poisd`, 1,19 GB) contiene los pesos int8, las escalas, las tablas y el tokenizador CLIP, pero no el VAE: la salida es un latente x0 de 4×64×64 en int16 (formato Q8, 32768 bytes) que debe decodificarse con el VAE de sd-turbo. La calidad declarada es de 30,5 dB de PSNR medio frente a sd-turbo en coma flotante con el mismo ruido de entrada.

Su relevancia es acotada pero específica: cubre el nicho de inferencia de imágenes verificable y determinista para redes descentralizadas, donde la reproducibilidad exacta importa más que la fidelidad estética. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y el fichero solo es útil dentro del stack de Vela Core o para quien quiera reproducir el proceso de exportación descrito en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (U-Net + text encoder CLIP ViT-H, VAE separado); 1 paso Euler en t = 999, 512x512 |
| Parametros totales | No disponible en la model card. El modelo base sd-turbo se documenta publicamente en torno a 1,07 mil millones (U-Net ~860 M, VAE ~84 M, CLIP ViT-H ~123 M), pero el fichero .poisd solo incluye text encoder y U-Net en int8 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (limite estandar del text encoder CLIP ViT-H/14 de sd-turbo) |
| Tipos de cuantizacion | Entero: pesos int8 por canal de salida, activaciones de 16 bits con potencias de dos dinamicas (esquema W8A16) |
| Idiomas soportados | No especificados en la ficha; el text encoder CLIP ViT-H esta entrenado predominantemente con texto en ingles |
| Licencia | Stability AI Community License (`stabilityai-ai-community`, etiquetada como `other` en HuggingFace) |
| Formato de pesos | `.poisd` (formato propietario de Vela, 1,19 GB); no se publican safetensors ni GGUF |
| Pipeline | text-to-image |
| Tamano del repositorio | 1,2 GB |
| Resolucion de salida | 512 x 512 |
| Formato de salida | Latente x0 4x64x64 int16 (Q8), 32768 bytes, decodificable con el VAE de sd-turbo |
| Pasos de inferencia | 1 (Euler, t = 999) |
| Calidad declarada | 30,5 dB de PSNR medio frente a sd-turbo en coma flotante (imagenes decodificadas, mismo ruido) |
| SHA-256 del fichero | `ba38ab96b3398e22ea631d8a457350f91833e57463199d063663308513651f36` |
| Hash de modelo Vela | `a7fd64b04c8bf36c1b74a629e32f093ce10e364787292f53fa1337557eb9776a` |
| Fecha de creacion | 2026-10-04 |

## Arquitectura y entrenamiento

No hay entrenamiento: el fichero es una transformación determinista de los pesos públicos fp16 de `stabilityai/sd-turbo`. La model card lo describe explícitamente como un "programa entero bit-exacto", generado mediante el exportador `contrib/poi-sd/sdint.py` del repositorio de Vela, que actúa además como especificación ejecutable. El proceso parte de los ficheros `*.fp16.safetensors` del modelo base junto con `model_index.json`, el scheduler, el tokenizador y los `config.json`, y produce el `.poisd` de forma reproducible.

Las decisiones técnicas clave son tres. Primera, la cuantización: pesos int8 con escala por canal de salida y activaciones de 16 bits restringidas a potencias de dos dinámicas, lo que evita multiplicaciones en coma flotante y permite implementaciones enteras rápidas. Segunda, la eliminación de toda no linealidad en coma flotante: GroupNorm y LayerNorm se reescriben en aritmética entera, y SiLU, GELU, softmax y la generación de ruido gaussiano se resuelven mediante tablas de búsqueda precalculadas. Tercera, el determinismo estricto: los nodos en C++ con AVX2 y el minero CUDA deben producir salidas idénticas byte a byte, y los nodos rechazan cualquier fichero cuyo hash de modelo no coincida con el esperado. El ruido se fija de forma externa, de ahí que la comparación de PSNR se haga "con el mismo ruido".

No se documentan datos de entrenamiento, composición del dataset, número de tokens ni fases de RLHF o DPO, porque no existen para este artefacto: hereda íntegramente el comportamiento del modelo base sd-turbo, que a su vez es un destilado de SD 2.1 con destilación de paso único. Tampoco se documenta el uso de decodificación especulativa, atención lineal ni otras optimizaciones de inferencia más allá del propio esquema entero.

## Capacidades

- Generación de imágenes a partir de texto en 512×512 con un único paso de difusión (Euler, t = 999).
- Inferencia determinista y verificable: la misma entrada y el mismo ruido producen exactamente la misma salida en nodos CPU (C++/AVX2) y en mineros CUDA.
- Exportación reproducible: cualquier tercero puede regenerar el fichero `.poisd` a partir de los pesos fp16 públicos de sd-turbo con el script del repositorio.
- Validación y minería en la red Proof-of-Inference de Vela Core mediante `velad -testnet4 -poimodel=sd-turbo-int.poisd`.
- Generación de latentes en formato Q8 (4×64×64 int16) desacoplada del VAE, lo que permite usar el decoder de sd-turbo por separado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking": es un modelo de difusión de texto a imagen, no un modelo de lenguaje.
- Capacidad multilingüe limitada por el text encoder CLIP ViT-H, orientado a inglés; la model card no declara idiomas soportados.

## Casos de uso

- Minería y validación en Vela Core: un operador descarga el `.poisd`, verifica el SHA-256 con `SHA256SUMS` y arranca `velad` para validar o minar tras la altura v2. El modelo es adecuado porque su hash está fijado y los nodos rechazan ficheros alterados.
- Auditoría de inferencia en redes descentralizadas: al ser bit-exacto entre CPU y CUDA, permite que un verificador reproduzca el trabajo de un minero y compruebe la coincidencia exacta de la salida, algo imposible con kernels en coma flotante no deterministas.
- Generación de imágenes de 512×512 con latencia mínima: al requerir un solo paso Euler, encaja en servicios donde el coste por imagen debe ser muy bajo y la fidelidad de 30,5 dB de PSNR frente a sd-turbo es aceptable.
- Despliegue en CPU sin GPU: la implementación de referencia con AVX2 permite ejecutar el modelo en servidores sin acelerador, útil para nodos domésticos o entornos con restricciones de hardware.
- Reproducibilidad en investigación: el script `sdint.py` funciona como especificación ejecutable, de modo que un grupo puede reconstruir el fichero y comparar su hash con el publicado para estudiar cuantización entera determinista.
- Generación de assets en lote con presupuesto de memoria ajustado: el fichero de 1,19 GB en int8 permite mantener varias instancias en memoria de GPU frente a las alternativas fp16, útil para pipelines de miniaturas o placeholders.
- Pruebas de integración de la propia blockchain: `contrib/poi-sd/sd_miner.py` se conecta por RPC y permite validar el flujo completo de minado antes de desplegar hardware en producción.
- Comparación de esquemas de cuantización: sirve como referencia de hasta dónde llega W8A16 con tablas de búsqueda frente a fp16 en un modelo de difusión concreto, midiendo la degradación con PSNR.

## Benchmarks y rendimiento

| Metrica | Vela PoI v2 (sd-turbo-int) | Referencia |
|---|---|---|
| PSNR medio (imagenes decodificadas, mismo ruido) | 30,5 dB | `stabilityai/sd-turbo` en coma flotante |
| FID | No disponible | No disponible |
| CLIP score | No disponible | No disponible |
| Latencia | No disponible | No disponible |
| Throughput | No disponible | No disponible |

La model card no publica resultados de MMLU, HumanEval, GSM8K ni ningun otro benchmark de lenguaje, dado que no es un modelo de lenguaje. El unico dato cuantitativo publicado es el PSNR de 30,5 dB frente a sd-turbo en coma flotante.

## Requisitos de hardware

- VRAM estimada: el autor no publica requisitos. Como estimacion propia a partir del tamano del fichero (1,19 GB en int8) y de activaciones de 16 bits a 512×512, el consumo en inferencia se situaria aproximadamente entre 1,5 y 3 GB, dependiendo del backend y del tamano de lote. Es una estimacion, no un dato de la model card.
- GPU recomendadas: no especificadas. La model card menciona un "CUDA miner" como implementacion de referencia junto a los nodos C++ con AVX2, sin detallar modelos concretos.
- GPU de consumo: por el perfil de memoria estimado, el modelo deberia caber en GPUs de consumo con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070), aunque no hay confirmacion oficial.
- CPU: existe una implementacion de nodo en C++ con AVX2 que funciona sin GPU, lo que permite ejecutarlo en servidores x86 convencionales.
- Opciones de despliegue: el fichero `.poisd` solo es consumible por el stack de Vela Core (`velad`, `contrib/poi-sd/sd_miner.py`). No hay soporte para vLLM, llama.cpp, Ollama, TGI ni Diffusers, ya que el formato es propietario y el VAE se aplica por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Resolucion | Contexto de texto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|---|
| Vela PoI v2 (este modelo) | No disponible (base sd-turbo, ~1,07 B) | 1 (Euler, t = 999) | 512x512 | 77 tokens CLIP | Stability AI Community License, uso comercial con registro y facturacion < 1 M USD | `.poisd` propietario, 1,19 GB, 0 descargas |
| `stabilityai/sd-turbo` (fp16) | ~1,07 B (U-Net + VAE + CLIP ViT-H) | 1 a 4 | 512x512 | 77 tokens CLIP | Stability AI Community License | safetensors fp16, ampliamente descargado |
| `stabilityai/sdxl-turbo` | ~3,5 B | 1 a 4 | 512x512 | 77 tokens CLIP | Stability AI Non-Commercial Research Community License (uso comercial restringido) | safetensors fp16 |
| Otras cuantizaciones deterministas PoI | No disponible | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la informacion disponible |

La comparativa directa con alternativas de cuantizacion general (por ejemplo, versiones int8 exportadas con Optimum o TensorRT) no es posible con los datos disponibles, porque ninguna de ellas garantiza bit-exactitud entre CPU y GPU ni publica un hash de modelo verificable por los nodos de una red.

## Limitaciones y advertencias

- El fichero solo es util dentro del stack de Vela Core: no se puede cargar con Diffusers, ComfyUI ni ninguna herramienta estandar de difusion, ya que el formato `.poisd` es propietario y requiere el VAE de sd-turbo para decodificar el latente.
- Los nodos rechazan cualquier fichero cuyo hash de modelo no coincida con `a7fd64b04c8bf36c1b74a629e32f093ce10e364787292f53fa1337557eb9776a`, por lo que cualquier modificacion o reexportacion invalida el modelo para la red.
- Degradacion de calidad cuantificada: 30,5 dB de PSNR medio frente a sd-turbo en coma flotante, con el mismo ruido de entrada. No se publican FID ni CLIP score, por lo que no se puede evaluar la degradacion perceptiva.
- Un unico paso de difusion (Euler en t = 999) y ausencia de classifier-free guidance: no permite ajustar la adherencia al prompt ni usar negative prompts.
- Resolucion fija de 512×512; no hay soporte documentado para otras resoluciones ni para img2img, inpainting o ControlNet.
- Sesgos conocidos: no se documentan. Al heredar los pesos de sd-turbo, arrastra los sesgos del dataset de entrenamiento del modelo base (LAION y similares), no analizados en esta model card.
- Riesgo de alucinacion visual y de desalineacion con el prompt, inherente a los modelos de difusion y agravado por la cuantizacion int8; el autor no publica evaluaciones de fidelidad semantica.
- Limitacion idiomatica: el text encoder CLIP ViT-H esta orientado principalmente al ingles; no se declaran idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.
- Licencia: Stability AI Community License. El uso comercial exige registro con Stability AI y esta limitado a entidades con ingresos anuales inferiores a 1 millon de dolares estadounidenses. Es imprescindible revisar `LICENSE.md` antes de cualquier uso en produccion.
- Adopcion nula verificable: 0 descargas y 0 "likes", sin validacion independiente de la comunidad ni informes de terceros sobre el comportamiento real del fichero.
- Fechas incoherentes en los metadatos de HuggingFace (creacion y actualizacion en octubre de 2026), lo que sugiere que los datos temporales del repositorio no son fiables.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre Vela Research: los unicos resultados obtenidos fueron letras de canciones sin relacion alguna con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/valereseach/vela-sd-turbo-int-v2
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Sitio de Vela Research: https://velaresearch.ai
- Repositorio fuente de Vela Core: https://git.velaresearch.ai/velaresearch/vela
- Licencia (LICENSE.md dentro del repositorio del modelo): https://huggingface.co/valereseach/vela-sd-turbo-int-v2/blob/main/LICENSE.md
- Script de exportacion determinista: `contrib/poi-sd/sdint.py` dentro del repositorio de Vela
- Script de minado: `contrib/poi-sd/sd_miner.py` dentro del repositorio de Vela
- Paper o informe tecnico: no disponible
- Demo: no disponible
