# zhangjiaxin2012/SRF-Jev-Gemma4-26B-A4B-Stage2-Causal-LoRA1024-Think4K-v2

## Resumen

SRF-Jev-Gemma4-26B-A4B-Stage2-Causal-LoRA1024-Think4K-v2 es un checkpoint nativo completo (sin adaptador LoRA que adjuntar ni fusión manual) derivado de `google/gemma-4-26B-A4B-it` mediante un ajuste fino de tipo LoRA causal sobre las capas de atención. Lo publica el autor independiente `zhangjiaxin2012` dentro de su línea de investigación "SRF Jev", orientada a medir y mejorar la calibración de las decisiones de un modelo, no solo su precisión de respuesta. El checkpoint corresponde a la etapa 2 del entrenamiento, con 1.024 actualizaciones, y se distribuye como instantánea de investigación: el propio autor advierte de que no es un ganador final de la v2 ni una publicación SOTA oficial.

El modelo conserva la arquitectura nativa `Gemma4ForConditionalGeneration` del base de Google, con 25.805.933.872 parámetros totales (~25,8B) y nomenclatura "26B-A4B", lo que implica una arquitectura de mezcla de expertos con aproximadamente 4B de parámetros activos por token (la cifra exacta de activos no se detalla en la información disponible). El base es multimodal, con entrada de texto e imagen y salida de texto, y está ajustado para instrucciones. El resultado del ajuste se evalúa sobre un panel interno de 231 preguntas denominado Public231, con dos políticas de inferencia: respuesta directa y "thinking" con puerta de hasta 4.096 tokens.

Su relevancia es metodológica más que de producto: el checkpoint demuestra una receta de inferencia con puerta de razonamiento basada en la probabilidad de la primera opción (`max(p0)<0.9`), reintegración de análisis en JSON y mezcla calibrada de probabilidades, que eleva la precisión en Public231 del 83,12% (directa) al 96,54% (thinking con puerta) y mejora el Brier score de 0,223 a 0,070. No hay resultados de benchmarks estándar publicados (MMLU, GSM8K, HumanEval) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Gemma4ForConditionalGeneration` (base MoE por nomenclatura A4B), ajuste LoRA causal sobre atención |
| Parámetros totales | 25.805.933.872 (~25,8B) |
| Parámetros activos | ~4B según la denominación "A4B"; cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; publicación sin conversión de dtype ni cuantización, inferencia medida en BF16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model*.safetensors`) con config, index y tokenizer nativos |

## Arquitectura y entrenamiento

La arquitectura es la nativa de Gemma 4 en su variante 26B-A4B: un transformer decoder con mezcla de expertos (la nomenclatura "A4B" indica ~4B de parámetros activos por token sobre ~26B totales) y capacidad multimodal, ya que el pipeline declarado combina `text-generation` con `image-text-to-text`. El ajuste se realizó sobre el checkpoint instruction-tuned de Google fijado en el commit `4d7ae4984b7db7de8f8457170b3f1a419ee76d52`, y el artefacto publicado es un export nativo fusionado en el que "todos los bytes de los tensores nativos coinciden con el artefacto de entrenamiento completado", sin conversión de dtype ni cuantización durante la publicación.

El entrenamiento de etapa 2 consistió en un LoRA causal sobre atención de rango 32 y alpha 64, con 1.024 actualizaciones, microbatch de 4, AdamW en FP32 con tasa de aprendizaje 1e-5, un 25% de repetición (replay) de la etapa 1 y semilla 733. El autor indica que el entrenamiento de decisión de etapa 2 usa prompts de decisión con el modo thinking desactivado, aunque los pesos resultantes soportan tanto la política directa como la de thinking con puerta de 4K. No se publican estados del optimizador, registros de entrenamiento, etiquetas ni logs internos, y no hay información disponible sobre volumen de tokens, composición del dataset ni uso de RLHF/DPO en esta etapa.

La innovación destacable no está en la arquitectura sino en el sistema de servicio reportado: la política "Gated 4K thinking" activa el thinking nativo solo cuando `max(p0)<0.9`, permite hasta 4.096 tokens y después aplica una mezcla `0.25*p0+0.75*p1` tras reintegrar el análisis en JSON, con calibración posterior identidad. Los IDs de ejemplo determinan la permutación de opciones ciega a la etiqueta y la semilla del thinking, de modo que la reproducibilidad depende del runner de decisión suministrado y no de un prompt de chat genérico.

## Capacidades

- Generación de texto conversacional en inglés, con base instruction-tuned.
- Entrada de imagen además de texto (etiqueta `image-text-to-text` en el modelo base), con salida de texto.
- Salida de decisiones probabilísticas sobre opciones con identificadores semánticos, en esquemas tipo Choice, NoUL y Score, junto con la opción seleccionada y recuentos reales de tokens.
- Modo "thinking" opcional con presupuesto controlado de hasta 4.096 tokens y activación condicionada por umbral de confianza.
- Razonamiento multi-paso dentro del bloque de thinking, con reintegración del análisis previo en formato JSON.
- Calibración explícita: el modelo reporta probabilidades, NLL y Brier score, no solo la respuesta elegida.
- No se documenta soporte de tool calling / function calling, agentes, audio ni otras modalidades distintas de texto e imagen en la información disponible.
- Multilingüismo limitado: la model card declara únicamente inglés.

## Casos de uso

- Investigación sobre calibración de modelos: el checkpoint expone probabilidades por opción y métricas NLL/Brier, por lo que se puede usar como banco de pruebas para comparar técnicas de calibración posterior y de mezcla de distribuciones con etiquetas separadas del fichero de entrada.
- Enrutado de decisiones con umbral de confianza: en un clasificador de opción múltiple se puede activar el razonamiento largo solo cuando `max(p0)<0.9`, reduciendo el coste medio de tokens en los casos que el modelo ya resuelve con alta probabilidad.
- Evaluación comparativa de políticas de inferencia: el mismo artefacto sirve para medir la diferencia entre `--policy direct` y `--policy autothink4096`, útil para estudiar la relación entre coste de razonamiento y precisión.
- Procesamiento de documentos con componente visual: al heredar la entrada de imagen del base, puede emplearse en prototipos de interpretación de capturas, formularios o diagramas cuyo resultado sea una elección entre opciones o una puntuación.
- Puntuación automática y ranking de respuestas: el esquema Score permite obtener una puntuación numérica por candidato, aplicable a la selección de respuestas en pipelines de generación aumentada.
- Reproducción de experimentos con trazabilidad estricta: el flujo documentado admite `--revision <commit inmutable>` y `--verify-weights` para fijar el artefacto y verificar cada fragmento descargado antes de cargarlo.
- Desarrollo de herramientas de evaluación internas: el runner suministrado (`predict.py`) con entrada JSONL de campos `id` y `visible` y salida con IDs semánticos y probabilidades facilita construir arneses de evaluación propios sin depender de prompts de chat.
- Prototipado de asistentes en inglés con contexto visual, siempre que se asuma que un prompt conversacional genérico no reproduce la tabla de decisiones reportada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. El autor solo reporta el panel interno Public231, de desarrollo adaptativo y con costes de razonamiento distintos entre políticas, y advierte explícitamente de que no son puntuaciones oficiales de leaderboard.

| Política | Correctas /231 | Precisión | Intelligence | Calibración | Capability | NLL ↓ | Brier ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Direct | 192 | 83,12% | 57,81 | 79,76 | 68,78 | 0,431757 | 0,223375 |
| Gated 4K thinking | 223 | 96,54% | 89,30 | 87,03 | 88,16 | 0,180853 | 0,070325 |

Notas: Capability = (Intelligence + Calibración) / 2 y es distinto de la precisión de respuesta. En la política directa el modelo genera cero tokens de razonamiento. La etiqueta "v2" del nombre identifica la receta de inferencia reportada, no una versión ganadora del ciclo de investigación.

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 51,6 GB, en línea con los ~25,8B parámetros en bfloat16. Se necesita al menos ese espacio en VRAM o en memoria unificada, más KV cache y activaciones.
- GPU recomendadas: el autor cita una configuración de referencia con una H200; una H100 de 80 GB o una A100 de 80 GB cubren el modelo en BF16 en un solo dispositivo. No cabe en GPUs de consumo de 24 GB en BF16.
- GPU de consumo: no viable en BF16 con 16-24 GB. Una cuantización a 4 bits en teoría rondaría los 13-16 GB, pero el autor indica que los backends cuantizados y multi-GPU son configuraciones de evaluación separadas y no validadas para este artefacto.
- Despliegue: el flujo oficial usa `huggingface_hub==1.5.0`, PyTorch 2.6.0 con build CUDA, `transformers` 5.17.0 con `dtype=torch.bfloat16` y `attn_implementation="sdpa"`, y un único dispositivo CUDA con SDPA en modo math. El entrenamiento y la evaluación se han probado con el runner `predict.py` incluido en el repositorio.
- No hay datos de latencia ni throughput publicados en la información disponible.
- La clase nativa de `config.json` puede cargarse directamente con Transformers 5.17.0, pero los prompts de chat genéricos no reproducen la tabla de decisiones: para eso hay que usar el runner y la política suministrados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Public231 Capability | Disponibilidad |
|---|---|---|---|---|---|---|
| SRF-Jev-Gemma4-26B-A4B-Stage2-Causal-LoRA1024-Think4K-v2 | 25,8B totales / ~4B activos | no disponible | safetensors (checkpoint fusionado) | apache-2.0 | 68,78 directa / 88,16 gated 4K | HuggingFace, 0 descargas |
| google/gemma-4-26B-A4B-it (base) | 26B / ~4B activos | no disponible | safetensors | no disponible en la información | no disponible | HuggingFace y Google Cloud |
| SRF-Jev-Gemma4-26B-A4B-LoRA (adaptador v1) | adaptador sobre el mismo base | no disponible | LoRA + calibración de decisión | no disponible en la información | descrito como la configuración de mayor Capability observada en la instantánea del 19-10-2026; cifra no disponible | HuggingFace y endpoint FriendliAI |

No se dispone de datos de benchmarks estándar ni de especificaciones de contexto para establecer comparaciones cuantitativas con alternativas de otros fabricantes de tamaño similar.

## Limitaciones y advertencias

- Instantánea de investigación: el autor declara que no es un ganador final de la v2 ni una publicación SOTA oficial, y que las ablaciones heredadas están nombradas explícitamente.
- Reproducibilidad dependiente del runner: prompt, mapeo de opciones, presupuesto de razonamiento y política forman parte del sistema de servicio reportado; un prompt de chat genérico no reproduce la tabla de decisiones ni las métricas.
- Etiquetas y registros no publicados: no se distribuyen etiquetas, estados del optimizador, registros de entrenamiento/evaluación ni sondas internas, por lo que la verificación independiente de Public231 es limitada.
- Public231 es un panel de desarrollo adaptativo con costes de razonamiento distintos entre checkpoints; sus cifras no equivalen a puntuaciones de leaderboard y no son directamente comparables con otros modelos.
- Idioma: solo inglés declarado, lo que excluye su uso directo en castellano sin un ajuste adicional.
- Contexto y cuantización sin especificar: no se documenta la ventana de contexto ni se ha validado la inferencia cuantizada o multi-GPU para este artefacto.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, seguridad ni tasas de alucinación en la información disponible; al ser un ajuste de investigación sobre un base instruction-tuned, estos riesgos se heredan sin cuantificar.
- Licencia: la model card declara apache-2.0 para este derivado, pero conviene revisar los términos aplicables al modelo base de Google antes de un despliegue comercial.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta, y un único autor mantenedor; no hay historial de soporte ni garantías de mantenimiento.
- El modelo se distribuye con código de inferencia propio y ejemplos; los resultados de los distintos esquemas (Choice, NoUL, Score) dependen de mantener estables los IDs entre políticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhangjiaxin2012/SRF-Jev-Gemma4-26B-A4B-Stage2-Causal-LoRA1024-Think4K-v2
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Documentación de comparación y método (tres tamaños, 23-10-2026): https://github.com/jxzhangjhu/srf-jev/tree/main/docs/gemma4/research/three-size-20261023
- Repositorio del proyecto SRF Jev: https://github.com/jxzhangjhu/srf-jev
- Adaptador LoRA v1 de la misma familia: https://huggingface.co/zhangjiaxin2012/SRF-Jev-Gemma4-26B-A4B-LoRA
- Space de resultados: https://huggingface.co/spaces/zhangjiaxin2012/SRF-Jev-Gemma4-Results
- Endpoint de inferencia FriendliAI para el LoRA v1: https://friendli.ai/models/zhangjiaxin2012/SRF-Jev-Gemma4-26B-A4B-LoRA
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 26B A4B IT en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
