# spectator2026/Qwen3.8-Flash-Next-W6-HQQ-g32

## Resumen

Qwen3.8-Flash-Next-W6-HQQ-g32 es una cuantización de 6 bits (int6) de los expertos enrutados del modelo multimodal Qwen3.8-Flash-Next, publicada por el usuario spectator2026. No se trata de un entrenamiento nuevo, sino de una conversión de pesos pensada exclusivamente para servir el modelo en GPUs NVIDIA A100 (SM80) bajo vLLM, ya que la A100 no dispone de hardware FP4 y el checkpoint original en BF16 (unos 360 GB) no cabe en dos tarjetas de 80 GB. La cuantización reduce el repositorio a unos 224 GB (209 GiB), lo que permite arrancar un motor con tensor-parallel de 2 sobre 2x A100 80GB usando caché KV en fp8 y decodificación especulativa MTP.

El modelo base conserva intactas en BF16 todas las piezas sensibles (atención, expertos compartidos, enrutador, mezcladores de hiper-conexión, tabla de embeddings n-gram de unos 95 GiB, `lm_head`, torre de visión y la capa MTP); solo se cuantizan los 512 expertos enrutados de las 48 capas principales. Con ello el autor reporta una divergencia KL frente al BF16 de 0,0228 en wikitext y de 0,0749 en conversación agéntica multiturno, medidas con caché KV en fp8.

Es relevante ahora porque abre una ruta de despliegue en hardware A100 para un modelo multimodal de 180.000 millones de parámetros con 262.144 tokens de contexto, soporte de tool calling y razonamiento, en un momento en el que las cuantizaciones publicadas suelen asumir GPUs con FP4. El coste es una integración no estándar: requiere una imagen concreta de vLLM y siete parches sobre ella.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal (mezcla de expertos) de 48 capas principales, 512 expertos enrutados por capa con enrutador y expertos compartidos, mezcladores de hiper-conexión, caché Mamba/recurrente con búfer de anillo de atención, torre de visión y capa MTP |
| Parámetros totales | 179.999.981.459 (aproximadamente 180.000 millones, dato de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | int6 (W6A16) en expertos enrutados, grupo de 32, escalas fp32; SmoothQuant (alfa 0,65) y HQQ; resto de componentes en BF16; caché KV en fp8; empaquetado compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | safetensors con compressed-tensors; kernel 6-bit Marlin MoE precompilado (`osc_w6.so`, SM80) |
| Modalidades | texto e imagen (pipeline `image-text-to-text`) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Tamaño del repositorio | 224,2 GB |
| Librería de inferencia | vLLM (imagen fijada `vllm/vllm-openai:nightly-0bfc7a15d095fe83ecc82b50561a93c177fece2d`, commit `0bfc7a15`) |
| Muestreo por defecto | temperature 1.0, top_p 0.95, top_k 20 |

## Arquitectura y entrenamiento

El modelo es una derivada cuantizada, no un entrenamiento propio, por lo que no hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO. Lo que sí documenta el autor es el proceso de cuantización aplicado únicamente a los expertos enrutados de las 48 capas principales (512 expertos x gate/up/down). El pipeline es: primero un plegado SmoothQuant con alfa = 0,65 calculado a partir de los máximos de activación por experto en la entrada de la proyección down (`up /= s`, `down *= s`, exacto a través de SwiGLU); después una cuantización int6 simétrica con valores en el rango -31 a 31, grupo de 32 a lo largo de la dimensión K y escalas fp32; a continuación una inicialización MSE-clip que elige por grupo el ratio de recorte entre 0,70 y 1,00 que minimiza el error de reconstrucción; luego un reajuste proximal HQQ de las escalas con pérdida lp (p = 0,7) durante 20 iteraciones; y por último un empaquetado en planos 4+2, donde el valor más 32 se almacena como un plano estándar de 4 bits junto a un plano alto de 2 bits.

El empaquetado 4+2 es la innovación clave para el despliegue: permite que el cargador estándar de compressed-tensors y la geometría de tiles de Marlin transporten el plano bajo, de modo que solo el kernel personalizado conoce la existencia del segundo plano. Además, el repositorio incluye siete parches de vLLM, entre los que destacan el registro del tipo de peso de 6 bits, la ruta Marlin MoE de 6 bits, y los parches 0004 y 0005 que habilitan caché KV en fp8 sobre SM80 (la caché se mantiene en `uint8` y el kernel de atención convierte los bytes e4m3 a bf16 de forma exacta y sin ramas, porque Triton no compila `float8_e4m3fn` por debajo de SM89). El parche 0006 permite cargar sin cuantizar la tabla de embeddings n-gram desde un checkpoint compressed-tensors y el 0007 habilita el offloading de caché KV a RAM host sobre el búfer de anillo de atención del modelo.

## Capacidades

- Generación de texto y razonamiento conversacional multiturno, con modo de razonamiento explícito (parser `qwen3`).
- Comprensión de imagen y texto de forma conjunta (pipeline `image-text-to-text`, torre de visión mantenida en BF16).
- Llamada a herramientas y funciones (`--enable-auto-tool-choice`, parser `qwen3_coder`).
- Flujos agénticos y razonamiento en varios pasos, con soporte de caché de prefijos.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa MTP (multi-token prediction) con 3 tokens especulativos, que acelera la generación.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multiturno con un contexto de 262.144 tokens, suficiente para arrastrar historial extenso, documentación de producto y datos de cuenta sin truncar. La caché de prefijos con `--mamba-cache-mode align` permite reutilizar el estado recurrente entre turnos.
- Automatización de agentes con herramientas: gracias a `--enable-auto-tool-choice` y al parser `qwen3_coder`, se puede conectar a APIs internas, bases de datos o sistemas de tickets y resolver tareas en varios pasos, con la capa MTP reduciendo el coste por token generado.
- Análisis de documentos con imágenes: al aceptar entrada imagen-texto, sirve para extraer y razonar sobre capturas, facturas escaneadas, diagramas técnicos o figuras de informes combinados con el texto asociado.
- Generación y revisión de código en producción: el soporte de tool calling permite integrarlo en pipelines de CI/CD para revisar diffs, generar parches o consultar el estado de un repositorio, con contexto suficiente para incluir varios ficheros del proyecto en la misma ventana.
- Razonamiento sobre corpus largos: con 262.144 tokens de contexto se pueden procesar manuales completos, expedientes legales o documentación técnica extensa y hacer preguntas de seguimiento sobre el conjunto.
- Despliegue interno en clústeres A100: equipos que ya disponen de nodos con 2x A100 80GB pueden servir el modelo sin migrar a hardware con FP4, usando el kernel Marlin de 6 bits y los parches incluidos, a cambio de reservar unos 128 GiB de RAM host por motor.
- Asistentes de investigación multimodal: combinación de visión y contexto largo para resumir figuras, tablas y texto de artículos científicos, con modo de razonamiento activable para preguntas analíticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo proporciona métricas de fidelidad de la cuantización frente al checkpoint BF16, medidas con caché KV en fp8:

| Métrica | Conjunto | Valor |
|---|---|---|
| Divergencia KL frente a BF16 | wikitext | 0,0228 |
| Divergencia KL frente a BF16 | conversación agéntica multiturno | 0,0749 |

No hay datos comparativos con otros modelos ni resultados de tareas downstream.

## Requisitos de hardware

- VRAM: el checkpoint BF16 original ocupa aproximadamente 360 GB; esta cuantización ocupa unos 224 GB (209 GiB). Se necesita tensor-parallel de 2 sobre 2x A100 80GB como configuración mínima documentada.
- GPU recomendadas: 2x NVIDIA A100 80GB (SM80), que es la ruta para la que se empaquetó el kernel y los parches. No se documenta soporte para H100, RTX 4090 ni otras arquitecturas.
- GPU de consumo: no viable. El tamaño del modelo y el requisito de SM80 con los parches de vLLM descartan GPUs de consumo como la RTX 4090, tanto por VRAM como por soporte de kernels.
- RAM host: el autor midió aproximadamente 128 GiB de memoria compartida del host por cada motor TP2, debido a la tabla de embeddings n-gram de unos 95 GiB que se fija en memoria host con `VLLM_PLE_CPU_OFFLOAD=1`. Hay que presupuestarlo antes de levantar varios motores en una misma máquina. El flag `KV_OFFLOAD_GIB` añade un nivel de caché KV en RAM host.
- Opciones de despliegue: vLLM con la imagen fijada `vllm/vllm-openai:nightly-0bfc7a15d095fe83ecc82b50561a93c177fece2d` (commit `0bfc7a15`), los siete parches incluidos y el kernel `osc_w6.so` precompilado para SM80. El script `serving/serve.sh` levanta el motor con `--tensor-parallel-size 2`, `--kv-cache-dtype fp8`, `--mamba-cache-mode align`, `--prefix-match-unit 8`, `--max-num-batched-tokens 6144`, `--max-num-seqs 32`, `--max-model-len 262144` y decodificación especulativa MTP con 3 tokens. No se mencionan rutas para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El autor indica que con `--max-num-batched-tokens 6144` (cada bloque) la caché de prefijos es más eficaz que con 8192, y que `--prefix-match-unit 8` es obligatorio con offloading de KV por alineación del bloque de anillo de 8 tokens.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de benchmarks para establecer una comparativa con alternativas de la misma categoría. La única comparación documentada es contra el propio modelo base sin cuantizar:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-W6-HQQ-g32 | 180.000 millones | 262.144 | int6 en expertos, W6A16, grupo 32 | qwen-community-1.0 | HuggingFace, vLLM con parches sobre A100 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | 262.144 | BF16 | qwen-community-1.0 | HuggingFace; requiere aproximadamente 360 GB y no cabe en 2x A100 80GB |
| Otras cuantizaciones de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una cuantización derivada: la divergencia KL reportada (0,0228 en wikitext y 0,0749 en agéntica multiturno) implica una degradación medible frente al BF16, mayor en escenarios multiturno. Conviene validar en el dominio concreto antes de producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual del modelo base ni de esta cuantización, por lo que el comportamiento ante preguntas abiertas no está caracterizado en la información disponible.
- La licencia es `qwen-community-1.0` (`license: other`), no una licencia de código abierto estándar. Hay que revisar el fichero LICENSE del repositorio base y sus términos para uso comercial antes de desplegar.
- El despliegue no es estándar: exige una imagen concreta de vLLM y siete parches sobre ella, más un kernel Marlin MoE de 6 bits precompilado para SM80. Cualquier actualización de vLLM puede invalidar los parches, que son diffs unificados contra esa revisión concreta.
- Dependencia fuerte de hardware A100 (SM80): no se documenta soporte en otras arquitecturas. Los parches 0004 y 0005 existen precisamente porque Triton no compila `float8_e4m3fn` por debajo de SM89.
- Consumo de RAM host elevado: unos 128 GiB por motor TP2, lo que limita cuántas instancias se pueden ejecutar por nodo.
- Idioma: no se especifican los idiomas soportados, por lo que la cobertura multilingüe no se puede verificar con la información disponible.
- El script de cuantización `quantize/build_w6_group.py` requiere una entrada `STATS` con los máximos de activación por capa (`h_amax`) que no está incluida en el repositorio, por lo que no se puede reproducir la cuantización desde cero únicamente con el material publicado.
- Historial de uso nulo: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spectator2026/Qwen3.8-Flash-Next-W6-HQQ-g32
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: LICENSE (referenciada en la model card, `license_link: LICENSE`)
- Imagen de vLLM fijada: `vllm/vllm-openai:nightly-0bfc7a15d095fe83ecc82b50561a93c177fece2d` (commit `0bfc7a15`)
- Ficheros de despliegue incluidos en el repositorio: `serving/patches/0001` a `0007`, `serving/make_overlays.sh`, `serving/serve.sh`, `serving/kernel/` (fuente, `build.py`/`build.sh` y `osc_w6.so` precompilado) y `quantize/build_w6_group.py`
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
