# Xylolabs/clairic-flash-GGUF

## Resumen

Clairic Flash GGUF es la versión cuantizada en formato GGUF del modelo Cloudflare/clairic-flash, un modelo multimodal de 9B parámetros desarrollado por Cloudflare a partir de un ajuste fino de Qwen3.5-9B. Está diseñado específicamente para extracción estructurada de información: recibe un estado (texto o JSON) y un esquema de campos tipados, y devuelve respuestas estructuradas con valores tipados, listas, nulos, estimaciones y trayectorias de pronóstico, junto con información de confianza y puntuación por campo. La versión GGUF la publica Xylolabs para su uso con llama.cpp, incluyendo el codificador visual para entrada de imágenes.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de extracción estructurada multimodal con cuantizaciones que van desde 3,93 GB (Q2_K) hasta 9,53 GB (Q8_0), con métricas de fidelidad respecto a la inferencia en f32 publicadas por el autor de la cuantización. El modelo base está bajo licencia Apache-2.0, lo que facilita su uso comercial, y su enfoque en salida estructurada con esquemas JSON lo hace adecuado para pipelines de extracción de datos donde la consistencia del formato es crítica.

Es importante señalar que esta versión GGUF no incluye la cabeza de extracción tipada de Cloudflare ni el bloque de predicción multi-token del checkpoint original, por lo que su comportamiento puede diferir del modelo PyTorch de referencia. El modelo se distribuye con el codificador visual en BF16 y una matriz de importancia (imatrix) para las cuantizaciones tipo IQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de llama-server) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, un transformer multimodal que acepta entradas de texto e imagen. Cloudflare lo ha especializado para la tarea de extracción estructurada: dado un estado (texto o JSON) y un mapeo de nombres de campo a especificaciones, el modelo produce valores tipados, listas, nulos, estimaciones y trayectorias de pronóstico. La salida incluye puntuaciones de confianza para la extracción, probabilidades de nulo y, opcionalmente, cuantiles para las estimaciones. El modelo original se ejecuta en PyTorch y Transformers con helpers de petición en Python; la versión GGUF de Xylolabs elimina la cabeza de extracción tipada de Cloudflare y el bloque de predicción multi-token, conservando el codificador visual.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de la versión GGUF indica que las cuantizaciones se generaron con llama.cpp (verificado con el build e4b620af1) y que se incluye una imatrix para las cuantizaciones IQ. El modo de pensamiento (thinking) debe desactivarse en tiempo de ejecución, tal como hace el runtime de Cloudflare.

## Capacidades

- Extracción estructurada de información a partir de texto o JSON y un esquema de campos tipados.
- Generación de valores tipados, listas, nulos, estimaciones numéricas y trayectorias de pronóstico.
- Puntuación por campo: confianza de extracción, probabilidad de nulo y cuantiles opcionales para estimaciones.
- Entrada multimodal: soporte de imágenes mediante el codificador visual incluido (mmproj en BF16).
- Salida estructurada con esquemas JSON: llama.cpp convierte el esquema en una gramática para forzar el formato.
- Soporte de conversación multi-turno (tag "conversational").
- Compatible con endpoints (tag "endpoints_compatible").
- Modo de pensamiento desactivable mediante `--chat-template-kwargs '{"enable_thinking":false}'`.
- No se dispone de información sobre soporte de tool calling o function calling en la documentación proporcionada.

## Casos de uso

- Extracción de datos de facturas y recibos: el modelo recibe la imagen del documento y un esquema de campos (importe, fecha, proveedor, impuestos) y devuelve valores tipados con confianza por campo, lo que permite automatizar la digitalización con validación posterior.
- Procesamiento de formularios escaneados: con entrada de imagen y un esquema JSON, se extraen campos estructurados y se marca la probabilidad de nulo para detectar campos ausentes, facilitando la revisión humana selectiva.
- Enriquecimiento de registros JSON: dado un estado en JSON y un mapeo de campos, el modelo completa valores faltantes, normaliza formatos y devuelve estimaciones con cuantiles para campos numéricos inciertos.
- Pronóstico y estimación numérica: el modelo genera trayectorias de pronóstico y cuantiles opcionales, útil en análisis de series temporales ligeras o estimaciones de demanda a partir de datos tabulares.
- Pipelines de extracción en local con llama.cpp: al ejecutarse con llama-server y `--json-schema`, se integra en servicios que requieren salida validada por gramática sin depender de APIs externas, con cuantizaciones desde 3,93 GB.
- Análisis de documentos con imágenes en entornos con recursos limitados: la cuantización Q4_K_M (5,69 GB) permite desplegar el modelo en una GPU de consumo manteniendo un 94,72% de acuerdo top-1 respecto a f32.
- Automatización de atención al cliente con extracción de entidades: a partir de conversaciones multi-turno, se extraen campos estructurados (producto, incidencia, importe) con probabilidades de nulo para derivar casos incompletos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card de la versión GGUF publica métricas de fidelidad de las cuantizaciones frente a inferencia en f32 sobre pesos BF16, medidas en texto mixto:

| Cuantizacion | Tamano | KL media | Top-1 |
|---|---:|---:|---:|
| Q8_0 | 9,53 GB | 0,0072 | 97,95% |
| Q6_K | 7,37 GB | 0,0132 | 96,94% |
| Q5_K_M | 6,50 GB | 0,0203 | 95,98% |
| Q4_K_M | 5,69 GB | 0,0293 | 94,72% |
| Q4_K_S | 5,37 GB | 0,0507 | 93,13% |
| IQ4_XS | 5,27 GB | 0,0562 | 92,61% |
| Q3_K_M | 4,69 GB | 0,1636 | 87,62% |
| IQ3_M | 4,48 GB | 0,1510 | 87,25% |
| Q2_K | 3,93 GB | 0,1670 | 86,37% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas el codificador visual (0,92 GB) y el contexto. Para Q8_0, unos 10,5 GB; para Q4_K_M, unos 6,6 GB; para Q2_K, unos 4,9 GB, con 32.768 tokens de contexto.
- GPU recomendadas: A100 o H100 para maxima fidelidad (Q8_0) y throughput; RTX 4090 (24 GB) para Q8_0 con contexto completo; RTX 4080/4070 Ti (16 GB) para Q6_K o Q5_K_M; RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, desde Q2_K (3,93 GB) en GPUs de 8 GB, aunque con perdida de fidelidad notable (86,37% top-1); Q4_K_M es el punto de equilibrio recomendado para 12 GB o mas.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli) con `--mmproj` para vision, `--jinja` y `--chat-template-kwargs '{"enable_thinking":false}'`; compatible con endpoints. No se mencionan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Clairic Flash GGUF (esta ficha) | 8,95B | 32.768 | Si (imagen) | Apache-2.0 | GGUF |
| Cloudflare/clairic-flash (original) | 9B | no disponible | Si (imagen) | Apache-2.0 | PyTorch/Transformers |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | no disponible | no disponible | safetensors |
| Cloudflare/clairic (familia) | no disponible | no disponible | no disponible | Apache-2.0 | no disponible |

La comparativa se limita a los modelos citados en la documentacion. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Esta version GGUF no incluye la cabeza de extraccion tipada de Cloudflare ni el bloque de prediccion multi-token del checkpoint original, por lo que el comportamiento puede diferir del modelo PyTorch de referencia.
- El modelo debe ejecutarse con el modo de pensamiento desactivado, tal como hace el runtime de Cloudflare; no hacerlo puede alterar el formato de salida.
- La salida estructurada dependera del esquema proporcionado; sin `response_format` con `json_schema` o `--json-schema`, no se garantiza el formato.
- Las cuantizaciones bajas (Q3_K_M, IQ3_M, Q2_K) muestran una fidelidad notablemente inferior (87,62%, 87,25% y 86,37% top-1), con riesgo de degradacion en tareas de extraccion.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni evaluacion de alucinacion en la documentacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero Xylolabs no esta afiliado ni respaldado por Cloudflare; el archivo NOTICE nombra el modelo fuente y sus titulares de derechos.
- El modelo esta pensado para extraccion y estimacion, no como modelo de proposito general; su uso fuera de ese dominio no esta validado.
- La longitud de contexto de 32.768 tokens es la configurada en el ejemplo de llama-server, no necesariamente el maximo del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/clairic-flash-GGUF
- Modelo base: https://huggingface.co/Cloudflare/clairic-flash
- Modelo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Familia Clairic: https://huggingface.co/Cloudflare/clairic
- Licencia: https://huggingface.co/Xylolabs/clairic-flash-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
