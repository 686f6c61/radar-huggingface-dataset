# sxndypz/legacy-core-1.5

## Resumen

Legacy-core-1.5 es un modelo publicado en Hugging Face por el usuario sxndypz bajo licencia OpenRAIL. La model card asociada no contiene ninguna descripcion tecnica: se reduce a la declaracion de licencia, sin informacion sobre arquitectura, tamano, datos de entrenamiento ni capacidades. El repositorio registra cero descargas y cero likes en el momento de la consulta, y no declara pipeline ni idiomas soportados.

Por tanto, no es posible determinar que problema resuelve ni que innovacion aporta. La unica informacion verificable es el identificador del repositorio, el autor, la licencia y las marcas temporales de creacion y actualizacion (24 de noviembre de 2026), ademas de la etiqueta de region `us`. Todo lo demas queda fuera del alcance de los datos disponibles.

Esta ficha se limita a documentar esos metadatos y a marcar explicitamente como "no disponible" cada especificacion que la model card no cubre. Cualquier uso en produccion requeriria contactar con el autor o inspeccionar directamente los ficheros del repositorio, que no se han podido analizar aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | openrail |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No disponible. La model card no especifica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni ninguna innovacion tecnica asociada (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.).

## Capacidades

- No disponible. La informacion proporcionada no permite confirmar generacion de texto, razonamiento, codigo, matematicas, vision, soporte de tool calling, capacidades de agente, multilingüismo ni ningun modo especial de inferencia.

## Casos de uso

- No disponible. Sin datos sobre arquitectura, tamano, contexto o capacidades, no es posible proponer escenarios de aplicacion realistas y fundamentados. Cualquier caso de uso sugerido seria especulativo y no verificable contra la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del numero de parametros y de la cuantizacion, datos ausentes).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se conoce el formato de pesos ni la arquitectura, lo que impide determinar compatibilidad con estos runners.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La ausencia de datos sobre parametros, contexto, rendimiento y capacidades impide establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no hay informacion sobre datos de entrenamiento ni evaluaciones de sesgo.
- Riesgo de alucinacion: no evaluable sin benchmarks ni descripcion de capacidades.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: la licencia OpenRAIL incluye habitualmente clausulas de uso responsable con restricciones de uso aceptable; conviene revisar el texto completo de la licencia antes de un uso comercial, ya que la model card no detalla condiciones adicionales.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado. No hay evidencia de validacion por parte de la comunidad.
- Trazabilidad: repositorio de autor individual sin documentacion tecnica; no se puede verificar procedencia de datos, pesos ni proceso de entrenamiento.

## Enlaces

- [Hugging Face: sxndypz/legacy-core-1.5](https://huggingface.co/sxndypz/legacy-core-1.5)
