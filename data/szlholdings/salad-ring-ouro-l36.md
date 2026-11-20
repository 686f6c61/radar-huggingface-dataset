# SZLHOLDINGS/salad-ring-ouro-l36

## Resumen

`salad-ring-ouro-l36` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina su "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad de origen y resultados auditables mediante ficheros de recibo (receipts). El repositorio se creó el 18 de noviembre de 2026 y se actualizó dos días después, sin descargas ni interacciones registradas en el momento de redactar esta ficha.

La model card no proporciona información técnica sustantiva sobre el modelo: no detalla arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El autor declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación reside en ficheros de recibo externos al repositorio, y que todo dato no acreditado debe considerarse "UNKNOWN" (desconocido). Esta política de honestidad documental es el rasgo más definido del artefacto.

Por tanto, esta ficha no puede evaluar el modelo en términos de capacidades reales. Su relevancia actual es limitada y de naturaleza meta: sirve como ejemplo de publicación de artefactos con trazabilidad declarativa, pero no como modelo evaluable para producción. Cualquier uso requeriría inspeccionar los receipts del estate y verificar el origen de los pesos.

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

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

El autor remite a los ficheros de recibo del "estate mesh" para cualquier afirmación sobre entrenamiento o evaluación, y declara que lo no acreditado en esta tarjeta debe tratarse como desconocido. No hay innovaciones técnicas documentadas (decodificación especulativa, atención lineal, etc.) ni referencias a papers o repositorios de implementación.

## Capacidades

- No se documentan capacidades específicas del modelo en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes o razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio u otros).

## Casos de uso

- Auditoría de trazabilidad: inspeccionar los ficheros de recibo del estate SZLHOLDINGS para verificar el origen y las métricas declaradas del artefacto antes de cualquier uso.
- Investigación sobre publicación gobernada de modelos: estudiar el patrón de model card con etiquetado MEASURED/REPORTED/UNKNOWN como ejemplo de documentación declarativa.
- Evaluación interna de artefactos opacos: usar el repositorio como caso de prueba para pipelines que deban rechazar modelos sin licencia ni especificaciones.
- Catalogación de modelos: registrar el artefacto en inventarios internos con estado "no evaluable" hasta que se publiquen los receipts.
- Docencia sobre riesgos de cadena de suministro en IA: ilustrar cómo una tarjeta sin datos técnicos impide cualquier decisión de adopción responsable.
- Verificación de integridad: comprobar hashes y recibos frente a la fuente canónica declarada (organización szl-holdings en GitHub) para confirmar que los pesos corresponden al artefacto auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y que los datos de evaluación residen en ficheros de recibo externos no incluidos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La ausencia de parámetros, contexto, licencia y benchmarks impide establecer una comparación significativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede determinar tamaño, arquitectura ni contexto, lo que impide planificar recursos.
- Licencia no declarada: no hay base legal para uso comercial ni para redistribución; debe tratarse como no apto para producción hasta aclaración.
- Idiomas no declarados: no se puede garantizar cobertura lingüística alguna.
- Riesgo de alucinación y sesgos: imposible de evaluar sin benchmarks ni documentación de datos de entrenamiento.
- Trazabilidad incompleta: las afirmaciones de entrenamiento y evaluación dependen de receipts externos no incluidos en el repositorio.
- Cero descargas y cero interacciones: no hay evidencia de uso comunitario ni validación independiente.
- Fecha de creación futura respecto a la mayoría de catálogos: conviene verificar la autenticidad del artefacto antes de cualquier integración.
- Recomendación: no desplegar en entornos de producción sin obtener previamente la licencia, los receipts de auditoría y una evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l36
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canónica declarada (organización GitHub): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards
