# WaveCut/Edge0-120B-NVFP4-NInfer-v3

## Resumen
Edge0-120B-NVFP4-NInfer-v3 es un artefacto de inferencia publicado por WaveCut que empaqueta el modelo Edge0-120B-NVFP4 de Edge0 en el formato contenedor `.ninfer` del motor NInfer, en su version v3. No se trata de un modelo entrenado desde cero, sino de una conversion del release original orientada a su despliegue con el motor NInfer-all, la rama `master` del repositorio `iamwavecut/ninfer-all`. El modelo conserva el esqueleto de Qwen3.8-Flash-Next (Gated DeltaNet, atencion dispersa, hyper-connections, embedding de n-gramas, router, experto compartido y bloque MTP) y sustituye los 512 expertos enrutados de cada capa de texto por expertos latentes agrupados en 8 grupos.

La innovacion principal es la representacion de los expertos enrutados como bloques NVFP4 de ggml (64 valores en 36 bytes con cuatro escalas UE4M3), lo que reduce el peso de los expertos a 34,0 GB dentro de un unico fichero de 41.601.566.208 bytes (38,74 GiB). El artefacto incluye el bloque MTP del release, lo que permite decodificacion especulativa con tres borradores por ronda, y depende de una tabla de n-gramas publicada por separado.

Es relevante ahora porque demuestra un flujo de cuantizacion a 4 bits (NVFP4) sobre una arquitectura MoE latente de gran tamano, con soporte de residencia de expertos en GPU, memoria de host o disco, y porque las mediciones publicadas en una A40 de 48 GB muestran entre 20,1 y 91,6 tok/s segun la colocacion y el uso de MTP. El modelo base esta etiquetado con licencia `edge0-community-model-license-1.0` y el artefacto no incluye la tabla de n-gramas necesaria para ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido tipo Qwen3.8-Flash-Next: Gated DeltaNet, atencion dispersa, hyper-connections, MoE latente con 8 grupos, router, experto compartido y bloque MTP |
| Parametros totales | no disponible (el nombre comercial indica 120B; no se detalla el recuento exacto en la informacion proporcionada) |
| Parametros activos | no disponible (MoE con 512 expertos enrutados por capa en 48 capas; no se especifica cuantos se activan por token) |
| Longitud de contexto | 32.768 tokens en los ejemplos de despliegue (`--max-context 32768`); el maximo nativo del modelo base no se detalla |
| Tipos de cuantizacion | NVFP4 (`gguf_nvfp4`) para expertos enrutados; Q4_0 para codificadores y decodificadores de grupo; Q2_0 para expertos del bloque MTP; Q8_0 para matrices del bloque MTP |
| Idiomas soportados | no disponible |
| Licencia | `edge0-community-model-license-1.0` (etiqueta `license: other`; incluye `LICENSE`, `NOTICE` y `third-party/Qwen-LICENSE.txt`) |
| Formato de pesos | `.ninfer` (contenedor propio del motor NInfer-all), 41.601.566.208 bytes (38,74 GiB) |

## Arquitectura y entrenamiento
El modelo parte del release Edge0-120B-NVFP4 (revision `291b1ee0`), que a su vez adopta el esqueleto de Qwen3.8-Flash-Next (revision `812d96e1` para configuracion y tokenizer). La arquitectura combina Gated DeltaNet, atencion dispersa, hyper-connections, una tabla de embedding de n-gramas, un router, un experto compartido y un bloque MTP (multi-token prediction). La modificacion clave de Edge0 es la sustitucion de los 512 expertos enrutados de cada capa de texto por expertos latentes: cada experto pertenece a uno de 8 grupos y computa en la anchura latente de su grupo (1280), con un codificador y un decodificador de grupo que proyectan desde y hacia la anchura del modelo (2560).

El artefacto de WaveCut no reentrena ni modifica los pesos: conserva los bloques del release byte a byte y el motor los multiplica en su sitio. Los expertos enrutados de las 48 capas (512 por capa, en 8 grupos) se almacenan como bloques NVFP4 de ggml para gate, up y down, con los multiplicadores FP32 de cada experto tomados de las colas de registro del release, ocupando 34,0 GB. Los codificadores y decodificadores de grupo se toman de `latent_dense_q4.bin` (filas Q4_0, 1,42 GB) y las etiquetas de grupo de `labels.bin`. El esqueleto se toma de `model-skeleton.gguf` y el bloque MTP de `mtp/` con expertos Q2_0 y matrices Q8_0. La tabla de n-gramas no se incluye: el modelo referencia su tabla por el SHA-256 de sus filas (`57496326706760c564e80ed401f6b26a7d6b340cc05966502675c8dc01ef8fd9`), publicada aparte. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades
- Generacion de texto autoregresiva con decodificacion especulativa mediante el bloque MTP (tres borradores por ronda, con `--draft-min-p 0.5` en las mediciones).
- Razonamiento y generacion de codigo: el modelo hereda las capacidades del release Edge0-120B, aunque no se detallan tareas especificas en la informacion disponible.
- Soporte de contexto de hasta 32.768 tokens en los ejemplos de servicio publicados.
- Capacidades multilingues: no disponibles.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales: modo thinking, vision o audio no disponibles en la informacion proporcionada.

## Casos de uso
- Despliegue en una unica GPU de 48 GB con todos los expertos residentes en dispositivo: permite servir el modelo con la maxima velocidad medida (53,4 tok/s sin borradores y 91,6 tok/s con MTP) en entornos donde el coste de memoria no es restrictivo.
- Servicio con expertos en memoria de host fijada (34,0 GB de RAM) y cache de expertos en GPU: adecuado para maquinas con GPU de menor capacidad o para compartir la GPU entre varias cargas, manteniendo 40,5 tok/s sin borradores y 65,0 tok/s con MTP.
- Despliegue con expertos en disco y cache en GPU: opcion para entornos con poca RAM, con 20,1 tok/s sin borradores y 40,4 tok/s con MTP, dependiente del page cache del contenedor.
- Generacion de texto de larga duracion con contexto de 32.768 tokens: util para resumenes, analisis de documentos extensos o conversaciones multi-turno en las que se necesita conservar mucho historial.
- Evaluacion de la calidad de la cuantizacion NVFP4: la perplexity publicada sobre los primeros 40 KB de la muestra WikiText del repositorio (9.234 objetivos, KV INT8) es 4,795757, identica con expertos en dispositivo, host y disco, lo que permite comparar el efecto de la colocacion sin variar la salida.
- Integracion en pipelines de investigacion sobre MoE latentes: el artefacto y el conversor `tools/convert/edge0.py` permiten reproducir la conversion y estudiar el comportamiento de expertos latentes agrupados en un motor de inferencia propio.
- Prototipado de decodificacion especulativa con MTP: la documentacion reporta que las respuestas greedy son identicas con y sin borradores en todas las colocaciones, lo que facilita validar la aceleracion sin cambiar la salida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card indica explicitamente que no se ejecuto ningun benchmark de calidad en NInfer y remite a la card de Edge0 para esos datos.

Rendimiento de inferencia medido el 12-13 de noviembre de 2026 con NInfer-all `master` (CUDA 12.8, `sm_86`) en una A40 (48 GB, 300 W), contenedor con cuota de 7,65 CPUs y 50 GB de RAM, una ejecucion por fila:

| Expertos | Cache de expertos en GPU | Sin borradores (tok/s) | MTP (tok/s) | Borradores aceptados |
|---|---:|---:|---:|---:|
| device | - | 53,4 | 91,6 | 66,7 % |
| host | 31,7 GiB | 40,5 | 65,0 | 66,7 % |
| disk | 35,7 GiB | 20,1 | 40,4 | 66,7 % |

Mediciones con decodificacion greedy de hasta 256 tokens tras un prompt de 33 tokens, MTP con tres borradores y `--draft-min-p 0.5`. La perplexity sobre los primeros 40 KB de WikiText (9.234 objetivos, KV INT8) es 4,795757 en las tres colocaciones.

## Requisitos de hardware
- VRAM estimada: alrededor de 41 GB para mantener todos los expertos en GPU; 31,7 GiB de cache de expertos en GPU en modo host; 35,7 GiB de cache en modo disco.
- RAM: 34,0 GB de memoria de host fijada en modo `--expert-residency host`; el modo disco depende del page cache del contenedor.
- GPU recomendadas: A40 de 48 GB (medida en la documentacion); cualquier GPU con al menos 48 GB de VRAM para el modo dispositivo. No se documentan pruebas en A100, H100 o RTX 4090.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB con todos los expertos en dispositivo; el modo host o disco podria reducir el requisito de VRAM a costa de RAM y velocidad, aunque no se publican mediciones en esas GPU.
- Opciones de despliegue: exclusivamente `ninfer-serve` de NInfer-all desde el commit `72d1d8e04`; las builds estandar de NInfer rechazan el fichero porque los expertos latentes y los formatos `gguf_*` solo existen en NInfer-all. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 53,4 tok/s (device, sin borradores), 91,6 tok/s (device, MTP), 40,5 tok/s (host, sin borradores), 65,0 tok/s (host, MTP), 20,1 tok/s (disk, sin borradores) y 40,4 tok/s (disk, MTP).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Edge0-120B-NVFP4-NInfer-v3 | 120B (nominal; recuento exacto no disponible) | 32.768 en ejemplos | `.ninfer` | edge0-community-model-license-1.0 | NInfer-all |
| Edge0/Edge0-120B-NVFP4 (base) | 120B (nominal) | no disponible | no disponible | edge0-community-model-license-1.0 | no disponible |
| Qwen/Qwen3.8-Flash-Next (esqueleto) | no disponible | no disponible | no disponible | Qwen (referenciada en `third-party/Qwen-LICENSE.txt`) | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto, formato, licencia y motor de inferencia.

## Limitaciones y advertencias
- El fichero no es autonomo: requiere descargar por separado la tabla de n-gramas `WaveCut/Edge0-ngram-table-FP8-NInfer-v3` y pasarla con `--ngram-table`; sin ella el modelo no puede ejecutarse correctamente.
- Solo funciona con NInfer-all desde el commit `72d1d8e04`; las builds estandar de NInfer rechazan el artefacto.
- La licencia `edge0-community-model-license-1.0` es una licencia comunitaria no estandar; deben revisarse `LICENSE` y `NOTICE` antes de cualquier uso comercial. El artefacto incluye la licencia de Qwen para los componentes heredados.
- El modelo base conserva el tokenizer y la plantilla de chat de Qwen3.8-Flash-Next; el conversor rechaza releases cuya vocabulary o merges difieran.
- No se han publicado benchmarks de calidad en la informacion disponible; la unica metrica de calidad es la perplexity de 4,795757 sobre una muestra parcial de WikiText.
- Riesgo de alucinacion, sesgos conocidos y limitaciones idiomaticas: no disponibles en la informacion proporcionada.
- El rendimiento en modo disco depende del page cache del contenedor, por lo que las cifras de 20,1 y 40,4 tok/s pueden variar con la carga del sistema.
- Las mediciones se realizaron en la primera build, sin perfil de enrutamiento integrado (la cache de expertos en host arrancaba vacia), con tres borradores pero sin `--draft-min-p`, y con una conversion consumiendo 3 de las CPUs del contenedor; los resultados pueden diferir en la build actual.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion externa muy limitada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/WaveCut/Edge0-120B-NVFP4-NInfer-v3
- Modelo base: https://huggingface.co/Edge0/Edge0-120B-NVFP4
- Tabla de n-gramas: https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit minimo de NInfer-all: https://github.com/iamwavecut/ninfer-all/commit/72d1d8e0439974779201f8537a2915de0b52f155
- Guia de Edge0 en NInfer-all: https://github.com/iamwavecut/ninfer-all/blob/master/docs/edge0.md
- Conversor: https://github.com/iamwavecut/ninfer-all/blob/master/tools/convert/edge0.py
- Tokenizer y plantilla de chat: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
