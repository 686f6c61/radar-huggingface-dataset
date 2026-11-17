# xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-GGUF

## Resumen

Qwen3.5-0.8B-sintaxi-catala-20k-GGUF es la versión cuantizada a 4 bits (Q4_K_M, 535 MB) de un modelo especializado en análisis sintáctico del catalán, desarrollado por Xavier Vinaixa Roselló (xaviviro, Sorensen AI, Barcelona) a partir de una base Qwen3.5 de 0,8B parámetros. El modelo recibe una única oración en catalán y devuelve directamente su análisis sintáctico en formato JSON, sin cadena de razonamiento intermedia. Está pensado para ejecución local en CPU o GPU de gama baja mediante LM Studio o llama.cpp.

La relevancia del modelo reside en su especialización extrema: no es un modelo conversacional generalista, sino un destilado de tarea única (análisis sintáctico) con plantilla de chat que desactiva siempre el modo *thinking*, tal como se entrenó. El repositorio GGUF ocupa 0,5 GB y el modelo base cuenta con 752.393.024 parámetros reales según safetensors, lo que lo sitúa en la franja de modelos ultraligeros aptos para portátiles y dispositivos sin GPU dedicada.

La ficha del modelo documenta una validación medida frente al original en bf16 sobre 30 oraciones de referencia manual a temperatura 0: 100 % de salidas JSON válidas y 100 % de análisis idénticos al modelo sin cuantizar. Esa métrica mide fidelidad de la cuantización respecto al original, no la corrección lingüística del análisis, que remite a la ficha del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.5 de 0,8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits, 535 MB) |
| Idiomas soportados | catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y LM Studio) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada; se trata de un derivado de la familia Qwen3.5 en su variante de 0,8B, con 752.393.024 parámetros totales. El modelo ha sido destilado para una tarea concreta: dado un enunciado en catalán, generar su análisis sintáctico en JSON. La plantilla de chat incluida en el GGUF desactiva de forma explícita el modo *thinking*, coherente con el entrenamiento recibido.

El proceso de cuantización aplicado es Q4_K_M, que reduce el peso a 535 MB. La model card reporta una validación sobre 30 oraciones de referencia manual comparando el Q4_K_M con el modelo original en bf16 a temperatura 0, con un 100 % de coincidencia exacta en el análisis y un 100 % de JSON válido. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Análisis sintáctico del catalán: recibe una oración y devuelve su estructura sintáctica en JSON.
- Salida estructurada: genera JSON válido de forma consistente según la validación reportada (100 % sobre 30 oraciones).
- Modo sin razonamiento: la plantilla de chat desactiva siempre el *thinking*, por lo que responde directamente con el análisis.
- Ejecución local: compatible con llama.cpp y LM Studio en macOS, Windows y Linux.
- Integración vía servidor: `llama-server` con soporte de plantilla Jinja (`--jinja`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo más allá del catalán.

## Casos de uso

- Anotación sintáctica de corpus catalanes: el modelo procesa oraciones individuales y devuelve JSON estructurado, lo que permite integrarlo en pipelines de anotación lingüística por lotes con temperatura 0 para maximizar la consistencia.
- Herramientas docentes de gramática catalana: al ejecutarse en local con 535 MB, puede empaquetarse en aplicaciones de escritorio para mostrar el análisis sintáctico de una frase introducida por el estudiante.
- Preprocesamiento para PLN en catalán: servir como paso previo de análisis sintáctico en sistemas de extracción de información, traducción asistida o generación aumentada por recuperación en catalán.
- Verificación en entornos sin conectividad: su tamaño reducido y su formato GGUF permiten desplegarlo en portátiles o equipos sin GPU, útil en aulas o trabajo de campo sin acceso a la nube.
- Pruebas de integración con LM Studio: la model card documenta el flujo completo (búsqueda del modelo, chat sin prompt de sistema, temperatura 0), lo que facilita evaluar el modelo como componente de un prototipo lingüístico.
- Filtrado y control de calidad de datos: usar el análisis JSON como señal para detectar oraciones mal formadas o estructuras anómalas en corpus catalanes antes de entrenar otros modelos.
- Referencia para experimentos de destilación y cuantización: el par bf16/Q4_K_M con validación de fidelidad del 100 % sirve como caso de estudio reproducible de cuantización de un modelo de tarea única.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la validación de fidelidad de la cuantización frente al modelo original en bf16, sobre 30 oraciones de referencia manual y a temperatura 0:

| Metrica | Resultado |
|---|---|
| Salida JSON valida | 100 % |
| Analisis identico al modelo bf16 | 100 % |

Esta tabla mide la similitud del Q4_K_M respecto al original, no la corrección lingüística del análisis sintáctico; para la calidad del análisis se remite a la ficha del modelo base.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 535 MB, por lo que cabe holgadamente en cualquier GPU con 1-2 GB de VRAM libre; también puede ejecutarse en CPU.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer reciente (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente, e incluso iGPU o CPU.
- Cabe en GPU consumer: sí, con margen amplio gracias a los 535 MB del archivo cuantizado.
- Opciones de despliegue: LM Studio (macOS, Windows, Linux) y llama.cpp (`llama-server -hf xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-GGUF --jinja`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos conocidos de este modelo frente a su original en bf16; las alternativas de la misma categoría (analizadores sintácticos del catalán basados en modelos ligeros) no están documentadas en la información disponible.

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Qwen3.5-0.8B-sintaxi-catala-20k-GGUF (Q4_K_M) | 752.393.024 | no disponible | GGUF | Apache 2.0 |
| Qwen3.5-0.8B-sintaxi-catala-20k (original bf16) | 752.393.024 | no disponible | safetensors (según repo base) | Apache 2.0 |

## Limitaciones y advertencias

- Modelo de tarea única: está entrenado para análisis sintáctico del catalán; no debe emplearse como asistente conversacional general ni para otras lenguas.
- La validación reportada (100 % de coincidencia con bf16) mide fidelidad de cuantización, no corrección del análisis; no debe interpretarse como una medida de calidad lingüística.
- Entrada restringida a una sola oración por consulta según la model card; no se documenta comportamiento con entradas más largas.
- La plantilla de chat desactiva siempre el modo *thinking*; forzar razonamiento explícito puede degradar la salida.
- Se recomienda temperatura 0 y ausencia de prompt de sistema; otros ajustes no están validados.
- Riesgo de alucinación en oraciones ambiguas o fuera de dominio no cuantificado en la información disponible.
- Sesgos lingüísticos: al entrenarse solo con catalán, no cubre variedades dialectales ni registros no representados en el corpus de destilación (composición no disponible).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5 del que deriva.
- No se documentan límites de contexto ni comportamiento con entradas malformadas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-GGUF
- Modelo base en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k
- Repositorio con código, notebook y explicación: https://github.com/xaviviro/destillacio-sintaxi-catala
- Perfil del autor: https://huggingface.co/xaviviro
