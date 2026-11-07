# Vishva007/d1-3B-W4A16-AutoRound

## Resumen

d1-3B-W4A16-AutoRound es una version cuantizada a 4 bits del modelo LiquidAI/d1-3B, un modelo de decision multimodal construido sobre LFM2.5-VL-3B y desarrollado por Liquid AI. A diferencia de los modelos generativos convencionales, d1-3B evalua estados (texto, imagenes o JSON) contra preguntas tipadas en un unico pase hacia adelante, sin generar tokens autorregresivos de salida. Esta cuantizacion, publicada por el usuario Vishva007, aplica AutoRound en configuracion W4A16 para reducir la huella de memoria manteniendo el torre de vision en precision completa.

El interes de esta version radica en su orientacion a despliegues en el borde (edge) y a tareas de clasificacion y enrutamiento de baja latencia. Al eliminar la generacion autorregresiva, el coste de inferencia se reduce a un unico forward pass, lo que resulta adecuado para triaje, deteccion de intencion, moderacion de contenido y guardas de seguridad en agentes. El modelo base declara 1.078.637.808 parametros reales en safetensors, un tamano contenido que facilita su ejecucion en GPUs de consumo.

La licencia es lfm1.0 (marcada como "other" en Hugging Face), con soporte para 16 idiomas y una ventana de contexto que no se especifica en la informacion disponible. El repositorio ocupa 2,8 GB e incluye pesos en safetensors compatibles con transformers y con los backends auto_round y AutoGPTQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5-VL (multimodal, vision-lenguaje) con cabecera de decision system-one; cuantizacion W4A16 AutoRound |
| Parametros totales | 1.078.637.808 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), group_size=32, simetrica; torre de vision sin cuantizar |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (compatible con auto_round y AutoGPTQ) |

## Arquitectura y entrenamiento

El modelo base d1-3B se construye sobre LFM2.5-VL-3B, un modelo multimodal de Liquid AI que combina un codificador visual con un modelo de lenguaje. La innovacion principal de d1 es su modo de operacion "system-one": en lugar de generar texto token a token, evalua un estado de entrada contra un conjunto de preguntas tipadas y produce directamente la decision en un unico pase hacia adelante, con cero tokens de salida autorregresivos. Las preguntas admiten tres tipos: `noul` (si/no), `choice` (seleccion multiple con criterios definidos) y `score` (escalas calibradas).

Esta version cuantizada se genero con AutoRound en modo W4A16, con group_size=32 y simetria activada. El proceso de calibracion utilizo 512 muestras, 800 iteraciones de ajuste y una longitud de secuencia de 2048. El torre de vision se mantuvo en precision sin cuantizar (`quant_nontext_module=False`) para preservar la fidelidad de las caracteristicas visuales. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion y decision en un unico pase: evaluacion de texto, imagenes o JSON contra preguntas tipadas sin generacion autorregresiva.
- Tres modos de decision: `noul` (si/no), `choice` (seleccion multiple con criterios) y `score` (escalas calibradas).
- Procesamiento multimodal: acepta imagenes junto con texto para evaluaciones visuales (por ejemplo, conteo de objetos o clasificacion de escenas).
- Multilingue: soporte declarado para 16 idiomas, incluidos espanol, ingles, chino, arabe, hindi, japones y coreano.
- Orientado a triaje y enrutamiento: deteccion de intencion, asignacion a equipos o categorias y moderacion de contenido.
- Guardas de seguridad para agentes: evaluacion rapida de estados para decidir si una accion es segura o requiere intervencion.
- Baja latencia: al no generar tokens de salida, el coste computacional se limita a un forward pass.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del cliente y un conjunto de preguntas tipadas (por ejemplo, "es una solicitud de reembolso" y "que equipo debe gestionarlo") y devuelve las decisiones en un unico pase, lo que reduce la latencia frente a un LLM generativo.
- Enrutamiento de intencion en asistentes conversacionales: clasifica cada turno del usuario en categorias predefinidas (`choice`) para dirigir la conversacion al flujo adecuado sin coste de generacion.
- Moderacion de contenido: evalua texto o imagenes contra criterios de politica (`noul` o `score`) para decidir si un contenido requiere revision humana, aprovechando el procesamiento multimodal.
- Guardas de seguridad en agentes: antes de ejecutar una accion, el modelo evalua el estado actual (JSON) contra preguntas de seguridad y devuelve una decision binaria o calibrada, actuando como filtro de bajo coste.
- Clasificacion de imagenes en el borde: con la torre de vision en precision completa, puede evaluar imagenes en dispositivos con recursos limitados para tareas como conteo de objetos o deteccion de escenas.
- Analisis de formularios y JSON estructurados: evalua estados serializados contra preguntas tipadas para validacion, deteccion de anomalias o extraccion de decisiones en pipelines de datos.
- Calibracion de confianza: el modo `score` permite obtener escalas calibradas, util para umbrales en sistemas de decision automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,8 GB en W4A16, por lo que la inferencia requiere aproximadamente 3-4 GB de VRAM, incluyendo overhead de activaciones y la torre de vision en precision completa.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100 (ampliamente sobredimensionadas para este tamano).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 6 GB o mas.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` y transformers >= 5.14), backends auto_round y AutoGPTQ; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; al operar en un unico forward pass sin generacion autorregresiva, la latencia deberia ser sustancialmente menor que la de un modelo generativo del mismo tamano, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| d1-3B-W4A16-AutoRound | 1.078.637.808 | no disponible | Decision multimodal (system-one) | lfm1.0 | W4A16 AutoRound |
| LiquidAI/d1-3B (base) | no disponible | no disponible | Decision multimodal (system-one) | lfm1.0 | Sin cuantizar |
| LFM2.5-VL-3B | no disponible | no disponible | Vision-lenguaje generativo | lfm1.0 | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La comparativa se limita a parametros, licencia y formato, ya que no hay benchmarks publicados.

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce texto libre; solo responde a preguntas tipadas en los modos `noul`, `choice` y `score`. No es adecuado para generacion de texto, codigo o conversacion abierta.
- Licencia lfm1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en produccion.
- Cuantizacion W4A16: la reduccion a 4 bits puede introducir degradacion en la precision de las decisiones, especialmente en tareas de calibracion fina; no se han publicado evaluaciones de la perdida de calidad respecto al modelo base.
- Torre de vision sin cuantizar: aunque preserva la fidelidad visual, incrementa el uso de memoria respecto a una cuantizacion completa.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que limita la planificacion de casos con entradas largas.
- Riesgo de alucinacion en las decisiones: al ser un modelo de clasificacion, puede producir respuestas erroneas o mal calibradas en estados ambiguos o fuera de distribucion.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad en la informacion disponible.
- Dependencia de `trust_remote_code`: requiere ejecutar codigo personalizado del repositorio, lo que implica un riesgo de seguridad que debe evaluarse en entornos de produccion.
- Repositorio de terceros: la cuantizacion la publica el usuario Vishva007, no Liquid AI; no hay garantia de soporte oficial ni de actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vishva007/d1-3B-W4A16-AutoRound
- Archivos del repositorio: https://huggingface.co/Vishva007/d1-3B-W4A16-AutoRound/tree/main
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- AutoRound (Intel): https://github.com/intel/auto-round
