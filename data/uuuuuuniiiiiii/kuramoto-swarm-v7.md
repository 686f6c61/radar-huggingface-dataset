# Uuuuuuniiiiiii/kuramoto-swarm-v7

## Resumen

Kuramoto Nested Swarm V7 es un artefacto de investigación publicado en Hugging Face por el usuario Uuuuuuniiiiiii que documenta un **resultado negativo** en el diseño de sistemas de computación de reservorio (reservoir computing) basados en dinámicas de osciladores acoplados. No es un modelo de lenguaje ni un modelo generativo: es una implementación de un "enjambre de enjambres" formado por 4 esferas de Lohe (modelo de Kuramoto sobre la esfera S²) con N=120 osciladores cada una, más una capa meta 10 veces más lenta, leída mediante un vector de 17 dimensiones y un readout lineal entrenado por mínimos cuadrados recursivos (RLS).

La relevancia del artefacto es metodológica: el autor publica explícitamente el fracaso del objetivo de diseño ("world agent" / modelo del mundo) junto con los controles preregistrados, las reglas de parada y los resultados crudos. La versión 0.7.1/0.7.2-dev añade plasticidad hebbiana de tres factores con compuerta por sorpresa sobre los acoplamientos inter-esfera, comparada contra brazos con pesos congelados, barajados y solo-readout, además de baselines de memoria (ventana memory_k y ESN).

El resultado central es que la capacidad de memoria del enjambre (MC ≈ 0.73–1.20 según configuración) queda muy por debajo de los baselines ESN (2.94–8.00) y ventana (4.00), lo que activó la regla de parada fijada antes de ejecutar el grid. La ficha describe el artefacto tal cual: código de investigación, sin pesos publicados como modelo desplegable, sin benchmarks de tareas estándar y con limitaciones declaradas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Enjambre anidado de osciladores de Kuramoto/Lohe sobre S² (4 esferas × N=120) + capa meta 10× más lenta + readout lineal/RLS de 17 dimensiones |
| Parametros totales | No disponible (no es un modelo neuronal con parámetros entrenables publicados; el readout es lineal/RLS) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la "memoria" se mide como capacidad MC) |
| Tipos de cuantizacion | No disponible (no se publican pesos en formatos cuantizables) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | No disponible (se publica código en `nested_swarm/`, no pesos del modelo) |

## Arquitectura y entrenamiento

La arquitectura combina cuatro esferas de Lohe (modelo de Kuramoto sobre la variedad S²) con N=120 osciladores por esfera, acopladas entre sí mediante acoplamientos K_ab, y una capa meta que evoluciona a una velocidad 10 veces menor. La lectura se realiza mediante un vector de 17 dimensiones compuesto por los módulos de magnetización m_1..m_4, los parámetros de orden r_1..r_4 y un término agregado R. Sobre ese vector se entrena un readout lineal mediante mínimos cuadrados recursivos (RLS).

La innovación de la versión 0.7.1/0.7.2-dev es una capa de aprendizaje con pesos dinámicos (plásticos): plasticidad hebbiana de tres factores con compuerta por sorpresa aplicada a los acoplamientos inter-esfera K_ab. El diseño experimental incluye brazos con pesos congelados, controles barajados, controles solo-readout y baselines de memoria (ventana memory_k y ESN). Los experimentos se ejecutaron únicamente con semillas de tuning 400–425, sin confirmación con semillas frescas, y el grid usa 2 semillas por celda y un único esquema de inyección. No se reporta entrenamiento con RLHF, DPO ni datos textuales: el artefacto no es un modelo de lenguaje.

## Capacidades

- Simulación de dinámicas de osciladores acoplados tipo Kuramoto/Lohe sobre S² con acoplamientos inter-esfera.
- Lectura de estado mediante vector de 17 dimensiones y readout lineal/RLS entrenable.
- Plasticidad hebbiana de tres factores con compuerta por sorpresa sobre acoplamientos K_ab (versión 0.7.1/0.7.2-dev).
- Comparación controlada contra brazos congelados, barajados y solo-readout.
- Baselines de memoria implementados: ventana memory_k y ESN (17 y 1440 dimensiones).
- Stubs de agente/servicio incluidos en `nested_swarm/`, limitados a localhost.
- Suite de tests ejecutable con `python3 tests/run.py`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento: no es un modelo generativo.

## Casos de uso

- Investigación en reservoir computing: el artefacto sirve como caso documentado de resultado negativo con controles preregistrados, útil para evitar repetir diseños que no superan a un ESN en capacidad de memoria.
- Reproducción de experimentos de plasticidad hebbiana: los scripts de `pilot/` permiten replicar la comparación entre pesos plásticos y congelados sobre un péndulo parcialmente observable.
- Estudio de metodología preregistrada: `GRID_PLAN.md` y los borradores de preregistro son material de referencia para diseñar reglas de parada antes de ejecutar grids.
- Docencia en sistemas dinámicos: la implementación de esferas de Lohe y el readout RLS son un ejemplo didáctico de acoplamiento de osciladores y lectura lineal de estado.
- Benchmarking de baselines de memoria: los resultados de ESN17 (2.94), ESN1440 (8.00) y window_k5 (4.00) sirven como referencia para comparar nuevos reservorios.
- Análisis de propagación de señal entre subsistemas: el hallazgo de que una señal inyectada en la esfera 0 es transportada por los vectores de dirección de otras esferas (BA 0.58 frente a 0.5) es un caso de estudio de acoplamiento informacional.
- Auditoría de resultados negativos: útil para equipos que quieran documentar fracasos de diseño con trazabilidad de semillas, reglas de parada y resultados crudos en JSON.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). Los datos reportados son métricas internas de capacidad de memoria y R² en tareas de control:

| Metrica | Valor reportado | Baseline / referencia |
|---|---|---|
| Capacidad de memoria MC17 (celdas del grid) | 1.04–1.20 (max single-run 1.31) | ESN17: 2.94 |
| Capacidad de memoria readout 1440 coords | max 0.95 | ESN1440: 8.00 |
| MEMCAP enjambre | ≈ 0.73 (plano en K0 0.2–5.0) | ESN 2.94; window_k5 4.00 |
| R² péndulo parcialmente observable (full vs readout_only) | +0.45–0.46 a favor de full | — |
| R² full vs frozen | +0.010 a +0.019 (por debajo del umbral +0.05) | — |
| R² window_k5 | 0.697 | supera al enjambre en −0.26 a −0.29 |
| Replay ordenado vs barajado (R1) | −0.008 [−0.019, −0.001] | — |
| Replay ordenado vs barajado (R2) | −0.014 [−0.029, −0.003] | — |
| Primer pilot vs readout_only | Δ −0.453 (FAIL) | — |
| Propagación de señal entre esferas (BA) | 0.58 (vs 0.5 azar); margen vector-vs-r 0.07 < umbral 0.10 | — |

## Requisitos de hardware

- No aplica inferencia de un modelo de lenguaje: el artefacto es código de simulación de osciladores y readout lineal.
- El coste computacional depende de N=120 osciladores × 4 esferas más la capa meta; ejecutable en CPU para los experimentos de `pilot/` según el tamaño de los grids.
- No se especifican requisitos de VRAM ni GPU recomendadas en la información disponible.
- No cabe hablar de consumer GPU, A100, H100 ni RTX 4090 en el sentido de servir el modelo: no hay pesos publicados.
- Opciones de despliegue: ejecución local del código Python (`python3 tests/run.py`); `service.py` espera una allowlist de claves local en `keys/` que no se incluye intencionadamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Capacidad de memoria | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kuramoto Nested Swarm V7 | Enjambre Lohe + readout RLS | MC ≈ 0.73–1.20 | MIT | Código en Hugging Face, sin pesos |
| ESN17 (baseline interno) | Echo State Network 17D | MC 2.94 | No disponible | Implementado en `pilot/` |
| ESN1440 (baseline interno) | Echo State Network 1440D | MC 8.00 | No disponible | Implementado en `pilot/` |
| window_k5 (baseline interno) | Memoria de ventana | MC 4.00; R² 0.697 | No disponible | Implementado en `pilot/` |

No se dispone de comparación con modelos de lenguaje ni con otros reservorios publicados externos en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo declarado por el autor: el objetivo de diseño ("world agent" / modelo del mundo) no se alcanzó; no se demuestra capacidad de predicción ni de planificación.
- Los experimentos usan únicamente semillas de tuning 400–425; no hay confirmación con semillas frescas.
- El preregistro confirmatorio nunca se congeló.
- El grid usa 2 semillas por celda y un único esquema de inyección.
- Los mundos de perturbación W4/W5 se describen como diseño fallido.
- La plasticidad no supera el umbral preregistrado (+0.05): full − frozen es solo +0.010 a +0.019.
- El replay ordenado ("sleep") no mejora al barajado.
- El margen vector-vs-r (0.07) queda por debajo del umbral preregistrado de 0.10.
- `service.py` requiere una allowlist de claves local (`keys/`) que no se incluye; el servicio está limitado a localhost.
- No es un modelo de lenguaje: no aplican sesgos lingüísticos, alucinación textual ni restricciones de idioma en el sentido habitual.
- Licencia MIT permite uso comercial del código, pero el artefacto no constituye un producto desplegable.
- Las notas internas originales en alemán (`README_internal_de.md`) incluían un bloqueo de "no publicar" que el autor levantó para esta release.

## Enlaces

- Hugging Face: https://huggingface.co/Uuuuuuniiiiiii/kuramoto-swarm-v7
- Resultados del grid: `pilot/GRID_RESULTS.md` (dentro del repositorio)
- Resultados MEMCAP: `pilot/MEMCAP_RESULTS.md` (dentro del repositorio)
- Resultados de tuning dinámico vs congelado: `pilot/TUNE4_RESULTS.md` (dentro del repositorio)
- Primer pilot: `pilot/RESULTS.md` (dentro del repositorio)
- Plan y regla de parada: `pilot/GRID_PLAN.md` (dentro del repositorio)
- Notas internas originales: `README_internal_de.md` (dentro del repositorio)
- Tests: `tests/run.py` (dentro del repositorio)
