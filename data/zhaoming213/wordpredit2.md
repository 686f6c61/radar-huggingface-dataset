# Zhaoming213/WordPredit2

## Resumen

WordPredit2 es un modelo de lenguaje de tipo transformer decoder-only, desarrollado por el usuario Zhaoming213 y publicado en HuggingFace con licencia Apache 2.0. Con 93.410.304 parametros (93,41 M), esta especializado en prediccion de texto corto y finalizacion de frases en chino: dado un fragmento breve, genera su continuacion mas probable. No es un modelo conversacional ni ha pasado por ajuste por instrucciones, sino un modelo preentrenado sobre texto web nativo en chino.

La segunda generacion de la serie WordPredit aumenta el numero de capas respecto a su predecesor, aplica dos rondas de limpieza profunda sobre el corpus y utiliza frases mas cortas durante el preentrenamiento, con el objetivo declarado de mejorar la robustez, la generalizacion y la generacion creativa. El autor enmarca el modelo en un estudio sobre las caracteristicas de divergencia de modelos pequenos y sobre el uso de corpus nativos (en lugar de destilacion de cajas negras) para evitar tendencias moralizantes o de rechazo.

Su relevancia practica es limitada pero concreta: se trata de un modelo de 0,2 GB de repositorio, entrenado en dos GPU T4 de 16 GB durante algo mas de 24 horas, con una ventana de contexto de solo 34 tokens. Es util como banco de pruebas de bajo coste para experimentos de preentrenamiento y limpieza de datos en chino, y como motor de autocompletado de fragmentos muy cortos, no como sustituto de un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no confirmada explicitamente en la model card; los metadatos del repositorio incluyen la etiqueta `qwen3`) |
| Parametros totales | 93.410.304 (93,41 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 34 tokens (`max_seq_len`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; el autor no documenta versiones cuantizadas) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| hidden_size | 768 |
| Numero de capas | 12 |
| Cabezas de atencion | 8 (dimension de cabeza de 96) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura en detalle; la tabla de parametros indica 12 capas, un `hidden_size` de 768 y 8 cabezas de atencion, lo que da una dimension de cabeza de 96. La presencia de la etiqueta `qwen3` en los metadatos sugiere un linaje o compatibilidad con la familia Qwen3 (probablemente el tokenizador), pero este extremo no se confirma en la documentacion. Se trata de un modelo preentrenado desde cero, no de un ajuste de otro modelo, segun indica el autor al describir el uso de "una gran cantidad de texto web nativo en chino" para el preentrenamiento.

El corpus de preentrenamiento es `CASIA-LM/ChineseWebText2.0`, sometido a dos rondas de limpieza en profundidad. La estrategia de entrenamiento se apoya en tres decisiones: frases mas cortas, una ventana de contexto reducida (34 tokens) y una mayor duracion total del preentrenamiento con datasets mas grandes. El autor justifica el contexto corto como forma de evitar salidas inesperadas asociadas a contextos largos y de reducir coste y tiempo de entrenamiento, lo que le permite explorar ajustes de dimensionalidad y profundidad en ese regimen. No se menciona ningun proceso de RLHF, DPO o ajuste por instrucciones: es un modelo base puro.

En cuanto al coste declarado, el preentrenamiento se realizo en 2 GPU T4 de 16 GB durante mas de 24 horas. La model card incluye un aviso relevante: la tabla de parametros aparece bajo el nombre "ChatBox-unrestricted-normal", lo que apunta a que fue copiada de la ficha de otro modelo de la misma serie y no necesariamente describe WordPredit2 de forma literal.

## Capacidades

- Prediccion de texto corto: continuacion de fragmentos breves en chino, con ejemplos como "同比增加了" -> "120万美元" o "我是一名" -> "学生".
- Finalizacion y completado de frases dentro de un parrafo u oracion corta.
- Generacion creativa de bajo nivel y "brainstorming": el autor cita copywriting creativo y generacion divergente como objetivos.
- Ausencia deliberada de alineamiento conversacional: al ser un modelo preentrenado y no conversacional, no incorpora mecanismos de rechazo ni de moralizacion, y el autor lo presenta como una ventaja frente a modelos destilados.
- Capacidades multilingues: no disponible; la ficha declara unicamente chino (zh), sin evidencia de soporte de otros idiomas.
- Tool calling / function calling: no disponible; no se documenta ni se sugiere en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; la ventana de 34 tokens lo hace inviable en la practica.
- Modo de pensamiento (thinking), vision o audio: no disponible.
- Razonamiento matematico o generacion de codigo: no disponible; no se documenta ningun resultado en estas areas.

## Casos de uso

- Autocompletado de campos cortos en formularios e intranets chinas: el modelo genera continuaciones de pocas palabras a partir de un prefijo, que es exactamente el regimen para el que fue entrenado (34 tokens de contexto). Encaja en campos de tipo "departamento", "motivo" o "descripcion breve".
- Sugerencia de final de frase en editores de texto en chino: con 93,41 M de parametros y un repositorio de 0,2 GB, puede ejecutarse en local o en el navegador como complemento de escritura de latencia muy baja, sin enviar texto a un servicio externo.
- Generacion de semillas para redaccion periodistica o de marketing: los ejemplos de la model card muestran continuaciones de estilo noticioso (por ejemplo, "本台记者" -> "走访了该小区"), utiles como borradores iniciales que un redactor humano revisa y amplia.
- Expansion de consultas en buscadores internos en chino: a partir de una consulta muy corta, el modelo propone variantes de continuacion que pueden alimentar un indice o un sistema de recuperacion; el coste computacional es despreciable.
- Banco de pruebas para investigacion sobre limpieza de corpus y divergencia en modelos pequenos: el autor plantea explicitamente el modelo como instrumento de estudio del efecto de la limpieza de datos y del contexto corto, por lo que es adecuado como linea base reproducible (24 horas en 2 T4) en experimentos academicos.
- Base para ajuste fino en tareas de clasificacion o etiquetado de texto corto en chino: al ser un modelo preentrenado sin alineamiento, se puede adaptar con `transformers` a tareas concretas (analisis de sentimiento de titulares, categorizacion de tickets) anadiendo una cabeza de clasificacion.
- Aumento de datos sinteticos: generacion de continuaciones plausibles para ampliar corpus de texto corto en chino en entornos con recursos limitados, siempre con revision posterior y filtrado por calidad.
- Demostraciones educativas de preentrenamiento: su tamano permite entrenar, inspeccionar y desplegar el modelo completo en un portatil, lo que lo hace util para docencia sobre arquitecturas transformer y pipelines de tokenizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, C-Eval ni de ningun otro conjunto de evaluacion, y unicamente aporta ejemplos cualitativos de continuacion de texto.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 93,41 M de parametros: aproximadamente 374 MB en fp32, 187 MB en fp16/bf16, 93 MB en int8 y 47 MB en int4.
- Cache KV despreciable: con 34 tokens de contexto, 12 capas y 8 cabezas de dimension 96, la cache en fp16 ocupa alrededor de 1,25 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo se entreno en 2 T4 de 16 GB, pero para inferencia es sobredimensionado cualquier acelerador moderno (T4, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, con margen amplio. Incluso cabe en CPU, en iGPU y en dispositivos tipo Raspberry Pi con 1 GB de RAM disponible.
- Opciones de despliegue: `transformers` es la via directa (el autor indica descargar los ficheros y ejecutar `Predit.py`); los metadatos incluyen la etiqueta `text-generation-inference`, por lo que TGI es compatible; vLLM es tecnicamente viable por el formato safetensors. Para llama.cpp u Ollama seria necesario convertir a GGUF, y no se publica ninguna conversion oficial.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WordPredit2 | 93,41 M | 34 tokens | Chino | Apache 2.0 | HuggingFace (0 descargas) |
| WordPredit (1.ª generacion) | no disponible | no disponible | Chino | no disponible | HuggingFace |
| ChatBox-unrestricted | no disponible | no disponible | Chino | no disponible | HuggingFace |
| ChatBox2-unrestricted | no disponible | no disponible | Chino | no disponible | HuggingFace |
| ChatBox3-unrestricted | no disponible | no disponible | Chino | no disponible | HuggingFace (experimental) |

No se dispone en la informacion proporcionada de datos verificables de modelos comparables de terceros (parametros, contexto, benchmarks o licencia) que permitan una comparacion cuantitativa. La particularidad de WordPredit2 dentro de su categoria es la combinacion de un contexto de 34 tokens con un enfoque de preentrenamiento sin alineamiento, lo que lo aleja del segmento de modelos pequenos de proposito general.

## Limitaciones y advertencias

- No es un modelo conversacional ni esta ajustado por instrucciones: no responde a preguntas, solo continua texto. Cualquier uso como asistente requiere ajuste fino previo.
- Ventana de contexto de 34 tokens: no admite conversaciones multi-turno, documentos, resumenes ni cadenas de razonamiento. Es la limitacion mas restrictiva del modelo.
- Riesgo de alucinacion alto: al ser un modelo preentrenado sobre texto web, genera continuaciones verosimiles sin verificacion factual. Los propios ejemplos de la model card ilustran este riesgo: la entrada "北京市" produce "气象台将继续发布新冠疫情新情况", una asociacion sin garantia de veracidad ni de actualidad.
- Sesgos: el corpus ChineseWebText2.0 proviene de web nativa china, por lo que el modelo hereda los sesgos tematicos, ideologicos y de estilo de ese material. No se documenta ningun proceso de mitigacion.
- Ausencia de filtros de seguridad: el autor presenta la falta de comportamiento moralizante o de rechazo como una caracteristica deliberada, lo que implica que el modelo puede generar contenido inapropiado sin restriccion. Es responsabilidad del integrador anadir moderacion.
- Idioma unico: solo se declara soporte de chino; no hay evidencia de competencia en castellano ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y sin garantias. El autor declara explicitamente que las consecuencias del uso recaen sobre el usuario.
- Falta de validacion externa: el modelo tiene 0 descargas y 0 likes, y no existe ningun benchmark publicado. Toda la informacion sobre su calidad procede de la propia model card del autor.
- Ambiguedad documental: la etiqueta `qwen3` no se explica, y la tabla de parametros aparece etiquetada como "ChatBox-unrestricted-normal", lo que sugiere una copia entre fichas. Conviene verificar la configuracion real (`config.json`) antes de integrar el modelo.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ/GPTQ publicados, lo que anade un paso de conversion si se quiere desplegar en llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zhaoming213/WordPredit2
- Generacion anterior (WordPredit): https://huggingface.co/Zhaoming213/WordPredit
- ChatBox-unrestricted: https://huggingface.co/Zhaoming213/ChatBox-unrestricted
- ChatBox2-unrestricted: https://huggingface.co/Zhaoming213/ChatBox2-unrestricted
- ChatBox3-unrestricted (experimental): https://huggingface.co/Zhaoming213/ChatBox3-unrestricted
- Dataset de preentrenamiento: https://huggingface.co/datasets/CASIA-LM/ChineseWebText2.0
