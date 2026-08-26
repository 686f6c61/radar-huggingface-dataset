# Vontra/Qwen3.8-Flash-Next-MLX-8bit-MTP

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de lenguaje y vision de Alibaba, con arquitectura de mezcla de expertos ultra dispersa. Esta ficha describe la conversion a MLX en 8 bits realizada por Vontra, que preserva el bloque nativo de prediccion de siguiente token (MTP) del modelo original para decodificacion especulativa. El modelo combina Gated DeltaNet, atencion dispersa Qwen, capas MoE y embeddings de n-gramas con hash, alcanzando 125.000 millones de parametros totales con solo 6.000 millones activos por token.

La relevancia de esta conversion radica en que permite ejecutar un modelo de esta escala en hardware Apple Silicon mediante el ecosistema MLX, con un rendimiento medido de 24,9 tokens por segundo en un Apple M3 Studio con MTP habilitado. El checkpoint mantiene la ventana de contexto completa de 262.144 tokens y los modulos multimodales en BF16, lo que lo hace util para tareas de vision y lenguaje de largo alcance en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention + MoE) |
| Parametros totales | 56.604.577.459 (safetensors); 125B declarados en el modelo base (incluye 51B de tabla de embeddings n-grama) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8-bit affine uniforme, group size 32; modulos multimodales y puertas MoE en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | MLX safetensors (42 shards, 202,95 GB) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next combina cuatro innovaciones arquitectonicas principales. Tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historico de la conversacion, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperacion precisa de informacion a largo plazo. La pila de lenguaje incluye capas de mezcla de expertos dispersas, flujos residuales gated ensanchados y embeddings de bigramas y trigramas con hash (51B parametros, 20 millones de entradas). El modelo incorpora un bloque nativo de prediccion de siguiente token (MTP) de 4B parametros para decodificacion especulativa.

La conversion de Vontra mantiene la arquitectura original del checkpoint BF16 oficial, aplicando cuantizacion 8-bit affine con group size 32 a los modulos de lenguaje y MTP, mientras conserva en BF16 los modulos multimodales y las puertas del router MoE. El tokenizador, la plantilla de chat, el procesador de vision y la configuracion de generacion se conservan del modelo original. No se dispone de informacion detallada sobre el dataset de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto y razonamiento con ventana de contexto de 262.144 tokens.
- Comprension de imagenes (entrada multimodal) mediante el codificador de vision integrado.
- Razonamiento de largo alcance gracias a la combinacion de Gated DeltaNet y atencion dispersa.
- Decodificacion especulativa nativa mediante el bloque MTP, con una tasa de aceptacion medida del 70,82 %.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes: el modelo puede procesar manuales, informes o articulos cientificos de cientos de paginas, combinando comprension de figuras y tablas con texto de largo alcance, gracias a sus 262.144 tokens de contexto.
- Asistente local de programacion con vision: al ejecutarse en Apple Silicon, permite analizar capturas de pantalla de errores, diagramas de arquitectura o documentacion tecnica, y generar codigo o explicaciones sin enviar datos a la nube.
- Transcripcion y resumen de reuniones con material visual: puede procesar grabaciones transcritas junto con diapositivas o pizarras digitales, generando actas resumidas con referencias a contenido visual.
- Investigacion academica asistida: revision de articulos con graficos y ecuaciones, extrayendo conclusiones y comparando resultados entre multiples fuentes dentro de una misma ventana de contexto.
- Automatizacion de soporte tecnico con contexto largo: gestion de conversaciones multi-turno con historial extenso y capturas de pantalla de errores, manteniendo coherencia durante toda la interaccion.
- Desarrollo de agentes locales de vision-lenguaje: integracion en aplicaciones oMLX que requieran un modelo multimodal ejecutandose en hardware Apple, con la opcion de habilitar o deshabilitar MTP segun las necesidades de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento publicados corresponden a mediciones de generacion de texto en Apple M3 Studio:

| Modo de ejecucion | Velocidad de generacion | Tokens redactados | Aceptados | Tasa de aceptacion |
|---|---|---|---|---|
| MTP deshabilitado | 20,07 tokens/s | No aplica | No aplica | No aplica |
| MTP habilitado (3 tokens de borrador) | 24,90 tokens/s | 1004 | 711 | 70,82 % |

La diferencia de rendimiento con MTP habilitado fue del 24,05 %, con paridad exacta de salida verificada. Los resultados varian segun la longitud del prompt, el estado de la cache, la version del runtime y las condiciones termicas.

## Requisitos de hardware

- VRAM estimada: el peso del checkpoint es de 202,95 GB, por lo que se requiere un Apple Silicon con memoria unificada de al menos 256 GB para cargar el modelo completo en 8 bits.
- GPU recomendadas: Apple M3 Studio (usado en las pruebas), Apple M3 Ultra o M4 Max con 256 GB o mas de memoria unificada.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) debido al tamano del checkpoint.
- Opciones de despliegue: oMLX 0.6.3rc3 o superior, MLX-VLM 0.6.3, MLX 0.32.0. Se requiere soporte explicito de la arquitectura `qwen4_exp` y del modulo MTP nativo.
- Latencia y throughput: 20,07 tokens/s sin MTP y 24,90 tokens/s con MTP en Apple M3 Studio, segun las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16 original) | 125B | 6B | 262.144 | qwen-community-1.0 | safetensors |
| Vontra/Qwen3.8-Flash-Next-MLX-8bit-MTP | 56,6B (cuantizado) | 6B | 262.144 | qwen-community-1.0 | MLX safetensors |
| Vontra/Qwen3.8-Flash-Next-MLX-4bit | no disponible | 6B | 262.144 | qwen-community-1.0 | MLX safetensors |

La comparativa con otros modelos de la misma categoria (por ejemplo, DeepSeek-V3 o Llama 4 MoE) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint requiere un runtime con soporte explicito de `qwen4_exp` y del modulo MTP nativo; un runtime que no construya el modulo MTP puede rechazar los 76 tensores MTP durante la carga estricta.
- La cuantizacion 8-bit puede introducir una degradacion menor en la calidad de generacion respecto al checkpoint BF16 original, aunque no se han publicado evaluaciones comparativas.
- El tamano del checkpoint (203 GB) limita su despliegue a equipos Apple Silicon con gran memoria unificada, excluyendo hardware de consumo convencional.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; se recomienda revisar el texto completo de la licencia antes de su despliegue en produccion.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones idiomaticas especificas del modelo.
- Las mediciones de rendimiento se realizaron en un unico entorno (Apple M3 Studio) y pueden variar significativamente en otros equipos o con cargas de trabajo diferentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-8bit-MTP
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Version 4-bit del mismo autor: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit
- Receta vLLM del modelo: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre el modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
