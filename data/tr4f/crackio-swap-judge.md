# TR4F/crackio-swap-judge

## Resumen

Crackio swap judge es un adaptador LoRA (PEFT, rango 32, alpha 32) sobre el modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por el usuario TR4F en el contexto del proyecto Crackio, una herramienta de edición de vídeo por sustitución de personajes. El adaptador resuelve un problema muy concreto: verificar automáticamente si un fotograma redibujado contiene al nuevo personaje completamente integrado (sin mezclas a medias ni presencia del original) y si se ha conservado la pose original. Se trata, por tanto, de un juez visual especializado, no de un modelo generativo de propósito general.

La relevancia del modelo es acotada pero clara: permite que el pipeline de Swap de Crackio valide cada fotograma en la GPU del propio usuario, con un coste de entre 0,5 y 3 segundos por comprobación, sin enviar imágenes a servicios externos. El adaptador se distribuye como safetensors para el puente ComfyUI de Crackio y como adaptador PEFT estándar, y responde en JSON con los campos `replaced` y `pose`.

Al estar construido sobre LFM3-VL-2B, hereda la arquitectura y la licencia del modelo base (LFM Open License v1.0), que restringe el uso comercial a empresas con ingresos anuales inferiores a 10 millones de dólares. El repositorio ocupa 0,3 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer multimodal LFM3-VL-2B; adaptador aplicado a atención y MLP del modelo de lenguaje |
| Parametros totales | No disponible para el adaptador; el modelo base es LFM3-VL-2B (2B, según nomenclatura) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (uso comercial solo para empresas con ingresos anuales inferiores a 10M USD) |
| Formato de pesos | safetensors (adaptador PEFT en `peft/` y fichero `lfm3-vl-2b-lora-judge.safetensors` para el puente ComfyUI) |
| Rango y alpha del LoRA | 32 / 32 |
| Modelo base | LiquidAI/LFM3-VL-2B |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 0,3 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 inyectado en las capas de atención y MLP del modelo de lenguaje del LFM3-VL-2B, un modelo multimodal de 2B parámetros de Liquid AI que procesa imagen y texto. El adaptador no modifica el codificador visual; especializa la parte lingüística para emitir una respuesta estructurada en JSON con dos campos: `replaced` (si el personaje ha sido sustituido por completo) y `pose` (si se ha mantenido la pose original).

El entrenamiento corresponde a la versión 9 del adaptador, con una sola época, sobre tomas de swap generadas por Crackio con FLUX 3 Klein a partir de sus propios clips y de miembros de reparto inventados (sin semejanza con personas reales). Cada muestra se presentaba completa y como primer plano centrado en el personaje sustituido. Las etiquetas combinan las selecciones manuales del autor de Crackio en la página Rate con medidas automáticas (contornos de SAM 3.1 y cambios de color); no se emplearon respuestas de otros modelos de IA como etiquetas. En tomas reservadas, promediando ambas apariencias y con una probabilidad de acierto del 0,47 para "replaced", detectó 172 de 188 tomas defectuosas y las 12 tomas defectuosas procedentes de swaps reales.

## Capacidades

- Evaluación binaria de sustitución de personaje: determina si el nuevo personaje está completamente integrado en el fotograma.
- Verificación de conservación de pose respecto al fotograma original.
- Salida estructurada en JSON con los campos `replaced` y `pose`.
- Procesamiento conjunto de imagen y texto (image-text-to-text) mediante el modelo base LFM3-VL-2B.
- Integración con el pipeline de Swap de Crackio a través de su puente ComfyUI (`POST /crackio/lfm3` con `"lora": "judge"`).
- Uso como adaptador PEFT estándar sobre LFM3-VL-2B para integrarlo en otros flujos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas distintos del de sus prompts de entrenamiento.

## Casos de uso

- Validación de fotogramas en sustitución de personajes: dentro de Crackio, el juez recibe cada fotograma redibujado y decide si el nuevo personaje está completamente integrado; los fotogramas que no pasan se redibujan, con un coste de 0,5 a 3 segundos por comprobación en la GPU del usuario.
- Control de calidad en pipelines de edición de vídeo: permite descartar automáticamente tomas con sustituciones parciales o con el personaje original aún visible, reduciendo la revisión manual.
- Verificación de continuidad de pose: comprueba que el redibujado conserva la pose del fotograma original, un requisito habitual en animación y en sustitución de personajes cuadro a cuadro.
- Procesamiento local con privacidad: al ejecutarse en la GPU del usuario, ninguna imagen del proyecto sale de la máquina, lo que lo hace adecuado para material no publicable o sujeto a confidencialidad.
- Filtrado previo en flujos ComfyUI: puede integrarse como nodo de validación tras un paso de generación con FLUX 3 Klein, aceptando o rechazando la salida antes de continuar el pipeline.
- Evaluación de tomas en investigación sobre sustitución de personajes: sirve como juez automático para medir la tasa de éxito de distintos generadores o parámetros en experimentos controlados.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de validación del propio adaptador:

| Metrica | Resultado |
|---|---|
| Tomas defectuosas detectadas (held-out, apariencias promediadas) | 172 de 188 |
| Tomas defectuosas detectadas en swaps reales | 12 de 12 |
| Probabilidad de acierto para "replaced" (referencia) | 0,47 |
| Tiempo por comprobacion | 0,5–3 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 2B parámetros, la huella corresponde prácticamente a la del modelo base completo más el adaptador (0,3 GB en disco).
- GPU recomendadas: no disponibles; el autor indica únicamente que la inferencia se ejecuta en la GPU del usuario.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del modelo base (2B) sugiere que puede caber en GPU de consumo, pero no se aporta una lista de modelos verificados.
- Opciones de despliegue: puente ComfyUI de Crackio (`POST /crackio/lfm3` con `"lora": "judge"`) y carga como adaptador PEFT sobre `LiquidAI/LFM3-VL-2B`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: entre 0,5 y 3 segundos por comprobación según el autor. No se publica throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico del pipeline de Crackio y no se han publicado comparaciones con otros jueces visuales o adaptadores de sustitución de personajes.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Crackio swap judge (TR4F) | Adaptador LoRA sobre base de 2B | No disponible | LFM Open License v1.0 | HuggingFace (TR4F/crackio-swap-judge) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El adaptador está entrenado con los prompts propios de Crackio; el autor advierte de que es más fiable utilizándolo a través de esa herramienta que de forma aislada con PEFT.
- El entrenamiento se realizó con una sola época y sobre datos sintéticos generados con FLUX 3 Klein y repartos inventados, lo que limita la generalización a otros dominios visuales o estilos no representados.
- La validación reportada incluye 188 tomas defectuosas, de las cuales 16 no fueron detectadas; existe por tanto una tasa de falsos negativos no despreciable en el conjunto de evaluación.
- No se documentan sesgos conocidos, comportamiento multilingüe ni riesgos específicos de alucinación más allá de los propios de un clasificador visual especializado.
- La licencia LFM Open License v1.0 restringe el uso comercial a empresas con ingresos anuales inferiores a 10 millones de dólares; el adaptador se considera obra derivada del modelo base y hereda esas condiciones.
- No se dispone de información sobre cuantizaciones, longitud de contexto ni idiomas soportados, lo que dificulta planificar su integración en producción fuera del ecosistema Crackio.
- El repositorio no registra descargas ni valoraciones, por lo que no hay evidencia de uso externo ni de mantenimiento continuado.

## Enlaces

- [HuggingFace: TR4F/crackio-swap-judge](https://huggingface.co/TR4F/crackio-swap-judge)
- [Modelo base: LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B)
- [Repositorio de Crackio](https://github.com/RafalOfficial/Crackio)
