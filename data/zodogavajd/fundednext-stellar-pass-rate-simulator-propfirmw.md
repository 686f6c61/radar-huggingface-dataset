# ZODOGAVAJD/fundednext-stellar-pass-rate-simulator-propfirmw

## Resumen

El repositorio `ZODOGAVAJD/fundednext-stellar-pass-rate-simulator-propfirmw` no contiene un modelo de lenguaje ni un artefacto de IA en sentido estricto. Se trata de un espacio de Hugging Face cuyo contenido es una model card promocional centrada en simulaciones de Monte Carlo para evaluar las tasas de aprobación (*pass rates*) del Stellar Challenge de la firma de *prop trading* FundedNext. El autor, identificado como ZODOGAVAJD, publica el repositorio bajo licencia MIT y lo etiqueta con términos como `monte-carlo`, `prop-trading`, `pass-rates` y `fundednext`.

La información disponible no describe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia. No hay ficheros de modelo, datasets ni código de simulación publicados en la información proporcionada. El repositorio parece funcionar como página de aterrizaje con fines de marketing de afiliación, incluyendo un código de descuento (`PROPFIRMW`) y enlaces a portales externos.

Por tanto, esta ficha documenta lo que el repositorio declara y señala explícitamente qué datos técnicos no están disponibles. Cualquier evaluación como modelo de IA, comparativa de rendimiento o requisito de hardware no puede realizarse con la información existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe red neuronal ni artefacto de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible (no se listan ficheros de pesos) |

## Arquitectura y entrenamiento

No se describe arquitectura de modelo, corpus de entrenamiento, número de tokens, proceso de alineación (RLHF, DPO) ni innovaciones técnicas de inferencia. El único contenido técnico declarado es la existencia de una "simulación matemática" de evaluaciones de 1 y 2 pasos del Stellar Challenge, con la afirmación de que la ausencia de plazos de calendario incrementa en un 24,8 % la probabilidad de alcanzar los objetivos de evaluación sin violar el drawdown máximo.

Esa cifra (24,8 %) aparece sin metodología, sin código de simulación, sin semilla, sin distribución de retornos asumida y sin número de iteraciones Monte Carlo. No es verificable con la información disponible y no debe tratarse como resultado reproducible.

## Capacidades

- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de *tool calling* ni *function calling*.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües.
- La única funcionalidad aludida es una simulación de probabilidades de aprobación de un desafío de *prop trading*, sin artefacto ejecutable publicado.
- El repositorio incluye enlaces promocionales y un código de descuento.

## Casos de uso

- Evaluación de riesgo en desafíos de *prop trading*: el autor sugiere usar la simulación para estimar la probabilidad de superar un Stellar Challenge de 1 o 2 pasos sin violar el drawdown máximo. No hay código publicado que permita ejecutar esa simulación.
- Comparación de reglas de evaluación: en teoría, un simulador Monte Carlo permitiría contrastar configuraciones de objetivo de beneficio y límite de pérdida. No disponible en el repositorio.
- Material de referencia para traders: la model card enlaza a `propfirm-match.pro` como fuente de datos de *pass rates* y *scorecards*.
- Promoción de afiliación: el repositorio actúa como página de aterrizaje con código de descuento para FundedNext.
- Integración en pipelines de análisis cuantitativo: no viable, al no existir pesos, API ni código de simulación.
- Despliegue en producción: no aplicable, al no ser un modelo de IA desplegable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica citada es el incremento del 24,8 % en la probabilidad de aprobación atribuido a la ausencia de plazos de calendario, sin datos de soporte, metodología ni comparación con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no hay pesos ni modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos o artefactos comparables de la misma categoría, dado que el repositorio no contiene un modelo de IA.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador, código ni dataset; no es un modelo de IA utilizable.
- La cifra del 24,8 % no es verificable: no se documenta metodología, supuestos de distribución de retornos, número de iteraciones ni semilla.
- El contenido tiene carácter promocional y de afiliación (código `PROPFIRMW`, enlaces a portales de terceros); debe tratarse con cautela.
- Cero descargas y cero *likes* en el momento de la consulta, sin evidencia de uso o validación por la comunidad.
- No se declaran idiomas soportados ni pipeline.
- La licencia MIT se aplica al contenido del repositorio, pero no hay artefacto técnico sobre el que ejercerla.
- Cualquier decisión financiera basada en las cifras del repositorio carece de base verificable y conlleva riesgo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ZODOGAVAJD/fundednext-stellar-pass-rate-simulator-propfirmw
- Portal citado por el autor (datos de *pass rates*): https://propfirm-match.pro/
- Portal citado por el autor (FundedNext, con código de afiliación): https://fundednext.com/?fpr=PROPFIRMW
