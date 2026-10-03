# ZhengmingYu/DMAD

## Resumen

DMAD (Distribution Matching as Adversarial Distillation) es un metodo de destilacion para generacion visual rapida, aplicado aqui al modelo MiniMax-H3. Este repositorio de HuggingFace no contiene un modelo completo, sino los adaptadores LoRA que convierten al profesor MiniMax-H3 (33 000 millones de parametros, text-to-audio-video, 50 pasos de muestreo) en un estudiante que genera video y audio en solo 4 pasos. Lo desarrollan Zhengming Yu y colaboradores de Texas A&M University y ByteDance.

El resultado es un generador conjunto de audio y video con resolucion 1344x768 y audio estereo nativo, obtenido anadiendo LoRAs de rango 128 sobre el transformer de H3 (50 bloques transformer mas 2 bloques token-refiner, 312 modulos en total). El repositorio incluye dos checkpoints de 1,4 GB cada uno, con configuraciones de critico distintas.

El interes es practico: reducir de 50 a 4 pasos el coste de muestreo de un modelo de generacion audiovisual de gran tamano, manteniendo audio nativo sincronizado. Se publica bajo la MiniMax H3 Community License Agreement como derivado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MiniMax-H3) con 50 bloques transformer y 2 bloques token-refiner; adaptacion mediante LoRA de rango 128 |
| Parametros totales | Aproximadamente 33 000 millones en el modelo base MiniMax-H3; los adaptadores LoRA son ficheros de 1,4 GB cada uno |
| Parametros activos | no disponible (no es un modelo de arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video y audio; no expone ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos LoRA en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement |
| Formato de pesos | safetensors (adaptadores LoRA con claves de Diffusers) |

## Arquitectura y entrenamiento

DMAD es un metodo de destilacion que combina el ajuste por coincidencia de distribuciones con un esquema adversarial. El objetivo es transformar un profesor de difusion de 50 pasos (MiniMax-H3, 33 000 millones de parametros) en un estudiante que genera en 4 pasos, sin guiado libre de clasificador (classifier-free guidance). La adaptacion se realiza con LoRAs de rango 128 (alpha = rank = 128) aplicadas sobre las proyecciones `attn.to_q`, `attn.to_k`, `attn.to_v`, `attn.to_out.0`, `ff.net.0.proj` y `ff.net.2` de los 50 bloques transformer y de los 2 bloques token-refiner, lo que suma 312 modulos. El layout de claves sigue el formato de Diffusers (`<module>.lora.down.weight` = A [128, in], `<module>.lora.up.weight` = B [out, 128]).

El repositorio ofrece dos variantes. La primera (`dmad_minimax_h3_4step_lora_critic.safetensors`) es el checkpoint del articulo: una media exponencial movil (EMA) del estudiante en la iteracion 800 de la ejecucion principal, con el critico congelado bajo un LoRA. La segunda (`dmad_minimax_h3_4step_full_critic.safetensors`) proviene de una ejecucion en la que el backbone del critico se entrena por completo, corresponde a la iteracion 1600 con pesos vivos y obtiene mejor puntuacion en AVGen-Bench. El muestreo usa 4 pasos, un time shift de 12 para video y de 2 para audio, sin guiado, con 124 fotogramas a 24 fps.

## Capacidades

- Generacion conjunta de video y audio a partir de texto (text-to-audio-video), con audio estereo nativo generado de forma sincronizada con el video.
- Generacion de video a resolucion 1344x768 y 124 fotogramas a 24 fps.
- Muestreo rapido en 4 pasos, frente a los 50 pasos del profesor MiniMax-H3, sin guiado libre de clasificador.
- Destilacion sobre un modelo base de 33 000 millones de parametros mediante LoRA, lo que permite cargar los adaptadores sobre los pesos originales sin duplicar el modelo completo.
- Compatibilidad con el ecosistema Diffusers para la carga de los adaptadores LoRA.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, vision de entrada ni procesamiento de lenguaje mas alla del prompt de texto.

## Casos de uso

- Generacion rapida de clips audiovisuales para prototipado creativo: con solo 4 pasos de muestreo, permite iterar sobre prompts de texto y obtener video con audio sincronizado en un tiempo muy inferior al del profesor de 50 pasos.
- Produccion de contenido para redes sociales: la salida de 1344x768 a 24 fps y 124 fotogramas encaja en formatos de video corto con audio estereo generado.
- Creacion de borradores de storyboard animado: util para previsualizar escenas con sonido antes de una produccion final, dado el bajo coste por generacion.
- Investigacion en destilacion de modelos generativos: el repositorio sirve como referencia reproducible de LoRA de rango 128 sobre un transformer de difusion de 33 000 millones de parametros, con dos variantes de critico para comparar.
- Evaluacion de metodos de muestreo rapido: permite comparar el estudiante de 4 pasos frente al profesor de 50 pasos en tareas de generacion conjunta de audio y video.
- Generacion de material audiovisual sintetico para demostraciones tecnicas o benchmarks internos, etiquetando el resultado como contenido generado por IA segun exige la licencia.
- Adaptacion a dominios especificos: al ser adaptadores LoRA, pueden combinarse o sustituirse sobre el mismo modelo base MiniMax-H3 para experimentar con estilos o dominios concretos.

## Benchmarks y rendimiento

En la informacion disponible se menciona que el checkpoint `dmad_minimax_h3_4step_full_critic.safetensors` obtiene una puntuacion mas alta en AVGen-Bench que la variante con critico congelado, pero no se publican valores numericos de ese ni de otros benchmarks. Por tanto:

No se han publicado resultados de benchmarks con cifras en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia de calculo, el modelo base MiniMax-H3 tiene 33 000 millones de parametros; en bf16 los pesos del modelo completo rondarian los 66 GB, a lo que se sumaria el coste de activaciones y muestreo de video. Los adaptadores LoRA anaden solo 1,4 GB por checkpoint.
- GPU recomendadas: no disponible. Por el tamano del modelo base, el despliegue en bf16 requiere GPU de clase servidor (por ejemplo A100 de 80 GB o H100); se trata de una estimacion a partir del tamano del modelo, no de un requisito publicado.
- Compatibilidad con GPU de consumo: no disponible de forma oficial. Un modelo base de 33 000 millones de parametros no cabe en configuraciones de consumo habituales (RTX 4090 de 24 GB) sin cuantizacion del modelo base, dato que no se documenta.
- Opciones de despliegue: el repositorio de codigo proporciona `inference.py` con el muestreador empleado en el articulo (regla de re-noise step) y un ejemplo de pipeline de Diffusers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se sabe que el muestreo se reduce de 50 a 4 pasos, lo que implica un menor numero de evaluaciones del modelo, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DMAD (estudiante de MiniMax-H3) | LoRA de rango 128 sobre base de 33 000 millones | 4 | Text-to-audio-video, 1344x768, audio estereo | MiniMax H3 Community License Agreement | Adaptadores en HuggingFace, codigo en GitHub |
| MiniMax-H3 (profesor) | 33 000 millones | 50 | Text-to-audio-video | MiniMax H3 Community License Agreement | Modelo base en HuggingFace |
| Otros generadores audiovisuales destilados comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos en la informacion proporcionada es frente al propio profesor MiniMax-H3, del que DMAD hereda la arquitectura y los pesos y al que reduce el muestreo de 50 a 4 pasos mediante destilacion. No se dispone de datos de otros modelos de la misma categoria en la informacion consultada.

## Limitaciones y advertencias

- Este repositorio no es un modelo autonomo: requiere descargar el modelo base MiniMax-H3 (33 000 millones de parametros) y aplicar los adaptadores LoRA; el codigo de inferencia vive en un repositorio externo de GitHub, no en HuggingFace.
- Licencia: los checkpoints son derivados del modelo MiniMax-H3 y se distribuyen bajo la MiniMax H3 Community License Agreement. Es una licencia "other", por lo que las condiciones de uso comercial deben revisarse en el fichero LICENSE antes de cualquier despliegue en produccion.
- Contenido generado por IA: la propia model card indica que los videos producidos con estos pesos son generados por IA, lo que implica obligaciones de divulgacion segun el contexto de uso.
- Riesgo de artefactos y alucinacion visual: al ser un modelo de difusion destilado a 4 pasos, no se documentan evaluaciones de fidelidad, coherencia temporal ni sincronizacion audio-video mas alla de la mencion a AVGen-Bench.
- Idiomas: no disponible. La model card no especifica que idiomas soporta el modelo para el prompt de texto ni para el audio generado (por ejemplo, si produce voz en un idioma concreto).
- Sin datos publicados de cuantizacion, VRAM, latencia ni throughput, lo que dificulta planificar el despliegue en produccion.
- Repositorio con 0 descargas y 17 likes en el momento de la consulta, lo que indica un uso muy limitado y poca validacion externa de la comunidad.
- No se documentan capacidades de tool calling, agentes ni razonamiento; es exclusivamente un generador de video y audio.

## Enlaces

- HuggingFace: https://huggingface.co/ZhengmingYu/DMAD
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Pagina del proyecto: https://yzmblog.github.io/projects/DMAD/
- Articulo (arXiv): https://arxiv.org/abs/2610.02188
- Codigo: https://github.com/Yzmblog/DMAD
- Video de demostracion: https://www.youtube.com/watch?v=cOCUCYZzAtE
- Perfil del autor: https://yzmblog.github.io/
