# yujiepan/ernie-5.5-flash-preview-fp8-tiny-random

## Resumen

`yujiepan/ernie-5.5-flash-preview-fp8-tiny-random` es un checkpoint de juguete, con inicializacion aleatoria, derivado de `baidu/ERNIE-5.5-Flash-Preview-FP8`. Lo publica el usuario yujiepan con un unico proposito: servir como banco de pruebas para el desarrollo y la depuracion de la infraestructura de inferencia de ERNIE 5.5 en SGLang. No es un modelo entrenado ni utilizable para tareas reales de generacion; sus pesos no contienen conocimiento alguno.

El interes tecnico del repositorio no esta en el modelo en si, sino en que replica fielmente la topologia del ERNIE 5.5 Flash original a escala minima: misma alternancia de capas de atencion (7 HCA + 1 MLA), mismo esquema de expertos enrutados con 10 expertos activos por token, misma cabecera de decodificacion especulativa DSpark y mismo formato de cuantizacion FP8 por bloques de 128x128. Con 91.581.790 parametros totales y 152 MB en un unico `model.safetensors`, permite validar el pipeline completo (carga de pesos, tokenizador, atencion con KV comprimida, enrutamiento MoE y decodificacion especulativa) en una sola GPU.

Es relevante ahora porque el modelo base ERNIE 5.5 Flash es un MoE de gran escala (297.420 millones de elementos en FP8 en el checkpoint original, 301,87 GB en 129 ficheros) que resulta caro de iterar durante el desarrollo de kernels y del servidor. Este tiny-random reduce ese coste a cero practicamente y actua como test de regresion reproducible para SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (HCA + MLA) y decodificacion especulativa DSpark |
| Parametros totales | 91.581.790 (56,58 M en BF16, 1,30 M en F32, 33,70 M en FP8 E4M3) |
| Parametros activos | 10 expertos enrutados por token de 16 disponibles, mas 1 experto compartido (dimension del modelo base: 512 expertos, 10 activos) |
| Longitud de contexto | 2.048 tokens en el ejemplo de despliegue (no se especifica el maximo del modelo base) |
| Tipos de cuantizacion | FP8 E4M3 con bloques de 128x128 en lineales y expertos enrutados; pesos BF16 y F32 en el resto |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 152,4 MB) |

## Arquitectura y entrenamiento

La arquitectura reproduce la del ERNIE 5.5 Flash Preview: 15 capas de decoder organizadas en dos ciclos de atencion, cada ciclo compuesto por 7 capas HCA (Hybrid Compressed Attention) y 1 capa MLA (Multi-head Latent Attention). En el tiny, HCA usa 4 cabezas de dimension 512 y MLA 4 cabezas con qk_nope 192, rope 64 y v 256, con latente KV-LoRA de 512. Incluye un indexer de 64 cabezas, dimension 128 y top-k 2048, y un mecanismo mHC de 4 flujos con 20 iteraciones de Sinkhorn. La capa MoE tiene 16 expertos enrutados (frente a 512 en el original), 10 activos por token, 1 experto compartido, hidden de 128 y anchura de experto y latente de 128. El vocabulario es de 201.216 tokens con embeddings no atados.

La decodificacion especulativa DSpark incorpora 3 capas de draft, tamano de bloque 7 y rango de Markov 8. Los pesos estan inicializados aleatoriamente: no ha habido preentrenamiento, ajuste fino, RLHF ni DPO. El repositorio documenta el script de generacion (`.meta/create_model.py`), el log de estructura (`.meta/model.log`) y el entorno (`.meta/env.json`), y declara que ha sido generado con GPT-6.1-Sol.

## Capacidades

- Generacion de texto: solo estructural. El modelo emite tokens validos segun el tokenizador, pero sin contenido semantico aprendido.
- Razonamiento, codigo y matematicas: no disponible; al no estar entrenado no presenta ninguna de estas capacidades.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Multilingue: no disponible; el tokenizador soporta 201.216 entradas, pero no hay evaluacion de idiomas.
- Capacidades especiales: sirve como fixture de pruebas para validar atencion con KV comprimida, enrutamiento MoE, decodificacion especulativa DSpark y cuantizacion FP8 por bloques en SGLang.
- Compatibilidad de servicio: expone endpoint OpenAI-compatible de chat completions via `sglang serve`, con soporte de mensajes de sistema e historial multi-turno.

## Casos de uso

- Test de regresion de SGLang: validar que una revision concreta del servidor (en la model card se cita el PR #51236) carga correctamente un checkpoint ERNIE 5.5 y ejecuta prefill y decode sin errores, en una sola GPU y en segundos.
- Desarrollo de kernels de atencion HCA/MLA: comprobar la correccion numerica de nuevas implementaciones de atencion con KV comprimida contra una topologia identica a la de produccion pero con tensores minimos.
- Verificacion de enrutamiento MoE: probar el despacho de 10 expertos activos por token, el experto compartido y el particionado con `--ep` (expert parallelism) sin necesidad de reservar cientos de GB de VRAM.
- Validacion de decodificacion especulativa DSpark: ejercitar las 3 capas de draft y el tamano de bloque 7 para medir la tasa de aceptacion y detectar regresiones en el grafo CUDA de decode.
- Pruebas de cuantizacion FP8 por bloques 128x128: comprobar la carga y el desempaquetado de tensores E4M3 con escala por bloque en lineales y expertos enrutados.
- Integracion continua de pipelines de despliegue: usar el checkpoint como smoke test en CI para verificar tokenizador, plantilla de chat, endpoint OpenAI-compatible y grafo CUDA antes de desplegar el modelo real.
- Depuracion de memoria y planificacion de KV cache: ajustar `--mem-fraction-static` y `--context-length` sobre una topologia equivalente sin coste de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria irrelevante por construccion. La model card solo reporta verificacion funcional del despliegue en SGLang y el recuento de elementos por tipo de precision.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB para los pesos (152 MB en safetensors); el consumo real lo domina el runtime de SGLang y la KV cache.
- Configuracion de referencia: `--tp 2 --ep 2 --dtype bfloat16 --context-length 2048 --mem-fraction-static 0.3`, es decir, 2 GPUs con paralelismo tensorial y de expertos en la prueba documentada.
- GPU recomendadas: cualquier GPU con soporte de FP8 y BF16; cabe holgadamente en tarjetas consumer como RTX 4090 o RTX 3090, e incluso en GPUs de gama media con suficiente memoria para el runtime.
- Cabe en GPU consumer: si.
- Opciones de despliegue: SGLang (verificado, con la revision del PR #51236 y `--trust-remote-code`); llama.cpp, Ollama y TGI no estan documentados para esta arquitectura.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yujiepan/ernie-5.5-flash-preview-fp8-tiny-random | 91,58 M | 2.048 (ejemplo) | Fixture de pruebas y depuracion | no disponible | Hugging Face |
| baidu/ERNIE-5.5-Flash-Preview-FP8 | 297,42 B en FP8 (301,87 GB) | no disponible | Modelo de produccion | no disponible | Hugging Face |
| Otros tiny-random de la familia ERNIE | no disponible | no disponible | Pruebas de infraestructura | no disponible | no disponible |

La comparativa natural es con su propio modelo base: el tiny conserva la topologia (capas, cabezas, expertos, indexer, DSpark) pero reduce el numero de capas de 43 a 15, las cabezas de 64 a 4, los expertos enrutados de 512 a 16 y las dimensiones ocultas de 4.096 a 128. No se dispone de informacion sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce texto coherente ni respuestas correctas; no debe usarse en produccion ni para evaluacion de calidad.
- Sesgos: no evaluables, al no haber datos de entrenamiento.
- Alucinacion: total por construccion; cualquier salida es ruido estadistico.
- Contexto e idioma: la configuracion de ejemplo limita el contexto a 2.048 tokens y no hay informacion sobre cobertura idiomatica.
- Licencia: no disponible; no se puede asumir uso comercial sin consultar el repositorio del modelo base `baidu/ERNIE-5.5-Flash-Preview-FP8`.
- Dependencia de una revision concreta de SGLang (PR #51236): otras versiones pueden no cargar el checkpoint o deshabilitar los grafos de prefill para la atencion con KV comprimida.
- Requiere `--trust-remote-code`, lo que implica ejecutar codigo del repositorio; conviene revisarlo antes de usarlo en entornos compartidos.
- El repositorio se ha generado de forma automatica con GPT-6.1-Sol; conviene auditar los scripts de `.meta/` antes de reproducir la creacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yujiepan/ernie-5.5-flash-preview-fp8-tiny-random
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- PR de SGLang citado (#51236): https://github.com/sgl-project/sglang/pull/51236
- Repositorio de SGLang: https://github.com/sgl-project/sglang
- Script de creacion: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generacion: `.meta/env.json` (dentro del repositorio)
