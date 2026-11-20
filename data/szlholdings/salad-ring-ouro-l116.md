# SZLHOLDINGS/salad-ring-ouro-l116

## Resumen

`salad-ring-ouro-l116` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face. Según la model card, forma parte de un "estate" de IA gobernada compuesto por modelos, datasets y Spaces con resultados trazables y verificables mediante ficheros de recibo (receipts). La nomenclatura del repositorio sugiere un identificador interno de la factoría de entrenamiento de la organización, no un nombre comercial de familia de modelos conocida.

La información pública disponible es extremadamente limitada. La model card no declara arquitectura, número de parámetros, longitud de contexto, idiomas, licencia ni pipeline de inferencia. El autor indica explícitamente que cualquier afirmación sobre entrenamiento o evaluación reside en los ficheros de recibo del "estate mesh" y que lo no documentado allí se etiqueta como UNKNOWN (desconocido). No se publica ninguna cifra de benchmark en la tarjeta.

Por tanto, esta ficha recoge únicamente los metadatos verificables del repositorio y marca como "no disponible" todo aquello que el autor no ha especificado. Cualquier evaluación práctica del modelo requiere inspeccionar los receipts enlazados en el ecosistema de SZLHOLDINGS o el propio árbol de ficheros del repositorio, que no se ha podido consultar en detalle.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card se limita a describir el marco de gobernanza del "estate" y a remitir a los ficheros de recibo para cualquier afirmación sobre entrenamiento o evaluación.

El autor declara un principio de honestidad explícito: no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y lo no medido se marca como UNKNOWN. La tarjeta fue generada de forma determinista por la herramienta `estate-cards weaver` v0.1.0 a partir de una instantánea de auditoría con marca temporal 2026-11-20T03:48:04Z.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se confirman modos especiales (thinking mode, visión, audio).

## Casos de uso

No es posible recomendar casos de uso concretos sin conocer la arquitectura, el tamaño, el contexto y las capacidades del modelo. A continuación se indican escenarios que requerirían validación previa contra los receipts del autor:

- Evaluación interna de artefactos gobernados: inspeccionar los ficheros de recibo del estate para determinar si el modelo cumple los requisitos de trazabilidad de una organización.
- Reproducción de auditorías: usar la instantánea de auditoría fechada como referencia para verificar resultados declarados.
- Integración en pipelines de investigación sobre gobernanza de IA: el modelo puede servir como ejemplo de artefacto con metadatos estructurados y etiquetado explícito de incertidumbre.
- Comparación metodológica: estudiar el formato de model card generado por `estate-cards weaver` como plantilla para documentación reproducible.
- Pruebas de carga en infraestructura propia: solo tras determinar el tamaño real del artefacto a partir de los ficheros del repositorio.
- Fine-tuning experimental: únicamente si la licencia y el formato de pesos resultan compatibles, extremo que no está confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y no se incluye ninguna tabla de resultados en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo, que no se declara).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables al no haberse especificado categoría, tamaño, arquitectura ni tarea.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se declara arquitectura, tamaño, contexto ni formato de pesos, lo que impide cualquier evaluación de idoneidad.
- Licencia no especificada: no puede confirmarse el uso comercial ni la redistribución.
- Idiomas no declarados: no puede garantizarse cobertura multilingüe.
- Sin benchmarks publicados: no existen métricas de rendimiento verificables en la tarjeta.
- Riesgo de alucinación y sesgos: no evaluables sin información sobre datos de entrenamiento y alineación.
- Repositorio sin descargas ni interacciones: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la evidencia externa disponible.
- Fecha de creación futura respecto a la fecha habitual de consulta (2026-11-19): conviene verificar la vigencia y autenticidad del repositorio.
- La model card remite a receipts externos no incluidos en la información proporcionada; sin acceso a ellos, el modelo debe tratarse como no verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l116
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generación de tarjetas: https://github.com/szl-holdings/estate-cards
