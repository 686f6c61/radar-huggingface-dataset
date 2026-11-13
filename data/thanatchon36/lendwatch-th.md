# thanatchon36/lendwatch-th

## Resumen

`lendwatch-th` es un repositorio publicado en Hugging Face por el autor thanatchon36 que acompaña al proyecto de investigación *Regulating Non-Bank Lenders in the Digital Age* (Thanatchon Chongmankhong, 2026). A pesar de estar alojado en Hugging Face, no contiene pesos entrenados de ningún modelo de lenguaje: es una especificación de un sistema de puntuación basado en reglas (`rule_score`) para priorizar aplicaciones y sitios web de préstamos digitales de cara a una revisión humana, en el contexto regulatorio de Tailandia.

El problema que aborda es el de la supervisión (suptech) de prestamistas no bancarios en el entorno digital: dado un conjunto de aplicaciones y sitios de préstamo, el sistema genera una puntuación de triaje que ordena los casos para que un revisor humano los examine. La puntuación es explícita y auditable, con los pesos definidos en `config.py` y la lógica de evaluación en `scoring.py`, que también incluye una función `fit_supervised` para reestimar los pesos con datos etiquetados por revisores.

Es relevante ahora por su enfoque de transparencia en un dominio sensible (regulación financiera): no se presenta como un clasificador opaco, sino como una cola de priorización cuya lógica es inspeccionable. No hay información sobre arquitectura de red neuronal, tamaño de parámetros ni longitud de contexto, porque no es un modelo de ese tipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema basado en reglas (rule-based scoring); no es un modelo neuronal |
| Parámetros totales | no disponible (no hay pesos entrenados) |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible (no hay pesos; los pesos de las reglas viven en `config.py`) |

## Arquitectura y entrenamiento

No se trata de un transformer ni de un modelo de lenguaje. El sistema es una puntuación de reglas transparente: los pesos que combinan las señales están definidos en `config.py`, y `scoring.py` implementa `rule_score`, las métricas de evaluación y `fit_supervised`, que reestima los pesos a partir de datos etiquetados por revisores humanos. Los umbrales legales incluidos en `config.py` (límites de tipos de interés, reglas de plataforma) son valores de partida que deben verificarse contra los textos oficiales vigentes.

La evaluación publicada es exclusivamente sintética: se generaron 30 mercados sintéticos, disponibles en el dataset `thanatchon36/non-bank-lending-research`. El autor indica explícitamente que la precisión en el mundo real es desconocida y que el sistema no está calibrado.

## Capacidades

- Puntuación de triaje de aplicaciones y sitios web de préstamos digitales para priorizar la revisión humana.
- Ordenación de casos en una cola: la puntuación es una posición en la cola, nunca una conclusión de ilegalidad.
- Reestimación supervisada de pesos mediante `fit_supervised` a partir de etiquetas de revisores.
- Lógica de puntuación inspeccionable y auditable, con pesos y umbrales legales en `config.py`.
- Evaluación reproducible sobre 30 mercados sintéticos.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Triaje regulatorio de aplicaciones de préstamo: un supervisor introduce el inventario de apps y sitios detectados y el sistema devuelve un orden de revisión, de modo que los revisores humanos examinan primero los casos con mayor puntuación.
- Priorización de inspecciones en suptech: el equipo regulatorio usa la cola generada para asignar recursos limitados de revisión a los prestamistas con señales de riesgo más altas.
- Investigación académica sobre préstamos no bancarios: el repositorio permite reproducir la metodología de puntuación y adaptar los pesos a otros mercados mediante `fit_supervised`.
- Calibración con datos de revisores: un equipo con etiquetas históricas de revisiones puede reestimar los pesos del scorer para ajustarlo a su propio criterio operativo.
- Auditoría de transparencia: al ser una puntuación de reglas explícita, permite documentar ante terceros por qué un caso quedó en una posición concreta de la cola.
- Prototipado de pipelines de detección: sirve como base para construir un sistema de triaje más amplio, sustituyendo o ampliando las reglas con nuevos indicadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación descrita es sobre 30 mercados sintéticos del dataset `thanatchon36/non-bank-lending-research`, sin métricas numéricas publicadas en la model card. El autor declara que la precisión en el mundo real es desconocida.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplica; el sistema se ejecuta como código Python de reglas.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue: ejecución directa del código del repositorio (`config.py`, `scoring.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos o sistemas comparables de la misma categoría (scoring basado en reglas para triaje regulatorio de préstamos digitales).

## Limitaciones y advertencias

- No contiene pesos entrenados: es una especificación de reglas, no un modelo de machine learning entrenado.
- No está calibrado: los pesos son un punto de partida y los umbrales legales de `config.py` (límites de tipos, reglas de plataforma) deben verificarse contra los textos oficiales vigentes.
- La evaluación es solo sintética (30 mercados sintéticos); la precisión en el mundo real es desconocida.
- Una puntuación es una posición en una cola de revisión, nunca una conclusión de ilegalidad; el uso previsto es exclusivamente el triaje para revisión humana.
- Licencia "other": no se detallan en la información disponible las condiciones para uso comercial ni su compatibilidad con despliegues en producción.
- Idiomas soportados no disponibles; el contexto regulatorio declarado es Tailandia.
- Riesgo de sesgo y de alucinación: no aplica en el sentido habitual de un modelo generativo, pero los umbrales regulatorios desactualizados o mal verificados pueden producir priorizaciones incorrectas.

## Enlaces

- Hugging Face: https://huggingface.co/thanatchon36/lendwatch-th
- Repositorio del proyecto: https://github.com/thanatchon36/non-bank-lending-research/tree/main/lendwatch-th
- Dataset de evaluación sintética: https://huggingface.co/datasets/thanatchon36/non-bank-lending-research
