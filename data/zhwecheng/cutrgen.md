# ZhweCheng/cUTRGen

## Resumen

cUTRGen es un modelo encoder-decoder condicionado por CDS (secuencia codificante) para la generación, predicción funcional y diseño de secuencias UTR (untranslated regions) de ARN mensajero. Lo desarrolla el autor ZhweCheng y se publica en Hugging Face bajo el identificador `ZhweCheng/cUTRGen`, con código asociado en el repositorio `HIM-AIM/cUTRGen`. El modelo aborda un problema concreto de biología computacional y terapéutica: dado un CDS fijo, generar regiones 5′ y 3′ UTR que maximicen la expresividad y estabilidad del ARNm, una tarea relevante para el diseño de vacunas de ARNm y terapias basadas en ARN.

El repositorio no distribuye un único modelo, sino un conjunto de seis checkpoints: generadores 5′ UTR y 3′ UTR en versiones preentrenada y optimizada por refuerzo (RL), más dos políticas emparejadas (`policy_5utr` y `policy_3utr`) procedentes de una optimización conjunta para el diseño de ARNm de longitud completa con CDS fijo. La arquitectura es de tipo encoder-decoder transformer (la model card indica explícitamente "encoder–decoder"), aunque no se detalla el número de parámetros, la longitud de contexto ni la composición del corpus de entrenamiento.

La relevancia actual del modelo reside en su enfoque de dos etapas: un preentrenamiento sobre secuencias UTR seguido de una optimización por aprendizaje por refuerzo orientada a objetivos funcionales, y una extensión a la generación conjunta de ambos extremos del ARNm. No obstante, la información publicada es muy limitada en cuanto a especificaciones técnicas, métricas y licencia, lo que condiciona su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (condicionado por CDS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión nativa) |
| Idiomas soportados | no disponible (modelo de secuencias biológicas, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint), con `config.json` y `generation_config.json` |
| Tamano del repositorio | 6,1 GB |
| Checkpoints incluidos | `c5UTRGen-pretrained`, `c5UTRGen-RL`, `c3UTRGen-pretrained`, `c3UTRGen-RL`, `full-length-RL/policy_5utr`, `full-length-RL/policy_3utr` |
| Libreria | transformers |
| Tokenizacion | personalizada, incluida en el modulo de codigo correspondiente |

## Arquitectura y entrenamiento

La model card describe cUTRGen como un modelo encoder-decoder condicionado por CDS: el encoder procesa la secuencia codificante fija y el decoder genera la secuencia UTR correspondiente. El repositorio separa los generadores de 5′ UTR y 3′ UTR en módulos independientes (`c5UTRGen` y `c3UTRGen`), cada uno con su propio tokenizador y código de generación personalizado, lo que sugiere que no comparten pesos ni vocabulario de forma directa.

El entrenamiento se organiza en dos fases. Primero, un preentrenamiento sobre secuencias UTR (checkpoints `*-pretrained`). Después, una optimización mediante aprendizaje por refuerzo (checkpoints `*-RL`), presumiblemente con una recompensa ligada a la predicción funcional de las secuencias generadas, aunque la model card no especifica la función de recompensa, el algoritmo de RL ni el volumen de datos. Para el diseño de longitud completa, se entrenan de forma conjunta dos políticas (`policy_5utr` y `policy_3utr`) que se muestrean de manera independiente y se combinan: con `--count 4` se generan cuatro candidatos por extremo y se devuelven dieciséis combinaciones. No se detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como DPO o decodificación especulativa.

## Capacidades

- Generación de secuencias 5′ UTR condicionadas por una secuencia CDS de entrada.
- Generación de secuencias 3′ UTR condicionadas por una secuencia CDS de entrada.
- Generación conjunta de ambos UTR para el diseño de ARNm de longitud completa con CDS fijo, mediante dos políticas emparejadas.
- Predicción funcional de secuencias UTR (la model card menciona "functional prediction" junto a la generación y el diseño).
- Diseño de secuencias guiado por objetivos funcionales gracias a la optimización por refuerzo de los checkpoints `-RL`.
- Muestreo de múltiples candidatos por ejecución (`--count`) para explorar el espacio de secuencias.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni multilingüismo; el modelo opera sobre secuencias biológicas, no sobre lenguaje natural.

## Casos de uso

- Diseño de vacunas de ARNm: dado el CDS de un antígeno, generar 5′ y 3′ UTR candidatos que puedan modular la traducción y la estabilidad del transcrito, usando los checkpoints `-RL` para priorizar secuencias con mayor potencial funcional.
- Optimización de terapias de ARNm: emplear la generación conjunta de longitud completa (`full-length-RL`) para obtener combinaciones coordinadas de ambos UTR y seleccionar las más prometedoras antes de la síntesis y validación experimental.
- Exploración de espacio de diseño: usar `--count` elevado para muestrear decenas de candidatos por CDS y filtrar posteriormente con modelos de predicción funcional o criterios experimentales.
- Predicción funcional de UTR existentes: aprovechar la componente de predicción del modelo para clasificar o puntuar secuencias UTR de interés antes de incorporarlas a un constructo.
- Investigación en biología del ARN: estudiar qué patrones de secuencia aprende el modelo en condiciones de CDS fijo, comparando las distribuciones de los checkpoints preentrenados frente a los optimizados por RL.
- Generación de datos sintéticos para entrenamiento: producir conjuntos de UTR plausibles condicionados por CDS para aumentar el corpus de modelos predictivos posteriores, con la cautela de validar la calidad biológica de las secuencias generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 6,1 GB e incluye seis checkpoints; el tamaño por checkpoint individual no se detalla, por lo que no es posible estimar la VRAM con precisión.
- GPU recomendadas: no disponible. Al tratarse de un encoder-decoder de tamaño no especificado, no se puede confirmar si cabe en GPU de consumo.
- Inferencia en GPU de consumo: no confirmado; depende del tamaño real de cada checkpoint, que la model card no indica.
- Opciones de despliegue: la model card solo documenta el uso mediante los scripts de generación del repositorio de código (`c5UTRGen/generate.py`, `c3UTRGen/generate.py`, `full-length/generate.py`) con la librería `transformers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la tokenización personalizada dificulta un despliegue directo en servidores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de generacion de UTR ni datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si se permite el uso comercial; debe consultarse con el autor antes de cualquier aplicación productiva.
- No se publican métricas de rendimiento ni validación experimental, por lo que la calidad biológica de las secuencias generadas no está cuantificada en la información disponible.
- No se detallan el tamaño del modelo, la longitud de contexto ni el corpus de entrenamiento, lo que limita la reproducibilidad y la evaluación independiente.
- La tokenización y el código de generación son personalizados y deben usarse desde el repositorio `HIM-AIM/cUTRGen`; no es un modelo plug-and-play con pipelines estándar de `transformers`.
- Riesgo de generar secuencias no funcionales o con propiedades no deseadas (por ejemplo, estructuras secundarias problemáticas o motivos regulatorios no previstos); se requiere validación in silico e in vitro.
- El modelo está especializado en secuencias biológicas y no debe emplearse para tareas de lenguaje natural.
- No se documentan sesgos, pero al entrenarse sobre un corpus biológico no especificado podría reproducir sesgos de composición del dataset (por ejemplo, sobrerrepresentación de ciertos organismos o tipos de UTR).
- El repositorio se creó y actualizó en noviembre de 2026 según los metadatos, con cero descargas y cero likes en el momento de la consulta; se trata de una publicación muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ZhweCheng/cUTRGen
- Repositorio de código: https://github.com/HIM-AIM/cUTRGen
