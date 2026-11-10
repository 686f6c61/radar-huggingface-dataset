# StructBench/wave-propagation-1d

## Resumen

`StructBench/wave-propagation-1d` no es un modelo de lenguaje: es un checkpoint de referencia (surrogate model) del benchmark StructBench para el problema `wave_propagation_1d`, publicado por el autor del benchmark (StructBench) junto con el release de código `v0.4.0`. Su función es servir como punto de comparación reproducible ("blessed reference checkpoint") frente al cual medir otros modelos sustitutos entrenados para aproximar la simulación numérica de propagación de ondas unidimensionales en ingeniería estructural.

El checkpoint pertenece a la familia `cgn` (esquema autorregresivo) y se identifica con el commit de ejecución `48046ea` (fecha 2026-07-10). El artefacto principal es `model-best-050000.pt`, acompañado de `config.json` resuelto, estadísticas de normalización, ficheros `metrics-<split>.json` de los splits evaluados y un `SHA256SUMS` para verificación de integridad. El resultado principal publicado es `test_interp rollout_rel_l2_disp = 0.3507`.

Es relevante ahora porque establece una referencia auditable y verificable criptográficamente para una tarea de surrogate modeling en ingeniería estructural, un área donde la reproducibilidad de los resultados suele ser débil. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia `cgn`, esquema autorregresivo; no se detalla la topología interna en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoint `model-best-050000.pt`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo más allá de etiquetarlo como familia `cgn` con esquema autorregresivo. El checkpoint se enmarca en el benchmark StructBench, que evalúa modelos sustitutos capaces de reproducir la respuesta de un simulador numérico de propagación de ondas 1D. El bundle incluye el `config.json` resuelto, lo que permite reconstruir el simulador de referencia a partir del propio bundle durante la evaluación, y estadísticas de normalización cuando el modelo las utiliza.

No se especifican en la información disponible el número de tokens o casos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino tipo RLHF/DPO (poco probables en este dominio). El checkpoint se identifica como `model-best-050000.pt`, lo que sugiere un paso de entrenamiento 50 000, aunque el detalle no se confirma en la información proporcionada. La evaluación se realiza en modo `rollout` mediante la CLI `structbench-train`, que sobrescribe el `metrics-<split>.json` descargado.

## Capacidades

- Predicción de propagación de ondas unidimensionales como surrogate del simulador numérico de referencia.
- Evaluación en modo rollout autorregresivo sobre casos canónicos del benchmark.
- Verificación de integridad de artefactos mediante `SHA256SUMS`.
- Reconstrucción del simulador de referencia a partir del `config.json` incluido en el bundle.
- Puntuación sobre splits evaluados (`test_interp` entre ellos) con métricas registradas en `metrics-<split>.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Validación de nuevos surrogate models: usar este checkpoint como baseline contra el que comparar modelos propios en `wave_propagation_1d`, gracias a la métrica publicada `rollout_rel_l2_disp = 0.3507` en `test_interp`.
- Reproducción de resultados del benchmark: descargar el bundle con la revisión `v0.4.0` y ejecutar `structbench-train --mode rollout` para regenerar las métricas y contrastarlas con las publicadas.
- Auditoría de integridad en pipelines de investigación: verificar cada fichero contra `SHA256SUMS` antes de incorporarlo a un estudio comparativo.
- Integración en el registro de resultados del benchmark: alimentar la landing page `docs/benchmarks/wave_propagation_1d.md` con las métricas regeneradas.
- Docencia y experimentación en surrogate modeling estructural: punto de partida reproducible para estudiar el error de rollout en propagación de ondas 1D.
- Referencia para desarrollo de la CLI: servir como bundle de ejemplo para probar la reconstrucción del simulador desde `config.json` y el flujo de evaluación de StructBench.

## Benchmarks y rendimiento

| Split | Metrica | Valor |
|---|---|---|
| test_interp | rollout_rel_l2_disp | 0.3507 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas adicionales de otros splits.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el tamaño del checkpoint ni el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: CLI `structbench-train` del repositorio StructBench (modo `rollout`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada solo incluye un único checkpoint (fila CGN) para este benchmark, sin alternativas comparables publicadas en la model card.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni esperarse capacidades de generación de texto, código o razonamiento.
- El alcance se limita al benchmark `wave_propagation_1d`; no se garantiza su validez fuera de los casos canónicos del benchmark.
- La evaluación sobrescribe el `metrics-<split>.json` descargado: es necesario conservar una copia para comparar con los resultados publicados.
- El error de rollout publicado (`rollout_rel_l2_disp = 0.3507`) es elevado; conviene interpretarlo como referencia de benchmark, no como sustituto de alta fidelidad del simulador.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por no tratarse de un modelo generativo de lenguaje.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; verificar los términos del repositorio StructBench para el código asociado.
- Repositorio con 0 descargas y 0 likes: ecosistema de validación externa muy limitado en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StructBench/wave-propagation-1d
- Repositorio StructBench (código y definiciones del benchmark, Apache-2.0): https://github.com/qilinli/StructBench
- Registro de resultados del benchmark `wave_propagation_1d`: https://github.com/qilinli/StructBench/blob/v0.4.0/docs/benchmarks/wave_propagation_1d.md
