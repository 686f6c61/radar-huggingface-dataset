# thomsonreuters/Thomson-1.0-Small

## Resumen

Thomson-1.0-Small es un modelo de lenguaje desarrollado por Thomson Reuters, la multinacional especializada en información legal, financiera y de medios. El nombre sugiere que forma parte de una familia de modelos de la empresa, con una variante "Small" orientada a tareas de menor escala o despliegue ligero. Sin embargo, la información pública disponible en Hugging Face es extremadamente limitada: no se proporciona arquitectura, tamaño, contexto ni capacidades concretas. El modelo se publicó con licencia PolyForm Strict 1.0.0, una licencia de código abierto con restricciones significativas para uso comercial. A fecha de la consulta, el modelo no presenta descargas ni valoraciones, y su model card no incluye detalles técnicos, lo que impide una evaluación objetiva de sus prestaciones. Su relevancia actual es incierta, ya que no se dispone de documentación que permita compararlo con alternativas del mercado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | PolyForm Strict 1.0.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura del modelo (si es un transformer, MoE, SSM u otro tipo), el volumen de datos de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas (RLHF, DPO, etc.). La model card no incluye secciones de arquitectura ni detalles de entrenamiento. Tampoco se han documentado innovaciones técnicas como decodificación especulativa o atención lineal. Dado el perfil de Thomson Reuters, es plausible que el modelo esté orientado a dominios legales o financieros, pero esto es una especulación sin base documental.

## Capacidades

- No se han documentado capacidades específicas del modelo.
- No hay información sobre generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling, function calling ni capacidades de agente.
- No se indican capacidades multilingües.
- No se menciona ningún modo especial (thinking mode, visión, audio, etc.).

## Casos de uso

Dada la ausencia total de documentación técnica, no es posible proponer casos de uso concretos y verificables. Cualquier aplicación práctica sería una suposición sin fundamento. Se recomienda consultar directamente al autor o esperar a que se publique información adicional antes de considerar este modelo para ningún escenario real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco hay comparativas con modelos similares.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. No se conocen la VRAM estimada, las GPU recomendadas ni las opciones de despliegue. No se puede determinar si el modelo cabe en hardware de consumo.

## Comparativa con modelos similares

No disponible. No existe información pública que permita comparar Thomson-1.0-Small con otras alternativas de tamaño o propósito similar. No se conocen modelos comparables dentro de la misma familia ni de otros desarrolladores.

## Limitaciones y advertencias

- La licencia PolyForm Strict 1.0.0 impone restricciones importantes: permite uso interno y modificación, pero prohíbe el uso comercial y la redistribución sin permiso explícito. Esto limita seriamente su adopción en entornos empresariales.
- No se han documentado sesgos conocidos, riesgos de alucinación ni limitaciones de contexto o idioma, simplemente porque no hay información.
- La ausencia de model card técnica y de resultados de evaluación hace que el modelo sea inadecuado para producción sin una investigación adicional exhaustiva.
- No se ha confirmado la disponibilidad de pesos en formatos estándar (safetensors, GGUF, etc.), lo que puede dificultar su integración en herramientas comunes.
- La fecha de creación (agosto de 2026) es posterior a la fecha de esta consulta, lo que sugiere que el modelo podría ser muy reciente o que los metadatos contienen errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Licencia PolyForm Strict 1.0.0: https://polyformproject.org/licenses/strict/1.0.0
