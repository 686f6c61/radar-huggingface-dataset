# TomerBo/RadarGen_600M_512px_nuScenes

## Resumen

RadarGen es un modelo de difusión para la generación de nubes de puntos de radar automotriz a partir de imágenes de cámaras multivista. Lo desarrollan Tomer Borreda, Fangqiang Ding, Sanja Fidler, Shengyu Huang y Or Litany, y se presenta en el artículo arXiv:2512.17897 (ECCV 2026). El modelo resuelve un problema clásico en la simulación de sensores: generar datos de radar realistas sin necesidad de capturas reales, aprovechando únicamente la información visual disponible en datasets de conducción.

La arquitectura adapta la difusión latente de imágenes al dominio del radar representando las mediciones en vista de pájaro (BEV), codificando estructura espacial junto con sección transversal radar (RCS) y atributos Doppler. Un paso ligero de recuperación reconstruye la nube de puntos a partir de los mapas generados. El modelo incorpora señales de profundidad, semántica y movimiento alineadas en BEV, extraídas de modelos fundacionales preentrenados, para guiar la generación estocástica hacia patrones de radar físicamente plausibles.

Esta versión concreta (600M de parámetros, 512 px) está entrenada sobre el dataset nuScenes y se distribuye como pesos preentrenados en formato safetensors. Es relevante porque abre una vía escalable para la simulación generativa multimodal en conducción autónoma, reduciendo la brecha entre percepción entrenada con datos sintéticos y con datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (image-latent diffusion adaptada al dominio radar, representación BEV) |
| Parametros totales | 600M (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa pares de frames consecutivos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según metadatos) |
| Licencia | other (NSCL v2-custom heredada de SANA + CC BY-NC-SA 4.0 de nuScenes; solo uso no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RadarGen es un modelo de difusión que traslada el paradigma de la difusión latente de imágenes al dominio del radar. En lugar de generar directamente nubes de puntos dispersas, el modelo representa las mediciones de radar en mapas BEV que codifican estructura espacial, RCS y Doppler, aplica difusión sobre esa representación latente y, finalmente, un paso ligero de recuperación reconstruye la nube de puntos. La condicionalidad proviene de imágenes multivista de cámaras, enriquecidas con señales de profundidad, semántica y movimiento alineadas en BEV extraídas de modelos fundacionales preentrenados, lo que guía el proceso de generación hacia patrones físicamente plausibles.

El entrenamiento se realiza sobre el dataset nuScenes, un corpus a gran escala de conducción urbana con sensores sincronizados (cámaras, radar, LiDAR). La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, ni si se aplicaron etapas de RLHF/DPO (no aplicables típicamente a modelos generativos de este tipo). La innovación técnica principal es la adaptación de difusión latente de imágenes al radar mediante representación BEV con atributos físicos, junto con la incorporación de priors de modelos fundacionales para alinear la generación con la escena visual.

## Capacidades

- Generación de nubes de puntos de radar automotriz a partir de pares de frames consecutivos de cámaras multivista.
- Representación intermedia en BEV que codifica estructura espacial, RCS y Doppler.
- Condicionalidad multimodal: profundidad, semántica y movimiento alineados en BEV extraídos de modelos fundacionales.
- Generación estocástica (difusión) que produce muestras diversas y físicamente plausibles.
- Compatibilidad, en principio, con datasets visuales y frameworks de simulación existentes al condicionar sobre imágenes.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un LLM).
- No dispone de capacidades de visión generales ni de audio; su entrada son imágenes de cámara de conducción.
- Capacidades multilingües no aplicables (modelo de percepción/generación, no de lenguaje).

## Casos de uso

- Simulación de sensores para conducción autónoma: generar nubes de puntos de radar sintéticas a partir de imágenes de cámara para aumentar datasets de entrenamiento de modelos de percepción, reduciendo la dependencia de capturas reales de radar.
- Aumento de datos para percepción radar: producir muestras adicionales etiquetadas implícitamente por la escena visual para entrenar detectores y segmentadores de radar.
- Validación de pipelines multimodal: comprobar la coherencia entre cámaras y radar en sistemas de fusión de sensores usando datos generados con distribución realista.
- Investigación en generación multimodal: estudiar la transferencia de difusión latente de imágenes a dominios de sensores físicos (radar) con representación BEV.
- Prototipado en entornos con escasez de radar: desarrollar y depurar algoritmos de percepción radar en escenarios donde no se dispone de capturas reales de radar pero sí de vídeo.
- Benchmarking de simulación generativa: evaluar hasta qué punto los datos sintéticos cierran la brecha con modelos entrenados en datos reales, tal como reporta el artículo.
- Docencia y demostraciones: ilustrar la generación condicionada de modalidades de sensado en cursos de conducción autónoma y visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma cualitativa que RadarGen captura las distribuciones características de las mediciones de radar y reduce la brecha con modelos de percepción entrenados en datos reales, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras métricas de percepción como FID, Chamfer distance, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 2,4 GB en safetensors, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo con suficiente memoria para lotes pequeños (orientativamente por debajo de 8-10 GB en precisión nativa, aunque no se confirma en la información).
- GPU recomendadas: no disponible. Por tamaño (600M) es plausible su ejecución en GPUs de consumo tipo RTX 3090/4090, pero no se documenta.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño, aunque no se confirma en la información disponible.
- Opciones de despliegue: la model card solo documenta inferencia mediante la API Python del paquete `radargen` (`RadarGenInference`) con checkpoint en safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de generación de nubes de puntos de radar a partir de cámaras con datos públicos de rendimiento. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RadarGen 600M 512px nuScenes | 600M | no aplica | other (no comercial) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia estrictamente no comercial: hereda NSCL v2-custom de SANA y CC BY-NC-SA 4.0 de nuScenes; el uso comercial está prohibido.
- Entrenado exclusivamente sobre nuScenes, lo que limita su generalización a otras ciudades, condiciones meteorológicas o configuraciones de sensores no representadas.
- La calidad de la generación depende de la calidad de las señales de profundidad, semántica y movimiento extraídas de modelos fundacionales; errores en esas señales pueden propagarse.
- Riesgo de generar patrones de radar físicamente implausibles en escenas fuera de distribución (por ejemplo, entornos no urbanos o condiciones extremas).
- Representación intermedia en BEV con recuperación posterior: puede perder detalle fino de la nube de puntos respecto a capturas reales.
- Idioma y dominio restringidos: no es un modelo de lenguaje ni un modelo multimodal general; no debe usarse para tareas de NLP.
- Sin datos publicados de benchmarks en la información disponible, lo que dificulta una evaluación cuantitativa previa al despliegue.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción aún muy limitada y escasa validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/TomerBo/RadarGen_600M_512px_nuScenes
- Artículo arXiv: https://arxiv.org/abs/2512.17897
- Página del proyecto: https://radargen.github.io/
- Repositorio GitHub: https://github.com/tomerborreda/RadarGen
- Dataset nuScenes: https://www.nuscenes.org/nuscenes
- Términos de uso de nuScenes: https://www.nuscenes.org/terms-of-use
- Licencia SANA (NSCL v2-custom): https://huggingface.co/Efficient-Large-Model/Sana_1600M_512px_MultiLing_diffusers/blob/main/LICENSE.txt
- Página del autor Tomer Borreda: https://tomerborreda.github.io/
- Página del autor Fangqiang Ding: https://toytiny.github.io/
- Página del autor Sanja Fidler: https://www.cs.utoronto.ca/~fidler/
- Página del autor Shengyu Huang: https://shengyuh.github.io/
- Página del autor Or Litany: https://orlitany.github.io/
