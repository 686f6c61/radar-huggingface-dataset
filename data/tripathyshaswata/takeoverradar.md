# tripathyShaswata/TakeoverRadar

## Resumen

TakeoverRadar es un modelo de clasificación tabular orientado a la seguridad de la cadena de suministro de software, concretamente a la predicción de secuestros de paquetes npm (maintainer takeovers). Lo desarrolla el usuario de Hugging Face `tripathyShaswata` y aborda un problema creciente: la apropiación de paquetes populares mediante robo de tokens de publicación, phishing a mantenedores, gusanos autorreplicantes (Shai-Hulud, s1ngularity) y tomas de control sociales lentas (event-stream, patrón xz).

El modelo no es una red neuronal generativa, sino un sistema de hazard discreto en el tiempo que combina un LightGBM con un transformer causal preentrenado de forma autosupervisada sobre 5,4 millones de package-months. Ofrece dos modos operativos: pronóstico mensual (probabilidad de secuestro en el mes siguiente usando solo información pública previa) y modo brote (una vez reportadas las primeras víctimas de una campaña, identificar los siguientes paquetes afectados).

Es relevante porque cuantifica empíricamente una intuición contraintuitiva: los heurísticos clásicos de "eslabón débil" (mantenedor único, sin provenance, scripts de instalación, paquete abandonado) rinden peor que el azar en 2026, ya que los atacantes priorizan paquetes activos y bien mantenidos. El repositorio ocupa 0,1 GB y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble: LightGBM (hazard discreto en el tiempo) + transformer causal preentrenado autosupervisado; blend por percentiles intra-mes |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada tabular por package-month) |
| Tipos de cuantización | no disponible (no aplica a modelos tabulares/GBM) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefactos LightGBM y checkpoint del transformer; no se detalla en la model card) |

## Arquitectura y entrenamiento

El sistema se compone de varias piezas. El modelo `popularity` mide dependientes dentro del corpus. Los modelos `gbm_*` son LightGBM con hazard discreto en el tiempo y un offset de línea base por mes, de modo que aprenden riesgo relativo intra-mes en lugar de cuándo llegan las oleadas de gusanos; la variante `_eq` pondera por igual cada campaña para que un gusano de 90 paquetes no defina la noción de riesgo. Las features `pre` provienen de un transformer causal preentrenado de forma autosupervisada sobre 5,4 millones de package-months anteriores a 2026 para predecir el mes siguiente de cada paquete; aporta una señal de "sorpresa" por mes y un resumen de 8 dimensiones de la historia. Un transformer entrenado directamente sobre las etiquetas memorizó sus ~100 positivos y quedó en AUC 0,47, por lo que el preentrenamiento no supervisado resultó imprescindible. El blend `blend_*` promedia percentiles intra-mes de popularidad y GBM.

Los datos de etiquetas provienen de OSV malicious-packages y GHSA: 1.909 eventos de secuestro en 70 campañas entre 2015-09 y 2026-10. El universo son los 119.994 paquetes npm más descargados (ecosyste.ms), con un panel de 6,84 millones de package-months (2017-01 a 2026-10). Cada fila se calcula exclusivamente con información publicada antes del primer día de ese mes; los controles de fuga garantizan que cada etiqueta cae en el mes de su evento, que no hay filas posteriores a un secuestro y que ninguna feature separa por sí sola los secuestros (AUC estratificado máximo de una sola feature: 0,73). El modelo desplegado es `blend_pre_eq`, declarado primario antes de ejecutar el test retenido y, desde 2026-10-27, entrenado con etiquetas OSV más 81 secuestros minados de versiones eliminadas.

## Capacidades

- Clasificación tabular binaria de riesgo de secuestro por paquete y mes.
- Pronóstico mensual prospectivo usando solo información pública previa al mes evaluado.
- Modo brote: puntuación de paquetes candidatos (92k–108k por campaña) en el momento en que se reporta la k-ésima víctima.
- Integración de señales de historial de packument (mantenedores, publicadores, trusted publishing, provenance, cadencia).
- Uso de posición en el corpus (portfolios de mantenedores, dependientes) e historial git de 40.000 repositorios (recién llegados, desvanecimiento de mantenedores, ediciones de CI/build/fixture).
- Señal de contagio: informes recientes que comparten mantenedor o scope.
- En modo brote, incorpora actividad de publicación en vivo (versiones publicadas desde el inicio de la campaña, ráfagas de publicación en el registro, tiempo hasta la release maliciosa de la víctima conocida más cercana).
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Monitorización continua de dependencias en CI/CD: integrar el pronóstico mensual para marcar paquetes del árbol de dependencias con riesgo elevado y priorizar auditorías antes de que se publique una versión maliciosa.
- Respuesta a incidentes en modo brote: al detectarse las primeras víctimas de un gusano, puntuar el resto del registro para identificar paquetes probablemente ya comprometidos y acelerar la contención.
- Puerta de admisión de nuevas dependencias: usar el riesgo intra-mes como señal adicional en revisiones de pull requests que introducen paquetes npm nuevos.
- Priorización de parches en SBOM: ordenar los componentes de un inventario por probabilidad de secuestro para decidir qué actualizar o sustituir primero.
- Investigación de seguridad y threat intelligence: analizar qué familias de features (provenance, cadencia de publicación, portfolios de mantenedores) correlacionan con campañas concretas.
- Evaluación de políticas de registro: medir el impacto de exigir trusted publishing o provenance sobre el riesgo estimado de los paquetes del universo monitorizado.
- Detección de tomas de control sociales lentas: el modelo incorpora historial git y desvanecimiento de mantenedores, útil para señalar paquetes con transiciones de mantenimiento sospechosas.

## Benchmarks y rendimiento

Test retenido 2026 (enero a octubre), ejecutado una sola vez: 405 secuestros, 22 campañas. Métricas estratificadas por mes natural.

| Modelo | AUC | IC 95% | recall@1% | recall@5% | AUC media por campaña |
|---|---|---|---|---|---|
| popularity | 0,563 | 0,51–0,62 | 0,005 | 0,030 | 0,546 |
| weak-links heuristic | 0,320 | 0,12–0,47 | 0,000 | 0,000 | 0,274 |
| gbm_full | 0,712 | 0,61–0,85 | 0,007 | 0,096 | 0,746 |
| gbm_full_eq | 0,738 | 0,64–0,84 | 0,005 | 0,099 | 0,726 |
| gbm_pre_eq | **0,745** | 0,63–0,87 | **0,035** | **0,141** | 0,730 |
| blend_full_eq | 0,698 | 0,64–0,77 | 0,005 | 0,076 | 0,672 |
| blend_pre_eq (primario) | 0,700 | 0,64–0,78 | 0,010 | 0,072 | 0,671 |

Dev (anterior a 2026, validación cruzada agrupada por campaña, 5 folds): 235 secuestros, 21 campañas.

| Modelo | AUC | recall@1% | recall@5% | AUC media por campaña |
|---|---|---|---|---|
| popularity | 0,659 | 0,047 | 0,204 | 0,755 |
| gbm_full | 0,618 | 0,009 | 0,060 | 0,757 |
| supervised transformer | 0,467 | 0,026 | 0,085 | 0,502 |
| gbm_pre_eq | 0,676 | 0,017 | 0,094 | 0,809 |
| blend_pre_eq | **0,706** | 0,043 | 0,179 | 0,836 |

Observaciones del autor: el modelo primario se mantuvo estable (AUC 0,706 en dev y 0,700 en test); la popularidad dejó de funcionar en 2026 (AUC de 0,66 a 0,56); el preentrenamiento elevó recall@1% de 0,005 a 0,035 y recall@5% de 0,099 a 0,141 en test; el techo es bajo y esperado porque la mayoría de secuestros provienen de oleadas de gusanos que eligen víctimas en días siguiendo tokens robados, algo invisible con datos congelados a inicio de mes.

## Requisitos de hardware

- No aplica VRAM en el sentido de inferencia de un LLM: el componente LightGBM es CPU-friendly y el transformer aporta features precalculadas.
- El repositorio ocupa 0,1 GB, por lo que el almacenamiento necesario es mínimo.
- No se especifican GPU recomendadas; el entrenamiento del transformer causal sobre 5,4 millones de package-months requiere GPU, pero la card no detalla modelo concreto.
- Cabe en cualquier equipo de desarrollo convencional para inferencia del GBM.
- Opciones de despliegue: no documentadas en la model card (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| TakeoverRadar | Ensemble GBM + transformer tabular | Secuestro de paquetes npm | MIT | Hugging Face |
| weak-links heuristic | Reglas | Checklist de eslabón débil | no disponible | Referencia en la card |
| popularity baseline | Estadístico | Dependientes en el corpus | no disponible | Referencia en la card |

No se dispone de información sobre otras herramientas comparables de predicción de secuestros de paquetes npm en la documentación proporcionada.

## Limitaciones y advertencias

- El techo de rendimiento es bajo por diseño: AUC ~0,70 en test; la mayoría de secuestros son oleadas de gusanos que el pronóstico mensual no puede anticipar con datos congelados a inicio de mes.
- La popularidad como señal se degradó en 2026 (AUC 0,56), lo que arrastra a los blends; el GBM con features preentrenadas supera al modelo desplegado en test (0,745 frente a 0,700), aunque esto se observó después del test y no se reporta como resultado principal.
- El heurístico de "eslabón débil" rinde peor que el azar en 2026 (AUC 0,320): no debe usarse como sustituto.
- Dependencia de etiquetas OSV/GHSA, que pueden estar incompletas; el autor añade 81 secuestros minados de versiones eliminadas para mitigarlo.
- El modo brote requiere que las primeras víctimas se reporten públicamente; hay un retraso inherente entre compromiso y detección.
- Sesgos conocidos: no documentados explícitamente; el entrenamiento se limita a los 119.994 paquetes npm más descargados, por lo que paquetes de nicho quedan fuera del universo.
- Licencia MIT permite uso comercial sin restricciones, pero no hay garantías de exactitud ni soporte.
- No procesa lenguaje natural, por lo que no sirve para análisis de código fuente ni de mensajes de mantenedores.
- La información sobre formatos de pesos y artefactos concretos es escasa; conviene inspeccionar el repositorio antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tripathyShaswata/TakeoverRadar
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
