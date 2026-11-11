# Unluckkie/LucetV3-2B-Frontier-GGUF

## Resumen

LucetV3-2B-Frontier-GGUF es una suite de cuantizaciones GGUF publicada por el usuario Unluckkie para el modelo base mohommed/LucetV3-2B-Frontier, un agente autónomo de 1.728.801.600 parámetros construido sobre la arquitectura experimental LFM3 Tri-Hybrid de Liquid AI. Esta arquitectura combina convoluciones cortas con compuerta (gated short convolutions), atención de ventana deslizante y atención global, lo que la diferencia de los transformers densos convencionales y explica tanto su eficiencia de memoria como su fragilidad frente a la cuantización uniforme.

El aporte técnico central de este repositorio no es el modelo en sí, sino el descubrimiento y la corrección de un fallo de cuantización específico de la arquitectura: los tensores `blk.*.shortconv.*` requieren bloques de 32 pesos o precisión F16, y al comprimirlos con bloques estándar de 256 pesos el mecanismo de compuerta se degrada y el modelo genera errores de sintaxis Python fatales. El autor emplea la opción `--custom-q` de ik_llama.cpp para forzar F16 en esos tensores y cuantizar el resto del modelo.

El resultado es un conjunto de cuatro variantes (IQ4_XS, TrueSpicy, FixedIQ6 y FixedQ8) que, según la model card, superan pruebas de validación de sintaxis y lógica mediante la API de `llama-server`. El modelo está pensado para ejecución en CPU con contexto de hasta 32K tokens y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 Tri-Hybrid (gated short convolutions + sliding window attention + global attention) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en la model card) |
| Tipos de cuantizacion | IQ4_XS, TrueSpicy (IQ4_KS_R4 en FFN + Q6_K en cabeza de salida), FixedIQ6, FixedQ8; tensores shortconv forzados a F16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura LFM3 Tri-Hybrid de Liquid AI, que integra tres mecanismos en paralelo: convoluciones cortas con compuerta, atención de ventana deslizante y atención global. Esta combinación busca reducir el coste computacional y de memoria frente a la atención completa, manteniendo capacidad de modelado de dependencias locales y globales. El repositorio no proporciona detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica documentada en este repositorio es el mapa de cuantización personalizado. Mediante `--custom-q` se fuerza `blk\..*\.shortconv.*=F16`, preservando la precisión de las compuertas y de la lógica NCM, mientras el resto de tensores se cuantiza para maximizar la velocidad en CPU. La variante TrueSpicy usa IQ4_KS_R4 en las capas feed-forward (con aceleración de prefill) y Q6_K en la cabeza de salida. No se documentan técnicas como decodificación especulativa ni atención lineal más allá de los mecanismos propios de la arquitectura.

## Capacidades

- Generación de texto conversacional en inglés.
- Generación de código, con énfasis en Python: la validación del autor comprueba scripts que usan `os.path.exists` y recuento de líneas.
- Razonamiento agéntico y multi-paso: las etiquetas del repositorio incluyen `agentic` y el modelo base se describe como agente autónomo.
- Soporte de tool calling y function calling a través de la API compatible con OpenAI de `llama-server` (flag `--jinja`).
- Contexto largo de hasta 32K tokens con consumo de memoria reducido gracias a la arquitectura Tri-Hybrid.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación de scripts de automatización en Python: el modelo produce código que verifica existencia de ficheros y cuenta líneas, validado por el autor mediante la API de `llama-server`; adecuado para tareas de scripting acotadas en entornos con CPU.
- Agentes autónomos ligeros en local: con 32K de contexto y tool calling vía API compatible con OpenAI, puede integrarse en flujos de varios pasos que invocan funciones externas sin necesidad de GPU.
- Despliegue en hardware de bajos recursos: la variante IQ4_XS (~976 MB) permite ejecutar un agente de 1,7B parámetros en equipos sin GPU dedicada, con latencia de aproximadamente 10 segundos por generación de prueba.
- Prototipado rápido de asistentes conversacionales en inglés: la variante TrueSpicy (~1,3 GB) sirve como modelo diario para pruebas de diálogo multi-turno con contexto largo en CPU.
- Servicio de inferencia con `llama-server`: el flag `--jinja` y la compatibilidad con el endpoint `/v1/chat/completions` facilitan la integración en aplicaciones existentes que ya consumen la API de OpenAI.
- Validación de referencia de cuantización: la variante FixedQ8 (~1,9 GB) actúa como referencia casi-F16 para comparar la degradación de las variantes de menor precisión en pipelines de evaluación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí documenta una prueba de validación propia de sintaxis y lógica de código Python mediante la API de `llama-server`:

| Variante | Sintaxis valida | Logica presente | Tiempo (s) |
|---|---|---|---|
| IQ4_XS | si | si | 10,09 |
| TrueSpicy | si | si | 10,73 |
| FixedIQ6 | si | si | 15,79 |
| FixedQ8 | si | si | 17,01 |

## Requisitos de hardware

- VRAM/RAM estimada: IQ4_XS ~976 MB, TrueSpicy ~1,3 GB, FixedIQ6 ~1,5 GB, FixedQ8 ~1,9 GB (tamanos de fichero indicados por el autor; el modelo en F16 ocuparía ~3,5 GB).
- Diseñado para ejecución en CPU pura ("Potato Mode"); no requiere GPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) por el reducido tamano de los pesos, aunque la model card prioriza el despliegue en CPU.
- Motor de despliegue: ik_llama.cpp con `llama-server`; se recomienda `-c 32768 -np 1 -t 4 -fa on -ctk q8_0 -ctv q8_0 --jinja`.
- Latencia observada en las pruebas del autor: entre ~10 s (IQ4_XS/TrueSpicy) y ~17 s (FixedQ8) por generación en CPU; las variantes de mayor precisión son más lentas porque mueven más datos desde RAM por token.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El modelo solo soporta inglés según la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación y de errores de sintaxis si se cuantiza con esquemas uniformes estándar (Q8_0, Q6_K) que destruyen los tensores shortconv; es imprescindible usar las variantes corregidas o replicar el mapa `--custom-q`.
- Las pruebas de validación son limitadas (un único escenario de generación de código Python) y no constituyen una evaluación exhaustiva de razonamiento o fidelidad.
- El autor advierte de que la cuantización incorrecta produce dobles `else`, bucles infinitos y sintaxis inventada; cualquier despliegue en producción debe verificar la variante GGUF utilizada.
- El modelo base es experimental (LFM3 Tri-Hybrid) y el repositorio tiene un volumen muy bajo de descargas (59) y ningún like, lo que reduce la evidencia comunitaria sobre su robustez.
- Licencia Apache 2.0, que permite uso comercial, pero debe verificarse también la licencia y condiciones del modelo base mohommed/LucetV3-2B-Frontier.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Unluckkie/LucetV3-2B-Frontier-GGUF
- Modelo base: https://huggingface.co/mohommed/LucetV3-2B-Frontier
- Motor de cuantización ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
