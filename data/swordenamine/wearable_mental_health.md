# swordenamine/wearable_mental_health

## Resumen

`swordenamine/wearable_mental_health` no es un modelo de lenguaje: es un repositorio de proyecto que describe una pulsera biométrica de vigilancia de salud mental y el pequeño modelo de aprendizaje automático que la acompaña. Según la model card, el dispositivo captura variabilidad de la frecuencia cardiaca (HRV), respuesta galvánica de la piel (GSR) y datos de acelerómetro/giroscopio, y un modelo TinyML basado en una red convolucional 1D cuantizada a 8 bits estima en el propio dispositivo una probabilidad de estrés o ansiedad, notificando al usuario por vibración cuando se supera un umbral.

El problema que dice abordar es la falta de monitorización continua y objetiva de signos tempranos de agotamiento (burnout) y episodios de ansiedad, frente a la dependencia actual de autoinformes subjetivos y visitas clínicas espaciadas. La propuesta es ejecutar la inferencia íntegramente offline en un microcontrolador ARM Cortex-M4, con un consumo declarado inferior a 1 mW y una latencia inferior a 10 ms por inferencia, preservando la privacidad al no enviar señales crudas a la nube.

Su relevancia práctica es limitada en el momento de redactar esta ficha: el repositorio acumula 0 descargas y 0 likes, no publica pesos del modelo, no declara pipeline ni idiomas en los metadatos de HuggingFace, y la única métrica de rendimiento ofrecida (87 % de accuracy) se ha medido sobre eventos de estrés sintéticos, no sobre sujetos reales. El contenido disponible es esencialmente código de simulación (`core.py`, `demo.py`) y documentación de diseño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional 1D (CNN 1D), orientada a TinyML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de series temporales de sensores, no de texto) |
| Tipos de cuantizacion | 8 bits (int8), según la model card |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; no hay interfaz de texto) |
| Licencia | MIT según el README y el badge del repositorio; el metadato de licencia de HuggingFace figura como no disponible |
| Formato de pesos | no disponible (el repositorio solo lista `core.py`, `demo.py`, `requirements.txt`, `LICENSE` y `README.md`) |
| Entradas del modelo | HRV (PPG), respuesta galvánica de la piel (GSR) y datos de IMU (acelerómetro/giroscopio) |
| Hardware objetivo | ARM Cortex-M4 |
| Latencia declarada | < 10 ms por inferencia en Cortex-M4 |
| Consumo declarado | < 1 mW de media |
| Framework de inferencia | no disponible |
| Pipeline en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura descrita es una CNN 1D que opera sobre señales fisiológicas previamente acondicionadas y convertidas en características. El flujo declarado es: sensores (PPG, GSR, IMU) → acondicionamiento de señal → extracción de características → modelo TinyML → probabilidad de estrés → notificación si se supera un umbral. El modelo se cuantiza a 8 bits para encajar en las restricciones de memoria y cómputo de un Cortex-M4 y funcionar de forma completamente offline.

No se especifica ningún detalle verificable del entrenamiento: ni el número de tokens o muestras, ni la composición del conjunto de datos, ni el número de sujetos, ni si hubo ajuste fino con retroalimentación humana. La model card solo indica que la accuracy del 87 % se obtuvo «on synthetic stress events», es decir, sobre eventos de estrés generados sintéticamente por el propio simulador del proyecto. No se documenta validación con datos fisiológicos reales, ni protocolo de etiquetado, ni análisis de sensibilidad o especificidad. Tampoco se describe ninguna innovación técnica más allá del enfoque estándar de TinyML con cuantización int8.

## Capacidades

- Clasificación binaria o probabilística de estrés/ansiedad a partir de señales fisiológicas (HRV, GSR, IMU), según la descripción del proyecto.
- Extracción de características de series temporales fisiológicas en `core.py`.
- Simulación de 24 horas de datos de sensores y reproducción de los momentos en que se dispararía una alerta (`demo.py`).
- Inferencia en el dispositivo, sin conectividad, con latencia declarada inferior a 10 ms.
- Generación de notificaciones por vibración al superar un umbral configurable.
- Compartición opcional de datos anonimizados con un cuidador o profesional.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No hay evidencias de capacidades multilingües porque no existe componente de lenguaje.

## Casos de uso

- Monitorización continua de estrés en wearables: el modelo se integraría en el firmware de una pulsera con Cortex-M4 para estimar en tiempo real la probabilidad de estrés a partir de HRV y GSR, disparando una vibración cuando se superase el umbral calibrado.
- Detección temprana de burnout en entornos laborales: registro longitudinal de las puntuaciones de estrés para identificar tendencias sostenidas de dominancia simpática antes de que aparezca un cuadro agudo, siempre que se sustituya la validación sintética por datos reales.
- Investigación en salud digital: uso de `core.py` y `demo.py` como base reproducible para prototipar pipelines de acondicionamiento de señal y extracción de características antes de entrenar con cohortes reales.
- Docencia y prototipado TinyML: el repositorio sirve como ejemplo didáctico de cuantización int8 y despliegue en microcontroladores de bajo consumo, con una simulación completa de 24 horas ejecutable en local.
- Diseño de sistemas de alerta para pacientes ambulatorios: integración del score en una aplicación móvil que avise al paciente o a su cuidador cuando se detecte un patrón compatible con un episodio de ansiedad, sujeto a validación clínica previa.
- Referencia de arte previo: el autor declara explícitamente que el repositorio se publica «as prior art for patent protection», por lo que puede citarse como estado de la técnica en solicitudes de patente sobre wearables de salud mental.
- Base para sistemas de gestión energética en wearables: el presupuesto de menos de 1 mW y menos de 10 ms por inferencia es un punto de partida útil para evaluar la viabilidad de clasificadores fisiológicos en dispositivos alimentados por batería de célula moneda.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los siguientes, y no proceden de un benchmark estándar ni de una evaluación independiente:

| Metrica | Valor declarado | Condiciones |
|---|---|---|
| Accuracy | 87 % | Sobre eventos de estrés sintéticos generados por el propio proyecto |
| Latencia de inferencia | < 10 ms | ARM Cortex-M4 |
| Consumo medio | < 1 mW | ARM Cortex-M4 |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni en ningún otro benchmark de modelos de lenguaje, y tampoco se han publicado métricas clínicas estándar (sensibilidad, especificidad, AUC, F1) sobre poblaciones reales. Cualquier comparación numérica con otros modelos no es posible con los datos disponibles.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el modelo está diseñado para ejecutarse en un microcontrolador, no en una GPU.
- GPU recomendadas: ninguna. El objetivo declarado es un ARM Cortex-M4, habitual en pulseras y dispositivos vestibles.
- Cabe en GPU de consumo: sí, pero es irrelevante, porque el despliegue previsto es en el propio dispositivo; ejecutarlo en una RTX 4090 o similar no aporta ninguna ventaja.
- Opciones de despliegue: no disponible. La model card no indica si se usa TensorFlow Lite for Microcontrollers, CMSIS-NN, Edge Impulse ni ninguna otra cadena de herramientas; solo menciona la cuantización a 8 bits y el soporte de Cortex-M4.
- Latencia y throughput: menos de 10 ms por inferencia en Cortex-M4 según el autor; no se especifica la frecuencia de muestreo de las señales ni el throughput sostenible.
- Consumo energético: menos de 1 mW de media, dato declarado sin metodología de medida.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa rigurosa. El repositorio no publica pesos, no define un formato de modelo y no reporta métricas sobre datos reales, de modo que no puede contrastarse numéricamente con otros clasificadores fisiológicos TinyML.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `swordenamine/wearable_mental_health` | no disponible | no aplica | 87 % accuracy sobre datos sintéticos | MIT según README | Repositorio con código de simulación, sin pesos |
| Alternativas de clasificación fisiológica TinyML | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de modelos de lenguaje de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos de lenguaje no procede porque este artefacto no es un modelo de lenguaje ni comparte tarea, modalidad ni métricas con ellos.

## Limitaciones y advertencias

- No se publican pesos ni artefactos de modelo: quien quiera usarlo debe reentrenar a partir de `core.py`, cuyas características exactas no se detallan.
- La única métrica de rendimiento (87 % de accuracy) se ha medido sobre eventos sintéticos generados por el propio proyecto, un escenario muy favorable y sin valor clínico. No hay validación con sujetos reales ni métricas de sensibilidad y especificidad.
- Riesgo de falsos positivos y falsos negativos en producción: una notificación de ansiedad o burnout mal calibrada puede generar ansiedad adicional o normalizar la ausencia de ayuda profesional.
- Advertencia sanitaria: el proyecto no declara validación clínica ni conformidad regulatoria (CE, FDA) y no debería presentarse como herramienta de diagnóstico. Cualquier uso en salud requiere evaluación ética y regulatoria independiente.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo. El riesgo equivalente es la clasificación errónea con apariencia de objetividad.
- Sesgos: no se documenta la composición demográfica del conjunto de datos (edad, sexo, condiciones cardiovasculares, medicación), por lo que se desconoce el comportamiento del modelo en poblaciones distintas de las de entrenamiento. Las señales GSR y HRV varían notablemente con la temperatura, la actividad física y la medicación.
- Privacidad: aunque la inferencia es local, la model card contempla compartir datos anonimizados con cuidadores; no se detalla el esquema de anonimización ni su robustez.
- Licencia: el README declara MIT, pero el metadato de licencia de HuggingFace aparece como no disponible; conviene verificar el archivo `LICENSE` antes de un uso comercial. La declaración de intención como «prior art for patent protection» no restringe el uso, pero sí condiciona la estrategia de propiedad intelectual.
- Inconsistencias documentales: la fecha de creación del repositorio (2026-10-17) es posterior a la de actualización (2026-03-07), el autor de HuggingFace es `swordenamine` mientras que el README firma como «swordenkisk», y la model card incluye emojis y afirmaciones de rendimiento sin metodología.
- Señal de madurez muy baja: 0 descargas, 0 likes y ausencia de pipeline, idiomas y licencia en los metadatos. No hay issues, discusión ni mantenimiento verificable.
- La búsqueda web realizada no ha devuelto ningún resultado relacionado con el modelo ni con el autor; los resultados obtenidos eran contenido no técnico y ajeno al proyecto, por lo que no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/wearable_mental_health
- Licencia MIT referenciada en el badge de la model card: https://opensource.org/licenses/MIT
- Paper, blog, repositorio de código independiente o demo pública: no disponible en la información proporcionada.
- Resultados de búsqueda web relevantes: no disponible (la búsqueda no devolvió ninguna fuente relacionada con el modelo).
