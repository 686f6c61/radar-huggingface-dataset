# Sushilmishrawork/india-state-debt-llm

## Resumen

India State Debt LLM es un modelo de lenguaje especializado en el analisis de deuda publica de los estados y territorios de la India, desarrollado por Sushilmishrawork. Se trata de un modelo GPT-2 fine-tuneado con datos oficiales del Reserve Bank of India (RBI) y presupuestos estatales, disenado para responder consultas sobre pasivos publicos, ratios de deuda sobre GSDP, deuda per capita, rankings nacionales y trayectorias de crecimiento plurianual entre 2020 y 2026, cubriendo 31 estados y territorios de la Union.

El modelo emplea una estructura de razonamiento en cadena de pensamiento (chain-of-thought) de tres etapas explicitas, con etiquetas `<thought>`, `<analysis>` y `<answer>`, que permiten desglosar el proceso de consulta, el analisis de metricas fiscales y la respuesta ejecutiva. Con 124,4 millones de parametros, es un modelo ligero que puede ejecutarse en hardware de consumo, lo que lo hace accesible para instituciones financieras, investigadores y analistas que necesiten consultas rapidas sobre datos fiscales indios sin depender de APIs externas.

La relevancia de este modelo radica en su especializacion en un dominio muy concreto —las finanzas publicas estatales de la India—, un area donde los modelos generalistas suelen ofrecer respuestas imprecisas o desactualizadas. Su licencia MIT permite uso comercial sin restricciones, y su formato safetensors es compatible con el ecosistema Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder) |
| Parametros totales | 124.439.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder autoregresivo con 124 millones de parametros, disenado originalmente por OpenAI para generacion de texto. Sobre esta base, el autor ha realizado un fine-tuning con datos financieros oficiales del RBI y presupuestos estatales de la India, cubriendo el periodo 2020-2026 y 31 estados y territorios de la Union.

La innovacion principal del modelo reside en su estructura de salida en tres etapas de razonamiento encadenado: `<thought>` para el analisis paso a paso de la consulta, `<analysis>` para la presentacion de metricas financieras estructuradas (rank, cifras per capita, indicadores de categoria) y `<answer>` para el resumen ejecutivo. Esta estructura no es una tecnica de entrenamiento novedosa, sino un formato de salida impuesto durante el fine-tuning, que fuerza al modelo a desglosar su razonamiento antes de dar la respuesta final.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El fine-tuning parece haberse realizado exclusivamente con datos textuales de naturaleza fiscal, sin componentes multimodales.

## Capacidades

- Generacion de texto especializada en deuda publica de estados indios, incluyendo consultas sobre deuda total, ratios deuda/GSDP, deuda per capita y rankings nacionales.
- Razonamiento en cadena de pensamiento estructurado en tres fases (thought, analysis, answer) que permite auditar el proceso de respuesta.
- Analisis de trayectorias de crecimiento de deuda plurianual (2020-2026) para cada estado o territorio de la Union.
- Soporte de consultas en lenguaje natural en ingles, con formato de instruccion explicito ("Instruction: ... Response: <thought>").
- Capacidad limitada de generacion de texto generalista, heredada de GPT-2, aunque su especializacion reduce su utilidad fuera del dominio fiscal indio.
- No soporta tool calling, function calling, ni capacidades multimodales (vision, audio).

## Casos de uso

- Analisis fiscal para prensa especializada: un periodista de datos puede consultar "What is the total debt of Karnataka in FY 2024-25?" y obtener una respuesta estructurada con cifras oficiales del RBI, ahorrando horas de busqueda en documentos presupuestarios.
- Elaboracion de informes de riesgo crediticio: analistas de agencias de rating pueden evaluar la evolucion de la deuda de un estado concreto entre 2020 y 2026, usando el modelo para extraer rapidamente las metricas clave de cada ejercicio fiscal.
- Investigacion academica en economia publica: estudiantes e investigadores pueden comparar la carga de deuda relativa de diferentes estados mediante consultas en lenguaje natural, sin necesidad de procesar manualmente las tablas del RBI.
- Soporte a decisiones de inversion en bonos estatales: gestores de carteras pueden consultar rankings de deuda por estado y ratios de sostenibilidad para filtrar emisiones de deuda publica estatal.
- Verificacion de datos en redacciones economicas: los equipos de fact-checking pueden contrastar declaraciones politicas sobre deuda estatal con los datos oficiales que el modelo ha internalizado.
- Formacion y educacion financiera: el modelo puede utilizarse como herramienta didactica en cursos de finanzas publicas indias, permitiendo a los estudiantes explorar interactivamente los datos fiscales de los 31 estados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion comparativa con otros modelos en tareas de razonamiento fiscal, ni metricas estandar como MMLU, HumanEval o GSM8K. La ausencia de benchmarks publicos dificulta la evaluacion objetiva de su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP16 (124 millones de parametros), lo que permite ejecucion en practicamente cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso inferencia en CPU con llama.cpp.
- Compatibilidad con hardware de consumo: si, el modelo cabe en cualquier GPU consumer actual e incluso en sistemas con solo RAM (mediante cuantizacion o ejecucion en CPU).
- Opciones de despliegue: compatible con Hugging Face Transformers, Text Generation Inference (TGI), y puede convertirse a formato GGUF para su uso con llama.cpp u Ollama.
- Latencia y throughput: no se dispone de mediciones oficiales, pero para un modelo de 124M de parametros, la generacion de 300 tokens deberia completarse en menos de 5 segundos en una GPU consumer moderna.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el dominio especifico de deuda estatal india. Los modelos generalistas como GPT-2, GPT-Neo 125M o TinyLlama 1.1B podrian servir como referencia arquitectonica, pero carecen de la especializacion en datos fiscales indios. No se han encontrado otros modelos fine-tuneados con datos del RBI en Hugging Face durante la busqueda.

## Limitaciones y advertencias

- Sesgos geograficos: el modelo solo cubre 31 estados y territorios de la India, excluyendo potencialmente algunos territorios menores o datos posteriores a 2026.
- Riesgo de alucinacion: al ser un modelo de 124M de parametros, su capacidad de razonamiento complejo es limitada y puede generar cifras incorrectas si la consulta se aleja de los datos de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no se ha especificado, pero GPT-2 base tiene un maximo de 1024 tokens, lo que limita consultas muy largas o con multiples preguntas.
- Idioma: solo soporta ingles, lo que excluye consultas en hindi u otros idiomas indios.
- Desactualizacion: los datos cubren hasta 2026, por lo que consultas sobre ejercicios fiscales posteriores no tendran respuesta fiable.
- Sin garantias de exactitud: el modelo no ha sido auditado por ninguna institucion financiera y las cifras deben verificarse contra las fuentes oficiales del RBI antes de su uso en contextos profesionales.
- Repositorio sin mantenimiento: el modelo tiene 0 descargas y 0 likes, y el autor no ha publicado documentacion adicional ni benchmarks, lo que sugiere un proyecto experimental sin soporte activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sushilmishrawork/india-state-debt-llm
- Perfil del autor: https://huggingface.co/Sushilmishrawork
- Noticia sobre SBI y LLMs especificos de dominio: https://www.devdiscourse.com/article/technology/2846091-data-sovereignty-sbi-mulling-to-build-its-own-domain-specific-llm
- Articulo sobre planes de LLM propios en India: https://www.domain-b.com/technology/artificial-intelligence/india-gets-into-ai-mode-plans-to-build-own-llm
