# vmarcelo/Sabi-Noema-MTP-IQ3_S-GSQ-RCO-GGUF

## Resumen
Sabi-Noema-MTP-IQ3_S-GSQ-RCO-GGUF es una cuantización GGUF en formato IQ3_S del modelo `sabicap/sabi-noema`, un fine-tune con RL sobre Qwen3.8-27B, a la que se ha fusionado a nivel de checkpoint de Hugging Face la cabeza MTP (multi-token prediction) reentrenada de `xkm/qwen3.8-27b-mtp-head-retrained`. El resultado es un único fichero GGUF que permite decodificación especulativa nativa (`--spec-type draft-mtp`) sin necesidad de un drafter externo en formato sidecar. Lo publica el usuario vmarcelo bajo licencia Apache-2.0.

El modelo resuelve el problema de acelerar la inferencia de un tronco de 27B en hardware de consumo sin sacrificar la corrección: la decodificación especulativa es lossless, ya que cada token emitido se verifica contra el modelo completo. La inclusión de la cabeza MTP dentro del propio GGUF simplifica el despliegue en llama.cpp y evita gestionar un segundo fichero de drafter.

Es relevante ahora porque combina tres piezas habitualmente separadas: un tronco con atención híbrida (GDN, según los tags), una cuantización guiada por importance matrix con asignación por tensor de ISTA, y una cabeza MTP reentrenada. El modelo declara 463.717.376 parámetros en safetensors, un dato que no concuerda con el tamaño del fichero (11,29 GiB) ni con la base Qwen3.8-27B, por lo que debe tratarse con cautela. El repo ocupa 12,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (GDN según tags), tronco Qwen3.8-27B más cabeza MTP de 1 capa (`blk.64.*`, `nextn_predict_layers 1`) |
| Parametros totales | 463.717.376 según safetensors (dato inconsistente con el tamaño del fichero y la base de 27B; no disponible con fiabilidad) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de despliegue del autor) |
| Tipos de cuantizacion | IQ3_S para el tronco; Q6_K para los ocho pesos de `blk.64`; F32 para las normas; KV cache q4_0 en los ejemplos |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (866 tensores, 65 bloques); incluye `mmproj-Qwen3.8-27B-Q5_K-MIX.gguf` para visión |

## Arquitectura y entrenamiento
El tronco es un transformer basado en Qwen3.8-27B con atención híbrida (el tag `hybrid-attention` y la nota sobre estado recurrente por slot en el tronco GDN apuntan a capas de atención lineal combinadas con atención estándar). Sobre él, `sabicap/sabi-noema` aplica un fine-tune con RL. La cabeza MTP es una capa adicional de predicción multi-token (`mtp_num_hidden_layers = 1`) que se fusiona parcheando el campo de configuración y escribiendo los 15 tensores de `xkm` con prefijo `mtp.*` en un nuevo shard `model-mtp.safetensors`, verificando formas y dtypes contra el checkpoint base.

La construcción es reproducible mediante `fuse_mtp_head.py`, seguida de conversión a GGUF en bf16 con `convert_hf_to_gguf.py` (sin `--no-mtp`, de modo que la configuración anuncia la cabeza) y cuantización con `llama-quantize` usando la importance matrix `imatrix-qwen3.8-27b.gguf` y el mapa de asignación por tensor de ISTA (`ista-recipe_types.txt`, 554 entradas aplicadas exactamente). El mapa reserva los ocho pesos de `blk.64` en Q6_K y sus normas en F32; la cabeza cuesta unos 0,42 GiB (~3,6 % del fichero). Herramientas: llama.cpp `b12024` (`ddf48f85c`). No se detalla la composición del dataset de entrenamiento ni el número de tokens.

## Capacidades
- Generación de texto y razonamiento, heredados del tronco Qwen3.8-27B con fine-tune RL de sabi-noema.
- Decodificación especulativa nativa mediante la cabeza MTP integrada, activable con `--spec-type draft-mtp` y `--spec-draft-n-max`.
- Compatibilidad con drafter externo DFlash 2 (`--spec-type draft-dflash`) como alternativa de mayor velocidad.
- Visión, mediante el proyector multimodal `mmproj-Qwen3.8-27B-Q5_K-MIX.gguf` (332 MB, ejecutado en CPU con `--no-mmproj-offload`).
- Plantilla de chat Jinja (`--jinja`) y control de esfuerzo de razonamiento vía `chat_template_kwargs` (`reasoning_effort`, con `xhigh` como valor por defecto de la plantilla).
- Multilingüe limitado: la model card declara únicamente inglés.
- No se documentan tool calling ni capacidades de agente en la información disponible.

## Casos de uso
- Despliegue local en GPU de consumo: el fichero de 11,29 GiB con KV cache q4_0 cabe en 16 GB de VRAM (pico medido de 12,4 GiB con MTP nativo a 32K), lo que permite servir un tronco de 27B en tarjetas como la RX 9070 XT.
- Aceleración de inferencia interactiva: con MTP nativo a profundidad 2 se obtienen 57,76 tok/s frente a 38,95 tok/s sin especulación (1,48×) en la misma tarjeta, adecuado para chat en tiempo real.
- Máximo throughput en pipelines de generación por lotes pequeños: usando el drafter externo DFlash 2 Q4_K_M a profundidad 4 se alcanzan 67,09 tok/s (1,72×), útil para tareas de resumen o extracción donde la latencia no es crítica pero el coste por token sí.
- Evaluación de decodificación especulativa: el repo incluye `report.html` con el protocolo A/B, aceptación por categoría y métricas de VRAM, lo que lo hace útil como banco de pruebas reproducible para comparar cabezas MTP y drafters externos.
- Procesamiento de documentos con imagen: el proyector mmproj permite pasar imágenes junto al texto en llama-server, con el coste de mantener el proyector en CPU.
- Reproducción de recetas de cuantización: el mapa de 554 entradas y el script de fusión permiten replicar la build o adaptarla a otras cuantizaciones (el autor publica también una variante sin MTP de 10,96 GiB).

## Benchmarks y rendimiento
Mediciones del autor en una RX 9070 XT (16 GB), 24 prompts × 256 tokens, contexto de 32K:

| Configuración | Longitud de aceptación | tok/s | Aceleración | VRAM pico |
|---|---:|---:|---:|---:|
| Sin especulación | 1,00 | 38,95 | — | 11,6 GiB |
| MTP nativo, n=2 | 1,99 | 57,76 | 1,48× | 12,4 GiB |
| MTP nativo, n=4 | 2,25 | 49,80 | 1,28× | 12,4 GiB |
| DFlash 2 Q4_K_M, n=4 | 2,87 | 67,09 | 1,72× | 13,5 GiB |

En modo greedy con el mismo arnés, el Qwen3.8-27B base con su cabeza original alcanza 2,96 tokens por verificación, mientras que este tronco con la cabeza de xkm llega a 2,39: el fine-tune RL desplaza el tronco respecto a la distribución de entrenamiento de la cabeza. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: 11,6 GiB sin especulación; 12,4 GiB con MTP nativo; 13,5 GiB con DFlash 2 Q4_K_M, todos a 32K de contexto con KV cache q4_0.
- Cabe en GPU de consumo de 16 GB (medido en RX 9070 XT). En tarjetas de 12 GB el margen es insuficiente con contexto de 32K; sería necesario reducir contexto o usar KV cache más agresiva.
- GPU profesionales (A100, H100) no están documentadas en la información disponible; el autor solo reporta la RX 9070 XT.
- Despliegue mediante llama.cpp `b12024` (`llama-server`), con `-ngl 999`, `-fa on` obligatorio al usar KV cache cuantizada y `-np 1` por el estado recurrente por slot del tronco GDN.
- El proyector de visión se ejecuta en CPU con `--no-mmproj-offload`.
- Throughput medido: 38,95 tok/s sin especulación y hasta 67,09 tok/s con DFlash 2 en la configuración indicada. No hay datos de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sabi-Noema-MTP-IQ3_S (este) | 463.717.376 declarados (inconsistente) | 32K en ejemplos | Apache-2.0 | GGUF IQ3_S | MTP integrado, métricas en RX 9070 XT |
| vmarcelo/Sabi-Noema-IQ3_S-GSQ-RCO-GGUF | mismo tronco | 32K en ejemplos | Apache-2.0 | GGUF IQ3_S (10,96 GiB) | Sin cabeza MTP; requiere drafter externo para especulación |
| Qwen3.8-27B base | 27B (según denominación) | no disponible | Apache-2.0 | safetensors y derivados | Cabeza MTP original; 2,96 tokens/verificación en el arnés del autor |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento frente a alternativas; la comparación se limita a formato, licencia y métricas de decodificación del autor.

## Limitaciones y advertencias
- El dato de parámetros totales de safetensors (463.717.376) es incoherente con un fichero de 11,29 GiB y con la base Qwen3.8-27B; no debe usarse para estimar requisitos de memoria.
- El rendimiento de aceptación de la cabeza MTP es inferior al del Qwen3.8-27B original (2,39 frente a 2,96 tokens/verificación) por el desplazamiento de distribución causado por el fine-tune RL.
- La model card advierte explícitamente de que no deben esperarse las puntuaciones de benchmark de ISTA: solo se toma su asignación por tensor, no sus pesos optimizados con GSQ.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está documentado.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad del fine-tune RL.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-10), por lo que carece de validación comunitaria.
- La sintaxis de especulación es estricta: `--spec-type mtp` no es válido; debe usarse `draft-mtp`.
- Con KV cache cuantizada es obligatorio `-fa on`; con `-np` mayor que 1 el estado recurrente del tronco GDN puede comportarse de forma no esperada.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones de los modelos base (sabi-noema y la cabeza de xkm) deben verificarse por separado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/vmarcelo/Sabi-Noema-MTP-IQ3_S-GSQ-RCO-GGUF
- Variante sin MTP: https://huggingface.co/vmarcelo/Sabi-Noema-IQ3_S-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/sabicap/sabi-noema
- Cabeza MTP reentrenada: https://huggingface.co/xkm/qwen3.8-27b-mtp-head-retrained
- Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
