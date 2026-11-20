# SZLHOLDINGS/salad-ring-ouro-l119

## Resumen

`salad-ring-ouro-l119` es un modelo entrenado publicado por SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de recibo (receipts). El repositorio se creó el 19 de noviembre de 2026 y se actualizó al día siguiente, sin que consten descargas ni interacciones en el momento de redactar esta ficha.

La model card no proporciona información técnica sustantiva: no declara arquitectura, número de parámetros, longitud de contexto, idiomas, licencia ni pipeline de uso. El autor indica explícitamente que cualquier afirmación sobre entrenamiento o evaluación reside en los ficheros de recibo del "estate mesh" y que, fuera de lo medido en una auditoría fechada, el valor es UNKNOWN. Esta ficha refleja, por tanto, el estado real de la información disponible y marca como "no disponible" todo aquello que el autor no ha publicado.

La relevancia actual del artefacto es limitada desde el punto de vista técnico, pero resulta ilustrativa de una práctica emergente: publicar modelos con metadatos de auditoría deterministas (SVG generado con la biblioteca estándar de Python a partir de una instantánea de auditoría) y con una política explícita de no inventar cifras. Para un desarrollador que evalúe el modelo, esto significa que no puede estimar costes de inferencia ni idoneidad sin consultar los recibos enlazados en el ecosistema del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un híbrido, ni tampoco el número de parámetros, la composición del dataset de entrenamiento o el volumen de tokens procesados.

El autor declara que las afirmaciones sobre entrenamiento y evaluación "viven en sus ficheros de recibo" dentro del mesh del estate, y que cualquier dato no incluido en un recibo fechado se considera UNKNOWN. No se detalla si hubo ajuste fino supervisado, RLHF, DPO u otra etapa de alineamiento. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de razonamiento extendido.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni de razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta ningún modo especial (thinking mode, visión, audio u otros).
- El pipeline de Hugging Face figura como "no disponible", por lo que no puede confirmarse ni siquiera que sea un modelo de generación de texto.

## Casos de uso

No es posible recomendar casos de uso concretos sin conocer la arquitectura, el tamaño, el contexto y la licencia del modelo. A continuación se indican escenarios que requerirían validación previa contra los recibos del autor:

- Evaluación comparativa interna: desplegar el modelo en un entorno aislado y medir latencia y calidad frente a alternativas ya aprobadas, siempre que se confirme primero el formato de pesos y la licencia.
- Integración en pipelines de CI/CD para generación de código: solo viable si los recibos documentan capacidad de código y tool calling, extremo que la model card no afirma.
- Atención al cliente multi-turno: requiere conocer la ventana de contexto efectiva, dato no publicado.
- Procesamiento documental de contexto largo: depende de la longitud de contexto, no disponible.
- Despliegue en infraestructura propia: exige conocer el número de parámetros y las cuantizaciones soportadas para dimensionar VRAM.
- Uso comercial en producto: condicionado a una licencia explícita que el repositorio no declara.

En todos los casos, la recomendación técnica es consultar los ficheros de recibo del estate mesh antes de comprometer recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara de forma explícita que no se afirma ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y que los gráficos incluidos son SVG deterministas generados a partir de una instantánea de auditoría del 20 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (falta el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; se desconoce incluso el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La ausencia de parámetros, contexto y licencia impide establecer una comparación técnicamente rigurosa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l119 | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; sin información sobre datos de entrenamiento no puede evaluarse el riesgo de sesgo.
- Riesgo de alucinación: no evaluable sin benchmarks ni documentación de alineamiento.
- Limitaciones de contexto o idioma: se desconoce la ventana de contexto y los idiomas soportados.
- Restricciones de licencia: el repositorio no declara licencia, lo que impide asumir permiso de uso comercial; en ausencia de licencia explícita debe tratarse como uso restringido por defecto.
- Trazabilidad: el autor sitúa las afirmaciones verificables en ficheros de recibo externos al repositorio; sin acceder a ellos, cualquier dato técnico es UNKNOWN.
- Madurez: cero descargas y cero interacciones en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- Fecha de creación futura respecto a los ciclos habituales de publicación: el repositorio figura creado el 19 de noviembre de 2026, dato que conviene verificar en origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l119
- Organización del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub: https://github.com/szl-holdings
- Herramienta de generación de fichas del autor: https://github.com/szl-holdings/estate-cards
