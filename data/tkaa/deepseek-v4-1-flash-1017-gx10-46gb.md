# Tkaa/DeepSeek-V4.1-Flash-1017-GX10-46GB

## Resumen

DeepSeek-V4.1-Flash-1017-GX10-46GB es un paquete de pesos cuantizados y bloqueados por hardware, derivado del modelo `nvidia/DeepSeek-V4.1-Flash-1017-NVFP4`, publicado por el usuario Tkaa en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para su ejecucion exclusiva en sistemas NVIDIA Grace Blackwell GB10 (ASUS Ascent GX10, NVIDIA DGX Spark, Lenovo ThinkStation PGX, HP ZGX, Dell Pro Max GB10), con arquitectura aarch64 y compute capability 12.1 (`sm_121`). El paquete incluye 40 shards de capas bloqueadas a GB10 y una cache propietaria denominada GX10 Turbo Cache.

El modelo base es un Mixture of Experts (MoE) de DeepSeek en su variante V4.1 Flash, aunque la model card no detalla el numero de parametros totales ni activos, la longitud de contexto ni la composicion del dataset de entrenamiento. La edicion de 46 GB mantiene los 15.360 expertos en RAM (45,8 GB de huella activa) y declara una fidelidad de cadena de 40 capas del 99,98% respecto al modelo original en NVFP4, con una similitud coseno FFN del 99,86% en la muestra 0 y un 98,34% de media en 8 dominios.

La relevancia actual del paquete radica en su enfoque de despliegue local en hardware compacto de NVIDIA: ofrece entre 14,5 y 52,8 tokens por segundo segun el "gear" seleccionado, e incluye un motor propietario `flash1017-gx10` con chat interactivo, benchmark y servidor HTTP compatible con OpenAI/vLLM. En el momento de la publicacion, el binario del motor aun no estaba disponible ("Runtime Engine Coming Soon"), por lo que el paquete no es funcional de forma autonoma hasta su liberacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) derivada de DeepSeek-V4.1-Flash; detalles de capas y atencion no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la model card indica 15.360 expertos en RAM, sin desglose de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en NVFP4 (modelo original de NVIDIA); esta edicion se distribuye como shards bloqueados a GB10 con cache propietaria, sin formatos GGUF/AWQ/GPTQ publicados |
| Idiomas soportados | no disponible |
| Licencia | `nvidia-gb10-spark-free-use` (licencia personalizada, enlazada en `LICENSE`) |
| Formato de pesos | safetensors (40 shards `model-00003..00042-of-00048.safetensors`) + cache binaria propietaria (`gx10_cache_01..05.bin`, `gx10_heads.bin`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de identificarlo como MoE de la familia DeepSeek-V4.1-Flash. No se especifican el numero de capas, la dimension del modelo, el mecanismo de atencion ni el esquema de enrutamiento de expertos. Tampoco se detalla el proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento. El modelo original del que deriva (`nvidia/DeepSeek-V4.1-Flash-1017-NVFP4`) esta cuantizado en NVFP4, un formato de NVIDIA para inferencia de baja precision en hardware Blackwell.

La innovacion tecnica de esta edicion no reside en el entrenamiento, sino en el empaquetado y el motor de inferencia. El paquete incluye 40 shards de capas "bloqueadas" a GB10 y una cache propietaria (GX10 Turbo Cache) que, segun el autor, permite alcanzar una fidelidad de cadena de 40 capas del 99,98% respecto al modelo NVFP4 original. El motor `flash1017-gx10` implementa un "cambio de 8 velocidades" (gear 0 a 7) que combina decodificacion secuencial turbo, arboles especulativos de 8 nodos con prompt-lookup hibrido y hasta 16 streams paralelos en un solo sweep, con verificacion de coincidencia sin perdida (`Match K0`) en los modos 0 a 2. Los modos 3 a 7 priorizan throughput mediante paralelismo de streams, con velocidades verificadas de hasta 52,82 tok/s en GB10.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante el comando `chat` del motor propietario.
- Razonamiento y respuesta a preguntas, con seleccion automatica de gear segun el tipo de prompt (Q&A, codigo, listas).
- Generacion de codigo, con perfil de ejecucion dedicado (Gear 2 en modo `auto`).
- Servidor HTTP compatible con la API de OpenAI y vLLM (`serve`), lo que permite integracion con clientes existentes.
- Benchmark integrado de velocidad (`bench`) para medir tok/s entre gear 0 y gear 7.
- Soporte de tool calling, function calling, agentes y capacidades multimodales: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (la model card esta redactada en ingles y sueco, pero no especifica idiomas del modelo).
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo GB10: el paquete esta disenado para ejecutarse en ASUS Ascent GX10, NVIDIA DGX Spark, Lenovo ThinkStation PGX, HP ZGX o Dell Pro Max GB10, con 45,8 GB de RAM activa y todos los expertos cargados, lo que permite inferencia de un MoE de gran tamano en hardware de sobremesa.
- Servicio de inferencia compatible con OpenAI: el comando `serve` expone un endpoint HTTP en el puerto 8000 que puede integrarse con aplicaciones existentes que ya consumen la API de OpenAI o vLLM, sin cambios en el cliente.
- Asistente de codigo en local: el modo `--gear auto` detecta prompts de codigo y activa el perfil Gear 2, adecuado para autocompletado y generacion de funciones en entornos sin conexion a la nube.
- Evaluacion de rendimiento de hardware Blackwell: el comando `bench` permite medir tok/s reales en gear 0 a 7 sobre un sistema GB10 concreto, util para validar configuraciones y comparar con otras ediciones (58 GB, 89 GB).
- Investigacion sobre cuantizacion y fidelidad de modelos: la edicion declara metricas de similitud coseno FFN y fidelidad de cadena de capas, lo que permite estudiar el impacto de la compresion NVFP4 y del bloqueo por hardware en la calidad del modelo.
- Procesamiento por lotes en modo paralelo: los gears 3 a 7 permiten hasta 16 streams paralelos en un solo sweep, adecuados para escenarios de generacion multiple simultanea donde prima el throughput sobre la latencia individual.
- Despliegue en produccion sin coste de licencia en GB10: la licencia `nvidia-gb10-spark-free-use` permite uso comercial, personal, academico y de investigacion sin coste, siempre que se ejecute en hardware GB10 autentico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo publica metricas de velocidad y fidelidad de compresion:

| Metrica | Valor |
|---|---|
| Velocidad Gear 0 (Std 1x) | 12,44 tok/s (80,4 ms/tok) |
| Velocidad Gear 1 (Turbo 1x, por defecto) | 14,51 tok/s |
| Velocidad Gear 2 (Deep 1x) | 16,85 - 20,55 tok/s |
| Velocidad Gear 3 (Stream 4x) | 36,87 tok/s (27,1 ms/tok) |
| Velocidad Gear 4 (Hyper 4x) | 39,40 tok/s (25,4 ms/tok) |
| Velocidad Gear 5 (Stream 8x) | 47,38 tok/s (21,1 ms/tok) |
| Velocidad Gear 6 (Hyper 8x) | 48,80 tok/s (20,5 ms/tok) |
| Velocidad Gear 7 (Stream 16x) | 52,82 tok/s (18,9 ms/tok) |
| Modo `auto` | 14,5 - 32,7 tok/s |
| Fidelidad de cadena 40 capas | 99,98% |
| Similitud coseno FFN (muestra 0) | 99,86% |
| Similitud coseno FFN (media 8 dominios) | 98,34% |

## Requisitos de hardware

- RAM activa: 45,8 GB con `--mem 3` (todos los 15.360 expertos en RAM). Tamano de descarga del repositorio: aproximadamente 49,8 GB (40 shards + 4,3 GB de GX10 Turbo Cache).
- Hardware obligatorio: sistema NVIDIA Grace Blackwell GB10 autentico (ASUS Ascent GX10, NVIDIA DGX Spark, Lenovo ThinkStation PGX, HP ZGX, Dell Pro Max GB10), Linux aarch64, compute capability 12.1 (`sm_121`).
- GPU recomendadas: exclusivamente GB10. No se contempla ejecucion en A100, H100, RTX 4090 ni otras GPU consumer o de datacenter.
- Cabe en consumer GPU: no. El modelo esta bloqueado por hardware a GB10 y el motor propietario no se distribuye para otras plataformas.
- Opciones de despliegue: motor propietario `flash1017-gx10` con subcomandos `chat`, `bench` y `serve` (compatible con OpenAI/vLLM). No se menciona soporte para vLLM nativo, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12,44 tok/s en Gear 0 (80,4 ms/tok) hasta 52,82 tok/s en Gear 7 (18,9 ms/tok), medidos en GB10 con la edicion de 45,8 GB.
- Espacio en disco: aproximadamente 49,8 GB para esta edicion, mas los shards base de NVIDIA descargados por `setup_model.sh`; se pueden omitir los 98 GB de shards Engram (`model-00047` y `00048`) con `--no-engram`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Velocidad |
|---|---|---|---|---|---|
| Tkaa/DeepSeek-V4.1-Flash-1017-GX10-46GB (esta ficha) | no disponible (MoE, 15.360 expertos) | no disponible | `nvidia-gb10-spark-free-use` | Solo GB10 | 14,5 - 52,8 tok/s |
| Tkaa/DeepSeek-V4.1-Flash-1017-GX10-58GB (Gold) | no disponible | no disponible | `nvidia-gb10-spark-free-use` | Solo GB10 | 13,4 - 51,6 tok/s |
| Tkaa/DeepSeek-V4.1-Flash-1017-GX10-89GB (Surgical) | no disponible | no disponible | `nvidia-gb10-spark-free-use` | Solo GB10 | 13,1 - 49,9 tok/s |
| nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 (base) | no disponible | no disponible | no disponible | GPU Blackwell (NVFP4) | no disponible |

Las tres ediciones GX10 comparten el mismo modelo base y se diferencian en la huella de RAM activa (45,8 GB, 58,5 GB y 89,4 GB) y en la fidelidad de cadena de 40 capas (99,98%, 100,00% y 100,00% respectivamente). No se dispone de datos de benchmarks de calidad ni de comparativas con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Bloqueo por hardware: el paquete solo funciona en sistemas NVIDIA Grace Blackwell GB10 autenticos con Linux aarch64 y compute capability 12.1. No es ejecutable en A100, H100, RTX 4090 ni en GPU de otras arquitecturas.
- Motor no disponible en el momento de la publicacion: la model card indica explicitamente que el binario `flash1017-gx10` se publicara "en breve", por lo que el repositorio no es funcional de forma autonoma hasta entonces.
- Licencia restrictiva por hardware: la licencia `nvidia-gb10-spark-free-use` permite uso gratuito e ilimitado solo en hardware GB10 autentico; el uso en otro hardware no esta cubierto por la licencia.
- Dependencia de un motor propietario: la inferencia requiere el binario `flash1017-gx10`, sin soporte documentado para vLLM nativo, llama.cpp, Ollama o TGI. La integracion con el ecosistema open source es limitada.
- Sin datos de calidad: no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni evaluaciones de sesgo, alucinacion o robustez.
- Idiomas y contexto no documentados: la model card no especifica la longitud de contexto soportada ni los idiomas del modelo, lo que impide planificar su uso en produccion multilingue o con documentos largos.
- Fidelidad no perfecta en la edicion de 46 GB: la similitud coseno FFN media en 8 dominios es del 98,34%, inferior a la de las ediciones de 58 GB y 89 GB (que declaran 100,00% de fidelidad de cadena), por lo que puede haber degradacion sutil en tareas sensibles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad, validacion externa ni reportes de uso en produccion.
- Requiere descarga adicional de shards base de NVIDIA mediante `setup_model.sh`, con un consumo de disco que puede superar los 100 GB si no se omite el Engram con `--no-engram`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tkaa/DeepSeek-V4.1-Flash-1017-GX10-46GB
- Edicion Gold 58 GB: https://huggingface.co/Tkaa/DeepSeek-V4.1-Flash-1017-GX10-58GB
- Edicion Surgical 89 GB: https://huggingface.co/Tkaa/DeepSeek-V4.1-Flash-1017-GX10-89GB
- Modelo base NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Script de instalacion: `setup_model.sh` (incluido en el repositorio)
- Binario del motor: `bin/flash1017-gx10` (incluido en el repositorio; runtime pendiente de publicacion)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
