# ThermoFluidFoundation/boiling-intelligence

## Resumen

Boiling Intelligence es un prototipo mínimo de un "físico IA autónomo" orientado al descubrimiento de leyes constitutivas en transferencia de masa con cambio de fase (ebullición). Desarrollado por ThermoFluidFoundation, el sistema implementa un bucle científico cerrado: mantiene hipótesis en competencia, diseña experimentos discriminatorios, consulta un mundo físico sintético, actualiza la evidencia, detecta fallos de clase de modelo, infiere una corrección constitutiva mínima, la compila en un nuevo modelo ejecutable y reintroduce el modelo revisado en el bucle de falsificación. La versión actual (v0.4) demuestra la arquitectura con una ley sintética oculta, sin pretender descubrir una ley real de ebullición.

El sistema no es un modelo de lenguaje grande en sí, sino un agente que orquesta un LLM externo (gpt-oss:20b) a través de Ollama para razonar y proponer correcciones. Su relevancia radica en explorar cómo la IA agéntica puede automatizar el ciclo completo de descubrimiento científico en termofluidos, un campo donde los modelos de aprendizaje automático se usan cada vez más para predecir coeficientes de transferencia de calor y dinámica de burbujas. La licencia MIT facilita su adopción y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema agéntico que orquesta un LLM externo (gpt-oss:20b) vía Ollama; no se especifica arquitectura interna del agente |
| Parametros totales | no disponible (depende del LLM subyacente, gpt-oss:20b) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene código Python y scripts, no pesos de modelo) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del agente ni el proceso de entrenamiento. Se describe como un "prototipo mínimo" que implementa un bucle de falsificación científica. El flujo incluye: mantener closures de transferencia de masa en competencia, diseñar tests discriminatorios, consultar un mundo sintético oculto, actualizar evidencia, detectar fallos de clase de modelo, inferir una corrección constitutiva mínima (por ejemplo, \(M_3 = 0.8\,\Delta T + 0.00196515\,\Delta T^2\)), compilar la corrección en un nuevo modelo ejecutable y reinsertarlo en el bucle. El LLM gpt-oss:20b se usa como motor de razonamiento, pero no se especifican datos de entrenamiento, número de tokens ni técnicas como RLHF o DPO. No hay innovaciones técnicas declaradas más allá del propio bucle agéntico.

## Capacidades

- Ejecuta un bucle científico cerrado de descubrimiento de leyes constitutivas en un entorno sintético.
- Mantiene y compara múltiples closures de transferencia de masa en competencia.
- Diseña experimentos discriminatorios para distinguir entre hipótesis.
- Consulta un "mundo físico" sintético oculto y actualiza la evidencia.
- Detecta fallos de clase de modelo (cuando ninguna hipótesis existente explica los datos).
- Infiere correcciones constitutivas mínimas y las compila en modelos ejecutables.
- Reintroduce modelos revisados en el bucle de falsificación.
- No es un modelo generativo de texto, visión ni audio; su capacidad se limita al dominio de la ebullición sintética.

## Casos de uso

- Descubrimiento automatizado de leyes en termofluidos: el sistema puede explorar sistemáticamente familias de closures constitutivas y proponer correcciones cuando los datos experimentales (sintéticos o reales) contradicen las hipótesis vigentes.
- Validación de arquitecturas de IA agéntica para ciencia: sirve como banco de pruebas para evaluar si un agente puede cerrar el ciclo hipótesis-experimento-revisión sin intervención humana.
- Generación de modelos reducidos para simulación multifásica: las correcciones compiladas podrían integrarse en simuladores CFD (p. ej., Basilisk) como closures de transferencia de masa.
- Formación de investigadores en IA para ciencia: el código, al ser mínimo y con licencia MIT, puede usarse como ejemplo didáctico de bucle de descubrimiento.
- Integración con entornos de laboratorio reales: aunque la versión actual usa un mundo sintético, la arquitectura está diseñada para conectar con datos experimentales de ebullición (roadmap).
- Exploración de estrategias de falsificación en aprendizaje automático: permite estudiar cómo un agente detecta fallos de modelo y propone correcciones mínimas, un problema central en la fiabilidad de los surrogatos neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo muestra un ejemplo de ley descubierta en el entorno sintético, sin métricas cuantitativas de precisión, velocidad ni comparación con otros métodos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la model card.
- El sistema depende de Ollama y del modelo gpt-oss:20b, por lo que se necesita una GPU con suficiente VRAM para ejecutar un LLM de 20B parámetros (típicamente 12-16 GB en cuantización, aunque no se confirma).
- Opciones de despliegue: el código se ejecuta con `python main.py` tras instalar dependencias y arrancar Ollama. No se mencionan vLLM, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay un modelo directamente comparable, ya que Boiling Intelligence es un sistema agéntico de descubrimiento, no un predictor de ebullición. Como referencia cercana en el dominio, Bubbleformer (arXiv:2507.21244) es un transformer para forecasting de dinámica de ebullición, pero no realiza descubrimiento de leyes. La comparación es limitada:

| Modelo | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| Boiling Intelligence | Agente científico (LLM orquestado) | Descubrimiento de closures | MIT | Repositorio abierto |
| Bubbleformer | Transformer | Forecasting de ebullición | no disponible | arXiv, código no confirmado |
| Modelos de IA en ebullición (revisión) | ML/DL variados | Predicción de coeficientes, dinámica de burbujas | variada | variada |

## Limitaciones y advertencias

- Es un prototipo mínimo (v0.4) y no pretende descubrir leyes reales de ebullición; la ley sintética mostrada es solo para validar la arquitectura.
- El mundo físico es sintético y oculto; no hay validación con datos experimentales reales.
- Depende de un LLM externo (gpt-oss:20b) y de Ollama; el rendimiento y la fiabilidad del razonamiento dependen de ese modelo, no del propio sistema.
- No se especifican sesgos, pero al usar un LLM genérico, pueden heredarse sesgos del modelo subyacente.
- Riesgo de alucinación en las correcciones propuestas si el LLM genera leyes sin base suficiente; el bucle de falsificación mitiga parcialmente este riesgo, pero no lo elimina.
- No hay garantías de robustez para aplicaciones de producción en ingeniería térmica.
- La licencia MIT permite uso comercial, pero el software se distribuye sin garantías.

## Enlaces

- HuggingFace: https://huggingface.co/ThermoFluidFoundation/boiling-intelligence
- Revisión de IA en transferencia de calor por ebullición (ScienceDirect): https://www.sciencedirect.com/org/science/article/pii/S1555256X26000330
- Journal AI Thermal Fluids: https://www.sciencedirect.com/journal/ai-thermal-fluids
- Bubbleformer (arXiv): https://arxiv.org/abs/2507.21244v1
