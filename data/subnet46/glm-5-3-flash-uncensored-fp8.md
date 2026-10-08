# Subnet46/GLM-5.3-Flash-Uncensored-FP8

## Resumen

GLM-5.3-Flash-Uncensored-FP8 es una variante "abliterated" (con la dirección de rechazo eliminada) del modelo zai-org/GLM-5.3-Flash, publicada por el usuario Subnet46 en HuggingFace. El modelo base lo desarrolla Z.ai (Zhipu AI) y es un Mixture-of-Experts (MoE) de 321.323.031.390 parámetros totales (aproximadamente 320B) con unos 18B de parámetros activos por token, atención híbrida (lineal más dispersa), torre nativa de visión y vídeo, cabeza especulativa MTP y una ventana de contexto de 1 millón de tokens. El repositorio ocupa 328,4 GB y se distribuye en formato block-FP8, que es la precisión original con la que Z.ai publica el checkpoint, no una cuantización aplicada por el autor.

La particularidad de esta versión es que la eliminación del mecanismo de rechazo se ha horneado directamente en los shards oficiales de block-FP8: mismos nombres de tensor, mismo dtype, mismas formas y el mismo `model.safetensors.index.json`, de modo que funciona como reemplazo directo (drop-in) del checkpoint original en cualquier stack que ya sirva GLM-5.3-Flash. El autor lo orienta explícitamente a investigación legítima: interpretabilidad, estudio de mecanismos de rechazo, AI safety, red teaming y evaluación de robustez.

Es relevante ahora porque combina tres factores poco habituales: un MoE de escala frontera con contexto de 1M, capacidades multimodales (imagen y vídeo) y function calling, una licencia MIT heredada del modelo base, y la posibilidad de estudiar el comportamiento de un modelo sin alineación de seguridad sin tener que reconstruir el pipeline de abliteración. El propio autor advierte que no debe desplegarse ante usuarios finales sin capas propias de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (`glm5_next`): 45 capas transformer mas 1 cabeza MTP; MoE con atencion hibrida lineal + dispersa y residuales mHC de 4 vias |
| Parametros totales | 321.323.031.390 (segun safetensors) |
| Parametros activos | Aproximadamente 18B por token (MoE top-8; la model card menciona "288E top-8") |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | Block-FP8 como precision nativa del checkpoint. No se han publicado otras cuantizaciones (GGUF, AWQ, GPTQ) en la informacion disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT (heredada del modelo base zai-org/GLM-5.3-Flash) |
| Formato de pesos | safetensors (block-FP8), con `model.safetensors.index.json` identico al del checkpoint original |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE denominado internamente `glm5_next`, con 45 capas transformer mas una capa adicional de prediccion multi-token (MTP). El modelo combina atencion lineal con atencion dispersa, lo que en principio reduce el coste del cache KV en contextos muy largos, y emplea "Manifold-Constrained Hyper-Connections" (mHC) de 4 vias en las conexiones residuales. El enrutado es de tipo top-8 sobre un conjunto de expertos (la model card indica 288E top-8), con aproximadamente 18B de parametros activos sobre un total de 320B. Incorpora ademas una cabeza especulativa MTP, util para decodificacion especulativa y por tanto para mejorar el throughput en inferencia. Dispone de una torre nativa de vision y video, por lo que se registra como modelo image-text-to-text ademas de text-generation.

Sobre el entrenamiento: la informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion en el modelo base. Lo unico documentado es el proceso de abliteracion aplicado por el autor: la direccion de rechazo se ha ortogonalizado fuera del residual stream y el resultado se ha integrado directamente en los shards oficiales de block-FP8, sin cambiar formato, layout de shards ni indice de tensores. No existe, segun el autor, una publicacion upstream en BF16 a partir de la cual derivar, por lo que block-FP8 es la fuente a plena precision tal y como se publica.

## Capacidades

- Generacion de texto y razonamiento: el modelo esta etiquetado con `reasoning` y esta disenado para tareas de razonamiento multi-paso.
- Codigo: etiquetado con `post-training` y `fine-tuning`; el ecosistema asociado (OrcaCode Review) lo presenta como revisador de codigo en produccion. No hay benchmarks de codigo publicados en la informacion disponible.
- Vision y video: torre nativa de vision mas video, con pipeline `image-text-to-text`.
- Function calling / tool calling: soportado explicitamente (etiqueta `function-calling`), lo que permite integracion en agentes y pipelines con herramientas.
- Contexto largo: ventana de 1M tokens, adecuada para documentos extensos, repositorios completos o transcripciones largas.
- Decodificacion especulativa: cabeza MTP integrada, pensada para acelerar la generacion.
- Multilingue: limitado a ingles y chino segun los metadatos de idioma.
- Sin alineacion de seguridad: la abliteracion elimina el comportamiento de rechazo, lo que constituye en si mismo una capacidad buscada en contextos de red teaming y evaluacion de robustez.

## Casos de uso

- Red teaming y evaluacion de robustez: el modelo permite generar intentos adversariales y estudiar como responde una arquitectura MoE de 320B sin capas de rechazo, en entornos aislados y con supervision humana.
- Investigacion en interpretabilidad y mecanismos de rechazo: al ser un drop-in del checkpoint oficial en block-FP8, permite comparar activaciones y representaciones internas entre la version alineada y la abliterada sin cambiar el stack de carga de pesos.
- Generacion de datos sinteticos para clasificadores de seguridad: se puede usar para producir ejemplos etiquetados de contenido problematico que alimenten moderadores y filtros, siempre dentro de un pipeline controlado.
- Analisis de documentos largos y multimodal: con 1M de tokens de contexto y torre de vision, permite procesar informes extensos con figuras, capturas o clips de video en una sola pasada.
- Agentes con tool calling: integrable en flujos de agentes que necesitan invocar APIs, ejecutar busquedas o encadenar pasos de razonamiento multi-turno.
- Revision de codigo automatizada: mediante el harness OrcaCode Review, el modelo puede revisar pull requests, senalar problemas de seguridad y correccion y bloquear merges en funcion de su severidad.
- Investigacion academica sobre alineacion: comparar el comportamiento del modelo base y de la variante abliterada ante las mismas baterias de prompts aporta evidencia sobre la robustez y los limites de las tecnicas de alineacion actuales.
- Evaluacion de infraestructura FP8: sirve como banco de pruebas para medir despliegues block-FP8 a gran escala en vLLM u otros servidores compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una mencion a "98,07% pass@1 en CyberGym Level 1" y "1M de contexto", pero corresponde a OrcaCyber Zero 1.0, un modelo distinto promocionado en el mismo documento, no a GLM-5.3-Flash-Uncensored-FP8. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en block-FP8 ocupan del orden de 321 GB (1 byte por parametro sobre 321.323.031.390 parametros), a los que hay que anadir cache KV, buffers de activaciones y overhead del runtime. Con 1M de contexto la cache KV puede crecer de forma significativa, aunque la atencion hibrida lineal mas dispersa reduce ese coste respecto a un transformer denso equivalente.
- GPU recomendadas: no cabe en ninguna GPU de consumo. Se necesitan configuraciones multi-GPU de centro de datos: por ejemplo, 4x H200 (141 GB) o 8x H100 80 GB para cubrir pesos mas margen operativo. Una sola H100 de 80 GB o A100 de 80 GB es insuficiente.
- GPU de consumo: no cabe. Ni RTX 4090 (24 GB), ni RTX 5090, ni configuraciones multi-GPU de consumo razonables pueden alojar 321 GB de pesos FP8.
- Opciones de despliegue: al ser un checkpoint block-FP8 con layout identico al oficial, los candidatos naturales son servidores con soporte de FP8 nativo (vLLM, SGLang) y el propio `transformers` con `Glm5NextForConditionalGeneration`. No hay formatos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables sin una conversion previa. No se confirma soporte en TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Vision | Licencia | Alineacion de seguridad | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-Uncensored-FP8 | 321.323.031.390 / aprox. 18B | 1M tokens | Si (imagen y video) | MIT | Eliminada (abliterated) | HuggingFace, block-FP8 |
| zai-org/GLM-5.3-Flash (modelo base) | 320B / aprox. 18B (misma arquitectura) | 1M tokens | Si (imagen y video) | MIT | Alineado | HuggingFace, block-FP8 |
| Otras alternativas MoE de escala similar | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion con modelos de otros fabricantes no puede completarse con rigor porque la informacion proporcionada no incluye especificaciones ni resultados de evaluacion de terceros. La unica comparacion verificable es contra el modelo base, del que esta variante se diferencia exclusivamente en la eliminacion del mecanismo de rechazo, manteniendo arquitectura, tamano, contexto, precision y licencia.

## Limitaciones y advertencias

- Ausencia de guardarrailes: la abliteracion elimina sustancialmente la alineacion de seguridad. El modelo cumplira peticiones daninas, poco eticas, ofensivas o ilegales que el modelo original rechazaria.
- Responsabilidad legal del usuario: el autor declina toda responsabilidad sobre el uso y las salidas del modelo. No debe desplegarse ante usuarios finales ni en produccion sin capas propias de moderacion y prevencion de abuso.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion para esta variante; al ser un ajuste sobre un modelo base sin evaluacion publica disponible, el riesgo no puede cuantificarse.
- Degradacion potencial de capacidades: la abliteracion puede afectar al rendimiento general en tareas que dependen de la alineacion; no se han publicado evaluaciones comparativas frente al modelo base.
- Idiomas: solo se declaran ingles y chino. No hay soporte declarado de castellano ni de otros idiomas.
- Contexto: aunque se anuncian 1M de tokens, no se han publicado resultados de evaluacion en contextos largos (por ejemplo, pruebas tipo needle-in-a-haystack) para esta variante.
- Restricciones de licencia: la licencia MIT del modelo base permite uso comercial, pero el propio autor desaconseja explicitamente el despliegue en produccion sin controles adicionales. Ademas, el uso debe cumplir la legislacion aplicable en la jurisdiccion del usuario.
- Requisitos de infraestructura: 321 GB de pesos en FP8 implican costes de despliegue elevados y excluyen cualquier hardware de consumo.
- Trazabilidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no cuenta con validacion independiente ni resultados de terceros.
- Contenido promocional: la model card incluye promociones de OrcaRouter y de modelos ajenos (OrcaCyber Zero 1.0), por lo que conviene distinguir esa informacion de las especificaciones reales del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Subnet46/GLM-5.3-Flash-Uncensored-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Licencia MIT: https://opensource.org/license/mit
- OrcaRouter (sitio del uploader): https://www.orcarouter.ai
- Catalogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- OrcaCyber Zero 1.0 (promocionado en la model card, no relacionado con este checkpoint): https://www.orcarouter.ai/models/orca/orcacyber-zero-1.0
- Repositorio OrcaCode Review: https://github.com/Continuum-AI-Corp/Orca-Code-Review
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter
- Resultados de busqueda web: la busqueda no devolvio enlaces relevantes sobre el modelo; los resultados obtenidos correspondian a servicios de correo temporal y no guardan relacion con GLM-5.3-Flash-Uncensored-FP8.
