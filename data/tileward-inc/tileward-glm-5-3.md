# Tileward-Inc/Tileward-GLM-5.3

## Resumen

Tileward-GLM-5.3 es una versión comprimida y cuantizada del modelo GLM-5.3 de Z.ai, un transformer de 753 mil millones de parámetros. La compresión la ha realizado Tileward, que aplica su propio formato de cuantización propietario denominado TWFP4, reduciendo el peso en disco de los 755,6 GB de la publicación FP8 oficial de Z.ai a 464,8 GB, es decir, un 38 % menos, y un 69 % menos (3,2x) que el original en 16 bits de 1.506,7 GB. Según el autor, la calidad se mantiene: 86,2 en MMLU (5-shot) frente a 86,3 del original en 16 bits y 86,1 de la versión FP8.

El modelo es relevante porque aborda uno de los cuellos de botella prácticos del despliegue de modelos de escala frontera: el coste de memoria y almacenamiento. Al reducir la huella por tarjeta a 55,3 GiB en una configuración de ocho GPU, permite servir un modelo de 753B con una ocupación de memoria notablemente menor que las alternativas FP8, y además amplía la caché de tokens disponible (4.047.872 tokens al 90 % de cada tarjeta, frente a 3.267.776 del FP8 y 1.307.648 del 16 bits).

Un punto crítico: los pesos no están publicados en Hugging Face. El repositorio actúa como escaparate y el acceso se concede bajo petición mediante una reunión con un ingeniero de Tileward. La licencia es la GLM-5.3 License del modelo base, no una licencia abierta estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de zai-org/GLM-5.3; detalles no disponibles) |
| Parametros totales | 753 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card reporta capacidad de caché de tokens, no ventana de contexto) |
| Tipos de cuantizacion | TWFP4 (formato propietario de Tileward, 4 bits); existe versión FP8 oficial de Z.ai y original en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | GLM-5.3 License (license_name: glm-5.3; license: other) |
| Formato de pesos | no disponible (pesos no publicados en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GLM-5.3 de Z.ai, un transformer de 753 mil millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; todos estos datos figuran como no disponibles. Tampoco se especifica si el modelo base emplea mezcla de expertos (MoE) u otra variante arquitectónica.

La innovación técnica de esta ficha es el proceso de compresión de Tileward, no el entrenamiento. El formato TWFP4 comprime los pesos a 4 bits manteniendo, según el autor, un acuerdo de siguiente palabra del 91,9 % con el original en 16 bits, idéntico al de la versión FP8. En la comparativa de ocho tarjetas, el modelo comprimido ocupa 55,3 GiB por tarjeta frente a 89,4 GiB del FP8 y 176,5 GiB del 16 bits, lo que se traduce en una caché de 4.047.872 tokens al 90 % de cada tarjeta. El autor también reporta una tasa de hechos inventados del 1,4 % (frente al 1,7 % del 16 bits y el 2,2 % del FP8) y 1.200 de 1.200 llamadas a herramientas correctas.

## Capacidades

- Generación de texto y razonamiento general, con 86,2 de precisión en MMLU (5-shot) declarada por el autor.
- Llamada a herramientas (tool calling): el autor reporta 1.200 de 1.200 llamadas correctas en su evaluación.
- Ejecución de tareas de ingeniería de software: DeepSWE resuelto en 86 de 113 tareas y Terminal-Bench 2.0 en 56 de 77.
- Redacción de documentos con baja tasa de fabricación de hechos (1,4 % según el autor).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 753B en clústeres de ocho GPU con menos memoria por tarjeta: la reducción a 55,3 GiB por tarjeta frente a los 89,4 GiB del FP8 permite liberar espacio para caché KV y aumentar el número de tokens en vuelo, útil en servicios de inferencia de alto volumen.
- Automatización de ingeniería de software: con 86 de 113 tareas resueltas en DeepSWE, el modelo es adecuado para agentes que resuelven incidencias en repositorios y pipelines de CI/CD.
- Agentes de terminal y operaciones: los 56 de 77 de Terminal-Bench 2.0 lo sitúan como candidato para tareas de administración de sistemas y ejecución de comandos en entornos controlados.
- Generación documental con control de alucinación: la tasa de hechos inventados del 1,4 % lo hace apto para redacción asistida de informes donde la fidelidad factual es crítica.
- Orquestación de herramientas en flujos multi-paso: las 1.200 llamadas correctas de 1.200 permiten integrarlo en pipelines que encadenan APIs externas.
- Evaluación comparativa de cuantizaciones: sirve como referencia para equipos que quieran medir el impacto de la compresión a 4 bits frente a FP8 y 16 bits en su propia carga de trabajo.
- Servicio con caché de contexto ampliada: los 4.047.872 tokens de caché por tarjeta al 90 % de ocupación facilitan cargas con muchos prefijos compartidos, como asistentes con prompts de sistema largos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | GLM-5.3 16 bits | GLM-5.3 FP8 (Z.ai) | Tileward GLM-5.3 TWFP4 |
|---|---|---|---|
| MMLU (5-shot), accuracy | 86,3 | 86,1 | 86,2 |
| Hechos inventados en documento (menor es mejor) | 1,7 % | 2,2 % | 1,4 % |
| Llamadas a herramientas correctas (de 1.200) | 1.200 | 1.200 | 1.200 |
| Acuerdo de siguiente palabra con el original 16 bits | – | 91,9 % | 91,9 % |
| DeepSWE, tareas resueltas (de 113) | – | 74 | 86 |
| Terminal-Bench 2.0, tareas resueltas (de 77) | – | 58 | 56 |
| Memoria cargada por tarjeta | 176,5 GiB | 89,4 GiB | 55,3 GiB |
| Tokens de caché al 90 % por tarjeta | 1.307.648 | 3.267.776 | 4.047.872 |
| Peso en disco | 1.506,7 GB | 755,6 GB | 464,8 GB |

## Requisitos de hardware

- VRAM estimada: 55,3 GiB por tarjeta en una configuración de ocho GPU (442,4 GiB en total) para el formato TWFP4; 89,4 GiB por tarjeta para FP8 y 176,5 GiB por tarjeta para el original en 16 bits.
- GPU recomendadas: el autor menciona una sesión de ocho tarjetas sin especificar el modelo; por la memoria por tarjeta, la configuración encaja con GPU de 80 GB (A100/H100) o superiores. No se detalla el modelo exacto.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB ni de 48 GB; requiere un clúster multi-GPU de gama profesional o de centro de datos.
- Opciones de despliegue: no disponibles en la información proporcionada (no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles. El autor solo reporta capacidad de caché de tokens, no métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Peso en disco | MMLU (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tileward-GLM-5.3 | 753B | TWFP4 | 464,8 GB | 86,2 | GLM-5.3 License | Bajo petición |
| GLM-5.3 FP8 (Z.ai) | 753B | FP8 | 755,6 GB | 86,1 | GLM-5.3 License | Público en Hugging Face |
| GLM-5.3 original | 753B | 16 bits | 1.506,7 GB | 86,3 | GLM-5.3 License | Público en Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no están publicados: el acceso requiere solicitar una reunión con un ingeniero de Tileward, lo que impide auditoría directa y descarga autónoma.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (verified: false en el model-index).
- El formato TWFP4 es propietario; no se documenta compatibilidad con runtimes de inferencia estándar ni herramientas de cuantización abiertas.
- La licencia GLM-5.3 License no es una licencia de código abierto estándar; conviene revisar sus restricciones de uso comercial antes de desplegar en producción.
- No se especifican idiomas soportados, por lo que la cobertura multilingüe no está garantizada.
- No se detalla la longitud de contexto del modelo base en esta ficha; la cifra de tokens de caché no equivale a ventana de contexto.
- El autor reporta una ligera caída en Terminal-Bench 2.0 (56 frente a 58 del FP8), lo que indica que la compresión no es neutra en todas las tareas.
- Riesgo de alucinación: el autor reporta un 1,4 % de hechos inventados, un dato no nulo que exige verificación en aplicaciones sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-GLM-5.3
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Licencia GLM-5.3: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Artículo de investigación de Tileward: https://tileward.com/research/a-smaller-glm-5-3/
- Metodología de evaluación: https://tileward.com/evals/#compressed-model-glm53
- Investigación de Tileward: https://tileward.com/research/
- Sitio de Tileward: https://tileward.com
- Reserva de reunión para acceso: https://calendar.app.google/hg2DzFTxKJgwFWm19
