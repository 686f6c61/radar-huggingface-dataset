# Tkaa/DeepSeek-V4.1-Flash-1017-GX10

## Resumen

DeepSeek-V4.1-Flash-1017-GX10 es una distribución hardware-locked del modelo NVIDIA DeepSeek-V4.1-Flash-1017-NVFP4, publicada por el usuario Tkaa en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un paquete de despliegue que combina un binario de inferencia específico para el hardware NVIDIA Grace Blackwell GB10 (sm_121), una caché precalculada de 4,3 GB y 40 shards de pesos bloqueados criptográficamente a esa plataforma. El objetivo es ofrecer inferencia local de un modelo MoE de gran tamaño en sistemas compactos como ASUS Ascent GX10, NVIDIA DGX Spark, Lenovo ThinkStation PGX, HP ZGX o Dell Pro Max GB10.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con capacidades multimodales (incluye un codificador de visión de 0,9 GB) y un mecanismo adicional de tablas N-Gram/Engram de 98 GB, según los shards descritos en la model card. El repositorio de Tkaa ocupa aproximadamente 197 GB e incorpora un motor propio, `flash1017-gx10`, con una "caja de cambios" de 8 niveles que ajusta el paralelismo de decodificación para alcanzar entre 14,8 y 65,5 tokens por segundo en GB10.

La relevancia de esta ficha es doble: por un lado, documenta una propuesta de inferencia local optimizada para hardware Blackwell de consumo/prosumer; por otro, advierte de un modelo de licencia restrictiva y de un ecosistema de artefactos derivados (GGUF, versiones abliterated) que conviene evaluar con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con codificador de visión y tablas N-Gram/Engram |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la model card menciona 8 expertos activos por capa, pero no el total de parámetros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (modelo base), FP8 (tag del repo), shards bloqueados sin cuantización adicional indicada |
| Idiomas soportados | no disponible |
| Licencia | nvidia-gb10-spark-free-use (uso libre e ilimitado solo en hardware GB10 auténtico) |
| Formato de pesos | safetensors (48 shards), binarios propietarios (`gx10_cache_*.bin`, `gx10_heads.bin`, `engram_token_map.bin`, `gx10_tier_map.bin`) |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo base. Por los artefactos publicados se deduce una arquitectura MoE con 48 shards: un codificador de visión (shard 1, 0,9 GB), embeddings de tokens (shard 2, 1,3 GB), 40 capas bloqueadas a GB10 (shards 3 a 42), norma final y LM head (shard 43, 1,3 GB), capas de "Fast Stream" (shards 44 a 46, 7,5 GB) y tablas N-Gram/Engram (shards 47 y 48, 98 GB). La model card indica 8 expertos activos por capa y un total de 15.360 expertos en el conjunto del modelo, lo que sugiere una arquitectura de expertos muy granular.

La innovación principal de esta distribución no está en el entrenamiento, sino en el runtime: un binario `flash1017-gx10` con un addon Rust (`addon_gx10_rust.so`) que implementa decodificación secuencial y paralela en 8 modos ("gears"), desde 1 hasta 16 streams por sweep. Incluye además una caché de turbo de 4,3 GB y mapas de tiers (`gx10_tier_map.bin`) para gestionar qué expertos se precalientan en RAM. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de gran escala, por lo que se asume capacidad de generación y razonamiento, aunque no se detallan evaluaciones.
- Procesamiento de visión: incluye un codificador de visión de 0,9 GB en el shard 1, lo que indica capacidades multimodales de entrada de imagen.
- Decodificación paralela: el motor soporta 8 modos de ejecución (gear 0 a 7) con 1, 4, 8 o 16 streams paralelos por sweep.
- Gestión de memoria configurable: tres niveles (`--mem 1`, `--mem 2`, `--mem 3`) que controlan cuántos expertos se precalientan en los 128 GB de LPDDR5x.
- Servidor compatible con OpenAI/vLLM: la model card menciona un servidor HTTP con API compatible con OpenAI y vLLM, con selección dinámica de gear mediante `{"gear": 0..7}`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repo está vacío.

## Casos de uso

- Inferencia local en DGX Spark o ASUS Ascent GX10: el paquete está diseñado específicamente para estas máquinas; un equipo de investigación puede desplegar el modelo en un nodo compacto de 128 GB de RAM sin GPU dedicada de gran formato, usando `./bin/flash1017-gx10 chat --gear 1 --mem 2` para conversación interactiva.
- Servicio HTTP interno compatible con OpenAI: mediante el servidor incluido, se puede exponer el modelo en la red local para que aplicaciones existentes que usan la API de OpenAI apunten al endpoint sin cambios de código, seleccionando el gear 7 para máxima velocidad en tareas de generación masiva.
- Procesamiento de documentos con imagen: gracias al codificador de visión, se pueden construir pipelines de extracción de información de capturas, formularios o figuras en entornos con requisitos de soberanía del dato, siempre que el hardware sea GB10.
- Benchmarking de hardware Blackwell: el comando `bench` permite medir los 8 gears y comparar el rendimiento real de un GB10 frente a otras configuraciones; útil para laboratorios que evalúan plataformas de inferencia.
- Prototipado de asistentes con contexto largo: las tablas Engram de 98 GB sugieren un mecanismo de memoria o n-gramas de gran escala; con `--mem 3` se precalientan 7.200 expertos para mantener velocidad sostenida en conversaciones de dominio común.
- Investigación en decodificación especulativa y paralela: el motor con múltiples streams por sweep es un banco de pruebas para estudiar el compromiso entre paralelismo, latencia y calidad de salida en hardware con ancho de banda limitado.
- Despliegue en entornos con restricciones de exportación: al estar bloqueado a GB10, el binario y los pesos no pueden ejecutarse en otras plataformas, lo que puede encajar en políticas internas que exigen que el modelo no salga de un parque de hardware controlado.

## Benchmarks y rendimiento

La model card proporciona velocidades de decodificación medidas en GB10 para cada gear, no benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.).

| Gear | Modo | Perfil de ejecución | Velocidad verificada en GB10 |
|---|---|---|---|
| 0 | Standard 1x | Decodificación secuencial (1 token/sweep) | 14,8 tok/s (67,6 ms/tok) |
| 1 (por defecto) | Turbo 1x | Turbo secuencial adaptativo (1-4 tokens/sweep) | 19,8 tok/s (50,6 ms/tok) |
| 2 | Deep 1x | Turbo secuencial multi-candidato | 19,9 tok/s (50,4 ms/tok) |
| 3 | Stream 4x | 4 streams paralelos en 1 sweep | 42,5 tok/s (23,5 ms/tok) |
| 4 | Hyper 4x | 4 streams + turbo multi-paso | 49,6 tok/s (20,2 ms/tok) |
| 5 | Stream 8x | 8 streams paralelos en 1 sweep | 57,0 tok/s (17,6 ms/tok) |
| 6 | Hyper 8x | 8 streams + turbo multi-paso | 59,3 tok/s (16,9 ms/tok) |
| 7 | Stream 16x | 16 streams paralelos en 1 sweep | 65,5 tok/s (15,3 ms/tok) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: NVIDIA Grace Blackwell GB10 (sm_121, Compute Capability 12.1), Linux aarch64. Sistemas compatibles citados: ASUS Ascent GX10, NVIDIA DGX Spark, Lenovo ThinkStation PGX, HP ZGX, Dell Pro Max GB10.
- RAM: 128 GB LPDDR5x (~121 GiB usables). El nivel `--mem 1` deja ~113,8 GB libres; `--mem 2` deja ~60,5 GB; `--mem 3` deja ~21,8 GB.
- Almacenamiento: ~197 GB para el repo de Tkaa más ~109 GB del repo de NVIDIA (o ~11 GB con `--no-engram`). El total combinado ronda los 306 GB sin Engram y ~404 GB con Engram.
- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en memoria unificada LPDDR5x del GB10, no en VRAM de GPU discreta.
- GPU recomendadas: exclusivamente GB10. No es ejecutable en A100, H100, RTX 4090 ni en CPU convencional, porque el binario y los 40 shards están bloqueados criptográficamente a sm_121.
- Cabe en consumer GPU: no. No hay soporte para GPUs de consumo estándar.
- Opciones de despliegue: binario propietario `flash1017-gx10` (chat REPL, bench, servidor HTTP compatible con OpenAI/vLLM). No hay soporte oficial para vLLM, llama.cpp, Ollama ni TGI en este repo.
- Latencia y throughput: 14,8 tok/s en gear 0 y 65,5 tok/s en gear 7, con 15,3 ms/token en el modo más rápido. En `--mem 1` la velocidad cae a 3-8 tok/s durante el calentamiento en temas nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Formato |
|---|---|---|---|---|---|
| Tkaa/DeepSeek-V4.1-Flash-1017-GX10 | no disponible | no disponible | nvidia-gb10-spark-free-use (solo GB10) | GB10 exclusivamente | safetensors + binarios propietarios |
| nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 (base) | no disponible | no disponible | no disponible en la información | GPU NVIDIA con soporte NVFP4 | safetensors NVFP4 |
| prometheusAIR/DeepSeek-V4.1-Flash-1017-GGUF | no disponible | no disponible | no disponible | CPU/GPU con llama.cpp | GGUF (en progreso) |
| JMNI-Labs/DeepSeek-V4.1-Flash-1017-abliterated-FLARE | no disponible | no disponible | Local Inference Lab License 1.0 + MIT para pesos DeepSeek | no disponible | no disponible |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de parámetros, contexto ni rendimiento de calidad para establecer comparaciones cuantitativas con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Bloqueo de hardware: el binario y 40 de los 48 shards están cifrados y vinculados a la clave de hardware GB10 (sm_121). No se pueden ejecutar en otra plataforma, ni siquiera en GPUs NVIDIA de gama alta como H100 o A100.
- Licencia restrictiva: la licencia `nvidia-gb10-spark-free-use` solo permite uso gratuito e ilimitado en hardware GB10 auténtico. Cualquier uso fuera de esa plataforma queda fuera de la licencia, y el texto completo está en el archivo LICENSE del repo.
- Dependencia de un runtime propietario: el motor `flash1017-gx10` y el addon Rust no son software libre ni están auditados públicamente; no hay garantías de mantenimiento, parches de seguridad ni portabilidad.
- Repositorio de terceros: el autor es un usuario individual (Tkaa), no NVIDIA ni DeepSeek. El modelo base es de NVIDIA, pero esta distribución no está avalada oficialmente por el fabricante.
- Idiomas no declarados: el campo de idiomas está vacío, por lo que no se puede garantizar calidad multilingüe ni cobertura de castellano.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alucinación en la información disponible.
- Riesgo de alucinación: no cuantificado; al ser un LLM de gran escala, persiste el riesgo habitual, agravado por la ausencia de evaluaciones publicadas.
- Ecosistema de derivados con licencias dispares: existen versiones GGUF en progreso (prometheusAIR) y variantes abliterated (JMNI-Labs) con licencias adicionales (Local Inference Lab License 1.0) que restringen la re-subida o el mirroring; conviene revisarlas antes de reutilizar pesos.
- Consumo de disco elevado: ~306 GB sin Engram y ~404 GB con Engram, lo que exige planificación de almacenamiento NVMe en el nodo GB10.
- Degradación en frío: con `--mem 1`, el rendimiento cae a 3-8 tok/s hasta que los expertos se cargan desde NVMe, lo que afecta a la latencia percibida en el primer uso de temas nuevos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tkaa/DeepSeek-V4.1-Flash-1017-GX10
- Modelo base NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Versión GGUF en progreso: https://huggingface.co/prometheusAIR/DeepSeek-V4.1-Flash-1017-GGUF
- Variante abliterated FLARE: https://huggingface.co/JMNI-Labs/DeepSeek-V4.1-Flash-1017-abliterated-FLARE
