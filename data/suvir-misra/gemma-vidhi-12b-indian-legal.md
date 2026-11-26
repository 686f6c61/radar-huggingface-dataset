# Suvir-Misra/Gemma-Vidhi-12B-Indian-Legal

## Resumen

Gemma-Vidhi 12B (विधि-मित्र) es un ajuste fino del modelo google/gemma-2-12b-it orientado a derecho indio, fiscalidad directa e indirecta (GST, aduanas, impuesto sobre la renta, DGFT, SEBI, PMLA) y jurisprudencia de los tribunales Supremo y Superiores de la India. Lo desarrolla Suvir-Misra y se publica bajo licencia Gemma con pesos fusionados y cuantizados a 8 bits en formato MLX, pensados para ejecución local en Apple Silicon.

El modelo parte de la arquitectura transformer decoder-only de Gemma 2 (11.907.350.272 parámetros) y aplica una técnica de mezcla de pesos WiSE-FT: un 70 % de un adaptador de razonamiento jurídico específico de dominio y un 30 % de un adaptador ancla de redacción de órdenes estatutarias, fusionados posteriormente en un único conjunto de pesos. El autor declara cobertura normativa y jurisprudencial hasta finales de 2026, incluyendo acuerdos del Consejo del GST y sentencias del Tribunal Supremo.

Su relevancia es acotada pero específica: cubre un nicho (derecho fiscal indio) escasamente atendido por modelos generalistas, y lo hace con un formato que permite inferencia local sin GPU dedicada en equipos Mac. No obstante, el repositorio no incluye datos de benchmarks ni documentación técnica sobre el proceso de entrenamiento más allá de la descripción de la mezcla de adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), pesos fusionados con WiSE-FT |
| Parametros totales | 11.907.350.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (pesos fusionados); no se documentan otras variantes |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX, 8-bit) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-2-12b-it: transformer decoder-only con atención por ventanas alternas y atención global, más de 12 000 millones de parámetros. Sobre esa base se aplican dos adaptadores (gemma4_vidhi_adapters y gemma4_adapters) que se combinan mediante WiSE-FT con una ponderación 70/30, respectivamente, y se fusionan en los pesos finales. El resultado se publica cuantizado a 8 bits para MLX.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El autor declara que el modelo está «entrenado» sobre sentencias del Tribunal Supremo y de los Tribunales Superiores y sobre acuerdos del Consejo del GST hasta finales de 2026, pero no se aporta ningún detalle verificable sobre volumen, filtrado o metodología de anotación. La única innovación técnica documentada es la mezcla WiSE-FT de adaptadores y la fusión en pesos 8-bit para MLX.

## Capacidades

- Generación de texto conversacional en inglés sobre materia jurídica india.
- Razonamiento sobre normativa fiscal indirecta: GST, aduanas, DGFT, así como impuesto sobre la renta, SEBI y PMLA.
- Referencia a jurisprudencia del Tribunal Supremo, Tribunales Superiores, GSTAT, CESTAT, ITAT y SAT, según la model card.
- Redacción de órdenes y escritos estatutarios (gracias al adaptador ancla incluido en la mezcla).
- Cobertura declarada de reformas penales y de los acuerdos 53.º a 57.º del Consejo del GST.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Consulta fiscal interna para despachos: el modelo puede responder preguntas sobre tratamiento de GST, plazos de recurso ante el GSTAT o cómputo de pre-depósitos, apoyándose en la cobertura normativa declarada hasta 2026.
- Redacción asistida de borradores de órdenes y respuestas a requerimientos: el adaptador ancla de redacción estatutaria permite generar estructuras de documentos formales que después revisa un profesional.
- Formación de equipos junior en fiscalidad indirecta: sirve como tutor interactivo para explicar conceptos como el crédito fiscal de entrada (ITC), la estructura de tipos o el mecanismo de devoluciones provisionales.
- Investigación jurisprudencial preliminar: permite localizar y resumir sentencias citadas en la model card (Bhandari Scrap Traders, Adani Power, Sanand Properties, Reliance Industries v. SEBI, entre otras) como punto de partida para una búsqueda formal.
- Análisis de impacto normativo: útil para explorar cómo afectan los cambios del Consejo del GST (por ejemplo, la omisión del artículo 69 CGST o el sistema de registro automatizado) a un supuesto concreto.
- Despliegue local en estaciones de trabajo Mac: al estar en formato MLX 8-bit, permite ejecutar el modelo en Apple Silicon sin depender de servicios en la nube, lo que facilita el trabajo con material jurídico sensible en local.
- Prototipado de asistentes legales verticales: sirve como base para experimentar con recuperación aumentada (RAG) sobre corpus normativos propios antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al estar cuantizado a 8 bits y con 11,9 mil millones de parámetros, los pesos ocupan aproximadamente 12 GB; el repositorio completo pesa 13,5 GB. La memoria unificada necesaria para inferencia con contexto moderado se sitúa en torno a 14-16 GB.
- GPU recomendadas: no se documentan. El formato MLX está orientado a Apple Silicon, no a CUDA.
- Cabe en GPU de consumo: no hay información sobre versiones GGUF o CUDA; en su formato actual está pensado para Mac con memoria unificada de 16 GB o superior (M1 Pro en adelante, idealmente M2/M3 Max con 32 GB o más).
- Opciones de despliegue: MLX (librería nativa de Apple). No se documentan variantes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-Vidhi 12B | 11,9 B | no disponible | Derecho y fiscalidad india | Gemma | safetensors MLX 8-bit |
| google/gemma-2-12b-it | 12 B | 8 192 tokens (modelo base) | Propósito general | Gemma | safetensors, GGUF (comunidad) |
| Modelos jurídicos generalistas (p. ej. familia Legal-BERT o similares) | variable | variable | Derecho genérico en inglés | variable | variable |

La comparación con alternativas especializadas en derecho indio no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es la especialización de dominio y el formato MLX 8-bit; no hay datos de rendimiento que permitan cuantificar la mejora.

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia cuantitativa de que el ajuste fino mejore al modelo base en tareas jurídicas.
- La model card no documenta el proceso de entrenamiento (tokens, composición del dataset, método de ajuste), lo que impide evaluar la calidad y cobertura reales.
- Riesgo de alucinación elevado en un dominio donde las citas de sentencias y artículos deben ser exactas; las referencias jurisprudenciales de la model card deben verificarse siempre en fuentes oficiales.
- El modelo solo declara soporte de inglés; no se garantiza un comportamiento fiable en hindi u otras lenguas indias pese al nombre en devanagari.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de cualquier despliegue en producción.
- El formato MLX limita el despliegue a Apple Silicon; no hay pesos GGUF ni safetensors estándar para CUDA documentados en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- No debe usarse como sustituto de asesoramiento jurídico profesional; cualquier salida requiere revisión por un abogado cualificado en la jurisdicción india.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suvir-Misra/Gemma-Vidhi-12B-Indian-Legal
- Modelo base: https://huggingface.co/google/gemma-2-12b-it
- Librería MLX: https://github.com/ml-explore/mlx
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
