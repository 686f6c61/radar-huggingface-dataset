# ya9919/sharp-322m

## Resumen

FinL-bilingual (publicado en Hugging Face como `ya9919/sharp-322m`) es un modelo de decisión especializado en elección financiera de hogares, desarrollado por el autor `ya9919` en el marco del proyecto S²-MAS (society-scale multi-agent simulation). No es un modelo generativo de propósito general: es un encoder multilingüe de aproximadamente 322 millones de parámetros con una cabeza de scoring de opciones, entrenado para puntuar alternativas completas de un cuestionario financiero dado un estado de hogar y una pregunta. Su función es servir como política de decisión reutilizable dentro de simulaciones multiagente a escala poblacional.

El modelo parte del encoder multilingüe mmBERT de Laya (~322M parámetros) y se adapta mediante dos etapas de SFT y RLCD nativo sobre 1.721.623 observaciones de entrenamiento por idioma, provenientes de datos de encuestas reales. Soporta entradas en inglés y chino, y se distribuye junto a un runtime MLX pareado (`fin-laya-multilingual-mlx`) que, según la model card, alcanza 22,72 veces el throughput de tokens de entrada compartidos de la API Jev 1.13 en el protocolo de medida del artículo.

Su relevancia es acotada pero específica: el manuscrito S²-MAS evalúa 12 millones de agentes sintéticos de hogar y 24 millones de elecciones, y este checkpoint es la versión bilingüe de supervisión inicial que permite ejecutar esa política de decisión con latencias de decenas de milisegundos en una sola A100. La licencia es una licencia de investigación controlada (`s2-mas-controlled-research-v1.2`), no una licencia permisiva estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT de Laya) con cabeza de scoring de opciones |
| Parámetros totales | 321.908.998 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (la model card solo documenta FP16/BF16 en los tests de despliegue) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | `s2-mas-controlled-research-v1.2` (licencia de investigación controlada; el repositorio retiene el apéndice Apache-2.0 original) |
| Formato de pesos | safetensors; runtime nativo Laya / PyTorch; runtime pareado MLX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer multilingüe (mmBERT, ~322M parámetros) con una cabeza de scoring que evalúa el conjunto completo de alternativas de una pregunta dado un estado de hogar. No genera texto libre: produce puntuaciones sobre opciones discretas, lo que permite reutilizar la misma interfaz de política para distintas tareas de elección financiera. El entrenamiento usa 1.721.623 observaciones por idioma derivadas de encuestas reales, con dos etapas de SFT y RLCD nativo (reinforcement learning from contrastive data, según la nomenclatura de la model card). El checkpoint corresponde a la supervisión inicial bilingüe; los checkpoints principales en inglés de seis rondas son `FinL` y `FinL-mlx`.

La innovación destacable no está en la arquitectura sino en el pipeline de despliegue: el par bilingüe PyTorch/MLX se evalúa con un protocolo de petición única en A100 PCIe 40GB, FP16, batch y concurrencia uno, con tres calentamientos y veinte repeticiones cronometradas por caso. El runtime MLX reporta 9,10 ms de latencia media y 36.955,47 tokens de entrada compartidos por segundo, frente a 22,06 ms y 15.247,34 tokens/s del mismo checkpoint en PyTorch FP16.

## Capacidades

- Scoring de opciones financieras: puntúa todas las alternativas de una pregunta de elección (sí/no, cuentas de depósito, tarjetas de crédito, cuentas de valores, depósitos a plazo) dado un estado de hogar.
- Soporte bilingüe inglés-chino en la misma política de decisión.
- Interfaz de política reutilizable: la misma firma de entrada (estado de hogar + pregunta + menú de opciones) sirve para distintas tareas de elección.
- Integración en simulación multiagente a escala poblacional (marco S²-MAS con 500 millones de personas-hogar construidas).
- No dispone de generación de texto libre, tool calling, function calling, razonamiento multi-paso ni capacidades de visión o audio según la información disponible.
- No se documentan capacidades de agente autónomo más allá de la puntuación de decisiones individuales.

## Casos de uso

- Simulación de decisiones financieras de hogares a escala poblacional: el modelo puntúa elecciones de consumo, efectivo y pago para millones de agentes sintéticos, conectando decisiones individuales con resultados agregados en el marco S²-MAS.
- Modelado de tenencia de productos financieros: clasificación de si un hogar tiene tarjeta de crédito activa, cuenta de depósito a la vista en renminbi, cuenta de valores o depósitos a plazo no vencidos, a partir del estado del hogar.
- Evaluación de escenarios contrafactuales: al ser una política reutilizable, permite recalcular decisiones bajo condiciones cambiantes (por ejemplo, shocks de ingresos) sin reentrenar el modelo.
- Investigación académica en economía del comportamiento: generación de datos sintéticos etiquetados que reproducen patrones de encuestas reales para estudios de elección discreta.
- Benchmarking de infraestructura de inferencia: el par PyTorch/MLX sirve como caso de prueba reproducible de latencia y throughput en A100 con protocolo documentado.
- Generación de datos sintéticos de acompañamiento: el proyecto publica scripts independientes de generación de datos sintéticos que pueden alimentar pipelines de evaluación del propio modelo.
- Prototipado de asistentes de decisión financiera acotados: integración en flujos donde la salida es una elección entre opciones predefinidas, no texto libre.

## Benchmarks y rendimiento

| Test | Idioma de entrada | Backend / precisión | QA (denominador) | Versiones de pregunta | Accuracy | F1 macro por pregunta |
|---|---|---|---:|---:|---:|---:|
| Preguntas financieras compartidas | Chino | PyTorch BF16 | 240.458 | 119 | 74,52% | 37,99% |

Según la Figura 5 del manuscrito, el test compartido en chino mejora 21,61 puntos porcentuales de accuracy y 10,60 puntos de F1 respecto al modelo base multilingüe. La accuracy pondera por igual los registros de QA; el F1 macro por pregunta promedia el F1 sobre las clases candidatas completas dentro de cada versión de pregunta y luego pondera las versiones por igual.

Rendimiento de despliegue (11 de octubre de 2026, una NVIDIA A100 PCIe 40GB, FP16, batch y concurrencia uno, tres casos fijos en chino, tres calentamientos y veinte repeticiones por caso, 60 llamadas cronometradas por brazo):

| Checkpoint / referencia | Latencia media (ms) | Opciones/s | Tokens de entrada compartidos/s |
|---|---:|---:|---:|
| FinL-bilingual · PyTorch FP16 | 22,06 | 45,33 | 15.247,34 |
| FinL-bilingual-mlx · MLX CUDA FP16 | 9,10 | 109,88 | 36.955,47 |
| Jev 1.13 · API | 206,77 | 4,84 | 1.626,63 |

MLX entrega 22,72 veces el throughput de tokens de entrada compartidos de la API Jev y 2,42 veces el del mismo checkpoint en PyTorch. El tiempo incluye preparación de entrada, tokenización, predicción sincronizada y formateo de respuesta; la carga queda excluida y Jev incluye el round trip de red. Los tokens compartidos se cuentan con el tokenizador mmBERT sobre peticiones serializadas idénticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 321,9M parámetros, en FP16 los pesos ocupan aproximadamente 0,64 GB, más overhead de activaciones y tokenizador.
- GPU recomendadas: la model card solo documenta pruebas en NVIDIA A100 PCIe 40GB; no se publican pruebas en otras GPU.
- Compatibilidad con GPU de consumo: no documentada; por tamaño de pesos (menos de 1 GB en FP16) cabría en GPU de consumo, pero no hay validación publicada.
- Opciones de despliegue: runtime nativo Laya / PyTorch con `predict_example.py` y `example_request.json`; runtime MLX pareado (`fin-laya-multilingual-mlx`) para CUDA en FP16.
- Latencia y throughput: 22,06 ms y 45,33 opciones/s en PyTorch FP16; 9,10 ms y 109,88 opciones/s en MLX CUDA FP16, ambos en A100 PCIe 40GB con batch y concurrencia uno.
- No se documentan soporte para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| FinL-bilingual (`ya9919/sharp-322m`) | 321,9M | No disponible | en, zh | `s2-mas-controlled-research-v1.2` | Hugging Face, runtime PyTorch y MLX |
| FinL / FinL-mlx (checkpoints principales en inglés, seis rondas) | No disponible | No disponible | en (principal) | No disponible | Hugging Face (`ya9919/FinL`, `ya9919/FinL-mlx`) |
| Jev 1.13 (API comercial de referencia) | No disponible | No disponible | No disponible | API propietaria | API |
| Modelo base multilingüe de Laya (mmBERT) | ~322M | No disponible | multilingüe | No disponible | Hugging Face |

La comparación con modelos generativos de propósito general no es aplicable: FinL-bilingual es un modelo de scoring de opciones, no un modelo de lenguaje generativo, y su evaluación se realiza sobre preguntas de elección financiera con denominadores y métricas específicas.

## Limitaciones y advertencias

- Modelo de dominio estrecho: solo puntúa opciones de elección financiera; no genera texto, no razona en multi-paso y no soporta tool calling.
- Cobertura lingüística limitada a inglés y chino; no se documenta rendimiento en castellano ni en otros idiomas.
- F1 macro por pregunta bajo (37,99%) pese a una accuracy del 74,52%, lo que indica desequilibrio entre clases candidatas y riesgo de sesgo hacia opciones mayoritarias.
- Los datos de entrenamiento provienen de encuestas reales; no se documentan análisis de sesgos demográficos, geográficos ni socioeconómicos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de predicciones incorrectas sistemáticas en estados de hogar fuera de la distribución de entrenamiento.
- Licencia de investigación controlada (`s2-mas-controlled-research-v1.2`): el uso comercial no está cubierto por una licencia permisiva estándar; el repositorio retiene el apéndice Apache-2.0 original, pero las condiciones de uso comercial no están detalladas en la información disponible.
- El motor GENESE/MAS permanece privado; solo se publican scripts de plotting científico, entrenamiento/evaluación del modelo de decisión y generación de datos sintéticos independientes.
- Los benchmarks publicados se limitan al test compartido en chino; no hay resultados publicados para inglés ni para otras tareas.
- No se documenta longitud de contexto, tipos de cuantización soportados ni pruebas en GPU distintas de la A100.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/sharp-322m
- Runtime MLX pareado: https://huggingface.co/ya9919/fin-laya-multilingual-mlx
- Checkpoint principal en inglés: https://huggingface.co/ya9919/FinL
- Checkpoint principal en inglés (MLX): https://huggingface.co/ya9919/FinL-mlx
- Licencia: https://huggingface.co/ya9919/fin-laya-multilingual/blob/main/LICENSE
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Manuscrito S²-MAS (PDF): https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Ejemplos de QA (JSON): https://huggingface.co/ya9919/sharp-322m/blob/main/qa_examples.json
