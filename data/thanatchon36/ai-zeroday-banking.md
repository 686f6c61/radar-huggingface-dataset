# thanatchon36/ai-zeroday-banking

## Resumen

`thanatchon36/ai-zeroday-banking` no es un modelo de lenguaje neuronal, sino un modelo de simulación paramétrica de riesgo sistémico cibernético en un sistema bancario estilizado de tipo tailandés. Lo desarrolla Thanatchon Chongmankhong y se asocia al artículo *Zero-Days at Machine Speed* (2026). El repositorio no contiene pesos: la "inferencia" consiste en ejecutar un Monte Carlo con semilla fija especificado por `model_specs.json`, las tablas `sim_*.csv` y el script `s07_simulation.py`.

El modelo simula un año de vulnerabilidades en seis capas de producto comercial compartido (edge/VPN, transferencia gestionada de ficheros, correo/colaboración, gestión IT/RMM, virtualización y aplicaciones empresariales). Cada zero-day o n-day puede comprometer bancos y proveedores de servicios mediante campañas masivas, ataques dirigidos o exposición previa al parcheo; los proveedores comprometidos propagan el fallo a sus clientes. Un evento se considera sistémico cuando interrumpe al menos el 10 % del valor de pagos, incluidos los canales RTGS o el switch minorista.

Su relevancia actual es metodológica y de política: cuantifica cómo el aumento de capacidad ofensiva por IA eleva la probabilidad anual de disrupción sistémica de pagos y qué efecto tienen la defensa asistida por IA y la concentración de proveedores. No es un modelo generativo, no procesa lenguaje y no sustituye a un LLM en ninguna tarea de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Simulación Monte Carlo paramétrica (no red neuronal); script `s07_simulation.py` con semilla fija |
| Parametros totales | no disponible (no hay pesos; constantes escalares en `model_specs.json`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; ficheros JSON, CSV y Python) |

## Arquitectura y entrenamiento

La arquitectura es un Monte Carlo sobre un sistema bancario estilizado, no un transformer ni un modelo secuencial. Las constantes escalares (semilla, umbral sistémico del 10 % del valor de pagos, número de capas, pass-through de FMI, clientes por proveedor, propagación, despliegue, hit rates, hazard de n-day y dispersión de parcheo) residen en `model_specs.json`; los escenarios y grupos están en los CSV. La calibración de las capas se realiza contra las tasas de explotación de CISA KEV, según la model card.

No hay entrenamiento con tokens ni RLHF/DPO: los parámetros son supuestos declarados por el autor y el modelo produce resultados relativos (escenario frente a línea base), no pronósticos. Los escenarios definidos son: línea base pre-2022, ofensiva con IA (capacidad ofensiva ×3), ofensiva con IA más defensa habilitada por IA, y variantes de concentración de proveedores (`sim_params.csv`). Los resultados, la rejilla de sensibilidad y las comprobaciones de robustez están en `sim_scenarios.csv`, `sim_grid.csv` y `sim_robustness.csv`.

## Capacidades

- Simulación de un año de vulnerabilidades en seis capas de producto comercial compartido.
- Modelado de compromiso de bancos y proveedores mediante campañas masivas, ataques dirigidos y exposición antes del parcheo.
- Propagación de compromisos desde proveedores de servicios hacia sus clientes.
- Clasificación de eventos como sistémicos según un umbral del 10 % del valor de pagos, incluyendo RTGS y switch minorista.
- Ejecución de escenarios contrafactuales: línea base, ofensiva con IA, ofensiva más defensa con IA y concentración de proveedores.
- Análisis de sensibilidad y robustez mediante rejillas de parámetros (`sim_grid.csv`, `sim_robustness.csv`).
- Reproducibilidad por semilla fija.
- No soporta tool calling, agentes, razonamiento multi-step generativo, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Evaluación de política regulatoria: ejecutar los escenarios de ofensiva y defensa con IA para estimar cómo cambia la probabilidad anual de disrupción sistémica de pagos y justificar inversiones en defensa.
- Análisis de concentración de proveedores: usar las variantes de concentración para cuantificar el incremento de riesgo sistémico asociado a depender de pocos proveedores en capas como edge/VPN o RMM.
- Priorización de parcheo: emplear la calibración a CISA KEV y la dispersión de parcheo para identificar qué capas generan mayor hazard de n-day y justificar ventanas de actualización.
- Ejercicios de estrés cibernético: integrar la simulación en simulacros de continuidad de negocio para explorar escenarios de compromiso de proveedor con propagación a clientes.
- Investigación académica en riesgo sistémico: reutilizar el código y los CSV con semilla fija para replicar o extender el análisis en otros sistemas bancarios estilizados.
- Comunicación de riesgo a consejos y supervisores: presentar resultados relativos (multiplicadores de probabilidad) en lugar de pronósticos absolutos, con supuestos explícitos y trazabilidad de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta resultados del propio modelo, no comparaciones con benchmarks estándar:

| Resultado reportado | Valor |
|---|---|
| Efecto de triplicar capacidad ofensiva con IA sobre probabilidad anual de disrupción sistémica | ~5× (rango 4,0–6,8×) |
| Reducción del incremento por defensa habilitada por IA | 50–75 % |
| Incremento por concentración de proveedores | 36–64 % |

## Requisitos de hardware

- No requiere GPU: es una simulación Monte Carlo en Python con semilla fija.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica; cualquier CPU convencional es suficiente.
- Cabe en cualquier equipo consumer; no hay requisitos de acelerador.
- Opciones de despliegue: ejecución directa del script `s07_simulation.py` con Python y las dependencias del repositorio de GitHub.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de simulación de riesgo sistémico cibernético con las mismas características, licencia y disponibilidad.

## Limitaciones y advertencias

- El sistema es estilizado y no representa Tailandia ni ninguna jurisdicción real; los parámetros son supuestos declarados.
- Los resultados son relativos (escenario frente a línea base), no pronósticos.
- No contiene código de explotación y no evalúa instituciones nombradas.
- Uso previsto limitado a investigación y discusión de política sobre riesgo cibernético sistémico.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, código, visión ni tareas de NLP.
- Idioma único: inglés.
- Licencia MIT, que permite uso comercial, pero el alcance del modelo no está pensado para decisiones operativas reales sin validación adicional.
- Riesgo de interpretación errónea si se citan los multiplicadores como predicciones absolutas en lugar de resultados condicionados a los supuestos.

## Enlaces

- Hugging Face: https://huggingface.co/thanatchon36/ai-zeroday-banking
- Paper: https://thanatchon36.github.io/ai-zeroday-banking/paper/
- Código: https://github.com/thanatchon36/ai-zeroday-banking
- Dataset: https://huggingface.co/datasets/thanatchon36/ai-zeroday-banking
