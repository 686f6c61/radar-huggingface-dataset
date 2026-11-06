# sulsulAI/sulsulAI-models

## Resumen

sulsulAI-models es un repositorio de modelos de lenguaje publicados por sulsulAI para dar soporte a las funciones de inteligencia artificial de SulSul Accounting (술술회계), una aplicación de contabilidad surcoreana. Los modelos no son de propósito general: están afinados específicamente para tareas contables dentro de la app complementaria SulSulAI, que los descarga y ejecuta localmente en el PC del usuario. El repositorio contiene dos variantes derivadas de la familia Qwen3.5: una de 0,8 mil millones de parámetros y otra de 4 mil millones, ambas cuantizadas en formato GGUF Q8_0.

La propuesta de valor es la ejecución en local de tareas contables sensibles sin enviar datos financieros a la nube: generación de asientos contables a partir de extractos bancarios, revisión y alertas sobre asientos ya introducidos, y conversión de lenguaje natural en borradores de asiento. El modelo pequeño (752 millones de parámetros reales en safetensors según los metadatos del repo) apunta a equipos modestos, mientras que la variante de 4B ofrece mayor capacidad.

Ambos modelos son derivados por fine-tuning de Qwen/Qwen3.5-0.8B y Qwen/Qwen3.5-4B respectivamente, con licencia Apache 2.0 heredada y sin afiliación ni aval del equipo Qwen. El idioma de trabajo es exclusivamente coreano (ko), y el autor advierte explícitamente que no están pensados para conversación general ni uso fuera de la aplicación SulSulAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5; detalles de atención y capas no disponibles) |
| Parametros totales | 752.393.024 (variante 0.8B, dato safetensors); variante 4B: no disponible con precision |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (unica publicada) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0); safetensors referenciado en metadatos del repo |
| Tamano del repo | 19,1 GB |
| Variantes publicadas | `sulsul-multi-qwen3.5-0.8b-r12-q8_0.gguf` (811.843.168 bytes), `sulsul-multi-qwen3.5-4b-r12-q8_0.gguf` (4.482.402.816 bytes) |
| Modelos base | Qwen/Qwen3.5-0.8B, Qwen/Qwen3.5-4B |
| Libreria | gguf |
| Descargas | 327 |
| Fecha de creacion | 2026-10-21 |
| Ultima actualizacion | 2026-11-04 |

## Arquitectura y entrenamiento

Los modelos parten de la arquitectura de la familia Qwen3.5 (transformer decoder-only), sobre la que se ha aplicado un proceso de fine-tuning orientado a tareas contables. El sufijo `r12` en los nombres de fichero sugiere una revision o iteracion de entrenamiento, aunque el autor no documenta el significado exacto. Tras el ajuste, los pesos se cuantizaron a GGUF Q8_0 para su distribucion y ejecucion local mediante runtimes compatibles con GGUF.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset contable, ni si se emplearon tecnicas de RLHF, DPO o preferencias. Tampoco se detallan innovaciones tecnicas adicionales (decodificacion especulativa, atención lineal, etc.). La model card unicamente especifica las tres tareas objetivo: propuesta de asientos para transacciones bancarias no resueltas por reglas, revision con alertas de asientos introducidos y conversion de lenguaje natural a borrador de asiento.

## Capacidades

- Generacion de texto en coreano orientada a dominio contable.
- Propuesta de asientos contables (분개) para transacciones de extractos bancarios que las reglas deterministas no han podido clasificar.
- Revision de asientos: marcado de advertencias o alertas sobre entradas ya registradas.
- Conversion de lenguaje natural a borrador de asiento contable.
- Ejecucion local en el PC del usuario mediante la app SulSulAI (sin llamadas a la nube).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional basico (tag `conversational`).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible.
- Vision, audio o modo thinking: no disponible.
- Multilingue: limitado a coreano; el autor indica que no es apto para conversacion general.

## Casos de uso

- Clasificacion asistida de extractos bancarios: el modelo recibe transacciones que el motor de reglas de SulSul Accounting no ha podido mapear y propone un asiento contable, reduciendo el trabajo manual de conciliacion en pymes coreanas.
- Revision de asientos antes del cierre: se envian los asientos introducidos por el usuario y el modelo devuelve advertencias sobre posibles errores, sirviendo como control de calidad previo al registro definitivo en el libro.
- Dictado de asientos en lenguaje natural: el contable describe la operacion en una frase en coreano y el modelo genera un borrador de asiento que el usuario confirma o corrige.
- Onboarding de usuarios no expertos: la app puede ofrecer sugerencias de asiento a autonomos sin formacion contable, con el modelo actuando como asistente dentro de la interfaz.
- Procesamiento offline con privacidad de datos financieros: al ejecutarse en local con GGUF Q8_0, los extractos y libros no salen del equipo, lo que encaja con requisitos de confidencialidad contable.
- Despliegue en equipos de oficina modestos: la variante 0.8B en Q8_0 (unos 0,8 GB de fichero) permite inferencia en CPU o GPU de gama baja dentro del flujo de escritorio de la app.
- Prototipado de asistentes contables en coreano: util como punto de partida para evaluar fine-tuning de dominio en modelos pequenos antes de escalar a variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la variante 0.8B en Q8_0: aproximadamente 1 GB de pesos; con overhead de contexto, del orden de 1,5-2 GB.
- VRAM estimada para la variante 4B en Q8_0: aproximadamente 4,5 GB de pesos; con overhead, del orden de 5-6 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, la variante 0.8B es viable en CPU y en GPUs de gama de entrada; la 4B encaja en GPUs consumer con 6-8 GB o mas (por ejemplo, RTX 3060/4060 y superiores).
- Cabe en GPU consumer: si, ambas variantes; la 0.8B incluso en equipos sin GPU dedicada mediante inferencia en CPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el tag `endpoints_compatible` sugiere integracion via API compatible con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| sulsulAI 0.8B (Qwen3.5-0.8B fine-tuned) | 752 M | no disponible | ko | Apache 2.0 | GGUF Q8_0 | Contabilidad coreana |
| sulsulAI 4B (Qwen3.5-4B fine-tuned) | ~4B | no disponible | ko | Apache 2.0 | GGUF Q8_0 | Contabilidad coreana |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | multilingue | Apache 2.0 | safetensors/GGUF | Proposito general |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | multilingue | Apache 2.0 | safetensors/GGUF | Proposito general |

La comparacion relevante es contra los modelos base: los sulsulAI heredan tamano y licencia pero sustituyen la cobertura multilingue y generalista por especializacion contable en coreano. Para tareas fuera del dominio contable coreano, los modelos base de Qwen son la opcion adecuada.

## Limitaciones y advertencias

- Modelo de dominio restringido: el autor indica explicitamente que no es apto para conversacion general ni usos fuera de la app SulSulAI.
- Idioma unico: solo coreano; no se garantiza calidad en otros idiomas.
- Riesgo de alucinacion en asientos contables: las propuestas y alertas son orientativas y el usuario debe verificar antes de registrar en el libro; un asiento incorrecto puede tener consecuencias fiscales.
- Sesgos: no documentados; al estar entrenado sobre datos contables coreanos, puede reflejar practicas y convenciones locales especificas.
- Sin aval del creador del modelo base: el autor declara que el derivado no esta hecho ni respaldado por Alibaba Cloud / Qwen.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las obligaciones de la licencia (incluir aviso y texto de licencia, indicar cambios).
- Solo se publica cuantizacion Q8_0; no hay variantes Q4/Q5 para equipos con menos memoria.
- No se documentan contexto maximo, datos de entrenamiento ni evaluaciones, lo que dificulta estimar fiabilidad en produccion.
- Fechas de creacion y actualizacion del repositorio (2026) posteriores a la informacion de referencia habitual; conviene verificar la vigencia de los modelos base Qwen3.5.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sulsulAI/sulsulAI-models
- Modelo base 0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache 2.0 (referenciada en el repo): https://www.apache.org/licenses/LICENSE-2.0
- Web de SulSul Accounting: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles
