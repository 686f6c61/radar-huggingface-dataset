# Velandris/velandris-license

## Resumen

Velandris License 1.0 no es un modelo de inteligencia artificial, sino una licencia de uso para modelos abiertos publicada por Han Muyang bajo el identificador `Velandris/velandris-license` en Hugging Face. El repositorio contiene el texto legal de la licencia (`LICENSE.md`) y las instrucciones para aplicarla a modelos propios, con el objetivo de ofrecer una alternativa permisiva a licencias como Apache-2.0 o MIT, incorporando obligaciones de atribución, divulgación de modificaciones y una lista explícita de restricciones de uso.

El interés de esta ficha es distinto al de un modelo generativo: no hay pesos, tokenizador, arquitectura ni datos de entrenamiento. Lo relevante es evaluar si las condiciones de la licencia encajan con un proyecto de IA open source, especialmente en lo relativo a uso comercial, redistribución de derivados y restricciones éticas. El repositorio no incluye pipeline, idiomas ni métricas, y en el momento de la consulta registra 0 descargas y 0 likes.

La licencia se presenta como reutilizable por terceros para sus propios modelos y establece como jurisdicción por defecto Hong Kong SAR, además de advertir explícitamente que no constituye asesoramiento legal. Cualquier adopción en producción debería pasar por revisión jurídica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una licencia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el texto de la licencia está en inglés) |
| Licencia | Velandris License 1.0 (`license: other`, `license_name: velandris`) |
| Formato de pesos | no disponible (el repositorio contiene `LICENSE.md` y, opcionalmente, `NOTICE`) |

## Arquitectura y entrenamiento

No aplica: el artefacto no es un modelo entrenado ni contiene parámetros. El repositorio es un documento legal versionado. La licencia permite usar, modificar, fusionar, hacer fine-tuning y redistribuir el modelo, incluido el uso comercial, siempre que se mantenga la licencia y el fichero `NOTICE`, se dé atribución, se divulgue cualquier modificación y no se comercialice un derivado bajo el nombre del modelo original.

Incluye una cláusula de honestidad que prohíbe comercializar un modelo como "honesto" o "factual" tras eliminar deliberadamente su comportamiento de honestidad, y una lista de restricciones de uso: actividades ilegales, armas y malware, acoso y vigilancia, fraude y desinformación, daño a menores y decisiones automatizadas sobre personas sin revisión humana. La jurisdicción por defecto es Hong Kong SAR, configurable en el `NOTICE`.

## Capacidades

- Servir como licencia para modelos propios, con texto completo en `LICENSE.md`.
- Permitir uso comercial, modificación, merging, fine-tuning y redistribución.
- Exigir atribución, conservación de licencia y `NOTICE`, y divulgación de modificaciones.
- Prohibir el uso del nombre del modelo original para derivados.
- Imponer restricciones éticas y de uso (armas, malware, vigilancia, fraude, menores, decisiones automatizadas sin revisión).
- Incluir cláusula de honestidad sobre marketing engañoso.
- Ofrecer plantilla de `NOTICE` con campos de licenciante, atribución, jurisdicción y componentes de terceros.
- Indicar cómo declararla en el YAML de Hugging Face (`license: other`, `license_name: velandris`).

## Casos de uso

- Publicación de un modelo fine-tuneado: el autor copia `LICENSE.md` como `LICENSE`, añade un `NOTICE` con su nombre y jurisdicción, y declara la licencia en el YAML de Hugging Face para redistribuir el derivado con obligaciones claras.
- Integración en un pipeline comercial: un equipo que despliega un modelo bajo Velandris puede incorporarlo a un producto de pago siempre que conserve licencia y `NOTICE` y no use el nombre original del modelo.
- Auditoría de cumplimiento: un responsable legal revisa la lista de restricciones (vigilancia, decisiones automatizadas sobre personas) antes de aprobar un caso de uso en RR. HH. o scoring crediticio.
- Gestión de componentes de terceros: el campo `Third-party components` del `NOTICE` permite documentar dependencias como un modelo base con licencia Apache-2.0.
- Modelos derivados con merging: al fusionar pesos de varios modelos, la obligación de divulgar modificaciones y mantener la licencia facilita la trazabilidad.
- Proyectos de investigación que quieran restricciones éticas explícitas sin adoptar una licencia propietaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica (no hay pesos ni inferencia).
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no aplica.
- Despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Licencia | Uso comercial | Atribución | Restricciones éticas | Copyleft | Jurisdicción por defecto |
|---|---|---|---|---|---|
| Velandris 1.0 | Sí | Sí, más `NOTICE` y divulgación de cambios | Sí (lista explícita y cláusula de honestidad) | No indicado | Hong Kong SAR |
| Apache-2.0 | Sí | Sí, más `NOTICE` | No | No | No especificada |
| MIT | Sí | Sí | No | No | No especificada |
| Llama Community License | Sí, con límites (p. ej. 700 M usuarios/mes) | Sí | Política de uso aceptable | No | California |

## Limitaciones y advertencias

- No es un modelo: no genera texto ni tiene pesos, contexto o benchmarks.
- El repositorio no incluye el texto completo en la información proporcionada; solo un resumen y enlaces.
- La licencia advierte que no constituye asesoramiento legal; requiere revisión jurídica antes de uso comercial.
- La jurisdicción por defecto (Hong Kong SAR) puede no ser adecuada para todos los proyectos; es configurable en el `NOTICE`.
- La lista de restricciones es amplia y su interpretación (p. ej. "decisiones automatizadas sobre personas") puede generar dudas de cumplimiento.
- La cláusula de honestidad es poco habitual y su aplicabilidad práctica no está detallada.
- Sin descargas ni likes registrados: no hay evidencia de adopción.
- Idiomas del documento: únicamente inglés.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Velandris/velandris-license
- Texto completo de la licencia: https://huggingface.co/Velandris/velandris-license/blob/main/LICENSE.md
