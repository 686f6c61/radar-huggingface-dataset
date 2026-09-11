# thoddnn/Qwen3.8-Flash-Next-4bit

## Resumen

`thoddnn/Qwen3.8-Flash-Next-4bit` es una conversion a 4 bits en formato MLX del modelo multimodal `Qwen/Qwen3.8-Flash-Next`, publicada por el usuario thoddnn. Se trata de un repositorio derivado, no de un modelo entrenado desde cero: su aportacion consiste en empaquetar los pesos del modelo original en cuantizacion de 4 bits con tamano de grupo 32, de forma que puedan ejecutarse con la libreria MLX sobre silicio de Apple.

El modelo base es un sistema image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto, y pertenece a la familia identificada en los metadatos como `qwen4_exp`. El checkpoint convertido declara 177.392.830.611 parametros totales y ocupa 111,5 GB en el repositorio de HuggingFace.

Su relevancia es fundamentalmente practica: la model card documenta que varias conversiones MLX publicadas antes del merge del PR #2032 de `mlx-vlm` plegaron por error el desplazamiento `1 + w` de las capas `Qwen4ExpRMSNorm` dentro de los pesos guardados, lo que provocaba que al cargarlas se aplicase el sesgo dos veces y la generacion degenerase en ruido. Esta conversion afirma estar hecha con el conversor corregido y verificar que los tensores de normalizacion son identicos bit a bit a los del modelo en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia identificada en metadatos como `qwen4_exp`; incluye capas de normalizacion `Qwen4ExpRMSNorm`, embeddings n-gram PLE y, segun el ejemplo de la model card, atencion dispersa en el modelo base) |
| Parametros totales | 177.392.830.611 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, tamano de grupo 32 (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, libreria `mlx`; requiere `mlx-vlm` posterior al PR #2032) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento del modelo base `Qwen/Qwen3.8-Flash-Next`: la model card proporcionada no detalla numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico documentado es la arquitectura de cuantizacion aplicada en esta conversion. El repositorio es una conversion de pesos, no un reentrenamiento: los pesos proceden del checkpoint bf16 original y se comprimen a 4 bits con grupo de 32.

Los elementos tecnicos concretos que si aparecen documentados son los siguientes. En primer lugar, la conversion se realizo con `mlx-vlm` en su rama `main` posterior al PR #2032, en el commit `d1bd74ed`, con tamano de grupo 32; la model card indica que ese tamano de grupo es necesario para poder cuantizar las dimensiones del embedding n-gram PLE. En segundo lugar, la model card describe el problema de las conversiones defectuosas: `Qwen4ExpRMSNorm` aplica `1 + w` sobre ganancias de normalizacion que el checkpoint original almacena centradas en cero, igual que `Qwen4ExpTextRMSNorm` en el codigo upstream; los conversores que plegaron ese `+1` en los pesos guardados provocan que la carga aplique el desplazamiento dos veces. La firma de ese error es un centro de ganancia cercano a `+1,15` en lugar de `+0,22`.

El autor publica una verificacion de la conversion frente a la fuente en bf16:

| Comprobacion | Resultado |
|---|---|
| Integridad de la fuente | 131/131 shards, bytes de tensor identicos byte a byte respecto a `index total_size` |
| Centro de ganancia de normalizacion (fuente vs convertido) | `+0,2216` vs `+0,2216`, delta `+0,00000` |
| Tensores de normalizacion identicos bit a bit | 148 / 148 |
| Idempotencia de `sanitize()` | supera la prueba sobre 480 tensores 1-D |
| Generacion | salida coherente con `--temperature 0.0` |

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` de los metadatos.
- Entrada multimodal image-text-to-text: acepta imagenes junto con texto, tal como declara el `pipeline_tag` del repositorio.
- Idiomas: los metadatos solo declaran ingles (`en`); no hay informacion sobre capacidades multilingues del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, decodificacion especulativa): no disponible en la informacion proporcionada.
- Ejecucion local en Apple Silicon mediante MLX, con la ventaja de que el proceso de conversion esta verificado frente a la fuente bf16.

## Casos de uso

- Inferencia local de un modelo multimodal de gran tamano en estaciones de trabajo Apple Silicon: el formato MLX con cuantizacion de 4 bits y grupo 32 permite cargar un checkpoint de 177.392 millones de parametros en memoria unificada, algo inviable con los pesos bf16 originales en hardware de consumo.
- Analisis de documentos con imagenes (facturas, capturas, diagramas) en flujos internos donde no se puede enviar el contenido a una API externa: el modelo acepta entrada image-text-to-text y puede ejecutarse completamente en local.
- Prototipado y evaluacion de cuantizaciones: dado que la model card documenta el fallo del desplazamiento doble en `Qwen4ExpRMSNorm` y aporta una verificacion reproducible, este repositorio sirve como referencia para comprobar si una conversion MLX concreta esta bien construida comparando el centro de ganancia de normalizacion.
- Asistente conversacional de escritorio integrado en aplicaciones macOS mediante `mlx-vlm`: el ejemplo de uso de la model card se reduce a una invocacion de `mlx_vlm.generate` con prompt y `--max-tokens`.
- Generacion de descripciones de imagen y respuestas sobre contenido visual en ingles, aprovechando la etiqueta `image-text-to-text` y el soporte de idioma `en`.
- Reproduccion de resultados y auditoria de conversiones en investigacion: la tabla de verificacion (integridad de shards, identidad bit a bit de 148 tensores de normalizacion, idempotencia de `sanitize()` sobre 480 tensores 1-D) permite auditar el pipeline de conversion frente a la fuente bf16.
- Servicio de generacion de texto en ingles para cargas moderadas en un Mac Studio o MacBook Pro de gama alta, cuando la prioridad es mantener los datos en el dispositivo y no la latencia maxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica tabla de resultados del repositorio corresponde a comprobaciones de integridad de la conversion (descritas en la seccion de arquitectura), no a evaluaciones de calidad del modelo (MMLU, HumanEval, GSM8K u otras). Tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- Peso estimado de los pesos cuantizados: 177.392.830.611 parametros a 4 bits equivalen a unos 88,7 GB de pesos, a los que hay que sumar los tensores que no se cuantizan y la cache KV; el repositorio completo ocupa 111,5 GB.
- VRAM/memoria unificada estimada para inferencia: del orden de 95-110 GB en funcion de la longitud de contexto y del numero de capas cuantizadas. Se recomienda un equipo con 192 GB de memoria unificada o mas para trabajar con margen.
- Hardware compatible: MLX es una libreria para silicio de Apple, por lo que el modelo esta pensado para Mac con chip de la serie M. Configuraciones razonables son Mac Studio con M2 Ultra o M3 Ultra y 192 GB o 256 GB de memoria unificada.
- GPU NVIDIA: no aplicable. Las GPU tipo A100, H100 o RTX 4090 no ejecutan MLX; para CUDA habria que buscar otra conversion del modelo base, que no se documenta aqui.
- GPU de consumo: con 24 GB de VRAM (RTX 4090) no cabe por tamano, y ademas el formato no es compatible. En un MacBook Pro con M4 Max y 128 GB de memoria unificada el modelo quedaria al limite y probablemente requeriria reducir contexto.
- Opciones de despliegue: `mlx-vlm` en su rama `main` posterior al PR #2032 (instalable con `pip install git+https://github.com/Blaizzy/mlx-vlm`) e invocacion mediante `mlx_vlm.generate --model ... --prompt ... --max-tokens ...`. No se documentan otras rutas de despliegue (vLLM, TGI, llama.cpp, Ollama) para este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thoddnn/Qwen3.8-Flash-Next-4bit` | 177.392.830.611 | no disponible | safetensors, MLX 4 bits grupo 32 | no disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.8-Flash-Next` (modelo base) | no disponible | no disponible | bf16 | no disponible | HuggingFace |
| `mlx-community/Qwen3.8-Flash-Next-4bit` (referenciada en el ejemplo de uso de la model card) | no disponible | no disponible | MLX 4 bits | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada. La diferencia documentada entre la conversion de thoddnn y otras conversiones MLX anteriores al PR #2032 es de correccion, no de rendimiento: aquellas aplican dos veces el desplazamiento `1 + w` de `Qwen4ExpRMSNorm` y generan ruido.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no incluye ninguna seccion de sesgos ni de uso responsable.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser una conversion de pesos, hereda el comportamiento del modelo base, sobre el que tampoco se aportan datos.
- Limitacion de idioma: los metadatos declaran unicamente ingles (`en`). El uso en castellano no esta respaldado por la informacion disponible.
- Restricciones de licencia: la licencia aparece como "no disponible". Al ser un modelo derivado de `Qwen/Qwen3.8-Flash-Next`, es imprescindible consultar la licencia del modelo base antes de cualquier uso comercial.
- Compatibilidad estricta de conversor: cargar este checkpoint con una version de `mlx-vlm` anterior al PR #2032 puede producir resultados incorrectos. La model card advierte de que el sintoma del fallo es un centro de ganancia de normalizacion proximo a `+1,15` en lugar de `+0,22`.
- Requisito de tamano de grupo: la conversion usa grupo 32 porque es necesario para cuantizar las dimensiones del embedding n-gram PLE; no se documentan conversiones alternativas con otros tamanos de grupo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de terceros.
- Alcance del hardware: al estar en formato MLX, no es desplegable en infraestructura con GPU NVIDIA, lo que limita su uso en servidores convencionales.
- Contexto maximo, rendimiento en produccion y consumo real de memoria: no disponibles.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relacionada con el modelo; no se han podido incorporar datos adicionales de fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoddnn/Qwen3.8-Flash-Next-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Pull request #2032 de mlx-vlm: https://github.com/Blaizzy/mlx-vlm/pull/2032
- Issue #2041 de mlx-vlm (conversiones con desplazamiento doble): https://github.com/Blaizzy/mlx-vlm/issues/2041
- Conversion alternativa referenciada en la model card: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit
