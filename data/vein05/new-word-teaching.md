# vein05/new-word-teaching

## Resumen

`vein05/new-word-teaching` es una colección de modelos de lenguaje de pequeno tamano derivados de la familia TinyStories de Microsoft Research (1M, 3M, 8M, 28M y 33M parametros). El autor, identificado como vein05, ha publicado copias fine-tuneadas de estos modelos con el objetivo experimental de ensenarles dos palabras inventadas, "vekta" y "nolta", que sustituyen a terminos que el modelo ya conoce (ball, book, car, hat segun el experimento). No es un modelo de proposito general, sino un artefacto de investigacion sobre adquisicion de vocabulario en modelos pequenos.

El repositorio contiene multiples ejecuciones organizadas por metodo de ensenanza (por uso, por definicion, por definiciones dentro de historias, por frases cortas) y por tamano del modelo base. Cada ejecucion se entrena durante 300 actualizaciones y se guarda como un unico fichero `final_model_fp16.pt` con pesos en precision de 16 bits. El repositorio ocupa 9,6 GB, lo que refleja la acumulacion de todas las variantes y tamanos.

La relevancia del proyecto es fundamentalmente academica: permite estudiar como modelos con capacidad linguistica limitada (TinyStories esta disenado para generar cuentos infantiles coherentes con un vocabulario restringido) adquieren neologismos mediante distintas estrategias de supervision. No esta pensado para despliegue en produccion ni para tareas generales de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia TinyStories) |
| Parametros totales | 1M, 3M, 8M, 28M y 33M segun la variante |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (TinyStories usa contextos cortos, tipicamente 256-512 tokens) |
| Tipos de cuantizacion | Pesos publicados en fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (TinyStories se entrena principalmente en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (state_dict en fp16), no safetensors ni GGUF |
| Libreria | transformers |
| Modelo base | roneneldan/TinyStories-1M, -3M, -8M, -28M, -33M |
| Tamano del repositorio | 9,6 GB |

## Arquitectura y entrenamiento

Los modelos base TinyStories son transformers decoder-only de arquitectura GPT-Neo/GPT-2-like, disenados por Ronen Eldan y Yuanzhi Li para demostrar que modelos muy pequenos pueden generar texto coherente si se entrenan con un corpus sintetico de vocabulario restringido (cuentos infantiles). Las variantes van de 1M a 33M parametros.

El fine-tuning realizado por vein05 consiste en 300 pasos de actualizacion sobre cada modelo base para ensenar dos palabras inventadas. Se exploran cuatro estrategias de ensenanza: (1) por uso, sustituyendo la palabra original por el neologismo en historias completas; (2) por frases cortas, usando solo las oraciones que contienen la palabra; (3) por definicion, con oraciones del tipo "A vekta is a ball."; y (4) por definiciones insertadas dentro de historias intactas. Ademas, se varian los mapeos semantico (linked: vekta=ball, nolta=book; swapped; unlinked: vekta=car, nolta=hat) y las semillas aleatorias. No se documentan detalles sobre hiperparametros, optimizador, learning rate ni composicion exacta de los datos de entrenamiento.

## Capacidades

- Generacion de texto narrativo corto en ingles, limitado al dominio de cuentos infantiles de TinyStories.
- Adquisicion de vocabulario inventado ("vekta", "nolta") mediante fine-tuning supervisado, con distintas estrategias de ensenanza.
- Capacidad de generalizacion semantica del neologismo segun el mapeo aprendido (linked, swapped, unlinked).
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingue ni modo thinking.
- No se documenta vision, audio ni otras modalidades.
- No se documenta razonamiento multi-paso, matematicas ni generacion de codigo.

## Casos de uso

- Investigacion sobre adquisicion de vocabulario: el modelo permite comparar empiricamente como distintas estrategias de supervision (uso vs. definicion vs. definicion en contexto) afectan a la incorporacion de neologismos en modelos pequenos.
- Estudio de mapeos semanticos: las variantes linked, swapped y unlinked permiten analizar si el modelo asocia el neologismo al concepto correcto o simplemente aprende una sustitucion superficial.
- Analisis de escalado: la barrida de tamanos (1M a 33M) permite estudiar como la capacidad del modelo influye en la facilidad para aprender palabras nuevas con el mismo presupuesto de 300 pasos.
- Experimentos educativos: util como banco de pruebas en cursos de NLP para ilustrar fine-tuning, tokenizacion y evaluacion de modelos generativos.
- Reproducibilidad de metodos de ensenanza: las cuatro estrategias documentadas permiten replicar y extender el estudio con otros neologismos o idiomas.
- Base para investigacion sobre olvido catastrofico: al ser fine-tunings cortos sobre modelos minusculos, sirven para medir cuanto se degrada el conocimiento previo tras ensenar vocabulario nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB para todas las variantes (el mayor, 33M parametros en fp16, ocupa aproximadamente 66 MB de pesos; el resto es overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos de gama baja y en CPU.
- Opciones de despliegue: al publicarse como `state_dict` en `.pt`, requiere cargar el modelo base con `transformers` y aplicar `load_state_dict`. No hay conversion documentada a GGUF, por lo que llama.cpp u Ollama requeririan conversion manual. vLLM y TGI no estan documentados para estas variantes.
- Latencia y throughput: no disponibles; por el tamano, la inferencia es practicamente instantanea en GPU y viable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| vein05/new-word-teaching | 1M-33M | no disponible | no disponible | `.pt` (fp16) | Fine-tuning experimental sobre TinyStories |
| roneneldan/TinyStories-33M | 33M | no disponible | no disponible (uso de investigacion) | safetensors/PyTorch | Generacion de cuentos infantiles |
| roneneldan/TinyStories-1M | 1M | no disponible | no disponible | safetensors/PyTorch | Generacion de cuentos infantiles |
| Modelos GPT-2 small | 124M | 1024 | MIT | safetensors/PyTorch | Generacion de texto general |

La comparativa con modelos de proposito general no es directa: TinyStories y sus derivados estan disenados para un dominio y vocabulario muy restringidos, por lo que su rendimiento en tareas generales de NLP no es comparable.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas reales de NLP.
- Dominio muy restringido: solo genera texto similar a cuentos infantiles en ingles; fuera de ese dominio la calidad sera muy baja.
- Vocabulario limitado: el modelo base esta entrenado con un vocabulario deliberadamente reducido.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor y al modelo base original.
- Riesgo de alucinacion: alto en cualquier tarea fuera del dominio de entrenamiento; los neologismos aprendidos pueden usarse de forma inconsistente.
- Sin datos de evaluacion: no hay benchmarks publicados que permitan medir la calidad del fine-tuning ni la retencion del conocimiento previo.
- Formato de pesos no estandar: requiere cargar manualmente el `state_dict` sobre el modelo base, lo que complica su integracion en pipelines estandar.
- Sin soporte documentado de tool calling, agentes ni multimodalidad.
- Posible olvido catastrofico: 300 pasos de fine-tuning sobre modelos minusculos pueden degradar capacidades previas no documentadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vein05/new-word-teaching
- Modelo base TinyStories-1M: https://huggingface.co/roneneldan/TinyStories-1M
- Modelo base TinyStories-3M: https://huggingface.co/roneneldan/TinyStories-3M
- Modelo base TinyStories-8M: https://huggingface.co/roneneldan/TinyStories-8M
- Modelo base TinyStories-28M: https://huggingface.co/roneneldan/TinyStories-28M
- Modelo base TinyStories-33M: https://huggingface.co/roneneldan/TinyStories-33M
