# YuhengSSS/SDRPN-Qwen2.5-VL-7B

## Resumen

SDRPN-Qwen2.5-VL-7B es un checkpoint de investigacion publicado por YuhengSSS (Shi Yuheng y colaboradores) que implementa la etapa 1 (stage-1) del metodo SD-RPN, un predictor de regiones de interes (RoI) auto-destilado. El modelo parte del backbone congelado Qwen2.5-VL-7B-Instruct y anade tres bloques "twig" entrenados con pseudo-etiquetas de atencion auto-destiladas, sin necesidad de anotacion humana de RoI. Los pesos del backbone no se modifican: solo se entrenan los bloques adicionales.

Se distribuye como una version de inicializacion del proceso de RL a nivel de region denominado Vision-RL², cuyo checkpoint de etapa 2 se publica por separado en YuhengSSS/VisionRL2-Qwen2.5-VL-7B. El interes actual del modelo es acotado y muy especifico: sirve como punto de partida reproducible para entrenamiento por refuerzo de percepcion multimodal de grano fino, y como referencia para investigadores que quieran comparar el efecto de la etapa 2 sobre el mismo backbone.

Se trata de un artefacto de investigacion, no de un modelo listo para produccion: requiere el codigo de modelado del repositorio YuHengsss/VisionRL2 y no es cargable para inferencia de RoI mediante una llamada estandar a AutoModel o AutoModelForCausalLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL) con backbone congelado y tres bloques "twig" de prediccion de RoI (K = 18, T = 3) |
| Parametros totales | 8.991.340.032 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en bfloat16 (sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct (congelado) |
| Tamano del repositorio | 18,0 GB |
| Etapa | stage 1 (entrenamiento SD-RPN con pseudo-etiquetas auto-destiladas) |
| Siguiente etapa | RL a nivel de region: YuhengSSS/VisionRL2-Qwen2.5-VL-7B |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo reutiliza integramente el backbone de Qwen2.5-VL-7B-Instruct, que permanece congelado durante el entrenamiento. Sobre el se acoplan tres bloques "twig" (configuracion K = 18, T = 3) que constituyen un predictor de RoI. La supervision no proviene de anotaciones humanas: se generan pseudo-etiquetas de atencion mediante auto-destilacion, de modo que el twig aprende a predecir regiones relevantes a partir de la propia senal interna del backbone. El entrenamiento de esta etapa esta documentado como inferior a 4 horas para SD-RPN+7B sobre 4 GPU A6000.

La inferencia de RoI no se apoya en las clases estandar de Transformers: la ruta de gating incluye una cabeza de heatmap, una puerta relativa al pico (peak-relative gate), recorte por componentes conectados y empalme de sub-imagenes, todo ello implementado en las clases de modelo y el harness de evaluacion del repositorio VisionRL2. Los papers asociados son "Catching the Details: Self-Distilled RoI Predictors for Fine-Grained MLLM Perception" (SD-RPN, ICLR 2026) y "Region-Level Policy Optimization for Fine-grained MLLM Perception" (Vision-RL²).

## Capacidades

- Prediccion de regiones de interes (RoI) sobre imagenes, orientada a percepcion multimodal de grano fino.
- Generacion de texto e imagen-a-texto heredada del backbone Qwen2.5-VL-7B-Instruct.
- Capacidad conversacional multimodal (etiqueta "conversational" y pipeline image-text-to-text).
- Actua como inicializacion de un proceso de RL a nivel de region (Vision-RL²): no es un modelo final, sino el punto de partida de la etapa 2.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning en la informacion disponible.
- No se documentan capacidades de audio ni modos de "thinking" explicito.
- El soporte multilingue no esta especificado en la informacion proporcionada.

## Casos de uso

- Inicializacion de entrenamiento por refuerzo a nivel de region: el checkpoint se carga como PHASE_A_CKPT en el script scripts/train_rl_qwen2_5vl_7b.sh para arrancar la etapa 2 de Vision-RL², evitando entrenar el predictor de RoI desde cero.
- Investigacion en percepcion de grano fino: permite estudiar como la auto-destilacion de atencion produce pseudo-etiquetas de RoI sin coste de anotacion humana, comparando contra metodos supervisados.
- Evaluacion reproducible con protocolo alineado: mediante scripts/aligned_eval.sh con CAP=576 se puede reproducir la evaluacion de la etapa 1 y verificar la coherencia estructural del checkpoint descargado.
- Analisis de atencion y saliencia visual: la cabeza de heatmap y la puerta relativa al pico permiten inspeccionar que zonas de la imagen activan el modelo, util para diagnostico de fallos en tareas visuales.
- Extraccion de sub-imagenes relevantes en documentos o capturas densas: el pipeline de recorte por componentes conectados y empalme de sub-imagenes sirve para aislar regiones con detalle fino antes de pasarlas a un modelo de descripcion o VQA.
- Base para ablaciones controladas: al compartir backbone con VisionRL2-Qwen2.5-VL-7B y con el Qwen2.5-VL-7B-Instruct original, permite aislar la contribucion del twig frente a la del RL posterior.
- Reproducibilidad de resultados academicos: sirve como referencia para replicar las filas de SD-RPN (etapa 1) publicadas para otros backbones en el README de Vision-RL².

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de este checkpoint en la informacion disponible. La model card indica que el README de Vision-RL² publica la fila "SD-RPN (stage 1)" por benchmark para los backbones Qwen3.5-4B y Gemma-4-12B-it, pero que para Qwen2.5-VL-7B el paper solo reporta el modelo de etapa 2. El unico dato numerico disponible es la media de la tabla principal de Vision-RL² para Qwen2.5-VL-7B, que corresponde al modelo de etapa 2, no a este checkpoint.

| Referencia | Valor | Ambito |
|---|---|---|
| Media tabla principal Vision-RL² (Qwen2.5-VL-7B) | 71,0 | Modelo de etapa 2 (VisionRL2-Qwen2.5-VL-7B), no este checkpoint |
| Fila "SD-RPN (stage 1)" | no disponible para Qwen2.5-VL-7B | Publicada en el README de Vision-RL² para Qwen3.5-4B y Gemma-4-12B-it |
| Benchmarks por tarea (MMLU, HumanEval, GSM8K, etc.) | no disponible | No reportados para este checkpoint |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 16,6 GB (el model.safetensors difiere del base en unos pocos cientos de MB), por lo que se necesitan del orden de 18-24 GB de VRAM contando activaciones.
- GPU recomendadas: A100 (40 o 80 GB), H100 y A6000 (48 GB) son opciones holgadas; una RTX 4090 con 24 GB puede ser suficiente para bfloat16 si se ajusta el tamano de lote y la resolucion de imagen.
- Entrenamiento: la documentacion del proyecto indica menos de 4 horas para SD-RPN+7B sobre 4 GPU A6000, ademas de GPU_IDS=0,1 en el script de RL de la etapa 2.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Es imprescindible clonar el repositorio YuHengsss/VisionRL2 y usar sus clases de modelo y su harness de evaluacion; no es cargable para inferencia de RoI con AutoModel ni AutoModelForCausalLM.
- Latencia y throughput: no disponible.
- Comprobacion estructural tras la descarga: config.json debe contener twig_K: 18 y twig_T: 3, y el total de model.safetensors debe quedar a unos cientos de MB del base Qwen2.5-VL-7B-Instruct (~16,6 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Etapa / funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDRPN-Qwen2.5-VL-7B (este) | 8.991.340.032 | no disponible | Etapa 1: predictor de RoI auto-destilado sobre backbone congelado | apache-2.0 | HuggingFace, 7 descargas, requiere codigo de VisionRL2 |
| YuhengSSS/VisionRL2-Qwen2.5-VL-7B | no disponible | no disponible | Etapa 2: RL a nivel de region; media de tabla principal 71,0 | apache-2.0 | HuggingFace, repositorio de 18 GB |
| Qwen/Qwen2.5-VL-7B-Instruct | no disponible (model.safetensors ~16,6 GB) | no disponible | Backbone base sin modificaciones de RoI; cargable con Transformers estandar | apache-2.0 | HuggingFace, ampliamente desplegado |

## Limitaciones y advertencias

- Es un checkpoint de etapa 1, no un modelo final: su proposito es inicializar el RL de Vision-RL², no resolver tareas de produccion de forma autonoma.
- No es cargable para inferencia de RoI mediante AutoModel ni AutoModelForCausalLM; requiere las clases de modelo y el harness del repositorio VisionRL2 (cabeza de heatmap, puerta relativa al pico, recorte por componentes conectados y empalme de sub-imagenes).
- No se han publicado benchmarks por tarea para este checkpoint concreto; la referencia de 71,0 corresponde al modelo de etapa 2, por lo que no debe atribuirse a estos pesos.
- No se especifican idiomas soportados ni longitud de contexto en la informacion disponible.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ); solo pesos en bfloat16, lo que limita el despliegue en hardware de gama media.
- Riesgo de alucinacion: no evaluado ni documentado para este checkpoint.
- Sesgos conocidos: no documentados; hereda los del backbone Qwen2.5-VL-7B-Instruct, no analizados en la model card.
- Traccion minima en la comunidad: 7 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa independiente.
- Licencia apache-2.0, que permite uso comercial, pero la dependencia de codigo externo del repositorio VisionRL2 debe verificarse por separado antes de un uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YuhengSSS/SDRPN-Qwen2.5-VL-7B
- Modelo de etapa 2 en HuggingFace: https://huggingface.co/YuhengSSS/VisionRL2-Qwen2.5-VL-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Codigo: https://github.com/YuHengsss/VisionRL2
- Repositorio SD-RPN: https://github.com/YuHengsss/SD-RPN
- Repositorio SD-RPN para Qwen2.5-VL: https://github.com/YuHengsss/SD-RPN/tree/master/Qwen2.5-VL
- Dataset: https://huggingface.co/datasets/YuhengSSS/VisionRL2-data
- Coleccion: https://huggingface.co/collections/YuhengSSS/visionrl2
- Pagina del proyecto: https://yuhengsss.github.io/VisionRL2/
- Paper Vision-RL²: https://arxiv.org/abs/2609.19745
- Paper SD-RPN: https://arxiv.org/abs/2509.16944
- Guia de despliegue local de Qwen2.5-VL 7B: https://aiindigo.com/tutorials/getting-started-with-qwen2-5-vl-7b-local-multimodal-inference
