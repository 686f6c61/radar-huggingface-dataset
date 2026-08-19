# unconst/Affine-5czsc2fc98-r558-r252-odpo-midrank-midctx-extra-merged

## Resumen

Affine-5czsc2fc98-r558-r252-odpo-midrank-midctx-extra-merged es un modelo de lenguaje multimodal de 35.107 millones de parametros desarrollado por el usuario unconst, publicado en HuggingFace como un checkpoint de fusion (merge) experimental. Se basa en el modelo kevin954/Affine-5dfqbbh8ev-sft, del que hereda la arquitectura Qwen3.5 MoE con capacidades de procesamiento conjunto de imagen y texto (image-text-to-text). El nombre del repositorio sugiere un proceso de entrenamiento con OD PO (Online Direct Preference Optimization) de rango medio y contexto medio, seguido de una fusion de pesos.

El modelo se presenta como un "salvamento de checkpoint fusionado H1" (H1 merged checkpoint salvage), lo que indica que es un artefacto intermedio de un pipeline de entrenamiento mas amplio, no una version final destinada a produccion. La propia model card advierte que es un "seguro TTL privado" y que "no es una submission hasta que se supere la fase 5" (Stage-5 gate), lo que sugiere que forma parte de un proceso de evaluacion o competicion. Su relevancia radica en que documenta una etapa intermedia de un experimento de alineacion y fusion de modelos sobre la familia Qwen3.5 MoE, de interes para investigadores que siguen el desarrollo de esta linea de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mixture of experts) multimodal |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en FP16/FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo de mezcla de expertos (MoE) de la familia Qwen3.5, con capacidad multimodal que acepta entradas de imagen y texto. El checkpoint se obtiene mediante una fusion de LoRA (Low-Rank Adaptation) sobre el modelo base kevin954/Affine-5dfqbbh8ev-sft, que a su vez es un fine-tuning de la serie Affine. El nombre del repositorio indica que el entrenamiento incluyo una etapa de OD PO (Online Direct Preference Optimization) con ranking medio (midrank) y contexto medio (midctx), seguida de una fusion adicional (extra-merged).

No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento, el numero total de tokens procesados ni las tecnicas de alineacion empleadas mas alla de la mencion a OD PO. El proceso de fusion de LoRA sugiere que se combinaron multiples adaptadores para producir el checkpoint final, una tecnica comun para ensamblar capacidades de distintos fine-tunings. La etiqueta "affine-h1-merged-salvage" indica que es un checkpoint de rescate de una etapa intermedia denominada H1.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation, por lo que puede producir respuestas textuales coherentes en formato dialogico.
- Comprension de imagenes: al incluir el tag image-text-to-text, el modelo acepta entradas visuales junto con texto, lo que permite tareas de captioning, VQA (visual question answering) y razonamiento multimodal.
- Razonamiento con mezcla de expertos: la arquitectura MoE activa selectivamente subconjuntos de parametros por token, lo que puede ofrecer mejor eficiencia computacional que un modelo denso equivalente.
- Soporte para herramientas y agentes: no confirmado explicitamente, aunque la arquitectura base Qwen3.5 suele incluir capacidades de tool calling; no hay evidencia en la informacion disponible.
- Capacidades multilingues: no disponibles; se desconoce el alcance idiomatico del modelo.

## Casos de uso

- Investigacion en alineacion de modelos: el checkpoint documenta una etapa intermedia de un pipeline de OD PO y fusion, util para estudiar el efecto de distintos rangos de ranking y longitudes de contexto en la calidad final del modelo.
- Experimentacion con fusion de LoRA: investigadores que trabajen con tecnicas de merge de adaptadores pueden analizar este checkpoint para entender como combinar multiples LoRA sobre una base comun.
- Prototipado de aplicaciones multimodales: dado su soporte de imagen y texto, puede usarse para construir prototipos de asistentes que describan imagenes o respondan preguntas sobre contenido visual, aunque sin garantias de calidad al ser un checkpoint intermedio.
- Comparacion de etapas de entrenamiento: junto con otros checkpoints de la serie (r158-merged, r4-fullft, h56-merged), permite trazar la evolucion del modelo a lo largo del entrenamiento y estudiar el impacto de cada fase.
- Evaluacion de modelos MoE de 35 B: sirve como punto de referencia para medir el rendimiento de arquitecturas MoE de tamano medio en tareas de generacion y comprension multimodal.
- Despliegue en entornos controlados: puede desplegarse en infraestructura propia para pruebas internas, siempre que se asuma que el rendimiento puede ser inferior al de un modelo final afinado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar en la model card ni en los resultados de busqueda. Al ser un checkpoint intermedio de rescate, es probable que el autor no haya realizado evaluaciones publicas completas.

## Requisitos de hardware

- VRAM estimada: con 35.107 millones de parametros, en FP16 se necesitan aproximadamente 70 GB de VRAM solo para los pesos. Con cuantizacion a 8 bits se reduciria a unos 35 GB, y a 4 bits a unos 18 GB, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: para inferencia en FP16 se requieren multiples GPU o una unica GPU de alta gama como NVIDIA A100 (80 GB) o H100 (80 GB). Con cuantizacion 4 bits cabria en una RTX 4090 (24 GB) o similar.
- Opciones de despliegue: al ser un modelo de transformers con pesos en safetensors, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp si se convierten los pesos a GGUF. FriendliAI ofrece un endpoint de inferencia para un checkpoint hermano (h1-merged), lo que sugiere compatibilidad con servidores de inferencia optimizados.
- Latencia y throughput: no disponibles. Al ser una arquitectura MoE, la latencia depende del numero de expertos activos por token, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Affine-5czsc2fc98-r558-r252 (este) | 35,1 B | no disponible | Si | no disponible | HuggingFace |
| Qwen2.5-VL-32B | 32 B | 32 K | Si | Apache 2.0 | HuggingFace |
| Qwen2.5-32B | 32 B | 32 K | No | Apache 2.0 | HuggingFace |
| Mixtral-8x7B | 46,7 B (MoE) | 32 K | No | Apache 2.0 | HuggingFace |

La comparativa se limita a modelos de tamano similar con los que comparte arquitectura o capacidades. Qwen2.5-VL-32B es la alternativa multimodal mas cercana en tamano, con licencia permisiva y documentacion completa. Mixtral-8x7B es el MoE mas conocido de tamano comparable, aunque sin soporte multimodal. Este checkpoint de Affine carece de la documentacion y el soporte de los modelos comerciales establecidos.

## Limitaciones y advertencias

- Checkpoint intermedio: el propio autor indica que no es una submission final y que forma parte de un proceso con fases pendientes. No se garantiza su calidad ni su comportamiento en tareas reales.
- Licencia no especificada: al no declararse licencia, no esta claro si puede usarse comercialmente. Se recomienda contactar al autor antes de cualquier uso en produccion.
- Sesgos y alucinaciones: al ser un modelo entrenado con OD PO sobre una base no documentada, puede presentar sesgos no mitigados y tendencia a alucinar, especialmente en tareas fuera de su distribucion de entrenamiento.
- Documentacion insuficiente: no se conocen los datos de entrenamiento, el numero de tokens, la composicion del dataset ni las tecnicas de alineacion completas, lo que dificulta evaluar su idoneidad para casos de uso especificos.
- Riesgo de obsolescencia: al ser un checkpoint de rescate, puede quedar desactualizado rapidamente si el autor publica versiones posteriores del pipeline.
- Sin garantias de soporte: el autor no ofrece canal de soporte ni documentacion de uso, y el repositorio tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r558-r252-odpo-midrank-midctx-extra-merged
- Checkpoint hermano r158-merged: https://huggingface.co/unconst/Affine-5czsc2fc98-r158-merged
- Checkpoint hermano r4-fullft: https://huggingface.co/unconst/Affine-5czsc2fc98-r4-fullft
- Discusiones del checkpoint h56-merged: https://huggingface.co/unconst/Affine-5czsc2fc98-h56-merged/discussions
- Pagina de despliegue en FriendliAI (checkpoint h1-merged): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft
