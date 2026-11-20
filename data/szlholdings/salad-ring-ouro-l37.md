# SZLHOLDINGS/salad-ring-ouro-l37

## Resumen

`salad-ring-ouro-l37` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de recibo (receipts). El repositorio de Hugging Face no incluye model card técnica convencional: la información disponible se limita a metadatos de identidad, referencias a un repositorio canónico en GitHub y gráficos SVG generados de forma determinista a partir de una instantánea de auditoría.

No se han publicado en la información disponible datos sobre arquitectura, número de parámetros, longitud de contexto, tokenizador, datos de entrenamiento ni resultados de evaluación. La propia model card declara explícitamente que cualquier afirmación de entrenamiento o evaluación no respaldada por un recibo se marca como UNKNOWN, y que no se afirma ningún número de benchmark más allá de lo medido en una auditoría fechada.

Por tanto, esta ficha documenta el estado real del artefacto: un modelo sin especificaciones públicas verificables, con licencia no declarada, sin idiomas declarados y sin pipeline asignado. Su relevancia actual es limitada para producción; su interés es principalmente como ejemplo de práctica de documentación orientada a trazabilidad y reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante. Tampoco se especifican el tokenizador, la dimensionalidad de las capas, el mecanismo de atención ni innovaciones técnicas asociadas.

Respecto al entrenamiento, la card indica que las afirmaciones de entrenamiento y evaluación del artefacto residen en sus ficheros de recibo dentro de la malla del estate, y que cualquier dato no receiptado en la propia card debe considerarse UNKNOWN. No se proporcionan cifras de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Los gráficos incluidos son SVG deterministas generados a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z, etiquetada como MEASURED, pero su contenido no se describe en texto en la información proporcionada.

## Capacidades

- No se documentan capacidades funcionales del modelo en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código o matemáticas.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas cubiertos.
- No se declaran capacidades especiales (modo thinking, visión, audio u otras).

## Casos de uso

- Evaluación de trazabilidad documental: el artefacto puede estudiarse como ejemplo de model card generada automáticamente con etiquetado MEASURED/REPORTED/UNKNOWN y sello temporal de captura, útil para diseñar pipelines de auditoría de modelos internos.
- Integración en catálogos internos de modelos: dado que el repositorio declara un origen canónico en GitHub, puede registrarse como entrada de inventario a la espera de que se publiquen recibos de evaluación.
- Verificación de reproducibilidad: los SVG deterministas permiten comprobar que la tarjeta se regenera de forma idéntica a partir de la misma instantánea, lo que sirve como prueba de integridad del proceso de generación.
- Docencia sobre buenas prácticas de documentación: la distinción explícita entre datos medidos y desconocidos es un caso didáctico sobre cómo evitar afirmaciones no respaldadas en fichas de modelos.
- Auditoría de licencias: dado que la licencia no está declarada, el repositorio puede usarse como caso de estudio de los riesgos de adoptar artefactos sin términos legales explícitos.
- Pruebas de herramientas de descubrimiento: útil para validar cómo se comportan scrapers, índices y motores de búsqueda de modelos ante repositorios con metadatos incompletos.

No se recomienda ningún caso de uso en producción mientras no se publiquen especificaciones técnicas, licencia y resultados de evaluación verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo medido en una auditoría fechada, y que los datos no receiptados se marcan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos compatible con estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre parámetros, contexto, rendimiento ni licencia que permita establecer una comparación significativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede planificar despliegue, estimar costes de inferencia ni evaluar idoneidad para una tarea concreta.
- Licencia no declarada: no hay base legal explícita para uso comercial, redistribución o modificación; adoptarlo en producción entraña riesgo jurídico.
- Idiomas no declarados: no se puede asumir cobertura multilingüe ni siquiera monolingüe.
- Sin resultados de evaluación: no existen datos públicos de MMLU, HumanEval, GSM8K ni métricas equivalentes que permitan estimar calidad.
- Riesgo de alucinación: no evaluable sin acceso al modelo y sin benchmarks; se desconoce su comportamiento en tareas factuales.
- Sesgos conocidos: no documentados.
- Formato de pesos no especificado: imposible verificar compatibilidad con safetensors, GGUF u otros formatos, lo que bloquea su uso con herramientas estándar.
- Trazabilidad parcial: la card remite a ficheros de recibo externos y a un repositorio canónico en GitHub, pero estos no se detallan en la información disponible; la verificación requiere acceso a esos artefactos.
- Fechas de creación y actualización (2026-11-18 y 2026-11-20) y ausencia de descargas y likes: repositorio sin adopción pública registrada en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l37
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio canónico en GitHub (referenciado en la card): https://github.com/szl-holdings
- Herramienta de generación de tarjetas (referenciada en la card): https://github.com/szl-holdings/estate-cards
