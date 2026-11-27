# timlikesai/Qwen3.6-35B-A3B-MXFP4

## Resumen

Qwen3.6-35B-A3B-MXFP4 es una cuantización de 4,25 bits en formato MXFP4 del modelo Qwen3.6-35B-A3B, un transformer de tipo mezcla de expertos (MoE) desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión concreta la publica el usuario timlikesai y se construye a partir de la conversión BF16 oficial de ggml-org, aplicando una búsqueda de escalas con ponderación imatrix sobre el corpus wikitext-2. El resultado es un único fichero GGUF de 19,04 GB que reduce a aproximadamente una cuarta parte el peso en memoria respecto al BF16, manteniendo el pipeline multimodal image-text-to-text y la licencia Apache 2.0 del modelo original.

El modelo resuelve el problema de desplegar un MoE de 34.660.610.688 parámetros totales en hardware de consumo. Al ser MoE, solo una fracción de los expertos se activa por token, lo que abarata el coste de cómputo en inferencia frente a un modelo denso del mismo tamaño. La cuantización MXFP4 aplica valores e2m1 con una escala ue8m0 (e8m0) por bloque de 32 valores, siguiendo la especificación de microscaling de OCP, e incluye también los tensores de expertos (`*_exps.weight`, 430 de los 733 tensores totales), de modo que las FFN del MoE toman la misma ruta que las densas.

Su relevancia actual radica en que combina tres piezas poco habituales: cuantización MXFP4 nativa en llama.cpp (a través de un fork con soporte de tipo de fichero dedicado), ponderación imatrix para preservar calidad y una ruta CUDA W4A8 con activaciones FP8 e4m3 y escalas de bloque ue8m0 mediante MMA `kind::mxf8f6f4` en Blackwell (sm_120a, RTX 50). Según las mediciones del autor, esa ruta recupera buena parte de la precisión de activaciones q8_1 a una fracción del coste de prefill.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (transformer MoE, conversión GGUF) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada (las pruebas del autor usan `n_ctx=512` para imatrix y `n_ctx=4096` para perplejidad) |
| Tipos de cuantizacion | MXFP4 (4,25 bpw, valores e2m1 con escala ue8m0 por bloque de 32); KV cache MXFP4 con escalado UOS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`35b-mxfp4-imx.gguf`); incluye `35b.imatrix` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos identificado en los metadatos como `qwen35moe`, con 733 tensores en el fichero cuantizado, de los cuales 430 corresponden a pesos de expertos (`*_exps.weight`). La conversión a GGUF se realizó con `convert_hf_to_gguf.py --outtype bf16 --no-mtp`, por lo que no hay tensores `nextn.*` (multi-token prediction) en el fichero. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

El proceso de cuantización tiene cuatro etapas documentadas: descarga del release original `Qwen/Qwen3.6-35B-A3B` (commit `995ad96eacd98c81ed38be0c5b274b04031597b0`), conversión BF16 por ggml-org, generación de la imatrix con `llama-imatrix` sobre 4894 chunks de `wiki.train.raw` a `n_ctx=512`, `batch_size=2048` y `n_seq=4` (510 entradas registradas), y cuantización final con `llama-quantize --imatrix ... MXFP4`. Las herramientas provienen de llama.cpp `0.5.0-dev` (build 3666, commit `0c666e561`) sobre el fork `timlikesai/llama.cpp#14`, que añade el tipo de fichero MXFP4 denso, la búsqueda de escalas ponderada por imatrix y la ruta de KV cache MXFP4. Los pesos usan búsqueda de escalas OCP con objetivo 4.0; la KV cache MXFP4 usa escalado UOS (`e = ceil(log2(amax/7.25))+127`, MXAttention).

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational` y el pipeline declarado.
- Procesamiento image-text-to-text: el pipeline `image-text-to-text` indica entrada conjunta de imagen y texto.
- Mezcla de expertos con enrutado por token, lo que reduce el cómputo activo por token frente a un denso equivalente.
- Inferencia con KV cache cuantizada en MXFP4, que reduce la memoria del estado de contexto.
- Ruta CUDA W4A8 en Blackwell con activaciones FP8 e4m3 y escalas ue8m0; seleccionable con `GGML_CUDA_MMQ_PREC=q4` (4 bits) o `q8` (q8_1).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un MoE de ~35B en dos GPU de consumo: con 19,04 GB de pesos, el fichero cabe en 2x RTX 5070 Ti (16 GB cada una) y permite servir el modelo con `llama-server -hf timlikesai/Qwen3.6-35B-A3B-MXFP4`, tal como documenta el autor.
- Servicio conversacional con contexto medio: la KV cache MXFP4 reduce la huella de memoria del contexto, lo que permite mantener sesiones multi-turno en `n_ctx=4096` sin agotar VRAM en las GPU objetivo.
- Prototipado de asistentes multimodales: el pipeline image-text-to-text permite construir demos de descripción de imágenes o respuesta a preguntas sobre documentos escaneados, aunque la información disponible no detalla la resolución ni el codificador visual.
- Evaluación de calidad de cuantizaciones: el repositorio incluye la imatrix y los comandos exactos de reproducción, por lo que sirve para comparar KLD y PPL de distintas re-cuantizaciones del mismo base BF16 con `llama-perplexity`.
- Inferencia de alto throughput en prefill: con 5700 t/s en pp4096 sobre 2x RTX 5070 Ti en la ruta W4A8, es adecuado para cargas con prompts largos donde el coste dominante es el prefill.
- Generación interactiva de baja latencia: los 247,1-247,3 t/s en tg128 medidos por el autor permiten respuestas token a token fluidas en un entorno de dos GPU consumer.
- Integración en pipelines con llama.cpp: al ser un GGUF estándar con metadatos documentados (`general.architecture`, `general.file_type = 42`), se puede incorporar en flujos existentes basados en llama.cpp sin conversión adicional.

## Benchmarks y rendimiento

Mediciones del autor sobre 2x RTX 5070 Ti, wikitext-2 test, `n_ctx=4096`, 72 chunks, KLD y PPL contra el BF16 base; throughput con `llama-bench -p 4096 -n 128 -r 5`:

| Nivel de activación | KLD | PPL | same top-p | pp4096 t/s | tg128 t/s |
|---|---:|---:|---:|---:|---:|
| 4-bit (W4A4) | 0,1692 | 6,4741 | 82,615 | 5772 | 247,1 |
| FP8 (W4A8, por defecto) | 0,0681 | 5,9312 | 89,316 | 5700 | 247,3 |
| q8_1 | 0,0656 | 5,9189 | 89,543 | 5249 | 247,1 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para pesos: 19,04 GB en MXFP4 (tamaño exacto del fichero `35b-mxfp4-imx.gguf`); a ello hay que sumar la KV cache y los buffers de cómputo.
- GPU recomendadas: 2x RTX 5070 Ti (16 GB cada una) es la configuración medida por el autor; la ruta W4A8 con `kind::mxf8f6f4` requiere Blackwell (sm_120a, serie RTX 50) y el build del PR #15.
- En consumer GPU: sí, en dos GPU de 16 GB; no cabe en una única GPU de 16 GB solo por pesos (19,04 GB), y en una de 24 GB quedaría muy justo al sumar contexto.
- Opciones de despliegue: `llama-server` y `llama-bench` de llama.cpp (build 3666 o el fork `timlikesai/llama.cpp`); para la ruta FP8/q8_1 se necesita el build del PR #15. Compatibilidad con vLLM, TGI u Ollama: no disponible en la información proporcionada.
- Throughput medido: 5700 t/s en pp4096 y 247,3 t/s en tg128 con activaciones FP8; 5772 t/s y 247,1 t/s con 4 bits; 5249 t/s y 247,1 t/s con q8_1.
- Latencia: no disponible de forma desagregada; el throughput por token en generación es de aproximadamente 247 t/s en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-MXFP4 (este) | 34.660.610.688 totales | no disponible | MXFP4 4,25 bpw, 19,04 GB | Apache 2.0 | GGUF en Hugging Face |
| ggml-org/Qwen3.6-35B-A3B-GGUF (BF16) | 34.660.610.688 totales | no disponible | BF16 | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.6-35B-A3B (original) | 34.660.610.688 totales | no disponible | safetensors (formato original) | Apache 2.0 | Hugging Face |

La comparación se limita al mismo modelo en distintos formatos porque la información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de otros desarrolladores.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad medible: KLD de 0,0681 y PPL de 5,9312 en la ruta W4A8 frente al BF16 base; en W4A4 el KLD sube a 0,1692 y el PPL a 6,4741, con caída del solapamiento top-p a 82,615.
- La ruta de activaciones FP8 y q8_1 depende de un fork no fusionado (`timlikesai/llama.cpp#15`); con el master actual se obtiene la ruta de 4 bits, con peor KLD y PPL.
- El identificador de tipo de fichero (`general.file_type = 42`) fue renombrado en master, por lo que versiones más recientes de `llama-gguf` muestran un número distinto para el mismo fichero; conviene verificar la versión antes de automatizar despliegues.
- El modelo base se convirtió con `--no-mtp`, de modo que no incluye tensores de multi-token prediction; no se puede esperar decodificación especulativa nativa de ese mecanismo.
- La imatrix se calculó únicamente sobre wikitext-2 (`wiki.train.raw`, 4894 chunks), un corpus en inglés de dominio enciclopédico; el sesgo de ese corpus puede afectar a la preservación de calidad en otros dominios o idiomas.
- Idiomas soportados: no disponible; no se debe asumir cobertura multilingüe sin verificación.
- Sesgos conocidos y riesgo de alucinación del modelo original: no disponible en la información proporcionada; aplican los riesgos habituales de un LLM y no hay evaluación específica publicada en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución y las condiciones de la licencia; verificar la cadena de procedencia (Qwen → ggml-org → timlikesai) antes de redistribuir.
- El repositorio tiene 194 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timlikesai/Qwen3.6-35B-A3B-MXFP4
- Modelo base GGUF: https://huggingface.co/ggml-org/Qwen3.6-35B-A3B-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- PR con el tipo de fichero MXFP4, búsqueda de escalas imatrix y KV cache: https://github.com/timlikesai/llama.cpp/pull/14
- PR con la ruta CUDA W4A8 y comparativa completa de los tres niveles de activación: https://github.com/timlikesai/llama.cpp/pull/15
