# yegom/connectailab-rl-yegomfloor-v2

## Resumen

`connectailab-rl-yegomfloor-v2` es un modelo de decisión basado en aprendizaje por refuerzo profundo (deep RL) publicado por el desarrollador coreano yegom (PARK SEHYUN) dentro de la iniciativa CONNECT AI LAB. No es un modelo de lenguaje: es una política entrenada para operar una empresa simulada dentro del videojuego/simulador CONNECT TYCOON, tomando decisiones de gestión (asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad) a lo largo de un ciclo de 20 días laborables.

El modelo sigue el paradigma de "cerebro de empresa" del simulador: recibe un estado estructurado (por ejemplo, una solicitud de reembolso con importe y puntuación de fraude) y devuelve una decisión tipada en formato JEV (`typesafe/jev-1.13`), con distribución de probabilidades y nivel de confianza. Se entrenó primero mediante aprendizaje supervisado imitando a un "presidente por reglas" y después se optimizó con PPO usando una función de recompensa basada en los valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0).

La relevancia es acotada pero concreta: sirve como ejemplo reproducible de pipeline de RL aplicado a toma de decisiones multiobjetivo, con integración directa en un simulador open source y una interfaz de inferencia estandarizada. Los tags de la model card mencionan "prefrontal-cortex" y "jev-style", que son etiquetas descriptivas del autor, no componentes arquitectónicos verificables. El repositorio ocupa 0.0 GB y usa `numpy` como librería, lo que sugiere pesos de política ligeros, no una red neuronal de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre representación de estado estructurado; detalles de red no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre estados estructurados, no sobre secuencias de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag del repositorio); tamaño del repo 0.0 GB |

## Arquitectura y entrenamiento

La información disponible indica un pipeline en dos fases: primero aprendizaje supervisado a partir de las decisiones de un "presidente por reglas" (política heurística de referencia del simulador) y después optimización con PPO (Proximal Policy Optimization) usando como recompensa los valores declarados de la empresa: beneficio, satisfacción del cliente y riesgo, cada uno con peso 1.0. La política consume estados del simulador CONNECT TYCOON (departamento, motivo, nivel de cliente, importe, puntuación de fraude, etc.) y emite decisiones discretas entre un conjunto de opciones por tipo de pregunta (por ejemplo, `full`, `partial`, `deny`, `human` en reembolsos).

No se especifican en la información proporcionada el número de parámetros, la topología de la red, el volumen de datos de entrenamiento, el número de pasos de entorno ni los hiperparámetros de PPO. La librería declarada es `numpy` y los pesos se distribuyen en safetensors, lo que es coherente con una política pequeña orientada a inferencia local. La salida se estructura en formato JEV (`typesafe/jev-1.13`), un esquema tipado de preguntas y respuestas que incluye probabilidades por opción y un campo de confianza.

## Capacidades

- Toma de decisiones discretas en un entorno de simulación empresarial: asignación de personal, reposición de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y medidas de seguridad.
- Salida probabilística tipada en formato JEV, con distribución sobre las opciones y nivel de confianza por decisión.
- Razonamiento multiobjetivo implícito: la política fue optimizada con una recompensa compuesta (beneficio, satisfacción y riesgo), por lo que internaliza compromisos entre esos tres objetivos.
- Gestión de episodios de 20 días laborables (un "mes" de operación) con estados que evolucionan según las decisiones previas.
- Capacidad de escalado a decisión humana: en el ejemplo de reembolso, la opción `human` deriva el caso a revisión manual con un coste de 0.8 unidades monetarias.
- Soporte de integración mediante la librería `connect_tycoon` (`CompanyBrain.from_hub`) y modo juego (`connect-tycoon play --brain hf:...`).
- Idioma de operación: coreano.
- No dispone de generación de texto libre, visión, audio ni tool calling genérico; su interfaz es la del esquema JEV del simulador.

## Casos de uso

- Evaluación de políticas de RL en entornos de simulación económica: el modelo sirve como referencia entrenada para comparar contra el "presidente por reglas" en métricas de beneficio, satisfacción, incidentes y días de rotura de stock.
- Investigación educativa en deep RL: ejemplo reproducible de pipeline supervisado + PPO con recompensa multiobjetivo, útil en cursos y talleres sobre RL aplicado a decisiones.
- Benchmark de entornos tipo gymnasium: al integrarse con CONNECT TYCOON, permite medir la calidad de una política frente a heurísticas en un episodio estandarizado de 20 días.
- Prototipado de agentes de decisión con salida tipada: el formato JEV con probabilidades y confianza facilita construir capas de abstención o derivación a humano en pipelines de decisión.
- Simulación de políticas de reembolso y antifraude: el ejemplo de la model card muestra cómo la política pondera reembolso completo, parcial, denegación o revisión humana según la puntuación de fraude.
- Demostraciones y contenido divulgativo: el modo `connect-tycoon play` permite visualizar las decisiones del modelo en el simulador, útil para vídeos, clases y material de formación.
- Estudio de compromisos entre objetivos: analizar cómo una política con pesos 1:1:1 entre beneficio, satisfacción y riesgo se desvía de una heurística puramente orientada a beneficio.

## Benchmarks y rendimiento

La model card incluye una comparación agregada frente al "presidente por reglas" sobre 40 meses no vistos:

| Métrica (media de 40 meses) | Presidente por reglas | connectailab-rl-parksehyun-v1-teacher |
|---|---|---|
| Beneficio mensual | 324만원 (3,24 M KRW) | 1122만원 (11,22 M KRW) |
| Satisfacción del cliente | 79% | 95% |
| Incidentes de riesgo | 7,8 | 2,8 |
| Derivaciones a humano | 37,8 | 20,8 |
| Días con rotura de stock | 10,7 | 0,5 |

Advertencia: estos datos corresponden a la model card del autor y a la variante `parksehyun-v1-teacher` citada en ella, no a una evaluación independiente de `yegomfloor-v2`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a un modelo de estas características. No se dispone de comparación numérica específica para la versión `v2`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0.0 GB y la librería es `numpy`, lo que indica que la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; por el tamaño del artefacto, cualquier GPU consumer es sobredimensionada para esta política.
- Compatibilidad con GPU consumer: sí, previsiblemente cualquiera; no requiere aceleración por hardware según la información disponible.
- Opciones de despliegue: librería `connect_tycoon` (`CompanyBrain.from_hub`), modo juego `connect-tycoon play --brain hf:...` y carga directa de pesos safetensors con `numpy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yegomfloor-v2 | Política RL (PPO) para CONNECT TYCOON | no disponible | no aplica | Apache 2.0 | HuggingFace |
| connectailab-rl-parksehyun-v1-teacher | Política RL (PPO) para CONNECT TYCOON, variante citada en la model card | no disponible | no aplica | Apache 2.0 (según la model card) | HuggingFace |
| Presidente por reglas (heurística del simulador) | Reglas deterministas | no aplica | no aplica | la del simulador CONNECT TYCOON | Integrado en el simulador |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas RL para simulación empresarial) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de ámbito muy restringido: solo opera dentro del simulador CONNECT TYCOON y con el esquema de estados y preguntas de ese entorno; no es un modelo de propósito general.
- El propio autor advierte que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión reales.
- Los benchmarks de la model card corresponden a la variante `parksehyun-v1-teacher`; no hay resultados publicados específicos para `yegomfloor-v2`.
- Idioma limitado al coreano; no se documenta soporte multilingüe.
- Riesgo de sobreajuste al simulador: las políticas entrenadas con PPO sobre una configuración concreta (`warehouse`, `base_demand`, `unit_cost`, etc.) pueden degradarse si cambian los parámetros de la empresa o la dinámica del entorno.
- Sin información sobre sesgos, calibración de probabilidades ni robustez ante estados fuera de distribución.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el uso práctico queda condicionado por la licencia y las dependencias del simulador CONNECT TYCOON.
- No apta para producción en decisiones reales de negocio, crédito, fraude o atención al cliente sin validación independiente y supervisión humana.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v2
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
