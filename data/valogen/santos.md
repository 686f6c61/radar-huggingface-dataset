# valogen/santos

## Resumen

Santos es un modelo publicado en HuggingFace por el usuario valogen bajo la licencia EUPL-1.2 (European Union Public Licence). La model card asociada no contiene ninguna descripción funcional: únicamente declara la licencia mediante metadatos YAML, sin especificar arquitectura, tamaño, datos de entrenamiento ni capacidades. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no tiene pipeline asignado.

Se desconoce por completo qué problema resuelve, qué arquitectura emplea y qué tipo de tarea cubre. No hay información sobre parámetros, longitud de contexto, tokenizador ni formato de pesos. Tampoco se han publicado idiomas soportados ni resultados de evaluación.

Dado que la ficha se redacta a partir de la información disponible, la mayoría de apartados técnicos se marcarán como "no disponible". Cualquier evaluación práctica del modelo requeriría inspeccionar directamente los archivos del repositorio (si existen) o contactar con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | EUPL-1.2 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM u otra), el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La model card no incluye ninguna sección técnica.

Tampoco hay referencias a papers, blogs técnicos o repositorios de código asociados que permitan inferir la arquitectura o el proceso de entrenamiento.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte para agentes o razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta ningún modo especial (thinking mode, visión, audio, etc.).

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin información sobre las capacidades del modelo. Cualquier aplicación descrita sería especulativa y contraria al criterio de rigor de esta ficha. Para evaluar su idoneidad en producción sería necesario:

- Inspeccionar los archivos del repositorio para determinar el formato de pesos y el tamaño.
- Ejecutar pruebas de inferencia básicas para verificar que el modelo carga y genera texto coherente.
- Consultar al autor sobre el dataset y el proceso de entrenamiento.
- Realizar una evaluación comparativa con benchmarks estándar (MMLU, HumanEval, GSM8K) antes de considerar cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del modelo, que se desconoce).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Sin datos sobre parámetros, contexto o rendimiento no es posible establecer una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card está vacía salvo por la declaración de licencia; no hay información sobre sesgos, alineación ni filtros de seguridad.
- Riesgo de alucinación: desconocido, al no haber evaluación publicada.
- Limitaciones de contexto e idioma: desconocidas.
- La licencia EUPL-1.2 es una licencia copyleft compatible con la GPL, pensada para software; su aplicabilidad a pesos de modelos y a usos comerciales derivados requiere revisión legal específica.
- El repositorio no registra descargas ni interacciones, lo que sugiere ausencia de validación por parte de la comunidad.
- No se debe desplegar en producción sin una evaluación previa propia.

## Enlaces

- HuggingFace: https://huggingface.co/valogen/santos
- Texto de la licencia EUPL-1.2: https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
