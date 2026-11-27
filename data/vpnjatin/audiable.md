# vpnjatin/audiable

## Resumen

Audiable es un modelo de síntesis de voz (text-to-speech) publicado en Hugging Face por el usuario vpnjatin bajo licencia MIT. Se trata de una distribución del modelo Chatterbox Multilingual V3 de Resemble AI, un TTS de 0,5 mil millones de parámetros construido sobre una arquitectura Llama y orientado a la clonación de voz zero-shot en 23 idiomas. El repositorio ocupa 13,9 GB y utiliza la librería `chatterbox` para su carga e inferencia.

El modelo resuelve el problema de generar habla natural y expresiva en múltiples idiomas a partir de una muestra de referencia de voz, sin necesidad de entrenamiento adicional. Frente a versiones anteriores de la familia Chatterbox, la V3 mejora la similitud del hablante entre idiomas, reduce las alucinaciones (continuaciones no solicitadas, repeticiones y habla fuera del guion) y produce un habla más conversacional. Incorpora además un control de exageración emocional, una característica poco habitual en modelos TTS de código abierto.

Su relevancia actual radica en que ofrece una alternativa abierta y comercialmente permisiva a sistemas propietarios como ElevenLabs, con marca de agua en las salidas y un script de conversión de voz incluido. El modelo está entrenado sobre 0,5 millones de horas de datos limpiados y declara un rendimiento superior a ElevenLabs en evaluaciones por pares, aunque estos resultados proceden del propio autor y no se han verificado de forma independiente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (backbone de 0,5B) para TTS |
| Parametros totales | 0,5 mil millones (500M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 23: arabe, danes, aleman, griego, ingles, espanol, finlandes, frances, hebreo, hindi, italiano, japones, coreano, malayo, neerlandes, noruego, polaco, portugues, ruso, sueco, suajili, turco, chino |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 13,9 GB; la model card no detalla el formato) |

## Arquitectura y entrenamiento

El modelo emplea un backbone Transformer de tipo Llama con 0,5 mil millones de parámetros, adaptado para la generación de habla. La inferencia está guiada por alineamiento (alignment-informed inference), lo que aporta estabilidad y reduce las alucinaciones típicas de los sistemas TTS autorregresivos, como continuaciones no deseadas o repeticiones. El modelo soporta clonación de voz zero-shot a partir de una muestra de referencia y expone dos parámetros de control en la generación: `exaggeration` (intensidad expresiva) y `cfg` (guidance scale).

El entrenamiento se realizó sobre 0,5 millones de horas de datos limpiados. La model card no detalla la composición exacta del dataset, el número de tokens, ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. Sí se indica que las salidas incorporan marca de agua y que se incluye un script de conversión de voz.

## Capacidades

- Generación de voz a partir de texto en 23 idiomas, con cobertura amplia y un único modelo multilingüe.
- Clonación de voz zero-shot: reproduce la identidad y el acento del hablante de referencia a partir de una muestra de audio.
- Control de exageración emocional (`exaggeration`), que permite modular la expresividad del habla generada.
- Ajuste de `cfg` para controlar el ritmo y la fidelidad al hablante de referencia.
- Inferencia estable guiada por alineamiento, con reducción de alucinaciones respecto a versiones anteriores.
- Salidas con marca de agua para trazabilidad del contenido generado.
- Script de conversión de voz incluido en el repositorio.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada más allá de la muestra de referencia para clonación.

## Casos de uso

- Localización de contenido audiovisual: un mismo modelo genera voces en los 23 idiomas soportados, lo que simplifica doblajes y versiones regionales sin cambiar de pipeline.
- Audiolibros y narración: el control de `exaggeration` permite ajustar la expresividad según el género del texto, y el `cfg` bajo mantiene un ritmo constante en pasajes largos.
- Asistentes de voz y agentes conversacionales: la clonación zero-shot permite dotar a un agente de una voz de marca consistente, y la reducción de alucinaciones disminuye el riesgo de habla fuera del guion en producción.
- Accesibilidad: generación de voz personalizada para usuarios que necesiten una voz sintética que se aproxime a la suya, a partir de una muestra de referencia.
- Videojuegos y personajes interactivos: el control de intensidad expresiva permite generar variantes emocionales de una misma voz para distintos estados del personaje.
- Creación de contenido para redes y podcasts: generación rápida de voces en varios idiomas con una sola muestra de referencia, útil para prototipado y producción ligera.
- Investigación en TTS: al ser MIT y de 0,5B, sirve como base para fine-tuning y experimentación en clonación de voz multilingüe.

## Benchmarks y rendimiento

La model card afirma que el modelo supera a ElevenLabs y es preferido de forma consistente en evaluaciones por pares, con un enlace a Podonos. Sin embargo, no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni métricas TTS numéricas (MOS, WER, similitud de hablante) en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,5B de parámetros, la inferencia en precisión nativa requiere del orden de 1-2 GB de pesos, aunque el repositorio completo ocupa 13,9 GB.
- GPU recomendadas: no especificadas en la model card. Por tamaño, una GPU consumer moderna (RTX 3060 o superior) debería ser suficiente; A100/H100 para despliegues de alto throughput.
- Cabe en GPU consumer: probable por el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: librería `chatterbox` (indicada como `library_name`), demo en Hugging Face Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El servicio comercial de Resemble AI declara latencia inferior a 200 ms, pero no se atribuye al modelo abierto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Audiable (Chatterbox Multilingual V3) | 500M | 23 | MIT | Clonación zero-shot, control de exageración, marca de agua |
| Chatterbox (original, inglés) | 500M | 1 (inglés) | MIT | Controles CFG y exageración, TTS zero-shot en inglés |
| Chatterbox Single Language Pack | 500M cada uno | 6 fine-tunes | MIT | Fine-tunes dedicados: chino, español LatAm, portugués brasileño, español de España, portugués de Portugal, hindi |
| ElevenLabs | no disponible | no disponible | Propietaria | Referencia cerrada; la model card afirma que Chatterbox es preferido en evaluaciones por pares |

## Limitaciones y advertencias

- Los benchmarks y la afirmación de superioridad frente a ElevenLabs proceden del propio autor y no se han verificado de forma independiente en la información disponible.
- Riesgo de alucinación: aunque la V3 reduce continuaciones no deseadas y repeticiones, el modelo sigue siendo autorregresivo y puede generar habla fuera del guion en entradas atípicas.
- Sesgos: no se documentan sesgos conocidos, pero un modelo entrenado sobre 0,5M horas de datos puede reproducir sesgos de acento, género o idioma presentes en el corpus.
- Cobertura idiomática desigual: los 23 idiomas no tienen por qué rendir igual; el propio autor publica fine-tunes dedicados para lenguas prioritarias, lo que sugiere que el modelo general es más débil en ellas.
- Restricciones de licencia: MIT permite uso comercial, pero la clonación de voz conlleva obligaciones legales y éticas sobre consentimiento y derechos de imagen que la licencia no cubre.
- Las salidas llevan marca de agua; conviene verificar que esto no interfiera con los requisitos del producto.
- El repositorio es una redistribución de un tercero (vpnjatin) del modelo de Resemble AI; la trazabilidad y el soporte dependen del autor original.
- No se documentan requisitos de hardware ni formatos de cuantización, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vpnjatin/audiable
- Repositorio original de Chatterbox (Resemble AI): https://github.com/resemble-ai/chatterbox
- Demo de muestras: https://resemble-ai.github.io/chatterbox_demopage/
- Space de Chatterbox: https://huggingface.co/spaces/ResembleAI/Chatterbox
- Space de Chatterbox Multilingual TTS V3: https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-V3
- Evaluación en Podonos: https://podonos.com/resembleai/chatterbox
- Sitio de Resemble AI: https://resemble.ai
