# XenonGas/SafeSD-verdict-agentdrift

## Resumen

SafeSD Verdict AgentDrift v1.0.0 es una sonda (probe) de detección de inyección de prompts publicada por el usuario XenonGas sobre el modelo base Qwen/Qwen3-0.6B. No se trata de un modelo de lenguaje autónomo, sino de un artefacto de clasificación que se carga junto con el modelo base y el tokenizador de Qwen3-0.6B para evaluar, en dos etapas, si un resultado de herramienta contiene instrucciones fuera de la autorización del usuario y si la respuesta del asistente las sigue. El repositorio contiene un checkpoint `probe.pt` y un fichero `probe.meta.json` con el SHA-256, la codificación de entrada y los prompts de ambas etapas.

La relevancia del artefacto es acotada pero específica: aborda el problema de la inyección indirecta de prompts en sistemas agénticos, donde el contenido devuelto por una herramienta (una página web, un correo, una respuesta de API) puede incorporar instrucciones maliciosas que el modelo acaba ejecutando. La variante AgentDrift adapta la sonda a ese escenario de deriva de comportamiento del agente. El uso previsto es el runtime SafeSD, que expone la sonda como servicio (`python -m safesd.verdict.service`) con backend Hugging Face y selección explícita de checkpoint.

El proyecto es de nicho y muy reciente: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados en los metadatos. La licencia es Apache 2.0, heredada del modelo base Qwen3-0.6B, y el tamaño del repositorio es de 1,2 GB, coherente con el peso del modelo base en el que se apoya.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de clasificación sobre transformer decoder (Qwen3-0.6B) |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `probe.pt` (checkpoint PyTorch) y `probe.meta.json` (metadatos) |

## Arquitectura y entrenamiento

La sonda se construye sobre Qwen3-0.6B, un transformer decoder de 0,6 mil millones de parámetros, y se distribuye como checkpoint `probe.pt` que se carga mediante el loader propio de SafeSD. El fichero `probe.meta.json` acompaña al checkpoint e incluye el SHA-256 del mismo, la codificación de entrada y los prompts de las dos etapas de veredicto. El checkpoint mantiene la dependencia del modelo base y del tokenizador de Qwen3-0.6B en la revisión `c1899de289a04d12100db370d81485cdf75e47ca`.

El funcionamiento es de dos etapas: la etapa 1 comprueba si los resultados de herramienta contienen instrucciones fuera de la autorización del usuario; la etapa 2 comprueba si la respuesta del asistente sigue esas instrucciones. El umbral de decisión es 0,5. La información disponible no detalla el volumen ni la composición del dataset de entrenamiento, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado convencional.

## Capacidades

- Detección de inyección de prompts en resultados de herramientas (etapa 1).
- Detección de seguimiento de instrucciones no autorizadas en la respuesta del asistente (etapa 2).
- Clasificación binaria con umbral configurable a 0,5.
- Integración como servicio mediante el runtime SafeSD (`safesd.verdict.service`).
- Selección de backend Hugging Face y dispositivo explícito (por ejemplo, `cuda:0`).
- Verificación de integridad del checkpoint mediante el SHA-256 incluido en `probe.meta.json`.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso propias; el artefacto es un verificador, no un generador.

## Casos de uso

- Protección de agentes con acceso a herramientas: antes de ejecutar la acción solicitada por el modelo, la etapa 1 examina la salida de la herramienta (resultado de búsqueda, correo, respuesta de API) para detectar instrucciones no autorizadas y bloquear la cadena.
- Auditoría de respuestas de asistentes: la etapa 2 compara la respuesta generada con las instrucciones detectadas en la etapa 1 para determinar si el modelo ha seguido una directiva inyectada, lo que permite registrar incidentes y ajustar políticas.
- Despliegue como servicio de veredicto en un pipeline agéntico: el comando `python -m safesd.verdict.service --backend hf --device cuda:0 --ckpt ...` permite levantar el verificador como componente separado del generador principal.
- Evaluación de robustez en investigación: útil para medir la tasa de éxito de ataques de inyección indirecta en un agente concreto, comparando veredictos de la sonda con anotaciones manuales.
- Filtrado previo en sistemas de recuperación aumentada (RAG): aplicar la etapa 1 a los documentos recuperados antes de incorporarlos al contexto del modelo generador.
- Control de calidad en entornos de desarrollo: integrar la sonda en pruebas automatizadas que simulan ataques de inyección y verificar que el agente no ejecuta las instrucciones inyectadas.
- Monitorización en producción: registrar los veredictos de ambas etapas para construir métricas de deriva de comportamiento (AgentDrift) a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al apoyarse en Qwen3-0.6B, el peso del modelo base en precisión completa ronda los 1,2 GB, por lo que la sonda más el modelo caben holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; el ejemplo de la model card usa `cuda:0` sin indicar modelo concreto.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (0,6 mil millones de parámetros); no se confirma una lista concreta de tarjetas.
- Opciones de despliegue: runtime SafeSD con backend Hugging Face (`safesd.verdict.service`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SafeSD Verdict AgentDrift | 0,6 mil millones (base Qwen3-0.6B) | no disponible | Sonda de detección de inyección de prompts en dos etapas | Apache 2.0 | Hugging Face (repo XenonGas/SafeSD-verdict-agentdrift) |
| Qwen3-0.6B | 0,6 mil millones | no disponible en esta ficha | Modelo generativo de propósito general | Apache 2.0 | Hugging Face (Qwen/Qwen3-0.6B) |
| Alternativas de detección de inyección de prompts | no disponible | no disponible | Clasificadores y guardrails de entrada/salida | no disponible | no disponible |

No se dispone de información sobre otros artefactos comparables de la misma categoría (guardrails o clasificadores de inyección) en los datos proporcionados.

## Limitaciones y advertencias

- Artefacto de nicho sin tracción pública: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No es un modelo generativo: no debe emplearse como sustituto de un LLM; requiere el runtime SafeSD y el modelo base Qwen3-0.6B.
- Dependencia de una revisión concreta del modelo base (`c1899de289a04d12100db370d81485cdf75e47ca`); cambios en esa revisión pueden invalidar el comportamiento de la sonda.
- Umbral fijo de 0,5 en esta versión; no se documenta calibración por dominio ni curvas ROC/PR.
- Sin datos publicados sobre sesgos, tasas de falsos positivos/negativos ni robustez frente a ataques adaptativos.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción exige validación propia.
- Riesgo de alucinación del verificador: al ser un clasificador sobre un modelo pequeño, puede producir veredictos erróneos en entradas ambiguas o adversariales.
- No se documentan limitaciones de longitud de contexto para el artefacto; conviene verificar el contexto efectivo del modelo base antes de usarlo con resultados de herramienta extensos.

## Enlaces

- Hugging Face: https://huggingface.co/XenonGas/SafeSD-verdict-agentdrift
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Proyecto SafeSD y instrucciones de runtime: https://github.com/flowermouse/SafeSD
