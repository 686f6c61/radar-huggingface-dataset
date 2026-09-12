# TULLUS/RDT2-VQ

## Resumen

RDT2-VQ es un modelo Vision-Language-Action (VLA) autoregresivo desarrollado dentro del proyecto RDT (Robotics Diffusion Transformer) y publicado en HuggingFace por el usuario TULLUS. Está construido a partir del backbone multimodal Qwen2.5-VL-7B-Instruct y entrenado con datos de manipulación bimanual a gran escala recogidos con el gripper UMI. Su función no es conversacional: dado un par de imágenes RGB de cámaras de muñeca (derecha e izquierda) y una instrucción corta en lenguaje natural, predice un chunk de acciones relativas de horizonte corto (24 pasos temporales, 20 dimensiones por paso) que un robot bimanual puede ejecutar directamente.

La innovación principal es la representación de acciones: en lugar de generar acciones continuas con difusión o regresión, RDT2-VQ discretiza el chunk de acción con un tokenizador Residual VQ (RVQ) ligero, de modo que el modelo reutiliza el mecanismo autoregresivo del transformer para emitir tokens de acción. Esto permite un entrenamiento estable y, según el autor, una transferencia zero-shot razonable a morfologías no vistas para habilidades simples y de vocabulario abierto (pick, place, shake, wipe), demostrada en montajes bimanuales con UR5e y Franka Research 3.

El modelo tiene 8.292.166.656 parámetros (unos 8,29 mil millones, por encima de los 7B del backbone debido a la torre de visión y las cabezas de acción), ocupa 16,6 GB en el repositorio en formato safetensors y se distribuye bajo licencia Apache 2.0. Es relevante ahora porque ataca uno de los cuellos de botella clásicos de la robótica aprendida: la falta de generalización entre robots distintos, apoyándose en 10.000+ horas de datos UMI recogidos en más de 100 escenas interiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action autoregresiva sobre transformer multimodal; backbone Qwen2.5-VL-7B-Instruct con tokenizador de acciones Residual VQ (RVQ) |
| Parametros totales | 8.292.166.656 (8,29 B aprox.) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del backbone, no especificada en la model card) |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ, etc.). El codigo de ejemplo usa bfloat16 para el VLM y float32 para el tokenizador RVQ |
| Idiomas soportados | Ingles (instrucciones cortas en formato "Verb + Object") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | robotics |
| Entrada visual | Dos imagenes RGB de camara de muneca (derecha/izquierda), 384x384, con estadisticas tipo JPEG |
| Salida | Chunk de accion de forma (T=24, D=20), deltas relativos, float32 |
| Dimension de la accion | 20 por paso = derecha (10) + izquierda (10): posicion xyz (3), rotacion 6D (6), apertura de gripper (1) |
| Horizonte temporal | 0,8 s a 30 fps (24 frames) |
| Tamano del repositorio | 16,6 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion (segun HuggingFace) | 2026-09-11 |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |

## Arquitectura y entrenamiento

RDT2-VQ es un modelo denso de tipo transformer multimodal que reutiliza el backbone de Qwen2.5-VL-7B-Instruct (torre de vision mas decodificador de lenguaje) y lo adapta a la prediccion de acciones. La observacion consiste en dos imagenes RGB de 384x384 procedentes de camaras de muneca, mas una instruccion textual imperativa corta; el modelo genera de forma autoregresiva una secuencia fija de tokens de accion que un decodificador RVQ convierte en el chunk de 24x20 valores continuos. La accion se representa en deltas relativos siguiendo la convencion UMI, con posicion xyz, rotacion en representacion 6D y apertura de gripper por cada brazo.

La pieza tecnica diferenciadora es el tokenizador Residual VQ (`RVQActionTokenizer`, implementado como `MultiVQVAE`), que comprime el chunk de accion en un numero fijo de codigos discretos y estables. Ese enfoque evita las cabezas de difusion o de regresion continua y permite que toda la capacidad del VLM se reutilice tal cual para el razonamiento visuo-linguistico. El pipeline requiere ademas un `LinearNormalizer` concreto (`umi_normalizer_wo_downsample_indentity_rot.pt`) para escalar las acciones segun la convencion UMI, y el autor recomienda aplicar compresion JPEG a las imagenes de entrada porque el modelo se entreno mayoritariamente con imagenes con esas estadisticas.

En cuanto a los datos, la model card indica que el modelo se entreno sobre manipulacion bimanual a gran escala con el gripper UMI: mas de 10.000 horas de datos de manipulacion humana y mas de 100 escenas interiores. No se especifica el numero exacto de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. La model card tampoco documenta una receta de post-entrenamiento mas alla del ajuste supervisado sobre datos UMI.

## Capacidades

- Prediccion de chunks de accion bimanual: genera un tensor (24, 20) de acciones relativas a partir de dos imagenes de muneca y una instruccion textual, equivalente a 0,8 s de trayectoria a 30 fps.
- Seguimiento de instrucciones de vocabulario abierto: acepta ordenes cortas en ingles con formato recomendado "Verb + Object." (por ejemplo, "Pick up the apple."), lo que permite cubrir habilidades simples sin entrenamiento especifico por tarea.
- Transferencia zero-shot entre morfologias: el autor reporta funcionamiento sin ajuste adicional en montajes bimanuales UR5e y Franka Research 3, con la condicion de calibrar correctamente el hardware.
- Percepcion visual estereoscopica: consume simultaneamente la camara de muneca derecha y la izquierda, lo que le permite razonar sobre geometria y coordinacion entre brazos.
- Habilidades simples demostradas: pick, place, shake y wipe.
- Inferencia por lotes: la utilidad de referencia `batch_predict_action` acepta una lista de ejemplos, pensada para evaluacion de politicas en paralelo.
- Integracion con el ecosistema transformers: compatible con `AutoProcessor`, `Qwen2_5_VLForConditionalGeneration`, `flash_attention_2` y pesos safetensors.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Modo de razonamiento explicito (thinking), audio o generacion de codigo orientada a agente: no documentado; el modelo esta especializado en control robotico.

## Casos de uso

- Manipulacion bimanual zero-shot en laboratorio de robotica: cargar el modelo sobre Qwen2.5-VL-7B-Instruct, conectar dos camaras de muneca a 384x384 y ejecutar un bucle de control que consuma el chunk de 24x20 como deltas relativos. Es el escenario para el que el autor aporta evidencia directa en UR5e y Franka Research 3.
- Recogida y colocacion en entornos de almacen: con instrucciones del tipo "Place the box on the shelf.", el modelo cubre tareas de pick and place sin entrenamiento por referencia, apoyandose en el vocabulario abierto del backbone.
- Tareas de limpieza y frotado: habilidades como wipe o shake estan explicitamente mencionadas, utiles en robotica de servicios o mantenimiento industrial.
- Fine-tuning con datos propios de un robot concreto: el autor documenta ajuste con LoRA a partir de 32 GB de VRAM (A100 40GB), lo que permite especializar el modelo en una celda de trabajo concreta sin reentrenar el backbone completo.
- Base para pipelines de investigacion en VLA: sirve como referencia reproducible de representacion de acciones discretizada con RVQ, comparando contra enfoques de difusion o regresion continua en el mismo backbone.
- Recoleccion y explotacion de datasets tipo UMI: dado que el modelo se entrena con datos del gripper UMI, encaja en flujos donde un operador humano recoge demostraciones y despues se despliegan politicas sobre robots reales.
- Evaluacion de generalizacion cross-embodiment: laboratorios que quieran medir la degradacion de una politica al cambiar de brazo robotico pueden usarlo como punto de partida y comparar con politicas entrenadas por morfologia.
- Automatizacion de tareas repetitivas en linea de montaje ligera: con horizonte de 0,8 s por prediccion, el modelo es apto para control reactivo en tareas de ciclo corto siempre que se gestione la latencia del bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente aporta evidencia cualitativa: transferencia zero-shot demostrada en montajes bimanuales UR5e y Franka Research 3 para habilidades simples de vocabulario abierto (pick, place, shake, wipe). No se proporcionan cifras de tasa de exito, MMLU, HumanEval, GSM8K ni metricas de manipulacion cuantificadas, ni comparaciones numericas con otros modelos VLA.

## Requisitos de hardware

- VRAM para inferencia: 16 GB o mas, segun la tabla del autor. RAM del sistema: 32 GB o mas.
- GPU de ejemplo para inferencia: RTX 4090. Cabe en GPU de consumo con 16 GB o mas de VRAM, siempre que se use bfloat16 y no se cargue el tokenizador RVQ en precision distinta de float32.
- Fine-tuning con LoRA: 32 GB o mas de VRAM (por ejemplo, A100 40GB).
- Fine-tuning completo: 80 GB o mas de VRAM (A100 80GB, H100, B200).
- Sistema operativo probado: Ubuntu 24.04.
- Opciones de despliegue: el modelo se distribuye para la libreria transformers con safetensors y aparece etiquetado como `endpoints_compatible` y `text-generation-inference`, por lo que es desplegable mediante TGI y servicios de inferencia compatibles. No se documentan recetas oficiales para vLLM, llama.cpp u Ollama, ni existen pesos GGUF publicados en la informacion disponible.
- Dependencias adicionales: el pipeline necesita el repositorio de codigo `thu-ml/RDT2`, el tokenizador `robotics-diffusion-transformer/RVQActionTokenizer` y el fichero normalizador UMI; la inferencia se hace con `flash_attention_2`.
- Latencia y throughput: no disponibles. La unica referencia temporal es que cada prediccion cubre 0,8 s de trayectoria a 30 fps.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de accion | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| RDT2-VQ | 8,29 B (denso) | no disponible | Chunk 24x20 relativo, tokens Residual VQ, autoregresivo | Apache 2.0 | Pesos en HuggingFace (repo de 16,6 GB) | Sin benchmarks publicados; evidencia cualitativa zero-shot en UR5e y Franka Research 3 |
| Qwen2.5-VL-7B-Instruct (backbone) | 7 B aprox. (denso) | no disponible en esta ficha | No genera acciones (modelo image-text-to-text) | Apache 2.0 | HuggingFace | No aplicable: es un modelo vision-lenguaje, no una politica |

No se dispone en la informacion proporcionada de cifras verificables de otros modelos VLA comparables (por ejemplo, alternativas basadas en difusion o en regresion continua de acciones). Cualquier comparacion numerica de parametros, contexto, tasa de exito o latencia con esos modelos queda como no disponible.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y etiquetado unicamente para ingles. Las instrucciones en otros idiomas, incluido el castellano, no estan soportadas de forma documentada.
- Formato de instruccion restringido: el autor recomienda el patron "Verbo + Objeto." con mayuscula inicial y punto final. Instrucciones largas, compuestas o ambiguas pueden degradar el comportamiento.
- Horizonte corto: cada prediccion cubre solo 0,8 s de trayectoria (24 pasos a 30 fps). No es un planificador de tareas de largo horizonte por si mismo.
- Dependencia de calibracion de hardware: el propio autor advierte de que el despliegue en robots reales exige configurar y calibrar el efector final, el soporte y la pose de las camaras antes de ejecutar politicas en bucle cerrado.
- Sensibilidad a la compresion de imagen: el modelo se entreno mayoritariamente con imagenes con estadisticas JPEG, y se recomienda activar la compresion JPEG en inferencia para no perder rendimiento.
- Dependencia de artefactos externos: requiere el normalizador `umi_normalizer_wo_downsample_indentity_rot.pt` (notese el error tipografico en el nombre del fichero) y el tokenizador RVQ, ademas del repositorio de codigo. El enlace del normalizador apunta a un servidor academico, lo que es un riesgo de disponibilidad en produccion.
- Ausencia de benchmarks: no hay tasas de exito publicadas ni evaluaciones estandarizadas, por lo que no es posible estimar de antemano el rendimiento en una aplicacion concreta.
- Riesgo de alucinacion: al conservar el decodificador de lenguaje de Qwen2.5-VL, el modelo puede generar tokens de accion incoherentes ante observaciones fuera de distribucion o instrucciones no vistas.
- Sesgos heredados: no se documenta ninguna evaluacion de sesgos del backbone ni de las distribuciones de datos UMI (escenas interiores, tareas de manipulacion humana), lo que puede limitar la generalizacion a entornos industriales, exteriores o morfologias no bimanuales.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero exige conservar los avisos de copyright y licencia y no concede derechos de marca. Al ser un derivado de Qwen2.5-VL-7B-Instruct, conviene revisar tambien las condiciones del modelo base.
- Ambiguedad de identificacion: la ficha consultada corresponde al ID `TULLUS/RDT2-VQ`, mientras que el codigo de ejemplo de la model card carga `robotics-diffusion-transformer/RDT2-VQ`. Conviene verificar cual es el repositorio canonico y su procedencia antes de usarlo en produccion.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TULLUS/RDT2-VQ
- Pagina del proyecto RDT2: https://rdt-robotics.github.io/rdt2/
- Repositorio de codigo: https://github.com/thu-ml/RDT2
- Paper: https://arxiv.org/abs/2602.03310
- Tokenizador RVQ de acciones: https://huggingface.co/robotics-diffusion-transformer/RVQActionTokenizer
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Normalizador UMI (LinearNormalizer): http://ml.cs.tsinghua.edu.cn/~lingxuan/rdt2/umi_normalizer_wo_downsample_indentity_rot.pt
- Discord del proyecto: https://discord.gg/vsZS3zmf9A
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido sobre comparadores de seguros), por lo que no aportan informacion adicional utilizable.
