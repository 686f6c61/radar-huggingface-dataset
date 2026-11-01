# sw-voice/maya-named-backbone-lr-x3

## Resumen

maya-named-backbone-lr-x3 es un modelo de síntesis de voz (text-to-speech) publicado por el usuario sw-voice en HuggingFace. Se trata de un ajuste fino completo (full fine-tune) del modelo base maya-research/maya2-native, entrenado específicamente para reproducir la voz de una entidad denominada "Swamiji". El modelo tiene 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 5,0 GB, bajo licencia Apache 2.0.

El modelo pertenece a la categoría de TTS con voz nombrada (named voice): no requiere un clip de referencia en tiempo de inferencia, sino que la identidad vocal se selecciona mediante un identificador textual. En concreto, la API de carga (`Maya3TTS.from_pretrained(...)`) lee un fichero `voices/voices.json` y la generación se invoca con `generate(text, voice="Swamiji")`, usando internamente el prompt `{Swamiji}: <text>`.

Por su naturaleza de modelo de investigación, con cero descargas y cero likes en el momento de la consulta, su relevancia es limitada fuera del contexto del proyecto que lo origina. No obstante, resulta ilustrativo como ejemplo de ajuste fino de un backbone TTS con control diferenciado de tasas de aprendizaje por módulo y de estrategias de repetición de datos por época.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de texto a voz; backbone derivado de maya-research/maya2-native) |
| Parametros totales | 2.502.398.656 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el autor menciona datos multilingües en la receta, sin detallar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del backbone maya-research/maya2-native. La model card describe la receta de entrenamiento con cierto detalle: se empleó la receta del proyecto "best-2-multilingual-maya" (exp2c) con el parámetro `--depth_w 3,3,1` y un multiplicador de tasa de aprendizaje `--lr_mult 3,1,1,1`. Esto implica una tasa de aprendizaje para el backbone de 1,5e-5 y de 5e-6 para el decodificador de profundidad, con fecha de referencia 05/18.

El conjunto de datos se compone de los ficheros `clips.pt`, `clips_te.pt` (repetido 3 veces) y `clips_kn.pt` (repetido 3 veces), donde la notación `FILE*N` indica que las filas de ese fichero se repiten N veces por época. El entrenamiento se realizó con una tasa de aprendizaje de 5e-6, 3 épocas (552 actualizaciones), batch de 1x8, calentamiento lineal durante 138 actualizaciones y después tasa constante. El código de entrenamiento se encuentra en el repositorio swamiji-tts, bajo la ruta `research/maya2-sft`.

No se especifica en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna del backbone más allá de su naturaleza TTS.

## Capacidades

- Síntesis de voz (text-to-speech) con identidad vocal nombrada: genera audio a partir de texto seleccionando una voz predefinida mediante un identificador ("Swamiji").
- No requiere clip de referencia en inferencia: la voz se resuelve a partir de `voices/voices.json`, lo que simplifica el despliegue en producción frente a esquemas de clonación zero-shot.
- Soporte de prompt con formato `{Voz}: <texto>`, lo que permite enrutar la generación a distintas voces si el fichero de voces contiene más de una entrada.
- Capacidades multilingües: la receta de datos menciona ficheros con sufijos `_te` y `_kn`, lo que sugiere cobertura de al menos varios idiomas, aunque no se detallan cuáles ni su calidad.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento, al tratarse de un modelo TTS.

## Casos de uso

- Generación de narración para audiolibros y contenido largo: el modelo puede sintetizar texto de forma desatendida con una voz consistente, sin necesidad de aportar muestras de referencia en cada petición, lo que reduce la complejidad del pipeline.
- Locución para vídeos y pódcast: al fijar la voz mediante el identificador "Swamiji", se garantiza uniformidad tímbrica entre episodios o fragmentos generados en sesiones distintas.
- Sistemas de respuesta por voz en aplicaciones de accesibilidad: integración en lectores de pantalla o asistentes que convierten texto a audio con una voz estable y predecible.
- Prototipado de asistentes conversacionales: el formato de prompt `{Voz}: <texto>` facilita la experimentación con enrutado de voz en un diálogo multi-turno, aunque el modelo no gestiona el estado de la conversación por sí mismo.
- Investigación en ajuste fino de TTS: la receta documentada (tasas de aprendizaje diferenciadas por módulo, repetición de datos por época) sirve como referencia reproducible para estudiar el efecto de estos hiperparámetros en la calidad de la voz.
- Generación de contenido multilingüe: si los idiomas de los ficheros `_te` y `_kn` están efectivamente cubiertos, el modelo podría emplearse para producir locuciones en esos idiomas con la misma identidad vocal, aunque la calidad por idioma no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,5 mil millones de parámetros en safetensors (precisión nativa no especificada, probablemente fp32 o fp16 dado el tamaño de 5,0 GB), se estima un consumo de aproximadamente 5 GB en fp16 y en torno a 10 GB en fp32. En cuantización de 8 bits podría reducirse a unos 2,5-3 GB, y en 4 bits a unos 1,5-2 GB, aunque el autor no documenta soporte de cuantización.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, una GPU con 8-16 GB de VRAM sería suficiente para inferencia en fp16; una RTX 4090 (24 GB) o A100/H100 ofrecerían margen amplio y mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en fp16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores), siempre que el runtime soporte el formato safetensors del modelo.
- Opciones de despliegue: el autor referencia la librería propia `Maya3TTS` del repositorio swamiji-tts. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS con voz nombrada de ~2,5 mil millones de parámetros) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación: la model card lo etiqueta explícitamente como "(research)", con cero descargas y cero likes, lo que indica ausencia de validación por parte de la comunidad.
- Sesgos conocidos: no documentados. Al estar entrenado sobre la voz de una entidad concreta ("Swamiji"), la voz generada está sesgada hacia esas características y no representa una distribución amplia de hablantes.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe riesgo de artefactos acústicos, pronunciación incorrecta o inestabilidad prosódica en textos fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no se especifica la longitud máxima de texto de entrada ni los idiomas cubiertos con calidad. La mención de ficheros `_te` y `_kn` no garantiza un rendimiento uniforme en esos idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base maya-research/maya2-native, ya que el ajuste fino hereda posibles condiciones adicionales.
- Caveat para producción: la API depende de la librería `Maya3TTS` y del fichero `voices/voices.json`; no se documentan versiones, compatibilidad con frameworks estándar ni procesos de empaquetado, lo que dificulta su integración en pipelines de producción.
- Reproducibilidad: la receta depende de ficheros de datos (`clips.pt`, `clips_te.pt`, `clips_kn.pt`) que no se detallan ni se enlazan, lo que limita la reproducción independiente del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/maya-named-backbone-lr-x3
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Repositorio de código (referenciado en la model card): swamiji-tts, ruta `research/maya2-sft` (no se proporciona URL directa en la información disponible)
