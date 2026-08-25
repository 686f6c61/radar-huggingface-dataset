# Taykhoom/MosaicBERT-updated

## Resumen

MosaicBERT-updated es una implementación corregida y actualizada del modelo MosaicBERT, publicada por Taykhoom Dalal en Hugging Face. MosaicBERT original fue desarrollado por MosaicML (Portes et al., NeurIPS 2023) como un encoder bidireccional optimizado para un preentrenamiento rápido, y sirvió de base para las decisiones arquitectónicas de los modelos MPT-7B y MPT-30B. Este repositorio no contiene pesos propios, sino únicamente el código del modelo con cuatro correcciones de errores y soporte completo para la selección de implementación de atención (`eager`, `sdpa`, `flash_attention_2`).

El problema que resuelve es la incompatibilidad del kernel Triton de flash attention original, que dejó de funcionar de forma fiable con versiones recientes de PyTorch. La versión actualizada sustituye ese kernel por la librería estándar `flash-attn` y añade soporte para SDPA, manteniendo intacta la arquitectura original (ALiBi, unpadding, FFN con GeGLU y LayerNorm de baja precisión). La verificación de paridad confirma que los estados ocultos y logits son bit a bit idénticos a la ruta eager del MosaicBERT original, con una diferencia máxima de 2.77e-05 entre SDPA y eager.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (post-LN) con ALiBi, GeGLU y unpadding |
| Parametros totales | 137,4 millones (mayor que BERT-base por la matriz de compuerta GLU) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Sin limite duro por ALiBi; asignacion inicial de 512 tokens con crecimiento dinamico |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene codigo, sin pesos) |
| Idiomas soportados | ingles (segun metadatos de Hugging Face) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (no se distribuyen pesos; se cargan desde el checkpoint original `mosaicml/mosaic-bert-base`) |

## Arquitectura y entrenamiento

MosaicBERT-updated mantiene la macroarquitectura de BERT-base con cuatro modificaciones clave: atencion con flash attention empaquetada (QKV), codificacion posicional ALiBi en lugar de embeddings posicionales, FFN con unidades lineales con compuerta (GeGLU) y unpadding (las secuencias se concatenan y procesan sin tokens de padding). La configuracion incluye 12 capas, 12 cabezas de atencion, dimension de embedding 768, dimension oculta del FFN de 3.072 y un vocabulario de 30.528 tokens (30.522 mas padding hasta multiplo de 64). La normalizacion es LayerNorm posterior a cada subcapa (post-LN) con epsilon 1e-12.

El entrenamiento original de MosaicBERT se realizo con secuencias de 128 tokens, aunque la arquitectura no impone un limite duro gracias a ALiBi. Este repositorio no aporta nuevos datos de entrenamiento ni procesos de ajuste; su unica funcion es proporcionar un codigo corregido que permite cargar los pesos del checkpoint original de MosaicBERT con las implementaciones de atencion modernas. Las correcciones incluyen la lectura correcta de `config._attn_implementation`, el casteo de `extended_attention_mask` al dtype de los estados ocultos, la activacion de los flags `_supports_sdpa` y `_supports_flash_attn_2`, y el casteo a `float()` de `alibi_slopes` antes de pasarlos al kernel de flash-attn.

## Capacidades

- Enmascaramiento de tokens (fill-mask) para modelos de lenguaje enmascarados.
- Generacion de representaciones contextuales bidireccionales de alta calidad para tareas de comprension del lenguaje.
- Soporte de atencion con SDPA (PyTorch >= 2.0) y flash attention 2 mediante la libreria `flash-attn`, ademas de la ruta eager clasica.
- Compatible con el ecosistema Transformers de Hugging Face mediante `trust_remote_code=True`.
- Sirve como backend de codigo compartido para otros modelos del mismo autor: DNABERT2, DNABERT-S y mRNABERT.
- Capacidad de procesar secuencias de longitud variable sin padding gracias a la tecnica de unpadding, lo que reduce el coste computacional en lotes con secuencias de distinta longitud.

## Casos de uso

- Investigacion en eficiencia de atencion: el codigo permite reproducir experimentos con ALiBi, GeGLU y unpadding en un entorno moderno, sin los fallos del kernel Triton original. Es util para estudiar el impacto de estas tecnicas en la velocidad de preentrenamiento.
- Sustitucion directa de MosaicBERT en pipelines existentes: cualquier proyecto que use `mosaicml/mosaic-bert-base` puede apuntar a este repositorio como fuente de codigo para obtener compatibilidad con PyTorch 2.7 y CUDA 12.9, manteniendo resultados identicos.
- Base para modelos biologicos: al ser el backend compartido de DNABERT2, DNABERT-S y mRNABERT, sirve como referencia para desarrolladores que trabajen con modelos de lenguaje aplicados a secuencias genomicas o de ARN mensajero.
- Evaluacion de paridad numerica: la verificacion bit a bit documentada lo convierte en un banco de pruebas para validar implementaciones alternativas de atencion (eager vs. SDPA vs. flash attention) en cuanto a diferencias numericas.
- Desarrollo de tecnicas de unpadding: investigadores que quieran implementar o comparar estrategias de procesamiento sin padding pueden usar este codigo como punto de partida.
- Formacion en arquitecturas de encoder eficientes: el codigo comentado y las correcciones documentadas sirven como material didactico para entender los detalles de implementacion de flash attention, ALiBi y GLU en Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio se centra en la correccion de codigo y la verificacion de paridad con el modelo original, no en nuevas metricas de tareas downstream. Para datos de rendimiento del MosaicBERT original, se debe consultar el paper de Portes et al. (NeurIPS 2023) o la documentacion de MosaicML.

## Requisitos de hardware

- El modelo base tiene 137,4 millones de parametros, por lo que cabe en GPUs de consumo con 8-16 GB de VRAM en precision fp16 o bf16.
- Para inferencia con flash attention 2 se requiere una GPU compatible con CUDA y la libreria `flash-attn` instalada. SDPA funciona en cualquier GPU con PyTorch >= 2.0 sin dependencias adicionales.
- La ruta eager pura funciona en CPU, aunque con menor rendimiento.
- Opciones de despliegue: al ser un modelo de codigo, se integra directamente con Transformers. No se mencionan integraciones con vLLM, llama.cpp u Ollama, que estan orientadas a modelos generativos; para un encoder como este, la inferencia se realiza tipicamente con el pipeline de Transformers o con servidores de embeddings.
- La verificacion de paridad se realizo en GPU con PyTorch 2.7 y CUDA 12.9, lo que sugiere que ese entorno es el recomendado para reproducir los resultados documentados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MosaicBERT-updated (este repo) | 137,4 M | Sin limite duro (ALiBi) | BERT + ALiBi + GeGLU + unpadding | Apache 2.0 | Codigo en HF, pesos desde `mosaicml/mosaic-bert-base` |
| MosaicBERT original (`mosaicml/mosaic-bert-base`) | 137,4 M | Sin limite duro (ALiBi) | BERT + ALiBi + GeGLU + unpadding | Apache 2.0 | Pesos y codigo en HF, pero con kernel Triton desactualizado |
| BERT-base | 110 M | 512 tokens | Transformer encoder clasico | Apache 2.0 | Pesos y codigo en HF, ampliamente soportado |

La diferencia principal entre MosaicBERT-updated y el original es la correccion de errores y el soporte de atencion moderna; los pesos son los mismos. Frente a BERT-base, MosaicBERT introduce ALiBi (que permite extrapolacion a secuencias mas largas), GeGLU (que aumenta ligeramente el numero de parametros) y unpadding (que acelera el entrenamiento con lotes de longitudes variables).

## Limitaciones y advertencias

- Este repositorio no contiene pesos; es imprescindible cargar los pesos desde `mosaicml/mosaic-bert-base` o desde otro checkpoint compatible. Sin esa carga, el modelo no es funcional.
- El codigo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar codigo remoto. Se recomienda revisar el contenido antes de usarlo en entornos de produccion.
- La verificacion de paridad se realizo en un entorno especifico (PyTorch 2.7, CUDA 12.9); en otras versiones pueden aparecer diferencias numericas menores.
- El modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas no esta documentado.
- Al ser un encoder enmascarado, no es adecuado para generacion de texto libre ni para tareas de chat o agentes. Su uso se limita a representaciones contextuales y tareas de comprension.
- No se han publicado evaluaciones de sesgos o alucinaciones para este codigo concreto; las limitaciones del MosaicBERT original se trasladan a esta implementacion.
- La licencia Apache 2.0 permite uso comercial, pero los pesos originales de MosaicBERT pueden tener condiciones adicionales; se debe verificar la licencia del checkpoint en `mosaicml/mosaic-bert-base`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Taykhoom/MosaicBERT-updated
- Pagina del proyecto MosaicBERT: https://mosaicbert.github.io/
- Modelo original en Hugging Face: https://huggingface.co/mosaicml/mosaic-bert-base
- Perfil del autor en Hugging Face: https://huggingface.co/Taykhoom
